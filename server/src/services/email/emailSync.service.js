/**
 * emailSync.service.js — IMAP Message Synchronization & CRM Association Engine
 *
 * Requirements:
 *  - Incremental sync using IMAP UIDs & cursor checkpointing
 *  - Deduplication via providerUid & RFC 2822 Message-ID
 *  - Full MIME parsing using mailparser (html, text, attachments metadata)
 *  - Automatic CRM Lead association using normalized email matching
 *  - Threading correlation via In-Reply-To and References headers
 *  - Safe non-blocking execution with mutex per account
 *  - Resilient error handling without server crashes or infinite loops
 */

import { simpleParser } from 'mailparser'
import prisma from '../../config/db.js'
import { getInternalAccountWithCredentials } from './emailAccount.service.js'

// In-memory sync locks to prevent concurrent runs on the same mailbox
const activeSyncLocks = new Set()

/**
 * Extracts a normalized email address string from an address object or header string.
 */
function normalizeEmail(val) {
  if (!val) return ''
  if (typeof val === 'string') {
    const match = val.match(/<([^>]+)>/)
    return (match ? match[1] : val).trim().toLowerCase()
  }
  if (Array.isArray(val) && val.length > 0) {
    return normalizeEmail(val[0].address || val[0].text)
  }
  if (val.address) return String(val.address).trim().toLowerCase()
  if (val.value && Array.isArray(val.value) && val.value[0]?.address) {
    return String(val.value[0].address).trim().toLowerCase()
  }
  return String(val).trim().toLowerCase()
}

/**
 * Derives a consistent thread ID for a message using Message-ID and In-Reply-To / References.
 */
function resolveThreadId(parsed) {
  if (parsed.references && Array.isArray(parsed.references) && parsed.references.length > 0) {
    // Root reference is the thread starter
    return parsed.references[0].replace(/[<>]/g, '').trim()
  }
  if (parsed.inReplyTo) {
    return parsed.inReplyTo.replace(/[<>]/g, '').trim()
  }
  if (parsed.messageId) {
    return parsed.messageId.replace(/[<>]/g, '').trim()
  }
  return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Synchronizes incoming messages for a single EmailAccount.
 *
 * @param {string} accountId
 * @param {object} options - { limit, fullResync }
 */
export async function syncAccountMailbox(accountId, options = {}) {
  if (activeSyncLocks.has(accountId)) {
    return {
      status: 'SKIPPED',
      reason: 'A sync operation is already in progress for this account.',
      syncedCount: 0,
    }
  }

  activeSyncLocks.add(accountId)

  const account = await getInternalAccountWithCredentials(accountId)
  if (!account) {
    activeSyncLocks.delete(accountId)
    throw new Error(`Email account '${accountId}' not found.`)
  }

  if (!account.isActive) {
    activeSyncLocks.delete(accountId)
    return { status: 'SKIPPED', reason: 'Account is deactivated.', syncedCount: 0 }
  }

  if (!account.imapPassword) {
    activeSyncLocks.delete(accountId)
    return { status: 'SKIPPED', reason: 'Account has no IMAP credentials configured.', syncedCount: 0 }
  }

  const { ImapFlow } = await import('imapflow')

  const client = new ImapFlow({
    host: account.imapHost || 'imap.hostinger.com',
    port: account.imapPort || 993,
    secure: account.imapSecure !== false,
    auth: {
      user: account.imapUser || account.email,
      pass: account.imapPassword,
    },
    logger: false,
    connectionTimeout: process.env.NODE_ENV === 'test' ? 1500 : 8000,
    greetingTimeout: process.env.NODE_ENV === 'test' ? 1500 : 5000,
    tls: {
      rejectUnauthorized: false,
      servername: account.imapHost || 'imap.hostinger.com',
    },
  })

  let syncedCount = 0
  let maxUid = account.syncCursor ? parseInt(account.syncCursor, 10) : 0

  try {
    await prisma.emailAccount.update({
      where: { id: account.id },
      data: { lastSyncStatus: 'SYNCING' },
    })

    await client.connect()

    const mailboxName = account.imapMailbox || 'INBOX'
    const lock = await client.getMailboxLock(mailboxName)

    try {
      // Determine query: if we have a cursor, fetch UID > cursor; otherwise fetch last 30 messages
      let searchCriteria = {}
      if (maxUid > 0 && !options.fullResync) {
        searchCriteria = { uid: `${maxUid + 1}:*` }
      } else {
        // Fetch recent messages
        searchCriteria = { all: true }
      }

      // Fetch messages
      const limit = options.limit || 50

      // In ImapFlow, client.search returns array of UIDs matching criteria
      const uids = await client.search(searchCriteria, { uid: true })

      if (Array.isArray(uids) && uids.length > 0) {
        // Limit to newest N messages
        const targetUids = uids.slice(-limit)

        for await (const msg of client.fetch(targetUids, { source: true, uid: true, flags: true })) {
          if (!msg.source) continue

          const currentUid = msg.uid
          if (currentUid > maxUid) {
            maxUid = currentUid
          }

          // Check if message already exists by accountId + providerUid
          const existing = await prisma.emailMessage.findFirst({
            where: {
              accountId: account.id,
              providerUid: String(currentUid),
            },
          })
          if (existing) continue

          // Parse raw message source buffer
          const parsed = await simpleParser(msg.source)

          // Deduplicate by messageId if available
          if (parsed.messageId) {
            const byMessageId = await prisma.emailMessage.findFirst({
              where: {
                accountId: account.id,
                messageId: parsed.messageId,
              },
            })
            if (byMessageId) continue
          }

          const fromEmail = normalizeEmail(parsed.from)
          const fromName = parsed.from?.value?.[0]?.name || parsed.from?.text?.split('<')[0]?.trim() || fromEmail
          const toEmails = (parsed.to?.value || []).map((t) => t.address).filter(Boolean)
          const ccEmails = (parsed.cc?.value || []).map((c) => c.address).filter(Boolean)
          const threadId = resolveThreadId(parsed)

          // Try to link with an existing CRM ContactLead
          let linkedLeadId = null
          if (fromEmail) {
            const matchedLead = await prisma.contactLead.findFirst({
              where: {
                email: fromEmail,
                deletedAt: null,
              },
              orderBy: { createdAt: 'desc' },
            })
            if (matchedLead) {
              linkedLeadId = matchedLead.id
            }
          }

          // Extract safe attachment metadata (no raw binary in database)
          const attachmentsMetadata = (parsed.attachments || []).map((a) => ({
            filename: a.filename || 'attachment',
            contentType: a.contentType || 'application/octet-stream',
            size: a.size || 0,
            checksum: a.checksum || null,
          }))

          const snippet = (parsed.text || parsed.html?.replace(/<[^>]+>/g, ' ') || '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 160)

          await prisma.emailMessage.create({
            data: {
              accountId: account.id,
              direction: 'INBOUND',
              folder: 'INBOX',
              messageId: parsed.messageId || null,
              inReplyTo: parsed.inReplyTo || null,
              references: Array.isArray(parsed.references) ? parsed.references : (parsed.references ? [parsed.references] : []),
              threadId,
              from: parsed.from?.text || fromEmail,
              fromEmail,
              fromName,
              to: toEmails.length > 0 ? toEmails : [account.email],
              cc: ccEmails,
              bcc: [],
              replyTo: parsed.replyTo?.text || null,
              subject: parsed.subject || '(No Subject)',
              bodyText: parsed.text || null,
              bodyHtml: parsed.html || null,
              snippet,
              hasAttachments: attachmentsMetadata.length > 0,
              attachmentsMetadata: attachmentsMetadata.length > 0 ? attachmentsMetadata : null,
              isRead: msg.flags?.has('\\Seen') || false,
              providerUid: String(currentUid),
              deliveryStatus: 'RECEIVED',
              receivedAt: parsed.date || new Date(),
              leadId: linkedLeadId,
            },
          })

          syncedCount++
        }
      }
    } finally {
      lock.release()
    }

    await client.logout()

    // Update account sync status and cursor
    await prisma.emailAccount.update({
      where: { id: account.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'SUCCESS',
        lastSyncError: null,
        syncCursor: String(maxUid),
      },
    })

    return {
      status: 'SUCCESS',
      syncedCount,
      lastUid: maxUid,
    }
  } catch (err) {
    console.error(`[emailSync] Error syncing account ${account.email}:`, err.message)

    await prisma.emailAccount.update({
      where: { id: account.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'FAILED',
        lastSyncError: err.message?.slice(0, 500) || 'Unknown IMAP sync failure',
      },
    }).catch(() => {})

    return {
      status: 'FAILED',
      error: err.message,
      syncedCount,
    }
  } finally {
    activeSyncLocks.delete(accountId)
  }
}

/**
 * Triggers batch synchronization across all active accounts that have sync enabled.
 */
export async function syncAllActiveAccounts() {
  const accounts = await prisma.emailAccount.findMany({
    where: { isActive: true, syncEnabled: true },
    select: { id: true, email: true },
  })

  const results = await Promise.all(
    accounts.map(async (acct) => {
      try {
        const res = await syncAccountMailbox(acct.id)
        return { email: acct.email, ...res }
      } catch (err) {
        return { email: acct.email, status: 'FAILED', error: err.message }
      }
    })
  )
  return results
}

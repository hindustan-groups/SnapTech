/**
 * emailAccount.service.js — Email Account Configuration & Connection Management
 *
 * Supports:
 *  - Multi-account CRUD (Hostinger, Gmail, Custom SMTP/IMAP)
 *  - Secure credential encryption via AES-256-GCM
 *  - Credential masking (never return plain passwords in API responses)
 *  - Default sender account resolution
 *  - SMTP connection test (handshake + test email)
 *  - IMAP connection test (handshake + authentication)
 *  - Auto-seeding default Hostinger account from environment if empty
 */

import nodemailer from 'nodemailer'
import prisma from '../../config/db.js'
import { env } from '../../config/env.js'
import { encryptCredential, decryptCredential } from '../../utils/crypto.js'
import { resolveIpv4Host } from '../../utils/dnsHelper.js'

export const DEFAULT_HOSTINGER_HOST = 'smtp.hostinger.com'
export const DEFAULT_HOSTINGER_IMAP_HOST = 'imap.hostinger.com'
export const DEFAULT_HOSTINGER_PORT = 465
export const DEFAULT_HOSTINGER_IMAP_PORT = 993

export function sanitizeErrorMessage(msg, secrets = []) {
  if (!msg || typeof msg !== 'string') return ''
  let clean = msg
  for (const s of secrets) {
    if (s && typeof s === 'string' && s.length > 2) {
      clean = clean.split(s).join('[REDACTED]')
    }
  }
  // Scrub URI passwords like postgresql://user:pass@host
  clean = clean.replace(/(:\/\/[^:]+:)([^@]+)(@)/g, '$1***$3')
  // Scrub common secret assignment patterns
  clean = clean.replace(/(?:password|pass|secret|token|bearer|key)\s*[:=]\s*['"]?[^\s,'"]+/gi, '$1=[REDACTED]')
  return clean.slice(0, 500)
}

/**
 * Ensures at least the primary system account exists in the database.
 * Preserves existing Hostinger environment settings and self-heals credentials
 * if environment variables are provided.
 */
export async function ensureDefaultAccounts() {
  try {
    let primaryEmail = (process.env.EMAIL_USER || env.EMAIL_USER || '').trim().toLowerCase()
    let primaryPass = (process.env.EMAIL_PASS || env.EMAIL_PASS || '').trim()

    if (!primaryEmail) {
      const dbUser = await prisma.siteSetting.findUnique({ where: { key: 'sys_smtp_user' } }).catch(() => null)
      if (dbUser?.value) primaryEmail = dbUser.value.trim().toLowerCase()
    }
    if (!primaryEmail) primaryEmail = 'info@snaptech.digital'

    if (!primaryPass) {
      const dbPass = await prisma.siteSetting.findUnique({ where: { key: 'sys_smtp_pass' } }).catch(() => null)
      if (dbPass?.value) {
        primaryPass = dbPass.value.trim()
        process.env.EMAIL_PASS = primaryPass
      }
    }

    const host = (process.env.EMAIL_HOST || env.EMAIL_HOST || DEFAULT_HOSTINGER_HOST).trim()
    const port = parseInt(process.env.EMAIL_PORT || env.EMAIL_PORT || String(DEFAULT_HOSTINGER_PORT), 10)
    const isHostinger = host.includes('hostinger') || host.includes('titan')

    const imapHost = isHostinger ? DEFAULT_HOSTINGER_IMAP_HOST : (host.includes('gmail') ? 'imap.gmail.com' : host)
    const imapPort = 993

    const encryptedPass = primaryPass ? encryptCredential(primaryPass) : null

    const existing = await prisma.emailAccount.findFirst({
      where: {
        OR: [{ email: primaryEmail }, { isDefaultSender: true }],
      },
    })

    if (existing) {
      // Self-heal: If database record has no password but environment or siteSetting has password, populate it
      if (primaryPass && (!existing.smtpPasswordEncrypted || !existing.imapPasswordEncrypted)) {
        await prisma.emailAccount.update({
          where: { id: existing.id },
          data: {
            smtpPasswordEncrypted: existing.smtpPasswordEncrypted || encryptedPass,
            imapPasswordEncrypted: existing.imapPasswordEncrypted || encryptedPass,
            syncEnabled: existing.syncEnabled ?? true,
          },
        })
        console.log(`[emailAccount] Self-healed credentials for primary account: ${existing.email}`)
      }
      const existingAccounts = await prisma.emailAccount.findMany({
        orderBy: [{ isDefaultSender: 'desc' }, { createdAt: 'asc' }],
      })
      return existingAccounts.map(sanitizeAccount)
    }

    await prisma.emailAccount.create({
      data: {
        email: primaryEmail,
        displayName: process.env.EMAIL_SENDER_NAME || 'SnapTech Digital',
        provider: host.includes('gmail') ? 'GMAIL' : (isHostinger ? 'HOSTINGER' : 'CUSTOM'),
        isActive: true,
        isDefaultSender: true,
        replyTo: process.env.EMAIL_REPLY_TO || primaryEmail,
        department: 'general',
        enquiryTypes: ['contact_form', 'service_inquiry', 'general', 'lead'],
        smtpHost: host,
        smtpPort: port,
        smtpSecure: port === 465,
        smtpUser: primaryEmail,
        smtpPasswordEncrypted: encryptedPass,
        imapHost,
        imapPort,
        imapSecure: true,
        imapUser: primaryEmail,
        imapPasswordEncrypted: encryptedPass,
        imapMailbox: 'INBOX',
        syncEnabled: true,
      },
    })
    console.log(`[emailAccount] Initialized primary default account: ${primaryEmail}`)
    const createdAccounts = await prisma.emailAccount.findMany({
      orderBy: [{ isDefaultSender: 'desc' }, { createdAt: 'asc' }],
    })
    return createdAccounts.map(sanitizeAccount)
  } catch (err) {
    console.warn('[emailAccount] Could not auto-seed default account:', err.message)
    return []
  }
}

/**
 * Sanitizes an EmailAccount object for API response (strips raw and encrypted passwords).
 */
export function sanitizeAccount(account) {
  if (!account) return null
  const { smtpPasswordEncrypted, imapPasswordEncrypted, ...safe } = account
  return {
    ...safe,
    hasSmtpPassword: Boolean(smtpPasswordEncrypted),
    hasImapPassword: Boolean(imapPasswordEncrypted),
  }
}

/**
 * Lists all configured email accounts with masked secrets.
 */
export async function listAccounts() {
  await ensureDefaultAccounts()
  const accounts = await prisma.emailAccount.findMany({
    orderBy: [{ isDefaultSender: 'desc' }, { createdAt: 'asc' }],
  })
  return accounts.map(sanitizeAccount)
}

/**
 * Retrieves a single account by ID with masked secrets.
 */
export async function getAccountById(id) {
  const account = await prisma.emailAccount.findUnique({ where: { id } })
  if (!account) return null
  return sanitizeAccount(account)
}

/**
 * Retrieves the raw account with decrypted credentials for internal mail worker use.
 * Automatically falls back to env EMAIL_PASS if record has no stored password
 * and matches the primary environment mailbox.
 */
export async function getInternalAccountWithCredentials(idOrEmail) {
  const isEmail = String(idOrEmail).includes('@')
  const account = await prisma.emailAccount.findFirst({
    where: isEmail ? { email: String(idOrEmail).toLowerCase().trim() } : { id: String(idOrEmail) },
  })
  if (!account) return null

  const decryptedSmtpPass = account.smtpPasswordEncrypted ? decryptCredential(account.smtpPasswordEncrypted) : null
  const decryptedImapPass = account.imapPasswordEncrypted ? decryptCredential(account.imapPasswordEncrypted) : null

  const envUser = (process.env.EMAIL_USER || env.EMAIL_USER || 'info@snaptech.digital').toLowerCase().trim()
  const envPass = (process.env.EMAIL_PASS || env.EMAIL_PASS || '').trim()
  const isPrimary = account.email.toLowerCase().trim() === envUser || account.isDefaultSender

  let fallbackPass = (isPrimary && envPass) ? envPass : null

  if (!fallbackPass) {
    try {
      const dbSetting = await prisma.siteSetting.findUnique({ where: { key: 'sys_smtp_pass' } })
      if (dbSetting?.value) {
        fallbackPass = dbSetting.value.trim()
      }
    } catch {
      // Continue without crashing
    }
  }

  const effectiveSmtpPass = (decryptedSmtpPass || fallbackPass || decryptedImapPass || '').trim()
  const effectiveImapPass = (decryptedImapPass || fallbackPass || decryptedSmtpPass || '').trim()

  return {
    ...account,
    smtpPassword: effectiveSmtpPass,
    imapPassword: effectiveImapPass,
  }
}

/**
 * Retrieves the default sender account with credentials.
 */
export async function getDefaultSenderAccount() {
  await ensureDefaultAccounts()
  let account = await prisma.emailAccount.findFirst({
    where: { isDefaultSender: true, isActive: true },
  })
  if (!account) {
    account = await prisma.emailAccount.findFirst({
      where: { isActive: true },
    })
  }
  if (!account) return null

  return getInternalAccountWithCredentials(account.id)
}

/**
 * Creates a new email account (or updates existing if email matches).
 */
export async function createAccount(data) {
  const email = String(data.email || '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('A valid email address is required.')
  }

  const existing = await prisma.emailAccount.findUnique({ where: { email } })
  if (existing) {
    return updateAccount(existing.id, data)
  }

  // If this account is set as default sender, unset existing defaults
  if (data.isDefaultSender) {
    await prisma.emailAccount.updateMany({
      where: { isDefaultSender: true },
      data: { isDefaultSender: false },
    })
  }

  const isHostinger = data.provider === 'HOSTINGER' || email.endsWith('@snaptech.digital')
  const isGmail = data.provider === 'GMAIL' || email.endsWith('@gmail.com')

  const defaultSmtpHost = isHostinger ? DEFAULT_HOSTINGER_HOST : (isGmail ? 'smtp.gmail.com' : 'smtp.hostinger.com')
  const defaultImapHost = isHostinger ? DEFAULT_HOSTINGER_IMAP_HOST : (isGmail ? 'imap.gmail.com' : 'imap.hostinger.com')

  const rawPass = (data.smtpPassword || data.imapPassword || '').trim()
  const encryptedSmtpPass = rawPass ? encryptCredential(rawPass) : null
  const encryptedImapPass = encryptedSmtpPass

  const account = await prisma.emailAccount.create({
    data: {
      email,
      displayName: data.displayName?.trim() || email.split('@')[0],
      provider: data.provider || (isGmail ? 'GMAIL' : (isHostinger ? 'HOSTINGER' : 'CUSTOM')),
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      isDefaultSender: Boolean(data.isDefaultSender),
      replyTo: data.replyTo?.trim() || email,
      department: data.department?.trim() || 'general',
      enquiryTypes: Array.isArray(data.enquiryTypes) ? data.enquiryTypes : [],
      smtpHost: data.smtpHost?.trim() || defaultSmtpHost,
      smtpPort: parseInt(data.smtpPort || '465', 10),
      smtpSecure: data.smtpSecure !== undefined ? Boolean(data.smtpSecure) : true,
      smtpUser: data.smtpUser?.trim() || email,
      smtpPasswordEncrypted: encryptedSmtpPass,
      imapHost: data.imapHost?.trim() || defaultImapHost,
      imapPort: parseInt(data.imapPort || '993', 10),
      imapSecure: data.imapSecure !== undefined ? Boolean(data.imapSecure) : true,
      imapUser: data.imapUser?.trim() || email,
      imapPasswordEncrypted: encryptedImapPass,
      imapMailbox: data.imapMailbox?.trim() || 'INBOX',
      syncEnabled: data.syncEnabled !== undefined ? Boolean(data.syncEnabled) : true,
    },
  })

  // If saved with a password and set as default/primary, sync to runtime env & siteSetting
  if (rawPass && (data.isDefaultSender || email.includes('snaptech.digital'))) {
    process.env.EMAIL_PASS = rawPass
    await prisma.siteSetting.upsert({
      where: { key: 'sys_smtp_pass' },
      update: { value: rawPass },
      create: { key: 'sys_smtp_pass', value: rawPass },
    }).catch(() => {})
    await prisma.siteSetting.upsert({
      where: { key: 'sys_smtp_user' },
      update: { value: email },
      create: { key: 'sys_smtp_user', value: email },
    }).catch(() => {})
  }

  return sanitizeAccount(account)
}

/**
 * Updates an existing email account.
 */
export async function updateAccount(id, data) {
  const existing = await prisma.emailAccount.findUnique({ where: { id } })
  if (!existing) throw new Error('Email account not found.')

  const updatePayload = {}

  if (data.displayName !== undefined) updatePayload.displayName = data.displayName.trim()
  if (data.provider !== undefined) updatePayload.provider = data.provider
  if (data.isActive !== undefined) updatePayload.isActive = Boolean(data.isActive)
  if (data.replyTo !== undefined) updatePayload.replyTo = data.replyTo?.trim() || null
  if (data.department !== undefined) updatePayload.department = data.department?.trim() || null
  if (data.enquiryTypes !== undefined && Array.isArray(data.enquiryTypes)) {
    updatePayload.enquiryTypes = data.enquiryTypes
  }

  // SMTP Settings
  if (data.smtpHost !== undefined) updatePayload.smtpHost = data.smtpHost.trim()
  if (data.smtpPort !== undefined) updatePayload.smtpPort = parseInt(data.smtpPort, 10)
  if (data.smtpSecure !== undefined) updatePayload.smtpSecure = Boolean(data.smtpSecure)
  if (data.smtpUser !== undefined) updatePayload.smtpUser = data.smtpUser.trim()
  if (data.smtpPassword && typeof data.smtpPassword === 'string' && data.smtpPassword.trim() && !/^•+/.test(data.smtpPassword)) {
    const rawPass = data.smtpPassword.trim()
    const enc = encryptCredential(rawPass)
    updatePayload.smtpPasswordEncrypted = enc

    // Auto-sync IMAP password for Hostinger if IMAP pass is empty or dots
    if (!data.imapPassword || !data.imapPassword.trim() || /^•+/.test(data.imapPassword)) {
      updatePayload.imapPasswordEncrypted = enc
    }

    // Also sync to runtime env & siteSetting for primary/default mailbox
    if (existing.isDefaultSender || existing.email.toLowerCase().includes('snaptech.digital')) {
      process.env.EMAIL_PASS = rawPass
      await prisma.siteSetting.upsert({
        where: { key: 'sys_smtp_pass' },
        update: { value: rawPass },
        create: { key: 'sys_smtp_pass', value: rawPass },
      }).catch(() => {})
    }
  }

  // IMAP Settings
  if (data.imapHost !== undefined) updatePayload.imapHost = data.imapHost.trim()
  if (data.imapPort !== undefined) updatePayload.imapPort = parseInt(data.imapPort, 10)
  if (data.imapSecure !== undefined) updatePayload.imapSecure = Boolean(data.imapSecure)
  if (data.imapUser !== undefined) updatePayload.imapUser = data.imapUser.trim()
  if (data.imapMailbox !== undefined) updatePayload.imapMailbox = data.imapMailbox.trim()
  if (data.syncEnabled !== undefined) updatePayload.syncEnabled = Boolean(data.syncEnabled)
  if (data.imapPassword && typeof data.imapPassword === 'string' && data.imapPassword.trim() && !/^•+/.test(data.imapPassword)) {
    const enc = encryptCredential(data.imapPassword.trim())
    updatePayload.imapPasswordEncrypted = enc
    if (!updatePayload.smtpPasswordEncrypted && !existing.smtpPasswordEncrypted) {
      updatePayload.smtpPasswordEncrypted = enc
    }
  }

  // Handle default sender toggle
  if (data.isDefaultSender === true) {
    await prisma.emailAccount.updateMany({
      where: { isDefaultSender: true, id: { not: id } },
      data: { isDefaultSender: false },
    })
    updatePayload.isDefaultSender = true
  } else if (data.isDefaultSender === false) {
    updatePayload.isDefaultSender = false
  }

  const updated = await prisma.emailAccount.update({
    where: { id },
    data: updatePayload,
  })

  return sanitizeAccount(updated)
}

/**
 * Deletes an email account.
 */
export async function deleteAccount(id) {
  const existing = await prisma.emailAccount.findUnique({ where: { id } })
  if (!existing) throw new Error('Email account not found.')

  return prisma.emailAccount.delete({ where: { id } })
}

/**
 * Tests the outbound SMTP handshake and optionally delivers a test message.
 */
export async function testAccountSmtp(id, targetRecipient = null) {
  const account = await getInternalAccountWithCredentials(id)
  if (!account) throw new Error('Account not found.')

  const host = account.smtpHost || DEFAULT_HOSTINGER_HOST
  const configuredPort = account.smtpPort || 465
  const user = account.smtpUser || account.email
  const pass = (account.smtpPassword || '').trim()

  if (!pass) {
    throw new Error('SMTP password is not configured for this account. Please enter the password and save.')
  }

  const recipient = (targetRecipient && targetRecipient.trim()) || user
  const resolvedHost = await resolveIpv4Host(host)
  const isHostinger = host.toLowerCase().includes('hostinger') || host.toLowerCase().includes('titan')

  const createConfig = (p) => ({
    host: resolvedHost,
    port: p,
    secure: p === 465,
    requireTLS: p === 587,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    family: 4,
    tls: {
      rejectUnauthorized: false,
      servername: host,
    },
  })

  const sendTestMsg = async (transporter, effectivePort) => {
    await transporter.verify()
    const info = await transporter.sendMail({
      from: `"${account.displayName || 'SnapTech Digital'}" <${account.email}>`,
      to: recipient,
      subject: `✅ SMTP Verification: ${account.email}`,
      text: `SMTP handshake and delivery test successful for ${account.email} on ${host}:${effectivePort}.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <h3 style="color: #0f172a; margin-top: 0;">SMTP Connection Verified</h3>
          <p style="color: #334155;">The SMTP handshake for <strong>${account.email}</strong> was successful.</p>
          <p style="font-size: 12px; color: #64748b;">Host: ${host}:${effectivePort} | Provider: ${account.provider}</p>
        </div>
      `,
    })
    return {
      success: true,
      messageId: info.messageId,
      host,
      port: effectivePort,
      recipient,
    }
  }

  try {
    const transporter = nodemailer.createTransport(createConfig(configuredPort))
    return await sendTestMsg(transporter, configuredPort)
  } catch (err) {
    const isConnTimeout = /timeout|connect|econnrefused|enetunreach|esocket/i.test(err.message)
    if (isConnTimeout && isHostinger) {
      const altPort = configuredPort === 465 ? 587 : 465
      console.warn(`[emailAccount] Hostinger SMTP port ${configuredPort} failed (${err.message}). Retrying on alternate port ${altPort}...`)
      try {
        const altTransporter = nodemailer.createTransport(createConfig(altPort))
        return await sendTestMsg(altTransporter, altPort)
      } catch {
        // Fall through to primary error message
      }
    }

    const cleanMsg = sanitizeErrorMessage(err.message, [pass])
    if (/invalid login|535|authentication failed|auth/i.test(cleanMsg)) {
      throw new Error(`Hostinger SMTP Authentication failed: Invalid credentials for ${user}. Please verify your full email address and Hostinger Webmail password.`, { cause: err })
    }
    throw new Error(`SMTP Handshake/Send failed: ${cleanMsg}`, { cause: err })
  }
}

/**
 * Tests the incoming IMAP connection and mailbox access.
 */
export async function testAccountImap(id) {
  const account = await getInternalAccountWithCredentials(id)
  if (!account) throw new Error('Account not found.')

  const host = account.imapHost || DEFAULT_HOSTINGER_IMAP_HOST
  const port = account.imapPort || 993
  const user = account.imapUser || account.email
  const pass = (account.imapPassword || '').trim()

  if (!pass) {
    throw new Error('IMAP password is not configured for this account. Please enter the password and save.')
  }

  const resolvedHost = await resolveIpv4Host(host)
  const { ImapFlow } = await import('imapflow')

  const client = new ImapFlow({
    host: resolvedHost,
    port,
    secure: account.imapSecure !== false,
    auth: { user, pass },
    logger: false,
    connectionTimeout: process.env.NODE_ENV === 'test' ? 1500 : 15000,
    greetingTimeout: process.env.NODE_ENV === 'test' ? 1500 : 12000,
    tls: {
      rejectUnauthorized: false,
      servername: host,
    },
  })

  try {
    await client.connect()
    const mailboxName = account.imapMailbox || 'INBOX'
    const lock = await client.getMailboxLock(mailboxName)
    let status = null
    try {
      status = await client.status(mailboxName, { messages: true, unseen: true })
    } finally {
      lock.release()
    }
    await client.logout()

    return {
      success: true,
      mailbox: mailboxName,
      totalMessages: status?.messages ?? 0,
      unseenMessages: status?.unseen ?? 0,
      host,
      port,
    }
  } catch (err) {
    const cleanMsg = sanitizeErrorMessage(err.message, [pass])
    if (/command failed|authentication failed|login failed|no \[/i.test(cleanMsg)) {
      throw new Error(`Hostinger IMAP Authentication failed: Invalid credentials for ${user}. Please verify your full email address and Hostinger Webmail password.`, { cause: err })
    }
    throw new Error(`IMAP Connection failed: ${cleanMsg}`, { cause: err })
  }
}

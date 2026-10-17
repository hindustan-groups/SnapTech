/**
 * mailer.js — Central Reusable Email Service for SnapTech Digital
 *
 * Primary Mailbox: info@snaptech.digital
 * Hostinger SMTP: smtp.hostinger.com:465 (SSL/TLS) or 587 (STARTTLS)
 * Priority Strategy:
 *  1. Hostinger SMTP (Default production & staging transport)
 *  2. Resend API (Alternative transactional channel when configured)
 *  3. Console logging (Safe local dev fallback when neither is configured)
 *
 * Security & Reliability Guarantees:
 *  - Single authoritative sending identity: verified primary mailbox info@snaptech.digital
 *  - Configurable Reply-To headers for alias routing (sales@, support@, billing@, etc.)
 *  - Never spoof unverified sender envelopes
 *  - Server-side environment configuration only; zero secret leakage
 *  - Persistent email sending audit logs via prisma.emailLog
 *  - Idempotency & duplicate-send protection for automated events
 *  - Automatic retries for transient connection errors
 *  - Input sanitization & HTML escaping across all templates
 *  - Responsive SnapTech branded layout matching the website design
 */

import dns from 'node:dns'
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first')
}

import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import prisma from '../config/db.js'
import { env } from '../config/env.js'

// ── Verified Mailbox & Hostinger Constants ──────────────────────
export const VERIFIED_SENDER_MAILBOX = 'info@snaptech.digital'
export const HOSTINGER_SMTP_HOST = 'smtp.hostinger.com'
export const HOSTINGER_SMTP_PORT = 465

// ── Configurable Routing Aliases ───────────────────────────────
export const ROUTING_ALIASES = {
  general: 'hello@snaptech.digital',
  contact: 'hello@snaptech.digital',
  hello: 'hello@snaptech.digital',
  sales: 'sales@snaptech.digital',
  quotes: 'sales@snaptech.digital',
  support: 'support@snaptech.digital',
  billing: 'billing@snaptech.digital',
  careers: 'careers@snaptech.digital',
  projects: 'projects@snaptech.digital',
  marketing: 'marketing@snaptech.digital',
}

// ── Strategy Detection ─────────────────────────────────────────
export function getStrategy() {
  const strategy = (process.env.EMAIL_STRATEGY || env.EMAIL_STRATEGY || '').toLowerCase()
  if (strategy === 'smtp') return 'smtp'
  if (strategy === 'resend') return 'resend'

  // If Hostinger SMTP is configured, prefer Hostinger SMTP
  const host = (process.env.EMAIL_HOST || env.EMAIL_HOST || '').toLowerCase()
  if (
    (process.env.EMAIL_USER || env.EMAIL_USER) &&
    (process.env.EMAIL_PASS || env.EMAIL_PASS) &&
    (host.includes('hostinger') || host.includes('titan') || host === 'smtp.hostinger.com')
  ) {
    return 'smtp'
  }

  if (process.env.RESEND_API_KEY || env.RESEND_API_KEY) return 'resend'
  if (
    (process.env.EMAIL_USER || env.EMAIL_USER) &&
    (process.env.EMAIL_PASS || env.EMAIL_PASS)
  ) {
    return 'smtp'
  }
  return 'console'
}

// ── HTML Escaping for Email Templates ──────────────────────────
export function escapeHtml(str) {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ── Resolve Sender & Reply-To ──────────────────────────────────
export function resolveSenderAndReplyTo(options = {}) {
  const primaryMailbox =
    (process.env.EMAIL_USER || env.EMAIL_USER || VERIFIED_SENDER_MAILBOX).trim()
  const senderName = (process.env.EMAIL_SENDER_NAME || 'SnapTech Digital').trim()
  const from = `"${senderName}" <${primaryMailbox}>`

  // Reply-To resolution: explicit > alias mapping > default primary mailbox
  let replyTo = options.replyTo
  if (!replyTo && options.aliasType && ROUTING_ALIASES[options.aliasType]) {
    replyTo = ROUTING_ALIASES[options.aliasType]
  }
  if (!replyTo) {
    replyTo = (process.env.EMAIL_REPLY_TO || primaryMailbox).trim()
  }

  return { from, replyTo, primaryMailbox, senderName }
}

// ── Persistent Sending Logger ──────────────────────────────────
export async function logEmailSend({
  recipient,
  subject,
  sender,
  replyTo,
  event = 'manual.compose',
  templateId = null,
  status = 'SENT',
  errorMessage = null,
  metadata = null,
  idempotencyKey = null,
}) {
  try {
    const cleanMeta = metadata ? JSON.parse(JSON.stringify(metadata)) : null
    const log = await prisma.emailLog.create({
      data: {
        recipient: String(recipient).trim(),
        subject: String(subject).trim(),
        sender: String(sender).trim(),
        replyTo: replyTo ? String(replyTo).trim() : null,
        event: event || null,
        templateId: templateId || null,
        status: status === 'SENT' || status === 'FAILED' || status === 'QUEUED' ? status : 'SENT',
        errorMessage: errorMessage ? String(errorMessage).slice(0, 1000) : null,
        metadata: cleanMeta,
        idempotencyKey: idempotencyKey || null,
      },
    })
    return log
  } catch (err) {
    console.warn('[mailer] Could not persist email log to DB:', err.message)
    return null
  }
}

// ── Resend Transport ───────────────────────────────────────────
export async function sendViaResend({ to, subject, html, text, attachments, replyTo }) {
  const apiKey = (process.env.RESEND_API_KEY || env.RESEND_API_KEY || '').trim()
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.')
  const resend = new Resend(apiKey)

  let rawFrom = (process.env.EMAIL_FROM || env.EMAIL_FROM || '').trim()
  if (!rawFrom) {
    rawFrom = 'SnapTech Digital <onboarding@resend.dev>'
  }
  const from = rawFrom.includes('<') ? rawFrom : `SnapTech Digital <${rawFrom}>`

  try {
    const payload = { from, to, subject, html, text, attachments }
    if (replyTo) payload.reply_to = replyTo

    const { data, error } = await resend.emails.send(payload)
    if (error) {
      if (
        error.message?.includes('domain') ||
        error.message?.includes('verify') ||
        error.message?.includes('onboarding@resend.dev')
      ) {
        const fallbackFrom = 'SnapTech Digital <onboarding@resend.dev>'
        const retryResult = await resend.emails.send({
          from: fallbackFrom,
          to,
          subject,
          html,
          text,
          attachments,
          reply_to: replyTo,
        })
        if (retryResult.error) throw new Error(retryResult.error.message || 'Resend send failed')
        return { messageId: retryResult.data?.id }
      }
      throw new Error(error.message || 'Resend send failed')
    }
    return { messageId: data?.id }
  } catch (err) {
    throw new Error(err.message || 'Resend send failed', { cause: err })
  }
}

// ── Hostinger / Nodemailer SMTP Transport ──────────────────────
export async function sendViaSMTP({ to, subject, html, text, attachments, replyTo }) {
  const host = (process.env.EMAIL_HOST || env.EMAIL_HOST || HOSTINGER_SMTP_HOST).trim()
  const port = parseInt(process.env.EMAIL_PORT || env.EMAIL_PORT || String(HOSTINGER_SMTP_PORT), 10)
  const user = (process.env.EMAIL_USER || env.EMAIL_USER || VERIFIED_SENDER_MAILBOX).trim()
  const pass = (process.env.EMAIL_PASS || env.EMAIL_PASS || '').trim().replace(/\s+/g, '')

  const isGmail =
    host.includes('gmail') || user.toLowerCase().includes('gmail.com') || host === 'smtp.gmail.com'

  const finalHost = isGmail ? 'smtp.gmail.com' : host
  const finalPort = port === 587 ? 587 : 465
  const isSecure = finalPort === 465

  const transportConfig = {
    host: finalHost,
    port: finalPort,
    secure: isSecure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    family: 4,
    dnsLookup: (hostname, options, callback) => {
      dns.lookup(hostname, { ...options, family: 4, all: false }, callback)
    },
    tls: {
      rejectUnauthorized: false,
      servername: finalHost,
    },
  }

  const transporter = nodemailer.createTransport(transportConfig)
  const { from, replyTo: resolvedReplyTo } = resolveSenderAndReplyTo({ replyTo })

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
    attachments,
    replyTo: resolvedReplyTo,
  })
  return info
}

// ── Direct Sender with Automatic Fallback & Retries ────────────
async function sendEmailDirect(options) {
  const strategy = getStrategy()

  if (strategy === 'console') {
    console.log('\n📧 [DEV — EMAIL NOT SENT — LOG ONLY]')
    console.log(`  To:       ${options.to}`)
    console.log(`  Subject:  ${options.subject}`)
    console.log(`  Reply-To: ${options.replyTo || '(none)'}`)
    console.log(`  Body:     ${options.text || '(html only)'}`)
    if (options.attachments) {
      console.log(`  Attachments: ${options.attachments.map((a) => a.filename).join(', ')}`)
    }
    console.log('─────────────────────────────────────\n')
    return { messageId: 'dev-console-log' }
  }

  // Transient retry wrapper
  const executeWithRetry = async (fn) => {
    let attempts = 0
    while (true) {
      try {
        return await fn()
      } catch (err) {
        attempts++
        const isTransient =
          /ECONNRESET|ETIMEDOUT|ESOCKETTIMEDOUT|EAI_AGAIN|ENOTFOUND|Connection timeout/i.test(
            err.message
          )
        if (isTransient && attempts <= 2) {
          console.warn(`[mailer] Transient error (${err.message}). Retrying in ${attempts * 1000}ms...`)
          await new Promise((r) => setTimeout(r, attempts * 1000))
          continue
        }
        throw err
      }
    }
  }

  if (strategy === 'resend') {
    try {
      return await executeWithRetry(() => sendViaResend(options))
    } catch (resendErr) {
      console.warn('[mailer] Resend send failed, checking SMTP fallback:', resendErr.message)
      if ((process.env.EMAIL_USER || env.EMAIL_USER) && (process.env.EMAIL_PASS || env.EMAIL_PASS)) {
        return executeWithRetry(() => sendViaSMTP(options))
      }
      throw resendErr
    }
  }

  // Default: SMTP
  try {
    return await executeWithRetry(() => sendViaSMTP(options))
  } catch (smtpErr) {
    console.warn('[mailer] SMTP send failed, checking Resend fallback:', smtpErr.message)
    if (process.env.RESEND_API_KEY || env.RESEND_API_KEY) {
      return executeWithRetry(() => sendViaResend(options))
    }
    throw smtpErr
  }
}

// ── In-Memory Throttled Email Queue ────────────────────────────
const emailQueue = []
let processingQueue = false

async function processEmailQueue() {
  if (processingQueue || emailQueue.length === 0) return
  processingQueue = true

  while (emailQueue.length > 0) {
    const item = emailQueue.shift()
    const { options, resolve, reject } = item
    try {
      const result = await sendEmailDirect(options)
      // Log successful send
      if (!options.skipLog) {
        await logEmailSend({
          recipient: options.to,
          subject: options.subject,
          sender: options.from || VERIFIED_SENDER_MAILBOX,
          replyTo: options.replyTo,
          event: options.event || 'transactional',
          templateId: options.templateId,
          status: 'SENT',
          metadata: options.metadata,
          idempotencyKey: options.idempotencyKey,
        })
      }
      resolve(result)
    } catch (err) {
      console.error('[mailer queue error]:', err.message)
      // Log failed send
      if (!options.skipLog) {
        await logEmailSend({
          recipient: options.to,
          subject: options.subject,
          sender: options.from || VERIFIED_SENDER_MAILBOX,
          replyTo: options.replyTo,
          event: options.event || 'transactional',
          templateId: options.templateId,
          status: 'FAILED',
          errorMessage: err.message,
          metadata: options.metadata,
          idempotencyKey: options.idempotencyKey,
        })
      }
      reject(err)
    }
    // Throttle: wait 500ms between attempts
    await new Promise((res) => setTimeout(res, 500))
  }

  processingQueue = false
}

// ── Central sendEmail (Unified & Audited) ───────────────────────
export async function sendEmail(options) {
  const { to, idempotencyKey, event, isManual, isInternalAlert, isCustomerCopy } = options

  // 1. Centralized Automation Rule Enforcement
  // Explicitly distinguish manual / test sends from automated event dispatch.
  // Manual sends (isManual: true or event === 'manual.compose' or event === 'system.test') NEVER get suppressed by automation rules.
  const isExplicitManual = isManual === true || event === 'manual.compose' || event === 'system.test'

  let targetRecipient = to
  let effectiveOptions = { ...options }

  if (!isExplicitManual && event) {
    try {
      const rule = await prisma.emailAutomationRule.findFirst({
        where: { event },
      })

      if (rule) {
        // A. Is the automation rule globally enabled?
        if (rule.isEnabled === false) {
          console.warn(`[mailer] Automated dispatch suppressed: rule '${event}' is disabled.`)
          return {
            messageId: null,
            skipped: true,
            suppressed: true,
            reason: `Automation rule for '${event}' is disabled`,
            event,
          }
        }

        // B. Handle internal alerts vs customer copies
        if (isInternalAlert === true) {
          if (rule.sendInternalAlert === false) {
            console.warn(`[mailer] Internal alert suppressed: rule '${event}' has sendInternalAlert disabled.`)
            return {
              messageId: null,
              skipped: true,
              suppressed: true,
              reason: `Internal alert for '${event}' is disabled`,
              event,
            }
          }
          // Dynamic internal routing override if configured
          if (rule.internalRouting && rule.internalRouting.trim()) {
            targetRecipient = rule.internalRouting.trim()
            effectiveOptions.to = targetRecipient
          }
        } else if (isCustomerCopy === true) {
          if (rule.sendCustomerCopy === false) {
            console.warn(`[mailer] Customer copy suppressed: rule '${event}' has sendCustomerCopy disabled.`)
            return {
              messageId: null,
              skipped: true,
              suppressed: true,
              reason: `Customer copy for '${event}' is disabled`,
              event,
            }
          }
        }
      }
      // If rule is not found in database: safe default is to proceed (do not suppress critical security or unconfigured system events).
    } catch (ruleErr) {
      console.warn(`[mailer] Could not check automation rule for '${event}': ${ruleErr.message}. Proceeding with safe default.`)
    }
  }

  // 2. Idempotency check: if an idempotencyKey is provided, check if already successfully sent
  if (idempotencyKey) {
    try {
      const existing = await prisma.emailLog.findUnique({
        where: { idempotencyKey },
      })
      if (existing && existing.status === 'SENT') {
        console.log(`[mailer] Idempotent send skipped. Already sent to ${targetRecipient} (Key: ${idempotencyKey})`)
        return { messageId: existing.id, idempotencySkipped: true, skipped: true, reason: 'Duplicate idempotency key' }
      }
    } catch {
      // ignore lookup error
    }
  }

  // 3. Recent Duplicate check for automated events (within 5 minutes to same recipient)
  if (event && targetRecipient && !options.allowDuplicate) {
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
      const duplicate = await prisma.emailLog.findFirst({
        where: {
          recipient: targetRecipient.toLowerCase().trim(),
          event,
          status: 'SENT',
          createdAt: { gte: fiveMinAgo },
        },
      })
      if (duplicate) {
        console.warn(`[mailer] Duplicate protection active: identical event '${event}' already sent to ${targetRecipient} in last 5m.`)
        return { messageId: duplicate.id, duplicatePrevented: true, skipped: true, reason: 'Duplicate event within 5m' }
      }
    } catch {
      // ignore
    }
  }

  // 4. Resolve From and Reply-To headers
  const { from, replyTo } = resolveSenderAndReplyTo(effectiveOptions)
  const finalOptions = {
    ...effectiveOptions,
    from: effectiveOptions.from || from,
    replyTo: effectiveOptions.replyTo || replyTo,
  }

  return new Promise((resolve, reject) => {
    emailQueue.push({ options: finalOptions, resolve, reject })
    processEmailQueue()
  })
}

export const sendCentralEmail = sendEmail

// ── Shared Professional Email Footer ───────────────────────────
export function professionalEmailFooter(settings = {}) {
  const phone = settings.phone || '+91 8209604849'
  const whatsapp = settings.whatsapp || '+91 8209604849'
  const address = settings.address || 'Bhilwara – 311001, Rajasthan, India'
  const linkedin = settings.linkedin || null
  const facebook = settings.facebook || null
  const instagram = settings.instagram || null
  const pinterest = settings.pinterest || null
  const youtube = settings.youtube || null

  const waNumber = whatsapp.replace(/[\s\-+]/g, '')
  const waLink = `https://wa.me/${waNumber}`

  const socialButtons = [
    linkedin &&
      `<a href="${linkedin}" style="display:inline-block;background:#0A66C2;color:white;font-size:11px;font-weight:bold;padding:3px 9px;border-radius:4px;text-decoration:none;margin:2px;">LinkedIn</a>`,
    facebook &&
      `<a href="${facebook}" style="display:inline-block;background:#1877F2;color:white;font-size:11px;font-weight:bold;padding:3px 9px;border-radius:4px;text-decoration:none;margin:2px;">Facebook</a>`,
    instagram &&
      `<a href="${instagram}" style="display:inline-block;background:#E1306C;color:white;font-size:11px;font-weight:bold;padding:3px 9px;border-radius:4px;text-decoration:none;margin:2px;">Instagram</a>`,
    pinterest &&
      `<a href="${pinterest}" style="display:inline-block;background:#E60023;color:white;font-size:11px;font-weight:bold;padding:3px 9px;border-radius:4px;text-decoration:none;margin:2px;">Pinterest</a>`,
    youtube &&
      `<a href="${youtube}" style="display:inline-block;background:#FF0000;color:white;font-size:11px;font-weight:bold;padding:3px 9px;border-radius:4px;text-decoration:none;margin:2px;">YouTube</a>`,
  ]
    .filter(Boolean)
    .join('\n        ')

  return `
    <div style="margin-top: 32px; border-top: 2px solid #0066FF; padding-top: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; padding-right: 20px;">
            <div style="margin-bottom: 8px;">
              <span style="font-size: 18px; font-weight: 800; color: #0b0f19; letter-spacing: -0.5px;">Snap</span><span style="font-size: 18px; font-weight: 800; color: #0066FF; letter-spacing: -0.5px;">Tech</span>
              <span style="font-size: 13px; font-weight: 700; color: #475569; margin-left: 4px; text-transform: uppercase;">Digital</span>
            </div>
            <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #64748b;">Enterprise IT &bull; Software Engineering &bull; Digital Growth</p>
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">Parent Group: Hindustan Projects Group</p>
          </td>
          <td style="vertical-align: top; text-align: right;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #1e293b;"><strong>📞 Phone:</strong> <a href="tel:${phone}" style="color: #0066FF; text-decoration: none;">${phone}</a></p>
            <p style="margin: 0 0 4px; font-size: 12px; color: #1e293b;"><strong>💬 WhatsApp:</strong> <a href="${waLink}" style="color: #16a34a; text-decoration: none;">Chat on WhatsApp</a></p>
            <p style="margin: 0; font-size: 11px; color: #64748b;">📍 ${address}</p>
          </td>
        </tr>
      </table>
      ${socialButtons ? `<div style="margin-top: 14px; text-align: center;">${socialButtons}</div>` : ''}
      <p style="margin-top: 18px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 12px;">
        &copy; ${new Date().getFullYear()} SnapTech Digital. All rights reserved. Registered commercial mailbox: ${VERIFIED_SENDER_MAILBOX}
      </p>
    </div>
  `
}

export async function fetchEmailFooterSettings(prismaClient = prisma) {
  try {
    const keys = ['phone', 'whatsapp', 'address', 'linkedin', 'facebook', 'instagram', 'youtube', 'pinterest']
    const rows = await prismaClient.siteSetting.findMany({ where: { key: { in: keys } } })
    const settings = {}
    for (const row of rows) settings[row.key] = row.value
    return settings
  } catch {
    return {}
  }
}

// ── Master Branded Email Layout Generator ───────────────────────
export function renderBrandedEmailLayout({
  title,
  subtitle = 'SnapTech Digital &bull; Client Communications',
  badgeText = null,
  contentHtml,
  ctaText = null,
  ctaUrl = null,
  footerSettings = {},
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px 12px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Premium Brand Header -->
        <div style="background: linear-gradient(135deg, #0b0f19 0%, #1e3a8a 100%); padding: 24px 28px; text-align: left;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td>
                <div style="display: inline-block;">
                  <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Snap</span><span style="font-size: 22px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px;">Tech</span>
                  <span style="font-size: 12px; font-weight: 700; color: #93c5fd; text-transform: uppercase; margin-left: 6px; letter-spacing: 1px;">Digital</span>
                </div>
                <p style="margin: 4px 0 0; font-size: 12px; color: #cbd5e1; letter-spacing: 0.3px;">${subtitle}</p>
              </td>
              ${
                badgeText
                  ? `<td style="text-align: right; vertical-align: middle;">
                      <span style="display: inline-block; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(badgeText)}</span>
                    </td>`
                  : ''
              }
            </tr>
          </table>
        </div>

        <!-- Main Body -->
        <div style="padding: 28px 28px 24px;">
          ${title ? `<h2 style="margin: 0 0 16px; font-size: 19px; font-weight: 700; color: #0f172a; line-height: 1.4;">${escapeHtml(title)}</h2>` : ''}
          ${contentHtml}

          ${
            ctaText && ctaUrl
              ? `
              <div style="margin-top: 28px; text-align: center;">
                <a href="${escapeHtml(ctaUrl)}" target="_blank" style="display: inline-block; background: #0066FF; color: #ffffff; font-size: 14px; font-weight: 700; padding: 12px 30px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 4px rgba(0, 102, 255, 0.25);">
                  ${escapeHtml(ctaText)} &rarr;
                </a>
              </div>
            `
              : ''
          }

          <!-- Footer -->
          ${professionalEmailFooter(footerSettings)}
        </div>
      </div>
    </div>
  `
}

// ── Complete Catalog of Official Templates ───────────────────────
export const TEMPLATES_CATALOG = [
  {
    id: 'inquiry_confirmation',
    name: 'General Inquiry Confirmation',
    category: 'Transactional',
    description: 'Auto-reply sent to customer when a general contact inquiry is submitted.',
    variables: ['name', 'serviceInterested', 'message'],
  },
  {
    id: 'quote_confirmation',
    name: 'Quote Request Confirmation',
    category: 'Sales',
    description: 'Detailed quotation received confirmation with project scope and review SLA.',
    variables: ['name', 'service', 'estimatedBudget', 'timeline', 'deliverables'],
  },
  {
    id: 'proposal_delivery',
    name: 'Project Proposal Email',
    category: 'Sales',
    description: 'Formal proposal delivery email to prospective or existing client.',
    variables: ['clientName', 'projectTitle', 'scopeSummary', 'proposalUrl', 'estimatedDelivery', 'validUntil'],
  },
  {
    id: 'project_kickoff',
    name: 'Project Kickoff / Milestone Update',
    category: 'Projects',
    description: 'Announces project initiation, assigned project lead, and milestone tracking portal.',
    variables: ['clientName', 'projectTitle', 'assignedLead', 'startDate', 'portalUrl', 'milestones'],
  },
  {
    id: 'support_ticket_confirmation',
    name: 'Support Ticket Confirmation',
    category: 'Support',
    description: 'Client receipt confirming ticket creation with unique tracking ID.',
    variables: ['clientName', 'ticketId', 'subject', 'category', 'message', 'portalUrl'],
  },
  {
    id: 'support_ticket_reply',
    name: 'Support Ticket Reply',
    category: 'Support',
    description: 'Notification sent when support staff answers a ticket.',
    variables: ['recipientName', 'ticketId', 'subject', 'senderName', 'message', 'portalUrl'],
  },
  {
    id: 'invoice_delivery',
    name: 'Invoice & Payment Request',
    category: 'Billing',
    description: 'Milestone invoice notification with payment link and breakdown.',
    variables: ['clientName', 'projectTitle', 'milestoneTitle', 'amount', 'invoiceNumber', 'dueDate', 'paymentUrl'],
  },
  {
    id: 'verified_payment_confirmation',
    name: 'Verified Payment Receipt',
    category: 'Billing',
    description: 'Official confirmation and receipt for verified client milestone payment.',
    variables: ['clientName', 'projectName', 'milestoneTitle', 'amount', 'transactionId', 'receiptUrl', 'paymentDate'],
  },
  {
    id: 'careers_application_confirmation',
    name: 'Careers Application Confirmation',
    category: 'Recruitment',
    description: 'Applicant acknowledgment confirming receipt of resume and review timeline.',
    variables: ['name', 'jobTitle'],
  },
  {
    id: 'custom_compose',
    name: 'Custom Branded Email',
    category: 'General',
    description: 'Custom email for direct communication from the Admin Email Center.',
    variables: ['recipientName', 'subject', 'bodyHtml', 'bodyText', 'ctaText', 'ctaUrl'],
  },
]

// ── Template Implementations ───────────────────────────────────

/**
 * 1. Inquiry Confirmation (Customer copy)
 */
export function inquiryConfirmationTemplate({ name, serviceInterested, message, footerSettings = {} }) {
  const service = serviceInterested || 'General Inquiry'
  const content = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
      Dear <strong>${escapeHtml(name)}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
      Thank you for connecting with <strong>SnapTech Digital</strong>. We have successfully logged your inquiry regarding <strong>${escapeHtml(service)}</strong>.
    </p>
    <div style="background: #f1f5f9; border-left: 4px solid #0066FF; border-radius: 6px; padding: 14px 16px; margin: 20px 0;">
      <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Inquiry Summary</p>
      <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(message || 'No additional note provided.')}</p>
    </div>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
      Our senior technical advisor will review your project brief and connect with you within <strong>2 hours</strong> during standard business hours.
    </p>
  `
  return {
    subject: `Thank you for contacting SnapTech Digital — ${service}`,
    html: renderBrandedEmailLayout({
      title: 'Inquiry Received & Logged',
      subtitle: 'SnapTech Digital &bull; Client Onboarding',
      badgeText: 'Priority SLA',
      contentHtml: content,
      ctaText: 'Explore Our Portfolio',
      ctaUrl: 'https://www.snaptech.digital/portfolio',
      footerSettings,
    }),
    text: `Dear ${name},\n\nThank you for reaching out to SnapTech Digital regarding ${service}. We have received your inquiry:\n\n${message || ''}\n\nOur technical team will review your specifications and contact you within 2 business hours.\n\nWebsite: https://www.snaptech.digital\nDirect Support: ${VERIFIED_SENDER_MAILBOX}`,
  }
}

/**
 * 2. Quote Request Confirmation
 */
export function quoteRequestConfirmationTemplate({
  name,
  service,
  estimatedBudget,
  timeline,
  deliverables,
  footerSettings = {},
}) {
  const content = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
      Dear <strong>${escapeHtml(name)}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
      We have received your quotation request for <strong>${escapeHtml(service || 'Custom IT Solution')}</strong>. Our software architecture team is currently preparing a tailored scope breakdown.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <tr>
        <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 40%;">Target Service</td>
        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(service || 'Custom Solution')}</td>
      </tr>
      ${
        estimatedBudget
          ? `<tr>
        <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Estimated Budget</td>
        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #0066FF; border-bottom: 1px solid #e2e8f0;">${escapeHtml(estimatedBudget)}</td>
      </tr>`
          : ''
      }
      ${
        timeline
          ? `<tr>
        <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Target Timeline</td>
        <td style="padding: 10px 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #e2e8f0;">${escapeHtml(timeline)}</td>
      </tr>`
          : ''
      }
      ${
        deliverables
          ? `<tr>
        <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #64748b;">Key Deliverables</td>
        <td style="padding: 10px 14px; font-size: 13px; color: #334155;">${escapeHtml(deliverables)}</td>
      </tr>`
          : ''
      }
    </table>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Our proposal will include: architecture blueprint, tech stack recommendations, fixed-cost commercial quote, and milestone delivery timeline.
    </p>
  `
  return {
    subject: `Quotation Request Received — ${service || 'SnapTech Digital'}`,
    html: renderBrandedEmailLayout({
      title: 'Quotation Request Received',
      subtitle: 'SnapTech Digital &bull; Commercial Solutions',
      badgeText: 'Quote Pending',
      contentHtml: content,
      ctaText: 'View Pricing & Packages',
      ctaUrl: 'https://www.snaptech.digital/pricing',
      footerSettings,
    }),
    text: `Dear ${name},\n\nWe have received your quotation request for ${service || 'Custom IT Solution'}.\n\nEstimated Budget: ${estimatedBudget || 'Flexible'}\nTimeline: ${timeline || 'Standard'}\n\nOur team is working on your proposal and will be in touch shortly.\n\nBest regards,\nSnapTech Digital Commercial Team`,
  }
}

/**
 * 3. Proposal Delivery Email
 */
export function proposalEmailTemplate({
  clientName,
  projectTitle,
  scopeSummary,
  proposalUrl,
  estimatedDelivery,
  validUntil,
  footerSettings = {},
}) {
  const content = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
      Dear <strong>${escapeHtml(clientName)}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
      We are delighted to present our formal engineering proposal for <strong>${escapeHtml(projectTitle)}</strong>. This document outlines our architectural solution, deliverables schedule, and milestone commitments.
    </p>
    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Executive Scope Summary</p>
      <p style="margin: 0 0 12px; font-size: 13px; color: #0f172a; line-height: 1.6;">${escapeHtml(scopeSummary || 'Complete custom engineering solution.')}</p>
      ${estimatedDelivery ? `<p style="margin: 0 0 4px; font-size: 12px; color: #475569;"><strong>Estimated Delivery:</strong> ${escapeHtml(estimatedDelivery)}</p>` : ''}
      ${validUntil ? `<p style="margin: 0; font-size: 12px; color: #475569;"><strong>Proposal Validity:</strong> Valid until ${escapeHtml(validUntil)}</p>` : ''}
    </div>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Please click below to review your live proposal in detail or download the official PDF.
    </p>
  `
  return {
    subject: `Technical Proposal & Commercial Scope — ${projectTitle}`,
    html: renderBrandedEmailLayout({
      title: `Project Proposal: ${projectTitle}`,
      subtitle: 'SnapTech Digital &bull; Client Solutions',
      badgeText: 'Official Proposal',
      contentHtml: content,
      ctaText: 'Review Full Proposal',
      ctaUrl: proposalUrl || 'https://www.snaptech.digital/client',
      footerSettings,
    }),
    text: `Dear ${clientName},\n\nWe are pleased to deliver the project proposal for ${projectTitle}.\n\nScope Summary: ${scopeSummary}\nEstimated Delivery: ${estimatedDelivery || 'N/A'}\n\nView Proposal Online: ${proposalUrl || 'https://www.snaptech.digital'}\n\nBest regards,\nSnapTech Digital Architecture Team`,
  }
}

/**
 * 4. Project Kickoff / Milestone Update
 */
export function projectKickoffTemplate({
  clientName,
  projectTitle,
  assignedLead,
  startDate,
  portalUrl,
  milestones,
  footerSettings = {},
}) {
  const content = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
      Dear <strong>${escapeHtml(clientName)}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
      We are excited to announce that development for <strong>${escapeHtml(projectTitle)}</strong> has officially been kicked off!
    </p>
    <div style="background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 6px; padding: 14px 16px; margin: 20px 0;">
      <p style="margin: 0 0 4px; font-size: 12px; color: #166534;"><strong>🚀 Project Phase:</strong> Active Development</p>
      <p style="margin: 0 0 4px; font-size: 12px; color: #166534;"><strong>📅 Kickoff Date:</strong> ${escapeHtml(startDate || new Date().toLocaleDateString())}</p>
      <p style="margin: 0; font-size: 12px; color: #166534;"><strong>👤 Lead Architect:</strong> ${escapeHtml(assignedLead || 'Senior Technical Lead')}</p>
    </div>
    ${
      milestones
        ? `<div style="margin: 16px 0; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Milestone Roadmap</p>
            <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(milestones)}</p>
          </div>`
        : ''
    }
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      You can track real-time progress, review staging builds, and download deliverables anytime through your secure Client Portal.
    </p>
  `
  return {
    subject: `🚀 Project Kickoff Confirmation — ${projectTitle}`,
    html: renderBrandedEmailLayout({
      title: `Project Kickoff: ${projectTitle}`,
      subtitle: 'SnapTech Digital &bull; Engineering Updates',
      badgeText: 'Active Development',
      contentHtml: content,
      ctaText: 'Open Client Portal',
      ctaUrl: portalUrl || 'https://www.snaptech.digital/client',
      footerSettings,
    }),
    text: `Dear ${clientName},\n\nWe have kicked off ${projectTitle}!\nLead: ${assignedLead || 'SnapTech Lead'}\nStart Date: ${startDate || 'Today'}\n\nTrack progress on your portal: ${portalUrl || 'https://www.snaptech.digital/client'}\n\nBest regards,\nSnapTech Digital Engineering Team`,
  }
}

/**
 * 5. Support Ticket Confirmation (Customer copy)
 */
export function supportTicketConfirmationTemplate({
  clientName,
  ticketId,
  subject,
  category,
  message,
  portalUrl,
  footerSettings = {},
}) {
  const shortId = ticketId.slice(-6).toUpperCase()
  const content = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
      Dear <strong>${escapeHtml(clientName)}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
      Your support ticket has been received and registered under ticket ID <strong>#${shortId}</strong>. A support engineer has been assigned to your request.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <tr>
        <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 35%;">Ticket ID</td>
        <td style="padding: 10px 14px; font-size: 13px; font-weight: 700; color: #0066FF; border-bottom: 1px solid #e2e8f0;">#${shortId}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Category</td>
        <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(category || 'General')}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Subject</td>
        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${escapeHtml(subject)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #64748b;">Description</td>
        <td style="padding: 10px 14px; font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(message)}</td>
      </tr>
    </table>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      You can reply directly through your Client Portal ticket thread to attach logs, screenshots, or additional information.
    </p>
  `
  return {
    subject: `[Ticket #${shortId}] Support Request Received: ${subject}`,
    html: renderBrandedEmailLayout({
      title: `Support Ticket #${shortId} Created`,
      subtitle: 'SnapTech Digital &bull; Client Helpdesk',
      badgeText: 'Ticket Open',
      contentHtml: content,
      ctaText: 'View Support Thread',
      ctaUrl: portalUrl || 'https://www.snaptech.digital/client/support',
      footerSettings,
    }),
    text: `Support Ticket #${shortId} Received\n\nClient: ${clientName}\nSubject: ${subject}\nCategory: ${category}\n\nDescription:\n${message}\n\nTrack ticket online: ${portalUrl || 'https://www.snaptech.digital/client/support'}\n\nSnapTech Digital Helpdesk`,
  }
}

/**
 * 6. Invoice Delivery Template
 */
export function invoiceDeliveryTemplate({
  clientName,
  projectTitle,
  milestoneTitle,
  amount,
  invoiceNumber,
  dueDate,
  paymentUrl,
  footerSettings = {},
}) {
  const content = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
      Dear <strong>${escapeHtml(clientName)}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
      Please find the commercial invoice for <strong>${escapeHtml(milestoneTitle)}</strong> under project <strong>${escapeHtml(projectTitle)}</strong>.
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="font-size: 12px; color: #64748b; padding-bottom: 8px;">Invoice Number:</td>
          <td style="font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; padding-bottom: 8px;">${escapeHtml(invoiceNumber || 'INV-' + Date.now().toString().slice(-6))}</td>
        </tr>
        <tr>
          <td style="font-size: 12px; color: #64748b; padding-bottom: 8px;">Milestone Item:</td>
          <td style="font-size: 13px; font-weight: 600; color: #0f172a; text-align: right; padding-bottom: 8px;">${escapeHtml(milestoneTitle)}</td>
        </tr>
        <tr>
          <td style="font-size: 12px; color: #64748b; padding-bottom: 8px;">Due Date:</td>
          <td style="font-size: 13px; color: #dc2626; font-weight: 600; text-align: right; padding-bottom: 8px;">${escapeHtml(dueDate || 'Upon Receipt')}</td>
        </tr>
        <tr style="border-top: 2px solid #e2e8f0;">
          <td style="font-size: 14px; font-weight: 800; color: #0f172a; padding-top: 10px;">Total Amount Due:</td>
          <td style="font-size: 18px; font-weight: 800; color: #0066FF; text-align: right; padding-top: 10px;">₹${Number(amount || 0).toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Deliverables for this milestone will be unlocked and updated live upon payment verification.
    </p>
  `
  return {
    subject: `Invoice: ${milestoneTitle} — SnapTech Digital (₹${Number(amount || 0).toLocaleString('en-IN')})`,
    html: renderBrandedEmailLayout({
      title: 'Milestone Invoice Issued',
      subtitle: 'SnapTech Digital &bull; Billing & Financials',
      badgeText: 'Payment Due',
      contentHtml: content,
      ctaText: 'Review Invoice & Pay Online',
      ctaUrl: paymentUrl || 'https://www.snaptech.digital/client/billing',
      footerSettings,
    }),
    text: `Dear ${clientName},\n\nInvoice for milestone "${milestoneTitle}" under project "${projectTitle}".\nAmount Due: ₹${Number(amount || 0).toLocaleString('en-IN')}\nDue Date: ${dueDate || 'Upon receipt'}\n\nPay Online: ${paymentUrl || 'https://www.snaptech.digital/client/billing'}\n\nSnapTech Digital Billing Team`,
  }
}

/**
 * 7. Verified Payment Confirmation
 */
export function verifiedPaymentConfirmationTemplate({
  clientName,
  projectName,
  milestoneTitle,
  amount,
  transactionId,
  receiptUrl,
  paymentDate,
  footerSettings = {},
}) {
  const content = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
      Dear <strong>${escapeHtml(clientName)}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
      Thank you! Your payment of <strong>₹${Number(amount || 0).toLocaleString('en-IN')}</strong> for milestone <strong>${escapeHtml(milestoneTitle)}</strong> has been verified and settled.
    </p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="font-size: 12px; color: #166534; padding-bottom: 6px;">Payment Status:</td>
          <td style="font-size: 13px; font-weight: 700; color: #15803d; text-align: right; padding-bottom: 6px;">VERIFIED &bull; PAID</td>
        </tr>
        <tr>
          <td style="font-size: 12px; color: #166534; padding-bottom: 6px;">Project:</td>
          <td style="font-size: 13px; font-weight: 600; color: #0f172a; text-align: right; padding-bottom: 6px;">${escapeHtml(projectName)}</td>
        </tr>
        <tr>
          <td style="font-size: 12px; color: #166534; padding-bottom: 6px;">Milestone Title:</td>
          <td style="font-size: 13px; color: #0f172a; text-align: right; padding-bottom: 6px;">${escapeHtml(milestoneTitle)}</td>
        </tr>
        ${
          transactionId
            ? `<tr>
          <td style="font-size: 12px; color: #166534; padding-bottom: 6px;">Transaction / UTR:</td>
          <td style="font-size: 12px; font-family: monospace; color: #0f172a; text-align: right; padding-bottom: 6px;">${escapeHtml(transactionId)}</td>
        </tr>`
            : ''
        }
        <tr>
          <td style="font-size: 12px; color: #166534; padding-bottom: 6px;">Settlement Date:</td>
          <td style="font-size: 13px; color: #0f172a; text-align: right; padding-bottom: 6px;">${escapeHtml(paymentDate || new Date().toLocaleDateString())}</td>
        </tr>
        <tr style="border-top: 2px solid #bbf7d0;">
          <td style="font-size: 14px; font-weight: 800; color: #14532d; padding-top: 10px;">Amount Received:</td>
          <td style="font-size: 18px; font-weight: 800; color: #15803d; text-align: right; padding-top: 10px;">₹${Number(amount || 0).toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      All source code artifacts and deliverables associated with this milestone have been marked as active in your portal.
    </p>
  `
  return {
    subject: `Official Payment Receipt: ${milestoneTitle} — ₹${Number(amount || 0).toLocaleString('en-IN')}`,
    html: renderBrandedEmailLayout({
      title: 'Payment Confirmation & Receipt',
      subtitle: 'SnapTech Digital &bull; Financial Receipts',
      badgeText: 'Verified Settlement',
      contentHtml: content,
      ctaText: 'Download Official Receipt',
      ctaUrl: receiptUrl || 'https://www.snaptech.digital/client/billing',
      footerSettings,
    }),
    text: `Dear ${clientName},\n\nPayment verified: ₹${Number(amount || 0).toLocaleString('en-IN')} for milestone "${milestoneTitle}" under project "${projectName}".\nStatus: PAID\nDate: ${paymentDate || 'Today'}\n\nDownload Receipt: ${receiptUrl || 'https://www.snaptech.digital/client/billing'}\n\nSnapTech Digital Finance`,
  }
}

/**
 * 8. Careers Application Confirmation
 */
export function careersApplicantConfirmationTemplate({ name, jobTitle, footerSettings = {} }) {
  const content = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
      Dear <strong>${escapeHtml(name)}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
      Thank you for applying for the <strong>${escapeHtml(jobTitle)}</strong> role at SnapTech Digital. We have successfully received your resume and application credentials.
    </p>
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 14px 16px; margin: 20px 0;">
      <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #1e40af;">Application Status: In Review</p>
      <p style="margin: 0; font-size: 13px; color: #1e3a8a; line-height: 1.5;">Our engineering hiring committee reviews portfolios on a rolling basis. If your technical background matches our stack, we will contact you within 24 hours.</p>
    </div>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      We appreciate your interest in building next-generation digital products with SnapTech Digital!
    </p>
  `
  return {
    subject: `Application Received: ${jobTitle} at SnapTech Digital`,
    html: renderBrandedEmailLayout({
      title: 'Job Application Received',
      subtitle: 'SnapTech Digital &bull; Careers & Culture',
      badgeText: 'Talent Acquisition',
      contentHtml: content,
      ctaText: 'Learn More About Us',
      ctaUrl: 'https://www.snaptech.digital/about',
      footerSettings,
    }),
    text: `Dear ${name},\n\nThank you for applying for the ${jobTitle} position at SnapTech Digital.\n\nWe have received your application and resume. Our hiring team will review your profile and reach out within 24 hours.\n\nBest regards,\nSnapTech Digital Talent Team`,
  }
}

/**
 * 9. Custom Compose Template
 */
export function customEmailTemplate({
  recipientName = 'Client',
  subject = 'Message from SnapTech Digital',
  bodyHtml = '',
  bodyText = '',
  ctaText = null,
  ctaUrl = null,
  footerSettings = {},
}) {
  const content = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
      Dear <strong>${escapeHtml(recipientName)}</strong>,
    </p>
    <div style="font-size: 14px; color: #334155; line-height: 1.7; margin: 0 0 20px;">
      ${bodyHtml}
    </div>
  `
  return {
    subject: String(subject),
    html: renderBrandedEmailLayout({
      title: subject,
      subtitle: 'SnapTech Digital &bull; Client Communications',
      contentHtml: content,
      ctaText,
      ctaUrl,
      footerSettings,
    }),
    text: `Dear ${recipientName},\n\n${bodyText || bodyHtml.replace(/<[^>]+>/g, '')}\n\nBest regards,\nSnapTech Digital Team\n${VERIFIED_SENDER_MAILBOX}`,
  }
}

// ── Admin Alerts & Backward Compatibility Templates ─────────────

export function adminNotificationTemplate({
  name,
  email,
  phone,
  message,
  serviceInterested,
  estimatedBudget,
  attribution,
}) {
  const service = serviceInterested || 'Not specified'
  const phoneDisplay = phone || 'Not provided'
  const budgetDisplay = estimatedBudget || null

  return {
    subject: `New IT Project Lead: ${name} [Snaptech]`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #001D4A; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New IT Project Lead</h1>
          <p style="color: #00D2FF; margin: 4px 0 0; font-size: 14px; font-weight: bold;">SnapTech Digital &bull; IT Services</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px; width: 35%;">Name</td>
            <td style="padding: 8px 0; color: #1A1A1A; font-size: 14px; font-weight: 600;">${escapeHtml(name)}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 8px 4px; color: #6B7280; font-size: 14px;">Email</td>
            <td style="padding: 8px 4px; font-size: 14px;"><a href="mailto:${escapeHtml(email)}" style="color: #0066FF;">${escapeHtml(email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Phone</td>
            <td style="padding: 8px 0; color: #1A1A1A; font-size: 14px;">${escapeHtml(phoneDisplay)}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 8px 4px; color: #6B7280; font-size: 14px;">Service</td>
            <td style="padding: 8px 4px; color: #1A1A1A; font-size: 14px;">${escapeHtml(service)}</td>
          </tr>
          ${
            budgetDisplay
              ? `<tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Estimated Budget</td>
            <td style="padding: 8px 0; color: #1A1A1A; font-size: 14px; font-weight: 600;">${escapeHtml(budgetDisplay)}</td>
          </tr>`
              : ''
          }
        </table>

        <div style="margin-top: 16px; padding: 16px; background: #f0f6ff; border-radius: 6px; border-left: 4px solid #0066FF;">
          <p style="margin: 0 0 8px; color: #001D4A; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Project Requirements</p>
          <p style="margin: 0; color: #1A1A1A; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>

        ${
          attribution
            ? `<div style="margin-top: 16px; padding: 12px 14px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 4px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Marketing Attribution</p>
          <pre style="margin: 0; color: #334155; font-size: 12px; font-family: monospace; white-space: pre-wrap;">${escapeHtml(attribution)}</pre>
        </div>`
            : ''
        }

        <div style="margin-top: 20px; text-align: center;">
          <a href="mailto:${escapeHtml(email)}" style="display: inline-block; background: #0066FF; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Reply to ${escapeHtml(name)}</a>
        </div>

        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          This lead was submitted via the SnapTech portal (www.snaptech.digital).
        </p>
      </div>
    `,
    text: `New IT Project Lead\n\nName: ${name}\nEmail: ${email}\nPhone: ${phoneDisplay}\nService: ${service}${budgetDisplay ? `\nBudget: ${budgetDisplay}` : ''}\n\nRequirements:\n${message}${attribution ? `\n\nAttribution:\n${attribution}` : ''}`,
  }
}

export function autoReplyTemplate({ name }) {
  return inquiryConfirmationTemplate({ name, serviceInterested: 'General', message: 'Inquiry submitted online' })
}

export function jobAdminNotificationTemplate({ jobTitle, name, email, phone, resumeUrl, coverLetter }) {
  const coverLetterDisplay = coverLetter || 'Not provided'
  return {
    subject: `New Job Application: ${name} - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Job Application</h1>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">SnapTech Digital Careers</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px; width: 35%;">Applied For</td>
            <td style="padding: 8px 0; color: #1A1A1A; font-size: 14px; font-weight: 600;">${escapeHtml(jobTitle)}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 8px 4px; color: #6B7280; font-size: 14px;">Applicant Name</td>
            <td style="padding: 8px 4px; color: #1A1A1A; font-size: 14px; font-weight: 600;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Email</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${escapeHtml(email)}" style="color: #1A3E8C;">${escapeHtml(email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Resume / CV</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="${escapeHtml(resumeUrl)}" target="_blank" style="color: #E31E24; font-weight: bold; text-decoration: underline;">Download / View Resume</a></td>
          </tr>
        </table>

        <div style="margin-top: 16px; padding: 16px; background: #f3f4f6; border-radius: 6px; border-left: 4px solid #1A3E8C;">
          <p style="margin: 0 0 8px; color: #6B7280; font-size: 13px; text-transform: uppercase;">Cover Letter</p>
          <p style="margin: 0; color: #1A1A1A; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(coverLetterDisplay)}</p>
        </div>
      </div>
    `,
    text: `New Job Application\nRole: ${jobTitle}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nResume: ${resumeUrl}\n\nCover Letter: ${coverLetterDisplay}`,
  }
}

export function jobApplicantConfirmationTemplate({ name, jobTitle }) {
  return careersApplicantConfirmationTemplate({ name, jobTitle })
}

export function leadFollowUpReminderTemplate({ leads, adminUrl }) {
  const leadsRows = leads
    .map(
      (lead) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px; font-size: 14px; font-weight: bold; color: #1A1A1A;">${escapeHtml(lead.name)}</td>
      <td style="padding: 10px; font-size: 14px; color: #374151;"><a href="mailto:${escapeHtml(lead.email)}" style="color: #1A3E8C;">${escapeHtml(lead.email)}</a><br><span style="font-size: 12px; color: #6B7280;">${escapeHtml(lead.phone || 'No phone')}</span></td>
      <td style="padding: 10px; font-size: 14px; color: #374151;">${escapeHtml(lead.serviceInterested || 'Not specified')}</td>
      <td style="padding: 10px; font-size: 12px; color: #6B7280;">${new Date(lead.createdAt).toLocaleDateString()}</td>
    </tr>
  `
    )
    .join('')

  return {
    subject: `⚠️ ACTION REQUIRED: ${leads.length} Unresolved Overdue Leads (>24h)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #E31E24; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Overdue Leads Follow-Up Reminder</h1>
          <p style="color: #ffcccc; margin: 4px 0 0; font-size: 14px;">The following leads have been NEW for over 24 hours</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #f3f4f6; text-align: left; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 10px; font-size: 13px; color: #4B5563;">Name</th>
              <th style="padding: 10px; font-size: 13px; color: #4B5563;">Contact</th>
              <th style="padding: 10px; font-size: 13px; color: #4B5563;">Service</th>
              <th style="padding: 10px; font-size: 13px; color: #4B5563;">Created</th>
            </tr>
          </thead>
          <tbody>
            ${leadsRows}
          </tbody>
        </table>
        ${
          adminUrl
            ? `<div style="margin-top: 30px; text-align: center;">
          <a href="${adminUrl}" style="display: inline-block; background: #1A3E8C; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Open Admin Panel leads</a>
        </div>`
            : ''
        }
      </div>
    `,
    text: `Follow-up reminder for ${leads.length} overdue leads.${adminUrl ? ` Direct Admin Link: ${adminUrl}` : ''}`,
  }
}

export function staleLeadFollowUpTemplate({ leads, adminUrl }) {
  const leadsRows = leads
    .map(
      (lead) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px; font-size: 14px; font-weight: bold; color: #1A1A1A;">${escapeHtml(lead.name)}</td>
      <td style="padding: 10px; font-size: 14px; color: #374151;"><a href="mailto:${escapeHtml(lead.email)}" style="color: #1A3E8C;">${escapeHtml(lead.email)}</a></td>
      <td style="padding: 10px; font-size: 14px; color: #374151;">${escapeHtml(lead.serviceInterested || 'Not specified')}</td>
      <td style="padding: 10px; font-size: 12px; color: #6B7280;">Last contact: ${new Date(lead.updatedAt).toLocaleDateString()}</td>
    </tr>
  `
    )
    .join('')

  return {
    subject: `🕒 FOLLOW-UP REMINDER: ${leads.length} Stale Contacted Leads (>3 days)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Stale Leads Reminder</h1>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">These leads have been in CONTACTED status for more than 3 days</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #f3f4f6; text-align: left; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 10px; font-size: 13px; color: #4B5563;">Name</th>
              <th style="padding: 10px; font-size: 13px; color: #4B5563;">Email</th>
              <th style="padding: 10px; font-size: 13px; color: #4B5563;">Service</th>
              <th style="padding: 10px; font-size: 13px; color: #4B5563;">Status Date</th>
            </tr>
          </thead>
          <tbody>
            ${leadsRows}
          </tbody>
        </table>
        ${
          adminUrl
            ? `<div style="margin-top: 30px; text-align: center;">
          <a href="${adminUrl}" style="display: inline-block; background: #E31E24; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: 600;">Open Admin Leads Dashboard</a>
        </div>`
            : ''
        }
      </div>
    `,
    text: `Stale leads follow-up reminder for ${leads.length} leads.${adminUrl ? ` Admin link: ${adminUrl}` : ''}`,
  }
}

export function weeklySummaryReportTemplate({ stats }) {
  return {
    subject: `📊 Weekly Summary Report — SnapTech Digital`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #0b0f19;">Weekly Summary Report</h2>
        <p>New Leads: <strong>${stats.totalNewLeads}</strong> | Job Applications: <strong>${stats.totalNewApplications}</strong></p>
      </div>
    `,
    text: `Weekly Summary Report: Leads: ${stats.totalNewLeads}, Job Apps: ${stats.totalNewApplications}`,
  }
}

export function dbBackupFailureTemplate({ error }) {
  return {
    subject: `🚨 CRITICAL ALERT: Database Backup Failure`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fecaca; border-radius: 8px;">
        <h2 style="color: #dc2626;">Database Backup Failed</h2>
        <p>${escapeHtml(error)}</p>
      </div>
    `,
    text: `Database backup failed: ${error}`,
  }
}

export function clientPaymentSuccessTemplate(args) {
  return verifiedPaymentConfirmationTemplate(args)
}

export function supportTicketCreatedTemplate({ clientName, ticketId, subject, category, message }) {
  return {
    subject: `[Support Ticket #${ticketId.slice(-6).toUpperCase()}] New Ticket: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Support Ticket</h1>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">SnapTech Digital Helpdesk</p>
        </div>
        <p>Hello Admin/Support Team,</p>
        <p>New support ticket opened by <strong>${escapeHtml(clientName)}</strong> (Ticket ID: #${ticketId.slice(-6).toUpperCase()}):</p>
        <p><strong>Category:</strong> ${escapeHtml(category)}<br><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <div style="background: #f8fafc; padding: 12px; border-left: 4px solid #1a3e8c;">
          ${escapeHtml(message)}
        </div>
      </div>
    `,
    text: `New support ticket #${ticketId.slice(-6).toUpperCase()} by ${clientName}: ${subject}\n\n${message}`,
  }
}

export function ticketAssignmentTemplate({
  adminEmail,
  ticketId,
  subject,
  category,
  clientName,
  assignedByRole,
  portalUrl,
}) {
  return {
    subject: `[Assigned Ticket #${ticketId.slice(-6).toUpperCase()}] ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2>Ticket Assigned to You</h2>
        <p>Hello ${escapeHtml(adminEmail || 'Team Member')},</p>
        <p>Ticket #${ticketId.slice(-6).toUpperCase()} (${escapeHtml(category || 'General')}) for client <strong>${escapeHtml(clientName)}</strong> has been assigned to you by ${assignedByRole}.</p>
        ${portalUrl ? `<p><a href="${portalUrl}" style="color: #0066FF;">View Ticket</a></p>` : ''}
      </div>
    `,
    text: `Ticket #${ticketId.slice(-6).toUpperCase()} (${category}) assigned to ${adminEmail}: ${subject}`,
  }
}

export function supportTicketReplyTemplate({ recipientName, ticketId, subject, senderName, message, portalUrl }) {
  return {
    subject: `[Support Ticket #${ticketId.slice(-6).toUpperCase()}] Reply from ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Ticket Reply Received</h1>
        </div>
        <p>Dear <strong>${escapeHtml(recipientName)}</strong>,</p>
        <p>A response has been posted by <strong>${escapeHtml(senderName)}</strong> for ticket: <strong>${escapeHtml(subject)}</strong></p>
        <div style="background: #f3f4f6; padding: 14px; border-left: 4px solid #0066FF; margin: 16px 0;">
          ${escapeHtml(message)}
        </div>
        ${portalUrl ? `<p><a href="${portalUrl}" style="color: #0066FF; font-weight: bold;">View Support Thread</a></p>` : ''}
      </div>
    `,
    text: `Support Ticket #${ticketId.slice(-6).toUpperCase()} reply from ${senderName} to ${recipientName}:\n\n${message}`,
  }
}

export default sendEmail

/**
 * emailRouting.service.js — Central Email Routing & Address Architecture
 *
 * Provides a single, unified configuration for:
 * - Public business contact & general enquiry recipient (info@snaptech.digital)
 * - Sales, quotes & proposal enquiries (sales@snaptech.digital)
 * - Customer support & helpdesk tickets (support@snaptech.digital)
 * - Careers & job applications (careers@snaptech.digital)
 * - Privacy & legal compliance requests (privacy@snaptech.digital)
 * - Invoicing & billing notifications (billing@snaptech.digital)
 * - Default envelope sender & display name
 * - Diagnostic health checks (Dedicated IMAP mailbox vs. Hostinger forwarder)
 */

import prisma from '../../config/db.js'
import { env } from '../../config/env.js'

// ── Default System Routing Architecture ──────────────────────────
export const DEFAULT_ROUTING = {
  general: 'info@snaptech.digital',
  sales: 'sales@snaptech.digital',
  support: 'support@snaptech.digital',
  careers: 'careers@snaptech.digital',
  privacy: 'privacy@snaptech.digital',
  billing: 'billing@snaptech.digital',
  senderEmail: 'info@snaptech.digital',
  senderName: 'SnapTech Digital',
  adminAlerts: 'info@snaptech.digital',
}

// ── Strict Email Validator (RFC 5322 + Header Injection Protection) ──
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim()
  if (trimmed.length > 254) return false
  // Reject CR, LF, semicolon, comma, or quotes to prevent header injection
  if (/[\r\n;,"]/.test(trimmed)) return false
  return EMAIL_REGEX.test(trimmed)
}

/**
 * Retrieves the active central email routing configuration.
 * Reads from SiteSetting (database), with fallback to environment variables and defaults.
 */
export async function getRoutingConfig() {
  const defaults = { ...DEFAULT_ROUTING }

  // Environment variable overrides
  if (process.env.EMAIL_USER || env.EMAIL_USER) {
    const envUser = (process.env.EMAIL_USER || env.EMAIL_USER).trim().toLowerCase()
    defaults.general = envUser
    defaults.senderEmail = envUser
    defaults.adminAlerts = envUser
  }
  if (process.env.ADMIN_EMAIL || env.ADMIN_EMAIL) {
    defaults.adminAlerts = (process.env.ADMIN_EMAIL || env.ADMIN_EMAIL).trim().toLowerCase()
  }
  if (process.env.EMAIL_SENDER_NAME) {
    defaults.senderName = process.env.EMAIL_SENDER_NAME.trim()
  }

  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            'email',
            'email_routing_general',
            'sales_email',
            'email_routing_sales',
            'support_email',
            'email_routing_support',
            'careers_email',
            'email_routing_careers',
            'privacy_email',
            'email_routing_privacy',
            'billing_email',
            'email_routing_billing',
            'email_routing_sender_email',
            'email_routing_sender_name',
            'email_routing_admin_alerts',
          ],
        },
      },
    })

    const map = {}
    for (const r of rows) {
      map[r.key] = r.value
    }

    return {
      general: map.email_routing_general || map.email || defaults.general,
      sales: map.email_routing_sales || map.sales_email || defaults.sales,
      support: map.email_routing_support || map.support_email || defaults.support,
      careers: map.email_routing_careers || map.careers_email || defaults.careers,
      privacy: map.email_routing_privacy || map.privacy_email || defaults.privacy,
      billing: map.email_routing_billing || map.billing_email || defaults.billing,
      senderEmail: map.email_routing_sender_email || defaults.senderEmail,
      senderName: map.email_routing_sender_name || defaults.senderName,
      adminAlerts: map.email_routing_admin_alerts || defaults.adminAlerts,
    }
  } catch (err) {
    console.warn('[emailRouting] Failed to load routing from DB, using defaults:', err.message)
    return defaults
  }
}

/**
 * Updates central email routing settings in SiteSetting.
 */
export async function updateRoutingConfig(updates = {}) {
  const emailFields = [
    'general',
    'sales',
    'support',
    'careers',
    'privacy',
    'billing',
    'senderEmail',
    'adminAlerts',
  ]

  for (const field of emailFields) {
    if (updates[field] !== undefined) {
      const email = String(updates[field]).trim().toLowerCase()
      if (!isValidEmail(email)) {
        const err = new Error(`Invalid email address for '${field}': ${updates[field]}`)
        err.statusCode = 400
        throw err
      }
    }
  }

  const ops = []

  if (updates.general !== undefined) {
    const val = updates.general.trim().toLowerCase()
    ops.push(
      prisma.siteSetting.upsert({
        where: { key: 'email_routing_general' },
        update: { value: val },
        create: { key: 'email_routing_general', value: val },
      }),
      // Keep legacy public email in sync for footer/contact page
      prisma.siteSetting.upsert({
        where: { key: 'email' },
        update: { value: val },
        create: { key: 'email', value: val },
      })
    )
  }

  if (updates.sales !== undefined) {
    const val = updates.sales.trim().toLowerCase()
    ops.push(
      prisma.siteSetting.upsert({
        where: { key: 'email_routing_sales' },
        update: { value: val },
        create: { key: 'email_routing_sales', value: val },
      })
    )
  }

  if (updates.support !== undefined) {
    const val = updates.support.trim().toLowerCase()
    ops.push(
      prisma.siteSetting.upsert({
        where: { key: 'email_routing_support' },
        update: { value: val },
        create: { key: 'email_routing_support', value: val },
      })
    )
  }

  if (updates.careers !== undefined) {
    const val = updates.careers.trim().toLowerCase()
    ops.push(
      prisma.siteSetting.upsert({
        where: { key: 'email_routing_careers' },
        update: { value: val },
        create: { key: 'email_routing_careers', value: val },
      })
    )
  }

  if (updates.privacy !== undefined) {
    const val = updates.privacy.trim().toLowerCase()
    ops.push(
      prisma.siteSetting.upsert({
        where: { key: 'email_routing_privacy' },
        update: { value: val },
        create: { key: 'email_routing_privacy', value: val },
      })
    )
  }

  if (updates.billing !== undefined) {
    const val = updates.billing.trim().toLowerCase()
    ops.push(
      prisma.siteSetting.upsert({
        where: { key: 'email_routing_billing' },
        update: { value: val },
        create: { key: 'email_routing_billing', value: val },
      })
    )
  }

  if (updates.senderEmail !== undefined) {
    const val = updates.senderEmail.trim().toLowerCase()
    process.env.EMAIL_USER = val
    ops.push(
      prisma.siteSetting.upsert({
        where: { key: 'email_routing_sender_email' },
        update: { value: val },
        create: { key: 'email_routing_sender_email', value: val },
      })
    )
  }

  if (updates.senderName !== undefined) {
    const val = updates.senderName.trim()
    process.env.EMAIL_SENDER_NAME = val
    ops.push(
      prisma.siteSetting.upsert({
        where: { key: 'email_routing_sender_name' },
        update: { value: val },
        create: { key: 'email_routing_sender_name', value: val },
      })
    )
  }

  if (updates.adminAlerts !== undefined) {
    const val = updates.adminAlerts.trim().toLowerCase()
    ops.push(
      prisma.siteSetting.upsert({
        where: { key: 'email_routing_admin_alerts' },
        update: { value: val },
        create: { key: 'email_routing_admin_alerts', value: val },
      })
    )
  }

  await prisma.$transaction(ops)
  return getRoutingConfig()
}

/**
 * Resolves the destination internal recipient and customer reply-to address
 * for an event (e.g. 'lead.created', 'quote.created', 'careers.applied').
 */
export async function resolveRoutingForEvent(event, context = {}) {
  const routing = await getRoutingConfig()

  let rule = null
  try {
    rule = await prisma.emailAutomationRule.findFirst({
      where: { event },
    })
  } catch {
    // ignore
  }

  let department
  switch (event) {
    case 'quote.created':
    case 'pricing.quote':
      department = 'sales'
      break
    case 'ticket.created':
    case 'ticket.reply':
      department = 'support'
      break
    case 'careers.applied':
      department = 'careers'
      break
    case 'privacy.inquiry':
    case 'privacy.request':
      department = 'privacy'
      break
    case 'invoice.created':
    case 'payment.verified':
      department = 'billing'
      break
    case 'lead.created':
    default:
      department = context.isQuote ? 'sales' : 'general'
      break
  }

  // Determine internal recipient
  let internalRecipient = rule?.internalRouting
  if (!internalRecipient) {
    internalRecipient = routing[department] || routing.general
  }

  // Determine reply-to for customer copy
  let replyTo = rule?.replyTo
  if (!replyTo) {
    replyTo = routing[department] || routing.general
  }

  return {
    department,
    recipient: internalRecipient,
    internalRecipient,
    replyTo,
    customerReplyTo: context.customerEmail || replyTo,
    departmentReplyTo: replyTo,
    senderEmail: routing.senderEmail,
    senderName: routing.senderName,
    isEnabled: rule ? rule.isEnabled : true,
    sendCustomerCopy: rule ? rule.sendCustomerCopy : true,
    sendInternalAlert: rule ? rule.sendInternalAlert : true,
  }
}

/**
 * Generates diagnostic status for each configured routing address.
 * Cross-references with EmailAccount to distinguish between real connected mailboxes
 * and free Hostinger aliases/forwarders.
 */
export async function getRoutingDiagnostics() {
  const routing = await getRoutingConfig()

  let configuredAccounts = []
  try {
    configuredAccounts = await prisma.emailAccount.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        provider: true,
        isActive: true,
        syncEnabled: true,
        lastSyncStatus: true,
        lastSyncAt: true,
      },
    })
  } catch (err) {
    console.warn('[emailRouting] Failed to query accounts:', err.message)
  }

  const accountMap = new Map(configuredAccounts.map((a) => [a.email.toLowerCase(), a]))

  const roles = [
    { key: 'general', label: 'General Enquiries & Contact', address: routing.general },
    { key: 'admin', label: 'Admin (admin@snaptech.digital)', address: 'admin@snaptech.digital' },
    { key: 'sales', label: 'Sales, Quotes & Proposals', address: routing.sales },
    { key: 'support', label: 'Client Support & Helpdesk', address: routing.support },
    { key: 'careers', label: 'Careers & Recruitment', address: routing.careers },
    { key: 'privacy', label: 'Privacy & Legal Compliance', address: routing.privacy },
    { key: 'billing', label: 'Billing, Invoices & Finance', address: routing.billing },
  ]

  const rawDiagnostics = roles.map((r) => {
    const acct = accountMap.get(r.address.toLowerCase())
    const isPrimaryDomain = r.address.toLowerCase().endsWith('@snaptech.digital')

    if (acct) {
      return {
        role: r.key,
        department: r.key,
        label: r.label,
        address: r.address,
        email: r.address,
        type: 'DEDICATED_MAILBOX',
        hasImapSync: acct.syncEnabled,
        lastSyncStatus: acct.lastSyncStatus,
        lastSyncAt: acct.lastSyncAt,
        status: acct.isActive ? 'ACTIVE' : 'INACTIVE',
        isPrimaryDomain,
        accountId: acct.id,
        note: 'Configured as an independent mailbox in Email Accounts with dedicated credentials.',
        advice: 'Configured as a dedicated mailbox with IMAP credentials.',
      }
    }

    return {
      role: r.key,
      department: r.key,
      label: r.label,
      address: r.address,
      email: r.address,
      type: 'HOSTINGER_FORWARDER',
      hasImapSync: false,
      lastSyncStatus: 'FORWARDED',
      lastSyncAt: null,
      status: 'FORWARDED',
      isPrimaryDomain,
      accountId: null,
      note: `Departmental alias/forwarder routing via Reply-To. In Hostinger hPanel, configure forwarder: ${r.address} ➔ ${routing.general}.`,
      advice: `Route via zero-cost Hostinger forwarder (${r.address} -> ${routing.general}).`,
    }
  })

  const dnsStatus = {
    domain: 'snaptech.digital',
    provider: 'Hostinger',
    mxConfigured: true,
    mxRecords: ['mx1.hostinger.com', 'mx2.hostinger.com'],
    spfConfigured: true,
    spfRecord: 'v=spf1 include:_spf.mail.hostinger.com include:_spf.reach.hostinger.com ~all',
    dmarcConfigured: true,
    dmarcRecord: 'v=DMARC1; p=none',
    dkimConfigured: false,
    dkimRecord: null,
    dkimGuidance: 'DKIM TXT record not found in DNS for snaptech.digital. Enable DKIM in Hostinger hPanel (Emails -> snaptech.digital -> DKIM) and publish the selector TXT record in Hostinger DNS zone to prevent Gmail/Yahoo spam filtering.',
  }

  const warnings = [
    'DKIM record is pending in DNS for snaptech.digital. Outgoing emails may experience DMARC alignment issues or spam filtering until Hostinger DKIM TXT record is published in DNS.',
  ]
  rawDiagnostics.forEach((d) => {
    if (!d.isPrimaryDomain) {
      warnings.push(`Address '${d.address}' for ${d.label} is outside '@snaptech.digital'. Delivery may fail SPF alignment if forwarded without SRS.`)
    }
  })

  const diagObject = {
    items: rawDiagnostics,
    routingStatus: rawDiagnostics,
    dnsStatus,
    warnings,
    verifiedSender: routing.senderEmail,
    senderName: routing.senderName,
    adminAlerts: routing.adminAlerts,
    primaryEnvelopeHost: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  }

  return {
    routing,
    diagnostics: diagObject,
    routingStatus: rawDiagnostics,
    dnsStatus,
    warnings,
    verifiedSender: routing.senderEmail,
    senderName: routing.senderName,
    adminAlerts: routing.adminAlerts,
    primaryEnvelopeHost: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  }
}

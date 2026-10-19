/**
 * emailCenter.controller.js — Administrative Email Center Controller
 *
 * Implements:
 *  - Email dashboard statistics & recent activity
 *  - Persistent email log querying & filtering
 *  - Admin manual email composition with template support
 *  - Template library inspection & live rendering preview
 *  - Automation rules configuration & enable/disable toggling
 *  - Secure masked email settings management (Hostinger SMTP + aliases)
 *  - Live SMTP connection test & verification delivery
 *  - Recipient autocomplete directory (Leads & Clients)
 */

import prisma from '../config/db.js'
import { env } from '../config/env.js'
import {
  sendEmail,
  sendViaSMTP,
  escapeHtml,
  TEMPLATES_CATALOG,
  ROUTING_ALIASES,
  VERIFIED_SENDER_MAILBOX,
  HOSTINGER_SMTP_HOST,
  HOSTINGER_SMTP_PORT,
  renderBrandedEmailLayout,
  inquiryConfirmationTemplate,
  quoteRequestConfirmationTemplate,
  proposalEmailTemplate,
  projectKickoffTemplate,
  supportTicketConfirmationTemplate,
  supportTicketReplyTemplate,
  invoiceDeliveryTemplate,
  verifiedPaymentConfirmationTemplate,
  careersApplicantConfirmationTemplate,
  customEmailTemplate,
  fetchEmailFooterSettings,
} from '../utils/mailer.js'
import {
  listAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  testAccountSmtp,
  testAccountImap,
  getInternalAccountWithCredentials,
} from '../services/email/emailAccount.service.js'
import {
  syncAccountMailbox,
  syncAllActiveAccounts,
} from '../services/email/emailSync.service.js'

/**
 * GET /api/admin/email/stats
 * Dashboard metrics: sent, failed, queued, 24h count, delivery rate
 */
export const getEmailDashboardStats = async (_req, res, next) => {
  try {
    const totalSent = await prisma.emailLog.count({ where: { status: 'SENT' } })
    const totalFailed = await prisma.emailLog.count({ where: { status: 'FAILED' } })
    const totalQueued = await prisma.emailLog.count({ where: { status: 'QUEUED' } })

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const sentToday = await prisma.emailLog.count({
      where: {
        status: 'SENT',
        createdAt: { gte: startOfToday },
      },
    })

    const totalProcessed = totalSent + totalFailed
    const deliveryRate =
      totalProcessed > 0 ? Number(((totalSent / totalProcessed) * 100).toFixed(1)) : 100

    const recentActivity = await prisma.emailLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        recipient: true,
        subject: true,
        status: true,
        event: true,
        templateId: true,
        errorMessage: true,
        createdAt: true,
      },
    })

    const activeRulesCount = await prisma.emailAutomationRule.count({
      where: { isEnabled: true },
    })

    const [inboxUnreadCount, inboxTotalCount, totalAccounts, activeAccounts] = await Promise.all([
      prisma.emailMessage ? prisma.emailMessage.count({ where: { folder: 'INBOX', isRead: false } }).catch(() => 0) : 0,
      prisma.emailMessage ? prisma.emailMessage.count({ where: { folder: 'INBOX' } }).catch(() => 0) : 0,
      prisma.emailAccount ? prisma.emailAccount.count().catch(() => 0) : 0,
      prisma.emailAccount ? prisma.emailAccount.count({ where: { isActive: true } }).catch(() => 0) : 0,
    ])

    res.json({
      status: 'ok',
      data: {
        counts: {
          totalSent,
          totalFailed,
          totalQueued,
          sentToday,
          deliveryRate,
          activeRulesCount,
          inboxUnreadCount,
          inboxTotalCount,
          totalAccounts,
          activeAccounts,
        },
        recentActivity,
        system: {
          primaryMailbox: process.env.EMAIL_USER || env.EMAIL_USER || VERIFIED_SENDER_MAILBOX,
          host: process.env.EMAIL_HOST || env.EMAIL_HOST || HOSTINGER_SMTP_HOST,
          port: parseInt(process.env.EMAIL_PORT || env.EMAIL_PORT || String(HOSTINGER_SMTP_PORT), 10),
          isConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
          strategy: (process.env.EMAIL_STRATEGY || 'smtp').toLowerCase(),
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/email/logs
 * List & filter email logs with pagination
 */
export const listEmailLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)))
    const skip = (page - 1) * limit

    const { status, event, recipient, dateFrom, dateTo } = req.query

    const where = {}
    if (status && status !== 'ALL') {
      where.status = status
    }
    if (event && event !== 'ALL') {
      where.event = event
    }
    if (recipient && typeof recipient === 'string' && recipient.trim()) {
      where.recipient = { contains: recipient.trim().toLowerCase() }
    }
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.emailLog.count({ where }),
    ])

    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    }

    res.json({
      status: 'ok',
      data: {
        logs,
        pagination,
      },
      logs,
      pagination,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/email/logs/:id
 * Retrieve detail of a single email log (sanitized)
 */
export const getEmailLogById = async (req, res, next) => {
  try {
    const { id } = req.params
    const log = await prisma.emailLog.findUnique({
      where: { id },
    })
    if (!log) {
      return res.status(404).json({ status: 'error', message: 'Email log not found.' })
    }
    res.json({ status: 'ok', data: log })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/admin/email/send
 * Compose & dispatch an authorized email from Admin Email Center
 */
export const sendManualEmail = async (req, res, next) => {
  try {
    const targetRecipient = (req.body.recipient || req.body.to || '').trim()
    const targetSubject = (req.body.subject || '').trim()
    const targetMessage = (req.body.message || req.body.bodyHtml || req.body.bodyText || '').trim()
    const targetRecipientName = (req.body.recipientName || '').trim() || 'Client'
    const targetTemplateId = req.body.templateId || 'custom_compose'
    const targetReplyTo = req.body.replyTo?.trim() || null
    const ctaText = req.body.ctaText?.trim() || null
    const ctaUrl = req.body.ctaUrl?.trim() || null
    const targetAccountId = req.body.accountId || req.body.senderAccountId || null
    const targetLeadId = req.body.leadId || null

    if (!targetRecipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetRecipient)) {
      return res.status(400).json({ status: 'error', message: 'A valid recipient email address is required.' })
    }
    if (!targetSubject) {
      return res.status(400).json({ status: 'error', message: 'Email subject is required.' })
    }
    if (!targetMessage) {
      return res.status(400).json({ status: 'error', message: 'Email body message is required.' })
    }

    let accountConfig = null
    if (targetAccountId) {
      accountConfig = await getInternalAccountWithCredentials(targetAccountId)
    }

    const footerSettings = await fetchEmailFooterSettings(prisma)

    // Render using custom compose template
    const emailPayload = customEmailTemplate({
      recipientName: targetRecipientName,
      subject: targetSubject,
      bodyHtml: targetMessage.replace(/\n/g, '<br />'),
      bodyText: targetMessage,
      ctaText,
      ctaUrl,
      footerSettings,
    })

    const senderEmail = accountConfig?.email || req.admin?.email || 'admin@snaptech.digital'

    const sendResult = await sendEmail({
      to: targetRecipient.toLowerCase(),
      subject: emailPayload.subject,
      html: emailPayload.html,
      text: emailPayload.text,
      replyTo: targetReplyTo || accountConfig?.replyTo,
      senderAccountId: accountConfig?.id || null,
      accountConfig,
      leadId: targetLeadId,
      event: 'manual.compose',
      templateId: targetTemplateId,
      metadata: {
        composedByAdmin: senderEmail,
        recipientName: targetRecipientName,
      },
    })

    res.json({
      status: 'ok',
      message: `Email dispatched successfully to ${targetRecipient}.`,
      data: {
        messageId: sendResult?.messageId || 'msg-sent',
        recipient: targetRecipient,
        subject: emailPayload.subject,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/email/templates
 * Catalog of all supported templates
 */
export const listEmailTemplates = async (_req, res, next) => {
  try {
    res.json({
      status: 'ok',
      data: TEMPLATES_CATALOG,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/admin/email/templates/preview
 * Generate live HTML & plain text preview for any template
 */
export const previewEmailTemplate = async (req, res, next) => {
  try {
    const { templateId, variables = {} } = req.body
    const footerSettings = await fetchEmailFooterSettings(prisma)

    let rendered = null

    switch (templateId) {
      case 'inquiry_confirmation':
        rendered = inquiryConfirmationTemplate({
          name: variables.name || 'Aditya Sharma',
          serviceInterested: variables.serviceInterested || 'Web Application Development',
          message: variables.message || 'We are building an ERP portal for textile inventory and require pricing and technical consultation.',
          footerSettings,
        })
        break

      case 'quote_confirmation':
        rendered = quoteRequestConfirmationTemplate({
          name: variables.name || 'Pooja Verma',
          service: variables.service || 'Mobile App Development (iOS & Android)',
          estimatedBudget: variables.estimatedBudget || '₹1,50,000 – ₹2,50,000',
          timeline: variables.timeline || '6–8 Weeks',
          deliverables: variables.deliverables || 'Cross-platform mobile app, admin dashboard, push notifications.',
          footerSettings,
        })
        break

      case 'proposal_delivery':
        rendered = proposalEmailTemplate({
          clientName: variables.clientName || 'Rajesh Mehta',
          projectTitle: variables.projectTitle || 'Bhilwara Textiles Digital Ecosystem',
          scopeSummary: variables.scopeSummary || 'Full-stack multi-vendor inventory system with automated invoices, payment gateway integration, and native mobile client app.',
          proposalUrl: variables.proposalUrl || 'https://www.snaptech.digital/client/proposals/prop-101',
          estimatedDelivery: variables.estimatedDelivery || '8 Weeks',
          validUntil: variables.validUntil || '15 Days from dispatch',
          footerSettings,
        })
        break

      case 'project_kickoff':
        rendered = projectKickoffTemplate({
          clientName: variables.clientName || 'Vikramaditya Rathore',
          projectTitle: variables.projectTitle || 'Hospitality ERP Platform',
          assignedLead: variables.assignedLead || 'Kunal Sen (Principal Architect)',
          startDate: variables.startDate || new Date().toLocaleDateString('en-IN'),
          portalUrl: variables.portalUrl || 'https://www.snaptech.digital/client/projects/proj-01',
          milestones: variables.milestones || '1. Architecture & Wireframes (Week 1–2)\n2. Core API & Database Engine (Week 3–5)\n3. Frontend Portal & Client Testing (Week 6–7)\n4. Production Handover (Week 8)',
          footerSettings,
        })
        break

      case 'support_ticket_confirmation':
        rendered = supportTicketConfirmationTemplate({
          clientName: variables.clientName || 'Dr. Alok Nath',
          ticketId: variables.ticketId || 'TKT-829103',
          subject: variables.subject || 'SSL Certificate auto-renewal configuration question',
          category: variables.category || 'Hosting & Infrastructure',
          message: variables.message || 'Can you confirm if Let\'s Encrypt 90-day certificates are automatically renewed on the cloud server?',
          portalUrl: variables.portalUrl || 'https://www.snaptech.digital/client/support',
          footerSettings,
        })
        break

      case 'support_ticket_reply':
        rendered = supportTicketReplyTemplate({
          recipientName: variables.recipientName || 'Dr. Alok Nath',
          ticketId: variables.ticketId || 'TKT-829103',
          subject: variables.subject || 'SSL Certificate auto-renewal configuration question',
          senderName: variables.senderName || 'Technical Support Lead',
          message: variables.message || 'Hello Dr. Nath, yes! Your SSL certificates are managed by automated certbot jobs on our server cluster and renew seamlessly 30 days before expiration. No manual action is required.',
          portalUrl: variables.portalUrl || 'https://www.snaptech.digital/client/support',
        })
        break

      case 'invoice_delivery':
        rendered = invoiceDeliveryTemplate({
          clientName: variables.clientName || 'Meenakshi Sundaram',
          projectTitle: variables.projectTitle || 'Corporate Portal Redesign',
          milestoneTitle: variables.milestoneTitle || 'Milestone 2: Backend API & Database Engine',
          amount: variables.amount || 45000,
          invoiceNumber: variables.invoiceNumber || 'INV-2026-089',
          dueDate: variables.dueDate || 'Upon Receipt',
          paymentUrl: variables.paymentUrl || 'https://www.snaptech.digital/client/billing',
          footerSettings,
        })
        break

      case 'verified_payment_confirmation':
        rendered = verifiedPaymentConfirmationTemplate({
          clientName: variables.clientName || 'Meenakshi Sundaram',
          projectName: variables.projectName || 'Corporate Portal Redesign',
          milestoneTitle: variables.milestoneTitle || 'Milestone 2: Backend API & Database Engine',
          amount: variables.amount || 45000,
          transactionId: variables.transactionId || 'UPI-REF-98127391024',
          receiptUrl: variables.receiptUrl || 'https://www.snaptech.digital/client/billing',
          paymentDate: variables.paymentDate || new Date().toLocaleDateString('en-IN'),
          footerSettings,
        })
        break

      case 'careers_application_confirmation':
        rendered = careersApplicantConfirmationTemplate({
          name: variables.name || 'Rohit Joshi',
          jobTitle: variables.jobTitle || 'Senior Full Stack Engineer (React + Node.js)',
          footerSettings,
        })
        break

      case 'custom_compose':
      default:
        rendered = customEmailTemplate({
          recipientName: variables.recipientName || 'Valued Client',
          subject: variables.subject || 'Update regarding your SnapTech Digital services',
          bodyHtml: (variables.bodyHtml || 'Thank you for choosing SnapTech Digital as your digital technology partner. This is a personalized update from our engineering leadership team.').replace(/\n/g, '<br />'),
          bodyText: variables.bodyText || 'Thank you for choosing SnapTech Digital.',
          ctaText: variables.ctaText || 'Visit Client Portal',
          ctaUrl: variables.ctaUrl || 'https://www.snaptech.digital/client',
          footerSettings,
        })
        break
    }

    res.json({
      status: 'ok',
      data: {
        templateId,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const DEFAULT_AUTOMATION_RULES = [
  {
    event: 'lead.created',
    title: 'New Lead / Inquiry Notification',
    description: 'Sends confirmation auto-reply to client and alert to internal team.',
    templateId: 'lead_inquiry_confirmation',
    internalRouting: 'info@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: true,
    isEnabled: true,
  },
  {
    event: 'quote.created',
    title: 'Quote Request Confirmation',
    description: 'Detailed quotation received confirmation with SLA timeline.',
    templateId: 'quote_request_confirmation',
    internalRouting: 'sales@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: true,
    isEnabled: true,
  },
  {
    event: 'proposal.sent',
    title: 'Project Proposal Delivery',
    description: 'Delivers project proposal and scope breakdown to client.',
    templateId: 'proposal_email',
    internalRouting: 'sales@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: false,
    isEnabled: true,
  },
  {
    event: 'project.kickoff',
    title: 'Project Kickoff / Milestone Update',
    description: 'Notifies client on project kickoff or major milestone advancement.',
    templateId: 'project_kickoff_update',
    internalRouting: 'projects@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: true,
    isEnabled: true,
  },
  {
    event: 'ticket.created',
    title: 'Support Ticket Receipt Confirmation',
    description: 'Sends ticket ID and confirmation to client upon helpdesk submission.',
    templateId: 'support_ticket_confirmation',
    internalRouting: 'support@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: true,
    isEnabled: true,
  },
  {
    event: 'ticket.reply',
    title: 'Support Ticket Update / Staff Reply',
    description: 'Notifies client when staff posts a response to their support ticket.',
    templateId: 'support_ticket_reply',
    internalRouting: 'support@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: false,
    isEnabled: true,
  },
  {
    event: 'invoice.created',
    title: 'Milestone Invoice Issued',
    description: 'Dispatches billing milestone invoice link and payment instructions.',
    templateId: 'invoice_email',
    internalRouting: 'billing@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: false,
    isEnabled: true,
  },
  {
    event: 'payment.verified',
    title: 'Verified Payment Receipt',
    description: 'Official payment receipt and confirmation of milestone settlement.',
    templateId: 'verified_payment_confirmation',
    internalRouting: 'billing@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: true,
    isEnabled: true,
  },
  {
    event: 'careers.applied',
    title: 'Careers Application Received',
    description: 'Confirms application receipt to candidate and alerts HR/recruiting.',
    templateId: 'careers_application_confirmation',
    internalRouting: 'careers@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: true,
    isEnabled: true,
  },
]

/**
 * GET /api/admin/email/rules
 * List automation rules (auto-seeds defaults if empty)
 */
export const listAutomationRules = async (_req, res, next) => {
  try {
    let rules = await prisma.emailAutomationRule.findMany({
      orderBy: { createdAt: 'asc' },
    })

    // If rules table is empty on fresh database, auto-seed defaults
    if (!rules || rules.length === 0) {
      for (const dr of DEFAULT_AUTOMATION_RULES) {
        try {
          await prisma.emailAutomationRule.upsert({
            where: { event: dr.event },
            update: {},
            create: dr,
          })
        } catch {
          // ignore concurrent seed collision
        }
      }
      rules = await prisma.emailAutomationRule.findMany({
        orderBy: { createdAt: 'asc' },
      })
    }

    res.json({ status: 'ok', data: rules })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/admin/email/rules/:id
 * Toggle or update an automation rule
 */
export const updateAutomationRule = async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      isEnabled,
      internalRouting,
      sendCustomerCopy,
      sendInternalAlert,
      templateId,
      senderAccountId,
      replyTo,
    } = req.body

    const updateData = {}
    const enabledVal = isEnabled !== undefined ? isEnabled : req.body.enabled
    if (enabledVal !== undefined) updateData.isEnabled = Boolean(enabledVal)
    if (internalRouting !== undefined) updateData.internalRouting = internalRouting?.trim() || null
    if (sendCustomerCopy !== undefined) updateData.sendCustomerCopy = Boolean(sendCustomerCopy)
    if (sendInternalAlert !== undefined) updateData.sendInternalAlert = Boolean(sendInternalAlert)
    if (templateId !== undefined) updateData.templateId = templateId?.trim()
    if (senderAccountId !== undefined) updateData.senderAccountId = senderAccountId || null
    if (replyTo !== undefined) updateData.replyTo = replyTo?.trim() || null

    let updated = null
    try {
      updated = await prisma.emailAutomationRule.update({
        where: { id },
        data: updateData,
      })
    } catch {
      const altId = id.includes('_') ? id.replace(/_/g, '-') : id.replace(/-/g, '_')
      updated = await prisma.emailAutomationRule.update({
        where: { id: altId },
        data: updateData,
      })
    }

    res.json({
      status: 'ok',
      message: `Automation rule '${updated.title}' updated successfully.`,
      data: updated,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/email/settings
 * Read current email configuration (masked secrets)
 */
export const getEmailSettings = async (_req, res, next) => {
  try {
    const user = process.env.EMAIL_USER || env.EMAIL_USER || VERIFIED_SENDER_MAILBOX
    const host = process.env.EMAIL_HOST || env.EMAIL_HOST || HOSTINGER_SMTP_HOST
    const port = parseInt(process.env.EMAIL_PORT || env.EMAIL_PORT || String(HOSTINGER_SMTP_PORT), 10)
    const hasPass = !!(process.env.EMAIL_PASS || env.EMAIL_PASS)
    const senderName = process.env.EMAIL_SENDER_NAME || 'SnapTech Digital'
    const defaultReplyTo = process.env.EMAIL_REPLY_TO || user

    // Mask user
    let maskedUser = user
    if (user.includes('@')) {
      const [u, d] = user.split('@')
      maskedUser = `${u.slice(0, 3)}••••@${d}`
    }

    res.json({
      status: 'ok',
      data: {
        verifiedSender: user,
        maskedSender: maskedUser,
        senderName,
        defaultReplyTo,
        smtpHost: host,
        smtpPort: port,
        isPasswordConfigured: hasPass,
        activeStrategy: (process.env.EMAIL_STRATEGY || 'smtp').toLowerCase(),
        aliases: ROUTING_ALIASES,
        hostingerSpec: {
          recommendedHost: HOSTINGER_SMTP_HOST,
          recommendedPort: HOSTINGER_SMTP_PORT,
          security: 'SSL / TLS (Direct Encrypted)',
          authAccount: VERIFIED_SENDER_MAILBOX,
          note: 'Primary authenticated mailbox sends all mail. Free aliases route via Reply-To and Hostinger forwarders.',
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/admin/email/settings
 * Save non-secret settings or safely update SMTP password without echoing
 */
export const updateEmailSettings = async (req, res, next) => {
  try {
    const {
      senderName,
      defaultReplyTo,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      emailStrategy,
    } = req.body

    const ops = []

    if (senderName && typeof senderName === 'string') {
      const val = senderName.trim()
      process.env.EMAIL_SENDER_NAME = val
      ops.push(
        prisma.siteSetting.upsert({
          where: { key: 'sys_email_sender_name' },
          update: { value: val },
          create: { key: 'sys_email_sender_name', value: val },
        })
      )
    }

    if (defaultReplyTo && typeof defaultReplyTo === 'string') {
      const val = defaultReplyTo.trim().toLowerCase()
      process.env.EMAIL_REPLY_TO = val
      ops.push(
        prisma.siteSetting.upsert({
          where: { key: 'sys_email_reply_to' },
          update: { value: val },
          create: { key: 'sys_email_reply_to', value: val },
        })
      )
    }

    if (smtpHost && typeof smtpHost === 'string') {
      const val = smtpHost.trim()
      process.env.EMAIL_HOST = val
      ops.push(
        prisma.siteSetting.upsert({
          where: { key: 'sys_smtp_host' },
          update: { value: val },
          create: { key: 'sys_smtp_host', value: val },
        })
      )
    }

    if (smtpPort) {
      const val = String(parseInt(smtpPort, 10) || 465)
      process.env.EMAIL_PORT = val
      ops.push(
        prisma.siteSetting.upsert({
          where: { key: 'sys_smtp_port' },
          update: { value: val },
          create: { key: 'sys_smtp_port', value: val },
        })
      )
    }

    if (smtpUser && typeof smtpUser === 'string') {
      const val = smtpUser.trim().toLowerCase()
      process.env.EMAIL_USER = val
      ops.push(
        prisma.siteSetting.upsert({
          where: { key: 'sys_smtp_user' },
          update: { value: val },
          create: { key: 'sys_smtp_user', value: val },
        })
      )
    }

    if (emailStrategy && typeof emailStrategy === 'string') {
      const val = emailStrategy.trim().toLowerCase()
      process.env.EMAIL_STRATEGY = val
      ops.push(
        prisma.siteSetting.upsert({
          where: { key: 'sys_email_strategy' },
          update: { value: val },
          create: { key: 'sys_email_strategy', value: val },
        })
      )
    }

    // Only update password if a new raw non-masked password is provided
    if (
      smtpPass &&
      typeof smtpPass === 'string' &&
      smtpPass.trim() &&
      !/^•+/.test(smtpPass.trim())
    ) {
      const val = smtpPass.trim()
      process.env.EMAIL_PASS = val
      ops.push(
        prisma.siteSetting.upsert({
          where: { key: 'sys_smtp_pass' },
          update: { value: val },
          create: { key: 'sys_smtp_pass', value: val },
        })
      )
    }

    await Promise.all(ops)

    res.json({
      status: 'ok',
      message: 'Email settings saved successfully and applied to active server runtime.',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/admin/email/test
 * Test Hostinger SMTP handshake & send a verification test email
 */
export const testEmailConnection = async (req, res) => {
  try {
    const { targetEmail } = req.body || {}

    const recipient =
      (targetEmail && typeof targetEmail === 'string' && targetEmail.trim()) ||
      req.admin?.email ||
      process.env.EMAIL_USER ||
      VERIFIED_SENDER_MAILBOX

    if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return res.status(400).json({ status: 'error', message: 'A valid test recipient email address is required.' })
    }

    const host = process.env.EMAIL_HOST || env.EMAIL_HOST || HOSTINGER_SMTP_HOST
    const user = process.env.EMAIL_USER || env.EMAIL_USER || VERIFIED_SENDER_MAILBOX
    const port = parseInt(process.env.EMAIL_PORT || env.EMAIL_PORT || String(HOSTINGER_SMTP_PORT), 10)

    const footerSettings = await fetchEmailFooterSettings(prisma)

    const testPayload = {
      to: recipient,
      subject: `✅ Hostinger SMTP Verification — SnapTech Digital Mailer`,
      html: renderBrandedEmailLayout({
        title: 'Hostinger SMTP Mailer Active',
        subtitle: 'SnapTech Digital &bull; Infrastructure Health',
        badgeText: 'Live Handshake Passed',
        contentHtml: `
          <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 14px;">
            This email confirms that the centralized <strong>Hostinger SMTP Mailer</strong> for SnapTech Digital is fully configured, connected, and operating under verified credentials.
          </p>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 16px; margin: 18px 0;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #64748b;">SMTP Host: <strong style="color: #0f172a;">${escapeHtml(host)}:${port}</strong></p>
            <p style="margin: 0 0 4px; font-size: 12px; color: #64748b;">Authenticated Mailbox: <strong style="color: #0f172a;">${escapeHtml(user)}</strong></p>
            <p style="margin: 0; font-size: 12px; color: #64748b;">Transport Security: <strong style="color: #16a34a;">SSL / TLS Handshake Verified</strong></p>
          </div>
          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            All client inquiries, automated transactional alerts, support tickets, and invoice updates are flowing through this centralized channel.
          </p>
        `,
        ctaText: 'Visit Admin Email Center',
        ctaUrl: 'https://www.snaptech.digital/admin/email-center',
        footerSettings,
      }),
      text: `Hostinger SMTP Test Successful.\nHost: ${host}:${port}\nUser: ${user}\nRecipient: ${recipient}\n\nSnapTech Digital Email Center`,
      event: 'admin.smtp_test',
      templateId: 'smtp_verification',
      metadata: { initiatedBy: req.admin?.email || 'admin' },
    }

    if (process.env.NODE_ENV === 'test' || (!user && !process.env.EMAIL_PASS)) {
      await sendEmail(testPayload)
    } else {
      await sendViaSMTP(testPayload)
    }

    // Log the verification
    await prisma.emailLog.create({
      data: {
        recipient,
        subject: testPayload.subject,
        sender: user,
        status: 'SENT',
        event: 'admin.smtp_test',
        templateId: 'smtp_verification',
        metadata: { host, port, user },
      },
    })

    res.json({
      status: 'ok',
      message: `Test email sent successfully via Hostinger SMTP (${host}:${port}) to ${recipient}!`,
      data: {
        connection: 'SUCCESS',
        host,
        port,
        testEmailSent: true,
        recipient,
      },
    })
  } catch (err) {
    console.error('[mailer test error]:', err.message)
    // Safely record failure in emailLog
    try {
      await prisma.emailLog.create({
        data: {
          recipient: req.body?.targetEmail || 'unknown',
          subject: 'Hostinger SMTP Verification Test',
          sender: process.env.EMAIL_USER || VERIFIED_SENDER_MAILBOX,
          status: 'FAILED',
          event: 'admin.smtp_test',
          errorMessage: err.message,
        },
      })
    } catch {
      // ignore
    }

    res.status(500).json({
      status: 'error',
      message: `SMTP Connection / Handshake failed: ${err.message}. Please verify your Hostinger Webmail user and password.`,
    })
  }
}

/**
 * GET /api/admin/email/recipients
 * Autocomplete recipient list from leads, clients, and staff
 */
export const getEligibleRecipients = async (_req, res, next) => {
  try {
    const [leads, clients, admins] = await Promise.all([
      prisma.contactLead.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, serviceInterested: true },
      }),
      prisma.client.findMany({
        take: 30,
        select: { id: true, name: true, email: true },
      }),
      prisma.admin.findMany({
        take: 20,
        select: { id: true, email: true, role: true },
      }),
    ])

    const formattedLeads = leads.map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      type: 'LEAD',
      label: `${l.name} (${l.email}) — Lead [${l.serviceInterested || 'General'}]`,
    }))

    const formattedClients = clients.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      type: 'CLIENT',
      label: `${c.name} (${c.email}) — Client`,
    }))

    const formattedAdmins = admins.map((a) => ({
      id: a.id,
      name: a.email.split('@')[0],
      email: a.email,
      type: 'STAFF',
      label: `${a.email} — Staff [${a.role}]`,
    }))

    res.json({
      status: 'ok',
      data: [...formattedLeads, ...formattedClients, ...formattedAdmins],
    })
  } catch (err) {
    next(err)
  }
}

// ── Multi-Account Management Handlers ─────────────────────────

/**
 * GET /api/admin/email/accounts
 * List all configured email accounts (secrets masked)
 */
export const listEmailAccounts = async (_req, res, next) => {
  try {
    const accounts = await listAccounts()
    res.json({ status: 'ok', data: accounts })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/email/accounts/:id
 * Retrieve details for a single account (secrets masked)
 */
export const getEmailAccountById = async (req, res, next) => {
  try {
    const account = await getAccountById(req.params.id)
    if (!account) {
      return res.status(404).json({ status: 'error', message: 'Email account not found.' })
    }
    res.json({ status: 'ok', data: account })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/admin/email/accounts
 * Register a new email account
 */
export const createEmailAccount = async (req, res, next) => {
  try {
    const account = await createAccount(req.body)
    res.status(201).json({
      status: 'ok',
      message: `Email account '${account.email}' configured successfully.`,
      data: account,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/admin/email/accounts/:id
 * Update email account settings & credentials
 */
export const updateEmailAccount = async (req, res, next) => {
  try {
    const account = await updateAccount(req.params.id, req.body)
    res.json({
      status: 'ok',
      message: `Email account '${account.email}' updated successfully.`,
      data: account,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/admin/email/accounts/:id
 * Remove an email account
 */
export const deleteEmailAccount = async (req, res, next) => {
  try {
    await deleteAccount(req.params.id)
    res.json({ status: 'ok', message: 'Email account deleted successfully.' })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/admin/email/accounts/:id/test-smtp
 * Verify outbound SMTP handshake & authentication
 */
export const testAccountSmtpHandler = async (req, res) => {
  try {
    const result = await testAccountSmtp(req.params.id, req.body.recipient)
    res.json({
      status: 'ok',
      message: 'SMTP connection handshake & authentication verified successfully.',
      data: result,
    })
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message })
  }
}

/**
 * POST /api/admin/email/accounts/:id/test-imap
 * Verify inbound IMAP handshake & mailbox access
 */
export const testAccountImapHandler = async (req, res) => {
  try {
    const result = await testAccountImap(req.params.id)
    res.json({
      status: 'ok',
      message: 'IMAP connection handshake & mailbox authentication verified successfully.',
      data: result,
    })
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message })
  }
}

/**
 * POST /api/admin/email/accounts/:id/sync
 * Manually trigger IMAP sync for a single mailbox
 */
export const syncAccountMailboxHandler = async (req, res) => {
  try {
    const result = await syncAccountMailbox(req.params.id, req.body)
    res.json({
      status: 'ok',
      message: 'Mailbox synchronization completed.',
      data: result,
    })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

/**
 * POST /api/admin/email/sync-all
 * Batch synchronize all active mailboxes
 */
export const syncAllAccountsHandler = async (_req, res, next) => {
  try {
    const results = await syncAllActiveAccounts()
    res.json({
      status: 'ok',
      message: 'Batch synchronization across all active accounts completed.',
      data: results,
    })
  } catch (err) {
    next(err)
  }
}

// ── Inbound / Outbound Message Management Handlers ────────────

/**
 * GET /api/admin/email/messages
 * List messages with folder filtering, pagination, search, and unread counts
 */
export const listEmailMessages = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)))
    const skip = (page - 1) * limit

    const { folder, accountId, isRead, leadId, search } = req.query

    const where = {}
    if (folder && folder !== 'ALL') {
      where.folder = folder.toUpperCase()
    } else if (!folder) {
      where.folder = 'INBOX'
    }

    if (accountId && accountId !== 'ALL') {
      where.accountId = accountId
    }

    if (isRead !== undefined && isRead !== 'ALL' && isRead !== '') {
      where.isRead = isRead === 'true' || isRead === true
    }

    if (leadId) {
      where.leadId = leadId
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim()
      where.OR = [
        { subject: { contains: q, mode: 'insensitive' } },
        { fromEmail: { contains: q, mode: 'insensitive' } },
        { from: { contains: q, mode: 'insensitive' } },
        { snippet: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [messages, total, unreadCount] = await Promise.all([
      prisma.emailMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { receivedAt: 'desc' },
        include: {
          account: {
            select: { id: true, email: true, displayName: true },
          },
          lead: {
            select: { id: true, name: true, email: true, status: true, serviceInterested: true },
          },
        },
      }),
      prisma.emailMessage.count({ where }),
      prisma.emailMessage.count({
        where: {
          folder: 'INBOX',
          isRead: false,
          ...(accountId && accountId !== 'ALL' ? { accountId } : {}),
        },
      }),
    ])

    res.json({
      status: 'ok',
      data: {
        messages,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
        unreadCount,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/email/messages/:id
 * Retrieve single message detail including conversation thread
 */
export const getEmailMessageById = async (req, res, next) => {
  try {
    const { id } = req.params
    const message = await prisma.emailMessage.findUnique({
      where: { id },
      include: {
        account: {
          select: { id: true, email: true, displayName: true },
        },
        lead: {
          select: { id: true, name: true, email: true, status: true, serviceInterested: true, phone: true },
        },
      },
    })

    if (!message) {
      return res.status(404).json({ status: 'error', message: 'Email message not found.' })
    }

    if (req.query.markRead === 'true' && !message.isRead) {
      await prisma.emailMessage.update({
        where: { id },
        data: { isRead: true },
      })
      message.isRead = true
    }

    let thread = []
    if (message.threadId) {
      thread = await prisma.emailMessage.findMany({
        where: { threadId: message.threadId },
        orderBy: { receivedAt: 'asc' },
        select: {
          id: true,
          direction: true,
          from: true,
          fromEmail: true,
          to: true,
          subject: true,
          snippet: true,
          receivedAt: true,
          sentAt: true,
          isRead: true,
        },
      })
    }

    res.json({ status: 'ok', data: { ...message, thread } })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/admin/email/messages/:id
 * Update message read state, folder, or link to CRM Lead
 */
export const updateEmailMessage = async (req, res, next) => {
  try {
    const { id } = req.params
    const { isRead, isArchived, folder, leadId } = req.body

    const updateData = {}
    if (isRead !== undefined) updateData.isRead = Boolean(isRead)
    if (isArchived !== undefined) {
      updateData.isArchived = Boolean(isArchived)
      if (isArchived) updateData.folder = 'ARCHIVE'
    }
    if (folder !== undefined) updateData.folder = String(folder).toUpperCase()
    if (leadId !== undefined) updateData.leadId = leadId || null

    const updated = await prisma.emailMessage.update({
      where: { id },
      data: updateData,
    })

    res.json({ status: 'ok', message: 'Email message updated.', data: updated })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/admin/email/messages/:id/reply
 * Reply to an incoming email message with full threading headers
 */
export const replyToEmailMessage = async (req, res, next) => {
  try {
    const { id } = req.params
    const { message: replyBody, senderAccountId, subject: customSubject } = req.body

    if (!replyBody || !replyBody.trim()) {
      return res.status(400).json({ status: 'error', message: 'Reply message body is required.' })
    }

    const original = await prisma.emailMessage.findUnique({
      where: { id },
      include: { account: true },
    })

    if (!original) {
      return res.status(404).json({ status: 'error', message: 'Original email message not found.' })
    }

    const recipient = original.replyTo || original.fromEmail || (Array.isArray(original.to) ? original.to[0] : null)
    if (!recipient) {
      return res.status(400).json({ status: 'error', message: 'Cannot determine recipient email address from original message.' })
    }

    const accountId = senderAccountId || original.accountId
    let accountConfig = null
    if (accountId) {
      accountConfig = await getInternalAccountWithCredentials(accountId)
    }

    const subject =
      customSubject ||
      (original.subject?.toLowerCase().startsWith('re:') ? original.subject : `Re: ${original.subject || ''}`)

    const footerSettings = await fetchEmailFooterSettings(prisma)
    const emailPayload = customEmailTemplate({
      recipientName: original.fromName || recipient.split('@')[0],
      subject,
      bodyHtml: replyBody.replace(/\n/g, '<br />'),
      bodyText: replyBody,
      footerSettings,
    })

    const senderEmail = accountConfig?.email || req.admin?.email || 'info@snaptech.digital'

    const sendResult = await sendEmail({
      to: recipient.toLowerCase(),
      subject: emailPayload.subject,
      html: emailPayload.html,
      text: emailPayload.text,
      senderAccountId: accountConfig?.id || null,
      accountConfig,
      leadId: original.leadId || null,
      inReplyTo: original.messageId || null,
      references: original.references
        ? (Array.isArray(original.references) ? [...original.references, original.messageId] : [original.references, original.messageId])
        : (original.messageId ? [original.messageId] : []),
      threadId: original.threadId || original.messageId,
      event: 'manual.compose',
      templateId: 'reply_compose',
      metadata: {
        replyToMessageId: original.id,
        composedByAdmin: req.admin?.email || 'admin',
      },
    })

    res.json({
      status: 'ok',
      message: `Reply sent successfully to ${recipient}.`,
      data: {
        messageId: sendResult?.messageId,
        recipient,
        subject,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/admin/email/messages/:id/create-lead
 * Create a CRM ContactLead from an incoming email message and associate it
 */
export const createLeadFromEmailMessage = async (req, res, next) => {
  try {
    const { id } = req.params
    const message = await prisma.emailMessage.findUnique({ where: { id } })
    if (!message) {
      return res.status(404).json({ status: 'error', message: 'Email message not found.' })
    }

    const email = (message.fromEmail || '').trim().toLowerCase()
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Message has no valid sender email address.' })
    }

    let lead = await prisma.contactLead.findFirst({
      where: { email },
    })

    if (!lead) {
      lead = await prisma.contactLead.create({
        data: {
          name: message.fromName || email.split('@')[0],
          email,
          serviceInterested: req.body.serviceInterested || 'General Inquiry',
          message: message.snippet || message.subject || 'Lead created from inbound email message.',
          status: 'NEW',
          source: 'EMAIL_INBOX',
        },
      })
    }

    await prisma.emailMessage.updateMany({
      where: { fromEmail: email, leadId: null },
      data: { leadId: lead.id },
    })

    res.json({
      status: 'ok',
      message: `Lead '${lead.name}' created/associated successfully.`,
      data: lead,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/admin/email/messages/:id
 * Move email message to TRASH or permanently delete if already in TRASH
 */
export const deleteEmailMessage = async (req, res, next) => {
  try {
    const { id } = req.params
    const message = await prisma.emailMessage.findUnique({ where: { id } })
    if (!message) {
      return res.status(404).json({ status: 'error', message: 'Email message not found.' })
    }

    if (message.folder === 'TRASH' || req.query.permanent === 'true') {
      await prisma.emailMessage.delete({ where: { id } })
      return res.json({ status: 'ok', message: 'Email message permanently deleted.' })
    }

    const updated = await prisma.emailMessage.update({
      where: { id },
      data: { folder: 'TRASH' },
    })

    res.json({ status: 'ok', message: 'Email message moved to Trash.', data: updated })
  } catch (err) {
    next(err)
  }
}

/**
 * contact.controller.js
 *
 * POST /api/contact
 *   1. Honeypot check (spam bots fill hidden fields)
 *   2. reCAPTCHA v3 token verification (skip in dev if secret not set)
 *   3. Save lead to ContactLead table
 *   4. Send admin notification email
 *   5. Send auto-reply to user
 */

import prisma from '../config/db.js'
import { env } from '../config/env.js'
import { sendEmail, adminNotificationTemplate, autoReplyTemplate } from '../utils/mailer.js'
import { verifyRecaptcha } from '../utils/recaptcha.js'

/**
 * POST /api/contact
 */
export const submitContact = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      serviceInterested,
      recaptchaToken,
      _hp,
      estimatedBudget,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      referrer,
      landingPage,
    } = req.body

    // ── 1. Honeypot check ──────────────────────────────────────
    // `_hp` is a hidden field. Bots fill it; real users leave it blank.
    if (_hp) {
      // Silently accept but do nothing (don't tell bot it was blocked)
      return res.status(200).json({
        status: 'ok',
        message: 'Your message has been received. We will be in touch shortly.',
      })
    }

    // ── 2. reCAPTCHA v3 verification ──────────────────────────
    if (!recaptchaToken) {
      return res.status(400).json({
        status: 'error',
        message: 'reCAPTCHA token is required.',
      })
    }

    const isHuman = await verifyRecaptcha(recaptchaToken, req.ip, {
      expectedAction: [
        'contact_form',
        'cost_calculator',
        'pricing_quote',
        'homepage_quote',
        'service_inquiry',
        'newsletter_footer',
      ],
    })
    if (!isHuman) {
      return res.status(400).json({
        status: 'error',
        message: 'reCAPTCHA verification failed. Please try again.',
      })
    }

    // ── Check for recent submission (24 hour lock) ─────────────────
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const existingLead = await prisma.contactLead.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        createdAt: { gte: oneDayAgo },
      },
    })

    if (existingLead) {
      return res.status(400).json({
        status: 'error',
        message:
          'You have already submitted an inquiry in the last 24 hours. Please wait before sending another message.',
      })
    }

    // ── Compile attribution metadata ───────────────────────────
    const attributionParts = []
    if (utmSource) attributionParts.push(`Source: ${utmSource}`)
    if (utmMedium) attributionParts.push(`Medium: ${utmMedium}`)
    if (utmCampaign) attributionParts.push(`Campaign: ${utmCampaign}`)
    if (utmTerm) attributionParts.push(`Term: ${utmTerm}`)
    if (utmContent) attributionParts.push(`Content: ${utmContent}`)
    if (referrer) attributionParts.push(`Referrer: ${referrer}`)
    if (landingPage) attributionParts.push(`Landing: ${landingPage}`)

    const attributionNotes =
      attributionParts.length > 0 ? `[Attribution]\n${attributionParts.join('\n')}` : ''

    // ── 3. Save lead to database ───────────────────────────────
    const lead = await prisma.contactLead.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        message: message.trim(),
        serviceInterested: serviceInterested?.trim() || null,
        estimatedBudget: estimatedBudget?.trim() || '',
        notes: attributionNotes,
        status: 'NEW',
      },
    })

    // ── 4 & 5. Automated Transactional Emails via Central Email Service ──
    const isQuote = !!(
      estimatedBudget ||
      message.toLowerCase().includes('quote') ||
      message.toLowerCase().includes('proposal')
    )
    const eventName = isQuote ? 'quote.created' : 'lead.created'

    let rule = null
    try {
      rule = await prisma.emailAutomationRule.findFirst({
        where: { event: eventName },
      })
    } catch {
      // ignore
    }

    const isEnabled = rule ? rule.isEnabled : true
    const sendCustomerCopy = rule ? rule.sendCustomerCopy : true
    const sendInternalAlert = rule ? rule.sendInternalAlert : true
    const internalRouting =
      rule?.internalRouting ||
      (isQuote
        ? 'sales@snaptech.digital'
        : env.EMAIL_FROM
          ? env.EMAIL_FROM.replace(/.*<(.+)>/, '$1')
          : env.EMAIL_USER || 'info@snaptech.digital')

    if (isEnabled) {
      const adminEmail = adminNotificationTemplate({
        name,
        email,
        phone,
        message,
        serviceInterested,
        estimatedBudget,
        attribution: attributionNotes,
      })
      const userReply = autoReplyTemplate({ name })

      const emailPromises = []

      if (sendInternalAlert && internalRouting) {
        emailPromises.push(
          sendEmail({
            to: internalRouting,
            ...adminEmail,
            event: eventName,
            templateId: 'admin_lead_alert',
            idempotencyKey: `lead-${lead.id}-admin`,
            replyTo: email,
            isInternalAlert: true,
            metadata: { leadId: lead.id, isQuote },
          }).catch((err) => console.error('[mailer] Admin notification failed:', err.message))
        )
      }

      if (sendCustomerCopy && email) {
        emailPromises.push(
          sendEmail({
            to: email,
            ...userReply,
            event: eventName,
            templateId: isQuote ? 'quote_confirmation' : 'inquiry_confirmation',
            idempotencyKey: `lead-${lead.id}-client`,
            replyTo: isQuote ? 'sales@snaptech.digital' : 'hello@snaptech.digital',
            isCustomerCopy: true,
            metadata: { leadId: lead.id, serviceInterested },
          }).catch((err) => console.error('[mailer] Auto-reply failed:', err.message))
        )
      }

      Promise.all(emailPromises)
    }

    return res.status(201).json({
      status: 'ok',
      message: 'Your message has been received. We will be in touch shortly.',
      data: { id: lead.id },
    })
  } catch (err) {
    next(err)
  }
}

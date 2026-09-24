/**
 * mailer.js — Email sending via Resend (primary) or Nodemailer SMTP (fallback)
 *
 * Priority:
 *  1. Resend SDK  — if RESEND_API_KEY is set (recommended)
 *  2. Nodemailer  — if EMAIL_USER + EMAIL_PASS is set (SMTP fallback)
 *  3. Console log — dev mode when neither is configured
 *
 * Never hardcode credentials here. All from env vars.
 */

import dns from 'node:dns'
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first')
}

import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { env } from '../config/env.js'

// ── Determine sending strategy ─────────────────────────────────
function getStrategy() {
  if (process.env.RESEND_API_KEY || env.RESEND_API_KEY) return 'resend'
  if (
    (process.env.EMAIL_USER || env.EMAIL_USER) &&
    (process.env.EMAIL_PASS || env.EMAIL_PASS)
  )
    return 'smtp'
  return 'console'
}

// ── Resend sender ──────────────────────────────────────────────
export async function sendViaResend({ to, subject, html, text, attachments }) {
  const apiKey = (process.env.RESEND_API_KEY || env.RESEND_API_KEY || '').trim()
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.')
  const resend = new Resend(apiKey)

  let rawFrom = (process.env.EMAIL_FROM || env.EMAIL_FROM || '').trim()
  if (!rawFrom) {
    rawFrom = 'SnapTech Digital <onboarding@resend.dev>'
  }
  const from = rawFrom.includes('<') ? rawFrom : `SnapTech Digital <${rawFrom}>`

  try {
    const { data, error } = await resend.emails.send({ from, to, subject, html, text, attachments })
    if (error) {
      // If error is domain verification related, retry with onboarding@resend.dev
      if (
        error.message?.includes('domain') ||
        error.message?.includes('verify') ||
        error.message?.includes('onboarding@resend.dev')
      ) {
        const fallbackFrom = 'SnapTech Digital <onboarding@resend.dev>'
        const retryResult = await resend.emails.send({ from: fallbackFrom, to, subject, html, text, attachments })
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

// ── Nodemailer SMTP sender ─────────────────────────────────────
export async function sendViaSMTP({ to, subject, html, text, attachments }) {
  const host = (process.env.EMAIL_HOST || env.EMAIL_HOST || 'smtp.gmail.com').trim()
  const port = parseInt(process.env.EMAIL_PORT || env.EMAIL_PORT || '587', 10)
  const user = (process.env.EMAIL_USER || env.EMAIL_USER || '').trim()
  // Clean all spaces from App Password (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const pass = (process.env.EMAIL_PASS || env.EMAIL_PASS || '').trim().replace(/\s+/g, '')

  const isGmail =
    host.includes('gmail') ||
    user.toLowerCase().includes('gmail.com') ||
    host === 'smtp.gmail.com'

  const finalHost = isGmail ? 'smtp.gmail.com' : host
  const finalPort = port === 465 ? 465 : 587
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
  const from = process.env.EMAIL_FROM || env.EMAIL_FROM || `"Snaptech Digital" <${user}>`
  const info = await transporter.sendMail({ from, to, subject, html, text, attachments })
  return info
}

/**
 * sendEmailDirect — unified direct send function.
 * Automatically picks Resend → SMTP → console based on env config.
 */
async function sendEmailDirect({ to, subject, html, text, attachments }) {
  const strategy = getStrategy()

  if (strategy === 'console') {
    console.log('\n📧 [DEV — EMAIL NOT SENT — LOG ONLY]')
    console.log(`  To:       ${to}`)
    console.log(`  Subject:  ${subject}`)
    console.log(`  Body:     ${text || '(html only)'}`)
    if (attachments) {
      console.log(`  Attachments: ${attachments.map((a) => a.filename).join(', ')}`)
    }
    console.log('─────────────────────────────────────\n')
    return { messageId: 'dev-console-log' }
  }

  if (strategy === 'resend') {
    return sendViaResend({ to, subject, html, text, attachments })
  }

  return sendViaSMTP({ to, subject, html, text, attachments })
}

// ── In-Memory Throttled Email Queue ────────────────────────────
const emailQueue = []
let processingQueue = false

async function processEmailQueue() {
  if (processingQueue || emailQueue.length === 0) return
  processingQueue = true

  while (emailQueue.length > 0) {
    const { options, resolve, reject } = emailQueue.shift()
    try {
      const result = await sendEmailDirect(options)
      resolve(result)
    } catch (err) {
      console.error('[mailer queue error]:', err.message)
      reject(err)
    }
    // Throttle: wait 1 second between email attempts to prevent rate limit issues
    await new Promise((res) => setTimeout(res, 1000))
  }

  processingQueue = false
}

/**
 * sendEmail — unified queued send function.
 * Throttles outbound emails to 1 email/sec to prevent SMTP service exhaustion.
 *
 * @param {{ to: string, subject: string, html: string, text?: string }} options
 */
export async function sendEmail(options) {
  return new Promise((resolve, reject) => {
    emailQueue.push({ options, resolve, reject })
    processEmailQueue()
  })
}


// ── Shared Professional Email Footer ───────────────────────────

/**
 * professionalEmailFooter(settings) — Brand-consistent footer for all client emails.
 * Based on Hindustan Projects Official Email Signature System (HP-BB-030).
 * Accepts settings object from SiteSetting DB so values stay updated from admin panel.
 */
export function professionalEmailFooter(settings = {}) {
  const phone    = settings.phone    || '+91 75970 00601'
  const whatsapp = settings.whatsapp || '+91 75970 00601'
  const address  = settings.address  || 'Bhilwara – 311001, Rajasthan, India'
  const linkedin  = settings.linkedin  || null
  const facebook  = settings.facebook  || null
  const instagram = settings.instagram || null
  const pinterest = settings.pinterest || null
  const youtube   = settings.youtube   || null

  // Clean whatsapp number for wa.me link (remove spaces, dashes, +)
  const waNumber = whatsapp.replace(/[\s\-+]/g, '')
  const waLink   = `https://wa.me/${waNumber}`

  const socialButtons = [
    linkedin  && `<a href="${linkedin}" style="display:inline-block;background:#0A66C2;color:white;font-size:11px;font-weight:bold;padding:3px 9px;border-radius:4px;text-decoration:none;margin:2px;">in</a>`,
    facebook  && `<a href="${facebook}" style="display:inline-block;background:#1877F2;color:white;font-size:11px;font-weight:bold;padding:3px 9px;border-radius:4px;text-decoration:none;margin:2px;">f</a>`,
    instagram && `<a href="${instagram}" style="display:inline-block;background:#E1306C;color:white;font-size:11px;font-weight:bold;padding:3px 9px;border-radius:4px;text-decoration:none;margin:2px;">&#9678;</a>`,
    pinterest && `<a href="${pinterest}" style="display:inline-block;background:#E60023;color:white;font-size:11px;font-weight:bold;padding:3px 9px;border-radius:4px;text-decoration:none;margin:2px;">P</a>`,
    youtube   && `<a href="${youtube}" style="display:inline-block;background:#FF0000;color:white;font-size:11px;font-weight:bold;padding:3px 9px;border-radius:4px;text-decoration:none;margin:2px;">&#9654;</a>`,
  ].filter(Boolean).join('\n        ')

  return `
    <div style="margin-top: 32px; border-top: 2px solid #0066FF; padding-top: 20px;">

      <!-- Brand + Contact -->
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; padding-right: 20px;">

            <!-- Logo Text -->
            <div style="margin-bottom: 12px;">
              <span style="font-size: 22px; font-weight: 900; color: #001D4A; letter-spacing: -0.5px;">Snap</span><span style="font-size: 22px; font-weight: 900; color: #0066FF;">tech</span>
              <div style="font-size: 9px; font-weight: 800; color: #001D4A; letter-spacing: 2px; text-transform: uppercase; margin-top: 1px;">A HINDUSTAN PROJECTS ENTERPRISE</div>
              <div style="font-size: 8px; color: #0066FF; font-weight: 700; letter-spacing: 0.5px; margin-top: 2px;">Enterprise IT Solutions &bull; Web &bull; Mobile &bull; Cloud</div>
            </div>

            <!-- Contact Details -->
            <table style="border-collapse: collapse; font-size: 12px; color: #374151;">
              <tr>
                <td style="padding: 2px 8px 2px 0; white-space: nowrap;">&#128222;</td>
                <td style="padding: 2px 0;"><a href="tel:${phone.replace(/\s/g, '')}" style="color: #0066FF; text-decoration: none;">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 2px 8px 2px 0; white-space: nowrap;">&#128241;</td>
                <td style="padding: 2px 0;"><a href="${waLink}" style="color: #0066FF; text-decoration: none;">${whatsapp}</a> <span style="color: #6B7280;">(WhatsApp)</span></td>
              </tr>
              <tr>
                <td style="padding: 2px 8px 2px 0; white-space: nowrap;">&#127760;</td>
                <td style="padding: 2px 0;"><a href="https://www.snaptech.digital" style="color: #0066FF; text-decoration: none;">www.snaptech.digital</a> &bull; <a href="https://www.hindustanprojects.in" style="color: #001D4A; text-decoration: none;">www.hindustanprojects.in</a></td>
              </tr>
              <tr>
                <td style="padding: 2px 8px 2px 0; white-space: nowrap;">&#128205;</td>
                <td style="padding: 2px 0; color: #374151;">${address}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Social Media Links -->
      ${socialButtons ? `
      <div style="margin-top: 16px;">
        <span style="font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Follow us:</span>
        &nbsp;
        ${socialButtons}
      </div>` : ''}

      <!-- Confidentiality Notice -->
      <div style="margin-top: 16px; padding: 10px 14px; background: #f0f6ff; border-left: 3px solid #0066FF; border-radius: 0 4px 4px 0;">
        <p style="margin: 0; font-size: 10px; color: #64748B; line-height: 1.6;">
          <strong style="color: #001D4A;">CONFIDENTIALITY NOTICE:</strong> This email and any attachments are intended solely for the use of the addressee and may contain confidential information. If you are not the intended recipient, please notify the sender and delete this email immediately.
        </p>
      </div>

      <!-- Copyright -->
      <p style="margin: 12px 0 0; font-size: 10px; color: #9CA3AF; text-align: center;">
        &copy; ${new Date().getFullYear()} SnapTech Digital &bull; Hindustan Projects Group. All rights reserved. &nbsp;|&nbsp; Bhilwara, Rajasthan, India
      </p>
    </div>
  `
}

/**
 * fetchEmailFooterSettings() — Fetch site settings from DB for use in email footer.
 * Call this before generating any client-facing email.
 */
export async function fetchEmailFooterSettings(prisma) {
  try {
    const keys = ['phone', 'whatsapp', 'address', 'linkedin', 'facebook', 'instagram', 'youtube', 'pinterest']
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } })
    const settings = {}
    for (const row of rows) settings[row.key] = row.value
    return settings
  } catch {
    return {}
  }
}

// ── Email templates ────────────────────────────────────────────


/**
 * Admin notification email — sent to the company when a lead comes in.
 */
export function adminNotificationTemplate({ name, email, phone, message, serviceInterested }) {
  const service = serviceInterested || 'Not specified'
  const phoneDisplay = phone || 'Not provided'

  return {
    subject: `New IT Project Lead: ${name} [Snaptech]`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #001D4A; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New IT Project Lead</h1>
          <p style="color: #00D2FF; margin: 4px 0 0; font-size: 14px; font-weight: bold;">Snaptech &bull; Hindustan Projects IT Services</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px; width: 35%;">Name</td>
            <td style="padding: 8px 0; color: #1A1A1A; font-size: 14px; font-weight: 600;">${name}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 8px 4px; color: #6B7280; font-size: 14px;">Email</td>
            <td style="padding: 8px 4px; font-size: 14px;"><a href="mailto:${email}" style="color: #0066FF;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Phone</td>
            <td style="padding: 8px 0; color: #1A1A1A; font-size: 14px;">${phoneDisplay}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 8px 4px; color: #6B7280; font-size: 14px;">Service</td>
            <td style="padding: 8px 4px; color: #1A1A1A; font-size: 14px;">${service}</td>
          </tr>
        </table>

        <div style="margin-top: 16px; padding: 16px; background: #f0f6ff; border-radius: 6px; border-left: 4px solid #0066FF;">
          <p style="margin: 0 0 8px; color: #001D4A; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Project Requirements</p>
          <p style="margin: 0; color: #1A1A1A; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <a href="mailto:${email}" style="display: inline-block; background: #0066FF; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Reply to ${name}</a>
        </div>

        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          This lead was submitted via the SnapTech portal (www.snaptech.digital).
        </p>
      </div>
    `,
    text: `New IT Project Lead\n\nName: ${name}\nEmail: ${email}\nPhone: ${phoneDisplay}\nService: ${service}\n\nRequirements:\n${message}`,
  }
}

/**
 * Auto-reply email — sent to the user confirming their submission.
 */
export function autoReplyTemplate({ name }) {
  const phone = process.env.SITE_PHONE || '+91 75970 00601'
  const email = process.env.EMAIL_FROM
    ? process.env.EMAIL_FROM.replace(/.*<(.+)>/, '$1')
    : process.env.EMAIL_USER || 'info@snaptech.digital'
  return {
    subject: 'Thank you for contacting SnapTech Digital — Hindustan Projects',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #001D4A; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">
            <span style="color: #0066FF;">Snap</span>Tech Digital
          </h1>
          <p style="color: #00D2FF; margin: 4px 0 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold;">
            A Hindustan Projects Enterprise &bull; Enterprise IT Division
          </p>
        </div>

        <p style="font-size: 16px; color: #1A1A1A;">Hi <strong>${name}</strong>,</p>

        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          Thank you for reaching out to <strong>SnapTech Digital</strong>! We've received your project inquiry and our solutions engineering team will contact you within <strong>24 hours</strong> with a detailed consultation.
        </p>

        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          In the meantime, feel free to review our capabilities or reach us directly:
        </p>

        <div style="margin: 20px 0; padding: 16px; background: #f0f6ff; border-radius: 6px; border-left: 4px solid #0066FF;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #1A1A1A;">📞 <strong>Phone:</strong> ${phone}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #1A1A1A;">📧 <strong>Email:</strong> ${email}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #1A1A1A;">🌐 <strong>Portal:</strong> <a href="https://www.snaptech.digital" style="color: #0066FF;">www.snaptech.digital</a></p>
          <p style="margin: 0; font-size: 14px; color: #1A1A1A;">🏢 <strong>Parent Group:</strong> <a href="https://www.hindustanprojects.in" style="color: #001D4A;">www.hindustanprojects.in</a></p>
        </div>

        <p style="font-size: 13px; color: #6B7280; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
          &copy; ${new Date().getFullYear()} SnapTech Digital &bull; Hindustan Projects Group. All rights reserved.<br>
          Bhilwara, Rajasthan, India
        </p>
      </div>
    `,
    text: `Hi ${name},\n\nThank you for contacting SnapTech Digital (Hindustan Projects)!\n\nWe've received your inquiry and our engineering team will get back to you within 24 hours.\n\nWebsite: https://www.snaptech.digital\nParent Group: https://www.hindustanprojects.in\n\nRegards,\nSnapTech Digital Solutions Team\nHindustan Projects Group`,
  }
}

/**
 * Admin notification email for a new job application.
 */
export function jobAdminNotificationTemplate({
  jobTitle,
  name,
  email,
  phone,
  resumeUrl,
  coverLetter,
}) {
  const coverLetterDisplay = coverLetter || 'Not provided'

  return {
    subject: `New Job Application: ${name} - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Job Application</h1>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Hindustan Projects Careers</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px; width: 35%;">Applied For</td>
            <td style="padding: 8px 0; color: #1A1A1A; font-size: 14px; font-weight: 600;">${jobTitle}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 8px 4px; color: #6B7280; font-size: 14px;">Applicant Name</td>
            <td style="padding: 8px 4px; color: #1A1A1A; font-size: 14px; font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Email</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #1A3E8C;">${email}</a></td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 8px 4px; color: #6B7280; font-size: 14px;">Phone</td>
            <td style="padding: 8px 4px; color: #1A1A1A; font-size: 14px;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Resume / CV</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="${resumeUrl}" target="_blank" style="color: #E31E24; font-weight: bold; text-decoration: underline;">Download / View Resume</a></td>
          </tr>
        </table>

        <div style="margin-top: 16px; padding: 16px; background: #f3f4f6; border-radius: 6px; border-left: 4px solid #1A3E8C;">
          <p style="margin: 0 0 8px; color: #6B7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Cover Letter / Notes</p>
          <p style="margin: 0; color: #1A1A1A; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${coverLetterDisplay}</p>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <a href="mailto:${email}" style="display: inline-block; background: #1A3E8C; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Email ${name}</a>
        </div>
      </div>
    `,
    text: `New Job Application\n\nJob Title: ${jobTitle}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nResume: ${resumeUrl}\n\nCover Letter:\n${coverLetterDisplay}`,
  }
}

/**
 * Job application confirmation email sent to the applicant.
 */
export function jobApplicantConfirmationTemplate({ name, jobTitle }) {
  return {
    subject: `Application Received: ${jobTitle} at Hindustan Projects`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">
            <span style="color: #E31E24;">Hindustan </span>Projects
          </h1>
        </div>

        <p style="font-size: 16px; color: #1A1A1A;">Dear <strong>${name}</strong>,</p>

        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          Thank you for applying for the <strong>${jobTitle}</strong> position at Hindustan Projects. We have successfully received your job application and resume.
        </p>

        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          Our HR team is currently reviewing applications. If your profile matches our requirements, we will contact you within <strong>24 hours</strong>.
        </p>

        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          We appreciate your interest in building a career with Hindustan Projects!
        </p>

        <p style="font-size: 13px; color: #6B7280; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
          © ${new Date().getFullYear()} Hindustan Projects. All rights reserved.<br>
          Bhilwara, Rajasthan, India
        </p>
      </div>
    `,
    text: `Dear ${name},\n\nThank you for applying for the ${jobTitle} position at Hindustan Projects!\n\nWe have successfully received your application. Our recruitment team will review it and get back to you within 24 hours.\n\nBest regards,\nHindustan Projects HR Team`,
  }
}

/**
 * Admin reminder email for overdue leads.
 */
export function leadFollowUpReminderTemplate({ leads, adminUrl }) {
  const leadsRows = leads.map(lead => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px; font-size: 14px; font-weight: bold; color: #1A1A1A;">${lead.name}</td>
      <td style="padding: 10px; font-size: 14px; color: #374151;"><a href="mailto:${lead.email}" style="color: #1A3E8C;">${lead.email}</a><br><span style="font-size: 12px; color: #6B7280;">${lead.phone || 'No phone'}</span></td>
      <td style="padding: 10px; font-size: 14px; color: #374151;">${lead.serviceInterested || 'Not specified'}</td>
      <td style="padding: 10px; font-size: 12px; color: #6B7280;">${new Date(lead.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('')

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

        <div style="margin-top: 30px; text-align: center;">
          <a href="${adminUrl}" style="display: inline-block; background: #1A3E8C; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Open Admin Panel leads</a>
        </div>
      </div>
    `,
    text: `Follow-up reminder for ${leads.length} overdue leads. Direct Admin Link: ${adminUrl}`,
  }
}

/**
 * Admin reminder email for stale contacted leads.
 */
export function staleLeadFollowUpTemplate({ leads, adminUrl }) {
  const leadsRows = leads.map(lead => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px; font-size: 14px; font-weight: bold; color: #1A1A1A;">${lead.name}</td>
      <td style="padding: 10px; font-size: 14px; color: #374151;"><a href="mailto:${lead.email}" style="color: #1A3E8C;">${lead.email}</a></td>
      <td style="padding: 10px; font-size: 14px; color: #374151;">${lead.serviceInterested || 'Not specified'}</td>
      <td style="padding: 10px; font-size: 12px; color: #6B7280;">Last contact: ${new Date(lead.updatedAt).toLocaleDateString()}</td>
    </tr>
  `).join('')

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

        <div style="margin-top: 30px; text-align: center;">
          <a href="${adminUrl}" style="display: inline-block; background: #E31E24; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: 600;">Open Admin Leads Dashboard</a>
        </div>
      </div>
    `,
    text: `Stale leads follow-up reminder for ${leads.length} leads. Admin link: ${adminUrl}`,
  }
}

/**
 * Weekly summary report email.
 */
export function weeklySummaryReportTemplate({ stats }) {
  const serviceRows = Object.entries(stats.leadsByService).map(([srv, count]) => `
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #374151;">${srv}</td>
      <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #1A1A1A; text-align: right;">${count}</td>
    </tr>
  `).join('')

  const statusRows = Object.entries(stats.appsByStatus).map(([status, count]) => `
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #374151;">${status}</td>
      <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #1A1A1A; text-align: right;">${count}</td>
    </tr>
  `).join('')

  return {
    subject: `📊 Weekly Summary Report — Hindustan Projects`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Weekly Summary Report</h1>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Performance breakdown for the past 7 days</p>
        </div>

        <div style="margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="background: #f0f4ff; padding: 15px; border-radius: 6px; text-align: center; border-left: 4px solid #1A3E8C; width: 45%;">
                <p style="margin: 0; font-size: 13px; color: #4B5563; text-transform: uppercase;">New Leads</p>
                <h2 style="margin: 5px 0 0; font-size: 28px; color: #1A3E8C;">${stats.totalNewLeads}</h2>
              </td>
              <td style="width: 10%;">&nbsp;</td>
              <td style="background: #fff0f0; padding: 15px; border-radius: 6px; text-align: center; border-left: 4px solid #E31E24; width: 45%;">
                <p style="margin: 0; font-size: 13px; color: #4B5563; text-transform: uppercase;">Job Apps</p>
                <h2 style="margin: 5px 0 0; font-size: 28px; color: #E31E24;">${stats.totalNewApplications}</h2>
              </td>
            </tr>
          </table>
        </div>

        <h3 style="color: #1A3E8C; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 25px;">Breakdown of Leads by Service</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${serviceRows || '<tr><td style="color: #6B7280; font-size: 14px; padding: 10px 0;">No new leads this week</td></tr>'}
        </table>

        <h3 style="color: #1A3E8C; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 25px;">Breakdown of Job Applications by Status</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${statusRows || '<tr><td style="color: #6B7280; font-size: 14px; padding: 10px 0;">No active job applications</td></tr>'}
        </table>

        <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px;">
          This automated report was generated by Hindustan Projects.
        </p>
      </div>
    `,
    text: `Weekly Summary: New Leads: ${stats.totalNewLeads}, Job Apps: ${stats.totalNewApplications}`,
  }
}

/**
 * Backup failure alert email.
 */
export function dbBackupFailureTemplate({ error }) {
  return {
    subject: `🚨 CRITICAL ALERT: Database Backup Failure`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fecaca; border-radius: 8px;">
        <div style="background: #dc2626; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Database Backup Failed</h1>
          <p style="color: #fecaca; margin: 4px 0 0; font-size: 14px;">Immediate administrator attention required</p>
        </div>

        <p style="font-size: 15px; color: #1a1a1a; margin-top: 20px;">
          The nightly automated database backup failed to complete successfully. Below is the error trace captured by the system:
        </p>

        <div style="background: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626; margin: 15px 0;">
          <code style="font-size: 13px; color: #991b1b; word-break: break-all;">${error}</code>
        </div>

        <p style="font-size: 14px; color: #4B5563;">
          Please inspect the application logs on the Render Dashboard to diagnose connection timeouts, server memory exhaustion, or SMTP issues.
        </p>
      </div>
    `,
    text: `CRITICAL: Nightly database backup failed. Error: ${error}`,
  }
}

/**
 * clientPaymentSuccessTemplate — sent to client and admin when a milestone is marked as PAID.
 */
export function clientPaymentSuccessTemplate({ clientName, projectName, milestoneTitle, amount, invoiceUrl }) {
  return {
    subject: `Receipt for your payment: ${milestoneTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Payment Receipt</h1>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Hindustan Projects billing system</p>
        </div>

        <p style="font-size: 16px; color: #1A1A1A;">Dear <strong>${clientName}</strong>,</p>

        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          Thank you for your payment! We have successfully processed the payment for the milestone <strong>${milestoneTitle}</strong> under project <strong>${projectName}</strong>.
        </p>

        <div style="margin: 20px 0; padding: 16px; background: #f0f4ff; border-radius: 6px;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #1A1A1A;">💳 <strong>Milestone:</strong> ${milestoneTitle}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #1A1A1A;">💰 <strong>Amount Paid:</strong> ₹${amount.toLocaleString('en-IN')}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #1A1A1A;">✅ <strong>Status:</strong> PAID</p>
          <p style="margin: 0; font-size: 14px; color: #1A1A1A;">📅 <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        ${invoiceUrl ? `
        <div style="margin-top: 24px; text-align: center;">
          <a href="${invoiceUrl}" target="_blank" style="display: inline-block; background: #E31E24; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Download Digital Invoice</a>
        </div>
        ` : ''}

        <p style="font-size: 15px; color: #374151; line-height: 1.7; margin-top: 20px;">
          Associated deliverables have been unlocked and are now available inside your Client Portal.
        </p>

        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          If you have any billing queries, please feel free to open a ticket in the Support Desk.
        </p>
      </div>
    `,
    text: `Dear ${clientName},\n\nThank you for your payment!\n\nWe have processed ₹${amount.toLocaleString('en-IN')} for milestone "${milestoneTitle}" under project "${projectName}".\n\nDownload Link: ${invoiceUrl}\n\nBest regards,\nHindustan Projects Billing Team`,
  }
}

/**
 * supportTicketCreatedTemplate — sent to admin when a client raises a new support ticket.
 */
export function supportTicketCreatedTemplate({ clientName, ticketId, subject, category, message }) {
  return {
    subject: `[Support Ticket #${ticketId.slice(-6).toUpperCase()}] New Ticket: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Support Ticket</h1>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Hindustan Projects Helpdesk</p>
        </div>

        <p style="font-size: 15px; color: #1A1A1A;">Hello Admin/Support Team,</p>

        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          A new support ticket has been opened by client <strong>${clientName}</strong>:
        </p>

        <div style="margin: 20px 0; padding: 16px; background: #f9fafb; border-left: 4px solid #1A3E8C; border-radius: 4px;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #1A1A1A;">🏷️ <strong>Ticket ID:</strong> #${ticketId.slice(-6).toUpperCase()}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #1A1A1A;">📁 <strong>Category:</strong> ${category}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #1A1A1A;">📝 <strong>Subject:</strong> ${subject}</p>
        </div>

        <div style="margin-top: 16px; padding: 16px; background: #f3f4f6; border-radius: 6px;">
          <p style="margin: 0 0 8px; color: #6B7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Initial Message Description</p>
          <p style="margin: 0; color: #1A1A1A; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>

        <p style="font-size: 14px; color: #4B5563; margin-top: 24px;">
          Please login to the Admin Dashboard to assign and respond to this ticket.
        </p>
      </div>
    `,
    text: `Support Ticket #${ticketId.slice(-6).toUpperCase()}\n\nClient: ${clientName}\nCategory: ${category}\nSubject: ${subject}\n\nDescription:\n${message}`,
  }
}

/**
 * ticketAssignmentTemplate — sent to the assigned staff/admin when a ticket is assigned to them.
 */
export function ticketAssignmentTemplate({ adminEmail, ticketId, subject, category, clientName, assignedByRole, portalUrl }) {
  return {
    subject: `[Assigned To You] Support Ticket #${ticketId.slice(-6).toUpperCase()}: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #1A3E8C, #1e4db7); padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Ticket Assigned to You</h1>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Hindustan Projects Support Desk</p>
        </div>

        <p style="font-size: 15px; color: #1A1A1A;">Hello <strong>${adminEmail}</strong>,</p>

        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          A support ticket has been assigned to you by <strong>${assignedByRole || 'Admin'}</strong>. Please review and respond at your earliest convenience.
        </p>

        <div style="margin: 20px 0; padding: 16px; background: #f0f4ff; border-left: 4px solid #1A3E8C; border-radius: 4px;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #1A1A1A;">🏷️ <strong>Ticket ID:</strong> #${ticketId.slice(-6).toUpperCase()}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #1A1A1A;">👤 <strong>Client:</strong> ${clientName}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #1A1A1A;">📁 <strong>Category:</strong> ${category}</p>
          <p style="margin: 0; font-size: 14px; color: #1A1A1A;">📝 <strong>Subject:</strong> ${subject}</p>
        </div>

        <p style="font-size: 14px; color: #4B5563; margin-top: 16px;">
          Please log in to the Admin Dashboard to review the ticket thread and provide a timely response.
        </p>

        ${portalUrl ? `
        <div style="margin-top: 24px; text-align: center;">
          <a href="${portalUrl}" target="_blank" style="display: inline-block; background: #1A3E8C; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">View Assigned Ticket</a>
        </div>
        ` : ''}
      </div>
    `,
    text: `Ticket Assigned to You\n\nTicket ID: #${ticketId.slice(-6).toUpperCase()}\nClient: ${clientName}\nCategory: ${category}\nSubject: ${subject}\n\nPlease log in to the Admin Dashboard to respond.`,
  }
}

/**
 * supportTicketReplyTemplate — sent to client or admin when a reply is posted.
 */
export function supportTicketReplyTemplate({ recipientName, ticketId, subject, senderName, message, portalUrl }) {
  return {
    subject: `[Support Ticket #${ticketId.slice(-6).toUpperCase()}] Reply from ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Ticket Reply Received</h1>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Hindustan Projects Helpdesk</p>
        </div>

        <p style="font-size: 15px; color: #1A1A1A;">Dear <strong>${recipientName}</strong>,</p>

        <p style="font-size: 15px; color: #374151; line-height: 1.7;">
          A new response has been posted by <strong>${senderName}</strong> for support ticket: <strong>${subject}</strong> (ID: #${ticketId.slice(-6).toUpperCase()})
        </p>

        <div style="margin: 20px 0; padding: 16px; background: #f3f4f6; border-radius: 6px; border-left: 4px solid #E31E24;">
          <p style="margin: 0 0 8px; color: #6B7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Message Response</p>
          <p style="margin: 0; color: #1A1A1A; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>

        ${portalUrl ? `
        <div style="margin-top: 24px; text-align: center;">
          <a href="${portalUrl}" target="_blank" style="display: inline-block; background: #1A3E8C; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">View Ticket thread</a>
        </div>
        ` : ''}
      </div>
    `,
    text: `Support Ticket #${ticketId.slice(-6).toUpperCase()}\n\nReply from: ${senderName}\n\nMessage:\n${message}`,
  }
}

export default sendEmail


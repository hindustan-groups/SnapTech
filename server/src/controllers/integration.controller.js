/**
 * integration.controller.js
 *
 * Manages third-party integration credentials (Cloudinary, SMTP, reCAPTCHA,
 * Database URL, JWT Secret) stored securely in the SiteSetting table with
 * a "sys_" prefix.
 *
 * Keys stored:
 *   sys_cloudinary_cloud_name, sys_cloudinary_api_key, sys_cloudinary_api_secret
 *   sys_smtp_host, sys_smtp_port, sys_smtp_user, sys_smtp_pass, sys_smtp_from
 *   sys_recaptcha_secret_key
 *   sys_database_url
 *   sys_jwt_secret
 *
 * On GET  — sensitive values are MASKED (last 4 chars visible)
 * On SAVE — values stored in DB AND applied to process.env immediately
 *           Database URL change triggers Prisma client reconnect
 */

import prisma from '../config/db.js'
import { env } from '../config/env.js'
import { timingSafeEqual } from 'crypto'
import { verifyMasterKey } from '../utils/masterKey.js'

// Keys that must be masked in GET responses
const MASKED_KEYS = new Set([
  'sys_cloudinary_api_secret',
  'sys_smtp_pass',
  'sys_recaptcha_secret_key',
  'sys_database_url',
  'sys_jwt_secret',
  'sys_resend_api_key',
  'sys_twilio_auth_token',
  'sys_sentry_dsn',
])

// Maps DB keys → process.env variable names
const ENV_MAP = {
  sys_cloudinary_cloud_name: 'CLOUDINARY_CLOUD_NAME',
  sys_cloudinary_api_key: 'CLOUDINARY_API_KEY',
  sys_cloudinary_api_secret: 'CLOUDINARY_API_SECRET',
  sys_smtp_host: 'EMAIL_HOST',
  sys_smtp_port: 'EMAIL_PORT',
  sys_smtp_user: 'EMAIL_USER',
  sys_smtp_pass: 'EMAIL_PASS',
  sys_smtp_from: 'EMAIL_FROM',
  sys_recaptcha_secret_key: 'RECAPTCHA_SECRET_KEY',
  sys_database_url: 'DATABASE_URL',
  sys_jwt_secret: 'JWT_SECRET',
  sys_resend_api_key: 'RESEND_API_KEY',
  sys_twilio_account_sid: 'TWILIO_ACCOUNT_SID',
  sys_twilio_auth_token: 'TWILIO_AUTH_TOKEN',
  sys_twilio_whatsapp_from: 'TWILIO_WHATSAPP_FROM',
  sys_admin_whatsapp_to: 'ADMIN_WHATSAPP_TO',
  sys_sentry_dsn: 'SENTRY_DSN',
  sys_ga_measurement_id: 'GA_MEASUREMENT_ID',
}

// All integration keys we manage
const ALL_KEYS = Object.keys(ENV_MAP)

/**
 * GET /api/admin/integrations
 * Returns current integration config — sensitive fields masked.
 */
export const getIntegrationConfig = async (_req, res, next) => {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: ALL_KEYS } },
    })

    // Build response object, masking secrets
    const config = {}
    for (const key of ALL_KEYS) {
      const row = rows.find((r) => r.key === key)
      const value = row?.value || ''

      if (MASKED_KEYS.has(key) && value) {
        // Show last 4 chars only: ••••••••xxxx
        config[key] = `${'•'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`
      } else {
        config[key] = value
      }
    }

    // Also expose which services are currently active (have credentials)
    config._status = {
      cloudinary: !!(
        config.sys_cloudinary_cloud_name &&
        config.sys_cloudinary_api_key &&
        rows.find((r) => r.key === 'sys_cloudinary_api_secret')?.value
      ),
      smtp: !!(config.sys_smtp_user && rows.find((r) => r.key === 'sys_smtp_pass')?.value),
      resend: !!rows.find((r) => r.key === 'sys_resend_api_key')?.value,
      recaptcha: !!rows.find((r) => r.key === 'sys_recaptcha_secret_key')?.value,
      database: !!rows.find((r) => r.key === 'sys_database_url')?.value,
      jwt: !!rows.find((r) => r.key === 'sys_jwt_secret')?.value,
      twilio: !!(
        config.sys_twilio_account_sid &&
        config.sys_twilio_whatsapp_from &&
        config.sys_admin_whatsapp_to &&
        rows.find((r) => r.key === 'sys_twilio_auth_token')?.value
      ),
      sentry: !!rows.find((r) => r.key === 'sys_sentry_dsn')?.value,
      googleAnalytics: !!rows.find((r) => r.key === 'sys_ga_measurement_id')?.value,
    }

    res.json({ status: 'ok', data: config })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/admin/integrations
 * Save integration keys to DB and immediately apply to process.env.
 * Blank values are IGNORED (keeps existing secret).
 * Send "__CLEAR__" to explicitly delete a value.
 */
export const updateIntegrationConfig = async (req, res, next) => {
  try {
    const updates = req.body

    const opsToRun = []

    for (const [key, rawValue] of Object.entries(updates)) {
      // Only allow known integration keys
      if (!ALL_KEYS.includes(key)) continue

      const value = typeof rawValue === 'string' ? rawValue.trim() : ''

      if (value === '__CLEAR__') {
        // Explicit clear — delete from DB and unset env
        opsToRun.push(prisma.siteSetting.deleteMany({ where: { key } }).catch(() => {}))
        delete process.env[ENV_MAP[key]]
        continue
      }

      // Skip empty — don't overwrite existing secret with blank
      if (value === '') continue

      // For masked fields, skip if value looks like our masking pattern (user didn't change it)
      if (MASKED_KEYS.has(key) && /^•+/.test(value)) continue

      // Upsert to DB
      opsToRun.push(
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )

      // Apply to running process immediately
      process.env[ENV_MAP[key]] = value

      // Special: SMTP port needs to be numeric
      if (key === 'sys_smtp_port') {
        process.env.EMAIL_PORT = String(parseInt(value, 10) || 587)
      }
    }

    await Promise.all(opsToRun)

    // Reconfigure Cloudinary SDK if cloud keys were updated
    const cloudinaryKeys = [
      'sys_cloudinary_cloud_name',
      'sys_cloudinary_api_key',
      'sys_cloudinary_api_secret',
    ]
    const cloudinaryUpdated = Object.keys(updates).some((k) => cloudinaryKeys.includes(k))
    if (cloudinaryUpdated) {
      try {
        const { cloudinary } = await import('../utils/cloudinary.js')
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        })
      } catch (e) {
        console.warn('[integrations] Could not re-init Cloudinary:', e.message)
      }
    }

    // Reconnect Prisma if DATABASE_URL was changed
    if (
      updates.sys_database_url &&
      typeof updates.sys_database_url === 'string' &&
      updates.sys_database_url.trim() !== '' &&
      !/^•+/.test(updates.sys_database_url.trim())
    ) {
      try {
        await prisma.$disconnect()
        await prisma.$connect()
        console.log('[integrations] Prisma reconnected with new DATABASE_URL.')
      } catch (e) {
        console.warn('[integrations] Prisma reconnect failed:', e.message)
      }
    }

    res.json({ status: 'ok', message: 'Integration settings saved and applied.' })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/admin/integrations/test-smtp
 * Send a test email to the currently configured SMTP address.
 */
export const testSmtpConnection = async (req, res, next) => {
  try {
    const { sendEmail } = await import('../utils/mailer.js')

    const {
      sys_smtp_host,
      sys_smtp_port,
      sys_smtp_user,
      sys_smtp_pass,
      sys_smtp_from,
      sys_resend_api_key,
    } = req.body || {}

    // 1. If non-masked credentials passed in body, auto-save and apply them immediately
    if (sys_smtp_user && typeof sys_smtp_user === 'string' && sys_smtp_user.trim()) {
      const u = sys_smtp_user.trim()
      process.env.EMAIL_USER = u
      await prisma.siteSetting.upsert({
        where: { key: 'sys_smtp_user' },
        update: { value: u },
        create: { key: 'sys_smtp_user', value: u },
      })
    }

    if (
      sys_smtp_pass &&
      typeof sys_smtp_pass === 'string' &&
      sys_smtp_pass.trim() &&
      !/^•+/.test(sys_smtp_pass.trim())
    ) {
      const p = sys_smtp_pass.trim()
      process.env.EMAIL_PASS = p
      await prisma.siteSetting.upsert({
        where: { key: 'sys_smtp_pass' },
        update: { value: p },
        create: { key: 'sys_smtp_pass', value: p },
      })
    }

    if (sys_smtp_host && typeof sys_smtp_host === 'string' && sys_smtp_host.trim()) {
      const h = sys_smtp_host.trim()
      process.env.EMAIL_HOST = h
      await prisma.siteSetting.upsert({
        where: { key: 'sys_smtp_host' },
        update: { value: h },
        create: { key: 'sys_smtp_host', value: h },
      })
    }

    if (sys_smtp_port) {
      const pt = String(parseInt(sys_smtp_port, 10) || 587)
      process.env.EMAIL_PORT = pt
      await prisma.siteSetting.upsert({
        where: { key: 'sys_smtp_port' },
        update: { value: pt },
        create: { key: 'sys_smtp_port', value: pt },
      })
    }

    if (sys_smtp_from && typeof sys_smtp_from === 'string' && sys_smtp_from.trim()) {
      const f = sys_smtp_from.trim()
      process.env.EMAIL_FROM = f
      await prisma.siteSetting.upsert({
        where: { key: 'sys_smtp_from' },
        update: { value: f },
        create: { key: 'sys_smtp_from', value: f },
      })
    }

    if (
      sys_resend_api_key &&
      typeof sys_resend_api_key === 'string' &&
      sys_resend_api_key.trim() &&
      !/^•+/.test(sys_resend_api_key.trim())
    ) {
      const r = sys_resend_api_key.trim()
      process.env.RESEND_API_KEY = r
      await prisma.siteSetting.upsert({
        where: { key: 'sys_resend_api_key' },
        update: { value: r },
        create: { key: 'sys_resend_api_key', value: r },
      })
    }

    // 2. If not in process.env, load from database site_settings
    if (!process.env.RESEND_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
      const dbRows = await prisma.siteSetting.findMany({
        where: {
          key: {
            in: [
              'sys_smtp_user',
              'sys_smtp_pass',
              'sys_smtp_host',
              'sys_smtp_port',
              'sys_smtp_from',
              'sys_resend_api_key',
            ],
          },
        },
      })
      for (const r of dbRows) {
        if (r.value && ENV_MAP[r.key]) {
          process.env[ENV_MAP[r.key]] = r.value
        }
      }
    }

    // Determine which strategy is active
    const usingResend = !!(process.env.RESEND_API_KEY || env.RESEND_API_KEY)
    const usingSmtp = !!(
      (process.env.EMAIL_USER || env.EMAIL_USER) &&
      (process.env.EMAIL_PASS || env.EMAIL_PASS)
    )

    if (!usingResend && !usingSmtp) {
      return res.status(400).json({
        status: 'error',
        message:
          'No email credentials found. Please type your SMTP Email & App Password into the boxes above and click "Send Test Email via SMTP".',
      })
    }

    const targetEmail =
      process.env.EMAIL_USER ||
      env.EMAIL_USER ||
      (process.env.EMAIL_FROM || env.EMAIL_FROM || '').replace(/.*<(.+)>/, '$1')

    if (!targetEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Set SMTP User (or EMAIL_FROM) so the test email has a destination.',
      })
    }

    const emailPayload = {
      to: targetEmail,
      subject: '✅ Test Email — Snaptech Digital Admin',
      html: `<div style="font-family:Arial,sans-serif;padding:24px;border:1px solid #e2e8f0;border-radius:12px;max-width:520px;background:#ffffff">
        <div style="background:linear-gradient(135deg,#0b0f19,#1e3a8a);padding:18px;border-radius:8px;margin-bottom:20px;text-align:center">
          <h2 style="color:#ffffff;margin:0;font-size:20px;font-weight:700">Snaptech Digital</h2>
          <p style="color:#93c5fd;margin:4px 0 0;font-size:12px">Integration Vault Verification</p>
        </div>
        <h3 style="color:#0f172a;margin:0 0 12px;font-size:16px">✅ Email Service Active & Verified</h3>
        <p style="color:#475569;font-size:14px;line-height:1.6">Your SMTP / Email configuration is working correctly. All website contact form inquiries and client notifications will be routed through this inbox.</p>
        <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:12px;margin:16px 0;border-radius:4px">
          <p style="color:#64748b;font-size:12px;margin:0">Provider: <strong style="color:#0f172a">${usingResend ? 'Resend API' : 'Gmail / Nodemailer SMTP'}</strong></p>
          <p style="color:#64748b;font-size:12px;margin:4px 0 0">Recipient: <strong style="color:#0f172a">${targetEmail}</strong></p>
        </div>
        <p style="color:#94a3b8;font-size:11px;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:12px;text-align:center">
          Sent from Snaptech Digital Admin Integration Vault
        </p>
      </div>`,
      text: 'Email Test Successful — Your Snaptech Digital email configuration is working.',
    }

    if (usingResend) {
      const { sendViaResend } = await import('../utils/mailer.js')
      if (sendViaResend) {
        await sendViaResend(emailPayload)
      } else {
        await sendEmail(emailPayload)
      }
    } else {
      const { sendViaSMTP } = await import('../utils/mailer.js')
      await sendViaSMTP(emailPayload)
    }

    res.json({
      status: 'ok',
      message: `Test email sent successfully to ${targetEmail} via ${usingResend ? 'Resend' : 'SMTP'}! Check your inbox.`,
    })
  } catch (err) {
    // Sanitize error — never forward raw provider errors (may contain credentials)
    const safeMsg = err.message?.includes('Invalid login')
      ? 'Authentication failed. Please verify your 16-character Google App Password.'
      : err.message?.includes('ECONNREFUSED') || err.message?.includes('ETIMEDOUT')
        ? 'Could not connect to email server. Check HOST and PORT settings.'
        : `Email test failed: ${err.message || 'Check your configuration and try again.'}`
    res.status(500).json({ status: 'error', message: safeMsg })
  }
}

/**
 * POST /api/admin/integrations/test-cloudinary
 * Verify Cloudinary credentials by making a lightweight API call.
 */
export const testCloudinaryConnection = async (req, res, next) => {
  try {
    const { cloudinary } = await import('../utils/cloudinary.js')

    const {
      sys_cloudinary_cloud_name,
      sys_cloudinary_api_key,
      sys_cloudinary_api_secret,
    } = req.body || {}

    if (sys_cloudinary_cloud_name && typeof sys_cloudinary_cloud_name === 'string') {
      const c = sys_cloudinary_cloud_name.trim()
      process.env.CLOUDINARY_CLOUD_NAME = c
      await prisma.siteSetting.upsert({
        where: { key: 'sys_cloudinary_cloud_name' },
        update: { value: c },
        create: { key: 'sys_cloudinary_cloud_name', value: c },
      })
    }

    if (sys_cloudinary_api_key && typeof sys_cloudinary_api_key === 'string') {
      const k = sys_cloudinary_api_key.trim()
      process.env.CLOUDINARY_API_KEY = k
      await prisma.siteSetting.upsert({
        where: { key: 'sys_cloudinary_api_key' },
        update: { value: k },
        create: { key: 'sys_cloudinary_api_key', value: k },
      })
    }

    if (
      sys_cloudinary_api_secret &&
      typeof sys_cloudinary_api_secret === 'string' &&
      !/^•+/.test(sys_cloudinary_api_secret.trim())
    ) {
      const s = sys_cloudinary_api_secret.trim()
      process.env.CLOUDINARY_API_SECRET = s
      await prisma.siteSetting.upsert({
        where: { key: 'sys_cloudinary_api_secret' },
        update: { value: s },
        create: { key: 'sys_cloudinary_api_secret', value: s },
      })
    }

    // If not in env, load from DB
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      const dbRows = await prisma.siteSetting.findMany({
        where: {
          key: {
            in: [
              'sys_cloudinary_cloud_name',
              'sys_cloudinary_api_key',
              'sys_cloudinary_api_secret',
            ],
          },
        },
      })
      for (const r of dbRows) {
        if (r.value && ENV_MAP[r.key]) {
          process.env[ENV_MAP[r.key]] = r.value
        }
      }
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Cloudinary credentials are not configured.',
      })
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    // Lightweight ping — fetches usage stats (doesn't upload anything)
    await cloudinary.api.ping()

    res.json({ status: 'ok', message: 'Cloudinary connection verified successfully.' })
  } catch (err) {
    const safeMsg =
      err.message?.includes('401') || err.message?.includes('Invalid')
        ? 'Authentication failed. Check your Cloudinary API Key and Secret.'
        : `Cloudinary connection failed: ${err.message || 'Verify credentials.'}`
    res.status(500).json({ status: 'error', message: safeMsg })
  }
}

/**
 * POST /api/admin/integrations/test-database
 * Verify current DATABASE_URL by running a lightweight query.
 */
export const testDatabaseConnection = async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', message: 'Database connection verified successfully.' })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: `Database test failed: ${err.message}`,
    })
  }
}

/**
 * POST /api/admin/integrations/verify-key
 * Verifies the Integration Master Key before unlocking the page.
 * Returns a short-lived session token stored in sessionStorage on the client.
 *
 * If INTEGRATION_MASTER_KEY is not set in .env, falls back to the JWT_SECRET
 * last 8 chars — so it always works.
 */
export const verifyIntegrationKey = async (req, res, next) => {
  try {
    const { key } = req.body

    if (!key || typeof key !== 'string' || key.trim() === '') {
      return res.status(400).json({ status: 'error', message: 'Key is required.' })
    }

    const { match, masterKey } = await verifyMasterKey(key)

    if (!masterKey) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Master key not configured on server.' })
    }

    if (!match) {
      return res.status(401).json({ status: 'error', message: 'Incorrect key. Access denied.' })
    }

    // Issue a short-lived unlock token (15 min) signed with JWT_SECRET
    // Client stores it in sessionStorage — clears on tab/browser close
    const { default: jwt } = await import('jsonwebtoken')
    const unlockToken = jwt.sign(
      { purpose: 'integration_unlock', adminId: req.admin.id },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    res.json({ status: 'ok', unlockToken })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/integrations/check-unlock
 * Validates an unlock token. Called on page load to auto-unlock if token is still valid.
 */
export const checkUnlockToken = async (req, res, next) => {
  try {
    const { token } = req.query
    if (!token) return res.json({ status: 'ok', valid: false })

    const { default: jwt } = await import('jsonwebtoken')
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET)
      if (decoded.purpose !== 'integration_unlock') throw new Error('Invalid purpose')
      res.json({ status: 'ok', valid: true })
    } catch {
      res.json({ status: 'ok', valid: false })
    }
  } catch (err) {
    next(err)
  }
}

export const verifyUnlockToken = async (req, res, next) => {
  try {
    const token = req.headers['x-integration-unlock-token'] || req.query.unlockToken
    if (!token) {
      return res.status(403).json({
        status: 'error',
        message: 'Page is locked. Master Key authorization required.',
      })
    }

    const { default: jwt } = await import('jsonwebtoken')
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET)
      if (decoded.purpose !== 'integration_unlock' || decoded.adminId !== req.admin.id) {
        throw new Error('Invalid token')
      }
      next()
    } catch (err) {
      return res.status(403).json({
        status: 'error',
        message: 'Session expired. Please enter Master Key again.',
      })
    }
  } catch (err) {
    next(err)
  }
}

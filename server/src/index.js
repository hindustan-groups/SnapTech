import dns from 'node:dns'
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first')
}

import './config/env.js' // load & validate env vars first
import { logger } from './utils/logger.js'
import { initScheduler } from './config/scheduler.js'

// ── Process-Level Crash Protection ─────────────────────────────
process.on('uncaughtException', (error) => {
  logger.error('CRITICAL: Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason)
})

import { env } from './config/env.js'
import app from './app.js'
import prisma from './config/db.js'

// Map of DB integration keys → process.env names
const INTEGRATION_ENV_MAP = {
  sys_cloudinary_cloud_name: 'CLOUDINARY_CLOUD_NAME',
  sys_cloudinary_api_key: 'CLOUDINARY_API_KEY',
  sys_cloudinary_api_secret: 'CLOUDINARY_API_SECRET',
  sys_smtp_host: 'EMAIL_HOST',
  sys_smtp_port: 'EMAIL_PORT',
  sys_smtp_user: 'EMAIL_USER',
  sys_smtp_pass: 'EMAIL_PASS',
  sys_smtp_from: 'EMAIL_FROM',
  sys_recaptcha_secret_key: 'RECAPTCHA_SECRET_KEY',
  sys_twilio_account_sid: 'TWILIO_ACCOUNT_SID',
  sys_twilio_auth_token: 'TWILIO_AUTH_TOKEN',
  sys_twilio_whatsapp_from: 'TWILIO_WHATSAPP_FROM',
  sys_admin_whatsapp_to: 'ADMIN_WHATSAPP_TO',
  sys_sentry_dsn: 'SENTRY_DSN',
  sys_ga_measurement_id: 'GA_MEASUREMENT_ID',
  sys_resend_api_key: 'RESEND_API_KEY',
}

/**
 * Load integration credentials saved via admin panel from DB into process.env.
 * DB values take precedence over .env file values so the admin's settings win.
 */
async function loadIntegrationConfig() {
  try {
    const keys = Object.keys(INTEGRATION_ENV_MAP)
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: keys } },
    })

    let loaded = 0
    for (const row of rows) {
      if (row.value && INTEGRATION_ENV_MAP[row.key]) {
        process.env[INTEGRATION_ENV_MAP[row.key]] = row.value
        loaded++
      }
    }

    if (loaded > 0) {
      logger.info(`Loaded ${loaded} integration config(s) from DB (overrides .env)`)

      // Re-configure Cloudinary with updated env
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        const { cloudinary } = await import('./utils/cloudinary.js')
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        })
      }
    }
  } catch (err) {
    // Non-fatal — .env values will still work
    logger.warn('Could not load integration config from DB:', err.message)
  }
}

const startServer = async () => {
  try {
    // Test DB connection
    await prisma.$connect()
    logger.info('Database connected successfully')

    // Load admin-saved integration keys from DB
    await loadIntegrationConfig()

    // Initialize cron automation scheduler
    initScheduler()

    app.listen(env.PORT, () => {
      logger.info(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

startServer()

import dotenv from 'dotenv'

dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  EMAIL_STRATEGY: process.env.EMAIL_STRATEGY || 'auto',
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY?.trim(),
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET?.trim(),
  INTEGRATION_MASTER_KEY: process.env.INTEGRATION_MASTER_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM,
  ADMIN_WHATSAPP_TO: process.env.ADMIN_WHATSAPP_TO,
  SENTRY_DSN: process.env.SENTRY_DSN,
  GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID,
  ADMIN_SECRET_PATH: process.env.ADMIN_SECRET_PATH
    ? process.env.ADMIN_SECRET_PATH.trim()
    : process.env.NODE_ENV === 'production'
      ? ''
      : 'admin-login',
}

// Validate required env vars at startup
const required = ['DATABASE_URL', 'JWT_SECRET']

if (process.env.NODE_ENV === 'production') {
  required.push(
    'ADMIN_SECRET_PATH',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'INTEGRATION_MASTER_KEY'
  )
}

for (const key of required) {
  const val = (env[key] !== undefined && env[key] !== null ? String(env[key]) : (process.env[key] || '')).trim()
  if (!val) {
    console.error(`[CRITICAL] Missing required environment variable: ${key}`)
    process.exit(1)
  }
}

// In production, enforce non-default ADMIN_SECRET_PATH
if (process.env.NODE_ENV === 'production') {
  const adminSecret = (env.ADMIN_SECRET_PATH || process.env.ADMIN_SECRET_PATH || '').trim()
  if (!adminSecret || adminSecret === 'admin-login' || adminSecret === 'admin') {
    console.error('[CRITICAL] ADMIN_SECRET_PATH must be set to a secure, non-default secret path in production.')
    process.exit(1)
  }
}

// In production, enforce minimum strength requirements for INTEGRATION_MASTER_KEY (>= 16 chars)
if (process.env.NODE_ENV === 'production') {
  const masterKey = (env.INTEGRATION_MASTER_KEY || process.env.INTEGRATION_MASTER_KEY || '').trim()
  if (masterKey.length < 16) {
    console.error('[CRITICAL] INTEGRATION_MASTER_KEY must be at least 16 characters long.')
    process.exit(1)
  }
}


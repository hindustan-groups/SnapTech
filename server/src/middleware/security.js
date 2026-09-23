/**
 * security.js — Central security middleware configuration
 *
 * Applied in app.js in this order:
 *  1. helmet()         — secure HTTP headers on every response
 *  2. corsOptions      — restrict to CLIENT_URL only (never wildcard *)
 *  3. apiLimiter       — 100 req / 15 min per IP on all /api routes
 *  4. contactLimiter   — 5 req / 15 min per IP on POST /api/contact (spam protection)
 *  5. validateRequest  — helper to check express-validator result and 422 on failure
 */

import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { validationResult } from 'express-validator'

// ── 1. Helmet — HTTP security headers ─────────────────────────
export const helmetConfig = helmet({
  // Content-Security-Policy tuned for a React SPA
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        // Vite dev HMR needs 'unsafe-inline' only in dev
        ...(process.env.NODE_ENV === 'development' ? ["'unsafe-inline'"] : []),
        // Google reCAPTCHA
        'https://www.google.com',
        'https://www.gstatic.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS inline styles
        'https://fonts.googleapis.com',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https://res.cloudinary.com', // Cloudinary images
      ],
      connectSrc: [
        "'self'",
        // API server URL (where fetch requests go)
        process.env.SERVER_URL || process.env.CLIENT_URL || 'http://localhost:5000',
        // In dev, also allow the Vite dev server
        ...(process.env.NODE_ENV === 'development' ? ['http://localhost:5173', 'ws://localhost:5173'] : []),
      ],
      frameSrc: [
        'https://www.google.com', // reCAPTCHA iframe
        'https://maps.google.com', // Google Maps embed
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // needed for Google Maps / Cloudinary
})

// ── 2. CORS — allow only the frontend domain ──────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  // Add production domain here via env in production
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : []),
]

export const corsOptions = cors({
  origin: (origin, callback) => {
    // Allow all origins in development or no origin (curl/mobile apps)
    if (process.env.NODE_ENV === 'development' || !origin) {
      return callback(null, true)
    }

    const cleanOrigin = origin.toLowerCase()
    if (
      allowedOrigins.includes(origin) ||
      cleanOrigin.includes('vercel.app') ||
      cleanOrigin.includes('hindustanprojects.in') ||
      cleanOrigin.includes('snaptech.digital') ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1') ||
      cleanOrigin.includes('192.168.') ||
      cleanOrigin.includes('10.')
    ) {
      return callback(null, true)
    }
    callback(new Error(`CORS: Origin '${origin}' not allowed`))
  },
  credentials: true, // needed for httpOnly JWT cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-integration-unlock-token'],
})

// Helper to log rate-limit-triggered blocks to console for Render dashboard logging
const makeLimitHandler = (limiterName) => (req, res, next, options) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
  console.warn(
    `[SECURITY_ALERT] RATE_LIMIT_BLOCKED | Limiter: ${limiterName} | IP: ${ip} | Path: ${req.originalUrl} | Method: ${req.method}`
  )
  res.status(options.statusCode).json(options.message)
}

// ── 3. General API rate limiter ────────────────────────────────
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 2000 : 500, // Relaxed limits
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // Skip entirely in dev
  message: { status: 'error', message: 'Too many requests, please try again later.' },
  handler: makeLimitHandler('API'),
})

// ── 4. Strict limiter for contact form ────────────────────────
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 submissions per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many contact requests. Please wait before submitting again.',
  },
  handler: makeLimitHandler('Contact'),
})

// ── 5. Careers Apply Rate Limiter ─────────────────────────────
export const careersLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // max 3 submissions per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many job applications from this IP. Please try again later.',
  },
  handler: makeLimitHandler('Careers'),
})

// ── 6. Admin Login Route Rate Limiter ──────────────────────────
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 10, // 10 attempts in prod
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // never block in dev
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
  handler: makeLimitHandler('AdminLogin'),
})

// ── 7. Strict limiter for admin auth routes (settings update) ─
export const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes window
  max: process.env.NODE_ENV === 'development' ? 500 : 50, // much more relaxed
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // skip entirely in dev
  message: { status: 'error', message: 'Too many login attempts. Please try again later.' },
  handler: makeLimitHandler('AdminAuth'),
})

// ── 6. express-validator result checker ───────────────────────
/**
 * Use after express-validator chains in a route.
 * Returns 422 with field-level errors if validation fails.
 *
 * @example
 *   router.post('/', [body('email').isEmail()], validateRequest, controller)
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    })
  }
  next()
}

// ── Global API Rate Limiter (100 requests per minute) ─────────
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // max 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // skip in dev
  message: {
    status: 'error',
    message: 'Too many requests. Please slow down and try again in a minute.',
  },
  handler: makeLimitHandler('Global'),
})

// ── Request Timeout (Terminate gracefully if request takes > 10s) ──
export const requestTimeout = (req, res, next) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        status: 'error',
        message: 'Request timed out. The server took too long to respond.',
      })
    }
  }, 10000) // 10 seconds

  res.on('finish', () => clearTimeout(timer))
  res.on('close', () => clearTimeout(timer))
  next()
}

// ── HTTPS Enforcement Middleware ──────────────────────────────
export const enforceHttps = (req, res, next) => {
  const url = req?.originalUrl || req?.url || ''
  if (
    process.env.NODE_ENV === 'production' &&
    req?.headers?.['x-forwarded-proto'] &&
    req.headers['x-forwarded-proto'] !== 'https' &&
    !url.startsWith('/api')
  ) {
    return res.redirect(301, `https://${req.headers.host || ''}${url}`)
  }
  next()
}

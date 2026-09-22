import express from 'express'
import cookieParser from 'cookie-parser'
import compression from 'compression'

import { helmetConfig, corsOptions, apiLimiter, globalLimiter, requestTimeout, enforceHttps } from './middleware/security.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import { requestLogger } from './middleware/logger.js'

// ── Route imports ──────────────────────────────────────────────
import healthRouter from './routes/health.route.js'
import monitoringRouter from './routes/monitoring.route.js'
import servicesRouter from './routes/services.route.js'
import projectsRouter from './routes/projects.route.js'
import teamRouter from './routes/team.route.js'
import contactRouter from './routes/contact.route.js'
import adminRouter from './routes/admin.route.js'
import uploadRouter from './routes/upload.route.js'
import testimonialsRouter from './routes/testimonials.route.js'
import contentRouter from './routes/content.route.js'
import sitemapRouter from './routes/sitemap.route.js'
import careersRouter from './routes/careers.route.js'
import backupRouter from './routes/backup.route.js'
import socialRouter from './routes/social.route.js'
import chatbotRouter from './routes/chatbot.route.js'
import blogRouter from './routes/blog.route.js'
import clientRouter from './routes/client.route.js'
import { hideAdminRoutes } from './middleware/auth.js'

const app = express()

// Disable Express signature header
app.disable('x-powered-by')

// Enable gzip/brotli response compression
app.use(compression())

// Redirect HTTP to HTTPS in production
app.use(enforceHttps)

// Enable console request logging
app.use(requestLogger)

// ── 0. Health check & Root API status — BEFORE CORS so monitoring tools can ping it ─
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Snaptech Digital API is live', website: 'https://www.snaptech.digital' })
})
app.use('/api/health', healthRouter)

// ── 1. Request Timeout (10 seconds) ───────────────────────────
app.use(requestTimeout)

// ── 1. Security headers (helmet) ──────────────────────────────
app.use(helmetConfig)

// ── 2. CORS — allow only CLIENT_URL ───────────────────────────
app.use(corsOptions)

// ── 3. Body parsers ───────────────────────────────────────────
app.use(express.json({ limit: '10kb' })) // limit body size → prevent payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser()) // needed for httpOnly JWT cookies

// ── 4. Global API rate limiters ───────────────────────────────
app.use('/api', globalLimiter) // 100 requests per minute
app.use('/api', apiLimiter) // 500 requests per 15 mins (secondary relaxed defense)

// ── 5. Routes ─────────────────────────────────────────────────
app.use('/api/services', servicesRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/team', teamRouter)
app.use('/api/contact', contactRouter)
app.use('/api/admin', hideAdminRoutes, adminRouter)
app.use('/api/upload', hideAdminRoutes, uploadRouter)
app.use('/api/testimonials', testimonialsRouter)
app.use('/api/careers', careersRouter)
app.use('/api/admin/backup', hideAdminRoutes, backupRouter)
app.use('/api/admin/social', hideAdminRoutes, socialRouter)
app.use('/api/chatbot', chatbotRouter)
app.use('/api/blog', blogRouter)
app.use('/api/client', clientRouter)
app.use('/api', contentRouter)
app.use('/api', monitoringRouter)
app.use('/sitemap.xml', sitemapRouter)

// ── 6. 404 + Error handlers ───────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app

import crypto from 'crypto'
import os from 'os'
import prisma from '../config/db.js'

// Simple IP hashing helper to preserve user privacy
const hashIp = (ip) => {
  return crypto.createHash('sha256').update(ip + (process.env.JWT_SECRET || 'hp-salt-2026')).digest('hex')
}

/**
 * POST /api/track-visit
 * Rate-limited public endpoint to log page visits.
 */
export const trackPageVisit = async (req, res, next) => {
  try {
    const { path: visitPath, referrer, userAgent } = req.body
    if (!visitPath) {
      return res.status(400).json({ status: 'error', message: 'Path is required' })
    }

    const rawIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
    const ipHash = hashIp(rawIp)

    const visit = await prisma.pageVisit.create({
      data: {
        path: visitPath,
        referrer: referrer || null,
        userAgent: userAgent || null,
        ipHash,
      },
    })

    res.status(201).json({ status: 'ok', data: { id: visit.id } })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/monitoring/stats
 * Secure endpoint to fetch traffic analytics, recent errors, and system health.
 */
export const getMonitoringStats = async (req, res, next) => {
  try {
    // 1. Fetch error logs
    const errorLogs = await prisma.errorLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    })

    // 2. Fetch traffic metrics
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [visitsToday, visitsWeek, visitsMonth, allVisits] = await Promise.all([
      prisma.pageVisit.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.pageVisit.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.pageVisit.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.pageVisit.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { path: true, createdAt: true },
      }),
    ])

    // Aggregate most visited pages
    const pathCounts = {}
    for (const v of allVisits) {
      pathCounts[v.path] = (pathCounts[v.path] || 0) + 1
    }
    const popularPages = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Generate chart data for the last 7 days
    const chartData = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)

      const count = allVisits.filter(
        (v) => v.createdAt >= startOfDay && v.createdAt <= endOfDay
      ).length

      chartData.push({ date: dateString, visits: count })
    }

    // 3. System Health Info
    let dbStatus = 'ONLINE'
    try {
      await prisma.$executeRaw`SELECT 1`
    } catch {
      dbStatus = 'OFFLINE'
    }

    const memory = process.memoryUsage()
    const systemHealth = {
      database: dbStatus,
      uptime: process.uptime(), // in seconds
      memoryUsed: Math.round(memory.heapUsed / 1024 / 1024), // in MB
      memoryTotal: Math.round(memory.heapTotal / 1024 / 1024), // in MB
      platform: process.platform,
      nodeVersion: process.version, // server-side — safe here
      cpuLoad: os.loadavg(),
    }

    // 4. Configuration Statuses
    const isSentryConfigured = !!process.env.SENTRY_DSN
    const isGAConfigured = !!process.env.GA_MEASUREMENT_ID

    res.json({
      status: 'ok',
      data: {
        errorLogs,
        traffic: {
          today: visitsToday,
          week: visitsWeek,
          month: visitsMonth,
          popularPages,
          chartData,
        },
        systemHealth,
        config: {
          sentry: isSentryConfigured,
          googleAnalytics: isGAConfigured,
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/admin/monitoring/errors/:id
 * Secure endpoint to delete an error log entry.
 */
export const deleteErrorLog = async (req, res, next) => {
  try {
    const { id } = req.params
    await prisma.errorLog.deleteMany({ where: { id } })
    res.json({ status: 'ok', message: 'Error log deleted successfully' })
  } catch (err) {
    next(err)
  }
}

export const deleteAllErrorLogs = async (req, res, next) => {
  try {
    await prisma.errorLog.deleteMany({})
    res.json({ status: 'ok', message: 'All error logs deleted successfully' })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/admin/monitoring/log-frontend-error
 * Endpoint for reporting frontend client rendering/runtime crashes.
 */
export const logFrontendError = async (req, res, next) => {
  try {
    const { errorMessage, pageOrRoute, userAgent } = req.body
    if (!errorMessage) {
      return res.status(400).json({ status: 'error', message: 'errorMessage is required' })
    }

    const log = await prisma.errorLog.create({
      data: {
        source: 'FRONTEND',
        errorMessage,
        pageOrRoute: pageOrRoute || 'unknown',
        userAgent: userAgent || req.headers['user-agent'] || null,
      },
    })

    // Check error frequency alert threshold
    checkErrorThresholdAlert()

    res.status(201).json({ status: 'ok', data: { id: log.id } })
  } catch (err) {
    next(err)
  }
}

// Memory cache to throttle/limit email alert notifications
let lastAlertTime = 0

/**
 * Checks if 5+ errors have occurred within the last 10 minutes.
 * If yes, triggers an immediate emergency email notification to the administrator.
 */
async function checkErrorThresholdAlert() {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    const errorCount = await prisma.errorLog.count({
      where: { createdAt: { gte: tenMinutesAgo } },
    })

    if (errorCount >= 5 && Date.now() - lastAlertTime > 15 * 60 * 1000) {
      lastAlertTime = Date.now()
      
      const adminEmail = process.env.ADMIN_EMAIL || 'info@snaptech.digital'
      const { sendEmail } = await import('../utils/mailer.js')

      sendEmail({
        to: adminEmail,
        subject: '🚨 CRITICAL SYSTEM ALERT: High Error Rate Detected',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #E31E24; border-radius: 8px;">
            <h2 style="color: #E31E24; margin-top: 0;">🚨 Critical System Alert: High Error Rate</h2>
            <p>The system has logged <strong>${errorCount} errors</strong> in the last 10 minutes.</p>
            <p>Something may be broken on the website. Please check the Admin Monitoring Dashboard immediately.</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 13px; color: #6B7280; text-align: center;">
              Sent automatically by Hindustan Projects Website Monitoring Service
            </p>
          </div>
        `,
        text: `Critical System Alert: High Error Rate Detected. ${errorCount} errors logged in the last 10 minutes. Check your dashboard.`,
      }).catch((err) => {
        console.error('[monitoring] Failed to send emergency error alert email:', err.message)
      })
    }
  } catch (err) {
    console.error('[monitoring] Error threshold check failed:', err.message)
  }
}

/**
 * Helper to record backend errors directly to the database and check rate thresholds.
 */
export const recordBackendError = async (message, route, userAgent) => {
  try {
    await prisma.errorLog.create({
      data: {
        source: 'BACKEND',
        errorMessage: message,
        pageOrRoute: route || 'unknown',
        userAgent: userAgent || null,
      },
    })
    checkErrorThresholdAlert()
  } catch (err) {
    console.error('[monitoring] Failed to log backend error to DB:', err.message)
  }
}

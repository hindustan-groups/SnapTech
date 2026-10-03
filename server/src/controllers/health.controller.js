import prisma from '../config/db.js'

/**
 * GET /api/health
 * Enhanced health check endpoint reporting DB status and memory usage
 */
export const healthCheck = async (_req, res) => {
  let dbStatus = 'healthy'
  try {
    // Fast database query check
    await prisma.$queryRaw`SELECT 1`
  } catch (_err) {
    dbStatus = 'unhealthy'
  }

  const memory = process.memoryUsage()

  const formattedMemory = {
    rss: `${Math.round((memory.rss / 1024 / 1024) * 100) / 100} MB`,
    heapTotal: `${Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100} MB`,
    heapUsed: `${Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100} MB`,
    external: `${Math.round((memory.external / 1024 / 1024) * 100) / 100} MB`,
  }

  const isHealthy = dbStatus === 'healthy'

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    service: 'snaptech-api',
    database: dbStatus,
    memoryUsage: formattedMemory,
  })
}

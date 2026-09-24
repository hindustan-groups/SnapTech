import prisma from '../config/db.js'
import { getCache, setCache } from '../utils/cache.js'

// Cache duration constants
const CACHE_FRESH = 'no-cache, must-revalidate'

/**
 * GET /api/services
 * Returns all active services ordered by the `order` field.
 */
export const getAllServices = async (_req, res, next) => {
  try {
    const cacheKey = 'services:all'
    const cached = getCache(cacheKey)
    if (cached) {
      res.setHeader('Cache-Control', CACHE_FRESH)
      return res.json({ status: 'ok', data: cached })
    }

    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        icon: true,
        order: true,
        tag: true,
        deliveryTime: true,
        techStack: true,
        keyFeatures: true,
        colorFrom: true,
        colorTo: true,
      },
    })
    setCache(cacheKey, services, 600) // 10 min cache
    res.setHeader('Cache-Control', CACHE_FRESH)
    res.json({ status: 'ok', data: services })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/services/:slug
 * Returns a single service by slug (full detail).
 */
export const getServiceBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params
    const cacheKey = `services:slug:${slug}`
    const cached = getCache(cacheKey)
    if (cached) {
      res.setHeader('Cache-Control', CACHE_FRESH)
      return res.json({ status: 'ok', data: cached })
    }

    const service = await prisma.service.findUnique({
      where: { slug },
    })

    if (!service || !service.isActive) {
      return res.status(404).json({ status: 'error', message: 'Service not found.' })
    }

    setCache(cacheKey, service, 600) // 10 min cache
    res.setHeader('Cache-Control', CACHE_FRESH)
    res.json({ status: 'ok', data: service })
  } catch (err) {
    next(err)
  }
}

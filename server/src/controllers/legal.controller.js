import prisma from '../config/db.js'
import { getCache, setCache, deleteCacheByPrefix } from '../utils/cache.js'
import { logActivity } from '../utils/activity.js'

// GET /api/legal/:pageType
export const getLegalPage = async (req, res, next) => {
  try {
    const { pageType } = req.params
    const cleanType = String(pageType).toUpperCase()
    const cacheKey = `legal:type:${cleanType}`
    
    const cached = getCache(cacheKey)
    if (cached) {
      return res.json({ status: 'ok', data: cached })
    }

    const page = await prisma.legalPage.findUnique({
      where: { pageType: cleanType },
    })

    if (!page) {
      return res.status(404).json({ status: 'error', message: `Legal page ${pageType} not found.` })
    }

    // SEC-01: Remove internal administrator email and audit metadata from public response DTO.
    // Preserve legitimate legal content, page type, title, id, and lastUpdated timestamp.
    const responseData = {
      id: page.id,
      pageType: page.pageType,
      title: page.title,
      content: page.content,
      lastUpdated: page.lastUpdated,
    }

    setCache(cacheKey, responseData, 600) // 10 min cache

    res.json({
      status: 'ok',
      data: responseData,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/legal
export const listLegalPages = async (_req, res, next) => {
  try {
    const pages = await prisma.legalPage.findMany({
      orderBy: { pageType: 'asc' },
    })

    const dataWithEmails = await Promise.all(
      pages.map(async (page) => {
        let adminEmail = 'System Seed'
        if (page.updatedBy) {
          const updater = await prisma.admin.findUnique({ where: { id: page.updatedBy } })
          if (updater) {
            adminEmail = updater.email
          }
        }
        return {
          ...page,
          adminEmail,
        }
      })
    )

    res.json({ status: 'ok', data: dataWithEmails })
  } catch (err) {
    next(err)
  }
}

// PUT /api/admin/legal/:pageType
export const updateLegalPage = async (req, res, next) => {
  try {
    const { pageType } = req.params
    const cleanType = String(pageType).toUpperCase()
    const { title, content } = req.body
    const adminId = req.admin?.id

    const page = await prisma.legalPage.upsert({
      where: { pageType: cleanType },
      update: {
        title,
        content,
        updatedBy: adminId,
        lastUpdated: new Date(),
      },
      create: {
        pageType: cleanType,
        title,
        content,
        updatedBy: adminId,
        lastUpdated: new Date(),
      },
    })

    deleteCacheByPrefix('legal:')
    await logActivity(req, 'UPDATE', 'LegalPage', `Updated legal page '${cleanType}'`)
    res.json({ status: 'ok', data: page })
  } catch (err) {
    next(err)
  }
}

/**
 * sitemap.route.js — Dynamic XML sitemap from DB
 * GET /api/sitemap.xml — returns XML with all pages + service slugs
 */
import { Router } from 'express'
import prisma from '../config/db.js'

const router = Router()
const BASE = process.env.CLIENT_URL || 'https://www.snaptech.digital'

router.get('/', async (_req, res, next) => {
  try {
    const [services, blogPosts, jobs] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { order: 'asc' },
      }),
      prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, publishedAt: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.jobPosting.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    const staticPages = [
      { path: '/', priority: '1.0', freq: 'weekly' },
      { path: '/services', priority: '0.9', freq: 'weekly' },
      { path: '/pricing', priority: '0.9', freq: 'weekly' },
      { path: '/about', priority: '0.7', freq: 'monthly' },
      { path: '/portfolio', priority: '0.7', freq: 'weekly' },
      { path: '/contact', priority: '0.8', freq: 'monthly' },
      { path: '/careers', priority: '0.6', freq: 'weekly' },
      { path: '/blog', priority: '0.8', freq: 'daily' },
      { path: '/privacy-policy', priority: '0.4', freq: 'yearly' },
      { path: '/terms-of-service', priority: '0.4', freq: 'yearly' },
      { path: '/refund-policy', priority: '0.4', freq: 'yearly' },
    ]

    const servicePages = services.map((s) => ({
      path: `/services/${s.slug}`,
      priority: '0.8',
      freq: 'monthly',
      lastmod: s.updatedAt.toISOString().split('T')[0],
    }))

    const blogPages = blogPosts.map((p) => ({
      path: `/blog/${p.slug}`,
      priority: '0.7',
      freq: 'monthly',
      lastmod: (p.updatedAt || p.publishedAt)?.toISOString().split('T')[0],
    }))

    const jobPages = jobs.map((j) => ({
      path: `/careers/${j.slug}`,
      priority: '0.6',
      freq: 'weekly',
      lastmod: j.updatedAt.toISOString().split('T')[0],
    }))

    const allPages = [...staticPages, ...servicePages, ...blogPages, ...jobPages]
    const today = new Date().toISOString().split('T')[0]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${BASE}${p.path}</loc>
    <lastmod>${p.lastmod || today}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 'public, max-age=86400') // 24h cache
    res.send(xml)
  } catch (err) {
    next(err)
  }
})

export default router

/**
 * sitemap.route.js — Authoritative Dynamic XML sitemap from DB
 * GET /api/sitemap.xml / /sitemap.xml
 * Returns live XML with all static pages, services, portfolio projects, blog posts, and active job postings
 */
import { Router } from 'express'
import prisma from '../config/db.js'

const router = Router()
const BASE = process.env.CLIENT_URL || 'https://www.snaptech.digital'

/**
 * Safely normalizes date values (Date objects, ISO strings, timestamps) to YYYY-MM-DD.
 * Returns null if the value is missing, invalid, or cannot be parsed deterministically.
 */
export function normalizeSitemapDate(val) {
  if (!val) return null
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val.toISOString().split('T')[0]
  }
  if (typeof val === 'string') {
    const trimmed = val.trim()
    const isoPrefixMatch = /^\d{4}-\d{2}-\d{2}/.exec(trimmed)
    if (isoPrefixMatch) {
      const d = new Date(trimmed)
      return isNaN(d.getTime()) ? null : isoPrefixMatch[0]
    }
    const d = new Date(trimmed)
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]
  }
  if (typeof val === 'number') {
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]
  }
  return null
}

/**
 * Escapes XML special characters in string values to ensure valid XML.
 */
export function escapeXml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

router.get('/', async (_req, res, next) => {
  try {
    const [services, blogPosts, jobs, projects] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { order: 'asc' },
      }),
      prisma.blogPost.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        select: { slug: true, publishedAt: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.jobPosting.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.project.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    const staticPages = [
      { path: '', priority: '1.0', freq: 'weekly' },
      { path: '/services', priority: '0.9', freq: 'weekly' },
      { path: '/pricing', priority: '0.9', freq: 'weekly' },
      { path: '/cost-calculator', priority: '0.9', freq: 'weekly' },
      { path: '/why-snaptech', priority: '0.8', freq: 'monthly' },
      { path: '/about', priority: '0.7', freq: 'monthly' },
      { path: '/portfolio', priority: '0.8', freq: 'weekly' },
      { path: '/contact', priority: '0.8', freq: 'monthly' },
      { path: '/careers', priority: '0.7', freq: 'weekly' },
      { path: '/blog', priority: '0.8', freq: 'daily' },
      { path: '/privacy-policy', priority: '0.4', freq: 'yearly' },
      { path: '/terms-of-service', priority: '0.4', freq: 'yearly' },
      { path: '/refund-policy', priority: '0.4', freq: 'yearly' },
    ]

    const servicePages = services.map((s) => ({
      path: `/services/${s.slug}`,
      priority: '0.8',
      freq: 'monthly',
      lastmod: normalizeSitemapDate(s.updatedAt),
    }))

    const projectPages = projects.map((p) => ({
      path: `/portfolio/${p.slug}`,
      priority: '0.7',
      freq: 'monthly',
      lastmod: normalizeSitemapDate(p.updatedAt),
    }))

    const blogPages = blogPosts.map((p) => ({
      path: `/blog/${p.slug}`,
      priority: '0.8',
      freq: 'weekly',
      lastmod: normalizeSitemapDate(p.updatedAt || p.publishedAt),
    }))

    const jobPages = jobs.map((j) => ({
      path: `/careers/${j.slug}`,
      priority: '0.6',
      freq: 'weekly',
      lastmod: normalizeSitemapDate(j.updatedAt),
    }))

    const allPages = [...staticPages, ...servicePages, ...projectPages, ...blogPages, ...jobPages]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${escapeXml(`${BASE}${p.path}`)}</loc>${p.lastmod ? `\n    <lastmod>${escapeXml(p.lastmod)}</lastmod>` : ''}
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
    res.send(xml)
  } catch (err) {
    next(err)
  }
})

export default router

/**
 * tests/unit/sitemap.test.js
 *
 * Regression & unit tests for Sitemap route (Fix 1).
 * Validates safe date normalization (Date objects, ISO strings, timestamps, null/invalid),
 * XML escaping, and the live GET /sitemap.xml Express endpoint.
 */

import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'
import { normalizeSitemapDate, escapeXml } from '../../src/routes/sitemap.route.js'

describe('Sitemap Route & Date Normalization (Fix 1)', () => {
  describe('normalizeSitemapDate', () => {
    it('normalizes valid Date instances to YYYY-MM-DD', () => {
      const d = new Date('2026-10-15T07:14:00.000Z')
      expect(normalizeSitemapDate(d)).toBe('2026-10-15')
    })

    it('normalizes serialized ISO date strings to YYYY-MM-DD', () => {
      const isoStr = '2026-10-15T07:01:41.152Z'
      expect(normalizeSitemapDate(isoStr)).toBe('2026-10-15')
    })

    it('normalizes simple YYYY-MM-DD date strings', () => {
      expect(normalizeSitemapDate('2026-07-23')).toBe('2026-07-23')
    })

    it('normalizes numeric millisecond timestamps', () => {
      const ts = new Date('2026-08-01T00:00:00.000Z').getTime()
      expect(normalizeSitemapDate(ts)).toBe('2026-08-01')
    })

    it('returns null for null, undefined, or empty values', () => {
      expect(normalizeSitemapDate(null)).toBeNull()
      expect(normalizeSitemapDate(undefined)).toBeNull()
      expect(normalizeSitemapDate('')).toBeNull()
      expect(normalizeSitemapDate('   ')).toBeNull()
    })

    it('returns null deterministically for invalid date strings without crashing', () => {
      expect(normalizeSitemapDate('invalid-date')).toBeNull()
      expect(normalizeSitemapDate('2026-99-99')).toBeNull()
      expect(normalizeSitemapDate('not-a-timestamp')).toBeNull()
    })

    it('returns null for Invalid Date objects without crashing', () => {
      const invalidDate = new Date('invalid')
      expect(normalizeSitemapDate(invalidDate)).toBeNull()
    })
  })

  describe('escapeXml', () => {
    it('escapes &, <, >, ", and \' correctly', () => {
      expect(escapeXml('a & b < c > d "e" \'f\'')).toBe('a &amp; b &lt; c &gt; d &quot;e&quot; &apos;f&apos;')
    })

    it('handles empty or null input gracefully', () => {
      expect(escapeXml('')).toBe('')
      expect(escapeXml(null)).toBe('')
      expect(escapeXml(undefined)).toBe('')
    })
  })

  describe('GET /sitemap.xml Integration', () => {
    it('returns HTTP 200 with application/xml content-type and valid XML structure', async () => {
      const res = await request(app).get('/sitemap.xml')

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('application/xml')
      expect(res.headers['cache-control']).toContain('public, max-age=3600')

      const text = res.text
      expect(text).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(text).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
      expect(text).toContain('</urlset>')

      // Verify canonical static pages exist
      const base = process.env.CLIENT_URL || 'https://www.snaptech.digital'
      expect(text).toContain(`<loc>${base}</loc>`)
      expect(text).toContain(`<loc>${base}/services</loc>`)
      expect(text).toContain(`<loc>${base}/pricing</loc>`)
      expect(text).toContain(`<loc>${base}/why-snaptech</loc>`)
      expect(text).toContain(`<loc>${base}/portfolio</loc>`)
      expect(text).toContain(`<loc>${base}/contact</loc>`)

      // Ensure lastmod is either omitted or has valid YYYY-MM-DD format
      const lastmodMatches = text.match(/<lastmod>(.*?)<\/lastmod>/g) || []
      expect(lastmodMatches.length).toBeGreaterThan(0)
      for (const m of lastmodMatches) {
        const datePart = m.replace('<lastmod>', '').replace('</lastmod>', '')
        expect(datePart).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    })
  })
})

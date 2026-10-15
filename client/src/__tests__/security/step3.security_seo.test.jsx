/**
 * step3.security_seo.test.jsx
 *
 * Tests for Step 3:
 * - SEC-04: Content Security Policy & Permissions-Policy in vercel.json
 * - SEO-02: Sitemap edge cache headers
 * - SEO-01: Soft-404 robots tag override capability
 * - A11Y-02: Heading hierarchy structural consistency
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Step 3 Remediation: Security, SEO & Accessibility Config', () => {
  const vercelJsonPath = path.resolve(__dirname, '../../../vercel.json')
  const indexHtmlPath = path.resolve(__dirname, '../../../index.html')
  const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'))
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8')

  describe('SEC-04: Content Security Policy & Security Headers', () => {
    it('defines a valid Content-Security-Policy on root catch-all routes', () => {
      const globalHeaderEntry = vercelConfig.headers.find((h) => h.source === '/(.*)')
      expect(globalHeaderEntry).toBeDefined()

      const cspHeader = globalHeaderEntry.headers.find((h) => h.key === 'Content-Security-Policy')
      expect(cspHeader).toBeDefined()
      const cspValue = cspHeader.value

      // Verify essential directives
      expect(cspValue).toContain("default-src 'self'")
      expect(cspValue).toContain('https://www.google.com')
      expect(cspValue).toContain('https://www.gstatic.com')
      expect(cspValue).toContain('https://res.cloudinary.com')
      expect(cspValue).toContain("object-src 'none'")
      expect(cspValue).toContain("base-uri 'self'")
      // Verify unsafe-eval is not permitted
      expect(cspValue).not.toContain("'unsafe-eval'")
    })

    it('defines a restrictive Permissions-Policy header', () => {
      const globalHeaderEntry = vercelConfig.headers.find((h) => h.source === '/(.*)')
      const permHeader = globalHeaderEntry.headers.find((h) => h.key === 'Permissions-Policy')
      expect(permHeader).toBeDefined()
      expect(permHeader.value).toContain('camera=()')
      expect(permHeader.value).toContain('microphone=()')
      expect(permHeader.value).toContain('geolocation=()')
    })
  })

  describe('SEO-02: Dynamic Sitemap Edge Cache TTL', () => {
    it('configures s-maxage=3600 on /sitemap.xml rather than 24h stale cache', () => {
      const sitemapHeaderEntry = vercelConfig.headers.find((h) => h.source === '/sitemap.xml')
      expect(sitemapHeaderEntry).toBeDefined()

      const cacheHeader = sitemapHeaderEntry.headers.find((h) => h.key === 'Cache-Control')
      expect(cacheHeader).toBeDefined()
      expect(cacheHeader.value).toContain('s-maxage=3600')
      expect(cacheHeader.value).not.toContain('s-maxage=86400')
    })
  })

  describe('SEO-01: Soft-404 Robots Meta Tag Override Support', () => {
    it('includes data-rh="true" on static robots meta tag in index.html', () => {
      // Must contain data-rh="true" so React Helmet Async replaces it cleanly on NotFoundPage
      expect(indexHtml).toMatch(/<meta\s+name="robots"\s+data-rh="true"/i)
    })
  })

  describe('A11Y-02: Heading Structure Verification in Sections', () => {
    it('ProcessSection does not skip from h2 to h4 in preview cards', () => {
      const processSectionPath = path.resolve(__dirname, '../../components/sections/ProcessSection.jsx')
      const content = fs.readFileSync(processSectionPath, 'utf8')
      expect(content).not.toContain('<h4')
    })

    it('WhyUsSection does not skip from h2 to h4 in preview cards', () => {
      const whyUsSectionPath = path.resolve(__dirname, '../../components/sections/WhyUsSection.jsx')
      const content = fs.readFileSync(whyUsSectionPath, 'utf8')
      expect(content).not.toContain('<h4')
    })

    it('ParentGroupSection does not skip from h2 to h4 in gateway card', () => {
      const parentGroupPath = path.resolve(__dirname, '../../components/sections/ParentGroupSection.jsx')
      const content = fs.readFileSync(parentGroupPath, 'utf8')
      expect(content).not.toContain('<h4')
    })
  })
})

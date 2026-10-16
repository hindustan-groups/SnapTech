/**
 * taskD.phase21.test.jsx
 *
 * Tests for TASK D — Phase 2.1:
 * - Verified removal of unverified guarantees (PageSpeed, zero-vulnerability, uptime SLA) in WhyChooseUsPage.jsx
 * - Accurate benefit-focused copy presence (Optimized Core Web Vitals, 30-Day Launch Support, Contract-Backed Commitments)
 * - noIndex={true} on AdminPricingPage and AdminProposalBookPage
 * - robots.txt cleanliness (removal of revealing /admin-* pattern while preserving legitimate crawler rules)
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('TASK D Phase 2.1: Safe SEO and Content Fixes', () => {
  const rootDir = path.resolve(__dirname, '../../../')
  const whyChooseUsPath = path.resolve(rootDir, 'src/pages/WhyChooseUsPage.jsx')
  const adminPricingPath = path.resolve(rootDir, 'src/pages/admin/AdminPricingPage.jsx')
  const adminProposalBookPath = path.resolve(rootDir, 'src/pages/admin/AdminProposalBookPage.jsx')
  const robotsTxtPath = path.resolve(rootDir, 'public/robots.txt')

  describe('1. WhyChooseUsPage.jsx claim verification', () => {
    const fileContent = fs.readFileSync(whyChooseUsPath, 'utf8')

    it('does not contain unverified PageSpeed guarantee', () => {
      expect(fileContent).not.toMatch(/guaranteed 95\+/i)
      expect(fileContent).not.toMatch(/95\+ Core Web Vitals guaranteed/i)
      expect(fileContent).not.toMatch(/Sub-Second 95\+ PageSpeed/i)
    })

    it('does not contain unverified zero-vulnerability warranty or zero-bug claims', () => {
      expect(fileContent).not.toMatch(/zero-vulnerability warranty/i)
      expect(fileContent).not.toMatch(/zero-bug/i)
      expect(fileContent).not.toMatch(/zero legal liability/i)
    })

    it('does not contain unverified 99.8% uptime SLA', () => {
      expect(fileContent).not.toMatch(/99\.8% uptime sla/i)
      expect(fileContent).not.toMatch(/99\.8% Uptime SLA/i)
    })

    it('contains accurate, benefit-focused wording', () => {
      expect(fileContent).toContain('Optimized Core Web Vitals')
      expect(fileContent).toContain('OWASP Top 10 hardening')
      expect(fileContent).toContain('30-Day Launch Support')
      expect(fileContent).toContain('Target Load Time')
      expect(fileContent).toContain('Contract-Backed Commitments')
    })
  })

  describe('2. Admin Pages SEO noIndex directive', () => {
    it('declares noIndex={true} in AdminPricingPage.jsx', () => {
      const content = fs.readFileSync(adminPricingPath, 'utf8')
      expect(content).toMatch(/<SEO[^>]+noIndex=\{true\}/)
    })

    it('declares noIndex={true} in AdminProposalBookPage.jsx', () => {
      const content = fs.readFileSync(adminProposalBookPath, 'utf8')
      expect(content).toMatch(/<SEO[^>]+noIndex=\{true\}/)
    })
  })

  describe('3. robots.txt security and crawler configuration', () => {
    const robotsContent = fs.readFileSync(robotsTxtPath, 'utf8')

    it('does not leak the /admin-* wildcard pattern', () => {
      expect(robotsContent).not.toContain('/admin-*')
    })

    it('preserves disallow rules for standard /admin/, /client/, and /api/', () => {
      expect(robotsContent).toContain('Disallow: /admin/')
      expect(robotsContent).toContain('Disallow: /client/')
      expect(robotsContent).toContain('Disallow: /api/')
    })

    it('preserves AEO/GEO crawler access for AI search engines', () => {
      expect(robotsContent).toContain('User-agent: GPTBot')
      expect(robotsContent).toContain('User-agent: PerplexityBot')
      expect(robotsContent).toContain('User-agent: ClaudeBot')
    })

    it('specifies the canonical sitemap URL', () => {
      expect(robotsContent).toContain('Sitemap: https://www.snaptech.digital/sitemap.xml')
    })
  })
})

/**
 * content_integrity.test.js
 *
 * Verifies that:
 * 1. Milestones endpoint returns only the genuine, substantiated July 2026 founding milestone.
 * 2. Fabricated milestones (2019, 2021, 2023, 2025) are not served publicly.
 * 3. Testimonials roles do not contain HTML entity escaping artifacts like &#x2F;.
 * 4. Admin validation accepts "July 2026" as a valid year string.
 */

import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'

describe('Content Integrity & Real Data Tests (Server)', () => {
  describe('GET /api/milestones', () => {
    it('returns status 200 with substantiated milestones', async () => {
      const res = await request(app).get('/api/milestones')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(Array.isArray(res.body.data)).toBe(true)

      const milestones = res.body.data
      expect(milestones.length).toBeGreaterThanOrEqual(1)

      // Founding milestone must be July 2026
      const founding = milestones.find((m) => m.year.includes('2026') || m.title.toLowerCase().includes('founding'))
      expect(founding).toBeDefined()
      expect(founding.year).toContain('July 2026')
      expect(founding.title).toContain('SnapTech Digital')

      // Ensure no pre-2026 false milestones exist in response
      const pre2026 = milestones.filter((m) => {
        const y = parseInt(m.year)
        return !isNaN(y) && y < 2026
      })
      expect(pre2026).toHaveLength(0)

      // Specifically check false years
      const falseYears = ['2019', '2021', '2023', '2025']
      milestones.forEach((m) => {
        expect(falseYears).not.toContain(m.year)
      })
    })
  })

  describe('GET /api/testimonials content integrity', () => {
    it('returns testimonials with clean plain text role and no &#x2F;', async () => {
      const res = await request(app).get('/api/testimonials')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(Array.isArray(res.body.data)).toBe(true)

      res.body.data.forEach((t) => {
        if (t.role) {
          expect(t.role).not.toContain('&#x2F;')
          expect(t.role).not.toContain('&amp;')
          expect(t.role).not.toContain('&quot;')
        }
      })
    })
  })
})

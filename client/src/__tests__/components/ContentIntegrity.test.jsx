/**
 * ContentIntegrity.test.jsx
 *
 * Regression tests for Phase 2: Complete Real Data & Content Integrity Fix.
 * Verifies that:
 * 1. SnapTech Digital founding date is strictly July 2026 (2026-07 in schema).
 * 2. Organization and LocalBusiness schemas output foundingDate: '2026-07'.
 * 3. StatsSection renders genuine capability pillars without NaN.
 * 4. useCountUp hook safely returns string values without calculation errors.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { organizationSchema, localBusinessSchema } from '@/components/ui/SEO'
import StatsSection from '@/components/sections/StatsSection'
import { useCountUp } from '@/hooks/useCountUp'
import { renderHook } from '@testing-library/react'

describe('Content Integrity & Real Data Tests', () => {
  describe('SEO & Structured Data Schemas', () => {
    it('organizationSchema contains exact foundingDate "2026-07"', () => {
      const schema = organizationSchema()
      expect(schema.foundingDate).toBe('2026-07')
      expect(schema.name).toBe('SnapTech Digital')
      expect(schema.parentOrganization.name).toBe('Hindustan Projects Group')
    })

    it('localBusinessSchema contains exact foundingDate "2026-07"', () => {
      const schema = localBusinessSchema()
      expect(schema.foundingDate).toBe('2026-07')
      expect(schema.name).toBe('SnapTech Digital')
    })

    it('schema does not contain fabricated founding years (e.g. 2019, 2021, 2025)', () => {
      const org = organizationSchema()
      const str = JSON.stringify(org)
      expect(str).not.toContain('"foundingDate":"2019"')
      expect(str).not.toContain('"foundingDate":"2021"')
      expect(str).not.toContain('"foundingDate":"2025"')
    })
  })

  describe('useCountUp hook safety', () => {
    it('returns string targets verbatim without NaN', () => {
      const { result } = renderHook(() => useCountUp('July 2026'))
      expect(result.current.count).toBe('July 2026')
      expect(result.current.count).not.toBeNaN()
    })

    it('handles numeric targets properly', () => {
      const { result } = renderHook(() => useCountUp(100))
      expect(typeof result.current.count).toBe('number')
      expect(result.current.count).not.toBeNaN()
    })
  })

  describe('StatsSection Rendering', () => {
    it('renders July 2026 founded inception pillar without NaN', () => {
      render(<StatsSection />)
      expect(screen.getByText('July 2026')).toBeInTheDocument()
      expect(screen.getByText('Founded Inception')).toBeInTheDocument()
      expect(screen.getByText('Code Ownership')).toBeInTheDocument()
      expect(screen.getByText('Parent Enterprise')).toBeInTheDocument()
      expect(screen.getByText('Delivery Reach')).toBeInTheDocument()

      // Ensure no NaN text exists in the rendered tree
      const bodyText = document.body.textContent
      expect(bodyText).not.toContain('NaN')
    })
  })
})

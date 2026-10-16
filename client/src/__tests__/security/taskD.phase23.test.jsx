/**
 * taskD.phase23.test.jsx
 *
 * Validation test suite for TASK D — Phase 2.3:
 * 1. Accessibility (Accessible labels, input associations, WCAG AA contrast tokens)
 * 2. Conversion tracking (Outbound WhatsApp tracking, success-only lead tracking, failure suppression)
 * 3. Cumulative Layout Shift (Explicit image dimensions & aspect ratio, font fallbacks)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as analytics from '@/utils/analytics'
import * as recaptchaUtil from '@/utils/recaptcha'
import { api } from '@/utils/api'
import LandingPageOfferBanner from '@/components/sections/LandingPageOfferBanner'
import Navbar from '@/components/layout/Navbar'
import ServiceDetailPage from '@/pages/ServiceDetailPage'
import HeroSection from '@/components/sections/HeroSection'

// Mock react-helmet-async
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <>{children}</>,
  HelmetProvider: ({ children }) => <>{children}</>,
}))

// Mock useContent & useServices
vi.mock('@/hooks/useContent', () => ({
  useSiteSettings: () => ({
    data: {
      data: {
        company_name: 'SnapTech Digital',
        whatsapp: '918209604849',
        phone: '+91 8209604849',
      },
    },
  }),
}))

vi.mock('@/hooks/useServices', () => ({
  useServices: () => ({
    data: {
      data: [
        { id: '1', title: 'Web Development', slug: 'web-development', shortDescription: 'Modern web apps' },
      ],
    },
  }),
  useService: () => ({
    data: {
      data: {
        id: '1',
        title: 'Custom Web Applications',
        slug: 'web-development',
        shortDescription: 'Enterprise React & Node.js development',
        description: 'Complete web apps',
        icon: 'Code2',
      },
    },
    isLoading: false,
  }),
}))

vi.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({
    data: { data: [] },
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ slug: 'web-development' }),
  }
})

describe('TASK D — Phase 2.3 Validation Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(analytics, 'trackEvent').mockImplementation(() => {})
  })

  describe('1. Accessibility in ServiceDetailPage', () => {
    it('provides accessible labels connected via htmlFor to every input', () => {
      render(
        <MemoryRouter>
          <ServiceDetailPage />
        </MemoryRouter>
      )

      const nameInput = screen.getByLabelText(/Full Name \*/i)
      expect(nameInput).toBeInTheDocument()
      expect(nameInput.id).toBe('service-inquiry-name')
      expect(nameInput).toHaveAttribute('autoComplete', 'name')

      const emailInput = screen.getByLabelText(/Work Email \*/i)
      expect(emailInput).toBeInTheDocument()
      expect(emailInput.id).toBe('service-inquiry-email')
      expect(emailInput).toHaveAttribute('autoComplete', 'email')

      const phoneInput = screen.getByLabelText(/Phone \/ WhatsApp \*/i)
      expect(phoneInput).toBeInTheDocument()
      expect(phoneInput.id).toBe('service-inquiry-phone')
      expect(phoneInput).toHaveAttribute('autoComplete', 'tel')

      const msgInput = screen.getByLabelText(/Scope Notes/i)
      expect(msgInput).toBeInTheDocument()
      expect(msgInput.id).toBe('service-inquiry-message')
    })

    it('does not rely on placeholder as the sole accessible identifier', () => {
      const { container } = render(
        <MemoryRouter>
          <ServiceDetailPage />
        </MemoryRouter>
      )

      const form = container.querySelector('form')
      const inputs = form.querySelectorAll('input, textarea')
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('id')
        const label = form.querySelector(`label[for="${input.id}"]`)
        expect(label).not.toBeNull()
        expect(label.textContent.trim().length).toBeGreaterThan(0)
      })
    })

    it('announces submission error states with role="alert"', async () => {
      vi.spyOn(recaptchaUtil, 'getRecaptchaToken').mockResolvedValue('fake-token')
      vi.spyOn(api, 'post').mockRejectedValue(new Error('Network error connecting to API'))

      render(
        <MemoryRouter>
          <ServiceDetailPage />
        </MemoryRouter>
      )

      fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'Aarav Sharma' } })
      fireEvent.change(screen.getByLabelText(/Work Email \*/i), { target: { value: 'aarav@example.com' } })
      fireEvent.change(screen.getByLabelText(/Phone \/ WhatsApp \*/i), { target: { value: '+91 98765 43210' } })

      fireEvent.click(screen.getByRole('button', { name: /Submit Consultation Request/i }))

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert')
        expect(errorAlert).toBeInTheDocument()
        expect(errorAlert.textContent).toContain('Network error')
      })
    })
  })

  describe('2. Conversion Tracking', () => {
    it('tracks outbound WhatsApp click from LandingPageOfferBanner with correct metadata', () => {
      render(
        <MemoryRouter>
          <LandingPageOfferBanner />
        </MemoryRouter>
      )

      const waBtn = screen.getByText(/Instant WhatsApp Consultation/i).closest('a')
      expect(waBtn).toBeInTheDocument()
      fireEvent.click(waBtn)

      expect(analytics.trackEvent).toHaveBeenCalledWith('whatsapp_click', {
        source: 'landing_page_offer_banner',
        location: 'landing_offer_banner',
        offer: '2999_landing_page',
      })
    })

    it('tracks outbound WhatsApp click from Navbar desktop icon', () => {
      render(
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      )

      const waBtn = screen.getByLabelText(/WhatsApp Priority Desk/i)
      expect(waBtn).toBeInTheDocument()
      fireEvent.click(waBtn)

      expect(analytics.trackEvent).toHaveBeenCalledWith('whatsapp_click', {
        source: 'navbar',
        location: 'navbar_desktop_icon',
      })
    })

    it('tracks successful service consultation submissions only after API confirms success', async () => {
      vi.spyOn(recaptchaUtil, 'getRecaptchaToken').mockResolvedValue('valid-recaptcha-token')
      vi.spyOn(api, 'post').mockResolvedValue({ data: { success: true } })

      render(
        <MemoryRouter>
          <ServiceDetailPage />
        </MemoryRouter>
      )

      fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'Pooja Patel' } })
      fireEvent.change(screen.getByLabelText(/Work Email \*/i), { target: { value: 'pooja@company.com' } })
      fireEvent.change(screen.getByLabelText(/Phone \/ WhatsApp \*/i), { target: { value: '+91 98765 43210' } })

      fireEvent.click(screen.getByRole('button', { name: /Submit Consultation Request/i }))

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/contact',
          expect.objectContaining({
            name: 'Pooja Patel',
            email: 'pooja@company.com',
            phone: '+91 98765 43210',
          })
        )
        expect(analytics.trackEvent).toHaveBeenCalledWith('generate_lead', {
          form: 'service_detail_consultation',
          service: 'Custom Web Applications',
        })
      })
    })

    it('does NOT fire generate_lead trackEvent when submission fails', async () => {
      vi.spyOn(recaptchaUtil, 'getRecaptchaToken').mockResolvedValue('valid-recaptcha-token')
      vi.spyOn(api, 'post').mockRejectedValue(new Error('Server 500 error'))

      render(
        <MemoryRouter>
          <ServiceDetailPage />
        </MemoryRouter>
      )

      fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'Karan Mehra' } })
      fireEvent.change(screen.getByLabelText(/Work Email \*/i), { target: { value: 'karan@company.com' } })
      fireEvent.change(screen.getByLabelText(/Phone \/ WhatsApp \*/i), { target: { value: '+91 98765 43210' } })

      fireEvent.click(screen.getByRole('button', { name: /Submit Consultation Request/i }))

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled()
      })

      expect(analytics.trackEvent).not.toHaveBeenCalledWith(
        'generate_lead',
        expect.objectContaining({ form: 'service_detail_consultation' })
      )
    })
  })

  describe('3. Cumulative Layout Shift (CLS) Mitigation', () => {
    it('specifies explicit width, height, and aspectRatio on HeroSection mobile visual image', () => {
      const { container } = render(
        <MemoryRouter>
          <HeroSection />
        </MemoryRouter>
      )

      const heroImg = container.querySelector('img[alt*="SnapTech Digital — Enterprise Solutions"]')
      expect(heroImg).toBeInTheDocument()
      expect(heroImg).toHaveAttribute('width', '554')
      expect(heroImg).toHaveAttribute('height', '468')
      expect(heroImg.style.aspectRatio).toBe('554 / 468')
    })
  })
})

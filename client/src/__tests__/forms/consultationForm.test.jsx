/**
 * consultationForm.test.jsx
 * Unit & regression tests for the ServiceDetailPage consultation form
 * Verifies reCAPTCHA token acquisition, submission payload, and error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ServiceDetailPage from '@/pages/ServiceDetailPage'
import { api } from '@/utils/api'
import * as recaptchaUtil from '@/utils/recaptcha'

// Mock dependencies
vi.mock('@/hooks/useServices', () => ({
  useService: vi.fn(() => ({
    data: {
      data: {
        id: 'srv-1',
        slug: 'web-development',
        title: 'Custom Web Applications',
        shortDescription: 'Enterprise scalable web applications.',
        keyFeatures: ['Feature 1', 'Feature 2'],
      },
    },
    isLoading: false,
  })),
  useServices: vi.fn(() => ({
    data: { data: [] },
    isLoading: false,
  })),
}))

vi.mock('@/hooks/useProjects', () => ({
  useProjects: vi.fn(() => ({
    data: { data: [] },
    isLoading: false,
  })),
}))

vi.mock('@/hooks/useContent', () => ({
  useSiteSettings: vi.fn(() => ({
    data: {
      data: {
        phone: '+91 8209604849',
        email: 'info@snaptech.digital',
      },
    },
    isLoading: false,
  })),
}))

vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    SEO: () => null,
  }
})

describe('ServiceDetailPage Consultation Form', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={['/services/web-development']}>
        <Routes>
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('obtains reCAPTCHA token with service_inquiry action and successfully submits inquiry', async () => {
    const tokenSpy = vi
      .spyOn(recaptchaUtil, 'getRecaptchaToken')
      .mockResolvedValueOnce('valid-mock-service-token')

    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: { status: 'ok', message: 'Inquiry received' },
    })

    renderPage()

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/Your Name/i), {
      target: { value: 'Aarav Sharma' },
    })
    fireEvent.change(screen.getByPlaceholderText(/rahul@company\.com/i), {
      target: { value: 'aarav@techcorp.in' },
    })
    fireEvent.change(screen.getByPlaceholderText(/\+91 98765 43210/i), {
      target: { value: '+91 98765 43210' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Requirements or deadlines\.\.\./i), {
      target: { value: 'Need full-stack portal with high concurrency.' },
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Submit Consultation Request/i }))

    await waitFor(() => {
      expect(tokenSpy).toHaveBeenCalledWith('service_inquiry')
      expect(postSpy).toHaveBeenCalledWith('/contact', {
        name: 'Aarav Sharma',
        email: 'aarav@techcorp.in',
        phone: '+91 98765 43210',
        serviceInterested: 'Custom Web Applications',
        message: expect.stringContaining('Direct Service Desk Inquiry for Custom Web Applications'),
        recaptchaToken: 'valid-mock-service-token',
        _hp: '',
      })
    })

    // Verify success confirmation is rendered
    await waitFor(() => {
      expect(screen.getByText(/Consultation Scheduled!/i)).toBeInTheDocument()
    })
  })

  it('displays user-friendly error if reCAPTCHA token cannot be acquired', async () => {
    vi.spyOn(recaptchaUtil, 'getRecaptchaToken').mockResolvedValueOnce('')
    const postSpy = vi.spyOn(api, 'post')

    renderPage()

    fireEvent.change(screen.getByPlaceholderText(/Your Name/i), {
      target: { value: 'Aarav Sharma' },
    })
    fireEvent.change(screen.getByPlaceholderText(/rahul@company\.com/i), {
      target: { value: 'aarav@techcorp.in' },
    })
    fireEvent.change(screen.getByPlaceholderText(/\+91 98765 43210/i), {
      target: { value: '+91 98765 43210' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Submit Consultation Request/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Security verification could not be completed/i)
      ).toBeInTheDocument()
    })
    expect(postSpy).not.toHaveBeenCalled()
  })

  it('displays backend error message when server rejects inquiry submission', async () => {
    vi.spyOn(recaptchaUtil, 'getRecaptchaToken').mockResolvedValueOnce('mock-token')
    vi.spyOn(api, 'post').mockRejectedValueOnce({
      response: {
        data: {
          message: 'You have already submitted an inquiry in the last 24 hours.',
        },
      },
    })

    renderPage()

    fireEvent.change(screen.getByPlaceholderText(/Your Name/i), {
      target: { value: 'Aarav Sharma' },
    })
    fireEvent.change(screen.getByPlaceholderText(/rahul@company\.com/i), {
      target: { value: 'aarav@techcorp.in' },
    })
    fireEvent.change(screen.getByPlaceholderText(/\+91 98765 43210/i), {
      target: { value: '+91 98765 43210' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Submit Consultation Request/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/You have already submitted an inquiry in the last 24 hours/i)
      ).toBeInTheDocument()
    })
  })
})

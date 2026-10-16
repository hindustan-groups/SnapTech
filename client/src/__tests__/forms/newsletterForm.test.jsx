/**
 * newsletterForm.test.jsx
 * Unit & regression tests for the Footer newsletter subscription form.
 * Verifies reCAPTCHA token acquisition, submission payload, and user feedback.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from '@/components/layout/Footer'
import { api } from '@/utils/api'
import * as recaptchaUtil from '@/utils/recaptcha'

// Mock dependencies
vi.mock('@/hooks/useContent', () => ({
  useSiteSettings: vi.fn(() => ({
    data: {
      data: {
        phone: '+91 8209604849',
        email: 'info@snaptech.digital',
        address: 'Bhilwara, Rajasthan 311001, India',
        company_name: 'SnapTech Digital',
      },
    },
    isLoading: false,
  })),
}))

vi.mock('@/hooks/useServices', () => ({
  useServices: vi.fn(() => ({
    data: { data: [] },
    isLoading: false,
  })),
}))

vi.mock('@/components/ui/WaterRippleLogo', () => ({
  default: () => <div data-testid="water-ripple-logo">Logo</div>,
}))

describe('Footer Newsletter Subscription Form', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  function renderFooter() {
    return render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )
  }

  it('obtains reCAPTCHA token with newsletter_footer action and subscribes successfully', async () => {
    const tokenSpy = vi
      .spyOn(recaptchaUtil, 'getRecaptchaToken')
      .mockResolvedValueOnce('valid-mock-newsletter-token')

    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: { status: 'ok', message: 'Subscribed' },
    })

    renderFooter()

    const emailInput = screen.getByPlaceholderText(/your@email\.com/i)
    fireEvent.change(emailInput, { target: { value: 'subscriber@techcorp.in' } })

    const submitBtn = screen.getByRole('button', { name: /Subscribe/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(tokenSpy).toHaveBeenCalledWith('newsletter_footer')
      expect(postSpy).toHaveBeenCalledWith('/contact', {
        name: 'Newsletter Subscriber',
        email: 'subscriber@techcorp.in',
        message: 'Newsletter subscription from Footer',
        serviceInterested: 'Newsletter',
        recaptchaToken: 'valid-mock-newsletter-token',
        _hp: '',
      })
    })

    await waitFor(() => {
      expect(screen.getByText(/Subscribed! We'll be in touch\./i)).toBeInTheDocument()
    })
  })

  it('displays error message if reCAPTCHA token cannot be acquired', async () => {
    vi.spyOn(recaptchaUtil, 'getRecaptchaToken').mockResolvedValueOnce('')
    const postSpy = vi.spyOn(api, 'post')

    renderFooter()

    const emailInput = screen.getByPlaceholderText(/your@email\.com/i)
    fireEvent.change(emailInput, { target: { value: 'subscriber@techcorp.in' } })

    const submitBtn = screen.getByRole('button', { name: /Subscribe/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Security verification failed/i)).toBeInTheDocument()
    })
    expect(postSpy).not.toHaveBeenCalled()
  })

  it('displays server error message when API call fails', async () => {
    vi.spyOn(recaptchaUtil, 'getRecaptchaToken').mockResolvedValueOnce('mock-token')
    vi.spyOn(api, 'post').mockRejectedValueOnce({
      response: {
        data: {
          message: 'You have already submitted an inquiry in the last 24 hours.',
        },
      },
    })

    renderFooter()

    const emailInput = screen.getByPlaceholderText(/your@email\.com/i)
    fireEvent.change(emailInput, { target: { value: 'subscriber@techcorp.in' } })

    const submitBtn = screen.getByRole('button', { name: /Subscribe/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(
        screen.getByText(/You have already submitted an inquiry in the last 24 hours/i)
      ).toBeInTheDocument()
    })
  })
})

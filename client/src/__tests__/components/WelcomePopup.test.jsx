/**
 * WelcomePopup.test.jsx
 * Unit and integration tests for the improved WelcomePopup component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WelcomePopup from '@/components/ui/WelcomePopup'
import * as analytics from '@/utils/analytics'

// Mock framer-motion to execute synchronously in jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

// Mock useSiteSettings
vi.mock('@/hooks/useContent', () => ({
  useSiteSettings: vi.fn(() => ({
    data: {
      data: {
        phone: '+91 8209604849',
        whatsapp: '+91 8209604849',
      },
    },
    isLoading: false,
  })),
}))

// Mock trackEvent
vi.spyOn(analytics, 'trackEvent')

describe('WelcomePopup Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
    document.body.style.overflow = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ''
  })

  function renderPopup(initialPath = '/') {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <WelcomePopup />
      </MemoryRouter>
    )
  }

  it('renders popup after 7-second timer on eligible routes', () => {
    renderPopup('/')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Fast-forward 7000ms
    act(() => {
      vi.advanceTimersByTime(7000)
    })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Need a Fast, Modern Website or Custom Software\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Get a Clear Project Estimate/i)).toBeInTheDocument()
    expect(screen.getByText(/Instant WhatsApp Consultation/i)).toBeInTheDocument()

    expect(analytics.trackEvent).toHaveBeenCalledWith('popup_impression', {
      popup_name: 'welcome_modal',
    })
  })

  it('suppresses popup on conversion routes (/contact, /thank-you)', () => {
    renderPopup('/contact')

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('suppresses popup on legal policy routes (/privacy-policy, /terms-of-service)', () => {
    renderPopup('/privacy-policy')

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('respects 7-day cooldown in localStorage', () => {
    // Set timestamp from 2 days ago (cooldown is 7 days)
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000
    localStorage.setItem('snaptech_welcome_v2', twoDaysAgo.toString())

    renderPopup('/')

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not open if another modal is active in the DOM', () => {
    // Create an active modal element in document
    const activeModal = document.createElement('div')
    activeModal.setAttribute('role', 'dialog')
    activeModal.setAttribute('aria-modal', 'true')
    activeModal.id = 'active-quote-modal'
    document.body.appendChild(activeModal)

    renderPopup('/')

    act(() => {
      vi.advanceTimersByTime(7000)
    })

    expect(screen.queryByText(/Need a Fast, Modern Website or Custom Software\?/i)).not.toBeInTheDocument()

    // Clean up mock modal
    document.body.removeChild(activeModal)
  })

  it('locks body scroll when open and restores it upon closing', () => {
    renderPopup('/')

    act(() => {
      vi.advanceTimersByTime(7000)
    })

    expect(document.body.style.overflow).toBe('hidden')

    const closeBtn = screen.getByRole('button', { name: /Close popup/i })
    fireEvent.click(closeBtn)

    expect(document.body.style.overflow).toBe('')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on Escape key press and records dismissal', () => {
    renderPopup('/')

    act(() => {
      vi.advanceTimersByTime(7000)
    })

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(localStorage.getItem('snaptech_welcome_v2')).toBeTruthy()
    expect(sessionStorage.getItem('snaptech_welcome_v2')).toBe('dismissed')
    expect(analytics.trackEvent).toHaveBeenCalledWith('popup_dismiss', {
      popup_name: 'welcome_modal',
      method: 'escape_key',
    })
  })

  it('handles WhatsApp consultation CTA click', () => {
    const originalOpen = window.open
    window.open = vi.fn()

    renderPopup('/')

    act(() => {
      vi.advanceTimersByTime(7000)
    })

    const waBtn = screen.getByRole('button', { name: /Instant WhatsApp Consultation/i })
    fireEvent.click(waBtn)

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('wa.me/918209604849'),
      '_blank',
      'noopener,noreferrer'
    )
    expect(analytics.trackEvent).toHaveBeenCalledWith('popup_cta_click', {
      popup_name: 'welcome_modal',
      action: 'whatsapp_consultation',
      destination: 'whatsapp',
    })

    window.open = originalOpen
  })
})

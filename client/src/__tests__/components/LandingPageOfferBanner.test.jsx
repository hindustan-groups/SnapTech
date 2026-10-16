/**
 * LandingPageOfferBanner.test.jsx
 * Unit tests for the ₹2,999 Landing Page Offer Banner promotional section
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LandingPageOfferBanner from '@/components/sections/LandingPageOfferBanner'

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

describe('LandingPageOfferBanner Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the starting price ₹2,999 and headline prominently', () => {
    render(<LandingPageOfferBanner />)

    expect(screen.getByRole('heading', { level: 2, name: /Launch Your Business Online With a High-Converting Landing Page/i })).toBeInTheDocument()
    expect(screen.getByText('₹2,999')).toBeInTheDocument()
    expect(screen.getByText(/Landing Page Website — Starting at ₹2,999/i)).toBeInTheDocument()
    expect(screen.getByText(/Mobile & Desktop Responsive Layout/i)).toBeInTheDocument()
  })

  it('renders honest scope note stating specifications depend on requirements', () => {
    render(<LandingPageOfferBanner />)

    expect(
      screen.getByText(/₹2,999 is the starting baseline price for single-page landing site layouts/i)
    ).toBeInTheDocument()
  })

  it('triggers onClaimOffer callback when Claim Offer CTA is clicked', () => {
    const onClaimMock = vi.fn()
    render(<LandingPageOfferBanner onClaimOffer={onClaimMock} />)

    const claimBtn = screen.getByRole('link', { name: /Claim ₹2,999 Offer/i })
    fireEvent.click(claimBtn)

    expect(onClaimMock).toHaveBeenCalledTimes(1)
  })

  it('contains instant WhatsApp consultation link with encoded message', () => {
    render(<LandingPageOfferBanner />)

    const whatsappLink = screen.getByRole('link', { name: /Instant WhatsApp Consultation/i })
    expect(whatsappLink).toHaveAttribute('href', expect.stringContaining('wa.me/918209604849'))
    expect(whatsappLink).toHaveAttribute('href', expect.stringContaining('%E2%82%B92%2C999'))
    expect(whatsappLink).toHaveAttribute('target', '_blank')
  })

  it('supports custom as tag and showContainer=false without error', () => {
    const { container } = render(
      <LandingPageOfferBanner as="div" showContainer={false} id="custom-offer" className="test-class" />
    )

    const divEl = container.querySelector('#custom-offer')
    expect(divEl).toBeInTheDocument()
    expect(divEl.tagName.toLowerCase()).toBe('div')
    expect(divEl).toHaveClass('test-class')
    expect(screen.getByText('₹2,999')).toBeInTheDocument()
  })
})

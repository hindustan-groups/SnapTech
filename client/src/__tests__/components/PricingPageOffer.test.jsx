/**
 * PricingPageOffer.test.jsx
 * Unit and regression tests for the ₹2,999 Landing Page Offer on PricingPage.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PricingPage from '@/pages/PricingPage'

// Mock useSiteSettings and usePricingPackages
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
  usePricingPackages: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
}))

// Mock useContact
const mockMutateAsync = vi.fn().mockResolvedValue({ success: true })
vi.mock('@/hooks/useContact', () => ({
  useContact: vi.fn(() => ({
    contactMutation: {
      mutateAsync: mockMutateAsync,
      isPending: false,
    },
  })),
}))

// Mock Toast
vi.mock('@/components/ui/ToastProvider', () => ({
  useToast: vi.fn(() => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  })),
}))

// Mock SEO
vi.mock('@/components/ui/SEO', () => ({
  default: () => null,
  breadcrumbSchema: vi.fn(),
  faqSchema: vi.fn(),
}))

describe('PricingPage ₹2,999 Landing Page Offer Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderPricingPage() {
    return render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    )
  }

  it('renders the ₹2,999 Landing Page Offer section inside website packages', () => {
    const { container } = renderPricingPage()

    const websitePackagesSection = container.querySelector('#website-packages')
    expect(websitePackagesSection).toBeInTheDocument()

    // Check prominent offer heading and price
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Launch Your Business Online With a High-Converting Landing Page/i,
      })
    ).toBeInTheDocument()
    expect(screen.getByText(/Landing Page Website — Starting at ₹2,999/i)).toBeInTheDocument()
    expect(screen.getAllByText('₹2,999').length).toBeGreaterThan(0)
  })

  it('renders honest scope notice explaining that domain, hosting, and integrations depend on client requirements', () => {
    renderPricingPage()

    expect(
      screen.getByText(/₹2,999 is the starting baseline price for single-page landing site layouts/i)
    ).toBeInTheDocument()
  })

  it('provides WhatsApp CTA with verified contact number and prefilled inquiry text', () => {
    renderPricingPage()

    const whatsappLink = screen.getByRole('link', { name: /Instant WhatsApp Consultation/i })
    expect(whatsappLink).toHaveAttribute('href', expect.stringContaining('wa.me/918209604849'))
    expect(whatsappLink).toHaveAttribute('href', expect.stringContaining('%E2%82%B92%2C999'))
    expect(whatsappLink).toHaveAttribute('target', '_blank')
  })

  it('clicking "Claim ₹2,999 Offer" opens quote modal preselecting the landing page offer', () => {
    renderPricingPage()

    const claimBtn = screen.getByRole('link', { name: /Claim ₹2,999 Offer/i })
    fireEvent.click(claimBtn)

    // Modal should be open
    expect(screen.getByText('Request Technical Proposal')).toBeInTheDocument()
    expect(screen.getByText('Landing Page Website (₹2,999 Offer)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit Technical Quote Request/i })).toBeInTheDocument()
  })

  it('preserves existing multi-page website packages and their modal triggers', () => {
    renderPricingPage()

    // Verify existing packages still exist
    expect(screen.getByRole('heading', { level: 3, name: 'Starter' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Business' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Professional' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Enterprise' })).toBeInTheDocument()

    // Click standard package CTA
    const starterPackageBtn = screen.getByRole('button', { name: /Select Starter/i })
    fireEvent.click(starterPackageBtn)

    expect(screen.getByText('Request Technical Proposal')).toBeInTheDocument()
    expect(screen.getByText('Website Package: Starter')).toBeInTheDocument()
  })
})

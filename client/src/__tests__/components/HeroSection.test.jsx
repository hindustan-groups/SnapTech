/**
 * HeroSection.test.jsx — Unit tests for the redesigned HeroSection component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HeroSection from '@/components/sections/HeroSection'

// Mock useSiteSettings hook
vi.mock('@/hooks/useContent', () => ({
  useSiteSettings: vi.fn(() => ({
    data: {
      data: {
        company_name: 'SnapTech',
        parent_company_name: 'Hindustan Projects Group',
        hero_eyebrow: 'Technology & Digital Innovation Division',
        hero_title_prefix: 'Engineering Resilient',
        hero_subtitle: 'Architecting High-Performance Digital Solutions & Enterprise Cloud Systems',
        hero_domain: 'Search snaptech.digital',
      },
    },
    isLoading: false,
  })),
}))

const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

describe('HeroSection — Redesigned Homepage Hero', () => {
  const renderHero = () =>
    render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>
    )

  it('renders the main h1 heading with title prefix and initial cycling text', () => {
    renderHero()
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading.textContent).toContain('Engineering Resilient')
    expect(heading.textContent).toContain('Cross-Platform Mobile Apps')
  })

  it('renders the eyebrow badge with parent company info', () => {
    renderHero()
    expect(screen.getByText('Technology & Digital Innovation Division')).toBeInTheDocument()
    expect(screen.getAllByText(/Hindustan Projects Group/).length).toBeGreaterThanOrEqual(1)
  })

  it('renders the hero subtitle', () => {
    renderHero()
    expect(
      screen.getByText('Architecting High-Performance Digital Solutions & Enterprise Cloud Systems')
    ).toBeInTheDocument()
  })

  it('renders the search input and handles submission', () => {
    renderHero()
    const searchInput = screen.getByPlaceholderText('Search snaptech.digital')
    expect(searchInput).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'Mobile Apps' } })
    expect(searchInput.value).toBe('Mobile Apps')

    const searchBtn = screen.getByRole('button', { name: /search/i })
    fireEvent.click(searchBtn)
    expect(mockedNavigate).toHaveBeenCalledWith('/services?q=Mobile%20Apps')
  })

  it('renders popular tags and fills search input when clicked', () => {
    renderHero()
    const popularTag = screen.getByText('Custom Web Applications')
    expect(popularTag).toBeInTheDocument()

    fireEvent.click(popularTag)
    const searchInput = screen.getByPlaceholderText('Search snaptech.digital')
    expect(searchInput.value).toBe('Custom Web Applications')
  })

  it('renders feature bullet capabilities with checkmarks', () => {
    renderHero()
    expect(screen.getByText(/iOS & Android Cross-Platform Mobile Applications/i)).toBeInTheDocument()
    expect(screen.getByText(/Custom Industrial ERP, Weaving & Inventory Automation/i)).toBeInTheDocument()
    expect(screen.getByText(/Hindustan Projects Group Backing with 100% Code & IP Handover/i)).toBeInTheDocument()
  })

  it('renders high-converting CTA links', () => {
    renderHero()
    const consultLink = screen.getByRole('link', { name: /schedule technical consultation/i })
    expect(consultLink).toHaveAttribute('href', '/contact')

    const portfolioLink = screen.getByRole('link', { name: /explore deployed case studies/i })
    expect(portfolioLink).toHaveAttribute('href', '/portfolio')

    const whatsappLink = screen.getByLabelText(/direct whatsapp priority hotline/i)
    expect(whatsappLink).toHaveAttribute('target', '_blank')
  })

  it('renders the prominent 3D hero image with eager loading and proper attributes', () => {
    renderHero()
    const heroImg = screen.getByAltText(/SnapTech Digital — Enterprise Web & Mobile Solutions/i)
    expect(heroImg).toBeInTheDocument()
    expect(heroImg).toHaveAttribute('loading', 'eager')
    expect(heroImg).toHaveAttribute('fetchpriority', 'high')
    expect(heroImg.className).toContain('object-contain')
    expect(heroImg.className).toContain('w-full')
  })

  it('renders the technology partner logos strip', () => {
    renderHero()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('NEXT.js')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('Flutter')).toBeInTheDocument()
    expect(screen.getByText('aws')).toBeInTheDocument()
    expect(screen.getByText('Google Cloud')).toBeInTheDocument()
    expect(screen.getByText('Trusted Technology Partner')).toBeInTheDocument()
  })
})

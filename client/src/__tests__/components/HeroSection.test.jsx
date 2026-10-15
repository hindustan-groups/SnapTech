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

// Mock useServices hook
vi.mock('@/hooks/useServices', () => ({
  useServices: vi.fn(() => ({
    data: {
      data: [
        { title: 'Web Development' },
        { title: 'Mobile App Development' },
      ],
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
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings.length).toBeGreaterThanOrEqual(1)
    expect(headings[0].textContent).toContain('Engineering Resilient')
    expect(headings[0].textContent).toContain('Cross-Platform')
    expect(headings[0].textContent).toContain('Mobile')
    expect(headings[0].textContent).toContain('Apps')
  })

  it('renders the eyebrow badge with parent company info', () => {
    renderHero()
    expect(screen.getAllByText('Technology & Digital Innovation Division').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Hindustan Projects Group/).length).toBeGreaterThanOrEqual(1)
  })

  it('renders the hero subtitle', () => {
    renderHero()
    expect(
      screen.getAllByText('Architecting High-Performance Digital Solutions & Enterprise Cloud Systems').length
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders the search input and handles submission', () => {
    renderHero()
    const searchInputs = screen.getAllByPlaceholderText(/Web Development/i)
    expect(searchInputs.length).toBeGreaterThanOrEqual(1)
    const searchInput = searchInputs[0]

    fireEvent.change(searchInput, { target: { value: 'Mobile Apps' } })
    expect(searchInput.value).toBe('Mobile Apps')

    const searchBtns = screen.getAllByRole('button', { name: /search/i })
    fireEvent.click(searchBtns[0])
    expect(mockedNavigate).toHaveBeenCalledWith('/services?q=Mobile%20Apps')
  })

  it('renders popular tags and fills search input when clicked', () => {
    renderHero()
    const popularTags = screen.getAllByText('Custom Web Applications')
    expect(popularTags.length).toBeGreaterThanOrEqual(1)

    fireEvent.click(popularTags[0])
    const searchInputs = screen.getAllByPlaceholderText(/Web Development/i)
    expect(searchInputs[0].value).toBe('Custom Web Applications')
  })

  it('renders feature bullet capabilities with checkmarks', () => {
    renderHero()
    expect(screen.getAllByText(/iOS & Android Cross-Platform Mobile Applications/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Custom Industrial ERP, Weaving & Inventory Automation/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Hindustan Projects Group Backing with 100% Code & IP Handover/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders high-converting CTA links', () => {
    renderHero()
    const consultLinks = screen.getAllByRole('link', { name: /schedule technical consultation/i })
    expect(consultLinks[0]).toHaveAttribute('href', '/contact')

    const portfolioLinks = screen.getAllByRole('link', { name: /case studies/i })
    expect(portfolioLinks[0]).toHaveAttribute('href', '/portfolio')

    const whatsappLinks = screen.getAllByLabelText(/direct whatsapp priority hotline/i)
    expect(whatsappLinks[0]).toHaveAttribute('target', '_blank')
  })

  it('renders the prominent 3D hero image with eager loading and proper attributes', () => {
    renderHero()
    const heroImg = screen.getByAltText(/SnapTech Digital — Enterprise Solutions/i)
    expect(heroImg).toBeInTheDocument()
    expect(heroImg).toHaveAttribute('loading', 'eager')
    expect(heroImg).toHaveAttribute('fetchpriority', 'high')
    expect(heroImg.className).toContain('object-contain')
    expect(heroImg.className).toContain('w-full')
  })

  it('renders the technology partner logos strip', () => {
    renderHero()
    expect(screen.getAllByText('React').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('NEXT.js').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/node\.js/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Flutter').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('aws').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Google Cloud').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Trusted Technology Partner').length).toBeGreaterThanOrEqual(1)
  })
})

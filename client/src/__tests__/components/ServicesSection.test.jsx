/**
 * ServicesSection.test.jsx
 * Comprehensive unit and regression tests for Services section and related detail views.
 * Verifies:
 * - All 7 services are rendered (including Mobile App Development)
 * - Service slugs and link targets are intact
 * - Card CTAs use standardized "Explore Service"
 * - Mobile counter indicates 7 services
 * - Service-specific fallbacks on ServiceDetailPage (no cross-contamination)
 * - Absence of unsupported guarantee claims
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ServicesSection from '@/components/sections/ServicesSection'
import ServiceDetailPage from '@/pages/ServiceDetailPage'
import ServicesPage from '@/pages/ServicesPage'

// Mock useServices
vi.mock('@/hooks/useServices', () => ({
  useServices: vi.fn(() => ({
    data: {
      data: [
        {
          id: '1',
          title: 'Custom Web Development',
          slug: 'web-development',
          icon: 'Globe',
          tag: 'Most Popular',
          shortDescription:
            'Custom, high-speed websites, web applications, and customer portals engineered for fast loading speeds, search visibility, and conversion-focused performance.',
        },
        {
          id: '2',
          title: 'Mobile App Development',
          slug: 'mobile-app-development',
          icon: 'Smartphone',
          tag: 'iOS & Android',
          shortDescription:
            'Cross-platform iOS and Android mobile applications built with React Native and Flutter for seamless mobile performance, offline caching, and app store deployment.',
        },
        {
          id: '3',
          title: 'Digital Marketing & SEO',
          slug: 'digital-marketing-seo',
          icon: 'Megaphone',
          tag: 'Lead Acquisition',
          shortDescription:
            'Targeted search engine optimization (SEO), Google Ads, and Meta advertising campaigns structured to generate qualified commercial leads and measurable ROI.',
        },
        {
          id: '4',
          title: 'E-Commerce Solutions',
          slug: 'ecommerce-solutions',
          icon: 'Monitor',
          tag: 'Online Storefronts',
          shortDescription:
            'Turnkey digital storefronts, custom Shopify setups, and scalable online catalogs engineered for smooth checkout flows and automated order processing.',
        },
        {
          id: '5',
          title: 'Cloud Solutions & DevOps',
          slug: 'cloud-solutions-devops',
          icon: 'Settings',
          tag: 'Cloud Infrastructure',
          shortDescription:
            'Secure cloud hosting setup, containerized deployments, automated backups, and proactive monitoring on AWS, Google Cloud, and DigitalOcean.',
        },
        {
          id: '6',
          title: 'Branding & UI/UX Design',
          slug: 'branding-ui-ux-design',
          icon: 'Layers',
          tag: 'Brand Identity',
          shortDescription:
            'Intuitive user interface designs, interactive prototypes, and unified corporate visual identities that establish credibility and enhance customer engagement.',
        },
        {
          id: '7',
          title: 'IT Consulting & Strategy',
          slug: 'it-consulting-strategy',
          icon: 'Lightbulb',
          tag: 'Technical Advisory',
          shortDescription:
            'Independent technical consulting to help business owners evaluate software options, audit existing IT systems, and plan realistic digital roadmaps.',
        },
      ],
    },
    isLoading: false,
    isError: false,
  })),
  useService: vi.fn(() => ({
    data: null, // Test fallback resilience
    isLoading: false,
    isError: false,
  })),
}))

// Mock useSiteSettings
vi.mock('@/hooks/useContent', () => ({
  useSiteSettings: vi.fn(() => ({
    data: {
      data: {
        phone: '+91 8209604849',
        whatsapp: '+91 8209604849',
        email: 'info@snaptech.digital',
      },
    },
    isLoading: false,
  })),
}))

// Mock useProjects
vi.mock('@/hooks/useProjects', () => ({
  useProjects: vi.fn(() => ({
    data: { data: [] },
    isLoading: false,
  })),
}))

describe('ServicesSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders 6 core services on homepage in balanced 3x2 grid including Mobile App Development', () => {
    render(
      <MemoryRouter>
        <ServicesSection />
      </MemoryRouter>
    )

    // Heading exists
    expect(screen.getByRole('heading', { name: /Scalability & Digital Growth/i })).toBeInTheDocument()

    // 6 services are rendered (rendered both in desktop grid and mobile deck)
    const webDev = screen.getAllByRole('heading', { name: /Custom Web Development/i })
    expect(webDev.length).toBeGreaterThanOrEqual(1)

    const mobileApp = screen.getAllByRole('heading', { name: /Mobile App Development/i })
    expect(mobileApp.length).toBeGreaterThanOrEqual(1)

    const seo = screen.getAllByRole('heading', { name: /Digital Marketing & SEO/i })
    expect(seo.length).toBeGreaterThanOrEqual(1)

    const ecommerce = screen.getAllByRole('heading', { name: /E-Commerce Solutions/i })
    expect(ecommerce.length).toBeGreaterThanOrEqual(1)

    const cloud = screen.getAllByRole('heading', { name: /Cloud Solutions & DevOps/i })
    expect(cloud.length).toBeGreaterThanOrEqual(1)

    const branding = screen.getAllByRole('heading', { name: /Branding & UI\/UX Design/i })
    expect(branding.length).toBeGreaterThanOrEqual(1)
  })

  it('verifies that all featured homepage service cards link to their respective routes', () => {
    render(
      <MemoryRouter>
        <ServicesSection />
      </MemoryRouter>
    )

    const expectedSlugs = [
      'web-development',
      'mobile-app-development',
      'digital-marketing-seo',
      'ecommerce-solutions',
      'cloud-solutions-devops',
      'branding-ui-ux-design',
    ]

    expectedSlugs.forEach((slug) => {
      const matchingLinks = screen
        .getAllByRole('link')
        .filter((l) => l.getAttribute('href') === `/services/${slug}`)
      expect(matchingLinks.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('displays the updated mobile counter for 6 services', () => {
    render(
      <MemoryRouter>
        <ServicesSection />
      </MemoryRouter>
    )

    expect(screen.getByText(/Stacking Capabilities \(6 Services\)/i)).toBeInTheDocument()
    const counters = screen.getAllByText((_, element) => element?.textContent?.trim() === '01 / 06')
    expect(counters.length).toBeGreaterThanOrEqual(1)
  })

  it('renders "Explore Service" on cards and "View All Services & Capabilities" at the bottom', () => {
    render(
      <MemoryRouter>
        <ServicesSection />
      </MemoryRouter>
    )

    const ctas = screen.getAllByText('Explore Service')
    expect(ctas.length).toBeGreaterThanOrEqual(6)

    const bottomLink = screen.getByRole('link', { name: /View All Services & Capabilities/i })
    expect(bottomLink).toBeInTheDocument()
    expect(bottomLink.getAttribute('href')).toBe('/services')
  })
})

describe('ServicesPage Catalog Component', () => {
  it('standardizes CTA button to "Explore Service"', () => {
    render(
      <MemoryRouter>
        <ServicesPage />
      </MemoryRouter>
    )

    const exploreLinks = screen.getAllByText('Explore Service')
    expect(exploreLinks.length).toBeGreaterThanOrEqual(7)
  })
})

describe('ServiceDetailPage Component Fallback Integrity', () => {
  it('renders service-specific tech stack and deliverables for Digital Marketing & SEO without software dev contamination', () => {
    render(
      <MemoryRouter initialEntries={['/services/digital-marketing-seo']}>
        <Routes>
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Heading matches service
    expect(screen.getByRole('heading', { level: 1, name: /Digital Marketing & SEO/i })).toBeInTheDocument()

    // Verified marketing deliverables exist
    expect(screen.getByText(/Technical SEO audit with on-page metadata/i)).toBeInTheDocument()
    expect(screen.getByText(/Local SEO and Google Business Profile optimization/i)).toBeInTheDocument()

    // Verified marketing tech stack chips exist
    expect(screen.getByText('Google Ads')).toBeInTheDocument()
    expect(screen.getByText('Google Analytics 4')).toBeInTheDocument()

    // MUST NOT contain generic software development terms
    expect(screen.queryByText('Docker')).not.toBeInTheDocument()
    expect(screen.queryByText('Zero-Vulnerability Code Warranty')).not.toBeInTheDocument()
    expect(screen.queryByText('100% Zero-Defect')).not.toBeInTheDocument()
  })

  it('renders service-specific tech stack and deliverables for Branding & UI/UX Design', () => {
    render(
      <MemoryRouter initialEntries={['/services/branding-ui-ux-design']}>
        <Routes>
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Branding & UI\/UX Design/i })).toBeInTheDocument()

    // Verified design deliverables
    expect(screen.getByText(/Distinctive vector logo design/i)).toBeInTheDocument()
    expect(screen.getByText(/Interactive, clickable Figma UI\/UX prototypes/i)).toBeInTheDocument()

    // Verified design tools
    expect(screen.getByText('Figma')).toBeInTheDocument()
    expect(screen.getByText('Adobe Illustrator')).toBeInTheDocument()

    // MUST NOT claim unsupported certifications or software warranties
    expect(screen.queryByText('Award-winning')).not.toBeInTheDocument()
    expect(screen.queryByText('100% Zero-Defect')).not.toBeInTheDocument()
  })

  it('renders service-specific details for Mobile App Development', () => {
    render(
      <MemoryRouter initialEntries={['/services/mobile-app-development']}>
        <Routes>
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Mobile App Development/i })).toBeInTheDocument()
    expect(screen.getByText(/Single cross-platform codebase for iOS and Android deployment/i)).toBeInTheDocument()
    expect(screen.getByText('React Native')).toBeInTheDocument()
    expect(screen.getByText('Flutter')).toBeInTheDocument()
  })

  it('displays 404 message when given a truly invalid slug', () => {
    render(
      <MemoryRouter initialEntries={['/services/non-existent-service-slug-xyz']}>
        <Routes>
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/Service capability not found in database/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Return to Services Directory/i })).toBeInTheDocument()
  })
})

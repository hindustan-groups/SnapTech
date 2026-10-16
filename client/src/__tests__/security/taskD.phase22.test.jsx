/**
 * taskD.phase22.test.jsx
 *
 * Focused tests for TASK D — Phase 2.2:
 * A. Homepage JSON-LD Schema Uniqueness (no duplicate Organization or LocalBusiness).
 * B. Homepage FAQ structured data (FAQPage schema correctly generated and matching visible FAQs).
 * C. BreadcrumbList schemas and brand standardization on /about, /portfolio, /careers, /why-snaptech.
 * D. Canonical duplicate-route handling (/why-us -> /why-snaptech, /projects/:slug -> /portfolio/:slug).
 * E. Vercel edge redirects configuration validation.
 */

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import App from '@/App'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import PortfolioPage from '@/pages/PortfolioPage'
import CareersPage from '@/pages/CareersPage'
import WhyChooseUsPage from '@/pages/WhyChooseUsPage'
import { FALLBACK_FAQS } from '@/data/faqs'
import SEO, { organizationSchema, localBusinessSchema } from '@/components/ui/SEO'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

function renderWithProviders(ui, { route = '/' } = {}) {
  const queryClient = createTestQueryClient()
  const helmetContext = {}

  const result = render(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )

  return { ...result, helmetContext }
}

describe('TASK D Phase 2.2: SEO & AEO/GEO Schema Alignment', () => {
  describe('A & B. Homepage JSON-LD Schema Uniqueness & FAQ Structured Data', () => {
    it('emits exactly one Organization, one LocalBusiness, one WebSite, and one FAQPage schema on HomePage', async () => {
      renderWithProviders(<HomePage />, { route: '/' })

      // Await rendering
      await waitFor(() => {
        expect(screen.getAllByRole('heading', { level: 1 }).length).toBeGreaterThanOrEqual(1)
      })

      // Wait for scripts to be injected into document by Helmet
      await waitFor(() => {
        const els = document.querySelectorAll('script[type="application/ld+json"]')
        expect(els.length).toBeGreaterThanOrEqual(4)
      })

      // Parse all injected ld+json script tags
      const scriptElements = document.querySelectorAll('script[type="application/ld+json"]')
      const schemas = []
      scriptElements.forEach((el) => {
        try {
          schemas.push(JSON.parse(el.textContent))
        } catch {
          // ignore parsing error
        }
      })

      // Count occurrences of singleton types
      const types = schemas.map((s) => s['@type'])
      const orgCount = types.filter((t) => t === 'Organization').length
      const localBizCount = types.filter((t) => t === 'LocalBusiness').length
      const webSiteCount = types.filter((t) => t === 'WebSite').length
      const faqCount = types.filter((t) => t === 'FAQPage').length

      expect(orgCount).toBe(1)
      expect(localBizCount).toBe(1)
      expect(webSiteCount).toBe(1)
      expect(faqCount).toBe(1)

      // Validate FAQ schema content matches FALLBACK_FAQS
      const faqSchemaObj = schemas.find((s) => s['@type'] === 'FAQPage')
      expect(faqSchemaObj).toBeDefined()
      expect(faqSchemaObj.mainEntity).toHaveLength(FALLBACK_FAQS.length)
      expect(faqSchemaObj.mainEntity[0].name).toBe(FALLBACK_FAQS[0].question)
      expect(faqSchemaObj.mainEntity[0].acceptedAnswer.text).toBe(FALLBACK_FAQS[0].answer)
    })

    it('deduplicates duplicate singleton schemas if accidentally passed in schemas prop', () => {
      const helmetContext = {}
      const queryClient = createTestQueryClient()

      render(
        <HelmetProvider context={helmetContext}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/']}>
              <SEO
                title="Test Page"
                path="/"
                schemas={[organizationSchema(), localBusinessSchema()]}
              />
            </MemoryRouter>
          </QueryClientProvider>
        </HelmetProvider>
      )

      const scriptElements = document.querySelectorAll('script[type="application/ld+json"]')
      const schemas = Array.from(scriptElements).map((el) => JSON.parse(el.textContent))
      const types = schemas.map((s) => s['@type'])

      expect(types.filter((t) => t === 'Organization').length).toBe(1)
      expect(types.filter((t) => t === 'LocalBusiness').length).toBe(1)
    })
  })

  describe('C. Entity and Breadcrumb Schemas on Subpages', () => {
    it('AboutPage emits BreadcrumbList and standardized About SnapTech Digital entity name', async () => {
      renderWithProviders(<AboutPage />, { route: '/about' })

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })

      const scriptElements = document.querySelectorAll('script[type="application/ld+json"]')
      const schemas = Array.from(scriptElements).map((el) => JSON.parse(el.textContent))

      const breadcrumb = schemas.find((s) => s['@type'] === 'BreadcrumbList')
      expect(breadcrumb).toBeDefined()
      expect(breadcrumb.itemListElement).toHaveLength(2)
      expect(breadcrumb.itemListElement[0].name).toBe('Home')
      expect(breadcrumb.itemListElement[1].name).toBe('About Us')

      const aboutSchema = schemas.find((s) => s['@type'] === 'AboutPage')
      expect(aboutSchema).toBeDefined()
      expect(aboutSchema.name).toBe('About SnapTech Digital')
    })

    it('PortfolioPage emits valid BreadcrumbList schema', async () => {
      renderWithProviders(<PortfolioPage />, { route: '/portfolio' })

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })

      const scriptElements = document.querySelectorAll('script[type="application/ld+json"]')
      const schemas = Array.from(scriptElements).map((el) => JSON.parse(el.textContent))

      const breadcrumb = schemas.find((s) => s['@type'] === 'BreadcrumbList')
      expect(breadcrumb).toBeDefined()
      expect(breadcrumb.itemListElement).toHaveLength(2)
      expect(breadcrumb.itemListElement[0].name).toBe('Home')
      expect(breadcrumb.itemListElement[1].name).toBe('Portfolio')
    })

    it('CareersPage emits valid BreadcrumbList schema', async () => {
      renderWithProviders(<CareersPage />, { route: '/careers' })

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })

      const scriptElements = document.querySelectorAll('script[type="application/ld+json"]')
      const schemas = Array.from(scriptElements).map((el) => JSON.parse(el.textContent))

      const breadcrumb = schemas.find((s) => s['@type'] === 'BreadcrumbList')
      expect(breadcrumb).toBeDefined()
      expect(breadcrumb.itemListElement).toHaveLength(2)
      expect(breadcrumb.itemListElement[0].name).toBe('Home')
      expect(breadcrumb.itemListElement[1].name).toBe('Careers')
    })

    it('WhyChooseUsPage emits valid BreadcrumbList schema', async () => {
      renderWithProviders(<WhyChooseUsPage />, { route: '/why-snaptech' })

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })

      const scriptElements = document.querySelectorAll('script[type="application/ld+json"]')
      const schemas = Array.from(scriptElements).map((el) => JSON.parse(el.textContent))

      const breadcrumb = schemas.find((s) => s['@type'] === 'BreadcrumbList')
      expect(breadcrumb).toBeDefined()
      expect(breadcrumb.itemListElement).toHaveLength(2)
      expect(breadcrumb.itemListElement[0].name).toBe('Home')
      expect(breadcrumb.itemListElement[1].name).toBe('Why SnapTech')
    })
  })

  describe('D. Canonical Duplicate-Route Client Navigation in App.jsx', () => {
    function LocationWatcher() {
      const location = useLocation()
      return <div data-testid="current-location">{location.pathname + location.search + location.hash}</div>
    }

    it('redirects /why-us to /why-snaptech while preserving query parameters and hash', async () => {
      const queryClient = createTestQueryClient()
      render(
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/why-us?utm_source=twitter#comparison']}>
              <App />
              <LocationWatcher />
            </MemoryRouter>
          </QueryClientProvider>
        </HelmetProvider>
      )

      await waitFor(() => {
        const loc = screen.getByTestId('current-location').textContent
        expect(loc).toBe('/why-snaptech?utm_source=twitter#comparison')
      })
    })

    it('redirects /projects/:slug to /portfolio/:slug while preserving query parameters', async () => {
      const queryClient = createTestQueryClient()
      render(
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/projects/custom-erp-suite?ref=showcase']}>
              <App />
              <LocationWatcher />
            </MemoryRouter>
          </QueryClientProvider>
        </HelmetProvider>
      )

      await waitFor(() => {
        const loc = screen.getByTestId('current-location').textContent
        expect(loc).toBe('/portfolio/custom-erp-suite?ref=showcase')
      })
    })
  })

  describe('E. Vercel Edge Redirects Configuration', () => {
    it('declares permanent 301/308 redirects for duplicate routes in vercel.json', () => {
      const vercelJsonPath = path.resolve(__dirname, '../../../vercel.json')
      const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'))

      expect(vercelConfig.redirects).toBeDefined()
      expect(Array.isArray(vercelConfig.redirects)).toBe(true)

      const whyUsRedirect = vercelConfig.redirects.find((r) => r.source === '/why-us')
      expect(whyUsRedirect).toBeDefined()
      expect(whyUsRedirect.destination).toBe('/why-snaptech')
      expect(whyUsRedirect.permanent).toBe(true)

      const projectsRedirect = vercelConfig.redirects.find((r) => r.source === '/projects/:slug')
      expect(projectsRedirect).toBeDefined()
      expect(projectsRedirect.destination).toBe('/portfolio/:slug')
      expect(projectsRedirect.permanent).toBe(true)
    })
  })
})

/**
 * taskD.phase31.test.jsx
 *
 * Validation test suite for PHASE 3.1: Release Blocker Fixes
 * - Fix 2: Removal of duplicate static JSON-LD in client/index.html
 * - Fix 3: Distinct SEO handling for valid slug, invalid slug (noindex), loading, and server error
 *          in ProjectDetailPage and ServiceDetailPage.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import ProjectDetailPage from '@/pages/ProjectDetailPage'
import ServiceDetailPage from '@/pages/ServiceDetailPage'
import * as projectHooks from '@/hooks/useProjects'
import * as serviceHooks from '@/hooks/useServices'
import * as contentHooks from '@/hooks/useContent'

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

  // Ensure head tags exist for SEO useEffect synchronization
  if (!document.querySelector('meta[name="robots"]')) {
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'index,follow'
    document.head.appendChild(robots)
  }
  if (!document.querySelector('link[rel="canonical"]')) {
    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = 'https://www.snaptech.digital/'
    document.head.appendChild(canonical)
  }

  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

describe('PHASE 3.1 — Release Blocker Fixes Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(contentHooks, 'useSiteSettings').mockReturnValue({
      data: {
        data: {
          phone: '+91 8209604849',
          whatsapp: '918209604849',
          email: 'info@snaptech.digital',
        },
      },
      isLoading: false,
    })
  })

  describe('Fix 2: Duplicate Static JSON-LD Elimination in index.html', () => {
    it('does not contain hardcoded static Organization or LocalBusiness script in client/index.html', () => {
      const indexHtmlPath = path.resolve(__dirname, '../../../index.html')
      const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8')

      // index.html should not have static application/ld+json script tags
      expect(htmlContent).not.toContain('<script type="application/ld+json">')
      expect(htmlContent).not.toContain('"@id": "https://www.snaptech.digital/#organization"')
      expect(htmlContent).not.toContain('"@id": "https://www.snaptech.digital/#localbusiness"')

      // Essential head tags must remain preserved
      expect(htmlContent).toContain('<link rel="canonical"')
      expect(htmlContent).toContain('<meta name="robots"')
      expect(htmlContent).toContain('<link rel="icon"')
      expect(htmlContent).toContain('<meta name="theme-color"')
    })
  })

  describe('Fix 3: Invalid Dynamic Slug SEO in ProjectDetailPage', () => {
    it('renders descriptive title, canonical, and indexable robots on valid project slug', async () => {
      vi.spyOn(projectHooks, 'useProject').mockReturnValue({
        data: {
          data: {
            id: 'proj-1',
            title: 'Industrial ERP Platform',
            slug: 'industrial-erp-platform',
            description: 'Custom textile manufacturing ERP system.',
            category: 'Web',
            technologies: ['React', 'Node.js'],
          },
        },
        isLoading: false,
        isError: false,
      })
      vi.spyOn(projectHooks, 'useProjects').mockReturnValue({
        data: { data: [] },
      })

      renderWithProviders(<ProjectDetailPage />, {
        route: '/portfolio/industrial-erp-platform',
      })

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Industrial ERP Platform')
      })

      await waitFor(() => {
        expect(document.title).toContain('Industrial ERP Platform — Architectural Case Study')
        const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content')
        expect(robots).not.toContain('noindex')
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href')
        expect(canonical).toBe('https://www.snaptech.digital/portfolio/industrial-erp-platform')
      })
    })

    it('renders Case Study Not Found and noindex,nofollow directive on genuine 404', async () => {
      vi.spyOn(projectHooks, 'useProject').mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: { status: 404, message: 'Project not found.' },
        refetch: vi.fn(),
      })
      vi.spyOn(projectHooks, 'useProjects').mockReturnValue({
        data: { data: [] },
      })

      renderWithProviders(<ProjectDetailPage />, {
        route: '/portfolio/non-existent-slug-xyz',
      })

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Case Study Not Found')
      })

      await waitFor(() => {
        expect(document.title).toContain('Case Study Not Found')
        const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content')
        expect(robots).toContain('noindex,nofollow')
      })
      expect(screen.getByRole('link', { name: /Back to Portfolio/i })).toBeInTheDocument()
    })

    it('renders temporary error state with Retry button and does NOT noindex on 500 server error', async () => {
      const refetchMock = vi.fn()
      vi.spyOn(projectHooks, 'useProject').mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: { status: 500, message: 'Internal server error.' },
        refetch: refetchMock,
      })
      vi.spyOn(projectHooks, 'useProjects').mockReturnValue({
        data: { data: [] },
      })

      renderWithProviders(<ProjectDetailPage />, {
        route: '/portfolio/broken-server-project',
      })

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Unable to Load Case Study')
      })

      await waitFor(() => {
        expect(document.title).toContain('Case Study Temporarily Unavailable')
        const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content')
        // Transient server errors should not trigger de-indexing
        expect(robots).not.toContain('noindex,nofollow')
      })
      expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeInTheDocument()
    })

    it('renders skeleton during loading state', () => {
      vi.spyOn(projectHooks, 'useProject').mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
      })
      vi.spyOn(projectHooks, 'useProjects').mockReturnValue({
        data: { data: [] },
      })

      const { container } = renderWithProviders(<ProjectDetailPage />, {
        route: '/portfolio/loading-project',
      })

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('Fix 3: Invalid Dynamic Slug SEO in ServiceDetailPage', () => {
    it('renders descriptive title, canonical, and indexable robots on valid service slug', async () => {
      vi.spyOn(serviceHooks, 'useService').mockReturnValue({
        data: {
          data: {
            id: '1',
            title: 'Custom Web Development',
            slug: 'web-development',
            shortDescription: 'Custom, high-speed websites.',
            fullDescription: 'Enterprise web development in React.',
          },
        },
        isLoading: false,
        isError: false,
      })
      vi.spyOn(serviceHooks, 'useServices').mockReturnValue({ data: { data: [] } })
      vi.spyOn(projectHooks, 'useProjects').mockReturnValue({ data: { data: [] } })

      renderWithProviders(<ServiceDetailPage />, {
        route: '/services/web-development',
      })

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Custom Web Development')
      })

      await waitFor(() => {
        expect(document.title).toContain('Custom Web Development — SnapTech Digital')
        const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content')
        expect(robots).not.toContain('noindex')
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href')
        expect(canonical).toBe('https://www.snaptech.digital/services/web-development')
      })
    })

    it('renders Service Capability Not Found and noindex,nofollow directive on genuine 404', async () => {
      vi.spyOn(serviceHooks, 'useService').mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: { status: 404, message: 'Service not found.' },
        refetch: vi.fn(),
      })
      vi.spyOn(serviceHooks, 'useServices').mockReturnValue({ data: { data: [] } })
      vi.spyOn(projectHooks, 'useProjects').mockReturnValue({ data: { data: [] } })

      renderWithProviders(<ServiceDetailPage />, {
        route: '/services/completely-unknown-service',
      })

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Service Capability Not Found')
      })

      await waitFor(() => {
        expect(document.title).toContain('Service Capability Not Found')
        const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content')
        expect(robots).toContain('noindex,nofollow')
      })
      expect(screen.getByRole('link', { name: /Return to Services Directory/i })).toBeInTheDocument()
    })

    it('renders temporary error state with Retry button and does NOT noindex on 500 server error for unknown service', async () => {
      const refetchMock = vi.fn()
      vi.spyOn(serviceHooks, 'useService').mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: { status: 500, message: 'Internal server error.' },
        refetch: refetchMock,
      })
      vi.spyOn(serviceHooks, 'useServices').mockReturnValue({ data: { data: [] } })
      vi.spyOn(projectHooks, 'useProjects').mockReturnValue({ data: { data: [] } })

      renderWithProviders(<ServiceDetailPage />, {
        route: '/services/unrecognized-failing-service',
      })

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Service Temporarily Unavailable')
      })

      await waitFor(() => {
        expect(document.title).toContain('Service Temporarily Unavailable')
        const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content')
        expect(robots).not.toContain('noindex,nofollow')
      })
      expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeInTheDocument()
    })
  })
})

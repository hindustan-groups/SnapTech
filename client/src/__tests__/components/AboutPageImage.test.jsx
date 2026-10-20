import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AboutPage from '@/pages/AboutPage'
import * as contentHooks from '@/hooks/useContent'

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

describe('AboutPage Dynamic Image Integration', () => {
  it('renders default fallback image when no custom image is configured', () => {
    vi.spyOn(contentHooks, 'useSiteSettings').mockReturnValue({
      data: { data: {} },
      isLoading: false,
    })

    renderWithProviders(<AboutPage />)
    const img = screen.getByAltText('SnapTech engineering team in collaborative session')
    expect(img).toBeInTheDocument()
    expect(img.src).toContain('images.unsplash.com/photo-1522071820081-009f0129c71c')
  })

  it('renders custom image configured via about_story_image', () => {
    const customUrl = 'https://res.cloudinary.com/demo/image/upload/custom-about-office.jpg'
    vi.spyOn(contentHooks, 'useSiteSettings').mockReturnValue({
      data: {
        data: {
          about_story_image: customUrl,
        },
      },
      isLoading: false,
    })

    renderWithProviders(<AboutPage />)
    const img = screen.getByAltText('SnapTech engineering team in collaborative session')
    expect(img).toBeInTheDocument()
    expect(img.src).toBe(customUrl)
  })

  it('renders custom image configured via legacy about_hero_laptop_image key', () => {
    const legacyUrl = 'https://res.cloudinary.com/demo/image/upload/legacy-laptop.jpg'
    vi.spyOn(contentHooks, 'useSiteSettings').mockReturnValue({
      data: {
        data: {
          about_hero_laptop_image: legacyUrl,
        },
      },
      isLoading: false,
    })

    renderWithProviders(<AboutPage />)
    const img = screen.getByAltText('SnapTech engineering team in collaborative session')
    expect(img).toBeInTheDocument()
    expect(img.src).toBe(legacyUrl)
  })
})

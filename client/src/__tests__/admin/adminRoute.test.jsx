/**
 * adminRoute.test.jsx — Unit & route validation tests for Admin login route restoration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import { api, ApiError } from '@/utils/api'

// Mock WaterRippleLogo and SEO to keep test fast and isolated
vi.mock('@/components/ui/WaterRippleLogo', () => ({
  default: () => <div data-testid="water-ripple-logo">Logo</div>,
}))

vi.mock(import('@/components/ui'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    SEO: () => null,
  }
})

describe('Admin Route Access & Validation', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  function renderWithRouter(initialEntry) {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/:adminSecret" element={<AdminLoginPage />} />
          <Route path="*" element={<div data-testid="not-found-page">Page Not Found</div>} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders login page on original branded URL pattern (/admin-${secret})', () => {
    renderWithRouter('/admin-custom_secret_key_123')
    expect(screen.getAllByText(/Command Center/i).length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText(/••••••••••••/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Unlock Command Center/i })).toBeInTheDocument()
  })

  it('renders login page on legitimate canonical secret URL (/hp9z7k5w8v3q2m4x)', () => {
    renderWithRouter('/hp9z7k5w8v3q2m4x')
    expect(screen.getAllByText(/Command Center/i).length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText(/••••••••••••/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Unlock Command Center/i })).toBeInTheDocument()
  })

  it('renders NotFoundPage on random long nonexistent URL (/non-existent-page-test-123)', () => {
    renderWithRouter('/non-existent-page-test-123')
    expect(screen.queryByRole('button', { name: /Unlock Command Center/i })).not.toBeInTheDocument()
    expect(screen.getByText(/404/i)).toBeInTheDocument()
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument()
  })

  it('renders login page on remembered secret from localStorage', () => {
    localStorage.setItem('admin_secret_path', 'custom_path')
    renderWithRouter('/custom_path')
    expect(screen.getAllByText(/Command Center/i).length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText(/••••••••••••/i)).toBeInTheDocument()
  })

  it('renders NotFoundPage on generic unauthorized short slugs (/xyz)', () => {
    renderWithRouter('/xyz')
    expect(screen.queryByRole('button', { name: /Unlock Command Center/i })).not.toBeInTheDocument()
    expect(screen.getByText(/404/i)).toBeInTheDocument()
  })

  it('renders NotFoundPage on /admin-login (bypasses secret requirement)', () => {
    renderWithRouter('/admin-login')
    expect(screen.queryByRole('button', { name: /Unlock Command Center/i })).not.toBeInTheDocument()
    expect(screen.getByText(/404/i)).toBeInTheDocument()
  })

  it('renders NotFoundPage on /admin-invalid', () => {
    renderWithRouter('/admin-invalid')
    expect(screen.queryByRole('button', { name: /Unlock Command Center/i })).not.toBeInTheDocument()
    expect(screen.getByText(/404/i)).toBeInTheDocument()
  })

  it('stores stripped secret path into localStorage upon authorized visit', async () => {
    renderWithRouter('/admin-active_token_999')
    await waitFor(() => {
      expect(localStorage.getItem('admin_secret_path')).toBe('active_token_999')
    })
  })

  it('displays user-friendly network error message when server is unreachable (status 0)', async () => {
    vi.spyOn(api, 'post').mockRejectedValueOnce(
      new ApiError('Unable to connect to the server. Please check your network connection or server status.', 0)
    )
    renderWithRouter('/admin-custom_secret_key_123')
    fireEvent.change(screen.getByPlaceholderText(/admin@snaptech\.digital/i), {
      target: { value: 'admin@snaptech.digital' },
    })
    fireEvent.change(screen.getByPlaceholderText(/••••••••••••/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Unlock Command Center/i }))

    await waitFor(() => {
      expect(screen.getByText(/Unable to reach the server/i)).toBeInTheDocument()
    })
  })

  it('displays invalid credentials message on 401 response', async () => {
    vi.spyOn(api, 'post').mockRejectedValueOnce(
      new ApiError('Invalid email or password. Please try again.', 401)
    )
    renderWithRouter('/admin-custom_secret_key_123')
    fireEvent.change(screen.getByPlaceholderText(/admin@snaptech\.digital/i), {
      target: { value: 'admin@snaptech.digital' },
    })
    fireEvent.change(screen.getByPlaceholderText(/••••••••••••/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Unlock Command Center/i }))

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument()
    })
  })
})


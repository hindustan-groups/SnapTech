/**
 * setup.js — Frontend test global setup
 *
 * - @testing-library/jest-dom matchers (toBeInTheDocument etc.)
 * - Mock browser APIs not available in jsdom
 * - MSW (Mock Service Worker) server for API mocking
 */

import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll } from 'vitest'

// ── Mock window.location.reload (used by ErrorBoundary) ────────
Object.defineProperty(window, 'location', {
  writable: true,
  value: { ...window.location, reload: vi.fn(), pathname: '/' },
})

// ── Mock IntersectionObserver (used by Framer Motion & hooks) ──
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
globalThis.IntersectionObserver = MockIntersectionObserver

// ── Mock ResizeObserver ────────────────────────────────────────
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
globalThis.ResizeObserver = MockResizeObserver

// ── Mock import.meta.env ───────────────────────────────────────
vi.stubEnv('VITE_API_URL', '/api')
vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'test-recaptcha-key')

// ── Suppress expected console errors in tests ──────────────────
// (React's test errors, ErrorBoundary caught errors etc.)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    // Suppress React ErrorBoundary componentDidCatch noise in test output
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Error: Uncaught') ||
        args[0].includes('The above error') ||
        args[0].includes('[Global ErrorBoundary]') ||
        args[0].includes('act('))
    ) {
      return
    }
    originalError(...args)
  }
})

afterAll(() => {
  console.error = originalError
})

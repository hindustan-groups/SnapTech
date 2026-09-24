import React, { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'

// Local fonts — no internet required
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/poppins/800.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/monitoring/ErrorBoundary.jsx'

// Auto-reload cleanly when a new Vercel deployment updates JavaScript chunk hashes
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  window.location.reload()
})

// Inject reCAPTCHA site key as a meta tag so index.html can pick it up
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
if (recaptchaSiteKey) {
  const meta = document.createElement('meta')
  meta.name = 'recaptcha-site-key'
  meta.content = recaptchaSiteKey
  document.head.appendChild(meta)
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000,
    },
  },
})

// DevtoolsLoader — only ever imported in DEV, completely absent from production bundle
const DevtoolsLoader = import.meta.env.DEV
  ? React.lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: () => <m.ReactQueryDevtools initialIsOpen={false} />,
      }))
    )
  : null

// Render the React application immediately to prevent blocking LCP (Largest Contentful Paint)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <App />
            {/* ReactQueryDevtools: only loads in dev, completely excluded from production bundle */}
            {import.meta.env.DEV && DevtoolsLoader && (
              <Suspense fallback={null}>
                <DevtoolsLoader />
              </Suspense>
            )}
          </QueryClientProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
)

// Load optional Google Analytics 4 asynchronously in the background
async function initializeAnalytics() {
  try {
    const BASE = import.meta.env.VITE_API_URL || '/api'
    const res = await fetch(`${BASE}/settings`)
    if (res.ok) {
      const data = await res.json()
      const settings = data?.data || {}

      if (settings.sys_ga_measurement_id && !window.gtag) {
        const gaId = settings.sys_ga_measurement_id
        const script = document.createElement('script')
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
        document.head.appendChild(script)

        window.dataLayer = window.dataLayer || []
        window.gtag = function () {
          window.dataLayer.push(arguments)
        }
        window.gtag('js', new Date())
        window.gtag('config', gaId, { page_path: window.location.pathname })
        console.log('[GA4] Loaded successfully in the background')
      }
    }
  } catch (err) {
    console.warn('[main] Failed to fetch GA4 config:', err.message)
  }
}

initializeAnalytics()

// ── Global Scroll-Reveal Observer ──────────────────────────────
// Watches for .reveal, .reveal-left, .reveal-right, .reveal-scale elements
// and adds .visible class when they enter the viewport.
function initScrollReveal() {
  const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  )

  const observe = () => {
    document.querySelectorAll(selectors).forEach((el) => {
      if (!el.classList.contains('visible')) observer.observe(el)
    })
  }

  // Initial pass after first render
  setTimeout(observe, 100)

  // MutationObserver picks up dynamically added reveal elements (route changes)
  const mutObs = new MutationObserver(observe)
  mutObs.observe(document.body, { childList: true, subtree: true })
}

initScrollReveal()


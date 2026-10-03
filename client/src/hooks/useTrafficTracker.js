import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '@/utils/api'

/**
 * Custom hook to track page visit statistics and GA4 SPA route transitions.
 * - Pings backend POST /api/track-visit endpoint upon page change.
 * - Dispatches GA4 'page_view' events on React Router internal navigation.
 * - Respects initial GA4 automatic pageview from gtag('config') in main.jsx to prevent duplicates.
 * - Excludes /admin/* and /client/* routes.
 * - Runs asynchronously and fails silently to prevent page load delays.
 */
export function useTrafficTracker() {
  const location = useLocation()
  const lastTrackedPath = useRef('')
  const isInitialMount = useRef(true)

  useEffect(() => {
    const currentPath = location.pathname
    const fullPath = location.pathname + (location.search || '')

    // Exclude admin and client portal routes from analytics and visit tracking
    if (currentPath.startsWith('/admin') || currentPath.startsWith('/client')) {
      return
    }

    // Prevent duplicate logs on double renders in strict mode or identical navigation
    if (lastTrackedPath.current === fullPath) return
    lastTrackedPath.current = fullPath

    const isInitial = isInitialMount.current
    isInitialMount.current = false

    // Queue tracking request to execute asynchronously after page rendering finishes
    const track = async () => {
      // 1. Backend traffic tracking (both initial and internal navigation)
      try {
        const payload = {
          path: fullPath,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
        }

        // Fails silently, does not block UI
        await api.post('/track-visit', payload)
      } catch {
        // Silent catch to prevent console errors for end-users
      }

      // 2. GA4 SPA route tracking:
      // Initial pageview is handled by GA4 automatic pageview in main.jsx config.
      // Internal React Router navigations emit page_view with resolved title & URL.
      if (!isInitial) {
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: fullPath,
          })
        }
      }
    }

    // Delay slightly to ensure document.title and browser DOM have settled
    const timer = setTimeout(track, 300)
    return () => clearTimeout(timer)
  }, [location.pathname, location.search])
}

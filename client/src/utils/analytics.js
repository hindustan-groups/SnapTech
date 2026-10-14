/**
 * analytics.js — Marketing Attribution (UTM) & Analytics Event Tracking
 *
 * Captures UTM parameters from URL on first landing and stores them in sessionStorage.
 * Automatically attaches attribution data to contact forms and quote requests.
 * Safely forwards conversion events to Google Analytics 4 / Google Tag Manager.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
const STORAGE_KEY = 'snaptech_attribution'

/**
 * Initializes and captures UTM parameters from current URL location.
 * Should be called on application mount.
 */
export function initAttribution() {
  if (typeof window === 'undefined') return

  try {
    const params = new URLSearchParams(window.location.search)
    const captured = {}
    let hasUtm = false

    for (const key of UTM_KEYS) {
      const val = params.get(key)
      if (val) {
        captured[key] = val.slice(0, 100) // sanitize max length
        hasUtm = true
      }
    }

    // Capture referrer if external
    if (document.referrer && !document.referrer.includes(window.location.hostname)) {
      captured.referrer = document.referrer.slice(0, 250)
      hasUtm = true
    }

    if (hasUtm) {
      const existing = getAttribution()
      const merged = { ...existing, ...captured, capturedAt: new Date().toISOString() }
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    }
  } catch {
    // Graceful fallback if storage is restricted
  }
}

/**
 * Returns currently stored UTM attribution object.
 */
export function getAttribution() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * Dispatches a custom conversion or engagement event to Google Analytics / Tag Manager.
 *
 * @param {string} eventName — e.g. 'generate_lead', 'contact_submit', 'phone_call_click'
 * @param {object} [eventParams={}] — additional properties
 */
export function trackEvent(eventName, eventParams = {}) {
  if (typeof window === 'undefined') return

  const attribution = getAttribution()
  const payload = {
    ...eventParams,
    ...attribution,
    page_location: window.location.href,
    page_path: window.location.pathname,
  }

  // 1. Google Analytics 4 (gtag.js)
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, payload)
    } catch {
      // Ignore tracking errors
    }
  }

  // 2. Google Tag Manager (dataLayer)
  if (Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({ event: eventName, ...payload })
    } catch {
      // Ignore tracking errors
    }
  }
}

/**
 * WelcomePopup.jsx
 * Premium, high-converting first-time visitor welcome modal for SnapTech Digital.
 *
 * Visual & UX Specification:
 * - Reference Design: Compact luxury software-agency card (~780px max desktop width, 24px radius).
 * - Header: Deep navy-to-electric-blue gradient with 3D laptop/code illustration & brand nodes mark.
 * - Flowing Wave: Seamless curved SVG transition between gradient header and crisp white content.
 * - Content:
 *     - Pill badge: "✦ BUILD YOUR IDEAS WITH EXPERTS"
 *     - Heading: "Need a Modern Website or Custom Software?" with electric blue accent
 *     - Two feature cards: "Clear Project Estimate" & "100% Code Ownership"
 *     - Side-by-side primary CTAs: "Get a Free Project Estimate" (Blue) & "Chat on WhatsApp" (Green)
 *     - Footer: "Explore Our Services & Pricing" + "Get a response within 1 business day"
 * - Responsive: 100% responsive across desktop (780px), tablet, mobile (320-440px), and landscape heights.
 * - Accessibility: WCAG dialog semantics, focus trap, Escape dismissal, body scroll lock, aria labels.
 * - Smart Cooldown: 7-second considerate timer, 7-day versioned cooldown, session dismissal guard.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  FileText,
  ShieldCheck,
  Send,
  ArrowRight,
  LayoutGrid,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSiteSettings } from '@/hooks/useContent'
import { trackEvent } from '@/utils/analytics'

const POPUP_STORAGE_KEY = 'snaptech_welcome_v2'
const COOLDOWN_DAYS = 7
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000
const TIMER_DELAY_MS = 7000

// Routes where the promotional popup should never interrupt visitors
const SUPPRESSED_PATHS = [
  '/contact',
  '/thank-you',
  '/privacy-policy',
  '/terms-of-service',
  '/refund-policy',
]

function isSuppressedRoute(pathname) {
  if (!pathname) return false
  if (SUPPRESSED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true
  }
  if (pathname.startsWith('/admin') || pathname.startsWith('/client')) {
    return true
  }
  return false
}

function hasActiveModalInDOM() {
  if (typeof document === 'undefined') return false

  // 1. Check for any active modal or dialog other than this welcome popup
  const openModals = Array.from(
    document.querySelectorAll('[aria-modal="true"], [role="dialog"]')
  ).filter((el) => el.id !== 'snaptech-welcome-popup' && !el.closest('#snaptech-welcome-popup'))

  if (openModals.length > 0) return true

  // 2. Check if body overflow is already locked by another open modal
  if (document.body.style.overflow === 'hidden' || document.body.classList.contains('modal-open')) {
    return true
  }

  return false
}

/* ── Authentic WhatsApp Icon Component ── */
function WhatsAppIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.884 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ── 3D Tech Illustration Component ── */
function HeaderTechIllustration() {
  return (
    <svg
      viewBox="0 0 290 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full object-contain pointer-events-none select-none drop-shadow-xl"
      aria-hidden="true"
    >
      <defs>
        {/* Ambient Laptop Lid Gradient */}
        <linearGradient id="laptopLidGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0a1224" />
        </linearGradient>

        {/* Glowing Screen Gradient */}
        <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#08183d" />
          <stop offset="100%" stopColor="#020819" />
        </linearGradient>

        {/* Keyboard Deck Gradient */}
        <linearGradient id="deckGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Cloud Cube 3D Gradient */}
        <linearGradient id="cloudCubeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* AI Cube 3D Gradient */}
        <linearGradient id="aiCubeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        {/* Radial Ambient Shadow / Glow */}
        <radialGradient id="laptopAmbientGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#1B6EF3" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#1B6EF3" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Floor Glow under Laptop */}
      <ellipse cx="150" cy="138" rx="80" ry="20" fill="url(#laptopAmbientGlow)" />

      {/* ── 3D Floating Cloud Cube (Left) ── */}
      <g transform="translate(18, 68)">
        {/* Soft Drop Shadow */}
        <rect x="2" y="8" width="36" height="36" rx="10" fill="#020617" opacity="0.4" />
        {/* Main Cube Body */}
        <rect width="36" height="36" rx="10" fill="url(#cloudCubeGrad)" stroke="#bae6fd" strokeWidth="1" />
        {/* Specular Edge Highlight */}
        <path
          d="M3 12C3 7 7 3 12 3H24C29 3 33 7 33 12V15C25 15 13 17 3 21V12Z"
          fill="white"
          opacity="0.35"
        />
        {/* Crisp Cloud Icon */}
        <path
          d="M13 23C11.3431 23 10 21.6569 10 20C10 18.4239 11.218 17.1328 12.7661 17.0135C13.2505 14.7176 15.2891 13 17.7143 13C20.4429 13 22.6806 15.1506 22.8465 17.8517C24.6291 18.0694 26 19.5852 26 21.4286C26 23.401 24.401 25 22.4286 25H13"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* ── 3D Laptop In Isometric Perspective ── */}
      <g transform="translate(68, 18)">
        {/* Screen Bezel (Tilted backwards) */}
        <path
          d="M14 6 L144 6 C148 6 151 9 151 13 L148 98 C148 101 145 104 141 104 L17 104 C13 104 10 101 10 98 L7 13 C7 9 10 6 14 6 Z"
          fill="url(#laptopLidGrad)"
          stroke="#475569"
          strokeWidth="1.2"
        />

        {/* Screen Display Matrix */}
        <path d="M15 11 L143 11 L140 96 L18 96 Z" fill="url(#screenGrad)" stroke="#1e293b" strokeWidth="0.8" />

        {/* Top Window Action Dots */}
        <circle cx="24" cy="18" r="2" fill="#ef4444" />
        <circle cx="30" cy="18" r="2" fill="#eab308" />
        <circle cx="36" cy="18" r="2" fill="#22c55e" />

        {/* Glowing Central Code Brackets </ > */}
        <g transform="translate(60, 30)">
          {/* Cyan Glow layer */}
          <text
            x="19"
            y="23"
            fontFamily="'Fira Code', 'Courier New', monospace"
            fontSize="24"
            fontWeight="900"
            fill="#38BDF8"
            textAnchor="middle"
            opacity="0.9"
          >
            &lt;/&gt;
          </text>
        </g>

        {/* Colored Syntax Lines on Screen */}
        <rect x="26" y="65" width="40" height="3" rx="1.5" fill="#38BDF8" opacity="0.85" />
        <rect x="71" y="65" width="56" height="3" rx="1.5" fill="#64748b" opacity="0.6" />
        <rect x="26" y="73" width="24" height="3" rx="1.5" fill="#818cf8" opacity="0.85" />
        <rect x="55" y="73" width="50" height="3" rx="1.5" fill="#38BDF8" opacity="0.6" />
        <rect x="26" y="81" width="60" height="3" rx="1.5" fill="#64748b" opacity="0.5" />
        <rect x="91" y="81" width="34" height="3" rx="1.5" fill="#34d399" opacity="0.75" />

        {/* Keyboard Deck (Projecting forward in perspective) */}
        <path
          d="M10 104 L148 104 L170 128 C171 129 170 131 168 131 L-10 131 C-12 131 -13 129 -12 128 L10 104 Z"
          fill="url(#deckGrad)"
          stroke="#64748b"
          strokeWidth="0.8"
        />

        {/* Front Lip Reflection */}
        <path d="M-10 131 L168 131 L166 134 L-8 134 Z" fill="#0f172a" />
        <line x1="-10" y1="131" x2="168" y2="131" stroke="#94a3b8" strokeWidth="0.8" opacity="0.85" />

        {/* Keyboard Well */}
        <path d="M14 107 L144 107 L154 120 L4 120 Z" fill="#090d16" stroke="#1e293b" strokeWidth="0.5" />

        {/* Illuminated Neon Cyan Keys Grid */}
        <line x1="18" y1="111" x2="140" y2="111" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.45" />
        <line x1="14" y1="115" x2="144" y2="115" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4 2" opacity="0.45" />
        <line x1="10" y1="119" x2="148" y2="119" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="5 2" opacity="0.45" />

        {/* Trackpad */}
        <path d="M64 122 L94 122 L96 129 L62 129 Z" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
      </g>

      {/* ── 3D Floating AI Cube (Right) ── */}
      <g transform="translate(228, 56)">
        {/* Soft Shadow */}
        <rect x="2" y="8" width="36" height="36" rx="10" fill="#020617" opacity="0.5" />
        {/* Main AI Cube */}
        <rect width="36" height="36" rx="10" fill="url(#aiCubeGrad)" stroke="#93c5fd" strokeWidth="1" />
        {/* Specular Highlight */}
        <path
          d="M3 12C3 7 7 3 12 3H24C29 3 33 7 33 12V15C25 15 13 17 3 21V12Z"
          fill="white"
          opacity="0.35"
        />
        {/* Bold AI Typography */}
        <text
          x="18"
          y="24"
          fontFamily="'Inter', system-ui, sans-serif"
          fontSize="16"
          fontWeight="900"
          fill="white"
          textAnchor="middle"
          letterSpacing="-0.5"
        >
          AI
        </text>
      </g>

      {/* ── Mini Code / Terminal Floating Badge (Bottom Right) ── */}
      <g transform="translate(216, 105)">
        <rect width="32" height="26" rx="6" fill="#09132c" stroke="#1d4ed8" strokeWidth="0.9" opacity="0.95" />
        <rect x="5" y="6" width="10" height="2" rx="1" fill="#38bdf8" />
        <rect x="5" y="11" width="18" height="2" rx="1" fill="#94a3b8" />
        <rect x="5" y="16" width="22" height="2" rx="1" fill="#3b82f6" />
        <rect x="5" y="21" width="13" height="2" rx="1" fill="#34d399" />
      </g>
    </svg>
  )
}

export default function WelcomePopup() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    const searchParams = new URLSearchParams(window.location.search)
    return searchParams.get('welcome') === '1' || searchParams.get('popup') === '1'
  })
  const navigate = useNavigate()
  const timerRef = useRef(null)
  const modalRef = useRef(null)
  const previousActiveElementRef = useRef(null)

  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}
  const rawWa = cfg.whatsapp || cfg.phone || '+91 8209604849'
  const cleanWa = rawWa.replace(/\D/g, '') || '918209604849'

  const recordDismissal = useCallback(() => {
    try {
      const now = Date.now().toString()
      localStorage.setItem(POPUP_STORAGE_KEY, now)
      localStorage.setItem('hp_welcome_seen', 'true') // legacy fallback
      sessionStorage.setItem(POPUP_STORAGE_KEY, 'dismissed') // prevents repeat in same visit
    } catch {
      // Graceful fallback for private browsing mode
    }
  }, [])

  const handleClose = useCallback(
    (method = 'close_button') => {
      setIsOpen(false)
      recordDismissal()
      trackEvent('popup_dismiss', {
        popup_name: 'welcome_modal',
        method,
      })

      // Restore focus to triggering element
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus()
      }
    },
    [recordDismissal]
  )

  const handleAction = useCallback(
    (path, actionName) => {
      setIsOpen(false)
      recordDismissal()
      trackEvent('popup_cta_click', {
        popup_name: 'welcome_modal',
        action: actionName,
        destination: path,
      })
      navigate(path)
    },
    [navigate, recordDismissal]
  )

  const handleWhatsApp = useCallback(() => {
    setIsOpen(false)
    recordDismissal()
    trackEvent('popup_cta_click', {
      popup_name: 'welcome_modal',
      action: 'whatsapp_consultation',
      destination: 'whatsapp',
    })
    const msg = encodeURIComponent(
      'Hello SnapTech Team, I would like to get a clear project estimate for my software/web requirements.'
    )
    window.open(`https://wa.me/${cleanWa}?text=${msg}`, '_blank', 'noopener,noreferrer')
  }, [cleanWa, recordDismissal])

  // Timer trigger with cooldown, route validation and instant preview support
  useEffect(() => {
    // 1. Instant preview/test support via query param (?welcome=1 or ?popup=1)
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get('welcome') === '1' || searchParams.get('popup') === '1') {
      return
    }

    // 2. Custom event trigger support
    const handleOpenEvent = () => setIsOpen(true)
    window.addEventListener('open-welcome-popup', handleOpenEvent)

    if (isSuppressedRoute(location.pathname)) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return () => {
        window.removeEventListener('open-welcome-popup', handleOpenEvent)
      }
    }

    // Check 7-day versioned cooldown & same-session dismissal
    try {
      if (sessionStorage.getItem(POPUP_STORAGE_KEY) === 'dismissed') {
        return () => {
          window.removeEventListener('open-welcome-popup', handleOpenEvent)
        }
      }

      const raw = localStorage.getItem(POPUP_STORAGE_KEY)
      if (raw) {
        const timestamp = parseInt(raw, 10)
        if (!Number.isNaN(timestamp) && Date.now() - timestamp < COOLDOWN_MS) {
          return () => {
            window.removeEventListener('open-welcome-popup', handleOpenEvent)
          }
        }
      }
    } catch {
      // Storage access blocked; do not trigger aggressively
      return () => {
        window.removeEventListener('open-welcome-popup', handleOpenEvent)
      }
    }

    timerRef.current = setTimeout(() => {
      // Ensure no route suppression or collision with another open modal
      if (isSuppressedRoute(location.pathname) || hasActiveModalInDOM()) {
        return
      }

      // Save previously focused element for accessible focus restoration
      if (typeof document !== 'undefined') {
        previousActiveElementRef.current = document.activeElement
      }

      setIsOpen(true)
      trackEvent('popup_impression', { popup_name: 'welcome_modal' })
    }, TIMER_DELAY_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      window.removeEventListener('open-welcome-popup', handleOpenEvent)
    }
  }, [location.pathname, location.search])

  // Accessibility: Keyboard Escape handler, Focus Trap & Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose('escape_key')
        return
      }

      // Simple keyboard focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    // Focus primary button when modal opens
    const focusTimer = setTimeout(() => {
      const primaryBtn = modalRef.current?.querySelector('#popup-primary-cta')
      if (primaryBtn) {
        primaryBtn.focus()
      }
    }, 50)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(focusTimer)
    }
  }, [isOpen, handleClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="snaptech-welcome-popup-backdrop"
          className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          {/* Subtle Dark Navy Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => handleClose('backdrop')}
            className="fixed inset-0 bg-[#03091e]/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container Card */}
          <motion.div
            ref={modalRef}
            id="snaptech-welcome-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-popup-heading"
            aria-describedby="welcome-popup-desc"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 16, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="bg-white rounded-[22px] sm:rounded-[26px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(2,12,38,0.45)] relative w-full max-w-195 z-10 border border-blue-400/25 flex flex-col max-h-[92vh] my-auto"
          >
            {/* ── Compact Luxury Navy-to-Electric-Blue Gradient Header ── */}
            <div className="relative bg-linear-to-r from-[#030B26] via-[#071D57] to-[#1255DB] px-5 sm:px-8 pt-5 sm:pt-6 pb-9 sm:pb-11 shrink-0 overflow-hidden">
              {/* Atmosphere: Subtle Grid Texture & Neon Glows */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />
              <div className="absolute -top-10 -right-8 w-64 h-64 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 left-1/4 w-48 h-48 rounded-full bg-blue-600/25 blur-2xl pointer-events-none" />

              {/* Brand Header Row */}
              <div className="relative z-10 flex items-center justify-between gap-4 pr-11 sm:pr-14">
                {/* Left: Official Brand Identity & Tagline */}
                <div className="max-w-90 sm:max-w-105">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* SnapTech Three Connected Nodes Brand Mark */}
                    <div className="relative shrink-0 w-8 h-8 sm:w-9 sm:h-9">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 36 36"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        {/* Connecting curved digital circuits */}
                        <path d="M12 18 C12 9, 24 13, 24 7" stroke="#1B6EF3" strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M12 18 C12 27, 24 23, 24 29" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Interactive digital nodes */}
                        <circle cx="24" cy="7" r="4" fill="#38BDF8" />
                        <circle cx="12" cy="18" r="4.5" fill="#1B6EF3" />
                        <circle cx="24" cy="29" r="4" fill="#38BDF8" />
                      </svg>
                    </div>

                    {/* Brand Name */}
                    <div className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight leading-none">
                      <span className="text-white">SnapTech</span>{' '}
                      <span className="text-[#38BDF8]">Digital</span>
                    </div>
                  </div>

                  {/* Brand Tagline */}
                  <p className="text-[11px] sm:text-xs text-blue-100/90 font-medium mt-1.5 sm:mt-2 leading-relaxed">
                    Engineering High-Impact Web, Cloud &amp; AI Solutions
                  </p>
                </div>

                {/* Right: 3D Isometric Tech Illustration (Laptop, Cloud, AI) */}
                <div className="hidden sm:block w-44 md:w-56 h-24 md:h-28 shrink-0 relative">
                  <HeaderTechIllustration />
                </div>
              </div>

              {/* Accessible Close Button */}
              <button
                type="button"
                onClick={() => handleClose('close_button')}
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Close popup"
              >
                <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Seamless Curved Wave Transition to White Body */}
              <svg
                className="absolute bottom-0 inset-x-0 w-full h-6 sm:h-8 md:h-9 text-white fill-current pointer-events-none"
                viewBox="0 0 800 48"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M 0 16 C 180 16, 280 6, 440 22 C 580 36, 700 34, 800 18 L 800 48 L 0 48 Z" />
              </svg>
            </div>

            {/* ── Content Section with Internal Scroll for Small/Landscape Viewports ── */}
            <div className="p-5 sm:p-7 md:p-8 space-y-4 sm:space-y-5 overflow-y-auto">
              {/* Header Badge & Title */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/70 text-[10px] sm:text-[11px] font-bold text-[#1B6EF3] tracking-wider uppercase">
                  <Sparkles className="w-3 h-3 text-[#1B6EF3]" />
                  <span>BUILD YOUR IDEAS WITH EXPERTS</span>
                </div>

                <h3
                  id="welcome-popup-heading"
                  className="text-xl sm:text-2xl md:text-[27px] font-extrabold text-[#0B1536] leading-tight tracking-tight"
                >
                  Need a Modern Website{' '}
                  <span className="text-[#1B6EF3]">or Custom Software?</span>
                </h3>

                <p id="welcome-popup-desc" className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Get a clear plan, timeline and accurate estimate tailored to your business needs.
                </p>
              </div>

              {/* Two Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                {/* Feature Card 1 */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-blue-100/70 hover:border-blue-200 transition-colors">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#1B6EF3] shrink-0 shadow-xs">
                    <FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5" strokeWidth={1.9} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-[#0B1536] leading-tight">
                      Clear Project Estimate
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                      Detailed scope, timeline &amp; cost — no hidden charges.
                    </p>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-emerald-100/70 hover:border-emerald-200 transition-colors">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                    <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5" strokeWidth={1.9} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-[#0B1536] leading-tight">
                      100% Code Ownership
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                      You own the code with full transparency.
                    </p>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Primary Call-to-Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
                {/* Primary Button: Get a Free Project Estimate */}
                <button
                  type="button"
                  id="popup-primary-cta"
                  onClick={() => handleAction('/contact', 'request_estimate')}
                  className="flex-1 bg-linear-to-r from-[#0D6EFD] to-[#1B6EF3] hover:from-[#0B5ED7] hover:to-[#1458D0] text-white text-xs sm:text-[13px] font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>Get a Free Project Estimate</span>
                  <ArrowRight className="w-4 h-4 ml-0.5 shrink-0" />
                </button>

                {/* Secondary Button: Chat on WhatsApp */}
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="flex-1 bg-[#00A859] hover:bg-[#008f4c] text-white text-xs sm:text-[13px] font-bold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>Chat on WhatsApp</span>
                  <ArrowRight className="w-4 h-4 ml-0.5 shrink-0" />
                </button>
              </div>

              {/* Compact Footer Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-3.5 border-t border-slate-100 text-xs">
                {/* Explore Services & Pricing */}
                <button
                  type="button"
                  onClick={() => handleAction('/pricing', 'explore_pricing')}
                  className="text-slate-600 hover:text-[#1B6EF3] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer group"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#1B6EF3] shrink-0" />
                  <span>Explore Our Services &amp; Pricing</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#1B6EF3] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Response Time Notice */}
                <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px] sm:text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Get a response within 1 business day</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


/**
 * WelcomePopup.jsx
 * High-converting, respectful first-time visitor welcome modal for SnapTech Digital.
 *
 * Enhancements:
 * - 7-second considerate timer & 7-day versioned cooldown with session dismissal guard.
 * - Suppressed on conversion pages (/contact, /thank-you) and legal policy routes.
 * - Active modal collision prevention (never opens over quote modals or other dialogs).
 * - Full accessibility: role="dialog", aria-modal="true", Escape key dismissal, body scroll lock.
 * - Mobile responsive with max-h-[90vh] and internal scrolling for all viewport heights.
 * - Seamless analytics event tracking via existing trackEvent() utility.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, PhoneCall, ArrowRight, ShieldCheck, Code2, MessageSquare, Cpu } from 'lucide-react'
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

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const timerRef = useRef(null)

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

  // Timer trigger with cooldown and route validation
  useEffect(() => {
    if (isSuppressedRoute(location.pathname)) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    // Check 7-day versioned cooldown & same-session dismissal
    try {
      if (sessionStorage.getItem(POPUP_STORAGE_KEY) === 'dismissed') {
        return
      }

      const raw = localStorage.getItem(POPUP_STORAGE_KEY)
      if (raw) {
        const timestamp = parseInt(raw, 10)
        if (!Number.isNaN(timestamp) && Date.now() - timestamp < COOLDOWN_MS) {
          return
        }
      }
    } catch {
      // Storage access blocked; do not trigger aggressively
      return
    }

    timerRef.current = setTimeout(() => {
      // Ensure no route suppression or collision with another open modal
      if (isSuppressedRoute(location.pathname) || hasActiveModalInDOM()) {
        return
      }

      setIsOpen(true)
      trackEvent('popup_impression', { popup_name: 'welcome_modal' })
    }, TIMER_DELAY_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [location.pathname])

  // Accessibility: Keyboard Escape handler & Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose('escape_key')
      }
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="snaptech-welcome-popup-backdrop"
          className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => handleClose('backdrop')}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            id="snaptech-welcome-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-popup-heading"
            initial={{ scale: 0.94, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 15, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl relative w-full max-w-lg z-10 border border-slate-200/90 flex flex-col max-h-[90vh] my-auto"
          >
            {/* Top Decorative Gradient Cover */}
            <div className="h-28 sm:h-32 bg-linear-to-r from-[#0D1B4B] via-[#122A6B] to-[#1B6EF3] p-5 sm:p-6 flex items-center relative overflow-hidden shrink-0">
              {/* Background Shapes & Subtle Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />
              <div className="absolute w-48 h-48 rounded-full bg-white/10 -top-12 -right-6 blur-lg pointer-events-none" />
              <div className="absolute w-32 h-32 rounded-full bg-brand-cyan/20 -bottom-8 -left-8 blur-md pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10 pr-10">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                  <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-cyan" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-heading font-extrabold text-white leading-tight flex items-center gap-1.5 tracking-tight">
                    SnapTech Digital
                    <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-blue-200 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Engineering High-Impact Web, Cloud &amp; AI Solutions
                  </p>
                </div>
              </div>

              {/* Close Button with generous touch target */}
              <button
                onClick={() => handleClose('close_button')}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white/90 hover:text-white transition-all cursor-pointer border border-white/20 active:scale-95"
                aria-label="Close popup"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Content Area with smooth internal scroll on small viewports */}
            <div className="p-5 sm:p-7 space-y-5 text-slate-700 overflow-y-auto">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200/80 text-[10px] sm:text-[11px] font-bold text-brand-blue uppercase tracking-wider">
                  <Cpu className="w-3 h-3" /> Architecture Blueprint &amp; Verified Pricing
                </div>
                <h3
                  id="welcome-popup-heading"
                  className="text-base sm:text-lg font-bold text-slate-900 leading-snug"
                >
                  Need a Fast, Modern Website or Custom Software?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Get a clear, transparent project estimate tailored to your exact business specifications with zero obligation.
                </p>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  {
                    title: 'Clear Project Estimate',
                    desc: 'Itemized scope, timeline & cost tailored to your tech stack',
                    icon: Sparkles,
                    color: 'text-amber-600 bg-amber-50 border-amber-200/70',
                  },
                  {
                    title: '100% Code Ownership',
                    desc: 'Zero lock-in with full GitHub & cloud transparency',
                    icon: ShieldCheck,
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-200/70',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}
                    >
                      <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* High-Converting CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  onClick={() => handleAction('/contact', 'request_estimate')}
                  className="flex-1 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-brand-blue/20 flex items-center justify-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Get a Clear Project Estimate</span>
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-emerald-600/20 flex items-center justify-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Instant WhatsApp Consultation</span>
                </button>
              </div>

              {/* Secondary Navigation & Polite Dismissal */}
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                <button
                  onClick={() => handleAction('/pricing', 'explore_pricing')}
                  className="text-slate-600 hover:text-brand-blue font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Explore Pricing &amp; Packages <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
                <button
                  onClick={() => handleClose('browse_first')}
                  className="font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                >
                  Browse website first
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

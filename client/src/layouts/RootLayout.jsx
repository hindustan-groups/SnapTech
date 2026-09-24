import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/ui/PageTransition'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'

import { useSiteSettings } from '@/hooks/useContent'

/**
 * RootLayout — shared shell for all public pages.
 * Uses React Router <Outlet> to render the active page.
 * Includes: scroll-to-top on route change + smooth page transitions.
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

import { useTrafficTracker } from '@/hooks/useTrafficTracker'
import WelcomePopup from '@/components/ui/WelcomePopup'
import CookieConsent from '@/components/ui/CookieConsent'

export default function RootLayout() {
  useTrafficTracker() // Track page visit count on each navigation
  const location = useLocation()
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}

  const rawWhatsapp = cfg.whatsapp || cfg.phone || ''
  const whatsappNum = rawWhatsapp && !rawWhatsapp.includes('99999') && !rawWhatsapp.includes('123456')
    ? rawWhatsapp.replace(/[^0-9]/g, '')
    : '917597000601'

  return (
    <div className="min-h-screen bg-bg-base text-text-dark font-body flex flex-col relative">
      {/* ── Skip Navigation Link (Accessibility: WCAG 2.4.1) ── */}
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-50 -translate-y-20 focus:translate-y-0 transition-transform duration-150
          bg-brand-blue text-white text-sm font-semibold px-4 py-2 rounded-md shadow-lg
          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-blue"
      >
        Skip to main content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main-content" className="flex-1">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      
      {/* Premium First-time Visitor Welcome Modal */}
      <WelcomePopup />

      {/* User Cookie & Privacy Consent Notice (DPDP / GDPR Compliance) */}
      <CookieConsent />

      {/* Floating WhatsApp Chat Widget (moved to bottom-24) */}
      <a
        href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(cfg.whatsappMessage || 'Hi! I visited your website and want to discuss a project.')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-24 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:scale-115 active:scale-95 transition-all duration-300 group flex items-center justify-center cursor-pointer"
      >
        {/* Pulsing ring animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/50 animate-ping opacity-75 -z-10" />

        {/* WhatsApp Icon */}
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6.5 h-6.5" aria-hidden="true">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.556 0 10.076-4.522 10.079-10.082.002-2.693-1.043-5.226-2.946-7.13-1.902-1.903-4.432-2.951-7.123-2.952-5.56 0-10.08 4.521-10.083 10.081-.001 1.62.433 3.202 1.258 4.606L1.137 21.8l4.908-1.287 1.272.77c1.3.788 2.6 1.18 3.9 1.18zM17.18 14.16c-.286-.142-1.69-.834-1.952-.929-.262-.096-.453-.142-.643.142-.19.285-.736.929-.903 1.12-.167.19-.334.213-.62.071-.286-.142-1.21-.446-2.305-1.424-.853-.761-1.43-1.7-1.597-1.984-.167-.285-.018-.439.125-.58.129-.126.286-.334.429-.5.143-.167.19-.286.286-.476.095-.19.047-.357-.024-.5-.071-.142-.643-1.547-.88-2.119-.23-.559-.483-.483-.662-.492-.17-.008-.367-.01-.563-.01-.197 0-.517.073-.787.367-.27.293-1.03 1.006-1.03 2.455 0 1.449 1.054 2.848 1.202 3.048.147.2 2.075 3.168 5.027 4.444.702.304 1.25.486 1.677.621.705.224 1.348.193 1.856.117.567-.084 1.69-.691 1.928-1.359.238-.668.238-1.24.167-1.359-.071-.12-.262-.19-.548-.332z" />
        </svg>

        {/* Tooltip */}
        <span className="absolute right-15 bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none select-none">
          WhatsApp
        </span>
      </a>

      {/* Public FAQ Chatbot widget */}
      <ChatbotWidget />
    </div>
  )
}

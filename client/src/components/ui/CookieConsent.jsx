import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Cookie, X } from 'lucide-react'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('snaptech_cookie_consent')
    if (!consent) {
      // Delay showing banner slightly to allow page to render smoothly
      const timer = setTimeout(() => setIsVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem('snaptech_cookie_consent', 'accepted')
    localStorage.setItem('snaptech_cookie_date', new Date().toISOString())
    setIsVisible(false)
  }

  const handleEssentialOnly = () => {
    localStorage.setItem('snaptech_cookie_consent', 'essential')
    localStorage.setItem('snaptech_cookie_date', new Date().toISOString())
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div
      role="region"
      aria-label="Privacy and Cookie Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-5 text-slate-800 relative">
        <button
          type="button"
          onClick={handleEssentialOnly}
          aria-label="Dismiss cookie notice"
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-blue shrink-0 mt-0.5">
            <Cookie className="w-5 h-5 text-brand-blue" />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <h4 className="font-heading font-bold text-sm text-slate-900">
                Your Privacy & Cookie Choices
              </h4>
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              We use cookies to maintain secure sessions, analyze website traffic, and ensure seamless performance. We respect your data rights under the DPDP Act & GDPR.{' '}
              <Link
                to="/privacy-policy"
                className="text-brand-blue font-semibold hover:underline"
              >
                Privacy Policy
              </Link>
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer hover:shadow-md"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

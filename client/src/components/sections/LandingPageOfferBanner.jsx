/**
 * LandingPageOfferBanner.jsx
 * High-conversion promotional section advertising a starter single-page
 * business landing website starting at ₹2,999.
 *
 * Connects directly to SnapTech's verified inquiry flow and instant WhatsApp desk.
 */

import { ArrowRight, CheckCircle2, Sparkles, MessageCircle, Zap, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'
import { trackEvent } from '@/utils/analytics'

export default function LandingPageOfferBanner({
  onClaimOffer,
  as: Component = 'section',
  showContainer = true,
  className = 'py-16 sm:py-20 bg-slate-50 relative overflow-hidden',
  id = 'landing-offer-banner',
}) {
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}
  const rawWhatsapp = cfg.whatsapp || cfg.phone || '918209604849'
  const whatsappNum = rawWhatsapp.replace(/[^0-9]/g, '') || '918209604849'

  const handleClaim = (e) => {
    if (onClaimOffer) {
      e.preventDefault()
      onClaimOffer()
      return
    }
    const contactEl = document.getElementById('contact')
    if (contactEl) {
      e.preventDefault()
      contactEl.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(
    'Hello SnapTech, I would like to inquire about the ₹2,999 Landing Page Website Offer.'
  )}`

  const content = (
    <div className="relative rounded-3xl bg-linear-to-br from-[#090f2d] via-[#0D1B4B] to-[#142867] text-white p-7 sm:p-10 lg:p-12 shadow-2xl border border-blue-400/20 overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Content (7 cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/20 border border-brand-blue/40 text-brand-cyan text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Landing Page Website — Starting at ₹2,999</span>
          </div>

          <h2
            id="landing-offer-heading"
            className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight"
          >
            Launch Your Business Online With a High-Converting Landing Page
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl">
            Need a fast, professional digital presence to run ads or capture client inquiries?
            Get a clean, modern single-page website engineered for mobile responsiveness, speed, and genuine leads.
          </p>

          {/* Offer Deliverables List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {[
              'Mobile & Desktop Responsive Layout',
              'High-Speed Clean Architecture',
              'One-Click WhatsApp & Call Buttons',
              'Inquiry Form & Social Links Section',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Transparent Disclaimer */}
          <p className="text-[11px] text-slate-400/90 pt-1 leading-normal italic">
            * Note: ₹2,999 is the starting baseline price for single-page landing site layouts. Scope, domain registration, hosting tier, and integrations are finalized upon technical review based on client requirements.
          </p>
        </div>

        {/* Right Price & CTA Box (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15 text-center space-y-5 shadow-lg">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan font-bold block">
                Landing Page Website
              </span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-semibold block">
                Starting at
              </span>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-4xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
                  ₹2,999
                </span>
                <span className="text-xs text-slate-300 font-medium">/ launch package</span>
              </div>
              <p className="text-[11px] text-slate-300">
                One-time development • Zero hidden retainers
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href="#contact"
                onClick={handleClaim}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Claim ₹2,999 Offer</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent('whatsapp_click', {
                    source: 'landing_page_offer_banner',
                    location: 'landing_offer_banner',
                    offer: '2999_landing_page',
                  })
                }
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 font-semibold text-xs transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Instant WhatsApp Consultation</span>
              </a>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-slate-300 font-mono">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-brand-cyan" /> Rapid Delivery
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Direct Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Component
      id={id}
      aria-labelledby="landing-offer-heading"
      className={className}
    >
      {showContainer ? <Container>{content}</Container> : content}
    </Component>
  )
}

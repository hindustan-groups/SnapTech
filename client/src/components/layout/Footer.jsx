/**
 * Footer — Snaptech IT Enterprise
 * Features:
 * - Newsletter subscription form linked to leads API
 * - Animated back-to-top button
 * - Social media hover effects
 * - Parent group ecosystem badge
 * - Glassmorphic stat strip
 */
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Container } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'
import { useServices } from '@/hooks/useServices'
import { api } from '@/utils/api'
import { ArrowUp, CheckCircle2, MapPin, Phone, Mail, ExternalLink } from 'lucide-react'
import snaptechLogoWhite from '@/assets/snaptech-logo-white.png'
import WaterRippleLogo from '@/components/ui/WaterRippleLogo'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'IT Services', href: '/services' },
  { label: 'Pricing & Packages', href: '/pricing' },
  { label: 'About Snaptech', href: '/about' },
  { label: 'Portfolio / Case Studies', href: '/portfolio' },
  { label: 'Tech Blog & Insights', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact & Inquiries', href: '/contact' },
]

const FALLBACK_SERVICES = [
  { label: 'Custom Web Applications', href: '/services/web-development' },
  { label: 'Mobile App Engineering', href: '/services/mobile-app-development' },
  { label: 'Cloud Architecture & DevOps', href: '/services/cloud-solutions-devops' },
  { label: 'AI & Workflow Automation', href: '/services/ai-automation' },
  { label: 'Enterprise ERP & Custom CRM', href: '/services/custom-software-development' },
  { label: 'SEO & Performance Engineering', href: '/services/digital-marketing-seo' },
]

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    key: 'instagram',
    fallback: 'https://instagram.com/hindustanprojects',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    key: 'facebook',
    fallback: 'https://facebook.com/hindustanprojects',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    key: 'linkedin',
    fallback: 'https://linkedin.com/company/hindustan-projects',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    key: 'pinterest',
    fallback: 'https://pinterest.com/hindustanprojects',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
        <line x1="12" y1="9" x2="12" y2="22" />
        <path d="M8 12c-2.5-3-1-8 4-8 4.5 0 6.5 3.5 6 7-0.5 3-2.5 5.5-5 5-1.5-0.3-2.2-1.5-2.2-1.5" />
      </svg>
    ),
  },
]

const TRUST_BADGES = [
  { label: '50+ Projects', icon: '🚀' },
  { label: '40+ Clients', icon: '🤝' },
  { label: '99.9% Uptime', icon: '⚡' },
  { label: 'Pan-India', icon: '🇮🇳' },
]

function BackToTop() {
  const handleClick = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  return (
    <button
      onClick={handleClick}
      className="group fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-brand-primary hover:bg-brand-primary-dark text-white shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
      aria-label="Back to top"
      title="Back to top"
    >
      <ArrowUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
    </button>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  const { data: settingsData } = useSiteSettings()
  const { data: servicesData } = useServices()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [subState, setSubState] = useState('idle') // idle | loading | success | error

  const cfg = settingsData?.data || {}
  const phone = cfg.phone || '+91 75970 00601'
  const contactEmail = cfg.email || 'info@snaptech.digital'
  const address = cfg.address || 'Bhilwara, Rajasthan 311001, India'

  const socials = SOCIAL_LINKS.map((s) => ({
    ...s,
    href: cfg[s.key] || s.fallback,
  }))

  const serviceLinks = servicesData?.data?.length
    ? servicesData.data.slice(0, 6).map((s) => ({ label: s.title, href: `/services/${s.slug}` }))
    : FALLBACK_SERVICES

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    if (!email || subState === 'loading') return
    setSubState('loading')
    try {
      await api.post('/contact', {
        name: 'Newsletter Subscriber',
        email,
        message: 'Newsletter subscription from Footer',
        serviceInterested: 'Newsletter',
        _hp: '',
      })
      setSubState('success')
      setEmail('')
    } catch {
      setSubState('error')
    }
  }

  return (
    <>
      <BackToTop />
      {/* ── Interactive Liquid Water Ripple Brand Showcase (Pre-Footer) ── */}
      <WaterRippleLogo />
      <footer className="bg-[#020714] text-white border-t border-blue-900/30 relative overflow-hidden" role="contentinfo">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />

        {/* ── Parent Group Ecosystem Strip ── */}
        <div className="border-b border-white/10 bg-white/[0.02]">
          <Container>
            <div className="py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-brand-primary/20 text-brand-primary-light border border-brand-primary/30">
                  Corporate Group
                </span>
                <span>
                  Snaptech is the dedicated IT & digital transformation company of{' '}
                  <strong className="text-white">Hindustan Projects Group</strong>.
                </span>
              </div>
              <a
                href={cfg.parent_company_url || 'https://www.hindustanprojects.in'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-cyan hover:text-white font-medium transition-colors shrink-0"
              >
                <span>{cfg.parent_company_url ? cfg.parent_company_url.replace(/^https?:\/\//, '') : 'hindustanprojects.in'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </Container>
        </div>

        {/* ── Trust Badges Strip ── */}
        <div className="border-b border-white/5 bg-white/[0.01]">
          <Container>
            <div className="py-3 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
              {TRUST_BADGES.map((b) => (
                <div key={b.label} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-base leading-none">{b.icon}</span>
                  <span className="font-semibold text-slate-300">{b.label}</span>
                </div>
              ))}
            </div>
          </Container>
        </div>

        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 py-14 lg:py-16">

            {/* Brand & Mission (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              <Link
                to="/"
                className="inline-block hover:scale-[1.02] transition-all duration-200"
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
              >
                <img
                  src={snaptechLogoWhite}
                  alt="Snaptech - IT & Technology Solutions"
                  className="h-10 lg:h-11 w-auto object-contain"
                />
              </Link>

              <p className="text-xs text-brand-cyan font-mono tracking-wider">
                snaptech.digital
              </p>

              <p className="text-sm text-slate-300 leading-relaxed">
                Delivering high-performance custom web applications, enterprise software, mobile platforms,
                cloud architecture, and digital growth systems for businesses in Bhilwara, India, and globally.
              </p>

              {/* Social Links */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                  Connect With Us
                </span>
                <div className="flex gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300
                        hover:border-brand-primary hover:bg-brand-primary hover:text-white
                        hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-primary/20
                        transition-all duration-200"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Tech Insights Newsletter
                </span>
                {subState === 'success' ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Subscribed! We'll be in touch.</span>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="flex-1 min-w-0 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary focus:bg-white/10 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={subState === 'loading'}
                      className="px-3 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold transition-colors shrink-0 disabled:opacity-60"
                    >
                      {subState === 'loading' ? '…' : 'Subscribe'}
                    </button>
                  </form>
                )}
                {subState === 'error' && (
                  <p className="text-red-400 text-[11px] mt-1">Failed. Please try again.</p>
                )}
              </div>
            </div>

            {/* IT Services (3 cols) */}
            <div className="lg:col-span-3">
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-white mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary" />
                IT & Tech Solutions
              </h3>
              <ul className="space-y-2.5" role="list">
                {serviceLinks.map((s) => (
                  <li key={s.label}>
                    <Link
                      to={s.href}
                      className="text-sm text-slate-300 hover:text-brand-cyan hover:translate-x-1.5
                        inline-block transition-all duration-200 flex items-center gap-1.5 group/footerlink"
                    >
                      <span className="w-1 h-1 rounded-full bg-brand-primary/50 group-hover/footerlink:bg-brand-cyan transition-colors shrink-0" />
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links (2 cols) */}
            <div className="lg:col-span-2">
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-white mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-cyan" />
                Company
              </h3>
              <ul className="space-y-2.5" role="list">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-300 hover:text-brand-cyan hover:translate-x-1.5
                        inline-flex items-center gap-1.5 transition-all duration-200 group/footerlink"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover/footerlink:bg-brand-cyan transition-colors shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Office (3 cols) */}
            <div className="lg:col-span-3">
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-white mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Tech Development Center
              </h3>
              <address className="not-italic space-y-4 text-sm text-slate-300">
                <div className="flex gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand-primary-light" aria-hidden="true" />
                  <span>{address}</span>
                </div>
                <div className="flex gap-3 items-center">
                  <Phone className="w-4 h-4 shrink-0 text-brand-primary-light" aria-hidden="true" />
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="hover:text-brand-cyan transition-colors font-medium"
                  >
                    {phone}
                  </a>
                </div>
                <div className="flex gap-3 items-center">
                  <Mail className="w-4 h-4 shrink-0 text-brand-primary-light" aria-hidden="true" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-brand-cyan transition-colors break-all">
                    {contactEmail}
                  </a>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href="https://wa.me/917597000601?text=Hi%20Snaptech%20Team%2C%20I%20am%20looking%20for%20IT%20Solutions."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400/50 text-xs font-semibold transition-colors mt-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Instant WhatsApp Connect
                </a>

                {/* Business Hours */}
                <div className="pt-1 text-xs text-slate-500 space-y-1">
                  <p className="text-slate-400 font-semibold">Business Hours</p>
                  <p>Mon–Sat: 9:00 AM – 7:00 PM IST</p>
                  <p>Sun: Emergency support only</p>
                </div>
              </address>
            </div>
          </div>

          {/* Bottom Legal Bar */}
          <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <p>
                © {year} <strong className="text-white">Snaptech</strong> — A Hindustan Projects Enterprise. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-slate-400 justify-center">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
            </div>
            <p className="text-slate-500 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-primary" />
              Bhilwara, Rajasthan, India
            </p>
          </div>
        </Container>
      </footer>
    </>
  )
}

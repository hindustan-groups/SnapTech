import { Link, useLocation } from 'react-router-dom'
import { Container } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'
import { useServices } from '@/hooks/useServices'
import snaptechLogo from '@/assets/snaptech-logo.png'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing & Packages', href: '/pricing' },
  { label: 'About Snaptech', href: '/about' },
  { label: 'Case Studies / Portfolio', href: '/portfolio' },
  { label: 'Tech Blog & Insights', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact & Inquiries', href: '/contact' },
]

// Real IT company services fallback
const FALLBACK_SERVICES = [
  { label: 'Custom Web Applications', href: '/services/web-development' },
  { label: 'Mobile App Engineering', href: '/services/mobile-app-development' },
  { label: 'Cloud Architecture & DevOps', href: '/services/cloud-infrastructure' },
  { label: 'AI & Workflow Automation', href: '/services/ai-automation' },
  { label: 'Enterprise ERP & Custom CRM', href: '/services/custom-software-development' },
  { label: 'SEO & Performance Engineering', href: '/services/seo-and-branding' },
]

const SOCIAL_ICONS = {
  instagram: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  facebook: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  pinterest: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <line x1="12" y1="9" x2="12" y2="22" />
      <path d="M8 12c-2.5-3-1-8 4-8 4.5 0 6.5 3.5 6 7-0.5 3-2.5 5.5-5 5-1.5-0.3-2.2-1.5-2.2-1.5" />
    </svg>
  ),
  linkedin: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
}

export default function Footer() {
  const year = new Date().getFullYear()
  const { data: settingsData } = useSiteSettings()
  const { data: servicesData } = useServices()
  const location = useLocation()

  const cfg = settingsData?.data || {}
  const phone = cfg.phone || '+91 75970 00601'
  const email = cfg.email || 'info@hindustanprojects.com'
  const address = cfg.address || 'Bhilwara, Rajasthan 311001, India'

  const socials = [
    { label: 'Instagram', href: cfg.instagram || 'https://instagram.com/hindustanprojects', icon: SOCIAL_ICONS.instagram },
    { label: 'Facebook', href: cfg.facebook || 'https://facebook.com/hindustanprojects', icon: SOCIAL_ICONS.facebook },
    { label: 'Pinterest', href: cfg.pinterest || 'https://pinterest.com/hindustanprojects', icon: SOCIAL_ICONS.pinterest },
    { label: 'LinkedIn', href: cfg.linkedin || 'https://linkedin.com/company/hindustan-projects', icon: SOCIAL_ICONS.linkedin },
  ]

  const serviceLinks = servicesData?.data?.length
    ? servicesData.data.slice(0, 6).map((s) => ({ label: s.title, href: `/services/${s.slug}` }))
    : FALLBACK_SERVICES

  return (
    <footer className="bg-[#020714] text-white border-t border-blue-900/30 relative overflow-hidden" role="contentinfo">
      {/* Subtle ambient tech glow background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── Parent Group Ecosystem Callout Strip ── */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <Container>
          <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-brand-primary/20 text-brand-primary-light border border-brand-primary/30">
                Corporate Group
              </span>
              <span>
                Snaptech is the dedicated technology and digital transformation company of{' '}
                <strong className="text-white">Hindustan Projects Group</strong>.
              </span>
            </div>
            <a
              href="https://www.hindustanprojects.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-brand-cyan hover:text-white font-medium transition-colors"
            >
              <span>Visit Parent Group (hindustanprojects.in)</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 py-14 lg:py-16">
          {/* Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              to="/"
              className="inline-block hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              onClick={(e) => {
                if (location.pathname === '/') {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
            >
              <div className="bg-white rounded-xl px-3.5 py-2 inline-block shadow-md ring-1 ring-white/20">
                <img
                  src={snaptechLogo}
                  alt="Snaptech - IT & Technology Solutions"
                  className="h-8 lg:h-9 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-xs text-brand-cyan font-mono tracking-wider">
              www.snaptech.hindustanprojects.in
            </p>
            <p className="text-sm text-slate-300 leading-relaxed pr-4">
              Delivering high-performance custom web applications, enterprise software, mobile platforms, 
              cloud architecture, and digital growth systems for modern businesses in Bhilwara, India, and across the globe.
            </p>

            {/* Social channels (Instagram, Facebook, Pinterest, LinkedIn) */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Connect With Us
              </span>
              <div className="flex gap-2.5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target={s.href !== '#' ? '_blank' : undefined}
                    rel={s.href !== '#' ? 'noopener noreferrer' : undefined}
                    title={s.label}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300
                      hover:border-brand-primary hover:bg-brand-primary hover:text-white
                      hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-primary/20 transition-all duration-200"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
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
                    className="text-sm text-slate-300 hover:text-brand-cyan hover:translate-x-1
                      inline-block transition-all duration-200"
                  >
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
                    className="text-sm text-slate-300 hover:text-brand-cyan hover:translate-x-1
                      inline-block transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Hub & Contact (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-white mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Tech Development Center
            </h3>
            <address className="not-italic space-y-3 text-sm text-slate-300">
              <p className="flex gap-2.5">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0 text-brand-primary-light"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{address}</span>
              </p>
              <p className="flex gap-2.5 items-center">
                <svg
                  className="w-4 h-4 shrink-0 text-brand-primary-light"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L8.5 10.5s1 2 5 5l.613-1.724a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V6a2 2 0 012-2h-.001z"
                  />
                </svg>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="hover:text-brand-cyan transition-colors font-medium"
                >
                  {phone}
                </a>
              </p>
              <p className="flex gap-2.5 items-center">
                <svg
                  className="w-4 h-4 shrink-0 text-brand-primary-light"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a href={`mailto:${email}`} className="hover:text-brand-cyan transition-colors">
                  {email}
                </a>
              </p>

              <div className="pt-2">
                <a
                  href="https://wa.me/917597000601?text=Hi%20Snaptech%20Team%2C%20I%20am%20looking%20for%20IT%20Solutions."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Instant WhatsApp Connect
                </a>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p>© {year} <strong className="text-white">Snaptech</strong> — A Hindustan Projects Enterprise. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-slate-400">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
          </div>
          <p className="text-slate-400 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-primary" />
            Bhilwara, Rajasthan, India
          </p>
        </div>
      </Container>
    </footer>
  )
}

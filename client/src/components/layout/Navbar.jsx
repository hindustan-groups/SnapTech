/**
 * Navbar — Snaptech Enterprise IT
 * Features:
 * - Sticky glass morphism on scroll
 * - Mega dropdown for IT Services with icons + descriptions
 * - Animated active link indicator
 * - Animated mobile slide-in drawer
 * - WhatsApp quick chat button
 */
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Container, Button } from '@/components/ui'
import {
  Code2, Megaphone, Lightbulb, Monitor, Cloud, Layers, Smartphone, ChevronDown,
  Globe, Zap, Shield, BarChart3, X, Menu, ArrowRight
} from 'lucide-react'
import snaptechLogo from '@/assets/snaptech-logo.png'

/* ── Service mega-menu data ── */
const SERVICE_ITEMS = [
  {
    icon: Code2,
    label: 'Web Development',
    desc: 'React, Node.js, Next.js — fast & scalable.',
    href: '/services/web-development',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Smartphone,
    label: 'Mobile Apps',
    desc: 'iOS & Android native or cross-platform.',
    href: '/services/mobile-app-development',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: Cloud,
    label: 'Cloud & DevOps',
    desc: 'AWS, Azure, CI/CD & 99.9% uptime SLA.',
    href: '/services/cloud-solutions-devops',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
  },
  {
    icon: Zap,
    label: 'AI & Automation',
    desc: 'Workflow AI, bots & process automation.',
    href: '/services/ai-automation',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: Megaphone,
    label: 'Digital Marketing',
    desc: 'SEO, PPC, Meta Ads & growth marketing.',
    href: '/services/digital-marketing-seo',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
  {
    icon: Layers,
    label: 'Branding & UI/UX',
    desc: 'Premium design systems & brand identity.',
    href: '/services/branding-ui-ux-design',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
  },
  {
    icon: Monitor,
    label: 'E-Commerce',
    desc: 'Full store setup, payments & CMS.',
    href: '/services/ecommerce-solutions',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: Lightbulb,
    label: 'IT Consulting',
    desc: 'Strategic advisory & tech roadmaps.',
    href: '/services/it-consulting-strategy',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
]

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'IT Services', href: '/services', hasMega: true },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const location = useLocation()
  const headerRef = useRef(null)
  const megaTimer = useRef(null)

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 15)
      setMenuOpen(false)
      setMegaOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [menuOpen])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isHomepage = location.pathname === '/'
  const isTransparent = isHomepage && !isScrolled && !menuOpen

  const handleMegaEnter = () => {
    clearTimeout(megaTimer.current)
    setMegaOpen(true)
  }
  const handleMegaLeave = () => {
    megaTimer.current = setTimeout(() => setMegaOpen(false), 150)
  }

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/96 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_rgba(0,29,74,0.06)]'
      }`}
    >
      {/* ── Top Utility Bar ── */}
      <div
        className={`hidden md:block border-b transition-colors text-xs py-1.5 ${
          isTransparent
            ? 'bg-black/20 text-white/90 border-white/10 backdrop-blur-xs'
            : 'bg-slate-50 text-slate-600 border-slate-200/60'
        }`}
      >
        <Container>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="font-medium">Technology & Digital Division of</span>
              <a
                href="https://www.hindustanprojects.in"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-bold inline-flex items-center gap-1 hover:underline transition-colors ${
                  isTransparent ? 'text-white hover:text-brand-cyan' : 'text-brand-navy hover:text-brand-primary'
                }`}
              >
                <span>Hindustan Projects Group</span>
                <svg className="w-3 h-3 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/hindustanprojects"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-primary transition-colors font-medium flex items-center gap-1"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com/hindustanprojects"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-primary transition-colors font-medium"
              >
                Facebook
              </a>
              <a
                href="https://pinterest.com/hindustanprojects"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-primary transition-colors font-medium"
              >
                Pinterest
              </a>
              <span className="opacity-30">|</span>
              <a
                href="tel:+917597000601"
                className={`font-bold transition-colors ${
                  isTransparent ? 'text-brand-cyan' : 'text-brand-primary'
                }`}
              >
                +91 75970 00601
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Main Navigation Bar ── */}
      <Container>
        <nav className="flex items-center justify-between h-16 lg:h-[68px]" aria-label="Main navigation">

          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center shrink-0 focus-visible:outline-none group/logo py-1"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            aria-label="Snaptech — A Hindustan Projects Enterprise"
          >
            <div
              className={`flex items-center transition-all duration-300 rounded-xl px-2 py-1 ${
                isTransparent
                  ? 'bg-white/95 backdrop-blur-md shadow-sm ring-1 ring-black/5'
                  : 'bg-transparent'
              }`}
            >
              <img
                src={snaptechLogo}
                alt="Snaptech - IT & Technology Solutions"
                className="h-8 sm:h-9 lg:h-10 w-auto object-contain transition-transform duration-200 group-hover/logo:scale-[1.02]"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-0.5" role="list">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href)
              if (link.hasMega) {
                return (
                  <li
                    key={link.href}
                    className="relative"
                    onMouseEnter={handleMegaEnter}
                    onMouseLeave={handleMegaLeave}
                  >
                    <Link
                      to={link.href}
                      className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 inline-flex items-center gap-1 group/navlink
                        ${
                          isTransparent
                            ? active
                              ? 'text-white bg-white/20 font-semibold'
                              : 'text-white/85 hover:text-white hover:bg-white/10'
                            : active
                              ? 'text-brand-primary bg-brand-primary/10 font-semibold'
                              : 'text-slate-700 hover:text-brand-primary hover:bg-brand-primary/5'
                        }`}
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`}
                      />
                      <span
                        className={`absolute bottom-1 left-3 right-3 h-[2px] rounded-full origin-left transition-transform duration-200
                          ${isTransparent ? 'bg-brand-cyan' : 'bg-brand-primary'}
                          ${active ? 'scale-x-100' : 'scale-x-0 group-hover/navlink:scale-x-100'}`}
                      />
                    </Link>

                    {/* ── Mega Menu ── */}
                    {megaOpen && (
                      <div
                        className="mega-menu absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[580px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,29,74,0.14)] border border-slate-100/80 overflow-hidden"
                        onMouseEnter={handleMegaEnter}
                        onMouseLeave={handleMegaLeave}
                      >
                        {/* Header */}
                        <div className="px-5 py-3 bg-gradient-to-r from-brand-navy to-brand-navy-light flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-brand-cyan">
                              Snaptech IT Services
                            </p>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              Enterprise-grade technology solutions
                            </p>
                          </div>
                          <Link
                            to="/services"
                            className="text-[11px] font-semibold text-white bg-brand-primary/30 hover:bg-brand-primary px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          >
                            All Services <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                        {/* Grid */}
                        <div className="p-3 grid grid-cols-2 gap-1">
                          {SERVICE_ITEMS.map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setMegaOpen(false)}
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/mega"
                            >
                              <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0 group-hover/mega:scale-110 transition-transform`}>
                                <item.icon className={`w-4.5 h-4.5 ${item.color}`} strokeWidth={1.75} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 group-hover/mega:text-brand-primary transition-colors">{item.label}</p>
                                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{item.desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        {/* Footer */}
                        <div className="px-4 py-2.5 border-t border-slate-100 bg-brand-ice/50 flex items-center gap-3">
                          <Shield className="w-4 h-4 text-brand-primary shrink-0" />
                          <p className="text-[11px] text-slate-600">
                            <strong className="text-brand-navy">ISO 9001 Grade Engineering</strong> — 99.9% Uptime SLA · Trusted by 40+ businesses
                          </p>
                        </div>
                      </div>
                    )}
                  </li>
                )
              }

              return (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 group/navlink inline-block
                      ${
                        isTransparent
                          ? active
                            ? 'text-white bg-white/20 font-semibold'
                            : 'text-white/85 hover:text-white hover:bg-white/10'
                          : active
                            ? 'text-brand-primary bg-brand-primary/10 font-semibold'
                            : 'text-slate-700 hover:text-brand-primary hover:bg-brand-primary/5'
                      }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-1 left-3 right-3 h-[2px] rounded-full origin-left transition-transform duration-200
                        ${isTransparent ? 'bg-brand-cyan' : 'bg-brand-primary'}
                        ${active ? 'scale-x-100' : 'scale-x-0 group-hover/navlink:scale-x-100'}`}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {/* WhatsApp */}
            <a
              href="https://wa.me/917597000601?text=Hello%20Snaptech%2C%20I%20would%20like%20to%20consult%20for%20an%20IT%20project."
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg transition-colors border ${
                isTransparent
                  ? 'border-white/20 text-white hover:bg-white/10'
                  : 'border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50'
              }`}
              title="Quick WhatsApp Chat"
              aria-label="WhatsApp Chat"
            >
              <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>

            <Button
              variant="primary"
              size="sm"
              as={Link}
              to="/contact"
              className="bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold shadow-md shadow-brand-primary/25 btn-neon"
            >
              Get IT Quote
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={`lg:hidden p-2 rounded-lg transition-colors focus-visible:outline-none ${
              isTransparent
                ? 'text-white hover:bg-white/10'
                : 'text-brand-navy hover:bg-slate-100'
            }`}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </Container>

      {/* ── Mobile Drawer ── */}
      {menuOpen && (
        <div className="lg:hidden mobile-drawer-enter border-t border-slate-200 bg-white/98 backdrop-blur-2xl shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Parent group callout */}
          <div className="px-4 pt-4 pb-3">
            <div className="p-3 bg-brand-ice rounded-xl border border-brand-primary/20">
              <span className="text-[11px] uppercase tracking-wider font-bold text-brand-primary block mb-1">
                Hindustan Projects Group
              </span>
              <p className="text-xs text-slate-600 mb-2">
                Snaptech is the dedicated technology subsidiary of Hindustan Projects.
              </p>
              <a
                href="https://www.hindustanprojects.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-navy font-bold inline-flex items-center gap-1 hover:underline"
              >
                <span>Visit Parent Group Website</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <ul className="px-4 space-y-0.5 pb-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-brand-primary text-white font-semibold'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.hasMega && <ChevronDown className="w-4 h-4 opacity-50" />}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Service Quick Links */}
          <div className="px-4 py-3 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">
              Popular Services
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {SERVICE_ITEMS.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-brand-ice transition-colors"
                >
                  <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-medium text-slate-700 leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile CTAs */}
          <div className="px-4 pt-2 pb-5 border-t border-slate-100 space-y-2">
            <Button
              variant="primary"
              size="md"
              as={Link}
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="w-full justify-center bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold"
            >
              Get Free IT Quote
            </Button>
            <a
              href="https://wa.me/917597000601?text=Hi%20Snaptech%20Team%2C%20I%20am%20looking%20for%20IT%20Solutions."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 text-sm font-semibold transition-colors hover:bg-emerald-100"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              WhatsApp Chat
            </a>
            <div className="flex justify-center gap-4 pt-1 text-xs text-slate-500">
              <a href="https://instagram.com/hindustanprojects" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary">Instagram</a>
              <span>•</span>
              <a href="https://facebook.com/hindustanprojects" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary">Facebook</a>
              <span>•</span>
              <a href="https://pinterest.com/hindustanprojects" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary">Pinterest</a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

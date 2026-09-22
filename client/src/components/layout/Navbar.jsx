/**
 * Navbar — Snaptech Enterprise IT
 * Features:
 * - Sticky cyber-navy glassmorphism on scroll
 * - Dynamic Mega dropdown for IT Services from database (useServices)
 * - Animated active link indicator with cyan neon glow
 * - Dynamic site settings (parent group, social links, phone, WhatsApp)
 * - Cyber-navy mobile slide-in drawer
 */
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Container, Button } from '@/components/ui'
import {
  Code2, Megaphone, Monitor, Cloud, Layers, Smartphone, ChevronDown,
  Zap, Shield, X, Menu, ArrowRight
} from 'lucide-react'
import { useServices } from '@/hooks/useServices'
import { useSiteSettings } from '@/hooks/useContent'
import { getServiceIcon } from '@/utils/serviceIcons'

/* ── Fallback Service mega-menu data ── */
const FALLBACK_SERVICES = [
  {
    icon: Code2,
    label: 'Web Development',
    desc: 'React, Node.js, Next.js — fast & scalable.',
    href: '/services/web-development',
    color: 'text-brand-blue',
    bg: 'bg-blue-50 border border-blue-100',
  },
  {
    icon: Smartphone,
    label: 'Mobile Apps',
    desc: 'iOS & Android native or cross-platform.',
    href: '/services/mobile-app-development',
    color: 'text-brand-red',
    bg: 'bg-red-50 border border-red-100',
  },
  {
    icon: Cloud,
    label: 'Cloud & DevOps',
    desc: 'AWS, Azure, CI/CD & 99.9% uptime SLA.',
    href: '/services/cloud-solutions-devops',
    color: 'text-brand-blue',
    bg: 'bg-blue-50 border border-blue-100',
  },
  {
    icon: Zap,
    label: 'AI & Automation',
    desc: 'Workflow AI, bots & process automation.',
    href: '/services/ai-automation',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border border-amber-100',
  },
  {
    icon: Megaphone,
    label: 'Digital Marketing',
    desc: 'SEO, PPC, Meta Ads & growth marketing.',
    href: '/services/digital-marketing-seo',
    color: 'text-brand-red',
    bg: 'bg-red-50 border border-red-100',
  },
  {
    icon: Layers,
    label: 'Branding & UI/UX',
    desc: 'Premium design systems & brand identity.',
    href: '/services/branding-ui-ux-design',
    color: 'text-brand-blue',
    bg: 'bg-blue-50 border border-blue-100',
  },
  {
    icon: Monitor,
    label: 'E-Commerce',
    desc: 'Full store setup, payments & CMS.',
    href: '/services/ecommerce-solutions',
    color: 'text-brand-red',
    bg: 'bg-red-50 border border-red-100',
  },
  {
    icon: Shield,
    label: 'Cybersecurity & Audits',
    desc: 'VAPT, SSL & enterprise hardening.',
    href: '/services/cybersecurity-audit',
    color: 'text-brand-blue',
    bg: 'bg-blue-50 border border-blue-100',
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

  const { data: servicesData } = useServices()
  const { data: settingsData } = useSiteSettings()

  const cfg = settingsData?.data || {}
  const parentUrl = cfg.parent_company_url || 'https://www.hindustanprojects.in'
  const phone = cfg.phone || '+91 75970 00601'
  const cleanPhone = phone.replace(/\s+/g, '')

  const rawWhatsapp = cfg.whatsapp || '+91 99291 20431'
  const cleanWhatsapp = rawWhatsapp.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    cfg.whatsappMessage || 'Hello Snaptech, I would like to consult for an enterprise IT project.'
  )}`

  const instagram = cfg.instagram || 'https://instagram.com/hindustanprojects'
  const facebook = cfg.facebook || 'https://facebook.com/hindustanprojects'
  const linkedin = cfg.linkedin || 'https://linkedin.com/company/hindustan-projects'
  const pinterest = cfg.pinterest || 'https://pinterest.com/hindustanprojects'

  // Construct dynamic services or fallback
  const servicesList = servicesData?.data?.length
    ? servicesData.data.slice(0, 8).map((s, idx) => ({
        icon: getServiceIcon(s.icon),
        label: s.title,
        desc: s.shortDescription || s.tag || 'Scalable enterprise tech solution',
        href: `/services/${s.slug}`,
        color: ['text-cyan-400', 'text-violet-400', 'text-sky-400', 'text-amber-400', 'text-rose-400', 'text-emerald-400', 'text-indigo-400', 'text-orange-400'][idx % 8],
        bg: ['bg-cyan-500/10 border-cyan-500/20', 'bg-violet-500/10 border-violet-500/20', 'bg-sky-500/10 border-sky-500/20', 'bg-amber-500/10 border-amber-500/20', 'bg-rose-500/10 border-rose-500/20', 'bg-emerald-500/10 border-emerald-500/20', 'bg-indigo-500/10 border-indigo-500/20', 'bg-orange-500/10 border-orange-500/20'][idx % 8],
      }))
    : FALLBACK_SERVICES

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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 text-slate-800 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-lg shadow-slate-200/60'
          : 'bg-white/70 backdrop-blur-sm border-b border-slate-200/40 shadow-xs'
      }`}
    >
      {/* ── Top Utility Bar ── */}
      <div className="hidden md:block border-b border-slate-200 bg-slate-50 text-slate-600 text-xs py-1.5">
        <Container>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="inline-block w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              <span className="font-medium text-[11px] sm:text-xs">Technology &amp; Digital Division of</span>
              <a
                href={parentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-brand-blue hover:text-brand-red inline-flex items-center gap-1 transition-colors group/parent"
              >
                <span>Hindustan Projects Group</span>
                <svg className="w-3 h-3 opacity-75 group-hover/parent:translate-x-0.5 group-hover/parent:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-blue transition-colors font-medium"
              >
                Instagram
              </a>
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-blue transition-colors font-medium"
              >
                Facebook
              </a>
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-blue transition-colors font-medium"
              >
                LinkedIn
              </a>
              <a
                href={pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-blue transition-colors font-medium"
              >
                Pinterest
              </a>
              <span className="opacity-30">|</span>
              <a
                href={`tel:${cleanPhone}`}
                className="font-bold text-brand-red hover:text-brand-red-dark transition-colors"
              >
                {phone}
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Main Navigation Bar ── */}
      <Container>
        <nav className="flex items-center justify-between h-16 lg:h-[70px]" aria-label="Main navigation">

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
            aria-label="Snaptech — IT & Technology Solutions"
          >
            <img
              src="/snaptech-logo.png"
              alt="Snaptech"
              className="h-10 w-auto object-contain transition-transform duration-200 group-hover/logo:scale-[1.03]"
            />
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-1" role="list">
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
                      className={`relative px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 inline-flex items-center gap-1 group/navlink ${
                        active
                          ? 'text-brand-blue bg-blue-50/80 border border-blue-100 shadow-xs'
                          : 'text-slate-700 hover:text-brand-blue hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${megaOpen ? 'rotate-180 text-brand-red' : 'text-slate-400 group-hover/navlink:text-brand-blue'}`}
                      />
                      <span
                        className={`absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full origin-left transition-transform duration-200 bg-brand-red ${
                          active ? 'scale-x-100' : 'scale-x-0 group-hover/navlink:scale-x-100'
                        }`}
                      />
                    </Link>

                    {/* ── Mega Menu ── */}
                    {megaOpen && (
                      <div
                        className="mega-menu absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[620px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden text-slate-800"
                        onMouseEnter={handleMegaEnter}
                        onMouseLeave={handleMegaLeave}
                      >
                        {/* Header */}
                        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-brand-red flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                              Enterprise IT Services
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Custom web, mobile apps, enterprise cloud &amp; automation solutions
                            </p>
                          </div>
                          <Link
                            to="/services"
                            onClick={() => setMegaOpen(false)}
                            className="text-xs font-semibold text-brand-blue bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5"
                          >
                            All Services <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        {/* Grid */}
                        <div className="p-3.5 grid grid-cols-2 gap-1.5">
                          {servicesList.map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setMegaOpen(false)}
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group/mega"
                            >
                              <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0 group-hover/mega:scale-105 transition-transform`}>
                                <item.icon className={`w-4.5 h-4.5 ${item.color}`} strokeWidth={1.75} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 group-hover/mega:text-brand-blue transition-colors truncate">
                                  {item.label}
                                </p>
                                <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-1">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Shield className="w-4 h-4 text-brand-blue shrink-0" />
                            <span className="text-[11px]">
                              <strong className="text-slate-900">ISO 9001:2015</strong> Quality Certified · 99.9% SLA
                            </span>
                          </div>
                          <Link
                            to="/contact"
                            onClick={() => setMegaOpen(false)}
                            className="text-[11px] text-brand-red hover:underline font-bold"
                          >
                            Request Free Consultation →
                          </Link>
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
                    className={`relative px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 inline-block ${
                      active
                        ? 'text-brand-blue bg-blue-50/80 border border-blue-100 shadow-xs'
                        : 'text-slate-700 hover:text-brand-blue hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full origin-left transition-transform duration-200 bg-brand-red ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover/navlink:scale-x-100'
                      }`}
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
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl transition-all border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-xs"
              title="Quick WhatsApp Priority Desk"
              aria-label="WhatsApp Priority Desk"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>

            <Button
              variant="primary"
              size="sm"
              as={Link}
              to="/contact"
              className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/20 text-xs uppercase tracking-wider transition-all"
            >
              Get a Quote
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-6 h-6 text-brand-red" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </Container>

      {/* ── Mobile Drawer ── */}
      {menuOpen && (
        <div className="lg:hidden mobile-drawer-enter border-t border-slate-200 bg-white shadow-2xl max-h-[85vh] overflow-y-auto text-slate-800">
          {/* Parent group callout */}
          <div className="px-4 pt-4 pb-3">
            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
              <span className="text-[11px] uppercase tracking-wider font-bold text-brand-blue block mb-1">
                snaptech.digital
              </span>
              <p className="text-xs text-slate-600 mb-2.5 leading-relaxed">
                IT & Digital Solutions — Hindustan Projects Group
              </p>
              <a
                href={parentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-blue font-bold inline-flex items-center gap-1 hover:text-brand-navy transition-colors"
              >
                <span>Visit Parent Group Website</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <ul className="px-4 space-y-1 pb-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-brand-blue font-bold border border-blue-100'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-brand-blue'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.hasMega && <ChevronDown className="w-4 h-4 opacity-50" />}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Service Quick Links */}
          <div className="px-4 py-3 border-t border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">
              Popular Services
            </p>
            <div className="grid grid-cols-2 gap-2">
              {servicesList.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-blue hover:bg-blue-50/50 transition-all"
                >
                  <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-medium text-slate-800 leading-tight truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile CTAs */}
          <div className="px-4 pt-3 pb-6 border-t border-slate-200 space-y-2.5">
            <Button
              variant="primary"
              size="md"
              as={Link}
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="w-full justify-center bg-brand-blue hover:bg-brand-blue-dark text-white font-bold shadow-md shadow-blue-500/20"
            >
              Get a Free Quote
            </Button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-emerald-500/40 text-emerald-700 bg-emerald-50 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-emerald-100"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              WhatsApp Priority Desk
            </a>
            <div className="flex justify-center gap-4 pt-2 text-xs text-slate-500">
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">Instagram</a>
              <span>•</span>
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">Facebook</a>
              <span>•</span>
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">LinkedIn</a>
              <span>•</span>
              <a href={pinterest} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">Pinterest</a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}


/**
 * HeroSection — Official Snaptech Enterprise IT Hero.
 * 100% Dynamic configuration powered by PostgreSQL site_settings via useSiteSettings hook.
 * High-impact balanced two-column layout with prominent 3D technology illustration,
 * ambient soft blue gradients, domain search bar, and verified enterprise CTAs.
 */
import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { Button, Container } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'
import { useServices } from '@/hooks/useServices'
import { useTypewriter } from '@/hooks/useTypewriter'
import heroDesktopBg from '@/assets/hero-desktop-bg.jpg'
import heroTechVisual from '@/assets/hero-tech-visual-final.webp'
import {
  ReactIcon,
  NextjsIcon,
  NodeIcon,
  FlutterIcon,
  AwsIcon,
} from '@/components/ui/TechIcons'

const DEFAULT_TECH_SEARCH_QUERIES = [
  'Custom Web Applications',
  'Mobile App Development',
  'Enterprise ERP & CRM',
  'Cloud Migration & AWS',
  'AI & Workflow Automation',
  'High-Speed SEO Optimization',
]

const BUILT_IN_SERVICES = [
  'Web Development',
  'Mobile App Development',
  'Custom Industrial ERP',
  'Enterprise Cloud & AWS',
  'AI & Workflow Automation',
  'E-Commerce Solutions',
  'Cybersecurity & Audits',
]

function SearchInput({ id, value, onChange, servicesList, className }) {
  const placeholder = useTypewriter(servicesList, { isPaused: Boolean(value) })

  return (
    <input
      id={id}
      name="q"
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label="Search IT services or technologies"
      autoComplete="off"
      className={className}
    />
  )
}

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { data: settingsData } = useSiteSettings()
  const { data: servicesData } = useServices()
  const cfg = settingsData?.data || {}

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/services')
    }
  }

  // Dynamic values with elegant enterprise defaults
  const companyName = cfg.company_name || 'SnapTech'
  const parentName = cfg.parent_company_name || 'Hindustan Projects Group'
  const eyebrowText = cfg.hero_eyebrow || 'Technology & Digital Innovation Division'
  const divisionText = cfg.hero_division || parentName
  const titlePrefix = cfg.hero_title_prefix || 'Engineering Resilient'
  const tagline =
    cfg.hero_subtitle ||
    cfg.tagline ||
    'Architecting High-Performance Digital Solutions & Enterprise Cloud Systems'
  const whatsappNumber = (cfg.whatsapp || cfg.phone || '').replace(/[^0-9]/g, '')
  const whatsappMsg = encodeURIComponent(
    cfg.whatsappMessage || `Hello ${companyName}, I am interested in your digital services.`
  )
  const heroImage = cfg.hero_image_url || heroTechVisual

  // Auto-rotating dynamic services for search bar with robust built-in fallback
  const servicesListForSearch = useMemo(() => {
    if (cfg.hero_search_terms) {
      const configured = cfg.hero_search_terms
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (configured.length > 0) return configured
    }
    if (servicesData?.data?.length) {
      const titles = servicesData.data
        .map((s) => (typeof s.title === 'string' ? s.title.trim() : ''))
        .filter(Boolean)
      if (titles.length > 0) return titles
    }
    return BUILT_IN_SERVICES
  }, [cfg.hero_search_terms, servicesData])

  const popularQueries = cfg.hero_popular_queries
    ? cfg.hero_popular_queries.split(',').map((s) => s.trim())
    : DEFAULT_TECH_SEARCH_QUERIES

  const defaultCapabilities = [
    'iOS & Android Cross-Platform Mobile Applications',
    'Custom Industrial ERP, Weaving & Inventory Automation',
    `${parentName} Backing with 100% Code & IP Handover`,
  ]

  const capabilities = cfg.hero_capabilities
    ? cfg.hero_capabilities.split('\n').map((s) => s.trim()).filter(Boolean)
    : defaultCapabilities

  return (
    <section
      id="home"
      className="relative overflow-hidden isolate text-slate-900 bg-white"
      aria-label="SnapTech Digital — Web & App Development Agency Hero"
    >
      {/* ── Desktop Full-Bleed 16:9 3D Scene Background ── */}
      <div
        className="hidden lg:block absolute inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${heroDesktopBg})`,
          backgroundPosition: 'right center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Soft left white vignette for flawless text contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.85) 32%, rgba(255,255,255,0.45) 48%, rgba(255,255,255,0) 65%)',
          }}
        />
      </div>

      {/* ── Mobile/Tablet Light Gradient Background ── */}
      <div
        className="lg:hidden absolute inset-0 -z-10 bg-gradient-to-b from-white via-blue-50/60 to-blue-100/40 pointer-events-none"
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════════════════════════════
          MOBILE & TABLET VIEW: EXACT REPLICA OF USER REFERENCE (< lg)
          ══════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden relative z-10 pt-20 sm:pt-22 md:pt-28 pb-6 px-4 sm:px-6 space-y-4 max-w-md sm:max-w-lg mx-auto">

        {/* ── 1. Eyebrow Badge & Division on separate line ── */}
        <div className="space-y-1.5 hero-fade-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-[#EEF5FF] text-[#1877F2] text-[11px] font-bold tracking-wider uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2]" />
            <span>{eyebrowText}</span>
          </div>
          <div className="text-[11.5px] text-slate-500 font-semibold pl-0.5">
            | {divisionText}
          </div>
        </div>

        {/* ── 2. Exact 3-Line Headline ── */}
        <div className="space-y-2 hero-fade-up">
          <h1 className="font-heading font-black text-[32px] sm:text-[38px] tracking-tight leading-[1.12] text-[#0D1B4B]">
            {titlePrefix}
            <br />
            <span className="text-[#1877F2]">Cross-Platform </span>
            <span>Mobile</span>
            <br />
            <span>Apps</span>
          </h1>
          <p className="text-[13.5px] sm:text-[14px] text-slate-800 font-semibold leading-relaxed max-w-sm">
            {tagline}
          </p>
        </div>

        {/* ── 3. Search Bar with Blue SEARCH Button & Popular Chips ── */}
        <div className="space-y-2 hero-fade-up">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white rounded-full border border-blue-200/90 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 p-1 shadow-sm transition-all"
          >
            <div className="pl-3 pr-2 text-[#1877F2] shrink-0">
              <Search className="w-4 h-4 text-[#1877F2]" strokeWidth={2.5} />
            </div>
            <SearchInput
              id="hero-tech-search-mobile"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              servicesList={servicesListForSearch}
              className="w-full bg-transparent text-slate-900 font-semibold placeholder:text-slate-800 placeholder:font-bold text-xs sm:text-sm focus:outline-none min-w-0"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 shadow-sm shadow-blue-500/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>SEARCH</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Popular tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] text-slate-700 font-bold shrink-0">Popular:</span>
            {popularQueries.slice(0, 3).map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => setSearchQuery(query)}
                className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-[#EEF5FF] hover:bg-blue-100 text-[#1877F2] border border-blue-200/70 font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
              >
                {query}
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. Capabilities Checklist with Blue Check Circles ── */}
        <ul className="space-y-2 hero-fade-up">
          {capabilities.map((cap) => (
            <li key={cap} className="flex items-center gap-2.5 text-[12.5px] sm:text-[13px] text-slate-900 font-semibold">
              <span className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 6.2L4.7 8.5L9.5 3.5" />
                </svg>
              </span>
              <span>{cap}</span>
            </li>
          ))}
        </ul>

        {/* ── 5. Three Stacked Full-Width Action Buttons (Matching Screenshot) ── */}
        <div className="space-y-2.5 pt-1 hero-fade-up">
          {/* Button 1: Solid Blue */}
          <Button
            variant="primary"
            size="sm"
            as={Link}
            to="/contact"
            className="w-full bg-[#1877F2] hover:bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 py-3 text-[11px] sm:text-xs uppercase tracking-wider rounded-xl transition-all text-center justify-center active:scale-[0.99]"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            SCHEDULE TECHNICAL CONSULTATION
          </Button>

          {/* Button 2: White with Blue Border */}
          <Button
            variant="outline"
            size="sm"
            as={Link}
            to="/portfolio"
            className="w-full bg-white hover:bg-blue-50 text-[#1877F2] border border-[#1877F2] font-bold py-3 text-[11px] sm:text-xs uppercase tracking-wider rounded-xl transition-all text-center justify-center shadow-xs active:scale-[0.99]"
          >
            EXPLORE DEPLOYED CASE STUDIES
          </Button>

          {/* Button 3: White with Green Border & WhatsApp Icon */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-emerald-50 border border-[#25D366] text-[#25D366] text-xs sm:text-[13px] font-semibold transition-colors shadow-xs active:scale-[0.99]"
            aria-label="Direct WhatsApp Priority Hotline"
          >
            <svg className="w-4.5 h-4.5 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>

        {/* ── 6. Full-Width 3D Tech Visual Below Buttons (Exact Reference Placement) ── */}
        <div className="pt-2 pb-1 flex items-center justify-center hero-fade-up">
          <img
            src={heroImage}
            alt="SnapTech Digital — Enterprise Solutions"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full max-w-sm sm:max-w-md h-auto object-contain select-none"
            style={{ filter: 'drop-shadow(0 14px 28px rgba(59,130,246,0.12))' }}
          />
        </div>

        {/* ── 7. Bottom Tech Partner Strip (Directly Below 3D Visual) ── */}
        <div className="pt-1 pb-4 space-y-2.5 hero-fade-up">
          <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-700 w-full px-0.5">
            <span className="flex items-center gap-1 hover:text-brand-blue transition-colors">
              <ReactIcon className="w-3.5 h-3.5" />
              <span>React</span>
            </span>
            <span className="flex items-center gap-1 hover:text-slate-900 transition-colors">
              <NextjsIcon className="w-3.5 h-3.5" />
              <span>NEXT.js</span>
            </span>
            <span className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
              <NodeIcon className="w-3.5 h-3.5" />
              <span>node.js</span>
            </span>
            <span className="flex items-center gap-1 hover:text-sky-600 transition-colors">
              <FlutterIcon className="w-3.5 h-3.5" />
              <span>Flutter</span>
            </span>
            <span className="flex items-center gap-1 hover:text-amber-600 transition-colors">
              <AwsIcon className="w-3.5 h-3.5" />
              <span>aws</span>
            </span>
            <span className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" aria-hidden="true">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#4285F4" />
              </svg>
              <span>Google Cloud</span>
            </span>
          </div>

          {/* Centered Trusted Technology Partner with Divider Lines */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="w-16 sm:w-20 h-px bg-slate-200" />
            <span className="px-2.5 text-[11px] font-medium text-slate-400 whitespace-nowrap">
              Trusted Technology Partner
            </span>
            <div className="w-16 sm:w-20 h-px bg-slate-200" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          DESKTOP VIEW: APPROVED FULL-BLEED 16:9 VIEWPORT (hidden on mobile, lg:flex)
          100% PRESERVED EXACTLY AS APPROVED
          ══════════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex relative z-10 flex-col justify-between"
        style={{
          paddingTop: 'var(--header-height, 100px)',
          minHeight: '100vh',
        }}
      >
        {/* Middle Content Row */}
        <div className="flex-1 flex items-center py-1 sm:py-1.5 lg:py-1">
          <Container width="wide" className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8">

              {/* ── Left Column: Value Proposition, Search & CTAs (Span 7 on lg/xl) ── */}
              <div className="lg:col-span-7 space-y-2 lg:space-y-2.5 xl:space-y-3">

                {/* Eyebrow Badge */}
                <div className="flex flex-wrap items-center gap-2 hero-fade-up">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-blue-200/90 bg-white/95 backdrop-blur-sm text-[#1877F2] text-[11.5px] font-bold tracking-wider uppercase shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] animate-pulse" />
                    <span>{eyebrowText}</span>
                  </div>
                  <span className="text-xs text-slate-700 font-bold hidden sm:inline">
                    | {divisionText}
                  </span>
                </div>

                {/* Headline: Enlarge & Widen up to 3D visual boundary */}
                <div className="space-y-2 hero-fade-up">
                  <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-[44px] xl:text-[52px] 2xl:text-[58px] tracking-tight leading-[1.05] text-[#0D1B4B]">
                    {titlePrefix}
                    <br />
                    <span className="text-[#1877F2]">Cross-Platform </span>
                    <span>Mobile</span>
                    <br />
                    <span>Apps</span>
                  </h1>
                  <p className="text-[14px] lg:text-[15px] xl:text-[16px] text-slate-800 font-semibold max-w-xl leading-relaxed">
                    {tagline}
                  </p>
                </div>

                {/* Interactive Tech Search Bar: Expanded to max-w-xl / max-w-2xl */}
                <div className="hero-fade-up max-w-lg xl:max-w-xl">
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center bg-white rounded-full border border-slate-200/90 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 p-1 sm:p-1.5 shadow-md shadow-blue-500/5 transition-all"
                  >
                    <div className="pl-3.5 pr-2 text-[#1877F2] shrink-0">
                      <Search className="w-4.5 h-4.5 text-[#1877F2]" strokeWidth={2.5} />
                    </div>
                    <SearchInput
                      id="hero-tech-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      servicesList={servicesListForSearch}
                      className="w-full bg-transparent text-slate-900 font-semibold placeholder:text-slate-800 placeholder:font-bold text-xs sm:text-sm focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4.5 sm:px-5.5 py-2 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white text-[10.5px] sm:text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-sm shadow-blue-500/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>SEARCH</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Popular quick tags: now comfortably fitting across the expanded width */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10.5px] text-slate-700 font-bold uppercase tracking-wider">Popular:</span>
                    {popularQueries.slice(0, 3).map((query) => (
                      <button
                        key={query}
                        type="button"
                        onClick={() => setSearchQuery(query)}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50/80 hover:bg-blue-100 text-[#1877F2] border border-blue-200/70 font-semibold transition-colors cursor-pointer"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Capabilities Checklist */}
                <ul className="space-y-1.5 hero-fade-up">
                  {capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-2.5 text-[13px] lg:text-[13.5px] text-slate-900 font-semibold">
                      <span className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0 shadow-xs">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2.5 6.2L4.7 8.5L9.5 3.5" />
                        </svg>
                      </span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Buttons: Consultation + Case Studies + WhatsApp */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1 hero-fade-up">
                  <Button
                    variant="primary"
                    size="sm"
                    as={Link}
                    to="/contact"
                    className="bg-[#1877F2] hover:bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 px-4 py-2.5 text-[11px] uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shrink-0"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    SCHEDULE TECHNICAL CONSULTATION
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    as={Link}
                    to="/portfolio"
                    className="bg-white/90 hover:bg-blue-50 text-[#1877F2] border border-[#1877F2] font-bold px-3.5 py-2.5 text-[11px] uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shrink-0 shadow-xs"
                  >
                    CASE STUDIES
                  </Button>

                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/95 hover:bg-emerald-50 border border-emerald-400 text-emerald-600 text-xs font-semibold transition-colors shadow-xs whitespace-nowrap shrink-0"
                    aria-label="Direct WhatsApp Priority Hotline"
                  >
                    <svg className="w-3.5 h-3.5 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Empty placeholder column on desktop so grid leaves right side for background art */}
              <div className="hidden lg:block lg:col-span-5 pointer-events-none" aria-hidden="true" />
            </div>
          </Container>
        </div>

        {/* ── Bottom Tech Partner Strip ── */}
        <div className="relative z-10 w-full">
          <Container width="wide">
            <div className="py-2.5 sm:py-3 border-t border-blue-200/50 flex flex-wrap items-center justify-between gap-3 text-slate-500">
              <div className="flex flex-wrap items-center gap-4 sm:gap-7 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5 hover:text-brand-blue transition-colors">
                  <ReactIcon className="w-4 h-4" />
                  <span>React</span>
                </span>
                <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                  <NextjsIcon className="w-4 h-4" />
                  <span>NEXT.js</span>
                </span>
                <span className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                  <NodeIcon className="w-4 h-4" />
                  <span>Node.js</span>
                </span>
                <span className="flex items-center gap-1.5 hover:text-sky-600 transition-colors">
                  <FlutterIcon className="w-4 h-4" />
                  <span>Flutter</span>
                </span>
                <span className="flex items-center gap-1.5 hover:text-amber-600 transition-colors">
                  <AwsIcon className="w-4 h-4" />
                  <span>aws</span>
                </span>
                <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden="true">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#4285F4" />
                  </svg>
                  <span>Google Cloud</span>
                </span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 sm:border-l sm:border-blue-200 sm:pl-3.5">
                Trusted Technology Partner
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  )
}


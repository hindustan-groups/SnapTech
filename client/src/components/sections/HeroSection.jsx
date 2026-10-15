/**
 * HeroSection — Official Snaptech Enterprise IT Hero.
 * 100% Dynamic configuration powered by PostgreSQL site_settings via useSiteSettings hook.
 * High-impact balanced two-column layout with prominent 3D technology illustration,
 * ambient soft blue gradients, domain search bar, and verified enterprise CTAs.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { Button, Container } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'
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

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { data: settingsData } = useSiteSettings()
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
  const domainPlaceholder = cfg.hero_domain || cfg.domain || 'Search snaptech.digital'
  const whatsappNumber = (cfg.whatsapp || cfg.phone || '').replace(/[^0-9]/g, '')
  const whatsappMsg = encodeURIComponent(
    cfg.whatsappMessage || `Hello ${companyName}, I am interested in your digital services.`
  )
  const heroImage = cfg.hero_image_url || heroTechVisual

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
      className="relative flex flex-col overflow-hidden isolate min-h-fit lg:min-h-screen text-slate-900"
      style={{ background: 'linear-gradient(135deg, #EEF4FF 0%, #F0F6FF 30%, #E8F2FF 60%, #EBF4FF 100%)' }}
      aria-label="SnapTech Digital — Web & App Development Agency Hero"
    >
      {/* ── Background: Light Blue Gradient with Subtle Dot Grid ── */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{ backgroundImage: 'radial-gradient(#93c5fd 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        {/* Large ambient right-side blue glow */}
        <div
          className="absolute top-0 right-0 bottom-0 w-[60%]"
          style={{ background: 'radial-gradient(ellipse 80% 90% at 85% 50%, rgba(191,219,254,0.55) 0%, rgba(219,234,254,0.35) 40%, transparent 75%)' }}
        />
        {/* Left accent glow */}
        <div
          className="absolute top-1/3 left-0 w-[30%] h-[40%]"
          style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(147,197,253,0.20) 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Main Hero Content with Reliable Header Clearance ── */}
      <div className="flex-1 flex flex-col justify-center pt-24 sm:pt-25 lg:pt-26 pb-2 lg:pb-3">
        <Container width="wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 xl:gap-6 items-center">
            {/* ── Left Column: Value Proposition & Interactive Search ── */}
            <div className="relative z-10 lg:col-span-6 xl:col-span-6 space-y-2.5 sm:space-y-3 lg:space-y-3 xl:space-y-3.5">
              {/* Parent Group Eyebrow Badge */}
              <div className="flex flex-wrap items-center gap-2 hero-fade-up">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-white/70 text-brand-blue text-[11px] font-bold tracking-wider uppercase shadow-2xs backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                  <span>{eyebrowText}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
                  | {divisionText}
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-1 hero-fade-up">
                <h1 className="font-heading font-black text-3.5xl sm:text-4.5xl lg:text-[42px] xl:text-[48px] 2xl:text-[54px] tracking-tight leading-[1.05] text-[#0D1B4B]">
                  {titlePrefix}{' '}
                  <br />
                  <span className="text-[#1877F2]">Cross-Platform </span>
                  <span>Mobile</span>{' '}
                  <br />
                  <span>Apps</span>
                </h1>
                <p className="text-xs sm:text-sm lg:text-[14px] xl:text-[15px] text-slate-600 font-medium tracking-tight max-w-xl leading-relaxed">
                  {tagline}
                </p>
              </div>

              {/* ── Interactive Domain Search Box ── */}
              <div className="hero-fade-up max-w-xl">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center bg-white/90 hover:bg-white focus-within:bg-white rounded-full border border-slate-200/80 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 p-1 sm:p-1.5 shadow-sm transition-all backdrop-blur-sm"
                >
                  <div className="pl-3 pr-2 text-brand-blue shrink-0">
                    <Search className="w-4.5 h-4.5 text-[#1877F2]" />
                  </div>
                  <input
                    id="hero-tech-search"
                    name="q"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={domainPlaceholder}
                    aria-label="Search IT services or technologies"
                    autoComplete="off"
                    className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 font-normal text-xs sm:text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4.5 py-2 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>SEARCH</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Quick suggestion tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-500 font-medium">Popular:</span>
                  {popularQueries.slice(0, 3).map((query) => (
                    <button
                      key={query}
                      type="button"
                      onClick={() => setSearchQuery(query)}
                      className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-white/70 hover:bg-blue-100 text-[#1877F2] border border-blue-200/60 font-medium transition-colors cursor-pointer backdrop-blur-sm"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>

              {/* IT Capabilities Bullet List */}
              <ul className="space-y-1.5 pt-0.5 hero-fade-up">
                {capabilities.map((cap) => (
                  <li key={cap} className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-700 font-medium">
                    <span className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0 shadow-2xs">
                      <svg className="w-2.5 h-2.5 text-white stroke-[2.8]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.5 6.2L4.7 8.5L9.5 3.5" />
                      </svg>
                    </span>
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>

              {/* High-Converting Action Buttons */}
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-2.5 pt-0.5 hero-fade-up">
                <Button
                  variant="primary"
                  size="sm"
                  as={Link}
                  to="/contact"
                  className="bg-[#1877F2] hover:bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 px-3 sm:px-3.5 xl:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shrink-0"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  SCHEDULE TECHNICAL CONSULTATION
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  as={Link}
                  to="/portfolio"
                  className="bg-white/80 hover:bg-blue-50 text-[#1877F2] border border-[#1877F2] font-bold shadow-2xs px-3 sm:px-3.5 xl:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shrink-0"
                >
                  EXPLORE DEPLOYED CASE STUDIES
                </Button>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-white/80 hover:bg-emerald-50/70 border border-emerald-400 text-emerald-600 text-xs font-semibold transition-colors shadow-2xs whitespace-nowrap shrink-0"
                  aria-label="Direct WhatsApp Priority Hotline"
                >
                  <svg className="w-4 h-4 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* ── Right Column: Prominent High-Impact 3D Tech Visual ── */}
            <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center lg:justify-end hero-fade-up relative">
              {/* Primary 3D Technology Asset — seamless, no blob background */}
              <img
                src={heroImage}
                alt="SnapTech Digital — Enterprise Web & Mobile Solutions"
                width="600"
                height="500"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-auto object-contain max-h-[370px] sm:max-h-[420px] lg:max-h-[460px] xl:max-h-[510px] 2xl:max-h-[560px] select-none transition-transform duration-700 hover:scale-[1.015]"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(59,130,246,0.18))' }}
              />
            </div>
          </div>

          {/* ── Bottom Tech Partner Strip ── */}
          <div className="mt-2 sm:mt-2.5 pt-2 border-t border-blue-200/50 flex flex-wrap items-center justify-between gap-3 text-slate-500">
            <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5 hover:text-brand-blue transition-colors">
                <ReactIcon className="w-4.5 h-4.5" />
                <span>React</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <NextjsIcon className="w-4.5 h-4.5" />
                <span>NEXT.js</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                <NodeIcon className="w-4.5 h-4.5" />
                <span>Node.js</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-sky-600 transition-colors">
                <FlutterIcon className="w-4.5 h-4.5" />
                <span>Flutter</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-amber-600 transition-colors">
                <AwsIcon className="w-4.5 h-4.5" />
                <span>aws</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" aria-hidden="true">
                  <path
                    d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
                    fill="#4285F4"
                  />
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
    </section>
  )
}

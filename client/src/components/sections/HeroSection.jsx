/**
 * HeroSection — Official Snaptech Enterprise IT Hero.
 * 100% Dynamic configuration powered by PostgreSQL site_settings via useSiteSettings hook.
 * Deep Navy & Electric Blue tech background with subtle blueprint grid, interactive telemetry, and cyber glow accents.
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Search,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Terminal,
} from 'lucide-react'
import { Button, Container } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'
import snaptechSocialBanner from '@/assets/snaptech-social-banner.jpg'

const DEFAULT_TECH_SEARCH_QUERIES = [
  'Custom Web Applications',
  'Mobile App Development',
  'Enterprise ERP & CRM',
  'Cloud Migration & AWS',
  'AI & Workflow Automation',
  'High-Speed SEO Optimization',
]

const DEFAULT_IT_CAPABILITIES = [
  'Enterprise Cloud & Scalable Web Architecture',
  'iOS & Android Native & Cross-Platform Apps',
  'Full-Cycle Software Engineering & DevOps',
  'ISO 9001 Grade Engineering & 99.9% Uptime SLA',
]

const DEFAULT_HEADLINE_CYCLE = [
  'IT Solutions?',
  'Web Applications?',
  'Mobile Apps?',
  'Cloud & DevOps?',
  'AI Automation?',
  'Enterprise ERP?',
]

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTelemetryTab, setActiveTelemetryTab] = useState('blueprint')
  const [headlineCycleIndex, setHeadlineCycleIndex] = useState(0)
  const [headlineVisible, setHeadlineVisible] = useState(true)
  const navigate = useNavigate()
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}

  // Cycle headline every 2.5s with fade transition
  const headlineCycles = cfg.hero_headline_cycles
    ? cfg.hero_headline_cycles.split(',').map((s) => s.trim())
    : DEFAULT_HEADLINE_CYCLE

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineVisible(false)
      setTimeout(() => {
        setHeadlineCycleIndex((i) => (i + 1) % headlineCycles.length)
        setHeadlineVisible(true)
      }, 300)
    }, 2800)
    return () => clearInterval(interval)
  }, [headlineCycles.length])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/services')
    }
  }

  // Dynamic values with elegant enterprise defaults
  const eyebrowText = cfg.hero_eyebrow || 'A Hindustan Projects Enterprise'
  const divisionText = cfg.hero_division || 'Engineering & IT Division'
  const titlePrefix = cfg.hero_title_prefix || 'Looking for'
  const tagline = cfg.tagline || 'Search. Discover. Connect with Snaptech.'
  const domainPlaceholder = cfg.hero_domain || 'www.snaptech.digital'
  const whatsappNumber = (cfg.whatsapp || '917597000601').replace(/[^0-9]/g, '')
  const whatsappMsg = encodeURIComponent(
    cfg.whatsappMessage || 'Hello Snaptech, I am interested in Enterprise IT Solutions.'
  )
  const heroImage = cfg.hero_image_url || snaptechSocialBanner

  const popularQueries = cfg.hero_popular_queries
    ? cfg.hero_popular_queries.split(',').map((s) => s.trim())
    : DEFAULT_TECH_SEARCH_QUERIES

  const capabilities = cfg.hero_capabilities
    ? cfg.hero_capabilities.split('\n').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_IT_CAPABILITIES

  const stats = [
    { value: `${cfg.stat_projects || '50'}+`, label: 'Enterprise Deployments' },
    { value: `${cfg.stat_clients || '40'}+`, label: 'Active Corporate Clients' },
    { value: cfg.stat_sla || '99.9%', label: 'Uptime & Cloud SLA' },
    { value: cfg.stat_reach || 'Pan-India & Global', label: 'Client Delivery Reach' },
  ]

  return (
    <section
      id="home"
      className="relative flex flex-col overflow-hidden isolate min-h-[100vh] bg-white text-slate-900"
      aria-label="Hindustan Projects IT Solutions Hero"
    >
      {/* ── Background: Clean Light Surface with Subtle Accents ── */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-slate-50/60 to-white">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden="true" />

        {/* Soft Brand Glows */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-blue-100/50 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/3 right-0 w-[450px] h-[450px] rounded-full bg-red-100/40 blur-[130px] pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* ── Main Hero Content ── */}
      <div className="flex-1 flex items-center pt-28 sm:pt-32 lg:pt-36 pb-14 lg:pb-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* ── Left Column: Value Proposition & Interactive Domain Bar ── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Parent Group Eyebrow Badge */}
              <div className="flex flex-wrap items-center gap-2 hero-fade-up" style={{ animationDelay: '0s' }}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-200 bg-red-50 text-brand-red text-xs font-bold tracking-wider uppercase shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                  <span>{eyebrowText}</span>
                </div>
                <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                  | {divisionText}
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2 hero-fade-up" style={{ animationDelay: '0.15s' }}>
                <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl tracking-tight leading-[1.15] text-slate-900">
                  {titlePrefix}{' '}
                  <span
                    className="text-brand-red font-black inline-block transition-all duration-300"
                    style={{
                      opacity: headlineVisible ? 1 : 0,
                      transform: headlineVisible ? 'translateY(0)' : 'translateY(-8px)',
                    }}
                  >
                    {headlineCycles[headlineCycleIndex]}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 font-medium tracking-tight">
                  {tagline}
                </p>
              </div>

              {/* ── Interactive Domain Search Box (from campaign art) ── */}
              <div className="hero-fade-up max-w-xl" style={{ animationDelay: '0.3s' }}>
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center bg-white hover:bg-slate-50/50 focus-within:bg-white rounded-2xl border border-slate-300 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 p-2 shadow-sm transition-all"
                >
                  <div className="pl-3 pr-2 text-brand-blue">
                    <Search className="w-5 h-5" />
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
                    className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 font-mono text-xs sm:text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Quick suggestion tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] text-slate-500 font-mono">Popular:</span>
                  {popularQueries.slice(0, 4).map((query) => (
                    <button
                      key={query}
                      type="button"
                      onClick={() => setSearchQuery(query)}
                      className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-brand-red border border-slate-200 transition-colors cursor-pointer"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>

              {/* IT Capabilities Bullet List */}
              <ul className="space-y-2 pt-2 hero-fade-up" style={{ animationDelay: '0.45s' }}>
                {capabilities.map((cap) => (
                  <li key={cap} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-brand-red shrink-0" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>

              {/* High-Converting Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 hero-fade-up" style={{ animationDelay: '0.6s' }}>
                <Button
                  variant="primary"
                  size="lg"
                  as={Link}
                  to="/services"
                  className="bg-brand-red hover:bg-brand-red-dark text-white font-bold shadow-md shadow-red-500/20 px-6"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore IT Services
                </Button>

                <Button
                  size="lg"
                  as={Link}
                  to="/contact"
                  className="bg-white hover:bg-slate-50 text-brand-blue border border-slate-300 font-bold shadow-xs"
                >
                  Schedule Consultation
                </Button>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-sm font-semibold transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* ── Right Column: Official Artwork & Interactive Tech Studio ── */}
            <div className="lg:col-span-5 hero-fade-up" style={{ animationDelay: '0.35s' }}>
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Clean Frame Card */}
                <div className="relative p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xl">
                  {/* Opposing Focus Brackets Graphic */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 border-t-3 border-l-3 border-brand-red pointer-events-none" />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-3 border-r-3 border-brand-blue pointer-events-none" />

                  {/* Top Interactive Mode Switcher */}
                  <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-slate-700 font-bold">SNAPTECH-CORE // v2.4</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-md">
                      <button
                        type="button"
                        onClick={() => setActiveTelemetryTab('blueprint')}
                        className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                          activeTelemetryTab === 'blueprint'
                            ? 'bg-brand-blue text-white font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Visual
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTelemetryTab('telemetry')}
                        className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                          activeTelemetryTab === 'telemetry'
                            ? 'bg-brand-blue text-white font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Telemetry
                      </button>
                    </div>
                  </div>

                  {/* Main Visual Poster Image OR Interactive Telemetry Studio */}
                  {activeTelemetryTab === 'blueprint' ? (
                    <div className="rounded-xl overflow-hidden bg-slate-100 shadow-inner relative group border border-slate-200">
                      <img
                        src={heroImage}
                        alt="Hindustan Projects IT Solutions"
                        className="w-full h-auto object-cover block transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 font-mono text-xs space-y-3 min-h-[220px] flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-slate-600 border-b border-slate-200 pb-2">
                          <span className="flex items-center gap-1.5 text-brand-blue font-bold">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>NODE_STATUS:</span>
                          </span>
                          <span className="text-emerald-600 font-bold">OPERATIONAL</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="p-2 rounded bg-white border border-slate-200">
                            <p className="text-slate-500 text-[10px]">Cloud Latency</p>
                            <p className="text-slate-900 font-bold text-sm">24ms</p>
                          </div>
                          <div className="p-2 rounded bg-white border border-slate-200">
                            <p className="text-slate-500 text-[10px]">Architecture</p>
                            <p className="text-slate-900 font-bold text-sm">React / Node</p>
                          </div>
                          <div className="p-2 rounded bg-white border border-slate-200">
                            <p className="text-slate-500 text-[10px]">Database Cluster</p>
                            <p className="text-emerald-700 font-bold text-sm">PostgreSQL Multi-AZ</p>
                          </div>
                          <div className="p-2 rounded bg-white border border-slate-200">
                            <p className="text-slate-500 text-[10px]">Compliance</p>
                            <p className="text-brand-blue font-bold text-sm">ISO 9001:2015</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                        <span>SSL: 256-Bit SHA256RSA</span>
                        <span className="text-emerald-700 font-bold">99.9% Uptime SLA</span>
                      </div>
                    </div>
                  )}

                  {/* Floating Trust Card: Parent Group Backing */}
                  <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-xl flex items-center gap-3 animate-float">
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-brand-blue">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-semibold">
                        Enterprise Guarantee
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        Backed by Hindustan Projects Group
                      </p>
                    </div>
                  </div>

                  {/* Floating SLA Chip */}
                  <div className="absolute -top-4 -right-2 sm:-right-4 bg-white backdrop-blur-md rounded-xl px-3 py-1.5 shadow-lg border border-emerald-200 flex items-center gap-2 animate-float" style={{ animationDelay: '0.5s' }}>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      Cloud SLA {cfg.stat_sla || '99.9%'}
                    </span>
                  </div>

                  {/* Floating Project count chip — new */}
                  <div className="absolute top-1/3 -right-3 sm:-right-5 bg-brand-navy/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-brand-blue/30 flex items-center gap-2 animate-float" style={{ animationDelay: '1s' }}>
                    <span className="text-base font-black text-white font-mono">{cfg.stat_projects || '50'}+</span>
                    <span className="text-[10px] text-brand-blue-light font-semibold leading-tight">Projects<br/>Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Bottom Enterprise Stats Strip ── */}
      <div className="border-t border-slate-200 bg-slate-50 hero-fade-in" style={{ animationDelay: '0.8s' }}>
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {stats.map((s) => (
              <div key={s.label} className="py-4 px-4 sm:px-6 text-center">
                <p className="font-heading text-xl sm:text-2xl lg:text-3xl font-black text-brand-blue font-mono">
                  {s.value}
                </p>
                <p className="text-slate-600 font-medium text-[11px] sm:text-xs mt-0.5 tracking-wide">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Scroll indicator */}
      <div className="py-2 flex justify-center items-center text-slate-600 font-semibold text-[10px] uppercase tracking-widest gap-1" aria-hidden="true">
        <span>Scroll to Explore</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce text-slate-600" />
      </div>
    </section>
  )
}

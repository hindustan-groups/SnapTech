/**
 * HeroSection — Official Snaptech Enterprise IT Hero.
 * Matches campaign artwork: "Looking for IT Solutions? Search. Discover. Connect with Snaptech."
 * Deep Navy & Electric Blue tech background with subtle blueprint grid and cyber glow accents.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search, ShieldCheck, CheckCircle2, ChevronDown } from 'lucide-react'
import { Button, Container } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'
import snaptechSocialBanner from '@/assets/snaptech-social-banner.jpg'

const TECH_SEARCH_QUERIES = [
  'Custom Web Applications',
  'Mobile App Development',
  'Enterprise ERP & CRM',
  'Cloud Migration & AWS',
  'AI & Workflow Automation',
  'High-Speed SEO Optimization',
]

const IT_CAPABILITIES = [
  'Enterprise Cloud & Scalable Web Architecture',
  'iOS & Android Native & Cross-Platform Apps',
  'Full-Cycle Software Engineering & DevOps',
  'ISO 9001 Grade Engineering & 99.9% Uptime SLA',
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

  const stats = [
    { value: `${cfg.stat_projects || '50'}+`, label: 'Enterprise Deployments' },
    { value: `${cfg.stat_clients || '40'}+`, label: 'Active Corporate Clients' },
    { value: '99.9%', label: 'Uptime & Cloud SLA' },
    { value: 'Pan-India & Global', label: 'Client Delivery Reach' },
  ]

  return (
    <section
      id="home"
      className="relative flex flex-col overflow-hidden isolate min-h-[100vh] bg-[#020714] text-white"
      aria-label="Snaptech IT Solutions Hero"
    >
      {/* ── Background: Tech Blueprint & Cyber Glow ── */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#020714] via-[#051129] to-[#020714]">
        {/* Subtle Tech Dot Grid */}
        <div
          className="absolute inset-0 opacity-20 bg-tech-grid"
          aria-hidden="true"
        />

        {/* Electric Blue Radial Glows */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-brand-primary/15 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-brand-cyan/10 blur-[130px] pointer-events-none"
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
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-primary/40 bg-brand-primary/10 text-brand-cyan text-xs font-semibold tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                  <span>A Hindustan Projects Enterprise</span>
                </div>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  | Engineering & IT Division
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2 hero-fade-up" style={{ animationDelay: '0.15s' }}>
                <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl tracking-tight leading-[1.15]">
                  Looking for{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary-light via-brand-cyan to-white">
                    IT Solutions?
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-slate-200 font-medium tracking-tight">
                  Search. Discover. Connect with <span className="text-brand-primary-light font-bold">Snaptech</span>.
                </p>
              </div>

              {/* ── Interactive Domain Search Box (from campaign art) ── */}
              <div className="hero-fade-up max-w-xl" style={{ animationDelay: '0.3s' }}>
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center bg-white/10 hover:bg-white/15 focus-within:bg-white/20 backdrop-blur-md rounded-2xl border border-brand-primary/40 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/30 p-2 shadow-xl shadow-black/40 transition-all"
                >
                  <div className="pl-3 pr-2 text-brand-cyan">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="www.snaptech.hindustanprojects.in"
                    className="w-full bg-transparent text-white placeholder:text-slate-400 font-mono text-xs sm:text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-md flex items-center gap-1.5"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Quick suggestion tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] text-slate-400 font-mono">Popular:</span>
                  {TECH_SEARCH_QUERIES.slice(0, 3).map((query) => (
                    <button
                      key={query}
                      type="button"
                      onClick={() => setSearchQuery(query)}
                      className="text-[11px] px-2.5 py-0.5 rounded-md bg-white/5 hover:bg-brand-primary/20 text-slate-300 hover:text-brand-cyan border border-white/10 transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>

              {/* IT Capabilities Bullet List */}
              <ul className="space-y-2 pt-2 hero-fade-up" style={{ animationDelay: '0.45s' }}>
                {IT_CAPABILITIES.map((cap) => (
                  <li key={cap} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>

              {/* High-Converting Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2 hero-fade-up" style={{ animationDelay: '0.6s' }}>
                <Button
                  variant="primary"
                  size="lg"
                  as={Link}
                  to="/services"
                  className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold shadow-lg shadow-brand-primary/30 px-6"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore IT Services
                </Button>

                <Button
                  size="lg"
                  as={Link}
                  to="/contact"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm font-semibold"
                >
                  Schedule Consultation
                </Button>

                <a
                  href="https://wa.me/917597000601?text=Hello%20Snaptech%2C%20I%20am%20interested%20in%20IT%20Solutions."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-sm font-semibold transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* ── Right Column: Official Artwork & Interactive Tech Studio ── */}
            <div className="lg:col-span-5 hero-fade-up" style={{ animationDelay: '0.35s' }}>
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Tech Bracket Container Framing */}
                <div className="relative p-2 rounded-2xl bg-gradient-to-br from-brand-primary/30 via-slate-800/40 to-brand-cyan/20 border border-brand-primary/40 shadow-2xl backdrop-blur-md">
                  {/* Opposing Focus Brackets Graphic */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 border-t-3 border-l-3 border-brand-primary pointer-events-none" />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-3 border-r-3 border-brand-primary pointer-events-none" />

                  {/* Main Visual Poster Image */}
                  <div className="rounded-xl overflow-hidden bg-white/95 shadow-inner">
                    <img
                      src={snaptechSocialBanner}
                      alt="Snaptech IT Solutions - Hindustan Projects Group"
                      className="w-full h-auto object-cover block transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </div>

                  {/* Floating Trust Card: Parent Group Backing */}
                  <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-[#030d22]/95 backdrop-blur-xl border border-brand-primary/40 rounded-xl p-3 sm:p-3.5 shadow-2xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-primary/20 text-brand-cyan">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                        Enterprise Guarantee
                      </p>
                      <p className="text-xs font-bold text-white">
                        Backed by Hindustan Projects Group
                      </p>
                    </div>
                  </div>

                  {/* Floating Tech Telemetry Chip: 99.9% Uptime */}
                  <div className="absolute -top-4 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-xl border border-black/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-[#001d4a] font-mono">
                      Cloud SLA 99.9%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Bottom Enterprise Stats Strip ── */}
      <div className="border-t border-white/10 bg-white/[0.03] backdrop-blur-md hero-fade-in" style={{ animationDelay: '0.8s' }}>
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {stats.map((s) => (
              <div key={s.label} className="py-4 px-4 sm:px-6 text-center">
                <p className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-white font-mono">
                  {s.value}
                </p>
                <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5 tracking-wide">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Scroll indicator */}
      <div className="py-2 flex justify-center items-center text-slate-500 text-[10px] uppercase tracking-widest gap-1" aria-hidden="true">
        <span>Scroll to Explore</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
      </div>
    </section>
  )
}

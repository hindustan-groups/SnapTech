import { Link } from 'react-router-dom'
import { Rocket, Award, Clock, TrendingUp, CheckCircle2, ArrowRight, Sparkles, MessageSquare } from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
import PortfolioSection from '@/components/sections/PortfolioSection'
import { useSiteSettings } from '@/hooks/useContent'

import portfolioHeroNewFit from '@/assets/portfolio_hero_new_fit.webp'

export default function PortfolioPage() {
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}

  const stats = [
    { value: `${cfg.stat_projects || '50'}+`, label: 'Enterprise Deliverables', sub: 'Production Deployed', icon: Rocket },
    { value: `${cfg.stat_clients || '40'}+`, label: 'Active Retained Clients', sub: 'Long-Term Partners', icon: Award },
    { value: '100%', label: 'On-Time Milestone SLA', sub: 'Zero Sprint Delay', icon: Clock },
    { value: '3.4×', label: 'Average Client ROI', sub: 'Verified Telemetry', icon: TrendingUp },
  ]

  const rawWa = cfg.whatsapp || cfg.phone || ''
  const waNum = (rawWa && !rawWa.includes('99999') && !rawWa.includes('123456') ? rawWa : '917597000601').replace(/[^0-9]/g, '')

  return (
    <div className="bg-white min-h-screen text-slate-900 selection:bg-brand-blue/15 selection:text-brand-blue">
      <SEO
        title={`Portfolio — ${cfg.stat_projects || '50'}+ Projects Delivered | SnapTech Digital`}
        description="Explore SnapTech Digital portfolio — enterprise projects delivered across web applications, cloud architecture, native mobile apps, and custom software."
        path="/portfolio"
        keywords="SnapTech Digital portfolio, web development portfolio, IT projects Bhilwara, software engineering case studies, full stack development India"
      />

      {/* ── 1. Light Hero ────────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-0 overflow-hidden bg-linear-to-b from-slate-50 via-white to-slate-50/50 border-b border-slate-200/80 flex flex-col justify-between">
        {/* Subtle geometric pattern & ambient glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-size-[48px_48px] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-125 h-125 bg-blue-100/60 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-100 h-100 bg-sky-100/50 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

        <Container className="relative h-full flex flex-col justify-end">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            {/* Left - text content */}
            <div className="lg:col-span-7 pb-16 lg:pb-24">
              <span className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50/80 text-brand-blue text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                Case Studies &amp; Deployed Architecture
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold text-[#0D1B4B] leading-[1.12] mb-6">
                Our Work,{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
                  Our Engineering.
                </span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-normal">
                Enterprise software. Scalable microservices. High-converting user journeys. Explore how SnapTech powers mission-critical digital infrastructure and cloud systems nationwide.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link
                  to="/contact"
                  className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-brand-blue/20 transition-all cursor-pointer inline-flex items-center justify-center"
                >
                  Commission Solution Architect
                </Link>
                <Link
                  to="/services"
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 font-bold px-7 py-3.5 rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  All Capabilities <ArrowRight className="w-4 h-4 text-brand-blue" />
                </Link>
              </div>

              {/* Capability badges */}
              <div className="flex flex-wrap gap-3">
                {['High-Concurrency Web', 'Cross-Platform Mobile', 'Industrial ERPs', 'Technical SEO Engines'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Visual Portal Container */}
            <div className="lg:col-span-5 hidden lg:flex justify-center items-end relative self-end mt-auto w-full max-w-md justify-self-center pt-2">
              <div className="relative w-full max-w-sm self-end mt-auto">
                {/* Glowing background aura */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full bg-blue-400/20 blur-3xl -z-10" />

                {/* Arch portal */}
                <div className="relative z-10 overflow-hidden rounded-t-full border-t border-x border-slate-200 shadow-xl bg-slate-100">
                  <img
                    src={portfolioHeroNewFit}
                    alt="SnapTech Technology Executive"
                    className="w-full aspect-3/4 object-cover object-center block"
                    style={{ display: 'block', marginBottom: '-1px' }}
                  />
                </div>

                {/* Floating Badge 1: 5+ Years Experience */}
                <div className="absolute z-20 top-12 -right-4 bg-white/95 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-xl border border-slate-200/90 transition-transform duration-300 hover:scale-105">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading text-xl font-extrabold text-brand-blue">
                      {cfg.stat_experience || '5'}+
                    </span>
                    <div>
                      <p className="font-heading text-xs font-bold text-slate-900 leading-none">Years Corporate</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">Heritage</p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2: 50+ Projects Delivered */}
                <div className="absolute z-20 bottom-12 -left-4 bg-white/95 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-xl border border-emerald-500/30 transition-transform duration-300 hover:scale-105">
                  <p className="font-heading text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {cfg.stat_projects || '50'}+ Deliverables
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">100% Production SLA</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 2. Enterprise Telemetry Strip ───────────────────────────── */}
      <section className="bg-slate-50/70 border-b border-slate-200/80 py-8">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-brand-blue/40 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0">
                  <stat.icon className="w-5 h-5 text-brand-blue" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 font-heading">{stat.value}</p>
                  <p className="text-xs text-slate-700 font-semibold">{stat.label}</p>
                  <p className="text-[11px] text-brand-blue font-medium">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 3. Interactive Portfolio Filter Grid ─────────────────────── */}
      <PortfolioSection />

      {/* ── 4. Project Commissioning Banner ──────────────────────────── */}
      <section className="relative py-20 sm:py-24 overflow-hidden bg-slate-50">
        <Container className="relative">
          <div className="max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-linear-to-br from-[#0D1B4B] via-[#102A66] to-[#0A1840] p-8 sm:p-12 lg:p-16 text-center shadow-2xl text-white">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-400/40 bg-blue-400/10 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              Direct Engineering Scoping
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
              Ready to Commission Your Next Technical Milestone?
            </h2>
            <p className="text-blue-100 text-base sm:text-lg mb-10 max-w-2xl mx-auto font-light">
              Speak directly with our technical director. We analyze your requirements, formulate architectural diagrams, and provide guaranteed delivery milestones under NDA.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/contact"
                className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue-dark text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all inline-flex items-center justify-center"
              >
                Schedule Technical Review
              </Link>
              <a
                href={`https://wa.me/${waNum}?text=${encodeURIComponent('Hi! I am reviewing the SnapTech portfolio and would like to discuss commissioning a project.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Direct WhatsApp Hotline
              </a>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 text-blue-200 text-xs font-medium">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Guaranteed Milestone Delivery
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full Source Code &amp; IP Transfer
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 30-Day Post-Delivery Warranty
              </span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}


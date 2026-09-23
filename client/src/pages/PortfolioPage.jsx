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
  const waNum = (rawWa && !rawWa.includes('99999') && !rawWa.includes('123456') ? rawWa : '919929120431').replace(/[^0-9]/g, '')

  return (
    <div className="bg-[#020714] min-h-screen text-slate-100 selection:bg-brand-cyan/20 selection:text-brand-cyan">
      <SEO
        title={`Portfolio — ${cfg.stat_projects || '50'}+ Projects Delivered | Snaptech`}
        description="Explore Snaptech (Hindustan Projects) portfolio — enterprise projects delivered across web applications, cloud architecture, native mobile apps, and custom software."
        path="/portfolio"
        keywords="Snaptech portfolio, web development portfolio, IT projects, software engineering case studies, Hindustan Projects IT"
      />

      {/* ── 1. Cyber Hero ────────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-0 overflow-hidden bg-[#020714] border-b border-white/10 flex flex-col justify-between">
        {/* Deep mesh & ambient glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-cyan/15 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

        <Container className="relative h-full flex flex-col justify-end">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            {/* Left - text content */}
            <div className="lg:col-span-7 pb-16 lg:pb-24">
              <span className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                Case Studies &amp; Deployed Architecture
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold text-white leading-[1.12] mb-6">
                Our Work,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-primary-light to-white">
                  Our Engineering.
                </span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-light">
                Enterprise software. Scalable microservices. High-converting user journeys. Explore how Snaptech — the technology division of Hindustan Projects — powers digital infrastructure and cloud systems nationwide.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Button
                  variant="primary"
                  size="lg"
                  as={Link}
                  to="/contact"
                  className="bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-brand-primary-dark hover:to-brand-cyan-dark text-white font-bold px-8 shadow-[0_0_25px_rgba(30,107,238,0.4)] border border-brand-cyan/40"
                >
                  Commission Solution Architect
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  as={Link}
                  to="/services"
                  className="text-white border border-white/20 hover:bg-white/10 backdrop-blur-md"
                >
                  All Capabilities <ArrowRight className="w-4 h-4 ml-2 inline text-brand-cyan" />
                </Button>
              </div>

              {/* Capability badges */}
              <div className="flex flex-wrap gap-3">
                {['High-Concurrency Web', 'Cross-Platform Mobile', 'Industrial ERPs', 'Technical SEO Engines'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono font-medium text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Visual Portal Container */}
            <div className="lg:col-span-5 hidden lg:flex justify-center items-end relative self-end mt-auto w-full max-w-md justify-self-center pt-2">
              <div className="relative w-full max-w-sm self-end mt-auto">
                {/* Glowing background aura */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full bg-brand-cyan/20 blur-3xl -z-10" />

                {/* Arch portal */}
                <div className="relative z-10 overflow-hidden rounded-t-full border-t border-x border-brand-cyan/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] bg-slate-900/50">
                  <img
                    src={portfolioHeroNewFit}
                    alt="Hindustan Projects Technology Executive"
                    className="w-full aspect-[3/4] object-cover object-center block"
                    style={{ display: 'block', marginBottom: '-1px' }}
                  />
                </div>

                {/* Floating Cyber Badge 1: 5+ Years Experience */}
                <div className="absolute z-20 top-12 -right-4 bg-slate-900/90 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-brand-cyan/30 transition-transform duration-300 hover:scale-105">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading text-xl font-bold text-brand-cyan">
                      {cfg.stat_experience || '5'}+
                    </span>
                    <div>
                      <p className="font-heading text-xs font-bold text-white leading-none">Years Corporate</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Heritage</p>
                    </div>
                  </div>
                </div>

                {/* Floating Cyber Badge 2: 50+ Projects Delivered */}
                <div className="absolute z-20 bottom-12 -left-4 bg-slate-900/90 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-emerald-500/30 transition-transform duration-300 hover:scale-105">
                  <p className="font-heading text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {cfg.stat_projects || '50'}+ Deliverables
                  </p>
                  <p className="text-[10px] text-emerald-300 font-mono mt-0.5">100% Production SLA</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 2. Enterprise Telemetry Strip ───────────────────────────── */}
      <section className="bg-[#03091e] border-b border-white/10 py-6 sm:py-8">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-brand-cyan/40 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shrink-0">
                  <stat.icon className="w-5 h-5 text-brand-cyan" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white font-heading">{stat.value}</p>
                  <p className="text-xs text-slate-300 font-medium">{stat.label}</p>
                  <p className="text-[11px] text-brand-cyan/70 font-mono">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 3. Interactive Portfolio Filter Grid ─────────────────────── */}
      <PortfolioSection />

      {/* ── 4. Project Commissioning Banner ──────────────────────────── */}
      <section className="relative py-20 sm:py-24 overflow-hidden bg-[#020714]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(30,107,238,0.25),transparent_70%)] pointer-events-none" />

        <Container className="relative">
          <div className="max-w-4xl mx-auto rounded-3xl border border-brand-cyan/30 bg-gradient-to-b from-slate-900/90 to-[#020714] p-8 sm:p-12 lg:p-16 text-center backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.12)]">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan text-xs font-semibold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              Direct Engineering Scoping
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
              Ready to Commission Your Next Technical Milestone?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto font-light">
              Speak directly with our technical director. We analyze your requirements, formulate architectural diagrams, and provide guaranteed delivery milestones under NDA.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="primary"
                size="lg"
                as={Link}
                to="/contact"
                className="w-full sm:w-auto bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-brand-primary-dark hover:to-brand-cyan-dark text-white font-bold px-8 shadow-[0_0_25px_rgba(30,107,238,0.4)]"
              >
                Schedule Technical Review
              </Button>
              <a
                href={`https://wa.me/${waNum}?text=${encodeURIComponent('Hi! I am reviewing the Snaptech portfolio and would like to discuss commissioning a project.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                Direct WhatsApp Hotline
              </a>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 text-slate-300 text-xs font-mono">
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


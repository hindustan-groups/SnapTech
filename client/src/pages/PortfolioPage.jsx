/**
 * /portfolio — Premium Portfolio page
 */
import { Link } from 'react-router-dom'
import { Rocket, Award, Clock, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
import PortfolioSection from '@/components/sections/PortfolioSection'
import { useSiteSettings } from '@/hooks/useContent'

import portfolioHeroNewFit from '@/assets/portfolio_hero_new_fit.webp'

export default function PortfolioPage() {
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}

  const stats = [
    { value: `${cfg.stat_projects || '50'}+`, label: 'Projects Delivered', icon: Rocket },
    { value: `${cfg.stat_clients || '40'}+`, label: 'Happy Clients', icon: Award },
    { value: '100%', label: 'On-Time Delivery', icon: Clock },
    { value: '3×', label: 'Avg. ROI for Clients', icon: TrendingUp },
  ]

  return (
    <>
      <SEO
        title={`Portfolio — ${cfg.stat_projects || '50'}+ Projects Delivered | Snaptech`}
        description="Explore Snaptech (Hindustan Projects) portfolio — enterprise projects delivered across web applications, cloud architecture, native mobile apps, and custom software."
        path="/portfolio"
        keywords="Snaptech portfolio, web development portfolio, IT projects, software engineering case studies, Hindustan Projects IT"
      />
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-32 lg:pt-36 pb-0 overflow-hidden bg-[#050e20] flex flex-col justify-between">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        {/* Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-cyan/15 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <Container className="relative h-full flex flex-col justify-end">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            {/* Left - text content */}
            <div className="pb-16 lg:pb-24">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                Case Studies &amp; Engineering
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-bold !text-white leading-tight mb-5">
                Our Work,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-cyan">
                  Our Engineering.
                </span>
              </h1>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-8">
                Enterprise software. Scalable architecture. Real business impact. Explore how Snaptech — the technology division of Hindustan Projects — powers digital infrastructure, custom cloud software, and mobile ecosystems.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Button variant="primary" size="lg" as={Link} to="/contact">
                  Start Your Project
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  as={Link}
                  to="/services"
                  className="!text-white !border-white/20 hover:!bg-white/10"
                >
                  Our Services →
                </Button>
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                {['Web & Apps', 'Digital Marketing', 'Branding', 'Software'].map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white/50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Visual image container (Identical to homepage hero but with a new image) */}
            <div className="hidden lg:flex justify-center items-end relative self-end mt-auto w-full max-w-md justify-self-center pt-2">
              <div className="relative w-full max-w-sm self-end mt-auto">
                {/* Glowing background aura behind the arch portal */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full bg-brand-blue/10 blur-3xl -z-10" />

                {/* Person image - rendered as a premium arch portal, 100% sharp and clear */}
                <div className="relative z-10 overflow-hidden rounded-t-full border-t border-x border-white/20 shadow-2xl">
                  <img
                    src={portfolioHeroNewFit}
                    alt="Hindustan Projects Corporate Professional"
                    className="w-full aspect-[3/4] object-cover object-center block"
                    style={{ display: 'block', marginBottom: '-1px' }}
                  />
                </div>

                {/* Floating Badge 1: 5+ Years Experience */}
                <div className="absolute z-20 top-12 -right-6 bg-white/95 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-xl border border-black/5 transition-transform duration-300 hover:scale-105">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-red text-lg font-bold">
                      {cfg.stat_experience || '5'}+
                    </span>
                    <div>
                      <p className="font-heading text-xs font-bold text-brand-blue">Years of</p>
                      <p className="text-[10px] text-text-muted">Excellence</p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2: 50+ Projects Delivered */}
                <div className="absolute z-20 bottom-12 -left-6 bg-brand-red rounded-xl px-4 py-2.5 shadow-xl transition-transform duration-300 hover:scale-105 border border-white/10">
                  <p className="font-heading text-xs font-bold text-white">
                    {cfg.stat_projects || '50'}+ Projects
                  </p>
                  <p className="text-[10px] text-white/75">Delivered Successfully</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-150 py-0">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 px-4 sm:px-6 py-5 sm:py-6 group hover:bg-brand-blue/3 transition-colors duration-200 border-b border-r border-gray-100 [&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r lg:[&:nth-child(4)]:border-r-0"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-blue/8 flex items-center justify-center shrink-0 group-hover:bg-brand-blue/14 transition-colors">
                  <stat.icon className="w-5 h-5 text-brand-blue" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-red font-heading">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Portfolio Grid ───────────────────────────────────────── */}
      <PortfolioSection />
    </>
  )
}

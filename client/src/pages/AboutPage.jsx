import { Link } from 'react-router-dom'
import {
  MapPin,
  Target,
  Eye,
  CheckCircle2,
  ArrowRight,
  Users,
  Award,
  Rocket,
  Code2,
  Handshake,
  Shield,
  ExternalLink,
  Sparkles,
  Building2,
} from 'lucide-react'
import { Container, SEO } from '@/components/ui'
import TeamSection from '@/components/sections/TeamSection'
import { useMilestones, useSiteSettings } from '@/hooks/useContent'

/* ── Static data (company values) ─────────────────────────────── */
const VALUES = [
  {
    icon: Users,
    title: 'Client-Centric Engineering',
    desc: 'Every technical sprint, architectural decision, and feature prioritisation is strictly aligned with client ROI and measurable business impact.',
  },
  {
    icon: Shield,
    title: 'Radical Transparency',
    desc: 'Direct repository visibility, deterministic milestones, zero hidden costs, and enterprise-grade service level agreements.',
  },
  {
    icon: Code2,
    title: 'Zero Technical Debt',
    desc: 'We build with clean, scalable, maintainable architectures designed to sustain millions of daily transactions with zero refactoring.',
  },
  {
    icon: Handshake,
    title: 'Long-Term Partnership',
    desc: 'Beyond code delivery, we act as fractional CTOs and technology advisors, scaling alongside our enterprise partners.',
  },
]

export default function AboutPage() {
  const { data: milestonesData, isLoading: milestonesLoading } = useMilestones()
  const { data: settingsData } = useSiteSettings()

  const milestones = Array.isArray(milestonesData?.data) ? milestonesData.data : []
  const cfg = settingsData?.data || {}

  const stats = [
    { value: 'July 2026', label: 'Founded Inception', sub: 'Bhilwara, Rajasthan', icon: Award },
    { value: '100%', label: 'Code & IP Ownership', sub: 'Full Git Handover', icon: Rocket },
    { value: 'Hindustan Projects', label: 'Parent Enterprise', sub: 'Established Group Division', icon: Building2 },
    { value: 'Pan-India', label: 'Client Delivery Reach', sub: 'Agile Remote Workflows', icon: MapPin },
  ]

  const parentUrl = cfg.parent_company_url || 'https://www.hindustanprojects.in'
  const aboutStoryImage =
    cfg.about_story_image ||
    cfg.about_hero_laptop_image ||
    cfg.about_image_url ||
    cfg.about_hero_phone_image ||
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&q=80&auto=format&fit=crop'

  return (
    <div className="bg-white min-h-screen text-slate-900 selection:bg-brand-blue/15 selection:text-brand-blue">
      <SEO
        title="About SnapTech Digital — Our Story, Team & Mission | Bhilwara, Rajasthan"
        description="SnapTech Digital is a digital agency based in Bhilwara, Rajasthan. Learn about our story, our team, our values, and how we help businesses grow through technology."
        path="/about"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About Us', path: '/about' },
        ]}
        keywords="SnapTech Digital, about us, digital agency Bhilwara, IT company Rajasthan, web development team, software company India"
        schemas={[
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About SnapTech Digital',
            url: 'https://www.snaptech.digital/about',
            description:
              'SnapTech Digital is the dedicated technology and digital transformation company of Hindustan Projects Group, delivering enterprise digital systems.',
          },
        ]}
      />

      {/* ── 1. Light Hero Header ────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 overflow-hidden border-b border-slate-200/80 bg-linear-to-b from-slate-50 via-white to-slate-50/50">
        {/* Subtle mesh background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-size-[48px_48px] pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-125 h-125 bg-blue-100/60 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-100 h-100 bg-sky-100/50 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

        <Container className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50/80 text-brand-blue text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                Hindustan Projects Group Enterprise Division
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold text-[#0D1B4B] leading-[1.12] mb-6">
                Next-Gen IT Engineering With{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
                  Corporate Stability.
                </span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-normal">
                SnapTech Digital is the dedicated technology company of Hindustan Projects Group. We combine the agility of an elite software studio with the financial longevity, governance, and institutional backing of a premier corporate conglomerate.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  to="/contact"
                  className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-brand-blue/20 transition-all cursor-pointer inline-flex items-center justify-center"
                >
                  Consult Our Technical Board
                </Link>
                <Link
                  to="/portfolio"
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 font-bold px-7 py-3.5 rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  Inspect Case Studies <ArrowRight className="w-4 h-4 text-brand-blue" />
                </Link>
              </div>
            </div>

            {/* Right: Institutional Governance Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-slate-200/90 bg-white shadow-xl p-6 sm:p-8">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-blue" />
                    <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                      Corporate Ecosystem
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 font-semibold">
                    Group Verified
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                      Parent Conglomerate
                    </p>
                    <p className="text-base font-bold text-slate-900 font-heading">
                      Hindustan Projects Group
                    </p>
                    <p className="text-xs text-slate-600 mt-1 font-normal">
                      Multi-disciplinary enterprise with established footprint in industrial development, real estate, and digital infrastructure.
                    </p>
                    <a
                      href={parentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-blue-dark mt-3 transition-colors"
                    >
                      Visit Corporate Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-mono text-brand-blue uppercase tracking-wider font-semibold">
                        Technology Division
                      </p>
                      <span className="text-[10px] font-mono font-bold text-brand-blue">Active Arm</span>
                    </div>
                    <p className="text-base font-bold text-[#0D1B4B] font-heading">
                      SnapTech IT Solutions
                    </p>
                    <p className="text-xs text-slate-600 mt-1 font-normal">
                      Spearheading custom enterprise web portals, mobile ecosystems, automated DevOps, and strategic IT modernization.
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Headquarters: Bhilwara, RJ</span>
                  <span className="text-brand-blue font-bold">99.9% Uptime SLA</span>
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

      {/* ── 3. Corporate Heritage & Story ───────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white relative">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Showcase Graphic Card (Full Uncropped View) */}
            <div className="lg:col-span-6 relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-slate-900 shadow-xl group">
                {/* Image Container - Natural Aspect Ratio, Zero Crop */}
                <div className="relative overflow-hidden bg-slate-950 flex items-center justify-center">
                  <img
                    src={aboutStoryImage}
                    alt="SnapTech engineering team in collaborative session"
                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500 block"
                    loading="lazy"
                  />
                </div>

                {/* Engineering Hub Footer Meta Bar - Sleek & Non-Intrusive */}
                <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-brand-blue" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-brand-blue uppercase tracking-wider">
                        Engineering Hub &amp; Headquarters
                      </p>
                      <p className="text-xs sm:text-sm text-slate-900 font-bold">
                        Bhilwara, Rajasthan, India
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-blue-50 text-brand-blue font-bold border border-blue-200 shrink-0">
                    Group Tech Wing
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Narrative Story */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-brand-blue text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-brand-blue animate-pulse" />
                  <span>// INSTITUTIONAL NARRATIVE</span>
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-[#0D1B4B] leading-tight tracking-tight">
                  Rooted in Rajasthan.{' '}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-600">
                    Executing Pan-India.
                  </span>
                </h2>
              </div>

              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                <p>
                  Hindustan Projects founded SnapTech Digital with a clear institutional conviction: enterprise-caliber IT architecture should not be monopolized by Tier-1 metropolitan agencies charging inflated retainer costs with opaque delivery timelines.
                </p>
                <p>
                  We recognized that growing industrial enterprises and innovative startups require a dependable, permanent technology partner — one with real corporate accountability, localized leadership, and world-class engineering discipline.
                </p>
                <p>
                  Founded in July 2026 as the dedicated technology arm of Hindustan Projects Group, SnapTech Digital delivers mission-critical web applications, cloud infrastructure, and custom software systems with enterprise engineering discipline and 100% code ownership.
                </p>
              </div>

              {/* Key Trust Highlights */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                {[
                  '100% Code & IP Handover',
                  'Deterministic 2-Week Sprints',
                  'Direct Architect Collaboration',
                ].map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mission & Vision Dual Cards - Dedicated Foundation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 sm:mt-16 pt-12 border-t border-slate-200/80">
            <div className="p-7 sm:p-8 rounded-3xl border border-slate-200/90 bg-linear-to-br from-slate-50/80 via-white to-blue-50/30 shadow-xs hover:shadow-md hover:border-brand-blue/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-2xs">
                <Target className="w-6 h-6 text-brand-blue" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-blue mb-1.5 block">
                Operational Purpose
              </span>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
                Our Core Mission
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Deliver resilient, enterprise-grade software and digital systems that create lasting, measurable operational and revenue advantages for our clients.
              </p>
            </div>

            <div className="p-7 sm:p-8 rounded-3xl border border-slate-200/90 bg-linear-to-br from-slate-50/80 via-white to-indigo-50/30 shadow-xs hover:shadow-md hover:border-indigo-400/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-2xs">
                <Eye className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 mb-1.5 block">
                Long-Term Horizon
              </span>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
                Our Strategic Vision
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                To be the foremost technology conglomerate in Western India, recognized for unmatched engineering fidelity, zero-downtime operations, and institutional reliability.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 4. Core Values & Engineering Culture ───────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50/60 border-t border-b border-slate-200/80 relative">
        <Container className="relative">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-brand-blue mb-3 block">
              // ARCHITECTURAL CODE
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              The Principles That Govern Our Code
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-normal">
              These principles guide every architectural diagram, database query, pull request, and client milestone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="group p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs
                  hover:border-brand-blue/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-5 shadow-xs group-hover:scale-110 transition-transform duration-300">
                  <v.icon className="w-6 h-6 text-brand-blue" strokeWidth={1.8} />
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900 mb-2 group-hover:text-brand-blue transition-colors">
                  {v.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 5. Corporate Milestones & Evolution Timeline ────────────── */}
      {(milestonesLoading || milestones.length > 0) && (
        <section className="py-16 sm:py-20 lg:py-24 bg-white relative">
          <Container>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-brand-blue mb-3 block">
                // VERIFIED TRACK RECORD
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                Key Milestones in Our Evolution
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-normal">
                From our inception to becoming a multi-disciplinary enterprise technology practice.
              </p>
            </div>

            <div className="relative max-w-3xl mx-auto">
              {/* Luminous Vertical Spine */}
              <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-linear-to-b from-brand-blue via-blue-400 to-transparent hidden sm:block shadow-xs" />

              <div className="space-y-8">
                {(milestonesLoading ? Array.from({ length: 4 }) : milestones).map((m, i) =>
                  milestonesLoading ? (
                    <div key={i} className="flex gap-6">
                      <div className="hidden sm:block w-20 h-16 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
                      <div className="flex-1 h-20 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse" />
                    </div>
                  ) : (
                    <div key={m.id || i} className="flex gap-6 group">
                      {/* Node Marker */}
                      <div className="hidden sm:flex flex-col items-center shrink-0">
                        <div className="w-20 h-16 px-2 rounded-2xl border border-blue-200 bg-white flex flex-col items-center justify-center text-center shadow-md group-hover:border-brand-blue group-hover:bg-blue-50 transition-all duration-300">
                          <span className="text-[11px] font-mono font-extrabold text-brand-blue leading-tight text-center">
                            {m.year}
                          </span>
                        </div>
                      </div>

                      {/* Milestone Card */}
                      <div className="flex-1 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 shadow-xs group-hover:border-brand-blue/40 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="sm:hidden text-xs font-mono font-bold text-brand-blue">
                            {m.year} //
                          </span>
                          <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                            {m.title}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-normal">
                          {m.desc}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── 6. Leadership & Engineering Squad ───────────────────────── */}
      <TeamSection
        id="about-team"
        badge="// EXECUTIVE DIRECTORS & ARCHITECTS"
        title={
          <>
            Meet The{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
              Technical Board
            </span>
          </>
        }
        subtitle="A seasoned collective of technologists, systems architects, and product leads committed to flawless execution."
        mobileLabel="Technical Board"
        className="py-16 sm:py-20 lg:py-24 bg-slate-50/60 border-t border-b border-slate-200/80 relative overflow-hidden isolate"
      />

      {/* ── 7. Group Consultation CTA ───────────────────────────────── */}
      <section className="relative py-20 sm:py-24 overflow-hidden bg-slate-50">
        <Container className="relative">
          <div className="max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-linear-to-br from-[#0D1B4B] via-[#102A66] to-[#0A1840] p-8 sm:p-12 lg:p-16 text-center shadow-2xl text-white">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-400/40 bg-blue-400/10 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              Direct Group Engagement
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
              Ready to Modernize With An Enterprise-Backed Partner?
            </h2>
            <p className="text-blue-100 text-base sm:text-lg mb-10 max-w-2xl mx-auto font-light">
              Connect with our senior engineering leadership. We evaluate technical feasibility, provide deterministic sprint estimates, and execute with institutional stability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/contact"
                className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue-dark text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all inline-flex items-center justify-center"
              >
                Schedule Technical Scoping Call
              </Link>
              <Link
                to="/services"
                className="w-full sm:w-auto text-white bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-3.5 rounded-xl font-semibold transition-all inline-flex items-center justify-center"
              >
                Browse Solutions Catalog
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 text-blue-200 text-xs font-medium">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Corporate Holding Backing
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% IP &amp; Source Code Ownership
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated Post-Delivery Warranty
              </span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}


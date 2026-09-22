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
  Heart,
  Code2,
  Handshake,
  Shield,
  ExternalLink,
  Sparkles,
  Building2,
} from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
import { useTeam } from '@/hooks/useTeam'
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
    desc: 'Direct repository visibility, deterministic milestones, zero hidden costs, and ISO-grade service level agreements.',
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

// Fallbacks (shown if DB empty)
const FALLBACK_MILESTONES = [
  {
    id: '1',
    year: '2019',
    title: 'Founding & Group Alignment',
    desc: 'Hindustan Projects establishes its dedicated IT & Digital Transformation Division in Bhilwara, Rajasthan to deliver world-class technology.',
  },
  {
    id: '2',
    year: '2021',
    title: 'Enterprise Delivery Milestone',
    desc: 'Delivered mission-critical web platforms and digital commerce infrastructure for 25+ regional businesses.',
  },
  {
    id: '3',
    year: '2023',
    title: 'Multi-Cloud & Mobile Expansion',
    desc: 'Launched dedicated practice verticals in AWS/GCP Cloud DevOps, Flutter/React Native mobile engineering, and SEO automation.',
  },
  {
    id: '4',
    year: '2024',
    title: 'National Enterprise Scale',
    desc: 'Crossed 50+ enterprise deliverables across India with zero downtime SLAs and 99.8% client retention.',
  },
  {
    id: '5',
    year: '2025',
    title: 'Snaptech Ecosystem Expansion',
    desc: 'Accelerating AI workflow automation, enterprise ERP integrations, and global digital modernization for enterprises.',
  },
]

const FALLBACK_TEAM = [
  {
    id: '1',
    name: 'Rahul Sharma',
    role: 'Managing Director & CEO',
    bio: 'Technologist with over a decade of leadership in distributed web architecture and corporate technology strategy.',
  },
  {
    id: '2',
    name: 'Priya Singh',
    role: 'Head of Engineering',
    bio: 'Full-stack engineering veteran specializing in React/Node.js microservices, database sharding, and cloud pipelines.',
  },
  {
    id: '3',
    name: 'Amit Verma',
    role: 'Chief Technology Architect',
    bio: 'Cloud and DevOps specialist driving high-availability AWS/GCP clusters and sub-second API execution.',
  },
  {
    id: '4',
    name: 'Sneha Joshi',
    role: 'Lead UI/UX & Design Systems',
    bio: 'Award-winning product designer creating high-fidelity interactive user experiences and scalable design tokens.',
  },
]

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.84v2.12h.05c.53-1 1.84-2.12 3.79-2.12 4.05 0 4.8 2.67 4.8 6.13V24h-4v-8.5c0-2.03-.04-4.63-2.82-4.63-2.83 0-3.26 2.2-3.26 4.48V24h-4V8.5z" />
    </svg>
  )
}

export default function AboutPage() {
  const { data: teamData, isLoading: teamLoading } = useTeam()
  const { data: milestonesData, isLoading: milestonesLoading } = useMilestones()
  const { data: settingsData } = useSiteSettings()

  const team = teamData?.data?.length ? teamData.data : teamLoading ? [] : FALLBACK_TEAM
  const milestones = milestonesData?.data?.length
    ? milestonesData.data
    : milestonesLoading
      ? []
      : FALLBACK_MILESTONES
  const cfg = settingsData?.data || {}

  const stats = [
    { value: `${cfg.stat_projects || '50'}+`, label: 'Enterprise Deliverables', sub: 'Production Deployed', icon: Rocket },
    { value: `${cfg.stat_clients || '40'}+`, label: 'Retained Enterprises', sub: 'Long-Term Partners', icon: Heart },
    { value: `${cfg.stat_experience || '5'}+`, label: 'Years Engineering', sub: 'Continuous Operation', icon: Award },
    { value: `${cfg.stat_cities || '3'}+`, label: 'Corporate Hubs', sub: 'Pan-India Reach', icon: MapPin },
  ]

  const parentUrl = cfg.parent_company_url || 'https://hindustanprojects.com'

  return (
    <div className="bg-[#020714] min-h-screen text-slate-100 selection:bg-brand-cyan/20 selection:text-brand-cyan">
      <SEO
        title="About Snaptech — IT & Technology Division of Hindustan Projects Group"
        description="Learn about Snaptech, the enterprise technology and software engineering company backed by Hindustan Projects Group. Custom Web Apps, Mobile, Cloud & AI."
        path="/about"
        keywords="Snaptech, Hindustan Projects IT, technology company Bhilwara, software company Rajasthan, about Snaptech, IT solutions India"
        schemas={[
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About Snaptech',
            url: 'https://www.snaptech.hindustanprojects.in/about',
            description:
              'Snaptech is the dedicated technology and digital transformation company of Hindustan Projects Group, delivering enterprise digital systems.',
          },
        ]}
      />

      {/* ── 1. Cyber Hero Header ───────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 overflow-hidden border-b border-white/10 bg-[#020714]">
        {/* Subtle mesh background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-cyan/15 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

        <Container className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                Hindustan Projects Group Enterprise Division
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold text-white leading-[1.12] mb-6">
                Next-Gen IT Engineering With{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-primary-light to-white">
                  Corporate Stability.
                </span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-light">
                Snaptech is the dedicated technology company of Hindustan Projects Group. We combine the agility of an elite software studio with the financial longevity, governance, and institutional backing of a premier corporate conglomerate.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  variant="primary"
                  size="lg"
                  as={Link}
                  to="/contact"
                  className="bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-brand-primary-dark hover:to-brand-cyan-dark text-white font-bold px-8 shadow-[0_0_25px_rgba(30,107,238,0.4)] border border-brand-cyan/40"
                >
                  Consult Our Technical Board
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  as={Link}
                  to="/portfolio"
                  className="text-white border border-white/20 hover:bg-white/10 backdrop-blur-md"
                >
                  Inspect Case Studies <ArrowRight className="w-4 h-4 ml-2 inline text-brand-cyan" />
                </Button>
              </div>
            </div>

            {/* Right: Institutional Governance Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-white/15 bg-slate-900/70 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-cyan" />
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Corporate Ecosystem
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 px-2.5 py-0.5 rounded-md bg-emerald-400/10 border border-emerald-400/20">
                    Group Verified
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                    <p className="text-xs font-mono text-brand-cyan uppercase tracking-wider mb-1">
                      Parent Conglomerate
                    </p>
                    <p className="text-base font-bold text-white font-heading">
                      Hindustan Projects Group
                    </p>
                    <p className="text-xs text-slate-400 mt-1 font-light">
                      Multi-disciplinary enterprise with established footprint in industrial development, real estate, and digital infrastructure.
                    </p>
                    <a
                      href={parentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-cyan hover:text-white mt-3 transition-colors"
                    >
                      Visit Corporate Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-4 rounded-xl border border-brand-cyan/30 bg-brand-cyan/[0.05]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-mono text-brand-cyan uppercase tracking-wider">
                        Technology Division
                      </p>
                      <span className="text-[10px] font-mono text-brand-cyan">Active Arm</span>
                    </div>
                    <p className="text-base font-bold text-white font-heading">
                      Snaptech IT Solutions
                    </p>
                    <p className="text-xs text-slate-300 mt-1 font-light">
                      Spearheading custom enterprise web portals, mobile ecosystems, automated DevOps, and strategic IT modernization.
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Headquarters: Bhilwara, RJ</span>
                  <span className="text-brand-cyan">ISO SLA Compliant</span>
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

      {/* ── 3. Corporate Heritage & Story ───────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#020714] relative">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&q=80&auto=format&fit=crop"
                  alt="Snaptech engineering team in collaborative session"
                  className="w-full h-96 object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020714] via-[#020714]/40 to-transparent" />

                {/* Badge bottom */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-primary/20 border border-brand-cyan/30 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-brand-cyan" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-brand-cyan uppercase tracking-wider">
                        Engineering Hub
                      </p>
                      <p className="text-xs text-white font-semibold">Bhilwara, Rajasthan, India</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-primary/20 text-white border border-brand-primary/30">
                    Est. 2019
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Narrative Story */}
            <div className="lg:col-span-7">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
                // INSTITUTIONAL NARRATIVE
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                Rooted in Rajasthan.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-white">
                  Executing Pan-India.
                </span>
              </h2>
              <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed font-light mb-8">
                <p>
                  Hindustan Projects founded Snaptech with a clear institutional conviction: enterprise-caliber IT architecture should not be monopolized by Tier-1 metropolitan agencies charging inflated retainer costs with opaque delivery timelines.
                </p>
                <p>
                  We recognized that growing industrial enterprises and innovative startups require a dependable, permanent technology partner — one with real corporate accountability, localized leadership, and world-class engineering discipline.
                </p>
                <p>
                  Today, Snaptech manages mission-critical web applications, high-throughput cloud infrastructure, and conversion-optimized digital platforms for over 40 enterprises, serving millions of end-users nationwide.
                </p>
              </div>

              {/* Mission & Vision Dual Glass Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden group hover:border-brand-cyan/40 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/20 border border-brand-cyan/30 flex items-center justify-center mb-3">
                    <Target className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-white mb-1.5 group-hover:text-brand-cyan transition-colors">
                    Our Core Mission
                  </h3>
                  <p className="text-xs text-slate-300/80 leading-relaxed font-light">
                    Deliver resilient, enterprise-grade software and digital systems that create lasting, measurable operational and revenue advantages for our clients.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden group hover:border-brand-cyan/40 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center mb-3">
                    <Eye className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-white mb-1.5 group-hover:text-brand-cyan transition-colors">
                    Our Strategic Vision
                  </h3>
                  <p className="text-xs text-slate-300/80 leading-relaxed font-light">
                    To be the foremost technology conglomerate in Western India, recognized for unmatched engineering fidelity, zero-downtime operations, and institutional reliability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 4. Core Values & Engineering Culture ───────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#03091e] border-t border-b border-white/10 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <Container className="relative">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
              // ARCHITECTURAL CODE
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              The Principles That Govern Our Code
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              These principles guide every architectural diagram, database query, pull request, and client milestone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className="group p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl
                  hover:border-brand-cyan/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]
                  hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/30 to-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <v.icon className="w-6 h-6 text-brand-cyan" strokeWidth={1.8} />
                </div>
                <h3 className="font-heading text-base font-bold text-white mb-2 group-hover:text-brand-cyan transition-colors">
                  {v.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed font-light">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 5. Corporate Milestones & Evolution Timeline ────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#020714] relative">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
              // VERIFIED TRACK RECORD
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              Key Milestones in Our Evolution
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              From our inception to becoming a multi-disciplinary enterprise technology practice.
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Luminous Vertical Neon Spine */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-cyan via-brand-primary to-transparent hidden sm:block shadow-[0_0_15px_rgba(6,182,212,0.5)]" />

            <div className="space-y-8">
              {(milestonesLoading ? Array.from({ length: 4 }) : milestones).map((m, i) =>
                milestonesLoading ? (
                  <div key={i} className="flex gap-6">
                    <div className="hidden sm:block w-16 h-16 rounded-full bg-white/10 animate-pulse shrink-0" />
                    <div className="flex-1 h-20 bg-slate-900/60 rounded-2xl border border-white/10 animate-pulse" />
                  </div>
                ) : (
                  <div key={m.id || i} className="flex gap-6 group">
                    {/* Glowing Node Marker */}
                    <div className="hidden sm:flex flex-col items-center shrink-0">
                      <div className="w-16 h-16 rounded-2xl border border-brand-cyan/50 bg-slate-900 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)] group-hover:border-brand-cyan group-hover:bg-brand-primary/20 transition-all duration-300">
                        <span className="text-xs font-mono font-bold text-brand-cyan group-hover:text-white transition-colors leading-none">
                          {m.year}
                        </span>
                      </div>
                    </div>

                    {/* Milestone Card */}
                    <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl group-hover:border-brand-cyan/40 group-hover:bg-slate-900/90 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="sm:hidden text-xs font-mono font-bold text-brand-cyan">
                          {m.year} //
                        </span>
                        <h3 className="font-heading text-base sm:text-lg font-bold text-white group-hover:text-brand-cyan transition-colors">
                          {m.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-300/80 leading-relaxed font-light">
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

      {/* ── 6. Leadership & Engineering Squad ───────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#03091e] border-t border-b border-white/10 relative">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
              // EXECUTIVE DIRECTORS & ARCHITECTS
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              Meet The Technical Board
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              A seasoned collective of technologists, systems architects, and product leads committed to flawless execution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-72 bg-slate-900/60 rounded-2xl border border-white/10 animate-pulse" />
                ))
              : team.map((member) => {
                  const initials = member.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()

                  return (
                    <div
                      key={member.id}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-center
                        backdrop-blur-xl hover:border-brand-cyan/50 hover:shadow-[0_0_35px_rgba(6,182,212,0.18)]
                        hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center"
                    >
                      {/* Avatar with Cyber Neon Ring */}
                      <div className="relative mb-5 mx-auto w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-primary to-brand-cyan blur-md opacity-30 group-hover:opacity-75 transition-opacity duration-500" />
                        <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-brand-primary via-white/20 to-brand-cyan">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="w-20 h-20 rounded-full object-cover shadow-inner"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                              <span className="font-heading text-lg font-extrabold text-brand-cyan">
                                {initials}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <h3 className="font-heading text-lg font-bold text-white group-hover:text-brand-cyan transition-colors duration-300">
                        {member.name}
                      </h3>
                      <p className="text-xs font-mono font-semibold text-brand-cyan uppercase tracking-wider mt-1 mb-3">
                        {member.role}
                      </p>
                      {member.bio && (
                        <p className="text-xs text-slate-300/80 leading-relaxed mb-5 line-clamp-3 font-light">
                          {member.bio}
                        </p>
                      )}

                      {/* LinkedIn / Profile */}
                      {member.linkedinUrl && (
                        <div className="mt-auto">
                          <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} on LinkedIn`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-slate-300 bg-white/5 hover:bg-brand-cyan/15 hover:text-brand-cyan border border-white/10 hover:border-brand-cyan/40 transition-all duration-300"
                          >
                            <LinkedInIcon />
                            <span>Verified Profile</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )
                })}
          </div>
        </Container>
      </section>

      {/* ── 7. Group Consultation CTA ───────────────────────────────── */}
      <section className="relative py-20 sm:py-24 overflow-hidden bg-[#020714]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(30,107,238,0.25),transparent_70%)] pointer-events-none" />

        <Container className="relative">
          <div className="max-w-4xl mx-auto rounded-3xl border border-brand-cyan/30 bg-gradient-to-b from-slate-900/90 to-[#020714] p-8 sm:p-12 lg:p-16 text-center backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.12)]">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan text-xs font-semibold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              Direct Group Engagement
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
              Ready to Modernize With An Enterprise-Backed Partner?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto font-light">
              Connect with our senior engineering leadership. We evaluate technical feasibility, provide deterministic sprint estimates, and execute with institutional stability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="primary"
                size="lg"
                as={Link}
                to="/contact"
                className="w-full sm:w-auto bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-brand-primary-dark hover:to-brand-cyan-dark text-white font-bold px-8 shadow-[0_0_25px_rgba(30,107,238,0.4)]"
              >
                Schedule Technical Scoping Call
              </Button>
              <Button
                variant="ghost"
                size="lg"
                as={Link}
                to="/services"
                className="w-full sm:w-auto text-white border border-white/20 hover:bg-white/10"
              >
                Browse Solutions Catalog
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 text-slate-300 text-xs font-mono">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Corporate Holding Backing
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% IP & Source Code Ownership
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


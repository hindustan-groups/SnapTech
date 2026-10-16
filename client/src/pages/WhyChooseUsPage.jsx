import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Check,
  X,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Award,
  ArrowRight,
  Calculator,
  MessageSquare,
  Sparkles,
  HeartHandshake,
  Code2,
  Cpu,
  GitBranch,
  Clock,
  FileCheck,
  Coins,
  ChevronDown,
} from 'lucide-react'
import { Container, SEO } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'

const COMPARISON_ROWS = [
  {
    dimension: 'Architecture & Tech Stack',
    snaptech: 'Modern React, Vite, Node.js, Tailwind, modular zero-bloat code',
    freelancers: 'Random mix of templates, often outdated scripts or unvetted libraries',
    agencies: 'Heavy legacy WordPress or bloated monolithic CMS stacks',
    highlight: true,
  },
  {
    dimension: 'Delivery Velocity & Sprints',
    snaptech: '2 to 4 weeks agile sprints with weekly live demo checkpoints',
    freelancers: 'Unpredictable timelines, frequent delays, and sudden scope drop-offs',
    agencies: '8 to 16 weeks sluggish waterfall cycles and endless bureaucratic meetings',
    highlight: true,
  },
  {
    dimension: 'Full Source Code Ownership',
    snaptech: '100% full Git repository, CI/CD pipelines, and DB schema handed over',
    freelancers: 'Often held hostage in personal freelancer GitHub accounts',
    agencies: 'Proprietary vendor lock-in with ongoing monthly lease traps',
    highlight: true,
  },
  {
    dimension: 'Core Web Vitals & Speed',
    snaptech: 'Optimized Core Web Vitals, global edge CDN caching, and lightweight assets',
    freelancers: 'Untested, heavy uncompressed images, typically 40–60 scores',
    agencies: 'Overloaded with heavy tracking tags and slow plugin stacks',
    highlight: true,
  },
  {
    dimension: 'Enterprise Security & Hardening',
    snaptech: 'OWASP Top 10 hardening, input sanitization, and pre-launch security audits',
    freelancers: 'Basic or non-existent security reviews, SQL injection risks',
    agencies: 'Basic security, expensive extra charges for compliance checklists',
    highlight: false,
  },
  {
    dimension: 'Pricing & Milestone Billing',
    snaptech: '100% transparent milestone-based fixed price; zero hidden fees',
    freelancers: 'Low upfront quote followed by sudden abandonment or scope disputes',
    agencies: 'Massive enterprise markups (3x–5x) with billed "strategy meetings"',
    highlight: true,
  },
  {
    dimension: 'Search Engine & AI Optimization (AEO)',
    snaptech: 'Rich JSON-LD schemas, Perplexity/ChatGPT crawler optimization, semantic HTML',
    freelancers: 'Minimal meta title tags or ignored entirely',
    agencies: 'Separate high-cost monthly retainer required for basic keyword SEO',
    highlight: false,
  },
  {
    dimension: 'Dedicated Engineering Pod',
    snaptech: 'Assigned Solution Architect & dedicated full-stack engineering pod',
    freelancers: 'Single overworked point of failure with no peer reviews',
    agencies: 'Account manager middleman; work outsourced to junior interns',
    highlight: false,
  },
  {
    dimension: 'Post-Launch Support & Monitoring',
    snaptech: 'Included 30-day post-launch support with health monitoring and defect resolution',
    freelancers: 'Ghosting once final invoice payment is cleared',
    agencies: 'Expensive mandatory annual maintenance contracts ($500+/mo)',
    highlight: false,
  },
  {
    dimension: 'Privacy & Data Governance',
    snaptech: 'Built-in privacy architecture aligned with DPDP Act 2023 and GDPR guidelines',
    freelancers: 'Ignored, creates regulatory vulnerability for your business',
    agencies: 'Basic checkbox without actual data lifecycle policies',
    highlight: false,
  },
]

const KEY_PILLARS = [
  {
    icon: GitBranch,
    title: '100% Code Ownership & Zero Lock-in',
    badge: 'Code Freedom',
    desc: 'You own every line of code, Dockerfile, database migration script, and design system. We never host your business on secret proprietary servers or lock you into lease agreements.',
    bullets: [
      'Full GitHub / GitLab repo transfer',
      'Clean modular architecture with documentation',
      'Deployable on AWS, GCP, Vercel, or VPS',
    ],
  },
  {
    icon: Zap,
    title: 'High-Performance Edge Architecture',
    badge: 'High Performance',
    desc: 'No bloated themes or unmaintained plugins. We engineer platforms with modern React, Vite, Node.js, and edge CDN caching for fast, responsive page loads that maximize conversions.',
    bullets: [
      'Targeted Core Web Vitals optimization',
      'Edge CDN caching & modern image compression',
      'Fast initial server response and asset delivery',
    ],
  },
  {
    icon: Coins,
    title: 'Transparent Fixed Milestone Pricing',
    badge: 'Zero Hidden Fees',
    desc: 'We provide itemized, predictable proposals before line one of code is written. You only pay for verified working milestones—never for ambiguous exploratory meetings or open-ended hourly billing.',
    bullets: [
      'Upfront milestone deliverables schedule',
      'Zero surprise change-order fees',
      'Escrow & phased payment protection',
    ],
  },
  {
    icon: HeartHandshake,
    title: 'Direct Senior Architect Access',
    badge: 'Engineering Pod',
    desc: 'You never get passed off to non-technical account managers. You collaborate directly with Senior Engineers and Solution Architects who understand scalable system design, APIs, and business metrics.',
    bullets: [
      'Dedicated lead architect on your Slack/WhatsApp',
      'Weekly live staging demo calls',
      'Prompt direct technical response and updates',
    ],
  },
]

const COMMITMENTS = [
  {
    icon: ShieldCheck,
    title: '30-Day Post-Launch Support',
    desc: 'Every milestone deliverable undergoes thorough testing before handover, followed by an included 30-day post-launch bug fixing and support window.',
  },
  {
    icon: FileCheck,
    title: 'Formal NDA & IP Assignment',
    desc: 'Before project initiation, we execute mutual non-disclosure and intellectual property assignment agreements so your trade secrets remain strictly yours.',
  },
  {
    icon: Cpu,
    title: '24/7 Production Telemetry',
    desc: 'Live telemetry tracking error rates, server memory, database query health, and response latency with instant engineering alerts.',
  },
]

export default function WhyChooseUsPage() {
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}
  const rawWa = cfg.whatsapp || cfg.phone || '+91 8209604849'
  const cleanWa = rawWa.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    'Hi SnapTech Digital! I am reviewing the Why SnapTech comparison and would like to discuss my project requirements.'
  )}`

  const [activeTab, setActiveTab] = useState('all')

  const filteredRows =
    activeTab === 'highlights'
      ? COMPARISON_ROWS.filter((r) => r.highlight)
      : COMPARISON_ROWS

  return (
    <>
      <SEO
        title="Why Choose SnapTech Digital | Agency vs Freelancer Comparison"
        description="Discover why leading brands choose SnapTech Digital over traditional agencies and freelancers. 100% code ownership, high performance, and transparent fixed milestone pricing."
        path="/why-snaptech"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Why SnapTech', path: '/why-snaptech' },
        ]}
        keywords="why snaptech digital, best web agency india, web development agency comparison, software engineering partner, hire web developers rajasthan"
      />

      <div className="bg-slate-50 text-slate-900 min-h-screen pt-24 pb-20 selection:bg-brand-blue selection:text-white">
        {/* ── 1. Top Hero Section ── */}
        <section className="relative pt-12 pb-16 lg:pt-18 lg:pb-24 overflow-hidden bg-linear-to-b from-blue-50/70 via-white to-slate-50/50 border-b border-slate-200/80">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/60 rounded-full filter blur-3xl pointer-events-none -z-10 animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-50/70 rounded-full filter blur-3xl pointer-events-none -z-10" />

          <Container>
            <div className="text-center max-w-3xl mx-auto space-y-5">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 shadow-xs text-brand-blue text-xs font-bold uppercase tracking-wider"
              >
                <Award className="w-4 h-4 text-brand-blue" />
                <span>The Engineering Standard // SnapTech vs Others</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 tracking-tight leading-[1.12]"
              >
                Why High-Growth Brands{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-600">
                  Choose SnapTech
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
              >
                Tired of sluggish 16-week agency retainers or unreliable freelancers? Here is how our production-grade engineering model delivers 100% code ownership, optimized performance, and predictable milestone ROI.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
              >
                <a
                  href="#comparison-matrix"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-blue hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>See Comparison Matrix</span>
                  <ChevronDown className="w-4 h-4" />
                </a>

                <Link
                  to="/cost-calculator"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-blue-50/70 text-slate-800 hover:text-brand-blue border border-slate-200 font-bold text-sm shadow-xs hover:shadow transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Calculator className="w-4 h-4 text-brand-blue" />
                  <span>Estimate Project Cost</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-100" />
                  <span>Chat With Architect</span>
                </a>
              </motion.div>

              {/* Trust Badges Strip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Code Ownership
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Optimized Performance
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fixed Milestone Quotes
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 30-Day Launch Support
                </span>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* ── 2. Live Engineering Metrics Ribbon ── */}
        <section className="py-10 -mt-6">
          <Container>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  metric: '100%',
                  label: 'Source Code Ownership',
                  sub: 'Full Git vault, schemas & CI/CD handed over',
                  icon: Code2,
                  color: 'text-brand-blue',
                  bg: 'bg-blue-50 border-blue-200',
                },
                {
                  metric: '< 1s',
                  label: 'Target Load Time',
                  sub: 'Optimized bundle size and global edge CDN caching',
                  icon: Zap,
                  color: 'text-amber-500',
                  bg: 'bg-amber-50 border-amber-200',
                },
                {
                  metric: '2–4 Wks',
                  label: 'Agile Sprint Velocity',
                  sub: 'Weekly demo checkpoints with zero black-box delays',
                  icon: Clock,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50 border-emerald-200',
                },
                {
                  metric: '30 Days',
                  label: 'Post-Launch Support',
                  sub: 'Included defect resolution & deployment monitoring',
                  icon: ShieldCheck,
                  color: 'text-indigo-600',
                  bg: 'bg-indigo-50 border-indigo-200',
                },
              ].map((item, idx) => {
                const IconComp = item.icon
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.08 }}
                    className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md hover:border-brand-blue/30 transition-all text-center flex flex-col items-center justify-between"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-3 ${item.bg}`}>
                      <IconComp className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                        {item.metric}
                      </p>
                      <p className="text-sm font-heading font-bold text-slate-800 mt-1">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {item.sub}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Container>
        </section>

        {/* ── 3. Systematic Comparison Table ── */}
        <section id="comparison-matrix" className="py-14 sm:py-20 scroll-mt-24">
          <Container>
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-blue">
                // TRANSPARENT ARCHITECTURAL AUDIT
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                Side-by-Side Comparison
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Every critical dimension that separates production-grade software engineering from hobbyist code or legacy agency retainers.
              </p>

              {/* Filter Tabs */}
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All 10 Dimensions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('highlights')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'highlights'
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Key Highlights Only
                </button>
              </div>
            </div>

            {/* Desktop & Tablet Table */}
            <div className="hidden sm:block overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xl">
              <table className="w-full text-left border-collapse min-w-190">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-5 px-6 bg-slate-50/90 text-slate-700 font-heading font-extrabold text-xs uppercase tracking-wider w-1/4">
                      Engineering Dimension
                    </th>
                    <th className="py-5 px-6 bg-linear-to-b from-brand-blue to-blue-700 text-white font-heading font-extrabold text-sm w-1/3 text-center shadow-inner relative">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono uppercase tracking-wider mb-1">
                        <Sparkles className="w-3 h-3 text-cyan-300" />
                        Recommended Tier
                      </div>
                      <div className="text-base font-extrabold tracking-wide">SnapTech Digital</div>
                    </th>
                    <th className="py-5 px-6 bg-slate-50/90 text-slate-600 font-heading font-bold text-xs uppercase tracking-wider w-1/5 text-center">
                      Freelancers
                    </th>
                    <th className="py-5 px-6 bg-slate-50/90 text-slate-600 font-heading font-bold text-xs uppercase tracking-wider w-1/5 text-center">
                      Traditional Agencies
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80 transition-colors' : 'bg-slate-50/30 hover:bg-slate-50/80 transition-colors'}
                    >
                      {/* Dimension Name */}
                      <td className="py-4.5 px-6 font-heading font-bold text-slate-900">
                        {row.dimension}
                      </td>

                      {/* SnapTech Column */}
                      <td className="py-4.5 px-6 bg-blue-50/40 border-x-2 border-blue-200/90 text-slate-900 font-medium">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-semibold text-slate-900">{row.snaptech}</span>
                        </div>
                      </td>

                      {/* Freelancers Column */}
                      <td className="py-4.5 px-6 text-slate-600">
                        <div className="flex items-start gap-2">
                          <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span>{row.freelancers}</span>
                        </div>
                      </td>

                      {/* Traditional Agencies Column */}
                      <td className="py-4.5 px-6 text-slate-600">
                        <div className="flex items-start gap-2">
                          <X className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{row.agencies}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards (clean stacked view for mobile phones) */}
            <div className="sm:hidden space-y-4">
              {filteredRows.map((row, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
                >
                  <h3 className="font-heading text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                    {row.dimension}
                  </h3>

                  {/* SnapTech */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue block">
                      SnapTech Digital:
                    </span>
                    <div className="flex items-start gap-2 text-xs font-semibold text-slate-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{row.snaptech}</span>
                    </div>
                  </div>

                  {/* Others Side by Side */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                        Freelancers:
                      </span>
                      <p className="text-slate-600 flex items-start gap-1">
                        <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{row.freelancers}</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                        Agencies:
                      </span>
                      <p className="text-slate-600 flex items-start gap-1">
                        <X className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{row.agencies}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── 4. Four Core Architectural Pillars ── */}
        <section className="py-14 sm:py-20 bg-white border-y border-slate-200/80">
          <Container>
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-blue">
                // WHY WE WIN
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                Our 4 Architectural Pillars
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Engineered from day zero to eliminate the four greatest frustrations clients experience with software development vendors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {KEY_PILLARS.map((pillar, idx) => {
                const IconComp = pillar.icon
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="p-7 sm:p-8 rounded-3xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-brand-blue/40 shadow-xs hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-brand-blue flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-xs">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-mono font-bold uppercase tracking-wider border border-slate-200 shadow-2xs">
                          {pillar.badge}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-brand-blue transition-colors mb-2.5">
                        {pillar.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-slate-600 leading-relaxed mb-5">
                        {pillar.desc}
                      </p>
                    </div>

                    {/* Bullet Points */}
                    <div className="pt-4 border-t border-slate-200 space-y-2">
                      {pillar.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Container>
        </section>

        {/* ── 5. Enterprise Client Commitments ── */}
        <section className="py-14 sm:py-20 bg-slate-50">
          <Container>
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-blue">
                // RISK-FREE COLLABORATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
                Contract-Backed Commitments
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Every project is governed by clearly documented milestone scopes, IP transfer agreements, and dedicated post-launch support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COMMITMENTS.map((item, idx) => {
                const IconComp = item.icon
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-shadow space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-blue">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </Container>
        </section>

        {/* ── 6. Conversion Bottom CTA Banner ── */}
        <section className="py-12 sm:py-16">
          <Container>
            <div className="p-8 sm:p-14 rounded-3xl bg-linear-to-br from-[#0a1945] via-[#0D1B4B] to-[#1a3e8c] text-white shadow-2xl relative overflow-hidden border border-blue-800/50 text-center max-w-4xl mx-auto space-y-6">
              <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-mono font-bold text-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Ready to Experience the SnapTech Difference?</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
                Calculate Your Cost or Connect With An Architect Today
              </h2>

              <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
                Get an instant estimate in under 60 seconds with our interactive calculator, or reach our technical desk directly on WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
                <Link
                  to="/cost-calculator"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-[#0a1945] font-heading font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-brand-blue" />
                  <span>Launch Cost Calculator</span>
                  <ArrowRight className="w-4 h-4 text-brand-blue" />
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-100" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              <div className="pt-2 text-xs text-blue-200/80">
                <span>Looking for fixed packages? </span>
                <Link to="/pricing" className="text-white font-bold hover:underline">
                  View Transparent Pricing Tiers →
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  )
}

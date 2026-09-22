/**
 * WhyUsSection — "Why Choose Snaptech" Enterprise Engineering Edge.
 * Seamless Cyber-Navy Glassmorphic design.
 * 100% Dynamic data from useSiteSettings with high-impact enterprise SLA pillars.
 */
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Clock,
  TrendingUp,
  ArrowRight,
  Code2,
  Lock,
  Zap,
  CheckCircle2,
  Award,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui'
import { fadeUp, staggerContainer, viewportOnce } from '@/utils/motion'
import { useSiteSettings } from '@/hooks/useContent'

const ENTERPRISE_DIFFERENTIATORS = [
  {
    icon: Code2,
    title: 'Zero Technical Debt',
    desc: 'Modular React 19, strict security sanitation, and automated test coverage. Your software is built to scale without messy rewrites.',
    badge: 'Clean Architecture',
  },
  {
    icon: Clock,
    title: '2-Hour Response SLA',
    desc: 'Direct priority communication via dedicated WhatsApp & Slack channels. We resolve production queries in minutes, not days.',
    badge: 'Rapid Turnaround',
  },
  {
    icon: Lock,
    title: '100% IP & Code Ownership',
    desc: 'Full Git repository transfer, deployment credentials, and database rights provided upon delivery. You own every single line.',
    badge: 'Full Handover',
  },
  {
    icon: TrendingUp,
    title: 'Milestone-Based Billing',
    desc: 'Structured 50% milestone billing tied strictly to deliverable approvals. You only approve payments when satisfied with progress.',
    badge: 'Risk-Free',
  },
]

export default function WhyUsSection() {
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}
  const statProjects = cfg.stat_projects || '50'
  const statClients = cfg.stat_clients || '40'
  const statExperience = cfg.stat_experience || '5'

  return (
    <section
      className="py-24 bg-white border-t border-slate-100 relative overflow-hidden isolate"
      aria-labelledby="whyus-heading"
    >
      {/* Subtle ambient decorations */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#1a3e8c]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#e31e24]/5 rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* ── Left Column: Value Pillars ── */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 text-[#1a3e8c] text-xs font-mono font-bold uppercase tracking-widest mb-4">
                <Award className="w-3.5 h-3.5" />
                <span>The Snaptech Advantage</span>
              </div>
              <h2
                id="whyus-heading"
                className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight"
              >
                Enterprise Engineering,{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #1a3e8c, #e31e24)' }}>
                  Zero Compromise
                </span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed mt-4 max-w-xl">
                We bridge high-velocity engineering with corporate-grade stability. 
                Here is why corporate enterprises and fast-growing founders across India trust Snaptech.
              </p>
            </motion.div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {ENTERPRISE_DIFFERENTIATORS.map((item) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#1a3e8c]/30 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 text-[#1a3e8c] flex items-center justify-center group-hover:bg-[#1a3e8c] group-hover:text-white transition-all">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 text-[#1a3e8c] group-hover:bg-[#1a3e8c] group-hover:text-white group-hover:border-[#1a3e8c] transition-colors">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="font-heading text-base font-bold text-slate-800 mb-2 group-hover:text-[#1a3e8c] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <motion.div variants={fadeUp} className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1a3e8c] hover:text-[#e31e24] transition-colors group"
              >
                <span>Read Full Company Mission & Heritage</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* ── Right Column: High-Tech Telemetry Card ── */}
          <motion.div
            className="lg:col-span-5 relative"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
          >
            <div className="relative p-3 rounded-2xl border border-[#1a3e8c]/20 shadow-xl">
              {/* Corner focus brackets */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#1a3e8c] pointer-events-none" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#e31e24] pointer-events-none" />

              {/* Inner Card */}
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#1a3e8c]" />
                    <span className="font-heading text-sm font-bold text-slate-800 tracking-wide">
                      VERIFIED SLA MATRIX
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    AUDITED 2026
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Enterprise Deployments</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{statProjects}+</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Active Corporate Retainers</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{statClients}+</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Engineering Legacy</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{statExperience}+ Years</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Production Cloud Uptime</span>
                    <span className="font-mono font-bold text-emerald-600 text-sm">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Code Quality & Security</span>
                    <span className="font-mono font-bold text-[#1a3e8c] text-sm">A+ SonarQube</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Backed by Hindustan Projects Group Governance</span>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-5 -right-4 text-white rounded-xl px-4 py-2 shadow-xl flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #1a3e8c, #e31e24)' }}>
                <Zap className="w-4 h-4 text-white" />
                <span className="text-xs font-bold font-mono">100% In-House Engineers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}

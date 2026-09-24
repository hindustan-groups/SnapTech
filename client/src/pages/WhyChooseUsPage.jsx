import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Check,
  X,
  ShieldCheck,
  Zap,
  Award,
  ArrowRight,
  Calculator,
  MessageSquare,
  Sparkles,
  HeartHandshake,
} from 'lucide-react'
import { Container, SEO } from '@/components/ui'

const COMPARISON_ROWS = [
  {
    dimension: 'Architecture & Tech Stack',
    snaptech: 'Modern React, Vite, Node.js, Tailwind, clean modular code',
    freelancers: 'Random mix of templates, often outdated scripts',
    agencies: 'Heavy legacy WordPress or bloated monolithic CMS',
    highlight: true,
  },
  {
    dimension: 'Delivery Velocity & Sprints',
    snaptech: '2 to 4 weeks agile sprints with weekly live demo checkpoints',
    freelancers: 'Unpredictable, frequent delays and scope drop-offs',
    agencies: '8 to 16 weeks sluggish waterfall cycles and bureaucratic meetings',
    highlight: true,
  },
  {
    dimension: 'Full Source Code Ownership',
    snaptech: '100% full Git repository, CI/CD, and DB schema handed over',
    freelancers: 'Often hostage to personal freelancer GitHub accounts',
    agencies: 'Proprietary vendor lock-in with ongoing monthly lease traps',
    highlight: true,
  },
  {
    dimension: 'Core Web Vitals & Speed',
    snaptech: 'Guaranteed 95+ PageSpeed scores, sub-second global CDN load',
    freelancers: 'Untested, heavy uncompressed images, 40-60 score',
    agencies: 'Overloaded with heavy tracking tags and slow plugin stacks',
    highlight: true,
  },
  {
    dimension: 'Enterprise Security & Audit',
    snaptech: 'OWASP Top 10 hardened, sanitized inputs, zero-vulnerability warranty',
    freelancers: 'Basic or non-existent security reviews, SQL injection risks',
    agencies: 'Basic security, extra charge for compliance certifications',
    highlight: false,
  },
  {
    dimension: 'Pricing & Milestone Billing',
    snaptech: '100% transparent milestone-based fixed price; zero hidden fees',
    freelancers: 'Low upfront quote followed by sudden abandonment or scope disputes',
    agencies: 'Massive enterprise markups (3x-5x) with billed "strategy meetings"',
    highlight: true,
  },
  {
    dimension: 'Search Engine & AI Optimization (AEO)',
    snaptech: 'Rich JSON-LD schemas, Perplexity/ChatGPT crawler optimization, semantic HTML',
    freelancers: 'Minimal meta title tags or ignored entirely',
    agencies: 'Separate high-cost monthly retainer for basic keyword SEO',
    highlight: false,
  },
  {
    dimension: 'Dedicated Engineering Pod',
    snaptech: 'Assigned Solution Architect & dedicated full-stack engineering pod',
    freelancers: 'Single overworked point of failure',
    agencies: 'Account manager middleman; work outsourced to junior interns',
    highlight: false,
  },
  {
    dimension: 'Post-Launch SLA & Monitoring',
    snaptech: 'Included warranty with 24/7 automated telemetry & 99.8% uptime SLA',
    freelancers: 'Ghosting once final payment is completed',
    agencies: 'Expensive mandatory annual maintenance contracts ($500+/mo)',
    highlight: false,
  },
  {
    dimension: 'Privacy & DPDP Act 2023',
    snaptech: 'Built-in DPDP 2023 & GDPR consent architecture, zero legal liability',
    freelancers: 'Ignored, creates regulatory vulnerability',
    agencies: 'Basic checkbox without actual data lifecycle policies',
    highlight: false,
  },
]

export default function WhyChooseUsPage() {
  return (
    <>
      <SEO
        title="Why Choose SnapTech Digital | Agency vs Freelancer Comparison"
        description="Discover why leading brands choose SnapTech Digital over traditional agencies and freelancers. 100% code ownership, sub-second speed, and transparent fixed milestone pricing."
        keywords="why snaptech digital, best web agency india, web development agency comparison, software engineering partner"
        canonical="https://www.snaptech.digital/why-snaptech"
      />

      <div className="bg-bg-base text-text-primary min-h-screen pt-24 pb-20 selection:bg-cyan-500 selection:text-black">
        {/* ── Top Hero ── */}
        <section className="relative overflow-hidden py-14 sm:py-20">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-160 h-80 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

          <Container>
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider"
              >
                <Award className="w-4 h-4" />
                <span>The Engineering Standard</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight"
              >
                Why Ambitious Brands{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  Choose SnapTech
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto"
              >
                Tired of sluggish 16-week agency retainers or unreliable freelancers? Here is how our production-grade engineering model gives you total code ownership and rapid ROI.
              </motion.p>
            </div>
          </Container>
        </section>

        {/* ── Value Metrics Ribbon ── */}
        <section className="pb-12">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { metric: '100+', label: 'Shipped Systems', sub: 'Production platforms' },
                { metric: '95+', label: 'PageSpeed Score', sub: 'Core Web Vitals optimized' },
                { metric: '100%', label: 'Code Ownership', sub: 'Full Git vault handed over' },
                { metric: '4 to 24h', label: 'Response SLA', sub: 'Guaranteed architect support' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md text-center"
                >
                  <p className="text-2xl sm:text-3xl font-heading font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">
                    {item.metric}
                  </p>
                  <p className="text-xs sm:text-sm font-heading font-bold text-white mt-1">{item.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Systematic Comparison Table ── */}
        <section className="py-12">
          <Container>
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                Detailed Side-by-Side Comparison
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Every critical dimension that separates enterprise engineering from hobbyist code.
              </p>
            </div>

            {/* Responsive Table Container */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/80 text-xs uppercase tracking-wider font-mono">
                    <th className="py-4 px-6 text-slate-400 font-semibold w-1/4">Engineering Dimension</th>
                    <th className="py-4 px-6 text-cyan-400 font-bold w-1/3 bg-cyan-950/20 border-x border-cyan-500/20">
                      SnapTech Digital
                    </th>
                    <th className="py-4 px-6 text-slate-400 font-semibold w-1/5">Freelancers</th>
                    <th className="py-4 px-6 text-slate-400 font-semibold w-1/5">Traditional Agencies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr
                      key={idx}
                      className={row.highlight ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'}
                    >
                      <td className="py-4 px-6 font-heading font-semibold text-white">
                        {row.dimension}
                      </td>
                      <td className="py-4 px-6 font-medium text-cyan-200 bg-cyan-950/20 border-x border-cyan-500/20">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{row.snaptech}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        <div className="flex items-start gap-2">
                          <X className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                          <span>{row.freelancers}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        <div className="flex items-start gap-2">
                          <X className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
                          <span>{row.agencies}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        {/* ── Key Advantages Deep Dive ── */}
        <section className="py-16 border-t border-white/10 bg-slate-950/40">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white">Zero Vendor Lock-in</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We believe you should own what you pay for. We don't host your website on secret proprietary systems. You receive clean Git repos and deployment instructions so any engineer can maintain it.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white">Next-Gen React &amp; Cloud</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No sluggish themes or unmaintained WordPress plugins. We build with React, modern CSS, Node.js, and edge networks for sub-second page loads that delight users and dominate search rankings.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white">Direct Architect Access</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You won't get passed off to non-technical account managers. You collaborate directly with Senior Engineers and Solution Architects who understand system design, APIs, and business metrics.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* ── Conversion Bottom CTA ── */}
        <section className="py-16">
          <Container>
            <div className="p-8 sm:p-12 rounded-3xl bg-linear-to-r from-blue-950/60 via-slate-900/90 to-cyan-950/60 border border-cyan-500/30 text-center max-w-4xl mx-auto space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-xs font-mono text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready to Build Something Remarkable?</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
                Calculate Your Cost or Connect With An Architect Today
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Get an instant estimate in under 60 seconds with our interactive calculator, or reach our technical desk directly on WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link
                  to="/cost-calculator"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-heading font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Launch Cost Calculator</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="https://wa.me/919414112057?text=Hi%20SnapTech%20Digital,%20I%20would%20like%20to%20discuss%20my%20project%20scope"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-heading font-bold text-xs sm:text-sm transition-all border border-white/15 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  )
}

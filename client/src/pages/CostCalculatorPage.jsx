import { motion } from 'framer-motion'
import {
  Calculator,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  FileCode,
  Zap,
} from 'lucide-react'
import { Container, SEO } from '@/components/ui'
import CostCalculator from '@/components/calculator/CostCalculator'

const CALCULATOR_FAQS = [
  {
    q: 'How accurate is this interactive cost calculator?',
    a: 'Our calculator uses real-world engineering sprint metrics based on over 100+ delivered systems. The estimated range represents an accurate baseline for standard and enterprise scope without surprise post-launch billing.',
  },
  {
    q: 'Do I get 100% ownership of the source code?',
    a: 'Yes. Upon final milestone sign-off, all full-stack source code, GitHub repository permissions, Figma design assets, database schemas, and DNS configs are 100% transferred to your company.',
  },
  {
    q: 'What is the standard payment milestone structure?',
    a: 'We work on transparent, risk-free milestones: 40% upon architecture and wireframe sign-off (Sprint 0), 40% upon staging server demo & feature completion, and 20% upon production deployment and telemetry verification.',
  },
  {
    q: 'Can we customize or modify the scope midway?',
    a: 'Absolutely. We operate under Agile 2-week sprint cycles. Any new module requests are scoped with a clear time/cost delta before implementation, ensuring total predictability.',
  },
]

export default function CostCalculatorPage() {
  return (
    <>
      <SEO
        title="Interactive Website Cost Calculator &amp; Pricing Estimator"
        description="Estimate website, custom SaaS web app, and e-commerce platform development costs instantly with SnapTech Digital's transparent engineering calculator."
        keywords="website cost calculator india, web development pricing, software development cost estimator, snaptech digital pricing"
        canonical="https://www.snaptech.digital/cost-calculator"
      />

      <div className="bg-bg-base text-text-primary min-h-screen pt-24 pb-20 selection:bg-cyan-500 selection:text-black">
        {/* ── Top Hero ── */}
        <section className="relative overflow-hidden py-12 sm:py-16">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-150 h-75 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <Container>
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-xs font-semibold text-cyan-400 font-mono uppercase tracking-wider"
              >
                <Calculator className="w-4 h-4" />
                <span>Zero-Surprise Pricing Matrix</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight"
              >
                Calculate Your Digital Project{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
                  Investment in Seconds
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto"
              >
                Select your required architecture, pages, and integrations below. Get an immediate itemized cost estimate backed by guaranteed engineering milestones.
              </motion.p>
            </div>
          </Container>
        </section>

        {/* ── Interactive Calculator Component ── */}
        <section className="relative z-10 pb-16">
          <Container>
            <CostCalculator />
          </Container>
        </section>

        {/* ── Value Pillars ── */}
        <section className="py-12 border-t border-white/10 bg-slate-950/40">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Fixed-Price Guarantee',
                  desc: 'Once your scope is approved, the price is locked. No surprise maintenance bills or hidden licensing fees.',
                },
                {
                  icon: FileCode,
                  title: 'Complete Source Code Rights',
                  desc: 'Full Git repository, CI/CD pipeline definitions, and database schemas handed over upon project launch.',
                },
                {
                  icon: Zap,
                  title: 'Sub-Second Core Web Vitals',
                  desc: 'Engineered for 95+ PageSpeed scores, instant mobile loading, and search engine priority.',
                },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-heading font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </Container>
        </section>

        {/* ── FAQ Section ── */}
        <section className="py-16">
          <Container>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-2 mb-8">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  <HelpCircle className="w-4 h-4" />
                  <span>Transparent Questions</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-4">
                {CALCULATOR_FAQS.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 space-y-2"
                  >
                    <h3 className="text-sm sm:text-base font-heading font-bold text-white flex items-start gap-2.5">
                      <span className="text-cyan-400 font-mono text-xs mt-0.5">0{idx + 1}.</span>
                      <span>{faq.q}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-6">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>

              {/* Direct Support Banner */}
              <div className="mt-12 p-6 rounded-2xl bg-linear-to-r from-blue-900/30 to-cyan-900/20 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <h4 className="text-base font-heading font-bold text-white">Have a unique enterprise specification?</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect directly with a Senior Solution Architect for custom API or legacy database migrations.
                  </p>
                </div>
                <a
                  href="https://wa.me/919414112057?text=Hi%20SnapTech%20Digital,%20I%20have%20a%20custom%20project%20requirement"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-heading font-bold text-xs shrink-0 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Architect</span>
                </a>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  )
}

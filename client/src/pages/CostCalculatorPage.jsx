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
import { breadcrumbSchema, faqSchema } from '@/components/ui/SEO'
import CostCalculator from '@/components/calculator/CostCalculator'
import { useSiteSettings } from '@/hooks/useContent'

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
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}
  const rawWa = cfg.whatsapp || cfg.phone || '+91 8209604849'
  const cleanWa = rawWa.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    'Hi SnapTech Digital, I have calculated my estimate on your website and would like to discuss my project requirement.'
  )}`

  return (
    <>
      <SEO
        title="Interactive Website Cost Calculator &amp; Pricing Estimator"
        description="Estimate website, custom SaaS web app, and e-commerce platform development costs instantly with SnapTech Digital's transparent engineering calculator."
        path="/cost-calculator"
        keywords="website cost calculator india, web development pricing, software development cost estimator, snaptech digital pricing"
        schemas={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Cost Calculator', path: '/cost-calculator' },
          ]),
          faqSchema(CALCULATOR_FAQS),
        ]}
      />

      <div className="bg-white text-slate-900 min-h-screen selection:bg-brand-blue/15 selection:text-brand-blue">
        {/* ── Top Hero Section ── */}
        <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 overflow-hidden border-b border-slate-200/80 bg-linear-to-b from-slate-50 via-white to-slate-50/50">
          {/* Subtle mesh background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-size-[48px_48px] pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-160 h-100 bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />

          <Container className="relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50/80 text-brand-blue text-xs font-bold uppercase tracking-wider shadow-2xs"
              >
                <Calculator className="w-4 h-4 text-brand-blue" />
                <span>Zero-Surprise Pricing Matrix</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-heading font-extrabold text-[#0D1B4B] tracking-tight leading-[1.15]"
              >
                Calculate Your Digital Project{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
                  Investment in Seconds
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal"
              >
                Select your required architecture, pages, and integrations below. Get an immediate itemized cost estimate backed by guaranteed engineering milestones.
              </motion.p>
            </div>
          </Container>
        </section>

        {/* ── Interactive Calculator Component ── */}
        <section className="relative z-10 py-10 sm:py-14 bg-slate-50/50 border-b border-slate-200/80">
          <Container>
            <CostCalculator />
          </Container>
        </section>

        {/* ── Value Pillars ── */}
        <section className="py-16 sm:py-20 bg-white">
          <Container>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0D1B4B]">
                Engineered for Total Predictability
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Every project delivered by SnapTech Digital adheres to institutional corporate standards.
              </p>
            </div>

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
                    className="p-6 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-brand-blue/40 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-brand-blue mb-4 shadow-2xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-heading font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </Container>
        </section>

        {/* ── FAQ Section ── */}
        <section className="py-16 sm:py-20 border-t border-slate-200/80 bg-slate-50/60">
          <Container>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-2 mb-10">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-brand-blue uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-brand-blue" />
                  <span>Transparent Questions</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0D1B4B]">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm text-slate-600">
                  Everything you need to know about our scope, billing, and source code handoff.
                </p>
              </div>

              <div className="space-y-4">
                {CALCULATOR_FAQS.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-brand-blue/40 transition-all space-y-2"
                  >
                    <h3 className="text-sm sm:text-base font-heading font-bold text-slate-900 flex items-start gap-2.5">
                      <span className="text-brand-blue font-mono font-bold text-xs mt-0.5">0{idx + 1}.</span>
                      <span>{faq.q}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>

              {/* Direct Support Banner */}
              <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-50 via-indigo-50/60 to-blue-50 border border-blue-200/90 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs text-center sm:text-left">
                <div>
                  <h4 className="text-lg font-heading font-bold text-[#0D1B4B]">Have a unique enterprise specification?</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                    Connect directly with a Senior Solution Architect for custom API integrations or legacy database migrations.
                  </p>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs shrink-0 transition-all shadow-md shadow-emerald-600/25 flex items-center gap-2 cursor-pointer"
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

/**
 * WhyUsSection — "Why Choose Snaptech" Enterprise Engineering Edge.
 * Seamless Cyber-Navy Glassmorphic design.
 * 100% Dynamic data from useSiteSettings with high-impact enterprise SLA pillars.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Clock,
  TrendingUp,
  ArrowRight,
  Code2,
  Lock,
  CheckCircle2,
  Award,
  ChevronLeft,
  ChevronRight,
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

const flipVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 120 : -120,
    rotate: dir > 0 ? 5 : -5,
    opacity: 0,
    scale: 0.94,
  }),
  center: {
    x: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 28,
    },
  },
  exit: (dir) => ({
    x: dir > 0 ? -160 : 160,
    rotate: dir > 0 ? -8 : 8,
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.22,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
}

export default function WhyUsSection() {
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}

  const [activeMobileIdx, setActiveMobileIdx] = useState(0)
  const [direction, setDirection] = useState(1)

  const handleNext = () => {
    setDirection(1)
    setActiveMobileIdx((prev) => (prev + 1) % ENTERPRISE_DIFFERENTIATORS.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setActiveMobileIdx((prev) => (prev === 0 ? ENTERPRISE_DIFFERENTIATORS.length - 1 : prev - 1))
  }

  const handleDotClick = (i) => {
    if (i === activeMobileIdx) return
    setDirection(i > activeMobileIdx ? 1 : -1)
    setActiveMobileIdx(i)
  }

  return (
    <section
      id="why-us"
      className="py-20 sm:py-24 bg-white border-t border-slate-100 relative overflow-hidden isolate"
      aria-labelledby="whyus-heading"
    >
      {/* Subtle ambient decorations */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ── Left Column: Value Pillars ── */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200 text-brand-blue text-xs font-mono font-bold uppercase tracking-widest mb-4 shadow-2xs">
                <Award className="w-3.5 h-3.5" />
                <span>The SnapTech Digital Advantage</span>
              </div>
              <h2
                id="whyus-heading"
                className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0D1B4B] tracking-tight leading-tight"
              >
                Enterprise Engineering,{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
                  Zero Compromise
                </span>
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-4 max-w-xl">
                We bridge high-velocity engineering with corporate-grade stability. 
                Here is why growing businesses and enterprises across India trust SnapTech Digital.
              </p>
            </motion.div>

            {/* ── Desktop & Tablet 2x2 Cards Grid (sm: screens and up) ── */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-4 pt-2">
              {ENTERPRISE_DIFFERENTIATORS.map((item) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-blue/30 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all shadow-2xs">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-brand-blue group-hover:bg-brand-blue group-hover:text-white group-hover:border-brand-blue transition-colors">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="font-heading text-base font-bold text-slate-900 mb-2 group-hover:text-brand-blue transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* ── Mobile 3D Card Stack & Flip Deck (< sm: screens) ── */}
            <div className="sm:hidden pt-2">
              {/* Top Mobile Controls Bar */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                  <span>The Advantage ({activeMobileIdx + 1}/{ENTERPRISE_DIFFERENTIATORS.length})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue shadow-xs active:scale-90 transition-all cursor-pointer"
                    aria-label="Previous advantage"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue shadow-xs active:scale-90 transition-all cursor-pointer"
                    aria-label="Next advantage"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3D Stack Stage */}
              <div className="relative w-full max-w-85 mx-auto h-[290px] flex items-center justify-center select-none">
                {/* Deepest Stack Card 3 */}
                {ENTERPRISE_DIFFERENTIATORS.length > 2 && (
                  <div
                    className="absolute inset-x-5 top-0 h-[270px] rounded-2xl border border-slate-200/60 bg-slate-100/90 shadow-2xs pointer-events-none transition-all duration-300"
                    style={{
                      transform: 'translateY(14px) scale(0.9)',
                      zIndex: 10,
                      opacity: 0.45,
                    }}
                  />
                )}

                {/* Middle Stack Card 2 (Shows next differentiator preview) */}
                {ENTERPRISE_DIFFERENTIATORS.length > 1 && (() => {
                  const nextItem = ENTERPRISE_DIFFERENTIATORS[(activeMobileIdx + 1) % ENTERPRISE_DIFFERENTIATORS.length]
                  const NextIcon = nextItem.icon
                  return (
                    <div
                      className="absolute inset-x-2.5 top-0 h-[270px] rounded-2xl border border-slate-200 bg-white shadow-md pointer-events-none transition-all duration-300 overflow-hidden"
                      style={{
                        transform: 'translateY(7px) scale(0.95)',
                        zIndex: 20,
                        opacity: 0.85,
                      }}
                    >
                      <div className="p-5 flex flex-col justify-between h-full bg-white opacity-85">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-brand-blue flex items-center justify-center opacity-75">
                              <NextIcon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-brand-blue opacity-80">
                              {nextItem.badge}
                            </span>
                          </div>
                          <h3 className="font-heading text-base font-bold text-slate-800 line-clamp-1 mb-1.5">
                            {nextItem.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                            {nextItem.desc}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                          <span>Advantage 0{((activeMobileIdx + 1) % ENTERPRISE_DIFFERENTIATORS.length) + 1}</span>
                          <span className="font-bold text-brand-blue">Next Advantage &rarr;</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Active Front Card 1 (Interactive & Flip animated) */}
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={activeMobileIdx}
                    custom={direction}
                    variants={flipVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.45}
                    onDragEnd={(_e, { offset, velocity }) => {
                      if (offset.x < -45 || velocity?.x < -300) {
                        handleNext()
                      } else if (offset.x > 45 || velocity?.x > 300) {
                        handlePrev()
                      }
                    }}
                    className="relative z-30 w-full h-[270px] cursor-grab active:cursor-grabbing touch-pan-y"
                  >
                    {(() => {
                      const currentItem = ENTERPRISE_DIFFERENTIATORS[activeMobileIdx]
                      const CurrentIcon = currentItem.icon
                      return (
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md relative overflow-hidden flex flex-col justify-between h-full">
                          {/* Subtle brand glow */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-b from-blue-500/5 to-transparent blur-2xl rounded-full pointer-events-none" />

                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-brand-blue flex items-center justify-center shadow-2xs">
                                <CurrentIcon className="w-6 h-6" />
                              </div>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-blue shadow-2xs">
                                {currentItem.badge}
                              </span>
                            </div>

                            <h3 className="font-heading text-lg font-bold text-[#0D1B4B] mb-2 leading-snug">
                              {currentItem.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                              {currentItem.desc}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-mono text-slate-400">
                            <span>Advantage 0{activeMobileIdx + 1}</span>
                            <span className="font-bold text-brand-blue">Enterprise Grade</span>
                          </div>
                        </div>
                      )
                    })()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Flip dots & tactile swipe hint */}
              <div className="flex flex-col items-center gap-2 mt-6">
                <div className="flex justify-center items-center gap-1.5">
                  {ENTERPRISE_DIFFERENTIATORS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleDotClick(i)}
                      className="p-1 min-w-5 min-h-5 flex items-center justify-center cursor-pointer"
                      aria-label={`Go to advantage ${i + 1}`}
                    >
                      <span
                        className={`h-1.5 rounded-full transition-all duration-300 block ${
                          activeMobileIdx === i ? 'w-6 bg-brand-blue shadow-xs' : 'w-1.5 bg-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                  <span>&larr;</span> Swipe card to flip <span>&rarr;</span>
                </span>
              </div>
            </div>

            <motion.div variants={fadeUp} className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:text-blue-700 transition-colors group"
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
            <div className="relative p-3 rounded-2xl border border-slate-200 bg-white shadow-xl">
              {/* Corner focus brackets */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-brand-blue pointer-events-none" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-brand-navy pointer-events-none" />

              {/* Inner Card */}
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-blue" />
                    <span className="font-heading text-sm font-bold text-slate-900 tracking-wide">
                      VERIFIED SLA MATRIX
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    STANDARDS 2026
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Company Inception</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">July 2026</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Parent Enterprise</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">Hindustan Projects</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Source Code Ownership</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">100% Handover</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Target Cloud SLA</span>
                    <span className="font-mono font-bold text-emerald-600 text-sm">{cfg.stat_sla || '99.9%'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Code Quality &amp; Security</span>
                    <span className="font-mono font-bold text-brand-blue text-sm">Clean Architecture</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Backed by {cfg.parent_company_name || 'Hindustan Projects Group'} with full IP &amp; code handover</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}

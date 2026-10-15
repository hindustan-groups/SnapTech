import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui'
import { Search, Compass, Cpu, Rocket, ArrowRight, Workflow, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Discovery & Blueprinting',
    desc: 'We map your business workflows, user journeys, and infrastructure requirements into an executable technical specification.',
    detail: 'Scope & Architecture',
    color: 'text-brand-blue bg-blue-50',
    glow: 'rgba(27,110,243,0.2)',
    border: '#1B6EF3',
  },
  {
    step: '02',
    icon: Compass,
    title: 'Strategic UI/UX Design',
    desc: 'Our design team crafts responsive, high-converting prototypes in Figma, validating every micro-interaction before a single line of code.',
    detail: 'Interactive Prototype',
    color: 'text-brand-navy bg-slate-100',
    glow: 'rgba(13,27,75,0.2)',
    border: '#0D1B4B',
  },
  {
    step: '03',
    icon: Cpu,
    title: 'Agile Full-Stack Build',
    desc: 'Engineering with modern tech stacks, automated unit testing, and continuous deployment so you track progress on a live staging URL.',
    detail: 'Agile 2-Week Sprints',
    color: 'text-blue-600 bg-blue-50',
    glow: 'rgba(37,99,235,0.2)',
    border: '#2563eb',
  },
  {
    step: '04',
    icon: Rocket,
    title: 'Launch & Lifelong SLA',
    desc: 'Zero-downtime production deployment, Google Search Console indexing, and guaranteed 99.9% uptime with dedicated engineering support.',
    detail: 'Post-Launch Warranty',
    color: 'text-emerald-600 bg-emerald-50',
    glow: 'rgba(16,185,129,0.2)',
    border: '#10b981',
  },
]

function ProcessStep({ step, index }) {
  const Icon = step.icon
  const isLast = index === STEPS.length - 1

  return (
    <div className="reveal relative flex flex-col items-center text-center group" style={{ transitionDelay: `${index * 100}ms` }}>
      {/* Ghost step number */}
      <span className="absolute -top-7 left-1/2 -translate-x-1/2 font-heading text-7xl font-black text-slate-100 group-hover:text-brand-blue/10 transition-colors pointer-events-none select-none leading-none">
        {step.step}
      </span>

      {/* Icon bubble */}
      <div
        className={`relative w-18 h-18 rounded-2xl ${step.color} border border-slate-200 flex items-center justify-center mb-6 z-10
          shadow-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 12px 32px ${step.glow}` }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '' }}
      >
        <Icon className="w-7 h-7" strokeWidth={1.75} />

        {/* Step badge */}
        <span
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center shadow-md"
          style={{ background: step.border }}
        >
          {index + 1}
        </span>
      </div>

      {/* Content */}
      <div className="max-w-55">
        <div
          className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 px-2.5 py-1 rounded-full inline-block border"
          style={{ color: step.border, background: `${step.border}15`, borderColor: `${step.border}30` }}
        >
          {step.detail}
        </div>
        <h3 className="font-heading text-base font-bold text-slate-800 mb-2 group-hover:text-brand-blue transition-colors">
          {step.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{step.desc}</p>
      </div>

      {/* Connector arrow (not on last step) */}
      {!isLast && (
        <div className="hidden lg:flex absolute top-9 left-[calc(50%+48px)] right-[calc(-50%+48px)] items-center justify-center z-0 pointer-events-none">
          <div className="flex-1 h-px bg-linear-to-r from-brand-blue/30 via-indigo-500/30 to-slate-200" />
          <ArrowRight className="w-4 h-4 text-brand-blue shrink-0 -ml-1" />
        </div>
      )}
    </div>
  )
}

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

export default function ProcessSection() {
  const containerRef = useRef(null)
  const [activeMobileIdx, setActiveMobileIdx] = useState(0)
  const [direction, setDirection] = useState(1)

  const handleNext = () => {
    setDirection(1)
    setActiveMobileIdx((prev) => (prev + 1) % STEPS.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setActiveMobileIdx((prev) => (prev === 0 ? STEPS.length - 1 : prev - 1))
  }

  const handleDotClick = (i) => {
    if (i === activeMobileIdx) return
    setDirection(i > activeMobileIdx ? 1 : -1)
    setActiveMobileIdx(i)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    const container = containerRef.current
    if (!container) return
    container.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="process"
      className="py-20 sm:py-24 bg-slate-50 border-t border-slate-100 relative overflow-hidden isolate"
      aria-labelledby="process-heading"
    >
      {/* Subtle background decorations */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-100/20 rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10">
        {/* Heading */}
        <div className="reveal text-center mb-10 sm:mb-20 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200 text-brand-blue text-xs font-bold uppercase tracking-widest mb-4 shadow-2xs">
            <Workflow className="w-3.5 h-3.5" />
            <span>Execution Methodology</span>
          </div>
          <h2 id="process-heading" className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0D1B4B] tracking-tight mb-4">
            How We{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
              Build &amp; Deliver
            </span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            A transparent, sprint-driven engineering roadmap from initial architecture blueprinting to a resilient, high-converting digital product.
          </p>
        </div>

        {/* ── Desktop & Tablet Grid (md: screens and up) ── */}
        <div ref={containerRef} className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-6 relative">
          {STEPS.map((step, index) => (
            <ProcessStep key={step.step} step={step} index={index} />
          ))}
        </div>

        {/* ── Mobile 3D Card Stack & Flip Deck (< md: screens) ── */}
        <div className="md:hidden">
          {/* Top Mobile Controls Bar */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
              <span>Roadmap (Step {activeMobileIdx + 1}/{STEPS.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue shadow-xs active:scale-90 transition-all cursor-pointer"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue shadow-xs active:scale-90 transition-all cursor-pointer"
                aria-label="Next step"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3D Stack Stage */}
          <div className="relative w-full max-w-85 mx-auto h-[350px] flex items-center justify-center select-none">
            {/* Deepest Stack Card 3 */}
            {STEPS.length > 2 && (
              <div
                className="absolute inset-x-5 top-0 h-[330px] rounded-2xl border border-slate-200/60 bg-slate-100/90 shadow-2xs pointer-events-none transition-all duration-300"
                style={{
                  transform: 'translateY(16px) scale(0.9)',
                  zIndex: 10,
                  opacity: 0.45,
                }}
              />
            )}

            {/* Middle Stack Card 2 (Shows next step preview) */}
            {STEPS.length > 1 && (() => {
              const nextStep = STEPS[(activeMobileIdx + 1) % STEPS.length]
              const NextIcon = nextStep.icon
              return (
                <div
                  className="absolute inset-x-2.5 top-0 h-[330px] rounded-2xl border border-slate-200 bg-white shadow-md pointer-events-none transition-all duration-300 overflow-hidden"
                  style={{
                    transform: 'translateY(8px) scale(0.95)',
                    zIndex: 20,
                    opacity: 0.85,
                  }}
                >
                  <div className="p-6 flex flex-col justify-between h-full bg-white opacity-85">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-14 h-14 rounded-2xl ${nextStep.color} border border-slate-200/80 flex items-center justify-center shadow-xs opacity-75`}
                        >
                          <NextIcon className="w-7 h-7" strokeWidth={1.75} />
                        </div>
                        <span className="font-heading text-5xl font-black text-slate-200 leading-none">
                          {nextStep.step}
                        </span>
                      </div>
                      <div
                        className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2.5 px-2.5 py-1 rounded-full inline-block border opacity-80"
                        style={{
                          color: nextStep.border,
                          background: `${nextStep.border}15`,
                          borderColor: `${nextStep.border}30`,
                        }}
                      >
                        {nextStep.detail}
                      </div>
                      <h4 className="font-heading text-base font-bold text-slate-800 line-clamp-1 mb-1.5">
                        {nextStep.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {nextStep.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>Phase {nextStep.step}</span>
                      <span className="font-bold text-brand-blue">Next Phase &rarr;</span>
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
                className="relative z-30 w-full h-[330px] cursor-grab active:cursor-grabbing touch-pan-y"
              >
                {(() => {
                  const currentStep = STEPS[activeMobileIdx]
                  const CurrentIcon = currentStep.icon
                  return (
                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md relative overflow-hidden flex flex-col justify-between h-full">
                      {/* Subtle brand glow */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-b from-blue-500/5 to-transparent blur-2xl rounded-full pointer-events-none" />

                      <div>
                        {/* Top row: Icon bubble + Ghost Number */}
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`relative w-14 h-14 rounded-2xl ${currentStep.color} border border-slate-200/80 flex items-center justify-center shadow-xs`}
                          >
                            <CurrentIcon className="w-7 h-7" strokeWidth={1.75} />
                            <span
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm"
                              style={{ background: currentStep.border }}
                            >
                              {activeMobileIdx + 1}
                            </span>
                          </div>
                          <span className="font-heading text-5xl font-black text-slate-100 select-none leading-none">
                            {currentStep.step}
                          </span>
                        </div>

                        {/* Detail Badge */}
                        <div
                          className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2.5 px-2.5 py-1 rounded-full inline-block border shadow-2xs"
                          style={{
                            color: currentStep.border,
                            background: `${currentStep.border}15`,
                            borderColor: `${currentStep.border}30`,
                          }}
                        >
                          {currentStep.detail}
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-heading text-lg font-bold text-[#0D1B4B] mb-2 leading-snug">
                          {currentStep.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {currentStep.desc}
                        </p>
                      </div>

                      {/* Card Bottom Meta */}
                      <div className="pt-3.5 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 font-medium">Phase 0{activeMobileIdx + 1}</span>
                        <span
                          className="font-bold px-2.5 py-1 rounded-md"
                          style={{
                            color: currentStep.border,
                            background: `${currentStep.border}12`,
                          }}
                        >
                          {activeMobileIdx === STEPS.length - 1 ? 'Production SLA' : 'Sprint Milestone'}
                        </span>
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
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDotClick(i)}
                  className="p-1 min-w-5 min-h-5 flex items-center justify-center cursor-pointer"
                  aria-label={`Go to step ${i + 1}`}
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


        {/* Bottom CTA */}
        <div className="reveal text-center mt-16">
          <p className="text-slate-500 text-sm mb-4 font-mono">Ready to map your technical roadmap?</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-brand-blue hover:bg-brand-blue-dark group cursor-pointer"
          >
            <span>Schedule Technical Architecture Consultation</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Container>
    </section>
  )
}

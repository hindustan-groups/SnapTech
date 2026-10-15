import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, ShieldCheck, Building2, Cpu, Globe, Award, ChevronLeft, ChevronRight } from 'lucide-react'
import { Container } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 28,
    },
  },
  exit: (dir) => ({
    x: dir > 0 ? -120 : 120,
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.22,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
}

export default function ParentGroupSection() {
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}
  const parentUrl = cfg.parent_company_url || 'https://www.hindustanprojects.in'
  const parentName = cfg.parent_company_name || 'Hindustan Projects Group'
  const companyName = cfg.company_name || 'SnapTech Digital'
  const domain = cfg.hero_domain || 'www.snaptech.digital'
  const sla = cfg.stat_sla || '99.9%'

  const [activeIdx, setActiveIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isPaused, setIsPaused] = useState(false)

  const ecosystemPillars = [
    {
      icon: Building2,
      title: 'Enterprise Heritage & Stability',
      desc: `Backed by ${parentName}, combining deep industrial engineering legacy with agile, next-generation digital technology.`,
    },
    {
      icon: Cpu,
      title: 'Technology & Cloud Division',
      desc: `${companyName} serves as the dedicated IT software wing, building mission-critical web applications, SaaS platforms, and mobile apps.`,
    },
    {
      icon: Globe,
      title: 'Unified Domain Architecture',
      desc: `Operating under official domain ${domain} with cross-functional enterprise compliance and cloud synergy.`,
    },
    {
      icon: Award,
      title: 'Guaranteed Delivery & SLA',
      desc: `Tier-1 engineering standards with ${sla}% uptime, strict milestone tracking, and long-term enterprise maintenance agreements.`,
    },
  ]

  // Auto-slide every 4.5 seconds on mobile when not paused
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setDirection(1)
      setActiveIdx((prev) => (prev + 1) % ecosystemPillars.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [isPaused, ecosystemPillars.length])

  const handleNext = () => {
    setDirection(1)
    setActiveIdx((prev) => (prev + 1) % ecosystemPillars.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setActiveIdx((prev) => (prev === 0 ? ecosystemPillars.length - 1 : prev - 1))
  }

  const handleDotClick = (i) => {
    if (i === activeIdx) return
    setDirection(i > activeIdx ? 1 : -1)
    setActiveIdx(i)
  }

  return (
    <section id="group-ecosystem" className="py-20 bg-slate-50 text-slate-900 relative overflow-hidden isolate border-b border-slate-200" aria-labelledby="parent-group-heading">
      {/* Background subtle ambient elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      <Container>
        <div className="max-w-4xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200 text-brand-blue text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-brand-blue" />
            <span>Corporate Ecosystem</span>
          </div>
          <h2 id="parent-group-heading" className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0D1B4B] tracking-tight leading-tight mb-4">
            The Digital &amp; Technology Powerhouse of{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
              {parentName}
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {companyName} bridges heavy industrial engineering with high-velocity digital intelligence. 
            We provide scalable software, cloud, and digital solutions with the unmatched trustworthiness of our parent enterprise.
          </p>
        </div>

        {/* ── Desktop & Tablet Grid (md: screens and up) ── */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ecosystemPillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-brand-blue/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Mobile App-Style Auto-Slider & One-Hand Swipe Deck (< md: screens) ── */}
        <div className="md:hidden mb-12">
          {/* Controls Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
              <span>Ecosystem Pillar ({activeIdx + 1}/{ecosystemPillars.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue shadow-xs active:scale-90 transition-all cursor-pointer"
                aria-label="Previous pillar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue shadow-xs active:scale-90 transition-all cursor-pointer"
                aria-label="Next pillar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Swipeable Card Stage */}
          <div
            className="relative w-full overflow-hidden select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => {
              setTimeout(() => setIsPaused(false), 3000)
            }}
          >
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={activeIdx}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_e, { offset, velocity }) => {
                  if (offset.x < -40 || velocity.x < -300) {
                    handleNext()
                  } else if (offset.x > 40 || velocity.x > 300) {
                    handlePrev()
                  }
                }}
                className="relative z-10 w-full cursor-grab active:cursor-grabbing touch-pan-y"
              >
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md relative overflow-hidden flex flex-col min-h-[220px]">
                  {/* Top Auto-play Progress Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
                    <motion.div
                      key={activeIdx}
                      initial={{ width: '0%' }}
                      animate={{ width: isPaused ? '0%' : '100%' }}
                      transition={{ duration: 4.5, ease: 'linear' }}
                      className="h-full bg-linear-to-r from-brand-blue to-indigo-600"
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4 mt-1">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center shadow-2xs">
                      {(() => {
                        const CurrentIcon = ecosystemPillars[activeIdx].icon
                        return <CurrentIcon className="w-6 h-6" />
                      })()}
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
                      0{activeIdx + 1} / 0{ecosystemPillars.length}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-[#0D1B4B] mb-2">
                    {ecosystemPillars[activeIdx].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {ecosystemPillars[activeIdx].desc}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Dots & One-hand Swipe Hint */}
          <div className="flex flex-col items-center gap-2 mt-4">
            <div className="flex justify-center items-center gap-1.5">
              {ecosystemPillars.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDotClick(i)}
                  className="p-1 min-w-5 min-h-5 flex items-center justify-center cursor-pointer"
                  aria-label={`Go to pillar ${i + 1}`}
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-300 block ${
                      activeIdx === i ? 'w-6 bg-brand-blue shadow-xs' : 'w-1.5 bg-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
              <span>&larr;</span> Swipe with thumb <span>&rarr;</span>
            </span>
          </div>
        </div>

        {/* Parent Website Cross-Link Banner */}
        <div className="rounded-2xl bg-linear-to-r from-blue-50/80 via-white to-indigo-50/50 p-6 sm:p-8 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-blue font-bold block">
              Official Corporate Gateway
            </span>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#0D1B4B]">
              Explore {parentName}
            </h3>
            <p className="text-xs text-slate-600">
              Discover engineering milestones, pre-engineered buildings, infrastructure ventures, and group portfolio.
            </p>
          </div>
          <a
            href={parentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shrink-0 shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Visit {parentUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </Container>
    </section>
  )
}

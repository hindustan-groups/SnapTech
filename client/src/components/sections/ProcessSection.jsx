/**
 * ProcessSection — Animated timeline stepper (no Framer Motion)
 * Features: scroll-reveal, animated connector line, step number ghosts, icon glow on hover
 * Clean corporate white theme matching the HiPRO Design System
 */
import { useEffect, useRef } from 'react'
import { Container } from '@/components/ui'
import { Search, Compass, Cpu, Rocket, ArrowRight, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'

const STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Discovery & Blueprinting',
    desc: 'We map your business workflows, user journeys, and infrastructure requirements into an executable technical specification.',
    detail: 'Scope & Architecture',
    color: 'text-[#1a3e8c] bg-[#1a3e8c]/10',
    glow: 'rgba(26,62,140,0.2)',
    border: '#1a3e8c',
  },
  {
    step: '02',
    icon: Compass,
    title: 'Strategic UI/UX Design',
    desc: 'Our design team crafts responsive, high-converting prototypes in Figma, validating every micro-interaction before a single line of code.',
    detail: 'Interactive Prototype',
    color: 'text-[#e31e24] bg-[#e31e24]/10',
    glow: 'rgba(227,30,36,0.2)',
    border: '#e31e24',
  },
  {
    step: '03',
    icon: Cpu,
    title: 'Agile Full-Stack Build',
    desc: 'Engineering with modern tech stacks, automated unit testing, and continuous deployment so you track progress on a live staging URL.',
    detail: 'Agile 2-Week Sprints',
    color: 'text-[#1a3e8c] bg-[#1a3e8c]/10',
    glow: 'rgba(26,62,140,0.2)',
    border: '#1a3e8c',
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
      <span className="absolute -top-7 left-1/2 -translate-x-1/2 font-heading text-7xl font-black text-slate-100 group-hover:text-[#1a3e8c]/10 transition-colors pointer-events-none select-none leading-none">
        {step.step}
      </span>

      {/* Icon bubble */}
      <div
        className={`relative w-[72px] h-[72px] rounded-2xl ${step.color} border border-slate-200 flex items-center justify-center mb-6 z-10
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
      <div className="max-w-[220px]">
        <div
          className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 px-2.5 py-1 rounded-full inline-block border"
          style={{ color: step.border, background: `${step.border}15`, borderColor: `${step.border}30` }}
        >
          {step.detail}
        </div>
        <h3 className="font-heading text-base font-bold text-slate-800 mb-2 group-hover:text-[#1a3e8c] transition-colors">
          {step.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{step.desc}</p>
      </div>

      {/* Connector arrow (not on last step) */}
      {!isLast && (
        <div className="hidden lg:flex absolute top-9 left-[calc(50%+48px)] right-[calc(-50%+48px)] items-center justify-center z-0 pointer-events-none">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-[#1a3e8c]/30 via-[#e31e24]/30 to-slate-200" />
          <ArrowRight className="w-4 h-4 text-[#1a3e8c] shrink-0 -ml-1" />
        </div>
      )}
    </div>
  )
}

export default function ProcessSection() {
  const containerRef = useRef(null)

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
      className="py-24 bg-slate-50 border-t border-slate-100 relative overflow-hidden isolate"
      aria-labelledby="process-heading"
    >
      {/* Subtle background decorations */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#1a3e8c]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#e31e24]/5 rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10">
        {/* Heading */}
        <div className="reveal text-center mb-20 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 text-[#1a3e8c] text-xs font-bold uppercase tracking-widest mb-4">
            <Workflow className="w-3.5 h-3.5" />
            <span>Execution Methodology</span>
          </div>
          <h2 id="process-heading" className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            How We{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #1a3e8c, #e31e24)' }}>Build & Deliver</span>
          </h2>
          <p className="text-slate-500 text-base leading-relaxed">
            A transparent, sprint-driven engineering roadmap from initial architecture blueprinting to a resilient, high-converting digital product.
          </p>
        </div>

        {/* Steps grid */}
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-6 relative">
          {STEPS.map((step, index) => (
            <ProcessStep key={step.step} step={step} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="reveal text-center mt-16">
          <p className="text-slate-500 text-sm mb-4 font-mono">Ready to map your project roadmap?</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 group"
            style={{ background: 'linear-gradient(135deg, #1a3e8c, #1a3e8c)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #e31e24, #1a3e8c)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #1a3e8c, #1a3e8c)' }}
          >
            <span>Schedule Free Tech Architecture Call</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Container>
    </section>
  )
}

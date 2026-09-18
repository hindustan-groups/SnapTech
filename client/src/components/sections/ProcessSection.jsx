/**
 * ProcessSection — Animated timeline stepper (no Framer Motion)
 * Features: scroll-reveal, animated connector line, step number ghosts, icon glow on hover
 */
import { useEffect, useRef } from 'react'
import { Container } from '@/components/ui'
import { Search, Compass, Cpu, Rocket, ArrowRight, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Discovery & Consultation',
    desc: 'We start by understanding your business goals, target audience, and system requirements. No jargon — just clear roadmap alignment.',
    detail: 'Free 30-min call',
    color: 'text-blue-500 bg-blue-50',
    glow: 'rgba(59,130,246,0.2)',
    border: '#3b82f6',
  },
  {
    step: '02',
    icon: Compass,
    title: 'Strategic UI/UX Design',
    desc: 'Our design team creates modern, high-converting prototypes and style guides. We iterate until you are 100% satisfied.',
    detail: '3–5 day turnaround',
    color: 'text-purple-500 bg-purple-50',
    glow: 'rgba(168,85,247,0.2)',
    border: '#a855f7',
  },
  {
    step: '03',
    icon: Cpu,
    title: 'Robust Development',
    desc: 'Our engineers bring approved designs to life with clean, secure, and lightning-fast code — optimized for performance and SEO.',
    detail: 'Agile 2-week sprints',
    color: 'text-sky-500 bg-sky-50',
    glow: 'rgba(14,165,233,0.2)',
    border: '#0ea5e9',
  },
  {
    step: '04',
    icon: Rocket,
    title: 'Launch & Lifelong Support',
    desc: 'We deploy with rigorous quality checks and provide dedicated ongoing support to ensure zero downtime and continuous growth.',
    detail: '30 days free support',
    color: 'text-emerald-500 bg-emerald-50',
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
      <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-heading text-7xl font-black text-slate-900/[0.04] group-hover:text-brand-primary/[0.06] transition-colors pointer-events-none select-none leading-none">
        {step.step}
      </span>

      {/* Icon bubble */}
      <div
        className={`relative w-18 h-18 rounded-2xl ${step.color} flex items-center justify-center mb-6 z-10
          shadow-sm group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
        style={{ width: '72px', height: '72px' }}
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
      <div className="max-w-[200px]">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-2.5 py-1 rounded-full bg-slate-100 inline-block text-slate-500">
          {step.detail}
        </div>
        <h3 className="font-heading text-base font-bold text-slate-800 mb-2 group-hover:text-brand-primary transition-colors">
          {step.title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
      </div>

      {/* Connector arrow (not on last step) */}
      {!isLast && (
        <div className="hidden lg:flex absolute top-9 left-[calc(50%+48px)] right-[calc(-50%+48px)] items-center justify-center z-0 pointer-events-none">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 to-slate-300" />
          <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
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
    <section className="py-24 bg-white border-t border-gray-100/50" aria-labelledby="process-heading">
      <Container>
        {/* Heading */}
        <div className="reveal text-center mb-20 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/8 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest mb-4">
            <CheckCircle className="w-3.5 h-3.5" />
            Our Process
          </div>
          <h2 id="process-heading" className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            How We <span className="text-gradient-blue">Build & Deliver</span>
          </h2>
          <p className="text-slate-500 text-base leading-relaxed">
            A transparent, step-by-step roadmap from initial concept to a successful,
            high-performing digital product.
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
          <p className="text-slate-500 text-sm mb-4">Ready to start your project?</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-brand-primary/25 transition-all duration-200 hover:-translate-y-0.5"
          >
            Schedule Free Consultation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  )
}

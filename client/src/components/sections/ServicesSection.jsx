/**
 * ServicesSection — Homepage services grid.
 * Features:
 * - Dynamic data from GET /api/services (Prisma Service model)
 * - Clean corporate white cards with brand color accents
 * - Reveal-on-scroll animation
 */
import { createElement, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Layers } from 'lucide-react'
import { Container } from '@/components/ui'
import { ServiceCardSkeleton } from '@/components/ui/Skeleton'
import { useServices } from '@/hooks/useServices'
import { getServiceIcon } from '@/utils/serviceIcons'

/* Gradient colors per card index — soft brand-aligned for light background */
const CARD_ACCENTS = [
  { icon: 'text-[#1a3e8c]', bg: 'bg-[#1a3e8c]/10', glow: 'rgba(26,62,140,0.12)', border: '#1a3e8c' },
  { icon: 'text-[#e31e24]', bg: 'bg-[#e31e24]/10', glow: 'rgba(227,30,36,0.12)', border: '#e31e24' },
  { icon: 'text-[#1a3e8c]', bg: 'bg-[#1a3e8c]/10', glow: 'rgba(26,62,140,0.12)', border: '#1a3e8c' },
  { icon: 'text-[#e31e24]', bg: 'bg-[#e31e24]/10', glow: 'rgba(227,30,36,0.12)', border: '#e31e24' },
  { icon: 'text-[#1a3e8c]', bg: 'bg-[#1a3e8c]/10', glow: 'rgba(26,62,140,0.12)', border: '#1a3e8c' },
  { icon: 'text-[#e31e24]', bg: 'bg-[#e31e24]/10', glow: 'rgba(227,30,36,0.12)', border: '#e31e24' },
]

function ServiceCard({ service, index }) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length]

  return (
    <Link
      to={`/services/${service.slug}`}
      className="reveal group relative flex flex-col bg-white border border-slate-200 rounded-2xl p-6 no-underline
        transition-all duration-300 hover:border-transparent hover:-translate-y-1.5 shadow-sm
        hover:shadow-xl overflow-hidden"
      style={{ transitionDelay: `${index * 60}ms` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 20px 48px ${accent.glow}, 0 4px 12px rgba(0,0,0,0.08)`
        e.currentTarget.style.borderColor = `${accent.border}50`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ''
        e.currentTarget.style.borderColor = ''
      }}
    >
      {/* Gradient border top line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.75 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${accent.border}, ${accent.border}80, ${accent.border})` }}
      />

      {/* Top row: Icon & Tag */}
      <div className="flex items-center justify-between mb-5">
        <div
          className={`w-12 h-12 rounded-xl ${accent.bg} border border-slate-200 flex items-center justify-center
            group-hover:scale-110 transition-all duration-300`}
        >
          {createElement(getServiceIcon(service.icon), {
            className: `w-6 h-6 ${accent.icon} transition-colors`,
            strokeWidth: 1.75,
          })}
        </div>

        {service.tag && (
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
            style={{ color: accent.border, background: `${accent.border}12`, borderColor: `${accent.border}30` }}
          >
            {service.tag}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-heading text-lg font-bold text-slate-800 group-hover:text-[#1a3e8c] transition-colors duration-200 mb-2">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-5 group-hover:text-slate-600 transition-colors">
        {service.shortDescription}
      </p>

      {/* Learn More CTA */}
      <span
        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200"
        style={{ color: accent.border }}
      >
        <span>Explore Service</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
      </span>
    </Link>
  )
}

const PLACEHOLDER_SERVICES = [
  { id: '1', title: 'Web Development', slug: 'web-development', icon: 'Code2', tag: 'High-Velocity', shortDescription: 'Custom, responsive web portals built with React 19, Node.js & microservices. Optimised for sub-second speeds, enterprise security & high conversions.' },
  { id: '2', title: 'Mobile App Development', slug: 'mobile-app-development', icon: 'Smartphone', tag: 'Cross-Platform', shortDescription: 'Native iOS and Android mobile applications built on Flutter and React Native with seamless cloud sync and offline data support.' },
  { id: '3', title: 'IT Consulting & Strategy', slug: 'it-consulting-strategy', icon: 'Lightbulb', tag: 'Advisory', shortDescription: 'Strategic corporate IT advisory, legacy modernization, and technical due diligence to scale engineering teams and infrastructure.' },
  { id: '4', title: 'Cloud DevOps & AWS Architecture', slug: 'cloud-devops', icon: 'Cloud', tag: '99.9% Uptime', shortDescription: 'Resilient cloud infrastructure setup, automated CI/CD pipelines, Docker containerization, and AWS / Azure multi-region deployment.' },
  { id: '5', title: 'Custom ERP & SaaS Systems', slug: 'custom-erp-saas', icon: 'Database', tag: 'Enterprise', shortDescription: 'Tailored enterprise resource planning, CRM, and internal workflows engineered to eliminate operational bottlenecks and data silos.' },
  { id: '6', title: 'AI Automation & Data Workflows', slug: 'ai-automation', icon: 'Cpu', tag: 'Next-Gen', shortDescription: 'Intelligent process automation, LLM pipeline integrations, predictive analytics, and automated reporting systems for enterprise scale.' },
]

/* Scroll reveal hook */
function useReveal(selector = '.reveal') {
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
    container.querySelectorAll(selector).forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [selector])
  return containerRef
}

export default function ServicesSection() {
  const { data, isLoading } = useServices()
  const services = data?.data?.length ? data.data : isLoading ? [] : PLACEHOLDER_SERVICES
  const containerRef = useReveal()

  return (
    <section
      id="services"
      className="py-24 bg-slate-50 relative overflow-hidden isolate border-t border-slate-100"
      aria-labelledby="services-heading"
    >
      {/* Subtle background decorations */}
      <div className="absolute top-0 right-0 w-150 h-150 bg-[#1a3e8c]/4 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-[#e31e24]/4 rounded-full blur-[120px] pointer-events-none" />

      <Container className="relative z-10">
        {/* Section heading */}
        <div className="reveal text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 text-[#1a3e8c] text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enterprise Technology Capabilities</span>
          </div>
          <h2 id="services-heading" className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            Engineered for{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #1a3e8c, #e31e24)' }}>
              Scalability & Growth
            </span>
          </h2>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            Snaptech delivers mission-critical software solutions — from responsive corporate portals and cloud DevOps
            to native mobile applications and intelligent automation systems.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
          {isLoading && services.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={i >= 3 ? 'hidden sm:block' : 'block'}>
                  <ServiceCardSkeleton />
                </div>
              ))
            : services.slice(0, 6).map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
        </div>

        {/* Bottom Explorer Action */}
        <div className="mt-14 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-[#1a3e8c] border border-slate-200 hover:border-[#1a3e8c] text-slate-700 hover:text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 group shadow-sm"
          >
            <Layers className="w-4 h-4 text-[#1a3e8c] group-hover:text-white group-hover:scale-110 transition-all" />
            <span>View All Engineering Services</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </Container>
    </section>
  )
}

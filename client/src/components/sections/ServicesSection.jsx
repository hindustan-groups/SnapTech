/**
 * ServicesSection — Homepage services grid.
 * Features:
 * - Gradient border cards on hover
 * - Animated icon container with glow
 * - Reveal-on-scroll animation
 * - Fetches from GET /api/services via TanStack Query
 */
import { createElement, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Container, SectionHeading } from '@/components/ui'
import { ServiceCardSkeleton } from '@/components/ui/Skeleton'
import { useServices } from '@/hooks/useServices'
import { getServiceIcon } from '@/utils/serviceIcons'

/* Gradient colors per card index for visual variety */
const CARD_ACCENTS = [
  { icon: 'text-blue-500', bg: 'bg-blue-50', glow: 'rgba(59,130,246,0.15)', border: '#3b82f6' },
  { icon: 'text-purple-500', bg: 'bg-purple-50', glow: 'rgba(168,85,247,0.15)', border: '#a855f7' },
  { icon: 'text-sky-500', bg: 'bg-sky-50', glow: 'rgba(14,165,233,0.15)', border: '#0ea5e9' },
  { icon: 'text-amber-500', bg: 'bg-amber-50', glow: 'rgba(245,158,11,0.15)', border: '#f59e0b' },
  { icon: 'text-rose-500', bg: 'bg-rose-50', glow: 'rgba(244,63,94,0.15)', border: '#f43f5e' },
  { icon: 'text-emerald-500', bg: 'bg-emerald-50', glow: 'rgba(16,185,129,0.15)', border: '#10b981' },
  { icon: 'text-indigo-500', bg: 'bg-indigo-50', glow: 'rgba(99,102,241,0.15)', border: '#6366f1' },
]

function ServiceCard({ service, index }) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length]

  return (
    <Link
      to={`/services/${service.slug}`}
      className="reveal group relative flex flex-col bg-white border border-slate-100 rounded-2xl p-6 no-underline
        transition-all duration-300 hover:border-transparent hover:-translate-y-1.5
        hover:shadow-[0_20px_48px_rgba(0,0,0,0.10)]"
      style={{
        transitionDelay: `${index * 60}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 20px 48px ${accent.glow}, 0 4px 12px rgba(0,0,0,0.06)`
        e.currentTarget.style.borderColor = `${accent.border}30`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ''
        e.currentTarget.style.borderColor = ''
      }}
    >
      {/* Gradient border top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${accent.border}, ${accent.border}80, ${accent.border})` }}
      />

      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl ${accent.bg} flex items-center justify-center mb-5
          group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
        style={{ boxShadow: 'none' }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 24px ${accent.glow}` }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
      >
        {createElement(getServiceIcon(service.icon), {
          className: `w-6 h-6 ${accent.icon} transition-colors`,
          strokeWidth: 1.75,
        })}
      </div>

      {/* Title */}
      <h3 className="font-heading text-lg font-bold text-slate-800 group-hover:text-brand-primary transition-colors duration-200 mb-2">
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
        Learn More
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
      </span>

      {/* Bottom glow on hover */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${accent.glow}, transparent)` }}
      />
    </Link>
  )
}

const PLACEHOLDER_SERVICES = [
  { id: '1', title: 'Web Development', slug: 'web-development', icon: 'Code2', shortDescription: 'Custom, responsive websites built with React, Node.js & modern frameworks. Optimised for speed, SEO & conversions.' },
  { id: '2', title: 'Digital Marketing & SEO', slug: 'digital-marketing-seo', icon: 'Megaphone', shortDescription: 'Result-driven campaigns spanning SEO, Google Ads, Meta Ads & content marketing to drive high-intent leads.' },
  { id: '3', title: 'IT Consulting & Strategy', slug: 'it-consulting-strategy', icon: 'Lightbulb', shortDescription: 'Strategic IT advisory to align your technology roadmap with business growth goals.' },
  { id: '4', title: 'E-Commerce Solutions', slug: 'ecommerce-solutions', icon: 'Monitor', shortDescription: 'End-to-end e-commerce store setup, checkout optimisation & secure payment gateway integrations.' },
  { id: '5', title: 'Cloud Solutions & DevOps', slug: 'cloud-solutions-devops', icon: 'Settings', shortDescription: 'Secure cloud hosting, AWS/Google Cloud management & CI/CD workflows for zero downtime.' },
  { id: '6', title: 'Branding & UI/UX Design', slug: 'branding-ui-ux-design', icon: 'Layers', shortDescription: 'Premium UI/UX designs coupled with complete corporate brand identity systems & guidelines.' },
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
    <section id="services" className="py-24 bg-gradient-to-b from-white via-brand-ice/20 to-white relative" aria-labelledby="services-heading">
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-tech-grid-fine pointer-events-none opacity-60" />

      <Container>
        {/* Section heading */}
        <div className="reveal text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/8 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Enterprise IT Solutions
          </div>
          <h2 id="services-heading" className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Engineered for{' '}
            <span className="text-gradient-blue">Scalability, Security & Speed</span>
          </h2>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            Snaptech provides full-cycle technology engineering — from responsive web apps and cloud architecture
            to native mobile systems and digital marketing growth engines.
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

        {/* CTA below grid */}
        {!isLoading && services.length > 0 && (
          <div className="reveal text-center mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-bold
                bg-brand-primary text-white px-7 py-3.5 rounded-xl shadow-lg shadow-brand-primary/25
                hover:bg-brand-primary-dark hover:-translate-y-0.5 hover:shadow-brand-primary/40
                transition-all duration-200"
            >
              Explore All IT Capabilities
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-sm font-semibold
                text-brand-navy border border-slate-300 px-6 py-3.5 rounded-xl
                hover:border-brand-primary hover:text-brand-primary hover:bg-brand-ice/50
                transition-all duration-200"
            >
              Estimate Your Project Cost
            </Link>
          </div>
        )}
      </Container>
    </section>
  )
}

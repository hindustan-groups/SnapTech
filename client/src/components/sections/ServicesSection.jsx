/**
 * ServicesSection — Homepage services grid.
 * Features:
 * - Dynamic data from GET /api/services (Prisma Service model)
 * - Clean corporate white cards with brand color accents
 * - Reveal-on-scroll animation
 */
import { createElement, useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Layers, ChevronLeft, ChevronRight } from 'lucide-react'
import { Container } from '@/components/ui'
import { ServiceCardSkeleton } from '@/components/ui/Skeleton'
import { useServices } from '@/hooks/useServices'
import { getServiceIcon } from '@/utils/serviceIcons'

/* Brand-aligned card accents for light background */
const CARD_ACCENTS = [
  { icon: 'text-[#1B6EF3]', bg: 'bg-[#1B6EF3]/10', glow: 'rgba(27,110,243,0.14)', border: '#1B6EF3' },
  { icon: 'text-[#0D1B4B]', bg: 'bg-[#0D1B4B]/10', glow: 'rgba(13,27,75,0.12)', border: '#0D1B4B' },
  { icon: 'text-[#0284c7]', bg: 'bg-[#0284c7]/10', glow: 'rgba(2,132,199,0.12)', border: '#0284c7' },
  { icon: 'text-[#4f46e5]', bg: 'bg-[#4f46e5]/10', glow: 'rgba(79,70,229,0.12)', border: '#4f46e5' },
  { icon: 'text-[#1B6EF3]', bg: 'bg-[#1B6EF3]/10', glow: 'rgba(27,110,243,0.14)', border: '#1B6EF3' },
  { icon: 'text-[#0D1B4B]', bg: 'bg-[#0D1B4B]/10', glow: 'rgba(13,27,75,0.12)', border: '#0D1B4B' },
]

function ServiceCard({ service, index, totalCount = 6, isMobile = false }) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length]

  return (
    <Link
      to={`/services/${service.slug}`}
      className={`group relative flex flex-col bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 no-underline
        transition-all duration-300 hover:border-transparent hover:-translate-y-1.5
        ${
          isMobile
            ? 'shadow-[0_-3px_18px_rgba(0,0,0,0.06),0_14px_32px_rgba(13,27,75,0.12)]'
            : 'reveal shadow-sm hover:shadow-xl'
        } overflow-hidden`}
      style={{
        transitionDelay: isMobile ? undefined : `${index * 60}ms`,
        borderTop: isMobile ? `3.5px solid ${accent.border}` : undefined,
      }}
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
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${accent.bg} border border-slate-200 flex items-center justify-center
              group-hover:scale-110 transition-all duration-300 shadow-2xs`}
          >
            {createElement(getServiceIcon(service.icon), {
              className: `w-5 h-5 sm:w-6 sm:h-6 ${accent.icon} transition-colors`,
              strokeWidth: 1.75,
            })}
          </div>
          {isMobile && (
            <span className="text-xs font-mono font-bold text-slate-400">
              0{index + 1} <span className="text-slate-300">/</span> 0{totalCount}
            </span>
          )}
        </div>

        {service.tag && (
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-2xs"
            style={{ color: accent.border, background: `${accent.border}12`, borderColor: `${accent.border}30` }}
          >
            {service.tag}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-heading text-base sm:text-lg font-bold text-slate-800 group-hover:text-brand-blue transition-colors duration-200 mb-2">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed flex-1 mb-4 sm:mb-5 group-hover:text-slate-600 transition-colors">
        {service.shortDescription}
      </p>

      {/* Learn More CTA */}
      <span
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 mt-auto"
        style={{ color: accent.border }}
      >
        <span>Explore Service</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
      </span>
    </Link>
  )
}

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

/* ── Fallback Services (safety net if DB is connecting) ───────── */
const FALLBACK_SERVICES = [
  {
    id: '1',
    title: 'Custom Web Development',
    slug: 'web-development',
    icon: 'Globe',
    tag: 'Most Popular',
    shortDescription: 'High-performance, ultra-responsive web applications engineered with React, Next.js, Node.js, and PostgreSQL for maximum conversion speed.',
  },
  {
    id: '2',
    title: 'Digital Marketing & SEO',
    slug: 'digital-marketing-seo',
    icon: 'Megaphone',
    tag: 'High ROI',
    shortDescription: 'Revenue-focused digital growth engines spanning search dominance, programmatic ad management, and conversion funnel optimization.',
  },
  {
    id: '3',
    title: 'IT Consulting & Strategy',
    slug: 'it-consulting-strategy',
    icon: 'Lightbulb',
    tag: 'Expert Advice',
    shortDescription: 'Strategic IT advisory from veteran architects. We modernise legacy systems, establish microservices architectures, and align tech stacks.',
  },
  {
    id: '4',
    title: 'E-Commerce Solutions',
    slug: 'ecommerce-solutions',
    icon: 'Monitor',
    tag: 'Sell More',
    shortDescription: 'Turnkey high-converting digital storefronts, custom Shopify Plus developments, headless commerce platforms, and instant payment gateway integrations.',
  },
  {
    id: '5',
    title: 'Cloud Solutions & DevOps',
    slug: 'cloud-solutions-devops',
    icon: 'Settings',
    tag: 'Scalable',
    shortDescription: 'Mission-critical cloud orchestration on AWS, GCP, and Azure. Zero-downtime automated deployment pipelines and auto-scaling clusters.',
  },
  {
    id: '6',
    title: 'Branding & UI/UX Design',
    slug: 'branding-ui-ux-design',
    icon: 'Layers',
    tag: 'Stand Out',
    shortDescription: 'Award-winning product interfaces that captivate users. We design scalable design systems, interactive prototypes, and cohesive brand identities.',
  },
]

export default function ServicesSection() {
  const { data, isLoading } = useServices()
  const services = Array.isArray(data?.data) && data.data.length > 0 ? data.data : (isLoading ? [] : FALLBACK_SERVICES)
  const containerRef = useReveal()

  const displayServices = services.slice(0, 6)

  return (
    <section
      id="services"
      className="py-20 sm:py-24 bg-slate-50 relative isolate border-t border-slate-100"
      aria-labelledby="services-heading"
    >
      {/* Subtle background decorations safely clipped inside their own container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-150 h-150 bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-indigo-100/30 rounded-full blur-[120px]" />
      </div>

      <Container className="relative z-10">
        {/* Section heading */}
        <div className="reveal text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200 text-brand-blue text-xs font-bold uppercase tracking-widest mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enterprise Technology Capabilities</span>
          </div>
          <h2 id="services-heading" className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0D1B4B] tracking-tight mb-4">
            Engineered for{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
              Scalability &amp; Digital Growth
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            SnapTech Digital delivers mission-critical software solutions—from custom ERPs and client portals to cloud architecture and mobile apps—purpose-built for growing businesses with 100% IP handover.
          </p>
        </div>

        {/* ── Desktop & Tablet Grid (sm: screens and up) ── */}
        <div ref={containerRef} className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
          {isLoading && services.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={i >= 3 ? 'hidden sm:block' : 'block'}>
                  <ServiceCardSkeleton />
                </div>
              ))
            : displayServices.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
        </div>

        {/* ── Mobile Stacking Cards on Normal Scroll (< sm: screens) ── */}
        <div className="sm:hidden relative">
          {isLoading && services.length === 0 ? (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 animate-pulse h-64" />
          ) : (
            <div className="relative pb-8">
              {/* Stack Indicator Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                  <span>Stacking Capabilities ({displayServices.length} Services)</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 font-medium">
                  Scroll down &darr;
                </span>
              </div>

              {/* Pure CSS Stacking Deck - Card 1 stops, next slides over it, no page break */}
              <div className="flex flex-col space-y-6">
                {displayServices.map((service, index) => (
                  <div
                    key={service.id}
                    className="sticky"
                    style={{
                      top: `${76 + index * 10}px`,
                      zIndex: index + 10,
                    }}
                  >
                    <ServiceCard
                      service={service}
                      index={index}
                      totalCount={displayServices.length}
                      isMobile
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Explorer Action */}
        <div className="mt-12 sm:mt-14 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-brand-blue border border-slate-200 hover:border-brand-blue text-slate-700 hover:text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 group shadow-sm"
          >
            <Layers className="w-4 h-4 text-brand-blue group-hover:text-white group-hover:scale-110 transition-all" />
            <span>View All Engineering Services</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </Container>
    </section>
  )
}


/**
 * ServicesSection — Homepage services grid.
 * Features:
 * - Dynamic data from GET /api/services (Prisma Service model)
 * - Clean corporate white cards with brand color accents
 * - Reveal-on-scroll animation
 */
import { createElement, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Layers, CheckCircle2 } from 'lucide-react'
import { Container } from '@/components/ui'
import { ServiceCardSkeleton } from '@/components/ui/Skeleton'
import { useServices } from '@/hooks/useServices'
import { getServiceIcon } from '@/utils/serviceIcons'

/* Brand-aligned card accents for light background */
const CARD_ACCENTS = [
  { icon: 'text-[#1458d0]', bg: 'bg-blue-50/90', glow: 'rgba(20,88,208,0.18)', border: '#1458d0' },
  { icon: 'text-[#0369a1]', bg: 'bg-sky-50/90', glow: 'rgba(3,105,161,0.18)', border: '#0369a1' },
  { icon: 'text-[#047857]', bg: 'bg-emerald-50/90', glow: 'rgba(4,120,87,0.18)', border: '#047857' },
  { icon: 'text-[#b45309]', bg: 'bg-amber-50/90', glow: 'rgba(180,83,9,0.18)', border: '#b45309' },
  { icon: 'text-[#4338ca]', bg: 'bg-indigo-50/90', glow: 'rgba(67,56,202,0.18)', border: '#4338ca' },
  { icon: 'text-[#be185d]', bg: 'bg-pink-50/90', glow: 'rgba(190,24,93,0.18)', border: '#be185d' },
  { icon: 'text-[#6d28d9]', bg: 'bg-purple-50/90', glow: 'rgba(109,40,217,0.18)', border: '#6d28d9' },
]

/* Curated, verified key deliverable highlights for homepage cards */
const SERVICE_HIGHLIGHTS = {
  'web-development': [
    'Fast responsive web apps & portals',
    'Core Web Vitals & on-page SEO',
    '100% full source code ownership',
  ],
  'mobile-app-development': [
    'Unified iOS & Android codebase',
    'React Native & Flutter engineering',
    'App Store & Play Store publishing',
  ],
  'ecommerce-solutions': [
    'Turnkey Shopify & custom stores',
    'Secure UPI & card payment gateways',
    'Automated order & inventory sync',
  ],
  'digital-marketing-seo': [
    'Technical SEO & local Maps ranking',
    'Targeted Google & Meta ad campaigns',
    'GA4 conversion event tracking',
  ],
  'cloud-solutions-devops': [
    'AWS, GCP & DigitalOcean hosting',
    'CI/CD pipelines & Docker containers',
    'Automated backups & monitoring',
  ],
  'branding-ui-ux-design': [
    'Vector logos & brand guidelines',
    'Interactive Figma prototypes',
    'Modular UI design systems',
  ],
  'it-consulting-strategy': [
    'Software & architecture audits',
    'Vendor proposal evaluations',
    'Phased digital growth roadmaps',
  ],
}

function ServiceCard({ service, index, totalCount = 6, isMobile = false }) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length]
  const highlights = SERVICE_HIGHLIGHTS[service.slug] || [
    'Enterprise-grade code architecture',
    'Full source code & IP handover',
    'Direct priority technical support',
  ]

  return (
    <Link
      to={`/services/${service.slug}`}
      className={`group relative flex flex-col bg-white rounded-3xl p-6 sm:p-7 no-underline
        transition-all duration-300 hover:-translate-y-2 h-full
        border border-slate-200/80 hover:border-transparent
        ${
          isMobile
            ? 'shadow-[0_-4px_20px_rgba(0,0,0,0.06),0_16px_36px_rgba(13,27,75,0.12)]'
            : 'reveal shadow-[0_4px_24px_-6px_rgba(15,23,42,0.06)] hover:shadow-[0_24px_50px_-12px_rgba(15,23,42,0.14)]'
        } overflow-hidden`}
      style={{
        transitionDelay: isMobile ? undefined : `${index * 60}ms`,
        borderTop: isMobile ? `4px solid ${accent.border}` : undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 24px 50px -12px ${accent.glow}, 0 4px 16px rgba(0,0,0,0.04)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Top glowing ambient gradient blur on hover */}
      <div
        className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{ background: accent.border }}
      />

      {/* Top illuminated line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ color: accent.border }}
      />

      {/* Top row: Icon & Tag / Counter */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl ${accent.bg} border border-slate-200/90 flex items-center justify-center
              group-hover:scale-105 transition-all duration-300 shadow-xs`}
          >
            {createElement(getServiceIcon(service.icon), {
              className: `w-6 h-6 ${accent.icon} transition-transform duration-300 group-hover:scale-110`,
              strokeWidth: 1.8,
            })}
          </div>
          {isMobile && (
            <span className="text-xs font-mono font-bold text-slate-600">
              0{index + 1} <span className="text-slate-400" aria-hidden="true">/</span> 0{totalCount}
            </span>
          )}
        </div>

        {service.tag && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wide uppercase border shadow-2xs"
            style={{
              color: accent.border,
              backgroundColor: `${accent.border}0d`,
              borderColor: `${accent.border}30`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent.border }} />
            <span>{service.tag}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-heading text-lg sm:text-xl font-extrabold text-[#0D1B4B] group-hover:text-brand-blue transition-colors duration-200 mb-2.5">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed flex-1 mb-5 group-hover:text-slate-700 transition-colors">
        {service.shortDescription}
      </p>

      {/* Deliverable Highlights Checklist */}
      <div className="pt-4 border-t border-slate-100 mb-5 space-y-2">
        {highlights.map((hl) => (
          <div key={hl} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accent.border}15`, color: accent.border }}
            >
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <span className="truncate">{hl}</span>
          </div>
        ))}
      </div>

      {/* Bottom CTA Row */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <span
          className="text-xs sm:text-sm font-bold tracking-tight transition-colors duration-200 flex items-center gap-1.5"
          style={{ color: accent.border }}
        >
          <span>Explore Service</span>
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 shadow-2xs"
          style={{ backgroundColor: `${accent.border}12`, color: accent.border }}
        >
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
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
    shortDescription:
      'Custom, high-speed websites, web applications, and customer portals engineered for fast loading speeds, search visibility, and conversion-focused performance.',
  },
  {
    id: '2',
    title: 'Mobile App Development',
    slug: 'mobile-app-development',
    icon: 'Smartphone',
    tag: 'iOS & Android',
    shortDescription:
      'Cross-platform iOS and Android mobile applications built with React Native and Flutter for seamless mobile performance, offline caching, and app store deployment.',
  },
  {
    id: '3',
    title: 'Digital Marketing & SEO',
    slug: 'digital-marketing-seo',
    icon: 'Megaphone',
    tag: 'Lead Acquisition',
    shortDescription:
      'Targeted search engine optimization (SEO), Google Ads, and Meta advertising campaigns structured to generate qualified commercial leads and measurable ROI.',
  },
  {
    id: '4',
    title: 'E-Commerce Solutions',
    slug: 'ecommerce-solutions',
    icon: 'Monitor',
    tag: 'Online Storefronts',
    shortDescription:
      'Turnkey digital storefronts, custom Shopify setups, and scalable online catalogs engineered for smooth checkout flows and automated order processing.',
  },
  {
    id: '5',
    title: 'Cloud Solutions & DevOps',
    slug: 'cloud-solutions-devops',
    icon: 'Settings',
    tag: 'Cloud Infrastructure',
    shortDescription:
      'Secure cloud hosting setup, containerized deployments, automated backups, and proactive monitoring on AWS, Google Cloud, and DigitalOcean.',
  },
  {
    id: '6',
    title: 'Branding & UI/UX Design',
    slug: 'branding-ui-ux-design',
    icon: 'Layers',
    tag: 'Brand Identity',
    shortDescription:
      'Intuitive user interface designs, interactive prototypes, and unified corporate visual identities that establish credibility and enhance customer engagement.',
  },
  {
    id: '7',
    title: 'IT Consulting & Strategy',
    slug: 'it-consulting-strategy',
    icon: 'Lightbulb',
    tag: 'Technical Advisory',
    shortDescription:
      'Independent technical consulting to help business owners evaluate software options, audit existing IT systems, and plan realistic digital roadmaps.',
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

        {/* ── Desktop & Tablet Grid (sm: screens and up — 6 Cards in 3x2 Matrix) ── */}
        <div ref={containerRef} className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 reveal-stagger">
          {isLoading && services.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))
            : displayServices.map((service, index) => (
                <div key={service.id || service.slug || index} className="h-full">
                  <ServiceCard
                    service={service}
                    index={index}
                    totalCount={displayServices.length}
                  />
                </div>
              ))}
        </div>

        {/* ── Mobile Stacking Cards on Normal Scroll (< sm: screens) ── */}
        <div className="sm:hidden relative">
          {isLoading && services.length === 0 ? (
            <div className="p-4 bg-white rounded-3xl border border-slate-200 animate-pulse h-64" />
          ) : (
            <div className="relative pb-8">
              {/* Stack Indicator Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                  <span>Stacking Capabilities ({displayServices.length} Services)</span>
                </div>
                <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1 font-semibold">
                  Scroll down &darr;
                </span>
              </div>

              {/* Pure CSS Stacking Deck - Card 1 stops, next slides over it, no page break */}
              <div className="flex flex-col space-y-6">
                {displayServices.map((service, index) => (
                  <div
                    key={service.id || service.slug || index}
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
        <div className="reveal mt-12 sm:mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 p-3 sm:px-6 sm:py-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
              <Sparkles className="w-4 h-4 text-brand-blue shrink-0" />
              <span>Looking for specialized IT consulting, cloud audits, or custom advisory?</span>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D1B4B] hover:bg-[#1B6EF3] text-white text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 group shadow-sm hover:shadow shrink-0"
            >
              <Layers className="w-4 h-4" />
              <span>View All Services &amp; Capabilities</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}


/**
 * /services/:slug — 100% Dynamic, Premium Enterprise Service Detail Page.
 * Styled in Snaptech's clean, high-impact light theme matching the Home Page.
 * Powered directly by the PostgreSQL database with zero static text locks.
 */
import { useState, useMemo, createElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Shield,
  Zap,
  Users,
  Star,
  BadgeCheck,
  MessageSquare,
} from 'lucide-react'
import { Container, SEO } from '@/components/ui'
import { serviceSchema, breadcrumbSchema, SITE } from '@/components/ui/SEO'
import { useService, useServices } from '@/hooks/useServices'
import { useProjects } from '@/hooks/useProjects'
import { getServiceIcon } from '@/utils/serviceIcons'
import { useSiteSettings } from '@/hooks/useContent'
import { api } from '@/utils/api'
import { ProjectModal } from '@/components/sections/PortfolioSection'

/* ── Fallback Imagery for Projects ────────────────────────────── */
const PROJECT_DEFAULT_IMAGES = {
  'logistics-mobile-app': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80&auto=format&fit=crop',
  'corporate-brand-identity': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80&auto=format&fit=crop',
  'digital-marketing-campaign': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop',
  'ecommerce-platform': 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80&auto=format&fit=crop',
  'textile-erp-system': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80&auto=format&fit=crop',
  'restaurant-website-seo': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop',
  'real-estate-social-media': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format&fit=crop',
}

/* ── Service Color Accents (Light-theme friendly) ─────────────── */
const SERVICE_THEMES = {
  'web-development': { color: 'from-blue-600 to-cyan-500', glow: 'bg-blue-50', border: 'border-blue-200' },
  'digital-marketing-seo': { color: 'from-amber-500 to-orange-500', glow: 'bg-amber-50', border: 'border-amber-200' },
  'it-consulting-strategy': { color: 'from-purple-600 to-indigo-500', glow: 'bg-purple-50', border: 'border-purple-200' },
  'ecommerce-solutions': { color: 'from-emerald-600 to-teal-500', glow: 'bg-emerald-50', border: 'border-emerald-200' },
  'cloud-solutions-devops': { color: 'from-sky-600 to-blue-500', glow: 'bg-sky-50', border: 'border-sky-200' },
  'branding-ui-ux-design': { color: 'from-pink-500 to-rose-500', glow: 'bg-pink-50', border: 'border-pink-200' },
  'mobile-app-development': { color: 'from-cyan-600 to-blue-600', glow: 'bg-cyan-50', border: 'border-cyan-200' },
}

function getServiceTheme(slug) {
  return (
    SERVICE_THEMES[slug] || {
      color: 'from-blue-600 to-cyan-500',
      glow: 'bg-blue-50',
      border: 'border-blue-200',
    }
  )
}

/* ── Fallback structured steps for custom services ───────────── */
const DEFAULT_ENGINEERING_PROCESS = [
  { step: '01', title: 'Technical Discovery & Scoping', desc: 'Comprehensive architecture audit, requirements analysis, and milestone specification.' },
  { step: '02', title: 'System Blueprint & Prototyping', desc: 'Figma interactive wireframes and scalable cloud infrastructure blueprint design.' },
  { step: '03', title: 'Agile Engineering & QA', desc: 'Iterative development sprints with clean code, automated tests, and continuous CI/CD.' },
  { step: '04', title: 'Deployment & SLA Handover', desc: 'Zero-downtime production deployment, APM monitoring setup, and post-launch warranty.' },
]

function DetailSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20 text-slate-900">
      <Container>
        <div className="h-6 w-32 bg-slate-200 rounded-full mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-14 w-14 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-12 w-3/4 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-5 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-5/6 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        </div>
      </Container>
    </div>
  )
}

export default function ServiceDetailPage() {
  const { slug } = useParams()
  const { data, isLoading } = useService(slug)
  const { data: allServicesData } = useServices()
  const { data: projectsData } = useProjects()
  const { data: settingsData } = useSiteSettings()

  // Interactive modal state for projects
  const [selectedProject, setSelectedProject] = useState(null)

  // Direct consultation form state
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientMessage, setClientMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  const service = data?.data
  const cfg = settingsData?.data || {}

  const phone = cfg.phone || '+91 75970 00601'
  const contactEmail = cfg.email || 'info@snaptech.digital'
  const whatsappNum = (cfg.whatsapp || cfg.phone || '917597000601').replace(/[^0-9]/g, '')

  const theme = getServiceTheme(slug)

  // Pure dynamic data extraction
  const keyFeatures = useMemo(() => {
    if (service?.keyFeatures && service.keyFeatures.length > 0) return service.keyFeatures
    return [
      'Tailored Enterprise Specification',
      '100% IP & Full Source Code Ownership',
      'Zero-Vulnerability Code Warranty',
      'High-Performance & Conversion Optimized',
      'Integrated Telemetry & Analytics',
      '30-Day Complimentary Post-Launch SLA',
    ]
  }, [service])

  const techStack = useMemo(() => {
    if (service?.techStack && service.techStack.length > 0) return service.techStack
    return ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Tailwind CSS']
  }, [service])

  const process = useMemo(() => {
    if (service?.process && Array.isArray(service.process) && service.process.length > 0) {
      return service.process
    }
    return DEFAULT_ENGINEERING_PROCESS
  }, [service])

  const tag = service?.tag || 'Enterprise Grade'
  const deliveryTime = service?.deliveryTime || '2–4 Weeks Sprint'

  // Dynamic related projects matching service domain
  const relatedProjects = useMemo(() => {
    if (!projectsData?.data) return []
    const sSlug = (slug || '').toLowerCase()

    return projectsData.data
      .filter((p) => {
        const pCat = (p.category || '').toLowerCase()
        const pTech = (p.technologies || []).join(' ').toLowerCase()

        if (sSlug.includes('web') && (pCat.includes('web') || pCat.includes('commerce') || pTech.includes('react'))) return true
        if (sSlug.includes('app') && (pCat.includes('app') || pTech.includes('react native') || pTech.includes('flutter'))) return true
        if (sSlug.includes('marketing') && (pCat.includes('marketing') || pCat.includes('seo'))) return true
        if (sSlug.includes('branding') && (pCat.includes('brand') || pCat.includes('design'))) return true
        if (sSlug.includes('cloud') && (pTech.includes('docker') || pTech.includes('aws') || pTech.includes('cloud'))) return true
        return false
      })
      .slice(0, 2)
  }, [projectsData, slug])

  // Sibling services (other available capabilities)
  const relatedServices = useMemo(() => {
    const list = allServicesData?.data || []
    return list.filter((s) => s.slug !== slug).slice(0, 3)
  }, [allServicesData?.data, slug])

  const handleInquirySubmit = async (e) => {
    e.preventDefault()
    if (!clientName || !clientEmail || !clientPhone) return
    setSubmitting(true)
    setSubmitError(false)
    try {
      await api.post('/contact', {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        serviceInterested: service?.title || 'IT Solutions',
        message: `Direct Service Desk Inquiry for ${service?.title || slug}. Note: ${clientMessage || 'Please share detailed architecture & pricing breakdown.'}`,
        _hp: '',
      })
      setSubmitted(true)
    } catch {
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return <DetailSkeleton />

  if (!service) {
    return (
      <div className="bg-slate-50 min-h-screen py-36 text-center text-slate-900">
        <Container>
          <div className="max-w-md mx-auto p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <p className="text-slate-600 text-lg mb-6">Service capability not found in database.</p>
            <Link
              to="/services"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#0D1B4B] hover:bg-[#1B6EF3] text-white font-bold text-sm transition-all"
            >
              ← Return to Services Directory
            </Link>
          </div>
        </Container>
      </div>
    )
  }


  return (
    <div className="bg-slate-50/50 min-h-screen text-slate-900 selection:bg-blue-500/20 selection:text-[#1a3e8c]">
      <SEO
        title={`${service.title} — Snaptech IT Solutions | Hindustan Projects`}
        description={service.shortDescription}
        path={`/services/${service.slug}`}
        keywords={`${service.title}, Snaptech IT, ${service.title} enterprise, Hindustan Projects IT`}
        schemas={[
          serviceSchema({
            title: service.title,
            description: service.shortDescription,
            url: `${SITE.url}/services/${service.slug}`,
            serviceType: service.title,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
        ]}
      />

      {/* ── 1. Light Hero Header ────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 overflow-hidden border-b border-slate-100 bg-white">
        {/* Ambient subtle background grid & blur */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1a3e8c]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-400/5 rounded-full blur-[120px] pointer-events-none" />

        <Container className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-8 font-mono" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-[#1a3e8c] transition-colors">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link to="/services" className="hover:text-[#1a3e8c] transition-colors">
              Services
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-[#1a3e8c] font-semibold">{service.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            {/* Left: Title + Description */}
            <div className="flex-1 max-w-3xl">
              {/* Tag Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 text-[#1a3e8c] text-xs font-mono font-bold uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-[#1a3e8c] animate-pulse" />
                {tag}
              </div>

              {/* Icon + Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.color} flex items-center justify-center shadow-md shrink-0`}
                >
                  {createElement(getServiceIcon(service?.icon || 'Globe'), {
                    className: 'w-8 h-8 text-white',
                    strokeWidth: 1.8,
                  })}
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  {service.title}
                </h1>
              </div>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
                {service.shortDescription}
              </p>

              {/* Quick Telemetry & SLA Pills */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                  <Clock className="w-4 h-4 text-[#1a3e8c]" />
                  <span className="text-xs sm:text-sm text-slate-700">
                    Sprint Cycle: <strong className="text-slate-900 font-mono">{deliveryTime}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs sm:text-sm text-slate-700">
                    <strong className="text-emerald-800">100% Zero-Defect</strong> Code Warranty
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-xs sm:text-sm text-slate-700">
                    <strong className="text-amber-900">Hindustan Projects</strong> Backed
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Banner Card */}
            <div className="lg:w-84 shrink-0">
              <div className="relative rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xl shadow-slate-200/60">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <span className="text-xs font-mono font-bold text-[#1a3e8c] uppercase tracking-wider">
                    Engage Architecture
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                  Launch {service.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
                  Book a free technical scoping call with our senior architects. Immediate NDA protection available.
                </p>
                <a
                  href="#consultation-desk"
                  className="inline-flex items-center justify-center w-full py-3 rounded-xl mb-3 bg-[#0D1B4B] hover:bg-[#1B6EF3] text-white font-bold text-sm shadow-md shadow-blue-900/10 transition-all text-center"
                >
                  Request Technical Proposal
                </a>
                <a
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                    `Hello Snaptech, I am interested in consulting for ${service.title} architecture.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70 text-emerald-800 text-sm font-semibold hover:bg-emerald-100 transition-all duration-200"
                >
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                  Direct WhatsApp Hotline
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 2. Main Content Breakdown ──────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50/60 relative">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* ── Left Column (col-span-8) ── */}
            <div className="lg:col-span-8 space-y-16">
              {/* Detailed Overview */}
              <div className="p-8 rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#1a3e8c] mb-3 block">
                  // CAPABILITY SPECIFICATION
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  Engineering Scope: {service.title}
                </h2>
                <div className="text-slate-600 leading-relaxed text-base sm:text-lg space-y-4">
                  <p>{service.fullDescription || service.shortDescription}</p>
                </div>
              </div>

              {/* Dynamic Technical Deliverables */}
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#1a3e8c] mb-3 block">
                  // VERIFIED DELIVERABLES
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
                  What You Receive In Production
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {keyFeatures.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3.5 p-4 sm:p-5 rounded-xl border border-slate-200/80 bg-white
                        hover:border-blue-300 hover:shadow-md transition-all duration-200 shadow-sm"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-800 font-medium leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Deployment Roadmap (Process) */}
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#1a3e8c] mb-3 block">
                  // EXECUTION LIFECYCLE
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">
                  Deployment Roadmap &amp; Milestones
                </h2>
                <div className="space-y-5">
                  {process.map((step, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row gap-5 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm group hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 sm:flex-col sm:items-center">
                        <div
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D1B4B] to-[#1B6EF3] flex items-center justify-center text-white font-heading font-extrabold text-base shrink-0 shadow-md"
                        >
                          {step.step || String(i + 1).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-bold text-slate-900 mb-1.5 group-hover:text-[#1a3e8c] transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Tech Stack Matrix */}
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#1a3e8c] mb-3 block">
                  // MASTERED TECHNOLOGIES &amp; FRAMEWORKS
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-5 tracking-tight">
                  Verified Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-mono font-semibold
                        text-slate-800 hover:border-blue-400 hover:bg-blue-50/50 shadow-sm transition-all duration-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Live Flagship Projects */}
              {relatedProjects.length > 0 && (
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#1a3e8c] mb-3 block">
                    // PROVEN TRACK RECORD
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
                    Flagship Deployments in {service.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {relatedProjects.map((p) => {
                      const img =
                        p.thumbnailUrl?.trim() ||
                        PROJECT_DEFAULT_IMAGES[p.slug] ||
                        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80&auto=format&fit=crop'
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProject(p)}
                          className="group rounded-2xl border border-slate-200 bg-white overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:border-blue-400 transition-all"
                        >
                          <div className="h-44 overflow-hidden relative">
                            <img
                              src={img}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute bottom-3 left-3 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/90 text-slate-900 shadow-sm">
                              {p.clientName}
                            </span>
                          </div>
                          <div className="p-5">
                            <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-[#1a3e8c] transition-colors mb-1.5">
                              {p.title}
                            </h3>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                              {p.description}
                            </p>
                            <span className="text-xs font-bold text-[#1a3e8c] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                              Inspect Case Study <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Back Link */}
              <div className="pt-6 border-t border-slate-200">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#1a3e8c] hover:text-[#0D1B4B] transition-colors duration-150 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform duration-200" />
                  Return To All Solutions Directory
                </Link>
              </div>
            </div>

            {/* ── Right Sidebar (col-span-4) ── */}
            <div id="consultation-desk" className="lg:col-span-4 space-y-6">
              {/* Interactive Quotation Form */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xl shadow-slate-200/60">
                <div className="relative">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <span className="text-xs font-mono font-bold text-[#1a3e8c] uppercase tracking-wider">
                      Direct Solution Desk
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-1.5">
                    Commission {service.title}
                  </h3>
                  <p className="text-slate-600 text-xs mb-5">
                    Direct technical consultation with our lead architects. 2-hour response SLA.
                  </p>

                  {submitted ? (
                    <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="font-bold text-slate-900 text-sm">Consultation Scheduled!</p>
                      <p className="text-xs text-slate-600">
                        Our technical architect will contact you within 2 hours at <span className="font-bold text-[#1a3e8c]">{clientPhone || clientEmail}</span>.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1a3e8c] focus:ring-2 focus:ring-[#1a3e8c]/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="rahul@company.com"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1a3e8c] focus:ring-2 focus:ring-[#1a3e8c]/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1a3e8c] focus:ring-2 focus:ring-[#1a3e8c]/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Scope Notes (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={clientMessage}
                          onChange={(e) => setClientMessage(e.target.value)}
                          placeholder="Requirements or deadlines..."
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1a3e8c] focus:ring-2 focus:ring-[#1a3e8c]/10 transition-all resize-none"
                        />
                      </div>

                      {submitError && (
                        <p className="text-[11px] text-red-600 font-semibold">Submission failed. Please call us directly.</p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl bg-[#0D1B4B] hover:bg-[#1B6EF3] text-white font-bold text-xs shadow-md shadow-blue-900/10 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {submitting ? 'Connecting…' : 'Submit Consultation Request'}
                      </button>
                    </form>
                  )}

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <a
                      href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                        `Hello Snaptech, I would like to consult for ${service.title} architecture.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-[#25D366]" />
                      Direct WhatsApp Priority Desk
                    </a>
                  </div>
                </div>
              </div>

              {/* Direct Support & Phone Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-sm">
                <p className="text-xs font-mono font-bold text-[#1a3e8c] uppercase tracking-wider">
                  Direct Engineering Desk
                </p>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-3.5 group p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#1a3e8c]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 font-mono">Immediate Telephone</p>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-[#1a3e8c] transition-colors">
                      {phone}
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3.5 group p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#1a3e8c]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 font-mono">Official Inquiries</p>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-[#1a3e8c] transition-colors truncate">
                      {contactEmail}
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-2 pt-2 text-xs text-slate-500 border-t border-slate-100 font-mono">
                  <Zap className="w-3.5 h-3.5 text-[#1a3e8c]" />
                  24-Hour Guaranteed Proposal SLA
                </div>
              </div>

              {/* Direct Link to Pricing Page */}
              <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1a3e8c] uppercase tracking-wider mb-2">
                  <BadgeCheck className="w-4 h-4 text-[#1a3e8c]" /> Transparent Pricing
                </div>
                <h4 className="font-heading text-base font-bold text-[#0D1B4B] mb-2">
                  Check Standard Package Tiers
                </h4>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Compare our Starter, Business, and Enterprise packages with deterministic deliverables and SLA timelines.
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a3e8c] hover:text-[#0D1B4B] transition-colors"
                >
                  <span>Explore Pricing Matrix</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Group SLA Guarantees */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <p className="text-xs font-mono font-bold text-[#1a3e8c] uppercase tracking-wider mb-4">
                  Group SLA Assurances
                </p>
                <ul className="space-y-3.5">
                  {[
                    { icon: Zap, text: 'Strict Sprint Milestones With Zero Slippage' },
                    { icon: Shield, text: 'Hindustan Projects Enterprise Backing' },
                    { icon: Users, text: 'Dedicated Lead Engineer & Scrum Master' },
                    { icon: Star, text: '30-Day Post-Launch Warranty Included' },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                      <item.icon className="w-4 h-4 text-[#1a3e8c] shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 3. Sibling Services (Explore More) ──────────────────────── */}
      {relatedServices.length > 0 && (
        <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
          <Container>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#1a3e8c] mb-2 block">
                  // ECOSYSTEM EXPANSION
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Complementary Engineering Modules
                </h2>
              </div>
              <Link
                to="/services"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[#1a3e8c] hover:text-[#0D1B4B] transition-colors"
              >
                View Full Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedServices.map((s) => {
                const RelIcon = getServiceIcon(s.icon || 'Globe')
                const relTheme = getServiceTheme(s.slug)
                return (
                  <Link
                    key={s.id}
                    to={`/services/${s.slug}`}
                    className="group bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col
                      hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${relTheme.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300 text-white`}
                    >
                      <RelIcon className="w-5 h-5 text-white" strokeWidth={1.8} />
                    </div>
                    <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-[#1a3e8c] transition-colors mb-2">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed flex-1 mb-5 line-clamp-2">
                      {s.shortDescription || ''}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1a3e8c] group-hover:gap-2 transition-all duration-200">
                      Explore Module <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </Container>
        </section>
      )}

      {/* Case Study Modal */}
      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  )
}

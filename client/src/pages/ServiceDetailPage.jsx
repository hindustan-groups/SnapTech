/**
 * /services/:slug — 100% Dynamic, Premium Enterprise Service Detail Page.
 * Powered directly by the PostgreSQL database with zero static text locks.
 */
import { useState, useMemo } from 'react'
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
  Sparkles,
  Cpu,
  BadgeCheck,
  Send,
  MessageSquare,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
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

/* ── Ambient Theme Accents ────────────────────────────────────── */
const SERVICE_THEMES = {
  'web-development': { color: 'from-blue-500 to-cyan-400', bgGlow: 'from-blue-500/20 to-cyan-400/5', border: 'border-cyan-500/30' },
  'digital-marketing-seo': { color: 'from-orange-500 to-rose-400', bgGlow: 'from-orange-500/20 to-rose-400/5', border: 'border-orange-500/30' },
  'it-consulting-strategy': { color: 'from-violet-500 to-fuchsia-400', bgGlow: 'from-violet-500/20 to-fuchsia-400/5', border: 'border-purple-500/30' },
  'ecommerce-solutions': { color: 'from-emerald-500 to-teal-400', bgGlow: 'from-emerald-500/20 to-teal-400/5', border: 'border-emerald-500/30' },
  'cloud-solutions-devops': { color: 'from-sky-500 to-indigo-400', bgGlow: 'from-sky-500/20 to-indigo-400/5', border: 'border-sky-500/30' },
  'branding-ui-ux-design': { color: 'from-pink-500 to-amber-400', bgGlow: 'from-pink-500/20 to-amber-400/5', border: 'border-pink-500/30' },
  'mobile-app-development': { color: 'from-cyan-500 to-blue-500', bgGlow: 'from-cyan-500/20 to-blue-500/5', border: 'border-cyan-500/30' },
}

function getServiceTheme(slug) {
  return (
    SERVICE_THEMES[slug] || {
      color: 'from-blue-500 to-cyan-400',
      bgGlow: 'from-blue-500/20 to-cyan-400/5',
      border: 'border-cyan-500/30',
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
    <div className="bg-[#020714] min-h-screen pt-32 pb-20 text-slate-100">
      <Container>
        <div className="h-6 w-32 bg-white/10 rounded-full mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-14 w-14 rounded-2xl bg-white/10 animate-pulse" />
            <div className="h-12 w-3/4 bg-white/10 rounded-xl animate-pulse" />
            <div className="h-5 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-5 w-5/6 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-80 rounded-2xl bg-slate-900/60 border border-white/10 animate-pulse" />
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
  const allServices = allServicesData?.data || []
  const cfg = settingsData?.data || {}

  const phone = cfg.phone || '+91 75970 00601'
  const contactEmail = cfg.email || 'info@snaptech.digital'
  const whatsappNum = (cfg.whatsapp || cfg.phone || '919929120431').replace(/[^0-9]/g, '')

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
    const sTitle = (service?.title || '').toLowerCase()
    const sSlug = (slug || '').toLowerCase()

    return projectsData.data
      .filter((p) => {
        const pCat = (p.category || '').toLowerCase()
        const pTitle = (p.title || '').toLowerCase()
        const pTech = (p.technologies || []).join(' ').toLowerCase()

        if (sSlug.includes('web') && (pCat.includes('web') || pCat.includes('commerce') || pTech.includes('react'))) return true
        if (sSlug.includes('app') && (pCat.includes('app') || pTech.includes('react native') || pTech.includes('flutter'))) return true
        if (sSlug.includes('marketing') && (pCat.includes('marketing') || pCat.includes('seo'))) return true
        if (sSlug.includes('branding') && (pCat.includes('brand') || pCat.includes('design'))) return true
        if (sSlug.includes('cloud') && (pTech.includes('docker') || pTech.includes('aws') || pTech.includes('cloud'))) return true
        return false
      })
      .slice(0, 2)
  }, [projectsData, service, slug])

  // Sibling services (other available capabilities)
  const relatedServices = useMemo(() => {
    return allServices.filter((s) => s.slug !== slug).slice(0, 3)
  }, [allServices, slug])

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
      <div className="bg-[#020714] min-h-screen py-36 text-center text-white">
        <Container>
          <div className="max-w-md mx-auto p-8 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <p className="text-slate-300 text-lg mb-6">Service capability not found in database.</p>
            <Button as={Link} to="/services" variant="primary">
              ← Return to Services Directory
            </Button>
          </div>
        </Container>
      </div>
    )
  }

  const IconComponent = getServiceIcon(service.icon || 'Globe')

  return (
    <div className="bg-[#020714] min-h-screen text-slate-100 selection:bg-brand-cyan/20 selection:text-brand-cyan">
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

      {/* ── 1. Cyber Hero Header ────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 overflow-hidden border-b border-white/10 bg-[#020714]">
        {/* Subtle grid pattern & glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${theme.bgGlow} opacity-70 pointer-events-none`} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-cyan/15 rounded-full blur-[100px] pointer-events-none" />

        <Container className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-8 font-mono" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-brand-cyan transition-colors">
              Home
            </Link>
            <span className="text-white/20">/</span>
            <Link to="/services" className="hover:text-brand-cyan transition-colors">
              Services
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-brand-cyan font-semibold">{service.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            {/* Left: Title + Description */}
            <div className="flex-1 max-w-3xl">
              {/* Tag Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                {tag}
              </div>

              {/* Icon + Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.color} flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] shrink-0`}
                >
                  <IconComponent className="w-8 h-8 text-white" strokeWidth={1.8} />
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                  {service.title}
                </h1>
              </div>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-8 font-light">
                {service.shortDescription}
              </p>

              {/* Quick Telemetry & SLA Pills */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <Clock className="w-4 h-4 text-brand-cyan" />
                  <span className="text-xs sm:text-sm text-slate-300">
                    Sprint Cycle: <strong className="text-white font-mono">{deliveryTime}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs sm:text-sm text-slate-300">
                    <strong className="text-white">100% Zero-Defect</strong> Code Warranty
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-xs sm:text-sm text-slate-300">
                    <strong className="text-white">Hindustan Projects</strong> Backed
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Banner Card */}
            <div className="lg:w-84 shrink-0">
              <div className="relative rounded-2xl border border-brand-cyan/30 bg-slate-900/80 backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <span className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">
                    Engage Architecture
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white mb-2">
                  Launch {service.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed font-light">
                  Book a free technical scoping call with our senior architects. Immediate NDA protection available.
                </p>
                <a
                  href="#consultation-desk"
                  className="inline-flex items-center justify-center w-full py-3 rounded-xl mb-3 bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-brand-primary-dark hover:to-brand-cyan-dark text-white font-bold text-sm shadow-[0_0_20px_rgba(30,107,238,0.4)] border border-brand-cyan/40 transition-all text-center"
                >
                  Request Technical Proposal
                </a>
                <a
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                    `Hello Snaptech, I am interested in consulting for ${service.title} architecture.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/15
                    text-slate-300 text-sm font-medium hover:bg-white/5 hover:text-white transition-all duration-200"
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
      <section className="py-16 sm:py-20 lg:py-24 bg-[#020714] relative">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* ── Left Column (col-span-8) ── */}
            <div className="lg:col-span-8 space-y-16">
              {/* Detailed Overview */}
              <div className="p-8 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
                  // CAPABILITY SPECIFICATION
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-4">
                  Engineering Scope: {service.title}
                </h2>
                <div className="text-slate-300 leading-relaxed text-base sm:text-lg font-light space-y-4">
                  <p>{service.fullDescription || service.shortDescription}</p>
                </div>
              </div>

              {/* Dynamic Technical Deliverables */}
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
                  // VERIFIED DELIVERABLES
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-6">
                  What You Receive In Production
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {keyFeatures.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3.5 p-4 sm:p-5 rounded-xl border border-white/10 bg-slate-900/70
                        hover:border-brand-cyan/40 hover:bg-slate-900/90 transition-all duration-200"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-200 font-medium leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Deployment Roadmap (Process) */}
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
                  // EXECUTION LIFECYCLE
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-8">
                  Deployment Roadmap &amp; Milestones
                </h2>
                <div className="space-y-6">
                  {process.map((step, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row gap-5 p-6 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl group hover:border-brand-cyan/40 transition-all"
                    >
                      <div className="flex items-center gap-3 sm:flex-col sm:items-center">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.color} flex items-center justify-center text-white font-heading font-extrabold text-base shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.3)]`}
                        >
                          {step.step || String(i + 1).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-bold text-white mb-1.5 group-hover:text-brand-cyan transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-300/80 leading-relaxed font-light">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Tech Stack Matrix */}
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
                  // MASTERED TECHNOLOGIES &amp; FRAMEWORKS
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-5">
                  Verified Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 rounded-xl border border-brand-cyan/30 bg-brand-cyan/5 text-xs sm:text-sm font-mono
                        text-brand-cyan hover:border-brand-cyan/60 hover:bg-brand-cyan/15 transition-all duration-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Live Flagship Projects */}
              {relatedProjects.length > 0 && (
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
                    // PROVEN TRACK RECORD
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-6">
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
                          className="group rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden cursor-pointer hover:border-brand-cyan/50 hover:shadow-xl transition-all"
                        >
                          <div className="h-44 overflow-hidden relative">
                            <img
                              src={img}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                            <span className="absolute bottom-3 left-3 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan">
                              {p.clientName}
                            </span>
                          </div>
                          <div className="p-5">
                            <h3 className="font-heading text-base font-bold text-white group-hover:text-brand-cyan transition-colors mb-1.5">
                              {p.title}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3 font-light">
                              {p.description}
                            </p>
                            <span className="text-xs font-semibold text-brand-cyan inline-flex items-center gap-1 group-hover:gap-2 transition-all">
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
              <div className="pt-6 border-t border-white/10">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan hover:text-white transition-colors duration-150 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform duration-200" />
                  Return To All Solutions Directory
                </Link>
              </div>
            </div>

            {/* ── Right Sidebar (col-span-4) ── */}
            <div id="consultation-desk" className="lg:col-span-4 space-y-6">
              {/* Interactive Quotation Form */}
              <div className="relative rounded-2xl overflow-hidden border border-brand-cyan/40 bg-gradient-to-b from-slate-900 to-[#020714] p-6 sm:p-7 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/15 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <span className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">
                      Direct Solution Desk
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-1.5">
                    Commission {service.title}
                  </h3>
                  <p className="text-slate-400 text-xs mb-5 font-light">
                    Direct technical consultation with our lead architects. 2-hour response SLA.
                  </p>

                  {submitted ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="font-bold text-white text-sm">Consultation Scheduled!</p>
                      <p className="text-xs text-slate-300">
                        Our technical architect will contact you within 2 hours at <span className="text-brand-cyan">{clientPhone || clientEmail}</span>.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="rahul@company.com"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                          Scope Notes (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={clientMessage}
                          onChange={(e) => setClientMessage(e.target.value)}
                          placeholder="Requirements or deadlines..."
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan resize-none"
                        />
                      </div>

                      {submitError && (
                        <p className="text-[11px] text-red-400">Submission failed. Please call us directly.</p>
                      )}

                      <Button
                        type="submit"
                        disabled={submitting}
                        variant="primary"
                        fullWidth
                        className="bg-gradient-to-r from-brand-primary to-brand-cyan text-white font-bold py-2.5 text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      >
                        {submitting ? 'Connecting…' : 'Submit Consultation Request'}
                      </Button>
                    </form>
                  )}

                  <div className="pt-4 mt-4 border-t border-white/10">
                    <a
                      href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                        `Hello Snaptech, I would like to consult for ${service.title} architecture.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/15
                        text-slate-300 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-[#25D366]" />
                      Direct WhatsApp Priority Desk
                    </a>
                  </div>
                </div>
              </div>

              {/* Direct Support & Phone Card */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 space-y-4 backdrop-blur-xl">
                <p className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">
                  Direct Engineering Desk
                </p>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-3.5 group p-2.5 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-brand-cyan" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-mono">Immediate Telephone</p>
                    <p className="text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors">
                      {phone}
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3.5 group p-2.5 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-brand-cyan" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-mono">Official Inquiries</p>
                    <p className="text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors truncate">
                      {contactEmail}
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-2 pt-2 text-xs text-slate-400 border-t border-white/10 font-mono">
                  <Zap className="w-3.5 h-3.5 text-brand-cyan" />
                  24-Hour Guaranteed Proposal SLA
                </div>
              </div>

              {/* Direct Link to Pricing Page */}
              <div className="rounded-2xl border border-brand-cyan/30 bg-gradient-to-br from-blue-950/40 to-slate-900/80 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider mb-2">
                  <BadgeCheck className="w-4 h-4 text-brand-cyan" /> Transparent Pricing
                </div>
                <h4 className="font-heading text-base font-bold text-white mb-2">
                  Check Standard Package Tiers
                </h4>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed font-light">
                  Compare our Starter, Business, and Enterprise packages with deterministic deliverables and SLA timelines.
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-cyan hover:text-white transition-colors"
                >
                  <span>Explore Pricing Matrix</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Group SLA Guarantees */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <p className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider mb-4">
                  Group SLA Assurances
                </p>
                <ul className="space-y-3.5">
                  {[
                    { icon: Zap, text: 'Strict Sprint Milestones With Zero Slippage' },
                    { icon: Shield, text: 'Hindustan Projects Enterprise Backing' },
                    { icon: Users, text: 'Dedicated Lead Engineer & Scrum Master' },
                    { icon: Star, text: '30-Day Post-Launch Warranty Included' },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                      <item.icon className="w-4 h-4 text-brand-cyan shrink-0" />
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
        <section className="py-16 sm:py-20 bg-[#03091e] border-t border-white/10">
          <Container>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-2 block">
                  // ECOSYSTEM EXPANSION
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                  Complementary Engineering Modules
                </h2>
              </div>
              <Link
                to="/services"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-cyan hover:text-white transition-colors"
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
                    className="group bg-slate-900/70 rounded-2xl border border-white/10 p-6 flex flex-col
                      hover:border-brand-cyan/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]
                      hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${relTheme.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-300`}
                    >
                      <RelIcon className="w-5 h-5 text-white" strokeWidth={1.8} />
                    </div>
                    <h3 className="font-heading text-base font-bold text-white group-hover:text-brand-cyan transition-colors mb-2">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-300/80 leading-relaxed flex-1 mb-5 line-clamp-2 font-light">
                      {s.shortDescription || ''}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-cyan group-hover:gap-2 transition-all duration-200">
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

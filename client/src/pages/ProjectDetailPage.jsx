/**
 * ProjectDetailPage.jsx — Enterprise Architectural Case Study & Project Details.
 * Dynamic, ultra-responsive, matching SnapTech's high-contrast light enterprise theme.
 */
import { useState, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Layers,
  Cpu,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  MessageSquare,
  Building2,
  TrendingUp,
  Share2,
  Check,
} from 'lucide-react'
import { Container, SEO, Button } from '@/components/ui'
import { useProject, useProjects } from '@/hooks/useProjects'
import { useSiteSettings } from '@/hooks/useContent'

const CATEGORY_COLORS = {
  Web: 'from-blue-600 via-cyan-500 to-teal-400',
  App: 'from-amber-500 via-orange-500 to-yellow-400',
  Marketing: 'from-orange-500 via-rose-500 to-pink-500',
  Branding: 'from-pink-500 via-purple-500 to-rose-400',
  Software: 'from-violet-600 via-purple-500 to-fuchsia-400',
}

const CATEGORY_PILL_STYLES = {
  Web: 'bg-blue-50 text-blue-700 border-blue-200',
  App: 'bg-amber-50 text-amber-700 border-amber-200',
  Marketing: 'bg-rose-50 text-rose-700 border-rose-200',
  Branding: 'bg-purple-50 text-purple-700 border-purple-200',
  Software: 'bg-violet-50 text-violet-700 border-violet-200',
}

function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <Container>
        <div className="h-6 w-48 bg-slate-200 rounded-full mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-10 w-3/4 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-96 w-full bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-40 w-full bg-slate-200 rounded-2xl animate-pulse" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-96 w-full bg-white rounded-3xl border border-slate-200 animate-pulse" />
          </div>
        </div>
      </Container>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: projectRes, isLoading, isError } = useProject(slug)
  const { data: allProjectsRes } = useProjects()
  const { data: settingsData } = useSiteSettings()

  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const project = projectRes?.data
  const cfg = settingsData?.data || {}
  const rawWa = cfg.whatsapp || cfg.phone || ''
  const waNum = (rawWa && !rawWa.includes('99999') && !rawWa.includes('123456') ? rawWa : '917597000601').replace(/[^0-9]/g, '')

  // All gallery images (thumbnail + additional screenshots)
  const galleryImages = useMemo(() => {
    if (!project) return []
    const list = []
    if (project.thumbnailUrl?.trim()) {
      list.push(project.thumbnailUrl.trim())
    }
    if (Array.isArray(project.images)) {
      project.images.forEach((img) => {
        if (img?.trim() && !list.includes(img.trim())) {
          list.push(img.trim())
        }
      })
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80&auto=format&fit=crop']
  }, [project])

  // Related projects
  const relatedProjects = useMemo(() => {
    if (!allProjectsRes?.data || !project) return []
    return allProjectsRes.data
      .filter((p) => p.slug !== project.slug && (p.category === project.category || p.isFeatured))
      .slice(0, 3)
  }, [allProjectsRes, project])

  const copyPageUrl = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  if (isLoading) {
    return <ProjectDetailSkeleton />
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">Case Study Not Found</h2>
          <p className="text-slate-600 text-sm mb-6">
            The project you are looking for may have been archived, renamed, or is currently undergoing technical updates.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue-dark transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Portfolio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const gradColor = CATEGORY_COLORS[project.category] || 'from-brand-blue to-indigo-600'
  const pillStyle = CATEGORY_PILL_STYLES[project.category] || 'bg-blue-50 text-blue-700 border-blue-200'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-blue/15 selection:text-brand-blue">
      <SEO
        title={`${project.title} — Architectural Case Study | SnapTech Digital`}
        description={project.description || `Explore how SnapTech engineered ${project.title} for ${project.clientName}.`}
        path={`/portfolio/${project.slug}`}
        image={project.thumbnailUrl || undefined}
        keywords={`${project.title}, ${project.category} case study, SnapTech software architecture, ${project.technologies?.join(', ')}`}
      />

      {/* ── Breadcrumb & Top Bar ───────────────────────────────── */}
      <section className="pt-24 sm:pt-28 pb-4 bg-white border-b border-slate-200/80">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4 py-2">
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-brand-blue transition-colors">
                Home
              </Link>
              <span className="text-slate-300">/</span>
              <Link to="/portfolio" className="hover:text-brand-blue transition-colors">
                Portfolio
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold truncate max-w-[180px] sm:max-w-xs">
                {project.title}
              </span>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={copyPageUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                title="Share this case study"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Share Case Study</span>
                  </>
                )}
              </button>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">All Projects</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="relative py-10 sm:py-14 bg-linear-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/80 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-100/40 rounded-full blur-[90px] pointer-events-none translate-y-1/2" />

        <Container className="relative">
          <div className="max-w-4xl">
            {/* Badges strip */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border shadow-2xs ${pillStyle}`}>
                {project.category}
              </span>

              {project.isFeatured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                  Flagship Showcase
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Production Deployed
              </span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-[#0D1B4B] leading-[1.15] mb-4">
              {project.title}
            </h1>

            {/* Sub-meta */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-600 mb-6 font-medium">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-blue" />
                <span>Client:</span>
                <strong className="text-slate-900">{project.clientName}</strong>
              </span>

              {project.duration && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-blue" />
                  <span>Timeline:</span>
                  <strong className="text-slate-900">{project.duration}</strong>
                </span>
              )}
            </div>

            {/* Verified Production Impact Banner */}
            {project.result && (
              <div className="inline-flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-300/80 shadow-xs mb-6 max-w-2xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-widest block">
                    Verified Production Impact
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {project.result}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ── Main Content Grid ──────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* ── Left Column: Showcase & Architecture ── */}
            <div className="lg:col-span-8 space-y-10">
              {/* Interactive Showcase Viewport */}
              <div className="rounded-3xl border border-slate-200 bg-white p-2.5 sm:p-4 shadow-xl overflow-hidden">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-16/10 group cursor-pointer" onClick={() => setLightboxOpen(true)}>
                  <img
                    src={galleryImages[activeImageIdx]}
                    alt={`${project.title} viewport ${activeImageIdx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                  {/* Expand badge */}
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg group-hover:bg-brand-blue transition-colors">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View Lightbox</span>
                  </div>

                  {/* Bottom Image Indicator */}
                  <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-mono font-medium">
                    <span>{activeImageIdx + 1} / {galleryImages.length}</span>
                  </div>
                </div>

                {/* Thumbnails row (if multiple images) */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pt-3.5 pb-1 px-1 no-scrollbar">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`relative rounded-xl overflow-hidden w-24 h-16 shrink-0 border-2 transition-all cursor-pointer ${
                          activeImageIdx === idx
                            ? 'border-brand-blue ring-2 ring-brand-blue/30 shadow-md scale-102'
                            : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                        }`}
                      >
                        <img src={img} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* The Executive Challenge Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="w-1.5 h-12 bg-linear-to-b from-amber-500 to-rose-500 rounded-full absolute top-8 left-0" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
                    01
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest block">
                      Problem Statement
                    </span>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
                      The Operational Challenge
                    </h2>
                  </div>
                </div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {project.challenge ||
                    `Prior to commissioning SnapTech, ${project.clientName} faced architectural bottlenecks that limited scaling and caused inefficiencies in their ${project.category} pipeline. The operational workflows required high-reliability modernization with strict latency SLAs.`}
                </p>
              </div>

              {/* The Engineering Solution Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="w-1.5 h-12 bg-linear-to-b from-brand-blue to-teal-400 rounded-full absolute top-8 left-0" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-blue font-bold">
                    02
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-brand-blue uppercase tracking-widest block">
                      Technical Strategy
                    </span>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
                      Engineering Architecture &amp; Solution
                    </h2>
                  </div>
                </div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  {project.solution ||
                    `SnapTech engineered a dedicated, scalable architecture utilizing ${project.technologies?.slice(0, 3).join(', ') || 'modern cloud technologies'}. The implementation followed strict code modularity, automated test coverage, and continuous integration to guarantee uptime and speed.`}
                </p>

                {/* Key Deliverables Checkmarks */}
                {project.features && project.features.length > 0 ? (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-brand-blue" />
                      Core Deliverables &amp; Milestones
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'High-concurrency microservices with load-balanced gateways',
                      'Sub-second transaction and data processing latency',
                      'Automated CI/CD pipeline with zero-downtime deployment',
                      'Role-based granular access control & secure encryption',
                    ].map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Full Executive Narrative */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  // COMPLETE PROJECT NARRATIVE
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                  Scope of Work &amp; Execution Overview
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
                  <p>{project.description}</p>
                </div>
              </div>
            </div>

            {/* ── Right Column: Sticky Specifications Sidebar ── */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              {/* Technical Specifications Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-lg space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Enterprise Client
                  </span>
                  <p className="font-heading text-lg font-bold text-slate-900">{project.clientName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Discipline
                    </span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${pillStyle}`}>
                      {project.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Turnaround
                    </span>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {project.duration || 'Milestone Based'}
                    </span>
                  </div>
                </div>

                {/* Tech Stack Pills */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-3">
                      Technology Architecture
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg font-mono font-semibold shadow-2xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Platform Link Button */}
                {project.liveUrl && (
                  <div className="pt-2">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Live Platform
                    </a>
                  </div>
                )}
              </div>

              {/* Commission Similar Project CTA Card */}
              <div className="rounded-3xl border border-slate-800 bg-linear-to-br from-[#0D1B4B] via-[#102A66] to-[#0A1840] p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-[10px] font-mono font-bold uppercase tracking-wider mb-4 border border-blue-400/30">
                  <Sparkles className="w-3 h-3 text-brand-cyan" />
                  Commissioning
                </span>
                <h3 className="font-heading text-xl font-bold mb-2">
                  Need a Similar Technical Solution?
                </h3>
                <p className="text-blue-100 text-xs sm:text-sm leading-relaxed mb-6 font-light">
                  Our engineering team can formulate architecture diagrams, milestone timelines, and fixed-cost delivery for your business.
                </p>

                <div className="space-y-3">
                  <Link
                    to="/contact"
                    className="flex items-center justify-center gap-2 w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-xs uppercase tracking-wider"
                  >
                    <span>Request Solution Scope</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href={`https://wa.me/${waNum}?text=${encodeURIComponent(
                      `Hi SnapTech team, I was reviewing your case study "${project.title}" and would like to discuss commissioning a similar solution.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Chat on WhatsApp
                  </a>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10 space-y-2 text-[11px] text-blue-200">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>100% IP &amp; Source Code Transfer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>NDA &amp; Milestone SLA Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Related Flagship Case Studies ─────────────────────── */}
      {relatedProjects.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-200/80">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-[10px] font-mono font-bold text-brand-blue uppercase tracking-widest block mb-1">
                  // RELATED WORK
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Explore More Flagship Deployments
                </h2>
              </div>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue-dark transition-colors"
              >
                <span>View All Case Studies</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/portfolio/${p.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-brand-blue/50 hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <img
                      src={p.thumbnailUrl || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-white bg-slate-900/80 backdrop-blur-md">
                        {p.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-brand-blue transition-colors line-clamp-1 mb-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-3">{p.clientName}</p>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                        {p.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-blue pt-4 border-t border-slate-100 mt-4">
                      <span>Read Case Study</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Lightbox Modal ─────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox content */}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[65vh] sm:h-[75vh] flex items-center justify-center">
              <img
                src={galleryImages[activeImageIdx]}
                alt={`${project.title} screenshot`}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
                    }
                    className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 text-center text-white/80 text-sm font-mono">
              Screenshot {activeImageIdx + 1} of {galleryImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

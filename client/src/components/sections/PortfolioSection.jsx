import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, ArrowRight, Code2, Tag, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui'
import { useProjects } from '@/hooks/useProjects'
import { fadeUp, staggerContainer } from '@/utils/motion'

const CATEGORIES = ['All', 'Web', 'App', 'Marketing', 'Branding', 'Software']

const CATEGORY_COLORS = {
  Web: 'from-blue-600 via-cyan-500 to-teal-400',
  App: 'from-amber-500 via-orange-500 to-yellow-400',
  Marketing: 'from-orange-500 via-rose-500 to-pink-500',
  Branding: 'from-pink-500 via-purple-500 to-rose-400',
  Software: 'from-violet-600 via-purple-500 to-fuchsia-400',
}

/* ── Project Detail Modal (Crisp Light Theme) ─────────────────── */
export function ProjectModal({ project, onClose }) {
  const gradColor = CATEGORY_COLORS[project.category] || 'from-brand-primary to-brand-blue'
  const [activeBannerImg, setActiveBannerImg] = useState(
    project.thumbnailUrl || (Array.isArray(project.images) && project.images.length > 0 ? project.images[0] : '')
  )

  // Lock background scroll when modal is open
  useEffect(() => {
    const origBody = document.body.style.overflow
    const origHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = origBody
      document.documentElement.style.overflow = origHtml
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex min-h-full justify-center p-4 sm:p-6 md:p-10 text-center">
        {/* Backdrop (Click to close) */}
        <div className="fixed inset-0 -z-10 cursor-pointer" onClick={onClose} aria-hidden="true" />

        {/* Modal Content Box */}
        <motion.div
          className="my-auto inline-block w-full max-w-3xl text-left align-middle bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 text-slate-900"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:rotate-90 transition-all duration-300 shadow-md cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Banner Image */}
          {activeBannerImg ? (
            <div className="relative h-60 sm:h-72 md:h-80 overflow-hidden group/image">
              <img
                src={activeBannerImg}
                alt={project.title}
                className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

              {/* Floating Badges */}
              <div className="absolute bottom-5 left-5 flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold text-white bg-linear-to-r ${gradColor} shadow-md`}
                >
                  {project.category}
                </span>
                {project.isFeatured && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold text-brand-blue bg-white/95 border border-blue-200 shadow-md">
                    Enterprise Showcase
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`w-full h-44 bg-linear-to-br ${gradColor} flex items-center justify-center`}
            >
              <span className="font-heading text-5xl font-bold text-white/40">
                {project.title[0]}
              </span>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 sm:p-8">
            <span className="text-[10px] font-mono font-bold text-brand-blue uppercase tracking-widest block mb-1">
              // ARCHITECTURAL CASE STUDY
            </span>
            <h2
              id="modal-title"
              className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mb-2 leading-tight"
            >
              {project.title}
            </h2>
            <p className="text-xs text-slate-500 mb-6 flex items-center gap-1.5 font-medium">
              <Tag className="w-3.5 h-3.5 text-brand-blue" />
              {project.clientName}
            </p>

            {/* Performance/Result Achievements */}
            {project.result && (
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 mb-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider leading-none mb-1">
                    Verified Production Impact
                  </p>
                  <p className="text-sm font-bold text-emerald-950 leading-snug">
                    {project.result}
                  </p>
                </div>
              </div>
            )}

            {/* Two Column details grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div className="md:col-span-2 space-y-3.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-brand-blue" />
                  Technical Implementation
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">{project.description}</p>
              </div>

              {/* Sidebar specs card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div>
                  <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Enterprise Partner
                  </span>
                  <span className="text-xs font-semibold text-slate-900 leading-tight block">
                    {project.clientName}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Discipline
                  </span>
                  <span className="text-xs font-mono font-semibold text-brand-blue block">
                    {project.category}
                  </span>
                </div>
                {project.duration && (
                  <div>
                    <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Timeline
                    </span>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {project.duration}
                    </span>
                  </div>
                )}
                {project.technologies?.length > 0 && (
                  <div>
                    <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Core Technologies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-[10px] rounded-lg font-mono font-semibold shadow-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {project.images?.length > 0 && (
                  <div>
                    <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Screenshots ({project.images.length})
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {project.images.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveBannerImg(img)}
                          className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                            activeBannerImg === img
                              ? 'border-brand-blue ring-2 ring-brand-blue/30 scale-105'
                              : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                          title={`Select screenshot ${i + 1}`}
                        >
                          <img
                            src={img}
                            alt={`Screenshot ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-2 space-y-2">
                  <Link
                    to={`/portfolio/${project.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 w-full bg-[#0D1B4B] hover:bg-brand-blue text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition-all duration-300"
                  >
                    <span>View Full Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl transition-all duration-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Visit Live Platform
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>,
    document.body
  )
}

/* ── Project Card ───────────────────────────────────────────────── */
function ProjectCard({ project, onOpen }) {
  const gradColor = CATEGORY_COLORS[project.category] || 'from-brand-primary to-brand-blue'

  return (
    <motion.div variants={fadeUp}>
      <article
        className="group relative rounded-2xl border border-slate-200/90 bg-white overflow-hidden cursor-pointer
          shadow-xs hover:border-brand-blue/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
        onClick={() => onOpen(project)}
      >
        {/* Thumbnail */}
        <div className="relative overflow-hidden h-52 bg-slate-100">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div
              className={`w-full h-full bg-linear-to-br ${gradColor} flex items-center justify-center`}
            >
              <span className="font-heading text-5xl font-bold text-white/30">
                {project.title[0]}
              </span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />

          {/* Tech tags + description on hover */}
          <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 backdrop-blur-xs">
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {project.technologies?.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] bg-white/10 border border-white/20 text-white px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed font-light">
              {project.description}
            </p>
          </div>

          {/* Badges (always visible top-left) */}
          <div className="absolute top-3.5 left-3.5 flex gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-white bg-linear-to-r ${gradColor} shadow-xs`}
            >
              {project.category}
            </span>
            {project.isFeatured && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-brand-blue bg-white/95 border border-blue-200 shadow-xs">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Card body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-brand-blue transition-colors duration-200">
              {project.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-3">{project.clientName}</p>

            {/* Result pill */}
            {project.result && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 mb-4 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald-800">{project.result}</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-blue group-hover:text-brand-blue-dark transition-colors">
              <span>View Case Study</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-700 hover:text-brand-blue bg-slate-50 hover:bg-blue-50 border border-slate-200 px-2.5 py-1 rounded-lg transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                Live Demo
              </a>
            )}
          </div>
        </div>
      </article>
    </motion.div>
  )
}

/* ── Portfolio Section ──────────────────────────────────────────── */
export default function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedProject, setSelectedProject] = useState(null)

  const { data, isLoading } = useProjects()
  const allProjects = Array.isArray(data?.data) ? data.data : []

  const filtered =
    activeCategory === 'All'
      ? allProjects
      : allProjects.filter((p) => p.category === activeCategory)

  return (
    <section id="portfolio" className="py-20 bg-slate-50/60 relative border-b border-slate-200/80" aria-labelledby="portfolio-heading">
      <Container className="relative">
        {/* Section heading */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-brand-blue text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-blue" /> Architecture &amp; Case Studies
          </span>
          <h2
            id="portfolio-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4"
          >
            Engineering Portfolio &amp; Case Studies
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base font-normal">
            Real software systems delivered for ambitious businesses in Bhilwara, Rajasthan, and across India.
          </p>
        </div>

        {/* Filter tabs */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-14"
          role="tablist"
          aria-label="Filter by category"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border active:scale-95 ${
                activeCategory === cat
                  ? 'text-white border-brand-blue bg-brand-blue shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-xs'
              }`}
            >
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>

        {/* Projects grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-slate-200/70 rounded-2xl border border-slate-200 animate-pulse" />
                ))
              : filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} onOpen={setSelectedProject} />
                ))}
          </motion.div>
        </AnimatePresence>

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 p-8 rounded-2xl border border-slate-200 bg-white max-w-md mx-auto shadow-xs">
            <p className="text-lg font-bold text-slate-900 mb-2">Case Studies Under Curation</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Case studies and client deliverables are currently being curated and published by our engineering team. Contact us to review relevant architectural demos in your sector.
            </p>
          </div>
        )}
      </Container>

      {/* Project modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}


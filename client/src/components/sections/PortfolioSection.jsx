import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, ArrowRight, Code2, Tag, Sparkles, CheckCircle2, Award } from 'lucide-react'
import { Container, Button } from '@/components/ui'
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

const PLACEHOLDER_PROJECTS = [
  {
    id: '1',
    title: 'Enterprise Commerce Architecture',
    clientName: 'Major Retail Chain, Rajasthan',
    category: 'Web',
    isFeatured: true,
    technologies: ['React 18', 'Node.js', 'PostgreSQL', 'Redis', 'AWS'],
    description:
      'A multi-tenant, high-throughput digital commerce platform featuring automated inventory management, sub-second checkout, and unified analytics dashboard.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=700&q=80&auto=format&fit=crop',
    result: '3.4× conversion growth in 60 days',
  },
  {
    id: '7',
    title: 'Hindustan Fleet Telematics Mobile App',
    clientName: 'Regional Transport & Logistics Hub',
    category: 'App',
    isFeatured: true,
    technologies: ['React Native', 'Firebase', 'Google Maps Fleet API', 'WebSockets'],
    description:
      'Mission-critical real-time telemetry and dispatch mobile application for 400+ commercial vehicles across North India with 60fps tracking.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=700&q=80&auto=format&fit=crop',
    result: '10,000+ active drivers onboarded',
  },
  {
    id: '2',
    title: 'Algorithmic Lead Growth Engine',
    clientName: 'Premium Lifestyle Brand, Jaipur',
    category: 'Marketing',
    isFeatured: true,
    technologies: ['Programmatic Ads', 'Meta Conversions API', 'Technical SEO'],
    description:
      'Full-funnel automated marketing system combining high-intent search visibility, hyper-targeted ad scaling, and conversion rate optimization.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80&auto=format&fit=crop',
    result: '3.8× verified ROAS in Quarter 1',
  },
  {
    id: '3',
    title: 'Corporate Brand System & UI/UX',
    clientName: 'Industrial Manufacturing Conglomerate',
    category: 'Branding',
    isFeatured: true,
    technologies: ['Figma Tokens', 'Vector Asset System', 'Design Guidelines'],
    description:
      'Unified enterprise identity system including interactive component libraries, corporate stationery, and digital presence style guides.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&q=80&auto=format&fit=crop',
    result: 'Brand valuation perceived 2× higher',
  },
  {
    id: '4',
    title: 'Industrial ERP & Supply Chain System',
    clientName: 'Textile Manufacturing Hub, Bhilwara',
    category: 'Software',
    isFeatured: false,
    technologies: ['Node.js', 'React', 'PostgreSQL', 'Docker'],
    description:
      'Custom ERP managing weaving cycles, inventory traceability, supplier ledger automation, and compliance auditing in one centralized database.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&q=80&auto=format&fit=crop',
    result: '42% reduction in factory downtime',
  },
  {
    id: '5',
    title: 'High-Converting Hospitality Web Portal',
    clientName: 'Luxury Hospitality Group, Udaipur',
    category: 'Web',
    isFeatured: false,
    technologies: ['Next.js 14', 'Tailwind CSS', 'Razorpay', 'Structured SEO'],
    description:
      'Interactive room reservation engine with dynamic seasonal pricing, sub-second load times, and #1 Google Maps/Search local positioning.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&q=80&auto=format&fit=crop',
    result: '#1 ranking across 12 targeted keywords',
  },
  {
    id: '6',
    title: 'Omnichannel Digital Brand Expansion',
    clientName: 'Commercial Real Estate Group',
    category: 'Marketing',
    isFeatured: false,
    technologies: ['Content Automation', 'LinkedIn Inbound', 'Lead Scraper'],
    description:
      'Inbound digital authority campaign generating high-ticket commercial property inquiries through programmatic content workflows.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=700&q=80&auto=format&fit=crop',
    result: '500 → 14,000 verified investor leads',
  },
]

/* ── Project Detail Modal (Cyber-Navy Glassmorphic) ─────────────── */
export function ProjectModal({ project, onClose }) {
  const gradColor = CATEGORY_COLORS[project.category] || 'from-brand-primary to-brand-cyan'

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#020714]/85 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex min-h-full justify-center p-4 sm:p-6 md:p-10 text-center">
        {/* Backdrop (Click to close) */}
        <div className="fixed inset-0 -z-10 cursor-pointer" onClick={onClose} aria-hidden="true" />

        {/* Modal Content Box */}
        <motion.div
          className="my-auto inline-block w-full max-w-3xl text-left align-middle bg-slate-950/95 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10 border border-brand-cyan/30 text-white"
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
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white hover:bg-brand-primary hover:border-brand-cyan hover:rotate-90 transition-all duration-300 shadow-lg cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Banner Image */}
          {project.thumbnailUrl ? (
            <div className="relative h-60 sm:h-72 md:h-80 overflow-hidden group/image">
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Floating Badges */}
              <div className="absolute bottom-5 left-5 flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold text-white bg-gradient-to-r ${gradColor} shadow-md`}
                >
                  {project.category}
                </span>
                {project.isFeatured && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30 shadow-md">
                    Enterprise Showcase
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`w-full h-44 bg-gradient-to-br ${gradColor} flex items-center justify-center`}
            >
              <span className="font-heading text-5xl font-bold text-white/30">
                {project.title[0]}
              </span>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 sm:p-8">
            <span className="text-[10px] font-mono font-bold text-brand-cyan uppercase tracking-widest block mb-1">
              // ARCHITECTURAL CASE STUDY
            </span>
            <h2
              id="modal-title"
              className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight"
            >
              {project.title}
            </h2>
            <p className="text-xs text-slate-400 mb-6 flex items-center gap-1.5 font-mono">
              <Tag className="w-3.5 h-3.5 text-brand-cyan" />
              {project.clientName}
            </p>

            {/* Performance/Result Achievements */}
            {project.result && (
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-6 shadow-[0_0_25px_rgba(16,185,129,0.1)]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-md">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest leading-none mb-1">
                    Verified Production Impact
                  </p>
                  <p className="text-sm font-bold text-white leading-snug">
                    {project.result}
                  </p>
                </div>
              </div>
            )}

            {/* Two Column details grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div className="md:col-span-2 space-y-3.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-cyan flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-brand-cyan" />
                  Technical Implementation
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-light">{project.description}</p>
              </div>

              {/* Sidebar specs card */}
              <div className="bg-slate-900/70 rounded-2xl p-5 border border-white/10 space-y-4 backdrop-blur-md">
                <div>
                  <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Enterprise Partner
                  </span>
                  <span className="text-xs font-semibold text-white leading-tight block">
                    {project.clientName}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Discipline
                  </span>
                  <span className="text-xs font-mono font-semibold text-brand-cyan block">
                    {project.category}
                  </span>
                </div>
                {project.technologies?.length > 0 && (
                  <div>
                    <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Core Technologies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 bg-white/5 border border-brand-cyan/20 text-brand-cyan text-[10px] rounded-lg font-mono font-bold shadow-sm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {project.liveUrl && (
                  <div className="pt-2">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-brand-primary-dark hover:to-brand-cyan-dark text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition-all duration-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Visit Live Platform
                    </a>
                  </div>
                )}
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
  const gradColor = CATEGORY_COLORS[project.category] || 'from-brand-primary to-brand-cyan'

  return (
    <motion.div variants={fadeUp}>
      <article
        className="group relative rounded-2xl border border-white/10 bg-slate-900/70 overflow-hidden cursor-pointer
          backdrop-blur-xl hover:border-brand-cyan/50 hover:shadow-[0_0_35px_rgba(6,182,212,0.18)]
          hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
        onClick={() => onOpen(project)}
      >
        {/* Thumbnail */}
        <div className="relative overflow-hidden h-52">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${gradColor} flex items-center justify-center`}
            >
              <span className="font-heading text-5xl font-bold text-white/30">
                {project.title[0]}
              </span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Tech tags + description on hover */}
          <div className="absolute inset-0 bg-[#020714]/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 backdrop-blur-md">
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {project.technologies?.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-light">
              {project.description}
            </p>
          </div>

          {/* Badges (always visible top-left) */}
          <div className="absolute top-3.5 left-3.5 flex gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-white bg-gradient-to-r ${gradColor} shadow-sm`}
            >
              {project.category}
            </span>
            {project.isFeatured && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-brand-cyan bg-slate-950/80 border border-brand-cyan/30 shadow-sm backdrop-blur-md">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Card body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-brand-cyan transition-colors duration-200">
              {project.title}
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-3">{project.clientName}</p>

            {/* Result pill */}
            {project.result && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4 w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span className="text-[11px] font-mono font-semibold text-emerald-300">{project.result}</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-3.5 mt-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-cyan group-hover:text-white transition-colors">
              <span>View Case Study</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-brand-cyan hover:text-white bg-white/5 hover:bg-brand-cyan/20 border border-brand-cyan/20 px-2.5 py-1 rounded-lg transition-all"
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
  const allProjects = data?.data?.length ? data.data : isLoading ? [] : PLACEHOLDER_PROJECTS

  const filtered =
    activeCategory === 'All'
      ? allProjects
      : allProjects.filter((p) => p.category === activeCategory)

  return (
    <section id="portfolio" className="py-20 bg-[#020714] relative border-b border-white/10" aria-labelledby="portfolio-heading">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.1),rgba(255,255,255,0))] pointer-events-none" />

      <Container className="relative">
        {/* Section heading */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" /> Verified Deployments
          </span>
          <h2
            id="portfolio-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Engineering Portfolio &amp; Case Studies
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base font-light">
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
              className={`relative px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border overflow-hidden active:scale-95 ${
                activeCategory === cat
                  ? 'text-white border-brand-cyan/50 bg-gradient-to-r from-brand-primary to-brand-cyan shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                  : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/25 hover:text-white backdrop-blur-md'
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
                  <div key={i} className="h-80 bg-slate-900/60 rounded-2xl border border-white/10 animate-pulse backdrop-blur-xl" />
                ))
              : filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} onOpen={setSelectedProject} />
                ))}
          </motion.div>
        </AnimatePresence>

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 p-8 rounded-2xl border border-white/10 bg-slate-900/40 max-w-md mx-auto">
            <p className="text-lg font-bold text-white mb-2">No projects found</p>
            <p className="text-slate-400 text-sm">
              We are actively packaging new case studies in this vertical.
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


/**
 * FeaturedProjects — Homepage section showing top 3 featured projects.
 * Links to full portfolio page.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Container } from '@/components/ui'
import { useProjects } from '@/hooks/useProjects'
import { fadeUp, staggerContainer, viewportOnce } from '@/utils/motion'
import { ProjectModal } from '@/components/sections/PortfolioSection'

const CATEGORY_DEFAULT_IMAGES = {
  App: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80&auto=format&fit=crop',
  Branding: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80&auto=format&fit=crop',
  Marketing: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop',
  Web: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80&auto=format&fit=crop',
  Software: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80&auto=format&fit=crop',
}

const flipVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 120 : -120,
    rotate: dir > 0 ? 5 : -5,
    opacity: 0,
    scale: 0.94,
  }),
  center: {
    x: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 28,
    },
  },
  exit: (dir) => ({
    x: dir > 0 ? -160 : 160,
    rotate: dir > 0 ? -8 : 8,
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.22,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
}

function FeaturedProjectCard({ project, onClick, isMobile = false }) {
  const projectImg =
    project.thumbnailUrl?.trim() ||
    CATEGORY_DEFAULT_IMAGES[project.category] ||
    CATEGORY_DEFAULT_IMAGES.Web

  return (
    <div
      className={`overflow-hidden group cursor-pointer border border-slate-200 bg-white rounded-2xl hover:border-brand-blue/40 transition-all duration-300 flex flex-col h-full select-none ${
        isMobile ? 'shadow-xl' : 'hover:shadow-xl'
      }`}
      onClick={() => onClick(project)}
    >
      {/* Project Visual Thumbnail */}
      <div className={`overflow-hidden relative bg-slate-900 shrink-0 ${isMobile ? 'h-44' : 'h-52'}`}>
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent z-10 pointer-events-none" />
        <img
          src={projectImg}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Card Content Body */}
      <div className={`${isMobile ? 'p-4' : 'p-6'} flex flex-col flex-1 justify-between bg-white`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-blue">
              {project.category}
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-medium truncate max-w-35 sm:max-w-none">
              {project.clientName}
            </span>
          </div>

          <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-blue transition-colors duration-200 mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-none">
            {project.title}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-2 sm:mb-4">
            {project.description}
          </p>
        </div>

        {/* Tech stack chips & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1 sm:mt-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClick(project)
            }}
            className="text-xs font-bold text-brand-blue group-hover:translate-x-1 transition-transform flex items-center gap-1 cursor-pointer"
          >
            <span>Case Study</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.technologies.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 font-mono border border-slate-200"
                >
                  {t}
                </span>
              ))}
              {project.technologies.length > 2 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 font-mono border border-slate-200">
                  +{project.technologies.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FeaturedProjects() {
  const [selectedProject, setSelectedProject] = useState(null)
  const { data, isLoading } = useProjects({ featured: true })
  const [activeMobileIdx, setActiveMobileIdx] = useState(0)
  const [direction, setDirection] = useState(1)

  const projects =
    Array.isArray(data?.data) && data.data.length > 0 ? data.data.slice(0, 3) : []

  const handleNext = () => {
    if (projects.length <= 1) return
    setDirection(1)
    setActiveMobileIdx((prev) => (prev + 1) % projects.length)
  }

  const handlePrev = () => {
    if (projects.length <= 1) return
    setDirection(-1)
    setActiveMobileIdx((prev) => (prev === 0 ? projects.length - 1 : prev - 1))
  }

  const handleDotClick = (i) => {
    if (i === activeMobileIdx || projects.length <= 1) return
    setDirection(i > activeMobileIdx ? 1 : -1)
    setActiveMobileIdx(i)
  }

  // If no projects in database, do not render any demo/placeholder projects
  if (!isLoading && projects.length === 0) {
    return null
  }

  return (
    <section
      id="portfolio"
      className="py-20 sm:py-24 bg-white border-t border-slate-100 relative overflow-hidden isolate"
      aria-labelledby="featured-heading"
    >
      {/* Subtle background decorations */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#1a3e8c]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#e31e24]/5 rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="text-center mb-10 sm:mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200 text-brand-blue text-xs font-mono font-bold uppercase tracking-widest mb-4 shadow-2xs">
            <span>Enterprise Case Studies</span>
          </div>
          <h2 id="featured-heading" className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0D1B4B] tracking-tight mb-4">
            Flagship Software &{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
              Cloud Deployments
            </span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Real-world digital transformations engineered for industry leaders, textile conglomerates, and high-growth ventures.
          </p>
        </motion.div>

        {projects.length === 0 && !isLoading ? (
          <div className="text-center py-12 p-8 rounded-2xl border border-slate-200 bg-slate-50/70 max-w-md mx-auto shadow-xs">
            <p className="text-base font-bold text-slate-800 mb-1">No featured projects yet</p>
            <p className="text-slate-500 text-xs">
              Projects marked as "Featured" in the Admin Panel will automatically appear here.
            </p>
          </div>
        ) : (
          <>
            {/* ── Desktop & Tablet Grid (sm: screens and up) ── */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="hidden sm:grid sm:grid-cols-3 gap-6"
            >
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-80 bg-slate-100 border border-slate-200 rounded-2xl animate-pulse" />
                  ))
                : projects.map((p) => (
                    <motion.div key={p.id} variants={fadeUp}>
                      <FeaturedProjectCard
                        project={p}
                        onClick={setSelectedProject}
                      />
                    </motion.div>
                  ))}
            </motion.div>

            {/* ── Mobile 3D Card Stack & Flip Deck (< sm: screens) ── */}
            <div className="sm:hidden">
              {isLoading ? (
                <div className="h-100 bg-white rounded-2xl border border-slate-200 animate-pulse" />
              ) : (
                <>
                  {/* Top Mobile Controls Bar */}
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                      <span>Case Studies ({activeMobileIdx + 1}/{projects.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrev}
                        disabled={projects.length <= 1}
                        className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-90 transition-all cursor-pointer"
                        aria-label="Previous project"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={projects.length <= 1}
                        className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-90 transition-all cursor-pointer"
                        aria-label="Next project"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 3D Stack Stage */}
                  <div className="relative w-full max-w-85 mx-auto h-[385px] flex items-center justify-center select-none">
                    {/* Deepest Stack Card 3 */}
                    {projects.length > 2 && (
                      <div
                        className="absolute inset-x-5 top-0 h-[365px] rounded-2xl border border-slate-200/60 bg-slate-100/90 shadow-2xs pointer-events-none transition-all duration-300"
                        style={{
                          transform: 'translateY(14px) scale(0.9)',
                          zIndex: 10,
                          opacity: 0.45,
                        }}
                      />
                    )}

                    {/* Middle Stack Card 2 (Shows next project preview) */}
                    {projects.length > 1 && (() => {
                      const nextProj = projects[(activeMobileIdx + 1) % projects.length]
                      const nextImg =
                        nextProj?.thumbnailUrl?.trim() ||
                        CATEGORY_DEFAULT_IMAGES[nextProj?.category] ||
                        CATEGORY_DEFAULT_IMAGES.Web

                      return (
                        <div
                          className="absolute inset-x-2.5 top-0 h-[365px] rounded-2xl border border-slate-200 bg-white shadow-md pointer-events-none transition-all duration-300 overflow-hidden"
                          style={{
                            transform: 'translateY(7px) scale(0.95)',
                            zIndex: 20,
                            opacity: 0.85,
                          }}
                        >
                          <div className="flex flex-col h-full bg-white opacity-85">
                            <div className="relative h-44 bg-slate-900 overflow-hidden">
                              <img src={nextImg} alt="" className="w-full h-full object-cover opacity-60" />
                            </div>
                            <div className="p-4 flex flex-col justify-between flex-1">
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-brand-blue">
                                    {nextProj?.category}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500 font-medium truncate max-w-35">
                                    {nextProj?.clientName}
                                  </span>
                                </div>
                                <p className="font-heading text-base font-bold text-slate-900 line-clamp-1 mb-1">
                                  {nextProj?.title}
                                </p>
                                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                  {nextProj?.description}
                                </p>
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
                                <span className="text-xs font-bold text-brand-blue flex items-center gap-1">
                                  Case Study <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* Active Front Card 1 (Interactive & Flip animated) */}
                    <AnimatePresence mode="popLayout" custom={direction}>
                      <motion.div
                        key={projects[activeMobileIdx]?.id || activeMobileIdx}
                        custom={direction}
                        variants={flipVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        drag={projects.length > 1 ? 'x' : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.45}
                        onDragEnd={(_e, { offset }) => {
                          if (offset.x < -45) {
                            handleNext()
                          } else if (offset.x > 45) {
                            handlePrev()
                          }
                        }}
                        className="relative z-30 w-full h-[365px] cursor-grab active:cursor-grabbing touch-pan-y"
                      >
                        <FeaturedProjectCard
                          project={projects[activeMobileIdx]}
                          onClick={setSelectedProject}
                          isMobile
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Flip dots & tactile swipe hint */}
                  <div className="flex flex-col items-center gap-2 mt-7">
                    <div className="flex justify-center items-center gap-1.5">
                      {projects.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleDotClick(i)}
                          className="p-1 min-w-5 min-h-5 flex items-center justify-center cursor-pointer"
                          aria-label={`Go to project ${i + 1}`}
                        >
                          <span
                            className={`h-1.5 rounded-full transition-all duration-300 block ${
                              activeMobileIdx === i ? 'w-6 bg-brand-blue shadow-xs' : 'w-1.5 bg-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {projects.length > 1 && (
                      <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
                        <span>&larr;</span> Swipe card to flip <span>&rarr;</span>
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* High-Contrast Visible Case Studies CTA Button */}
        <div className="text-center mt-12 sm:mt-14">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#0D1B4B] hover:bg-[#1B6EF3] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 group shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span>Explore Complete Enterprise Case Studies</span>
            <ArrowRight className="w-4 h-4 text-[#38bdf8] group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

      </Container>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  )
}

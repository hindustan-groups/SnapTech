/**
 * FeaturedProjects — Homepage section showing top 3 featured projects.
 * Links to full portfolio page.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui'
import { useProjects } from '@/hooks/useProjects'
import { fadeUp, staggerContainer, viewportOnce } from '@/utils/motion'
import { ProjectModal } from '@/components/sections/PortfolioSection'

const PLACEHOLDER_FEATURED = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    clientName: 'Retail Client, Bhilwara',
    category: 'Web',
    isFeatured: true,
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    description:
      'A full-stack e-commerce platform with inventory management, payment integration, and admin dashboard.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Digital Marketing Campaign',
    clientName: 'Fashion Brand, Jaipur',
    category: 'Marketing',
    isFeatured: true,
    technologies: ['Google Ads', 'Meta Ads', 'SEO'],
    description: 'Multi-channel digital marketing campaign achieving 3x ROI within 3 months.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Corporate Brand Identity',
    clientName: 'Manufacturing Co., Bhilwara',
    category: 'Branding',
    isFeatured: true,
    technologies: ['Figma', 'Illustrator'],
    description:
      'Complete brand identity design including logo, brand guidelines, and marketing collateral.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80&auto=format&fit=crop',
  },
]

export default function FeaturedProjects() {
  const [selectedProject, setSelectedProject] = useState(null)
  const { data, isLoading } = useProjects({ featured: true })

  const projects = data?.data?.length
    ? data.data.slice(0, 3)
    : isLoading
      ? []
      : PLACEHOLDER_FEATURED

  return (
    <section
      id="portfolio"
      className="py-24 bg-white border-t border-slate-100 relative overflow-hidden isolate"
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
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 text-[#1a3e8c] text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <span>Enterprise Case Studies</span>
          </div>
          <h2 id="featured-heading" className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            Flagship Software &{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #1a3e8c, #e31e24)' }}>
              Cloud Deployments
            </span>
          </h2>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            Real-world digital transformations engineered for industry leaders, textile conglomerates, and high-growth ventures.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-72 bg-slate-100 border border-slate-200 rounded-2xl animate-pulse" />
              ))
            : projects.map((p) => {
                return (
                  <motion.div key={p.id} variants={fadeUp}>
                    <div
                      className="overflow-hidden group cursor-pointer border border-slate-200 bg-white rounded-2xl hover:border-[#1a3e8c]/40 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                      onClick={() => setSelectedProject(p)}
                    >
                      {p.thumbnailUrl ? (
                        <div className="overflow-hidden relative h-48 bg-slate-950">
                          {/* Image hover glow overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
                          <img
                            src={p.thumbnailUrl}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-slate-950 flex items-center justify-center relative overflow-hidden border-b border-white/5">
                          <span className="font-heading text-6xl font-extrabold text-brand-primary/20 group-hover:scale-110 transition-transform duration-500 font-mono">
                            {p.title[0]}
                          </span>
                        </div>
                      )}

                      <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-primary/20 border border-brand-primary/40 text-brand-cyan">
                              {p.category}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {p.clientName}
                            </span>
                          </div>

                          <h3 className="font-heading text-lg font-bold text-white group-hover:text-brand-cyan transition-colors duration-200 mb-2">
                            {p.title}
                          </h3>
                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                            {p.description}
                          </p>
                        </div>

                        {/* Tech stack chips */}
                        {p.technologies && p.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                            {p.technologies.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-mono border border-white/5"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
        </motion.div>

        <div className="text-center mt-14">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 group shadow-lg"
          >
            <span>Explore Complete Enterprise Case Studies</span>
            <ArrowRight className="w-4 h-4 text-brand-cyan group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </Container>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  )
}

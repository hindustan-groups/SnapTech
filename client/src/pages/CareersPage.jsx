import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  Compass,
  Search,
  CheckCircle2,
  Code2,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
import { useActiveJobs } from '@/hooks/useCareers'
import { useSiteSettings } from '@/hooks/useContent'

const JOB_TYPE_LABELS = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

const JOB_TYPE_CLASSES = {
  FULL_TIME: 'bg-blue-50 text-brand-blue border-blue-200',
  PART_TIME: 'bg-purple-50 text-purple-700 border-purple-200',
  INTERNSHIP: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CONTRACT: 'bg-amber-50 text-amber-700 border-amber-200',
}

// Resilient default job catalog if database has few or fresh records
const FALLBACK_JOBS = [
  {
    id: 'jp-fallback-1',
    title: 'Senior Full-Stack Engineer (React & Node.js)',
    slug: 'full-stack-developer',
    department: 'Engineering',
    location: 'Bhilwara HQ / Hybrid',
    jobType: 'FULL_TIME',
    experienceRequired: '2 - 5 Years',
    description:
      'Architect enterprise-grade web applications, mission-critical internal portals, and resilient microservices using React, Node.js, and PostgreSQL.',
    tags: ['React', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'Docker'],
  },
  {
    id: 'jp-fallback-2',
    title: 'DevOps & Cloud Infrastructure Specialist',
    slug: 'devops-cloud-specialist',
    department: 'Cloud & Infrastructure',
    location: 'Remote / Bhilwara',
    jobType: 'FULL_TIME',
    experienceRequired: '3+ Years',
    description:
      'Manage multi-region cloud deployments, automated CI/CD deployment pipelines, automated zero-downtime monitoring, and Kubernetes orchestration.',
    tags: ['AWS', 'Docker', 'CI/CD', 'Linux', 'Security'],
  },
  {
    id: 'jp-fallback-3',
    title: 'Digital Marketing & Growth Associate',
    slug: 'social-media-associate',
    department: 'Marketing & Growth',
    location: 'Remote / Bhilwara',
    jobType: 'INTERNSHIP',
    experienceRequired: 'Freshers / 1 Year',
    description:
      'Drive data-driven client marketing campaigns, high-converting social media creatives, conversion optimization, and brand performance metrics.',
    tags: ['Meta Ads', 'SEO', 'Content Strategy', 'Analytics'],
  },
  {
    id: 'jp-fallback-4',
    title: 'Enterprise UI/UX Product Designer',
    slug: 'ui-ux-product-designer',
    department: 'Design',
    location: 'Remote / Hybrid',
    jobType: 'FULL_TIME',
    experienceRequired: '2 - 4 Years',
    description:
      'Craft cutting-edge glassmorphic design systems, responsive web apps, and intuitive user journeys for our enterprise ERP and fintech clients.',
    tags: ['Figma', 'Design Systems', 'Micro-interactions', 'Wireframing'],
  },
  {
    id: 'jp-fallback-5',
    title: 'AI Solutions & Automation Engineer',
    slug: 'ai-automation-engineer',
    department: 'Engineering',
    location: 'Bhilwara HQ / Hybrid',
    jobType: 'FULL_TIME',
    experienceRequired: '1 - 3 Years',
    description:
      'Build intelligent workflow automations, conversational LLM assistants, and document analysis pipelines integrated with client ERPs.',
    tags: ['Python', 'LangChain', 'OpenAI/Gemini', 'REST APIs'],
  },
]

const CULTURE_PILLARS = [
  {
    icon: Zap,
    title: 'Impact at Industrial Scale',
    desc: 'Work on digital engines that run real multi-million rupee businesses, factories, and nationwide enterprises.',
  },
  {
    icon: Award,
    title: 'Continuous Mastery & Mentorship',
    desc: 'Direct pair programming with senior architects, paid certifications, and access to premium dev tooling.',
  },
  {
    icon: Compass,
    title: 'High-Autonomy Culture',
    desc: 'Hybrid and remote flexibility designed for focused engineering without bureaucratic red tape.',
  },
  {
    icon: ShieldCheck,
    title: 'Institutional Stability',
    desc: 'Backed by Hindustan Projects Group, giving you high-growth startup agility paired with conglomerate security.',
  },
]

const PERKS = [
  'Modern M-Series / High-Spec Workstations',
  'Flexible Hybrid & Remote Work Schedules',
  'Annual Performance & Milestone Bonuses',
  'Comprehensive Health & Wellness Protection',
  'Dedicated Paid Learning & Certification Budget',
  'Fast-Track Tech Leadership Career Ladders',
]

export default function CareersPage() {
  const { data, isLoading } = useActiveJobs()
  const { data: siteSettings } = useSiteSettings()
  const cfg = siteSettings?.data || {}

  const [selectedDept, setSelectedDept] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Merge DB jobs with fallbacks to guarantee rich career catalog
  const allJobs = useMemo(() => {
    const dbJobs = (data?.data || []).filter((j) => j.slug !== 'general-application')
    if (dbJobs.length === 0) return FALLBACK_JOBS

    // If db has jobs, make sure slugs match or merge
    const dbSlugs = new Set(dbJobs.map((j) => j.slug))
    const extraFallbacks = FALLBACK_JOBS.filter((f) => !dbSlugs.has(f.slug))
    return [...dbJobs, ...extraFallbacks]
  }, [data?.data])

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(allJobs.map((j) => j.department).filter(Boolean))
    return ['ALL', ...Array.from(depts)]
  }, [allJobs])

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesDept = selectedDept === 'ALL' || job.department === selectedDept
      const query = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.department?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query)
      return matchesDept && matchesQuery
    })
  }, [allJobs, selectedDept, searchQuery])

  const whatsappNumber = (cfg.whatsapp || cfg.phone || '917597000601').replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hello Snaptech Hiring Team, I am reaching out regarding engineering and tech career opportunities.'
  )}`

  return (
    <div className="min-h-screen bg-white text-slate-700">
      <SEO
        title="Careers at SnapTech Digital — Join Our Team | Bhilwara, Rajasthan"
        description="Explore open positions at SnapTech Digital. We hire web developers, UI/UX designers, and digital marketers. Work from our Bhilwara, Rajasthan office or remotely."
        path="/careers"
        keywords="SnapTech Digital careers, IT jobs Bhilwara, software developer jobs Rajasthan, web developer careers, tech jobs India, digital marketing jobs"
      />

      {/* Hero Section - Light Clean Canvas */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 overflow-hidden bg-linear-to-b from-blue-50/60 via-white to-slate-50/50 border-b border-slate-200/80">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-50/70 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <Container className="relative text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-brand-blue text-xs font-semibold uppercase tracking-widest mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-blue animate-pulse" />
            Engineering &amp; Innovation Talent Hub
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
            Build Mission-Critical Tech with{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-600">
              SnapTech
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            We are the technology division of{' '}
            <span className="text-slate-900 font-semibold">Hindustan Projects Group</span>. We design,
            code, and deploy high-availability enterprise platforms, custom ERPs, and cloud
            infrastructure.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-blue font-mono">
                {cfg.stat_projects || '150+'}
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                Systems Deployed
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
                {cfg.stat_experience || '12+'}
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                Years Legacy
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-mono">
                Hybrid
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                HQ &amp; Remote
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
                Top 5%
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                Talent Density
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Join Us / Culture Pillars */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-200/80 relative">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue">
              Engineered for Growth
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-2">
              Why Engineers Choose SnapTech
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              We skip corporate fluff and prioritize clean architecture, high autonomy, and real
              commercial impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CULTURE_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon
              return (
                <div
                  key={idx}
                  className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-brand-blue/40 transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-blue mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Perks Grid Banner */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-50 to-indigo-50/70 border border-blue-200 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-md">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                  Comprehensive Benefits
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  We invest in our builders
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Beyond competitive compensation, we ensure you have the tooling, peace of mind,
                  and environment to do the best work of your career.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 lg:max-w-2xl">
                {PERKS.map((perk, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Open Positions Section */}
      <section id="open-roles" className="py-16 sm:py-24 bg-white relative">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-blue">
                Active Openings
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-1">
                Explore Available Roles
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
                Join our agile engineering pods in Bhilwara HQ or across distributed hybrid setups.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search roles or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {departments.map((dept) => {
              const count =
                dept === 'ALL'
                  ? allJobs.length
                  : allJobs.filter((j) => j.department === dept).length
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                    selectedDept === dept
                      ? 'bg-brand-blue text-white border-brand-blue font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {dept === 'ALL' ? 'All Roles' : dept}
                  <span
                    className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedDept === dept
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Jobs Listing */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-10 h-10 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center max-w-xl mx-auto space-y-4">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-slate-900">
                No matching positions found
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We couldn't find any openings matching your filter criteria. Submit a general resume
                or reach out to our team directly.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDept('ALL')
                    setSearchQuery('')
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Clear Filters
                </Button>
                <Link to="/careers/general-application">
                  <Button variant="primary" size="sm" className="bg-brand-blue text-white hover:bg-blue-600">
                    General Application
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => {
                const typeClass =
                  JOB_TYPE_CLASSES[job.jobType] || 'bg-slate-100 text-slate-700 border-slate-200'
                const typeLabel = JOB_TYPE_LABELS[job.jobType] || job.jobType

                return (
                  <Link
                    key={job.id || job.slug}
                    to={`/careers/${job.slug}`}
                    className="group relative block p-6 sm:p-7 rounded-2xl bg-slate-50/50 hover:bg-white border border-slate-200 hover:border-brand-blue/40 transition-all duration-300 hover:shadow-md overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-transparent group-hover:bg-brand-blue transition-all duration-300" />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-2 sm:pl-3">
                      <div className="space-y-3 max-w-3xl">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${typeClass}`}
                          >
                            {typeLabel}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                            {job.department}
                          </span>
                          {job.isFeatured && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" /> Priority Role
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                          {job.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-brand-blue" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-brand-blue" />{' '}
                            {job.experienceRequired}
                          </span>
                          {job.tags && job.tags.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1.5">
                              {job.tags.slice(0, 4).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-brand-blue group-hover:translate-x-1.5 transition-transform">
                        Explore &amp; Apply <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Bottom Open Pitch / General Application Card */}
          <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-linear-to-r from-[#0a1945] via-[#0D1B4B] to-[#0a1945] border border-blue-900 text-white text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-2xl mx-auto space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto text-blue-200">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Don't see your specific specialization?
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
                We are constantly expanding our core teams across React, Node, DevOps, AI, and
                product design. If you are an exceptional engineer or builder, submit a general
                application or chat directly with our engineering recruiters.
              </p>
              <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
                <Link to="/careers/general-application">
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-brand-blue hover:bg-blue-600 text-white font-bold px-6 shadow-lg shadow-blue-950/50 cursor-pointer"
                  >
                    Submit General Resume <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  WhatsApp Talent Lead
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}

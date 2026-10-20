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
  Laptop,
  IndianRupee,
  Users,
  Flame,
  Share2,
  Check,
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

const WORKPLACE_LABELS = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ON_SITE: 'On-site',
}

const WORKPLACE_CLASSES = {
  REMOTE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  HYBRID: 'bg-blue-50 text-brand-blue border-blue-200',
  ON_SITE: 'bg-slate-100 text-slate-700 border-slate-200',
}

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
  const [selectedWorkplace, setSelectedWorkplace] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedSlug, setCopiedSlug] = useState(null)

  const handleShareJob = async (e, job) => {
    e.preventDefault()
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/careers/${job.slug}`
    const shareTitle = `${job.title} | SnapTech Digital Careers`
    const shareText = `Explore this opportunity at SnapTech Digital: ${job.title} (${job.location || 'Bhilwara / Remote'})`

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        setCopiedSlug(job.slug)
        setTimeout(() => setCopiedSlug(null), 2500)
      }
    } catch {
      // ignore clipboard error
    }
  }

  const handleWhatsAppShare = (e, job) => {
    e.preventDefault()
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/careers/${job.slug}`
    const text = `💼 *Job Opening at SnapTech Digital*\n*Role:* ${job.title}\n*Location:* ${job.location || 'Bhilwara, Rajasthan / Remote'}\n*Experience:* ${job.experienceRequired || 'Freshers / Experienced'}\n\n👉 Apply directly: ${shareUrl}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  const allJobs = useMemo(() => {
    if (Array.isArray(data?.data)) {
      return data.data
    }
    return []
  }, [data])

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(allJobs.map((j) => j.department).filter(Boolean))
    return ['ALL', ...Array.from(depts)]
  }, [allJobs])

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesDept = selectedDept === 'ALL' || job.department === selectedDept
      const matchesWorkplace =
        selectedWorkplace === 'ALL' || job.workplaceType === selectedWorkplace
      const query = searchQuery.toLowerCase().trim()
      const skillsStr = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : ''
      const tagsStr = Array.isArray(job.tags) ? job.tags.join(' ').toLowerCase() : ''
      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.department?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        skillsStr.includes(query) ||
        tagsStr.includes(query)
      return matchesDept && matchesWorkplace && matchesQuery
    })
  }, [allJobs, selectedDept, selectedWorkplace, searchQuery])

  const whatsappNumber = (cfg.whatsapp || cfg.phone || '918209604849').replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hello SnapTech Digital Hiring Team, I am reaching out regarding engineering and tech career opportunities.'
  )}`

  return (
    <div className="min-h-screen bg-white text-slate-700">
      <SEO
        title="Careers at SnapTech Digital — Join Our Team | Bhilwara, Rajasthan"
        description="Explore open positions at SnapTech Digital. We hire web developers, UI/UX designers, and digital marketers. Work from our Bhilwara, Rajasthan office or remotely."
        path="/careers"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Careers', path: '/careers' },
        ]}
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
              <div className="text-xl sm:text-2xl font-extrabold text-brand-blue font-mono">
                July 2026
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                Founded Inception
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono">
                100%
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                Code Ownership
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-xl sm:text-2xl font-extrabold text-purple-600 font-mono">
                Hybrid
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                HQ &amp; Remote
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-xl sm:text-2xl font-extrabold text-amber-600 font-mono">
                High
              </div>
              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                Engineering Bar
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

          {/* Filter Controls: Department & Workplace Model */}
          <div className="space-y-3 mb-8">
            {/* Department Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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

            {/* Workplace Model Quick Filter */}
            <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                Workplace:
              </span>
              {[
                { key: 'ALL', label: 'All Workplace Models' },
                { key: 'REMOTE', label: 'Remote Only' },
                { key: 'HYBRID', label: 'Hybrid' },
                { key: 'ON_SITE', label: 'On-site' },
              ].map((wp) => (
                <button
                  key={wp.key}
                  onClick={() => setSelectedWorkplace(wp.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedWorkplace === wp.key
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {wp.label}
                </button>
              ))}
            </div>
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
                    setSelectedWorkplace('ALL')
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
                const workplaceClass =
                  WORKPLACE_CLASSES[job.workplaceType] || 'bg-slate-100 text-slate-700 border-slate-200'
                const workplaceLabel =
                  WORKPLACE_LABELS[job.workplaceType] || job.workplaceType || 'Hybrid'

                const skillsList =
                  Array.isArray(job.skills) && job.skills.length > 0
                    ? job.skills
                    : Array.isArray(job.tags)
                    ? job.tags
                    : []

                return (
                  <Link
                    key={job.id || job.slug}
                    to={`/careers/${job.slug}`}
                    className="group relative block p-6 sm:p-7 rounded-2xl bg-slate-50/60 hover:bg-white border border-slate-200 hover:border-brand-blue/50 transition-all duration-300 hover:shadow-md overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-transparent group-hover:bg-brand-blue transition-all duration-300" />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-2 sm:pl-3">
                      <div className="space-y-3 max-w-3xl">
                        {/* Badges Bar */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${typeClass}`}
                          >
                            {typeLabel}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded">
                            {job.department}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border flex items-center gap-1 ${workplaceClass}`}
                          >
                            <Laptop className="w-3 h-3" />
                            {workplaceLabel}
                          </span>
                          {(job.badge || job.isFeatured) && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-500 fill-amber-400" />
                              {job.badge || 'Priority Role'}
                            </span>
                          )}
                          {job.openings > 1 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded flex items-center gap-1">
                              <Users className="w-3 h-3 text-purple-600" />
                              {job.openings} Openings
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                          {job.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 pt-1">
                          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-brand-blue shrink-0" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Clock className="w-3.5 h-3.5 text-brand-blue shrink-0" />{' '}
                            {job.experienceRequired}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <IndianRupee className="w-3 h-3" />
                            {job.showSalary !== false && job.salaryRange
                              ? job.salaryRange
                              : 'Competitive CTC'}
                          </span>
                        </div>

                        {/* Skill Chips */}
                        {skillsList.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {skillsList.slice(0, 5).map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium bg-white text-slate-700 border border-slate-200/90 px-2 py-0.5 rounded shadow-2xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {skillsList.length > 5 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{skillsList.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-2 lg:pt-0">
                        {/* WhatsApp Quick Share Button */}
                        <button
                          type="button"
                          onClick={(e) => handleWhatsAppShare(e, job)}
                          title="Share on WhatsApp"
                          aria-label={`Share ${job.title} on WhatsApp`}
                          className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all cursor-pointer shadow-2xs hover:scale-105"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                          </svg>
                        </button>

                        {/* Copy Link / Native Share Button */}
                        <button
                          type="button"
                          onClick={(e) => handleShareJob(e, job)}
                          title="Share Job Role"
                          aria-label={`Share ${job.title}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                            copiedSlug === job.slug
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:text-brand-blue hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          {copiedSlug === job.slug ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-bold text-emerald-700">Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Share</span>
                            </>
                          )}
                        </button>

                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-blue/10 group-hover:bg-brand-blue text-brand-blue group-hover:text-white text-xs font-bold transition-all shadow-2xs">
                          <span>Apply</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </Container>
      </section>

      {/* Why Join Us / Culture Pillars */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-t border-slate-200/80 relative">
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

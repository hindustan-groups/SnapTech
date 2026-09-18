import { Link } from 'react-router-dom'
import { Briefcase, MapPin, Clock, ArrowRight, Sparkles, Zap, Award, Compass } from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
import { useActiveJobs } from '@/hooks/useCareers'

const JOB_TYPE_LABELS = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

const JOB_TYPE_COLORS = {
  FULL_TIME: 'bg-indigo-50 text-indigo-600 border-indigo-150',
  PART_TIME: 'bg-orange-50 text-orange-600 border-orange-150',
  INTERNSHIP: 'bg-emerald-50 text-emerald-600 border-emerald-150',
  CONTRACT: 'bg-amber-50 text-amber-600 border-amber-150',
}

const VALUES = [
  {
    icon: Zap,
    title: 'Impact First',
    desc: 'We build systems that shape businesses and solve actual operational problems.',
  },
  {
    icon: Award,
    title: 'Growth Mindset',
    desc: 'Daily learning resources, direct mentorship, and room to grow your tech capabilities.',
  },
  {
    icon: Compass,
    title: 'Work Flexibility',
    desc: 'Hybrid/remote work modes designed to support creativity and work-life harmony.',
  },
]

export default function CareersPage() {
  const { data, isLoading, error } = useActiveJobs()

  const allJobs = data?.data || []
  const specificJobs = allJobs.filter((job) => job.slug !== 'general-application')

  return (
    <>
      <SEO
        title="Careers — Snaptech | Hindustan Projects IT Division"
        description="Build premium software platforms, cloud infrastructure, AI automation, and high-impact digital systems. Explore engineering & tech careers at Snaptech, Hindustan Projects."
        path="/careers"
        keywords="Snaptech careers, IT jobs, software engineer jobs, web developer careers, tech jobs, Hindustan Projects careers"
      />

      {/* Hero Section - Dark Tech (Matches /services page hero) */}
      <section className="relative pt-24 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 lg:pb-24 overflow-hidden bg-[#050e20]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-brand-cyan/15 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <Container className="relative text-center max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            Engineering &amp; Innovation Careers
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-bold !text-white leading-tight mb-5">
            Build the Future with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-cyan">
              Snaptech
            </span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            Snaptech is the technology powerhouse of Hindustan Projects Group. We engineer mission-critical cloud applications, custom ERP/CRMs, and scalable digital platforms.
          </p>
        </Container>
      </section>

      {/* Core Values Section - White Background (Matches /services page metrics) */}
      <section className="py-10 sm:py-12 lg:py-16 bg-white border-b border-gray-100">
        <Container>
          <h2 className="sr-only">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {VALUES.map((val, idx) => {
              const Icon = val.icon
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center text-brand-blue mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-blue mb-2 font-heading">
                    {val.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{val.desc}</p>
                </div>
              )
            })}
          </div>
        </Container>
      </section>

      {/* Jobs Listing Section - Light Background (Matches website layout) */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50/60 to-white">
        <Container>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="w-8 h-8 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 max-w-md mx-auto space-y-4">
              <p className="text-brand-red font-medium">Failed to load careers info.</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : specificJobs.length === 0 ? (
            // No openings state
            <div className="max-w-2xl mx-auto text-center space-y-8 bg-white border border-gray-250/60 rounded-3xl p-8 sm:p-14 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Briefcase className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <h3 className="font-heading text-xl font-bold text-brand-blue">
                  No active job openings right now
                </h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                  We don't have any specific open roles at this moment, but we are always looking
                  for exceptional talent to join our development, design, and marketing teams.
                </p>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 mb-4 font-bold uppercase tracking-widest">
                  Submit a general application instead
                </p>
                <Link to="/careers/general-application">
                  <Button
                    variant="danger"
                    size="md"
                    className="mx-auto cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    Submit General Resume <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Open roles list
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 gap-3">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-brand-blue">
                    Open Positions
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Join our high-performance team in Bhilwara or work remotely.
                  </p>
                </div>
                <span className="text-xs font-bold text-brand-red bg-brand-red/10 border border-brand-red/20 px-3 py-1 rounded-full w-fit">
                  {specificJobs.length} {specificJobs.length === 1 ? 'Job' : 'Jobs'} Available
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {specificJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/careers/${job.slug}`}
                    className="group block bg-white border border-gray-200/80 hover:border-brand-blue/30 hover:shadow-md p-6 rounded-2xl transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-transparent group-hover:bg-brand-red transition-all duration-300" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${JOB_TYPE_COLORS[job.jobType]}`}
                          >
                            {JOB_TYPE_LABELS[job.jobType]}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded">
                            {job.department}
                          </span>
                        </div>
                        <h3 className="font-heading text-lg sm:text-xl font-bold text-brand-blue group-hover:text-brand-red transition-colors duration-200">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-brand-red-light" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-brand-red-light" />{' '}
                            {job.experienceRequired}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-brand-red group-hover:translate-x-1.5 transition-all duration-200">
                        View & Apply <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Bottom General Application Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 text-center space-y-5 max-w-2xl mx-auto mt-14 shadow-sm relative overflow-hidden">
                <h3 className="font-heading text-lg font-bold text-brand-blue">
                  Don't see the right role?
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                  We are always on the lookout for talented software engineers, creative UI/UX
                  designers, and metrics-driven digital marketing associates. Submit a general
                  resume.
                </p>
                <div className="pt-2">
                  <Link to="/careers/general-application" className="inline-block">
                    <Button
                      variant="danger"
                      size="sm"
                      className="shadow-sm active:scale-95 cursor-pointer"
                    >
                      Submit General Application <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  )
}

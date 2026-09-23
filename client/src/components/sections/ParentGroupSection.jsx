import { ExternalLink, ShieldCheck, Building2, Cpu, Globe, Award } from 'lucide-react'
import { Container } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'

const ECOSYSTEM_PILLARS = [
  {
    icon: Building2,
    title: 'Enterprise Heritage & Stability',
    desc: 'Backed by Hindustan Projects Group, combining deep industrial engineering legacy with agile, next-generation digital technology.',
  },
  {
    icon: Cpu,
    title: 'Technology & Cloud Division',
    desc: 'Snaptech serves as the dedicated IT software wing, building mission-critical web applications, SaaS platforms, and mobile apps.',
  },
  {
    icon: Globe,
    title: 'Unified Domain Architecture',
    desc: 'Operating under official domain www.snaptech.digital with cross-functional enterprise compliance and cloud synergy.',
  },
  {
    icon: Award,
    title: 'Guaranteed Delivery & SLA',
    desc: 'Tier-1 engineering standards with 99.9% uptime, strict milestone tracking, and long-term enterprise maintenance agreements.',
  },
]

export default function ParentGroupSection() {
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}
  const parentUrl = cfg.parent_company_url || 'https://www.hindustanprojects.in'
  const companyBrand = cfg.company_name || 'Hindustan Projects Group'

  return (
    <section id="group-ecosystem" className="py-20 bg-slate-50 text-slate-900 relative overflow-hidden isolate border-b border-slate-200" aria-labelledby="parent-group-heading">
      {/* Background subtle ambient elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-100/30 rounded-full blur-3xl pointer-events-none" />

      <Container>
        <div className="max-w-4xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-brand-red text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-brand-red" />
            <span>Corporate Ecosystem</span>
          </div>
          <h2 id="parent-group-heading" className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            The Digital &amp; Technology Powerhouse of{' '}
            <span className="text-brand-blue">
              {companyBrand}
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Hindustan Projects IT Services bridges heavy industrial engineering with high-velocity digital intelligence. 
            We provide scalable software, cloud, and digital solutions with the unmatched trustworthiness of our parent enterprise.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ECOSYSTEM_PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-brand-blue/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Parent Website Cross-Link Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-red-50/40 p-6 sm:p-8 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-red font-bold block">
              Official Corporate Gateway
            </span>
            <h4 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
              Explore {companyBrand}
            </h4>
            <p className="text-xs text-slate-600">
              Discover engineering milestones, pre-engineered buildings, infrastructure ventures, and group portfolio.
            </p>
          </div>
          <a
            href={parentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shrink-0 shadow-md shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Visit {parentUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </Container>
    </section>
  )
}

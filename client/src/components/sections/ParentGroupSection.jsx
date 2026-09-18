import { ExternalLink, ShieldCheck, Building2, Cpu, Globe, Award } from 'lucide-react'
import { Container } from '@/components/ui'

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
    desc: 'Operating under official group domain snaptech.hindustanprojects.in with cross-functional synergy and enterprise compliance.',
  },
  {
    icon: Award,
    title: 'Guaranteed Delivery & SLA',
    desc: 'Tier-1 engineering standards with 99.9% uptime, strict milestone tracking, and long-term enterprise maintenance agreements.',
  },
]

export default function ParentGroupSection() {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden isolate" aria-labelledby="parent-group-heading">
      {/* Background blueprint & tech glow */}
      <div className="absolute inset-0 -z-10 opacity-15 bg-tech-grid-dark" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" />

      <Container>
        <div className="max-w-4xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/20 border border-brand-primary/40 text-brand-cyan text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Corporate Ecosystem</span>
          </div>
          <h2 id="parent-group-heading" className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            The Digital & Technology Powerhouse of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary-light via-brand-cyan to-white">
              Hindustan Projects Group
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Snaptech was forged to bridge heavy industrial engineering with high-velocity digital intelligence. 
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
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-primary/50 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/20 border border-brand-primary/30 text-brand-cyan flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Parent Website Cross-Link Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-brand-navy via-slate-800 to-brand-navy p-6 sm:p-8 border border-brand-primary/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-cyan font-bold block">
              Official Corporate Gateway
            </span>
            <h4 className="font-heading text-lg sm:text-xl font-bold text-white">
              Explore Hindustan Projects Corporate Group
            </h4>
            <p className="text-xs text-slate-300">
              Discover engineering milestones, pre-engineered buildings, infrastructure ventures, and group portfolio.
            </p>
          </div>
          <a
            href="https://www.hindustanprojects.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shrink-0 shadow-lg shadow-brand-primary/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Visit hindustanprojects.in</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </Container>
    </section>
  )
}

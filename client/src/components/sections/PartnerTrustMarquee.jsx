/**
 * PartnerTrustMarquee — Official Snaptech Enterprise Partner & Trust Accreditations Strip.
 * Replaces the old plain white banner with a seamless cyber-navy infinite running marquee.
 * 100% dynamic via usePartners() with enterprise fallback accreditations.
 */
import { ShieldCheck, Award, Lock, Server, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui'
import { usePartners } from '@/hooks/useContent'

const FALLBACK_ENTERPRISE_PARTNERS = [
  { id: '1', name: 'Rajasthan State Mines & Minerals' },
  { id: '2', name: 'Sangam India Textiles' },
  { id: '3', name: 'Mayur Suitings Group' },
  { id: '4', name: 'Bhilwara Infotech Solutions' },
  { id: '5', name: 'Shree Cement Logistics' },
  { id: '6', name: 'Mewar Polytex Industries' },
  { id: '7', name: 'Hindustan Heavy Engineering' },
  { id: '8', name: 'Apex Digital Logistics' },
]

const TRUST_PILLARS = [
  {
    icon: Award,
    title: 'ISO 9001:2015',
    label: 'Certified Engineering Standards',
  },
  {
    icon: ShieldCheck,
    title: 'MSME Registered',
    label: 'Govt. Recognized Tech Enterprise',
  },
  {
    icon: Lock,
    title: '256-Bit SSL / TLS',
    label: 'Enterprise Zero-Trust Security',
  },
  {
    icon: Server,
    title: '99.9% Uptime SLA',
    label: 'High-Availability Multi-AZ Cloud',
  },
]

export default function PartnerTrustMarquee() {
  const { data: partnersData } = usePartners()
  const partners = partnersData?.data?.length ? partnersData.data : FALLBACK_ENTERPRISE_PARTNERS

  // Duplicate list to achieve seamless infinite scroll effect without gaps
  const marqueeList = [...partners, ...partners, ...partners]

  return (
    <section
      className="relative bg-white border-y border-slate-200 text-slate-800 overflow-hidden isolate py-8"
      aria-label="Enterprise Accreditations & Partners"
    >
      {/* Background ambient subtle gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-blue-50/40 via-transparent to-red-50/30 pointer-events-none" />

      {/* ── Top Strip: Enterprise Trust Badges ── */}
      <Container className="relative mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {TRUST_PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-blue/40 hover:bg-blue-50/30 transition-all duration-200 group shadow-xs"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-brand-blue group-hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 font-mono tracking-tight group-hover:text-brand-blue transition-colors truncate">
                    {pillar.title}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {pillar.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Container>

      {/* ── Eyebrow label ── */}
      <div className="text-center mb-5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-brand-red" />
          <span>Trusted by Enterprise Clients &amp; Industrial Conglomerates</span>
          <Sparkles className="w-3 h-3 text-brand-red" />
        </span>
      </div>

      {/* ── Bottom Strip: Infinite Horizontal Running Marquee ── */}
      <div className="relative w-full overflow-hidden select-none">
        {/* Left & Right gradient vignettes to smooth out marquee entry/exit */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-4 sm:gap-6 py-2">
          {marqueeList.map((p, index) => (
            <div
              key={`${p.id}-${index}`}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-brand-blue/50 hover:bg-slate-50 transition-all duration-200 group shrink-0 shadow-xs"
            >
              {p.logoUrl ? (
                <img
                  src={p.logoUrl}
                  alt={p.name}
                  className="h-5 w-auto object-contain brightness-90 grayscale group-hover:grayscale-0 transition-all"
                  loading="lazy"
                />
              ) : (
                <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold text-brand-blue font-mono group-hover:bg-brand-blue group-hover:text-white transition-all">
                  {p.name.charAt(0)}
                </div>
              )}
              <span className="font-heading text-xs sm:text-sm font-bold tracking-wider text-slate-700 group-hover:text-brand-blue uppercase transition-colors whitespace-nowrap">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

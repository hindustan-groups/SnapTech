import { motion } from 'framer-motion'
import { Rocket, Users, ShieldCheck, Globe } from 'lucide-react'
import { Container } from '@/components/ui'
import { useCountUp } from '@/hooks/useCountUp'
import { fadeUp, staggerContainer, viewportOnce } from '@/utils/motion'

const STAT_ICONS = [Rocket, Users, ShieldCheck, Globe]

function StatItem({ value, suffix = '', label, sublabel, Icon, index }) {
  const { count, ref } = useCountUp(value)
  const isLong = typeof count === 'string' && count.length > 4

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className="relative flex flex-col items-center text-center px-4 py-8 group"
    >
      {/* Vertical divider (not on last) */}
      {index < 3 && (
        <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px bg-linear-to-b from-transparent via-white/15 to-transparent" />
      )}

      {/* Icon badge */}
      <div className="mb-4 w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-brand-blue/30 group-hover:border-brand-blue/50 group-hover:scale-110 transition-all duration-300 shadow-lg">
        <Icon className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
      </div>

      {/* Animated or text value */}
      <p
        className={`font-heading leading-tight tracking-tight text-transparent bg-clip-text bg-linear-to-b from-white via-white/95 to-white/70 group-hover:from-brand-blue-light group-hover:to-white transition-all duration-500 ${
          isLong ? 'text-2xl sm:text-3xl font-extrabold' : 'text-4xl sm:text-5xl lg:text-6xl font-black'
        }`}
      >
        {count}
        {suffix && <span className="text-brand-blue-light">{suffix}</span>}
      </p>

      {/* Label */}
      <p className="mt-3 text-sm font-bold text-white/90 tracking-wide">{label}</p>
      {sublabel && (
        <p className="mt-0.5 text-[11px] font-mono text-white/40 uppercase tracking-widest">{sublabel}</p>
      )}

      {/* Bottom glow on hover */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-linear-to-r from-transparent via-brand-blue-light/0 to-transparent group-hover:via-brand-blue-light/80 transition-all duration-500 rounded-full" />
    </motion.div>
  )
}

export default function StatsSection() {
  const stats = [
    {
      value: 'July 2026',
      suffix: '',
      label: 'Founded Inception',
      sublabel: 'Bhilwara, Rajasthan',
      Icon: STAT_ICONS[0],
    },
    {
      value: 100,
      suffix: '%',
      label: 'Code Ownership',
      sublabel: 'Full Git & IP Handover',
      Icon: STAT_ICONS[1],
    },
    {
      value: 'Hindustan Projects',
      suffix: '',
      label: 'Parent Enterprise',
      sublabel: 'Established Group Division',
      Icon: STAT_ICONS[2],
    },
    {
      value: 'Pan-India',
      suffix: '',
      label: 'Delivery Reach',
      sublabel: 'Agile Remote Workflows',
      Icon: STAT_ICONS[3],
    },
  ]

  return (
    <section className="relative overflow-hidden isolate" aria-label="Company foundation pillars">
      {/* ── Dark gradient band background ── */}
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-brand-navy via-[#0a1535] to-[#091029]" />

      {/* Ambient glows */}
      <div className="absolute -top-32 left-1/4 w-125 h-125 bg-brand-blue/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-100 h-100 bg-brand-blue/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-blue/60 to-transparent" />
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-blue/40 to-transparent" />

      <Container className="relative z-10 py-16 sm:py-20">
        {/* Section eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-mono font-semibold uppercase tracking-widest backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
            Engineering & Foundation Standards
          </span>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-2 md:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <StatItem key={stat.label} {...stat} index={i} />
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

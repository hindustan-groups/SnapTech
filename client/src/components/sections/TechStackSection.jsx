/**
 * TechStackSection — Animated ticker + category filter tabs (no Framer Motion)
 */
import { useState } from 'react'
import { Container } from '@/components/ui'
import { Cpu } from 'lucide-react'

const CATEGORIES = ['All', 'Web & Frontend', 'Backend & API', 'Mobile Apps', 'Cloud & Database', 'CMS & E-commerce']

const TECHNOLOGIES = [
  { name: 'React.js', cat: 'Web & Frontend', emoji: '⚛️', color: 'text-cyan-400 border-cyan-400/20 hover:border-cyan-400/50 hover:bg-cyan-400/5' },
  { name: 'Next.js', cat: 'Web & Frontend', emoji: '▲', color: 'text-white border-white/20 hover:border-white/50 hover:bg-white/5' },
  { name: 'Tailwind CSS', cat: 'Web & Frontend', emoji: '💨', color: 'text-sky-400 border-sky-400/20 hover:border-sky-400/50 hover:bg-sky-400/5' },
  { name: 'JavaScript', cat: 'Web & Frontend', emoji: '🟨', color: 'text-amber-400 border-amber-400/20 hover:border-amber-400/50 hover:bg-amber-400/5' },
  { name: 'TypeScript', cat: 'Web & Frontend', emoji: '🔷', color: 'text-blue-400 border-blue-400/20 hover:border-blue-400/50 hover:bg-blue-400/5' },
  { name: 'Node.js', cat: 'Backend & API', emoji: '🟢', color: 'text-green-400 border-green-400/20 hover:border-green-400/50 hover:bg-green-400/5' },
  { name: 'Express.js', cat: 'Backend & API', emoji: '⚡', color: 'text-gray-300 border-gray-500/20 hover:border-gray-400/50 hover:bg-gray-400/5' },
  { name: 'Python & Django', cat: 'Backend & API', emoji: '🐍', color: 'text-blue-400 border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-400/5' },
  { name: 'PHP & Laravel', cat: 'Backend & API', emoji: '🔴', color: 'text-red-400 border-red-400/20 hover:border-red-400/50 hover:bg-red-400/5' },
  { name: 'GraphQL', cat: 'Backend & API', emoji: '◈', color: 'text-pink-400 border-pink-400/20 hover:border-pink-400/50 hover:bg-pink-400/5' },
  { name: 'React Native', cat: 'Mobile Apps', emoji: '📱', color: 'text-cyan-400 border-cyan-400/20 hover:border-cyan-400/50 hover:bg-cyan-400/5' },
  { name: 'Flutter', cat: 'Mobile Apps', emoji: '🦋', color: 'text-blue-400 border-blue-400/20 hover:border-blue-400/50 hover:bg-blue-400/5' },
  { name: 'Swift (iOS)', cat: 'Mobile Apps', emoji: '🍎', color: 'text-orange-400 border-orange-400/20 hover:border-orange-400/50 hover:bg-orange-400/5' },
  { name: 'Kotlin (Android)', cat: 'Mobile Apps', emoji: '🤖', color: 'text-violet-400 border-violet-400/20 hover:border-violet-400/50 hover:bg-violet-400/5' },
  { name: 'PostgreSQL', cat: 'Cloud & Database', emoji: '🐘', color: 'text-blue-400 border-blue-400/20 hover:border-blue-400/50 hover:bg-blue-400/5' },
  { name: 'MongoDB', cat: 'Cloud & Database', emoji: '🍃', color: 'text-green-500 border-green-500/20 hover:border-green-400/50 hover:bg-green-400/5' },
  { name: 'AWS Cloud', cat: 'Cloud & Database', emoji: '☁️', color: 'text-amber-400 border-amber-400/20 hover:border-amber-400/50 hover:bg-amber-400/5' },
  { name: 'Firebase', cat: 'Cloud & Database', emoji: '🔥', color: 'text-yellow-400 border-yellow-400/20 hover:border-yellow-400/50 hover:bg-yellow-400/5' },
  { name: 'DigitalOcean', cat: 'Cloud & Database', emoji: '🌊', color: 'text-blue-400 border-blue-400/20 hover:border-blue-400/50 hover:bg-blue-400/5' },
  { name: 'WordPress', cat: 'CMS & E-commerce', emoji: '🔵', color: 'text-sky-400 border-sky-400/20 hover:border-sky-400/50 hover:bg-sky-400/5' },
  { name: 'Shopify', cat: 'CMS & E-commerce', emoji: '🛍️', color: 'text-green-400 border-green-400/20 hover:border-green-400/50 hover:bg-green-400/5' },
  { name: 'WooCommerce', cat: 'CMS & E-commerce', emoji: '🛒', color: 'text-purple-400 border-purple-400/20 hover:border-purple-400/50 hover:bg-purple-400/5' },
]

/* Infinite ticker items (duplicated for seamless loop) */
const TICKER_ITEMS = [...TECHNOLOGIES, ...TECHNOLOGIES]

export default function TechStackSection() {
  const [activeCat, setActiveCat] = useState('All')
  const filtered = activeCat === 'All' ? TECHNOLOGIES : TECHNOLOGIES.filter((t) => t.cat === activeCat)

  return (
    <section className="py-20 bg-brand-navy-dark text-white relative overflow-hidden" aria-labelledby="tech-heading">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-tech-grid-dark opacity-30 pointer-events-none" />

      {/* Infinite Ticker Strip */}
      <div className="ticker-wrapper mb-12 py-3 border-y border-white/8">
        <div className="ticker-track gap-0">
          {TICKER_ITEMS.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="flex items-center gap-2 px-6 py-2 mx-2 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs font-medium whitespace-nowrap"
            >
              <span>{t.emoji}</span>
              <span>{t.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Container className="relative z-10">
        {/* Heading */}
        <div className="reveal text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-cyan text-xs font-bold uppercase tracking-widest mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Our Technology Stack
          </div>
          <h2 id="tech-heading" className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Technologies We <span className="text-gradient-blue">Trust & Master</span>
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            We build high-performance applications using industry-leading, secure, and modern frameworks — chosen for reliability and scale.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                activeCat === cat
                  ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/25'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 reveal-stagger reveal">
          {filtered.map((t, i) => (
            <div
              key={t.name}
              className={`border rounded-xl p-4 text-center flex flex-col items-center justify-center gap-2
                transition-all duration-300 cursor-default ${t.color}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="text-2xl leading-none">{t.emoji}</span>
              <span className="font-heading text-sm font-semibold tracking-wide leading-snug">{t.name}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
                {t.cat.split(' & ')[0]}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/**
 * TechStackSection — Animated ticker + category filter tabs (no Framer Motion)
 */
import { useState } from 'react'
import { Container } from '@/components/ui'
import { Cpu } from 'lucide-react'

const CATEGORIES = ['All', 'Web & Frontend', 'Backend & API', 'Mobile Apps', 'Cloud & Database', 'CMS & E-commerce']

const TECHNOLOGIES = [
  { name: 'React.js', cat: 'Web & Frontend', emoji: '⚛️', color: 'text-cyan-600 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50' },
  { name: 'Next.js', cat: 'Web & Frontend', emoji: '▲', color: 'text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50' },
  { name: 'Tailwind CSS', cat: 'Web & Frontend', emoji: '💨', color: 'text-sky-600 border-sky-200 hover:border-sky-400 hover:bg-sky-50' },
  { name: 'JavaScript', cat: 'Web & Frontend', emoji: '🟨', color: 'text-amber-600 border-amber-200 hover:border-amber-400 hover:bg-amber-50' },
  { name: 'TypeScript', cat: 'Web & Frontend', emoji: '🔷', color: 'text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
  { name: 'Node.js', cat: 'Backend & API', emoji: '🟢', color: 'text-green-600 border-green-200 hover:border-green-400 hover:bg-green-50' },
  { name: 'Express.js', cat: 'Backend & API', emoji: '⚡', color: 'text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50' },
  { name: 'Python & Django', cat: 'Backend & API', emoji: '🐍', color: 'text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
  { name: 'PHP & Laravel', cat: 'Backend & API', emoji: '🔴', color: 'text-red-600 border-red-200 hover:border-red-400 hover:bg-red-50' },
  { name: 'GraphQL', cat: 'Backend & API', emoji: '◈', color: 'text-pink-600 border-pink-200 hover:border-pink-400 hover:bg-pink-50' },
  { name: 'React Native', cat: 'Mobile Apps', emoji: '📱', color: 'text-cyan-600 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50' },
  { name: 'Flutter', cat: 'Mobile Apps', emoji: '🦋', color: 'text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
  { name: 'Swift (iOS)', cat: 'Mobile Apps', emoji: '🍎', color: 'text-orange-600 border-orange-200 hover:border-orange-400 hover:bg-orange-50' },
  { name: 'Kotlin (Android)', cat: 'Mobile Apps', emoji: '🤖', color: 'text-violet-600 border-violet-200 hover:border-violet-400 hover:bg-violet-50' },
  { name: 'PostgreSQL', cat: 'Cloud & Database', emoji: '🐘', color: 'text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
  { name: 'MongoDB', cat: 'Cloud & Database', emoji: '🍃', color: 'text-green-600 border-green-200 hover:border-green-400 hover:bg-green-50' },
  { name: 'AWS Cloud', cat: 'Cloud & Database', emoji: '☁️', color: 'text-amber-600 border-amber-200 hover:border-amber-400 hover:bg-amber-50' },
  { name: 'Firebase', cat: 'Cloud & Database', emoji: '🔥', color: 'text-yellow-600 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50' },
  { name: 'DigitalOcean', cat: 'Cloud & Database', emoji: '🌊', color: 'text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
  { name: 'WordPress', cat: 'CMS & E-commerce', emoji: '🔵', color: 'text-sky-600 border-sky-200 hover:border-sky-400 hover:bg-sky-50' },
  { name: 'Shopify', cat: 'CMS & E-commerce', emoji: '🛍️', color: 'text-green-600 border-green-200 hover:border-green-400 hover:bg-green-50' },
  { name: 'WooCommerce', cat: 'CMS & E-commerce', emoji: '🛒', color: 'text-purple-600 border-purple-200 hover:border-purple-400 hover:bg-purple-50' },
]

/* Infinite ticker items (duplicated for seamless loop) */
const TICKER_ITEMS = [...TECHNOLOGIES, ...TECHNOLOGIES]

export default function TechStackSection() {
  const [activeCat, setActiveCat] = useState('All')
  const filtered = activeCat === 'All' ? TECHNOLOGIES : TECHNOLOGIES.filter((t) => t.cat === activeCat)

  return (
    <section id="tech-stack" className="py-20 bg-white border-t border-slate-100 relative overflow-hidden" aria-labelledby="tech-heading">
      {/* Subtle background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1a3e8c]/4 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e31e24]/4 blur-[120px] rounded-full pointer-events-none" />

      {/* Infinite Ticker Strip */}
      <div className="ticker-wrapper mb-12 py-3 border-y border-slate-100">
        <div className="ticker-track gap-0">
          {TICKER_ITEMS.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="flex items-center gap-2 px-6 py-2 mx-2 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium whitespace-nowrap"
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 text-[#1a3e8c] text-xs font-bold uppercase tracking-widest mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Our Technology Stack
          </div>
          <h2 id="tech-heading" className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
            Technologies We <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #1a3e8c, #e31e24)' }}>Trust & Master</span>
          </h2>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
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
                  ? 'bg-[#1a3e8c] border-[#1a3e8c] text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300'
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
                transition-all duration-300 cursor-default bg-white shadow-sm ${t.color}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="text-2xl leading-none">{t.emoji}</span>
              <span className="font-heading text-sm font-semibold tracking-wide leading-snug">{t.name}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                {t.cat.split(' & ')[0]}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/**
 * TechStackSection — Ultra-Modern Enterprise Technology Matrix
 * Showcases authentic vector brand icons, interactive category filtering,
 * infinite linear ticker, and high-performance engineering specs.
 */
import { useState } from 'react'
import { Container } from '@/components/ui'
import { Cpu, CheckCircle2, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react'
import {
  ReactIcon,
  NextjsIcon,
  TailwindIcon,
  TypeScriptIcon,
  JavaScriptIcon,
  NodeIcon,
  ExpressIcon,
  PythonIcon,
  LaravelIcon,
  GraphqlIcon,
  ReactNativeIcon,
  FlutterIcon,
  SwiftIcon,
  KotlinIcon,
  PostgresIcon,
  MongoDbIcon,
  RedisIcon,
  DockerIcon,
  AwsIcon,
  FirebaseIcon,
  ShopifyIcon,
  WordPressIcon,
  WooCommerceIcon,
} from '@/components/ui/TechIcons'

const CATEGORIES = [
  'All',
  'Web & Frontend',
  'Backend & Cloud API',
  'Mobile Apps',
  'Databases & DevOps',
  'CMS & E-Commerce',
]

const TECHNOLOGIES = [
  // ── Web & Frontend ──
  {
    name: 'React.js',
    cat: 'Web & Frontend',
    Icon: ReactIcon,
    badge: 'v19 Ready',
    role: 'Virtual DOM & State Systems',
    feature: 'Reactive Component Engine',
    glow: 'hover:border-cyan-400/80 hover:shadow-cyan-500/10 hover:bg-cyan-50/20',
    tileBg: 'bg-cyan-50 border-cyan-200/80',
    accentText: 'text-cyan-700',
  },
  {
    name: 'Next.js',
    cat: 'Web & Frontend',
    Icon: NextjsIcon,
    badge: 'App Router',
    role: 'Server Components & SSR / SSG',
    feature: 'Full-Stack Edge Framework',
    glow: 'hover:border-slate-400 hover:shadow-slate-500/10 hover:bg-slate-50/60',
    tileBg: 'bg-slate-100 border-slate-300',
    accentText: 'text-slate-800',
  },
  {
    name: 'TypeScript',
    cat: 'Web & Frontend',
    Icon: TypeScriptIcon,
    badge: 'Strict Mode',
    role: 'Zero Runtime Type Discrepancy',
    feature: 'Enterprise Type-Safe Core',
    glow: 'hover:border-blue-400 hover:shadow-blue-500/10 hover:bg-blue-50/20',
    tileBg: 'bg-blue-50 border-blue-200/80',
    accentText: 'text-blue-700',
  },
  {
    name: 'Tailwind CSS',
    cat: 'Web & Frontend',
    Icon: TailwindIcon,
    badge: 'v4 JIT Engine',
    role: 'Design Tokens & Atomic Styles',
    feature: 'High-Speed Responsive UI',
    glow: 'hover:border-sky-400 hover:shadow-sky-500/10 hover:bg-sky-50/20',
    tileBg: 'bg-sky-50 border-sky-200/80',
    accentText: 'text-sky-700',
  },
  {
    name: 'JavaScript',
    cat: 'Web & Frontend',
    Icon: JavaScriptIcon,
    badge: 'ESNext',
    role: 'Asynchronous Event Loop Logic',
    feature: 'Modern Web Standard',
    glow: 'hover:border-amber-400 hover:shadow-amber-500/10 hover:bg-amber-50/20',
    tileBg: 'bg-amber-50 border-amber-200/80',
    accentText: 'text-amber-800',
  },

  // ── Backend & Cloud API ──
  {
    name: 'Node.js',
    cat: 'Backend & Cloud API',
    Icon: NodeIcon,
    badge: 'LTS Core',
    role: 'High-Concurrency Event Loop',
    feature: 'Asynchronous Microservices',
    glow: 'hover:border-emerald-400 hover:shadow-emerald-500/10 hover:bg-emerald-50/20',
    tileBg: 'bg-emerald-50 border-emerald-200/80',
    accentText: 'text-emerald-700',
  },
  {
    name: 'Express.js',
    cat: 'Backend & Cloud API',
    Icon: ExpressIcon,
    badge: 'Fast REST',
    role: 'Middleware Routing & Guards',
    feature: 'Sub-Millisecond Endpoints',
    glow: 'hover:border-slate-400 hover:shadow-slate-500/10 hover:bg-slate-50/60',
    tileBg: 'bg-slate-100 border-slate-300',
    accentText: 'text-slate-800',
  },
  {
    name: 'Python & Django',
    cat: 'Backend & Cloud API',
    Icon: PythonIcon,
    badge: 'AI & ORM',
    role: 'Data Pipelines & Secure MVC',
    feature: 'Robust Business Logic',
    glow: 'hover:border-blue-400 hover:shadow-yellow-500/10 hover:bg-blue-50/20',
    tileBg: 'bg-blue-50 border-blue-200/80',
    accentText: 'text-blue-700',
  },
  {
    name: 'PHP & Laravel',
    cat: 'Backend & Cloud API',
    Icon: LaravelIcon,
    badge: 'Artisan Core',
    role: 'Eloquent ORM & Queue Workers',
    feature: 'Enterprise Web Platform',
    glow: 'hover:border-rose-400 hover:shadow-rose-500/10 hover:bg-rose-50/20',
    tileBg: 'bg-rose-50 border-rose-200/80',
    accentText: 'text-rose-700',
  },
  {
    name: 'GraphQL',
    cat: 'Backend & Cloud API',
    Icon: GraphqlIcon,
    badge: 'Type Schema',
    role: 'Declarative Data Federation',
    feature: 'Zero Over-Fetching',
    glow: 'hover:border-pink-400 hover:shadow-pink-500/10 hover:bg-pink-50/20',
    tileBg: 'bg-pink-50 border-pink-200/80',
    accentText: 'text-pink-700',
  },

  // ── Mobile Apps ──
  {
    name: 'React Native',
    cat: 'Mobile Apps',
    Icon: ReactNativeIcon,
    badge: 'Dual Native',
    role: 'Cross-Platform iOS & Android',
    feature: 'Unified Mobile Codebase',
    glow: 'hover:border-cyan-400 hover:shadow-cyan-500/10 hover:bg-cyan-50/20',
    tileBg: 'bg-cyan-50 border-cyan-200/80',
    accentText: 'text-cyan-700',
  },
  {
    name: 'Flutter',
    cat: 'Mobile Apps',
    Icon: FlutterIcon,
    badge: 'Skia Engine',
    role: 'Compiled 60 FPS Mobile Interfaces',
    feature: 'High-Fidelity Animations',
    glow: 'hover:border-blue-400 hover:shadow-blue-500/10 hover:bg-blue-50/20',
    tileBg: 'bg-blue-50 border-blue-200/80',
    accentText: 'text-blue-700',
  },
  {
    name: 'Swift (iOS)',
    cat: 'Mobile Apps',
    Icon: SwiftIcon,
    badge: 'Apple SDK',
    role: 'SwiftUI & Native Apple Ecosystem',
    feature: 'Hardware Acceleration',
    glow: 'hover:border-orange-400 hover:shadow-orange-500/10 hover:bg-orange-50/20',
    tileBg: 'bg-orange-50 border-orange-200/80',
    accentText: 'text-orange-700',
  },
  {
    name: 'Kotlin (Android)',
    cat: 'Mobile Apps',
    Icon: KotlinIcon,
    badge: 'Compose UI',
    role: 'Official Android Native Standard',
    feature: 'Optimized Battery & Memory',
    glow: 'hover:border-purple-400 hover:shadow-purple-500/10 hover:bg-purple-50/20',
    tileBg: 'bg-purple-50 border-purple-200/80',
    accentText: 'text-purple-700',
  },

  // ── Databases & DevOps ──
  {
    name: 'PostgreSQL',
    cat: 'Databases & DevOps',
    Icon: PostgresIcon,
    badge: 'ACID Storage',
    role: 'Complex Relational & JSONB Queries',
    feature: 'Fault-Tolerant Database',
    glow: 'hover:border-blue-400 hover:shadow-blue-500/10 hover:bg-blue-50/20',
    tileBg: 'bg-blue-50 border-blue-200/80',
    accentText: 'text-blue-700',
  },
  {
    name: 'MongoDB',
    cat: 'Databases & DevOps',
    Icon: MongoDbIcon,
    badge: 'NoSQL Clusters',
    role: 'Schema-Flexible Document Storage',
    feature: 'Horizontal Scalability',
    glow: 'hover:border-emerald-400 hover:shadow-emerald-500/10 hover:bg-emerald-50/20',
    tileBg: 'bg-emerald-50 border-emerald-200/80',
    accentText: 'text-emerald-700',
  },
  {
    name: 'Redis',
    cat: 'Databases & DevOps',
    Icon: RedisIcon,
    badge: 'In-Memory',
    role: 'Sub-Millisecond Cache & Pub/Sub',
    feature: 'Ultra-Low Latency Ops',
    glow: 'hover:border-red-400 hover:shadow-red-500/10 hover:bg-red-50/20',
    tileBg: 'bg-red-50 border-red-200/80',
    accentText: 'text-red-700',
  },
  {
    name: 'Docker',
    cat: 'Databases & DevOps',
    Icon: DockerIcon,
    badge: 'OCI Container',
    role: 'Reproducible Deployments & CI/CD',
    feature: 'Isolated Environments',
    glow: 'hover:border-sky-400 hover:shadow-sky-500/10 hover:bg-sky-50/20',
    tileBg: 'bg-sky-50 border-sky-200/80',
    accentText: 'text-sky-700',
  },
  {
    name: 'AWS Cloud',
    cat: 'Databases & DevOps',
    Icon: AwsIcon,
    badge: 'Global Infra',
    role: 'S3, EC2, CloudFront & Serverless',
    feature: '99.99% Uptime Reliability',
    glow: 'hover:border-amber-400 hover:shadow-amber-500/10 hover:bg-amber-50/20',
    tileBg: 'bg-amber-50 border-amber-200/80',
    accentText: 'text-amber-800',
  },
  {
    name: 'Firebase',
    cat: 'Databases & DevOps',
    Icon: FirebaseIcon,
    badge: 'Serverless Realtime',
    role: 'Realtime Sync, Auth & Webhooks',
    feature: 'Instant Live Updates',
    glow: 'hover:border-yellow-400 hover:shadow-yellow-500/10 hover:bg-yellow-50/20',
    tileBg: 'bg-yellow-50 border-yellow-200/80',
    accentText: 'text-yellow-800',
  },

  // ── CMS & E-Commerce ──
  {
    name: 'Shopify',
    cat: 'CMS & E-Commerce',
    Icon: ShopifyIcon,
    badge: 'D2C Commerce',
    role: 'Liquid & Headless Storefronts',
    feature: 'High-Volume Global Checkout',
    glow: 'hover:border-lime-400 hover:shadow-lime-500/10 hover:bg-lime-50/20',
    tileBg: 'bg-lime-50 border-lime-200/80',
    accentText: 'text-lime-800',
  },
  {
    name: 'WordPress',
    cat: 'CMS & E-Commerce',
    Icon: WordPressIcon,
    badge: 'Enterprise CMS',
    role: 'Custom Gutenberg, ACF & Headless API',
    feature: 'Self-Hosted Content Engine',
    glow: 'hover:border-blue-400 hover:shadow-blue-500/10 hover:bg-blue-50/20',
    tileBg: 'bg-blue-50 border-blue-200/80',
    accentText: 'text-blue-700',
  },
  {
    name: 'WooCommerce',
    cat: 'CMS & E-Commerce',
    Icon: WooCommerceIcon,
    badge: 'Custom Store',
    role: 'Flexible Product Catalog & Gateway Sync',
    feature: 'Extensible Shopping Cart',
    glow: 'hover:border-purple-400 hover:shadow-purple-500/10 hover:bg-purple-50/20',
    tileBg: 'bg-purple-50 border-purple-200/80',
    accentText: 'text-purple-700',
  },
]

// Duplicate for seamless infinite loop ticker
const TICKER_ITEMS = [...TECHNOLOGIES, ...TECHNOLOGIES]

export default function TechStackSection() {
  const [activeCat, setActiveCat] = useState('All')

  const filtered =
    activeCat === 'All'
      ? TECHNOLOGIES
      : TECHNOLOGIES.filter((t) => t.cat === activeCat)

  return (
    <section
      id="tech-stack"
      className="py-20 sm:py-24 bg-linear-to-b from-white via-slate-50/60 to-white border-t border-slate-100 relative overflow-hidden"
      aria-labelledby="tech-heading"
    >
      {/* ── Soft Architectural Ambient Blooms ── */}
      <div className="absolute top-1/4 -left-20 w-120 h-120 bg-blue-400/8 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-120 h-120 bg-cyan-400/8 blur-[140px] rounded-full pointer-events-none" />

      {/* Subtle Blueprint Mesh */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right,#0f172a 1px,transparent 1px),linear-gradient(to bottom,#0f172a 1px,transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, white 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, white 40%, transparent 80%)',
        }}
      />

      {/* ── Infinite Vector Brand Marquee Ticker ── */}
      <div className="ticker-wrapper mb-14 py-3.5 border-y border-slate-200/70 bg-white/70 backdrop-blur-md relative z-10 shadow-xs">
        <div className="ticker-track gap-0 items-center">
          {TICKER_ITEMS.map((t, i) => {
            const Icon = t.Icon
            return (
              <div
                key={`${t.name}-${i}`}
                className="flex items-center gap-2.5 px-4 py-2 mx-2 rounded-full border border-slate-200/90 bg-white/95 text-slate-800 text-xs font-semibold whitespace-nowrap shadow-xs hover:border-blue-400 hover:shadow-sm transition-all duration-200 cursor-default"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 object-contain" />
                </div>
                <span className="font-heading tracking-tight">{t.name}</span>
                <span className="text-[10px] text-blue-600 font-mono font-bold px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60">
                  {t.badge}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <Container className="relative z-10">
        {/* ── Section Header ── */}
        <div className="reveal text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            Our Technology Stack
          </div>

          <h2
            id="tech-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4"
          >
            Technologies We{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0D1B4B] via-[#1B6EF3] to-cyan-500">
              Trust & Master
            </span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            We engineer high-performance web systems, native applications, and cloud microservices
            using battle-tested, type-safe industry standards.
          </p>
        </div>

        {/* ── Category Filter Tabs ── */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-4xl mx-auto">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'All'
                ? TECHNOLOGIES.length
                : TECHNOLOGIES.filter((t) => t.cat === cat).length
            const isActive = activeCat === cat

            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-linear-to-r from-[#0D1B4B] via-blue-700 to-[#1B6EF3] border-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-xs'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Precision Tech Cards Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 reveal-stagger reveal">
          {filtered.map((t, i) => {
            const Icon = t.Icon
            return (
              <div
                key={t.name}
                className={`group relative p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_40px_-10px_rgba(27,110,243,0.14)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-default ${t.glow}`}
                style={{ animationDelay: `${i * 35}ms` }}
              >
                {/* Top Specular Rim */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Card Top: Elevated Vector Icon & Micro-Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center p-2.5 border shadow-xs transition-transform duration-300 group-hover:scale-110 ${t.tileBg}`}
                    >
                      <Icon className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/70 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                      {t.badge}
                    </span>
                  </div>

                  {/* Card Content: Name & Architectural Role */}
                  <h3 className="font-heading font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-snug mt-1 font-normal">
                    {t.role}
                  </p>
                </div>

                {/* Card Bottom: Capability Tag */}
                <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className={`font-bold truncate ${t.accentText}`}>
                    {t.feature}
                  </span>
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all">
                    →
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Enterprise Assurance Pillars ── */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: ShieldCheck,
              title: '100% Type-Safe Architecture',
              desc: 'End-to-end typed contracts via TypeScript & Zod',
            },
            {
              icon: Zap,
              title: 'Sub-100ms API Latency',
              desc: 'Edge runtime deployment & Redis in-memory cache',
            },
            {
              icon: Layers,
              title: 'Zero-Downtime CI/CD',
              desc: 'Automated GitHub Actions & containerized releases',
            },
            {
              icon: Sparkles,
              title: 'Clean Code Standards',
              desc: 'Modular component design with strict linting suites',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-xs hover:border-blue-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/70 flex items-center justify-center shrink-0 text-blue-600">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-800 leading-tight">
                  {title}
                </p>
                <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

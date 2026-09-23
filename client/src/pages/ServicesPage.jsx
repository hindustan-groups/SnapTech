import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  Users,
  Search,
  Sparkles,
  Cpu,
  Award,
  Layers,
  PhoneCall,
  MessageSquare,
  BadgeCheck,
} from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
import { serviceSchema, breadcrumbSchema, SITE } from '@/components/ui/SEO'
import { useServices } from '@/hooks/useServices'
import { getServiceIcon } from '@/utils/serviceIcons'
import { useSiteSettings } from '@/hooks/useContent'

/* ── Colour palette — cycles through services ─────────────────── */
const COLORS = [
  { gradient: 'from-blue-600 via-cyan-500 to-teal-400', glow: 'bg-cyan-500/10', border: 'hover:border-cyan-400/50', badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  { gradient: 'from-orange-500 via-amber-500 to-yellow-400', glow: 'bg-amber-500/10', border: 'hover:border-amber-400/50', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  { gradient: 'from-violet-600 via-purple-500 to-fuchsia-400', glow: 'bg-purple-500/10', border: 'hover:border-purple-400/50', badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  { gradient: 'from-emerald-600 via-teal-500 to-cyan-400', glow: 'bg-emerald-500/10', border: 'hover:border-emerald-400/50', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  { gradient: 'from-sky-600 via-blue-500 to-indigo-400', glow: 'bg-sky-500/10', border: 'hover:border-sky-400/50', badge: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
  { gradient: 'from-pink-600 via-rose-500 to-orange-400', glow: 'bg-rose-500/10', border: 'hover:border-rose-400/50', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
  { gradient: 'from-indigo-600 via-violet-500 to-cyan-400', glow: 'bg-indigo-500/10', border: 'hover:border-indigo-400/50', badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
]

/** Helper to resolve clean service category taxonomy */
export function getServiceCategory(s) {
  if (s.category) return s.category
  const slug = (s.slug || '').toLowerCase()
  if (slug.includes('web') || slug.includes('app') || slug.includes('commerce') || slug.includes('software')) return 'Engineering'
  if (slug.includes('cloud') || slug.includes('devops')) return 'Cloud & DevOps'
  if (slug.includes('marketing') || slug.includes('seo') || slug.includes('growth')) return 'Growth & SEO'
  if (slug.includes('brand') || slug.includes('design') || slug.includes('ui')) return 'Design & UI/UX'
  if (slug.includes('consulting') || slug.includes('strategy') || slug.includes('advisory')) return 'Advisory'
  return 'Enterprise'
}

/* ── Fallback Services (safety net if DB is connecting) ───────── */
const FALLBACK_SERVICES = [
  {
    id: '1',
    title: 'Custom Web Development',
    slug: 'web-development',
    icon: 'Globe',
    category: 'Engineering',
    tag: 'Most Popular',
    deliveryTime: '2–4 Weeks',
    techStack: ['React.js', 'Next.js', 'Node.js', 'WordPress', 'MongoDB', 'Tailwind CSS'],
    keyFeatures: ['Fully responsive on all devices', 'SEO-optimised from day one', 'Fast loading under 3s', 'Clean maintainable codebase'],
    shortDescription: 'High-performance, ultra-responsive web applications engineered with React, Next.js, Node.js, and PostgreSQL for maximum conversion speed.',
  },
  {
    id: '2',
    title: 'Digital Marketing & SEO',
    slug: 'digital-marketing-seo',
    icon: 'Megaphone',
    category: 'Growth & SEO',
    tag: 'High ROI',
    deliveryTime: 'Ongoing Monthly',
    techStack: ['Google Ads', 'Meta Ads', 'SEMrush', 'Google Analytics', 'Search Console'],
    keyFeatures: ['Full SEO audit and on-page fixes', 'Google & Meta paid ad campaigns', 'Monthly ROI analytics reports'],
    shortDescription: 'Revenue-focused digital growth engines spanning search dominance, programmatic ad management, and conversion funnel optimization.',
  },
  {
    id: '3',
    title: 'IT Consulting & Strategy',
    slug: 'it-consulting-strategy',
    icon: 'Lightbulb',
    category: 'Advisory',
    tag: 'Expert Advice',
    deliveryTime: '1–2 Weeks',
    techStack: ['AWS', 'Azure', 'Microservices', 'System Architecture', 'Compliance'],
    keyFeatures: ['Current system assessment', 'Technology roadmap design', 'Cloud architecture review'],
    shortDescription: 'Strategic IT advisory from veteran architects. We modernise legacy systems, establish microservices architectures, and align tech stacks.',
  },
  {
    id: '4',
    title: 'E-Commerce Solutions',
    slug: 'ecommerce-solutions',
    icon: 'Monitor',
    category: 'Engineering',
    tag: 'Sell More',
    deliveryTime: '3–6 Weeks',
    techStack: ['Shopify', 'WooCommerce', 'Razorpay', 'Stripe', 'React', 'Inventory APIs'],
    keyFeatures: ['Custom storefront design', 'Secure payment integration', 'Mobile-first checkout flow'],
    shortDescription: 'Turnkey high-converting digital storefronts, custom Shopify Plus developments, headless commerce platforms, and instant payment gateway integrations.',
  },
  {
    id: '5',
    title: 'Cloud Solutions & DevOps',
    slug: 'cloud-solutions-devops',
    icon: 'Settings',
    category: 'Cloud & DevOps',
    tag: 'Scalable',
    deliveryTime: '1–3 Weeks',
    techStack: ['AWS', 'Google Cloud', 'Docker', 'Kubernetes', 'GitHub Actions', 'Nginx'],
    keyFeatures: ['Cloud server setup & migration', 'Automated CI/CD pipelines', '99.9% uptime guarantee'],
    shortDescription: 'Mission-critical cloud orchestration on AWS, GCP, and Azure. Zero-downtime automated deployment pipelines and auto-scaling clusters.',
  },
  {
    id: '6',
    title: 'Branding & UI/UX Design',
    slug: 'branding-ui-ux-design',
    icon: 'Layers',
    category: 'Design & UI/UX',
    tag: 'Stand Out',
    deliveryTime: '2–3 Weeks',
    techStack: ['Figma', 'Adobe Illustrator', 'Prototyping', 'Design Tokens', 'Style Guides'],
    keyFeatures: ['Professional logo design', 'Full brand identity system', 'UI design with Figma prototypes'],
    shortDescription: 'Award-winning product interfaces that captivate users. We design scalable design systems, interactive prototypes, and cohesive brand identities.',
  },
  {
    id: '7',
    title: 'Mobile App Development',
    slug: 'mobile-app-development',
    icon: 'Smartphone',
    category: 'Engineering',
    tag: 'iOS & Android',
    deliveryTime: '6–12 Weeks',
    techStack: ['React Native', 'Flutter', 'Firebase', 'REST APIs', 'App Store', 'Play Store'],
    keyFeatures: ['Cross-platform iOS & Android', 'Native-like performance', 'App Store submission handled'],
    shortDescription: 'Flawless cross-platform iOS and Android applications. Native 60fps animations, robust offline caching, push notifications, and verified App Store deployment.',
  },
]

/* ── Skeleton Card ────────────────────────────────────────────── */
function ServiceSkeleton() {
  return (
    <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-7 flex flex-col gap-4 animate-pulse backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="w-14 h-14 rounded-2xl bg-white/10" />
        <div className="h-5 w-20 bg-white/10 rounded-full" />
      </div>
      <div className="h-6 bg-white/10 rounded w-2/3 mt-2" />
      <div className="space-y-2 flex-1">
        <div className="h-3.5 bg-white/5 rounded w-full" />
        <div className="h-3.5 bg-white/5 rounded w-5/6" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-20 bg-white/10 rounded-md" />
        <div className="h-6 w-24 bg-white/10 rounded-md" />
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const { data, isLoading, isError, refetch } = useServices()
  const { data: settingsData } = useSiteSettings()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const services = useMemo(() => {
    if (data?.data?.length) return data.data
    if (isLoading) return []
    return FALLBACK_SERVICES
  }, [data, isLoading])

  const cfg = settingsData?.data || {}
  const phone = cfg.phone || '+91 75970 00601'
  const whatsappNum = (cfg.whatsapp || cfg.phone || '919929120431').replace(/[^0-9]/g, '')

  // Extract dynamic categories with counters
  const categoryStats = useMemo(() => {
    const counts = { All: services.length }
    services.forEach((s) => {
      const cat = getServiceCategory(s)
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [services])

  const categories = useMemo(() => {
    return Object.keys(categoryStats)
  }, [categoryStats])

  // Multi-attribute filter
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        s.title?.toLowerCase().includes(q) ||
        s.shortDescription?.toLowerCase().includes(q) ||
        s.tag?.toLowerCase().includes(q) ||
        s.techStack?.some((t) => t.toLowerCase().includes(q)) ||
        s.keyFeatures?.some((f) => f.toLowerCase().includes(q))

      const serviceCat = getServiceCategory(s)
      const matchCategory = activeCategory === 'All' || serviceCat === activeCategory

      return matchSearch && matchCategory
    })
  }, [services, searchQuery, activeCategory])

  const telemetryStats = [
    { icon: Zap, label: 'Deployment Velocity', value: '2–4 Weeks Sprint', sub: 'Production Ready' },
    { icon: Shield, label: 'Enterprise Security', value: '100% Zero Defect', sub: 'ISO SLA Standards' },
    { icon: Clock, label: 'Active Support', value: '24/7 Engineering Desk', sub: 'Instant Escalation' },
    { icon: Users, label: 'Group Backed', value: `${cfg.stat_clients || '50'}+ Enterprises`, sub: 'Hindustan Projects' },
  ]

  return (
    <div className="bg-[#020714] min-h-screen text-slate-100 selection:bg-brand-cyan/20 selection:text-brand-cyan">
      <SEO
        title="Enterprise IT Solutions & Services — Snaptech | Hindustan Projects"
        description="Explore Snaptech's full-suite IT capabilities: custom web applications, native mobile apps, cloud architecture, AI automation, enterprise CRM, and SEO engineering."
        path="/services"
        keywords="Snaptech, Hindustan Projects IT, enterprise IT services, custom web development, mobile app development, cloud architecture, AI automation India"
        schemas={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
          ]),
          ...services.map((s) =>
            serviceSchema({
              title: s.title,
              description: s.shortDescription,
              url: `${SITE.url}/services/${s.slug}`,
              serviceType: s.title,
            })
          ),
        ]}
      />

      {/* ── 1. Cyber Hero Header ───────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 overflow-hidden border-b border-white/10 bg-[#020714]">
        {/* Deep Cyber Mesh Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-cyan/15 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

        <Container className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                Snaptech Enterprise Capabilities
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold text-white leading-[1.12] mb-6">
                Next-Gen IT Services{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-primary-light to-white">
                  Engineered For Scale.
                </span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-light">
                From high-concurrency cloud systems and resilient mobile apps to AI automation and high-ROI technical SEO — 
                Snaptech delivers battle-tested engineering governed by Hindustan Projects Group.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  variant="primary"
                  size="lg"
                  as={Link}
                  to="/contact"
                  className="bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-brand-primary-dark hover:to-brand-cyan-dark text-white font-bold px-8 shadow-[0_0_25px_rgba(30,107,238,0.4)] border border-brand-cyan/40"
                >
                  Schedule Solution Architect
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  as={Link}
                  to="/portfolio"
                  className="text-white border border-white/20 hover:bg-white/10 backdrop-blur-md"
                >
                  View Case Studies <ArrowRight className="w-4 h-4 ml-2 inline text-brand-cyan" />
                </Button>
              </div>
            </div>

            {/* Right: Live Interactive Ecosystem Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-white/15 bg-slate-900/70 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Telemetry Matrix
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-brand-cyan px-2.5 py-0.5 rounded-md bg-brand-cyan/10 border border-brand-cyan/20">
                    Live Active ({services.length} Solutions)
                  </span>
                </div>

                <div className="space-y-3">
                  {services.slice(0, 4).map((s, idx) => {
                    const Icon = getServiceIcon(s.icon)
                    const c = COLORS[idx % COLORS.length]
                    return (
                      <Link
                        key={s.id || idx}
                        to={`/services/${s.slug}`}
                        className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.03] hover:border-brand-cyan/40 hover:bg-white/[0.06] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.gradient} flex items-center justify-center shrink-0 shadow-md`}>
                            <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors">
                              {s.title}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {s.tag || 'Enterprise Grade'} • {s.deliveryTime || '2–4 Weeks'}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
                      </Link>
                    )
                  })}
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-brand-cyan" /> Certified Solution Architects
                  </span>
                  <span className="text-brand-cyan font-mono font-semibold">100% Dynamic Engine</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 2. Enterprise Telemetry & SLA Strip ─────────────────────── */}
      <section className="bg-[#03091e] border-b border-white/10 py-6 sm:py-8">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {telemetryStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-brand-cyan/40 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shrink-0">
                  <stat.icon className="w-5 h-5 text-brand-cyan" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-base font-bold text-white font-heading">{stat.value}</p>
                  <p className="text-xs text-slate-300 font-medium">{stat.label}</p>
                  <p className="text-[11px] text-brand-cyan/70 font-mono">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 3. Services Catalog & Filter Section ────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#020714] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.1),rgba(255,255,255,0))] pointer-events-none" />

        <Container className="relative">
          {/* Section Heading */}
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/40 bg-brand-primary/10 text-brand-cyan text-xs font-semibold uppercase tracking-widest mb-4">
              <Cpu className="w-3.5 h-3.5 text-brand-cyan" /> Full Engineering Spectrum
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Comprehensive Technology Solutions
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              Choose standalone engineering modules or commission complete end-to-end enterprise transformation suites.
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-12 p-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by capability, tech (React, AWS), or deliverable..."
                className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-cyan hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills with Dynamic Counters */}
            <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
              {categories.map((cat) => {
                const count = categoryStats[cat] || 0
                const isActive = activeCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-primary to-brand-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-brand-cyan/40'
                        : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error State */}
          {isError ? (
            <div className="text-center py-16 p-8 rounded-2xl border border-red-500/30 bg-red-500/5 max-w-lg mx-auto">
              <p className="text-red-400 font-semibold mb-3">Unable to synchronize with live database.</p>
              <button
                onClick={() => refetch()}
                className="px-5 py-2 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary-dark transition-all text-sm"
              >
                Reconnect API
              </button>
            </div>
          ) : (
            /* Services Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)
                : filteredServices.map((service, index) => {
                    const Icon = getServiceIcon(service.icon)
                    const c = COLORS[index % COLORS.length]
                    const features = service.keyFeatures?.length
                      ? service.keyFeatures
                      : ['High-Performance Architecture', 'Enterprise Grade Security', 'Guaranteed SLA Delivery']
                    const tech = service.techStack || []

                    return (
                      <div
                        key={service.id || index}
                        className={`group relative rounded-2xl border border-white/10 bg-slate-900/70 p-7 flex flex-col
                          backdrop-blur-xl ${c.border} hover:shadow-[0_0_35px_rgba(6,182,212,0.18)]
                          hover:-translate-y-1.5 transition-all duration-300 overflow-hidden`}
                      >
                        {/* Ambient Card Background Glow on Hover */}
                        <div
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl ${c.glow} pointer-events-none`}
                        />

                        {/* Top Bar: Number + Delivery Time + Tag */}
                        <div className="relative flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-brand-cyan/70 tracking-widest">
                              {String(index + 1).padStart(2, '0')} // MODULE
                            </span>
                            {service.deliveryTime && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                                <Clock className="w-2.5 h-2.5 text-brand-cyan" />
                                {service.deliveryTime}
                              </span>
                            )}
                          </div>
                          {service.tag && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono border ${c.badge}`}>
                              {service.tag}
                            </span>
                          )}
                        </div>

                        {/* Icon */}
                        <div
                          className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300`}
                        >
                          <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                        </div>

                        {/* Title */}
                        <Link to={`/services/${service.slug}`}>
                          <h3 className="relative font-heading text-xl font-bold text-white group-hover:text-brand-cyan transition-colors mb-2.5">
                            {service.title}
                          </h3>
                        </Link>

                        {/* Description */}
                        <p className="relative text-xs sm:text-sm text-slate-300/80 leading-relaxed mb-5 line-clamp-3 font-light">
                          {service.shortDescription}
                        </p>

                        {/* Dynamic Tech Stack Chips */}
                        {tech.length > 0 && (
                          <div className="relative flex flex-wrap gap-1.5 mb-5">
                            {tech.slice(0, 4).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/10"
                              >
                                {t}
                              </span>
                            ))}
                            {tech.length > 4 && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                                +{tech.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Feature Badges Preview */}
                        <div className="relative flex flex-col gap-1.5 mb-6 mt-auto pt-4 border-t border-white/5">
                          {features.slice(0, 3).map((f, fi) => (
                            <div key={fi} className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate">{f}</span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="relative pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                          <Link
                            to={`/services/${service.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-cyan group-hover:text-white transition-colors"
                          >
                            <span>Explore Architecture</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </Link>

                          <a
                            href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                              `Hello Snaptech, I would like to consult for ${service.title} architecture.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-colors"
                            title="Quick WhatsApp discussion"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-400" />
                            <span>Discuss</span>
                          </a>
                        </div>
                      </div>
                    )
                  })}
            </div>
          )}

          {/* Empty Search Result */}
          {!isLoading && filteredServices.length === 0 && (
            <div className="text-center py-16 p-8 rounded-2xl border border-white/10 bg-slate-900/40">
              <p className="text-lg font-bold text-white mb-2">No matching solutions found</p>
              <p className="text-sm text-slate-400 mb-6">
                Try searching for a different keyword or switch the category filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('All')
                }}
                className="text-white border-white/20"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* ── 4. Direct Pricing Packages Banner ───────────────────────── */}
      <section className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/50 border-t border-b border-white/10 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08),transparent_60%)] pointer-events-none" />
        <Container className="relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl border border-brand-cyan/20 bg-slate-900/70 backdrop-blur-xl">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-mono font-bold uppercase tracking-wider">
                <BadgeCheck className="w-3.5 h-3.5 text-brand-cyan" /> Transparent Investment Packages
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Looking For Predictable Package Tiers With Zero Hidden Costs?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-light">
                Explore our Starter, Business, and Enterprise packages spanning full-stack web platforms, mobile apps, and enterprise cloud migrations with clear delivery timelines.
              </p>
            </div>
            <Button
              as={Link}
              to="/pricing"
              variant="primary"
              className="shrink-0 bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-brand-primary-dark hover:to-brand-cyan-dark text-white font-bold px-6 py-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Explore Pricing &amp; Packages <ArrowRight className="w-4 h-4 ml-2 inline" />
            </Button>
          </div>
        </Container>
      </section>

      {/* ── 5. The 4-Step Engineering Delivery Model ────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#03091e] border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <Container className="relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 mb-14">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan text-xs font-semibold uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5 text-brand-cyan" /> Agile Delivery Model
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">
                From Specification to Production In 4 Sprints
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Our ISO-compliant delivery pipeline guarantees full repository visibility, clean documentation, zero technical debt, and deterministic milestone deadlines.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                as={Link}
                to="/contact"
                className="border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan/10 font-bold"
              >
                Request Architecture Blueprint
              </Button>
            </div>
          </div>

          {/* 4 Interactive Process Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Technical Discovery',
                desc: 'Comprehensive systems audit, user journey mapping, and technical spec definition.',
                time: 'Sprint 1',
              },
              {
                step: '02',
                title: 'Architecture & UI Prototype',
                desc: 'Figma high-fidelity interactive prototypes and cloud infrastructure blueprint design.',
                time: 'Sprint 2',
              },
              {
                step: '03',
                title: 'Full-Stack Development',
                desc: 'Agile sprints with clean code standards, rigorous unit testing, and automated CI/CD.',
                time: 'Sprint 3–4',
              },
              {
                step: '04',
                title: 'Launch & 24/7 SLA Support',
                desc: 'Zero-downtime production deployment, APM monitoring setup, and guaranteed warranty.',
                time: 'Perpetual SLA',
              },
            ].map((p) => (
              <div
                key={p.step}
                className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl relative group hover:border-brand-cyan/50 hover:bg-slate-900/80 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-cyan flex items-center justify-center font-heading font-extrabold text-white text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    {p.step}
                  </div>
                  <span className="text-[11px] font-mono text-brand-cyan px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                    {p.time}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-white mb-2 group-hover:text-brand-cyan transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-slate-300/80 leading-relaxed font-light">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 6. Bottom Consultation Banner ──────────────────────────── */}
      <section className="relative py-20 sm:py-24 overflow-hidden bg-[#020714]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(30,107,238,0.25),transparent_70%)] pointer-events-none" />

        <Container className="relative">
          <div className="max-w-4xl mx-auto rounded-3xl border border-brand-cyan/30 bg-gradient-to-b from-slate-900/90 to-[#020714] p-8 sm:p-12 lg:p-16 text-center backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.12)]">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Direct Lead Engineer Consultation
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
              Need A Tailored Architecture For Your Business?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto font-light">
              Speak directly with our senior technology team. We will analyze your scope, estimate investment, and formulate a clear 30-day delivery roadmap.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                variant="primary"
                size="lg"
                as={Link}
                to="/contact"
                className="w-full sm:w-auto bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-brand-primary-dark hover:to-brand-cyan-dark text-white font-bold px-8 shadow-[0_0_25px_rgba(30,107,238,0.4)]"
              >
                Schedule Strategy Call
              </Button>
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 text-sm font-semibold transition-all"
              >
                <PhoneCall className="w-4 h-4 text-brand-cyan" />
                <span>Call {phone}</span>
              </a>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 text-slate-300 text-xs font-mono">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Upfront Discovery Cost
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 24-Hour Spec Response SLA
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Code &amp; IP Ownership
              </span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}



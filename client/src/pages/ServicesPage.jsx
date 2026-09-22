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
} from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
import { serviceSchema, breadcrumbSchema, SITE } from '@/components/ui/SEO'
import { useServices } from '@/hooks/useServices'
import { getServiceIcon } from '@/utils/serviceIcons'
import { useSiteSettings } from '@/hooks/useContent'

/* ── Colour palette — cycles through services ─────────────────── */
const COLORS = [
  { gradient: 'from-blue-600 via-cyan-500 to-teal-400', glow: 'bg-cyan-500/10', border: 'hover:border-cyan-500/50' },
  { gradient: 'from-orange-500 via-amber-500 to-yellow-400', glow: 'bg-amber-500/10', border: 'hover:border-amber-500/50' },
  { gradient: 'from-violet-600 via-purple-500 to-fuchsia-400', glow: 'bg-purple-500/10', border: 'hover:border-purple-500/50' },
  { gradient: 'from-emerald-600 via-teal-500 to-cyan-400', glow: 'bg-emerald-500/10', border: 'hover:border-emerald-500/50' },
  { gradient: 'from-sky-600 via-blue-500 to-indigo-400', glow: 'bg-sky-500/10', border: 'hover:border-sky-500/50' },
  { gradient: 'from-pink-600 via-rose-500 to-orange-400', glow: 'bg-rose-500/10', border: 'hover:border-rose-500/50' },
  { gradient: 'from-indigo-600 via-violet-500 to-cyan-400', glow: 'bg-indigo-500/10', border: 'hover:border-indigo-500/50' },
]

/* ── Local Fallback Services data (when DB is empty) ──────────── */
const FALLBACK_SERVICES = [
  {
    id: '1',
    title: 'Custom Web Development',
    slug: 'web-development',
    icon: 'Code2',
    category: 'Engineering',
    tag: 'Enterprise Scaled',
    features: ['React & Next.js 15', 'Full-Stack Architecture', 'Core Web Vitals 99+'],
    shortDescription:
      'High-performance, ultra-responsive web applications engineered with React, Next.js, Node.js, and PostgreSQL for maximum conversion speed and enterprise durability.',
  },
  {
    id: '2',
    title: 'Digital Growth & Technical SEO',
    slug: 'digital-marketing-seo',
    icon: 'Megaphone',
    category: 'Growth',
    tag: 'High Intent ROI',
    features: ['Technical SEO Audits', 'Algorithmic PPC Campaigns', 'Conversion Funnels'],
    shortDescription:
      'Revenue-focused digital growth engines spanning search dominance, programmatic ad management, and conversion funnel optimization.',
  },
  {
    id: '3',
    title: 'IT Consulting & Enterprise Architecture',
    slug: 'it-consulting-strategy',
    icon: 'Lightbulb',
    category: 'Consulting',
    tag: 'Strategic Advisory',
    features: ['Multi-Cloud Blueprint', 'Microservices Architecture', 'Security & Compliance'],
    shortDescription:
      'Strategic IT advisory from veteran architects. We modernise legacy systems, establish microservices architectures, and align tech stacks with aggressive business targets.',
  },
  {
    id: '4',
    title: 'E-Commerce & Digital Commerce',
    slug: 'ecommerce-solutions',
    icon: 'Monitor',
    category: 'Engineering',
    tag: 'Omnichannel Sales',
    features: ['Sub-Second Checkout', 'Automated Inventory ERP', 'Multi-Currency Gateways'],
    shortDescription:
      'Turnkey high-converting digital storefronts, custom Shopify Plus developments, headless commerce platforms, and instant payment gateway integrations.',
  },
  {
    id: '5',
    title: 'Cloud Solutions & DevOps Orchestration',
    slug: 'cloud-solutions-devops',
    icon: 'Settings',
    category: 'Cloud',
    tag: 'Zero Downtime',
    features: ['Kubernetes & Docker', 'Automated CI/CD Workflows', '24/7 Observability'],
    shortDescription:
      'Mission-critical cloud orchestration on AWS, GCP, and Azure. Zero-downtime automated deployment pipelines, auto-scaling clusters, and automated disaster recovery.',
  },
  {
    id: '6',
    title: 'UI/UX Design Systems & Product Branding',
    slug: 'branding-ui-ux-design',
    icon: 'Layers',
    category: 'Design',
    tag: 'World-Class Aesthetic',
    features: ['Interactive Figma Systems', 'Micro-Interaction Polish', 'Scalable Design Tokens'],
    shortDescription:
      'Award-winning product interfaces that captivate users. We design scalable design systems, interactive prototypes, and cohesive corporate identities.',
  },
  {
    id: '7',
    title: 'Mobile App Engineering (iOS & Android)',
    slug: 'mobile-app-development',
    icon: 'Smartphone',
    category: 'Engineering',
    tag: 'Native Performance',
    features: ['React Native & Flutter', 'Biometrics & Native SDKs', 'App Store Acceleration'],
    shortDescription:
      'Flawless cross-platform iOS and Android applications. Native 60fps animations, robust offline caching, push notifications, and verified App Store deployment.',
  },
]

/* ── Skeleton Card ────────────────────────────────────────────── */
function ServiceSkeleton() {
  return (
    <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-7 flex flex-col gap-4 animate-pulse backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="w-14 h-14 rounded-2xl bg-white/10" />
        <div className="h-4 w-12 bg-white/10 rounded-full" />
      </div>
      <div className="h-6 bg-white/10 rounded w-2/3 mt-2" />
      <div className="space-y-2 flex-1">
        <div className="h-3.5 bg-white/5 rounded w-full" />
        <div className="h-3.5 bg-white/5 rounded w-5/6" />
        <div className="h-3.5 bg-white/5 rounded w-4/6" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-24 bg-white/10 rounded-full" />
        <div className="h-6 w-20 bg-white/10 rounded-full" />
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

  // Filter logic
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.features?.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchCategory =
        activeCategory === 'All' ||
        (s.category && s.category.toLowerCase() === activeCategory.toLowerCase()) ||
        (activeCategory === 'Engineering' && (s.slug.includes('web') || s.slug.includes('app') || s.slug.includes('commerce'))) ||
        (activeCategory === 'Cloud' && s.slug.includes('cloud')) ||
        (activeCategory === 'Growth' && s.slug.includes('marketing')) ||
        (activeCategory === 'Design' && s.slug.includes('design')) ||
        (activeCategory === 'Consulting' && s.slug.includes('consulting'))

      return matchSearch && matchCategory
    })
  }, [services, searchQuery, activeCategory])

  const categories = ['All', 'Engineering', 'Cloud', 'Growth', 'Design', 'Consulting']

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
                    Live Active
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
                              {s.tag || 'Enterprise Grade'}
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
                    <Award className="w-3.5 h-3.5 text-brand-cyan" /> Certified Architects
                  </span>
                  <span className="text-brand-cyan font-mono font-semibold">100% Dynamic API</span>
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
            {telemetryStats.map((stat, i) => (
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
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12 p-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search solutions, tech, or tags..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-brand-primary to-brand-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-brand-cyan/40'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/25 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
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
                    const features = service.features || [
                      'High-Performance Stack',
                      'Enterprise Grade Security',
                      'Dedicated SLA Assurance',
                    ]

                    return (
                      <Link
                        key={service.id || index}
                        to={`/services/${service.slug}`}
                        className={`group relative rounded-2xl border border-white/10 bg-slate-900/70 p-7 flex flex-col
                          backdrop-blur-xl ${c.border} hover:shadow-[0_0_35px_rgba(6,182,212,0.18)]
                          hover:-translate-y-1.5 transition-all duration-300 overflow-hidden`}
                      >
                        {/* Ambient Card Background Glow on Hover */}
                        <div
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl ${c.glow} pointer-events-none`}
                        />

                        {/* Top Bar: Number + Tag */}
                        <div className="relative flex items-center justify-between mb-6">
                          <span className="text-xs font-mono font-bold text-brand-cyan/70 tracking-widest">
                            {String(index + 1).padStart(2, '0')} // MODULE
                          </span>
                          {service.tag && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono bg-white/5 border border-white/15 text-slate-300 group-hover:border-brand-cyan/40 group-hover:text-brand-cyan transition-colors">
                              {service.tag}
                            </span>
                          )}
                        </div>

                        {/* Icon */}
                        <div
                          className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                        </div>

                        {/* Title */}
                        <h3 className="relative font-heading text-xl font-bold text-white group-hover:text-brand-cyan transition-colors mb-3">
                          {service.title}
                        </h3>

                        {/* Description */}
                        <p className="relative text-sm text-slate-300/80 leading-relaxed mb-6 line-clamp-3">
                          {service.shortDescription}
                        </p>

                        {/* Feature Badges */}
                        <div className="relative flex flex-wrap gap-2 mb-6 mt-auto">
                          {features.slice(0, 3).map((f, fi) => (
                            <span
                              key={fi}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-medium text-slate-300"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {f}
                            </span>
                          ))}
                        </div>

                        {/* Bottom Link Action */}
                        <div className="relative pt-4 border-t border-white/10 flex items-center justify-between text-sm font-semibold text-brand-cyan group-hover:text-white transition-colors">
                          <span>Explore Solution Architecture</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                        </div>
                      </Link>
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

      {/* ── 4. The 4-Step Engineering Delivery Model ────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#03091e] border-t border-b border-white/10 relative overflow-hidden">
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
                Our ISO-compliant delivery pipeline guarantees full visibility, clean documentation, zero technical debt, and deterministic timelines.
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
            ].map((p, i) => (
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

      {/* ── 5. Bottom Consultation Banner ──────────────────────────── */}
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
            <p className="text-slate-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto font-light">
              Speak directly with our senior technology team. We will analyze your scope, estimate investment, and formulate a clear 30-day delivery roadmap.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="primary"
                size="lg"
                as={Link}
                to="/contact"
                className="w-full sm:w-auto bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-brand-primary-dark hover:to-brand-cyan-dark text-white font-bold px-8 shadow-[0_0_25px_rgba(30,107,238,0.4)]"
              >
                Schedule 30-Min Strategy Call
              </Button>
              <Button
                variant="ghost"
                size="lg"
                as={Link}
                to="/portfolio"
                className="w-full sm:w-auto text-white border border-white/20 hover:bg-white/10"
              >
                Inspect Past Deliverables
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 text-slate-300 text-xs font-mono">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Upfront Discovery Cost
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 24-Hour Spec Response SLA
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Non-Disclosure Agreement (NDA) Protected
              </span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}


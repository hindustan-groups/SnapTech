/**
 * /services — Premium services listing page — fully dynamic from DB
 */
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Zap, Shield, Clock, Users } from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
import { serviceSchema, breadcrumbSchema } from '@/components/ui/SEO'
import { SITE } from '@/components/ui/SEO'
import { useServices } from '@/hooks/useServices'
import { getServiceIcon } from '@/utils/serviceIcons'
import { useSiteSettings } from '@/hooks/useContent'

/* ── Colour palette — cycles through services ─────────────────── */
const COLORS = [
  { gradient: 'from-blue-500 to-cyan-400', glow: 'bg-blue-500/10' },
  { gradient: 'from-orange-500 to-rose-400', glow: 'bg-orange-500/10' },
  { gradient: 'from-violet-500 to-purple-400', glow: 'bg-violet-500/10' },
  { gradient: 'from-emerald-500 to-teal-400', glow: 'bg-emerald-500/10' },
  { gradient: 'from-sky-500 to-indigo-400', glow: 'bg-sky-500/10' },
  { gradient: 'from-pink-500 to-rose-400', glow: 'bg-pink-500/10' },
  { gradient: 'from-amber-500 to-yellow-400', glow: 'bg-amber-500/10' },
]

/* ── Local Fallback Services data (when DB is not connected) ── */
const SERVICES = [
  {
    id: '1',
    title: 'Web Development',
    slug: 'web-development',
    icon: 'Code2',
    tag: 'Most Popular',
    features: ['React & Next.js', 'SEO Optimised', 'Mobile Responsive'],
    shortDescription:
      'Custom, responsive websites built with modern technologies like React, Node.js, and WordPress — optimised for speed, SEO, and conversions.',
  },
  {
    id: '2',
    title: 'Digital Marketing & SEO',
    slug: 'digital-marketing-seo',
    icon: 'Megaphone',
    tag: 'High ROI',
    features: ['Google & Meta Ads', 'SEO & Content', 'Analytics Reports'],
    shortDescription:
      'Result-driven digital marketing campaigns spanning SEO, Google Ads, Meta Ads, and content marketing to drive high-intent leads.',
  },
  {
    id: '3',
    title: 'IT Consulting & Strategy',
    slug: 'it-consulting-strategy',
    icon: 'Lightbulb',
    tag: 'Expert Advice',
    features: ['Tech Roadmap', 'System Architecture', 'Growth Planning'],
    shortDescription:
      'Strategic IT advisory to align your technology roadmap with business growth. We help you choose the right systems and architecture.',
  },
  {
    id: '4',
    title: 'E-Commerce Solutions',
    slug: 'ecommerce-solutions',
    icon: 'Monitor',
    tag: 'Sell More',
    features: ['Secure Payments', 'Inventory Mgmt', 'Checkout Optimized'],
    shortDescription:
      'End-to-end e-commerce store setup, checkout optimisation, inventory management systems, and secure payment gateway integrations.',
  },
  {
    id: '5',
    title: 'Cloud Solutions & DevOps',
    slug: 'cloud-solutions-devops',
    icon: 'Settings',
    tag: 'Scale Fast',
    features: ['AWS & Google Cloud', 'CI/CD Pipelines', 'Zero Downtime'],
    shortDescription:
      'Secure cloud hosting setup, AWS/Google Cloud management, server scaling, and continuous deployment workflows for zero downtime.',
  },
  {
    id: '6',
    title: 'Branding & UI/UX Design',
    slug: 'branding-ui-ux-design',
    icon: 'Layers',
    tag: 'Premium Look',
    features: ['Logo & Guidelines', 'Modern UI/UX', 'Prototypes'],
    shortDescription:
      'Premium user interface and user experience designs coupled with complete corporate brand identity systems, logos, and guidelines.',
  },
  {
    id: '7',
    title: 'Mobile App Development',
    slug: 'mobile-app-development',
    icon: 'Smartphone',
    tag: 'Custom Apps',
    features: ['React Native & Flutter', 'iOS & Android', 'Store Publishing'],
    shortDescription:
      'Native and cross-platform mobile apps for iOS and Android built with React Native and Flutter. Secure, high-performing, and published on App Stores.',
  },
]

/* ── Skeleton card ────────────────────────────────────────────── */
function ServiceSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-7 flex flex-col gap-4 animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-gray-100" />
      <div className="h-5 bg-gray-100 rounded w-2/3" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const { data, isLoading, isError, refetch } = useServices()
  const { data: settingsData } = useSiteSettings()

  const services = data?.data?.length ? data.data : isLoading ? [] : SERVICES
  const cfg = settingsData?.data || {}

  const whyStats = [
    { icon: Zap, label: 'Fast Delivery', value: '2–4 Weeks' },
    { icon: Shield, label: 'Trusted & Secure', value: '100% Safe' },
    { icon: Clock, label: 'Support', value: '24/7 Available' },
    { icon: Users, label: 'Happy Clients', value: `${cfg.stat_clients || '50'}+ Businesses` },
  ]

  return (
    <>
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

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-32 lg:pt-36 pb-12 sm:pb-20 lg:pb-24 overflow-hidden bg-[#020714]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-brand-cyan/15 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <Container className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-cyan text-xs font-semibold uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                Snaptech IT Division
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-tight mb-5">
                Enterprise IT Services{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary-light via-brand-cyan to-white">
                  Engineered for Scale
                </span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
                From responsive web applications and native mobile software to secure cloud infrastructure and AI automation — 
                Snaptech delivers end-to-end technology solutions backed by Hindustan Projects Group.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="lg" as={Link} to="/contact" className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold">
                  Schedule Tech Consultation
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  as={Link}
                  to="/portfolio"
                  className="text-white border border-white/20 hover:bg-white/10"
                >
                  View Case Studies
                </Button>
              </div>
            </div>

            {/* Right — service tags from DB */}
            <div className="hidden lg:grid grid-cols-2 gap-2.5">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                  ))
                : services.map((s, i) => {
                    const Icon = getServiceIcon(s.icon)
                    const c = COLORS[i % COLORS.length]
                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/25 hover:bg-white/10 transition-all duration-300"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.gradient} flex items-center justify-center shrink-0`}
                        >
                          <Icon className="w-4 h-4 text-white" strokeWidth={1.8} />
                        </div>
                        <span className="text-sm text-white/80 font-medium">{s.title}</span>
                      </div>
                    )
                  })}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Why Us Stats Strip ── */}
      <section className="bg-white border-b border-gray-100">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {whyStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5 group hover:bg-brand-blue/3 transition-colors duration-200 border-b border-r border-gray-100 [&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r lg:[&:nth-child(4)]:border-r-0"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-blue/8 flex items-center justify-center shrink-0 group-hover:bg-brand-blue/14 transition-colors">
                  <stat.icon className="w-5 h-5 text-brand-blue" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-base font-bold text-brand-blue font-heading">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Services Grid ── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50/60 to-white">
        <Container>
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-red">
              All Services
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-blue mt-2 mb-3">
              Everything Your Business Needs
            </h2>
            <p className="text-text-muted max-w-xl mx-auto text-sm sm:text-base">
              Pick a single service or bundle them — we tailor every engagement to your goals and
              budget.
            </p>
          </div>

          {isError ? (
            <div className="text-center py-16">
              <p className="text-text-muted mb-4">Could not load services. Please try again.</p>
              <button
                onClick={refetch}
                className="text-sm font-medium text-brand-blue underline hover:text-brand-red transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)
                : services.map((service, index) => {
                    const Icon = getServiceIcon(service.icon)
                    const c = COLORS[index % COLORS.length]
                    return (
                      <Link
                        key={service.id}
                        to={`/services/${service.slug}`}
                        className="group relative bg-white rounded-2xl border border-gray-100 p-7 flex flex-col
                          hover:border-transparent hover:shadow-[0_12px_40px_rgba(26,62,140,0.12)]
                          hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                      >
                        {/* Glow on hover */}
                        <div
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl ${c.glow}`}
                        />

                        {/* Number */}
                        <div className="relative flex items-center justify-between mb-5">
                          <span className="text-[11px] font-bold text-text-muted/40 font-mono tracking-widest">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>

                        {/* Icon */}
                        <div
                          className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="w-7 h-7 text-white" strokeWidth={1.6} />
                        </div>

                        {/* Title */}
                        <h2 className="relative font-heading text-lg font-bold text-brand-blue mb-2">
                          {service.title}
                        </h2>

                        {/* Description */}
                        <p className="relative text-sm text-text-muted leading-relaxed flex-1 mb-6">
                          {service.shortDescription}
                        </p>

                        {/* CTA */}
                        <div className="relative flex items-center gap-1.5 text-sm font-semibold text-brand-red group-hover:gap-3 transition-all duration-200">
                          Explore Service
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </Link>
                    )
                  })}
            </div>
          )}
        </Container>
      </section>

      {/* ── Process teaser ── */}
      <section className="py-10 sm:py-12 lg:py-16 bg-white border-t border-gray-100">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-lg">
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-red">
                How It Works
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-brand-blue mt-2 mb-3">
                From Idea to Launch — In 4 Simple Steps
              </h2>
              <p className="text-text-muted text-sm leading-relaxed">
                Our proven process ensures every project is delivered on time, within budget, and
                built to scale.
              </p>
            </div>
            <div className="flex gap-4 flex-wrap md:flex-nowrap shrink-0">
              {['Discovery', 'Planning', 'Execution', 'Delivery'].map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-brand-blue/20 bg-brand-blue/5
                    flex items-center justify-center font-heading font-bold text-brand-blue text-lg
                    hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all duration-300 cursor-default"
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs font-medium text-text-muted whitespace-nowrap">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative py-14 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-[#1e3a7a] to-[#0a1f5c]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/15 rounded-full blur-3xl" />

        <Container className="relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white/70 text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Free Consultation Available
            </span>
            <h2
              className="font-heading text-3xl sm:text-4xl font-bold mb-4 leading-tight"
              style={{ color: '#ffffff' }}
            >
              Not Sure Which Service to Choose?
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-orange-400">
                We'll Guide You.
              </span>
            </h2>
            <p className="text-white/60 text-base sm:text-lg mb-10 max-w-xl mx-auto">
              Tell us about your business — our experts will suggest the perfect service package.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" as={Link} to="/contact">
                Book a Free Call
              </Button>
              <Button
                variant="ghost"
                size="lg"
                as={Link}
                to="/portfolio"
                className="!text-white !border-white/25 hover:!bg-white/10"
              >
                See Our Portfolio →
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/70 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> No upfront payment
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Reply within 24 hours
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> 50+ happy clients
              </span>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

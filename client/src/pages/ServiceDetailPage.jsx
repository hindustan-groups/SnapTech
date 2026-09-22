/**
 * /services/:slug — Premium individual service detail page
 */
import { createElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Shield,
  Zap,
  Users,
  Star,
  Code2,
  Megaphone,
  Lightbulb,
  Monitor,
  Settings,
  Layers,
  Smartphone,
  MessageSquare,
} from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
import { serviceSchema, breadcrumbSchema, SITE } from '@/components/ui/SEO'
import { useService, useServices } from '@/hooks/useServices'
import { getServiceIcon } from '@/utils/serviceIcons'
import { useSiteSettings } from '@/hooks/useContent'

/* ── Service config (icons, colors, process, features) ─────────── */
const SERVICE_CONFIG = {
  'web-development': {
    icon: Code2,
    color: 'from-blue-500 to-cyan-400',
    bgGlow: 'from-blue-500/20 to-cyan-400/5',
    tag: 'Most Popular',
    deliveryTime: '2–4 Weeks',
    techStack: ['React.js', 'Next.js', 'Node.js', 'WordPress', 'MongoDB', 'Tailwind CSS'],
    keyFeatures: [
      'Fully responsive on all devices',
      'SEO-optimised from day one',
      'Fast loading — under 3 seconds',
      'Integrated with Google Analytics',
      'Clean, maintainable codebase',
      'Free 30-day post-launch support',
    ],
    process: [
      {
        step: '01',
        title: 'Discovery Call',
        desc: 'We understand your goals, target audience, and requirements.',
      },
      {
        step: '02',
        title: 'Design Mockup',
        desc: 'We create a visual prototype for your review and approval.',
      },
      {
        step: '03',
        title: 'Development',
        desc: 'Our team builds the site with clean, scalable code.',
      },
      {
        step: '04',
        title: 'Launch & Support',
        desc: 'We deploy, test, and support you post-launch.',
      },
    ],
  },
  'digital-marketing-seo': {
    icon: Megaphone,
    color: 'from-orange-500 to-rose-400',
    bgGlow: 'from-orange-500/20 to-rose-400/5',
    tag: 'High ROI',
    deliveryTime: 'Ongoing Monthly',
    techStack: [
      'Google Ads',
      'Meta Ads',
      'SEMrush',
      'Google Analytics',
      'Search Console',
      'Mailchimp',
    ],
    keyFeatures: [
      'Full SEO audit and on-page fixes',
      'Google & Meta paid ad campaigns',
      'Monthly analytics reports',
      'Content marketing strategy',
      'Keyword research & tracking',
      'Conversion rate optimisation',
    ],
    process: [
      {
        step: '01',
        title: 'Audit & Research',
        desc: 'Deep audit of your current digital presence and competitors.',
      },
      {
        step: '02',
        title: 'Strategy',
        desc: 'We build a tailored marketing plan with clear KPIs.',
      },
      {
        step: '03',
        title: 'Campaign Launch',
        desc: 'Ads and SEO go live with continuous monitoring.',
      },
      {
        step: '04',
        title: 'Report & Optimise',
        desc: 'Monthly reports and ongoing campaign improvements.',
      },
    ],
  },
  'it-consulting-strategy': {
    icon: Lightbulb,
    color: 'from-violet-500 to-purple-400',
    bgGlow: 'from-violet-500/20 to-purple-400/5',
    tag: 'Expert Advice',
    deliveryTime: '1–2 Weeks',
    techStack: ['AWS', 'Azure', 'Jira', 'Confluence', 'Figma', 'Notion'],
    keyFeatures: [
      'Current system assessment',
      'Technology roadmap design',
      'Vendor & tool selection',
      'Cost optimisation planning',
      'Cloud architecture review',
      'Digital transformation strategy',
    ],
    process: [
      {
        step: '01',
        title: 'Assessment',
        desc: 'We evaluate your current workflows and pain points.',
      },
      {
        step: '02',
        title: 'Roadmap',
        desc: 'A detailed IT strategy aligned with your business goals.',
      },
      {
        step: '03',
        title: 'Implementation',
        desc: 'We guide your team through the transition plan.',
      },
      { step: '04', title: 'Review', desc: 'Ongoing advisory support for continuous improvement.' },
    ],
  },
  'ecommerce-solutions': {
    icon: Monitor,
    color: 'from-emerald-500 to-teal-400',
    bgGlow: 'from-emerald-500/20 to-teal-400/5',
    tag: 'Sell More',
    deliveryTime: '3–6 Weeks',
    techStack: ['Shopify', 'WooCommerce', 'Razorpay', 'Stripe', 'React', 'Inventory APIs'],
    keyFeatures: [
      'Custom storefront design',
      'Secure payment integration',
      'Mobile-first checkout flow',
      'Inventory management system',
      'Order tracking & notifications',
      'SEO & performance optimised',
    ],
    process: [
      {
        step: '01',
        title: 'Store Planning',
        desc: 'Product structure, categories, and platform selection.',
      },
      {
        step: '02',
        title: 'Design & Build',
        desc: 'Custom design with frictionless checkout experience.',
      },
      { step: '03', title: 'Payment Setup', desc: 'Secure payment gateway and tax configuration.' },
      { step: '04', title: 'Launch & Grow', desc: 'Live store with training and growth support.' },
    ],
  },
  'cloud-solutions-devops': {
    icon: Settings,
    color: 'from-sky-500 to-indigo-400',
    bgGlow: 'from-sky-500/20 to-indigo-400/5',
    tag: 'Scalable',
    deliveryTime: '1–3 Weeks',
    techStack: ['AWS', 'Google Cloud', 'Docker', 'Kubernetes', 'GitHub Actions', 'Nginx'],
    keyFeatures: [
      'Cloud server setup & migration',
      'Automated CI/CD pipelines',
      'Docker containerisation',
      '99.9% uptime guarantee',
      'Security audits & monitoring',
      'Auto-scaling & load balancing',
    ],
    process: [
      { step: '01', title: 'Audit', desc: 'Review current infrastructure and identify gaps.' },
      { step: '02', title: 'Architecture', desc: 'Design a scalable and secure cloud blueprint.' },
      { step: '03', title: 'Migration', desc: 'Move and configure services with zero downtime.' },
      { step: '04', title: 'Monitor', desc: 'Continuous monitoring, alerts, and optimisations.' },
    ],
  },
  'branding-ui-ux-design': {
    icon: Layers,
    color: 'from-pink-500 to-rose-400',
    bgGlow: 'from-pink-500/20 to-rose-400/5',
    tag: 'Stand Out',
    deliveryTime: '2–3 Weeks',
    techStack: ['Figma', 'Adobe Illustrator', 'Adobe XD', 'Framer', 'Prototyping', 'Style Guides'],
    keyFeatures: [
      'Professional logo design',
      'Full brand identity system',
      'UI design with Figma prototypes',
      'Color palette & typography guide',
      'Brand asset & icon library',
      'UX research & user flows',
    ],
    process: [
      {
        step: '01',
        title: 'Discovery',
        desc: 'Understanding your brand vision, values, and audience.',
      },
      { step: '02', title: 'Concepts', desc: 'Multiple design directions for your review.' },
      { step: '03', title: 'Refinement', desc: 'Finalise chosen concept with your feedback.' },
      { step: '04', title: 'Delivery', desc: 'Complete brand package in all required formats.' },
    ],
  },
  'mobile-app-development': {
    icon: Smartphone,
    color: 'from-amber-500 to-yellow-400',
    bgGlow: 'from-amber-500/20 to-yellow-400/5',
    tag: 'iOS & Android',
    deliveryTime: '6–12 Weeks',
    techStack: ['React Native', 'Flutter', 'Firebase', 'REST APIs', 'App Store', 'Play Store'],
    keyFeatures: [
      'Cross-platform iOS & Android',
      'Native-like performance',
      'Push notifications & deep links',
      'Offline mode support',
      'App Store submission handled',
      'Ongoing maintenance & updates',
    ],
    process: [
      { step: '01', title: 'Wireframes', desc: 'Clickable prototypes for all key screens.' },
      { step: '02', title: 'UI Design', desc: 'Pixel-perfect screens matching your brand.' },
      {
        step: '03',
        title: 'Development',
        desc: 'React Native / Flutter codebase, API integrations.',
      },
      {
        step: '04',
        title: 'Publish',
        desc: 'Submit to App Store & Play Store, post-launch support.',
      },
    ],
  },
}

const PLACEHOLDER_SERVICES = [
  { id: '1', title: 'Web Development', slug: 'web-development' },
  { id: '2', title: 'Digital Marketing & SEO', slug: 'digital-marketing-seo' },
  { id: '3', title: 'IT Consulting & Strategy', slug: 'it-consulting-strategy' },
  { id: '4', title: 'E-Commerce Solutions', slug: 'ecommerce-solutions' },
  { id: '5', title: 'Cloud Solutions & DevOps', slug: 'cloud-solutions-devops' },
  { id: '6', title: 'Branding & UI/UX Design', slug: 'branding-ui-ux-design' },
  { id: '7', title: 'Mobile App Development', slug: 'mobile-app-development' },
]

const PLACEHOLDER_SERVICE_DETAILS = {
  'web-development': {
    id: '1',
    title: 'Web Development',
    slug: 'web-development',
    icon: 'Code2',
    shortDescription:
      'Custom, responsive websites built with modern technologies like React, Node.js, and WordPress. Optimised for speed, SEO, and conversions.',
    fullDescription:
      'We design and build bespoke web solutions that scale. Whether you need a simple corporate landing page, a content management system, or a bespoke web application, our developers write clean, robust code that delivers high performance. Every website we build is fully responsive, optimized for search engines (SEO), and integrated with core analytics tools so you can track your business growth in real time.',
  },
  'digital-marketing-seo': {
    id: '2',
    title: 'Digital Marketing & SEO',
    slug: 'digital-marketing-seo',
    icon: 'Megaphone',
    shortDescription:
      'Result-driven digital marketing campaigns spanning SEO, Google Ads, Meta Ads, and content marketing to drive high-intent leads.',
    fullDescription:
      'Get your business in front of the right audience. Our digital marketing strategies are built on data and focused on ROI. We run complete search engine optimization (SEO) campaigns to rank your business organically, paired with high-performance paid ads on Google, Facebook, and Instagram to drive immediate leads. We optimize your campaigns continuously to lower acquisition costs and maximize conversions.',
  },
  'it-consulting-strategy': {
    id: '3',
    title: 'IT Consulting & Strategy',
    slug: 'it-consulting-strategy',
    icon: 'Lightbulb',
    shortDescription:
      'Strategic IT advisory to align your technology roadmap with business growth. We help you choose the right systems and architecture.',
    fullDescription:
      'Make informed technology decisions. Our expert consultants analyze your current business workflows, systems, and requirements to design a scalable IT strategy. We assist in vendor selection, cloud architecture design, system integration plans, and technology cost optimization. Partner with us to modernize your digital tools and stay ahead of the competition.',
  },
  'ecommerce-solutions': {
    id: '4',
    title: 'E-Commerce Solutions',
    slug: 'ecommerce-solutions',
    icon: 'Monitor',
    shortDescription:
      'End-to-end e-commerce store setup, checkout optimisation, inventory management systems, and secure payment gateway integrations.',
    fullDescription:
      'Turn website visitors into paying customers. We build feature-rich e-commerce stores with smooth checkout experiences, secure payment gateways, and automated inventory sync. From Shopify custom developments to WooCommerce and custom React storefronts, we ensure your online store is fast, secure, and optimized for maximum conversions on all mobile devices.',
  },
  'cloud-solutions-devops': {
    id: '5',
    title: 'Cloud Solutions & DevOps',
    slug: 'cloud-solutions-devops',
    icon: 'Settings',
    shortDescription:
      'Secure cloud hosting setup, AWS/Google Cloud management, server scaling, and continuous deployment workflows for zero downtime.',
    fullDescription:
      'Build a stable, secure, and scalable cloud infrastructure. We manage cloud deployments on Amazon Web Services (AWS), Google Cloud Platform (GCP), and DigitalOcean. Our DevOps workflows include automated CI/CD pipelines, containerized deployments with Docker, regular security audits, and server monitoring to ensure 99.9% uptime for your digital platforms.',
  },
  'branding-ui-ux-design': {
    id: '6',
    title: 'Branding & UI/UX Design',
    slug: 'branding-ui-ux-design',
    icon: 'Layers',
    shortDescription:
      'Premium user interface and user experience designs coupled with complete corporate brand identity systems, logos, and guidelines.',
    fullDescription:
      'Create a lasting impression. Our design team focuses on crafting modern, intuitive user interfaces (UI) and frictionless user experiences (UX) that make your product a joy to use. We combine this with holistic brand identity design, including logos, modern color palettes, font pairings, and brand asset guidelines to ensure your company feels premium and cohesive.',
  },
  'mobile-app-development': {
    id: '7',
    title: 'Mobile App Development',
    slug: 'mobile-app-development',
    icon: 'Smartphone',
    shortDescription:
      'Native and cross-platform mobile apps for iOS and Android built with React Native and Flutter. Secure, high-performing, and published on App Stores.',
    fullDescription:
      'Expand your reach to mobile users worldwide. We design and build secure, fast, and feature-rich mobile applications for iOS and Android platforms. Using modern cross-platform frameworks like React Native and Flutter, we deliver native-like performance and animations with a single, cost-effective codebase. From offline support and push notifications to real-time chats and device integrations, we build apps that keep your users engaged.',
  },
}

function DetailSkeleton() {
  return (
    <div className="bg-[#020714] min-h-screen pt-32 pb-20 text-slate-100">
      <Container>
        <div className="h-6 w-32 bg-white/10 rounded-full mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-14 w-14 rounded-2xl bg-white/10 animate-pulse" />
            <div className="h-12 w-3/4 bg-white/10 rounded-xl animate-pulse" />
            <div className="h-5 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-5 w-5/6 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-80 rounded-2xl bg-slate-900/60 border border-white/10 animate-pulse" />
        </div>
      </Container>
    </div>
  )
}

export default function ServiceDetailPage() {
  const { slug } = useParams()
  const { data, isLoading } = useService(slug)
  const { data: allData } = useServices()

  const { data: settingsData } = useSiteSettings()
  const waNum = (
    settingsData?.data?.whatsapp ||
    settingsData?.data?.phone ||
    '919999999999'
  ).replace(/[^0-9]/g, '')

  const service = data?.data || PLACEHOLDER_SERVICE_DETAILS[slug]
  const allServices = allData?.data?.length ? allData.data : PLACEHOLDER_SERVICES

  // Use DB fields if available, fall back to SERVICE_CONFIG for icon/color only
  const config = SERVICE_CONFIG[slug] || SERVICE_CONFIG['web-development']

  // Rich detail — prefer DB, fallback to SERVICE_CONFIG
  const keyFeatures = service?.keyFeatures?.length ? service.keyFeatures : config.keyFeatures
  const techStack = service?.techStack?.length ? service.techStack : config.techStack
  const process = service?.process?.length ? service.process : config.process
  const tag = service?.tag || config.tag
  const deliveryTime = service?.deliveryTime || config.deliveryTime

  const related = allServices.filter((s) => s.slug !== slug).slice(0, 3)

  if (isLoading && !service) return <DetailSkeleton />

  if (!service) {
    return (
      <div className="bg-[#020714] min-h-screen py-36 text-center text-white">
        <Container>
          <div className="max-w-md mx-auto p-8 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <p className="text-slate-300 text-lg mb-6">Service capability not found.</p>
            <Button as={Link} to="/services" variant="primary">
              ← Return to Services Directory
            </Button>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="bg-[#020714] min-h-screen text-slate-100 selection:bg-brand-cyan/20 selection:text-brand-cyan">
      <SEO
        title={`${service.title} — Snaptech IT Solutions | Hindustan Projects`}
        description={service.shortDescription}
        path={`/services/${service.slug}`}
        keywords={`${service.title}, Snaptech IT, ${service.title} enterprise, Hindustan Projects IT`}
        schemas={[
          serviceSchema({
            title: service.title,
            description: service.shortDescription,
            url: `${SITE.url}/services/${service.slug}`,
            serviceType: service.title,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
        ]}
      />

      {/* ── 1. Cyber Hero Header ────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 overflow-hidden border-b border-white/10 bg-[#020714]">
        {/* Subtle grid pattern & glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <div
          className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${config.bgGlow} opacity-70 pointer-events-none`}
        />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-cyan/15 rounded-full blur-[100px] pointer-events-none" />

        <Container className="relative">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-8 font-mono"
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-brand-cyan transition-colors">
              Home
            </Link>
            <span className="text-white/20">/</span>
            <Link to="/services" className="hover:text-brand-cyan transition-colors">
              Services
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-brand-cyan font-semibold">{service.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            {/* Left: title + description */}
            <div className="flex-1 max-w-3xl">
              {/* Tag badge */}
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                {tag}
              </span>

              {/* Icon + title row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] shrink-0`}
                >
                  {createElement(getServiceIcon(service?.icon || 'Globe'), {
                    className: 'w-8 h-8 text-white',
                    strokeWidth: 1.8,
                  })}
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                  {service.title}
                </h1>
              </div>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-8 font-light">
                {service.shortDescription}
              </p>

              {/* Quick Telemetry & SLA Pills */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <Clock className="w-4 h-4 text-brand-cyan" />
                  <span className="text-xs sm:text-sm text-slate-300">
                    Sprint Cycle: <strong className="text-white font-mono">{deliveryTime}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs sm:text-sm text-slate-300">
                    <strong className="text-white">Enterprise</strong> SLA Covered
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-xs sm:text-sm text-slate-300">
                    <strong className="text-white">Hindustan Projects</strong> Backed
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Banner Card */}
            <div className="lg:w-84 shrink-0">
              <div className="relative rounded-2xl border border-brand-cyan/30 bg-slate-900/80 backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <span className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">
                    Engage Architecture
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white mb-2">
                  Launch {service.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
                  Book a free technical scoping call with our lead architects. Immediate NDA protection available.
                </p>
                <Button
                  variant="primary"
                  fullWidth
                  as={Link}
                  to="/contact"
                  className="mb-3 bg-gradient-to-r from-brand-primary to-brand-cyan hover:from-brand-primary-dark hover:to-brand-cyan-dark text-white font-bold shadow-[0_0_20px_rgba(30,107,238,0.4)] border border-brand-cyan/40"
                >
                  Request Technical Proposal
                </Button>
                <a
                  href={`https://wa.me/${waNum}?text=${encodeURIComponent(
                    settingsData?.data?.whatsappMessage
                      ? settingsData.data.whatsappMessage.replace('{service}', service.title)
                      : `Hi! I visited your website and want to discuss ${service.title} service.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/15
                    text-slate-300 text-sm font-medium hover:bg-white/5 hover:text-white transition-all duration-200"
                >
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                  Direct WhatsApp Hotline
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 2. Main Content Breakdown ──────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#020714] relative">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* ── Left Column (col-span-8) ── */}
            <div className="lg:col-span-8 space-y-16">
              {/* Overview */}
              <div className="p-8 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
                  // CAPABILITY OVERVIEW
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-4">
                  Engineering Scope: {service.title}
                </h2>
                <p className="text-slate-300 leading-relaxed text-base sm:text-lg font-light">
                  {service.fullDescription || service.shortDescription}
                </p>
              </div>

              {/* Key Features & Deliverables */}
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
                  // TECHNICAL DELIVERABLES
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-6">
                  What You Receive In Production
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {keyFeatures.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3.5 p-4 sm:p-5 rounded-xl border border-white/10 bg-slate-900/70
                        hover:border-brand-cyan/40 hover:bg-slate-900/90 transition-all duration-200"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-200 font-medium leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Steps */}
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
                  // EXECUTION ROADMAP
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-8">
                  Deployment Lifecycle
                </h2>
                <div className="space-y-6">
                  {process.map((step, i) => (
                    <div
                      key={i}
                      className="flex gap-6 p-6 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl group hover:border-brand-cyan/40 transition-all"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-heading font-extrabold text-base shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.3)]`}
                        >
                          {step.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-bold text-white mb-1.5 group-hover:text-brand-cyan transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-300/80 leading-relaxed font-light">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-3 block">
                  // TECHNOLOGIES & TOOLS
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-5">
                  Verified Tech Stack
                </h2>
                <div className="flex flex-wrap gap-3">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 text-sm font-mono
                        text-brand-cyan hover:border-brand-cyan/60 hover:bg-brand-cyan/15 transition-all duration-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Back link */}
              <div className="pt-6 border-t border-white/10">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan
                    hover:text-white transition-colors duration-150 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform duration-200" />
                  Return To All Solutions Directory
                </Link>
              </div>
            </div>

            {/* ── Right Sidebar (col-span-4) ── */}
            <div className="lg:col-span-4 space-y-6">
              {/* Initiation Card */}
              <div className="relative rounded-2xl overflow-hidden border border-brand-cyan/40 bg-gradient-to-b from-slate-900 to-[#020714] p-6 sm:p-7 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/15 rounded-full blur-2xl" />
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center mb-5 shadow-lg`}
                  >
                    {createElement(getServiceIcon(service?.icon || 'Globe'), {
                      className: 'w-6 h-6 text-white',
                      strokeWidth: 1.8,
                    })}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-2">
                    Commission {service.title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed font-light">
                    Commission our dedicated squad for your next milestone. We adhere strictly to verified deadlines and ISO security standards.
                  </p>
                  <Button
                    variant="primary"
                    fullWidth
                    as={Link}
                    to="/contact"
                    className="mb-3 bg-gradient-to-r from-brand-primary to-brand-cyan text-white font-bold"
                  >
                    Get Accurate Quotation
                  </Button>
                  <a
                    href={`https://wa.me/${waNum}?text=${encodeURIComponent(
                      settingsData?.data?.whatsappMessage
                        ? settingsData.data.whatsappMessage.replace('{service}', service.title)
                        : `Hi! I visited your website and want to discuss ${service.title} service.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                      border border-white/15 text-slate-300 text-sm font-medium
                      hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    WhatsApp Architecture Lead
                  </a>
                </div>
              </div>

              {/* Direct Support & Contact Card */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 space-y-4 backdrop-blur-xl">
                <p className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">
                  Direct Engineering Desk
                </p>
                <a
                  href={`tel:${(settingsData?.data?.phone || '+919999999999').replace(/\s+/g, '')}`}
                  className="flex items-center gap-3.5 group p-2.5 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-brand-cyan" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-mono">Immediate Telephone</p>
                    <p className="text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors">
                      {settingsData?.data?.phone || '+91 99999 99999'}
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${settingsData?.data?.email || 'info@hindustanprojects.com'}`}
                  className="flex items-center gap-3.5 group p-2.5 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-brand-cyan" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-mono">Official Inquiries</p>
                    <p className="text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors truncate">
                      {settingsData?.data?.email || 'info@hindustanprojects.com'}
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-2 pt-2 text-xs text-slate-400 border-t border-white/10 font-mono">
                  <Zap className="w-3.5 h-3.5 text-brand-cyan" />
                  24-Hour Guaranteed Proposal SLA
                </div>
              </div>

              {/* Group SLA Guarantees */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <p className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider mb-4">
                  Group SLA Assurances
                </p>
                <ul className="space-y-3.5">
                  {[
                    { icon: Zap, text: 'Strict Sprint Milestones With Zero Slippage' },
                    { icon: Shield, text: 'Hindustan Projects Enterprise Backing' },
                    { icon: Users, text: 'Dedicated Lead Engineer & Scrum Master' },
                    { icon: Star, text: '30-Day Post-Launch Warranty Included' },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                      <item.icon className="w-4 h-4 text-brand-cyan shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 3. Related Services (Explore More) ─────────────────────── */}
      {related.length > 0 && (
        <section className="py-16 sm:py-20 bg-[#03091e] border-t border-white/10">
          <Container>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan mb-2 block">
                  // ECOSYSTEM EXPANSION
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                  Complementary Engineering Modules
                </h2>
              </div>
              <Link
                to="/services"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-cyan hover:text-white transition-colors"
              >
                View Full Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((s) => {
                const RelIcon = getServiceIcon(s.icon)
                const rc = SERVICE_CONFIG[s.slug] || SERVICE_CONFIG['web-development']
                return (
                  <Link
                    key={s.id}
                    to={`/services/${s.slug}`}
                    className="group bg-slate-900/70 rounded-2xl border border-white/10 p-6 flex flex-col
                      hover:border-brand-cyan/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]
                      hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${rc.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}
                    >
                      <RelIcon className="w-5 h-5 text-white" strokeWidth={1.8} />
                    </div>
                    <h3 className="font-heading text-base font-bold text-white group-hover:text-brand-cyan transition-colors mb-2">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-300/80 leading-relaxed flex-1 mb-5 line-clamp-2">
                      {s.shortDescription || ''}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-cyan group-hover:gap-2 transition-all duration-200">
                      View Module Specs <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </Container>
        </section>
      )}
    </div>
  )
}


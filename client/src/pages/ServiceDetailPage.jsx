/**
 * /services/:slug — 100% Dynamic, Premium Enterprise Service Detail Page.
 * Styled in Snaptech's clean, high-impact light theme matching the Home Page.
 * Powered directly by the PostgreSQL database with zero static text locks.
 */
import { useState, useMemo, createElement } from 'react'
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
  BadgeCheck,
  MessageSquare,
} from 'lucide-react'
import { Container, SEO } from '@/components/ui'
import { serviceSchema, breadcrumbSchema, SITE } from '@/components/ui/SEO'
import { useService, useServices } from '@/hooks/useServices'
import { useProjects } from '@/hooks/useProjects'
import { getServiceIcon } from '@/utils/serviceIcons'
import { useSiteSettings } from '@/hooks/useContent'
import { api } from '@/utils/api'
import { getRecaptchaToken } from '@/utils/recaptcha'
import { trackEvent } from '@/utils/analytics'
import { ProjectModal } from '@/components/sections/PortfolioSection'

/* ── Fallback Imagery for Projects ────────────────────────────── */
const PROJECT_DEFAULT_IMAGES = {
  'logistics-mobile-app': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80&auto=format&fit=crop',
  'corporate-brand-identity': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80&auto=format&fit=crop',
  'digital-marketing-campaign': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop',
  'ecommerce-platform': 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80&auto=format&fit=crop',
  'textile-erp-system': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80&auto=format&fit=crop',
  'restaurant-website-seo': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop',
  'real-estate-social-media': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format&fit=crop',
}

/* ── Service Color Accents (Light-theme friendly) ─────────────── */
const SERVICE_THEMES = {
  'web-development': { color: 'from-blue-600 to-cyan-500', glow: 'bg-blue-50', border: 'border-blue-200' },
  'digital-marketing-seo': { color: 'from-amber-500 to-orange-500', glow: 'bg-amber-50', border: 'border-amber-200' },
  'it-consulting-strategy': { color: 'from-purple-600 to-indigo-500', glow: 'bg-purple-50', border: 'border-purple-200' },
  'ecommerce-solutions': { color: 'from-emerald-600 to-teal-500', glow: 'bg-emerald-50', border: 'border-emerald-200' },
  'cloud-solutions-devops': { color: 'from-sky-600 to-blue-500', glow: 'bg-sky-50', border: 'border-sky-200' },
  'branding-ui-ux-design': { color: 'from-pink-500 to-rose-500', glow: 'bg-pink-50', border: 'border-pink-200' },
  'mobile-app-development': { color: 'from-cyan-600 to-blue-600', glow: 'bg-cyan-50', border: 'border-cyan-200' },
}

function getServiceTheme(slug) {
  return (
    SERVICE_THEMES[slug] || {
      color: 'from-blue-600 to-cyan-500',
      glow: 'bg-blue-50',
      border: 'border-blue-200',
    }
  )
}

/* ── Service-Specific Verified Fallbacks ──────────────────────── */
const SERVICE_FALLBACKS = {
  'web-development': {
    title: 'Custom Web Development',
    icon: 'Globe',
    tag: 'Web Architecture',
    deliveryTime: '2–4 Weeks',
    shortDescription:
      'Custom, high-speed websites, web applications, and customer portals engineered for fast loading speeds, search visibility, and conversion-focused performance.',
    fullDescription:
      'SnapTech Digital engineers custom web applications and business websites tailored to your specific commercial requirements. We build clean, modular architectures using modern frameworks like React and Next.js backed by Node.js and PostgreSQL. From corporate marketing sites to internal business portals and secure client dashboards, every project includes mobile responsiveness, on-page SEO foundations, and complete source code ownership upon delivery.',
    techStack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
    keyFeatures: [
      'Fully responsive layout optimized across mobile, tablet, and desktop',
      'Fast performance tuning aligned with Google Core Web Vitals',
      'Custom contact, quote, and lead capture forms with spam filtering',
      'On-page SEO setup including meta tags, schema markup, and sitemaps',
      'Secure administrative portal or headless CMS for easy content updates',
      '100% full source code ownership with 30-day post-launch support',
    ],
    process: [
      { step: '01', title: 'Requirements & Scoping', desc: 'Understanding your business objectives, target audience, and functional specifications.' },
      { step: '02', title: 'Wireframes & Architecture', desc: 'Designing responsive layout mockups and structuring the database and API schema.' },
      { step: '03', title: 'Development & Testing', desc: 'Writing clean, modular code with cross-browser compatibility and device testing.' },
      { step: '04', title: 'Launch & Handover', desc: 'Production deployment, domain and SSL setup, analytics integration, and full code handover.' },
    ],
  },
  'mobile-app-development': {
    title: 'Mobile App Development',
    icon: 'Smartphone',
    tag: 'iOS & Android',
    deliveryTime: '6–10 Weeks',
    shortDescription:
      'Cross-platform iOS and Android mobile applications built with React Native and Flutter for seamless mobile performance, offline caching, and app store deployment.',
    fullDescription:
      'We design and build secure, intuitive mobile applications that run smoothly on both Apple iOS and Google Android from a unified codebase. Utilizing modern frameworks like React Native and Flutter, we eliminate the cost and overhead of maintaining separate codebases while delivering native-feel touch responsiveness. Our mobile engineering covers authentication, REST/GraphQL API integrations, push notifications, offline data synchronization, and end-to-end publishing on the Apple App Store and Google Play Store.',
    techStack: ['React Native', 'Flutter', 'Firebase', 'REST APIs', 'App Store Connect', 'Google Play Console'],
    keyFeatures: [
      'Single cross-platform codebase for iOS and Android deployment',
      'Intuitive, responsive touch interfaces and fluid screen transitions',
      'Offline data caching and background synchronization',
      'Targeted push notifications for user alerts and re-engagement',
      'Secure user authentication and third-party API integrations',
      'Assisted App Store and Google Play Store submission and review compliance',
    ],
    process: [
      { step: '01', title: 'App Scoping & User Flow', desc: 'Defining user journeys, screen hierarchy, and mobile functional requirements.' },
      { step: '02', title: 'UI/UX Mobile Design', desc: 'Crafting pixel-perfect mobile screen mockups following iOS and Android guidelines.' },
      { step: '03', title: 'Cross-Platform Build', desc: 'Engineering app frontend, integrating APIs, local storage, and push notifications.' },
      { step: '04', title: 'Store Submission & Launch', desc: 'Publishing app bundles, configuring store listings, and monitoring release health.' },
    ],
  },
  'ecommerce-solutions': {
    title: 'E-Commerce Solutions',
    icon: 'Monitor',
    tag: 'Online Storefronts',
    deliveryTime: '3–6 Weeks',
    shortDescription:
      'Turnkey digital storefronts, custom Shopify setups, and scalable online catalogs engineered for smooth checkout flows and automated order processing.',
    fullDescription:
      'SnapTech Digital builds conversion-focused e-commerce stores designed to turn casual visitors into paying customers. Whether you need a customized Shopify storefront or a tailored React web shop, we implement fast product search, category navigation, secure Indian and international payment gateways (Razorpay, Stripe), automated tax calculation, and order tracking. We focus on minimizing mobile cart abandonment and simplifying store management for your operations team.',
    techStack: ['Shopify', 'WooCommerce', 'React', 'Razorpay', 'Stripe', 'Node.js'],
    keyFeatures: [
      'Mobile-first digital storefront design optimized for quick product discovery',
      'Secure payment gateway integration with UPI, Credit/Debit cards, and NetBanking',
      'Real-time inventory and catalog management with category filtering',
      'Automated order confirmation and dispatch alerts via WhatsApp, SMS, or Email',
      'Optimized product schema markup for search engine and shopping visibility',
      'Store admin dashboard training and post-launch checkout flow verification',
    ],
    process: [
      { step: '01', title: 'Catalog & Store Planning', desc: 'Structuring product categories, variants, shipping zones, and tax rules.' },
      { step: '02', title: 'Storefront UI & Branding', desc: 'Designing custom homepage, collection, product, and mobile checkout pages.' },
      { step: '03', title: 'Payment & API Integration', desc: 'Configuring payment gateways, shipping calculators, and inventory sync.' },
      { step: '04', title: 'Testing & Launch', desc: 'Conducting live test transactions, load checks, and handing over store controls.' },
    ],
  },
  'digital-marketing-seo': {
    title: 'Digital Marketing & SEO',
    icon: 'Megaphone',
    tag: 'Lead Acquisition',
    deliveryTime: 'Monthly Campaigns',
    shortDescription:
      'Targeted search engine optimization (SEO), Google Ads, and Meta advertising campaigns structured to generate qualified commercial leads and measurable ROI.',
    fullDescription:
      'We help businesses build sustainable online visibility and acquire high-intent customers through data-backed marketing strategies. Our approach unites on-page technical SEO, Google Business Profile local ranking, and high-conversion paid search campaigns across Google Ads and Meta platforms. We emphasize transparent reporting, conversion tracking with Google Analytics 4, and ongoing landing page optimization so you always know where your marketing budget is going.',
    techStack: ['Google Ads', 'Meta Ads Manager', 'Google Analytics 4', 'SEMrush', 'Search Console', 'Tag Manager'],
    keyFeatures: [
      'Technical SEO audit with on-page metadata, site speed, and indexing fixes',
      'Local SEO and Google Business Profile optimization for regional search rankings',
      'Targeted Google Search (PPC) and Meta ad campaign setup and management',
      'Server-side conversion tracking and Google Analytics 4 event configuration',
      'Landing page conversion rate optimization (CRO) to maximize lead capture',
      'Transparent monthly performance reports detailing inquiries, clicks, and costs',
    ],
    process: [
      { step: '01', title: 'Audit & Competitor Analysis', desc: 'Auditing existing search presence, keyword gaps, and competitor advertising.' },
      { step: '02', title: 'Strategy & Tracking Setup', desc: 'Setting up GA4 conversion events, defining target audiences, and keyword tiers.' },
      { step: '03', title: 'Campaign Execution', desc: 'Deploying optimized search ads, publishing SEO updates, and refining ad copy.' },
      { step: '04', title: 'Ongoing Optimization', desc: 'Reviewing weekly lead quality, pruning negative keywords, and reporting monthly ROI.' },
    ],
  },
  'cloud-solutions-devops': {
    title: 'Cloud Solutions & DevOps',
    icon: 'Settings',
    tag: 'Cloud Infrastructure',
    deliveryTime: '1–3 Weeks',
    shortDescription:
      'Secure cloud hosting setup, containerized deployments, automated backups, and proactive monitoring on AWS, Google Cloud, and DigitalOcean.',
    fullDescription:
      'SnapTech Digital helps businesses transition to modern, dependable cloud infrastructure designed to scale with your traffic. We set up and manage virtual private servers, containerized workloads with Docker, and automated CI/CD deployment pipelines on leading cloud providers. Our engineers implement automated daily database backups, SSL/TLS certificate management, firewall rules, and real-time monitoring to keep your business services operational and secure.',
    techStack: ['AWS', 'Google Cloud', 'Docker', 'GitHub Actions', 'Nginx', 'PostgreSQL', 'Redis'],
    keyFeatures: [
      'Cloud infrastructure setup and migration on AWS, Google Cloud, or DigitalOcean',
      'Automated CI/CD build and deployment pipelines for rapid updates',
      'Automated daily encrypted database backups with disaster recovery procedures',
      'Server security hardening, firewall configuration, and SSL/TLS installation',
      'Continuous server health monitoring, resource alerts, and log aggregation',
      'Hosting cost review to eliminate idle instances and right-size cloud resources',
    ],
    process: [
      { step: '01', title: 'Infrastructure Assessment', desc: 'Reviewing current server capacity, database performance, and security settings.' },
      { step: '02', title: 'Cloud Architecture Design', desc: 'Selecting appropriate instance tiers, storage volumes, and network security rules.' },
      { step: '03', title: 'Migration & Pipeline Setup', desc: 'Configuring servers, containerizing code, and setting up automated CI/CD.' },
      { step: '04', title: 'Monitoring & Documentation', desc: 'Enabling automated alerts, testing backup restores, and delivering runbooks.' },
    ],
  },
  'branding-ui-ux-design': {
    title: 'Branding & UI/UX Design',
    icon: 'Layers',
    tag: 'Brand Identity',
    deliveryTime: '2–3 Weeks',
    shortDescription:
      'Intuitive user interface designs, interactive prototypes, and unified corporate visual identities that establish credibility and enhance customer engagement.',
    fullDescription:
      'A strong visual presence and intuitive digital product design build immediate trust with your audience. SnapTech Digital crafts cohesive brand identities—from distinctive vector logos and typography systems to complete digital design guidelines. For web and mobile applications, our UI/UX designers create comprehensive user journeys, wireframes, and interactive Figma prototypes that validate concepts and streamline front-end engineering before a single line of code is written.',
    techStack: ['Figma', 'Adobe Illustrator', 'Adobe Photoshop', 'Design Tokens', 'Prototyping'],
    keyFeatures: [
      'Distinctive vector logo design in full color, reverse, and monochrome formats',
      'Complete corporate visual identity guidelines (colors, typography, spacing)',
      'Interactive, clickable Figma UI/UX prototypes and wireframe user journeys',
      'Reusable UI component libraries and design tokens for web and mobile development',
      'Corporate digital stationery, presentation deck templates, and social media kits',
      'Complete commercial asset handover in Figma, SVG, EPS, PNG, and PDF formats',
    ],
    process: [
      { step: '01', title: 'Brand Discovery & Brief', desc: 'Exploring your market positioning, brand personality, and aesthetic preferences.' },
      { step: '02', title: 'Concept Exploration', desc: 'Developing creative directions for logos, typography, and primary UI layouts.' },
      { step: '03', title: 'Refinement & Prototyping', desc: 'Iterating on feedback to produce interactive Figma flows and asset variations.' },
      { step: '04', title: 'Design System Handover', desc: 'Organizing all export-ready vector files, style sheets, and developer specifications.' },
    ],
  },
  'it-consulting-strategy': {
    title: 'IT Consulting & Strategy',
    icon: 'Lightbulb',
    tag: 'Technical Advisory',
    deliveryTime: '1–2 Weeks',
    shortDescription:
      'Independent technical consulting to help business owners evaluate software options, audit existing IT systems, and plan realistic digital roadmaps.',
    fullDescription:
      'Navigating software choices and agency proposals can be overwhelming. SnapTech Digital provides practical, vendor-neutral IT consulting to help business leaders make confident technology investments. We evaluate existing systems, identify performance bottlenecks and security vulnerabilities, assess vendor estimates, and design practical implementation roadmaps aligned with your operating budget and growth targets.',
    techStack: ['Cloud Architecture', 'System Audits', 'Jira', 'Security Review', 'Database Design'],
    keyFeatures: [
      'Comprehensive review of current software systems, databases, and hosting',
      'Objective evaluation and cost comparison of third-party software proposals',
      'Step-by-step digital roadmap prioritized by business impact and budget',
      'System architecture recommendations for operational scale and data integrity',
      'Data backup, security posture, and compliance checklist evaluation',
      'Executive summary presentation and clear action plan for decision-makers',
    ],
    process: [
      { step: '01', title: 'Discovery & System Audit', desc: 'Interviewing stakeholders and reviewing existing software, tools, and pain points.' },
      { step: '02', title: 'Gap & Risk Analysis', desc: 'Identifying performance bottlenecks, security risks, and cost inefficiencies.' },
      { step: '03', title: 'Roadmap & Architecture', desc: 'Formulating realistic technical recommendations and evaluating vendor options.' },
      { step: '04', title: 'Executive Briefing', desc: 'Presenting findings, priority action items, and phased budget recommendations.' },
    ],
  },
}

const DEFAULT_ENGINEERING_PROCESS = [
  { step: '01', title: 'Discovery & Consultation', desc: 'Understanding your requirements, timelines, and technical scope.' },
  { step: '02', title: 'Architecture & Design', desc: 'Planning the system architecture, deliverables, and milestone roadmaps.' },
  { step: '03', title: 'Implementation & Testing', desc: 'Engineering modular solutions with thorough code and functional verification.' },
  { step: '04', title: 'Deployment & Support', desc: 'Production release, handover documentation, and post-launch technical support.' },
]

function DetailSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20 text-slate-900">
      <Container>
        <div className="h-6 w-32 bg-slate-200 rounded-full mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-14 w-14 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-12 w-3/4 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-5 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-5/6 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        </div>
      </Container>
    </div>
  )
}

export default function ServiceDetailPage() {
  const { slug } = useParams()
  const { data, isLoading, isError, error, refetch } = useService(slug)
  const { data: allServicesData } = useServices()
  const { data: projectsData } = useProjects()
  const { data: settingsData } = useSiteSettings()

  // Interactive modal state for projects
  const [selectedProject, setSelectedProject] = useState(null)

  // Direct consultation form state
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientMessage, setClientMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const fallback = SERVICE_FALLBACKS[slug]
  const rawService = data?.data
  const service = rawService || fallback
  const cfg = settingsData?.data || {}

  const phone = cfg.phone || '+91 8209604849'
  const contactEmail = cfg.email || 'info@snaptech.digital'
  const whatsappNum = (cfg.whatsapp || cfg.phone || '918209604849').replace(/[^0-9]/g, '')

  const theme = getServiceTheme(slug)

  // Service-specific data extraction with fallback resilience
  const keyFeatures = useMemo(() => {
    if (rawService?.keyFeatures && Array.isArray(rawService.keyFeatures) && rawService.keyFeatures.length > 0) {
      return rawService.keyFeatures
    }
    return fallback?.keyFeatures || [
      'Tailored Project Specification & Architecture',
      '100% IP & Full Source Code Ownership',
      'Production-Ready QA & Performance Testing',
      'Integrated Contact Forms & Telemetry',
      '30-Day Complimentary Post-Launch Support',
    ]
  }, [rawService, fallback])

  const techStack = useMemo(() => {
    if (rawService?.techStack && Array.isArray(rawService.techStack) && rawService.techStack.length > 0) {
      return rawService.techStack
    }
    return fallback?.techStack || ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS']
  }, [rawService, fallback])

  const process = useMemo(() => {
    if (rawService?.process && Array.isArray(rawService.process) && rawService.process.length > 0) {
      return rawService.process
    }
    return fallback?.process || DEFAULT_ENGINEERING_PROCESS
  }, [rawService, fallback])

  const tag = rawService?.tag || fallback?.tag || 'Enterprise Grade'
  const deliveryTime = rawService?.deliveryTime || fallback?.deliveryTime || '2–4 Weeks Sprint'
  const shortDescription = rawService?.shortDescription || fallback?.shortDescription || ''
  const fullDescription = rawService?.fullDescription || fallback?.fullDescription || shortDescription

  // Dynamic related projects matching service domain
  const relatedProjects = useMemo(() => {
    if (!projectsData?.data) return []
    const sSlug = (slug || '').toLowerCase()

    return projectsData.data
      .filter((p) => {
        const pCat = (p.category || '').toLowerCase()
        const pTech = (p.technologies || []).join(' ').toLowerCase()

        if (sSlug.includes('web') && (pCat.includes('web') || pCat.includes('commerce') || pTech.includes('react'))) return true
        if (sSlug.includes('app') && (pCat.includes('app') || pTech.includes('react native') || pTech.includes('flutter'))) return true
        if (sSlug.includes('marketing') && (pCat.includes('marketing') || pCat.includes('seo'))) return true
        if (sSlug.includes('branding') && (pCat.includes('brand') || pCat.includes('design'))) return true
        if (sSlug.includes('cloud') && (pTech.includes('docker') || pTech.includes('aws') || pTech.includes('cloud'))) return true
        return false
      })
      .slice(0, 2)
  }, [projectsData, slug])

  // Sibling services (other available capabilities)
  const relatedServices = useMemo(() => {
    const list = allServicesData?.data || []
    return list.filter((s) => s.slug !== slug).slice(0, 3)
  }, [allServicesData?.data, slug])

  const handleInquirySubmit = async (e) => {
    e.preventDefault()
    if (!clientName || !clientEmail || !clientPhone) return
    setSubmitting(true)
    setSubmitError(false)
    setErrorMessage('')
    try {
      const recaptchaToken = await getRecaptchaToken('service_inquiry')
      if (!recaptchaToken) {
        setSubmitError(true)
        setErrorMessage('Security verification could not be completed. Please refresh or try again.')
        setSubmitting(false)
        return
      }

      await api.post('/contact', {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        serviceInterested: service?.title || 'IT Solutions',
        message: `Direct Service Desk Inquiry for ${service?.title || slug}. Note: ${clientMessage || 'Please share detailed architecture & pricing breakdown.'}`,
        recaptchaToken,
        _hp: '',
      })
      trackEvent('generate_lead', {
        form: 'service_detail_consultation',
        service: service?.title || slug,
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(true)
      setErrorMessage(
        err.response?.data?.message || err.message || 'Submission failed. Please call us directly.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return <DetailSkeleton />

  if (!service) {
    if (isError && error?.status !== 404) {
      return (
        <>
          <SEO title="Service Temporarily Unavailable | SnapTech Digital" />
          <div className="bg-slate-50 min-h-screen py-36 text-center text-slate-900">
            <Container>
              <div className="max-w-md mx-auto p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">Service Temporarily Unavailable</h1>
                <p className="text-slate-600 text-sm mb-6">
                  Unable to load service details due to a connection or server error. Please retry or browse our directory.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => refetch?.()}
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#0D1B4B] hover:bg-[#1B6EF3] text-white font-bold text-sm transition-all cursor-pointer"
                  >
                    Retry Connection
                  </button>
                  <Link
                    to="/services"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
                  >
                    Services Directory
                  </Link>
                </div>
              </div>
            </Container>
          </div>
        </>
      )
    }

    return (
      <>
        <SEO title="Service Capability Not Found | SnapTech Digital" noIndex />
        <div className="bg-slate-50 min-h-screen py-36 text-center text-slate-900">
          <Container>
            <div className="max-w-md mx-auto p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">Service Capability Not Found</h1>
              <p className="text-slate-600 text-sm mb-6">
                Service capability not found in database or catalog. The requested capability does not exist or has been moved.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#0D1B4B] hover:bg-[#1B6EF3] text-white font-bold text-sm transition-all"
              >
                ← Return to Services Directory
              </Link>
            </div>
          </Container>
        </div>
      </>
    )
  }


  return (
    <div className="bg-slate-50/50 min-h-screen text-slate-900 selection:bg-blue-500/20 selection:text-[#1a3e8c]">
      <SEO
        title={`${service.title} — SnapTech Digital | Bhilwara, Rajasthan`}
        description={shortDescription}
        path={`/services/${service.slug}`}
        keywords={`${service.title}, SnapTech Digital, ${service.title} agency, IT company Bhilwara, Rajasthan`}
        schemas={[
          serviceSchema({
            title: service.title,
            description: shortDescription,
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

      {/* ── 1. Light Hero Header ────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 overflow-hidden border-b border-slate-100 bg-white">
        {/* Ambient subtle background grid & blur */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1a3e8c]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-400/5 rounded-full blur-[120px] pointer-events-none" />

        <Container className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 mb-8 font-mono" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-[#1a3e8c] transition-colors">
              Home
            </Link>
            <span className="text-slate-400" aria-hidden="true">/</span>
            <Link to="/services" className="hover:text-[#1a3e8c] transition-colors">
              Services
            </Link>
            <span className="text-slate-400" aria-hidden="true">/</span>
            <span className="text-[#1a3e8c] font-semibold">{service.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            {/* Left: Title + Description */}
            <div className="flex-1 max-w-3xl">
              {/* Tag Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 text-[#1a3e8c] text-xs font-mono font-bold uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-[#1a3e8c] animate-pulse" />
                {tag}
              </div>

              {/* Icon + Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-linear-to-br ${theme.color} flex items-center justify-center shadow-md shrink-0`}
                >
                  {createElement(getServiceIcon(service?.icon || 'Globe'), {
                    className: 'w-8 h-8 text-white',
                    strokeWidth: 1.8,
                  })}
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  {service.title}
                </h1>
              </div>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
                {shortDescription}
              </p>

              {/* Quick Telemetry & SLA Pills */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                  <Clock className="w-4 h-4 text-[#1a3e8c]" />
                  <span className="text-xs sm:text-sm text-slate-700">
                    Sprint Cycle: <strong className="text-slate-900 font-mono">{deliveryTime}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs sm:text-sm text-slate-700">
                    <strong className="text-emerald-800">100% IP &amp; Code</strong> Handover
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-xs sm:text-sm text-slate-700">
                    <strong className="text-amber-900">Priority Technical</strong> Support
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Banner Card */}
            <div className="lg:w-84 shrink-0">
              <div className="relative rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xl shadow-slate-200/60">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <span className="text-xs font-mono font-bold text-[#1a3e8c] uppercase tracking-wider">
                    Engage Architecture
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">
                  Launch {service.title}
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
                  Book a free technical scoping call with our senior architects. Immediate NDA protection available.
                </p>
                <a
                  href="#consultation-desk"
                  className="inline-flex items-center justify-center w-full py-3 rounded-xl mb-3 bg-[#0D1B4B] hover:bg-[#1B6EF3] text-white font-bold text-sm shadow-md shadow-blue-900/10 transition-all text-center"
                >
                  Request Technical Proposal
                </a>
                <a
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                    `Hello Snaptech, I am interested in consulting for ${service.title} architecture.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70 text-emerald-800 text-sm font-semibold hover:bg-emerald-100 transition-all duration-200"
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
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50/60 relative">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* ── Left Column (col-span-8) ── */}
            <div className="lg:col-span-8 space-y-16">
              {/* Detailed Overview */}
              <div className="p-8 rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#1a3e8c] mb-3 block">
                  // CAPABILITY SPECIFICATION
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  Engineering Scope: {service.title}
                </h2>
                <div className="text-slate-600 leading-relaxed text-base sm:text-lg space-y-4">
                  <p className="whitespace-pre-line">{fullDescription}</p>
                </div>
              </div>

              {/* Dynamic Technical Deliverables */}
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#1a3e8c] mb-3 block">
                  // VERIFIED DELIVERABLES
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
                  What You Receive In Production
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {keyFeatures.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3.5 p-4 sm:p-5 rounded-xl border border-slate-200/80 bg-white
                        hover:border-blue-300 hover:shadow-md transition-all duration-200 shadow-sm"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-800 font-medium leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Deployment Roadmap (Process) */}
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#1a3e8c] mb-3 block">
                  // EXECUTION LIFECYCLE
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">
                  Deployment Roadmap &amp; Milestones
                </h2>
                <div className="space-y-5">
                  {process.map((step, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row gap-5 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm group hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 sm:flex-col sm:items-center">
                        <div
                          className="w-12 h-12 rounded-xl bg-linear-to-br from-[#0D1B4B] to-[#1B6EF3] flex items-center justify-center text-white font-heading font-extrabold text-base shrink-0 shadow-md"
                        >
                          {step.step || String(i + 1).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-bold text-slate-900 mb-1.5 group-hover:text-[#1a3e8c] transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Tech Stack Matrix */}
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#1a3e8c] mb-3 block">
                  // MASTERED TECHNOLOGIES &amp; FRAMEWORKS
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-5 tracking-tight">
                  Verified Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-mono font-semibold
                        text-slate-800 hover:border-blue-400 hover:bg-blue-50/50 shadow-sm transition-all duration-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Live Flagship Projects */}
              {relatedProjects.length > 0 && (
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#1a3e8c] mb-3 block">
                    // PROVEN TRACK RECORD
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
                    Flagship Deployments in {service.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {relatedProjects.map((p) => {
                      const img =
                        p.thumbnailUrl?.trim() ||
                        PROJECT_DEFAULT_IMAGES[p.slug] ||
                        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80&auto=format&fit=crop'
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProject(p)}
                          className="group rounded-2xl border border-slate-200 bg-white overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:border-blue-400 transition-all"
                        >
                          <div className="h-44 overflow-hidden relative">
                            <img
                              src={img}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute bottom-3 left-3 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/90 text-slate-900 shadow-sm">
                              {p.clientName}
                            </span>
                          </div>
                          <div className="p-5">
                            <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-[#1a3e8c] transition-colors mb-1.5">
                              {p.title}
                            </h3>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                              {p.description}
                            </p>
                            <span className="text-xs font-bold text-[#1a3e8c] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                              Inspect Case Study <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Back Link */}
              <div className="pt-6 border-t border-slate-200">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#1a3e8c] hover:text-[#0D1B4B] transition-colors duration-150 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform duration-200" />
                  Return To All Solutions Directory
                </Link>
              </div>
            </div>

            {/* ── Right Sidebar (col-span-4) ── */}
            <div id="consultation-desk" className="lg:col-span-4 space-y-6">
              {/* Interactive Quotation Form */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xl shadow-slate-200/60">
                <div className="relative">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <span className="text-xs font-mono font-bold text-[#1a3e8c] uppercase tracking-wider">
                      Direct Solution Desk
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-1.5">
                    Commission {service.title}
                  </h3>
                  <p className="text-slate-600 text-xs mb-5">
                    Direct technical consultation with our lead architects. 2-hour response SLA.
                  </p>

                  {submitted ? (
                    <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2" role="status">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="font-bold text-slate-900 text-sm">Consultation Scheduled!</p>
                      <p className="text-xs text-slate-600">
                        Our technical architect will contact you within 2 hours at <span className="font-bold text-[#1a3e8c]">{clientPhone || clientEmail}</span>.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-3.5">
                      <div>
                        <label
                          htmlFor="service-inquiry-name"
                          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                        >
                          Full Name *
                        </label>
                        <input
                          id="service-inquiry-name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:border-[#1a3e8c] focus:ring-2 focus:ring-[#1a3e8c]/10 transition-all"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="service-inquiry-email"
                          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                        >
                          Work Email *
                        </label>
                        <input
                          id="service-inquiry-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="rahul@company.com"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:border-[#1a3e8c] focus:ring-2 focus:ring-[#1a3e8c]/10 transition-all"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="service-inquiry-phone"
                          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                        >
                          Phone / WhatsApp *
                        </label>
                        <input
                          id="service-inquiry-phone"
                          name="phone"
                          type="tel"
                          required
                          autoComplete="tel"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:border-[#1a3e8c] focus:ring-2 focus:ring-[#1a3e8c]/10 transition-all"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="service-inquiry-message"
                          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
                        >
                          Scope Notes (Optional)
                        </label>
                        <textarea
                          id="service-inquiry-message"
                          name="message"
                          rows={2}
                          value={clientMessage}
                          onChange={(e) => setClientMessage(e.target.value)}
                          placeholder="Requirements or deadlines..."
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:border-[#1a3e8c] focus:ring-2 focus:ring-[#1a3e8c]/10 transition-all resize-none"
                        />
                      </div>

                      {submitError && (
                        <p className="text-[11px] text-red-700 font-semibold" role="alert">
                          {errorMessage || 'Submission failed. Please call us directly.'}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        aria-busy={submitting}
                        className="w-full py-3 rounded-xl bg-[#0D1B4B] hover:bg-[#1B6EF3] text-white font-bold text-xs shadow-md shadow-blue-900/10 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {submitting ? 'Connecting…' : 'Submit Consultation Request'}
                      </button>
                    </form>
                  )}

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <a
                      href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                        `Hello Snaptech, I would like to consult for ${service.title} architecture.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent('whatsapp_click', {
                          source: 'service_detail',
                          location: 'service_detail_priority_desk',
                          service: service?.title || slug,
                        })
                      }
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-[#25D366]" />
                      Direct WhatsApp Priority Desk
                    </a>
                  </div>
                </div>
              </div>

              {/* Direct Support & Phone Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-sm">
                <p className="text-xs font-mono font-bold text-[#1a3e8c] uppercase tracking-wider">
                  Direct Engineering Desk
                </p>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-3.5 group p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#1a3e8c]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-600 font-mono">Immediate Telephone</p>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-[#1a3e8c] transition-colors">
                      {phone}
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3.5 group p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#1a3e8c]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-600 font-mono">Official Inquiries</p>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-[#1a3e8c] transition-colors truncate">
                      {contactEmail}
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-2 pt-2 text-xs text-slate-600 border-t border-slate-100 font-mono">
                  <Zap className="w-3.5 h-3.5 text-[#1a3e8c]" />
                  24-Hour Guaranteed Proposal SLA
                </div>
              </div>

              {/* Direct Link to Pricing Page */}
              <div className="rounded-2xl border border-blue-200/80 bg-linear-to-br from-blue-50/70 to-indigo-50/50 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1a3e8c] uppercase tracking-wider mb-2">
                  <BadgeCheck className="w-4 h-4 text-[#1a3e8c]" /> Transparent Pricing
                </div>
                <h4 className="font-heading text-base font-bold text-[#0D1B4B] mb-2">
                  Check Standard Package Tiers
                </h4>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Compare our Starter, Business, and Enterprise packages with deterministic deliverables and SLA timelines.
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a3e8c] hover:text-[#0D1B4B] transition-colors"
                >
                  <span>Explore Pricing Matrix</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Group SLA Guarantees */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <p className="text-xs font-mono font-bold text-[#1a3e8c] uppercase tracking-wider mb-4">
                  Group SLA Assurances
                </p>
                <ul className="space-y-3.5">
                  {[
                    { icon: Zap, text: 'Strict Sprint Milestones With Zero Slippage' },
                    { icon: Shield, text: 'Enterprise Grade SLA & Quality' },
                    { icon: Users, text: 'Dedicated Lead Engineer & Scrum Master' },
                    { icon: Star, text: '30-Day Post-Launch Warranty Included' },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                      <item.icon className="w-4 h-4 text-[#1a3e8c] shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 3. Sibling Services (Explore More) ──────────────────────── */}
      {relatedServices.length > 0 && (
        <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
          <Container>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#1a3e8c] mb-2 block">
                  // ECOSYSTEM EXPANSION
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Complementary Engineering Modules
                </h2>
              </div>
              <Link
                to="/services"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[#1a3e8c] hover:text-[#0D1B4B] transition-colors"
              >
                View Full Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedServices.map((s) => {
                const RelIcon = getServiceIcon(s.icon || 'Globe')
                const relTheme = getServiceTheme(s.slug)
                return (
                  <Link
                    key={s.id}
                    to={`/services/${s.slug}`}
                    className="group bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col
                      hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-linear-to-br ${relTheme.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300 text-white`}
                    >
                      <RelIcon className="w-5 h-5 text-white" strokeWidth={1.8} />
                    </div>
                    <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-[#1a3e8c] transition-colors mb-2">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed flex-1 mb-5 line-clamp-2">
                      {s.shortDescription || ''}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1a3e8c] group-hover:gap-2 transition-all duration-200">
                      Explore Module <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </Container>
        </section>
      )}

      {/* Case Study Modal */}
      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  )
}

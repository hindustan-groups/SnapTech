import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  Eye,
  Tag,
  ArrowLeft,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Share2,
  ChevronRight,
  BookOpen,
  TrendingUp,
  Link2,
  ChevronUp,
} from 'lucide-react'
import { Container, SEO } from '@/components/ui'
import { useBlogPost, useBlogComments, useSubmitComment } from '@/hooks/useBlog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { fadeUp } from '@/utils/motion'
import DOMPurify from 'dompurify'
import { SITE } from '@/components/ui/SEO'

const commentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().email('Please enter a valid email.'),
  comment: z.string().min(5, 'Comment must be at least 5 characters.').max(2000, 'Too long.'),
  _hp: z.string().optional(),
})

const AVATAR_COLORS = [
  'from-blue-600 to-indigo-700',
  'from-cyan-600 to-blue-700',
  'from-emerald-600 to-teal-700',
  'from-violet-600 to-purple-700',
  'from-amber-600 to-orange-700',
]

const FALLBACK_POST_DETAILS = {
  'why-we-built-snaptech-enterprise-it': {
    id: 'hp-blog-fallback-1',
    title: 'Why We Built SnapTech: Elevating Modern Businesses with Enterprise Cloud & Engineering',
    slug: 'why-we-built-snaptech-enterprise-it',
    excerpt:
      'In today’s digital-first economy, we engineered SnapTech Digital to bridge the gap between legacy workflows and high-performance custom cloud software for ambitious enterprises across India and global markets.',
    content: `<h2>Bridging the Enterprise Digital Divide</h2>
<p>SnapTech Digital was founded with a singular, resolute mission: to engineer bespoke, enterprise-grade cloud software, high-performance web systems, and AI-accelerated automations that deliver compounding business value. For years, growing companies faced an agonizing dilemma when going digital: choose rigid, vulnerability-prone generic templates with zero scalability, or hire prohibitively expensive consulting firms that move at glacial speed.</p>
<p>We built SnapTech Digital to provide a high-velocity engineering alternative: dedicated technical architects, pure modern stacks, transparent pricing, and 100% intellectual property ownership from day one.</p>

<h2>Moving Away From "Template" Fragility</h2>
<p>Many organizations start with off-the-shelf page builders or generic CMS setups. While they appear convenient initially, they quickly fail to scale under high user volumes, incur heavy maintenance penalties, and expose businesses to critical security risks. Even worse, they force companies to contort their unique operational logic to fit rigid plugin ecosystems.</p>
<p>At SnapTech Digital, we build bespoke applications utilizing modern frontend engines like React and Next.js paired with resilient microservices and secure database topologies (PostgreSQL, Redis, Node.js). We architect the software around your exact organizational workflows—ensuring technology accelerates your expansion rather than restricting it.</p>

<h2>Our Ironclad Engineering Guarantees</h2>
<p>When you commission SnapTech Digital, you gain a dedicated technological ally. We adhere to five core operating commitments: complete transparent sprint accounting, zero third-party framework locks, 99.9% uptime architecture SLAs, rigorous automated security auditing, and continuous post-launch warranty support. We are here to craft resilient digital infrastructure that drives revenue and enterprise distinction.</p>`,
    featuredImageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    category: 'Company News',
    tags: ['SnapTech Digital', 'Engineering', 'Custom Software', 'Cloud Architecture'],
    authorName: 'SnapTech Engineering Team',
    status: 'PUBLISHED',
    isFeatured: true,
    publishedAt: '2026-07-08T00:00:00.000Z',
    readTime: 5,
    viewCount: 420,
  },
  'why-we-founded-hindustan-projects-enterprise-it': {
    id: 'hp-blog-fallback-1-alias',
    title: 'Why We Built SnapTech: Elevating Modern Businesses with Enterprise Cloud & Engineering',
    slug: 'why-we-built-snaptech-enterprise-it',
    excerpt:
      'In today’s digital-first economy, we engineered SnapTech Digital to bridge the gap between legacy workflows and high-performance custom cloud software for ambitious enterprises across India and global markets.',
    content: `<h2>Bridging the Enterprise Digital Divide</h2>
<p>SnapTech Digital was founded with a singular, resolute mission: to engineer bespoke, enterprise-grade cloud software, high-performance web systems, and AI-accelerated automations that deliver compounding business value.</p>`,
    featuredImageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    category: 'Company News',
    tags: ['SnapTech Digital', 'Engineering', 'Custom Software'],
    authorName: 'SnapTech Engineering Team',
    status: 'PUBLISHED',
    isFeatured: true,
    publishedAt: '2026-07-08T00:00:00.000Z',
    readTime: 5,
    viewCount: 380,
  },
  'what-we-build-core-it-services-digital-solutions': {
    id: 'hp-blog-fallback-2',
    title: 'What We Build: A Deep Dive into Our Core IT Services & Digital Solutions',
    slug: 'what-we-build-core-it-services-digital-solutions',
    excerpt:
      'Discover what we build. From responsive corporate portals and custom ERP inventory engines to mobile apps, we design resilient digital systems that scale with enterprise growth.',
    content: `<h2>A Comprehensive Software Engineering Practice</h2>
<p>SnapTech Digital is a full-stack digital product engineering consultancy. We design, architect, deploy, and maintain mission-critical software systems across three core pillars: custom web applications, specialized enterprise resource planning (ERP) platforms, and native cross-platform mobile apps.</p>

<h2>1. Custom Web Applications & SaaS Platforms</h2>
<p>We engineer responsive, sub-second web platforms tailored to demanding commercial requirements. Utilizing cutting-edge frontend ecosystems combined with enterprise Node.js and Python microservices, we ensure your platform handles concurrent traffic effortlessly while providing seamless user experiences.</p>

<h2>2. Specialized ERP & Internal Workflow Automation</h2>
<p>Operational bottlenecks cripple growing enterprises. We design bespoke administrative dashboards, automated billing engines, real-time inventory management, and multi-warehouse supply chain trackers. Whether eliminating chaotic spreadsheets or coordinating supply chain milestones, our custom tools create operational clarity.</p>

<h2>3. Native & Cross-Platform Mobile Applications</h2>
<p>Deliver your services straight into your customers’ hands. We develop robust cross-platform mobile applications using Flutter and React Native, securing fluid native performance on both iOS and Android from a unified codebase—drastically reducing time-to-market and maintenance overhead.</p>

<h2>4. Performance-Driven Technical SEO & Cloud Architecture</h2>
<p>High-caliber software delivers maximum ROI when discovered by high-intent clients. We embed technical SEO schemas, structured data, Core Web Vitals optimization, and enterprise CDN routing into every deployment.</p>`,
    featuredImageUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    category: 'Web Development',
    tags: ['Custom Web Apps', 'SaaS', 'ERP', 'Mobile Apps', 'Digital Engineering'],
    authorName: 'SnapTech Engineering Team',
    status: 'PUBLISHED',
    isFeatured: false,
    publishedAt: '2026-07-08T00:00:00.000Z',
    readTime: 4,
    viewCount: 310,
  },
  'how-we-work-transparent-software-development-journey': {
    id: 'hp-blog-fallback-3',
    title: 'How We Work: Our Step-by-Step Transparent Software Development Journey',
    slug: 'how-we-work-transparent-software-development-journey',
    excerpt:
      'How do we bring your vision to life? Read about our transparent 4-stage development lifecycle: Architectural Discovery, UI/UX Prototyping, Agile Sprint Execution, and 24/7 SLA Support.',
    content: `<h2>A Principled Approach with Absolute Transparency</h2>
<p>We believe commissioning software should be an energizing and transparent partnership. We do not hide behind esoteric technical jargon or burden clients with surprise invoices. Our engineering lifecycle is segmented into four clear, milestone-driven phases.</p>

<h2>Phase 1: Deep Discovery & Technical Scoping</h2>
<p>Before writing a single line of production code, our technical leads evaluate your operational bottlenecks, security requirements, and growth projections. We formulate an exhaustive Technical Blueprint detailing system architecture, data models, and strict delivery milestones.</p>

<h2>Phase 2: High-Fidelity UI/UX Prototyping</h2>
<p>Our product designers construct interactive, clickable Figma prototypes honoring modern cyber-minimalist design principles. You inspect and validate every mobile and desktop workflow before engineering commences.</p>

<h2>Phase 3: Agile Sprint Execution & Automated QA</h2>
<p>Our engineering squads ship features in two-week agile increments. Every sprint concludes with an interactive deployment on a private staging domain, accompanied by automated end-to-end regression suites and load testing.</p>

<h2>Phase 4: Zero-Downtime Deployment & Enterprise SLAs</h2>
<p>Following final stakeholder sign-off, we launch your application onto containerized cloud infrastructure with automated SSL provisioning, hourly database snapshots, and real-time telemetry alerting.</p>`,
    featuredImageUrl:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80',
    category: 'Our Process',
    tags: ['Methodology', 'Agile', 'Quality Assurance', 'Cloud SLAs'],
    authorName: 'SnapTech Engineering Team',
    status: 'PUBLISHED',
    isFeatured: false,
    publishedAt: '2026-07-09T00:00:00.000Z',
    readTime: 6,
    viewCount: 260,
  },
}

// ── Reading Progress Bar ───────────────────────────────────────
function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-brand-blue via-blue-500 to-indigo-500 transition-all duration-75 shadow-xs shadow-blue-400"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// ── Back To Top ────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!visible) return null
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-6 z-50 w-11 h-11 bg-white border border-slate-200 text-brand-blue rounded-full shadow-lg hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-blue-900/10"
      aria-label="Back to top"
    >
      <ChevronUp className="w-5 h-5" />
    </motion.button>
  )
}

// ── Share Buttons ──────────────────────────────────────────────
function ShareButtons({ title, slug, compact = false }) {
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/blog/${slug}`
      : `https://www.snaptech.digital/blog/${slug}`
  const encoded = encodeURIComponent(url)
  const text = encodeURIComponent(title)
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const buttons = [
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      bg: 'bg-[#0077b5]/10 text-[#0077b5] border-[#0077b5]/30 hover:bg-[#0077b5] hover:text-white',
    },
    {
      label: 'X / Twitter',
      href: `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`,
      bg: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-800 hover:text-white',
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${text}%20${encoded}`,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white',
    },
  ]

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        {buttons.map(({ label, href, bg }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Share on ${label}`}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${bg}`}
          >
            <Share2 className="w-3.5 h-3.5" />
          </a>
        ))}
        <button
          onClick={copyLink}
          title="Copy link"
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-blue hover:border-brand-blue/50 flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          {copied ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Link2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mr-1">
        <Share2 className="w-3.5 h-3.5 text-brand-blue" /> Share:
      </span>
      {buttons.map(({ label, href, bg }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${bg}`}
        >
          {label}
        </a>
      ))}
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-brand-blue hover:border-brand-blue/50 transition-all cursor-pointer shadow-xs"
      >
        {copied ? (
          <>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Copied!
          </>
        ) : (
          <>
            <Link2 className="w-3.5 h-3.5" /> Copy Link
          </>
        )}
      </button>
    </div>
  )
}

// ── Related Card ───────────────────────────────────────────────
function RelatedCard({ post }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''
  return (
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <article className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-brand-blue/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col shadow-xs">
        <div className="relative h-44 bg-slate-100 overflow-hidden shrink-0">
          {post.featuredImageUrl ? (
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-50/50">
              <BookOpen className="w-10 h-10 text-brand-blue/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
          <span className="absolute top-3 left-3 text-[10px] font-bold bg-white/95 text-brand-blue border border-blue-200/80 px-2.5 py-1 rounded-full shadow-xs">
            {post.category}
          </span>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-heading font-bold text-slate-900 text-sm leading-snug mb-2 group-hover:text-brand-blue transition-colors line-clamp-2 flex-1">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-auto">
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-brand-blue" /> {date}
              </span>
            )}
            {post.readTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-brand-blue" /> {post.readTime} min
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

// ── Main Export ────────────────────────────────────────────────
export default function BlogPostPage() {
  const { slug } = useParams()
  const [commentSuccess, setCommentSuccess] = useState(false)
  const articleRef = useRef(null)

  const { data, isLoading, isError } = useBlogPost(slug)
  const { data: commentsData } = useBlogComments(slug)
  const submitMutation = useSubmitComment(slug)

  // Resolve article from DB or fallback catalog
  const post = useMemo(() => {
    if (data?.data) return data.data
    if (slug && FALLBACK_POST_DETAILS[slug]) return FALLBACK_POST_DETAILS[slug]
    return null
  }, [data?.data, slug])

  const comments = commentsData?.data || []
  const relatedPosts = useMemo(() => {
    if (post?.relatedPosts?.length > 0) return post.relatedPosts
    // Return other fallback posts (exclude current and duplicate aliases)
    return Object.values(FALLBACK_POST_DETAILS).filter(
      (p, idx, arr) => p.slug !== slug && arr.findIndex((x) => x.slug === p.slug) === idx
    )
  }, [post, slug])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(commentSchema),
  })

  const onCommentSubmit = async (formData) => {
    try {
      await submitMutation.mutateAsync(formData)
      setCommentSuccess(true)
      reset()
      setTimeout(() => setCommentSuccess(false), 8000)
    } catch {
      /* error shown via submitMutation.isError */
    }
  }

  // ── Loading ────────────────────────────────────────────────
  if (isLoading && !post) {
    return (
      <div className="min-h-screen bg-slate-50/50 text-slate-800">
        <div className="h-[480px] bg-slate-200 animate-pulse border-b border-slate-200" />
        <div className="py-14">
          <Container>
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 bg-white rounded-3xl p-10 space-y-4 border border-slate-200/80 shadow-sm">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-slate-100 rounded animate-pulse"
                    style={{ width: `${50 + ((i * 7) % 45)}%` }}
                  />
                ))}
              </div>
              <div className="w-full lg:w-72 space-y-4">
                <div className="h-32 bg-white rounded-2xl border border-slate-200/80 animate-pulse shadow-sm" />
                <div className="h-44 bg-white rounded-2xl border border-slate-200/80 animate-pulse shadow-sm" />
              </div>
            </div>
          </Container>
        </div>
      </div>
    )
  }

  // ── Error / Not found ─────────────────────────────────────
  if ((isError || !post) && !FALLBACK_POST_DETAILS[slug]) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-slate-50/50 text-slate-800 flex items-center justify-center">
        <div className="text-center px-4 max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5 text-amber-600">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">Article Not Found</h1>
          <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
            The technical whitepaper you are looking for does not exist or has been relocated.
          </p>
          <Link to="/blog">
            <button className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-all cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Browse All Articles
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const metaTitle = post.metaTitle || post.title
  const metaDescription = post.metaDescription || post.excerpt
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImageUrl || `${SITE.url}/og-image.png`,
    author: { '@type': 'Person', name: post.authorName || 'SnapTech Engineering Team' },
    publisher: {
      '@type': 'Organization',
      name: 'SnapTech Digital',
      logo: { '@type': 'ImageObject', url: `${SITE.url}/og-image.png` },
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/blog/${post.slug}` },
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 relative overflow-hidden">
      <SEO
        title={`${metaTitle} | SnapTech Digital`}
        description={metaDescription}
        path={`/blog/${post.slug}`}
        ogImage={post.featuredImageUrl}
        schemas={[articleSchema]}
      />

      <ReadingProgressBar />
      <BackToTop />

      {/* ── HERO — Light Canvas ── */}
      <div className="relative w-full pt-28 pb-16 sm:pb-20 lg:pb-28 overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-blue-50/70 via-white to-slate-50/50">
        {/* Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(27,110,243,0.08),transparent)] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a06_1px,transparent_1px),linear-gradient(to_bottom,#0f172a06_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <Container className="relative z-10">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-8 flex-wrap"
          >
            <Link to="/" className="hover:text-brand-blue transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <Link to="/blog" className="hover:text-brand-blue transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-md">
              {post.title}
            </span>
          </motion.nav>

          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            {/* Category badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-[11px] font-bold text-brand-blue bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-full mb-5 shadow-xs mx-auto"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse shadow-xs shadow-blue-400" />
              {post.category}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="font-heading text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-slate-900 leading-[1.2] mb-5 tracking-tight text-center"
            >
              {post.title}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl text-center mx-auto"
            >
              {post.excerpt}
            </motion.p>

            {/* Meta row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-2"
            >
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-blue-200/80 shadow-xs bg-white shrink-0">
                  <img
                    src="/logo-with-bg.png"
                    alt="SnapTech Digital"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="text-slate-900 font-semibold text-xs leading-none">
                    {post.authorName || 'SnapTech Team'}
                  </p>
                  <p className="text-brand-blue text-[10px] mt-1 font-mono uppercase font-bold">
                    ENGINEERING PRACTICE
                  </p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-6 bg-slate-200" />

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                {publishDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-blue" /> {publishDate}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-blue" /> {post.readTime || 5} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-brand-blue" /> {post.viewCount || 120} views
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-blue" /> {comments.length} comments
                </span>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>

      {/* ── FEATURED IMAGE CARD ── */}
      {post.featuredImageUrl && (
        <div className="relative z-20 -mt-10 sm:-mt-16 lg:-mt-20">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-white w-full max-w-5xl mx-auto"
            >
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                className="w-full h-auto max-h-[480px] object-cover block"
              />
            </motion.div>
          </Container>
        </div>
      )}

      {/* ── CONTENT — Article + Sidebar ── */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="flex flex-col lg:flex-row gap-10 xl:gap-14 items-start">
            {/* Vertical share bar — xl only */}
            <div
              className="hidden xl:flex flex-col items-center gap-3 sticky top-28 shrink-0 pt-2"
              style={{ width: '40px' }}
            >
              <span
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                Share
              </span>
              <div className="w-px h-8 bg-slate-200" />
              <ShareButtons title={post.title} slug={post.slug} compact={true} />
            </div>

            {/* ── ARTICLE ─────────────────────────────── */}
            <motion.article
              ref={articleRef}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex-1 min-w-0"
            >
              {/* Article body card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="px-6 sm:px-10 lg:px-12 py-10 sm:py-12">
                  <div
                    className="prose prose-slate max-w-none text-slate-700 prose-headings:text-slate-900 prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-blue prose-strong:text-slate-900 prose-p:leading-relaxed prose-p:text-slate-600 prose-li:text-slate-600"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                  />
                </div>

                {/* Article footer */}
                <div className="px-6 sm:px-10 lg:px-12 py-7 border-t border-slate-100 bg-slate-50/50 space-y-5">
                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                      {post.tags.map((tag) => (
                        <Link
                          key={tag}
                          to={`/blog?search=${encodeURIComponent(tag)}`}
                          className="text-[11px] font-bold bg-white hover:bg-brand-blue hover:text-white text-slate-700 border border-slate-200 px-3 py-1 rounded-full transition-all shadow-xs"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Share + back link */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                    <ShareButtons title={post.title} slug={post.slug} />
                    <Link
                      to="/blog"
                      className="inline-flex items-center gap-2 text-xs text-brand-blue font-bold hover:gap-3 transition-all group shrink-0 uppercase tracking-wider"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      All Technical Insights
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── COMMENTS ─────────────────────────── */}
              <div className="mt-12">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0 text-brand-blue">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900 leading-none">
                      Technical Discussion
                      <span className="ml-2 text-xs font-bold text-brand-blue bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full align-middle">
                        {comments.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Join the engineering discussion</p>
                  </div>
                </div>

                {/* Comment list */}
                {comments.length > 0 ? (
                  <div className="space-y-4 mb-8">
                    {comments.map((c, i) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                              AVATAR_COLORS[i % AVATAR_COLORS.length]
                            } flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs`}
                          >
                            {c.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="font-bold text-sm text-slate-900">{c.name}</span>
                              <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                {new Date(c.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                              {c.comment}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center mb-8">
                    <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-900 text-sm">No comments submitted yet</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Be the first engineer to share an insight or question!
                    </p>
                  </div>
                )}

                {/* Comment form */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-heading font-bold text-slate-900 text-base sm:text-lg">
                      Leave a Technical Comment
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submissions are reviewed before appearing publicly.
                    </p>
                  </div>
                  <div className="px-6 sm:px-8 py-7">
                    {commentSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-5"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-800 text-sm">Comment submitted!</p>
                          <p className="text-emerald-700/80 text-xs mt-0.5 leading-relaxed">
                            Awaiting moderation — will appear once approved by our editorial team.
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <form
                        onSubmit={handleSubmit(onCommentSubmit)}
                        className="space-y-4"
                        noValidate
                      >
                        {/* Honeypot */}
                        <input
                          type="text"
                          {...register('_hp')}
                          className="absolute opacity-0 h-0 w-0 pointer-events-none"
                          tabIndex={-1}
                          autoComplete="off"
                          aria-hidden="true"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                              Your Name *
                            </label>
                            <input
                              type="text"
                              {...register('name')}
                              placeholder="e.g. Rahul Verma"
                              className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all ${
                                errors.name ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                              }`}
                            />
                            {errors.name && (
                              <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.name.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              {...register('email')}
                              placeholder="e.g. rahul@domain.com"
                              className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all ${
                                errors.email ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                              }`}
                            />
                            {errors.email && (
                              <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.email.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                            Your Comment *
                          </label>
                          <textarea
                            rows={4}
                            {...register('comment')}
                            placeholder="Share your thoughts, architectural feedback, or technical questions..."
                            className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all resize-none ${
                              errors.comment ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                            }`}
                          />
                          {errors.comment && (
                            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.comment.message}
                            </p>
                          )}
                        </div>

                        {submitMutation.isError && (
                          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {submitMutation.error?.message ||
                              'Failed to submit. Please try again later.'}
                          </div>
                        )}

                        <div className="flex items-center gap-4 pt-2">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-blue-500/20"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isSubmitting ? 'Posting…' : 'Submit Comment'}
                          </button>
                          <p className="text-[10px] text-slate-500">
                            Your email will never be published.
                          </p>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>

            {/* ── SIDEBAR ──────────────────────────── */}
            <aside className="w-full lg:w-[280px] xl:w-[300px] shrink-0 space-y-5 lg:sticky lg:top-24">
              {/* Author Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue via-indigo-500 to-transparent" />
                <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-4">
                  Engineering Contributor
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-blue-200/80 shadow-xs bg-white shrink-0">
                    <img
                      src="/logo-with-bg.png"
                      alt="SnapTech Digital"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs leading-none">
                      {post.authorName || 'SnapTech Team'}
                    </p>
                    <p className="text-[10px] text-brand-blue mt-1 font-mono uppercase font-bold">
                      SNAPTECH DIGITAL
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enterprise software engineers building mission-critical platforms that accelerate
                  growth and scale.
                </p>
              </div>

              {/* Article stats */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Telemetry &amp; Metadata
                </p>
                <div className="space-y-1">
                  {[
                    {
                      icon: Calendar,
                      label: 'Published',
                      value: publishDate,
                      show: Boolean(publishDate),
                    },
                    {
                      icon: Clock,
                      label: 'Reading Time',
                      value: `${post.readTime || 5} min`,
                      show: true,
                    },
                    {
                      icon: Eye,
                      label: 'Page Views',
                      value: `${post.viewCount || 120}`,
                      show: true,
                    },
                    {
                      icon: MessageSquare,
                      label: 'Comments',
                      value: `${comments.length}`,
                      show: true,
                    },
                  ]
                    .filter((i) => i.show)
                    .map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                      >
                        <span className="text-slate-500 text-xs flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-brand-blue" /> {label}
                        </span>
                        <span className="font-semibold text-slate-900 text-xs">{value}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Indexed Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/blog?search=${encodeURIComponent(tag)}`}
                        className="text-[10px] font-semibold bg-slate-50 hover:bg-brand-blue hover:text-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg transition-all"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Consultation CTA */}
              <div className="relative bg-gradient-to-br from-[#0D1B4B] to-blue-900 rounded-2xl p-5 text-white shadow-lg overflow-hidden">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 text-cyan-300">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading font-bold text-sm mb-1.5 leading-snug text-white">
                    Need Custom Software?
                  </h3>
                  <p className="text-blue-100/80 text-xs leading-relaxed mb-4">
                    High-performance web apps, custom ERPs, and cloud modernization for enterprise
                    leaders.
                  </p>
                  <Link
                    to="/contact"
                    className="block w-full text-center bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-blue-950/40"
                  >
                    Request Project Consultation
                  </Link>
                </div>
              </div>

              {/* Browse more */}
              <Link
                to="/blog"
                className="flex items-center gap-2 text-xs text-brand-blue font-bold hover:gap-3 transition-all group px-1 uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Browse All Whitepapers
              </Link>
            </aside>
          </div>
        </Container>
      </section>

      {/* ── RELATED POSTS ── */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-200/80">
          <Container>
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-1">
                  Further Reading
                </p>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                  Related Insights
                </h2>
              </div>
              <Link
                to="/blog"
                className="shrink-0 text-xs font-bold text-brand-blue flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-wider"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((p, i) => (
                <motion.div
                  key={p.id || p.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="h-full"
                >
                  <RelatedCard post={p} />
                </motion.div>
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  )
}

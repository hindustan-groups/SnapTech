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
  'from-cyan-500 to-blue-700',
  'from-blue-500 to-indigo-700',
  'from-emerald-500 to-teal-700',
  'from-violet-500 to-purple-700',
  'from-amber-500 to-orange-700',
]

const FALLBACK_POST_DETAILS = {
  'why-we-founded-hindustan-projects-enterprise-it': {
    id: 'hp-blog-fallback-1',
    title: "Why We Founded Hindustan Projects: Shifting Rajasthan's Businesses to Enterprise IT",
    slug: 'why-we-founded-hindustan-projects-enterprise-it',
    excerpt:
      "In today's digital-first economy, we founded Hindustan Projects to bridge the gap between legacy paper workflows and high-performance custom software for businesses in Rajasthan and beyond.",
    content: `<h2>Bridging the Digital Gap in Local Markets</h2>
<p>Hindustan Projects was founded with a single, clear mission: to bring enterprise-grade web development, custom software engineering, and digital solutions to businesses across Rajasthan and India. For too long, small and mid-sized enterprises (SMEs) in growing hubs like Bhilwara, Udaipur, and Jodhpur had only two choices when going digital: expensive global consultancies or low-cost template builders who offer zero support and rigid structures.</p>
<p>We realized that local industries—whether it is Bhilwara’s massive textile manufacturing units or Rajasthan's expanding retail and hospitality sectors—need custom, secure, and fast software systems tailored to their specific workflows. That is why we built Hindustan Projects.</p>

<h2>Moving Away From "Template" Culture</h2>
<p>Many businesses buy off-the-shelf templates or generic WordPress setups. While they seem cheap at first, they quickly fail to scale. They are slow, vulnerable to security hacks, and force the business to adapt its real-world operations to fit a rigid website template.</p>
<p>At Hindustan Projects, we do the exact opposite. We build custom applications using cutting-edge technologies like React, Node.js, and PostgreSQL. We design the software around your business operations, ensuring that the technology grows with you, rather than holding you back.</p>

<h2>Our Commitment to Engineering Quality</h2>
<p>When you partner with us, you are not just hiring a vendor; you are gaining a technology partner. We stand by four core commitments: complete transparency in billing, zero dependency on third-party templates, high-performance optimization, and dedicated post-launch support. We are here to build digital products that drive real revenue and efficiency for your brand.</p>`,
    featuredImageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    category: 'Company News',
    tags: ['Hindustan Projects', 'mission', 'custom software', 'Rajasthan IT'],
    authorName: 'Hindustan Projects Engineering Board',
    status: 'PUBLISHED',
    isFeatured: true,
    publishedAt: '2026-07-08T00:00:00.000Z',
    readTime: 5,
    viewCount: 320,
  },
  'what-we-build-core-it-services-digital-solutions': {
    id: 'hp-blog-fallback-2',
    title: 'What We Build: A Deep Dive into Our Core IT Services & Digital Solutions',
    slug: 'what-we-build-core-it-services-digital-solutions',
    excerpt:
      'Discover what we build. From responsive corporate portals and custom textile ERP inventory systems to mobile apps, we design custom digital systems that scale.',
    content: `<h2>A Full-Suite Software Engineering Partner</h2>
<p>Hindustan Projects is a comprehensive IT services provider. We design, code, secure, and manage high-performance software systems. Our capabilities span across three core pillars: custom web applications, specialized business ERP systems, and high-converting marketing platforms.</p>

<h2>1. Custom Web Applications & SaaS Portals</h2>
<p>We build responsive, fast, and feature-rich web applications tailored to your business goals. Utilizing modern frontend frameworks like React and NextJS combined with robust backend APIs (Node.js/Express), we ensure your system loads instantly and can handle thousands of concurrent users securely.</p>

<h2>2. Specialized ERP & Internal Software</h2>
<p>Internal operations are the heart of any business. We build custom dashboards, billing engines, custom CRMs, and supply chain tracking systems. Whether you need to track raw yarn inventory for a loom factory or automate invoice processing for a retail brand, we design software that eliminates manual Excel sheets and paperwork.</p>

<h2>3. Mobile App Development</h2>
<p>Bring your services directly to your clients' smartphones. We build cross-platform mobile apps using Flutter and React Native, delivering a native look and feel on both iOS and Android with a single codebase, saving you time and cost.</p>

<h2>4. Performance-Driven SEO & Cloud Security</h2>
<p>A great software tool is only useful if your clients can find it. We integrate technical SEO, schema indexing, and fast-performance audits into every site we deploy, helping you rank on top of local searches and capture inbound leads organically.</p>`,
    featuredImageUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    category: 'Web Development',
    tags: ['custom web apps', 'SaaS', 'ERP', 'mobile apps', 'digital engineering'],
    authorName: 'Hindustan Projects Engineering Board',
    status: 'PUBLISHED',
    isFeatured: false,
    publishedAt: '2026-07-08T00:00:00.000Z',
    readTime: 4,
    viewCount: 245,
  },
  'how-we-work-transparent-software-development-journey': {
    id: 'hp-blog-fallback-3',
    title: 'How We Work: Our Step-by-Step Transparent Software Development Journey',
    slug: 'how-we-work-transparent-software-development-journey',
    excerpt:
      'How do we bring your ideas to life? Read about our transparent 4-stage development lifecycle: Discovery, UI/UX Design, Robust Coding, and Support.',
    content: `<h2>A Collaborative Approach with Zero Jargon</h2>
<p>We believe that building software should be an exciting and stress-free journey for our clients. We do not hide behind complex technical jargon or surprise you with hidden maintenance fees. Our development lifecycle is divided into four transparent, structured stages to keep you involved every step of the way.</p>

<h2>Phase 1: Deep Discovery & Technical Scoping</h2>
<p>Before writing a single line of code, our lead architects meet with your team to understand your current operational bottlenecks, user personas, and target growth metrics. We produce an exhaustive Blueprint & Specification document outlining exact milestones.</p>

<h2>Phase 2: High-Fidelity UI/UX Prototyping</h2>
<p>Next, our product designers build clickable, interactive Figma prototypes following modern cyber and enterprise design systems. You click through every screen on mobile and desktop before development begins.</p>

<h2>Phase 3: Agile Sprint Execution & QA</h2>
<p>Our engineering pods build features in two-week agile sprints. Every sprint ends with an interactive demo on a private staging URL, followed by rigorous cross-browser and penetration testing.</p>

<h2>Phase 4: Zero-Downtime Deployment & SLA Support</h2>
<p>Once approved, we deploy your application to scalable cloud clusters with automated SSL, daily database backups, and 24/7 telemetry monitoring.</p>`,
    featuredImageUrl:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80',
    category: 'Our Process',
    tags: ['methodology', 'agile', 'quality assurance', 'deployment'],
    authorName: 'Hindustan Projects Engineering Board',
    status: 'PUBLISHED',
    isFeatured: false,
    publishedAt: '2026-07-09T00:00:00.000Z',
    readTime: 6,
    viewCount: 198,
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
        className="h-full bg-gradient-to-r from-brand-cyan via-blue-500 to-indigo-500 transition-all duration-75 shadow-sm shadow-cyan-400"
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
      className="fixed bottom-8 right-6 z-50 w-11 h-11 bg-slate-900 border border-brand-cyan/40 text-brand-cyan rounded-full shadow-2xl hover:bg-brand-cyan hover:text-slate-950 transition-all flex items-center justify-center cursor-pointer shadow-cyan-950/50"
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
      bg: 'bg-[#0077b5]/20 text-[#00a0dc] border-[#0077b5]/40 hover:bg-[#0077b5] hover:text-white',
    },
    {
      label: 'X / Twitter',
      href: `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`,
      bg: 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15 hover:text-white',
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${text}%20${encoded}`,
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white',
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
          className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-brand-cyan hover:border-brand-cyan/40 flex items-center justify-center transition-all cursor-pointer"
        >
          {copied ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Link2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
        <Share2 className="w-3.5 h-3.5 text-brand-cyan" /> Share:
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-white/10 text-slate-300 hover:text-brand-cyan hover:border-brand-cyan/40 transition-all cursor-pointer"
      >
        {copied ? (
          <>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Copied!
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
      <article className="bg-slate-900/70 rounded-2xl border border-white/10 overflow-hidden hover:border-brand-cyan/40 hover:shadow-xl hover:shadow-cyan-950/20 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col backdrop-blur-xl">
        <div className="relative h-44 bg-gradient-to-br from-blue-950 to-slate-950 overflow-hidden shrink-0">
          {post.featuredImageUrl ? (
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-brand-cyan/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          <span className="absolute top-3 left-3 text-[10px] font-bold bg-slate-900/90 text-brand-cyan border border-brand-cyan/30 px-2.5 py-1 rounded-full shadow-md">
            {post.category}
          </span>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-heading font-bold text-white text-sm leading-snug mb-2 group-hover:text-brand-cyan transition-colors line-clamp-2 flex-1">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-3 border-t border-white/10 mt-auto">
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-brand-cyan" /> {date}
              </span>
            )}
            {post.readTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-brand-cyan" /> {post.readTime} min
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
    // Return other fallback posts
    return Object.values(FALLBACK_POST_DETAILS).filter((p) => p.slug !== slug)
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
      <div className="min-h-screen bg-[#020714] text-slate-200">
        <div className="h-[480px] bg-slate-900 animate-pulse border-b border-white/10" />
        <div className="py-14">
          <Container>
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 bg-slate-900/60 rounded-3xl p-10 space-y-4 border border-white/10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-white/[0.04] rounded animate-pulse"
                    style={{ width: `${50 + ((i * 7) % 45)}%` }}
                  />
                ))}
              </div>
              <div className="w-full lg:w-72 space-y-4">
                <div className="h-32 bg-slate-900/60 rounded-2xl border border-white/10 animate-pulse" />
                <div className="h-44 bg-slate-900/60 rounded-2xl border border-white/10 animate-pulse" />
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
      <div className="min-h-screen pt-32 pb-20 bg-[#020714] text-slate-200 flex items-center justify-center">
        <div className="text-center px-4 max-w-md bg-slate-900/80 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white mb-2">Article Not Found</h1>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
            The technical whitepaper you are looking for does not exist or has been relocated.
          </p>
          <Link to="/blog">
            <button className="inline-flex items-center gap-2 bg-brand-cyan text-slate-950 px-6 py-3 rounded-xl text-xs font-bold shadow-lg shadow-cyan-950/50 hover:bg-brand-cyan-light transition-all cursor-pointer">
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
    author: { '@type': 'Person', name: post.authorName || 'Hindustan Projects Engineering Board' },
    publisher: {
      '@type': 'Organization',
      name: 'Hindustan Projects',
      logo: { '@type': 'ImageObject', url: `${SITE.url}/og-image.png` },
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/blog/${post.slug}` },
  }

  return (
    <div className="min-h-screen bg-[#020714] text-slate-200 relative overflow-hidden">
      <SEO
        title={`${metaTitle} | Snaptech — Hindustan Projects`}
        description={metaDescription}
        path={`/blog/${post.slug}`}
        ogImage={post.featuredImageUrl}
        schemas={[articleSchema]}
      />

      <ReadingProgressBar />
      <BackToTop />

      {/* ── HERO — Cyber-Navy Canvas ── */}
      <div className="relative w-full pt-28 pb-16 sm:pb-20 lg:pb-28 overflow-hidden border-b border-white/10">
        {/* Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(14,165,233,0.18),transparent)] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-primary/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <Container className="relative z-10">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-8 flex-wrap"
          >
            <Link to="/" className="hover:text-brand-cyan transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <Link to="/blog" className="hover:text-brand-cyan transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="text-slate-400 truncate max-w-[200px] sm:max-w-md">{post.title}</span>
          </motion.nav>

          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            {/* Category badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-[11px] font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30 px-3.5 py-1.5 rounded-full mb-5 backdrop-blur-md mx-auto"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse shadow-sm shadow-cyan-400" />
              {post.category}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="font-heading text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-white leading-[1.18] mb-5 tracking-tight text-center"
            >
              {post.title}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl text-center mx-auto"
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
                <div className="w-9 h-9 rounded-full overflow-hidden border border-brand-cyan/30 shadow-md bg-slate-950 shrink-0">
                  <img
                    src="/logo-with-bg.png"
                    alt="Hindustan Projects"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-xs leading-none">
                    {post.authorName || 'Hindustan Projects'}
                  </p>
                  <p className="text-brand-cyan text-[10px] mt-1 font-mono uppercase">
                    IT DIVISION
                  </p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-6 bg-white/10" />

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
                {publishDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-cyan" /> {publishDate}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-cyan" /> {post.readTime || 5} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-brand-cyan" /> {post.viewCount || 120} views
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-cyan" /> {comments.length}{' '}
                  comments
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
              className="rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-slate-900 w-full max-w-5xl mx-auto"
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
                className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                Share
              </span>
              <div className="w-px h-8 bg-white/10" />
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
              <div className="bg-slate-900/75 rounded-3xl shadow-xl border border-white/10 overflow-hidden backdrop-blur-xl">
                <div className="px-6 sm:px-10 lg:px-12 py-10 sm:py-12">
                  <div
                    className="prose prose-invert prose-cyan max-w-none text-slate-300 prose-headings:text-white prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-cyan prose-strong:text-white prose-p:leading-relaxed prose-p:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                  />
                </div>

                {/* Article footer */}
                <div className="px-6 sm:px-10 lg:px-12 py-7 border-t border-white/10 bg-slate-950/40 space-y-5">
                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                      {post.tags.map((tag) => (
                        <Link
                          key={tag}
                          to={`/blog?search=${encodeURIComponent(tag)}`}
                          className="text-[11px] font-bold bg-white/[0.04] hover:bg-brand-cyan hover:text-slate-950 text-slate-300 border border-white/10 px-3 py-1 rounded-full transition-all"
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
                      className="inline-flex items-center gap-2 text-xs text-brand-cyan font-bold hover:gap-3 transition-all group shrink-0 uppercase tracking-wider"
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
                  <div className="w-10 h-10 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center shrink-0 text-brand-cyan">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-white leading-none">
                      Technical Discussion
                      <span className="ml-2 text-xs font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-full align-middle">
                        {comments.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Join the engineering discussion</p>
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
                        className="bg-slate-900/60 rounded-2xl border border-white/10 p-5 sm:p-6 shadow-md backdrop-blur-md"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                              AVATAR_COLORS[i % AVATAR_COLORS.length]
                            } flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}
                          >
                            {c.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="font-bold text-sm text-white">{c.name}</span>
                              <span className="text-[10px] text-slate-400 bg-white/[0.05] border border-white/10 px-2 py-0.5 rounded-full">
                                {new Date(c.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {c.comment}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/40 rounded-2xl border border-dashed border-white/15 p-8 text-center mb-8">
                    <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="font-bold text-white text-sm">No comments submitted yet</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Be the first engineer to share an insight or question!
                    </p>
                  </div>
                )}

                {/* Comment form */}
                <div className="bg-slate-900/80 rounded-3xl border border-white/10 shadow-xl overflow-hidden backdrop-blur-xl">
                  <div className="px-6 sm:px-8 py-5 border-b border-white/10 bg-white/[0.02]">
                    <h3 className="font-heading font-bold text-white text-base sm:text-lg">
                      Leave a Technical Comment
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submissions are reviewed before appearing publicly.
                    </p>
                  </div>
                  <div className="px-6 sm:px-8 py-7">
                    {commentSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-400 text-sm">Comment submitted!</p>
                          <p className="text-emerald-300/80 text-xs mt-0.5 leading-relaxed">
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
                            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                              Your Name *
                            </label>
                            <input
                              type="text"
                              {...register('name')}
                              placeholder="e.g. Rahul Verma"
                              className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.04] border text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan/40 focus:border-brand-cyan transition-all ${
                                errors.name ? 'border-red-500 bg-red-500/5' : 'border-white/10'
                              }`}
                            />
                            {errors.name && (
                              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.name.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              {...register('email')}
                              placeholder="e.g. rahul@domain.com"
                              className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.04] border text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan/40 focus:border-brand-cyan transition-all ${
                                errors.email ? 'border-red-500 bg-red-500/5' : 'border-white/10'
                              }`}
                            />
                            {errors.email && (
                              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.email.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                            Your Comment *
                          </label>
                          <textarea
                            rows={4}
                            {...register('comment')}
                            placeholder="Share your thoughts, architectural feedback, or technical questions..."
                            className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.04] border text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan/40 focus:border-brand-cyan transition-all resize-none ${
                              errors.comment ? 'border-red-500 bg-red-500/5' : 'border-white/10'
                            }`}
                          />
                          {errors.comment && (
                            <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.comment.message}
                            </p>
                          )}
                        </div>

                        {submitMutation.isError && (
                          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {submitMutation.error?.message ||
                              'Failed to submit. Please try again later.'}
                          </div>
                        )}

                        <div className="flex items-center gap-4 pt-2">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 bg-brand-cyan hover:bg-brand-cyan-light text-slate-950 px-6 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-cyan-950/40"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isSubmitting ? 'Posting…' : 'Submit Comment'}
                          </button>
                          <p className="text-[10px] text-slate-400">
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
              <div className="bg-slate-900/70 rounded-2xl border border-white/10 p-5 shadow-lg backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-cyan via-blue-500 to-transparent" />
                <p className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest mb-4">
                  Engineering Contributor
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-brand-cyan/30 shadow-md bg-slate-950 shrink-0">
                    <img
                      src="/logo-with-bg.png"
                      alt="Hindustan Projects"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs leading-none">
                      {post.authorName || 'Hindustan Projects'}
                    </p>
                    <p className="text-[10px] text-brand-cyan mt-1 font-mono uppercase">
                      HINDUSTAN PROJECTS
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enterprise software engineers based in Bhilwara HQ. We build mission-critical
                  platforms that drive commercial growth.
                </p>
              </div>

              {/* Article stats */}
              <div className="bg-slate-900/70 rounded-2xl border border-white/10 p-5 shadow-lg backdrop-blur-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
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
                        className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                      >
                        <span className="text-slate-400 text-xs flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-brand-cyan" /> {label}
                        </span>
                        <span className="font-semibold text-white text-xs">{value}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="bg-slate-900/70 rounded-2xl border border-white/10 p-5 shadow-lg backdrop-blur-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Indexed Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/blog?search=${encodeURIComponent(tag)}`}
                        className="text-[10px] font-semibold bg-white/[0.04] hover:bg-brand-cyan hover:text-slate-950 text-slate-300 border border-white/10 px-2.5 py-1 rounded-lg transition-all"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Consultation CTA */}
              <div className="relative bg-gradient-to-br from-blue-950/70 via-slate-900/90 to-cyan-950/70 rounded-2xl p-5 border border-brand-cyan/25 text-white shadow-xl overflow-hidden backdrop-blur-xl">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mb-3 text-brand-cyan">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading font-bold text-sm mb-1.5 leading-snug text-white">
                    Need Custom Software?
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed mb-4">
                    High-performance web apps, custom ERPs, and cloud modernization for enterprise
                    leaders.
                  </p>
                  <Link
                    to="/contact"
                    className="block w-full text-center bg-brand-cyan hover:bg-brand-cyan-light text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-950/50"
                  >
                    Request Project Consultation
                  </Link>
                </div>
              </div>

              {/* Browse more */}
              <Link
                to="/blog"
                className="flex items-center gap-2 text-xs text-brand-cyan font-bold hover:gap-3 transition-all group px-1 uppercase tracking-wider"
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
        <section className="py-16 bg-[#03091e] border-t border-white/10">
          <Container>
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-xs font-bold text-brand-cyan uppercase tracking-widest mb-1">
                  Further Reading
                </p>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                  Related Insights
                </h2>
              </div>
              <Link
                to="/blog"
                className="shrink-0 text-xs font-bold text-brand-cyan flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-wider"
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

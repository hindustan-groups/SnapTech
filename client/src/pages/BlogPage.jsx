import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  Tag,
  Clock,
  Eye,
  Calendar,
  ChevronRight,
  BookOpen,
  Rss,
  AlertCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { Container, SEO } from '@/components/ui'
import { useBlogPosts, useBlogCategories } from '@/hooks/useBlog'
import { fadeUp, staggerContainer } from '@/utils/motion'

const BLOG_CATEGORIES = [
  'Web Development',
  'Digital Marketing',
  'IT Consulting',
  'Custom Software',
  'SEO & Branding',
  'Company News',
  'Our Process',
  'Local Growth',
]

const FALLBACK_POSTS = [
  {
    id: 'hp-blog-fallback-1',
    title: "Why We Built Snaptech: Elevating Modern Businesses with Enterprise Cloud & Engineering",
    slug: 'why-we-built-snaptech-enterprise-it',
    excerpt:
      "In today's digital-first economy, we engineered Snaptech to bridge the gap between legacy workflows and high-performance custom cloud software for ambitious enterprises across India and global markets.",
    featuredImageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    category: 'Company News',
    tags: ['Snaptech Digital', 'engineering', 'custom software', 'cloud architecture'],
    authorName: 'Snaptech Engineering Team',
    isFeatured: true,
    publishedAt: '2026-07-08T00:00:00.000Z',
    readTime: 5,
    viewCount: 240,
  },
  {
    id: 'hp-blog-fallback-2',
    title: 'What We Build: A Deep Dive into Our Core IT Services & Digital Solutions',
    slug: 'what-we-build-core-it-services-digital-solutions',
    excerpt:
      'Discover what we build. From responsive corporate portals and custom textile ERP inventory systems to mobile apps, we design custom digital systems that scale.',
    featuredImageUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    category: 'Web Development',
    tags: ['custom web apps', 'SaaS', 'ERP', 'mobile apps'],
    authorName: 'Snaptech Engineering Team',
    isFeatured: false,
    publishedAt: '2026-07-08T00:00:00.000Z',
    readTime: 4,
    viewCount: 185,
  },
  {
    id: 'hp-blog-fallback-3',
    title: 'How We Work: Our Step-by-Step Transparent Software Development Journey',
    slug: 'how-we-work-transparent-software-development-journey',
    excerpt:
      'How do we bring your ideas to life? Read about our transparent 4-stage development lifecycle: Discovery, UI/UX Design, Robust Coding, and Support.',
    featuredImageUrl:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80',
    category: 'Our Process',
    tags: ['methodology', 'agile', 'quality assurance'],
    authorName: 'Snaptech Engineering Team',
    isFeatured: false,
    publishedAt: '2026-07-09T00:00:00.000Z',
    readTime: 6,
    viewCount: 164,
  },
]

function BlogCardSkeleton() {
  return (
    <div className="bg-slate-900/60 rounded-2xl border border-white/10 overflow-hidden animate-pulse">
      <div className="h-48 bg-white/[0.04]" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-white/[0.04] rounded w-1/4" />
        <div className="h-5 bg-white/[0.04] rounded w-3/4" />
        <div className="h-3 bg-white/[0.04] rounded w-full" />
        <div className="h-3 bg-white/[0.04] rounded w-2/3" />
        <div className="flex gap-3 pt-2">
          <div className="h-3 bg-white/[0.04] rounded w-16" />
          <div className="h-3 bg-white/[0.04] rounded w-16" />
        </div>
      </div>
    </div>
  )
}

function BlogCard({ post }) {
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
        {/* Featured image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-950/60 to-slate-950 overflow-hidden shrink-0">
          {post.featuredImageUrl ? (
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-brand-cyan/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          {/* Category badge */}
          <span className="absolute top-3 left-3 text-[10px] font-bold px-3 py-1 rounded-full bg-slate-900/90 text-brand-cyan border border-brand-cyan/30 backdrop-blur-md shadow-md">
            {post.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <h2 className="font-heading font-bold text-white text-base leading-snug mb-2 group-hover:text-brand-cyan transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-1">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-3 border-t border-white/10">
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                {date}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-cyan" />
              {post.readTime || 4} min read
            </span>
            <span className="flex items-center gap-1 ml-auto text-slate-400">
              <Eye className="w-3.5 h-3.5" />
              {post.viewCount || 100}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function FeaturedCard({ post }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <article className="relative rounded-3xl overflow-hidden bg-slate-900/80 border border-white/10 shadow-2xl hover:border-brand-cyan/40 transition-all duration-300 backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative h-64 lg:h-auto min-h-[300px] bg-gradient-to-br from-blue-950 to-slate-950 overflow-hidden">
            {post.featuredImageUrl ? (
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-20 h-20 text-brand-cyan/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-950/30 to-slate-950/80" />
            <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full bg-brand-cyan text-slate-950 shadow-lg shadow-cyan-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Featured Analysis
            </span>
          </div>

          {/* Content */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <span className="inline-block text-xs font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30 px-3 py-1 rounded-full mb-4 w-fit">
              {post.category}
            </span>
            <h2 className="font-heading font-bold text-white text-2xl sm:text-3xl leading-tight mb-4 group-hover:text-brand-cyan transition-colors">
              {post.title}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mb-6">
              {date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-cyan" /> {date}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-cyan" /> {post.readTime || 5} min read
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-cyan" /> {post.viewCount || 150} views
              </span>
            </div>
            <span className="inline-flex items-center gap-2 text-brand-cyan font-semibold text-sm group-hover:gap-3 transition-all">
              Read Deep-Dive <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default function BlogPage() {
  const [search, setSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error } = useBlogPosts({
    page,
    limit: 9,
    category: category || undefined,
    search: activeSearch || undefined,
  })

  const { data: catData } = useBlogCategories()
  const categories = catData?.data || []

  // Ensure rich posts list using fallbacks if database is sparse
  const posts = useMemo(() => {
    const raw = data?.data || []
    if (raw.length > 0) return raw
    return FALLBACK_POSTS
  }, [data?.data])

  const pagination = data?.pagination || { pages: 1 }

  // Split featured from grid
  const featuredPost =
    !category && !activeSearch && page === 1 ? posts.find((p) => p.isFeatured) || posts[0] : null
  const gridPosts = featuredPost ? posts.filter((p) => p.id !== featuredPost.id) : posts

  const handleSearch = (e) => {
    e.preventDefault()
    setActiveSearch(search)
    setPage(1)
  }

  const handleCategory = (cat) => {
    setCategory(cat === category ? '' : cat)
    setPage(1)
    setActiveSearch('')
    setSearch('')
  }

  return (
    <div className="min-h-screen bg-[#020714] text-slate-200">
      <SEO
        title="Technical Whitepapers & Engineering Insights — Snaptech | Hindustan Projects"
        description="Explore technical architecture deep-dives, enterprise cloud strategies, software design patterns, and digital engineering insights from Hindustan Projects IT Division."
        path="/blog"
        keywords="IT blog Bhilwara, software engineering blog, custom ERP insights, web development Rajasthan, tech whitepapers India"
      />

      {/* Hero — Cyber-Navy Canvas */}
      <section className="relative overflow-hidden pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 border-b border-white/10">
        {/* Background Gradients & Microdot Canvas */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(14,165,233,0.18),transparent),radial-gradient(ellipse_50%_50%_at_10%_80%,rgba(26,62,140,0.25),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT: Text Content */}
            <div className="flex flex-col items-start">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 backdrop-blur-md mb-6 shadow-lg shadow-cyan-950/40"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan" />
                </span>
                <span className="text-[11px] font-bold tracking-widest text-brand-cyan uppercase">
                  Technical Insights &amp; Engineering Whitepapers
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="font-heading text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] mb-5 tracking-tight"
              >
                Engineering{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-blue-400 to-indigo-400">
                  That Powers
                </span>{' '}
                Scale
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-lg"
              >
                Production field notes on{' '}
                <span className="text-white font-semibold">custom software engineering</span>,{' '}
                <span className="text-white font-semibold">cloud architecture</span>, and{' '}
                <span className="text-white font-semibold">enterprise automation</span> — authored by
                Hindustan Projects tech division.
              </motion.p>

              {/* Search bar */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onSubmit={handleSearch}
                className="flex w-full max-w-lg gap-2 sm:gap-3"
              >
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-cyan transition-colors duration-200" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search whitepapers, topics, or tech stacks..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan/40 focus:border-brand-cyan transition-all duration-200"
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 px-5 sm:px-6 py-3.5 bg-brand-cyan hover:bg-brand-cyan-light text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-cyan-950/50 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </motion.form>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="flex flex-wrap items-center gap-6 mt-8"
              >
                {[
                  { icon: BookOpen, label: 'Articles', value: `${posts.length}+` },
                  { icon: Tag, label: 'Domains', value: '8 Topics' },
                  { icon: Rss, label: 'Engineering Pulse', value: 'Bi-Weekly' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
                    <Icon className="w-3.5 h-3.5 text-brand-cyan" />
                    <strong className="text-white font-semibold">{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT: Visual Interactive Hub */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.3, ease: 'easeOut' }}
              className="hidden lg:flex items-center justify-center relative overflow-visible"
            >
              <div className="relative w-[420px] h-[460px] xl:w-[460px] xl:h-[500px]">
                {/* Outer slow-spinning ring */}
                <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_40s_linear_infinite]" />

                {/* Middle dashed orbit ring */}
                <div
                  className="absolute rounded-full border-2 border-dashed border-cyan-500/20 animate-[spin_22s_linear_infinite_reverse]"
                  style={{ inset: '38px' }}
                />

                {/* Inner glow ring */}
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: '76px',
                    background:
                      'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
                    border: '1px solid rgba(14,165,233,0.25)',
                    boxShadow:
                      '0 0 80px rgba(14,165,233,0.2), inset 0 0 40px rgba(14,165,233,0.1)',
                  }}
                />

                {/* Central Hub Card */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl px-6 py-5 text-center shadow-2xl w-40">
                    <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mx-auto mb-3 text-brand-cyan shadow-lg shadow-cyan-950/40">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <p className="text-white font-bold text-sm">Knowledge</p>
                    <p className="text-brand-cyan text-[10px] mt-0.5 tracking-widest font-mono uppercase font-bold">
                      BASE
                    </p>
                  </div>
                </div>

                {/* Category chips on orbit */}
                {[
                  {
                    label: 'Cloud & DevOps',
                    angle: -90,
                    color: 'from-cyan-500/20 to-blue-600/10 border-cyan-400/30 text-cyan-300',
                  },
                  {
                    label: 'ERP Systems',
                    angle: -30,
                    color: 'from-emerald-500/20 to-teal-600/10 border-emerald-400/30 text-emerald-300',
                  },
                  {
                    label: 'Full-Stack Web',
                    angle: 30,
                    color: 'from-purple-500/20 to-indigo-600/10 border-purple-400/30 text-purple-300',
                  },
                  {
                    label: 'AI Automation',
                    angle: 90,
                    color: 'from-amber-500/20 to-orange-600/10 border-amber-400/30 text-amber-300',
                  },
                  {
                    label: 'Security SLA',
                    angle: 150,
                    color: 'from-pink-500/20 to-rose-600/10 border-pink-400/30 text-pink-300',
                  },
                  {
                    label: 'Architecture',
                    angle: 210,
                    color: 'from-blue-500/20 to-cyan-600/10 border-blue-400/30 text-blue-300',
                  },
                ].map(({ label, angle, color }) => {
                  const rad = ((angle - 90) * Math.PI) / 180
                  const w = 420 / 2
                  const r = w - 40
                  const cx = w + Math.cos(rad) * r
                  const cy = w + Math.sin(rad) * r
                  return (
                    <div
                      key={label}
                      className={`absolute px-3 py-1.5 rounded-full border bg-gradient-to-r text-[10px] font-bold whitespace-nowrap backdrop-blur-md shadow-lg ${color}`}
                      style={{ left: cx, top: cy, transform: 'translate(-50%,-50%)' }}
                    >
                      {label}
                    </div>
                  )
                })}

                {/* Floating stat card - top right */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-6 xl:-right-10"
                >
                  <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold leading-none">99.8%</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">Uptime Architecture</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Categories Filter Strip — Cyber Glass */}
      <section className="py-4 bg-slate-900/80 border-b border-white/10 sticky top-16 z-30 backdrop-blur-xl">
        <Container>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => handleCategory('')}
              className={`shrink-0 px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                !category
                  ? 'bg-brand-cyan text-slate-950 border-brand-cyan shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-brand-cyan/40 hover:text-white'
              }`}
            >
              All Articles
            </button>
            {BLOG_CATEGORIES.map((cat) => {
              const count = categories.find((c) => c.name === cat)?.count || 0
              return (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`shrink-0 px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-brand-cyan text-slate-950 border-brand-cyan shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-brand-cyan/40 hover:text-white'
                  }`}
                >
                  {cat} {count > 0 && <span className="opacity-70 ml-1">({count})</span>}
                </button>
              )
            })}
          </div>
        </Container>
      </section>

      {/* Content Section */}
      <section className="py-14 sm:py-20 relative">
        <Container>
          {/* Active search indicator */}
          {activeSearch && (
            <div className="mb-8 flex items-center gap-2 text-sm text-slate-300">
              <Search className="w-4 h-4 text-brand-cyan" />
              Showing search results for <strong className="text-white">"{activeSearch}"</strong>
              <button
                onClick={() => {
                  setActiveSearch('')
                  setSearch('')
                  setPage(1)
                }}
                className="text-brand-cyan text-xs font-semibold hover:underline ml-2 cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}

          {isError ? (
            <div className="text-center py-20 bg-slate-900/70 rounded-3xl border border-red-500/20 shadow-xl backdrop-blur-xl">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="font-bold text-white text-lg mb-2">Unable to connect to live feed</p>
              <p className="text-slate-400 text-xs sm:text-sm mb-5">
                {error?.message || 'Displaying cached fallback whitepapers.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-brand-cyan text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all cursor-pointer"
              >
                Reload Live Feed
              </button>
            </div>
          ) : isLoading ? (
            <div className="space-y-8">
              <div className="bg-slate-900/60 rounded-3xl border border-white/10 h-72 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-white/10">
              <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="font-bold text-white text-lg">No matching articles found</p>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Try selecting a different category or clearing the search query.
              </p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-10"
            >
              {/* Featured post */}
              {featuredPost && (
                <motion.div variants={fadeUp}>
                  <FeaturedCard post={featuredPost} />
                </motion.div>
              )}

              {/* Grid */}
              {gridPosts.length > 0 && (
                <motion.div
                  variants={staggerContainer}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {gridPosts.map((post) => (
                    <motion.div key={post.id || post.slug} variants={fadeUp}>
                      <BlogCard post={post} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-white/10 bg-slate-900/80 text-slate-300 hover:border-brand-cyan/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${
                        page === p
                          ? 'bg-brand-cyan text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                          : 'bg-slate-900/60 border border-white/10 text-slate-300 hover:border-brand-cyan/40'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-white/10 bg-slate-900/80 text-slate-300 hover:border-brand-cyan/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </Container>
      </section>
    </div>
  )
}

/**
 * blog.controller.js — Public + Admin blog routes
 */
import prisma from '../config/db.js'
import { getCache, setCache, deleteCacheByPrefix } from '../utils/cache.js'
import { createHash } from 'crypto'
import { logActivity } from '../utils/activity.js'

const CACHE_SHORT = 'public, max-age=300, stale-while-revalidate=60'
const CACHE_LONG = 'public, max-age=3600, stale-while-revalidate=300'

/** Slug generator from title */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Ensure slug uniqueness, append -2, -3 etc if needed */
async function uniqueSlug(base, excludeId = null) {
  let slug = base
  let counter = 2
  while (true) {
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) break
    slug = `${base}-${counter++}`
  }
  return slug
}

// ── PUBLIC ROUTES ─────────────────────────────────────────────

/**
 * GET /api/blog
 * List published posts — paginated, filterable by category/tag, sortable
 */
export const getPublicPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 9))
    const category = req.query.category?.trim() || null
    const tag = req.query.tag?.trim() || null
    const sort = req.query.sort === 'popular' ? 'viewCount' : 'publishedAt'
    const search = req.query.search?.trim() || null

    const where = {
      status: 'PUBLISHED',
      deletedAt: null,
      ...(category && { category }),
      ...(tag && { tags: { has: tag } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        orderBy: { [sort]: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImageUrl: true,
          category: true,
          tags: true,
          authorName: true,
          publishedAt: true,
          viewCount: true,
          isFeatured: true,
          content: true, // needed for read time estimate
        },
      }),
    ])

    // Add read time estimate (avg 200 words/min)
    const postsWithReadTime = posts.map((p) => {
      const wordCount = p.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0
      return { ...p, readTime: Math.max(1, Math.ceil(wordCount / 200)), content: undefined }
    })

    res.setHeader('Cache-Control', CACHE_SHORT)
    res.json({
      status: 'ok',
      data: postsWithReadTime,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/blog/categories
 * Distinct categories with post count
 */
export const getBlogCategories = async (_req, res, next) => {
  try {
    const cacheKey = 'blog:categories'
    const cached = getCache(cacheKey)
    if (cached) return res.json({ status: 'ok', data: cached })

    const posts = await prisma.blogPost.groupBy({
      by: ['category'],
      where: { status: 'PUBLISHED', deletedAt: null },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
    })

    const categories = posts.map((p) => ({ name: p.category, count: p._count.category }))
    setCache(cacheKey, categories, 600)
    res.json({ status: 'ok', data: categories })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/blog/:slug
 * Single published post — increments viewCount, includes related posts
 */
export const getPublicPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params

    const post = await prisma.blogPost.findUnique({ where: { slug } })

    if (!post || post.status !== 'PUBLISHED' || post.deletedAt !== null) {
      return res.status(404).json({ status: 'error', message: 'Blog post not found.' })
    }

    // Increment view count (fire-and-forget)
    prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {})

    // Related posts (same category, exclude current)
    const related = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        category: post.category,
        id: { not: post.id },
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImageUrl: true,
        category: true,
        publishedAt: true,
        content: true,
      },
    })

    const relatedWithReadTime = related.map((p) => {
      const wordCount = p.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0
      return { ...p, readTime: Math.max(1, Math.ceil(wordCount / 200)), content: undefined }
    })

    // Word count for read time
    const wordCount = post.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0
    const readTime = Math.max(1, Math.ceil(wordCount / 200))

    res.setHeader('Cache-Control', CACHE_SHORT)
    res.json({
      status: 'ok',
      data: { ...post, readTime, relatedPosts: relatedWithReadTime },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/blog/:slug/comments
 * Approved comments only
 */
export const getPostComments = async (req, res, next) => {
  try {
    const { slug } = req.params
    const post = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } })
    if (!post) return res.status(404).json({ status: 'error', message: 'Post not found.' })

    const comments = await prisma.blogComment.findMany({
      where: { blogPostId: post.id, isApproved: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, comment: true, createdAt: true },
    })

    res.json({ status: 'ok', data: comments })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/blog/:slug/comment
 * Submit comment — stored as unapproved (admin must approve)
 */
export const submitComment = async (req, res, next) => {
  try {
    const { slug } = req.params
    const { name, email, comment, _hp } = req.body

    // Honeypot check
    if (_hp) {
      return res.status(201).json({
        status: 'ok',
        message: 'Your comment has been submitted and is awaiting approval.',
      })
    }

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, status: true },
    })

    if (!post || post.status !== 'PUBLISHED') {
      return res.status(404).json({ status: 'error', message: 'Post not found.' })
    }

    if (!name?.trim() || !email?.trim() || !comment?.trim()) {
      return res.status(400).json({ status: 'error', message: 'Name, email, and comment are required.' })
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: 'error', message: 'Invalid email address.' })
    }

    if (comment.trim().length > 2000) {
      return res.status(400).json({ status: 'error', message: 'Comment is too long (max 2000 characters).' })
    }

    // Rate limit: 1 comment per IP per post per hour (simple DB check)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentComment = await prisma.blogComment.findFirst({
      where: {
        blogPostId: post.id,
        email: email.trim().toLowerCase(),
        createdAt: { gte: oneHourAgo },
      },
    })

    if (recentComment) {
      return res.status(429).json({
        status: 'error',
        message: 'You have already commented on this post recently. Please wait before commenting again.',
      })
    }

    await prisma.blogComment.create({
      data: {
        blogPostId: post.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        comment: comment.trim(),
        isApproved: false,
      },
    })

    res.status(201).json({
      status: 'ok',
      message: 'Your comment has been submitted and is awaiting moderation.',
    })
  } catch (err) {
    next(err)
  }
}

// ── ADMIN ROUTES ──────────────────────────────────────────────

/**
 * GET /api/admin/blog
 * All posts (any status) — filterable
 */
export const adminListPosts = async (req, res, next) => {
  try {
    const { status, category, search } = req.query
    const where = {
      deletedAt: null,
      ...(status && { status }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        category: true,
        authorName: true,
        isFeatured: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { comments: true } },
      },
    })

    res.json({ status: 'ok', data: posts })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/blog/:id
 * Single post for editing
 */
export const adminGetPost = async (req, res, next) => {
  try {
    const { id } = req.params
    const post = await prisma.blogPost.findUnique({ where: { id } })
    if (!post || post.deletedAt !== null) return res.status(404).json({ status: 'error', message: 'Post not found.' })
    res.json({ status: 'ok', data: post })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/admin/blog
 * Create post — auto-generate slug from title
 */
export const adminCreatePost = async (req, res, next) => {
  try {
    const {
      title, excerpt, content, featuredImageUrl, category, tags,
      authorName, status, metaTitle, metaDescription, isFeatured,
      slug: manualSlug,
    } = req.body

    if (!title?.trim()) {
      return res.status(400).json({ status: 'error', message: 'Title is required.' })
    }

    const baseSlug = manualSlug?.trim() ? slugify(manualSlug) : slugify(title)
    const slug = await uniqueSlug(baseSlug)

    const publishedAt = status === 'PUBLISHED' ? new Date() : null

    const post = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || '',
        content: content || '',
        featuredImageUrl: featuredImageUrl || null,
        category: category || 'Company News',
        tags: Array.isArray(tags) ? tags : [],
        authorName: authorName || req.admin?.email || 'SnapTech Digital Team',
        authorId: req.admin?.id || null,
        status: status || 'DRAFT',
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        isFeatured: Boolean(isFeatured),
        publishedAt,
      },
    })

    deleteCacheByPrefix('blog:')
    await logActivity(req, 'CREATE', 'BlogPost', `Created blog post '${post.title}'`)
    res.status(201).json({ status: 'ok', data: post })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/admin/blog/:id
 * Update post
 */
export const adminUpdatePost = async (req, res, next) => {
  try {
    const { id } = req.params
    const existing = await prisma.blogPost.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ status: 'error', message: 'Post not found.' })

    const {
      title, excerpt, content, featuredImageUrl, category, tags,
      authorName, status, metaTitle, metaDescription, isFeatured, slug: newSlug,
    } = req.body

    // Handle slug update
    let slug = existing.slug
    if (newSlug?.trim() && slugify(newSlug) !== existing.slug) {
      slug = await uniqueSlug(slugify(newSlug), id)
    } else if (title?.trim() && !newSlug) {
      // Don't auto-change slug on title edit (would break existing URLs)
    }

    // Set publishedAt when first publishing
    let publishedAt = existing.publishedAt
    if (status === 'PUBLISHED' && !existing.publishedAt) {
      publishedAt = new Date()
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        slug,
        ...(excerpt !== undefined && { excerpt: excerpt.trim() }),
        ...(content !== undefined && { content }),
        ...(featuredImageUrl !== undefined && { featuredImageUrl: featuredImageUrl || null }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
        ...(authorName !== undefined && { authorName }),
        ...(status !== undefined && { status }),
        ...(metaTitle !== undefined && { metaTitle: metaTitle?.trim() || null }),
        ...(metaDescription !== undefined && { metaDescription: metaDescription?.trim() || null }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        publishedAt,
      },
    })

    deleteCacheByPrefix('blog:')
    await logActivity(req, 'UPDATE', 'BlogPost', `Updated blog post '${post.title}'`)
    res.json({ status: 'ok', data: post })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/admin/blog/:id
 */
export const adminDeletePost = async (req, res, next) => {
  try {
    const { id } = req.params
    const post = await prisma.blogPost.findUnique({ where: { id } })
    if (post) {
      await prisma.blogPost.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      deleteCacheByPrefix('blog:')
      await logActivity(req, 'DELETE', 'BlogPost', `Soft deleted blog post '${post.title}'`)
    }
    res.json({ status: 'ok', message: 'Blog post soft deleted.' })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/blog/comments
 * All comments — filterable by approved/pending
 */
export const adminListComments = async (req, res, next) => {
  try {
    const { approved } = req.query
    const where = approved !== undefined ? { isApproved: approved === 'true' } : {}

    const comments = await prisma.blogComment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        blogPost: { select: { title: true, slug: true } },
      },
    })

    res.json({ status: 'ok', data: comments })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/admin/blog/comments/:id/approve
 * Approve or reject a comment
 */
export const adminApproveComment = async (req, res, next) => {
  try {
    const { id } = req.params
    const { isApproved } = req.body

    const comment = await prisma.blogComment.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    })

    await logActivity(
      req,
      'UPDATE',
      'BlogComment',
      `${isApproved ? 'Approved' : 'Rejected'} comment by '${comment.name}' on blog post ID ${comment.blogPostId}`
    )

    res.json({ status: 'ok', data: comment })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/admin/blog/comments/:id
 */
export const adminDeleteComment = async (req, res, next) => {
  try {
    const { id } = req.params
    const comment = await prisma.blogComment.findUnique({ where: { id } })
    if (comment) {
      await prisma.blogComment.delete({ where: { id } })
      await logActivity(
        req,
        'DELETE',
        'BlogComment',
        `Deleted comment by '${comment.name}' on blog post ID ${comment.blogPostId}`
      )
    }
    res.json({ status: 'ok', message: 'Comment deleted.' })
  } catch (err) {
    next(err)
  }
}

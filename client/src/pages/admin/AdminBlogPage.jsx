/**
 * AdminBlogPage — Blog Posts Management + Editor
 */
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Pencil, Trash2, X, Check, Search, Eye, Star,
  Bold, Italic, List, Heading2, Link as LinkIcon, Image,
  ChevronDown, FileText, Globe, Archive, BookOpen,
  MessageSquare, Tag, AlertCircle, CheckCircle2, Save, Code,
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { api } from '@/utils/api'
import { SEO, ImageUploader } from '@/components/ui'
import DOMPurify from 'dompurify'

const BLOG_CATEGORIES = [
  'Web Development', 'Digital Marketing', 'IT Consulting',
  'Custom Software', 'SEO & Branding', 'Company News',
  'Our Process', 'Local Growth',
]

const STATUS_COLORS = {
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DRAFT: 'bg-amber-50 text-amber-700 border-amber-200',
  ARCHIVED: 'bg-gray-100 text-gray-500 border-gray-200',
}

const STATUS_ICONS = { PUBLISHED: Globe, DRAFT: FileText, ARCHIVED: Archive }

const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue transition-all'

// ── Simple WYSIWYG editor ──────────────────────────────────────
function RichEditor({ value, onChange, label }) {
  const editorRef = useRef(null)
  const [htmlMode, setHtmlMode] = useState(false)
  const isInitialized = useRef(false)

  // On first mount OR when switching to visual mode — load content into editor
  useEffect(() => {
    if (!htmlMode && editorRef.current) {
      const safe = DOMPurify.sanitize(value || '')
      // Always set on first mount (initial load), then only on mode switch
      if (!isInitialized.current || editorRef.current.dataset.syncing === 'true') {
        editorRef.current.innerHTML = safe
        isInitialized.current = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlMode])

  // When value changes externally (e.g. form reset / initial load after async fetch)
  // Only apply if editor is not focused (user not typing)
  useEffect(() => {
    if (!htmlMode && editorRef.current && document.activeElement !== editorRef.current) {
      const safe = DOMPurify.sanitize(value || '')
      if (editorRef.current.innerHTML !== safe) {
        editorRef.current.innerHTML = safe
      }
    }
  }, [value, htmlMode])

  const exec = (cmd, val = null) => {
    if (htmlMode) return
    document.execCommand(cmd, false, val)
    onChange(editorRef.current?.innerHTML || '')
  }

  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) exec('insertImage', url)
  }

  const insertLink = () => {
    const url = prompt('Enter URL (e.g. https://example.com):')
    if (url) exec('createLink', url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        {label && <label className="text-xs font-semibold text-gray-600 block">{label}</label>}
        <button
          type="button"
          onClick={() => setHtmlMode(!htmlMode)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all border ${
            htmlMode
              ? 'bg-brand-red text-white border-brand-red shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          {htmlMode ? 'Visual Editor' : 'Edit HTML'}
        </button>
      </div>
      <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue/25 focus-within:border-brand-blue transition-all">
        {/* Toolbar */}
        {!htmlMode && (
          <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
            <button
              type="button"
              onClick={() => exec('formatBlock', '<h2>')}
              title="Heading 2"
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors text-xs font-bold"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('formatBlock', '<h3>')}
              title="Heading 3"
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors text-xs font-bold"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => exec('formatBlock', '<p>')}
              title="Paragraph"
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors text-xs font-bold"
            >
              P
            </button>
            <div className="h-4 w-px bg-gray-300 mx-1" />
            <button
              type="button"
              onClick={() => exec('bold')}
              title="Bold"
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('italic')}
              title="Italic"
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-gray-300 mx-1" />
            <button type="button" onClick={() => exec('insertUnorderedList')} title="Bullet list"
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
              <List className="w-4 h-4" />
            </button>
            <button type="button" onClick={insertLink} title="Insert link"
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
              <LinkIcon className="w-4 h-4" />
            </button>
            <button type="button" onClick={insertImage} title="Insert image"
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
              <Image className="w-4 h-4" />
            </button>
          </div>
        )}

        {htmlMode ? (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-4 min-h-75 max-h-125 focus:outline-none font-mono text-xs bg-slate-900 text-slate-100 resize-none border-0 block"
            placeholder="Paste HTML code here..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={() => onChange(editorRef.current?.innerHTML || '')}
            onBlur={() => onChange(editorRef.current?.innerHTML || '')}
            className="p-4 min-h-75 max-h-125 overflow-y-auto focus:outline-none prose prose-slate max-w-none prose-sm prose-headings:font-heading prose-p:leading-relaxed"
          />
        )}
      </div>
    </div>
  )
}

// ── Fetch full post for editing ───────────────────────────────
function useAdminPostForEdit(id) {
  return useQuery({
    queryKey: ['admin-blog-post-edit', id],
    queryFn: () => api.get(`/admin/blog/${id}`),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

// ── Post Editor Form ──────────────────────────────────────────
function PostEditor({ postId, initial, onSave, onCancel, loading }) {
  // When editing, fetch full post data (list view only has partial data, no full content)
  const { data: fullPostData, isLoading: fetchingPost } = useAdminPostForEdit(postId)
  const fullPost = postId ? (fullPostData?.data || null) : null
  const editData = fullPost || initial

  const [seoOpen, setSeoOpen] = useState(false)
  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '', slug: '', excerpt: '', content: '',
      featuredImageUrl: '', category: 'Web Development',
      tags: '', authorName: 'SnapTech Digital',
      status: 'DRAFT', metaTitle: '', metaDescription: '',
      isFeatured: false,
    },
  })

  // Populate form when full post data loads (edit mode)
  useEffect(() => {
    if (editData) {
      reset({
        ...editData,
        tags: Array.isArray(editData.tags) ? editData.tags.join(', ') : (editData.tags || ''),
        isFeatured: Boolean(editData.isFeatured),
      })
    }
  }, [editData, reset])

  const title = watch('title')

  // Auto-generate slug from title when creating (not editing)
  useEffect(() => {
    if (!postId && title) {
      const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      setValue('slug', slug)
    }
  }, [title, postId, setValue])

  const onSubmit = (data) => {
    onSave({
      ...data,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      isFeatured: Boolean(data.isFeatured),
    })
  }

  // Show loading state while fetching full post
  if (postId && fetchingPost) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-brand-blue border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Loading post content...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Title *</label>
            <input {...register('title', { required: 'Title is required' })} className={inputCls} placeholder="e.g. Why Every Small Business Needs a Website in 2026" />
            {errors.title && <p className="text-xs text-brand-red mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title.message}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Slug (URL) *</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">/blog/</span>
              <input {...register('slug', { required: true })} className={`${inputCls} font-mono text-xs`} placeholder="why-every-business-needs-a-website" />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Excerpt *</label>
            <textarea rows={2} {...register('excerpt', { required: 'Excerpt is required' })} className={`${inputCls} resize-none`} placeholder="Short summary shown on blog listing page and used for SEO..." />
            {errors.excerpt && <p className="text-xs text-brand-red mt-1">{errors.excerpt.message}</p>}
          </div>

          {/* Rich text content */}
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichEditor label="Content *" value={field.value} onChange={field.onChange} />
            )}
          />

          {/* SEO Settings (collapsible) */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
            >
              <span className="flex items-center gap-2"><Tag className="w-4 h-4 text-gray-400" /> SEO Settings</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
            </button>
            {seoOpen && (
              <div className="p-4 space-y-4 border-t border-gray-200">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Meta Title <span className="text-gray-400 font-normal">(leave blank to use post title)</span></label>
                  <input {...register('metaTitle')} className={inputCls} placeholder="SEO optimized title..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Meta Description <span className="text-gray-400 font-normal">(leave blank to use excerpt)</span></label>
                  <textarea rows={2} {...register('metaDescription')} className={`${inputCls} resize-none`} placeholder="160 character description for search engines..." />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-600 block mb-2">Status</label>
            <select {...register('status')} className={inputCls}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Category */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-600 block mb-2">Category *</label>
            <select {...register('category')} className={inputCls}>
              {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Featured image */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <Controller
              name="featuredImageUrl"
              control={control}
              render={({ field }) => (
                <ImageUploader label="Featured Image" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {/* Author */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-600 block mb-2">Author Name</label>
            <input {...register('authorName')} className={inputCls} placeholder="SnapTech Digital" />
          </div>

          {/* Tags */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="text-xs font-semibold text-gray-600 block mb-2">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input {...register('tags')} className={inputCls} placeholder="web, react, SEO, digital-marketing" />
            <p className="text-[10px] text-gray-400 mt-1.5">Separate tags with commas. Spaces will be trimmed.</p>
          </div>

          {/* Featured toggle */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue/25" />
              <div>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-500" /> Featured Post
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Show at top of blog listing page</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-brand-blue text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition-all disabled:opacity-60">
          <Save className="w-4 h-4" /> {loading ? 'Saving…' : 'Save Post'}
        </button>
        <button type="button" onClick={onCancel}
          className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </form>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminBlogPage() {
  const [view, setView] = useState('list') // 'list' | 'new' | 'edit'
  const [editing, setEditing] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [saveStatus, setSaveStatus] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-blog-posts', { status: statusFilter, search: searchTerm }],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (searchTerm) params.set('search', searchTerm)
      return api.get(`/admin/blog${params.toString() ? `?${params}` : ''}`)
    },
  })

  const posts = data?.data || []

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/blog', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] })
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['blog-categories'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      setSaveStatus({ ok: true, msg: 'Post created successfully.' })
      setView('list')
      setTimeout(() => setSaveStatus(null), 4000)
    },
    onError: (err) => setSaveStatus({ ok: false, msg: err.message }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/admin/blog/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] })
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['blog-categories'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      setSaveStatus({ ok: true, msg: 'Post updated successfully.' })
      setView('list')
      setEditing(null)
      setTimeout(() => setSaveStatus(null), 4000)
    },
    onError: (err) => setSaveStatus({ ok: false, msg: err.message }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/blog/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] })
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      qc.invalidateQueries({ queryKey: ['blog-categories'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const handleNew = () => { setEditing(null); setView('new'); setSaveStatus(null) }
  const handleEdit = (post) => { setEditing(post); setView('edit'); setSaveStatus(null) }
  const handleCancel = () => { setView('list'); setEditing(null); setSaveStatus(null) }

  if (view === 'new' || view === 'edit') {
    return (
      <>
        <SEO title={view === 'new' ? 'New Blog Post' : 'Edit Blog Post'} noIndex />
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={handleCancel} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h1 className="font-heading text-2xl font-bold text-gray-900">
              {view === 'new' ? 'New Blog Post' : `Edit: ${editing?.title}`}
            </h1>
          </div>

          {saveStatus && (
            <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 border ${saveStatus.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-brand-red border-red-200'}`}>
              {saveStatus.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {saveStatus.msg}
            </div>
          )}

          {view === 'new' ? (
            <PostEditor
              onSave={(data) => createMutation.mutate(data)}
              onCancel={handleCancel}
              loading={createMutation.isPending}
            />
          ) : (
            <PostEditor
              postId={editing?.id}
              initial={editing}
              onSave={(data) => updateMutation.mutate({ id: editing.id, ...data })}
              onCancel={handleCancel}
              loading={updateMutation.isPending}
            />
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <SEO title="Blog Posts" noIndex />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900">Blog Posts</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage articles, publish new posts, and track views.</p>
            </div>
          </div>
          <button onClick={handleNew}
            className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition-all shrink-0">
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>

        {/* Save status toast */}
        {saveStatus && (
          <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 border ${saveStatus.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-brand-red border-red-200'}`}>
            {saveStatus.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {saveStatus.msg}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search posts..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue transition-all" />
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl border border-gray-150 shrink-0">
            {['', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${statusFilter === s ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Failed to load blog posts</p>
              <p className="text-red-600 text-xs mt-0.5">Please check your connection and try again.</p>
            </div>
          </div>
        )}

        {/* Posts table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-14">
              <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No posts found. Create your first blog post!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-150">
                    <th className="px-5 py-3.5">Title</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Views</th>
                    <th className="px-5 py-3.5">Comments</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map((post) => {
                    const StatusIcon = STATUS_ICONS[post.status] || FileText
                    return (
                      <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 max-w-70">
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 line-clamp-1">{post.title}</p>
                              <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">/{post.slug}</p>
                            </div>
                            {post.isFeatured && (
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0 mt-0.5" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{post.category}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${STATUS_COLORS[post.status]}`}>
                            <StatusIcon className="w-3 h-3" />
                            {post.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Eye className="w-3.5 h-3.5" /> {post.viewCount}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MessageSquare className="w-3.5 h-3.5" /> {post._count?.comments || 0}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(post.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 justify-end">
                            {post.status === 'PUBLISHED' && (
                              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-brand-blue/8 transition-all" title="View live">
                                <Eye className="w-4 h-4" />
                              </a>
                            )}
                            <button onClick={() => handleEdit(post)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-brand-blue/8 transition-all">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => { if (window.confirm('Delete this post and all its comments?')) deleteMutation.mutate(post.id) }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

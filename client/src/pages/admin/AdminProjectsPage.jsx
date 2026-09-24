/**
 * Admin Projects — Advanced CRUD for Portfolio & Case Studies
 * Supports multi-image screenshot gallery, verified impact metrics, challenge/solution narratives,
 * core deliverables, and interactive tech stack pills.
 */
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Star,
  FolderOpen,
  ImageIcon,
  Search,
  ExternalLink,
  Upload,
  Loader2,
  TrendingUp,
  Clock,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Eye,
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { api } from '@/utils/api'
import { SEO, ImageUploader } from '@/components/ui'

const CATEGORIES = ['Web', 'App', 'Marketing', 'Branding', 'Software']

const CATEGORY_COLORS = {
  Web: 'bg-blue-50 text-blue-700 border-blue-200',
  App: 'bg-amber-50 text-amber-700 border-amber-200',
  Marketing: 'bg-rose-50 text-rose-700 border-rose-200',
  Branding: 'bg-purple-50 text-purple-700 border-purple-200',
  Software: 'bg-teal-50 text-teal-700 border-teal-200',
}

const POPULAR_TECHS = [
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Docker',
  'AWS',
  'Tailwind CSS',
  'React Native',
  'Flutter',
  'TypeScript',
  'Python',
  'Figma Tokens',
]

const inputCls =
  'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue transition-all'

/* ── Multi-image Gallery Manager ───────────────────────────────── */
function GalleryImagesManager({ images = [], onChange }) {
  const [newUrl, setNewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleAddUrl = (e) => {
    e?.preventDefault()
    if (!newUrl.trim()) return
    if (!images.includes(newUrl.trim())) {
      onChange([...images, newUrl.trim()])
    }
    setNewUrl('')
  }

  const handleRemove = (idx) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large (Max 5MB)')
      return
    }

    setError('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const BASE = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${BASE}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Upload failed')
      if (json.data?.url) {
        onChange([...images, json.data.url])
      }
    } catch (err) {
      setError(err.message || 'Upload failed. Try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 block">
          Gallery Screenshots ({images.length})
        </label>
        <span className="text-[11px] text-gray-400">UI / Desktop / Mobile views</span>
      </div>

      {/* Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-2xl">
          {images.map((img, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white aspect-4/3 shadow-xs">
              <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500 text-white opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-md cursor-pointer"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-1 left-1.5 text-[9px] font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded text-white">
                #{idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button & Paste URL bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-brand-blue/50 bg-brand-blue/5 hover:bg-brand-blue/10 text-brand-blue text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Screenshot</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="flex-1 flex gap-1.5">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Or paste screenshot image URL..."
            className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddUrl()
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Add URL
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

/* ── Project Form Component ─────────────────────────────────────── */
function ProjectForm({ initial, onSave, onCancel, loading }) {
  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: initial ?? {
      title: '',
      slug: '',
      clientName: '',
      description: '',
      thumbnailUrl: '',
      images: [],
      technologies: '',
      category: 'Web',
      isFeatured: false,
      liveUrl: '',
      result: '',
      duration: '',
      challenge: '',
      solution: '',
      features: '',
    },
  })

  const currentTitle = watch('title')
  const currentSlug = watch('slug')
  const currentTechs = watch('technologies') || ''

  // Auto-slug generator helper
  const handleAutoSlug = () => {
    if (!currentTitle) return
    const generated = currentTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setValue('slug', generated)
  }

  // Toggle quick tech pill
  const toggleTech = (tech) => {
    const list = currentTechs
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (list.includes(tech)) {
      setValue('technologies', list.filter((t) => t !== tech).join(', '))
    } else {
      setValue('technologies', [...list, tech].join(', '))
    }
  }

  const onSubmit = (data) => {
    onSave({
      ...data,
      technologies: data.technologies
        ? data.technologies
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      features: data.features
        ? data.features
            .split('\n')
            .map((f) => f.trim())
            .filter(Boolean)
        : [],
      isFeatured: Boolean(data.isFeatured),
      images: Array.isArray(data.images) ? data.images : [],
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── 1. Basic Information ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-brand-blue" />
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            General Information
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title', { required: true })}
              className={inputCls}
              placeholder="e.g. Enterprise Commerce Architecture"
              onBlur={() => {
                if (!currentSlug && currentTitle) handleAutoSlug()
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">
                Slug <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoSlug}
                className="text-[10px] text-brand-blue font-bold hover:underline cursor-pointer"
              >
                Auto-generate
              </button>
            </div>
            <input
              {...register('slug', { required: true })}
              placeholder="enterprise-commerce-architecture"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('clientName', { required: true })}
              className={inputCls}
              placeholder="e.g. Major Retail Chain, Rajasthan"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Category</label>
            <select {...register('category')} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Turnaround / Duration
            </label>
            <input
              {...register('duration')}
              placeholder="e.g. 8 Weeks Delivery, 4 Weeks Sprint"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Live Platform URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              {...register('liveUrl')}
              placeholder="https://example.com"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── 2. Impact & Performance Metric ── */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
        <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Verified Production Impact / ROI Metric
        </label>
        <p className="text-[11px] text-emerald-700 mb-2">
          Displayed prominently as a verified telemetry stat (e.g., "3.4× Conversion Growth in 60 Days", "42% Downtime Reduction").
        </p>
        <input
          {...register('result')}
          placeholder="e.g. 3.4× Conversion Growth in 60 Days"
          className={`${inputCls} bg-white border-emerald-300 focus:ring-emerald-400/25 focus:border-emerald-600`}
        />
      </div>

      {/* ── 3. Tech Stack Chips ── */}
      <div className="border-t border-gray-100 pt-4">
        <label className="text-xs font-semibold text-gray-700 block mb-1">
          Technology Stack <span className="text-gray-400 font-normal">(comma separated or click pills below)</span>
        </label>
        <input
          {...register('technologies')}
          placeholder="React, Node.js, PostgreSQL, Redis, AWS"
          className={inputCls}
        />
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {POPULAR_TECHS.map((tech) => {
            const isSelected = currentTechs
              .split(',')
              .map((t) => t.trim())
              .includes(tech)
            return (
              <button
                key={tech}
                type="button"
                onClick={() => toggleTech(tech)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-blue text-white border-brand-blue font-bold shadow-2xs'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {isSelected ? `✓ ${tech}` : `+ ${tech}`}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 4. Architectural Case Study Details ── */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-brand-blue" />
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Case Study Architecture &amp; Deliverables
          </h4>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Executive Summary / Narrative <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            {...register('description', { required: true })}
            placeholder="Comprehensive description of the client deliverable and technical scope..."
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Operational Challenge / Problem Statement
            </label>
            <textarea
              rows={3}
              {...register('challenge')}
              placeholder="What bottlenecks, legacy bugs, or speed limits did the client face?"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Engineering Architecture &amp; Solution
            </label>
            <textarea
              rows={3}
              {...register('solution')}
              placeholder="How did our engineering team design and implement the system?"
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Key Deliverables &amp; Milestones <span className="text-gray-400 font-normal">(one per line)</span>
          </label>
          <textarea
            rows={3}
            {...register('features')}
            placeholder="Sub-second checkout flow with Razorpay auto-failover&#10;Multi-warehouse automated inventory reconciliation&#10;Real-time telemetry dashboard with revenue analytics"
            className={`${inputCls} resize-none font-mono text-xs`}
          />
        </div>
      </div>

      {/* ── 5. Thumbnail & Gallery Screenshots ── */}
      <div className="border-t border-gray-100 pt-4 space-y-5">
        <Controller
          name="thumbnailUrl"
          control={control}
          render={({ field }) => (
            <ImageUploader label="Main Cover Thumbnail" value={field.value} onChange={field.onChange} />
          )}
        />

        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <GalleryImagesManager images={field.value || []} onChange={field.onChange} />
          )}
        />
      </div>

      {/* ── 6. Options & Actions ── */}
      <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="isFeatured"
            {...register('isFeatured')}
            className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue/25 cursor-pointer"
          />
          <label
            htmlFor="isFeatured"
            className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1.5"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            Showcase as Flagship Featured Project
          </label>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Save Project
          </button>
        </div>
      </div>
    </form>
  )
}

/* ── Main Admin Projects Page ───────────────────────────────────── */
export default function AdminProjectsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const qc = useQueryClient()

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => api.get('/admin/projects').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/projects', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/admin/projects/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.technologies?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !categoryFilter || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <SEO title="Projects & Case Studies Management" noIndex />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-blue/10 flex items-center justify-center shrink-0">
              <FolderOpen className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900">
                Projects &amp; Case Studies
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Manage your public portfolio deliverables, architectural deep-dives, screenshots, and metrics.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditing(null)
            }}
            className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Project
          </button>
        </div>

        {/* Modal Dialog for Add / Edit */}
        {(showForm || editing) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
            />
            {/* Modal Box */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl relative w-full max-w-3xl my-auto max-h-[92vh] overflow-y-auto z-10 p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="font-heading text-xl font-bold text-gray-900">
                    {editing ? `Edit Project: ${editing.title}` : 'Add New Portfolio Project'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Data will reflect live across the homepage and /portfolio/:slug.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                  }}
                  className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ProjectForm
                initial={
                  editing
                    ? {
                        ...editing,
                        technologies: editing.technologies?.join(', ') || '',
                        features: editing.features?.join('\n') || '',
                      }
                    : null
                }
                onSave={(data) => {
                  if (editing) {
                    updateMutation.mutate({ id: editing.id, ...data })
                  } else {
                    createMutation.mutate(data)
                  }
                }}
                onCancel={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
                loading={editing ? updateMutation.isPending : createMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by title, client, or technology..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue transition-all"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue cursor-pointer"
            >
              <option value="">All Categories ({projects.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c} ({projects.filter((p) => p.category === c).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 animate-pulse shadow-xs"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))
          ) : projects.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl py-16 flex flex-col items-center gap-3 text-center shadow-xs">
              <FolderOpen className="w-12 h-12 text-gray-300" />
              <p className="font-bold text-gray-800 text-lg">No projects added yet</p>
              <p className="text-sm text-gray-500 max-w-sm">
                Add your first engineering case study to showcase your solutions to prospective clients.
              </p>
              <button
                onClick={() => {
                  setShowForm(true)
                  setEditing(null)
                }}
                className="mt-2 inline-flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-brand-blue-dark transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add First Project
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl py-16 flex flex-col items-center gap-2 text-center text-gray-400 text-sm shadow-xs">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-1" />
              <p className="font-semibold text-gray-700">No matching projects found</p>
              <p className="text-xs text-gray-400">Try adjusting your search criteria or category filter.</p>
            </div>
          ) : (
            filteredProjects.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-gray-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-brand-blue/40 transition-all overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Thumbnail & Main Info */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    {/* Thumbnail image */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-100">
                      {p.thumbnailUrl ? (
                        <img
                          src={p.thumbnailUrl}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <ImageIcon className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-heading font-bold text-gray-900 text-base">
                          {p.title}
                        </span>
                        {p.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Featured
                          </span>
                        )}
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                            CATEGORY_COLORS[p.category] || 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {p.category}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 font-medium mb-1.5 flex items-center gap-2">
                        <span>{p.clientName}</span>
                        {p.duration && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-brand-blue" />
                              {p.duration}
                            </span>
                          </>
                        )}
                      </p>

                      {/* Verified Result Badge */}
                      {p.result && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-2">
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                          <span>{p.result}</span>
                        </div>
                      )}

                      {/* Tech Chips */}
                      {p.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {p.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-200 font-mono"
                            >
                              {tech}
                            </span>
                          ))}
                          {p.technologies.length > 4 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-gray-400 font-mono">
                              +{p.technologies.length - 4} more
                            </span>
                          )}
                          {p.images?.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200 font-mono font-semibold">
                              📷 {p.images.length} screens
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    {/* View Live Case Study Page */}
                    <a
                      href={`/portfolio/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all"
                      title="View public case study"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Page</span>
                    </a>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditing(p)
                        setShowForm(false)
                      }}
                      className="p-2 rounded-xl text-gray-600 hover:text-brand-blue hover:bg-blue-50 transition-all cursor-pointer"
                      title="Edit project"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${p.title}"? This cannot be undone.`)) {
                          deleteMutation.mutate(p.id)
                        }
                      }}
                      className="p-2 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

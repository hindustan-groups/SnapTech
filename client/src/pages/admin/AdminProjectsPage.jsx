/**
 * Admin Projects — CRUD with image URL field
 */
import { useState } from 'react'
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
  Filter,
  ExternalLink,
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { api } from '@/utils/api'
import { SEO, ImageUploader } from '@/components/ui'

const CATEGORIES = ['Web', 'App', 'Marketing', 'Branding', 'Software']

const CATEGORY_COLORS = {
  Web: 'bg-blue-50 text-blue-700 border-blue-200',
  App: 'bg-purple-50 text-purple-700 border-purple-200',
  Marketing: 'bg-pink-50 text-pink-700 border-pink-200',
  Branding: 'bg-orange-50 text-orange-700 border-orange-200',
  Software: 'bg-teal-50 text-teal-700 border-teal-200',
}

const inputCls =
  'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue transition-all'

function ProjectForm({ initial, onSave, onCancel, loading }) {
  const { register, handleSubmit, control } = useForm({
    defaultValues: initial ?? {
      title: '',
      slug: '',
      clientName: '',
      description: '',
      thumbnailUrl: '',
      technologies: '',
      category: 'Web',
      isFeatured: false,
      liveUrl: '',
    },
  })

  const onSubmit = (data) => {
    onSave({
      ...data,
      technologies: data.technologies
        ? data.technologies
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      isFeatured: Boolean(data.isFeatured),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Basic Info */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Project Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              {...register('title', { required: true })}
              className={inputCls}
              placeholder="Project Title"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Slug <span className="text-red-400">*</span>
            </label>
            <input
              {...register('slug', { required: true })}
              placeholder="my-project"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Client Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register('clientName', { required: true })}
              className={inputCls}
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Category</label>
            <select {...register('category')} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Technologies <span className="text-gray-400 font-normal">(comma separated)</span>
            </label>
            <input
              {...register('technologies')}
              placeholder="React, Node.js, PostgreSQL"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Live Project URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              {...register('liveUrl')}
              placeholder="https://myproject.com"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-gray-100 pt-4">
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={3}
          {...register('description', { required: true })}
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Thumbnail upload */}
      <div className="border-t border-gray-100 pt-4">
        <Controller
          name="thumbnailUrl"
          control={control}
          render={({ field }) => (
            <ImageUploader label="Thumbnail Image" value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="flex items-center gap-2.5">
        <input
          type="checkbox"
          id="isFeatured"
          {...register('isFeatured')}
          className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue/25 cursor-pointer"
        />
        <label
          htmlFor="isFeatured"
          className="text-sm text-gray-600 cursor-pointer flex items-center gap-1.5"
        >
          <Star className="w-3.5 h-3.5 text-yellow-500" /> Featured project
        </label>
      </div>

      <div className="flex gap-2.5 pt-1 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 bg-brand-blue text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition-all disabled:opacity-60"
        >
          <Check className="w-4 h-4" /> Save Project
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </form>
  )
}

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
      <SEO title="Projects" noIndex />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage your portfolio projects and case studies.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditing(null)
            }}
            className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>

        {/* Modal Dialog */}
        {(showForm || editing) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
            />
            {/* Modal Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl relative w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <h3 className="font-heading text-lg font-bold text-gray-900">
                  {editing ? `Edit Project: ${editing.title}` : 'Add New Project'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ProjectForm
                initial={
                  editing ? { ...editing, technologies: editing.technologies?.join(', ') } : null
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

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by title, client, or tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue transition-all"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue cursor-pointer"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 animate-pulse"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))
          ) : projects.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl py-16 flex flex-col items-center gap-3">
              <FolderOpen className="w-12 h-12 text-gray-200" />
              <p className="font-semibold text-gray-700">No projects yet</p>
              <p className="text-sm text-gray-400">Add your first project to showcase your work.</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl py-16 flex flex-col items-center gap-2 text-center text-gray-400 text-sm shadow-sm">
              <Search className="w-8 h-8 text-gray-200 mx-auto mb-1" />
              <p className="font-semibold text-gray-600">No projects found</p>
              <p className="text-xs text-gray-400">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            filteredProjects.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Thumbnail */}
                  {p.thumbnailUrl ? (
                    <img
                      src={p.thumbnailUrl}
                      alt={p.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-gray-300" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{p.title}</span>
                      {p.isFeatured && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Featured
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border ${CATEGORY_COLORS[p.category] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                      >
                        {p.category}
                      </span>
                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium hover:bg-blue-100 transition-colors"
                        >
                          <ExternalLink className="w-2.5 h-2.5" /> Live Link
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{p.clientName}</p>
                    {p.technologies?.length > 0 && (
                      <p className="text-xs text-gray-300 mt-0.5">
                        {p.technologies.slice(0, 3).join(' · ')}
                        {p.technologies.length > 3 ? ` +${p.technologies.length - 3}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditing(p)
                        setShowForm(false)
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-brand-blue/8 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete project?')) deleteMutation.mutate(p.id)
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
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

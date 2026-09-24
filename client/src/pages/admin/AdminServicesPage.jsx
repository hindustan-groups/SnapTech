/**
 * Admin Services — Full CRUD with all ServiceDetailPage fields
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Settings2,
  Clock,
  Tag,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'

const ICON_OPTIONS = [
  'Globe',
  'TrendingUp',
  'Lightbulb',
  'Code2',
  'Star',
  'Monitor',
  'Smartphone',
  'ShieldCheck',
  'BarChart3',
  'Megaphone',
  'Layers',
  'Settings',
]

const inputCls =
  'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue transition-all'

function ServiceForm({ initial, onSave, onCancel, loading }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { register, handleSubmit } = useForm({
    defaultValues: initial ?? {
      title: '',
      slug: '',
      icon: 'Globe',
      order: 0,
      isActive: true,
      tag: '',
      deliveryTime: '',
      shortDescription: '',
      fullDescription: '',
      techStack: '',
      keyFeatures: '',
      process: '',
    },
  })

  const onSubmit = (data) => {
    onSave({
      ...data,
      order: Number(data.order) || 0,
      isActive: Boolean(data.isActive),
      techStack: data.techStack
        ? data.techStack
            .split('\n')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      keyFeatures: data.keyFeatures
        ? data.keyFeatures
            .split('\n')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      process: data.process
        ? (() => {
            try {
              return JSON.parse(data.process)
            } catch {
              return []
            }
          })()
        : [],
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Basic Info Section */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Basic Information
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              {...register('title', { required: true })}
              className={inputCls}
              placeholder="Web Development"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Slug <span className="text-red-400">*</span>{' '}
              <span className="text-gray-400 font-normal">(URL path)</span>
            </label>
            <input
              {...register('slug', { required: true })}
              placeholder="web-development"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Icon <span className="text-gray-400 font-normal">(Lucide name)</span>
            </label>
            <select {...register('icon')} className={inputCls}>
              {ICON_OPTIONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Order</label>
            <input type="number" {...register('order')} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Tag <span className="text-gray-400 font-normal">(e.g. Most Popular)</span>
            </label>
            <input {...register('tag')} placeholder="Most Popular" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Delivery Time
            </label>
            <input {...register('deliveryTime')} placeholder="2–4 Weeks" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Descriptions
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Short Description <span className="text-red-400">*</span>{' '}
              <span className="text-gray-400 font-normal">(shown on cards)</span>
            </label>
            <input {...register('shortDescription', { required: true })} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Full Description <span className="text-red-400">*</span>{' '}
              <span className="text-gray-400 font-normal">(service detail page overview)</span>
            </label>
            <textarea
              rows={3}
              {...register('fullDescription', { required: true })}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </div>

      {/* Advanced toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex items-center gap-2 text-xs font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors py-1"
      >
        {showAdvanced ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
        {showAdvanced ? 'Hide' : 'Show'} Advanced Fields (Key Features, Tech Stack, Process)
      </button>

      {showAdvanced && (
        <div className="space-y-3 pl-4 border-l-2 border-brand-blue/20 bg-gray-50/50 rounded-r-xl p-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Key Features{' '}
              <span className="text-gray-400 font-normal">
                (one per line, shown as bullet points)
              </span>
            </label>
            <textarea
              rows={5}
              {...register('keyFeatures')}
              placeholder={
                'Fully responsive on all devices\nSEO-optimised from day one\nFast loading — under 3 seconds'
              }
              className={`${inputCls} resize-none font-mono text-xs`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Tech Stack <span className="text-gray-400 font-normal">(one per line)</span>
            </label>
            <textarea
              rows={4}
              {...register('techStack')}
              placeholder={'React.js\nNode.js\nPostgreSQL'}
              className={`${inputCls} resize-none font-mono text-xs`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Process Steps <span className="text-gray-400 font-normal">(JSON array)</span>
            </label>
            <textarea
              rows={6}
              {...register('process')}
              placeholder={
                '[\n  {"step":"01","title":"Discovery","desc":"We understand your goals."},\n  {"step":"02","title":"Design","desc":"We create prototypes."}\n]'
              }
              className={`${inputCls} resize-none font-mono text-xs`}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5 pt-1">
        <input
          type="checkbox"
          id="svcActive"
          {...register('isActive')}
          className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue/25 cursor-pointer"
        />
        <label htmlFor="svcActive" className="text-sm text-gray-600 cursor-pointer">
          Active <span className="text-gray-400">(visible on website)</span>
        </label>
      </div>

      <div className="flex gap-2.5 pt-1 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 bg-brand-blue text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition-all disabled:opacity-60"
        >
          <Check className="w-4 h-4" /> Save Service
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

export default function AdminServicesPage() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const qc = useQueryClient()

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => api.get('/admin/services').then((r) => r.data),
  })

  const prepareForEdit = (s) => ({
    ...s,
    techStack: Array.isArray(s.techStack) ? s.techStack.join('\n') : '',
    keyFeatures: Array.isArray(s.keyFeatures) ? s.keyFeatures.join('\n') : '',
    process: s.process ? JSON.stringify(s.process, null, 2) : '',
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/services', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-services'] })
      qc.invalidateQueries({ queryKey: ['services'] })
      setShowForm(false)
    },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/admin/services/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-services'] })
      qc.invalidateQueries({ queryKey: ['services'] })
      setEditing(null)
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/services/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-services'] })
      qc.invalidateQueries({ queryKey: ['services'] })
    },
  })

  return (
    <>
      <SEO title="Services" noIndex />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900">Services</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage IT services shown on Services page and detail pages.
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
            <Plus className="w-4 h-4" /> Add Service
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
                  {editing ? `Edit Service: ${editing.title}` : 'Add New Service'}
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
              <ServiceForm
                initial={editing ? prepareForEdit(editing) : null}
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

        {/* Services List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : services.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl py-16 flex flex-col items-center gap-3">
              <Layers className="w-12 h-12 text-gray-200" />
              <p className="font-semibold text-gray-700">No services yet</p>
              <p className="text-sm text-gray-400">Add your first service to get started.</p>
            </div>
          ) : (
            services.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Icon Badge */}
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                    <span className="text-brand-blue font-bold text-xs">{s.icon?.slice(0, 2)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{s.title}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                          s.isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {s.tag && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          <Tag className="w-3 h-3" />
                          {s.tag}
                        </span>
                      )}
                      {s.deliveryTime && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" />
                          {s.deliveryTime}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-1">{s.shortDescription}</p>
                    {s.keyFeatures?.length > 0 && (
                      <p className="text-xs text-gray-300 mt-0.5">
                        {s.keyFeatures.length} features · {s.techStack?.length || 0} tech ·{' '}
                        {Array.isArray(s.process) ? s.process.length : 0} steps
                      </p>
                    )}
                  </div>

                  {/* Order Badge + Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-300 font-mono">#{s.order}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditing(s)
                          setShowForm(false)
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-brand-blue/8 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this service?')) deleteMutation.mutate(s.id)
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Help card */}
        <div className="bg-brand-blue/3 border border-brand-blue/15 rounded-xl p-4">
          <p className="text-xs font-semibold text-brand-blue mb-1">Icon names (Lucide)</p>
          <p className="text-xs text-text-muted">Available: {ICON_OPTIONS.join(', ')}</p>
          <p className="text-xs text-text-muted mt-1">
            Process JSON format:{' '}
            <code className="bg-white px-1 rounded">
              [{'{'}step,title,desc{'}'}]
            </code>
          </p>
        </div>
      </div>
    </>
  )
}

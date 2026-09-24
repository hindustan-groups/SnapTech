import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Check, Flag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'

const inputCls =
  'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue transition-all'

function MilestoneForm({ initial, onSave, onCancel, loading }) {
  const { register, handleSubmit } = useForm({
    defaultValues: initial ?? { year: '', title: '', desc: '', order: 0 },
  })
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            Year <span className="text-red-400">*</span>
          </label>
          <input
            {...register('year', { required: true })}
            placeholder="2024"
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            {...register('title', { required: true })}
            className={inputCls}
            placeholder="Company founded"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Display Order</label>
          <input
            type="number"
            {...register('order', { valueAsNumber: true })}
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={2}
          {...register('desc', { required: true })}
          className={`${inputCls} resize-none`}
          placeholder="Describe this milestone briefly..."
        />
      </div>
      <div className="flex gap-2.5 pt-1 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 bg-brand-blue text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition-all disabled:opacity-60"
        >
          <Check className="w-4 h-4" /> Save Milestone
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

export default function AdminMilestonesPage() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const qc = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-milestones'],
    queryFn: () => api.get('/admin/milestones').then((r) => r.data),
  })
  const createM = useMutation({
    mutationFn: (d) => api.post('/admin/milestones', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-milestones'] })
      setShowForm(false)
    },
  })
  const updateM = useMutation({
    mutationFn: ({ id, ...d }) => api.patch(`/admin/milestones/${id}`, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-milestones'] })
      setEditing(null)
    },
  })
  const deleteM = useMutation({
    mutationFn: (id) => api.delete(`/admin/milestones/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-milestones'] }),
  })

  return (
    <>
      <SEO title="Milestones" noIndex />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900">Milestones</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Company journey timeline shown on the About page.
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
            <Plus className="w-4 h-4" /> Add Milestone
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
                  {editing ? `Edit Milestone: ${editing.title}` : 'Add New Milestone'}
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
              <MilestoneForm
                initial={editing ? editing : null}
                onSave={(d) => {
                  if (editing) {
                    updateM.mutate({ id: editing.id, ...d })
                  } else {
                    createM.mutate(d)
                  }
                }}
                onCancel={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
                loading={editing ? updateM.isPending : createM.isPending}
              />
            </div>
          </div>
        )}

        {/* Milestones Timeline List */}
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
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl py-16 flex flex-col items-center gap-3">
              <Flag className="w-12 h-12 text-gray-200" />
              <p className="font-semibold text-gray-700">No milestones yet</p>
              <p className="text-sm text-gray-400">Add key events in your company's journey.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[27px] top-6 bottom-6 w-px bg-linear-to-b from-brand-blue/30 via-brand-blue/15 to-transparent hidden sm:block" />

              <div className="space-y-2">
                {items.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="p-4 flex items-center gap-4">
                      {/* Year Badge */}
                      <div className="w-14 h-14 rounded-xl bg-linear-to-br from-brand-blue to-brand-blue/80 flex flex-col items-center justify-center shrink-0 shadow-sm">
                        <span className="text-white font-bold text-sm leading-tight">{m.year}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{m.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{m.desc}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditing(m)
                            setShowForm(false)
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-brand-blue/8 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete?')) deleteM.mutate(m.id)
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

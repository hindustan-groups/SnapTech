/**
 * Admin Team — CRUD
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Check, Users } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { api } from '@/utils/api'
import { SEO, ImageUploader } from '@/components/ui'

const LinkedinIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const inputCls =
  'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue transition-all'

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-teal-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-indigo-500',
  'bg-pink-500',
]

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function TeamForm({ initial, onSave, onCancel, loading }) {
  const { register, handleSubmit, control } = useForm({
    defaultValues: initial ?? {
      name: '',
      role: '',
      photoUrl: '',
      bio: '',
      linkedinUrl: '',
      order: 0,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Member Information
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register('name', { required: true })}
              className={inputCls}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Role <span className="text-red-400">*</span>
            </label>
            <input
              {...register('role', { required: true })}
              placeholder="Frontend Developer"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">LinkedIn URL</label>
            <input
              {...register('linkedinUrl')}
              placeholder="https://linkedin.com/in/..."
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Display Order
            </label>
            <input
              type="number"
              {...register('order', { valueAsNumber: true })}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Photo upload */}
      <div className="border-t border-gray-100 pt-4">
        <Controller
          name="photoUrl"
          control={control}
          render={({ field }) => (
            <ImageUploader label="Profile Photo" value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Bio <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={2}
          {...register('bio')}
          className={`${inputCls} resize-none`}
          placeholder="Brief bio about this team member..."
        />
      </div>

      <div className="flex gap-2.5 pt-1 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 bg-brand-blue text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition-all disabled:opacity-60"
        >
          <Check className="w-4 h-4" /> Save Member
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

export default function AdminTeamPage() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const qc = useQueryClient()

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['admin-team'],
    queryFn: () => api.get('/admin/team').then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/team', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-team'] })
      qc.invalidateQueries({ queryKey: ['team'] })
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/admin/team/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-team'] })
      qc.invalidateQueries({ queryKey: ['team'] })
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/team/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-team'] })
      qc.invalidateQueries({ queryKey: ['team'] })
    },
  })

  return (
    <>
      <SEO title="Team" noIndex />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900">Team Members</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your About page team section.</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditing(null)
            }}
            className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Member
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
                  {editing ? `Edit Team Member: ${editing.name}` : 'Add New Team Member'}
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
              <TeamForm
                initial={editing ? editing : null}
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

        {/* Members List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/5" />
                </div>
              </div>
            ))
          ) : members.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl py-16 flex flex-col items-center gap-3">
              <Users className="w-12 h-12 text-gray-200" />
              <p className="font-semibold text-gray-700">No team members yet</p>
              <p className="text-sm text-gray-400">Add your first team member to get started.</p>
            </div>
          ) : (
            members.map((m) => (
              <div
                key={m.id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Avatar */}
                  {m.photoUrl ? (
                    <img
                      src={m.photoUrl}
                      alt={m.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-white shadow-sm"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(m.name)} shadow-sm`}
                    >
                      <span className="text-white font-bold text-sm">
                        {m.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{m.name}</span>
                      {m.linkedinUrl && (
                        <a
                          href={m.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-600 transition-colors"
                        >
                          <LinkedinIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-brand-blue/8 text-brand-blue border border-brand-blue/15 font-medium">
                      {m.role}
                    </span>
                    {m.bio && <p className="text-xs text-gray-400 truncate mt-1">{m.bio}</p>}
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
                        if (window.confirm('Delete member?')) deleteMutation.mutate(m.id)
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

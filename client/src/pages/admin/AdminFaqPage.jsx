import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Check, HelpCircle, ChevronDown, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'

const inputCls =
  'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue transition-all'

function FaqForm({ initial, onSave, onCancel, loading }) {
  const { register, handleSubmit } = useForm({
    defaultValues: initial ?? { question: '', answer: '', order: 0, isActive: true },
  })
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-3">
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            Question <span className="text-red-400">*</span>
          </label>
          <input
            {...register('question', { required: true })}
            className={inputCls}
            placeholder="What services do you offer?"
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
          Answer <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={4}
          {...register('answer', { required: true })}
          className={`${inputCls} resize-none`}
          placeholder="Provide a clear, helpful answer to this question..."
        />
      </div>
      <div className="flex items-center gap-2.5">
        <input
          type="checkbox"
          id="fActive"
          {...register('isActive')}
          className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue/25 cursor-pointer"
        />
        <label htmlFor="fActive" className="text-sm text-gray-600 cursor-pointer">
          Show on website
        </label>
      </div>
      <div className="flex gap-2.5 pt-1 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 bg-brand-blue text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition-all disabled:opacity-60"
        >
          <Check className="w-4 h-4" /> Save FAQ
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

export default function AdminFaqPage() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const qc = useQueryClient()

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: () => api.get('/admin/faqs').then((r) => r.data),
  })

  const createM = useMutation({
    mutationFn: (d) => api.post('/admin/faqs', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-faqs'] })
      qc.invalidateQueries({ queryKey: ['faqs'] })
      setShowForm(false)
    },
  })
  const updateM = useMutation({
    mutationFn: ({ id, ...d }) => api.patch(`/admin/faqs/${id}`, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-faqs'] })
      qc.invalidateQueries({ queryKey: ['faqs'] })
      setEditing(null)
    },
  })
  const deleteM = useMutation({
    mutationFn: (id) => api.delete(`/admin/faqs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-faqs'] })
      qc.invalidateQueries({ queryKey: ['faqs'] })
    },
  })

  // ── Chatbot Inquiries ──────────────────────────────────────────
  const { data: inquiries = [], isLoading: inqLoading } = useQuery({
    queryKey: ['chatbot-inquiries'],
    queryFn: () => api.get('/chatbot/admin/inquiries').then((r) => r.data.data),
  })
  const deleteInq = useMutation({
    mutationFn: (id) => api.delete(`/chatbot/admin/inquiries/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatbot-inquiries'] }),
  })
  const unansweredCount = inquiries.filter((i) => !i.isAnswered).length

  return (
    <>
      <SEO title="FAQs" noIndex />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900">FAQs</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage frequently asked questions shown on the website.
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
            <Plus className="w-4 h-4" /> Add FAQ
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
                  {editing ? 'Edit FAQ' : 'Add New FAQ'}
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
              <FaqForm
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

        {/* FAQ List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg shrink-0" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : faqs.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl py-16 flex flex-col items-center gap-3">
              <HelpCircle className="w-12 h-12 text-gray-200" />
              <p className="font-semibold text-gray-700">No FAQs yet</p>
              <p className="text-sm text-gray-400">
                Add questions that your clients frequently ask.
              </p>
            </div>
          ) : (
            faqs.map((f, idx) => (
              <div
                key={f.id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div>
                  {/* Header row */}
                  <div className="p-4 flex items-center gap-3">
                    {/* Number badge */}
                    <div className="w-7 h-7 rounded-lg bg-brand-blue/8 flex items-center justify-center shrink-0">
                      <span className="text-brand-blue font-bold text-xs">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Question */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{f.question}</span>
                        {!f.isActive && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-full">
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand + Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${expanded === f.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(f)
                          setShowForm(false)
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-brand-blue/8 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete?')) deleteM.mutate(f.id)
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Answer accordion */}
                  {expanded === f.id && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                      <p className="text-sm text-gray-600 leading-relaxed pt-3">{f.answer}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Chatbot Inquiries Section ── */}
        <div className="mt-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2">
                  Chatbot Inquiries
                  {unansweredCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 bg-red-100 text-red-600 font-bold rounded-full">
                      {unansweredCount} unanswered
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-400">
                  Questions submitted by website visitors through the chatbot. Unanswered ones help you improve your FAQs.
                </p>
              </div>
              <Link
                to="/admin/chatbot-inquiries"
                className="px-3.5 py-2 border border-gray-250 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm self-start sm:self-auto"
              >
                Open Full Manager →
              </Link>
            </div>
          </div>

          {inqLoading ? (
            <div className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl py-12 flex flex-col items-center gap-2">
              <MessageCircle className="w-10 h-10 text-gray-200" />
              <p className="text-sm font-semibold text-gray-500">No chatbot inquiries yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className={`bg-white border rounded-xl px-4 py-3 flex items-start gap-3 ${
                    inq.isAnswered ? 'border-gray-100' : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {inq.isAnswered ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{inq.question}</p>
                    {inq.answer && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{inq.answer}</p>
                    )}
                    <p className="text-[10px] text-gray-300 mt-1">
                      {new Date(inq.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this inquiry?')) deleteInq.mutate(inq.id)
                    }}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

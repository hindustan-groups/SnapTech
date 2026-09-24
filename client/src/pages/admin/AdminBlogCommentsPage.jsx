/**
 * AdminBlogCommentsPage — Executive Moderation & Security Vault for Blog Reader Comments
 * Complete comment moderation with 0ms optimistic updates, toast notifications, custom Glassmorphism ConfirmModal, and summary metric counters.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MessageSquare,
  Check,
  X,
  Trash2,
  Search,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/utils/api'
import { SEO, ConfirmModal } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

export default function AdminBlogCommentsPage() {
  const qc = useQueryClient()
  const toast = useToast()

  const [filter, setFilter] = useState('') // '' = all, 'false' = pending, 'true' = approved
  const [searchTerm, setSearchTerm] = useState('')

  // Delete Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    authorName: '',
  })

  // Queries
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-blog-comments', filter],
    queryFn: () => {
      const qs = filter !== '' ? `?approved=${filter}` : ''
      return api.get(`/admin/blog/comments${qs}`)
    },
  })

  const comments = data?.data || []

  // Mutations
  const approveMutation = useMutation({
    mutationFn: ({ id, isApproved }) => api.patch(`/admin/blog/comments/${id}/approve`, { isApproved }),
    onMutate: async ({ id, isApproved }) => {
      await qc.cancelQueries({ queryKey: ['admin-blog-comments', filter] })
      const previousComments = qc.getQueryData(['admin-blog-comments', filter])

      qc.setQueryData(['admin-blog-comments', filter], (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((c) => (c.id === id ? { ...c, isApproved } : c)),
        }
      })

      return { previousComments }
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isApproved ? 'Comment approved & published live!' : 'Comment moved to pending queue.')
      qc.invalidateQueries({ queryKey: ['admin-blog-comments'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err, _, context) => {
      if (context?.previousComments) {
        qc.setQueryData(['admin-blog-comments', filter], context.previousComments)
      }
      toast.error(err.response?.data?.message || 'Failed to update comment status.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/blog/comments/${id}`),
    onSuccess: (_, deletedId) => {
      toast.info('Comment removed from database.')
      // 0ms Optimistic UI deletion
      qc.setQueryData(['admin-blog-comments', filter], (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter((c) => c.id !== deletedId),
        }
      })
      qc.invalidateQueries({ queryKey: ['admin-blog-comments'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete comment.')
    },
  })

  const filtered = comments.filter((c) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.comment?.toLowerCase().includes(term) ||
      c.blogPost?.title?.toLowerCase().includes(term)
    )
  })

  // Metric counters
  const totalCount = comments.length
  const pendingCount = comments.filter((c) => !c.isApproved).length
  const approvedCount = comments.filter((c) => c.isApproved).length

  const handleDeleteClick = (comment) => {
    setDeleteConfirm({
      isOpen: true,
      id: comment.id,
      authorName: comment.name,
    })
  }

  return (
    <>
      <SEO title="Blog Reader Comments" noIndex />
      <div className="space-y-6 max-w-7xl mx-auto pb-12">

        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-linear-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <MessageSquare className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Blog Comments Moderation
                  </h1>
                  {pendingCount > 0 && (
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 uppercase tracking-wider animate-pulse">
                      {pendingCount} Pending Approval
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Approve, reject or moderate reader comments before they appear on public blog articles. Guard against spam &amp; inappropriate content.
                </p>
              </div>
            </div>

            {/* Quick Action Refresh */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  refetch()
                  toast.info('Comments list refreshed.')
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Queue</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Metric Cards ───────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Comments</p>
              <p className="text-xl font-extrabold font-heading text-gray-900">{totalCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Moderation</p>
              <p className="text-xl font-extrabold font-heading text-amber-700">{pendingCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Approved &amp; Live</p>
              <p className="text-xl font-extrabold font-heading text-emerald-600">{approvedCount}</p>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Controls ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by reader name, email, comment body, or article title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 shadow-xs font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
            {[
              { val: '', label: 'All Comments' },
              { val: 'false', label: '⏳ Pending Only' },
              { val: 'true', label: '✓ Approved Only' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setFilter(opt.val)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  filter === opt.val
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error state Alert ─────────────────────────────────── */}
        {isError && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900 text-sm">Failed to load reader comments</p>
              <p className="text-rose-700 text-xs mt-0.5">Please check your database connectivity and refresh.</p>
            </div>
          </div>
        )}

        {/* ── Comments Feed List ─────────────────────────────────── */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200/80 rounded-2xl h-28 animate-pulse shadow-xs" />
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200/80 rounded-3xl shadow-xs">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-bold">No reader comments found matching your filters.</p>
            </div>
          ) : (
            filtered.map((comment) => {
              const isApproved = comment.isApproved

              return (
                <div
                  key={comment.id}
                  className={`bg-white rounded-3xl border p-5 flex flex-col md:flex-row gap-4 items-start transition-all hover:shadow-md ${
                    !isApproved ? 'border-amber-200/90 bg-amber-50/20' : 'border-gray-200/80'
                  }`}
                >
                  {/* Author Avatar Badge */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 border ${
                    isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {comment.name ? comment.name[0].toUpperCase() : 'U'}
                  </div>

                  {/* Comment Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-900 font-heading">{comment.name}</span>
                      <span className="text-xs text-gray-400 font-mono">({comment.email})</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                        isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {isApproved ? 'Approved & Live' : 'Pending Moderation'}
                      </span>
                    </div>

                    {/* Blog Post Link Reference */}
                    {comment.blogPost && (
                      <div className="flex items-center gap-1.5 text-xs text-brand-blue font-bold">
                        <span className="text-gray-400 font-normal">Article:</span>
                        <Link
                          to={`/blog/${comment.blogPost.slug}`}
                          target="_blank"
                          className="hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>{comment.blogPost.title}</span>
                          <ExternalLink className="w-3 h-3 text-brand-blue" />
                        </Link>
                      </div>
                    )}

                    {/* Comment Content Body */}
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans bg-gray-50/60 p-3 rounded-2xl border border-gray-150">
                      "{comment.comment}"
                    </p>

                    <p className="text-[11px] text-gray-400 font-mono">
                      Submitted on: {new Date(comment.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    {!isApproved ? (
                      <button
                        onClick={() => approveMutation.mutate({ id: comment.id, isApproved: true })}
                        disabled={approveMutation.isPending}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => approveMutation.mutate({ id: comment.id, isApproved: false })}
                        disabled={approveMutation.isPending}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Unapprove</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteClick(comment)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ── Delete Confirmation Modal ──────────────────────────── */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, id: null, authorName: '' })}
          onConfirm={() => {
            if (deleteConfirm.id) {
              deleteMutation.mutate(deleteConfirm.id)
              setDeleteConfirm({ isOpen: false, id: null, authorName: '' })
            }
          }}
          title="Delete Reader Comment"
          message="Are you sure you want to permanently delete this comment from the blog post feed?"
          itemTitle={`Comment by ${deleteConfirm.authorName}`}
          confirmText="Delete Comment"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </>
  )
}

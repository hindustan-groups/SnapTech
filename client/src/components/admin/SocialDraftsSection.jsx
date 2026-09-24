import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/utils/api'
import { Share2, Copy, Check, Trash2, CheckCircle2, Circle } from 'lucide-react'

export function SocialDraftsSection() {
  const queryClient = useQueryClient()
  const [copiedId, setCopiedId] = useState(null)

  const { data: drafts, isLoading } = useQuery({
    queryKey: ['social-drafts'],
    queryFn: () => api.get('/admin/social/drafts').then((r) => r.data.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/social/drafts/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-drafts'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/social/drafts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-drafts'] })
    },
  })

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-4 bg-gray-100 rounded w-1/4" />
        <div className="h-20 bg-gray-100 rounded" />
      </div>
    )
  }

  if (!drafts || drafts.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <Share2 className="w-5 h-5 text-brand-blue" />
        <div>
          <h2 className="font-heading text-base font-bold text-gray-800">Generated Social Post Drafts</h2>
          <p className="text-xs text-gray-400">Pre-formatted captions for your featured projects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-100 overflow-y-auto pr-1">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className={`p-4 rounded-xl border transition-all duration-200 relative flex flex-col justify-between ${
              draft.status === 'POSTED' ? 'bg-gray-50/50 border-gray-100' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {draft.project?.category || 'Project'} • {draft.project?.title}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    draft.status === 'POSTED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}
                >
                  {draft.status}
                </span>
              </div>
              <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg font-mono whitespace-pre-wrap max-h-[150px] overflow-y-auto mb-3 border border-gray-100">
                {draft.text}
              </pre>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    statusMutation.mutate({
                      id: draft.id,
                      status: draft.status === 'POSTED' ? 'DRAFT' : 'POSTED',
                    })
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-brand-blue transition-colors"
                >
                  {draft.status === 'POSTED' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Mark Draft</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5" />
                      <span>Mark Posted</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this social post draft?')) {
                      deleteMutation.mutate(draft.id)
                    }
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                onClick={() => handleCopy(draft.id, draft.text)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-blue-100"
              >
                {copiedId === draft.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

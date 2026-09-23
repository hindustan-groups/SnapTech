/**
 * AdminSocialDraftsPage — Executive Social Marketing & Campaign Post Suite
 * Draft, schedule, auto-generate project showpieces, live feed preview, optimistic status updates, and 0ms ConfirmModal post deletion.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/utils/api'
import { SEO, ConfirmModal } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
import {
  Share2,
  Copy,
  Check,
  Trash2,
  CheckCircle2,
  Circle,
  Plus,
  X,
  Search,
  FolderKanban,
  Eye,
  Sparkles,
  Send,
  Tag,
  Clock,
  ThumbsUp,
  MessageSquare,
  Repeat,
  RefreshCw,
  Megaphone,
} from 'lucide-react'

const PLATFORMS = [
  { id: 'ALL', label: 'All Platforms', badgeCls: 'bg-gray-100 text-gray-700 border-gray-200' },
  { id: 'LINKEDIN', label: 'LinkedIn', badgeCls: 'bg-blue-50 text-blue-700 border-blue-200 font-bold' },
  { id: 'TWITTER', label: 'X / Twitter', badgeCls: 'bg-slate-100 text-slate-800 border-slate-300 font-bold' },
  { id: 'INSTAGRAM', label: 'Instagram', badgeCls: 'bg-pink-50 text-pink-700 border-pink-200 font-bold' },
  { id: 'FACEBOOK', label: 'Facebook', badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold' },
]

const STATUSES = ['ALL', 'DRAFT', 'SCHEDULED', 'POSTED']

export default function AdminSocialDraftsPage() {
  const queryClient = useQueryClient()
  const toast = useToast()

  const [copiedId, setCopiedId] = useState(null)
  const [platformFilter, setPlatformFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [previewDraft, setPreviewDraft] = useState(null)

  // Delete Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    title: '',
  })

  // Form states for manual draft creation
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('ALL')
  const [campaignName, setCampaignName] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [draftText, setDraftText] = useState('')

  // Fetch social drafts
  const { data: draftsRes, isLoading, refetch } = useQuery({
    queryKey: ['social-drafts'],
    queryFn: () => api.get('/admin/social/drafts').then((r) => r.data.data),
  })

  // Fetch portfolio projects for selection
  const { data: projectsRes } = useQuery({
    queryKey: ['admin-portfolio-projects'],
    queryFn: () => api.get('/projects').then((r) => r.data.data),
  })

  const drafts = draftsRes || []
  const projects = projectsRes || []

  // Mutation to toggle status optimistically
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/social/drafts/${id}`, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['social-drafts'] })
      const previousDrafts = queryClient.getQueryData(['social-drafts'])

      queryClient.setQueryData(['social-drafts'], (old) => {
        if (!Array.isArray(old)) return old
        return old.map((d) => (d.id === id ? { ...d, status } : d))
      })

      return { previousDrafts }
    },
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'POSTED' ? 'Post marked as published live!' : 'Post status updated!')
      queryClient.invalidateQueries({ queryKey: ['social-drafts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err, _, context) => {
      if (context?.previousDrafts) {
        queryClient.setQueryData(['social-drafts'], context.previousDrafts)
      }
      toast.error(err.response?.data?.message || 'Failed to update post status.')
    },
  })

  // Mutation to delete a draft
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/social/drafts/${id}`),
    onSuccess: (_, deletedId) => {
      toast.info('Social post deleted.')
      // 0ms Optimistic UI deletion
      queryClient.setQueryData(['social-drafts'], (old) => {
        if (!Array.isArray(old)) return old
        return old.filter((d) => d.id !== deletedId)
      })
      queryClient.invalidateQueries({ queryKey: ['social-drafts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete post.')
    },
  })

  // Mutation to create a new social draft
  const createMutation = useMutation({
    mutationFn: (newDraft) => api.post('/admin/social/drafts', newDraft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-drafts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('New social campaign draft created successfully!')
      setIsAddModalOpen(false)
      setSelectedProjectId('')
      setSelectedPlatform('ALL')
      setCampaignName('')
      setScheduledFor('')
      setDraftText('')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create social draft.')
    },
  })

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Post caption & hashtags copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleCreate = (e) => {
    e.preventDefault()
    if (!draftText.trim()) {
      toast.error('Post caption text cannot be empty.')
      return
    }
    createMutation.mutate({
      projectId: selectedProjectId || null,
      platform: selectedPlatform,
      campaignName: campaignName.trim() || null,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      text: draftText.trim(),
      status: scheduledFor ? 'SCHEDULED' : 'DRAFT',
    })
  }

  // Auto-generate caption template from project
  const handleAutoGenerateCaption = (projId) => {
    const proj = projects.find((p) => p.id === projId)
    if (!proj) return
    const tags = proj.technologies ? proj.technologies.map((t) => `#${t.replace(/\s+/g, '')}`).join(' ') : ''
    const template = `🚀 Project Showcase: ${proj.title}\n\nClient: ${proj.clientName}\nCategory: ${proj.category}\n\n${proj.description}\n\nKey Stack: ${proj.technologies?.join(', ')}\n\n✨ Engineered & Delivered by SnapTech Digital squad.\n🌐 Learn more: https://www.snaptech.digital/portfolio\n\n#SnapTechDigital #${proj.category.replace(/\s+/g, '')} ${tags}`
    setDraftText(template)
    toast.info('Auto-filled caption template from portfolio project!')
  }

  const handleDeleteClick = (draft) => {
    const titleSnippet = draft.campaignName || (draft.project?.title ? `Post for ${draft.project.title}` : draft.text.slice(0, 30))
    setDeleteConfirm({
      isOpen: true,
      id: draft.id,
      title: titleSnippet,
    })
  }

  // Filter drafts
  const filteredDrafts = drafts.filter((draft) => {
    const matchesPlatform = platformFilter === 'ALL' || draft.platform === platformFilter
    const matchesStatus = statusFilter === 'ALL' || draft.status === statusFilter
    const projectTitle = draft.project?.title?.toLowerCase() || ''
    const campaignStr = draft.campaignName?.toLowerCase() || ''
    const textContent = draft.text?.toLowerCase() || ''
    const s = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || projectTitle.includes(s) || campaignStr.includes(s) || textContent.includes(s)

    return matchesPlatform && matchesStatus && matchesSearch
  })

  // Metric counters
  const totalCount = drafts.length
  const draftCount = drafts.filter((d) => d.status === 'DRAFT').length
  const scheduledCount = drafts.filter((d) => d.status === 'SCHEDULED').length
  const postedCount = drafts.filter((d) => d.status === 'POSTED').length

  return (
    <>
      <SEO title="Social Marketing Suite" noIndex />
      <div className="space-y-6 max-w-7xl mx-auto pb-12">

        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <Megaphone className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Social Marketing Suite
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Omnichannel Hub
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Draft, schedule, and preview social media marketing campaigns across LinkedIn, X/Twitter, Instagram &amp; Facebook.
                </p>
              </div>
            </div>

            {/* Quick Action Refresh & Add */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  refetch()
                  toast.info('Social drafts refreshed.')
                }}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Campaign Post</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Metric Cards ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Campaigns</p>
              <p className="text-xl font-extrabold font-heading text-gray-900">{totalCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Draft Posts</p>
              <p className="text-xl font-extrabold font-heading text-amber-700">{draftCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scheduled Posts</p>
              <p className="text-xl font-extrabold font-heading text-brand-blue">{scheduledCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Posted Live</p>
              <p className="text-xl font-extrabold font-heading text-emerald-600">{postedCount}</p>
            </div>
          </div>
        </div>

        {/* ── Toolbar, Platform Filters & Status Tabs ─────────────── */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
            {/* Platform Filter Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatformFilter(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    platformFilter === p.id
                      ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search captions or campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-medium"
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
          </div>

          {/* Status Sub-filter */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold pt-0.5">
            <span>Status Filter:</span>
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* ── Drafts Grid ─────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs animate-pulse space-y-4 h-56" />
            ))}
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-16 text-center shadow-xs">
            <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-800">No social post campaigns found</p>
            <p className="text-xs text-gray-500 mt-1">Try updating your platform filters or create a new campaign post.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDrafts.map((draft) => {
              const platformObj = PLATFORMS.find((p) => p.id === draft.platform) || PLATFORMS[0]

              return (
                <div
                  key={draft.id}
                  className="bg-white rounded-3xl border border-gray-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header: Platform Badge + Campaign Tag + Status */}
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${platformObj.badgeCls}`}>
                          {platformObj.label}
                        </span>
                        {draft.campaignName && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {draft.campaignName}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[9px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider border ${
                          draft.status === 'POSTED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : draft.status === 'SCHEDULED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {draft.status}
                      </span>
                    </div>

                    {/* Linked Project info */}
                    {draft.project && (
                      <p className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5 font-heading">
                        <FolderKanban className="w-3.5 h-3.5 text-brand-blue" />
                        <span>{draft.project.title}</span>
                        <span className="text-gray-400 font-normal">({draft.project.category})</span>
                      </p>
                    )}

                    {/* Caption Preview box */}
                    <pre className="text-xs text-gray-800 bg-gray-50/70 p-4 rounded-2xl font-mono whitespace-pre-wrap max-h-[160px] overflow-y-auto mb-4 border border-gray-150 leading-relaxed shadow-inner">
                      {draft.text}
                    </pre>

                    {/* Schedule timestamp */}
                    {draft.scheduledFor && (
                      <p className="text-[11px] text-brand-blue font-bold mb-3 flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Scheduled: {new Date(draft.scheduledFor).toLocaleString('en-IN')}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewDraft(draft)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-brand-blue transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() =>
                          statusMutation.mutate({
                            id: draft.id,
                            status: draft.status === 'POSTED' ? 'DRAFT' : 'POSTED',
                          })
                        }
                        className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        {draft.status === 'POSTED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span>{draft.status === 'POSTED' ? 'Posted' : 'Mark Posted'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(draft)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopy(draft.id, draft.text)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      {copiedId === draft.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === draft.id ? 'Copied' : 'Copy Text'}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Create Campaign Post Modal ──────────────────────────── */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                <h3 className="text-base font-extrabold text-gray-900 font-heading flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-brand-blue" />
                  Create Social Marketing Post
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Platform selection */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 block mb-1">
                      Target Social Platform
                    </label>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Campaign Name */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 block mb-1">
                      Campaign Name <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Summer Promo 2026"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>

                {/* Project Link & Template Auto Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] uppercase font-bold text-gray-600 block">
                      Link Portfolio Project
                    </label>
                    {selectedProjectId && (
                      <button
                        type="button"
                        onClick={() => handleAutoGenerateCaption(selectedProjectId)}
                        className="text-[11px] text-brand-blue hover:text-blue-700 font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-brand-blue" /> Auto-fill Template
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value)
                      if (e.target.value) handleAutoGenerateCaption(e.target.value)
                    }}
                    className="w-full text-xs font-bold px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer"
                  >
                    <option value="">-- General Marketing Post (No Project Link) --</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.title} ({proj.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scheduled DateTime */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-600 block mb-1">
                    Schedule Release Date <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-mono text-gray-700"
                  />
                </div>

                {/* Caption / Text */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-600 block mb-1">
                    Post Caption &amp; Hashtags *
                  </label>
                  <textarea
                    rows={6}
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder="🔥 Excited to share our new service launch at Hindustan Projects! #webdevelopment #digitalmarketing"
                    required
                    className="w-full text-xs text-gray-800 p-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none leading-relaxed font-sans bg-gray-50/50 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-150">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !draftText.trim()}
                    className="px-5 py-2.5 bg-brand-blue hover:bg-blue-600 disabled:bg-gray-300 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {createMutation.isPending ? 'Saving...' : 'Save Campaign Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Platform Live Feed Preview Modal ────────────────────── */}
        {previewDraft && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                <h3 className="text-sm font-extrabold text-gray-900 font-heading flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-blue" />
                  Feed Preview Card
                </h3>
                <button
                  onClick={() => setPreviewDraft(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Feed Card UI */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                    HP
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Hindustan Projects</p>
                    <p className="text-[10px] text-gray-400">IT Services &amp; Digital Agency • Promoted</p>
                  </div>
                </div>

                <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
                  {previewDraft.text}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-gray-400 text-xs font-semibold">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> Like</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Comment</span>
                  <span className="flex items-center gap-1"><Repeat className="w-3.5 h-3.5" /> Repost</span>
                  <span className="flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Share</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setPreviewDraft(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirmation Modal ──────────────────────────── */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, id: null, title: '' })}
          onConfirm={() => {
            if (deleteConfirm.id) {
              deleteMutation.mutate(deleteConfirm.id)
              setDeleteConfirm({ isOpen: false, id: null, title: '' })
            }
          }}
          title="Delete Campaign Post"
          message="Are you sure you want to permanently delete this social marketing post draft?"
          itemTitle={deleteConfirm.title}
          confirmText="Delete Post"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

      </div>
    </>
  )
}

/**
 * AdminRecycleBinPage — Modern Data Recovery & Soft-Delete Management Panel
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Trash2,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
  FolderKanban,
  Newspaper,
  Search,
  UserCheck,
  Sparkles,
  ShieldAlert,
  Clock,
  ExternalLink,
  X,
  RotateCcw,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

export default function AdminRecycleBinPage() {
  const [activeTab, setActiveTab] = useState('leads')
  const [searchTerm, setSearchTerm] = useState('')
  const qc = useQueryClient()
  const { addToast } = useToast()

  // Fetch soft-deleted items
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-recycle-bin'],
    queryFn: () => api.get('/admin/recycle-bin').then((r) => r.data),
  })

  // Restore item mutation
  const restoreMutation = useMutation({
    mutationFn: (payload) => api.post('/admin/recycle-bin/restore', payload),
    onSuccess: (res, variables) => {
      const msg = res?.message || 'Item restored successfully!'
      addToast(msg, 'success')
      qc.invalidateQueries({ queryKey: ['admin-recycle-bin'] })
      if (variables.type === 'lead') {
        qc.invalidateQueries({ queryKey: ['admin-leads'] })
      } else if (variables.type === 'project') {
        qc.invalidateQueries({ queryKey: ['admin-client-projects'] })
        qc.invalidateQueries({ queryKey: ['admin-stats'] })
      } else if (variables.type === 'blog') {
        qc.invalidateQueries({ queryKey: ['admin-blog'] })
      } else if (variables.type === 'application') {
        qc.invalidateQueries({ queryKey: ['admin-careers'] })
      }
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.message || 'Failed to restore item.'
      addToast(errorMsg, 'error')
    },
  })

  // Permanent delete mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: ({ id, type }) => api.delete(`/admin/recycle-bin/permanent/${id}?type=${type}`),
    onSuccess: () => {
      addToast('Item permanently deleted from database', 'info')
      qc.invalidateQueries({ queryKey: ['admin-recycle-bin'] })
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.message || 'Failed to delete item permanently.'
      addToast(errorMsg, 'error')
    },
  })

  const handleRestore = (id, type) => {
    restoreMutation.mutate({ type, id })
  }

  const handlePermanentDelete = (id, type, title) => {
    if (
      window.confirm(
        `PERMANENT DELETION WARNING:\nAre you sure you want to permanently delete "${title}"?\nThis action CANNOT be undone and will permanently remove all associated files and data!`
      )
    ) {
      permanentDeleteMutation.mutate({ id, type })
    }
  }

  const items = data ?? { leads: [], projects: [], blog: [], applications: [] }

  const totalDeletedCount =
    (items.leads?.length || 0) +
    (items.projects?.length || 0) +
    (items.blog?.length || 0) +
    (items.applications?.length || 0)

  // Filter items based on active tab & search term
  const getFilteredItems = () => {
    const q = searchTerm.toLowerCase().trim()
    if (activeTab === 'leads') {
      return (items.leads ?? []).filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q) ||
          l.serviceInterested?.toLowerCase().includes(q)
      )
    }
    if (activeTab === 'projects') {
      return (items.projects ?? []).filter(
        (p) =>
          p.projectTitle?.toLowerCase().includes(q) ||
          p.clientName?.toLowerCase().includes(q) ||
          p.assignedTo?.toLowerCase().includes(q)
      )
    }
    if (activeTab === 'blog') {
      return (items.blog ?? []).filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.authorName?.toLowerCase().includes(q)
      )
    }
    if (activeTab === 'applications') {
      return (items.applications ?? []).filter(
        (app) =>
          app.fullName?.toLowerCase().includes(q) ||
          app.email?.toLowerCase().includes(q) ||
          app.phone?.toLowerCase().includes(q) ||
          app.jobPosting?.title?.toLowerCase().includes(q)
      )
    }
    return []
  }

  const filtered = getFilteredItems()

  return (
    <>
      <SEO title="Recycle Bin & Recovery Hub" noIndex />
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-linear-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <Trash2 className="w-7 h-7 text-rose-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">Recycle Bin & Data Recovery</h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 uppercase tracking-wider">
                    Safe Retention
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Restore accidentally deleted leads, projects, blog posts, or job applications before permanent cleanup.
                </p>
              </div>
            </div>

            {/* Quick Metrics Summary Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 min-w-[240px] shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Deleted Records:</span>
                <span className="font-bold text-white px-2 py-0.5 bg-rose-500/30 border border-rose-400/30 rounded-md">
                  {totalDeletedCount} Items
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                <span className="text-gray-300">Retention Policy:</span>
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  30 Days Soft Delete
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Segmented Navigation Tabs & Search Filter ───────────── */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-gray-200 pb-4">
          
          {/* Tab Category Controls */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                setActiveTab('leads')
                setSearchTerm('')
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Contact Leads</span>
              <span className={`px-2 py-0.5 text-[11px] rounded-full font-extrabold ${activeTab === 'leads' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {items.leads?.length || 0}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('projects')
                setSearchTerm('')
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Client Projects</span>
              <span className={`px-2 py-0.5 text-[11px] rounded-full font-extrabold ${activeTab === 'projects' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {items.projects?.length || 0}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('blog')
                setSearchTerm('')
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === 'blog'
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Blog Posts</span>
              <span className={`px-2 py-0.5 text-[11px] rounded-full font-extrabold ${activeTab === 'blog' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {items.blog?.length || 0}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('applications')
                setSearchTerm('')
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === 'applications'
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Job Applications</span>
              <span className={`px-2 py-0.5 text-[11px] rounded-full font-extrabold ${activeTab === 'applications' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {items.applications?.length || 0}
              </span>
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search deleted ${activeTab}...`}
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
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

        {/* ── Content View ────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200/80 rounded-2xl shadow-sm">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            <p className="text-xs text-gray-500 mt-3 font-semibold">Loading soft-deleted records from database...</p>
          </div>
        ) : isError ? (
          <div className="p-10 text-center bg-white border border-gray-200/80 rounded-2xl shadow-sm space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">Failed to load recycle bin items</h3>
            <p className="text-xs text-gray-500">Could not retrieve soft-deleted entries from server.</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl shadow-xs hover:bg-brand-blue-hover cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Fetch</span>
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No deleted {activeTab} found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchTerm ? `No deleted ${activeTab} match your search "${searchTerm}".` : `The recycle bin for ${activeTab} is currently empty.`}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Record Details</th>
                    <th className="px-6 py-3.5">Category / Meta Info</th>
                    <th className="px-6 py-3.5">Deleted Timestamp</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      
                      {/* Record Details Column */}
                      <td className="px-6 py-4">
                        {activeTab === 'leads' && (
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                            <p className="text-gray-500 font-medium">{item.email}</p>
                            {item.phone && <p className="text-gray-400 font-mono text-[11px]">{item.phone}</p>}
                          </div>
                        )}
                        {activeTab === 'projects' && (
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-900 text-sm">{item.projectTitle}</p>
                            <p className="text-gray-500 font-medium">Client: <span className="text-gray-800 font-bold">{item.clientName}</span></p>
                          </div>
                        )}
                        {activeTab === 'blog' && (
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                            <p className="text-gray-400 font-mono text-[11px]">/blog/{item.slug}</p>
                          </div>
                        )}
                        {activeTab === 'applications' && (
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-900 text-sm">{item.fullName}</p>
                            <p className="text-gray-500 font-medium">{item.email}</p>
                            {item.phone && <p className="text-gray-400 font-mono text-[11px]">{item.phone}</p>}
                          </div>
                        )}
                      </td>

                      {/* Meta Info Column */}
                      <td className="px-6 py-4">
                        {activeTab === 'leads' && (
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Requested Service</span>
                            <span className="text-xs font-semibold text-gray-700">{item.serviceInterested || 'General Inquiry'}</span>
                          </div>
                        )}
                        {activeTab === 'projects' && (
                          <div className="space-y-1">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Budget / Assignment</span>
                              <span className="text-xs font-semibold text-gray-700">
                                {item.budget ? `Budget: ${item.budget}` : 'No Budget Specified'}
                              </span>
                            </div>
                            {item.assignedTo && (
                              <p className="text-[11px] text-gray-500 font-medium">Assigned To: {item.assignedTo}</p>
                            )}
                          </div>
                        )}
                        {activeTab === 'blog' && (
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Category & Author</span>
                            <span className="text-xs font-semibold text-gray-700">{item.category}</span>
                            <p className="text-[11px] text-gray-500 font-medium">By {item.authorName}</p>
                          </div>
                        )}
                        {activeTab === 'applications' && (
                          <div className="space-y-1">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Applied Position</span>
                              <span className="text-xs font-semibold text-gray-700">{item.jobPosting?.title || 'General Vacancy'}</span>
                            </div>
                            {item.resumeUrl && (
                              <a
                                href={item.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-brand-blue hover:underline font-bold"
                              >
                                <span>View Resume CV</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Deleted Timestamp */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {item.deletedAt ? (
                            <span>
                              {new Date(item.deletedAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Unknown Date</span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore(item.id, activeTab === 'applications' ? 'application' : activeTab === 'leads' ? 'lead' : activeTab === 'projects' ? 'project' : 'blog')}
                            disabled={restoreMutation.isPending || permanentDeleteMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                            title="Restore item back to active database"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>

                          <button
                            onClick={() =>
                              handlePermanentDelete(
                                item.id,
                                activeTab === 'applications' ? 'application' : activeTab === 'leads' ? 'lead' : activeTab === 'projects' ? 'project' : 'blog',
                                activeTab === 'leads'
                                  ? item.name
                                  : activeTab === 'projects'
                                    ? item.projectTitle
                                    : activeTab === 'blog'
                                      ? item.title
                                      : item.fullName
                              )
                            }
                            disabled={restoreMutation.isPending || permanentDeleteMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                            title="Permanently erase record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Permanent</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Security & Data Retention Best Practice Banner ──────── */}
        <div className="bg-linear-to-r from-amber-50 to-orange-50/80 border border-amber-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-950 font-heading flex items-center gap-2">
              <span>Recycle Bin Retention & Purge Rules</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Soft-deleted records are kept safely in the Recycle Bin for up to 30 days before candidate purge. Restoring an item immediately brings it back to its active admin module without data loss. Permanent deletion cannot be undone.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}

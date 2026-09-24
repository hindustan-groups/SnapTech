/**
 * AdminActivitiesPage — System Audit Trail & Forensic Activity Log
 * Chronological ledger tracking create, update, and delete actions across all administrative modules.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  History,
  Search,
  ShieldAlert,
  User,
  Filter,
  RefreshCw,
  PlusCircle,
  Edit3,
  Trash2,
  List,
  Activity,
  Copy,
  Check,
  X,
  Sparkles,
  Clock,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

const ACTION_COLORS = {
  CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
  DELETE: 'bg-rose-50 text-rose-700 border-rose-200',
}

const ACTION_ICONS = {
  CREATE: PlusCircle,
  UPDATE: Edit3,
  DELETE: Trash2,
}

const ENTITY_LABELS = {
  ClientProject: 'Client Project',
  WorkTask: 'Task',
  QuickNote: 'Sticky Note',
  Client: 'Client Portal',
  Admin: 'Admin / Staff Account',
  SocialPostDraft: 'Social Campaign',
  Lead: 'Sales Lead',
  Service: 'IT Service',
  Project: 'Portfolio Showcase',
  AdminUser: 'Staff Account',
}

const formatTimeAgo = (dateStr) => {
  const d = new Date(dateStr)
  const diffMs = Date.now() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export default function AdminActivitiesPage() {
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [entityFilter, setEntityFilter] = useState('ALL')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState('timeline') // 'timeline' | 'table'
  const [copiedId, setCopiedId] = useState(null)

  const { data: activities = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: () => api.get('/admin/activities').then((r) => r.data),
  })

  // Filtered list
  const filteredActivities = activities.filter((act) => {
    const q = searchTerm.toLowerCase().trim()
    const matchesSearch =
      !q ||
      act.adminEmail?.toLowerCase().includes(q) ||
      act.details?.toLowerCase().includes(q) ||
      act.entity?.toLowerCase().includes(q)

    const matchesEntity = entityFilter === 'ALL' || act.entity === entityFilter
    const matchesAction = actionFilter === 'ALL' || act.action === actionFilter

    return matchesSearch && matchesEntity && matchesAction
  })

  const hasActiveFilters = searchTerm !== '' || entityFilter !== 'ALL' || actionFilter !== 'ALL'

  // Summary Metrics
  const totalLogs = activities.length
  const createCount = activities.filter((a) => a.action === 'CREATE').length
  const updateCount = activities.filter((a) => a.action === 'UPDATE').length
  const deleteCount = activities.filter((a) => a.action === 'DELETE').length

  const handleCopyLogDetails = (act) => {
    const textToCopy = `[${act.action}] ${act.adminEmail}: ${act.details} (${new Date(act.createdAt).toLocaleString('en-IN')})`
    navigator.clipboard.writeText(textToCopy)
    setCopiedId(act.id)
    addToast('Audit log record copied to clipboard!', 'info')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      <SEO title="System Activity Log" noIndex />
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-linear-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <History className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                    System Audit Trail Logs
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Forensic Ledger
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Real-time audit log tracking administrator operations, content updates, staff permission modifications, and deletion events.
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  refetch()
                  addToast('Activity logs refreshed', 'info')
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Feed</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Metric Cards ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Audit Logs</p>
              <p className="text-xl font-extrabold font-heading text-gray-900">{totalLogs}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Creates</p>
              <p className="text-xl font-extrabold font-heading text-emerald-600">{createCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Updates</p>
              <p className="text-xl font-extrabold font-heading text-brand-blue">{updateCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deletions</p>
              <p className="text-xl font-extrabold font-heading text-rose-600">{deleteCount}</p>
            </div>
          </div>
        </div>

        {/* ── Filters & View Mode Control Bar ────────────────────── */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search logs by staff email, details, or entity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
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

            {/* Dropdown Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-bold text-gray-700"
                >
                  <option value="ALL">Entity: All Modules</option>
                  <option value="ClientProject">Client Projects</option>
                  <option value="WorkTask">Tasks</option>
                  <option value="SocialPostDraft">Social Campaigns</option>
                  <option value="Admin">Admin Users</option>
                  <option value="AdminUser">Staff Accounts</option>
                  <option value="QuickNote">Sticky Notes</option>
                  <option value="Client">Client Accounts</option>
                  <option value="Lead">Sales Leads</option>
                </select>
              </div>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-bold text-gray-700"
              >
                <option value="ALL">Action: All Types</option>
                <option value="CREATE">Create Actions</option>
                <option value="UPDATE">Update Actions</option>
                <option value="DELETE">Delete Actions</option>
              </select>

              {/* View Switcher Tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl shrink-0 border border-gray-200/80">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'timeline'
                      ? 'bg-white text-brand-blue shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  title="Timeline Feed View"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Timeline</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'table'
                      ? 'bg-white text-brand-blue shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  title="Compact Table View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setEntityFilter('ALL')
                    setActionFilter('ALL')
                  }}
                  className="text-xs font-bold text-brand-blue hover:text-brand-blue-hover bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 transition-all cursor-pointer shrink-0"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Timeline or Table View ─────────────────────────────── */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex gap-4 items-start animate-pulse">
                <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-50 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500 text-xs font-bold bg-white rounded-2xl border border-gray-200/80">
            Failed to load system activity logs.
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200/80 rounded-2xl shadow-sm space-y-3">
            <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-700 text-sm font-bold">No activity log records found.</p>
            <p className="text-xs text-gray-400">Try broadening your search term or resetting active filters.</p>
          </div>
        ) : viewMode === 'timeline' ? (
          /* TIMELINE STREAM VIEW */
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm relative overflow-hidden">
            {/* Center line for vertical timeline */}
            <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-gray-100" />

            <div className="space-y-6 relative">
              {filteredActivities.map((act) => {
                const ActionIcon = ACTION_ICONS[act.action] || Activity
                return (
                  <div key={act.id} className="flex gap-4 items-start group">
                    {/* Timeline Avatar */}
                    <div className="w-9 h-9 rounded-2xl bg-linear-to-br from-brand-blue via-indigo-600 to-brand-blue-hover border-2 border-white flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md relative z-10">
                      {act.adminEmail ? act.adminEmail[0].toUpperCase() : 'A'}
                    </div>

                    {/* Log Card Box */}
                    <div className="flex-1 bg-gray-50/60 hover:bg-gray-50/90 border border-gray-200/80 hover:border-gray-300 rounded-2xl p-4 transition-all duration-200 shadow-xs hover:shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Admin email */}
                          <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-brand-blue" />
                            {act.adminEmail}
                          </span>

                          {/* Entity badge */}
                          <span className="text-[10px] font-bold bg-white text-gray-700 border border-gray-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {ENTITY_LABELS[act.entity] || act.entity}
                          </span>

                          {/* Action badge */}
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                              ACTION_COLORS[act.action] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <ActionIcon className="w-3 h-3" />
                            {act.action}
                          </span>
                        </div>

                        {/* Timestamp & Time ago */}
                        <div className="flex items-center gap-2 shrink-0 text-gray-400 text-[10px] font-semibold">
                          <span className="flex items-center gap-1 text-gray-500 font-bold bg-white px-2 py-0.5 rounded-md border border-gray-200">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {formatTimeAgo(act.createdAt)}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(act.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Log details */}
                      <div className="flex items-start justify-between gap-4 pt-1">
                        <p className="text-xs text-gray-700 font-medium leading-relaxed font-sans">
                          {act.details}
                        </p>

                        {/* Copy record button */}
                        <button
                          onClick={() => handleCopyLogDetails(act)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-white text-gray-400 hover:text-brand-blue transition-colors shrink-0 cursor-pointer"
                          title="Copy Audit Log Details"
                        >
                          {copiedId === act.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* HIGH-DENSITY COMPACT TABLE VIEW */
          <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Administrator</th>
                    <th className="px-6 py-4">Module / Entity</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Audit Details</th>
                    <th className="px-6 py-4 text-right">Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredActivities.map((act) => {
                    const ActionIcon = ACTION_ICONS[act.action] || Activity
                    return (
                      <tr key={act.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                          {new Date(act.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-gray-900 truncate">
                          {act.adminEmail}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200 text-[10px] font-bold uppercase tracking-wider">
                            {ENTITY_LABELS[act.entity] || act.entity}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                              ACTION_COLORS[act.action] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <ActionIcon className="w-3 h-3" />
                            {act.action}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-gray-700 font-medium max-w-md truncate">
                          {act.details}
                        </td>
                        <td className="px-6 py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleCopyLogDetails(act)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-400 hover:text-brand-blue transition-colors cursor-pointer"
                            title="Copy details"
                          >
                            {copiedId === act.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Security & Guidance Card ───────────────────────────── */}
        <div className="bg-linear-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 border border-blue-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-brand-blue" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-brand-blue font-heading flex items-center gap-2">
              <span>Immutable Forensic Logging Protocol</span>
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every administrative record modification, content creation, and account deactivation is immutably logged with timestamp, user session identity, and target module entity for security compliance.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}

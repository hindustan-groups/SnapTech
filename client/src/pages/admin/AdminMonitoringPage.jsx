/**
 * AdminMonitoringPage — Live System Monitoring, Traffic Analytics & Error Telemetry
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Clock,
  TrendingUp,
  Cpu,
  Database,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles,
  Globe,
  X,
  CheckCircle2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { api } from '@/utils/api'
import { SEO, ConfirmModal } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

export default function AdminMonitoringPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState('traffic') // 'traffic' | 'errors' | 'health'
  const [errorFilter, setErrorFilter] = useState('ALL') // 'ALL' | 'FRONTEND' | 'BACKEND'
  const [searchTerm, setSearchTerm] = useState('')

  // 1. Query monitoring stats
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['monitoring-stats'],
    queryFn: () => api.get('/admin/monitoring/stats').then((r) => r.data),
    refetchInterval: activeTab === 'health' ? 30000 : false, // Auto-refresh health every 30s
  })

  // 2. Single error log deletion mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/monitoring/errors/${id}`),
    onSuccess: (_, deletedId) => {
      addToast('Error log entry removed', 'info')
      queryClient.setQueryData(['monitoring-stats'], (old) => {
        if (!old) return old
        if (old.data?.errorLogs) {
          return {
            ...old,
            data: {
              ...old.data,
              errorLogs: old.data.errorLogs.filter((e) => e.id !== deletedId),
            },
          }
        }
        if (old.errorLogs) {
          return {
            ...old,
            errorLogs: old.errorLogs.filter((e) => e.id !== deletedId),
          }
        }
        return old
      })
      queryClient.invalidateQueries({ queryKey: ['monitoring-stats'] })
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Failed to delete log entry', 'error')
    },
  })

  // 3. Clear all error logs mutation
  const clearAllMutation = useMutation({
    mutationFn: () => api.delete('/admin/monitoring/errors'),
    onSuccess: () => {
      addToast('All error log entries cleared successfully', 'success')
      queryClient.setQueryData(['monitoring-stats'], (old) => {
        if (!old) return old
        if (old.data?.errorLogs) {
          return {
            ...old,
            data: {
              ...old.data,
              errorLogs: [],
            },
          }
        }
        if (old.errorLogs) {
          return {
            ...old,
            errorLogs: [],
          }
        }
        return old
      })
      queryClient.invalidateQueries({ queryKey: ['monitoring-stats'] })
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Failed to clear logs', 'error')
    },
  })

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemTitle: '',
    onConfirm: null,
  })

  const stats = data?.data || data || {}
  const errorLogs = stats.errorLogs || []
  const traffic = stats.traffic || { today: 0, week: 0, month: 0, popularPages: [], chartData: [] }
  const health = stats.systemHealth || { database: 'UNKNOWN', uptime: 0, memoryUsed: 0, memoryTotal: 0, platform: '', cpuLoad: [0, 0, 0] }
  const config = stats.config || { sentry: false, googleAnalytics: false }

  const handleClearAll = () => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Clear All Error Telemetry Logs',
      message: 'Are you sure you want to permanently delete all recorded runtime error logs? This action cannot be undone.',
      itemTitle: `All ${errorLogs.length} Log Entries`,
      onConfirm: () => {
        clearAllMutation.mutate()
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  const handleDeleteSingle = (errLog) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Single Error Entry',
      message: 'Are you sure you want to remove this specific error log entry from system telemetry?',
      itemTitle: `${errLog.source} Error: ${errLog.errorMessage ? errLog.errorMessage.substring(0, 50) + '...' : 'Unknown Error'}`,
      onConfirm: () => {
        deleteMutation.mutate(errLog.id)
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  // Filter error logs
  const filteredErrors = errorLogs.filter((err) => {
    const matchesSource = errorFilter === 'ALL' || err.source === errorFilter
    const q = searchTerm.toLowerCase().trim()
    const matchesSearch =
      !q ||
      err.errorMessage?.toLowerCase().includes(q) ||
      err.pageOrRoute?.toLowerCase().includes(q)
    return matchesSource && matchesSearch
  })

  // Format uptime (seconds to hh:mm:ss)
  const formatUptime = (seconds) => {
    if (!seconds) return '0h 0m 0s'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hrs}h ${mins}m ${secs}s`
  }

  return (
    <>
      <SEO title="System Telemetry & Monitoring" noIndex />
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-linear-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <Activity className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">System Telemetry & Health</h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Live Diagnostics
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Real-time visitor pageviews, crash logs, database latency, and server memory consumption.
                </p>
              </div>
            </div>

            {/* Quick Action Refresh & Status */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  refetch()
                  addToast('Monitoring telemetry updated', 'info')
                }}
                disabled={isLoading || isRefetching}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-blue-300' : ''}`} />
                <span>{isRefetching ? 'Refreshing…' : 'Refresh Telemetry'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Integration Diagnostics Cards (Sentry & GA4) ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Sentry Error Tracker */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.sentry ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
              {config.sentry ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">Sentry Error Tracking</h3>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${config.sentry ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                  {config.sentry ? 'Active' : 'Fallback Mode'}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {config.sentry
                  ? 'Real-time crash capture is active. Runtime error telemetry reports directly to Sentry dashboard.'
                  : 'Sentry DSN is unconfigured. Internal database logging is capturing all errors locally.'}
              </p>
              {config.sentry && (
                <a
                  href="https://sentry.io"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline font-bold pt-1"
                >
                  <span>Open Sentry Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* GA4 Analytics */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.googleAnalytics ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
              {config.googleAnalytics ? <TrendingUp className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">Google Analytics 4</h3>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${config.googleAnalytics ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                  {config.googleAnalytics ? 'Active' : 'Bypassed'}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {config.googleAnalytics
                  ? 'GA4 tag script active. Visitor demographics, pageviews, and traffic sources report live.'
                  : 'GA4 Tag ID is not set. Page visits are tracked inside lightweight PostgreSQL PageVisit model.'}
              </p>
              {config.googleAnalytics && (
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline font-bold pt-1"
                >
                  <span>Open GA4 Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

        </div>

        {/* ── Segmented Navigation Tabs ─────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab('traffic')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'traffic'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Site Traffic Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'errors'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Runtime Crash Logs</span>
            {errorLogs.length > 0 && (
              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${activeTab === 'errors' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'}`}>
                {errorLogs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'health'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>System Server Health</span>
          </button>
        </div>

        {/* ── Tab Views Content ──────────────────────────────────── */}
        {isLoading ? (
          <div className="min-h-75 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
            <RefreshCw className="w-8 h-8 text-brand-blue animate-spin" />
            <p className="text-xs text-gray-500 font-semibold">Gathering live telemetry statistics...</p>
          </div>
        ) : isError ? (
          <div className="p-10 text-center bg-white border border-gray-200/80 rounded-2xl shadow-sm space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">Failed to retrieve monitoring telemetry</h3>
            <p className="text-xs text-gray-500">Check server connection status or database availability.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl shadow-xs hover:bg-brand-blue-hover cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* ── TAB 1: SITE TRAFFIC ────────────────────────────── */}
            {activeTab === 'traffic' && (
              <div className="space-y-6">
                
                {/* Traffic Counter Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Page Hits Today</span>
                    <div className="text-3xl font-extrabold text-gray-900 mt-1">{traffic.today.toLocaleString()}</div>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live Tracking Active
                    </span>
                  </div>

                  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Page Hits This Week</span>
                    <div className="text-3xl font-extrabold text-gray-900 mt-1">{traffic.week.toLocaleString()}</div>
                    <span className="text-[11px] text-gray-500 mt-1 inline-block">7-Day Aggregated Hits</span>
                  </div>

                  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Page Hits This Month</span>
                    <div className="text-3xl font-extrabold text-gray-900 mt-1">{traffic.month.toLocaleString()}</div>
                    <span className="text-[11px] text-gray-500 mt-1 inline-block">30-Day Monthly Hit Counter</span>
                  </div>
                </div>

                {/* Traffic Area Chart */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-gray-900 text-base">7-Day Traffic Trend</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Daily page hit volume for the last 7 days.</p>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-brand-blue rounded-lg border border-blue-100">
                      Real-time Analytics
                    </span>
                  </div>

                  <div className="h-64 md:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={traffic.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1A3E8C" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#1A3E8C" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                          labelClassName="font-bold text-gray-900 text-sm"
                          itemStyle={{ color: '#1A3E8C', fontSize: '13px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="visits" stroke="#1A3E8C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisits)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Popular Visited Routes */}
                <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-heading font-bold text-gray-900 text-base">Most Visited Website URLs</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Top page paths ranked by hit count.</p>
                  </div>
                  {traffic.popularPages.length === 0 ? (
                    <div className="p-10 text-center text-xs text-gray-400">No visitor hits recorded yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-gray-50/80 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="px-6 py-3.5">Page Path</th>
                            <th className="px-6 py-3.5 text-right">Hit Count</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {traffic.popularPages.map((pg, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 font-mono font-bold text-gray-800">{pg.path}</td>
                              <td className="px-6 py-4 font-bold text-brand-blue text-right">{pg.count.toLocaleString()} visits</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ── TAB 2: RUNTIME ERRORS ──────────────────────────── */}
            {activeTab === 'errors' && (
              <div className="space-y-4">
                
                {/* Filter Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    {['ALL', 'FRONTEND', 'BACKEND'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setErrorFilter(filter)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          errorFilter === filter
                            ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}

                    {errorLogs.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        disabled={clearAllMutation.isPending}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All Logs ({errorLogs.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Search bar */}
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search error messages or routes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-9 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
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

                {/* Errors List */}
                <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
                  {filteredErrors.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-base">No errors matching criteria</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        All clear! Zero runtime errors or crash logs recorded matching your search.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredErrors.map((err) => (
                        <div key={err.id} className="p-5 hover:bg-gray-50/60 transition-colors flex gap-4 items-start group">
                          <div className={`p-2.5 rounded-xl shrink-0 ${err.source === 'FRONTEND' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${err.source === 'FRONTEND' ? 'bg-indigo-100 text-indigo-800' : 'bg-red-100 text-red-800'}`}>
                                {err.source}
                              </span>
                              <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(err.createdAt).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 break-words leading-snug">
                              {err.errorMessage}
                            </h4>
                            <div className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                              <span className="break-all">Route: <strong className="text-gray-800">{err.pageOrRoute}</strong></span>
                              {err.userAgent && <span className="truncate max-w-md text-gray-400">UA: {err.userAgent}</span>}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteSingle(err)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                            title="Delete Log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ── TAB 3: SYSTEM HEALTH ──────────────────────────── */}
            {activeTab === 'health' && (
              <div className="space-y-6">
                
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Database Status */}
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Database Status</span>
                      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center">
                        <Database className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className={`text-2xl font-extrabold flex items-center gap-2 ${health.database === 'ONLINE' ? 'text-emerald-600' : 'text-red-600'}`}>
                        <span className={`w-3.5 h-3.5 rounded-full ${health.database === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        {health.database}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {health.database === 'ONLINE'
                          ? 'PostgreSQL engine is active and accepting SQL transactions.'
                          : 'Database connection is currently unreachable.'}
                      </p>
                    </div>
                  </div>

                  {/* Heap Memory */}
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Heap Memory</span>
                      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center">
                        <Cpu className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-extrabold text-gray-900">
                        {health.memoryUsed || 0} MB <span className="text-xs text-gray-400 font-normal">/ {health.memoryTotal || 0} MB</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-brand-blue h-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round(((health.memoryUsed || 0) / (health.memoryTotal || 1)) * 100))}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">Heap memory allocated to Node runtime process.</p>
                    </div>
                  </div>

                  {/* Server Uptime */}
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Server Continuous Uptime</span>
                      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                        {formatUptime(health.uptime)}
                      </div>
                      <p className="text-xs text-gray-500">Continuous uptime since last backend restart.</p>
                    </div>
                  </div>

                </div>

                {/* Host Environment Specifications */}
                <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
                  <h3 className="font-heading font-bold text-gray-900 text-base">Server Environment Specifications</h3>
                  
                  <div className="divide-y divide-gray-100 text-xs">
                    <div className="py-3 flex items-center justify-between">
                      <span className="text-gray-500 font-bold">Node.js Engine Version</span>
                      <span className="font-mono font-bold text-gray-900">{health.nodeVersion || '—'}</span>
                    </div>
                    <div className="py-3 flex items-center justify-between">
                      <span className="text-gray-500 font-bold">Host Platform</span>
                      <span className="font-mono font-bold text-gray-900 uppercase">{health.platform || 'Linux/Render'}</span>
                    </div>
                    <div className="py-3 flex items-center justify-between">
                      <span className="text-gray-500 font-bold">CPU Load Average (1m, 5m, 15m)</span>
                      <span className="font-mono font-bold text-brand-blue">
                        {(health.cpuLoad || [0, 0, 0]).map((l) => l.toFixed(2)).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </>
        )}

        {/* ── Real-Time Diagnostics Info Banner ───────────────────── */}
        <div className="bg-linear-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 border border-blue-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-brand-blue" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-brand-blue font-heading flex items-center gap-2">
              <span>Automatic Downtime Alarm System</span>
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              System monitoring automatically evaluates route errors. If failure rates exceed threshold (5+ crashes within 10 minutes), an emergency alarm email is dispatched directly to administrators.
            </p>
          </div>
        </div>

        {/* ── Delete Confirmation Modal ──────────────────────────── */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={deleteConfirm.onConfirm}
          title={deleteConfirm.title}
          message={deleteConfirm.message}
          itemTitle={deleteConfirm.itemTitle}
          confirmText="Delete Error Log"
          variant="danger"
          isLoading={deleteMutation.isPending || clearAllMutation.isPending}
        />

      </div>
    </>
  )
}

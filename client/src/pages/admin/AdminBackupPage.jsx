/**
 * AdminBackupPage — Modern Database Backup & Snapshot Manager
 * SUPER_ADMIN only.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Download,
  Database,
  CheckSquare,
  Square,
  Loader2,
  ShieldAlert,
  Info,
  FileJson,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
  Clock,
  FileCode,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

// ── Table Select Row Component ─────────────────────────────────
function TableRow({ tableKey, label, count, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(tableKey)}
      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border transition-all text-left cursor-pointer
        ${
          selected
            ? 'border-brand-blue/50 bg-blue-50/50 shadow-2xs'
            : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/80'
        }`}
    >
      <span className="shrink-0 text-brand-blue">
        {selected ? (
          <CheckSquare className="w-5 h-5 text-brand-blue" />
        ) : (
          <Square className="w-5 h-5 text-gray-300" />
        )}
      </span>
      <span
        className={`flex-1 text-xs sm:text-sm font-bold ${selected ? 'text-gray-900' : 'text-gray-700'}`}
      >
        {label}
      </span>
      <span
        className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold
        ${selected ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600'}`}
      >
        {count.toLocaleString()} records
      </span>
    </button>
  )
}

// ── Main Page Component ────────────────────────────────────────
export default function AdminBackupPage() {
  const [selected, setSelected] = useState(new Set())
  const [downloading, setDownloading] = useState(false)
  const [lastDownload, setLastDownload] = useState(null)
  const [dlError, setDlError] = useState(null)
  const [format, setFormat] = useState('json')
  const { addToast } = useToast()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['backup-tables'],
    queryFn: () => api.get('/admin/backup/tables').then((r) => r.data),
    onSuccess: (tables) => {
      setSelected(new Set(tables.map((t) => t.key)))
    },
  })

  const tables = data || []
  const allSelected = tables.length > 0 && tables.every((t) => selected.has(t.key))
  const someSelected = selected.size > 0

  const toggleTable = (key) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
      addToast('Deselected all database tables', 'info')
    } else {
      setSelected(new Set(tables.map((t) => t.key)))
      addToast('Selected all database tables', 'info')
    }
  }

  const selectPreset = (presetName, filterFn) => {
    const matchedKeys = tables.filter(filterFn).map((t) => t.key)
    setSelected(new Set(matchedKeys))
    addToast(`Selected ${presetName} preset (${matchedKeys.length} tables)`, 'info')
  }

  const totalRecords = tables
    .filter((t) => selected.has(t.key))
    .reduce((acc, t) => acc + t.count, 0)

  const handleDownload = async () => {
    if (selected.size === 0) return
    setDownloading(true)
    setDlError(null)
    try {
      const tableParam = [...selected].join(',')
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/admin/backup?tables=${tableParam}&format=${format}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Backup export failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const fileExtensions = { json: 'json', sql: 'sql', html: 'html' }
      const ext = fileExtensions[format] || 'json'
      a.download = `hindustan-projects-backup-${new Date().toISOString().slice(0, 10)}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      const now = new Date()
      setLastDownload(now)
      addToast(`Backup file downloaded successfully (${selected.size} tables, ${totalRecords.toLocaleString()} records)`, 'success')
    } catch (err) {
      const errorMsg = err.message || 'Download failed. Please try again.'
      setDlError(errorMsg)
      addToast(errorMsg, 'error')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <SEO title="Data Backup & Export Engine" noIndex />
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        
        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-linear-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <Database className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">Database Backup & Export Engine</h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Super Admin
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Export PostgreSQL tables as JSON, SQL script dumps, or HTML interactive offline reports.
                </p>
              </div>
            </div>

            {/* Quick Metrics Summary Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 min-w-[240px] shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Available Tables:</span>
                <span className="font-bold text-white px-2 py-0.5 bg-brand-blue rounded-md">
                  {tables.length} Tables
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                <span className="text-gray-300">Nightly Snapshot:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Active 2:00 AM Cron
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table Selection & Preset Controls Card ──────────────── */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <h2 className="font-heading text-base font-bold text-gray-900">
                  Select Tables to Include in Export
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose specific database models or use quick presets below.
                </p>
              </div>
            </div>

            {/* Refresh and Preset Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => selectPreset('Core Data', (t) => ['projects', 'clientProjects', 'leads', 'services', 'clients', 'milestones'].includes(t.key))}
                className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Core Data
              </button>
              <button
                type="button"
                onClick={() => selectPreset('Audit & Logs', (t) => ['activities', 'errorLogs', 'chatbotInquiries', 'pageVisits'].includes(t.key))}
                className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Audit & Logs
              </button>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => {
                  refetch()
                  addToast('Refreshed table records count', 'info')
                }}
                className="p-2 text-gray-500 hover:text-brand-blue bg-gray-50 border border-gray-200 rounded-xl hover:bg-blue-50 transition-all cursor-pointer"
                title="Refresh Table Counts"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Rows Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100/70 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-10 bg-red-50/50 border border-red-200 rounded-2xl text-red-600 space-y-2">
              <AlertCircle className="w-6 h-6 mx-auto text-red-500" />
              <p className="text-sm font-bold">Failed to load database table specifications</p>
              <button
                onClick={() => refetch()}
                className="text-xs font-bold bg-white text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tables.map((t) => (
                <TableRow
                  key={t.key}
                  tableKey={t.key}
                  label={t.label}
                  count={t.count}
                  selected={selected.has(t.key)}
                  onToggle={toggleTable}
                />
              ))}
            </div>
          )}

          {/* Export Format Cards */}
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">
              Choose Export File Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'json', label: 'JSON Data', desc: 'Standard restore payload', icon: FileJson },
                { id: 'sql', label: 'SQL Script', desc: 'PostgreSQL restore dump', icon: FileCode },
                { id: 'html', label: 'HTML Report', desc: 'Offline interactive reader', icon: FileSpreadsheet },
              ].map((f) => {
                const Icon = f.icon
                const isSelected = format === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-brand-blue bg-blue-50/60 shadow-xs'
                        : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/80'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-xs sm:text-sm font-bold block ${isSelected ? 'text-brand-blue' : 'text-gray-900'}`}>{f.label}</span>
                      <span className="text-[11px] text-gray-500 block mt-0.5 leading-tight">{f.desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Summary & Download Button */}
          <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                  <Layers className="w-4 h-4 text-brand-blue" />
                  <span>{selected.size} of {tables.length} tables selected</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="font-bold text-gray-900">
                  <span>{totalRecords.toLocaleString()} total records</span>
                </div>
              </div>

              {lastDownload && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Last exported: {lastDownload.toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            {dlError && (
              <div className="flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{dlError}</span>
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading || !someSelected || isLoading}
              className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold py-3.5 rounded-xl text-sm
                shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer
                flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Preparing & Compiling Export File…</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Export Database Backup ({selected.size} Tables, {totalRecords.toLocaleString()} Records)</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-gray-500 font-medium">
              Output Filename Target:{' '}
              <code className="bg-white border border-gray-200 px-2 py-0.5 rounded font-mono text-[11px] text-brand-blue font-bold">
                hindustan-projects-backup-{new Date().toISOString().slice(0, 10)}.{format}
              </code>
            </p>
          </div>

        </div>

        {/* ── Security & Confidentiality Reminder Banner ──────────── */}
        <div className="bg-linear-to-r from-amber-50 to-orange-50/80 border border-amber-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-950 font-heading flex items-center gap-2">
              <span>Super Admin Security & Data Privacy Notice</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Downloaded backup files contain proprietary lead inquiries, staff profiles, and business records. Store backup files in encrypted locations. Password hashes and secret master keys are automatically excluded from exports for safety.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}

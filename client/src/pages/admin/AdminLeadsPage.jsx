/**
 * Admin Leads — Table with status filter + update (premium polish)
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Trash2,
  ChevronDown,
  MessageSquare,
  Mail,
  Phone,
  Filter,
  Inbox,
  Eye,
  X,
  Calendar,
  Download,
  Upload,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO, ConfirmModal } from '@/components/ui'
import AttachmentSection from '@/components/ui/AttachmentSection'
import { useToast } from '@/components/ui/ToastProvider'

const STATUS_CONFIG = {
  NEW: { label: 'New', dot: 'bg-blue-500', pill: 'bg-blue-50 text-blue-700 border-blue-200' },
  CONTACTED: {
    label: 'Contacted',
    dot: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  CLOSED: {
    label: 'Closed',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
}

function PageHeader({ count, onExport, onImport }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-heading">Leads & Inquiries</h1>
        <p className="text-sm text-gray-500">
          Review, contact, and import potential clients submitting web forms.
        </p>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <button
          onClick={onImport}
          className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4 text-gray-500" />
          Import CSV
        </button>
        {onExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-brand-blue/10 hover:shadow-lg hover:shadow-brand-blue/20 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV ({count})
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminLeadsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedLead, setSelectedLead] = useState(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [importStatus, setImportStatus] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemTitle: '',
    onConfirm: null,
  })
  const qc = useQueryClient()
  const toast = useToast()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-leads', statusFilter],
    queryFn: () =>
      api.get('/admin/leads', { params: statusFilter ? { status: statusFilter } : {} }).then((r) => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(`/admin/leads/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-leads'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('Lead updated successfully!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update lead.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/leads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-leads'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      qc.invalidateQueries({ queryKey: ['admin-recycle-bin'] })
      setSelectedLead(null)
      toast.info('Lead deleted.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete lead.')
    },
  })

  const importMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.post('/admin/leads/import', formData)
    },
    onSuccess: (res) => {
      setImportStatus({ type: 'success', message: res.message || 'Leads imported successfully!' })
      qc.invalidateQueries({ queryKey: ['admin-leads'] })
      setCsvFile(null)
    },
    onError: (err) => {
      setImportStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to import leads.',
      })
    },
  })

  const leads = data ?? []

  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Name,Email,Phone,Message,Service Interested,Status,Notes,Estimated Budget\n' +
      'John Doe,john@example.com,+919876543210,Hello interested in website design,Web Development,NEW,Bhilwara client,50000\n' +
      'Jane Smith,jane@example.com,,Looking for branding services,Digital Marketing,CONTACTED,,30000\n'
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'leads_import_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExport = () => {
    if (!leads.length) return
    const headers = ['Name', 'Email', 'Phone', 'Service Interested', 'Status', 'Date', 'Message']
    const rows = leads.map((l) => [
      l.name,
      l.email,
      l.phone || '',
      l.serviceInterested || '',
      l.status,
      new Date(l.createdAt).toLocaleDateString(),
      l.message.replace(/"/g, '""'),
    ])
    // Form CSV content string
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `SnapTech_Digital_Leads_${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <SEO title="Leads" noIndex />
      <div className="space-y-5">
        <PageHeader
          count={isLoading ? null : leads.length}
          onExport={leads.length ? handleExport : null}
          onImport={() => setIsImportModalOpen(true)}
        />

        {/* Info Banner for Careers */}
        <div className="bg-[#f0f4ff] border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5 text-slate-600 leading-normal">
            <AlertCircle className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Looking for Job Applications?</span>{' '}
              Careers, open postings, and candidate resumes are managed separately.
            </div>
          </div>
          <Link
            to="/admin/careers"
            className="text-brand-blue font-bold hover:underline shrink-0 flex items-center gap-1.5"
          >
            Go to Careers Panel <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-brand-blue" />
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>
          <div className="flex gap-2">
            {[
              { v: '', l: 'All' },
              { v: 'NEW', l: 'New' },
              { v: 'CONTACTED', l: 'Contacted' },
              { v: 'CLOSED', l: 'Closed' },
            ].map((opt) => (
              <button
                key={opt.v}
                onClick={() => setStatusFilter(opt.v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  statusFilter === opt.v
                    ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        {isError && (
          <div
            className="flex items-center gap-2.5 text-sm text-red-700 bg-red-50
            border border-red-200 rounded-xl px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            Failed to load leads. Make sure the backend server is running.
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3.5 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-100 rounded-lg animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <Inbox className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm font-medium">No leads yet</p>
                      <p className="text-gray-300 text-xs mt-1">
                        Leads will appear here when visitors submit the contact form
                      </p>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const sc = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW
                    return (
                      <tr key={lead.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full bg-linear-to-br from-brand-blue to-blue-400
                            flex items-center justify-center text-white text-xs font-bold shrink-0"
                            >
                              {lead.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="font-semibold text-gray-900">{lead.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 text-gray-600 text-xs mb-0.5">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {lead.serviceInterested ? (
                              <span className="px-2 py-1 rounded-lg bg-brand-blue/8 text-brand-blue text-xs font-medium border border-brand-blue/15">
                                {lead.serviceInterested}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                            {lead.estimatedBudget && (
                              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-250/60 rounded px-1.5 py-0.5 w-fit">
                                Est: {lead.estimatedBudget}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-500 max-w-xs">
                          <p className="truncate text-xs leading-relaxed">{lead.message}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative">
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                updateMutation.mutate({ id: lead.id, status: e.target.value })
                              }
                              className={`appearance-none text-xs font-semibold pl-5 pr-6 py-1.5 rounded-full border cursor-pointer
                              focus:outline-none focus:ring-2 focus:ring-brand-blue/20 ${sc.pill}`}
                            >
                              <option value="NEW">New</option>
                              <option value="CONTACTED">Contacted</option>
                              <option value="CLOSED">Closed</option>
                            </select>
                            <div
                              className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${sc.dot} pointer-events-none`}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-brand-blue hover:bg-brand-blue/5 transition-all"
                              aria-label="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this lead?'))
                                  deleteMutation.mutate(lead.id)
                              }}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                              aria-label="Delete lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Details Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setSelectedLead(null)}
            />

            {/* Content Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl relative w-full max-w-lg z-10 overflow-hidden flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                  <h3 className="font-heading font-bold text-gray-900 text-base">
                    Contact Lead Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-sm">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                      Sender Name
                    </span>
                    <span className="font-semibold text-gray-800">{selectedLead.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                      Submitted Date
                    </span>
                    <span className="text-gray-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(selectedLead.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="text-brand-blue hover:underline flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {selectedLead.email}
                    </a>
                  </div>
                  {selectedLead.phone && (
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                        Phone Number
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`tel:${selectedLead.phone}`}
                          className="text-brand-blue hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {selectedLead.phone}
                        </a>
                        <a
                          href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedLead.name}, thank you for contacting SnapTech Digital regarding ${selectedLead.serviceInterested || 'your query'}. We received your message: "${selectedLead.message.slice(0, 50)}..."`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] bg-green-500 hover:bg-green-600 text-white font-semibold px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Chat
                        </a>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                      Interested Service
                    </span>
                    {selectedLead.serviceInterested ? (
                      <span className="px-2 py-0.5 rounded-lg bg-brand-blue/8 text-brand-blue text-xs font-semibold border border-brand-blue/15">
                        {selectedLead.serviceInterested}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>
 
                {/* Message Body */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Message Body
                  </span>
                  <div className="bg-white border border-gray-100 p-4 rounded-xl text-gray-700 leading-relaxed text-xs whitespace-pre-wrap max-h-42 overflow-y-auto">
                    {selectedLead.message}
                  </div>
                </div>

                {/* CRM Sales Pipeline & Internal Notes */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">
                    CRM Sales Pipeline
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                        Deal Status
                      </label>
                      <select
                        value={selectedLead.status}
                        onChange={(e) =>
                          updateMutation.mutate({ id: selectedLead.id, status: e.target.value })
                        }
                        className="w-full text-xs font-semibold px-3 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="CLOSED">Closed / Deal Done</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                        Est. Budget / Deal Value
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedLead.estimatedBudget || ''}
                        onBlur={(e) =>
                          updateMutation.mutate({ id: selectedLead.id, estimatedBudget: e.target.value })
                        }
                        placeholder="e.g. ₹50,000"
                        className="w-full text-xs font-semibold px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1 flex items-center justify-between">
                      <span>Internal CRM Notes (Follow-up history)</span>
                      {updateMutation.isPending && (
                        <span className="text-[9px] text-brand-blue animate-pulse lowercase font-medium">saving...</span>
                      )}
                    </label>
                    <textarea
                      rows={3}
                      defaultValue={selectedLead.notes || ''}
                      onBlur={(e) =>
                        updateMutation.mutate({ id: selectedLead.id, notes: e.target.value })
                      }
                      placeholder="Discussed budget, requested custom branding, follow-up call on next Monday..."
                      className="w-full text-xs text-gray-700 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none leading-relaxed"
                    />
                    <span className="text-[9px] text-gray-400 block">Changes are saved automatically when you click outside (onBlur).</span>
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="border-t border-gray-100 pt-4">
                  <AttachmentSection
                    attachments={selectedLead.attachments || []}
                    leadId={selectedLead.id}
                    onUploadSuccess={async () => {
                      const updated = await refetch()
                      const found = updated.data?.find((l) => l.id === selectedLead.id)
                      if (found) {
                        setSelectedLead(found)
                      }
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2 shrink-0">
                <button
                  onClick={() => {
                    setDeleteConfirm({
                      isOpen: true,
                      title: 'Delete Inquiry Lead',
                      message: 'Are you sure you want to permanently delete this lead record from CRM?',
                      itemTitle: `${selectedLead.name} (${selectedLead.email})`,
                      onConfirm: () => {
                        deleteMutation.mutate(selectedLead.id)
                        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))
                      },
                    })
                  }}
                  className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  Delete Lead
                </button>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 text-xs font-semibold bg-brand-blue text-white hover:shadow-md rounded-xl transition-all"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                <h3 className="text-base font-bold text-gray-900 font-heading flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-brand-blue" />
                  Import Leads from CSV
                </h3>
                <button
                  onClick={() => {
                    setIsImportModalOpen(false)
                    setCsvFile(null)
                    setImportStatus(null)
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Notice */}
              {importStatus && (
                <div
                  className={`p-3 rounded-xl text-xs border ${
                    importStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                      : 'bg-red-50 text-red-700 border-red-150'
                  }`}
                >
                  {importStatus.message}
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-2">
                <p>
                  Upload a CSV file containing your leads. The file must include a header row with at least <strong>Name</strong> or <strong>Email</strong> fields.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="text-brand-blue font-bold hover:underline inline-flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download CSV Template
                </button>
              </div>

              {/* Drag n Drop area */}
              <div className="border-2 border-dashed border-gray-250 hover:border-brand-blue rounded-xl p-6 text-center cursor-pointer transition-colors relative bg-gray-50/50">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setCsvFile(e.target.files[0])
                      setImportStatus(null)
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                {csvFile ? (
                  <div>
                    <p className="text-xs font-bold text-gray-800">{csvFile.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {(csvFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-gray-650">
                      Drag and drop your file here, or browse
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Supports CSV files up to 2MB</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-150">
                <button
                  onClick={() => {
                    setIsImportModalOpen(false)
                    setCsvFile(null)
                    setImportStatus(null)
                  }}
                  className="px-4 py-2 border border-gray-255 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (csvFile) {
                      importMutation.mutate(csvFile)
                    }
                  }}
                  disabled={!csvFile || importMutation.isPending}
                  className="px-4 py-2 bg-brand-blue hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-semibold rounded-xl hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirmation Modal ──────────────────────────── */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={deleteConfirm.onConfirm}
          title={deleteConfirm.title}
          message={deleteConfirm.message}
          itemTitle={deleteConfirm.itemTitle}
          confirmText="Delete Lead"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </>
  )
}

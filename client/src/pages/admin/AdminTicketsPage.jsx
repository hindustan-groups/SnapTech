/**
 * AdminTicketsPage.jsx — Enterprise Client Support Desk & Helpdesk Vault
 * Complete support thread management, ticket status tracking, team assignment & SLA monitoring.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/utils/api'
import {
  MessageSquare,
  Send,
  ArrowLeft,
  User,
  Paperclip,
  UserCheck,
  ChevronDown,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  HelpCircle,
  Sparkles,
  Inbox,
  X,
  FileText,
  Tag,
} from 'lucide-react'
import { SEO } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

const TICKET_CATEGORIES = {
  TECHNICAL: 'Technical Issue',
  BILLING: 'Billing & Invoices',
  UPDATE: 'Project Progress Update',
  OTHER: 'General Inquiry',
}

const STATUS_BADGES = {
  OPEN: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 ring-1 ring-indigo-500/20',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200/80 ring-1 ring-amber-500/20',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-250 ring-1 ring-emerald-500/20',
}

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  STAFF: 'Staff',
}

export default function AdminTicketsPage() {
  const qc = useQueryClient()
  const toast = useToast()

  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  // 1. Fetch all tickets
  const {
    data: tickets = [],
    isLoading: loadingList,
    isError: isListError,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: () => api.get('/admin/tickets').then((res) => res.data),
  })

  // 2. Fetch individual ticket details & message thread
  const { data: ticketDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['admin-ticket', selectedTicketId],
    queryFn: () => api.get(`/admin/tickets/${selectedTicketId}`).then((res) => res.data),
    enabled: !!selectedTicketId,
  })

  // 3. Fetch assignable admins list for team lead dropdown
  const { data: assignableAdmins = [] } = useQuery({
    queryKey: ['admin-assignable'],
    queryFn: () => api.get('/admin/users/list-assignable').then((res) => res.data),
  })

  // Mutations
  const replyMutation = useMutation({
    mutationFn: ({ id, message }) => api.post(`/admin/tickets/${id}/messages`, { message }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ticket', selectedTicketId] })
      qc.invalidateQueries({ queryKey: ['admin-tickets'] })
      setReplyText('')
      toast.success('Reply sent to client successfully!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to send reply.')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/tickets/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ticket', selectedTicketId] })
      qc.invalidateQueries({ queryKey: ['admin-tickets'] })
      toast.success('Ticket status updated!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update ticket status.')
    },
  })

  const assignMutation = useMutation({
    mutationFn: ({ id, assignedAdminId }) =>
      api.patch(`/admin/tickets/${id}/assign`, { assignedAdminId: assignedAdminId || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ticket', selectedTicketId] })
      qc.invalidateQueries({ queryKey: ['admin-tickets'] })
      toast.success('Ticket lead reassigned successfully!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to re-assign ticket.')
    },
  })

  // Handlers
  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) {
      toast.error('Reply message cannot be empty.')
      return
    }
    try {
      await replyMutation.mutateAsync({ id: selectedTicketId, message: replyText })
    } catch (_err) {
      // Error toast handled by mutation
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await statusMutation.mutateAsync({ id: selectedTicketId, status: newStatus })
    } catch (_err) {
      // Error toast handled by mutation
    }
  }

  const handleAssignChange = async (newAdminId) => {
    try {
      await assignMutation.mutateAsync({
        id: selectedTicketId,
        assignedAdminId: newAdminId || null,
      })
    } catch (_err) {
      // Error toast handled by mutation
    }
  }

  // Filtered Tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    const q = searchTerm.toLowerCase().trim()
    const matchesSearch =
      !q ||
      t.subject?.toLowerCase().includes(q) ||
      t.client?.email?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  // Counters
  const totalCount = tickets.length
  const openCount = tickets.filter((t) => t.status === 'OPEN').length
  const progressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length

  return (
    <>
      <SEO title="Support Desk Vault" noIndex />
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
                    Support Desk Vault
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Helpdesk SLA
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Manage client support tickets, assign administrative leads, resolve technical or billing inquiries, and track response threads.
                </p>
              </div>
            </div>

            {/* Quick Refresh Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  refetchTickets()
                  toast.info('Support tickets refreshed.')
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 text-white"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Desk</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Metric Cards ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Tickets</p>
              <p className="text-xl font-extrabold font-heading text-gray-900">{totalCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Open Queries</p>
              <p className="text-xl font-extrabold font-heading text-indigo-600">{openCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">In Progress</p>
              <p className="text-xl font-extrabold font-heading text-amber-600">{progressCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resolved Tickets</p>
              <p className="text-xl font-extrabold font-heading text-emerald-600">{resolvedCount}</p>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Controls ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Segmented Status Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl border border-gray-200/80 shrink-0 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Tickets', count: totalCount },
              { id: 'OPEN', label: 'Open', count: openCount },
              { id: 'IN_PROGRESS', label: 'In Progress', count: progressCount },
              { id: 'RESOLVED', label: 'Resolved', count: resolvedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-white text-brand-blue shadow-xs border border-gray-200/80'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.25 rounded-full text-[10px] font-mono font-bold ${
                  statusFilter === tab.id ? 'bg-brand-blue/10 text-brand-blue' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by subject, email, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 shadow-xs"
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

        {/* ── Split Master-Detail Layout ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Panel: Ticket Directory List */}
          <div className={`lg:col-span-1 bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-sm ${selectedTicketId ? 'hidden lg:block' : 'block'}`}>
            <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-heading flex items-center gap-2">
                <Inbox className="w-4 h-4 text-brand-blue" />
                <span>Ticket Threads ({filteredTickets.length})</span>
              </h3>
            </div>

            <div className="divide-y divide-gray-100 max-h-[620px] overflow-y-auto">
              {loadingList ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Loading support tickets...</p>
                </div>
              ) : isListError ? (
                <div className="p-8 text-center text-xs font-bold text-red-500">
                  Failed to load support tickets.
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-12 text-center text-gray-400 space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="text-xs font-bold text-gray-600">No matching tickets found</p>
                  <p className="text-[11px] text-gray-400">Try adjusting your filter or search terms.</p>
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicketId === t.id

                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`w-full text-left p-4 hover:bg-gray-50/80 transition-all flex flex-col gap-2 relative cursor-pointer ${
                        isSelected ? 'bg-blue-50/50 border-l-4 border-brand-blue shadow-xs' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                          {TICKET_CATEGORIES[t.category] || t.category}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider border ${STATUS_BADGES[t.status]}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 font-heading">
                        {t.subject}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                        {t.assignedAdmin ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold">
                            <UserCheck className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{t.assignedAdmin.email}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400 font-medium">
                            <User className="w-3 h-3" />
                            <span>Unassigned</span>
                          </div>
                        )}

                        <span className="text-[9px] text-gray-400 font-mono">
                          {new Date(t.updatedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Panel: Ticket Message Thread & Assignment Bar */}
          <div className={`lg:col-span-2 bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-120 lg:min-h-[620px] ${selectedTicketId ? 'block' : 'hidden lg:flex justify-center items-center text-center p-12'}`}>
            {selectedTicketId ? (
              <>
                {/* Detail Header Bar */}
                <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/60 flex flex-col gap-3 shrink-0">
                  {/* Top Row: Mobile back button, Subject & Status Selector */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedTicketId(null)}
                        className="lg:hidden p-1.5 hover:bg-gray-200/70 rounded-xl text-gray-600 cursor-pointer"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-gray-900 font-heading leading-snug">
                          {loadingDetail ? 'Loading Ticket Details...' : ticketDetail?.subject}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-500 font-mono">
                            Client: <strong className="text-gray-800">{ticketDetail?.client?.email}</strong>
                          </span>
                          {ticketDetail?.clientProject && (
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-blue-50 text-brand-blue border border-blue-200/80">
                              Project: {ticketDetail.clientProject.projectTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status selector */}
                    <div className="flex items-center gap-2">
                      <select
                        value={ticketDetail?.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-3 py-1.5 text-xs font-bold border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 shadow-xs cursor-pointer text-gray-800"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved / Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Team Assignment Bar */}
                  {!loadingDetail && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60">
                      <UserCheck className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">Assign Desk Lead:</span>
                      <div className="relative flex-1 max-w-70">
                        <select
                          value={ticketDetail?.assignedAdminId || ''}
                          onChange={(e) => handleAssignChange(e.target.value)}
                          disabled={assignMutation.isPending}
                          className="w-full pl-3 pr-8 py-1.5 text-xs font-bold border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 appearance-none disabled:opacity-60 cursor-pointer text-gray-800 shadow-xs"
                        >
                          <option value="">— Unassigned —</option>
                          {assignableAdmins.map((admin) => (
                            <option key={admin.id} value={admin.id}>
                              {admin.email} ({ROLE_LABELS[admin.role] || admin.role})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {assignMutation.isPending && (
                        <span className="text-[10px] text-gray-400 animate-pulse font-mono">Saving…</span>
                      )}
                      {!assignMutation.isPending && ticketDetail?.assignedAdmin && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Assigned ✓
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Chat Thread Message Stream */}
                <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto min-h-75 max-h-[420px] bg-slate-50/50">
                  {loadingDetail ? (
                    <div className="flex justify-center items-center h-full py-12">
                      <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    ticketDetail?.messages?.map((msg) => {
                      const isSelf = msg.senderType === 'ADMIN'

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[85%] ${isSelf ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                        >
                          <span className="text-[10px] text-gray-400 font-bold mb-1 px-1">
                            {msg.senderName} ({msg.senderType})
                          </span>

                          <div
                            className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isSelf
                                ? 'bg-linear-to-r from-brand-blue to-blue-700 text-white rounded-tr-none shadow-md'
                                : 'bg-white border border-gray-200/90 text-gray-900 rounded-tl-none shadow-xs'
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words">{msg.message}</div>

                            {/* File Attachment Pill */}
                            {msg.fileUrl && (
                              <div className={`mt-3 flex items-center gap-2 p-2 rounded-xl text-xs ${
                                isSelf
                                  ? 'bg-white/15 border border-white/25 text-white'
                                  : 'bg-gray-50 border border-gray-200 text-gray-800'
                              }`}>
                                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold underline truncate max-w-50 hover:opacity-85"
                                  title={msg.fileName}
                                >
                                  {msg.fileName || 'Download File Attachment'}
                                </a>
                              </div>
                            )}
                          </div>

                          <span className="text-[9px] text-gray-400 mt-1 font-mono px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Quick Reply Form */}
                {!loadingDetail ? (
                  <form onSubmit={handleSendReply} className="p-4 border-t border-gray-100 bg-white flex items-center gap-3 shrink-0">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type an official admin reply..."
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-gray-50/50 focus:bg-white font-sans"
                    />
                    <button
                      type="submit"
                      disabled={replyMutation.isPending || !replyText.trim()}
                      className="px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{replyMutation.isPending ? 'Sending...' : 'Send Reply'}</span>
                    </button>
                  </form>
                ) : null}
              </>
            ) : (
              <div className="space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center mx-auto shadow-inner">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-gray-900 font-heading">No Ticket Selected</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Select a client support ticket from the left panel to review message threads, reassign support leads, or send an official response.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── Guidance Banner ─────────────────────────────────── */}
        <div className="bg-linear-to-r from-blue-50/80 via-slate-50/50 to-blue-50/80 border border-blue-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-brand-blue" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-brand-blue font-heading flex items-center gap-2">
              <span>Client Support SLA &amp; Team Collaboration</span>
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Assigned support team leads receive instant notifications when clients post new queries or project update requests. Resolving tickets updates the client portal workspace status in real-time.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}

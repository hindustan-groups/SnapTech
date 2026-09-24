/**
 * ClientTicketsPage.jsx — Client Portal Support Ticket Desk
 */
import { useState } from 'react'
import {
  useClientTickets,
  useClientTicket,
  useClientCreateTicket,
  useClientReplyTicket,
  useClientProjects,
} from '@/hooks/useClientPortal'
import { MessageSquare, AlertCircle, Plus, Send, X, ArrowLeft, Clock, Paperclip, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { api } from '@/utils/api'

const TICKET_CATEGORIES = [
  { value: 'TECHNICAL', label: 'Technical Issue' },
  { value: 'BILLING', label: 'Billing & Invoices' },
  { value: 'UPDATE', label: 'Project Progress Update' },
  { value: 'OTHER', label: 'General Inquiry' },
]

const STATUS_BADGES = {
  OPEN: 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-white/15 rounded-xl bg-white/4 text-white focus:bg-white/8 focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all placeholder:text-slate-500'

export default function ClientTicketsPage() {
  const { data: tickets = [], isLoading: loadingList } = useClientTickets()
  const { data: projects = [] } = useClientProjects()
  const createMutation = useClientCreateTicket()
  const replyMutation = useClientReplyTicket()

  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyFile, setReplyFile] = useState(null)
  const [createFile, setCreateFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch individual ticket messages
  const { data: ticketDetail, isLoading: loadingDetail } = useClientTicket(selectedTicketId)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      subject: '',
      category: 'TECHNICAL',
      clientProjectId: '',
      description: '',
    },
  })

  const uploadFileToServer = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/client/tickets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  }

  const onCreateSubmit = async (data) => {
    try {
      setIsUploading(true)
      let fileUrl = null
      let fileName = null

      if (createFile) {
        const uploadResult = await uploadFileToServer(createFile)
        fileUrl = uploadResult.fileUrl
        fileName = uploadResult.fileName
      }

      await createMutation.mutateAsync({
        ...data,
        clientProjectId: data.clientProjectId || null,
        fileUrl,
        fileName,
      })
      setShowCreateModal(false)
      setCreateFile(null)
      reset()
    } catch (_err) {
      // Error state handled by mutation toast
    } finally {
      setIsUploading(false)
    }
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() && !replyFile) return

    try {
      setIsUploading(true)
      let fileUrl = null
      let fileName = null

      if (replyFile) {
        const uploadResult = await uploadFileToServer(replyFile)
        fileUrl = uploadResult.fileUrl
        fileName = uploadResult.fileName
      }

      await replyMutation.mutateAsync({
        ticketId: selectedTicketId,
        message: replyText,
        fileUrl,
        fileName,
      })
      setReplyText('')
      setReplyFile(null)
    } catch (_err) {
      // Error state handled by mutation toast
    } finally {
      setIsUploading(false)
    }
  }

  if (loadingList) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Support Tickets</h2>
          <p className="text-sm text-slate-400">Raise inquiries and discuss project updates directly with our technical team.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl text-xs hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Ticket List Panel */}
        <div className={`lg:col-span-1 bg-[#03091e]/90 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl ${selectedTicketId ? 'hidden lg:block' : 'block'}`}>
          <div className="p-4 border-b border-white/10 bg-white/2">
            <h3 className="text-sm font-bold text-white">Ticket Registry</h3>
          </div>

          <div className="divide-y divide-white/5 max-h-150 overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No active support tickets found.</p>
              </div>
            ) : (
              tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full text-left p-4 hover:bg-white/4 transition-colors flex flex-col gap-2 ${
                    selectedTicketId === t.id ? 'bg-cyan-500/10 border-r-4 border-cyan-400' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {TICKET_CATEGORIES.find((cat) => cat.value === t.category)?.label || t.category}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider ${STATUS_BADGES[t.status]}`}>
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{t.subject}</h4>
                  {t.clientProject && (
                    <span className="text-[10px] text-cyan-400 font-medium">
                      Project: {t.clientProject.projectTitle}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-500 self-end">
                    Last active: {new Date(t.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ticket Chat Message Panel */}
        <div className={`lg:col-span-2 bg-[#03091e]/90 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl flex flex-col min-h-112.5 lg:min-h-137.5 ${selectedTicketId ? 'block' : 'hidden lg:flex justify-center items-center text-center p-12'}`}>
          {selectedTicketId ? (
            <>
              {/* Detail Header */}
              <div className="p-4 border-b border-white/10 bg-white/2 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTicketId(null)}
                    className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg text-slate-300"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      {loadingDetail ? 'Loading...' : ticketDetail?.subject}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Ticket ID: {selectedTicketId}
                    </p>
                  </div>
                </div>
                {!loadingDetail && (
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider ${STATUS_BADGES[ticketDetail?.status]}`}>
                    {ticketDetail?.status}
                  </span>
                )}
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-62.5 max-h-95 bg-[#020714]/60">
                {loadingDetail ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  ticketDetail?.messages?.map((msg) => {
                    const isSelf = msg.senderType === 'CLIENT'
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${isSelf ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <span className="text-[9px] text-slate-400 font-semibold mb-1">
                          {msg.senderName}
                        </span>
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isSelf
                              ? 'bg-linear-to-r from-cyan-500 to-blue-600 text-black font-medium rounded-tr-none shadow-md shadow-cyan-500/10'
                              : 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-tl-none shadow-sm'
                          }`}
                        >
                          <div>{msg.message}</div>
                          {msg.fileUrl && (
                            <div className={`mt-2 flex items-center gap-2 p-2 rounded-xl text-[10px] ${
                              isSelf
                                ? 'bg-black/20 border border-black/20 text-black'
                                : 'bg-slate-800/80 border border-white/10 text-cyan-400'
                            }`}>
                              <Paperclip className="w-3 h-3 shrink-0" />
                              <a
                                href={msg.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold underline truncate max-w-45 hover:opacity-85"
                                title={msg.fileName}
                              >
                                {msg.fileName || 'View Attachment'}
                              </a>
                            </div>
                          )}
                        </div>
                        <span className="text-[8px] text-slate-500 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Chat Reply Box */}
              {!loadingDetail && ticketDetail?.status !== 'RESOLVED' ? (
                <div className="p-3 border-t border-white/10 flex flex-col gap-2 shrink-0 bg-[#03091e]">
                  {replyFile && (
                    <div className="flex items-center justify-between bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl text-[10px] text-cyan-200">
                      <div className="flex items-center gap-1.5 truncate">
                        <Paperclip className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-semibold truncate">{replyFile.name}</span>
                        <span className="text-cyan-400/60">({Math.round(replyFile.size / 1024)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyFile(null)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSendReply} className="flex gap-2 items-center">
                    <input
                      type="file"
                      id="reply-file-upload"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setReplyFile(e.target.files[0])
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => document.getElementById('reply-file-upload').click()}
                      className="p-2.5 border border-white/10 text-slate-400 rounded-xl hover:text-cyan-400 hover:bg-white/5 transition-all cursor-pointer"
                      title="Attach file"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={isUploading ? "Uploading attachment..." : "Write a message reply..."}
                      disabled={isUploading}
                      className="flex-1 px-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-50"
                    />

                    <button
                      type="submit"
                      disabled={replyMutation.isPending || isUploading}
                      className="p-2.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center min-w-9.5"
                    >
                      {isUploading ? (
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </form>
                </div>
              ) : ticketDetail?.status === 'RESOLVED' ? (
                <div className="p-4 border-t border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-center flex items-center justify-center gap-2 text-xs font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>This ticket is resolved. You can submit a reply to automatically reopen it.</span>
                  <button
                    onClick={() => {
                      setReplyText('Requesting reopen: ')
                    }}
                    className="ml-2 underline hover:text-emerald-200 font-bold"
                  >
                    Reopen
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto opacity-75" />
              <h4 className="text-sm font-bold text-slate-300">No Ticket Selected</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Select a ticket from the registry list to view the threaded conversation, status logs, and to reply.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#03091e] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/2">
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-cyan-400" />
                <span>Submit Support Inquiry</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreateSubmit)} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website payment portal issue"
                  {...register('subject')}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select {...register('category')} className={inputCls}>
                    {TICKET_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-slate-900 text-white">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Link Project (Optional)</label>
                  <select {...register('clientProjectId')} className={inputCls}>
                    <option value="" className="bg-slate-900 text-white">No Project Link</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {p.projectTitle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Inquiry Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain your problem or inquiry in detail..."
                  {...register('description')}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Attachment (Optional)</label>
                {createFile ? (
                  <div className="flex items-center justify-between bg-slate-900/80 border border-white/10 p-2.5 rounded-xl text-xs text-slate-200">
                    <div className="flex items-center gap-1.5 truncate">
                      <Paperclip className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-semibold truncate">{createFile.name}</span>
                      <span className="text-slate-400">({Math.round(createFile.size / 1024)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreateFile(null)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 bg-slate-900/40 hover:bg-slate-900/70 hover:border-cyan-500/40 transition-all">
                    <input
                      type="file"
                      id="create-file-upload"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setCreateFile(e.target.files[0])
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('create-file-upload').click()}
                      className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold hover:underline cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span>Choose a file (Image, PDF, Word, Excel, ZIP)</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateFile(null)
                  }}
                  className="px-4 py-2 border border-white/10 text-slate-300 rounded-xl hover:bg-white/5 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || isUploading}
                  className="px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl text-xs shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Uploading File...</span>
                    </>
                  ) : (
                    <span>Submit Inquiry</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

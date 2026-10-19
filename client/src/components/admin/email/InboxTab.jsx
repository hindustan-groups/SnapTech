import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Inbox,
  Send,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  RefreshCw,
  Search,
  CheckCircle2,
  UserPlus,
  Reply,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
} from 'lucide-react'
import { api } from '@/utils/api'
import { useToast } from '@/components/ui/ToastProvider'

export default function InboxTab({ accounts = [] }) {
  const [folder, setFolder] = useState('INBOX')
  const [selectedAccountId, setSelectedAccountId] = useState('ALL')
  const [isReadFilter, setIsReadFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedMessageId, setSelectedMessageId] = useState(null)
  const [replyModalMessage, setReplyModalMessage] = useState(null)

  const queryClient = useQueryClient()
  const toast = useToast()

  // ── Query Messages List ───────────────────────────────────────
  const { data: messagesResponse, isLoading: messagesLoading, isFetching: messagesFetching, refetch: refetchMessages } = useQuery({
    queryKey: ['admin-email-messages', folder, selectedAccountId, isReadFilter, searchQuery, page],
    queryFn: () =>
      api.get('/admin/email/messages', {
        params: {
          folder,
          accountId: selectedAccountId,
          isRead: isReadFilter,
          search: searchQuery,
          page,
          limit: 15,
        },
      }),
  })

  // ── Query Single Message Detail ───────────────────────────────
  const { data: messageDetailResponse, isLoading: detailLoading, refetch: refetchDetail } = useQuery({
    queryKey: ['admin-email-message-detail', selectedMessageId],
    queryFn: () => api.get(`/admin/email/messages/${selectedMessageId}`, { params: { markRead: true } }),
    enabled: Boolean(selectedMessageId),
    onSuccess: () => {
      // Refresh list unread count
      queryClient.invalidateQueries(['admin-email-messages'])
      queryClient.invalidateQueries(['admin-email-stats'])
    },
  })

  // ── Sync All Accounts Mutation ────────────────────────────────
  const syncMutation = useMutation({
    mutationFn: () => api.post('/admin/email/sync-all'),
    onSuccess: (res) => {
      toast.success(res.message || 'Mailboxes synchronized successfully.')
      refetchMessages()
      queryClient.invalidateQueries(['admin-email-stats'])
    },
    onError: (err) => {
      toast.error(`Sync failed: ${err.message}`)
    },
  })

  // ── Message Actions Mutations ─────────────────────────────────
  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/admin/email/messages/${id}`, data),
    onSuccess: () => {
      refetchMessages()
      if (selectedMessageId) refetchDetail()
      queryClient.invalidateQueries(['admin-email-stats'])
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMessageMutation = useMutation({
    mutationFn: ({ id, permanent }) =>
      api.delete(`/admin/email/messages/${id}`, { params: { permanent } }),
    onSuccess: (res) => {
      toast.success(res.message || 'Message updated.')
      setSelectedMessageId(null)
      refetchMessages()
      queryClient.invalidateQueries(['admin-email-stats'])
    },
    onError: (err) => toast.error(err.message),
  })

  const createLeadMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/email/messages/${id}/create-lead`, {}),
    onSuccess: (res) => {
      toast.success(res.message || 'Lead created successfully from email.')
      if (selectedMessageId) refetchDetail()
      refetchMessages()
    },
    onError: (err) => toast.error(`Could not create lead: ${err.message}`),
  })

  const messages = messagesResponse?.data?.messages || []
  const pagination = messagesResponse?.data?.pagination || { page: 1, totalPages: 1, total: 0 }
  const unreadCount = messagesResponse?.data?.unreadCount || 0
  const selectedMessage = messageDetailResponse?.data || null

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Folder Navigation */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setFolder('INBOX')
              setSelectedMessageId(null)
              setPage(1)
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              folder === 'INBOX'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            Inbox
            {unreadCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  folder === 'INBOX' ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setFolder('SENT')
              setSelectedMessageId(null)
              setPage(1)
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              folder === 'SENT'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Sent Messages
          </button>

          <button
            onClick={() => {
              setFolder('ARCHIVE')
              setSelectedMessageId(null)
              setPage(1)
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              folder === 'ARCHIVE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            Archive
          </button>

          <button
            onClick={() => {
              setFolder('TRASH')
              setSelectedMessageId(null)
              setPage(1)
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              folder === 'TRASH'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Trash
          </button>
        </div>

        {/* Account Filter & Immediate IMAP Sync Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedAccountId}
            onChange={(e) => {
              setSelectedAccountId(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Configured Accounts</option>
            {accounts.map((acct) => (
              <option key={acct.id} value={acct.id}>
                {acct.displayName || acct.email} ({acct.email})
              </option>
            ))}
          </select>

          <select
            value={isReadFilter}
            onChange={(e) => {
              setIsReadFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Read/Unread</option>
            <option value="false">Unread Only</option>
            <option value="true">Read Only</option>
          </select>

          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Poll Hostinger/Gmail IMAP servers and sync inbound emails"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Syncing...' : 'Sync Mailboxes'}
          </button>
        </div>
      </div>

      {/* Main Mailbox Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Messages List Column */}
        <div className={`${selectedMessageId ? 'hidden lg:block lg:col-span-5' : 'col-span-12'} bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden`}>
          {/* Search Header */}
          <div className="p-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search subject, sender, content..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            {messagesFetching && (
              <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
            )}
          </div>

          {/* Messages Listing */}
          <div className="divide-y divide-gray-100 max-h-[700px] overflow-y-auto">
            {messagesLoading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Inbox className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-gray-800">No messages in {folder}</p>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                  Click &quot;Sync Mailboxes&quot; above to poll Hostinger/Gmail IMAP servers for incoming emails.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelected = selectedMessageId === msg.id
                const isUnread = !msg.isRead
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessageId(msg.id)}
                    className={`p-4 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-blue-600'
                        : isUnread
                        ? 'bg-white hover:bg-gray-50/80 font-medium'
                        : 'bg-gray-50/30 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                        <span
                          className={`text-xs truncate ${
                            isUnread ? 'font-bold text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {msg.direction === 'OUTBOUND'
                            ? `To: ${Array.isArray(msg.to) ? msg.to.join(', ') : msg.to}`
                            : msg.fromName || msg.fromEmail || msg.from}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
                        {msg.receivedAt
                          ? new Date(msg.receivedAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })
                          : ''}
                      </span>
                    </div>

                    <p
                      className={`text-xs truncate mb-1 ${
                        isUnread ? 'font-semibold text-gray-900' : 'text-gray-800'
                      }`}
                    >
                      {msg.subject || '(No Subject)'}
                    </p>

                    <p className="text-[11px] text-gray-400 line-clamp-1 leading-relaxed">
                      {msg.snippet || msg.bodyText || 'No preview text'}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {msg.account && (
                        <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] text-gray-600 font-medium">
                          {msg.account.email}
                        </span>
                      )}
                      {msg.lead && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-[10px] text-emerald-700 font-semibold border border-emerald-200">
                          Lead: {msg.lead.name}
                        </span>
                      )}
                      {msg.direction === 'OUTBOUND' && (
                        <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-[10px] text-purple-700 font-semibold border border-purple-200">
                          Sent
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Message Detail & Conversation Thread Column */}
        {selectedMessageId ? (
          <div className="col-span-12 lg:col-span-7 bg-white border border-gray-100 rounded-2xl shadow-xs p-6 space-y-6">
            {detailLoading ? (
              <div className="p-16 text-center text-xs text-gray-400">Loading conversation...</div>
            ) : !selectedMessage ? (
              <div className="p-12 text-center text-xs text-gray-400">Message not found.</div>
            ) : (
              <>
                {/* Header Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <button
                    onClick={() => setSelectedMessageId(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer lg:hidden"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to List
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reply Action */}
                    <button
                      onClick={() => setReplyModalMessage(selectedMessage)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
                    >
                      <Reply className="w-3.5 h-3.5" /> Reply
                    </button>

                    {/* Create Lead from Email */}
                    {!selectedMessage.leadId && selectedMessage.direction === 'INBOUND' && (
                      <button
                        onClick={() => createLeadMutation.mutate(selectedMessage.id)}
                        disabled={createLeadMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                        {createLeadMutation.isPending ? 'Creating Lead...' : 'Create CRM Lead'}
                      </button>
                    )}

                    {/* Mark Read/Unread */}
                    <button
                      onClick={() =>
                        updateMessageMutation.mutate({
                          id: selectedMessage.id,
                          data: { isRead: !selectedMessage.isRead },
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      {selectedMessage.isRead ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                      {selectedMessage.isRead ? 'Mark Unread' : 'Mark Read'}
                    </button>

                    {/* Archive */}
                    {selectedMessage.folder !== 'ARCHIVE' && (
                      <button
                        onClick={() =>
                          updateMessageMutation.mutate({
                            id: selectedMessage.id,
                            data: { folder: 'ARCHIVE', isArchived: true },
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-medium cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" /> Archive
                      </button>
                    )}

                    {/* Delete / Move to Trash */}
                    <button
                      onClick={() =>
                        deleteMessageMutation.mutate({
                          id: selectedMessage.id,
                          permanent: selectedMessage.folder === 'TRASH',
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {selectedMessage.folder === 'TRASH' ? 'Delete Permanently' : 'Trash'}
                    </button>
                  </div>
                </div>

                {/* Message Meta Info */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 font-heading">
                    {selectedMessage.subject || '(No Subject)'}
                  </h2>

                  <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">From:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedMessage.from} ({selectedMessage.fromEmail})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">To:</span>
                      <span className="text-gray-800">
                        {Array.isArray(selectedMessage.to) ? selectedMessage.to.join(', ') : selectedMessage.to}
                      </span>
                    </div>

                    {selectedMessage.replyTo && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Reply-To:</span>
                        <span className="text-gray-800 font-mono">{selectedMessage.replyTo}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Received / Sent:</span>
                      <span className="text-gray-700">
                        {new Date(selectedMessage.receivedAt || selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {selectedMessage.lead && (
                      <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Linked CRM Lead:
                        </span>
                        <span className="font-bold text-emerald-900">
                          {selectedMessage.lead.name} ({selectedMessage.lead.status} &bull; {selectedMessage.lead.serviceInterested || 'General'})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Body Content */}
                <div className="border border-gray-100 rounded-xl p-5 bg-white text-xs leading-relaxed text-gray-800">
                  {selectedMessage.bodyHtml ? (
                    <div
                      className="prose prose-sm max-w-none break-words overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                    />
                  ) : (
                    <pre className="font-sans whitespace-pre-wrap">{selectedMessage.bodyText || 'No message content available.'}</pre>
                  )}
                </div>

                {/* Conversation Thread History */}
                {selectedMessage.thread && selectedMessage.thread.length > 1 && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      Conversation History ({selectedMessage.thread.length} messages in thread)
                    </h3>
                    <div className="space-y-2">
                      {selectedMessage.thread.map((tm) => (
                        <div
                          key={tm.id}
                          onClick={() => setSelectedMessageId(tm.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            tm.id === selectedMessage.id
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50/50 border-gray-100 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-800">
                              {tm.direction === 'OUTBOUND' ? 'You' : tm.fromEmail}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(tm.receivedAt || tm.sentAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-600 line-clamp-1">{tm.snippet || tm.subject}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex lg:col-span-7 bg-white border border-gray-100 rounded-2xl shadow-xs p-16 flex-col items-center justify-center text-center space-y-3 min-h-[500px]">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 font-heading">No message selected</h3>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Select an email from the left pane to view its full conversation, inspect headers, reply directly, or link to a CRM lead.
            </p>
          </div>
        )}
      </div>

      {/* Direct Reply Modal */}
      {replyModalMessage && (
        <ReplyModal
          message={replyModalMessage}
          accounts={accounts}
          onClose={() => setReplyModalMessage(null)}
          onSuccess={() => {
            setReplyModalMessage(null)
            refetchDetail()
            refetchMessages()
            queryClient.invalidateQueries(['admin-email-stats'])
          }}
        />
      )}
    </div>
  )
}

/**
 * Direct Reply Composer Modal
 */
function ReplyModal({ message, accounts, onClose, onSuccess }) {
  const [replyBody, setReplyBody] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState(
    message.accountId || (accounts.find((a) => a.isDefaultSender)?.id || accounts[0]?.id || '')
  )
  const [subject, setSubject] = useState(
    message.subject?.toLowerCase().startsWith('re:') ? message.subject : `Re: ${message.subject || ''}`
  )

  const toast = useToast()

  const replyMutation = useMutation({
    mutationFn: (payload) => api.post(`/admin/email/messages/${message.id}/reply`, payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Reply dispatched successfully.')
      onSuccess?.()
    },
    onError: (err) => {
      toast.error(`Reply failed: ${err.message}`)
    },
  })

  const handleSendReply = () => {
    if (!replyBody.trim()) {
      toast.warning('Please enter a reply message.')
      return
    }
    replyMutation.mutate({
      message: replyBody,
      senderAccountId: selectedAccountId,
      subject,
    })
  }

  const recipient = message.replyTo || message.fromEmail || (Array.isArray(message.to) ? message.to[0] : '')

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Reply className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 font-heading">
              Reply to {recipient}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-600 font-semibold mb-1">From Sender Account</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {accounts.map((acct) => (
                <option key={acct.id} value={acct.id}>
                  {acct.displayName || acct.email} &lt;{acct.email}&gt;
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Reply Message *</label>
            <textarea
              rows={6}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Type your official reply here..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendReply}
            disabled={replyMutation.isPending}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {replyMutation.isPending ? 'Sending...' : 'Send Official Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}

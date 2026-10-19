import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Server,
  Mail,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Trash2,
  Star,
  Check,
  X,
  Zap,
} from 'lucide-react'
import { api } from '@/utils/api'
import { useToast } from '@/components/ui/ToastProvider'

export default function AccountsTab({ accounts = [], isLoading, onAccountChanged }) {
  const [modalState, setModalState] = useState(null) // null | { mode: 'create' | 'edit', account?: object }
  const [testingId, setTestingId] = useState(null)
  const [syncingId, setSyncingId] = useState(null)

  const queryClient = useQueryClient()
  const toast = useToast()

  // ── Test SMTP Connection Mutation ─────────────────────────────
  const testSmtpMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/email/accounts/${id}/test-smtp`),
    onMutate: (id) => setTestingId(`smtp-${id}`),
    onSuccess: (res) => {
      setTestingId(null)
      toast.success(res.message || 'SMTP Handshake & authentication verified successfully.')
    },
    onError: (err) => {
      setTestingId(null)
      toast.error(`SMTP Test Failed: ${err.message}`)
    },
  })

  // ── Test IMAP Connection Mutation ─────────────────────────────
  const testImapMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/email/accounts/${id}/test-imap`),
    onMutate: (id) => setTestingId(`imap-${id}`),
    onSuccess: (res) => {
      setTestingId(null)
      const data = res.data
      toast.success(
        `IMAP Verified: Connected to ${data.host}:${data.port}. Mailbox '${data.mailbox}' has ${data.totalMessages} messages (${data.unseenMessages} unseen).`
      )
    },
    onError: (err) => {
      setTestingId(null)
      toast.error(`IMAP Test Failed: ${err.message}`)
    },
  })

  // ── Sync Mailbox Mutation ─────────────────────────────────────
  const syncMailboxMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/email/accounts/${id}/sync`),
    onMutate: (id) => setSyncingId(id),
    onSuccess: (res) => {
      setSyncingId(null)
      toast.success(res.message || 'Mailbox sync finished.')
      onAccountChanged?.()
      queryClient.invalidateQueries(['admin-email-messages'])
      queryClient.invalidateQueries(['admin-email-stats'])
    },
    onError: (err) => {
      setSyncingId(null)
      toast.error(`Sync failed: ${err.message}`)
    },
  })

  // ── Set Default Sender Mutation ───────────────────────────────
  const setDefaultMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/email/accounts/${id}`, { isDefaultSender: true }),
    onSuccess: (res) => {
      toast.success(res.message || 'Default sender updated.')
      onAccountChanged?.()
    },
    onError: (err) => toast.error(err.message),
  })

  // ── Toggle Active Mutation ────────────────────────────────────
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/admin/email/accounts/${id}`, { isActive }),
    onSuccess: (res) => {
      toast.success(res.message || 'Account status updated.')
      onAccountChanged?.()
    },
    onError: (err) => toast.error(err.message),
  })

  // ── Delete Account Mutation ───────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/email/accounts/${id}`),
    onSuccess: (res) => {
      toast.success(res.message || 'Account removed.')
      onAccountChanged?.()
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Server className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-gray-900 font-heading">
              Configured Mail Accounts ({accounts.length})
            </h2>
          </div>
          <p className="text-xs text-gray-500 max-w-xl">
            Manage corporate mailboxes (Hostinger, Google Workspace, Custom IMAP/SMTP). Map default senders, department inboxes, and verify bidirectional connections.
          </p>
        </div>

        <button
          onClick={() => setModalState({ mode: 'create' })}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Email Account
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-xs text-gray-400">Loading configured mail accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="col-span-full p-12 bg-white border border-gray-100 rounded-2xl text-center space-y-3">
            <Mail className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-semibold text-gray-800">No email accounts configured yet.</p>
            <p className="text-[11px] text-gray-500">Add info@snaptech.digital or team mailboxes to begin sending and receiving.</p>
          </div>
        ) : (
          accounts.map((acct) => {
            const isSmtpTesting = testingId === `smtp-${acct.id}`
            const isImapTesting = testingId === `imap-${acct.id}`
            const isSyncing = syncingId === acct.id

            return (
              <div
                key={acct.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                  acct.isDefaultSender
                    ? 'border-blue-300 ring-1 ring-blue-100'
                    : acct.isActive
                    ? 'border-gray-200'
                    : 'border-gray-100 opacity-60 bg-gray-50/50'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {acct.provider || 'HOSTINGER'}
                      </span>
                      {acct.isDefaultSender && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-blue-600 text-blue-600" />
                          Default Sender
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleActiveMutation.mutate({ id: acct.id, isActive: !acct.isActive })}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          acct.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title="Click to toggle active status"
                      >
                        {acct.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setModalState({ mode: 'edit', account: acct })}
                        title="Edit Account Configuration"
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {!acct.isDefaultSender && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove account ${acct.email}?`)) {
                              deleteMutation.mutate(acct.id)
                            }
                          }}
                          title="Delete Account"
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Account Name & Email */}
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {acct.displayName || acct.email}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono truncate">{acct.email}</p>
                    {acct.department && (
                      <span className="inline-block mt-1 text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                        Dept: {acct.department}
                      </span>
                    )}
                  </div>

                  {/* Protocol & Connection Details */}
                  <div className="space-y-2 py-3 border-t border-b border-gray-100 text-xs">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Outbound (SMTP):</span>
                      <span className="font-mono text-gray-900 text-[11px]">
                        {acct.smtpHost}:{acct.smtpPort} {acct.smtpSecure ? '(SSL)' : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600">
                      <span>Inbound (IMAP):</span>
                      <span className="font-mono text-gray-900 text-[11px]">
                        {acct.imapHost}:{acct.imapPort} {acct.imapSecure ? '(SSL)' : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600">
                      <span>Sync Status:</span>
                      <span className="flex items-center gap-1 font-medium text-[11px]">
                        {acct.lastSyncStatus === 'SUCCESS' ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Synced
                          </span>
                        ) : acct.lastSyncStatus === 'FAILED' ? (
                          <span className="text-rose-600 flex items-center gap-1" title={acct.lastSyncError}>
                            <AlertCircle className="w-3 h-3" /> Failed
                          </span>
                        ) : (
                          <span className="text-gray-400">Never synced</span>
                        )}
                        {acct.lastSyncAt && (
                          <span className="text-gray-400 text-[10px]">
                            ({new Date(acct.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Actions Bar */}
                <div className="pt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => testSmtpMutation.mutate(acct.id)}
                      disabled={isSmtpTesting}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {isSmtpTesting ? <RefreshCw className="w-3 h-3 animate-spin text-blue-600" /> : <Zap className="w-3 h-3 text-amber-500" />}
                      Test SMTP
                    </button>

                    <button
                      onClick={() => testImapMutation.mutate(acct.id)}
                      disabled={isImapTesting}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {isImapTesting ? <RefreshCw className="w-3 h-3 animate-spin text-blue-600" /> : <ShieldCheck className="w-3 h-3 text-blue-500" />}
                      Test IMAP
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {!acct.isDefaultSender ? (
                      <button
                        onClick={() => setDefaultMutation.mutate(acct.id)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Set as Default Sender
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active Default
                      </span>
                    )}

                    <button
                      onClick={() => syncMailboxMutation.mutate(acct.id)}
                      disabled={isSyncing}
                      className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                      Sync Mailbox
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Account Create/Edit Modal */}
      {modalState && (
        <AccountFormModal
          mode={modalState.mode}
          account={modalState.account}
          onClose={() => setModalState(null)}
          onSuccess={() => {
            setModalState(null)
            onAccountChanged?.()
          }}
        />
      )}
    </div>
  )
}

/**
 * Account Configuration Modal (Add or Edit)
 */
function AccountFormModal({ mode, account, onClose, onSuccess }) {
  const isEdit = mode === 'edit'
  const toast = useToast()

  const [formData, setFormData] = useState({
    email: account?.email || '',
    displayName: account?.displayName || '',
    provider: account?.provider || 'HOSTINGER',
    department: account?.department || 'general',
    replyTo: account?.replyTo || '',
    isDefaultSender: account?.isDefaultSender ?? false,
    isActive: account?.isActive ?? true,
    syncEnabled: account?.syncEnabled ?? true,
    // SMTP
    smtpHost: account?.smtpHost || 'smtp.hostinger.com',
    smtpPort: account?.smtpPort || 465,
    smtpSecure: account?.smtpSecure ?? true,
    smtpUser: account?.smtpUser || '',
    smtpPassword: '',
    // IMAP
    imapHost: account?.imapHost || 'imap.hostinger.com',
    imapPort: account?.imapPort || 993,
    imapSecure: account?.imapSecure ?? true,
    imapUser: account?.imapUser || '',
    imapPassword: '',
    imapMailbox: account?.imapMailbox || 'INBOX',
  })

  // Quick Preset Handlers
  const applyPreset = (type) => {
    if (type === 'HOSTINGER') {
      setFormData((prev) => ({
        ...prev,
        provider: 'HOSTINGER',
        smtpHost: 'smtp.hostinger.com',
        smtpPort: 465,
        smtpSecure: true,
        imapHost: 'imap.hostinger.com',
        imapPort: 993,
        imapSecure: true,
        imapMailbox: 'INBOX',
      }))
    } else if (type === 'GMAIL') {
      setFormData((prev) => ({
        ...prev,
        provider: 'GMAIL',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 465,
        smtpSecure: true,
        imapHost: 'imap.gmail.com',
        imapPort: 993,
        imapSecure: true,
        imapMailbox: 'INBOX',
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        provider: 'CUSTOM',
      }))
    }
  }

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? api.patch(`/admin/email/accounts/${account.id}`, data) : api.post('/admin/email/accounts', data),
    onSuccess: (res) => {
      toast.success(res.message || 'Account configuration saved successfully.')
      onSuccess?.()
    },
    onError: (err) => {
      toast.error(`Save failed: ${err.message}`)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.email.trim()) {
      toast.warning('Email address is required.')
      return
    }
    saveMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-heading">
                {isEdit ? `Edit Account: ${account.email}` : 'Add New Email Account'}
              </h3>
              <p className="text-xs text-gray-500">Configure outbound SMTP &amp; inbound IMAP settings with encrypted secrets.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Buttons */}
        {!isEdit && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Quick Setup Presets
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('HOSTINGER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  formData.provider === 'HOSTINGER'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Hostinger Webmail (Port 465 / 993)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('GMAIL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  formData.provider === 'GMAIL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Google Workspace / Gmail (App Password)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('CUSTOM')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  formData.provider === 'CUSTOM'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Custom SMTP / IMAP
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Basic Account Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                disabled={isEdit}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@snaptech.digital"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="SnapTech Digital Support"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Department / Category</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="sales, support, careers, general"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Reply-To Address</label>
              <input
                type="email"
                value={formData.replyTo}
                onChange={(e) => setFormData({ ...formData, replyTo: e.target.value })}
                placeholder="Optional custom reply-to"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Outbound SMTP Settings */}
          <div className="p-3.5 bg-blue-50/40 border border-blue-100 rounded-xl space-y-3">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
              Outbound SMTP Transmission
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-medium mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={formData.smtpHost}
                  onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">SMTP Port</label>
                <input
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-medium mb-1">SMTP Username</label>
                <input
                  type="text"
                  value={formData.smtpUser}
                  onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                  placeholder="Defaults to email address"
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  SMTP Password {isEdit && <span className="text-gray-400 font-normal">(Leave blank to keep existing)</span>}
                </label>
                <input
                  type="password"
                  value={formData.smtpPassword}
                  onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                  placeholder={isEdit ? '••••••••••••' : 'Enter SMTP password'}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Inbound IMAP Settings */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
              Inbound IMAP Mailbox Synchronization
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-medium mb-1">IMAP Host</label>
                <input
                  type="text"
                  value={formData.imapHost}
                  onChange={(e) => setFormData({ ...formData, imapHost: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">IMAP Port</label>
                <input
                  type="number"
                  value={formData.imapPort}
                  onChange={(e) => setFormData({ ...formData, imapPort: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-medium mb-1">IMAP Username</label>
                <input
                  type="text"
                  value={formData.imapUser}
                  onChange={(e) => setFormData({ ...formData, imapUser: e.target.value })}
                  placeholder="Defaults to email address"
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  IMAP Password {isEdit && <span className="text-gray-400 font-normal">(Leave blank to keep existing)</span>}
                </label>
                <input
                  type="password"
                  value={formData.imapPassword}
                  onChange={(e) => setFormData({ ...formData, imapPassword: e.target.value })}
                  placeholder={isEdit ? '••••••••••••' : 'Enter IMAP password'}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefaultSender}
                onChange={(e) => setFormData({ ...formData, isDefaultSender: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-gray-800">Set as Primary Default Sender</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.syncEnabled}
                onChange={(e) => setFormData({ ...formData, syncEnabled: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-gray-800">Enable Automated 5-Min Sync</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-gray-800">Account Active</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

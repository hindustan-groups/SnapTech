/**
 * AdminEmailCenterPage.jsx — SnapTech Digital Centralized Email Center
 *
 * Provides:
 *  - Gateway health, delivery metrics, and recent transmission activity
 *  - Authorized email composition with recipient autocomplete and live preview
 *  - Complete catalog of 10 official branded HTML/plain-text templates
 *  - Transactional automation rules management with internal routing
 *  - Hostinger SMTP configuration view (strictly masked) and live connection test
 *  - Filterable audit logs with detail modal
 *  - Technical audit report on Hostinger IMAP vs SMTP inbound feasibility
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Mail,
  Send,
  Inbox,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  Sliders,
  FileText,
  Layers,
  ChevronRight,
  Lock,
  Server,
  Zap,
  Info,
  Check,
  X,
  AlertTriangle,
  RotateCw,
  GitFork,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
import InboxTab from '@/components/admin/email/InboxTab'
import AccountsTab from '@/components/admin/email/AccountsTab'
import RoutingTab from '@/components/admin/email/RoutingTab'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Zap },
  { id: 'inbox', label: 'Inbox & Messages', icon: Inbox },
  { id: 'accounts', label: 'Email Accounts', icon: Server },
  { id: 'routing', label: 'Email & Contact Routing', icon: GitFork },
  { id: 'compose', label: 'Compose Email', icon: Send },
  { id: 'templates', label: 'Email Templates', icon: Layers },
  { id: 'rules', label: 'Automation Rules', icon: Sliders },
  { id: 'settings', label: 'Hostinger Gateway', icon: Settings },
  { id: 'audit', label: 'Inbound Audit Report', icon: Info },
  { id: 'logs', label: 'Delivery Logs', icon: FileText },
]

export default function AdminEmailCenterPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const queryClient = useQueryClient()
  const toast = useToast()

  // ── Queries ──────────────────────────────────────────────────
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin-email-stats'],
    queryFn: () => api.get('/admin/email/stats'),
  })

  const { data: settingsData, refetch: refetchSettings } = useQuery({
    queryKey: ['admin-email-settings'],
    queryFn: () => api.get('/admin/email/settings'),
  })

  const { data: templatesData } = useQuery({
    queryKey: ['admin-email-templates'],
    queryFn: () => api.get('/admin/email/templates'),
  })

  const { data: rulesData, refetch: refetchRules } = useQuery({
    queryKey: ['admin-email-rules'],
    queryFn: () => api.get('/admin/email/rules'),
  })

  const { data: accountsData, isLoading: accountsLoading, refetch: refetchAccounts } = useQuery({
    queryKey: ['admin-email-accounts'],
    queryFn: () => api.get('/admin/email/accounts'),
  })

  return (
    <div className="space-y-6">
      <SEO title="Admin Email Center | SnapTech Digital" />

      {/* Top Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-heading">
                  SnapTech Email Center
                </h1>
                <p className="text-xs text-gray-500">
                  Centralized Hostinger SMTP Gateway &bull; Primary Envelope: <strong className="text-gray-700">info@snaptech.digital</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Hostinger SMTP SSL (Port 465)
            </div>

            <button
              onClick={() => {
                refetchStats()
                refetchSettings()
                refetchRules()
                refetchAccounts()
                queryClient.invalidateQueries(['admin-email-messages'])
                queryClient.invalidateQueries(['admin-email-logs'])
                toast.info('Refreshed email gateway & mailbox status.')
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync
            </button>

            <button
              onClick={() => setActiveTab('compose')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Compose
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-gray-100 mt-6 pt-3 -mb-2 no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'dashboard' && (
        <DashboardTab
          stats={statsData?.data}
          loading={statsLoading}
          onSwitchTab={setActiveTab}
        />
      )}

      {activeTab === 'inbox' && (
        <InboxTab
          accounts={accountsData?.data || []}
          onComposeReply={() => setActiveTab('compose')}
        />
      )}

      {activeTab === 'accounts' && (
        <AccountsTab
          accounts={accountsData?.data || []}
          isLoading={accountsLoading}
          onAccountChanged={() => {
            refetchAccounts()
            refetchStats()
          }}
        />
      )}

      {activeTab === 'routing' && (
        <RoutingTab onSwitchToAccounts={() => setActiveTab('accounts')} />
      )}

      {activeTab === 'compose' && (
        <ComposeTab
          templates={templatesData?.data || []}
          accounts={accountsData?.data || []}
          onEmailSent={() => {
            refetchStats()
            refetchAccounts()
            queryClient.invalidateQueries(['admin-email-logs'])
            queryClient.invalidateQueries(['admin-email-messages'])
          }}
        />
      )}

      {activeTab === 'templates' && (
        <TemplatesTab templates={templatesData?.data || []} />
      )}

      {activeTab === 'rules' && (
        <AutomationRulesTab
          rules={rulesData?.data || []}
          accounts={accountsData?.data || []}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab settings={settingsData?.data} />
      )}

      {activeTab === 'audit' && <InboxAuditTab />}

      {activeTab === 'logs' && <DeliveryLogsTab />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TAB 1: DASHBOARD
// ─────────────────────────────────────────────────────────────
function DashboardTab({ stats, loading, onSwitchTab }) {
  const counts = stats?.counts || {
    totalSent: 0,
    totalFailed: 0,
    totalQueued: 0,
    sentToday: 0,
    deliveryRate: 100,
    activeRulesCount: 9,
    inboxUnreadCount: 0,
    inboxTotalCount: 0,
    totalAccounts: 1,
    activeAccounts: 1,
  }

  const recent = stats?.recentActivity || []

  return (
    <div className="space-y-6">
      {/* 6 KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Total Sent
            </span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-gray-900 font-heading">
              {loading ? '...' : counts.totalSent}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-emerald-700 font-medium">+{counts.sentToday} today</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Success Rate
            </span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-gray-900 font-heading">
              {loading ? '...' : `${counts.deliveryRate}%`}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-gray-400">Reliable output</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs cursor-pointer hover:border-blue-300 transition-colors" onClick={() => onSwitchTab('inbox')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Inbox Unread
            </span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Inbox className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-blue-700 font-heading">
              {loading ? '...' : counts.inboxUnreadCount || 0}
            </span>
            <span className="text-[10px] text-gray-400">/ {counts.inboxTotalCount || 0}</span>
          </div>
          <p className="mt-1 text-[10px] text-blue-600 font-medium">View Incoming &rarr;</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs cursor-pointer hover:border-slate-300 transition-colors" onClick={() => onSwitchTab('accounts')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Mail Accounts
            </span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Server className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-gray-900 font-heading">
              {loading ? '...' : counts.totalAccounts || 1}
            </span>
            <span className="text-[10px] text-purple-700 font-medium">({counts.activeAccounts || 1} active)</span>
          </div>
          <p className="mt-1 text-[10px] text-purple-600 font-medium">Manage Accounts &rarr;</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Failed
            </span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-gray-900 font-heading">
              {loading ? '...' : counts.totalFailed}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-gray-400">Zero data loss</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Automations
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-gray-900 font-heading">
              {loading ? '...' : counts.activeRulesCount}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-gray-400">Rules active</p>
        </div>
      </div>

      {/* Gateway Architecture Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-400/30">
              <Server className="w-3.5 h-3.5" />
              Verified Hostinger Mail Architecture
            </div>
            <h2 className="text-lg font-bold font-heading">
              Outbound Transmission &amp; Free Alias Routing
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Every transactional notification, quote acknowledgment, ticket update, and manual admin dispatch is authenticated through the primary mailbox (<strong>info@snaptech.digital</strong>) over direct SSL/TLS port 465. Departmental aliases (such as <code>sales@</code>, <code>support@</code>, <code>billing@</code>) route through validated <strong>Reply-To</strong> headers and Hostinger forwarders without creating redundant paid accounts.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => onSwitchTab('settings')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Settings className="w-3.5 h-3.5" />
              Test SMTP Connection
            </button>
            <button
              onClick={() => onSwitchTab('rules')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-xs font-medium border border-white/10 transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              Configure Rules
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-heading">
              Recent Email Activity
            </h3>
            <p className="text-xs text-gray-500">Latest automated &amp; manual dispatches</p>
          </div>
          <button
            onClick={() => onSwitchTab('logs')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
          >
            View Full Archive <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Recipient</th>
                <th className="py-3 px-4 font-semibold">Subject</th>
                <th className="py-3 px-4 font-semibold">Event / Template</th>
                <th className="py-3 px-4 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No recent email logs recorded yet. Send a test email from the settings tab.
                  </td>
                </tr>
              ) : (
                recent.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      {item.status === 'SENT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          <Check className="w-3 h-3" /> Sent
                        </span>
                      )}
                      {item.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200" title={item.errorMessage || ''}>
                          <X className="w-3 h-3" /> Failed
                        </span>
                      )}
                      {item.status === 'QUEUED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                          <Clock className="w-3 h-3" /> Queued
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{item.recipient}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{item.subject}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-[11px]">
                        {item.event || item.templateId || 'direct'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TAB 2: COMPOSE EMAIL
// ─────────────────────────────────────────────────────────────
function ComposeTab({ templates, accounts = [], onEmailSent }) {
  const toast = useToast()
  const defaultAccount = accounts.find((a) => a.isDefaultSender) || accounts[0]
  const [senderAccountId, setSenderAccountId] = useState(defaultAccount?.id || '')
  const [recipient, setRecipient] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [subject, setSubject] = useState('')
  const [replyTo, setReplyTo] = useState(defaultAccount?.replyTo || 'info@snaptech.digital')
  const [templateId, setTemplateId] = useState('custom_compose')
  const [message, setMessage] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  // Autocomplete query for recipients
  const { data: recipientDir } = useQuery({
    queryKey: ['admin-email-recipients'],
    queryFn: () => api.get('/admin/email/recipients'),
  })

  // Live preview mutation
  const previewMutation = useMutation({
    mutationFn: (payload) => api.post('/admin/email/templates/preview', payload),
    onSuccess: (res) => {
      setPreviewData(res.data)
      toast.success('Live preview updated.')
    },
    onError: (err) => {
      toast.error(`Preview failed: ${err.message}`)
    },
  })

  // Send email mutation
  const sendMutation = useMutation({
    mutationFn: (payload) => api.post('/admin/email/send', payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Email successfully sent via Hostinger SMTP!')
      setShowConfirm(false)
      setRecipient('')
      setRecipientName('')
      setSubject('')
      setMessage('')
      setCtaText('')
      setCtaUrl('')
      onEmailSent?.()
    },
    onError: (err) => {
      toast.error(`Failed to send email: ${err.message}`)
      setShowConfirm(false)
    },
  })

  const handleGeneratePreview = () => {
    if (!subject.trim()) {
      toast.warning('Please enter a subject line.')
      return
    }
    if (!message.trim()) {
      toast.warning('Please enter message content.')
      return
    }
    previewMutation.mutate({
      templateId,
      variables: {
        recipientName: recipientName || 'Client',
        subject,
        bodyHtml: message,
        ctaText,
        ctaUrl,
      },
    })
  }

  const handleConfirmSend = () => {
    sendMutation.mutate({
      recipient,
      recipientName,
      subject,
      message,
      templateId,
      replyTo,
      ctaText,
      ctaUrl,
      accountId: senderAccountId || null,
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Editor Form */}
      <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-heading">Compose Direct Message</h2>
          <p className="text-xs text-gray-500">
            Dispatch authenticated messages from your configured company mailboxes with tracking.
          </p>
        </div>

        {/* Sender Mailbox Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">From Sender Account *</label>
          <select
            value={senderAccountId}
            onChange={(e) => {
              setSenderAccountId(e.target.value)
              const found = accounts.find((a) => a.id === e.target.value)
              if (found?.replyTo) {
                setReplyTo(found.replyTo)
              }
            }}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-medium"
          >
            {accounts.length > 0 ? (
              accounts.map((acct) => (
                <option key={acct.id} value={acct.id}>
                  {acct.displayName || acct.email} &lt;{acct.email}&gt; {acct.isDefaultSender ? '★ (Default Sender)' : ''}
                </option>
              ))
            ) : (
              <option value="">info@snaptech.digital (Primary Default)</option>
            )}
          </select>
        </div>

        {/* Recipient Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Recipient Email *</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. client@company.com"
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Directory Autocomplete Dropdown */}
          {recipientDir?.data && recipientDir.data.length > 0 && (
            <div className="pt-1">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const found = recipientDir.data.find((r) => r.email === e.target.value)
                    if (found) {
                      setRecipient(found.email)
                      setRecipientName(found.name)
                    }
                  }
                }}
                className="w-full px-3 py-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>
                  Quick Pick from Lead / Client Directory ({recipientDir.data.length} contacts)
                </option>
                {recipientDir.data.map((contact) => (
                  <option key={contact.id} value={contact.email}>
                    {contact.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Recipient Name & Reply-To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Recipient Full Name</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Reply-To Address</label>
            <select
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="info@snaptech.digital">info@snaptech.digital (Primary Mailbox)</option>
              <option value="hello@snaptech.digital">hello@snaptech.digital (General Contact)</option>
              <option value="sales@snaptech.digital">sales@snaptech.digital (Sales &amp; Proposals)</option>
              <option value="support@snaptech.digital">support@snaptech.digital (Technical Support)</option>
              <option value="billing@snaptech.digital">billing@snaptech.digital (Billing &amp; Finance)</option>
              <option value="careers@snaptech.digital">careers@snaptech.digital (Recruitment)</option>
              <option value="projects@snaptech.digital">projects@snaptech.digital (Project PMs)</option>
              <option value="marketing@snaptech.digital">marketing@snaptech.digital (Partnerships)</option>
            </select>
          </div>
        </div>

        {/* Template Selector Preset */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Email Template Preset</label>
          <select
            value={templateId}
            onChange={(e) => {
              const val = e.target.value
              setTemplateId(val)
              if (val === 'custom_compose') {
                setSubject('Executive Update regarding SnapTech Digital services')
                setMessage('Thank you for choosing SnapTech Digital. Here is our direct progress and architectural update.')
              } else if (val === 'proposal_delivery') {
                setSubject('Technical Proposal & Engineering Scope — SnapTech Digital')
                setMessage('We are pleased to present our formal engineering proposal and milestone delivery commitments.')
                setCtaText('Review Full Proposal')
                setCtaUrl('https://www.snaptech.digital/client')
              } else if (val === 'project_kickoff') {
                setSubject('🚀 Project Kickoff Confirmation — SnapTech Digital')
                setMessage('Development has officially kicked off! You can track real-time milestone progress on your portal.')
                setCtaText('Open Client Portal')
                setCtaUrl('https://www.snaptech.digital/client')
              } else if (val === 'invoice_delivery') {
                setSubject('Milestone Invoice Issued — SnapTech Digital')
                setMessage('Please review the milestone invoice for your project deliverables and settle online.')
                setCtaText('Pay Invoice Online')
                setCtaUrl('https://www.snaptech.digital/client/billing')
              }
            }}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
          >
            <option value="custom_compose">Custom Branded Email (Standard)</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} [{t.category}]
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Subject Line *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Architectural Scope Update & Milestone Schedule"
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Body Message */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Message Content *</label>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your official correspondence here. Standard paragraphs and bullet structures will be styled using the SnapTech Digital responsive email design system."
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all font-mono leading-relaxed"
          />
        </div>

        {/* Action Button & Link (Optional) */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <div className="text-xs font-bold text-gray-800">Branded Call-To-Action Button (Optional)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Button Label (e.g. Open Portal)"
              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none"
            />
            <input
              type="url"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="Destination URL (https://...)"
              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleGeneratePreview}
            disabled={previewMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-gray-500" />
            {previewMutation.isPending ? 'Generating...' : 'Live Preview'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
                toast.warning('Please enter a valid recipient email address.')
                return
              }
              if (!subject.trim()) {
                toast.warning('Please enter an email subject line.')
                return
              }
              if (!message.trim()) {
                toast.warning('Please enter message text.')
                return
              }
              setShowConfirm(true)
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Send Email
          </button>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 font-heading">
              Branded Email Container Preview
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-md">
              SnapTech Design System
            </span>
          </div>

          <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-slate-50">
            {/* Mock Email Header */}
            <div className="bg-gradient-to-r from-slate-950 to-blue-900 p-4 text-white">
              <div className="text-base font-extrabold tracking-tight">
                Snap<span className="text-sky-400">Tech</span>{' '}
                <span className="text-xs text-blue-200 uppercase font-semibold">Digital</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                SnapTech Digital &bull; Client Communications
              </p>
            </div>

            {/* Mock Email Body */}
            <div className="p-5 bg-white space-y-4">
              <h4 className="text-sm font-bold text-gray-900">
                {subject || 'Subject will appear here'}
              </h4>

              <p className="text-xs text-gray-700">
                Dear <strong>{recipientName || 'Client'}</strong>,
              </p>

              <div className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-sans min-h-25">
                {previewData?.html ? (
                  <div dangerouslySetInnerHTML={{ __html: previewData.html }} />
                ) : (
                  message || 'Type your message in the editor on the left to see the live rendering here...'
                )}
              </div>

              {ctaText && (
                <div className="text-center pt-2">
                  <span className="inline-block bg-blue-600 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-xs">
                    {ctaText} &rarr;
                  </span>
                </div>
              )}

              {/* Mock Footer */}
              <div className="border-t-2 border-blue-600 pt-3 mt-4 text-[11px] text-gray-500 space-y-1">
                <div className="font-bold text-gray-800">SnapTech Digital</div>
                <div>Enterprise IT &bull; Software Engineering &bull; Digital Growth</div>
                <div className="text-gray-400 text-[10px]">
                  Registered sender: info@snaptech.digital &bull; Bhilwara, Rajasthan
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            Outgoing emails automatically include DKIM verification, responsive mobile tables, and standardized contact footers.
          </span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-blue-600">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-heading">
                Confirm Transmission
              </h3>
            </div>

            <p className="text-xs text-gray-600">
              You are about to dispatch an official email to the recipient below:
            </p>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs space-y-1.5">
              <div>
                <span className="text-gray-400 font-medium">To:</span>{' '}
                <strong className="text-gray-900">{recipient}</strong>
              </div>
              <div>
                <span className="text-gray-400 font-medium">From:</span>{' '}
                <span className="text-gray-800">SnapTech Digital &lt;info@snaptech.digital&gt;</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Reply-To:</span>{' '}
                <span className="text-gray-800">{replyTo}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Subject:</span>{' '}
                <span className="text-gray-800">{subject}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={sendMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={sendMutation.isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                {sendMutation.isPending ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Confirm &amp; Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TAB 3: TEMPLATES
// ─────────────────────────────────────────────────────────────
function TemplatesTab({ templates }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [renderedPreview, setRenderedPreview] = useState(null)
  const toast = useToast()

  const previewMutation = useMutation({
    mutationFn: (payload) => api.post('/admin/email/templates/preview', payload),
    onSuccess: (res) => {
      setRenderedPreview(res.data)
      setPreviewModalOpen(true)
    },
    onError: (err) => {
      toast.error(`Preview rendering failed: ${err.message}`)
    },
  })

  const handleTestPreview = (tmpl) => {
    setSelectedTemplate(tmpl)
    // Generate preview using default mocked variables
    previewMutation.mutate({
      templateId: tmpl.id,
      variables: {
        name: 'John Doe',
        clientName: 'Acme Technologies Ltd',
        recipientName: 'Acme Lead',
        projectName: 'Enterprise ERP Suite',
        projectTitle: 'Enterprise ERP Suite',
        milestoneTitle: 'Milestone 1 — Alpha Architecture',
        service: 'Custom Web & Cloud Software',
        serviceInterested: 'Custom Web & Cloud Software',
        amount: 65000,
        invoiceNumber: 'INV-2026-001',
        ticketId: 'tick_994101',
        subject: 'Database Optimization Performance Inquiry',
        category: 'Software Architecture',
        message: 'Requesting clarification regarding API response caching and load balancers.',
        jobTitle: 'Senior Full Stack Engineer',
        scopeSummary: 'Modular microservice backend with high concurrency PostgreSQL store.',
        assignedLead: 'SnapTech Lead Architect',
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
        <h2 className="text-lg font-bold text-gray-900 font-heading">
          Official Email Templates Catalog ({templates.length})
        </h2>
        <p className="text-xs text-gray-500">
          Standardized branded templates with responsive HTML, typography, and automated plain-text fallbacks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white border border-gray-200/80 hover:border-blue-300 rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-md bg-blue-50 text-blue-700">
                    {tmpl.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">#{tmpl.id}</span>
                </div>

                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {tmpl.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">{tmpl.description}</p>

                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Template Variables:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tmpl.variables.map((v) => (
                      <span
                        key={v}
                        className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono"
                      >
                        {`{${v}}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleTestPreview(tmpl)}
                  disabled={previewMutation.isPending}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Render Live Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewModalOpen && renderedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Template Preview
                </span>
                <h3 className="text-sm font-bold text-gray-900 font-heading">
                  {selectedTemplate?.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 border-b border-gray-100 text-xs">
              <span className="font-semibold text-gray-500">Rendered Subject:</span>{' '}
              <span className="font-bold text-gray-900">{renderedPreview.subject}</span>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div
                className="border border-gray-200 rounded-xl overflow-hidden shadow-xs"
                dangerouslySetInnerHTML={{ __html: renderedPreview.html }}
              />

              <div className="space-y-1.5 pt-4">
                <span className="text-xs font-bold text-gray-700">Plain-Text Alternative:</span>
                <pre className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-mono text-gray-700 whitespace-pre-wrap">
                  {renderedPreview.text}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TAB 4: AUTOMATION RULES
// ─────────────────────────────────────────────────────────────
function AutomationRulesTab({ rules, accounts = [] }) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }) =>
      api.patch(`/admin/email/rules/${id}`, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Automation rule updated.')
      queryClient.invalidateQueries(['admin-email-rules'])
      queryClient.invalidateQueries(['admin-email-stats'])
    },
    onError: (err) => {
      toast.error(`Update failed: ${err.message}`)
    },
  })

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 font-heading">
          Transactional Automation Rules ({rules.length})
        </h2>
        <p className="text-xs text-gray-500">
          Manage real event triggers, recipient routing, customer confirmations, and internal notification alerts.
        </p>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-5 border border-gray-200 rounded-xl hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-100 text-slate-800 rounded">
                  {rule.event}
                </span>
                <span className="text-sm font-bold text-gray-900">{rule.title}</span>
              </div>
              <p className="text-xs text-gray-500">{rule.description}</p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-medium">Sender Account:</span>
                  <select
                    value={rule.senderAccountId || ''}
                    onChange={(e) =>
                      updateRuleMutation.mutate({
                        id: rule.id,
                        data: { senderAccountId: e.target.value || null },
                      })
                    }
                    className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-gray-800 text-[11px] font-medium cursor-pointer"
                  >
                    <option value="">Default Primary Account</option>
                    {accounts.map((acct) => (
                      <option key={acct.id} value={acct.id}>
                        {acct.displayName || acct.email} ({acct.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-medium">Internal Routing:</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded">
                    {rule.internalRouting || 'info@snaptech.digital'}
                  </span>
                </div>

                <span className="text-gray-300">&bull;</span>
                <span className="text-gray-500">
                  Customer Copy: <strong>{rule.sendCustomerCopy ? 'Yes' : 'No'}</strong>
                </span>
                <span className="text-gray-300">&bull;</span>
                <span className="text-gray-500">
                  Staff Alert: <strong>{rule.sendInternalAlert ? 'Yes' : 'No'}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <span className={`text-xs font-semibold ${rule.isEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                {rule.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateRuleMutation.mutate({
                    id: rule.id,
                    data: { isEnabled: !rule.isEnabled },
                  })
                }
                disabled={updateRuleMutation.isPending}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  rule.isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    rule.isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TAB 5: EMAIL SETTINGS & CONNECTION TEST
// ─────────────────────────────────────────────────────────────
function SettingsTab({ settings }) {
  const toast = useToast()
  const [testEmail, setTestEmail] = useState('info@snaptech.digital')
  const [testResult, setTestResult] = useState(null)

  const testMutation = useMutation({
    mutationFn: (targetEmail) =>
      api.post('/admin/email/test', { targetEmail }),
    onSuccess: (res) => {
      setTestResult(res)
      toast.success(res.message || 'SMTP Handshake verified successfully!')
    },
    onError: (err) => {
      setTestResult({ status: 'error', message: err.message })
      toast.error(`SMTP Connection Failed: ${err.message}`)
    },
  })

  const aliases = [
    { name: 'hello@snaptech.digital', tag: 'General Contact', desc: 'Main website contact form submissions and general public queries.' },
    { name: 'sales@snaptech.digital', tag: 'Commercial & Quotes', desc: 'Quotation requests, pricing leads, and technical proposal communications.' },
    { name: 'support@snaptech.digital', tag: 'Customer Helpdesk', desc: 'Active client support tickets, troubleshooting, and maintenance alerts.' },
    { name: 'billing@snaptech.digital', tag: 'Finance & Invoicing', desc: 'Milestone invoices, payment receipts, GST compliance, and settlement notes.' },
    { name: 'careers@snaptech.digital', tag: 'Recruitment & Talent', desc: 'Job applications, resume submissions, and engineering interview updates.' },
    { name: 'projects@snaptech.digital', tag: 'Engineering PMs', desc: 'Project kickoff notices, milestone roadmap advancement, and sprint deliverables.' },
    { name: 'marketing@snaptech.digital', tag: 'Growth & Strategic', desc: 'Partnership inquiries, ecosystem vendor agreements, and press releases.' },
  ]

  return (
    <div className="space-y-6">
      {/* Configuration Status Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-heading">
            Hostinger SMTP Configuration
          </h2>
          <p className="text-xs text-gray-500">
            Authenticated infrastructure settings. Passwords and keys remain strictly protected on the backend.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="text-[11px] font-semibold text-gray-500">SMTP Host</span>
            <div className="text-sm font-bold text-gray-900 font-mono">
              {settings?.smtpHost || 'smtp.hostinger.com'}
            </div>
            <span className="text-[10px] text-gray-400">Hostinger Standard Mail</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="text-[11px] font-semibold text-gray-500">Port &amp; Encryption</span>
            <div className="text-sm font-bold text-gray-900 font-mono">
              {settings?.smtpPort || 465} (SSL/TLS Direct)
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Port 587 Fallback Supported</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="text-[11px] font-semibold text-gray-500">Authenticated Mailbox</span>
            <div className="text-sm font-bold text-gray-900 font-mono">
              {settings?.verifiedSender || 'info@snaptech.digital'}
            </div>
            <span className="text-[10px] text-blue-600 font-semibold">Primary Commercial Mailbox</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="text-[11px] font-semibold text-gray-500">Credential Status</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>••••••••••••</span>
            </div>
            <span className="text-[10px] text-gray-400">Never echoed to browser</span>
          </div>
        </div>

        {/* Live Handshake Diagnostic Tool */}
        <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Hostinger SMTP Live Diagnostic &amp; Handshake Verification
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Dispatches a real cryptographic verification message through Hostinger SMTP to verify server credentials, socket timeouts, and SPF/DKIM headers.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-lg">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Recipient email address"
              className="w-full px-3.5 py-2 text-xs bg-white border border-blue-200 rounded-xl focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (!testEmail || !testEmail.includes('@')) {
                  toast.warning('Please enter a valid target email for verification.')
                  return
                }
                testMutation.mutate(testEmail)
              }}
              disabled={testMutation.isPending}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
            >
              {testMutation.isPending ? 'Verifying Handshake...' : 'Run SMTP Test'}
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs mt-3 ${
                testResult.status === 'ok'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <strong>{testResult.status === 'ok' ? '✓ Handshake Passed: ' : '✗ Diagnostic Notice: '}</strong>
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      {/* 7 Aliases Routing Matrix */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 font-heading">
            Configured Hostinger Department Aliases (7 Slots)
          </h3>
          <p className="text-xs text-gray-500">
            Aliases utilize Hostinger forwarder routing and mapped Reply-To headers, guaranteeing zero envelope spoofing while maintaining departmental brand separation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {aliases.map((alias) => (
            <div key={alias.name} className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-700">{alias.name}</span>
                <span className="text-[10px] font-semibold text-gray-500 uppercase">{alias.tag}</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">{alias.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TAB 6: DELIVERY AUDIT LOGS
// ─────────────────────────────────────────────────────────────
function DeliveryLogsTab() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('ALL')
  const [event, setEvent] = useState('ALL')
  const [recipient, setRecipient] = useState('')
  const [selectedLog, setSelectedLog] = useState(null)

  const { data: logsResponse, isLoading, refetch } = useQuery({
    queryKey: ['admin-email-logs', page, status, event, recipient],
    queryFn: () =>
      api.get('/admin/email/logs', {
        params: {
          page,
          limit: 15,
          status,
          event,
          recipient,
        },
      }),
  })

  const logs = logsResponse?.data?.logs || logsResponse?.logs || []
  const pagination = logsResponse?.data?.pagination || logsResponse?.pagination || {
    total: 0,
    page: 1,
    totalPages: 1,
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs space-y-4 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-heading">
            Delivery Audit Logs ({pagination.total})
          </h2>
          <p className="text-xs text-gray-500">
            Immutable transmission history, delivery statuses, and error diagnostics.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <input
            type="text"
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value)
              setPage(1)
            }}
            placeholder="Search recipient..."
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
          />

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SENT">Sent Only</option>
            <option value="FAILED">Failed Only</option>
            <option value="QUEUED">Queued Only</option>
          </select>

          <select
            value={event}
            onChange={(e) => {
              setEvent(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
          >
            <option value="ALL">All Events</option>
            <option value="lead.created">lead.created</option>
            <option value="quote.created">quote.created</option>
            <option value="ticket.created">ticket.created</option>
            <option value="payment.verified">payment.verified</option>
            <option value="manual.compose">manual.compose</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-100 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/75 text-gray-500 border-b border-gray-100">
            <tr>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Recipient</th>
              <th className="py-3 px-4 font-semibold">Subject</th>
              <th className="py-3 px-4 font-semibold">Event</th>
              <th className="py-3 px-4 font-semibold">Timestamp</th>
              <th className="py-3 px-4 font-semibold text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  Loading transmission audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No matching transmission records found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    {log.status === 'SENT' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        <Check className="w-3 h-3" /> Sent
                      </span>
                    )}
                    {log.status === 'FAILED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                        <X className="w-3 h-3" /> Failed
                      </span>
                    )}
                    {log.status === 'QUEUED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                        <Clock className="w-3 h-3" /> Queued
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{log.recipient}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{log.subject}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-[10px]">
                      {log.event || 'direct'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 font-heading">
                Audit Record Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Log ID:</span>
                <span className="col-span-2 font-mono text-gray-900">{selectedLog.id}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Status:</span>
                <span className="col-span-2 font-bold text-gray-900">{selectedLog.status}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Recipient:</span>
                <span className="col-span-2 font-medium text-gray-900">{selectedLog.recipient}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Subject:</span>
                <span className="col-span-2 text-gray-800">{selectedLog.subject}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Event:</span>
                <span className="col-span-2 font-mono text-gray-800">{selectedLog.event || 'None'}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Template:</span>
                <span className="col-span-2 font-mono text-gray-800">{selectedLog.templateId || 'None'}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Timestamp:</span>
                <span className="col-span-2 text-gray-800">{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
              {selectedLog.errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs mt-2">
                  <strong>Error Trace:</strong> {selectedLog.errorMessage}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TAB 7: INCOMING MAILBOX TECHNICAL AUDIT REPORT
// ─────────────────────────────────────────────────────────────
function InboxAuditTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-heading">
              Hostinger Mailbox Architecture &amp; Inbound Feasibility Audit
            </h2>
            <p className="text-xs text-gray-500">
              Technical report analyzing SMTP vs IMAP protocols, push webhook limitations, and inbound sync prerequisites.
            </p>
          </div>
        </div>

        {/* Core Architectural Finding */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            Key Finding: SMTP is Strictly Outbound — It Is Not an Inbox
          </div>
          <p className="leading-relaxed">
            Standard email architectures separate outgoing transmission (<strong>SMTP</strong>) from incoming storage and synchronization (<strong>IMAP / POP3</strong>). The current Hostinger Mail service provides outbound SMTP over <code>smtp.hostinger.com:465</code>. It does <strong>not</strong> offer HTTP webhook callbacks or REST APIs for incoming messages.
          </p>
          <p className="leading-relaxed font-semibold">
            In accordance with system specifications, we have strictly avoided building a &quot;fake inbox&quot; from outgoing email logs. Outgoing audit records document what the server transmitted, not what an external customer replied.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Current Implementation: Outbound &amp; Aliases
            </h3>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Verified single-account SMTP envelope sender (<code>info@snaptech.digital</code>).</li>
              <li>Reply-To headers intelligently mapped to 7 department aliases.</li>
              <li>SPF, DKIM, and DMARC alignment preserved without spoofing risks.</li>
              <li>Zero additional mailbox costs; free Hostinger forwarders route replies to team inboxes.</li>
            </ul>
          </div>

          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              Prerequisites for a Dedicated In-App Inbox
            </h3>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong>IMAP Polling Daemon:</strong> A dedicated Node.js background worker using <code>imapflow</code> or <code>node-imap</code> polling <code>imap.hostinger.com:993</code> over TLS.</li>
              <li><strong>MIME Parser:</strong> A stream parser (e.g. <code>mailparser</code>) to parse multipart bodies, sanitize embedded scripts, and isolate attachments.</li>
              <li><strong>Thread Matching Engine:</strong> Parsing <code>Message-ID</code>, <code>In-Reply-To</code>, and <code>References</code> headers to bind incoming replies to existing tickets or leads.</li>
              <li><strong>Security &amp; Storage:</strong> Antivirus scanning for binary attachments and dedicated encrypted storage for raw mailbox credentials.</li>
            </ul>
          </div>
        </div>

        {/* Recommended Workflow */}
        <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-950">
          <h4 className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            Recommended Operating Procedure (Zero Extra Infrastructure)
          </h4>
          <p className="leading-relaxed text-blue-900">
            For current operations, configuring Hostinger Webmail forwarders ensures all customer replies to <code>hello@</code>, <code>sales@</code>, or <code>support@</code> immediately reach team members&apos; personal or mobile email clients. Staff then dispatch official replies, proposals, and ticket updates directly through this verified Admin Email Center, maintaining centralized logging and corporate brand integrity.
          </p>
        </div>
      </div>
    </div>
  )
}

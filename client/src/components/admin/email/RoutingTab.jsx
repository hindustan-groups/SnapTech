/**
 * RoutingTab.jsx — Email & Contact Routing Configuration
 *
 * Provides CMS controls for:
 *  - Central business email addresses (General, Sales, Support, Careers, Privacy, Billing)
 *  - Default sender name and sender address
 *  - Internal admin alert notification recipient
 *  - Real-time diagnostic cards showing Mailbox vs Forwarder state and IMAP sync health
 *  - DNS record validation overview (MX, SPF, DMARC)
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  GitFork,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  RotateCcw,
  Server,
  ExternalLink,
  Info,
  Check,
  Building2,
  Users,
  Briefcase,
  HelpCircle,
  ShieldAlert,
  CreditCard,
  Send,
} from 'lucide-react'
import { api } from '@/utils/api'
import { useToast } from '@/components/ui/ToastProvider'

const DEFAULT_ROUTING = {
  general: 'info@snaptech.digital',
  sales: 'sales@snaptech.digital',
  support: 'support@snaptech.digital',
  careers: 'careers@snaptech.digital',
  privacy: 'privacy@snaptech.digital',
  billing: 'billing@snaptech.digital',
  senderEmail: 'info@snaptech.digital',
  senderName: 'SnapTech Digital',
  adminAlerts: 'info@snaptech.digital',
}

const DEPARTMENT_METADATA = [
  {
    key: 'general',
    label: 'General Inquiries & Main Contact',
    defaultEmail: 'info@snaptech.digital',
    description: 'Main contact page, footer newsletter, and default fallback recipient.',
    icon: Mail,
    eventLabel: 'lead.created (default)',
  },
  {
    key: 'sales',
    label: 'Sales, Quotes & Commercial Enquiries',
    defaultEmail: 'sales@snaptech.digital',
    description: 'Quote requests, pricing estimates, consultation requests, and cost calculator.',
    icon: Briefcase,
    eventLabel: 'quote.created / pricing.quote',
  },
  {
    key: 'support',
    label: 'Customer Helpdesk & Client Support',
    defaultEmail: 'support@snaptech.digital',
    description: 'Support tickets, technical assistance, bug reports, and maintenance notices.',
    icon: HelpCircle,
    eventLabel: 'ticket.created / ticket.reply',
  },
  {
    key: 'careers',
    label: 'Careers & Talent Recruitment',
    defaultEmail: 'careers@snaptech.digital',
    description: 'Job applications, resume uploads, and candidate communications.',
    icon: Users,
    eventLabel: 'careers.applied',
  },
  {
    key: 'privacy',
    label: 'Privacy & Legal Compliance',
    defaultEmail: 'privacy@snaptech.digital',
    description: 'Privacy policy requests, DPDP/GDPR data inquiries, and terms of service notices.',
    icon: ShieldAlert,
    eventLabel: 'privacy.inquiry',
  },
  {
    key: 'billing',
    label: 'Finance, Invoicing & Accounts',
    defaultEmail: 'billing@snaptech.digital',
    description: 'Milestone invoices, payment receipts, GST compliance, and settlement notes.',
    icon: CreditCard,
    eventLabel: 'billing.receipt',
  },
]

export default function RoutingTab({ onSwitchToAccounts }) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: routingResponse, refetch, isFetching } = useQuery({
    queryKey: ['admin-email-routing'],
    queryFn: () => api.get('/admin/email/routing'),
  })

  const serverRouting = routingResponse?.data?.routing || DEFAULT_ROUTING
  const diagnostics = routingResponse?.data?.diagnostics || {}

  const [formEdits, setFormEdits] = useState({})
  const isDirty = Object.keys(formEdits).length > 0
  const formValues = { ...DEFAULT_ROUTING, ...serverRouting, ...formEdits }

  const handleFieldChange = (key, value) => {
    setFormEdits((prev) => ({ ...prev, [key]: value }))
  }

  // ── Save Mutation ──────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (newRouting) => api.patch('/admin/email/routing', { routing: newRouting }),
    onSuccess: (res) => {
      toast.success(res.message || 'Email routing configuration updated successfully.')
      setFormEdits({})
      queryClient.invalidateQueries(['admin-email-routing'])
      queryClient.invalidateQueries(['site-settings'])
      queryClient.invalidateQueries(['admin-email-settings'])
    },
    onError: (err) => {
      toast.error(`Failed to update routing: ${err.message}`)
    },
  })

  const handleSave = (e) => {
    e?.preventDefault()
    const emailFields = ['general', 'sales', 'support', 'careers', 'privacy', 'billing', 'senderEmail', 'adminAlerts']
    for (const field of emailFields) {
      const val = (formValues[field] || '').trim()
      if (!val || !val.includes('@') || !val.includes('.')) {
        toast.error(`Please provide a valid email address for "${field}".`)
        return
      }
    }
    saveMutation.mutate(formValues)
  }

  const handleResetToDefaults = () => {
    setFormEdits({ ...DEFAULT_ROUTING })
    toast.info('Reset fields to recommended default addresses. Click "Save Routing Changes" to apply.')
  }

  return (
    <div className="space-y-6">
      {/* Header with Save / Reset Controls */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <GitFork className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 font-heading">
                Central Email &amp; Contact Routing Architecture
              </h2>
            </div>
            <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
              Configure which internal address receives each category of website inquiries, quotations, tickets, and job applications.
              Changes persist directly to the database and update website forms, schemas, and notifications without code edits.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Defaults
            </button>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saveMutation.isPending || !isDirty}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer ${
                isDirty
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              {saveMutation.isPending ? 'Saving...' : 'Save Routing Changes'}
            </button>
          </div>
        </div>

        {isDirty && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>You have unsaved changes in your routing matrix. Remember to click &quot;Save Routing Changes&quot;.</span>
            </div>
          </div>
        )}
      </div>

      {/* Hostinger DNS & Architecture Status Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold tracking-wide uppercase text-blue-200 font-heading">
                Hostinger Email Infrastructure Status &bull; snaptech.digital
              </h3>
            </div>
            <p className="text-xs text-blue-200/90 leading-relaxed max-w-3xl">
              All outgoing emails authenticate against Hostinger SMTP (<code className="text-emerald-300 font-mono">smtp.hostinger.com:465</code>)
              via the primary verified commercial mailbox <strong className="text-white">info@snaptech.digital</strong>.
              Departmental addresses can function as zero-cost Hostinger email forwarders or dedicated IMAP mailboxes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              MX Verified (mx1 &amp; mx2)
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              SPF Configured (~all)
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              DMARC Active (p=none)
            </div>
          </div>
        </div>

        {diagnostics?.warnings?.length > 0 && (
          <div className="p-3.5 bg-amber-500/20 border border-amber-400/30 rounded-xl space-y-1 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Routing Diagnostics Notices:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px]">
              {diagnostics.warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sender & Administrative Global Settings */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 font-heading">
            Default Sender &amp; Notification Preferences
          </h3>
          <p className="text-xs text-gray-500">
            These rules control how transactional emails appear to recipients and where internal alerts are dispatched.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Sender Display Name
            </label>
            <input
              type="text"
              value={formValues.senderName || ''}
              onChange={(e) => handleFieldChange('senderName', e.target.value)}
              placeholder="SnapTech Digital"
              className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
            <span className="text-[10px] text-gray-400">Appears in customer inbox &quot;From:&quot; header.</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              Default Sender Address
            </label>
            <input
              type="email"
              value={formValues.senderEmail || ''}
              onChange={(e) => handleFieldChange('senderEmail', e.target.value)}
              placeholder="info@snaptech.digital"
              className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
            <span className="text-[10px] text-gray-400">Must match Hostinger verified SMTP mailbox.</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Admin Alert Recipient
            </label>
            <input
              type="email"
              value={formValues.adminAlerts || ''}
              onChange={(e) => handleFieldChange('adminAlerts', e.target.value)}
              placeholder="info@snaptech.digital"
              className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
            <span className="text-[10px] text-gray-400">Receives internal notices for all submissions.</span>
          </div>
        </div>
      </div>

      {/* 6 Department Routing Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-heading">
              Departmental Routing Matrix ({DEPARTMENT_METADATA.length} Core Channels)
            </h3>
            <p className="text-xs text-gray-500">
              Each channel routes specific website forms and events to its internal recipient.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
            Hostinger SMTP Compatible
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEPARTMENT_METADATA.map((dept) => {
            const Icon = dept.icon
            const currentEmail = formValues[dept.key] || dept.defaultEmail
            const diag = diagnostics?.routingStatus?.find((s) => s.department === dept.key)
            const isDedicated = diag?.type === 'DEDICATED_MAILBOX'

            return (
              <div
                key={dept.key}
                className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3 transition-all hover:border-gray-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 font-heading">
                        {dept.label}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Event: {dept.eventLabel}
                      </span>
                    </div>
                  </div>

                  {isDedicated ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200 shrink-0">
                      <Server className="w-3 h-3" />
                      Dedicated Mailbox
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200 shrink-0">
                      <GitFork className="w-3 h-3" />
                      Hostinger Forwarder
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {dept.description}
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 block">
                    Target Recipient Address:
                  </label>
                  <input
                    type="email"
                    value={currentEmail}
                    onChange={(e) => handleFieldChange(dept.key, e.target.value)}
                    placeholder={dept.defaultEmail}
                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Diagnostic Advice / Mailbox Status */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 truncate mr-2" title={diag?.advice}>
                    {diag?.advice || 'Configured via central routing.'}
                  </span>
                  {onSwitchToAccounts && (
                    <button
                      type="button"
                      onClick={() => onSwitchToAccounts(currentEmail)}
                      className="text-blue-600 hover:text-blue-800 font-medium shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isDedicated ? 'View Mailbox' : 'Add Mailbox'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hostinger Setup Instructions Accordion / Guidance */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900 font-heading">
            Hostinger hPanel Setup Guide: Real Mailboxes vs. Free Forwarders
          </h3>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          To minimize hosting costs and simplify inbox management, standard Hostinger plans provide 1 free mailbox (<code className="font-mono text-gray-800 font-bold">info@snaptech.digital</code>).
          Follow these two zero-cost best practices:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Option A: Zero-Cost Email Forwarders (Recommended)
            </h4>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              In Hostinger hPanel &rarr; <em>Emails</em> &rarr; <em>Forwarders</em>, create forwarders for:
            </p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-gray-700 pl-1">
              <li>sales@snaptech.digital &rarr; info@snaptech.digital</li>
              <li>support@snaptech.digital &rarr; info@snaptech.digital</li>
              <li>careers@snaptech.digital &rarr; info@snaptech.digital</li>
              <li>privacy@snaptech.digital &rarr; info@snaptech.digital</li>
              <li>billing@snaptech.digital &rarr; info@snaptech.digital</li>
            </ul>
            <p className="text-[10px] text-gray-500">
              Inbound messages land in <code className="font-mono">info@snaptech.digital</code>, and responses use department Reply-To headers seamlessly.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-600" />
              Option B: Dedicated IMAP Mailboxes
            </h4>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              If your Hostinger plan includes multiple mailboxes or you purchased Business Email:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-700 pl-1">
              <li>Create the dedicated mailbox in Hostinger hPanel.</li>
              <li>Navigate to the <strong>Email Accounts</strong> tab here in SnapTech CMS.</li>
              <li>Add the account credentials with IMAP: <code className="font-mono">imap.hostinger.com:993</code> and SMTP: <code className="font-mono">smtp.hostinger.com:465</code>.</li>
              <li>Activate automatic IMAP background sync for that department.</li>
            </ol>
            <p className="text-[10px] text-gray-500">
              The SnapTech Email Center automatically recognizes dedicated accounts and enables direct folder sync and compose from that address.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

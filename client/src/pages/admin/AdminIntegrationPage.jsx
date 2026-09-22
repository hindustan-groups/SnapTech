/**
 * AdminIntegrationPage — Master Integration Suite & Service API Vault
 * Manages Cloudinary, Resend, SMTP, Google reCAPTCHA, Sentry, GA4, Twilio, Database URL, and JWT Secret.
 *
 * Security Layers:
 * 1. Server: SUPER_ADMIN role verification on all /api/admin/integrations endpoints
 * 2. Client: Master Key Lock Gate — requires INTEGRATION_MASTER_KEY before displaying credentials.
 *    Unlock token saved in sessionStorage (cleared on browser/tab close).
 */
import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  Cloud,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plug,
  TestTube2,
  ExternalLink,
  RefreshCw,
  Lock,
  Info,
  Database,
  KeyRound,
  Unlock,
  ShieldAlert,
  Activity,
  Sparkles,
  MessageSquare,
  Server,
  Zap,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

const UNLOCK_TOKEN_KEY = 'integration_unlock_token'

// ── Master Key Lock Gate Component ────────────────────────────
function LockGate({ onUnlocked }) {
  const [key, setKey] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100)

    // Auto-verify if valid token exists in sessionStorage
    const existing = sessionStorage.getItem(UNLOCK_TOKEN_KEY)
    if (existing) {
      api
        .get(`/admin/integrations/check-unlock?token=${encodeURIComponent(existing)}`)
        .then((r) => {
          if (r.valid) onUnlocked(existing)
        })
        .catch(() => sessionStorage.removeItem(UNLOCK_TOKEN_KEY))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!key.trim()) {
      setError('Please enter the integration master key.')
      triggerShake()
      return
    }
    setLoading(true)
    setError('')
    try {
      const r = await api.post('/admin/integrations/verify-key', { key: key.trim() })
      sessionStorage.setItem(UNLOCK_TOKEN_KEY, r.unlockToken)
      onUnlocked(r.unlockToken)
    } catch (err) {
      setError(err.message || 'Incorrect master key. Access denied.')
      setKey('')
      triggerShake()
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-slate-900 to-brand-blue text-white shadow-xl mb-4 border border-blue-400/20">
            <ShieldAlert className="w-10 h-10 text-blue-300" />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-gray-900 tracking-tight">
            Master Integration Vault
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Protected Zone. Enter your Super Admin Master Key to decrypt and manage service API credentials.
          </p>
        </div>

        {/* Lock Form Card */}
        <div
          className={`bg-white border border-gray-200/80 rounded-3xl shadow-xl p-7 transition-all duration-150 relative overflow-hidden ${
            shake ? 'animate-[shake_0.5s_ease-in-out]' : ''
          }`}
        >
          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              15% { transform: translateX(-8px); }
              30% { transform: translateX(8px); }
              45% { transform: translateX(-6px); }
              60% { transform: translateX(6px); }
              75% { transform: translateX(-4px); }
              90% { transform: translateX(4px); }
            }
          `}</style>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">
                Integration Master Key
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={inputRef}
                  type={show ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter master key"
                  autoComplete="off"
                  className={`w-full pl-10 pr-11 py-3 text-sm border rounded-2xl font-mono bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    error
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-brand-blue/20 focus:border-brand-blue'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="mt-2 text-xs text-red-600 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Master Key…
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" /> Unlock Vault Access
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4 font-medium">
          🔒 Access is audit-logged. Unlock session automatically expires when tab is closed.
        </p>
      </div>
    </div>
  )
}

// ── Form Input Components ─────────────────────────────────────
function SecretInput({ label, name, placeholder, register, description }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="text-xs font-bold text-gray-800 block mb-1">{label}</label>
      {description && (
        <p className="text-[11px] text-gray-500 mb-1.5 leading-relaxed">{description}</p>
      )}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          {...register(name)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-mono"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
          aria-label={show ? 'Hide' : 'Show'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

function PlainInput({ label, name, placeholder, register, description, type = 'text' }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-800 block mb-1">{label}</label>
      {description && (
        <p className="text-[11px] text-gray-500 mb-1.5 leading-relaxed">{description}</p>
      )}
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-mono"
      />
    </div>
  )
}

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Configured
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      Not Configured
    </span>
  )
}

function Section({ icon: Icon, title, badge, accentColor = 'brand-blue', children }) {
  const accentBorder = {
    'brand-blue': 'border-l-brand-blue',
    violet: 'border-l-violet-600',
    emerald: 'border-l-emerald-600',
    orange: 'border-l-amber-500',
    blue: 'border-l-blue-600',
    indigo: 'border-l-indigo-600',
  }[accentColor] || 'border-l-brand-blue'

  return (
    <div className={`bg-white border border-gray-200/80 border-l-4 ${accentBorder} rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md`}>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <h2 className="font-heading text-sm sm:text-base font-bold text-gray-900">{title}</h2>
        </div>
        {badge}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

function TestButton({ label, onClick, loading, result }) {
  return (
    <div className="flex items-center gap-3 flex-wrap pt-1">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-brand-blue/30 text-brand-blue bg-blue-50/50 hover:bg-brand-blue hover:text-white transition-all disabled:opacity-60 cursor-pointer"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube2 className="w-3.5 h-3.5" />}
        <span>{label}</span>
      </button>
      {result && (
        <span className={`text-xs font-bold flex items-center gap-1.5 ${result.ok ? 'text-emerald-600' : 'text-red-600'}`}>
          {result.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{result.message}</span>
        </span>
      )}
    </div>
  )
}

// ── Main Integration Settings Page ────────────────────────────
export default function AdminIntegrationPage() {
  const [unlocked, setUnlocked] = useState(false)
  const qc = useQueryClient()
  const { addToast } = useToast()

  const [smtpTest, setSmtpTest] = useState(null)
  const [smtpTesting, setSmtpTesting] = useState(false)
  const [cloudTest, setCloudTest] = useState(null)
  const [cloudTesting, setCloudTesting] = useState(false)
  const [dbTest, setDbTest] = useState(null)
  const [dbTesting, setDbTesting] = useState(false)

  // 1. Fetch current integration config
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-integrations'],
    queryFn: () => api.get('/admin/integrations').then((r) => r.data),
    enabled: unlocked, // only fetch after vault is unlocked
  })

  const status = data?._status || {}

  const {
    register,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useForm({
    values: data
      ? {
          sys_cloudinary_cloud_name: data.sys_cloudinary_cloud_name || '',
          sys_cloudinary_api_key: data.sys_cloudinary_api_key || '',
          sys_cloudinary_api_secret: data.sys_cloudinary_api_secret || '',
          sys_resend_api_key: data.sys_resend_api_key || '',
          sys_smtp_host: data.sys_smtp_host || '',
          sys_smtp_port: data.sys_smtp_port || '587',
          sys_smtp_user: data.sys_smtp_user || '',
          sys_smtp_pass: data.sys_smtp_pass || '',
          sys_smtp_from: data.sys_smtp_from || '',
          sys_recaptcha_secret_key: data.sys_recaptcha_secret_key || '',
          sys_database_url: data.sys_database_url || '',
          sys_jwt_secret: data.sys_jwt_secret || '',
          sys_twilio_account_sid: data.sys_twilio_account_sid || '',
          sys_twilio_auth_token: data.sys_twilio_auth_token || '',
          sys_twilio_whatsapp_from: data.sys_twilio_whatsapp_from || '',
          sys_admin_whatsapp_to: data.sys_admin_whatsapp_to || '',
          sys_sentry_dsn: data.sys_sentry_dsn || '',
          sys_ga_measurement_id: data.sys_ga_measurement_id || '',
        }
      : {},
  })

  // 2. Mutation for saving integration settings
  const mutation = useMutation({
    mutationFn: (d) => api.patch('/admin/integrations', d),
    onSuccess: () => {
      addToast('All integration settings saved and applied to server.', 'success')
      qc.invalidateQueries({ queryKey: ['admin-integrations'] })
    },
    onError: (err) => {
      addToast(err.message || 'Failed to save integration settings', 'error')
    },
  })

  const onSubmit = (d) => {
    mutation.mutate(d)
  }

  const handleSmtpTest = async () => {
    setSmtpTesting(true)
    setSmtpTest(null)
    try {
      const vals = getValues ? getValues() : {}
      const r = await api.post('/admin/integrations/test-smtp', {
        sys_smtp_host: vals.sys_smtp_host,
        sys_smtp_port: vals.sys_smtp_port,
        sys_smtp_user: vals.sys_smtp_user,
        sys_smtp_pass: vals.sys_smtp_pass,
        sys_smtp_from: vals.sys_smtp_from,
        sys_resend_api_key: vals.sys_resend_api_key,
      })
      setSmtpTest({ ok: true, message: r.message })
      addToast('Test email sent successfully', 'success')
      qc.invalidateQueries({ queryKey: ['admin-integrations'] })
    } catch (err) {
      setSmtpTest({ ok: false, message: err.message })
      addToast(err.message || 'SMTP test failed', 'error')
    } finally {
      setSmtpTesting(false)
    }
  }

  const handleCloudinaryTest = async () => {
    setCloudTesting(true)
    setCloudTest(null)
    try {
      const vals = getValues ? getValues() : {}
      const r = await api.post('/admin/integrations/test-cloudinary', {
        sys_cloudinary_cloud_name: vals.sys_cloudinary_cloud_name,
        sys_cloudinary_api_key: vals.sys_cloudinary_api_key,
        sys_cloudinary_api_secret: vals.sys_cloudinary_api_secret,
      })
      setCloudTest({ ok: true, message: r.message })
      addToast('Cloudinary connection verified successfully', 'success')
      qc.invalidateQueries({ queryKey: ['admin-integrations'] })
    } catch (err) {
      setCloudTest({ ok: false, message: err.message })
      addToast(err.message || 'Cloudinary test failed', 'error')
    } finally {
      setCloudTesting(false)
    }
  }

  const handleDbTest = async () => {
    setDbTesting(true)
    setDbTest(null)
    try {
      const vals = getValues ? getValues() : {}
      const r = await api.post('/admin/integrations/test-database', {
        sys_database_url: vals.sys_database_url,
      })
      setDbTest({ ok: true, message: r.message })
      addToast('Database connection ping verified successfully', 'success')
      qc.invalidateQueries({ queryKey: ['admin-integrations'] })
    } catch (err) {
      setDbTest({ ok: false, message: err.message })
      addToast(err.message || 'Database connection test failed', 'error')
    } finally {
      setDbTesting(false)
    }
  }

  return (
    <>
      <SEO title="Master Integration Vault" noIndex />

      {/* Lock Gate Prompt when vault is locked */}
      {!unlocked && (
        <LockGate
          onUnlocked={() => {
            setUnlocked(true)
            addToast('Integration Vault unlocked successfully', 'info')
          }}
        />
      )}

      {/* Unlocked Page View */}
      {unlocked && (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
          
          {/* Executive Dark Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <Plug className="w-7 h-7 text-blue-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Master Integration Vault
                    </h1>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                      Unlocked Session
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                    Manage third-party API keys, SMTP mailers, Cloudinary storage, Database connection strings, and JWT secrets.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    refetch()
                    addToast('Integration config refreshed', 'info')
                  }}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-white"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => {
                    sessionStorage.removeItem(UNLOCK_TOKEN_KEY)
                    setUnlocked(false)
                    addToast('Vault locked successfully', 'warning')
                  }}
                  className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Vault</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security Banner */}
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Super Admin Security Notice</p>
              <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                Keys are stored encrypted in the database and applied instantly to the server. Sensitive secrets are masked. Leaving secret fields blank maintains the existing saved values.
              </p>
            </div>
          </div>

          {/* Loading / Error States */}
          {isLoading && (
            <div className="min-h-[250px] flex items-center justify-center gap-2 bg-white rounded-2xl border border-gray-200">
              <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
              <span className="text-xs text-gray-500 font-bold">Decrypting integration keys...</span>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-xs text-red-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Failed to load integration settings. Please verify Super Admin permissions.
            </div>
          )}

          {!isLoading && !isError && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* ── 1. Cloudinary ── */}
              <Section
                icon={Cloud}
                title="Cloudinary — Media & File Storage"
                accentColor="violet"
                badge={<StatusBadge active={status.cloudinary} />}
              >
                <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-violet-800">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-violet-600" />
                  <span className="leading-relaxed">
                    Used for storing client deliverables, team avatars, and blog thumbnails. Get your credentials at{' '}
                    <a
                      href="https://cloudinary.com/console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold inline-flex items-center gap-0.5 hover:text-violet-900"
                    >
                      cloudinary.com/console <ExternalLink className="w-3 h-3" />
                    </a>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PlainInput
                    label="Cloud Name"
                    name="sys_cloudinary_cloud_name"
                    placeholder="e.g. my-cloud-name"
                    register={register}
                  />
                  <PlainInput
                    label="API Key"
                    name="sys_cloudinary_api_key"
                    placeholder="e.g. 445256788173392"
                    register={register}
                  />
                </div>
                <SecretInput
                  label="API Secret"
                  name="sys_cloudinary_api_secret"
                  placeholder="Leave blank to keep existing value"
                  register={register}
                  description="Cloudinary API Secret. Stored encrypted. Leave blank to keep current secret."
                />

                <TestButton
                  label="Test Cloudinary Ping Connection"
                  onClick={handleCloudinaryTest}
                  loading={cloudTesting}
                  result={cloudTest}
                />
              </Section>

              {/* ── 2. Resend ── */}
              <Section
                icon={Mail}
                title="Resend — Transactional Email API"
                accentColor="violet"
                badge={<StatusBadge active={status.resend} />}
              >
                <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-violet-800">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-violet-600" />
                  <span className="leading-relaxed">
                    Primary recommended email service for domain-verified emails (e.g. info@hindustanprojects.in). Free tier provides 3,000 emails/month. Obtain your API key from{' '}
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold inline-flex items-center gap-0.5 hover:text-violet-900"
                    >
                      resend.com/api-keys <ExternalLink className="w-3 h-3" />
                    </a>. When configured, Resend takes precedence over SMTP.
                  </span>
                </div>

                <SecretInput
                  label="Resend API Key"
                  name="sys_resend_api_key"
                  placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxx"
                  register={register}
                  description="Starts with re_. Stored encrypted. Leave blank to keep current key."
                />

                <TestButton
                  label="Send Test Email via Resend"
                  onClick={handleSmtpTest}
                  loading={smtpTesting}
                  result={smtpTest}
                />
              </Section>

              {/* ── 3. SMTP Mailer ── */}
              <Section
                icon={Server}
                title="SMTP Mailer — Nodemailer Email Server"
                accentColor="emerald"
                badge={<StatusBadge active={status.smtp} />}
              >
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-800">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span className="leading-relaxed">
                    Backup email provider for lead notifications and client auto-responses. For Gmail SMTP, use an{' '}
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold inline-flex items-center gap-0.5 hover:text-emerald-900"
                    >
                      App Password <ExternalLink className="w-3 h-3" />
                    </a> instead of your primary account password.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <PlainInput
                      label="SMTP Host"
                      name="sys_smtp_host"
                      placeholder="smtp.gmail.com"
                      register={register}
                    />
                  </div>
                  <PlainInput
                    label="Port"
                    name="sys_smtp_port"
                    placeholder="587"
                    register={register}
                    type="number"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PlainInput
                    label="SMTP User / Email Address"
                    name="sys_smtp_user"
                    placeholder="info@hindustanprojects.com"
                    register={register}
                  />
                  <SecretInput
                    label="SMTP Password / App Password"
                    name="sys_smtp_pass"
                    placeholder="Leave blank to keep existing password"
                    register={register}
                  />
                </div>

                <PlainInput
                  label='Sender Name & Email ("From" Header)'
                  name="sys_smtp_from"
                  placeholder={`"Hindustan Projects" <info@hindustanprojects.com>`}
                  register={register}
                  description="Appears as sender address in recipient email inboxes."
                />

                <TestButton
                  label="Send Test Email via SMTP"
                  onClick={handleSmtpTest}
                  loading={smtpTesting}
                  result={smtpTest}
                />
              </Section>

              {/* ── 4. reCAPTCHA v3 ── */}
              <Section
                icon={ShieldCheck}
                title="Google reCAPTCHA v3 — Anti-Spam Security"
                accentColor="orange"
                badge={<StatusBadge active={status.recaptcha} />}
              >
                <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span className="leading-relaxed">
                    Protects public contact and job application forms from automated spam bots. Generate reCAPTCHA v3 keys at{' '}
                    <a
                      href="https://www.google.com/recaptcha/admin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold inline-flex items-center gap-0.5 hover:text-amber-900"
                    >
                      google.com/recaptcha/admin <ExternalLink className="w-3 h-3" />
                    </a>.
                  </span>
                </div>

                <SecretInput
                  label="reCAPTCHA v3 Secret Key (Server-Side)"
                  name="sys_recaptcha_secret_key"
                  placeholder="Leave blank to keep existing secret"
                  register={register}
                  description="Secret key used by Express server to verify client token scores."
                />

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-600">
                  <p className="font-bold text-gray-800 mb-1">Frontend Public Site Key (Vercel env var)</p>
                  <p className="leading-relaxed">
                    Set <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-[11px]">VITE_RECAPTCHA_SITE_KEY=your_site_key</code> in your Vercel frontend environment variables.
                  </p>
                </div>
              </Section>

              {/* ── 5. Sentry & GA4 ── */}
              <Section
                icon={Activity}
                title="Sentry & Google Analytics 4 — Monitoring Telemetry"
                accentColor="indigo"
                badge={
                  <div className="flex gap-2 items-center">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${status.sentry ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'}`}>
                      Sentry: {status.sentry ? 'ON' : 'OFF'}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${status.googleAnalytics ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'}`}>
                      GA4: {status.googleAnalytics ? 'ON' : 'OFF'}
                    </span>
                  </div>
                }
              >
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-indigo-800">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                  <span className="leading-relaxed">
                    Configures <strong>Sentry</strong> for JavaScript crash telemetry and <strong>Google Analytics 4</strong> for visitor pageviews. Leaving fields blank bypasses tracking.
                  </span>
                </div>

                <SecretInput
                  label="Sentry DSN URL"
                  name="sys_sentry_dsn"
                  placeholder="https://xxxxxx@o450xxxxxx.ingest.sentry.io/xxxxxx"
                  register={register}
                  description="Project DSN string to report runtime crashes. Format: https://key@host/project_id"
                />

                <PlainInput
                  label="Google Analytics 4 Measurement ID"
                  name="sys_ga_measurement_id"
                  placeholder="G-XXXXXXXXXX"
                  register={register}
                  description="GA4 web stream identifier starting with G-."
                />
              </Section>

              {/* ── 6. Twilio WhatsApp ── */}
              <Section
                icon={MessageSquare}
                title="Twilio WhatsApp — Real-Time Alert Automation"
                accentColor="blue"
                badge={<StatusBadge active={status.twilio} />}
              >
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-blue-800">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                  <span className="leading-relaxed">
                    Sends instant WhatsApp notifications when new client leads or career applications are submitted. Get credentials from{' '}
                    <a
                      href="https://console.twilio.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold inline-flex items-center gap-0.5 hover:text-blue-900"
                    >
                      console.twilio.com <ExternalLink className="w-3 h-3" />
                    </a>.
                  </span>
                </div>

                <PlainInput
                  label="Twilio Account SID"
                  name="sys_twilio_account_sid"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  register={register}
                  description="Your primary Twilio Account Identifier."
                />

                <SecretInput
                  label="Twilio Auth Token"
                  name="sys_twilio_auth_token"
                  placeholder="Leave blank to keep existing token"
                  register={register}
                  description="Twilio Auth Token. Stored encrypted."
                />

                <PlainInput
                  label="Twilio WhatsApp Sender Number"
                  name="sys_twilio_whatsapp_from"
                  placeholder="whatsapp:+14155238886"
                  register={register}
                  description="Twilio WhatsApp sandbox or approved business sender (must start with whatsapp:)."
                />

                <PlainInput
                  label="Admin Target WhatsApp Number"
                  name="sys_admin_whatsapp_to"
                  placeholder="whatsapp:+919876543210"
                  register={register}
                  description="Administrator's WhatsApp phone number to receive alerts (must start with whatsapp:)."
                />
              </Section>

              {/* ── 7. PostgreSQL Database ── */}
              <Section
                icon={Database}
                title="PostgreSQL Database — Neon.tech Connection String"
                accentColor="brand-blue"
                badge={<StatusBadge active={status.database} />}
              >
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-blue-800">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                  <span className="leading-relaxed">
                    PostgreSQL connection URL. Format:{' '}
                    <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-[11px]">
                      postgresql://user:pass@host/dbname?sslmode=require
                    </code>
                    <br />
                    Available at{' '}
                    <a
                      href="https://console.neon.tech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold inline-flex items-center gap-0.5 hover:text-blue-900"
                    >
                      console.neon.tech <ExternalLink className="w-3 h-3" />
                    </a> → Connection Details.
                    <br />
                    <strong>Note:</strong> Updating this string reconnects the Prisma ORM instance immediately.
                  </span>
                </div>

                <SecretInput
                  label="Database URL (PostgreSQL Connection String)"
                  name="sys_database_url"
                  placeholder="Leave blank to keep existing connection string"
                  register={register}
                  description="Stored encrypted. Leave blank to preserve current connection."
                />

                <TestButton
                  label="Test Database Ping Connection"
                  onClick={handleDbTest}
                  loading={dbTesting}
                  result={dbTest}
                />
              </Section>

              {/* ── 8. JWT Secret ── */}
              <Section
                icon={KeyRound}
                title="JWT Secret — Admin Session Authentication"
                accentColor="orange"
                badge={<StatusBadge active={status.jwt} />}
              >
                <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span className="leading-relaxed">
                    Secret key used to sign and verify JWT authentication tokens (min 32 characters recommended). Generate strong secrets at{' '}
                    <a
                      href="https://generate-secret.vercel.app/64"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold inline-flex items-center gap-0.5 hover:text-amber-900"
                    >
                      generate-secret.vercel.app <ExternalLink className="w-3 h-3" />
                    </a>.
                  </span>
                </div>

                <SecretInput
                  label="JWT Secret Key"
                  name="sys_jwt_secret"
                  placeholder="Leave blank to keep existing secret key"
                  register={register}
                  description="Stored encrypted. Leave blank to keep current secret."
                />

                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span className="leading-relaxed">
                    <strong>Session Alert:</strong> Updating the JWT Secret invalidates all existing active admin tokens. You will be required to log in again.
                  </span>
                </div>
              </Section>

              {/* Submit Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || mutation.isPending}
                  className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold py-4 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Encrypting &amp; Applying All Settings…
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" /> Save &amp; Apply All Integration Keys
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-2 font-medium">
                  Changes apply immediately across all live backend processes without server restart.
                </p>
              </div>

            </form>
          )}

        </div>
      )}
    </>
  )
}

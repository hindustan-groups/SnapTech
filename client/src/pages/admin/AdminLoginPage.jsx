/**
 * Admin Login Page — Ultra-modern Glassmorphic Command Center Authentication
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Lock,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Cpu,
  Shield,
  Activity,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'
import WaterRippleLogo from '@/components/ui/WaterRippleLogo'
import NotFoundPage from '@/pages/NotFoundPage'

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password required'),
})

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { adminSecret } = useParams()

  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 2FA State
  const [tempToken, setTempToken] = useState(null)
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)

  const isValidSecret =
    adminSecret &&
    adminSecret.length >= 3 &&
    adminSecret !== 'admin-invalid' &&
    adminSecret !== 'invalid'

  const secretPath = isValidSecret
    ? adminSecret.replace(/^admin-/, '').replace(/[./\s]+$/, '')
    : ''

  // Store secretPath on mount to remember it for future redirects
  useEffect(() => {
    if (secretPath && secretPath !== 'invalid') {
      localStorage.setItem('admin_secret_path', secretPath)
    }
  }, [secretPath])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (!isValidSecret) {
    return <NotFoundPage />
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const activePath = secretPath || adminSecret || 'h9z7'
      let res
      try {
        res = await api.post(`/admin/${activePath}/login`, data)
      } catch (firstErr) {
        if (firstErr.status === 404) {
          // Fallback to direct /admin/login endpoint
          res = await api.post('/admin/login', data)
        } else {
          throw firstErr
        }
      }

      if (res.status === '2fa_required') {
        setTempToken(res.tempToken)
      } else {
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a 6-digit code.')
      return
    }

    setOtpLoading(true)
    setOtpError('')
    try {
      await api.post('/admin/2fa/login', { tempToken, code: otpCode })
      navigate('/admin/dashboard')
    } catch (err) {
      setOtpError(err.message || 'Invalid authentication code. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <>
      <SEO title="Admin Login" noIndex />
      <div className="h-screen w-full relative flex items-center justify-center p-3 sm:p-4 lg:p-6 overflow-hidden bg-white text-slate-900 selection:bg-blue-500 selection:text-white">
        {/* ── Soft Ethereal Ambient Light Blooms (Light Theme) ── */}
        <div className="absolute -top-24 -left-20 w-xl h-144 bg-sky-400/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/4 -right-24 w-160 h-160 bg-blue-500/12 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-136 h-136 bg-indigo-400/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-cyan-300/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Ambient Subtle Architectural Light Grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right,#0f172a 1px,transparent 1px),linear-gradient(to bottom,#0f172a 1px,transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, white 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, white 40%, transparent 80%)',
          }}
        />

        {/* ── Main Frosted White Glass Island Deck ── */}
        <div className="w-full max-w-4xl max-h-[94vh] rounded-3xl backdrop-blur-3xl bg-white/80 border border-white/90 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.08),0_0_0_1px_rgba(226,232,240,0.8),inset_0_1px_2px_rgba(255,255,255,0.9)] overflow-hidden grid lg:grid-cols-12 relative z-10 transition-all">
          {/* Specular top rim light highlight */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none z-20" />

          {/* ── Left Column — Brand & Interactive Fluid Showcase (Desktop) ── */}
          <div className="hidden lg:flex lg:col-span-6 p-5 sm:p-6 lg:p-7 flex-col justify-between border-r border-slate-200/70 bg-linear-to-b from-slate-50/80 via-white/70 to-blue-50/30 backdrop-blur-2xl relative">
            {/* Top Brand Bar */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white border border-slate-200/90 p-0.5 shadow-xs backdrop-blur-xl flex items-center justify-center shrink-0">
                  <img
                    src="/snaptech-icon.png"
                    alt="SnapTech Digital"
                    className="w-full h-full rounded-full object-contain"
                  />
                </div>
                <div>
                  <p className="font-heading font-bold text-slate-900 text-sm tracking-tight leading-tight">
                    SnapTech Digital
                  </p>
                  <p className="text-blue-600 text-[10px] font-semibold tracking-wider uppercase">
                    Command Center
                  </p>
                </div>
              </div>

              {/* Live operational status pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-semibold backdrop-blur-xl shadow-xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Active Node
              </div>
            </div>

            {/* Middle Section: Title, Fluid Ripple Logo & Presentation */}
            <div className="my-2.5 space-y-2.5">
              <div>
                <h2 className="text-slate-900 font-heading text-lg sm:text-xl font-extrabold leading-tight mb-1">
                  Enterprise{' '}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600">
                    Command Console
                  </span>
                </h2>
                <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                  Unified operational dashboard for client accounts, CRM leads, live telemetry, and secure cloud management.
                </p>
              </div>

              {/* Interactive Fluid Canvas inside Inset Deck */}
              <div className="relative rounded-2xl border border-slate-200/80 bg-slate-950/90 backdrop-blur-xl p-1.5 shadow-md overflow-hidden">
                <WaterRippleLogo
                  variant="card"
                  canvasHeightClass="h-24 sm:h-26"
                  showCues={false}
                  showBottomCaption={false}
                  className="border-transparent"
                />
              </div>

              {/* Sleek Frosted Feature Micro-cards */}
              <div className="grid gap-1.5">
                {[
                  {
                    icon: Activity,
                    title: 'Real-time Lead CRM & Telemetry',
                    desc: 'Live inquiry pipeline & estimate tracker',
                  },
                  {
                    icon: Shield,
                    title: '2FA & Enterprise JWT Security',
                    desc: 'Time-synced TOTP authorization & access control',
                  },
                  {
                    icon: Cpu,
                    title: 'Automated Resend Delivery',
                    desc: 'High-speed proposal dispatch & security alerts',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/70 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center shrink-0 text-blue-600 shadow-xs">
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-800 text-[11px] font-semibold truncate leading-tight">{title}</p>
                      <p className="text-slate-500 text-[10px] truncate leading-tight">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-400">
              <span>© {new Date().getFullYear()} SnapTech Digital</span>
              <span className="text-blue-600 font-mono font-medium">v2.6 Enterprise</span>
            </div>
          </div>

          {/* ── Right Column — Glass Login Form ── */}
          <div className="lg:col-span-6 p-5 sm:p-7 lg:p-8 flex flex-col justify-center bg-white/60 backdrop-blur-3xl relative">
            {/* Mobile Header (Shown on < lg screens) */}
            <div className="lg:hidden flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src="/snaptech-icon.png"
                    alt="SnapTech Digital"
                    className="w-full h-full rounded-full object-contain"
                  />
                </div>
                <div>
                  <p className="font-heading font-bold text-slate-900 text-xs leading-tight">
                    SnapTech Digital
                  </p>
                  <p className="text-blue-600 text-[9px] font-semibold tracking-wider uppercase">
                    Command Center
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-semibold">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                Live
              </div>
            </div>

            {/* Frosted Gateway Badge */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-[11px] font-semibold backdrop-blur-xl mb-2 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>{tempToken ? 'Two-Factor Authentication' : 'Secure Admin Gateway'}</span>
              </div>
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {tempToken ? 'Verify Identity' : 'Welcome Back'}
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {tempToken
                  ? 'Enter the 6-digit TOTP code from Google Authenticator or Authy.'
                  : 'Enter your administrative credentials to unlock the console.'}
              </p>
            </div>

            {!tempToken ? (
              // ── Email/Password Form ──
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
                {/* Email Address */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div
                    className={`relative flex items-center rounded-xl border backdrop-blur-xl transition-all duration-200 shadow-xs
                      ${
                        errors.email
                          ? 'border-red-400 bg-red-50/50 ring-2 ring-red-200'
                          : 'border-slate-200 bg-white/90 hover:bg-white hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15'
                      }`}
                  >
                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      autoComplete="email"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                      placeholder="admin@snaptech.digital"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div
                    className={`relative flex items-center rounded-xl border backdrop-blur-xl transition-all duration-200 shadow-xs
                      ${
                        errors.password
                          ? 'border-red-400 bg-red-50/50 ring-2 ring-red-200'
                          : 'border-slate-200 bg-white/90 hover:bg-white hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15'
                      }`}
                  >
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                      placeholder="••••••••••••"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.password.message}
                    </p>
                  )}
                </div>

                {/* API Error Notification */}
                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 shadow-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-linear-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_22px_rgba(37,99,235,0.35)] active:scale-[0.99] cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed tracking-wide group"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

                  {loading ? (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Authenticating…
                    </span>
                  ) : (
                    <span className="relative z-10 font-bold">Unlock Command Center</span>
                  )}
                </button>
              </form>
            ) : (
              // ── 2FA Verification Form ──
              <form onSubmit={handleOtpSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                    6-Digit Verification Code
                  </label>
                  <div
                    className={`relative flex items-center rounded-xl border backdrop-blur-xl transition-all duration-200 shadow-xs
                      ${
                        otpError
                          ? 'border-red-400 bg-red-50/50 ring-2 ring-red-200'
                          : 'border-slate-200 bg-white/90 hover:bg-white hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15'
                      }`}
                  >
                    <KeyRound className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={6}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      className="w-full pl-10 pr-4 py-2.5 text-base sm:text-lg tracking-[0.4em] text-center font-mono font-bold bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>
                  {otpError && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {otpError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full relative overflow-hidden bg-linear-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_22px_rgba(37,99,235,0.35)] active:scale-[0.99] cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                  {otpLoading ? (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Verifying Token…
                    </span>
                  ) : (
                    <span className="relative z-10 font-bold">Verify & Open Session</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTempToken(null)
                    setOtpCode('')
                    setOtpError('')
                  }}
                  className="w-full text-slate-500 hover:text-blue-600 text-[11px] font-semibold py-1.5 text-center block transition-colors cursor-pointer"
                >
                  Back to password login
                </button>
              </form>
            )}

            {/* Divider and Return to Home */}
            <div className="mt-5 pt-3.5 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Return to Public Site</span>
              </Link>
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                <span>2FA Protected Endpoint</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

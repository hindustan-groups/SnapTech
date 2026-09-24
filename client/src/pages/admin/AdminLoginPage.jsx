/**
 * Admin Login Page — Premium branded login screen (light theme) with 2FA support
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle, Mail, Lock, ShieldCheck, KeyRound } from 'lucide-react'
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
      <div
        className="min-h-screen flex bg-[#020714] text-white selection:bg-cyan-500 selection:text-black relative overflow-hidden"
      >
        {/* Background ambient orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* ── Left panel — Brand ── */}
        <div
          className="hidden lg:flex flex-col justify-between w-110 shrink-0 p-10 relative overflow-hidden bg-[#03091e]/90 border-r border-white/10"
        >
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Glow orbs */}
          <div className="absolute top-20 left-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />

          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <img
              src="/snaptech-icon.png"
              alt="SnapTech Digital"
              className="w-10 h-10 rounded-xl object-contain border border-white/10"
            />
            <div>
              <p className="font-heading font-bold text-white text-base">SnapTech Digital</p>
              <p className="text-cyan-400 text-xs font-semibold tracking-wider uppercase">Command Center</p>
            </div>
          </div>

          {/* Interactive Fluid Canvas in Left Brand Column */}
          <div className="relative my-2">
            <WaterRippleLogo
              variant="card"
              canvasHeightClass="h-38"
              showCues={true}
              showBottomCaption={true}
              className="border-cyan-500/30"
            />
          </div>

          {/* Center content */}
          <div className="relative space-y-6">
            <div>
              <h2
                className="text-white font-heading text-3xl font-bold leading-tight mb-3"
              >
                Enterprise
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
                  Command Center
                </span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Control services, client projects, leads, team members, cost calculations, and cloud settings — all in real time.
              </p>
            </div>

            {/* Feature bullets */}
            <div className="space-y-3">
              {[
                'Real-time lead CRM & cost calculator telemetry',
                'Transactional email delivery via Resend API',
                'Multi-tier 2FA & enterprise JWT authorization',
              ].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <p className="text-slate-300 text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="relative">
            <p className="text-slate-500 text-xs">© {new Date().getFullYear()} SnapTech Digital &bull; Command Center</p>
          </div>
        </div>

        {/* ── Right panel — Form ── */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex items-center gap-2.5">
                <img
                  src="/snaptech-icon.png"
                  alt="SnapTech Digital"
                  className="w-9 h-9 rounded-xl object-contain border border-white/10"
                />
                <span className="font-heading font-bold text-xl text-white">
                  SnapTech Digital
                </span>
              </div>
            </div>

            {/* Card */}
            <div className="bg-[#03091e]/90 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl p-8">
              {/* Interactive Fluid Water Logo at top of form */}
              <div className="mb-6">
                <WaterRippleLogo
                  variant="card"
                  canvasHeightClass="h-28"
                  showCues={false}
                  showBottomCaption={false}
                  className="border-cyan-500/30 shadow-lg shadow-cyan-950/40"
                />
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-400">Secure Admin Access</span>
                </div>
                <h1 className="font-heading text-2xl font-bold text-white">
                  {tempToken ? 'Two-Factor Authentication' : 'Welcome Back'}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  {tempToken ? 'Enter your 6-digit Google Authenticator code' : 'Sign in to access your administrative command center'}
                </p>
              </div>

              {!tempToken ? (
                // ── Email/Password Form ──
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  {/* Email */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        autoComplete="email"
                        className={`w-full pl-9 pr-3.5 py-3 text-sm border rounded-xl focus:outline-none
                          focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all text-white placeholder:text-slate-500
                          ${errors.email ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-slate-900/80 focus:bg-slate-900'}`}
                        placeholder="admin@snaptech.digital"
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        autoComplete="current-password"
                        className={`w-full pl-9 pr-10 py-3 text-sm border rounded-xl focus:outline-none
                          focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all text-white placeholder:text-slate-500
                          ${errors.password ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-slate-900/80 focus:bg-slate-900'}`}
                        placeholder="••••••••••••"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* API error */}
                  {error && (
                    <div
                      className="flex items-center gap-2.5 text-sm text-red-300 bg-red-500/10
                      border border-red-500/30 rounded-xl px-4 py-3"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold py-3 rounded-xl text-sm
                      transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                      hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                        Signing in…
                      </span>
                    ) : (
                      'Sign In to Command Center'
                    )}
                  </button>
                </form>
              ) : (
                // ── 2FA Verification Form ──
                <form onSubmit={handleOtpSubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wide">
                      Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        maxLength={6}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        className={`w-full pl-9 pr-3.5 py-3 text-sm border rounded-xl focus:outline-none
                          focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/50 bg-slate-900/80 text-white placeholder:text-slate-500 transition-all
                          ${otpError ? 'border-red-500/50 bg-red-500/10' : 'border-white/10'}`}
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                    </div>
                    {otpError && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {otpError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold py-3 rounded-xl text-sm
                      transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                      hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer mt-2"
                  >
                    {otpLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                        Verifying OTP…
                      </span>
                    ) : (
                      'Verify & Access'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTempToken(null)
                      setOtpCode('')
                      setOtpError('')
                    }}
                    className="w-full text-slate-400 hover:text-cyan-400 text-xs font-semibold py-2 text-center block mt-1 transition-colors cursor-pointer"
                  >
                    Back to password login
                  </button>
                </form>
              )}

              {/* Footer */}
              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <p className="text-xs text-slate-400">Secured with 2FA & JWT enterprise authentication</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

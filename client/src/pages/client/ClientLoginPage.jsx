/**
 * ClientLoginPage.jsx — Mobile-optimized Client login & password setup portal.
 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff, Lock, Mail, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useClientLogin, useClientSetupPassword } from '@/hooks/useClientPortal'

export default function ClientLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loginMutation = useClientLogin()
  const setupMutation = useClientSetupPassword()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    try {
      await loginMutation.mutateAsync({ email, password })
      navigate('/client/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.')
    }
  }

  const handleSetup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      await setupMutation.mutateAsync({ token, password })
      setSuccess('Password set successfully! Redirecting to your dashboard...')
      setTimeout(() => {
        navigate('/client/dashboard', { replace: true })
      }, 1500)
    } catch (err) {
      setError(err.message || 'Setup link is invalid or has expired.')
    }
  }

  const isSetupMode = !!token
  const loading = loginMutation.isPending || setupMutation.isPending

  // Password criteria validations
  const hasMinLength = password.length >= 8
  const isMatching = password.length > 0 && password === confirmPassword

  return (
    <div className="min-h-screen bg-white text-slate-900 relative overflow-hidden flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      {/* ── Soft Ethereal Ambient Light Blooms (Light Theme) ── */}
      <div className="absolute -top-24 -left-20 w-xl h-144 bg-sky-400/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/4 -right-24 w-160 h-160 bg-blue-500/12 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-136 h-136 bg-indigo-400/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-cyan-300/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Architectural Grid Overlay */}
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

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Brand Logo & Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-slate-200/90 mb-3 sm:mb-4 shadow-[0_10px_25px_rgba(15,23,42,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] backdrop-blur-xl">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            {isSetupMode ? 'Set Your Password' : (
              <>
                Client <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600">Portal</span>
              </>
            )}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            {isSetupMode
              ? 'Establish a secure credential key to access your SnapTech Digital client dashboard.'
              : 'Sign in to monitor live project milestones, deliverables, and billing statements.'}
          </p>
        </div>

        {/* Frosted White Glass Island Card Form */}
        <div className="backdrop-blur-3xl bg-white/85 border border-white/90 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.08),0_0_0_1px_rgba(226,232,240,0.8),inset_0_1px_2px_rgba(255,255,255,0.95)] rounded-3xl p-6 sm:p-9 text-slate-900 relative overflow-hidden">
          {/* Top specular rim light highlight */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none z-20" />

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl font-medium flex items-start gap-2.5 backdrop-blur-xl shadow-xs">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-2xl font-medium flex items-start gap-2.5 backdrop-blur-xl shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {isSetupMode ? (
            /* PASSWORD SETUP FORM */
            <form onSubmit={handleSetup} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative flex items-center rounded-2xl border border-slate-200 bg-white/90 hover:bg-white hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15 backdrop-blur-xl transition-all shadow-xs">
                  <Lock className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-12 py-3 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium disabled:opacity-60"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative flex items-center rounded-2xl border border-slate-200 bg-white/90 hover:bg-white hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15 backdrop-blur-xl transition-all shadow-xs">
                  <Lock className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-12 py-3 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium disabled:opacity-60"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Password Requirement Helpers */}
              <div className="py-1 space-y-1.5 text-xs text-slate-500">
                <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>At least 8 characters long</span>
                </div>
                {confirmPassword && (
                  <div className={`flex items-center gap-1.5 transition-colors ${isMatching ? 'text-emerald-600 font-medium' : 'text-rose-600'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isMatching ? 'text-emerald-600' : 'text-rose-600'}`} />
                    <span>{isMatching ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-linear-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 text-white font-extrabold py-3.5 px-6 rounded-2xl text-sm transition-all duration-300 shadow-[0_12px_35px_rgba(37,99,235,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.45)] active:scale-[0.99] cursor-pointer mt-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                {loading ? (
                  <span className="flex items-center gap-2 relative z-10">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Setting Up Password...
                  </span>
                ) : (
                  <span className="relative z-10 font-bold">Complete Setup & Access Dashboard</span>
                )}
              </button>
            </form>
          ) : (
            /* PORTAL LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center rounded-2xl border border-slate-200 bg-white/90 hover:bg-white hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15 backdrop-blur-xl transition-all shadow-xs">
                  <Mail className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3.5 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium disabled:opacity-60"
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative flex items-center rounded-2xl border border-slate-200 bg-white/90 hover:bg-white hover:border-slate-300 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15 backdrop-blur-xl transition-all shadow-xs">
                  <Lock className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-12 py-3.5 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium disabled:opacity-60"
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-linear-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 text-white font-extrabold py-3.5 px-6 rounded-2xl text-sm transition-all duration-300 shadow-[0_12px_35px_rgba(37,99,235,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.45)] active:scale-[0.99] cursor-pointer mt-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                {loading ? (
                  <span className="flex items-center gap-2 relative z-10">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  <span className="relative z-10 font-bold">Sign In to Portal</span>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-5 border-t border-slate-200/80 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to SnapTech Digital Main Site</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

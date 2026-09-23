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
    <div className="min-h-[100dvh] bg-[#020714] relative overflow-hidden flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-cyan/20 selection:text-brand-cyan">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Brand Logo & Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/80 border border-brand-cyan/30 mb-3 sm:mb-4 shadow-xl shadow-cyan-950/40 backdrop-blur-xl">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-brand-cyan" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            {isSetupMode ? 'Set Your Password' : 'Client Portal'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            {isSetupMode
              ? 'Establish a secure credential key to access your SnapTech Digital client dashboard.'
              : 'Sign in to monitor live project milestones, deliverables, and billing statements.'}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/80 py-6 px-5 sm:py-8 sm:px-10 border border-white/10 shadow-2xl rounded-2xl sm:rounded-3xl backdrop-blur-2xl text-white">
          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm rounded-xl font-medium flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm rounded-xl font-medium flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {isSetupMode ? (
            /* PASSWORD SETUP FORM */
            <form onSubmit={handleSetup} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-3 sm:py-2.5 text-base sm:text-sm border border-white/15 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all disabled:opacity-60 placeholder:text-slate-500"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white min-h-[44px] min-w-[44px] justify-center cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-3 sm:py-2.5 text-base sm:text-sm border border-white/15 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all disabled:opacity-60 placeholder:text-slate-500"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Password Requirement Helpers */}
              <div className="py-1 space-y-1.5 text-xs text-slate-400">
                <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span>At least 8 characters long</span>
                </div>
                {confirmPassword && (
                  <div className={`flex items-center gap-1.5 transition-colors ${isMatching ? 'text-emerald-400 font-medium' : 'text-rose-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isMatching ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <span>{isMatching ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[46px] flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-950/50 text-sm font-bold text-slate-950 bg-brand-cyan hover:bg-brand-cyan-light active:scale-[0.99] focus:outline-none transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Setting Up Password...
                  </span>
                ) : (
                  'Complete Setup & Access Dashboard'
                )}
              </button>
            </form>
          ) : (
            /* PORTAL LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 py-3 sm:py-2.5 text-base sm:text-sm border border-white/15 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all disabled:opacity-60 placeholder:text-slate-500"
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-3 sm:py-2.5 text-base sm:text-sm border border-white/15 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all disabled:opacity-60 placeholder:text-slate-500"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white min-h-[44px] min-w-[44px] justify-center cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[46px] flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-950/50 text-sm font-bold text-slate-950 bg-brand-cyan hover:bg-brand-cyan-light active:scale-[0.99] focus:outline-none transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  'Sign In to Portal'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-white/10 pt-5 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-cyan transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SnapTech Digital Main Site</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * AdminSettingsPage — Enterprise Account Security & Credentials Vault
 * Controls admin account credentials, email updates, password changes,
 * 2FA TOTP authentication, and Master Access keys.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useOutletContext } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  ShieldAlert,
  KeyRound,
  Mail,
  ShieldCheck,
  Info,
  Copy,
  Check,
  Shield,
  Sparkles,
  Zap,
  LockKeyhole,
  User,
  CheckCircle,
  RefreshCw,
  Key,
  ShieldX,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

// ── Zod Validation Schemas ─────────────────────────────────────
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const emailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required to confirm email changes'),
})

const masterKeySchema = z
  .object({
    currentKey: z.string().min(1, 'Current master key is required'),
    newKey: z.string().min(8, 'New key must be at least 8 characters'),
    confirmKey: z.string().min(1, 'Please confirm new master key'),
  })
  .refine((d) => d.newKey === d.confirmKey, {
    message: 'Master keys do not match',
    path: ['confirmKey'],
  })

// ── Password Strength Calculator ──────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: 'bg-gray-200', width: 'w-0', text: 'text-gray-400' }
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', color: 'bg-red-500', width: 'w-1/4', text: 'text-red-500' }
    case 2:
      return { score: 2, label: 'Fair', color: 'bg-amber-500', width: 'w-2/4', text: 'text-amber-500' }
    case 3:
      return { score: 3, label: 'Good', color: 'bg-blue-500', width: 'w-3/4', text: 'text-blue-500' }
    case 4:
      return { score: 4, label: 'Strong', color: 'bg-emerald-500', width: 'w-full', text: 'text-emerald-500' }
    default:
      return { score: 0, label: 'Too Short', color: 'bg-gray-300', width: 'w-0', text: 'text-gray-400' }
  }
}

// ── Shared Password Input Component ───────────────────────────
function PasswordInput({ label, name, register, error, show, onToggle, placeholder, onChangeExtra }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type={show ? 'text' : 'password'}
          {...register(name, {
            onChange: (e) => {
              if (onChangeExtra) onChangeExtra(e.target.value)
            },
          })}
          placeholder={placeholder || '••••••••'}
          className={`w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm border rounded-xl bg-gray-50/50 focus:bg-white
            focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue
            transition-all ${error ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error.message}
        </p>
      )}
    </div>
  )
}

// ── Change Email Form ─────────────────────────────────────────
function EmailForm({ currentEmail, onEmailUpdated }) {
  const [showPassword, setShowPassword] = useState(false)
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(emailSchema),
  })

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/admin/change-email', {
        newEmail: data.newEmail,
        password: data.password,
      })
      const successMsg = res.message || 'Email address updated successfully.'
      addToast(successMsg, 'success')
      reset()
      if (onEmailUpdated) onEmailUpdated(res.data)
    } catch (err) {
      const errorMsg = err.message || 'Failed to update email address.'
      addToast(errorMsg, 'error')
    }
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-gray-900">Change Account Email</h2>
            <p className="text-xs text-gray-500 mt-0.5">Primary email address used for admin login &amp; security alerts.</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full font-mono">
          {currentEmail || 'Not set'}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">
            New Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="email"
              {...register('newEmail')}
              placeholder="e.g. admin@hindustanprojects.com"
              className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border rounded-xl bg-gray-50/50 focus:bg-white
                focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue
                transition-all ${errors.newEmail ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
            />
          </div>
          {errors.newEmail && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.newEmail.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">
            Current Password (To Confirm)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Enter password to authorize"
              className={`w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm border rounded-xl bg-gray-50/50 focus:bg-white
                focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue
                transition-all ${errors.password ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm
            shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Updating Email Address…</span>
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              <span>Update Email Address</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

// ── Change Password Form ──────────────────────────────────────
function PasswordForm() {
  const [show, setShow] = useState({ curr: false, new: false, conf: false })
  const [typedNewPassword, setTypedNewPassword] = useState('')
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  })

  const strength = getPasswordStrength(typedNewPassword)

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/admin/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      const successMsg = res.message || 'Password updated successfully.'
      addToast(successMsg, 'success')
      reset()
      setTypedNewPassword('')
    } catch (err) {
      const errorMsg = err.message || 'Failed to update password.'
      addToast(errorMsg, 'error')
    }
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
          <LockKeyhole className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="font-heading text-base font-bold text-gray-900">Update Account Password</h2>
          <p className="text-xs text-gray-500 mt-0.5">Ensure your account uses a strong, uncompromised password.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordInput
          label="Current Password"
          name="currentPassword"
          register={register}
          error={errors.currentPassword}
          show={show.curr}
          onToggle={() => setShow((s) => ({ ...s, curr: !s.curr }))}
          placeholder="Enter your current password"
        />

        <div>
          <PasswordInput
            label="New Password (min 8 characters)"
            name="newPassword"
            register={register}
            error={errors.newPassword}
            show={show.new}
            onToggle={() => setShow((s) => ({ ...s, new: !s.new }))}
            placeholder="Create a strong new password"
            onChangeExtra={(val) => setTypedNewPassword(val)}
          />

          {/* Password Strength Visual Meter */}
          {typedNewPassword && (
            <div className="mt-2.5 bg-gray-50 p-3 rounded-xl border border-gray-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-500">Password Strength:</span>
                <span className={strength.text}>{strength.label}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} transition-all duration-300 ${strength.width}`} />
              </div>
              <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-gray-500">
                <span className={`flex items-center gap-1 ${typedNewPassword.length >= 8 ? 'text-emerald-600 font-semibold' : ''}`}>
                  {typedNewPassword.length >= 8 ? <CheckCircle className="w-3 h-3 shrink-0 text-emerald-600" /> : '•'} 8+ Characters
                </span>
                <span className={`flex items-center gap-1 ${/[A-Z]/.test(typedNewPassword) ? 'text-emerald-600 font-semibold' : ''}`}>
                  {/[A-Z]/.test(typedNewPassword) ? <CheckCircle className="w-3 h-3 shrink-0 text-emerald-600" /> : '•'} Uppercase Letter
                </span>
                <span className={`flex items-center gap-1 ${/[0-9]/.test(typedNewPassword) ? 'text-emerald-600 font-semibold' : ''}`}>
                  {/[0-9]/.test(typedNewPassword) ? <CheckCircle className="w-3 h-3 shrink-0 text-emerald-600" /> : '•'} Number
                </span>
                <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(typedNewPassword) ? 'text-emerald-600 font-semibold' : ''}`}>
                  {/[^A-Za-z0-9]/.test(typedNewPassword) ? <CheckCircle className="w-3 h-3 shrink-0 text-emerald-600" /> : '•'} Special Symbol
                </span>
              </div>
            </div>
          )}
        </div>

        <PasswordInput
          label="Confirm New Password"
          name="confirmPassword"
          register={register}
          error={errors.confirmPassword}
          show={show.conf}
          onToggle={() => setShow((s) => ({ ...s, conf: !s.conf }))}
          placeholder="Re-enter new password"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm
            shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving New Password…</span>
            </>
          ) : (
            <>
              <LockKeyhole className="w-4 h-4" />
              <span>Update Password</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

// ── Integration Master Key Form ───────────────────────────────
function MasterKeyForm() {
  const [show, setShow] = useState({ curr: false, new: false, conf: false })
  const [showCurrentKey, setShowCurrentKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(masterKeySchema),
  })

  const { data: keyData, isLoading: keyLoading, refetch: fetchKey } = useQuery({
    queryKey: ['admin-master-key-hint'],
    queryFn: () => api.get('/admin/master-key-hint'),
  })

  const handleCopy = async () => {
    if (!keyData?.key) return
    try {
      await navigator.clipboard.writeText(keyData.key)
      setCopied(true)
      addToast('Master key copied to clipboard', 'info')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = keyData.key
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      addToast('Master key copied to clipboard', 'info')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/admin/change-master-key', {
        currentKey: data.currentKey,
        newKey: data.newKey,
      })
      const successMsg = res.message || 'Integration master key updated successfully.'
      addToast(successMsg, 'success')
      reset()
      fetchKey()
    } catch (err) {
      const errorMsg = err.message || 'Failed to update master key.'
      addToast(errorMsg, 'error')
    }
  }

  return (
    <div className="bg-white border border-amber-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
          <Key className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-bold text-gray-900">Integration Master Access Key</h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md border border-amber-200">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Unlocks system integrations, Cloudinary assets, and third-party API credentials.
          </p>
        </div>
      </div>

      {/* Current key info card */}
      <div className="my-4 bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-900">Active Master Key</p>
          </div>
          <span className="text-[10px] text-amber-700 bg-white border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold">
            {keyData?.source === 'database' ? 'Updated via Admin' : 'Loaded from .env'}
          </span>
        </div>

        {keyLoading ? (
          <div className="h-10 bg-amber-100/70 animate-pulse rounded-lg" />
        ) : keyData?.key ? (
          <div className="flex items-center gap-2">
            <code
              className={`flex-1 text-xs sm:text-sm font-mono bg-white border border-amber-200 rounded-lg px-3 py-2
              text-amber-950 tracking-wider select-all break-all leading-relaxed shadow-inner
              ${showCurrentKey ? '' : 'blur-[4px] select-none pointer-events-none'}`}
            >
              {keyData.key}
            </code>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowCurrentKey((v) => !v)}
                className="p-2 rounded-lg bg-white border border-amber-200 text-amber-700
                  hover:bg-amber-100/60 transition-colors shadow-xs cursor-pointer"
                title={showCurrentKey ? 'Hide key' : 'Show key'}
              >
                {showCurrentKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white border border-amber-200 text-amber-700
                  hover:bg-amber-100/60 transition-colors shadow-xs cursor-pointer"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-amber-700 italic">No master key found.</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordInput
          label="Current Master Key"
          name="currentKey"
          register={register}
          error={errors.currentKey}
          show={show.curr}
          onToggle={() => setShow((s) => ({ ...s, curr: !s.curr }))}
          placeholder="Enter active master key"
        />
        <PasswordInput
          label="New Master Key (min 8 characters)"
          name="newKey"
          register={register}
          error={errors.newKey}
          show={show.new}
          onToggle={() => setShow((s) => ({ ...s, new: !s.new }))}
          placeholder="Create new master key"
        />
        <PasswordInput
          label="Confirm New Master Key"
          name="confirmKey"
          register={register}
          error={errors.confirmKey}
          show={show.conf}
          onToggle={() => setShow((s) => ({ ...s, conf: !s.conf }))}
          placeholder="Re-enter new master key"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5
            rounded-xl text-xs sm:text-sm shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Updating Master Key…</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>Update Master Key</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

// ── Two-Factor Authentication (2FA) Form ──────────────────────
function TwoFactorForm({ admin, setAdmin }) {
  const [loading, setLoading] = useState(false)
  const [setupData, setSetupData] = useState(null)
  const [otpCode, setOtpCode] = useState('')
  const [password, setPassword] = useState('')
  const [showDisableForm, setShowDisableForm] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const { addToast } = useToast()

  const handleStartSetup = async () => {
    setLoading(true)
    try {
      const res = await api.post('/admin/2fa/setup')
      setSetupData(res.data)
      addToast('2FA QR Code generated. Scan with Google Authenticator.', 'info')
    } catch (err) {
      const errorMsg = err.message || 'Failed to initiate 2FA setup.'
      addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySetup = async (e) => {
    e.preventDefault()
    if (!otpCode || otpCode.length !== 6) {
      addToast('Please enter a valid 6-digit verification code.', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/admin/2fa/verify', { token: otpCode })
      const successMsg = res.message || '2FA enabled successfully!'
      addToast(successMsg, 'success')
      setSetupData(null)
      setOtpCode('')
      setAdmin({ ...admin, twoFactorEnabled: true })
    } catch (err) {
      const errorMsg = err.message || 'Failed to verify OTP code.'
      addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async (e) => {
    e.preventDefault()
    if (!password) {
      addToast('Please enter your password to disable 2FA.', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/admin/2fa/disable', { password })
      const successMsg = res.message || '2FA disabled successfully.'
      addToast(successMsg, 'info')
      setPassword('')
      setShowDisableForm(false)
      setAdmin({ ...admin, twoFactorEnabled: false })
    } catch (err) {
      const errorMsg = err.message || 'Failed to disable 2FA.'
      addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSetup = () => {
    setSetupData(null)
    setOtpCode('')
  }

  const isEnabled = admin?.twoFactorEnabled

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-gray-900">
              Two-Factor Authentication (2FA)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Adds an extra layer of security using Google Authenticator / Authy.</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold border ${
            isEnabled
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          {isEnabled ? 'Enabled & Active' : 'Disabled'}
        </span>
      </div>

      {isEnabled ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-emerald-950 font-heading">Your Account is Strongly Protected</h3>
              <p className="text-xs text-emerald-700 leading-relaxed mt-0.5">
                Every login attempt requires your password plus a 6-digit TOTP code from your mobile authenticator app.
              </p>
            </div>
          </div>

          {showDisableForm ? (
            <form onSubmit={handleDisable2FA} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">
                  Confirm Password to Disable 2FA
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-60 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  {loading ? 'Disabling...' : 'Confirm & Disable 2FA'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisableForm(false)}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowDisableForm(true)}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldX className="w-4 h-4" />
              <span>Disable Two-Factor Authentication</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-gray-800 font-heading">Why enable 2FA?</h3>
              <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
                Even if someone steals your password, they cannot log in without access to your physical phone or authenticator app.
              </p>
            </div>
          </div>

          {setupData ? (
            <div className="space-y-4 border-t border-gray-100 pt-4">
              <div className="flex flex-col items-center justify-center p-5 bg-gray-50/80 rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-800 mb-3 text-center uppercase tracking-wider">
                  Step 1: Scan QR Code with Authenticator App
                </p>
                <img
                  src={setupData.qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48 border border-gray-200 rounded-xl p-2 bg-white shadow-md"
                />

                <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-left max-w-sm">
                  <div className="flex gap-2.5 items-start">
                    <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <div className="text-[11px] text-gray-700 leading-relaxed">
                      <p className="font-bold text-brand-blue">Scan inside Google Authenticator / Authy:</p>
                      <p className="mt-0.5">Do NOT scan with standard camera. Open your Authenticator app, tap <span className="font-bold">+</span>, and scan this code.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 w-full max-w-xs flex flex-col items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Or Enter Secret Key Manually
                  </span>
                  <div className="flex w-full items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1.5 pl-3 shadow-inner">
                    <code className="flex-1 font-mono font-extrabold text-xs text-brand-blue truncate select-all">
                      {setupData.secret}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(setupData.secret)
                        setCopiedSecret(true)
                        addToast('2FA secret copied', 'info')
                        setTimeout(() => setCopiedSecret(false), 2000)
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-brand-blue transition-colors shrink-0 cursor-pointer"
                      title="Copy Key"
                    >
                      {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerifySetup} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">
                    Step 2: Enter 6-Digit Code from Authenticator
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 123456"
                    className="w-full text-center tracking-[0.25em] font-mono font-bold text-xl px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying…</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify &amp; Activate 2FA</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSetup}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={handleStartSetup}
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Initiating Setup…</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Setup Two-Factor Authentication</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Settings Page Component ──────────────────────────────
export default function AdminSettingsPage() {
  const { admin, setAdmin } = useOutletContext()
  const [activeTab, setActiveTab] = useState('ALL') // 'ALL' | 'ACCOUNT' | 'SECURITY' | 'KEYS'

  const isSuperAdmin = admin?.role === 'SUPER_ADMIN'
  const is2FAOn = Boolean(admin?.twoFactorEnabled)

  return (
    <>
      <SEO title="Account Security & Credentials" noIndex />
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-linear-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <KeyRound className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">Account &amp; Security Vault</h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Super Admin Vault
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Manage administrator login credentials, update passwords, configure 2FA authentication, and manage Master Access keys.
                </p>
              </div>
            </div>

            {/* Quick Profile Summary Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 min-w-[240px] shrink-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-medium">Logged in as:</span>
                <span className="text-[10px] font-extrabold text-white px-2 py-0.5 bg-brand-blue rounded-md uppercase tracking-wider">
                  {isSuperAdmin ? 'SUPER ADMIN' : admin?.role || 'ADMIN'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white truncate">{admin?.email || 'admin@hindustanprojects.com'}</p>
              
              <div className="pt-1 flex items-center justify-between border-t border-white/10 text-xs">
                <span className="text-gray-300">Security Score:</span>
                <span className={`font-bold flex items-center gap-1 ${is2FAOn ? 'text-emerald-400' : 'text-amber-300'}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {is2FAOn ? 'Maximum Protection' : 'Standard'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Segmented Navigation Tabs ───────────────────────── */}
        <div className="flex gap-1.5 bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Vault Settings
          </button>
          <button
            onClick={() => setActiveTab('ACCOUNT')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ACCOUNT'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Email &amp; Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'SECURITY'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Password &amp; 2FA</span>
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('KEYS')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'KEYS'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Integration Master Key</span>
            </button>
          )}
        </div>

        {/* ── Settings Content Grid ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Profile Overview Card (Always shown in ALL or ACCOUNT) */}
          {(activeTab === 'ALL' || activeTab === 'ACCOUNT') && (
            <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-brand-blue via-indigo-600 to-brand-blue-hover flex items-center justify-center shadow-md shrink-0 text-white font-extrabold text-2xl border-2 border-white">
                  {admin?.email ? admin.email[0].toUpperCase() : 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">{admin?.email || 'Admin'}</h3>
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-brand-blue border border-blue-200 rounded-full">
                      {isSuperAdmin ? 'Super Administrator' : 'Administrator'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">SnapTech Digital Management Suite</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active Session Verified
                    </span>
                    {is2FAOn && (
                      <span className="inline-flex items-center gap-1 text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        2FA Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Email Form */}
          {(activeTab === 'ALL' || activeTab === 'ACCOUNT') && (
            <EmailForm
              currentEmail={admin?.email}
              onEmailUpdated={(updatedData) => setAdmin(updatedData)}
            />
          )}

          {/* Update Password Form */}
          {(activeTab === 'ALL' || activeTab === 'SECURITY') && <PasswordForm />}

          {/* Two-Factor Authentication Form */}
          {(activeTab === 'ALL' || activeTab === 'SECURITY') && (
            <TwoFactorForm admin={admin} setAdmin={setAdmin} />
          )}

          {/* Integration Master Key Form (SUPER_ADMIN only) */}
          {isSuperAdmin && (activeTab === 'ALL' || activeTab === 'KEYS') && (
            <div className={activeTab === 'KEYS' ? 'lg:col-span-2' : ''}>
              <MasterKeyForm />
            </div>
          )}

        </div>

        {/* ── Security Best Practices Reminder Banner ────────────── */}
        <div className="bg-linear-to-r from-amber-50 to-orange-50/80 border border-amber-200/80 rounded-2xl p-5 sm:p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-950 font-heading flex items-center gap-2">
              <span>Enterprise Security Best Practices</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Always use unique, complex passwords for your admin account. Do not share your login credentials or master key with anyone. Enable Two-Factor Authentication (2FA) for maximum protection against unauthorized access.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}

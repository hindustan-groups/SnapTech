/* eslint-disable react-refresh/only-export-components */
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  ShoppingCart,
  Layers,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Zap,
  Clock,
  Calculator,
  Laptop,
  Database,
  Lock,
  Search,
  Server,
  Languages,
  Headphones,
  Info,
  Sparkles,
} from 'lucide-react'
import { api } from '@/utils/api'

// ── Pricing Data Architecture ──────────────────────────────────
export const PROJECT_TYPES = [
  {
    id: 'landing',
    name: 'High-Impact Landing Page',
    description: 'Ultra-fast, conversion-optimized single or dual page experience with modern micro-animations.',
    basePrice: 12999,
    icon: Laptop,
    badge: 'Fastest Launch',
  },
  {
    id: 'business',
    name: 'Corporate Business Website',
    description: 'Multi-page authority website with service catalogues, team showcases, and lead telemetry.',
    basePrice: 24999,
    icon: Globe,
    badge: 'Most Popular',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & D2C Store',
    description: 'High-velocity online store with product variants, cart drawers, and UPI/Card checkout.',
    basePrice: 39999,
    icon: ShoppingCart,
    badge: 'High Conversion',
  },
  {
    id: 'webapp',
    name: 'Custom SaaS & Web Platform',
    description: 'Full-stack application with relational database, custom APIs, dashboard metrics, and workflows.',
    basePrice: 59999,
    icon: Database,
    badge: 'Enterprise Scope',
  },
]

export const PAGE_SCOPES = [
  { id: '1-5', label: '1 to 5 Pages', desc: 'Essential core pages (Home, About, Services, Contact, Legal)', addPrice: 0 },
  { id: '6-12', label: '6 to 12 Pages', desc: 'Standard business footprint with in-depth service & case studies', addPrice: 8000 },
  { id: '13-25', label: '13 to 25 Pages', desc: 'Extensive multi-category layout, portfolio vaults, and rich content', addPrice: 18000 },
  { id: '25+', label: '25+ Enterprise Scope', desc: 'Large scale corporate portal, programmatic pages, or directory', addPrice: 32000 },
]

export const FEATURE_ADDONS = [
  {
    id: 'cms',
    name: 'Admin CMS Control Panel',
    desc: 'Self-manage blogs, projects, team members, and testimonials without writing code.',
    price: 6000,
    icon: Layers,
  },
  {
    id: 'payments',
    name: 'Payment Gateway Integration',
    desc: 'Zero-drop-off UPI, Credit Card, Netbanking via Razorpay, Stripe, or Cashfree.',
    price: 4500,
    icon: Zap,
  },
  {
    id: 'auth',
    name: 'User Accounts & Client Portal',
    desc: 'Secure customer login, role-based access, and deliverable status vault.',
    price: 7500,
    icon: Lock,
  },
  {
    id: 'seo',
    name: 'Advanced SEO & Schema Markup',
    desc: 'Rich Google snippet JSON-LD schemas, automated sitemap, and OpenGraph tags.',
    price: 4000,
    icon: Search,
  },
  {
    id: 'speed',
    name: 'Sub-Second NVMe Speed Tuning',
    desc: 'Global Edge CDN cache, image webp auto-compression, and 95+ PageSpeed guarantee.',
    price: 3500,
    icon: Server,
  },
  {
    id: 'i18n',
    name: 'Multi-Language Support (i18n)',
    desc: 'Bilingual or multilingual localized user interface for global audiences.',
    price: 5000,
    icon: Languages,
  },
  {
    id: 'support',
    name: 'Priority 24/7 SLA Engineering Retainer',
    desc: 'Immediate emergency bug response, continuous uptime monitor, and monthly backups.',
    price: 6000,
    icon: Headphones,
  },
]

export const VELOCITIES = [
  { id: 'standard', label: 'Standard Delivery', time: '3 to 4 Weeks', multiplier: 1.0, desc: 'Balanced phased agile sprints' },
  { id: 'express', label: 'Express Sprint', time: '10 to 14 Days', multiplier: 1.15, desc: 'Dedicated engineering pod priority' },
  { id: 'rush', label: 'Rapid Launch', time: 'Under 7 Days', multiplier: 1.30, desc: 'All-hands sprint for immediate launch deadlines' },
]

export default function CostCalculator({ compact = false }) {
  const navigate = useNavigate()

  // Wizard state
  const [step, setStep] = useState(1) // 1: Type, 2: Pages, 3: Addons, 4: Velocity, 5: Quote & Submit
  const [selectedType, setSelectedType] = useState('business')
  const [selectedScope, setSelectedScope] = useState('6-12')
  const [selectedAddons, setSelectedAddons] = useState(['cms', 'seo'])
  const [selectedVelocity, setSelectedVelocity] = useState('standard')

  // Lead capture state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: true,
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Calculate live estimate
  const currentCalculation = useMemo(() => {
    const typeObj = PROJECT_TYPES.find((t) => t.id === selectedType) || PROJECT_TYPES[1]
    const scopeObj = PAGE_SCOPES.find((s) => s.id === selectedScope) || PAGE_SCOPES[1]
    const addonsTotal = selectedAddons.reduce((acc, id) => {
      const addon = FEATURE_ADDONS.find((a) => a.id === id)
      return acc + (addon ? addon.price : 0)
    }, 0)

    const velocityObj = VELOCITIES.find((v) => v.id === selectedVelocity) || VELOCITIES[0]

    const subtotal = typeObj.basePrice + scopeObj.addPrice + addonsTotal
    const grandTotal = Math.round(subtotal * velocityObj.multiplier)

    return {
      typeObj,
      scopeObj,
      addonsCount: selectedAddons.length,
      addonsTotal,
      velocityObj,
      subtotal,
      grandTotal,
    }
  }, [selectedType, selectedScope, selectedAddons, selectedVelocity])

  const toggleAddon = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleLeadSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg('Please enter your Name, Email, and Phone Number.')
      return
    }
    if (!formData.consent) {
      setErrorMsg('Please confirm privacy consent to receive your formal proposal.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const estimateSummary = `[Cost Calculator Quote]\nProject Type: ${currentCalculation.typeObj.name}\nScope: ${currentCalculation.scopeObj.label}\nAddons: ${selectedAddons.join(', ')}\nDelivery: ${currentCalculation.velocityObj.label} (${currentCalculation.velocityObj.time})\nEstimated Range: ₹${currentCalculation.grandTotal.toLocaleString('en-IN')}\n\nClient Note: ${formData.message || 'None'}`

      await api.post('/contact', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        serviceInterested: `Website Cost Calculator (Est: ₹${currentCalculation.grandTotal.toLocaleString('en-IN')})`,
        message: estimateSummary,
        consent: true,
        recaptchaToken: 'dev-token',
        _hp: '',
      })

      // Store in session storage for thank you page
      sessionStorage.setItem('last_quote_estimate', `₹${currentCalculation.grandTotal.toLocaleString('en-IN')}`)
      sessionStorage.setItem('last_quote_type', currentCalculation.typeObj.name)

      // Navigate to dedicated Thank You page with query params
      navigate(`/thank-you?source=calculator&estimate=${encodeURIComponent('₹' + currentCalculation.grandTotal.toLocaleString('en-IN'))}&type=${encodeURIComponent(currentCalculation.typeObj.name)}&name=${encodeURIComponent(formData.name)}`)
    } catch (err) {
      setErrorMsg(err.message || 'Unable to submit estimate. Please reach us directly on WhatsApp or Email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`w-full max-w-5xl mx-auto ${compact ? '' : 'p-2 sm:p-4 lg:p-6'}`}>
      {/* ── Top Header / Live Estimate Bar ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden mb-6 sm:mb-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/80 pb-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-brand-blue mb-2.5 shadow-2xs">
              <Calculator className="w-3.5 h-3.5" />
              <span>Transparent Project Estimator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0D1B4B] tracking-tight">
              Interactive Scope &amp; Cost Calculator
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-xl">
              Configure your desired architecture, page depth, and delivery velocity for a real-time engineering estimate.
            </p>
          </div>

          {/* Running Live Total Display */}
          <div className="bg-linear-to-br from-blue-50/90 via-indigo-50/40 to-white border border-blue-200/90 rounded-2xl p-4 sm:px-6 text-right shrink-0 shadow-xs">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">Estimated Investment</p>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
              ₹{currentCalculation.grandTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center justify-end gap-1.5">
              <Clock className="w-3 h-3 text-brand-blue" />
              <span>{currentCalculation.velocityObj.time} &bull; Fixed-Price Scope</span>
            </p>
          </div>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-6 relative z-10">
          {[
            { num: 1, label: 'Archetype' },
            { num: 2, label: 'Page Scope' },
            { num: 3, label: 'Features' },
            { num: 4, label: 'Timeline' },
            { num: 5, label: 'Get Quote' },
          ].map((s) => {
            const isActive = step === s.num
            const isCompleted = step > s.num
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-blue text-white font-bold shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20'
                    : isCompleted
                    ? 'bg-blue-50/80 text-brand-blue border border-blue-200 hover:bg-blue-100/70 font-semibold'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                    isActive
                      ? 'bg-white text-brand-blue'
                      : isCompleted
                      ? 'bg-brand-blue text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                </span>
                <span className="truncate hidden sm:inline">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Wizard Content Area ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative">
        <AnimatePresence mode="wait">
          {/* STEP 1: Project Archetype */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0D1B4B]">
                  Step 1: Select Your Project Archetype
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Choose the category that best matches your immediate business and technology objectives.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROJECT_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = selectedType === type.id
                  return (
                    <div
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`relative p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-linear-to-b from-blue-50/70 to-white border-2 border-brand-blue shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
                          : 'bg-slate-50/50 border-slate-200/90 hover:border-blue-300 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3.5">
                        <div
                          className={`p-3 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-brand-blue text-white shadow-md shadow-blue-500/20'
                              : 'bg-blue-50 text-brand-blue border border-blue-100'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            isSelected
                              ? 'bg-blue-100 text-brand-blue border-blue-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {type.badge}
                        </span>
                      </div>

                      <h4 className="text-base font-heading font-bold text-slate-900 mb-1.5">{type.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{type.description}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200/70 text-xs">
                        <span className="text-slate-500 font-medium">Baseline Investment</span>
                        <span className="font-heading font-bold text-brand-blue text-sm">
                          ₹{type.basePrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Page Scope */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0D1B4B]">
                  Step 2: Choose Page Architecture &amp; Breadth
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  How many unique templates and dedicated content pages does your platform require?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PAGE_SCOPES.map((scope) => {
                  const isSelected = selectedScope === scope.id
                  return (
                    <div
                      key={scope.id}
                      onClick={() => setSelectedScope(scope.id)}
                      className={`p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-linear-to-b from-blue-50/70 to-white border-2 border-brand-blue shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
                          : 'bg-slate-50/50 border-slate-200/90 hover:border-blue-300 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-heading font-bold text-slate-900">{scope.label}</h4>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-blue" />}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{scope.desc}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200/70 text-xs">
                        <span className="text-slate-500 font-medium">Scope Delta</span>
                        <span className="font-heading font-bold text-brand-blue text-sm">
                          {scope.addPrice === 0 ? 'Included in Base' : `+₹${scope.addPrice.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Core Features & Add-ons */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0D1B4B]">
                    Step 3: Select Advanced Engineering Add-ons
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Check the enterprise modules you want integrated into your production build.
                  </p>
                </div>
                <span className="text-xs text-brand-blue font-mono font-bold bg-blue-50 border border-blue-200 px-3 py-1 rounded-full hidden sm:inline">
                  {selectedAddons.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {FEATURE_ADDONS.map((addon) => {
                  const Icon = addon.icon
                  const isChecked = selectedAddons.includes(addon.id)
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-linear-to-b from-blue-50/60 to-white border-2 border-brand-blue shadow-xs'
                          : 'bg-slate-50/50 border-slate-200/90 hover:border-blue-300 hover:bg-white'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-brand-blue text-white shadow-xs'
                            : 'border-2 border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-heading font-bold text-slate-900 flex items-center gap-2 truncate">
                            <Icon className="w-4 h-4 text-brand-blue shrink-0" />
                            <span className="truncate">{addon.name}</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-brand-blue bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md shrink-0">
                            +₹{addon.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{addon.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Timeline / Velocity */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0D1B4B]">
                  Step 4: Delivery Velocity &amp; Launch Window
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Select your timeline requirements. Fast-track options deploy dedicated sprint pods.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {VELOCITIES.map((vel) => {
                  const isSelected = selectedVelocity === vel.id
                  return (
                    <div
                      key={vel.id}
                      onClick={() => setSelectedVelocity(vel.id)}
                      className={`p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-linear-to-b from-blue-50/70 to-white border-2 border-brand-blue shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
                          : 'bg-slate-50/50 border-slate-200/90 hover:border-blue-300 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-heading font-bold text-slate-900">{vel.label}</h4>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-blue" />}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200/80 text-brand-blue text-xs font-mono font-semibold mb-3">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{vel.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{vel.desc}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-200/70 text-xs flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Multiplier</span>
                        <span className="font-heading font-bold text-brand-blue">
                          {vel.multiplier === 1.0 ? '1.0x (Standard)' : `${vel.multiplier}x Priority`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 5: Instant Quote Summary & Lead Capture */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0D1B4B]">
                  Step 5: Lock In Your Estimate &amp; Receive Formal Proposal
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Enter your details to receive an itemized architectural proposal, wireframe schedule, and direct engineer consultation.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Summary Card */}
                <div className="lg:col-span-5 bg-linear-to-b from-slate-50 to-blue-50/30 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                      <span>Configured Scope</span>
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-blue-100 text-brand-blue px-2 py-0.5 rounded-full">
                      Sprint 0 Ready
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Archetype:</span>
                      <span className="font-bold text-slate-900 text-right">{currentCalculation.typeObj.name}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Scope:</span>
                      <span className="font-bold text-slate-900 text-right">{currentCalculation.scopeObj.label}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Modules:</span>
                      <span className="font-bold text-brand-blue text-right">{selectedAddons.length} Add-ons Selected</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Timeline:</span>
                      <span className="font-bold text-slate-900 text-right">{currentCalculation.velocityObj.time}</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-linear-to-br from-brand-blue to-indigo-700 text-white shadow-lg shadow-blue-500/20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    <p className="text-[11px] font-mono text-blue-100 uppercase tracking-wider font-semibold">Total Investment Estimate</p>
                    <p className="text-3xl sm:text-4xl font-heading font-extrabold text-white mt-1 tracking-tight">
                      ₹{currentCalculation.grandTotal.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-blue-100/90 mt-1 font-medium">Guaranteed milestone-based fixed price</p>
                  </div>

                  <div className="text-xs text-slate-600 space-y-2 pt-1">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
                      <span>100% Full Git Source Code Ownership</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
                      <span>Zero-Vulnerability Code Warranty Included</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
                      <span>Direct WhatsApp SLA &amp; Solution Architect</span>
                    </p>
                  </div>
                </div>

                {/* Right: Submission Form */}
                <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@company.com"
                          className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                          WhatsApp / Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                        Specific Requirements / Project Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Any existing design references, competitors, or custom third-party integrations needed..."
                        className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all resize-none"
                      />
                    </div>

                    {/* DPDP Consent */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="calculator-consent"
                        required
                        checked={formData.consent}
                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue focus:ring-offset-0 cursor-pointer"
                      />
                      <label htmlFor="calculator-consent" className="text-[11px] text-slate-600 leading-snug cursor-pointer">
                        I agree to receive a formal itemized estimate and architectural proposal from SnapTech Digital per the <a href="/privacy-policy" target="_blank" rel="noreferrer" className="text-brand-blue font-semibold underline hover:text-blue-700">Privacy Policy</a> (DPDP Act 2023 compliant).
                      </label>
                    </div>

                    {errorMsg && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <Info className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 rounded-xl font-heading font-bold text-sm bg-brand-blue hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating Formal Architecture Quote…</span>
                        </>
                      ) : (
                        <>
                          <span>Submit &amp; View Detailed Quote</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Navigation Bottom Bar ── */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200/80">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(5, s + 1))}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

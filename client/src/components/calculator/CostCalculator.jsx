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
    <div className={`w-full max-w-5xl mx-auto ${compact ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
      {/* ── Top Header / Stepper Progress ── */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-xs font-semibold text-cyan-400 mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Transparent Project Estimator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Instant Website &amp; App Cost Calculator
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Configure your desired scope, features, and timeline for a real-time engineering estimate.
            </p>
          </div>

          {/* Running Live Total Display */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 sm:px-6 text-right shrink-0">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Estimated Investment</p>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">
              ₹{currentCalculation.grandTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-cyan-400/80 font-mono mt-0.5">
              {currentCalculation.velocityObj.time} &bull; GST Applicable
            </p>
          </div>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-5 gap-2 mt-6 relative z-10">
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
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
                    : isCompleted
                    ? 'bg-white/10 text-cyan-300 hover:bg-white/15'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isActive ? 'bg-slate-950 text-cyan-400 font-bold' : isCompleted ? 'bg-cyan-400 text-slate-950' : 'bg-white/10'
                }`}>
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                </span>
                <span className="truncate hidden sm:inline">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Wizard Content Area ── */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
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
                <h3 className="text-lg font-heading font-bold text-white">Step 1: Select Your Project Archetype</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
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
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-slate-950/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className={`p-3 rounded-xl ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-cyan-400'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                          {type.badge}
                        </span>
                      </div>

                      <h4 className="text-base font-heading font-bold text-white mb-1.5">{type.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{type.description}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                        <span className="text-slate-400">Baseline Investment</span>
                        <span className="font-heading font-bold text-cyan-300">
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
                <h3 className="text-lg font-heading font-bold text-white">Step 2: Choose Page Architecture &amp; Breadth</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
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
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-slate-950/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-heading font-bold text-white">{scope.label}</h4>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">{scope.desc}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                        <span className="text-slate-400">Scope Delta</span>
                        <span className="font-heading font-bold text-cyan-300">
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
                  <h3 className="text-lg font-heading font-bold text-white">Step 3: Select Advanced Engineering Add-ons</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Check the enterprise modules you want integrated into your production build.
                  </p>
                </div>
                <span className="text-xs text-cyan-400 font-mono hidden sm:inline">
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
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-sm'
                          : 'bg-slate-950/60 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                        isChecked ? 'bg-cyan-500 text-slate-950' : 'border border-white/30 bg-white/5'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-3" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-heading font-bold text-white flex items-center gap-2">
                            <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>{addon.name}</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-cyan-300">
                            +₹{addon.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{addon.desc}</p>
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
                <h3 className="text-lg font-heading font-bold text-white">Step 4: Delivery Velocity &amp; Launch Window</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
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
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-slate-950/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-heading font-bold text-white">{vel.label}</h4>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-cyan-300 text-xs font-mono font-semibold mb-3">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{vel.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">{vel.desc}</p>
                      </div>

                      <div className="pt-3 border-t border-white/10 text-xs flex items-center justify-between">
                        <span className="text-slate-400">Multiplier</span>
                        <span className="font-heading font-bold text-cyan-300">
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
                <h3 className="text-lg font-heading font-bold text-white">Step 5: Lock In Your Estimate &amp; Receive Formal Proposal</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Enter your details to receive an itemized architectural proposal, wireframe schedule, and direct engineer consultation.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Summary Card */}
                <div className="lg:col-span-5 bg-slate-950/80 border border-white/10 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Configured Architecture</h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between pb-2 border-b border-white/10">
                      <span className="text-slate-400">Archetype:</span>
                      <span className="font-semibold text-white">{currentCalculation.typeObj.name}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-white/10">
                      <span className="text-slate-400">Scope:</span>
                      <span className="font-semibold text-white">{currentCalculation.scopeObj.label}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-white/10">
                      <span className="text-slate-400">Modules:</span>
                      <span className="font-semibold text-cyan-300">{selectedAddons.length} Add-ons Selected</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-white/10">
                      <span className="text-slate-400">Timeline:</span>
                      <span className="font-semibold text-white">{currentCalculation.velocityObj.time}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                    <p className="text-[11px] font-mono text-cyan-400 uppercase">Total Estimate</p>
                    <p className="text-3xl font-heading font-extrabold text-white mt-1">
                      ₹{currentCalculation.grandTotal.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Guaranteed milestone-based fixed price</p>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1.5 pt-2">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>100% Full Git Source Code Ownership</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Zero-Vulnerability Code Warranty Included</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Direct WhatsApp SLA &amp; Dedicated Solution Architect</span>
                    </p>
                  </div>
                </div>

                {/* Right: Submission Form */}
                <div className="lg:col-span-7">
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dilshan Sharma"
                        className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="dilshan@company.com"
                          className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                          WhatsApp / Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 94141 12057"
                          className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                        Specific Requirements / Project Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Any existing design references, competitors, or custom third-party integrations needed..."
                        className="w-full px-4 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
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
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer"
                      />
                      <label htmlFor="calculator-consent" className="text-[11px] text-slate-400 leading-snug cursor-pointer">
                        I agree to receive a formal itemized estimate and architectural proposal from SnapTech Digital per the <a href="/privacy-policy" target="_blank" rel="noreferrer" className="text-cyan-400 underline">Privacy Policy</a> (DPDP Act 2023 compliant).
                      </label>
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 rounded-xl font-heading font-bold text-sm bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
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
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
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

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, PhoneCall, ArrowRight, ShieldCheck, Code2, MessageSquare, Cpu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if the user has already seen the popup in this session/device
    const hasSeen = localStorage.getItem('hp_welcome_seen')
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2500) // Show popup after 2.5 seconds
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('hp_welcome_seen', 'true') // Prevent showing it again
  }

  const handleAction = (path) => {
    setIsOpen(false)
    localStorage.setItem('hp_welcome_seen', 'true')
    navigate(path)
  }

  const handleWhatsApp = () => {
    setIsOpen(false)
    localStorage.setItem('hp_welcome_seen', 'true')
    window.open('https://wa.me/917597000601?text=Hi%20SnapTech%20Team,%20I%20want%20to%20consult%20about%20a%20software/web%20project.', '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl relative w-full max-w-lg z-10 border border-slate-200/90 flex flex-col"
          >
            {/* Top Decorative Gradient Cover */}
            <div className="h-32 bg-gradient-to-r from-[#0D1B4B] via-[#122A6B] to-[#1B6EF3] p-6 flex items-center relative overflow-hidden shrink-0">
              {/* Background Shapes & Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              <div className="absolute w-48 h-48 rounded-full bg-white/10 -top-12 -right-6 blur-lg pointer-events-none" />
              <div className="absolute w-32 h-32 rounded-full bg-brand-cyan/20 -bottom-8 -left-8 blur-md pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                  <Code2 className="w-6 h-6 text-brand-cyan" />
                </div>
                <div>
                  <div className="text-xl font-heading font-extrabold text-white leading-tight flex items-center gap-1.5 tracking-tight">
                    SnapTech Digital
                    <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
                  </div>
                  <p className="text-xs text-blue-200 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Engineering High-Impact Web, Cloud &amp; AI Solutions
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer border border-white/15"
                aria-label="Close popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 space-y-6 text-slate-700">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-brand-blue uppercase tracking-wider">
                  <Cpu className="w-3 h-3" /> Architecture Blueprint
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  Scale Your Software With India's Elite Tech Team
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Looking for enterprise full-stack web platforms, high-speed mobile apps, custom ERPs, or AI workflows? Consult directly with senior architects backed by guaranteed SLAs.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  {
                    title: 'Free Architecture Audit',
                    desc: 'Sprint breakdown & cost estimate in 24h',
                    icon: Sparkles,
                    color: 'text-amber-600 bg-amber-50 border-amber-200/70',
                  },
                  {
                    title: '100% Code Ownership',
                    desc: 'Zero lock-in & full GitHub transparency',
                    icon: ShieldCheck,
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-200/70',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={() => handleAction('/contact')}
                  className="flex-1 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-brand-blue/20 flex items-center justify-center gap-1.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" /> Claim Free Tech Audit
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-emerald-600/20 flex items-center justify-center gap-1.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp Us Now
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                <button
                  onClick={() => handleAction('/services')}
                  className="text-slate-600 hover:text-brand-blue font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Explore All Capabilities <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={handleClose}
                  className="font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Browse website first
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

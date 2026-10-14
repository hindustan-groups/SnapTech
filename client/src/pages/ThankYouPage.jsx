import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Clock,
  ShieldCheck,
  Home,
  Briefcase,
  Layers,
} from 'lucide-react'
import { Container, SEO } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'

export default function ThankYouPage() {
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}
  const rawWa = cfg.whatsapp || cfg.phone || '+91 8209604849'
  const cleanWa = rawWa.replace(/\D/g, '')
  const phoneDisplay = cfg.phone || '+91 8209604849'

  const [searchParams] = useSearchParams()
  const source = searchParams.get('source') || 'general'
  const estimate = searchParams.get('estimate') || ''
  const projectType = searchParams.get('type') || ''
  const clientName = searchParams.get('name') || ''

  // Fire GA4 Lead Generation Conversion Event
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        event_category: 'conversion',
        event_label: source === 'calculator' ? 'cost_calculator_lead' : 'contact_form_lead',
        value: estimate ? parseInt(estimate.replace(/[^0-9]/g, ''), 10) || 1 : 1,
        currency: 'INR',
      })
    }
  }, [source, estimate])

  const prefilledWhatsappMsg = encodeURIComponent(
    `Hi SnapTech Digital team, I just submitted an inquiry on your website${
      estimate ? ` for ${projectType || 'a project'} (Estimate: ${estimate})` : ''
    }. I would like to fast-track my consultation.`
  )

  return (
    <>
      <SEO
        title="Thank You | Inquiry Received — SnapTech Digital"
        description="Your inquiry has been successfully received by SnapTech Digital. Our Solution Architects will review your technical specifications within 24 hours."
        noIndex
      />

      <div className="bg-white text-slate-900 min-h-screen pt-28 pb-20 selection:bg-brand-blue/15 selection:text-brand-blue relative overflow-hidden flex items-center">
        {/* Ambient subtle background grid & gentle glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-size-[48px_48px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-140 h-140 bg-blue-100/50 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-100/40 rounded-full blur-[140px] pointer-events-none" />

        <Container className="relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* Animated Success Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 180 }}
              className="w-20 h-20 mx-auto rounded-3xl bg-linear-to-br from-brand-blue to-indigo-600 p-0.5 shadow-xl shadow-blue-500/25"
            >
              <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-brand-blue" />
              </div>
            </motion.div>

            {/* Title & Reassurance */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-brand-blue uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                <span>Inquiry Successfully Logged</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#0D1B4B] tracking-tight">
                {clientName ? `Thank You, ${clientName}!` : 'Thank You for Reaching Out!'}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                Your specifications have been routed to our senior engineering pod. We are scoping your requirements and will reach out with a detailed architectural breakdown.
              </p>
            </motion.div>

            {/* Contextual Estimate Card (if from Cost Calculator) */}
            {estimate && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-linear-to-b from-blue-50/60 to-white shadow-md text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="text-[11px] font-mono uppercase text-brand-blue font-bold tracking-wider">
                    Configured Architectural Scope
                  </p>
                  <p className="text-base sm:text-lg font-heading font-extrabold text-[#0D1B4B] mt-0.5">
                    {projectType || 'Custom Web Application'}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Itemized milestone breakdown is being compiled for you.
                  </p>
                </div>

                <div className="sm:text-right shrink-0 bg-white px-4 py-2.5 rounded-xl border border-blue-200 shadow-xs">
                  <p className="text-[10px] font-mono text-slate-500 uppercase font-bold">Estimated Budget</p>
                  <p className="text-xl sm:text-2xl font-heading font-extrabold text-brand-blue">{estimate}</p>
                </div>
              </motion.div>
            )}

            {/* SLA Response Guarantee Box */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left"
            >
              <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white transition-all shadow-2xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-brand-blue shrink-0">
                  <Clock className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <h4 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wider">
                    Guaranteed Response SLA
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Formal reply within 4 to 24 business hours directly from a Solution Architect.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white transition-all shadow-2xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-brand-blue shrink-0">
                  <ShieldCheck className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <h4 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wider">
                    Confidential &amp; Secure
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Your architecture and project ideas are strictly protected under mutual NDA standards.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Immediate Escalation CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-50 via-indigo-50/60 to-blue-50 border border-blue-200/90 space-y-4 shadow-xs"
            >
              <div>
                <h3 className="text-lg font-heading font-bold text-[#0D1B4B]">Need an urgent project kickoff?</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Connect immediately with our technical leadership on WhatsApp for real-time discussion.
                </p>
              </div>

              <a
                href={`https://wa.me/${cleanWa}?text=${prefilledWhatsappMsg}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp Now ({phoneDisplay})</span>
              </a>
            </motion.div>

            {/* Quick Navigation Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-bold text-slate-600"
            >
              <Link
                to="/portfolio"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 hover:text-brand-blue transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-brand-blue" />
                <span>Explore Recent Work</span>
              </Link>

              <Link
                to="/services"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 hover:text-brand-blue transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-brand-blue" />
                <span>Engineering Capabilities</span>
              </Link>

              <Link
                to="/"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 hover:text-brand-blue transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-brand-blue" />
                <span>Back to Home</span>
              </Link>
            </motion.div>
          </div>
        </Container>
      </div>
    </>
  )
}

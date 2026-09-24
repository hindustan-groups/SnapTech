import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Clock,
  ShieldCheck,
  Home,
  Briefcase,
  Layers,
  FileCheck,
} from 'lucide-react'
import { Container, SEO } from '@/components/ui'

export default function ThankYouPage() {
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

      <div className="bg-[#020714] text-white min-h-screen pt-28 pb-20 selection:bg-cyan-500 selection:text-black relative overflow-hidden flex items-center">
        {/* Ambient background glowing orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-120 h-120 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        <Container>
          <div className="max-w-2xl mx-auto text-center relative z-10 space-y-8">
            {/* Animated Success Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 180 }}
              className="w-20 h-20 mx-auto rounded-3xl bg-linear-to-br from-cyan-400 to-blue-600 p-0.5 shadow-2xl shadow-cyan-500/40"
            >
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-cyan-400" />
              </div>
            </motion.div>

            {/* Title & Reassurance */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inquiry Successfully Logged</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight">
                {clientName ? `Thank You, ${clientName}!` : 'Thank You for Reaching Out!'}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
                Your specifications have been routed to our senior engineering pod. We are scoping your requirements and will reach out with a detailed architectural breakdown.
              </p>
            </motion.div>

            {/* Contextual Estimate Card (if from Cost Calculator) */}
            {estimate && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-5 rounded-2xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-xl shadow-xl text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="text-[11px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                    Configured Architectural Scope
                  </p>
                  <p className="text-base font-heading font-bold text-white mt-0.5">
                    {projectType || 'Custom Web Application'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Itemized milestone breakdown is being compiled for you.
                  </p>
                </div>

                <div className="sm:text-right shrink-0 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Estimated Budget</p>
                  <p className="text-xl font-heading font-extrabold text-cyan-300">{estimate}</p>
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
              <div className="p-4 rounded-xl border border-white/10 bg-slate-900/60 flex items-start gap-3">
                <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                    Guaranteed Response SLA
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Formal reply within 4 to 24 business hours directly from a Solution Architect.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-slate-900/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                    Confidential &amp; Secure
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
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
              className="p-6 rounded-2xl bg-linear-to-r from-blue-900/40 via-cyan-900/30 to-blue-900/40 border border-cyan-500/30 space-y-4"
            >
              <div>
                <h3 className="text-base font-heading font-bold text-white">Need an urgent project kickoff?</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Connect immediately with our technical leadership on WhatsApp for real-time discussion.
                </p>
              </div>

              <a
                href={`https://wa.me/919414112057?text=${prefilledWhatsappMsg}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-heading font-bold text-xs transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp Now (+91 94141 12057)</span>
              </a>
            </motion.div>

            {/* Quick Navigation Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-slate-400"
            >
              <Link
                to="/portfolio"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explore Recent Work</span>
              </Link>

              <Link
                to="/services"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Engineering Capabilities</span>
              </Link>

              <Link
                to="/"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                <span>Back to Home</span>
              </Link>
            </motion.div>
          </div>
        </Container>
      </div>
    </>
  )
}

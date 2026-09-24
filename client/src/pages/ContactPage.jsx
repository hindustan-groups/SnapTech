import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react'
import { Container, SEO } from '@/components/ui'
import { useServices } from '@/hooks/useServices'
import { useFaqs, useSiteSettings } from '@/hooks/useContent'
import { api } from '@/utils/api'
import { faqSchema, breadcrumbSchema } from '@/components/ui/SEO'
import { fadeUp, staggerContainer } from '@/utils/motion'
import contactArchitectHero from '@/assets/contact_architect_hero.jpg'

// ── Zod validation schema ─────────────────────────────────────
const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name is too long.')
    .trim(),
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[+\d\s\-().]{7,20}$/.test(v), 'Please enter a valid phone number.'),
  serviceInterested: z.string().optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters.')
    .max(2000, 'Message is too long (max 2000 characters).'),
  consent: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the Privacy Policy to submit your inquiry.'),
  _hp: z.string().optional(), // honeypot
})

// ── Form Field Wrapper ─────────────────────────────────────────
function Field({ label, required, error, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex justify-between items-center"
      >
        <span>
          {label}
          {required && <span className="text-brand-blue ml-0.5">*</span>}
        </span>
      </label>
      {children}
      {error && (
        <p
          className="text-xs text-red-500 flex items-center gap-1 font-semibold mt-0.5"
          role="alert"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

// ── Custom Input Class helper (Crisp Light Mode) ───────────────
const inputClass = (hasError) =>
  [
    'w-full px-4 py-3 text-xs sm:text-sm text-slate-900 rounded-xl border bg-white',
    'placeholder:text-slate-400 font-medium',
    'focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue',
    'transition-all duration-200',
    hasError
      ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20'
      : 'border-slate-300 hover:border-slate-400 focus:border-brand-blue',
  ].join(' ')

// ── Contact Info Cards ─────────────────────────────────────────
function ContactInfoCard({ icon: Icon, label, value, href, borderColor }) {
  const inner = (
    <div className="flex items-start gap-4">
      <span className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
        <Icon
          className="w-5 h-5 text-brand-blue group-hover:text-white transition-colors duration-300"
          strokeWidth={1.8}
        />
      </span>
      <div className="space-y-1">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xs sm:text-sm text-slate-900 font-bold group-hover:text-brand-blue transition-colors duration-200 break-all sm:break-normal">
          {value}
        </p>
      </div>
    </div>
  )

  const baseClass = `group p-5 rounded-2xl border bg-white shadow-xs hover:shadow-md hover:border-brand-blue/40 hover:-translate-y-0.5 transition-all duration-300 border-l-4 ${
    borderColor || 'border-l-brand-blue border-slate-200/90'
  }`

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={`block ${baseClass}`}
      >
        {inner}
      </a>
    )
  }

  return <div className={baseClass}>{inner}</div>
}

// ── FAQ Fallback ───────────────────────────────────────────────
const FAQ_FALLBACK = [
  {
    id: '1',
    question: 'What IT services does SnapTech Digital specialize in?',
    answer:
      'We architect and engineer enterprise custom web portals, mobile applications (iOS/Android), custom textile & manufacturing ERP solutions, scalable cloud infrastructure, and AI workflow automations.',
  },
  {
    id: '2',
    question: 'Where is your engineering headquarters located?',
    answer:
      'Our physical development center is located in Bhilwara, Rajasthan (311001), serving regional industrial hubs and global enterprises remotely across India and international markets.',
  },
  {
    id: '3',
    question: 'How quickly can our team initiate a project sprint?',
    answer:
      'Following initial architecture scoping and proposal sign-off, we assign a dedicated engineering pod and initiate Sprint 0 within 3 to 5 business days.',
  },
  {
    id: '4',
    question: 'Do you offer guaranteed uptime and SLA maintenance contracts?',
    answer:
      'Yes. Every production deployment includes post-launch warranty, with options for 24/7 telemetry monitoring, scheduled database backups, security patches, and guaranteed 99.8% uptime SLAs.',
  },
  {
    id: '5',
    question: 'How is project cost and billing structured?',
    answer:
      'We provide transparent, milestone-based fixed price proposals for scoped deliverables, as well as dedicated engineering pod retainers with weekly progress demos.',
  },
]

// ── Main Page Component ────────────────────────────────────────
export default function ContactPage() {
  const navigate = useNavigate()
  const [submitState, setSubmitState] = useState('idle')
  const [apiError, setApiError] = useState('')
  const [activeFaq, setActiveFaq] = useState(null)
  const [localLockout, setLocalLockout] = useState(false)

  const { data: servicesData } = useServices()
  const services = servicesData?.data ?? []

  const { data: faqsData } = useFaqs()
  const faqs = faqsData?.data?.length ? faqsData.data : FAQ_FALLBACK

  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}
  const phone = cfg.phone || '+91 94141 12057'
  const email = cfg.email || 'info@snaptech.digital'
  const address = cfg.address || 'SnapTech Digital, Bhilwara, Rajasthan 311001, India'
  const whatsapp = cfg.whatsapp || cfg.phone || '919414112057'
  const whatsappNum = whatsapp.replace(/[^0-9]/g, '')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      serviceInterested: '',
      message: '',
      consent: false,
      _hp: '',
    },
  })

  useEffect(() => {
    const lastSubmit = localStorage.getItem('last_submit_lead')
    if (lastSubmit) {
      const timeDiff = Date.now() - parseInt(lastSubmit, 10)
      const oneDay = 24 * 60 * 60 * 1000
      if (timeDiff < oneDay) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalLockout(true)
      }
    }
  }, [])

  const onSubmit = useCallback(
    async (data) => {
      // Check local lockout before calling API
      const lastSubmit = localStorage.getItem('last_submit_lead')
      if (lastSubmit && Date.now() - parseInt(lastSubmit, 10) < 24 * 60 * 60 * 1000) {
        setSubmitState('error')
        setApiError('You have already submitted an inquiry recently. Please wait 24 hours.')
        return
      }

      setSubmitState('loading')
      setApiError('')

      try {
        let recaptchaToken = 'dev-token'
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
        if (siteKey && typeof window.grecaptcha !== 'undefined') {
          recaptchaToken = await new Promise((resolve, reject) => {
            window.grecaptcha.ready(() => {
              window.grecaptcha
                .execute(siteKey, { action: 'contact_form' })
                .then(resolve)
                .catch(reject)
            })
          })
        }

        await api.post('/contact', {
          ...data,
          recaptchaToken,
          _hp: data._hp || '', // honeypot
        })

        localStorage.setItem('last_submit_lead', Date.now().toString())
        setLocalLockout(true)
        setSubmitState('success')
        reset()
        // Seamless transition to dedicated Thank You experience
        setTimeout(() => {
          navigate(`/thank-you?source=contact&name=${encodeURIComponent(data.name || '')}`)
        }, 1200)
      } catch (err) {
        setSubmitState('error')
        setApiError(err.message || 'Something went wrong. Please try again.')
      }
    },
    [reset, navigate]
  )

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-brand-blue/15 selection:text-brand-blue">
      <SEO
        title="Contact SnapTech Digital — Get a Free Project Quote | Bhilwara, Rajasthan"
        description="Get in touch with SnapTech Digital. Request a free consultation for website development, app development, or digital marketing. Based in Bhilwara, serving clients across India."
        path="/contact"
        keywords="contact SnapTech Digital, IT consultation Bhilwara, hire web developers India, get a quote, digital agency contact, software development inquiry"
        schemas={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
          ...(faqs.length
            ? [faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })))]
            : []),
        ]}
      />

      {/* ── Page Hero Header ── */}
      <section className="pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 lg:pb-24 bg-linear-to-b from-slate-50 via-white to-slate-50/50 border-b border-slate-200/80 relative overflow-hidden">
        {/* Ambient Grid & Glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-size-[30px_30px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left text column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-blue bg-blue-50 border border-blue-200/80 shadow-xs mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                SNAPTECH DIGITAL IT & MEDIA DIVISION
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0D1B4B] leading-tight tracking-tight">
                Let&apos;s Architect Your{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
                  Digital Engine
                </span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
                Looking for enterprise web platforms, custom ERPs, mobile engineering, or cloud
                infrastructure? Connect directly with our lead software architects.
              </p>

              {/* Advanced Trust Blocks */}
              <div className="grid grid-cols-2 gap-4 pt-2 max-w-md">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-brand-blue/40 transition-colors duration-300">
                  <p className="text-2xl font-black text-brand-blue font-mono">
                    {cfg.stat_projects || '150+'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                    Deployments Complete
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500/40 transition-colors duration-300">
                  <p className="text-2xl font-black text-emerald-600 font-mono">&lt; 2h</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                    First Response SLA
                  </p>
                </div>
              </div>
            </div>

            {/* Right graphic column — High-Tech Solution Architect Consultation Desk */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                {/* Outer Glass Card */}
                <div className="relative rounded-3xl bg-white/90 border border-slate-200/90 shadow-2xl p-3 sm:p-4 backdrop-blur-xl overflow-hidden group">
                  {/* Subtle Top Status Header */}
                  <div className="flex items-center justify-between px-3 py-2 mb-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <span className="text-slate-800 font-bold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        CONSULTATION DESK // ACTIVE
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      &lt; 2H SLA GUARANTEE
                    </span>
                  </div>

                  {/* Main Portrait Frame with Tech Overlay */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 sm:aspect-square shadow-inner border border-slate-200">
                    <img
                      src={contactArchitectHero}
                      alt="SnapTech Solution Architect & Technical Consultation Desk"
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Gradient shading at bottom for text contrast */}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Corner Tech Accents */}
                    <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none z-20" />
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none z-20" />
                    <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none z-20" />
                    <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none z-20" />

                    {/* Top Left Floating Tag: Direct Architect On Duty */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2.5 bg-slate-950/85 border border-cyan-500/30 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <div className="text-left">
                        <p className="text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider leading-none">
                          LEAD ARCHITECT
                        </p>
                        <p className="text-[11px] font-bold text-white leading-none mt-0.5">
                          Mohmmad Dilshan
                        </p>
                      </div>
                    </div>

                    {/* Top Right Floating Tag: Mutual NDA */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-950/85 border border-white/15 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-xl">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] font-mono font-semibold text-slate-200">
                        NDA Protected
                      </span>
                    </div>

                    {/* Bottom Content Inside Image */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono font-semibold">
                        <span className="bg-slate-950/85 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/25 backdrop-blur-sm">
                          Full-Stack Cloud
                        </span>
                        <span className="bg-slate-950/85 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/25 backdrop-blur-sm">
                          Mobile &amp; Web
                        </span>
                        <span className="bg-slate-950/85 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/25 backdrop-blur-sm">
                          Custom ERP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick-Connect Action Bar below image */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-left">
                      <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">
                        HEADQUARTERS DESK
                      </p>
                      <p className="text-xs font-bold text-slate-800">
                        Bhilwara &bull; IST (UTC +5:30)
                      </p>
                    </div>

                    <a
                      href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent('Hi SnapTech Digital, I would like to speak directly with a Solution Architect about my project.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Direct</span>
                    </a>
                  </div>
                </div>

                {/* Sub Trust Guarantees */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[11px] font-medium text-slate-500">
                  <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Strict Mutual NDA</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>100% Code Ownership</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Main Content Grid ── */}
      <section className="py-14 sm:py-20 lg:py-24 relative bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* ── Left Column: Contact Cards + WhatsApp + Map ── */}
            <motion.aside
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-2 flex flex-col gap-6"
            >
              <motion.div variants={fadeUp}>
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block mb-1">
                  Connect With Us
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0D1B4B]">
                  Headquarters &amp; Direct Channels
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Reach out through your preferred channel for scoping, quote inquiries, or support.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col gap-4">
                <ContactInfoCard
                  icon={MapPin}
                  label="Headquarters Address"
                  value={address}
                  borderColor="border-l-brand-blue"
                />
                <ContactInfoCard
                  icon={Phone}
                  label="Direct Hotline"
                  value={phone}
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  borderColor="border-l-blue-600"
                />
                <ContactInfoCard
                  icon={Mail}
                  label="Official Email"
                  value={email}
                  href={`mailto:${email}`}
                  borderColor="border-l-indigo-600"
                />
              </motion.div>

              {/* WhatsApp CTA */}
              <motion.div variants={fadeUp}>
                <a
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
                    cfg.whatsappMessage || "Hi SnapTech Team! I'd like to discuss an enterprise project."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-3 px-6 py-4 rounded-2xl
                    text-white bg-emerald-600 hover:bg-emerald-700
                    transition-all duration-300 font-bold text-sm w-full justify-center 
                    shadow-md hover:shadow-lg hover:shadow-emerald-600/20
                    hover:-translate-y-0.5 cursor-pointer overflow-hidden"
                  aria-label="Chat with us on WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 shrink-0" />
                  Chat Directly on WhatsApp
                </a>
              </motion.div>

              {/* Map Container */}
              <motion.div
                variants={fadeUp}
                className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white p-1.5"
              >
                <div className="rounded-xl overflow-hidden h-56 relative group">
                  <iframe
                    title="SnapTech Office Location — Bhilwara, Rajasthan"
                    src={(() => {
                      const raw = cfg.googleMapUrl
                      if (!raw)
                        return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57692.35!2d74.6!3d25.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3968a5!2sBhilwara%2C+Rajasthan!5e0!3m2!1sen!2sin!4v1'
                      if (raw.includes('src="')) {
                        const match = raw.match(/src="([^"]+)"/)
                        return match && match[1] ? match[1] : raw
                      }
                      return raw
                    })()}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
              </motion.div>
            </motion.aside>

            {/* ── Right Column: Clean Light Contact Form ── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 relative overflow-hidden">
                {/* Luminous Top Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-blue via-blue-600 to-indigo-600" />

                {/* Success state */}
                {submitState === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
                    <span className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-md text-emerald-600">
                      <CheckCircle className="w-8 h-8" />
                    </span>
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                        Message Received!
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm max-w-sm leading-relaxed">
                        Thank you for reaching out. Our solution architects will review your project
                        needs and respond within 24 hours.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubmitState('idle')}
                      className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : localLockout ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
                    <span className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner text-amber-600">
                      <AlertCircle className="w-8 h-8 animate-pulse" />
                    </span>
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                        Submission Locked (24h)
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm max-w-sm leading-relaxed">
                        You have already submitted an inquiry in the last 24 hours. To prevent duplicate
                        tickets, our team is currently processing your active request.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-8 border-b border-slate-100 pb-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">
                        Direct Architectural Consultation
                      </span>
                      <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0D1B4B] mt-1 leading-tight">
                        Send Project Brief
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Tell us about your technical goals, requirements, or operational bottlenecks.
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      noValidate
                      aria-label="Contact form"
                      className="space-y-5"
                    >
                      {/* Honeypot */}
                      <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="absolute opacity-0 h-0 w-0 pointer-events-none"
                        {...register('_hp')}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Name */}
                        <Field
                          label="Full Name"
                          required
                          error={errors.name?.message}
                          htmlFor="name"
                        >
                          <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            placeholder="e.g. Vikramaditya Sharma"
                            className={inputClass(Boolean(errors.name))}
                            {...register('name')}
                          />
                        </Field>

                        {/* Email */}
                        <Field
                          label="Business Email"
                          required
                          error={errors.email?.message}
                          htmlFor="email"
                        >
                          <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="vikram@enterprise.com"
                            className={inputClass(Boolean(errors.email))}
                            {...register('email')}
                          />
                        </Field>

                        {/* Phone */}
                        <Field
                          label="Phone / WhatsApp Number"
                          error={errors.phone?.message}
                          htmlFor="phone"
                        >
                          <input
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            placeholder="+91 98765 43210"
                            className={inputClass(Boolean(errors.phone))}
                            {...register('phone')}
                          />
                        </Field>

                        {/* Service dropdown */}
                        <Field
                          label="Core Service Needed"
                          error={errors.serviceInterested?.message}
                          htmlFor="serviceInterested"
                        >
                          <select
                            id="serviceInterested"
                            className={`${inputClass(Boolean(errors.serviceInterested))} bg-white text-slate-900 cursor-pointer`}
                            {...register('serviceInterested')}
                          >
                            <option value="" className="text-slate-400">
                              — Select a technical domain —
                            </option>
                            {services.map((s) => (
                              <option
                                key={s.id}
                                value={s.title}
                                className="text-slate-900"
                              >
                                {s.title}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>

                      {/* Message */}
                      <Field
                        label="Project Brief / Scope"
                        required
                        error={errors.message?.message}
                        htmlFor="message"
                      >
                        <textarea
                          id="message"
                          rows={5}
                          placeholder="Outline your application goals, preferred timeline, integrations, or challenges..."
                          className={`${inputClass(Boolean(errors.message))} resize-none`}
                          {...register('message')}
                        />
                      </Field>

                      {/* API error alert */}
                      {submitState === 'error' && apiError && (
                        <div
                          className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5"
                          role="alert"
                          aria-live="assertive"
                        >
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-sm font-semibold text-red-600">{apiError}</p>
                        </div>
                      )}

                      {/* User Permission / Privacy Consent Checkbox (DPDP & GDPR Compliant) */}
                      <div className="pt-1">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            id="contact-consent"
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/30 cursor-pointer"
                            {...register('consent')}
                          />
                          <span className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                            I consent to SnapTech Digital collecting and processing my contact details in accordance with the{' '}
                            <Link
                              to="/privacy-policy"
                              target="_blank"
                              className="text-brand-blue font-semibold hover:underline"
                            >
                              Privacy Policy
                            </Link>{' '}
                            to respond to my project inquiry.
                          </span>
                        </label>
                        {errors.consent && (
                          <p className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.consent.message}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submitState === 'loading'}
                          className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg hover:shadow-brand-blue/20 active:scale-[0.99] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {submitState === 'loading' ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Transmitting Brief…
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" /> Send Project Brief
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-slate-500 text-center mt-3 font-medium">
                          Strict NDA protection guaranteed. Your intellectual property and data remain 100% confidential.
                        </p>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ── FAQ Accordion Section ── */}
      <section className="py-20 bg-slate-50/70 border-t border-slate-200/80">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold tracking-wider uppercase text-brand-blue mb-2 block">
                Common Inquiries
              </span>
              <h2 className="font-heading text-3xl font-extrabold text-slate-900 mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Clear answers regarding project discovery, timelines, pricing models, and ongoing SLA maintenance.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx
                const question = faq.question ?? faq.q
                const answer = faq.answer ?? faq.a
                return (
                  <div
                    key={faq.id ?? idx}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-300 hover:border-brand-blue/40"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-heading font-bold text-slate-900 hover:text-brand-blue transition-colors duration-200 cursor-pointer group"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base leading-snug">{question}</span>
                      <span
                        className={`p-1.5 rounded-full bg-slate-100 text-slate-500 group-hover:text-brand-blue transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-brand-blue bg-blue-50' : ''
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </button>

                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen
                          ? 'max-h-60 opacity-100 border-t border-slate-100'
                          : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="p-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {answer}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}

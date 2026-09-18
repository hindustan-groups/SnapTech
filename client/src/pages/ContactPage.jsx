import { useState, useEffect, useCallback } from 'react'
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
} from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
import { useServices } from '@/hooks/useServices'
import { useFaqs, useSiteSettings } from '@/hooks/useContent'
import { api } from '@/utils/api'
import { faqSchema, breadcrumbSchema } from '@/components/ui/SEO'
import { fadeUp, staggerContainer } from '@/utils/motion'
import contactHeroPerson from '@/assets/contact_hero_person.webp'

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
  _hp: z.string().optional(), // honeypot
})

// ── Form Field Wrapper ─────────────────────────────────────────
function Field({ label, required, error, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="text-xs font-bold text-brand-blue uppercase tracking-wider flex justify-between items-center"
      >
        <span>
          {label}
          {required && <span className="text-brand-red ml-0.5">*</span>}
        </span>
      </label>
      {children}
      {error && (
        <p
          className="text-xs text-brand-red flex items-center gap-1 font-semibold mt-0.5"
          role="alert"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

// ── Custom Input Class helper ─────────────────────────────────
const inputClass = (hasError) =>
  [
    'w-full px-4 py-3 text-sm text-brand-blue rounded-xl border bg-slate-50/50',
    'placeholder:text-slate-400 font-medium',
    'focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue focus:bg-white',
    'transition-all duration-200',
    hasError
      ? 'border-brand-red focus:ring-brand-red/10 focus:border-brand-red bg-red-50/10'
      : 'border-slate-200 hover:border-slate-300 focus:border-brand-blue',
  ].join(' ')

// ── Contact Info Cards ─────────────────────────────────────────
function ContactInfoCard({ icon: Icon, label, value, href, borderColor }) {
  const inner = (
    <div className="flex items-start gap-4">
      <span className="w-11 h-11 rounded-xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
        <Icon
          className="w-5 h-5 text-brand-blue group-hover:text-white transition-colors duration-300"
          strokeWidth={1.5}
        />
      </span>
      <div className="space-y-0.5">
        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{label}</p>
        <p className="text-sm text-brand-blue font-bold group-hover:text-brand-red transition-colors duration-200">
          {value}
        </p>
      </div>
    </div>
  )

  const baseClass = `group p-5 rounded-2xl border bg-white shadow-sm hover:shadow-[0_12px_30px_rgba(26,62,140,0.06)] hover:-translate-y-0.5 transition-all duration-300 border-l-4 ${borderColor || 'border-l-brand-blue border-gray-100 hover:border-brand-blue/30'}`

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

  return <div className={baseClass.replace('hover:border-brand-blue/30', '')}>{inner}</div>
}

// ── FAQ Fallback (when DB empty) ───────────────────────────────
const FAQ_FALLBACK = [
  {
    id: '1',
    question: 'What services does Hindustan Projects offer?',
    answer:
      'We provide custom Web Development, Mobile App Development, Digital Marketing, Brand Identity Design, and custom ERP/Software Solutions.',
  },
  {
    id: '2',
    question: 'Where is your office?',
    answer:
      'Our office is in Bhilwara, Rajasthan, India (311001). We also work remotely with clients across India.',
  },
  {
    id: '3',
    question: 'How long to start a new project?',
    answer:
      'We typically onboard and kick off new projects within 3–5 business days after requirement discovery.',
  },
  {
    id: '4',
    question: 'Do you offer post-launch support?',
    answer:
      'Yes! Every project includes a standard support window. We also offer monthly maintenance contracts.',
  },
  {
    id: '5',
    question: 'How is pricing calculated?',
    answer:
      'Pricing is based on project scope, features, and complexity. We provide clear itemized quotes with no hidden fees.',
  },
]

// ── Main Page Component ────────────────────────────────────────
export default function ContactPage() {
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
  const phone = cfg.phone || '+91 99999 99999'
  const email = cfg.email || 'info@hindustanprojects.com'
  const address = cfg.address || 'Bhilwara, Rajasthan 311001, India'
  const whatsapp = cfg.whatsapp || cfg.phone || '919999999999'
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

  const onSubmit = useCallback(async (data) => {
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
    } catch (err) {
      setSubmitState('error')
      setApiError(err.message || 'Something went wrong. Please try again.')
    }
  }, [reset])

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx)
  }

  return (
    <>
      <SEO
        title="Contact Snaptech — IT Solutions & Consultation | Hindustan Projects"
        description="Contact Snaptech, the IT and software engineering division of Hindustan Projects Group. Schedule an enterprise consultation for web development, mobile apps, or cloud systems."
        path="/contact"
        keywords="contact Snaptech, IT consultation Bhilwara, Hindustan Projects IT, hire software developers India, custom web development quote"
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
      <section className="pt-24 sm:pt-32 lg:pt-36 pb-14 sm:pb-20 lg:pb-24 bg-[#020714] border-b border-white/5 relative overflow-hidden">
        {/* Mesh Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

        {/* Tech Electric Blue Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left text column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-brand-cyan bg-brand-primary/20 border border-brand-primary/30 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                A HINDUSTAN PROJECTS VENTURE
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                Let&apos;s Engineer Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary-light via-brand-cyan to-white">
                  Digital Future
                </span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                Looking for enterprise web apps, mobile engineering, cloud infrastructure, or AI automation? 
                Connect directly with Snaptech's software architects. We respond within 2 hours.
              </p>

              {/* Advanced Trust Blocks */}
              <div className="grid grid-cols-2 gap-4 pt-2 max-w-md">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
                  <p className="text-2xl font-black text-emerald-400">99.4%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Client Satisfaction
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
                  <p className="text-2xl font-black text-blue-400">&lt; 24h</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Response Guarantee
                  </p>
                </div>
              </div>
            </div>

            {/* Right graphic/portrait column (Advanced 2026 Style) */}
            <div className="hidden lg:flex lg:col-span-5 justify-center lg:justify-end relative h-[440px]">
              {/* Main Futuristic Glass Panel */}
              <div className="absolute bottom-4 left-4 right-4 lg:left-12 lg:right-0 top-12 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-lg shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 animate-pulse" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-[80px]" />
              </div>

              {/* Interactive 3D floating circles */}
              <div
                className="absolute top-4 right-1/2 translate-x-1/2 lg:right-24 w-[280px] h-[280px] rounded-full border border-dashed border-cyan-400/20 animate-spin"
                style={{ animationDuration: '30s' }}
              />
              <div
                className="absolute top-12 right-1/2 translate-x-1/2 lg:right-28 w-[230px] h-[230px] rounded-full border border-dotted border-blue-500/20 animate-spin"
                style={{ animationDuration: '45s', animationDirection: 'reverse' }}
              />

              {/* High-Tech blended specialist cutout */}
              <div className="relative h-full w-full max-w-[340px] flex items-end justify-center z-10">
                <img
                  src={contactHeroPerson}
                  alt="Customer Success Specialist"
                  className="h-[380px] sm:h-[430px] object-contain bottom-0 filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] mix-blend-screen hover:scale-[1.02] transition-transform duration-300 ease-out select-none"
                />

                {/* Overlapping Glass chat widget */}
                <div
                  className="absolute top-1/3 -left-6 z-20 bg-slate-900/80 border border-white/10 p-3 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.4)] backdrop-blur-md flex items-center gap-3 animate-bounce"
                  style={{ animationDuration: '4s' }}
                >
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <MessageCircle className="w-4 h-4" />
                  </span>
                  <div className="text-left">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      ONLINE NOW
                    </p>
                    <p className="text-xs font-bold text-white">How can we help?</p>
                  </div>
                </div>

                {/* Overlapping Glass status indicator */}
                <div className="absolute bottom-12 -right-6 z-20 bg-slate-900/80 border border-white/10 p-3 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.4)] backdrop-blur-md flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div className="text-left">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      PRIORITY CONNECT
                    </p>
                    <p className="text-xs font-bold text-white">Bhilwara, RJ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Main Content Grid ── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-50/30">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* ── Left Column: Contact Cards + WhatsApp + Map ── */}
            <motion.aside
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-2 flex flex-col gap-6"
            >
              <motion.div variants={fadeUp}>
                <span className="text-xs font-bold text-brand-red uppercase tracking-wider block mb-1">
                  Connect Directly
                </span>
                <h2 className="font-heading text-2xl font-bold text-brand-blue">
                  Our Office details
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  Reach out through any channel that&apos;s convenient for you.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col gap-4">
                <ContactInfoCard
                  icon={MapPin}
                  label="Office Address"
                  value={address}
                  borderColor="border-l-blue-500"
                />
                <ContactInfoCard
                  icon={Phone}
                  label="Phone Number"
                  value={phone}
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  borderColor="border-l-amber-500"
                />
                <ContactInfoCard
                  icon={Mail}
                  label="Email Address"
                  value={email}
                  href={`mailto:${email}`}
                  borderColor="border-l-pink-500"
                />
              </motion.div>

              {/* Pulsing WhatsApp CTA */}
              <motion.div variants={fadeUp}>
                <a
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(cfg.whatsappMessage || "Hi! I'd like to discuss a project.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-3 px-6 py-4 rounded-2xl border border-[#25D366]/40
                    text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54]
                    transition-all duration-300 font-bold text-sm w-full justify-center 
                    shadow-[0_8px_20px_rgba(37,211,102,0.15)] hover:shadow-[0_12px_25px_rgba(37,211,102,0.3)]
                    hover:-translate-y-0.5 cursor-pointer overflow-hidden"
                  aria-label="Chat with us on WhatsApp"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  <MessageCircle className="w-5 h-5 shrink-0 animate-bounce" />
                  Chat on WhatsApp
                </a>
              </motion.div>

              {/* Grayscale Map Container */}
              <motion.div
                variants={fadeUp}
                className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-md hover:shadow-lg transition-all duration-300 bg-white p-1.5"
              >
                <div className="rounded-xl overflow-hidden h-56 relative group">
                  <iframe
                    title="Hindustan Projects Office Location — Bhilwara, Rajasthan"
                    src={
                      (() => {
                        const raw = cfg.googleMapUrl;
                        if (!raw) return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57692.35!2d74.6!3d25.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3968a5!2sBhilwara%2C+Rajasthan!5e0!3m2!1sen!2sin!4v1';
                        if (raw.includes('src="')) {
                          const match = raw.match(/src="([^"]+)"/);
                          return match && match[1] ? match[1] : raw;
                        }
                        return raw;
                      })()
                    }
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale hover:grayscale-0 transition-all duration-500 ease-out"
                  />
                </div>
              </motion.div>
            </motion.aside>

            {/* ── Right Column: Translucent Contact Form ── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div
                className="bg-white rounded-3xl border border-slate-100
                shadow-[0_20px_50px_rgba(26,62,140,0.06)] p-8 sm:p-10 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />

                {/* Success state */}
                {submitState === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
                    <span className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center shadow-inner">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </span>
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-brand-blue mb-2">
                        Message Received!
                      </h3>
                      <p className="text-text-muted text-sm max-w-sm">
                        Thank you for reaching out. We&apos;ll review your requirements and get back
                        to you within 24 hours.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSubmitState('idle')}>
                      Send Another Message
                    </Button>
                  </div>
                ) : localLockout ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
                    <span className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center shadow-inner">
                      <AlertCircle className="w-8 h-8 text-amber-500 animate-pulse" />
                    </span>
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-brand-blue mb-2">
                        Submission Locked
                      </h3>
                      <p className="text-text-muted text-sm max-w-sm leading-relaxed">
                        You have already submitted an inquiry in the last 24 hours. To prevent spam
                        and duplicate records, please wait before sending another message.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="font-heading text-2xl font-bold text-brand-blue mb-1 leading-tight">
                        Send Us a Message
                      </h2>
                      <p className="text-sm text-text-muted mt-1">
                        Fill out the details below and our team will get back to you shortly.
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      noValidate
                      aria-label="Contact form"
                      className="space-y-5"
                    >
                      {/* Honeypot — hidden from real users, bots fill it */}
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
                            placeholder="Ramesh Sharma"
                            className={inputClass(!!errors.name)}
                            {...register('name')}
                          />
                        </Field>

                        {/* Email */}
                        <Field
                          label="Email Address"
                          required
                          error={errors.email?.message}
                          htmlFor="email"
                        >
                          <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="ramesh@company.com"
                            className={inputClass(!!errors.email)}
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
                            className={inputClass(!!errors.phone)}
                            {...register('phone')}
                          />
                        </Field>

                        {/* Service dropdown */}
                        <Field
                          label="Service Needed"
                          error={errors.serviceInterested?.message}
                          htmlFor="serviceInterested"
                        >
                          <select
                            id="serviceInterested"
                            className={inputClass(!!errors.serviceInterested)}
                            {...register('serviceInterested')}
                          >
                            <option value="">— Select a service —</option>
                            {services.map((s) => (
                              <option key={s.id} value={s.title}>
                                {s.title}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>

                      {/* Message */}
                      <Field
                        label="Your Message"
                        required
                        error={errors.message?.message}
                        htmlFor="message"
                      >
                        <textarea
                          id="message"
                          rows={5}
                          placeholder="Tell us about your project goals, timelines, or ask any questions..."
                          className={`${inputClass(!!errors.message)} resize-none`}
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
                          <AlertCircle className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                          <p className="text-sm font-semibold text-brand-red">{apiError}</p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <div className="pt-2">
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          fullWidth
                          loading={submitState === 'loading'}
                          rightIcon={<Send className="w-4 h-4" />}
                          className="rounded-xl shadow-lg shadow-brand-blue/15 hover:shadow-brand-blue/25 hover:scale-[1.01] transition-all duration-200 py-3.5 font-bold"
                        >
                          {submitState === 'loading' ? 'Sending Message…' : 'Send Message'}
                        </Button>
                        <p className="text-[10px] text-text-muted text-center mt-3 font-medium">
                          By submitting, you agree to our privacy policy. We strictly respect your
                          privacy.
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
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold tracking-widest uppercase text-brand-red mb-3 block">
                Got Questions?
              </span>
              <h2 className="font-heading text-3xl font-bold text-brand-blue mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-text-muted text-sm max-w-md mx-auto">
                Quick answers to common questions about working with Hindustan Projects.
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
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-heading font-bold text-brand-blue hover:text-brand-red transition-colors duration-200 cursor-pointer group"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base leading-snug">{question}</span>
                      <span
                        className={`p-1 rounded-full bg-slate-50 text-slate-400 group-hover:bg-brand-blue/5 transition-transform duration-350 ${isOpen ? 'rotate-180 text-brand-blue' : ''}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </button>

                    <div
                      className={`transition-all duration-350 ease-in-out overflow-hidden ${
                        isOpen
                          ? 'max-h-60 opacity-100 border-t border-slate-50'
                          : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="p-5 text-sm text-text-muted leading-relaxed">{answer}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

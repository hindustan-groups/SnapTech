import { useState } from 'react'
import { Phone, Mail } from 'lucide-react'
import HeroSection from '@/components/sections/HeroSection'
import ParentGroupSection from '@/components/sections/ParentGroupSection'
import ServicesSection from '@/components/sections/ServicesSection'
import ShowcaseSection from '@/components/sections/ShowcaseSection'
import ProcessSection from '@/components/sections/ProcessSection'
import WhyUsSection from '@/components/sections/WhyUsSection'
import StatsSection from '@/components/sections/StatsSection'
import TechStackSection from '@/components/sections/TechStackSection'
import FeaturedProjects from '@/components/sections/FeaturedProjects'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import TeamSection from '@/components/sections/TeamSection'
import FaqSection from '@/components/sections/FaqSection'
import { Container, SEO } from '@/components/ui'
import { organizationSchema, localBusinessSchema } from '@/components/ui/SEO'
import { useSiteSettings } from '@/hooks/useContent'
import { api } from '@/utils/api'
import { trackEvent } from '@/utils/analytics'

/**
 * HomePage — assembles all homepage sections.
 */
export default function HomePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [service, setService] = useState('Web Development')
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}
  const phone = cfg.phone || ''
  const contactEmail = cfg.email || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email) return
    setSubmitting(true)
    setSubmitError(false)
    try {
      // Get reCAPTCHA v3 token if available, otherwise skip (honeypot _hp field handles spam)
      let recaptchaToken = null
      if (window.grecaptcha) {
        const siteKey = document.querySelector('meta[name="recaptcha-site-key"]')?.content
        if (siteKey) {
          recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'homepage_quote' })
        }
      }
      await api.post('/contact', {
        name,
        email,
        phone: clientPhone,
        serviceInterested: service,
        message: `Quick quote request from homepage for: ${service}${clientPhone ? ` (Phone/WhatsApp: ${clientPhone})` : ''}`,
        recaptchaToken,
        _hp: '',
      })
      trackEvent('generate_lead', {
        form: 'homepage_quote',
        service,
      })
      setSubmitted(true)
    } catch {
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SEO
        title="SnapTech Digital — Web & App Development Agency | Bhilwara, Rajasthan"
        description="SnapTech Digital builds enterprise websites, web apps, and mobile apps. Full-service digital agency based in Bhilwara, Rajasthan. Get a free project consultation."
        path="/"
        schemas={[organizationSchema(), localBusinessSchema()]}
        keywords="SnapTech Digital, IT company Bhilwara, web development Rajasthan, mobile app development India, web design agency, digital marketing Bhilwara, software company Rajasthan"
      />
      <HeroSection />

      {/* ── Official Parent Group Ecosystem Section ── */}
      <ParentGroupSection />

      <ServicesSection />
      <ShowcaseSection />
      <ProcessSection />
      <WhyUsSection />
      <StatsSection />
      <TechStackSection />
      <FeaturedProjects />
      <TestimonialsSection />
      <TeamSection />
      <FaqSection />

      {/* Contact CTA Banner */}
      <section
        id="contact"
        className="py-20 sm:py-24 relative overflow-hidden bg-slate-50 border-t border-slate-200/80"
        aria-labelledby="homepage-contact-heading"
      >
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/40 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-100/30 blur-[140px] rounded-full pointer-events-none" />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: text */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-brand-blue text-xs font-bold uppercase tracking-wider w-fit shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                {cfg.contact_badge || (cfg.address ? `Consultation Desk • ${cfg.address.split(',')[0]} Tech Center` : 'Consultation Desk • Solution Architecture')}
              </div>

              <h2 id="homepage-contact-heading" className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0D1B4B] leading-tight">
                Ready to Build Your{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
                  Mission-Critical Software?
                </span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg font-normal">
                Consult directly with our senior software architects. We analyze your requirements, formulate architectural blueprints, and deliver high-availability platforms with 100% IP ownership under strict mutual NDA.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-lg">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-2xs">
                  <span className="text-brand-blue font-black">✓</span> Rapid 2-Hour Response SLA
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-2xs">
                  <span className="text-brand-blue font-black">✓</span> 100% Code &amp; IP Ownership
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-2xs">
                  <span className="text-brand-blue font-black">✓</span> Bi-Weekly Milestone Sprints
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-2xs">
                  <span className="text-brand-blue font-black">✓</span> Strict Mutual NDA Protection
                </div>
              </div>
            </div>

            {/* Right: Contact Card */}
            <div className="lg:col-span-6 max-w-md lg:ml-auto w-full">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden group hover:border-brand-blue/40 transition-all">
                {/* Top brand gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-brand-blue via-blue-600 to-indigo-600" />

                <div className="space-y-4">
                  {submitted ? (
                    <div className="text-center py-6 space-y-3" role="alert" aria-live="polite">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 font-bold text-xl">
                        ✓
                      </div>
                      <h3 className="font-heading text-lg font-bold text-slate-800">
                        Inquiry Received!
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Thank you. Our senior technical advisors will review your project brief and connect with you within 2 hours.
                      </p>
                    </div>
                  ) : submitError ? (
                    <div className="text-center py-6 space-y-3" role="alert" aria-live="assertive">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-500 font-bold text-xl">
                        ✕
                      </div>
                      <h3 className="font-heading text-base font-bold text-red-600">
                        Submission Failed
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Unable to deliver message right now. Please reach us directly via Phone or WhatsApp.
                      </p>
                      <button
                        onClick={() => setSubmitError(false)}
                        className="text-xs text-brand-blue hover:underline cursor-pointer font-bold"
                      >
                        Retry Submission
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                      <div className="text-center pb-1">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-900">
                          Request Technical Consultation
                        </h3>
                        <p className="text-[11px] text-slate-500">Zero-cost preliminary architecture blueprint</p>
                      </div>
                      <div>
                        <label htmlFor="quote-name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Full Name
                        </label>
                        <input
                          id="quote-name"
                          name="name"
                          autoComplete="name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Aditya Sharma"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="quote-email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Work Email
                          </label>
                          <input
                            id="quote-email"
                            name="email"
                            autoComplete="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="aditya@textiles.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="quote-phone" className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Phone / WhatsApp
                          </label>
                          <input
                            id="quote-phone"
                            name="phone"
                            autoComplete="tel"
                            type="tel"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="quote-service" className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Target Capability
                        </label>
                        <select
                          id="quote-service"
                          name="service"
                          value={service}
                          onChange={(e) => setService(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-blue transition-all cursor-pointer"
                        >
                          <option value="Web Development">Full-Stack Web &amp; Portal Development</option>
                          <option value="App Development">Mobile App Development (iOS &amp; Android)</option>
                          <option value="Enterprise ERP">Custom Enterprise ERP &amp; SaaS Systems</option>
                          <option value="Digital Marketing">Digital Performance Marketing &amp; SEO</option>
                          <option value="E-Commerce Solutions">High-Volume E-Commerce Engines</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full mt-2 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm bg-brand-blue hover:bg-brand-blue-dark transition-all shadow-md hover:shadow-lg hover:shadow-brand-blue/20 active:scale-[0.99] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting…' : 'Submit Consultation Request'}
                      </button>
                    </form>
                  )}

                  <div className="border-t border-slate-100 my-4" />

                  {(phone || contactEmail) && (
                    <div className="space-y-2.5">
                      {phone && (
                        <a
                          href={`tel:${phone.replace(/\s+/g, '')}`}
                          className="text-slate-600 hover:text-brand-blue text-xs sm:text-sm flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50/50 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0 group-hover:bg-brand-blue group-hover:border-brand-blue transition-all duration-200">
                            <Phone className="w-3.5 h-3.5 text-brand-blue group-hover:text-white transition-colors" />
                          </div>
                          <span className="font-semibold text-slate-800 group-hover:text-brand-blue transition-colors">{phone}</span>
                          <span className="ml-auto text-[10px] text-slate-500 uppercase tracking-wider font-medium">Direct Line</span>
                        </a>
                      )}
                      {contactEmail && (
                        <a
                          href={`mailto:${contactEmail}`}
                          className="text-slate-600 hover:text-brand-blue text-xs sm:text-sm flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50/50 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0 group-hover:bg-brand-blue group-hover:border-brand-blue transition-all duration-200">
                            <Mail className="w-3.5 h-3.5 text-brand-blue group-hover:text-white transition-colors" />
                          </div>
                          <span className="font-semibold text-slate-800 group-hover:text-brand-blue transition-colors">{contactEmail}</span>
                          <span className="ml-auto text-[10px] text-slate-500 uppercase tracking-wider font-medium">Email Desk</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

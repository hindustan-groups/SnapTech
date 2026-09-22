import { useState } from 'react'
import { Phone, Mail } from 'lucide-react'
import HeroSection from '@/components/sections/HeroSection'
import PartnerTrustMarquee from '@/components/sections/PartnerTrustMarquee'
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

/**
 * HomePage — assembles all homepage sections.
 */
export default function HomePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [service, setService] = useState('Web Development')
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}
  const phone = cfg.phone || '+91 99999 99999'
  const contactEmail = cfg.email || 'info@snaptech.digital'

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
        serviceInterested: service,
        message: `Quick quote request from homepage for: ${service}`,
        recaptchaToken,
        _hp: '',
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
        title="Snaptech — IT & Technology Solutions | Hindustan Projects Group"
        description="Looking for IT Solutions? Search. Discover. Connect with Snaptech — the enterprise technology and digital innovation wing of Hindustan Projects Group."
        path="/"
        schemas={[organizationSchema(), localBusinessSchema()]}
        keywords="Snaptech, Hindustan Projects IT, IT company Bhilwara, web development Rajasthan, mobile app development India, cloud DevOps, AI automation, enterprise software"
      />
      <HeroSection />

      {/* ── Enterprise Trust Badges & Infinite Partner Marquee ── */}
      <PartnerTrustMarquee />

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
        className="py-24 relative overflow-hidden bg-slate-50 border-t border-slate-100"
      >
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#1a3e8c]/5 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#e31e24]/5 blur-[140px] rounded-full pointer-events-none" />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: text */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 text-[#1a3e8c] text-xs font-bold uppercase tracking-widest w-fit">
                <span className="w-2 h-2 rounded-full bg-[#1a3e8c] animate-pulse" />
                Start Your Project
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 leading-tight">
                Ready to Scale Your Business{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #1a3e8c, #e31e24)' }}>Digitally?</span>
              </h2>

              <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-lg">
                Direct technical consultation with our engineering leads. We analyze your requirements and blueprint the optimal high-availability solution — zero ambiguity, zero technical debt.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-lg">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
                  <span className="text-[#1a3e8c] font-black">✓</span> 2-Hour Response SLA Guarantee
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
                  <span className="text-[#1a3e8c] font-black">✓</span> 100% IP &amp; Code Ownership
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
                  <span className="text-[#1a3e8c] font-black">✓</span> Milestone Sprint Deliveries
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
                  <span className="text-[#1a3e8c] font-black">✓</span> Transparent Pricing Matrix
                </div>
              </div>
            </div>

            {/* Right: Contact Card */}
            <div className="lg:col-span-6 max-w-md lg:ml-auto w-full">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden group hover:border-[#1a3e8c]/30 transition-all">
                {/* Top brand gradient line */}
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #1a3e8c, #e31e24)' }} />

                <div className="space-y-4">
                  {submitted ? (
                    <div className="text-center py-6 space-y-3" role="alert" aria-live="polite">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 font-bold text-xl">
                        ✓
                      </div>
                      <h3 className="font-heading text-lg font-bold text-slate-800">
                        Inquiry Sent!
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
                        className="text-xs text-brand-cyan hover:underline cursor-pointer"
                      >
                        Retry Submission
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                      <div className="text-center pb-1">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-800">
                          Request Free Consultation
                        </h3>
                        <p className="text-[11px] text-slate-500">Zero-cost preliminary architecture assessment</p>
                      </div>
                      <div>
                        <label htmlFor="quote-name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Full Name
                        </label>
                        <input
                          id="quote-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Aditya Sharma"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1a3e8c]/60 focus:ring-1 focus:ring-[#1a3e8c]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="quote-email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Work Email
                        </label>
                        <input
                          id="quote-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. aditya@textiles.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1a3e8c]/60 focus:ring-1 focus:ring-[#1a3e8c]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="quote-service" className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Target Capability
                        </label>
                        <select
                          id="quote-service"
                          value={service}
                          onChange={(e) => setService(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1a3e8c]/60 transition-all cursor-pointer"
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
                        className="w-full mt-2 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{ background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #1a3e8c, #e31e24)' }}
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting…' : 'Submit Consultation Request'}
                      </button>
                    </form>
                  )}

                  <div className="border-t border-slate-100 my-4" />

                  <div className="space-y-2.5">
                    <a
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="text-slate-600 hover:text-[#1a3e8c] text-xs sm:text-sm flex items-center gap-3 p-2 rounded-xl hover:bg-[#1a3e8c]/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 flex items-center justify-center shrink-0 group-hover:bg-[#1a3e8c] group-hover:border-[#1a3e8c] transition-all duration-200">
                        <Phone className="w-3.5 h-3.5 text-[#1a3e8c] group-hover:text-white transition-colors" />
                      </div>
                      <span className="font-semibold">{phone}</span>
                      <span className="ml-auto text-[10px] text-slate-400 uppercase tracking-wider">Direct Line</span>
                    </a>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-slate-600 hover:text-[#e31e24] text-xs sm:text-sm flex items-center gap-3 p-2 rounded-xl hover:bg-[#e31e24]/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#e31e24]/10 border border-[#e31e24]/20 flex items-center justify-center shrink-0 group-hover:bg-[#e31e24] group-hover:border-[#e31e24] transition-all duration-200">
                        <Mail className="w-3.5 h-3.5 text-[#e31e24] group-hover:text-white transition-colors" />
                      </div>
                      <span className="font-semibold">{contactEmail}</span>
                      <span className="ml-auto text-[10px] text-slate-400 uppercase tracking-wider">Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

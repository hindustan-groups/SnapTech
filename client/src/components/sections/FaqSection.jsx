/**
 * FaqSection — Smooth CSS accordion with dynamic site settings & clean corporate theme
 */
import { useState, useMemo } from 'react'
import { Container } from '@/components/ui'
import { ChevronDown, HelpCircle, MessageCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFaqs, useSiteSettings } from '@/hooks/useContent'

const FALLBACK_FAQS = [
  {
    id: '1',
    question: 'How long does it take to build a website or enterprise portal?',
    answer: 'For a standard corporate website, 2–4 weeks. High-throughput custom SaaS portals or e-commerce suites take 4–8 weeks. We provide clear milestone-based sprint roadmaps at project inception with live preview deployments.',
  },
  {
    id: '2',
    question: 'Do you provide SLA-backed support after deployment?',
    answer: 'Yes. Every project includes 30 days of comprehensive post-launch warranty and hypercare. Following rollout, we offer enterprise SLA maintenance covering zero-day security patches, uptime monitoring, and quarterly performance audits.',
  },
  {
    id: '3',
    question: 'Will our application achieve high performance and Google Core Web Vitals pass?',
    answer: 'Without exception. Every interface is precision-engineered for sub-second LCP (Largest Contentful Paint), semantic SEO structure, and schema markup, ensuring optimal Google indexation and responsive rendering across all device viewports.',
  },
  {
    id: '4',
    question: 'What are your commercial terms and payment milestones?',
    answer: 'We operate on transparent milestone deliverables: 30% initial sprint deposit, 40% upon architecture approval and staging demo, and 30% upon production deployment and IP handover. Zero hidden costs or vendor lock-in.',
  },
  {
    id: '5',
    question: 'Do we own 100% of the intellectual property (IP) and source code?',
    answer: 'Yes. Upon final settlement, all intellectual property rights, repository repositories, Docker manifests, and server environments belong completely to your organization.',
  },
  {
    id: '6',
    question: 'Do you work with clients across India and internationally?',
    answer: 'Absolutely. While headquartered in Bhilwara, Rajasthan, we engineer digital solutions for businesses across India, the Middle East, and worldwide via streamlined remote workflows — with dedicated project managers and real-time communication.',
  },
]

function FaqItem({ question, answer, isOpen, onToggle, index }) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen
          ? 'border-[#1a3e8c]/30 bg-white shadow-md'
          : 'border-slate-200 bg-white hover:border-[#1a3e8c]/20 hover:shadow-sm'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left group cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="flex items-start gap-3.5">
          <span
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-all duration-300 ${
              isOpen
                ? 'bg-[#1a3e8c] text-white shadow-sm'
                : 'bg-slate-100 border border-slate-200 text-slate-500 group-hover:border-[#1a3e8c]/30 group-hover:text-[#1a3e8c] group-hover:bg-[#1a3e8c]/10'
            }`}
          >
            {index + 1}
          </span>
          <span className={`font-heading text-sm sm:text-base font-semibold transition-colors duration-200 ${
            isOpen ? 'text-[#1a3e8c]' : 'text-slate-700 group-hover:text-slate-900'
          }`}>
            {question}
          </span>
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 ml-4 transition-all duration-300 ${
            isOpen ? 'rotate-180 text-[#1a3e8c]' : 'text-slate-400 group-hover:text-slate-600'
          }`}
        />
      </button>

      {/* CSS animated accordion body */}
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 ml-10">
          {answer}
        </div>
      </div>
    </div>
  )
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: faqsData, isLoading } = useFaqs()
  const { data: settingsData } = useSiteSettings()

  const settings = settingsData?.data || {}
  const allFaqs = useMemo(
    () => Array.isArray(faqsData?.data) ? faqsData.data : [],
    [faqsData]
  )

  const faqs = useMemo(() => {
    if (!searchQuery.trim()) return allFaqs
    const q = searchQuery.toLowerCase()
    return allFaqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer?.toLowerCase().includes(q)
    )
  }, [allFaqs, searchQuery])

  const rawWhatsapp = settings.whatsapp || '+91 75970 00601'
  const cleanWhatsapp = rawWhatsapp.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    settings.whatsappMessage || 'Hi SnapTech Team, I have a question regarding an enterprise IT project.'
  )}`

  return (
    <section id="faq" className="py-24 bg-white border-t border-slate-100 relative overflow-hidden" aria-labelledby="faq-heading">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#1a3e8c]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#e31e24]/5 rounded-full blur-[120px] pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Left: sticky heading panel */}
          <div className="lg:col-span-5">
            <div className="reveal sticky top-28 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 text-[#1a3e8c] text-xs font-bold uppercase tracking-widest">
                <HelpCircle className="w-3.5 h-3.5" />
                Technical Clarity & FAQ
              </div>

              <h2 id="faq-heading" className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-800 leading-tight">
                Frequently Asked{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #1B6EF3, #0D1B4B)' }}>
                  Questions
                </span>
              </h2>

              <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-sm">
                Transparent answers about our engineering timelines, pricing structures, intellectual property, and enterprise delivery guarantees.
              </p>

              {/* Quick contact links */}
              <div className="space-y-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-semibold hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-sm group"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>WhatsApp Priority Desk</span>
                  <span className="ml-auto text-[10px] text-emerald-600 font-normal uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </a>
                <Link
                  to="/contact"
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-[#1a3e8c]/5 hover:border-[#1a3e8c]/30 hover:text-[#1a3e8c] transition-all group"
                >
                  <MessageCircle className="w-4 h-4 text-[#1a3e8c]" />
                  <span>Request Custom Consultation</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-[#1a3e8c] group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right: search + accordion list */}
          <div className="lg:col-span-7">
            {/* Search input */}
            <div className="relative mb-5">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${allFaqs.length} questions...`}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-xs"
                aria-label="Search FAQs"
              />
              <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="reveal space-y-3.5">
              {faqs.length === 0 && !isLoading ? (
                <div className="text-center py-10 p-6 rounded-2xl border border-slate-200 bg-white">
                  <p className="text-sm font-bold text-slate-800 mb-1">No FAQs found</p>
                  <p className="text-slate-500 text-xs">
                    Questions and answers published from the Admin Panel will appear here.
                  </p>
                </div>
              ) : isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 border border-slate-200 rounded-2xl shimmer" />
                ))
              ) : (
                faqs.map((faq, idx) => (
                  <FaqItem
                    key={faq.id}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openIndex === idx}
                    onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                    index={idx}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

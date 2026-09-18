/**
 * FaqSection — Smooth CSS accordion, no Framer Motion dependency
 */
import { useState } from 'react'
import { Container } from '@/components/ui'
import { ChevronDown, HelpCircle, MessageCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFaqs } from '@/hooks/useContent'

const FALLBACK_FAQS = [
  {
    id: '1',
    question: 'How long does it take to build a website?',
    answer: 'For a standard corporate website, 3–4 weeks. Complex e-commerce or custom portals take 6–8 weeks. We provide clear phase-wise timelines at project start so you always know what\'s happening.',
  },
  {
    id: '2',
    question: 'Do you provide support after launch?',
    answer: 'Yes. Every project includes 30 days of complimentary post-launch support. After that, we offer flexible annual maintenance plans covering security patches, CMS updates, and quarterly SEO audits.',
  },
  {
    id: '3',
    question: 'Will my website be mobile-friendly and SEO optimized?',
    answer: 'Absolutely. Every layout is fully responsive across mobile, tablet, and desktop. We implement on-page SEO best practices from day one — semantic HTML, structured data, Core Web Vitals optimization, and meta tags.',
  },
  {
    id: '4',
    question: 'What are your payment terms?',
    answer: '30% deposit to start, 40% on design approval, 30% on final delivery. We also offer monthly retainer models for ongoing work. All pricing is transparent — no hidden fees.',
  },
  {
    id: '5',
    question: 'Can I manage my website content myself?',
    answer: 'Yes. We build custom CMS panels or integrate WordPress/Sanity so you can update content, add blog posts, manage services, and more — no developer needed.',
  },
  {
    id: '6',
    question: 'Do you work with clients outside Bhilwara / Rajasthan?',
    answer: 'Absolutely. While we are headquartered in Bhilwara, we work with clients across India and globally. All project management is handled remotely through calls, email, and our project management portal.',
  },
]

function FaqItem({ question, answer, isOpen, onToggle, index }) {
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-300 ${
        isOpen
          ? 'border-brand-primary/30 bg-brand-ice/40 shadow-[0_4px_20px_rgba(0,102,255,0.08)]'
          : 'border-slate-200 bg-white hover:border-brand-primary/20 hover:shadow-sm'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className="flex items-start gap-3">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 transition-colors ${
              isOpen ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary'
            }`}
          >
            {index + 1}
          </span>
          <span className={`font-heading text-sm sm:text-base font-semibold transition-colors ${
            isOpen ? 'text-brand-primary' : 'text-slate-800 group-hover:text-brand-primary'
          }`}>
            {question}
          </span>
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 ml-4 transition-all duration-300 ${
            isOpen ? 'rotate-180 text-brand-primary' : 'text-slate-400 group-hover:text-brand-primary'
          }`}
        />
      </button>

      {/* CSS animated accordion body */}
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 ml-9">
          {answer}
        </div>
      </div>
    </div>
  )
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)
  const { data, isLoading } = useFaqs()
  const faqs = data?.data?.length ? data.data : isLoading ? [] : FALLBACK_FAQS

  return (
    <section className="py-24 bg-gradient-to-b from-white to-brand-ice/30 border-t border-gray-100" aria-labelledby="faq-heading">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Left: sticky heading panel */}
          <div className="lg:col-span-5">
            <div className="reveal sticky top-28 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/8 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest">
                <HelpCircle className="w-3.5 h-3.5" />
                Got Questions?
              </div>

              <h2 id="faq-heading" className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Frequently Asked{' '}
                <span className="text-gradient-blue">Questions</span>
              </h2>

              <p className="text-slate-500 text-base leading-relaxed max-w-sm">
                Can&apos;t find the answer you&apos;re looking for? Our team is happy to help —
                reach out via chat, email, or call.
              </p>

              {/* Quick contact links */}
              <div className="space-y-3 pt-2">
                <a
                  href="https://wa.me/917597000601?text=Hi%20Snaptech%2C%20I%20have%20a%20question."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>WhatsApp — Quick Reply</span>
                </a>
                <Link
                  to="/contact"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-ice border border-brand-primary/20 text-brand-primary text-sm font-semibold hover:bg-brand-primary/10 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Us a Message</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right: accordion list */}
          <div className="lg:col-span-7">
            <div className="reveal space-y-3">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 bg-slate-100 rounded-xl shimmer" />
                  ))
                : faqs.map((faq, idx) => (
                    <FaqItem
                      key={faq.id}
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openIndex === idx}
                      onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                      index={idx}
                    />
                  ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

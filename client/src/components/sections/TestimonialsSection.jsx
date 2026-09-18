/**
 * TestimonialsSection — Glassmorphic review cards with auto-slide carousel
 */
import { useState, useEffect } from 'react'
import { Container } from '@/components/ui'
import { Star, ChevronLeft, ChevronRight, Quote, MessageSquare } from 'lucide-react'
import { useTestimonials } from '@/hooks/useTestimonials'

const PLACEHOLDER = [
  {
    id: '1',
    name: 'Aditya Sharma',
    role: 'Managing Director',
    company: 'Bhilwara Textiles Ltd.',
    text: 'Hindustan Projects completely modernized our operations with their custom ERP and corporate portal. Their local availability combined with world-class engineering standard was exactly what we needed.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Meera Johar',
    role: 'Founder & CEO',
    company: 'Jaipur Crafts E-Store',
    text: 'Dilshan and his team built our custom e-commerce platform and optimized our checkout flow. Within 3 months of launch, our conversion rates jumped by 42%.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Rajesh Singhal',
    role: 'Owner',
    company: 'Singhal Marbles & Granites',
    text: 'We tried multiple marketing agencies but got zero leads. Hindustan Projects designed a targeted SEO and Google Ads strategy. Today we get 15+ high-quality inquiries every week.',
    rating: 5,
  },
]

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

const AVATAR_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
]

export default function TestimonialsSection() {
  const { data, isLoading } = useTestimonials()
  const testimonials = data?.data?.length ? data.data : isLoading ? [] : PLACEHOLDER
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (testimonials.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
    }, 5500)
    return () => clearInterval(timer)
  }, [testimonials.length, currentIndex])

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  const handleNext = () => setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))

  const t = testimonials[currentIndex]

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #f0f6ff 0%, #ffffff 40%, #f8fafc 100%)' }}
      aria-labelledby="testimonials-heading"
    >
      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-brand-primary/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-cyan/6 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <Container>
        {/* Heading */}
        <div className="reveal text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/8 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            Client Success Stories
          </div>
          <h2 id="testimonials-heading" className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            What Our <span className="text-gradient-blue">Clients Say</span>
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Hear from business owners who trust us with their digital transformation and growth.
          </p>
        </div>

        {/* Slider */}
        <div className="max-w-4xl mx-auto reveal">
          {isLoading ? (
            <div className="glass-card-light rounded-3xl p-8 sm:p-12 h-72 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : t ? (
            <div className="relative">
              {/* Main glassmorphic card */}
              <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-8 sm:p-14 shadow-[0_24px_64px_rgba(0,102,255,0.08),0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500">

                {/* Big decorative quote */}
                <Quote className="absolute right-8 top-6 w-24 h-24 text-brand-primary/5 pointer-events-none" strokeWidth={1} />

                {/* Gradient top line */}
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-brand-primary via-brand-cyan to-brand-primary" />

                <div
                  key={currentIndex}
                  className="flex flex-col items-center text-center"
                  style={{ animation: 'heroFadeUp 0.45s ease forwards' }}
                >
                  {/* Stars */}
                  <div className="flex gap-1.5 mb-6">
                    {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote Text */}
                  <blockquote className="text-lg sm:text-xl md:text-2xl font-medium text-slate-700 leading-relaxed max-w-2xl italic mb-8">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>

                  {/* Client Profile */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-100 w-full max-w-sm justify-center">
                    {t.avatarUrl ? (
                      <img
                        src={t.avatarUrl}
                        alt={t.name}
                        className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-brand-primary/20 shadow-md"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${AVATAR_COLORS[currentIndex % AVATAR_COLORS.length]}
                          flex items-center justify-center font-heading text-sm font-bold text-white shrink-0 shadow-lg`}
                      >
                        {getInitials(t.name)}
                      </div>
                    )}
                    <div className="text-center sm:text-left">
                      <h3 className="font-heading text-base font-bold text-slate-800 leading-none mb-1">{t.name}</h3>
                      <p className="text-xs text-slate-500">
                        {t.role}{t.company && <span>, <span className="font-semibold text-brand-primary">{t.company}</span></span>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Chevrons */}
              {testimonials.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-6
                      w-11 h-11 rounded-full border border-slate-200 bg-white flex items-center justify-center
                      text-slate-500 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-ice
                      transition-all shadow-md cursor-pointer z-10"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-6
                      w-11 h-11 rounded-full border border-slate-200 bg-white flex items-center justify-center
                      text-slate-500 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-ice
                      transition-all shadow-md cursor-pointer z-10"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          ) : null}

          {/* Progress Dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-400 cursor-pointer ${
                    currentIndex === idx ? 'w-8 bg-brand-primary' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

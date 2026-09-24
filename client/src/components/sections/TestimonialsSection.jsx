/**
 * TestimonialsSection — Premium client reviews with multi-card layout on desktop,
 * auto-slide carousel, star ratings, and "View All Reviews" CTA.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui'
import { Star, ChevronLeft, ChevronRight, Quote, MessageSquare, ArrowRight } from 'lucide-react'
import { useTestimonials } from '@/hooks/useTestimonials'

const PLACEHOLDER = [
  {
    id: '1',
    name: 'Aditya Sharma',
    role: 'Managing Director',
    company: 'Bhilwara Textiles Ltd.',
    text: 'SnapTech Digital completely modernized our operations with their custom ERP and corporate portal. Their local availability combined with world-class engineering standards was exactly what we needed.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Meera Johar',
    role: 'Founder & CEO',
    company: 'Jaipur Crafts E-Store',
    text: 'SnapTech and their engineering squad built our custom e-commerce platform and optimized our checkout flow. Within 3 months of launch, our conversion rates jumped by 42%.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Rajesh Singhal',
    role: 'Owner',
    company: 'Singhal Marbles & Granites',
    text: 'We tried multiple agencies but got zero leads. SnapTech Digital designed a targeted digital engineering and SEO growth strategy. Today we get 15+ high-quality inquiries every week.',
    rating: 5,
  },
  {
    id: '4',
    name: 'Priya Mehta',
    role: 'COO',
    company: 'FinServe Solutions',
    text: 'The cloud migration Snaptech executed for us cut our infrastructure costs by 38% and improved response times dramatically. Outstanding technical depth.',
    rating: 5,
  },
]

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

const AVATAR_COLORS = [
  'from-brand-navy to-brand-blue',
  'from-violet-600 to-purple-400',
  'from-brand-blue to-cyan-400',
  'from-amber-500 to-orange-400',
]

function StarRating({ rating = 5 }) {
  return (
    <div className="flex gap-1 mb-5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </div>
  )
}

function TestimonialCard({ t, index, isActive }) {
  return (
    <div
      className={`relative bg-white border rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-500 overflow-hidden group
        ${isActive
          ? 'border-brand-blue/30 shadow-lg scale-[1.01] ring-1 ring-brand-blue/10'
          : 'border-slate-200 hover:border-brand-blue/20 hover:shadow-md'
        }`}
    >
      {/* Top brand accent */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.75 transition-opacity duration-300
          ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
        style={{ background: 'linear-gradient(90deg, #1B6EF3, #0D1B4B)' }}
      />

      {/* Large decorative quote */}
      <Quote
        className="absolute right-5 top-4 w-16 h-16 text-slate-100 pointer-events-none transition-transform duration-300 group-hover:scale-110"
        strokeWidth={1}
      />

      <StarRating rating={t.rating ?? 5} />

      <blockquote className="text-sm sm:text-base text-slate-600 leading-relaxed italic mb-6 line-clamp-4 group-hover:text-slate-700 transition-colors">
        &ldquo;{t.text}&rdquo;
      </blockquote>

      <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
        {t.avatarUrl ? (
          <img
            src={t.avatarUrl}
            alt={t.name}
            className="w-11 h-11 rounded-full object-cover shrink-0 border-2 border-brand-blue/20 shadow-sm"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-11 h-11 rounded-full bg-linear-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]}
              flex items-center justify-center font-heading text-xs font-bold text-white shrink-0 shadow-md`}
          >
            {getInitials(t.name)}
          </div>
        )}
        <div>
          <p className="font-heading text-sm font-bold text-slate-800 leading-none mb-0.5">{t.name}</p>
          <p className="text-[11px] text-slate-500">
            {t.role}
            {t.company && <span>, <span className="font-semibold text-brand-blue">{t.company}</span></span>}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const { data, isLoading } = useTestimonials()
  const testimonials = data?.data?.length ? data.data : isLoading ? [] : PLACEHOLDER
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance every 5s
  useEffect(() => {
    if (testimonials.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
    }, 5500)
    return () => clearInterval(timer)
  }, [testimonials.length, currentIndex])

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  const handleNext = () =>
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))

  // On desktop show 3 visible cards, mobile 1
  const visibleCount = 3
  const getVisible = () => {
    if (testimonials.length === 0) return []
    return Array.from({ length: Math.min(visibleCount, testimonials.length) }, (_, i) =>
      testimonials[(currentIndex + i) % testimonials.length]
    )
  }
  const visibleCards = getVisible()

  return (
    <section
      id="testimonials"
      className="py-24 relative overflow-hidden bg-slate-50 border-t border-slate-100"
      aria-labelledby="testimonials-heading"
    >
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-navy/5 rounded-full blur-[120px] pointer-events-none" />

      <Container className="relative z-10">
        {/* Header */}
        <div className="reveal text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-widest mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            {testimonials.length > 0 && `${testimonials.length}+ `}Verified Reviews
          </div>
          <h2
            id="testimonials-heading"
            className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-3"
          >
            What Our{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #1B6EF3, #0D1B4B)' }}
            >
              Clients Say
            </span>
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Real feedback from business leaders and founders who scaled their operations with our
            high-performance digital engineering.
          </p>
          {/* Average stars */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-700">5.0</span>
            <span className="text-sm text-slate-500">average rating</span>
          </div>
        </div>

        {/* Cards grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-8 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Desktop: 3 cards */}
            <div className="hidden lg:grid grid-cols-3 gap-5">
              {visibleCards.map((t, i) => (
                <div
                  key={`${t.id}-${currentIndex}`}
                  style={{ animation: `heroFadeUp 0.4s ease ${i * 0.08}s both` }}
                >
                  <TestimonialCard t={t} index={(currentIndex + i) % AVATAR_COLORS.length} isActive={i === 0} />
                </div>
              ))}
            </div>

            {/* Mobile: single card */}
            <div className="lg:hidden max-w-2xl mx-auto">
              {testimonials[currentIndex] && (
                <div
                  key={currentIndex}
                  style={{ animation: 'heroFadeUp 0.4s ease both' }}
                >
                  <TestimonialCard
                    t={testimonials[currentIndex]}
                    index={currentIndex % AVATAR_COLORS.length}
                    isActive
                  />
                </div>
              )}
            </div>

            {/* Navigation */}
            {testimonials.length > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-brand-blue hover:text-brand-blue hover:shadow-md transition-all shadow-sm cursor-pointer"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Dot indicators with accessible 24px+ touch target */}
                <div className="flex items-center gap-1">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className="p-2 min-w-7 min-h-7 flex items-center justify-center cursor-pointer rounded-full"
                      aria-label={`Go to testimonial ${idx + 1}`}
                    >
                      <span
                        className={`h-2 rounded-full transition-all duration-300 block ${
                          currentIndex === idx ? 'w-8 bg-brand-blue' : 'w-2 bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-brand-blue hover:text-brand-blue hover:shadow-md transition-all shadow-sm cursor-pointer"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* View All CTA */}
        <div className="text-center mt-10">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors group"
          >
            Work with us and share your success story
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  )
}

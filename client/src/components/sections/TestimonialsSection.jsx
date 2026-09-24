/**
 * TestimonialsSection — Single centered spotlight card with smooth auto-rotation,
 * pause-on-hover, drag/swipe support, animated progress indicator, and mobile-first design.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui'
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { useTestimonials } from '@/hooks/useTestimonials'

const AVATAR_COLORS = [
  'from-brand-blue to-brand-navy',
  'from-blue-600 to-indigo-700',
  'from-cyan-500 to-blue-600',
  'from-violet-600 to-brand-navy',
  'from-emerald-600 to-teal-700',
]

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function StarRating({ rating = 5 }) {
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`${rating} out of 5 stars`}>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
              i < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

export default function TestimonialsSection() {
  const { data, isLoading } = useTestimonials()
  const testimonials = Array.isArray(data?.data) ? data.data : []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  const slideDuration = 6000 // 6 seconds per review
  const progressStep = 50 // update progress every 50ms

  // Safe navigation handlers
  const handlePrev = useCallback(() => {
    setDirection(-1)
    setProgress(0)
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }, [testimonials.length])

  const handleNext = useCallback(() => {
    setDirection(1)
    setProgress(0)
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }, [testimonials.length])

  const handleSelectIndex = (idx) => {
    if (idx === currentIndex) return
    setDirection(idx > currentIndex ? 1 : -1)
    setProgress(0)
    setCurrentIndex(idx)
  }

  // Auto-advance timer with progress bar
  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext()
          return 0
        }
        return prev + (progressStep / slideDuration) * 100
      })
    }, progressStep)

    return () => clearInterval(interval)
  }, [testimonials.length, isPaused, handleNext, slideDuration])

  // Reset current index if list length shrinks
  useEffect(() => {
    if (currentIndex >= testimonials.length && testimonials.length > 0) {
      setCurrentIndex(0)
    }
  }, [testimonials.length, currentIndex])

  // Touch / Drag swipe handler for mobile
  const handleDragEnd = (_, { offset, velocity }) => {
    const swipeConfidenceThreshold = 10000
    const swipePower = Math.abs(offset.x) * velocity.x

    if (swipePower < -swipeConfidenceThreshold || offset.x < -60) {
      handleNext()
    } else if (swipePower > swipeConfidenceThreshold || offset.x > 60) {
      handlePrev()
    }
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section
      id="testimonials"
      className="py-20 sm:py-28 relative overflow-hidden bg-slate-50/80 border-t border-slate-100"
      aria-labelledby="testimonials-heading"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-blue/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-brand-navy/5 rounded-full blur-[100px] pointer-events-none" />

      <Container className="relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            Client Reviews & Experiences
          </div>

          <h2
            id="testimonials-heading"
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3"
          >
            What Our{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #1B6EF3 0%, #0D1B4B 100%)' }}
            >
              Clients Say
            </span>
          </h2>

          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Real feedback from business leaders, founders, and enterprises who trust us with their
            mission-critical digital engineering.
          </p>

          {/* Aggregate Trust Badge */}
          <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-full shadow-xs">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-800">5.0 Star Rating</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">100% Client Satisfaction</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm animate-pulse">
            <div className="flex items-center justify-between mb-8">
              <div className="h-5 w-28 bg-slate-200 rounded" />
              <div className="h-10 w-10 bg-slate-200 rounded-full" />
            </div>
            <div className="space-y-3 mb-8">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-5/6" />
              <div className="h-4 bg-slate-200 rounded w-4/6" />
            </div>
            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
              <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-48 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ) : testimonials.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 px-6 rounded-3xl border border-slate-200 bg-white max-w-md mx-auto shadow-xs">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800 mb-1">No client reviews yet</p>
            <p className="text-slate-500 text-xs">
              Client testimonials approved from the Admin Panel will appear here.
            </p>
          </div>
        ) : (
          /* Single Centered Showcase Card ("Mid Box") */
          <div
            className="max-w-3xl lg:max-w-3.5xl mx-auto relative group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          >
            {/* Ambient Card Glow */}
            <div className="absolute -inset-1.5 bg-linear-to-r from-brand-blue/20 via-cyan-500/10 to-brand-navy/20 rounded-3xl sm:rounded-4xl blur-xl opacity-50 group-hover:opacity-80 transition duration-700 pointer-events-none" />

            {/* The Main Centered Box */}
            <div className="relative bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 overflow-hidden">
              {/* Top Accent Gradient Line */}
              <div
                className="h-1.5 w-full"
                style={{ background: 'linear-gradient(90deg, #1B6EF3 0%, #38bdf8 50%, #0D1B4B 100%)' }}
              />

              {/* Watermark Quote Icon */}
              <Quote
                className="absolute right-6 sm:right-10 top-6 sm:top-8 w-24 h-24 sm:w-32 sm:h-32 text-slate-100/80 pointer-events-none -scale-x-100 select-none"
                strokeWidth={1}
              />

              {/* Card Body */}
              <div className="p-6 sm:p-10 md:p-12 relative z-10 min-h-[320px] sm:min-h-[290px] flex flex-col justify-between">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentTestimonial.id || currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag={testimonials.length > 1 ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing select-none"
                  >
                    {/* Top Row: Rating & Verified Chip */}
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <StarRating rating={currentTestimonial.rating ?? 5} />

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-semibold tracking-wide shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Client
                      </div>
                    </div>

                    {/* Middle: Big Testimonial Text */}
                    <blockquote className="text-slate-700 text-base sm:text-lg md:text-xl font-normal leading-relaxed italic mb-8">
                      &ldquo;{currentTestimonial.text}&rdquo;
                    </blockquote>

                    {/* Bottom: Client Profile */}
                    <div className="flex items-center gap-4 pt-5 border-t border-slate-100/90">
                      {currentTestimonial.avatarUrl ? (
                        <img
                          src={currentTestimonial.avatarUrl}
                          alt={currentTestimonial.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 border-2 border-brand-blue/30 shadow-md"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linear-to-br ${
                            AVATAR_COLORS[currentIndex % AVATAR_COLORS.length]
                          } flex items-center justify-center font-heading text-sm sm:text-base font-bold text-white shrink-0 shadow-md ring-2 ring-white`}
                        >
                          {getInitials(currentTestimonial.name)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="font-heading text-base sm:text-lg font-bold text-slate-900 truncate">
                          {currentTestimonial.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 truncate">
                          {currentTestimonial.role}
                          {currentTestimonial.company && (
                            <span>
                              {' '}
                              at{' '}
                              <span className="font-semibold text-brand-blue">
                                {currentTestimonial.company}
                              </span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress Bar (Auto-slide indicator) */}
              {testimonials.length > 1 && (
                <div
                  className="w-full bg-slate-100 h-1 overflow-hidden"
                  aria-hidden="true"
                  title={isPaused ? 'Auto-slide paused on hover' : 'Auto-sliding'}
                >
                  <div
                    className="h-full bg-brand-blue transition-all duration-75 ease-linear"
                    style={{
                      width: `${progress}%`,
                      opacity: isPaused ? 0.4 : 1,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Desktop Left/Right Quick Arrow Buttons (Anchored gracefully outside card) */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="hidden md:flex items-center justify-center absolute -left-5 lg:-left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-brand-blue hover:border-brand-blue hover:shadow-lg transition-all duration-200 shadow-md cursor-pointer z-20"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={handleNext}
                  className="hidden md:flex items-center justify-center absolute -right-5 lg:-right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-brand-blue hover:border-brand-blue hover:shadow-lg transition-all duration-200 shadow-md cursor-pointer z-20"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Bottom Controls: Arrows + Dots for both Mobile and Desktop */}
            {testimonials.length > 1 && (
              <div className="flex items-center justify-between sm:justify-center gap-4 mt-6 px-3 sm:px-0">
                {/* Mobile Prev Button */}
                <button
                  onClick={handlePrev}
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 active:scale-95 hover:border-brand-blue hover:text-brand-blue transition-all shadow-xs cursor-pointer"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Pill & Dot Indicators */}
                <div className="flex items-center gap-1.5 py-1 px-3 bg-white/80 backdrop-blur-xs rounded-full border border-slate-200/60 shadow-2xs">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectIndex(idx)}
                      className="p-1 min-w-6 min-h-6 flex items-center justify-center cursor-pointer group"
                      aria-label={`Go to testimonial ${idx + 1}`}
                      aria-current={currentIndex === idx ? 'true' : 'false'}
                    >
                      <span
                        className={`h-2 rounded-full transition-all duration-300 block ${
                          currentIndex === idx
                            ? 'w-7 sm:w-8 bg-brand-blue shadow-xs'
                            : 'w-2 bg-slate-300 group-hover:bg-slate-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Mobile Next Button */}
                <button
                  onClick={handleNext}
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 active:scale-95 hover:border-brand-blue hover:text-brand-blue transition-all shadow-xs cursor-pointer"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* View All / Work With Us CTA */}
        <div className="text-center mt-12">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-blue transition-colors group"
          >
            Ready to achieve similar results for your business?
            <span className="inline-flex items-center text-brand-blue font-bold group-hover:translate-x-1 transition-transform">
              Start a Project
              <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </Link>
        </div>
      </Container>
    </section>
  )
}


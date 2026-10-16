import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Container } from '@/components/ui'
import { ServiceCardSkeleton } from '@/components/ui/Skeleton'
import { useTeam } from '@/hooks/useTeam'
import { fadeUp, staggerContainer, viewportOnce } from '@/utils/motion'

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.84v2.12h.05c.53-1 1.84-2.12 3.79-2.12 4.05 0 4.8 2.67 4.8 6.13V24h-4v-8.5c0-2.03-.04-4.63-2.82-4.63-2.83 0-3.26 2.2-3.26 4.48V24h-4V8.5z" />
    </svg>
  )
}

/** Initials avatar when no photo available */
function Avatar({ name }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="relative mb-3.5 sm:mb-5 mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center z-10">
      {/* Soft backdrop blur glow */}
      <div className="absolute inset-0 rounded-full bg-linear-to-tr from-brand-blue via-blue-400 to-indigo-600 blur-md opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500" />
      
      {/* Gradient Ring Wrapper */}
      <div className="relative w-full h-full p-0.75 rounded-full bg-linear-to-tr from-brand-blue/20 via-slate-200 to-indigo-500/20 group-hover:from-brand-blue group-hover:via-brand-blue-light group-hover:to-indigo-600 transition-all duration-500 shadow-sm flex items-center justify-center">
        {/* White spacer ring */}
        <div className="w-full h-full p-0.5 rounded-full bg-white flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-blue-50/60 flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
            <span className="font-heading text-base sm:text-lg font-extrabold bg-linear-to-tr from-[#0D1B4B] to-brand-blue bg-clip-text text-transparent">
              {initials}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamCard({ member }) {
  return (
    <div className="relative overflow-hidden p-5 sm:p-6 text-center group border border-slate-200 bg-white hover:border-brand-blue/30 hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col justify-center sm:justify-between h-full">
      {/* Subtle brand glow on hover */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-linear-to-b from-brand-blue/5 to-transparent blur-2xl rounded-full pointer-events-none" />

      <div>
        {member.photoUrl ? (
          <div className="relative mb-3.5 sm:mb-5 mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center z-10">
            {/* Soft backdrop blur glow */}
            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-brand-blue via-transparent to-indigo-600 blur-md opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500" />

            {/* Gradient Ring Wrapper */}
            <div className="relative p-0.75 rounded-full bg-linear-to-tr from-brand-blue/40 via-white to-indigo-500/40 group-hover:from-brand-blue group-hover:via-white group-hover:to-indigo-600 transition-all duration-500 shadow-sm">
              <div className="p-0.5 rounded-full bg-white">
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover shadow-inner group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ) : (
          <Avatar name={member.name} />
        )}

        <div className="relative z-10">
          <h3 className="font-heading text-base font-bold text-slate-800 group-hover:text-brand-blue transition-colors duration-300">
            {member.name}
          </h3>
          <p className="text-[11px] font-mono text-brand-blue font-bold uppercase tracking-wider mt-0.5 sm:mt-1 mb-2 sm:mb-3">
            {member.role}
          </p>

          {member.bio && (
            <p className="text-xs text-slate-600 leading-relaxed mb-3 sm:mb-4 group-hover:text-slate-700 transition-colors duration-300 px-1 line-clamp-3 sm:line-clamp-4">
              {member.bio}
            </p>
          )}
        </div>
      </div>

      {member.linkedinUrl && member.linkedinUrl !== '#' && !member.linkedinUrl.includes('hindustanprojects') && (
        <div className="flex justify-center pt-3 border-t border-slate-100 mt-1 sm:mt-auto">
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on LinkedIn`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono text-slate-600 bg-slate-50 hover:bg-brand-blue hover:text-white border border-slate-200 hover:border-brand-blue transition-all duration-300 shadow-2xs"
          >
            <LinkedInIcon />
            <span>Connect on LinkedIn</span>
          </a>
        </div>
      )}
    </div>
  )
}

const flipVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 120 : -120,
    rotate: dir > 0 ? 5 : -5,
    opacity: 0,
    scale: 0.94,
  }),
  center: {
    x: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 28,
    },
  },
  exit: (dir) => ({
    x: dir > 0 ? -160 : 160,
    rotate: dir > 0 ? -8 : 8,
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.22,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
}

export default function TeamSection({
  id = 'team',
  badge = 'Engineering Leadership',
  title,
  subtitle = 'Our multi-disciplinary team of software architects, UI/UX designers, and DevOps engineers dedicated to corporate excellence.',
  mobileLabel = 'Leadership',
  className = 'py-20 sm:py-24 bg-slate-50 border-t border-slate-100 relative overflow-hidden isolate',
} = {}) {
  const { data, isLoading } = useTeam()
  const members = Array.isArray(data?.data) ? data.data : []
  const [activeMobileIdx, setActiveMobileIdx] = useState(0)
  const [direction, setDirection] = useState(1)

  const handleNext = () => {
    if (members.length <= 1) return
    setDirection(1)
    setActiveMobileIdx((prev) => (prev + 1) % members.length)
  }

  const handlePrev = () => {
    if (members.length <= 1) return
    setDirection(-1)
    setActiveMobileIdx((prev) => (prev === 0 ? members.length - 1 : prev - 1))
  }

  const handleDotClick = (i) => {
    if (i === activeMobileIdx || members.length <= 1) return
    setDirection(i > activeMobileIdx ? 1 : -1)
    setActiveMobileIdx(i)
  }

  return (
    <section
      id={id}
      className={className}
      aria-labelledby={`${id}-heading`}
    >
      {/* Subtle background decorations */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-100/30 rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="text-center mb-10 sm:mb-16 max-w-3xl mx-auto"
        >
          {badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200 text-brand-blue text-xs font-mono font-bold uppercase tracking-widest mb-4 shadow-2xs">
              <span>{badge}</span>
            </div>
          )}
          <h2 id={`${id}-heading`} className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0D1B4B] tracking-tight mb-4">
            {title || (
              <>
                The Minds Behind{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-blue via-blue-600 to-indigo-700">
                  Snaptech Innovation
                </span>
              </>
            )}
          </h2>
          {subtitle && (
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {subtitle}
            </p>
          )}
        </motion.div>

        {members.length === 0 && !isLoading ? (
          <div className="text-center py-12 p-8 rounded-2xl border border-slate-200 bg-white max-w-md mx-auto shadow-xs">
            <p className="text-base font-bold text-slate-800 mb-1">No team members listed</p>
            <p className="text-slate-500 text-xs">
              Leadership profiles added from the Admin Panel will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* ── Desktop & Tablet Grid (sm: screens and up) ── */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <ServiceCardSkeleton key={i} />)
                : members.map((m) => (
                    <motion.div key={m.id} variants={fadeUp}>
                      <TeamCard member={m} />
                    </motion.div>
                  ))}
            </motion.div>

            {/* ── Mobile 3D Card Stack & Flip Deck (< sm: screens) ── */}
            <div className="sm:hidden">
              {isLoading ? (
                <div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />
              ) : (
                <>
                  {/* Top Mobile Controls Bar */}
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                      <span>{mobileLabel} ({activeMobileIdx + 1}/{members.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrev}
                        disabled={members.length <= 1}
                        className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-90 transition-all cursor-pointer"
                        aria-label="Previous team member"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={members.length <= 1}
                        className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue disabled:opacity-30 disabled:cursor-not-allowed shadow-xs active:scale-90 transition-all cursor-pointer"
                        aria-label="Next team member"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 3D Stack Stage */}
                  <div className="relative w-full max-w-85 mx-auto h-105 flex items-center justify-center select-none">
                    {/* Deepest Stack Card 3 */}
                    {members.length > 2 && (
                      <div
                        className="absolute inset-x-5 top-0 h-100 rounded-2xl border border-slate-200/60 bg-slate-100/90 shadow-2xs pointer-events-none transition-all duration-300"
                        style={{
                          transform: 'translateY(18px) scale(0.9)',
                          zIndex: 10,
                          opacity: 0.45,
                        }}
                      />
                    )}

                    {/* Middle Stack Card 2 (Shows next member preview) */}
                    {members.length > 1 && (
                      <div
                        className="absolute inset-x-2.5 top-0 h-100 rounded-2xl border border-slate-200 bg-white shadow-md pointer-events-none transition-all duration-300 overflow-hidden"
                        style={{
                          transform: 'translateY(9px) scale(0.95)',
                          zIndex: 20,
                          opacity: 0.85,
                        }}
                      >
                        <div className="p-5 text-center flex flex-col items-center">
                          <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 mb-3 overflow-hidden flex items-center justify-center">
                            {members[(activeMobileIdx + 1) % members.length]?.photoUrl ? (
                              <img
                                src={members[(activeMobileIdx + 1) % members.length].photoUrl}
                                alt=""
                                className="w-full h-full object-cover opacity-60"
                              />
                            ) : (
                              <span className="text-xs font-bold text-slate-400">
                                {members[(activeMobileIdx + 1) % members.length]?.name?.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-700">
                            {members[(activeMobileIdx + 1) % members.length]?.name}
                          </p>
                          <p className="text-[10px] font-mono text-brand-blue font-bold uppercase mt-0.5">
                            {members[(activeMobileIdx + 1) % members.length]?.role}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Active Front Card 1 (Interactive & Flip animated) */}
                    <AnimatePresence mode="popLayout" custom={direction}>
                      <motion.div
                        key={members[activeMobileIdx]?.id || activeMobileIdx}
                        custom={direction}
                        variants={flipVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        drag={members.length > 1 ? 'x' : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.45}
                        onDragEnd={(_e, { offset }) => {
                          if (offset.x < -45) {
                            handleNext()
                          } else if (offset.x > 45) {
                            handlePrev()
                          }
                        }}
                        className="relative z-30 w-full h-100 cursor-grab active:cursor-grabbing touch-pan-y"
                      >
                        <TeamCard member={members[activeMobileIdx]} />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Flip dots & tactile swipe hint */}
                  <div className="flex flex-col items-center gap-2 mt-7">
                    <div className="flex justify-center items-center gap-1.5">
                      {members.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleDotClick(i)}
                          className="p-1 min-w-5 min-h-5 flex items-center justify-center cursor-pointer"
                          aria-label={`Go to team member ${i + 1}`}
                        >
                          <span
                            className={`h-1.5 rounded-full transition-all duration-300 block ${
                              activeMobileIdx === i ? 'w-6 bg-brand-blue shadow-xs' : 'w-1.5 bg-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {members.length > 1 && (
                      <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
                        <span>&larr;</span> Swipe card to flip <span>&rarr;</span>
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </Container>
    </section>
  )
}


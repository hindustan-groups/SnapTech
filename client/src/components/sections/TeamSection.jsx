import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
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
    <div className="relative mb-5 mx-auto w-24 h-24 flex items-center justify-center z-10">
      {/* Soft backdrop blur glow */}
      <div className="absolute inset-0 rounded-full bg-linear-to-tr from-brand-blue via-transparent to-brand-red blur-md opacity-20 group-hover:opacity-55 group-hover:scale-115 transition-all duration-500" />
      
      {/* Gradient Ring Wrapper */}
      <div className="relative w-full h-full p-0.75 rounded-full bg-linear-to-tr from-brand-blue/20 via-slate-200 to-brand-red/20 group-hover:from-brand-blue group-hover:via-brand-blue-light group-hover:to-brand-red transition-all duration-500 shadow-sm flex items-center justify-center">
        {/* White spacer ring */}
        <div className="w-full h-full p-0.5 rounded-full bg-white flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#1a3e8c]/5 flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
            <span className="font-heading text-lg font-extrabold bg-linear-to-tr from-[#1a3e8c] to-[#3b6fd4] bg-clip-text text-transparent">
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
    <div className="relative overflow-hidden p-6 text-center group border border-slate-200 bg-white hover:border-[#1a3e8c]/30 hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col justify-between h-full">
      {/* Subtle brand glow on hover */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-linear-to-b from-[#1a3e8c]/5 to-transparent blur-2xl rounded-full pointer-events-none" />

      <div>
        {member.photoUrl ? (
          <div className="relative mb-5 mx-auto w-24 h-24 flex items-center justify-center z-10">
            {/* Soft backdrop blur glow */}
            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-[#1a3e8c] via-transparent to-[#e31e24] blur-md opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500" />

            {/* Gradient Ring Wrapper */}
            <div className="relative p-0.75 rounded-full bg-linear-to-tr from-[#1a3e8c]/40 via-white to-[#e31e24]/40 group-hover:from-[#1a3e8c] group-hover:via-white group-hover:to-[#e31e24] transition-all duration-500 shadow-sm">
              <div className="p-0.5 rounded-full bg-white">
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover shadow-inner group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ) : (
          <Avatar name={member.name} />
        )}

        <div className="relative z-10">
          <h3 className="font-heading text-base font-bold text-slate-800 group-hover:text-[#1a3e8c] transition-colors duration-300">
            {member.name}
          </h3>
          <p className="text-[11px] font-mono text-[#e31e24] font-bold uppercase tracking-wider mt-1 mb-3">
            {member.role}
          </p>

          {member.bio && (
            <p className="text-xs text-slate-500 leading-relaxed mb-5 line-clamp-3 group-hover:text-slate-600 transition-colors duration-300 px-1">
              {member.bio}
            </p>
          )}
        </div>
      </div>

      {member.linkedinUrl && (
        <div className="flex justify-center pt-3 border-t border-slate-100 mt-auto">
          <a
            href={member.linkedinUrl && member.linkedinUrl !== '#' ? member.linkedinUrl : 'https://www.linkedin.com/company/hindustanprojects/'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on LinkedIn`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono text-slate-600 bg-slate-50 hover:bg-[#1a3e8c] hover:text-white border border-slate-200 hover:border-[#1a3e8c] transition-all duration-300"
          >
            <LinkedInIcon />
            <span>Connect on LinkedIn</span>
          </a>
        </div>
      )}
    </div>
  )
}

export default function TeamSection() {
  const { data, isLoading } = useTeam()
  const members = Array.isArray(data?.data) ? data.data : []
  const mobileScrollRef = useRef(null)
  const [activeMobileIdx, setActiveMobileIdx] = useState(0)

  const handleMobileScroll = useCallback(() => {
    if (!mobileScrollRef.current) return
    const { scrollLeft, clientWidth } = mobileScrollRef.current
    const itemWidth = clientWidth * 0.78 + 16
    const idx = Math.round(scrollLeft / itemWidth)
    setActiveMobileIdx(Math.min(Math.max(0, idx), members.length - 1))
  }, [members.length])

  const scrollMobile = (idx) => {
    if (!mobileScrollRef.current) return
    const container = mobileScrollRef.current
    const cards = container.children
    if (cards[idx]) {
      cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      setActiveMobileIdx(idx)
    }
  }

  return (
    <section
      id="team"
      className="py-20 sm:py-24 bg-slate-50 border-t border-slate-100 relative overflow-hidden isolate"
      aria-labelledby="team-heading"
    >
      {/* Subtle background decorations */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1a3e8c]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-80 h-80 bg-[#e31e24]/5 rounded-full blur-[140px] pointer-events-none" />

      <Container className="relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="text-center mb-10 sm:mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a3e8c]/10 border border-[#1a3e8c]/20 text-[#1a3e8c] text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <span>Engineering Leadership</span>
          </div>
          <h2 id="team-heading" className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            The Minds Behind{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #1a3e8c, #e31e24)' }}>
              Snaptech Innovation
            </span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Our multi-disciplinary team of software architects, UI/UX designers, and DevOps engineers dedicated to corporate excellence.
          </p>
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

            {/* ── Mobile Horizontal Snap Carousel (< sm: screens) ── */}
            <div className="sm:hidden">
              {isLoading ? (
                <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                      <span>Leadership ({activeMobileIdx + 1}/{members.length})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => scrollMobile(activeMobileIdx - 1)}
                        disabled={activeMobileIdx === 0}
                        className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs active:scale-95 transition-all cursor-pointer"
                        aria-label="Previous team member"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollMobile(activeMobileIdx + 1)}
                        disabled={activeMobileIdx === members.length - 1}
                        className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs active:scale-95 transition-all cursor-pointer"
                        aria-label="Next team member"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={mobileScrollRef}
                    onScroll={handleMobileScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 no-scrollbar scroll-smooth"
                  >
                    {members.map((m) => (
                      <div key={m.id} className="w-[78vw] max-w-[280px] shrink-0 snap-center">
                        <TeamCard member={m} />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center items-center gap-1.5 mt-2">
                    {members.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => scrollMobile(i)}
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
                </>
              )}
            </div>
          </>
        )}
      </Container>
    </section>
  )
}


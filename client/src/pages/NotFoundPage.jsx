/**
 * 404 Not Found page — SnapTech Digital
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { Container, SEO } from '@/components/ui'

export default function NotFoundPage() {
  return (
    <>
      <SEO title="Page Not Found | SnapTech Digital" noIndex />
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center px-4 py-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg mx-auto text-center bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-sm"
          >
            {/* 404 number */}
            <div className="relative mb-6">
              <p className="font-heading text-[7rem] sm:text-[9rem] font-black text-brand-blue/10 leading-none select-none tracking-tight">
                404
              </p>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center shadow-xs">
                  <Search className="w-7 h-7 text-brand-blue" strokeWidth={2} />
                </div>
              </div>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Page Not Found
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              The page or resource you are looking for does not exist or has been relocated within our architecture. Let’s get you back on track.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" /> Go to Homepage
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
              >
                Contact Support
              </Link>
            </div>

            {/* Quick links */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                Popular Destinations
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: 'Services', href: '/services' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Portfolio', href: '/portfolio' },
                  { label: 'About Us', href: '/about' },
                  { label: 'Technical Blog', href: '/blog' },
                  { label: 'Careers', href: '/careers' },
                ].map((l) => (
                  <Link
                    key={l.href}
                    to={l.href}
                    className="text-xs text-slate-600 hover:text-brand-blue font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </Container>
      </div>
    </>
  )
}

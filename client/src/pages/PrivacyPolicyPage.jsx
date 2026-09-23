import { useLegalPage } from '@/hooks/useContent'
import { Container, SEO } from '@/components/ui'
import { Calendar, ShieldAlert } from 'lucide-react'
import DOMPurify from 'dompurify'

export default function PrivacyPolicyPage() {
  const { data: page, isLoading, error } = useLegalPage('PRIVACY_POLICY')

  return (
    <>
      <SEO
        title={page?.title ? `${page.title} | SnapTech Digital` : 'Privacy Policy | SnapTech Digital'}
        description="Read the privacy policy of SnapTech Digital — how we collect, use, and safeguard your enterprise information."
        path="/privacy-policy"
        noIndex
      />

      <div className="bg-slate-50/50 min-h-screen pt-28 pb-16">
        {/* Header */}
        <section className="relative py-14 bg-gradient-to-b from-blue-50/70 via-white to-slate-50/50 border-b border-slate-200/80 text-slate-900 overflow-hidden mb-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(27,110,243,0.08),transparent)] pointer-events-none" />
          <Container className="relative text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-brand-blue bg-blue-50 border border-blue-200/80 uppercase tracking-widest">
              Legal Compliance
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              {page?.title || 'Privacy Policy'}
            </h1>

            {page?.lastUpdated && (
              <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                <span>
                  Last Updated:{' '}
                  {new Date(page.lastUpdated).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </p>
            )}
          </Container>
        </section>

        {/* Content */}
        <Container>
          <div className="max-w-3xl mx-auto bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-5/6" />
                <div className="h-4 bg-slate-100 rounded w-4/5" />
              </div>
            ) : error ? (
              <div className="text-center py-10 space-y-3">
                <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
                <p className="font-semibold text-slate-800">Failed to load policy</p>
                <p className="text-xs text-slate-500">Make sure the API server is online.</p>
              </div>
            ) : (
              <div
                className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-brand-blue prose-p:leading-relaxed prose-li:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }}
              />
            )}
          </div>
        </Container>
      </div>
    </>
  )
}

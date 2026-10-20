import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Upload,
  AlertCircle,
  FileText,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Building2,
  Share2,
  IndianRupee,
  Users,
  Code2,
  Laptop,
  Flame,
  X,
  ChevronRight,
} from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
import { SITE } from '@/components/ui/SEO'
import { useJobDetail, useApplyJob } from '@/hooks/useCareers'
import { useSiteSettings } from '@/hooks/useContent'

const JOB_TYPE_LABELS = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

const JOB_TYPE_CLASSES = {
  FULL_TIME: 'bg-blue-50 text-brand-blue border-blue-200',
  PART_TIME: 'bg-purple-50 text-purple-700 border-purple-200',
  INTERNSHIP: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CONTRACT: 'bg-amber-50 text-amber-700 border-amber-200',
}

const WORKPLACE_LABELS = {
  REMOTE: 'Remote (Anywhere in India)',
  HYBRID: 'Hybrid (Bhilwara HQ + Remote)',
  ON_SITE: 'On-site (Bhilwara Campus)',
}

const DEFAULT_HIRING_STEPS = [
  { step: 1, title: 'CV & Profile Review', desc: 'Our engineering lead evaluates your experience and code samples within 48 hours.' },
  { step: 2, title: 'Technical Deep-Dive', desc: 'A 45-min practical discussion on system design, architecture, and live problem-solving.' },
  { step: 3, title: 'Leadership & Culture Fit', desc: 'Meet our founders and team leads to discuss alignment, impact, and roadmap.' },
  { step: 4, title: 'Offer & Rapid Onboarding', desc: 'Transparent compensation offer rolled out with full workstation and equipment support.' },
]

const DEFAULT_PERKS = [
  'Modern Apple Silicon M-Series or High-Spec Workstation',
  'Flexible Hybrid Working Schedule with High Autonomy',
  'Comprehensive Health & Family Medical Coverage',
  'Annual Learning & Certification Budget (AWS, GCP, etc.)',
  'Performance-Driven Annual Bonuses & Milestone Rewards',
  'Direct Mentorship & Direct Impact on Enterprise Scale Systems',
]

const applySchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(10, 'Valid contact number is required'),
  experience: z.string().optional(),
  currentCtc: z.string().optional(),
  expectedCtc: z.string().optional(),
  noticePeriod: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  coverLetter: z.string().optional(),
  consent: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the Privacy Policy to submit your application.'),
  _hp: z.string().optional(),
})

export default function JobDetailPage() {
  const { slug } = useParams()
  const { data, isLoading } = useJobDetail(slug)
  const applyMutation = useApplyJob(slug)
  const { data: siteSettings } = useSiteSettings()
  const cfg = siteSettings?.data || {}

  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [apiError, setApiError] = useState('')
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applySchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      experience: '',
      currentCtc: '',
      expectedCtc: '',
      noticePeriod: '30 Days',
      linkedinUrl: '',
      portfolioUrl: '',
      coverLetter: '',
      consent: false,
      _hp: '',
    },
  })

  // Resolve job from DB with resilient General Application fallback
  const fallbackGeneralJob = slug === 'general-application' ? {
    id: 'general-app-fallback',
    title: 'General Application (Future Openings)',
    slug: 'general-application',
    department: 'General',
    location: 'Remote / Bhilwara',
    jobType: 'FULL_TIME',
    workplaceType: 'Hybrid',
    experienceRequired: 'Any experience',
    description: 'Submit your resume for general consideration for future openings at SnapTech Digital.',
    responsibilities: [
      'Support various engineering, design, and growth initiatives as needed',
      'Collaborate with the cross-functional team on modern web and cloud solutions',
    ],
    requirements: [
      'Strong passion for continuous learning and building high-impact tech products',
      'Effective communication, integrity, and proactive problem-solving mindset',
    ],
    isActive: true,
  } : null

  const job = data?.data || fallbackGeneralJob

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFileError('')
    if (!selectedFile) {
      setFile(null)
      return
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    const ext = selectedFile.name.split('.').pop().toLowerCase()

    if (!allowedTypes.includes(selectedFile.type) && !['pdf', 'doc', 'docx'].includes(ext)) {
      setFileError('Only PDF and Word documents (.pdf, .doc, .docx) are allowed.')
      setFile(null)
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File size must be under 10MB.')
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const onSubmit = useCallback(
    async (formData) => {
      setApiError('')

      if (!job?.slug) return

      if (!file) {
        setFileError('Please upload your resume (PDF or Word document).')
        return
      }

      let recaptchaToken = ''
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
      if (siteKey && typeof window !== 'undefined' && typeof window.grecaptcha !== 'undefined') {
        try {
          recaptchaToken = await new Promise((resolve, reject) => {
            window.grecaptcha.ready(() => {
              window.grecaptcha
                .execute(siteKey, { action: 'careers_apply' })
                .then(resolve)
                .catch(reject)
            })
          })
        } catch {
          recaptchaToken = ''
        }
      }
      recaptchaToken = recaptchaToken || 'dev-token'

      const payload = new FormData()
      payload.append('fullName', formData.fullName)
      payload.append('email', formData.email)
      payload.append('phone', formData.phone)
      if (formData.experience) payload.append('experience', formData.experience)
      if (formData.currentCtc) payload.append('currentCtc', formData.currentCtc)
      if (formData.expectedCtc) payload.append('expectedCtc', formData.expectedCtc)
      if (formData.noticePeriod) payload.append('noticePeriod', formData.noticePeriod)
      if (formData.linkedinUrl) payload.append('linkedinUrl', formData.linkedinUrl)
      if (formData.portfolioUrl) payload.append('portfolioUrl', formData.portfolioUrl)
      if (formData.coverLetter) payload.append('coverLetter', formData.coverLetter)
      payload.append('resume', file)
      payload.append('recaptchaToken', recaptchaToken)
      payload.append('_hp', formData._hp || '')

      try {
        await applyMutation.mutateAsync(payload)
        reset()
        setFile(null)
      } catch (err) {
        setApiError(
          err.response?.data?.message ||
          (Array.isArray(err.response?.data?.errors)
            ? err.response.data.errors.map((e) => e.msg || e.message).join(', ')
            : null) ||
          err.message ||
          'Failed to submit application. Please try again.'
        )
      }
    },
    [job, file, applyMutation, reset]
  )

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const whatsappNumber = (cfg.whatsapp || cfg.phone || '918209604849').replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello Snaptech Team, I am inquiring about the ${job?.title || 'Open Role'} position.`
  )}`

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center py-32">
        <div className="w-10 h-10 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!job && !isLoading) {
    return (
      <div className="min-h-screen bg-white text-slate-700 py-32 flex items-center justify-center">
        <Container>
          <div className="max-w-md mx-auto space-y-5 bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="font-heading text-xl font-bold text-slate-900">Job Posting Expired</h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              The careers posting you are looking for has expired or is no longer accepting
              responses.
            </p>
            <Link to="/careers" className="inline-block mt-2">
              <Button variant="primary" size="sm" className="bg-brand-blue hover:bg-blue-600 text-white font-bold">
                Browse Active Careers
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  const isGeneral = job.slug === 'general-application'
  const typeClass =
    JOB_TYPE_CLASSES[job.jobType] || 'bg-slate-100 text-slate-700 border-slate-200'
  const typeLabel = JOB_TYPE_LABELS[job.jobType] || job.jobType

  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.createdAt,
    validThrough: job.deadline || undefined,
    employmentType: job.jobType || 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: SITE.name,
      sameAs: SITE.url,
      logo: SITE.logo,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.city,
        addressRegion: SITE.address.state,
        postalCode: SITE.address.postalCode,
        addressCountry: SITE.address.country,
      },
    },
    applicantLocationRequirements: { '@type': 'Country', name: 'India' },
    jobLocationType: 'TELECOMMUTE',
  }

  return (
    <div className="min-h-screen bg-white text-slate-700 relative overflow-hidden">
      <SEO
        title={`${job.title} | Careers — SnapTech Digital`}
        description={
          job.description?.slice(0, 155) ||
          `Apply for ${job.title} at SnapTech Digital. Join our growing tech team.`
        }
        path={`/careers/${job.slug}`}
        keywords={`${job.title} job Bhilwara, IT careers Rajasthan, ${job.department} jobs India, software developer careers`}
        schemas={[jobPostingSchema]}
      />

      <div className="pt-28 pb-16 sm:pt-36 sm:pb-20 relative">
        <Container className="relative">
          {/* Top Breadcrumb / Back Link */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-brand-blue transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 text-brand-blue group-hover:-translate-x-1 transition-transform" />{' '}
              Back to All Careers
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-brand-blue" />
              {copied ? 'Link Copied!' : 'Share Role'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 items-start">
            {/* Left Column: Job Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-50/70 border border-slate-200/90 shadow-sm space-y-6">
                <div className="space-y-4 border-b border-slate-200 pb-6">
                  {/* Badges Bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${typeClass}`}
                    >
                      {typeLabel}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-md">
                      {job.department}
                    </span>
                    {job.workplaceType && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                        {WORKPLACE_LABELS[job.workplaceType] || job.workplaceType}
                      </span>
                    )}
                    {job.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        {job.badge}
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Opening
                    </span>
                  </div>

                  <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {job.title}
                  </h1>

                  {/* Corporate Attributes Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-blue" /> Location
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1 truncate">
                        {job.location}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-brand-blue" /> Experience
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1 truncate">
                        {job.experienceRequired}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-emerald-600" /> Compensation
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-700 mt-1 truncate">
                        {job.showSalary !== false && job.salaryRange
                          ? `₹ ${job.salaryRange}`
                          : 'Competitive CTC'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-purple-600" /> Openings
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-purple-800 mt-1">
                        {job.openings ? `${job.openings} Positions` : 'Multiple Positions'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tech Stack & Required Skills */}
                {((Array.isArray(job.skills) && job.skills.length > 0) ||
                  (Array.isArray(job.tags) && job.tags.length > 0)) && (
                  <div className="space-y-3 pt-1">
                    <h2 className="font-heading text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-brand-blue" /> Core Tech Stack &amp; Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(job.skills) && job.skills.length > 0 ? job.skills : job.tags).map(
                        (skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold shadow-2xs flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-3 pt-2">
                  <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-blue animate-pulse" /> Role Overview
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>

                {/* Responsibilities */}
                {job.responsibilities?.length > 0 && (
                  <div className="space-y-4 pt-3 border-t border-slate-200">
                    <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                      Key Responsibilities &amp; Impact
                    </h2>
                    <ul className="space-y-3">
                      {job.responsibilities.map((resp, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-slate-600 text-xs sm:text-sm leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-2 shrink-0 shadow-xs" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Requirements */}
                {job.requirements?.length > 0 && (
                  <div className="space-y-4 pt-3 border-t border-slate-200">
                    <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                      Qualifications &amp; Ideal Capabilities
                    </h2>
                    <ul className="space-y-3">
                      {job.requirements.map((req, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-slate-600 text-xs sm:text-sm leading-relaxed"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Transparent 4-Step Hiring Process Roadmap */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                        Clear &amp; Respectful Timeline
                      </span>
                      <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                        Our Transparent Hiring Process
                      </h2>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
                      Average turnaround: 5-7 days
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {(Array.isArray(job.hiringSteps) && job.hiringSteps.length > 0
                      ? job.hiringSteps
                      : DEFAULT_HIRING_STEPS
                    ).map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-brand-blue text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900">
                            {typeof step === 'object' ? step.title : step}
                          </h4>
                          {typeof step === 'object' && step.desc && (
                            <p className="text-[11px] text-slate-500 leading-normal">
                              {step.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company Perks & Benefits */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                      Top-Tier Compensation &amp; Culture
                    </span>
                    <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                      Why Top Builders Join SnapTech
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(Array.isArray(job.perks) && job.perks.length > 0
                      ? job.perks
                      : DEFAULT_PERKS
                    ).map((perk, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-700"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Company Culture & Support Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-50 to-indigo-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    SnapTech Digital Careers
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    Need clarification on this position?
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                    Have questions about team structure, compensation, or tech stack? Connect directly
                    with our hiring coordinators on WhatsApp.
                  </p>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-all shrink-0 shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask via WhatsApp
                </a>
              </div>
            </div>

            {/* Right Column: Sticky Application Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xl relative overflow-hidden">
                {/* Luminous Top Gradient Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-blue via-blue-500 to-indigo-500" />

                {applyMutation.isSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-heading text-xl font-bold text-slate-900">
                        Application Submitted!
                      </h3>
                      <p className="text-slate-600 text-xs leading-relaxed px-2">
                        Thank you for applying for <strong>{job.title}</strong>. Your CV and profile details have been directly routed to our Talent Acquisition desk.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                      <div className="font-bold text-slate-800">What happens next:</div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Resume screening &amp; matching (24-48 hrs)</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <ChevronRight className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                        <span>Hiring team will reach out via WhatsApp/Phone</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => applyMutation.reset()}
                      className="w-full mt-4 bg-brand-blue hover:bg-blue-600 text-white font-bold"
                    >
                      Apply for Another Role
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="border-b border-slate-200 pb-3 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">
                          Direct Talent Pipeline
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Fast Turnaround
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-bold text-slate-900 mt-1">
                        {isGeneral ? 'General Application' : 'Apply for this Role'}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Fill in your professional credentials. Our hiring lead reviews every application.
                      </p>
                    </div>

                    {apiError && (
                      <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                        <span>{apiError}</span>
                      </div>
                    )}

                    {/* Name */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        {...register('fullName')}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                      />
                      {errors.fullName && (
                        <p className="text-[10px] text-red-500">{errors.fullName.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="e.g. rahul@example.com"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                      />
                      {errors.email && (
                        <p className="text-[10px] text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                      />
                      {errors.phone && (
                        <p className="text-[10px] text-red-500">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Experience & Notice Period Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          Experience
                        </label>
                        <input
                          type="text"
                          {...register('experience')}
                          placeholder="e.g. 3.5 Years"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          Notice Period
                        </label>
                        <select
                          {...register('noticePeriod')}
                          className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none cursor-pointer"
                        >
                          <option value="Immediate">Immediate</option>
                          <option value="15 Days">15 Days</option>
                          <option value="30 Days">30 Days</option>
                          <option value="60 Days">60 Days</option>
                          <option value="90 Days">90 Days</option>
                        </select>
                      </div>
                    </div>

                    {/* Current & Expected CTC */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          Current CTC
                        </label>
                        <input
                          type="text"
                          {...register('currentCtc')}
                          placeholder="e.g. ₹9 LPA"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          Expected CTC
                        </label>
                        <input
                          type="text"
                          {...register('expectedCtc')}
                          placeholder="e.g. ₹15 LPA"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* LinkedIn & Portfolio Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          LinkedIn Profile
                        </label>
                        <input
                          type="url"
                          {...register('linkedinUrl')}
                          placeholder="linkedin.com/in/username"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          Portfolio / GitHub
                        </label>
                        <input
                          type="url"
                          {...register('portfolioUrl')}
                          placeholder="github.com/username"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Resume Upload Box */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Upload Resume / CV (PDF, DOC, DOCX — Max 10MB) *
                      </label>
                      <div
                        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all text-center ${
                          file
                            ? 'border-emerald-500 bg-emerald-50/40'
                            : 'border-slate-300 hover:border-brand-blue bg-slate-50/60'
                        }`}
                      >
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {file ? (
                          <div className="flex items-center justify-between gap-3 text-left">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-[10px] text-emerald-700 font-semibold">
                                  {formatFileSize(file.size)} • Ready to upload
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setFile(null)
                              }}
                              className="relative z-20 p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1 py-1">
                            <Upload className="w-6 h-6 mx-auto text-brand-blue" />
                            <p className="text-xs font-bold text-slate-700">
                              Click or drag &amp; drop your CV here
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Supports PDF, Word (.doc, .docx) up to 10MB
                            </p>
                          </div>
                        )}
                      </div>
                      {fileError && <p className="text-[10px] text-red-500 font-medium">{fileError}</p>}
                    </div>

                    {/* Cover Letter */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Cover Note / Personal Pitch (Optional)
                      </label>
                      <textarea
                        rows="2"
                        {...register('coverLetter')}
                        placeholder="Brief summary of your proudest accomplishments, core strengths, or why you want to join..."
                        className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Honeypot field */}
                    <div style={{ display: 'none' }} aria-hidden="true">
                      <input
                        type="text"
                        tabIndex="-1"
                        autoComplete="off"
                        placeholder="Do not fill this"
                        {...register('_hp')}
                      />
                    </div>

                    {/* DPDP Consent Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          id="career-consent"
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/30 cursor-pointer"
                          {...register('consent')}
                        />
                        <span className="text-[10px] text-slate-600 leading-relaxed">
                          I consent to SnapTech Digital storing my application and resume for recruitment purposes in accordance with the{' '}
                          <Link
                            to="/privacy-policy"
                            target="_blank"
                            className="text-brand-blue font-semibold hover:underline"
                          >
                            Privacy Policy
                          </Link>.
                        </span>
                      </label>
                      {errors.consent && (
                        <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {errors.consent.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={applyMutation.isPending}
                      className="w-full mt-2 bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {applyMutation.isPending ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Transmitting Application &amp; CV…
                        </>
                      ) : (
                        'Submit Job Application'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}

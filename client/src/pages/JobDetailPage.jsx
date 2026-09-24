import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
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

const FALLBACK_ROLE_MAP = {
  'full-stack-developer': {
    id: 'jp-fallback-1',
    title: 'Senior Full-Stack Engineer (React & Node.js)',
    slug: 'full-stack-developer',
    department: 'Engineering',
    location: 'Bhilwara HQ / Hybrid',
    jobType: 'FULL_TIME',
    experienceRequired: '2 - 5 Years',
    createdAt: '2025-01-15T00:00:00.000Z',
    description:
      'Architect enterprise-grade web applications, mission-critical internal portals, and resilient microservices using React, Node.js, and PostgreSQL. You will work directly with senior architects to deploy high-throughput solutions for group subsidiaries and national clients.',
    responsibilities: [
      'Design, build, and maintain high-performance, reusable, and reliable React and Node.js code',
      'Architect robust PostgreSQL and Prisma database schemas with optimized querying and index tuning',
      'Build secure RESTful APIs and WebSocket feeds with JWT authentication, role-based access, and rate limiting',
      'Collaborate directly with cross-functional engineering teams, UI/UX designers, and executive stakeholders',
      'Optimize front-end and backend workloads for sub-second latency and high availability',
    ],
    requirements: [
      '2+ years of professional full-stack development experience with modern JavaScript / TypeScript',
      'Deep proficiency in React (hooks, context, state management, Vite/Next.js) and Tailwind CSS',
      'Hands-on experience building backend microservices with Node.js, Express, and relational databases',
      'Solid grasp of Git workflows, CI/CD pipelines, Docker containerization, and cloud deployments',
      'Strong analytical problem-solving skills and passion for writing clean, maintainable code',
    ],
  },
  'devops-cloud-specialist': {
    id: 'jp-fallback-2',
    title: 'DevOps & Cloud Infrastructure Specialist',
    slug: 'devops-cloud-specialist',
    department: 'Cloud & Infrastructure',
    location: 'Remote / Bhilwara',
    jobType: 'FULL_TIME',
    experienceRequired: '3+ Years',
    createdAt: '2025-02-01T00:00:00.000Z',
    description:
      'Manage multi-region cloud deployments, automated CI/CD deployment pipelines, automated zero-downtime monitoring, and Kubernetes orchestration. You will ensure our enterprise hosting infrastructure maintains 99.9% uptime SLA.',
    responsibilities: [
      'Design, provision, and maintain secure AWS/GCP cloud environments using Infrastructure as Code (Terraform)',
      'Construct automated CI/CD pipelines for automated testing, linting, Docker packaging, and zero-downtime releases',
      'Implement unified observability, central logging (ELK / Loki), and Prometheus + Grafana alerting',
      'Harden containerized environments and enforce zero-trust network policies and vulnerability scanning',
    ],
    requirements: [
      '3+ years experience administering Linux cloud servers and containerized production environments',
      'Proven expertise with Docker, Kubernetes, Nginx reverse proxies, and automated SSL orchestration',
      'Strong scripting skills in Bash, Python, or Go for infrastructure automation',
      'Working knowledge of cloud security standards, VPC peering, and automated database backups',
    ],
  },
  'social-media-associate': {
    id: 'jp-fallback-3',
    title: 'Digital Marketing & Growth Associate',
    slug: 'social-media-associate',
    department: 'Marketing & Growth',
    location: 'Remote / Bhilwara',
    jobType: 'INTERNSHIP',
    experienceRequired: 'Freshers / 1 Year',
    createdAt: '2025-02-10T00:00:00.000Z',
    description:
      'Drive data-driven client marketing campaigns, high-converting social media creatives, conversion optimization, and brand performance metrics. Ideal for proactive marketers passionate about digital growth and visual storytelling.',
    responsibilities: [
      'Produce engaging visual and motion assets for LinkedIn, Instagram, and Twitter using Canva / Figma',
      'Draft persuasive marketing copy, case study writeups, and client press releases',
      'Run and optimize targeted Meta and Google ad campaigns to generate qualified enterprise leads',
      'Analyze weekly traffic metrics, engagement rates, and inbound conversion funnels',
    ],
    requirements: [
      'Demonstrated portfolio or proof-of-work in digital marketing, copywriting, or visual design',
      'Familiarity with marketing analytics tools (Google Analytics 4, Meta Business Suite, Search Console)',
      'Fluent verbal and written communication in English and Hindi',
      'Self-driven mentality with keen interest in tech sector developments and B2B growth',
    ],
  },
  'ui-ux-product-designer': {
    id: 'jp-fallback-4',
    title: 'Enterprise UI/UX Product Designer',
    slug: 'ui-ux-product-designer',
    department: 'Design',
    location: 'Remote / Hybrid',
    jobType: 'FULL_TIME',
    experienceRequired: '2 - 4 Years',
    createdAt: '2025-02-15T00:00:00.000Z',
    description:
      'Craft cutting-edge glassmorphic design systems, responsive web apps, and intuitive user journeys for our enterprise ERP and fintech clients.',
    responsibilities: [
      'Create high-fidelity wireframes, interactive prototypes, and design tokens in Figma',
      'Develop scalable cyber and glassmorphic component libraries for modern web and mobile apps',
      'Conduct user journey mapping, UX audits, and usability testing sessions with stakeholders',
      'Work closely with front-end React engineers to guarantee pixel-perfect UI execution',
    ],
    requirements: [
      '2+ years in UI/UX design with a strong portfolio showcasing responsive web apps and dashboards',
      'Deep mastery of Figma (auto-layout, components, variants, design systems, and prototyping)',
      'Understanding of modern CSS, flexbox/grid layout paradigms, and web accessibility standards',
      'Exceptional visual taste with emphasis on typography, dark mode aesthetics, and micro-interactions',
    ],
  },
  'ai-automation-engineer': {
    id: 'jp-fallback-5',
    title: 'AI Solutions & Automation Engineer',
    slug: 'ai-automation-engineer',
    department: 'Engineering',
    location: 'Bhilwara HQ / Hybrid',
    jobType: 'FULL_TIME',
    experienceRequired: '1 - 3 Years',
    createdAt: '2025-03-01T00:00:00.000Z',
    description:
      'Build intelligent workflow automations, conversational LLM assistants, and document analysis pipelines integrated with client ERPs.',
    responsibilities: [
      'Develop LLM-powered business agents, document parsing workflows, and semantic search systems',
      'Integrate AI services (OpenAI, Anthropic, Gemini, Hugging Face) into production enterprise platforms',
      'Construct automated data ingestion pipelines, vector embeddings stores, and retrieval mechanisms',
      'Ensure safety guardrails, prompt optimization, and token cost efficiency across all deployments',
    ],
    requirements: [
      'Strong hands-on Python experience and familiarity with LangChain, LlamaIndex, or LiteLLM',
      'Practical understanding of vector databases (Chroma, Pinecone, pgvector) and RAG architectures',
      'Experience with RESTful API integration and cloud hosting (AWS / GCP / Modal)',
      'Curiosity and fast learner mindset in the rapidly evolving generative AI landscape',
    ],
  },
  'general-application': {
    id: 'jp-fallback-general',
    title: 'General Talent Application',
    slug: 'general-application',
    department: 'All Departments',
    location: 'Bhilwara HQ / Remote',
    jobType: 'FULL_TIME',
    experienceRequired: 'Any Experience Level',
    createdAt: '2025-01-01T00:00:00.000Z',
    description:
      'Don’t see an open role that matches your exact skillset? We are always on the lookout for world-class software engineers, cloud architects, UI/UX designers, and growth marketers. Submit your resume and portfolio.',
    responsibilities: [
      'Drive high-impact engineering, design, or growth initiatives tailored to your core strengths',
      'Collaborate across teams to build and scale SnapTech Digital offerings',
      'Continuously elevate our technical craft and operational excellence',
    ],
    requirements: [
      'Demonstrated expertise and passion in your field of practice',
      'Strong problem-solving instincts and clear communication',
      'Alignment with high-performance, ownership-driven culture',
    ],
  },
}

const applySchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(10, 'Valid contact number is required'),
  coverLetter: z.string().optional(),
  _hp: z.string().optional(),
})

export default function JobDetailPage() {
  const { slug } = useParams()
  const { data, isLoading, error } = useJobDetail(slug)
  const applyMutation = useApplyJob(slug)
  const { data: siteSettings } = useSiteSettings()
  const cfg = siteSettings?.data || {}

  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [apiError, setApiError] = useState('')
  const [localLockout, setLocalLockout] = useState(false)
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
      coverLetter: '',
      _hp: '',
    },
  })

  // Resolve job from DB or fallback catalog
  const job = useMemo(() => {
    if (data?.data) return data.data
    if (slug && FALLBACK_ROLE_MAP[slug]) return FALLBACK_ROLE_MAP[slug]
    return null
  }, [data?.data, slug])

  useEffect(() => {
    if (job?.slug) {
      const lastSubmit = localStorage.getItem(`last_submit_careers_${job.slug}`)
      if (lastSubmit) {
        const timeDiff = Date.now() - parseInt(lastSubmit, 10)
        const oneDay = 24 * 60 * 60 * 1000
        if (timeDiff < oneDay) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLocalLockout(true)
        }
      }
    }
  }, [job?.slug])

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
      setFileError('Only PDF and Word documents (.doc, .docx) are allowed.')
      setFile(null)
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError('File size must be under 5MB.')
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const onSubmit = useCallback(
    async (formData) => {
      setApiError('')

      if (!job?.slug) return

      // Double-check lockout
      const lastSubmit = localStorage.getItem(`last_submit_careers_${job.slug}`)
      if (lastSubmit && Date.now() - parseInt(lastSubmit, 10) < 24 * 60 * 60 * 1000) {
        setApiError('You have already applied for this role within the last 24 hours.')
        return
      }

      if (!file) {
        setFileError('Please upload your resume.')
        return
      }

      let recaptchaToken = 'dev-token'
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
      if (siteKey && typeof window.grecaptcha !== 'undefined') {
        try {
          recaptchaToken = await new Promise((resolve, reject) => {
            window.grecaptcha.ready(() => {
              window.grecaptcha
                .execute(siteKey, { action: 'careers_apply' })
                .then(resolve)
                .catch(reject)
            })
          })
        } catch (err) {
          console.error('[reCAPTCHA] Failed to get token:', err)
        }
      }

      const payload = new FormData()
      payload.append('fullName', formData.fullName)
      payload.append('email', formData.email)
      payload.append('phone', formData.phone)
      if (formData.coverLetter) {
        payload.append('coverLetter', formData.coverLetter)
      }
      payload.append('resume', file)
      payload.append('recaptchaToken', recaptchaToken)
      payload.append('_hp', formData._hp || '')

      try {
        await applyMutation.mutateAsync(payload)
        localStorage.setItem(`last_submit_careers_${job.slug}`, Date.now().toString())
        setLocalLockout(true)
        reset()
        setFile(null)
      } catch (err) {
        setApiError(err.message || 'Failed to submit application. Please try again.')
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

  const whatsappNumber = (cfg.whatsapp || cfg.phone || '917597000601').replace(/[^0-9]/g, '')
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

  if ((error || !job) && !FALLBACK_ROLE_MAP[slug]) {
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
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-50/50 border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-4 border-b border-slate-200 pb-6">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded border ${typeClass}`}
                    >
                      {typeLabel}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded">
                      {job.department}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Direct Hiring
                    </span>
                  </div>

                  <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {job.title}
                  </h1>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-brand-blue shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600">
                      <Briefcase className="w-4 h-4 text-brand-blue shrink-0" />
                      <span>{job.experienceRequired}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600 col-span-2 sm:col-span-1">
                      <Calendar className="w-4 h-4 text-brand-blue shrink-0" />
                      <span>
                        Posted:{' '}
                        {new Date(job.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
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
              </div>

              {/* Company Culture / Backed by Parent Group Card */}
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
                        Thank you for applying. Our talent acquisition team will review your resume
                        and reach out within 3 to 5 business days.
                      </p>
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
                ) : localLockout ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                      <AlertCircle className="w-8 h-8 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-heading text-lg font-bold text-slate-900">
                        Submission Locked (24h)
                      </h3>
                      <p className="text-slate-600 text-xs leading-relaxed px-2">
                        You have already submitted an application for this role within the last 24
                        hours. Please wait for our recruiters to review your profile.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="border-b border-slate-200 pb-3 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">
                        Fast-Track Application
                      </span>
                      <h3 className="font-heading text-lg font-bold text-slate-900 mt-0.5">
                        {isGeneral ? 'General Pitch' : 'Apply for Role'}
                      </h3>
                    </div>

                    {apiError && (
                      <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                        <span>{apiError}</span>
                      </div>
                    )}

                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        {...register('fullName')}
                        placeholder="e.g. Vikramaditya Sharma"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                      />
                      {errors.fullName && (
                        <p className="text-[10px] text-red-500">{errors.fullName.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="e.g. vikram@domain.com"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                      />
                      {errors.email && (
                        <p className="text-[10px] text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
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

                    {/* Resume Upload */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Upload Resume (PDF, DOC - Max 5MB) *
                      </label>
                      <div
                        className={`relative border border-dashed rounded-xl p-4 transition-all text-center ${
                          file
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : 'border-slate-300 hover:border-brand-blue/50 bg-slate-50/50'
                        }`}
                      >
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-1.5">
                          <Upload
                            className={`w-5 h-5 mx-auto ${
                              file ? 'text-emerald-600 animate-bounce' : 'text-slate-400'
                            }`}
                          />
                          {file ? (
                            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-bold max-w-full truncate px-2">
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{file.name}</span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 leading-normal">
                              Click or drop resume file here
                            </p>
                          )}
                        </div>
                      </div>
                      {fileError && <p className="text-[10px] text-red-500">{fileError}</p>}
                    </div>

                    {/* Cover Letter */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Brief Note / Portfolio Link (Optional)
                      </label>
                      <textarea
                        rows="3"
                        {...register('coverLetter')}
                        placeholder="Highlight your standout achievements or GitHub/portfolio links..."
                        className="w-full bg-slate-50 border border-slate-300 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all resize-none"
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

                    <button
                      type="submit"
                      disabled={applyMutation.isPending}
                      className="w-full mt-2 bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {applyMutation.isPending ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting Application…
                        </>
                      ) : (
                        'Submit Application'
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

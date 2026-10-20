import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useOutletContext, Link } from 'react-router-dom'
import { api } from '@/utils/api'
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  X,
  FileText,
  Download,
  Eye,
  UserCheck,
  Users,
  Mail,
  Phone,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  Search,
  Clock,
  Sparkles,
  Star,
  CheckCircle2,
} from 'lucide-react'
import {
  useAdminJobs,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  useAdminApplications,
  useUpdateApplicationStatus,
  useDeleteApplication,
} from '@/hooks/useCareers'
import { SEO } from '@/components/ui'

const WORKPLACE_COLORS = {
  'On-site': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Hybrid: 'bg-blue-50 text-brand-blue border-blue-200',
  Remote: 'bg-purple-50 text-purple-700 border-purple-200',
}

const STATUS_COLORS = {
  NEW: 'bg-blue-50 text-blue-700 border-blue-200',
  SHORTLISTED: 'bg-purple-50 text-purple-700 border-purple-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  HIRED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const getWhatsAppLink = (fullName, jobTitle, rawPhone, customText = '') => {
  if (!rawPhone) return '#'
  let cleaned = rawPhone.replace(/[^0-9]/g, '')
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned
  }
  const defaultText = `Hello ${fullName},\n\nGreetings from SnapTech Digital (Hindustan Projects Group). We reviewed your application for the "${jobTitle}" position and would love to connect with you regarding the next round of discussions.`
  const text = encodeURIComponent(customText || defaultText)
  return `https://wa.me/${cleaned}?text=${text}`
}

export default function AdminCareersPage() {
  const [activeTab, setActiveTab] = useState('postings') // 'postings' | 'applications'
  const [editingJob, setEditingJob] = useState(null) // null | job object
  const [activeJobModalTab, setActiveJobModalTab] = useState('basic') // 'basic' | 'comp' | 'details' | 'skills'
  const [viewingApp, setViewingApp] = useState(null) // null | application object
  const [downloadingId, setDownloadingId] = useState(null)
  const [activeModalTab, setActiveModalTab] = useState('resume') // 'resume' | 'profile' | 'evaluation'
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState(null)
  const [copiedJobId, setCopiedJobId] = useState(null)

  // Recruiter Notes in modal
  const [evalNotes, setEvalNotes] = useState('')
  const [evalRating, setEvalRating] = useState(0)
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  // Filters & Search
  const [jobFilter, setJobFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [jobSearchQuery, setJobSearchQuery] = useState('')
  const [jobDeptFilter, setJobDeptFilter] = useState('')

  const { admin } = useOutletContext()

  // Queries & Mutations
  const { data: jobsData, isLoading: jobsLoading, isError: jobsError } = useAdminJobs()
  const {
    data: appsData,
    isLoading: appsLoading,
    isError: appsError,
  } = useAdminApplications({
    jobPostingId: jobFilter,
    status: statusFilter,
    search: searchQuery,
  })

  const createJobMut = useCreateJob()
  const updateJobMut = useUpdateJob()
  const deleteJobMut = useDeleteJob()
  const updateAppStatusMut = useUpdateApplicationStatus()
  const deleteAppMut = useDeleteApplication()

  // Form Setup for Job Posting CRUD
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  const watchTitle = watch('title')

  // Auto slug generation on new job title change
  useEffect(() => {
    if (editingJob && !editingJob.id && watchTitle) {
      const autoSlug = watchTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setValue('slug', autoSlug)
    }
  }, [watchTitle, editingJob, setValue])

  // Resume Preview Blob Loader
  useEffect(() => {
    if (!viewingApp?.id) return

    let active = true
    let currentUrl = null
    setPreviewLoading(true)
    setPreviewError(null)

    api
      .getBlob(`/admin/applications/${viewingApp.id}/resume`)
      .then((blob) => {
        if (!active) return
        const pdfBlob = new Blob([blob], { type: 'application/pdf' })
        currentUrl = window.URL.createObjectURL(pdfBlob)
        setPreviewBlobUrl(currentUrl)
        setPreviewLoading(false)
      })
      .catch((err) => {
        if (!active) return
        console.warn('Failed to load resume preview blob:', err)
        setPreviewError(err?.message || 'Resume document preview could not be loaded directly.')
        setPreviewLoading(false)
      })

    return () => {
      active = false
      if (currentUrl) {
        window.URL.revokeObjectURL(currentUrl)
      }
    }
  }, [viewingApp?.id])

  const handleOpenViewModal = (app, initialTab = 'resume') => {
    setViewingApp(app)
    setActiveModalTab(initialTab)
    setEvalNotes(app.adminNotes || '')
    setEvalRating(app.rating || 0)
    setPreviewBlobUrl(null)
    setPreviewError(null)
  }

  const handleCloseViewModal = () => {
    setViewingApp(null)
    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl)
    }
    setPreviewBlobUrl(null)
    setPreviewError(null)
    setPreviewLoading(false)
    setActiveModalTab('resume')
  }

  const handleDownloadResume = async (appId, candidateName, originalFilename) => {
    try {
      setDownloadingId(appId)
      const blob = await api.getBlob(`/admin/applications/${appId}/resume?download=1`)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeName = (candidateName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_')
      a.download = originalFilename || `Resume_${safeName}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (err) {
      console.error('Failed to download resume:', err)
      alert(err?.message || 'Failed to download resume')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleOpenResumeInTab = async (appId) => {
    try {
      setDownloadingId(appId)
      const blob = await api.getBlob(`/admin/applications/${appId}/resume`)
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => window.URL.revokeObjectURL(url), 60000)
    } catch (err) {
      console.error('Failed to view resume:', err)
      alert(err?.message || 'Failed to view resume')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleSaveNotes = async () => {
    if (!viewingApp) return
    try {
      setIsSavingNotes(true)
      await updateAppStatusMut.mutateAsync({
        id: viewingApp.id,
        status: viewingApp.status,
        adminNotes: evalNotes,
        rating: evalRating,
      })
      setViewingApp((prev) => ({ ...prev, adminNotes: evalNotes, rating: evalRating }))
      alert('Recruiter evaluation notes and rating updated successfully!')
    } catch (err) {
      alert(err.message || 'Failed to update evaluation notes')
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleOpenCreateModal = () => {
    reset({
      title: '',
      slug: '',
      department: 'Engineering',
      location: 'Bhilwara (Headquarters)',
      jobType: 'FULL_TIME',
      workplaceType: 'Hybrid',
      experienceRequired: '2–4 Years',
      salaryRange: '₹6,00,000 – ₹10,00,000 LPA',
      showSalary: true,
      openings: 1,
      badge: 'Actively Hiring',
      deadline: '',
      description: '',
      responsibilities: '',
      requirements: '',
      skills: 'React, Node.js, Express, PostgreSQL, TailwindCSS, Git',
      perks:
        'Modern M-Series Workstation\nFlexible Working Hours\nHealth & Wellness Protection\nAnnual Performance Bonus',
      hiringSteps:
        'Round 1: Application Screening (20m)\nRound 2: Technical Live Coding (60m)\nRound 3: System Design & Culture (45m)\nRound 4: Offer Discussion',
      isActive: true,
    })
    setActiveJobModalTab('basic')
    setEditingJob({})
  }

  const handleOpenEditModal = (job) => {
    reset({
      title: job.title,
      slug: job.slug,
      department: job.department,
      location: job.location,
      jobType: job.jobType,
      workplaceType: job.workplaceType || 'On-site',
      experienceRequired: job.experienceRequired,
      salaryRange: job.salaryRange || '',
      showSalary: job.showSalary ?? true,
      openings: job.openings || 1,
      badge: job.badge || 'Actively Hiring',
      deadline: job.deadline || '',
      description: job.description,
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
      perks: Array.isArray(job.perks) ? job.perks.join('\n') : '',
      hiringSteps: Array.isArray(job.hiringSteps) ? job.hiringSteps.join('\n') : '',
      isActive: job.isActive,
    })
    setActiveJobModalTab('basic')
    setEditingJob(job)
  }

  const onJobSubmit = async (data) => {
    const payload = {
      ...data,
      openings: Number(data.openings) || 1,
      showSalary: Boolean(data.showSalary),
      responsibilities: (data.responsibilities || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      requirements: (data.requirements || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      skills: (data.skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      perks: (data.perks || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      hiringSteps: (data.hiringSteps || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    }

    try {
      if (editingJob.id) {
        await updateJobMut.mutateAsync({ id: editingJob.id, ...payload })
      } else {
        await createJobMut.mutateAsync(payload)
      }
      setEditingJob(null)
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to save job posting')
    }
  }

  const handleDeleteJob = async (id) => {
    if (
      confirm(
        'Are you sure you want to delete this job posting? This will remove all applications submitted for this role.'
      )
    ) {
      try {
        await deleteJobMut.mutateAsync(id)
      } catch (err) {
        alert(err.message || 'Failed to delete job posting')
      }
    }
  }

  const handleToggleJobActive = async (job) => {
    try {
      await updateJobMut.mutateAsync({
        id: job.id,
        slug: job.slug,
        isActive: !job.isActive,
      })
    } catch (err) {
      alert(err.message || 'Failed to toggle job status')
    }
  }

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      await updateAppStatusMut.mutateAsync({ id: appId, status: newStatus })
      if (viewingApp && viewingApp.id === appId) {
        setViewingApp((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      alert(err.message || 'Failed to update application status')
    }
  }

  const handleDeleteApplication = async (id) => {
    if (confirm('Are you sure you want to permanently delete this candidate application?')) {
      try {
        await deleteAppMut.mutateAsync(id)
        if (viewingApp && viewingApp.id === id) {
          setViewingApp(null)
        }
      } catch (err) {
        alert(err.message || 'Failed to delete job application')
      }
    }
  }

  const handleCopyJobLink = (slug, id) => {
    const fullUrl = `${window.location.origin}/careers/${slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedJobId(id)
    setTimeout(() => setCopiedJobId(null), 2000)
  }

  const handleExportApplications = () => {
    if (!appsList.length) return
    const headers = [
      'Candidate Name',
      'Job Title',
      'Department',
      'Email',
      'Phone',
      'Experience',
      'Current CTC',
      'Expected CTC',
      'Notice Period',
      'LinkedIn',
      'Portfolio',
      'Status',
      'Rating',
      'Applied Date',
      'Resume File Name',
      'Resume URL',
      'Cover Letter',
      'Recruiter Notes',
    ]
    const rows = appsList.map((app) => [
      app.fullName,
      app.jobPosting?.title || 'General Application',
      app.jobPosting?.department || 'General',
      app.email,
      app.phone,
      app.experience || '',
      app.currentCtc || '',
      app.expectedCtc || '',
      app.noticePeriod || '',
      app.linkedinUrl || '',
      app.portfolioUrl || '',
      app.status,
      app.rating || 0,
      new Date(app.createdAt).toLocaleDateString(),
      app.resumeFileName || '',
      app.resumeUrl,
      (app.coverLetter || '').replace(/\n/g, '  '),
      (app.adminNotes || '').replace(/\n/g, '  '),
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `SnapTech_Digital_Recruitment_Candidates_${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const jobsList = useMemo(() => jobsData?.data || [], [jobsData?.data])
  const appsList = useMemo(() => appsData?.data || [], [appsData?.data])

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobsList.filter((job) => {
      const matchesDept = !jobDeptFilter || job.department === jobDeptFilter
      const query = jobSearchQuery.toLowerCase().trim()
      const matchesQuery =
        !query ||
        job.title?.toLowerCase().includes(query) ||
        job.department?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.skills?.some((s) => s.toLowerCase().includes(query))
      return matchesDept && matchesQuery
    })
  }, [jobsList, jobDeptFilter, jobSearchQuery])

  // Metric stats
  const activePostingsCount = jobsList.filter((j) => j.isActive).length
  const totalOpeningsCount = jobsList
    .filter((j) => j.isActive)
    .reduce((acc, curr) => acc + (curr.openings || 1), 0)
  const newApplicationsCount = appsList.filter((a) => a.status === 'NEW').length
  const shortlistedCount = appsList.filter((a) => a.status === 'SHORTLISTED').length
  const hiredCount = appsList.filter((a) => a.status === 'HIRED').length

  const inputCls =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all placeholder-gray-400 bg-white'

  return (
    <>
      <SEO title="Recruitment & Careers Management — Admin Portal" noIndex />
      <div className="space-y-6">
        {/* Top Header & Fast Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Enterprise Talent Suite
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ATS Pipeline Active
              </span>
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-gray-900 tracking-tight">
              Careers &amp; Talent Recruitment
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Publish rich job roles with compensation &amp; tech stacks, review candidate resumes, and manage applicant workflows.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/careers"
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:text-brand-blue hover:bg-gray-50 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" /> Public Portal
            </Link>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Job Posting
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Roles</span>
              <Briefcase className="w-4 h-4 text-brand-blue" />
            </div>
            <p className="text-2xl font-black text-gray-900">{activePostingsCount}</p>
            <p className="text-[11px] text-gray-400">{totalOpeningsCount} total vacancies</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Resumes</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-black text-gray-900">{appsList.length}</p>
            <p className="text-[11px] text-gray-400">All applications</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">In Review (New)</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-blue-600">{newApplicationsCount}</p>
            <p className="text-[11px] text-gray-400">Awaiting screening</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Shortlisted</span>
              <UserCheck className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-600">{shortlistedCount}</p>
            <p className="text-[11px] text-gray-400">Moved to rounds</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Hired</span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600">{hiredCount}</p>
            <p className="text-[11px] text-gray-400">Offers accepted</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex overflow-x-auto border-b border-gray-200 min-w-0">
          <button
            onClick={() => setActiveTab('postings')}
            className={`py-3.5 px-6 text-sm font-bold border-b-2 -mb-0.5 transition-all cursor-pointer ${
              activeTab === 'postings'
                ? 'border-brand-blue text-brand-blue bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Job Postings ({jobsList.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3.5 px-6 text-sm font-bold border-b-2 -mb-0.5 transition-all cursor-pointer ${
              activeTab === 'applications'
                ? 'border-brand-blue text-brand-blue bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Candidate Applications ({appsList.length})
            </span>
          </button>
        </div>

        {/* ── TAB CONTENT: JOB POSTINGS ── */}
        {activeTab === 'postings' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex flex-wrap gap-3 items-center justify-between shadow-2xs">
              <div className="flex flex-wrap gap-3 items-center flex-1 min-w-70">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    placeholder="Search roles by title, skill, or location..."
                    className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <select
                  value={jobDeptFilter}
                  onChange={(e) => setJobDeptFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg text-xs font-semibold px-3 py-1.5 text-gray-600 focus:outline-none cursor-pointer bg-white"
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Product">Product</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="text-xs text-gray-400 font-medium">
                Showing {filteredJobs.length} of {jobsList.length} postings
              </div>
            </div>

            {/* Job Postings Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
              {jobsLoading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : jobsError ? (
                <div className="p-8 text-center text-red-500">Failed to load job postings.</div>
              ) : filteredJobs.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Briefcase className="w-10 h-10 text-gray-300 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-800">No Job Postings Found</h3>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Create a new job posting with rich fields or modify your search filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200">
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Role Title &amp; Slug
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Department &amp; Workplace
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Compensation &amp; Openings
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                          Applicants
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                          Status
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredJobs.map((job) => {
                        const appCount =
                          job._count?.applications !== undefined
                            ? job._count.applications
                            : appsList.filter((a) => a.jobPostingId === job.id).length
                        const wpType = job.workplaceType || 'On-site'

                        return (
                          <tr key={job.id} className="hover:bg-blue-50/20 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{job.title}</span>
                                {job.badge && (
                                  <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                    {job.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5 mt-0.5 select-all">
                                <span>/careers/{job.slug}</span>
                                <button
                                  onClick={() => handleCopyJobLink(job.slug, job.id)}
                                  className="text-gray-400 hover:text-brand-blue cursor-pointer"
                                  title="Copy URL"
                                >
                                  {copiedJobId === job.id ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </p>
                            </td>

                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-gray-700 text-xs">{job.department}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    WORKPLACE_COLORS[wpType] || 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {wpType}
                                </span>
                                <span className="text-[10px] text-gray-400 truncate max-w-30">
                                  {job.location}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <p className="text-xs font-bold text-gray-800">
                                {job.salaryRange || 'Competitive CTC'}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {job.openings || 1} vacancy &bull; {job.experienceRequired}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => {
                                  setJobFilter(job.id)
                                  setActiveTab('applications')
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 text-xs font-bold transition-all cursor-pointer"
                                title="View applications for this job"
                              >
                                <Users className="w-3 h-3" />
                                {appCount} {appCount === 1 ? 'Candidate' : 'Candidates'}
                              </button>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleToggleJobActive(job)}
                                className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                                  job.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                }`}
                              >
                                {job.isActive ? 'Active' : 'Draft'}
                              </button>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to={`/careers/${job.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-blue hover:bg-gray-50 transition-all cursor-pointer"
                                  title="View Public Page"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  onClick={() => handleOpenEditModal(job)}
                                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-blue hover:bg-brand-blue/5 transition-all cursor-pointer"
                                  title="Edit Role"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                {job.slug !== 'general-application' && (
                                  <button
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-red hover:bg-red-50 transition-all cursor-pointer"
                                    title="Delete Role"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: CANDIDATE APPLICATIONS (ATS) ── */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {/* ATS Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-center justify-between shadow-2xs">
              <div className="flex flex-wrap gap-3 items-center flex-1 min-w-70">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate name, email, phone, role..."
                    className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg text-xs font-semibold px-3 py-1.5 text-gray-600 focus:outline-none cursor-pointer bg-white"
                >
                  <option value="">All Job Positions</option>
                  {jobsList.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg text-xs font-semibold px-3 py-1.5 text-gray-600 focus:outline-none cursor-pointer bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="NEW">New Submissions</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="HIRED">Hired</option>
                </select>

                {(jobFilter || statusFilter || searchQuery) && (
                  <button
                    onClick={() => {
                      setJobFilter('')
                      setStatusFilter('')
                      setSearchQuery('')
                    }}
                    className="text-xs text-brand-blue hover:underline font-semibold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {appsList.length > 0 && (
                <button
                  onClick={handleExportApplications}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:shadow transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Export Talent CSV
                </button>
              )}
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
              {appsLoading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : appsError ? (
                <div className="p-8 text-center text-red-500">Failed to load applications.</div>
              ) : appsList.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Users className="w-10 h-10 text-gray-300 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-800">No applications found</h3>
                  <p className="text-xs text-gray-400">
                    No candidates match the current filter selection.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200">
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Candidate &amp; Experience
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Position Applied
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Contact Info &amp; Outreach
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Resume / CV File
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                          Stage
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {appsList.map((app) => (
                        <tr key={app.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{app.fullName}</span>
                              {app.rating > 0 && (
                                <span className="flex items-center text-[10px] text-amber-500 font-bold">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                                  {app.rating}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                              <span>Exp: {app.experience || 'Not specified'}</span>
                              {app.noticePeriod && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                  {app.noticePeriod}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              Applied: {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-800 text-xs">
                              {app.jobPosting?.title || 'General Application'}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                              {app.jobPosting?.department || 'General'}
                            </p>
                          </td>

                          <td className="py-3.5 px-4 space-y-1 text-xs text-gray-600">
                            <a
                              href={`mailto:${app.email}`}
                              className="flex items-center gap-1.5 hover:text-brand-blue"
                            >
                              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-37.5">{app.email}</span>
                            </a>
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <a href={`tel:${app.phone}`} className="hover:text-brand-blue">
                                {app.phone}
                              </a>
                              <a
                                href={getWhatsAppLink(
                                  app.fullName,
                                  app.jobPosting?.title || 'General Application',
                                  app.phone
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition-colors ml-1"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-600" />
                                WhatsApp
                              </a>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenViewModal(app, 'resume')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-brand-blue border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                title="Preview Live Resume Document"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Preview CV
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDownloadResume(app.id, app.fullName, app.resumeFileName)
                                }
                                disabled={downloadingId === app.id}
                                className="inline-flex items-center gap-1 p-1.5 text-xs font-bold text-gray-600 hover:text-brand-red hover:bg-red-50 rounded-lg border border-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                                title="Download CV File"
                              >
                                {downloadingId === app.id ? (
                                  <span className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenResumeInTab(app.id)}
                                className="p-1.5 text-xs font-bold text-gray-500 hover:text-brand-blue hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                                title="Open in New Tab"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {app.resumeFileName && (
                              <span className="text-[10px] text-gray-400 block mt-1 truncate max-w-37.5">
                                {app.resumeFileName}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                              className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${
                                STATUS_COLORS[app.status] || 'bg-gray-50 text-gray-700'
                              }`}
                            >
                              <option value="NEW">New</option>
                              <option value="SHORTLISTED">Shortlisted</option>
                              <option value="REJECTED">Rejected</option>
                              <option value="HIRED">Hired</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenViewModal(app, 'profile')}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-brand-blue hover:bg-blue-50 transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                                title="View Candidate Profile & Dossier"
                              >
                                <Eye className="w-3.5 h-3.5" /> Details
                              </button>
                              {admin?.role === 'SUPER_ADMIN' && (
                                <button
                                  onClick={() => handleDeleteApplication(app.id)}
                                  className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer"
                                  title="Delete Application"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT JOB POSTING MODAL (BIG-COMPANY ATS STANDARD) ── */}
        {editingJob && (
          <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/70">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                    Job Specifications
                  </span>
                  <h3 className="font-heading text-lg font-bold text-gray-900 mt-0.5">
                    {editingJob.id ? 'Edit Job Posting' : 'Create New Job Posting'}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingJob(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Tab Navigator */}
              <div className="flex border-b border-gray-200 px-5 bg-white gap-4">
                <button
                  type="button"
                  onClick={() => setActiveJobModalTab('basic')}
                  className={`py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeJobModalTab === 'basic'
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  1. Role Basics &amp; Location
                </button>
                <button
                  type="button"
                  onClick={() => setActiveJobModalTab('comp')}
                  className={`py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeJobModalTab === 'comp'
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  2. Compensation &amp; Priority
                </button>
                <button
                  type="button"
                  onClick={() => setActiveJobModalTab('details')}
                  className={`py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeJobModalTab === 'details'
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  3. Description &amp; Responsibilities
                </button>
                <button
                  type="button"
                  onClick={() => setActiveJobModalTab('skills')}
                  className={`py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeJobModalTab === 'skills'
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  4. Skills, Perks &amp; Hiring Process
                </button>
              </div>

              {/* Modal Form Body */}
              <form
                onSubmit={handleSubmit(onJobSubmit)}
                className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4"
              >
                {/* TAB 1: Role Basics */}
                {activeJobModalTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Role Title *
                        </label>
                        <input
                          {...register('title', { required: true })}
                          className={inputCls}
                          placeholder="e.g. Senior Full Stack Engineer"
                        />
                        {errors.title && (
                          <p className="text-[10px] text-red-500 mt-1">Title is required</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          URL Slug * (auto-generated)
                        </label>
                        <input
                          {...register('slug', { required: true })}
                          className={inputCls}
                          placeholder="e.g. senior-full-stack-engineer"
                        />
                        {errors.slug && (
                          <p className="text-[10px] text-red-500 mt-1">Slug is required</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Department *
                        </label>
                        <select {...register('department')} className={inputCls}>
                          <option value="Engineering">Engineering</option>
                          <option value="Design">Design</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Product">Product</option>
                          <option value="Operations">Operations</option>
                          <option value="Client Success">Client Success</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Workplace Model *
                        </label>
                        <select {...register('workplaceType')} className={inputCls}>
                          <option value="On-site">On-site</option>
                          <option value="Hybrid">Hybrid (Remote + On-site)</option>
                          <option value="Remote">100% Remote</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Job Type *
                        </label>
                        <select {...register('jobType')} className={inputCls}>
                          <option value="FULL_TIME">Full Time</option>
                          <option value="PART_TIME">Part Time</option>
                          <option value="INTERNSHIP">Internship</option>
                          <option value="CONTRACT">Contract</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Office / Base Location *
                        </label>
                        <input
                          {...register('location', { required: true })}
                          className={inputCls}
                          placeholder="e.g. Bhilwara (Headquarters) or Remote - India"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Openings / Vacancies *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          {...register('openings')}
                          className={inputCls}
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Experience Required *
                      </label>
                      <input
                        {...register('experienceRequired', { required: true })}
                        className={inputCls}
                        placeholder="e.g. 2–4 Years or Freshers Welcome"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: Compensation & Priority */}
                {activeJobModalTab === 'comp' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Compensation / Salary Range (Annual CTC)
                        </label>
                        <input
                          {...register('salaryRange')}
                          className={inputCls}
                          placeholder="e.g. ₹8,00,000 – ₹14,00,000 LPA"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Leave blank or toggle off to show &apos;Competitive CTC&apos; publicly.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Priority / Role Badge
                        </label>
                        <select {...register('badge')} className={inputCls}>
                          <option value="Actively Hiring">Actively Hiring</option>
                          <option value="Urgent">Urgent Requirement</option>
                          <option value="Featured">Featured Role</option>
                          <option value="Hot Job">Hot Job</option>
                          <option value="New">New Vacancy</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Application Deadline (Optional)
                        </label>
                        <input type="date" {...register('deadline')} className={inputCls} />
                      </div>

                      <div className="flex flex-col justify-center pt-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="showSalaryToggle"
                            {...register('showSalary')}
                            className="w-4 h-4 text-brand-blue cursor-pointer"
                          />
                          <label
                            htmlFor="showSalaryToggle"
                            className="text-xs font-semibold text-gray-700 cursor-pointer"
                          >
                            Show Salary Range Publicly on Careers Page
                          </label>
                        </div>
                        <p className="text-[10px] text-gray-400 ml-6">
                          If unchecked, candidate sees &apos;Competitive + Performance Bonuses&apos;.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Description & Responsibilities */}
                {activeJobModalTab === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Role Overview &amp; Impact Description *
                      </label>
                      <textarea
                        rows={3}
                        {...register('description', { required: true })}
                        className={`${inputCls} resize-none`}
                        placeholder="Comprehensive overview of the role and what the team accomplishes..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Key Responsibilities <span className="text-gray-400 font-normal">(one per line)</span>
                      </label>
                      <textarea
                        rows={4}
                        {...register('responsibilities')}
                        className={`${inputCls} resize-none font-mono text-xs`}
                        placeholder={
                          'Architect modular React and Node.js solutions\nOptimize PostgreSQL relational queries for high concurrency\nLead code reviews and maintain clean Git branches'
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Qualifications &amp; Ideal Capabilities{' '}
                        <span className="text-gray-400 font-normal">(one per line)</span>
                      </label>
                      <textarea
                        rows={4}
                        {...register('requirements')}
                        className={`${inputCls} resize-none font-mono text-xs`}
                        placeholder={
                          '3+ years of commercial JavaScript/TypeScript experience\nStrong knowledge of Docker, CI/CD, and REST architecture\nExcellent analytical and debugging skills'
                        }
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: Skills, Perks & Process */}
                {activeJobModalTab === 'skills' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Core Tech Stack &amp; Skills{' '}
                        <span className="text-gray-400 font-normal">(comma-separated)</span>
                      </label>
                      <input
                        {...register('skills')}
                        className={inputCls}
                        placeholder="React 19, Node.js, Express, PostgreSQL, TailwindCSS, Docker, Git"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Company Perks &amp; Benefits{' '}
                        <span className="text-gray-400 font-normal">(one per line)</span>
                      </label>
                      <textarea
                        rows={3}
                        {...register('perks')}
                        className={`${inputCls} resize-none font-mono text-xs`}
                        placeholder={
                          'Modern M-Series Workstation\nFlexible Working Hours\nHealth & Wellness Protection\nAnnual Performance Bonus'
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Hiring Process Roadmap Steps{' '}
                        <span className="text-gray-400 font-normal">(one per line)</span>
                      </label>
                      <textarea
                        rows={3}
                        {...register('hiringSteps')}
                        className={`${inputCls} resize-none font-mono text-xs`}
                        placeholder={
                          'Round 1: Application Screening (20m)\nRound 2: Technical Architecture & Code (60m)\nRound 3: System Design & Culture (45m)\nRound 4: Management Offer & Onboarding'
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <input
                        type="checkbox"
                        id="jobActiveToggle"
                        {...register('isActive')}
                        className="w-4 h-4 text-brand-blue cursor-pointer"
                      />
                      <label
                        htmlFor="jobActiveToggle"
                        className="text-xs font-semibold text-gray-700 cursor-pointer"
                      >
                        Publish Active (Immediately visible on public careers portal)
                      </label>
                    </div>
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span>Tab {activeJobModalTab === 'basic' ? '1' : activeJobModalTab === 'comp' ? '2' : activeJobModalTab === 'details' ? '3' : '4'} of 4</span>
                  </div>

                  <div className="flex gap-2.5">
                    {activeJobModalTab !== 'basic' && (
                      <button
                        type="button"
                        onClick={() => {
                          const tabs = ['basic', 'comp', 'details', 'skills']
                          const idx = tabs.indexOf(activeJobModalTab)
                          if (idx > 0) setActiveJobModalTab(tabs[idx - 1])
                        }}
                        className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Previous Step
                      </button>
                    )}

                    {activeJobModalTab !== 'skills' ? (
                      <button
                        type="button"
                        onClick={() => {
                          const tabs = ['basic', 'comp', 'details', 'skills']
                          const idx = tabs.indexOf(activeJobModalTab)
                          if (idx < tabs.length - 1) setActiveJobModalTab(tabs[idx + 1])
                        }}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Next Step &rarr;
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={createJobMut.isPending || updateJobMut.isPending}
                        className="px-5 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-brand-blue/90 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                      >
                        Save &amp; Publish Job Posting
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── CANDIDATE DOSSIER & RESUME MODAL (FULL ATS EXPERIENCE) ── */}
        {viewingApp && (
          <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
            <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Top Header */}
              <div className="bg-slate-50 p-4 sm:p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        STATUS_COLORS[viewingApp.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {viewingApp.status}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500">
                      Applied: {new Date(viewingApp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-gray-900">
                    {viewingApp.fullName}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span>Role:</span>
                    <span className="font-semibold text-gray-800">
                      {viewingApp.jobPosting?.title || 'General Application'}
                    </span>
                    <span>&bull;</span>
                    <span>{viewingApp.jobPosting?.department || 'General'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadResume(
                        viewingApp.id,
                        viewingApp.fullName,
                        viewingApp.resumeFileName
                      )
                    }
                    disabled={downloadingId === viewingApp.id}
                    className="flex items-center gap-1.5 bg-brand-red text-white hover:bg-red-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    {downloadingId === viewingApp.id ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    Download CV
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenResumeInTab(viewingApp.id)}
                    className="flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Tab
                  </button>

                  <button
                    onClick={handleCloseViewModal}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer ml-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Tabs Bar */}
              <div className="flex border-b border-gray-200 px-5 bg-white gap-5">
                <button
                  type="button"
                  onClick={() => setActiveModalTab('resume')}
                  className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeModalTab === 'resume'
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-gray-400 hover:text-gray-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Live Resume Document
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab('profile')}
                  className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeModalTab === 'profile'
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-gray-400 hover:text-gray-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Candidate Profile &amp; Cover Note
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab('evaluation')}
                  className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeModalTab === 'evaluation'
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-gray-400 hover:text-gray-800'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" /> Evaluation Notes &amp; WhatsApp
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                {/* ── TAB 1: RESUME VIEWER ── */}
                {activeModalTab === 'resume' && (() => {
                  const isDocx =
                    viewingApp.resumeFileName?.toLowerCase().endsWith('.docx') ||
                    viewingApp.resumeFileName?.toLowerCase().endsWith('.doc') ||
                    viewingApp.resumeFileType?.includes('word') ||
                    viewingApp.resumeFileType?.includes('officedocument')

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-200 shadow-2xs">
                        <div className="flex items-center gap-2.5 truncate">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isDocx ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {isDocx ? 'DOC' : 'PDF'}
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-gray-900 block truncate">
                              {viewingApp.resumeFileName || `Resume_${viewingApp.fullName}.pdf`}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {isDocx ? 'Microsoft Word Document' : 'Adobe Acrobat PDF Document'}
                              {viewingApp.resumeFileSize
                                ? ` • ${Math.round(viewingApp.resumeFileSize / 1024)} KB`
                                : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadResume(
                                viewingApp.id,
                                viewingApp.fullName,
                                viewingApp.resumeFileName
                              )
                            }
                            disabled={downloadingId === viewingApp.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-red text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenResumeInTab(viewingApp.id, viewingApp.resumeFileName)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Open Tab
                          </button>
                        </div>
                      </div>

                      {previewLoading ? (
                        <div className="h-120 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                          <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin mb-3" />
                          <p className="text-xs font-semibold text-gray-500">
                            Loading candidate resume document...
                          </p>
                        </div>
                      ) : previewError ? (
                        <div className="h-80 flex flex-col items-center justify-center bg-red-50/50 rounded-xl border border-red-200 p-6 text-center">
                          <AlertCircle className="w-8 h-8 text-brand-red mb-2" />
                          <p className="text-sm font-bold text-gray-800">Resume Preview Notice</p>
                          <p className="text-xs text-gray-500 mt-1 max-w-md">{previewError}</p>
                          <div className="flex gap-2 mt-4">
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadResume(
                                  viewingApp.id,
                                  viewingApp.fullName,
                                  viewingApp.resumeFileName
                                )
                              }
                              className="inline-flex items-center gap-1.5 bg-brand-red text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Candidate File Directly
                            </button>
                          </div>
                        </div>
                      ) : isDocx ? (
                        <div className="p-8 bg-blue-50/50 border border-blue-200 rounded-2xl text-center space-y-4">
                          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-brand-blue flex items-center justify-center mx-auto shadow-inner">
                            <FileText className="w-8 h-8" />
                          </div>
                          <div className="max-w-md mx-auto">
                            <h4 className="font-heading font-bold text-base text-gray-900">
                              Microsoft Word Document Submitted
                            </h4>
                            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                              This candidate uploaded a native Word document (.docx/.doc). Web browsers render PDFs directly, while Word documents can be viewed or edited directly by downloading or opening in Word.
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadResume(
                                  viewingApp.id,
                                  viewingApp.fullName,
                                  viewingApp.resumeFileName
                                )
                              }
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 shadow-sm transition-all cursor-pointer"
                            >
                              <Download className="w-4 h-4" /> Download Original Word File (
                              {Math.round((viewingApp.resumeFileSize || 0) / 1024)} KB)
                            </button>
                          </div>
                        </div>
                      ) : previewBlobUrl ? (
                        <div className="space-y-2">
                          <div className="rounded-xl overflow-hidden border border-gray-300 bg-slate-900 shadow-inner">
                            <iframe
                              src={previewBlobUrl}
                              className="w-full h-130 bg-white border-0"
                              title={`Resume - ${viewingApp.fullName}`}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                            <span>Showing original candidate uploaded PDF</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenResumeInTab(viewingApp.id, viewingApp.resumeFileName)
                              }
                              className="text-brand-blue hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" /> Open in full browser tab
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })()}

                {/* ── TAB 2: CANDIDATE PROFILE & DETAILS ── */}
                {activeModalTab === 'profile' && (
                  <div className="space-y-5">
                    {/* Candidate Specs Grid */}
                    <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-4.5 space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Structured Candidate Metrics
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <span className="text-[11px] text-gray-400 block">Experience</span>
                          <span className="text-xs font-bold text-gray-800">
                            {viewingApp.experience || 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-gray-400 block">Notice Period</span>
                          <span className="text-xs font-bold text-gray-800">
                            {viewingApp.noticePeriod || 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-gray-400 block">Current CTC</span>
                          <span className="text-xs font-bold text-gray-800">
                            {viewingApp.currentCtc || 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-gray-400 block">Expected CTC</span>
                          <span className="text-xs font-bold text-gray-800">
                            {viewingApp.expectedCtc || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                          Contact Coordinates
                        </span>
                        <div className="space-y-1.5 text-xs text-gray-700">
                          <p className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-brand-blue" />
                            <a
                              href={`mailto:${viewingApp.email}`}
                              className="font-semibold text-brand-blue hover:underline"
                            >
                              {viewingApp.email}
                            </a>
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-brand-blue" />
                            <a href={`tel:${viewingApp.phone}`} className="font-semibold">
                              {viewingApp.phone}
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                          Online Profiles &amp; Portfolio
                        </span>
                        <div className="space-y-1.5 text-xs">
                          {viewingApp.linkedinUrl ? (
                            <a
                              href={viewingApp.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-brand-blue font-semibold hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> LinkedIn Profile
                            </a>
                          ) : (
                            <span className="text-gray-400">No LinkedIn provided</span>
                          )}

                          {viewingApp.portfolioUrl ? (
                            <a
                              href={viewingApp.portfolioUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-purple-600 font-semibold hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Portfolio / GitHub
                            </a>
                          ) : (
                            <span className="text-gray-400 block">No Portfolio link provided</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Candidate Cover Letter / Note to Team
                      </span>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {viewingApp.coverLetter || 'No cover letter was submitted by this candidate.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: EVALUATION & OUTREACH ── */}
                {activeModalTab === 'evaluation' && (
                  <div className="space-y-5">
                    {/* Rating & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                          Candidate Evaluation Rating
                        </span>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEvalRating(star)}
                              className="p-1 cursor-pointer transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= evalRating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-bold text-gray-600 ml-2">
                            {evalRating > 0 ? `${evalRating} / 5 Stars` : 'Unrated'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                          Pipeline Stage
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          {['NEW', 'SHORTLISTED', 'REJECTED', 'HIRED'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleUpdateAppStatus(viewingApp.id, st)}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                                viewingApp.status === st
                                  ? 'bg-brand-blue text-white border-brand-blue'
                                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Recruiter &amp; Technical Interview Notes
                        </span>
                        <button
                          type="button"
                          onClick={handleSaveNotes}
                          disabled={isSavingNotes}
                          className="bg-brand-blue text-white hover:bg-brand-blue/90 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isSavingNotes ? 'Saving...' : 'Save Evaluation Notes'}
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={evalNotes}
                        onChange={(e) => setEvalNotes(e.target.value)}
                        placeholder="Write interviewer feedback, salary expectations, technical score, or follow-up milestones here..."
                        className={`${inputCls} resize-none font-mono text-xs`}
                      />
                    </div>

                    {/* 1-Click WhatsApp Outreach Templates */}
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <h5 className="text-xs font-bold text-emerald-900">
                          1-Click WhatsApp Candidate Outreach
                        </h5>
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        Clicking any template launches WhatsApp directly with pre-formatted professional message:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <a
                          href={getWhatsAppLink(
                            viewingApp.fullName,
                            viewingApp.jobPosting?.title || 'Open Role',
                            viewingApp.phone,
                            `Hello ${viewingApp.fullName},\n\nThis is from SnapTech Digital HR. We have shortlisted your application for "${viewingApp.jobPosting?.title}". We would like to invite you for a 30-minute technical interview this week. Please let us know your availability.`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100/50 transition-colors text-left group"
                        >
                          <span className="text-xs font-bold text-gray-800 block group-hover:text-emerald-700">
                            1. Interview Invite
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            Propose technical interview slot
                          </span>
                        </a>

                        <a
                          href={getWhatsAppLink(
                            viewingApp.fullName,
                            viewingApp.jobPosting?.title || 'Open Role',
                            viewingApp.phone,
                            `Hello ${viewingApp.fullName},\n\nThank you for applying for "${viewingApp.jobPosting?.title}" at SnapTech Digital. Could you please share your updated portfolio links and confirm your current notice period?`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100/50 transition-colors text-left group"
                        >
                          <span className="text-xs font-bold text-gray-800 block group-hover:text-emerald-700">
                            2. Request Info
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            Ask for notice period &amp; portfolio
                          </span>
                        </a>

                        <a
                          href={getWhatsAppLink(
                            viewingApp.fullName,
                            viewingApp.jobPosting?.title || 'Open Role',
                            viewingApp.phone,
                            `Hello ${viewingApp.fullName},\n\nWe are pleased to inform you that our leadership team was very impressed with your interviews for "${viewingApp.jobPosting?.title}". We would like to discuss the formal offer details with you today.`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100/50 transition-colors text-left group"
                        >
                          <span className="text-xs font-bold text-gray-800 block group-hover:text-emerald-700">
                            3. Offer Discussion
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            Congratulate &amp; roll out offer
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

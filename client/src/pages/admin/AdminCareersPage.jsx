import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useOutletContext } from 'react-router-dom'
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  FileText,
  Download,
  Eye,
  UserCheck,
  Users,
  Mail,
  Phone,
  ChevronRight,
  Filter,
  AlertCircle,
  MessageCircle,
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

const JOB_TYPE_LABELS = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
}

const STATUS_COLORS = {
  NEW: 'bg-blue-50 text-blue-700 border-blue-200',
  SHORTLISTED: 'bg-purple-50 text-purple-700 border-purple-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  HIRED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const getWhatsAppLink = (fullName, jobTitle, rawPhone) => {
  if (!rawPhone) return '#'
  let cleaned = rawPhone.replace(/[^0-9]/g, '')
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned
  }
  const text = encodeURIComponent(
    `Hello ${fullName},\n\nThis is from SnapTech Digital. We reviewed your application for the "${jobTitle}" position. We would like to connect with you regarding the next steps.`
  )
  return `https://wa.me/${cleaned}?text=${text}`
}

export default function AdminCareersPage() {
  const [activeTab, setActiveTab] = useState('postings') // 'postings' | 'applications'
  const [editingJob, setEditingJob] = useState(null) // null | job object (empty object for create)
  const [viewingApp, setViewingApp] = useState(null) // null | application object

  // Applications Filters
  const [jobFilter, setJobFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

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
    formState: { errors },
  } = useForm()

  const handleOpenCreateModal = () => {
    reset({
      title: '',
      slug: '',
      department: '',
      location: '',
      jobType: 'FULL_TIME',
      experienceRequired: '',
      description: '',
      responsibilities: '',
      requirements: '',
      isActive: true,
    })
    setEditingJob({})
  }

  const handleOpenEditModal = (job) => {
    reset({
      title: job.title,
      slug: job.slug,
      department: job.department,
      location: job.location,
      jobType: job.jobType,
      experienceRequired: job.experienceRequired,
      description: job.description,
      responsibilities: job.responsibilities ? job.responsibilities.join('\n') : '',
      requirements: job.requirements ? job.requirements.join('\n') : '',
      isActive: job.isActive,
    })
    setEditingJob(job)
  }

  const onJobSubmit = async (data) => {
    const payload = {
      ...data,
      responsibilities: data.responsibilities
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      requirements: data.requirements
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
        'Are you sure you want to delete this job posting? This will delete all applications submitted for this role.'
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
    if (confirm('Are you sure you want to delete this job application permanently?')) {
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

  const handleExportApplications = () => {
    if (!appsList.length) return
    const headers = [
      'Candidate Name',
      'Job Title',
      'Department',
      'Email',
      'Phone',
      'Status',
      'Applied Date',
      'Resume URL',
      'Cover Letter',
    ]
    const rows = appsList.map((app) => [
      app.fullName,
      app.jobPosting?.title || 'General Application',
      app.jobPosting?.department || 'General',
      app.email,
      app.phone,
      app.status,
      new Date(app.createdAt).toLocaleDateString(),
      app.resumeUrl,
      (app.coverLetter || '').replace(/\n/g, '  '),
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `Hindustan_Projects_Job_Applications_${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const jobsList = jobsData?.data || []
  const appsList = appsData?.data || []

  const inputCls =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all placeholder-gray-400'

  return (
    <>
      <SEO title="Manage Careers" noIndex />
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Careers Management</h1>
            <p className="text-sm text-gray-500">
              Post open roles, manage job descriptions, and track applicant files.
            </p>
          </div>
          {activeTab === 'postings' && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Job Posting
            </button>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex overflow-x-auto border-b border-gray-200 min-w-0">
          <button
            onClick={() => setActiveTab('postings')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 -mb-[2px] transition-all cursor-pointer ${
              activeTab === 'postings'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Job Postings ({jobsList.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 -mb-[2px] transition-all cursor-pointer ${
              activeTab === 'applications'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Applications ({appsList.length})
            </span>
          </button>
        </div>

        {/* ── TAB CONTENT: JOB POSTINGS ── */}
        {activeTab === 'postings' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {jobsLoading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : jobsError ? (
              <div className="p-8 text-center text-red-500">
                Failed to load job postings. Verify database connection.
              </div>
            ) : jobsList.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Briefcase className="w-10 h-10 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-gray-800">No Job Postings Yet</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Create a new posting and toggle active to display it on the public careers page.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Role Info
                      </th>
                      <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Department
                      </th>
                      <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Location
                      </th>
                      <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Job Type
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
                    {jobsList.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-800">{job.title}</p>
                          <p className="text-[10px] text-gray-400 font-mono select-all">
                            /{job.slug}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 font-medium">{job.department}</td>
                        <td className="py-3.5 px-4 text-gray-500">{job.location}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                            {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleToggleJobActive(job)}
                              className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                                job.isActive
                                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                  : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                              }`}
                            >
                              {job.isActive ? 'Active' : 'Draft'}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(job)}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-blue hover:bg-brand-blue/5 transition-all cursor-pointer"
                              title="Edit Posting"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {job.slug !== 'general-application' && (
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-red hover:bg-red-50 transition-all cursor-pointer"
                                title="Delete Posting"
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
        )}

        {/* ── TAB CONTENT: APPLICATIONS ── */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {/* Filters panel */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Filters:
                </span>
                <div>
                  <select
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg text-xs font-semibold px-3 py-1.5 text-gray-600 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Job Postings</option>
                    {jobsList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg text-xs font-semibold px-3 py-1.5 text-gray-600 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="NEW">New</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="HIRED">Hired</option>
                  </select>
                </div>
              </div>

              {appsList.length > 0 && (
                <button
                  onClick={handleExportApplications}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:shadow transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Export to CSV
                </button>
              )}
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
                    Modify filters or promote open roles to receive resumes.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Job Title
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Candidate
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Contact Info
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Resume
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {appsList.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-800">
                              {app.jobPosting?.title || 'General App'}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                              {app.jobPosting?.department || 'General'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-gray-800 block">
                              {app.fullName}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Applied: {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 space-y-0.5 text-xs text-gray-500">
                            <p className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 shrink-0" /> {app.email}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 shrink-0" /> {app.phone}
                              <a
                                href={getWhatsAppLink(
                                  app.fullName,
                                  app.jobPosting?.title || 'General App',
                                  app.phone
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-1 py-0.5 rounded border border-emerald-200 transition-colors ml-1"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-600" />{' '}
                                WA
                              </a>
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-brand-red border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-3 h-3" /> CV
                            </a>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                              className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-full border focus:outline-none cursor-pointer ${STATUS_COLORS[app.status]}`}
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
                                onClick={() => setViewingApp(app)}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-blue hover:bg-brand-blue/5 transition-all cursor-pointer inline-flex items-center gap-1"
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

        {/* ── CREATE / EDIT JOB MODAL ── */}
        {editingJob && (
          <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="font-heading text-lg font-bold text-gray-900">
                  {editingJob.id ? 'Edit Job Posting' : 'Create Job Posting'}
                </h3>
                <button
                  onClick={() => setEditingJob(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form
                onSubmit={handleSubmit(onJobSubmit)}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Job Title *
                    </label>
                    <input
                      {...register('title', { required: true })}
                      className={inputCls}
                      placeholder="e.g. Node.js Developer"
                    />
                    {errors.title && (
                      <p className="text-[10px] text-red-500 mt-1">Title is required</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Slug * (lowercase-hyphens)
                    </label>
                    <input
                      {...register('slug', { required: true })}
                      className={inputCls}
                      placeholder="e.g. node-developer"
                    />
                    {errors.slug && (
                      <p className="text-[10px] text-red-500 mt-1">Slug is required</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Department *
                    </label>
                    <input
                      {...register('department', { required: true })}
                      className={inputCls}
                      placeholder="e.g. Engineering"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Location *
                    </label>
                    <input
                      {...register('location', { required: true })}
                      className={inputCls}
                      placeholder="e.g. Bhilwara (On-site) or Remote"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Job Type *
                    </label>
                    <select
                      {...register('jobType')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="CONTRACT">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Experience Required *
                    </label>
                    <input
                      {...register('experienceRequired', { required: true })}
                      className={inputCls}
                      placeholder="e.g. 1–3 Years"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Role Description *
                  </label>
                  <textarea
                    rows={3}
                    {...register('description', { required: true })}
                    className={`${inputCls} resize-none`}
                    placeholder="Overview of the vacancy..."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Key Responsibilities{' '}
                    <span className="text-gray-400 font-normal">(one per line)</span>
                  </label>
                  <textarea
                    rows={4}
                    {...register('responsibilities')}
                    className={`${inputCls} resize-none font-mono text-xs`}
                    placeholder={'Implement API routes\nCollaborate with designer'}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Requirements / Skills{' '}
                    <span className="text-gray-400 font-normal">(one per line)</span>
                  </label>
                  <textarea
                    rows={4}
                    {...register('requirements')}
                    className={`${inputCls} resize-none font-mono text-xs`}
                    placeholder={'Strong Node.js knowledge\nFamiliar with Git'}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="jobActive"
                    {...register('isActive')}
                    className="w-4 h-4 text-brand-blue cursor-pointer"
                  />
                  <label
                    htmlFor="jobActive"
                    className="text-xs font-semibold text-gray-600 cursor-pointer"
                  >
                    Active Posting (Visible on website)
                  </label>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createJobMut.isPending || updateJobMut.isPending}
                    className="px-5 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-brand-blue/90 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                  >
                    Save Job Posting
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── APPLICANT DETAILS OVERLAY MODAL ── */}
        {viewingApp && (
          <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-gray-50 p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_COLORS[viewingApp.status]}`}
                  >
                    {viewingApp.status}
                  </span>
                  <h3 className="font-heading text-base font-bold text-gray-900 mt-1.5">
                    Application Details
                  </h3>
                </div>
                <button
                  onClick={() => setViewingApp(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
                {/* Job Info */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      Position Applied
                    </span>
                    <h4 className="font-bold text-gray-800 text-sm mt-0.5">
                      {viewingApp.jobPosting?.title || 'General Application'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {viewingApp.jobPosting?.department || 'General'}
                    </p>
                  </div>
                  <a
                    href={viewingApp.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-brand-red text-white hover:bg-brand-red-dark text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> View Resume
                  </a>
                </div>

                {/* Candidate Info */}
                <div className="space-y-3.5">
                  <h5 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Candidate Profile
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-400 block">Full Name</span>
                      <span className="text-sm font-bold text-gray-800">{viewingApp.fullName}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Applied Date</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {new Date(viewingApp.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-400 block">Email Address</span>
                      <a
                        href={`mailto:${viewingApp.email}`}
                        className="text-sm font-semibold text-brand-blue hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5" /> {viewingApp.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Phone / WhatsApp</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`tel:${viewingApp.phone}`}
                          className="text-sm font-semibold text-gray-700 hover:text-brand-blue flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" /> {viewingApp.phone}
                        </a>
                        <a
                          href={getWhatsAppLink(
                            viewingApp.fullName,
                            viewingApp.jobPosting?.title || 'General App',
                            viewingApp.phone
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-755 hover:bg-emerald-100 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3 fill-emerald-500 text-emerald-600" />{' '}
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="space-y-2">
                  <h5 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Cover Letter / Notes
                  </h5>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-600 leading-relaxed max-h-[150px] overflow-y-auto whitespace-pre-wrap">
                    {viewingApp.coverLetter || 'No cover letter provided by the candidate.'}
                  </div>
                </div>

                {/* Quick Status Update */}
                <div className="border-t border-gray-100 pt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-gray-500">Update Status:</span>
                  <div className="flex gap-1">
                    {['NEW', 'SHORTLISTED', 'REJECTED', 'HIRED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateAppStatus(viewingApp.id, st)}
                        className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                          viewingApp.status === st
                            ? 'bg-brand-blue text-white border-brand-blue'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

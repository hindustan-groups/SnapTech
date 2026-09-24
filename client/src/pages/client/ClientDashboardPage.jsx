/**
 * ClientDashboardPage.jsx — Client Portal Dashboard Overview
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderKanban,
  Clock,
  CheckCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  MessageCircle,
  Star,
  TicketCheck,
  Bell,
  Wallet,
  CalendarClock,
} from 'lucide-react'
import { useClientProjects, useClientSubmitFeedback, useClientDashboardStats, useClientMe } from '@/hooks/useClientPortal'
import { useSiteSettings } from '@/hooks/useContent'

const STATUS_COLORS = {
  PLANNING: 'bg-white/5 text-slate-300 border-white/10',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  REVIEW: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ON_HOLD: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const STATUS_LABELS = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
}

function StatCardSkeleton() {
  return (
    <div className="bg-slate-900/70 border border-white/10 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-xl flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-2xl bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/5 rounded w-2/3" />
        <div className="h-6 bg-white/5 rounded w-1/3" />
      </div>
    </div>
  )
}

export default function ClientDashboardPage() {
  const { data: clientMe } = useClientMe()
  const { data: projects = [], isLoading: projectsLoading } = useClientProjects()
  const { data: statsData, isLoading: statsLoading } = useClientDashboardStats()
  const { data: settingsData } = useSiteSettings()

  const [selectedProjectFeedback, setSelectedProjectFeedback] = useState(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [clientRole, setClientRole] = useState('')
  const [clientCompany, setClientCompany] = useState('')

  const submitFeedbackMutation = useClientSubmitFeedback()

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (!feedbackText.trim()) return

    try {
      await submitFeedbackMutation.mutateAsync({
        projectId: selectedProjectFeedback.id,
        rating: feedbackRating,
        text: feedbackText,
        role: clientRole,
        companyName: clientCompany,
      })
      setSelectedProjectFeedback(null)
      setFeedbackText('')
      setFeedbackRating(5)
      setClientRole('')
      setClientCompany('')
    } catch (_err) {
      // Handled by feedbackMutation error state
    }
  }

  if (projectsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const s = statsData?.data || {}

  // Format currency
  const formatCurrency = (amount) =>
    amount != null
      ? `₹${amount.toLocaleString('en-IN')}`
      : '—'

  // Format date
  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—'

  const stats = [
    {
      id: 'active-projects',
      label: 'Active Projects',
      value: statsLoading ? '…' : s.activeProjects ?? 0,
      icon: FolderKanban,
      color: 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20',
      accent: 'border-white/10 hover:border-brand-cyan/40',
      link: null,
      subtext: null,
    },
    {
      id: 'completed-projects',
      label: 'Completed Projects',
      value: statsLoading ? '…' : s.completedProjects ?? 0,
      icon: CheckCircle,
      color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      accent: 'border-white/10 hover:border-emerald-500/40',
      link: null,
      subtext: null,
    },
    {
      id: 'overall-progress',
      label: 'Overall Progress',
      value: statsLoading ? '…' : `${s.overallProgress ?? 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      accent: 'border-white/10 hover:border-purple-500/40',
      link: null,
      subtext: 'Across all active milestones',
    },
    {
      id: 'open-tickets',
      label: 'Open Support Tickets',
      value: statsLoading ? '…' : s.openTickets ?? 0,
      icon: TicketCheck,
      color: s.openTickets > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-slate-400 border border-white/10',
      accent: s.openTickets > 0 ? 'border-amber-500/30 hover:border-amber-500/60' : 'border-white/10',
      link: '/client/support',
      subtext: s.unreadReplies > 0 ? `${s.unreadReplies} unread ${s.unreadReplies === 1 ? 'reply' : 'replies'}` : null,
      subIcon: Bell,
      subIconColor: 'text-brand-cyan',
    },
    {
      id: 'next-payment',
      label: 'Next Payment Due',
      value: statsLoading ? '…' : formatCurrency(s.pendingMilestoneAmount),
      icon: Wallet,
      color: s.pendingMilestoneAmount != null ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white/5 text-slate-400 border border-white/10',
      accent: s.pendingMilestoneAmount != null ? 'border-rose-500/30 hover:border-rose-500/60' : 'border-white/10',
      link: '/client/billing',
      subtext: s.nextMilestoneTitle ? `Milestone: ${s.nextMilestoneTitle}` : null,
    },
    {
      id: 'payment-due-date',
      label: 'Payment Deadline',
      value: statsLoading ? '…' : formatDate(s.nextMilestoneDue),
      icon: CalendarClock,
      color: s.nextMilestoneDue != null ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-slate-400 border border-white/10',
      accent: s.nextMilestoneDue != null ? 'border-blue-500/30 hover:border-blue-500/60' : 'border-white/10',
      link: '/client/billing',
      subtext: null,
    },
  ]

  const cfg = settingsData?.data || {}
  const rawPhone = cfg.phone || '+91 75970 00601'
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hi%20SnapTech%20Team`

  const clientName = clientMe?.name || localStorage.getItem('hp_client_name') || 'Valued Client'

  return (
    <div className="space-y-8 text-white">
      {/* Personalized Welcome Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 bg-linear-to-r from-blue-950/60 via-slate-900/80 to-cyan-950/60 border border-brand-cyan/30 text-white shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold px-3.5 py-1 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-full backdrop-blur-sm uppercase tracking-wider">
              Client Portal &bull; {clientMe?.companyName || 'SnapTech Digital Partner'}
            </span>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-white mt-3 tracking-tight">
              Welcome back, <span className="text-brand-cyan">{clientName}</span>! 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Track your active project roadmap, milestone billing status, and open support tickets in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/client/support"
              className="px-4 py-2.5 bg-brand-cyan hover:bg-brand-cyan-light text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <TicketCheck className="w-4 h-4" />
              Support Desk
            </Link>
            <Link
              to="/client/billing"
              className="px-4 py-2.5 bg-white/6 hover:bg-white/12 text-white font-semibold text-xs border border-white/15 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              Billing &amp; Invoices
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards — 6 premium cards in 2-row 3-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {statsLoading
          ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat) => {
              const CardWrapper = stat.link ? Link : 'div'
              const wrapperProps = stat.link ? { to: stat.link } : {}

              return (
                <CardWrapper
                  key={stat.id}
                  {...wrapperProps}
                  className={`bg-slate-900/70 border backdrop-blur-xl rounded-2xl p-5 shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-start gap-4 group ${stat.accent || 'border-white/10'} ${stat.link ? 'cursor-pointer' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-xl font-extrabold text-white mt-0.5 truncate">{stat.value}</h3>
                    {stat.subtext && (
                      <p className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${stat.subIconColor || 'text-slate-400'}`}>
                        {stat.subIcon && <stat.subIcon className="w-3 h-3" />}
                        {stat.subtext}
                      </p>
                    )}
                  </div>
                  {stat.link && (
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-cyan group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  )}
                </CardWrapper>
              )
            })}
      </div>

      {/* Dynamic WhatsApp Support Banner */}
      <div className="bg-linear-to-r from-emerald-950/40 via-slate-900/80 to-cyan-950/40 border border-emerald-500/30 rounded-3xl p-5 md:p-6 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h4 className="font-heading font-bold text-base md:text-lg text-white">Need Immediate Technical Assistance?</h4>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Get in touch directly with our support team or your dedicated project lead on WhatsApp for quick milestone reviews, feedback, or urgent bug escalations.
          </p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 hover:scale-[1.02] transition-all relative cursor-pointer shrink-0 z-10"
        >
          <MessageCircle className="w-4 h-4 fill-slate-950 text-slate-950" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white font-heading">Your Active Projects</h3>
          <span className="text-xs text-slate-400 font-semibold">{projects.length} Total Project(s)</span>
        </div>
        
        {projects.length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-white/15 rounded-3xl py-12 text-center backdrop-blur-xl">
            <FolderKanban className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-300">No projects linked to your account yet.</p>
            <p className="text-xs text-slate-400 mt-1">Please reach out to your account manager if this is an error.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => {
              const formattedDeadline = new Date(project.deadline).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })

              return (
                <div key={project.id} className="bg-slate-900/70 border border-white/10 hover:border-brand-cyan/40 rounded-3xl p-5 md:p-6 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group backdrop-blur-xl">
                  <div>
                    {/* Title and Status */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-heading text-lg font-bold text-white group-hover:text-brand-cyan transition-colors">{project.projectTitle}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">Project ID: {project.id}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${STATUS_COLORS[project.status]}`}>
                        {STATUS_LABELS[project.status]}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-400 mt-4 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>

                    {/* Progress Slider */}
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>Milestone Progress</span>
                        <span className="text-brand-cyan">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-linear-to-r from-brand-cyan to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Deadline: {formattedDeadline}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-brand-cyan" />
                        <span>
                          {project.taskStats.completed} / {project.taskStats.total} Done
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {project.status === 'COMPLETED' && !project.hasFeedback && (
                        <button
                          onClick={() => setSelectedProjectFeedback(project)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                        >
                          <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                          <span>Leave Review</span>
                        </button>
                      )}

                      <Link
                        to={`/client/projects/${project.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-cyan hover:text-brand-cyan-light transition-colors"
                      >
                        <span>View Project</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Testimonial Feedback Modal */}
      {selectedProjectFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900/95 rounded-3xl border border-white/15 shadow-2xl max-w-md w-full overflow-hidden text-white backdrop-blur-2xl">
            <div className="p-5 border-b border-white/10 bg-white/2">
              <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>Submit Project Review</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Share your experience on project: <span className="font-bold text-brand-cyan">{selectedProjectFeedback.projectTitle}</span>
              </p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="p-5 space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= feedbackRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600 fill-transparent'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Client Role & Company */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Your Title / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Managing Director"
                    value={clientRole}
                    onChange={(e) => setClientRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 focus:border-brand-cyan bg-white/4 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Hindustan Groups"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 focus:border-brand-cyan bg-white/4 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Feedback text */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Review Feedback</label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us about the project quality, team communication, and overall execution..."
                  className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 focus:border-brand-cyan bg-white/4 text-white placeholder:text-slate-500 resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProjectFeedback(null)}
                  className="px-4 py-2 border border-white/15 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/8 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitFeedbackMutation.isPending}
                  className="px-4 py-2 bg-brand-cyan hover:bg-brand-cyan-light text-slate-950 rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-cyan-950/40 disabled:opacity-50 transition-all"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

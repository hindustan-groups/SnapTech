/**
 * ClientProjectDetailPage.jsx — Detailed project status and task checklist
 */
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  HelpCircle,
  FileText,
  AlertTriangle,
  Lock,
  Unlock,
  FileCheck,
} from 'lucide-react'
import { useClientProject, useClientPayMilestone } from '@/hooks/useClientPortal'
import AttachmentSection from '@/components/ui/AttachmentSection'

const STATUS_COLORS = {
  PLANNING: 'bg-slate-800 text-slate-300 border-white/10',
  IN_PROGRESS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  REVIEW: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  ON_HOLD: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
}

const STATUS_LABELS = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
}

const TASK_STATUS_COLORS = {
  TODO: 'bg-slate-800 text-slate-400 border-white/10',
  IN_PROGRESS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  DONE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  BLOCKED: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const TASK_STATUS_LABELS = {
  TODO: 'Pending',
  IN_PROGRESS: 'In Progress',
  DONE: 'Completed',
  BLOCKED: 'On Hold / Blocked',
}

export default function ClientProjectDetailPage() {
  const { id } = useParams()
  const { data: project, isLoading, isError, refetch } = useClientProject(id)
  const payMutation = useClientPayMilestone()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="text-center py-12 bg-[#03091e] border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white font-heading">Failed to load project</h3>
        <p className="text-sm text-slate-400 mt-1">This project does not exist or you do not have permission to view it.</p>
        <Link to="/client/dashboard" className="mt-6 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-black bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const tasks = project.tasks || []
  const completedTasks = tasks.filter((t) => t.status === 'DONE')

  const handlePay = async (milestoneId) => {
    if (window.confirm('Simulate milestone payment check? This will immediately mark the milestone as PAID.')) {
      try {
        await payMutation.mutateAsync(milestoneId)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
      }
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to="/client/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Project Overview Card */}
      <div className="bg-[#03091e]/90 border border-white/10 rounded-2xl p-6 lg:p-8 shadow-xl backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">{project.projectTitle}</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Project Reference ID: {project.id}</p>
          </div>
          <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${STATUS_COLORS[project.status]}`}>
            {STATUS_LABELS[project.status]}
          </span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          {project.description || 'No description provided for this project.'}
        </p>

        {/* Dynamic Progress Bar */}
        <div className="space-y-2.5 max-w-xl">
          <div className="flex justify-between text-sm font-bold text-slate-300">
            <span>Overall Milestone Completion</span>
            <span className="text-cyan-400">{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5">
            <div
              className="bg-linear-to-r from-cyan-500 to-blue-600 h-2.5 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Grid Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</p>
              <p className="text-sm font-semibold text-white mt-0.5">{formatDate(project.startDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Launch</p>
              <p className="text-sm font-semibold text-white mt-0.5">{formatDate(project.deadline)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deliverable Tasks</p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {completedTasks.length} / {tasks.length} Completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Roadmap / Gantt Timeline */}
      {project.billingMilestones && project.billingMilestones.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white font-heading">Project Roadmap & Milestones</h3>

          <div className="bg-[#03091e]/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* The Stepper Track */}
            <div className="relative border-l border-dashed border-white/15 ml-4 md:ml-6 pl-6 md:pl-10 space-y-8 py-2">
              {project.billingMilestones.map((m) => {
                const isPaid = m.status === 'PAID'
                const isOverdue = m.status === 'OVERDUE'

                let iconBg = 'bg-cyan-500/20 text-cyan-400 ring-4 ring-cyan-500/10'
                let iconTag = Calendar

                if (isPaid) {
                  iconBg = 'bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/10'
                  iconTag = CheckCircle2
                } else if (isOverdue) {
                  iconBg = 'bg-red-500/20 text-red-400 ring-4 ring-red-500/10'
                  iconTag = AlertTriangle
                }

                const IconElement = iconTag

                return (
                  <div key={m.id} className="relative group">

                    {/* Pulsing Dot/Icon on Timeline Line */}
                    <div className={`absolute -left-12.5 md:-left-16.5 top-0.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${iconBg}`}>
                      <IconElement className="w-4 h-4" />
                    </div>

                    {/* Milestone Card Wrapper */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border border-white/10 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 hover:border-cyan-500/30 transition-all duration-200">

                      {/* Left: Metadata */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{m.title}</h4>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isOverdue
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {m.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                          <div>Amount: <span className="font-bold text-white">₹{m.amount.toLocaleString('en-IN')}</span></div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Due: {formatDate(m.dueDate)}</span>
                          </div>
                          {m.paidAt && (
                            <div className="text-emerald-400 font-bold">Paid on: {formatDate(m.paidAt)}</div>
                          )}
                        </div>

                        {/* Deliverables Sublist */}
                        {m.deliverables && Array.isArray(m.deliverables) && m.deliverables.length > 0 && (
                          <div className="pt-2 flex flex-wrap gap-1.5">
                            {m.deliverables.map((del, i) => (
                              <span
                                key={i}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
                                  isPaid
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                    : 'bg-white/5 text-slate-400 border-white/10'
                                }`}
                              >
                                {isPaid ? (
                                  <Unlock className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Lock className="w-3 h-3 text-slate-500" />
                                )}
                                <span>{del}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="shrink-0 flex items-center gap-2">
                        {isPaid && m.invoiceUrl ? (
                          <Link
                            to={m.invoiceUrl}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Receipt Invoice</span>
                          </Link>
                        ) : !isPaid ? (
                          <button
                            onClick={() => handlePay(m.id)}
                            disabled={payMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
                          >
                            <span>Simulate Pay</span>
                          </button>
                        ) : null}
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      )}

      {/* Tasks / Deliverables Checklist */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white font-heading">Project Checklist & Deliverables</h3>

        {tasks.length === 0 ? (
          <div className="bg-[#03091e]/90 border border-white/10 rounded-2xl py-10 text-center shadow-xl backdrop-blur-xl">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Checklist not configured yet.</p>
            <p className="text-xs text-slate-400 mt-1">Our team is setting up your project roadmap.</p>
          </div>
        ) : (
          <div className="bg-[#03091e]/90 border border-white/10 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl">
            <div className="divide-y divide-white/5">
              {tasks.map((task) => {
                const isDone = task.status === 'DONE'

                return (
                  <div key={task.id} className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-white/3 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-5.5 h-5.5 text-emerald-400 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5.5 h-5.5 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold leading-snug ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider self-start sm:self-center shrink-0 ${TASK_STATUS_COLORS[task.status]}`}>
                      {TASK_STATUS_LABELS[task.status]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Shared Files & Documents — Project File Vault */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-cyan-400" />
          Project File Vault & Asset Drive
        </h3>
        <AttachmentSection
          attachments={project.attachments}
          clientProjectId={project.id}
          onUploadSuccess={refetch}
        />
      </div>
    </div>
  )
}

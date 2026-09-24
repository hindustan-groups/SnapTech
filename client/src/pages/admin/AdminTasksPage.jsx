/**
 * AdminTasksPage — Enterprise Internal Tasks Board & Project Deliverables Vault
 * Full Kanban board with drag-n-drop, list view, quick add bar, priority tags, SLA overdue tracking, and optimistic deletion.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  Calendar,
  User,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Kanban,
  List,
  CheckCircle2,
  Clock,
  RefreshCw,
  Folder,
  Tag,
  Filter,
  Sparkles,
  CheckSquare,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { api } from '@/utils/api'
import { SEO, ConfirmModal } from '@/components/ui'
import AttachmentSection from '@/components/ui/AttachmentSection'
import { useToast } from '@/components/ui/ToastProvider'

const COLUMNS = [
  {
    id: 'TODO',
    label: 'To Do',
    bg: 'bg-gray-50/90 border-gray-200/80',
    headerBg: 'bg-gray-100/70 text-gray-800',
    dot: 'bg-gray-400',
  },
  {
    id: 'IN_PROGRESS',
    label: 'In Progress',
    bg: 'bg-blue-50/40 border-blue-200/80',
    headerBg: 'bg-blue-100/70 text-brand-blue',
    dot: 'bg-brand-blue animate-pulse',
  },
  {
    id: 'BLOCKED',
    label: 'Blocked',
    bg: 'bg-amber-50/40 border-amber-200/80',
    headerBg: 'bg-amber-100/70 text-amber-800',
    dot: 'bg-amber-500 animate-pulse',
  },
  {
    id: 'DONE',
    label: 'Completed',
    bg: 'bg-emerald-50/30 border-emerald-200/80',
    headerBg: 'bg-emerald-100/70 text-emerald-800',
    dot: 'bg-emerald-500',
  },
]

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const PRIORITY_COLORS = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200/80',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200/80 font-bold',
  URGENT: 'bg-rose-50 text-rose-700 border-rose-200/80 font-extrabold ring-1 ring-rose-500/20',
}

const inputCls =
  'w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-sans'

function TaskForm({ initial, projects, teamMembers = [], onSave, onCancel, loading, onAttachmentChange }) {
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().split('T')[0]
  }

  const { register, handleSubmit } = useForm({
    defaultValues: initial
      ? {
          ...initial,
          dueDate: formatDateForInput(initial.dueDate),
          tags: initial.tags ? initial.tags.join(', ') : '',
        }
      : {
          title: '',
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: '',
          assignedTo: '',
          clientProjectId: '',
          tags: '',
        },
  })

  const onSubmit = (data) => {
    onSave({
      ...data,
      clientProjectId: data.clientProjectId || null,
      tags: data.tags
        ? data.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-gray-700 block mb-1">Task Title *</label>
          <input
            {...register('title', { required: true })}
            className={inputCls}
            placeholder="e.g. Implement Payment Gateway API Integration"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-gray-700 block mb-1">Client Project</label>
          <select {...register('clientProjectId')} className={inputCls}>
            <option value="">None (General Administrative Task)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectTitle} ({p.clientName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Due Date</label>
          <input type="date" {...register('dueDate')} className={inputCls} />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Assigned To</label>
          <select {...register('assignedTo')} className={inputCls}>
            <option value="">Unassigned</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.email}>
                {m.email} ({m.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Workflow Status</label>
          <select {...register('status')} className={inputCls}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="DONE">Completed</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Priority Level</label>
          <select {...register('priority')} className={inputCls}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Est. Hours</label>
          <input
            type="number"
            step="0.5"
            min="0"
            {...register('estimatedHours')}
            className={inputCls}
            placeholder="e.g. 8"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Logged Hours</label>
          <input
            type="number"
            step="0.5"
            min="0"
            {...register('loggedHours')}
            className={inputCls}
            placeholder="e.g. 3.5"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-gray-700 block mb-1">
            Tags (comma-separated)
          </label>
          <input {...register('tags')} className={inputCls} placeholder="API, Design, Urgent, Bug" />
        </div>
      </div>

      <div className="border-t border-gray-150 pt-3">
        <label className="text-xs font-bold text-gray-700 block mb-1">Task Details &amp; Instructions</label>
        <textarea
          rows={3}
          {...register('description')}
          className={`${inputCls} resize-none`}
          placeholder="Describe implementation requirements or staff instructions..."
        />
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-150">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 bg-brand-blue hover:bg-brand-blue-hover text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? 'Saving Task...' : 'Save Task'}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
        >
          <X className="w-4 h-4" /> Discard
        </button>
      </div>

      {initial && (
        <div className="border-t border-gray-150 pt-4 mt-4">
          <AttachmentSection
            attachments={initial.attachments || []}
            taskId={initial.id}
            onUploadSuccess={onAttachmentChange}
          />
        </div>
      )}
    </form>
  )
}

export default function AdminTasksPage() {
  const qc = useQueryClient()
  const toast = useToast()

  const [viewMode, setViewMode] = useState('kanban') // 'kanban' | 'list'
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [projectFilter, setProjectFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [assignmentFilter, setAssignmentFilter] = useState('ALL')

  // Quick Add State
  const [quickTitle, setQuickTitle] = useState('')
  const [quickProject, setQuickProject] = useState('')
  const [quickDate, setQuickDate] = useState('')

  // Delete Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemTitle: '',
    onConfirm: null,
  })

  // Queries
  const { data: tasks = [], isLoading: loadingTasks, refetch: refetchTasks } = useQuery({
    queryKey: ['admin-tasks'],
    queryFn: () => api.get('/admin/tasks').then((r) => r.data),
  })

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['admin-client-projects'],
    queryFn: () => api.get('/admin/client-projects').then((r) => r.data),
  })

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
  })

  const { data: adminProfile } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: () => api.get('/admin/me').then((r) => r.data),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/tasks', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tasks'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      setShowForm(false)
      setQuickTitle('')
      setQuickDate('')
      toast.success('New task created successfully!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create task.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/admin/tasks/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tasks'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      setEditing(null)
      toast.success('Task updated!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update task.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/tasks/${id}`),
    onSuccess: (_, deletedId) => {
      toast.info('Task removed from board.')
      // Optimistic 0ms removal
      qc.setQueryData(['admin-tasks'], (old) => {
        if (!Array.isArray(old)) return old
        return old.filter((t) => t.id !== deletedId)
      })
      qc.invalidateQueries({ queryKey: ['admin-tasks'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete task', 'error')
    },
  })

  const handleAttachmentChange = async () => {
    const updated = await refetchTasks()
    const found = updated.data?.find((t) => t.id === editing?.id)
    if (found) {
      setEditing(found)
    }
  }

  const handleQuickAddSubmit = (e) => {
    e.preventDefault()
    if (!quickTitle.trim()) {
      toast.error('Task title cannot be empty.')
      return
    }
    createMutation.mutate({
      title: quickTitle.trim(),
      clientProjectId: quickProject || null,
      dueDate: quickDate || null,
      status: 'TODO',
      priority: 'MEDIUM',
    })
  }

  const handleMoveTask = (id, newStatus) => {
    updateMutation.mutate({ id, status: newStatus })
  }

  const handleDelete = (task) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Task Entry',
      message: 'Are you sure you want to permanently delete this task from the project board?',
      itemTitle: task.title,
      onConfirm: () => {
        deleteMutation.mutate(task.id)
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  // Drag and Drop helpers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, targetStatus) => {
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      handleMoveTask(taskId, targetStatus)
    }
  }

  const getProjectName = (projId) => {
    const p = projects.find((p) => p.id === projId)
    return p ? p.projectTitle : null
  }

  const getClientName = (projId) => {
    const p = projects.find((p) => p.id === projId)
    return p ? p.clientName : null
  }

  const isOverdue = (dueDateStr, status) => {
    if (status === 'DONE' || !dueDateStr) return false
    return new Date(dueDateStr) < new Date().setHours(0, 0, 0, 0)
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      !searchTerm ||
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesProject = projectFilter === 'ALL' || t.clientProjectId === projectFilter
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter

    let matchesAssignment = true
    if (assignmentFilter === 'ME') {
      matchesAssignment = adminProfile && t.assignedTo?.toLowerCase() === adminProfile.email?.toLowerCase()
    } else if (assignmentFilter === 'UNASSIGNED') {
      matchesAssignment = !t.assignedTo
    }

    return matchesSearch && matchesProject && matchesPriority && matchesAssignment
  })

  // Metric Counters
  const totalTasks = tasks.length
  const todoCount = tasks.filter((t) => t.status === 'TODO').length
  const progressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const doneCount = tasks.filter((t) => t.status === 'DONE').length
  const overdueCount = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length

  return (
    <>
      <SEO title="Internal Tasks Board" noIndex />
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-linear-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <CheckSquare className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Internal Operations Board
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Kanban SLA
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Coordinate team task assignments, drag cards across status columns, link client project deliverables, and monitor overdue deadlines.
                </p>
              </div>
            </div>

            {/* Quick Action Refresh & Add Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  refetchTasks()
                  toast.info('Task board refreshed.')
                }}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>

              {/* View Mode Switcher */}
              <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-gray-300 hover:text-white'
                  }`}
                  title="Kanban Board View"
                >
                  <Kanban className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-gray-300 hover:text-white'
                  }`}
                  title="List Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {!showForm && !editing && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Task</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Summary Metric Cards ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Tasks</p>
              <p className="text-xl font-extrabold font-heading text-gray-900">{totalTasks}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">In Progress</p>
              <p className="text-xl font-extrabold font-heading text-brand-blue">{progressCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed Tasks</p>
              <p className="text-xl font-extrabold font-heading text-emerald-600">{doneCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Overdue Tasks</p>
              <p className="text-xl font-extrabold font-heading text-rose-600">{overdueCount}</p>
            </div>
          </div>
        </div>

        {/* ── Quick Add Task Bar ─────────────────────────────────── */}
        {!showForm && !editing && (
          <form
            onSubmit={handleQuickAddSubmit}
            className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-end md:items-center"
          >
            <div className="flex-1 w-full">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Quick add a new task title (e.g. Revamp About Us Hero Image)..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-bold"
              />
            </div>

            <div className="w-full md:w-56">
              <select
                value={quickProject}
                onChange={(e) => setQuickProject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-semibold text-gray-700 cursor-pointer"
              >
                <option value="">General / No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-44">
              <input
                type="date"
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-mono text-gray-700"
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending || !quickTitle.trim()}
              className="bg-brand-blue hover:bg-brand-blue-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all shrink-0 w-full md:w-auto h-[40px] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{createMutation.isPending ? 'Adding...' : 'Quick Add'}</span>
            </button>
          </form>
        )}

        {/* ── Add / Edit Task Modal Form ─────────────────────────── */}
        {(showForm || editing) && (
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base sm:text-lg font-extrabold font-heading text-gray-900">
                {showForm ? 'Create New Operational Task' : `Edit Task: ${editing?.title}`}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {showForm ? (
              <TaskForm
                projects={projects}
                teamMembers={teamMembers}
                onSave={(data) => createMutation.mutate(data)}
                onCancel={() => setShowForm(false)}
                loading={createMutation.isPending}
              />
            ) : (
              <TaskForm
                initial={editing}
                projects={projects}
                teamMembers={teamMembers}
                onSave={(data) => updateMutation.mutate({ id: editing.id, ...data })}
                onCancel={() => setEditing(null)}
                loading={updateMutation.isPending}
                onAttachmentChange={handleAttachmentChange}
              />
            )}
          </div>
        )}

        {/* ── Search & Filter Controls ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks by title or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-bold text-gray-700 shadow-xs cursor-pointer"
            >
              <option value="ALL">All Projects</option>
              <option value="">General Tasks Only</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-bold text-gray-700 shadow-xs cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-bold text-gray-700 shadow-xs cursor-pointer"
            >
              <option value="ALL">All Assignees</option>
              <option value="ME">Assigned to Me</option>
              <option value="UNASSIGNED">Unassigned Tasks</option>
            </select>
          </div>
        </div>

        {/* ── Main Tasks Content Display (Kanban vs List) ───────── */}
        {loadingTasks || loadingProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-gray-50 border border-gray-200/80 h-96 rounded-3xl animate-pulse shadow-sm"
              />
            ))}
          </div>
        ) : viewMode === 'kanban' ? (
          /* Kanban Board View */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">
            {COLUMNS.map((col) => {
              const columnTasks = filteredTasks.filter((t) => t.status === col.id)

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`rounded-3xl border p-4.5 min-h-[520px] flex flex-col gap-3 transition-colors ${col.bg}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-black/5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <span className="font-extrabold font-heading text-xs uppercase tracking-wider text-gray-900">
                        {col.label}
                      </span>
                    </div>
                    <span className="text-xs bg-white border border-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Tasks Cards Container */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[620px] pr-1">
                    {columnTasks.map((t) => {
                      const overdue = isOverdue(t.dueDate, t.status)

                      return (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.id)}
                          className={`bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs hover:shadow-md hover:border-gray-300 transition-all cursor-grab active:cursor-grabbing group relative ${
                            overdue ? 'border-rose-300 bg-rose-50/10' : ''
                          }`}
                        >
                          {/* Priority Badge & Overdue Indicator */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span
                              className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${PRIORITY_COLORS[t.priority]}`}
                            >
                              {t.priority}
                            </span>
                            {overdue && (
                              <span className="flex items-center gap-1 text-[9px] text-rose-700 font-extrabold bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-md">
                                <AlertCircle className="w-3 h-3 text-rose-600" /> OVERDUE
                              </span>
                            )}
                          </div>

                          {/* Task Title */}
                          <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-brand-blue transition-colors leading-snug mb-1 font-heading">
                            {t.title}
                          </h4>

                          {/* Project Tag */}
                          {t.clientProjectId && (
                            <p className="text-[10px] text-brand-blue font-bold truncate mb-2 flex items-center gap-1">
                              <Folder className="w-3 h-3 text-brand-blue shrink-0" />
                              <span>{getProjectName(t.clientProjectId)}</span>
                            </p>
                          )}

                          {/* Description Snippet */}
                          {t.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50/60 p-2.5 rounded-xl border border-gray-100 mb-3 font-sans">
                              {t.description}
                            </p>
                          )}

                          {/* Task Footer Meta */}
                          <div className="space-y-1.5 border-t border-gray-100 pt-2.5 text-[11px]">
                            <div className="flex items-center justify-between text-gray-500 font-mono">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span className={overdue ? 'text-rose-600 font-bold' : ''}>
                                  {t.dueDate
                                    ? new Date(t.dueDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                      })
                                    : 'No Deadline'}
                                </span>
                              </div>
                              {(t.estimatedHours || t.loggedHours > 0) && (
                                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                  ⏱️ {t.loggedHours || 0} / {t.estimatedHours || '—'}h
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between flex-wrap gap-1 text-[10px]">
                              <span className="text-gray-800 font-bold truncate max-w-[120px]" title={`Assigned To: ${t.assigneeName}`}>
                                👤 {t.assigneeName || t.assignedTo || 'Unassigned'}
                              </span>
                              {t.creatorName && (
                                <span className="text-gray-400 font-medium truncate max-w-[110px]" title={`Creator: ${t.creatorName}`}>
                                  By {t.creatorName}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Tags */}
                          {t.tags && t.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {t.tags.map((tg) => (
                                <span
                                  key={tg}
                                  className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200"
                                >
                                  #{tg}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Hover Quick Actions */}
                          <div className="absolute right-2 top-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white border border-gray-200 p-0.5 rounded-xl shadow-sm">
                            <button
                              onClick={() => {
                                setEditing(t)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className="p-1 hover:text-brand-blue text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Task"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {adminProfile?.role !== 'STAFF' && (
                              <button
                                onClick={() => handleDelete(t)}
                                className="p-1 hover:text-red-600 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Quick Mobile Controls */}
                          <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-100 md:hidden">
                            <span className="text-[10px] text-gray-400 font-bold">Move Column:</span>
                            <div className="flex gap-1">
                              {col.id !== 'TODO' && (
                                <button
                                  onClick={() => {
                                    const idx = COLUMNS.findIndex((c) => c.id === col.id)
                                    handleMoveTask(t.id, COLUMNS[idx - 1].id)
                                  }}
                                  className="p-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded text-gray-600"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                              )}
                              {col.id !== 'DONE' && (
                                <button
                                  onClick={() => {
                                    const idx = COLUMNS.findIndex((c) => c.id === col.id)
                                    handleMoveTask(t.id, COLUMNS[idx + 1].id)
                                  }}
                                  className="p-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded text-gray-600"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {columnTasks.length === 0 && (
                      <div className="text-center py-10 border-2 border-dashed border-gray-200/80 rounded-2xl text-xs text-gray-400 font-medium">
                        Drag tasks here
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List Table View */
          <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200">
                    <th className="px-6 py-4">Task Title</th>
                    <th className="px-6 py-4">Client Project</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-700">
                  {filteredTasks.map((t) => {
                    const overdue = isOverdue(t.dueDate, t.status)

                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-gray-50/60 transition-colors ${
                          overdue ? 'bg-rose-50/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${COLUMNS.find((c) => c.id === t.status)?.dot}`}
                            />
                            <div>
                              <p className="font-bold text-gray-900 leading-snug font-heading">{t.title}</p>
                              {t.description && (
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 font-sans">
                                  {t.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {t.clientProjectId ? (
                            <div>
                              <p className="font-bold text-gray-900">
                                {getProjectName(t.clientProjectId)}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono">
                                {getClientName(t.clientProjectId)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">General task</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={t.status}
                            onChange={(e) => handleMoveTask(t.id, e.target.value)}
                            className="px-2.5 py-1 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none font-bold text-gray-800 shadow-xs cursor-pointer"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="BLOCKED">Blocked</option>
                            <option value="DONE">Completed</option>
                          </select>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${PRIORITY_COLORS[t.priority]}`}
                          >
                            {t.priority}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {t.dueDate ? (
                            <span
                              className={`flex items-center gap-1.5 text-xs font-mono font-bold ${overdue ? 'text-rose-600' : 'text-gray-700'}`}
                            >
                              {overdue && <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />}
                              {new Date(t.dueDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 font-mono">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-bold text-gray-800">
                          {t.assignedTo || <span className="text-gray-400 italic font-normal">Unassigned</span>}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditing(t)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className="p-1.5 hover:text-brand-blue text-gray-500 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                              title="Edit Task"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {adminProfile?.role !== 'STAFF' && (
                              <button
                                onClick={() => handleDelete(t)}
                                className="p-1.5 hover:text-rose-600 text-gray-500 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                                title="Delete Task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-400 font-bold">
                        No tasks matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Guidance Banner ─────────────────────────────────── */}
        <div className="bg-linear-to-r from-blue-50/80 via-slate-50/50 to-blue-50/80 border border-blue-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-brand-blue" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-brand-blue font-heading flex items-center gap-2">
              <span>Kanban SLA &amp; Real-time Workflow Tracking</span>
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Moving tasks across Kanban status columns automatically updates project progress percentages inside client portal workspaces. Overdue deadlines alert administrative leads in real-time.
            </p>
          </div>
        </div>

        {/* ── Delete Confirmation Modal ──────────────────────────── */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={deleteConfirm.onConfirm}
          title={deleteConfirm.title}
          message={deleteConfirm.message}
          itemTitle={deleteConfirm.itemTitle}
          confirmText="Delete Task"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

      </div>
    </>
  )
}

/**
 * AdminCalendarPage — Interactive Work Calendar & Milestone Planner
 * Visual monthly schedule tracking project deadlines, task due dates, and client deliverables.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderLock,
  CheckSquare,
  Sparkles,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export default function AdminCalendarPage() {
  const { addToast } = useToast()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDayEvents, setSelectedDayEvents] = useState(null) // { date, projects: [], tasks: [] }

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Fetch client projects
  const { data: projects = [], isLoading: loadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ['admin-client-projects'],
    queryFn: () => api.get('/admin/client-projects').then((r) => r.data),
  })

  // Fetch tasks
  const { data: tasks = [], isLoading: loadingTasks, refetch: refetchTasks } = useQuery({
    queryKey: ['admin-tasks'],
    queryFn: () => api.get('/admin/tasks').then((r) => r.data),
  })

  // Helper: Get first day of month (0 = Sunday, 6 = Saturday)
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()

  // Helper: Get number of days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Helper: Get number of days in previous month
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  // Generate calendar days grid
  const calendarCells = []

  // 1. Previous month padding cells
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const prevDate = new Date(currentYear, currentMonth - 1, day)
    calendarCells.push({ date: prevDate, isCurrentMonth: false })
  }

  // 2. Current month cells
  for (let d = 1; d <= daysInMonth; d++) {
    const currDate = new Date(currentYear, currentMonth, d)
    calendarCells.push({ date: currDate, isCurrentMonth: true })
  }

  // 3. Next month padding cells
  const totalCells = 42 // 6 rows of 7 columns
  const remainingCells = totalCells - calendarCells.length
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(currentYear, currentMonth + 1, d)
    calendarCells.push({ date: nextDate, isCurrentMonth: false })
  }

  // Helper: Match items by date (ignoring time)
  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const getEventsForDate = (date) => {
    const dayProjects = projects.filter((p) => p.deadline && isSameDay(new Date(p.deadline), date))
    const dayTasks = tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), date))
    return { projects: dayProjects, tasks: dayTasks }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    setSelectedDayEvents(null)
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    setSelectedDayEvents(null)
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    const events = getEventsForDate(today)
    setSelectedDayEvents({ date: today, projects: events.projects, tasks: events.tasks })
    addToast('Jumped to today', 'info')
  }

  const handleDayClick = (date, events) => {
    setSelectedDayEvents({
      date,
      projects: events.projects,
      tasks: events.tasks,
    })
  }

  const handleRefresh = () => {
    refetchProjects()
    refetchTasks()
    addToast('Calendar schedule refreshed', 'info')
  }

  const isToday = (date) => isSameDay(date, new Date())

  // Monthly Metrics Calculation
  const monthProjects = projects.filter((p) => {
    if (!p.deadline) return false
    const d = new Date(p.deadline)
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth
  })

  const monthTasks = tasks.filter((t) => {
    if (!t.dueDate) return false
    const d = new Date(t.dueDate)
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth
  })

  const completedMonthItems =
    monthProjects.filter((p) => p.status === 'COMPLETED').length +
    monthTasks.filter((t) => t.status === 'DONE').length

  return (
    <>
      <SEO title="Work Calendar & Schedule" noIndex />
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-linear-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <CalendarIcon className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Work Calendar &amp; Deadlines
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Milestone Schedule
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Interactive monthly calendar schedule tracking client project deliverables, staff task due dates, and milestone completions.
                </p>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleRefresh}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Jump to Today</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Metric Cards ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Events This Month</p>
              <p className="text-xl font-extrabold font-heading text-gray-900">
                {monthProjects.length + monthTasks.length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project Deadlines</p>
              <p className="text-xl font-extrabold font-heading text-rose-600">
                {monthProjects.length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tasks Due</p>
              <p className="text-xl font-extrabold font-heading text-brand-blue">
                {monthTasks.length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed Deliverables</p>
              <p className="text-xl font-extrabold font-heading text-emerald-600">
                {completedMonthItems}
              </p>
            </div>
          </div>
        </div>

        {/* ── Legend / Visual Guide Bar ─────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-gray-600 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-gray-400 uppercase text-[10px] font-extrabold tracking-wider mr-1">
              Event Status Guide:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span>Project Deadline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span>Task Due Date</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Completed Deliverable</span>
            </div>
          </div>

          {/* Month Switcher Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center border border-gray-200 bg-gray-50/80 rounded-xl shadow-xs overflow-hidden">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-white border-r border-gray-200 text-gray-600 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-extrabold text-gray-800 font-heading">
                {MONTHS[currentMonth]} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-white text-gray-600 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Calendar Grid & Agenda Sidebar Container ──────── */}
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[620px]">
          
          {/* Left Column: 7x6 Calendar Month Grid */}
          <div className="flex-1 p-6 border-r border-gray-100 flex flex-col">
            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-xs uppercase text-gray-400 border-b border-gray-100 pb-3 mb-2">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>

            {/* Grid Days */}
            {loadingProjects || loadingTasks ? (
              <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1 bg-gray-50/50">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1.5 bg-gray-50/30 min-h-110">
                {calendarCells.map((cell, idx) => {
                  const events = getEventsForDate(cell.date)
                  const hasEvents = events.projects.length > 0 || events.tasks.length > 0
                  const isCurrent = isToday(cell.date)
                  const isSelected =
                    selectedDayEvents && isSameDay(selectedDayEvents.date, cell.date)

                  return (
                    <div
                      key={idx}
                      onClick={() => handleDayClick(cell.date, events)}
                      className={`bg-white border p-1.5 flex flex-col justify-between hover:bg-blue-50/40 transition-all cursor-pointer relative group rounded-xl ${
                        !cell.isCurrentMonth
                          ? 'opacity-35 bg-gray-50/50 border-gray-100'
                          : isSelected
                            ? 'border-brand-blue bg-blue-50/30 shadow-xs ring-2 ring-brand-blue/30'
                            : isCurrent
                              ? 'border-brand-blue/70 bg-blue-50/20 font-bold'
                              : 'border-gray-200/70 hover:border-brand-blue/40'
                      }`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold leading-none w-5 h-5 rounded-full flex items-center justify-center ${
                            isCurrent
                              ? 'bg-brand-blue text-white font-extrabold shadow-xs'
                              : cell.isCurrentMonth
                                ? 'text-gray-900'
                                : 'text-gray-400'
                          }`}
                        >
                          {cell.date.getDate()}
                        </span>
                        {hasEvents && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                        )}
                      </div>

                      {/* Event Indicator Pills */}
                      <div className="space-y-1 mt-1 overflow-hidden flex-1 flex flex-col justify-end">
                        {events.projects.slice(0, 2).map((p) => (
                          <div
                            key={p.id}
                            className={`text-[9px] px-1.5 py-0.5 rounded-md border truncate leading-tight font-bold ${
                              p.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                            title={`Project: ${p.projectTitle}`}
                          >
                            📌 {p.projectTitle}
                          </div>
                        ))}
                        {events.tasks.slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            className={`text-[9px] px-1.5 py-0.5 rounded-md border truncate leading-tight font-semibold ${
                              t.status === 'DONE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                            title={`Task: ${t.title}`}
                          >
                            ✓ {t.title}
                          </div>
                        ))}
                        {hasEvents && events.projects.length + events.tasks.length > 4 && (
                          <div className="text-[8px] text-gray-400 text-center font-bold">
                            +{events.projects.length + events.tasks.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Column: Selected Day Agenda Panel */}
          <div className="w-full md:w-80 p-6 bg-gray-50/80 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col">
            <h3 className="font-bold font-heading text-xs text-gray-500 uppercase tracking-wider mb-4 pb-3 border-b border-gray-200">
              Agenda &amp; Day Details
            </h3>

            {selectedDayEvents ? (
              <div className="flex-1 flex flex-col space-y-5">
                {/* Date Header */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selected Date</p>
                  <p className="text-base font-extrabold text-gray-900 font-heading leading-tight mt-0.5">
                    {selectedDayEvents.date.toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Projects Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                      <FolderLock className="w-3.5 h-3.5 text-rose-500" />
                      <span>Projects Due</span>
                    </h4>
                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                      {selectedDayEvents.projects.length}
                    </span>
                  </div>
                  
                  {selectedDayEvents.projects.length === 0 ? (
                    <p className="text-xs text-gray-400 italic bg-white p-3 rounded-xl border border-gray-200/80">
                      No project deadlines on this date.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDayEvents.projects.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                                p.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                          <h5 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug mt-2">
                            {p.projectTitle}
                          </h5>
                          <p className="text-xs text-gray-500 font-medium mt-1">
                            Client: <span className="font-semibold text-gray-800">{p.clientName}</span>
                          </p>
                          {p.assignedTo && (
                            <p className="text-[10px] text-gray-400 font-semibold mt-2 pt-2 border-t border-gray-100 flex items-center gap-1">
                              <span>👤 Assigned to:</span>
                              <span className="text-gray-700 font-bold">{p.assignedTo}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tasks Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-brand-blue" />
                      <span>Tasks Due</span>
                    </h4>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                      {selectedDayEvents.tasks.length}
                    </span>
                  </div>

                  {selectedDayEvents.tasks.length === 0 ? (
                    <p className="text-xs text-gray-400 italic bg-white p-3 rounded-xl border border-gray-200/80">
                      No staff tasks scheduled for this date.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDayEvents.tasks.map((t) => (
                        <div
                          key={t.id}
                          className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            {t.status === 'DONE' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : t.status === 'BLOCKED' ? (
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                            <span className="text-[10px] font-bold uppercase text-gray-700">
                              {t.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-gray-900 leading-snug mt-1.5">
                            {t.title}
                          </h5>
                          {t.assignedTo && (
                            <p className="text-[10px] text-gray-400 font-semibold mt-2 pt-2 border-t border-gray-100 flex items-center gap-1">
                              <span>👤 Assigned to:</span>
                              <span className="text-gray-700 font-bold">{t.assignedTo}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 space-y-2">
                <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-700">No Date Selected</p>
                <p className="text-[11px] text-gray-400 leading-relaxed max-w-xs">
                  Click on any calendar date cell to inspect scheduled project deadlines and staff tasks.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Guidance Card ────────────────────────────────────── */}
        <div className="bg-linear-to-r from-blue-50/80 via-purple-50/50 to-blue-50/80 border border-blue-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-brand-blue" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-brand-blue font-heading flex items-center gap-2">
              <span>Automatic Milestone Synchronization</span>
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Deadlines created in Client Projects or due dates set in Task Management are automatically plotted on this schedule.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}

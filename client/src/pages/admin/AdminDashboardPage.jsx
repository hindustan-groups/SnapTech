/**
 * Admin Dashboard — Overview stats + quick actions (premium polish)
 */
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Briefcase,
  FolderKanban,
  Users,
  AlertCircle,
  ArrowRight,
  Star,
  HelpCircle,
  Flag,
  Handshake,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  UserCheck,
  CheckSquare,
  StickyNote,
  Calendar,
  Newspaper,
  Check,
  X,
  History,
  Eye,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'
import { SocialDraftsSection } from '@/components/admin/SocialDraftsSection'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

function StatCard({ icon: Icon, label, value, color, bg, to, trend }) {
  const inner = (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4
      hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-0.5 transition-all duration-200 group`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold font-heading text-gray-900">{value ?? '—'}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {trend.up ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span
              className={`text-[11px] font-medium ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {trend.label}
            </span>
          </div>
        )}
      </div>
      {to && (
        <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-gray-400 shrink-0 self-center transition-colors" />
      )}
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

const QUICK_ACTIONS = [
  {
    label: 'View Leads',
    to: '/admin/leads',
    icon: MessageSquare,
    color: 'text-brand-red',
    bg: 'bg-red-50',
  },
  {
    label: 'Services',
    to: '/admin/services',
    icon: Briefcase,
    color: 'text-brand-blue',
    bg: 'bg-blue-50',
  },
  {
    label: 'Projects',
    to: '/admin/projects',
    icon: FolderKanban,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  { label: 'Team', to: '/admin/team', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
  {
    label: 'Careers',
    to: '/admin/careers',
    icon: UserCheck,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  {
    label: 'Testimonials',
    to: '/admin/testimonials',
    icon: Star,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  { label: 'FAQs', to: '/admin/faqs', icon: HelpCircle, color: 'text-sky-600', bg: 'bg-sky-50' },
  {
    label: 'Milestones',
    to: '/admin/milestones',
    icon: Flag,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    label: 'Partners',
    to: '/admin/partners',
    icon: Handshake,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    label: 'Client Projects',
    to: '/admin/client-projects',
    icon: FolderKanban,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: 'Blog Posts',
    to: '/admin/blog',
    icon: Newspaper,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
  {
    label: 'Tasks Board',
    to: '/admin/tasks',
    icon: CheckSquare,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    label: 'Sticky Notes',
    to: '/admin/notes',
    icon: StickyNote,
    color: 'text-amber-650',
    bg: 'bg-amber-50',
  },
  {
    label: 'Work Calendar',
    to: '/admin/calendar',
    icon: Calendar,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    label: 'Site Settings',
    to: '/admin/site-settings',
    icon: SlidersHorizontal,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
  },
  {
    label: 'Account',
    to: '/admin/settings',
    icon: Settings,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
]



function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function AdminDashboardPage() {
  const now = useClock()
  const [selectedActivity, setSelectedActivity] = useState(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
  })

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['admin-activities-dashboard'],
    queryFn: () => api.get('/admin/activities').then((r) => r.data),
  })

  const checklistItems = [
    {
      text: 'Update contact info (phone, email, address)',
      to: '/admin/site-settings',
      completed: !!data?.hasContactInfo,
    },
    {
      text: 'Add your social media links',
      to: '/admin/site-settings',
      completed: !!data?.hasSocialLinks,
    },
    {
      text: 'Add team members with photos',
      to: '/admin/team',
      completed: (data?.totalTeam ?? 0) > 0,
    },
    {
      text: 'Add real client testimonials',
      to: '/admin/testimonials',
      completed: (data?.totalTestimonials ?? 0) > 0,
    },
    {
      text: 'Add portfolio projects with thumbnails',
      to: '/admin/projects',
      completed: (data?.totalProjects ?? 0) > 0,
    },
    {
      text: 'Update services with features & tech stack',
      to: '/admin/services',
      completed: (data?.totalServices ?? 0) > 0,
    },
  ]

  const completedCount = checklistItems.filter((item) => item.completed).length
  const progressPercent =
    checklistItems.length > 0 ? Math.round((completedCount / checklistItems.length) * 100) : 0

  if (data?.role === 'STAFF') {
    return (
      <>
        <SEO title="Staff Dashboard" noIndex />
        <div className="space-y-6">
          {/* ── Welcome banner ── */}
          <div
            className="relative rounded-2xl overflow-hidden p-6"
            style={{ background: 'linear-gradient(135deg, #1A3E8C 0%, #0f2660 100%)' }}
          >
            {/* Subtle grid */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/15 rounded-full blur-3xl" />

            <div className="relative flex items-end justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/50 text-xs font-medium">All systems operational</span>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-white/40 text-xs font-medium">Staff Portal</span>
                </div>
                <h1
                  className="font-heading text-2xl font-bold text-white mb-1"
                  style={{ color: '#fff' }}
                >
                  {getGreeting()} 👋
                </h1>
                <p className="text-white/60 text-sm">
                  Welcome back! Here's an overview of your assigned tasks and updates.
                </p>
              </div>

              {/* Real-time clock */}
              <div className="text-right shrink-0">
                <p className="font-heading text-3xl font-bold text-white tabular-nums tracking-tight leading-none">
                  {now.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                  })}
                </p>
                <p className="text-white/40 text-xs mt-1 font-medium">
                  {now.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* ── Stats grid ── */}
          {/* ── Stats grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={CheckSquare}
              label="Assigned Tasks"
              bg="bg-blue-100"
              color="text-brand-blue"
              to="/admin/tasks"
              value={isLoading ? '…' : data?.totalTasks}
            />
            <StatCard
              icon={AlertCircle}
              label="Urgent Tasks"
              bg="bg-red-100"
              color="text-red-600"
              to="/admin/tasks"
              value={isLoading ? '…' : data?.urgentTasksCount}
            />
            <StatCard
              icon={Calendar}
              label="Due Today"
              bg="bg-amber-100"
              color="text-amber-600"
              to="/admin/tasks"
              value={isLoading ? '…' : data?.dueTodayTasksCount}
            />
            <StatCard
              icon={Activity}
              label="In Progress"
              bg="bg-orange-100"
              color="text-orange-600"
              to="/admin/tasks"
              value={isLoading ? '…' : data?.inProgressTasks}
            />
            <StatCard
              icon={Check}
              label="Completed Tasks"
              bg="bg-emerald-100"
              color="text-emerald-600"
              to="/admin/tasks"
              value={isLoading ? '…' : data?.completedTasks}
            />
          </div>

          {/* ── Hours Tracker Banner ── */}
          {(data?.totalEstimatedHours > 0 || data?.totalLoggedHours > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-heading text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-blue" />
                  Task Workload & Logged Hours Tracker
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  You have logged <span className="font-bold text-gray-900">{data?.totalLoggedHours || 0} hrs</span> out of <span className="font-bold text-gray-900">{data?.totalEstimatedHours || 0} hrs</span> estimated.
                </p>
              </div>
              <div className="w-full sm:w-64">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span className="font-bold">
                    {data?.totalEstimatedHours > 0
                      ? `${Math.min(100, Math.round((data.totalLoggedHours / data.totalEstimatedHours) * 100))}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-brand-blue h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${data?.totalEstimatedHours > 0 ? Math.min(100, (data.totalLoggedHours / data.totalEstimatedHours) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Assigned Projects Section ── */}
          {data?.myAssignedProjects && data.myAssignedProjects.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-brand-blue" />
                  <h2 className="font-heading text-sm font-bold text-gray-800">Client Projects Assigned to You</h2>
                </div>
                <Link to="/admin/client-projects" className="text-xs text-brand-blue hover:underline font-bold">
                  View Assigned Projects
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.myAssignedProjects.map((project) => (
                  <div key={project.id} className="p-4 rounded-xl border border-gray-150 bg-gray-50/50 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{project.projectTitle}</h4>
                        <p className="text-[11px] text-gray-500">{project.clientName}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-brand-blue border border-blue-100">
                        {project.status}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-500 font-semibold mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-brand-blue h-1.5 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Assigned Tickets Section ── */}
          {data?.myAssignedTickets && data.myAssignedTickets.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-red" />
                  <h2 className="font-heading text-sm font-bold text-gray-800">Support Tickets Assigned to You</h2>
                </div>
                <Link to="/admin/tickets" className="text-xs text-brand-blue hover:underline font-bold">
                  View All Tickets
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {data.myAssignedTickets.map((ticket) => (
                  <div key={ticket.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-gray-900">{ticket.subject}</p>
                      <p className="text-gray-400 mt-0.5">Project: {ticket.clientProject?.projectTitle || 'General'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                      ticket.status === 'OPEN' ? 'bg-red-50 text-red-700' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Quick actions ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-4 h-4 text-brand-blue" />
              <h2 className="font-heading text-base font-bold text-gray-800">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: 'Tasks Board',
                  to: '/admin/tasks',
                  icon: CheckSquare,
                  color: 'text-emerald-700',
                  bg: 'bg-emerald-50',
                },
                {
                  label: 'Sticky Notes',
                  to: '/admin/notes',
                  icon: StickyNote,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50',
                },
                {
                  label: 'Work Calendar',
                  to: '/admin/calendar',
                  icon: Calendar,
                  color: 'text-purple-600',
                  bg: 'bg-purple-50',
                },
                {
                  label: 'Account Settings',
                  to: '/admin/settings',
                  icon: Settings,
                  color: 'text-pink-600',
                  bg: 'bg-pink-50',
                },
              ].map((a) => {
                const Icon = a.icon
                return (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="flex flex-col items-center gap-2.5 px-3 py-4 rounded-xl border border-gray-100
                      text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-gray-200 bg-gray-50 group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.bg} transition-transform duration-200 group-hover:scale-110`}
                    >
                      <Icon className={`w-5 h-5 ${a.color}`} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 leading-tight transition-colors">
                      {a.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── Scoped Notes Grid ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-brand-blue" />
                <h2 className="font-heading text-sm font-bold text-gray-800">Your Recent Notes</h2>
              </div>
              <Link to="/admin/notes" className="text-xs text-brand-blue hover:underline font-bold">
                View All Notes
              </Link>
            </div>

            {data?.recentNotes && data.recentNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {data.recentNotes.map((note) => {
                  const colors = {
                    yellow: 'bg-yellow-50/60 border-yellow-200 text-yellow-800',
                    blue: 'bg-blue-50/60 border-blue-200 text-blue-800',
                    green: 'bg-green-50/60 border-green-200 text-green-800',
                    pink: 'bg-pink-50/60 border-pink-200 text-pink-800',
                    purple: 'bg-purple-50/60 border-purple-200 text-purple-800',
                  }
                  const colorCls = colors[note.color] || colors.yellow
                  return (
                    <div
                      key={note.id}
                      className={`p-4 rounded-xl border ${colorCls} shadow-sm space-y-2 flex flex-col justify-between`}
                    >
                      <div>
                        {note.title && (
                          <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider mb-1.5">
                            {note.title}
                          </h3>
                        )}
                        <p className="text-xs whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                      <p className="text-[9px] text-gray-400 text-right pt-2 border-t border-black/5">
                        {new Date(note.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs">
                You haven't created any sticky notes yet.
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO title="Dashboard" noIndex />
      <div className="space-y-6">
        {/* ── Welcome banner ── */}
        <div
          className="relative rounded-2xl overflow-hidden p-6"
          style={{ background: 'linear-gradient(135deg, #1A3E8C 0%, #0f2660 100%)' }}
        >
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/15 rounded-full blur-3xl" />

          <div className="relative flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/50 text-xs font-medium">All systems operational</span>
                <span className="text-white/20 text-xs">·</span>
                <span className="text-white/40 text-xs font-medium">IT Services, Bhilwara</span>
              </div>
              <h1
                className="font-heading text-2xl font-bold text-white mb-1"
                style={{ color: '#fff' }}
              >
                {getGreeting()} 👋
              </h1>
              <p className="text-white/60 text-sm">
                Here's an overview of your{' '}
                <span className="text-white/80 font-semibold">SnapTech Digital</span> platform.
              </p>
            </div>

            {/* Real-time clock */}
            <div className="text-right shrink-0">
              <p className="font-heading text-3xl font-bold text-white tabular-nums tracking-tight leading-none">
                {now.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </p>
              <p className="text-white/40 text-xs mt-1 font-medium">
                {now.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {isError && (
          <div
            className="flex items-center gap-2.5 text-sm text-amber-700 bg-amber-50
            border border-amber-200 rounded-xl px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            Stats unavailable — backend server may be offline. Content management still works.
          </div>
        )}

        {/* ── Financial Revenue Summary (Super Admin & Admin) ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="font-heading text-base font-bold text-gray-900">Financial Revenue & Collections Overview</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              Real-time Business Financials
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-4">
              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Total Paid Revenue</p>
              <p className="text-2xl font-black text-emerald-800 mt-1">
                ₹{isLoading ? '…' : (data?.totalPaidRevenue || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Collected from paid milestones</p>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4">
              <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">Pending Receivables</p>
              <p className="text-2xl font-black text-amber-800 mt-1">
                ₹{isLoading ? '…' : (data?.totalPendingReceivables || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-amber-600 font-medium mt-1">Awaiting client payment</p>
            </div>

            <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-4">
              <p className="text-xs text-brand-blue font-bold uppercase tracking-wider">Total Contract Value</p>
              <p className="text-2xl font-black text-blue-900 mt-1">
                ₹{isLoading ? '…' : (data?.totalBillingVolume || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-blue-600 font-medium mt-1">Total project milestone volume</p>
            </div>

            <div className="bg-purple-50/50 border border-purple-200/60 rounded-xl p-4">
              <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">Active Client Accounts</p>
              <p className="text-2xl font-black text-purple-900 mt-1">
                {isLoading ? '…' : (data?.totalClients || 0)}
              </p>
              <p className="text-[11px] text-purple-600 font-medium mt-1">Clients registered in portal</p>
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={MessageSquare}
            label="New Leads"
            bg="bg-red-100"
            color="text-brand-red"
            to="/admin/leads"
            value={isLoading ? '…' : data?.newLeads}
            trend={{ up: true, label: 'This week' }}
          />
          <StatCard
            icon={TrendingUp}
            label="Total Leads"
            bg="bg-orange-100"
            color="text-orange-600"
            to="/admin/leads"
            value={isLoading ? '…' : data?.totalLeads}
          />
          <StatCard
            icon={FolderKanban}
            label="Projects"
            bg="bg-blue-100"
            color="text-brand-blue"
            to="/admin/projects"
            value={isLoading ? '…' : data?.totalProjects}
          />
          <StatCard
            icon={Briefcase}
            label="Active Services"
            bg="bg-emerald-100"
            color="text-emerald-600"
            to="/admin/services"
            value={isLoading ? '…' : data?.totalServices}
          />
          <StatCard
            icon={UserCheck}
            label="Open Positions"
            bg="bg-violet-100"
            color="text-violet-600"
            to="/admin/careers"
            value={isLoading ? '…' : data?.openPositions}
          />
          <StatCard
            icon={Users}
            label="Applications"
            bg="bg-indigo-100"
            color="text-indigo-600"
            to="/admin/careers"
            value={isLoading ? '…' : data?.totalApplications}
          />
          <StatCard
            icon={Newspaper}
            label="Blog Posts"
            bg="bg-pink-100"
            color="text-pink-600"
            to="/admin/blog"
            value={isLoading ? '…' : data?.totalPublishedBlogPosts}
          />
        </div>

        {/* ── Work Management Overview Alerts ── */}
        {!isLoading && !isError && (
          <div className="bg-white rounded-xl border border-gray-205 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
              <CheckSquare className="w-4 h-4 text-brand-blue" />
              <h2 className="font-heading text-sm font-bold text-gray-800">
                Work Management Dashboard
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Active client projects */}
              <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100/80 flex items-center justify-center shrink-0">
                  <FolderKanban className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">
                    Active Projects
                  </p>
                  <p className="text-lg font-extrabold text-blue-900 mt-0.5">
                    {data?.activeProjectsCount ?? 0} Projects
                  </p>
                  <Link
                    to="/admin/client-projects"
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5 mt-2"
                  >
                    Manage Projects <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Tasks due today */}
              <div
                className={`border rounded-xl p-4 flex items-start gap-3 ${data?.dueTodayTasksCount > 0 ? 'bg-amber-50/40 border-amber-200 animate-pulse' : 'bg-gray-50/50 border-gray-200'}`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${data?.dueTodayTasksCount > 0 ? 'bg-amber-100' : 'bg-gray-100'}`}
                >
                  <CheckSquare
                    className={`w-4 h-4 ${data?.dueTodayTasksCount > 0 ? 'text-amber-600' : 'text-gray-500'}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wide ${data?.dueTodayTasksCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}
                  >
                    Due Today
                  </p>
                  <p className="text-lg font-extrabold text-gray-900 mt-0.5">
                    {data?.dueTodayTasksCount ?? 0} Tasks
                  </p>
                  <Link
                    to="/admin/tasks"
                    className="text-[11px] text-brand-blue hover:text-blue-800 font-bold inline-flex items-center gap-0.5 mt-2"
                  >
                    View Tasks Board <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Overdue projects */}
              <div
                className={`border rounded-xl p-4 flex items-start gap-3 ${data?.overdueProjectsCount > 0 ? 'bg-red-50/40 border-red-200' : 'bg-gray-50/50 border-gray-200'}`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${data?.overdueProjectsCount > 0 ? 'bg-red-100/80' : 'bg-gray-100'}`}
                >
                  <AlertCircle
                    className={`w-4 h-4 ${data?.overdueProjectsCount > 0 ? 'text-red-600' : 'text-gray-500'}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wide ${data?.overdueProjectsCount > 0 ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    Overdue Projects
                  </p>
                  <p
                    className={`text-lg font-extrabold mt-0.5 ${data?.overdueProjectsCount > 0 ? 'text-red-700' : 'text-gray-900'}`}
                  >
                    {data?.overdueProjectsCount ?? 0} Overdue
                  </p>
                  <Link
                    to="/admin/client-projects"
                    className="text-[11px] text-brand-blue hover:text-blue-800 font-bold inline-flex items-center gap-0.5 mt-2"
                  >
                    Review Deadlines <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Quick actions ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-brand-blue" />
            <h2 className="font-heading text-base font-bold text-gray-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon
              return (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex flex-col items-center gap-2.5 px-3 py-4 rounded-xl border border-gray-100
                    text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-gray-200 bg-gray-50 group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.bg} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon className={`w-5 h-5 ${a.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 leading-tight transition-colors">
                    {a.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* ── Charts Grid ── */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Monthly Trends Area Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-205 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading text-sm font-bold text-gray-800">Monthly Website Activity</h2>
                  <p className="text-[10px] text-gray-400">Total Leads & Client Projects registered in the last 6 months</p>
                </div>
              </div>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A3E8C" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#1A3E8C" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1F2937' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
                    <Area name="Leads Received" type="monotone" dataKey="leads" stroke="#1A3E8C" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                    <Area name="Projects Created" type="monotone" dataKey="projects" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProjects)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project Status Pie Chart */}
            <div className="bg-white rounded-xl border border-gray-205 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="font-heading text-sm font-bold text-gray-800">Project Status Distribution</h2>
                <p className="text-[10px] text-gray-400 mb-4">Current stage of active client projects</p>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Planning', value: data?.projectStatusDistribution?.PLANNING || 0, color: '#6B7280' },
                        { name: 'In Progress', value: data?.projectStatusDistribution?.IN_PROGRESS || 0, color: '#3B82F6' },
                        { name: 'Review', value: data?.projectStatusDistribution?.REVIEW || 0, color: '#F59E0B' },
                        { name: 'Completed', value: data?.projectStatusDistribution?.COMPLETED || 0, color: '#10B981' },
                        { name: 'On Hold', value: data?.projectStatusDistribution?.ON_HOLD || 0, color: '#EF4444' },
                      ].filter(x => x.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {[
                        { name: 'Planning', color: '#6B7280' },
                        { name: 'In Progress', color: '#3B82F6' },
                        { name: 'Review', color: '#F59E0B' },
                        { name: 'Completed', color: '#10B981' },
                        { name: 'On Hold', color: '#EF4444' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[9px] text-center font-semibold text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex flex-col items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mb-0.5" />
                  <span>Active ({data?.projectStatusDistribution?.IN_PROGRESS || 0})</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-0.5" />
                  <span>Done ({data?.projectStatusDistribution?.COMPLETED || 0})</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mb-0.5" />
                  <span>Review ({data?.projectStatusDistribution?.REVIEW || 0})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Visual Breakdown + Checklist ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Lead Status Breakdown Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-brand-blue" />
                <h2 className="font-heading text-base font-bold text-gray-800">
                  Leads Status Breakdown
                </h2>
              </div>
              <p className="text-xs text-gray-400 mb-5">
                Visual summary of website contact form query stages.
              </p>

              {isLoading ? (
                <div className="space-y-4 py-4">
                  <div className="h-4 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Visual segment progress bar */}
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                    {data?.totalLeads > 0 ? (
                      <>
                        <div
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${(data.newLeads / data.totalLeads) * 100}%` }}
                          title={`New: ${data.newLeads}`}
                        />
                        <div
                          className="h-full bg-amber-500 transition-all duration-500"
                          style={{ width: `${(data.contactedLeads / data.totalLeads) * 100}%` }}
                          title={`Contacted: ${data.contactedLeads}`}
                        />
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${(data.closedLeads / data.totalLeads) * 100}%` }}
                          title={`Closed: ${data.closedLeads}`}
                        />
                      </>
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-medium">
                        No leads submitted yet
                      </div>
                    )}
                  </div>

                  {/* Info stats block */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/50 text-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mx-auto mb-1" />
                      <p className="text-[10px] uppercase font-bold text-blue-500 mb-0.5">New</p>
                      <p className="text-xl font-bold text-blue-900">{data?.newLeads ?? 0}</p>
                    </div>
                    <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100/50 text-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mx-auto mb-1" />
                      <p className="text-[10px] uppercase font-bold text-amber-600 mb-0.5">
                        Contacted
                      </p>
                      <p className="text-xl font-bold text-amber-900">
                        {data?.contactedLeads ?? 0}
                      </p>
                    </div>
                    <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50 text-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto mb-1" />
                      <p className="text-[10px] uppercase font-bold text-emerald-600 mb-0.5">
                        Closed
                      </p>
                      <p className="text-xl font-bold text-emerald-900">{data?.closedLeads ?? 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Setup checklist */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Flag className="w-4 h-4 text-brand-blue" />
              <h2 className="font-heading text-base font-bold text-gray-800">Setup Checklist</h2>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Complete these steps to get your website fully ready.
            </p>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-brand-blue to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <ul className="space-y-1.5">
              {checklistItems.map((item, i) => (
                <li key={item.text}>
                  <Link
                    to={item.to}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 shrink-0 transition-colors flex items-center justify-center
                        ${
                          item.completed
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-gray-200 group-hover:border-brand-blue text-gray-300 group-hover:text-brand-blue'
                        }`}
                    >
                      {item.completed ? (
                        <Check className="w-3 h-3 stroke-3" />
                      ) : (
                        <span className="text-[9px] font-bold">
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs flex-1 transition-colors
                        ${
                          item.completed
                            ? 'text-gray-400 line-through'
                            : 'text-gray-600 group-hover:text-gray-900'
                        }`}
                    >
                      {item.text}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-blue opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent System Activity Widget (Phase 1) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-brand-blue" />
              <h2 className="font-heading text-base font-bold text-gray-800">
                Recent System Activity Log
              </h2>
            </div>
            <Link
              to="/admin/activities"
              className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
            >
              <span>View Full Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activitiesLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex gap-4 items-start animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200 mt-2" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">No recent activity logged.</p>
          ) : (
            <div className="relative border-l border-gray-150 pl-4 ml-2 space-y-5 my-2">
              {activities.slice(0, 5).map((act) => {
                const colors = {
                  CREATE: 'bg-emerald-500',
                  UPDATE: 'bg-blue-500',
                  DELETE: 'bg-rose-500',
                }
                const dotColor = colors[act.action] || 'bg-gray-400'
                const formattedDate = new Date(act.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })

                return (
                  <div key={act.id} className="relative group/item flex justify-between items-start gap-4">
                    {/* Timeline Dot */}
                    <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${dotColor}`} />
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider text-white ${dotColor}`}>
                          {act.action}
                        </span>
                        <span className="text-xs font-bold text-gray-800">{act.entity}</span>
                        <span className="text-[10px] text-gray-400 font-medium">·</span>
                        <span className="text-[10px] text-gray-400 font-medium">{formattedDate}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">
                        {act.details}
                      </p>
                      <p className="text-[10px] text-gray-450 mt-0.5">
                        Performed by: <span className="font-semibold text-gray-600">{act.adminEmail}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedActivity(act)}
                      className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-gray-50 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all cursor-pointer shrink-0 self-center"
                      title="View Details JSON"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Automated Social Media Drafts */}
        <SocialDraftsSection />
      </div>

      {/* Activity Details Modal (Phase 1) */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-150 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-brand-blue" />
                <h3 className="text-base font-bold text-gray-900 font-heading">Activity Log Detail</h3>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Action Type</p>
                  <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wider text-white mt-1 ${
                    selectedActivity.action === 'CREATE' ? 'bg-emerald-500' :
                    selectedActivity.action === 'UPDATE' ? 'bg-blue-500' : 'bg-rose-500'
                  }`}>
                    {selectedActivity.action}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Database Entity</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{selectedActivity.entity}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Details</p>
                <p className="text-xs text-gray-700 font-medium leading-relaxed bg-gray-50 border border-gray-100 p-3 rounded-xl mt-1">
                  {selectedActivity.details}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Administrator</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">{selectedActivity.adminEmail}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Timestamp</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">
                    {new Date(selectedActivity.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Full Log JSON Data</p>
                <pre className="text-[10px] font-mono bg-gray-900 text-gray-200 p-3.5 rounded-xl overflow-x-auto max-h-40 leading-relaxed shadow-inner">
                  {JSON.stringify(selectedActivity, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 mt-5">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * AdminLayout — Sidebar + content shell for all admin pages.
 * Checks auth on mount — redirects to /admin/login if no session.
 * Theme: Brand-blue sidebar + white content (no dark mode)
 */
import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import NotFoundPage from '@/pages/NotFoundPage'
import {
  LayoutDashboard,
  MessageSquare,
  Briefcase,
  FolderKanban,
  Users,
  LogOut,
  Menu,
  X,
  Settings,
  Star,
  HelpCircle,
  Flag,
  Handshake,
  SlidersHorizontal,
  Bell,
  ChevronRight,
  BookOpen,
  UserCheck,
  FileText,
  Plug,
  Database,
  CheckSquare,
  StickyNote,
  Calendar,
  History,
  Activity,
  Newspaper,
  Search,
  Loader2,
  Trash2,
  Bot,
  Share2,
  DollarSign,
} from 'lucide-react'
import { api } from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/leads', icon: MessageSquare, label: 'Leads', badge: 'new', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/pricing', icon: DollarSign, label: 'Pricing Manager', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/proposal-book', icon: FileText, label: 'Proposal Book', badge: 'A4', roles: ['ADMIN', 'SUPER_ADMIN', 'STAFF'] },
      { to: '/admin/chatbot-inquiries', icon: Bot, label: 'Chatbot Inquiries', roles: ['ADMIN', 'SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/services', icon: Briefcase, label: 'Services', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/projects', icon: FolderKanban, label: 'Projects', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/team', icon: Users, label: 'Team', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/careers', icon: UserCheck, label: 'Careers', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/testimonials', icon: Star, label: 'Testimonials', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/faqs', icon: HelpCircle, label: 'FAQs', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/milestones', icon: Flag, label: 'Milestones', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/partners', icon: Handshake, label: 'Partners', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/legal', icon: FileText, label: 'Legal Pages', roles: ['ADMIN', 'SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Blog',
    items: [
      { to: '/admin/blog', icon: Newspaper, label: 'Blog Posts', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/social-drafts', icon: Share2, label: 'Social Drafts', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/blog-comments', icon: MessageSquare, label: 'Comments', badge: 'comments', roles: ['ADMIN', 'SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Work Management',
    items: [
      { to: '/admin/client-projects', icon: FolderKanban, label: 'Client Projects', roles: ['ADMIN', 'SUPER_ADMIN', 'STAFF'] },
      { to: '/admin/tasks', icon: CheckSquare, label: 'Tasks', roles: ['ADMIN', 'SUPER_ADMIN', 'STAFF'] },
      { to: '/admin/tickets', icon: MessageSquare, label: 'Support Tickets', badge: 'tickets', roles: ['ADMIN', 'SUPER_ADMIN', 'STAFF'] },
      { to: '/admin/notes', icon: StickyNote, label: 'Notes', roles: ['ADMIN', 'SUPER_ADMIN', 'STAFF'] },
      { to: '/admin/calendar', icon: Calendar, label: 'Calendar', roles: ['ADMIN', 'SUPER_ADMIN', 'STAFF'] },
      { to: '/admin/activities', icon: History, label: 'Activity Log', roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Settings',
    items: [
      { to: '/admin/site-settings', icon: SlidersHorizontal, label: 'Site Settings', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/users', icon: Users, label: 'Admins & Staff', roles: ['SUPER_ADMIN'] },
      { to: '/admin/integrations', icon: Plug, label: 'Integrations', badge: 'key', roles: ['SUPER_ADMIN'] },
      { to: '/admin/monitoring', icon: Activity, label: 'Monitoring', badge: 'live', roles: ['SUPER_ADMIN'] },
      { to: '/admin/backup', icon: Database, label: 'Data Backup', badge: 'dl', roles: ['SUPER_ADMIN'] },
      { to: '/admin/recycle-bin', icon: Trash2, label: 'Recycle Bin', roles: ['ADMIN', 'SUPER_ADMIN'] },
      { to: '/admin/settings', icon: Settings, label: 'Account', roles: ['ADMIN', 'SUPER_ADMIN', 'STAFF'] },
    ],
  },
  {
    label: 'Support',
    items: [{ to: '/admin/help', icon: BookOpen, label: 'Help / Guide', roles: ['ADMIN', 'SUPER_ADMIN', 'STAFF'] }],
  },
]

const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/leads': 'Leads',
  '/admin/services': 'Services',
  '/admin/projects': 'Projects',
  '/admin/team': 'Team',
  '/admin/careers': 'Careers',
  '/admin/testimonials': 'Testimonials',
  '/admin/faqs': 'FAQs',
  '/admin/milestones': 'Milestones',
  '/admin/partners': 'Partners',
  '/admin/legal': 'Legal Pages',
  '/admin/recycle-bin': 'Recycle Bin',
  '/admin/site-settings': 'Site Settings',
  '/admin/users': 'Admins & Staff',
  '/admin/integrations': 'Integrations',
  '/admin/monitoring': 'System Monitoring',
  '/admin/backup': 'Data Backup',
  '/admin/settings': 'Account',
  '/admin/help': 'Help / Guide',
  '/admin/client-projects': 'Client Projects',
  '/admin/tasks': 'Tasks',
  '/admin/notes': 'Notes',
  '/admin/calendar': 'Calendar',
  '/admin/activities': 'Activity Log',
  '/admin/blog': 'Blog Posts',
  '/admin/blog-comments': 'Blog Comments',
  '/admin/social-drafts': 'Social Post Drafts',
  '/admin/chatbot-inquiries': 'Chatbot Inquiries',
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [admin, setAdmin] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)

  const notifRef = useRef(null)
  const avatarRef = useRef(null)

  // Global search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)

  // Auto-close dropdowns and sidebar on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotifOpen(false)
    setAvatarOpen(false)
    setSidebarOpen(false)
  }, [location.pathname])

  // Close dropdowns on scroll anywhere in the admin area
  useEffect(() => {
    const handleScroll = () => {
      setNotifOpen(false)
      setAvatarOpen(false)
    }
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    return () => window.removeEventListener('scroll', handleScroll, { capture: true })
  }, [])

  // Close dropdowns on clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifOpen && notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
      if (avatarOpen && avatarRef.current && !avatarRef.current.contains(event.target)) {
        setAvatarOpen(false)
      }
      if (searchOpen && searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [notifOpen, avatarOpen, searchOpen])

  // Global search debouncing
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      return
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get(`/admin/search?q=${encodeURIComponent(searchQuery)}`)
        setSearchResults(res.data)
      } catch (err) {
        console.error('Global search error:', err)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  const currentTitle = PAGE_TITLES[location.pathname] || 'Admin'

  // Fetch leads and chatbot inquiries
  const { data: leads = [] } = useQuery({
    queryKey: ['admin-leads', ''], // shares cache with Leads Page statusFilter=''
    queryFn: () => api.get('/admin/leads').then((r) => r.data),
    enabled: !!admin,
    refetchInterval: 30000, // poll every 30s
  })

  const { data: inquiries = [] } = useQuery({
    queryKey: ['chatbot-inquiries'],
    queryFn: () => api.get('/chatbot/admin/inquiries').then((r) => r.data.data),
    enabled: !!admin,
    refetchInterval: 30000, // poll every 30s
  })

  // Pending blog comments
  const { data: pendingCommentsRaw = [] } = useQuery({
    queryKey: ['admin-blog-comments', 'false'],
    queryFn: () => api.get('/admin/blog/comments?approved=false').then((r) => r.data),
    enabled: !!admin,
    refetchInterval: 60000,
  })
  const pendingBlogCommentsCount = Array.isArray(pendingCommentsRaw) ? pendingCommentsRaw.length : 0

  // Unread admin support tickets
  const { data: adminTicketsRaw = [] } = useQuery({
    queryKey: ['admin-tickets-badge'],
    queryFn: () => api.get('/admin/tickets').then((res) => res.data),
    enabled: !!admin,
    refetchInterval: 30000,
  })
  const unreadTicketsCount = Array.isArray(adminTicketsRaw)
    ? adminTicketsRaw.filter((t) => t.adminHasUnread).length
    : 0

  // Format notifications
  const newLeads = leads.filter((l) => l.status === 'NEW')
  const newInquiries = inquiries.filter((i) => !i.isAnswered)
  const totalUnread = newLeads.length + newInquiries.length

  const formatTimeAgo = (dateStr) => {
    const d = new Date(dateStr)
    // eslint-disable-next-line react-hooks/purity
    const diffMs = Date.now() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return d.toLocaleDateString()
  }

  const notificationItems = [
    ...newLeads.map((l) => ({
      id: `lead-${l.id}`,
      title: `Lead: ${l.name}`,
      description: l.message,
      time: new Date(l.createdAt).getTime(),
      timeLabel: formatTimeAgo(l.createdAt),
      icon: MessageSquare,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      to: '/admin/leads',
    })),
    ...newInquiries.map((i) => ({
      id: `inquiry-${i.id}`,
      title: 'Chatbot Inquiry',
      description: i.question,
      time: new Date(i.createdAt).getTime(),
      timeLabel: formatTimeAgo(i.createdAt),
      icon: HelpCircle,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      to: '/admin/faqs',
    })),
  ].sort((a, b) => b.time - a.time)

  const [authFailed, setAuthFailed] = useState(false)

  useEffect(() => {
    api
      .get('/admin/me')
      .then((r) => setAdmin(r.data))
      .catch(() => setAuthFailed(true))
  }, [])

  const handleLogout = async () => {
    const secretPath = localStorage.getItem('admin_secret_path')
    await api.post('/admin/logout', {})
    if (secretPath && secretPath !== 'invalid') {
      navigate(`/admin-${secretPath}`, { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }

  if (location.pathname === '/admin' || location.pathname === '/admin/' || authFailed) {
    return <NotFoundPage />
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading admin panel…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col h-full
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex`}
        style={{ background: 'linear-gradient(175deg, #1A3E8C 0%, #0f2660 100%)' }}
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/logo-with-bg.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            <div>
              <p className="font-heading font-bold text-white text-sm leading-none">Hindustan</p>
              <p className="text-white/40 text-[10px] font-medium tracking-wider uppercase">
                Projects Admin
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/50 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Nav links ── */}
        <nav
          className="flex-1 py-4 px-3 overflow-y-auto space-y-5 scrollbar-thin"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}
          aria-label="Admin navigation"
        >
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (item.roles && !item.roles.includes(admin.role)) {
                return false
              }
              return true
            })

            if (visibleItems.length === 0) return null

            return (
              <div key={group.label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 mb-1.5">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map(({ to, icon: Icon, label, badge }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-150 group ${
                          isActive
                            ? 'bg-white/15 text-white shadow-sm'
                            : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-red rounded-full" />
                          )}
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1">{label}</span>
                          {badge === 'new' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                          )}
                          {badge === 'key' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0 tracking-wide">
                              API
                            </span>
                          )}
                          {badge === 'dl' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 shrink-0 tracking-wide">
                              ↓
                            </span>
                          )}
                          {badge === 'comments' && pendingBlogCommentsCount > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/30 text-amber-200 border border-amber-400/30 shrink-0">
                              {pendingBlogCommentsCount}
                            </span>
                          )}
                          {badge === 'tickets' && unreadTicketsCount > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white shrink-0 animate-pulse">
                              {unreadTicketsCount}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        {/* ── User + logout ── */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-1">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-brand-red to-orange-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {admin.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/80 font-medium truncate">{admin.email}</p>
              <p className="text-[10px] text-white/40 truncate">{admin.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm
              font-medium text-white/50 hover:bg-red-500/15 hover:text-red-300 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <header
          className="h-16 bg-white border-b border-gray-200 flex items-center
          justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-20 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-400 hidden sm:inline">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:inline" />
              <span className="font-semibold text-gray-800">{currentTitle}</span>
            </div>
          </div>

          {/* Global Search Bar (Admin only) */}
          <div ref={searchRef} className="relative hidden md:block w-72 max-w-xs z-30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads, tasks, blog..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value
                  setSearchQuery(val)
                  setSearchOpen(true)
                  if (val.trim().length < 2) {
                    setSearchResults(null)
                    setSearchLoading(false)
                  } else {
                    setSearchLoading(true)
                  }
                }}
                onFocus={() => setSearchOpen(true)}
                className="w-full pl-9 pr-8 py-1.5 text-xs border border-gray-250 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin" />
              )}
            </div>

            {/* Floating Dropdown Results */}
            {searchOpen && searchResults && (
              <div className="absolute left-0 mt-1.5 w-[360px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-100">
                <div className="px-4 py-2 border-b border-gray-150 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Search Results
                </div>
                <div className="overflow-y-auto divide-y divide-gray-100 scrollbar-thin">
                  {Object.keys(searchResults).every(k => searchResults[k].length === 0) ? (
                    <div className="p-4 text-center text-xs text-gray-400">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    Object.entries(searchResults).map(([category, items]) => {
                      if (items.length === 0) return null
                      return (
                        <div key={category} className="py-2">
                          <div className="px-4 py-1 text-[10px] font-bold text-brand-blue uppercase tracking-wide">
                            {category === 'leads' ? 'Contact Leads' :
                             category === 'projects' ? 'Client Projects' :
                             category === 'tasks' ? 'Work Tasks' :
                             category === 'blog' ? 'Blog Posts' :
                             category === 'team' ? 'Team Members' : category}
                          </div>
                          {items.map((item) => (
                            <Link
                              key={item.id}
                              to={item.route}
                              onClick={() => {
                                setSearchOpen(false)
                                setSearchQuery('')
                              }}
                              className="block px-4 py-2 hover:bg-slate-50 transition-colors text-left"
                            >
                              <div className="text-xs font-semibold text-gray-800 line-clamp-1">
                                {item.title}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                                {item.subtitle}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
             {/* Bell Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`relative w-9 h-9 rounded-lg flex items-center justify-center
                hover:bg-gray-100 transition-colors ${notifOpen ? 'bg-gray-100 text-brand-blue' : 'text-gray-500'}`}
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {totalUnread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {totalUnread}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60 shrink-0">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Notifications</span>
                    {totalUnread > 0 && (
                      <span className="text-[10px] font-semibold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full">
                        {totalUnread} new
                      </span>
                    )}
                  </div>

                  <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50">
                    {notificationItems.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">No new notifications</p>
                      </div>
                    ) : (
                      notificationItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setNotifOpen(false)
                            navigate(item.to)
                          }}
                          className="w-full text-left p-3.5 hover:bg-gray-50/60 transition-colors flex gap-3 items-start"
                        >
                          <div className={`p-2 rounded-lg shrink-0 ${item.iconBg}`}>
                            <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-1">
                              <p className="text-xs font-bold text-gray-800 truncate">{item.title}</p>
                              <span className="text-[9px] text-gray-400 whitespace-nowrap shrink-0">
                                {item.timeLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* View site */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-brand-blue
                bg-brand-blue/8 hover:bg-brand-blue/15 border border-brand-blue/20
                px-3 py-1.5 rounded-lg transition-colors"
            >
              View Site →
            </a>
            {/* Avatar Dropdown */}
            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="w-9 h-9 rounded-full bg-linear-to-br from-brand-blue to-[#0f2660]
                flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm
                hover:opacity-90 transition-opacity focus:outline-none"
              >
                {admin.email[0].toUpperCase()}
              </button>

              {avatarOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col py-1">
                  {/* Profile Header */}
                  <div className="px-4 py-2.5 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-800 truncate">{admin.email}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5 tracking-wider">
                      {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Administrator'}
                    </p>
                  </div>

                  {/* Links */}
                  <button
                    onClick={() => {
                      setAvatarOpen(false)
                      navigate('/admin/settings')
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-400" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      setAvatarOpen(false)
                      navigate('/admin/help')
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                    Help & Guide
                  </button>

                  <div className="border-t border-gray-50 my-1" />

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setAvatarOpen(false)
                      handleLogout()
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50/50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet context={{ admin, setAdmin }} />
        </main>
      </div>
    </div>
  )
}

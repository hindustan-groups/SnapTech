/**
 * AdminHelpPage — Modern Knowledge Base & Enterprise Documentation Hub
 */
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Users,
  MessageSquare,
  Key,
  Cpu,
  Globe,
  Database,
  HardDrive,
  Mail,
  Phone,
  UserCheck,
  FileText,
  Activity,
  Search,
  X,
  Sparkles,
  Layers,
  ShieldCheck,
  Check,
  ArrowRight,
  HelpCircle,
  Zap,
} from 'lucide-react'
import { SEO } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

// ── Documentation Categories ──────────────────────────────────
const CATEGORIES = [
  { id: 'ALL', label: 'All Guides' },
  { id: 'CMS', label: 'Content & CMS', icon: Layers },
  { id: 'CRM', label: 'CRM & Leads', icon: MessageSquare },
  { id: 'SECURITY', label: 'Security & Auth', icon: ShieldCheck },
  { id: 'AUTOMATIONS', label: 'Automations & Crons', icon: Cpu },
  { id: 'MONITORING', label: 'Monitoring & Health', icon: Activity },
]

// ── Documentation Sections Data ───────────────────────────────
const SECTIONS = [
  {
    id: 'dashboard',
    category: 'CMS',
    title: 'Dashboard & Executive Metrics',
    subtitle: 'Understand stats cards, live activity counters, and project summaries',
    icon: LayoutDashboard,
    badge: 'Core Navigation',
    link: '/admin/dashboard',
    steps: [
      {
        num: '1',
        title: 'Total Leads Counter',
        desc: 'Displays inbound customer inquiries submitted through contact forms. Green indicators show new unread leads.',
      },
      {
        num: '2',
        title: 'Total Projects & Portfolio',
        desc: 'Shows active portfolio items published on the public website.',
      },
      {
        num: '3',
        title: 'Total Services Offered',
        desc: 'Displays active IT services currently presented to website visitors.',
      },
      {
        num: '4',
        title: 'Social Drafts Widget',
        desc: 'Provides 1-click formatted social media post drafts generated when projects are marked as Featured.',
      },
    ],
  },
  {
    id: 'services',
    category: 'CMS',
    title: 'Managing Services Catalog',
    subtitle: 'Add, edit, remove or reorder IT service offerings',
    icon: Briefcase,
    badge: 'Public Website',
    link: '/admin/services',
    steps: [
      {
        num: '1',
        title: 'Access Services',
        desc: 'Click "Services" in the admin sidebar menu to view all listed service cards.',
      },
      {
        num: '2',
        title: 'Create a Service',
        desc: 'Click "+ Add Service", fill in Title, unique URL Slug, select an Icon, add a short summary, and enter the main detailed description.',
      },
      {
        num: '3',
        title: 'Edit & Delete Actions',
        desc: 'Click the Pencil icon on any row to edit details, or the Trash icon to remove a service.',
      },
      {
        num: '4',
        title: 'Control Display Sorting',
        desc: 'Set the "Display Order" number (e.g. 1, 2, 3). Lower numbers appear first on the public website.',
      },
    ],
  },
  {
    id: 'projects',
    category: 'CMS',
    title: 'Managing Projects & Case Studies',
    subtitle: 'Showcase work, add live demo links, uploaded files, and featured tags',
    icon: FolderKanban,
    badge: 'Portfolio Showcase',
    link: '/admin/projects',
    steps: [
      {
        num: '1',
        title: 'Access Projects',
        desc: 'Click "Projects" in the sidebar menu to view your portfolio case studies.',
      },
      {
        num: '2',
        title: 'Fill Project Metadata',
        desc: 'Click "+ Add Project", enter Title, Client Name, select Category (Web, App, AI, etc.), and list tech stack tags separated by commas.',
      },
      {
        num: '3',
        title: 'Add Live Demo URL',
        desc: 'Paste the live site URL into the "Live Project URL" field so visitors can launch live demos.',
      },
      {
        num: '4',
        title: 'Upload Thumbnail Asset',
        desc: 'Use Cloudinary Image Uploader to attach screenshots (recommended PNG/JPG under 5MB for fast loading).',
      },
      {
        num: '5',
        title: 'Set Featured Flag',
        desc: 'Check the "Featured Project" box to highlight the project on the main homepage carousel.',
      },
    ],
  },
  {
    id: 'team',
    category: 'CMS',
    title: 'Managing Team & Staff Profiles',
    subtitle: 'Manage team member profiles displayed on the About Us page',
    icon: Users,
    badge: 'About Page',
    link: '/admin/team',
    steps: [
      {
        num: '1',
        title: 'Access Team Directory',
        desc: 'Click "Team" in the sidebar to view existing staff member profiles.',
      },
      {
        num: '2',
        title: 'Create Member Profile',
        desc: 'Click "+ Add Member", fill in Full Name, Job Role, short bio, and LinkedIn URL.',
      },
      {
        num: '3',
        title: 'Upload Profile Image',
        desc: 'Attach a square portrait image (JPG/PNG under 2MB).',
      },
      {
        num: '4',
        title: 'Sort Team Ordering',
        desc: 'Use the "Order" field inside the profile form to sequence team display on the website.',
      },
    ],
  },
  {
    id: 'leads',
    category: 'CRM',
    title: 'Managing Leads & Client Inquiries',
    subtitle: 'Filter inbound messages, update status pipelines, and track client follow-ups',
    icon: MessageSquare,
    badge: 'Lead Generation',
    link: '/admin/leads',
    steps: [
      {
        num: '1',
        title: 'Check Inbound Messages',
        desc: 'Click "Leads" in the sidebar. New unread leads trigger visual notification badges.',
      },
      {
        num: '2',
        title: 'Expand Lead Card',
        desc: 'Click on any lead row to view phone, email, budget estimate, and full message text.',
      },
      {
        num: '3',
        title: 'Update Pipeline Status',
        desc: 'Set lead status to NEW, CONTACTED, IN_PROGRESS, or CLOSED to keep team track clean.',
      },
      {
        num: '4',
        title: 'Export Leads CSV',
        desc: 'Click "Export CSV" to download lead contact data for external CRM or email marketing.',
      },
    ],
  },
  {
    id: 'careers',
    category: 'CRM',
    title: 'Managing Job Postings & Applications',
    subtitle: 'Post open vacancies, review applicant resumes, and track recruitment',
    icon: UserCheck,
    badge: 'HR & Recruitment',
    link: '/admin/careers',
    steps: [
      {
        num: '1',
        title: 'Open Careers Dashboard',
        desc: 'Click "Careers" in the sidebar menu to view Job Postings and Applicant Submissions.',
      },
      {
        num: '2',
        title: 'Create Job Posting',
        desc: 'Click "+ Add Job Posting", fill in Role Title, location, type (Full-time, Internship), and responsibilities.',
      },
      {
        num: '3',
        title: 'Toggle Active Visibility',
        desc: 'Set job status to Active (green) to publish on public /careers page, or Draft (gray) to hide.',
      },
      {
        num: '4',
        title: 'Review Resumes & CVs',
        desc: 'Click the Applications tab to read cover letters and download candidate CV attachments.',
      },
      {
        num: '5',
        title: 'Update Candidate Pipeline',
        desc: 'Set applicant status to New, Shortlisted, Rejected, or Hired.',
      },
    ],
  },
  {
    id: 'credentials',
    category: 'SECURITY',
    title: 'Account & Security Settings',
    subtitle: 'Update email, change password, configure 2FA, and manage master access keys',
    icon: Key,
    badge: 'Authentication',
    link: '/admin/settings',
    steps: [
      {
        num: '1',
        title: 'Open Account Settings',
        desc: 'Click "Account Settings" under the Settings menu section.',
      },
      {
        num: '2',
        title: 'Update Primary Email',
        desc: 'Type new email address, enter current password to authorize, and click Update Email.',
      },
      {
        num: '3',
        title: 'Change Password',
        desc: 'Use the Password Strength Meter to create a strong password with 8+ chars, uppercase, and numbers.',
      },
      {
        num: '4',
        title: 'Setup Two-Factor Auth (2FA)',
        desc: 'Scan the QR code inside Google Authenticator or Authy app and enter the 6-digit TOTP code.',
      },
      {
        num: '5',
        title: 'Integration Master Key (Super Admin)',
        desc: 'Manage master access key that protects database credentials and Cloudinary integration settings.',
      },
    ],
  },
  {
    id: 'legal',
    category: 'CMS',
    title: 'Managing Legal & Compliance Pages',
    subtitle: 'Edit Privacy Policy, Terms of Service, and Refund Policy texts',
    icon: FileText,
    badge: 'Compliance',
    link: '/admin/legal',
    steps: [
      {
        num: '1',
        title: 'Open Legal Editor',
        desc: 'Click "Legal Pages" in the sidebar menu. Switch tabs for Privacy Policy, Terms, or Refund Policy.',
      },
      {
        num: '2',
        title: 'Format Rich Text',
        desc: 'Use the editor toolbar to add headings, bulleted lists, bold emphasis, and hyperlinks.',
      },
      {
        num: '3',
        title: 'Save & Publish',
        desc: 'Click "Save Changes" at the bottom to publish updated policy text live immediately.',
      },
    ],
  },
  {
    id: 'automations',
    category: 'AUTOMATIONS',
    title: 'Automation & Scheduled Tasks (Crons)',
    subtitle: 'Understand background cron jobs, WhatsApp alerts, nightly backups, and chatbot',
    icon: Cpu,
    badge: 'Background Services',
    link: '/admin/backup',
    steps: [
      {
        num: '1',
        title: 'Auto Lead Follow-Up Cron',
        desc: 'Runs every 6 hours ("0 */6 * * *"). Scans for NEW uncontacted leads older than 24 hours and dispatches reminder email.',
      },
      {
        num: '2',
        title: 'Instant WhatsApp Notifications',
        desc: 'Sends real-time WhatsApp alerts with client name and contact info whenever a lead or job application is submitted.',
      },
      {
        num: '3',
        title: 'Weekly Summary Executive Report',
        desc: 'Dispatched every Monday morning at 9:00 AM ("0 9 * * 1") compiling weekly lead stats and project activity.',
      },
      {
        num: '4',
        title: 'Nightly Database Backup',
        desc: 'Runs daily at 2:00 AM ("0 2 * * *"). Creates a full JSON database snapshot and attaches it to the admin email.',
      },
      {
        num: '5',
        title: 'Social Marketing Drafts',
        desc: 'Automatically generates ready-to-post social media draft content whenever a project is set to Featured.',
      },
    ],
  },
  {
    id: 'monitoring-guide',
    category: 'MONITORING',
    title: 'Monitoring, Analytics & Health Checks',
    subtitle: 'Track website traffic hits, analyze popular URLs, and watch system crash logs',
    icon: Activity,
    badge: 'System Telemetry',
    link: '/admin/monitoring',
    steps: [
      {
        num: '1',
        title: 'Site Traffic Analytics',
        desc: 'Click "Monitoring" in sidebar. Under "Site Traffic", view total page hits for Today, This Week, and This Month.',
      },
      {
        num: '2',
        title: 'Popular Pages Ranking',
        desc: 'View top visited routes (e.g. /services, /portfolio) ordered by total views to identify popular content.',
      },
      {
        num: '3',
        title: 'Javascript Crash Logs',
        desc: 'View real-time error logs capturing frontend crashes or API failures with timestamps and stack traces.',
      },
      {
        num: '4',
        title: 'System Health & Heap Memory',
        desc: 'Refreshes every 30 seconds to monitor Database connection status (ONLINE/OFFLINE), memory usage, and CPU load.',
      },
    ],
  },
]

export default function AdminHelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [openSections, setOpenSections] = useState({})
  const [copiedEmail, setCopiedEmail] = useState(false)
  const { addToast } = useToast()

  const toggleSection = (id) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const expandAll = () => {
    const allObj = {}
    SECTIONS.forEach((sec) => {
      allObj[sec.id] = true
    })
    setOpenSections(allObj)
    addToast('Expanded all documentation topics', 'info')
  }

  const collapseAll = () => {
    setOpenSections({})
    addToast('Collapsed all topics', 'info')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedEmail(true)
    addToast('Developer email copied to clipboard', 'info')
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  // Filtered sections based on Category & Search
  const filteredSections = useMemo(() => {
    return SECTIONS.filter((sec) => {
      const matchCategory = activeCategory === 'ALL' || sec.category === activeCategory
      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchCategory

      const matchTitle = sec.title.toLowerCase().includes(q)
      const matchSubtitle = sec.subtitle.toLowerCase().includes(q)
      const matchSteps = sec.steps.some(
        (st) => st.title.toLowerCase().includes(q) || st.desc.toLowerCase().includes(q)
      )

      return matchCategory && (matchTitle || matchSubtitle || matchSteps)
    })
  }, [activeCategory, searchQuery])

  return (
    <>
      <SEO title="Help & Documentation Hub" noIndex />
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-linear-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <BookOpen className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">Help & Knowledge Base</h1>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                      Staff Documentation
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm mt-0.5">
                    Comprehensive user guide and operational manual for SnapTech Digital Admin Portal.
                  </p>
                </div>
              </div>

              {/* Action counter pill */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-2xl shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold text-white">10 Enterprise Modules Covered</span>
              </div>
            </div>

            {/* Live Search Bar inside Header */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, password changes, leads, backup crons, or error logs..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/95 text-gray-900 placeholder:text-gray-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/30 transition-all shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Category Filter Pills & Global Controls ──────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Expand / Collapse Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={expandAll}
              className="text-xs font-bold text-brand-blue hover:text-brand-blue-hover hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={collapseAll}
              className="text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* ── Documentation Accordion Cards List ────────────────── */}
        {filteredSections.length > 0 ? (
          <div className="space-y-4">
            {filteredSections.map((sec) => {
              const Icon = sec.icon
              const isOpen = Boolean(openSections[sec.id] || searchQuery.trim().length > 0)
              return (
                <div
                  key={sec.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-brand-blue/40 shadow-md ring-1 ring-brand-blue/10'
                      : 'border-gray-200/80 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  {/* Trigger Header */}
                  <div
                    onClick={() => toggleSection(sec.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left select-none cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
                          isOpen ? 'bg-brand-blue text-white shadow-sm' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-brand-blue'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-base font-bold text-gray-900">{sec.title}</h3>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md border border-gray-200">
                            {sec.badge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{sec.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        to={sec.link}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100"
                      >
                        <span>Open Page</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <div
                        className={`p-1.5 rounded-lg text-gray-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-brand-blue' : 'group-hover:text-gray-600'
                        }`}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Body */}
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50/40 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                        {sec.steps.map((st) => (
                          <div
                            key={st.num}
                            className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-2xs hover:border-brand-blue/30 transition-all flex gap-3.5"
                          >
                            <div className="w-7 h-7 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {st.num}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-900 leading-snug">{st.title}</h4>
                              <p className="text-xs text-gray-600 leading-relaxed mt-1">{st.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-1">
                        <Link
                          to={sec.link}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-hover px-3.5 py-2 rounded-xl transition-all shadow-xs"
                        >
                          <span>Launch {sec.title.split(' ')[0]} Module</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-10 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No matching topics found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No documentation steps match "{searchQuery}". Try searching for terms like "leads", "2FA", "password", "backup", or clear your filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveCategory('ALL')
              }}
              className="text-xs font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </div>
        )}

        {/* ── System Architecture & Platform Specs Card ───────── */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-gray-900">
                Enterprise Infrastructure & Technology Stack
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Technical architecture, database engines, and media CDN platforms powering this system.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
                <Globe className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Frontend App</span>
                <span className="text-xs font-bold text-gray-900">React 19 + Vite</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
                <Cpu className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Backend API</span>
                <span className="text-xs font-bold text-gray-900">Node.js Express 5</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
                <Database className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Database ORM</span>
                <span className="text-xs font-bold text-gray-900">Prisma + PostgreSQL</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
                <HardDrive className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Media Storage</span>
                <span className="text-xs font-bold text-gray-900">Cloudinary Asset CDN</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Developer Support Footer ──────────────────────────── */}
        <div className="bg-linear-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 border border-blue-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-heading text-base font-bold text-brand-blue flex items-center gap-2 justify-center sm:justify-start">
              <span>Need Direct Developer Assistance?</span>
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            </h4>
            <p className="text-xs text-gray-600 max-w-lg leading-relaxed">
              If you require custom feature modifications, database schema updates, or urgent technical support, reach out directly to lead engineering team.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => copyToClipboard('support@snaptech.digital')}
              className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5 text-brand-blue" />}
              <span>{copiedEmail ? 'Copied Email' : 'Email Dev'}</span>
            </button>

            <a
              href="https://wa.me/919414112057?text=Hi%20SnapTech%20Support,%20I%20need%20developer%20assistance"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp Dev</span>
            </a>
          </div>
        </div>

      </div>
    </>
  )
}

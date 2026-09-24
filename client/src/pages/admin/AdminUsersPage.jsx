/**
 * AdminUsersPage — User Access & Permissions Control Center
 * Super Admin management for Admin, Staff, and Client Portal accounts.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  UserPlus,
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Power,
  Trash2,
  Lock,
  Mail,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Copy,
  Link2,
  Send,
  Check,
  FolderLock,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO, ConfirmModal } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

const inputCls =
  'w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-sans'

const DELEGABLE_MODULES = [
  { id: 'CMS_SERVICES', label: 'Services Management', desc: 'Add/edit IT services on main website' },
  { id: 'CMS_PROJECTS', label: 'Portfolio Projects', desc: 'Manage case studies & featured portfolio' },
  { id: 'CMS_TEAM', label: 'Team Members', desc: 'Manage About page staff section' },
  { id: 'CMS_BLOG', label: 'Blog Posts & Comments', desc: 'Write blogs and moderate reader comments' },
  { id: 'CMS_CAREERS', label: 'Careers & Applications', desc: 'Post jobs and review applicant resumes' },
  { id: 'CRM_LEADS', label: 'CRM Sales Leads', desc: 'View and follow up with client inquiries' },
  { id: 'WORK_TASKS', label: 'Task Management', desc: 'Assign & update staff tasks & Kanban' },
  { id: 'CLIENT_PROJECTS', label: 'Client Projects', desc: 'Manage active client deliverables & progress' },
  { id: 'SOCIAL_MARKETING', label: 'Social Marketing Suite', desc: 'Draft & schedule social campaigns' },
  { id: 'CHATBOT_INQUIRIES', label: 'Chatbot Inquiries', desc: 'Review visitor AI chatbot submissions' },
]

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [activeTab, setActiveTab] = useState('internal') // 'internal' | 'clients'

  // Form toggles & states
  const [showAddForm, setShowAddForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('STAFF')
  const [showPassword, setShowPassword] = useState(false)

  // Module Permission Delegation State
  const [delegatingUser, setDelegatingUser] = useState(null)
  const [assignedModulesSelection, setAssignedModulesSelection] = useState([])

  // Create Client Form State
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientProjectIds, setClientProjectIds] = useState([])

  // Link Projects Modal State
  const [linkingClient, setLinkingClient] = useState(null)
  const [linkedProjectsSelection, setLinkedProjectsSelection] = useState([])

  // Reset Password State
  const [resetUserId, setResetUserId] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Copy Feedback State
  const [copiedToken, setCopiedToken] = useState(null)

  // Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemTitle: '',
    onConfirm: null,
  })

  // 1. Fetch Staff/Admin Users
  const { data: users = [], isLoading, isError, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
    enabled: activeTab === 'internal',
  })

  // 2. Fetch Client Portal accounts
  const { data: clients = [], isLoading: isClientsLoading, isError: isClientsError, refetch: refetchClients } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: () => api.get('/admin/clients').then((r) => r.data),
    enabled: activeTab === 'clients',
  })

  // 3. Fetch System Projects
  const { data: systemProjects = [] } = useQuery({
    queryKey: ['admin-system-projects'],
    queryFn: () => api.get('/admin/projects').then((r) => r.data),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newUser) => api.post('/admin/users', newUser),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      addToast(res.message || 'Staff account created successfully & credentials emailed!', 'success')
      setShowAddForm(false)
      setEmail('')
      setPassword('')
      setRole('STAFF')
    },
    onError: (err) => {
      addToast(err.response?.data?.message || err.message || 'Failed to create user account.', 'error')
    },
  })

  const createClientMutation = useMutation({
    mutationFn: (newClient) => api.post('/admin/clients', newClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] })
      addToast('Client Portal account created successfully and invitation email sent!', 'success')
      setShowAddForm(false)
      setClientName('')
      setClientEmail('')
      setClientProjectIds([])
    },
    onError: (err) => {
      addToast(err.response?.data?.message || err.message || 'Failed to create client account.', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => api.patch(`/admin/users/${id}`, updates),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      addToast(res.message || 'User account updated successfully!', 'success')
      setResetUserId(null)
      setNewPassword('')
    },
    onError: (err) => {
      addToast(err.response?.data?.message || err.message || 'Failed to update user account.', 'error')
    },
  })

  const updateClientMutation = useMutation({
    mutationFn: ({ id, updates }) => api.patch(`/admin/clients/${id}`, updates),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] })
      addToast(res.message || 'Client account updated successfully!', 'success')
      setLinkingClient(null)
    },
    onError: (err) => {
      addToast(err.response?.data?.message || err.message || 'Failed to update client account.', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      addToast(res.message || 'User account permanently deleted.', 'info')
    },
    onError: (err) => {
      addToast(err.response?.data?.message || err.message || 'Failed to delete user account.', 'error')
    },
  })

  const deleteClientMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] })
      addToast('Client account permanently deleted.', 'info')
    },
    onError: (err) => {
      addToast(err.response?.data?.message || err.message || 'Failed to delete client account.', 'error')
    },
  })

  // Event Handlers
  const handleCreateUser = (e) => {
    e.preventDefault()
    if (!email || !password || !role) {
      addToast('All fields are required.', 'error')
      return
    }
    createMutation.mutate({ email, password, role })
  }

  const handleCreateClient = (e) => {
    e.preventDefault()
    if (!clientName || !clientEmail) {
      addToast('Name and email are required.', 'error')
      return
    }
    createClientMutation.mutate({
      name: clientName,
      email: clientEmail,
      projectIds: clientProjectIds,
    })
  }

  const handleToggleActive = (user) => {
    updateMutation.mutate({
      id: user.id,
      updates: { isActive: !user.isActive },
    })
  }

  const handleToggleClientActive = (client) => {
    updateClientMutation.mutate({
      id: client.id,
      updates: { isActive: !client.isActive },
    })
  }

  const handleResendClientInvite = (client) => {
    updateClientMutation.mutate({
      id: client.id,
      updates: { resendInvite: true },
    })
  }

  const handlePasswordResetSubmit = (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      addToast('Password must be at least 8 characters long.', 'error')
      return
    }
    updateMutation.mutate({
      id: resetUserId,
      updates: { password: newPassword },
    })
  }

  const handleSaveAssignedModules = () => {
    if (!delegatingUser) return
    updateMutation.mutate({
      id: delegatingUser.id,
      updates: { assignedModules: assignedModulesSelection },
    })
    setDelegatingUser(null)
  }

  const handleDeleteUser = (user) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Staff Account',
      message: 'Are you sure you want to permanently delete this administrative account? The user will lose system access immediately.',
      itemTitle: user.email,
      onConfirm: () => {
        deleteMutation.mutate(user.id)
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  const handleDeleteClient = (client) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Client Portal Account',
      message: 'Are you sure you want to permanently delete this client portal space? The client will no longer be able to access deliverables.',
      itemTitle: `${client.name} (${client.email})`,
      onConfirm: () => {
        deleteClientMutation.mutate(client.id)
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  const handleOpenLinkProjects = (client) => {
    setLinkingClient(client)
    setLinkedProjectsSelection(client.projects ? client.projects.map((p) => p.id) : [])
  }

  const handleSaveLinkedProjects = () => {
    if (!linkingClient) return
    updateClientMutation.mutate({
      id: linkingClient.id,
      updates: { projectIds: linkedProjectsSelection },
    })
  }

  const handleCopyLink = (token) => {
    const clientUrl = window.location.origin
    const setupUrl = `${clientUrl}/client/setup-password?token=${token}`
    navigator.clipboard.writeText(setupUrl)
    setCopiedToken(token)
    addToast('Password setup link copied to clipboard!', 'info')
    setTimeout(() => setCopiedToken(null), 2000)
  }

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase().trim())
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const filteredClients = clients.filter((c) => {
    const q = search.toLowerCase().trim()
    const matchesSearch =
      !q ||
      c.email.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    return matchesSearch
  })

  return (
    <>
      <SEO title="User Access Center" noIndex />
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-linear-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <Users className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                    User Access &amp; Control Center
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Super Admin Suite
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Manage administrative staff credentials, delegate module permissions, and control Client Portal spaces.
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  if (activeTab === 'internal') refetchUsers()
                  else refetchClients()
                  addToast('User roster refreshed', 'info')
                }}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Roster</span>
              </button>
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm)
                  setResetUserId(null)
                  setDelegatingUser(null)
                  setLinkingClient(null)
                }}
                className="px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{activeTab === 'internal' ? 'Register Staff User' : 'Register Client Account'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Stat Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Super Admins</p>
              <p className="text-xl font-extrabold font-heading text-gray-900">
                {users.filter((u) => u.role === 'SUPER_ADMIN').length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue border border-blue-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admins &amp; Staff</p>
              <p className="text-xl font-extrabold font-heading text-gray-900">
                {users.filter((u) => u.role !== 'SUPER_ADMIN').length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client Accounts</p>
              <p className="text-xl font-extrabold font-heading text-gray-900">
                {clients.length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unlinked Portal Clients</p>
              <p className="text-xl font-extrabold font-heading text-gray-900">
                {clients.filter((c) => !c.projects || c.projects.length === 0).length}
              </p>
            </div>
          </div>
        </div>

        {/* ── Segmented Navigation Tabs & Search Controls ───────── */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex gap-1.5 bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200/80">
            <button
              onClick={() => {
                setActiveTab('internal')
                setShowAddForm(false)
              }}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'internal'
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admins &amp; Staff Members</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('clients')
                setShowAddForm(false)
              }}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'clients'
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Client Portal Spaces</span>
            </button>
          </div>

          {/* Search Bar & Role Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={activeTab === 'internal' ? "Search staff by email..." : "Search clients by name or email..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {activeTab === 'internal' && (
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-bold text-gray-700"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ── Form View 1: Register Internal Staff User ───────────── */}
        {showAddForm && activeTab === 'internal' && (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-heading text-base font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-blue" />
                Register Internal Team Account
              </h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-650 text-xs font-bold cursor-pointer">Cancel</button>
            </div>

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Initial Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={inputCls}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Access Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-bold"
                >
                  <option value="STAFF">Staff (Assigned work management only)</option>
                  <option value="ADMIN">Admin (Full content &amp; leads management)</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold rounded-xl text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  {createMutation.isPending ? 'Sending credentials...' : 'Register Staff Account'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Form View 2: Register Client Portal Account ─────────── */}
        {showAddForm && activeTab === 'clients' && (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-heading text-base font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-blue" />
                Register Client Portal Account
              </h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-650 text-xs font-bold cursor-pointer">Cancel</button>
            </div>
            <p className="text-xs text-gray-500">
              An invitation email containing a secure password setup link will be automatically dispatched.
            </p>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Client Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className={inputCls}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Client Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="e.g. rajesh@company.com"
                      className={inputCls}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Initial Projects Checklist */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Link Initial Client Workspaces (Optional)</label>
                {systemProjects.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No system projects created yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-gray-50 border border-gray-200/80 rounded-xl max-h-36 overflow-y-auto">
                    {systemProjects.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200/80 shadow-xs cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={clientProjectIds.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setClientProjectIds([...clientProjectIds, p.id])
                            } else {
                              setClientProjectIds(clientProjectIds.filter(id => id !== p.id))
                            }
                          }}
                          className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                        />
                        <span className="text-xs font-bold text-gray-800 truncate">{p.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={createClientMutation.isPending}
                  className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold rounded-xl text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  {createClientMutation.isPending ? 'Sending Invite...' : 'Create & Send Portal Invitation'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Reset Password Card ────────────────────────────────── */}
        {resetUserId && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-heading text-base font-bold text-amber-950 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-700" />
              Reset Account Credentials
            </h2>
            <form onSubmit={handlePasswordResetSubmit} className="max-w-md space-y-4">
              <div>
                <label className="text-xs font-bold text-amber-900 block mb-1">New Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 chars)"
                    className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm border border-amber-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-800 p-1 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update Password & Dispatch Email'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetUserId(null)
                    setNewPassword('')
                  }}
                  className="border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Link Projects Card ─────────────────────────────────── */}
        {linkingClient && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <h2 className="font-heading text-base font-bold text-blue-950 flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-blue-700" />
                Manage Client Workspaces: <span className="underline">{linkingClient.name}</span>
              </h2>
              <button
                onClick={() => setLinkingClient(null)}
                className="text-blue-500 hover:text-blue-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-blue-900">
              Select projects to attach to this client's portal dashboard space.
            </p>

            {systemProjects.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No system projects created yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {systemProjects.map((p) => (
                  <label key={p.id} className="flex items-center gap-2.5 p-3 bg-white border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors shadow-xs">
                    <input
                      type="checkbox"
                      checked={linkedProjectsSelection.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLinkedProjectsSelection([...linkedProjectsSelection, p.id])
                        } else {
                          setLinkedProjectsSelection(linkedProjectsSelection.filter(id => id !== p.id))
                        }
                      }}
                      className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue w-4 h-4"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-gray-800 block truncate">{p.title}</span>
                      <span className="text-[10px] text-gray-400 block truncate uppercase tracking-wider">{p.category}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveLinkedProjects}
                disabled={updateClientMutation.isPending}
                className="bg-brand-blue hover:bg-brand-blue-hover text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{updateClientMutation.isPending ? 'Saving...' : 'Save Linked Workspaces'}</span>
              </button>
              <button
                onClick={() => setLinkingClient(null)}
                className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Module Access Delegation Card ───────────────────────── */}
        {delegatingUser && (
          <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-purple-100">
              <h2 className="font-heading text-base font-bold text-purple-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-700" />
                Delegate Module Access &amp; Permissions: <span className="underline">{delegatingUser.email}</span> ({delegatingUser.role})
              </h2>
              <button
                onClick={() => setDelegatingUser(null)}
                className="text-purple-500 hover:text-purple-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-purple-900">
              Select administrative modules authorized for this staff member.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {DELEGABLE_MODULES.map((m) => {
                const isChecked = assignedModulesSelection.includes(m.id)
                return (
                  <label
                    key={m.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-white border-purple-300 shadow-sm ring-1 ring-purple-400/30'
                        : 'bg-white/80 border-gray-200 hover:border-purple-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignedModulesSelection([...assignedModulesSelection, m.id])
                        } else {
                          setAssignedModulesSelection(assignedModulesSelection.filter((id) => id !== m.id))
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 mt-0.5"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-gray-900 block">{m.label}</span>
                      <span className="text-[10px] text-gray-500 block leading-tight mt-0.5">{m.desc}</span>
                    </div>
                  </label>
                )
              })}
            </div>

            <div className="flex gap-2 pt-2 border-t border-purple-100">
              <button
                onClick={handleSaveAssignedModules}
                disabled={updateMutation.isPending}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{updateMutation.isPending ? 'Saving Permissions...' : 'Save Module Permissions'}</span>
              </button>
              <button
                onClick={() => setDelegatingUser(null)}
                className="border border-purple-200 hover:bg-purple-100/50 text-purple-900 font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 1: INTERNAL STAFF USERS TABLE ──────────────────── */}
        {activeTab === 'internal' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                <RefreshCw className="w-7 h-7 text-brand-blue animate-spin" />
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading Team Accounts...</p>
              </div>
            ) : isError ? (
              <div className="p-12 text-center text-red-500 text-xs font-bold">Failed to load internal user accounts.</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs">No staff accounts found matching filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Team Member</th>
                      <th className="px-6 py-4">System Access</th>
                      <th className="px-6 py-4">Security (2FA)</th>
                      <th className="px-6 py-4">Account Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((u) => {
                      const isSuper = u.role === 'SUPER_ADMIN'
                      return (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-brand-blue/20">
                                {u.email[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate text-xs sm:text-sm">{u.email}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Created {new Date(u.createdAt).toLocaleDateString('en-IN')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                                isSuper
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : u.role === 'ADMIN'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {isSuper ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : 'Staff'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {u.twoFactorEnabled ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> 2FA Active
                              </span>
                            ) : (
                              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                                <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> Unsecured
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                                u.isActive ? 'text-emerald-600' : 'text-red-500'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-red-400'}`} />
                              {u.isActive ? 'Active' : 'Deactivated'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Toggle Active status */}
                              {!isSuper && (
                                <button
                                  onClick={() => handleToggleActive(u)}
                                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                    u.isActive
                                      ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
                                      : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  }`}
                                  title={u.isActive ? 'Deactivate Account' : 'Reactivate Account'}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Manage Delegated Modules */}
                              {!isSuper && (
                                <button
                                  onClick={() => {
                                    setDelegatingUser(u)
                                    setAssignedModulesSelection(u.assignedModules || [])
                                    setResetUserId(null)
                                    setShowAddForm(false)
                                    setLinkingClient(null)
                                  }}
                                  className="p-2 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl transition-colors cursor-pointer"
                                  title="Delegate Module Access & Permissions"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Reset Password trigger */}
                              <button
                                onClick={() => {
                                  setResetUserId(u.id)
                                  setShowAddForm(false)
                                  setLinkingClient(null)
                                }}
                                className="p-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors cursor-pointer"
                                title="Reset Password"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete User */}
                              {!isSuper && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                                  title="Delete Account"
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
        )}

        {/* ── TAB 2: CLIENT PORTAL ACCOUNTS TABLE ────────────────── */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
            {isClientsLoading ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                <RefreshCw className="w-7 h-7 text-brand-blue animate-spin" />
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Loading Client Accounts...</p>
              </div>
            ) : isClientsError ? (
              <div className="p-12 text-center text-red-500 text-xs font-bold">Failed to load client accounts.</div>
            ) : filteredClients.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <UserCheck className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-700">No client portal spaces yet.</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">Click "Register Client Account" to invite clients and link project workspaces.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Client Detail</th>
                      <th className="px-6 py-4">Linked Projects</th>
                      <th className="px-6 py-4">Access Setup</th>
                      <th className="px-6 py-4">Portal Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredClients.map((c) => {
                      const isPending = !c.passwordHash
                      return (
                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-emerald-100">
                                {c.name[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate text-xs sm:text-sm">{c.name}</p>
                                <p className="text-[11px] text-gray-400 truncate font-mono">{c.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {c.projects && c.projects.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {c.projects.map((p) => (
                                  <span key={p.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                    {p.projectTitle}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">No linked workspaces</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              !isPending
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${!isPending ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                              {!isPending ? 'Setup Complete' : 'Invite Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                                c.isActive ? 'text-emerald-600' : 'text-red-500'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${c.isActive ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-red-400'}`} />
                              {c.isActive ? 'Active' : 'Deactivated'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Copy Invite Link */}
                              {isPending && c.inviteToken && (
                                <button
                                  onClick={() => handleCopyLink(c.inviteToken)}
                                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                    copiedToken === c.inviteToken
                                      ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                                      : 'border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                  }`}
                                  title="Copy Password Setup URL"
                                >
                                  {copiedToken === c.inviteToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}

                              {/* Resend Invite Email */}
                              {isPending && (
                                <button
                                  onClick={() => handleResendClientInvite(c)}
                                  className="p-2 border border-blue-200 bg-blue-50 text-brand-blue hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                                  title="Resend Invitation Email"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Link Projects */}
                              <button
                                onClick={() => handleOpenLinkProjects(c)}
                                className="p-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors cursor-pointer"
                                title="Link Projects"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Client Active status */}
                              <button
                                onClick={() => handleToggleClientActive(c)}
                                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                  c.isActive
                                    ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                }`}
                                title={c.isActive ? 'Deactivate Client' : 'Reactivate Client'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Client */}
                              <button
                                onClick={() => handleDeleteClient(c)}
                                className="p-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                                title="Delete Client Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
        )}

        {/* ── Security & Guidance Card ───────────────────────────── */}
        <div className="bg-linear-to-r from-blue-50/80 via-purple-50/50 to-blue-50/80 border border-blue-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-brand-blue" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-brand-blue font-heading flex items-center gap-2">
              <span>Super Admin Granular Authorization &amp; Delegation</span>
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Super Admin accounts retain system-wide administrative control. Staff accounts are restricted exclusively to assigned delegated modules. Client accounts access only their explicitly linked project portal spaces.
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
          confirmText="Delete Account"
          variant="danger"
          isLoading={deleteMutation.isPending || deleteClientMutation.isPending}
        />

      </div>
    </>
  )
}

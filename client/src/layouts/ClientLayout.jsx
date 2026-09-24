/**
 * ClientLayout.jsx — Protected layout wrapper for Client Portal
 */
import { useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X,
  MessageSquare,
  CreditCard,
  FileText,
  HelpCircle,
  CheckCircle2,
  Bell,
} from 'lucide-react'
import { useState } from 'react'
import { useClientMe, useClientLogout, useClientTickets } from '@/hooks/useClientPortal'
import { ClientMobileNavBar } from '@/components/ui'

export default function ClientLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const { data: client, isLoading, isError } = useClientMe()
  const logoutMutation = useClientLogout()
  const { data: tickets = [] } = useClientTickets()

  useEffect(() => {
    if (client?.name) {
      localStorage.setItem('hp_client_name', client.name)
    }
    if (!isLoading && (isError || !client)) {
      navigate('/client-login', { replace: true })
    }
  }, [client, isLoading, isError, navigate])

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      navigate('/client-login', { replace: true })
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020714]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading Client Portal…</p>
        </div>
      </div>
    )
  }

  if (!client) return null

  const unreadTicketsCount = Array.isArray(tickets) ? tickets.filter((t) => t.clientHasUnread).length : 0

  const navigation = [
    { to: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/client/support', label: 'Support Desk', icon: MessageSquare, badge: unreadTicketsCount },
    { to: '/client/billing', label: 'Billing & Payments', icon: CreditCard },
  ]

  return (
    <div className="h-screen flex bg-[#020714] text-white overflow-hidden selection:bg-brand-cyan/20 selection:text-brand-cyan">
      {/* Sidebar for Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col h-full
          transition-transform duration-300 ease-in-out bg-[#03091e]/95 backdrop-blur-2xl border-r border-white/10
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/snaptech-icon.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain shadow-md shadow-cyan-950/40" />
            <div>
              <p className="font-heading font-bold text-white text-sm leading-none">SnapTech</p>
              <p className="text-brand-cyan text-[10px] font-bold tracking-wider uppercase mt-0.5">
                Client Portal
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-cyan/15 text-white font-bold border border-brand-cyan/30 shadow-lg shadow-cyan-950/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-cyan rounded-r-full shadow-md shadow-brand-cyan/80" />
                )}
                <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-brand-cyan' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white shrink-0 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Portal Rules & Terms Section */}
        <div className="p-4 border-t border-white/10 shrink-0 space-y-1.5">
          <button
            onClick={() => setShowTermsModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-brand-cyan transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-brand-cyan" />
            <span>Portal Terms &amp; SLA Rules</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#020714]">
        {/* Top Header */}
        <header className="h-16 bg-[#03091e]/85 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-white/8 rounded-xl transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-heading text-lg font-bold text-white tracking-tight">
              Welcome, <span className="text-brand-cyan">{client.name}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => navigate('/client/support')}
              className="relative p-2 rounded-xl bg-white/4 border border-white/10 hover:bg-white/8 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={unreadTicketsCount > 0 ? `${unreadTicketsCount} unread ticket update(s)` : 'No new notifications'}
            >
              <Bell className={`w-4 h-4 ${unreadTicketsCount > 0 ? 'text-brand-cyan animate-pulse' : 'text-slate-400'}`} />
              {unreadTicketsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold bg-brand-cyan text-slate-950 rounded-full flex items-center justify-center shadow-md">
                  {unreadTicketsCount > 9 ? '9+' : unreadTicketsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowTermsModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/4 hover:bg-white/8 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-brand-cyan" />
              <span>SLA Rules &amp; Terms</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authorized Client</span>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 pb-24 lg:pb-8 scrollbar-thin bg-[#020714]">
          <Outlet />
        </main>
        <ClientMobileNavBar />
      </div>

      {/* Client Portal SLA Rules & Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900/95 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-white/15 text-white backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-2xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">
                    Client Portal SLA Rules &amp; Terms
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    SnapTech Digital official client engagement guidelines &amp; policies
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/8 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <div className="bg-white/3 border border-white/10 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-brand-cyan flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" />
                  1. Service Level Agreement (SLA) &amp; Support SLA
                </h4>
                <p className="text-xs text-slate-400">
                  Support Desk tickets submitted via the portal receive an initial technical response within <strong className="text-white">2 to 4 business hours</strong>. Urgent production issues are assigned directly to dedicated project leads.
                </p>
              </div>

              <div className="bg-white/3 border border-white/10 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  2. Intellectual Property (IP) &amp; Source Code Transfer
                </h4>
                <p className="text-xs text-slate-400">
                  Full ownership rights, custom source code zips, and Figma assets are transferred into your <strong className="text-white">Project File Vault</strong> immediately upon 100% completion of milestone payments.
                </p>
              </div>

              <div className="bg-white/3 border border-white/10 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  3. Milestone Billing &amp; GST Tax Invoice Compliance
                </h4>
                <p className="text-xs text-slate-400">
                  All billing milestones are subject to standard 18% GST itemized billing. Official verified tax receipts with GSTIN <strong className="text-white">08AAACH9929P1Z5</strong> can be printed or saved as PDF directly from the Billing tab.
                </p>
              </div>

              <div className="bg-white/3 border border-white/10 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-purple-400 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  4. Project Asset Upload Guidelines
                </h4>
                <p className="text-xs text-slate-400">
                  Clients can upload project logos, Figma references, and zip files up to 10MB per file into their File Vault. All uploaded assets are securely stored and encrypted in Cloudinary CDN.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2.5 bg-brand-cyan hover:bg-brand-cyan-light text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
              >
                I Understand &amp; Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

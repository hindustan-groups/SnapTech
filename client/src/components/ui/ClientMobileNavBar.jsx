/**
 * ClientMobileNavBar.jsx — Floating bottom tab navigation bar for mobile viewports
 */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, MessageCircle, LogOut } from 'lucide-react'
import { useClientLogout } from '@/hooks/useClientPortal'
import { useSiteSettings } from '@/hooks/useContent'

export default function ClientMobileNavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const logoutMutation = useClientLogout()
  const { data: settingsData } = useSiteSettings()

  const cfg = settingsData?.data || {}
  const rawPhone = cfg.phone || '+91 75970 00601'
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hi%20SnapTech%20Team,%20I%20have%20a%20query%20regarding%20my%20project.`

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await logoutMutation.mutateAsync()
        navigate('/client-login', { replace: true })
      } catch (err) {
        console.error('Logout failed:', err)
      }
    }
  }

  const isDashboardActive = location.pathname === '/client/dashboard' || location.pathname.startsWith('/client/projects/')

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-linear-to-t from-[#020714] via-[#020714]/80 to-transparent backdrop-blur-sm pointer-events-none">
      <nav className="max-w-md mx-auto flex items-center justify-around p-2.5 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl shadow-cyan-950/50 backdrop-blur-xl pointer-events-auto">
        {/* Dashboard Tab */}
        <Link
          to="/client/dashboard"
          className={`flex flex-col items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all ${
            isDashboardActive
              ? 'text-brand-cyan font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 transition-transform ${isDashboardActive ? 'scale-110 stroke-[2.5] text-brand-cyan' : ''}`} />
          <span className="text-[10px] tracking-wide">Portal</span>
        </Link>

        {/* WhatsApp Support Tab */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 px-4 py-1.5 rounded-xl text-slate-400 hover:text-emerald-400 transition-all"
        >
          <MessageCircle className="w-5 h-5 text-emerald-400 hover:scale-110 transition-transform" />
          <span className="text-[10px] tracking-wide text-slate-300 font-semibold">WhatsApp</span>
        </a>

        {/* Logout Tab */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1.5 px-4 py-1.5 rounded-xl text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5 hover:rotate-6 transition-transform" />
          <span className="text-[10px] tracking-wide">Sign Out</span>
        </button>
      </nav>
    </div>
  )
}

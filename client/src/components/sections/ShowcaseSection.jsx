import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor,
  Smartphone,
  Laptop,
  Check,
  ArrowRight,
  Users,
  ShoppingCart,
  Heart,
  Grid,
  Menu,
  Bell,
  FolderKanban,
  RefreshCw,
  Cpu
} from 'lucide-react'
import { Container } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'

export default function ShowcaseSection() {
  const [activeTab, setActiveTab] = useState('web') // web | saas | mobile
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}

  const showcaseData = {
    web: {
      eyebrow: 'REACTION-FAST PORTALS',
      title: 'Next-Gen Web Applications',
      desc: 'We engineer hyper-fast corporate websites and custom client portals optimized for conversions, speed, and search engine visibility.',
      checklist: [
        'React 19 & Next.js for server-rendered page speeds',
        'Integrated SEO schemas & high-intent conversion hubs',
        'Enterprise-grade security and third-party API integrations'
      ],
      cta: 'Explore Web Services',
      link: '/services/web-development'
    },
    saas: {
      eyebrow: 'DATA-DRIVEN SYSTEMS',
      title: 'Cloud Analytics & SaaS Dashboards',
      desc: 'Transform operational complexity into clear, actionable dashboards. We build custom CMS, ERPs, and real-time monitoring tools.',
      checklist: [
        'Real-time tracking and database analytics integration',
        'Role-based access controls (RBAC) & audit logging',
        'Interactive charts, tables, and automated PDF reporting'
      ],
      cta: 'Explore Custom Software',
      link: '/services/it-consulting-strategy'
    },
    mobile: {
      eyebrow: 'MOBILE-FIRST EXPERIENCES',
      title: 'Premium Native Mobile Apps',
      desc: 'Expand your reach to iOS and Android App Stores. We design and build high-performance mobile apps with offline support.',
      checklist: [
        'Cross-platform single codebase (React Native / Flutter)',
        'Push notifications, geofencing & deep linking support',
        'Secure local databases & payment gateway integrations'
      ],
      cta: 'Explore Mobile Solutions',
      link: '/services/mobile-app-development'
    }
  }

  const tabs = [
    { id: 'web', label: 'Web Apps', icon: Monitor },
    { id: 'saas', label: 'SaaS Platforms', icon: Laptop },
    { id: 'mobile', label: 'Mobile Apps', icon: Smartphone }
  ]

  const activeContent = showcaseData[activeTab]

  return (
    <section id="showcase" className="py-24 relative overflow-hidden bg-[#03091e] border-t border-b border-white/10 text-white isolate">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[55%] rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[55%] rounded-full bg-brand-cyan/10 blur-3xl" />
      </div>

      <Container className="space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-cyan bg-brand-primary/20 border border-brand-primary/40 px-4.5 py-1.5 rounded-full inline-block">
            Interactive Showcase Studio
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Experience Our{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary-light via-brand-cyan to-white">
              Digital Craftsmanship
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Click on the tabs below to explore high-fidelity interactive mockups of our custom-built web apps, SaaS portals, and mobile systems.
          </p>
        </div>

        {/* Tab Switcher - Premium Minimal Style */}
        <div className="flex justify-center border-b border-white/10 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 pb-4 flex flex-col items-center gap-2 border-b-2 text-xs font-bold transition-all duration-300 cursor-pointer outline-none
                  ${
                    active
                      ? 'border-brand-cyan text-brand-cyan scale-105'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Split Layout: Left Text & Right Device */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-4">
          {/* Left Column: Dynamic Text Content */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                className="space-y-6"
              >
                <span className="text-[10px] font-mono font-bold tracking-widest text-brand-cyan bg-brand-primary/20 border border-brand-primary/40 px-3 py-1 rounded-full w-fit block uppercase">
                  {activeContent.eyebrow}
                </span>

                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {activeContent.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeContent.desc}
                </p>

                {/* Checklist */}
                <ul className="space-y-3">
                  {activeContent.checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-slate-200 leading-relaxed">
                      <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={activeContent.link}
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-cyan hover:text-white group pt-2 transition-colors duration-200"
                >
                  <span>{activeContent.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: 3D Device Container (Floating directly, no background card) */}
          <div className="lg:col-span-7 flex justify-center items-center perspective-distant min-h-90 sm:min-h-115">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, rotateX: 6, rotateY: 16, scale: 0.9 }}
                animate={{ opacity: 1, rotateX: 10, rotateY: -16, rotateZ: 2, scale: 1 }}
                exit={{ opacity: 0, rotateX: -6, rotateY: -16, scale: 0.9 }}
                whileHover={{
                  rotateX: 6,
                  rotateY: -6,
                  rotateZ: 1,
                  scale: 1.04,
                  boxShadow: '0 35px 70px -15px rgba(0, 0, 0, 0.3)'
                }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 16,
                  scale: { duration: 0.35 }
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className="w-full max-w-lg relative"
              >
                {/* Glowing background aura blob specific to device */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full bg-brand-blue/10 blur-3xl -z-10" />

                {/* ── Tab 1: Web Application (Desktop Monitor) ── */}
                {activeTab === 'web' && (
                  <div className="w-full mx-auto">
                    {/* Monitor Frame */}
                    <div className="bg-slate-900 border-10 border-slate-950 rounded-t-3xl shadow-2xl overflow-hidden aspect-16/9.8 flex flex-col ring-1 ring-white/10">
                      {/* Browser Chrome Header */}
                      <div className="bg-slate-950 px-4 py-2 flex items-center gap-2 border-b border-slate-800 shrink-0">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                          <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        </div>
                        <div className="flex-1 max-w-50 mx-auto bg-slate-900 border border-slate-800 rounded-md py-0.5 px-3 text-[8px] text-gray-500 font-mono text-center truncate">
                          https://portal.snaptech.digital
                        </div>
                      </div>

                      {/* Browser Content (Super Level Dark Premium Portal or Custom Image) */}
                      {cfg.showcase_web_image ? (
                        <div className="flex-1 overflow-hidden relative bg-[#0b1329]">
                          <img
                            src={cfg.showcase_web_image}
                            alt="Custom Web Mockup"
                            className="w-full h-full object-cover block"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 bg-[#0b1329] text-white p-5 flex flex-col justify-between overflow-hidden relative font-sans">
                          {/* Header */}
                          <header className="flex justify-between items-center pb-3 border-b border-white/5 shrink-0">
                            <span className="font-heading font-black text-[10px] text-brand-blue-light tracking-widest uppercase">SNAPTECH PORTAL</span>
                            <div className="flex gap-3 text-[8px] font-bold text-gray-400">
                              <span className="text-white">Overview</span>
                              <span>Integrations</span>
                              <span>Users</span>
                            </div>
                          </header>

                          {/* Main Layout split */}
                          <div className="flex-1 flex gap-4 items-center py-3 overflow-hidden">
                            {/* Left Panel */}
                            <div className="flex-1 space-y-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                                <span className="text-[7px] font-bold text-emerald-400 uppercase tracking-widest">Active Server</span>
                              </div>
                              <div className="font-heading font-extrabold text-sm text-white leading-tight">
                                Database Sync & Operations Panel
                              </div>
                              <p className="text-[9px] text-gray-400 leading-relaxed">
                                Real-time pipeline data and encrypted token management dashboard.
                              </p>
                              <div className="flex gap-1.5">
                                <span className="bg-brand-red text-white px-2.5 py-1 rounded text-[7px] font-bold">Refresh Server</span>
                                <span className="border border-white/10 bg-white/5 text-gray-300 px-2.5 py-1 rounded text-[7px] font-bold">View Logs</span>
                              </div>
                            </div>

                            {/* Right Panel (High-end Conversion SVG wave Chart) */}
                            <div className="flex-1 bg-slate-900/60 border border-white/5 shadow-inner rounded-xl p-3 space-y-2 max-w-50">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-bold text-gray-300">Conversion Increase</span>
                                <span className="text-[7px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">+340%</span>
                              </div>
                              {/* Premium SVG Curve Graph */}
                              <div className="h-16 w-full pt-1 relative">
                                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                                  <defs>
                                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.3" />
                                      <stop offset="100%" stopColor="#00F2FE" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                  {/* Glow under line */}
                                  <path d="M 0 40 Q 20 30 40 22 T 80 8 L 100 5 L 100 40 Z" fill="url(#chartGlow)" />
                                  {/* Main line */}
                                  <path
                                    d="M 0 35 Q 20 30 40 22 T 80 8 L 100 5"
                                    fill="none"
                                    stroke="url(#lineGradient)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                  <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#0072FF" />
                                      <stop offset="50%" stopColor="#00F2FE" />
                                      <stop offset="100%" stopColor="#4FACFE" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                {/* Pulsing Dot */}
                                <span className="absolute top-2 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                                <span className="absolute top-2.5 right-1.5 w-1 h-1 bg-cyan-300 rounded-full" />
                              </div>
                              {/* Stats */}
                              <div className="flex justify-between text-[8px] text-gray-500 border-t border-white/5 pt-1.5">
                                <span>Load Time: 120ms</span>
                                <span>Uptime: 100.0%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Monitor Stand Base */}
                    <div className="relative mx-auto w-24 h-11 bg-slate-800 border-x border-slate-900 flex justify-center items-start shrink-0">
                      <div className="absolute bottom-0 w-36 h-2 bg-slate-900 border-t border-slate-800 rounded-t-md" />
                    </div>
                  </div>
                )}

                {/* ── Tab 2: SaaS Platform (MacBook Laptop) ── */}
                {activeTab === 'saas' && (
                  <div className="w-full mx-auto">
                    {/* Laptop Screen Body */}
                    <div className="bg-slate-900 border-8 border-slate-950 rounded-t-2xl shadow-2xl overflow-hidden aspect-16/10 flex flex-col ring-1 ring-white/10">
                      {/* Notch Camera */}
                      <div className="bg-slate-950 h-4.5 flex justify-center items-center border-b border-slate-800 shrink-0 relative">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800" />
                      </div>

                      {/* SaaS UI (Premium Dark Mode Dashboard or Custom Image) */}
                      {cfg.showcase_saas_image ? (
                        <div className="flex-1 overflow-hidden relative bg-[#090d16]">
                          <img
                            src={cfg.showcase_saas_image}
                            alt="Custom SaaS Mockup"
                            className="w-full h-full object-cover block"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 bg-[#090d16] text-slate-300 flex overflow-hidden font-sans">
                          {/* Sidebar */}
                          <aside className="w-36 bg-[#04060b] text-slate-500 p-3.5 space-y-4 flex flex-col border-r border-white/5 shrink-0">
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-brand-blue flex items-center justify-center text-white font-extrabold text-[8px]">S</div>
                              <span className="text-[8px] font-black text-white tracking-widest uppercase">SNAPTECH CMS</span>
                            </div>
                            <nav className="space-y-1.5 text-[8px] font-bold flex-1">
                              <div className="flex items-center gap-2 text-white bg-white/5 rounded-lg px-2 py-1">
                                <Grid className="w-3 h-3 text-brand-red-light" />
                                <span>Analytics</span>
                              </div>
                              <div className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                                <FolderKanban className="w-3 h-3" />
                                <span>Workspaces</span>
                              </div>
                              <div className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                                <Cpu className="w-3 h-3" />
                                <span>API Gateways</span>
                              </div>
                            </nav>
                            <div className="text-[7px] text-slate-600">
                              <p>SECURE SESSION</p>
                            </div>
                          </aside>

                          {/* Dashboard Main Panel */}
                          <main className="flex-1 p-4.5 flex flex-col justify-between overflow-hidden">
                            {/* Header */}
                            <div className="flex justify-between items-center pb-2.5 border-b border-white/5 shrink-0">
                              <span className="text-[9px] font-extrabold text-white uppercase tracking-wider">Metrics Console</span>
                              <div className="flex items-center gap-2 text-[8px]">
                                <Bell className="w-3 h-3 text-slate-400" />
                                <span className="bg-emerald-500/10 text-emerald-400 px-1 rounded font-bold">LIVE SYNC</span>
                              </div>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 py-2 shrink-0">
                              <div className="bg-slate-950/80 border border-white/5 rounded-lg p-2.5 shadow-sm space-y-1">
                                <span className="text-[7px] font-bold uppercase tracking-wider text-slate-500">API Requests (24h)</span>
                                <div className="flex items-baseline justify-between">
                                  <span className="text-xs font-extrabold text-white">412,890</span>
                                  <span className="text-[7px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">+24%</span>
                                </div>
                              </div>
                              <div className="bg-slate-950/80 border border-white/5 rounded-lg p-2.5 shadow-sm space-y-1">
                                <span className="text-[7px] font-bold uppercase tracking-wider text-slate-500">Server Latency</span>
                                <div className="flex items-baseline justify-between">
                                  <span className="text-xs font-extrabold text-cyan-400">14.2ms</span>
                                  <span className="text-[7px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">Optimal</span>
                                </div>
                              </div>
                            </div>

                            {/* Complex System Logs Table */}
                            <div className="flex-1 bg-slate-950/50 border border-white/5 rounded-lg p-3 shadow-inner flex flex-col justify-between overflow-hidden">
                              <div className="flex justify-between items-center pb-2 shrink-0">
                                <span className="text-[8px] font-bold text-gray-400">System Activity Logs</span>
                                <RefreshCw className="w-2.5 h-2.5 text-slate-500 animate-spin" style={{ animationDuration: '4s' }} />
                              </div>
                              <div className="flex-1 flex flex-col justify-center space-y-2 py-1">
                                {[
                                  { service: 'Cloud Storage API', status: 'ONLINE', load: '32%', color: 'text-emerald-400 bg-emerald-500/10' },
                                  { service: 'Auth Token Gateway', status: 'ONLINE', load: '12%', color: 'text-emerald-400 bg-emerald-500/10' },
                                  { service: 'Billing Queue webhook', status: 'DEGRADED', load: '88%', color: 'text-brand-red bg-brand-red/10' }
                                ].map((item, index) => (
                                  <div key={index} className="flex justify-between items-center text-[8px]">
                                    <span className="font-bold text-white w-24 truncate">{item.service}</span>
                                    <span className={`px-1.5 py-0.5 rounded font-black text-[7px] ${item.color}`}>{item.status}</span>
                                    <span className="font-mono text-slate-400">{item.load}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </main>
                        </div>
                      )}
                    </div>

                    {/* Laptop Bottom Bezel Keyboard */}
                    <div className="relative mx-auto w-[82%] h-4 bg-slate-800 rounded-b-lg border-t border-slate-700 shadow-2xl flex justify-center items-start shrink-0">
                      <div className="w-16 h-1 bg-slate-900 rounded-b" />
                    </div>
                  </div>
                )}

                {/* ── Tab 3: Mobile Application (iPhone) ── */}
                {activeTab === 'mobile' && (
                  <div className="relative mx-auto max-w-60 w-full">
                    {/* Phone Frame */}
                    <div className="bg-slate-900 border-7 border-slate-950 rounded-[38px] shadow-2xl overflow-hidden aspect-9/18.5 flex flex-col relative ring-1 ring-white/10">
                      {/* Dynamic Island Notch */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-end px-2" />

                      {/* Phone App Content (Premium Wallet / E-Commerce App or Custom Image) */}
                      {cfg.showcase_mobile_image ? (
                        <div className="flex-1 overflow-hidden relative bg-[#070b13]">
                          <img
                            src={cfg.showcase_mobile_image}
                            alt="Custom Mobile Mockup"
                            className="w-full h-full object-cover block"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 bg-[#070b13] text-slate-300 flex flex-col justify-between overflow-hidden relative pt-6 font-sans">
                          {/* Header */}
                          <header className="px-3.5 py-2 border-b border-white/5 flex items-center justify-between shrink-0">
                            <Menu className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-heading font-black text-[9px] text-white tracking-widest uppercase">SNAPTECH PAY</span>
                            <div className="relative">
                              <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                              <span className="absolute -top-1 -right-1.5 bg-brand-red text-white w-2.5 h-2.5 rounded-full text-[5px] font-bold flex items-center justify-center">1</span>
                            </div>
                          </header>

                          {/* Scroll Area */}
                          <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4">
                            {/* Premium Gradient Wallet Card */}
                            <div className="bg-linear-to-tr from-brand-blue to-cyan-500 text-white rounded-xl p-3 shadow-md space-y-2 relative overflow-hidden">
                              <div className="absolute -right-2.5 -bottom-2.5 w-14 h-14 rounded-full bg-white/10" />
                              <div className="flex justify-between items-center">
                                <span className="text-[6px] font-bold uppercase tracking-widest text-white/80">Corporate Wallet</span>
                                <span className="text-[7px] font-bold bg-white/10 px-1 py-0.5 rounded">VISA</span>
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[7px] text-white/70">Wallet Balance</p>
                                <p className="font-heading text-sm font-extrabold tracking-wide">₹45,280.00</p>
                              </div>
                            </div>

                            {/* Quick Actions Row */}
                            <div className="grid grid-cols-3 gap-2 text-center text-[7px] font-bold text-slate-400">
                              <div className="bg-slate-900 border border-white/5 rounded-lg py-1.5">Send</div>
                              <div className="bg-slate-900 border border-white/5 rounded-lg py-1.5">Request</div>
                              <div className="bg-slate-900 border border-white/5 rounded-lg py-1.5">History</div>
                            </div>

                            {/* Transaction Logs */}
                            <div className="space-y-2">
                              <p className="text-[8px] font-bold text-white uppercase tracking-wider">Recent Transactions</p>
                              <div className="space-y-1.5">
                                {[
                                  { name: 'Cloud Domain Hosting', type: 'Database Service', amount: '-₹4,999.00', plus: false },
                                  { name: 'Lead Referral Payout', type: 'Referral Program', amount: '+₹12,500.00', plus: true }
                                ].map((t, idx) => (
                                  <div key={idx} className="bg-slate-900/50 border border-white/5 rounded-lg p-2 flex justify-between items-center text-[8px]">
                                    <div>
                                      <p className="font-bold text-white leading-snug">{t.name}</p>
                                      <p className="text-[6px] text-gray-500 leading-none">{t.type}</p>
                                    </div>
                                    <span className={`font-mono font-bold ${t.plus ? 'text-emerald-400' : 'text-slate-300'}`}>{t.amount}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Bottom Glassmorphic Navigation */}
                          <footer className="px-3 py-1.5 border-t border-white/5 flex items-center justify-between text-slate-500 text-[6px] font-bold bg-[#03060a] shrink-0">
                            <div className="flex flex-col items-center gap-0.5 text-brand-blue">
                              <Grid className="w-3.5 h-3.5" />
                              <span>Wallet</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5">
                              <Heart className="w-3.5 h-3.5" />
                              <span>Saved</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5">
                              <Users className="w-3.5 h-3.5" />
                              <span>Account</span>
                            </div>
                          </footer>
                        </div>
                      )}

                      {/* Phone Screen Notch Bottom Bar */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-slate-950 rounded-full z-30" />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  )
}

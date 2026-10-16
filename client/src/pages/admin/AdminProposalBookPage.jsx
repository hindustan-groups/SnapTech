/**
 * AdminProposalBookPage.jsx
 * 
 * Official Enterprise Proposal & Quotation Book Studio — SnapTech Digital
 * Designed according to SnapTech Digital Enterprise Brand Guidelines.
 * 
 * Core Specifications:
 * - Brand Architecture: SnapTech Digital (IT & Software Engineering Division)
 * - Brand Palette: Dark Navy #0D1B4B, Electric Blue #1B6EF3, Accent Cyan #00D2FF, Slate #1E293B, Ice White #F8FAFC
 * - Document Codes: ST-IT-001 through ST-IT-009 (9-Page Full Executive Proposal Book)
 * - Geometry: Standard A4 Portrait (210mm x 297mm @ 300 DPI)
 * - Dual-Pane Studio: Responsive Tabbed Drawer + Live Scalable A4 Canvas Viewport (Zoom 40%–120%)
 * - 100% Live Editable: Client info, deliverables, commercial items, bank details, timeline, legal terms
 * - Multi-Client Saved Proposals Manager with localStorage persistence & Presets
 * - Precision Print/PDF Engine: Zero bleed, flawless page breaks, A4 compliant
 */

import { useState } from 'react'
import {
  Printer,
  FileText,
  Building2,
  CheckCircle2,
  XCircle,
  Globe,
  Mail,
  Phone,
  Shield,
  Server,
  Smartphone,
  Search,
  Code,
  Cpu,
  Database,
  Lock,
  Clock,
  QrCode,
  Check,
  User,
  Calendar,
  Save,
  Trash2,
  ZoomIn,
  ZoomOut,
  Sliders,
  Plus,
  CreditCard,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { SEO } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
import { useSiteSettings } from '@/hooks/useContent'
import snaptechLogo from '@/assets/snaptech-logo.png'
import snaptechLogoWhite from '@/assets/snaptech-logo-white.png'

// Official Brand Logo Emblem Component
function LogoEmblem({ isLarge = false, lightMode = true }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={lightMode ? snaptechLogo : snaptechLogoWhite}
        alt="SnapTech Digital"
        className={isLarge ? 'h-11 object-contain' : 'h-8 object-contain'}
      />
      <div className={`border-l-2 ${lightMode ? 'border-[#1B6EF3]' : 'border-cyan-400'} pl-2.5 hidden sm:block text-left`}>
        <span
          className={`text-[8px] font-black tracking-wider uppercase block leading-tight ${
            lightMode ? 'text-[#0D1B4B]' : 'text-white'
          }`}
        >
          SNAPTECH DIGITAL
        </span>
        <span
          className={`text-[7px] font-bold tracking-widest uppercase block ${
            lightMode ? 'text-[#1B6EF3]' : 'text-cyan-300'
          }`}
        >
          ENTERPRISE IT &amp; SOFTWARE SOLUTIONS
        </span>
      </div>
    </div>
  )
}

// Architectural Technical Watermark Background Component
function TechnicalWatermark() {
  return (
    <>
      {/* Background Micro Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="blueprint-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#0D1B4B" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        </svg>
      </div>

      {/* Security Diagonal Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.018] pointer-events-none select-none rotate-[-35deg] z-0">
        <span className="font-heading font-black text-6xl text-[#0D1B4B] uppercase tracking-widest text-center leading-tight">
          SNAPTECH DIGITAL<br />CONFIDENTIAL PROPOSAL
        </span>
      </div>
    </>
  )
}

// Default initial state for proposal
const DEFAULT_PROPOSAL = {
  id: 'prop-default',
  clientCompany: 'AURA ENTERPRISES PVT LTD',
  contactPerson: 'Mr. Rajesh Sharma',
  clientDesignation: 'Managing Director & CEO',
  clientEmail: 'rajesh.sharma@auraenterprises.com',
  clientPhone: '+91 98765 43210',
  clientAddress: 'Plot 42, Cyber Tech Park, Sector 62, Noida, UP',
  clientGst: '08AAACH1234F1Z9',
  projectName: 'Custom Enterprise Cloud Platform & E-Commerce Ecosystem',
  projectCategory: 'Full-Stack Web & Enterprise Software',
  quotationNumber: 'STD-2026-089',
  date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
  currency: 'INR (₹)',
  discount: '10,000',
  gstPercent: '18',
  paymentTerms:
    '50% Milestone Advance upon technical agreement sign-off, 50% upon final production deployment & client approval.',

  // Vendor / Company Details
  preparedBy: 'SnapTech Digital Solutions',
  preparedByTagline: 'IT & Software Engineering Division',
  preparedByEmail: 'info@snaptech.digital',
  preparedByPhone: '+91 82096 04849',
  preparedByWebsite: 'www.snaptech.digital',
  preparedByAddress: 'Bhilwara, Rajasthan, India — 311001',
  preparedByGst: '08AAAAA0000A1Z5',

  // Bank & Payment Details
  bankName: 'HDFC Bank Ltd.',
  bankAccountName: 'SnapTech Digital Solutions',
  bankAccountNumber: '50200089234190',
  bankIfsc: 'HDFC0001234',
  bankBranch: 'Main City Branch, Bhilwara',
  upiId: 'snaptech@upi',

  // Scope of Work Arrays
  scopeIncluded: [
    'Custom Responsive UI/UX Design System with TailwindCSS',
    'High-Performance Frontend Web Architecture (React.js / Vite)',
    'Scalable RESTful Backend API Services (Node.js & Express)',
    'Relational Database Modeling & Query Optimization (PostgreSQL)',
    'Administrative CMS Dashboard for Orders, Content & Analytics',
    'Google Search Engine Optimization (On-Page, Schema, Sitemap)',
    'High-Speed NVMe Cloud Server Provisioning & DNS Routing',
    '256-bit TLS / SSL Security Encryption & Firewall Protection',
    'Free 1-Year Top-Level Domain Registration (.com / .in)',
    '30-Day Dedicated Post-Launch Technical Support & Warranty',
  ],
  scopeExcluded: [
    'Third-party paid API subscription licensing costs (e.g. SMS, WhatsApp API)',
    'Paid advertising media budgets (Meta Ads, Google Ads spends)',
    'On-site custom photography and video cinematography shoot fees',
    'Government trademark and company legal registration fees',
  ],

  // Commercial Line Items
  lineItems: [
    {
      id: 'li1',
      desc: 'Enterprise Web Platform & Custom Admin Management Dashboard',
      qty: '1 Suite',
      rate: '1,25,000',
    },
    {
      id: 'li2',
      desc: 'High-Speed NVMe Cloud Infrastructure & 256-Bit SSL Encryption',
      qty: '1 Year',
      rate: 'INCLUDED',
    },
    {
      id: 'li3',
      desc: 'Top-Level Domain Name Registration (.com / .in)',
      qty: '1 Year',
      rate: 'INCLUDED',
    },
    {
      id: 'li4',
      desc: 'Dedicated 30-Day Technical Maintenance SLA & Bug-Free Warranty',
      qty: 'Included',
      rate: 'INCLUDED',
    },
  ],

  // Timeline Phases
  timelinePhases: [
    {
      phase: 'PHASE 01',
      title: 'Discovery & Specification Sign-off',
      duration: 'Days 1 – 2',
      desc: 'Business requirement scoping, stakeholder interviews, user journey architecture, and technical specification sign-off.',
    },
    {
      phase: 'PHASE 02',
      title: 'UI/UX Wireframing & Design Tokens',
      duration: 'Days 3 – 4',
      desc: 'Drafting high-fidelity interactive wireframes, custom color palettes, component tokens, and mobile-first mockups.',
    },
    {
      phase: 'PHASE 03',
      title: 'Full-Stack Software Engineering',
      duration: 'Days 5 – 8',
      desc: 'Architecting clean modular frontend components, Node.js REST APIs, database schema, and third-party integrations.',
    },
    {
      phase: 'PHASE 04',
      title: 'QA, Security & Performance Audit',
      duration: 'Days 9 – 10',
      desc: 'End-to-end functional testing, cross-browser compatibility, SQL injection / XSS security audit, and 95+ PageSpeed audit.',
    },
    {
      phase: 'PHASE 05',
      title: 'Staging Walkthrough & Stakeholder Sign-Off',
      duration: 'Day 11',
      desc: 'Live staging preview demo with client leadership team, addressing adjustments, and formal milestone approval.',
    },
    {
      phase: 'PHASE 06',
      title: 'Production Launch & Handover',
      duration: 'Day 12+',
      desc: 'Zero-downtime production deployment, DNS cutover, SSL installation, administrative credentials, and training handover.',
    },
  ],

  // Legal Terms
  legalTerms: [
    {
      id: 'lt1',
      title: '1. Source Code Ownership & Complete IP Rights',
      text: 'Upon complete payment settlement of the quotation grand total, 100% full source code ownership, intellectual property rights, and copyright transfer unconditionally to the Client.',
    },
    {
      id: 'lt2',
      title: '2. 100% Bug-Free Code Warranty & Guarantee',
      text: 'SnapTech Digital provides a 30-day comprehensive bug-free warranty post-launch. Any software defect or anomaly discovered will be rectified at zero additional cost.',
    },
    {
      id: 'lt3',
      title: '3. Technical Support SLA & Response Times',
      text: 'Complimentary technical support covers critical server monitoring, bug fixes, and minor copy adjustments. Critical issues are guaranteed a response within 4 hours.',
    },
    {
      id: 'lt4',
      title: '4. Client Cooperation & Milestone Dependencies',
      text: 'Project timelines depend upon prompt client feedback and timely submission of credentials, third-party API keys, and corporate branding assets.',
    },
    {
      id: 'lt5',
      title: '5. Non-Disclosure Agreement & Confidentiality (NDA)',
      text: 'Both parties agree to hold all business algorithms, customer data, trade secrets, and software architecture under strict permanent confidentiality.',
    },
    {
      id: 'lt6',
      title: '6. Limitation of Liability & Third-Party Services',
      text: 'SnapTech Digital is not liable for incidental or indirect damages resulting from third-party gateway downtimes, hosting provider hardware outages, or policy changes.',
    },
  ],
}

export default function AdminProposalBookPage() {
  const { addToast } = useToast()
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}

  // Studio UI Controls
  const [zoomScale, setZoomScale] = useState(0.75) // Default comfortable 75% scale
  const [activeFormTab, setActiveFormTab] = useState('client')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePageFocus, setActivePageFocus] = useState('all') // 'all' or '1'..'9'

  // Saved Proposals State
  const [savedProposals, setSavedProposals] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('HP_SAVED_PROPOSALS') : null
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [selectedProposalId, setSelectedProposalId] = useState('')

  // 100% Editable Proposal Model
  const [proposalData, setProposalData] = useState(() => {
    const base = { ...DEFAULT_PROPOSAL }
    if (cfg.email) base.preparedByEmail = cfg.email
    if (cfg.phone) base.preparedByPhone = cfg.phone
    return base
  })

  const handleSaveProposal = () => {
    const newId = proposalData.id || `prop-${Date.now()}`
    const updatedProp = { ...proposalData, id: newId, savedAt: new Date().toISOString() }
    const updatedList = [updatedProp, ...savedProposals.filter((p) => p.id !== newId)]
    setSavedProposals(updatedList)
    try {
      localStorage.setItem('HP_SAVED_PROPOSALS', JSON.stringify(updatedList))
    } catch {
      // Ignore localStorage errors
    }
    setSelectedProposalId(newId)
    addToast(`Proposal for "${proposalData.clientCompany}" saved successfully!`, 'success')
  }

  const handleLoadProposal = (propId) => {
    const found = savedProposals.find((p) => p.id === propId)
    if (found) {
      setProposalData(found)
      setSelectedProposalId(propId)
      addToast(`Loaded proposal for "${found.clientCompany}"`, 'info')
    }
  }

  const handleResetProposal = () => {
    setProposalData({
      ...DEFAULT_PROPOSAL,
      quotationNumber: `STD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    })
    setSelectedProposalId('')
    addToast('Reset to default proposal template', 'info')
  }

  const applyPreset = (presetType) => {
    if (presetType === 'website') {
      setProposalData((prev) => ({
        ...prev,
        projectName: 'High-Performance Corporate Web Platform & CMS Ecosystem',
        projectCategory: 'Custom Web Engineering',
        lineItems: [
          {
            id: 'li1',
            desc: 'Custom Responsive Corporate Website Platform & Admin Dashboard',
            qty: '1 Package',
            rate: '49,999',
          },
          {
            id: 'li2',
            desc: '1 Year High-Speed NVMe Cloud Hosting & SSL Security Certificate',
            qty: '1 Year',
            rate: 'INCLUDED',
          },
          {
            id: 'li3',
            desc: 'Domain Name Registration (.com / .in) & Professional Business Emails',
            qty: '1 Year',
            rate: 'INCLUDED',
          },
          {
            id: 'li4',
            desc: '30-Day Technical Support SLA & Google On-Page SEO Configuration',
            qty: '1 Package',
            rate: 'INCLUDED',
          },
        ],
        discount: '5,000',
      }))
      addToast('Applied Corporate Website Package (₹49,999)', 'success')
    } else if (presetType === 'mobile') {
      setProposalData((prev) => ({
        ...prev,
        projectName: 'Cross-Platform Android & iOS Mobile Application Suite',
        projectCategory: 'Mobile App Engineering',
        lineItems: [
          {
            id: 'li1',
            desc: 'React Native / Flutter Cross-Platform Mobile Application (Android + iOS)',
            qty: '1 Suite',
            rate: '89,999',
          },
          {
            id: 'li2',
            desc: 'Scalable RESTful Backend API Engine & Cloud Database Architecture',
            qty: '1 System',
            rate: 'INCLUDED',
          },
          {
            id: 'li3',
            desc: 'Google Play Store & Apple App Store Production Deployment Assistance',
            qty: '2 Stores',
            rate: 'INCLUDED',
          },
          {
            id: 'li4',
            desc: 'Push Notification Engine & Real-Time Sync Services',
            qty: '1 Suite',
            rate: 'INCLUDED',
          },
        ],
        discount: '10,000',
      }))
      addToast('Applied Mobile App Suite Package (₹89,999)', 'success')
    } else if (presetType === 'software') {
      setProposalData((prev) => ({
        ...prev,
        projectName: 'Custom Enterprise ERP, Inventory & Multi-Branch GST Billing System',
        projectCategory: 'Enterprise Software & Cloud ERP',
        lineItems: [
          {
            id: 'li1',
            desc: 'Custom Enterprise ERP Software Architecture with Role-Based Permissions',
            qty: '1 System',
            rate: '1,25,000',
          },
          {
            id: 'li2',
            desc: 'Automated GST Invoice Generator, Inventory Ledger & Accounting Sync',
            qty: '1 Module',
            rate: 'INCLUDED',
          },
          {
            id: 'li3',
            desc: 'Staff Activity Audit Logs, High-Concurrency DB Tuning & Daily Cloud Backups',
            qty: '1 Suite',
            rate: 'INCLUDED',
          },
          {
            id: 'li4',
            desc: 'Dedicated Technical Account Manager & 90-Day Priority SLA Support',
            qty: '1 Year',
            rate: 'INCLUDED',
          },
        ],
        discount: '15,000',
      }))
      addToast('Applied Enterprise ERP Package (₹1,25,000)', 'success')
    }
  }

  // Calculate Financials
  const subtotalNum = proposalData.lineItems.reduce((acc, item) => {
    const val = parseFloat(item.rate.replace(/,/g, '')) || 0
    return acc + val
  }, 0)

  const discountNum = parseFloat(proposalData.discount.replace(/,/g, '')) || 0
  const taxableNum = Math.max(0, subtotalNum - discountNum)
  const gstNum = Math.round(taxableNum * (parseFloat(proposalData.gstPercent) / 100))
  const grandTotalNum = taxableNum + gstNum

  const handlePrint = () => {
    window.print()
  }

  // Unified Design System Header (Used across pages)
  const renderHeader = (pageCode, title = '', subtitle = '') => (
    <div className="border-b-2 border-[#0D1B4B] pb-3 mb-5 flex items-center justify-between relative z-10">
      <LogoEmblem isLarge={false} lightMode={true} />

      <div className="text-right">
        <div className="flex items-center justify-end gap-2 mb-0.5">
          {title && (
            <span className="text-[9px] font-black uppercase text-[#1B6EF3] tracking-wider hidden sm:inline">
              {title} {subtitle ? `• ${subtitle}` : ''}
            </span>
          )}
          <span className="font-mono text-[10px] font-black text-[#0D1B4B] bg-[#F0F5FF] px-2.5 py-0.5 rounded border border-[#1B6EF3]/30 block shadow-xs">
            DOC CODE: {pageCode}
          </span>
        </div>
        <span className="text-[9px] text-slate-500 font-extrabold block">
          QUOTATION REF: {proposalData.quotationNumber}
        </span>
      </div>
    </div>
  )

  // Unified Design System Footer (Used across all pages 01 - 09)
  const renderFooter = (pageCode, pageNum) => (
    <div className="mt-auto pt-3 border-t border-slate-200 text-[9px] text-slate-500 flex items-center justify-between font-mono relative z-10">
      <div className="flex items-center gap-3">
        <span className="text-[8px] font-bold text-[#1B6EF3] bg-[#F0F5FF] px-2 py-0.5 rounded border border-[#1B6EF3]/30 uppercase">
          STRICTLY CONFIDENTIAL
        </span>
        <span className="hidden sm:inline">🌐 {proposalData.preparedByWebsite}</span>
        <span className="hidden md:inline">📧 {proposalData.preparedByEmail}</span>
        <span>📞 {proposalData.preparedByPhone}</span>
      </div>
      <div className="font-black text-[#0D1B4B] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
        {pageCode} | Page {pageNum} of 09
      </div>
    </div>
  )

  const scrollToPage = (pageNum) => {
    setActivePageFocus(String(pageNum))
    const el = document.getElementById(`page-${pageNum}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col rounded-xl overflow-hidden shadow-2xl border border-slate-800 print:bg-white print:text-black print:border-none print:shadow-none print:rounded-none">
      <SEO title="Enterprise Proposal Book Studio — SnapTech Digital" noIndex={true} />

      {/* Print Specifications Standard CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          html, body, #root, #root > div, main {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
          }
          aside, header, nav, .print-hidden, [role="navigation"] {
            display: none !important;
          }
          .a4-container {
            transform: none !important;
            padding: 0 !important;
            margin: 0 !important;
            gap: 0 !important;
            display: block !important;
          }
          .a4-page {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            padding: 12mm 15mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            position: relative !important;
          }
        }
      `}</style>

      {/* ── TOP STUDIO TOOLBAR ────────────────────────────────────────────── */}
      <header className="print-hidden bg-[#0D1B4B] border-b border-blue-900/60 px-4 py-3 sticky top-0 z-50 shadow-xl">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          
          {/* Left Title & Status */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800 transition-colors cursor-pointer"
              title="Toggle Form Controls"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#1B6EF3] text-white text-[9px] font-black uppercase tracking-wider">
                    Official Studio
                  </span>
                  <h1 className="text-sm sm:text-base font-black font-heading tracking-tight text-white">
                    SnapTech 9-Page Enterprise Proposal &amp; Quotation Book
                  </h1>
                </div>
                <p className="text-[10px] text-blue-200/80 hidden sm:block">
                  Live Technical Specification, Commercial Ledger &amp; Legal Sign-Off Book (ST-IT-001 to ST-IT-009)
                </p>
              </div>
            </div>
          </div>

          {/* Center Navigation & Zoom Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Page Jump Selector */}
            <div className="flex items-center gap-1.5 bg-blue-950/80 px-2 py-1 rounded-xl border border-blue-800/80 text-xs">
              <span className="text-[10px] font-bold text-blue-300 uppercase">Page:</span>
              <select
                value={activePageFocus}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === 'all') {
                    setActivePageFocus('all')
                    const el = document.getElementById('page-1')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  } else {
                    scrollToPage(val)
                  }
                }}
                className="bg-[#0D1B4B] text-white border border-blue-800 rounded px-2 py-0.5 text-xs font-mono focus:outline-none cursor-pointer"
              >
                <option value="all">View All (01 – 09)</option>
                <option value="1">Page 01: Quotation Cover</option>
                <option value="2">Page 02: Client &amp; Architecture</option>
                <option value="3">Page 03: Scope of Work</option>
                <option value="4">Page 04: Technical Features</option>
                <option value="5">Page 05: Delivery Roadmap</option>
                <option value="6">Page 06: Commercial Table &amp; Bank</option>
                <option value="7">Page 07: Legal Terms &amp; SLAs</option>
                <option value="8">Page 08: Acceptance &amp; Stamp</option>
                <option value="9">Page 09: Credentials &amp; Closing</option>
              </select>
            </div>

            {/* Zoom Controller */}
            <div className="flex items-center gap-1.5 bg-blue-950/80 px-2 py-1 rounded-xl border border-blue-800/80">
              <button
                type="button"
                onClick={() => setZoomScale(Math.max(0.4, Number((zoomScale - 0.1).toFixed(2))))}
                className="p-1 text-blue-200 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs font-bold text-white bg-blue-900/60 px-2 py-0.5 rounded">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale(Math.min(1.2, Number((zoomScale + 0.1).toFixed(2))))}
                className="p-1 text-blue-200 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(0.75)}
                className="text-[10px] text-blue-300 hover:text-white underline ml-1 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {savedProposals.length > 0 && (
              <select
                value={selectedProposalId}
                onChange={(e) => handleLoadProposal(e.target.value)}
                className="bg-blue-950 border border-blue-800 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="">📂 Load Saved ({savedProposals.length})...</option>
                {savedProposals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.clientCompany} ({p.quotationNumber})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={handleSaveProposal}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Save proposal draft to browser storage"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>

            <button
              type="button"
              onClick={handleResetProposal}
              className="px-2.5 py-1.5 rounded-lg bg-blue-900/70 hover:bg-blue-800 text-blue-200 text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="Reset to default template"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-[#1B6EF3] hover:bg-[#1557c0] text-white px-4 py-1.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
              title="Generate full 9-page A4 print or save as PDF"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF (A4)
            </button>
          </div>

        </div>
      </header>

      {/* ── DUAL-PANE WORKSPACE ────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT FORM DRAWER */}
        {sidebarOpen && (
          <aside className="print-hidden w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-120px)] shrink-0 overflow-y-auto z-20">
            {/* Tabs Header */}
            <div className="grid grid-cols-5 border-b border-slate-800 text-[10px] font-bold text-center bg-slate-950 sticky top-0 z-10">
              {[
                { id: 'client', label: 'Client' },
                { id: 'scope', label: 'Scope' },
                { id: 'pricing', label: 'Pricing' },
                { id: 'timeline', label: 'Timeline' },
                { id: 'presets', label: 'Presets' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveFormTab(t.id)}
                  className={`py-2.5 transition-colors cursor-pointer ${
                    activeFormTab === t.id
                      ? 'bg-[#0D1B4B] text-white border-b-2 border-[#1B6EF3]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-4 text-xs">
              
              {/* TAB 1: CLIENT & METADATA */}
              {activeFormTab === 'client' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-black text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#1B6EF3]" />
                      Client Profile &amp; Metadata
                    </h3>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Client Company / Brand</label>
                    <input
                      type="text"
                      value={proposalData.clientCompany}
                      onChange={(e) => setProposalData({ ...proposalData, clientCompany: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:border-[#1B6EF3] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={proposalData.contactPerson}
                        onChange={(e) => setProposalData({ ...proposalData, contactPerson: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:border-[#1B6EF3] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Designation</label>
                      <input
                        type="text"
                        value={proposalData.clientDesignation}
                        onChange={(e) => setProposalData({ ...proposalData, clientDesignation: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:border-[#1B6EF3] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Project Name</label>
                    <input
                      type="text"
                      value={proposalData.projectName}
                      onChange={(e) => setProposalData({ ...proposalData, projectName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:border-[#1B6EF3] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Project Category</label>
                    <input
                      type="text"
                      value={proposalData.projectCategory}
                      onChange={(e) => setProposalData({ ...proposalData, projectCategory: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:border-[#1B6EF3] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Quotation No</label>
                      <input
                        type="text"
                        value={proposalData.quotationNumber}
                        onChange={(e) => setProposalData({ ...proposalData, quotationNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-[#1B6EF3] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Date</label>
                      <input
                        type="text"
                        value={proposalData.date}
                        onChange={(e) => setProposalData({ ...proposalData, date: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-[#1B6EF3] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Valid Until</label>
                      <input
                        type="text"
                        value={proposalData.validTill}
                        onChange={(e) => setProposalData({ ...proposalData, validTill: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-cyan-400 font-mono focus:border-[#1B6EF3] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Client GST Number</label>
                      <input
                        type="text"
                        value={proposalData.clientGst}
                        onChange={(e) => setProposalData({ ...proposalData, clientGst: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-[#1B6EF3] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Email</label>
                      <input
                        type="text"
                        value={proposalData.clientEmail}
                        onChange={(e) => setProposalData({ ...proposalData, clientEmail: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:border-[#1B6EF3] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Phone</label>
                      <input
                        type="text"
                        value={proposalData.clientPhone}
                        onChange={(e) => setProposalData({ ...proposalData, clientPhone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:border-[#1B6EF3] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Corporate Address</label>
                    <textarea
                      rows={2}
                      value={proposalData.clientAddress}
                      onChange={(e) => setProposalData({ ...proposalData, clientAddress: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-[#1B6EF3] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SCOPE OF WORK */}
              {activeFormTab === 'scope' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-emerald-400 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Included Deliverables ({proposalData.scopeIncluded.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setProposalData({
                            ...proposalData,
                            scopeIncluded: [...proposalData.scopeIncluded, 'New Deliverable Feature'],
                          })
                        }
                        className="text-[10px] bg-emerald-600/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 hover:bg-emerald-600/30 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {proposalData.scopeIncluded.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const updated = [...proposalData.scopeIncluded]
                              updated[idx] = e.target.value
                              setProposalData({ ...proposalData, scopeIncluded: updated })
                            }}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[11px] focus:border-emerald-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setProposalData({
                                ...proposalData,
                                scopeIncluded: proposalData.scopeIncluded.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Out of Scope Exclusions ({proposalData.scopeExcluded.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setProposalData({
                            ...proposalData,
                            scopeExcluded: [...proposalData.scopeExcluded, 'Third-party add-on expenses'],
                          })
                        }
                        className="text-[10px] bg-amber-600/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 hover:bg-amber-600/30 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {proposalData.scopeExcluded.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const updated = [...proposalData.scopeExcluded]
                              updated[idx] = e.target.value
                              setProposalData({ ...proposalData, scopeExcluded: updated })
                            }}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[11px] focus:border-amber-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setProposalData({
                                ...proposalData,
                                scopeExcluded: proposalData.scopeExcluded.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING & BANK */}
              {activeFormTab === 'pricing' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-[#1B6EF3] text-xs flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      Commercial Line Items ({proposalData.lineItems.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setProposalData({
                          ...proposalData,
                          lineItems: [
                            ...proposalData.lineItems,
                            {
                              id: `li-${Date.now()}`,
                              desc: 'Custom Software Module',
                              qty: '1 Package',
                              rate: '25,000',
                            },
                          ],
                        })
                      }
                      className="text-[10px] bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 hover:bg-blue-600/30 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {proposalData.lineItems.map((item, idx) => (
                      <div key={item.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <input
                            type="text"
                            value={item.desc}
                            onChange={(e) => {
                              const updated = [...proposalData.lineItems]
                              updated[idx].desc = e.target.value
                              setProposalData({ ...proposalData, lineItems: updated })
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-[11px] focus:border-[#1B6EF3] outline-none"
                            placeholder="Deliverable Description"
                          />
                          {proposalData.lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setProposalData({
                                  ...proposalData,
                                  lineItems: proposalData.lineItems.filter((_, i) => i !== idx),
                                })
                              }
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={item.qty}
                            onChange={(e) => {
                              const updated = [...proposalData.lineItems]
                              updated[idx].qty = e.target.value
                              setProposalData({ ...proposalData, lineItems: updated })
                            }}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-[11px] text-center focus:border-[#1B6EF3] outline-none"
                            placeholder="Qty (e.g. 1 Suite)"
                          />
                          <input
                            type="text"
                            value={item.rate}
                            onChange={(e) => {
                              const updated = [...proposalData.lineItems]
                              updated[idx].rate = e.target.value
                              setProposalData({ ...proposalData, lineItems: updated })
                            }}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-[11px] text-right font-mono focus:border-[#1B6EF3] outline-none"
                            placeholder="Rate (₹ or INCLUDED)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Discount (₹)</label>
                      <input
                        type="text"
                        value={proposalData.discount}
                        onChange={(e) => setProposalData({ ...proposalData, discount: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white font-mono focus:border-[#1B6EF3] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">GST (%)</label>
                      <input
                        type="text"
                        value={proposalData.gstPercent}
                        onChange={(e) => setProposalData({ ...proposalData, gstPercent: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white font-mono text-center focus:border-[#1B6EF3] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Commercial Payment Terms</label>
                    <textarea
                      rows={2}
                      value={proposalData.paymentTerms}
                      onChange={(e) => setProposalData({ ...proposalData, paymentTerms: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-[11px] focus:border-[#1B6EF3] outline-none"
                    />
                  </div>

                  {/* Bank Account Settings */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <h5 className="font-extrabold text-cyan-400 text-xs">Bank Transfer &amp; UPI Details</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={proposalData.bankName}
                        onChange={(e) => setProposalData({ ...proposalData, bankName: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[11px]"
                        placeholder="Bank Name"
                      />
                      <input
                        type="text"
                        value={proposalData.bankAccountNumber}
                        onChange={(e) => setProposalData({ ...proposalData, bankAccountNumber: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[11px] font-mono"
                        placeholder="Account Number"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={proposalData.bankIfsc}
                        onChange={(e) => setProposalData({ ...proposalData, bankIfsc: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[11px] font-mono"
                        placeholder="IFSC Code"
                      />
                      <input
                        type="text"
                        value={proposalData.upiId}
                        onChange={(e) => setProposalData({ ...proposalData, upiId: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[11px]"
                        placeholder="UPI ID"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TIMELINE PHASES */}
              {activeFormTab === 'timeline' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-blue-400 text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Delivery Roadmap Phases ({proposalData.timelinePhases.length})
                  </h4>
                  <div className="space-y-2">
                    {proposalData.timelinePhases.map((phase, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={phase.phase}
                            onChange={(e) => {
                              const updated = [...proposalData.timelinePhases]
                              updated[idx].phase = e.target.value
                              setProposalData({ ...proposalData, timelinePhases: updated })
                            }}
                            className="w-24 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-white text-[10px] font-mono text-center"
                          />
                          <input
                            type="text"
                            value={phase.duration}
                            onChange={(e) => {
                              const updated = [...proposalData.timelinePhases]
                              updated[idx].duration = e.target.value
                              setProposalData({ ...proposalData, timelinePhases: updated })
                            }}
                            className="w-28 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-cyan-400 text-[10px] font-mono text-right"
                          />
                        </div>
                        <input
                          type="text"
                          value={phase.title}
                          onChange={(e) => {
                            const updated = [...proposalData.timelinePhases]
                            updated[idx].title = e.target.value
                            setProposalData({ ...proposalData, timelinePhases: updated })
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-[11px] font-bold"
                          placeholder="Phase Title"
                        />
                        <textarea
                          rows={2}
                          value={phase.desc}
                          onChange={(e) => {
                            const updated = [...proposalData.timelinePhases]
                            updated[idx].desc = e.target.value
                            setProposalData({ ...proposalData, timelinePhases: updated })
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300 text-[10px]"
                          placeholder="Phase Scope Description"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: PRESETS & SAVED */}
              {activeFormTab === 'presets' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-200 text-xs mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      1-Click Industry Presets
                    </h4>
                    <button
                      type="button"
                      onClick={() => applyPreset('website')}
                      className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="block text-white">🌐 Corporate Web Platform</span>
                        <span className="text-[10px] text-slate-400 font-normal">React, Next.js, SEO, CMS Panel</span>
                      </div>
                      <span className="text-emerald-400 font-mono text-xs">₹49,999</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('mobile')}
                      className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="block text-white">📱 Mobile Application Suite</span>
                        <span className="text-[10px] text-slate-400 font-normal">Android &amp; iOS, REST API, Stores</span>
                      </div>
                      <span className="text-emerald-400 font-mono text-xs">₹89,999</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('software')}
                      className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="block text-white">&lt;/&gt; Enterprise ERP &amp; Billing</span>
                        <span className="text-[10px] text-slate-400 font-normal">Multi-User, GST Ledger, DB Tuning</span>
                      </div>
                      <span className="text-emerald-400 font-mono text-xs">₹1,25,000</span>
                    </button>
                  </div>

                  {/* Saved Drafts List */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <h4 className="font-extrabold text-slate-200 text-xs flex items-center justify-between">
                      <span>Saved Proposal Drafts ({savedProposals.length})</span>
                    </h4>
                    {savedProposals.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">No saved proposals yet. Click "Save" above to store current proposal.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto">
                        {savedProposals.map((p) => (
                          <div
                            key={p.id}
                            className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]"
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="font-bold text-white truncate">{p.clientCompany}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{p.quotationNumber} • {p.date}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleLoadProposal(p.id)}
                                className="text-blue-400 hover:text-blue-300 px-2 py-0.5 rounded bg-blue-900/30 text-[10px] font-bold cursor-pointer"
                              >
                                Load
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = savedProposals.filter((item) => item.id !== p.id)
                                  setSavedProposals(updated)
                                  localStorage.setItem('HP_SAVED_PROPOSALS', JSON.stringify(updated))
                                  if (selectedProposalId === p.id) setSelectedProposalId('')
                                  addToast('Deleted saved proposal', 'info')
                                }}
                                className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </aside>
        )}

        {/* RIGHT LIVE SCALABLE CANVAS VIEWPORT */}
        <main className="flex-1 bg-slate-950 p-6 overflow-auto flex justify-center items-start">
          <div
            className="a4-container transition-transform duration-200 origin-top space-y-12 pb-24"
            style={{ transform: `scale(${zoomScale})` }}
          >
            
            {/* ─────────────────────────────────────────────────────────────────
                PAGE 01: OFFICIAL PROFESSIONAL QUOTATION COVER (ST-IT-001)
                ───────────────────────────────────────────────────────────────── */}
            <div
              id="page-1"
              className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] h-[296.8mm] max-h-[296.8mm] border border-slate-200 box-border"
            >
              <TechnicalWatermark />

              {/* Top Right Document Code Ribbon */}
              <div className="absolute top-0 right-0 bg-[#0D1B4B] text-white font-mono text-xs font-black px-6 py-2 rounded-bl-2xl shadow-md z-20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1B6EF3]" />
                ST-IT-001
              </div>

              {/* Architectural City Skyline & Technical Vector Graphic Overlay */}
              <div className="absolute right-0 bottom-16 w-3/5 h-1/2 opacity-[0.08] pointer-events-none z-0">
                <svg width="100%" height="100%" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 400V250H90V400M90 400V180H140V400M140 400V280H190V400M190 400V120H250V400M250 400V200H310V400M310 400V90H380V400M380 400V230H450V400" stroke="#0D1B4B" strokeWidth="1.5" strokeDasharray="3 3"/>
                  <rect x="220" y="260" width="180" height="110" rx="6" stroke="#0D1B4B" strokeWidth="2" fill="white"/>
                  <path d="M200 370H420" stroke="#0D1B4B" strokeWidth="4" strokeLinecap="round"/>
                  <text x="295" y="325" fill="#1B6EF3" fontSize="24" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>
                  <circle cx="120" cy="150" r="3" fill="#1B6EF3"/>
                  <circle cx="340" cy="70" r="3" fill="#0D1B4B"/>
                  <circle cx="430" cy="200" r="3" fill="#1B6EF3"/>
                  <line x1="120" y1="150" x2="340" y2="70" stroke="#0D1B4B" strokeWidth="0.5" strokeDasharray="2 2"/>
                </svg>
              </div>

              <div className="relative z-10">
                {/* Top Official Company Header */}
                <div className="border-b-2 border-[#0D1B4B] pb-3 mb-4 flex items-center justify-between">
                  <LogoEmblem isLarge={true} lightMode={true} />
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-[#1B6EF3] tracking-wider block">
                      Enterprise Proposal Studio
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono">
                      Ref: {proposalData.quotationNumber}
                    </span>
                  </div>
                </div>

                {/* Main Title Block */}
                <div className="my-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F5FF] border border-[#1B6EF3]/30 text-[#1B6EF3] text-[10px] font-black uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" />
                    Technical Proposal &amp; Investment Quotation
                  </div>
                  <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tight leading-none text-[#0D1B4B]">
                    ENTERPRISE TECHNICAL
                  </h1>
                  <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tight leading-none text-[#1B6EF3] mt-1.5">
                    PROPOSAL &amp; QUOTATION
                  </h1>
                  <p className="text-xs font-bold text-[#0D1B4B] mt-3 tracking-wider uppercase border-l-4 border-[#1B6EF3] pl-3">
                    Web Platforms • Cloud Architecture • Custom Software • Mobile Applications
                  </p>
                </div>

                {/* Middle Section: Prepared For Box & Metadata Icons */}
                <div className="grid grid-cols-12 gap-5 my-6 items-start">
                  <div className="col-span-7 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                      PREPARED FOR
                    </span>
                    <h3 className="font-heading font-black text-lg text-[#0D1B4B] border-b-2 border-[#1B6EF3] pb-1 inline-block mb-3">
                      {proposalData.clientCompany}
                    </h3>

                    <div className="space-y-2 text-xs text-[#1E293B]">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#1B6EF3] shrink-0" />
                        <span className="font-bold w-24">Contact Person</span>
                        <span className="text-slate-400">:</span>
                        <span className="font-semibold text-slate-800 border-b border-slate-300 flex-1 pb-0.5">
                          {proposalData.contactPerson}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#1B6EF3] shrink-0" />
                        <span className="font-bold w-24">Designation</span>
                        <span className="text-slate-400">:</span>
                        <span className="font-semibold text-slate-800 border-b border-slate-300 flex-1 pb-0.5">
                          {proposalData.clientDesignation}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#1B6EF3] shrink-0" />
                        <span className="font-bold w-24">Email</span>
                        <span className="text-slate-400">:</span>
                        <span className="font-semibold text-slate-800 border-b border-slate-300 flex-1 pb-0.5">
                          {proposalData.clientEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#1B6EF3] shrink-0" />
                        <span className="font-bold w-24">Phone</span>
                        <span className="text-slate-400">:</span>
                        <span className="font-semibold text-slate-800 border-b border-slate-300 flex-1 pb-0.5">
                          {proposalData.clientPhone}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Globe className="w-3.5 h-3.5 text-[#1B6EF3] shrink-0 mt-0.5" />
                        <span className="font-bold w-24">Address</span>
                        <span className="text-slate-400">:</span>
                        <span className="font-semibold text-slate-800 border-b border-slate-300 flex-1 pb-0.5">
                          {proposalData.clientAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-5 space-y-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F0F5FF] text-[#1B6EF3] flex items-center justify-center shrink-0 border border-[#1B6EF3]/20">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase block">
                          QUOTATION NO.
                        </span>
                        <span className="font-mono text-xs font-black text-[#0D1B4B]">
                          {proposalData.quotationNumber}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F0F5FF] text-[#1B6EF3] flex items-center justify-center shrink-0 border border-[#1B6EF3]/20">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase block">
                          ISSUE DATE
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {proposalData.date}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1B6EF3] flex items-center justify-center shrink-0 border border-blue-200">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase block">
                          VALID TILL
                        </span>
                        <span className="font-mono text-xs font-bold text-[#1B6EF3]">
                          {proposalData.validTill}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prepared By Section */}
                <div className="my-6 pt-3 border-t border-slate-200 max-w-md">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                    PREPARED &amp; AUTHORED BY
                  </span>
                  <h4 className="font-heading font-black text-sm text-[#0D1B4B]">
                    SnapTech Digital Solutions
                  </h4>
                  <p className="text-[10px] font-bold text-[#1B6EF3]">
                    Enterprise IT &amp; Custom Software Engineering Division
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 mt-2 font-medium">
                    <p className="flex items-center gap-1.5">🌐 {proposalData.preparedByWebsite}</p>
                    <p className="flex items-center gap-1.5">📧 {proposalData.preparedByEmail}</p>
                    <p className="flex items-center gap-1.5">📞 {proposalData.preparedByPhone}</p>
                    <p className="flex items-center gap-1.5">📍 Bhilwara, Rajasthan, India</p>
                  </div>
                </div>

                {/* Bottom 3 Service Badges */}
                <div className="grid grid-cols-3 gap-2 border-t-2 border-slate-200 pt-3">
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0D1B4B] text-white flex items-center justify-center text-xs shrink-0">
                      💻
                    </div>
                    <div>
                      <span className="font-heading font-black text-[10px] text-[#0D1B4B] uppercase block leading-tight">
                        WEB PLATFORMS
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold block">REACT • NEXT.JS • CLOUD</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#1B6EF3] text-white flex items-center justify-center text-xs shrink-0">
                      📱
                    </div>
                    <div>
                      <span className="font-heading font-black text-[10px] text-[#0D1B4B] uppercase block leading-tight">
                        MOBILE APPS
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold block">ANDROID • IOS • HYBRID</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0D1B4B] text-white flex items-center justify-center text-xs shrink-0">
                      &lt;/&gt;
                    </div>
                    <div>
                      <span className="font-heading font-black text-[10px] text-[#0D1B4B] uppercase block leading-tight">
                        SOFTWARE &amp; ERP
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold block">APIS • DATABASE • CLOUD</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Solid Footer Bar */}
              <div className="mt-4 bg-[#0D1B4B] text-white text-[9px] py-2 px-4 rounded-b-lg flex items-center justify-between font-mono relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1B6EF3]" />
                  <span>snaptech.digital</span>
                </div>
                <div className="text-slate-300">CONFIDENTIAL PROPOSAL • ST-IT-001</div>
                <div className="font-bold text-cyan-300">Page 01 of 09</div>
              </div>

            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 02: CLIENT PROFILE & ENGINEERING OVERVIEW (ST-IT-002)
                ───────────────────────────────────────────────────────────────── */}
            <div
              id="page-2"
              className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] h-[296.8mm] max-h-[296.8mm] border border-slate-200 box-border"
            >
              <TechnicalWatermark />

              <div className="relative z-10">
                {renderHeader('ST-IT-002', 'Client Profile & Architecture')}

                {/* Main Section Title */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-heading font-black text-2xl text-[#0D1B4B] tracking-tight">
                        01. CLIENT SPECIFICATIONS &amp; ARCHITECTURAL SCOPE
                      </h2>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        Formal Project Metadata, Engagement Details &amp; Technical Foundation
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#F0F5FF] text-[#1B6EF3] border border-[#1B6EF3]/30 text-[10px] font-bold font-mono">
                      PHASE: DISCOVERY &amp; SCOPING
                    </span>
                  </div>
                </div>

                {/* 2 Column Layout: Left Cards (Col-7) | Right Blueprint IT Grid (Col-5) */}
                <div className="grid grid-cols-12 gap-5 items-start">
                  
                  <div className="col-span-7 space-y-4">
                    
                    {/* CARD 01: CLIENT DETAILS */}
                    <div className="border-2 border-[#0D1B4B] rounded-xl relative pt-6 pb-3.5 px-4 bg-white shadow-xs">
                      <div className="absolute top-0 left-0 bg-[#0D1B4B] text-white px-3.5 py-1 rounded-br-xl font-heading font-black text-xs tracking-wider flex items-center gap-2">
                        <span className="bg-[#1B6EF3] text-white px-1.5 py-0.2 rounded text-[10px]">01</span>
                        CLIENT PROFILE &amp; STAKEHOLDER
                      </div>

                      <div className="space-y-2 text-xs font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">🏢</span>
                          <span className="font-bold w-36">Company Name :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-300 pb-0.5">
                            {proposalData.clientCompany}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">👤</span>
                          <span className="font-bold w-36">Contact Person :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-300 pb-0.5">
                            {proposalData.contactPerson}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">🪪</span>
                          <span className="font-bold w-36">Designation :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-300 pb-0.5">
                            {proposalData.clientDesignation}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">📞</span>
                          <span className="font-bold w-36">Phone Number :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-300 pb-0.5">
                            {proposalData.clientPhone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">✉️</span>
                          <span className="font-bold w-36">Email Address :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-300 pb-0.5">
                            {proposalData.clientEmail}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">📍</span>
                          <span className="font-bold w-36">Company Address :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-300 pb-0.5">
                            {proposalData.clientAddress}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">📜</span>
                          <span className="font-bold w-36">GSTIN Number :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-300 pb-0.5 font-mono">
                            {proposalData.clientGst || 'NOT APPLICABLE / UNREGISTERED'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD 02: PROJECT OVERVIEW */}
                    <div className="border-2 border-[#0D1B4B] rounded-xl relative pt-6 pb-3.5 px-4 bg-white shadow-xs">
                      <div className="absolute top-0 left-0 bg-[#0D1B4B] text-white px-3.5 py-1 rounded-br-xl font-heading font-black text-xs tracking-wider flex items-center gap-2">
                        <span className="bg-[#1B6EF3] text-white px-1.5 py-0.2 rounded text-[10px]">02</span>
                        TECHNICAL ENGAGEMENT SUMMARY
                      </div>

                      <div className="space-y-2 text-xs font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">📁</span>
                          <span className="font-bold w-36">Project Title :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-300 pb-0.5">
                            {proposalData.projectName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">⚙️</span>
                          <span className="font-bold w-36">Project Category :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-300 pb-0.5">
                            {proposalData.projectCategory}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">&lt;/&gt;</span>
                          <span className="font-bold w-36">Core Tech Stack :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-300 pb-0.5">
                            React, Node.js, PostgreSQL, TailwindCSS
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">📅</span>
                          <span className="font-bold w-36">Target Delivery :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-300 pb-0.5">
                            12 – 14 Business Days (6 Sprint Phases)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">₹</span>
                          <span className="font-bold w-36">Commercial Total :</span>
                          <span className="font-bold text-[#1B6EF3] flex-1 border-b border-dotted border-slate-300 pb-0.5 font-mono">
                            ₹{grandTotalNum.toLocaleString('en-IN')} (Inclusive of 18% GST)
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Architectural Blueprint Diagram */}
                  <div className="col-span-5 bg-[#F8FAFC] border-2 border-slate-200 rounded-xl p-4 flex flex-col justify-between h-full min-h-[340px]">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                        <span className="text-[10px] font-black text-[#0D1B4B] uppercase tracking-wider">
                          SYSTEM ARCHITECTURE
                        </span>
                        <span className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ENTERPRISE N-TIER
                        </span>
                      </div>

                      {/* Blueprint Graphic */}
                      <svg viewBox="0 0 320 220" fill="none" className="w-full h-auto text-[#0D1B4B]">
                        {/* Background Grid */}
                        <path d="M 0 40 H 320 M 0 100 H 320 M 0 160 H 320 M 60 0 V 220 M 160 0 V 220 M 260 0 V 220" stroke="#0D1B4B" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.15" />

                        {/* Client Layer */}
                        <g transform="translate(10, 20)">
                          <rect width="90" height="45" rx="6" stroke="#0D1B4B" strokeWidth="1.5" fill="white" />
                          <text x="45" y="22" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0D1B4B" fontFamily="sans-serif">CLIENT TIER</text>
                          <text x="45" y="34" textAnchor="middle" fontSize="7.5" fill="#1B6EF3" fontFamily="sans-serif">React / Mobile Web</text>
                        </g>

                        {/* Arrow 1 */}
                        <path d="M 100 42 H 125" stroke="#1B6EF3" strokeWidth="1.5" markerEnd="url(#arrow)" />
                        
                        {/* Cloudflare / Security Gateway */}
                        <g transform="translate(125, 20)">
                          <rect width="70" height="45" rx="6" stroke="#1B6EF3" strokeWidth="1.5" fill="#F0F5FF" />
                          <text x="35" y="22" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0D1B4B" fontFamily="sans-serif">SECURITY</text>
                          <text x="35" y="34" textAnchor="middle" fontSize="7" fill="#1B6EF3" fontFamily="sans-serif">SSL / Firewall</text>
                        </g>

                        {/* Arrow 2 */}
                        <path d="M 195 42 H 220" stroke="#1B6EF3" strokeWidth="1.5" />

                        {/* Node.js API Service */}
                        <g transform="translate(220, 20)">
                          <rect width="90" height="45" rx="6" stroke="#0D1B4B" strokeWidth="1.5" fill="white" />
                          <text x="45" y="22" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0D1B4B" fontFamily="sans-serif">API SERVICE</text>
                          <text x="45" y="34" textAnchor="middle" fontSize="7.5" fill="#1B6EF3" fontFamily="sans-serif">Node.js / Express</text>
                        </g>

                        {/* Down Arrow to DB */}
                        <path d="M 265 65 V 110" stroke="#0D1B4B" strokeWidth="1.5" strokeDasharray="3 3" />

                        {/* Database Tier */}
                        <g transform="translate(220, 110)">
                          <rect width="90" height="45" rx="6" stroke="#0D1B4B" strokeWidth="1.5" fill="#F0F5FF" />
                          <text x="45" y="22" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0D1B4B" fontFamily="sans-serif">DATABASE</text>
                          <text x="45" y="34" textAnchor="middle" fontSize="7.5" fill="#1B6EF3" fontFamily="sans-serif">PostgreSQL</text>
                        </g>

                        {/* Cloud Storage / DevOps */}
                        <g transform="translate(10, 110)">
                          <rect width="90" height="45" rx="6" stroke="#0D1B4B" strokeWidth="1.5" fill="white" />
                          <text x="45" y="22" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0D1B4B" fontFamily="sans-serif">HOSTING &amp; CDN</text>
                          <text x="45" y="34" textAnchor="middle" fontSize="7.5" fill="#1B6EF3" fontFamily="sans-serif">NVMe Cloud / S3</text>
                        </g>

                        {/* Connective Bus */}
                        <path d="M 100 132 H 220" stroke="#0D1B4B" strokeWidth="1.5" strokeDasharray="3 3" />
                      </svg>
                    </div>

                    <div className="border-t border-slate-200 pt-3 mt-2">
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1">
                        EXECUTIVE SPECIFICATION NOTE
                      </span>
                      <p className="text-[10px] text-slate-700 leading-relaxed font-normal">
                        Designed with modular component isolation ensuring horizontal scalability, zero-downtime updates, automated data encryption, and instant sub-100ms API response latency.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Bottom Quotation Prepared By Box */}
                <div className="mt-4 p-3.5 rounded-xl border-2 border-[#0D1B4B] bg-slate-50">
                  <div className="grid grid-cols-4 gap-3 items-center text-xs">
                    
                    <div className="flex items-center gap-2 border-r border-slate-300 pr-2">
                      <div className="w-8 h-8 rounded-full bg-[#0D1B4B] text-white flex items-center justify-center shrink-0 text-xs">
                        🏢
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block leading-tight">
                          Authoring Agency
                        </span>
                        <span className="font-heading font-black text-slate-900 text-[10.5px]">
                          SnapTech Digital Solutions
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-r border-slate-300 pr-2">
                      <div className="w-7 h-7 rounded-full bg-[#1B6EF3]/10 text-[#1B6EF3] flex items-center justify-center shrink-0">
                        🌐
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block leading-tight">Website</span>
                        <span className="font-mono text-[10px] font-bold text-slate-800">
                          {proposalData.preparedByWebsite}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-r border-slate-300 pr-2">
                      <div className="w-7 h-7 rounded-full bg-[#1B6EF3]/10 text-[#1B6EF3] flex items-center justify-center shrink-0">
                        ✉️
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block leading-tight">Direct Email</span>
                        <span className="font-mono text-[10px] font-bold text-slate-800">
                          {proposalData.preparedByEmail}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1B6EF3]/10 text-[#1B6EF3] flex items-center justify-center shrink-0">
                        📞
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block leading-tight">Direct Helpline</span>
                        <span className="font-mono text-[10px] font-bold text-slate-800">
                          {proposalData.preparedByPhone}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {renderFooter('ST-IT-002', '02')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 03: DETAILED SCOPE OF WORK (ST-IT-003)
                ───────────────────────────────────────────────────────────────── */}
            <div
              id="page-3"
              className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] h-[296.8mm] max-h-[296.8mm] border border-slate-200 box-border"
            >
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-003', 'Scope of Work', 'Inclusions & Exclusions')}

                <h2 className="font-heading text-xl font-black text-[#0D1B4B] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1B6EF3]" />
                  02. DETAILED SCOPE OF WORK &amp; DELIVERABLES SPECIFICATION
                </h2>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading text-xs font-extrabold text-[#0D1B4B] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Deliverables Included In Project Scope ({proposalData.scopeIncluded.length})
                    </h3>
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      100% INCLUDED IN INVESTMENT
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#1E293B]">
                    {proposalData.scopeIncluded.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-semibold text-[11px] leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading text-xs font-extrabold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-amber-600" />
                      Items Excluded / Out of Scope Boundaries ({proposalData.scopeExcluded.length})
                    </h3>
                    <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      THIRD-PARTY OR SEPARATE SOW
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#1E293B]">
                    {proposalData.scopeExcluded.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200 flex items-start gap-2">
                        <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="font-semibold text-[11px] leading-snug text-slate-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scope Governance Box */}
                <div className="p-3.5 rounded-xl bg-[#F0F5FF] border border-[#1B6EF3]/30 text-xs">
                  <h4 className="font-heading font-black text-[#0D1B4B] uppercase text-[11px] mb-1">
                    Engineering Scope Governance &amp; Change Order Policy
                  </h4>
                  <p className="text-slate-700 leading-relaxed font-normal text-[10.5px]">
                    Any additional requirement or architectural alteration requested outside this agreed specification will be scoped under a secondary Sprint Addendum at transparent, predefined milestone rates.
                  </p>
                </div>
              </div>

              {renderFooter('ST-IT-003', '03')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 04: TECHNICAL FEATURES & ARCHITECTURE (ST-IT-004)
                ───────────────────────────────────────────────────────────────── */}
            <div
              id="page-4"
              className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] h-[296.8mm] max-h-[296.8mm] border border-slate-200 box-border"
            >
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-004', 'Architecture Standards', '8 Engineering Pillars')}

                <h2 className="font-heading text-xl font-black text-[#0D1B4B] mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#1B6EF3]" />
                  03. TECHNICAL CAPABILITIES &amp; ARCHITECTURAL PILLARS
                </h2>

                <div className="grid grid-cols-2 gap-3.5 text-xs text-[#1E293B] mb-5">
                  {[
                    {
                      title: '100% Mobile Responsive',
                      desc: 'Flawless responsive typography & layout grid across smartphones, tablets, laptops, and ultra-wide 4K screens.',
                      icon: Smartphone,
                    },
                    {
                      title: 'Google SEO & Schema Ready',
                      desc: 'On-Page SEO architecture, OpenGraph meta tags, JSON-LD structured rich snippets, and automated XML sitemap.',
                      icon: Search,
                    },
                    {
                      title: 'Enterprise Security & SSL',
                      desc: '256-bit TLS encryption, strict Content Security Policy, SQL injection defense, and rate-limited API endpoints.',
                      icon: Lock,
                    },
                    {
                      title: 'Administrative CMS Control',
                      desc: 'Intuitive administrative dashboard for managing client inquiries, leads, site content, media, and analytics.',
                      icon: Building2,
                    },
                    {
                      title: 'REST API Micro-Architecture',
                      desc: 'Modular, decoupled RESTful API endpoints engineered in Node.js for ultra-fast response times & third-party integrations.',
                      icon: Code,
                    },
                    {
                      title: 'Relational Database Tuning',
                      desc: 'PostgreSQL database modeling with foreign-key constraints, optimized indexes, and automated daily cloud snapshots.',
                      icon: Database,
                    },
                    {
                      title: 'NVMe Cloud Infrastructure',
                      desc: 'High-speed cloud server hosting backed by 99.9% uptime SLA, automated CDN caching, and DDoS mitigation.',
                      icon: Server,
                    },
                    {
                      title: '30-Day Technical Warranty',
                      desc: 'Comprehensive post-launch technical assistance, code warranties, video training walkthroughs, and developer SLA.',
                      icon: Shield,
                    },
                  ].map((feat, idx) => {
                    const IconC = feat.icon
                    return (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0D1B4B] text-white flex items-center justify-center shrink-0">
                          <IconC className="w-4.5 h-4.5 text-cyan-300" />
                        </div>
                        <div>
                          <h3 className="font-heading font-black text-xs text-[#0D1B4B] mb-0.5">{feat.title}</h3>
                          <p className="text-slate-600 text-[10px] leading-relaxed">{feat.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Tech Badges Footer Strip */}
                <div className="p-3 rounded-xl border border-slate-200 bg-[#F8FAFC]">
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1.5">
                    TECHNOLOGY STACK ECOSYSTEM
                  </span>
                  <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono font-bold text-slate-700">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-300">⚛️ React 19 / Vite</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-300">🟢 Node.js &amp; Express</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-300">🐘 PostgreSQL DB</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-300">🎨 TailwindCSS v4</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-300">🔒 256-Bit TLS SSL</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-300">⚡ Google Lighthouse 95+</span>
                  </div>
                </div>
              </div>

              {renderFooter('ST-IT-004', '04')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 05: DEVELOPMENT TIMELINE ROADMAP (ST-IT-005)
                ───────────────────────────────────────────────────────────────── */}
            <div
              id="page-5"
              className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] h-[296.8mm] max-h-[296.8mm] border border-slate-200 box-border"
            >
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-005', 'Project Roadmap', '6 Sprint Phases')}

                <h2 className="font-heading text-xl font-black text-[#0D1B4B] mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#1B6EF3]" />
                  04. PROJECT DELIVERY ROADMAP &amp; SPRINT TIMELINE
                </h2>

                <div className="space-y-2.5 text-xs text-[#1E293B] mb-5">
                  {proposalData.timelinePhases.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                      <div className="px-2.5 py-1 rounded bg-[#0D1B4B] text-white font-mono font-bold text-[10px] shrink-0">
                        {item.phase}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-heading font-black text-xs text-[#0D1B4B]">{item.title}</h3>
                          <span className="font-mono text-[10px] font-bold text-[#1B6EF3] bg-[#F0F5FF] px-2 py-0.5 rounded border border-[#1B6EF3]/20">
                            {item.duration}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[10px] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Milestone Sign-off Checklist */}
                <div className="p-3.5 rounded-xl bg-[#F0F5FF] border border-[#1B6EF3]/30 text-xs">
                  <h4 className="font-heading font-black text-[#0D1B4B] uppercase text-[11px] mb-1">
                    Quality Gateways &amp; Milestone Sign-off Protocol
                  </h4>
                  <p className="text-slate-700 leading-relaxed font-normal text-[10.5px]">
                    Each phase undergoes systematic internal code inspection and automated testing before client demonstration. Staging reviews are hosted on private preview servers for transparent approval.
                  </p>
                </div>
              </div>

              {renderFooter('ST-IT-005', '05')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 06: COMMERCIAL PROPOSAL & BANK DETAILS (ST-IT-006)
                ───────────────────────────────────────────────────────────────── */}
            <div
              id="page-6"
              className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] h-[296.8mm] max-h-[296.8mm] border border-slate-200 box-border"
            >
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-006', 'Commercial Quotation', 'Financial Ledger')}

                <h2 className="font-heading text-xl font-black text-[#0D1B4B] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1B6EF3]" />
                  05. COMMERCIAL PROPOSAL &amp; INVESTMENT BREAKDOWN
                </h2>

                {/* Quotation Table */}
                <table className="w-full text-xs text-[#1E293B] border border-slate-200 rounded-lg overflow-hidden mb-4">
                  <thead>
                    <tr className="bg-[#0D1B4B] text-white font-heading text-xs">
                      <th className="p-2.5 text-left w-10">#</th>
                      <th className="p-2.5 text-left">Description / Scoped Deliverables</th>
                      <th className="p-2.5 text-center w-24">Quantity</th>
                      <th className="p-2.5 text-right w-36">Investment ({proposalData.currency})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposalData.lineItems.map((item, idx) => (
                      <tr key={item.id || idx} className={`border-b border-slate-200 ${idx % 2 === 1 ? 'bg-slate-50' : ''}`}>
                        <td className="p-2.5 font-bold font-mono">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="p-2.5 font-bold text-[#0D1B4B]">{item.desc}</td>
                        <td className="p-2.5 text-center font-semibold text-slate-700">{item.qty}</td>
                        <td className={`p-2.5 text-right font-bold font-mono ${item.rate === 'INCLUDED' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {item.rate === 'INCLUDED' ? 'INCLUDED' : `₹${item.rate}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals & Tax Calculation Box */}
                <div className="flex justify-end mb-4">
                  <div className="w-72 bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5 shadow-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal Amount:</span>
                      <span className="font-bold text-slate-900 font-mono">₹{subtotalNum.toLocaleString('en-IN')}</span>
                    </div>
                    {discountNum > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Commercial Discount:</span>
                        <span className="font-mono">- ₹{discountNum.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                      <span>Taxable Total:</span>
                      <span className="font-bold text-slate-900 font-mono">₹{taxableNum.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST ({proposalData.gstPercent}%):</span>
                      <span className="font-bold text-slate-900 font-mono">₹{gstNum.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#0D1B4B] pt-1.5 border-t-2 border-[#0D1B4B]">
                      <span>Grand Total:</span>
                      <span className="font-mono text-[#1B6EF3]">₹{grandTotalNum.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Terms & Bank Transfer Details */}
                <div className="grid grid-cols-12 gap-3 items-start">
                  
                  {/* Payment Terms */}
                  <div className="col-span-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <h4 className="font-heading font-black text-[#0D1B4B] uppercase text-[10.5px] mb-1 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#1B6EF3]" />
                      Commercial Payment Terms
                    </h4>
                    <p className="text-slate-700 leading-relaxed font-medium text-[10.5px]">
                      {proposalData.paymentTerms}
                    </p>
                    <p className="text-[9.5px] text-slate-500 mt-2 font-mono">
                      * Invoices generated with GST compliance &amp; digital tax credit input.
                    </p>
                  </div>

                  {/* Bank Account & UPI Details */}
                  <div className="col-span-6 p-3.5 rounded-xl bg-[#F0F5FF] border border-[#1B6EF3]/30 text-xs">
                    <h4 className="font-heading font-black text-[#0D1B4B] uppercase text-[10.5px] mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#1B6EF3]" />
                        Bank Account &amp; UPI Details
                      </span>
                      <span className="text-[8px] bg-[#1B6EF3] text-white px-1.5 py-0.2 rounded font-mono font-bold">
                        VERIFIED
                      </span>
                    </h4>
                    <div className="space-y-1 text-[10px] text-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Beneficiary:</span>
                        <span className="font-bold">{proposalData.bankAccountName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bank Name:</span>
                        <span className="font-bold">{proposalData.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">A/C Number:</span>
                        <span className="font-bold font-mono">{proposalData.bankAccountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">IFSC Code:</span>
                        <span className="font-bold font-mono text-[#1B6EF3]">{proposalData.bankIfsc}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">UPI ID:</span>
                        <span className="font-bold font-mono text-emerald-700">{proposalData.upiId}</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {renderFooter('ST-IT-006', '06')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 07: TERMS & CONDITIONS & SLAS (ST-IT-007)
                ───────────────────────────────────────────────────────────────── */}
            <div
              id="page-7"
              className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] h-[296.8mm] max-h-[296.8mm] border border-slate-200 box-border"
            >
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-007', 'Legal & Warranties', '6 Clauses')}

                <h2 className="font-heading text-xl font-black text-[#0D1B4B] mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#1B6EF3]" />
                  06. LEGAL TERMS, WARRANTIES &amp; SLA SPECIFICATIONS
                </h2>

                <div className="space-y-3 text-xs text-[#1E293B] mb-5">
                  {proposalData.legalTerms.map((clause, idx) => (
                    <div key={clause.id || idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <h3 className="font-heading font-extrabold text-[#0D1B4B] text-[11px] mb-0.5">{clause.title}</h3>
                      <p className="text-slate-600 text-[10px] leading-relaxed">{clause.text}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#F0F5FF] border border-[#1B6EF3]/30 text-xs">
                  <h4 className="font-heading font-black text-[#0D1B4B] uppercase text-[10.5px] mb-0.5">
                    Governing Law &amp; Jurisdiction
                  </h4>
                  <p className="text-slate-700 text-[10px] leading-relaxed font-normal">
                    This commercial agreement and technical proposal are governed under the laws of Rajasthan, India. In the event of any arbitration, the designated courts of Bhilwara, Rajasthan shall hold sole legal jurisdiction.
                  </p>
                </div>
              </div>

              {renderFooter('ST-IT-007', '07')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 08: ACCEPTANCE & SIGNATURES (ST-IT-008)
                ───────────────────────────────────────────────────────────────── */}
            <div
              id="page-8"
              className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] h-[296.8mm] max-h-[296.8mm] border border-slate-200 box-border"
            >
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-008', 'Mutual Acceptance', 'Official Sign-Off')}

                <h2 className="font-heading text-xl font-black text-[#0D1B4B] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#1B6EF3]" />
                  07. FORMAL PROPOSAL ACCEPTANCE &amp; AUTHORIZED SIGNATURES
                </h2>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#1E293B] mb-6">
                  <p className="leading-relaxed font-semibold text-[11px] text-slate-800">
                    By signing below, the Client confirms official acceptance of the scope of work, technical specifications, commercial quotation, and legal terms outlined across Document Codes <strong>ST-IT-001 through ST-IT-009</strong> for <strong>{proposalData.projectName}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 text-xs text-[#1E293B] mt-4">
                  {/* Client Signatory */}
                  <div className="p-5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col justify-between h-64">
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                        CLIENT AUTHORIZED SIGNATORY
                      </span>
                      <h3 className="font-heading font-black text-sm text-[#0D1B4B]">{proposalData.clientCompany}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Contact: {proposalData.contactPerson} ({proposalData.clientDesignation})</p>
                    </div>

                    <div className="my-auto self-center">
                      <div className="w-24 h-16 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[9px] uppercase font-bold text-center p-1">
                        CLIENT COMPANY OFFICIAL STAMP &amp; SIGN
                      </div>
                    </div>

                    <div className="border-t border-slate-300 pt-2">
                      <p className="font-bold text-[11px] text-slate-900">Authorized Signature</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Name: {proposalData.contactPerson}</p>
                      <p className="text-slate-500 text-[10px]">Date &amp; Place: ____________________</p>
                    </div>
                  </div>

                  {/* Vendor Signatory */}
                  <div className="p-5 rounded-xl border-2 border-[#0D1B4B] bg-[#F0F5FF]/40 flex flex-col justify-between h-64">
                    <div>
                      <span className="text-[9px] font-extrabold text-[#1B6EF3] uppercase tracking-wider block mb-1">
                        VENDOR AUTHORIZED SIGNATORY
                      </span>
                      <h3 className="font-heading font-black text-sm text-[#0D1B4B]">SnapTech Digital Solutions</h3>
                      <p className="text-[10px] text-slate-600 mt-0.5">Enterprise IT &amp; Software Solutions Division</p>
                    </div>

                    <div className="my-auto self-center">
                      <div className="w-20 h-20 rounded-full border-2 border-[#0D1B4B] border-dashed flex flex-col items-center justify-center text-[#0D1B4B] font-mono text-[7.5px] font-black text-center p-1 uppercase bg-white shadow-xs">
                        <span className="text-[#1B6EF3] text-[9px] font-bold">★ SEAL ★</span>
                        <span>SNAPTECH DIGITAL</span>
                        <span className="text-[6.5px] text-slate-500">OFFICIAL STAMP</span>
                      </div>
                    </div>

                    <div className="border-t border-[#0D1B4B]/30 pt-2">
                      <p className="font-bold text-[#0D1B4B] text-[11px]">Authorized Signatory</p>
                      <p className="text-slate-700 text-[10px] mt-0.5">Designation: Managing Director &amp; Lead Architect</p>
                      <p className="text-slate-700 text-[10px]">Date: {proposalData.date}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-[10px] text-slate-500">
                  Document Authenticity Verification ID: <span className="font-mono font-bold text-[#0D1B4B]">{proposalData.quotationNumber}-VERIFIED</span>
                </div>
              </div>

              {renderFooter('ST-IT-008', '08')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 09: THANK YOU & CORPORATE CREDENTIALS (ST-IT-009)
                ───────────────────────────────────────────────────────────────── */}
            <div
              id="page-9"
              className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] h-[296.8mm] max-h-[296.8mm] border border-slate-200 box-border"
            >
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-009', 'Corporate Closing', 'Support Desk')}

                <div className="text-center my-8 max-w-xl mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F5FF] text-[#1B6EF3] font-mono text-xs font-bold uppercase tracking-widest mb-3 border border-[#1B6EF3]/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    THANK YOU FOR YOUR PARTNERSHIP
                  </div>
                  <h2 className="font-heading text-3xl font-black text-[#0D1B4B] tracking-tight">
                    We Look Forward to Engineering Your Digital Success
                  </h2>
                  <p className="text-slate-600 text-xs mt-3 leading-relaxed">
                    SnapTech Digital Solutions is committed to delivering world-class engineering, transparent communication, and enduring commercial growth for {proposalData.clientCompany}.
                  </p>
                </div>

                {/* Corporate Credentials Card */}
                <div className="p-6 rounded-2xl bg-[#0D1B4B] text-white my-6 max-w-xl mx-auto shadow-xl">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-2 space-y-2.5 text-xs">
                      <div>
                        <h3 className="font-heading font-black text-base text-white">SnapTech Digital Solutions</h3>
                        <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">Enterprise IT &amp; Software Solutions Division</p>
                      </div>
                      
                      <div className="space-y-1.5 pt-1 text-slate-200">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-[#1B6EF3] shrink-0" />
                          <span>{proposalData.preparedByWebsite}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#1B6EF3] shrink-0" />
                          <span>{proposalData.preparedByEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#1B6EF3] shrink-0" />
                          <span>{proposalData.preparedByPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-[#1B6EF3] shrink-0" />
                          <span>Bhilwara, Rajasthan, India — 311001</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center bg-white p-3 rounded-xl text-slate-900 shadow-md">
                      <div className="w-20 h-20 mx-auto bg-slate-50 border border-slate-300 rounded flex items-center justify-center p-1">
                        <QrCode className="w-16 h-16 text-[#0D1B4B]" />
                      </div>
                      <span className="text-[8px] font-black uppercase block mt-1.5 text-[#0D1B4B]">
                        SCAN TO VERIFY
                      </span>
                      <span className="text-[7px] text-slate-500 font-mono block">
                        STD-AUTH-2026
                      </span>
                    </div>
                  </div>
                </div>

                {/* Escalation Matrix Box */}
                <div className="max-w-xl mx-auto p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase block mb-1">
                    CLIENT SUCCESS &amp; ESCALATION MATRIX
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-800 font-semibold pt-1">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[8px] text-slate-400 uppercase block">Level 1</span>
                      <span>Account Executive</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[8px] text-slate-400 uppercase block">Level 2</span>
                      <span>Lead Architect</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[8px] text-slate-400 uppercase block">Level 3</span>
                      <span>Executive Director</span>
                    </div>
                  </div>
                </div>

              </div>

              {renderFooter('ST-IT-009', '09')}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * AdminProposalBookPage.jsx
 * 
 * Fortune-500 Enterprise Proposal & Quotation Book Studio
 * Designed to Deloitte, IBM, Microsoft & Accenture Brand Guidelines.
 * 
 * Core Specifications:
 * - Document Codes: ST-IT-001 to ST-IT-009
 * - Palette: Deep Navy #0A2540, Enterprise Red #D32F2F, Slate #1E293B, Cool Gray #64748B, Blueprint Grid #F1F5F9, Pure White #FFFFFF
 * - Geometry: 12-Column Technical Editorial Grid (A4 Portrait 210mm x 297mm @ 300 DPI)
 * - Vector Graphics: Technical Architectural Blueprint SVG Overlay + Outline Micro-Icons
 * - Dual-Pane Studio UI: Collapsible Form Drawer + Scalable A4 Canvas Viewport (Zoom 60%–100%)
 * - 100% Live Editable & Multi-Client Saved Proposals Manager
 */

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { SEO } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
import { useSiteSettings } from '@/hooks/useContent'
import snaptechLogo from '@/assets/snaptech-logo.png'
// Official Brand Logo Emblem Component (Declared at module level for stable React rendering)
function LogoEmblem({ isLarge = false }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={snaptechLogo}
        alt="Snaptech - Hindustan Projects IT"
        className={isLarge ? "h-11 object-contain" : "h-8.5 object-contain"}
      />
      <div className="border-l border-slate-300 pl-2.5 hidden sm:block">
        <span className="text-[7.5px] font-black text-[#001D4A] tracking-wider uppercase block">
          A HINDUSTAN PROJECTS ENTERPRISE
        </span>
        <span className="text-[7px] font-bold text-[#0066FF] tracking-widest uppercase block">
          IT &amp; SOFTWARE ENGINEERING DIVISION
        </span>
      </div>
    </div>
  )
}

// Architectural Technical Watermark Background Component (Declared at module level)
function TechnicalWatermark() {
  return (
    <>
      {/* Background Micro Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="blueprint-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#0A2540" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        </svg>
      </div>

      {/* Security Diagonal Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none rotate-[-35deg] z-0">
        <span className="font-heading font-black text-6xl text-[#0A2540] uppercase tracking-widest text-center leading-tight">
          HINDUSTAN PROJECTS IT SERVICES<br />CONFIDENTIAL PROPOSAL
        </span>
      </div>
    </>
  )
}

export default function AdminProposalBookPage() {
  const { addToast } = useToast()
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}

  // Studio UI Controls
  const [zoomScale, setZoomScale] = useState(0.75) // Default comfortable 75% scale
  const [activeFormTab, setActiveFormTab] = useState('client')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Saved Proposals State
  const [savedProposals, setSavedProposals] = useState([])
  const [selectedProposalId, setSelectedProposalId] = useState('')

  // 100% Editable Proposal Model
  const [proposalData, setProposalData] = useState({
    id: 'prop-default',
    clientCompany: 'AURA ENTERPRISES PVT LTD',
    contactPerson: 'Mr. Rajesh Sharma',
    clientDesignation: 'Managing Director & CEO',
    clientEmail: 'rajesh.sharma@auraenterprises.com',
    clientPhone: '+91 98765 43210',
    clientAddress: 'Plot 42, Cyber Tech Park, Sector 62, Noida, UP',
    projectName: 'High-Performance E-Commerce & ERP Ecosystem',
    quotationNumber: 'HPIT-2026-089',
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    currency: 'INR (₹)',
    discount: '10,000',
    gstPercent: '18',
    paymentTerms: '50% Milestone Advance upon technical agreement, 50% upon final production deployment & approval.',
    preparedBy: 'SnapTech Digital Solutions',
    preparedByEmail: cfg.email || 'info@snaptech.digital',
    preparedByPhone: cfg.phone || '+91 75970 00601',
    preparedByWebsite: 'www.snaptech.digital',
    
    // Scope of Work Arrays
    scopeIncluded: [
      'Custom Responsive UI/UX Design System',
      'Frontend Development (React / Next.js)',
      'Backend REST API Architecture (Node.js)',
      'Database Architecture & Query Optimization',
      'Admin Management Dashboard Panel',
      'Google On-Page & Technical SEO Setup',
      'High-Speed NVMe Cloud Server Hosting Setup',
      '256-bit SSL Security Encryption Certificate',
      'Free Domain Name (.com / .in) Registration',
      'Dedicated Post-Launch Technical Support',
    ],
    scopeExcluded: [
      'Third-party paid API subscription costs',
      'Paid advertising budget / ad spends',
      'Custom video shoot content creation',
      'Legal trademark registration fees',
    ],

    // Commercial Line Items
    lineItems: [
      { id: 'li1', desc: 'Custom Enterprise E-Commerce & Web Platform', qty: '1 Suite', rate: '1,25,000' },
      { id: 'li2', desc: 'High-Speed NVMe Cloud Hosting & 256-bit SSL Certificate', qty: '1 Year', rate: 'INCLUDED' },
      { id: 'li3', desc: 'Domain Name Registration (.com / .in)', qty: '1 Year', rate: 'INCLUDED' },
      { id: 'li4', desc: 'Dedicated Technical SLA & Security Maintenance', qty: 'Included', rate: 'INCLUDED' },
    ],

    // Timeline Phases
    timelinePhases: [
      { phase: 'PHASE 01', title: 'Discovery & Specification Sign-off', duration: 'Days 1 – 2', desc: 'Business requirement analysis, target audience profiling, and technical specification sign-off.' },
      { phase: 'PHASE 02', title: 'UI/UX Wireframing & Design Tokens', duration: 'Days 3 – 4', desc: 'Architecting modern interactive wireframes, typography tokens, and visual layout mockups.' },
      { phase: 'PHASE 03', title: 'Full-Stack Software Engineering', duration: 'Days 5 – 8', desc: 'Writing clean, optimized frontend and backend code, database schema, and REST APIs.' },
      { phase: 'PHASE 04', title: 'QA, Security & Performance Audit', duration: 'Days 9 – 10', desc: 'Comprehensive cross-browser testing, SSL security audit, and page speed optimization.' },
      { phase: 'PHASE 05', title: 'Staging Walkthrough & Client Approval', duration: 'Day 11', desc: 'Staging preview walkthrough with client team and incorporating final feedback adjustments.' },
      { phase: 'PHASE 06', title: 'Production Deployment & Handover', duration: 'Day 12+', desc: 'Deploying live on production cloud servers with SSL certificate and admin handover.' },
    ],

    // Legal Terms
    legalTerms: [
      { id: 'lt1', title: '1. Source Code Ownership & Intellectual Property', text: 'Upon final settlement of the grand total payment, complete source code ownership, intellectual property rights, and codebase copyright belong exclusively to the Client.' },
      { id: 'lt2', title: '2. Bug-Free Code Warranty & Technical Guarantee', text: 'Hindustan Projects IT Services provides a 100% bug-free code warranty. Any technical glitch or coding anomaly discovered post-delivery will be rectified at zero cost.' },
      { id: 'lt3', title: '3. Technical Support & SLA', text: 'Complimentary technical support covers bug fixes, server monitoring, and minor text adjustments for the designated package duration.' },
      { id: 'lt4', title: '4. Project Timelines & Client Responsibilities', text: 'Delivery timelines are contingent upon prompt client feedback and provision of necessary media assets (logos, content, credentials).' },
      { id: 'lt5', title: '5. Confidentiality & Non-Disclosure (NDA)', text: 'Both parties agree to treat all business data, customer lists, API keys, and technical documentation as strictly confidential.' },
      { id: 'lt6', title: '6. Limitation of Liability', text: 'Hindustan Projects IT Services is not liable for indirect or consequential damages arising from third-party server downtimes or API policy alterations.' },
    ],
  })

  // LocalStorage Persistence
  useEffect(() => {
    try {
      const stored = localStorage.getItem('HP_SAVED_PROPOSALS')
      if (stored) {
        setSavedProposals(JSON.parse(stored))
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const handleSaveProposal = () => {
    const newId = proposalData.id || `prop-${Date.now()}`
    const updatedProp = { ...proposalData, id: newId, savedAt: new Date().toISOString() }
    const updatedList = [updatedProp, ...savedProposals.filter((p) => p.id !== newId)]
    setSavedProposals(updatedList)
    localStorage.setItem('HP_SAVED_PROPOSALS', JSON.stringify(updatedList))
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

  const applyPreset = (presetType) => {
    if (presetType === 'website') {
      setProposalData((prev) => ({
        ...prev,
        projectName: 'High-Performance E-Commerce & Corporate Website Platform',
        lineItems: [
          { id: 'li1', desc: 'Custom Responsive Corporate Website Platform & Admin Dashboard', qty: '1 Package', rate: '49,999' },
          { id: 'li2', desc: '1 Year High-Speed NVMe Cloud Hosting & SSL Certificate', qty: '1 Year', rate: 'INCLUDED' },
          { id: 'li3', desc: 'Domain Name Registration (.com / .in)', qty: '1 Year', rate: 'INCLUDED' },
        ],
        discount: '5,000',
      }))
    } else if (presetType === 'mobile') {
      setProposalData((prev) => ({
        ...prev,
        projectName: 'Cross-Platform Android & iOS Mobile Application Ecosystem',
        lineItems: [
          { id: 'li1', desc: 'Android & iOS Cross-Platform Mobile Application Development', qty: '1 Package', rate: '89,999' },
          { id: 'li2', desc: 'Play Store & App Store Deployment Setup', qty: '2 Stores', rate: 'INCLUDED' },
          { id: 'li3', desc: 'Backend Cloud REST API & Database Setup', qty: '1 System', rate: 'INCLUDED' },
        ],
        discount: '10,000',
      }))
    } else if (presetType === 'software') {
      setProposalData((prev) => ({
        ...prev,
        projectName: 'Custom Enterprise ERP & GST Billing Software System',
        lineItems: [
          { id: 'li1', desc: 'Custom Enterprise ERP & Multi-User Billing System', qty: '1 System', rate: '1,25,000' },
          { id: 'li2', desc: 'Staff Role-Based Security & Database Architecture', qty: '1 Suite', rate: 'INCLUDED' },
          { id: 'li3', desc: '1 Year Server Deployment & Technical SLA', qty: '1 Year', rate: 'INCLUDED' },
        ],
        discount: '15,000',
      }))
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

  // Unified Design System Header (Pages 03 - 09)
  const renderHeader = (pageCode) => (
    <div className="border-b-2 border-[#0A2540] pb-2.5 mb-5 flex items-center justify-between relative z-10">
      <LogoEmblem isLarge={false} />

      <div className="text-right">
        <span className="font-mono text-[10px] font-black text-[#0A2540] bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300 block mb-0.5 shadow-xs">
          DOC CODE: {pageCode}
        </span>
        <span className="text-[9px] text-slate-500 font-extrabold block">
          QUOTATION REF: {proposalData.quotationNumber}
        </span>
      </div>
    </div>
  )

  // Unified Design System Footer (Pages 03 - 09)
  const renderFooter = (pageCode, pageNum) => (
    <div className="mt-auto pt-3 border-t border-slate-200 text-[9px] text-slate-500 flex items-center justify-between font-mono relative z-10">
      <div className="flex items-center gap-3">
        <span className="text-[8px] font-bold text-[#D32F2F] bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase">
          STRICTLY CONFIDENTIAL
        </span>
        <span>🌐 {proposalData.preparedByWebsite}</span>
        <span>📧 {proposalData.preparedByEmail}</span>
        <span>📞 {proposalData.preparedByPhone}</span>
      </div>
      <div className="font-black text-[#0A2540]">
        {pageCode} | Page {pageNum} of 09
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col print:bg-white print:text-black">
      <SEO title="Enterprise Proposal Book Studio — Admin" />

      {/* Print Specifications Standard CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-hidden {
            display: none !important;
          }
          .a4-page {
            width: 210mm !important;
            height: 296.8mm !important;
            max-height: 296.8mm !important;
            padding: 12mm 15mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            position: relative !important;
          }
          .a4-container {
            transform: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* ── TOP STUDIO NAVBAR ────────────────────────────────────────────── */}
      <header className="print-hidden bg-slate-950 border-b border-slate-800 px-4 py-3 sticky top-0 z-50 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Toggle Form Controls"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#D32F2F] text-white text-[9px] font-black uppercase tracking-wider">
                  Enterprise Proposal Book Studio
                </span>
                <h1 className="text-base font-black font-heading tracking-tight text-white">
                  9-Page Proposal &amp; Quotation Generator
                </h1>
              </div>
            </div>
          </div>

          {/* Zoom Controller */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Preview Scale:</span>
            <button
              type="button"
              onClick={() => setZoomScale(Math.max(0.4, zoomScale - 0.1))}
              className="p-1 text-slate-300 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs font-bold text-[#0A2540] bg-white px-2 py-0.5 rounded">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale(Math.min(1.2, zoomScale + 0.1))}
              className="p-1 text-slate-300 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(0.75)}
              className="text-[10px] text-slate-400 hover:text-white underline ml-1"
            >
              Reset
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {savedProposals.length > 0 && (
              <select
                value={selectedProposalId}
                onChange={(e) => handleLoadProposal(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="">📂 Load Saved Proposal...</option>
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
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Save className="w-3.5 h-3.5" />
              Save Proposal
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#07192c] text-white px-4 py-1.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save A4 PDF
            </button>
          </div>

        </div>
      </header>

      {/* ── DUAL-PANE WORKSPACE ────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT FORM DRAWER */}
        {sidebarOpen && (
          <aside className="print-hidden w-96 bg-slate-950 border-r border-slate-800 flex flex-col h-[calc(100vh-57px)] shrink-0 overflow-y-auto">
            <div className="grid grid-cols-4 border-b border-slate-800 text-[11px] font-bold text-center bg-slate-900/50 sticky top-0 z-10">
              {[
                { id: 'client', label: 'Client' },
                { id: 'scope', label: 'Scope' },
                { id: 'pricing', label: 'Pricing' },
                { id: 'presets', label: 'Presets' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveFormTab(t.id)}
                  className={`py-2.5 transition-colors ${
                    activeFormTab === t.id
                      ? 'bg-[#0A2540] text-white border-b-2 border-[#D32F2F]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-4 text-xs">
              {activeFormTab === 'client' && (
                <div className="space-y-3">
                  <h3 className="font-heading font-black text-slate-200 text-xs uppercase tracking-wider">
                    Client Profile &amp; Metadata
                  </h3>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Client Organization</label>
                    <input
                      type="text"
                      value={proposalData.clientCompany}
                      onChange={(e) => setProposalData({ ...proposalData, clientCompany: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={proposalData.contactPerson}
                      onChange={(e) => setProposalData({ ...proposalData, contactPerson: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Designation</label>
                    <input
                      type="text"
                      value={proposalData.clientDesignation}
                      onChange={(e) => setProposalData({ ...proposalData, clientDesignation: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Project Name</label>
                    <input
                      type="text"
                      value={proposalData.projectName}
                      onChange={(e) => setProposalData({ ...proposalData, projectName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Quotation No</label>
                      <input
                        type="text"
                        value={proposalData.quotationNumber}
                        onChange={(e) => setProposalData({ ...proposalData, quotationNumber: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Date</label>
                      <input
                        type="text"
                        value={proposalData.date}
                        onChange={(e) => setProposalData({ ...proposalData, date: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Valid Until</label>
                    <input
                      type="text"
                      value={proposalData.validTill}
                      onChange={(e) => setProposalData({ ...proposalData, validTill: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-red-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Email</label>
                    <input
                      type="text"
                      value={proposalData.clientEmail}
                      onChange={(e) => setProposalData({ ...proposalData, clientEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Phone</label>
                    <input
                      type="text"
                      value={proposalData.clientPhone}
                      onChange={(e) => setProposalData({ ...proposalData, clientPhone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Corporate Address</label>
                    <textarea
                      rows={2}
                      value={proposalData.clientAddress}
                      onChange={(e) => setProposalData({ ...proposalData, clientAddress: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              )}

              {activeFormTab === 'scope' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-emerald-400 text-xs">Included Deliverables</h4>
                    <button
                      type="button"
                      onClick={() => setProposalData({ ...proposalData, scopeIncluded: [...proposalData.scopeIncluded, 'New Deliverable Item'] })}
                      className="text-[10px] bg-emerald-600/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30"
                    >
                      + Add Item
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
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => setProposalData({ ...proposalData, scopeIncluded: proposalData.scopeIncluded.filter((_, i) => i !== idx) })}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeFormTab === 'pricing' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-blue-400 text-xs">Commercial Line Items</h4>
                    <button
                      type="button"
                      onClick={() =>
                        setProposalData({
                          ...proposalData,
                          lineItems: [...proposalData.lineItems, { id: `li-${Date.now()}`, desc: 'Custom Software Module', qty: '1 Package', rate: '25,000' }],
                        })
                      }
                      className="text-[10px] bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {proposalData.lineItems.map((item, idx) => (
                      <div key={item.id} className="p-2 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                        <input
                          type="text"
                          value={item.desc}
                          onChange={(e) => {
                            const updated = [...proposalData.lineItems]
                            updated[idx].desc = e.target.value
                            setProposalData({ ...proposalData, lineItems: updated })
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[11px]"
                          placeholder="Item Description"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={item.qty}
                            onChange={(e) => {
                              const updated = [...proposalData.lineItems]
                              updated[idx].qty = e.target.value
                              setProposalData({ ...proposalData, lineItems: updated })
                            }}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[11px] text-center"
                            placeholder="Qty"
                          />
                          <input
                            type="text"
                            value={item.rate}
                            onChange={(e) => {
                              const updated = [...proposalData.lineItems]
                              updated[idx].rate = e.target.value
                              setProposalData({ ...proposalData, lineItems: updated })
                            }}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[11px] text-right font-mono"
                            placeholder="Rate (₹)"
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
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">GST (%)</label>
                      <input
                        type="text"
                        value={proposalData.gstPercent}
                        onChange={(e) => setProposalData({ ...proposalData, gstPercent: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'presets' && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-200 text-xs mb-2">Package Presets</h4>
                  <button
                    type="button"
                    onClick={() => applyPreset('website')}
                    className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-bold flex items-center justify-between"
                  >
                    <span>🌐 Corporate Website Package</span>
                    <span className="text-emerald-400 font-mono">₹49,999</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('mobile')}
                    className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-bold flex items-center justify-between"
                  >
                    <span>📱 Android &amp; iOS App Suite</span>
                    <span className="text-emerald-400 font-mono">₹89,999</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('software')}
                    className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-bold flex items-center justify-between"
                  >
                    <span>&lt;/&gt; Enterprise ERP &amp; Billing</span>
                    <span className="text-emerald-400 font-mono">₹1,25,000</span>
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* RIGHT LIVE SCALABLE CANVAS VIEWPORT */}
        <main className="flex-1 bg-slate-900 p-6 overflow-auto flex justify-center items-start">
          <div
            className="a4-container transition-transform duration-200 origin-top space-y-12"
            style={{ transform: `scale(${zoomScale})` }}
          >
            
            {/* ─────────────────────────────────────────────────────────────────
                PAGE 01: OFFICIAL PROFESSIONAL QUOTATION COVER (ST-IT-001)
                ───────────────────────────────────────────────────────────────── */}
            <div className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] min-h-[296.8mm] border border-slate-200">
              
              <TechnicalWatermark />

              {/* Top Right Document Code Ribbon */}
              <div className="absolute top-0 right-0 bg-[#0A2540] text-white font-mono text-xs font-black px-6 py-2 rounded-bl-2xl shadow-md z-20">
                ST-IT-001
              </div>

              {/* Architectural City Skyline & Technical Vector Graphic Overlay */}
              <div className="absolute right-0 bottom-16 w-3/5 h-1/2 opacity-15 pointer-events-none z-0">
                <svg width="100%" height="100%" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 400V250H90V400M90 400V180H140V400M140 400V280H190V400M190 400V120H250V400M250 400V200H310V400M310 400V90H380V400M380 400V230H450V400" stroke="#0A2540" strokeWidth="1.5" strokeDasharray="3 3"/>
                  <rect x="220" y="260" width="180" height="110" rx="6" stroke="#0A2540" strokeWidth="2" fill="white"/>
                  <path d="M200 370H420" stroke="#0A2540" strokeWidth="4" strokeLinecap="round"/>
                  <text x="295" y="325" fill="#D32F2F" fontSize="24" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>
                  <circle cx="120" cy="150" r="3" fill="#D32F2F"/>
                  <circle cx="340" cy="70" r="3" fill="#0A2540"/>
                  <circle cx="430" cy="200" r="3" fill="#D32F2F"/>
                  <line x1="120" y1="150" x2="340" y2="70" stroke="#0A2540" strokeWidth="0.5" strokeDasharray="2 2"/>
                </svg>
              </div>

              <div className="relative z-10">
                {/* Top Official Company Header */}
                <div className="border-b-2 border-[#0A2540] pb-3 mb-4 flex items-center justify-between">
                  <LogoEmblem isLarge={true} />
                </div>

                {/* Main Title Block */}
                <div className="my-6">
                  <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tight leading-none text-[#0A2540]">
                    PROFESSIONAL
                  </h1>
                  <h1 className="font-heading font-black text-5xl sm:text-6xl tracking-tight leading-none text-[#D32F2F] mt-1">
                    QUOTATION
                  </h1>
                  <p className="text-xs font-bold text-[#0A2540] mt-3 tracking-wider uppercase border-l-4 border-[#0A2540] pl-3">
                    Web Development • Software Solutions • Mobile Apps
                  </p>
                </div>

                {/* Middle Section: Prepared For Box & Metadata Icons */}
                <div className="grid grid-cols-12 gap-5 my-6 items-start">
                  <div className="col-span-7 bg-[#F1F5F9] border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                      PREPARED FOR
                    </span>
                    <h3 className="font-heading font-black text-lg text-[#0A2540] border-b-2 border-[#D32F2F] pb-1 inline-block mb-3">
                      {proposalData.clientCompany}
                    </h3>

                    <div className="space-y-2 text-xs text-[#1E293B]">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#0A2540] shrink-0" />
                        <span className="font-bold w-24">Contact Person</span>
                        <span className="text-slate-400">:</span>
                        <span className="font-semibold text-slate-800 border-b border-slate-300 flex-1 pb-0.5">
                          {proposalData.contactPerson}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#0A2540] shrink-0" />
                        <span className="font-bold w-24">Designation</span>
                        <span className="text-slate-400">:</span>
                        <span className="font-semibold text-slate-800 border-b border-slate-300 flex-1 pb-0.5">
                          {proposalData.clientDesignation}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#0A2540] shrink-0" />
                        <span className="font-bold w-24">Email</span>
                        <span className="text-slate-400">:</span>
                        <span className="font-semibold text-slate-800 border-b border-slate-300 flex-1 pb-0.5">
                          {proposalData.clientEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#0A2540] shrink-0" />
                        <span className="font-bold w-24">Phone</span>
                        <span className="text-slate-400">:</span>
                        <span className="font-semibold text-slate-800 border-b border-slate-300 flex-1 pb-0.5">
                          {proposalData.clientPhone}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Globe className="w-3.5 h-3.5 text-[#0A2540] shrink-0 mt-0.5" />
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
                      <div className="w-9 h-9 rounded-lg bg-[#0A2540]/10 text-[#0A2540] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase block">
                          QUOTATION NO.
                        </span>
                        <span className="font-mono text-xs font-black text-[#0A2540]">
                          {proposalData.quotationNumber}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#0A2540]/10 text-[#0A2540] flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase block">
                          DATE
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {proposalData.date}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-50 text-[#D32F2F] flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase block">
                          VALID TILL
                        </span>
                        <span className="font-mono text-xs font-bold text-[#D32F2F]">
                          {proposalData.validTill}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prepared By Section */}
                <div className="my-6 pt-3 border-t border-slate-200 max-w-sm">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                    PREPARED BY
                  </span>
                  <h4 className="font-heading font-black text-xs text-[#0A2540]">
                    HINDUSTAN PROJECTS IT SERVICES
                  </h4>
                  <div className="space-y-0.5 text-[10px] text-slate-600 mt-1.5 font-medium">
                    <p className="flex items-center gap-2">🌐 {proposalData.preparedByWebsite}</p>
                    <p className="flex items-center gap-2">📧 {proposalData.preparedByEmail}</p>
                    <p className="flex items-center gap-2">📞 {proposalData.preparedByPhone}</p>
                    <p className="flex items-center gap-2">📍 Bhilwara, Rajasthan, India</p>
                  </div>
                </div>

                {/* Bottom 3 Service Badges */}
                <div className="grid grid-cols-3 gap-2 border-t-2 border-slate-200 pt-3">
                  <div className="p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#0A2540] text-white flex items-center justify-center text-[10px] shrink-0">
                      🖥️
                    </div>
                    <div>
                      <span className="font-heading font-black text-[10px] text-[#0A2540] uppercase block leading-tight">
                        WEBSITE
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold block">DEVELOPMENT</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#0A2540] text-white flex items-center justify-center text-[10px] shrink-0">
                      📱
                    </div>
                    <div>
                      <span className="font-heading font-black text-[10px] text-[#0A2540] uppercase block leading-tight">
                        MOBILE APP
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold block">DEVELOPMENT</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#0A2540] text-white flex items-center justify-center text-[10px] shrink-0">
                      &lt;/&gt;
                    </div>
                    <div>
                      <span className="font-heading font-black text-[10px] text-[#0A2540] uppercase block leading-tight">
                        SOFTWARE
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold block">SOLUTIONS</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Solid Footer Bar */}
              <div className="mt-4 bg-[#0A2540] text-white text-[9px] py-1.5 px-3 rounded-b-lg flex items-center justify-between font-mono relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-[#D32F2F] border-b-[6px] border-b-transparent" />
                  <span>snaptech.digital</span>
                </div>
                <div>ST-IT-001</div>
                <div>Page 01</div>
              </div>

            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 02: CLIENT INFORMATION & PROJECT OVERVIEW (ST-IT-002 Exact Graphic Artwork)
                ───────────────────────────────────────────────────────────────── */}
            <div className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] min-h-[296.8mm] border border-slate-200">
              <TechnicalWatermark />

              <div className="relative z-10">
                {/* Header matching image */}
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    {cfg.logo ? (
                      <img src={cfg.logo} alt="Company Logo" className="h-9 object-contain" />
                    ) : (
                      <div>
                        <div className="font-heading font-black text-xl text-[#0A2540] tracking-tight leading-none">
                          Hi<span className="text-[#D32F2F]">Pro</span>
                        </div>
                        <span className="text-[8px] font-bold text-[#0A2540] tracking-wider block mt-0.5">
                          HINDUSTAN PROJECTS
                        </span>
                        <span className="text-[7px] font-extrabold text-[#D32F2F] tracking-widest uppercase block">
                          — IT SERVICES —
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h2 className="font-heading font-black text-xl text-[#0A2540] tracking-tight">
                      HINDUSTAN PROJECTS
                    </h2>
                    <div className="flex items-center justify-center gap-2 mt-0.5">
                      <div className="w-12 h-[1px] bg-[#D32F2F]" />
                      <span className="text-xs font-black text-[#D32F2F] tracking-widest uppercase">
                        IT SERVICES
                      </span>
                      <div className="w-12 h-[1px] bg-[#D32F2F]" />
                    </div>
                  </div>

                  <div className="border-2 border-[#0A2540] px-3 py-1 rounded-lg">
                    <span className="font-mono text-sm font-black text-[#0A2540]">
                      ST-IT-002
                    </span>
                  </div>
                </div>

                {/* Red Accent Bar */}
                <div className="h-1 bg-[#D32F2F] my-3" />

                {/* Main Section Title */}
                <div className="mb-4">
                  <h1 className="font-heading font-black text-2xl text-[#0A2540] tracking-tight">
                    CLIENT INFORMATION
                  </h1>
                  <p className="text-xs font-semibold text-slate-500">
                    Please provide the following project details
                  </p>
                </div>

                {/* 2 Column Layout: Left Cards (Col-7) | Right Blueprint IT Grid (Col-5) */}
                <div className="grid grid-cols-12 gap-5 items-start">
                  
                  <div className="col-span-7 space-y-4">
                    
                    {/* CARD 01: CLIENT DETAILS */}
                    <div className="border-2 border-[#0A2540] rounded-xl relative pt-6 pb-3 px-4 bg-white">
                      <div className="absolute top-0 left-0 bg-[#0A2540] text-white px-4 py-1 rounded-br-xl font-heading font-black text-xs tracking-wider flex items-center gap-2">
                        <span className="bg-[#D32F2F] text-white px-1.5 py-0.2 rounded text-[10px]">01</span>
                        CLIENT DETAILS
                      </div>

                      <div className="space-y-2 text-xs font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-4">🏢</span>
                          <span className="font-bold w-36">Client Company Name :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            {proposalData.clientCompany}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4">👤</span>
                          <span className="font-bold w-36">Contact Person :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            {proposalData.contactPerson}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4">🪪</span>
                          <span className="font-bold w-36">Designation :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            {proposalData.clientDesignation}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4">📞</span>
                          <span className="font-bold w-36">Phone Number :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            {proposalData.clientPhone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4">✉️</span>
                          <span className="font-bold w-36">Email Address :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            {proposalData.clientEmail}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4">📍</span>
                          <span className="font-bold w-36">Company Address :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            {proposalData.clientAddress}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4">📜</span>
                          <span className="font-bold w-36">GST Number :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            08AAACH1234F1Z9
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD 02: PROJECT OVERVIEW */}
                    <div className="border-2 border-[#0A2540] rounded-xl relative pt-6 pb-3 px-4 bg-white">
                      <div className="absolute top-0 left-0 bg-[#0A2540] text-white px-4 py-1 rounded-br-xl font-heading font-black text-xs tracking-wider flex items-center gap-2">
                        <span className="bg-[#D32F2F] text-white px-1.5 py-0.2 rounded text-[10px]">02</span>
                        PROJECT OVERVIEW
                      </div>

                      <div className="space-y-2 text-xs font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-4">📁</span>
                          <span className="font-bold w-36">Project Name :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            {proposalData.projectName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4">⚙️</span>
                          <span className="font-bold w-36">Required Service :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            Full-Stack Web &amp; ERP Development
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4">📚</span>
                          <span className="font-bold w-36">Project Category :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            Enterprise Custom Software
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4">&lt;/&gt;</span>
                          <span className="font-bold w-36">Technology Stack :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            React.js, Node.js, PostgreSQL, Tailwind
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4">📅</span>
                          <span className="font-bold w-36">Expected Timeline :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            12 – 14 Business Days
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4">₹</span>
                          <span className="font-bold w-36">Estimated Budget :</span>
                          <span className="font-semibold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                            ₹{grandTotalNum.toLocaleString('en-IN')} (Inclusive of GST)
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-4">📝</span>
                            <span className="font-bold">Project Description :</span>
                          </div>
                          <div className="w-full border-2 border-slate-300 rounded-lg p-2.5 h-20 text-[11px] text-slate-700 bg-slate-50 leading-relaxed font-normal">
                            Development of a secure, cloud-hosted corporate software system with custom responsive web dashboard, automated PDF invoice generation, role-based access control, and 256-bit SSL encryption.
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Blueprint IT Network Vector */}
                  <div className="col-span-5 relative flex items-center justify-center p-2">
                    <svg viewBox="0 0 400 500" fill="none" className="w-full h-auto text-[#0A2540]">
                      <path d="M 0 50 H 400 M 0 150 H 400 M 0 250 H 400 M 0 350 H 400 M 0 450 H 400" stroke="#0A2540" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
                      <path d="M 50 0 V 500 M 150 0 V 500 M 250 0 V 500 M 350 0 V 500" stroke="#0A2540" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />

                      <g transform="translate(40, 190)">
                        <rect x="20" y="20" width="180" height="110" rx="8" stroke="#0A2540" strokeWidth="2.5" fill="white" />
                        <rect x="30" y="30" width="160" height="90" rx="4" stroke="#0A2540" strokeWidth="1" fill="#F8FAFC" />
                        <rect x="40" y="40" width="50" height="40" rx="2" fill="#0A2540" opacity="0.15" />
                        <line x1="100" y1="45" x2="175" y2="45" stroke="#0A2540" strokeWidth="2" strokeLinecap="round" />
                        <line x1="100" y1="55" x2="160" y2="55" stroke="#0A2540" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                        <line x1="40" y1="90" x2="175" y2="90" stroke="#0A2540" strokeWidth="1.5" strokeDasharray="2 2" />
                        <path d="M 0 135 H 220 L 205 148 H 15 Z" stroke="#0A2540" strokeWidth="2.5" fill="white" />
                        <rect x="90" y="137" width="40" height="4" rx="2" fill="#0A2540" />
                      </g>

                      <g transform="translate(250, 30)">
                        <rect x="0" y="0" width="75" height="45" rx="5" stroke="#0A2540" strokeWidth="2" fill="white" />
                        <circle cx="15" cy="15" r="3" fill="#0A2540" />
                        <circle cx="15" cy="30" r="3" fill="#D32F2F" />
                        <line x1="30" y1="15" x2="60" y2="15" stroke="#0A2540" strokeWidth="2" strokeLinecap="round" />
                        <line x1="30" y1="30" x2="55" y2="30" stroke="#0A2540" strokeWidth="2" strokeLinecap="round" />
                        <text x="37" y="60" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0A2540" fontFamily="sans-serif">SERVER</text>
                      </g>

                      <g transform="translate(320, 100)">
                        <path d="M 10 25 A 15 15 0 0 1 35 15 A 20 20 0 0 1 65 20 A 15 15 0 0 1 70 35 H 10 Z" stroke="#0A2540" strokeWidth="2" fill="white" />
                        <text x="40" y="48" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0A2540" fontFamily="sans-serif">CLOUD</text>
                      </g>

                      <g transform="translate(290, 180)">
                        <circle cx="25" cy="25" r="20" stroke="#0A2540" strokeWidth="2" fill="white" />
                        <text x="25" y="28" textAnchor="middle" fontSize="9" fontWeight="extrabold" fill="#0A2540" fontFamily="sans-serif">API</text>
                        <text x="25" y="58" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0A2540" fontFamily="sans-serif">API</text>
                      </g>

                      <g transform="translate(330, 250)">
                        <ellipse cx="25" cy="10" rx="20" ry="8" stroke="#0A2540" strokeWidth="2" fill="white" />
                        <path d="M 5 10 V 30 A 20 8 0 0 0 45 30 V 10" stroke="#0A2540" strokeWidth="2" fill="none" />
                        <path d="M 5 20 A 20 8 0 0 0 45 20" stroke="#0A2540" strokeWidth="1.5" fill="none" />
                        <text x="25" y="48" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0A2540" fontFamily="sans-serif">DATABASE</text>
                      </g>

                      <g transform="translate(320, 330)">
                        <rect x="0" y="0" width="55" height="40" rx="4" stroke="#0A2540" strokeWidth="2" fill="white" />
                        <line x1="0" y1="12" x2="55" y2="12" stroke="#0A2540" strokeWidth="1.5" />
                        <circle cx="6" cy="6" r="1.5" fill="#D32F2F" />
                        <circle cx="12" cy="6" r="1.5" fill="#0A2540" />
                        <text x="27" y="54" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0A2540" fontFamily="sans-serif">WEBSITE</text>
                      </g>

                      <g transform="translate(335, 410)">
                        <rect x="0" y="0" width="30" height="55" rx="5" stroke="#0A2540" strokeWidth="2" fill="white" />
                        <circle cx="15" cy="48" r="3" stroke="#0A2540" strokeWidth="1" />
                        <text x="15" y="68" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0A2540" fontFamily="sans-serif">MOBILE APP</text>
                      </g>

                      <g transform="translate(230, 410)">
                        <rect x="0" y="0" width="55" height="40" rx="4" stroke="#0A2540" strokeWidth="2" fill="white" />
                        <rect x="5" y="5" width="20" height="12" fill="#0A2540" opacity="0.2" />
                        <rect x="30" y="5" width="20" height="12" fill="#0A2540" opacity="0.2" />
                        <text x="27" y="54" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0A2540" fontFamily="sans-serif">UI/UX</text>
                      </g>

                      <path d="M 285 75 V 190 H 220" stroke="#0A2540" strokeWidth="1.5" strokeDasharray="3 3" />
                      <path d="M 320 120 H 220" stroke="#0A2540" strokeWidth="1.5" strokeDasharray="3 3" />
                      <path d="M 330 280 H 220" stroke="#0A2540" strokeWidth="1.5" strokeDasharray="3 3" />
                      <path d="M 320 350 H 220" stroke="#0A2540" strokeWidth="1.5" strokeDasharray="3 3" />
                      <path d="M 335 430 H 220" stroke="#0A2540" strokeWidth="1.5" strokeDasharray="3 3" />
                      <path d="M 260 410 V 330 H 220" stroke="#0A2540" strokeWidth="1.5" strokeDasharray="3 3" />
                    </svg>
                  </div>

                </div>

                {/* Bottom Quotation Prepared By Box */}
                <div className="mt-4 p-3 rounded-xl border-2 border-[#0A2540] bg-slate-50">
                  <div className="grid grid-cols-4 gap-3 items-center text-xs">
                    
                    <div className="flex items-center gap-2 border-r border-slate-300 pr-2">
                      <div className="w-8 h-8 rounded-full bg-[#0A2540] text-white flex items-center justify-center shrink-0 text-xs">
                        📝
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block leading-tight">
                          Quotation Prepared By
                        </span>
                        <span className="font-heading font-black text-slate-900 text-[10.5px]">
                          SnapTech Digital Solutions
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-r border-slate-300 pr-2">
                      <div className="w-7 h-7 rounded-full bg-[#0A2540]/10 text-[#0A2540] flex items-center justify-center shrink-0">
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
                      <div className="w-7 h-7 rounded-full bg-[#0A2540]/10 text-[#0A2540] flex items-center justify-center shrink-0">
                        ✉️
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block leading-tight">Email</span>
                        <span className="font-mono text-[10px] font-bold text-slate-800">
                          {proposalData.preparedByEmail}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0A2540]/10 text-[#0A2540] flex items-center justify-center shrink-0">
                        📞
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block leading-tight">Phone</span>
                        <span className="font-mono text-[10px] font-bold text-slate-800">
                          {proposalData.preparedByPhone}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Bottom Solid Footer Strip */}
              <div className="mt-3 border-t-2 border-[#D32F2F] pt-2">
                <div className="bg-[#0A2540] text-white text-[9px] py-1.5 px-4 rounded-lg flex items-center justify-between font-mono relative z-10">
                  <div className="flex items-center gap-2">
                    <span>🌐 {proposalData.preparedByWebsite}</span>
                  </div>
                  <div className="bg-[#D32F2F] text-white px-3 py-0.5 rounded font-black text-[10px]">
                    ST-IT-002
                  </div>
                  <div>Page 02 |</div>
                </div>
              </div>

            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 03: SCOPE OF WORK
                ───────────────────────────────────────────────────────────────── */}
            <div className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] min-h-[296.8mm] border border-slate-200">
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-003')}

                <h2 className="font-heading text-xl font-black text-[#0A2540] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#D32F2F]" />
                  02. Detailed Scope of Work
                </h2>

                <div className="mb-5">
                  <h3 className="font-heading text-xs font-extrabold text-[#0A2540] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Deliverables Included In Scope ({proposalData.scopeIncluded.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#1E293B]">
                    {proposalData.scopeIncluded.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-semibold text-[11px] leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-xs font-extrabold text-[#D32F2F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-[#D32F2F]" />
                    Items Excluded / Out of Scope ({proposalData.scopeExcluded.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#1E293B]">
                    {proposalData.scopeExcluded.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-red-50/50 border border-red-200 flex items-start gap-2">
                        <XCircle className="w-3.5 h-3.5 text-[#D32F2F] shrink-0 mt-0.5" />
                        <span className="font-semibold text-[11px] leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {renderFooter('ST-IT-003', '03')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 04: FEATURES INCLUDED
                ───────────────────────────────────────────────────────────────── */}
            <div className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] min-h-[296.8mm] border border-slate-200">
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-004')}

                <h2 className="font-heading text-xl font-black text-[#0A2540] mb-5 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#D32F2F]" />
                  03. Technical Features &amp; Architecture
                </h2>

                <div className="grid grid-cols-2 gap-3.5 text-xs text-[#1E293B]">
                  {[
                    { title: '100% Mobile Responsive', desc: 'Flawless responsive grid across smartphones, tablets, and desktop computers.', icon: Smartphone },
                    { title: 'Google SEO Ready', desc: 'On-Page SEO, Google Search Console indexing, meta tags, and structured data.', icon: Search },
                    { title: 'Enterprise Security', desc: '256-bit SSL encryption, input sanitization, and secure authentication.', icon: Lock },
                    { title: 'Admin Control Panel', desc: 'User-friendly admin dashboard to manage leads, content, and site media.', icon: Building2 },
                    { title: 'REST API Architecture', desc: 'Fast, secure, scalable RESTful API endpoints for seamless data integration.', icon: Code },
                    { title: 'Database Optimization', desc: 'Optimized relational schema design ensuring instant query response.', icon: Database },
                    { title: 'NVMe Cloud Hosting', desc: 'High-speed cloud server setup with 99.9% uptime reliability guarantee.', icon: Server },
                    { title: 'Technical Support', desc: 'Dedicated technical assistance and maintenance documentation post-launch.', icon: Shield },
                  ].map((feat, idx) => {
                    const IconC = feat.icon
                    return (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0A2540] text-white flex items-center justify-center shrink-0">
                          <IconC className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h3 className="font-heading font-black text-xs text-[#0A2540] mb-0.5">{feat.title}</h3>
                          <p className="text-slate-600 text-[10px] leading-relaxed">{feat.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {renderFooter('ST-IT-004', '04')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 05: DEVELOPMENT TIMELINE
                ───────────────────────────────────────────────────────────────── */}
            <div className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] min-h-[296.8mm] border border-slate-200">
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-005')}

                <h2 className="font-heading text-xl font-black text-[#0A2540] mb-5 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#D32F2F]" />
                  04. Project Delivery Timeline
                </h2>

                <div className="space-y-3 text-xs text-[#1E293B]">
                  {proposalData.timelinePhases.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                      <div className="px-2.5 py-0.5 rounded bg-[#0A2540] text-white font-mono font-bold text-[10px] shrink-0">
                        {item.phase}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-heading font-black text-xs text-[#0A2540]">{item.title}</h3>
                          <span className="font-mono text-[10px] font-bold text-[#D32F2F] bg-red-50 px-2 py-0.5 rounded border border-red-100">{item.duration}</span>
                        </div>
                        <p className="text-slate-600 text-[10px] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {renderFooter('ST-IT-005', '05')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 06: COMMERCIAL PROPOSAL TABLE
                ───────────────────────────────────────────────────────────────── */}
            <div className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] min-h-[296.8mm] border border-slate-200">
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-006')}

                <h2 className="font-heading text-xl font-black text-[#0A2540] mb-5 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#D32F2F]" />
                  05. Commercial Proposal &amp; Investment Breakdown
                </h2>

                <table className="w-full text-xs text-[#1E293B] border border-slate-200 rounded-lg overflow-hidden mb-5">
                  <thead>
                    <tr className="bg-[#0A2540] text-white font-heading text-xs">
                      <th className="p-2.5 text-left w-10">#</th>
                      <th className="p-2.5 text-left">Description / Component</th>
                      <th className="p-2.5 text-center w-24">Qty</th>
                      <th className="p-2.5 text-right w-32">Amount ({proposalData.currency})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposalData.lineItems.map((item, idx) => (
                      <tr key={item.id || idx} className={`border-b border-slate-200 ${idx % 2 === 1 ? 'bg-slate-50' : ''}`}>
                        <td className="p-2.5 font-bold">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="p-2.5 font-bold text-[#0A2540]">{item.desc}</td>
                        <td className="p-2.5 text-center font-semibold">{item.qty}</td>
                        <td className={`p-2.5 text-right font-bold ${item.rate === 'INCLUDED' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {item.rate === 'INCLUDED' ? 'INCLUDED' : `₹${item.rate}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mb-5">
                  <div className="w-64 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal Amount:</span>
                      <span className="font-bold text-slate-900">₹{subtotalNum.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount Applied:</span>
                      <span>- ₹{discountNum.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-1.5 border-t border-slate-200">
                      <span>Taxable Amount:</span>
                      <span className="font-bold text-slate-900">₹{taxableNum.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST ({proposalData.gstPercent}%):</span>
                      <span className="font-bold text-slate-900">₹{gstNum.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#0A2540] pt-1.5 border-t-2 border-[#0A2540]">
                      <span>Grand Total:</span>
                      <span>₹{grandTotalNum.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A2540]/5 border border-[#0A2540]/20 text-xs">
                  <h4 className="font-heading font-black text-[#0A2540] uppercase mb-1">Commercial Payment Terms</h4>
                  <p className="text-slate-700 leading-relaxed font-semibold text-[11px]">{proposalData.paymentTerms}</p>
                </div>
              </div>

              {renderFooter('ST-IT-006', '06')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 07: TERMS & CONDITIONS
                ───────────────────────────────────────────────────────────────── */}
            <div className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] min-h-[296.8mm] border border-slate-200">
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-007')}

                <h2 className="font-heading text-xl font-black text-[#0A2540] mb-5 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#D32F2F]" />
                  06. Legal Terms &amp; Conditions
                </h2>

                <div className="space-y-3.5 text-xs text-[#1E293B]">
                  {proposalData.legalTerms.map((clause, idx) => (
                    <div key={clause.id || idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <h3 className="font-heading font-extrabold text-[#0A2540] text-[11px] mb-0.5">{clause.title}</h3>
                      <p className="text-slate-600 text-[10px] leading-relaxed">{clause.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {renderFooter('ST-IT-007', '07')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 08: ACCEPTANCE & SIGNATURES
                ───────────────────────────────────────────────────────────────── */}
            <div className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] min-h-[296.8mm] border border-slate-200">
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-008')}

                <h2 className="font-heading text-xl font-black text-[#0A2540] mb-5 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#D32F2F]" />
                  07. Proposal Acceptance &amp; Signatures
                </h2>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#1E293B] mb-8">
                  <p className="leading-relaxed font-semibold text-[11px]">
                    By signing below, the Client confirms acceptance of the scope of work, technical specifications, commercial quotation, and legal terms outlined in Document Code <strong>ST-IT-001 through ST-IT-009</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 text-xs text-[#1E293B] mt-6">
                  <div className="p-5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col justify-between h-56">
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                        CLIENT AUTHORIZED SIGNATORY
                      </span>
                      <h3 className="font-heading font-black text-xs text-[#0A2540]">{proposalData.clientCompany}</h3>
                    </div>

                    <div className="border-t border-slate-300 pt-2">
                      <p className="font-bold text-[11px]">Authorized Signature &amp; Stamp</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Name: {proposalData.contactPerson}</p>
                      <p className="text-slate-500 text-[10px]">Designation: {proposalData.clientDesignation}</p>
                      <p className="text-slate-500 text-[10px]">Date: ____________________</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border-2 border-[#0A2540] bg-[#0A2540]/5 flex flex-col justify-between h-56">
                    <div>
                      <span className="text-[9px] font-extrabold text-[#0A2540] uppercase tracking-wider block mb-1">
                        VENDOR AUTHORIZED SIGNATORY
                      </span>
                      <h3 className="font-heading font-black text-xs text-[#0A2540]">Hindustan Projects IT Services</h3>
                    </div>

                    <div className="my-auto self-center">
                      <div className="w-16 h-16 rounded-full border-2 border-[#0A2540] border-dashed flex items-center justify-center text-[#0A2540] font-mono text-[8px] font-black text-center p-1 uppercase">
                        OFFICIAL SEAL &amp; STAMP
                      </div>
                    </div>

                    <div className="border-t border-[#0A2540]/30 pt-2">
                      <p className="font-bold text-[#0A2540] text-[11px]">Authorized Signatory</p>
                      <p className="text-slate-600 text-[10px] mt-0.5">Designation: Managing Director</p>
                      <p className="text-slate-600 text-[10px]">Date: {proposalData.date}</p>
                    </div>
                  </div>
                </div>
              </div>

              {renderFooter('ST-IT-008', '08')}
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                PAGE 09: THANK YOU & CLOSING
                ───────────────────────────────────────────────────────────────── */}
            <div className="a4-page bg-white text-[#1E293B] shadow-2xl rounded-sm p-8 flex flex-col justify-between relative overflow-hidden w-[210mm] min-h-[296.8mm] border border-slate-200">
              <TechnicalWatermark />
              <div>
                {renderHeader('ST-IT-009')}

                <div className="text-center my-10 max-w-xl mx-auto">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#0A2540]/10 text-[#0A2540] font-mono text-xs font-bold uppercase tracking-widest mb-3">
                    THANK YOU FOR YOUR TRUST
                  </span>
                  <h2 className="font-heading text-3xl font-black text-[#0A2540] tracking-tight">
                    We Look Forward to Building Your Digital Success
                  </h2>
                  <p className="text-slate-600 text-xs mt-3 leading-relaxed">
                    SnapTech Digital Solutions is committed to delivering excellence, innovation, and long-term value for your business.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0A2540] text-white my-6 max-w-xl mx-auto shadow-xl">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-2 space-y-2 text-xs">
                      <h3 className="font-heading font-black text-base text-white mb-1">SnapTech Digital Solutions</h3>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                        <span>{proposalData.preparedByWebsite}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                        <span>{proposalData.preparedByEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                        <span>{proposalData.preparedByPhone}</span>
                      </div>
                    </div>

                    <div className="text-center bg-white p-2.5 rounded-xl text-slate-900">
                      <div className="w-20 h-20 mx-auto bg-slate-100 border border-slate-300 rounded flex items-center justify-center">
                        <QrCode className="w-14 h-14 text-[#0A2540]" />
                      </div>
                      <span className="text-[8px] font-extrabold uppercase block mt-1 text-[#0A2540]">
                        SCAN TO VERIFY
                      </span>
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

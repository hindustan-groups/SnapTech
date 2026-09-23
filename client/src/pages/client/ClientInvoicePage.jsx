/**
 * ClientInvoicePage.jsx — Beautiful, print-friendly digital payment receipt & invoice
 */
import { useParams, Link } from 'react-router-dom'
import { Printer, ArrowLeft, CheckCircle, FileText, Globe, Mail, Phone, MapPin } from 'lucide-react'
import { useClientInvoice } from '@/hooks/useClientPortal'

export default function ClientInvoicePage() {
  const { milestoneId } = useParams()
  const { data: response, isLoading, error } = useClientInvoice(milestoneId)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24 print:hidden">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !response?.data) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-[#03091e] border border-red-500/30 rounded-2xl text-center print:hidden">
        <h4 className="text-red-400 font-bold font-heading">Error Loading Invoice</h4>
        <p className="text-xs text-slate-400 mt-2">Could not load the invoice details. Please verify your credentials or contact support.</p>
        <Link to="/client/billing" className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-cyan-400 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Billing</span>
        </Link>
      </div>
    )
  }

  const milestone = response.data
  const project = milestone.clientProject
  const client = project?.client

  const invoiceNumber = `INV-${milestone.id.slice(-6).toUpperCase()}`
  const formattedPaidDate = milestone.paidAt
    ? new Date(milestone.paidAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A'

  const formattedDueDate = milestone.dueDate
    ? new Date(milestone.dueDate).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A'

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-3xl mx-auto my-4 md:my-8 px-4 print:my-0 print:px-0">
      {/* Action Bar (Hidden during print) */}
      <div className="flex items-center justify-between mb-6 bg-[#03091e]/90 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-xl print:hidden">
        <Link
          to="/client/billing"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Billing</span>
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl text-xs shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer transition-all hover:scale-[1.02]"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Actual Invoice Sheet */}
      <div className="bg-[#03091e]/95 border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl backdrop-blur-xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-white/10 print:border-gray-200">
          <div>
            <div className="flex items-baseline">
              <span className="text-3xl font-black text-cyan-400 print:text-blue-700 tracking-tight font-heading">Snap</span>
              <span className="text-3xl font-black text-blue-500 print:text-blue-600 tracking-tight font-heading">tech</span>
            </div>
            <div className="text-[10px] font-bold text-cyan-400/80 print:text-blue-700 tracking-[0.2em] uppercase mt-0.5">
              SnapTech Digital &bull; A Hindustan Projects Enterprise
            </div>
            <div className="text-[8px] text-slate-400 print:text-gray-500 font-medium tracking-wide mt-1">
              Software Engineering &bull; Cloud Infrastructure &bull; AI Solutions
            </div>
          </div>
          
          <div className="text-left sm:text-right text-[11px] text-slate-400 print:text-gray-600 space-y-1">
            <div className="flex items-center sm:justify-end gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-cyan-400 print:text-gray-400" />
              <span>www.snaptech.digital</span>
            </div>
            <div className="flex items-center sm:justify-end gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-cyan-400 print:text-gray-400" />
              <span>+91 75970 00601</span>
            </div>
            <div className="flex items-center sm:justify-end gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 print:text-gray-400" />
              <span>Bhilwara &ndash; 311001, Rajasthan, India</span>
            </div>
          </div>
        </div>

        {/* Invoice Summary Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-white/10 print:border-gray-200">
          <div>
            <h3 className="text-xs font-bold text-slate-400 print:text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-white print:text-gray-900">{client?.name || 'Valued Client'}</p>
              {client?.email && (
                <p className="text-slate-400 print:text-gray-600 flex items-center gap-1.5 text-xs">
                  <Mail className="w-3.5 h-3.5 text-slate-500 print:text-gray-400" />
                  <span>{client.email}</span>
                </p>
              )}
              <p className="text-xs text-slate-400 print:text-gray-500 mt-2 font-medium">Project Name:</p>
              <p className="font-semibold text-cyan-400 print:text-gray-800 text-xs">{project?.projectTitle || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-3 sm:text-right">
            <div>
              <p className="text-xs font-bold text-slate-400 print:text-gray-500 uppercase tracking-wider">Invoice / Receipt No</p>
              <p className="text-lg font-extrabold text-white print:text-gray-900 mt-0.5 tracking-tight">{invoiceNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:justify-items-end text-xs">
              <div>
                <p className="font-bold text-slate-400 print:text-gray-500 uppercase tracking-wide">Paid On</p>
                <p className="font-semibold text-white print:text-gray-800 mt-0.5">{formattedPaidDate}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 print:text-gray-500 uppercase tracking-wide">Due Date</p>
                <p className="font-semibold text-white print:text-gray-800 mt-0.5">{formattedDueDate}</p>
              </div>
            </div>
            <div className="pt-2 sm:flex sm:justify-end">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 print:bg-emerald-50 text-emerald-400 print:text-emerald-700 border border-emerald-500/30 print:border-emerald-200 rounded-full text-[11px] font-bold shadow-sm">
                <CheckCircle className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-400 print:text-emerald-600" />
                <span>PAID RECEIPT</span>
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-white/10 print:border-gray-200 text-left text-xs font-bold text-slate-400 print:text-gray-500 uppercase tracking-wider">
                <th className="pb-3 text-left">Description / Particulars</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-gray-100">
              <tr>
                <td className="py-5 text-left align-top">
                  <div className="font-bold text-white print:text-gray-900 text-sm">{milestone.title}</div>
                  <div className="text-xs text-slate-400 print:text-gray-500 mt-1 max-w-md font-medium">
                    Deliverables Unlocked: {milestone.deliverables || 'Project milestone documentation, files, and deliverables.'}
                  </div>
                </td>
                <td className="py-5 text-right align-top font-bold text-white print:text-gray-900 text-sm">
                  ₹{milestone.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="border-t-2 border-white/10 print:border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="text-xs text-slate-400 print:text-gray-600 space-y-1">
            <p className="font-bold text-white print:text-gray-700">Tax & Billing Information:</p>
            <p>GSTIN / Corporate Tax ID: <span className="font-mono text-cyan-400 print:text-gray-800 font-semibold">08AAACH9929P1Z5</span></p>
            <p>Payment Method: Online Direct Transfer / Digital Milestone Gateway</p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 print:bg-blue-50 text-cyan-300 print:text-blue-700 border border-cyan-500/20 print:border-blue-100 rounded-lg text-[10px] font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 print:text-blue-700" />
                <span>Verified Hindustan Projects Digital Receipt</span>
              </span>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between font-medium text-slate-400 print:text-gray-500">
              <span>Base Subtotal</span>
              <span className="text-white print:text-black">₹{(milestone.amount / 1.18).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-400 print:text-gray-500">
              <span>CGST (9%)</span>
              <span className="text-white print:text-black">₹{((milestone.amount / 1.18) * 0.09).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-400 print:text-gray-500">
              <span>SGST (9%)</span>
              <span className="text-white print:text-black">₹{((milestone.amount / 1.18) * 0.09).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-white/10 print:border-gray-200 pt-3">
              <span className="text-sm font-bold text-white print:text-gray-900">Total Amount Paid</span>
              <span className="text-lg font-black text-cyan-400 print:text-blue-700">
                ₹{milestone.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="mt-12 pt-6 border-t border-white/10 print:border-gray-200 text-center space-y-2">
          <p className="text-xs text-slate-400 print:text-gray-500 font-medium">
            Thank you for partnering with Hindustan Projects. We look forward to working with you again.
          </p>
          <div className="flex justify-center items-center gap-1.5 text-[10px] text-slate-500 print:text-gray-400 font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Computer Generated GST Tax Invoice & Receipt</span>
          </div>
        </div>

      </div>
    </div>
  )
}

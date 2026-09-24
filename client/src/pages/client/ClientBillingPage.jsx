/**
 * ClientBillingPage.jsx — Client Portal Billing & Financial Milestones Page
 */
import { Link } from 'react-router-dom'
import { useClientBilling, useClientPayMilestone } from '@/hooks/useClientPortal'
import { Landmark, Calendar, CheckCircle2, AlertCircle, FileText, TrendingUp, CreditCard } from 'lucide-react'

const MILESTONE_STATUS = {
  PAID: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
  },
  PENDING: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: Calendar,
    iconColor: 'text-amber-400',
  },
  OVERDUE: {
    badge: 'bg-red-500/10 text-red-400 border-red-500/30',
    icon: AlertCircle,
    iconColor: 'text-red-400',
  },
}

export default function ClientBillingPage() {
  const { data: milestones = [], isLoading } = useClientBilling()
  const payMutation = useClientPayMilestone()

  const handlePay = async (id) => {
    if (window.confirm('Simulate milestone payment check? This will immediately mark the milestone as PAID.')) {
      try {
        await payMutation.mutateAsync(id)
      } catch {
        // Handled by payMutation error state
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Calculate totals
  const totalBudget = milestones.reduce((sum, m) => sum + m.amount, 0)
  const paidAmount = milestones.filter((m) => m.status === 'PAID').reduce((sum, m) => sum + m.amount, 0)
  const pendingAmount = totalBudget - paidAmount
  const paidPct = totalBudget > 0 ? Math.round((paidAmount / totalBudget) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Billing & Payments</h2>
        <p className="text-sm text-slate-400">View project contract value, milestones progress, and invoice receipts.</p>
      </div>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Budget */}
        <div className="bg-[#03091e]/90 border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Landmark className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Project Budget</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-0.5">
              ₹{totalBudget.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-[#03091e]/90 border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Paid Amount</p>
            <h3 className="text-xl md:text-2xl font-bold text-emerald-400 mt-0.5">
              ₹{paidAmount.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-[#03091e]/90 border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Balance</p>
            <h3 className="text-xl md:text-2xl font-bold text-amber-400 mt-0.5">
              ₹{pendingAmount.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-[#03091e]/90 border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Milestone Funding Progress</span>
          </span>
          <span className="font-bold text-cyan-400">{paidPct}% Funded</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-linear-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all duration-500"
            style={{ width: `${paidPct}%` }}
          />
        </div>
      </div>

      {/* Milestones Registry Table/Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white font-heading">Contractual Milestones</h3>

        {milestones.length === 0 ? (
          <div className="bg-[#03091e]/90 border border-dashed border-white/10 rounded-2xl py-12 text-center">
            <Landmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No payment milestones registered for your projects.</p>
            <p className="text-xs text-slate-400 mt-1">Please contact billing support if this is incorrect.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {milestones.map((m) => {
              const statusCfg = MILESTONE_STATUS[m.status] || MILESTONE_STATUS.PENDING
              const Icon = statusCfg.icon
              const formattedDate = m.dueDate
                ? new Date(m.dueDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'N/A'

              return (
                <div
                  key={m.id}
                  className="bg-[#03091e]/90 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-cyan-500/30 backdrop-blur-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 shrink-0 ${statusCfg.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                        {m.clientProject?.projectTitle || 'Linked Project'}
                      </h4>
                      <h3 className="text-sm font-bold text-white truncate">{m.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due: {formattedDate}</span>
                        </span>
                        {m.paidAt && (
                          <span className="text-emerald-400 font-medium">
                            Paid: {new Date(m.paidAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Render Deliverables Lock/Unlock status */}
                      {m.deliverables && Array.isArray(m.deliverables) && m.deliverables.length > 0 && (
                        <div className="mt-3 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                            {m.status === 'PAID' ? (
                              <>
                                <span className="text-emerald-400">🔓</span>
                                <span className="text-emerald-300">Unlocked Deliverables</span>
                              </>
                            ) : (
                              <>
                                <span className="text-amber-400">🔒</span>
                                <span className="text-amber-300">Locked Deliverables (Requires Payment)</span>
                              </>
                            )}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {m.deliverables.map((del, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded text-[10px] font-semibold border flex items-center gap-1.5 transition-all ${
                                  m.status === 'PAID'
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                                    : 'bg-white/5 text-slate-500 border-white/10 select-none opacity-70'
                                }`}
                              >
                                <span>📦</span>
                                <span>{del}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Amount Due</p>
                      <h3 className="text-base font-bold text-white">
                        ₹{m.amount.toLocaleString('en-IN')}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded border uppercase tracking-wider shrink-0 ${statusCfg.badge}`}>
                        {m.status}
                      </span>

                      {m.status === 'PAID' && m.invoiceUrl ? (
                        <Link
                          to={m.invoiceUrl}
                          className="w-11 h-11 flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl border border-emerald-500/30 transition-all cursor-pointer shrink-0"
                          title="View Invoice Receipt"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      ) : m.status !== 'PAID' ? (
                        <button
                          onClick={() => handlePay(m.id)}
                          disabled={payMutation.isPending}
                          className="px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 transition-all cursor-pointer shrink-0"
                        >
                          Simulate Pay
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

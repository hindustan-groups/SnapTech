/**
 * ConfirmModal — Universal Modern Confirmation & Delete Action Dialog
 * Replaces ugly browser native window.confirm() dialogs with a high-end,
 * accessible modal featuring dark glassmorphism backdrops, glowing status rings,
 * and responsive action controls.
 */
import { useEffect } from 'react'
import { Trash2, AlertTriangle, ShieldAlert, Info, X, RefreshCw } from 'lucide-react'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  itemTitle,
  isLoading = false,
}) {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  // Icon & Style configuration by variant
  const isDanger = variant === 'danger'
  const isWarning = variant === 'warning'

  const IconComponent = isDanger ? Trash2 : isWarning ? ShieldAlert : Info

  const iconBg = isDanger
    ? 'bg-rose-50 text-rose-600 border-rose-200 ring-4 ring-rose-50/50'
    : isWarning
      ? 'bg-amber-50 text-amber-600 border-amber-200 ring-4 ring-amber-50/50'
      : 'bg-blue-50 text-brand-blue border-blue-200 ring-4 ring-blue-50/50'

  const buttonStyle = isDanger
    ? 'bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-red-500/20'
    : isWarning
      ? 'bg-linear-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-md shadow-amber-500/20'
      : 'bg-brand-blue hover:bg-brand-blue-hover text-white shadow-md'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={() => !isLoading && onClose()} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md bg-white border border-gray-200/90 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner ${iconBg}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="space-y-1 pr-4">
            <h3 className="font-heading text-lg font-extrabold text-gray-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              {message}
            </p>
          </div>
        </div>

        {/* Optional Item Title Highlight Pill */}
        {itemTitle && (
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Item</span>
              <span className="text-xs font-mono font-bold text-gray-900 truncate block">{itemTitle}</span>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60 ${buttonStyle}`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}

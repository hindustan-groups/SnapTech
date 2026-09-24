import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Portal Container */}
      <div className="fixed top-5 right-5 z-9999 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map((t) => {
          let bg = 'bg-white border-gray-200 text-gray-800'
          let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />

          if (t.type === 'success') {
            bg = 'bg-emerald-950/90 text-white border-emerald-800 backdrop-blur-md shadow-xl'
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          } else if (t.type === 'error') {
            bg = 'bg-rose-950/90 text-white border-rose-800 backdrop-blur-md shadow-xl'
            icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          } else if (t.type === 'warning') {
            bg = 'bg-amber-950/90 text-white border-amber-800 backdrop-blur-md shadow-xl'
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          } else if (t.type === 'info') {
            bg = 'bg-blue-950/90 text-white border-blue-800 backdrop-blur-md shadow-xl'
            icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border ${bg} shadow-2xl transition-all duration-300 animate-slide-in`}
            >
              {icon}
              <p className="text-xs font-semibold leading-relaxed flex-1 pt-0.5">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-white transition-colors p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      // eslint-disable-next-line no-console
      success: (msg) => console.log('Success:', msg),
      // eslint-disable-next-line no-console
      error: (msg) => console.error('Error:', msg),
      // eslint-disable-next-line no-console
      info: (msg) => console.log('Info:', msg),
      // eslint-disable-next-line no-console
      warning: (msg) => console.warn('Warning:', msg),
    }
  }
  return context
}

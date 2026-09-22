import React from 'react'
import { api } from '@/utils/api'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })

    // Auto-recover from stale dynamic chunk imports on new deployments
    const errorStr = error?.toString() || ''
    if (
      errorStr.includes('Failed to fetch dynamically imported module') ||
      errorStr.includes('Importing a module script failed')
    ) {
      const storageKey = 'chunk_reload_ts'
      const lastReload = sessionStorage.getItem(storageKey)
      const now = Date.now()
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(storageKey, String(now))
        window.location.reload()
        return
      }
    }

    const payload = {
      errorMessage: error?.toString() || 'Unknown Frontend Error',
      pageOrRoute: window.location.pathname + window.location.search,
      userAgent: navigator.userAgent,
    }

    api.post('/monitoring/log-frontend-error', payload).catch((err) => {
      console.error('[ErrorBoundary] Failed to report crash to backend ErrorLog:', err.message)
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 selection:bg-red-500/10">
          <div className="max-w-md w-full text-center space-y-6 bg-white border border-gray-200 rounded-2xl shadow-xl p-8 md:p-10">
            {/* Warning Icon with pulse */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 animate-pulse mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 font-heading tracking-tight">
                Something went wrong
              </h1>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                An unexpected rendering error occurred. The application team has been notified, and we are working to resolve the issue.
              </p>
            </div>

            {/* Error detail accordion for developers/admins */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-mono text-gray-600 overflow-auto max-h-40">
                <summary className="cursor-pointer font-semibold select-none text-gray-700 outline-none">
                  Error Details (Dev Mode)
                </summary>
                <div className="mt-2 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </div>
              </details>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-brand-blue hover:bg-brand-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors cursor-pointer"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors"
              >
                Go to Homepage
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

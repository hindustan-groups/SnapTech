import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileText,
  Save,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Bold,
  Heading2,
  List,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'
import DOMPurify from 'dompurify'

const PAGES = [
  { type: 'PRIVACY_POLICY', label: 'Privacy Policy' },
  { type: 'TERMS_OF_SERVICE', label: 'Terms of Service' },
  { type: 'REFUND_POLICY', label: 'Refund Policy' },
]

export default function AdminLegalPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('PRIVACY_POLICY')
  const [editorContent, setEditorContent] = useState('')
  const [pageTitle, setPageTitle] = useState('')
  const editorRef = useRef(null)

  // Fetch all legal pages
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-legal-pages'],
    queryFn: () => api.get('/admin/legal').then((r) => r.data),
  })

  const pages = response || []
  const currentPage = pages.find((p) => p.pageType === activeTab)

  // Set page title when page loaded or tab changed
  useEffect(() => {
    if (currentPage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPageTitle(currentPage.title || '')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditorContent(currentPage.content || '')
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPageTitle('')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditorContent('')
    }
  }, [activeTab, currentPage])

  // Update legal page mutation
  const mutation = useMutation({
    mutationFn: ({ pageType, title, content }) =>
      api.put(`/admin/legal/${pageType}`, { title, content }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-legal-pages'] })
    },
  })

  const handleSave = () => {
    // Read final content from div
    const htmlContent = editorRef.current ? editorRef.current.innerHTML : editorContent
    mutation.mutate({
      pageType: activeTab,
      title: pageTitle || PAGES.find((p) => p.type === activeTab).label,
      content: htmlContent,
    })
  }

  // WYSIWYG command helper
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML)
    }
  }

  const addLink = () => {
    const url = prompt('Enter the link URL (e.g. https://example.com):')
    if (url) {
      executeCommand('createLink', url)
    }
  }

  return (
    <>
      <SEO title="Legal Pages Management" noIndex />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">Legal Pages</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage Privacy Policy, Terms of Service, and Refund Policy texts.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none gap-2">
          {PAGES.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
                activeTab === tab.type
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="bg-white border border-gray-150 rounded-2xl p-8 space-y-6 animate-pulse">
            <div className="h-6 bg-gray-100 rounded w-1/4" />
            <div className="h-12 bg-gray-50 rounded-xl" />
            <div className="h-96 bg-gray-50 rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Editor Workspace */}
            <div className="lg:col-span-8 space-y-5">
              {/* Warnings Banner */}
              <div className="flex items-start gap-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 shadow-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Important Compliance Reminder</p>
                  <p className="text-amber-700/90 text-xs mt-0.5 leading-relaxed">
                    Changes to legal pages should be reviewed by a legal professional before saving,
                    especially for compliance-related sections (GDPR, IT Act, or local state laws).
                  </p>
                </div>
              </div>

              {/* Title & Editor Container */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Title field */}
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40">
                  <label className="text-xs font-semibold text-gray-500 block mb-1 uppercase tracking-wide">
                    Page Header Title
                  </label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder={PAGES.find((p) => p.type === activeTab).label}
                    className="w-full text-base font-bold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
                  />
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-gray-100 bg-gray-50/20">
                  <button
                    onClick={() => executeCommand('formatBlock', '<h2>')}
                    title="Heading"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => executeCommand('formatBlock', '<p>')}
                    title="Paragraph text"
                    className="px-2 py-1 text-xs font-semibold rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    P
                  </button>
                  <div className="h-4 w-px bg-gray-200 mx-1" />
                  <button
                    onClick={() => executeCommand('bold')}
                    title="Bold"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => executeCommand('insertUnorderedList')}
                    title="Bullet List"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={addLink}
                    title="Add link"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* WYSIWYG Editor area */}
                <div
                  key={activeTab}
                  ref={editorRef}
                  contentEditable
                  onBlur={() => {
                    if (editorRef.current) {
                      setEditorContent(editorRef.current.innerHTML)
                    }
                  }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(currentPage?.content || ''),
                  }}
                  className="p-6 min-h-87.5 max-h-125 overflow-y-auto focus:outline-none prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-brand-blue prose-p:leading-relaxed"
                  style={{ minHeight: '350px' }}
                />
              </div>

              {/* Status alerts */}
              {mutation.isSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Page saved successfully.
                </div>
              )}
              {mutation.isError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> Failed to save legal page.
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={mutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white font-semibold py-3 rounded-xl text-sm hover:shadow-md hover:-translate-y-[1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {mutation.isPending ? 'Saving changes…' : 'Save Changes'}
              </button>
            </div>

            {/* Revision & Info Sidebar */}
            <div className="lg:col-span-4 bg-white border border-gray-150 rounded-2xl p-5 space-y-4.5 shadow-sm">
              <h3 className="font-heading font-bold text-gray-900 text-sm border-b border-gray-100 pb-2.5">
                Revision Info
              </h3>

              <div className="space-y-3.5 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400 font-medium block uppercase tracking-wider text-[10px]">
                    Page Type Code
                  </span>
                  <span className="font-mono text-gray-800 font-bold">{activeTab}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block uppercase tracking-wider text-[10px]">
                    Last Updated On
                  </span>
                  <span className="text-gray-800 font-semibold">
                    {currentPage?.lastUpdated
                      ? new Date(currentPage.lastUpdated).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block uppercase tracking-wider text-[10px]">
                    Updated By Account
                  </span>
                  <span className="text-gray-800 font-semibold truncate block max-w-full">
                    {currentPage?.adminEmail || 'System Seed'}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3.5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-brand-blue font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Editor Tips</span>
                </div>
                <ul className="list-disc pl-4 text-[11px] text-gray-500 space-y-1.5 leading-relaxed">
                  <li>
                    Use the <strong>Heading2</strong> button to format section titles.
                  </li>
                  <li>
                    Use the <strong>P</strong> button to return to normal body text.
                  </li>
                  <li>
                    Link terms dynamically to external sites using the <strong>Link</strong> tool.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

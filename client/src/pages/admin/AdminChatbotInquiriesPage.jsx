import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'
import {
  MessageSquare,
  Search,
  Trash2,
  HelpCircle,
  Clock,
  PlusCircle,
  X,
  User,
  Mail,
  Calendar,
  CheckCircle,
} from 'lucide-react'

export default function AdminChatbotInquiriesPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [faqModalData, setFaqModalData] = useState(null) // prefilled question for FAQ creation

  // Form states for converting to FAQ
  const [faqAnswer, setFaqAnswer] = useState('')
  const [faqCategory, setFaqCategory] = useState('General')

  // Fetch inquiries
  const { data: inquiriesRes, isLoading } = useQuery({
    queryKey: ['chatbot-inquiries'],
    queryFn: () => api.get('/chatbot/admin/inquiries').then((r) => r.data || []),
  })

  const inquiries = inquiriesRes || []

  // Delete Inquiry Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/chatbot/admin/inquiries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-inquiries'] })
      setSelectedInquiry(null)
    },
  })

  // Create FAQ Mutation (from conversion)
  const createFaqMutation = useMutation({
    mutationFn: (faqData) => api.post('/admin/faqs', faqData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] })
      // Auto-remove/resolve the inquiry once successfully converted to FAQ
      if (faqModalData?.id) {
        deleteMutation.mutate(faqModalData.id)
      }
      setFaqModalData(null)
      setFaqAnswer('')
      setFaqCategory('General')
    },
  })

  const handleConvertFaqSubmit = (e) => {
    e.preventDefault()
    if (!faqModalData || !faqAnswer.trim()) return
    createFaqMutation.mutate({
      question: faqModalData.question,
      answer: faqAnswer.trim(),
      category: faqCategory,
      isActive: true,
    })
  }

  // Filter inquiries
  const filteredInquiries = inquiries.filter((item) => {
    const q = item.question?.toLowerCase() || ''
    const contact = item.contactInfo?.toLowerCase() || ''
    const s = searchTerm.toLowerCase()
    return q.includes(s) || contact.includes(s)
  })

  return (
    <>
      <SEO title="Chatbot Inquiries" noIndex />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-brand-blue" />
              Chatbot Inquiries
            </h1>
            <p className="text-sm text-gray-500">
              Review and answer questions submitted by visitors using the AI chatbot widget.
            </p>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-155 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-xs font-semibold text-gray-500">
            Showing {filteredInquiries.length} of {inquiries.length} submissions
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions or contact info..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-250 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            />
          </div>
        </div>

        {/* Data Cards / Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm animate-pulse space-y-4">
                <div className="h-4 bg-gray-150 rounded w-1/4" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-155 p-12 text-center shadow-sm">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-655">No chatbot inquiries found</p>
            <p className="text-xs text-gray-450 mt-1">Visitors questions will appear here dynamically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredInquiries.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.createdAt).toLocaleString('en-IN')}
                    </span>
                    {item.contactInfo ? (
                      <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5" /> Lead Info Left
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-gray-50 text-gray-600 border border-gray-150 px-2 py-0.5 rounded-full uppercase">
                        Anonymous
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-gray-800 leading-relaxed bg-gray-50/50 p-3.5 rounded-xl border border-gray-100 mb-3">
                    "{item.question}"
                  </p>

                  {item.contactInfo && (
                    <div className="text-[11px] text-gray-550 space-y-1 mb-4">
                      <div className="font-bold text-gray-700">Visitor Contact Details:</div>
                      <div className="bg-blue-50/20 p-2.5 rounded-lg border border-blue-100/50 break-all select-all font-mono">
                        {item.contactInfo}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-auto">
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this inquiry?')) {
                        deleteMutation.mutate(item.id)
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setFaqModalData(item)
                      setFaqAnswer('')
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-blue hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Convert to FAQ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Convert to FAQ Modal */}
        {faqModalData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                <h3 className="text-base font-bold text-gray-900 font-heading flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-brand-blue" />
                  Convert Inquiry to Public FAQ
                </h3>
                <button
                  onClick={() => setFaqModalData(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConvertFaqSubmit} className="space-y-4">
                {/* Question (prefilled and read-only) */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    Question (From Inquiry)
                  </label>
                  <textarea
                    rows={2}
                    value={faqModalData.question}
                    readOnly
                    className="w-full text-xs font-semibold text-gray-600 p-3 border border-gray-150 rounded-xl bg-gray-50 focus:outline-none cursor-not-allowed leading-relaxed"
                  />
                </div>

                {/* FAQ Category */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    FAQ Category
                  </label>
                  <select
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                    required
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  >
                    <option value="General">General / FAQs</option>
                    <option value="Services">Services & Projects</option>
                    <option value="Pricing">Billing & Budgeting</option>
                    <option value="Careers">Careers & Resumes</option>
                  </select>
                </div>

                {/* Answer */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    FAQ Answer (Displays on public FAQs page)
                  </label>
                  <textarea
                    rows={5}
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    placeholder="Provide a clear, helpful public answer to this visitor's question..."
                    required
                    className="w-full text-xs text-gray-700 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-150">
                  <button
                    type="button"
                    onClick={() => setFaqModalData(null)}
                    className="px-4 py-2 border border-gray-255 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createFaqMutation.isPending || !faqAnswer.trim()}
                    className="px-4 py-2 bg-brand-blue hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-semibold rounded-xl hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {createFaqMutation.isPending ? 'Converting...' : 'Create FAQ & Resolve Inquiry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

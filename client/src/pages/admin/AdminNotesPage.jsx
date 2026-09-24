/**
 * AdminNotesPage — Enterprise Sticky Notepad & Ideas Vault
 * Fast, colorful, and organized internal notes, quick reminders, and credentials ledger.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Pencil,
  Trash2,
  Pin,
  Search,
  Tag,
  StickyNote,
  RefreshCw,
  Copy,
  Check,
  Filter,
  X,
  Sparkles,
  Bookmark,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO, ConfirmModal } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

const COLORS = [
  {
    id: 'yellow',
    label: 'Yellow',
    bg: 'bg-amber-50/90 border-amber-200/90 text-amber-950 shadow-xs hover:border-amber-300',
    headerBg: 'bg-amber-100/70',
    dot: 'bg-amber-400',
    hex: '#fef08a',
  },
  {
    id: 'blue',
    label: 'Sky Blue',
    bg: 'bg-sky-50/90 border-sky-200/90 text-sky-950 shadow-xs hover:border-sky-300',
    headerBg: 'bg-sky-100/70',
    dot: 'bg-sky-400',
    hex: '#bae6fd',
  },
  {
    id: 'green',
    label: 'Emerald',
    bg: 'bg-emerald-50/90 border-emerald-200/90 text-emerald-950 shadow-xs hover:border-emerald-300',
    headerBg: 'bg-emerald-100/70',
    dot: 'bg-emerald-400',
    hex: '#a7f3d0',
  },
  {
    id: 'pink',
    label: 'Rose Pink',
    bg: 'bg-rose-50/90 border-rose-200/90 text-rose-950 shadow-xs hover:border-rose-300',
    headerBg: 'bg-rose-100/70',
    dot: 'bg-rose-400',
    hex: '#fecdd3',
  },
  {
    id: 'purple',
    label: 'Purple',
    bg: 'bg-purple-50/90 border-purple-200/90 text-purple-950 shadow-xs hover:border-purple-300',
    headerBg: 'bg-purple-100/70',
    dot: 'bg-purple-400',
    hex: '#e9d5ff',
  },
]

export default function AdminNotesPage() {
  const qc = useQueryClient()
  const { addToast } = useToast()

  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedColor, setSelectedColor] = useState('yellow')
  const [filterColor, setFilterColor] = useState('ALL')
  const [filterPin, setFilterPin] = useState('ALL') // 'ALL' | 'PINNED' | 'UNPINNED'
  const [copiedId, setCopiedId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemTitle: '',
    onConfirm: null,
  })

  // Inline note creation states
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [isExpanding, setIsExpanding] = useState(false)

  // Inline edit state
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  // 1. Fetch Notes
  const { data: notes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-notes'],
    queryFn: () => api.get('/admin/notes').then((r) => r.data),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/notes', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-notes'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      addToast('New sticky note created!', 'success')
      setNoteTitle('')
      setNoteContent('')
      setIsExpanding(false)
    },
    onError: (err) => {
      addToast(err.message || 'Failed to create note', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/admin/notes/${id}`, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-notes'] })
      addToast(res.message || 'Sticky note updated!', 'success')
      setEditingId(null)
    },
    onError: (err) => {
      addToast(err.message || 'Failed to update note', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/notes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-notes'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      addToast('Sticky note permanently deleted.', 'info')
    },
    onError: (err) => {
      addToast(err.message || 'Failed to delete note', 'error')
    },
  })

  // Handlers
  const handleCreateSubmit = (e) => {
    e.preventDefault()
    if (!noteContent.trim()) {
      addToast('Note content cannot be empty', 'error')
      return
    }
    createMutation.mutate({
      title: noteTitle.trim() || 'Untitled Note',
      content: noteContent.trim(),
      color: selectedColor,
    })
  }

  const handleTogglePin = (note) => {
    updateMutation.mutate({ id: note.id, isPinned: !note.isPinned })
  }

  const handleColorChange = (note, color) => {
    updateMutation.mutate({ id: note.id, color })
  }

  const handleDelete = (note) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Sticky Note',
      message: 'Are you sure you want to permanently delete this sticky note from the vault?',
      itemTitle: note.title || 'Untitled Sticky Note',
      onConfirm: () => {
        deleteMutation.mutate(note.id)
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))
      },
    })
  }

  const handleStartEdit = (note) => {
    setEditingId(note.id)
    setEditTitle(note.title || '')
    setEditContent(note.content || '')
  }

  const handleSaveEdit = (id) => {
    if (!editContent.trim()) {
      addToast('Content cannot be empty', 'error')
      return
    }
    updateMutation.mutate({
      id,
      title: editTitle.trim() || 'Untitled Note',
      content: editContent.trim(),
    })
  }

  const handleCopyNote = (note) => {
    const textToCopy = `${note.title ? note.title + '\n\n' : ''}${note.content}`
    navigator.clipboard.writeText(textToCopy)
    setCopiedId(note.id)
    addToast('Note content copied to clipboard!', 'info')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered and Sorted Notes (Pinned items first)
  const filteredNotes = notes
    .filter((n) => {
      const q = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !q ||
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q)

      const matchesColor = filterColor === 'ALL' || n.color === filterColor
      const matchesPin =
        filterPin === 'ALL' ||
        (filterPin === 'PINNED' && n.isPinned) ||
        (filterPin === 'UNPINNED' && !n.isPinned)

      return matchesSearch && matchesColor && matchesPin
    })
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))

  const pinnedCount = notes.filter((n) => n.isPinned).length
  const totalNotes = notes.length

  const getNoteStyle = (colorId) => {
    const found = COLORS.find((c) => c.id === colorId)
    return found ? found.bg : 'bg-amber-50/90 border-amber-200/90 text-amber-950 shadow-xs'
  }

  return (
    <>
      <SEO title="Internal Sticky Notepad" noIndex />
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-linear-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <StickyNote className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Internal Sticky Notepad
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Quick Vault
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Jot down operational tasks, client credentials, quick links, and staff reminders with color tags and pin support.
                </p>
              </div>
            </div>

            {/* Quick Action Refresh & Add Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  refetch()
                  addToast('Refreshed sticky notes', 'info')
                }}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setIsExpanding(true)}
                className="px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Sticky Note</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Metric Cards ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Sticky Notes</p>
              <p className="text-xl font-extrabold font-heading text-gray-900">{totalNotes}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <Pin className="w-5 h-5 fill-current rotate-12" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pinned Notes</p>
              <p className="text-xl font-extrabold font-heading text-rose-600">{pinnedCount}</p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sky &amp; Amber Notes</p>
              <p className="text-xl font-extrabold font-heading text-sky-600">
                {notes.filter((n) => n.color === 'yellow' || n.color === 'blue').length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Other Color Categories</p>
              <p className="text-xl font-extrabold font-heading text-purple-600">
                {notes.filter((n) => n.color !== 'yellow' && n.color !== 'blue').length}
              </p>
            </div>
          </div>
        </div>

        {/* ── Interactive Note Creator Box ───────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-md p-5 max-w-xl transition-all">
          <form onSubmit={handleCreateSubmit} className="space-y-3">
            {isExpanding && (
              <input
                type="text"
                placeholder="Note Title (e.g. Client Server Credentials)"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-bold"
              />
            )}
            <textarea
              placeholder="Take a quick note, save a link, credential or reminder..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              onFocus={() => setIsExpanding(true)}
              rows={isExpanding ? 3 : 1}
              required
              className="w-full px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all resize-none font-sans"
            />

            {isExpanding && (
              <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-gray-100">
                {/* Color Selector Pills */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mr-1">
                    Color:
                  </span>
                  {COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedColor(col.id)}
                      className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                        selectedColor === col.id
                          ? 'ring-2 ring-brand-blue ring-offset-2 scale-110 shadow-xs'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.label}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanding(false)
                      setNoteTitle('')
                      setNoteContent('')
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !noteContent.trim()}
                    className="inline-flex items-center gap-1.5 bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{createMutation.isPending ? 'Saving...' : 'Save Sticky Note'}</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ── Search & Filter Controls ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sticky notes by title or text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-bold text-gray-700 shadow-xs"
            >
              <option value="ALL">All Colors</option>
              <option value="yellow">Yellow</option>
              <option value="blue">Sky Blue</option>
              <option value="green">Emerald Green</option>
              <option value="pink">Rose Pink</option>
              <option value="purple">Purple</option>
            </select>

            <select
              value={filterPin}
              onChange={(e) => setFilterPin(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-bold text-gray-700 shadow-xs"
            >
              <option value="ALL">All Notes</option>
              <option value="PINNED">Pinned Only</option>
              <option value="UNPINNED">Unpinned Only</option>
            </select>
          </div>
        </div>

        {/* ── Sticky Notes Masonry/Grid ──────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse shadow-sm"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500 text-xs font-bold bg-white rounded-2xl border border-gray-200/80">
            Failed to load sticky notes.
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200/80 rounded-2xl shadow-sm space-y-3">
            <Tag className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-700 text-sm font-bold">No sticky notes found.</p>
            <p className="text-xs text-gray-400">Use the creator box above to create your first note.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredNotes.map((note) => {
              const isEditingThis = editingId === note.id

              return (
                <div
                  key={note.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-200 relative group min-h-[170px] ${getNoteStyle(
                    note.color
                  )}`}
                >
                  <div>
                    {/* Header Row: Title & Pin Trigger */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      {isEditingThis ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-white/70 border border-gray-300 focus:outline-none font-bold text-xs sm:text-sm px-2 py-1 rounded-lg"
                        />
                      ) : (
                        <h4 className="font-bold text-xs sm:text-sm leading-snug line-clamp-1 flex-1 font-heading">
                          {note.title || 'Untitled Note'}
                        </h4>
                      )}

                      <button
                        onClick={() => handleTogglePin(note)}
                        className={`transition-all p-1.5 rounded-lg hover:bg-black/5 shrink-0 cursor-pointer ${
                          note.isPinned
                            ? 'text-rose-600 scale-110 rotate-12'
                            : 'text-gray-400 hover:text-gray-700'
                        }`}
                        title={note.isPinned ? 'Unpin note' : 'Pin note'}
                      >
                        <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Content Section */}
                    {isEditingThis ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-white/70 border border-gray-300 focus:outline-none text-xs p-2 rounded-lg resize-none font-sans"
                        rows={3}
                      />
                    ) : (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap break-words font-sans text-gray-800">
                        {note.content}
                      </p>
                    )}

                    {/* Inline Edit Save / Cancel */}
                    {isEditingThis && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-black/10">
                        <button
                          onClick={() => handleSaveEdit(note.id)}
                          className="px-3 py-1 bg-brand-blue text-white rounded-lg text-[11px] font-bold shadow-xs hover:bg-brand-blue-hover transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-black/10 hover:bg-black/15 text-gray-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer Row: Created Date & Actions */}
                  {!isEditingThis && (
                    <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-[10px] text-gray-500 font-medium">
                      <span className="font-mono">
                        {new Date(note.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>

                      {/* Action Tools */}
                      <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Color Selector Pills */}
                        <div className="flex items-center gap-1 bg-black/5 p-1 rounded-lg">
                          {COLORS.map((col) => (
                            <button
                              key={col.id}
                              onClick={() => handleColorChange(note, col.id)}
                              className={`w-3 h-3 rounded-full border border-black/10 transition-transform hover:scale-125 cursor-pointer ${
                                note.color === col.id ? 'ring-1 ring-black/40 scale-110' : ''
                              }`}
                              style={{ backgroundColor: col.hex }}
                              title={col.label}
                            />
                          ))}
                        </div>

                        {/* Copy Content */}
                        <button
                          onClick={() => handleCopyNote(note)}
                          className="p-1 text-gray-600 hover:text-black hover:bg-black/5 rounded transition-all cursor-pointer"
                          title="Copy Note Text"
                        >
                          {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Edit Note */}
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-1 text-gray-600 hover:text-black hover:bg-black/5 rounded transition-all cursor-pointer"
                          title="Edit Note"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Note */}
                        <button
                          onClick={() => handleDelete(note)}
                          className="p-1 text-gray-600 hover:text-red-600 hover:bg-black/5 rounded transition-all cursor-pointer"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Guidance Banner ─────────────────────────────────── */}
        <div className="bg-linear-to-r from-amber-50/80 via-yellow-50/50 to-amber-50/80 border border-amber-200/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-950 font-heading flex items-center gap-2">
              <span>Internal Operations &amp; Team Reminders</span>
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Sticky notes are shared internally across administrative team members for quick task handoffs, temporary server links, and client instructions.
            </p>
          </div>
        </div>

        {/* ── Delete Confirmation Modal ──────────────────────────── */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={deleteConfirm.onConfirm}
          title={deleteConfirm.title}
          message={deleteConfirm.message}
          itemTitle={deleteConfirm.itemTitle}
          confirmText="Delete Sticky Note"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

      </div>
    </>
  )
}

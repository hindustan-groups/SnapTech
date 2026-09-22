import { useState, useRef } from 'react'
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  File,
  Download,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { api } from '@/utils/api'

export default function AttachmentSection({
  attachments = [],
  leadId,
  taskId,
  clientProjectId,
  onUploadSuccess,
}) {
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [status, setStatus] = useState(null) // { type: 'success'|'error', msg: '' }
  const fileInputRef = useRef(null)

  const showStatus = (type, msg) => {
    setStatus({ type, msg })
    setTimeout(() => setStatus(null), 5000)
  }

  // File size formatter
  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  // Get corresponding file icon & color based on mimetype
  const getFileIcon = (mimeType = '') => {
    const mime = mimeType.toLowerCase()
    if (mime.startsWith('image/')) {
      return { Icon: FileImage, color: 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20' }
    }
    if (mime === 'application/pdf') {
      return { Icon: FileText, color: 'text-red-400 bg-red-500/10 border border-red-500/20' }
    }
    if (mime.includes('word') || mime.includes('msword')) {
      return { Icon: FileText, color: 'text-blue-400 bg-blue-500/10 border border-blue-500/20' }
    }
    if (mime.includes('excel') || mime.includes('spreadsheet') || mime.includes('sheet')) {
      return { Icon: FileSpreadsheet, color: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' }
    }
    if (mime.includes('zip') || mime.includes('compressed')) {
      return { Icon: FileArchive, color: 'text-purple-400 bg-purple-500/10 border border-purple-500/20' }
    }
    return { Icon: File, color: 'text-slate-400 bg-white/5 border border-white/10' }
  }

  // Handle file select & upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      showStatus('error', 'File size exceeds the 10MB limit.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    if (leadId) formData.append('leadId', leadId)
    if (taskId) formData.append('taskId', taskId)
    if (clientProjectId) formData.append('clientProjectId', clientProjectId)

    setUploading(true)
    try {
      const res = await api.post('/upload/attachment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if (res.data.status === 'ok') {
        showStatus('success', 'File uploaded successfully!')
        if (onUploadSuccess) onUploadSuccess()
      } else {
        showStatus('error', res.data.message || 'Upload failed.')
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      showStatus('error', err.response?.data?.message || 'Error uploading file.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Handle deletion of attachment
  const handleDelete = async (id, fileName) => {
    if (!window.confirm(`Are you sure you want to delete the file "${fileName}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      const res = await api.delete(`/upload/attachment/${id}`)
      if (res.data.status === 'ok') {
        showStatus('success', 'File deleted successfully!')
        if (onUploadSuccess) onUploadSuccess()
      } else {
        showStatus('error', res.data.message || 'Failed to delete file.')
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      showStatus('error', err.response?.data?.message || 'Error deleting file.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Attachments ({attachments.length})
        </h4>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.zip"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          Upload File
        </button>
      </div>

      {/* Status Notifications */}
      {status && (
        <div
          className={`flex items-center gap-2 text-xs rounded-xl px-3.5 py-2.5 border transition-all ${
            status.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-red-500/10 text-red-300 border-red-500/30'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{status.msg}</span>
        </div>
      )}

      {attachments.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-xl bg-[#03091e]/50">
          <p className="text-[11px] text-slate-400">No attachments uploaded yet.</p>
          <p className="text-[9px] text-slate-500 mt-0.5">Supports PDF, Word, Excel, ZIP, & Images up to 10MB</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {attachments.map((item) => {
            const { Icon, color } = getFileIcon(item.fileType)
            const isDeleting = deletingId === item.id

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border border-white/10 rounded-xl bg-slate-900/80 hover:border-cyan-500/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg ${color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate" title={item.fileName}>
                      {item.fileName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>{formatBytes(item.fileSize)}</span>
                      {item.uploadedByRole === 'CLIENT' && (
                        <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                          Client Uploaded
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-all"
                    title="Download/View File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDelete(item.id, item.fileName)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                    title="Delete File"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

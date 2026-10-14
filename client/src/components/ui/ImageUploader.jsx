/**
 * ImageUploader — Drag & drop image upload to Cloudinary via admin API
 * Usage: <ImageUploader value={url} onChange={(url) => setValue(url)} />
 */
import { useState, useRef } from 'react'
import { Upload, X, Image, Loader2 } from 'lucide-react'
import { api } from '@/utils/api'

export default function ImageUploader({
  value,
  onChange,
  label = 'Image',
  accept = '.jpg,.jpeg,.png,.webp,.svg,.gif,.avif',
}) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const upload = async (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max 5MB allowed.')
      return
    }
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'image/avif',
    ]
    const ext = file.name ? file.name.split('.').pop().toLowerCase() : ''
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'avif']

    if (!allowedTypes.includes(file.type) && (!ext || !allowedExts.includes(ext))) {
      setError('Only JPG, PNG, WebP, SVG, GIF, and AVIF images are allowed.')
      return
    }

    setError('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post('/upload', formData)
      if (res?.data?.url) {
        onChange(res.data.url)
      } else {
        throw new Error('Upload succeeded but no image URL was returned.')
      }
    } catch (err) {
      const msg = err?.message || ''
      if (
        err.status === 401 ||
        msg.toLowerCase().includes('log in') ||
        msg.toLowerCase().includes('session')
      ) {
        setError('Your session has expired. Please log in again.')
      } else if (err.status === 404) {
        setError('Upload endpoint returned 404. Your session may have expired — please log in again.')
      } else if (err.status === 413) {
        setError('File too large. Max 5MB allowed.')
      } else if (err.status === 503) {
        setError('Cloudinary is not configured. Please verify credentials in Integrations.')
      } else {
        setError(msg || 'Upload failed. Try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) upload(file)
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-medium text-gray-600 block">{label}</label>}

      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
              flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
            aria-label="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 px-4 py-6
          border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
          ${dragging ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-200 hover:border-brand-blue/50 hover:bg-gray-50'}
          ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
            <p className="text-xs text-gray-500">Uploading…</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-brand-blue/8 flex items-center justify-center">
              {dragging ? (
                <Upload className="w-5 h-5 text-brand-blue" />
              ) : (
                <Image className="w-5 h-5 text-brand-blue" />
              )}
            </div>
            <p className="text-xs text-gray-500 text-center">
              <span className="font-medium text-brand-blue">Click to upload</span> or drag & drop
            </p>
            <p className="text-[10px] text-gray-400">JPG, PNG, WebP · Max 5MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* URL input fallback */}
      <div>
        <label className="text-[10px] text-gray-400 block mb-1">Or paste image URL directly</label>
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://res.cloudinary.com/..."
          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

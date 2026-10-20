/**
 * cloudinary.js — Cloudinary config + multer memory storage + direct SDK upload
 * Uses cloudinary v1 SDK with in-memory multer (no multer-storage-cloudinary dependency)
 */
import cloudinaryPkg from 'cloudinary'
import multer from 'multer'
import { env } from '../config/env.js'

const cloudinary = cloudinaryPkg?.v2 || cloudinaryPkg

// Configure Cloudinary SDK with fallback to verified credentials
const defaultCloudName = (process.env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME || 'z4qgsupg')?.trim()
const defaultApiKey = (process.env.CLOUDINARY_API_KEY || env.CLOUDINARY_API_KEY || '445256788173392')?.trim()
const defaultApiSecret = (process.env.CLOUDINARY_API_SECRET || env.CLOUDINARY_API_SECRET || 'EUD4TQudIEQ9--9X5iH1erG7WoM')?.trim()

if (cloudinary && typeof cloudinary.config === 'function') {
  cloudinary.config({
    cloud_name: defaultCloudName,
    api_key: defaultApiKey,
    api_secret: defaultApiSecret,
  })
}

// Use memory storage — file goes to buffer, we upload manually
const memoryStorage = multer.memoryStorage()

// File filter — images (JPG, PNG, WebP, SVG, GIF, AVIF)
const fileFilter = (_req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'image/avif',
  ]
  const ext = file.originalname?.split('.').pop()?.toLowerCase()
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'avif']

  if (allowed.includes(file.mimetype) || (ext && allowedExts.includes(ext))) {
    cb(null, true)
  } else {
    cb(new Error('Only JPG, PNG, WebP, SVG, GIF, and AVIF images are allowed.'), false)
  }
}

export const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
})

// Resume file filter
const resumeFileFilter = (_req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  const ext = file.originalname.split('.').pop().toLowerCase()
  if (allowedTypes.includes(file.mimetype) || ['pdf', 'doc', 'docx'].includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF and Word documents (.doc, .docx) are allowed.'), false)
  }
}

export const uploadResume = multer({
  storage: memoryStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

// Attachment file filter - allows images, PDFs, Word docs, Excel sheets, and ZIP files
const attachmentFileFilter = (_req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed'
  ]
  const ext = file.originalname.split('.').pop().toLowerCase()
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip']

  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('File format not supported. Only images, PDFs, Word documents, Excel sheets, and ZIP archives are allowed.'), false)
  }
}

export const uploadAttachment = multer({
  storage: memoryStorage,
  fileFilter: attachmentFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max size
})

/**
 * Upload buffer to Cloudinary directly
 * Used in upload.route.js after multer processes the file into memory
 */
export const uploadToCloudinary = (buffer, folder = 'hindustan-projects', resourceType = 'image', originalName = '') => {
  return new Promise((resolve, reject) => {
    // Re-verify that Cloudinary SDK has the active trimmed credentials
    const cloud_name = (process.env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME || 'z4qgsupg')?.trim()
    const api_key = (process.env.CLOUDINARY_API_KEY || env.CLOUDINARY_API_KEY || '445256788173392')?.trim()
    const api_secret = (process.env.CLOUDINARY_API_SECRET || env.CLOUDINARY_API_SECRET || 'EUD4TQudIEQ9--9X5iH1erG7WoM')?.trim()

    if (cloud_name && api_key && api_secret) {
      cloudinary.config({ cloud_name, api_key, api_secret })
    }

    let public_id = undefined
    if (originalName) {
      const ext = originalName.split('.').pop().toLowerCase()
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'))
      const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_')
      // For raw files, we MUST append the extension to public_id so Cloudinary serves it with the extension
      if (resourceType === 'raw') {
        public_id = `${cleanName}_${Date.now()}.${ext}`
      } else {
        public_id = `${cleanName}_${Date.now()}`
      }
    }

    const isSvg = originalName?.toLowerCase().endsWith('.svg')
    const isGif = originalName?.toLowerCase().endsWith('.gif')

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id,
        transformation:
          resourceType === 'image' && !isSvg && !isGif
            ? [{ width: 1200, quality: 'auto', fetch_format: 'auto' }]
            : undefined,
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    stream.end(buffer)
  })
}

export { cloudinary }

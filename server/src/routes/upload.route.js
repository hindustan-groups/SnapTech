/**
 * upload.route.js — POST /api/upload
 * Admin-only image upload to Cloudinary using direct SDK upload
 */
import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { upload, uploadToCloudinary, uploadAttachment } from '../utils/cloudinary.js'
import { createAttachment, deleteAttachment } from '../controllers/attachments.controller.js'

const router = Router()

router.post(
  '/',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  (req, res, next) => {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(503).json({
        status: 'error',
        message: 'Image upload is not configured. Set Cloudinary credentials in Integrations.',
      })
    }
    next()
  },
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'No image file provided.' })
      }

      const result = await uploadToCloudinary(req.file.buffer, 'hindustan-projects', 'image', req.file.originalname)

      return res.status(201).json({
        status: 'ok',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      })
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        message: err.message || 'Upload failed.',
      })
    }
  }
)

// ── Attachment Management ──────────────────────────────────────
router.post(
  '/attachment',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'),
  uploadAttachment.single('file'),
  createAttachment
)

router.delete(
  '/attachment/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'),
  deleteAttachment
)

export default router

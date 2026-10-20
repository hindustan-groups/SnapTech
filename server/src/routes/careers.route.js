import { Router } from 'express'
import { body } from 'express-validator'
import {
  getActiveJobs,
  getJobBySlug,
  submitApplication,
} from '../controllers/careers.controller.js'
import { uploadResume } from '../utils/cloudinary.js'
import { validateRequest, careersLimiter } from '../middleware/security.js'

const router = Router()

// GET /api/careers — list all active job postings
router.get('/', getActiveJobs)

// GET /api/careers/:slug — single job posting details
router.get('/:slug', getJobBySlug)

// POST /api/careers/:slug/apply — submit application (validated + rate limited)
router.post(
  '/:slug/apply',
  careersLimiter, // Enforces 3 applications per 15 minutes per IP
  uploadResume.single('resume'),
  [
    body('fullName')
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full Name must be between 2 and 100 characters'),
    body('email')
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address is required'),
    body('phone')
      .notEmpty()
      .trim()
      .matches(/^[+\d\s\-().]{7,20}$/)
      .withMessage('Please provide a valid phone number.'),
    body('coverLetter')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Cover letter must not exceed 5000 characters'),
    body('experience').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body('currentCtc').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body('expectedCtc').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body('noticePeriod').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
    body('linkedinUrl').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
    body('portfolioUrl').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
    body('recaptchaToken').notEmpty().withMessage('reCAPTCHA token is required'),
    body('_hp').optional().isLength({ max: 0 }).withMessage('Invalid submission'),
  ],
  validateRequest,
  submitApplication
)

export default router

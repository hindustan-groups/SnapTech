/**
 * admin.route.js — All admin routes (auth + CRUD)
 * All routes except login/logout require verifyToken + requireRole
 */
import { Router } from 'express'
import { body } from 'express-validator'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { adminLoginLimiter, validateRequest } from '../middleware/security.js'
import { getLeads, updateLeadStatus, deleteLead } from '../controllers/leads.controller.js'
import { getDeletedItems, restoreItem, permanentlyDeleteItem } from '../controllers/recycleBin.controller.js'
import { bulkImportLeads } from '../controllers/leadsImport.controller.js'
import multer from 'multer'
import { MIN_MASTER_KEY_LENGTH } from '../utils/masterKey.js'

const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2 MB
})
import {
  listServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/adminServices.controller.js'
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/adminProjects.controller.js'
import {
  listTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '../controllers/adminTeam.controller.js'
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonials.controller.js'
import {
  listFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  updateSettings,
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  listPartners,
  createPartner,
  updatePartner,
  deletePartner,
} from '../controllers/content.controller.js'
import {
  listJobPostings,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  listApplications,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/adminCareers.controller.js'
import { listLegalPages, updateLegalPage } from '../controllers/legal.controller.js'
import {
  listClientProjects,
  createClientProject,
  updateClientProject,
  deleteClientProject,
} from '../controllers/clientProjects.controller.js'
import { listTasks, createTask, updateTask, deleteTask } from '../controllers/tasks.controller.js'
import { listNotes, createNote, updateNote, deleteNote } from '../controllers/notes.controller.js'
import { listActivities } from '../controllers/activities.controller.js'
import {
  listAllTickets,
  getAdminTicketById,
  replyToTicketFromAdmin,
  updateTicketStatus,
  assignTicket,
  listAssignableAdmins,
} from '../controllers/tickets.controller.js'
import {
  listProjectBillingMilestones,
  createBillingMilestone,
  updateBillingMilestone,
  deleteBillingMilestone,
} from '../controllers/billing.controller.js'
import {
  adminListPosts,
  adminGetPost,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  adminListComments,
  adminApproveComment,
  adminDeleteComment,
} from '../controllers/blog.controller.js'
import {
  adminLogin,
  adminLogout,
  getMe,
  getDashboardStats,
  changePassword,
  changeEmail,
  changeMasterKey,
  getMasterKeyHint,
  adminRefreshToken,
  setup2FA,
  verify2FA,
  login2FA,
  disable2FA,
} from '../controllers/admin.controller.js'
import {
  getIntegrationConfig,
  updateIntegrationConfig,
  testSmtpConnection,
  testResendConnection,
  testCloudinaryConnection,
  testDatabaseConnection,
  verifyIntegrationKey,
  checkUnlockToken,
  verifyUnlockToken,
} from '../controllers/integration.controller.js'
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  listClients,
  createClientUser,
  updateClientUser,
  deleteClientUser,
  resendClientWelcome,
} from '../controllers/adminUsers.controller.js'
import { globalSearch } from '../controllers/adminSearch.controller.js'
import {
  adminListPricing,
  adminCreatePricing,
  adminUpdatePricing,
  adminBulkUpdatePricing,
  adminDeletePricing,
} from '../controllers/pricing.controller.js'
import {
  getEmailDashboardStats,
  listEmailLogs,
  getEmailLogById,
  sendManualEmail,
  listEmailTemplates,
  previewEmailTemplate,
  listAutomationRules,
  updateAutomationRule,
  getEmailSettings,
  updateEmailSettings,
  testEmailConnection,
  getEligibleRecipients,
  listEmailAccounts,
  getEmailAccountById,
  createEmailAccount,
  updateEmailAccount,
  deleteEmailAccount,
  testAccountSmtpHandler,
  testAccountImapHandler,
  syncAccountMailboxHandler,
  syncAllAccountsHandler,
  listEmailMessages,
  getEmailMessageById,
  updateEmailMessage,
  replyToEmailMessage,
  createLeadFromEmailMessage,
  deleteEmailMessage,
  getEmailRoutingHandler,
  updateEmailRoutingHandler,
} from '../controllers/emailCenter.controller.js'

// ── CMS Validation Schemas ─────────────────────────────────────

// Services
const serviceCreateValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 100 }),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required.')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens.')
    .isLength({ max: 100 }),
  body('shortDescription').trim().notEmpty().withMessage('Short description is required.').isLength({ max: 300 }),
  body('fullDescription').trim().notEmpty().withMessage('Full description is required.').isLength({ max: 5000 }),
  body('icon').trim().notEmpty().withMessage('Icon is required.').isLength({ max: 50 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean().toBoolean(),
  body('tag').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('deliveryTime').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('techStack').optional().isArray().custom((arr) => arr.every((item) => typeof item === 'string')),
  body('keyFeatures').optional().isArray().custom((arr) => arr.every((item) => typeof item === 'string')),
  body('colorFrom').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('colorTo').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
]

const serviceUpdateValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.').isLength({ max: 100 }),
  body('slug')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Slug cannot be empty.')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens.')
    .isLength({ max: 100 }),
  body('shortDescription').optional().trim().notEmpty().withMessage('Short description cannot be empty.').isLength({ max: 300 }),
  body('fullDescription').optional().trim().notEmpty().withMessage('Full description cannot be empty.').isLength({ max: 5000 }),
  body('icon').optional().trim().notEmpty().withMessage('Icon cannot be empty.').isLength({ max: 50 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean().toBoolean(),
  body('tag').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('deliveryTime').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('techStack').optional().isArray().custom((arr) => arr.every((item) => typeof item === 'string')),
  body('keyFeatures').optional().isArray().custom((arr) => arr.every((item) => typeof item === 'string')),
  body('colorFrom').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('colorTo').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
]

// Projects
const projectCreateValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 150 }),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required.')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens.')
    .isLength({ max: 150 }),
  body('clientName').trim().notEmpty().withMessage('Client name is required.').isLength({ max: 150 }),
  body('description').trim().notEmpty().withMessage('Description is required.').isLength({ max: 2000 }),
  body('thumbnailUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Thumbnail URL must be valid.').isLength({ max: 1000 }),
  body('images').optional().isArray().custom((arr) => arr.every((item) => typeof item === 'string')),
  body('technologies').optional().isArray().custom((arr) => arr.every((item) => typeof item === 'string')),
  body('category').trim().notEmpty().withMessage('Category is required.').isLength({ max: 50 }),
  body('isFeatured').optional().isBoolean().toBoolean(),
  body('liveUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Live URL must be valid.').isLength({ max: 1000 }),
]

const projectUpdateValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.').isLength({ max: 150 }),
  body('slug')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Slug cannot be empty.')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens.')
    .isLength({ max: 150 }),
  body('clientName').optional().trim().notEmpty().withMessage('Client name cannot be empty.').isLength({ max: 150 }),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty.').isLength({ max: 2000 }),
  body('thumbnailUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Thumbnail URL must be valid.').isLength({ max: 1000 }),
  body('images').optional().isArray().custom((arr) => arr.every((item) => typeof item === 'string')),
  body('technologies').optional().isArray().custom((arr) => arr.every((item) => typeof item === 'string')),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty.').isLength({ max: 50 }),
  body('isFeatured').optional().isBoolean().toBoolean(),
  body('liveUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Live URL must be valid.').isLength({ max: 1000 }),
]

// Team Members
const teamCreateValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('role').trim().notEmpty().withMessage('Role is required.').isLength({ max: 100 }),
  body('photoUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Photo URL must be valid.').isLength({ max: 1000 }),
  body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('linkedinUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('LinkedIn URL must be valid.').isLength({ max: 1000 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
]

const teamUpdateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.').isLength({ max: 100 }),
  body('role').optional().trim().notEmpty().withMessage('Role cannot be empty.').isLength({ max: 100 }),
  body('photoUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Photo URL must be valid.').isLength({ max: 1000 }),
  body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('linkedinUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('LinkedIn URL must be valid.').isLength({ max: 1000 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
]

// Testimonials
const testimonialCreateValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('role').trim().notEmpty().withMessage('Role is required.').isLength({ max: 100 }),
  body('company').trim().notEmpty().withMessage('Company is required.').isLength({ max: 100 }),
  body('text').trim().notEmpty().withMessage('Testimonial text is required.').isLength({ max: 1000 }),
  body('rating').optional().isInt({ min: 1, max: 5 }).toInt(),
  body('avatarUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Avatar URL must be valid.').isLength({ max: 1000 }),
  body('isActive').optional().isBoolean().toBoolean(),
  body('order').optional().isInt({ min: 0 }).toInt(),
]

const testimonialUpdateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.').isLength({ max: 100 }),
  body('role').optional().trim().notEmpty().withMessage('Role cannot be empty.').isLength({ max: 100 }),
  body('company').optional().trim().notEmpty().withMessage('Company cannot be empty.').isLength({ max: 100 }),
  body('text').optional().trim().notEmpty().withMessage('Testimonial text cannot be empty.').isLength({ max: 1000 }),
  body('rating').optional().isInt({ min: 1, max: 5 }).toInt(),
  body('avatarUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Avatar URL must be valid.').isLength({ max: 1000 }),
  body('isActive').optional().isBoolean().toBoolean(),
  body('order').optional().isInt({ min: 0 }).toInt(),
]

// FAQs
const faqCreateValidation = [
  body('question').trim().notEmpty().withMessage('Question is required.').isLength({ max: 500 }),
  body('answer').trim().notEmpty().withMessage('Answer is required.').isLength({ max: 2000 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean().toBoolean(),
]

const faqUpdateValidation = [
  body('question').optional().trim().notEmpty().withMessage('Question cannot be empty.').isLength({ max: 500 }),
  body('answer').optional().trim().notEmpty().withMessage('Answer cannot be empty.').isLength({ max: 2000 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean().toBoolean(),
]

// Milestones
const milestoneCreateValidation = [
  body('year').trim().notEmpty().withMessage('Year is required.').isLength({ max: 20 }),
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 150 }),
  body('desc').trim().notEmpty().withMessage('Description is required.').isLength({ max: 500 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
]

const milestoneUpdateValidation = [
  body('year').optional().trim().notEmpty().withMessage('Year cannot be empty.').isLength({ max: 20 }),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.').isLength({ max: 150 }),
  body('desc').optional().trim().notEmpty().withMessage('Description cannot be empty.').isLength({ max: 500 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
]

// Partners
const partnerCreateValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('logoUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Logo URL must be valid.').isLength({ max: 1000 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean().toBoolean(),
]

const partnerUpdateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.').isLength({ max: 100 }),
  body('logoUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Logo URL must be valid.').isLength({ max: 1000 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean().toBoolean(),
]

// Blog Posts
const blogPostCreateValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required.')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens.')
    .isLength({ max: 200 }),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required.').isLength({ max: 500 }),
  body('content').trim().notEmpty().withMessage('Content is required.').isLength({ max: 50000 }),
  body('featuredImageUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Featured Image URL must be valid.').isLength({ max: 1000 }),
  body('category').trim().notEmpty().withMessage('Category is required.').isLength({ max: 100 }),
  body('tags').optional().isArray().custom((arr) => arr.every((item) => typeof item === 'string')),
  body('authorName').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED.'),
  body('metaTitle').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('metaDescription').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('isFeatured').optional().isBoolean().toBoolean(),
]

const blogPostUpdateValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.').isLength({ max: 200 }),
  body('slug')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Slug cannot be empty.')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens.')
    .isLength({ max: 200 }),
  body('excerpt').optional().trim().notEmpty().withMessage('Excerpt cannot be empty.').isLength({ max: 500 }),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty.').isLength({ max: 50000 }),
  body('featuredImageUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Featured Image URL must be valid.').isLength({ max: 1000 }),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty.').isLength({ max: 100 }),
  body('tags').optional().isArray().custom((arr) => arr.every((item) => typeof item === 'string')),
  body('authorName').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED.'),
  body('metaTitle').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('metaDescription').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('isFeatured').optional().isBoolean().toBoolean(),
]

// Pricing Packages
const pricingCreateValidation = [
  body('category').trim().notEmpty().withMessage('Category is required.').isLength({ max: 50 }),
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 150 }),
  body('price').trim().notEmpty().withMessage('Price is required.').isLength({ max: 50 }),
  body('features').optional().isArray(),
  body('isPopular').optional().isBoolean().toBoolean(),
  body('isActive').optional().isBoolean().toBoolean(),
  body('order').optional().isInt({ min: 0 }).toInt(),
]

const pricingUpdateValidation = [
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty.').isLength({ max: 50 }),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.').isLength({ max: 150 }),
  body('price').optional().trim().notEmpty().withMessage('Price cannot be empty.').isLength({ max: 50 }),
  body('features').optional().isArray(),
  body('isPopular').optional().isBoolean().toBoolean(),
  body('isActive').optional().isBoolean().toBoolean(),
  body('order').optional().isInt({ min: 0 }).toInt(),
]

const router = Router()

const envSecret = process.env.ADMIN_SECRET_PATH || 'admin-portal'
const strippedSecret = envSecret.startsWith('admin-') ? envSecret.slice(6) : envSecret
const prefixedSecret = envSecret.startsWith('admin-') ? envSecret : `admin-${envSecret}`

const loginPaths = Array.from(
  new Set([
    `/${envSecret}`,
    `/${envSecret}/login`,
    `/${strippedSecret}`,
    `/${strippedSecret}/login`,
    `/${prefixedSecret}`,
    `/${prefixedSecret}/login`,
    `/login`,
    '/',
    '',
  ])
)

// Auth & Session
loginPaths.forEach((path) => {
  router.post(
    path,
    adminLoginLimiter,
    [body('email').isEmail().withMessage('Valid email required'), body('password').notEmpty().withMessage('Password required')],
    validateRequest,
    adminLogin
  )
})

router.post('/logout', adminLogout)
router.post('/refresh-token', adminRefreshToken)

// 2FA Endpoints
router.post('/2fa/setup', verifyToken, setup2FA)
router.post('/2fa/verify', verifyToken, verify2FA)
router.post('/2fa/login', login2FA)
router.post('/2fa/disable', verifyToken, disable2FA)


router.get('/me', verifyToken, getMe)
router.post(
  '/change-password',
  verifyToken,
  [
    body('currentPassword').notEmpty(),
    body('newPassword')
      .isLength({ min: 12 }).withMessage('New password must be at least 12 characters long')
      .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
      .matches(/[0-9]/).withMessage('New password must contain at least one number')
      .matches(/[^A-Za-z0-9]/).withMessage('New password must contain at least one special character'),
  ],
  validateRequest,
  changePassword
)

router.post(
  '/change-email',
  verifyToken,
  [
    body('newEmail').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  changeEmail
)

router.post(
  '/change-master-key',
  verifyToken,
  requireRole('SUPER_ADMIN'),
  [
    body('currentKey').notEmpty().withMessage('Current key is required'),
    body('newKey').isLength({ min: MIN_MASTER_KEY_LENGTH }).withMessage(`New key must be at least ${MIN_MASTER_KEY_LENGTH} characters`),
  ],
  validateRequest,
  changeMasterKey
)

router.get('/master-key-hint', verifyToken, requireRole('SUPER_ADMIN'), getMasterKeyHint)

// ── Dashboard stats ────────────────────────────────────────────
router.get('/stats', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), getDashboardStats)

// ── Leads ──────────────────────────────────────────────────────
router.get('/leads', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), getLeads)
router.patch('/leads/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), updateLeadStatus)
router.delete('/leads/:id', verifyToken, requireRole('SUPER_ADMIN'), deleteLead)
router.post(
  '/leads/import',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  uploadCsv.single('file'),
  bulkImportLeads
)

// ── Services ───────────────────────────────────────────────────
router.get('/services', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listServices)
router.post(
  '/services',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  serviceCreateValidation,
  validateRequest,
  createService
)
router.patch(
  '/services/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  serviceUpdateValidation,
  validateRequest,
  updateService
)
router.delete('/services/:id', verifyToken, requireRole('SUPER_ADMIN'), deleteService)

// ── Projects ───────────────────────────────────────────────────
router.get('/projects', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listProjects)
router.post(
  '/projects',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  projectCreateValidation,
  validateRequest,
  createProject
)
router.patch(
  '/projects/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  projectUpdateValidation,
  validateRequest,
  updateProject
)
router.delete('/projects/:id', verifyToken, requireRole('SUPER_ADMIN'), deleteProject)

// ── Team ───────────────────────────────────────────────────────
router.get('/team', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listTeam)
router.post(
  '/team',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  teamCreateValidation,
  validateRequest,
  createTeamMember
)
router.patch(
  '/team/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  teamUpdateValidation,
  validateRequest,
  updateTeamMember
)
router.delete('/team/:id', verifyToken, requireRole('SUPER_ADMIN'), deleteTeamMember)

// ── Testimonials ───────────────────────────────────────────────
router.get('/testimonials', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listTestimonials)
router.post(
  '/testimonials',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  testimonialCreateValidation,
  validateRequest,
  createTestimonial
)
router.patch(
  '/testimonials/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  testimonialUpdateValidation,
  validateRequest,
  updateTestimonial
)
router.delete('/testimonials/:id', verifyToken, requireRole('SUPER_ADMIN'), deleteTestimonial)

// ── FAQs ───────────────────────────────────────────────────────
router.get('/faqs', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listFaqs)
router.post(
  '/faqs',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  faqCreateValidation,
  validateRequest,
  createFaq
)
router.patch(
  '/faqs/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  faqUpdateValidation,
  validateRequest,
  updateFaq
)
router.delete('/faqs/:id', verifyToken, requireRole('SUPER_ADMIN'), deleteFaq)

// ── Pricing Packages ───────────────────────────────────────────
router.get('/pricing', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), adminListPricing)
router.post(
  '/pricing',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  pricingCreateValidation,
  validateRequest,
  adminCreatePricing
)
router.put(
  '/pricing/bulk',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  adminBulkUpdatePricing
)
router.patch(
  '/pricing/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  pricingUpdateValidation,
  validateRequest,
  adminUpdatePricing
)
router.delete('/pricing/:id', verifyToken, requireRole('SUPER_ADMIN'), adminDeletePricing)

// ── Site Settings ──────────────────────────────────────────────
router.patch('/settings', verifyToken, requireRole('SUPER_ADMIN'), updateSettings)

// ── Admin & Staff User Management ──────────────────────────────
router.get('/users', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listAdminUsers)
router.post('/users', verifyToken, requireRole('SUPER_ADMIN'), createAdminUser)
router.patch('/users/:id', verifyToken, requireRole('SUPER_ADMIN'), updateAdminUser)
router.delete('/users/:id', verifyToken, requireRole('SUPER_ADMIN'), deleteAdminUser)

// ── Client User Management ─────────────────────────────────────
router.get('/clients', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listClients)
router.post('/clients', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), createClientUser)
router.patch('/clients/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), updateClientUser)
router.delete('/clients/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), deleteClientUser)
router.post('/clients/:id/resend-welcome', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), resendClientWelcome)

// ── Global Search ──────────────────────────────────────────────
router.get('/search', verifyToken, globalSearch)



// ── Legal Pages ────────────────────────────────────────────────
router.get('/legal', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listLegalPages)
router.put('/legal/:pageType', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), updateLegalPage)

// ── Milestones ─────────────────────────────────────────────────
router.get('/milestones', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), getMilestones)
router.post(
  '/milestones',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  milestoneCreateValidation,
  validateRequest,
  createMilestone
)
router.patch(
  '/milestones/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  milestoneUpdateValidation,
  validateRequest,
  updateMilestone
)
router.delete('/milestones/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), deleteMilestone)

// ── Partners ───────────────────────────────────────────────────
router.get('/partners', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listPartners)
router.post(
  '/partners',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  partnerCreateValidation,
  validateRequest,
  createPartner
)
router.patch(
  '/partners/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  partnerUpdateValidation,
  validateRequest,
  updatePartner
)
router.delete('/partners/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), deletePartner)

// ── Careers ────────────────────────────────────────────────────
router.get('/careers', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listJobPostings)
router.post('/careers', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), createJobPosting)
router.patch('/careers/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), updateJobPosting)
router.delete('/careers/:id', verifyToken, requireRole('SUPER_ADMIN'), deleteJobPosting)

router.get('/applications', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listApplications)
router.patch(
  '/applications/:id/status',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  updateApplicationStatus
)
router.delete('/applications/:id', verifyToken, requireRole('SUPER_ADMIN'), deleteApplication)

// ── Client Projects ────────────────────────────────────────────
router.get('/client-projects', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), listClientProjects)
router.post(
  '/client-projects',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  createClientProject
)
router.patch(
  '/client-projects/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  updateClientProject
)
router.delete('/client-projects/:id', verifyToken, requireRole('SUPER_ADMIN'), deleteClientProject)

// ── Work Tasks ─────────────────────────────────────────────────
router.get('/tasks', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), listTasks)
router.post('/tasks', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), createTask)
router.patch('/tasks/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), updateTask)
router.delete('/tasks/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), deleteTask)

// ── Quick Notes ────────────────────────────────────────────────
router.get('/notes', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), listNotes)
router.post('/notes', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), createNote)
router.patch('/notes/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), updateNote)
router.delete('/notes/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), deleteNote)

// ── Activity Logs ──────────────────────────────────────────────
router.get('/activities', verifyToken, requireRole('SUPER_ADMIN'), listActivities)

// ── Support Tickets ────────────────────────────────────────────
router.get('/tickets', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), listAllTickets)
router.get('/tickets/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), getAdminTicketById)
router.post('/tickets/:id/messages', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), replyToTicketFromAdmin)
router.patch('/tickets/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), updateTicketStatus)
router.patch('/tickets/:id/assign', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), assignTicket)
router.get('/users/list-assignable', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), listAssignableAdmins)

// ── Project Billing Milestones ─────────────────────────────────
router.get('/client-projects/:id/billing', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), listProjectBillingMilestones)
router.post('/client-projects/:id/billing', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), createBillingMilestone)
router.patch('/billing/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), updateBillingMilestone)
router.delete('/billing/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), deleteBillingMilestone)

// ── Blog Posts ─────────────────────────────────────────────────
router.get('/blog', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), adminListPosts)
router.get('/blog/comments', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), adminListComments)
router.get('/blog/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), adminGetPost)
router.post(
  '/blog',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  blogPostCreateValidation,
  validateRequest,
  adminCreatePost
)
router.patch(
  '/blog/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  blogPostUpdateValidation,
  validateRequest,
  adminUpdatePost
)
router.delete('/blog/:id', verifyToken, requireRole('SUPER_ADMIN'), adminDeletePost)
router.patch('/blog/comments/:id/approve', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), adminApproveComment)
router.delete('/blog/comments/:id', verifyToken, requireRole('SUPER_ADMIN'), adminDeleteComment)

// ── Integration Config (Cloudinary, SMTP, reCAPTCHA, DB, JWT) ─
router.get('/integrations', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN'), verifyUnlockToken, getIntegrationConfig)
router.patch('/integrations', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN'), verifyUnlockToken, updateIntegrationConfig)
router.post('/integrations/test-smtp', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN'), verifyUnlockToken, testSmtpConnection)
router.post('/integrations/test-resend', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN'), verifyUnlockToken, testResendConnection)
router.post(
  '/integrations/test-cloudinary',
  verifyToken,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  verifyUnlockToken,
  testCloudinaryConnection
)
router.post(
  '/integrations/test-database',
  verifyToken,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  verifyUnlockToken,
  testDatabaseConnection
)
router.post(
  '/integrations/verify-key',
  verifyToken,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  verifyIntegrationKey
)
router.get('/integrations/check-unlock', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN'), checkUnlockToken)

// ── Recycle Bin Management ────────────────────────────────────
router.get('/recycle-bin', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), getDeletedItems)
router.post('/recycle-bin/restore', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), restoreItem)
router.delete('/recycle-bin/permanent/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), permanentlyDeleteItem)

// ── Complete Email Center ─────────────────────────────────────
router.get('/email/stats', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), getEmailDashboardStats)
router.get('/email/logs', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listEmailLogs)
router.get('/email/logs/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), getEmailLogById)
router.post('/email/send', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), sendManualEmail)
router.get('/email/templates', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listEmailTemplates)
router.post('/email/templates/preview', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), previewEmailTemplate)
router.get('/email/rules', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listAutomationRules)
router.patch('/email/rules/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), updateAutomationRule)
router.get('/email/settings', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), getEmailSettings)
router.patch('/email/settings', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), updateEmailSettings)
router.post('/email/test', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), testEmailConnection)
router.get('/email/recipients', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), getEligibleRecipients)

// Central Email & Contact Routing
router.get('/email/routing', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), getEmailRoutingHandler)
router.patch('/email/routing', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), updateEmailRoutingHandler)

// Multi-Account Email Management
router.get('/email/accounts', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listEmailAccounts)
router.post('/email/accounts', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), createEmailAccount)
router.get('/email/accounts/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), getEmailAccountById)
router.patch('/email/accounts/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), updateEmailAccount)
router.delete('/email/accounts/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), deleteEmailAccount)
router.post('/email/accounts/:id/test-smtp', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), testAccountSmtpHandler)
router.post('/email/accounts/:id/test-imap', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), testAccountImapHandler)
router.post('/email/accounts/:id/sync', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), syncAccountMailboxHandler)
router.post('/email/sync-all', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), syncAllAccountsHandler)

// Inbound & Outbound Messages / Inbox / CRM Linking
router.get('/email/messages', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), listEmailMessages)
router.get('/email/messages/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), getEmailMessageById)
router.patch('/email/messages/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), updateEmailMessage)
router.post('/email/messages/:id/reply', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), replyToEmailMessage)
router.post('/email/messages/:id/create-lead', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), createLeadFromEmailMessage)
router.delete('/email/messages/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), deleteEmailMessage)

export default router

/**
 * tests/setup.js — Global test setup
 *
 * Runs before every test file.
 * Sets up environment variables and global mocks.
 */

import { vi } from 'vitest'

// ── Environment variables — MUST be set before any src/ import ──
// env.js runs process.exit(1) when DATABASE_URL is missing.
// We set a placeholder so the guard passes in test mode.
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long-for-tests'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.CLIENT_URL = 'http://localhost:5173'
process.env.ADMIN_SECRET_PATH = 'test-admin-path'
process.env.PORT = '5001'
process.env.INTEGRATION_MASTER_KEY = 'test-master-key-12345'
// Skip real email sending in tests
process.env.EMAIL_USER = ''
process.env.EMAIL_PASS = ''
process.env.RESEND_API_KEY = ''
// Skip reCAPTCHA in tests (key not set = skip verification in contact.controller.js)
process.env.RECAPTCHA_SECRET_KEY = ''

// ── Mock mailer (never send real emails during tests) ─────────
vi.mock('../src/utils/mailer.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    sendEmail: vi.fn().mockImplementation(async (options) => {
      // Check automation rules and idempotency via actual implementation
      if (options?.event || options?.idempotencyKey) {
        return actual.sendEmail(options)
      }
      return { messageId: 'test-mock-message-id', ...options }
    }),
    verifyConnection: vi.fn().mockResolvedValue({ success: true, verified: true }),
  }
})

// ── Mock WhatsApp (never send real messages in tests) ─────────
vi.mock('../src/utils/whatsapp.js', () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ sid: 'test-twilio-sid' }),
}))

// ── Mock Cloudinary ───────────────────────────────────────────
// upload, uploadResume, uploadAttachment are all multer instances
// Each needs .single(), .array(), .fields() mocked as Express middleware
vi.mock('../src/utils/cloudinary.js', () => {
  const mockMulter = () => ({
    single: vi.fn(() => (_req, _res, next) => next()),
    array:  vi.fn(() => (_req, _res, next) => next()),
    fields: vi.fn(() => (_req, _res, next) => next()),
  })

  return {
    cloudinary: {
      config: vi.fn(),
      uploader: {
        upload:   vi.fn().mockResolvedValue({ secure_url: 'https://res.cloudinary.com/test/image.jpg', public_id: 'test-public-id' }),
        destroy:  vi.fn().mockResolvedValue({ result: 'ok' }),
      },
    },
    upload:           mockMulter(),
    uploadResume:     mockMulter(),
    uploadAttachment: mockMulter(),
    uploadToCloudinary:   vi.fn().mockResolvedValue({ secure_url: 'https://res.cloudinary.com/test/image.jpg', public_id: 'test-public-id' }),
    deleteFromCloudinary: vi.fn().mockResolvedValue({ result: 'ok' }),
  }
})

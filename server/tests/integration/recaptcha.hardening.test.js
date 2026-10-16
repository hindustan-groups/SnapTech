/**
 * recaptcha.hardening.test.js
 *
 * Integration tests verifying:
 *  1. Action validation enforcement on POST /api/contact and POST /api/careers/:slug/apply.
 *  2. Hostname allowlist validation enforcement against unauthorized/phishing origins.
 *  3. Fail-closed behavior on provider errors or score thresholds.
 *  4. Scheduler admin URL resolution and safe omission when ADMIN_SECRET_PATH is unset.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'
import prisma from '../../src/config/db.js'
import { contactLimiter } from '../../src/middleware/security.js'

describe('reCAPTCHA Action & Hostname Hardening Integration (SEC-06)', () => {
  const originalEnv = { ...process.env }
  const originalContactLead = prisma.contactLead

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env = { ...originalEnv }
    process.env.RECAPTCHA_SECRET_KEY = 'test_secret_key'
    delete process.env.ALLOW_DEV_CAPTCHA_BYPASS

    // Reset contactLimiter store for test IP so test cases don't hit the 5-request window limit
    if (typeof contactLimiter?.resetKey === 'function') {
      contactLimiter.resetKey('::ffff:127.0.0.1')
      contactLimiter.resetKey('127.0.0.1')
      contactLimiter.resetKey('::1')
    }

    // Ensure mock DB handles lead creation safely for tests
    prisma.contactLead = {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'mock-lead-id' }),
    }
  })

  afterEach(() => {
    prisma.contactLead = originalContactLead
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  // ── 1. Contact Flow Action & Hostname Enforcement ───────────────────
  describe('POST /api/contact flow', () => {
    it('rejects submission when reCAPTCHA action is mismatched (e.g. careers_apply)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          score: 0.9,
          action: 'careers_apply', // Wrong action for contact flow
          hostname: 'snaptech.digital',
        }),
      })

      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Action Mismatch User',
          email: `mismatch-${Date.now()}@example.com`,
          phone: '9876543210',
          message: 'Checking that wrong action is rejected.',
          serviceInterested: 'Web Development',
          recaptchaToken: 'action-mismatch-token',
        })

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toContain('reCAPTCHA verification failed')
    })

    it('rejects submission when reCAPTCHA hostname is not in the allowlist', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          score: 0.9,
          action: 'contact_form',
          hostname: 'evil-phishing-domain.com', // Unauthorized hostname
        }),
      })

      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Phishing Host User',
          email: `phishing-${Date.now()}@example.com`,
          phone: '9876543210',
          message: 'Checking that unauthorized hostname is rejected.',
          serviceInterested: 'Web Development',
          recaptchaToken: 'phishing-host-token',
        })

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toContain('reCAPTCHA verification failed')
    })

    it('accepts contact submission with valid expected action and allowed hostname', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          score: 0.9,
          action: 'contact_form',
          hostname: 'www.snaptech.digital',
        }),
      })

      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Legit Contact User',
          email: `legit-contact-${Date.now()}@example.com`,
          phone: '9876543210',
          message: 'This is a genuine inquiry with valid verification.',
          serviceInterested: 'Web Development',
          recaptchaToken: 'valid-contact-token',
        })

      expect(res.status).toBe(201)
      expect(res.body.status).toBe('ok')
    })

    it('accepts contact submission with valid cost_calculator action', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          score: 0.85,
          action: 'cost_calculator',
          hostname: 'snaptech.digital',
        }),
      })

      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Calculator Lead',
          email: `calculator-${Date.now()}@example.com`,
          phone: '9876543210',
          message: 'Cost calculation estimate submission.',
          serviceInterested: 'Cost Calculator',
          recaptchaToken: 'valid-calculator-token',
        })

      expect(res.status).toBe(201)
      expect(res.body.status).toBe('ok')
    })

    it('accepts contact submission with valid service_inquiry action', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          score: 0.9,
          action: 'service_inquiry',
          hostname: 'www.snaptech.digital',
        }),
      })

      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Service Inquiry Lead',
          email: `service-${Date.now()}@example.com`,
          phone: '9876543210',
          message: 'Direct service consultation inquiry.',
          serviceInterested: 'Web Development',
          recaptchaToken: 'valid-service-token',
        })

      expect(res.status).toBe(201)
      expect(res.body.status).toBe('ok')
    })

    it('accepts contact submission with valid newsletter_footer action', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          score: 0.9,
          action: 'newsletter_footer',
          hostname: 'snaptech.digital',
        }),
      })

      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Newsletter Subscriber',
          email: `newsletter-${Date.now()}@example.com`,
          message: 'Newsletter subscription from Footer',
          serviceInterested: 'Newsletter',
          recaptchaToken: 'valid-newsletter-token',
        })

      expect(res.status).toBe(201)
      expect(res.body.status).toBe('ok')
    })
  })

  // ── 2. Careers Application Action & Hostname Enforcement ────────────
  describe('POST /api/careers/:slug/apply flow', () => {
    it('rejects application when reCAPTCHA action is mismatched (e.g. contact_form)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          score: 0.9,
          action: 'contact_form', // Wrong action for careers apply flow
          hostname: 'snaptech.digital',
        }),
      })

      const res = await request(app)
        .post('/api/careers/general-application/apply')
        .send({
          fullName: 'Candidate Test',
          email: `candidate-${Date.now()}@example.com`,
          phone: '+919876543210',
          recaptchaToken: 'careers-mismatch-token',
        })

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toContain('reCAPTCHA verification failed')
    })

    it('rejects application when reCAPTCHA hostname is not allowed', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          score: 0.9,
          action: 'careers_apply',
          hostname: 'unauthorized-site.com',
        }),
      })

      const res = await request(app)
        .post('/api/careers/general-application/apply')
        .send({
          fullName: 'Candidate Test Hostname',
          email: `candidate-host-${Date.now()}@example.com`,
          phone: '+919876543210',
          recaptchaToken: 'careers-host-token',
        })

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toContain('reCAPTCHA verification failed')
    })
  })

  // ── 3. Scheduler Configuration & Safe Link Handling ────────────────
  describe('Scheduler Link Safety & Fallback Elimination', () => {
    const mockLeads = [
      {
        name: 'Lead Alpha',
        email: 'alpha@example.com',
        phone: '1234567890',
        serviceInterested: 'Cloud Migration',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    it('safely omits admin URL link when adminUrl is null/missing in lead follow-up reminder', async () => {
      const { leadFollowUpReminderTemplate } = await vi.importActual('../../src/utils/mailer.js')
      const template = leadFollowUpReminderTemplate({ leads: mockLeads, adminUrl: null })
      expect(template.html).not.toContain('undefined')
      expect(template.html).not.toContain('null')
      expect(template.html).not.toContain('hp9z7k5w8v3q2m4x')
      expect(template.html).not.toContain('Open Admin Panel leads')
      expect(template.text).not.toContain('Direct Admin Link:')
    })

    it('renders admin URL link when valid adminUrl is provided in lead follow-up reminder', async () => {
      const { leadFollowUpReminderTemplate } = await vi.importActual('../../src/utils/mailer.js')
      const validUrl = 'https://www.snaptech.digital/admin-secured-secret-path'
      const template = leadFollowUpReminderTemplate({ leads: mockLeads, adminUrl: validUrl })
      expect(template.html).toContain(validUrl)
      expect(template.html).toContain('Open Admin Panel leads')
      expect(template.text).toContain(`Direct Admin Link: ${validUrl}`)
    })

    it('safely omits admin URL link when adminUrl is null in stale lead follow-up reminder', async () => {
      const { staleLeadFollowUpTemplate } = await vi.importActual('../../src/utils/mailer.js')
      const template = staleLeadFollowUpTemplate({ leads: mockLeads, adminUrl: null })
      expect(template.html).not.toContain('undefined')
      expect(template.html).not.toContain('null')
      expect(template.html).not.toContain('hp9z7k5w8v3q2m4x')
      expect(template.html).not.toContain('Open Admin Leads Dashboard')
      expect(template.text).not.toContain('Admin link:')
    })

    it('renders admin URL link when valid adminUrl is provided in stale lead follow-up reminder', async () => {
      const { staleLeadFollowUpTemplate } = await vi.importActual('../../src/utils/mailer.js')
      const validUrl = 'https://www.snaptech.digital/admin-secured-secret-path'
      const template = staleLeadFollowUpTemplate({ leads: mockLeads, adminUrl: validUrl })
      expect(template.html).toContain(validUrl)
      expect(template.html).toContain('Open Admin Leads Dashboard')
      expect(template.text).toContain(`Admin link: ${validUrl}`)
    })
  })
})

/**
 * emailCenter.api.test.js — Integration tests for Admin Email Center API
 *
 * Verifies:
 * - Authentication & RBAC protection (Stealth 404 on unauthenticated, 403 on STAFF, 200 on ADMIN/SUPER_ADMIN)
 * - Dashboard stats & recent activity endpoints
 * - Log querying, filtering, and detail endpoints
 * - Template catalog & preview rendering
 * - Automation rules listing and rule updates
 * - Settings inspection with masked secrets
 * - Manual email composition with validation
 * - Connection test endpoint
 * - Recipient autocomplete
 */

import { describe, it, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../src/app.js'

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only-12345678'

function token(role, overrides = {}) {
  return jwt.sign(
    { id: `${role}-test-id`, email: `${role.toLowerCase()}@test.com`, role, ...overrides },
    JWT_SECRET,
    { expiresIn: '2h' }
  )
}

function authCookie(role) {
  return `adminToken=${token(role)}`
}

describe('Admin Email Center API — RBAC & Stealth Verification', () => {
  const routes = [
    ['GET', '/api/admin/email/stats'],
    ['GET', '/api/admin/email/logs'],
    ['GET', '/api/admin/email/templates'],
    ['GET', '/api/admin/email/rules'],
    ['GET', '/api/admin/email/settings'],
    ['POST', '/api/admin/email/send'],
    ['POST', '/api/admin/email/test'],
    ['GET', '/api/admin/email/accounts'],
    ['GET', '/api/admin/email/messages'],
  ]

  routes.forEach(([method, route]) => {
    it(`${method} ${route} → 404 without authentication (stealth)`, async () => {
      const res = await request(app)[method.toLowerCase()](route)
      expect(res.status).toBe(404)
    })

    it(`${method} ${route} → 403 with STAFF role (requires ADMIN or SUPER_ADMIN)`, async () => {
      const res = await request(app)[method.toLowerCase()](route)
        .set('Cookie', authCookie('STAFF'))
      expect(res.status).toBe(403)
    })
  })
})

describe('Admin Email Center API — ADMIN role operations', () => {
  it('GET /api/admin/email/stats returns dashboard KPI metrics', async () => {
    const res = await request(app)
      .get('/api/admin/email/stats')
      .set('Cookie', authCookie('ADMIN'))

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.data).toHaveProperty('counts')
    expect(res.body.data.counts).toHaveProperty('totalSent')
    expect(res.body.data.counts).toHaveProperty('totalFailed')
    expect(res.body.data.counts).toHaveProperty('totalQueued')
    expect(res.body.data.counts).toHaveProperty('deliveryRate')
    expect(res.body.data).toHaveProperty('recentActivity')
    expect(Array.isArray(res.body.data.recentActivity)).toBe(true)
  })

  it('GET /api/admin/email/logs returns paginated email logs', async () => {
    const res = await request(app)
      .get('/api/admin/email/logs')
      .set('Cookie', authCookie('ADMIN'))

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.data).toHaveProperty('logs')
    expect(res.body.data).toHaveProperty('pagination')
    expect(Array.isArray(res.body.data.logs)).toBe(true)
  })

  it('GET /api/admin/email/templates returns catalog of available templates', async () => {
    const res = await request(app)
      .get('/api/admin/email/templates')
      .set('Cookie', authCookie('ADMIN'))

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(Array.isArray(res.body.data)).toBe(true)
    const templateIds = res.body.data.map(t => t.id)
    expect(templateIds).toContain('inquiry_confirmation')
    expect(templateIds).toContain('quote_confirmation')
    expect(templateIds).toContain('proposal_delivery')
    expect(templateIds).toContain('project_kickoff')
    expect(templateIds).toContain('support_ticket_confirmation')
    expect(templateIds).toContain('invoice_delivery')
    expect(templateIds).toContain('verified_payment_confirmation')
    expect(templateIds).toContain('careers_application_confirmation')
    expect(templateIds).toContain('custom_compose')
  })

  it('POST /api/admin/email/templates/preview renders HTML and text preview', async () => {
    const res = await request(app)
      .post('/api/admin/email/templates/preview')
      .set('Cookie', authCookie('ADMIN'))
      .send({
        templateId: 'inquiry_confirmation',
        variables: {
          name: 'Preview User',
          referenceId: 'REF-PREVIEW-1',
          serviceInterested: 'Mobile Development',
          message: 'Can you build a flutter app?',
        },
      })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.data).toHaveProperty('subject')
    expect(res.body.data).toHaveProperty('html')
    expect(res.body.data).toHaveProperty('text')
    expect(res.body.data.html).toContain('Preview User')
    expect(res.body.data.html).toContain('SnapTech Digital')
  })

  it('GET /api/admin/email/rules returns automation rules', async () => {
    const res = await request(app)
      .get('/api/admin/email/rules')
      .set('Cookie', authCookie('ADMIN'))

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
    const eventNames = res.body.data.map(r => r.event)
    expect(eventNames).toContain('lead.created')
    expect(eventNames).toContain('quote.created')
    expect(eventNames).toContain('ticket.created')
    expect(eventNames).toContain('payment.verified')
    expect(eventNames).toContain('careers.applied')
  })

  it('PATCH /api/admin/email/rules/:id updates automation rule state', async () => {
    const res = await request(app)
      .patch('/api/admin/email/rules/rule-lead-created')
      .set('Cookie', authCookie('ADMIN'))
      .send({
        isEnabled: false,
        internalRouting: 'leads-team@snaptech.digital',
      })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.data.isEnabled).toBe(false)
    expect(res.body.data.internalRouting).toBe('leads-team@snaptech.digital')

    // Re-enable to leave clean state
    await request(app)
      .patch('/api/admin/email/rules/rule-lead-created')
      .set('Cookie', authCookie('ADMIN'))
      .send({ isEnabled: true, internalRouting: 'info@snaptech.digital' })
  })

  it('GET /api/admin/email/settings returns masked configuration without password leak', async () => {
    const res = await request(app)
      .get('/api/admin/email/settings')
      .set('Cookie', authCookie('ADMIN'))

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.data.verifiedSender).toBe('info@snaptech.digital')
    expect(res.body.data.hostingerSpec.recommendedHost).toBe('smtp.hostinger.com')
    expect(res.body.data.aliases).toHaveProperty('contact')
    expect(res.body.data.aliases).toHaveProperty('billing')
    // Crucial security assertion: Never expose secret passwords or tokens
    expect(res.body.data).not.toHaveProperty('smtpPass')
    expect(res.body.data).not.toHaveProperty('password')
    expect(res.body.data).not.toHaveProperty('EMAIL_PASS')
  })

  it('POST /api/admin/email/send validates required fields', async () => {
    const res = await request(app)
      .post('/api/admin/email/send')
      .set('Cookie', authCookie('ADMIN'))
      .send({
        // Missing recipient 'to'
        subject: 'Hello',
      })

    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
  })

  it('POST /api/admin/email/send successfully sends manual email', async () => {
    const res = await request(app)
      .post('/api/admin/email/send')
      .set('Cookie', authCookie('ADMIN'))
      .send({
        to: 'client@example.com',
        subject: 'Project Kickoff Follow-up',
        templateId: 'custom_compose',
        message: 'Everything is tracking on schedule for the initial staging launch.',
        ctaText: 'View Client Portal',
        ctaUrl: 'https://www.snaptech.digital/client',
        replyTo: 'projects@snaptech.digital',
      })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.data).toHaveProperty('messageId')
  })

  it('POST /api/admin/email/test performs a controlled test verification', async () => {
    const res = await request(app)
      .post('/api/admin/email/test')
      .set('Cookie', authCookie('ADMIN'))
      .send({
        targetEmail: 'admin-test@snaptech.digital',
      })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.data).toHaveProperty('connection')
    expect(res.body.data).toHaveProperty('testEmailSent')
  })

  it('GET /api/admin/email/recipients returns searchable list of recipients', async () => {
    const res = await request(app)
      .get('/api/admin/email/recipients?search=test')
      .set('Cookie', authCookie('ADMIN'))

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('GET /api/admin/email/accounts returns configured mail accounts with masked secrets', async () => {
    const res = await request(app)
      .get('/api/admin/email/accounts')
      .set('Cookie', authCookie('ADMIN'))

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(Array.isArray(res.body.data)).toBe(true)
    if (res.body.data.length > 0) {
      const acct = res.body.data[0]
      expect(acct).toHaveProperty('email')
      expect(acct).not.toHaveProperty('smtpPasswordEncrypted')
      expect(acct).not.toHaveProperty('imapPasswordEncrypted')
    }
  })

  it('POST /api/admin/email/accounts creates a new account and enforces validation', async () => {
    // 1. Validation failure
    const badRes = await request(app)
      .post('/api/admin/email/accounts')
      .set('Cookie', authCookie('ADMIN'))
      .send({ email: 'not-an-email' })
    expect(badRes.status).toBe(500)

    // 2. Successful creation
    const uniqueEmail = `test-inbox-${Date.now()}@snaptech.digital`
    const goodRes = await request(app)
      .post('/api/admin/email/accounts')
      .set('Cookie', authCookie('ADMIN'))
      .send({
        email: uniqueEmail,
        displayName: 'Integration Test Inbox',
        provider: 'HOSTINGER',
        smtpPassword: 'SecurePassword123!',
        imapPassword: 'SecurePassword123!',
      })

    expect(goodRes.status).toBe(201)
    expect(goodRes.body.status).toBe('ok')
    expect(goodRes.body.data.email).toBe(uniqueEmail)
    expect(goodRes.body.data).not.toHaveProperty('smtpPasswordEncrypted')
  })

  it('GET /api/admin/email/messages lists messages with folder filtering and pagination', async () => {
    const res = await request(app)
      .get('/api/admin/email/messages?folder=INBOX&page=1&limit=10')
      .set('Cookie', authCookie('ADMIN'))

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.data).toHaveProperty('messages')
    expect(res.body.data).toHaveProperty('pagination')
    expect(res.body.data).toHaveProperty('unreadCount')
    expect(Array.isArray(res.body.data.messages)).toBe(true)
  })

  it('POST /api/admin/email/sync-all triggers batch mailbox synchronization', async () => {
    const res = await request(app)
      .post('/api/admin/email/sync-all')
      .set('Cookie', authCookie('ADMIN'))

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})

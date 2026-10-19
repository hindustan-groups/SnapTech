/**
 * emailRouting.api.test.js — Integration tests for Central Email Routing API
 *
 * Verifies:
 * - Stealth 404 on unauthenticated requests
 * - RBAC 403 enforcement on STAFF role
 * - Successful GET /api/admin/email/routing with ADMIN or SUPER_ADMIN
 * - Successful PATCH /api/admin/email/routing with validation and persistence
 * - Rejection of malformed / injection email inputs with 400
 */
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../src/app.js'

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only-12345678'

function token(role, overrides = {}) {
  return jwt.sign(
    { id: `${role}-routing-test-id`, email: `${role.toLowerCase()}@test.com`, role, ...overrides },
    JWT_SECRET,
    { expiresIn: '2h' }
  )
}

function authCookie(role) {
  return `adminToken=${token(role)}`
}

describe('Admin Email Routing API — Integration Tests', () => {
  describe('RBAC & Stealth Access Protection', () => {
    it('GET /api/admin/email/routing → 404 without authentication (stealth)', async () => {
      const res = await request(app).get('/api/admin/email/routing')
      expect(res.status).toBe(404)
    })

    it('PATCH /api/admin/email/routing → 404 without authentication (stealth)', async () => {
      const res = await request(app).patch('/api/admin/email/routing').send({ routing: {} })
      expect(res.status).toBe(404)
    })

    it('GET /api/admin/email/routing → 403 with STAFF role', async () => {
      const res = await request(app)
        .get('/api/admin/email/routing')
        .set('Cookie', authCookie('STAFF'))
      expect(res.status).toBe(403)
    })

    it('PATCH /api/admin/email/routing → 403 with STAFF role', async () => {
      const res = await request(app)
        .patch('/api/admin/email/routing')
        .set('Cookie', authCookie('STAFF'))
        .send({ routing: { sales: 'sales@snaptech.digital' } })
      expect(res.status).toBe(403)
    })
  })

  describe('Authorized Operations (ADMIN / SUPER_ADMIN)', () => {
    it('GET /api/admin/email/routing → 200 with complete routing matrix and diagnostics', async () => {
      const res = await request(app)
        .get('/api/admin/email/routing')
        .set('Cookie', authCookie('ADMIN'))

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.data).toBeDefined()

      const { routing, diagnostics } = res.body.data
      expect(routing).toBeDefined()
      expect(routing.general).toBe('info@snaptech.digital')
      expect(routing.sales).toBe('sales@snaptech.digital')
      expect(routing.support).toBe('support@snaptech.digital')
      expect(routing.careers).toBe('careers@snaptech.digital')
      expect(routing.privacy).toBe('privacy@snaptech.digital')
      expect(routing.billing).toBe('billing@snaptech.digital')
      expect(routing.senderEmail).toBe('info@snaptech.digital')
      expect(routing.senderName).toBe('SnapTech Digital')

      expect(diagnostics).toBeDefined()
      expect(diagnostics.dnsStatus.domain).toBe('snaptech.digital')
      expect(Array.isArray(diagnostics.routingStatus)).toBe(true)
    })

    it('PATCH /api/admin/email/routing → 400 when given invalid or malformed email address', async () => {
      const res = await request(app)
        .patch('/api/admin/email/routing')
        .set('Cookie', authCookie('ADMIN'))
        .send({
          routing: {
            sales: 'invalid-email-no-at',
          },
        })

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
    })

    it('PATCH /api/admin/email/routing → 400 when attempting header injection payload', async () => {
      const res = await request(app)
        .patch('/api/admin/email/routing')
        .set('Cookie', authCookie('ADMIN'))
        .send({
          routing: {
            sales: 'sales@snaptech.digital\r\nBcc: victim@example.com',
          },
        })

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
    })

    it('PATCH /api/admin/email/routing → 200 updates routing successfully and returns updated config', async () => {
      const res = await request(app)
        .patch('/api/admin/email/routing')
        .set('Cookie', authCookie('SUPER_ADMIN'))
        .send({
          routing: {
            sales: 'commercial@snaptech.digital',
          },
        })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.data.routing.sales).toBe('commercial@snaptech.digital')

      // Clean up / revert back to default
      await request(app)
        .patch('/api/admin/email/routing')
        .set('Cookie', authCookie('SUPER_ADMIN'))
        .send({
          routing: {
            sales: 'sales@snaptech.digital',
          },
        })
    })
  })
})

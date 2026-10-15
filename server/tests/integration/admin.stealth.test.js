/**
 * admin.stealth.test.js — Integration tests for SEC-03: Admin stealth access control and authentication
 */

import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'

const SECRET_PATH = process.env.ADMIN_SECRET_PATH || 'test-admin-path'
const VALID_EMAIL = 'info@snaptech.digital'
const VALID_PASSWORD = 'Admin@123456'

describe('Admin Stealth Access Control & Authentication (SEC-03)', () => {
  // ── 1. Stealth Header Enforcement on /api/admin/login ──────────
  it('returns 404 on POST /api/admin/login when x-admin-path header is missing', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD })

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/cannot post \/api\/admin\/login/i)
  })

  it('returns 404 on POST /api/admin/login when x-admin-path header is incorrect', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .set('x-admin-path', 'wrong-guess-path')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD })

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/cannot post \/api\/admin\/login/i)
  })

  it('allows access to authentication logic on POST /api/admin/login with correct x-admin-path header', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .set('x-admin-path', SECRET_PATH)
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD })

    // If allowed through hideAdminRoutes, response is 200 (auth success/2fa) or 401 (if mock password differs), but NOT 404
    expect(res.status).not.toBe(404)
    expect([200, 401, 403]).toContain(res.status)
    expect(res.body).toHaveProperty('status')
  })

  // ── 2. URL Path-Based Secret Login ─────────────────────────────
  it('allows access to authentication logic on POST /api/admin/:secret/login with correct secret', async () => {
    const res = await request(app)
      .post(`/api/admin/${SECRET_PATH}/login`)
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD })

    expect(res.status).not.toBe(404)
    expect([200, 401, 403]).toContain(res.status)
  })

  it('allows access to authentication logic on POST /api/admin/admin-:secret/login with prefixed secret', async () => {
    const prefixed = SECRET_PATH.startsWith('admin-') ? SECRET_PATH : `admin-${SECRET_PATH}`
    const res = await request(app)
      .post(`/api/admin/${prefixed}/login`)
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD })

    expect(res.status).not.toBe(404)
    expect([200, 401, 403]).toContain(res.status)
  })

  it('returns 404 on POST /api/admin/:secret/login with wrong secret', async () => {
    const res = await request(app)
      .post('/api/admin/unauthorized-secret-slug/login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD })

    expect(res.status).toBe(404)
  })

  it('returns 404 on POST /api/admin/admin-login without valid secret', async () => {
    const res = await request(app)
      .post('/api/admin/admin-login')
      .send({ email: VALID_EMAIL, password: VALID_PASSWORD })

    expect(res.status).toBe(404)
  })

  // ── 3. Real Credential Verification is Enforced ─────────────────
  it('rejects invalid password with 401 even when correct x-admin-path header is present', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .set('x-admin-path', SECRET_PATH)
      .send({ email: VALID_EMAIL, password: 'WrongPassword@999' })

    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toMatch(/invalid credentials/i)
  })

  it('rejects unknown admin email with 401 even when correct x-admin-path header is present', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .set('x-admin-path', SECRET_PATH)
      .send({ email: 'nonexistent@snaptech.digital', password: 'SomePassword@123' })

    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.message).toMatch(/invalid credentials/i)
  })

  // ── 4. Protected Admin Endpoints Return 404 Unauthenticated ────
  it('returns 404 on unauthenticated access to /api/admin/services', async () => {
    const res = await request(app).get('/api/admin/services')
    expect(res.status).toBe(404)
  })

  it('returns 404 on unauthenticated access to /api/admin/leads', async () => {
    const res = await request(app).get('/api/admin/leads')
    expect(res.status).toBe(404)
  })
})

/**
 * tests/integration/masterKey.api.test.js
 *
 * Integration tests for Master Key endpoints (SEC-02 Remediation):
 *  - POST /api/admin/integrations/verify-key
 *  - POST /api/admin/change-master-key
 *
 * Verifies:
 *  1. Successful unlock with configured valid master key.
 *  2. Rejection of incorrect keys (401).
 *  3. Rejection of legacy hardcoded fallback keys (401).
 *  4. Fail-closed behavior (500) when master key is missing or invalid.
 *  5. Rejection of new master keys shorter than MIN_MASTER_KEY_LENGTH (400).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../src/app.js'
import prisma from '../../src/config/db.js'

const JWT_SECRET = process.env.JWT_SECRET

function adminAuthCookie(role = 'SUPER_ADMIN') {
  const tok = jwt.sign(
    { id: 'admin-mock-1', email: 'admin@test.com', role },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
  return `adminToken=${tok}`
}

describe('Master Key Integration API — SEC-02', () => {
  const originalKey = process.env.INTEGRATION_MASTER_KEY
  const VALID_MASTER_KEY = 'configured-production-master-key-32chars!'
  const LEGACY_KEY_1 = 'HiPro@Integrations#2025'
  const LEGACY_KEY_2 = 'HiPro@Integrations'

  beforeEach(() => {
    process.env.INTEGRATION_MASTER_KEY = VALID_MASTER_KEY
  })

  afterEach(() => {
    process.env.INTEGRATION_MASTER_KEY = originalKey
    vi.restoreAllMocks()
  })

  describe('POST /api/admin/integrations/verify-key', () => {
    it('returns 200 and unlockToken for correct master key', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)

      const res = await request(app)
        .post('/api/admin/integrations/verify-key')
        .set('Cookie', adminAuthCookie())
        .send({ key: VALID_MASTER_KEY })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.unlockToken).toBeDefined()

      // Verify unlockToken is a valid JWT
      const decoded = jwt.verify(res.body.unlockToken, JWT_SECRET)
      expect(decoded.purpose).toBe('integration_unlock')
    })

    it('returns 401 when given an incorrect master key', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)

      const res = await request(app)
        .post('/api/admin/integrations/verify-key')
        .set('Cookie', adminAuthCookie())
        .send({ key: 'wrong-key-attempt-at-least-16-chars' })

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toMatch(/incorrect key/i)
    })

    it('returns 401 when attempting to use legacy hardcoded fallback keys', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)

      const res1 = await request(app)
        .post('/api/admin/integrations/verify-key')
        .set('Cookie', adminAuthCookie())
        .send({ key: LEGACY_KEY_1 })

      expect(res1.status).toBe(401)

      const res2 = await request(app)
        .post('/api/admin/integrations/verify-key')
        .set('Cookie', adminAuthCookie())
        .send({ key: LEGACY_KEY_2 })

      expect(res2.status).toBe(401)
    })

    it('returns 400 when key is missing or empty', async () => {
      const res = await request(app)
        .post('/api/admin/integrations/verify-key')
        .set('Cookie', adminAuthCookie())
        .send({ key: '' })

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
    })

    it('fails closed (500) when master key is unconfigured on server', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      delete process.env.INTEGRATION_MASTER_KEY

      const res = await request(app)
        .post('/api/admin/integrations/verify-key')
        .set('Cookie', adminAuthCookie())
        .send({ key: VALID_MASTER_KEY })

      expect(res.status).toBe(500)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toMatch(/not configured/i)
    })

    it('fails closed (500) when master key is shorter than 16 characters', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      process.env.INTEGRATION_MASTER_KEY = 'short-key'

      const res = await request(app)
        .post('/api/admin/integrations/verify-key')
        .set('Cookie', adminAuthCookie())
        .send({ key: 'short-key' })

      expect(res.status).toBe(500)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toMatch(/not configured/i)
    })
  })

  describe('POST /api/admin/change-master-key', () => {
    it('rejects new keys shorter than 16 characters with 400', async () => {
      const res = await request(app)
        .post('/api/admin/change-master-key')
        .set('Cookie', adminAuthCookie())
        .send({
          currentKey: VALID_MASTER_KEY,
          newKey: 'short-new-key', // 13 chars (< 16)
        })

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toMatch(/at least 16 characters/i)
    })

    it('rejects update with 401 if current key is incorrect', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)

      const res = await request(app)
        .post('/api/admin/change-master-key')
        .set('Cookie', adminAuthCookie())
        .send({
          currentKey: 'wrong-current-key-long-enough',
          newKey: 'new-valid-secure-key-32-chars-length!',
        })

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toMatch(/incorrect/i)
    })
  })
})

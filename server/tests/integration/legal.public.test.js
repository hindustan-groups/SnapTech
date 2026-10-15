/**
 * tests/integration/legal.public.test.js
 *
 * Regression tests for SEC-01: Public Legal API Email Exposure.
 * Validates that GET /api/legal/:pageType:
 *  1. Returns legitimate legal content, title, and lastUpdated date.
 *  2. Strips internal administrator email metadata (adminEmail).
 *  3. Strips internal administrative ID references (updatedBy).
 *  4. Contains no corporate email strings in response payloads.
 */

import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'

describe('Public Legal API — SEC-01 Remediation', () => {
  describe('GET /api/legal/privacy_policy', () => {
    it('returns 200 with public legal page data and strips internal admin metadata', async () => {
      const res = await request(app).get('/api/legal/privacy_policy')

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.data).toBeDefined()

      const data = res.body.data

      // Legitimate public legal fields must be present
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('pageType', 'PRIVACY_POLICY')
      expect(data).toHaveProperty('title')
      expect(data).toHaveProperty('content')
      expect(data).toHaveProperty('lastUpdated')
      expect(typeof data.content).toBe('string')
      expect(data.content.length).toBeGreaterThan(20)

      // SEC-01: Internal metadata must be completely stripped from public DTO
      expect(data.adminEmail).toBeUndefined()
      expect(data.updatedBy).toBeUndefined()
      expect(Object.keys(data).sort()).toEqual(['content', 'id', 'lastUpdated', 'pageType', 'title'])

      // The entire response payload must not contain administrative email addresses
      const rawBody = JSON.stringify(res.body)
      expect(rawBody).not.toMatch(/admin@hindustanprojects\.com/i)
      expect(rawBody).not.toMatch(/adminEmail/i)
      expect(rawBody).not.toMatch(/updatedBy/i)
    })
  })

  describe('GET /api/legal/terms_of_service', () => {
    it('returns terms of service without internal admin email disclosure', async () => {
      const res = await request(app).get('/api/legal/terms_of_service')

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.data.pageType).toBe('TERMS_OF_SERVICE')
      expect(res.body.data.content).toBeDefined()

      // Ensure no admin email is disclosed and exact key contract is met
      expect(res.body.data.adminEmail).toBeUndefined()
      expect(res.body.data.updatedBy).toBeUndefined()
      expect(Object.keys(res.body.data).sort()).toEqual(['content', 'id', 'lastUpdated', 'pageType', 'title'])
      expect(JSON.stringify(res.body)).not.toMatch(/adminEmail/i)
    })
  })

  describe('GET /api/legal/refund_policy', () => {
    it('returns refund policy without internal admin email disclosure', async () => {
      const res = await request(app).get('/api/legal/refund_policy')

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.data.pageType).toBe('REFUND_POLICY')
      expect(res.body.data.content).toBeDefined()

      expect(res.body.data.adminEmail).toBeUndefined()
      expect(res.body.data.updatedBy).toBeUndefined()
      expect(Object.keys(res.body.data).sort()).toEqual(['content', 'id', 'lastUpdated', 'pageType', 'title'])
      expect(JSON.stringify(res.body)).not.toMatch(/adminEmail/i)
    })
  })

  describe('GET /api/legal/non_existent_page', () => {
    it('returns 404 with standard error format', async () => {
      const res = await request(app).get('/api/legal/non_existent_page')

      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toMatch(/not found/i)
    })
  })
})

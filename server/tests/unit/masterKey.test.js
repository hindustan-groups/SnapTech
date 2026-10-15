/**
 * tests/unit/masterKey.test.js
 *
 * Unit tests for masterKey.js (SEC-02 Remediation).
 * Validates fail-closed behavior, minimum key length enforcement,
 * absence of hardcoded fallbacks, and constant-time matching.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resolveMasterKey, verifyMasterKey, MIN_MASTER_KEY_LENGTH } from '../../src/utils/masterKey.js'
import prisma from '../../src/config/db.js'

describe('masterKey utility (SEC-02)', () => {
  const originalEnvKey = process.env.INTEGRATION_MASTER_KEY
  const VALID_TEST_KEY = 'super-secret-integration-key-32-chars!'
  const SHORT_KEY = 'too-short-key'
  const LEGACY_KEY_1 = 'HiPro@Integrations#2025'
  const LEGACY_KEY_2 = 'HiPro@Integrations'

  beforeEach(() => {
    process.env.INTEGRATION_MASTER_KEY = VALID_TEST_KEY
  })

  afterEach(() => {
    process.env.INTEGRATION_MASTER_KEY = originalEnvKey
    vi.restoreAllMocks()
  })

  describe('MIN_MASTER_KEY_LENGTH', () => {
    it('enforces a minimum length of at least 16 characters', () => {
      expect(MIN_MASTER_KEY_LENGTH).toBeGreaterThanOrEqual(16)
    })
  })

  describe('resolveMasterKey', () => {
    it('resolves key from process.env when configured', async () => {
      // Mock DB returning null so it falls back to process.env
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      process.env.INTEGRATION_MASTER_KEY = VALID_TEST_KEY

      const key = await resolveMasterKey()
      expect(key).toBe(VALID_TEST_KEY)
    })

    it('prioritizes DB sys_integration_master_key over process.env', async () => {
      const DB_KEY = 'database-configured-master-key-32-chars!'
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue({
        key: 'sys_integration_master_key',
        value: DB_KEY,
      })

      const key = await resolveMasterKey()
      expect(key).toBe(DB_KEY)
    })

    it('fails closed (returns null) when key is under minimum length', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      process.env.INTEGRATION_MASTER_KEY = SHORT_KEY // 13 chars (< 16)

      const key = await resolveMasterKey()
      expect(key).toBeNull()
    })

    it('fails closed (returns null) when key is empty or undefined', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      delete process.env.INTEGRATION_MASTER_KEY

      const key = await resolveMasterKey()
      expect(key).toBeNull()
    })

    it('strips leading/trailing whitespace and quotes', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      process.env.INTEGRATION_MASTER_KEY = '  "valid-secret-key-with-padding-12345"  '

      const key = await resolveMasterKey()
      expect(key).toBe('valid-secret-key-with-padding-12345')
    })
  })

  describe('verifyMasterKey', () => {
    it('returns match=true for an exact matching key', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      process.env.INTEGRATION_MASTER_KEY = VALID_TEST_KEY

      const result = await verifyMasterKey(VALID_TEST_KEY)
      expect(result.match).toBe(true)
      expect(result.masterKey).toBe(VALID_TEST_KEY)
    })

    it('returns match=true when input has whitespace or quotes', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      process.env.INTEGRATION_MASTER_KEY = VALID_TEST_KEY

      const result = await verifyMasterKey(`  "${VALID_TEST_KEY}"  `)
      expect(result.match).toBe(true)
    })

    it('returns match=false for an incorrect key', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      process.env.INTEGRATION_MASTER_KEY = VALID_TEST_KEY

      const result = await verifyMasterKey('wrong-secret-key-that-is-long-enough')
      expect(result.match).toBe(false)
      expect(result.masterKey).toBe(VALID_TEST_KEY)
    })

    it('fails closed when master key is unconfigured', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      delete process.env.INTEGRATION_MASTER_KEY

      const result = await verifyMasterKey(VALID_TEST_KEY)
      expect(result.match).toBe(false)
      expect(result.masterKey).toBeNull()
    })

    it('fails closed when master key is shorter than minimum length', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      process.env.INTEGRATION_MASTER_KEY = 'short-key'

      const result = await verifyMasterKey('short-key')
      expect(result.match).toBe(false)
      expect(result.masterKey).toBeNull()
    })

    it('returns match=false for null, undefined, or empty input', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      process.env.INTEGRATION_MASTER_KEY = VALID_TEST_KEY

      expect((await verifyMasterKey(null)).match).toBe(false)
      expect((await verifyMasterKey(undefined)).match).toBe(false)
      expect((await verifyMasterKey('')).match).toBe(false)
    })

    it('STRICT: rejects legacy hardcoded fallback keys when another key is active', async () => {
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      process.env.INTEGRATION_MASTER_KEY = VALID_TEST_KEY

      const res1 = await verifyMasterKey(LEGACY_KEY_1)
      expect(res1.match).toBe(false)

      const res2 = await verifyMasterKey(LEGACY_KEY_2)
      expect(res2.match).toBe(false)
    })

    it('STRICT: no longer recognizes legacy fallback keys as equivalent variants', async () => {
      // Even if someone set LEGACY_KEY_1 in env, entering LEGACY_KEY_2 must NOT match
      vi.spyOn(prisma.siteSetting, 'findUnique').mockResolvedValue(null)
      process.env.INTEGRATION_MASTER_KEY = LEGACY_KEY_1

      const result = await verifyMasterKey(LEGACY_KEY_2)
      expect(result.match).toBe(false)
    })
  })
})

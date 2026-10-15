/**
 * recaptcha.test.js — Unit tests for verifyRecaptcha fail-closed security properties
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { verifyRecaptcha } from '../../src/utils/recaptcha.js'

describe('verifyRecaptcha utility (SEC-06 fail-closed)', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env = { ...originalEnv }
    delete process.env.ALLOW_DEV_CAPTCHA_BYPASS
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  // ── 1. Invalid / Malformed / Empty Tokens ─────────────────────────
  it('rejects null token', async () => {
    const result = await verifyRecaptcha(null)
    expect(result).toBe(false)
  })

  it('rejects undefined token', async () => {
    const result = await verifyRecaptcha(undefined)
    expect(result).toBe(false)
  })

  it('rejects empty string token', async () => {
    const result = await verifyRecaptcha('')
    expect(result).toBe(false)
  })

  it('rejects whitespace-only token', async () => {
    const result = await verifyRecaptcha('    ')
    expect(result).toBe(false)
  })

  it('rejects non-string token (e.g. number or object)', async () => {
    const result = await verifyRecaptcha(12345)
    expect(result).toBe(false)
  })

  // ── 2. Production Fail-Closed on Missing Secret ───────────────────
  it('fails closed in production when RECAPTCHA_SECRET_KEY is missing', async () => {
    process.env.NODE_ENV = 'production'
    delete process.env.RECAPTCHA_SECRET_KEY

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await verifyRecaptcha('valid-looking-token')

    expect(result).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('RECAPTCHA_SECRET_KEY is not configured in production')
    )
  })

  // ── 3. Production Rejects Dummy Test Tokens ────────────────────────
  it('rejects dummy test token "dev-token" in production even if secret is configured', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const result = await verifyRecaptcha('dev-token')

    expect(result).toBe(false)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('rejects dummy test token "mock-token" in production', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    const result = await verifyRecaptcha('mock-token')
    expect(result).toBe(false)
  })

  // ── 4. Provider Failures Follow Fail-Closed Policy ─────────────────
  it('fails closed when provider returns HTTP 500 error', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const result = await verifyRecaptcha('some-real-client-token')
    expect(result).toBe(false)
  })

  it('fails closed when provider request times out or network drops', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network connection reset'))

    const result = await verifyRecaptcha('some-real-client-token')
    expect(result).toBe(false)
  })

  it('fails closed when provider returns success: false', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: false,
        'error-codes': ['invalid-input-response'],
      }),
    })

    const result = await verifyRecaptcha('expired-token')
    expect(result).toBe(false)
  })

  it('fails closed when score is below 0.5 threshold (bot detection)', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        score: 0.3, // below 0.5 threshold
        action: 'contact_form',
      }),
    })

    const result = await verifyRecaptcha('bot-token')
    expect(result).toBe(false)
  })

  // ── 5. Successful Verification ────────────────────────────────────
  it('succeeds when provider confirms success and score >= 0.5', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        score: 0.9,
        action: 'contact_form',
      }),
    })

    const result = await verifyRecaptcha('legitimate-human-token', '192.168.1.100')
    expect(result).toBe(true)
  })

  // ── 6. Gated Non-Production Test Bypass ────────────────────────────
  it('allows test token in test environment when secret key is unset', async () => {
    process.env.NODE_ENV = 'test'
    delete process.env.RECAPTCHA_SECRET_KEY

    const result = await verifyRecaptcha('mock-token')
    expect(result).toBe(true)
  })

  it('fails in test environment when random unknown token is used and secret is unset', async () => {
    process.env.NODE_ENV = 'test'
    delete process.env.RECAPTCHA_SECRET_KEY

    const result = await verifyRecaptcha('random-unrecognized-token')
    expect(result).toBe(false)
  })

  // ── 7. Action Validation (SEC-06 hardening) ────────────────────────
  it('rejects response when action does not match expected single action', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        score: 0.9,
        action: 'careers_apply', // Mismatched action
        hostname: 'snaptech.digital',
      }),
    })

    const result = await verifyRecaptcha('valid-token', '127.0.0.1', {
      expectedAction: 'contact_form',
    })
    expect(result).toBe(false)
  })

  it('rejects response when action is not in allowed actions array', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        score: 0.9,
        action: 'unauthorized_action',
        hostname: 'snaptech.digital',
      }),
    })

    const result = await verifyRecaptcha('valid-token', '127.0.0.1', {
      expectedAction: ['contact_form', 'cost_calculator', 'pricing_quote'],
    })
    expect(result).toBe(false)
  })

  it('succeeds when action matches expected single action', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

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

    const result = await verifyRecaptcha('valid-token', '127.0.0.1', {
      expectedAction: 'contact_form',
    })
    expect(result).toBe(true)
  })

  it('succeeds when action matches one of the allowed actions in array', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        score: 0.9,
        action: 'pricing_quote',
        hostname: 'snaptech.digital',
      }),
    })

    const result = await verifyRecaptcha('valid-token', '127.0.0.1', {
      expectedAction: ['contact_form', 'cost_calculator', 'pricing_quote', 'homepage_quote'],
    })
    expect(result).toBe(true)
  })

  // ── 8. Hostname Validation ─────────────────────────────────────────
  it('rejects response with unauthorized/phishing hostname', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        score: 0.9,
        action: 'contact_form',
        hostname: 'evil-phishing.com', // Unauthorized host
      }),
    })

    const result = await verifyRecaptcha('valid-token', '127.0.0.1', {
      expectedAction: 'contact_form',
    })
    expect(result).toBe(false)
  })

  it('accepts response from authorized production hostnames', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        score: 0.9,
        action: 'contact_form',
        hostname: 'snaptech.digital',
      }),
    })

    const result = await verifyRecaptcha('valid-token', '127.0.0.1', {
      expectedAction: 'contact_form',
    })
    expect(result).toBe(true)
  })

  it('accepts response from authorized Vercel preview deploys', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        score: 0.9,
        action: 'contact_form',
        hostname: 'snaptech-preview-feat.vercel.app',
      }),
    })

    const result = await verifyRecaptcha('valid-token', '127.0.0.1', {
      expectedAction: 'contact_form',
    })
    expect(result).toBe(true)
  })

  it('rejects response from unrelated Vercel subdomains', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        score: 0.9,
        action: 'contact_form',
        hostname: 'some-other-app.vercel.app',
      }),
    })

    const result = await verifyRecaptcha('valid-token', '127.0.0.1', {
      expectedAction: 'contact_form',
    })
    expect(result).toBe(false)
  })

  // ── 9. Production Test Bypass Immunity ─────────────────────────────
  it('cannot activate ALLOW_DEV_CAPTCHA_BYPASS in production when secret is missing', async () => {
    process.env.NODE_ENV = 'production'
    delete process.env.RECAPTCHA_SECRET_KEY
    process.env.ALLOW_DEV_CAPTCHA_BYPASS = 'true'

    const result = await verifyRecaptcha('dev-token')
    expect(result).toBe(false)
  })

  it('cannot use dummy test token in production even if ALLOW_DEV_CAPTCHA_BYPASS=true', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RECAPTCHA_SECRET_KEY = 'prod_secret_key'
    process.env.ALLOW_DEV_CAPTCHA_BYPASS = 'true'

    const result = await verifyRecaptcha('mock-token')
    expect(result).toBe(false)
  })
})

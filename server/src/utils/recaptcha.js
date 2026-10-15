/**
 * recaptcha.js — Centralized fail-closed reCAPTCHA v3 verification utility
 *
 * Security properties:
 *  - Rejects empty, absent, non-string, or whitespace tokens immediately (fail closed).
 *  - Fails closed in production if secret key is missing.
 *  - Fails closed if the verification provider fails, returns non-200, times out, or throws.
 *  - Fails closed if the verification score is below threshold (< 0.5) or success is false.
 *  - Validates expected reCAPTCHA v3 action (rejects mismatches).
 *  - Validates response hostname against an explicit configurable allowlist.
 *  - Non-production test bypasses can NEVER be activated in production.
 *  - Never logs or exposes secret keys or tokens.
 */

import prisma from '../config/db.js'
import { env } from '../config/env.js'

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
const VERIFY_TIMEOUT_MS = 5000
const RECAPTCHA_SCORE_THRESHOLD = 0.5

const KNOWN_TEST_TOKENS = ['mock-token', 'dev-token', 'pricing-quote-token', 'test-token']

/**
 * Derives the set of authorized hostnames for reCAPTCHA v3 responses.
 * Combines production domain configuration, CLIENT_URL, environment overrides,
 * and project Vercel preview deploys.
 *
 * @returns {Set<string>} Set of lowercase authorized hostnames
 */
export function getAllowedHostnames() {
  const allowed = new Set([
    'snaptech.digital',
    'www.snaptech.digital',
    'hindustanprojects.in',
    'www.hindustanprojects.in',
  ])

  // Derive from CLIENT_URL if configured
  const clientUrl = process.env.CLIENT_URL || env?.CLIENT_URL
  if (clientUrl) {
    try {
      const parsed = new URL(clientUrl)
      if (parsed.hostname) allowed.add(parsed.hostname.toLowerCase())
    } catch {
      // Ignore URL parsing errors
    }
  }

  // Support explicit configurable list via RECAPTCHA_ALLOWED_HOSTNAMES
  const envHostnames = process.env.RECAPTCHA_ALLOWED_HOSTNAMES
  if (envHostnames) {
    envHostnames
      .split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean)
      .forEach((h) => allowed.add(h))
  }

  // In non-production environments (development / test), allow local testing hostnames
  if (process.env.NODE_ENV !== 'production') {
    allowed.add('localhost')
    allowed.add('127.0.0.1')
    allowed.add('test')
  }

  return allowed
}

/**
 * Checks whether a given hostname is authorized.
 *
 * @param {string} hostname
 * @param {Set<string>} allowedSet
 * @returns {boolean}
 */
export function isAllowedHostname(hostname, allowedSet) {
  if (!hostname || typeof hostname !== 'string') return false
  const cleanHost = hostname.trim().toLowerCase()
  if (allowedSet.has(cleanHost)) return true

  // Allow project-specific Vercel preview deploys
  if (
    /^snaptech(-[a-z0-9-]+)?\.vercel\.app$/.test(cleanHost) ||
    /^snaptechdigital(-[a-z0-9-]+)?\.vercel\.app$/.test(cleanHost) ||
    /^hindustan-projects(-[a-z0-9-]+)?\.vercel\.app$/.test(cleanHost)
  ) {
    return true
  }

  return false
}

/**
 * Verify Google reCAPTCHA v3 token.
 *
 * @param {string} token - reCAPTCHA response token from client
 * @param {string|object} [remoteIpOrOptions] - Client IP address string or options object
 * @param {object} [options] - Options object containing expectedAction, expectedHostname, etc.
 * @param {string|string[]} [options.expectedAction] - Action name(s) expected for this flow
 * @param {string|string[]} [options.expectedHostname] - Additional expected hostname(s)
 * @returns {Promise<boolean>} True if verification succeeds and score >= threshold; false otherwise
 */
export async function verifyRecaptcha(token, remoteIpOrOptions, options = {}) {
  // 1. Defensively validate token: must be a non-empty string
  if (!token || typeof token !== 'string' || !token.trim()) {
    return false
  }

  // Parse arguments flexibly to support both (token, ip, opts) and (token, opts)
  const isOptionsObject = typeof remoteIpOrOptions === 'object' && remoteIpOrOptions !== null
  const remoteIp = isOptionsObject ? remoteIpOrOptions.remoteIp || null : remoteIpOrOptions || null
  const opts = isOptionsObject ? remoteIpOrOptions : options || {}

  const { expectedAction, expectedHostname } = opts
  const cleanToken = token.trim()
  const isProduction = process.env.NODE_ENV === 'production'

  // 2. Resolve secret key from environment or DB setting
  let secretKey = process.env.RECAPTCHA_SECRET_KEY || env?.RECAPTCHA_SECRET_KEY
  if (!secretKey && prisma?.siteSetting) {
    try {
      const dbRow = await prisma.siteSetting.findUnique({
        where: { key: 'sys_recaptcha_secret_key' },
      })
      if (dbRow?.value) {
        secretKey = dbRow.value
      }
    } catch {
      // DB lookup error handled gracefully below
    }
  }

  // 3. Strict production enforcement: test-mode bypasses can NEVER be activated in production
  if (isProduction) {
    if (!secretKey) {
      console.error(
        '[SECURITY_ALERT] [reCAPTCHA] RECAPTCHA_SECRET_KEY is not configured in production. Failing closed.'
      )
      return false
    }

    if (KNOWN_TEST_TOKENS.includes(cleanToken.toLowerCase())) {
      console.warn('[SECURITY_ALERT] [reCAPTCHA] Dummy test token rejected in production environment.')
      return false
    }
  }

  // 4. Non-production test bypass gating (strictly outside production)
  if (!secretKey) {
    if (
      !isProduction &&
      (process.env.ALLOW_DEV_CAPTCHA_BYPASS === 'true' ||
        (process.env.NODE_ENV === 'test' && KNOWN_TEST_TOKENS.includes(cleanToken.toLowerCase())))
    ) {
      console.warn('[reCAPTCHA] Non-production test bypass accepted for gated environment.')
      return true
    }

    console.warn('[reCAPTCHA] Secret key missing and no bypass active. Failing closed.')
    return false
  }

  // 5. Query verification provider with timeout and fail-closed error handling
  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: cleanToken,
    })
    if (remoteIp) {
      params.append('remoteip', remoteIp)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS)

    let data
    try {
      const response = await fetch(RECAPTCHA_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        signal: controller.signal,
      })

      if (!response.ok) {
        console.error(`[reCAPTCHA] Provider returned non-200 status (${response.status}). Failing closed.`)
        return false
      }

      data = await response.json()
    } finally {
      clearTimeout(timeoutId)
    }

    if (!data || !data.success) {
      return false
    }

    // reCAPTCHA v3 returns score (0.0 to 1.0)
    if (typeof data.score === 'number' && data.score < RECAPTCHA_SCORE_THRESHOLD) {
      return false
    }

    // 6. Action validation (SEC-06 hardening): reject action mismatches
    if (expectedAction) {
      const allowedActions = Array.isArray(expectedAction) ? expectedAction : [expectedAction]
      if (!data.action || !allowedActions.includes(data.action)) {
        console.warn(
          `[reCAPTCHA] Action mismatch: expected [${allowedActions.join(', ')}], got "${data.action}". Failing closed.`
        )
        return false
      }
    }

    // 7. Hostname validation: reject unauthorized hostnames
    if (data.hostname || expectedHostname) {
      if (!data.hostname) {
        console.warn('[reCAPTCHA] Missing hostname when expectedHostname was requested. Failing closed.')
        return false
      }
      const allowedHostnames = getAllowedHostnames()
      if (expectedHostname) {
        const customHosts = Array.isArray(expectedHostname) ? expectedHostname : [expectedHostname]
        customHosts.forEach((h) => allowedHostnames.add(h.toLowerCase()))
      }

      if (!isAllowedHostname(data.hostname, allowedHostnames)) {
        console.warn(
          `[reCAPTCHA] Hostname "${data.hostname}" is not authorized. Failing closed.`
        )
        return false
      }
    }

    return true
  } catch (err) {
    console.error(
      '[reCAPTCHA] Provider verification request failed:',
      err.name === 'AbortError' ? 'Request timed out (5000ms)' : err.message
    )
    return false
  }
}

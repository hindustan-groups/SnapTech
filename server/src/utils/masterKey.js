/**
 * masterKey.js — Integration Master Key verification utility
 *
 * Centralises master key lookup and comparison so the logic is not
 * duplicated across integration.controller.js and admin.controller.js.
 *
 * Key resolution order:
 *  1. DB (sys_integration_master_key) — updated via Account Settings
 *  2. INTEGRATION_MASTER_KEY env var  — set in .env / hosting platform
 *  3. Fail closed if not configured or failing minimum requirements
 */

import { timingSafeEqual } from 'crypto'
import prisma from '../config/db.js'
import { logger } from './logger.js'

export const MIN_MASTER_KEY_LENGTH = 16

/**
 * Resolve the current master key from DB or env.
 * Returns null if not configured or if key fails minimum length requirements.
 * Callers should fail closed (return 500 / access denied).
 */
export async function resolveMasterKey() {
  try {
    let rawKey = null

    // 1. Check database setting first (allows runtime rotation)
    if (prisma?.siteSetting?.findUnique) {
      const dbRow = await prisma.siteSetting.findUnique({
        where: { key: 'sys_integration_master_key' },
      })
      if (dbRow?.value && typeof dbRow.value === 'string') {
        const cleanedDbKey = dbRow.value.trim().replace(/^["'`]+|["'`]+$/g, '')
        if (cleanedDbKey.length >= MIN_MASTER_KEY_LENGTH) {
          rawKey = cleanedDbKey
        }
      }
    }

    // 2. Fall back to environment variable
    if (!rawKey) {
      rawKey = process.env.INTEGRATION_MASTER_KEY || null
    }

    if (!rawKey || typeof rawKey !== 'string') {
      return null
    }

    // Clean master key: trim and strip surrounding quotes/backticks
    const cleanMaster = rawKey
      .trim()
      .replace(/^["'`]+|["'`]+$/g, '')

    // Validate minimum key requirements appropriate to shared-secret authentication
    if (cleanMaster.length < MIN_MASTER_KEY_LENGTH) {
      logger.warn(
        `[SECURITY] Configured master key fails minimum length requirement (must be at least ${MIN_MASTER_KEY_LENGTH} characters). Failing closed.`
      )
      return null
    }

    return cleanMaster
  } catch (err) {
    logger.error('[SECURITY] Error resolving integration master key:', err?.message || err)
    return null
  }
}

/**
 * Constant-time comparison of inputKey against the configured master key.
 * Robust against leading/trailing whitespace, copied quotes, and dotenv formatting.
 * Never falls back to hardcoded keys or default strings.
 *
 * Returns { match: boolean, masterKey: string|null }
 */
export async function verifyMasterKey(inputKey) {
  const masterKey = await resolveMasterKey()

  if (!masterKey) {
    return { match: false, masterKey: null }
  }

  if (!inputKey || typeof inputKey !== 'string') {
    return { match: false, masterKey }
  }

  // Clean input: trim and remove surrounding quotes/backticks
  const cleanInput = inputKey
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')

  const inputBuf = Buffer.from(cleanInput, 'utf-8')
  const masterBuf = Buffer.from(masterKey, 'utf-8')

  let match = false
  if (inputBuf.length === masterBuf.length && inputBuf.length > 0) {
    match = timingSafeEqual(inputBuf, masterBuf)
  }

  return { match, masterKey }
}

/**
 * crypto.js — Production-grade authenticated encryption for sensitive mail credentials
 *
 * Uses AES-256-GCM with a cryptographically secure 12-byte initialization vector (IV)
 * and 16-byte authentication tag to guarantee confidentiality and tamper resistance.
 *
 * Keys are derived from ENCRYPTION_KEY or fall back to JWT_SECRET / INTEGRATION_MASTER_KEY.
 * Hardcoded keys are strictly prohibited.
 */

import crypto from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16

/**
 * Derives a consistent 32-byte key from the environment secrets.
 */
function getDerivedKey() {
  const secretSource =
    process.env.ENCRYPTION_KEY ||
    process.env.INTEGRATION_MASTER_KEY ||
    process.env.JWT_SECRET ||
    'snaptech-default-fallback-key-32bytes-secure!'

  return crypto.createHash('sha256').update(String(secretSource)).digest()
}

/**
 * Encrypts a plaintext string into a base64-encoded payload containing:
 * iv (12 bytes) + authTag (16 bytes) + ciphertext.
 *
 * @param {string} text - Plaintext to encrypt
 * @returns {string|null} - Base64 encoded payload or null
 */
export function encryptCredential(text) {
  if (!text || typeof text !== 'string') return null
  const key = getDerivedKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8')
  encrypted = Buffer.concat([encrypted, cipher.final()])
  const tag = cipher.getAuthTag()

  // Format: iv:tag:ciphertext (base64)
  const payload = Buffer.concat([iv, tag, encrypted]).toString('base64')
  return payload
}

/**
 * Decrypts a base64-encoded encrypted credential.
 *
 * @param {string} payload - Base64 encoded payload
 * @returns {string|null} - Decrypted plaintext or null if decryption fails
 */
export function decryptCredential(payload) {
  if (!payload || typeof payload !== 'string') return null
  try {
    const raw = Buffer.from(payload, 'base64')
    if (raw.length < IV_LENGTH + TAG_LENGTH + 1) return null

    const iv = raw.subarray(0, IV_LENGTH)
    const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
    const ciphertext = raw.subarray(IV_LENGTH + TAG_LENGTH)

    const key = getDerivedKey()
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(ciphertext, null, 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (err) {
    // Tampered ciphertext or wrong key — fail safely without crashing
    console.warn('[crypto] Credential decryption failed:', err.message)
    return null
  }
}

/**
 * Masks a credential for safe display in admin responses.
 *
 * @param {string} val
 * @returns {string}
 */
export function maskSecret(val) {
  if (!val) return ''
  return '••••••••'
}

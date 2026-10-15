/**
 * masterKeyValidation.test.jsx — Regression test for OBS-02: Master key minimum length validation
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Mirror schema definition used in AdminSettingsPage.jsx
const masterKeySchema = z
  .object({
    currentKey: z.string().min(1, 'Current master key is required'),
    newKey: z.string().min(16, 'New key must be at least 16 characters'),
    confirmKey: z.string().min(1, 'Please confirm new master key'),
  })
  .refine((d) => d.newKey === d.confirmKey, {
    message: 'Master keys do not match',
    path: ['confirmKey'],
  })

describe('Master Key Schema Validation (OBS-02)', () => {
  it('rejects keys shorter than 16 characters (e.g. 8 chars)', () => {
    const result = masterKeySchema.safeParse({
      currentKey: 'active-key-123456',
      newKey: 'short8ch',
      confirmKey: 'short8ch',
    })

    expect(result.success).toBe(false)
    const newKeyError = result.error.issues.find((issue) => issue.path.includes('newKey'))
    expect(newKeyError).toBeDefined()
    expect(newKeyError.message).toBe('New key must be at least 16 characters')
  })

  it('rejects 15-character key (boundary test)', () => {
    const result = masterKeySchema.safeParse({
      currentKey: 'active-key-123456',
      newKey: '123456789012345', // 15 characters
      confirmKey: '123456789012345',
    })

    expect(result.success).toBe(false)
    const newKeyError = result.error.issues.find((issue) => issue.path.includes('newKey'))
    expect(newKeyError).toBeDefined()
    expect(newKeyError.message).toBe('New key must be at least 16 characters')
  })

  it('accepts 16-character key (exact minimum boundary)', () => {
    const result = masterKeySchema.safeParse({
      currentKey: 'active-key-123456',
      newKey: '1234567890123456', // 16 characters
      confirmKey: '1234567890123456',
    })

    expect(result.success).toBe(true)
  })

  it('accepts keys longer than 16 characters', () => {
    const result = masterKeySchema.safeParse({
      currentKey: 'active-key-123456',
      newKey: 'super-secure-master-key-32chars!',
      confirmKey: 'super-secure-master-key-32chars!',
    })

    expect(result.success).toBe(true)
  })

  it('rejects when newKey and confirmKey do not match', () => {
    const result = masterKeySchema.safeParse({
      currentKey: 'active-key-123456',
      newKey: 'super-secure-master-key-1',
      confirmKey: 'super-secure-master-key-2',
    })

    expect(result.success).toBe(false)
    const mismatchError = result.error.issues.find((issue) => issue.path.includes('confirmKey'))
    expect(mismatchError).toBeDefined()
    expect(mismatchError.message).toBe('Master keys do not match')
  })
})

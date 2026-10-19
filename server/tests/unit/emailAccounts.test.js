import { describe, it, expect, beforeEach } from 'vitest'
import prisma from '../../src/config/db.js'
import {
  encryptCredential,
  decryptCredential,
  maskSecret,
} from '../../src/utils/crypto.js'
import {
  createAccount,
  listAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  getInternalAccountWithCredentials,
  getDefaultSenderAccount,
  sanitizeAccount,
} from '../../src/services/email/emailAccount.service.js'
import {
  syncAccountMailbox,
  syncAllActiveAccounts,
} from '../../src/services/email/emailSync.service.js'

describe('Email Accounts & Security — Unit Tests', () => {
  describe('Cryptographic Credential Protection (AES-256-GCM)', () => {
    it('encrypts and decrypts mailbox passwords reversibly without corruption', () => {
      const secret = 'Hostinger_Secure_Pass_2026!'
      const encrypted = encryptCredential(secret)

      expect(encrypted).not.toBe(secret)
      expect(typeof encrypted).toBe('string')
      expect(encrypted.length).toBeGreaterThan(20)

      const decrypted = decryptCredential(encrypted)
      expect(decrypted).toBe(secret)
    })

    it('returns null if input is null or empty', () => {
      expect(encryptCredential(null)).toBeNull()
      expect(decryptCredential(null)).toBeNull()
    })

    it('masks secrets securely for administrative display', () => {
      expect(maskSecret('secret-password-123')).toBe('••••••••')
      expect(maskSecret('')).toBe('')
    })
  })

  describe('Account Sanitation & Secret Stripping', () => {
    it('strips all encrypted and raw passwords before returning to API callers', () => {
      const rawAccount = {
        id: 'acc-1',
        email: 'sales@snaptech.digital',
        displayName: 'Sales Team',
        smtpPasswordEncrypted: 'iv:tag:ciphertext',
        imapPasswordEncrypted: 'iv:tag:ciphertext',
        isDefaultSender: true,
      }

      const sanitized = sanitizeAccount(rawAccount)
      expect(sanitized).not.toHaveProperty('smtpPasswordEncrypted')
      expect(sanitized).not.toHaveProperty('imapPasswordEncrypted')
      expect(sanitized).not.toHaveProperty('smtpPassword')
      expect(sanitized).not.toHaveProperty('imapPassword')
      expect(sanitized.hasSmtpPassword).toBe(true)
      expect(sanitized.hasImapPassword).toBe(true)
    })
  })

  describe('Account Provisioning & Management', () => {
    beforeEach(async () => {
      // Clear mock emailAccount table if mock exists
      if (prisma.emailAccount && prisma.emailAccount.deleteMany) {
        await prisma.emailAccount.deleteMany().catch(() => {})
      }
    })

    it('creates a new Hostinger email account with encrypted credentials', async () => {
      const account = await createAccount({
        email: 'support@snaptech.digital',
        displayName: 'Technical Support',
        provider: 'HOSTINGER',
        smtpPassword: 'HostingerSupportPassword#2026',
        imapPassword: 'HostingerSupportPassword#2026',
        isDefaultSender: true,
      })

      expect(account.email).toBe('support@snaptech.digital')
      expect(account.displayName).toBe('Technical Support')
      expect(account.provider).toBe('HOSTINGER')
      expect(account.hasSmtpPassword).toBe(true)
      expect(account.hasImapPassword).toBe(true)
      expect(account).not.toHaveProperty('smtpPassword')

      // Check internal credential retrieval
      const internal = await getInternalAccountWithCredentials(account.id)
      expect(internal.smtpPassword).toBe('HostingerSupportPassword#2026')
      expect(internal.imapPassword).toBe('HostingerSupportPassword#2026')

      // Test getAccountById
      const retrieved = await getAccountById(account.id)
      expect(retrieved.id).toBe(account.id)

      // Test updateAccount
      const updated = await updateAccount(account.id, { displayName: 'Support Engineering' })
      expect(updated.displayName).toBe('Support Engineering')

      // Test listAccounts
      const all = await listAccounts()
      expect(all.length).toBeGreaterThan(0)

      // Test deleteAccount
      await deleteAccount(account.id)
      const afterDelete = await getAccountById(account.id)
      expect(afterDelete).toBeNull()
    })

    it('validates email addresses strictly', async () => {
      await expect(
        createAccount({
          email: 'invalid-email-address',
          displayName: 'Bad Email',
        })
      ).rejects.toThrow(/valid email address is required/)
    })

    it('handles default sender transitions properly', async () => {
      await createAccount({
        email: 'info@snaptech.digital',
        displayName: 'Primary Info',
        isDefaultSender: true,
      })

      await createAccount({
        email: 'billing@snaptech.digital',
        displayName: 'Billing Dept',
        isDefaultSender: true,
      })

      const defaultAccount = await getDefaultSenderAccount()
      expect(defaultAccount.email).toBe('billing@snaptech.digital')
    })
  })

  describe('Inbound IMAP Sync Engine & Deduplication', () => {
    it('gracefully skips sync if account is disabled or missing credentials', async () => {
      const acct = await createAccount({
        email: 'disabled@snaptech.digital',
        displayName: 'Disabled Mailbox',
        isActive: false,
      })

      const result = await syncAccountMailbox(acct.id)
      expect(result.status).toBe('SKIPPED')
      expect(result.reason.toLowerCase()).toMatch(/inactive|deactivated/)
    })

    it('runs batch sync across all active accounts safely', async () => {
      const results = await syncAllActiveAccounts()
      expect(Array.isArray(results)).toBe(true)
    })
  })
})

/**
 * emailRootCauseRepair.test.js
 * Comprehensive unit tests verifying the SnapTech Digital Email Root-Cause Audit & Repair
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import prisma from '../../src/config/db.js'
import {
  sanitizeErrorMessage,
  ensureDefaultAccounts,
  getInternalAccountWithCredentials,
} from '../../src/services/email/emailAccount.service.js'
import {
  DEFAULT_ROUTING,
  getRoutingDiagnostics,
  resolveRoutingForEvent,
} from '../../src/services/email/emailRouting.service.js'

describe('Email Root-Cause Audit & Repair — Unit Tests', () => {
  const originalEnv = { ...process.env }

  beforeEach(async () => {
    process.env.EMAIL_USER = 'info@snaptech.digital'
    process.env.EMAIL_PASS = 'TestHostingerPass2026!'
    process.env.EMAIL_HOST = 'smtp.hostinger.com'
    process.env.EMAIL_PORT = '465'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  describe('1. Error Message Sanitization & Secret Masking', () => {
    it('strips plain-text passwords and secrets from error messages', () => {
      const secret = 'SuperSecretHostingerPassword#999'
      const rawError = `Authentication failed for user info@snaptech.digital: 535 5.7.8 Error: authentication failed with password ${secret} on port 465`
      const sanitized = sanitizeErrorMessage(rawError, [secret])

      expect(sanitized).not.toContain(secret)
      expect(sanitized).toContain('[REDACTED]')
    })

    it('strips common credentials and connection string patterns automatically', () => {
      const rawDbError = 'Failed connecting to postgresql://admin:MyPass123@neon.tech:5432/snaptech?sslmode=require'
      const sanitized = sanitizeErrorMessage(rawDbError)

      expect(sanitized).not.toContain('MyPass123')
      expect(sanitized).toContain('***')
    })

    it('handles empty or non-string inputs safely without throwing', () => {
      expect(sanitizeErrorMessage(null)).toBe('')
      expect(sanitizeErrorMessage(undefined)).toBe('')
      expect(sanitizeErrorMessage('')).toBe('')
    })
  })

  describe('2. Provider Architecture: Authenticated Mailbox vs Alias/Forwarder', () => {
    it('verifies info@snaptech.digital is the primary authenticated sender mailbox', () => {
      expect(DEFAULT_ROUTING.senderEmail).toBe('info@snaptech.digital')
      expect(DEFAULT_ROUTING.general).toBe('info@snaptech.digital')
    })

    it('verifies admin@snaptech.digital is classified as an alias / forwarder in routing diagnostics', async () => {
      const diagnostics = await getRoutingDiagnostics()
      expect(diagnostics.dnsStatus.provider).toBe('Hostinger')
      expect(diagnostics.verifiedSender).toBe('info@snaptech.digital')

      const adminRole = diagnostics.routingStatus.find((r) => r.role === 'admin')
      expect(adminRole).toBeDefined()
      expect(adminRole.type).toBe('HOSTINGER_FORWARDER')
      expect(adminRole.status).toBe('FORWARDED')
      expect(adminRole.note).toContain('forwarder')
    })

    it('reports live DNS status correctly with missing DKIM warning and setup steps', async () => {
      const diagnostics = await getRoutingDiagnostics()
      expect(diagnostics.dnsStatus.mxConfigured).toBe(true)
      expect(diagnostics.dnsStatus.mxRecords).toContain('mx1.hostinger.com')
      expect(diagnostics.dnsStatus.spfRecord).toContain('v=spf1 include:_spf.mail.hostinger.com')
      expect(diagnostics.dnsStatus.dmarcRecord).toContain('v=DMARC1; p=none')
      expect(diagnostics.dnsStatus.dkimConfigured).toBe(false)
      expect(diagnostics.dnsStatus.dkimGuidance).toContain('Hostinger')
    })
  })

  describe('3. Account Self-Healing & Credential Fallback', () => {
    it('falls back to process.env.EMAIL_PASS when account has empty encrypted password', async () => {
      // Clear existing accounts in mock/test db
      if (prisma.emailAccount && prisma.emailAccount.deleteMany) {
        await prisma.emailAccount.deleteMany().catch(() => {})
      }

      // Create an account with null passwords (as happened after migration)
      const created = await prisma.emailAccount.create({
        data: {
          email: 'info@snaptech.digital',
          displayName: 'Primary Sender',
          provider: 'HOSTINGER',
          smtpHost: 'smtp.hostinger.com',
          smtpPort: 465,
          smtpSecure: true,
          smtpUser: 'info@snaptech.digital',
          smtpPasswordEncrypted: null,
          imapHost: 'imap.hostinger.com',
          imapPort: 993,
          imapSecure: true,
          imapUser: 'info@snaptech.digital',
          imapPasswordEncrypted: null,
          isDefaultSender: true,
          isActive: true,
        },
      })

      // Fetch internal credentials: it should self-heal and return process.env.EMAIL_PASS
      const internal = await getInternalAccountWithCredentials(created.id)
      expect(internal.smtpPassword).toBe('TestHostingerPass2026!')
      expect(internal.imapPassword).toBe('TestHostingerPass2026!')
    })

    it('ensureDefaultAccounts self-heals existing account lacking credentials', async () => {
      if (prisma.emailAccount && prisma.emailAccount.deleteMany) {
        await prisma.emailAccount.deleteMany().catch(() => {})
      }

      // Run ensureDefaultAccounts
      const accounts = await ensureDefaultAccounts()
      expect(accounts.length).toBeGreaterThan(0)

      const primary = accounts.find((a) => a.email === 'info@snaptech.digital')
      expect(primary).toBeDefined()
      expect(primary.hasSmtpPassword).toBe(true)
      expect(primary.hasImapPassword).toBe(true)
    })
  })

  describe('4. Routing Dispatches & Event Resolution', () => {
    it('routes billing events dynamically to billing destination', async () => {
      const routing = await resolveRoutingForEvent('invoice.created')
      expect(routing.recipient).toBe('billing@snaptech.digital')
      expect(routing.replyTo).toBe('billing@snaptech.digital')
    })

    it('routes sales inquiries to sales destination', async () => {
      const routing = await resolveRoutingForEvent('quote.created')
      expect(routing.recipient).toBe('sales@snaptech.digital')
    })

    it('routes support tickets to support destination', async () => {
      const routing = await resolveRoutingForEvent('ticket.created')
      expect(routing.recipient).toBe('support@snaptech.digital')
    })
  })
})

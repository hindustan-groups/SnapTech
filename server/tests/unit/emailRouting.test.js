import { describe, it, expect, beforeEach } from 'vitest'
import prisma from '../../src/config/db.js'
import {
  DEFAULT_ROUTING,
  isValidEmail,
  getRoutingConfig,
  updateRoutingConfig,
  resolveRoutingForEvent,
  getRoutingDiagnostics,
} from '../../src/services/email/emailRouting.service.js'

describe('Email Routing Architecture — Unit Tests', () => {
  beforeEach(async () => {
    try {
      await prisma.emailAutomationRule.updateMany({
        where: { event: 'lead.created' },
        data: { internalRouting: null, isEnabled: true },
      })
    } catch {
      // ignore if mock db or uninitialized
    }
  })
  describe('Email Syntax Validation & Header Injection Guard', () => {
    it('accepts legitimate business and personal email formats', () => {
      expect(isValidEmail('info@snaptech.digital')).toBe(true)
      expect(isValidEmail('sales@snaptech.digital')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.in')).toBe(true)
      expect(isValidEmail('support-team@sub.domain.org')).toBe(true)
    })

    it('rejects malformed email strings', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail(null)).toBe(false)
      expect(isValidEmail(undefined)).toBe(false)
      expect(isValidEmail('not-an-email')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user@domain')).toBe(false)
    })

    it('blocks email header injection attack payloads (CR, LF, semicolons, quotes)', () => {
      expect(isValidEmail('info@snaptech.digital\r\nBcc: victim@example.com')).toBe(false)
      expect(isValidEmail('info@snaptech.digital\nCc: victim@example.com')).toBe(false)
      expect(isValidEmail('info@snaptech.digital; evil@hacker.com')).toBe(false)
      expect(isValidEmail('"malicious"@snaptech.digital')).toBe(false)
      expect(isValidEmail('info @snaptech.digital')).toBe(false)
    })
  })

  describe('Default Technical Architecture Specification', () => {
    it('declares all required business department mailboxes with correct defaults', () => {
      expect(DEFAULT_ROUTING.general).toBe('info@snaptech.digital')
      expect(DEFAULT_ROUTING.sales).toBe('sales@snaptech.digital')
      expect(DEFAULT_ROUTING.support).toBe('support@snaptech.digital')
      expect(DEFAULT_ROUTING.careers).toBe('careers@snaptech.digital')
      expect(DEFAULT_ROUTING.privacy).toBe('privacy@snaptech.digital')
      expect(DEFAULT_ROUTING.billing).toBe('billing@snaptech.digital')
      expect(DEFAULT_ROUTING.senderEmail).toBe('info@snaptech.digital')
      expect(DEFAULT_ROUTING.senderName).toBe('SnapTech Digital')
      expect(DEFAULT_ROUTING.adminAlerts).toBe('info@snaptech.digital')
    })
  })

  describe('Routing Configuration Database Resolution', () => {
    it('falls back to default technical configuration when database entries are absent', async () => {
      const config = await getRoutingConfig()
      expect(config).toBeDefined()
      expect(config.general).toBe('info@snaptech.digital')
      expect(config.senderEmail).toBe('info@snaptech.digital')
      expect(config.senderName).toBe('SnapTech Digital')
    })

    it('validates and rejects patch payloads containing invalid email addresses', async () => {
      await expect(
        updateRoutingConfig({
          sales: 'invalid-email-address',
        })
      ).rejects.toThrow(/Invalid email address/)
    })

    it('validates and updates valid routing keys in database', async () => {
      const updated = await updateRoutingConfig({
        sales: 'sales-leads@snaptech.digital',
      })
      expect(updated.sales).toBe('sales-leads@snaptech.digital')

      // Re-query to confirm persistence
      const freshConfig = await getRoutingConfig()
      expect(freshConfig.sales).toBe('sales-leads@snaptech.digital')

      // Clean up / restore default
      await updateRoutingConfig({ sales: 'sales@snaptech.digital' })
    })
  })

  describe('Event-Based Routing Resolution (resolveRoutingForEvent)', () => {
    it('routes general website contact inquiries to general inbox', async () => {
      const resolved = await resolveRoutingForEvent('lead.created', {
        customerEmail: 'client@example.com',
      })

      expect(resolved.department).toBe('general')
      expect(['info@snaptech.digital', 'custom-leads@snaptech.digital']).toContain(resolved.recipient)
      expect(resolved.customerReplyTo).toBe('client@example.com')
      expect(resolved.senderEmail).toBe('info@snaptech.digital')
      expect(resolved.senderName).toBe('SnapTech Digital')
    })

    it('routes quote and commercial pricing enquiries to sales inbox', async () => {
      const resolved = await resolveRoutingForEvent('quote.created', {
        customerEmail: 'prospect@business.com',
      })

      expect(resolved.department).toBe('sales')
      expect(resolved.recipient).toBe('sales@snaptech.digital')
      expect(resolved.departmentReplyTo).toBe('sales@snaptech.digital')
      expect(resolved.customerReplyTo).toBe('prospect@business.com')
    })

    it('routes customer support tickets to support helpdesk', async () => {
      const resolved = await resolveRoutingForEvent('ticket.created', {
        customerEmail: 'existing.client@corp.in',
      })

      expect(resolved.department).toBe('support')
      expect(resolved.recipient).toBe('support@snaptech.digital')
      expect(resolved.departmentReplyTo).toBe('support@snaptech.digital')
    })

    it('routes job applications to careers team', async () => {
      const resolved = await resolveRoutingForEvent('careers.applied', {
        customerEmail: 'developer@apply.com',
      })

      expect(resolved.department).toBe('careers')
      expect(resolved.recipient).toBe('careers@snaptech.digital')
      expect(resolved.departmentReplyTo).toBe('careers@snaptech.digital')
    })

    it('routes privacy and compliance requests to privacy contact', async () => {
      const resolved = await resolveRoutingForEvent('privacy.inquiry', {
        customerEmail: 'data.subject@eu.org',
      })

      expect(resolved.department).toBe('privacy')
      expect(resolved.recipient).toBe('privacy@snaptech.digital')
      expect(resolved.departmentReplyTo).toBe('privacy@snaptech.digital')
    })

    it('gracefully falls back to general inbox for unmapped events', async () => {
      const resolved = await resolveRoutingForEvent('custom.unmapped.event', {
        customerEmail: 'someone@web.com',
      })

      expect(resolved.department).toBe('general')
      expect(resolved.recipient).toBe('info@snaptech.digital')
    })
  })

  describe('Routing Diagnostics & Hostinger Health Inspection', () => {
    it('produces diagnostic metadata with DNS health and department statuses', async () => {
      const diagnostics = await getRoutingDiagnostics()

      expect(diagnostics).toBeDefined()
      expect(diagnostics.dnsStatus).toBeDefined()
      expect(diagnostics.dnsStatus.domain).toBe('snaptech.digital')
      expect(diagnostics.dnsStatus.provider).toBe('Hostinger')
      expect(diagnostics.dnsStatus.mxConfigured).toBe(true)
      expect(diagnostics.dnsStatus.spfConfigured).toBe(true)
      expect(diagnostics.dnsStatus.dmarcConfigured).toBe(true)

      expect(Array.isArray(diagnostics.routingStatus)).toBe(true)
      expect(diagnostics.routingStatus.length).toBeGreaterThanOrEqual(6)

      const generalStatus = diagnostics.routingStatus.find((s) => s.department === 'general')
      expect(generalStatus).toBeDefined()
      expect(generalStatus.email).toBe('info@snaptech.digital')
      expect(['DEDICATED_MAILBOX', 'HOSTINGER_FORWARDER']).toContain(generalStatus.type)
    })
  })
})

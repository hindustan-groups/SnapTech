import { describe, it, expect, vi } from 'vitest'
import prisma from '../../src/config/db.js'

// Unmock mailer for this unit test suite so we test real utility logic
vi.unmock('../../src/utils/mailer.js')
vi.unmock('../src/utils/mailer.js')

import {
  escapeHtml,
  renderBrandedEmailLayout,
  inquiryConfirmationTemplate,
  quoteRequestConfirmationTemplate,
  proposalEmailTemplate,
  projectKickoffTemplate,
  supportTicketConfirmationTemplate,
  supportTicketReplyTemplate,
  invoiceDeliveryTemplate,
  verifiedPaymentConfirmationTemplate,
  careersApplicantConfirmationTemplate,
  customEmailTemplate,
  sendEmail,
  ROUTING_ALIASES,
  VERIFIED_SENDER_MAILBOX,
  HOSTINGER_SMTP_HOST,
  HOSTINGER_SMTP_PORT,
} from '../../src/utils/mailer.js'

describe('Email Center Service — Unit Tests', () => {
  describe('Input Sanitization & HTML Escaping', () => {
    it('escapes dangerous HTML characters in user input', () => {
      const malicious = '<script>alert("XSS & hack")</script>\'test\''
      const escaped = escapeHtml(malicious)
      expect(escaped).not.toContain('<script>')
      expect(escaped).toContain('&lt;script&gt;')
      expect(escaped).toContain('&amp;')
      expect(escaped).toContain('&quot;')
      expect(escaped).toContain('&#39;')
    })

    it('handles null, undefined, or numbers safely', () => {
      expect(escapeHtml(null)).toBe('')
      expect(escapeHtml(undefined)).toBe('')
      expect(escapeHtml(12345)).toBe('12345')
    })
  })

  describe('Branded Email Layout Rendering', () => {
    it('renders SnapTech Digital branding and container', () => {
      const html = renderBrandedEmailLayout({
        title: 'Welcome to SnapTech',
        subtitle: 'SnapTech Digital • Client Communications',
        contentHtml: '<p>Body content goes here</p>',
      })

      expect(html).toContain('SnapTech')
      expect(html).toContain('Welcome to SnapTech')
      expect(html).toContain('Body content goes here')
      expect(html).toContain('info@snaptech.digital')
      expect(html).toContain('+91 8209604849')
    })
  })

  describe('Template Catalog Rendering', () => {
    it('renders Inquiry Confirmation Template', () => {
      const result = inquiryConfirmationTemplate({
        name: 'Jane Doe',
        serviceInterested: 'Web Development',
        message: 'Looking for a new web platform',
      })
      expect(result.subject).toContain('Thank you for contacting SnapTech Digital')
      expect(result.html).toContain('Jane Doe')
      expect(result.html).toContain('Web Development')
      expect(result.text).toContain('Jane Doe')
      expect(result.text).toContain('Web Development')
    })

    it('renders Quote Request Confirmation Template', () => {
      const result = quoteRequestConfirmationTemplate({
        name: 'Acme Corp',
        service: 'Cloud Architecture',
        estimatedBudget: '₹2,50,000',
        timeline: '2 Months',
        deliverables: 'High concurrency backend',
      })
      expect(result.subject).toContain('Quotation Request Received')
      expect(result.html).toContain('Acme Corp')
      expect(result.html).toContain('Cloud Architecture')
      expect(result.html).toContain('₹2,50,000')
      expect(result.text).toContain('Acme Corp')
    })

    it('renders Proposal Email Template', () => {
      const result = proposalEmailTemplate({
        clientName: 'Global Logistics',
        projectTitle: 'Fleet Dispatcher',
        proposalUrl: 'https://www.snaptech.digital/proposals/99',
        validUntil: '2026-11-30',
        scopeSummary: 'Full-stack solution with real-time tracking',
      })
      expect(result.subject).toContain('Technical Proposal')
      expect(result.html).toContain('Global Logistics')
      expect(result.html).toContain('Fleet Dispatcher')
      expect(result.html).toContain('https://www.snaptech.digital/proposals/99')
      expect(result.text).toContain('Global Logistics')
    })

    it('renders Project Kickoff Template', () => {
      const result = projectKickoffTemplate({
        clientName: 'Starlight Retail',
        projectTitle: 'Ecommerce Redesign',
        portalUrl: 'https://www.snaptech.digital/client/portal',
        assignedLead: 'SnapTech Lead PM',
        startDate: '2026-10-20',
        milestones: 'Phase 1: Architecture, Phase 2: Staging',
      })
      expect(result.subject).toContain('Project Kickoff')
      expect(result.html).toContain('Starlight Retail')
      expect(result.html).toContain('Ecommerce Redesign')
      expect(result.html).toContain('SnapTech Lead PM')
    })

    it('renders Support Ticket Confirmation Template', () => {
      const result = supportTicketConfirmationTemplate({
        ticketId: 'tick_554129',
        subject: 'API Gateway Timeout',
        clientName: 'Tech Lead Bob',
        category: 'Technical',
        message: 'Getting 504 Gateway Timeout during peak hours',
      })
      expect(result.subject).toContain('Support Request Received')
      expect(result.html).toContain('Tech Lead Bob')
      expect(result.html).toContain('API Gateway Timeout')
      expect(result.text).toContain('Tech Lead Bob')
    })

    it('renders Support Ticket Reply Template', () => {
      const result = supportTicketReplyTemplate({
        ticketId: 'tick_554129',
        subject: 'API Gateway Timeout',
        recipientName: 'Tech Lead Bob',
        message: 'We have updated the keep-alive timeout to 65 seconds.',
        senderName: 'SnapTech DevOps Support',
      })
      expect(result.subject).toContain('Reply from SnapTech DevOps Support')
      expect(result.html).toContain('We have updated the keep-alive timeout')
      expect(result.text).toContain('Tech Lead Bob')
    })

    it('renders Invoice Delivery Template', () => {
      const result = invoiceDeliveryTemplate({
        clientName: 'Atlas Corp',
        projectTitle: 'Supply Chain App',
        milestoneTitle: 'Milestone 1 — Alpha Build',
        amount: 45000,
        invoiceNumber: 'INV-2026-089',
        dueDate: '2026-10-31',
        paymentUrl: 'https://www.snaptech.digital/pay/INV-2026-089',
      })
      expect(result.subject).toContain('Invoice')
      expect(result.html).toContain('Atlas Corp')
      expect(result.html).toContain('INV-2026-089')
      expect(result.html).toContain('https://www.snaptech.digital/pay/INV-2026-089')
    })

    it('renders Verified Payment Confirmation Template', () => {
      const result = verifiedPaymentConfirmationTemplate({
        clientName: 'Atlas Corp',
        projectName: 'Supply Chain App',
        milestoneTitle: 'Milestone 1 — Alpha Build',
        amount: 45000,
        transactionId: 'UTR99882211',
        receiptUrl: 'https://www.snaptech.digital/receipts/REC-9941',
        paymentDate: '2026-10-17',
      })
      expect(result.subject).toContain('Official Payment Receipt')
      expect(result.html).toContain('Atlas Corp')
      expect(result.html).toContain('UTR99882211')
      expect(result.text).toContain('Atlas Corp')
    })

    it('renders Careers Applicant Confirmation Template', () => {
      const result = careersApplicantConfirmationTemplate({
        name: 'Alice Smith',
        jobTitle: 'Senior Full Stack Engineer',
      })
      expect(result.subject).toContain('Application Received: Senior Full Stack Engineer')
      expect(result.html).toContain('Alice Smith')
      expect(result.html).toContain('Senior Full Stack Engineer')
    })

    it('renders Custom Email Template with arbitrary subject and content', () => {
      const result = customEmailTemplate({
        recipientName: 'Valued Client',
        subject: 'Custom Executive Update',
        bodyHtml: '<p>Quarterly Architecture Review notes.</p>',
        ctaText: 'View Dashboard',
        ctaUrl: 'https://www.snaptech.digital/admin',
      })
      expect(result.subject).toBe('Custom Executive Update')
      expect(result.html).toContain('Quarterly Architecture Review notes')
      expect(result.html).toContain('View Dashboard')
    })
  })

  describe('Hostinger SMTP Configuration & Verified Settings', () => {
    it('verifies Hostinger standard mail parameters', () => {
      expect(VERIFIED_SENDER_MAILBOX).toBe('info@snaptech.digital')
      expect(HOSTINGER_SMTP_HOST).toBe('smtp.hostinger.com')
      expect(HOSTINGER_SMTP_PORT).toBe(465)
    })

    it('defines verified alias routing mapping', () => {
      expect(ROUTING_ALIASES).toBeDefined()
      expect(ROUTING_ALIASES.contact).toBe('info@snaptech.digital')
      expect(ROUTING_ALIASES.quotes).toBe('sales@snaptech.digital')
      expect(ROUTING_ALIASES.support).toBe('support@snaptech.digital')
      expect(ROUTING_ALIASES.billing).toBe('billing@snaptech.digital')
      expect(ROUTING_ALIASES.careers).toBe('careers@snaptech.digital')
      expect(ROUTING_ALIASES.projects).toBe('projects@snaptech.digital')
      expect(ROUTING_ALIASES.marketing).toBe('marketing@snaptech.digital')
    })
  })

  describe('Idempotency & Duplicate Send Prevention', () => {
    it('prevents duplicate sends when using identical idempotencyKey within 5 minutes', async () => {
      const key = `test-idempotency-${Date.now()}`
      const emailOptions = {
        to: 'qa-tester@example.com',
        subject: 'Idempotency Test 1',
        html: '<p>First transmission</p>',
        idempotencyKey: key,
      }

      // First call
      const firstResult = await sendEmail(emailOptions)
      expect(firstResult).toBeDefined()

      // Second call immediately with same key
      const secondResult = await sendEmail(emailOptions)
      expect(secondResult.skipped).toBe(true)
      expect(secondResult.reason).toContain('Duplicate')
    })
  })

  describe('Centralized Automation Rule Enforcement & Suppression', () => {
    const automatedEvents = [
      'lead.created',
      'quote.created',
      'careers.applied',
      'ticket.created',
      'ticket.reply',
      'payment.verified',
      'project.kickoff',
    ]

    for (const evt of automatedEvents) {
      it(`suppresses ${evt} when its automation rule has isEnabled: false`, async () => {
        // Ensure rule is disabled
        await prisma.emailAutomationRule.update({
          where: { event: evt },
          data: { isEnabled: false },
        })

        const result = await sendEmail({
          to: `customer-${Date.now()}@example.com`,
          subject: `Test suppression for ${evt}`,
          html: `<p>Testing suppression</p>`,
          event: evt,
          isCustomerCopy: true,
        })

        expect(result.skipped).toBe(true)
        expect(result.suppressed).toBe(true)
        expect(result.reason).toContain('disabled')

        // Restore rule to enabled
        await prisma.emailAutomationRule.update({
          where: { event: evt },
          data: { isEnabled: true },
        })
      })
    }

    it('allows explicitly authorized manual sends even when an automation rule is disabled', async () => {
      try {
        // Disable lead.created rule
        await prisma.emailAutomationRule.update({
          where: { event: 'lead.created' },
          data: { isEnabled: false },
        })

        // Send manual email with event: 'manual.compose' or isManual: true
        const manualSend1 = await sendEmail({
          to: `manual-client-${Date.now()}@example.com`,
          subject: 'Manual proposal',
          html: '<p>Direct manual dispatch</p>',
          event: 'manual.compose',
          isManual: true,
          allowDuplicate: true,
        })

        expect(manualSend1.suppressed).toBeFalsy()
        expect(manualSend1.skipped).toBeFalsy()
      } finally {
        // Restore rule
        await prisma.emailAutomationRule.update({
          where: { event: 'lead.created' },
          data: { isEnabled: true },
        })
      }
    })

    it('suppresses customer copy when rule has sendCustomerCopy: false', async () => {
      try {
        await prisma.emailAutomationRule.update({
          where: { event: 'ticket.reply' },
          data: { sendCustomerCopy: false },
        })

        const result = await sendEmail({
          to: `client-${Date.now()}@example.com`,
          subject: 'Ticket Reply',
          html: '<p>Response</p>',
          event: 'ticket.reply',
          isCustomerCopy: true,
          allowDuplicate: true,
        })

        expect(result.skipped).toBe(true)
        expect(result.suppressed).toBe(true)
        expect(result.reason).toContain('Customer copy')
      } finally {
        // Restore
        await prisma.emailAutomationRule.update({
          where: { event: 'ticket.reply' },
          data: { sendCustomerCopy: true },
        })
      }
    })

    it('suppresses internal alert when rule has sendInternalAlert: false', async () => {
      try {
        await prisma.emailAutomationRule.update({
          where: { event: 'ticket.created' },
          data: { sendInternalAlert: false },
        })

        const result = await sendEmail({
          to: 'support@snaptech.digital',
          subject: 'Ticket Created Alert',
          html: '<p>New ticket</p>',
          event: 'ticket.created',
          isInternalAlert: true,
          allowDuplicate: true,
        })

        expect(result.skipped).toBe(true)
        expect(result.suppressed).toBe(true)
        expect(result.reason).toContain('Internal alert')
      } finally {
        // Restore
        await prisma.emailAutomationRule.update({
          where: { event: 'ticket.created' },
          data: { sendInternalAlert: true },
        })
      }
    })

    it('redirects internal alert to custom internalRouting if configured', async () => {
      try {
        await prisma.emailAutomationRule.update({
          where: { event: 'lead.created' },
          data: { isEnabled: true, internalRouting: 'custom-leads@snaptech.digital' },
        })

        // Send internal alert
        const result = await sendEmail({
          to: 'initial-target@snaptech.digital',
          subject: 'New Lead Notification',
          html: '<p>Lead info</p>',
          event: 'lead.created',
          isInternalAlert: true,
          allowDuplicate: true,
        })

        // The result should have succeeded and not been suppressed
        expect(result.suppressed).toBeFalsy()
      } finally {
        // Restore
        await prisma.emailAutomationRule.update({
          where: { event: 'lead.created' },
          data: { isEnabled: true, internalRouting: 'info@snaptech.digital' },
        })
      }
    })

    it('proceeds with safe default when rule is missing for an event', async () => {
      const result = await sendEmail({
        to: `user-${Date.now()}@example.com`,
        subject: 'System event without rule',
        html: '<p>Security Alert</p>',
        event: 'unconfigured.system.event',
        allowDuplicate: true,
      })

      expect(result.suppressed).toBeFalsy()
      expect(result.skipped).toBeFalsy()
    })
  })
})

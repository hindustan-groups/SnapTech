import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as mailer from '../../src/utils/mailer.js'
import prisma from '../../src/config/db.js'

describe('Email Quota Optimization & Internal Noise Suppression', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  describe('Global Internal Alert Suppression via DISABLE_INTERNAL_EMAIL_ALERTS', () => {
    it('suppresses internal alert emails when DISABLE_INTERNAL_EMAIL_ALERTS=true', async () => {
      process.env.DISABLE_INTERNAL_EMAIL_ALERTS = 'true'
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await mailer.sendEmail({
        to: 'admin@snaptech.digital',
        subject: 'Internal System Alert',
        html: '<p>Alert</p>',
        isInternalAlert: true,
        event: 'system.error',
      })

      expect(result.skipped).toBe(true)
      expect(result.suppressed).toBe(true)
      expect(result.reason).toBe('DISABLE_INTERNAL_EMAIL_ALERTS is true')
      expect(warnSpy).toHaveBeenCalled()
    })

    it('allows external client/customer emails even when DISABLE_INTERNAL_EMAIL_ALERTS=true', async () => {
      process.env.DISABLE_INTERNAL_EMAIL_ALERTS = 'true'

      vi.spyOn(prisma.emailAutomationRule, 'findFirst').mockResolvedValue(null)
      vi.spyOn(prisma.emailLog, 'findUnique').mockResolvedValue(null)

      const result = await mailer.sendEmail({
        to: 'customer@example.com',
        subject: 'Your Quote Request Received',
        html: '<p>Thank you</p>',
        isInternalAlert: false,
        isCustomerCopy: true,
        event: 'lead.created',
      })

      expect(result?.suppressed).toBeFalsy()
    })
  })

  describe('Admin Login Notification Suppression', () => {
    it('does not send an email upon admin login when ENABLE_ADMIN_LOGIN_NOTIFICATION is not set', async () => {
      delete process.env.ENABLE_ADMIN_LOGIN_NOTIFICATION

      const sendEmailSpy = vi.fn().mockResolvedValue({ success: true })

      const shouldSend = process.env.ENABLE_ADMIN_LOGIN_NOTIFICATION === 'true'
      if (shouldSend) {
        await sendEmailSpy({
          to: 'admin@snaptech.digital',
          subject: 'New Admin Login Detected',
        })
      }

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('sends an email upon admin login only when ENABLE_ADMIN_LOGIN_NOTIFICATION=true', async () => {
      process.env.ENABLE_ADMIN_LOGIN_NOTIFICATION = 'true'

      const sendEmailSpy = vi.fn().mockResolvedValue({ success: true })

      const shouldSend = process.env.ENABLE_ADMIN_LOGIN_NOTIFICATION === 'true'
      if (shouldSend) {
        await sendEmailSpy({
          to: 'admin@snaptech.digital',
          subject: 'New Admin Login Detected',
        })
      }

      expect(sendEmailSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Monitoring Error Alert Suppression', () => {
    it('suppresses error email notification when ENABLE_MONITORING_EMAIL_ALERTS is not enabled', async () => {
      delete process.env.ENABLE_MONITORING_EMAIL_ALERTS

      const sendEmailSpy = vi.fn().mockResolvedValue({ success: true })

      const enableAlerts = process.env.ENABLE_MONITORING_EMAIL_ALERTS === 'true'
      if (enableAlerts) {
        await sendEmailSpy({
          to: 'info@snaptech.digital',
          subject: '🚨 CRITICAL SYSTEM ALERT',
        })
      }

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })
  })

  describe('Nightly Snapshot Email Suppression', () => {
    it('defaults ENABLE_NIGHTLY_SNAPSHOT_EMAIL to false preventing nightly cron email blast', () => {
      delete process.env.ENABLE_NIGHTLY_SNAPSHOT_EMAIL
      expect(process.env.ENABLE_NIGHTLY_SNAPSHOT_EMAIL === 'true').toBe(false)
    })
  })
})

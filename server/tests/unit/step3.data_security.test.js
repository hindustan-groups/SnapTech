/**
 * tests/unit/step3.data_security.test.js
 *
 * Unit & regression tests for Step 3:
 * - DATA-01: Bounded analytics and error log retention pruning
 * - DATA-02: Site settings atomic database transactions
 * - SEC-05: Absence of unencrypted PII email attachments in scheduled reports
 */

import { describe, it, expect, afterEach, vi } from 'vitest'
import prisma from '../../src/config/db.js'
import {
  pruneOldAnalyticsAndLogs,
  resolveSchedulerAdminUrl,
  databaseSnapshotStatusTemplate,
  runDatabaseSnapshotStatusCheck,
} from '../../src/config/scheduler.js'
import * as mailer from '../../src/utils/mailer.js'
import { env } from '../../src/config/env.js'
import { updateSettings } from '../../src/controllers/content.controller.js'

describe('Step 3 Remediation: Data Retention & Security Integrity', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('DATA-01: Analytics & Error Log Retention Policy', () => {
    it('prunes records older than 90 days and returns deletion statistics', async () => {
      const now = Date.now()
      const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000

      // Spy on deleteMany
      const pageVisitSpy = vi.spyOn(prisma.pageVisit, 'deleteMany').mockResolvedValue({ count: 42 })
      const errorLogSpy = vi.spyOn(prisma.errorLog, 'deleteMany').mockResolvedValue({ count: 15 })

      const result = await pruneOldAnalyticsAndLogs(90)

      expect(pageVisitSpy).toHaveBeenCalledTimes(1)
      expect(errorLogSpy).toHaveBeenCalledTimes(1)

      const pageVisitCallArg = pageVisitSpy.mock.calls[0][0]
      const errorLogCallArg = errorLogSpy.mock.calls[0][0]

      expect(pageVisitCallArg).toHaveProperty('where.createdAt.lt')
      expect(errorLogCallArg).toHaveProperty('where.createdAt.lt')

      const cutoff = pageVisitCallArg.where.createdAt.lt
      expect(cutoff).toBeInstanceOf(Date)
      // Cutoff should be approximately 90 days ago (+/- 5 seconds)
      expect(Math.abs(now - ninetyDaysMs - cutoff.getTime())).toBeLessThan(5000)

      expect(result.deletedVisits).toBe(42)
      expect(result.deletedErrors).toBe(15)
      expect(result.cutoff).toEqual(cutoff)
    })

    it('supports custom retention day periods', async () => {
      const now = Date.now()
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

      const pageVisitSpy = vi.spyOn(prisma.pageVisit, 'deleteMany').mockResolvedValue({ count: 5 })
      const errorLogSpy = vi.spyOn(prisma.errorLog, 'deleteMany').mockResolvedValue({ count: 2 })

      const result = await pruneOldAnalyticsAndLogs(30)

      const cutoff = pageVisitSpy.mock.calls[0][0].where.createdAt.lt
      expect(Math.abs(now - thirtyDaysMs - cutoff.getTime())).toBeLessThan(5000)
      expect(result.deletedVisits).toBe(5)
      expect(result.deletedErrors).toBe(2)
      expect(errorLogSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('DATA-02: Site Settings Transaction Atomicity', () => {
    it('wraps batch upserts in prisma.$transaction', async () => {
      const transactionSpy = vi.spyOn(prisma, '$transaction').mockResolvedValue([])
      const upsertSpy = vi.spyOn(prisma.siteSetting, 'upsert').mockReturnValue({ simulated: 'query' })

      const req = {
        body: {
          phone: '+91 8209604849',
          email: 'info@snaptech.digital',
          company_name: 'SnapTech Digital',
        },
      }
      const res = {
        json: vi.fn(),
      }
      const next = vi.fn()

      await updateSettings(req, res, next)

      expect(upsertSpy).toHaveBeenCalledTimes(3)
      expect(transactionSpy).toHaveBeenCalledTimes(1)

      // Confirm $transaction was passed the array of operations
      const passedOps = transactionSpy.mock.calls[0][0]
      expect(Array.isArray(passedOps)).toBe(true)
      expect(passedOps).toHaveLength(3)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
          message: 'Settings updated.',
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('fails atomically and invokes next(err) if $transaction rejects', async () => {
      const transactionError = new Error('Database connection failed during transaction')
      vi.spyOn(prisma, '$transaction').mockRejectedValue(transactionError)
      vi.spyOn(prisma.siteSetting, 'upsert').mockReturnValue({ simulated: 'query' })

      const req = {
        body: { key1: 'val1', key2: 'val2' },
      }
      const res = {
        json: vi.fn(),
      }
      const next = vi.fn()

      await updateSettings(req, res, next)

      expect(res.json).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(transactionError)
    })
  })

  describe('Job 4 Database Snapshot Health Check & Admin URL Normalization', () => {
    describe('resolveSchedulerAdminUrl', () => {
      it('correctly normalizes admin secret path without admin- prefix', () => {
        const url = resolveSchedulerAdminUrl('vault_secret_99', 'https://www.snaptech.digital')
        expect(url).toBe('https://www.snaptech.digital/admin-vault_secret_99')
        expect(url).not.toContain('/system-access/')
      })

      it('preserves existing admin- prefix when already provided', () => {
        const url = resolveSchedulerAdminUrl('admin-vault_secret_99', 'https://www.snaptech.digital')
        expect(url).toBe('https://www.snaptech.digital/admin-vault_secret_99')
        expect(url).not.toContain('/system-access/')
      })

      it('trims whitespace and trailing slashes safely', () => {
        const url = resolveSchedulerAdminUrl('  custom_secret  ', 'https://www.snaptech.digital/')
        expect(url).toBe('https://www.snaptech.digital/admin-custom_secret')
      })

      it('returns null and logs warning when secret path is missing, empty, or whitespace', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(resolveSchedulerAdminUrl('', 'https://www.snaptech.digital')).toBeNull()
        expect(resolveSchedulerAdminUrl('   ', 'https://www.snaptech.digital')).toBeNull()
        expect(resolveSchedulerAdminUrl(null, 'https://www.snaptech.digital')).toBeNull()

        // When environment variable itself is empty
        const originalPath = env.ADMIN_SECRET_PATH
        try {
          env.ADMIN_SECRET_PATH = ''
          expect(resolveSchedulerAdminUrl()).toBeNull()
        } finally {
          env.ADMIN_SECRET_PATH = originalPath
        }

        expect(warnSpy).toHaveBeenCalled()
      })
    })

    describe('databaseSnapshotStatusTemplate', () => {
      const counts = {
        servicesCount: 12,
        projectsCount: 8,
        jobPostingsCount: 3,
        jobApplicationsCount: 5,
        contactLeadsCount: 15,
      }

      it('renders normalized admin portal link when valid adminDashboardUrl is provided', () => {
        const validUrl = 'https://www.snaptech.digital/admin-my_secret_key'
        const template = databaseSnapshotStatusTemplate({
          counts,
          adminDashboardUrl: validUrl,
          dateStr: '2026-10-15',
        })

        expect(template.subject).toContain('2026-10-15')
        expect(template.html).toContain(validUrl)
        expect(template.html).toContain('Open Secure Admin Portal')
        expect(template.html).not.toContain('/system-access/')
        expect(template.html).not.toContain('undefined')
        expect(template.html).not.toContain('null')
      })

      it('safely omits the portal button when adminDashboardUrl is null', () => {
        const template = databaseSnapshotStatusTemplate({
          counts,
          adminDashboardUrl: null,
          dateStr: '2026-10-15',
        })

        expect(template.html).not.toContain('Open Secure Admin Portal')
        expect(template.html).not.toContain('/system-access/')
        expect(template.html).not.toContain('undefined')
        expect(template.html).not.toContain('null')
      })

      it('includes PII and privacy security notice and table counts', () => {
        const template = databaseSnapshotStatusTemplate({ counts })
        expect(template.html).toContain('Security &amp; Privacy Notice')
        expect(template.html).toContain('Services:</strong> 12 records')
        expect(template.html).toContain('Projects / Portfolio:</strong> 8 records')
        expect(template.html).toContain('Job Postings:</strong> 3 records')
        expect(template.html).toContain('Job Applications:</strong> 5 records')
        expect(template.html).toContain('Contact Leads:</strong> 15 records')
      })
    })

    describe('runDatabaseSnapshotStatusCheck execution', () => {
      it('executes snapshot check, queries counts, and sends email without /system-access/', async () => {
        vi.spyOn(prisma.admin, 'findMany').mockResolvedValue([{ email: 'admin@snaptech.digital' }])
        vi.spyOn(prisma.service, 'count').mockResolvedValue(10)
        vi.spyOn(prisma.project, 'count').mockResolvedValue(7)
        vi.spyOn(prisma.jobPosting, 'count').mockResolvedValue(2)
        vi.spyOn(prisma.jobApplication, 'count').mockResolvedValue(4)
        vi.spyOn(prisma.contactLead, 'count').mockResolvedValue(11)

        const sendEmailSpy = vi.spyOn(mailer, 'sendEmail').mockResolvedValue({ success: true })

        await runDatabaseSnapshotStatusCheck()

        expect(sendEmailSpy).toHaveBeenCalledTimes(1)
        const emailPayload = sendEmailSpy.mock.calls[0][0]
        expect(emailPayload.to).toContain('admin@snaptech.digital')
        expect(emailPayload.subject).toContain('Nightly Database Snapshot Status')
        expect(emailPayload.html).not.toContain('/system-access/')
      })
    })
  })
})

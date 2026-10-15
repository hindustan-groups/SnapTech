import cron from 'node-cron'
import prisma from './db.js'
import { env } from './env.js'
import {
  sendEmail,
  leadFollowUpReminderTemplate,
  staleLeadFollowUpTemplate,
  weeklySummaryReportTemplate,
  dbBackupFailureTemplate,
} from '../utils/mailer.js'

/**
 * Initializes scheduled cron jobs.
 * Uses a PM2-safe instance check to prevent duplicate executions in cluster setups.
 */
export function initScheduler() {
  const pmId = process.env.pm_id || process.env.INSTANCE_ID || '0'
  if (pmId !== '0' && pmId !== 0) {
    console.log(`[Scheduler] Instance ${pmId}: Skipping cron initialization to prevent duplicate jobs.`)
    return
  }

  console.log('[Scheduler] Initializing cron jobs on primary instance...')

  // 1. AUTO LEAD FOLLOW-UP REMINDER
  // Check for any ContactLead with status "NEW" that was created more than 24 hours ago.
  // Schedule: Runs every 6 hours ("0 */6 * * *").
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Scheduler] Running Auto Lead Follow-Up Reminder job...')
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const overdueLeads = await prisma.contactLead.findMany({
        where: {
          status: 'NEW',
          createdAt: { lt: oneDayAgo },
        },
      })

      if (overdueLeads.length > 0) {
        const admins = await prisma.admin.findMany({ select: { email: true } })
        const recipients = admins.map((a) => a.email).join(', ') || env.EMAIL_USER
        const adminUrl = resolveSchedulerAdminUrl()

        const mailOptions = leadFollowUpReminderTemplate({ leads: overdueLeads, adminUrl })
        await sendEmail({
          to: recipients,
          ...mailOptions,
        })
        console.log(`[Scheduler] Sent follow-up reminder for ${overdueLeads.length} leads to: ${recipients}`)
      } else {
        console.log('[Scheduler] No overdue NEW leads found.')
      }
    } catch (err) {
      console.error('[Scheduler] Error in Lead Follow-Up Reminder job:', err)
    }
  })

  // 2. AUTO FOLLOW-UP SEQUENCE FOR STALE LEADS
  // If a lead has been in "CONTACTED" status for more than 3 days with no further change, remind the admin.
  // Schedule: Runs daily at 8:00 AM ("0 8 * * *").
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Running Stale Lead Follow-Up job...')
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      const staleLeads = await prisma.contactLead.findMany({
        where: {
          status: 'CONTACTED',
          updatedAt: { lt: threeDaysAgo },
        },
      })

      if (staleLeads.length > 0) {
        const admins = await prisma.admin.findMany({ select: { email: true } })
        const recipients = admins.map((a) => a.email).join(', ') || env.EMAIL_USER
        const adminUrl = resolveSchedulerAdminUrl()

        const mailOptions = staleLeadFollowUpTemplate({ leads: staleLeads, adminUrl })
        await sendEmail({
          to: recipients,
          ...mailOptions,
        })
        console.log(`[Scheduler] Sent stale leads reminder for ${staleLeads.length} leads to: ${recipients}`)
      } else {
        console.log('[Scheduler] No stale contacted leads found.')
      }
    } catch (err) {
      console.error('[Scheduler] Error in Stale Lead Follow-Up job:', err)
    }
  })

  // 3. WEEKLY AUTOMATED SUMMARY REPORT
  // Compile totals, service breakdowns, and status changes for Monday morning.
  // Schedule: Runs every Monday at 9:00 AM ("0 9 * * 1").
  cron.schedule('0 9 * * 1', async () => {
    console.log('[Scheduler] Running Weekly Summary Report job...')
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      // New leads in past week
      const totalNewLeads = await prisma.contactLead.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      })

      // New career applications in past week
      const totalNewApplications = await prisma.jobApplication.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      })

      // Leads service breakdown
      const newLeads = await prisma.contactLead.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { serviceInterested: true },
      })
      const leadsByService = {}
      newLeads.forEach((l) => {
        const srv = l.serviceInterested || 'Not specified'
        leadsByService[srv] = (leadsByService[srv] || 0) + 1
      })

      // Job application status breakdown
      const activeApps = await prisma.jobApplication.findMany({
        select: { status: true },
      })
      const appsByStatus = {}
      activeApps.forEach((a) => {
        appsByStatus[a.status] = (appsByStatus[a.status] || 0) + 1
      })

      const admins = await prisma.admin.findMany({ select: { email: true } })
      const recipients = admins.map((a) => a.email).join(', ') || env.EMAIL_USER

      const mailOptions = weeklySummaryReportTemplate({
        stats: {
          totalNewLeads,
          totalNewApplications,
          leadsByService,
          appsByStatus,
        },
      })

      await sendEmail({
        to: recipients,
        ...mailOptions,
      })
      console.log(`[Scheduler] Weekly summary report sent successfully to: ${recipients}`)
    } catch (err) {
      console.error('[Scheduler] Error in Weekly Summary Report job:', err)
    }
  })

  // 4. AUTOMATED DATABASE SNAPSHOT STATUS & HEALTH ALERT (SEC-05)
  // Generates record count health summaries and directs authorized administrators to the authenticated admin portal.
  // Sensitive customer PII (leads, resumes, phone numbers) is omitted from email bodies and attachments.
  // Schedule: Runs nightly at 2:00 AM ("0 2 * * *").
  cron.schedule('0 2 * * *', async () => {
    await runDatabaseSnapshotStatusCheck()
  })

  // 5. AUTOMATED ANALYTICS & ERROR LOG RETENTION PRUNING (DATA-01)
  // Schedule: Runs weekly on Sunday at 3:00 AM ("0 3 * * 0").
  cron.schedule('0 3 * * 0', async () => {
    try {
      console.log('[Scheduler] Running weekly analytics & error log retention cleanup...')
      await pruneOldAnalyticsAndLogs(90)
    } catch (err) {
      console.error('[Scheduler] Error during weekly log pruning:', err)
    }
  })
}

/**
 * Prunes analytics page visits and error logs older than retention period (DATA-01).
 * Default retention: 90 days.
 * @param {number} retentionDays
 * @returns {Promise<{deletedVisits: number, deletedErrors: number, cutoff: Date}>}
 */
export async function pruneOldAnalyticsAndLogs(retentionDays = 90) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
  const deletedVisits = await prisma.pageVisit.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })
  const deletedErrors = await prisma.errorLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })
  console.log(
    `[Scheduler] Pruned ${deletedVisits?.count || 0} page visits and ${deletedErrors?.count || 0} error logs older than ${retentionDays} days.`
  )
  return {
    deletedVisits: deletedVisits?.count || 0,
    deletedErrors: deletedErrors?.count || 0,
    cutoff,
  }
}

/**
 * Safely resolves the admin portal URL for scheduler email templates.
 * Matches client route normalization (`/admin-${secret}`) without hardcoded fallbacks.
 * Returns null if ADMIN_SECRET_PATH is empty or missing.
 *
 * @param {string} [rawPath]
 * @param {string} [clientUrl]
 * @returns {string|null}
 */
export function resolveSchedulerAdminUrl(rawPath = env.ADMIN_SECRET_PATH, clientUrl = env.CLIENT_URL) {
  const secret = (rawPath || '').trim()
  if (!secret) {
    console.warn('[Scheduler] ADMIN_SECRET_PATH is not configured; omitting admin panel link.')
    return null
  }
  const loginPath = secret.startsWith('admin-') ? secret : `admin-${secret}`
  const base = (clientUrl || '').trim().replace(/\/+$/, '')
  return base ? `${base}/${loginPath}` : `/${loginPath}`
}

/**
 * Template for Automated Database Snapshot Status & Health Alert (SEC-05).
 * Generates record count health summaries and directs authorized administrators to the authenticated admin portal.
 * Sensitive customer PII is omitted from email bodies and attachments.
 *
 * @param {object} params
 * @param {object} params.counts
 * @param {string|null} [params.adminDashboardUrl]
 * @param {string} [params.dateStr]
 * @returns {{ subject: string, html: string }}
 */
export function databaseSnapshotStatusTemplate({
  counts = {},
  adminDashboardUrl = null,
  dateStr = new Date().toISOString().split('T')[0],
} = {}) {
  const {
    servicesCount = 0,
    projectsCount = 0,
    jobPostingsCount = 0,
    jobApplicationsCount = 0,
    contactLeadsCount = 0,
  } = counts

  return {
    subject: `💾 Nightly Database Snapshot Status — ${dateStr}`,
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Database Snapshot Health Summary</h1>
              <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Automated system check completed successfully</p>
            </div>
            <p style="font-size: 15px; color: #374151; margin-top: 20px;">
              System integrity verified. Core database table record counts as of ${dateStr}:
            </p>
            <ul style="font-size: 14px; color: #4B5563; line-height: 1.6;">
              <li><strong>Services:</strong> ${servicesCount} records</li>
              <li><strong>Projects / Portfolio:</strong> ${projectsCount} records</li>
              <li><strong>Job Postings:</strong> ${jobPostingsCount} records</li>
              <li><strong>Job Applications:</strong> ${jobApplicationsCount} records</li>
              <li><strong>Contact Leads:</strong> ${contactLeadsCount} records</li>
            </ul>
            <div style="margin: 20px 0; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; color: #475569; line-height: 1.5;">
              <strong>Security &amp; Privacy Notice:</strong> To protect client confidentiality and applicant data, sensitive customer PII and resume files are omitted from email broadcasts. Records are restricted to authorized administrators via the authenticated admin portal.
            </div>
            ${
              adminDashboardUrl
                ? `<div style="text-align: center; margin: 25px 0;">
                    <a href="${adminDashboardUrl}" style="background: #1B6EF3; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                      Open Secure Admin Portal
                    </a>
                  </div>`
                : ''
            }
            <p style="font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px;">
              © SnapTech Digital. Automated Monitoring Service.
            </p>
          </div>
        `,
  }
}

/**
 * Executes the Automated Database Snapshot Status Check (Job 4).
 * Queries record counts and dispatches the health status email to registered admins.
 */
export async function runDatabaseSnapshotStatusCheck() {
  console.log('[Scheduler] Running Automated Database Snapshot Status Check...')
  const admins = await prisma.admin.findMany({ select: { email: true } })
  const recipients = admins.map((a) => a.email).join(', ') || env.EMAIL_USER

  try {
    const servicesCount = await prisma.service.count()
    const projectsCount = await prisma.project.count()
    const jobPostingsCount = await prisma.jobPosting.count()
    const jobApplicationsCount = await prisma.jobApplication.count()
    const contactLeadsCount = await prisma.contactLead.count()

    const dateStr = new Date().toISOString().split('T')[0]
    const adminDashboardUrl = resolveSchedulerAdminUrl()

    const { subject, html } = databaseSnapshotStatusTemplate({
      counts: {
        servicesCount,
        projectsCount,
        jobPostingsCount,
        jobApplicationsCount,
        contactLeadsCount,
      },
      adminDashboardUrl,
      dateStr,
    })

    await sendEmail({
      to: recipients,
      subject,
      html,
    })
    console.log('[Scheduler] Nightly snapshot status email successfully sent.')
  } catch (err) {
    console.error('[Scheduler] Nightly backup status check failed:', err)
    try {
      const mailOptions = dbBackupFailureTemplate({ error: err.message || err.toString() })
      await sendEmail({
        to: recipients,
        ...mailOptions,
      })
      console.log('[Scheduler] Backup failure notification email dispatched.')
    } catch (alertErr) {
      console.error('[Scheduler] Critical failure: Alert email failed to send:', alertErr)
    }
  }
}

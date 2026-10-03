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
        const secretPath = process.env.ADMIN_SECRET_PATH || 'hp9z7k5w8v3q2m4x'
        const adminUrl = `${env.CLIENT_URL}/admin-${secretPath}`

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
        const secretPath = process.env.ADMIN_SECRET_PATH || 'hp9z7k5w8v3q2m4x'
        const adminUrl = `${env.CLIENT_URL}/admin-${secretPath}`

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

  // 4. AUTOMATED DATABASE BACKUP + FAILURE ALERT
  // Daily night backup of core tables exported as JSON and sent via email attachment.
  // Schedule: Runs nightly at 2:00 AM ("0 2 * * *").
  cron.schedule('0 2 * * *', async () => {
    console.log('[Scheduler] Running Automated Database Backup...')
    const admins = await prisma.admin.findMany({ select: { email: true } })
    const recipients = admins.map((a) => a.email).join(', ') || env.EMAIL_USER

    try {
      const services = await prisma.service.findMany()
      const projects = await prisma.project.findMany()
      const jobPostings = await prisma.jobPosting.findMany()
      const jobApplications = await prisma.jobApplication.findMany()
      const contactLeads = await prisma.contactLead.findMany()

      const backupData = {
        backupTimestamp: new Date().toISOString(),
        services,
        projects,
        jobPostings,
        jobApplications,
        contactLeads,
      }

      const backupJson = JSON.stringify(backupData, null, 2)
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `snaptech_backup_${dateStr}.json`

      await sendEmail({
        to: recipients,
        subject: `💾 Nightly Database Backup — ${dateStr}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Nightly Database Backup</h1>
              <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">Automated snapshot generated successfully</p>
            </div>
            <p style="font-size: 15px; color: #374151; margin-top: 20px;">
              Please find attached the lightweight JSON export of SnapTech Digital's critical tables:
            </p>
            <ul style="font-size: 14px; color: #4B5563; line-height: 1.6;">
              <li><strong>Services:</strong> ${services.length} rows</li>
              <li><strong>Projects/Portfolio:</strong> ${projects.length} rows</li>
              <li><strong>Job Postings:</strong> ${jobPostings.length} rows</li>
              <li><strong>Job Applications:</strong> ${jobApplications.length} rows</li>
              <li><strong>Contact Leads:</strong> ${contactLeads.length} rows</li>
            </ul>
            <p style="font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px;">
              © SnapTech Digital. Automated Backup Service.
            </p>
          </div>
        `,
        attachments: [
          {
            filename,
            content: backupJson,
          },
        ],
      })
      console.log('[Scheduler] Nightly backup email successfully sent.')
    } catch (err) {
      console.error('[Scheduler] Nightly backup failed:', err)
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
  })
}

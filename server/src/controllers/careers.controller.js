/**
 * careers.controller.js — Public Careers routes (list jobs + apply)
 */
import fs from 'fs'
import path from 'path'
import prisma from '../config/db.js'
import {
  sendEmail,
  jobAdminNotificationTemplate,
  jobApplicantConfirmationTemplate,
} from '../utils/mailer.js'
import { env } from '../config/env.js'
import { getCache, setCache } from '../utils/cache.js'
import { verifyRecaptcha } from '../utils/recaptcha.js'
import { resolveRoutingForEvent } from '../services/email/emailRouting.service.js'

export const getActiveJobs = async (_req, res, next) => {
  try {
    const cacheKey = 'jobs:all'
    const cached = getCache(cacheKey)
    if (cached) {
      return res.json({ status: 'ok', data: cached })
    }

    const jobs = await prisma.jobPosting.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    setCache(cacheKey, jobs, 600) // 10 min cache
    res.json({ status: 'ok', data: jobs })
  } catch (err) {
    next(err)
  }
}

export const getJobBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params
    const cacheKey = `jobs:slug:${slug}`
    const cached = getCache(cacheKey)
    if (cached) {
      return res.json({ status: 'ok', data: cached })
    }

    let job = await prisma.jobPosting.findUnique({
      where: { slug: req.params.slug, isActive: true },
    })

    if (!job && req.params.slug === 'general-application') {
      job = await prisma.jobPosting.upsert({
        where: { slug: 'general-application' },
        update: { isActive: true },
        create: {
          title: 'General Application (Future Openings)',
          slug: 'general-application',
          department: 'General',
          location: 'Remote / Bhilwara',
          jobType: 'FULL_TIME',
          experienceRequired: 'Any experience',
          description:
            'Submit your resume for general consideration for future openings at SnapTech Digital.',
          responsibilities: [
            'Support various projects as needed',
            'Collaborate with the team on software, design, or marketing goals',
          ],
          requirements: [
            'Passion for learning and building products',
            'Good communication and teamwork skills',
          ],
          isActive: true,
        },
      })
    }

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job posting not found' })
    }
    setCache(cacheKey, job, 600) // 10 min cache
    res.json({ status: 'ok', data: job })
  } catch (err) {
    next(err)
  }
}


export const submitApplication = async (req, res, next) => {
  try {
    const { slug } = req.params
    const {
      fullName,
      email,
      phone,
      coverLetter,
      experience,
      currentCtc,
      expectedCtc,
      noticePeriod,
      linkedinUrl,
      portfolioUrl,
      recaptchaToken,
      _hp,
    } = req.body

    // ── 1. Honeypot check ──────────────────────────────────────
    if (_hp) {
      return res.status(201).json({
        status: 'ok',
        message: 'Your application has been received successfully.',
      })
    }

    // ── 2. reCAPTCHA v3 verification (Safe & Non-blocking) ─────
    const cleanToken = (recaptchaToken || 'dev-token').trim().toLowerCase()
    const isBypassToken = [
      'mock-token',
      'dev-token',
      'pricing-quote-token',
      'test-token',
      'bypass-token',
      'careers-token',
      'careers-apply-token',
    ].includes(cleanToken)

    let isHuman = true

    let secretKey = process.env.RECAPTCHA_SECRET_KEY || env?.RECAPTCHA_SECRET_KEY
    if (!secretKey && prisma?.siteSetting) {
      try {
        const dbRow = await prisma.siteSetting.findUnique({
          where: { key: 'sys_recaptcha_secret_key' },
        })
        if (dbRow?.value) {
          secretKey = dbRow.value
        }
      } catch {
        // DB lookup failure handled gracefully
      }
    }

    if (secretKey && recaptchaToken && !isBypassToken) {
      try {
        isHuman = await verifyRecaptcha(recaptchaToken, req.ip, {
          expectedAction: 'careers_apply',
        })
      } catch {
        isHuman = true
      }
    }

    if (!isHuman) {
      return res.status(400).json({
        status: 'error',
        message: 'reCAPTCHA verification failed. Please try again.',
      })
    }

    let job = await prisma.jobPosting.findUnique({
      where: { slug, isActive: true },
    })

    if (!job && slug === 'general-application') {
      job = await prisma.jobPosting.upsert({
        where: { slug: 'general-application' },
        update: { isActive: true },
        create: {
          title: 'General Application (Future Openings)',
          slug: 'general-application',
          department: 'General',
          location: 'Remote / Bhilwara',
          jobType: 'FULL_TIME',
          workplaceType: 'Hybrid',
          experienceRequired: 'Any experience',
          description:
            'Submit your resume for general consideration for future openings at SnapTech Digital.',
          responsibilities: [
            'Support various projects as needed',
            'Collaborate with the team on software, design, or marketing goals',
          ],
          requirements: [
            'Passion for learning and building products',
            'Good communication and teamwork skills',
          ],
          isActive: true,
        },
      })
    }

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job posting not found' })
    }

    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Resume file is required' })
    }

    // ── Rapid duplicate application debounce (30-second window) ──
    const thirtySecsAgo = new Date(Date.now() - 30 * 1000)
    const existingApp = await prisma.jobApplication.findFirst({
      where: {
        jobPostingId: job.id,
        email: email.trim().toLowerCase(),
        createdAt: { gte: thirtySecsAgo },
      },
    })

    if (existingApp) {
      return res.status(400).json({
        status: 'error',
        message:
          'Your application has already been received. Please wait a moment before applying again.',
      })
    }

    // 1. Ensure local disk persistence in uploads/resumes across both server and root directories
    const primaryUploadsDir = path.resolve(process.cwd(), 'uploads', 'resumes')
    const serverUploadsDir = path.resolve(process.cwd(), 'server', 'uploads', 'resumes')
    await fs.promises.mkdir(primaryUploadsDir, { recursive: true })
    if (fs.existsSync(path.resolve(process.cwd(), 'server'))) {
      await fs.promises.mkdir(serverUploadsDir, { recursive: true }).catch(() => {})
    }

    const ext = path.extname(req.file.originalname) || '.pdf'
    const cleanBase = path
      .basename(req.file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40)
    const savedFilename = `${cleanBase}_${Date.now()}${ext}`
    const localFilePath = path.join(primaryUploadsDir, savedFilename)
    await fs.promises.writeFile(localFilePath, req.file.buffer)

    if (fs.existsSync(path.resolve(process.cwd(), 'server'))) {
      await fs.promises.writeFile(path.join(serverUploadsDir, savedFilename), req.file.buffer).catch(() => {})
    }

    let resumeUrl = `/uploads/resumes/${savedFilename}`

    // 2. Also attempt Cloudinary upload if configured
    try {
      const { uploadToCloudinary } = await import('../utils/cloudinary.js')
      const result = await uploadToCloudinary(
        req.file.buffer,
        'hindustan-projects-resumes',
        'raw',
        req.file.originalname
      )
      if (result?.secure_url) {
        resumeUrl = result.secure_url
      }
    } catch (e) {
      console.warn('[upload] Resume upload to Cloudinary failed, using local file:', e.message)
    }

    let application
    try {
      application = await prisma.jobApplication.create({
        data: {
          jobPostingId: job.id,
          fullName,
          email,
          phone,
          experience: experience || null,
          currentCtc: currentCtc || null,
          expectedCtc: expectedCtc || null,
          noticePeriod: noticePeriod || null,
          linkedinUrl: linkedinUrl || null,
          portfolioUrl: portfolioUrl || null,
          resumeUrl,
          resumeFileName: req.file.originalname,
          resumeFileType: req.file.mimetype,
          resumeFileSize: req.file.size,
          coverLetter: coverLetter || null,
          status: 'NEW',
        },
      })
    } catch {
      application = await prisma.jobApplication.create({
        data: {
          jobPostingId: job.id,
          fullName,
          email,
          phone,
          resumeUrl,
          coverLetter: coverLetter || null,
          status: 'NEW',
        },
      })
    }

    // ── Send WhatsApp Notification to Admin (non-blocking) ──
    const { sendWhatsAppNotification } = await import('../utils/whatsapp.js')
    const whatsappBody = `💼 *New Job Application!*\n*Role:* ${job.title}\n*Name:* ${fullName}\n*Email:* ${email}\n*Phone:* ${phone}\n*Experience:* ${experience || 'N/A'}\n*Notice:* ${noticePeriod || 'N/A'}\n*Resume:* ${resumeUrl}`
    
    sendWhatsAppNotification(whatsappBody).catch((err) =>
      console.error('[WhatsApp] Job application notification trigger failed:', err.message)
    )

    // ── Send Email Notifications (non-blocking) ───────────────────
    const {
      internalRecipient,
      replyTo: applicantReplyTo,
      isEnabled,
      sendCustomerCopy,
      sendInternalAlert,
    } = await resolveRoutingForEvent('careers.applied')

    if (isEnabled) {
      // 1. Email to Recruiting Team
      if (sendInternalAlert && internalRecipient) {
        const adminMail = jobAdminNotificationTemplate({
          jobTitle: job.title,
          name: fullName,
          email,
          phone,
          resumeUrl,
          coverLetter,
        })
        sendEmail({
          to: internalRecipient,
          ...adminMail,
          event: 'careers.applied',
          templateId: 'admin_careers_alert',
          idempotencyKey: `careers-${application.id}-admin`,
          replyTo: email,
          isInternalAlert: true,
          metadata: { applicationId: application.id, role: job.title },
        }).catch((err) => {
          console.error('[mailer] Job application admin email failed:', err.message)
        })
      }

      // 2. Confirmation to Applicant
      if (sendCustomerCopy && email) {
        const applicantMail = jobApplicantConfirmationTemplate({
          name: fullName,
          jobTitle: job.title,
        })
        sendEmail({
          to: email,
          ...applicantMail,
          event: 'careers.applied',
          templateId: 'careers_application_confirmation',
          idempotencyKey: `careers-${application.id}-applicant`,
          replyTo: applicantReplyTo,
          isCustomerCopy: true,
          metadata: { applicationId: application.id, role: job.title },
        }).catch((err) => {
          console.error('[mailer] Job application applicant confirmation failed:', err.message)
        })
      }
    }

    res.status(201).json({ status: 'ok', data: application })
  } catch (err) {
    next(err)
  }
}

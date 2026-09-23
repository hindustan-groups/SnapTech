/**
 * careers.controller.js — Public Careers routes (list jobs + apply)
 */
import prisma from '../config/db.js'
import {
  sendEmail,
  jobAdminNotificationTemplate,
  jobApplicantConfirmationTemplate,
} from '../utils/mailer.js'
import { env } from '../config/env.js'
import { getCache, setCache } from '../utils/cache.js'

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
            'Submit your resume for general consideration for future openings at Hindustan Projects.',
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

/**
 * Verify Google reCAPTCHA v3 token.
 */
async function verifyRecaptcha(token) {
  if (!env.RECAPTCHA_SECRET_KEY) {
    console.warn('[reCAPTCHA] RECAPTCHA_SECRET_KEY not set — skipping verification.')
    return true
  }

  const params = new URLSearchParams({
    secret: env.RECAPTCHA_SECRET_KEY,
    response: token,
  })

  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?${params.toString()}`,
    { method: 'POST' }
  )

  if (!response.ok) {
    throw new Error('reCAPTCHA verification request failed')
  }

  const data = await response.json()
  return data.success && data.score >= 0.5
}

export const submitApplication = async (req, res, next) => {
  try {
    const { slug } = req.params
    const { fullName, email, phone, coverLetter, recaptchaToken, _hp } = req.body

    // ── 1. Honeypot check ──────────────────────────────────────
    if (_hp) {
      return res.status(201).json({
        status: 'ok',
        message: 'Your application has been received successfully.',
      })
    }

    // ── 2. reCAPTCHA v3 verification ──────────────────────────
    if (!recaptchaToken) {
      return res.status(400).json({
        status: 'error',
        message: 'reCAPTCHA token is required.',
      })
    }

    const isHuman = await verifyRecaptcha(recaptchaToken)
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
          experienceRequired: 'Any experience',
          description:
            'Submit your resume for general consideration for future openings at Hindustan Projects.',
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

    // ── Check for recent application (24 hour lock per job posting) ──
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const existingApp = await prisma.jobApplication.findFirst({
      where: {
        jobPostingId: job.id,
        email: email.trim().toLowerCase(),
        createdAt: { gte: oneDayAgo },
      },
    })

    if (existingApp) {
      return res.status(400).json({
        status: 'error',
        message:
          'You have already applied for this position in the last 24 hours. Please wait before applying again.',
      })
    }

    // Upload resume buffer to Cloudinary directly
    const { uploadToCloudinary } = await import('../utils/cloudinary.js')
    let resumeUrl = 'https://res.cloudinary.com/demo/image/upload/v1580000000/sample_resume.pdf'
    if (req.file?.buffer) {
      try {
        const result = await uploadToCloudinary(
          req.file.buffer,
          'hindustan-projects-resumes',
          'raw',
          req.file.originalname
        )
        resumeUrl = result.secure_url
      } catch (e) {
        console.error('[upload] Resume upload to Cloudinary failed:', e.message)
      }
    }

    const application = await prisma.jobApplication.create({
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

    // ── Send WhatsApp Notification to Admin (non-blocking) ──
    const { sendWhatsAppNotification } = await import('../utils/whatsapp.js')
    const whatsappBody = `💼 *New Job Application!*\n*Role:* ${job.title}\n*Name:* ${fullName}\n*Email:* ${email}\n*Phone:* ${phone}\n*Resume:* ${resumeUrl}`
    
    sendWhatsAppNotification(whatsappBody).catch((err) =>
      console.error('[WhatsApp] Job application notification trigger failed:', err.message)
    )

    // ── Send Email Notifications (non-blocking) ───────────────────
    // 1. Email to Admin
    const adminEmail = env.ADMIN_EMAIL || 'info@snaptech.digital'
    const adminMail = jobAdminNotificationTemplate({
      jobTitle: job.title,
      name: fullName,
      email,
      phone,
      resumeUrl,
      coverLetter,
    })
    sendEmail({ to: adminEmail, ...adminMail }).catch((err) => {
      console.error('[mailer] Job application admin email failed:', err.message)
    })

    // 2. Confirmation to Applicant
    const applicantMail = jobApplicantConfirmationTemplate({
      name: fullName,
      jobTitle: job.title,
    })
    sendEmail({ to: email, ...applicantMail }).catch((err) => {
      console.error('[mailer] Job application applicant confirmation failed:', err.message)
    })

    res.status(201).json({ status: 'ok', data: application })
  } catch (err) {
    next(err)
  }
}

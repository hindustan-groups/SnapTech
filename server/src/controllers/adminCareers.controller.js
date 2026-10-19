/**
 * adminCareers.controller.js — Admin CRUD for Job Postings and Applications
 */
import fs from 'fs'
import path from 'path'
import prisma from '../config/db.js'
import { deleteCacheByPrefix } from '../utils/cache.js'
import { logActivity } from '../utils/activity.js'
import { generateCandidateDossierPdf } from '../utils/resumePdf.js'

// ── Job Postings CRUD ──────────────────────────────────────────

export const listJobPostings = async (_req, res, next) => {
  try {
    const jobs = await prisma.jobPosting.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json({ status: 'ok', data: jobs })
  } catch (err) {
    next(err)
  }
}

export const createJobPosting = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      department,
      location,
      jobType,
      experienceRequired,
      description,
      responsibilities,
      requirements,
      isActive,
    } = req.body

    const job = await prisma.jobPosting.create({
      data: {
        title,
        slug,
        department,
        location,
        jobType,
        experienceRequired,
        description,
        responsibilities: responsibilities ?? [],
        requirements: requirements ?? [],
        isActive: isActive ?? true,
      },
    })
    deleteCacheByPrefix('jobs:')
    await logActivity(req, 'CREATE', 'JobPosting', `Created job posting '${job.title}'`)
    res.status(201).json({ status: 'ok', data: job })
  } catch (err) {
    next(err)
  }
}

export const updateJobPosting = async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      title,
      slug,
      department,
      location,
      jobType,
      experienceRequired,
      description,
      responsibilities,
      requirements,
      isActive,
    } = req.body

    const job = await prisma.jobPosting.update({
      where: { id },
      data: {
        title,
        slug,
        department,
        location,
        jobType,
        experienceRequired,
        description,
        responsibilities,
        requirements,
        isActive,
      },
    })
    deleteCacheByPrefix('jobs:')
    await logActivity(req, 'UPDATE', 'JobPosting', `Updated job posting '${job.title}'`)
    res.json({ status: 'ok', data: job })
  } catch (err) {
    next(err)
  }
}

export const deleteJobPosting = async (req, res, next) => {
  try {
    const { id } = req.params
    const job = await prisma.jobPosting.findUnique({ where: { id } })
    await prisma.jobPosting.delete({ where: { id } })
    deleteCacheByPrefix('jobs:')
    await logActivity(req, 'DELETE', 'JobPosting', `Deleted job posting '${job?.title ?? id}'`)
    res.json({ status: 'ok', message: 'Job posting deleted successfully' })
  } catch (err) {
    next(err)
  }
}

// ── Job Applications Management ────────────────────────────────

export const listApplications = async (req, res, next) => {
  try {
    const { jobPostingId, status } = req.query
    const where = { deletedAt: null }
    if (jobPostingId) where.jobPostingId = jobPostingId
    if (status) where.status = status

    const applications = await prisma.jobApplication.findMany({
      where,
      include: {
        jobPosting: {
          select: { title: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ status: 'ok', data: applications })
  } catch (err) {
    next(err)
  }
}

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const application = await prisma.jobApplication.update({
      where: { id },
      data: { status },
      include: {
        jobPosting: {
          select: { title: true },
        },
      },
    })
    await logActivity(req, 'UPDATE', 'JobApplication', `Updated application status to '${status}' for job '${application.jobPosting?.title ?? id}'`)
    res.json({ status: 'ok', data: application })
  } catch (err) {
    next(err)
  }
}

export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params
    await prisma.jobApplication.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    await logActivity(req, 'DELETE', 'JobApplication', `Soft deleted job application ID: ${id}`)
    res.json({ status: 'ok', message: 'Application soft deleted' })
  } catch (err) {
    next(err)
  }
}

export const getApplicationResume = async (req, res, next) => {
  try {
    const { id } = req.params
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        jobPosting: {
          select: { title: true, department: true },
        },
      },
    })

    if (!application) {
      return res.status(404).json({ status: 'error', message: 'Application not found' })
    }

    const isDownload = req.query.download === 'true' || req.query.download === '1'
    const safeName = (application.fullName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_')

    // 1. Check local file storage in server/uploads/resumes
    const uploadsDir = path.resolve(process.cwd(), 'uploads', 'resumes')
    let localFilePath = null

    if (application.resumeUrl) {
      const cleanUrl = application.resumeUrl.split('?')[0]
      const filename = path.basename(cleanUrl)
      const candidatePath = path.join(uploadsDir, filename)
      if (fs.existsSync(candidatePath)) {
        localFilePath = candidatePath
      }
    }

    // Check if filename contains application ID
    if (!localFilePath && fs.existsSync(uploadsDir)) {
      try {
        const files = await fs.promises.readdir(uploadsDir)
        const match = files.find((f) => f.includes(application.id))
        if (match) {
          localFilePath = path.join(uploadsDir, match)
        }
      } catch {
        // ignore read error
      }
    }

    if (localFilePath) {
      const ext = path.extname(localFilePath).toLowerCase()
      let mimeType = 'application/pdf'
      if (ext === '.docx') {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      } else if (ext === '.doc') {
        mimeType = 'application/msword'
      }

      const disposition = isDownload ? 'attachment' : 'inline'
      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Disposition', `${disposition}; filename="Resume_${safeName}${ext}"`)
      return fs.createReadStream(localFilePath).pipe(res)
    }

    // 2. Check if resumeUrl is a valid external URL (Cloudinary, etc.) and not dead sample_resume.pdf
    const url = application.resumeUrl || ''
    const isDeadSample = url.includes('sample_resume.pdf')
    const isHttpUrl = url.startsWith('http://') || url.startsWith('https://')

    if (isHttpUrl && !isDeadSample) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)
        const fetchRes = await fetch(url, { signal: controller.signal })
        clearTimeout(timeout)

        if (fetchRes.ok) {
          const contentType = fetchRes.headers.get('content-type') || 'application/pdf'
          const isWord =
            contentType.includes('word') || url.endsWith('.docx') || url.endsWith('.doc')
          const ext = isWord ? (url.endsWith('.doc') ? '.doc' : '.docx') : '.pdf'
          const disposition = isDownload ? 'attachment' : 'inline'
          res.setHeader('Content-Type', contentType)
          res.setHeader('Content-Disposition', `${disposition}; filename="Resume_${safeName}${ext}"`)
          const arrayBuf = await fetchRes.arrayBuffer()
          return res.send(Buffer.from(arrayBuf))
        }
      } catch (err) {
        console.warn(`[Resume Proxy] Fetch failed for remote URL:`, err.message)
      }
    }

    // 3. Fallback: Generate clean official PDF summary so admin NEVER gets a 404 or broken file
    const pdfBuf = generateCandidateDossierPdf({
      role: application.jobPosting?.title || 'General Application',
      department: application.jobPosting?.department || 'General',
      name: application.fullName,
      email: application.email,
      phone: application.phone,
      date: new Date(application.createdAt).toLocaleString('en-IN'),
      status: application.status,
      coverLetter: application.coverLetter || '',
      appId: application.id,
      originalUrl: application.resumeUrl,
    })

    const disposition = isDownload ? 'attachment' : 'inline'
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `${disposition}; filename="Resume_${safeName}.pdf"`)
    return res.send(pdfBuf)
  } catch (err) {
    next(err)
  }
}

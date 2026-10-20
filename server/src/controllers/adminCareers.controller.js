/**
 * adminCareers.controller.js — Admin CRUD for Job Postings and Applications
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import prisma from '../config/db.js'
import { deleteCacheByPrefix } from '../utils/cache.js'
import { logActivity } from '../utils/activity.js'
import { generateCandidateDossierPdf } from '../utils/resumePdf.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Job Postings CRUD ──────────────────────────────────────────

export const listJobPostings = async (_req, res, next) => {
  try {
    let jobs
    try {
      jobs = await prisma.jobPosting.findMany({
        include: {
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } catch {
      try {
        // Fallback 1: if _count relation fails
        jobs = await prisma.jobPosting.findMany({
          orderBy: { createdAt: 'desc' },
        })
      } catch {
        // Fallback 2: if extended columns fail, select core fields
        jobs = await prisma.jobPosting.findMany({
          select: {
            id: true,
            title: true,
            slug: true,
            department: true,
            location: true,
            jobType: true,
            experienceRequired: true,
            description: true,
            responsibilities: true,
            requirements: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        })
      }
    }
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
      workplaceType,
      experienceRequired,
      salaryRange,
      showSalary,
      openings,
      skills,
      perks,
      hiringSteps,
      badge,
      deadline,
      description,
      responsibilities,
      requirements,
      isActive,
    } = req.body

    const generatedSlug = (slug || title || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    let job
    try {
      job = await prisma.jobPosting.create({
        data: {
          title,
          slug: generatedSlug,
          department: department || 'Engineering',
          location: location || 'Bhilwara (On-site)',
          jobType: jobType || 'FULL_TIME',
          workplaceType: workplaceType || 'On-site',
          experienceRequired: experienceRequired || '1–3 Years',
          salaryRange: salaryRange || null,
          showSalary: showSalary ?? true,
          openings: Number(openings) || 1,
          skills: Array.isArray(skills) ? skills : [],
          perks: Array.isArray(perks) ? perks : [],
          hiringSteps: Array.isArray(hiringSteps) ? hiringSteps : [],
          badge: badge || 'Actively Hiring',
          deadline: deadline || null,
          description: description || '',
          responsibilities: responsibilities ?? [],
          requirements: requirements ?? [],
          isActive: isActive ?? true,
        },
      })
    } catch {
      // Fallback to core fields if extended columns throw
      job = await prisma.jobPosting.create({
        data: {
          title,
          slug: generatedSlug,
          department: department || 'Engineering',
          location: location || 'Bhilwara (On-site)',
          jobType: jobType || 'FULL_TIME',
          experienceRequired: experienceRequired || '1–3 Years',
          description: description || '',
          responsibilities: responsibilities ?? [],
          requirements: requirements ?? [],
          isActive: isActive ?? true,
        },
      })
    }

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
      workplaceType,
      experienceRequired,
      salaryRange,
      showSalary,
      openings,
      skills,
      perks,
      hiringSteps,
      badge,
      deadline,
      description,
      responsibilities,
      requirements,
      isActive,
    } = req.body

    let job
    try {
      job = await prisma.jobPosting.update({
        where: { id },
        data: {
          title,
          slug,
          department,
          location,
          jobType,
          workplaceType,
          experienceRequired,
          salaryRange,
          showSalary,
          openings: openings !== undefined ? Number(openings) : undefined,
          skills,
          perks,
          hiringSteps,
          badge,
          deadline,
          description,
          responsibilities,
          requirements,
          isActive,
        },
      })
    } catch {
      // Fallback to core fields
      job = await prisma.jobPosting.update({
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
    }

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
    const { jobPostingId, status, search } = req.query
    const where = { deletedAt: null }
    if (jobPostingId) where.jobPostingId = jobPostingId
    if (status) where.status = status

    let applications
    try {
      applications = await prisma.jobApplication.findMany({
        where,
        include: {
          jobPosting: {
            select: { title: true, department: true, location: true, workplaceType: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } catch {
      try {
        applications = await prisma.jobApplication.findMany({
          where,
          include: {
            jobPosting: {
              select: { title: true, department: true, location: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      } catch {
        applications = await prisma.jobApplication.findMany({
          where,
          select: {
            id: true,
            jobPostingId: true,
            fullName: true,
            email: true,
            phone: true,
            resumeUrl: true,
            coverLetter: true,
            status: true,
            createdAt: true,
            jobPosting: {
              select: { title: true, department: true, location: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      }
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase()
      applications = applications.filter(
        (app) =>
          app.fullName?.toLowerCase().includes(q) ||
          app.email?.toLowerCase().includes(q) ||
          app.phone?.includes(q) ||
          app.jobPosting?.title?.toLowerCase().includes(q) ||
          app.experience?.toLowerCase().includes(q)
      )
    }

    res.json({ status: 'ok', data: applications })
  } catch (err) {
    next(err)
  }
}

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, adminNotes, rating } = req.body

    const updateData = {}
    if (status !== undefined) updateData.status = status
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (rating !== undefined) updateData.rating = Number(rating)

    let application
    try {
      application = await prisma.jobApplication.update({
        where: { id },
        data: updateData,
        include: {
          jobPosting: {
            select: { title: true, department: true },
          },
        },
      })
    } catch {
      application = await prisma.jobApplication.update({
        where: { id },
        data: { status: updateData.status },
        include: {
          jobPosting: {
            select: { title: true, department: true },
          },
        },
      })
    }
    await logActivity(
      req,
      'UPDATE',
      'JobApplication',
      `Updated application for '${application.fullName}' (Role: ${application.jobPosting?.title ?? id}, Status: ${status || application.status})`
    )
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
          select: { title: true, department: true, location: true, workplaceType: true },
        },
      },
    })

    if (!application) {
      return res.status(404).json({ status: 'error', message: 'Application not found' })
    }

    const isDownload = req.query.download === 'true' || req.query.download === '1'
    const safeName = (application.fullName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_')

    // 0. Highest Priority: Direct byte-exact copy stored in database
    if (application.resumeData) {
      const buf = Buffer.from(application.resumeData, 'base64')
      const ext = (path.extname(application.resumeFileName || '') || '.pdf').toLowerCase()
      let mimeType = application.resumeFileType || 'application/pdf'
      if (ext === '.docx') {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      } else if (ext === '.doc') {
        mimeType = 'application/msword'
      }

      const disposition = isDownload ? 'attachment' : 'inline'
      const finalFileName = application.resumeFileName || `Resume_${safeName}${ext}`
      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Disposition', `${disposition}; filename="${finalFileName}"`)
      return res.send(buf)
    }

    // 1. Check local file storage across all possible relative locations
    const candidateDirs = [
      path.resolve(process.cwd(), 'uploads', 'resumes'),
      path.resolve(process.cwd(), 'server', 'uploads', 'resumes'),
      path.resolve(__dirname, '../../uploads/resumes'),
      path.resolve(__dirname, '../../../uploads/resumes'),
      path.resolve(__dirname, '../../../server/uploads/resumes'),
    ]

    let localFilePath = null

    if (application.resumeUrl) {
      const cleanUrl = application.resumeUrl.split('?')[0]
      const filename = path.basename(cleanUrl)
      for (const dir of candidateDirs) {
        const candidatePath = path.join(dir, filename)
        if (fs.existsSync(candidatePath)) {
          localFilePath = candidatePath
          break
        }
      }
    }

    // Check if filename contains application ID or candidate safe name
    if (!localFilePath) {
      for (const dir of candidateDirs) {
        if (fs.existsSync(dir)) {
          try {
            const files = await fs.promises.readdir(dir)
            const match = files.find(
              (f) => f.includes(application.id) || (safeName.length > 3 && f.includes(safeName))
            )
            if (match) {
              localFilePath = path.join(dir, match)
              break
            }
          } catch {
            // ignore read error
          }
        }
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
      const finalFileName = application.resumeFileName || `Resume_${safeName}${ext}`
      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Disposition', `${disposition}; filename="${finalFileName}"`)
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
          const finalFileName = application.resumeFileName || `Resume_${safeName}${ext}`
          res.setHeader('Content-Type', contentType)
          res.setHeader('Content-Disposition', `${disposition}; filename="${finalFileName}"`)
          const arrayBuf = await fetchRes.arrayBuffer()
          return res.send(Buffer.from(arrayBuf))
        }
      } catch (err) {
        console.warn(`[Resume Proxy] Fetch failed for remote URL:`, err.message)
      }
    }

    // 3. High-Fidelity Professional Candidate CV PDF Generation
    const pdfBuf = generateCandidateDossierPdf({
      role: application.jobPosting?.title || 'General Application',
      department: application.jobPosting?.department || 'General',
      name: application.fullName,
      email: application.email,
      phone: application.phone,
      date: new Date(application.createdAt).toLocaleDateString('en-IN'),
      status: application.status,
      coverLetter: application.coverLetter || '',
      appId: application.id,
      originalUrl: application.resumeUrl,
      experience: application.experience,
      noticePeriod: application.noticePeriod,
      currentCtc: application.currentCtc,
      expectedCtc: application.expectedCtc,
      linkedinUrl: application.linkedinUrl,
      portfolioUrl: application.portfolioUrl,
    })

    const disposition = isDownload ? 'attachment' : 'inline'
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `${disposition}; filename="Resume_${safeName}.pdf"`)
    return res.send(pdfBuf)
  } catch (err) {
    next(err)
  }
}

/**
 * clientPortal.controller.js — Client-facing API controllers
 */
import prisma from '../config/db.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'

// GET /api/client/projects
export const getClientProjects = async (req, res, next) => {
  try {
    const clientId = req.client.id

    const projects = await prisma.clientProject.findMany({
      where: { clientId },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: { status: true },
        },
      },
      orderBy: { deadline: 'asc' },
    })

    // Add completion stats
    const formatted = projects.map((p) => {
      const totalTasks = p._count.tasks
      const completedTasks = p.tasks.filter((t) => t.status === 'DONE').length
      
      // Remove raw tasks list from dashboard overview for speed
      const { tasks, _count, ...rest } = p

      return {
        ...rest,
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
        },
      };
    })

    res.json({ status: 'ok', data: formatted })
  } catch (err) {
    next(err)
  }
}

// GET /api/client/projects/:id
export const getClientProjectById = async (req, res, next) => {
  try {
    const { id } = req.params
    const clientId = req.client.id

    const project = await prisma.clientProject.findFirst({
      where: { id, clientId },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
        billingMilestones: {
          orderBy: { dueDate: 'asc' },
        },
      },
    })

    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Project not found.' })
    }

    res.json({ status: 'ok', data: project })
  } catch (err) {
    next(err)
  }
}

// POST /api/client/projects/:id/feedback
export const submitProjectFeedback = async (req, res, next) => {
  try {
    const { id } = req.params
    const clientId = req.client.id
    const { rating, text, companyName, role } = req.body

    if (!rating || !text) {
      return res.status(400).json({ status: 'error', message: 'Rating and feedback text are required' })
    }

    // Verify project belongs to client and is COMPLETED
    const project = await prisma.clientProject.findFirst({
      where: { id, clientId },
      include: { client: true },
    })

    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Project not found.' })
    }

    if (project.status !== 'COMPLETED') {
      return res.status(400).json({ status: 'error', message: 'Feedback can only be submitted for completed projects.' })
    }

    if (project.hasFeedback) {
      return res.status(400).json({ status: 'error', message: 'Feedback has already been submitted for this project.' })
    }

    // Create testimonial and update project hasFeedback flag in transaction
    const result = await prisma.$transaction(async (tx) => {
      const testimonial = await tx.testimonial.create({
        data: {
          name: project.client?.name || project.clientName,
          role: role || 'Client Partner',
          company: companyName || 'SnapTech Digital Partner',
          text,
          rating: parseInt(rating),
          avatarUrl: null, // default
          isActive: false, // in review pipeline, requires admin approval
          order: 0,
        },
      })

      await tx.clientProject.update({
        where: { id },
        data: { hasFeedback: true },
      })

      return testimonial
    })

    res.status(201).json({ status: 'ok', data: result })
  } catch (err) {
    next(err)
  }
}

// GET /api/client/dashboard/stats
export const getClientDashboardStats = async (req, res, next) => {
  try {
    const clientId = req.client.id

    // Fetch all needed data in parallel for efficiency
    const [projects, tickets, milestones] = await Promise.all([
      prisma.clientProject.findMany({
        where: { clientId, deletedAt: null },
        select: { status: true, progress: true },
      }),
      prisma.supportTicket.findMany({
        where: { clientId },
        select: { status: true, clientHasUnread: true },
      }),
      prisma.billingMilestone.findMany({
        where: {
          clientProject: { clientId },
          status: 'PENDING',
        },
        select: {
          title: true,
          amount: true,
          dueDate: true,
          status: true,
        },
        orderBy: { dueDate: 'asc' },
        take: 1, // only need the nearest upcoming one
      }),
    ])

    const activeProjects = projects.filter((p) => p.status !== 'COMPLETED').length
    const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length
    const overallProgress =
      projects.length > 0
        ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
        : 0

    const openTickets = tickets.filter((t) => t.status !== 'RESOLVED').length
    const unreadReplies = tickets.filter((t) => t.clientHasUnread).length

    const nextMilestone = milestones[0] || null
    const pendingMilestoneAmount = nextMilestone?.amount ?? null

    res.json({
      status: 'ok',
      data: {
        activeProjects,
        completedProjects,
        overallProgress,
        openTickets,
        unreadReplies,
        pendingMilestoneAmount,
        nextMilestoneDue: nextMilestone?.dueDate ?? null,
        nextMilestoneTitle: nextMilestone?.title ?? null,
      },
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/client/projects/:id/attachments
export const uploadClientProjectAttachment = async (req, res, next) => {
  try {
    const { id } = req.params
    const clientId = req.client.id

    const project = await prisma.clientProject.findFirst({
      where: { id, clientId },
    })

    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Project not found.' })
    }

    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded.' })
    }

    // Upload file to Cloudinary
    const isImage = req.file.mimetype.startsWith('image/')
    const resourceType = isImage ? 'image' : 'raw'
    const result = await uploadToCloudinary(
      req.file.buffer,
      'hindustan-projects-attachments',
      resourceType,
      req.file.originalname
    )

    const attachment = await prisma.attachment.create({
      data: {
        fileName: req.file.originalname,
        fileUrl: result.secure_url,
        fileSize: req.file.size || 0,
        fileType: req.file.mimetype || 'application/octet-stream',
        publicId: result.public_id,
        clientProjectId: id,
        uploadedByRole: 'CLIENT',
      },
    })

    res.status(201).json({ status: 'ok', data: attachment })
  } catch (err) {
    next(err)
  }
}

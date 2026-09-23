/**
 * billing.controller.js — Project Billing and Financial Milestones controller
 */
import prisma from '../config/db.js'
import { sendEmail, clientPaymentSuccessTemplate } from '../utils/mailer.js'

// ── CLIENT PORTAL ACTIONS ────────────────────────────────────────

// GET /api/client/billing
export const listClientMilestones = async (req, res, next) => {
  try {
    const clientId = req.client.id

    // Fetch milestones for all projects owned by the client
    const milestones = await prisma.billingMilestone.findMany({
      where: {
        clientProject: {
          clientId,
        },
      },
      include: {
        clientProject: {
          select: { projectTitle: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    })

    res.json({ status: 'ok', data: milestones })
  } catch (err) {
    next(err)
  }
}

// POST /api/client/billing/:id/pay
export const simulatePayment = async (req, res, next) => {
  try {
    const { id } = req.params
    const clientId = req.client.id

    // Verify ownership of the milestone project
    const milestone = await prisma.billingMilestone.findFirst({
      where: {
        id,
        clientProject: {
          clientId,
        },
      },
      include: {
        clientProject: {
          include: {
            client: {
              select: { name: true, email: true },
            },
          },
        },
      },
    })

    if (!milestone) {
      return res.status(404).json({ status: 'error', message: 'Milestone not found' })
    }

    if (milestone.status === 'PAID') {
      return res.status(400).json({ status: 'error', message: 'Milestone is already paid' })
    }

    const updated = await prisma.billingMilestone.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        invoiceUrl: `/client/invoices/${id}`,
      },
    })

    // Send email alert asynchronously
    const clientEmail = milestone.clientProject?.client?.email
    const clientName = milestone.clientProject?.client?.name || 'Client'
    const projectName = milestone.clientProject?.projectTitle || 'Project'

    if (clientEmail) {
      const emailOptions = clientPaymentSuccessTemplate({
        clientName,
        projectName,
        milestoneTitle: milestone.title,
        amount: milestone.amount,
        invoiceUrl: `${process.env.CLIENT_URL || 'https://www.snaptech.digital'}/client/invoices/${id}`,
      })

      sendEmail({
        to: clientEmail,
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: emailOptions.text,
      }).catch((err) => console.error('Payment email dispatch failed:', err.message))
    }

    res.json({ status: 'ok', data: updated })
  } catch (err) {
    next(err)
  }
}

// ── ADMINISTRATIVE ACTIONS ────────────────────────────────────────

// GET /api/admin/client-projects/:id/billing
export const listProjectBillingMilestones = async (req, res, next) => {
  try {
    const { id } = req.params

    const milestones = await prisma.billingMilestone.findMany({
      where: { clientProjectId: id },
      orderBy: { dueDate: 'asc' },
    })

    res.json({ status: 'ok', data: milestones })
  } catch (err) {
    next(err)
  }
}

// POST /api/admin/client-projects/:id/billing
export const createBillingMilestone = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, amount, dueDate, status, deliverables } = req.body

    if (!title || amount === undefined) {
      return res.status(400).json({ status: 'error', message: 'Title and amount are required' })
    }

    // Verify project exists
    const project = await prisma.clientProject.findUnique({
      where: { id },
    })

    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Client project not found' })
    }

    const milestone = await prisma.billingMilestone.create({
      data: {
        title,
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'PENDING',
        clientProjectId: id,
        deliverables: deliverables || null,
        paidAt: status === 'PAID' ? new Date() : null,
      },
    })

    res.status(201).json({ status: 'ok', data: milestone })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/admin/billing/:id
export const updateBillingMilestone = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, amount, dueDate, status, deliverables } = req.body

    const milestone = await prisma.billingMilestone.findUnique({
      where: { id },
    })

    if (!milestone) {
      return res.status(404).json({ status: 'error', message: 'Milestone not found' })
    }

    const data = {}
    if (title !== undefined) data.title = title
    if (amount !== undefined) data.amount = parseFloat(amount)
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null
    if (deliverables !== undefined) data.deliverables = deliverables
    if (status !== undefined) {
      data.status = status
      if (status === 'PAID' && milestone.status !== 'PAID') {
        data.paidAt = new Date()
        data.invoiceUrl = `/client/invoices/${id}`
      } else if (status !== 'PAID') {
        data.paidAt = null
        data.invoiceUrl = null
      }
    }

    const updated = await prisma.billingMilestone.update({
      where: { id },
      data,
    })

    // If marked as paid by admin, send notification email asynchronously
    if (status === 'PAID' && milestone.status !== 'PAID') {
      prisma.billingMilestone.findUnique({
        where: { id },
        include: {
          clientProject: {
            include: {
              client: {
                select: { name: true, email: true }
              }
            }
          }
        }
      }).then((fullMilestone) => {
        const clientEmail = fullMilestone?.clientProject?.client?.email
        if (clientEmail) {
          const emailOptions = clientPaymentSuccessTemplate({
            clientName: fullMilestone.clientProject.client.name || 'Client',
            projectName: fullMilestone.clientProject.projectTitle || 'Project',
            milestoneTitle: fullMilestone.title,
            amount: fullMilestone.amount,
            invoiceUrl: `${process.env.CLIENT_URL || 'https://www.snaptech.digital'}/client/invoices/${id}`,
          })

          sendEmail({
            to: clientEmail,
            subject: emailOptions.subject,
            html: emailOptions.html,
            text: emailOptions.text,
          }).catch((err) => console.error('Admin mark payment email dispatch failed:', err.message))
        }
      }).catch((err) => console.error('Failed to retrieve client details for email dispatch:', err.message))
    }

    res.json({ status: 'ok', data: updated })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/admin/billing/:id
export const deleteBillingMilestone = async (req, res, next) => {
  try {
    const { id } = req.params

    const milestone = await prisma.billingMilestone.findUnique({
      where: { id },
    })

    if (!milestone) {
      return res.status(404).json({ status: 'error', message: 'Milestone not found' })
    }

    await prisma.billingMilestone.delete({
      where: { id },
    })

    res.json({ status: 'ok', message: 'Milestone deleted successfully' })
  } catch (err) {
    next(err)
  }
}

// GET /api/client/billing/milestones/:id/invoice
export const getMilestoneInvoice = async (req, res, next) => {
  try {
    const { id } = req.params
    const clientId = req.client.id

    // Fetch milestone with client and project details
    const milestone = await prisma.billingMilestone.findFirst({
      where: {
        id,
        clientProject: {
          clientId,
        },
      },
      include: {
        clientProject: {
          include: {
            client: {
              select: { name: true, email: true },
            },
          },
        },
      },
    })

    if (!milestone) {
      return res.status(404).json({ status: 'error', message: 'Invoice not found' })
    }

    if (milestone.status !== 'PAID') {
      return res.status(400).json({ status: 'error', message: 'Invoice is only available for paid milestones.' })
    }

    res.json({ status: 'ok', data: milestone })
  } catch (err) {
    next(err)
  }
}

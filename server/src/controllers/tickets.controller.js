/**
 * tickets.controller.js — Support Ticketing System controller
 */
import prisma from '../config/db.js'
import { sendEmail, supportTicketCreatedTemplate, supportTicketReplyTemplate, ticketAssignmentTemplate } from '../utils/mailer.js'
import { env } from '../config/env.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'

// ── CLIENT PORTAL ACTIONS ────────────────────────────────────────

// POST /api/client/tickets
export const createTicket = async (req, res, next) => {
  try {
    const clientId = req.client.id
    const { subject, category, clientProjectId, description, fileUrl, fileName } = req.body

    if (!subject || !category || !description) {
      return res.status(400).json({ status: 'error', message: 'Subject, category, and initial description are required' })
    }

    // Atomic transaction: Create ticket AND create the initial thread message
    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          subject,
          category,
          clientId,
          clientProjectId: clientProjectId || null,
        },
      })

      // Get client name to record sender name
      const client = await tx.client.findUnique({
        where: { id: clientId },
        select: { name: true },
      })

      const initialMessage = await tx.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderType: 'CLIENT',
          senderName: client?.name || 'Client',
          senderId: clientId,
          message: description,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
        },
      })

      return { ticket, initialMessage }
    })

    // Send email alert to admin team asynchronously
    prisma.client.findUnique({
      where: { id: clientId },
      select: { name: true }
    }).then((client) => {
      const emailOptions = supportTicketCreatedTemplate({
        clientName: client?.name || 'Client',
        ticketId: result.ticket.id,
        subject: result.ticket.subject,
        category: result.ticket.category,
        message: description,
      })

      const adminEmail = env.EMAIL_USER || 'info@snaptech.digital'
      sendEmail({
        to: adminEmail,
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: emailOptions.text,
      }).catch((err) => console.error('Admin ticket email dispatch failed:', err.message))
    }).catch((err) => console.error('Failed to resolve client details for ticket email:', err.message))

    res.status(201).json({ status: 'ok', data: result.ticket })
  } catch (err) {
    next(err)
  }
}

// GET /api/client/tickets
export const listClientTickets = async (req, res, next) => {
  try {
    const clientId = req.client.id

    const tickets = await prisma.supportTicket.findMany({
      where: { clientId },
      include: {
        clientProject: {
          select: { projectTitle: true },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({ status: 'ok', data: tickets })
  } catch (err) {
    next(err)
  }
}

// GET /api/client/tickets/:id
export const getClientTicketById = async (req, res, next) => {
  try {
    const { id } = req.params
    const clientId = req.client.id

    const ticket = await prisma.supportTicket.findFirst({
      where: { id, clientId },
      include: {
        clientProject: {
          select: { projectTitle: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Ticket not found' })
    }

    if (ticket.clientHasUnread) {
      await prisma.supportTicket.update({
        where: { id },
        data: { clientHasUnread: false },
      })
      ticket.clientHasUnread = false
    }

    res.json({ status: 'ok', data: ticket })
  } catch (err) {
    next(err)
  }
}

// POST /api/client/tickets/:id/messages
export const replyToTicketFromClient = async (req, res, next) => {
  try {
    const { id } = req.params
    const clientId = req.client.id
    const { message, fileUrl, fileName } = req.body

    if (!message) {
      return res.status(400).json({ status: 'error', message: 'Message content is required' })
    }

    // Verify ticket ownership
    const ticket = await prisma.supportTicket.findFirst({
      where: { id, clientId },
    })

    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Ticket not found' })
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { name: true },
    })

    const result = await prisma.$transaction(async (tx) => {
      const msg = await tx.ticketMessage.create({
        data: {
          ticketId: id,
          senderType: 'CLIENT',
          senderName: client?.name || 'Client',
          senderId: clientId,
          message,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
        },
      })

      // Update ticket status back to OPEN if it was RESOLVED, update unread flags, and update updatedAt timestamp
      await tx.supportTicket.update({
        where: { id },
        data: {
          status: ticket.status === 'RESOLVED' ? 'OPEN' : ticket.status,
          adminHasUnread: true,
          clientHasUnread: false,
          updatedAt: new Date(),
        },
      })

      return msg
    })

    // Send email alert to admin team asynchronously
    const emailOptions = supportTicketReplyTemplate({
      recipientName: 'Admin Team',
      ticketId: ticket.id,
      subject: ticket.subject,
      senderName: client?.name || 'Client',
      message,
      portalUrl: `${process.env.CLIENT_URL || 'https://www.snaptech.digital'}/admin/support/tickets/${ticket.id}`,
    })

    const adminEmail = env.EMAIL_USER || 'info@snaptech.digital'
    sendEmail({
      to: adminEmail,
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text,
    }).catch((err) => console.error('Admin ticket response email dispatch failed:', err.message))

    res.status(201).json({ status: 'ok', data: result })
  } catch (err) {
    next(err)
  }
}

// ── ADMINISTRATIVE ACTIONS ────────────────────────────────────────

// GET /api/admin/tickets
export const listAllTickets = async (req, res, next) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        client: {
          select: { name: true, email: true },
        },
        clientProject: {
          select: { projectTitle: true },
        },
        assignedAdmin: {
          select: { id: true, email: true, role: true },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({ status: 'ok', data: tickets })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/tickets/:id
export const getAdminTicketById = async (req, res, next) => {
  try {
    const { id } = req.params

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        client: {
          select: { name: true, email: true },
        },
        clientProject: {
          select: { projectTitle: true },
        },
        assignedAdmin: {
          select: { id: true, email: true, role: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Ticket not found' })
    }

    if (ticket.adminHasUnread) {
      await prisma.supportTicket.update({
        where: { id },
        data: { adminHasUnread: false },
      })
      ticket.adminHasUnread = false
    }

    res.json({ status: 'ok', data: ticket })
  } catch (err) {
    next(err)
  }
}

// POST /api/admin/tickets/:id/messages
export const replyToTicketFromAdmin = async (req, res, next) => {
  try {
    const { id } = req.params
    const adminId = req.user.id
    const { message, fileUrl, fileName } = req.body

    if (!message) {
      return res.status(400).json({ status: 'error', message: 'Message content is required' })
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        client: {
          select: { name: true, email: true },
        },
        clientProject: {
          select: { projectTitle: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Ticket not found' })
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { email: true, role: true },
    })

    const result = await prisma.$transaction(async (tx) => {
      const msg = await tx.ticketMessage.create({
        data: {
          ticketId: id,
          senderType: 'ADMIN',
          senderName: `${admin?.role || 'Staff'} (${admin?.email || 'Admin'})`,
          senderId: adminId,
          message,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
        },
      })

      // Update ticket status to IN_PROGRESS when admin replies, and update unread flags
      await tx.supportTicket.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          clientHasUnread: true,
          adminHasUnread: false,
          updatedAt: new Date(),
        },
      })

      return msg
    })

    // Send email alert to client asynchronously
    const clientEmail = ticket.client?.email
    if (clientEmail) {
      const emailOptions = supportTicketReplyTemplate({
        recipientName: ticket.client?.name || 'Client',
        ticketId: ticket.id,
        subject: ticket.subject,
        senderName: `${admin?.role || 'Staff Member'}`,
        message,
        portalUrl: `${process.env.CLIENT_URL || 'https://www.snaptech.digital'}/client/support`,
      })

      sendEmail({
        to: clientEmail,
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: emailOptions.text,
      }).catch((err) => console.error('Client ticket response email dispatch failed:', err.message))
    }

    res.status(201).json({ status: 'ok', data: result })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/admin/tickets/:id
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid ticket status' })
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    })

    res.json({ status: 'ok', data: updated })
  } catch (err) {
    next(err)
  }
}

// POST /api/client/tickets/upload
export const uploadTicketAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file provided.' })
    }

    const isImage = req.file.mimetype.startsWith('image/')
    const resourceType = isImage ? 'image' : 'raw'

    const result = await uploadToCloudinary(
      req.file.buffer,
      'hindustan-projects-tickets',
      resourceType,
      req.file.originalname
    )

    res.status(201).json({
      status: 'ok',
      data: {
        fileUrl: result.secure_url,
        fileName: req.file.originalname,
      },
    })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/admin/tickets/:id/assign
export const assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params
    const { assignedAdminId } = req.body
    const assigningAdminId = req.user.id

    // Validate ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        client: { select: { name: true } },
      },
    })

    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Ticket not found' })
    }

    // Validate the target admin exists (if assigning, not unassigning)
    let targetAdmin = null
    if (assignedAdminId) {
      targetAdmin = await prisma.admin.findUnique({
        where: { id: assignedAdminId },
        select: { id: true, email: true, role: true, isActive: true },
      })
      if (!targetAdmin || !targetAdmin.isActive) {
        return res.status(400).json({ status: 'error', message: 'Invalid or inactive admin/staff selected.' })
      }
    }

    const assigner = await prisma.admin.findUnique({
      where: { id: assigningAdminId },
      select: { role: true },
    })

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        assignedAdminId: assignedAdminId || null,
        updatedAt: new Date(),
      },
      include: {
        assignedAdmin: { select: { id: true, email: true, role: true } },
      },
    })

    // Send assignment notification email to the newly assigned staff (async, non-blocking)
    if (targetAdmin?.email) {
      const emailOptions = ticketAssignmentTemplate({
        adminEmail: targetAdmin.email,
        ticketId: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        clientName: ticket.client?.name || 'Client',
        assignedByRole: assigner?.role || 'Admin',
        portalUrl: `${process.env.CLIENT_URL || 'https://www.snaptech.digital'}/admin/support`,
      })
      sendEmail({
        to: targetAdmin.email,
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: emailOptions.text,
      }).catch((err) => console.error('Assignment notification email failed:', err.message))
    }

    res.json({ status: 'ok', data: updated })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/users/list-assignable — lightweight list for ticket assignment dropdowns
export const listAssignableAdmins = async (req, res, next) => {
  try {
    const admins = await prisma.admin.findMany({
      where: { isActive: true },
      select: { id: true, email: true, role: true },
      orderBy: [{ role: 'asc' }, { email: 'asc' }],
    })
    res.json({ status: 'ok', data: admins })
  } catch (err) {
    next(err)
  }
}

/**
 * clientProjects.controller.js — Admin CRUD for Client Projects
 */
import prisma from '../config/db.js'
import { logActivity } from '../utils/activity.js'
import sendMail from '../utils/mailer.js'

export const listClientProjects = async (req, res, next) => {
  try {
    const isStaff = req.admin?.role === 'STAFF'
    const whereClause = { deletedAt: null }

    if (isStaff) {
      whereClause.OR = [
        { assignedToEmail: req.admin.email },
        { assignedTo: req.admin.email },
      ]
    }

    const projects = await prisma.clientProject.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: true,
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
    res.json({ status: 'ok', data: projects })
  } catch (err) {
    next(err)
  }
}

export const createClientProject = async (req, res, next) => {
  try {
    const {
      clientName,
      projectTitle,
      description,
      startDate,
      deadline,
      assignedTo,
      assignedToEmail,
      budget,
      tags,
      notes,
      status,
      priority,
      progress,
      clientId,
    } = req.body
    if (!clientName || !projectTitle || !startDate || !deadline) {
      return res.status(400).json({
        status: 'error',
        message: 'Client name, project title, start date, and deadline are required.',
      })
    }
    let finalClientId = clientId || null
    if (!finalClientId && clientName) {
      const existingClient = await prisma.client.findFirst({
        where: {
          OR: [
            { name: { equals: clientName, mode: 'insensitive' } },
            { email: { equals: clientName.trim(), mode: 'insensitive' } },
          ],
        },
      })
      if (existingClient) {
        finalClientId = existingClient.id
      }
    }

    const project = await prisma.clientProject.create({
      data: {
        clientName,
        projectTitle,
        description,
        startDate: new Date(startDate),
        deadline: new Date(deadline),
        assignedTo,
        assignedToEmail: assignedToEmail || null,
        budget,
        tags: tags ?? [],
        notes,
        status: status ?? 'PLANNING',
        priority: priority ?? 'MEDIUM',
        progress: progress ? parseInt(progress) : 0,
        clientId: finalClientId,
      },
      include: {
        tasks: true,
        attachments: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    await logActivity(
      req,
      'CREATE',
      'ClientProject',
      `Created project '${project.projectTitle}' for client '${project.clientName}'`
    )

    // 1) Notify client via email if linked
    if (project.client && project.client.email) {
      sendMail({
        to: project.client.email,
        subject: `🚀 New Project Initialized: ${project.projectTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Project Setup: ${project.projectTitle}</h2>
            <p>Dear <strong>${project.client.name}</strong>,</p>
            <p>Your new project portal workspace has been successfully created by SnapTech Digital:</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #cbd5e1;">
              <p style="margin: 6px 0;"><strong>Status:</strong> ${project.status}</p>
              <p style="margin: 6px 0;"><strong>Start Date:</strong> ${new Date(project.startDate).toLocaleDateString('en-IN')}</p>
              <p style="margin: 6px 0;"><strong>Estimated Deadline:</strong> ${new Date(project.deadline).toLocaleDateString('en-IN')}</p>
              <p style="margin: 6px 0;"><strong>Assigned Lead:</strong> ${project.assignedTo || 'Senior Tech Lead'}</p>
            </div>
            <p>Log into your Client Portal to track real-time progress, review milestone invoices, and access your project File Vault:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.CLIENT_URL || 'https://www.snaptech.digital'}/client/projects/${project.id}" style="background-color: #0066FF; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">View Project in Client Portal</a>
            </div>
            <p style="font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">SnapTech Digital &bull; A Hindustan Projects Enterprise — Bhilwara, Rajasthan</p>
          </div>
        `,
      }).catch((err) => console.error('[ClientProject/mailer] Client email failed:', err.message))
    }

    // 2) Notify assigned staff member via email
    if (assignedToEmail) {
      sendMail({
        to: assignedToEmail,
        subject: `📋 New Project Assigned to You: ${project.projectTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">You have been assigned a new project!</h2>
            <p>Hi <strong>${assignedTo}</strong>,</p>
            <p>You have been assigned as the lead on a new client project at Hindustan Projects:</p>
            <div style="background-color: #f0f9ff; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #bae6fd;">
              <p style="margin: 6px 0;"><strong>Project:</strong> ${project.projectTitle}</p>
              <p style="margin: 6px 0;"><strong>Client:</strong> ${project.clientName}</p>
              <p style="margin: 6px 0;"><strong>Status:</strong> ${project.status}</p>
              <p style="margin: 6px 0;"><strong>Start Date:</strong> ${new Date(project.startDate).toLocaleDateString('en-IN')}</p>
              <p style="margin: 6px 0;"><strong>Deadline:</strong> ${new Date(project.deadline).toLocaleDateString('en-IN')}</p>
              <p style="margin: 6px 0;"><strong>Priority:</strong> ${project.priority}</p>
            </div>
            <p>Please log into the admin panel to review the project details and start work:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.CLIENT_URL || 'https://www.snaptech.digital'}/admin/client-projects" style="background-color: #1A3E8C; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Open Admin Panel</a>
            </div>
            <p style="font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">SnapTech Digital &bull; Internal Assignment Notification</p>
          </div>
        `,
      }).catch((err) => console.error('[ClientProject/mailer] Staff email failed:', err.message))
    }

    res.status(201).json({ status: 'ok', data: project })
  } catch (err) {
    next(err)
  }
}

export const updateClientProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    // Sanitize updateData to delete relational objects & metadata that break Prisma scalar update
    delete updateData.id
    delete updateData.tasks
    delete updateData.attachments
    delete updateData.billingMilestones
    delete updateData.tickets
    delete updateData.client
    delete updateData.hasFeedback
    delete updateData.createdAt
    delete updateData.updatedAt
    delete updateData.deletedAt

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate)
    if (updateData.deadline) updateData.deadline = new Date(updateData.deadline)
    if (updateData.progress !== undefined) updateData.progress = parseInt(updateData.progress)
    if (updateData.clientId === '') {
      updateData.clientId = null
    }

    if (!updateData.clientId && updateData.clientName) {
      const existingClient = await prisma.client.findFirst({
        where: {
          OR: [
            { name: { equals: updateData.clientName, mode: 'insensitive' } },
            { email: { equals: updateData.clientName.trim(), mode: 'insensitive' } },
          ],
        },
      })
      if (existingClient) {
        updateData.clientId = existingClient.id
      }
    }

    const project = await prisma.clientProject.update({
      where: { id },
      data: updateData,
      include: {
        tasks: true,
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    await logActivity(
      req,
      'UPDATE',
      'ClientProject',
      `Updated project '${project.projectTitle}' (Progress: ${project.progress}%, Status: ${project.status})`
    )

    // 1) Notify client via email if linked
    if (project.client && project.client.email) {
      sendMail({
        to: project.client.email,
        subject: `🚀 Project Progress Update: ${project.projectTitle} (${project.progress}% Complete)`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Project Update: ${project.projectTitle}</h2>
            <p>Dear <strong>${project.client.name}</strong>,</p>
            <p>Your project progress and milestone status have been updated on the SnapTech Digital portal:</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #cbd5e1;">
              <p style="margin: 6px 0;"><strong>Status:</strong> ${project.status}</p>
              <p style="margin: 6px 0;"><strong>Completion Progress:</strong> ${project.progress}%</p>
              <p style="margin: 6px 0;"><strong>Project Lead:</strong> ${project.assignedTo || 'Assigned Lead'}</p>
              <p style="margin: 6px 0;"><strong>Target Deadline:</strong> ${new Date(project.deadline).toLocaleDateString('en-IN')}</p>
            </div>
            <p>Check the latest deliverables, upload asset files, or review GST invoices inside your Client Portal:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.CLIENT_URL || 'https://www.snaptech.digital'}/client/projects/${project.id}" style="background-color: #0066FF; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Open Client Portal Project</a>
            </div>
            <p style="font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">SnapTech Digital &bull; A Hindustan Projects Enterprise — Bhilwara, Rajasthan</p>
          </div>
        `,
      }).catch((err) => console.error('[ClientProject/mailer] Client email failed:', err.message))
    }

    // 2) Notify assigned staff if assignment changed
    if (project.assignedToEmail) {
      sendMail({
        to: project.assignedToEmail,
        subject: `📋 Project Assignment Update: ${project.projectTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Project Update — You Are the Assigned Lead</h2>
            <p>Hi <strong>${project.assignedTo}</strong>,</p>
            <p>The following project has been updated and you are assigned as the lead:</p>
            <div style="background-color: #f0f9ff; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #bae6fd;">
              <p style="margin: 6px 0;"><strong>Project:</strong> ${project.projectTitle}</p>
              <p style="margin: 6px 0;"><strong>Client:</strong> ${project.clientName}</p>
              <p style="margin: 6px 0;"><strong>Status:</strong> ${project.status}</p>
              <p style="margin: 6px 0;"><strong>Progress:</strong> ${project.progress}%</p>
              <p style="margin: 6px 0;"><strong>Deadline:</strong> ${new Date(project.deadline).toLocaleDateString('en-IN')}</p>
              <p style="margin: 6px 0;"><strong>Priority:</strong> ${project.priority}</p>
            </div>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.CLIENT_URL || 'https://www.snaptech.digital'}/admin/client-projects" style="background-color: #1A3E8C; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Open Admin Panel</a>
            </div>
            <p style="font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">SnapTech Digital &bull; Internal Assignment Notification</p>
          </div>
        `,
      }).catch((err) => console.error('[ClientProject/mailer] Staff email failed:', err.message))
    }

    res.json({ status: 'ok', data: project })
  } catch (err) {
    next(err)
  }
}

export const deleteClientProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const project = await prisma.clientProject.findUnique({ where: { id } })
    if (project) {
      await prisma.clientProject.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      await logActivity(
        req,
        'DELETE',
        'ClientProject',
        `Soft deleted project '${project.projectTitle}' (Client: ${project.clientName})`
      )
    }
    res.json({ status: 'ok', message: 'Client project soft deleted.' })
  } catch (err) {
    next(err)
  }
}

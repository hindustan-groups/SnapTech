/**
 * adminUsers.controller.js — CRUD for Admin/Staff accounts (SUPER_ADMIN only)
 */
import prisma from '../config/db.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { logActivity } from '../utils/activity.js'
import { sendEmail, professionalEmailFooter, fetchEmailFooterSettings } from '../utils/mailer.js'
import { env } from '../config/env.js'

export const listAdminUsers = async (req, res, next) => {
  try {
    const users = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        assignedModules: true,
        isActive: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ status: 'ok', data: users })
  } catch (err) {
    next(err)
  }
}

export const createAdminUser = async (req, res, next) => {
  try {
    const { email, password, role, assignedModules } = req.body

    if (!email || !password || !role) {
      return res.status(400).json({ status: 'error', message: 'Email, password, and role are required.' })
    }

    if (!['ADMIN', 'STAFF'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Role must be ADMIN or STAFF.' })
    }
    const cleanEmail = email ? email.trim().toLowerCase() : ''
    const cleanPassword = password ? password.trim() : ''

    const existing = await prisma.admin.findUnique({ where: { email: cleanEmail } })
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'Email is already in use.' })
    }

    const passwordHash = await bcrypt.hash(cleanPassword, 10)

    const user = await prisma.admin.create({
      data: {
        email: cleanEmail,
        passwordHash,
        role,
        assignedModules: Array.isArray(assignedModules) ? assignedModules : [],
        isActive: true,
        loginAttempts: 0,
        lockoutUntil: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        assignedModules: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Fetch site settings for footer
    const settings = await fetchEmailFooterSettings(prisma)
    const clientUrl = env.CLIENT_URL || 'https://www.snaptech.digital'
    const rawPath = env.ADMIN_SECRET_PATH || 'admin-login'
    const loginPath = rawPath.startsWith('admin-') ? rawPath : `admin-${rawPath}`
    const loginUrl = `${clientUrl}/${loginPath}`

    // Send invitation email
    sendEmail({
      to: user.email,
      subject: `Your Hindustan Projects ${role} Account is Ready`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;"><span style="color: #E31E24;">Hindustan</span> Projects</h1>
            <p style="color: #93c5fd; margin: 6px 0 0; font-size: 14px;">Staff Portal Account Setup</p>
          </div>

          <p style="font-size: 16px; color: #1A1A1A;">Hello,</p>

          <p style="font-size: 15px; color: #374151; line-height: 1.7;">
            A new account has been created for you as a <strong>${role}</strong> member at <strong>Hindustan Projects</strong>. You can now log in to the administrative portal to manage website details, projects, leads, and clients.
          </p>

          <div style="background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #4B5563; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Your Administrative Credentials</p>
            <p style="margin: 0 0 6px; font-size: 14px; color: #1A1A1A;">Email: ${user.email}</p>
            <p style="margin: 0 0 6px; font-size: 14px; color: #1A1A1A;">Password: ${cleanPassword}</p>
            <p style="margin: 0; font-size: 14px; color: #1A1A1A;">Portal URL: <a href="${loginUrl}" style="color: #1A3E8C;">${loginUrl}</a></p>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #1A3E8C; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">Login to Admin Portal</a>
          </p>

          ${professionalEmailFooter(settings)}
        </div>
      `,
      text: `Hello,\n\nA new administrative account has been created for you as a ${role} member at Hindustan Projects.\n\nCredentials:\nEmail: ${user.email}\nPassword: ${password}\nPortal URL: ${loginUrl}\n\nPlease keep these details secure.\n\nHindustan Projects Team`
    }).catch((err) => {
      console.error('[staff-email] Failed to send credentials email:', err.message)
    })

    await logActivity(req, 'CREATE', 'AdminUser', `Created ${role} account: '${user.email}'`)

    res.status(201).json({ status: 'ok', data: user })
  } catch (err) {
    next(err)
  }
}

export const updateAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { role, isActive, password, assignedModules } = req.body

    const existing = await prisma.admin.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'User not found.' })
    }

    // Prevent Super Admin self-deactivation or self-role change
    if (existing.id === req.admin.id && (isActive === false || role !== existing.role)) {
      return res.status(400).json({ status: 'error', message: 'You cannot deactivate yourself or change your own role.' })
    }

    const data = {}
    if (role !== undefined) {
      if (!['ADMIN', 'STAFF', 'SUPER_ADMIN'].includes(role)) {
        return res.status(400).json({ status: 'error', message: 'Invalid role.' })
      }
      data.role = role
    }
    if (isActive !== undefined) {
      data.isActive = Boolean(isActive)
    }
    if (Array.isArray(assignedModules)) {
      data.assignedModules = assignedModules
    }
    if (password && password.trim()) {
      const cleanPassword = password.trim()
      const matchesCurrent = await bcrypt.compare(cleanPassword, existing.passwordHash)
      if (matchesCurrent) {
        return res.status(400).json({
          status: 'error',
          message: 'New password cannot be the same as the current password.',
        })
      }

      const history = await prisma.passwordHistory.findMany({
        where: { adminId: existing.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
      })

      for (const entry of history) {
        const isMatch = await bcrypt.compare(cleanPassword, entry.passwordHash)
        if (isMatch) {
          return res.status(400).json({
            status: 'error',
            message: 'New password cannot reuse any of the last 3 passwords.',
          })
        }
      }

      await prisma.passwordHistory.create({
        data: {
          adminId: existing.id,
          passwordHash: existing.passwordHash,
        },
      })

      data.passwordHash = await bcrypt.hash(cleanPassword, 12)
      data.loginAttempts = 0
      data.lockoutUntil = null

      const allHistory = await prisma.passwordHistory.findMany({
        where: { adminId: existing.id },
        orderBy: { createdAt: 'desc' },
      })
      if (allHistory.length > 3) {
        const idsToDelete = allHistory.slice(3).map((h) => h.id)
        await prisma.passwordHistory.deleteMany({
          where: { id: { in: idsToDelete } },
        })
      }
    }

    const user = await prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        assignedModules: true,
        isActive: true,
        createdAt: true,
      },
    })

    // If password was changed, send email notification
    if (password && password.trim()) {
      const cleanPassword = password.trim()
      const settings = await fetchEmailFooterSettings(prisma)
      const clientUrl = env.CLIENT_URL || 'https://www.snaptech.digital'
      const rawPath = env.ADMIN_SECRET_PATH || 'admin-login'
      const loginPath = rawPath.startsWith('admin-') ? rawPath : `admin-${rawPath}`
      const loginUrl = `${clientUrl}/${loginPath}`

      sendEmail({
        to: user.email,
        subject: 'Your Hindustan Projects Staff Password Has Been Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;"><span style="color: #E31E24;">Hindustan</span> Projects</h1>
              <p style="color: #93c5fd; margin: 6px 0 0; font-size: 14px;">Staff Portal Security Update</p>
            </div>

            <p style="font-size: 16px; color: #1A1A1A;">Hello,</p>

            <p style="font-size: 15px; color: #374151; line-height: 1.7;">
              An administrator has reset the password for your <strong>${user.role}</strong> account at <strong>Hindustan Projects</strong>.
            </p>

            <div style="background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #4B5563; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Your Updated Administrative Credentials</p>
              <p style="margin: 0 0 6px; font-size: 14px; color: #1A1A1A;">Email: ${user.email}</p>
              <p style="margin: 0 0 6px; font-size: 14px; color: #1A1A1A;">Password: ${cleanPassword}</p>
              <p style="margin: 0; font-size: 14px; color: #1A1A1A;">Portal URL: <a href="${loginUrl}" style="color: #1A3E8C;">${loginUrl}</a></p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background-color: #1A3E8C; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">Login to Admin Portal</a>
            </p>

            ${professionalEmailFooter(settings)}
          </div>
        `,
        text: `Hello,\n\nYour Hindustan Projects staff account password has been reset by an administrator.\n\nUpdated Credentials:\nEmail: ${user.email}\nPassword: ${password}\nPortal URL: ${loginUrl}\n\nPlease keep these details secure.\n\nHindustan Projects Team`
      }).catch((err) => {
        console.error('[staff-email] Failed to send password reset email:', err.message)
      })
    }

    await logActivity(
      req,
      'UPDATE',
      'AdminUser',
      `Updated user '${user.email}' (Role: ${user.role}, Active: ${user.isActive})`
    )

    res.json({ status: 'ok', data: user })
  } catch (err) {
    next(err)
  }
}

export const deleteAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params

    const existing = await prisma.admin.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'User not found.' })
    }

    if (existing.id === req.admin.id) {
      return res.status(400).json({ status: 'error', message: 'You cannot delete yourself.' })
    }

    if (existing.role === 'SUPER_ADMIN') {
      return res.status(403).json({ status: 'error', message: 'Super Admin accounts cannot be deleted.' })
    }

    await prisma.admin.delete({ where: { id } })
    await logActivity(req, 'DELETE', 'AdminUser', `Deleted user account '${existing.email}'`)

    res.json({ status: 'ok', message: 'User account deleted.' })
  } catch (err) {
    next(err)
  }
}

// ── Client Portal Users CRUD (SUPER_ADMIN / ADMIN) ────────────────

export const listClients = async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        projects: {
          select: { id: true, projectTitle: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ status: 'ok', data: clients })
  } catch (err) {
    next(err)
  }
}

export const createClientUser = async (req, res, next) => {
  try {
    const { name, email, projectIds } = req.body

    if (!name || !email) {
      return res.status(400).json({ status: 'error', message: 'Name and email are required.' })
    }

    const cleanEmail = email.trim().toLowerCase()

    const existing = await prisma.client.findUnique({ where: { email: cleanEmail } })
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'Email is already in use.' })
    }

    const inviteToken = crypto.randomBytes(32).toString('hex')
    const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const client = await prisma.client.create({
      data: {
        name,
        email: cleanEmail,
        inviteToken,
        inviteTokenExpires,
        projects: projectIds && projectIds.length > 0 ? {
          connect: projectIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        projects: {
          select: { id: true, projectTitle: true },
        },
      },
    })

    const clientUrl = env.CLIENT_URL || 'https://www.snaptech.digital'
    const inviteLink = `${clientUrl}/client/setup-password?token=${inviteToken}`

    const settings = await fetchEmailFooterSettings(prisma)

    await sendEmail({
      to: client.email,
      subject: 'Welcome to SnapTech Digital Client Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;"><span style="color: #0066FF;">SnapTech</span> Digital</h1>
            <p style="color: #93c5fd; margin: 6px 0 0; font-size: 14px;">Client Portal Invitation &bull; Hindustan Projects</p>
          </div>

          <p style="font-size: 16px; color: #1A1A1A;">Hi <strong>${client.name}</strong>,</p>

          <p style="font-size: 15px; color: #374151; line-height: 1.7;">
            Your client portal account has been created at <strong>SnapTech Digital</strong>. You can now track your project progress, view deliverables, and download shared files.
          </p>

          <p style="font-size: 15px; color: #374151; line-height: 1.7;">
            Click the button below to set up your password and access your personal dashboard:
          </p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #0066FF; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">Set Up My Password</a>
          </p>

          <div style="background: #fff8f0; border: 1px solid #fed7aa; border-radius: 6px; padding: 12px 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">⚠️ This setup link will expire in <strong>7 days</strong>. Please set up your account before it expires.</p>
          </div>

          <p style="font-size: 12px; color: #6b7280; margin-top: 16px;">If the button doesn't work, copy and paste this link in your browser:<br/><a href="${inviteLink}" style="color: #1A3E8C; word-break: break-all;">${inviteLink}</a></p>

          ${professionalEmailFooter(settings)}
        </div>
      `,
      text: `Hi ${client.name},\n\nYour SnapTech Digital client portal account has been created!\n\nSet up your password using the link below:\n${inviteLink}\n\nThis link expires in 7 days.\n\nSnapTech Digital\nPhone: ${settings.phone || '+91 75970 00601'}\nWeb: www.snaptech.digital\nBhilwara, Rajasthan, India`
    }).catch((err) => {
      console.error('[invite-email] Failed to send invite:', err.message)
    })

    await logActivity(req, 'CREATE', 'Client', `Created client account '${client.email}'`)

    res.status(201).json({ status: 'ok', data: client })
  } catch (err) {
    next(err)
  }
}

export const updateClientUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, email, isActive, projectIds, resendInvite } = req.body

    const existing = await prisma.client.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'Client not found.' })
    }

    const data = {}
    if (name) data.name = name
    if (email) {
      const cleanEmail = email.trim().toLowerCase()
      if (cleanEmail !== existing.email) {
        const dup = await prisma.client.findUnique({ where: { email: cleanEmail } })
        if (dup) {
          return res.status(409).json({ status: 'error', message: 'Email is already in use.' })
        }
        data.email = cleanEmail
      }
    }
    if (isActive !== undefined) {
      data.isActive = Boolean(isActive)
    }

    if (projectIds) {
      data.projects = {
        set: projectIds.map(id => ({ id }))
      }
    }

    if (resendInvite) {
      const inviteToken = crypto.randomBytes(32).toString('hex')
      const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      data.inviteToken = inviteToken
      data.inviteTokenExpires = inviteTokenExpires
      data.passwordHash = null // reset existing password until setup done
    }

    const client = await prisma.client.update({
      where: { id },
      data,
      include: {
        projects: {
          select: { id: true, projectTitle: true },
        },
      },
    })

    if (resendInvite) {
      const clientUrl = env.CLIENT_URL || 'https://www.snaptech.digital'
      const inviteLink = `${clientUrl}/client/setup-password?token=${client.inviteToken}`

      const settings = await fetchEmailFooterSettings(prisma)

      await sendEmail({
        to: client.email,
        subject: 'Set Up Your SnapTech Digital Client Portal Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;"><span style="color: #0066FF;">SnapTech</span> Digital</h1>
              <p style="color: #93c5fd; margin: 6px 0 0; font-size: 14px;">Client Portal Setup &bull; Hindustan Projects</p>
            </div>

            <p style="font-size: 16px; color: #1A1A1A;">Hi <strong>${client.name}</strong>,</p>

            <p style="font-size: 15px; color: #374151; line-height: 1.7;">
              An administrator has requested to set up or reset your client portal password for your account at <strong>SnapTech Digital</strong>.
            </p>

            <p style="font-size: 15px; color: #374151; line-height: 1.7;">
              Click the button below to set up your password and access your dashboard:
            </p>

            <p style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" style="background-color: #0066FF; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">Set Up My Password</a>
            </p>

            <div style="background: #fff8f0; border: 1px solid #fed7aa; border-radius: 6px; padding: 12px 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 13px; color: #92400e;">⚠️ This setup link will expire in <strong>7 days</strong>. Please set up your account before it expires.</p>
            </div>

            <p style="font-size: 12px; color: #6b7280; margin-top: 16px;">If the button doesn't work, copy and paste this link in your browser:<br/><a href="${inviteLink}" style="color: #1A3E8C; word-break: break-all;">${inviteLink}</a></p>

            ${professionalEmailFooter(settings)}
          </div>
        `,
        text: `Hi ${client.name},\n\nAn administrator has requested to set up or reset your client portal password. Set up your password using the link below:\n${inviteLink}\n\nThis link expires in 7 days.\n\nSnapTech Digital\nPhone: ${settings.phone || '+91 75970 00601'}\nWeb: www.snaptech.digital\nBhilwara, Rajasthan, India`
      }).catch((err) => {
        console.error('[invite-email] Failed to send setup link:', err.message)
      })
    }

    await logActivity(req, 'UPDATE', 'Client', `Updated client account '${client.email}'`)

    res.json({ status: 'ok', data: client })
  } catch (err) {
    next(err)
  }
}

export const deleteClientUser = async (req, res, next) => {
  try {
    const { id } = req.params

    const existing = await prisma.client.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'Client not found.' })
    }

    await prisma.client.delete({ where: { id } })
    await logActivity(req, 'DELETE', 'Client', `Deleted client account '${existing.email}'`)

    res.json({ status: 'ok', message: 'Client account deleted.' })
  } catch (err) {
    next(err)
  }
}

// POST /api/admin/clients/:id/resend-welcome
export const resendClientWelcome = async (req, res, next) => {
  try {
    const { id } = req.params

    const existing = await prisma.client.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'Client not found.' })
    }

    // Generate fresh invite token
    const inviteToken = crypto.randomBytes(32).toString('hex')
    const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const client = await prisma.client.update({
      where: { id },
      data: {
        inviteToken,
        inviteTokenExpires,
        passwordHash: null, // reset password so they must set a new one
      },
    })

    const clientUrl = env.CLIENT_URL || 'https://www.snaptech.digital'
    const inviteLink = `${clientUrl}/client/setup-password?token=${inviteToken}`
    const settings = await fetchEmailFooterSettings(prisma)

    await sendEmail({
      to: client.email,
      subject: '🔑 Client Portal Access — SnapTech Digital',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;"><span style="color: #0066FF;">SnapTech</span> Digital</h1>
            <p style="color: #93c5fd; margin: 6px 0 0; font-size: 14px;">Client Portal &bull; Access Link Resent</p>
          </div>

          <p style="font-size: 16px; color: #1A1A1A;">Hi <strong>${client.name}</strong>,</p>

          <p style="font-size: 15px; color: #374151; line-height: 1.7;">
            Your portal access link has been resent by the SnapTech Digital team. Click the button below to set up or reset your password and access your project dashboard:
          </p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #0066FF; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">Access My Client Portal</a>
          </p>

          <div style="background: #fff8f0; border: 1px solid #fed7aa; border-radius: 6px; padding: 12px 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">⚠️ This link will expire in <strong>7 days</strong>. Please set up your account before it expires.</p>
          </div>

          <p style="font-size: 12px; color: #6b7280; margin-top: 16px;">If the button doesn't work, copy and paste this link in your browser:<br/><a href="${inviteLink}" style="color: #1A3E8C; word-break: break-all;">${inviteLink}</a></p>

          ${professionalEmailFooter(settings)}
        </div>
      `,
      text: `Hi ${client.name},\n\nYour SnapTech Digital client portal access link has been resent.\n\nSet up your password: ${inviteLink}\n\nThis link expires in 7 days.\n\nSnapTech Digital\nPhone: ${settings.phone || '+91 75970 00601'}\nWeb: www.snaptech.digital`,
    })

    await logActivity(req, 'UPDATE', 'Client', `Resent welcome/portal credentials to '${client.email}'`)

    res.json({ status: 'ok', message: `Portal credentials sent to ${client.email}` })
  } catch (err) {
    next(err)
  }
}

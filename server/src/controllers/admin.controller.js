import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import prisma from '../config/db.js'
import { env } from '../config/env.js'
import { setAdminCookie, setAdminRefreshTokenCookie, clearAdminCookies } from '../utils/authCookie.js'
import { verifyMasterKey, resolveMasterKey } from '../utils/masterKey.js'
import { sendEmail, professionalEmailFooter, fetchEmailFooterSettings } from '../utils/mailer.js'

// Helper to generate access and refresh tokens
const generateTokens = async (admin) => {
  const accessToken = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    env.JWT_SECRET,
    { expiresIn: '2h' } // Access token valid for 2 hours
  )
  
  const refreshToken = jwt.sign(
    { id: admin.id },
    env.JWT_SECRET,
    { expiresIn: '7d' } // Refresh token valid for 7 days
  )

  // Save refresh token to database
  await prisma.admin.update({
    where: { id: admin.id },
    data: { refreshToken }
  })

  return { accessToken, refreshToken }
}

// ── POST /api/admin/login ──────────────────────────────────────
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress

    const cleanEmail = email ? email.trim().toLowerCase() : ''
    const cleanPassword = password ? password.trim() : ''

    const admin = await prisma.admin.findUnique({ where: { email: cleanEmail } })
    if (!admin) {
      try {
        await prisma.activityLog.create({
          data: {
            adminId: 'UNKNOWN',
            adminEmail: cleanEmail || 'unknown',
            action: 'LOGIN_FAIL',
            entity: 'Admin',
            details: `Failed login: account not found. IP: ${ip}`,
          },
        })
      } catch (e) {
        console.error('[ActivityLog] Failed to log failure:', e.message)
      }

      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' })
    }

    if (!admin.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact your system administrator.',
      })
    }

    // Check account lockout status
    if (admin.lockoutUntil && new Date() < new Date(admin.lockoutUntil)) {
      const waitTime = Math.ceil((new Date(admin.lockoutUntil) - new Date()) / 60000)
      return res.status(423).json({
        status: 'error',
        message: `Account is locked. Please try again in ${waitTime} minute(s).`,
      })
    }

    const valid = await bcrypt.compare(cleanPassword, admin.passwordHash)
    if (!valid) {
      const attempts = admin.loginAttempts + 1
      let lockoutUntil = null
      let message = 'Invalid credentials.'

      // Log failed attempt details to console/Render logs
      console.warn(
        `[SECURITY_ALERT] FAILED_LOGIN_ATTEMPT | Email: ${email} | IP: ${ip} | Total attempts: ${attempts}`
      )

      try {
        await prisma.activityLog?.create({
          data: {
            adminId: admin.id,
            adminEmail: admin.email,
            action: 'LOGIN_FAIL',
            entity: 'Admin',
            details: `Failed login: incorrect password. IP: ${ip}. Attempt: ${attempts}`,
          },
        })
      } catch (e) {
        console.error('[ActivityLog] Failed to log failure:', e.message)
      }

      if (attempts >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        message = 'Too many failed attempts. Account locked for 15 minutes.'

        try {
          await prisma.activityLog?.create({
            data: {
              adminId: admin.id,
              adminEmail: admin.email,
              action: 'LOCKOUT',
              entity: 'Admin',
              details: `Account locked for 15 minutes due to repeated failed logins. IP: ${ip}`,
            },
          })
        } catch (e) {
          console.error('[ActivityLog] Failed to log lockout:', e.message)
        }

        // Send lockout notification email (at exactly 5 attempts to avoid spamming on subsequent attempts)
        if (attempts === 5) {
          sendEmail({
            to: admin.email,
            subject: 'Hindustan Projects Admin Account Locked',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #E31E24;">Security Alert: Account Locked</h2>
                <p>Your admin account (<strong>${admin.email}</strong>) has been locked for 15 minutes due to 5 consecutive failed login attempts.</p>
                <p><strong>IP Address:</strong> ${ip}</p>
                <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                <p>If this was not you, please change your password immediately.</p>
              </div>
            `,
            text: `Security Alert: Admin Account Locked\n\nYour account has been locked for 15 minutes due to 5 consecutive failed login attempts.\nIP Address: ${ip}\nTime: ${new Date().toISOString()}`,
          }).catch((err) => {
            console.error('[mailer] Lockout email failed:', err.message)
          })
        }
      }

      // Send brute-force alert email to admin on 10+ consecutive failed attempts
      if (attempts >= 10) {
        sendEmail({
          to: admin.email,
          subject: 'URGENT: Brute-Force Alert on Admin Login',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #E31E24; border-radius: 8px;">
              <h2 style="color: #E31E24;">Urgent Security Alert: Brute Force Detected</h2>
              <p>The IP address <strong>${ip}</strong> has failed admin login 10+ times on account <strong>${admin.email}</strong>.</p>
              <p><strong>Consecutive failed attempts:</strong> ${attempts}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              <p>Please check backend console logs and consider blocking this IP address at your hosting-level firewall.</p>
            </div>
          `,
          text: `Urgent Security Alert: Brute Force Detected\n\nThe IP address ${ip} has failed admin login 10+ times on account ${admin.email}.\nConsecutive attempts: ${attempts}\nTime: ${new Date().toISOString()}`,
        }).catch((err) => {
          console.error('[mailer] Brute-force email alert failed:', err.message)
        })

        console.warn(
          `[SECURITY_ALERT] BRUTE_FORCE_ALERT_SENT | Email: ${email} | IP: ${ip} | Total attempts: ${attempts}`
        )
      }

      await prisma.admin.update({
        where: { id: admin.id },
        data: { loginAttempts: attempts, lockoutUntil },
      })

      return res.status(401).json({ status: 'error', message })
    }

    // Reset login attempts on successful credentials
    await prisma.admin.update({
      where: { id: admin.id },
      data: { loginAttempts: 0, lockoutUntil: null }
    })

    // Audit log successful login & notify
    try {
      await prisma.activityLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: 'LOGIN_ATTEMPT',
          entity: 'Admin',
          details: `Successful credentials check from IP ${ip}`,
        }
      })

      sendEmail({
        to: admin.email,
        subject: 'New Admin Login Detected - Hindustan Projects',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2>Security Notice: Successful Login</h2>
            <p>A new login was recorded for your admin account: <strong>${admin.email}</strong>.</p>
            <p><strong>IP Address:</strong> ${ip}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p>If this was you, no action is needed. Otherwise, please contact support immediately.</p>
          </div>
        `,
        text: `Security Notice: Successful Login\n\nA new login was recorded for admin: ${admin.email}\nIP Address: ${ip}\nTime: ${new Date().toISOString()}`
      }).catch((err) => {
        console.error('[audit/mailer] Login notification failed:', err.message)
      })
    } catch (err) {
      console.error('[audit] Activity log failed:', err.message)
    }

    // Check if 2FA is enabled
    if (admin.twoFactorEnabled) {
      // Return a short-lived temp token (valid for 5 minutes)
      const tempToken = jwt.sign(
        { id: admin.id, temp: true },
        env.JWT_SECRET,
        { expiresIn: '5m' }
      )
      return res.json({
        status: '2fa_required',
        tempToken,
      })
    }

    // Normal login (2FA not enabled)
    const { accessToken, refreshToken } = await generateTokens(admin)
    setAdminCookie(res, accessToken)
    setAdminRefreshTokenCookie(res, refreshToken)

    return res.json({
      status: 'ok',
      data: { id: admin.id, email: admin.email, role: admin.role },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/admin/logout ─────────────────────────────────────
export const adminLogout = async (req, res, next) => {
  try {
    // If we have admin from verifyToken, clear their active refresh token from DB
    if (req.admin?.id) {
      await prisma.admin.update({
        where: { id: req.admin.id },
        data: { refreshToken: null }
      }).catch(() => {})
    }
    clearAdminCookies(res)
    return res.json({ status: 'ok', message: 'Logged out.' })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/admin/refresh-token ──────────────────────────────
export const adminRefreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.adminRefreshToken
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Refresh token required' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, env.JWT_SECRET)
    } catch (_err) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token' })
    }

    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } })
    if (!admin || admin.refreshToken !== token) {
      return res.status(401).json({ status: 'error', message: 'Token revoked or invalid' })
    }

    // Rotate tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(admin)
    setAdminCookie(res, accessToken)
    setAdminRefreshTokenCookie(res, newRefreshToken)

    return res.json({ status: 'ok' })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/admin/2fa/setup ──────────────────────────────────
export const setup2FA = async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } })
    if (!admin) {
      return res.status(404).json({ status: 'error', message: 'Admin not found' })
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Hindustan Projects (${admin.email})`
    })

    // Save secret temporarily in DB (but keep twoFactorEnabled = false until verified)
    await prisma.admin.update({
      where: { id: admin.id },
      data: { twoFactorSecret: secret.base32 }
    })

    // Generate QR code Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url)

    return res.json({
      status: 'ok',
      data: {
        secret: secret.base32,
        qrCode: qrCodeDataUrl
      }
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/admin/2fa/verify ─────────────────────────────────
export const verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ status: 'error', message: 'Verification code required' })
    }

    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } })
    if (!admin || !admin.twoFactorSecret) {
      return res.status(400).json({ status: 'error', message: '2FA setup has not been initiated' })
    }

    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1 // 30-sec tolerance window
    })

    if (!verified) {
      return res.status(400).json({ status: 'error', message: 'Invalid verification code' })
    }

    // Enable 2FA
    await prisma.admin.update({
      where: { id: admin.id },
      data: { twoFactorEnabled: true }
    })

    return res.json({ status: 'ok', message: 'Two-Factor Authentication enabled successfully' })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/admin/2fa/disable ────────────────────────────────
export const disable2FA = async (req, res, next) => {
  try {
    const { password } = req.body
    if (!password) {
      return res.status(400).json({ status: 'error', message: 'Password is required to disable 2FA' })
    }

    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } })
    if (!admin) {
      return res.status(404).json({ status: 'error', message: 'Admin not found' })
    }

    const valid = await bcrypt.compare(password, admin.passwordHash)
    if (!valid) {
      return res.status(401).json({ status: 'error', message: 'Incorrect password' })
    }

    // Disable 2FA
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    })

    return res.json({ status: 'ok', message: 'Two-Factor Authentication disabled successfully' })
  } catch (err) {
    next(err)
  }
}


// ── POST /api/admin/2fa/login ──────────────────────────────────
export const login2FA = async (req, res, next) => {
  try {
    const { tempToken, code } = req.body
    if (!tempToken || !code) {
      return res.status(400).json({ status: 'error', message: 'Token and verification code required' })
    }

    let decoded
    try {
      decoded = jwt.verify(tempToken, env.JWT_SECRET)
    } catch (_err) {
      return res.status(401).json({ status: 'error', message: 'Temporary session expired. Please log in again.' })
    }

    if (!decoded.temp) {
      return res.status(401).json({ status: 'error', message: 'Invalid session state' })
    }

    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } })
    if (!admin || !admin.twoFactorSecret) {
      return res.status(401).json({ status: 'error', message: 'Invalid admin account state' })
    }

    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    })

    if (!verified) {
      return res.status(401).json({ status: 'error', message: 'Invalid verification code' })
    }

    // Set full cookies
    const { accessToken, refreshToken } = await generateTokens(admin)
    setAdminCookie(res, accessToken)
    setAdminRefreshTokenCookie(res, refreshToken)

    return res.json({
      status: 'ok',
      data: { id: admin.id, email: admin.email, role: admin.role },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/admin/me ──────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, email: true, role: true, twoFactorEnabled: true },
    })
    if (!admin) {
      return res.status(404).json({ status: 'error', message: 'Admin not found.' })
    }
    res.json({ status: 'ok', data: admin })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/admin/change-password ───────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const cleanCurrent = currentPassword ? currentPassword.trim() : ''
    const cleanNew = newPassword ? newPassword.trim() : ''

    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } })
    if (!admin) return res.status(404).json({ status: 'error', message: 'Admin not found.' })

    const valid = await bcrypt.compare(cleanCurrent, admin.passwordHash)
    if (!valid) {
      return res.status(401).json({ status: 'error', message: 'Current password is incorrect.' })
    }

    // Check if password is same as current password
    const matchesCurrent = await bcrypt.compare(cleanNew, admin.passwordHash)
    if (matchesCurrent) {
      return res.status(400).json({
        status: 'error',
        message: 'New password cannot be the same as your current password.',
      })
    }

    // Check if password matches any of the last 3 passwords in history
    const history = await prisma.passwordHistory.findMany({
      where: { adminId: admin.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })

    for (const entry of history) {
      const isMatch = await bcrypt.compare(cleanNew, entry.passwordHash)
      if (isMatch) {
        return res.status(400).json({
          status: 'error',
          message: 'You cannot reuse any of your last 3 passwords.',
        })
      }
    }

    const passwordHash = await bcrypt.hash(cleanNew, 12)

    // Save current password hash to history before updating
    await prisma.passwordHistory.create({
      data: {
        adminId: admin.id,
        passwordHash: admin.passwordHash,
      },
    })

    // Update admin password AND reset any lockouts
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        loginAttempts: 0,
        lockoutUntil: null,
      },
    })

    // Keep only the last 3 history records
    const allHistory = await prisma.passwordHistory.findMany({
      where: { adminId: admin.id },
      orderBy: { createdAt: 'desc' },
    })
    if (allHistory.length > 3) {
      const idsToDelete = allHistory.slice(3).map((h) => h.id)
      await prisma.passwordHistory.deleteMany({
        where: { id: { in: idsToDelete } },
      })
    }

    // Send confirmation email notification to the staff/admin member
    const settings = await fetchEmailFooterSettings(prisma)
    const clientUrl = env.CLIENT_URL || 'https://www.snaptech.digital'
    const rawPath = env.ADMIN_SECRET_PATH || 'admin-login'
    const loginPath = rawPath.startsWith('admin-') ? rawPath : `admin-${rawPath}`
    const loginUrl = `${clientUrl}/${loginPath}`

    sendEmail({
      to: admin.email,
      subject: 'Security Alert: Your SnapTech Digital Staff Password Was Changed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;"><span style="color: #0066FF;">SnapTech</span> Digital</h1>
            <p style="color: #93c5fd; margin: 6px 0 0; font-size: 14px;">Staff Portal Security Update &bull; Hindustan Projects</p>
          </div>

          <p style="font-size: 16px; color: #1A1A1A;">Hello,</p>

          <p style="font-size: 15px; color: #374151; line-height: 1.7;">
            The password for your staff account (<strong>${admin.email}</strong>) at <strong>SnapTech Digital</strong> was changed successfully.
          </p>

          <div style="background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #4B5563; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Account Details</p>
            <p style="margin: 0 0 6px; font-size: 14px; color: #1A1A1A;">📧 <strong>Email:</strong> ${admin.email}</p>
            <p style="margin: 0 0 6px; font-size: 14px; color: #1A1A1A;">🕒 <strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p style="margin: 0; font-size: 14px; color: #1A1A1A;">🌐 <strong>Portal URL:</strong> <a href="${loginUrl}" style="color: #1A3E8C;">${loginUrl}</a></p>
          </div>

          <div style="background: #fff8f0; border: 1px solid #fed7aa; border-radius: 6px; padding: 12px 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">⚠️ If you did not make this password change, please contact your system administrator immediately.</p>
          </div>

          ${professionalEmailFooter(settings)}
        </div>
      `,
      text: `Hello,\n\nYour password for Hindustan Projects staff portal (${admin.email}) was changed successfully.\nPortal URL: ${loginUrl}\n\nIf you did not perform this change, please contact support immediately.\n\nHindustan Projects Team`
    }).catch((err) => {
      console.error('[staff-email] Failed to send password change notification email:', err.message)
    })

    res.json({ status: 'ok', message: 'Password updated successfully. Confirmation email sent.' })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/admin/change-email ──────────────────────────────
export const changeEmail = async (req, res, next) => {
  try {
    const { newEmail, password } = req.body
    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } })
    if (!admin) return res.status(404).json({ status: 'error', message: 'Admin not found.' })

    const valid = await bcrypt.compare(password, admin.passwordHash)
    if (!valid) {
      return res.status(401).json({ status: 'error', message: 'Incorrect password.' })
    }

    // Check if new email is already in use by another admin
    const existing = await prisma.admin.findUnique({ where: { email: newEmail } })
    if (existing && existing.id !== admin.id) {
      return res.status(400).json({ status: 'error', message: 'Email is already in use.' })
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: { email: newEmail },
    })

    // Generate new JWT token and update cookie
    const token = jwt.sign(
      { id: updatedAdmin.id, email: updatedAdmin.email, role: updatedAdmin.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || '7d' }
    )

    setAdminCookie(res, token)

    res.json({
      status: 'ok',
      message: 'Email updated successfully.',
      data: { id: updatedAdmin.id, email: updatedAdmin.email, role: updatedAdmin.role },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/admin/master-key-hint ───────────────────────────
// Returns the current master key for display in Account Settings.
// Full key is returned (SUPER_ADMIN only, requires valid JWT cookie).
export const getMasterKeyHint = async (req, res, next) => {
  try {
    const currentMaster = await resolveMasterKey()
    const dbRow = await prisma.siteSetting.findUnique({
      where: { key: 'sys_integration_master_key' },
    })

    res.json({
      status: 'ok',
      key: currentMaster || null,
      source: dbRow?.value ? 'database' : 'env',
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/admin/change-master-key ────────────────────────
export const changeMasterKey = async (req, res, next) => {
  try {
    const { currentKey, newKey } = req.body

    if (!newKey || typeof newKey !== 'string' || newKey.trim().length < 8) {
      return res
        .status(400)
        .json({ status: 'error', message: 'New key must be at least 8 characters.' })
    }

    const { match, masterKey } = await verifyMasterKey(currentKey)

    if (!masterKey) {
      return res
        .status(500)
        .json({ status: 'error', message: 'Master key not configured on server.' })
    }

    if (!match) {
      return res.status(401).json({ status: 'error', message: 'Current master key is incorrect.' })
    }

    // Save new key to DB and update process.env
    await prisma.siteSetting.upsert({
      where: { key: 'sys_integration_master_key' },
      update: { value: newKey.trim() },
      create: { key: 'sys_integration_master_key', value: newKey.trim() },
    })
    process.env.INTEGRATION_MASTER_KEY = newKey.trim()

    res.json({ status: 'ok', message: 'Integration master key updated successfully.' })
  } catch (err) {
    next(err)
  }
}
export const getDashboardStats = async (req, res, next) => {
  try {
    const isStaff = req.admin.role === 'STAFF'
    if (isStaff) {
      const [myTasks, myTickets, myRecentNotes, myAssignedProjects] = await Promise.all([
        prisma.workTask.findMany({
          where: {
            OR: [
              { creatorId: req.admin.id },
              { assignedToAdminId: req.admin.id },
              { assignedTo: req.admin.email },
            ],
          },
          include: {
            clientProject: { select: { id: true, projectTitle: true, clientName: true } },
          },
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.supportTicket.findMany({
          where: { assignedAdminId: req.admin.id },
          include: { clientProject: { select: { id: true, projectTitle: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
        prisma.quickNote.findMany({
          where: { creatorId: req.admin.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.clientProject.findMany({
          where: {
            deletedAt: null,
            OR: [
              { assignedToEmail: req.admin.email },
              { assignedTo: req.admin.email },
            ],
          },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
      ])

      const totalTasks = myTasks.length
      const todoTasks = myTasks.filter((t) => t.status === 'TODO').length
      const inProgressTasks = myTasks.filter((t) => t.status === 'IN_PROGRESS').length
      const completedTasks = myTasks.filter((t) => t.status === 'DONE').length
      const urgentTasksCount = myTasks.filter((t) => t.priority === 'URGENT' && t.status !== 'DONE').length

      const totalEstimatedHours = myTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
      const totalLoggedHours = myTasks.reduce((sum, t) => sum + (t.loggedHours || 0), 0)

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      const dueTodayTasksCount = myTasks.filter((t) => {
        if (!t.dueDate || t.status === 'DONE') return false
        const d = new Date(t.dueDate)
        return d >= todayStart && d <= todayEnd
      }).length

      return res.json({
        status: 'ok',
        data: {
          role: 'STAFF',
          totalTasks,
          todoTasks,
          inProgressTasks,
          completedTasks,
          urgentTasksCount,
          dueTodayTasksCount,
          totalEstimatedHours,
          totalLoggedHours,
          myAssignedTickets: myTickets,
          myAssignedProjects,
          recentTasks: myTasks.slice(0, 5),
          recentNotes: myRecentNotes,
        },
      })
    }

    // Fetch creation dates for the past 6 months to compute trends
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const safeQuery = async (queryFn, fallbackValue) => {
      try {
        return await queryFn()
      } catch (_err) {
        return fallbackValue
      }
    }

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      closedLeads,
      totalProjects,
      totalServices,
      totalTeam,
      totalApplications,
      openPositions,
      clientProjects,
      workTasks,
      totalPublishedBlogPosts,
      pendingBlogComments,
      totalTestimonials,
      siteSettings,
      recentLeads,
      recentProjects,
      billingMilestones,
      totalClients,
    ] = await Promise.all([
      safeQuery(() => prisma.contactLead.count({ where: { deletedAt: null } }), 0),
      safeQuery(() => prisma.contactLead.count({ where: { status: 'NEW', deletedAt: null } }), 0),
      safeQuery(() => prisma.contactLead.count({ where: { status: 'CONTACTED', deletedAt: null } }), 0),
      safeQuery(() => prisma.contactLead.count({ where: { status: 'CLOSED', deletedAt: null } }), 0),
      safeQuery(() => prisma.project.count(), 0),
      safeQuery(() => prisma.service.count({ where: { isActive: true } }), 0),
      safeQuery(() => prisma.teamMember.count(), 0),
      safeQuery(() => prisma.jobApplication.count({ where: { deletedAt: null } }), 0),
      safeQuery(() => prisma.jobPosting.count({ where: { isActive: true } }), 0),
      safeQuery(() => prisma.clientProject.findMany({ where: { deletedAt: null } }), []),
      safeQuery(() => prisma.workTask.findMany(), []),
      safeQuery(() => prisma.blogPost.count({ where: { status: 'PUBLISHED', deletedAt: null } }), 0),
      safeQuery(() => prisma.blogComment.count({ where: { isApproved: false } }), 0),
      safeQuery(() => prisma.testimonial.count({ where: { isActive: true } }), 0),
      safeQuery(
        () =>
          prisma.siteSetting.findMany({
            where: {
              key: {
                in: ['phone', 'email', 'address', 'linkedin', 'instagram', 'facebook'],
              },
            },
          }),
        []
      ),
      safeQuery(
        () =>
          prisma.contactLead.findMany({
            where: { createdAt: { gte: sixMonthsAgo }, deletedAt: null },
            select: { createdAt: true },
          }),
        []
      ),
      safeQuery(
        () =>
          prisma.clientProject.findMany({
            where: { createdAt: { gte: sixMonthsAgo }, deletedAt: null },
            select: { createdAt: true },
          }),
        []
      ),
      safeQuery(() => prisma.billingMilestone.findMany(), []),
      safeQuery(() => prisma.client.count(), 0),
    ])

    const totalPaidRevenue = (billingMilestones || [])
      .filter((m) => m.status === 'PAID')
      .reduce((sum, m) => sum + (m.amount || 0), 0)

    const totalPendingReceivables = (billingMilestones || [])
      .filter((m) => m.status === 'PENDING' || m.status === 'OVERDUE')
      .reduce((sum, m) => sum + (m.amount || 0), 0)

    const totalBillingVolume = (billingMilestones || []).reduce((sum, m) => sum + (m.amount || 0), 0)

    const activeProjectsCount = (clientProjects || []).filter((p) => p.status !== 'COMPLETED').length
    const now = new Date()
    const overdueProjectsCount = (clientProjects || []).filter(
      (p) => p.status !== 'COMPLETED' && p.deadline && new Date(p.deadline) < now
    ).length

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    const dueTodayTasksCount = workTasks.filter((t) => {
      if (!t.dueDate || t.status === 'DONE') return false
      const d = new Date(t.dueDate)
      return d >= todayStart && d <= todayEnd
    }).length

    const phone = siteSettings.find((s) => s.key === 'phone')?.value || ''
    const email = siteSettings.find((s) => s.key === 'email')?.value || ''
    const address = siteSettings.find((s) => s.key === 'address')?.value || ''
    const linkedin = siteSettings.find((s) => s.key === 'linkedin')?.value || ''
    const instagram = siteSettings.find((s) => s.key === 'instagram')?.value || ''
    const facebook = siteSettings.find((s) => s.key === 'facebook')?.value || ''

    const hasContactInfo = !!(phone && email && address)
    const hasSocialLinks = !!(linkedin || instagram || facebook)

    // Calculate project status distribution
    const projectStatusDistribution = {
      PLANNING: clientProjects.filter((p) => p.status === 'PLANNING').length,
      IN_PROGRESS: clientProjects.filter((p) => p.status === 'IN_PROGRESS').length,
      REVIEW: clientProjects.filter((p) => p.status === 'REVIEW').length,
      COMPLETED: clientProjects.filter((p) => p.status === 'COMPLETED').length,
      ON_HOLD: clientProjects.filter((p) => p.status === 'ON_HOLD').length,
    }

    // Calculate task status distribution
    const taskStatusDistribution = {
      TODO: workTasks.filter((t) => t.status === 'TODO').length,
      IN_PROGRESS: workTasks.filter((t) => t.status === 'IN_PROGRESS').length,
      DONE: workTasks.filter((t) => t.status === 'DONE').length,
      BLOCKED: workTasks.filter((t) => t.status === 'BLOCKED').length,
    }

    // Calculate monthly trends
    const monthsData = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const monthIndex = d.getMonth()
      const year = d.getFullYear()
      monthsData.push({
        label: `${monthNames[monthIndex]}`,
        monthVal: monthIndex,
        yearVal: year,
        leads: 0,
        projects: 0,
      })
    }

    recentLeads.forEach((lead) => {
      const ld = new Date(lead.createdAt)
      const m = ld.getMonth()
      const y = ld.getFullYear()
      const target = monthsData.find((item) => item.monthVal === m && item.yearVal === y)
      if (target) target.leads++
    })

    recentProjects.forEach((proj) => {
      const pd = new Date(proj.createdAt)
      const m = pd.getMonth()
      const y = pd.getFullYear()
      const target = monthsData.find((item) => item.monthVal === m && item.yearVal === y)
      if (target) target.projects++
    })

    const monthlyTrends = monthsData.map((item) => ({
      month: item.label,
      leads: item.leads,
      projects: item.projects,
    }))

    res.json({
      status: 'ok',
      data: {
        totalPaidRevenue,
        totalPendingReceivables,
        totalBillingVolume,
        totalClients,
        totalLeads,
        newLeads,
        contactedLeads,
        closedLeads,
        totalProjects,
        totalServices,
        totalTeam,
        totalApplications,
        openPositions,
        activeProjectsCount,
        overdueProjectsCount,
        dueTodayTasksCount,
        totalClientProjectsCount: clientProjects.length,
        totalPublishedBlogPosts,
        pendingBlogComments,
        totalTestimonials,
        hasContactInfo,
        hasSocialLinks,
        projectStatusDistribution,
        taskStatusDistribution,
        monthlyTrends,
      },
    })
  } catch (err) {
    next(err)
  }
}

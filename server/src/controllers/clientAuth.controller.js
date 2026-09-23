/**
 * clientAuth.controller.js — Authentication for CLIENT portal
 */
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/db.js'
import { env } from '../config/env.js'
import { setClientCookie, clearClientCookies } from '../utils/authCookie.js'
import { sendEmail, professionalEmailFooter, fetchEmailFooterSettings } from '../utils/mailer.js'

// POST /api/client/login
export const clientLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required.' })
    }

    const client = await prisma.client.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!client) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' })
    }

    if (!client.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact support.',
      })
    }

    if (!client.passwordHash) {
      return res.status(400).json({
        status: 'error',
        message: 'Account not set up yet. Please use the link sent to your email to set a password.',
      })
    }

    const valid = await bcrypt.compare(password, client.passwordHash)
    if (!valid) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' })
    }

    // Generate Client Access Token (expires in 24h)
    const token = jwt.sign(
      { id: client.id, email: client.email, role: 'CLIENT' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    setClientCookie(res, token)

    res.json({
      status: 'ok',
      data: {
        id: client.id,
        name: client.name,
        email: client.email,
        role: 'CLIENT',
      },
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/client/me
export const getClientProfile = async (req, res, next) => {
  try {
    if (!req.client) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated.' })
    }
    res.json({
      status: 'ok',
      data: {
        id: req.client.id,
        name: req.client.name,
        email: req.client.email,
        role: 'CLIENT',
      },
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/client/setup-password
export const setupClientPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ status: 'error', message: 'Token and password are required.' })
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long.',
      })
    }

    const client = await prisma.client.findUnique({
      where: { inviteToken: token },
    })

    if (!client || (client.inviteTokenExpires && new Date() > client.inviteTokenExpires)) {
      return res.status(400).json({
        status: 'error',
        message: 'Setup link is invalid or has expired.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const updatedClient = await prisma.client.update({
      where: { id: client.id },
      data: {
        passwordHash,
        inviteToken: null,
        inviteTokenExpires: null,
      },
    })

    // Log them in immediately
    const loginToken = jwt.sign(
      { id: updatedClient.id, email: updatedClient.email, role: 'CLIENT' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    setClientCookie(res, loginToken)

    // Send welcome + login details email with CORRECT login URL (/client-login not /client/login)
    const clientUrl = env.CLIENT_URL || 'https://www.snaptech.digital'
    const loginUrl = `${clientUrl}/client-login`

    const settings = await fetchEmailFooterSettings(prisma)

    sendEmail({
      to: updatedClient.email,
      subject: 'Your SnapTech Digital Portal Account is Ready',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="background: #1A3E8C; padding: 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;"><span style="color: #0066FF;">SnapTech</span> Digital</h1>
            <p style="color: #93c5fd; margin: 6px 0 0; font-size: 14px;">Client Portal &bull; Hindustan Projects</p>
          </div>

          <p style="font-size: 16px; color: #1A1A1A;">Hi <strong>${updatedClient.name}</strong>,</p>

          <p style="font-size: 15px; color: #374151; line-height: 1.7;">
            Your client portal account is now active! Here are your login details &mdash; please save them safely.
          </p>

          <div style="background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #4B5563; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Your Login Details</p>
            <p style="margin: 0 0 6px; font-size: 14px; color: #1A1A1A;"><strong>Email:</strong> ${updatedClient.email}</p>
            <p style="margin: 0 0 6px; font-size: 14px; color: #1A1A1A;"><strong>Password:</strong> The one you just set</p>
            <p style="margin: 0; font-size: 14px; color: #1A1A1A;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #0066FF;">${loginUrl}</a></p>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #0066FF; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">Go to My Dashboard</a>
          </p>

          ${professionalEmailFooter(settings)}
        </div>
      `,
      text: `Hi ${updatedClient.name},\n\nYour client portal account is now active!\n\nLogin Details:\nEmail: ${updatedClient.email}\nPassword: The one you just set\nLogin URL: ${loginUrl}\n\nSnapTech Digital\nPhone: ${settings.phone || '+91 75970 00601'}\nWeb: www.snaptech.digital\nBhilwara, Rajasthan, India`,
    }).catch((err) => {
      console.error('[welcome-email] Failed to send:', err.message)
    })

    res.json({
      status: 'ok',
      message: 'Password set successfully.',
      data: {
        id: updatedClient.id,
        name: updatedClient.name,
        email: updatedClient.email,
        role: 'CLIENT',
      },
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/client/logout
export const clientLogout = async (req, res, next) => {
  try {
    clearClientCookies(res)
    res.json({ status: 'ok', message: 'Logged out successfully.' })
  } catch (err) {
    next(err)
  }
}

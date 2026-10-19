/**
 * auth.js — JWT verification middleware for protected admin routes.
 *
 * JWT is stored in an httpOnly cookie (set during admin login in Phase 7).
 * Falls back to Authorization Bearer header for API clients / testing.
 *
 * Usage: apply to any admin route
 *   router.get('/admin/leads', verifyToken, requireRole('ADMIN'), controller)
 */

import jwt from 'jsonwebtoken'

/**
 * Verifies JWT from httpOnly cookie or Authorization header.
 * Attaches decoded payload to req.admin on success.
 */
export const verifyToken = (req, res, next) => {
  // 1. Check httpOnly cookie first (production auth flow)
  const tokenFromCookie = req.cookies?.adminToken

  // 2. Fall back to Authorization: Bearer <token> header
  const authHeader = req.headers['authorization']
  const tokenFromHeader =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  // 3. Fall back to query param ?token= (useful for direct file views in new browser tabs)
  const tokenFromQuery = req.query?.token

  const token = tokenFromCookie || tokenFromHeader || tokenFromQuery

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required. Please log in.',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = decoded // { id, email, role, iat, exp }
    next()
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid token. Please log in again.'

    return res.status(401).json({ status: 'error', message })
  }
}

/**
 * Role-based access guard — use after verifyToken.
 * @param {...string} roles — allowed roles e.g. 'ADMIN', 'SUPER_ADMIN'
 */
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated.' })
    }
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.',
      })
    }
    next()
  }

/**
 * Stealth filter - makes all /api/admin routes return a generic 404 Not Found 
 * if the request lacks a valid token.
 */
export const hideAdminRoutes = (req, res, next) => {
  const envSecret = process.env.ADMIN_SECRET_PATH || 'admin-portal'
  const strippedSecret = envSecret.startsWith('admin-') ? envSecret.slice(6) : envSecret
  const prefixedSecret = envSecret.startsWith('admin-') ? envSecret : `admin-${envSecret}`

  const cleanUrl = (req.originalUrl.split('?')[0] || '').replace(/\/+$/, '') || '/api/admin'

  // Allowed public/login paths that bypass stealth 404
  const allowedPaths = [
    `/api/admin/${envSecret}/login`,
    `/api/admin/${envSecret}`,
    `/api/admin/${strippedSecret}/login`,
    `/api/admin/${strippedSecret}`,
    `/api/admin/${prefixedSecret}/login`,
    `/api/admin/${prefixedSecret}`,
    `/api/admin/logout`,
    `/api/admin/refresh-token`,
    `/api/admin/2fa/login`,
  ]

  // Allow /api/admin/login and /api/admin ONLY when a valid stealth header is supplied
  const adminPathHeader = (req.headers['x-admin-path'] || req.headers['x-admin-secret'] || '')
    .toString()
    .trim()
    .toLowerCase()
  const validSecrets = [envSecret, strippedSecret, prefixedSecret]
    .filter(Boolean)
    .map((s) => s.toLowerCase())

  if (adminPathHeader && validSecrets.includes(adminPathHeader)) {
    allowedPaths.push('/api/admin/login', '/api/admin')
  }

  if (allowedPaths.includes(cleanUrl)) {
    return next()
  }

  // Extract access token
  const tokenFromCookie = req.cookies?.adminToken
  const authHeader = req.headers['authorization']
  const tokenFromHeader =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  const token = tokenFromCookie || tokenFromHeader

  if (!token) {
    return res.status(404).json({
      status: 'error',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    })
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    // Return 404 so expired/invalid tokens don't confirm route existence
    return res.status(404).json({
      status: 'error',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    })
  }
}

/**
 * Verifies Client JWT from httpOnly cookie or Authorization header.
 * Attaches decoded payload to req.client on success.
 */
export const verifyClientToken = (req, res, next) => {
  const tokenFromCookie = req.cookies?.clientToken

  const authHeader = req.headers['authorization']
  const tokenFromHeader =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  const token = tokenFromCookie || tokenFromHeader

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required. Please log in.',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'CLIENT') {
      return res.status(403).json({ status: 'error', message: 'Access denied.' })
    }
    req.client = decoded // { id, email, role }
    next()
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid token. Please log in again.'

    return res.status(401).json({ status: 'error', message })
  }
}


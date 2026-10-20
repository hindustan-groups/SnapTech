/**
 * webhook.route.js — Public Inbound Webhook Endpoints (Protected by Webhook Secret / Signature)
 */

import { Router } from 'express'
import { inboundEmailWebhookHandler } from '../controllers/emailCenter.controller.js'

const router = Router()

// POST /api/webhooks/email-inbound — Accepts incoming emails from Resend Inbound, Cloudflare, etc.
router.post('/email-inbound', inboundEmailWebhookHandler)

export default router

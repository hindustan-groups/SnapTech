/**
 * content.controller.js — FAQs, SiteSettings, Milestones, Partners
 * Public GET + Admin CRUD
 */
import prisma from '../config/db.js'
import { logActivity } from '../utils/activity.js'

// ── FAQs ──────────────────────────────────────────────────────
export const getFaqs = async (_req, res, next) => {
  try {
    const faqs = await prisma.faq.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } })
    res.json({ status: 'ok', data: faqs })
  } catch (err) {
    next(err)
  }
}
export const listFaqs = async (_req, res, next) => {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { order: 'asc' } })
    res.json({ status: 'ok', data: faqs })
  } catch (err) {
    next(err)
  }
}
export const createFaq = async (req, res, next) => {
  try {
    const f = await prisma.faq.create({ data: req.body })
    
    await logActivity(req, 'CREATE', 'Faq', `Created FAQ: '${f.question}'`)
    
    res.status(201).json({ status: 'ok', data: f })
  } catch (err) {
    next(err)
  }
}
export const updateFaq = async (req, res, next) => {
  try {
    const f = await prisma.faq.update({ where: { id: req.params.id }, data: req.body })
    
    await logActivity(req, 'UPDATE', 'Faq', `Updated FAQ: '${f.question}'`)
    
    res.json({ status: 'ok', data: f })
  } catch (err) {
    next(err)
  }
}
export const deleteFaq = async (req, res, next) => {
  try {
    const { id } = req.params
    const faq = await prisma.faq.findUnique({ where: { id } })
    if (faq) {
      await prisma.faq.delete({ where: { id } })
      await logActivity(req, 'DELETE', 'Faq', `Deleted FAQ: '${faq.question}'`)
    }
    res.json({ status: 'ok', message: 'Deleted.' })
  } catch (err) {
    next(err)
  }
}

// ── Site Settings ─────────────────────────────────────────────
export const getSettings = async (_req, res, next) => {
  try {
    const rows = await prisma.siteSetting.findMany()
    const settings = {}
    for (const r of rows) {
      if (r.key.startsWith('sys_')) {
        if (r.key === 'sys_sentry_dsn' || r.key === 'sys_ga_measurement_id') {
          settings[r.key] = r.value
        }
      } else {
        settings[r.key] = r.value
      }
    }

    // Populate normalized public email routing endpoints
    settings.email = settings.email_routing_general || settings.email || 'info@snaptech.digital'
    settings.sales_email = settings.email_routing_sales || 'sales@snaptech.digital'
    settings.support_email = settings.email_routing_support || 'support@snaptech.digital'
    settings.careers_email = settings.email_routing_careers || 'careers@snaptech.digital'
    settings.privacy_email = settings.email_routing_privacy || 'privacy@snaptech.digital'
    settings.billing_email = settings.email_routing_billing || 'billing@snaptech.digital'

    res.json({ status: 'ok', data: settings })
  } catch (err) {
    next(err)
  }
}
export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body // { key: value, ... }
    const operations = Object.entries(updates).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )

    await prisma.$transaction(operations)
    
    await logActivity(req, 'UPDATE', 'SiteSetting', `Updated site settings: ${Object.keys(updates).join(', ')}`)
    
    res.json({ status: 'ok', message: 'Settings updated.' })
  } catch (err) {
    next(err)
  }
}

// ── Milestones ────────────────────────────────────────────────
export const getMilestones = async (_req, res, next) => {
  try {
    const m = await prisma.milestone.findMany({ orderBy: { order: 'asc' } })
    res.json({ status: 'ok', data: m })
  } catch (err) {
    next(err)
  }
}
export const createMilestone = async (req, res, next) => {
  try {
    const { year, title, desc, order = 0 } = req.body
    const m = await prisma.milestone.create({
      data: {
        year: String(year),
        title: String(title),
        desc: String(desc),
        order: Number(order) || 0,
      },
    })
    
    await logActivity(req, 'CREATE', 'Milestone', `Created milestone: '${m.year} - ${m.title}'`)
    
    res.status(201).json({ status: 'ok', data: m })
  } catch (err) {
    next(err)
  }
}
export const updateMilestone = async (req, res, next) => {
  try {
    const { id } = req.params
    const { year, title, desc, order } = req.body

    const updateData = {}
    if (year !== undefined) updateData.year = String(year)
    if (title !== undefined) updateData.title = String(title)
    if (desc !== undefined) updateData.desc = String(desc)
    if (order !== undefined) updateData.order = Number(order) || 0

    const m = await prisma.milestone.update({
      where: { id },
      data: updateData,
    })
    
    await logActivity(req, 'UPDATE', 'Milestone', `Updated milestone: '${m.year} - ${m.title}'`)
    
    res.json({ status: 'ok', data: m })
  } catch (err) {
    next(err)
  }
}
export const deleteMilestone = async (req, res, next) => {
  try {
    const { id } = req.params
    const m = await prisma.milestone.findUnique({ where: { id } })
    if (!m) {
      return res.status(404).json({ status: 'error', message: 'Milestone not found.' })
    }
    await prisma.milestone.delete({ where: { id } })
    await logActivity(req, 'DELETE', 'Milestone', `Deleted milestone: '${m.year} - ${m.title}'`)
    res.json({ status: 'ok', message: 'Deleted.' })
  } catch (err) {
    next(err)
  }
}

// ── Partners ──────────────────────────────────────────────────
export const getPartners = async (_req, res, next) => {
  try {
    const p = await prisma.partner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
    res.json({ status: 'ok', data: p })
  } catch (err) {
    next(err)
  }
}
export const listPartners = async (_req, res, next) => {
  try {
    const p = await prisma.partner.findMany({ orderBy: { order: 'asc' } })
    res.json({ status: 'ok', data: p })
  } catch (err) {
    next(err)
  }
}
export const createPartner = async (req, res, next) => {
  try {
    const p = await prisma.partner.create({ data: req.body })
    
    await logActivity(req, 'CREATE', 'Partner', `Created partner: '${p.name}'`)
    
    res.status(201).json({ status: 'ok', data: p })
  } catch (err) {
    next(err)
  }
}
export const updatePartner = async (req, res, next) => {
  try {
    const p = await prisma.partner.update({ where: { id: req.params.id }, data: req.body })
    
    await logActivity(req, 'UPDATE', 'Partner', `Updated partner: '${p.name}'`)
    
    res.json({ status: 'ok', data: p })
  } catch (err) {
    next(err)
  }
}
export const deletePartner = async (req, res, next) => {
  try {
    const { id } = req.params
    const p = await prisma.partner.findUnique({ where: { id } })
    if (p) {
      await prisma.partner.delete({ where: { id } })
      await logActivity(req, 'DELETE', 'Partner', `Deleted partner: '${p.name}'`)
    }
    res.json({ status: 'ok', message: 'Deleted.' })
  } catch (err) {
    next(err)
  }
}

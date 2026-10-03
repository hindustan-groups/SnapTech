/**
 * pricing.controller.js — Pricing Packages CMS controller
 * Public GET + Admin CRUD
 */
import prisma from '../config/db.js'
import { logActivity } from '../utils/activity.js'

// ── Public: Get active pricing packages ─────────────────────────
export const getPublicPricing = async (req, res, next) => {
  try {
    const { category } = req.query
    const where = { isActive: true }
    if (category) {
      where.category = String(category).toLowerCase()
    }

    const packages = await prisma.pricingPackage.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
    })

    // Set cache headers for fast public response
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
    res.json({ status: 'ok', data: packages })
  } catch (err) {
    next(err)
  }
}

// ── Admin: List all packages (including inactive) ───────────────
export const adminListPricing = async (_req, res, next) => {
  try {
    const packages = await prisma.pricingPackage.findMany({
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
    })
    res.json({ status: 'ok', data: packages })
  } catch (err) {
    next(err)
  }
}

// ── Admin: Create a new package ─────────────────────────────────
export const adminCreatePricing = async (req, res, next) => {
  try {
    const {
      category,
      title,
      slug,
      price,
      period,
      priceSubtitle,
      badge,
      isPopular = false,
      delivery,
      timeline,
      support,
      description,
      features = [],
      techStack = [],
      groups,
      colorGradient,
      ctaText = 'Choose Plan',
      ctaUrl,
      order = 0,
      isActive = true,
    } = req.body

    if (!category || !title || !price) {
      return res.status(400).json({ status: 'error', message: 'Category, title, and price are required.' })
    }

    const pkg = await prisma.pricingPackage.create({
      data: {
        category: category.toLowerCase().trim(),
        title: title.trim(),
        slug: slug?.trim() || null,
        price: price.trim(),
        period: period?.trim() || null,
        priceSubtitle: priceSubtitle?.trim() || null,
        badge: badge?.trim() || null,
        isPopular: Boolean(isPopular),
        delivery: delivery?.trim() || null,
        timeline: timeline?.trim() || delivery?.trim() || null,
        support: support?.trim() || null,
        description: description?.trim() || null,
        features: Array.isArray(features) ? features : [],
        techStack: Array.isArray(techStack) ? techStack : [],
        groups: groups || null,
        colorGradient: colorGradient?.trim() || null,
        ctaText: ctaText?.trim() || 'Choose Plan',
        ctaUrl: ctaUrl?.trim() || null,
        order: Number(order) || 0,
        isActive: Boolean(isActive),
      },
    })

    await logActivity(req, 'CREATE', 'PricingPackage', `Created pricing package: '${pkg.title}' (${pkg.category})`)

    res.status(201).json({ status: 'ok', data: pkg })
  } catch (err) {
    next(err)
  }
}

// ── Admin: Update a package ─────────────────────────────────────
export const adminUpdatePricing = async (req, res, next) => {
  try {
    const { id } = req.params
    const data = { ...req.body }

    if (data.category) data.category = data.category.toLowerCase().trim()
    if (data.title) data.title = data.title.trim()
    if (data.price) data.price = data.price.trim()
    if (data.isPopular !== undefined) data.isPopular = Boolean(data.isPopular)
    if (data.isActive !== undefined) data.isActive = Boolean(data.isActive)
    if (data.order !== undefined) data.order = Number(data.order)

    const updated = await prisma.pricingPackage.update({
      where: { id },
      data,
    })

    await logActivity(req, 'UPDATE', 'PricingPackage', `Updated pricing package: '${updated.title}'`)

    res.json({ status: 'ok', data: updated })
  } catch (err) {
    next(err)
  }
}

// ── Admin: Bulk update pricing packages (e.g. from table/matrix editor) ─
export const adminBulkUpdatePricing = async (req, res, next) => {
  try {
    const { packages } = req.body
    if (!Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Packages array is required.' })
    }

    const updates = packages.map((pkg) => {
      const data = { ...pkg }
      delete data.id
      delete data.createdAt
      delete data.updatedAt
      return prisma.pricingPackage.update({
        where: { id: pkg.id },
        data,
      })
    })

    const results = await prisma.$transaction(updates)
    await logActivity(req, 'UPDATE', 'PricingPackage', `Bulk updated ${results.length} pricing packages`)

    res.json({ status: 'ok', data: results })
  } catch (err) {
    next(err)
  }
}

// ── Admin: Delete or deactivate package ─────────────────────────
export const adminDeletePricing = async (req, res, next) => {
  try {
    const { id } = req.params
    const existing = await prisma.pricingPackage.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'Package not found.' })
    }

    await prisma.pricingPackage.delete({ where: { id } })
    await logActivity(req, 'DELETE', 'PricingPackage', `Deleted pricing package: '${existing.title}'`)

    res.json({ status: 'ok', message: 'Pricing package deleted successfully.' })
  } catch (err) {
    next(err)
  }
}

/**
 * adminProjects.controller.js — Admin CRUD for Projects
 */
import prisma from '../config/db.js'
import { logActivity } from '../utils/activity.js'

/**
 * Automatically generates a pre-formatted social media post draft when a project is marked featured.
 */
async function generateSocialDraft(project) {
  if (!project.isFeatured) return

  // Check if a draft already exists for this project
  const existing = await prisma.socialPostDraft.findFirst({
    where: { projectId: project.id },
  })
  if (existing) return

  const techHashtags = project.technologies && project.technologies.length > 0
    ? project.technologies.map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ')
    : '#TechSolutions'

  const caption = `🚀 NEW FEATURED PROJECT: ${project.title} 🚀\n\nWe are thrilled to showcase our latest work! We recently delivered this high-performance ${project.category} solution for our esteemed client, ${project.clientName}.\n\n🛠️ Technologies: ${project.technologies?.join(', ') || 'Modern Stack'}\n\n🔗 Live link: ${project.liveUrl || 'https://hindustanprojects.com'}\n\n#HindustanProjects #WebDevelopment #SoftwareEngineering #Portfolio ${techHashtags}`

  await prisma.socialPostDraft.create({
    data: {
      projectId: project.id,
      text: caption,
      status: 'DRAFT',
    },
  })
}

export const listProjects = async (_req, res, next) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
    res.json({ status: 'ok', data: projects })
  } catch (err) {
    next(err)
  }
}

export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      clientName,
      description,
      thumbnailUrl,
      images,
      technologies,
      category,
      isFeatured,
      liveUrl,
      result,
      duration,
      challenge,
      solution,
      features,
    } = req.body
    const project = await prisma.project.create({
      data: {
        title,
        slug,
        clientName,
        description,
        thumbnailUrl,
        images: Array.isArray(images) ? images : [],
        technologies: Array.isArray(technologies) ? technologies : [],
        category,
        isFeatured: isFeatured ?? false,
        liveUrl,
        result: result || null,
        duration: duration || null,
        challenge: challenge || null,
        solution: solution || null,
        features: Array.isArray(features) ? features : [],
      },
    })
    if (project.isFeatured) {
      await generateSocialDraft(project).catch((err) =>
        console.error('[SocialDraft] Generation failed:', err.message)
      )
    }
    
    await logActivity(req, 'CREATE', 'Project', `Created project '${project.title}'`)
    
    res.status(201).json({ status: 'ok', data: project })
  } catch (err) {
    next(err)
  }
}

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const data = { ...req.body }
    if (data.images && !Array.isArray(data.images)) {
      data.images = []
    }
    if (data.technologies && !Array.isArray(data.technologies)) {
      data.technologies = []
    }
    if (data.features && !Array.isArray(data.features)) {
      data.features = []
    }
    const project = await prisma.project.update({ where: { id }, data })
    if (project.isFeatured) {
      await generateSocialDraft(project).catch((err) =>
        console.error('[SocialDraft] Generation failed:', err.message)
      )
    }
    
    await logActivity(req, 'UPDATE', 'Project', `Updated project '${project.title}'`)
    
    res.json({ status: 'ok', data: project })
  } catch (err) {
    next(err)
  }
}

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const project = await prisma.project.findUnique({ where: { id } })
    if (project) {
      await prisma.project.delete({ where: { id } })
      await logActivity(req, 'DELETE', 'Project', `Deleted project '${project.title}'`)
    }
    res.json({ status: 'ok', message: 'Project deleted.' })
  } catch (err) {
    next(err)
  }
}

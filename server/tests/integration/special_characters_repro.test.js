import { describe, it, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../src/app.js'

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-minimum-32-characters-long-for-tests'

const superAdminToken = jwt.sign(
  { id: 'admin-super', email: 'super@snaptech.digital', role: 'SUPER_ADMIN' },
  JWT_SECRET,
  { expiresIn: '2h' }
)

const authCookie = `adminToken=${superAdminToken}`

describe('Special Characters & Special Formatting Pipeline Tests', () => {
  const testCases = [
    { name: 'Pure special characters', input: '!@@#$$%^&*' },
    { name: 'Special characters with words', input: 'Hello !@@#$$%^&* World' },
    { name: 'Ampersand and percent', input: '100% Complete & Ready' },
    { name: 'Price and percent', input: 'Price: $500 | Discount: 20%' },
    { name: 'Math and slash', input: 'A+B = C? Yes/No' },
    { name: 'Double and single quotes', input: 'Quotes: "double" and \'single\'' },
    { name: 'Angle brackets', input: 'Angle brackets: <test> </test>' },
    { name: 'Newline', input: 'Line 1\nLine 2' },
    { name: 'Backslash and slash', input: 'Backslash: \\ Path: /test' },
    { name: 'Emoji', input: 'Emoji: 🚀 ✅' },
    { name: 'Repeated symbols', input: 'Repeated: !!! $$$ %%% &&& ***' },
    { name: 'Multiple consecutive spaces', input: 'Multiple    consecutive    spaces' },
  ]

  describe('Service Admin Input -> Persistence -> Public API Pipeline', () => {
    for (const tc of testCases) {
      it(`preserves exact value for ${tc.name}: "${tc.input}"`, async () => {
        const slug = `test-${Math.random().toString(36).substring(2, 9)}`
        const payload = {
          title: tc.input,
          slug,
          shortDescription: tc.input,
          fullDescription: tc.input,
          icon: 'Globe',
          order: 1,
          isActive: true,
        }

        // 1. Admin POST create
        const createRes = await request(app)
          .post('/api/admin/services')
          .set('Cookie', authCookie)
          .send(payload)

        expect(createRes.status).toBe(201)
        expect(createRes.body.data.title).toBe(tc.input)
        expect(createRes.body.data.shortDescription).toBe(tc.input)
        expect(createRes.body.data.fullDescription).toBe(tc.input)

        const createdId = createRes.body.data.id

        // 2. Public GET /api/services verification
        const publicRes = await request(app).get('/api/services')
        expect(publicRes.status).toBe(200)
        const found = publicRes.body.data.find((s) => s.slug === slug)
        expect(found).toBeDefined()
        expect(found.title).toBe(tc.input)
        expect(found.shortDescription).toBe(tc.input)

        // 3. Admin PATCH update verification with exact equality
        const updatedTitle = `${tc.input} (Updated)`
        const updateRes = await request(app)
          .patch(`/api/admin/services/${createdId}`)
          .set('Cookie', authCookie)
          .send({ title: updatedTitle })

        expect(updateRes.status).toBe(200)
        expect(updateRes.body.data.title).toBe(updatedTitle)
      })
    }

    it('documents leading/trailing whitespace trimming while preserving interior spacing', async () => {
      const input = '   Leading and trailing spaces   '
      const slug = `test-${Math.random().toString(36).substring(2, 9)}`
      const payload = {
        title: input,
        slug,
        shortDescription: input,
        fullDescription: input,
        icon: 'Globe',
        order: 1,
        isActive: true,
      }

      const createRes = await request(app)
        .post('/api/admin/services')
        .set('Cookie', authCookie)
        .send(payload)

      expect(createRes.status).toBe(201)
      // Standard validator .trim() cleans outer margins
      expect(createRes.body.data.title).toBe('Leading and trailing spaces')
    })
  })

  describe('FAQ Admin Input -> Persistence -> Public Content Pipeline', () => {
    it('preserves question with math/slashes and multiline answer with <test> & special characters', async () => {
      const question = 'A+B = C? Yes/No <test>'
      const answer = 'Line 1\nLine 2\nPrice: $500 & Discount: 20%\n!@@#$$%^&*\nQuotes: "double" and \'single\''

      // 1. Admin creates FAQ
      const createRes = await request(app)
        .post('/api/admin/faqs')
        .set('Cookie', authCookie)
        .send({
          question,
          answer,
          order: 1,
          isActive: true,
        })

      expect(createRes.status).toBe(201)
      expect(createRes.body.data.question).toBe(question)
      expect(createRes.body.data.answer).toBe(answer)

      const faqId = createRes.body.data.id

      // 2. Public GET /api/faqs
      const publicRes = await request(app).get('/api/faqs')
      expect(publicRes.status).toBe(200)
      const found = publicRes.body.data.find((f) => f.id === faqId)
      expect(found).toBeDefined()
      expect(found.question).toBe(question)
      expect(found.answer).toBe(answer)

      // 3. Admin updates FAQ
      const updatedAnswer = answer + '\nBackslash: \\ Path: /test 🚀'
      const updateRes = await request(app)
        .patch(`/api/admin/faqs/${faqId}`)
        .set('Cookie', authCookie)
        .send({ answer: updatedAnswer })

      expect(updateRes.status).toBe(200)
      expect(updateRes.body.data.answer).toBe(updatedAnswer)
    })
  })

  describe('Project Admin Input -> Persistence -> Public Content Pipeline', () => {
    it('preserves project title, challenge and solution with special characters & angle brackets', async () => {
      const slug = `proj-${Math.random().toString(36).substring(2, 9)}`
      const title = '100% Complete & Ready: $500 !@@#$$%^&*'
      const description = 'Project description with <test> & "quotes" and emojis 🚀 ✅'
      const clientName = 'Client & Co. / Global'
      const category = 'Web Development'

      const createRes = await request(app)
        .post('/api/admin/projects')
        .set('Cookie', authCookie)
        .send({
          title,
          slug,
          description,
          clientName,
          category,
          isFeatured: true,
        })

      expect(createRes.status).toBe(201)
      expect(createRes.body.data.title).toBe(title)
      expect(createRes.body.data.description).toBe(description)
      expect(createRes.body.data.clientName).toBe(clientName)

      // Public GET /api/projects
      const publicRes = await request(app).get('/api/projects')
      expect(publicRes.status).toBe(200)
      const found = publicRes.body.data.find((p) => p.slug === slug)
      expect(found).toBeDefined()
      expect(found.title).toBe(title)
      expect(found.description).toBe(description)
    })
  })

  describe('Testimonial Admin Input -> Persistence -> Public Content Pipeline', () => {
    it('preserves quotes, emojis, and repeated special characters verbatim', async () => {
      const name = 'Jane Doe 🚀'
      const role = 'CTO & Co-Founder'
      const company = 'Tech & Innovations Inc.'
      const text = 'Repeated: !!! $$$ %%% &&& *** | Quotes: "double" and \'single\' | A+B = C? Yes/No'

      const createRes = await request(app)
        .post('/api/admin/testimonials')
        .set('Cookie', authCookie)
        .send({
          name,
          role,
          company,
          text,
          rating: 5,
          isActive: true,
        })

      expect(createRes.status).toBe(201)
      expect(createRes.body.data.name).toBe(name)
      expect(createRes.body.data.role).toBe(role)
      expect(createRes.body.data.company).toBe(company)
      expect(createRes.body.data.text).toBe(text)

      // Public GET /api/testimonials
      const publicRes = await request(app).get('/api/testimonials')
      expect(publicRes.status).toBe(200)
      const found = publicRes.body.data.find((t) => t.text === text)
      expect(found).toBeDefined()
      expect(found.name).toBe(name)
      expect(found.role).toBe(role)
      expect(found.company).toBe(company)
      expect(found.text).toBe(text)
    })
  })
})

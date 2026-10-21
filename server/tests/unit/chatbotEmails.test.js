/**
 * tests/unit/chatbotEmails.test.js
 *
 * Validates that Chatbot responses dynamically output the departmental email routing
 * addresses configured in Site Settings:
 * - Sales & Quotation Inquiries Email (sales@snaptech.digital)
 * - Customer Support & Helpdesk Email (support@snaptech.digital)
 * - Careers & Recruitment Email (careers@snaptech.digital)
 * - Privacy & Legal Inquiries Email (privacy@snaptech.digital)
 * - Main Business Contact Email (info@snaptech.digital)
 */

import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'

describe('Chatbot Departmental Email Responses', () => {
  it('returns sales email for quotation/sales inquiries', async () => {
    const res = await request(app)
      .post('/api/chatbot/ask')
      .send({ question: 'What is your quotation email?' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.answered).toBe(true)
    expect(res.body.answer).toContain('sales@snaptech.digital')
    expect(res.body.answer).toContain('Sales & Quotation Inquiries')
  })

  it('returns support email for customer support/helpdesk questions', async () => {
    const res = await request(app)
      .post('/api/chatbot/ask')
      .send({ question: 'How can I contact customer support or raise a helpdesk ticket?' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.answered).toBe(true)
    expect(res.body.answer).toContain('support@snaptech.digital')
    expect(res.body.answer).toContain('Customer Support & Helpdesk')
  })

  it('returns careers email for job applications and resume submissions', async () => {
    const res = await request(app)
      .post('/api/chatbot/ask')
      .send({ question: 'What is your recruitment email to send resume?' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.answered).toBe(true)
    expect(res.body.answer).toContain('careers@snaptech.digital')
    expect(res.body.answer).toContain('Careers & Recruitment')
  })

  it('returns privacy email for DPDP / GDPR and legal inquiries', async () => {
    const res = await request(app)
      .post('/api/chatbot/ask')
      .send({ question: 'What is the privacy email for legal data protection inquiry?' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.answered).toBe(true)
    expect(res.body.answer).toContain('privacy@snaptech.digital')
    expect(res.body.answer).toContain('Privacy & Legal Inquiries')
  })

  it('returns all official channels in general contact inquiry', async () => {
    const res = await request(app)
      .post('/api/chatbot/ask')
      .send({ question: 'How can I contact you?' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.answered).toBe(true)
    expect(res.body.answer).toContain('sales@snaptech.digital')
    expect(res.body.answer).toContain('support@snaptech.digital')
    expect(res.body.answer).toContain('careers@snaptech.digital')
    expect(res.body.answer).toContain('privacy@snaptech.digital')
    expect(res.body.answer).toContain('info@snaptech.digital')
  })
})

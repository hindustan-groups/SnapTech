/**
 * resumeDownload.test.js
 *
 * Tests for resume downloading, viewing, and fallback PDF generation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getApplicationResume } from '../../src/controllers/adminCareers.controller.js'
import { generateCandidateDossierPdf } from '../../src/utils/resumePdf.js'
import prisma from '../../src/config/db.js'

vi.mock('../../src/config/db.js', () => ({
  default: {
    jobApplication: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Candidate Resume Download & View Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates a valid %PDF-1.4 document buffer via generateCandidateDossierPdf', () => {
    const pdfBuf = generateCandidateDossierPdf({
      name: 'Priya Sharma',
      role: 'Frontend Developer',
      department: 'Engineering',
      email: 'priya@example.com',
      phone: '+91 9876543210',
      coverLetter: 'Passionate about React and UI/UX design.',
    })

    expect(Buffer.isBuffer(pdfBuf)).toBe(true)
    expect(pdfBuf.length).toBeGreaterThan(500)
    expect(pdfBuf.subarray(0, 8).toString()).toContain('%PDF-1.4')
  })

  it('returns 404 when application ID does not exist', async () => {
    prisma.jobApplication.findUnique.mockResolvedValue(null)

    const req = {
      params: { id: 'non-existent-id' },
      query: {},
    }
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn(),
      send: vi.fn(),
    }
    const next = vi.fn()

    await getApplicationResume(req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', message: 'Application not found' })
    )
  })

  it('serves fallback PDF dossier inline when legacy 404 demo URL is stored', async () => {
    prisma.jobApplication.findUnique.mockResolvedValue({
      id: 'app-123',
      fullName: 'Aman Verma',
      email: 'aman@example.com',
      phone: '+91 9123456789',
      resumeUrl: 'https://res.cloudinary.com/demo/image/upload/v1580000000/sample_resume.pdf',
      coverLetter: 'Excited to apply.',
      status: 'NEW',
      createdAt: new Date(),
      jobPosting: { title: 'Full Stack Engineer', department: 'Engineering' },
    })

    const req = {
      params: { id: 'app-123' },
      query: {},
    }
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn(),
      send: vi.fn(),
    }
    const next = vi.fn()

    await getApplicationResume(req, res, next)

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf')
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringContaining('inline; filename="Resume_Aman_Verma.pdf"')
    )
    expect(res.send).toHaveBeenCalled()
    const sentBuffer = res.send.mock.calls[0][0]
    expect(Buffer.isBuffer(sentBuffer)).toBe(true)
    expect(sentBuffer.subarray(0, 8).toString()).toContain('%PDF-1.4')
  })

  it('sets Content-Disposition to attachment when download=1 is requested', async () => {
    prisma.jobApplication.findUnique.mockResolvedValue({
      id: 'app-456',
      fullName: 'Sunita Meena',
      email: 'sunita@example.com',
      phone: '+91 9888877777',
      resumeUrl: 'https://res.cloudinary.com/demo/image/upload/v1580000000/sample_resume.pdf',
      coverLetter: 'Looking forward to interview.',
      status: 'SHORTLISTED',
      createdAt: new Date(),
      jobPosting: { title: 'UI Designer', department: 'Design' },
    })

    const req = {
      params: { id: 'app-456' },
      query: { download: '1' },
    }
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn(),
      send: vi.fn(),
    }
    const next = vi.fn()

    await getApplicationResume(req, res, next)

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf')
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringContaining('attachment; filename="Resume_Sunita_Meena.pdf"')
    )
    expect(res.send).toHaveBeenCalled()
  })
})

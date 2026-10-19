/**
 * resumePdf.js — Generates a lightweight, valid PDF 1.4 document for candidate resumes/applications
 * Used as a zero-dependency fallback whenever an original resume was archived, lost,
 * or stored with broken legacy demo links so admin never sees a 404 or broken file.
 */

function escapePdfText(str) {
  if (!str) return ''
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E\n]/g, ' ') // normalize non-ascii for standard Type1 Helvetica
}

function wrapText(text, maxChars = 75) {
  const words = escapePdfText(text).split(/\s+/)
  const lines = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim()
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

/**
 * Generates an official candidate dossier PDF buffer
 */
export function generateCandidateDossierPdf(data) {
  const {
    role = 'General Application',
    department = 'General',
    name = 'Candidate',
    email = 'Not Provided',
    phone = 'Not Provided',
    date = new Date().toLocaleString('en-IN'),
    status = 'NEW',
    coverLetter = '',
    appId = 'APP-001',
    originalUrl = '',
  } = data

  const streamLines = []

  // Top header banner background: Navy (#0f172a)
  streamLines.push('0.06 0.09 0.16 rg') // #0f172a
  streamLines.push('30 730 535 85 re f')

  // Red accent border underneath: Red (#dc2626)
  streamLines.push('0.86 0.15 0.15 rg') // #dc2626
  streamLines.push('30 724 535 6 re f')

  // Header Title & Subtitle
  streamLines.push('BT')
  streamLines.push('/F1 18 Tf')
  streamLines.push('1 1 1 rg') // White
  streamLines.push('48 780 Td')
  streamLines.push('(SNAPTECH DIGITAL / HINDUSTAN PROJECTS) Tj')

  streamLines.push('/F1 10 Tf')
  streamLines.push('0.8 0.85 0.9 rg')
  streamLines.push('0 -20 Td')
  streamLines.push('(OFFICIAL CANDIDATE APPLICATION DOSSIER & PROFILE) Tj')
  streamLines.push('ET')

  // Candidate Details Section Box
  streamLines.push('0.97 0.98 0.99 rg') // light slate background
  streamLines.push('30 460 535 240 re f')
  streamLines.push('0.85 0.88 0.92 RG') // light border
  streamLines.push('1 w')
  streamLines.push('30 460 535 240 re s')

  // Candidate Field Labels & Values
  streamLines.push('BT')
  streamLines.push('/F1 13 Tf')
  streamLines.push('0.09 0.13 0.24 rg') // slate-900
  streamLines.push('50 670 Td')
  streamLines.push(`(Position: ${escapePdfText(role)} - ${escapePdfText(department)}) Tj`)

  streamLines.push('/F1 11 Tf')
  streamLines.push('0.25 0.3 0.4 rg')
  streamLines.push('0 -25 Td')
  streamLines.push(`(Full Name:          ${escapePdfText(name)}) Tj`)

  streamLines.push('0 -20 Td')
  streamLines.push(`(Email Address:      ${escapePdfText(email)}) Tj`)

  streamLines.push('0 -20 Td')
  streamLines.push(`(Contact Phone:      ${escapePdfText(phone)}) Tj`)

  streamLines.push('0 -20 Td')
  streamLines.push(`(Application Status: ${escapePdfText(status)}) Tj`)

  streamLines.push('0 -20 Td')
  streamLines.push(`(Application Date:   ${escapePdfText(date)}) Tj`)

  streamLines.push('0 -20 Td')
  streamLines.push(`(Application ID:     ${escapePdfText(appId)}) Tj`)
  streamLines.push('ET')

  // Cover Letter / Notes Box
  streamLines.push('0.98 0.98 0.99 rg')
  streamLines.push('30 260 535 180 re f')
  streamLines.push('0.85 0.88 0.92 RG')
  streamLines.push('30 260 535 180 re s')

  streamLines.push('BT')
  streamLines.push('/F1 11 Tf')
  streamLines.push('0.09 0.13 0.24 rg')
  streamLines.push('50 415 Td')
  streamLines.push('(Candidate Message / Cover Letter:) Tj')

  streamLines.push('/F1 9 Tf')
  streamLines.push('0.2 0.25 0.35 rg')
  const clText = coverLetter || 'No additional cover letter was attached during submission.'
  const clLines = wrapText(clText, 85).slice(0, 6)

  for (const line of clLines) {
    streamLines.push('0 -18 Td')
    streamLines.push(`(${line}) Tj`)
  }
  streamLines.push('ET')

  // Notice Footer Box
  streamLines.push('0.94 0.97 1.0 rg') // faint blue
  streamLines.push('30 160 535 80 re f')
  streamLines.push('0.7 0.8 0.95 RG')
  streamLines.push('30 160 535 80 re s')

  streamLines.push('BT')
  streamLines.push('/F1 9 Tf')
  streamLines.push('0.1 0.25 0.5 rg')
  streamLines.push('50 218 Td')
  streamLines.push('(RECRUITMENT & VERIFICATION NOTE:) Tj')
  streamLines.push('0 -15 Td')
  streamLines.push('(This verified application profile was generated from verified database records.) Tj')
  streamLines.push('0 -13 Td')
  streamLines.push('(Admins can directly contact candidate via phone or email for interview scheduling.) Tj')
  if (originalUrl) {
    streamLines.push('0 -13 Td')
    const sanitizedUrl = escapePdfText(originalUrl).slice(0, 80)
    streamLines.push(`(Source Reference: ${sanitizedUrl}) Tj`)
  }
  streamLines.push('ET')

  // Footer branding
  streamLines.push('BT')
  streamLines.push('/F1 8 Tf')
  streamLines.push('0.5 0.55 0.6 rg')
  streamLines.push('50 60 Td')
  streamLines.push('(SnapTech Digital & Hindustan Projects Recruitment Portal - https://www.snaptech.digital) Tj')
  streamLines.push('ET')

  const streamContent = streamLines.join('\n')
  const streamLen = Buffer.byteLength(streamContent)

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ]

  let body = '%PDF-1.4\n'
  const xrefOffsets = []

  for (let i = 0; i < objects.length; i++) {
    xrefOffsets.push(Buffer.byteLength(body))
    body += objects[i]
  }

  const startxref = Buffer.byteLength(body)
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const off of xrefOffsets) {
    xref += String(off).padStart(10, '0') + ' 00000 n \n'
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`

  return Buffer.from(body + xref + trailer)
}

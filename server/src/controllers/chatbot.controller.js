import prisma from '../config/db.js'

/**
 * Normalizes text: lowercase, remove punctuation
 */
function normalize(text) {
  return (text || '').toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '').trim()
}

/**
 * POST /api/chatbot/ask
 * 1. First tries to match against active Faq records in DB (admin-managed)
 * 2. Falls back to hardcoded keyword rules for pricing/hours/services/contact
 * 3. If still no match, returns a helpful fallback with contact link
 */
export const askQuestion = async (req, res, next) => {
  try {
    const { question } = req.body

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Question string is required' })
    }

    const trimmed = question.trim()
    const clean = normalize(trimmed)

    let answer = null
    let isAnswered = false

    // ── STEP 1: Fetch dynamic site settings (phone, email, sales, support, careers, privacy) ─
    let phoneVal = '+91 8209604849'
    let emailVal = 'info@snaptech.digital'
    let salesEmailVal = 'sales@snaptech.digital'
    let supportEmailVal = 'support@snaptech.digital'
    let careersEmailVal = 'careers@snaptech.digital'
    let privacyEmailVal = 'privacy@snaptech.digital'

    try {
      const rows = await prisma.siteSetting.findMany()
      const settings = {}
      for (const r of rows) {
        settings[r.key] = r.value
      }
      if (settings.phone) phoneVal = settings.phone
      if (settings.email_routing_general || settings.email) emailVal = settings.email_routing_general || settings.email
      if (settings.sales_email || settings.email_routing_sales) salesEmailVal = settings.sales_email || settings.email_routing_sales
      if (settings.support_email || settings.email_routing_support) supportEmailVal = settings.support_email || settings.email_routing_support
      if (settings.careers_email || settings.email_routing_careers) careersEmailVal = settings.careers_email || settings.email_routing_careers
      if (settings.privacy_email || settings.email_routing_privacy) privacyEmailVal = settings.privacy_email || settings.email_routing_privacy
    } catch {
      // Graceful fallback if DB is sleeping
    }

    // ── STEP 2: Match against DB FAQ table (graceful fallback if DB is sleeping) ─
    try {
      const faqs = await prisma.faq.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      })

      const STOPWORDS = new Set([
        'what', 'your', 'does', 'with', 'have', 'from', 'about', 'this', 'that', 
        'there', 'their', 'when', 'where', 'which', 'who', 'they', 'them', 'then',
        'some', 'many', 'more', 'most', 'very', 'here', 'will', 'would', 'could', 
        'should', 'been', 'were', 'have', 'your', 'ours', 'mine', 'does', 'your',
        'about', 'from', 'with', 'how', 'are', 'you'
      ])

      for (const faq of faqs) {
        const normalizedFaqQ = normalize(faq.question)
        
        // Exact match check first
        if (clean === normalizedFaqQ || clean.includes(normalizedFaqQ)) {
          answer = faq.answer
          isAnswered = true
          break
        }

        const faqKeywords = normalizedFaqQ
          .split(/\s+/)
          .filter((w) => w.length > 3 && !STOPWORDS.has(w))

        if (faqKeywords.length === 0) continue

        const matchCount = faqKeywords.filter((kw) => clean.includes(kw)).length
        const matchRatio = matchCount / faqKeywords.length

        // Require at least one matched keyword and ratio >= 0.5
        if (matchCount > 0 && (matchRatio >= 0.5 || faqKeywords.some((kw) => kw.length > 5 && clean.includes(kw)))) {
          answer = faq.answer
          isAnswered = true
          break
        }
      }
    } catch {
      // DB might be sleeping — skip to keyword rules
    }

    // ── STEP 3: Fallback keyword rules ────────────────────────────
    if (!isAnswered) {
      // Dedicated Departmental Inquiries
      const salesKeywords = ['sales email', 'quotation email', 'quote email', 'sales inquiry', 'sales enquiry', 'commercial email', 'proposal email', 'sales contact', 'pricing email', 'sales query', 'quote inquiry']
      const supportKeywords = ['support email', 'helpdesk email', 'help desk', 'customer support', 'tech support', 'technical support', 'raise a ticket', 'ticket email', 'support contact', 'helpdesk', 'customer helpdesk', 'complaint']
      const careerEmailKeywords = ['career email', 'careers email', 'recruitment email', 'job email', 'hr email', 'send resume', 'send cv', 'apply email', 'hiring email', 'submit cv', 'submit resume']
      const privacyKeywords = ['privacy email', 'legal email', 'compliance email', 'data protection', 'dpdp', 'gdpr', 'privacy inquiry', 'legal inquiry', 'data policy email', 'privacy contact']

      // General Categories
      const hours    = ['business hours', 'working hours', 'office hours', 'open time', 'closing time', 'timings', 'timing', 'timeing', 'timeings', 'schedule', 'working days', 'weekend', 'kitne baje', 'kab khulta', 'kab band']
      const pricing  = ['price', 'pricing', 'cost', 'charges', 'fees', 'rate', 'budget', 'package', 'kitna', 'how much', 'quote', 'estimate', 'charge']
      const services = ['what services', 'service offer', 'our services', 'web development', 'app development', 'digital marketing', 'seo', 'software development', 'erp system', 'designing', 'kya karte', 'kya kaam', 'what do you do', 'do you offer']
      const contact  = ['contact', 'phone number', 'email', 'call you', 'whatsapp', 'reach you', 'address', 'location', 'office address', 'where are you', 'kahan', 'phone no', 'mobile number', 'contact us', 'get in touch']
      const portfolio = ['portfolio', 'projects', 'our work', 'sample', 'case study', 'case studies', 'previous work', 'examples of work']
      const careers  = ['jobs', 'career', 'hiring', 'vacancies', 'internships', 'openings', 'apply for', 'join the team', 'careers']

      if (salesKeywords.some((k) => clean.includes(k))) {
        answer = `💼 **Sales & Quotation Inquiries:**\n\nFor enterprise proposals, pricing quotes, and commercial discussions:\n\n• 📧 **Email:** ${salesEmailVal}\n• 📱 **WhatsApp / Call:** ${phoneVal}\n\nOur solutions architect will review your project and get back to you within 24 hours!`
        isAnswered = true
      } else if (supportKeywords.some((k) => clean.includes(k))) {
        answer = `🛠️ **Customer Support & Helpdesk:**\n\nFor technical assistance, bug reports, and maintenance tickets:\n\n• 📧 **Email:** ${supportEmailVal}\n• 📱 **WhatsApp Hotline:** ${phoneVal}\n\nOur engineering team provides prompt ticket resolution for active clients!`
        isAnswered = true
      } else if (careerEmailKeywords.some((k) => clean.includes(k))) {
        answer = `👥 **Careers & Recruitment:**\n\nLooking to join the SnapTech Digital engineering team?\n\n• 📧 **Send Resume / Portfolio:** ${careersEmailVal}\n• 🌐 Explore open positions on our **Careers** page\n\nOur HR & engineering recruitment team reviews every application!`
        isAnswered = true
      } else if (privacyKeywords.some((k) => clean.includes(k))) {
        answer = `🔒 **Privacy & Legal Inquiries:**\n\nFor data privacy compliance, DPDP Act 2023 / GDPR requests, or legal queries:\n\n• 📧 **Email:** ${privacyEmailVal}\n\nYou can also read our full **Privacy Policy** and **Terms of Service** in the website footer.`
        isAnswered = true
      } else if (hours.some((k) => clean.includes(k))) {
        answer = `⏰ **Business Hours:**\n\nMonday – Saturday: **10:00 AM to 7:00 PM IST**\n\nWe are closed on Sundays and national holidays. For urgent matters, drop us a WhatsApp at ${phoneVal}!`
        isAnswered = true
      } else if (pricing.some((k) => clean.includes(k))) {
        answer = `💰 **Pricing at SnapTech Digital** depends on the project scope:\n\n• Simple landing page: starting ₹15,000\n• Business website: ₹25,000–₹60,000\n• Custom web/mobile app, ERP, or SaaS: quoted individually\n\n📧 For formal proposals & quotation requests, email our sales team at **${salesEmailVal}** or submit the Contact Form!`
        isAnswered = true
      } else if (services.some((k) => clean.includes(k))) {
        answer = '🛠️ **Our Services include:**\n\n• Web Development (React, Node.js, PHP, WordPress)\n• Mobile App Development (Flutter, React Native)\n• Custom Software & ERP Systems\n• UI/UX Design & Branding\n• Digital Marketing & SEO\n• E-Commerce Solutions\n\nVisit our Services page for full details!'
        isAnswered = true
      } else if (contact.some((k) => clean.includes(k))) {
        answer = `📞 **SnapTech Digital Official Contact Channels:**\n\n• 💼 **Sales & Quotations:** ${salesEmailVal}\n• 🛠️ **Customer Support:** ${supportEmailVal}\n• 👥 **Careers & Recruitment:** ${careersEmailVal}\n• 🔒 **Privacy & Legal:** ${privacyEmailVal}\n• 📧 **General Inquiries:** ${emailVal}\n• 📱 **WhatsApp / Call:** ${phoneVal}\n• 📍 **Headquarters:** Bhilwara, Rajasthan 311001, India\n\nOr submit the **Contact Form** on our website — we respond within 24 hours!`
        isAnswered = true
      } else if (portfolio.some((k) => clean.includes(k))) {
        answer = '🎨 **Our Portfolio** showcases projects across web, mobile, ERP, and branding.\n\nVisit the **Portfolio** section on our website to see our latest client work with live demos!'
        isAnswered = true
      } else if (careers.some((k) => clean.includes(k))) {
        answer = `💼 **We're hiring!** SnapTech Digital regularly posts openings for developers, designers, and marketing roles.\n\n• 📧 Email your CV/Portfolio to: **${careersEmailVal}**\n• Check the **Careers** page on our website to apply directly!`
        isAnswered = true
      }
    }

    // ── STEP 4: Save to DB for admin review (non-blocking) ───────
    try {
      await prisma.chatbotInquiry.create({
        data: { question: trimmed, answer, isAnswered },
      })
    } catch {
      // DB sleeping — skip saving, still return answer to user
    }

    // ── STEP 5: Return response ────────────────────────────────────
    const fallback =
      `🤔 I couldn't find a direct answer to that. Please use the **Contact Form** or WhatsApp us at ${phoneVal} — our team will get back to you within 24 hours!`

    return res.json({
      status: 'ok',
      answered: isAnswered,
      answer: isAnswered ? answer : fallback,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Admin: List all chatbot inquiries (newest first)
 */
export const listInquiries = async (_req, res, next) => {
  try {
    const inquiries = await prisma.chatbotInquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.json({ status: 'ok', data: inquiries })
  } catch (err) {
    next(err)
  }
}

/**
 * Admin: Delete a single chatbot inquiry
 */
export const deleteInquiry = async (req, res, next) => {
  try {
    const { id } = req.params
    await prisma.chatbotInquiry.delete({ where: { id } })
    res.json({ status: 'ok', message: 'Inquiry deleted.' })
  } catch (err) {
    next(err)
  }
}

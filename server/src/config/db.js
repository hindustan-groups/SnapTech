import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

let dbUrl = process.env.DATABASE_URL
if (dbUrl && !dbUrl.includes('connection_limit')) {
  const separator = dbUrl.includes('?') ? '&' : '?'
  dbUrl = `${dbUrl}${separator}connection_limit=20&pool_timeout=10`
}

const realPrisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
})

// ── Pagination Helper ─────────────────────────────────────────
const applyPagination = (list, args) => {
  let res = [...list]
  if (args?.skip) res = res.slice(args.skip)
  if (args?.take) res = res.slice(0, args.take)
  return res
}

// ── High-Fidelity Mock Datasets ──────────────────────────────
let mockAdmin = {
  id: 'admin-mock-1',
  email: 'admin@hindustanprojects.com',
  // Dev-only mock hash — never used in production (real DB is used when DATABASE_URL points to Neon/Postgres)
  passwordHash:
    process.env.MOCK_ADMIN_HASH || '$2b$10$W4FZyhOY50gqDQJrvqERbeZPWyyr7dKdvRwzO2vwua7nPmuoqECKO',
  role: 'SUPER_ADMIN',
  loginAttempts: 0,
  lockoutUntil: null,
  refreshToken: null,
  twoFactorSecret: null,
  twoFactorEnabled: false,
}

let mockServices = [
  {
    id: '1',
    title: 'Web Development',
    slug: 'web-development',
    icon: 'Code2',
    order: 1,
    isActive: true,
    shortDescription:
      'Custom, responsive websites built with modern technologies like React, Node.js, and WordPress — optimised for speed, SEO, and conversions.',
    fullDescription:
      'We design and build bespoke web solutions that scale. Whether you need a simple corporate landing page, a content management system, or a bespoke web application, our developers write clean, robust code that delivers high performance.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Digital Marketing & SEO',
    slug: 'digital-marketing-seo',
    icon: 'Megaphone',
    order: 2,
    isActive: true,
    shortDescription:
      'Result-driven digital marketing campaigns spanning SEO, Google Ads, Meta Ads, and content marketing to drive high-intent leads.',
    fullDescription:
      'Get your business in front of the right audience. Our digital marketing strategies are built on data and focused on ROI. We run complete search engine optimization (SEO) campaigns to rank your business organically.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'IT Consulting & Strategy',
    slug: 'it-consulting-strategy',
    icon: 'Lightbulb',
    order: 3,
    isActive: true,
    shortDescription:
      'Strategic IT advisory to align your technology roadmap with business growth. We help you choose the right systems and architecture.',
    fullDescription:
      'Make informed technology decisions. Our expert consultants analyze your current business workflows, systems, and requirements to design a scalable IT strategy.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'E-Commerce Solutions',
    slug: 'ecommerce-solutions',
    icon: 'Monitor',
    order: 4,
    isActive: true,
    shortDescription:
      'End-to-end e-commerce store setup, checkout optimisation, inventory management systems, and secure payment gateway integrations.',
    fullDescription:
      'Turn website visitors into paying customers. We build feature-rich e-commerce stores with smooth checkout experiences, secure payment gateways, and automated inventory sync.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Cloud Solutions & DevOps',
    slug: 'cloud-solutions-devops',
    icon: 'Settings',
    order: 5,
    isActive: true,
    shortDescription:
      'Secure cloud hosting setup, AWS/Google Cloud management, server scaling, and continuous deployment workflows for zero downtime.',
    fullDescription:
      'Build a stable, secure, and scalable cloud infrastructure. We manage cloud deployments on Amazon Web Services (AWS), Google Cloud Platform (GCP), and DigitalOcean.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    title: 'Branding & UI/UX Design',
    slug: 'branding-ui-ux-design',
    icon: 'Layers',
    order: 6,
    isActive: true,
    shortDescription:
      'Premium user interface and user experience designs coupled with complete corporate brand identity systems, logos, and guidelines.',
    fullDescription:
      'Create a lasting impression. Our design team focuses on crafting modern, intuitive user interfaces (UI) and frictionless user experiences (UX) that make your product a joy to use.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    title: 'Mobile App Development',
    slug: 'mobile-app-development',
    icon: 'Smartphone',
    order: 7,
    isActive: true,
    shortDescription:
      'Native and cross-platform mobile apps for iOS and Android built with React Native and Flutter. Secure, high-performing, and published on App Stores.',
    fullDescription:
      'Expand your reach to mobile users worldwide. We design and build secure, fast, and feature-rich mobile applications for iOS and Android platforms.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

let mockProjects = [
  {
    id: 'p-1',
    title: 'E-Commerce Platform',
    slug: 'e-commerce-platform',
    clientName: 'Retail Client, Bhilwara',
    category: 'Web',
    isFeatured: true,
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'AWS'],
    description:
      'A full-stack enterprise e-commerce platform with automated inventory management, sub-second checkout, and unified merchant analytics dashboard.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80&auto=format&fit=crop',
    ],
    liveUrl: 'https://demo.hindustanprojects.com/ecommerce',
    result: '3.4× Conversion Growth in 60 Days',
    duration: '8 Weeks Delivery',
    challenge: 'The legacy portal suffered from 4.8s page loads, peak-season checkout crashes, and disconnected inventory ledgers across regional warehouses.',
    solution: 'Engineered an ultra-fast headless React front-end, optimized PostgreSQL connection pooling with Redis caching, and integrated automated webhook sync for payment gateways.',
    features: [
      'Sub-second checkout flow with Razorpay & Cashfree auto-failover',
      'Multi-warehouse automated inventory reconciliation',
      'Real-time analytics dashboard with revenue telemetry',
      'SEO-optimized product catalog with instant search',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p-2',
    title: 'Digital Marketing Campaign',
    slug: 'digital-marketing-campaign',
    clientName: 'Fashion Brand, Jaipur',
    category: 'Marketing',
    isFeatured: true,
    technologies: ['Google Ads', 'Meta Ads', 'SEO', 'Data Studio', 'HubSpot'],
    description:
      'Multi-channel performance marketing system combining high-intent search visibility, hyper-targeted ad scaling, and conversion rate optimization.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop',
    ],
    liveUrl: 'https://demo.hindustanprojects.com/campaign',
    result: '3.8× Verified ROAS in Quarter 1',
    duration: 'Continuous SLA',
    challenge: 'High customer acquisition cost (CAC) on generic PPC campaigns and low organic visibility against national retail aggregators.',
    solution: 'Restructured conversion tracking with Server-Side Meta Conversions API (CAPI), built dedicated landing pages with 22% conversion rates, and optimized high-intent long-tail keywords.',
    features: [
      'Meta Conversions API server-side event tracking',
      'High-velocity A/B testing on landing page funnels',
      'Automated remarketing sequences via WhatsApp API',
      'Transparent weekly executive ROAS dashboard',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p-3',
    title: 'Corporate Brand Identity',
    slug: 'corporate-brand-identity',
    clientName: 'Manufacturing Co., Bhilwara',
    category: 'Branding',
    isFeatured: true,
    technologies: ['Figma Tokens', 'Vector Asset System', 'Design Guidelines', 'Adobe CC'],
    description:
      'Unified enterprise visual identity system including interactive component libraries, corporate stationery, product packaging, and digital presence style guides.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&q=80&auto=format&fit=crop',
    ],
    liveUrl: null,
    result: 'Brand Valuation Perceived 2× Higher',
    duration: '4 Weeks Sprint',
    challenge: 'A 25-year-old industrial textile manufacturer was perceived as outdated by modern export buyers and international corporate clients.',
    solution: 'Designed an authoritative, modern industrial brand identity system balancing regional textile heritage with sleek global engineering aesthetics.',
    features: [
      'Complete typography, palette, and SVG vector logo system',
      'Figma design tokens library ready for digital development',
      'Corporate export presentation decks and letterheads',
      'Bespoke product packaging & certification seal designs',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p-4',
    title: 'ERP System',
    slug: 'erp-system',
    clientName: 'Textile Company, Bhilwara',
    category: 'Software',
    isFeatured: false,
    technologies: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'Redis'],
    description:
      'Custom ERP solution managing weaving loom cycles, raw material inventory traceability, supplier ledger automation, and GST e-invoicing in one database.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80&auto=format&fit=crop',
    ],
    liveUrl: null,
    result: '42% Reduction in Factory Downtime',
    duration: '12 Weeks Milestone',
    challenge: 'Factory management relied on manual paper logs and fragmented spreadsheets, resulting in loom idle time, billing discrepancies, and delayed dispatch schedules.',
    solution: 'Deployed a custom intranet web ERP with role-based access control, barcode-driven yarn inventory, and direct machine operator tablets.',
    features: [
      'Live weaving loom telemetry & shift production logs',
      'Barcode-driven yarn and fabric roll inventory tracking',
      'Automated GST e-invoicing and tally accounting integration',
      'Role-based permissions for plant managers, operators, and accountants',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

let mockJobPostings = [
  {
    id: 'jp-1',
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    department: 'Engineering',
    location: 'Bhilwara (On-site)',
    jobType: 'FULL_TIME',
    experienceRequired: '2-4 years',
    description:
      'We are looking for a skilled Full Stack Developer to join our team in Bhilwara. You will be responsible for building responsive client interfaces and robust backend services.',
    responsibilities: [
      'Build reusable components and front-end libraries for future use',
      'Optimize applications for maximum speed and scalability',
      'Collaborate with backend developers and web designers to improve usability',
    ],
    requirements: [
      'Proven work experience as a Full Stack Developer or similar role',
      'Hands-on experience with React, Node.js, Express, and PostgreSQL',
      'Familiarity with modern CSS frameworks (TailwindCSS) and version control tools (Git)',
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'jp-2',
    title: 'Social Media Associate',
    slug: 'social-media-associate',
    department: 'Marketing',
    location: 'Remote',
    jobType: 'INTERNSHIP',
    experienceRequired: 'Freshers welcome',
    description:
      'We are hiring a creative Social Media Associate intern to design engaging campaigns and manage our clients social media presence.',
    responsibilities: [
      'Create graphic and video content for social channels using Canva/Figma',
      'Draft copy and schedule posts across Facebook, Instagram, and LinkedIn',
      'Monitor brand engagement and compile monthly analytics reports',
    ],
    requirements: [
      'Strong visual storytelling skills and design aesthetic',
      'Basic understanding of SEO and social media algorithms',
      'Excellent verbal and written communication skills in Hindi & English',
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

let mockJobApplications = [
  {
    id: 'ja-1',
    jobPostingId: 'jp-1',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    resumeUrl: 'https://res.cloudinary.com/demo/image/upload/v1580000000/sample_resume.pdf',
    coverLetter:
      'I am highly passionate about full-stack development and would love to work with Hindustan Projects.',
    status: 'NEW',
    createdAt: new Date(),
  },
]

let mockTeam = [
  {
    id: 't-1',
    name: 'Mohmmad Dilshan',
    role: 'Founder & Lead Architect',
    bio: 'Technical pioneer with 5+ years of experience building products.',
    linkedinUrl: 'https://linkedin.com',
    order: 1,
  },
  {
    id: 't-2',
    name: 'Priya Sharma',
    role: 'Head of Marketing',
    bio: 'Expert in PPC, SEO, and strategic brand consulting.',
    linkedinUrl: 'https://linkedin.com',
    order: 2,
  },
]

let mockTestimonials = [
  {
    id: '1',
    name: 'Ramesh Kumawat',
    company: 'Kumawat Textiles, Bhilwara',
    content:
      'Hindustan Projects delivered our web platform on time. Excellent development quality and support.',
    rating: 5,
    avatarUrl: null,
  },
  {
    id: '2',
    name: 'Anjali Vyas',
    company: 'Vyas Boutique, Jaipur',
    content: 'Our digital marketing campaigns are showing great ROI. Very professional team.',
    rating: 5,
    avatarUrl: null,
  },
]

let mockFaqs = [
  {
    id: '1',
    question: 'What services do you offer?',
    answer: 'We offer web development, digital marketing, SEO, IT strategy, and custom software.',
    order: 1,
    isActive: true,
  },
  {
    id: '2',
    question: 'Where are you located?',
    answer: 'Our head office is in Bhilwara, Rajasthan, but we serve clients all across India.',
    order: 2,
    isActive: true,
  },
]

let mockMilestones = [
  {
    id: 'ms-1',
    year: '2019',
    title: 'Founded',
    desc: 'Hindustan Projects was born in Bhilwara with a mission to bring world-class IT to local businesses.',
    order: 1,
  },
  {
    id: 'ms-2',
    year: '2020',
    title: 'First 10 Clients',
    desc: 'Delivered web development and digital marketing for 10 businesses across Rajasthan.',
    order: 2,
  },
]

let mockPartners = [
  {
    id: '1',
    name: 'Partner One',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
    order: 1,
    isActive: true,
  },
]

let mockSettings = [
  { key: 'phone', value: '+91 75970 00601' },
  { key: 'whatsapp', value: '+91 75970 00601' },
  { key: 'whatsappMessage', value: 'Hi SnapTech Team! I visited your website and want to discuss a project.' },
  { key: 'email', value: 'info@snaptech.digital' },
  { key: 'address', value: 'Bhilwara, Rajasthan 311001, India' },
  { key: 'linkedin', value: '#' },
  { key: 'instagram', value: '#' },
  { key: 'facebook', value: '#' },
  { key: 'tagline', value: 'Building Digital Solutions That Drive Business Growth' },
  {
    key: 'googleMapUrl',
    value:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57692.35!2d74.6!3d25.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3968a5!2sBhilwara%2C+Rajasthan!5e0!3m2!1sen!2sin!4v1',
  },
  { key: 'stat_projects', value: '50' },
  { key: 'stat_clients', value: '40' },
  { key: 'stat_experience', value: '5' },
  { key: 'stat_cities', value: '3' },
]

let mockLegalPages = [
  {
    id: 'lp-privacy',
    pageType: 'PRIVACY_POLICY',
    title: 'Privacy Policy',
    content: `<h2>1. Information We Collect</h2><p>We collect information you provide directly to us, such as when you submit a contact form, request a quote, or apply for a job. This includes your name, email, phone number, and any other details you share.</p><h2>2. How We Use Your Information</h2><p>We use your information to respond to inquiries, deliver our IT services, send updates, and improve website performance.</p><h2>3. Data Protection</h2><p>We implement secure industry-standard measures to protect your personal data from unauthorized access or disclosure.</p>`,
    lastUpdated: new Date(),
    updatedBy: 'admin-mock-1',
  },
  {
    id: 'lp-terms',
    pageType: 'TERMS_OF_SERVICE',
    title: 'Terms of Service',
    content: `<h2>1. Services Rendered</h2><p>Hindustan Projects provides custom software, web development, digital marketing, and IT consulting services. All projects are subject to agreed milestones and deliverables.</p><h2>2. Payments & Fees</h2><p>Invoices are generated based on the project scope and payment schedule. Payments must be made within the specified timeframes to avoid service suspension.</p><h2>3. Intellectual Property</h2><p>Upon final payment, the ownership of the custom code and deliverables is transferred to the client, while we retain rights to reusable modules.</p>`,
    lastUpdated: new Date(),
    updatedBy: 'admin-mock-1',
  },
  {
    id: 'lp-refund',
    pageType: 'REFUND_POLICY',
    title: 'Refund Policy',
    content: `<h2>1. Service-Based Projects</h2><p>As our projects involve custom design and engineering resources, payments made for milestone deliverables are generally non-refundable once work has commenced.</p><h2>2. Cancellation Policy</h2><p>Clients may cancel a project at any stage. Any work completed up to the date of cancellation will be invoiced and is payable by the client.</p><h2>3. Issues and Support</h2><p>If you encounter any bugs or quality issues, we provide a 30-day post-launch support period to resolve them free of charge.</p>`,
    lastUpdated: new Date(),
    updatedBy: 'admin-mock-1',
  },
]

let mockLeads = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    message: 'I need a website',
    status: 'NEW',
    createdAt: new Date(),
  },
]

let mockClientProjects = [
  {
    id: 'cp-1',
    clientName: 'Ramesh Textiles, Bhilwara',
    projectTitle: 'E-Commerce Website',
    description: 'Bespoke online store built with React and Node.js for client apparel business.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    progress: 45,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    assignedTo: 'Mohmmad Dilshan',
    budget: '₹50,000',
    tags: ['React', 'Tailwind', 'Node.js'],
    notes: 'Requires payment gateway integration and SMS alerts.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

let mockWorkTasks = [
  {
    id: 'wt-1',
    title: 'Setup Database Schema',
    description: 'Add new tables for ClientProject, WorkTask, and QuickNote',
    status: 'DONE',
    priority: 'HIGH',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    assignedTo: 'Mohmmad Dilshan',
    clientProjectId: 'cp-1',
    tags: ['Database', 'Prisma'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'wt-2',
    title: 'Build Backend Controllers & Routes',
    description: 'Implement API routes for CRUD operations',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    assignedTo: 'Mohmmad Dilshan',
    clientProjectId: 'cp-1',
    tags: ['Backend', 'Express'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

let mockQuickNotes = [
  {
    id: 'qn-1',
    title: 'Server Settings Info',
    content: 'Neon database uses port 5432 and SSL mode require.',
    color: 'yellow',
    isPinned: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

let mockActivityLogs = [
  {
    id: 'act-1',
    adminId: 'admin-mock-1',
    adminEmail: 'admin@hindustanprojects.com',
    action: 'CREATE',
    entity: 'ClientProject',
    details: "Created project 'E-Commerce Website' for client 'Ramesh Textiles'",
    createdAt: new Date(),
  },
]

// ── Mock Database Client Wrapper ─────────────────────────────
const mockPrisma = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),

  service: {
    findMany: async (args) => mockServices,
    findUnique: async (args) => mockServices.find((s) => s.slug === args.where.slug) || null,
    count: async (args) => mockServices.length,
    create: async (args) => {
      const item = {
        id: `${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockServices.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockServices.findIndex((s) => s.id === args.where.id)
      if (idx !== -1) {
        mockServices[idx] = { ...mockServices[idx], ...args.data, updatedAt: new Date() }
        return mockServices[idx]
      }
      throw new Error('Service not found')
    },
    delete: async (args) => {
      const idx = mockServices.findIndex((s) => s.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockServices[idx]
        mockServices = mockServices.filter((s) => s.id !== args.where.id)
        return deleted
      }
      throw new Error('Service not found')
    },
  },

  clientProject: {
    findMany: async (args) => {
      let list = mockClientProjects
      if (args?.where?.status) {
        list = list.filter((p) => p.status === args.where.status)
      }
      if (args?.include?.tasks) {
        list = list.map((p) => ({
          ...p,
          tasks: mockWorkTasks.filter((t) => t.clientProjectId === p.id),
        }))
      }
      return applyPagination(list, args)
    },
    findUnique: async (args) => {
      const p = mockClientProjects.find((p) => p.id === args.where.id)
      if (!p) return null
      if (args?.include?.tasks) {
        return {
          ...p,
          tasks: mockWorkTasks.filter((t) => t.clientProjectId === p.id),
        }
      }
      return p
    },
    count: async (args) => mockClientProjects.length,
    create: async (args) => {
      const item = {
        id: `cp-${Date.now()}`,
        status: 'PLANNING',
        priority: 'MEDIUM',
        progress: 0,
        tags: [],
        ...args.data,
        startDate: args.data.startDate ? new Date(args.data.startDate) : new Date(),
        deadline: args.data.deadline ? new Date(args.data.deadline) : new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockClientProjects.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockClientProjects.findIndex((p) => p.id === args.where.id)
      if (idx !== -1) {
        const updated = {
          ...mockClientProjects[idx],
          ...args.data,
          startDate: args.data.startDate
            ? new Date(args.data.startDate)
            : mockClientProjects[idx].startDate,
          deadline: args.data.deadline
            ? new Date(args.data.deadline)
            : mockClientProjects[idx].deadline,
          updatedAt: new Date(),
        }
        mockClientProjects[idx] = updated
        return updated
      }
      throw new Error('ClientProject not found')
    },
    delete: async (args) => {
      const idx = mockClientProjects.findIndex((p) => p.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockClientProjects[idx]
        mockClientProjects = mockClientProjects.filter((p) => p.id !== args.where.id)
        mockWorkTasks = mockWorkTasks.filter((t) => t.clientProjectId !== args.where.id)
        return deleted
      }
      throw new Error('ClientProject not found')
    },
  },

  workTask: {
    findMany: async (args) => {
      let list = mockWorkTasks
      if (args?.where?.clientProjectId) {
        list = list.filter((t) => t.clientProjectId === args.where.clientProjectId)
      }
      if (args?.where?.status) {
        list = list.filter((t) => t.status === args.where.status)
      }
      return applyPagination(list, args)
    },
    findUnique: async (args) => mockWorkTasks.find((t) => t.id === args.where.id) || null,
    count: async (args) => mockWorkTasks.length,
    create: async (args) => {
      const item = {
        id: `wt-${Date.now()}`,
        status: 'TODO',
        priority: 'MEDIUM',
        tags: [],
        ...args.data,
        dueDate: args.data.dueDate ? new Date(args.data.dueDate) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockWorkTasks.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockWorkTasks.findIndex((t) => t.id === args.where.id)
      if (idx !== -1) {
        const updated = {
          ...mockWorkTasks[idx],
          ...args.data,
          dueDate: args.data.dueDate ? new Date(args.data.dueDate) : mockWorkTasks[idx].dueDate,
          updatedAt: new Date(),
        }
        mockWorkTasks[idx] = updated
        return updated
      }
      throw new Error('WorkTask not found')
    },
    delete: async (args) => {
      const idx = mockWorkTasks.findIndex((t) => t.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockWorkTasks[idx]
        mockWorkTasks = mockWorkTasks.filter((t) => t.id !== args.where.id)
        return deleted
      }
      throw new Error('WorkTask not found')
    },
  },

  quickNote: {
    findMany: async (args) => {
      let list = [...mockQuickNotes]
      list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      return applyPagination(list, args)
    },
    findUnique: async (args) => mockQuickNotes.find((n) => n.id === args.where.id) || null,
    count: async (args) => mockQuickNotes.length,
    create: async (args) => {
      const item = {
        id: `qn-${Date.now()}`,
        color: 'yellow',
        isPinned: false,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockQuickNotes.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockQuickNotes.findIndex((n) => n.id === args.where.id)
      if (idx !== -1) {
        const updated = {
          ...mockQuickNotes[idx],
          ...args.data,
          updatedAt: new Date(),
        }
        mockQuickNotes[idx] = updated
        return updated
      }
      throw new Error('QuickNote not found')
    },
    delete: async (args) => {
      const idx = mockQuickNotes.findIndex((n) => n.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockQuickNotes[idx]
        mockQuickNotes = mockQuickNotes.filter((n) => n.id !== args.where.id)
        return deleted
      }
      throw new Error('QuickNote not found')
    },
  },

  activityLog: {
    findMany: async (args) => {
      let list = [...mockActivityLogs]
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return applyPagination(list, args)
    },
    create: async (args) => {
      const item = {
        id: `act-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
      }
      mockActivityLogs.push(item)
      return item
    },
    count: async (args) => mockActivityLogs.length,
  },

  project: {
    findMany: async (args) => {
      let list = mockProjects
      if (args?.where?.category) list = list.filter((p) => p.category === args.where.category)
      if (args?.where?.isFeatured) list = list.filter((p) => p.isFeatured === true)
      return applyPagination(list, args)
    },
    findUnique: async (args) =>
      mockProjects.find((p) => p.slug === args.where.slug || p.id === args.where.id) || null,
    count: async (args) => mockProjects.length,
    create: async (args) => {
      const item = {
        id: `project-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockProjects.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockProjects.findIndex((p) => p.id === args.where.id)
      if (idx !== -1) {
        mockProjects[idx] = { ...mockProjects[idx], ...args.data, updatedAt: new Date() }
        return mockProjects[idx]
      }
      throw new Error('Project not found')
    },
    delete: async (args) => {
      const idx = mockProjects.findIndex((p) => p.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockProjects[idx]
        mockProjects = mockProjects.filter((p) => p.id !== args.where.id)
        return deleted
      }
      throw new Error('Project not found')
    },
  },

  teamMember: {
    findMany: async (args) => applyPagination(mockTeam, args),
    findUnique: async (args) => mockTeam.find((t) => t.id === args.where.id) || null,
    count: async (args) => mockTeam.length,
    create: async (args) => {
      const item = { id: `team-${Date.now()}`, ...args.data }
      mockTeam.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockTeam.findIndex((t) => t.id === args.where.id)
      if (idx !== -1) {
        mockTeam[idx] = { ...mockTeam[idx], ...args.data }
        return mockTeam[idx]
      }
      throw new Error('Team member not found')
    },
    delete: async (args) => {
      const idx = mockTeam.findIndex((t) => t.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockTeam[idx]
        mockTeam = mockTeam.filter((t) => t.id !== args.where.id)
        return deleted
      }
      throw new Error('Team member not found')
    },
  },

  contactLead: {
    findMany: async (args) => {
      let list = mockLeads
      if (args?.where?.status) list = list.filter((l) => l.status === args.where.status)
      return applyPagination(list, args)
    },
    count: async (args) => {
      let list = mockLeads
      if (args?.where?.status) list = list.filter((l) => l.status === args.where.status)
      return list.length
    },
    create: async (args) => {
      const item = { id: `lead-${Date.now()}`, ...args.data, createdAt: new Date() }
      mockLeads.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockLeads.findIndex((l) => l.id === args.where.id)
      if (idx !== -1) {
        mockLeads[idx] = { ...mockLeads[idx], ...args.data }
        return mockLeads[idx]
      }
      throw new Error('Lead not found')
    },
    delete: async (args) => {
      const idx = mockLeads.findIndex((l) => l.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockLeads[idx]
        mockLeads = mockLeads.filter((l) => l.id !== args.where.id)
        return deleted
      }
      throw new Error('Lead not found')
    },
  },

  testimonial: {
    findMany: async (args) => applyPagination(mockTestimonials, args),
    findUnique: async (args) => mockTestimonials.find((t) => t.id === args.where.id) || null,
    count: async (args) => mockTestimonials.length,
    create: async (args) => {
      const item = { id: `test-${Date.now()}`, ...args.data }
      mockTestimonials.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockTestimonials.findIndex((t) => t.id === args.where.id)
      if (idx !== -1) {
        mockTestimonials[idx] = { ...mockTestimonials[idx], ...args.data }
        return mockTestimonials[idx]
      }
      throw new Error('Testimonial not found')
    },
    delete: async (args) => {
      const idx = mockTestimonials.findIndex((t) => t.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockTestimonials[idx]
        mockTestimonials = mockTestimonials.filter((t) => t.id !== args.where.id)
        return deleted
      }
      throw new Error('Testimonial not found')
    },
  },

  faq: {
    findMany: async (args) => {
      let list = mockFaqs
      if (args?.where?.isActive !== undefined)
        list = list.filter((f) => f.isActive === args.where.isActive)
      return applyPagination(list, args)
    },
    findUnique: async (args) => mockFaqs.find((f) => f.id === args.where.id) || null,
    count: async (args) => mockFaqs.length,
    create: async (args) => {
      const item = { id: `faq-${Date.now()}`, ...args.data }
      mockFaqs.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockFaqs.findIndex((f) => f.id === args.where.id)
      if (idx !== -1) {
        mockFaqs[idx] = { ...mockFaqs[idx], ...args.data }
        return mockFaqs[idx]
      }
      throw new Error('FAQ not found')
    },
    delete: async (args) => {
      const idx = mockFaqs.findIndex((f) => f.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockFaqs[idx]
        mockFaqs = mockFaqs.filter((f) => f.id !== args.where.id)
        return deleted
      }
      throw new Error('FAQ not found')
    },
  },

  milestone: {
    findMany: async (args) => applyPagination(mockMilestones, args),
    findUnique: async (args) => mockMilestones.find((m) => m.id === args.where.id) || null,
    count: async (args) => mockMilestones.length,
    create: async (args) => {
      const item = { id: `ms-${Date.now()}`, ...args.data }
      mockMilestones.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockMilestones.findIndex((m) => m.id === args.where.id)
      if (idx !== -1) {
        mockMilestones[idx] = { ...mockMilestones[idx], ...args.data }
        return mockMilestones[idx]
      }
      throw new Error('Milestone not found')
    },
    delete: async (args) => {
      const idx = mockMilestones.findIndex((m) => m.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockMilestones[idx]
        mockMilestones = mockMilestones.filter((m) => m.id !== args.where.id)
        return deleted
      }
      throw new Error('Milestone not found')
    },
  },

  partner: {
    findMany: async (args) => {
      let list = mockPartners
      if (args?.where?.isActive !== undefined)
        list = list.filter((p) => p.isActive === args.where.isActive)
      return applyPagination(list, args)
    },
    findUnique: async (args) => mockPartners.find((p) => p.id === args.where.id) || null,
    count: async (args) => mockPartners.length,
    create: async (args) => {
      const item = { id: `partner-${Date.now()}`, ...args.data }
      mockPartners.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockPartners.findIndex((p) => p.id === args.where.id)
      if (idx !== -1) {
        mockPartners[idx] = { ...mockPartners[idx], ...args.data }
        return mockPartners[idx]
      }
      throw new Error('Partner not found')
    },
    delete: async (args) => {
      const idx = mockPartners.findIndex((p) => p.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockPartners[idx]
        mockPartners = mockPartners.filter((p) => p.id !== args.where.id)
        return deleted
      }
      throw new Error('Partner not found')
    },
  },

  jobPosting: {
    findMany: async (args) => {
      let list = [...mockJobPostings]
      if (args?.where?.isActive !== undefined)
        list = list.filter((j) => j.isActive === args.where.isActive)
      return applyPagination(list, args)
    },
    findUnique: async (args) => {
      if (args.where.id) return mockJobPostings.find((j) => j.id === args.where.id) || null
      if (args.where.slug) return mockJobPostings.find((j) => j.slug === args.where.slug) || null
      return null
    },
    count: async (args) => mockJobPostings.length,
    create: async (args) => {
      const item = {
        id: `jp-${Date.now()}`,
        responsibilities: [],
        requirements: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data,
      }
      mockJobPostings.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockJobPostings.findIndex((j) => j.id === args.where.id)
      if (idx !== -1) {
        mockJobPostings[idx] = { ...mockJobPostings[idx], ...args.data, updatedAt: new Date() }
        return mockJobPostings[idx]
      }
      throw new Error('Job posting not found')
    },
    delete: async (args) => {
      const idx = mockJobPostings.findIndex((j) => j.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockJobPostings[idx]
        mockJobPostings = mockJobPostings.filter((j) => j.id !== args.where.id)
        return deleted
      }
      throw new Error('Job posting not found')
    },
  },

  jobApplication: {
    findMany: async (args) => {
      let list = [...mockJobApplications]
      if (args?.where?.jobPostingId)
        list = list.filter((a) => a.jobPostingId === args.where.jobPostingId)
      if (args?.where?.status) list = list.filter((a) => a.status === args.where.status)
      if (args?.include?.jobPosting) {
        list = list.map((app) => ({
          ...app,
          jobPosting: mockJobPostings.find((jp) => jp.id === app.jobPostingId) || null,
        }))
      }
      return applyPagination(list, args)
    },
    findUnique: async (args) => mockJobApplications.find((a) => a.id === args.where.id) || null,
    count: async (args) => mockJobApplications.length,
    create: async (args) => {
      const item = { id: `ja-${Date.now()}`, status: 'NEW', createdAt: new Date(), ...args.data }
      mockJobApplications.push(item)
      return item
    },
    update: async (args) => {
      const idx = mockJobApplications.findIndex((a) => a.id === args.where.id)
      if (idx !== -1) {
        mockJobApplications[idx] = { ...mockJobApplications[idx], ...args.data }
        return mockJobApplications[idx]
      }
      throw new Error('Job application not found')
    },
    delete: async (args) => {
      const idx = mockJobApplications.findIndex((a) => a.id === args.where.id)
      if (idx !== -1) {
        const deleted = mockJobApplications[idx]
        mockJobApplications = mockJobApplications.filter((a) => a.id !== args.where.id)
        return deleted
      }
      throw new Error('Job application not found')
    },
  },

  siteSetting: {
    findMany: async (args) => {
      // Support where.key.in filter used by integration controller
      if (args?.where?.key?.in) {
        return mockSettings.filter((s) => args.where.key.in.includes(s.key))
      }
      return mockSettings
    },
    findUnique: async (args) => mockSettings.find((s) => s.key === args.where.key) || null,
    deleteMany: async (args) => {
      if (args?.where?.key) {
        const before = mockSettings.length
        mockSettings = mockSettings.filter((s) => s.key !== args.where.key)
        return { count: before - mockSettings.length }
      }
      return { count: 0 }
    },
    upsert: async (args) => {
      const key = args.where.key
      const value = args.update?.value ?? args.create.value
      const idx = mockSettings.findIndex((s) => s.key === key)
      if (idx !== -1) {
        mockSettings[idx].value = value
        return mockSettings[idx]
      } else {
        const newItem = { key, value }
        mockSettings.push(newItem)
        return newItem
      }
    },
  },

  admin: {
    findUnique: async (args) => {
      if (args.where.email === mockAdmin.email || args.where.id === mockAdmin.id) {
        return mockAdmin
      }
      return null
    },
    update: async (args) => {
      if (args.where.id === mockAdmin.id || args.where.email === mockAdmin.email) {
        mockAdmin = { ...mockAdmin, ...args.data }
        return mockAdmin
      }
      throw new Error('Admin not found')
    },
  },

  legalPage: {
    findMany: async (args) => mockLegalPages,
    findUnique: async (args) =>
      mockLegalPages.find((p) => p.pageType === args.where.pageType) || null,
    create: async (args) => {
      const item = { id: `lp-${Date.now()}`, lastUpdated: new Date(), ...args.data }
      mockLegalPages.push(item)
      return item
    },
    update: async (args) => {
      const key = args.where.pageType ? 'pageType' : 'id'
      const val = args.where.pageType || args.where.id
      const idx = mockLegalPages.findIndex((p) => p[key] === val)
      if (idx !== -1) {
        mockLegalPages[idx] = { ...mockLegalPages[idx], ...args.data, lastUpdated: new Date() }
        return mockLegalPages[idx]
      }
      throw new Error('Legal page not found')
    },
    upsert: async (args) => {
      const pageType = args.where.pageType
      const idx = mockLegalPages.findIndex((p) => p.pageType === pageType)
      if (idx !== -1) {
        mockLegalPages[idx] = { ...mockLegalPages[idx], ...args.update, lastUpdated: new Date() }
        return mockLegalPages[idx]
      } else {
        const item = { id: `lp-${Date.now()}`, lastUpdated: new Date(), ...args.create }
        mockLegalPages.push(item)
        return item
      }
    },
  },
}

const MOCK_DB_PATH = path.join(process.cwd(), 'mock_db.json')

// Add mock datasets for social drafts, chatbot inquiries, error logs, and page visits
let mockSocialPostDrafts = []
let mockChatbotInquiries = []
let mockErrorLogs = []
let mockPageVisits = []

// Helper to save all mock data arrays to disk
function saveMockDb() {
  try {
    const data = {
      mockServices,
      mockProjects,
      mockTeam,
      mockTestimonials,
      mockFaqs,
      mockMilestones,
      mockPartners,
      mockSettings,
      mockLeads,
      mockJobPostings,
      mockJobApplications,
      mockLegalPages,
      mockAdmin,
      mockClientProjects,
      mockWorkTasks,
      mockQuickNotes,
      mockActivityLogs,
      mockSocialPostDrafts,
      mockChatbotInquiries,
      mockErrorLogs,
      mockPageVisits,
    }
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.error('[MockDB] Failed to save database to file:', err.message)
  }
}

// Helper to load mock data arrays from disk
function loadMockDb() {
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      const fileContent = fs.readFileSync(MOCK_DB_PATH, 'utf8')
      const data = JSON.parse(fileContent)

      if (data.mockServices) mockServices = data.mockServices
      if (data.mockProjects) mockProjects = data.mockProjects
      if (data.mockTeam) mockTeam = data.mockTeam
      if (data.mockTestimonials) mockTestimonials = data.mockTestimonials
      if (data.mockFaqs) mockFaqs = data.mockFaqs
      if (data.mockMilestones) mockMilestones = data.mockMilestones
      if (data.mockPartners) mockPartners = data.mockPartners
      if (data.mockSettings) mockSettings = data.mockSettings
      if (data.mockLeads) {
        mockLeads = data.mockLeads.map((l) => ({ ...l, createdAt: new Date(l.createdAt) }))
      }
      if (data.mockJobPostings) {
        mockJobPostings = data.mockJobPostings.map((j) => ({
          ...j,
          createdAt: new Date(j.createdAt),
          updatedAt: new Date(j.updatedAt),
        }))
      }
      if (data.mockJobApplications) {
        mockJobApplications = data.mockJobApplications.map((a) => ({
          ...a,
          createdAt: new Date(a.createdAt),
        }))
      }
      if (data.mockAdmin) mockAdmin = data.mockAdmin
      if (data.mockLegalPages) {
        mockLegalPages = data.mockLegalPages.map((p) => ({
          ...p,
          lastUpdated: new Date(p.lastUpdated),
        }))
      }
      if (data.mockClientProjects) {
        mockClientProjects = data.mockClientProjects.map((cp) => ({
          ...cp,
          startDate: new Date(cp.startDate),
          deadline: new Date(cp.deadline),
          createdAt: new Date(cp.createdAt),
          updatedAt: new Date(cp.updatedAt),
        }))
      }
      if (data.mockWorkTasks) {
        mockWorkTasks = data.mockWorkTasks.map((wt) => ({
          ...wt,
          dueDate: wt.dueDate ? new Date(wt.dueDate) : null,
          createdAt: new Date(wt.createdAt),
          updatedAt: new Date(wt.updatedAt),
        }))
      }
      if (data.mockQuickNotes) {
        mockQuickNotes = data.mockQuickNotes.map((qn) => ({
          ...qn,
          createdAt: new Date(qn.createdAt),
          updatedAt: new Date(qn.updatedAt),
        }))
      }
      if (data.mockActivityLogs) {
        mockActivityLogs = data.mockActivityLogs.map((act) => ({
          ...act,
          createdAt: new Date(act.createdAt),
        }))
      }
      if (data.mockSocialPostDrafts) {
        mockSocialPostDrafts = data.mockSocialPostDrafts.map((d) => ({
          ...d,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt),
        }))
      }
      if (data.mockChatbotInquiries) {
        mockChatbotInquiries = data.mockChatbotInquiries.map((i) => ({
          ...i,
          createdAt: new Date(i.createdAt),
          updatedAt: new Date(i.updatedAt),
        }))
      }
      if (data.mockErrorLogs) {
        mockErrorLogs = data.mockErrorLogs.map((e) => ({
          ...e,
          createdAt: new Date(e.createdAt),
        }))
      }
      if (data.mockPageVisits) {
        mockPageVisits = data.mockPageVisits.map((v) => ({
          ...v,
          createdAt: new Date(v.createdAt),
        }))
      }

      console.log('[MockDB] Loaded persisted database state from mock_db.json successfully.')
    }
  } catch (err) {
    console.error(
      '[MockDB] Failed to load database from file, using initial memory defaults:',
      err.message
    )
  }
}

// Load existing state from disk
loadMockDb()

// Ensure all new settings keys exist in mockSettings
const requiredSettings = [
  {
    key: 'googleMapUrl',
    value:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57692.35!2d74.6!3d25.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3968a5!2sBhilwara%2C+Rajasthan!5e0!3m2!1sen!2sin!4v1',
  },
  { key: 'stat_projects', value: '50' },
  { key: 'stat_clients', value: '40' },
  { key: 'stat_experience', value: '5' },
  { key: 'stat_cities', value: '3' },
]
let dbModified = false
for (const req of requiredSettings) {
  if (!mockSettings.some((s) => s.key === req.key)) {
    mockSettings.push(req)
    dbModified = true
  }
}

// Ensure all legal pages exist in mockLegalPages
const requiredPages = [
  {
    key: 'PRIVACY_POLICY',
    item: {
      id: 'lp-privacy',
      pageType: 'PRIVACY_POLICY',
      title: 'Privacy Policy',
      content: `<h2>1. Information We Collect</h2><p>We collect information you provide directly to us, such as when you submit a contact form, request a quote, or apply for a job. This includes your name, email, phone number, and any other details you share.</p><h2>2. How We Use Your Information</h2><p>We use your information to respond to inquiries, deliver our IT services, send updates, and improve website performance.</p><h2>3. Data Protection</h2><p>We implement secure industry-standard measures to protect your personal data from unauthorized access or disclosure.</p>`,
      lastUpdated: new Date(),
      updatedBy: 'admin-mock-1',
    },
  },
  {
    key: 'TERMS_OF_SERVICE',
    item: {
      id: 'lp-terms',
      pageType: 'TERMS_OF_SERVICE',
      title: 'Terms of Service',
      content: `<h2>1. Services Rendered</h2><p>Hindustan Projects provides custom software, web development, digital marketing, and IT consulting services. All projects are subject to agreed milestones and deliverables.</p><h2>2. Payments & Fees</h2><p>Invoices are generated based on the project scope and payment schedule. Payments must be made within the specified timeframes to avoid service suspension.</p><h2>3. Intellectual Property</h2><p>Upon final payment, the ownership of the custom code and deliverables is transferred to the client, while we retain rights to reusable modules.</p>`,
      lastUpdated: new Date(),
      updatedBy: 'admin-mock-1',
    },
  },
  {
    key: 'REFUND_POLICY',
    item: {
      id: 'lp-refund',
      pageType: 'REFUND_POLICY',
      title: 'Refund Policy',
      content: `<h2>1. Service-Based Projects</h2><p>As our projects involve custom design and engineering resources, payments made for milestone deliverables are generally non-refundable once work has commenced.</p><h2>2. Cancellation Policy</h2><p>Clients may cancel a project at any stage. Any work completed up to the date of cancellation will be invoiced and is payable by the client.</p><h2>3. Issues and Support</h2><p>If you encounter any bugs or quality issues, we provide a 30-day post-launch support period to resolve them free of charge.</p>`,
      lastUpdated: new Date(),
      updatedBy: 'admin-mock-1',
    },
  },
]
for (const rp of requiredPages) {
  if (!mockLegalPages.some((p) => p.pageType === rp.key)) {
    mockLegalPages.push(rp.item)
    dbModified = true
  }
}

if (dbModified) {
  saveMockDb()
}

// Wrap all mutating operations in mockPrisma models to auto-save mockDb on write
for (const modelKey of Object.keys(mockPrisma)) {
  if (typeof mockPrisma[modelKey] === 'object' && mockPrisma[modelKey] !== null) {
    for (const methodKey of Object.keys(mockPrisma[modelKey])) {
      const originalMethod = mockPrisma[modelKey][methodKey]
      if (['create', 'update', 'delete', 'upsert'].includes(methodKey)) {
        mockPrisma[modelKey][methodKey] = async function (...args) {
          const result = await originalMethod.apply(this, args)
          saveMockDb()
          return result
        }
      }
    }
  }
}

// Add mock models for SocialPostDraft, ChatbotInquiry, ErrorLog, and PageVisit
mockPrisma.socialPostDraft = {
  findMany: async (args) => {
    let list = mockSocialPostDrafts
    if (args?.where?.projectId) list = list.filter((d) => d.projectId === args.where.projectId)
    if (args?.where?.status) list = list.filter((d) => d.status === args.where.status)
    return applyPagination(list, args)
  },
  findUnique: async (args) => mockSocialPostDrafts.find((d) => d.id === args.where.id) || null,
  count: async (args) => mockSocialPostDrafts.length,
  create: async (args) => {
    const item = { id: `draft-${Date.now()}`, ...args.data, status: 'DRAFT', createdAt: new Date(), updatedAt: new Date() }
    mockSocialPostDrafts.push(item)
    saveMockDb()
    return item
  },
  update: async (args) => {
    const idx = mockSocialPostDrafts.findIndex((d) => d.id === args.where.id)
    if (idx !== -1) {
      mockSocialPostDrafts[idx] = { ...mockSocialPostDrafts[idx], ...args.data, updatedAt: new Date() }
      saveMockDb()
      return mockSocialPostDrafts[idx]
    }
    throw new Error('Draft not found')
  },
  delete: async (args) => {
    const idx = mockSocialPostDrafts.findIndex((d) => d.id === args.where.id)
    if (idx !== -1) {
      const deleted = mockSocialPostDrafts[idx]
      mockSocialPostDrafts = mockSocialPostDrafts.filter((d) => d.id !== args.where.id)
      saveMockDb()
      return deleted
    }
    throw new Error('Draft not found')
  }
}

mockPrisma.chatbotInquiry = {
  findMany: async (args) => {
    let list = mockChatbotInquiries
    if (args?.where?.isAnswered !== undefined) list = list.filter((i) => i.isAnswered === args.where.isAnswered)
    return applyPagination(list, args)
  },
  findUnique: async (args) => mockChatbotInquiries.find((i) => i.id === args.where.id) || null,
  count: async (args) => mockChatbotInquiries.length,
  create: async (args) => {
    const item = { id: `chat-${Date.now()}`, ...args.data, isAnswered: false, createdAt: new Date(), updatedAt: new Date() }
    mockChatbotInquiries.push(item)
    saveMockDb()
    return item
  },
  update: async (args) => {
    const idx = mockChatbotInquiries.findIndex((i) => i.id === args.where.id)
    if (idx !== -1) {
      mockChatbotInquiries[idx] = { ...mockChatbotInquiries[idx], ...args.data, updatedAt: new Date() }
      saveMockDb()
      return mockChatbotInquiries[idx]
    }
    throw new Error('Inquiry not found')
  },
  delete: async (args) => {
    const idx = mockChatbotInquiries.findIndex((i) => i.id === args.where.id)
    if (idx !== -1) {
      const deleted = mockChatbotInquiries[idx]
      mockChatbotInquiries = mockChatbotInquiries.filter((i) => i.id !== args.where.id)
      saveMockDb()
      return deleted
    }
    throw new Error('Inquiry not found')
  }
}

mockPrisma.errorLog = {
  findMany: async (args) => {
    let list = mockErrorLogs
    if (args?.where?.source) {
      list = list.filter((e) => e.source === args.where.source)
    }
    // Sort newest first
    list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return applyPagination(list, args)
  },
  count: async (args) => mockErrorLogs.length,
  create: async (args) => {
    const item = {
      id: `err-${Date.now()}`,
      createdAt: new Date(),
      ...args.data,
    }
    mockErrorLogs.push(item)
    saveMockDb()
    return item
  },
  delete: async (args) => {
    const idx = mockErrorLogs.findIndex((e) => e.id === args.where.id)
    if (idx !== -1) {
      const deleted = mockErrorLogs[idx]
      mockErrorLogs = mockErrorLogs.filter((e) => e.id !== args.where.id)
      saveMockDb()
      return deleted
    }
    throw new Error('ErrorLog not found')
  }
}

mockPrisma.pageVisit = {
  findMany: async (args) => {
    let list = mockPageVisits
    // Sort newest first
    list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return applyPagination(list, args)
  },
  count: async (args) => mockPageVisits.length,
  create: async (args) => {
    const item = {
      id: `visit-${Date.now()}`,
      createdAt: new Date(),
      ...args.data,
    }
    mockPageVisits.push(item)
    saveMockDb()
    return item
  }
}

// ── Smart Connection Resolver ───────────────────────────────
let activeClient = realPrisma

try {
  console.log('Checking database connection...')
  await realPrisma.$connect()
  console.log('Database connected successfully.')
} catch (e) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: Database connection failed in production mode:', e.message)
    process.exit(1)
  } else {
    console.warn('⚠️ Database is offline. Starting server in MOCK client mode.')
    activeClient = mockPrisma
  }
}

export default activeClient

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function safeUpsertProject(p) {
  const existing = await prisma.project.findUnique({ where: { id: p.id } })
  if (!existing) {
    await prisma.project.create({ data: p })
  }
}

async function safeUpsertTeamMember(m) {
  const existing = await prisma.teamMember.findUnique({ where: { id: m.id } })
  if (!existing) {
    await prisma.teamMember.create({ data: m })
  }
}

async function safeUpsertTestimonial(t) {
  const existing = await prisma.testimonial.findUnique({ where: { id: t.id } })
  if (!existing) {
    await prisma.testimonial.create({ data: t })
  }
}

async function main() {
  console.log('Seeding database...')

  // Services
  const services = [
    {
      title: 'Web Development',
      slug: 'web-development',
      icon: 'Globe',
      order: 1,
      tag: 'Most Popular',
      deliveryTime: '2-4 Weeks',
      isActive: true,
      shortDescription:
        'Custom, responsive websites built with React, Node.js, and WordPress optimised for speed, SEO, and conversions.',
      fullDescription:
        'We design and build bespoke web solutions that scale. From landing pages to full-stack enterprise platforms, our team delivers clean code, fast load times, and seamless user experiences. Every website is fully responsive and SEO-optimized.',
      techStack: ['React.js', 'Next.js', 'Node.js', 'WordPress', 'MongoDB', 'Tailwind CSS'],
      keyFeatures: [
        'Fully responsive on all devices',
        'SEO-optimised from day one',
        'Fast loading under 3 seconds',
        'Integrated with Google Analytics',
        'Clean maintainable codebase',
        'Free 30-day post-launch support',
      ],
      process: [
        {
          step: '01',
          title: 'Discovery Call',
          desc: 'We understand your goals, target audience, and requirements.',
        },
        {
          step: '02',
          title: 'Design Mockup',
          desc: 'We create a visual prototype for your review and approval.',
        },
        {
          step: '03',
          title: 'Development',
          desc: 'Our team builds the site with clean, scalable code.',
        },
        {
          step: '04',
          title: 'Launch & Support',
          desc: 'We deploy, test, and support you post-launch.',
        },
      ],
    },
    {
      title: 'Digital Marketing & SEO',
      slug: 'digital-marketing-seo',
      icon: 'Megaphone',
      order: 2,
      tag: 'High ROI',
      deliveryTime: 'Ongoing Monthly',
      isActive: true,
      shortDescription:
        'Result-driven campaigns spanning SEO, Google Ads, Meta Ads, and content marketing to drive high-intent leads.',
      fullDescription:
        'Our digital marketing strategies are built on data and focused on ROI. We run complete SEO campaigns to rank your business organically, paired with high-performance paid ads on Google and Instagram to drive immediate leads.',
      techStack: [
        'Google Ads',
        'Meta Ads',
        'SEMrush',
        'Google Analytics',
        'Search Console',
        'Mailchimp',
      ],
      keyFeatures: [
        'Full SEO audit and on-page fixes',
        'Google & Meta paid ad campaigns',
        'Monthly analytics reports',
        'Content marketing strategy',
        'Keyword research & tracking',
        'Conversion rate optimisation',
      ],
      process: [
        {
          step: '01',
          title: 'Audit & Research',
          desc: 'Deep audit of your current digital presence and competitors.',
        },
        {
          step: '02',
          title: 'Strategy',
          desc: 'We build a tailored marketing plan with clear KPIs.',
        },
        {
          step: '03',
          title: 'Campaign Launch',
          desc: 'Ads and SEO go live with continuous monitoring.',
        },
        {
          step: '04',
          title: 'Report & Optimise',
          desc: 'Monthly reports and ongoing campaign improvements.',
        },
      ],
    },
    {
      title: 'IT Consulting & Strategy',
      slug: 'it-consulting-strategy',
      icon: 'Lightbulb',
      order: 3,
      tag: 'Expert Advice',
      deliveryTime: '1-2 Weeks',
      isActive: true,
      shortDescription:
        'Strategic IT advisory to align your technology roadmap with business growth and help you choose the right systems.',
      fullDescription:
        'Our expert consultants analyze your current business workflows, systems, and requirements to design a scalable IT strategy. We assist in vendor selection, cloud architecture design, and technology cost optimization.',
      techStack: ['AWS', 'Azure', 'Jira', 'Confluence', 'Figma', 'Notion'],
      keyFeatures: [
        'Current system assessment',
        'Technology roadmap design',
        'Vendor & tool selection',
        'Cost optimisation planning',
        'Cloud architecture review',
        'Digital transformation strategy',
      ],
      process: [
        {
          step: '01',
          title: 'Assessment',
          desc: 'We evaluate your current workflows and pain points.',
        },
        {
          step: '02',
          title: 'Roadmap',
          desc: 'A detailed IT strategy aligned with your business goals.',
        },
        {
          step: '03',
          title: 'Implementation',
          desc: 'We guide your team through the transition plan.',
        },
        {
          step: '04',
          title: 'Review',
          desc: 'Ongoing advisory support for continuous improvement.',
        },
      ],
    },
    {
      title: 'E-Commerce Solutions',
      slug: 'ecommerce-solutions',
      icon: 'Monitor',
      order: 4,
      tag: 'Sell More',
      deliveryTime: '3-6 Weeks',
      isActive: true,
      shortDescription:
        'End-to-end e-commerce store setup, checkout optimisation, inventory management, and secure payment gateway integrations.',
      fullDescription:
        'We build feature-rich e-commerce stores with smooth checkout experiences, secure payment gateways, and automated inventory sync. From Shopify to custom React storefronts, we ensure your store is fast and optimized for conversions.',
      techStack: ['Shopify', 'WooCommerce', 'Razorpay', 'Stripe', 'React', 'Inventory APIs'],
      keyFeatures: [
        'Custom storefront design',
        'Secure payment integration',
        'Mobile-first checkout flow',
        'Inventory management system',
        'Order tracking & notifications',
        'SEO & performance optimised',
      ],
      process: [
        {
          step: '01',
          title: 'Store Planning',
          desc: 'Product structure, categories, and platform selection.',
        },
        {
          step: '02',
          title: 'Design & Build',
          desc: 'Custom design with frictionless checkout experience.',
        },
        {
          step: '03',
          title: 'Payment Setup',
          desc: 'Secure payment gateway and tax configuration.',
        },
        {
          step: '04',
          title: 'Launch & Grow',
          desc: 'Live store with training and growth support.',
        },
      ],
    },
    {
      title: 'Cloud Solutions & DevOps',
      slug: 'cloud-solutions-devops',
      icon: 'Settings',
      order: 5,
      tag: 'Scalable',
      deliveryTime: '1-3 Weeks',
      isActive: true,
      shortDescription:
        'Secure cloud hosting setup, AWS/Google Cloud management, server scaling, and CI/CD workflows for zero downtime.',
      fullDescription:
        'We manage cloud deployments on AWS, GCP, and DigitalOcean. Our DevOps workflows include automated CI/CD pipelines, containerized deployments with Docker, and server monitoring to ensure 99.9% uptime.',
      techStack: ['AWS', 'Google Cloud', 'Docker', 'Kubernetes', 'GitHub Actions', 'Nginx'],
      keyFeatures: [
        'Cloud server setup & migration',
        'Automated CI/CD pipelines',
        'Docker containerisation',
        '99.9% uptime guarantee',
        'Security audits & monitoring',
        'Auto-scaling & load balancing',
      ],
      process: [
        { step: '01', title: 'Audit', desc: 'Review current infrastructure and identify gaps.' },
        {
          step: '02',
          title: 'Architecture',
          desc: 'Design a scalable and secure cloud blueprint.',
        },
        { step: '03', title: 'Migration', desc: 'Move and configure services with zero downtime.' },
        { step: '04', title: 'Monitor', desc: 'Continuous monitoring, alerts, and optimisations.' },
      ],
    },
    {
      title: 'Branding & UI/UX Design',
      slug: 'branding-ui-ux-design',
      icon: 'Layers',
      order: 6,
      tag: 'Stand Out',
      deliveryTime: '2-3 Weeks',
      isActive: true,
      shortDescription:
        'Premium UI/UX designs coupled with complete corporate brand identity systems, logos, and guidelines.',
      fullDescription:
        'Our design team crafts modern, intuitive user interfaces and frictionless user experiences. We combine this with holistic brand identity design including logos, color palettes, and brand guidelines.',
      techStack: [
        'Figma',
        'Adobe Illustrator',
        'Adobe XD',
        'Framer',
        'Prototyping',
        'Style Guides',
      ],
      keyFeatures: [
        'Professional logo design',
        'Full brand identity system',
        'UI design with Figma prototypes',
        'Color palette & typography guide',
        'Brand asset & icon library',
        'UX research & user flows',
      ],
      process: [
        {
          step: '01',
          title: 'Discovery',
          desc: 'Understanding your brand vision, values, and audience.',
        },
        { step: '02', title: 'Concepts', desc: 'Multiple design directions for your review.' },
        { step: '03', title: 'Refinement', desc: 'Finalise chosen concept with your feedback.' },
        { step: '04', title: 'Delivery', desc: 'Complete brand package in all required formats.' },
      ],
    },
    {
      title: 'Mobile App Development',
      slug: 'mobile-app-development',
      icon: 'Smartphone',
      order: 7,
      tag: 'iOS & Android',
      deliveryTime: '6-12 Weeks',
      isActive: true,
      shortDescription:
        'Native and cross-platform mobile apps built with React Native and Flutter, secure, high-performing, and App Store ready.',
      fullDescription:
        'We design and build secure, fast mobile applications for iOS and Android. Using React Native and Flutter, we deliver native-like performance with a single codebase including push notifications, offline support, and App Store submission.',
      techStack: ['React Native', 'Flutter', 'Firebase', 'REST APIs', 'App Store', 'Play Store'],
      keyFeatures: [
        'Cross-platform iOS & Android',
        'Native-like performance',
        'Push notifications & deep links',
        'Offline mode support',
        'App Store submission handled',
        'Ongoing maintenance & updates',
      ],
      process: [
        { step: '01', title: 'Wireframes', desc: 'Clickable prototypes for all key screens.' },
        { step: '02', title: 'UI Design', desc: 'Pixel-perfect screens matching your brand.' },
        {
          step: '03',
          title: 'Development',
          desc: 'React Native or Flutter codebase with API integrations.',
        },
        {
          step: '04',
          title: 'Publish',
          desc: 'Submit to App Store & Play Store with post-launch support.',
        },
      ],
    },
  ]
  for (const s of services) {
    const existing = await prisma.service.findUnique({ where: { slug: s.slug } })
    if (!existing) {
      await prisma.service.create({ data: s })
    }
  }
  console.log('Seeded ' + services.length + ' services')

  // Projects
  const projects = [
    {
      id: 'proj-1',
      title: 'E-Commerce Platform',
      slug: 'ecommerce-platform',
      clientName: 'Retail Client, Bhilwara',
      category: 'Web',
      isFeatured: true,
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Razorpay', 'Tailwind CSS'],
      description:
        'A full-stack e-commerce platform with inventory management, payment integration, and admin dashboard. Increased online sales by 3x within 60 days.',
      thumbnailUrl: '',
      images: [],
      liveUrl: 'https://demo.hindustanprojects.com/ecommerce',
    },
    {
      id: 'proj-2',
      title: 'Digital Marketing Campaign',
      slug: 'digital-marketing-campaign',
      clientName: 'Fashion Brand, Jaipur',
      category: 'Marketing',
      isFeatured: true,
      technologies: ['Google Ads', 'Meta Ads', 'SEO', 'Google Analytics'],
      description:
        'Multi-channel digital marketing campaign achieving 3x ROI within 3 months. Conversion rates improved by 42% through targeted campaigns.',
      thumbnailUrl: '',
      images: [],
      liveUrl: 'https://demo.hindustanprojects.com/campaign',
    },
    {
      id: 'proj-3',
      title: 'Corporate Brand Identity',
      slug: 'corporate-brand-identity',
      clientName: 'Manufacturing Co., Bhilwara',
      category: 'Branding',
      isFeatured: true,
      technologies: ['Figma', 'Adobe Illustrator', 'Brand Guidelines'],
      description:
        'Complete brand identity redesign including logo, brand guidelines, and marketing collateral. Established premium positioning in the B2B market.',
      thumbnailUrl: '',
      images: [],
      liveUrl: null,
    },
    {
      id: 'proj-4',
      title: 'Textile ERP System',
      slug: 'textile-erp-system',
      clientName: 'Textile Company, Bhilwara',
      category: 'Software',
      isFeatured: false,
      technologies: ['Node.js', 'React', 'MySQL', 'Docker'],
      description:
        'Custom ERP solution for textile manufacturing with production tracking, inventory management, and billing. Reduced operational overhead by 40%.',
      thumbnailUrl: '',
      images: [],
      liveUrl: null,
    },
    {
      id: 'proj-5',
      title: 'Restaurant Website & SEO',
      slug: 'restaurant-website-seo',
      clientName: 'Local Restaurant, Bhilwara',
      category: 'Web',
      isFeatured: false,
      technologies: ['React', 'Tailwind CSS', 'SEO', 'Google My Business'],
      description:
        'Responsive website with online menu, table booking, and local SEO. Restaurant now ranks #1 on Google for restaurant in Bhilwara.',
      thumbnailUrl: '',
      images: [],
      liveUrl: 'https://demo.hindustanprojects.com/restaurant',
    },
    {
      id: 'proj-6',
      title: 'Real Estate Social Media Growth',
      slug: 'real-estate-social-media',
      clientName: 'Real Estate Agency',
      category: 'Marketing',
      isFeatured: false,
      technologies: ['Instagram', 'Facebook', 'Canva', 'Meta Business Suite'],
      description:
        'Organic social media strategy growing followers from 500 to 12,000+ in 6 months with consistent inbound leads.',
      thumbnailUrl: '',
      images: [],
      liveUrl: null,
    },
    {
      id: 'proj-7',
      title: 'Logistics Mobile App',
      slug: 'logistics-mobile-app',
      clientName: 'Transport Agency, Bhilwara',
      category: 'App',
      isFeatured: true,
      technologies: ['React Native', 'Firebase', 'Google Maps API', 'Node.js'],
      description:
        'Real-time GPS tracking and booking mobile app for a regional logistics provider. Available on iOS & Android with push notifications and driver management.',
      thumbnailUrl: '',
      images: [],
      liveUrl: 'https://demo.hindustanprojects.com/logistics',
    },
  ]
  for (const p of projects) {
    await safeUpsertProject(p)
  }
  console.log('Seeded ' + projects.length + ' projects')

  // Team
  const team = [
    {
      id: 'team-1',
      name: 'Mohammad Dilshan',
      role: 'Founder & CEO',
      order: 1,
      bio: 'Tech entrepreneur dedicated to empowering local & global businesses with premium digital solutions. Founded Hindustan Projects to bring world-class IT to Bhilwara.',
      photoUrl: '',
      linkedinUrl: '#',
    },
    {
      id: 'team-2',
      name: 'Rohan Verma',
      role: 'Lead Software Architect',
      order: 2,
      bio: '6+ years in full-stack engineering. Expert in React, Node.js, and cloud architectures. Has built and deployed 30+ production applications.',
      photoUrl: '',
      linkedinUrl: '#',
    },
    {
      id: 'team-3',
      name: 'Priya Mehta',
      role: 'Head of UI/UX & Design',
      order: 3,
      bio: 'Crafts intuitive, conversion-focused user interfaces and modern brand guidelines. 5+ years designing digital products that users love.',
      photoUrl: '',
      linkedinUrl: '#',
    },
    {
      id: 'team-4',
      name: 'Karan Singhal',
      role: 'Head of Digital Marketing',
      order: 4,
      bio: 'Specialist in SEO, Google Ads, and Meta campaigns. Managed 50L+ in ad spend with consistent 3-5x ROAS across industries.',
      photoUrl: '',
      linkedinUrl: '#',
    },
  ]
  for (const m of team) {
    await safeUpsertTeamMember(m)
  }
  console.log('Seeded ' + team.length + ' team members')

  // Testimonials
  const testimonials = [
    {
      id: 'test-1',
      name: 'Aditya Sharma',
      role: 'Managing Director',
      company: 'Bhilwara Textiles Ltd.',
      text: 'Hindustan Projects completely modernized our operations with their custom ERP and corporate portal. Their local availability combined with world-class engineering was exactly what we needed.',
      rating: 5,
      order: 1,
      isActive: true,
    },
    {
      id: 'test-2',
      name: 'Meera Johar',
      role: 'Founder & CEO',
      company: 'Jaipur Crafts E-Store',
      text: 'Dilshan and his team built our custom e-commerce platform and optimized our checkout flow. Within 3 months of launch, our conversion rates jumped by 42%.',
      rating: 5,
      order: 2,
      isActive: true,
    },
    {
      id: 'test-3',
      name: 'Rajesh Singhal',
      role: 'Owner',
      company: 'Singhal Marbles & Granites',
      text: 'We tried multiple marketing agencies but got zero leads. Hindustan Projects designed a targeted SEO and Google Ads strategy. Today we get 15+ high-quality inquiries every week.',
      rating: 5,
      order: 3,
      isActive: true,
    },
  ]
  for (const t of testimonials) {
    await safeUpsertTestimonial(t)
  }
  console.log('Seeded ' + testimonials.length + ' testimonials')

  // FAQs
  const faqs = [
    {
      id: 'faq-1',
      question: 'How long does it take to build a website?',
      answer:
        'For a standard corporate website, 3-4 weeks. Complex e-commerce or custom portals take 6-8 weeks. We provide clear phase-wise timelines at project start.',
      order: 1,
      isActive: true,
    },
    {
      id: 'faq-2',
      question: 'Do you provide support after launch?',
      answer:
        'Yes. Every project includes 30 days of complimentary support. After that, we offer flexible annual maintenance plans covering security, updates, and SEO audits.',
      order: 2,
      isActive: true,
    },
    {
      id: 'faq-3',
      question: 'Will my website be mobile-friendly and SEO optimized?',
      answer:
        'Absolutely. Every layout is fully responsive and we implement on-page SEO best practices including schema markup, semantic HTML, and fast load times from day one.',
      order: 3,
      isActive: true,
    },
    {
      id: 'faq-4',
      question: 'What are your payment terms?',
      answer:
        '30% deposit to start, 40% on design approval, 30% on final delivery. We also offer monthly retainer models for ongoing marketing and support.',
      order: 4,
      isActive: true,
    },
    {
      id: 'faq-5',
      question: 'Do you work with businesses outside Bhilwara?',
      answer:
        'Yes! We serve clients across Rajasthan and pan-India. Most of our work is done remotely with video calls, shared project boards, and regular check-ins.',
      order: 5,
      isActive: true,
    },
  ]
  for (const f of faqs) {
    const existing = await prisma.faq.findUnique({ where: { id: f.id } })
    if (!existing) {
      await prisma.faq.create({ data: f })
    }
  }
  console.log('Seeded ' + faqs.length + ' FAQs')

  // Site Settings
  const settings = [
    { key: 'phone', value: '+91 99999 99999' },
    { key: 'whatsapp', value: '+91 99999 99999' },
    { key: 'email', value: 'info@snaptech.digital' },
    { key: 'address', value: 'Bhilwara, Rajasthan 311001, India' },
    { key: 'linkedin', value: 'https://www.linkedin.com/company/snaptech-digital' },
    { key: 'instagram', value: 'https://www.instagram.com/snaptech.digital' },
    { key: 'facebook', value: '#' },
    { key: 'tagline', value: 'Architecting High-Performance Digital Solutions & Enterprise Cloud Systems' },
    { key: 'stat_projects', value: '50' },
    { key: 'stat_clients', value: '40' },
    { key: 'stat_experience', value: '5' },
    { key: 'stat_cities', value: '3' },
  ]
  for (const s of settings) {
    const existing = await prisma.siteSetting.findUnique({ where: { key: s.key } })
    if (!existing) {
      await prisma.siteSetting.create({ data: s })
    }
  }
  console.log('Seeded ' + settings.length + ' site settings')

  // Milestones
  const milestones = [
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
    {
      id: 'ms-3',
      year: '2022',
      title: 'Expanded Services',
      desc: 'Launched cloud, DevOps, and mobile app development verticals.',
      order: 3,
    },
    {
      id: 'ms-4',
      year: '2024',
      title: '40+ Happy Clients',
      desc: 'Crossed 40 happy clients mark, serving businesses pan-India.',
      order: 4,
    },
    {
      id: 'ms-5',
      year: '2025',
      title: 'Growing Strong',
      desc: 'Expanding our team and services to cover enterprise-level digital transformation.',
      order: 5,
    },
  ]
  for (const m of milestones) {
    const existing = await prisma.milestone.findUnique({ where: { id: m.id } })
    if (!existing) {
      await prisma.milestone.create({ data: m })
    }
  }
  console.log('Seeded ' + milestones.length + ' milestones')

  // Partners
  const partners = [
    { id: 'p-1', name: 'Bhilwara Textiles', order: 1, isActive: true },
    { id: 'p-2', name: 'Jaipur Crafts', order: 2, isActive: true },
    { id: 'p-3', name: 'Singhal Marbles', order: 3, isActive: true },
    { id: 'p-4', name: 'Rajasthan Polytech', order: 4, isActive: true },
    { id: 'p-5', name: 'RetailHub', order: 5, isActive: true },
  ]
  for (const p of partners) {
    const existing = await prisma.partner.findUnique({ where: { id: p.id } })
    if (!existing) {
      await prisma.partner.create({ data: p })
    }
  }
  console.log('Seeded ' + partners.length + ' partners')

  // Careers
  const jobs = [
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
    },
  ]

  for (const j of jobs) {
    const existing = await prisma.jobPosting.findUnique({ where: { slug: j.slug } })
    if (!existing) {
      await prisma.jobPosting.create({ data: j })
    }
  }
  console.log('Seeded ' + jobs.length + ' job postings')

  // Admin — requires SEED_ADMIN_PASSWORD env var (never falls back to hardcoded value)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@snaptech.digital'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  if (!adminPassword) {
    throw new Error(
      'SEED_ADMIN_PASSWORD env var is required to run the seed. Set it in your .env file.'
    )
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12)
  const adminRecord = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash, role: 'SUPER_ADMIN' },
  })
  console.log('Seeded admin: ' + adminEmail)

  // Legal Pages
  const legalPages = [
    {
      pageType: 'PRIVACY_POLICY',
      title: 'Privacy Policy',
      content: `<h2>1. Information We Collect</h2><p>We collect information you provide directly to us, such as when you submit a contact form, request a quote, or apply for a job. This includes your name, email, phone number, and any other details you share.</p><h2>2. How We Use Your Information</h2><p>We use your information to respond to inquiries, deliver our IT services, send updates, and improve website performance.</p><h2>3. Data Protection</h2><p>We implement secure industry-standard measures to protect your personal data from unauthorized access or disclosure.</p>`,
      updatedBy: adminRecord.id,
    },
    {
      pageType: 'TERMS_OF_SERVICE',
      title: 'Terms of Service',
      content: `<h2>1. Services Rendered</h2><p>Hindustan Projects provides custom software, web development, digital marketing, and IT consulting services. All projects are subject to agreed milestones and deliverables.</p><h2>2. Payments & Fees</h2><p>Invoices are generated based on the project scope and payment schedule. Payments must be made within the specified timeframes to avoid service suspension.</p><h2>3. Intellectual Property</h2><p>Upon final payment, the ownership of the custom code and deliverables is transferred to the client, while we retain rights to reusable modules.</p>`,
      updatedBy: adminRecord.id,
    },
    {
      pageType: 'REFUND_POLICY',
      title: 'Refund Policy',
      content: `<h2>1. Service-Based Projects</h2><p>As our projects involve custom design and engineering resources, payments made for milestone deliverables are generally non-refundable once work has commenced.</p><h2>2. Cancellation Policy</h2><p>Clients may cancel a project at any stage. Any work completed up to the date of cancellation will be invoiced and is payable by the client.</p><h2>3. Issues and Support</h2><p>If you encounter any bugs or quality issues, we provide a 30-day post-launch support period to resolve them free of charge.</p>`,
      updatedBy: adminRecord.id,
    },
  ]
  for (const lp of legalPages) {
    const existing = await prisma.legalPage.findUnique({ where: { pageType: lp.pageType } })
    if (!existing) {
      await prisma.legalPage.create({ data: lp })
    }
  }console.log('Seeded ' + legalPages.length + ' legal pages')

  // Blog Posts (3 sample posts for IT services company)
  const blogPosts = [
    {
      id: 'hp-blog-1',
      title: 'Why We Founded Hindustan Projects: Shifting Rajasthan\'s Businesses to Enterprise IT',
      slug: 'why-we-founded-hindustan-projects-enterprise-it',
      excerpt: 'In today\'s digital-first economy, we founded Hindustan Projects to bridge the gap between legacy paper workflows and high-performance custom software for businesses in Rajasthan and beyond.',
      content: `<h2>Bridging the Digital Gap in Local Markets</h2>
<p>Hindustan Projects was founded with a single, clear mission: to bring enterprise-grade web development, custom software engineering, and digital solutions to businesses across Rajasthan and India. For too long, small and mid-sized enterprises (SMEs) in growing hubs like Bhilwara, Udaipur, and Jodhpur had only two choices when going digital: expensive global consultancies or low-cost template builders who offer zero support and rigid structures.</p>
<p>We realized that local industries—whether it is Bhilwara’s massive textile manufacturing units or Rajasthan's expanding retail and hospitality sectors—need custom, secure, and fast software systems tailored to their specific workflows. That is why we built Hindustan Projects.</p>

<h2>Moving Away From "Template" Culture</h2>
<p>Many businesses buy off-the-shelf templates or generic WordPress setups. While they seem cheap at first, they quickly fail to scale. They are slow, vulnerable to security hacks, and force the business to adapt its real-world operations to fit a rigid website template.</p>
<p>At Hindustan Projects, we do the exact opposite. We build custom applications using cutting-edge technologies like React, Node.js, and PostgreSQL. We design the software around your business operations, ensuring that the technology grows with you, rather than holding you back.</p>

<h2>Our Commitment to Quality</h2>
<p>When you partner with us, you are not just hiring a vendor; you are gaining a technology partner. We stand by four core commitments: complete transparency in billing, zero dependency on third-party templates, high-performance optimization, and dedicated post-launch support. We are here to build digital products that drive real revenue and efficiency for your brand.</p>`,
      featuredImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      category: 'Company News',
      tags: ['Hindustan Projects', 'mission', 'custom software', 'Rajasthan IT'],
      authorName: 'Hindustan Projects',
      status: 'PUBLISHED',
      isFeatured: true,
      publishedAt: new Date('2026-07-08'),
      metaTitle: 'Why We Founded Hindustan Projects | Rajasthan\'s Custom Software Agency',
      metaDescription: 'Read our founding story. We started Hindustan Projects to bridge the gap between legacy systems and modern custom software for businesses in Rajasthan.',
      viewCount: 152,
    },
    {
      id: 'hp-blog-2',
      title: 'What We Build: A Deep Dive into Our Core IT Services & Digital Solutions',
      slug: 'what-we-build-core-it-services-digital-solutions',
      excerpt: 'Discover what we build. From responsive corporate portals and custom textile ERP inventory systems to mobile apps, we design custom digital systems that scale.',
      content: `<h2>A Full-Suite Software Engineering Partner</h2>
<p>Hindustan Projects is a comprehensive IT services provider. We design, code, secure, and manage high-performance software systems. Our capabilities span across three core pillars: custom web applications, specialized business ERP systems, and high-converting marketing platforms.</p>

<h2>1. Custom Web Applications & SaaS Portals</h2>
<p>We build responsive, fast, and feature-rich web applications tailored to your business goals. Utilizing modern frontend frameworks like React and NextJS combined with robust backend APIs (Node.js/Express), we ensure your system loads instantly and can handle thousands of concurrent users securely.</p>

<h2>2. Specialized ERP & Internal Software</h2>
<p>Internal operations are the heart of any business. We build custom dashboards, billing engines, custom CRMs, and supply chain tracking systems. Whether you need to track raw yarn inventory for a loom factory or automate invoice processing for a retail brand, we design software that eliminates manual Excel sheets and paperwork.</p>

<h2>3. Mobile App Development</h2>
<p>Bring your services directly to your clients' smartphones. We build cross-platform mobile apps using Flutter and React Native, delivering a native look and feel on both iOS and Android with a single codebase, saving you time and cost.</p>

<h2>4. Performance-Driven SEO & Marketing</h2>
<p>A great software tool is only useful if your clients can find it. We integrate technical SEO, schema indexing, and fast-performance audits into every site we deploy, helping you rank on top of local searches and capture inbound leads organically.</p>`,
      featuredImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      category: 'Web Development',
      tags: ['custom web apps', 'SaaS', 'ERP', 'mobile apps', 'digital marketing'],
      authorName: 'Hindustan Projects',
      status: 'PUBLISHED',
      isFeatured: false,
      publishedAt: new Date('2026-07-08'),
      metaTitle: 'Our Core IT & Software Development Services | Hindustan Projects',
      metaDescription: 'Explore what we build. From responsive corporate portals to custom ERP inventory systems and mobile dashboards, we design custom systems that scale.',
      viewCount: 98,
    },
    {
      id: 'hp-blog-3',
      title: 'How We Work: Our Step-by-Step Transparent Software Development Journey',
      slug: 'how-we-work-transparent-software-development-journey',
      excerpt: 'How do we bring your ideas to life? Read about our transparent 4-stage development lifecycle: Discovery, UI/UX Design, Robust Coding, and Support.',
      content: `<h2>A Collaborative Approach with Zero Jargon</h2>
<p>We believe that building software should be an exciting and stress-free journey for our clients. We do not hide behind complex technical jargon or surprise you with hidden maintenance fees. Our development lifecycle is divided into four transparent, structured stages to keep you involved every step of the way.</p>

<h2>Stage 1: Discovery & Consultation</h2>
<p>We begin by sitting down with you (either in-person or virtually) to map out your business objectives, workflows, and target audience. We document all functional specifications and align on a clear project roadmap with defined milestones.</p>

<h2>Stage 2: Strategic UI/UX Design</h2>
<p>Before writing a single line of code, our design team builds interactive wireframes and premium UI mockups. You get to see exactly how your website or application will look on desktop and mobile screens. We iterate on the layouts until you are 100% satisfied with the visual design.</p>

<h2>Stage 3: Robust Development & Rigorous Testing</h2>
<p>Once you approve the design, our developers bring it to life using clean, secure, and well-documented code. We run comprehensive quality checks, verifying security protocols, responsive grid fits, and fast page-speed execution across all popular web browsers.</p>

<h2>Stage 4: Launch & Dedicated Support</h2>
<p>We configure your servers, launch your platform live on your custom domains, and set up sitemaps for Google indexing. Post-launch, we provide dedicated support, training your team on how to manage the system via the admin panel, and ensuring 99.9% uptime.</p>`,
      featuredImageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
      category: 'Our Process',
      tags: ['development process', 'UI/UX', 'software testing', 'client collaboration'],
      authorName: 'Hindustan Projects',
      status: 'PUBLISHED',
      isFeatured: false,
      publishedAt: new Date('2026-07-08'),
      metaTitle: 'Our Software Development Process | Hindustan Projects',
      metaDescription: 'How do we bring your ideas to life? Read about our transparent 4-stage process: Discovery, UX Design, Robust Coding, and Support.',
      viewCount: 112,
    },
    {
      id: 'hp-blog-4',
      title: 'Rooted in Bhilwara: Bridging Local Rajasthan Industries with Global Technology',
      slug: 'rooted-in-bhilwara-local-industries-global-tech',
      excerpt: 'We are proud to be based in Bhilwara, Rajasthan. Learn how we help local manufacturing, textile loom mills, and retail brands scale using modern software.',
      content: `<h2>Proudly Based in Rajasthan's Textile Capital</h2>
<p>Hindustan Projects is proud to call Bhilwara, Rajasthan, our home base. As the textile capital of the state, Bhilwara has a rich heritage of industrial entrepreneurship. However, as the global economy transitions to digital-first systems, local mills, retail hubs, and real estate brands need local technology partners who understand their market and can support them face-to-face.</p>
<p>Being local allows us to visit your mills, audit your warehouses, and collaborate directly with your team in Hindi and English. We combine this local availability with global coding and performance standards.</p>

<h2>Helping Local Sectors Scale Globally</h2>
<p>Our localized solutions focus on solving real operational challenges for Rajasthan's leading industries:</p>
<ul>
  <li><strong>Textiles & Loom Mills:</strong> Automating raw material tracking and worker efficiency calculations.</li>
  <li><strong>Marble & Mining:</strong> Creating digital stock catalogs and inquiry forms to capture international buyers.</li>
  <li><strong>Retail & Trade:</strong> Implementing custom e-commerce channels and WhatsApp notification automations.</li>
</ul>

<h2>Let's Collaborate Face-to-Face</h2>
<p>If you are a business owner in Bhilwara, Chittorgarh, Udaipur, or Jaipur, you do not need to look toward metro cities for premium software engineering. Our local team is ready to build your custom web apps, mobile portals, and digital systems right here. Contact us to schedule a meeting at our office or invite us to your factory for a live consultation.</p>`,
      featuredImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      category: 'Local Growth',
      tags: ['Bhilwara', 'Rajasthan', 'local businesses', 'IT agency Bhilwara'],
      authorName: 'Hindustan Projects',
      status: 'PUBLISHED',
      isFeatured: false,
      publishedAt: new Date('2026-07-08'),
      metaTitle: 'Bhilwara\'s Trusted IT & Web Development Agency | Hindustan Projects',
      metaDescription: 'We are proud to be based in Bhilwara, Rajasthan. Learn how we help local manufacturing, textiles, and retail brands scale using modern software.',
      viewCount: 143,
    },
  ]

  for (const post of blogPosts) {
    const existing = await prisma.blogPost.findUnique({ where: { id: post.id } })
    if (!existing) {
      await prisma.blogPost.create({ data: post })
    }
  }
  console.log('Seeded ' + blogPosts.length + ' blog posts')

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

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
  email: 'info@snaptech.digital',
  // Dev-only mock hash — never used in production (real DB is used when DATABASE_URL points to Neon/Postgres)
  passwordHash:
    process.env.MOCK_ADMIN_HASH || '$2b$10$W4FZyhOY50gqDQJrvqERbeZPWyyr7dKdvRwzO2vwua7nPmuoqECKO',
  role: 'SUPER_ADMIN',
  loginAttempts: 0,
  lockoutUntil: null,
  refreshToken: null,
  twoFactorSecret: null,
  twoFactorEnabled: false,
  isActive: true,
}

let mockServices = [
  {
    id: '1',
    title: 'Custom Web Development',
    slug: 'web-development',
    icon: 'Globe',
    order: 1,
    tag: 'Most Popular',
    deliveryTime: '2–4 Weeks',
    isActive: true,
    shortDescription:
      'Custom, high-speed websites, web applications, and customer portals engineered for fast loading speeds, search visibility, and conversion-focused performance.',
    fullDescription:
      'SnapTech Digital engineers custom web applications and business websites tailored to your specific commercial requirements. We build clean, modular architectures using modern frameworks like React and Next.js backed by Node.js and PostgreSQL. From corporate marketing sites to internal business portals and secure client dashboards, every project includes mobile responsiveness, on-page SEO foundations, and complete source code ownership upon delivery.',
    techStack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
    keyFeatures: [
      'Fully responsive layout optimized across mobile, tablet, and desktop',
      'Fast performance tuning aligned with Google Core Web Vitals',
      'Custom contact, quote, and lead capture forms with spam filtering',
      'On-page SEO setup including meta tags, schema markup, and sitemaps',
      'Secure administrative portal or headless CMS for easy content updates',
      '100% full source code ownership with 30-day post-launch support',
    ],
    process: [
      { step: '01', title: 'Requirements & Scoping', desc: 'Understanding your business objectives, target audience, and functional specifications.' },
      { step: '02', title: 'Wireframes & Architecture', desc: 'Designing responsive layout mockups and structuring the database and API schema.' },
      { step: '03', title: 'Development & Testing', desc: 'Writing clean, modular code with cross-browser compatibility and device testing.' },
      { step: '04', title: 'Launch & Handover', desc: 'Production deployment, domain and SSL setup, analytics integration, and full code handover.' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Mobile App Development',
    slug: 'mobile-app-development',
    icon: 'Smartphone',
    order: 2,
    tag: 'iOS & Android',
    deliveryTime: '6–10 Weeks',
    isActive: true,
    shortDescription:
      'Cross-platform iOS and Android mobile applications built with React Native and Flutter for seamless mobile performance, offline caching, and app store deployment.',
    fullDescription:
      'We design and build secure, intuitive mobile applications that run smoothly on both Apple iOS and Google Android from a unified codebase. Utilizing modern frameworks like React Native and Flutter, we eliminate the cost and overhead of maintaining separate codebases while delivering native-feel touch responsiveness. Our mobile engineering covers authentication, REST/GraphQL API integrations, push notifications, offline data synchronization, and end-to-end publishing on the Apple App Store and Google Play Store.',
    techStack: ['React Native', 'Flutter', 'Firebase', 'REST APIs', 'App Store Connect', 'Google Play Console'],
    keyFeatures: [
      'Single cross-platform codebase for iOS and Android deployment',
      'Intuitive, responsive touch interfaces and fluid screen transitions',
      'Offline data caching and background synchronization',
      'Targeted push notifications for user alerts and re-engagement',
      'Secure user authentication and third-party API integrations',
      'Assisted App Store and Google Play Store submission and review compliance',
    ],
    process: [
      { step: '01', title: 'App Scoping & User Flow', desc: 'Defining user journeys, screen hierarchy, and mobile functional requirements.' },
      { step: '02', title: 'UI/UX Mobile Design', desc: 'Crafting pixel-perfect mobile screen mockups following iOS and Android guidelines.' },
      { step: '03', title: 'Cross-Platform Build', desc: 'Engineering app frontend, integrating APIs, local storage, and push notifications.' },
      { step: '04', title: 'Store Submission & Launch', desc: 'Publishing app bundles, configuring store listings, and monitoring release health.' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Digital Marketing & SEO',
    slug: 'digital-marketing-seo',
    icon: 'Megaphone',
    order: 3,
    tag: 'Lead Acquisition',
    deliveryTime: 'Monthly Campaigns',
    isActive: true,
    shortDescription:
      'Targeted search engine optimization (SEO), Google Ads, and Meta advertising campaigns structured to generate qualified commercial leads and measurable ROI.',
    fullDescription:
      'We help businesses build sustainable online visibility and acquire high-intent customers through data-backed marketing strategies. Our approach unites on-page technical SEO, Google Business Profile local ranking, and high-conversion paid search campaigns across Google Ads and Meta platforms. We emphasize transparent reporting, conversion tracking with Google Analytics 4, and ongoing landing page optimization so you always know where your marketing budget is going.',
    techStack: ['Google Ads', 'Meta Ads Manager', 'Google Analytics 4', 'SEMrush', 'Search Console', 'Tag Manager'],
    keyFeatures: [
      'Technical SEO audit with on-page metadata, site speed, and indexing fixes',
      'Local SEO and Google Business Profile optimization for regional search rankings',
      'Targeted Google Search (PPC) and Meta ad campaign setup and management',
      'Server-side conversion tracking and Google Analytics 4 event configuration',
      'Landing page conversion rate optimization (CRO) to maximize lead capture',
      'Transparent monthly performance reports detailing inquiries, clicks, and costs',
    ],
    process: [
      { step: '01', title: 'Audit & Competitor Analysis', desc: 'Auditing existing search presence, keyword gaps, and competitor advertising.' },
      { step: '02', title: 'Strategy & Tracking Setup', desc: 'Setting up GA4 conversion events, defining target audiences, and keyword tiers.' },
      { step: '03', title: 'Campaign Execution', desc: 'Deploying optimized search ads, publishing SEO updates, and refining ad copy.' },
      { step: '04', title: 'Ongoing Optimization', desc: 'Reviewing weekly lead quality, pruning negative keywords, and reporting monthly ROI.' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'E-Commerce Solutions',
    slug: 'ecommerce-solutions',
    icon: 'Monitor',
    order: 4,
    tag: 'Online Storefronts',
    deliveryTime: '3–6 Weeks',
    isActive: true,
    shortDescription:
      'Turnkey digital storefronts, custom Shopify setups, and scalable online catalogs engineered for smooth checkout flows and automated order processing.',
    fullDescription:
      'SnapTech Digital builds conversion-focused e-commerce stores designed to turn casual visitors into paying customers. Whether you need a customized Shopify storefront or a tailored React web shop, we implement fast product search, category navigation, secure Indian and international payment gateways (Razorpay, Stripe), automated tax calculation, and order tracking. We focus on minimizing mobile cart abandonment and simplifying store management for your operations team.',
    techStack: ['Shopify', 'WooCommerce', 'React', 'Razorpay', 'Stripe', 'Node.js'],
    keyFeatures: [
      'Mobile-first digital storefront design optimized for quick product discovery',
      'Secure payment gateway integration with UPI, Credit/Debit cards, and NetBanking',
      'Real-time inventory and catalog management with category filtering',
      'Automated order confirmation and dispatch alerts via WhatsApp, SMS, or Email',
      'Optimized product schema markup for search engine and shopping visibility',
      'Store admin dashboard training and post-launch checkout flow verification',
    ],
    process: [
      { step: '01', title: 'Catalog & Store Planning', desc: 'Structuring product categories, variants, shipping zones, and tax rules.' },
      { step: '02', title: 'Storefront UI & Branding', desc: 'Designing custom homepage, collection, product, and mobile checkout pages.' },
      { step: '03', title: 'Payment & API Integration', desc: 'Configuring payment gateways, shipping calculators, and inventory sync.' },
      { step: '04', title: 'Testing & Launch', desc: 'Conducting live test transactions, load checks, and handing over store controls.' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Cloud Solutions & DevOps',
    slug: 'cloud-solutions-devops',
    icon: 'Settings',
    order: 5,
    tag: 'Cloud Infrastructure',
    deliveryTime: '1–3 Weeks',
    isActive: true,
    shortDescription:
      'Secure cloud hosting setup, containerized deployments, automated backups, and proactive monitoring on AWS, Google Cloud, and DigitalOcean.',
    fullDescription:
      'SnapTech Digital helps businesses transition to modern, dependable cloud infrastructure designed to scale with your traffic. We set up and manage virtual private servers, containerized workloads with Docker, and automated CI/CD deployment pipelines on leading cloud providers. Our engineers implement automated daily database backups, SSL/TLS certificate management, firewall rules, and real-time monitoring to keep your business services operational and secure.',
    techStack: ['AWS', 'Google Cloud', 'Docker', 'GitHub Actions', 'Nginx', 'PostgreSQL', 'Redis'],
    keyFeatures: [
      'Cloud infrastructure setup and migration on AWS, Google Cloud, or DigitalOcean',
      'Automated CI/CD build and deployment pipelines for rapid updates',
      'Automated daily encrypted database backups with disaster recovery procedures',
      'Server security hardening, firewall configuration, and SSL/TLS installation',
      'Continuous server health monitoring, resource alerts, and log aggregation',
      'Hosting cost review to eliminate idle instances and right-size cloud resources',
    ],
    process: [
      { step: '01', title: 'Infrastructure Assessment', desc: 'Reviewing current server capacity, database performance, and security settings.' },
      { step: '02', title: 'Cloud Architecture Design', desc: 'Selecting appropriate instance tiers, storage volumes, and network security rules.' },
      { step: '03', title: 'Migration & Pipeline Setup', desc: 'Configuring servers, containerizing code, and setting up automated CI/CD.' },
      { step: '04', title: 'Monitoring & Documentation', desc: 'Enabling automated alerts, testing backup restores, and delivering runbooks.' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    title: 'Branding & UI/UX Design',
    slug: 'branding-ui-ux-design',
    icon: 'Layers',
    order: 6,
    tag: 'Brand Identity',
    deliveryTime: '2–3 Weeks',
    isActive: true,
    shortDescription:
      'Intuitive user interface designs, interactive prototypes, and unified corporate visual identities that establish credibility and enhance customer engagement.',
    fullDescription:
      'A strong visual presence and intuitive digital product design build immediate trust with your audience. SnapTech Digital crafts cohesive brand identities—from distinctive vector logos and typography systems to complete digital design guidelines. For web and mobile applications, our UI/UX designers create comprehensive user journeys, wireframes, and interactive Figma prototypes that validate concepts and streamline front-end engineering before a single line of code is written.',
    techStack: ['Figma', 'Adobe Illustrator', 'Adobe Photoshop', 'Design Tokens', 'Prototyping'],
    keyFeatures: [
      'Distinctive vector logo design in full color, reverse, and monochrome formats',
      'Complete corporate visual identity guidelines (colors, typography, spacing)',
      'Interactive, clickable Figma UI/UX prototypes and wireframe user journeys',
      'Reusable UI component libraries and design tokens for web and mobile development',
      'Corporate digital stationery, presentation deck templates, and social media kits',
      'Complete commercial asset handover in Figma, SVG, EPS, PNG, and PDF formats',
    ],
    process: [
      { step: '01', title: 'Brand Discovery & Brief', desc: 'Exploring your market positioning, brand personality, and aesthetic preferences.' },
      { step: '02', title: 'Concept Exploration', desc: 'Developing creative directions for logos, typography, and primary UI layouts.' },
      { step: '03', title: 'Refinement & Prototyping', desc: 'Iterating on feedback to produce interactive Figma flows and asset variations.' },
      { step: '04', title: 'Design System Handover', desc: 'Organizing all export-ready vector files, style sheets, and developer specifications.' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    title: 'IT Consulting & Strategy',
    slug: 'it-consulting-strategy',
    icon: 'Lightbulb',
    order: 7,
    tag: 'Technical Advisory',
    deliveryTime: '1–2 Weeks',
    isActive: true,
    shortDescription:
      'Independent technical consulting to help business owners evaluate software options, audit existing IT systems, and plan realistic digital roadmaps.',
    fullDescription:
      'Navigating software choices and agency proposals can be overwhelming. SnapTech Digital provides practical, vendor-neutral IT consulting to help business leaders make confident technology investments. We evaluate existing systems, identify performance bottlenecks and security vulnerabilities, assess vendor estimates, and design practical implementation roadmaps aligned with your operating budget and growth targets.',
    techStack: ['Cloud Architecture', 'System Audits', 'Jira', 'Security Review', 'Database Design'],
    keyFeatures: [
      'Comprehensive review of current software systems, databases, and hosting',
      'Objective evaluation and cost comparison of third-party software proposals',
      'Step-by-step digital roadmap prioritized by business impact and budget',
      'System architecture recommendations for operational scale and data integrity',
      'Data backup, security posture, and compliance checklist evaluation',
      'Executive summary presentation and clear action plan for decision-makers',
    ],
    process: [
      { step: '01', title: 'Discovery & System Audit', desc: 'Interviewing stakeholders and reviewing existing software, tools, and pain points.' },
      { step: '02', title: 'Gap & Risk Analysis', desc: 'Identifying performance bottlenecks, security risks, and cost inefficiencies.' },
      { step: '03', title: 'Roadmap & Architecture', desc: 'Formulating realistic technical recommendations and evaluating vendor options.' },
      { step: '04', title: 'Executive Briefing', desc: 'Presenting findings, priority action items, and phased budget recommendations.' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

let mockProjects = [
  {
    id: 'p-1',
    title: 'Enterprise Commerce Architecture',
    slug: 'ecommerce-platform',
    clientName: 'Retail Merchant Network, Rajasthan',
    category: 'Web',
    isFeatured: true,
    technologies: ['React 19', 'Node.js', 'PostgreSQL', 'Redis', 'AWS'],
    description:
      'A full-stack enterprise e-commerce platform with automated multi-warehouse inventory management, sub-second checkout, and unified merchant analytics dashboard.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80&auto=format&fit=crop',
    ],
    liveUrl: null,
    result: '3.4× Conversion Growth in 60 Days',
    duration: '8 Weeks Delivery',
    challenge: 'The legacy portal suffered from 4.8s page loads, peak-season checkout crashes, and disconnected inventory ledgers across regional warehouses.',
    solution: 'Engineered an ultra-fast headless React front-end, optimized PostgreSQL connection pooling with Redis caching, and integrated automated webhook sync for payment gateways.',
    features: [
      'Sub-second checkout flow with Razorpay auto-failover',
      'Multi-warehouse automated inventory reconciliation',
      'Real-time analytics dashboard with revenue telemetry',
      'SEO-optimized product catalog with instant search',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p-2',
    title: 'Algorithmic Lead Growth & Performance Marketing',
    slug: 'digital-marketing-campaign',
    clientName: 'Lifestyle & Apparel Brand, Jaipur',
    category: 'Marketing',
    isFeatured: true,
    technologies: ['Google Ads', 'Meta Ads', 'Technical SEO', 'Google Analytics 4', 'Tag Manager'],
    description:
      'Multi-channel performance marketing system combining high-intent search visibility, hyper-targeted ad scaling, and conversion rate optimization.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop',
    ],
    liveUrl: null,
    result: '3.8× Verified ROAS in Quarter 1',
    duration: 'Ongoing SLA',
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
    title: 'Enterprise Brand Identity & Design System',
    slug: 'corporate-brand-identity',
    clientName: 'Industrial Manufacturing Conglomerate, Bhilwara',
    category: 'Branding',
    isFeatured: true,
    technologies: ['Figma Tokens', 'Vector Asset System', 'Design Guidelines', 'Adobe Creative Cloud'],
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
    title: 'Industrial Textile ERP & Supply Chain System',
    slug: 'textile-erp-system',
    clientName: 'Textile Manufacturing Hub, Bhilwara',
    category: 'Software',
    isFeatured: true,
    technologies: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'Redis'],
    description:
      'Custom ERP solution managing weaving loom cycles, raw material inventory traceability, supplier ledger automation, and GST e-invoicing in one database.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop',
    ],
    liveUrl: null,
    result: '42% Reduction in Factory Downtime',
    duration: '12 Weeks Milestone',
    challenge: 'Factory management relied on manual paper logs and fragmented spreadsheets, resulting in loom idle time, billing discrepancies, and delayed dispatch schedules.',
    solution: 'Deployed a custom intranet web ERP with role-based access control, barcode-driven yarn inventory, and direct machine operator tablets.',
    features: [
      'Live weaving loom telemetry & shift production logs',
      'Barcode-driven yarn and fabric roll inventory tracking',
      'Automated GST e-invoicing and accounting sync',
      'Role-based permissions for plant managers, operators, and accountants',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p-5',
    title: 'High-Converting Hospitality Web Portal & Local SEO',
    slug: 'restaurant-website-seo',
    clientName: 'Heritage Dining & Resort, Udaipur',
    category: 'Web',
    isFeatured: false,
    technologies: ['React 19', 'Tailwind CSS', 'Schema Markup', 'Google Business Profile API'],
    description:
      'Interactive reservation engine with online menu, dynamic seasonal pricing, sub-second page loads, and top Google Maps/Search local positioning.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop',
    ],
    liveUrl: null,
    result: '#1 Google Ranking Across 12 Targeted Keywords',
    duration: '3 Weeks Sprint',
    challenge: 'Dependence on third-party aggregator portals charging 25% commissions on table reservations and food orders with zero direct customer data.',
    solution: 'Engineered a direct table reservation web portal with instant WhatsApp booking confirmations and rigorous local Google Schema SEO.',
    features: [
      'Direct table reservation engine without aggregator commission',
      'Interactive digital menu with QR code scan support',
      'Local Schema.org restaurant markup for Google Rich Snippets',
      'WhatsApp Business API automated confirmation notifications',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p-6',
    title: 'Omnichannel Digital Brand Expansion & Lead Engine',
    slug: 'real-estate-social-media',
    clientName: 'Commercial Real Estate Agency, Rajasthan',
    category: 'Marketing',
    isFeatured: false,
    technologies: ['Meta Business Suite', 'Content Automation', 'LinkedIn Inbound', 'Canva Pro'],
    description:
      'Inbound digital authority campaign generating high-ticket commercial property inquiries through programmatic content workflows and verified targeting.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop',
    ],
    liveUrl: null,
    result: '500 → 14,000+ Verified Investor Leads',
    duration: '6 Months Retainer',
    challenge: 'Traditional print ads and billboards failed to attract modern retail investors and corporate buyers seeking commercial property in Rajasthan.',
    solution: 'Launched high-value video walkthrough campaigns, digital brochures, and targeted LinkedIn and Meta ad funnels reaching verified business decision makers.',
    features: [
      'High-definition architectural video walkthroughs',
      'Targeted investor persona funnels across LinkedIn & Meta',
      'Instant automated lead qualification with CRM sync',
      'Weekly conversion attribution reporting for sales executives',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p-7',
    title: 'Enterprise Fleet Telematics Mobile App',
    slug: 'logistics-mobile-app',
    clientName: 'Regional Transport & Logistics Hub, Bhilwara',
    category: 'App',
    isFeatured: true,
    technologies: ['React Native', 'Firebase', 'Google Maps Fleet API', 'Node.js', 'WebSockets'],
    description:
      'Mission-critical real-time telemetry and dispatch mobile application for 400+ commercial vehicles across North India with 60fps tracking.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80&auto=format&fit=crop',
    ],
    liveUrl: null,
    result: '10,000+ Active Driver Dispatches Logged',
    duration: '10 Weeks Delivery',
    challenge: 'Manual phone coordination with long-haul drivers led to delayed delivery status updates, lost proof-of-delivery receipts, and fuel misuse.',
    solution: 'Engineered a dual-app mobile ecosystem (Driver App + Fleet Ops Manager) with live GPS pinging, offline receipt uploads, and instant automated WhatsApp delivery receipts.',
    features: [
      'Real-time GPS vehicle tracking with WebSockets',
      'Digital Proof of Delivery (e-POD) with signature capture',
      'Automated driver route optimization and fuel logging',
      'Instant WhatsApp delivery alerts for consignees',
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
    email: 'rahul.applicant@snaptech.digital',
    phone: '9876543210',
    resumeUrl: 'https://res.cloudinary.com/demo/image/upload/v1580000000/sample_resume.pdf',
    coverLetter:
      'I am highly passionate about full-stack development and would love to work with SnapTech Digital.',
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
      'SnapTech Digital delivered our web platform on time. Excellent development quality and support.',
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
    answer: 'We offer custom web development, mobile app engineering, enterprise ERPs, cloud DevOps, digital marketing, and UI/UX design.',
    order: 1,
    isActive: true,
  },
  {
    id: '2',
    question: 'Where are you located?',
    answer: 'Our engineering hub is based in Bhilwara, Rajasthan, but we serve enterprise clients across India with dedicated remote sprint boards.',
    order: 2,
    isActive: true,
  },
]

let mockMilestones = [
  {
    id: 'ms-1',
    year: 'July 2026',
    title: 'Founding of SnapTech Digital',
    desc: 'Established in July 2026 as the dedicated technology and digital transformation division of Hindustan Projects in Bhilwara, Rajasthan.',
    order: 1,
  },
]

let mockPartners = [
  {
    id: '1',
    name: 'Textile Manufacturing Mills',
    logoUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200',
    order: 1,
    isActive: true,
  },
  {
    id: '2',
    name: 'Marble & Granite Exporters',
    logoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200',
    order: 2,
    isActive: true,
  },
  {
    id: '3',
    name: 'Direct-to-Consumer Retail Brands',
    logoUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200',
    order: 3,
    isActive: true,
  },
  {
    id: '4',
    name: 'Fleet & Logistics Networks',
    logoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200',
    order: 4,
    isActive: true,
  },
]

let mockSettings = [
  { key: 'phone', value: '+91 8209604849' },
  { key: 'whatsapp', value: '+91 8209604849' },
  { key: 'whatsappMessage', value: 'Hi SnapTech Team! I visited your website and want to discuss a project.' },
  { key: 'email', value: 'info@snaptech.digital' },
  { key: 'address', value: 'Bhilwara, Rajasthan 311001, India' },
  { key: 'linkedin', value: 'https://www.linkedin.com/company/snaptech-digital' },
  { key: 'instagram', value: 'https://www.instagram.com/snaptech.digital' },
  { key: 'facebook', value: '#' },
  { key: 'tagline', value: 'Architecting High-Performance Digital Solutions & Enterprise Cloud Systems' },
  { key: 'parent_company_name', value: 'Hindustan Projects Group' },
  { key: 'parent_company_url', value: 'https://www.hindustanprojects.in' },
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
    content: `<h2>1. Services Rendered</h2><p>SnapTech Digital provides custom software, web development, digital marketing, and IT consulting services. All projects are subject to agreed milestones and deliverables.</p><h2>2. Payments & Fees</h2><p>Invoices are generated based on the project scope and payment schedule. Payments must be made within the specified timeframes to avoid service suspension.</p><h2>3. Intellectual Property</h2><p>Upon final payment, the ownership of the custom code and deliverables is transferred to the client, while we retain rights to reusable modules.</p>`,
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
    adminEmail: 'info@snaptech.digital',
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
  $transaction: async (arg) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg)
    }
    if (typeof arg === 'function') {
      return arg(mockPrisma)
    }
    return arg
  },

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
      if (args?.where?.slug)
        list = list.filter((j) => j.slug === args.where.slug)
      if (args?.where?.department)
        list = list.filter((j) => j.department === args.where.department)
      
      // Calculate applications count for admin list
      if (args?.include?._count) {
        list = list.map((job) => ({
          ...job,
          _count: {
            applications: mockJobApplications.filter(
              (a) => a.jobPostingId === job.id && !a.deletedAt
            ).length,
          },
        }))
      }
      return applyPagination(list, args)
    },
    findUnique: async (args) => {
      if (args.where.id) return mockJobPostings.find((j) => j.id === args.where.id) || null
      if (args.where.slug) return mockJobPostings.find((j) => j.slug === args.where.slug) || null
      return null
    },
    upsert: async (args) => {
      let job = mockJobPostings.find(
        (j) =>
          (args.where.id && j.id === args.where.id) ||
          (args.where.slug && j.slug === args.where.slug)
      )
      if (job) {
        const idx = mockJobPostings.indexOf(job)
        mockJobPostings[idx] = { ...mockJobPostings[idx], ...args.update, updatedAt: new Date() }
        return mockJobPostings[idx]
      } else {
        const item = {
          id: `jp-${Date.now()}`,
          responsibilities: [],
          requirements: [],
          skills: [],
          perks: [],
          hiringSteps: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...args.create,
        }
        mockJobPostings.push(item)
        return item
      }
    },
    count: async (args) => mockJobPostings.length,
    create: async (args) => {
      const item = {
        id: `jp-${Date.now()}`,
        responsibilities: [],
        requirements: [],
        skills: [],
        perks: [],
        hiringSteps: [],
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
      if (args?.where?.deletedAt === null) {
        list = list.filter((a) => !a.deletedAt)
      }
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
    findUnique: async (args) => {
      const app = mockJobApplications.find((a) => a.id === args.where.id)
      if (!app) return null
      if (args?.include?.jobPosting) {
        return {
          ...app,
          jobPosting: mockJobPostings.find((jp) => jp.id === app.jobPostingId) || null,
        }
      }
      return { ...app }
    },
    findFirst: async (args) => {
      let list = [...mockJobApplications]
      if (args?.where?.jobPostingId) list = list.filter((a) => a.jobPostingId === args.where.jobPostingId)
      if (args?.where?.email) list = list.filter((a) => a.email.toLowerCase() === args.where.email.toLowerCase())
      if (args?.where?.createdAt?.gte) {
        list = list.filter((a) => new Date(a.createdAt) >= args.where.createdAt.gte)
      }
      return list[0] || null
    },
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
        const updated = mockJobApplications[idx]
        if (args?.include?.jobPosting) {
          return {
            ...updated,
            jobPosting: mockJobPostings.find((jp) => jp.id === updated.jobPostingId) || null,
          }
        }
        return updated
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
    findMany: async (args) => [mockAdmin],
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

  client: {
    findMany: async () => [],
    count: async () => 0,
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

const getMockDbFile = () => {
  const p2 = path.join(process.cwd(), 'server', 'mock_db.json')
  const p1 = path.join(process.cwd(), 'mock_db.json')
  if (fs.existsSync(p2)) return p2
  if (fs.existsSync(p1)) return p1
  return p2
}
const MOCK_DB_PATH = getMockDbFile()

// Add mock datasets for social drafts, chatbot inquiries, error logs, and page visits
let mockSocialPostDrafts = []
let mockChatbotInquiries = []
let mockErrorLogs = []
let mockPageVisits = []
let mockEmailLogs = []
let mockEmailAccounts = [
  {
    id: 'acct-primary-info',
    email: 'info@snaptech.digital',
    displayName: 'SnapTech Digital Info',
    provider: 'HOSTINGER',
    isActive: true,
    isDefaultSender: true,
    replyTo: 'info@snaptech.digital',
    department: 'general',
    enquiryTypes: ['contact_form', 'service_inquiry', 'general'],
    smtpHost: 'smtp.hostinger.com',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: 'info@snaptech.digital',
    smtpPasswordEncrypted: null,
    imapHost: 'imap.hostinger.com',
    imapPort: 993,
    imapSecure: true,
    imapUser: 'info@snaptech.digital',
    imapPasswordEncrypted: null,
    imapMailbox: 'INBOX',
    syncEnabled: true,
    lastSyncAt: null,
    lastSyncStatus: 'NEVER_SYNCED',
    lastSyncError: null,
    syncCursor: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acct-sales',
    email: 'sales@snaptech.digital',
    displayName: 'SnapTech Sales & Commercial',
    provider: 'HOSTINGER',
    isActive: true,
    isDefaultSender: false,
    replyTo: 'sales@snaptech.digital',
    department: 'sales',
    enquiryTypes: ['pricing_quote', 'cost_calculator', 'quote'],
    smtpHost: 'smtp.hostinger.com',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: 'sales@snaptech.digital',
    smtpPasswordEncrypted: null,
    imapHost: 'imap.hostinger.com',
    imapPort: 993,
    imapSecure: true,
    imapUser: 'sales@snaptech.digital',
    imapPasswordEncrypted: null,
    imapMailbox: 'INBOX',
    syncEnabled: true,
    lastSyncAt: null,
    lastSyncStatus: 'NEVER_SYNCED',
    lastSyncError: null,
    syncCursor: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
let mockEmailMessages = []
let mockEmailAutomationRules = [
  {
    id: 'rule-lead-created',
    event: 'lead.created',
    title: 'New Lead / Inquiry Notification',
    description: 'Sends confirmation auto-reply to client and alert to internal team.',
    templateId: 'lead_inquiry_confirmation',
    internalRouting: 'info@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rule-quote-created',
    event: 'quote.created',
    title: 'Quote Request Confirmation',
    description: 'Detailed quotation received confirmation with SLA timeline.',
    templateId: 'quote_request_confirmation',
    internalRouting: 'sales@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rule-proposal-sent',
    event: 'proposal.sent',
    title: 'Project Proposal Delivery',
    description: 'Delivers project proposal and scope breakdown to client.',
    templateId: 'proposal_email',
    internalRouting: 'sales@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: false,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rule-project-kickoff',
    event: 'project.kickoff',
    title: 'Project Kickoff / Milestone Update',
    description: 'Notifies client on project kickoff or major milestone advancement.',
    templateId: 'project_kickoff_update',
    internalRouting: 'projects@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rule-ticket-created',
    event: 'ticket.created',
    title: 'Support Ticket Receipt Confirmation',
    description: 'Sends ticket ID and confirmation to client upon helpdesk submission.',
    templateId: 'support_ticket_confirmation',
    internalRouting: 'support@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rule-ticket-reply',
    event: 'ticket.reply',
    title: 'Support Ticket Update / Staff Reply',
    description: 'Notifies client when staff posts a response to their support ticket.',
    templateId: 'support_ticket_reply',
    internalRouting: 'support@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: false,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rule-invoice-created',
    event: 'invoice.created',
    title: 'Milestone Invoice Issued',
    description: 'Dispatches billing milestone invoice link and payment instructions.',
    templateId: 'invoice_email',
    internalRouting: 'billing@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: false,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rule-payment-verified',
    event: 'payment.verified',
    title: 'Verified Payment Receipt',
    description: 'Official payment receipt and confirmation of milestone settlement.',
    templateId: 'verified_payment_confirmation',
    internalRouting: 'billing@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rule-careers-applied',
    event: 'careers.applied',
    title: 'Careers Application Received',
    description: 'Confirms application receipt to candidate and alerts HR/recruiting.',
    templateId: 'careers_application_confirmation',
    internalRouting: 'careers@snaptech.digital',
    sendCustomerCopy: true,
    sendInternalAlert: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]


let mockBlogPosts = [
  {
    id: 'hp-blog-1',
    title: "Why We Built SnapTech Digital: Shifting Rajasthan's Businesses to Enterprise IT",
    slug: 'why-we-built-snaptech-digital-enterprise-it',
    excerpt: "In today's digital-first economy, we built SnapTech Digital to bridge the gap between legacy paper workflows and high-performance custom software for businesses in Rajasthan and beyond.",
    content: '<h2>Bridging the Digital Gap in Local Markets</h2><p>SnapTech Digital was founded to bring enterprise software to Rajasthan.</p>',
    featuredImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    category: 'Company News',
    tags: ['SnapTech Digital', 'mission', 'custom software'],
    authorName: 'SnapTech Digital Team',
    status: 'PUBLISHED',
    isFeatured: true,
    publishedAt: new Date('2026-07-08'),
    viewCount: 152,
    createdAt: new Date('2026-07-08'),
    updatedAt: new Date('2026-07-08'),
  },
  {
    id: 'hp-blog-2',
    title: 'What We Build: A Deep Dive into Our Core IT Services & Digital Solutions',
    slug: 'what-we-build-core-it-services-digital-solutions',
    excerpt: 'Discover what we build. From responsive corporate portals to custom ERP inventory systems and mobile dashboards, we design custom systems that scale.',
    content: '<h2>A Full-Suite Software Engineering Partner</h2><p>Our capabilities span custom web applications, specialized business ERP systems, and high-converting marketing platforms.</p>',
    featuredImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    category: 'Web Development',
    tags: ['custom web apps', 'ERP', 'mobile apps'],
    authorName: 'SnapTech Digital Team',
    status: 'PUBLISHED',
    isFeatured: false,
    publishedAt: new Date('2026-07-08'),
    viewCount: 98,
    createdAt: new Date('2026-07-08'),
    updatedAt: new Date('2026-07-08'),
  },
  {
    id: 'hp-blog-intro-01',
    title: 'Getting to Know SnapTech Digital: Our Approach to Digital Solutions',
    slug: 'getting-to-know-snaptech-digital',
    excerpt: 'Get to know SnapTech Digital, the dedicated technology division of Hindustan Projects Group. Learn what we build, who we serve, and how our engineering-first approach helps businesses scale with custom digital solutions.',
    content: `<p class="lead text-lg text-slate-700 leading-relaxed font-normal mb-6">
In an era where modern businesses operate in an increasingly connected economy, having a dependable, high-performance digital foundation is essential to sustainable growth. Yet, for many growing enterprises and regional leaders, finding a technology partner that unites elite engineering discipline with transparent, long-term accountability remains a persistent challenge.
</p>

<p class="text-slate-600 leading-relaxed mb-6">
Too often, business owners find themselves caught between two unsatisfactory options: distant metropolitan agencies charging exorbitant retainer fees with minimal responsiveness, or low-cost freelancers relying on fragile website templates that break under real operational demand. <strong>SnapTech Digital</strong> was established to change this equation.
</p>

<h2>What Is SnapTech Digital?</h2>
<p class="text-slate-600 leading-relaxed mb-6">
<strong>SnapTech Digital</strong> is the dedicated technology and digital solutions division of <a href="https://www.hindustanprojects.in" target="_blank" rel="noopener noreferrer" class="text-brand-blue font-semibold hover:underline">Hindustan Projects Group</a>. Headquartered in the industrial center of Bhilwara, Rajasthan, we design, develop, deploy, and maintain mission-critical digital systems for businesses across India.
</p>
<p class="text-slate-600 leading-relaxed mb-6">
Our mission is straightforward: to engineer custom, high-speed software, web applications, mobile platforms, and enterprise cloud architectures that eliminate operational bottlenecks, strengthen brand authority, and generate measurable commercial value. We do not operate as an outsourced vendor that hands off code and disappears; we act as a permanent technology partner dedicated to our clients' ongoing expansion.
</p>

<h2>Our Corporate Foundation: Startup Agility Backed by Corporate Stability</h2>
<p class="text-slate-600 leading-relaxed mb-6">
One of the defining strengths of SnapTech Digital is our institutional heritage. While our engineering culture embodies the speed, modern toolchains, and user-centric focus of an agile software studio, we are backed by the corporate governance, financial stability, and long-term commitment of <strong>Hindustan Projects Group</strong>.
</p>
<p class="text-slate-600 leading-relaxed mb-6">
For our clients, this backing provides genuine peace of mind. Technology investments require permanence; you need the confidence that the firm building your customer portal, e-commerce backend, or internal infrastructure will be here for years to come. This corporate stability allows us to guarantee:
</p>
<ul class="list-disc list-inside space-y-2 mb-6 text-slate-600">
  <li><strong>100% Code and IP Ownership:</strong> Every line of custom code, design token, database migration, and architecture schematic belongs completely to you upon project handover.</li>
  <li><strong>Deterministic Milestones:</strong> Transparent delivery timelines structured into clear sprints with documented deliverables and zero hidden maintenance charges.</li>
  <li><strong>Zero Technical Debt:</strong> Modular, scalable architectures engineered using modern standards (React, Node.js, PostgreSQL) rather than proprietary locked-in templates.</li>
  <li><strong>Enterprise Uptime SLA:</strong> Dependable cloud architecture and proactive server monitoring backed by high availability standards.</li>
</ul>

<h2>Who We Serve: Powering Growth for Regional Leaders and Ambitious Brands</h2>
<p class="text-slate-600 leading-relaxed mb-6">
From our engineering center in Bhilwara, we serve a dynamic portfolio of clients ranging from regional industrial powerhouses to modern digital-first brands across Rajasthan (including Jaipur, Udaipur, and Jodhpur) and Pan-India:
</p>
<ul class="list-disc list-inside space-y-3 mb-6 text-slate-600">
  <li><strong>Industrial & Manufacturing Enterprises:</strong> We assist heavy manufacturing units—such as Bhilwara's renowned textile weaving mills, yarn processors, and Rajasthan's marble exporters—in transitioning from manual paper ledgers to integrated web ERPs, automated inventory tracking, and international showcase portals.</li>
  <li><strong>Direct-to-Consumer & Retail Brands:</strong> We build conversion-optimized storefronts and custom e-commerce channels with seamless Indian payment gateway integrations (UPI, NetBanking, cards) that allow merchants to sell directly to buyers without heavy aggregator commissions.</li>
  <li><strong>Logistics & Fleet Operators:</strong> We develop mission-critical telemetry portals and cross-platform mobile apps that track consignments, driver dispatches, and digital proof-of-delivery receipts in real time.</li>
  <li><strong>Professional Services & Growing Companies:</strong> We engineer modern corporate websites and customer self-service portals that establish instant credibility, load in sub-second speeds, and capture high-intent inquiries.</li>
</ul>

<h2>The Problems We Address: Moving Away from Fragile Templates</h2>
<p class="text-slate-600 leading-relaxed mb-6">
In today's competitive landscape, many companies still rely on off-the-shelf WordPress themes, bloated plugins, or generic website builders. While these seem economical initially, they create serious long-term liabilities:
</p>
<ul class="list-disc list-inside space-y-2 mb-6 text-slate-600">
  <li><strong>Sluggish Page Performance:</strong> Excessive plugin bloat results in slow loading speeds that fail Google Core Web Vitals and drive away mobile visitors.</li>
  <li><strong>Security Vulnerabilities:</strong> Outdated third-party themes and unmaintained plugins represent the most common attack vector for web intrusions and data leaks.</li>
  <li><strong>Inflexible Workflows:</strong> Pre-built templates force businesses to alter their real-world operations to fit software constraints, rather than adapting the software to fit the business.</li>
  <li><strong>Vendor Lock-In:</strong> Clients often find they do not own their database or codebase, leaving them vulnerable if their previous developer becomes unresponsive.</li>
</ul>
<p class="text-slate-600 leading-relaxed mb-6">
At SnapTech Digital, we eliminate these liabilities by building purpose-engineered digital solutions tailored precisely to your operational workflow.
</p>

<h2>Our Core Capabilities: Verified Digital Solutions</h2>
<p class="text-slate-600 leading-relaxed mb-6">
We offer a comprehensive suite of digital engineering, design, and strategic advisory services. Each solution is built by experienced specialists focused on performance, security, and measurable ROI:
</p>

<h3>1. Custom Web Development</h3>
<p class="text-slate-600 leading-relaxed mb-4">
We build custom, high-speed corporate websites, customer portals, and internal business dashboards using modern frameworks including React, Next.js, Node.js, and PostgreSQL. Every project is crafted from scratch with responsive grid systems, Google Core Web Vitals optimization, and robust administrative controls. Explore our <a href="/services/web-development" class="text-brand-blue font-semibold hover:underline">Custom Web Development services</a> to learn more.
</p>

<h3>2. Mobile App Development</h3>
<p class="text-slate-600 leading-relaxed mb-4">
We create intuitive cross-platform mobile applications for iOS and Android using React Native and Flutter. From secure authentication and offline data synchronization to push notifications and store submission on Apple App Store and Google Play Console, we deliver native-grade mobile experiences from a unified codebase. Discover our <a href="/services/mobile-app-development" class="text-brand-blue font-semibold hover:underline">Mobile App Development services</a>.
</p>

<h3>3. Digital Marketing & Technical SEO</h3>
<p class="text-slate-600 leading-relaxed mb-4">
A high-performance web platform must be discoverable by high-intent customers. We provide technical SEO audits, Google Business Profile local search ranking, Google Ads (PPC), and Meta advertising campaigns, backed by transparent conversion tracking in Google Analytics 4. View our <a href="/services/digital-marketing-seo" class="text-brand-blue font-semibold hover:underline">Digital Marketing & SEO solutions</a>.
</p>

<h3>4. E-Commerce Solutions</h3>
<p class="text-slate-600 leading-relaxed mb-4">
We engineer turnkey digital storefronts, customized Shopify setups, and bespoke React e-commerce architectures featuring fast product discovery, frictionless checkout flows, Razorpay and Stripe payment gateway integration, automated GST calculation, and instant order notifications. Learn about our <a href="/services/ecommerce-solutions" class="text-brand-blue font-semibold hover:underline">E-Commerce Solutions</a>.
</p>

<h3>5. Cloud Solutions & DevOps</h3>
<p class="text-slate-600 leading-relaxed mb-4">
We help organizations migrate to dependable, scalable cloud infrastructure on AWS, Google Cloud, and DigitalOcean. Our DevOps team configures containerized Docker workloads, automated CI/CD continuous deployment pipelines, encrypted daily backups, and server hardening to maintain 99.9% uptime. Explore our <a href="/services/cloud-solutions-devops" class="text-brand-blue font-semibold hover:underline">Cloud & DevOps services</a>.
</p>

<h3>6. Branding & UI/UX Design</h3>
<p class="text-slate-600 leading-relaxed mb-4">
A cohesive visual presence builds immediate confidence with buyers and partners. Our design team creates corporate visual identities, scalable vector logos, design tokens, and clickable, interactive Figma prototypes that validate user journeys before engineering begins. View our <a href="/services/branding-ui-ux-design" class="text-brand-blue font-semibold hover:underline">Branding & UI/UX Design services</a>.
</p>

<h3>7. IT Consulting & Strategic Advisory</h3>
<p class="text-slate-600 leading-relaxed mb-4">
For enterprises evaluating software upgrades or navigating vendor proposals, we offer independent, vendor-neutral technology consulting. We audit legacy systems, identify performance bottlenecks and security risks, and chart realistic digital transformation roadmaps aligned with your budget. Discover our <a href="/services/it-consulting-strategy" class="text-brand-blue font-semibold hover:underline">IT Consulting & Strategy advisory</a>.
</p>

<h2>Our Collaborative Methodology: How We Bring Ideas to Life</h2>
<p class="text-slate-600 leading-relaxed mb-6">
We believe software development should be transparent, predictable, and devoid of confusing jargon. Our engagements follow a proven four-stage lifecycle:
</p>
<ol class="list-decimal list-inside space-y-3 mb-6 text-slate-600">
  <li><strong>Discovery & Scoping:</strong> We meet with your leadership team to define key business objectives, functional workflows, and technical constraints, documenting clear specifications and milestone agreements.</li>
  <li><strong>Architecture & UI/UX Prototyping:</strong> Before writing code, we deliver responsive wireframes and interactive Figma flows, refining layouts until you are fully satisfied with the visual experience.</li>
  <li><strong>Modular Development & Testing:</strong> Our engineers build your solution using modular, documented code, conducting cross-browser performance audits, mobile screen tests, and security validations.</li>
  <li><strong>Deployment & Knowledge Transfer:</strong> We manage server configurations, SSL security, and domain launch, followed by comprehensive administrative training and 30-day post-launch support.</li>
</ol>

<h2>Begin Your Digital Transformation With SnapTech Digital</h2>
<p class="text-slate-600 leading-relaxed mb-6">
Whether you are an established industrial enterprise modernizing legacy operations, an ambitious merchant launching a direct-to-consumer e-commerce brand, or a growing business seeking a trusted technology partner, SnapTech Digital is ready to collaborate.
</p>
<p class="text-slate-600 leading-relaxed mb-6">
Explore our verified case studies on our <a href="/portfolio" class="text-brand-blue font-semibold hover:underline">Portfolio page</a>, browse our full range of <a href="/services" class="text-brand-blue font-semibold hover:underline">IT Services</a>, or contact our engineering team directly to schedule a project consultation.
</p>

<div class="bg-blue-50 border border-blue-200/80 rounded-2xl p-6 my-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
  <div>
    <h3 class="text-lg font-bold text-slate-900 font-heading mb-1">Ready to discuss your project?</h3>
    <p class="text-sm text-slate-600">Schedule an introductory consultation with our technical team in Bhilwara or connect with us online.</p>
  </div>
  <a href="/contact" class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all shrink-0">
    Get in Touch
  </a>
</div>`,
    featuredImageUrl: '/images/snaptech-digital-introduction-hero.webp',
    category: 'Company News',
    tags: ['SnapTech Digital', 'About Us', 'Custom Software', 'Web Development', 'Digital Solutions', 'Bhilwara IT'],
    authorName: 'SnapTech Digital Team',
    status: 'DRAFT',
    isFeatured: true,
    publishedAt: null,
    metaTitle: 'Getting to Know SnapTech Digital: Our Approach to Digital Solutions',
    metaDescription: 'Discover SnapTech Digital, the technology division of Hindustan Projects Group in Bhilwara, Rajasthan. Learn about our custom software, web, mobile, and cloud solutions.',
    viewCount: 0,
    createdAt: new Date('2026-10-20T10:00:00.000Z'),
    updatedAt: new Date('2026-10-20T10:00:00.000Z'),
  },
]

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
      mockBlogPosts,
      mockEmailLogs,
      mockEmailAccounts,
      mockEmailMessages,
      mockEmailAutomationRules,
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
      if (data.mockBlogPosts) {
        mockBlogPosts = data.mockBlogPosts.map((b) => ({
          ...b,
          publishedAt: b.publishedAt ? new Date(b.publishedAt) : null,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
        }))
      }
      if (data.mockEmailLogs) {
        mockEmailLogs = data.mockEmailLogs.map((l) => ({
          ...l,
          createdAt: new Date(l.createdAt),
          updatedAt: new Date(l.updatedAt),
        }))
      }
      if (data.mockEmailAccounts && Array.isArray(data.mockEmailAccounts) && data.mockEmailAccounts.length > 0) {
        mockEmailAccounts = data.mockEmailAccounts.map((a) => ({
          ...a,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
        }))
      }
      if (data.mockEmailMessages && Array.isArray(data.mockEmailMessages)) {
        mockEmailMessages = data.mockEmailMessages.map((m) => ({
          ...m,
          receivedAt: new Date(m.receivedAt),
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
        }))
      }
      if (data.mockEmailAutomationRules && Array.isArray(data.mockEmailAutomationRules) && data.mockEmailAutomationRules.length > 0) {
        mockEmailAutomationRules = data.mockEmailAutomationRules.map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
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
      content: `<h2>1. Services Rendered</h2><p>SnapTech Digital provides custom software, web development, digital marketing, and IT consulting services. All projects are subject to agreed milestones and deliverables.</p><h2>2. Payments & Fees</h2><p>Invoices are generated based on the project scope and payment schedule. Payments must be made within the specified timeframes to avoid service suspension.</p><h2>3. Intellectual Property</h2><p>Upon final payment, the ownership of the custom code and deliverables is transferred to the client, while we retain rights to reusable modules.</p>`,
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
  },
  deleteMany: async (args) => {
    if (!args || !args.where) {
      const count = mockErrorLogs.length
      mockErrorLogs = []
      saveMockDb()
      return { count }
    }
    const before = mockErrorLogs.length
    if (args.where.createdAt?.lt) {
      const cutoff = new Date(args.where.createdAt.lt)
      mockErrorLogs = mockErrorLogs.filter((e) => new Date(e.createdAt) >= cutoff)
    } else if (args.where.id) {
      mockErrorLogs = mockErrorLogs.filter((e) => e.id !== args.where.id)
    }
    saveMockDb()
    return { count: before - mockErrorLogs.length }
  },
}

mockPrisma.pageVisit = {
  findMany: async (args) => {
    let list = mockPageVisits
    // Sort newest first
    list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return applyPagination(list, args)
  },
  count: async () => mockPageVisits.length,
  create: async (args) => {
    const item = {
      id: `visit-${Date.now()}`,
      createdAt: new Date(),
      ...args.data,
    }
    mockPageVisits.push(item)
    saveMockDb()
    return item
  },
  deleteMany: async (args) => {
    if (!args || !args.where) {
      const count = mockPageVisits.length
      mockPageVisits = []
      saveMockDb()
      return { count }
    }
    const before = mockPageVisits.length
    if (args.where.createdAt?.lt) {
      const cutoff = new Date(args.where.createdAt.lt)
      mockPageVisits = mockPageVisits.filter((v) => new Date(v.createdAt) >= cutoff)
    }
    saveMockDb()
    return { count: before - mockPageVisits.length }
  },
}

mockPrisma.blogPost = {
  findMany: async (args) => {
    let list = mockBlogPosts
    if (args?.where?.status) list = list.filter((b) => b.status === args.where.status)
    if (args?.where?.category) list = list.filter((b) => b.category === args.where.category)
    return applyPagination(list, args)
  },
  findUnique: async (args) =>
    mockBlogPosts.find((b) => b.id === args.where?.id || b.slug === args.where?.slug) || null,
  count: async () => mockBlogPosts.length,
  create: async (args) => {
    const item = {
      id: `blog-${Date.now()}`,
      status: 'PUBLISHED',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...args.data,
    }
    mockBlogPosts.push(item)
    saveMockDb()
    return item
  },
  update: async (args) => {
    const idx = mockBlogPosts.findIndex((b) => b.id === args.where.id || b.slug === args.where.slug)
    if (idx !== -1) {
      mockBlogPosts[idx] = { ...mockBlogPosts[idx], ...args.data, updatedAt: new Date() }
      saveMockDb()
      return mockBlogPosts[idx]
    }
    throw new Error('BlogPost not found')
  },
  delete: async (args) => {
    const idx = mockBlogPosts.findIndex((b) => b.id === args.where.id || b.slug === args.where.slug)
    if (idx !== -1) {
      const deleted = mockBlogPosts[idx]
      mockBlogPosts = mockBlogPosts.filter((b) => b.id !== args.where.id && b.slug !== args.where.slug)
      saveMockDb()
      return deleted
    }
    throw new Error('BlogPost not found')
  },
}

mockPrisma.emailLog = {
  findMany: async (args) => {
    let list = [...mockEmailLogs]
    if (args?.where) {
      if (args.where.recipient) {
        if (typeof args.where.recipient === 'string') {
          list = list.filter((l) => l.recipient.toLowerCase() === args.where.recipient.toLowerCase())
        } else if (args.where.recipient.contains) {
          const q = args.where.recipient.contains.toLowerCase()
          list = list.filter((l) => l.recipient.toLowerCase().includes(q))
        }
      }
      if (args.where.status) {
        list = list.filter((l) => l.status === args.where.status)
      }
      if (args.where.event) {
        list = list.filter((l) => l.event === args.where.event)
      }
      if (args.where.createdAt) {
        if (args.where.createdAt.gte) {
          const gte = new Date(args.where.createdAt.gte)
          list = list.filter((l) => new Date(l.createdAt) >= gte)
        }
        if (args.where.createdAt.lte) {
          const lte = new Date(args.where.createdAt.lte)
          list = list.filter((l) => new Date(l.createdAt) <= lte)
        }
      }
    }
    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return applyPagination(list, args)
  },
  findUnique: async (args) =>
    mockEmailLogs.find(
      (l) =>
        (args.where?.id && l.id === args.where.id) ||
        (args.where?.idempotencyKey && l.idempotencyKey === args.where.idempotencyKey)
    ) || null,
  findFirst: async (args) => {
    let list = [...mockEmailLogs]
    if (args?.where) {
      if (args.where.idempotencyKey) {
        list = list.filter((l) => l.idempotencyKey === args.where.idempotencyKey)
      }
      if (args.where.recipient) {
        list = list.filter((l) => l.recipient.toLowerCase() === args.where.recipient.toLowerCase())
      }
      if (args.where.event) {
        list = list.filter((l) => l.event === args.where.event)
      }
      if (args.where.createdAt?.gte) {
        const gte = new Date(args.where.createdAt.gte)
        list = list.filter((l) => new Date(l.createdAt) >= gte)
      }
    }
    return list[0] || null
  },
  count: async (args) => {
    let list = [...mockEmailLogs]
    if (args?.where) {
      if (args.where.status) list = list.filter((l) => l.status === args.where.status)
      if (args.where.event) list = list.filter((l) => l.event === args.where.event)
      if (args.where.createdAt?.gte) {
        const gte = new Date(args.where.createdAt.gte)
        list = list.filter((l) => new Date(l.createdAt) >= gte)
      }
    }
    return list.length
  },
  create: async (args) => {
    const item = {
      id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      status: 'SENT',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...args.data,
    }
    mockEmailLogs.unshift(item)
    saveMockDb()
    return item
  },
  update: async (args) => {
    const idx = mockEmailLogs.findIndex((l) => l.id === args.where.id)
    if (idx !== -1) {
      mockEmailLogs[idx] = { ...mockEmailLogs[idx], ...args.data, updatedAt: new Date() }
      saveMockDb()
      return mockEmailLogs[idx]
    }
    throw new Error('EmailLog not found')
  },
  deleteMany: async () => {
    const count = mockEmailLogs.length
    mockEmailLogs = []
    saveMockDb()
    return { count }
  },
}

mockPrisma.emailAutomationRule = {
  findMany: async (args) => {
    let list = [...mockEmailAutomationRules]
    if (args?.where?.isEnabled !== undefined) {
      list = list.filter((r) => r.isEnabled === args.where.isEnabled)
    }
    return list
  },
  findUnique: async (args) =>
    mockEmailAutomationRules.find(
      (r) =>
        (args.where?.id && r.id === args.where.id) ||
        (args.where?.event && r.event === args.where.event)
    ) || null,
  findFirst: async (args) =>
    mockEmailAutomationRules.find(
      (r) =>
        (args.where?.id && r.id === args.where.id) ||
        (args.where?.event && r.event === args.where.event)
    ) || null,
  update: async (args) => {
    const idx = mockEmailAutomationRules.findIndex(
      (r) =>
        (args.where.id && r.id === args.where.id) ||
        (args.where.event && r.event === args.where.event)
    )
    if (idx !== -1) {
      mockEmailAutomationRules[idx] = {
        ...mockEmailAutomationRules[idx],
        ...args.data,
        updatedAt: new Date(),
      }
      saveMockDb()
      return mockEmailAutomationRules[idx]
    }
    throw new Error('EmailAutomationRule not found')
  },
  upsert: async (args) => {
    const idx = mockEmailAutomationRules.findIndex(
      (r) =>
        (args.where.id && r.id === args.where.id) ||
        (args.where.event && r.event === args.where.event)
    )
    if (idx !== -1) {
      mockEmailAutomationRules[idx] = {
        ...mockEmailAutomationRules[idx],
        ...args.update,
        updatedAt: new Date(),
      }
      saveMockDb()
      return mockEmailAutomationRules[idx]
    }
    const item = {
      id: `rule-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...args.create,
    }
    mockEmailAutomationRules.push(item)
    saveMockDb()
    return item
  },
  count: async () => mockEmailAutomationRules.length,
}

mockPrisma.emailAccount = {
  findMany: async (args) => {
    let list = [...mockEmailAccounts]
    if (args?.where) {
      if (args.where.isActive !== undefined) {
        list = list.filter((a) => a.isActive === args.where.isActive)
      }
      if (args.where.provider) {
        list = list.filter((a) => a.provider === args.where.provider)
      }
      if (args.where.isDefaultSender !== undefined) {
        list = list.filter((a) => a.isDefaultSender === args.where.isDefaultSender)
      }
    }
    return applyPagination(list, args)
  },
  findUnique: async (args) =>
    mockEmailAccounts.find(
      (a) =>
        (args.where?.id && a.id === args.where.id) ||
        (args.where?.email && a.email.toLowerCase() === args.where.email.toLowerCase())
    ) || null,
  findFirst: async (args) => {
    let list = [...mockEmailAccounts]
    if (args?.where) {
      if (args.where.id) {
        list = list.filter((a) => a.id === args.where.id)
      }
      if (args.where.email) {
        list = list.filter((a) => a.email.toLowerCase() === args.where.email.toLowerCase())
      }
      if (args.where.isDefaultSender !== undefined) {
        list = list.filter((a) => a.isDefaultSender === args.where.isDefaultSender)
      }
      if (args.where.isActive !== undefined) {
        list = list.filter((a) => a.isActive === args.where.isActive)
      }
      if (args.where.department) {
        list = list.filter((a) => a.department === args.where.department)
      }
    }
    return list[0] || null
  },
  count: async (args) => {
    let list = [...mockEmailAccounts]
    if (args?.where) {
      if (args.where.isActive !== undefined) {
        list = list.filter((a) => a.isActive === args.where.isActive)
      }
    }
    return list.length
  },
  create: async (args) => {
    const item = {
      id: `acct-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isActive: true,
      isDefaultSender: false,
      enquiryTypes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...args.data,
    }
    // If set as default sender, unset others
    if (item.isDefaultSender) {
      mockEmailAccounts.forEach((a) => {
        a.isDefaultSender = false
      })
    }
    mockEmailAccounts.push(item)
    saveMockDb()
    return item
  },
  update: async (args) => {
    const idx = mockEmailAccounts.findIndex(
      (a) =>
        (args.where?.id && a.id === args.where.id) ||
        (args.where?.email && a.email.toLowerCase() === args.where.email.toLowerCase())
    )
    if (idx !== -1) {
      if (args.data.isDefaultSender) {
        mockEmailAccounts.forEach((a) => {
          a.isDefaultSender = false
        })
      }
      mockEmailAccounts[idx] = {
        ...mockEmailAccounts[idx],
        ...args.data,
        updatedAt: new Date(),
      }
      saveMockDb()
      return mockEmailAccounts[idx]
    }
    throw new Error('EmailAccount not found')
  },
  delete: async (args) => {
    const idx = mockEmailAccounts.findIndex(
      (a) =>
        (args.where?.id && a.id === args.where.id) ||
        (args.where?.email && a.email.toLowerCase() === args.where.email.toLowerCase())
    )
    if (idx !== -1) {
      const deleted = mockEmailAccounts[idx]
      mockEmailAccounts = mockEmailAccounts.filter((a) => a.id !== deleted.id)
      saveMockDb()
      return deleted
    }
    throw new Error('EmailAccount not found')
  },
  upsert: async (args) => {
    const idx = mockEmailAccounts.findIndex(
      (a) =>
        (args.where?.id && a.id === args.where.id) ||
        (args.where?.email && a.email.toLowerCase() === args.where.email.toLowerCase())
    )
    if (idx !== -1) {
      mockEmailAccounts[idx] = {
        ...mockEmailAccounts[idx],
        ...args.update,
        updatedAt: new Date(),
      }
      saveMockDb()
      return mockEmailAccounts[idx]
    }
    const item = {
      id: `acct-${Date.now()}`,
      isActive: true,
      isDefaultSender: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...args.create,
    }
    mockEmailAccounts.push(item)
    saveMockDb()
    return item
  },
  updateMany: async (args) => {
    let count = 0
    mockEmailAccounts.forEach((a) => {
      let matches = true
      if (args?.where?.isDefaultSender !== undefined && a.isDefaultSender !== args.where.isDefaultSender) {
        matches = false
      }
      if (args?.where?.id && typeof args.where.id === 'object' && args.where.id.not && a.id === args.where.id.not) {
        matches = false
      }
      if (matches) {
        Object.assign(a, args.data, { updatedAt: new Date() })
        count++
      }
    })
    saveMockDb()
    return { count }
  },
  deleteMany: async () => {
    const count = mockEmailAccounts.length
    mockEmailAccounts = []
    saveMockDb()
    return { count }
  },
}

mockPrisma.emailMessage = {
  findMany: async (args) => {
    let list = [...mockEmailMessages]
    if (args?.where) {
      if (args.where.accountId) {
        list = list.filter((m) => m.accountId === args.where.accountId)
      }
      if (args.where.folder) {
        list = list.filter((m) => m.folder === args.where.folder)
      }
      if (args.where.direction) {
        list = list.filter((m) => m.direction === args.where.direction)
      }
      if (args.where.isRead !== undefined) {
        list = list.filter((m) => m.isRead === args.where.isRead)
      }
      if (args.where.isArchived !== undefined) {
        list = list.filter((m) => m.isArchived === args.where.isArchived)
      }
      if (args.where.leadId) {
        list = list.filter((m) => m.leadId === args.where.leadId)
      }
      if (args.where.threadId) {
        list = list.filter((m) => m.threadId === args.where.threadId)
      }
      if (args.where.fromEmail) {
        if (typeof args.where.fromEmail === 'string') {
          list = list.filter((m) => m.fromEmail.toLowerCase() === args.where.fromEmail.toLowerCase())
        } else if (args.where.fromEmail.contains) {
          const q = args.where.fromEmail.contains.toLowerCase()
          list = list.filter((m) => m.fromEmail.toLowerCase().includes(q))
        }
      }
      if (args.where.subject && args.where.subject.contains) {
        const q = args.where.subject.contains.toLowerCase()
        list = list.filter((m) => m.subject.toLowerCase().includes(q))
      }
    }
    // Sort newest first
    list.sort((a, b) => new Date(b.receivedAt || b.createdAt) - new Date(a.receivedAt || a.createdAt))
    return applyPagination(list, args)
  },
  findUnique: async (args) =>
    mockEmailMessages.find(
      (m) =>
        (args.where?.id && m.id === args.where.id) ||
        (args.where?.messageId && m.messageId === args.where.messageId)
    ) || null,
  findFirst: async (args) => {
    let list = [...mockEmailMessages]
    if (args?.where) {
      if (args.where.accountId && args.where.providerUid) {
        list = list.filter(
          (m) => m.accountId === args.where.accountId && String(m.providerUid) === String(args.where.providerUid)
        )
      }
      if (args.where.messageId) {
        list = list.filter((m) => m.messageId === args.where.messageId)
      }
      if (args.where.threadId) {
        list = list.filter((m) => m.threadId === args.where.threadId)
      }
      if (args.where.leadId) {
        list = list.filter((m) => m.leadId === args.where.leadId)
      }
    }
    return list[0] || null
  },
  count: async (args) => {
    let list = [...mockEmailMessages]
    if (args?.where) {
      if (args.where.accountId) list = list.filter((m) => m.accountId === args.where.accountId)
      if (args.where.folder) list = list.filter((m) => m.folder === args.where.folder)
      if (args.where.direction) list = list.filter((m) => m.direction === args.where.direction)
      if (args.where.isRead !== undefined) list = list.filter((m) => m.isRead === args.where.isRead)
      if (args.where.isArchived !== undefined) list = list.filter((m) => m.isArchived === args.where.isArchived)
    }
    return list.length
  },
  create: async (args) => {
    const item = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      direction: 'INBOUND',
      folder: 'INBOX',
      isRead: false,
      isArchived: false,
      isStarred: false,
      hasAttachments: false,
      deliveryStatus: 'DELIVERED',
      receivedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...args.data,
    }
    mockEmailMessages.unshift(item)
    saveMockDb()
    return item
  },
  createMany: async (args) => {
    const items = (args.data || []).map((d) => ({
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      direction: 'INBOUND',
      folder: 'INBOX',
      isRead: false,
      isArchived: false,
      isStarred: false,
      hasAttachments: false,
      deliveryStatus: 'DELIVERED',
      receivedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...d,
    }))
    mockEmailMessages.unshift(...items)
    saveMockDb()
    return { count: items.length }
  },
  update: async (args) => {
    const idx = mockEmailMessages.findIndex((m) => m.id === args.where.id)
    if (idx !== -1) {
      mockEmailMessages[idx] = {
        ...mockEmailMessages[idx],
        ...args.data,
        updatedAt: new Date(),
      }
      saveMockDb()
      return mockEmailMessages[idx]
    }
    throw new Error('EmailMessage not found')
  },
  delete: async (args) => {
    const idx = mockEmailMessages.findIndex((m) => m.id === args.where.id)
    if (idx !== -1) {
      const deleted = mockEmailMessages[idx]
      mockEmailMessages = mockEmailMessages.filter((m) => m.id !== deleted.id)
      saveMockDb()
      return deleted
    }
    throw new Error('EmailMessage not found')
  },
  deleteMany: async () => {
    const count = mockEmailMessages.length
    mockEmailMessages = []
    saveMockDb()
    return { count }
  },
  updateMany: async (args) => {
    let count = 0
    mockEmailMessages.forEach((m) => {
      let matches = true
      if (args?.where?.fromEmail && m.fromEmail?.toLowerCase() !== args.where.fromEmail.toLowerCase()) {
        matches = false
      }
      if (args?.where?.leadId === null && m.leadId !== null) {
        matches = false
      }
      if (matches) {
        Object.assign(m, args.data, { updatedAt: new Date() })
        count++
      }
    })
    saveMockDb()
    return { count }
  },
}

// ── Smart Connection Resolver ───────────────────────────────
let activeClient = realPrisma

const isMockForced = process.env.USE_MOCK_DB === 'true'

if (isMockForced && process.env.NODE_ENV !== 'production') {
  console.log('🛡️ [Dev Isolation] USE_MOCK_DB=true. Live database connection bypassed. Using local mock_db.json safely.')
  activeClient = mockPrisma
} else {
  try {
    console.log('Checking database connection...')
    await realPrisma.$connect()
    console.log('Database connected successfully.')

    if (process.env.NODE_ENV !== 'production' && dbUrl?.includes('neon.tech')) {
      console.warn('⚠️ [SAFETY WARNING] Local server is connected to the LIVE Neon Database!')
      console.warn('⚠️ To isolate local development from live data, set USE_MOCK_DB=true in server/.env')
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ CRITICAL: Database connection failed in production mode:', e.message)
      process.exit(1)
    } else {
      console.warn('⚠️ Database is offline. Starting server in MOCK client mode.')
      activeClient = mockPrisma
    }
  }
}

export default activeClient

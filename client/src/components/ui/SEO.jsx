/* eslint-disable react-refresh/only-export-components */
/**
 * SEO.jsx — Complete Database-Connected SEO component
 * Handles: title, meta, OG, Twitter Cards, canonical, JSON-LD schemas
 * Supports: Organization, LocalBusiness, Service, FAQPage, BreadcrumbList, JobPosting
 * Canonical source of truth: Site Settings from DB -> Fallback safe technical defaults
 */
import { Helmet } from 'react-helmet-async'
import { useSiteSettings } from '@/hooks/useContent'

export const SITE = {
  name: 'SnapTech Digital',
  alternateName: 'SnapTech Digital — Web & App Development Agency',
  parentName: 'Hindustan Projects',
  parentUrl: 'https://www.hindustanprojects.in',
  url: 'https://www.snaptech.digital',
  description:
    'SnapTech Digital is a full-service digital agency based in Bhilwara, Rajasthan. We build enterprise websites, web apps, and mobile apps — and deliver digital marketing, SEO, and IT consulting services across India.',
  phone: '+91 8209604849',
  email: 'info@snaptech.digital',
  address: {
    street: 'Bhilwara',
    city: 'Bhilwara',
    state: 'Rajasthan',
    postalCode: '311001',
    country: 'IN',
  },
  geo: { lat: 25.3478, lng: 74.6367 },
  logo: 'https://www.snaptech.digital/snaptech-logo.png',
  ogImage: 'https://www.snaptech.digital/snaptech-social-banner.jpg',
  twitterHandle: '@snaptechdigital',
  founded: '2019',
  keywords:
    'SnapTech Digital, IT company Bhilwara, web development Rajasthan, mobile app development India, digital marketing, SEO services, web design agency, software company Rajasthan',
  sameAs: [
    'https://www.instagram.com/snaptechdigital',
    'https://www.facebook.com/snaptechdigital',
  ],
}

// ── JSON-LD Schemas ────────────────────────────────────────────

export function organizationSchema(cfg = {}) {
  const name = cfg.company_name || SITE.name
  const parentName = cfg.parent_company_name || SITE.parentName
  const parentUrl = cfg.parent_company_url || SITE.parentUrl
  const phone = cfg.phone || SITE.phone
  const email = cfg.email || SITE.email
  const logo = cfg.logo_url || SITE.logo

  const sameAs = [
    cfg.instagram || 'https://www.instagram.com/snaptechdigital',
    cfg.facebook || 'https://www.facebook.com/snaptechdigital',
    cfg.linkedin,
    cfg.twitter,
  ].filter((url) => Boolean(url) && url !== '#' && !url.includes('hindustan-projects'))

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name,
    alternateName: SITE.alternateName,
    url: SITE.url,
    logo: {
      '@type': 'ImageObject',
      url: logo,
    },
    parentOrganization: {
      '@type': 'Organization',
      name: parentName,
      url: parentUrl,
    },
    description: cfg.default_seo_description || SITE.description,
    foundingDate: SITE.founded,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phone,
      email,
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi'],
      areaServed: 'IN',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: cfg.address || SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    sameAs,
  }
}

export function localBusinessSchema(cfg = {}) {
  const name = cfg.company_name || SITE.name
  const phone = cfg.phone || SITE.phone
  const email = cfg.email || SITE.email
  const image = cfg.og_image_url || SITE.ogImage

  const sameAs = [
    cfg.instagram || 'https://www.instagram.com/snaptechdigital',
    cfg.facebook || 'https://www.facebook.com/snaptechdigital',
    cfg.linkedin,
  ].filter((url) => Boolean(url) && url !== '#' && !url.includes('hindustan-projects'))

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#localbusiness`,
    name,
    image,
    url: SITE.url,
    telephone: phone,
    email,
    description: cfg.default_seo_description || SITE.description,
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer, UPI',
    openingHours: 'Mo-Sa 09:00-18:00',
    address: {
      '@type': 'PostalAddress',
      streetAddress: cfg.address || SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.geo.lat,
      longitude: SITE.geo.lng,
    },
    hasMap: cfg.google_maps_url || `https://www.google.com/maps?q=${SITE.geo.lat},${SITE.geo.lng}`,
    knowsAbout: [
      'Custom Web Applications',
      'Native Mobile Apps (iOS & Android)',
      'Enterprise Cloud & DevOps',
      'AI Agents & Automation',
      'Custom ERP & CRM Platforms',
      'Technical SEO & Digital Growth',
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    areaServed: [
      { '@type': 'City', name: 'Bhilwara' },
      { '@type': 'State', name: 'Rajasthan' },
      { '@type': 'Country', name: 'India' },
    ],
    sameAs,
  }
}

export function websiteSchema(cfg = {}) {
  const name = cfg.company_name || SITE.name
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name,
    alternateName: SITE.alternateName,
    description: cfg.default_seo_description || SITE.description,
    inLanguage: 'en-IN',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', 'p'],
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/services?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function serviceSchema({ title, description, url, serviceType }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description,
    url,
    serviceType,
    provider: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: url,
    },
  }
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  }
}

export function jobPostingSchema(job) {
  if (!job) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || (job.responsibilities || []).join('\n') || '',
    datePosted: job.createdAt || new Date().toISOString(),
    validThrough: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: job.jobType || 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: SITE.name,
      sameAs: SITE.url,
      logo: SITE.logo,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: job.location || SITE.address.street,
        addressLocality: SITE.address.city,
        addressRegion: SITE.address.state,
        postalCode: SITE.address.postalCode,
        addressCountry: SITE.address.country,
      },
    },
  }
}

// ── Main SEO Component ─────────────────────────────────────────

export default function SEO({
  title,
  description,
  path = '',
  noIndex = false,
  ogType = 'website',
  ogImage,
  schemas = [],
  keywords,
  breadcrumbs,
}) {
  const { data: settingsData } = useSiteSettings()
  const cfg = settingsData?.data || {}

  const companyName = cfg.company_name || SITE.name
  const fullTitle = title
    ? title.includes(companyName)
      ? title
      : `${title} | ${companyName} — IT Services, Bhilwara`
    : (cfg.default_seo_title || `${companyName} — IT Services Company in Bhilwara, Rajasthan`)
    
  const desc = description || cfg.default_seo_description || SITE.description
  const canonical = `${SITE.url}${path}`
  const image = ogImage || cfg.og_image_url || SITE.ogImage

  // Default schemas on every page using live Site Settings
  const defaultSchemas = [organizationSchema(cfg), websiteSchema(cfg)]

  // Add LocalBusiness on home and contact pages
  if (path === '/' || path === '/contact') {
    defaultSchemas.push(localBusinessSchema(cfg))
  }

  // Add breadcrumb if provided
  if (breadcrumbs) {
    defaultSchemas.push(breadcrumbSchema(breadcrumbs))
  }

  const allSchemas = [...defaultSchemas, ...schemas.filter(Boolean)]

  return (
    <Helmet>
      {/* Basic */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={keywords || SITE.keywords} />
      <link rel="canonical" href={canonical} />
      <meta name="google-site-verification" content="aQTpp5twOD60d6OQNZbm3XraAC4f2siBbSk6r4RzVLM" />
      {noIndex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={companyName} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE.twitterHandle} />
      <meta name="twitter:creator" content={SITE.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Geo tags — Local SEO */}
      <meta name="geo.region" content="IN-RJ" />
      <meta name="geo.placename" content="Bhilwara, Rajasthan" />
      <meta name="geo.position" content={`${SITE.geo.lat};${SITE.geo.lng}`} />
      <meta name="ICBM" content={`${SITE.geo.lat}, ${SITE.geo.lng}`} />

      {/* JSON-LD schemas */}
      {allSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}

/* eslint-disable react-refresh/only-export-components */
/**
 * SEO.jsx — Complete SEO component
 * Handles: title, meta, OG, Twitter Cards, canonical, JSON-LD schemas
 * Supports: Organization, LocalBusiness, Service, FAQPage, BreadcrumbList
 */
import { Helmet } from 'react-helmet-async'

export const SITE = {
  name: 'Snaptech',
  alternateName: 'Snaptech — Technology Division of Hindustan Projects',
  parentName: 'Hindustan Projects',
  parentUrl: 'https://www.hindustanprojects.in',
  url: 'https://www.snaptech.digital',
  description:
    'Looking for IT Solutions? Search. Discover. Connect with Snaptech — the enterprise technology and digital innovation wing of Hindustan Projects Group. Custom Web Applications, Mobile Apps, Cloud & AI Automation.',
  phone: '+91 7597000601',
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
    'Snaptech, Hindustan Projects IT, IT solutions Bhilwara, web development Rajasthan, mobile app development India, cloud DevOps, AI automation, enterprise software, custom CRM',
  sameAs: [
    'https://www.instagram.com/hindustanprojects',
    'https://www.facebook.com/hindustanprojects',
    'https://pinterest.com/hindustanprojects',
    'https://www.linkedin.com/company/hindustan-projects',
  ],
}

// ── JSON-LD Schemas ────────────────────────────────────────────

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: SITE.alternateName,
    url: SITE.url,
    logo: {
      '@type': 'ImageObject',
      url: SITE.logo,
    },
    parentOrganization: {
      '@type': 'Organization',
      name: SITE.parentName,
      url: SITE.parentUrl,
    },
    description: SITE.description,
    foundingDate: SITE.founded,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE.phone,
      email: SITE.email,
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi'],
      areaServed: 'IN',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    sameAs: SITE.sameAs,
  }
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#localbusiness`,
    name: SITE.name,
    image: SITE.ogImage,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    description: SITE.description,
    priceRange: '$$',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer, UPI',
    openingHours: 'Mo-Sa 09:00-18:00',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
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
    hasMap: `https://www.google.com/maps?q=${SITE.geo.lat},${SITE.geo.lng}`,
    knowsAbout: [
      'Custom Web Applications',
      'Native Mobile Apps (iOS & Android)',
      'Enterprise Cloud & DevOps',
      'AI Agents & Automation',
      'Custom ERP & CRM Platforms',
      'Technical SEO & Digital Growth',
    ],
    areaServed: [
      { '@type': 'City', name: 'Bhilwara' },
      { '@type': 'State', name: 'Rajasthan' },
      { '@type': 'Country', name: 'India' },
    ],
    sameAs: SITE.sameAs,
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    alternateName: SITE.alternateName,
    description: SITE.description,
    inLanguage: 'en-IN',
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
  const fullTitle = title
    ? `${title} | ${SITE.name} — IT Services, Bhilwara`
    : `${SITE.name} — IT Services Company in Bhilwara, Rajasthan`
  const desc = description || SITE.description
  const canonical = `${SITE.url}${path}`
  const image = ogImage || SITE.ogImage

  // Default schemas on every page
  const defaultSchemas = [organizationSchema(), websiteSchema()]

  // Add LocalBusiness on home and contact pages
  if (path === '/' || path === '/contact') {
    defaultSchemas.push(localBusinessSchema())
  }

  // Add breadcrumb if provided
  if (breadcrumbs) {
    defaultSchemas.push(breadcrumbSchema(breadcrumbs))
  }

  const allSchemas = [...defaultSchemas, ...schemas]

  return (
    <Helmet>
      {/* Basic */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={keywords || SITE.keywords} />
      <link rel="canonical" href={canonical} />
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
      <meta property="og:site_name" content={SITE.name} />
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

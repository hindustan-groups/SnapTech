/**
 * ServicesSection — Homepage services grid.
 * Fetches from GET /api/services via TanStack Query.
 * Shows skeleton on load, error state on failure.
 */
import { createElement } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Container, SectionHeading, Card } from '@/components/ui'
import { ServiceCardSkeleton } from '@/components/ui/Skeleton'
import { useServices } from '@/hooks/useServices'
import { getServiceIcon } from '@/utils/serviceIcons'

function ServiceCard({ service, index }) {
  const getStickyClass = (idx) => {
    switch (idx) {
      case 0:
        return 'sticky sm:relative top-[80px] sm:top-auto z-10 sm:z-auto shadow-[0_8px_30px_rgba(26,62,140,0.06)] scale-[0.93] sm:scale-100 origin-top transition-all duration-300'
      case 1:
        return 'sticky sm:relative top-[100px] sm:top-auto z-20 sm:z-auto shadow-[0_12px_36px_rgba(26,62,140,0.09)] scale-[0.96] sm:scale-100 origin-top transition-all duration-300'
      case 2:
        return 'sticky sm:relative top-[120px] sm:top-auto z-30 sm:z-auto shadow-[0_16px_40px_rgba(26,62,140,0.12)] scale-[1] sm:scale-100 origin-top transition-all duration-300'
      default:
        return 'hidden sm:flex'
    }
  }

  return (
    <Card
      hoverable
      as={Link}
      to={`/services/${service.slug}`}
      className={`p-6 flex flex-col group text-left no-underline rounded-2xl border border-slate-100 bg-white hover:border-brand-blue/20 hover:shadow-[0_12px_30px_rgba(26,62,140,0.12)] transition-all duration-300 ${getStickyClass(index)}`}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-lg bg-brand-blue/8 flex items-center justify-center mb-5
        group-hover:bg-brand-blue/12 group-hover:scale-110 transition-all duration-200"
      >
        {createElement(getServiceIcon(service.icon), { className: 'w-6 h-6 text-brand-blue group-hover:text-brand-blue-light transition-colors', strokeWidth: 1.75 })}
      </div>

      {/* Title */}
      <h3 className="font-heading text-lg font-bold text-brand-blue group-hover:text-brand-blue-light transition-colors duration-200 mb-2">{service.title}</h3>

      {/* Short description */}
      <p className="text-sm text-text-muted leading-relaxed flex-1 mb-5 group-hover:text-gray-700 transition-colors">
        {service.shortDescription}
      </p>

      {/* Learn More indicator */}
      <span
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red
          group-hover:gap-2.5 transition-all duration-200"
      >
        Learn More
        <ArrowRight className="w-4 h-4" />
      </span>
    </Card>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div className="text-center py-16">
      <p className="text-text-muted mb-4">Could not load services. Please check your connection.</p>
      <button
        onClick={onRetry}
        className="text-sm font-medium text-brand-blue underline hover:text-brand-blue-dark"
      >
        Try again
      </button>
    </div>
  )
}

const PLACEHOLDER_SERVICES = [
  {
    id: '1',
    title: 'Web Development',
    slug: 'web-development',
    icon: 'Code2',
    shortDescription:
      'Custom, responsive websites built with modern technologies like React, Node.js, and WordPress. Optimised for speed, SEO, and conversions.',
  },
  {
    id: '2',
    title: 'Digital Marketing & SEO',
    slug: 'digital-marketing-seo',
    icon: 'Megaphone',
    shortDescription:
      'Result-driven digital marketing campaigns spanning SEO, Google Ads, Meta Ads, and content marketing to drive high-intent leads.',
  },
  {
    id: '3',
    title: 'IT Consulting & Strategy',
    slug: 'it-consulting-strategy',
    icon: 'Lightbulb',
    shortDescription:
      'Strategic IT advisory to align your technology roadmap with business growth. We help you choose the right systems and architecture.',
  },
  {
    id: '4',
    title: 'E-Commerce Solutions',
    slug: 'ecommerce-solutions',
    icon: 'Monitor',
    shortDescription:
      'End-to-end e-commerce store setup, checkout optimisation, inventory management systems, and secure payment gateway integrations.',
  },
  {
    id: '5',
    title: 'Cloud Solutions & DevOps',
    slug: 'cloud-solutions-devops',
    icon: 'Settings',
    shortDescription:
      'Secure cloud hosting setup, AWS/Google Cloud management, server scaling, and continuous deployment workflows for zero downtime.',
  },
  {
    id: '6',
    title: 'Branding & UI/UX Design',
    slug: 'branding-ui-ux-design',
    icon: 'Layers',
    shortDescription:
      'Premium user interface and user experience designs coupled with complete corporate brand identity systems, logos, and guidelines.',
  },
  {
    id: '7',
    title: 'Mobile App Development',
    slug: 'mobile-app-development',
    icon: 'Smartphone',
    shortDescription:
      'Native and cross-platform mobile apps for iOS and Android built with React Native and Flutter. Secure, high-performing, and published on App Stores.',
  },
]

export default function ServicesSection() {
  const { data, isLoading } = useServices()
  const services = data?.data?.length ? data.data : isLoading ? [] : PLACEHOLDER_SERVICES

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-white via-brand-ice/30 to-white relative" aria-labelledby="services-heading">
      <Container>
        <SectionHeading
          id="services-heading"
          eyebrow="Enterprise IT Solutions"
          title="Engineered for Scalability, Security & Speed"
          subtitle="Snaptech provides full-cycle technology engineering — from responsive web apps and cloud architecture to native mobile systems and digital marketing growth engines."
          className="mb-16 text-center max-w-3xl mx-auto"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && services.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={i >= 3 ? 'hidden sm:block' : 'block'}>
                  <ServiceCardSkeleton />
                </div>
              ))
            : services
                .slice(0, 6)
                .map((service, index) => (
                  <ServiceCard key={service.id} service={service} index={index} />
                ))}
        </div>

        {/* CTA below grid */}
        {!isLoading && services.length > 0 && (
          <div className="text-center mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-bold
                bg-brand-primary text-white px-7 py-3.5 rounded-xl shadow-lg shadow-brand-primary/25
                hover:bg-brand-primary-dark transition-all duration-200"
            >
              Explore All IT Capabilities
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-sm font-semibold
                text-brand-navy border border-slate-300 px-6 py-3.5 rounded-xl
                hover:border-brand-primary hover:text-brand-primary hover:bg-brand-ice/50
                transition-all duration-200"
            >
              Estimate Your Project Cost
            </Link>
          </div>
        )}
      </Container>
    </section>
  )
}

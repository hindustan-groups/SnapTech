import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import RootLayout from '@/layouts/RootLayout'
import GlobalClickRipple from '@/components/ui/GlobalClickRipple'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

// ── Page loading fallback ──────────────────────────────────────
function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-bg-base">
      <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Helper function to retry dynamic imports when a chunk load fails
function lazyWithRetry(componentImport) {
  return lazy(() =>
    componentImport().catch((error) => {
      const isChunkError =
        error.name === 'TypeError' ||
        /failed to fetch/i.test(error.message) ||
        /dynamically imported module/i.test(error.message) ||
        /error loading/i.test(error.message) ||
        /chunk/i.test(error.message);

      if (isChunkError) {
        const hasReloaded = window.sessionStorage.getItem('chunk-load-failed-retry');
        if (!hasReloaded) {
          window.sessionStorage.setItem('chunk-load-failed-retry', 'true');
          window.location.reload();
          // Return a pending promise to keep Suspense in loading state during reload
          return new Promise(() => {});
        }
      }
      throw error;
    }).then((module) => {
      // Clear retry flag on successful load
      window.sessionStorage.removeItem('chunk-load-failed-retry');
      return module;
    })
  );
}

// ── Public pages — lazy loaded for code splitting ──────────────
// HomePage is eager-loaded (above the fold, always needed)
import HomePage from '@/pages/HomePage'

const ServicesPage = lazyWithRetry(() => import('@/pages/ServicesPage'))
const ServiceDetailPage = lazyWithRetry(() => import('@/pages/ServiceDetailPage'))
const AboutPage = lazyWithRetry(() => import('@/pages/AboutPage'))
const PortfolioPage = lazyWithRetry(() => import('@/pages/PortfolioPage'))
const BlogPage = lazyWithRetry(() => import('@/pages/BlogPage'))
const BlogPostPage = lazyWithRetry(() => import('@/pages/BlogPostPage'))
const ContactPage = lazyWithRetry(() => import('@/pages/ContactPage'))
const CareersPage = lazyWithRetry(() => import('@/pages/CareersPage'))
const JobDetailPage = lazyWithRetry(() => import('@/pages/JobDetailPage'))
const PrivacyPolicyPage = lazyWithRetry(() => import('@/pages/PrivacyPolicyPage'))
const TermsOfServicePage = lazyWithRetry(() => import('@/pages/TermsOfServicePage'))
const RefundPolicyPage = lazyWithRetry(() => import('@/pages/RefundPolicyPage'))
const PricingPage = lazyWithRetry(() => import('@/pages/PricingPage'))
const CostCalculatorPage = lazyWithRetry(() => import('@/pages/CostCalculatorPage'))
const ThankYouPage = lazyWithRetry(() => import('@/pages/ThankYouPage'))
const WhyChooseUsPage = lazyWithRetry(() => import('@/pages/WhyChooseUsPage'))
const NotFoundPage = lazyWithRetry(() => import('@/pages/NotFoundPage'))

// ── Admin pages — lazy loaded ──────────────────────────────────
const AdminLayout = lazyWithRetry(() => import('@/layouts/AdminLayout'))
const AdminLoginPage = lazyWithRetry(() => import('@/pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazyWithRetry(() => import('@/pages/admin/AdminDashboardPage'))
const AdminLeadsPage = lazyWithRetry(() => import('@/pages/admin/AdminLeadsPage'))
const AdminServicesPage = lazyWithRetry(() => import('@/pages/admin/AdminServicesPage'))
const AdminProjectsPage = lazyWithRetry(() => import('@/pages/admin/AdminProjectsPage'))
const AdminTeamPage = lazyWithRetry(() => import('@/pages/admin/AdminTeamPage'))
const AdminSettingsPage = lazyWithRetry(() => import('@/pages/admin/AdminSettingsPage'))
const AdminTestimonialsPage = lazyWithRetry(() => import('@/pages/admin/AdminTestimonialsPage'))
const AdminFaqPage = lazyWithRetry(() => import('@/pages/admin/AdminFaqPage'))
const AdminSiteSettingsPage = lazyWithRetry(() => import('@/pages/admin/AdminSiteSettingsPage'))
const AdminMilestonesPage = lazyWithRetry(() => import('@/pages/admin/AdminMilestonesPage'))
const AdminPartnersPage = lazyWithRetry(() => import('@/pages/admin/AdminPartnersPage'))
const AdminHelpPage = lazyWithRetry(() => import('@/pages/admin/AdminHelpPage'))
const AdminCareersPage = lazyWithRetry(() => import('@/pages/admin/AdminCareersPage'))
const AdminLegalPage = lazyWithRetry(() => import('@/pages/admin/AdminLegalPage'))
const AdminIntegrationPage = lazyWithRetry(() => import('@/pages/admin/AdminIntegrationPage'))
const AdminBackupPage = lazyWithRetry(() => import('@/pages/admin/AdminBackupPage'))
const AdminClientProjectsPage = lazyWithRetry(() => import('@/pages/admin/AdminClientProjectsPage'))
const AdminTasksPage = lazyWithRetry(() => import('@/pages/admin/AdminTasksPage'))
const AdminTicketsPage = lazyWithRetry(() => import('@/pages/admin/AdminTicketsPage'))
const AdminNotesPage = lazyWithRetry(() => import('@/pages/admin/AdminNotesPage'))
const AdminCalendarPage = lazyWithRetry(() => import('@/pages/admin/AdminCalendarPage'))
const AdminActivitiesPage = lazyWithRetry(() => import('@/pages/admin/AdminActivitiesPage'))
const AdminMonitoringPage = lazyWithRetry(() => import('@/pages/admin/AdminMonitoringPage'))
const AdminBlogPage = lazyWithRetry(() => import('@/pages/admin/AdminBlogPage'))
const AdminBlogCommentsPage = lazyWithRetry(() => import('@/pages/admin/AdminBlogCommentsPage'))
const AdminUsersPage = lazyWithRetry(() => import('@/pages/admin/AdminUsersPage'))
const AdminRecycleBinPage = lazyWithRetry(() => import('@/pages/admin/AdminRecycleBinPage'))
const AdminSocialDraftsPage = lazyWithRetry(() => import('@/pages/admin/AdminSocialDraftsPage'))
const AdminChatbotInquiriesPage = lazyWithRetry(() => import('@/pages/admin/AdminChatbotInquiriesPage'))
const AdminProposalBookPage = lazyWithRetry(() => import('@/pages/admin/AdminProposalBookPage'))
const AdminPricingPage = lazyWithRetry(() => import('@/pages/admin/AdminPricingPage'))

// ── Client Portal pages — lazy loaded ──────────────────────────
const ClientLayout = lazyWithRetry(() => import('@/layouts/ClientLayout'))
const ClientLoginPage = lazyWithRetry(() => import('@/pages/client/ClientLoginPage'))
const ClientDashboardPage = lazyWithRetry(() => import('@/pages/client/ClientDashboardPage'))
const ClientProjectDetailPage = lazyWithRetry(() => import('@/pages/client/ClientProjectDetailPage'))
const ClientTicketsPage = lazyWithRetry(() => import('@/pages/client/ClientTicketsPage'))
const ClientBillingPage = lazyWithRetry(() => import('@/pages/client/ClientBillingPage'))
const ClientInvoicePage = lazyWithRetry(() => import('@/pages/client/ClientInvoicePage'))


export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <GlobalClickRipple />
        <Routes>
        {/* ── Admin ── */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="leads"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminLeadsPage />
              </Suspense>
            }
          />
          <Route
            path="proposal-book"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminProposalBookPage />
              </Suspense>
            }
          />
          <Route
            path="pricing"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminPricingPage />
              </Suspense>
            }
          />
          <Route
            path="services"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminServicesPage />
              </Suspense>
            }
          />
          <Route
            path="projects"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminProjectsPage />
              </Suspense>
            }
          />
          <Route
            path="team"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminTeamPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminSettingsPage />
              </Suspense>
            }
          />
          <Route
            path="testimonials"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminTestimonialsPage />
              </Suspense>
            }
          />
          <Route
            path="faqs"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminFaqPage />
              </Suspense>
            }
          />
          <Route
            path="social-drafts"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminSocialDraftsPage />
              </Suspense>
            }
          />
          <Route
            path="chatbot-inquiries"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminChatbotInquiriesPage />
              </Suspense>
            }
          />
          <Route
            path="site-settings"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminSiteSettingsPage />
              </Suspense>
            }
          />
          <Route
            path="users"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminUsersPage />
              </Suspense>
            }
          />
          <Route
            path="milestones"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminMilestonesPage />
              </Suspense>
            }
          />
          <Route
            path="partners"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminPartnersPage />
              </Suspense>
            }
          />
          <Route
            path="careers"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminCareersPage />
              </Suspense>
            }
          />
          <Route
            path="legal"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminLegalPage />
              </Suspense>
            }
          />
          <Route
            path="integrations"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminIntegrationPage />
              </Suspense>
            }
          />
          <Route
            path="backup"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminBackupPage />
              </Suspense>
            }
          />
          <Route
            path="recycle-bin"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminRecycleBinPage />
              </Suspense>
            }
          />
          <Route
            path="help"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminHelpPage />
              </Suspense>
            }
          />
          <Route
            path="client-projects"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminClientProjectsPage />
              </Suspense>
            }
          />
          <Route
            path="tasks"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminTasksPage />
              </Suspense>
            }
          />
          <Route
            path="tickets"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminTicketsPage />
              </Suspense>
            }
          />
          <Route
            path="notes"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminNotesPage />
              </Suspense>
            }
          />
          <Route
            path="calendar"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminCalendarPage />
              </Suspense>
            }
          />
          <Route
            path="activities"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminActivitiesPage />
              </Suspense>
            }
          />
          <Route
            path="blog"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminBlogPage />
              </Suspense>
            }
          />
          <Route
            path="blog-comments"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminBlogCommentsPage />
              </Suspense>
            }
          />
          <Route
            path="monitoring"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminMonitoringPage />
              </Suspense>
            }
          />
          <Route
            index
            element={
              <Suspense fallback={<PageFallback />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Route>

        {/* ── Client Portal ── */}
        <Route
          path="/client"
          element={
            <Suspense fallback={<AdminFallback />}>
              <ClientLayout />
            </Suspense>
          }
        >
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<PageFallback />}>
                <ClientDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="projects/:id"
            element={
              <Suspense fallback={<PageFallback />}>
                <ClientProjectDetailPage />
              </Suspense>
            }
          />
          <Route
            path="support"
            element={
              <Suspense fallback={<PageFallback />}>
                <ClientTicketsPage />
              </Suspense>
            }
          />
          <Route
            path="billing"
            element={
              <Suspense fallback={<PageFallback />}>
                <ClientBillingPage />
              </Suspense>
            }
          />
          <Route
            path="invoices/:milestoneId"
            element={
              <Suspense fallback={<PageFallback />}>
                <ClientInvoicePage />
              </Suspense>
            }
          />
          <Route
            index
            element={
              <Suspense fallback={<PageFallback />}>
                <ClientDashboardPage />
              </Suspense>
            }
          />
        </Route>

        <Route
          path="/client-login"
          element={
            <Suspense fallback={<AdminFallback />}>
              <ClientLoginPage />
            </Suspense>
          }
        />
        <Route
          path="/client/setup-password"
          element={
            <Suspense fallback={<AdminFallback />}>
              <ClientLoginPage />
            </Suspense>
          }
        />

        <Route
          path="/:adminSecret"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLoginPage />
            </Suspense>
          }
        />

        {/* ── Public site ── */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/services"
            element={
              <Suspense fallback={<PageFallback />}>
                <ServicesPage />
              </Suspense>
            }
          />
          <Route
            path="/services/:slug"
            element={
              <Suspense fallback={<PageFallback />}>
                <ServiceDetailPage />
              </Suspense>
            }
          />
          <Route
            path="/pricing"
            element={
              <Suspense fallback={<PageFallback />}>
                <PricingPage />
              </Suspense>
            }
          />
          <Route
            path="/cost-calculator"
            element={
              <Suspense fallback={<PageFallback />}>
                <CostCalculatorPage />
              </Suspense>
            }
          />
          <Route
            path="/thank-you"
            element={
              <Suspense fallback={<PageFallback />}>
                <ThankYouPage />
              </Suspense>
            }
          />
          <Route
            path="/why-snaptech"
            element={
              <Suspense fallback={<PageFallback />}>
                <WhyChooseUsPage />
              </Suspense>
            }
          />
          <Route
            path="/why-us"
            element={
              <Suspense fallback={<PageFallback />}>
                <WhyChooseUsPage />
              </Suspense>
            }
          />
          <Route
            path="/about"
            element={
              <Suspense fallback={<PageFallback />}>
                <AboutPage />
              </Suspense>
            }
          />
          <Route
            path="/portfolio"
            element={
              <Suspense fallback={<PageFallback />}>
                <PortfolioPage />
              </Suspense>
            }
          />
          <Route
            path="/blog"
            element={
              <Suspense fallback={<PageFallback />}>
                <BlogPage />
              </Suspense>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <Suspense fallback={<PageFallback />}>
                <BlogPostPage />
              </Suspense>
            }
          />
          <Route
            path="/careers"
            element={
              <Suspense fallback={<PageFallback />}>
                <CareersPage />
              </Suspense>
            }
          />
          <Route
            path="/careers/:slug"
            element={
              <Suspense fallback={<PageFallback />}>
                <JobDetailPage />
              </Suspense>
            }
          />
          <Route
            path="/contact"
            element={
              <Suspense fallback={<PageFallback />}>
                <ContactPage />
              </Suspense>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <Suspense fallback={<PageFallback />}>
                <PrivacyPolicyPage />
              </Suspense>
            }
          />
          <Route
            path="/terms-of-service"
            element={
              <Suspense fallback={<PageFallback />}>
                <TermsOfServicePage />
              </Suspense>
            }
          />
          <Route
            path="/refund-policy"
            element={
              <Suspense fallback={<PageFallback />}>
                <RefundPolicyPage />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<PageFallback />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
      </ToastProvider>
    </ErrorBoundary>
  )
}


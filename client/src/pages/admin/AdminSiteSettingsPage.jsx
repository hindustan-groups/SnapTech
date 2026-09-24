/**
 * AdminSiteSettingsPage — Global Site Settings & Branding Control Suite
 * Manages public contact information, WhatsApp widget templates, social links,
 * website hero media assets, 3D device showcase mockups, and company statistics.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Type,
  Settings,
  Globe,
  Send,
  RefreshCw,
  Sparkles,
  Save,
} from 'lucide-react'
import { api } from '@/utils/api'
import { SEO } from '@/components/ui'
import { useSiteSettings } from '@/hooks/useContent'
import ImageUploader from '@/components/ui/ImageUploader'
import { useToast } from '@/components/ui/ToastProvider'

const LinkedinIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const InstagramIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const FacebookIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const YoutubeIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
)

const PinterestIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
  </svg>
)

const FIELD_GROUPS = [
  {
    label: 'Contact & Location Details',
    fields: [
      { key: 'phone', label: 'Primary Contact Phone', placeholder: '+91 75970 00601', Icon: Phone },
      {
        key: 'whatsapp',
        label: 'WhatsApp Support Number',
        placeholder: '+91 75970 00601',
        Icon: MessageCircle,
      },
      {
        key: 'whatsappMessage',
        label: 'WhatsApp Default Welcome Message',
        placeholder: 'Hi! I visited your website and want to discuss an IT project.',
        Icon: MessageCircle,
        isTextarea: true,
      },
      {
        key: 'email',
        label: 'Public Support Email',
        placeholder: 'info@snaptech.digital',
        Icon: Mail,
      },
      {
        key: 'address',
        label: 'Headquarters Office Address',
        placeholder: 'Bhilwara, Rajasthan 311001, India',
        Icon: MapPin,
        isTextarea: true,
      },
      {
        key: 'googleMapUrl',
        label: 'Google Maps Embed iframe URL (src link only)',
        placeholder: 'https://www.google.com/maps/embed?pb=...',
        Icon: MapPin,
        isTextarea: true,
      },
    ],
  },
  {
    label: 'Social Media Channels',
    fields: [
      {
        key: 'linkedin',
        label: 'LinkedIn Page URL',
        placeholder: 'https://linkedin.com/company/hindustan-projects',
        Icon: LinkedinIcon,
      },
      {
        key: 'instagram',
        label: 'Instagram Profile URL',
        placeholder: 'https://instagram.com/snaptech.digital',
        Icon: InstagramIcon,
      },
      {
        key: 'facebook',
        label: 'Facebook Page URL',
        placeholder: 'https://facebook.com/snaptech.digital',
        Icon: FacebookIcon,
      },
      {
        key: 'pinterest',
        label: 'Pinterest Profile URL',
        placeholder: 'https://pinterest.com/snaptech_digital',
        Icon: PinterestIcon,
      },
      {
        key: 'youtube',
        label: 'YouTube Channel URL',
        placeholder: 'https://youtube.com/@snaptech-digital',
        Icon: YoutubeIcon,
      },
    ],
  },
  {
    label: 'Homepage Hero & Headline Controls',
    fields: [
      {
        key: 'hero_eyebrow',
        label: 'Hero Eyebrow Tech Pill',
        placeholder: 'Autonomous Systems & Full-Stack Cloud Architecture',
        Icon: Sparkles,
      },
      {
        key: 'hero_division',
        label: 'Enterprise Division Tag',
        placeholder: 'SnapTech Digital — Enterprise IT Division',
        Icon: Type,
      },
      {
        key: 'hero_title_prefix',
        label: 'Hero Main Headline (Prefix)',
        placeholder: 'Architecting Enterprise',
        Icon: Type,
      },
      {
        key: 'hero_title_highlight',
        label: 'Hero Main Headline (Glowing Accent)',
        placeholder: 'Digital Supremacy.',
        Icon: Sparkles,
      },
      {
        key: 'tagline',
        label: 'Homepage Hero Tagline / Subtitle',
        placeholder: 'We engineer mission-critical web platforms, hyper-scalable cloud applications, and automated business workflows that drive verifiable competitive advantage.',
        Icon: Type,
        isTextarea: true,
      },
      {
        key: 'hero_popular_queries',
        label: 'Hero Capability Quick Tags (Comma-separated)',
        placeholder: 'Cloud Migration, Custom ERP, Next.js 15, AI Agents, Microservices, ISO 9001',
        Icon: Type,
      },
      {
        key: 'hero_image_url',
        label: 'Homepage Hero Custom Poster / Graphic',
        isImage: true,
        Icon: Globe,
      },
    ],
  },
  {
    label: 'Website Branding & Enterprise Ecosystem',
    fields: [
      {
        key: 'company_name',
        label: 'Company Brand Name',
        placeholder: 'SnapTech Digital',
        Icon: Type,
      },
      {
        key: 'parent_company_url',
        label: 'Parent Group Portal URL',
        placeholder: 'https://www.hindustanprojects.in',
        Icon: Globe,
      },
      {
        key: 'why_choose_us_image_url',
        label: 'Why Choose Us Section Graphic (Blank uses telemetry matrix)',
        isImage: true,
        Icon: Globe,
      },
      {
        key: 'about_hero_laptop_image',
        label: 'About Page Laptop Screen Mockup (Desktop View)',
        isImage: true,
        Icon: Globe,
      },
      {
        key: 'about_hero_phone_image',
        label: 'About Page Phone Screen Mockup (Mobile View)',
        isImage: true,
        Icon: Globe,
      },
    ],
  },
  {
    label: '3D Device Showcase Custom Previews',
    fields: [
      {
        key: 'showcase_web_image',
        label: 'Desktop Monitor Mockup Image (Blank uses live interactive UI)',
        isImage: true,
        Icon: Globe,
      },
      {
        key: 'showcase_saas_image',
        label: 'MacBook Laptop Mockup Image (Blank uses live interactive UI)',
        isImage: true,
        Icon: Globe,
      },
      {
        key: 'showcase_mobile_image',
        label: 'iPhone Mobile Mockup Image (Blank uses live interactive UI)',
        isImage: true,
        Icon: Globe,
      },
    ],
  },
  {
    label: 'Company Impact & SLA Telemetry (Numeric/Stat values)',
    fields: [
      { key: 'stat_projects', label: 'Projects Delivered Count', placeholder: '50', Icon: Type },
      { key: 'stat_clients', label: 'Satisfied Enterprise Clients', placeholder: '40', Icon: Type },
      { key: 'stat_experience', label: 'Years Engineering Experience', placeholder: '5', Icon: Type },
      { key: 'stat_cities', label: 'Tier-1 & Regional Cities Served', placeholder: '3', Icon: Type },
      { key: 'stat_sla', label: 'Uptime & Production SLA Guarantee', placeholder: '99.9', Icon: Type },
      { key: 'stat_reach', label: 'Engineering Support & Node Response', placeholder: '24/7', Icon: Type },
    ],
  },
]

const inputStyle =
  'w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-sans'
const textareaStyle =
  'w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all min-h-[75px] resize-y font-sans'

export default function AdminSiteSettingsPage() {
  const qc = useQueryClient()
  const { addToast } = useToast()

  const { data, isLoading, refetch } = useSiteSettings()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({
    values: data?.data || {},
  })

  // Real-time watched form state for live web preview
  const watched = watch()

  const mutation = useMutation({
    mutationFn: (d) => api.patch('/admin/settings', d),
    onSuccess: () => {
      addToast('Global site settings saved and published live!', 'success')
      qc.invalidateQueries({ queryKey: ['site-settings'] })
    },
    onError: (err) => {
      addToast(err.message || 'Failed to save site settings', 'error')
    },
  })

  const onSubmit = (d) => mutation.mutate(d)

  return (
    <>
      <SEO title="Site Settings & Branding" noIndex />
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* ── Executive Dark Header Banner ────────────────────────── */}
        <div className="bg-linear-to-r from-slate-900 via-gray-900 to-brand-blue p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <Settings className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Site Settings &amp; Global Branding
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    Live Sync
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Manage public contact details, WhatsApp widget pre-filled messages, social media links, hero graphics, and impact counters.
                </p>
              </div>
            </div>

            {/* Quick Action Refresh & Save */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  refetch()
                  addToast('Refreshed site settings', 'info')
                }}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-10 bg-gray-50 rounded-xl animate-pulse" />
                  <div className="h-10 bg-gray-50 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
            <div className="lg:col-span-5 h-100 bg-white border border-gray-200 rounded-2xl animate-pulse shadow-sm" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── Left Side: Settings Form ──────────────────────── */}
            <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-7 space-y-6">
              {FIELD_GROUPS.map((group) => (
                <div
                  key={group.label}
                  className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Group Header */}
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                    <p className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                      {group.label}
                    </p>
                  </div>

                  {/* Group Fields */}
                  <div className="p-6 space-y-5">
                    {group.fields.map((f) => (
                      <div key={f.key}>
                        {f.isImage ? (
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-800 block">
                              {f.label}
                            </label>
                            <ImageUploader
                              value={watched[f.key]}
                              onChange={(url) => setValue(f.key, url, { shouldDirty: true })}
                              label=""
                            />
                          </div>
                        ) : (
                          <>
                            <label className="text-xs font-bold text-gray-800 block mb-1.5">
                              {f.label}
                            </label>
                            <div className="relative">
                              <f.Icon className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                              {f.isTextarea ? (
                                <textarea
                                  {...register(f.key)}
                                  placeholder={f.placeholder}
                                  className={textareaStyle}
                                />
                              ) : (
                                <input
                                  {...register(f.key)}
                                  placeholder={f.placeholder}
                                  className={inputStyle}
                                />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Submit Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || mutation.isPending}
                  className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold py-4 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {mutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving &amp; Publishing Settings…
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save &amp; Publish Global Site Settings
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-2 font-medium">
                  Changes take effect immediately across all public website pages and client footer.
                </p>
              </div>
            </form>

            {/* ── Right Side: Sticky Live Preview Panel ─────────── */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
              
              {/* Preview Section Header */}
              <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-blue" />
                  <span>Real-Time Web Preview</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Mirror
                </span>
              </div>

              {/* Mock Footer Layout Card */}
              <div className="border border-gray-200/80 rounded-2xl shadow-lg overflow-hidden bg-white">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Public Footer Section Preview
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div
                  className="p-6 text-white text-left"
                  style={{ background: 'linear-gradient(135deg, #1A3E8C 0%, #0f2660 100%)' }}
                >
                  <div className="space-y-5">
                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src="/apple-touch-icon.png"
                          alt="Logo"
                          className="w-6 h-6 object-contain bg-white/10 rounded border border-white/20 p-0.5"
                        />
                        <span className="font-heading font-black text-base tracking-tight text-white">
                          SnapTech Digital
                        </span>
                      </div>
                      <p className="text-xs text-white/70 italic leading-relaxed font-light max-w-sm">
                        "
                        {watched.tagline || 'Building Digital Solutions That Drive Business Growth'}
                        "
                      </p>
                    </div>

                    <hr className="border-white/10" />

                    {/* Contacts */}
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5 text-xs text-white/80">
                        <MapPin className="w-3.5 h-3.5 text-white/50 shrink-0 mt-0.5" />
                        <span className="leading-tight">
                          {watched.address || 'Bhilwara, Rajasthan 311001, India'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-white/80">
                        <Phone className="w-3.5 h-3.5 text-white/50 shrink-0" />
                        <span>{watched.phone || '+91 75970 00601'}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-white/80">
                        <Mail className="w-3.5 h-3.5 text-white/50 shrink-0" />
                        <span className="underline decoration-white/20">
                          {watched.email || 'info@snaptech.digital'}
                        </span>
                      </div>
                    </div>

                    <hr className="border-white/10" />

                    {/* Social Icons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:text-white transition-colors cursor-pointer">
                          <LinkedinIcon className="w-3.5 h-3.5" />
                        </span>
                        <span className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:text-white transition-colors cursor-pointer">
                          <InstagramIcon className="w-3.5 h-3.5" />
                        </span>
                        <span className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:text-white transition-colors cursor-pointer">
                          <FacebookIcon className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <span className="text-[10px] text-white/40 font-medium">
                        © {new Date().getFullYear()} SnapTech Digital
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock WhatsApp Floating Widget Card */}
              <div className="border border-gray-200/80 rounded-2xl shadow-lg overflow-hidden bg-[#E5DDD5]">
                {/* Header */}
                <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3 shrink-0 shadow-sm">
                  <div className="relative w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 font-heading font-black text-xs text-white">
                    ST
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#075E54]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none">SnapTech Digital Support</p>
                    <p className="text-[9px] text-white/70 mt-0.5 leading-none">
                      Typically replies in under 15 mins
                    </p>
                  </div>
                </div>

                {/* Messages Chat */}
                <div className="p-4 space-y-3 font-sans text-xs">
                  {/* Support bubble */}
                  <div className="bg-white rounded-r-xl rounded-bl-xl p-2.5 max-w-[85%] shadow-xs relative text-gray-800 leading-normal">
                    <p className="font-bold text-[10px] text-[#075E54] mb-0.5">Support Representative</p>
                    <p className="text-xs">
                      Namaste! Welcome to SnapTech Digital. How can we assist with your IT project today?
                    </p>
                    <span className="text-[8px] text-gray-400 float-right mt-1">10:00 AM</span>
                  </div>

                  {/* Pre-filled template bubble */}
                  <div className="bg-[#DCF8C6] rounded-l-xl rounded-br-xl p-2.5 max-w-[85%] ml-auto shadow-xs relative text-gray-800 leading-normal border border-[#DCF8C6]">
                    <div className="text-[9px] text-emerald-800 font-bold border-b border-emerald-200/80 pb-1 mb-1.5 flex items-center gap-1">
                      <Send className="w-2.5 h-2.5" /> Client Pre-filled Message Template
                    </div>
                    <p className="italic text-gray-800 whitespace-pre-line font-mono text-[11px] bg-white/50 p-2 rounded-lg border border-emerald-200/50">
                      {watched.whatsappMessage ||
                        'Hi! I visited your website and want to discuss an IT project.'}
                    </p>
                    <span className="text-[8px] text-emerald-700/80 float-right mt-1.5 font-bold">
                      Target payload
                    </span>
                  </div>
                </div>

                {/* Target Number Bar */}
                <div className="bg-white/95 border-t border-gray-200/80 px-4 py-2.5 flex items-center justify-between text-[10px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      WhatsApp Target:{' '}
                      <strong className="font-mono font-bold text-gray-900">
                        {watched.whatsapp || '+91 75970 00601'}
                      </strong>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-extrabold text-[9px] uppercase tracking-wider">
                    Ready
                  </span>
                </div>
              </div>

              {/* Guidance Notice */}
              <div className="bg-linear-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-2xl p-4 shadow-xs flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  Settings modified here update live footers, contact page maps, and floating WhatsApp widgets immediately across the web app.
                </p>
              </div>

            </div>

          </div>
        )}
      </div>
    </>
  )
}

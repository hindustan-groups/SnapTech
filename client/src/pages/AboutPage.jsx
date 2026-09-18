/**
 * /about — Premium About page
 */
import { Link } from 'react-router-dom'
import {
  MapPin,
  Target,
  Eye,
  CheckCircle2,
  ArrowRight,
  Users,
  Award,
  Rocket,
  Heart,
  Code2,
  Handshake,
  TrendingUp,
  Shield,
  Clock,
  Star,
  Monitor,
  Smartphone,
  Laptop,
  Bell,
  Cpu,
  Menu,
} from 'lucide-react'
import { Container, Button, SEO } from '@/components/ui'
import { useTeam } from '@/hooks/useTeam'
import { useMilestones, useSiteSettings } from '@/hooks/useContent'

/* ── Static data (company values — not CMS managed) ─────── */
const VALUES = [
  {
    icon: Users,
    title: 'Client-First Always',
    desc: 'Your success is our success. Every decision we make is centered around delivering real value to you.',
  },
  {
    icon: Shield,
    title: 'Transparent & Honest',
    desc: 'Clear communication, honest timelines, and no hidden costs — ever.',
  },
  {
    icon: Code2,
    title: 'Quality Code',
    desc: 'We write clean, maintainable, secure code built to last and scale with your business.',
  },
  {
    icon: Handshake,
    title: 'Long-Term Partners',
    desc: 'We build lasting partnerships, not one-off transactions. We grow together.',
  },
]

// Fallbacks (shown if DB empty)
const FALLBACK_MILESTONES = [
  {
    id: '1',
    year: '2019',
    title: 'Founded',
    desc: 'Hindustan Projects was born in Bhilwara with a mission to bring world-class IT to local businesses.',
  },
  {
    id: '2',
    year: '2020',
    title: 'First 10 Clients',
    desc: 'Delivered web development and digital marketing for 10 businesses across Rajasthan.',
  },
  {
    id: '3',
    year: '2022',
    title: 'Expanded Services',
    desc: 'Launched cloud, DevOps, and mobile app development verticals.',
  },
  {
    id: '4',
    year: '2024',
    title: '40+ Happy Clients',
    desc: 'Crossed 40 happy clients mark, serving businesses pan-India.',
  },
  {
    id: '5',
    year: '2025',
    title: 'Growing Strong',
    desc: 'Expanding our team and services to cover enterprise-level digital transformation.',
  },
]

const FALLBACK_TEAM = [
  {
    id: '1',
    name: 'Rahul Sharma',
    role: 'Founder & CEO',
    bio: 'Visionary leader with 8+ years in web tech and digital strategy.',
  },
  {
    id: '2',
    name: 'Priya Singh',
    role: 'Lead Developer',
    bio: 'Full-stack expert specialising in React, Node.js, and cloud architecture.',
  },
  {
    id: '3',
    name: 'Amit Verma',
    role: 'Digital Marketing Head',
    bio: "Growth hacker behind our clients' SEO and paid campaign results.",
  },
  {
    id: '4',
    name: 'Sneha Joshi',
    role: 'UI/UX Designer',
    bio: 'Crafts beautiful, intuitive interfaces that users love to interact with.',
  },
]

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.84v2.12h.05c.53-1 1.84-2.12 3.79-2.12 4.05 0 4.8 2.67 4.8 6.13V24h-4v-8.5c0-2.03-.04-4.63-2.82-4.63-2.83 0-3.26 2.2-3.26 4.48V24h-4V8.5z" />
    </svg>
  )
}

export default function AboutPage() {
  const { data: teamData, isLoading: teamLoading } = useTeam()
  const { data: milestonesData, isLoading: milestonesLoading } = useMilestones()
  const { data: settingsData } = useSiteSettings()

  const team = teamData?.data?.length ? teamData.data : teamLoading ? [] : FALLBACK_TEAM
  const milestones = milestonesData?.data?.length
    ? milestonesData.data
    : milestonesLoading
      ? []
      : FALLBACK_MILESTONES
  const cfg = settingsData?.data || {}

  const stats = [
    { value: `${cfg.stat_projects || '50'}+`, label: 'Projects Delivered', icon: Rocket },
    { value: `${cfg.stat_clients || '40'}+`, label: 'Happy Clients', icon: Heart },
    { value: `${cfg.stat_experience || '5'}+`, label: 'Years Experience', icon: Award },
    { value: `${cfg.stat_cities || '3'}+`, label: 'Cities Served', icon: MapPin },
  ]

  return (
    <>
      <SEO
        title="About Snaptech — IT & Technology Division of Hindustan Projects Group"
        description="Learn about Snaptech, the enterprise technology and software engineering company backed by Hindustan Projects Group. Custom Web Apps, Mobile, Cloud & AI."
        path="/about"
        keywords="Snaptech, Hindustan Projects IT, technology company Bhilwara, software company Rajasthan, about Snaptech, IT solutions India"
        schemas={[
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About Snaptech',
            url: 'https://www.snaptech.hindustanprojects.in/about',
            description:
              'Snaptech is the dedicated technology and digital transformation company of Hindustan Projects Group, delivering enterprise digital systems.',
          },
        ]}
      />
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-32 lg:pt-36 pb-14 sm:pb-20 lg:pb-24 overflow-hidden bg-[#020714]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-cyan/15 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <Container className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-cyan text-xs font-semibold uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                A Hindustan Projects Venture
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-tight mb-5">
                Next-Gen IT Engineering with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary-light via-brand-cyan to-white">
                  Corporate Stability
                </span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
                Snaptech is the dedicated technology company of Hindustan Projects Group, delivering
                high-speed custom software, mobile applications, cloud DevOps, and digital growth infrastructure 
                for enterprises in Bhilwara, India, and worldwide.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="lg" as={Link} to="/contact" className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold">
                  Work With Snaptech
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  as={Link}
                  to="/portfolio"
                  className="text-white border border-white/20 hover:bg-white/10"
                >
                  See Case Studies
                </Button>
              </div>
            </div>

            {/* Right: Overlapping 3D Device Mockup Showcase */}
            <div className="relative w-full max-w-md mx-auto lg:max-w-none aspect-[4/3] flex items-center justify-center pt-8 pb-4 lg:py-0">
              {/* Decorative glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-brand-primary/10 to-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

              {/* 1. Laptop Base Frame (Desktop View) */}
              <div className="relative w-[85%] aspect-[16/10] bg-slate-900 border-[6px] border-slate-950 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 select-none">
                {cfg.about_hero_laptop_image ? (
                  <img
                    src={cfg.about_hero_laptop_image}
                    alt="Snaptech Homepage"
                    className="w-full h-full object-contain bg-[#020714] block"
                  />
                ) : (
                  /* Simulated Corporate Website Homepage (Light Theme) */
                  <div className="w-full h-full bg-[#f8fafc] flex flex-col text-gray-800 font-sans select-none overflow-hidden">
                    {/* Browser Address Bar Header */}
                    <div className="h-[12%] bg-white border-b border-gray-200 px-3 flex items-center gap-2 shrink-0">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-md py-0.5 px-2.5 flex items-center justify-center gap-1.5 text-[7px] text-gray-400 max-w-[170px] mx-auto border border-gray-200/50">
                        <span className="text-emerald-500">🔒</span>
                        <span className="truncate tracking-wide font-medium">www.snaptech.hindustanprojects.in</span>
                      </div>
                    </div>

                    {/* Website Content Viewport */}
                    <div className="flex-1 overflow-hidden flex flex-col bg-white">
                      {/* Nav bar */}
                      <nav className="px-3.5 py-1.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-brand-primary" />
                          <span className="font-heading font-black text-[7px] text-brand-navy tracking-wider">SNAPTECH</span>
                        </div>
                        <div className="flex gap-2.5 text-[6px] text-gray-500 font-bold">
                          <span>Services</span>
                          <span>About</span>
                          <span className="text-brand-primary">Portfolio</span>
                          <span>Contact</span>
                        </div>
                      </nav>

                      {/* Homepage Hero Section */}
                      <div className="flex-1 bg-gradient-to-tr from-blue-50/50 via-indigo-50/20 to-white p-3 flex flex-col justify-center items-center text-center space-y-1.5">
                        <span className="text-[5px] font-black tracking-widest text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2 py-0.5 rounded-full uppercase">
                          Hindustan Projects IT Division
                        </span>
                        <div className="text-[11px] font-black text-gray-900 leading-tight max-w-[180px] font-heading">
                          Looking for IT Solutions? Connect with Snaptech
                        </div>
                        <p className="text-[6px] text-gray-400 max-w-[150px]">
                          Custom web platforms, mobile engineering & enterprise cloud solutions.
                        </p>
                        <div className="flex gap-1.5 pt-0.5">
                          <span className="bg-brand-primary text-white rounded py-0.5 px-2 text-[5px] font-bold shadow-sm">
                            Explore Services
                          </span>
                          <span className="bg-white border border-gray-200 text-gray-600 rounded py-0.5 px-2 text-[5px] font-bold">
                            Contact Us
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Laptop base keyboard bevel */}
              <div className="absolute bottom-[10%] left-[7.5%] w-[85%] h-[3%] bg-slate-800 rounded-b-lg border-t border-slate-700 shadow-2xl flex justify-center items-start pointer-events-none">
                <div className="w-[12%] h-[40%] bg-slate-900 rounded-b" />
              </div>

              {/* 2. Overlapping iPhone Device Frame (Mobile View) */}
              <div className="absolute bottom-[4%] right-[4%] w-[28%] aspect-[9/18.5] bg-slate-900 border-[4.5px] border-slate-950 rounded-[24px] shadow-2xl overflow-hidden ring-1 ring-white/10 z-10 select-none">
                {/* Notch */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[35%] h-[5%] bg-slate-950 rounded-full z-20" />

                {cfg.about_hero_phone_image ? (
                  <img
                    src={cfg.about_hero_phone_image}
                    alt="Hindustan Projects Mobile View"
                    className="w-full h-full object-contain bg-[#050e20] block"
                  />
                ) : (
                  /* Simulated Mobile Homepage (Light Theme) */
                  <div className="w-full h-full bg-white text-gray-800 flex flex-col justify-between overflow-hidden relative pt-4 font-sans select-none">
                    {/* Mobile browser address bar */}
                    <div className="px-2 py-0.5 bg-gray-50 border-b border-gray-100 text-[5px] text-gray-400 flex items-center justify-center shrink-0">
                      <span>🔒 itservices.hindustanprojects.in</span>
                    </div>

                    {/* Mobile Nav */}
                    <header className="px-2.5 py-1.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                      <div className="flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded bg-brand-blue" />
                        <span className="font-heading font-black text-[6px] text-brand-blue tracking-wide">HP</span>
                      </div>
                      <Menu className="w-2.5 h-2.5 text-gray-500" />
                    </header>

                    {/* Mobile Hero Content */}
                    <div className="flex-1 p-2 bg-gradient-to-b from-blue-50/30 to-white flex flex-col justify-center items-center text-center space-y-1.5">
                       <div className="text-[7.5px] font-black text-gray-900 leading-tight font-heading">
                        Digital Solutions That Drive Growth
                      </div>
                      <p className="text-[5px] text-gray-400 leading-normal max-w-[80px]">
                        We build custom systems and portals.
                      </p>
                      <div className="bg-brand-blue text-white rounded-full py-0.5 px-2 text-[5.5px] font-bold shadow-sm inline-block cursor-pointer">
                        Get Started
                      </div>
                    </div>

                    {/* Bottom Navigation Mock bar */}
                    <div className="h-4 bg-gray-50 border-t border-gray-100 px-2 flex justify-between items-center text-[5px] text-gray-400 shrink-0">
                      <span>Home</span>
                      <span className="text-brand-blue font-bold">Services</span>
                      <span>Contact</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-0">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 px-4 sm:px-6 py-5 sm:py-6 group hover:bg-brand-blue/3 transition-colors duration-200 border-b border-r border-gray-100 [&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r lg:[&:nth-child(4)]:border-r-0"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-blue/8 flex items-center justify-center shrink-0 group-hover:bg-brand-blue/14 transition-colors">
                  <stat.icon className="w-5 h-5 text-brand-blue" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-red font-heading">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Story Section ────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50/60 to-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Image + overlay */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&q=80&auto=format&fit=crop"
                  alt="Hindustan Projects team collaborating"
                  className="w-full h-80 object-cover"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/60 via-transparent to-transparent" />
                {/* Badge bottom-left */}
                <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-red flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">
                      Headquartered in
                    </p>
                    <p className="text-xs text-text-muted font-semibold">Bhilwara, Rajasthan</p>
                  </div>
                </div>
                {/* Badge top-right */}
                <div className="absolute top-5 right-5 bg-brand-red text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  Est. 2019
                </div>
              </div>

              {/* Floating stat card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl border border-gray-100 shadow-xl p-5 hidden lg:block">
                <p className="text-3xl font-bold text-brand-blue font-heading">
                  50<span className="text-brand-red">+</span>
                </p>
                <p className="text-xs text-text-muted mt-0.5">Projects Delivered</p>
              </div>
            </div>

            {/* Right: Story text */}
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-brand-red mb-3 block">
                Our Story
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-blue mb-6 leading-tight">
                Built in Bhilwara.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-blue-400">
                  Serving All of India.
                </span>
              </h2>
              <div className="space-y-4 text-text-muted text-sm leading-relaxed mb-8">
                <p>
                  Hindustan Projects was founded with a clear mission: to make world-class IT
                  services accessible to businesses in Bhilwara and Rajasthan — not just the metros.
                </p>
                <p>
                  We saw a gap — local businesses had the ambition to grow digitally but lacked
                  access to affordable, high-quality technology partners who understood their
                  context. That's exactly the gap we fill.
                </p>
                <p>
                  From custom web development and digital marketing to enterprise software and IT
                  consulting, we've helped over 40 businesses transform their operations and expand
                  their online reach across India.
                </p>
              </div>

              {/* Mission & Vision */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative p-5 rounded-xl border border-brand-red/15 bg-brand-red/4 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-red rounded-l-xl" />
                  <div className="w-8 h-8 rounded-lg bg-brand-red/15 flex items-center justify-center mb-3">
                    <Target className="w-4 h-4 text-brand-red" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-brand-blue mb-1">
                    Our Mission
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Empower businesses with reliable, affordable technology that creates lasting
                    competitive advantage.
                  </p>
                </div>
                <div className="relative p-5 rounded-xl border border-brand-blue/15 bg-brand-blue/4 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue rounded-l-xl" />
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/15 flex items-center justify-center mb-3">
                    <Eye className="w-4 h-4 text-brand-blue" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-brand-blue mb-1">
                    Our Vision
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Become the most trusted IT partner for growing businesses in Rajasthan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-t border-gray-100">
        <Container>
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-red mb-3 block">
              Our Culture
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-blue mb-3">
              What We Stand For
            </h2>
            <p className="text-text-muted max-w-md mx-auto text-sm">
              These values guide every project, every client interaction, and every line of code we
              write.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className="group p-6 rounded-2xl border border-gray-100 bg-white
                  hover:border-brand-blue/20 hover:shadow-[0_8px_30px_rgba(26,62,140,0.08)]
                  hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-blue-400 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <v.icon className="w-6 h-6 text-white" strokeWidth={1.6} />
                </div>
                <h3 className="font-heading text-base font-bold text-brand-blue mb-2">{v.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Timeline / Milestones ─────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50/60 border-t border-gray-100">
        <Container>
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-red mb-3 block">
              Our Journey
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-blue">
              Milestones That Define Us
            </h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-blue via-brand-red to-transparent hidden sm:block" />
            <div className="space-y-8">
              {(milestonesLoading ? Array.from({ length: 4 }) : milestones).map((m, i) =>
                milestonesLoading ? (
                  <div key={i} className="flex gap-6">
                    <div className="hidden sm:block w-16 h-16 rounded-full bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex-1 h-20 bg-gray-100 rounded-2xl animate-pulse" />
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-6 group">
                    <div className="hidden sm:flex flex-col items-center shrink-0">
                      <div className="w-16 h-16 rounded-full border-2 border-brand-blue bg-white flex flex-col items-center justify-center shadow-md group-hover:bg-brand-blue transition-colors duration-300">
                        <span className="text-xs font-bold text-brand-blue group-hover:text-white transition-colors leading-none">
                          {m.year}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-5 group-hover:border-brand-blue/20 group-hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="sm:hidden text-xs font-bold text-brand-red">
                          {m.year} —
                        </span>
                        <h3 className="font-heading text-base font-bold text-brand-blue">
                          {m.title}
                        </h3>
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Team ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50/50 to-white border-t border-gray-100">
        <Container>
          <div className="text-center mb-10 lg:mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-red mb-3 block">
              The People
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-brand-blue mb-3">
              Meet Our Team
            </h2>
            <p className="text-text-muted max-w-md mx-auto text-sm">
              A passionate group of technologists, marketers, and designers — united by one goal:
              your success.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
                ))
              : team.map((member, index) => {
                  const initials = member.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                  const getStickyClass = (idx) => {
                    const classes = [
                      'sticky sm:relative top-[80px] sm:top-auto z-10 sm:z-auto shadow-[0_8px_30px_rgba(26,62,140,0.06)] scale-[0.91] sm:scale-100 origin-top transition-all duration-300',
                      'sticky sm:relative top-[96px] sm:top-auto z-20 sm:z-auto shadow-[0_12px_36px_rgba(26,62,140,0.09)] scale-[0.94] sm:scale-100 origin-top transition-all duration-300',
                      'sticky sm:relative top-[112px] sm:top-auto z-30 sm:z-auto shadow-[0_16px_40px_rgba(26,62,140,0.12)] scale-[0.97] sm:scale-100 origin-top transition-all duration-300',
                      'sticky sm:relative top-[128px] sm:top-auto z-40 sm:z-auto shadow-[0_20px_48px_rgba(26,62,140,0.15)] scale-[1] sm:scale-100 origin-top transition-all duration-300',
                    ]
                    return classes[idx] || 'sticky sm:relative top-[128px] sm:top-auto z-40 sm:z-auto shadow-[0_20px_48px_rgba(26,62,140,0.15)] scale-[1] sm:scale-100 origin-top transition-all duration-300'
                  }
                  return (
                    <div
                      key={member.id}
                      className={`group relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-6 text-center
                        hover:border-brand-blue/20 hover:shadow-[0_12px_30px_rgba(26,62,140,0.12)]
                        hover:-translate-y-1.5 transition-all duration-300 ${getStickyClass(index)}`}
                    >
                      {/* Subtle background glow inside the card top */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-b from-brand-blue/5 to-transparent blur-2xl rounded-full pointer-events-none" />
                      
                      {/* Glow point behind photo */}
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-tr from-brand-blue/10 to-brand-red/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {member.photoUrl ? (
                        <div className="relative mb-5 mx-auto w-24 h-24 flex items-center justify-center z-10">
                          {/* Soft backdrop blur glow */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-blue via-transparent to-brand-red blur-md opacity-20 group-hover:opacity-55 group-hover:scale-115 transition-all duration-500" />
                          
                          {/* Gradient Ring Wrapper */}
                          <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-brand-blue/20 via-slate-200 to-brand-red/20 group-hover:from-brand-blue group-hover:via-brand-blue-light group-hover:to-brand-red transition-all duration-500 shadow-sm">
                            {/* White spacer ring */}
                            <div className="p-[2px] rounded-full bg-white">
                              <img
                                src={member.photoUrl}
                                alt={member.name}
                                className="w-22 h-22 rounded-full object-cover shadow-inner group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative mb-5 mx-auto w-24 h-24 flex items-center justify-center z-10">
                          {/* Soft backdrop blur glow */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-blue via-transparent to-brand-red blur-md opacity-20 group-hover:opacity-55 group-hover:scale-115 transition-all duration-500" />
                          
                          {/* Gradient Ring Wrapper */}
                          <div className="relative w-full h-full p-[3px] rounded-full bg-gradient-to-tr from-brand-blue/20 via-slate-200 to-brand-red/20 group-hover:from-brand-blue group-hover:via-brand-blue-light group-hover:to-brand-red transition-all duration-500 shadow-sm flex items-center justify-center">
                            {/* White spacer ring */}
                            <div className="w-full h-full p-[2px] rounded-full bg-white flex items-center justify-center">
                              <div className="w-full h-full rounded-full bg-brand-blue/5 flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                <span className="font-heading text-lg font-extrabold bg-gradient-to-tr from-brand-blue to-brand-blue-light bg-clip-text text-transparent">
                                  {initials}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="relative z-10">
                        <h3 className="font-heading text-base font-bold text-brand-blue group-hover:text-brand-blue-light transition-colors duration-300">
                          {member.name}
                        </h3>
                        <p className="text-xs text-brand-red font-semibold uppercase tracking-wider mt-1 mb-3">
                          {member.role}
                        </p>
                        {member.bio && (
                          <p className="text-xs text-text-muted leading-relaxed mb-5 line-clamp-3 group-hover:text-gray-700 transition-colors duration-300 px-1">
                            {member.bio}
                          </p>
                        )}
                        {member.linkedinUrl && (
                          <div className="flex justify-center">
                            <a
                              href={member.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${member.name} on LinkedIn`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-muted bg-slate-50 hover:bg-brand-blue/5 hover:text-brand-blue border border-slate-100 hover:border-brand-blue/20 transition-all duration-300"
                            >
                              <LinkedInIcon />
                              <span>LinkedIn</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
          </div>
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="relative py-14 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-[#1e3a7a] to-[#0a1f5c]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />

        <Container className="relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white/70 text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Let's Build Together
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              <span className="text-white">Ready to Grow Your Business</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-orange-400">
                With the Right Tech Partner?
              </span>
            </h2>
            <p className="text-white/60 text-base sm:text-lg mb-10 max-w-xl mx-auto">
              Let's talk about your goals. We'll suggest the best solutions — no jargon, no
              pressure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" as={Link} to="/contact">
                Get a Free Consultation
              </Button>
              <Button
                variant="ghost"
                size="lg"
                as={Link}
                to="/services"
                className="!text-white !border-white/25 hover:!bg-white/10"
              >
                Explore Services →
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/70 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> No upfront payment
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Reply within 24 hours
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> 50+ happy clients
              </span>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

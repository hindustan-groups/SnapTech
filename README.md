<div align="center">

# SnapTech Digital

**Enterprise Web & Digital Solutions**

[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://www.snaptech.digital)
[![Tests](https://img.shields.io/badge/tests-92%20passed-brightgreen?style=flat-square)](#testing)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](#)

[Website](https://www.snaptech.digital) · [Contact](mailto:info@snaptech.digital) · [Admin Panel](https://www.snaptech.digital/admin)

</div>

---

## About

**SnapTech Digital** is a full-service digital agency based in **Bhilwara, Rajasthan, India**, delivering enterprise-grade web applications, digital marketing solutions, and IT consulting services.

📍 **Address:** Bhilwara, Rajasthan 311001, India  
📞 **Phone:** +91 75970 00601  
📧 **Email:** info@snaptech.digital  
🌐 **Website:** https://www.snaptech.digital

---

## Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| State | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL (Neon / Supabase) |
| Auth | JWT + bcrypt |
| Email | Resend / SMTP |
| Storage | Cloudinary |
| Security | Helmet, CORS, Rate Limiting |

---

## Project Structure

```
hindustan-projects-website/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── layout/      # Navbar, Footer
│   │   │   ├── sections/    # Page sections (Hero, Services, etc.)
│   │   │   └── ui/          # Atoms (Button, Modal, etc.)
│   │   ├── pages/           # Route pages
│   │   │   ├── admin/       # 32 admin panel pages
│   │   │   └── client/      # Client portal pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Admin & Client layouts
│   │   └── lib/             # Utilities, API client
│   └── .env.example         # Frontend env template
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, CORS, rate limiting
│   │   ├── routes/          # 17 API route files
│   │   └── config/          # DB, mailer config
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # DB seeder
│   └── .env.example         # Backend env template
│
└── README.md
```

---

## Local Development Setup

### Prerequisites
- **Node.js** v20+ 
- **PostgreSQL** (or use [Neon](https://neon.tech) free tier)
- **npm** v10+

### 1. Clone the repo
```bash
git clone https://github.com/your-org/hindustan-projects-website.git
cd hindustan-projects-website
```

### 2. Setup Backend
```bash
cd server
cp .env.example .env          # copy env template
# Edit .env — add your DATABASE_URL, JWT_SECRET, email credentials
npm install
npx prisma migrate dev        # run migrations
npx prisma db seed            # seed initial data & admin user
npm run dev                   # starts on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd client
cp .env.example .env.local    # copy env template (leave VITE_API_URL empty for local dev)
npm install
npm run dev                   # starts on http://localhost:5173
```

### 4. Open in browser
| URL | Description |
|-----|-------------|
| http://localhost:5173 | Public website |
| http://localhost:5173/admin | Admin panel login |
| http://localhost:5173/client | Client portal login |
| http://localhost:5000/api/health | API health check |

**Default admin credentials** (from seed):
- Email: `admin@snaptech.digital`
- Password: value of `SEED_ADMIN_PASSWORD` in your `.env`

---

## Available Scripts

### Backend (`/server`)
```bash
npm run dev          # Development server with hot reload
npm start            # Production server
npm test             # Run 92 integration tests
npx prisma studio    # Visual DB browser
npx prisma db seed   # Re-seed the database
```

### Frontend (`/client`)
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
```

---

## Testing

The backend has **92 integration tests** across 6 test suites covering all major API endpoints.

```bash
cd server
npm test
# Output: Tests  92 passed (92)
```

---

## Key Features

### Public Website
- ✅ Dynamic Services, Portfolio, Blog, Careers, Pricing pages
- ✅ Contact form with reCAPTCHA protection
- ✅ Testimonials, Team, Tech Stack, FAQ sections
- ✅ Full SEO meta tags on all pages

### Admin Panel (32 pages)
- ✅ Dashboard with analytics charts
- ✅ Lead & inquiry management
- ✅ Blog CMS with rich text editor
- ✅ Project & milestone tracking
- ✅ Client portal user management
- ✅ Proposal book (PDF generation)
- ✅ Site settings & branding control
- ✅ Careers & job management
- ✅ Social media draft scheduler
- ✅ System monitoring & backup
- ✅ Integration settings (Cloudinary, Email, reCAPTCHA)

### Client Portal
- ✅ Project progress tracking
- ✅ Invoice & billing history
- ✅ Support ticket system
- ✅ Milestone timeline view

---

## Environment Variables

### Backend (`server/.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (min 64 chars) |
| `CLIENT_URL` | Frontend URL for CORS |
| `RESEND_API_KEY` | Resend email API key |
| `CLOUDINARY_*` | Cloudinary image storage |
| `SEED_ADMIN_EMAIL` | Initial admin email |
| `SEED_ADMIN_PASSWORD` | Initial admin password |
| `INTEGRATION_MASTER_KEY` | Admin integration page unlock key |

### Frontend (`client/.env.local`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (empty = use Vite proxy) |
| `VITE_RECAPTCHA_SITE_KEY` | Google reCAPTCHA v3 site key |

---

## Deployment

### Backend (Render / Railway / VPS)
1. Set all env variables in your hosting dashboard
2. Build command: `npm install && npx prisma migrate deploy`
3. Start command: `npm start`

### Frontend (Vercel)
1. Set `VITE_API_URL` to your backend URL in Vercel dashboard
2. Build command: `npm run build`
3. Output directory: `dist`

---

## Contact

- 🌐 Website: [snaptech.digital](https://www.snaptech.digital)
- 📧 Email: [info@snaptech.digital](mailto:info@snaptech.digital)
- 📞 Phone: +91 75970 00601
- 📍 Location: Bhilwara, Rajasthan 311001, India

---

<div align="center">
Made with ❤️ by <strong>SnapTech Digital</strong>
</div>

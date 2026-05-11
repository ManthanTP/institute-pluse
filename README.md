# 🌿 InstitutePulse — Smart Campus Sustainability & Assistant System

> *"Every Action. Every Point. Greener Campus."*

A production-ready, **mobile-first full-stack web application** built for campuses to track carbon footprints, manage smart services, and gamify sustainability. Built with React + Vite + Supabase.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
# Edit .env with your credentials (see Environment Setup below)

# 3. Set up Supabase database
# Paste schema.sql into Supabase SQL Editor and run

# 4. Start development server
npm run dev
```

App runs at → **http://localhost:5173**

---

## 📦 All Installed Dependencies & Why They're Used

### 🔧 Core Runtime

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.1.0 | Core UI library — component-based rendering engine |
| `react-dom` | ^19.1.0 | Renders React components into the browser DOM |
| `react-router-dom` | ^7.6.0 | Client-side routing — powers all navigation between pages (SPA) |

### 🗄️ Backend & Database

| Package | Version | Purpose |
|---|---|---|
| `@supabase/supabase-js` | ^2.49.8 | Official Supabase client — connects to PostgreSQL DB, handles Auth (signup/login/OAuth), Realtime subscriptions, and Storage |

### 🤖 AI Integration

| Package | Version | Purpose |
|---|---|---|
| `@google/generative-ai` | ^0.24.1 | Google Gemini AI SDK — powers the eco-tip generator, AI study planner, lab assistant chatbot, and the SCSAS campus assistant |

### 🗂️ State Management

| Package | Version | Purpose |
|---|---|---|
| `zustand` | ^5.0.4 | Lightweight global state manager — manages auth state, carbon log cache, notification store, and shopping cart without boilerplate |

### 📊 Charts & Data Visualization

| Package | Version | Purpose |
|---|---|---|
| `recharts` | ^2.15.3 | React charting library — renders CO2 trend line charts, eco-score bar charts, category pie charts, and department comparison charts |

### 🗺️ Maps

| Package | Version | Purpose |
|---|---|---|
| `leaflet` | ^1.9.4 | Open-source map engine — renders the live bus tracking map and campus navigation using OpenStreetMap tiles |
| `react-leaflet` | ^5.0.0 | React wrapper for Leaflet — integrates map components into JSX with markers, popups, and live position updates |

### 📱 QR Code

| Package | Version | Purpose |
|---|---|---|
| `qrcode.react` | ^4.2.0 | Generates QR codes — used for cafeteria order tokens (students show QR at counter) and attendance session codes |
| `html5-qrcode` | ^2.3.8 | QR code scanner via device camera — used in the attendance page to scan teacher-generated QR codes |

### 🎨 UI Components & Icons

| Package | Version | Purpose |
|---|---|---|
| `lucide-react` | ^0.511.0 | Modern icon library — 500+ consistent SVG icons used throughout the app (navigation, actions, status indicators) |
| `framer-motion` | ^12.12.1 | Animation library — provides smooth page transitions, modal animations, and spring-based micro-interactions |

### 🍞 Notifications

| Package | Version | Purpose |
|---|---|---|
| `react-hot-toast` | ^2.5.2 | Lightweight toast notification system — shows success/error feedback for all user actions (save, submit, login) |

### 📅 Date Utilities

| Package | Version | Purpose |
|---|---|---|
| `date-fns` | ^4.1.0 | Comprehensive date utility library — formats dates in carbon history, groups notifications by day, calculates streak durations |

---

### 🛠️ Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vite` | ^6.3.5 | Ultra-fast build tool & dev server — HMR, tree-shaking, and production bundling |
| `@vitejs/plugin-react` | ^4.4.1 | Vite plugin that enables JSX transform and React Fast Refresh (HMR) |
| `tailwindcss` | ^4.1.6 | Utility-first CSS framework — used for responsive layout, spacing, and flex/grid utilities |
| `@tailwindcss/vite` | ^4.1.6 | Vite plugin for Tailwind CSS v4 — zero-config PostCSS integration |
| `autoprefixer` | ^10.4.21 | PostCSS plugin — adds browser vendor prefixes automatically for CSS compatibility |
| `postcss` | ^8.5.3 | CSS transformation pipeline — required by Tailwind for processing utility classes |

---

## 🔐 Environment Setup

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_ADMIN_SECRET_KEY=YourStrongSecretKey123!
```

### How to get each key:

---

#### 1. 🟢 Supabase URL & Anon Key (Already done ✅)
You already have these. They come from:
- **Dashboard** → [supabase.com/dashboard](https://supabase.com/dashboard)
- Select your project → **Project Settings** → **API**
- Copy **Project URL** → `VITE_SUPABASE_URL`
- Copy **Publishable Key** (new) or **anon public** (legacy) → `VITE_SUPABASE_ANON_KEY`

---

#### 2. 🤖 Gemini API Key

1. Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select an existing Google Cloud project or create a new one
5. Copy the key → paste as `VITE_GEMINI_API_KEY`

> ⚠️ Free tier: 15 requests/minute, 1 million tokens/day — more than enough for a campus app.

---

#### 3. 🔑 Admin Secret Key

This is **not a third-party service** — you create it yourself:

- It's a password that only admins know, used to access `/secure-admin-panel/login`
- Choose any strong string: `MyAdmin@Campus2026!` or generate one at [randomkeygen.com](https://randomkeygen.com)
- Set it in `.env` as `VITE_ADMIN_SECRET_KEY`
- Share it **only with admin users** — never commit to git

> The admin login requires: Email + Password (Supabase Auth) + Admin Secret Key (this ENV var). Three-factor security.

---

#### 4. 🔒 Supabase Service Role Key (Optional — server-side only)

Only needed if you build Edge Functions:
- **Dashboard** → Project Settings → API → **service_role** key
- ⚠️ **NEVER put this in `VITE_` prefix** — it bypasses all RLS and exposes your entire database

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── BottomTabBar.jsx      # Mobile bottom navigation (5 tabs)
│   ├── EcoScoreRing.jsx      # Animated SVG score ring
│   └── RouteGuards.jsx       # Auth guards (Protected/Admin/Driver/Public routes)
├── lib/
│   ├── supabase.js           # Supabase client initialization
│   ├── carbonCalc.js         # 🌿 Carbon calculation engine (IPCC factors)
│   └── gemini.js             # Google Gemini AI integration
├── pages/
│   ├── LandingPage.jsx       # Public landing with animated hero
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── AdminLoginPage.jsx  # Hidden route: /secure-admin-panel/login
│   ├── student/
│   │   ├── DashboardPage.jsx     # Home with eco score + module grid
│   │   ├── CarbonLogPage.jsx     # 5-category daily carbon logger
│   │   ├── CarbonHistoryPage.jsx # Recharts analytics (line, pie, bar)
│   │   ├── LeaderboardPage.jsx   # Rankings + Challenges + Badges
│   │   ├── CafeteriaPage.jsx     # Menu ordering with carbon display
│   │   ├── BusTrackingPage.jsx   # Live GPS bus tracking
│   │   ├── AttendancePage.jsx    # QR-based paperless attendance
│   │   ├── ChatbotPage.jsx       # Gemini AI campus assistant
│   │   ├── StudyPlannerPage.jsx  # AI-powered weekly study plan
│   │   ├── LabAssistantPage.jsx  # Subject-based AI lab helper
│   │   ├── NavigationPage.jsx    # Campus wayfinding
│   │   ├── ComplaintsPage.jsx    # Issue submission & tracking
│   │   ├── LostFoundPage.jsx     # Community item recovery
│   │   ├── ProfilePage.jsx       # Eco identity + badges + settings
│   │   └── NotificationsPage.jsx # Filtered notification center
│   ├── driver/
│   │   └── DriverGPSPage.jsx     # Live GPS sharing panel
│   └── admin/
│       ├── AdminLayout.jsx           # Dark sidebar layout
│       ├── AdminDashboard.jsx        # Campus KPI overview
│       ├── AdminSustainabilityPage.jsx # Carbon analytics + challenges
│       ├── AdminUsersPage.jsx         # User table + role management
│       └── AdminComplaintsPage.jsx    # Complaint resolution panel
├── store/
│   └── index.js              # Zustand stores (auth, carbon, cart, notifs)
├── App.jsx                   # Router with lazy-loaded routes
├── main.jsx                  # React entry point
└── index.css                 # Global styles + design system
```

---

## 🏗️ Architecture Overview

```
Browser (React + Vite PWA)
        │
        ├── Zustand State  ──────→ Local UI State
        │
        └── Supabase Client
              ├── Auth     ──────→ JWT Sessions (signup/login)
              ├── Database ──────→ PostgreSQL + RLS Policies
              ├── Realtime ──────→ Live bus locations, order updates
              └── Storage  ──────→ Profile images, lost-found photos
```

---

## 👥 User Roles & Access

| Role | Entry Point | Access |
|---|---|---|
| **Student** | `/register` or `/login` | Dashboard, Carbon Logger, Cafeteria, Bus, All modules |
| **Driver** | `/login` → auto-redirect | `/driver/gps` — GPS sharing panel only |
| **Admin** | `/secure-admin-panel/login` | Full admin panel (all data, reports, management) |

---

## 🌿 Carbon Calculation Engine

Located in `src/lib/carbonCalc.js` — uses **IPCC standard emission factors**:

| Category | Factor | Source |
|---|---|---|
| College Bus | 0.048 kg CO2/km | IPCC Transport |
| Motorbike | 0.120 kg CO2/km | IPCC Transport |
| Car (solo) | 0.210 kg CO2/km | IPCC Transport |
| Vegan meal | 0.30 kg CO2/meal | Food GHG Database |
| Non-veg (chicken) | 1.50 kg CO2/meal | Food GHG Database |
| AC (1 ton, 1hr) | 1.230 kg CO2/hr | India Grid Factor 0.82 |
| Walking/Cycling | 0.000 kg CO2 | Zero emission |

**Daily Budget:** 5.0 kg CO2 per student  
**Eco Score:** `max(0, 100 - (total_kg / 5.0) × 100)`

---

## 🗃️ Database Schema

15 tables with Row Level Security (RLS):
`profiles` · `carbon_logs` · `eco_badges` · `green_challenges` · `challenge_participants` · `buses` · `bus_locations` · `menu_items` · `orders` · `attendance_sessions` · `attendance_records` · `complaints` · `lost_found_items` · `campus_locations` · `notifications`

➡️ Run `schema.sql` in your Supabase SQL Editor to set up everything.

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy /dist folder to Vercel
# Set all VITE_ environment variables in Vercel dashboard
```

### Environment Variables for Production
Set these in your hosting platform (Vercel / Netlify):
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
VITE_ADMIN_SECRET_KEY
```

---

## 📋 Available Scripts

```bash
npm run dev      # Start dev server at localhost:5173
npm run build    # Production build → /dist
npm run preview  # Preview production build locally
```

---

## 🏅 Features At A Glance

- ✅ **Carbon Tracker** — 5-category daily logger with live CO2 calculation
- ✅ **Eco Score Ring** — Animated SVG score (0–100) with IPCC grading
- ✅ **Leaderboard** — Campus + Department rankings + weekly challenges
- ✅ **16 Eco Badges** — Automated gamification rewards
- ✅ **AI Chatbot** — Gemini-powered campus sustainability assistant
- ✅ **Bus Tracking** — Real-time GPS from driver panel → student view
- ✅ **Cafeteria** — Menu ordering with carbon impact shown per item
- ✅ **QR Attendance** — Paperless, instant, eco-points rewarded
- ✅ **Study Planner** — AI-generated 7-day schedules
- ✅ **Lab Assistant** — Subject-specific AI for experiment help
- ✅ **Complaints** — Priority-based ticketing with admin response
- ✅ **Lost & Found** — Community-verified item recovery
- ✅ **Admin Panel** — Full analytics, user management, challenge creation
- ✅ **Driver GPS** — Live location broadcasting with emergency alert
- ✅ **Mobile-First** — Bottom tab bar, touch-friendly, PWA-ready

---

*Built with 🌿 for a greener, smarter campus.*

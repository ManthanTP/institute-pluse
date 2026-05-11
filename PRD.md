================================================================================

        ███████╗ ██████╗███████╗ █████╗ ███████╗
        ██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝
        ███████╗██║     ███████╗███████║███████╗
        ╚════██║██║     ╚════██║██╔══██║╚════██║
        ███████║╚██████╗███████║██║  ██║███████║
        ╚══════╝ ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝

     Smart Campus Sustainability & Assistant System
     ───────────────────────────────────────────────
     PRODUCT REQUIREMENTS DOCUMENT (PRD)
     Version  : 2.0  |  Production Ready
     Date     : May 2026
     Document : Full Stack PRD — Mobile-First PWA + Native
     Status   : Final Draft
     Suitable : VTU Final Project | Hackathon | GitHub | Resume | Startup MVP

================================================================================



════════════════════════════════════════════════════════════════════════════════
  EXECUTIVE SUMMARY
════════════════════════════════════════════════════════════════════════════════

  SCSAS is a mobile-first smart campus platform where sustainability is not
  a module — it IS the core of everything. Every feature, screen, and data
  point is designed around reducing, tracking, and rewarding eco-friendly
  behavior on campus.

  The Carbon Footprint Tracker is the heartbeat of the platform. Every other
  module — bus tracking, cafeteria, attendance, chatbot — feeds into the
  sustainability engine and enriches the student's environmental profile.

  Students earn eco-points by taking the bus instead of riding a bike, by
  choosing vegetarian meals, by scanning QR codes (paperless attendance),
  and by logging their daily activities. These points power a gamified
  leaderboard that makes sustainability competitive and fun.

  Administrators get a Green Audit Dashboard with department-wise analytics,
  AI-generated sustainability reports, and tools to run campus-wide eco
  challenges.

  CORE PHILOSOPHY
    "Every tap, every scan, every meal choice is a sustainability data point."


════════════════════════════════════════════════════════════════════════════════
  TABLE OF CONTENTS
════════════════════════════════════════════════════════════════════════════════

  SECTION 01 — Project Overview & Goals
  SECTION 02 — System Architecture
  SECTION 03 — Color System & Design Language
  SECTION 04 — User Roles & Access Control
  SECTION 05 — Admin Authentication System
  SECTION 06 — Carbon Calculation Engine
  SECTION 07 — Sustainability Scoring & Gamification
  SECTION 08 — Database Schema (Supabase / PostgreSQL)
  SECTION 09 — API Structure
  SECTION 10 — All Pages & UI Specifications
  SECTION 11 — Admin Panel Pages
  SECTION 12 — Notification Logic
  SECTION 13 — Carbon Integration Across All Modules
  SECTION 14 — Functional Requirements
  SECTION 15 — Non-Functional Requirements
  SECTION 16 — Complete Route Table
  SECTION 17 — Tech Stack & Cost
  SECTION 18 — Development Timeline
  SECTION 19 — Deployment Architecture
  SECTION 20 — Future Scope
  SECTION 21 — Limitations & Assumptions


════════════════════════════════════════════════════════════════════════════════
  SECTION 01 — PROJECT OVERVIEW & GOALS
════════════════════════════════════════════════════════════════════════════════

  APP NAME        : Smart Campus Sustainability & Assistant System
  SHORT NAME      : SCSAS
  TAGLINE         : "Every Action. Every Point. Greener Campus."
  TYPE            : Mobile-First PWA + React Native (Android APK)
  VERSION         : 1.0 MVP

  PLATFORM TARGETS
    Primary   : Android smartphones (via React Native APK)
    Secondary : iOS smartphones (via React Native)
    Tertiary  : Web browser (React PWA — same codebase as admin)
    Admin     : Desktop web (React, Vercel hosted)

  CORE PROBLEM BEING SOLVED
    ┌─────────────────────────────────────────────────────────────────┐
    │ Students are unaware of how their daily habits contribute to    │
    │ carbon emissions. Campus systems are fragmented, manual, and    │
    │ provide no sustainability feedback. There is no single app that │
    │ connects transportation, food, attendance, and academic life    │
    │ to environmental impact data.                                   │
    └─────────────────────────────────────────────────────────────────┘

  SOLUTION
    A unified campus app where carbon awareness is woven into every action.
    Log activities → get eco-score → earn points → compete → improve.

  PRIMARY GOALS
    G-01  : Make carbon footprint tracking simple, daily, and rewarding
    G-02  : Connect every campus service to sustainability metrics
    G-03  : Provide AI-powered personalized eco recommendations
    G-04  : Give admins real department-wise sustainability analytics
    G-05  : Digitize all paper-based campus processes (attendance, complaints)
    G-06  : Enable real-time campus services (bus, food, navigation)

  SUCCESS METRICS
    ┌────────────────────────────────────────────┬──────────────────┐
    │ Metric                                     │ Target           │
    ├────────────────────────────────────────────┼──────────────────┤
    │ Students logging carbon daily              │ > 70%            │
    │ Avg eco-score improvement (month 1 → 3)    │ > 15 points      │
    │ Carbon logs submitted per week             │ > 5 per student  │
    │ Bus usage increase after app launch        │ > 20%            │
    │ Vegetarian meal orders in cafeteria        │ > 40%            │
    │ Paperless attendance adoption              │ 100%             │
    │ Complaint resolution time                  │ < 48 hours       │
    │ App daily active users (DAU)               │ > 60% of campus  │
    └────────────────────────────────────────────┴──────────────────┘


════════════════════════════════════════════════════════════════════════════════
  SECTION 02 — SYSTEM ARCHITECTURE
════════════════════════════════════════════════════════════════════════════════

  ARCHITECTURE OVERVIEW
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                                                                         │
  │   MOBILE (React Native)          WEB (React + Vite PWA)                │
  │   ─────────────────────          ────────────────────                  │
  │   Android APK (primary)          Admin Panel (desktop)                 │
  │   iOS App (secondary)            Student Web Fallback                  │
  │                                                                         │
  │              │                              │                           │
  │              └──────────────┬───────────────┘                          │
  │                             │                                           │
  │                    SUPABASE BACKEND                                     │
  │                    ────────────────                                     │
  │              PostgreSQL Database (tables + RLS)                        │
  │              Supabase Auth (JWT + role-based)                          │
  │              Supabase Storage (images, reports)                        │
  │              Supabase Realtime (bus GPS, orders)                       │
  │              Supabase Edge Functions (scheduled jobs)                  │
  │                             │                                           │
  │              ┌──────────────┼──────────────┐                           │
  │              │              │              │                            │
  │         Gemini API    Leaflet/OSM     Web Push API                     │
  │         (AI Chat +    (Maps)          (Notifications)                  │
  │          Study Plan)                                                   │
  │                                                                         │
  └─────────────────────────────────────────────────────────────────────────┘

  HOW IT WORKS
    — One React Native codebase for Android and iOS mobile apps
    — One React + Vite codebase for admin panel and web fallback
    — Both share the same Supabase backend and database
    — Carbon calculation logic is a shared JS/TS utility (runs on device)
    — Supabase Realtime powers live bus tracking and order updates
    — Gemini API handles AI chatbot, study planning, and eco recommendations
    — All images (food, lost items, avatars) stored in Supabase Storage
    — Supabase Edge Functions handle scheduled eco reminders and badge awards

  FOLDER STRUCTURE — REACT NATIVE (Mobile)
    /src
      /screens
        /auth          Login, Register, AdminLogin
        /student       Dashboard, Carbon, Bus, Cafeteria, Attendance...
        /driver        DriverGPS
        /admin         AdminDashboard, Sustainability, Users...
      /components      Shared UI components
      /navigation      Stack and Tab navigators (React Navigation)
      /hooks           useAuth, useCarbon, useBus, useOrders, useRealtime
      /store           Zustand: auth, cart, carbonDraft, notifications
      /lib             supabase.ts, gemini.ts, carbonCalc.ts, push.ts
      /constants       co2Factors.ts, routes.ts, config.ts
      /types           All TypeScript interfaces

  FOLDER STRUCTURE — REACT + VITE (Web / Admin)
    /src
      /pages
        /auth          /public     /admin
      /components      /layouts    /hooks
      /store           /lib        /constants    /types
    /public            manifest.json, icons
    vite.config.ts     tailwind.config.ts    vercel.json    .env

  PWA CONFIGURATION
    display          : 'browser'   — status bar + nav bar always visible
    orientation      : 'portrait'
    theme_color      : '#166534'   — deep green (sustainability identity)
    background_color : '#ffffff'
    registerType     : 'autoUpdate'
    offline caching  : NetworkFirst (Supabase), CacheFirst (static)

  MOBILE DISPLAY — BROWSER MODE
    The PWA intentionally uses "browser" display mode so:
    — System status bar (time, signal, battery) always visible
    — Android back / home / recent buttons always accessible
    — App feels like a normal phone experience, not locked fullscreen
    — Safe area insets respected for notch devices


════════════════════════════════════════════════════════════════════════════════
  SECTION 03 — COLOR SYSTEM & DESIGN LANGUAGE
════════════════════════════════════════════════════════════════════════════════

  PRIMARY PALETTE
    Eco Green      : #16a34a   Primary actions, CTAs, active states
    Deep Green     : #166534   Headers, sidebar, pressed states
    White          : #ffffff   Backgrounds, cards, panels
    Dark Navy      : #0f172a   Admin navbar, dark text, admin sidebar

  SUPPORTING PALETTE
    Light Green BG : #f0fdf4   Card backgrounds, focus rings, eco sections
    Mint Green     : #bbf7d0   Eco badges, completed states, streaks
    Medium Green   : #22c55e   Hover states, progress bars, good scores
    Gray Text      : #64748b   Body copy, captions, descriptions
    Light Gray     : #f8fafc   Table alternating rows, page backgrounds
    Border Gray    : #e2e8f0   Card borders, input borders, dividers
    Success        : #10b981   Excellent eco-score, resolved, present
    Warning Amber  : #f59e0b   Average score, delayed bus, pending
    Danger Red     : #ef4444   Poor score, absent, cancelled, high priority
    Sky Blue       : #0ea5e9   AI chatbot, info badges, bus tracking
    Earth Brown    : #92400e   Waste tracking, compost badge accent

  ECO SCORE COLOR MAP
    90 – 100   Excellent    #166534   Deep Green
    70 –  89   Good         #16a34a   Eco Green
    50 –  69   Average      #f59e0b   Amber
    25 –  49   Poor         #ef4444   Red
     0 –  24   Critical     #7f1d1d   Dark Red

  TYPOGRAPHY
    Font Family    : Inter (Google Fonts, loaded via @import)
    Display        : 32px / ExtraBold / #0f172a   (hero headings)
    H1             : 28px / Bold     / #0f172a
    H2             : 22px / SemiBold / #0f172a
    H3             : 18px / SemiBold / #0f172a
    Body           : 16px / Regular  / #64748b
    Caption        : 14px / Regular  / #94a3b8
    Label          : 13px / Medium   / #64748b
    Button         : 15px / SemiBold / #ffffff or #16a34a
    Stat Number    : 36px / Bold     / #0f172a   (dashboard stats)

  COMPONENT RULES
    Border Radius  : 16px cards / 10px buttons / 8px inputs / 999px badges
    Card Shadow    : 0 1px 4px rgba(0,0,0,0.06), 0 6px 20px rgba(22,163,74,0.08)
    Button Primary : bg #16a34a, text white, hover #22c55e, active #166534
    Button Ghost   : bg transparent, text #16a34a, border 1.5px #16a34a
    Button Danger  : bg #ef4444, text white
    Input          : border #e2e8f0, focus ring 2px #16a34a, padding 14px 16px
    Eco Score Ring : SVG circle, stroke width 10px, color by score range
    Badge Chip     : bg #f0fdf4, text #16a34a, border #bbf7d0, radius 999px
    Tab Bar Active : icon + label in #16a34a, indicator dot below

  MOBILE LAYOUT WIREFRAME
    ┌───────────────────────────────┐
    │  ▂▂▃▃  10:45  ▓▓▓ 82%       │  ← OS Status Bar (always visible)
    ├───────────────────────────────┤
    │  🌿 SCSAS          🔔  👤    │  ← App Header (48px, deep green bg)
    ├───────────────────────────────┤
    │                               │
    │                               │
    │       Page Content            │  ← Scrollable content area
    │                               │
    │                               │
    │                               │
    ├───────────────────────────────┤
    │  🏠   🌱   🚌   🍽   👤     │  ← Bottom Tab Bar (56px, white bg)
    ├───────────────────────────────┤
    │  ◀     ●      ■               │  ← Android Nav Bar (always visible)
    └───────────────────────────────┘

  ADMIN PANEL DESIGN
    Sidebar bg     : #0f172a   (dark, 260px width, fixed left)
    Content bg     : #f8fafc   (very light gray)
    Card bg        : #ffffff   (white)
    Table rows     : alternating #ffffff and #f8fafc
    Active nav     : left border 3px #16a34a + text #16a34a
    No decorative animations, no illustrations
    Goal: data-dense, functional, fast on desktop


════════════════════════════════════════════════════════════════════════════════
  SECTION 04 — USER ROLES & ACCESS CONTROL
════════════════════════════════════════════════════════════════════════════════

  ROLE OVERVIEW
  ┌──────────────┬────────────────────────────┬───────────────────────────┐
  │ Role         │ Login Entry Point          │ Redirects To              │
  ├──────────────┼────────────────────────────┼───────────────────────────┤
  │ Student      │ /login (public)            │ /dashboard                │
  │ Driver       │ /login (public)            │ /driver/gps               │
  │ Admin        │ /secure-admin-panel/login  │ /admin/dashboard          │
  └──────────────┴────────────────────────────┴───────────────────────────┘

  STUDENT PERMISSIONS
    ✓ Register and manage personal profile
    ✓ Log daily carbon footprint activities
    ✓ View personal eco-score, points, and badges
    ✓ View campus and department leaderboards
    ✓ Join and participate in green challenges
    ✓ Track buses live on map
    ✓ Browse cafeteria menu and place orders
    ✓ Scan QR code for attendance marking
    ✓ View own attendance reports per subject
    ✓ Use AI study planner (Gemini-powered)
    ✓ Use virtual lab assistant (Gemini-powered)
    ✓ Report and browse lost & found items
    ✓ Submit and track complaints
    ✓ Use campus navigation map
    ✓ Receive push notifications and in-app alerts
    ✓ Use AI chatbot for campus queries
    ✗ Cannot view other students' private data
    ✗ Cannot access any admin pages
    ✗ Cannot manage buses, menu, or challenges

  DRIVER PERMISSIONS
    ✓ Login via public /login page
    ✓ Share live GPS location to Supabase
    ✓ Update bus route status (On Route / Delayed / Stopped)
    ✓ Send emergency alerts to admin
    ✓ View assigned bus route and stops
    ✗ Cannot access student data
    ✗ Cannot access admin panel

  ADMIN PERMISSIONS
    ✓ Login via hidden secure URL only
    ✓ View full sustainability analytics dashboard
    ✓ Create, edit, delete green challenges
    ✓ Generate department-wise green audit reports
    ✓ Manage all user accounts (students, drivers)
    ✓ Monitor all bus locations and manage bus routes
    ✓ Manage cafeteria menu (add/edit/delete items + carbon values)
    ✓ View all orders and update status
    ✓ Generate and display attendance QR codes
    ✓ View all attendance records and export reports
    ✓ View, respond to, and resolve all complaints
    ✓ Verify and manage lost & found listings
    ✓ Manage campus navigation locations
    ✓ Send broadcast notifications to any user group
    ✓ View full green audit reports
    ✗ Cannot impersonate students
    ✗ Cannot delete carbon logs (audit integrity)

  SUPABASE ROW LEVEL SECURITY (RLS) POLICY OVERVIEW
    carbon_logs      : student can SELECT/INSERT own rows only
    orders           : student can SELECT own rows, INSERT new
    attendance_records: student can SELECT own rows only
    complaints       : student can SELECT/INSERT own rows only
    lost_found_items : student can SELECT all, INSERT own, UPDATE own
    notifications    : user can SELECT own rows only
    profiles         : user can SELECT own row, UPDATE own (except role)
    buses            : student can SELECT only, driver can UPDATE own bus
    All tables       : admin can SELECT/INSERT/UPDATE/DELETE all rows


════════════════════════════════════════════════════════════════════════════════
  SECTION 05 — ADMIN AUTHENTICATION SYSTEM
════════════════════════════════════════════════════════════════════════════════

  OVERVIEW
    The admin authentication system follows a multi-layer security model.
    It is intentionally hidden, requires a secret key, and uses JWT-based
    session management through Supabase Auth with role verification.

  SECRET ADMIN ROUTE
    URL  : /secure-admin-panel/login
    Rule : Never linked, never mentioned, never appears in app code comments
    Only people who know this exact URL can even see the login form
    This URL is the FIRST security layer — security through obscurity + auth

  ADMIN REGISTRATION (one-time setup)
    Step 1 : Admin navigates to /secure-admin-panel/login
    Step 2 : Clicks "Register Admin" (visible only if no admin exists)
    Step 3 : Enters: Full Name, Admin Email, Password, SECRET ADMIN KEY
    Step 4 : System validates SECRET ADMIN KEY against env variable
             VITE_ADMIN_SECRET_KEY stored in .env (never in source code)
    Step 5 : If key matches: Supabase creates user + sets role = 'admin'
    Step 6 : "Register Admin" button disappears once first admin is created
    Step 7 : Subsequent admins can only be created by existing admins

  ADMIN LOGIN FLOW
    Step 1 : Admin navigates to /secure-admin-panel/login
    Step 2 : Enters email + password + SECRET ADMIN KEY
    Step 3 : System calls supabase.auth.signInWithPassword()
    Step 4 : On success: fetches profiles table to verify role = 'admin'
    Step 5 : If role check fails: session immediately signed out
             Error shown: "Access denied. Unauthorized account."
    Step 6 : JWT access token stored in secure httpOnly context
    Step 7 : Admin redirected to /admin/dashboard
    Step 8 : All subsequent /admin/* route loads re-verify role from profiles

  ADMIN LOGIN PAGE DESIGN
    — Full dark background (#0f172a)
    — Small centered card, NO SCSAS branding, NO green colors
    — Title: "System Access" (generic, not "Admin Login")
    — Fields: Email | Password | Admin Key (masked input)
    — Button: "Authenticate" (neutral gray)
    — No register link visible after first admin is created
    — Failed login: generic "Authentication failed" — no specifics

  SECURITY LAYERS SUMMARY
  ┌────────────────────────────────────────────────────────────────────┐
  │ Layer 1 : Hidden URL    /secure-admin-panel/login not linked       │
  │ Layer 2 : Secret Key    VITE_ADMIN_SECRET_KEY in server .env       │
  │ Layer 3 : Supabase Auth Email + password authentication            │
  │ Layer 4 : Role Check    profiles.role must equal 'admin'           │
  │ Layer 5 : AdminRoute    Every /admin/* re-verifies role per load   │
  │ Layer 6 : Supabase RLS  DB-level row policies block all access     │
  │ Layer 7 : JWT Expiry    Tokens expire, refresh tokens rotate       │
  └────────────────────────────────────────────────────────────────────┘

  ROUTE GUARD COMPONENTS
    PublicRoute   : Redirects to /dashboard if session already active
    ProtectedRoute: Verifies session; redirects to /login if missing
    AdminRoute    : Verifies session AND role = 'admin'; else /login
    DriverRoute   : Verifies session AND role = 'driver'; else /login

  SESSION HANDLING
    — Supabase handles JWT issuance and refresh automatically
    — Access token expires every 1 hour (configurable in Supabase dashboard)
    — Refresh token rotates on each use
    — On logout: supabase.auth.signOut() called, local state cleared
    — Admin sessions do not persist beyond browser close (no rememberMe)


════════════════════════════════════════════════════════════════════════════════
  SECTION 06 — CARBON CALCULATION ENGINE
════════════════════════════════════════════════════════════════════════════════

  OVERVIEW
    The carbon calculation engine is a pure TypeScript/JavaScript utility
    module (carbonCalc.ts) that runs entirely on the client device.
    No external API calls needed. Results are saved to Supabase after calculation.
    Uses IPCC standard emission factors as the base values.

  MASTER FORMULA
  ┌────────────────────────────────────────────────────────────────────┐
  │                                                                    │
  │  Total Daily CO2 (kg) =                                           │
  │    Transport Emissions                                             │
  │    + Electricity Emissions                                         │
  │    + Food Emissions                                                │
  │    + Water Emissions                                               │
  │    + Waste Emissions                                               │
  │                                                                    │
  └────────────────────────────────────────────────────────────────────┘

  ── CATEGORY 1: TRANSPORTATION ──────────────────────────────────────

    Formula : CO2 = distance_km × emission_factor

    MODE                  FACTOR (kg CO2/km)   NOTE
    ─────────────────────────────────────────────────────────────────
    Motorbike / Scooter   0.120               Most common in India
    Car (Petrol)          0.210               Per passenger solo
    Car (Shared, 4 pax)   0.053               Carpooling discount
    College Bus           0.048               Per passenger
    City Bus              0.089               Public transport
    Auto Rickshaw (CNG)   0.076               CNG
    Electric Scooter      0.025               Low but not zero
    Bicycle               0.000               Zero emission
    Walking               0.000               Zero emission

    Example:
      5 km motorbike = 5 × 0.120 = 0.600 kg CO2
      5 km college bus = 5 × 0.048 = 0.240 kg CO2
      Savings by taking bus = 0.360 kg CO2

    SUSTAINABILITY TIE-IN:
      After submitting transport log, system shows:
      "You saved X kg CO2 by taking the bus instead of riding. +15 eco-points!"

  ── CATEGORY 2: FOOD CONSUMPTION ────────────────────────────────────

    Formula : CO2 = sum of (emission_factor per meal per meal slot)

    MEAL TYPE             FACTOR (kg CO2/meal)  NOTE
    ─────────────────────────────────────────────────────────────────
    Vegan meal            0.30                 Lowest footprint
    Vegetarian meal       0.50                 Plant-based
    Egg-based meal        0.80                 Moderate
    Non-veg (chicken)     1.50                 Livestock emissions
    Non-veg (beef/mutton) 3.50                 Highest footprint
    Skipped meal          0.00                 Zero, not encouraged

    Three meal slots: Breakfast, Lunch, Dinner
    Max daily food CO2 if all non-veg: up to 10.5 kg
    Min daily food CO2 if all vegan: 0.90 kg

  ── CATEGORY 3: ELECTRICITY USAGE ───────────────────────────────────

    Formula : CO2 = Σ (hours_used × device_factor)
    India grid emission factor: 0.82 kg CO2 per kWh (CEA 2023)

    DEVICE                POWER (kW)   CO2/hour
    ─────────────────────────────────────────────
    Air Conditioner (1T)  1.50 kW      1.230 kg/hr
    Air Conditioner (1.5T)1.80 kW      1.476 kg/hr
    Desktop PC            0.20 kW      0.164 kg/hr
    Laptop                0.05 kW      0.041 kg/hr
    Mobile Charging       0.01 kW      0.008 kg/hr
    Ceiling Fan           0.07 kW      0.057 kg/hr
    LED Bulb (9W)         0.009 kW     0.007 kg/hr
    Washing Machine       0.50 kW      0.410 kg/hr

  ── CATEGORY 4: WATER USAGE ─────────────────────────────────────────

    Formula : CO2 = Σ (activity × water_factor)
    Water treatment & heating emission: 0.003 kg CO2/litre

    ACTIVITY              USAGE           CO2
    ─────────────────────────────────────────────
    Short shower (5 min)  50 litres       0.150 kg
    Medium shower (10min) 100 litres      0.300 kg
    Long shower (15min+)  150+ litres     0.450+ kg
    Bucket bath           15 litres       0.045 kg
    General daily use     slider input    calculated

  ── CATEGORY 5: WASTE GENERATION ────────────────────────────────────

    Formula : CO2 = waste_kg × waste_factor

    WASTE TYPE            FACTOR (kg CO2/kg waste)
    ─────────────────────────────────────────────────
    General mixed waste   0.50
    Plastic waste         0.60
    Paper waste           0.20
    Organic / Compost     0.05   (best: nearly no landfill emission)
    Recycled              0.10   (credit for recycling effort)

  ── DAILY CARBON SUMMARY CALCULATION ────────────────────────────────

    total_kg = transport + electricity + food + water + waste

  ── ECO SCORE FORMULA ───────────────────────────────────────────────

    Campus daily carbon budget per student: 5.0 kg CO2 (configurable)

    raw_score = max(0, 100 - ((total_kg / budget_kg) × 100))

    SCORE   GRADE       COLOR       LABEL
    ─────────────────────────────────────────
    90-100  Excellent   #166534     "Eco Champion"
    70-89   Good        #16a34a     "Eco Friendly"
    50-69   Average     #f59e0b     "Room to Improve"
    25-49   Poor        #ef4444     "Needs Attention"
    0-24    Critical    #7f1d1d     "High Impact Day"

  ── WEEKLY AND MONTHLY AGGREGATION ──────────────────────────────────

    weekly_avg   = sum(daily_total_kg for 7 days) / 7
    monthly_avg  = sum(daily_total_kg for 30 days) / 30
    monthly_total = sum(daily_total_kg for 30 days)
    best_day_score = max(eco_score) in period
    worst_day_score = min(eco_score) in period

  ── COMPARATIVE ANALYTICS ───────────────────────────────────────────

    campus_avg_daily  = avg(total_kg) across all students for date range
    dept_avg_daily    = avg(total_kg) for all students in department
    student_vs_campus = student_avg - campus_avg (negative = better)
    student_vs_dept   = student_avg - dept_avg


════════════════════════════════════════════════════════════════════════════════
  SECTION 07 — SUSTAINABILITY SCORING & GAMIFICATION
════════════════════════════════════════════════════════════════════════════════

  ECO-POINTS EARNING RULES
  ┌────────────────────────────────────────────┬────────────┐
  │ Action                                     │ Points     │
  ├────────────────────────────────────────────┼────────────┤
  │ Daily carbon log submitted                 │ +10 pts    │
  │ Eco score 70–89 (Good)                     │ +20 pts    │
  │ Eco score 90–100 (Excellent)               │ +40 pts    │
  │ Eco score 100 (Perfect day)                │ +60 pts    │
  │ 3-day logging streak                       │ +30 pts    │
  │ 7-day logging streak                       │ +75 pts    │
  │ 30-day logging streak                      │ +200 pts   │
  │ Chose bicycle or walking for transport     │ +15 pts    │
  │ Took college bus (vs motorbike equivalent) │ +12 pts    │
  │ Vegetarian or vegan all meals today        │ +10 pts    │
  │ Fully vegan day                            │ +15 pts    │
  │ Participated in a green challenge          │ +25 pts    │
  │ Completed a green challenge                │ +50–150pts │
  │ QR attendance scan (paperless)             │ +5 pts     │
  │ Placed cafeteria order (less food waste)   │ +5 pts     │
  │ Reported a found item (community help)     │ +8 pts     │
  │ First carbon log ever                      │ +50 pts    │
  │ Profile setup complete                     │ +20 pts    │
  └────────────────────────────────────────────┴────────────┘

  BADGE SYSTEM
  ┌───────────────────────┬──────────────────────────────────────────────┐
  │ Badge Name            │ Requirement                                  │
  ├───────────────────────┼──────────────────────────────────────────────┤
  │ 🌱 First Step         │ Submitted first carbon log                   │
  │ 🚴 Pedal Power        │ Used bicycle or walking 5 days               │
  │ 🌿 Green Streak       │ 7 consecutive days logged                    │
  │ 🏆 Eco Champion       │ Eco score above 90 for 5 different days      │
  │ 🥗 Veggie Week        │ All vegetarian meals for 7 days              │
  │ 🌱 Vegan Day          │ All vegan meals on one day                   │
  │ 🚌 Bus Buddy          │ Used college bus 10 times (logged)           │
  │ ⚡ Energy Saver       │ Electricity CO2 under 0.2 kg for 5 days      │
  │ 🗑️ Zero Waste Hero    │ Only organic/recycled waste for 7 days       │
  │ 🔥 30-Day Streak      │ Logged every day for 30 days                 │
  │ 🌍 Campus Hero        │ Ranked #1 on leaderboard any week            │
  │ 🏅 Challenge Winner   │ Completed any green challenge                │
  │ 💧 Water Wise         │ Shower < 5 min for 10 days                   │
  │ 🌟 Perfect Day        │ Eco score of 100 on any day                  │
  │ 🌲 Tree Planter       │ 1000 eco-points milestone                    │
  │ 🌏 Planet Guardian    │ 5000 eco-points milestone                    │
  └───────────────────────┴──────────────────────────────────────────────┘

  LEADERBOARD STRUCTURE
    CAMPUS LEADERBOARD     : All students, ranked by eco-points this week/month
    DEPARTMENT LEADERBOARD : Filtered by department
    CHALLENGE LEADERBOARD  : Specific to active challenges
    ALL TIME LEADERBOARD   : Total eco-points ever earned

    Leaderboard row data:
      rank | avatar_initial | student_name | department | eco_points | eco_score_avg | badges_count

  GREEN CHALLENGES
    Challenges are created by admin and are campus-wide events.

    Challenge object:
      title           : "Zero Petrol Week"
      description     : "Use only bus, bicycle, or walk for 7 days"
      category        : 'transport' | 'food' | 'electricity' | 'water' | 'waste' | 'mixed'
      target_metric   : 'transport_kg' | 'eco_score' | 'streak' | 'specific_mode'
      target_value    : numeric target (e.g. 0 for zero petrol days)
      duration_days   : 7
      start_date      : date
      end_date        : date
      points_reward   : 100
      badge_reward    : 'challenge_winner' badge id
      max_participants: null (unlimited) or integer

    Challenge completion logic (Supabase Edge Function runs daily):
      FOR EACH student IN challenge_participants
        CHECK if they meet the target_metric condition
        IF yes AND end_date reached → mark completed, award points + badge

  AI SUSTAINABILITY RECOMMENDATIONS (Gemini-powered)
    After each daily log submission, the system calls Gemini API with:
      — Today's CO2 breakdown (per category)
      — Student's 7-day history (avg per category)
      — Student's top emission category
      — Current eco-score

    Gemini returns 3 personalized tips:
      Example outputs:
      "Your transport is your biggest contributor today (0.6 kg).
       Taking the college bus instead tomorrow saves 0.36 kg daily —
       that's 10.8 kg monthly."
      "You chose non-veg meals for all 3 meals (4.0 kg food CO2).
       Replacing one meal with vegetarian saves 1.5 kg per day."
      "Your AC usage is high. Setting it to 24°C instead of 20°C
       cuts electricity CO2 by about 30%."

    Tips rendered below the carbon summary card with leaf icon.


════════════════════════════════════════════════════════════════════════════════
  SECTION 08 — DATABASE SCHEMA (Supabase / PostgreSQL)
════════════════════════════════════════════════════════════════════════════════

  ── TABLE: profiles ─────────────────────────────────────────────────
    id              uuid          PK, references auth.users
    full_name       text          NOT NULL
    role            text          CHECK IN ('student','admin','driver')
    phone           text
    department      text          CSE | ECE | ME | Civil | MBA | Other
    avatar_url      text
    eco_points      integer       DEFAULT 0
    total_co2_kg    float         DEFAULT 0  (running total, updated daily)
    logging_streak  integer       DEFAULT 0  (consecutive days logged)
    last_log_date   date
    push_token      text          For web push notifications
    created_at      timestamptz   DEFAULT now()

  ── TABLE: carbon_logs ──────────────────────────────────────────────
    id                  uuid    PK
    student_id          uuid    FK → profiles.id
    log_date            date    NOT NULL
    transport_kg        float   DEFAULT 0
    electricity_kg      float   DEFAULT 0
    food_kg             float   DEFAULT 0
    water_kg            float   DEFAULT 0
    waste_kg            float   DEFAULT 0
    total_kg            float   GENERATED (sum of above)
    eco_score           integer 0-100
    eco_points_earned   integer
    transport_mode      text    e.g. 'motorbike' | 'bus' | 'bicycle'
    transport_km        float
    transport_detail    jsonb   [{mode, km, co2}]
    meals_detail        jsonb   [{slot:'breakfast', type:'vegetarian', co2:0.5}]
    devices_detail      jsonb   [{device:'ac', hours:3, co2:3.69}]
    water_detail        jsonb   {shower_mins: 10, general_litres: 20}
    waste_detail        jsonb   [{type:'recycled', kg:0.5}]
    ai_tips             jsonb   [tip1, tip2, tip3] (from Gemini)
    created_at          timestamptz

    CONSTRAINT: UNIQUE(student_id, log_date)  — one log per student per day

  ── TABLE: eco_badges ───────────────────────────────────────────────
    id              uuid    PK
    student_id      uuid    FK → profiles.id
    badge_key       text    e.g. 'first_step' | 'green_streak'
    badge_name      text
    badge_emoji     text
    earned_at       timestamptz

  ── TABLE: green_challenges ─────────────────────────────────────────
    id                  uuid    PK
    title               text    NOT NULL
    description         text
    category            text
    target_metric       text
    target_value        float
    duration_days       integer
    start_date          date
    end_date            date
    points_reward       integer DEFAULT 100
    badge_reward_key    text    FK → badge definition
    max_participants    integer NULL = unlimited
    created_by          uuid    FK → profiles (admin)
    created_at          timestamptz

  ── TABLE: challenge_participants ───────────────────────────────────
    id              uuid    PK
    challenge_id    uuid    FK → green_challenges.id
    student_id      uuid    FK → profiles.id
    joined_at       timestamptz
    completed       boolean DEFAULT false
    completed_at    timestamptz NULL

  ── TABLE: buses ────────────────────────────────────────────────────
    id              uuid    PK
    bus_number      text    NOT NULL UNIQUE  e.g. 'Bus 1'
    route_name      text    e.g. 'City Center Route'
    driver_id       uuid    FK → profiles (driver role)
    status          text    CHECK IN ('on_route','delayed','stopped')
    carbon_saved_kg float   Running total CO2 saved by students using this bus

  ── TABLE: bus_locations ────────────────────────────────────────────
    id              uuid    PK
    bus_id          uuid    FK → buses.id
    latitude        float   NOT NULL
    longitude       float   NOT NULL
    accuracy_m      float   GPS accuracy in metres
    updated_at      timestamptz DEFAULT now()

  ── TABLE: bus_routes ───────────────────────────────────────────────
    id              uuid    PK
    bus_id          uuid    FK → buses.id
    stop_name       text
    stop_order      integer
    latitude        float
    longitude       float
    est_minutes     integer  Estimated minutes from first stop

  ── TABLE: menu_items ───────────────────────────────────────────────
    id              uuid    PK
    name            text    NOT NULL
    description     text
    category        text    CHECK IN ('breakfast','lunch','snacks','beverages')
    price           numeric NOT NULL
    image_url       text
    available       boolean DEFAULT true
    is_vegetarian   boolean DEFAULT false
    is_vegan        boolean DEFAULT false
    carbon_kg       float   CO2 per serving (used in sustainability display)
    created_at      timestamptz

  ── TABLE: orders ───────────────────────────────────────────────────
    id              uuid    PK
    student_id      uuid    FK → profiles.id
    items           jsonb   [{item_id, name, qty, price, carbon_kg}]
    total_price     numeric
    total_carbon_kg float   Sum of (carbon_kg × qty) for all items
    status          text    CHECK IN ('pending','preparing','ready','delivered','cancelled')
    token_number    integer AUTO-GENERATED sequential per day
    qr_code         text    UUID or hash used for QR generation
    created_at      timestamptz

  ── TABLE: attendance_sessions ──────────────────────────────────────
    id              uuid    PK
    subject         text    NOT NULL
    teacher_id      uuid    FK → profiles.id
    qr_token        text    NOT NULL UNIQUE  Random UUID
    expires_at      timestamptz NOT NULL
    session_date    date    DEFAULT today
    created_at      timestamptz

  ── TABLE: attendance_records ───────────────────────────────────────
    id              uuid    PK
    session_id      uuid    FK → attendance_sessions.id
    student_id      uuid    FK → profiles.id
    marked_at       timestamptz
    CONSTRAINT UNIQUE(session_id, student_id)  — no double marking

  ── TABLE: study_plans ──────────────────────────────────────────────
    id              uuid    PK
    student_id      uuid    FK → profiles.id
    subjects        jsonb   [{name, exam_date, topics:[]}]
    exam_dates      jsonb   {subject: date}
    daily_hours     integer
    generated_plan  jsonb   AI response structured as weekly schedule
    created_at      timestamptz
    updated_at      timestamptz

  ── TABLE: study_tasks ──────────────────────────────────────────────
    id              uuid    PK
    plan_id         uuid    FK → study_plans.id
    student_id      uuid    FK → profiles.id
    task_name       text
    subject         text
    scheduled_date  date
    completed       boolean DEFAULT false
    completed_at    timestamptz NULL

  ── TABLE: campus_locations ─────────────────────────────────────────
    id              uuid    PK
    name            text    NOT NULL
    type            text    CHECK IN ('classroom','lab','office','canteen','block','parking','sports')
    building        text
    floor           text
    latitude        float
    longitude       float
    description     text
    created_at      timestamptz

  ── TABLE: lost_found_items ─────────────────────────────────────────
    id              uuid    PK
    reported_by     uuid    FK → profiles.id
    type            text    CHECK IN ('lost','found')
    item_name       text    NOT NULL
    description     text
    image_url       text
    location_found  text
    contact_visible boolean DEFAULT false
    status          text    CHECK IN ('open','claimed','resolved')
    verified        boolean DEFAULT false
    verified_by     uuid    NULL, FK → profiles (admin)
    created_at      timestamptz

  ── TABLE: complaints ───────────────────────────────────────────────
    id              uuid    PK
    student_id      uuid    FK → profiles.id
    category        text    CHECK IN ('academic','infrastructure','transport','sustainability','food','other')
    title           text    NOT NULL
    description     text    NOT NULL
    priority        text    CHECK IN ('low','medium','high','urgent')
    status          text    CHECK IN ('open','in_progress','resolved','closed')
    admin_response  text
    responded_by    uuid    NULL, FK → profiles (admin)
    created_at      timestamptz
    updated_at      timestamptz

  ── TABLE: notifications ────────────────────────────────────────────
    id              uuid    PK
    user_id         uuid    FK → profiles.id
    title           text    NOT NULL
    message         text    NOT NULL
    type            text    CHECK IN ('bus','order','attendance','complaint','eco','challenge','general')
    action_url      text    Deep link: '/carbon' or '/complaints' etc
    is_read         boolean DEFAULT false
    created_at      timestamptz

  ── TABLE: admin_audit_log ──────────────────────────────────────────
    id              uuid    PK
    admin_id        uuid    FK → profiles.id
    action          text    e.g. 'verified_item' | 'resolved_complaint'
    target_table    text
    target_id       uuid
    metadata        jsonb
    created_at      timestamptz


════════════════════════════════════════════════════════════════════════════════
  SECTION 09 — API STRUCTURE
════════════════════════════════════════════════════════════════════════════════

  All data operations go through Supabase client SDK.
  Supabase Edge Functions handle server-side logic that cannot run on device.

  ── SUPABASE EDGE FUNCTIONS ──────────────────────────────────────────

    FUNCTION: daily-eco-processor
      Trigger  : Cron — daily at 23:59
      Logic    :
        FOR each student who logged today:
          Calculate badge eligibility
          Award new badges to eco_badges table
          Update profiles.logging_streak
          Update profiles.total_co2_kg
          Check challenge completion conditions
          Award challenge points and badges if completed
          Insert eco reminder notification for students who did NOT log

    FUNCTION: award-eco-points
      Trigger  : Called after carbon_logs INSERT
      Input    : student_id, eco_score, transport_mode, meals_detail
      Logic    :
        Calculate points earned (using rules from Section 07)
        UPDATE profiles SET eco_points = eco_points + earned
        INSERT into eco_badges if new badge criteria met
        INSERT notification: "You earned X eco-points today!"

    FUNCTION: generate-qr-session
      Trigger  : Admin API call
      Input    : subject, teacher_id, expiry_minutes
      Logic    :
        Generate UUID as qr_token
        Set expires_at = now() + expiry_minutes
        INSERT into attendance_sessions
        Return qr_token for QR code generation

    FUNCTION: send-broadcast-notification
      Trigger  : Admin action
      Input    : title, message, type, target (all / dept / role)
      Logic    :
        Query profiles matching target criteria
        INSERT one row per user into notifications table
        Send Web Push via push_token if available

    FUNCTION: green-audit-report
      Trigger  : Admin API call
      Input    : date_range, department (optional)
      Logic    :
        Aggregate carbon_logs data for range
        Group by department if requested
        Calculate totals, averages, eco-scores
        Return structured JSON for frontend chart rendering

  ── GEMINI API CALLS ────────────────────────────────────────────────

    ENDPOINT: Eco Recommendations
      Called after : carbon log submission
      System prompt: "You are a campus sustainability advisor.
        Analyze this student's carbon data and give 3 concise,
        actionable, specific tips to reduce their footprint tomorrow.
        Format as JSON array of strings."
      User message : JSON of today's carbon_logs row

    ENDPOINT: Study Plan Generator
      System prompt: "You are an academic study planner.
        Create a day-by-day study schedule based on the subjects,
        exam dates, and daily hours provided.
        Return as JSON: {week: [{day, tasks:[{subject, topic, hours}]}]}"
      User message : JSON of subjects + exam_dates + daily_hours

    ENDPOINT: AI Chatbot
      System prompt: "You are SCSAS — the Smart Campus Sustainability
        Assistant. You know about carbon footprint tracking,
        campus bus routes, cafeteria menu, attendance, and sustainability.
        Be concise, helpful, and eco-aware."
      User message : Student's typed query + conversation history

    ENDPOINT: Lab Assistant
      System prompt: "You are a virtual lab assistant for [subject].
        Help students understand experiments, procedures, and prepare
        for viva examinations. Be clear and structured."
      User message : Student's question


════════════════════════════════════════════════════════════════════════════════
  SECTION 10 — ALL PAGES & UI SPECIFICATIONS
════════════════════════════════════════════════════════════════════════════════

  Each page specification includes:
    PURPOSE   — what this screen does and why it exists
    SECTIONS  — content areas from top to bottom
    KEY UI    — specific components and interaction notes
    MOBILE    — mobile-specific adaptations
    CARBON TIE-IN — how this page connects to sustainability

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 01 — ONBOARDING / LANDING
  Route: /
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  First impression page. Must communicate the sustainability mission
  in under 5 seconds. Converts visitors into registered students.

SECTIONS
  1. NAVBAR
     Logo: 🌿 SCSAS on dark navy | Links: Features / About / Contact
     Right: Login (ghost) + Register (green filled)
     Mobile: hamburger → full-width slide-down menu

  2. HERO
     Headline: "Every Campus Action Has a Carbon Footprint."
     Subline:  "Track it. Reduce it. Earn rewards. All from one app."
     CTAs: "Start Tracking" (green) | "See How It Works" (ghost)
     Visual: animated circular eco-score ring counting up to 87

  3. LIVE CAMPUS STAT TICKER
     Real-time numbers from Supabase (read-only public query):
     "🌍 Today: 847 kg CO2 logged | 🏆 Top scorer: 96/100 | 🚌 42 bus rides taken"

  4. FEATURES GRID (8 tiles, 4×2 desktop, 2×4 mobile)
     🌱 Carbon Tracker | 🚌 Bus Tracking | 🍽️ Cafeteria | 🎓 Attendance
     📅 Study Planner  | 📍 Navigation   | 🔍 Lost & Found | 🤖 AI Chat

  5. HOW IT WORKS (3 steps)
     Step 1: Register with college email → 2 min setup
     Step 2: Log your daily activities → get your eco-score
     Step 3: Earn points, climb leaderboard, win challenges

  6. CARBON IMPACT COUNTER
     Animated number: "Our campus has saved X kg CO2 this semester"
     Updated from Supabase aggregate query

  7. FINAL CTA — full green banner
     "Join 1,200+ students already tracking their carbon footprint."
     Button: "Get Started — It's Free"

  8. FOOTER
     Logo | Links | "Built for a greener campus" | © 2026 SCSAS

KEY UI
  Eco-score ring animation on hero section draws immediate attention
  Live stats ticker makes platform feel active and real
  All CTAs are large (48px height minimum) for mobile tap

MOBILE
  Hero headline 24px, stacked buttons full width
  Feature tiles 2-column grid
  Steps stack vertically with number circles

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 02 — REGISTER
  Route: /register
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Student and driver account creation. Role determines post-login experience.

SECTIONS
  1. Card: 🌿 SCSAS logo | "Join the Green Campus Movement"
  2. FORM
     Full Name | College Email | Phone | Department dropdown
     Role card selector: 👨‍🎓 Student | 🚌 Driver
     Password + confirm | strength bar
  3. Terms checkbox: "I agree to use this app for a greener campus"
  4. "Create Account" green button (full width)
  5. "Already registered? Login" link

KEY UI
  Role selector: large styled cards with icon + description, not radio buttons
  Password strength: 4-level bar (weak/fair/good/strong)
  Inline validation on blur for each field

MOBILE: full-width card, 48px input height, keyboard-aware scroll

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 03 — LOGIN
  Route: /login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Student and driver login. Zero mention of admin. Clean and fast.

SECTIONS
  1. Card: 🌿 SCSAS | "Welcome back, eco-warrior"
  2. Email input | Password + show/hide | "Forgot password?" right link
  3. "Sign In" green button | spinner while authenticating
  4. "New here? Create account" link

KEY UI
  Auto-redirect to /dashboard if session already active
  Error: "Invalid credentials" — no specifics about which field

MOBILE: full-screen centered card

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 04 — HIDDEN ADMIN LOGIN
  Route: /secure-admin-panel/login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Secure hidden admin entry. No app branding. No green colors. No links.
  See Section 05 for full authentication logic.

SECTIONS
  1. Dark full-page bg (#0f172a)
  2. Small white card: "System Access" title (no logo)
  3. Email | Password | Admin Key (masked, eye toggle)
  4. "Authenticate" button (gray, not green)
  5. Failed: "Authentication failed" (no field specifics)

KEY UI
  Admin Key field is a masked password-type input
  No register link after first admin created
  Three failed attempts: 60-second lockout on client side

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 05 — STUDENT DASHBOARD
  Route: /dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  The student's daily mission control. Opens every morning to show
  eco-score, campus stats, and fast access to all modules.

SECTIONS
  1. TOP BAR
     "🌿 Good morning, [Name]"
     Right: notification bell (with unread badge) + avatar

  2. TODAY'S ECO HERO CARD (full width, prominent)
     Large SVG eco-score ring: score number in center (e.g. "74")
     Grade label: "Good — Eco Friendly"
     Sub: "2.3 kg CO2 logged today | +30 eco-points earned"
     "Log Today's Activity" CTA if not yet logged today
     "View Details" CTA if already logged

  3. QUICK STATS (horizontal scroll row)
     🏆 Eco Points: "1,240 pts — Rank #5 this week"
     🚌 Bus ETA: "Bus 3 — 8 min to Main Gate"
     🎓 Attendance: "82% avg — 2 subjects below 75%"
     🍽️ Order: "Masala Dosa — Preparing" or "No active order"

  4. ECO STREAK BANNER (shown if streak > 0)
     🔥 "7-day logging streak! Keep it going."

  5. MODULE GRID (2-column, 12 tiles)
     🌱 Carbon Log  | 🚌 Bus Track
     📊 My Carbon   | 🏆 Leaderboard
     🍽️ Cafeteria   | 🎓 Attendance
     📅 Study Plan  | 🤖 Lab AI
     📍 Navigation  | 🔍 Lost & Found
     🧾 Complaints  | 💬 AI Chat
     Each tile: colored icon circle (64px) + label + tap → page

  6. TODAY'S TASKS (from Study Planner)
     3 task rows with checkboxes | "View All" link

  7. 🌿 ECO TIP OF THE DAY
     Green card: rotating daily tip pulled from Gemini or static pool
     "Tip: Using the college bus instead of a bike for 5 km saves
      0.36 kg CO2 per day — that's 10.8 kg per month."

  8. BOTTOM TAB BAR
     🏠 Home | 🌱 Carbon | 🚌 Bus | 🍽️ Food | 👤 Profile

CARBON TIE-IN
  Hero eco-score card is the largest element — sustainability is central
  Quick stats row shows live bus info to encourage public transport

MOBILE
  Eco hero card: full width, 180px height
  Quick stats: horizontal scroll, 160px card width
  Module grid: 2-column, 72px tile height

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 06 — CARBON FOOTPRINT LOGGER
  Route: /carbon/log
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  The core module. Students log daily activities across 5 categories.
  Live calculation updates the CO2 preview as they fill each section.
  This is the most important screen in the entire application.

SECTIONS
  1. TOP BAR
     "🌱 Carbon Log" + today's date

  2. LIVE SUMMARY CARD (sticky at top, updates in real time)
     Horizontal 5-bar chart (mini):
       🚗 Transport: 0.60 kg  ██████░░░░
       ⚡ Electricity: 0.25 kg ████░░░░░░
       🍽️ Food: 1.00 kg       ████████░░
       💧 Water: 0.09 kg      ██░░░░░░░░
       🗑️ Waste: 0.40 kg      █████░░░░░
     TOTAL: 2.34 kg CO2
     Eco Score Preview: 75 — "Good"
     Points Preview: "+30 eco-points"

  3. ACCORDION SECTIONS (tap to expand, one at a time)

     ── SECTION A: TRANSPORTATION ────────────────────────
       Mode selector grid (2×4 tiles with icons):
         🏍️ Motorbike | 🚗 Car (Solo) | 🚗 Car (Shared)
         🚌 College Bus | 🚌 City Bus | 🛺 Auto | 🚲 Bicycle | 🚶 Walk
       Distance input (km) — appears only for motorized modes
       GPS auto-fill button: "📍 Use GPS distance" (uses device location)
       Live calc shown: "5 km × 0.120 = 0.60 kg CO2"
       Eco note if bus/bicycle chosen: "+12 eco-points for taking the bus!"

     ── SECTION B: FOOD ──────────────────────────────────
       For each meal slot (Breakfast / Lunch / Dinner):
         Card selector: 🌱 Vegan | 🥗 Vegetarian | 🥚 Egg | 🍗 Non-veg | ⏭️ Skip
       Cafeteria integration note:
         "Ordered Masala Dosa today — auto-logged as Vegetarian (0.5 kg)"
       Total food CO2 shown live

     ── SECTION C: ELECTRICITY ───────────────────────────
       Device checklist (checkboxes):
         ❄️ AC (1 Ton) | ❄️ AC (1.5 Ton) | 💻 Laptop | 🖥️ Desktop
         📱 Mobile Charging | 💡 Fan | 💡 LED Bulb | 🧺 Washing Machine
       Hours slider per selected device (0–12 hours, step 0.5)
       CO2 shown per device + total electricity CO2

     ── SECTION D: WATER ─────────────────────────────────
       Shower type: Tap shower | Bucket bath
       Duration: slider 0–20 minutes (for tap) or litres (for bucket)
       General usage: Low (50L) / Medium (100L) / High (150L) selector
       Total water CO2 shown

     ── SECTION E: WASTE ─────────────────────────────────
       Waste types generated today (multi-select checkboxes):
         General | Plastic | Paper | Organic | Recycled
       Kg estimate per type (0.1–2 kg slider)
       Total waste CO2 shown

  4. SUBMIT BUTTON
     "Save Today's Carbon Log" — green, full width, 52px
     Disabled until transport AND food sections filled
     On submit:
       → Saves to carbon_logs in Supabase
       → Calls award-eco-points edge function
       → Fetches AI tips from Gemini
       → Shows success overlay

  5. SUCCESS OVERLAY (full screen)
     Large animated checkmark in green
     "Today's Log Saved! 🌿"
     Eco score: large ring showing final score
     Points earned: "+30 eco-points"
     New badge if any earned: "🌟 New Badge: Bus Buddy!"
     3 AI tips shown below
     Buttons: "View My History" | "Back to Dashboard"

KEY UI
  Live summary card updates with every input change (no submit needed)
  Transport mode selector uses large visual tiles (not dropdown)
  GPS auto-fill reduces friction for transport distance
  Cafeteria auto-integration prevents double-entry

CARBON TIE-IN
  This entire page IS the carbon engine
  Every section directly calculates and visualizes emissions

MOBILE
  Accordion sections prevent scroll overload
  All sliders are 44px tall (native touch target)
  Sticky summary card is 90px at top, always visible
  Submit button stays above bottom tab bar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 07 — CARBON HISTORY & ANALYTICS
  Route: /carbon/history
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Students see trends, identify problem categories, and track improvement.
  This page turns data into insights and motivation.

SECTIONS
  1. TIME RANGE TABS
     This Week | This Month | Last 3 Months | All Time

  2. SUMMARY STAT CARDS (4 cards, horizontal scroll)
     Total CO2: "16.4 kg this week"
     Avg Daily: "2.34 kg/day"
     Best Score: "96 — Excellent"
     Points Earned: "340 pts this week"

  3. CO2 TREND LINE CHART (Recharts LineChart)
     X-axis: dates | Y-axis: kg CO2
     Two lines: "Your CO2" (green) + "Campus Avg" (gray dashed)
     Reference line: 5 kg target (green dotted horizontal)
     Tooltip: shows exact kg, eco-score, and date on hover

  4. CATEGORY BREAKDOWN PIE CHART (Recharts PieChart)
     Segments: Transport / Electricity / Food / Water / Waste
     Each segment distinctly colored
     Center label: "Total X kg"
     Legend below with kg and % per category

  5. ECO SCORE HISTORY (Recharts BarChart)
     One bar per day | Colored by score grade
     Green bars = Good/Excellent | Amber = Average | Red = Poor
     X-axis: dates

  6. COMPARISON SECTION
     "You vs Campus"
     Horizontal bar comparison:
       You: 2.34 kg/day ████████░░
       Campus Avg: 3.1 kg/day ██████████░░
     "You emit 0.76 kg/day less than campus average. Great work! 🌿"

  7. YOUR TOP EMISSION SOURCES
     Ranked list: Food > Transport > Electricity > Water > Waste
     Each: category icon + avg kg/day + % of total

  8. DAILY LOG ACCORDION
     One row per logged day
     Expand: shows per-category values + score + points + AI tips for that day
     Color-coded score chip per row

CARBON TIE-IN
  This page is entirely carbon data — the analytics engine visualization

MOBILE
  Charts full width, horizontally scrollable if needed
  Comparison bars full width
  Accordion list compact rows

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 08 — ECO LEADERBOARD & CHALLENGES
  Route: /leaderboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Gamification hub. Friendly competition drives sustainable behavior.
  Badges, challenges, and rankings make eco-friendly choices rewarding.

SECTIONS
  1. MY ECO STATS BAR
     Eco Points: 1,240 | Campus Rank: #5 | Badges: 8 | Streak: 🔥7 days

  2. TAB NAVIGATION
     🏆 Campus | 🏫 Department | 🎯 Challenges | 🏅 My Badges

  TAB: CAMPUS LEADERBOARD
     Period selector: This Week | This Month | All Time
     Ranked list (top 20):
       #1 🥇 [Name] — CSE — 2,840 pts — Avg Score 91
       #2 🥈 [Name] — ECE — 2,650 pts — Avg Score 88
       #3 🥉 ...
     Logged-in student's row: always shown + highlighted in light green
     even if not in top 20

  TAB: DEPARTMENT LEADERBOARD
     Department filter dropdown (auto-selects student's own)
     Same ranked list format filtered by department

  TAB: CHALLENGES
     Active Challenges (cards):
       Title + category badge
       Description: "Use bicycle or walk for 7 days"
       Reward: "+100 pts + 🏅 Eco Warrior badge"
       Duration: "Ends in 3 days"
       Participants: "47 joined"
       Progress bar if joined
       "Join Challenge" CTA or "Joined ✓" if already participating
     Completed Challenges (my history)
     Upcoming Challenges (not yet started)

  TAB: MY BADGES
     Grid of earned badges (icon + name + date)
     Locked badges grayed with requirement text:
       "🌍 Planet Guardian — Earn 5000 eco-points (3,760 to go)"

CARBON TIE-IN
  All leaderboard scores derive from carbon_logs data
  Challenges require carbon behavior changes to complete

MOBILE
  Leaderboard rows: 72px height, full width
  Badge grid: 3 columns
  Challenge cards: stacked vertically

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 09 — BUS LIVE TRACKING
  Route: /bus-tracking
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Live GPS map of all campus buses. Students check bus ETA instead of
  waiting blindly. Encourages bus usage over motorbikes.

SECTIONS
  1. TOP BAR: "🚌 Bus Tracking" + green live pulse dot
  2. BUS TABS: All | Bus 1 | Bus 2 | Bus 3 | Bus 4
  3. LEAFLET MAP (OpenStreetMap)
     Bus markers: animated green bus icons
     Route polyline: dashed green line
     Stop markers: white circles with tooltips
     My location: blue pulsing dot if GPS granted
  4. BUS STATUS CARDS (scrollable below map)
     Bus# + Route | Status badge (On Route/Delayed/Stopped)
     ETA: "8 min to Main Gate" | Driver name | Last updated
     Tap → map pans + focuses on that bus
  5. DELAY BANNER: amber warning if any bus delayed

CARBON TIE-IN
  Each card shows: "🌿 Taking this bus instead of riding saves ~0.36 kg CO2"
  After arriving at destination and selecting transport mode in carbon log,
  "College Bus" pre-fills if student was near a bus stop during commute time

MOBILE: Map 55% height, cards below, compact 80px rows

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 10 — DRIVER GPS SHARING
  Route: /driver/gps
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Driver shares live GPS to Supabase every 5 seconds.
  Students see this on the bus tracking map in real time.

SECTIONS
  1. TOP BAR: "Driver Panel" + logout
  2. Bus selector dropdown (must pick before sharing)
  3. "Start Sharing Location" toggle button → goes green when active
  4. Status card: lat/long + accuracy + "Sent 2s ago" + mini Leaflet map
  5. Route status pills: On Route | Delayed | Stopped
  6. Emergency Alert button (red, confirmation modal before send)

KEY UI
  setInterval(5000) pushes GPS coords to bus_locations table
  Wake Lock API keeps screen awake while sharing
  Warning if accuracy > 50 meters

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 11 — CAFETERIA MENU & ORDER
  Route: /cafeteria
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Online food ordering with sustainability information built in.
  Every menu item shows its carbon value. Encourages low-carbon food choices.

SECTIONS
  1. TOP BAR: "🍽️ Cafeteria" + cart icon with item count badge
  2. CATEGORY TABS: All | Breakfast | Lunch | Snacks | Beverages
  3. MENU GRID (2-col mobile, 3-col desktop)
     Item card:
       Food image (Supabase Storage)
       🌱 vegan / 🥗 vegetarian dot badge
       Item name | Price
       🍃 Carbon: "0.5 kg CO2 per serving" (leaf icon + value)
       Available / Unavailable
       Qty selector − [1] + | Add to Cart button
  4. CART SUMMARY BAR (fixed bottom): "3 items — Rs.135 | 🍃 1.5 kg CO2"
  5. CART BOTTOM SHEET
     Items list | Total price | Total carbon kg | "Place Order" CTA
  6. ORDER CONFIRMATION OVERLAY
     "Order Placed! Token #47 🌿"
     QR code (200px) | Carbon: "1.5 kg CO2 from this order"
     "Track Order" link

CARBON TIE-IN
  Carbon shown on every item card and in cart total
  After order placed: carbon_logs food section auto-populated
  Eco note: "Choosing vegetarian today saves 1.5 kg vs non-veg order"

MOBILE: 2-col grid, cart bar 60px fixed above tab bar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 12 — MY CAFETERIA ORDERS
  Route: /cafeteria/orders
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Track active order status and view QR code for pickup.
  Past orders shown with carbon data for awareness.

SECTIONS
  1. ACTIVE ORDER CARD (if order in progress)
     Token #47 | Status: Preparing 🟡 | Items list
     Large QR code (200px, show to cafeteria staff)
     "🍃 This order: 1.5 kg CO2"
     Realtime update via Supabase (status changes auto-refresh)
     Green border pulse when status = Ready
  2. PAST ORDERS (accordion)
     Date | Items | Total | 🍃 Carbon | Status chip

MOBILE: QR centered full width, past orders compact

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 13 — VIRTUAL LAB ASSISTANT
  Route: /lab-assistant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Gemini AI-powered lab prep tool. Reduces paper printouts of lab manuals
  (sustainability connection: paperless learning).

SECTIONS
  1. Subject tile selector: Physics | Chemistry | CS | Electronics | Biology
  2. Quick action buttons: "Explain Experiment" | "Generate Viva Qs" | "Step-by-Step"
  3. Chat interface:
     Student msgs: right, green bubble
     AI msgs: left, gray bubble, 🌿 bot avatar
     Typing indicator: 3-dot animation
  4. Top: selected subject chip + "Clear Chat" button

CARBON TIE-IN
  "🌿 Digital learning reduces paper usage — that's a sustainability win!"
  Each session: +5 eco-points for using digital lab assistant

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 14 — AI STUDY PLANNER
  Route: /study-planner
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Gemini generates personalized study schedules. Tracks task completion.
  Promotes structured study habits and reduces exam stress.

SECTIONS
  1. SETUP FORM (if no plan): subjects + exam dates + daily hours + "Generate Plan"
  2. WEEK CALENDAR: 7 columns, horizontally scrollable, today highlighted
  3. TODAY'S CHECKLIST: tasks + checkboxes + completion saved to Supabase
  4. PROGRESS RINGS: SVG per subject (% covered) + days-to-exam countdown
  5. Actions: "Regenerate" | "Edit Subjects"

CARBON TIE-IN
  "📱 Digital study planning = zero paper used. +5 pts for going paperless!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 15 — SMART ATTENDANCE
  Route: /attendance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  QR-based digital attendance. Completely paperless. Students scan,
  attendance marked instantly. No registers, no paper.

SECTIONS
  1. SUBJECT CARDS: attendance % ring (green/amber/red) per subject
  2. QR SCAN BUTTON (large, fixed): opens camera → validates token
     Success: full-screen green overlay "✅ Attendance Marked! +5 eco-points"
     Expired: "QR expired — ask your teacher for a new code"
  3. HISTORY TABLE: Date | Subject | Status | Time | filter controls
  4. TOGGLE: Table View / Calendar View (green/red dots per day)

CARBON TIE-IN
  QR attendance = 100% paperless system = zero paper waste
  Each scan earns +5 eco-points to reward paperless participation
  Banner: "🌿 Paperless attendance saves X kg of paper this semester"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 16 — NOTIFICATIONS
  Route: /notifications
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Central inbox for all types of alerts including eco reminders,
  challenge updates, and campus service notifications.

SECTIONS
  1. TOP BAR: "Notifications" + "Mark all read" button
  2. FILTER TABS: All | 🌱 Eco | 🚌 Bus | 🍽️ Orders | 🎓 Attendance | 🧾 Complaints
  3. NOTIFICATION LIST:
     Icon (by type) | Title (bold if unread) | 1-line preview | Time
     Blue unread dot left edge | light green bg if unread
     Tap to expand full message and mark read
  4. DATE GROUPS: Today | Yesterday | This Week
  5. EMPTY STATE: 🌿 "You're all caught up! Great eco-warrior."

NOTIFICATION TYPES
  🌱 eco     : "Log today's carbon before midnight! Keep your 7-day streak."
  🏆 badge   : "New badge earned: 🌿 Green Streak! You logged 7 days in a row."
  🚌 bus     : "Bus 3 is delayed by approximately 15 minutes."
  🍽️ order   : "Your Masala Dosa is ready for pickup! Token #47"
  🎓 attend  : "Your Algorithms attendance is now below 75%. Attend more classes."
  🧾 complaint: "Your complaint about broken AC has been resolved."
  🎯 challenge: "New Challenge: Zero Petrol Week starts tomorrow! Join now."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 17 — CAMPUS NAVIGATION
  Route: /navigation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Interactive Leaflet map for campus wayfinding.

SECTIONS
  1. SEARCH: "Find a place..." → dropdown results on type
  2. FILTER CHIPS: All | 🏫 Classrooms | 🔬 Labs | 🏢 Offices | 🍽️ Canteen
  3. LEAFLET MAP: colored pins by category | tap pin → popup + "Get Directions"
  4. DIRECTIONS SHEET: From my location → Destination | route polyline + text steps
  5. LOCATION LIST: all campus spots by category (tap → pan map)

CARBON TIE-IN
  "🌿 Walk to your destination and earn eco-points for zero-carbon travel!"
  Walking route shown by default with: "This walk = 0 kg CO2 🌱"

MOBILE: Map 55% height, chips scroll horizontal, directions bottom sheet

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 18 — LOST & FOUND
  Route: /lost-found
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Community-driven item recovery. Reduces waste from discarded found items.

SECTIONS
  1. ACTION BUTTONS: "Report Lost" | "Report Found" (both → bottom sheet form)
  2. FILTER TABS: All | Lost | Found | Resolved
  3. ITEMS GRID (2-col): photo | badge | name | location | date | "Contact" button
  4. REPORT FORM (bottom sheet): type / name / description / location / photo upload
  5. ITEM DETAIL: large photo + details + "Message Reporter" button + admin badge

CARBON TIE-IN
  "♻️ Returning found items reduces waste and promotes campus sustainability"
  Reporting a found item: +8 eco-points (community contribution)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 19 — COMPLAINT MANAGEMENT
  Route: /complaints
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Students submit and track campus complaints including sustainability issues
  (broken recycling bins, AC left on, lights not turned off).

SECTIONS
  1. TOP BAR: "My Complaints" + "New Complaint" (green button)
  2. LIST: category badge | title | priority chip | status badge | date | red-left-border if high
  3. DETAIL: full text + status timeline dots + admin response when replied
  4. FORM (bottom sheet):
     Category: Academic | Infrastructure | Transport | 🌱 Sustainability | Food | Other
     Title | Description (min 20 chars) | Priority: Low / Medium / High / Urgent

CARBON TIE-IN
  "🌱 Sustainability" complaint category specifically for green campus issues:
  "AC left on in empty lab", "Lights always on in Room 204", "No recycling bins near canteen"
  Admin sustainability complaints get escalated to Green Audit report

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 20 — AI CHATBOT ASSISTANT
  Route: /chatbot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Gemini-powered general campus assistant. Answers queries about carbon,
  sustainability, buses, food, attendance, and academic topics.

SECTIONS
  1. TOP BAR: "🌿 SCSAS Assistant" + "Clear Chat"
  2. QUICK CHIPS (first load):
     "How do I reduce my carbon today?" | "Bus 3 ETA?" | "Best low-carbon lunch?"
     "My attendance summary" | "Lab schedule help" | "How to earn eco-points?"
  3. CHAT AREA: green student bubbles (right) + gray AI bubbles (left) + 🌿 bot avatar
  4. INPUT BAR: fixed bottom, text field + send button
  5. FLOATING WIDGET (desktop only): 56px green circle → compact overlay

CARBON TIE-IN
  Gemini system prompt includes CO2 factors + eco-score logic
  Can answer: "How much CO2 does taking the bus vs motorbike save?"
  AI knows student's top emission category and gives context-aware tips

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PAGE 21 — STUDENT PROFILE
  Route: /profile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  Personal info + notification preferences + eco identity showcase.

SECTIONS
  1. HEADER: avatar + name + department + eco rank badge
  2. ECO IDENTITY CARD
     🏆 Eco Points: 1,240 | Campus Rank: #5 | Badges: 8
     🔥 Current Streak: 7 days | 🌍 Total CO2 Logged: 42.6 kg
     Link to /leaderboard | Link to /carbon/history
  3. EDITABLE INFO: Full Name | Phone | Department | "Save Changes"
  4. NOTIFICATION TOGGLES
     🌱 Eco Reminders | 🚌 Bus Delays | 🍽️ Order Updates
     🎓 Attendance Alerts | 🏆 Challenge Updates | 🧾 Complaint Updates
     "Enable Push Notifications" button if not yet granted
  5. APP INFO: Version | About | Privacy Policy
  6. LOGOUT: red outlined button + confirmation modal


════════════════════════════════════════════════════════════════════════════════
  SECTION 11 — ADMIN PANEL PAGES
════════════════════════════════════════════════════════════════════════════════

  Admin panels are desktop-first, data-dense, no decorations.
  All share: dark sidebar (260px) + light gray content area + white cards.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ADMIN PAGE 01 — DASHBOARD
  Route: /admin/dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTIONS
  1. STATS ROW (6 cards)
     Total Students | Campus CO2 Today (kg) | Students Logged Today
     Active Buses | Open Complaints | Orders Today

  2. SUSTAINABILITY HEALTH PANEL
     Campus Avg Eco Score today (large number, color-coded)
     CO2 today vs yesterday (% change with arrow)
     Logging participation: "847/1200 students logged today (70.6%)"
     Top 3 students today (name + score)

  3. CHARTS ROW
     Line chart: Campus daily CO2 (last 14 days) vs target line — Recharts
     Stacked bar: CO2 by category per day (last 7 days) — Recharts
     Donut: Today's transport mode distribution (bus vs bike vs car %)

  4. DEPARTMENT COMPARISON BAR CHART
     Avg CO2 per student by department
     Highlight: lowest-carbon department in green

  5. RECENT ACTIVITY FEED
     Last 15 system events: new orders, complaints, QR sessions, logs

  6. QUICK ACTIONS
     "Send Notification" | "Generate Attendance QR" | "Create Challenge"
     "Export Green Audit" | "Add Menu Item"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ADMIN PAGE 02 — SUSTAINABILITY ANALYTICS
  Route: /admin/sustainability
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE
  The most powerful admin page. Deep sustainability monitoring,
  department-wise analytics, and green audit report generation.

SECTIONS
  1. FILTER BAR
     Date range picker | Department dropdown | Export CSV button

  2. CAMPUS CARBON OVERVIEW
     Total CO2 this period | Avg per student | Students who logged | % vs last period
     Biggest improvement department | Highest impact department

  3. CO2 TREND (Line Chart)
     Campus total CO2 per day for selected range
     Target line overlay

  4. CATEGORY BREAKDOWN (Stacked Bar)
     Total campus CO2 per category: Transport/Food/Electricity/Water/Waste
     Helps admin understand which category needs the most attention

  5. DEPARTMENT-WISE TABLE
     Dept | Students | Avg CO2/day | Avg Eco Score | Participation % | Trend
     Sortable columns | Color-coded score column

  6. TOP ECO PERFORMERS TABLE
     Rank | Name | Dept | Avg Score | Eco Points | Badges | Total CO2

  7. TRANSPORT MODE ANALYSIS
     Pie chart: what modes students use (bus / bike / car / walk / bicycle)
     "Bus usage: 34% — up 8% this month" (positive sustainability trend)

  8. GREEN CHALLENGES MANAGEMENT
     Active challenges list + participants + completion rates
     "Create New Challenge" button (modal form)
     Past challenges with results

  9. GREEN AUDIT REPORT SECTION
     Date range input + department filter
     "Generate Report" button
     Report preview:
       Campus Carbon Summary
       Department Rankings
       Top Performers
       Challenge Results
       Recommendations (Gemini-generated)
     "Export as PDF" | "Export as CSV" buttons

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ADMIN PAGE 03 — USER MANAGEMENT
  Route: /admin/users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTIONS
  1. Search bar + filters: Role / Department / Status
  2. USERS TABLE
     Name | Email | Role | Dept | Eco Points | Badges | Joined | Actions
     Actions: View Detail | Deactivate | Delete (confirmation modal)
  3. USER DETAIL MODAL
     Full profile + eco stats + badge list + attendance summary + complaint count

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ADMIN PAGE 04 — BUS MANAGEMENT
  Route: /admin/buses
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTIONS
  1. LIVE MAP: all buses visible to admin with driver names
  2. BUS TABLE: Bus# | Route | Driver | Status | Last GPS | Actions (Edit/Delete)
  3. ADD/EDIT BUS MODAL: bus number, route, driver dropdown
  4. ROUTE STOP MANAGER: stops list, reorder, lat/long per stop
  5. CARBON SAVED COUNTER: "Bus 3 has enabled students to save 124 kg CO2 this month"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ADMIN PAGE 05 — CAFETERIA MANAGEMENT
  Route: /admin/cafeteria
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTIONS
  1. LIVE ORDERS TABLE
     Order ID | Student | Items | Total | Carbon (kg) | Status | Time | Actions
  2. MENU MANAGEMENT TABLE
     Item | Category | Price | Carbon (kg) | Vegetarian | Available | Edit | Delete
     "Add Menu Item" modal: name, category, price, carbon_kg, vegetarian toggle, image
  3. CARBON INSIGHTS PANEL
     "Today's menu avg carbon: 0.8 kg/meal"
     "Most eco-friendly order today: Fruit Salad (0.1 kg)"
     "Vegetarian orders: 58% today ↑ 12% vs last week"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ADMIN PAGE 06 — ATTENDANCE MANAGEMENT
  Route: /admin/attendance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTIONS
  1. GENERATE QR SESSION
     Subject input | Expiry: 5/10/15 min | "Generate QR" button
     Large QR (300px) with countdown timer | Auto-invalidated at expiry
  2. ATTENDANCE REPORT TABLE
     Subject | Date | Total | Present | Absent | % | Export CSV
  3. PAPERLESS IMPACT BANNER
     "🌿 QR attendance has saved X sheets of paper this semester"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ADMIN PAGE 07 — COMPLAINT MANAGEMENT
  Route: /admin/complaints
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTIONS
  1. FILTER: Status | Priority | Category (includes Sustainability)
  2. TABLE: ID | Student | Category | Priority | Status | Date | Actions
  3. DETAIL + RESPONSE MODAL
     Full complaint | Response textarea | Status dropdown
     "Save & Notify Student" → updates DB + inserts notification
  4. SUSTAINABILITY COMPLAINTS TAB
     Filtered view of category = 'sustainability'
     Auto-included in Green Audit report

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ADMIN PAGE 08 — LOST & FOUND
  Route: /admin/lost-found
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTIONS
  1. ITEMS TABLE: Item | Type | Reporter | Status | Verified | Date | Actions
  2. ITEM DETAIL MODAL: photo + full details + "Verify" / "Mark Resolved" / "Delete"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ADMIN PAGE 09 — SEND NOTIFICATIONS
  Route: /admin/notifications
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTIONS
  1. COMPOSE FORM
     Title | Message | Type dropdown | Target: All / Students / Drivers / Department
     "Send Now" → inserts rows in notifications table per target user
  2. SENT LOG TABLE
     Title | Target | Type | Sent By | Date | Recipients Count

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ADMIN PAGE 10 — CAMPUS LOCATIONS
  Route: /admin/navigation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTIONS
  1. LOCATIONS TABLE: Name | Type | Floor | Lat | Long | Edit | Delete
  2. ADD/EDIT MODAL: name, type, floor, description, lat/long or map click
  3. PREVIEW MAP: all pins on Leaflet to verify positions


════════════════════════════════════════════════════════════════════════════════
  SECTION 12 — NOTIFICATION LOGIC
════════════════════════════════════════════════════════════════════════════════

  NOTIFICATION DELIVERY CHANNELS
    In-app   : Supabase notifications table + badge on bell icon
    Push     : Web Push API (PWA) or React Native Push Notifications (APK)
    Both channels used for all notification types

  TRIGGER-BASED NOTIFICATIONS (automatic)
  ┌──────────────────────────────────────────────────────────────────────┐
  │ Trigger                   │ Recipients    │ Message                  │
  ├──────────────────────────────────────────────────────────────────────┤
  │ carbon_logs INSERT        │ Student self  │ "Log saved! +X pts 🌿"  │
  │ New badge earned          │ Student self  │ "New badge: [name] 🏅"   │
  │ 7-day streak reached      │ Student self  │ "7-day streak! 🔥 +75pts"│
  │ bus.status → 'delayed'    │ All students  │ "Bus [N] is delayed ~15m"│
  │ order.status → 'ready'    │ Order student │ "Your [item] is ready 🍽️"│
  │ attendance % < 75%        │ Student self  │ "Low attendance: [subj]" │
  │ complaint.status changed  │ Complaint owner│ "Your complaint updated" │
  │ Challenge joined          │ Student self  │ "You joined [challenge]" │
  │ Challenge completed       │ Student self  │ "Challenge won! +[pts]"  │
  │ New challenge created     │ All students  │ "New eco challenge! 🌱"  │
  └──────────────────────────────────────────────────────────────────────┘

  SCHEDULED NOTIFICATIONS (Supabase Edge Function — cron)
  ┌──────────────────────────────────────────────────────────────────────┐
  │ Schedule    │ Condition                    │ Message                  │
  ├──────────────────────────────────────────────────────────────────────┤
  │ Daily 8 PM  │ Student has NOT logged today │ "Log today's carbon 🌱  │
  │             │                              │  Don't break your streak"│
  │ Daily 9 PM  │ Student HAS logged today     │ "Great job logging! Your │
  │             │                              │  score: [X]. Tip: [tip]" │
  │ Mon 9 AM    │ New week starts              │ "New week, new chance to │
  │             │                              │  top the leaderboard! 🏆"│
  │ Challenge   │ Challenge ends tomorrow      │ "Last day for [challenge]│
  │ end-1       │                              │  Complete it for +[pts]!"│
  └──────────────────────────────────────────────────────────────────────┘

  BROADCAST NOTIFICATIONS (admin-triggered)
    Admin selects: Title | Message | Target | Type
    System inserts one row per target user in notifications table
    Also sends Web Push to all target users who have push_token


════════════════════════════════════════════════════════════════════════════════
  SECTION 13 — CARBON INTEGRATION ACROSS ALL MODULES
════════════════════════════════════════════════════════════════════════════════

  Every module in SCSAS contributes to or reinforces the carbon narrative.

  MODULE              CARBON CONNECTION
  ─────────────────────────────────────────────────────────────────────
  Carbon Log          Core input — all 5 categories tracked daily
  Dashboard           Eco-score hero card front and center
  Bus Tracking        "Taking bus saves X kg vs motorbike" per bus card
                      Bus usage auto-suggests transport mode in carbon log
  Cafeteria           Carbon shown on every menu item and cart total
                      Cafeteria order auto-logs food section in carbon log
  Attendance          QR scan = paperless = eco-points awarded
                      "X kg paper saved this semester" shown in admin
  Study Planner       Digital planning = paperless = eco-points
  Lab Assistant       Digital lab manual = paperless = eco-points
  Navigation          Walking route shown first with "0 kg CO2" label
  Lost & Found        Found item returned = reduced waste = eco-points
  Complaints          Sustainability category for eco campus issues
  Chatbot             Eco-aware AI with carbon factor knowledge
  Leaderboard         All points derive from carbon-positive behaviors
  Admin Dashboard     Campus carbon stats are primary analytics


════════════════════════════════════════════════════════════════════════════════
  SECTION 14 — FUNCTIONAL REQUIREMENTS
════════════════════════════════════════════════════════════════════════════════

  CARBON TRACKER
  FR-C01  Students can log all 5 carbon categories daily
  FR-C02  System calculates CO2 in real time as student fills form
  FR-C03  Each day's eco-score computed and stored in carbon_logs
  FR-C04  AI tips generated via Gemini after each submission
  FR-C05  System enforces one log per student per calendar day
  FR-C06  Carbon history viewable with weekly/monthly analytics
  FR-C07  Comparison against campus average shown in history view
  FR-C08  Cafeteria order food carbon auto-populated in log form

  GAMIFICATION
  FR-G01  Eco-points awarded automatically after each log submission
  FR-G02  Badges checked and awarded daily via Edge Function
  FR-G03  Campus and department leaderboards updated in real time
  FR-G04  Green challenges can be created by admin with targets and rewards
  FR-G05  Challenge completion auto-detected and awarded by Edge Function
  FR-G06  Streak tracked and reset if a day is missed

  AUTHENTICATION & SECURITY
  FR-A01  Students and drivers register and login via /login
  FR-A02  Admin login only via /secure-admin-panel/login
  FR-A03  Admin registration requires SECRET ADMIN KEY from .env
  FR-A04  All /admin/* routes re-verify role on each page load
  FR-A05  Supabase RLS enforces data isolation per role
  FR-A06  JWT tokens expire and rotate on refresh

  BUS TRACKING
  FR-B01  Driver shares GPS every 5 seconds via browser Geolocation API
  FR-B02  Students see live bus positions on Leaflet + OpenStreetMap
  FR-B03  ETA calculated based on distance between bus and stop
  FR-B04  Bus status (On Route/Delayed/Stopped) updated by driver
  FR-B05  Delay triggers automatic push notification to all students

  CAFETERIA
  FR-F01  Admin can add/edit/delete menu items with carbon values
  FR-F02  Students browse menu with carbon info visible on each item
  FR-F03  Students add to cart, place order, receive QR code for pickup
  FR-F04  Admin updates order status (Pending/Preparing/Ready/Delivered)
  FR-F05  Student receives push notification when order is ready
  FR-F06  Order placement auto-populates food section of carbon log

  ATTENDANCE
  FR-AT01 Admin generates QR codes with configurable expiry time
  FR-AT02 Students scan QR code to mark attendance (prevents double marking)
  FR-AT03 QR tokens expire and are invalidated at set time
  FR-AT04 Students view subject-wise attendance percentage
  FR-AT05 Low attendance triggers automatic notification to student

  AI FEATURES
  FR-AI01 Study planner generates weekly schedule via Gemini API
  FR-AI02 Lab assistant answers subject questions via Gemini API
  FR-AI03 Chatbot answers campus queries via Gemini API
  FR-AI04 AI eco recommendations generated after each carbon log

  NOTIFICATIONS
  FR-N01  In-app notifications stored in Supabase for all users
  FR-N02  Web Push API sends push notifications to subscribed devices
  FR-N03  Admin can send broadcast notifications to user groups
  FR-N04  Scheduled eco reminders sent nightly via Edge Function

  ADDITIONAL MODULES
  FR-L01  Lost & found items submitted with photo, listed publicly after verification
  FR-L02  Admin verifies found item listings before they appear
  FR-CM01 Students submit complaints with category, priority, description
  FR-CM02 Admin responds to complaints and updates status
  FR-CM03 Status changes trigger notifications to complaint owner
  FR-NV01 Campus locations managed by admin and displayed on Leaflet map
  FR-NV02 Students can search for locations and get walking directions


════════════════════════════════════════════════════════════════════════════════
  SECTION 15 — NON-FUNCTIONAL REQUIREMENTS
════════════════════════════════════════════════════════════════════════════════

  PERFORMANCE
  NFR-P01  Page load time under 2 seconds on 4G mobile network
  NFR-P02  Carbon calculation completes in under 100ms (client-side)
  NFR-P03  Gemini AI responses returned within 4 seconds
  NFR-P04  Supabase Realtime bus position updates under 1 second
  NFR-P05  Leaderboard updates visible within 3 seconds of point award

  MOBILE & RESPONSIVENESS
  NFR-M01  All student screens fully functional at 375px viewport width
  NFR-M02  PWA display mode = "browser" — status bar always visible
  NFR-M03  Android system navigation bar always visible
  NFR-M04  Minimum tap target size: 44×44px for all interactive elements
  NFR-M05  No horizontal scroll on any student page (except explicit carousels)

  SECURITY
  NFR-S01  Admin login URL never appears in client code, comments, or logs
  NFR-S02  SECRET ADMIN KEY stored only in server-side .env — never in client code
  NFR-S03  JWT access tokens expire every 1 hour, refresh tokens rotate
  NFR-S04  Supabase RLS policies enforced on all 17+ tables
  NFR-S05  Three failed admin login attempts triggers 60-second client lockout
  NFR-S06  All API calls use HTTPS — no plain HTTP allowed
  NFR-S07  Student cannot access other students' carbon logs (RLS enforced)
  NFR-S08  Admin audit log records all admin actions with timestamp

  DATA INTEGRITY
  NFR-D01  One carbon log per student per calendar day (UNIQUE constraint)
  NFR-D02  Carbon logs cannot be deleted — only read (audit integrity)
  NFR-D03  Attendance records cannot be modified after submission
  NFR-D04  QR tokens invalidated in Supabase immediately after expiry

  RELIABILITY & UPTIME
  NFR-R01  99% uptime target via Vercel + Supabase combined SLA
  NFR-R02  Service Worker caches static assets for offline access
  NFR-R03  Graceful error states on all pages if Supabase is unreachable
  NFR-R04  Edge Functions retry once on failure before alerting admin

  ACCESSIBILITY
  NFR-AC01 All interactive elements have ARIA labels
  NFR-AC02 Color is never the only indicator (text label always paired)
  NFR-AC03 Minimum contrast ratio: 4.5:1 for normal text


════════════════════════════════════════════════════════════════════════════════
  SECTION 16 — COMPLETE ROUTE TABLE
════════════════════════════════════════════════════════════════════════════════

  Route                          | Page                        | Role
  ─────────────────────────────────────────────────────────────────────────────
  /                              | Landing / Home              | Public
  /login                         | Student + Driver Login      | Public
  /register                      | Register                    | Public
  /forgot-password               | Password Reset              | Public
  /secure-admin-panel/login      | Hidden Admin Login          | Admin (secret)
  /dashboard                     | Student Dashboard           | Student
  /carbon/log                    | Carbon Footprint Logger     | Student
  /carbon/history                | Carbon Analytics            | Student
  /leaderboard                   | Leaderboard + Challenges    | Student
  /bus-tracking                  | Live Bus Map                | Student
  /cafeteria                     | Menu + Cart + Order         | Student
  /cafeteria/orders              | My Orders + QR Code         | Student
  /lab-assistant                 | Virtual Lab AI              | Student
  /study-planner                 | AI Study Planner            | Student
  /attendance                    | Attendance + QR Scan        | Student
  /notifications                 | Notification Inbox          | Student + Driver
  /navigation                    | Campus Map                  | Student
  /lost-found                    | Lost & Found                | Student
  /complaints                    | My Complaints               | Student
  /chatbot                       | AI Chatbot                  | Student
  /profile                       | Student Profile             | Student
  /driver/gps                    | Driver GPS Sharing          | Driver
  /admin/dashboard               | Admin Overview              | Admin
  /admin/sustainability          | Sustainability Analytics    | Admin
  /admin/users                   | User Management             | Admin
  /admin/buses                   | Bus Management              | Admin
  /admin/cafeteria               | Cafeteria + Menu Mgmt       | Admin
  /admin/attendance              | QR Generator + Reports      | Admin
  /admin/complaints              | Complaint Manager           | Admin
  /admin/lost-found              | Lost Found Verifier         | Admin
  /admin/notifications           | Send Notifications          | Admin
  /admin/navigation              | Campus Locations            | Admin


════════════════════════════════════════════════════════════════════════════════
  SECTION 17 — TECH STACK & COST
════════════════════════════════════════════════════════════════════════════════

  Layer               Technology                          Cost
  ─────────────────────────────────────────────────────────────────────────────
  Mobile App          React Native (Expo)                 Free
  Web / Admin         React + Vite                        Free
  Styling             Tailwind CSS + NativeWind           Free
  State Management    Zustand                             Free
  Routing (Mobile)    React Navigation v6                 Free
  Routing (Web)       React Router DOM v6                 Free
  Backend             Supabase                            Free tier
  Database            PostgreSQL (via Supabase)           Free (500MB)
  Auth                Supabase Auth (JWT)                 Free (50K users)
  Storage             Supabase Storage                    Free (1GB)
  Realtime            Supabase Realtime                   Free tier
  Edge Functions      Supabase Edge Functions (Deno)      Free (500K calls/mo)
  Maps                Leaflet + OpenStreetMap              Free forever
  AI                  Gemini API (Flash model)            Free tier (60 req/min)
  Charts              Recharts (web) / Victory Native     Free
  QR Generation       qrcode.react / react-native-qrcode  Free
  QR Scanning         html5-qrcode / expo-barcode-scanner Free
  Carbon Calc         Custom JS/TS utility module         Free
  Push (Web)          Web Push API                        Free
  Push (Native)       Expo Push Notifications             Free
  Hosting (Web)       Vercel                              Free tier
  Hosting (APK)       Expo EAS Build / GitHub Releases    Free (limited)
  CI/CD               GitHub Actions                      Free (public repos)
  ─────────────────────────────────────────────────────────────────────────────
  TOTAL MONTHLY COST                                      Rs.0 / $0


════════════════════════════════════════════════════════════════════════════════
  SECTION 18 — DEVELOPMENT TIMELINE
════════════════════════════════════════════════════════════════════════════════

  Phase 1: Foundation (Weeks 1–2)
  ─────────────────────────────────────────────────────────────────────────────
  Week 1  │ Project setup + Supabase schema + Auth system (all roles)
          │ Hidden admin route + admin key validation
          │ Deliverable: Working login/register for all 3 roles

  Week 2  │ Student Dashboard + PWA config + Bottom tab navigation
          │ Carbon Logger UI (all 5 categories, live calculation)
          │ Deliverable: Dashboard + Carbon Logger fully functional

  Phase 2: Carbon Engine (Weeks 3–4)
  ─────────────────────────────────────────────────────────────────────────────
  Week 3  │ Carbon submission → Supabase → points award → Gemini tips
          │ Carbon History page with all Recharts charts
          │ Deliverable: Complete carbon tracking loop

  Week 4  │ Leaderboard + Badges + Green Challenges
          │ Eco-points gamification fully wired
          │ Deliverable: Full gamification system live

  Phase 3: Campus Services (Weeks 5–7)
  ─────────────────────────────────────────────────────────────────────────────
  Week 5  │ Bus Tracking (Driver GPS + Leaflet + Realtime)
          │ Cafeteria (Menu + Cart + Orders + QR + Carbon display)
          │ Deliverable: Bus tracking + food ordering live

  Week 6  │ Attendance (QR generation + scanning + history)
          │ Study Planner (Gemini integration + weekly calendar)
          │ Deliverable: Attendance + study planning live

  Week 7  │ Lab Assistant (Gemini chat)
          │ Navigation (Leaflet + search + directions)
          │ Lost & Found + Complaints
          │ Deliverable: All student modules complete

  Phase 4: Admin & Polish (Weeks 8–10)
  ─────────────────────────────────────────────────────────────────────────────
  Week 8  │ AI Chatbot (Gemini + floating widget)
          │ Notifications (in-app + push + Edge Function cron)
          │ All admin pages (dashboard, sustainability, users, buses)

  Week 9  │ Admin: cafeteria, attendance, complaints, lost-found,
          │ notifications, navigation, green audit report generation
          │ Deliverable: Full admin panel complete

  Week 10 │ QA testing on actual Android devices
          │ PWA testing on iOS Safari
          │ Performance optimization, bug fixes, edge cases
          │ Expo EAS Build for Android APK
          │ Vercel deployment for web
          │ Deliverable: Production-ready, demo-ready application


════════════════════════════════════════════════════════════════════════════════
  SECTION 19 — DEPLOYMENT ARCHITECTURE
════════════════════════════════════════════════════════════════════════════════

  DEPLOYMENT OVERVIEW
  ┌────────────────────────────────────────────────────────────────────────┐
  │                                                                        │
  │  STUDENT MOBILE (Android)        STUDENT MOBILE (iOS)                 │
  │  React Native APK                React Native IPA                     │
  │  via Expo EAS Build              via Expo EAS Build                   │
  │         │                                │                            │
  │         └──────────────┬─────────────────┘                           │
  │                        │                                              │
  │  ADMIN WEB (Desktop)   │   STUDENT PWA (Any Browser)                 │
  │  React + Vite          │   React + Vite + Service Worker              │
  │  Hosted on Vercel      │   Hosted on Vercel (same deployment)         │
  │         │              │              │                               │
  │         └──────────────┼──────────────┘                              │
  │                        │                                              │
  │              SUPABASE CLOUD (Backend)                                 │
  │              ─────────────────────────                                │
  │              PostgreSQL + RLS Policies                                │
  │              Supabase Auth (JWT)                                      │
  │              Supabase Storage (images)                                │
  │              Supabase Realtime (bus, orders)                          │
  │              Supabase Edge Functions (cron jobs)                      │
  │                        │                                              │
  │              ┌─────────┼──────────┐                                  │
  │         Gemini API    OSM      Web Push                               │
  │         (AI features) (Maps)   (Notifications)                       │
  │                                                                        │
  └────────────────────────────────────────────────────────────────────────┘

  ENVIRONMENT VARIABLES (.env — never committed to git)
    VITE_SUPABASE_URL          Supabase project URL
    VITE_SUPABASE_ANON_KEY     Supabase anonymous/public key
    VITE_GEMINI_API_KEY        Gemini API key (free tier)
    VITE_ADMIN_SECRET_KEY      Secret key for admin registration/login
    SUPABASE_SERVICE_ROLE_KEY  Edge Functions only (server-side)

  DEPLOYMENT STEPS
    1. Create Supabase project → run schema SQL → enable RLS
    2. Configure Edge Functions (deploy via Supabase CLI)
    3. Push React + Vite web to GitHub → connect to Vercel
    4. Set environment variables in Vercel dashboard
    5. Build React Native APK via Expo EAS Build
    6. Distribute APK via GitHub Releases or direct install


════════════════════════════════════════════════════════════════════════════════
  SECTION 20 — FUTURE SCOPE
════════════════════════════════════════════════════════════════════════════════

  Feature                          | Technology            | Priority
  ────────────────────────────────────────────────────────────────────
  Voice assistant for carbon log   | Web Speech API        | High
  IoT energy monitoring            | Smart meters + Supabase| High
  RFID attendance                  | IoT + Edge Functions  | High
  AR campus navigation             | WebXR / ARKit         | Medium
  Fully automatic activity detect  | Sensor fusion + ML    | Medium
  Carbon API (real-time factors)   | CarbonInterface API   | Medium
  AI predictive sustainability     | Gemini + trend data   | Medium
  Faculty/teacher portal           | New role + modules    | Medium
  Smart wearable carbon tracking   | Wear OS / WatchOS     | Low
  Carbon credit marketplace        | Blockchain / Web3     | Low
  Cross-campus sustainability net  | Multi-college Supabase| Low
  SMS alerts (paid)                | Twilio API            | Low
  PDF green audit report export    | Puppeteer / jsPDF     | Medium
  Canteen digital display          | Supabase Realtime     | Low
  Carpooling coordination module   | Geolocation matching  | Medium


════════════════════════════════════════════════════════════════════════════════
  SECTION 21 — LIMITATIONS & ASSUMPTIONS
════════════════════════════════════════════════════════════════════════════════

  LIMITATIONS
  LIM-01  Carbon calculations are approximate — based on standard IPCC
          emission factors, not real-time metered measurements
  LIM-02  All features require active internet connection
          (offline limited to cached static assets)
  LIM-03  GPS accuracy for bus tracking varies by device and environment
  LIM-04  AI (Gemini) responses may occasionally be inaccurate —
          users should treat as guidance, not absolute data
  LIM-05  Gamification relies on student honesty in manual data entry
          (no sensor verification for most categories)
  LIM-06  Free tier Supabase limits: 500MB DB, 1GB storage, 50K auth users
  LIM-07  Gemini free tier: 60 requests/min — may need queuing at scale
  LIM-08  Web Push notifications not supported on all iOS browsers
          (iOS 16.4+ Safari supports it; older versions may not)
  LIM-09  Carbon logs cannot be deleted (by design — audit integrity)

  ASSUMPTIONS
  ASM-01  College has a stable internet connection across campus
  ASM-02  Drivers have Android smartphones with working GPS
  ASM-03  Admin manages the platform on a desktop or laptop browser
  ASM-04  Students have smartphones (Android or iOS) with camera
  ASM-05  Gemini API key remains within free tier limits for the project scope
  ASM-06  Campus GPS coordinates for bus routes are pre-configured by admin
  ASM-07  Cafeteria carbon values for menu items are estimated by admin

================================================================================

        SCSAS — Smart Campus Sustainability & Assistant System
        Version 2.0 | PRD Complete | Production Ready

        "Every Action. Every Point. Greener Campus."

        Suitable for:
        ✓ VTU Final Year Project
        ✓ IEEE / ACM Hackathon
        ✓ GitHub Documentation
        ✓ Resume Showcase
        ✓ Startup MVP Pitch

================================================================================


════════════════════════════════════════════════════════════════════════════════
  SECTION 22 — INSTALLED DEPENDENCIES & ENVIRONMENT CONFIGURATION
════════════════════════════════════════════════════════════════════════════════

  22.1 ALL NPM DEPENDENCIES (package.json)
  ─────────────────────────────────────────────────────────────────────────────

  ┌─────────────────────────────┬──────────────┬─────────────────────────────────────────────────┐
  │ Package                     │ Version      │ Purpose                                         │
  ├─────────────────────────────┼──────────────┼─────────────────────────────────────────────────┤
  │ react                       │ ^19.1.0      │ Core UI rendering library                       │
  │ react-dom                   │ ^19.1.0      │ Mounts React app to browser DOM                 │
  │ react-router-dom            │ ^7.6.0       │ SPA client-side routing between all pages       │
  │ @supabase/supabase-js       │ ^2.49.8      │ Auth + PostgreSQL DB + Realtime + Storage       │
  │ @google/generative-ai       │ ^0.24.1      │ Gemini AI — eco tips, chatbot, study planner   │
  │ zustand                     │ ^5.0.4       │ Global state (auth, carbon, cart, notifs)       │
  │ recharts                    │ ^2.15.3      │ CO2 charts: line, bar, pie, area                │
  │ leaflet                     │ ^1.9.4       │ Bus tracking map engine (OpenStreetMap)         │
  │ react-leaflet               │ ^5.0.0       │ JSX wrapper for Leaflet map components          │
  │ qrcode.react                │ ^4.2.0       │ QR code generation (cafeteria tokens)           │
  │ html5-qrcode                │ ^2.3.8       │ Camera QR scanner (attendance)                  │
  │ lucide-react                │ ^0.511.0     │ 500+ consistent SVG icon set                    │
  │ framer-motion               │ ^12.12.1     │ Page transitions & micro-animations             │
  │ react-hot-toast             │ ^2.5.2       │ Success/error toast notifications               │
  │ date-fns                    │ ^4.1.0       │ Date formatting, streak calc, history grouping  │
  ├─────────────────────────────┼──────────────┼─────────────────────────────────────────────────┤
  │ DEV DEPENDENCIES            │              │                                                 │
  ├─────────────────────────────┼──────────────┼─────────────────────────────────────────────────┤
  │ vite                        │ ^6.3.5       │ Build tool & dev server with HMR                │
  │ @vitejs/plugin-react        │ ^4.4.1       │ React JSX + Fast Refresh for Vite               │
  │ tailwindcss                 │ ^4.1.6       │ Utility CSS — layout, spacing, flex/grid        │
  │ @tailwindcss/vite           │ ^4.1.6       │ Tailwind v4 Vite integration plugin             │
  │ autoprefixer                │ ^10.4.21     │ Auto browser vendor prefixes for CSS            │
  │ postcss                     │ ^8.5.3       │ CSS processing pipeline for Tailwind            │
  └─────────────────────────────┴──────────────┴─────────────────────────────────────────────────┘


  22.2 ENVIRONMENT VARIABLES REQUIRED
  ─────────────────────────────────────────────────────────────────────────────

  File: .env (create in project root)

  Variable                  | What It Is               | Where to Get It
  ──────────────────────────┼──────────────────────────┼────────────────────────────────────────
  VITE_SUPABASE_URL         | Your Supabase project URL | Dashboard → Project Settings → API
  VITE_SUPABASE_ANON_KEY    | Publishable/anon key      | Dashboard → Project Settings → API
  VITE_GEMINI_API_KEY       | Google AI Studio API key  | aistudio.google.com/apikey
  VITE_ADMIN_SECRET_KEY     | Self-defined secret       | Create your own strong password


  22.3 HOW TO GET EACH API KEY
  ─────────────────────────────────────────────────────────────────────────────

  A. SUPABASE URL & ANON KEY
  ─────────────────────────
    1. Go to supabase.com → Sign in
    2. Select your project (or create new one)
    3. Left sidebar → Project Settings → API
    4. Copy "Project URL" → VITE_SUPABASE_URL
    5. Copy "Publishable Key" (sb_publishable_...) or "anon public" → VITE_SUPABASE_ANON_KEY
    ✅ Already configured in this project.

  B. GOOGLE GEMINI API KEY
  ────────────────────────
    1. Go to: https://aistudio.google.com/apikey
    2. Sign in with Google account
    3. Click "Create API Key"
    4. Select or create a Google Cloud project
    5. Copy the key (starts with "AIza...")
    6. Paste as: VITE_GEMINI_API_KEY=AIza...
    
    Free Tier Limits:
    • 15 requests per minute
    • 1,000,000 tokens per day
    • Sufficient for a 1,000-student campus app

  C. ADMIN SECRET KEY
  ───────────────────
    This is NOT a third-party service — you define it yourself.
    
    1. Choose any strong string (min 16 characters)
       Examples: InstitutePulse@Admin2026!
                 SCSAS_Admin_SecretKey#99
    2. Set it in .env: VITE_ADMIN_SECRET_KEY=YourChosenKey
    3. The admin login at /secure-admin-panel/login requires:
       • Email + Password (Supabase Auth)
       • This secret key (3rd factor)
    4. NEVER commit this to git — share only with admins

  D. SUPABASE SERVICE ROLE KEY (Optional — server-side only)
  ─────────────────────────────────────────────────────────
    Only needed for Edge Functions / server-side admin operations.
    Dashboard → Project Settings → API → service_role (secret)
    ⚠️ NEVER prefix with VITE_ — this bypasses all RLS policies.


  22.4 SECURITY NOTES
  ─────────────────────────────────────────────────────────────────────────────

  • VITE_ prefixed variables are EXPOSED to the browser bundle
  • The VITE_SUPABASE_ANON_KEY is safe to expose — it's row-level security
    protected by RLS policies in the database
  • The VITE_GEMINI_API_KEY is visible in browser — for production, proxy
    through a Supabase Edge Function to prevent quota abuse
  • The VITE_ADMIN_SECRET_KEY is visible in bundle — consider moving admin
    auth to a server-side Edge Function for higher security production use
  • NEVER put SUPABASE_SERVICE_ROLE_KEY in any VITE_ variable


================================================================================

        SCSAS — Smart Campus Sustainability & Assistant System
        Version 2.0 | PRD Complete | Production Ready

        "Every Action. Every Point. Greener Campus."

        Suitable for:
        ✓ VTU Final Year Project
        ✓ IEEE / ACM Hackathon
        ✓ GitHub Documentation
        ✓ Resume Showcase
        ✓ Startup MVP Pitch

================================================================================

# InstitutePulse — Complete Project Context Document

> **Use this document to give any AI agent (ChatGPT, Gemini, Claude, Copilot, etc.) complete context about InstitutePulse so it can generate project reports, presentations (PPTs), documentation, abstracts, synopsis, or any academic/professional deliverable.**

---

## 1. PROJECT IDENTITY

| Field | Details |
|-------|---------|
| **Project Name** | InstitutePulse |
| **Tagline** | Smart Campus Sustainability & Assistant System |
| **One-Liner** | A modern SaaS-grade platform that combines environmental consciousness, campus operations, and AI-powered productivity into one unified ecosystem. |
| **Version** | 1.0.0 |
| **Project Type** | Full-Stack Web Application + Android Mobile App (Hybrid) |
| **Domain** | Smart Campus / Sustainability / EdTech / Green Technology |
| **Institution** | Jain College of Engineering |
| **Developer** | Manthan Patel (Full Stack Developer) |
| **Developer Portfolio** | https://manthantp-portfolio.vercel.app/ |
| **Developer GitHub** | https://github.com/ManthanTP |
| **Contact** | manthantp.work@gmail.com |
| **License** | Private — All rights reserved |
| **Year** | 2026 |
| **App ID (Android)** | com.institutepulse.app |

---

## 2. PROBLEM STATEMENT

Educational institutions face multiple disconnected challenges:

1. **No carbon footprint awareness** — Students and staff have zero visibility into their daily environmental impact (transport, electricity, food, water, waste).
2. **Manual, paper-based attendance** — Traditional attendance systems are slow, prone to proxy fraud, and don't scale.
3. **Fragmented campus operations** — Cafeteria ordering, lost & found, complaints, and event management all exist in separate silos with no unified platform.
4. **No gamification or motivation** — There is no reward system to incentivize eco-friendly behavior on campus.
5. **Lack of real-time data** — Administrators lack a live dashboard to monitor sustainability metrics, student engagement, and campus operations holistically.

---

## 3. PROPOSED SOLUTION

**InstitutePulse** is a unified Smart Campus Operating System that solves all of the above problems through a single platform with:

- **Personal Carbon Tracker** — Students log daily transport, food, electricity, water, and waste. The system calculates CO₂ emissions using IPCC-standard factors and assigns an Eco Score.
- **Gamified Sustainability** — Eco Points (XP), badges, streaks, and a real-time campus leaderboard create a competitive, engaging environment for green behavior.
- **Smart QR Attendance** — Timetable-driven, auto-generated QR codes with batch-level granularity, anti-proxy validation, and faculty verification.
- **Campus Services Hub** — Eco-Cafeteria ordering, lost & found registry, complaint ticketing, campus navigation, and event management — all in one place.
- **Interactive Study Tools** — Local Study Planner with Pomodoro timers for academic productivity.
- **Role-Based Dashboards** — Dedicated control panels for Students, Faculty, Cafeteria Owners, and Administrators.
- **Campus Green Cover Tracker** — Tracks trees, plants, and lawn area to calculate daily CO₂ absorption and determine if the campus is carbon neutral.
- **Anti-Cheat Carbon Integrity System** — Prevents gaming of the eco-points system with smart validation, canteen cross-referencing, quarantine workflows, and suspension enforcement.

---

## 4. TECHNOLOGY STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React | 19.1.0 |
| **Build Tool** | Vite | 6.3.5 |
| **Styling** | Tailwind CSS + Custom CSS | 4.3.0 |
| **State Management** | Zustand | 5.0.4 |
| **Routing** | React Router DOM | 7.6.0 |
| **Animations** | Framer Motion | 12.12.1 |
| **Charts & Graphs** | Recharts | 2.15.3 |
| **Backend (BaaS)** | Supabase (PostgreSQL, Auth, Realtime, RLS) | 2.49.8 |
| **JSON Utilities** | Native JSON parser | — |
| **Mobile Framework** | Capacitor (Android) | 8.4.0 |
| **Icons** | Lucide React | 0.511.0 |
| **QR Code Generation** | qrcode + qrcode.react | 1.5.4 / 4.2.0 |
| **QR Code Scanning** | html5-qrcode | 2.3.8 |
| **PDF Generation** | jsPDF + jspdf-autotable | 4.2.1 / 5.0.7 |
| **Excel Export** | xlsx (SheetJS) | 0.18.5 |
| **Date Utilities** | date-fns | 4.1.0 |
| **Toast Notifications** | react-hot-toast | 2.5.2 |
| **Maps** | Leaflet (via CDN) | 1.9.4 |
| **Typography** | Inter (Google Fonts) | — |
| **Deployment (Web)** | Vercel | — |
| **Language** | JavaScript (ES Modules) | — |

---

## 5. SYSTEM ARCHITECTURE

### 5.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  React 19 + Vite 6 + Tailwind CSS 4 + Framer Motion         │
│  (SPA with Role-Based Routing)                               │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Student  │ │ Faculty  │ │  Admin   │ │ Cafeteria Owner│  │
│  │Dashboard │ │Dashboard │ │Dashboard │ │   Dashboard    │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                           │
│  Zustand (State) + React Router 7 (Navigation)              │
│  + Carbon Calc Engine + PDF Export Engine                    │
├──────────────────────────────────────────────────────────────┤
│                      BACKEND LAYER                           │
│  Supabase                                                    │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │PostgreSQL │ │  Auth    │ │ Realtime │ │ Row Level    │  │
│  │ Database  │ │ (Email)  │ │Subscript.│ │  Security    │  │
│  └───────────┘ └──────────┘ └──────────┘ └──────────────┘  │
├──────────────────────────────────────────────────────────────┤
│                      MOBILE LAYER                            │
│  Capacitor → Android APK (com.institutepulse.app)            │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Authentication & Role Redirection Flow

```
User Opens App
   ↓
Authentication (Supabase Auth — Email + Password)
   ↓
Email Confirmation Required for New Accounts
   ↓
Session Validation
   ↓
Fetch User Role from `profiles` table
   ↓
Redirect Based on Role:
   ├── student  → /dashboard               (Green accent)
   ├── faculty  → /faculty/dashboard        (Blue accent)
   ├── owner    → /owner/dashboard          (Orange accent)
   └── admin    → /12345678/admin/dashboard (Red/Green accent, obfuscated URL)
```

---

## 6. ROLE-BASED ARCHITECTURE (4 ROLES)

### 6.1 Student Role

**Dashboard Route:** `/dashboard`
**Accent Color:** Green (#16a34a, #22c55e)
**Description:** Campus sustainability tracking, events, services, and AI tools.

**Available Modules (17 pages):**

| # | Module | Route | Description |
|---|--------|-------|-------------|
| 1 | Dashboard | `/dashboard` | Home with Eco Score Ring, Points, Streak, Rank, Quick Stats |
| 2 | Carbon Tracker | `/carbon/log` | Multi-step wizard to log daily transport, food, electricity, water, waste |
| 3 | Carbon Analytics | `/carbon/history` | Charts and history of carbon logs with trends |
| 4 | Carbon Balance | `/carbon/balance` | Campus green cover vs student emissions comparison |
| 5 | Leaderboard | `/leaderboard` | Campus-wide eco ranking with weekly/monthly filters |
| 6 | Events | `/events` | Browse, filter, register for campus events; QR pass generation |
| 7 | Eco-Cafeteria | `/cafeteria` | Browse menu, add to cart, place orders with carbon labels |
| 8 | Smart Attendance | `/attendance` | QR scanner for timetable-driven attendance marking |
| 9 | Complaints | `/complaints` | File and track campus complaints with priority levels |
| 10 | Lost & Found | `/lost-found` | Report lost items or claim found items |
| 11 | Study Planner | `/study-planner` | AI-powered study session planner with focus timers |
| 12 | Campus Navigation | `/navigation` | Interactive campus map with building/room search |
| 13 | Announcements | `/announcements` | View broadcasts from admin and faculty |
| 14 | Resource Hub | `/resources` | Academic resources and materials |
| 15 | Notifications | `/notifications` | Real-time notification center |
| 16 | Help | `/help` | In-app help documentation and FAQ |
| 17 | Profile | `/profile` | Profile settings, avatar, department, notification preferences |

**Dashboard Widgets:**
- Daily Eco Score Ring (circular gauge 0–100)
- Eco Points Counter (XP)
- Weekly Streak Tracker
- Sustainability Rank
- Upcoming Events
- Attendance Percentage
- Recent Notifications

---

### 6.2 Faculty Role

**Dashboard Route:** `/faculty/dashboard`
**Accent Color:** Blue (#3b82f6, #6366f1)
**Description:** Event management, attendance management, analytics, student oversight.

**Available Modules (13 pages):**

| # | Module | Route | Description |
|---|--------|-------|-------------|
| 1 | Dashboard | `/faculty/dashboard` | Overview cards: active events, participation, avg eco score |
| 2 | Manage Events | `/faculty/events` | Create/edit/delete events; manage registrations |
| 3 | Event Participants | `/faculty/participants` | View registered students per event |
| 4 | Analytics | `/faculty/analytics` | Event and student performance analytics |
| 5 | Sustainability Reports | `/faculty/sustainability` | Carbon analytics across students |
| 6 | Attendance Management | `/faculty/attendance` | QR generator, live scan registry, batch selector, verification |
| 7 | Cafeteria Monitoring | `/faculty/cafeteria` | View cafeteria orders and menu |
| 8 | Resource Hub | `/faculty/resources` | Upload/manage academic resources |
| 9 | Complaints Review | `/faculty/complaints` | View and respond to student complaints |
| 10 | Announcements | `/faculty/announcements` | Create and broadcast announcements |
| 11 | Notifications | `/faculty/notifications` | Faculty notification center |
| 12 | Profile | `/faculty/profile` | Faculty profile settings |
| 13 | Help | `/faculty/help` | Help and support documentation |

**Faculty Attendance Controls:**
- Start Attendance (auto QR from timetable)
- Cancel Class (with reason selection)
- Replace Faculty (substitute assignment)
- Change Classroom (instant student notification)
- Start Extra/Manual Class
- Extend QR Time (+5/+10 minutes)
- End Session Early
- Verify student scans (Confirm Present / Reject Proxy / Mark Manual / Mark Absent)

---

### 6.3 Cafeteria Owner Role

**Dashboard Route:** `/owner/dashboard`
**Accent Color:** Orange (#f59e0b, #f97316)
**Description:** Cafeteria menu management, order processing, and QR-based order verification.

**Available Modules (3 pages):**

| # | Module | Route | Description |
|---|--------|-------|-------------|
| 1 | Dashboard | `/owner/dashboard` | Order statistics, revenue, pending orders |
| 2 | Cafeteria Management | `/owner/cafeteria` | Menu CRUD, order processing, QR scanning for order verification |
| 3 | Profile | `/owner/profile` | Owner profile settings |

---

### 6.4 Admin Role

**Dashboard Route:** `/12345678/admin/dashboard`
**Accent Color:** Green (#16a34a) + Red (#ef4444) for security elements
**Description:** Full platform control with obfuscated URL path for security.
**Login URL:** `/12345678/admin/login`
**Security:** Email + Password + 2FA Access Key (VITE_ADMIN_SECRET_KEY) + 3-attempt lockout (60-second cooldown)

**Available Modules (18 pages):**

| # | Module | Route | Description |
|---|--------|-------|-------------|
| 1 | Dashboard | `/12345678/admin/dashboard` | Platform-wide overview and stats |
| 2 | User Management | `/12345678/admin/users` | View, edit, assign roles to all users |
| 3 | Sustainability Analytics | `/12345678/admin/sustainability` | Campus-wide carbon data, moderation queue, anti-cheat review |
| 4 | Event Management | `/12345678/admin/events` | Create/manage all events |
| 5 | Cafeteria Management | `/12345678/admin/cafeteria` | Menu management, order overview |
| 6 | Attendance System | `/12345678/admin/attendance` | Semester/division/batch/timetable management |
| 7 | Resource Hub | `/12345678/admin/resources` | Manage platform resources |
| 8 | Complaints Management | `/12345678/admin/complaints` | View, respond, close all complaints |
| 9 | Lost & Found Verification | `/12345678/admin/lost-found` | Verify and manage lost/found items |
| 10 | Broadcast Center | `/12345678/admin/broadcast` | Send platform-wide announcements |
| 11 | Notification Center | `/12345678/admin/notifications` | Manage all notifications |
| 12 | System Settings | `/12345678/admin/settings` | Carbon config, thresholds, validation limits |
| 13 | Audit Logs | `/12345678/admin/audit` | Activity and change history |
| 14 | Campus Locations | `/12345678/admin/navigation` | Manage campus map POIs |
| 15 | Green Cover Manager | `/12345678/admin/green-cover` | Manage trees, plants, lawns for CO₂ absorption tracking |
| 16 | Landing Page Editor | `/12345678/admin/landing-editor` | CMS for the public landing page sections |
| 17 | Profile | `/12345678/admin/profile` | Admin profile settings |
| 18 | Help | `/12345678/admin/help` | Admin help documentation |

---

## 7. CORE FEATURES — DETAILED DESCRIPTIONS

### 7.1 Carbon Footprint Tracker (FLAGSHIP FEATURE)

The Carbon Tracker is the heart of InstitutePulse. Every student logs their **previous day's** activities across 5 categories. The system calculates total CO₂ emissions, an Eco Score, and awards Eco Points (XP).

**5 Tracking Categories:**

#### A. Transport
Students select their commute mode and enter distance (km).

| Transport Mode | CO₂ Factor (kg/km) | Eco-Friendly? |
|---------------|-------------------|--------------|
| Car (Solo) | 0.210 | ❌ |
| Motorbike | 0.120 | ❌ |
| City Bus | 0.089 | ✅ |
| Auto Rickshaw (CNG) | 0.076 | ❌ |
| Car (Shared) | 0.053 | ✅ |
| College Bus | 0.048 | ✅ (+12 XP bonus) |
| Electric Scooter | 0.025 | ✅ |
| Bicycle | 0.000 | ✅ (+15 XP bonus) |
| Walking | 0.000 | ✅ (+15 XP bonus) |

**Formula:** `Transport CO₂ = Σ (km × Factor)`

#### B. Electricity
Students select devices used and hours of usage.

| Device | Power (kW) | CO₂/hour (kg) |
|--------|-----------|---------------|
| AC (1.5 Ton) | 1.80 | 1.476 |
| AC (1.0 Ton) | 1.50 | 1.230 |
| Washing Machine | 0.50 | 0.410 |
| Desktop PC | 0.20 | 0.164 |
| Ceiling Fan | 0.07 | 0.057 |
| Laptop | 0.05 | 0.041 |
| Mobile Charging | 0.01 | 0.008 |
| LED Bulb | 0.009 | 0.007 |

**India Grid Factor:** 0.82 kg CO₂/kWh
**Formula:** `Electricity CO₂ = Σ (Hours × CO₂_per_hour)`

#### C. Nutrition (Food)
Students select meal type for breakfast, lunch, and dinner.

| Meal Type | CO₂/meal (kg) |
|-----------|--------------|
| Red Meat (Beef/Pork) | 3.50 |
| Non-Veg (Chicken/Mutton) | 1.50 |
| Egg-based | 0.80 |
| Vegetarian | 0.50 |
| Vegan | 0.30 |
| Skipped | 0.00 |

**Formula:** `Food CO₂ = Σ (Meal Factors for Breakfast + Lunch + Dinner)`

#### D. Water
Students select shower type and general water usage level.

| Shower Type | Litres |
|------------|--------|
| Long Shower (15+ mins) | 150L |
| Medium Shower (10 mins) | 100L |
| Short Shower (5 mins) | 50L |
| Bucket Bath | 15L |

| General Usage Level | Litres |
|--------------------|--------|
| High | 150L |
| Medium | 100L |
| Low | 50L |

**Formula:** `Water CO₂ = (Shower Litres + General Litres) × 0.003`

#### E. Waste
Students select waste types and enter weight (kg).

| Waste Type | CO₂ Factor (kg CO₂/kg waste) |
|-----------|---------------------------|
| Plastic | 0.60 |
| General/Mixed | 0.50 |
| Paper | 0.20 |
| Recycled | 0.10 |
| Organic/Compost | 0.05 |

**Formula:** `Waste CO₂ = Σ (kg × Factor)`

#### Total Calculation

```
Total CO₂ = Transport CO₂ + Electricity CO₂ + Food CO₂ + Water CO₂ + Waste CO₂
```

**Eco Score** (0–100, evaluated against a campus budget of **5.0 kg CO₂** per student per day):

```
Eco Score = max(0, 100 − (Total_CO₂ / 5.0 × 100))
```

| Score Range | Grade | Label |
|------------|-------|-------|
| ≥ 90 | Excellent | Eco Champion |
| ≥ 70 | Good | Eco Friendly |
| ≥ 50 | Average | Room to Improve |
| ≥ 25 | Poor | Needs Attention |
| < 25 | Critical | High Impact Day |

**All calculations are based on IPCC (Intergovernmental Panel on Climate Change) standard emission factors, adjusted for the Indian regional power grid.**

---

### 7.2 Eco Points (XP) & Gamification System

| Reward Condition | XP Earned |
|-----------------|-----------|
| Base (logging daily) | +10 XP |
| Eco Score = 100 | +60 XP |
| Eco Score ≥ 90 | +40 XP |
| Eco Score ≥ 70 | +20 XP |
| Active Transit (Bicycle/Walking) | +15 XP |
| College Bus | +12 XP |
| All Vegan Meals | +15 XP |
| All Vegetarian Meals | +10 XP |
| 3-Day Logging Streak | +30 XP |
| 7-Day Logging Streak | +75 XP |
| 30-Day Logging Streak | +200 XP |
| First Ever Carbon Log | +50 XP |
| Welcome Bonus (on signup) | +20 XP |

**16 Achievement Badges:**

| Badge | Emoji | Requirement |
|-------|-------|-------------|
| First Step | 🌱 | Submitted first carbon log |
| Pedal Power | 🚴 | Used bicycle or walking 5 days |
| Green Streak | 🌿 | 7 consecutive days logged |
| Eco Champion | 🏆 | Eco score above 90 for 5 days |
| Veggie Week | 🥗 | All vegetarian meals for 7 days |
| Vegan Day | 🌱 | All vegan meals on one day |
| Bus Buddy | 🚌 | Used college bus 10 times |
| Energy Saver | ⚡ | Electricity CO₂ under 0.2 kg for 5 days |
| Zero Waste Hero | 🗑️ | Only organic/recycled waste for 7 days |
| 30-Day Streak | 🔥 | Logged every day for 30 days |
| Campus Hero | 🌍 | Ranked #1 on leaderboard any week |
| Challenge Winner | 🏅 | Completed any green challenge |
| Water Wise | 💧 | Short shower for 10 days |
| Perfect Day | 🌟 | Eco score of 100 on any day |
| Tree Planter | 🌲 | 1000 eco-points milestone |
| Planet Guardian | 🌏 | 5000 eco-points milestone |

---

### 7.3 Anti-Cheat & Carbon Log Integrity System

The system has a 4-pillar security architecture to prevent gaming:

**Pillar 1 — Yesterday-Aligned Timelines:**
- Students can only log **yesterday's** activities, preventing fabrication of empty/ideal logs before the day happens.

**Pillar 2 — Canteen Order Cross-Referencing:**
- If a student claims "skipped breakfast" but the canteen database shows a purchase during the breakfast slot, the log is flagged.
- Vegan/dairy inconsistency detection against cafeteria order records.

**Pillar 3 — Smart Validation Limits:**
- **Hard Limits** (immediate rejection): Walking > 30 km, device hours > 16, waste > 10 kg, transport > 150 km.
- **Suspicious Limits** (auto-quarantine for review): Transport > 60 km, walking > 15 km, device hours > 10, waste > 4 kg, total footprint < 0.3 kg.
- Consecutive perfect score lock: If a student logs 100% eco score for 3+ consecutive days, the log is auto-quarantined.

**Pillar 4 — Moderation & Suspension:**
- Quarantined logs go to an admin review queue.
- **Approved:** Student gets eco points credited.
- **Rejected:** Student's logging streak resets to 0.
- **Suspension:** 2+ rejections → student is flagged as `sustainability_restricted` and permanently excluded from leaderboards.

**Database support:** `carbon_log_thresholds` table stores all configurable limits; admin can adjust via System Settings.

---

### 7.4 Smart Timetable & QR Attendance System

**Academic Structure Hierarchy:**
```
Semester → Division → Lab Batch → Weekly Timetable → Attendance Session → QR Attendance
```

**Sample Structure:**
- Semester: 2nd Semester
- Division: A
- Classroom: A-113
- Lab Batches: A1, A2, A3

**Timetable Logic:**
- Timetable repeats automatically every week.
- System matches current day + time to timetable slot.
- Automatically generates an attendance session with a QR code.
- 10-minute QR attendance window.
- Faculty manual verification mandatory.

**QR Attendance Rules:**
- Theory classes: One QR for the whole division.
- Lab classes: Separate QR per batch (A1 ≠ A2 ≠ A3).
- One scan per student (duplicate blocked).
- Wrong batch/division scan blocked.
- QR auto-expires after timeout.
- Session auto-locks after timeout.

**Student Validation Chain:**
```
Scan QR → Verify Semester → Verify Division → Verify Batch → Verify Session → Check QR Expiry → Check Duplicate → Mark as "Pending Verification"
```

**Faculty Verification:**
Faculty sees each scan and must confirm: Student Name, USN/ID, Batch, Physical Presence.
Actions: Confirm Present | Reject Proxy | Mark Manual | Mark Absent.

**Faculty Class Override Features:**
- Cancel Class (with reason)
- Create Substitute Class
- Change Subject/Classroom
- Extend Session Time
- Start Manual Session
- End Session Early
- Assign Substitute Faculty

**Subjects (2nd Semester, Division A):**

| Code | Subject |
|------|---------|
| 1BMATS201 | Numerical Methods |
| 1BCHES202 | Applied Chemistry for Smart Systems |
| 1BPLC205B | Python Programming |
| 1BESC204A | Building Science & Mechanics |
| 1BAIA203 | Introduction to AI and Applications |
| 1BENG206 | Communication Skills |
| 1BICO207 | Indian Constitution & Engineering Ethics |

---

### 7.5 Campus Green Cover & CO₂ Neutralization Tracker

Tracks all vegetation on campus to calculate daily CO₂ absorption:

| Vegetation Type | CO₂ Absorption Factor (kg/day) |
|----------------|-------------------------------|
| Large Tree (Mango, Neem) | 0.060 |
| Medium Tree (Gulmohar, Ashoka) | 0.040 |
| Small Tree (Coconut Palm) | 0.025 |
| Large Shrub | 0.010 |
| Small Plant / Sapling | 0.003 |
| Indoor Plant | 0.001 |
| Lawn (per sq. meter) | 0.002 |

**Carbon Neutrality Formula:**
```
Net Carbon = Total Student CO₂ Emissions − Total Green Cover CO₂ Absorption
If Net Carbon ≤ 0 → Campus is CARBON NEUTRAL ✅
```

**Features:**
- Admin can add/edit/delete green cover entries with zone, GPS coordinates, and planting date.
- Daily snapshots stored for historical trend charts.
- Carbon Balance Page shows students vs. green cover comparison.

---

### 7.6 Eco-Cafeteria System

- Digital menu with categories: Breakfast, Lunch, Snacks, Beverages, Dinner.
- Each item shows price, carbon footprint (kg CO₂), vegetarian/vegan labels.
- Cart system with running total (price + carbon).
- Order placed → Token number + QR code generated.
- Order statuses: Pending → Preparing → Ready → Delivered / Cancelled.
- Cafeteria Owner scans QR to verify and deliver orders.
- Real-time order status updates via Supabase Realtime.

**Sample Menu Items (Indian cuisine):**

| Item | Category | Price (₹) | Carbon (kg) | Veg |
|------|----------|----------|------------|-----|
| Masala Dosa | Breakfast | 40 | 0.50 | ✅ |
| Idli Sambar | Breakfast | 30 | 0.30 | ✅ |
| Veg Fried Rice | Lunch | 60 | 0.60 | ✅ |
| Chicken Biryani | Lunch | 90 | 1.50 | ❌ |
| Fruit Salad | Snacks | 35 | 0.10 | ✅ |
| Samosa (2 pcs) | Snacks | 20 | 0.30 | ✅ |
| Masala Chai | Beverages | 15 | 0.10 | ✅ |
| Nimbu Pani | Beverages | 20 | 0.05 | ✅ |

---

### 7.7 Events System

**Student Flow:**
Browse Events → Filter by Category → View Details → Register (Solo or Create/Join Team) → QR Pass Generated → Access Event Discussion Room → Attend → Eco Points Awarded

**Event Categories:** Sustainability, Technical, Workshop, Seminar, History (past events), Hackathon, Gaming, Other.

**Event Data:** Title, date/time, venue, category, max participants, current participants, eco reward points, description, chat toggle, team_type, max_team_size.

**Game / Team Format Configurations:**
- Supports **Solo**, **Duo**, **Trio**, **Squad**, and **Custom Size** options.
- Organizers (Admin/Faculty) specify formats and set custom maximum sizes (e.g. up to 10 for Hackathons).

**Teammate Invitations & Registration Flow:**
- Unregistered students register for team events by creating a team (inputting a Team Name and searching/inviting classmates from the student directory).
- The team creator is assigned as the **Team Leader**. Teammates are added with a `pending` status.
- Students receive real-time notifications about team invites on their dashboard and can **Accept** or **Decline**. Accepting registers them as `accepted` and links them to the event's participants.
- Registered users can view their team roster and real-time statuses (Leader, Accepted, Pending, Declined). Leaders can invite additional classmates if empty slots are available.
- **Visual Layout Fix (Desktop & Mobile):** The team registration form, classmate search results list, invite buttons, and live discussion panels are optimized to span the full width of the modal, resolving the previous cramped 50% left-column constraints.

**Leader-Only Chat Room Restrictions:**
- In team events, only the **Team Leader** (the team creator) is permitted to type and send messages in the discussion room.
- Non-leader members have read-only access to the discussion room with a lock status indicator: `🔒 Only team leaders can chat in event discussion room`.
- For solo events, any registered student can chat freely.

**Management & Exports:**
- Faculty and Admin dashboards display registrations grouped by Team Name for team events, detailing member roles and status.
- Support for exporting rosters in **PDF** and **Excel** (`XLSX` format compiled using SheetJS/`xlsx` library).

---

### 7.8 Leaderboard System

**Tabs:**
- 🏆 Campus Ranking
- 🏫 Department Ranking
- 📈 Monthly Leaders
- 🏅 My Achievements

**Features:**
- Real-time recalculation on eco-activity.
- Weekly/monthly filters.
- Badge & streak display.
- XP progression system.

---

### 7.9 Complaint System

- Students file complaints with: Category, Title, Description, Priority (Low/Medium/High/Urgent).
- Statuses: Open → In Progress → Resolved → Closed.
- Admin/Faculty can respond and update status.
- Full audit trail with timestamps.

---

### 7.10 Lost & Found

- Report type: Lost or Found.
- Fields: Item name, description, location, image.
- Statuses: Open → Claimed → Closed.
- Admin verification required.
- Public read access for all authenticated users.

---

### 7.11 Interactive Study Planner & Local Tips

- **Interactive Study Planner:** Organizes focus sessions with task breakdowns. Includes task CRUD with `study_tasks` table, status management (pending → in_progress → completed), customizable study schedules, and Pomodoro focus timer integration.
- **Local Carbon Tips:** After logging, the local rule-based system generates personalized sustainability tips in the carbon log results based on the user's carbon footprint categories (e.g. suggesting transit sharing if commute carbon is high).

---

### 7.12 Campus Navigation

- Interactive map using Leaflet.js.
- Building/room search.
- POIs: Library, Labs, Canteen, Admin Office, Seminar Hall, Sports Ground.
- Admin can manage campus locations via CRUD interface.

---

### 7.13 Notification System

- Notifications for: eco events, order updates, attendance reminders, announcements.
- Two notification tables:
  - `student_notifications` — targeted to individual students (with sender_id tracking).
  - `notifications` — general/faculty notifications (with optional user targeting).
- Real-time via Supabase Realtime subscriptions.
- Configurable notification preferences per user (eco, order, attendance, announcements).
- **Optimization & Caching:** Prevents duplicate notification queries and redundant WebSocket connections by caching fetched status alerts using Zustand `hasFetched` persistent indicators. The database subscriptions are preserved across layout transitions and clean up automatically on logout to save network bandwidth.
- **Faculty XP Awarding Notifications:** When faculty members award XP points, the system correctly fetches the student profile ID and routes the notifications to the targeted `student_notifications` table (represented with a Trophy icon) rather than the admin-only `notifications` table, ensuring students see their rewards immediately.

---

### 7.14 Announcements / Broadcast System

- Stored in `announcements` table with priority levels (urgent, warning, info).
- Audience targeting: `global` (all users) or `students` only.
- Real-time updates via Supabase Realtime subscription on `announcements` table.
- Priority-based visual styling: Urgent (red pulse), Warning (yellow), Info (orange).
- Author tracking with role badge (Admin / Faculty / System).
- Faculty can create, edit, and delete announcements from Faculty Announcements page.
- Admin sends broadcasts from the Admin Broadcast page.

---

### 7.15 Admin Landing Page CMS

- Admin can edit all sections of the public landing page via a visual editor.
- Sections stored in `landing_sections` table as JSONB content.
- Sections: Hero, Features Bento, Impact, Tech Stack, Milestones (How It Works), FAQ, CTA, Footer, Creator Bio, Privacy Policy, Terms of Service.
- Each section has visibility toggle and sort order.

---

### 7.16 PDF & Excel Export

- Admin Sustainability page can export reports as PDF using jsPDF.
- Attendance reports exportable as Excel using SheetJS.
- Professional formatting with charts and tables.

---

### 7.17 Resource Hub

- Digital learning resources shared by faculty (PDFs, Documents, Videos, Links).
- Stored in `digital_resources` table with fields: title, description, file_type, file_url, subject_name.
- Students browse and search by title, subject, or description.
- Category filters: All, PDFs, Documents, Videos, Links.
- Faculty can create, edit, delete resources.
- Admin has full CRUD management.

---

### 7.18 Authentication & Account Recovery

- **Registration:** Email + Password with role selection, semester/division selection (fetched from `academic_semesters` / `academic_divisions`), USN, department, and full name.
- **Faculty Registration:** Requires Faculty Access Key (`VITE_FACULTY_SECRET_KEY`).
- **Admin Login:** Requires Access Key (`VITE_ADMIN_SECRET_KEY`) with 3-attempt lockout.
- **Forgot Password:** Email-based password reset link via Supabase Auth.
- **Reset Password:** Token-verified password change page.
- **Email Verification:** Post-registration verification flow with custom verification page.

---

## 8. DATABASE SCHEMA (SUPABASE / POSTGRESQL)

### Core Tables (All with Row Level Security enabled):

| # | Table | RLS | Description |
|---|-------|-----|-------------|
| 1 | `profiles` | ✅ | User identity: id, full_name, email, role, department, usn, semester_id, division_id, eco_points, total_co2_kg, logging_streak, last_log_date, notification_prefs, avatar_url, rejection_count, sustainability_restricted |
| 2 | `carbon_logs` | ✅ | Daily carbon tracking: student_id, log_date, transport_kg, electricity_kg, food_kg, water_kg, waste_kg, total_kg, eco_score, eco_points_earned, transport_mode/detail, meals_detail, devices_detail, water_detail, waste_detail, ai_tips, log_status, flagged, flag_type, flag_details |
| 3 | `eco_badges` | ✅ | Achievement badges: student_id, badge_key, earned_at |
| 4 | `menu_items` | ✅ | Cafeteria menu: name, description, category, price, carbon_kg, is_vegetarian, is_vegan, available, image_url |
| 5 | `orders` | ✅ | Cafeteria orders: student_id, items (JSONB), total_price, total_carbon_kg, status, token_number, qr_code, special_instructions |
| 6 | `events` | ✅ | Campus events: title, description, category, event_date, venue, eco_points, max_participants, current_participants, enable_chat, created_by, team_type, max_team_size |
| 7 | `event_participants` | ✅ | Event registrations: event_id, student_id |
| 8 | `event_messages` | ✅ | Event Discussion Room chat: event_id, sender_id, message, created_at |
| 9 | `attendance_sessions` | ✅ | QR attendance sessions: teacher_id, subject, division_id, qr_code, expires_at, status, session_type |
| 10 | `attendance_records` | ✅ | Individual attendance marks: session_id, student_id, marked_at |
| 11 | `complaints` | ✅ | Student complaints: student_id, category, title, description, priority, status, admin_response |
| 12 | `lost_found_items` | ✅ | Lost & found: reported_by, type (lost/found), item_name, description, location, image_url, status, verified |
| 13 | `campus_locations` | ✅ | Campus map POIs: name, type, building, floor, description, lat, lng |
| 14 | `notifications` | ✅ | General/faculty notifications: user_id, title, message, type, is_read |
| 15 | `student_notifications` | ✅ | Student-targeted notifications: student_id, sender_id, title, message, type |
| 16 | `announcements` | ✅ | Broadcast system: title, content, priority (urgent/warning/info), audience_type (global/students), created_by |
| 17 | `digital_resources` | ✅ | Resource hub: title, description, file_type (PDF/Document/Video/Link), file_url, subject_name |
| 18 | `study_tasks` | ✅ | AI Study Planner tasks: student_id, title, description, subject, status, priority, due_date |
| 19 | `carbon_log_thresholds` | ✅ | Configurable anti-cheat validation limits |
| 20 | `campus_green_cover` | ✅ | Green cover entries: name, type, count, area_sqm, zone, lat/lng, co2_factor_kg_day |
| 21 | `green_cover_snapshots` | ✅ | Daily carbon neutrality snapshots |
| 22 | `landing_sections` | ✅ | CMS content for public landing page sections |
| 23 | `academic_semesters` | ✅ | Academic semesters (renamed from `semesters`) |
| 24 | `academic_divisions` | ✅ | Academic divisions (renamed from `divisions`) |
| 25 | `academic_subjects` | ✅ | Academic subjects (renamed from `subjects`) |
| 26 | `academic_classrooms` | ✅ | Classroom rooms (renamed from `classrooms`) |
| 27 | `lab_batches` | ✅ | Lab batch groups (A1, A2, A3) |
| 28 | `timetable` | ✅ | Weekly recurring timetable slots |
| 29 | `institution_settings` | ✅ | Global settings including carbon_config |
| 30 | `event_teams` | ✅ | Event teams tracking: id, event_id, team_name, leader_id, created_at |
| 31 | `event_team_members` | ✅ | Team members tracking: id, team_id, student_id, status (pending/accepted/declined), invited_at |

### Key Database Functions:
- `handle_new_user()` — Trigger function that auto-creates a profile row on signup with 20 XP welcome bonus.
- `is_admin()` — Helper that checks if the current user has the admin role.
- `get_moderation_stats()` — Returns JSON with counts of pending/approved/rejected logs and suspended users.

### Realtime Subscriptions:
- `orders` — Cafeteria order status updates
- `notifications` — Push notification delivery
- `student_notifications` — Student notification delivery
- `attendance_sessions` — Live attendance session updates
- `event_messages` — Event Discussion Room live chat
- `announcements` — Broadcast updates
- `profiles` — Real-time profile updates (eco points, streak)
- `attendance_records` — QR attendance scan updates

---

## 9. SECURITY ARCHITECTURE

| Security Layer | Implementation |
|---------------|---------------|
| **Authentication** | Supabase Auth (Email + Password) |
| **Email Verification** | Required for new account activation |
| **Route Guards** | `ProtectedRoute`, `AdminRoute`, `FacultyRoute`, `OwnerRoute`, `PublicRoute` components |
| **Admin Path Obfuscation** | Admin portal hidden behind `/12345678/admin/...` URL path |
| **Admin 2FA** | Secondary access key (`VITE_ADMIN_SECRET_KEY`) required at admin login |
| **Brute Force Protection** | 3 failed admin login attempts → 60-second lockout |
| **Database RLS** | Row Level Security policies on ALL tables |
| **Carbon Log Integrity** | Hard limits, suspicious thresholds, quarantine, moderation queue |
| **QR Anti-Proxy** | Batch/division validation, faculty verification, single-scan enforcement |
| **Audit Logging** | Class change logs, moderation actions tracked with timestamps |

---

## 10. DESIGN SYSTEM — "PULSE"

| Design Element | Details |
|---------------|---------|
| **Theme** | Dark glassmorphic (slate-950 base) |
| **Glass Cards** | `glass-card` CSS class with `backdrop-blur` and subtle white borders |
| **Border Radius** | 40px for hero cards |
| **Font** | Inter (Google Fonts), font-black weight for labels |
| **Label Style** | All-caps, `tracking-widest` for status labels |
| **Animations** | Framer Motion throughout all pages |
| **Responsive** | Mobile-first with sidebar → bottom tab bar transition |
| **Student Accent** | Green (#16a34a, #22c55e) |
| **Faculty Accent** | Blue (#3b82f6, #6366f1) |
| **Admin Accent** | Green + Red for security elements |
| **Owner Accent** | Orange (#f59e0b) |

---

## 11. PROJECT STRUCTURE (FILE TREE)

```
InstitutePulse/
├── index.html                      # HTML entry point with SEO meta tags
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Vite build configuration
├── capacitor.config.json           # Android app config (com.institutepulse.app)
├── vercel.json                     # Vercel deployment rewrites
├── schema.sql                      # Core database schema
├── anti_cheat_migration.sql        # Anti-cheat system migration
├── green_cover_migration.sql       # Green cover tables migration
├── landing_sections_schema.sql     # Landing page CMS schema + seed data
├── fix_carbon_log_rls.sql          # Carbon log RLS fixes
├── InstitutePulse.apk              # Built Android APK (~38 MB)
├── logo_with_background.jpeg       # Logo (with background)
├── logo_with_no_background.png     # Logo (transparent)
│
├── src/
│   ├── App.jsx                     # Root router with all role-based routes
│   ├── main.jsx                    # React entry point
│   ├── index.css                   # Global styles + design tokens
│   │
│   ├── components/
│   │   ├── StudentLayout.jsx       # Student sidebar + header + bottom nav
│   │   ├── RouteGuards.jsx         # ProtectedRoute, AdminRoute, FacultyRoute, OwnerRoute, PublicRoute
│   │   ├── BottomTabBar.jsx        # Student mobile bottom navigation
│   │   ├── FacultyBottomNav.jsx    # Faculty mobile bottom navigation
│   │   ├── OwnerBottomNav.jsx      # Owner mobile bottom navigation
│   │   ├── EcoScoreRing.jsx        # Circular eco-score gauge widget
│   │   ├── OrderScannerModal.jsx   # QR scanner for order verification
│   │   ├── PDFExportModal.jsx      # PDF export configuration modal
│   │   └── landing/               # Landing page sub-components
│   │       ├── AboutCreator.jsx
│   │       ├── PortfolioPreview.jsx
│   │       └── SkillBadge.jsx
│   │
│   ├── lib/
│   │   ├── supabase.js             # Supabase client initialization
│   │   ├── carbonCalc.js           # Carbon calculation engine (all factors, formulas, validation)
│   │   ├── greenCover.js           # Green cover calculation utilities
│   │   └── pdfExport.js            # PDF generation engine
│   │
│   ├── store/
│   │   └── index.js                # Zustand stores: useAuthStore, useNotifStore, useCarbonStore, useCartStore, useFacultyNotifStore
│   │
│   ├── data/
│   │   └── helpContent.js          # Help page content data
│   │
│   ├── hooks/
│   │   └── useLandingContent.js    # Custom hook for fetching landing page CMS content
│   │
│   └── pages/
│       ├── LandingPage.jsx         # Public landing page (122 KB — full CMS-driven)
│       ├── auth/
│       │   ├── LoginPage.jsx       # Student/Faculty/Owner login
│       │   ├── RegisterPage.jsx    # New account registration
│       │   ├── AdminLoginPage.jsx  # Admin 2FA login
│       │   ├── ForgotPasswordPage.jsx
│       │   └── ResetPasswordPage.jsx
│       ├── student/                # 16 student pages
│       │   ├── DashboardPage.jsx
│       │   ├── CarbonLogPage.jsx   # (58 KB — multi-step wizard)
│       │   ├── CarbonHistoryPage.jsx
│       │   ├── CarbonBalancePage.jsx
│       │   ├── LeaderboardPage.jsx
│       │   ├── EventsPage.jsx
│       │   ├── CafeteriaPage.jsx
│       │   ├── AttendancePage.jsx  # (27 KB — QR scanner)
│       │   ├── StudyPlannerPage.jsx # (58 KB — AI-powered)
│       │   ├── ComplaintsPage.jsx
│       │   ├── LostFoundPage.jsx
│       │   ├── NavigationPage.jsx
│       │   ├── AnnouncementsPage.jsx
│       │   ├── ResourceHubPage.jsx
│       │   ├── NotificationsPage.jsx
│       │   └── ProfilePage.jsx
│       ├── faculty/                # 14 faculty pages
│       │   ├── FacultyLayout.jsx
│       │   ├── FacultyDashboard.jsx
│       │   ├── FacultyAttendancePage.jsx # (58 KB — QR generator + verification)
│       │   ├── FacultyEventsPage.jsx
│       │   ├── FacultyParticipantsPage.jsx
│       │   ├── FacultyAnalyticsPage.jsx
│       │   ├── FacultySustainabilityPage.jsx # (48 KB)
│       │   ├── FacultyResourceHubPage.jsx
│       │   ├── FacultyCafeteriaPage.jsx
│       │   ├── FacultyComplaintsPage.jsx
│       │   ├── FacultyAnnouncementsPage.jsx
│       │   ├── FacultyNotificationsPage.jsx
│       │   ├── FacultyProfilePage.jsx
│       │   └── FacultyStubPage.jsx
│       ├── admin/                  # 20 admin pages
│       │   ├── AdminLayout.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminSustainabilityPage.jsx # (47 KB — moderation dashboard)
│       │   ├── AdminUsersPage.jsx
│       │   ├── AdminEventsPage.jsx
│       │   ├── AdminCafeteriaPage.jsx
│       │   ├── AdminAttendancePage.jsx
│       │   ├── AdminResourceHubPage.jsx
│       │   ├── AdminComplaintsPage.jsx
│       │   ├── AdminLostFoundPage.jsx
│       │   ├── AdminBroadcastPage.jsx
│       │   ├── AdminNotificationsPage.jsx
│       │   ├── AdminSettingsPage.jsx
│       │   ├── AdminAuditPage.jsx
│       │   ├── AdminNavigationPage.jsx
│       │   ├── AdminGreenCoverPage.jsx # (45 KB)
│       │   ├── AdminLandingPage.jsx   # (48 KB — CMS editor)
│       │   ├── AdminProfilePage.jsx
│       │   ├── AdminHelpPage.jsx
│       │   └── AdminStubPage.jsx
│       ├── owner/                  # 4 owner pages
│       │   ├── OwnerLayout.jsx
│       │   ├── OwnerDashboard.jsx
│       │   ├── OwnerCafeteriaPage.jsx
│       │   └── OwnerProfilePage.jsx
│       └── shared/                 # 3 shared pages
│           ├── HelpPage.jsx
│           ├── NotFoundPage.jsx
│           └── VerificationPage.jsx
```

**Total Pages:** 57+ React components
**Total Source Code Size:** ~1.2 MB+ of JSX

---

## 12. REALTIME FEATURES (Supabase Realtime)

| Feature | Table | Event |
|---------|-------|-------|
| Cafeteria Order Status | `orders` | INSERT, UPDATE |
| Student Notifications | `student_notifications` | INSERT |
| Faculty Notifications | `notifications` | INSERT |
| Leaderboard Updates | `profiles` (eco_points) | UPDATE |
| Attendance Session Updates | `attendance_sessions` | INSERT, UPDATE |
| QR Attendance Scans | `attendance_records` | INSERT |
| Event Discussion Room | `event_messages` | INSERT |
| Broadcast Updates | `announcements` | INSERT, UPDATE, DELETE |
| Profile Real-time Sync | `profiles` | UPDATE |

---

## 13. DEPLOYMENT & BUILD

| Platform | Configuration |
|----------|--------------|
| **Web Hosting** | Vercel (SPA with catch-all rewrite to index.html) |
| **Mobile** | Capacitor → Gradle Android Build (JDK 21) → APK (~38 MB) |
| **Build Command** | `npm run build` (Vite production build) |
| **Dev Command** | `npm run dev` (Vite dev server) |
| **Preview Command** | `npm run preview` (Vite preview server) |
| **Cap Sync** | `npx cap sync android` |
| **Cap Open** | `npx cap open android` |
| **Cap Build Outputs** | Placed in root, `public/`, and `dist/` as `InstitutePulse.apk` (~38.17 MB) |

---

## 14. KEY DIFFERENTIATORS & INNOVATION

1. **IPCC-Standard Carbon Tracking** — Not a toy calculator; uses real emission factors from the Intergovernmental Panel on Climate Change.
2. **Anti-Cheat Gamification** — Unique 4-pillar integrity system (yesterday logging, canteen cross-referencing, smart validation, moderation) prevents eco-point farming.
3. **Carbon Neutrality Dashboard** — Combines student emissions with campus green cover to calculate net carbon position — a feature not found in typical campus apps.
4. **Unified Smart Campus OS** — Attendance, cafeteria, complaints, events, navigation, announcements, and sustainability all in one platform (not separate apps).
5. **Role-Based Multi-Dashboard** — Four distinct dashboard experiences (Student, Faculty, Admin, Owner) with dedicated layouts, navigation, and accent colors.
6. **CMS-Driven Landing Page** — Admin can edit every section of the public website without touching code.
7. **Real-Time Everything** — Orders, notifications, attendance, event chat, announcements, and leaderboards all update in real-time via Supabase subscriptions.
8. **Mobile-First Design** — Built as a responsive PWA-like experience wrapped in Capacitor for native Android deployment.
9. **Event Discussion Rooms** — Real-time chat rooms per event for registered participants, with faculty role badges.
10. **Digital Resource Hub** — Faculty-shared study materials (PDFs, Videos, Links) accessible to all students.

---

## 15. ACADEMIC CONTEXT

| Field | Details |
|-------|---------|
| **Institution** | Jain College of Engineering |
| **Course** | B.E. (Computer Science & Engineering) — adjust as needed |
| **Semester** | 2nd Semester (current timetable configured) |
| **Academic Year** | 2025–2026 |
| **Project Guide** | (Add your faculty guide's name here) |
| **Team Size** | 1 (Solo Developer — Manthan Patel) |
| **Development Period** | (Add your start date – end date) |
| **SDG Alignment** | UN SDG 4 (Quality Education), SDG 11 (Sustainable Cities), SDG 12 (Responsible Consumption), SDG 13 (Climate Action) |

---

## 16. FUTURE SCOPE

- GPS-based classroom validation for attendance
- Face verification for anti-proxy detection
- NFC-based attendance scanning
- Algorithmic proxy detection using behavioral patterns
- Offline attendance sync
- Push notifications via Firebase Cloud Messaging
- iOS build via Capacitor
- Multi-institution SaaS deployment
- Carbon credit marketplace
- Integration with government sustainability databases
- Machine learning-based eco score prediction
- Smart energy monitoring via IoT sensors

---

## 17. INSTRUCTIONS FOR AI AGENTS

When generating documents about InstitutePulse, use this context to:

1. **Reports (Project Report, Synopsis, Abstract):** Focus on the problem statement, proposed solution, technology stack, system architecture, core features (especially carbon tracker with IPCC factors), database schema, security, and future scope.

2. **Presentations (PPT):** Structure as: Introduction → Problem → Solution → Architecture → Tech Stack → Core Features (Carbon Tracker, Attendance, Gamification) → Anti-Cheat System → Green Cover → Screenshots → Future Scope → Conclusion.

3. **Literature Survey:** Reference IPCC emission factors, campus sustainability initiatives, gamification in education, QR attendance systems, and Supabase as a BaaS platform.

4. **SRS/SDD Documents:** Use the database schema, role architecture, feature descriptions, and security architecture sections.

5. **Diagrams:** Use the architecture diagram, auth flow, carbon calculation flow, attendance flow, and role hierarchy described above.

6. **Key Selling Points to Emphasize:**
   - IPCC-standard emission factors (not arbitrary numbers)
   - 4-role multi-dashboard architecture
   - Anti-cheat integrity system (unique differentiator)
   - Carbon neutrality calculation (green cover vs emissions)
   - Event Discussion Rooms (real-time chat)
   - Digital Resource Hub
   - 55+ production-quality pages
   - Full real-time capabilities (8+ Realtime channels)
   - Solo developer achievement

---

**© 2026 InstitutePulse. Built for Jain College of Engineering by Manthan Patel.**
**Built with 💚 for a sustainable campus future.**

# InstitutePLUSE — Product Requirements Document

**Version:** 1.0 | **Last Updated:** May 2026  
**Developer:** Manthan Patel — CSE, Jain College of Engineering  
**Platform:** Web (Vite + React) & Android (Capacitor)  
**Backend:** Supabase (Auth, Database, Realtime)

---

## 1. What is InstitutePLUSE?

- A smart campus app that combines sustainability tracking, attendance, cafeteria ordering, events, and student services into one platform
- Replaces paper registers, scattered forms, and manual processes with a single digital system
- Works on both web browsers and Android phones
- Has four separate portals — Student, Faculty, Canteen Owner, and Admin — each with their own dashboard and sidebar navigation

---

## 2. Problems It Solves

- Students have no idea how much carbon their daily habits produce — no tracking, no awareness
- Paper attendance is slow and easy to cheat (proxy attendance)
- Canteen ordering, event registration, complaints, and lost items are all handled through different systems
- No reward system to motivate students toward green habits
- College management cannot see live data on student activity, attendance, or sustainability metrics

---

## 3. User Roles & Access

- **Student** — Standard access. Gets carbon tracker, leaderboard, events, cafeteria, attendance, study planner, campus map, complaints, lost & found, resource hub, notifications
- **Faculty** — Elevated access. Gets event management, QR attendance controls, sustainability reports, analytics, announcements, resource sharing, complaint reviews
- **Canteen Owner** — Elevated access. Gets menu management, QR order scanner, real-time order queue, revenue stats
- **Admin** — Root access. Gets full platform control — user management, carbon settings, green cover, broadcast center, audit logs, landing page editor, and all modules

---

## 4. Public Pages & Authentication

### Landing Page
- **Route:** `/`
- **Page:** `LandingPage.jsx`
- Public marketing page — features showcase, app download link, FAQs
- Links to `/login` and `/register` for sign-in/sign-up
- Content is editable by admin via the Landing Editor page

### Login
- **Route:** `/login`
- **Page:** `LoginPage.jsx`
- Email + password login (Supabase Auth)
- On success, fetches role from `profiles` table and redirects:
  - Student → `/dashboard`
  - Faculty → `/faculty/dashboard`
  - Owner → `/owner/dashboard`
- Links to `/register` (create account) and `/forgot-password` (reset password)
- Wrapped in `PublicRoute` — logged-in users are redirected away

### Register
- **Route:** `/register`
- **Page:** `RegisterPage.jsx`
- New account creation with fields for name, email, password, department, semester, section, batch
- After registration, user is sent to `/verify` for email confirmation
- Wrapped in `PublicRoute`

### Forgot Password
- **Route:** `/forgot-password`
- **Page:** `ForgotPasswordPage.jsx`
- Enter email to receive a password reset link
- Wrapped in `PublicRoute`

### Reset Password
- **Route:** `/reset-password`
- **Page:** `ResetPasswordPage.jsx`
- Token-based form to set a new password (accessed from email link)

### Email Verification
- **Route:** `/verify` and `/verify/:id`
- **Page:** `VerificationPage.jsx`
- Confirmation landing page after email signup

### Admin Login
- **Route:** `/12345678/admin/login`
- **Page:** `AdminLoginPage.jsx`
- Hidden admin login on an obfuscated URL path
- Requires email + password + secondary 2FA access key (`VITE_ADMIN_SECRET_KEY`)
- 3 wrong attempts → 60 second lockout
- On success, redirects to `/12345678/admin/dashboard`

---

## 5. Student Portal

All student pages are wrapped inside `StudentLayout.jsx`, which provides the sidebar navigation, top bar with greeting and eco points, mobile hamburger menu, notification bell, and bottom tab bar. Every student route is protected by `ProtectedRoute`.

### 5.1 Dashboard
- **Route:** `/dashboard`
- **Page:** `DashboardPage.jsx`
- Main landing page after student login
- Shows time-based greeting (Good morning/afternoon/evening/night), eco score ring, eco points, weekly streak, sustainability rank, upcoming events, attendance summary, recent notifications
- Quick action cards link to `/carbon/log`, `/events`, `/cafeteria`, `/attendance`, etc.

### 5.2 Carbon Tracker
- **Route:** `/carbon/log`
- **Page:** `CarbonLogPage.jsx`
- Students log yesterday's data across five categories — Travel, Electricity, Food, Water, Waste
- Uses standard emission factors (Indian grid: 0.82 kg CO₂/kWh)
- Calculates Eco Score out of 100 based on daily emissions vs a 5 kg carbon limit
- Anti-cheat: rejects impossible values (commute > 150 km, phone > 16 hrs, waste > 10 kg), cross-checks canteen orders, flags suspicious streaks
- Date locked to yesterday only — no future logging
- On submit, XP is awarded and data saved to `carbon_logs` table
- Links to `/carbon/history` for analytics and `/carbon/balance` for net balance

### 5.3 Carbon Analytics
- **Route:** `/carbon/history`
- **Page:** `CarbonHistoryPage.jsx`
- Historical emission charts using Recharts
- Daily, weekly, monthly views with category breakdowns (travel, electricity, food, water, waste)
- Trend lines and comparison data

### 5.4 Carbon Balance
- **Route:** `/carbon/balance`
- **Page:** `CarbonBalancePage.jsx`
- Compares student emissions against campus green cover absorption
- Shows net carbon balance — positive means student emits more, negative means trees offset it

### 5.5 Leaderboard
- **Route:** `/leaderboard`
- **Page:** `LeaderboardPage.jsx`
- Campus-wide ranking by eco points
- Department-level rankings
- Weekly and monthly filters
- Shows badges and streaks alongside each rank entry

### 5.6 Events
- **Route:** `/events`
- **Page:** `EventsPage.jsx`
- Browse events by category — Technical, Workshop, Seminar, Competition, Volunteering, Sustainability
- View event details, register as Solo/Duo/Trio/Squad
- For team events — name the team, search classmates, send/accept/decline invites
- Only team leader can post in event chat room
- QR pass auto-generated after registration
- Full-width responsive layout for roster tables, search, and chat

### 5.7 Cafeteria
- **Route:** `/cafeteria`
- **Page:** `CafeteriaPage.jsx`
- Menu items show price alongside carbon footprint (e.g., Idli: ₹30, 0.3 kg CO₂)
- Cart with total price and total carbon impact
- On checkout, a QR receipt is generated
- Real-time order status tracking (Placed → Preparing → Ready → Completed)
- Cart state managed via `useCartStore` (Zustand)

### 5.8 Attendance
- **Route:** `/attendance`
- **Page:** `AttendancePage.jsx`
- View timetable and active QR sessions
- Scan QR code to mark attendance
- View attendance percentage and history

### 5.9 Study Planner
- **Route:** `/study-planner`
- **Page:** `StudyPlannerPage.jsx`
- Add study topics as tasks
- Pomodoro focus timers — 15, 25, or 50 minutes
- Screen stays awake during active sessions (Wake Lock API in `StudentLayout.jsx`)
- Timer works globally — navigating to other pages doesn't break it
- Sends browser notification and toast on timer completion
- Local carbon mentorship tips based on logged habits

### 5.10 Resource Hub
- **Route:** `/resources`
- **Page:** `ResourceHubPage.jsx`
- Browse study materials uploaded by faculty
- Filter by type — PDFs, Documents, Videos, Links
- Keyword search across all resources

### 5.11 Campus Navigation
- **Route:** `/navigation`
- **Page:** `NavigationPage.jsx`
- Interactive Leaflet.js map with markers for buildings, classrooms, labs, library, canteen, offices
- Search bar to find locations quickly
- Location data comes from `campus_locations` table

### 5.12 Lost & Found
- **Route:** `/lost-found`
- **Page:** `LostFoundPage.jsx`
- Report lost items or list found items with details
- Browse listings and claim items securely
- All posts moderated by admin

### 5.13 Announcements
- **Route:** `/announcements`
- **Page:** `AnnouncementsPage.jsx`
- View campus-wide announcements from faculty and admin
- Priority banners — Urgent (pulsing red), Warning (yellow), Info (orange)

### 5.14 Complaints
- **Route:** `/complaints`
- **Page:** `ComplaintsPage.jsx`
- File complaints with category and priority tags (Low, Medium, High, Urgent)
- Track complaint status and view admin/faculty responses

### 5.15 Notifications
- **Route:** `/notifications`
- **Page:** `NotificationsPage.jsx`
- Real-time push via Supabase WebSocket on `student_notifications` table
- Unread badge count shown on sidebar and header bell icon
- Mark individual or all notifications as read
- Trophy alerts when faculty awards XP points

### 5.16 Profile
- **Route:** `/profile`
- **Page:** `ProfilePage.jsx`
- Edit profile details — name, department, semester, section, batch
- View and update account settings

### 5.17 Help & Support
- **Route:** `/help`
- **Page:** `HelpPage.jsx` (shared)
- FAQ section and support information
- Content managed by admin via Help Editor

---

## 6. Faculty Portal

All faculty pages use `FacultyLayout.jsx` for sidebar, top bar, notification bell, and mobile bottom nav. Every route is protected by `FacultyRoute`.

### 6.1 Dashboard
- **Route:** `/faculty/dashboard`
- **Page:** `FacultyDashboard.jsx`
- Overview cards — active events, student participation, attendance stats, open complaints
- Quick action links to `/faculty/events`, `/faculty/attendance`, `/faculty/analytics`

### 6.2 Manage Events
- **Route:** `/faculty/events`
- **Page:** `FacultyEventsPage.jsx`
- Create, edit, and delete events
- Set team size, category, date, venue, eco reward points
- View registration counts and manage event lifecycle

### 6.3 Attendance
- **Route:** `/faculty/attendance`
- **Page:** `FacultyAttendancePage.jsx` (eagerly loaded — not lazy)
- Generate batch-specific QR codes tied to timetable (semester, section, lab batch)
- QR expires in 10 minutes — one scan per student device
- Live scan feed with approve/reject controls
- Extend QR timer by 5 or 10 minutes
- Cancel class with reason codes, assign substitute teacher, change classroom
- All changes instantly notify affected students via push notification

### 6.4 Student Info
- **Route:** `/faculty/participants`
- **Page:** `FacultyParticipantsPage.jsx`
- Browse registered students grouped by event and team
- Export participant rosters as Excel spreadsheets
- Generate PDF manifests with verification QR codes

### 6.5 Analytics
- **Route:** `/faculty/analytics`
- **Page:** `FacultyAnalyticsPage.jsx`
- Department-level analytics with charts and metrics
- Event participation trends and student engagement data

### 6.6 Sustainability
- **Route:** `/faculty/sustainability`
- **Page:** `FacultySustainabilityPage.jsx`
- Sustainability reports across student groups
- Emission data breakdowns and eco score distributions

### 6.7 Resource Hub
- **Route:** `/faculty/resources`
- **Page:** `FacultyResourceHubPage.jsx`
- Upload study materials — PDFs, documents, videos, links
- Organize by subject name and category
- Students access these from their `/resources` page

### 6.8 Cafeteria
- **Route:** `/faculty/cafeteria`
- **Page:** `FacultyCafeteriaPage.jsx`
- Monitor cafeteria activity and menu

### 6.9 Complaints
- **Route:** `/faculty/complaints`
- **Page:** `FacultyComplaintsPage.jsx`
- Review student complaints
- Respond and update status

### 6.10 Announcements
- **Route:** `/faculty/announcements`
- **Page:** `FacultyAnnouncementsPage.jsx`
- Create and manage campus announcements
- Set priority levels — Urgent, Warning, Info
- Announcements appear on students' `/announcements` page and dashboard banners

### 6.11 Notifications
- **Route:** `/faculty/notifications`
- **Page:** `FacultyNotificationsPage.jsx`
- Real-time via Supabase WebSocket on `notifications` table
- Supports both targeted (user_id) and broadcast (null user_id) notifications
- Mark read/unread with badge counter

### 6.12 Profile
- **Route:** `/faculty/profile`
- **Page:** `FacultyProfilePage.jsx`
- Faculty profile settings

### 6.13 Help Center
- **Route:** `/faculty/help`
- **Page:** `HelpPage.jsx` (shared — same component as student help)
- Faculty help and FAQ

---

## 7. Canteen Owner Portal

Uses `OwnerLayout.jsx` for sidebar, top bar, and mobile bottom nav. Routes protected by `OwnerRoute`.

### 7.1 Dashboard
- **Route:** `/owner/dashboard`
- **Page:** `OwnerDashboard.jsx`
- Order overview, revenue analytics, active order queue
- Quick actions linking to `/owner/cafeteria`

### 7.2 Cafeteria Hub
- **Route:** `/owner/cafeteria`
- **Page:** `OwnerCafeteriaPage.jsx`
- Add, edit, and delete menu items with prices and carbon weights (kg CO₂)
- QR scanner — scan student receipts to verify and complete orders
- Real-time order status pipeline (Placed → Preparing → Ready → Completed)
- Order data stored in `orders` table, menu in `menu_items` table

### 7.3 Profile
- **Route:** `/owner/profile`
- **Page:** `OwnerProfilePage.jsx`
- Owner profile settings

---

## 8. Admin Portal

Uses `AdminLayout.jsx` for sidebar (with restricted access for certain owner emails), top bar, and "System Live" indicator. All routes behind `/12345678/admin/` and protected by `AdminRoute`. Redirect: `/12345678/admin` → `/12345678/admin/dashboard`.

### 8.1 Dashboard
- **Route:** `/12345678/admin/dashboard`
- **Page:** `AdminDashboard.jsx`
- Platform-wide overview — total users, active events, emissions summary, system health

### 8.2 User Management
- **Route:** `/12345678/admin/users`
- **Page:** `AdminUsersPage.jsx`
- View, search, filter all user accounts
- Change roles, departments, activation status
- Bulk operations and user detail views

### 8.3 Sustainability
- **Route:** `/12345678/admin/sustainability`
- **Page:** `AdminSustainabilityPage.jsx`
- Campus-wide sustainability analytics
- Aggregate emission data, department comparisons, trend charts

### 8.4 Green Cover
- **Route:** `/12345678/admin/green-cover`
- **Page:** `AdminGreenCoverPage.jsx`
- Enter campus tree inventory — species, count, size category
- System calculates daily CO₂ absorption:
  - Large trees (Neem/Mango): 0.060 kg/day
  - Medium trees (Ashoka/Gulmohar): 0.040 kg/day
  - Small trees/Palms: 0.025 kg/day
  - Grass lawns: 0.002 kg/day per sq meter
- Compares absorption against total student emissions
- Shows "Carbon Neutral" badge when campus is net-zero

### 8.5 Carbon Settings
- **Route:** `/12345678/admin/settings`
- **Page:** `AdminSettingsPage.jsx`
- Configure emission factors, daily carbon limits, scoring thresholds
- Settings saved to `institution_settings.carbon_config`
- Changes affect all student carbon calculations app-wide

### 8.6 Event Management
- **Route:** `/12345678/admin/events`
- **Page:** `AdminEventsPage.jsx`
- Full event oversight — create, edit, delete, view all registrations

### 8.7 Resource Hub
- **Route:** `/12345678/admin/resources`
- **Page:** `AdminResourceHubPage.jsx`
- Manage and moderate all uploaded study resources

### 8.8 Cafeteria
- **Route:** `/12345678/admin/cafeteria`
- **Page:** `AdminCafeteriaPage.jsx`
- Full cafeteria management and oversight

### 8.9 Attendance
- **Route:** `/12345678/admin/attendance`
- **Page:** `AdminAttendancePage.jsx`
- System-wide attendance monitoring and reports

### 8.10 Complaints
- **Route:** `/12345678/admin/complaints`
- **Page:** `AdminComplaintsPage.jsx`
- Manage all complaints, respond, and update statuses

### 8.11 Lost & Found
- **Route:** `/12345678/admin/lost-found`
- **Page:** `AdminLostFoundPage.jsx`
- Moderate lost & found listings

### 8.12 Broadcast Center
- **Route:** `/12345678/admin/broadcast`
- **Page:** `AdminBroadcastPage.jsx`
- Send urgent campus-wide broadcasts
- Priority banners flash on student dashboards as pulsing alerts

### 8.13 Notifications
- **Route:** `/12345678/admin/notifications`
- **Page:** `AdminNotificationsPage.jsx`
- Full notification management center

### 8.14 Audit Logs
- **Route:** `/12345678/admin/audit`
- **Page:** `AdminAuditPage.jsx`
- System activity tracking and audit trail

### 8.15 Campus Locations
- **Route:** `/12345678/admin/navigation`
- **Page:** `AdminNavigationPage.jsx`
- Add, edit, and delete campus map locations
- Data feeds into student `/navigation` page (Leaflet.js map)

### 8.16 System Settings
- **Route:** `/12345678/admin/profile`
- **Page:** `AdminProfilePage.jsx`
- Admin profile and system-level configuration

### 8.17 Landing Page Editor
- **Route:** `/12345678/admin/landing-editor`
- **Page:** `AdminLandingPage.jsx`
- Edit the public landing page (`/`) — text, FAQs, banners — without code changes

### 8.18 Help Editor
- **Route:** `/12345678/admin/help`
- **Page:** `AdminHelpPage.jsx`
- Manage help content and FAQs shown on student and faculty help pages

---

## 9. 404 Page

- **Route:** `*` (catch-all)
- **Page:** `NotFoundPage.jsx` (shared)
- Themed 404 page matching the app design
- Shown for any unrecognized route

---

## 10. XP, Streaks & Badges

- Students earn XP for daily logging (+10), perfect eco score (+60), high score ≥90 (+40), good score ≥70 (+20), green commute (+15), vegan meals (+15), veg meals (+10)
- Maintaining streaks gives bonus XP — 3 days (+30), 7 days (+75), 30 days (+200)
- 16 unlockable badges (Eco Warrior, Pedal Power, etc.) — earned automatically when targets are met
- Faculty can directly award XP to students, which sends a trophy notification via real-time channel
- All points stored in `profiles.eco_points` and badges in `eco_badges` table

---

## 11. Design System

- **Dark theme** — Slate-950 (`#020617`) base with glassmorphic blur cards (`backdrop-blur-3xl`, `bg-slate-950/40`)
- **Role-colored accents:**
  - Student → Green (`#16a34a`, `#22c55e`)
  - Faculty → Blue (`#3b82f6`, `#6366f1`)
  - Owner → Orange (`#f59e0b`, `#f97316`)
  - Admin → Red (`#ef4444`)
- **Typography** — Inter font, `font-black` weight, `uppercase tracking-widest` for nav labels
- **Animations** — Framer Motion `AnimatePresence` for sidebar, page transitions, card entrances
- **Background** — Dual radial blur gradients per role behind all pages
- **Responsive** — Desktop: fixed sidebar (w-72). Mobile: full-screen drawer + bottom tab bar (`lg:hidden`)
- **Selection** — `selection:bg-green-500/30 selection:text-white`

---

## 12. Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, Zustand 5 (state), React Router 7, Framer Motion 12, Recharts 2.15, Lucide React 0.511
- **Backend:** Supabase 2.49 — PostgreSQL, email auth, Realtime WebSockets, Row Level Security
- **Mobile:** Capacitor 8.4 (Android APK), `@capacitor/filesystem`, `@capacitor/share`
- **AI:** Google Generative AI (Gemini) 0.24
- **Exports:** SheetJS (xlsx), jsPDF + jspdf-autotable, pptxgenjs
- **QR:** qrcode + qrcode.react (generate), html5-qrcode (scan)
- **Utilities:** date-fns, react-hot-toast

---

## 13. Database Tables (Supabase)

- `profiles` — User data (name, email, role, department, semester, section, batch, eco_points)
- `carbon_logs` — Daily emission entries per student (student_id, log_date, emissions by category, eco_score)
- `institution_settings` — System-wide settings including `carbon_config` (emission factors, limits)
- `student_notifications` — Student notification queue (student_id, sender_id, message, is_read)
- `notifications` — Faculty/admin notifications (user_id nullable for broadcasts, sender_id)
- `menu_items` — Cafeteria menu with prices and carbon_kg
- `orders` — Cafeteria orders with QR receipt codes and status
- `attendance_sessions` — Faculty-created QR sessions (batch, section, expiry time)
- `attendance_records` — Individual attendance marks per student
- `complaints` — Student complaints with priority and status tracking
- `lost_found_items` — Lost & found item registry
- `campus_locations` — Map marker data for Leaflet.js
- `events` — Event listings with team settings and eco rewards
- `event_registrations` — Student/team event registrations
- `eco_badges` — Achievement badges
- All tables have Row Level Security (RLS) enabled

---

## 14. Real-Time System

- Uses Supabase Realtime (WebSocket channels via `postgres_changes` events)
- Student notifications: channel `student_notifs_{userId}_{uniqueId}` on `student_notifications` table
- Faculty notifications: channel `faculty_notifs_{userId}_{uniqueId}` on `notifications` table
- Channels are cached across page transitions — prevents double-fetching
- New notifications deduplicated (checks existing IDs before adding)
- On logout: channels removed from Supabase + Zustand stores reset (notifications, unreadCount, channel, hasFetched)

---

## 15. Export & Download Tools

- **Excel** — Student registries, event rosters, attendance reports (via SheetJS/xlsx)
- **PDF** — Printable manifests with verification QR codes (via jsPDF + autotable)
- **PowerPoint** — Presentation generation (via pptxgenjs)

---

## 16. Mobile (Android)

- Build pipeline: `Vite Build → Capacitor Sync → Gradle JDK 21 → InstitutePLUSE.apk`
- Wake Lock API keeps screen on during Pomodoro sessions (managed globally in `StudentLayout.jsx`)
- Native file downloads via `@capacitor/filesystem`
- Share feature via `@capacitor/share`
- Bottom tab bar navigation on mobile breakpoints

---
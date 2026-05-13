# InstitutePulse — Product Requirements Document (PRD)

> **Version:** 2.0  
> **Last Updated:** May 12, 2026  
> **Platform:** Web (Vite + React) | Mobile (Capacitor/Android)  
> **Backend:** Supabase (Auth, Database, Realtime, Edge Functions)

---

## 1. Overview

**InstitutePulse** is a Smart Campus Sustainability & Assistant System — a modern SaaS-grade platform that combines environmental consciousness, campus operations, and AI-powered productivity into one unified ecosystem. It serves as a smart campus operating system.

---

## 2. Role-Based Architecture

### Login Redirection Flow

```text
User Opens App
   ↓
Authentication (Supabase Auth)
   ↓
Session Validation
   ↓
Fetch User Role from profiles table
   ↓
Redirect Based on Role
   ├── Student  → /dashboard
   ├── Faculty  → /faculty/dashboard
   ├── Driver   → /driver/dashboard
   └── Admin    → /12345678/admin/dashboard
```

### Role Definitions

| Role | Access Level | Dashboard | Description |
|------|-------------|-----------|-------------|
| `student` | Standard | `/dashboard` | Campus sustainability tracking, events, services |
| `faculty` | Elevated | `/faculty/dashboard` | Event management, analytics, student oversight |
| `driver` | Specialized | `/driver/dashboard` | GPS sharing, route management, trip tracking |
| `admin` | Root | `/12345678/admin/dashboard` | Full platform control (obfuscated path) |

---

## 3. Dashboard Layout Architecture

Every role-based dashboard includes:

### A. Top Navigation Bar
- Logo / InstitutePulse branding
- Global search
- Notification center
- User profile dropdown
- Theme toggle
- Logout

### B. Professional Sidebar Navigation
- Collapsible sidebar (permanent on desktop, drawer on mobile)
- Active route highlight with animated hover states
- Icon-based navigation with nested menu support
- Role-based visibility
- Smooth transitions

---

## 4. Student Dashboard (`/dashboard`)

### Sidebar Navigation
| Icon | Route | Label |
|------|-------|-------|
| 🏠 | `/dashboard` | Dashboard |
| 🌱 | `/carbon/log` | Carbon Tracker |
| 📊 | `/carbon/history` | Carbon Analytics |
| 🏆 | `/leaderboard` | Leaderboard |
| 📅 | `/events` | Events |
| 🚌 | `/bus-tracking` | Bus Tracking |
| 🍽 | `/cafeteria` | Cafeteria |
| 🎓 | `/attendance` | Attendance |
| 🤖 | `/chatbot` | AI Assistant |
| 📖 | `/study-planner` | Study Planner |
| 🧪 | `/lab-assistant` | Lab Assistant |
| 📍 | `/navigation` | Campus Navigation |
| 🔍 | `/lost-found` | Lost & Found |
| 🧾 | `/complaints` | Complaints |
| 🔔 | `/notifications` | Notifications |
| 👤 | `/profile` | Profile Settings |

### Dashboard Widgets
- Daily Eco Score Ring
- Eco Points Counter
- Weekly Streak Tracker
- Sustainability Rank
- Upcoming Events
- Bus ETA
- Attendance %
- Recent Notifications

---

## 5. Events System (`/events`)

### Student Event Flow
```text
Browse Events → Filter by Category → View Details → Register → QR Pass Generated → Attend → Eco Points Awarded
```

### Event Categories
- Sustainability, Technical, Workshop, Seminar, Competition, Volunteering

### Event Card Data
- Banner image/color, Title, Date & time, Venue, Participant count, Eco reward points, Registration CTA

### Registered Events Section
- View registered events, Cancel registration, Download QR pass, View participation history

---

## 6. Leaderboard System (`/leaderboard`)

### Navigation Tabs
- 🏆 Campus Ranking
- 🏫 Department Ranking
- 🎯 Challenge Ranking
- 📈 Monthly Leaders
- 🏅 My Achievements

### Features
- Realtime recalculation on eco-activity
- Weekly/monthly filters
- Badge & streak display
- XP progression system

---

## 7. Faculty Dashboard (`/faculty/dashboard`)

### Sidebar Navigation
| Icon | Route | Label |
|------|-------|-------|
| 🏠 | `/faculty/dashboard` | Dashboard |
| 📅 | `/faculty/events` | Manage Events |
| 👥 | `/faculty/participants` | Event Participants |
| 📊 | `/faculty/analytics` | Analytics |
| 🌱 | `/faculty/sustainability` | Sustainability Reports |
| 🎯 | `/faculty/challenges` | Green Challenges |
| 🚌 | `/faculty/transport` | Transport Monitoring |
| 🍽 | `/faculty/cafeteria` | Cafeteria Monitoring |
| 🎓 | `/faculty/attendance` | Attendance Management |
| 🧾 | `/faculty/complaints` | Complaints Review |
| 📢 | `/faculty/announcements` | Announcements |
| 🔔 | `/faculty/notifications` | Notifications |
| 👤 | `/faculty/profile` | Profile Settings |

### Overview Cards
- Active events, Student participation, Avg eco score
- Attendance statistics, Open complaints, Sustainability metrics

### Event Management Flow
```text
Faculty creates event → Students notified → Registrations open → QR attendance → Reports generated
```

---

## 8. Driver Dashboard (`/driver/dashboard`)

### Sidebar Navigation
| Icon | Route | Label |
|------|-------|-------|
| 🏠 | `/driver/dashboard` | Dashboard |
| 📍 | `/driver/gps` | Live GPS |
| 🚌 | `/driver/route` | Assigned Route |
| 🚨 | `/driver/emergency` | Emergency Alerts |
| 📊 | `/driver/stats` | Trip Statistics |
| 🔔 | `/driver/notifications` | Notifications |
| 👤 | `/driver/profile` | Profile |

### Workflow
```text
Driver Login → Start GPS Sharing → Realtime Location Updates → Students Track Bus → Admin Monitors Routes
```

---

## 9. Admin Dashboard (`/12345678/admin/dashboard`)

> **Security:** Admin portal uses obfuscated path `/12345678/admin/...`

### Sidebar Navigation
| Icon | Route | Label |
|------|-------|-------|
| 🏠 | `/12345678/admin/dashboard` | Dashboard |
| 👥 | `/12345678/admin/users` | User Management |
| 📊 | `/12345678/admin/sustainability` | Sustainability Analytics |
| 📅 | `/12345678/admin/events` | Event Management |
| 🎯 | `/12345678/admin/challenges` | Challenge Management |
| 🚌 | `/12345678/admin/buses` | Bus Management |
| 🍽 | `/12345678/admin/cafeteria` | Cafeteria Management |
| 🎓 | `/12345678/admin/attendance` | Attendance System |
| 🧾 | `/12345678/admin/complaints` | Complaints Management |
| 🔍 | `/12345678/admin/lost-found` | Lost & Found Verification |
| 📢 | `/12345678/admin/broadcast` | Broadcast Center |
| 🔔 | `/12345678/admin/notifications` | Notification Center |
| ⚙ | `/12345678/admin/settings` | System Settings |
| 📈 | `/12345678/admin/audit` | Audit Logs |
| 📍 | `/12345678/admin/navigation` | Campus Locations |
| 👤 | `/12345678/admin/profile` | Admin Profile |

### Admin Login
- **Path:** `/12345678/admin/login`
- **Requires:** Email + Password + 2FA Access Key (`VITE_ADMIN_SECRET_KEY`)
- **Lockout:** 3 failed attempts → 60-second lockout

---

## 10. Design System — "Pulse"

### Theme
- **Base:** Slate-950 dark mode with glassmorphic cards
- **Student Accent:** Green (#16a34a, #22c55e)
- **Faculty Accent:** Blue (#3b82f6, #6366f1)
- **Driver Accent:** Yellow/Orange (#f59e0b, #f97316)
- **Admin Accent:** Green with Red for security elements

### UI Principles
- Glassmorphic cards (`glass-card` CSS class)
- 40px border radius for hero cards
- Font: Inter, font-black for labels
- All-caps tracking-widest for status labels
- Framer Motion animations throughout
- Mobile-first with responsive sidebar → bottom tabs

---

## 11. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 6 |
| Styling | Tailwind CSS 4 + Custom CSS |
| State | Zustand |
| Routing | React Router 7 |
| Animation | Framer Motion |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL, Auth, Realtime) |
| AI | Google Gemini API |
| Mobile | Capacitor (Android) |
| Icons | Lucide React |

---

## 12. Database Schema (Supabase)

### Core Tables
- `profiles` — User identity (id, full_name, email, role, department, eco_points, etc.)
- `carbon_logs` — Daily carbon tracking entries
- `eco_badges` — Achievement badges earned
- `green_challenges` — Sustainability challenges
- `challenge_participants` — Challenge participation tracking
- `buses` — Bus fleet information
- `bus_locations` — Realtime GPS coordinates
- `menu_items` — Cafeteria menu
- `orders` — Cafeteria orders
- `attendance_sessions` — QR-based attendance sessions
- `attendance_records` — Individual attendance marks
- `complaints` — Student complaint system
- `lost_found_items` — Lost & found registry
- `campus_locations` — Campus map locations
- `notifications` — Push notification system

### Row Level Security
All tables have RLS enabled with appropriate policies.

---

## 13. Realtime Features

Realtime subscriptions exist across all dashboards:
- Live bus GPS tracking
- Event registrations
- Notification push
- Leaderboard updates
- Cafeteria order status
- Attendance sessions
- Sustainability report generation

---

## 14. Security

- Email + Password authentication (Supabase Auth)
- Email confirmation required for new accounts
- Role-based route guards (`ProtectedRoute`, `AdminRoute`, `FacultyRoute`, `DriverRoute`)
- Admin portal hidden behind obfuscated path
- 2FA access key for admin login
- Brute-force lockout (3 attempts → 60s)
- RLS on all database tables

---

## 15. Application Experience

InstitutePulse should feel like:
- A modern SaaS ecosystem
- A smart campus operating system
- A sustainability intelligence platform
- A premium mobile-first productivity application

Every role receives:
- A dedicated dashboard
- Professional sidebar navigation
- Realtime modules
- Centralized access to all platform features

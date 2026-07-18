# 🌿 InstitutePLUSE

> **Smart Campus Sustainability & Assistant System**

A premium SaaS-grade platform that combines environmental consciousness, campus operations, and AI-powered productivity into one unified ecosystem. Built with React 19 + Vite + Supabase.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd InstitutePLUSE

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

---

## 🏗 Architecture

### Role-Based Dashboard System

InstitutePLUSE follows a **role-based dashboard architecture** where every authenticated user is redirected to a dedicated control panel:

| Role | Dashboard Route | Accent Color | Description |
|------|----------------|-------------|-------------|
| **Student** | `/dashboard` | 🟢 Green | Carbon tracking, events, campus services |
| **Faculty** | `/faculty/dashboard` | 🔵 Blue | Event management, analytics, oversight |
| **Driver** | `/driver/dashboard` | 🟡 Yellow | GPS sharing, route management |
| **Admin** | `/12345678/admin/dashboard` | 🔴 Red/Green | Full platform control (obfuscated) |

### Tech Stack

- **Frontend:** React 19 + Vite 6
- **Styling:** Tailwind CSS 4 + Custom Glassmorphic Design System ("Pulse")
- **State:** Zustand
- **Routing:** React Router 7
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, RLS)
- **AI:** Google Gemini API
- **Mobile:** Capacitor (Android APK)
- **Icons:** Lucide React

---

## 📁 Project Structure

```
src/
├── components/
│   ├── BottomTabBar.jsx        # Mobile bottom navigation
│   ├── EcoScoreRing.jsx        # Circular eco-score widget
│   ├── RouteGuards.jsx         # Role-based route protection
│   └── StudentLayout.jsx       # Student sidebar + header
├── lib/
│   ├── supabase.js             # Supabase client
│   └── carbonCalc.js           # Carbon calculation engine
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx       # Student/Faculty/Driver login
│   │   ├── RegisterPage.jsx    # New account registration
│   │   └── AdminLoginPage.jsx  # Admin 2FA login (obfuscated)
│   ├── student/
│   │   ├── DashboardPage.jsx   # Student home dashboard
│   │   ├── EventsPage.jsx      # Event discovery & registration
│   │   ├── CarbonLogPage.jsx   # Daily carbon activity logging
│   │   ├── CarbonHistoryPage.jsx # Carbon analytics
│   │   ├── LeaderboardPage.jsx # Campus eco leaderboard
│   │   ├── CafeteriaPage.jsx   # Eco-cafeteria ordering
│   │   ├── BusTrackingPage.jsx # Live bus tracking
│   │   ├── AttendancePage.jsx  # QR attendance scanning
│   │   ├── ComplaintsPage.jsx  # Complaint submission
│   │   ├── LostFoundPage.jsx   # Lost & found registry
│   │   ├── StudyPlannerPage.jsx # AI study planner
│   │   ├── LabAssistantPage.jsx # AI lab assistant
│   │   ├── NavigationPage.jsx  # Campus map
│   │   ├── ChatbotPage.jsx     # AI chatbot
│   │   ├── ProfilePage.jsx     # Profile settings
│   │   └── NotificationsPage.jsx # Notification center
│   ├── faculty/
│   │   ├── FacultyLayout.jsx   # Faculty sidebar + header
│   │   ├── FacultyDashboard.jsx # Faculty home dashboard
│   │   └── FacultyStubPage.jsx # Placeholder for unbuilt modules
│   ├── driver/
│   │   ├── DriverLayout.jsx    # Driver sidebar + header
│   │   ├── DriverDashboard.jsx # Driver home dashboard
│   │   ├── DriverGPSPage.jsx   # Live GPS sharing
│   │   └── DriverStubPage.jsx  # Placeholder for unbuilt modules
│   ├── admin/
│   │   ├── AdminLayout.jsx     # Admin sidebar + header
│   │   ├── AdminDashboard.jsx  # Admin control center
│   │   ├── AdminUsersPage.jsx  # User management
│   │   ├── AdminSustainabilityPage.jsx # Sustainability analytics
│   │   └── AdminComplaintsPage.jsx # Complaint management
│   └── LandingPage.jsx        # Public landing page
├── store/
│   └── index.js               # Zustand stores (auth, carbon, cart, notifications)
├── App.jsx                    # Root router with all role-based routes
├── main.jsx                   # React entry point
└── index.css                  # Global styles + design tokens
```

---

## 🔐 Admin Access

The admin portal is hidden behind an obfuscated path for security:

| Step | Details |
|------|---------|
| **URL** | `domain/12345678/admin/login` |
| **Email** | Admin account email |
| **Password** | Admin account password |
| **2FA Key** | Set in `VITE_ADMIN_SECRET_KEY` |

### Security Features
- 3-attempt lockout (60-second cooldown)
- Role verification against database
- Separate authentication flow

---

## 🌍 Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini AI
VITE_GEMINI_API_KEY=your-gemini-api-key

# Admin Secret (min 16 chars)
VITE_ADMIN_SECRET_KEY=YourSecretAdmin@2026
```

---

## 📱 Mobile Build (Android)

```bash
# Build web assets
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android

# Generate APK
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

---

## 🎨 Design System — "Pulse"

- **Theme:** Dark glassmorphic (slate-950 base)
- **Cards:** `glass-card` class with backdrop-blur and subtle borders
- **Typography:** Inter font, font-black weight for labels
- **Animations:** Framer Motion throughout
- **Responsive:** Mobile-first with sidebar → bottom tabs transition
- **Role Colors:**
  - Student → Green (#16a34a)
  - Faculty → Blue (#3b82f6)
  - Driver → Yellow (#f59e0b)
  - Admin → Green/Red (#16a34a / #ef4444)

---

## 📊 Database Tables

| Table | RLS | Description |
|-------|-----|-------------|
| `profiles` | ✅ | User identity & eco stats |
| `carbon_logs` | ✅ | Daily carbon tracking |
| `eco_badges` | ✅ | Achievement badges |
| `green_challenges` | ✅ | Sustainability challenges |
| `challenge_participants` | ✅ | Challenge progress |
| `buses` | ✅ | Bus fleet data |
| `bus_locations` | ✅ | Realtime GPS |
| `menu_items` | ✅ | Cafeteria menu |
| `orders` | ✅ | Cafeteria orders |
| `attendance_sessions` | ✅ | QR attendance |
| `attendance_records` | ✅ | Attendance marks |
| `complaints` | ✅ | Student complaints |
| `lost_found_items` | ✅ | Lost & found |
| `campus_locations` | ✅ | Campus map POIs |
| `notifications` | ✅ | Push notifications |

---

## 📄 License

Private — All rights reserved.

---

**Built with 💚 for a sustainable campus future.**

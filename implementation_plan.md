# InstitutePulse — Master Implementation Plan

> **28+ issues organized into 5 priority phases**
> Work will proceed phase by phase. Each phase builds on the previous.

---

## Phase 1: Critical Bug Fixes (Broken Features)
*These features exist but are completely non-functional*

| # | Issue | Files | Root Cause | Fix |
|---|-------|-------|-----------|-----|
| 7 | Lost & Found — can't report items | `student/LostFoundPage.jsx` | Submit handler or RLS blocking inserts | Fix form submission + RLS policy |
| 8 | Complaint Console — admin can't resolve, buttons broken, no informer info | `admin/AdminComplaintsPage.jsx` | Missing update logic, no profile join | Add resolve action, join profiles for informer name |
| 14 | Faculty Complaint Registry — can't see complaints | `faculty/FacultyComplaintsPage.jsx` | Query filter or RLS issue | Fix query to fetch complaints properly |
| 15 | Public Announcements — sync failed, dropdown theme | `faculty/FacultyAnnouncementsPage.jsx` | API error, unstyled `<select>` | Fix announcement creation + theme dropdown |
| 16 | Faculty Notifications — not working | `faculty/FacultyNotificationsPage.jsx` | Incorrect query or missing data | Fix notification fetching |
| 17 | Faculty Profile — no buttons work | `faculty/FacultyProfilePage.jsx` | Handlers missing or broken | Wire up all button handlers |
| 3 | AI Assistant — not replying properly | `student/ChatbotPage.jsx`, `lib/gemini.js` | API key, prompt, or response parsing issue | Fix Gemini integration |
| 13 | Active Challenges — not working | `admin/AdminChallengesPage.jsx`, `student/` | No data or broken CRUD | Fix challenge creation + display |
| 22 | Admin Broadcast Center — not working, dropdown theme | `admin/AdminBroadcastPage.jsx` | Broken submit + unstyled selects | Fix broadcast logic + theme |

## Phase 2: Core Feature Fixes
*Features that partially work but need significant fixes*

| # | Issue | Files | Fix |
|---|-------|-------|-----|
| 1 | Faculty QR — allow new session while one is running | `faculty/FacultyAttendancePage.jsx` | Add "End & Start New" button on QR screen |
| 2 | Admin Attendance — CRUD for div/sem/classroom/subject + present list + download | `admin/AdminAttendancePage.jsx` | Add management tabs + CSV download |
| 8b | Notifications — remove bus, fix all | `student/NotificationsPage.jsx`, store | Remove bus type, ensure all types work |
| 11 | Student Registry — organize by sem → div | `admin/AdminUsersPage.jsx` | Add semester/division grouping filters |
| 25 | Admin Campus Locations — not workable | `admin/AdminNavigationPage.jsx` | Connect to Supabase CRUD |

## Phase 3: Feature Improvements
*New features or major enhancements needed*

| # | Issue | Files | Fix |
|---|-------|-------|-----|
| 6 | Campus Nav — admin managed, floor-based, no km | `student/NavigationPage.jsx`, `admin/AdminNavigationPage.jsx` | Redesign to floor/block navigation |
| 4 | Study Planner — can't create/sync objectives | `student/StudyPlannerPage.jsx` | Fix objective creation + matrix sync |
| 5 | Lab Assistant — needs guidance, "Initialize" does nothing useful | `student/LabAssistantPage.jsx` | Add tutorial + meaningful session flow |
| 9 | Events — download Identity Manifest | `admin/AdminEventsPage.jsx` | Add per-event participant export |
| 10 | Attendance improvements | `faculty/FacultyAttendancePage.jsx` | Additional features TBD |
| 26 | Admin Eco Points Manager | New file | Create new page for point management |

## Phase 4: Admin Dashboard & Enhancements
*Admin panel features that need completing*

| # | Issue | Files | Fix |
|---|-------|-------|-----|
| 19 | Admin Dashboard — diagnostic export + analytics | `admin/AdminDashboard.jsx` | Add working export + charts |
| 18 | Admin User Management — export + manage/edit points | `admin/AdminUsersPage.jsx` | Add export CSV + point management |
| 19b | Admin Sustainability — generate report | `admin/AdminSustainabilityPage.jsx` | Add report generation |
| 20 | Admin Events — download participants | `admin/AdminEventsPage.jsx` | Add CSV export per event |
| 21 | Admin Attendance — check who attended | `admin/AdminAttendancePage.jsx` | Add attendance records view |
| 23 | Admin Notifications — sections, auto-notify | `admin/AdminNotificationsPage.jsx` | Add categorized notifications |
| 24 | Admin Audit Logs — not working + explain | `admin/AdminAuditPage.jsx` | Fix logging + add usage guide |

## Phase 5: Polish & UX
*Minor issues and cleanup*

| # | Issue | Files | Fix |
|---|-------|-------|-----|
| 27 | Student Profile — badges explanation, back button | `student/ProfilePage.jsx` | Add badge tooltips, fix navigation |
| 28 | Leaderboard — student only, eco points student only | `student/LeaderboardPage.jsx` | Add role filtering |
| 12 | Campus Greenhouse — unclear purpose | Various | Add onboarding tooltip/explanation |
| 26b | System Settings + Admin Profile — add features | `admin/AdminSettingsPage.jsx`, `admin/AdminProfilePage.jsx` | Add useful settings |
| 18b | Owner Dashboard — Cafeteria Hub access | `pages/owner/` | Add cafeteria navigation link |

---

## Recommended Approach

> [!IMPORTANT]
> This is ~28 items across ~50 files. We should work **one phase at a time** to avoid breaking things.

**Suggested workflow:**
1. Start with **Phase 1** (critical bugs) — gets the most broken features working
2. Move to **Phase 2** (core features) — completes the essential functionality
3. Then **Phase 3-5** in order

**Which phase would you like me to start with?** Or would you prefer I tackle specific items from the list first?

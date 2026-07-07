import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore, useFacultyNotifStore, useNotifStore } from './store/index'
import { supabase } from './lib/supabase'

// Eager loaded (critical path)
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AdminLoginPage from './pages/auth/AdminLoginPage'
import { ProtectedRoute, AdminRoute, FacultyRoute, PublicRoute, OwnerRoute } from './components/RouteGuards'
import StudentLayout from './components/StudentLayout'
import AdminLayout from './pages/admin/AdminLayout'

// ─── STUDENT PAGES ──────────────────────────────────────────────
const DashboardPage = lazy(() => import('./pages/student/DashboardPage'))
const AnnouncementsPage = lazy(() => import('./pages/student/AnnouncementsPage'))
const CarbonLogPage = lazy(() => import('./pages/student/CarbonLogPage'))
const CarbonHistoryPage = lazy(() => import('./pages/student/CarbonHistoryPage'))
const CarbonBalancePage = lazy(() => import('./pages/student/CarbonBalancePage'))
const LeaderboardPage = lazy(() => import('./pages/student/LeaderboardPage'))
const EventsPage = lazy(() => import('./pages/student/EventsPage'))
const CafeteriaPage = lazy(() => import('./pages/student/CafeteriaPage'))

const AttendancePage = lazy(() => import('./pages/student/AttendancePage'))
const ComplaintsPage = lazy(() => import('./pages/student/ComplaintsPage'))
const LostFoundPage = lazy(() => import('./pages/student/LostFoundPage'))
const StudyPlannerPage = lazy(() => import('./pages/student/StudyPlannerPage'))
const NavigationPage = lazy(() => import('./pages/student/NavigationPage'))
const ProfilePage = lazy(() => import('./pages/student/ProfilePage'))
const NotificationsPage = lazy(() => import('./pages/student/NotificationsPage'))
const HelpPage = lazy(() => import('./pages/shared/HelpPage'))
const NotFoundPage = lazy(() => import('./pages/shared/NotFoundPage'))
const VerificationPage = lazy(() => import('./pages/shared/VerificationPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const ResourceHubPage = lazy(() => import('./pages/student/ResourceHubPage'))

// ─── FACULTY PAGES ──────────────────────────────────────────────
const FacultyDashboard = lazy(() => import('./pages/faculty/FacultyDashboard'))
const FacultyEventsPage = lazy(() => import('./pages/faculty/FacultyEventsPage'))
const FacultyCafeteriaPage = lazy(() => import('./pages/faculty/FacultyCafeteriaPage'))
import FacultyAttendancePage from './pages/faculty/FacultyAttendancePage'
const FacultyStubPage = lazy(() => import('./pages/faculty/FacultyStubPage'))
const FacultyParticipantsPage = lazy(() => import('./pages/faculty/FacultyParticipantsPage'))
const FacultyAnalyticsPage = lazy(() => import('./pages/faculty/FacultyAnalyticsPage'))
const FacultySustainabilityPage = lazy(() => import('./pages/faculty/FacultySustainabilityPage'))
const FacultyResourceHubPage = lazy(() => import('./pages/faculty/FacultyResourceHubPage'))
const FacultyComplaintsPage = lazy(() => import('./pages/faculty/FacultyComplaintsPage'))
const FacultyAnnouncementsPage = lazy(() => import('./pages/faculty/FacultyAnnouncementsPage'))
const FacultyNotificationsPage = lazy(() => import('./pages/faculty/FacultyNotificationsPage'))
const FacultyProfilePage = lazy(() => import('./pages/faculty/FacultyProfilePage'))



// ─── ADMIN PAGES ────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminSustainabilityPage = lazy(() => import('./pages/admin/AdminSustainabilityPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminComplaintsPage = lazy(() => import('./pages/admin/AdminComplaintsPage'))
const AdminCafeteriaPage = lazy(() => import('./pages/admin/AdminCafeteriaPage'))
const AdminEventsPage = lazy(() => import('./pages/admin/AdminEventsPage'))
const AdminAttendancePage = lazy(() => import('./pages/admin/AdminAttendancePage'))
const AdminResourceHubPage = lazy(() => import('./pages/admin/AdminResourceHubPage'))
const AdminLostFoundPage = lazy(() => import('./pages/admin/AdminLostFoundPage'))
const AdminBroadcastPage = lazy(() => import('./pages/admin/AdminBroadcastPage'))
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminAuditPage = lazy(() => import('./pages/admin/AdminAuditPage'))
const AdminNavigationPage = lazy(() => import('./pages/admin/AdminNavigationPage'))
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage'))
const AdminHelpPage = lazy(() => import('./pages/admin/AdminHelpPage'))
const AdminStubPage = lazy(() => import('./pages/admin/AdminStubPage'))
const AdminGreenCoverPage = lazy(() => import('./pages/admin/AdminGreenCoverPage'))
const AdminLandingPage = lazy(() => import('./pages/admin/AdminLandingPage'))


// ─── LAYOUTS ────────────────────────────────────────────────────
// Eagerly loaded to prevent unmounting during route transitions

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing InstitutePulse</p>
      </div>
    </div>
  )
}

// Student Page Wrapper
function StudentPage({ component: Component, title, showBack = false, hideChrome = false }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProtectedRoute>
        <StudentLayout title={title} showBack={showBack} hideChrome={hideChrome}>
          <Component />
        </StudentLayout>
      </ProtectedRoute>
    </Suspense>
  )
}

// Admin page stubs for unbuilt modules

// ─── OWNER PAGES ────────────────────────────────────────────────
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'))
const OwnerCafeteriaPage = lazy(() => import('./pages/owner/OwnerCafeteriaPage'))
const OwnerProfilePage = lazy(() => import('./pages/owner/OwnerProfilePage'))

function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/reset-password'
      } else if (event === 'SIGNED_IN' && session?.user) {
        useAuthStore.getState().setUser(session.user)
        useAuthStore.getState().fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ user: null, profile: null })

        // Clean up faculty notifications channel and reset state
        const facultyChannel = useFacultyNotifStore.getState().channel
        if (facultyChannel) {
          supabase.removeChannel(facultyChannel)
        }
        useFacultyNotifStore.setState({
          notifications: [],
          unreadCount: 0,
          channel: null,
          hasFetched: false
        })

        // Clean up student notifications channel and reset state
        const studentChannel = useNotifStore.getState().channel
        if (studentChannel) {
          supabase.removeChannel(studentChannel)
        }
        useNotifStore.setState({
          notifications: [],
          unreadCount: 0,
          channel: null,
          hasFetched: false
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '16px',
            background: '#0f172a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: 'white' } },
          error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ══════════ PUBLIC ══════════ */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/verify/:id" element={<VerificationPage />} />
          <Route path="/12345678/admin/login" element={<AdminLoginPage />} />

          {/* ══════════ STUDENT ══════════ */}
          <Route path="/dashboard" element={<StudentPage component={DashboardPage} title="Home" />} />
          <Route path="/announcements" element={<StudentPage component={AnnouncementsPage} title="Announcements" showBack hideChrome />} />
          <Route path="/carbon/log" element={<StudentPage component={CarbonLogPage} title="Carbon Tracker" showBack hideChrome />} />
          <Route path="/carbon/history" element={<StudentPage component={CarbonHistoryPage} title="Carbon Analytics" showBack hideChrome />} />
          <Route path="/carbon/balance" element={<StudentPage component={CarbonBalancePage} title="Carbon Balance" showBack hideChrome />} />
          <Route path="/leaderboard" element={<StudentPage component={LeaderboardPage} title="Leaderboard" showBack hideChrome />} />
          <Route path="/events" element={<StudentPage component={EventsPage} title="Events" showBack hideChrome />} />
          <Route path="/cafeteria" element={<StudentPage component={CafeteriaPage} title="Eco-Cafeteria" showBack hideChrome />} />

          <Route path="/attendance" element={<StudentPage component={AttendancePage} title="Attendance" showBack hideChrome />} />
          <Route path="/complaints" element={<StudentPage component={ComplaintsPage} title="Complaints" showBack hideChrome />} />
          <Route path="/lost-found" element={<StudentPage component={LostFoundPage} title="Lost & Found" showBack hideChrome />} />
          <Route path="/study-planner" element={<StudentPage component={StudyPlannerPage} title="Study Planner" showBack hideChrome />} />
          <Route path="/navigation" element={<StudentPage component={NavigationPage} title="Campus Navigation" showBack hideChrome />} />
          <Route path="/profile" element={<StudentPage component={ProfilePage} title="Profile Settings" showBack hideChrome />} />
          <Route path="/notifications" element={<StudentPage component={NotificationsPage} title="Notifications" showBack hideChrome />} />
          <Route path="/help" element={<StudentPage component={HelpPage} title="Help & Support" showBack hideChrome />} />
          <Route path="/resources" element={<StudentPage component={ResourceHubPage} title="Resource Hub" showBack hideChrome />} />

           {/* ══════════ FACULTY ══════════ */}
           <Route path="/faculty/dashboard" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyDashboard /></Suspense></FacultyRoute>} />
           <Route path="/faculty/events" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyEventsPage /></Suspense></FacultyRoute>} />
           <Route path="/faculty/participants" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyParticipantsPage /></Suspense></FacultyRoute>} />
           <Route path="/faculty/analytics" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyAnalyticsPage /></Suspense></FacultyRoute>} />
           <Route path="/faculty/sustainability" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultySustainabilityPage /></Suspense></FacultyRoute>} />
           <Route path="/faculty/resources" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyResourceHubPage /></Suspense></FacultyRoute>} />
           <Route path="/faculty/cafeteria" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyCafeteriaPage /></Suspense></FacultyRoute>} />
           <Route path="/faculty/attendance" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyAttendancePage /></Suspense></FacultyRoute>} />
           <Route path="/faculty/complaints" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyComplaintsPage /></Suspense></FacultyRoute>} />
           <Route path="/faculty/announcements" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyAnnouncementsPage /></Suspense></FacultyRoute>} />
           <Route path="/faculty/notifications" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyNotificationsPage /></Suspense></FacultyRoute>} />
           <Route path="/faculty/profile" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyProfilePage /></Suspense></FacultyRoute>} />
           <Route path="/faculty/help" element={<FacultyRoute><Suspense fallback={<PageLoader />}><HelpPage /></Suspense></FacultyRoute>} />


          {/* ══════════ OWNER ══════════ */}
          <Route path="/owner/dashboard" element={<OwnerRoute><Suspense fallback={<PageLoader />}><OwnerDashboard /></Suspense></OwnerRoute>} />
          <Route path="/owner/cafeteria" element={<OwnerRoute><Suspense fallback={<PageLoader />}><OwnerCafeteriaPage /></Suspense></OwnerRoute>} />
          <Route path="/owner/profile" element={<OwnerRoute><Suspense fallback={<PageLoader />}><OwnerProfilePage /></Suspense></OwnerRoute>} />


           {/* ══════════ ADMIN (OBFUSCATED) ══════════ */}
           <Route path="/12345678/admin/dashboard" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/sustainability" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminSustainabilityPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/settings" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminSettingsPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/users" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/complaints" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminComplaintsPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/events" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminEventsPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/resources" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminResourceHubPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/cafeteria" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminCafeteriaPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/attendance" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminAttendancePage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/lost-found" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminLostFoundPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/broadcast" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminBroadcastPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/notifications" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminNotificationsPage /></Suspense></AdminRoute>} />

           <Route path="/12345678/admin/audit" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminAuditPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/navigation" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminNavigationPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/green-cover" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminGreenCoverPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/profile" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminProfilePage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/help" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminHelpPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin/landing-editor" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminLandingPage /></Suspense></AdminRoute>} />
           <Route path="/12345678/admin" element={<Navigate to="/12345678/admin/dashboard" replace />} />


          {/* CATCH ALL — Themed 404 */}
          <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

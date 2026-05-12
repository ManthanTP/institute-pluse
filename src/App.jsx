import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/index'
import { supabase } from './lib/supabase'

// Eager loaded (critical path)
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AdminLoginPage from './pages/auth/AdminLoginPage'
import { ProtectedRoute, AdminRoute, FacultyRoute, PublicRoute } from './components/RouteGuards'

// ─── STUDENT PAGES ──────────────────────────────────────────────
const DashboardPage = lazy(() => import('./pages/student/DashboardPage'))
const CarbonLogPage = lazy(() => import('./pages/student/CarbonLogPage'))
const CarbonHistoryPage = lazy(() => import('./pages/student/CarbonHistoryPage'))
const LeaderboardPage = lazy(() => import('./pages/student/LeaderboardPage'))
const EventsPage = lazy(() => import('./pages/student/EventsPage'))
const CafeteriaPage = lazy(() => import('./pages/student/CafeteriaPage'))

const AttendancePage = lazy(() => import('./pages/student/AttendancePage'))
const ComplaintsPage = lazy(() => import('./pages/student/ComplaintsPage'))
const LostFoundPage = lazy(() => import('./pages/student/LostFoundPage'))
const StudyPlannerPage = lazy(() => import('./pages/student/StudyPlannerPage'))
const LabAssistantPage = lazy(() => import('./pages/student/LabAssistantPage'))
const NavigationPage = lazy(() => import('./pages/student/NavigationPage'))
const ChatbotPage = lazy(() => import('./pages/student/ChatbotPage'))
const ProfilePage = lazy(() => import('./pages/student/ProfilePage'))
const NotificationsPage = lazy(() => import('./pages/student/NotificationsPage'))

// ─── FACULTY PAGES ──────────────────────────────────────────────
const FacultyDashboard = lazy(() => import('./pages/faculty/FacultyDashboard'))
const FacultyStubPage = lazy(() => import('./pages/faculty/FacultyStubPage'))



// ─── ADMIN PAGES ────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminSustainabilityPage = lazy(() => import('./pages/admin/AdminSustainabilityPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminComplaintsPage = lazy(() => import('./pages/admin/AdminComplaintsPage'))

// ─── LAYOUTS ────────────────────────────────────────────────────
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const StudentLayout = lazy(() => import('./components/StudentLayout'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Nexus</p>
      </div>
    </div>
  )
}

// Student Page Wrapper
function StudentPage({ component: Component, title, showBack = false }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProtectedRoute>
        <StudentLayout title={title} showBack={showBack}>
          <Component />
        </StudentLayout>
      </ProtectedRoute>
    </Suspense>
  )
}

// Admin page stubs for unbuilt modules
function AdminStubPage({ title }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="glass-card p-12 text-center max-w-lg mx-auto">
            <div className="text-5xl mb-4">🚧</div>
            <h2 className="text-xl font-black text-white mb-3 tracking-tight">{title}</h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">This admin module is ready for integration. Connect your Supabase backend and the data will populate here automatically.</p>
            <div className="mt-8 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Module Standby</span>
            </div>
          </div>
        </div>
      </AdminLayout>
    </Suspense>
  )
}

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        useAuthStore.getState().setUser(session.user)
        useAuthStore.getState().fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ user: null, profile: null })
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
          <Route path="/12345678/admin/login" element={<AdminLoginPage />} />

          {/* ══════════ STUDENT ══════════ */}
          <Route path="/dashboard" element={<StudentPage component={DashboardPage} title="Home" />} />
          <Route path="/carbon/log" element={<StudentPage component={CarbonLogPage} title="Carbon Tracker" showBack />} />
          <Route path="/carbon/history" element={<StudentPage component={CarbonHistoryPage} title="Carbon Analytics" showBack />} />
          <Route path="/leaderboard" element={<StudentPage component={LeaderboardPage} title="Leaderboard" showBack />} />
          <Route path="/events" element={<StudentPage component={EventsPage} title="Events" showBack />} />
          <Route path="/cafeteria" element={<StudentPage component={CafeteriaPage} title="Eco-Cafeteria" showBack />} />

          <Route path="/attendance" element={<StudentPage component={AttendancePage} title="Attendance" showBack />} />
          <Route path="/complaints" element={<StudentPage component={ComplaintsPage} title="Complaints" showBack />} />
          <Route path="/lost-found" element={<StudentPage component={LostFoundPage} title="Lost & Found" showBack />} />
          <Route path="/study-planner" element={<StudentPage component={StudyPlannerPage} title="Study Planner" showBack />} />
          <Route path="/lab-assistant" element={<StudentPage component={LabAssistantPage} title="Lab Assistant" showBack />} />
          <Route path="/navigation" element={<StudentPage component={NavigationPage} title="Campus Navigation" showBack />} />
          <Route path="/chatbot" element={<StudentPage component={ChatbotPage} title="AI Assistant" showBack />} />
          <Route path="/profile" element={<StudentPage component={ProfilePage} title="Profile Settings" showBack />} />
          <Route path="/notifications" element={<StudentPage component={NotificationsPage} title="Notifications" showBack />} />

          {/* ══════════ FACULTY ══════════ */}
          <Route path="/faculty/dashboard" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyDashboard /></Suspense></FacultyRoute>} />
          <Route path="/faculty/events" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyStubPage title="📅 Events" /></Suspense></FacultyRoute>} />
          <Route path="/faculty/participants" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyStubPage title="👥 Participants" /></Suspense></FacultyRoute>} />
          <Route path="/faculty/analytics" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyStubPage title="📊 Analytics" /></Suspense></FacultyRoute>} />
          <Route path="/faculty/sustainability" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyStubPage title="🌱 Sustainability" /></Suspense></FacultyRoute>} />
          <Route path="/faculty/challenges" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyStubPage title="🎯 Challenges" /></Suspense></FacultyRoute>} />
          <Route path="/faculty/cafeteria" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyStubPage title="🍽 Cafeteria Monitoring" /></Suspense></FacultyRoute>} />
          <Route path="/faculty/attendance" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyStubPage title="🎓 Attendance Management" /></Suspense></FacultyRoute>} />
          <Route path="/faculty/complaints" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyStubPage title="🧾 Complaints Review" /></Suspense></FacultyRoute>} />
          <Route path="/faculty/announcements" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyStubPage title="📢 Announcements" /></Suspense></FacultyRoute>} />
          <Route path="/faculty/notifications" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyStubPage title="🔔 Notifications" /></Suspense></FacultyRoute>} />
          <Route path="/faculty/profile" element={<FacultyRoute><Suspense fallback={<PageLoader />}><FacultyStubPage title="👤 Profile Settings" /></Suspense></FacultyRoute>} />



          {/* ══════════ ADMIN (OBFUSCATED) ══════════ */}
          <Route path="/12345678/admin/dashboard" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense></AdminRoute>} />
          <Route path="/12345678/admin/sustainability" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminSustainabilityPage /></Suspense></AdminRoute>} />
          <Route path="/12345678/admin/users" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense></AdminRoute>} />
          <Route path="/12345678/admin/complaints" element={<AdminRoute><Suspense fallback={<PageLoader />}><AdminComplaintsPage /></Suspense></AdminRoute>} />
          <Route path="/12345678/admin/events" element={<AdminRoute><AdminStubPage title="📅 Event Management" /></AdminRoute>} />
          <Route path="/12345678/admin/challenges" element={<AdminRoute><AdminStubPage title="🎯 Challenge Management" /></AdminRoute>} />
          <Route path="/12345678/admin/cafeteria" element={<AdminRoute><AdminStubPage title="🍽️ Cafeteria Management" /></AdminRoute>} />
          <Route path="/12345678/admin/attendance" element={<AdminRoute><AdminStubPage title="🎓 Attendance System" /></AdminRoute>} />
          <Route path="/12345678/admin/lost-found" element={<AdminRoute><AdminStubPage title="🔍 Lost & Found Verification" /></AdminRoute>} />
          <Route path="/12345678/admin/broadcast" element={<AdminRoute><AdminStubPage title="📢 Broadcast Center" /></AdminRoute>} />
          <Route path="/12345678/admin/notifications" element={<AdminRoute><AdminStubPage title="🔔 Notification Center" /></AdminRoute>} />
          <Route path="/12345678/admin/settings" element={<AdminRoute><AdminStubPage title="⚙️ System Settings" /></AdminRoute>} />
          <Route path="/12345678/admin/audit" element={<AdminRoute><AdminStubPage title="📈 Audit Logs" /></AdminRoute>} />
          <Route path="/12345678/admin/navigation" element={<AdminRoute><AdminStubPage title="📍 Campus Locations" /></AdminRoute>} />
          <Route path="/12345678/admin/profile" element={<AdminRoute><AdminStubPage title="👤 Admin Profile" /></AdminRoute>} />

          {/* CATCH ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

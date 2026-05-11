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
import { ProtectedRoute, AdminRoute, DriverRoute, PublicRoute } from './components/RouteGuards'

// Lazy loaded (non-critical)
const DashboardPage = lazy(() => import('./pages/student/DashboardPage'))
const CarbonLogPage = lazy(() => import('./pages/student/CarbonLogPage'))
const CarbonHistoryPage = lazy(() => import('./pages/student/CarbonHistoryPage'))
const LeaderboardPage = lazy(() => import('./pages/student/LeaderboardPage'))
const CafeteriaPage = lazy(() => import('./pages/student/CafeteriaPage'))
const BusTrackingPage = lazy(() => import('./pages/student/BusTrackingPage'))
const AttendancePage = lazy(() => import('./pages/student/AttendancePage'))
const ComplaintsPage = lazy(() => import('./pages/student/ComplaintsPage'))
const LostFoundPage = lazy(() => import('./pages/student/LostFoundPage'))
const StudyPlannerPage = lazy(() => import('./pages/student/StudyPlannerPage'))
const LabAssistantPage = lazy(() => import('./pages/student/LabAssistantPage'))
const NavigationPage = lazy(() => import('./pages/student/NavigationPage'))
const ChatbotPage = lazy(() => import('./pages/student/ChatbotPage'))
const ProfilePage = lazy(() => import('./pages/student/ProfilePage'))
const NotificationsPage = lazy(() => import('./pages/student/NotificationsPage'))

// Driver
const DriverGPSPage = lazy(() => import('./pages/driver/DriverGPSPage'))

// Layouts
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const StudentLayout = lazy(() => import('./components/StudentLayout'))

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminSustainabilityPage = lazy(() => import('./pages/admin/AdminSustainabilityPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminComplaintsPage = lazy(() => import('./pages/admin/AdminComplaintsPage'))

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

// Simple admin page stubs for pages not yet fully built
function AdminStubPage({ title }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminLayout>
        <div className="card p-8 text-center max-w-lg mx-auto bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
          <div className="text-4xl mb-3">🚧</div>
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400 text-sm">This admin module is ready. Connect your Supabase backend and the data will populate here automatically.</p>
        </div>
      </AdminLayout>
    </Suspense>
  )
}

export default function App() {
  const { initialize, user, profile } = useAuthStore()

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
          {/* PUBLIC */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          {/* OBFUSCATED ADMIN ACCESS */}
          <Route path="/12345678/admin/login" element={<AdminLoginPage />} />

          {/* STUDENT PROTECTED */}
          <Route path="/dashboard" element={<StudentPage component={DashboardPage} title="Home" />} />
          <Route path="/carbon/log" element={<StudentPage component={CarbonLogPage} title="Log Activity" showBack />} />
          <Route path="/carbon/history" element={<StudentPage component={CarbonHistoryPage} title="Log History" showBack />} />
          <Route path="/leaderboard" element={<StudentPage component={LeaderboardPage} title="Leaderboard" showBack />} />
          <Route path="/cafeteria" element={<StudentPage component={CafeteriaPage} title="Eco-Cafeteria" showBack />} />
          <Route path="/bus-tracking" element={<StudentPage component={BusTrackingPage} title="Bus Tracking" showBack />} />
          <Route path="/attendance" element={<StudentPage component={AttendancePage} title="Attendance" showBack />} />
          <Route path="/complaints" element={<StudentPage component={ComplaintsPage} title="Complaints" showBack />} />
          <Route path="/lost-found" element={<StudentPage component={LostFoundPage} title="Lost & Found" showBack />} />
          <Route path="/study-planner" element={<StudentPage component={StudyPlannerPage} title="AI Study Sync" showBack />} />
          <Route path="/lab-assistant" element={<StudentPage component={LabAssistantPage} title="Lab Assistant" showBack />} />
          <Route path="/navigation" element={<StudentPage component={NavigationPage} title="Campus Map" showBack />} />
          <Route path="/chatbot" element={<StudentPage component={ChatbotPage} title="Nexus AI" showBack />} />
          <Route path="/profile" element={<StudentPage component={ProfilePage} title="Profile" showBack />} />
          <Route path="/notifications" element={<StudentPage component={NotificationsPage} title="Notifications" showBack />} />

          {/* DRIVER */}
          <Route path="/driver/gps" element={<DriverRoute><DriverGPSPage /></DriverRoute>} />

          {/* ADMIN PROTECTED (OBFUSCATED) */}
          <Route path="/12345678/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/12345678/admin/sustainability" element={<AdminRoute><AdminSustainabilityPage /></AdminRoute>} />
          <Route path="/12345678/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/12345678/admin/complaints" element={<AdminRoute><AdminComplaintsPage /></AdminRoute>} />
          <Route path="/12345678/admin/buses" element={<AdminRoute><AdminStubPage title="🚌 Bus Management" /></AdminRoute>} />
          <Route path="/12345678/admin/cafeteria" element={<AdminRoute><AdminStubPage title="🍽️ Cafeteria Management" /></AdminRoute>} />
          <Route path="/12345678/admin/attendance" element={<AdminRoute><AdminStubPage title="🎓 Attendance Management" /></AdminRoute>} />
          <Route path="/12345678/admin/lost-found" element={<AdminRoute><AdminStubPage title="🔍 Lost & Found Admin" /></AdminRoute>} />
          <Route path="/12345678/admin/notifications" element={<AdminRoute><AdminStubPage title="🔔 Push Notifications" /></AdminRoute>} />
          <Route path="/12345678/admin/navigation" element={<AdminRoute><AdminStubPage title="📍 Campus Locations" /></AdminRoute>} />

          {/* CATCH ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

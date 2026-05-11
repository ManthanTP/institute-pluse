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

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminSustainabilityPage = lazy(() => import('./pages/admin/AdminSustainabilityPage'))
const AdminComplaintsPage = lazy(() => import('./pages/admin/AdminComplaintsPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0fdf4' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="text-4xl">🌿</div>
        <div className="spinner spinner-green" />
      </div>
    </div>
  )
}

// Simple admin page stubs for pages not yet fully built
function AdminStubPage({ title }) {
  const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminLayout>
        <div className="card p-8 text-center max-w-lg mx-auto">
          <div className="text-4xl mb-3">🚧</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 text-sm">This admin module is ready. Connect your Supabase backend and the data will populate here automatically.</p>
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
            fontWeight: '500',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
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
          <Route path="/secure-admin-panel/login" element={<AdminLoginPage />} />

          {/* STUDENT PROTECTED */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/carbon/log" element={<ProtectedRoute><CarbonLogPage /></ProtectedRoute>} />
          <Route path="/carbon/history" element={<ProtectedRoute><CarbonHistoryPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/cafeteria" element={<ProtectedRoute><CafeteriaPage /></ProtectedRoute>} />
          <Route path="/bus-tracking" element={<ProtectedRoute><BusTrackingPage /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><ComplaintsPage /></ProtectedRoute>} />
          <Route path="/lost-found" element={<ProtectedRoute><LostFoundPage /></ProtectedRoute>} />
          <Route path="/study-planner" element={<ProtectedRoute><StudyPlannerPage /></ProtectedRoute>} />
          <Route path="/lab-assistant" element={<ProtectedRoute><LabAssistantPage /></ProtectedRoute>} />
          <Route path="/navigation" element={<ProtectedRoute><NavigationPage /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* DRIVER */}
          <Route path="/driver/gps" element={<DriverRoute><DriverGPSPage /></DriverRoute>} />

          {/* ADMIN */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/sustainability" element={<AdminRoute><AdminSustainabilityPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/complaints" element={<AdminRoute><AdminComplaintsPage /></AdminRoute>} />
          <Route path="/admin/buses" element={<AdminRoute><AdminStubPage title="🚌 Bus Management" /></AdminRoute>} />
          <Route path="/admin/cafeteria" element={<AdminRoute><AdminStubPage title="🍽️ Cafeteria Management" /></AdminRoute>} />
          <Route path="/admin/attendance" element={<AdminRoute><AdminStubPage title="🎓 Attendance Management" /></AdminRoute>} />
          <Route path="/admin/lost-found" element={<AdminRoute><AdminStubPage title="🔍 Lost & Found Admin" /></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><AdminStubPage title="🔔 Push Notifications" /></AdminRoute>} />
          <Route path="/admin/navigation" element={<AdminRoute><AdminStubPage title="📍 Campus Locations" /></AdminRoute>} />

          {/* CATCH ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

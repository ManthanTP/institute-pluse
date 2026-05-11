import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/index'

export function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuthStore()
  const location = useLocation()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0fdf4' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-pulse-green">🌿</div>
          <div className="spinner spinner-green" />
          <p className="text-sm text-gray-500 font-medium">Loading InstitutePulse...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export function AdminRoute({ children }) {
  const { user, profile, loading, initialized } = useAuthStore()
  const location = useLocation()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <p className="text-sm text-gray-400">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/secure-admin-panel/login" replace />
  }

  if (profile && profile.role !== 'admin') {
    return <Navigate to="/secure-admin-panel/login" replace />
  }

  return children
}

export function DriverRoute({ children }) {
  const { user, profile, loading, initialized } = useAuthStore()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0fdf4' }}>
        <div className="spinner spinner-green" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (profile && profile.role !== 'driver' && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function PublicRoute({ children }) {
  const { user, profile, loading, initialized } = useAuthStore()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0fdf4' }}>
        <div className="text-4xl">🌿</div>
      </div>
    )
  }

  if (user && profile) {
    if (profile.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (profile.role === 'driver') return <Navigate to="/driver/gps" replace />
    return <Navigate to="/dashboard" replace />
  }

  return children
}

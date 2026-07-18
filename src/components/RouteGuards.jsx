import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/index'

export function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuthStore()
  const location = useLocation()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Loading InstitutePLUSE...</p>
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

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-red-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/12345678/admin/login" replace />
  }

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/12345678/admin/login" replace />
  }

  return children
}

export function FacultyRoute({ children }) {
  const { user, profile, loading, initialized } = useAuthStore()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Faculty Sync...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!profile || (profile.role !== 'faculty' && profile.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function OwnerRoute({ children }) {
  const { user, profile, loading, initialized } = useAuthStore()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Owner Verification...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile || profile.role !== 'owner') {
    return <Navigate to="/login" replace />
  }

  return children
}

export function PublicRoute({ children }) {
  const { user, profile, loading, initialized } = useAuthStore()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-4xl animate-pulse">🌿</div>
      </div>
    )
  }

  if (user && profile) {
    if (profile.role === 'admin') return <Navigate to="/12345678/admin/dashboard" replace />
    if (profile.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />
    if (profile.role === 'owner') return <Navigate to="/owner/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }

  return children
}

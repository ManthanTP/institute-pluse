import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Menu, X, LogOut, BarChart3, Users, Bus, UtensilsCrossed, GraduationCap, MessageSquare, Search, Bell, Map, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '../../store/index'

const NAV_ITEMS = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/sustainability', icon: BarChart3, label: 'Sustainability' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/buses', icon: Bus, label: 'Bus Management' },
  { path: '/admin/cafeteria', icon: UtensilsCrossed, label: 'Cafeteria' },
  { path: '/admin/attendance', icon: GraduationCap, label: 'Attendance' },
  { path: '/admin/complaints', icon: MessageSquare, label: 'Complaints' },
  { path: '/admin/lost-found', icon: Search, label: 'Lost & Found' },
  { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { path: '/admin/navigation', icon: Map, label: 'Campus Locations' },
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, signOut } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/secure-admin-panel/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#f8fafc' }}>
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: '#1e293b' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-eco flex items-center justify-center text-base">🌿</div>
            <div>
              <p className="text-white font-bold text-sm">InstitutePulse</p>
              <p className="text-gray-500 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="py-4">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* PROFILE */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: '#1e293b' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full gradient-eco flex items-center justify-center text-sm font-bold text-white">
              {profile?.full_name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{profile?.full_name}</p>
              <p className="text-gray-500 text-xs">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors py-1">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* OVERLAY (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN CONTENT */}
      <main className="admin-content flex-1">
        {/* TOP BAR */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
          style={{ background: 'rgba(248,250,252,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0' }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <h1 className="text-sm font-bold text-gray-900">
                {NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'Admin'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Live</span>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

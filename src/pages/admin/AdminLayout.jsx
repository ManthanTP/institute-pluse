import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Menu, X, LogOut, BarChart3, Users, UtensilsCrossed, GraduationCap, MessageSquare, Search, Bell, Map, LayoutDashboard, Shield, Target, CalendarDays, Megaphone, Settings, FileText, User } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../assets/logo.png'

const NAV_ITEMS = [
  { path: '/12345678/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/12345678/admin/users', icon: Users, label: 'User Management' },
  { path: '/12345678/admin/sustainability', icon: BarChart3, label: 'Sustainability' },
  { path: '/12345678/admin/events', icon: CalendarDays, label: 'Event Management' },
  { path: '/12345678/admin/challenges', icon: Target, label: 'Challenges' },
  { path: '/12345678/admin/cafeteria', icon: UtensilsCrossed, label: 'Cafeteria' },
  { path: '/12345678/admin/attendance', icon: GraduationCap, label: 'Attendance' },
  { path: '/12345678/admin/complaints', icon: MessageSquare, label: 'Complaints' },
  { path: '/12345678/admin/lost-found', icon: Search, label: 'Lost & Found' },
  { path: '/12345678/admin/broadcast', icon: Megaphone, label: 'Broadcast Center' },
  { path: '/12345678/admin/notifications', icon: Bell, label: 'Notifications' },
  { path: '/12345678/admin/settings', icon: Settings, label: 'System Settings' },
  { path: '/12345678/admin/audit', icon: FileText, label: 'Audit Logs' },
  { path: '/12345678/admin/navigation', icon: Map, label: 'Campus Locations' },
  { path: '/12345678/admin/profile', icon: User, label: 'Admin Profile' },
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, signOut } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/12345678/admin/login')
  }

  return (
    <div className="flex min-h-[100dvh] bg-[#020617] text-white overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[80%] md:w-[40%] h-[40%] rounded-full bg-green-600/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[80%] md:w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-full md:w-72 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full bg-[#020617]/80 lg:bg-[#020617]/40 backdrop-blur-3xl border-r border-white/5 flex flex-col">
          {/* Logo */}
          <div className="px-8 py-10 flex items-center justify-between lg:justify-start gap-4 border-b border-white/5">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Admin Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
              <div>
                <p className="text-white font-black text-sm uppercase tracking-tighter">InstitutePulse</p>
                <p className="text-green-500 font-black text-[9px] uppercase tracking-[0.3em]">Pulse Core</p>
              </div>
            </div>
            <button className="lg:hidden p-3 bg-white/5 rounded-2xl" onClick={() => setSidebarOpen(false)}>
               <X size={20} />
            </button>
          </div>

          {/* NAV */}
          <nav className="flex-1 py-6 px-4 overflow-y-auto no-scrollbar">
            <div className="space-y-1">
              {NAV_ITEMS.map(item => {
                // RESTRICTED OWNER ACCESS
                if (profile?.email === 'hubligojaincollege@gmail.com') {
                  if (item.label !== 'Cafeteria' && item.label !== 'Dashboard') {
                    return null
                  }
                }

                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 lg:py-3 rounded-2xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                      isActive 
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* PROFILE */}
          <div className="p-6 border-t border-white/5 bg-slate-900/40">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 p-[1.5px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-sm font-black text-white uppercase">
                   {profile?.full_name?.[0] || 'A'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-black uppercase tracking-tight truncate">{profile?.full_name}</p>
                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Administrator</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={14} /> Exit System
            </button>
          </div>
        </div>
      </aside>

      {/* OVERLAY (mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen relative overflow-y-auto no-scrollbar">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 px-6 py-5 lg:py-6 backdrop-blur-xl bg-[#020617]/80 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-3 rounded-2xl bg-white/5 border border-white/10 text-green-500" onClick={() => setSidebarOpen(true)}>
               <Menu size={20} />
            </button>
            <h1 className="text-sm lg:text-lg font-black text-white uppercase tracking-tighter">
              {NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'Console'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
               <span className="text-[8px] font-black text-green-500 uppercase tracking-widest hidden sm:inline">System Live</span>
             </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-5 md:p-8 lg:p-12 flex-1 relative z-10">
           {children}
        </div>
      </main>
    </div>
  )
}


import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Menu, X, LogOut, Home, CalendarDays, Users, BarChart3, Leaf, Target, Bus, UtensilsCrossed, GraduationCap, MessageSquare, Megaphone, Bell, User, Shield, Clock, BookOpen, HelpCircle } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import FacultyBottomNav from '../../components/FacultyBottomNav'

const FACULTY_NAV = [
  { path: '/faculty/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/faculty/events', icon: CalendarDays, label: 'Manage Events' },
  { path: '/faculty/attendance', icon: GraduationCap, label: 'Attendance' },
  { path: '/faculty/participants', icon: Users, label: 'Participants' },
  { path: '/faculty/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/faculty/sustainability', icon: Leaf, label: 'Sustainability' },
  { path: '/faculty/resources', icon: BookOpen, label: 'Resource Hub' },
  { path: '/faculty/cafeteria', icon: UtensilsCrossed, label: 'Cafeteria' },
  { path: '/faculty/complaints', icon: MessageSquare, label: 'Complaints' },
  { path: '/faculty/announcements', icon: Megaphone, label: 'Announcements' },
  { path: '/faculty/notifications', icon: Bell, label: 'Notifications' },
  { path: '/faculty/profile', icon: User, label: 'Profile Settings' },
  { path: '/faculty/help', icon: HelpCircle, label: 'Help Center' },
]

export default function FacultyLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, signOut } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-[100dvh] bg-[#020617] text-white overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[80%] md:w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[80%] md:w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-full md:w-72 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full bg-[#020617]/80 lg:bg-[#020617]/40 backdrop-blur-3xl border-r border-white/5 flex flex-col">
          {/* Logo */}
          <div className="px-8 py-10 flex items-center justify-between lg:justify-start gap-4 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
                 <Shield size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-tighter">InstitutePulse</p>
                <p className="text-blue-500 font-black text-[9px] uppercase tracking-[0.3em]">Faculty Hub</p>
              </div>
            </div>
            <button className="lg:hidden p-3 bg-white/5 rounded-2xl" onClick={() => setSidebarOpen(false)}>
               <X size={20} />
            </button>
          </div>

          {/* NAV */}
          <nav className="flex-1 py-6 px-4 overflow-y-auto no-scrollbar">
            <div className="space-y-1">
              {FACULTY_NAV.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 lg:py-3 rounded-2xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[1.5px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-sm font-black text-white uppercase">
                   {profile?.full_name?.[0] || 'F'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-black uppercase tracking-tight truncate">{profile?.full_name}</p>
                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Faculty Terminal</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={14} /> Log Out
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
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen relative overflow-y-auto no-scrollbar min-w-0 w-full overflow-x-hidden">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 px-6 py-5 lg:py-6 backdrop-blur-xl bg-[#020617]/80 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-3 rounded-2xl bg-white/5 border border-white/10 text-blue-500" onClick={() => setSidebarOpen(true)}>
               <Menu size={20} />
            </button>
            <h1 className="text-sm lg:text-lg font-black text-white uppercase tracking-tighter">
              {FACULTY_NAV.find(n => n.path === location.pathname)?.label || 'Console'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
               <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest hidden sm:inline">Active</span>
             </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-5 md:p-8 lg:p-12 pb-32 lg:pb-12 flex-1 relative z-10">
           {children}
        </div>
        
        {/* Mobile Bottom Navigation */}
        <FacultyBottomNav />
      </main>
    </div>
  )
}


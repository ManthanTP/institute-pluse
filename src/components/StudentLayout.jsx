import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Menu, X, LogOut, Home, Leaf, Bus, UtensilsCrossed, GraduationCap, User, Sparkles, Trophy, MessageSquare, Bell, ChevronLeft, TrendingUp, Target, CalendarDays, Search, MapPin, Beaker, BookOpen, Bot, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import BottomTabBar from './BottomTabBar'
import logo from '../assets/logo.png'

const STUDENT_NAV = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/carbon/log', icon: Leaf, label: 'Carbon Tracker' },
  { path: '/carbon/history', icon: TrendingUp, label: 'Carbon Analytics' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/events', icon: CalendarDays, label: 'Events' },
  { path: '/cafeteria', icon: UtensilsCrossed, label: 'Cafeteria' },
  { path: '/attendance', icon: GraduationCap, label: 'Attendance' },
  { path: '/chatbot', icon: Bot, label: 'AI Assistant' },
  { path: '/study-planner', icon: BookOpen, label: 'Study Planner' },
  { path: '/lab-assistant', icon: Beaker, label: 'Lab Assistant' },
  { path: '/navigation', icon: MapPin, label: 'Campus Navigation' },
  { path: '/lost-found', icon: Search, label: 'Lost & Found' },
  { path: '/complaints', icon: ShieldAlert, label: 'Complaints' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/profile', icon: User, label: 'Profile Settings' },
]

export default function StudentLayout({ children, title, showBack = false, hideChrome = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, signOut } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [greeting, setGreeting] = useState('Welcome')
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const hour = now.getHours()
      
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      
      if (hour >= 5 && hour < 12) setGreeting('Good morning')
      else if (hour >= 12 && hour < 17) setGreeting('Good afternoon')
      else if (hour >= 17 && hour < 21) setGreeting('Good evening')
      else setGreeting('Good night')
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const fullName = profile?.full_name || 'Nexus User'
  const firstName = profile?.full_name?.split(' ')[0] || 'User'
  const activeLabel = STUDENT_NAV.find(n => n.path === location.pathname)?.label || title || 'Nexus'

  return (
    <div className="flex min-h-[100dvh] bg-[#020617] text-white overflow-hidden selection:bg-green-500/30 selection:text-white">
      {/* Background Mesh (Global) */}
      {!hideChrome && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-green-500/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>
      )}

      {/* SIDEBAR (Desktop) - Always show on desktop unless extreme hideChrome */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transition-all duration-500 transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${hideChrome ? 'hidden lg:block' : ''}`}>
        <div className="h-full bg-slate-950/40 backdrop-blur-3xl border-r border-white/5 flex flex-col">
          {/* Logo */}
          <div className="px-8 py-8 flex items-center gap-4 border-b border-white/5">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.2)]" />
            <div>
              <p className="text-white font-black text-sm uppercase tracking-tighter">InstitutePulse</p>
              <p className="text-green-500 font-black text-[9px] uppercase tracking-[0.3em]">Student Nexus</p>
            </div>
          </div>

          {/* NAV */}
          <nav className="flex-1 py-6 px-4 overflow-y-auto no-scrollbar">
            <div className="space-y-1">
              {STUDENT_NAV.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
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

          {/* PROFILE / LOGOUT */}
          <div className="p-6 border-t border-white/5 bg-slate-900/40">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-[1.5px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-black text-white uppercase">
                   {profile?.full_name?.[0] || 'S'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-black uppercase tracking-tight truncate">{fullName}</p>
                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{profile?.department || 'Student'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* OVERLAY (Mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className={`flex-1 lg:ml-72 flex flex-col min-h-screen relative ${hideChrome ? 'w-full' : ''}`}>
        {/* MOBILE HEADER */}
        {!hideChrome && (
          <header className="lg:hidden sticky top-0 z-30 px-6 py-5 backdrop-blur-xl bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBack ? (
                <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400">
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400">
                    <Menu size={20} />
                  </button>
                  <img src={logo} alt="Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(34,197,94,0.2)]" />
                </div>
              )}
              <div>
                {!showBack && <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{greeting}</p>}
                <h1 className="text-sm font-black text-white uppercase tracking-[0.15em]">{showBack ? activeLabel : `${firstName} ✨`}</h1>
              </div>
            </div>
            <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-slate-950" />
            </button>
          </header>
        )}

        {/* DESKTOP HEADER */}
        {!hideChrome && (
          <header className="hidden lg:flex sticky top-0 z-30 px-10 py-6 backdrop-blur-xl bg-slate-950/60 border-b border-white/5 items-center justify-between">
            <div className="flex items-center gap-6">
              {showBack && (
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                </button>
              )}
              <div>
                {!showBack && <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{greeting}</p>}
                <h1 className="text-xl font-black text-white uppercase tracking-tighter">{showBack ? activeLabel : `${firstName} ✨`}</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Sparkles size={16} className="text-green-500" />
                  <span className="text-xs font-black text-white">{profile?.eco_points || 0} Points</span>
               </div>
            </div>
          </header>
        )}

        {/* PAGE CONTENT */}
        <div className={`flex-1 overflow-x-hidden no-scrollbar ${hideChrome ? '' : 'pb-32 lg:pb-10'} ${(showBack && !hideChrome) ? 'p-6 lg:p-10' : ''}`}>
           {children}
        </div>

        {/* MOBILE BOTTOM NAV */}
        {!hideChrome && (
          <div className="lg:hidden">
            <BottomTabBar />
          </div>
        )}
      </main>
    </div>
  )
}

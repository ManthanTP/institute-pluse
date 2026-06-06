import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Menu, X, LogOut, UtensilsCrossed, LayoutDashboard, User } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../assets/logo.png'
import OwnerBottomNav from '../../components/OwnerBottomNav'

const NAV_ITEMS = [
  { path: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/owner/cafeteria', icon: UtensilsCrossed, label: 'Cafeteria Hub' },
  { path: '/owner/profile', icon: User, label: 'Owner Profile' },
]

export default function OwnerLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, signOut } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-[100dvh] bg-slate-950 text-white overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-orange-600/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* SIDEBAR (Desktop Only) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transition-all duration-500 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full bg-slate-950/40 backdrop-blur-3xl border-r border-white/5 flex flex-col">
          {/* Logo */}
          <div className="px-8 py-8 flex items-center gap-4 border-b border-white/5">
            <img src={logo} alt="Owner Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
            <div>
              <p className="text-white font-black text-sm uppercase tracking-tighter">InstitutePulse</p>
              <p className="text-orange-500 font-black text-[9px] uppercase tracking-[0.3em]">Owner Console</p>
            </div>
          </div>

          {/* NAV */}
          <nav className="flex-1 py-6 px-4 overflow-y-auto no-scrollbar">
            <div className="space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                      isActive 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-[1.5px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-black text-white uppercase">
                   {profile?.full_name?.[0] || 'O'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px] font-black uppercase tracking-tight truncate">{profile?.full_name}</p>
                <p className="text-orange-500 text-[9px] font-black uppercase tracking-widest italic">HubliGo Owner</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={14} /> Exit Console
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen relative min-w-0 w-full overflow-x-hidden">
        <header className="sticky top-0 z-30 px-6 py-4 backdrop-blur-xl bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-black text-white uppercase tracking-tighter">
              {NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'Console'}
            </h1>
          </div>
          <div className="lg:hidden flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-[10px] font-black">
                {profile?.full_name?.[0] || 'O'}
             </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 flex-1 overflow-x-hidden no-scrollbar pb-32 lg:pb-10">
           {children}
        </div>

        <OwnerBottomNav />
      </main>
    </div>
  )
}

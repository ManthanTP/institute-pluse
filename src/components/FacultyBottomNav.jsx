import { useNavigate, useLocation } from 'react-router-dom'
import { Home, GraduationCap, CalendarDays, UtensilsCrossed, User } from 'lucide-react'

export default function FacultyBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { path: '/faculty/dashboard', icon: Home, label: 'Home' },
    { path: '/faculty/attendance', icon: GraduationCap, label: 'Class' },
    { path: '/faculty/events', icon: CalendarDays, label: 'Events' },
    { path: '/faculty/cafeteria', icon: UtensilsCrossed, label: 'Cafe' },
    { path: '/faculty/profile', icon: User, label: 'Me' }
  ]

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40 lg:hidden">
      <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path
          
          return (
            <button 
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1.5 transition-all relative ${
                isActive ? 'text-blue-500' : 'text-gray-500 hover:text-white'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${
                isActive ? 'bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-500/20' : 'border border-transparent'
              }`}>
                <Icon size={20} strokeWidth={isActive ? 3 : 2} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

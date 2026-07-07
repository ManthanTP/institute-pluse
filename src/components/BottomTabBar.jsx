import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Leaf, CalendarDays, UtensilsCrossed, User, Sparkles, GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'

const tabs = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/carbon/log', icon: Sparkles, label: 'Log' },
  { path: '/attendance', icon: GraduationCap, label: 'Attend' },
  { path: '/events', icon: CalendarDays, label: 'Events' },
  { path: '/cafeteria', icon: UtensilsCrossed, label: 'Café' },
  { path: '/profile', icon: User, label: 'Me' },
]

export default function BottomTabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 w-full px-4 pb-6 pt-2 z-40 pointer-events-none lg:hidden">
      <div className="max-w-lg mx-auto h-18 bg-slate-950/80 backdrop-blur-3xl border border-white/[0.08] rounded-[28px] shadow-[0_-8px_32px_rgba(0,0,0,0.5)] flex items-center justify-around px-2 pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = 
            (tab.path === '/dashboard' && ['/dashboard', '/navigation', '/study-planner', '/lost-found', '/announcements', '/resources'].includes(location.pathname)) ||
            (tab.path === '/carbon/log' && location.pathname.startsWith('/carbon')) ||
            (tab.path === '/attendance' && location.pathname === '/attendance') ||
            (tab.path === '/events' && location.pathname === '/events') ||
            (tab.path === '/cafeteria' && location.pathname === '/cafeteria') ||
            (tab.path === '/profile' && ['/profile', '/leaderboard', '/complaints', '/notifications', '/help'].includes(location.pathname))

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'text-green-500 bg-green-500/10' : 'text-gray-500'
                }`}
              >
                <Icon size={isActive ? 20 : 16} strokeWidth={isActive ? 3 : 2} />
              </motion.div>
              
              <span className={`text-[7px] font-black uppercase tracking-wider transition-colors ${
                isActive ? 'text-green-500' : 'text-gray-600'
              }`}>
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute -bottom-1.5 w-1 h-1 bg-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,1)]"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}


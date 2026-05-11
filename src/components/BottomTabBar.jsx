import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Leaf, Bus, UtensilsCrossed, User, Compass, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const tabs = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/carbon/log', icon: Sparkles, label: 'Log' },
  { path: '/bus-tracking', icon: Bus, label: 'Bus' },
  { path: '/cafeteria', icon: UtensilsCrossed, label: 'Café' },
  { path: '/profile', icon: User, label: 'Me' },
]

export default function BottomTabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 w-full px-6 pb-6 pt-2 z-50 pointer-events-none">
      <div className="max-w-md mx-auto h-16 bg-white/80 backdrop-blur-xl border border-white/40 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center justify-around px-2 pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path ||
            (tab.path === '/carbon/log' && location.pathname.startsWith('/carbon'))

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
                  isActive ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <Icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400'
              }`}>
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-1 h-1 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}


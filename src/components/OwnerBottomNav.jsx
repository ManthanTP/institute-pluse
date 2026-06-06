import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, User } from 'lucide-react'
import { motion } from 'framer-motion'

const tabs = [
  { path: '/owner/dashboard', icon: LayoutDashboard, label: 'Dash' },
  { path: '/owner/cafeteria', icon: UtensilsCrossed, label: 'Cafe' },
  { path: '/owner/profile', icon: User, label: 'Profile' },
]

export default function OwnerBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 w-full px-6 pb-8 pt-2 z-40 pointer-events-none lg:hidden">
      <div className="max-w-md mx-auto h-20 bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl flex items-center justify-around px-4 pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -4 : 0
                }}
                className={`p-2.5 rounded-2xl transition-colors ${
                  isActive ? 'text-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 3 : 2} />
              </motion.div>
              
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-600'
              }`}>
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="ownerActiveTabGlow"
                  className="absolute -bottom-2 w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_12px_rgba(249,115,22,1)]"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

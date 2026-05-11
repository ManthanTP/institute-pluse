import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Leaf, Bus, UtensilsCrossed, User } from 'lucide-react'

const tabs = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/carbon/log', icon: Leaf, label: 'Carbon' },
  { path: '/bus-tracking', icon: Bus, label: 'Bus' },
  { path: '/cafeteria', icon: UtensilsCrossed, label: 'Food' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function BottomTabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bottom-tab-bar">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = location.pathname === tab.path ||
          (tab.path === '/carbon/log' && location.pathname.startsWith('/carbon'))

        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 transition-all duration-200"
            style={{ color: isActive ? '#16a34a' : '#94a3b8' }}
            aria-label={tab.label}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              {isActive && (
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: '#16a34a' }}
                />
              )}
            </div>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 400 }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, Flame, Leaf, TrendingUp, Star } from 'lucide-react'
import { useAuthStore, useCarbonStore, useNotifStore } from '../../store/index'
import { supabase } from '../../lib/supabase'
import BottomTabBar from '../../components/BottomTabBar'
import EcoScoreRing from '../../components/EcoScoreRing'

const MODULE_TILES = [
  { path: '/carbon/log', emoji: '🌱', label: 'Carbon Log', color: '#f0fdf4', iconBg: '#16a34a' },
  { path: '/bus-tracking', emoji: '🚌', label: 'Bus Track', color: '#eff6ff', iconBg: '#0ea5e9' },
  { path: '/carbon/history', emoji: '📊', label: 'My Carbon', color: '#fdf4ff', iconBg: '#a855f7' },
  { path: '/leaderboard', emoji: '🏆', label: 'Leaderboard', color: '#fef3c7', iconBg: '#f59e0b' },
  { path: '/cafeteria', emoji: '🍽️', label: 'Cafeteria', color: '#fff7ed', iconBg: '#f97316' },
  { path: '/attendance', emoji: '🎓', label: 'Attendance', color: '#f0fdfa', iconBg: '#14b8a6' },
  { path: '/study-planner', emoji: '📅', label: 'Study Plan', color: '#fdf4ff', iconBg: '#8b5cf6' },
  { path: '/lab-assistant', emoji: '🤖', label: 'Lab AI', color: '#fef2f2', iconBg: '#ef4444' },
  { path: '/navigation', emoji: '📍', label: 'Navigation', color: '#fff7ed', iconBg: '#f97316' },
  { path: '/lost-found', emoji: '🔍', label: 'Lost & Found', color: '#f8fafc', iconBg: '#64748b' },
  { path: '/complaints', emoji: '🧾', label: 'Complaints', color: '#fef2f2', iconBg: '#dc2626' },
  { path: '/chatbot', emoji: '💬', label: 'AI Chat', color: '#eff6ff', iconBg: '#0ea5e9' },
]

const ECO_TIPS = [
  '🚌 Taking the college bus instead of a bike for 5 km saves 0.36 kg CO2 — that\'s 10.8 kg per month!',
  '🥗 Replacing one non-veg meal with vegetarian saves ~1 kg CO2 per day.',
  '💡 Switching off AC when leaving the room saves ~1.23 kg CO2 per hour.',
  '🚿 A bucket bath uses 85% less water than a 10-minute shower.',
  '♻️ Recycling your waste instead of landfill reduces CO2 by up to 80%.',
  '🚶 Walking to class = 0 kg CO2 + fitness bonus + eco-points!',
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { todayLog, fetchTodayLog } = useCarbonStore()
  const { unreadCount, fetchNotifications } = useNotifStore()
  const [tipIndex] = useState(() => Math.floor(Math.random() * ECO_TIPS.length))
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    if (profile?.id) {
      fetchTodayLog(profile.id)
      fetchNotifications(profile.id)
    }
  }, [profile?.id])

  const score = todayLog?.eco_score ?? 0
  const hasLogged = !!todayLog
  const firstName = profile?.full_name?.split(' ')[0] || 'Eco Warrior'

  return (
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: '80px' }}>
      {/* APP HEADER */}
      <header className="app-header">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <div>
            <p className="text-xs text-green-200 font-medium">{greeting},</p>
            <p className="text-sm font-bold text-white leading-tight">{firstName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-1.5"
            aria-label="Notifications"
          >
            <Bell size={22} color="white" />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-green-800"
            style={{ background: '#bbf7d0' }}
          >
            {firstName[0]}
          </button>
        </div>
      </header>

      <div className="page-container pt-4">
        {/* ECO HERO CARD */}
        <div className="card p-4 mb-4 animate-fade-in-up" style={{
          background: hasLogged
            ? 'linear-gradient(135deg, #166534, #16a34a)'
            : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: hasLogged ? 'none' : '1.5px solid #86efac'
        }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1" style={{ color: hasLogged ? 'rgba(255,255,255,0.8)' : '#16a34a' }}>
                Today's Eco Score
              </p>
              <p className="font-semibold mb-3" style={{ color: hasLogged ? 'white' : '#0f172a', fontSize: '13px' }}>
                {hasLogged
                  ? `${todayLog.total_kg?.toFixed(1)} kg CO2 logged · +${todayLog.eco_points_earned} pts`
                  : 'Log your activities to get your eco score'}
              </p>
              <button
                onClick={() => navigate(hasLogged ? '/carbon/history' : '/carbon/log')}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: hasLogged ? 'rgba(255,255,255,0.2)' : '#16a34a',
                  color: hasLogged ? 'white' : 'white',
                  border: hasLogged ? '1px solid rgba(255,255,255,0.4)' : 'none'
                }}
              >
                {hasLogged ? '📊 View Details' : '🌱 Log Today\'s Activity'}
              </button>
            </div>
            <EcoScoreRing
              score={score}
              size={110}
              strokeWidth={8}
              showLabel={false}
              animated={true}
            />
          </div>
        </div>

        {/* QUICK STATS ROW */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar mb-4 animate-fade-in-up stagger-1">
          <div className="quick-stat">
            <div className="flex items-center gap-1.5 mb-1">
              <Star size={14} className="text-yellow-500" />
              <span className="text-xs text-gray-500 font-medium">Eco Points</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{(profile?.eco_points || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-400">pts earned</p>
          </div>
          <div className="quick-stat">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame size={14} className="text-orange-500" />
              <span className="text-xs text-gray-500 font-medium">Streak</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{profile?.logging_streak || 0}</p>
            <p className="text-xs text-gray-400">days</p>
          </div>
          <div className="quick-stat">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-xs text-gray-500 font-medium">Total CO2</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{(profile?.total_co2_kg || 0).toFixed(1)}</p>
            <p className="text-xs text-gray-400">kg tracked</p>
          </div>
          <div className="quick-stat">
            <div className="flex items-center gap-1.5 mb-1">
              <Leaf size={14} className="text-green-600" />
              <span className="text-xs text-gray-500 font-medium">Dept</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{profile?.department || '—'}</p>
            <p className="text-xs text-gray-400">your dept</p>
          </div>
        </div>

        {/* STREAK BANNER */}
        {(profile?.logging_streak || 0) >= 3 && (
          <div className="card p-3 mb-4 flex items-center gap-3 animate-fade-in-up stagger-2" style={{ background: '#fef3c7', borderColor: '#fbbf24' }}>
            <span className="text-2xl">🔥</span>
            <div className="flex-1">
              <p className="font-semibold text-sm text-yellow-900">{profile.logging_streak}-day logging streak!</p>
              <p className="text-xs text-yellow-700">Keep it going for bonus points!</p>
            </div>
          </div>
        )}

        {/* MODULE GRID */}
        <div className="mb-4 animate-fade-in-up stagger-2">
          <h2 className="text-sm font-bold text-gray-700 mb-3">🌿 Campus Modules</h2>
          <div className="grid grid-cols-3 gap-2">
            {MODULE_TILES.map((tile, i) => (
              <button
                key={tile.path}
                onClick={() => navigate(tile.path)}
                className="module-tile animate-fade-in-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="module-tile-icon" style={{ background: tile.color }}>
                  <span>{tile.emoji}</span>
                </div>
                <span className="module-tile-label">{tile.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ECO TIP */}
        <div className="card p-4 animate-fade-in-up stagger-4" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderColor: '#86efac' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">💡</span>
            <div>
              <p className="text-xs font-bold text-green-700 mb-1">Eco Tip of the Day</p>
              <p className="text-sm text-green-900 leading-relaxed">{ECO_TIPS[tipIndex]}</p>
            </div>
          </div>
        </div>
      </div>

      <BottomTabBar />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Flame, Leaf, TrendingUp, Star, Award, Zap, Compass, Search, MessageSquare, Info, ShieldAlert, ArrowRight, ChevronRight, Sparkles } from 'lucide-react'
import { useAuthStore, useCarbonStore, useNotifStore } from '../../store/index'
import { supabase } from '../../lib/supabase'
import BottomTabBar from '../../components/BottomTabBar'
import EcoScoreRing from '../../components/EcoScoreRing'
import { motion } from 'framer-motion'

const MODULE_TILES = [
  { path: '/carbon/log', icon: Leaf, label: 'Carbon Log', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  { path: '/bus-tracking', icon: Compass, label: 'Bus Track', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)' },
  { path: '/carbon/history', icon: TrendingUp, label: 'Analytics', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
  { path: '/leaderboard', icon: Award, label: 'Leaderboard', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  { path: '/cafeteria', icon: Zap, label: 'Cafeteria', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
  { path: '/attendance', icon: Star, label: 'Attendance', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.1)' },
  { path: '/study-planner', icon: Star, label: 'Study AI', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  { path: '/lab-assistant', icon: Zap, label: 'Lab AI', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  { path: '/navigation', icon: Compass, label: 'Map', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
  { path: '/lost-found', icon: Search, label: 'Lost&Found', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
  { path: '/complaints', icon: ShieldAlert, label: 'Support', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  { path: '/chatbot', icon: MessageSquare, label: 'AI Chat', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)' },
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
  const firstName = profile?.full_name?.split(' ')[0] || 'Warrior'

  return (
    <main className="max-w-lg lg:max-w-7xl mx-auto">
      {/* HERO STATUS CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[40px] p-8 mb-8 border border-white/5 shadow-2xl"
        style={{
          background: hasLogged
            ? 'linear-gradient(135deg, rgba(6, 95, 70, 0.9), rgba(5, 150, 105, 0.9))'
            : 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
        }}
      >
        {/* Decorative pulse */}
        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full bg-green-500/10 blur-[60px]" />
        
        <div className="flex items-center justify-between gap-6 relative z-10">
          <div className="flex-1">
            <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4 ${
              hasLogged ? 'bg-white/20 text-white' : 'bg-green-500/20 text-green-400'
            }`}>
              {hasLogged ? 'Eco Goal: Active' : 'Daily Status'}
            </span>
            <h2 className="text-4xl font-black text-white mb-2 leading-none tracking-tighter">
              {score}%
            </h2>
            <p className={`text-xs mb-6 font-bold uppercase tracking-widest ${hasLogged ? 'text-white/70' : 'text-gray-500'}`}>
              Eco Efficiency
            </p>
            <p className={`text-xs mb-6 leading-relaxed font-medium ${hasLogged ? 'text-green-50/80' : 'text-gray-400'}`}>
              {hasLogged 
                ? `Saved ${todayLog.total_kg?.toFixed(1)}kg CO2 today. Maintain streak!` 
                : 'Start logging today\'s activities to boost your campus score.'}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(hasLogged ? '/carbon/history' : '/carbon/log')}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                hasLogged 
                  ? 'bg-white text-green-900' 
                  : 'bg-green-600 text-white shadow-xl shadow-green-600/20'
              }`}
            >
              {hasLogged ? 'Full Analytics' : 'Begin Carbon Log'} <ArrowRight size={14} />
            </motion.button>
          </div>
          <div className="relative flex-shrink-0">
            <EcoScoreRing
              score={score}
              size={110}
              strokeWidth={10}
              showLabel={false}
              animated={true}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf size={24} className={hasLogged ? 'text-white/40' : 'text-green-600/20'} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Star, value: (profile?.eco_points || 0).toLocaleString(), label: 'Points', color: 'text-yellow-500' },
          { icon: Flame, value: profile?.logging_streak || 0, label: 'Streak', color: 'text-orange-500' },
          { icon: Zap, value: (profile?.total_co2_kg || 0).toFixed(0), label: 'Saved', color: 'text-purple-500' },
          { icon: Info, value: profile?.department || 'CS', label: 'Dept', color: 'text-blue-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-4 text-center"
          >
            <div className={`flex justify-center mb-2 ${stat.color} opacity-80`}>
              <stat.icon size={16} />
            </div>
            <p className="text-sm font-black text-white leading-none mb-1.5">{stat.value}</p>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* MODULES SECTION */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-8 px-1">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Integrated Ecosystem</h3>
          <span className="flex-1 mx-4 h-[1px] bg-white/5" />
        </div>
        
        <div className="nexus-grid">
          {MODULE_TILES.map((feature, i) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(feature.path)}
              className="glass-card p-6 cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <feature.icon size={80} />
              </div>
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:rotate-12"
                style={{ backgroundColor: `${feature.color}15`, color: feature.color, border: `1px solid ${feature.color}30` }}
              >
                <feature.icon size={24} />
              </div>
              <h4 className="text-lg font-black text-white mb-2">{feature.label}</h4>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-relaxed opacity-60">
                 Active Node
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Access <ChevronRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI RECOMENDATION */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-[40px] bg-gradient-to-br from-green-600 to-green-900 relative overflow-hidden shadow-2xl shadow-green-900/40"
      >
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white/10 blur-[60px]" />
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">Neural Insight Active</span>
          </div>
          <h3 className="text-2xl font-black text-white mb-3">Eco Synthesis</h3>
          <p className="text-sm font-medium text-green-100/80 leading-relaxed mb-6">
            "{ECO_TIPS[tipIndex]}"
          </p>
          <button className="px-6 py-3 bg-white text-green-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-50 transition-all">
             Analyze Efficiency
          </button>
        </div>
      </motion.div>
    </main>
  )
}

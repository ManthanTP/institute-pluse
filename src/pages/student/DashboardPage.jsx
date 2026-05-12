import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Flame, Leaf, TrendingUp, Star, Award, Zap, Compass, Search, MessageSquare, Info, ShieldAlert, ArrowRight, ChevronRight, Sparkles, LayoutGrid, Target, Waves, Wind } from 'lucide-react'
import { useAuthStore, useCarbonStore, useNotifStore } from '../../store/index'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'

const MODULE_TILES = [
  { path: '/carbon/log', icon: Leaf, label: 'Carbon Log', color: '#22c55e' },
  { path: '/carbon/history', icon: TrendingUp, label: 'Analytics', color: '#0ea5e9' },
  { path: '/leaderboard', icon: Award, label: 'Leaderboard', color: '#f59e0b' },
  { path: '/cafeteria', icon: Zap, label: 'Cafeteria', color: '#f97316' },
  { path: '/attendance', icon: Star, label: 'Attendance', color: '#14b8a6' },
  { path: '/events', icon: Award, label: 'Events', color: '#a855f7' },
  { path: '/study-planner', icon: LayoutGrid, label: 'Study AI', color: '#8b5cf6' },
  { path: '/lab-assistant', icon: Wind, label: 'Lab AI', color: '#ef4444' },
  { path: '/navigation', icon: Compass, label: 'Campus Map', color: '#0ea5e9' },
  { path: '/lost-found', icon: Search, label: 'Lost & Found', color: '#64748b' },
  { path: '/complaints', icon: ShieldAlert, label: 'Support', color: '#dc2626' },
  { path: '/chatbot', icon: MessageSquare, label: 'AI Chat', color: '#0ea5e9' },
]

const ECO_TIPS = [
  '🚌 Sustainable transport saves 0.36kg CO2 per 5km.',
  '🥗 Plant-based meals reduce your footprint by 1kg/day.',
  '💡 Idle AC consumes 1.23kg CO2 hourly. Power down.',
  '🚿 Bucket baths optimize water usage by 85%.',
  '♻️ Systematic recycling reduces waste CO2 by 80%.',
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { todayLog, fetchTodayLog } = useCarbonStore()
  const [tipIndex] = useState(() => Math.floor(Math.random() * ECO_TIPS.length))

  useEffect(() => {
    if (profile?.id) {
      fetchTodayLog(profile.id)
    }
  }, [profile?.id])

  const hasLogged = !!todayLog
  const ecoScore = todayLog?.eco_score || 0

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-6">
        {/* HERO STATUS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[40px] p-8 mb-10 border border-white/5 shadow-2xl backdrop-blur-3xl"
          style={{
            background: hasLogged
              ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.4), rgba(6, 78, 59, 0.6))'
              : 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
          }}
        >
          <div className="flex items-center justify-between gap-6 relative z-10">
            <div className="flex-1">
              <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] mb-4 ${
                hasLogged ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'
              }`}>
                {hasLogged ? 'Protocol Active' : 'System Ready'}
              </span>
              <h2 className="text-4xl font-black text-white mb-2 leading-none tracking-tighter">
                {ecoScore}% <span className="text-sm font-black text-gray-500 uppercase tracking-widest ml-2">Efficiency</span>
              </h2>
              <p className="text-[10px] mb-8 leading-relaxed font-black text-gray-500 uppercase tracking-[0.1em]">
                {hasLogged 
                  ? `Eco-yield: ${todayLog.total_kg?.toFixed(2)}kg CO2 offset.` 
                  : 'Initialize daily log to synchronize ecosystem metrics.'}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(hasLogged ? '/carbon/history' : '/carbon/log')}
                className={`w-full py-4 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                  hasLogged 
                    ? 'bg-white text-slate-900 shadow-xl shadow-white/5' 
                    : 'bg-green-600 text-white shadow-xl shadow-green-600/20 hover:bg-green-500'
                }`}
              >
                {hasLogged ? 'Analyze Manifest' : 'Sync Daily Log'} <ArrowRight size={14} />
              </motion.button>
            </div>
            
            <div className="relative">
               <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-green-500/20 transition-all duration-1000" 
                    style={{ height: `${ecoScore}%` }} 
                  />
                  <Leaf size={24} className={hasLogged ? 'text-green-500' : 'text-gray-700'} />
               </div>
               {hasLogged && (
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
               )}
            </div>
          </div>
        </motion.div>

        {/* CORE TELEMETRY */}
        <div className="grid grid-cols-2 gap-4 mb-10">
           {[
             { label: 'Ecosystem XP', val: (profile?.eco_points || 0).toLocaleString(), icon: Sparkles, color: 'text-yellow-500' },
             { label: 'Active Streak', val: `${profile?.logging_streak || 0} Days`, icon: Flame, color: 'text-orange-500' },
             { label: 'Carbon Saved', val: `${(profile?.total_co2_kg || 0).toFixed(1)}kg`, icon: Zap, color: 'text-green-500' },
             { label: 'Registry Dept', val: profile?.department || 'Gen', icon: Target, color: 'text-blue-500' },
           ].map((stat, i) => (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="bg-white/5 border border-white/5 rounded-[32px] p-5 backdrop-blur-xl"
             >
                <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center ${stat.color} mb-3`}>
                   <stat.icon size={14} />
                </div>
                <p className="text-lg font-black text-white leading-none mb-1">{stat.val}</p>
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none">{stat.label}</p>
             </motion.div>
           ))}
        </div>

        {/* ECOSYSTEM NODES */}
        <section className="mb-10">
           <div className="flex items-center gap-3 mb-8">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Ecosystem Nodes</h3>
              <div className="flex-1 h-[1px] bg-white/5" />
           </div>
           
           <div className="grid grid-cols-3 gap-4">
              {MODULE_TILES.map((node, i) => (
                <motion.button
                  key={node.path}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(node.path)}
                  className="flex flex-col items-center gap-3 p-4 rounded-[28px] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                >
                   <div 
                     className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                     style={{ backgroundColor: `${node.color}15`, color: node.color, border: `1px solid ${node.color}25` }}
                   >
                      <node.icon size={20} />
                   </div>
                   <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">{node.label}</span>
                </motion.button>
              ))}
           </div>
        </section>

        {/* NEURAL TIP */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600/10 border border-blue-500/20 rounded-[32px] p-8 relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={48} className="text-blue-500" />
           </div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em]">Neural Insight Active</span>
              </div>
              <p className="text-[12px] font-medium text-white/80 leading-relaxed italic mb-6">
                 "{ECO_TIPS[tipIndex]}"
              </p>
              <button className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 hover:text-blue-300 transition-colors">
                 Synchronize Efficiency Protocol <ChevronRight size={12} />
              </button>
           </div>
        </motion.div>
      </div>
    </div>
  )
}

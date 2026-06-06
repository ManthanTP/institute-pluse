import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Flame, Leaf, TrendingUp, Star, Award, Zap, Compass, Search, MessageSquare, Info, ShieldAlert, ArrowRight, ChevronRight, Sparkles, LayoutGrid, Target, Waves, Wind, User, Megaphone, HelpCircle, BookOpen } from 'lucide-react'
import { useAuthStore, useCarbonStore, useNotifStore } from '../../store/index'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'


const MODULE_TILES = [
  { path: '/carbon/log', icon: Leaf, label: 'Carbon Log', color: '#22c55e' },
  { path: '/carbon/history', icon: TrendingUp, label: 'Analytics', color: '#0ea5e9' },
  { path: '/leaderboard', icon: Award, label: 'Leaderboard', color: '#f59e0b' },
  { path: '/cafeteria', icon: Zap, label: 'Cafeteria', color: '#f97316' },
  { path: '/attendance', icon: Star, label: 'Attendance', color: '#14b8a6' },
  { path: '/events', icon: Award, label: 'Events', color: '#a855f7' },
  { path: '/announcements', icon: Megaphone, label: 'Broadcasts', color: '#f97316' },
  { path: '/study-planner', icon: LayoutGrid, label: 'Objectives', color: '#8b5cf6' },
  { path: '/navigation', icon: Compass, label: 'Campus Map', color: '#0ea5e9' },
  { path: '/lost-found', icon: Search, label: 'Lost & Found', color: '#64748b' },
  { path: '/complaints', icon: ShieldAlert, label: 'Support', color: '#dc2626' },
  { path: '/resources', icon: BookOpen, label: 'Resource Hub', color: '#3b82f6' },
  { path: '/help', icon: HelpCircle, label: 'Help', color: '#6366f1' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { todayLog, fetchTodayLog } = useCarbonStore()
  const [activeSession, setActiveSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return

    async function loadDashboardData() {
      try {
        await Promise.all([
          fetchTodayLog(profile.id),
          fetchActiveSession()
        ])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()

    // Real-time profile updates
    const profileSub = supabase
      .channel(`profile_${profile.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${profile.id}` }, (p) => {
        useAuthStore.getState().setProfile(p.new)
      })
      .subscribe()

    // Real-time attendance updates
    const notifSub = supabase
      .channel(`dashboard_notifs_${profile.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'student_notifications',
        filter: `student_id=eq.${profile.id}`
      }, () => fetchActiveSession())
      .subscribe()

    return () => { 
      supabase.removeChannel(profileSub)
      supabase.removeChannel(notifSub)
    }
  }, [profile?.id])

  async function fetchActiveSession() {
    if (!profile?.division_id) return
    const { data } = await supabase
      .from('attendance_sessions')
      .select('*, academic_classrooms(name)')
      .eq('division_id', profile.division_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data && new Date(data.expires_at) > new Date()) {
      setActiveSession(data)
    } else {
      setActiveSession(null)
    }
  }


  const hasLogged = !!todayLog
  const ecoScore = todayLog?.eco_score || 0

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Pulse Core...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-1">InstitutePulse Node Active</p>
               <h1 className="text-xl font-black text-white tracking-tighter">Welcome, {profile?.full_name?.split(' ')[0]}</h1>
            </div>
           <button 
             onClick={() => navigate('/profile')}
             className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
           >
              <User size={20} />
           </button>
        </div>

        {/* ACTIVE SESSION ALERT */}
        <AnimatePresence>
           {activeSession && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-r from-blue-600 to-indigo-600 border border-white/20 shadow-xl"
              >
                 <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none"><Zap size={80} /></div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                       <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                       <span className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Live Class Protocol</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                       <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight italic">{activeSession.subject}</h3>
                          <p className="text-[10px] text-blue-100 font-black uppercase tracking-widest mt-1">
                             Venue: {activeSession.academic_classrooms?.name || 'Manual'} • {activeSession.session_type}
                          </p>
                       </div>
                       <button 
                         onClick={() => navigate('/attendance')}
                         className="px-6 py-3 bg-white text-blue-600 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                       >
                          Join Terminal
                       </button>
                    </div>
                 </div>
              </motion.div>
           )}
        </AnimatePresence>

        {/* STREAK BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-r from-orange-600/10 to-red-600/10 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.08)] flex items-center justify-between mb-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(249,115,22,0.15),transparent_60%)]" />
          <div className="flex items-center gap-4 relative z-10">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            >
              <Flame size={24} className="text-orange-500 fill-orange-500" />
            </motion.div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Active Logging Streak</h3>
              <p className="text-[9px] text-orange-400 font-bold uppercase tracking-wider mt-0.5">Keep uploading daily to boost Eco XP</p>
            </div>
          </div>
          <div className="text-right relative z-10">
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.2)]">
              {profile?.logging_streak || 0} Days
            </span>
          </div>
        </motion.div>

        {/* HERO STATUS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[40px] p-8 mb-10 border border-white/5 shadow-2xl backdrop-blur-3xl"
          style={{
            background: hasLogged
              ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.2), rgba(6, 78, 59, 0.4))'
              : 'linear-gradient(135deg, rgba(30, 41, 59, 0.2), rgba(15, 23, 42, 0.4))',
          }}
        >
          {/* Inner highlights */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.03),transparent_50%)]" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex-1 w-full sm:w-auto">
              <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] mb-4 ${
                hasLogged ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'
              }`}>
                {hasLogged ? 'Protocol Active' : 'System Ready'}
              </span>
              <h2 className="text-4xl font-black text-white mb-2 leading-none tracking-tighter flex items-center gap-3">
                {ecoScore}% 
                <div className="group relative">
                   <Info size={14} className="text-gray-500 hover:text-white cursor-help transition-colors" />
                   <div className="absolute left-0 top-full mt-4 w-60 p-4 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-2">Efficiency Rating</p>
                      <p className="text-[10px] font-medium text-gray-400 leading-relaxed normal-case">
                         Calculated based on your daily sustainable actions, event participation, and digital footprint reduction. Higher scores yield more ECO XP.
                      </p>
                   </div>
                </div>
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
                    ? 'bg-white text-slate-900 shadow-xl shadow-white/5 hover:bg-slate-100' 
                    : 'bg-green-600 text-white shadow-xl shadow-green-600/20 hover:bg-green-500'
                }`}
              >
                {hasLogged ? 'Analyze Manifest' : 'Sync Daily Log'} <ArrowRight size={14} />
              </motion.button>
            </div>
            
            {/* SVG Conic Progress Ring */}
            <div className="relative flex items-center justify-center w-28 h-28">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  className="stroke-white/5"
                  strokeWidth="8"
                  fill="transparent"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke={hasLogged ? '#22c55e' : '#475569'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 46}
                  initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - ecoScore / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round"
                  className={hasLogged ? "drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" : ""}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Leaf size={24} className={hasLogged ? 'text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'text-gray-600'} />
                {hasLogged && (
                  <span className="text-[10px] font-black text-green-400 mt-1 uppercase tracking-widest">{ecoScore}%</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CORE TELEMETRY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
           {[
             { label: 'Ecosystem XP', val: (profile?.eco_points || 0).toLocaleString(), icon: Sparkles, color: 'text-yellow-500' },
             { label: 'Registry USN', val: profile?.usn || 'N/A', icon: User, color: 'text-indigo-500' },
             { label: 'Carbon Saved', val: `${(profile?.total_co2_kg || 0).toFixed(1)}kg`, icon: Zap, color: 'text-green-500' },
             { label: 'Registry Node', val: `${profile?.department || 'Gen'} • ${profile?.semester_id ? 'Sem' : 'N/A'}`, icon: Target, color: 'text-blue-500' },
           ].map((stat, i) => (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 group"
             >
                <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center ${stat.color} mb-3 group-hover:scale-110 transition-transform`}>
                   <stat.icon size={14} />
                </div>
                <p className="text-lg font-black text-white leading-none mb-1 truncate">{stat.val}</p>
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
           
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {MODULE_TILES.map((node, i) => {
                const isFeatured = ['Carbon Log', 'Attendance', 'Cafeteria'].includes(node.label);
                const subLabel = 
                  node.label === 'Carbon Log' ? 'Track daily offset & footprints' :
                  node.label === 'Attendance' ? 'Log class presence & logs' :
                  node.label === 'Cafeteria' ? 'Pre-order food & track status' : '';

                return (
                  <motion.button
                    key={node.path}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(node.path)}
                    className={`relative overflow-hidden rounded-[28px] bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 p-6 flex text-left ${
                      isFeatured 
                        ? 'col-span-2 flex-row items-center justify-between gap-4 shadow-[0_4px_20px_rgba(255,255,255,0.02)]' 
                        : 'col-span-1 flex-col items-start justify-between gap-6 min-h-[140px]'
                    }`}
                  >
                    <div className={`flex ${isFeatured ? 'flex-row items-center gap-4' : 'flex-col gap-4'}`}>
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                        style={{ 
                          backgroundColor: `${node.color}15`, 
                          color: node.color, 
                          border: `1px solid ${node.color}25`,
                          boxShadow: `0 0 15px ${node.color}15`
                        }}
                      >
                         <node.icon size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block">{node.label}</span>
                        {isFeatured && (
                          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block mt-1">{subLabel}</span>
                        )}
                      </div>
                    </div>
                    {isFeatured && (
                      <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                    )}
                  </motion.button>
                );
              })}
           </div>
        </section>


      </div>
    </div>
  )
}

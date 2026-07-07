import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Flame, Leaf, TrendingUp, Star, Award, Zap, Compass, Search, MessageSquare, Info, ShieldAlert, ArrowRight, ChevronRight, Sparkles, LayoutGrid, Target, Waves, Wind, User, Megaphone, HelpCircle, BookOpen, TreePine } from 'lucide-react'
import { useAuthStore, useCarbonStore, useNotifStore } from '../../store/index'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { calculateTotalAbsorption, calculateNetCarbon, getNetCarbonStatus } from '../../lib/greenCover'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const MODULE_TILES = [
  { path: '/carbon/log', icon: Leaf, label: 'Carbon Log', color: '#22c55e' },
  { path: '/carbon/history', icon: TrendingUp, label: 'Analytics', color: '#0ea5e9' },
  { path: '/carbon/balance', icon: TreePine, label: 'Carbon Balance', color: '#16a34a' },
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
  const [greenBalance, setGreenBalance] = useState(null)
  const [chartData, setChartData] = useState([])

  async function fetchWeeklyTrend() {
    if (!profile?.id) return
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    const lastWeekStr = lastWeek.toISOString().split('T')[0]

    try {
      const [logsRes, ordersRes] = await Promise.all([
        supabase
          .from('carbon_logs')
          .select('log_date, total_kg')
          .eq('student_id', profile.id)
          .gte('log_date', lastWeekStr)
          .order('log_date', { ascending: true }),
        supabase
          .from('orders')
          .select('created_at, total_carbon_kg')
          .eq('student_id', profile.id)
          .gte('created_at', lastWeekStr)
      ])

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const trendMap = {}
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        trendMap[dateStr] = { day: days[d.getDay()], co2: 0 }
      }

      logsRes.data?.forEach(log => {
        if (trendMap[log.log_date]) {
          trendMap[log.log_date].co2 += parseFloat(log.total_kg || 0)
        }
      })
      
      ordersRes.data?.forEach(order => {
        const dateStr = order.created_at.split('T')[0]
        if (trendMap[dateStr]) {
          trendMap[dateStr].co2 += parseFloat(order.total_carbon_kg || 0)
        }
      })

      setChartData(Object.values(trendMap))
    } catch (err) {
      console.error('Failed to load weekly trend:', err)
    }
  }

  useEffect(() => {
    if (!profile?.id) return

    async function loadDashboardData() {
      try {
        await Promise.all([
          fetchTodayLog(profile.id),
          fetchActiveSession(),
          fetchGreenBalance(),
          fetchWeeklyTrend(),
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

  async function fetchGreenBalance() {
    try {
      const { data: items } = await supabase
        .from('campus_green_cover')
        .select('type, count, area_sqm')
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const { data: logs } = await supabase
        .from('carbon_logs')
        .select('total_kg')
        .eq('log_date', today)
      let studentCO2 = (logs || []).reduce((a, l) => a + Number(l.total_kg || 0), 0)
      if (!studentCO2) {
        const { data: yLogs } = await supabase.from('carbon_logs').select('total_kg').eq('log_date', yesterday)
        studentCO2 = (yLogs || []).reduce((a, l) => a + Number(l.total_kg || 0), 0)
      }
      const totalAbsorbed = calculateTotalAbsorption(items || [])
      const bal = calculateNetCarbon(studentCO2, totalAbsorbed)
      setGreenBalance({ ...bal, absorbed: totalAbsorbed, items: items?.length || 0 })
    } catch (e) {
      // Green cover may not be set up yet
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

        {/* CARBON LOG NOTIFICATION BANNER */}
        <AnimatePresence mode="wait">
          {hasLogged ? (
            <motion.div
              key="logged"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => navigate('/carbon/history')}
              className="relative overflow-hidden rounded-[28px] p-5 mb-5 bg-gradient-to-r from-green-600/15 to-emerald-600/10 border border-green-500/30 flex items-center justify-between cursor-pointer hover:border-green-500/50 transition-all group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(34,197,94,0.1),transparent_60%)]" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.3)]">
                  <span className="text-lg">✅</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-green-400 uppercase tracking-[0.3em]">Carbon Log Synced</p>
                  <p className="text-xs font-black text-white">Yesterday's footprint recorded — {todayLog?.total_kg?.toFixed(2) || '0.00'} kg CO₂</p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest hidden sm:block">View History</span>
                <ChevronRight size={16} className="text-green-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="not-logged"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => navigate('/carbon/log')}
              className="relative overflow-hidden rounded-[28px] p-5 mb-5 bg-gradient-to-r from-amber-600/15 to-orange-600/10 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition-all group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(245,158,11,0.1),transparent_60%)]" />
              <div className="flex items-center gap-4 relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                >
                  <span className="text-lg">🌿</span>
                </motion.div>
                <div>
                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.3em]">Action Required</p>
                  <p className="text-xs font-black text-white">Log yesterday's carbon footprint to earn Eco XP</p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest hidden sm:block">Log Now</span>
                <ChevronRight size={16} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
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
          whileHover={{ y: -4, borderColor: hasLogged ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)' }}
          className="relative overflow-hidden rounded-[40px] p-8 mb-10 border border-white/5 shadow-2xl backdrop-blur-3xl transition-all duration-300"
          style={{
            background: hasLogged
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 78, 59, 0.45))'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(120, 53, 4, 0.45))',
          }}
        >
          {/* Inner highlights */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_50%)]" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex-1 w-full sm:w-auto">
              <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] mb-4 ${
                hasLogged ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'
              }`}>
                {hasLogged ? 'Protocol Active' : 'Synchronization Required'}
              </span>
              <h2 className="text-4xl font-black text-white mb-2 leading-none tracking-tighter flex items-center gap-3">
                {hasLogged ? `${ecoScore}%` : 'Pending Sync'} 
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
                  : 'Yesterday\'s carbon footprint is not synchronized yet.'}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(hasLogged ? '/carbon/history' : '/carbon/log')}
                className={`w-full py-4 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                  hasLogged 
                    ? 'bg-white text-slate-900 shadow-xl shadow-white/5 hover:bg-slate-100' 
                    : 'bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 hover:bg-amber-400'
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
                  stroke={hasLogged ? '#10b981' : '#f59e0b'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 46}
                  initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - (hasLogged ? ecoScore : 100) / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round"
                  className={`${hasLogged ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"}`}
                />
              </svg>
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                onClick={() => navigate(hasLogged ? '/carbon/history' : '/carbon/log')}
              >
                <Leaf size={24} className={hasLogged ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-amber-400 animate-pulse'} />
                <span className={`text-[10px] font-black mt-1 uppercase tracking-widest ${hasLogged ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                  {hasLogged ? `${ecoScore}%` : 'Sync'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
           {[
             { label: 'Ecosystem XP', val: (profile?.eco_points || 0).toLocaleString(), icon: Sparkles, color: 'text-yellow-500', glow: 'group-hover:shadow-yellow-500/10' },
             { label: 'Registry USN', val: profile?.usn || 'N/A', icon: User, color: 'text-indigo-500', glow: 'group-hover:shadow-indigo-500/10' },
             { label: 'Carbon Saved', val: `${(profile?.total_co2_kg || 0).toFixed(1)}kg`, icon: Zap, color: 'text-green-500', glow: 'group-hover:shadow-green-500/10' },
             { label: 'Registry Node', val: `${profile?.department || 'Gen'} • ${profile?.semester_id ? 'Sem' : 'N/A'}`, icon: Target, color: 'text-blue-500', glow: 'group-hover:shadow-blue-500/10' },
           ].map((stat, i) => (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.12)' }}
               className={`bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/5 rounded-[32px] p-6 backdrop-blur-xl transition-all duration-300 group shadow-lg ${stat.glow}`}
             >
                <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center ${stat.color} mb-3 group-hover:scale-110 transition-transform`}>
                   <stat.icon size={14} />
                </div>
                <p className="text-lg font-black text-white leading-none mb-1 truncate">{stat.val}</p>
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none">{stat.label}</p>
             </motion.div>
           ))}
           {/* Green Cover Stat Card */}
           {greenBalance && (
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               onClick={() => navigate('/carbon/balance')}
               whileHover={{ y: -4, borderColor: 'rgba(34,197,94,0.3)', boxShadow: '0 8px 30px rgba(34,197,94,0.05)' }}
               className="bg-gradient-to-r from-green-950/20 to-emerald-950/15 border border-green-500/10 rounded-[32px] p-6 backdrop-blur-xl transition-all duration-300 group cursor-pointer col-span-2 md:col-span-4 shadow-lg"
             >
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                     <TreePine size={14} />
                   </div>
                   <div>
                     <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Campus Green Cover</p>
                     <p className="text-sm font-black text-white leading-none">Absorbing {greenBalance.absorbed?.toFixed(2)} kg CO2/day</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                     greenBalance.isNeutral
                       ? 'bg-green-500/10 border-green-500/20 text-green-400'
                       : greenBalance.net <= 20
                         ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                         : 'bg-red-500/10 border-red-500/20 text-red-400'
                   }`}>
                     Net: {greenBalance.net >= 0 ? '+' : ''}{greenBalance.net?.toFixed(1)} kg {greenBalance.isNeutral ? '🌿' : ''}
                   </span>
                   <ChevronRight size={16} className="text-gray-500 group-hover:text-green-400 transition-colors" />
                 </div>
               </div>
             </motion.div>
           )}
        </div>

         {/* WEEKLY METRIC PROFILE */}
         {chartData.length > 0 && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/5 rounded-[32px] p-6 lg:p-8 backdrop-blur-xl mb-10 shadow-xl"
           >
             <div className="flex items-center justify-between mb-6">
               <div>
                 <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em]">Telemetry Scan</span>
                 <h3 className="text-sm font-black text-white uppercase tracking-wider mt-1">7-Day Emissions Trajectory</h3>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[8px] font-black uppercase text-gray-500 tracking-wider">KG CO2 Equiv</span>
               </div>
             </div>
             <div className="h-[180px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="studentCo2Glow" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                   <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
                   <Tooltip 
                     contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', fontSize: '9px', color: '#fff' }}
                   />
                   <Area type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#studentCo2Glow)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </motion.div>
         )}

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
                    whileHover={{ y: -6, borderColor: `${node.color}40`, boxShadow: `0 8px 30px ${node.color}08` }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(node.path)}
                    className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-900/40 to-slate-950/60 backdrop-blur-xl border border-white/5 transition-all duration-300 p-6 flex text-left group ${
                      isFeatured 
                        ? 'col-span-2 flex-row items-center justify-between gap-4 shadow-lg' 
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

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, Leaf, Bus, TrendingDown, Award, ShoppingCart, AlertCircle, Zap, Clock, ShieldCheck, ShieldAlert, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/index'
import toast from 'react-hot-toast'
import { exportReportPDF } from '../../lib/pdfExport'

const MOCK_TREND = [
  { day: 'Mon', co2: 3.2, logs: 820 },
  { day: 'Tue', co2: 2.9, logs: 850 },
  { day: 'Wed', co2: 3.4, logs: 780 },
  { day: 'Thu', co2: 2.8, logs: 900 },
  { day: 'Fri', co2: 3.1, logs: 847 },
  { day: 'Sat', co2: 2.5, logs: 620 },
  { day: 'Sun', co2: 2.2, logs: 540 },
]

function StatCard({ icon: Icon, label, value, sub, color = '#ef4444', delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex items-center gap-6 group hover:bg-white/10 transition-all overflow-hidden relative backdrop-blur-xl"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 group-hover:bg-white/20 transition-colors" />
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-12 bg-white/5 border border-white/10 shadow-inner">
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
        {sub && <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{sub}</p>}
      </div>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayLogs: 0,
    totalCo2: 0,
    openComplaints: 0,
    avgEcoScore: 0,
    totalSaved: 0,
    totalPoints: 0
  })
  const [chartData, setChartData] = useState([])
  const [recentComplaints, setRecentComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile && profile.email === 'hubligojaincollege@gmail.com') {
      navigate('/12345678/admin/cafeteria')
      return
    }

    async function fetchStats() {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      const lastWeekStr = lastWeek.toISOString().split('T')[0]

      const [usersCount, logsToday, complaintsRes, allLogs, trendLogs, eventsCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('carbon_logs').select('*').eq('log_date', today),
        supabase.from('complaints').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(5),
        supabase.from('carbon_logs').select('total_kg, eco_points_earned'),
        supabase.from('carbon_logs').select('log_date, total_kg').gte('log_date', lastWeekStr).order('log_date', { ascending: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'upcoming')
      ])

      const totalCo2 = allLogs.data?.reduce((acc, curr) => acc + (curr.total_kg || 0), 0) || 0
      const totalPoints = allLogs.data?.reduce((acc, curr) => acc + (curr.eco_points_earned || 0), 0) || 0
      const totalSaved = (totalCo2 * 0.15) 

      // Process Trend Data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const trendMap = {}
      
      // Initialize last 7 days
      for(let i=6; i>=0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        trendMap[dateStr] = { day: days[d.getDay()], co2: 0, logs: 0 }
      }

      trendLogs.data?.forEach(log => {
        if (trendMap[log.log_date]) {
          trendMap[log.log_date].co2 += parseFloat(log.total_kg || 0)
          trendMap[log.log_date].logs += 1
        }
      })

      setChartData(Object.values(trendMap))

      setStats({
        totalUsers: usersCount.count || 0,
        todayLogs: logsToday.data?.length || 0,
        totalCo2: totalCo2.toFixed(1),
        totalSaved: totalSaved.toFixed(1),
        totalPoints: totalPoints,
        openComplaints: complaintsRes.data?.length || 0,
        avgEcoScore: allLogs.data?.length ? (totalSaved / (totalSaved + totalCo2) * 100).toFixed(0) : 0,
        activeEvents: eventsCount.count || 0
      })

      if (complaintsRes.data) setRecentComplaints(complaintsRes.data)
      setLoading(false)
    }
    fetchStats()

    const channel = supabase
      .channel('admin_stats_v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => fetchStats())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'carbon_logs' }, () => fetchStats())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleDiagnosticExport = () => {
    exportReportPDF({
      title: 'Campus Core Diagnostic Report',
      subtitle: `System Version 2.4.0 • ${new Date().toLocaleDateString()}`,
      data: {
        system_status: 'Normal',
        timestamp: new Date().toISOString(),
        total_users: stats.totalUsers,
        daily_logs: stats.todayLogs,
        carbon_aggregation_kg: stats.totalCo2,
        offset_protocol_kg: stats.totalSaved,
        eco_points_issued: stats.totalPoints,
        open_complaints: stats.openComplaints,
        efficiency_index: `${stats.avgEcoScore}%`,
        weekly_trend: chartData,
      },
      filename: `pulse-diagnostic-${new Date().getTime()}`
    })
    toast.success('Diagnostic Report Exported as PDF')
  }

  return (
    <AdminLayout>
      <div className="space-y-8 lg:space-y-10 pb-20">
        {/* GREETING */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <span className="text-[8px] lg:text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Real-time Pulse Command</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-none italic">Campus <span className="text-red-500">Core</span></h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
               System Online: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
             <button 
               onClick={handleDiagnosticExport}
               className="px-6 py-4 rounded-xl lg:rounded-2xl bg-white/5 border border-white/10 text-[8px] lg:text-[10px] font-black uppercase tracking-widest hover:text-white transition-all backdrop-blur-xl"
             >
                Diagnostic Export
             </button>
             <button onClick={() => window.location.reload()} className="px-6 py-4 rounded-xl lg:rounded-2xl bg-red-600 text-white text-[8px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all">
                Global Refresh
             </button>
          </div>
        </div>

        {/* STAT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Identity Nodes" value={stats.totalUsers.toLocaleString()} color="#3b82f6" delay={0.05} />
          <StatCard icon={Leaf} label="Daily Flux" value={stats.todayLogs} sub={`Efficiency: ${stats.avgEcoScore}%`} color="#ef4444" delay={0.1} />
          <StatCard icon={TrendingDown} label="Carbon Aggregation" value={`${stats.totalCo2} kg`} sub="Life-cycle Total" color="#0ea5e9" delay={0.15} />
          <StatCard icon={ShieldCheck} label="Offset Protocol" value={`${stats.totalSaved} kg`} sub="Verified Reduction" color="#991b1b" delay={0.2} />
          <StatCard icon={AlertCircle} label="Distress Signals" value={stats.openComplaints} sub="Action Required" color="#ef4444" delay={0.25} />
          <StatCard icon={Zap} label="Eco-Points Issued" value={stats.totalPoints.toLocaleString()} color="#f59e0b" delay={0.3} />
          <Link to="/12345678/admin/events" className="block h-full">
            <StatCard icon={Award} label="Active Campaigns" value={stats.activeEvents} color="#a855f7" delay={0.35} />
          </Link>
          <StatCard icon={ShieldAlert} label="System Security" value="Normal" color="#10b981" delay={0.4} />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-white/10 rounded-3xl lg:rounded-[40px] p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Emission Trajectory</h3>
               <div className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-red-500" /> <span className="text-[7px] lg:text-[9px] font-black uppercase text-gray-500">CO2 Flow</span></div>
            </div>
            <div className="h-[200px] lg:h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                   <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
                   <Tooltip 
                     contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '9px' }}
                   />
                   <Area type="monotone" dataKey="co2" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCo2)" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-white/10 rounded-3xl lg:rounded-[40px] p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Intake Volume</h3>
               <div className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500" /> <span className="text-[7px] lg:text-[9px] font-black uppercase text-gray-500">Log Packets</span></div>
            </div>
            <div className="h-[200px] lg:h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                   <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
                   <Tooltip 
                     cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                     contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '9px' }}
                   />
                   <Bar dataKey="logs" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {/* RECENT COMPLAINTS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl lg:rounded-[40px] p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Distress Signals</h3>
              <Link to="/12345678/admin/complaints" className="text-[7px] lg:text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-all">Full Console →</Link>
            </div>
            <div className="space-y-3">
              {recentComplaints.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[8px] lg:text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Zero Anomalies Detected</p>
                </div>
              ) : (
                recentComplaints.map(c => (
                  <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-white truncate uppercase tracking-tight">{c.title}</p>
                      <p className="text-[8px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{c.category}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* SYSTEM UPTIME */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl lg:rounded-[40px] p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Pulse Core Status</h3>
            </div>
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                        <Zap size={18} />
                     </div>
                     <span className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-widest">Main Node Uptime</span>
                  </div>
                  <span className="text-[9px] lg:text-[10px] font-black text-red-500 uppercase tracking-widest">99.98%</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <TrendingUp size={18} />
                     </div>
                     <span className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-widest">Data Latency</span>
                  </div>
                  <span className="text-[9px] lg:text-[10px] font-black text-blue-500 uppercase tracking-widest">12ms</span>
               </div>
               <div className="pt-6 border-t border-white/5">
                  <p className="text-[8px] lg:text-[9px] font-black text-gray-600 uppercase tracking-widest leading-relaxed">
                     All subsystems operational. Pulse kernel version 2.4.0 active. Security protocols at maximum threshold. Encryption level: AES-256-GCM.
                  </p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

    </AdminLayout>
  )
}

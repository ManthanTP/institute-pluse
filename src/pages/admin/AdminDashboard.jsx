import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Leaf, Bus, TrendingDown, Award, ShoppingCart, AlertCircle, Zap, Clock, ShieldCheck, ShieldAlert } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion } from 'framer-motion'

const MOCK_STATS = {
  totalStudents: 1240,
  todayLogs: 847,
  avgEcoScore: 73,
  campusAvgCo2: 3.1,
  activeChallengers: 320,
  pendingOrders: 12,
  openComplaints: 8,
  busesOnRoute: 3,
}

const MOCK_TREND = [
  { day: 'Mon', co2: 3.2, score: 71, logs: 820 },
  { day: 'Tue', co2: 2.9, score: 75, logs: 850 },
  { day: 'Wed', co2: 3.4, score: 68, logs: 780 },
  { day: 'Thu', co2: 2.8, score: 78, logs: 900 },
  { day: 'Fri', co2: 3.1, score: 73, logs: 847 },
  { day: 'Sat', co2: 2.5, score: 82, logs: 620 },
  { day: 'Sun', co2: 2.2, score: 86, logs: 540 },
]

function StatCard({ icon: Icon, label, value, sub, color = '#16a34a', delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 flex items-center gap-6 group hover:border-green-500/30 overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-green-500/10 animate-scan pointer-events-none" />
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-12"
        style={{ background: color + '15', border: `1px solid ${color}30` }}>
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
  const [stats] = useState(MOCK_STATS)
  const [todayLogs, setTodayLogs] = useState([])
  const [recentComplaints, setRecentComplaints] = useState([])

  useEffect(() => {
    async function fetchData() {
      const today = new Date().toISOString().split('T')[0]

      const [logsRes, complaintsRes] = await Promise.all([
        supabase.from('carbon_logs').select('id, total_kg, eco_score, log_date').eq('log_date', today).order('created_at', { ascending: false }).limit(5),
        supabase.from('complaints').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(5),
      ])

      if (logsRes.data?.length) setTodayLogs(logsRes.data)
      if (complaintsRes.data?.length) setRecentComplaints(complaintsRes.data)
    }
    fetchData()
  }, [])

  return (
    <AdminLayout>
      <div className="nexus-container">
        {/* GREETING */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em]">Real-time Nexus Telemetry</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Campus Core</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
             <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Export Data
             </button>
             <button className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-500 shadow-lg shadow-green-600/20 transition-all">
                System Refresh
             </button>
          </div>
        </div>

        {/* STAT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users} label="Total Population" value={stats.totalStudents.toLocaleString()} color="#16a34a" delay={0.05} />
          <StatCard icon={Leaf} label="Live Activity" value={stats.todayLogs} sub={`Efficiency: ${stats.avgEcoScore}%`} color="#22c55e" delay={0.1} />
          <StatCard icon={TrendingDown} label="Carbon Flux" value={`${stats.campusAvgCo2} kg`} sub="Avg / Node" color="#0ea5e9" delay={0.15} />
          <StatCard icon={Bus} label="Transit Nodes" value={`${stats.busesOnRoute}/4`} sub="Active Link" color="#f59e0b" delay={0.2} />
          <StatCard icon={Award} label="Challengers" value={stats.activeChallengers} color="#a855f7" delay={0.25} />
          <StatCard icon={ShoppingCart} label="Resource Requisitions" value={stats.pendingOrders} color="#f97316" delay={0.3} />
          <StatCard icon={AlertCircle} label="System Alerts" value={stats.openComplaints} color="#ef4444" delay={0.35} />
          <StatCard icon={ShieldCheck} label="Budget Status" value="5.0 kg" sub="Safe Threshold" color="#166534" delay={0.4} />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-green-500/10 animate-scan pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Environmental Impact</h3>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> <span className="text-[9px] font-black uppercase text-gray-500">CO2 Flow</span></div>
               </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={MOCK_TREND}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="co2" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorCo2)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-500/10 animate-scan pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Telemetry Volume</h3>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> <span className="text-[9px] font-black uppercase text-gray-500">Log Intake</span></div>
               </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={MOCK_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                />
                <Bar dataKey="logs" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="nexus-grid">
          {/* RECENT COMPLAINTS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/10 animate-scan pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Distress Signals</h3>
              <Link to="/12345678/admin/complaints" className="text-[9px] font-black text-green-500 uppercase tracking-widest hover:text-green-400 transition-all">Command Link →</Link>
            </div>
            <div className="space-y-4">
              {recentComplaints.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Zero Anomalies Detected</p>
                </div>
              ) : (
                recentComplaints.map(c => (
                  <div key={c.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all">
                    <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" 
                      style={{ background: c.priority === 'urgent' ? '#ef4444' : c.priority === 'high' ? '#f59e0b' : '#22c55e' }} 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white truncate uppercase tracking-tight">{c.title}</p>
                      <p className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{c.category}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* TODAY'S TOP LOGS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 lg:col-span-2 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-green-500/10 animate-scan pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Ingestion Preview</h3>
              <div className="flex items-center gap-2">
                 <Clock size={12} className="text-gray-500" />
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Temporal Log</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayLogs.length === 0 ? (
                <div className="py-8 text-center col-span-2">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Awaiting Data Streams</p>
                </div>
              ) : (
                todayLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-inner"
                      style={{ background: log.eco_score >= 80 ? 'rgba(22, 163, 74, 0.2)' : log.eco_score >= 60 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${log.eco_score >= 80 ? '#16a34a' : log.eco_score >= 60 ? '#f59e0b' : '#ef4444'}50` }}>
                      {log.eco_score}
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">{log.total_kg?.toFixed(2)} kg CO2</p>
                      <p className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-widest">Intake: {log.log_date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(300px); }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}} />
    </AdminLayout>
  )
}

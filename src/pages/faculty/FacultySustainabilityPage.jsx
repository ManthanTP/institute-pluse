import { useState, useEffect } from 'react'
import { Leaf, TrendingDown, TrendingUp, Zap, Wind, Droplets, Target, ShieldCheck, Download, Calendar, Filter, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { exportReportPDF, exportTablePDF } from '../../lib/pdfExport'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7']

export default function FacultySustainabilityPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalCo2: 0, totalSaved: 0, activeUsers: 0, avgEfficiency: 0 })
  const [deptData, setDeptData] = useState([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      const { data: logsData } = await supabase
        .from('carbon_logs')
        .select('*, profiles(department)')
        .order('log_date', { ascending: false })

      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      
      if (logsData && logsData.length > 0) {
        setLogs(logsData)
        const totalCo2 = logsData.reduce((acc, curr) => acc + (curr.total_kg || 0), 0)
        const totalSaved = (totalCo2 * 0.15) 
        
        setStats({
          totalCo2: totalCo2.toFixed(1),
          totalSaved: totalSaved.toFixed(1),
          activeUsers: usersCount || 0,
          avgEfficiency: ((totalSaved / (totalSaved + totalCo2)) * 100 || 0).toFixed(1)
        })

        // Process Department Data
        const deptMap = {}
        logsData.forEach(log => {
          const dept = log.profiles?.department || 'General'
          if (!deptMap[dept]) deptMap[dept] = { name: dept, value: 0 }
          deptMap[dept].value += 1
        })
        setDeptData(Object.values(deptMap))
      } else {
        // Use sample data
        setLogs([])
        setStats({ totalSaved: 0, participationRate: 0, activeChallenges: 0 })
        setDeptData([])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleGenerateReport = () => {
    exportReportPDF({
      title: 'Sustainability Impact Report',
      subtitle: `Campus-wide Environmental Analysis • ${new Date().toLocaleDateString()}`,
      data: {
        cumulative_co2_flux: `${stats.totalCo2} kg`,
        offset_protocol: `${stats.totalSaved} kg`,
        ecosystem_nodes: stats.activeUsers,
        efficiency_index: `${stats.avgEfficiency}%`,
        department_breakdown: deptData,
        recent_logs: logs.slice(0, 30).map(l => ({
          date: l.log_date,
          student: l.student_id?.split('-')[0] || 'N/A',
          co2_kg: (l.total_kg || 0).toFixed(2),
          eco_points: l.eco_points_earned || 0
        }))
      },
      filename: `sustainability-report-${new Date().getTime()}`
    })
    toast.success('Sustainability Report Generated as PDF')
  }

  return (
    <FacultyLayout>
      <div className="space-y-10">
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Campus Carbon Offset Index</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Sustainability Hub</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
              Campus-wide Environmental Flux Analysis
            </p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={handleGenerateReport}
               className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
             >
                Generate Report
             </button>
          </div>
        </div>

         {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: 'Cumulative CO2 Flux', value: `${stats.totalCo2} kg`, icon: Wind, color: 'text-red-500', bg: 'bg-red-500/10' },
             { label: 'Offset Protocol', value: `${stats.totalSaved} kg`, icon: Leaf, color: 'text-rose-500', bg: 'bg-rose-500/10' },
             { label: 'Ecosystem Nodes', value: stats.activeUsers, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
             { label: 'Efficiency Index', value: `${stats.avgEfficiency}%`, icon: Target, color: 'text-red-600', bg: 'bg-red-600/10' },
           ].map((s, i) => (
             <motion.div 
               key={s.label}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl relative overflow-hidden group"
             >
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} mb-4 transition-transform group-hover:rotate-12`}>
                   <s.icon size={22} />
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-2xl font-black text-white tracking-tighter">{s.value}</p>
             </motion.div>
           ))}
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* CO2 BY DEPARTMENT */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl"
           >
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Node Distribution (By Dept)</h3>
                 <BarChart3 size={18} className="text-red-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                    />
                    <Bar dataKey="value" fill="#dc2626" radius={[6, 6, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
           </motion.div>

           {/* IMPACT SPLIT */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl"
           >
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Ecosystem Health Index</h3>
                 <ShieldCheck size={18} className="text-red-500" />
              </div>
              <div className="flex items-center justify-center">
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                       <Pie
                          data={[
                             { name: 'Offset', value: parseFloat(stats.totalSaved) },
                             { name: 'Residual', value: parseFloat(stats.totalCo2) }
                          ]}
                          cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value"
                       >
                          <Cell fill="#dc2626" />
                          <Cell fill="#334155" />
                       </Pie>
                       <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute flex flex-col items-center justify-center">
                    <p className="text-3xl font-black text-white tracking-tighter">{stats.avgEfficiency}%</p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Efficient</p>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* LOG ANALYTICS */}
        <div className="space-y-4">
           {/* Mobile List View */}
           <div className="grid grid-cols-1 gap-4 lg:hidden">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                   <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[32px]">
                   <p className="text-xs font-black text-gray-600 uppercase tracking-widest">No Logs</p>
                </div>
              ) : logs.slice(0, 10).map((log, i) => (
                <div key={log.id} className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">{new Date(log.log_date).toLocaleDateString()}</span>
                      <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest">+{log.eco_points_earned} Pts</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Carbon Flux</p>
                         <p className="text-xs font-black text-white">{(log.total_kg || 0).toFixed(2)} kg</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Node ID</p>
                         <p className="text-[10px] font-black text-gray-400 font-mono">{log.student_id?.split('-')[0]}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* Desktop Table View */}
           <div className="hidden lg:block bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl">
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Temporal Log Stream</h3>
                 <div className="flex items-center gap-4">
                    <Download size={14} className="text-gray-500 hover:text-white cursor-pointer" />
                 </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5">
                      {['Time Node', 'Student ID', 'Carbon Flux', 'Eco-Bonus', 'Category'].map(h => (
                        <th key={h} className="px-8 py-5 text-[9px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                       <tr><td colSpan={5} className="py-20 text-center"><div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto" /></td></tr>
                     ) : logs.length === 0 ? (
                       <tr><td colSpan={5} className="py-20 text-center text-xs font-black text-gray-600 uppercase tracking-widest">No Log Data Recorded</td></tr>
                     ) : logs.slice(0, 10).map((log, i) => (
                       <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                         <td className="px-8 py-5">
                            <span className="text-[10px] font-black text-white uppercase tracking-tight">{new Date(log.log_date).toLocaleDateString()}</span>
                         </td>
                         <td className="px-8 py-5">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">{log.student_id?.split('-')[0]}...</span>
                         </td>
                         <td className="px-8 py-5 font-black text-white text-xs">{(log.total_kg || 0).toFixed(2)} kg</td>
                         <td className="px-8 py-5 font-black text-green-500 text-xs">+{(log.eco_points_earned || 0)} Pts</td>
                         <td className="px-8 py-5">
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-gray-400 uppercase tracking-widest">Pulse Log</span>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </FacultyLayout>
  )
}

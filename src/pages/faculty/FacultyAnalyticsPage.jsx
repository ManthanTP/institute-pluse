import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, PieChart, Calendar, Download, RefreshCw, Users, BookOpen, Clock, Info, ChevronDown, Check, ShieldCheck, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import toast from 'react-hot-toast'
import { exportTablePDF } from '../../lib/pdfExport'
import PDFExportModal from '../../components/PDFExportModal'

export default function FacultyAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalAttendance: 0, avgAttendanceRate: 0, classesHeld: 0 })
  const [attendanceData, setAttendanceData] = useState([])
  const [divisionData, setDivisionData] = useState([])
  const [recentSessions, setRecentSessions] = useState([])
  const [semesters, setSemesters] = useState([])
  const [selectedSemester, setSelectedSemester] = useState('All')
  const [showTooltip, setShowTooltip] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchSemesters()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [selectedSemester])

  async function fetchSemesters() {
    const { data } = await supabase.from('academic_semesters').select('id, name').order('name', { ascending: true })
    if (data) setSemesters(data)
  }

  async function fetchAnalytics() {
    try {
      setLoading(true)

      // Get current teacher's profile/id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Fetch total sessions (classes held)
      let sessionsQuery = supabase
        .from('attendance_sessions')
        .select('*, division:academic_divisions!inner(semester_id, name)', { count: 'exact' })
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

      if (selectedSemester !== 'All') {
        sessionsQuery = sessionsQuery.eq('division.semester_id', selectedSemester)
      }

      const { data: sessionsData, error: sessionsError } = await sessionsQuery
      if (sessionsError) throw sessionsError

      const sessionsCount = sessionsData?.length || 0
      const sessionIds = (sessionsData || []).map(s => s.id)

      // Store recent sessions for table display
      setRecentSessions((sessionsData || []).slice(0, 5))

      // 2. Fetch all verified attendance records for these sessions
      let allRecords = []
      if (sessionIds.length > 0) {
        const { data: recordsData, error: recordsError } = await supabase
          .from('attendance_records')
          .select('session_id')
          .in('session_id', sessionIds)
          .eq('verification_status', 'verified')
        if (recordsError) throw recordsError
        allRecords = recordsData || []
      }
      const totalVerified = allRecords.length

      // Group records by session
      const recordsBySession = {}
      allRecords.forEach(r => {
        recordsBySession[r.session_id] = (recordsBySession[r.session_id] || 0) + 1
      })

      // 3. Fetch unique division student counts
      const uniqueDivIds = [...new Set((sessionsData || []).map(s => s.division_id).filter(Boolean))]
      const divStudentCounts = {}
      if (uniqueDivIds.length > 0) {
        await Promise.all(uniqueDivIds.map(async (divId) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student')
            .eq('division_id', divId)
          divStudentCounts[divId] = count || 60
        }))
      }

      // 4. Fetch Divisions matching the semester filter
      let divQuery = supabase.from('academic_divisions').select('id, name, semester_id')
      if (selectedSemester !== 'All') {
        divQuery = divQuery.eq('semester_id', selectedSemester)
      }
      const { data: divisions } = await divQuery
      
      if (divisions && sessionsData) {
        const divStats = divisions.map(div => {
          const divSessions = sessionsData.filter(s => s.division_id === div.id)
          const divSessionsCount = divSessions.length
          
          let divAttendance = 0
          divSessions.forEach(s => {
            divAttendance += (recordsBySession[s.id] || 0)
          })

          const classSize = divStudentCounts[div.id] || 60
          const performance = divSessionsCount > 0 
            ? Math.round((divAttendance / (divSessionsCount * classSize)) * 10) 
            : 0

          return {
            name: `${div.name}`,
            attendance: divAttendance,
            performance: Math.min(performance, 10) // cap at 10
          }
        })
        setDivisionData(divStats)
      }

      // 5. Calculate Attendance Trends (Last 30 active sessions)
      const recentSessionsTrend = (sessionsData || []).slice(0, 30)

      if (recentSessionsTrend.length > 0) {
        const dayMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' }
        const trendMap = {}
        
        recentSessionsTrend.forEach(session => {
          const day = dayMap[new Date(session.created_at).getDay()]
          if (!trendMap[day]) trendMap[day] = { name: day, value: 0, count: 0 }
          
          const sessionAttendance = recordsBySession[session.id] || 0
          trendMap[day].value += sessionAttendance
          trendMap[day].count += 1
        })
        
        // Format values to averages
        const formattedTrend = Object.values(trendMap).map(day => ({
          name: day.name,
          value: day.count > 0 ? Math.round(day.value / day.count) : 0
        })).reverse()

        setAttendanceData(formattedTrend)
      } else {
        setAttendanceData([])
      }

      // Calculate Student Attendance Rate (average percentage of students checked-in per class)
      let totalRatesSum = 0
      if (sessionsCount > 0 && sessionsData) {
        sessionsData.forEach(session => {
          const presentCount = recordsBySession[session.id] || 0
          const totalClassStudents = divStudentCounts[session.division_id] || 60
          totalRatesSum += (presentCount / totalClassStudents)
        })
      }
      const avgAttendanceRate = sessionsCount > 0 
        ? Math.min(Math.round((totalRatesSum / sessionsCount) * 100), 100) 
        : 0

      setStats({
        totalAttendance: totalVerified || 0,
        avgAttendanceRate: avgAttendanceRate || 0,
        classesHeld: sessionsCount || 0
      })

    } catch (err) {
      console.error('Analytics Error:', err)
      toast.error('Analytics Engine Synchronization Failed')
    } finally {
      setLoading(false)
    }
  }

  function triggerPDFDownload() {
    const headers = ["METRIC FIELD", "TELEMETRY VALUE"]
    const rows = [
      ["Total Presence Check-ins", stats.totalAttendance.toString()],
      ["Lectures Conducted", stats.classesHeld.toString()],
      ["Average Attendance Rate", `${stats.avgAttendanceRate}%`],
      ["Selected Semester Filter", semesters.find(s => s.id === selectedSemester)?.name || 'All Semesters']
    ]

    const divisionRows = divisionData.map(div => [
      `Division ${div.name} Attendance`,
      `${div.attendance} records (Score: ${div.performance}/10)`
    ])

    exportTablePDF({
      title: "Academic Intelligence & Attendance Report",
      subtitle: "Secured Faculty Analytics Extraction",
      headers,
      rows: [...rows, ...divisionRows],
      filename: `academic_analytics_${new Date().toISOString().split('T')[0]}`,
      summaryCards: [
        { label: "SESSIONS", value: stats.classesHeld.toString() },
        { label: "RATE", value: `${stats.avgAttendanceRate}%` }
      ]
    })
    toast.success('Analytics report downloaded successfully!')
  }

  function handleExport() {
    setIsExporting(true)
  }

  return (
    <FacultyLayout>
      <div className="space-y-8 lg:space-y-10 pb-20 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Predictive Performance Engine</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-none italic">
              Academic <span className="text-blue-500">Analytics</span>
            </h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              Synchronizing institutional telemetry nodes
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:flex-none">
               <select
                 value={selectedSemester}
                 onChange={(e) => setSelectedSemester(e.target.value)}
                 className="w-full appearance-none bg-[#161b22] border border-white/10 rounded-xl px-5 py-3.5 pr-10 text-[10px] font-black text-white uppercase tracking-widest outline-none cursor-pointer hover:bg-white/[0.08] transition-all"
               >
                 <option value="All" className="bg-slate-900">All Semesters</option>
                 {semesters.map(s => (
                   <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                 ))}
               </select>
               <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
             </div>

             <button 
               onClick={handleExport}
               className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
             >
               <Download size={14} /> Export Report
             </button>
          </div>
        </div>

        {/* METRICS HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { label: 'Total Presence', value: stats.totalAttendance, desc: 'Verified student check-ins', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/10' },
             { label: 'Attendance Rate', value: `${stats.avgAttendanceRate}%`, desc: 'Institutional efficiency', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/10' },
             { label: 'Lectures Conducted', value: stats.classesHeld, desc: 'Active session registry', icon: BookOpen, color: 'text-violet-500', bg: 'bg-violet-500/10', glow: 'shadow-violet-500/10' }
           ].map((item, i) => (
             <motion.div 
               key={item.label}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className={`bg-[#161b22] border border-white/[0.06] rounded-[24px] p-6 relative overflow-hidden group shadow-lg ${item.glow} hover:border-white/10 transition-all`}
             >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">{item.label}</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter italic">{item.value}</h3>
                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-3">{item.desc}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
                     <item.icon size={22} className="group-hover:rotate-12 transition-transform" />
                  </div>
                </div>
             </motion.div>
           ))}
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* ATTENDANCE TREND */}
           <div className="bg-[#161b22] border border-white/[0.06] rounded-[32px] p-6 lg:p-8 overflow-hidden shadow-xl">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Weekly Presence Trends</h4>
                 <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Live Telemetry
                 </div>
              </div>
              <div className="h-[260px] w-full">
                 {attendanceData.length === 0 ? (
                   <div className="h-full flex items-center justify-center text-gray-500 text-xs uppercase font-black tracking-widest">No trend data found</div>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={attendanceData}>
                         <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                               <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                         <XAxis dataKey="name" stroke="#52525b" fontSize={9} axisLine={false} tickLine={false} />
                         <YAxis stroke="#52525b" fontSize={9} axisLine={false} tickLine={false} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#0c1225', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                         />
                         <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                   </ResponsiveContainer>
                 )}
              </div>
           </div>

           {/* DIVISION PERFORMANCE MATRIX */}
           <div className="bg-[#161b22] border border-white/[0.06] rounded-[32px] p-6 lg:p-8 overflow-hidden shadow-xl relative">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Division Performance Matrix</h4>
                    <div className="relative flex items-center">
                       <button 
                         onMouseEnter={() => setShowTooltip(true)}
                         onMouseLeave={() => setShowTooltip(false)}
                         className="p-1 rounded-full text-gray-500 hover:text-white transition-colors"
                       >
                          <Info size={12} />
                       </button>
                       <AnimatePresence>
                         {showTooltip && (
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, scale: 0.95 }}
                             className="absolute bottom-6 left-0 w-60 p-4 bg-[#0c1225] border border-white/10 rounded-2xl shadow-2xl z-20 pointer-events-none"
                           >
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-wider mb-1">Performance Index</p>
                              <p className="text-[9px] font-medium text-gray-400 normal-case leading-relaxed">
                                Represents the ratio of verified attendance records relative to total sessions held in that specific academic division.
                              </p>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                 </div>
              </div>
              
              <div className="h-[260px] w-full">
                 {divisionData.length === 0 ? (
                   <div className="h-full flex items-center justify-center text-gray-500 text-xs uppercase font-black tracking-widest">No division data found</div>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={divisionData}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                         <XAxis dataKey="name" stroke="#52525b" fontSize={9} axisLine={false} tickLine={false} />
                         <YAxis stroke="#52525b" fontSize={9} axisLine={false} tickLine={false} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#0c1225', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                         />
                         <Bar dataKey="attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                         <Bar dataKey="performance" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={12} opacity={0.6} />
                      </BarChart>
                   </ResponsiveContainer>
                 )}
              </div>

              <div className="flex justify-center gap-6 mt-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Check-ins</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Performance (x10)</span>
                 </div>
              </div>
           </div>
        </div>

        {/* LOG STREAM */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Session Telemetry Stream</h4>
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Last 5 Lectures</span>
          </div>

          <div className="bg-[#161b22] border border-white/[0.06] rounded-[24px] overflow-hidden shadow-xl">
             <div className="overflow-x-auto no-scrollbar">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                     {['Timestamp', 'Subject', 'Division', 'Attendance Code', 'Status'].map(h => (
                       <th key={h} className="px-6 py-4 text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/[0.04]">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : recentSessions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs font-black text-gray-600 uppercase tracking-widest italic">
                          No sessions recorded in this semester registry.
                        </td>
                      </tr>
                    ) : recentSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 text-[10px] font-black text-white uppercase tracking-tight">
                           {new Date(session.created_at).toLocaleDateString()} at {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">
                           {session.subject?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-[10px] font-black text-blue-500 uppercase font-mono">
                           {session.division?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-[10px] font-black text-gray-400 font-mono uppercase tracking-widest">
                           {session.otp || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                             session.is_active 
                               ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                               : 'bg-white/5 border-white/10 text-gray-500'
                           }`}>
                             {session.is_active ? 'Active' : 'Closed'}
                           </span>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>

      <PDFExportModal 
        isOpen={isExporting} 
        onClose={() => setIsExporting(false)} 
        onTriggerDownload={triggerPDFDownload} 
      />
    </FacultyLayout>
  )
}

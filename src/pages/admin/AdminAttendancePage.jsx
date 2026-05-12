import { useState, useEffect } from 'react'
import { GraduationCap, Users, Clock, CheckCircle2, Zap, AlertCircle, MapPin, Trash2, Shield, Search, Filter, History, RefreshCw, BarChart3, Activity } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminAttendancePage() {
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState({ active: 0, presentToday: 0, totalSessions: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, active, locked

  useEffect(() => {
    fetchGlobalData()
    
    // Global Realtime Sync
    const channel = supabase
      .channel('admin_global_attendance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_sessions' }, () => fetchGlobalData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, () => fetchGlobalData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchGlobalData() {
    try {
      // 1. Fetch All Sessions with Teacher Info
      const { data: sess, error } = await supabase
        .from('attendance_sessions')
        .select(`
          *,
          profiles:teacher_id(full_name),
          academic_divisions(name),
          academic_classrooms(name),
          attendance_records(count)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error

      const formattedSessions = sess.map(s => ({
        ...s,
        teacher_name: s.profiles?.full_name || 'Unknown Faculty',
        participant_count: s.attendance_records?.[0]?.count || 0
      }))

      setSessions(formattedSessions)

      // 2. Calculate Stats
      const activeCount = formattedSessions.filter(s => s.status === 'active').length
      const totalPresent = formattedSessions.reduce((acc, s) => acc + s.participant_count, 0)
      
      setStats({
        active: activeCount,
        presentToday: totalPresent,
        totalSessions: formattedSessions.length
      })

    } catch (err) {
      console.error('Global Sync Error:', err)
      toast.error('Global Attendance Sync Failed')
    } finally {
      setLoading(false)
    }
  }

  async function terminateSession(sessionId) {
    if (!window.confirm('Forcibly terminate this protocol? Faculty will lose control.')) return
    const { error } = await supabase
      .from('attendance_sessions')
      .update({ status: 'locked' })
      .eq('id', sessionId)
    
    if (!error) {
      toast.success('Protocol Terminated by Admin')
      fetchGlobalData()
    }
  }

  async function deleteSession(sessionId) {
    if (!window.confirm('DANGER: This will purge all attendance data for this session. Continue?')) return
    
    try {
      await supabase.from('attendance_records').delete().eq('session_id', sessionId)
      const { error } = await supabase.from('attendance_sessions').delete().eq('id', sessionId)
      
      if (error) throw error
      toast.success('Session Expunged from Registry')
      fetchGlobalData()
    } catch (err) {
      toast.error('Purge Failed: Permission Denied or Database Constraint')
    }
  }

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = 
      s.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || s.status === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <AdminLayout>
      <div className="space-y-8 lg:space-y-12 pb-20">
        {/* COMMAND HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 lg:mb-3">
              <Shield size={12} className="text-blue-500" />
              <span className="text-[8px] lg:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Institute Command Center</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Global <span className="text-blue-500">Attendance</span></h2>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4">
             <button onClick={fetchGlobalData} className="p-3 lg:p-4 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl text-gray-500 hover:text-white transition-all">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>

        {/* METRICS HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
           <div className="bg-[#161b22] border border-white/5 rounded-3xl lg:rounded-[40px] p-8 lg:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={60} /></div>
              <p className="text-[8px] lg:text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Live Terminals</p>
              <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter italic">{stats.active}</h3>
              <p className="text-[8px] lg:text-[10px] text-gray-500 font-bold uppercase mt-3 lg:mt-4">Currently Broadcasting</p>
           </div>
           <div className="bg-[#161b22] border border-white/5 rounded-3xl lg:rounded-[40px] p-8 lg:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={60} /></div>
              <p className="text-[8px] lg:text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Global Presence</p>
              <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter italic">{stats.presentToday}</h3>
              <p className="text-[8px] lg:text-[10px] text-gray-500 font-bold uppercase mt-3 lg:mt-4">Verified student check-ins</p>
           </div>
           <div className="sm:col-span-2 lg:col-span-1 bg-[#161b22] border border-white/5 rounded-3xl lg:rounded-[40px] p-8 lg:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-5 group-hover:opacity-10 transition-opacity"><History size={60} /></div>
              <p className="text-[8px] lg:text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">Registry Volume</p>
              <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter italic">{stats.totalSessions}</h3>
              <p className="text-[8px] lg:text-[10px] text-gray-500 font-bold uppercase mt-3 lg:mt-4">Sessions tracked in nexus</p>
           </div>
        </div>

        {/* CONTROLS & FILTER */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center">
            <div className="relative w-full lg:flex-1 group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
               <input 
                 type="text" 
                 placeholder="SEARCH BY SUBJECT OR FACULTY..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-[#161b22] border border-white/10 rounded-xl lg:rounded-2xl py-4 lg:py-5 pl-14 lg:pl-16 pr-8 text-[9px] lg:text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500/50 transition-all"
               />
            </div>
            <div className="flex w-full lg:w-auto gap-1 p-1.5 bg-[#161b22] border border-white/10 rounded-xl lg:rounded-2xl">
               {['all', 'active', 'locked'].map((type) => (
                 <button
                   key={type}
                   onClick={() => setFilterType(type)}
                   className={`flex-1 lg:flex-none px-6 lg:px-8 py-3 rounded-lg lg:rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                 >
                   {type}
                 </button>
               ))}
            </div>
        </div>

        {/* GLOBAL REGISTRY TABLE */}
        <div className="bg-[#161b22]/80 border border-white/5 rounded-3xl lg:rounded-[48px] overflow-hidden backdrop-blur-3xl shadow-2xl">
           <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px] lg:min-w-full">
                 <thead>
                    <tr className="border-b border-white/5 bg-white/2">
                       <th className="px-8 lg:px-10 py-6 lg:py-8 text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest">Faculty Terminal</th>
                       <th className="px-8 lg:px-10 py-6 lg:py-8 text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol / Subject</th>
                       <th className="px-8 lg:px-10 py-6 lg:py-8 text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Division</th>
                       <th className="px-8 lg:px-10 py-6 lg:py-8 text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Presence</th>
                       <th className="px-8 lg:px-10 py-6 lg:py-8 text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                       <th className="px-8 lg:px-10 py-6 lg:py-8 text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filteredSessions.filter(s => ['A', 'B', 'C', 'D', 'E', 'F'].includes(s.academic_divisions?.name)).length === 0 ? (
                       <tr>
                          <td colSpan="6" className="px-10 py-24 lg:py-32 text-center">
                             <div className="flex flex-col items-center gap-4 text-gray-600">
                                <History size={32} lg:size={40} className="opacity-20" />
                                <p className="text-[9px] lg:text-[11px] font-black uppercase tracking-widest italic">No active or archived protocols found in this sector (Div A-F)</p>
                             </div>
                          </td>
                       </tr>
                    ) : filteredSessions
                        .filter(s => ['A', 'B', 'C', 'D', 'E', 'F'].includes(s.academic_divisions?.name))
                        .map((session) => (
                       <tr key={session.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 lg:px-10 py-6 lg:py-8">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-base lg:text-lg border border-blue-500/20 group-hover:scale-110 transition-transform">{session.teacher_name[0]}</div>
                                <div>
                                   <div className="text-[10px] lg:text-xs font-black text-white uppercase tracking-tight">{session.teacher_name}</div>
                                   <div className="text-[8px] lg:text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Authorized Faculty</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 lg:px-10 py-6 lg:py-8">
                             <div className="text-[10px] lg:text-xs font-black text-white uppercase italic tracking-tight">{session.subject}</div>
                             <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 lg:px-3 py-1 bg-white/5 rounded-lg text-[7px] lg:text-[8px] font-black text-blue-400 uppercase tracking-widest border border-white/5">{session.session_type}</span>
                                <span className="text-[8px] lg:text-[9px] text-gray-600 font-bold uppercase tracking-widest">Terminal: {session.academic_classrooms?.name || 'Manual'}</span>
                             </div>
                          </td>
                          <td className="px-8 lg:px-10 py-6 lg:py-8 text-[9px] lg:text-xs font-black text-gray-400 uppercase tracking-widest">DIV {session.academic_divisions?.name}</td>
                          <td className="px-8 lg:px-10 py-6 lg:py-8 text-center">
                             <div className="inline-flex items-center gap-3 px-4 lg:px-5 py-2 bg-white/5 rounded-xl lg:rounded-2xl border border-white/5 group-hover:border-blue-500/30 transition-all">
                                <Users size={12} lg:size={14} className="text-blue-500" />
                                <span className="text-xs lg:text-sm font-black text-white">{session.participant_count}</span>
                             </div>
                          </td>
                          <td className="px-8 lg:px-10 py-6 lg:py-8">
                             <div className={`inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] ${session.status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20 animate-pulse' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                <Zap size={8} lg:size={10} /> {session.status}
                             </div>
                          </td>
                          <td className="px-8 lg:px-10 py-6 lg:py-8 text-right">
                             <div className="flex items-center justify-end gap-2 lg:gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                {session.status === 'active' && (
                                  <button 
                                    onClick={() => terminateSession(session.id)}
                                    className="px-4 lg:px-5 py-2 bg-red-600 text-white rounded-lg lg:rounded-xl text-[7px] lg:text-[8px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:scale-105 transition-all"
                                  >
                                    Terminate
                                  </button>
                                )}
                                <button 
                                  onClick={() => deleteSession(session.id)}
                                  className="p-2.5 lg:p-3 bg-red-500/10 text-red-500 rounded-lg lg:rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-500/10"
                                >
                                   <Trash2 size={14} lg:size={16} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* SYSTEM STATUS FOOTER */}
        <div className="bg-gradient-to-br from-gray-900 to-[#161b22] border border-white/5 rounded-3xl lg:rounded-[48px] p-8 lg:p-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 lg:p-12 opacity-5 pointer-events-none font-black text-[120px] lg:text-[200px] leading-none uppercase -mr-10 lg:-mr-20 -mt-10 lg:-mt-20">Audit</div>
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                 <h4 className="text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">Institutional Transparency Ledger</h4>
                 <p className="text-xs lg:text-sm text-gray-500 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">As an administrator, you possess overriding authority to monitor, terminate, or purge any attendance protocol across the entire campus ecosystem. All administrative actions are recorded in the system audit logs.</p>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-4 lg:gap-6">
                 <div className="px-6 lg:px-8 py-3 lg:py-4 bg-white/5 border border-white/5 rounded-[32px] flex items-center gap-3 lg:gap-4">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse" />
                    <span className="text-[8px] lg:text-[10px] font-black text-white uppercase tracking-[0.3em]">Nexus Sync Operational</span>
                 </div>
                 <div className="text-[8px] lg:text-[9px] text-gray-600 font-black uppercase tracking-widest">Audit Engine Version 4.0.2-Active</div>
              </div>
           </div>
        </div>
      </div>

    </AdminLayout>
  )
}

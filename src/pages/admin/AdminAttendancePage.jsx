import { useState, useEffect } from 'react'
import { GraduationCap, Users, Clock, CheckCircle2, Zap, AlertCircle, MapPin, Trash2, Shield, Search, Filter, History, RefreshCw, BarChart3, Activity, Download, Plus, X, Building, BookOpen, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { exportTablePDF } from '../../lib/pdfExport'
export default function AdminAttendancePage() {
  const [activeTab, setActiveTab] = useState('tracking') // 'tracking', 'metadata'
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState({ active: 0, presentToday: 0, totalSessions: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, active, locked
  
  const [selectedSession, setSelectedSession] = useState(null)
  const [showCode, setShowCode] = useState(false)
  const [sessionParticipants, setSessionParticipants] = useState([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)

  // Metadata States
  const [metaType, setMetaType] = useState('semesters') // semesters, divisions, subjects, classrooms
  const [semesters, setSemesters] = useState([])
  const [divisions, setDivisions] = useState([])
  const [subjects, setSubjects] = useState([])
  const [classrooms, setClassrooms] = useState([])
  
  // New Item State
  const [newItem, setNewItem] = useState({})

  useEffect(() => {
    fetchGlobalData()
    fetchMetadata()
    
    const channel = supabase
      .channel('admin_global_attendance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_sessions' }, () => fetchGlobalData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, () => fetchGlobalData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchGlobalData() {
    try {
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

  async function fetchMetadata() {
    const { data: sems } = await supabase.from('academic_semesters').select('*').order('name')
    const { data: divs } = await supabase.from('academic_divisions').select('*, academic_semesters(name)').order('name')
    const { data: subs } = await supabase.from('academic_subjects').select('*, academic_semesters(name)').order('name')
    const { data: rooms } = await supabase.from('academic_classrooms').select('*').order('name')
    
    if (sems) setSemesters(sems)
    if (divs) setDivisions(divs)
    if (subs) setSubjects(subs)
    if (rooms) setClassrooms(rooms)
  }

  async function fetchParticipants(sessionId) {
    setLoadingParticipants(true)
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, profiles:student_id(full_name, usn)')
      .eq('session_id', sessionId)
      .order('marked_at', { ascending: false })
    
    if (!error && data) {
      setSessionParticipants(data)
    }
    setLoadingParticipants(false)
  }

  function handleViewSession(session) {
    setSelectedSession(session)
    setShowCode(false)
    fetchParticipants(session.id)
  }

  async function terminateSession(sessionId) {
    if (!window.confirm('Forcibly terminate this protocol? Faculty will lose control.')) return
    const { error } = await supabase.from('attendance_sessions').update({ status: 'locked' }).eq('id', sessionId)
    if (!error) {
      toast.success('Protocol Terminated by Admin')
      fetchGlobalData()
      if (selectedSession?.id === sessionId) {
        setSelectedSession(prev => ({ ...prev, status: 'locked' }))
      }
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
      if (selectedSession?.id === sessionId) setSelectedSession(null)
    } catch (err) {
      toast.error('Purge Failed: Permission Denied or Database Constraint')
    }
  }

  async function exportLedger(session, participants) {
    if (!participants || participants.length === 0) {
      toast.error('No data available for export')
      return
    }
    try {
      const headers = ['USN', 'Student Name', 'Status', 'Timestamp', 'Verified By']
      const rows = participants.map(p => [
        p.profiles?.usn || 'N/A',
        p.profiles?.full_name || 'Unknown',
        p.verification_status,
        new Date(p.marked_at).toLocaleString(),
        p.verified_by ? 'Faculty' : 'System'
      ])

      exportTablePDF({
        title: `Protocol Ledger: ${session.subject}`,
        subtitle: `Terminal Data • ${new Date(session.created_at).toLocaleString()}`,
        headers,
        rows,
        filename: `Attendance_${session.subject.replace(/\s+/g, '_')}_${new Date(session.created_at).toISOString().split('T')[0]}`,
        summaryCards: [
          { label: 'Protocol ID', value: session.id.split('-')[0] },
          { label: 'Faculty Lead', value: session.teacher_name },
          { label: 'Total Scans', value: participants.length }
        ]
      })

      toast.success('Ledger Exported Successfully as PDF')
    } catch (err) {
      toast.error('Export Interface Failed')
    }
  }

  // Metadata CRUD Operations
  async function handleAddMetadata(e) {
    e.preventDefault()
    let table = ''
    let payload = {}

    try {
      if (metaType === 'semesters') {
        table = 'academic_semesters'
        payload = { name: newItem.name }
      } else if (metaType === 'divisions') {
        table = 'academic_divisions'
        payload = { name: newItem.name, semester_id: newItem.semester_id, department: newItem.department || 'CSE' }
      } else if (metaType === 'subjects') {
        table = 'academic_subjects'
        payload = { name: newItem.name, code: newItem.code, semester_id: newItem.semester_id, department: newItem.department || 'CSE' }
      } else if (metaType === 'classrooms') {
        table = 'academic_classrooms'
        payload = { name: newItem.name }
      }

      if (!payload.name) return toast.error('Name is required')

      const { error } = await supabase.from(table).insert(payload)
      if (error) throw error
      
      toast.success('Metadata Added')
      setNewItem({})
      fetchMetadata()
    } catch (err) {
      toast.error(err.message || 'Failed to add')
    }
  }

  async function handleDeleteMetadata(id, table) {
    if (!window.confirm('Delete this metadata? This may affect linked sessions and users.')) return
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      toast.error('Cannot delete: likely linked to existing records')
    } else {
      toast.success('Deleted Successfully')
      fetchMetadata()
    }
  }

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || s.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || s.status === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <AdminLayout>
      <div className="space-y-8 lg:space-y-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 lg:mb-3">
               <Shield size={12} className="text-red-500" />
               <span className="text-[8px] lg:text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Institute Command Center</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Global <span className="text-red-500">Attendance</span></h2>
          </div>
          
          <div className="flex bg-[#161b22] border border-white/10 rounded-2xl p-1">
             <button onClick={() => setActiveTab('tracking')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tracking' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>Live Tracking</button>
             <button onClick={() => setActiveTab('metadata')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'metadata' ? 'bg-red-700 text-white' : 'text-gray-500 hover:text-white'}`}>Metadata Config</button>
          </div>
        </div>

        {activeTab === 'tracking' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
               <div className="bg-[#161b22] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><Activity size={60} /></div>
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">Live Terminals</p>
                  <h3 className="text-4xl font-black text-white tracking-tighter italic">{stats.active}</h3>
               </div>
               <div className="bg-[#161b22] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><Users size={60} /></div>
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">Global Presence</p>
                  <h3 className="text-4xl font-black text-white tracking-tighter italic">{stats.presentToday}</h3>
               </div>
               <div className="sm:col-span-2 lg:col-span-1 bg-[#161b22] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><History size={60} /></div>
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">Registry Volume</p>
                  <h3 className="text-4xl font-black text-white tracking-tighter italic">{stats.totalSessions}</h3>
               </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative w-full lg:flex-1 group">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                   <input type="text" placeholder="Search by subject or faculty..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#161b22] border border-white/10 rounded-2xl py-5 pl-16 pr-8 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-red-500/50" />
                </div>
                <div className="flex w-full lg:w-auto gap-1 p-1.5 bg-[#161b22] border border-white/10 rounded-2xl">
                   {['all', 'active', 'locked'].map((type) => (
                     <button key={type} onClick={() => setFilterType(type)} className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{type}</button>
                   ))}
                </div>
            </div>

            <div className="bg-[#161b22]/80 border border-white/5 rounded-[40px] overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[900px]">
                     <thead>
                        <tr className="border-b border-white/5 bg-white/2">
                           <th className="px-8 py-6 text-[9px] font-black text-gray-500 uppercase tracking-widest">Faculty</th>
                           <th className="px-8 py-6 text-[9px] font-black text-gray-500 uppercase tracking-widest">Protocol</th>
                           <th className="px-8 py-6 text-[9px] font-black text-gray-500 uppercase tracking-widest">Target</th>
                           <th className="px-8 py-6 text-[9px] font-black text-gray-500 uppercase tracking-widest">Presence</th>
                           <th className="px-8 py-6 text-[9px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                           <th className="px-8 py-6 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {filteredSessions.map((session) => (
                           <tr key={session.id} className="hover:bg-white/[0.02]">
                              <td className="px-8 py-6">
                                 <div className="text-xs font-black text-white">{session.teacher_name}</div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="text-xs font-black text-white italic">{session.subject}</div>
                                 <div className="text-[9px] text-gray-500 font-bold uppercase mt-1">{session.session_type} • {session.academic_classrooms?.name || 'N/A'}</div>
                              </td>
                              <td className="px-8 py-6 text-xs font-black text-gray-400">DIV {session.academic_divisions?.name}</td>
                              <td className="px-8 py-6">
                                 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-xl"><Users size={12} className="text-red-500" /><span className="text-xs font-black text-white">{session.participant_count}</span></div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${session.status === 'active' ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{session.status}</span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button onClick={() => handleViewSession(session)} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white mr-2">Review</button>
                                 <button onClick={() => deleteSession(session.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 size={14}/></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'metadata' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex gap-2 p-1.5 bg-[#161b22] border border-white/10 rounded-2xl w-max">
               {[
                 { id: 'semesters', label: 'Semesters' },
                 { id: 'divisions', label: 'Divisions' },
                 { id: 'subjects', label: 'Subjects' },
                 { id: 'classrooms', label: 'Classrooms' }
               ].map(t => (
                 <button key={t.id} onClick={() => setMetaType(t.id)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${metaType === t.id ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{t.label}</button>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1 bg-[#161b22]/80 border border-white/5 rounded-3xl p-6">
                 <h3 className="text-sm font-black text-white uppercase mb-6">Add New {metaType.slice(0,-1)}</h3>
                 <form onSubmit={handleAddMetadata} className="space-y-4">
                   <div>
                     <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Name</label>
                     <input type="text" required value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-red-500/50 outline-none" placeholder="e.g. 1, A, Physics" />
                   </div>

                   {metaType === 'subjects' && (
                     <div>
                       <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Subject Code</label>
                       <input type="text" required value={newItem.code || ''} onChange={e => setNewItem({...newItem, code: e.target.value})} className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-red-500/50 outline-none" placeholder="e.g. CS101" />
                     </div>
                   )}

                   {(metaType === 'divisions' || metaType === 'subjects') && (
                     <>
                       <div>
                         <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Department</label>
                         <div className="relative group/sel mt-2">
                           <div className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white flex justify-between items-center cursor-pointer group-hover/sel:border-red-500/50 transition-all">
                             <span className="font-black uppercase tracking-widest text-[10px]">{newItem.department || 'CSE'}</span>
                             <ChevronDown size={14} className="text-gray-500" />
                           </div>
                           <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover/sel:opacity-100 group-hover/sel:visible transition-all z-50 shadow-xl">
                              {['CSE','ECE','ME','Civil','MBA','Other'].map(d => (
                                 <div key={d} onClick={() => setNewItem({...newItem, department: d})} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors text-white">{d}</div>
                              ))}
                           </div>
                         </div>
                       </div>
                       <div>
                         <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Semester</label>
                         <div className="relative group/sel mt-2">
                           <div className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white flex justify-between items-center cursor-pointer group-hover/sel:border-red-500/50 transition-all">
                             <span className="font-black uppercase tracking-widest text-[10px]">{semesters.find(s => s.id === newItem.semester_id)?.name ? `Semester ${semesters.find(s => s.id === newItem.semester_id)?.name}` : 'Select Sem'}</span>
                             <ChevronDown size={14} className="text-gray-500" />
                           </div>
                           <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover/sel:opacity-100 group-hover/sel:visible transition-all z-50 shadow-xl max-h-48 overflow-y-auto no-scrollbar">
                              {semesters.map(s => (
                                 <div key={s.id} onClick={() => setNewItem({...newItem, semester_id: s.id})} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors text-white">Semester {s.name}</div>
                              ))}
                           </div>
                         </div>
                       </div>
                     </>
                   )}

                   <button type="submit" className="w-full py-4 mt-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all flex items-center justify-center gap-2">
                      <Plus size={16} /> Create Record
                   </button>
                 </form>
               </div>

               <div className="lg:col-span-2 bg-[#161b22]/80 border border-white/5 rounded-3xl p-6">
                 <h3 className="text-sm font-black text-white uppercase mb-6">Existing Registry</h3>
                 <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                    {metaType === 'semesters' && semesters.map(item => (
                       <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                          <span className="font-black text-white text-sm">Semester {item.name}</span>
                          <button onClick={() => handleDeleteMetadata(item.id, 'academic_semesters')} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 size={16}/></button>
                       </div>
                    ))}
                    {metaType === 'divisions' && divisions.map(item => (
                       <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div>
                            <div className="font-black text-white text-sm">Division {item.name}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-black mt-1">{item.department} • Sem {item.academic_semesters?.name}</div>
                          </div>
                          <button onClick={() => handleDeleteMetadata(item.id, 'academic_divisions')} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 size={16}/></button>
                       </div>
                    ))}
                    {metaType === 'subjects' && subjects.map(item => (
                       <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div>
                            <div className="font-black text-white text-sm">{item.name} ({item.code})</div>
                            <div className="text-[10px] text-gray-500 uppercase font-black mt-1">{item.department} • Sem {item.academic_semesters?.name}</div>
                          </div>
                          <button onClick={() => handleDeleteMetadata(item.id, 'academic_subjects')} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 size={16}/></button>
                       </div>
                    ))}
                    {metaType === 'classrooms' && classrooms.map(item => (
                       <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                          <span className="font-black text-white text-sm">{item.name}</span>
                          <button onClick={() => handleDeleteMetadata(item.id, 'academic_classrooms')} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 size={16}/></button>
                       </div>
                    ))}
                 </div>
               </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* SESSION DETAILS MODAL */}
      {createPortal(
        <AnimatePresence>
          {selectedSession && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 lg:p-0">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => { setSelectedSession(null); setShowCode(false); }} />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-4xl bg-[#161b22] border border-white/10 rounded-[32px] p-6 lg:p-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-start justify-between mb-8">
                   <div>
                      <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">{selectedSession.teacher_name}</div>
                      <h2 className="text-2xl font-black text-white uppercase italic">{selectedSession.subject}</h2>
                      <p className="text-xs text-gray-500 mt-2 font-bold">{new Date(selectedSession.created_at).toLocaleString()}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Protocol Code:</span>
                        <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-black tracking-widest text-white font-mono">
                          {showCode ? (selectedSession.session_code || selectedSession.id.slice(0, 6).toUpperCase()) : '••••••'}
                        </span>
                        <button 
                          onClick={() => setShowCode(!showCode)} 
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all flex items-center justify-center"
                          title={showCode ? "Hide Code" : "Show Code"}
                        >
                          {showCode ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <button onClick={() => exportLedger(selectedSession, sessionParticipants)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Download size={16}/> Export</button>
                      {selectedSession.status === 'active' && <button onClick={() => terminateSession(selectedSession.id)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Terminate</button>}
                      <button onClick={() => { setSelectedSession(null); setShowCode(false); }} className="p-2 bg-white/5 text-gray-400 rounded-xl hover:text-white"><X size={20}/></button>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar bg-black/20 rounded-2xl p-4 border border-white/5">
                   {loadingParticipants ? (
                     <div className="py-20 text-center"><RefreshCw className="mx-auto animate-spin text-red-500 mb-4" />Loading list...</div>
                   ) : sessionParticipants.length === 0 ? (
                     <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">No presence recorded yet</div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sessionParticipants.map(p => (
                          <div key={p.id} className="flex items-center justify-between bg-[#161b22] p-4 rounded-xl border border-white/5">
                            <div>
                               <div className="font-black text-white text-sm">{p.profiles?.full_name || 'Unknown'}</div>
                               <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">{p.profiles?.usn || 'NO USN'}</div>
                            </div>
                            <div className="text-right">
                               <div className={`text-[10px] font-black uppercase tracking-widest ${p.verification_status==='verified'?'text-red-500':'text-red-500'}`}>{p.verification_status}</div>
                               <div className="text-[8px] text-gray-600 font-black mt-1">{new Date(p.marked_at).toLocaleTimeString()}</div>
                            </div>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>, document.body
      )}
    </AdminLayout>
  )
}

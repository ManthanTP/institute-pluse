import { useState, useEffect } from 'react'
import { GraduationCap, Users, Clock, CheckCircle2, Zap, AlertCircle, MapPin, Edit3, Settings, BookOpen, X, ChevronRight, MoreHorizontal, Layout, Filter, History, Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/index'
import { exportTablePDF } from '../../lib/pdfExport'
import { ChevronDown } from 'lucide-react'

export default function FacultyAttendancePage() {
  const { profile } = useAuthStore()
  const [activeSession, setActiveSession] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(null)
  const [sessionHistory, setSessionHistory] = useState([])
  
  // Metadata States
  const [subjects, setSubjects] = useState([])
  const [divisions, setDivisions] = useState([])
  const [semesters, setSemesters] = useState([])
  const [rooms, setRooms] = useState([])
  const [batches, setBatches] = useState([])
  
  // Selection States
  const [extraSubject, setExtraSubject] = useState('')
  const [extraSem, setExtraSem] = useState('')
  const [extraDiv, setExtraDiv] = useState('')
  const [extraRoom, setExtraRoom] = useState('')
  const [sessionType, setSessionType] = useState('theory')
  const [extraBatch, setExtraBatch] = useState('')

  // Manual Check-in States
  const [showManualAddModal, setShowManualAddModal] = useState(false)
  const [divisionStudents, setDivisionStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [submittingManual, setSubmittingManual] = useState(false)

  useEffect(() => {
    fetchMetadata()
    fetchHistory()
    fetchActiveSession()
    setLoading(false)
  }, [])

  async function fetchActiveSession() {
    const { data } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('teacher_id', profile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      if (new Date(data.expires_at) > new Date()) {
        setActiveSession(data)
        fetchParticipants(data.id)
      } else {
        // Auto-lock if expired
        await supabase.from('attendance_sessions').update({ status: 'locked' }).eq('id', data.id)
        fetchHistory()
      }
    }
  }

  async function openManualAddModal() {
    if (!activeSession) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'student')
        .eq('division_id', activeSession.division_id)
        .order('full_name')
      
      if (error) throw error
      setDivisionStudents(data || [])
      setShowManualAddModal(true)
    } catch (err) {
      toast.error('Failed to load division students')
    }
  }

  async function submitManualAttendance(e) {
    e.preventDefault()
    if (!selectedStudentId) {
      toast.error('Please select a student')
      return
    }
    try {
      setSubmittingManual(true)
      const { error } = await supabase
        .from('attendance_records')
        .insert({
          session_id: activeSession.id,
          student_id: selectedStudentId,
          verification_status: 'verified',
          verified_by: profile.id
        })
      if (error) {
        if (error.code === '23505') {
          throw new Error('Student is already marked present for this session')
        }
        throw error
      }
      toast.success('Student marked present successfully')
      setShowManualAddModal(false)
      setSelectedStudentId('')
      fetchParticipants(activeSession.id)
    } catch (err) {
      toast.error(err.message || 'Failed to mark student present')
    } finally {
      setSubmittingManual(false)
    }
  }

  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      console.log('📡 Initializing Realtime Link for Session:', activeSession.id)
      const channelId = `attendance_sync_${activeSession.id.slice(0, 8)}`
      const sub = supabase
        .channel(channelId)
        .on('postgres_changes', { 
          event: '*', // Listen for ALL events (INSERT/UPDATE/DELETE)
          schema: 'public', 
          table: 'attendance_records',
          filter: `session_id=eq.${activeSession.id}`
        }, (payload) => {
          console.log('🔔 Realtime Update Detected:', payload)
          fetchParticipants(activeSession.id)
        })
        .subscribe((status) => {
          console.log('📡 Subscription Status:', status)
        })
      return () => { supabase.removeChannel(sub) }
    }
  }, [activeSession?.id])


  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      const timer = setInterval(() => {
        const expires = new Date(activeSession.expires_at)
        const diff = expires - new Date()
        if (diff <= 0) {
          setTimeLeft(0); clearInterval(timer); lockSession()
        } else {
          setTimeLeft(Math.floor(diff / 1000))
        }
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [activeSession])

  async function fetchMetadata() {
    const { data: s } = await supabase.from('academic_subjects').select('*').order('name')
    const { data: d } = await supabase.from('academic_divisions').select('*').order('name')
    const { data: sem } = await supabase.from('academic_semesters').select('*').order('name')
    const { data: r } = await supabase.from('academic_classrooms').select('*').order('name')
    const { data: b } = await supabase.from('lab_batches').select('*').order('name')
    
    if (s) setSubjects(s)
    if (d) setDivisions(d)
    if (sem) setSemesters(sem)
    if (r) setRooms(r)
    if (b) setBatches(b)
  }

  async function fetchHistory() {
    if (!profile) return
    console.log('📜 Fetching Session History...')
    const { data, error } = await supabase
      .from('attendance_sessions')
      .select('*, academic_divisions(name), academic_classrooms(name)')
      .eq('teacher_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) {
      console.error('History Fetch Error:', error)
      return
    }

    if (data) {
      setSessionHistory(data)
    }
  }



  async function startManualSession() {
    if (!extraSubject || !extraDiv || !extraRoom) {
      toast.error('Select Subject, Division, and Room')
      return
    }

    if (sessionType === 'lab' && !extraBatch) {
      toast.error('Select Lab Batch')
      return
    }

    // Generate Institutional Protocol Code (6-digit alphanumeric)
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert({
        teacher_id: profile.id,
        division_id: extraDiv,
        subject: subjects.find(s => s.id === extraSubject)?.name,
        classroom_id: extraRoom,
        session_type: sessionType,
        batch_id: sessionType === 'lab' ? extraBatch : null,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        status: 'active',
        session_code: generatedCode
      })
      .select().single()

    if (error) {
       toast.error('Session Launch Failed')
       console.error(error)
    } else {
      setActiveSession(data)
      toast.success('Attendance Protocol Broadcasted')
      fetchHistory()

      // Auto-create classroom announcement for students in the division
      await supabase.from('announcements').insert({
        title: `Class Started: ${subjects.find(s => s.id === extraSubject)?.name}`,
        content: `A manual ${sessionType} session has been initiated for Division ${divisions.find(d => d.id === extraDiv)?.name} in ${rooms.find(r => r.id === extraRoom)?.name || 'venue'}. Use Code: ${generatedCode} to authenticate presence.`,
        audience_type: 'division',
        target_id: extraDiv,
        priority: 'high',
        created_by: profile.id
      })

      // Notify Students via Campus Broadcast Terminal
      await supabase.rpc('notify_division_students', {
        p_division_id: extraDiv,
        p_title: 'Manual Class Started',
        p_message: `Manual ${sessionType} session for ${subjects.find(s => s.id === extraSubject)?.name} has started in ${rooms.find(r => r.id === extraRoom)?.name}. Use Code: ${generatedCode}`,
        p_type: 'class_update'
      })
    }
  }

  async function extendSession(mins) {
    if (!activeSession) return
    const newExpiry = new Date(new Date(activeSession.expires_at).getTime() + mins * 60000).toISOString()
    const { error } = await supabase
      .from('attendance_sessions')
      .update({ expires_at: newExpiry })
      .eq('id', activeSession.id)
    
    if (!error) {
      setActiveSession({ ...activeSession, expires_at: newExpiry })
      toast.success(`Protocol Extended +${mins}m`)
    }
  }

  async function fetchParticipants(sessionId) {
    if (!sessionId) return
    setLoading(true)
    console.log('👥 Synchronizing Participant Registry for:', sessionId)
    
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, profiles:student_id(full_name, role)')
      .eq('session_id', sessionId)
      .order('marked_at', { ascending: false })

    
    if (error) {
      console.error('Participant Sync Error:', error)
      toast.error('Failed to sync participants')
      return
    }

    if (data) {
      setParticipants(data)
    }
    setLoading(false)
  }


  async function verifyStudent(recordId, status) {
    const { error } = await supabase
      .from('attendance_records')
      .update({ verification_status: status, verified_by: profile.id })
      .eq('id', recordId)

    if (!error) {
      toast.success(`Student ${status === 'verified' ? 'Confirmed' : 'Rejected'}`)
      fetchParticipants(activeSession?.id || recordId)
    }
  }

  async function lockSession(sessionId = null) {
    const idToLock = (typeof sessionId === 'string' ? sessionId : null) || activeSession?.id
    if (!idToLock) return

    const { error } = await supabase
      .from('attendance_sessions')
      .update({ status: 'locked' })
      .eq('id', idToLock)
    
    if (!error) {
      setSessionHistory(prev => prev.map(s => s.id === idToLock ? { ...s, status: 'locked' } : s))
      
      if (activeSession?.id === idToLock) {
        await supabase.rpc('notify_division_students', {
          p_division_id: activeSession.division_id,
          p_title: 'Attendance Protocol Terminated',
          p_message: `The attendance beacon for ${activeSession.subject} has been deactivated.`,
          p_type: 'class_update'
        })
        setActiveSession(null)
        setParticipants([])
      }
      
      fetchHistory()
      toast.error('Protocol Deactivated & Ledger Finalized')
    }
  }

  async function purgeParticipant(recordId) {
    if (!window.confirm('Purge this student record from institutional registry?')) return
    const { error } = await supabase.from('attendance_records').delete().eq('id', recordId)
    if (!error) {
      toast.success('Record Expunged')
      fetchParticipants(activeSession.id)
    } else {
      console.error('Purge Record Error:', error)
      toast.error('Failed to purge record')
    }
  }

  async function endAndStartNew() {
    if (!activeSession) return
    await lockSession(activeSession.id)
    setActiveSession(null)
    setParticipants([])
    toast.success('Ready for new protocol')
  }

  async function deleteSession(sessionId) {
    if (!window.confirm('DANGER: Permanently delete this attendance protocol and all associated records?')) return
    
    try {
      console.log('🗑️ Initiating Deep Purge for Session:', sessionId)
      
      const { error: recErr } = await supabase.from('attendance_records').delete().eq('session_id', sessionId)
      if (recErr) console.warn('Record Purge Warning:', recErr)

      const { error } = await supabase
        .from('attendance_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('teacher_id', profile.id)
      
      if (error) throw new Error(error.message || 'Permission Denied by Database')

      setSessionHistory(prev => prev.filter(s => s.id !== sessionId))
      
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
        setParticipants([]);
      }
      
      toast.success('Protocol Fully Purged')
      fetchHistory() 
    } catch (err) {
      console.error('🔥 Fatal Purge Error:', err)
      toast.error(`Purge Failed: ${err.message}`)
      fetchHistory() 
    }
  }







  const [searchTerm, setSearchTerm] = useState('')

  async function exportLedger() {
    if (!participants || participants.length === 0) {
      toast.error('No data available for export')
      return
    }

    try {
      const headers = ['Student Name', 'Role', 'Status', 'Timestamp', 'Verified By']
      const rows = participants.map(p => [
        p.profiles?.full_name || 'Unknown',
        p.profiles?.role || 'Student',
        p.verification_status,
        new Date(p.marked_at).toLocaleString(),
        p.verified_by ? 'Faculty' : 'System'
      ])

      exportTablePDF({
        title: `Attendance Ledger: ${activeSession?.subject || 'Export'}`,
        subtitle: `Terminal: ${rooms.find(r => r.id === activeSession?.classroom_id)?.name || 'Manual'} • ${new Date().toLocaleDateString()}`,
        headers,
        rows,
        filename: `Attendance_${activeSession?.subject || 'Report'}_${new Date().toISOString().split('T')[0]}`,
        summaryCards: [
          { label: 'Session ID', value: activeSession?.id.split('-')[0] },
          { label: 'Total Present', value: participants.filter(p => p.verification_status === 'verified').length },
          { label: 'Protocol Code', value: activeSession?.session_code || 'N/A' }
        ]
      })

      toast.success('Ledger Exported Successfully')
    } catch (err) {
      toast.error('Export Interface Failed')
    }
  }

  async function viewPastSession(session) {

    setActiveSession(session)
    fetchParticipants(session.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast.success(`Reviewing: ${session.subject}`)
  }


  return (
    <FacultyLayout>
      <div className="space-y-8 lg:space-y-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 lg:mb-3">
              <span className={`w-2 h-2 rounded-full animate-pulse ${activeSession ? 'bg-green-500' : 'bg-blue-500'}`} />
              <span className={`text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] ${activeSession ? 'text-green-500' : 'text-blue-500'}`}>
                {activeSession ? 'Live Protocol Active' : 'Protocol Control Center'}
              </span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Manual <span className="text-blue-500">Attendance</span></h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
              {activeSession ? `Synchronizing ${participants.length} active terminals` : 'Initialize institutional attendance beacon'}
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4">
             {activeSession && (
               <button onClick={() => fetchParticipants(activeSession.id)} className="p-3.5 lg:p-4 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl text-blue-500 hover:text-white transition-all shadow-xl">
                 <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
               </button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
           <div className="lg:col-span-2 space-y-8 lg:space-y-12">
              {!activeSession ? (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#161b22]/80 border border-white/5 rounded-3xl lg:rounded-[56px] p-8 lg:p-12 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 lg:p-12 opacity-5 pointer-events-none"><Layout size={200} /></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-8 lg:mb-12">
                            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 shadow-inner"><Zap size={28} lg:size={32} /></div>
                            <div className="text-center lg:text-left">
                                <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Initialize Session</h3>
                                <p className="text-[8px] lg:text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2 italic">Specify parameters for academic broadcast</p>
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                           {/* Custom Dropdowns for Metadata */}
                           <div className="space-y-2 lg:space-y-3">
                              <label className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Academic Semester</label>
                              <div className="relative group/sel">
                                <div className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-[10px] lg:text-xs font-black text-white cursor-pointer flex justify-between items-center group-hover/sel:border-blue-500/50 transition-all shadow-inner">
                                  <span>{semesters.find(s => s.id === extraSem)?.name || 'Select Semester'}</span>
                                  <ChevronDown size={14} className="text-gray-500" />
                                </div>
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover/sel:opacity-100 group-hover/sel:visible transition-all z-50 shadow-xl max-h-48 overflow-y-auto no-scrollbar">
                                   {semesters.map(s => (
                                      <div key={s.id} onClick={() => {setExtraSem(s.id); setExtraSubject(''); setExtraDiv(''); setExtraBatch('');}} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors text-white">Semester {s.name}</div>
                                   ))}
                                </div>
                              </div>
                           </div>

                           <div className="space-y-2 lg:space-y-3">
                              <label className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Division Target</label>
                              <div className={`relative group/sel ${!extraSem ? 'opacity-20 pointer-events-none' : ''}`}>
                                <div className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-[10px] lg:text-xs font-black text-white cursor-pointer flex justify-between items-center group-hover/sel:border-blue-500/50 transition-all shadow-inner">
                                  <span>{divisions.find(d => d.id === extraDiv)?.name ? `Division ${divisions.find(d => d.id === extraDiv)?.name}` : 'Select Division'}</span>
                                  <ChevronDown size={14} className="text-gray-500" />
                                </div>
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover/sel:opacity-100 group-hover/sel:visible transition-all z-50 shadow-xl max-h-48 overflow-y-auto no-scrollbar">
                                   {divisions.filter(d => d.semester_id === extraSem).map(div => (
                                      <div key={div.id} onClick={() => {setExtraDiv(div.id); setExtraBatch('');}} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors text-white">Division {div.name}</div>
                                   ))}
                                </div>
                              </div>
                           </div>

                           <div className="space-y-2 lg:space-y-3">
                              <label className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Subject Manifest</label>
                              <div className={`relative group/sel ${!extraSem ? 'opacity-20 pointer-events-none' : ''}`}>
                                <div className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-[10px] lg:text-xs font-black text-white cursor-pointer flex justify-between items-center group-hover/sel:border-blue-500/50 transition-all shadow-inner">
                                  <span>{subjects.find(s => s.id === extraSubject)?.name || 'Select Subject'}</span>
                                  <ChevronDown size={14} className="text-gray-500" />
                                </div>
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover/sel:opacity-100 group-hover/sel:visible transition-all z-50 shadow-xl max-h-48 overflow-y-auto no-scrollbar">
                                   {subjects.filter(s => s.semester_id === extraSem).map(s => (
                                      <div key={s.id} onClick={() => setExtraSubject(s.id)} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors text-white">{s.name} ({s.code})</div>
                                   ))}
                                </div>
                              </div>
                           </div>

                           <div className="space-y-2 lg:space-y-3">
                              <label className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Room / Terminal</label>
                              <div className="relative group/sel">
                                <div className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-[10px] lg:text-xs font-black text-white cursor-pointer flex justify-between items-center group-hover/sel:border-blue-500/50 transition-all shadow-inner">
                                  <span>{rooms.find(r => r.id === extraRoom)?.name || 'Select Room'}</span>
                                  <ChevronDown size={14} className="text-gray-500" />
                                </div>
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover/sel:opacity-100 group-hover/sel:visible transition-all z-50 shadow-xl max-h-48 overflow-y-auto no-scrollbar">
                                   {rooms.map(r => (
                                      <div key={r.id} onClick={() => setExtraRoom(r.id)} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors text-white">{r.name}</div>
                                   ))}
                                </div>
                              </div>
                           </div>

                           <div className="space-y-2 lg:space-y-3">
                              <label className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Session Protocol</label>
                              <div className="flex gap-1.5 p-1.5 bg-white/5 rounded-xl lg:rounded-2xl border border-white/5 shadow-inner">
                                 {['theory', 'lab', 'tutorial'].map(type => (
                                    <button key={type} onClick={() => setSessionType(type)} className={`flex-1 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all ${sessionType === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>{type}</button>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-2 lg:space-y-3">
                              <label className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Lab Batch (Optional)</label>
                              <div className={`relative group/sel ${sessionType !== 'lab' || !extraDiv ? 'opacity-20 pointer-events-none' : ''}`}>
                                <div className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-[10px] lg:text-xs font-black text-white cursor-pointer flex justify-between items-center group-hover/sel:border-blue-500/50 transition-all shadow-inner">
                                  <span>{batches.find(b => b.id === extraBatch)?.name ? `Batch ${batches.find(b => b.id === extraBatch)?.name}` : 'All Batches'}</span>
                                  <ChevronDown size={14} className="text-gray-500" />
                                </div>
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover/sel:opacity-100 group-hover/sel:visible transition-all z-50 shadow-xl max-h-48 overflow-y-auto no-scrollbar">
                                   <div onClick={() => setExtraBatch('')} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors text-white">All Batches</div>
                                   {batches.filter(b => b.division_id === extraDiv).map(b => (
                                      <div key={b.id} onClick={() => setExtraBatch(b.id)} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors text-white">Batch {b.name}</div>
                                   ))}
                                </div>
                              </div>
                           </div>
                        </div>

                        <button onClick={startManualSession} className="w-full py-6 lg:py-8 bg-blue-600 rounded-2xl lg:rounded-[32px] text-white text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] shadow-3xl shadow-blue-600/30 hover:bg-blue-500 hover:scale-[1.01] active:scale-95 transition-all mt-8 lg:mt-12 flex items-center justify-center gap-4 group">
                           <span>Initialize Broadcast</span>
                           <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.div>
              ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`rounded-3xl lg:rounded-[48px] p-6 md:p-10 lg:p-12 flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-between min-h-fit relative overflow-hidden shadow-2xl border border-white/10 ${activeSession.status === 'active' ? 'bg-blue-600 shadow-blue-900/40' : 'bg-slate-800 shadow-black/40'}`}>
                     <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                     
                     {activeSession.status === 'active' && (
                        <div className="flex flex-col items-center gap-4 relative z-10 w-full md:w-auto shrink-0">
                           <div className="bg-white p-4 rounded-2xl md:rounded-[36px] shadow-3xl transform hover:scale-105 transition-transform flex items-center justify-center">
                              <QRCodeSVG value={activeSession.id} size={220} className="w-full max-w-[160px] md:max-w-[220px] h-auto" level="H" />
                           </div>
                           <div className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl md:rounded-2xl backdrop-blur-xl text-center shadow-xl">
                              <p className="text-[8px] md:text-[9px] font-black text-blue-300 uppercase tracking-[0.4em] mb-1 italic">Manual Protocol Code</p>
                              <h4 className="text-xl md:text-2xl font-black text-white tracking-[0.2em]">{activeSession.session_code || activeSession.id.slice(0, 6).toUpperCase()}</h4>
                           </div>
                        </div>
                     )}

                     <div className="flex-1 text-center md:text-left z-10 w-full">
                        <div className="flex items-center justify-center md:justify-start gap-3 lg:gap-4 mb-4 md:mb-6">
                           <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 text-white text-[8px] lg:text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${activeSession.status === 'active' ? 'bg-white/20' : 'bg-red-500/20 text-red-400'}`}>
                              {activeSession.status === 'active' ? 'Live Beacon' : 'Finalized Ledger'}
                           </div>
                           {activeSession.status === 'active' && (
                              <div className="px-4 py-1.5 bg-red-500/30 border border-red-500/20 rounded-full flex items-center gap-2 text-white text-[8px] lg:text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                 <Clock size={12} /> {timeLeft !== null ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : '--:--'}
                              </div>
                           )}
                        </div>
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight mb-2 md:mb-3 italic leading-none truncate max-w-[300px] lg:max-w-none">{activeSession.subject}</h3>
                        <p className="text-[10px] lg:text-xs text-blue-100 font-medium mb-6 md:mb-8 uppercase tracking-[0.2em] opacity-80 italic">
                           {activeSession.status === 'active' ? 'Scanning Sequence Initiated' : 'Protocol Deactivated • Audit Mode'} • {activeSession.session_type}
                        </p>
                        <div className="flex flex-wrap gap-2 lg:gap-3 justify-center md:justify-start">
                           {activeSession.status === 'active' ? (
                              <>
                              <button onClick={() => extendSession(5)} className="flex-1 sm:flex-none px-4 md:px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-[8px] md:text-[9px] font-black uppercase text-white tracking-widest hover:bg-white/20 transition-all shadow-xl">+5m</button>
                              <button onClick={() => extendSession(10)} className="flex-1 sm:flex-none px-4 md:px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-[8px] md:text-[9px] font-black uppercase text-white tracking-widest hover:bg-white/20 transition-all shadow-xl">+10m</button>
                              <button onClick={() => lockSession(activeSession.id)} className="w-full sm:w-auto px-6 py-3 bg-white text-blue-600 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-2xl hover:bg-gray-55 active:scale-95 transition-all">Terminate</button>
                              <button onClick={endAndStartNew} className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-2xl hover:bg-green-400 active:scale-95 transition-all">End & Start New</button>
                              <button onClick={openManualAddModal} className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-black rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-2xl hover:bg-yellow-400 active:scale-95 transition-all">Manual Check-in</button>
                              </>
                           ) : (
                             <button onClick={() => {setActiveSession(null); setParticipants([])}} className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-500 active:scale-95 transition-all">Create New Session</button>
                           )}
                        </div>
                     </div>
                  </motion.div>
              )}

              <div className="space-y-6 lg:space-y-8">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-3">
                        <Users size={18} className="text-blue-500" />
                        <h3 className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-[0.4em] italic">
                           {activeSession && activeSession.status === 'locked' ? `Session Ledger: ${activeSession.subject}` : `Live Registry (${participants.length})`}
                        </h3>
                    </div>
                    <div className="px-4 py-2 bg-[#161b22] border border-white/5 rounded-full text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest text-center shadow-inner">Realtime Sync Active • {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <AnimatePresence mode="popLayout">
                        {participants.filter(p => 
                            p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length === 0 ? (
                           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-20 lg:py-32 text-center bg-[#161b22]/50 border border-dashed border-white/10 rounded-3xl lg:rounded-[48px] italic text-gray-700 text-[9px] lg:text-[10px] uppercase tracking-widest px-8 shadow-2xl">
                              {searchTerm ? `No results found for "${searchTerm}"` : (activeSession?.status === 'locked' ? 'No student presence detected for this historical session' : 'Waiting for student authentication link...')}
                              {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="block mx-auto mt-4 text-blue-500 font-black hover:underline underline-offset-4">Clear Filter</button>
                              )}
                           </motion.div>
                        ) : participants
                            .filter(p => p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((record) => (
                          <motion.div key={record.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1c2128] border border-white/5 rounded-2xl lg:rounded-3xl p-5 flex flex-col sm:flex-row items-center sm:justify-between gap-5 lg:gap-4 group hover:border-blue-500/30 transition-all shadow-xl">
                             <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="w-12 h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-105 transition-transform shrink-0 shadow-blue-500/20">{record.profiles?.full_name?.[0] || 'S'}</div>
                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                   <h4 className="text-[12px] lg:text-[13px] font-black text-white uppercase tracking-tight truncate">{record.profiles?.full_name || 'Unknown Student'}</h4>

                                   <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                       <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest italic">{new Date(record.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                       <span className="w-1 h-1 rounded-full bg-blue-500/30" />
                                       <span className="text-[8px] text-blue-500 font-black uppercase tracking-widest animate-pulse">LIVE NODE</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex gap-2 w-full sm:w-auto">
                                {record.verification_status === 'verified' ? (
                                   <button onClick={() => verifyStudent(record.id, 'rejected')} className="flex-1 sm:flex-none px-6 py-3 bg-red-500/10 text-red-500 rounded-xl lg:rounded-2xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-inner">Mark Absent</button>
                                ) : (
                                   <button onClick={() => verifyStudent(record.id, 'verified')} className="flex-1 sm:flex-none px-6 py-3 bg-green-500/10 text-green-500 rounded-xl lg:rounded-2xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest border border-green-500/20 hover:bg-green-500 hover:text-white transition-all shadow-inner">Mark Present</button>
                                )}
                                <button onClick={() => purgeParticipant(record.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl lg:rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10 shadow-inner" title="Delete Scan"><Trash2 size={16} /></button>
                             </div>

                          </motion.div>
                        ))}
                    </AnimatePresence>
                 </div>
              </div>

              {/* SESSION HISTORY / ACADEMIC REGISTRY */}
              <div className="space-y-6 lg:space-y-8 pt-8 border-t border-white/5">
                   <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-3">
                           <History size={18} className="text-gray-500" />
                           <h3 className="text-[9px] lg:text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] italic">Academic Session Registry</h3>
                       </div>
                       <button 
                         onClick={fetchHistory}
                         className="p-2.5 bg-white/5 text-gray-500 rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-inner border border-white/5"
                         title="Sync History"
                       >
                          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                       </button>
                   </div>

                  <div className="bg-[#161b22]/50 border border-white/5 rounded-3xl lg:rounded-[48px] overflow-x-auto shadow-2xl">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                              <tr className="border-b border-white/5 bg-white/2">
                                  <th className="px-8 py-6 text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Protocol Date</th>
                                  <th className="px-8 py-6 text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Subject / Terminal</th>
                                  <th className="px-8 py-6 text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Target</th>
                                  <th className="px-8 py-6 text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Status</th>
                                  <th className="px-8 py-6 text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest text-right italic">Action</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {sessionHistory.length === 0 ? (
                                  <tr>
                                      <td colSpan="5" className="px-8 py-16 text-center text-[9px] lg:text-[10px] text-gray-700 italic uppercase tracking-widest">No protocol history detected in local ledger</td>
                                  </tr>
                              ) : sessionHistory.map(session => (
                                  <tr key={session.id} className="hover:bg-white/[0.02] transition-colors group">
                                      <td className="px-8 py-6">
                                          <div className="text-xs lg:text-sm font-black text-white">{new Date(session.created_at).toLocaleDateString()}</div>
                                          <div className="text-[8px] lg:text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1 italic">{new Date(session.created_at).toLocaleTimeString()}</div>
                                      </td>
                                      <td className="px-8 py-6">
                                          <div className="text-xs lg:text-sm font-black text-white uppercase italic truncate max-w-[150px]">{session.subject}</div>
                                          <div className="text-[8px] lg:text-[9px] text-blue-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1 italic"><MapPin size={10} /> {session.academic_classrooms?.name || 'Manual Venue'}</div>
                                      </td>
                                      <td className="px-8 py-6">
                                          <div className="text-xs lg:text-sm font-black text-white">DIV {session.academic_divisions?.name}</div>
                                          <div className="text-[8px] lg:text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1 italic">{session.session_type}</div>
                                      </td>
                                      <td className="px-8 py-6">
                                          <span className={`px-4 py-1.5 rounded-full text-[7px] lg:text-[8px] font-black uppercase tracking-widest border ${session.status === 'locked' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                              {session.status}
                                          </span>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                           <div className="flex items-center justify-end gap-2">
                                              {session.status === 'active' && (
                                                 <button onClick={() => lockSession(session.id)} className="px-4 py-2 bg-red-600/10 text-red-500 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-inner border border-red-500/10">Terminate</button>
                                              )}
                                              <button onClick={() => viewPastSession(session)} className="px-4 py-2 bg-blue-600/10 text-blue-500 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-inner border border-blue-500/10">Review</button>
                                              <button onClick={() => deleteSession(session.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-500/10 shadow-inner"><Trash2 size={14} /></button>
                                           </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
           </div>

           <div className="space-y-6 lg:space-y-8">
              <div className="bg-[#161b22]/80 border border-white/5 rounded-3xl lg:rounded-[48px] p-8 lg:p-10 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"><Settings size={80} /></div>
                 <h4 className="text-[9px] lg:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8 lg:mb-10 italic">Advanced Protocol Controls</h4>
                 <div className="space-y-4">
                    <button onClick={async () => {
                        if (!activeSession || participants.length === 0) return;
                        if (!window.confirm('Mark ALL participants as PRESENT?')) return;
                        const { error } = await supabase.from('attendance_records').update({ verification_status: 'verified', verified_by: profile.id }).eq('session_id', activeSession.id);
                        if (!error) { toast.success('Global Protocol: ALL VERIFIED'); fetchParticipants(activeSession.id); }
                    }} className="w-full p-5 lg:p-6 bg-white/5 border border-white/5 rounded-2xl lg:rounded-3xl flex items-center justify-between group/btn hover:bg-white/10 transition-all shadow-inner">
                       <div className="flex items-center gap-4 lg:gap-5">
                          <CheckCircle2 size={20} lg:size={22} className="text-green-500 group-hover/btn:scale-110 transition-transform" />
                          <div className="text-left">
                            <span className="block text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/btn:text-white transition-colors">Confirm All</span>
                            <span className="block text-[8px] lg:text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1 italic">Bulk presence verification</span>
                          </div>
                       </div>
                       <ChevronRight size={14} className="text-gray-700" />
                    </button>

                    <button onClick={async () => {
                        if (!activeSession || participants.length === 0) return;
                        if (!window.confirm('Mark ALL participants as ABSENT?')) return;
                        const { error } = await supabase.from('attendance_records').update({ verification_status: 'rejected', verified_by: profile.id }).eq('session_id', activeSession.id);
                        if (!error) { toast.success('Global Protocol: ALL REJECTED'); fetchParticipants(activeSession.id); }
                    }} className="w-full p-5 lg:p-6 bg-white/5 border border-white/5 rounded-2xl lg:rounded-3xl flex items-center justify-between group/btn hover:bg-white/10 transition-all shadow-inner">
                       <div className="flex items-center gap-4 lg:gap-5">
                          <X size={20} lg:size={22} className="text-red-500 group-hover/btn:scale-110 transition-transform" />
                          <div className="text-left">
                            <span className="block text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/btn:text-white transition-colors">Reject All</span>
                            <span className="block text-[8px] lg:text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1 italic">Bulk absence synchronization</span>
                          </div>
                       </div>
                       <ChevronRight size={14} className="text-gray-700" />
                    </button>
                    
                    <button 
                        onClick={() => {
                           const query = prompt('Enter student name to filter:');
                           if (query !== null) setSearchTerm(query);
                        }}
                        className="w-full p-5 lg:p-6 bg-white/5 border border-white/5 rounded-2xl lg:rounded-3xl flex items-center justify-between group/btn hover:bg-white/10 transition-all shadow-inner"
                     >
                        <div className="flex items-center gap-4 lg:gap-5">
                           <Filter size={20} lg:size={22} className="text-gray-500 group-hover/btn:text-blue-500 transition-colors" />
                           <div className="text-left">
                             <span className="block text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/btn:text-white transition-colors">Filter Registry</span>
                             <span className="block text-[8px] lg:text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1 italic">{searchTerm ? `Searching: ${searchTerm}` : 'Search student...'}</span>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-700" />
                     </button>
                     
                     <button 
                        onClick={exportLedger}
                        className="w-full p-5 lg:p-6 bg-white/5 border border-white/5 rounded-2xl lg:rounded-3xl flex items-center justify-between group/btn hover:bg-white/10 transition-all shadow-inner"
                     >
                        <div className="flex items-center gap-4 lg:gap-5">
                           <ExternalLink size={20} lg:size={22} className="text-gray-500 group-hover/btn:text-blue-500 transition-colors" />
                           <div className="text-left">
                             <span className="block text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/btn:text-white transition-colors">Export Ledger</span>
                             <span className="block text-[8px] lg:text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1 italic">XLSX / CSV Output</span>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-700" />
                     </button>
                 </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl lg:rounded-[48px] p-8 lg:p-10 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform pointer-events-none"><GraduationCap size={160} /></div>
                  <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] mb-4 lg:mb-6 opacity-60 italic">System Operational Directive</p>
                  <p className="text-sm lg:text-base font-black italic leading-tight uppercase tracking-tight">The timetable registry has been decommissioned. all sessions are now managed via manual protocol initialization for maximum institutional flexibility.</p>
                  <div className="mt-6 lg:mt-8 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest">All student beacons active</span>
                  </div>
              </div>
           </div>
        </div>
      </div>
      {/* MANUAL ADD STUDENT MODAL */}
      <AnimatePresence>
        {showManualAddModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowManualAddModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#161b22] border border-white/10 rounded-[32px] p-8 shadow-2xl z-10 text-left"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Manual Check-In</h3>
                <button
                  type="button"
                  onClick={() => setShowManualAddModal(false)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitManualAttendance} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Select Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-xs font-bold text-white uppercase tracking-widest focus:border-blue-500 outline-none"
                  >
                    <option value="">-- Choose Student --</option>
                    {divisionStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submittingManual || !selectedStudentId}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all"
                >
                  {submittingManual ? 'Registering Presence...' : 'Mark Present'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </FacultyLayout>
  )
}

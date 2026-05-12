import { useState, useEffect } from 'react'
import { GraduationCap, Plus, Users, Clock, CheckCircle2, QrCode, Trash2, Calendar, Search, Filter, MoreHorizontal, X, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/index'

export default function FacultyAttendancePage() {
  const { profile } = useAuthStore()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [subject, setSubject] = useState('')
  const [participants, setParticipants] = useState([])

  useEffect(() => {
    fetchSessions()
  }, [profile?.id])

  async function fetchSessions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('attendance_sessions')
      .select('*, attendance_records(count)')
      .eq('teacher_id', profile.id)
      .order('created_at', { ascending: false })
    
    if (data) setSessions(data)
    setLoading(false)
  }

  async function createSession(e) {
    e.preventDefault()
    if (!subject) return

    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert({
        teacher_id: profile.id,
        subject: subject,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        qr_code: Math.random().toString(36).substring(2, 15)
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to initialize session')
    } else {
      toast.success('Attendance Protocol Active')
      setIsModalOpen(false)
      fetchSessions()
      setSelectedSession(data)
    }
  }

  async function fetchParticipants(sessionId) {
    const { data } = await supabase
      .from('attendance_records')
      .select('*, profiles(full_name, role)')
      .eq('session_id', sessionId)
    
    if (data) setParticipants(data)
  }

  return (
    <FacultyLayout>
      <div className="space-y-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Registry Management Node</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">Attendance System</h2>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3"
          >
             <Plus size={16} /> New Session
          </button>
        </div>

        {/* ACTIVE SESSION DISPLAY (If selected) */}
        <AnimatePresence>
           {selectedSession && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
               className="bg-blue-600/10 border border-blue-500/20 rounded-[48px] p-10 flex flex-col md:flex-row gap-12 items-center"
             >
                <div className="bg-white p-6 rounded-[40px] shadow-2xl">
                   <QRCodeSVG value={selectedSession.id} size={200} level="H" />
                </div>
                <div className="flex-1 text-center md:text-left">
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Active QR Beacon</p>
                   <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2 italic">{selectedSession.subject}</h3>
                   <p className="text-sm text-gray-500 font-medium mb-8">Scan the code to mark attendance. Session expires in 60 minutes.</p>
                   
                   <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                         <Users size={16} className="text-blue-500" />
                         <span className="text-sm font-black text-white">{participants.length} Present</span>
                      </div>
                      <button 
                        onClick={() => setSelectedSession(null)}
                        className="px-6 py-3 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                      >
                         Deactivate Beacon
                      </button>
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>

        {/* RECENT SESSIONS */}
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Registry History</h3>
              <div className="flex-1 h-[1px] bg-white/5" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full py-20 text-center"><div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" /></div>
              ) : sessions.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-[40px] italic text-gray-600 font-black uppercase text-[10px] tracking-widest">No Active Registries Found</div>
              ) : sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { setSelectedSession(session); fetchParticipants(session.id); }}
                  className="bg-[#161b22]/80 border border-white/5 rounded-[40px] p-8 backdrop-blur-2xl hover:bg-white/5 transition-all cursor-pointer group"
                >
                   <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                         <GraduationCap size={24} />
                      </div>
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                         {new Date(session.created_at).toLocaleDateString()}
                      </span>
                   </div>
                   <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2 italic truncate">{session.subject}</h4>
                   <div className="flex items-center gap-4 mb-8">
                      <div className="flex items-center gap-1.5">
                         <Users size={14} className="text-gray-600" />
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{session.attendance_records?.[0]?.count || 0} Students</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <div className="flex items-center gap-1.5">
                         <Clock size={14} className="text-gray-600" />
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Archive</span>
                      </div>
                   </div>
                   <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-2">View Manifest <ArrowRight size={12} /></span>
                      <MoreHorizontal size={18} className="text-gray-700" />
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </div>

      {/* NEW SESSION MODAL */}
      <AnimatePresence>
         {isModalOpen && (
           <>
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md"
               onClick={() => setIsModalOpen(false)}
             />
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="fixed inset-x-6 top-[20%] max-w-lg mx-auto bg-slate-900 border border-white/10 rounded-[48px] z-[101] p-12 shadow-2xl"
             >
                <div className="flex items-center justify-between mb-10">
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Initialize Registry</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500"><X size={20} /></button>
                </div>

                <form onSubmit={createSession} className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Subject Manifest</label>
                      <input 
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="e.g. Advanced Data Structures"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-blue-500/30" 
                        required 
                      />
                   </div>

                   <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-6">
                      <div className="flex items-center gap-3 mb-2">
                         <Clock size={16} className="text-blue-500" />
                         <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Protocol Auto-Expiry</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed uppercase tracking-widest">This attendance session will automatically terminate in 60 minutes for security synchronization.</p>
                   </div>

                   <button type="submit" className="w-full py-6 rounded-[28px] bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all">
                      Broadcast QR Beacon
                   </button>
                </form>
             </motion.div>
           </>
         )}
      </AnimatePresence>
    </FacultyLayout>
  )
}

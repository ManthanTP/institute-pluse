import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, CheckCircle, AlertCircle, ChevronLeft, Home, LayoutGrid, CalendarDays, Coffee, User, Activity, ShieldCheck, Zap, X, Clock, MapPin, Loader2, Bell } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function AttendancePage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [tab, setTab] = useState('analytics')
  const [scanning, setScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [stats, setStats] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentClass, setCurrentClass] = useState(null)
  const [notifications, setNotifications] = useState([])
  
  useEffect(() => {
    fetchAttendanceData()
    fetchTodaySchedule()
    fetchNotifications()
    
    // Subscribe to notifications
    const sub = supabase
      .channel('notifs')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'student_notifications',
        filter: `student_id=eq.${profile.id}`
      }, () => {
        fetchNotifications()
        fetchTodaySchedule()
        toast('New Schedule Update Detected', { icon: '📢' })
      })
      .subscribe()
    
    return () => { supabase.removeChannel(sub) }
  }, [profile?.id])

  async function fetchNotifications() {
    const { data } = await supabase
      .from('student_notifications')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setNotifications(data)
  }

  async function fetchTodaySchedule() {
    if (!profile?.division_id) return
    
    const { data } = await supabase
      .from('attendance_sessions')
      .select('*, academic_classrooms(name)')
      .eq('division_id', profile.division_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      if (new Date(data.expires_at) > new Date()) {
        setCurrentClass(data)
      } else {
        setCurrentClass(null)
      }
    } else {
      setCurrentClass(null)
    }
  }


  async function fetchAttendanceData() {
    if (!profile?.id || !profile?.division_id) return
    setLoading(true)

    const { data: allSessions } = await supabase
      .from('attendance_sessions')
      .select('subject')
      .eq('division_id', profile.division_id)

    const { data: records } = await supabase
      .from('attendance_records')
      .select('*, attendance_sessions(*)')
      .eq('student_id', profile.id)
      .order('marked_at', { ascending: false })
    
    if (records) {
      setHistory(records)
      const subjectMap = {}
      
      if (allSessions) {
        allSessions.forEach(s => {
          if (!subjectMap[s.subject]) {
            subjectMap[s.subject] = { name: s.subject, present: 0, total: 0, hasPending: false }
          }
          subjectMap[s.subject].total += 1
        })
      }

      records.forEach(r => {
        const sub = r.attendance_sessions?.subject
        if (sub && subjectMap[sub]) {
          if (r.verification_status === 'verified') {
            subjectMap[sub].present += 1
          } else if (r.verification_status === 'pending') {
            subjectMap[sub].hasPending = true
          }
        }
      })
      
      setStats(Object.values(subjectMap))
    }
    setLoading(false)
  }



  const startScanner = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
       toast.error('Terminal Hardware Not Detected')
       return
    }

    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
       toast.error('Secure Environment (HTTPS) Required')
       return
    }

    setScanning(true)
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner("reader", { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        })
        
        scanner.render(async (decodedText) => {
          await scanner.clear()
          setScanning(false)
          await markAttendance(decodedText)
        }, (error) => {
          // Silent scan errors
        })
      } catch (err) {
        toast.error('Optical Interface Initialization Failed')
        setScanning(false)
      }
    }, 100)
  }

  async function markAttendance(inputCode) {
    try {
      let finalSessionId = inputCode;
      
      // Handle 6-character manual code (Reliable JS matching)
      // Handle 6-character manual code (Reliable institutional match)
      if (inputCode.length === 6) {
        console.log('🗝️ Attempting Manual Protocol Match:', inputCode)
        const { data: sessions, error: matchErr } = await supabase
          .from('attendance_sessions')
          .select('*')
          .eq('status', 'active')
          .eq('division_id', profile.division_id)
        
        if (matchErr) throw matchErr;
        
        // Match against explicit session_code OR fallback to ID prefix
        const matchedSession = sessions?.find(s => 
          (s.session_code && s.session_code.toLowerCase() === inputCode.toLowerCase()) ||
          s.id.toLowerCase().startsWith(inputCode.toLowerCase())
        );

        if (!matchedSession) throw new Error('Invalid Manual Code or Terminal Mismatch');
        finalSessionId = matchedSession.id;
        console.log('✅ Manual Protocol Synchronized:', finalSessionId)
      }


      const { data: session, error: sErr } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('id', finalSessionId)
        .single()

      if (sErr || !session) throw new Error('Invalid Protocol Node')
      if (session.status !== 'active') throw new Error('Attendance Beacon Expired')
      if (new Date(session.expires_at) < new Date()) throw new Error('Time Sync Timeout')

      if (session.division_id !== profile.division_id) {
         throw new Error('Division Mismatch Detected')
      }
      
      const { data: existing } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('session_id', finalSessionId)
        .eq('student_id', profile.id)
        .single()

      if (existing) throw new Error('Sequence Already Synchronized')

      const { error: iErr } = await supabase
        .from('attendance_records')
        .insert({
          session_id: finalSessionId,
          student_id: profile.id,
          verification_status: 'verified'
        })

      if (iErr) throw iErr

      setScanSuccess(true)
      toast.success('Presence Synchronized Successfully')
      fetchAttendanceData()
      setTimeout(() => setScanSuccess(false), 3000)
    } catch (err) {
      toast.error(err.message)
    }
  }



  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-indigo-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Registry</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Status</p>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Authenticated</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <ShieldCheck size={24} />
             </div>
          </div>
        </div>

        {/* NOTIFICATIONS TICKER */}
        {notifications.length > 0 && (
           <div className="mb-10 overflow-hidden bg-blue-600/10 border border-blue-500/20 rounded-3xl p-4 flex items-center gap-4">
              <Bell size={18} className="text-blue-500 animate-bounce" />
              <div className="flex-1 overflow-hidden">
                 <motion.p 
                   animate={{ x: [300, -500] }}
                   transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                   className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap"
                 >
                    {notifications[0].title}: {notifications[0].message} • Synchronizing Schedule in Realtime •
                 </motion.p>
              </div>
           </div>
        )}

        {/* TODAY'S PROTOCOL (Active Timetable) */}
        <div className="mb-10">
           <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Active Schedule</span>
              <div className="flex-1 h-[1px] bg-white/5" />
           </div>

           {currentClass ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="rounded-[40px] p-8 relative overflow-hidden group shadow-2xl transition-all duration-500 bg-gradient-to-br from-blue-600 to-indigo-700"
              >
                 <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Clock size={160} />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/20 text-white">
                          Live Protocol
                       </div>
                       <div className="flex items-center gap-1.5 text-blue-100 text-[10px] font-black uppercase tracking-widest">
                          <MapPin size={12} /> {currentClass.academic_classrooms?.name || 'Manual Venue'}
                       </div>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 italic leading-tight">{currentClass.subject}</h2>
                    <p className="text-sm text-blue-100 font-medium uppercase tracking-[0.2em]">
                       Expires: {new Date(currentClass.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {currentClass.session_type}
                    </p>
                 </div>
              </motion.div>
           ) : (

             <div className="bg-[#161b22]/50 border border-white/5 rounded-[40px] p-8 text-center">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">No Ongoing Protocol Detected</p>
             </div>
           )}
        </div>

        {/* QR SCAN MODULE */}
        <div className="space-y-6 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden rounded-[48px] p-10 border transition-all duration-700 ${
              scanSuccess ? 'bg-green-600/20 border-green-500/30' : 'bg-[#161b22]/80 border-white/5 backdrop-blur-2xl'
            }`}
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={startScanner}
                disabled={scanning || currentClass?.status === 'cancelled'}
                className={`w-28 h-28 rounded-[36px] mb-8 flex items-center justify-center transition-all duration-500 ${
                  scanSuccess 
                    ? 'bg-green-600 shadow-[0_0_50px_rgba(34,197,94,0.5)]' 
                    : (currentClass?.status === 'cancelled' ? 'bg-red-500/10 opacity-50 cursor-not-allowed' : 'bg-white/5 border border-white/10 hover:bg-white/10')
                }`}
              >
                {scanSuccess ? (
                  <CheckCircle size={48} className="text-white" />
                ) : scanning ? (
                  <Loader2 size={48} className="text-blue-500 animate-spin" />
                ) : (
                  <QrCode size={48} className={currentClass?.status === 'cancelled' ? 'text-gray-700' : 'text-blue-500'} />
                )}
              </motion.button>
              
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">
                {scanSuccess ? 'Sequence Sent' : currentClass?.status === 'cancelled' ? 'Protocol Offline' : scanning ? 'Decrypting...' : 'Scanner Node'}
              </h2>
              <p className="text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase">
                {scanSuccess ? 'Awaiting Faculty Verification' : currentClass?.status === 'cancelled' ? 'Class Cancelled by Faculty' : 'Initiate Optical Link'}
              </p>
            </div>
          </motion.div>

          {!scanning && !scanSuccess && (
             <div className="space-y-4">
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <ShieldCheck size={18} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                   </div>
                   <input 
                     type="text" 
                     placeholder="Enter 6-digit manual code..."
                     className="w-full pl-16 pr-6 py-6 bg-[#161b22]/50 border border-white/5 rounded-[32px] text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-black uppercase tracking-[0.2em]"
                     maxLength={6}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && e.target.value.length === 6) {
                         markAttendance(e.target.value)
                         e.target.value = ''
                       }
                     }}
                   />
                </div>
                <p className="px-6 text-[8px] text-gray-700 font-black uppercase tracking-[0.4em] text-center">Bypass Scanner? Enter the 6-character protocol code</p>
             </div>
          )}

        </div>

        {/* SCANNER OVERLAY */}
        <AnimatePresence>
           {scanning && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-10"
             >
                <div className="flex items-center justify-between w-full mb-10">
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Optical Matrix</h3>
                   <button onClick={() => setScanning(false)} className="p-4 rounded-2xl bg-white/5 text-gray-500"><X size={20} /></button>
                </div>
                <div id="reader" className="w-full max-w-sm rounded-[40px] overflow-hidden border-2 border-blue-500/30" />
                <p className="mt-10 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] text-center">Center Beacon in Grid</p>
             </motion.div>
           )}
        </AnimatePresence>

        {/* TABS */}
        <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-[32px] mb-12">
          {['Analytics', 'History'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t.toLowerCase())}
              className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${
                tab === t.toLowerCase() 
                  ? 'bg-white text-black shadow-xl' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* LIST SECTION */}
        <div className="space-y-4 pb-20">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" /></div>
          ) : tab === 'analytics' ? (
            stats.length === 0 ? (
               <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[40px] font-black uppercase text-[10px] tracking-widest text-gray-600 italic">No Registry Data Detected</div>
            ) : stats.map((sub, i) => {
              const pct = Math.round((sub.present / sub.total) * 100)
              const low = pct < 75
              return (
                <motion.div
                  key={sub.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-[#161b22]/80 border border-white/5 rounded-[36px] p-6 backdrop-blur-2xl flex items-center gap-6 group transition-all ${low ? 'border-red-500/20 bg-red-500/5' : ''}`}
                >
                  <div className="relative">
                    <AttendanceRing percentage={pct} size={64} />
                    {low && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight truncate mb-1">{sub.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{sub.present} / {sub.total} Sessions</span>
                      {low && !sub.hasPending && <span className="px-3 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[7px] font-black uppercase tracking-widest border border-red-500/20">Low Attendance</span>}
                      {sub.hasPending && <span className="px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[7px] font-black uppercase tracking-widest border border-blue-500/20">Pending Verification</span>}

                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            history.length === 0 ? (
              <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[40px] font-black uppercase text-[10px] tracking-widest text-gray-600 italic">No Session History Detected</div>
            ) : history.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#161b22]/80 border border-white/5 rounded-[32px] p-6 flex items-center justify-between backdrop-blur-2xl"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${
                    rec.verification_status === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    rec.verification_status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                  }`}>
                    {rec.verification_status === 'verified' ? <CheckCircle size={22} /> : 
                     rec.verification_status === 'rejected' ? <X size={22} /> : 
                     <Clock size={22} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight mb-1">{rec.attendance_sessions.subject}</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{new Date(rec.marked_at).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                   rec.verification_status === 'verified' ? 'bg-green-500/5 border-green-500/10 text-green-500' :
                   rec.verification_status === 'rejected' ? 'bg-red-500/5 border-red-500/10 text-red-500' :
                   'bg-yellow-500/5 border-yellow-500/10 text-yellow-500'
                }`}>
                   {rec.verification_status}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* BOTTOM NAV BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100]">
        <div className="bg-[#161b22]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <NavIcon icon={Home} label="Home" onClick={() => navigate('/dashboard')} />
          <NavIcon icon={LayoutGrid} label="Log" onClick={() => navigate('/carbon-log')} />
          <NavIcon icon={CalendarDays} label="Events" onClick={() => navigate('/events')} />
          <NavIcon icon={Coffee} label="Cafe" onClick={() => navigate('/cafeteria')} />
          <NavIcon icon={User} label="Me" onClick={() => navigate('/profile')} />
        </div>
      </div>
    </div>
  )
}

function AttendanceRing({ percentage, size = 64 }) {
  const color = percentage >= 75 ? '#22c55e' : percentage >= 60 ? '#f59e0b' : '#ef4444'
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percentage / 100) * circ

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
        <motion.circle 
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-black" style={{ color }}>{percentage}%</span>
      </div>
    </div>
  )
}

function NavIcon({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? 'text-blue-500' : 'text-gray-500 hover:text-white'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}`}>
        <Icon size={20} strokeWidth={active ? 3 : 2} />
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
    </button>
  )
}

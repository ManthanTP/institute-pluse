import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, CheckCircle, AlertCircle, ChevronLeft, Home, LayoutGrid, CalendarDays, Coffee, User, Activity, ShieldCheck, Zap } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const DEMO_SUBJECTS = [
  { name: 'Data Structures', present: 18, total: 22 },
  { name: 'Operating Systems', present: 15, total: 20 },
  { name: 'Computer Networks', present: 19, total: 21 },
  { name: 'Database Management', present: 12, total: 18 },
  { name: 'Web Technologies', present: 20, total: 22 },
]

export default function AttendancePage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [tab, setTab] = useState('subjects')
  const [scanning, setScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)

  function simulateScan() {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setScanSuccess(true)
      toast.success('Sequence Synchronized')
      setTimeout(() => setScanSuccess(false), 3000)
    }, 2000)
  }

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-green-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-blue-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Attendance</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-600/10 border border-green-500/20 flex items-center justify-center text-green-500">
             <ShieldCheck size={24} className="animate-pulse" />
          </div>
        </div>

        {/* QR SCAN MODULE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative overflow-hidden rounded-[48px] p-10 mb-12 border transition-all duration-700 ${
            scanSuccess ? 'bg-green-600/20 border-green-500/30' : 'bg-[#161b22]/80 border-white/5 backdrop-blur-2xl'
          }`}
        >
          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={simulateScan}
              disabled={scanning}
              className={`w-28 h-28 rounded-[36px] mb-8 flex items-center justify-center transition-all duration-500 ${
                scanSuccess 
                  ? 'bg-green-600 shadow-[0_0_50px_rgba(34,197,94,0.5)]' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              {scanSuccess ? (
                <CheckCircle size={48} className="text-white" />
              ) : scanning ? (
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <QrCode size={48} className="text-green-500" />
              )}
            </motion.button>
            
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">
              {scanSuccess ? 'Sync Complete' : scanning ? 'Decrypting...' : 'Biometric Link'}
            </h2>
            <p className="text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase">
              {scanSuccess ? 'Registry Updated Successfully' : 'Align Terminal Interface'}
            </p>
          </div>
        </motion.div>

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
        <div className="space-y-4">
          {tab === 'subjects' ? (
            DEMO_SUBJECTS.map((sub, i) => {
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
                      {low && <span className="px-3 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[7px] font-black uppercase tracking-widest border border-red-500/20">Critical Flux</span>}
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            [...Array(6)].map((_, i) => {
              const present = Math.random() > 0.2
              const subjects = DEMO_SUBJECTS[i % DEMO_SUBJECTS.length]
              const date = new Date()
              date.setDate(date.getDate() - i)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#161b22]/80 border border-white/5 rounded-[32px] p-6 flex items-center justify-between backdrop-blur-2xl"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${present ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                      {present ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight mb-1">{subjects.name}</p>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${present ? 'bg-green-500/5 border-green-500/10 text-green-500' : 'bg-red-500/5 border-red-500/10 text-red-500'}`}>
                     {present ? 'Marked' : 'Absent'}
                  </div>
                </motion.div>
              )
            })
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
      className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}`}>
        <Icon size={20} strokeWidth={active ? 3 : 2} />
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
    </button>
  )
}

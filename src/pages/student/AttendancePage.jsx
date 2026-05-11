import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const DEMO_SUBJECTS = [
  { name: 'Data Structures', present: 18, total: 22 },
  { name: 'Operating Systems', present: 15, total: 20 },
  { name: 'Computer Networks', present: 19, total: 21 },
  { name: 'Database Management', present: 12, total: 18 },
  { name: 'Web Technologies', present: 20, total: 22 },
]

function AttendanceRing({ percentage, size = 56 }) {
  const color = percentage >= 75 ? '#16a34a' : percentage >= 60 ? '#f59e0b' : '#ef4444'
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percentage / 100) * circ

  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset 0.8s' }} />
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={color} fontFamily="Inter">
        {percentage}%
      </text>
    </svg>
  )
}

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
      toast.success('Attendance marked! +5 eco-points 🌿')
      setTimeout(() => setScanSuccess(false), 3000)
    }, 2000)
  }

  return (
    <main className="max-w-4xl mx-auto space-y-8">
      {/* QR SCAN MODULE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[40px] p-8 border border-white/5 shadow-2xl"
        style={{
          background: scanSuccess 
            ? 'linear-gradient(135deg, rgba(6, 95, 70, 0.4), rgba(5, 150, 105, 0.2))'
            : 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
        }}
      >
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-green-500/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col items-center text-center py-6">
          <button
            onClick={simulateScan}
            disabled={scanning}
            className={`w-24 h-24 rounded-3xl mb-6 flex items-center justify-center transition-all duration-500 ${
              scanSuccess 
                ? 'bg-green-600 shadow-[0_0_30px_rgba(34,197,94,0.4)]' 
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {scanSuccess ? (
              <CheckCircle size={40} className="text-white" />
            ) : scanning ? (
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <QrCode size={40} className="text-green-500" />
            )}
          </button>
          
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
            {scanSuccess ? 'Registry Synchronized' : scanning ? 'Scanning Nexus Grid...' : 'Biometric Attendance'}
          </h2>
          <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-8">
            {scanSuccess ? '+5 ECO-POINTS AWARDED' : 'ALIGN DEVICE TO TERMINAL QR'}
          </p>
          
          {!scanSuccess && !scanning && (
            <div className="px-6 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-500 uppercase tracking-widest">
              🌿 Sustainability Multiplier Active
            </div>
          )}
        </div>
      </motion.div>

      {/* TABS */}
      <div className="flex gap-4 p-1.5 rounded-2xl bg-white/5 border border-white/5 max-w-sm mx-auto">
        <button 
          onClick={() => setTab('subjects')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            tab === 'subjects' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-gray-500 hover:text-white'
          }`}
        >
          Analytics
        </button>
        <button 
          onClick={() => setTab('history')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            tab === 'history' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-gray-500 hover:text-white'
          }`}
        >
          Telemetry
        </button>
      </div>

      <div className="nexus-grid">
        {tab === 'subjects' ? (
          DEMO_SUBJECTS.map((sub, i) => {
            const pct = Math.round((sub.present / sub.total) * 100)
            const low = pct < 75
            return (
              <motion.div
                key={sub.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-6 flex items-center gap-6 ${low ? 'border-red-500/20' : ''}`}
              >
                <AttendanceRing percentage={pct} size={64} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-white mb-1 truncate">{sub.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{sub.present}/{sub.total} UNITS</span>
                    {low && <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest">Low Flux</span>}
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
                className="glass-card p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${present ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {present ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white leading-none mb-1">{subjects.name}</p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className={`text-[9px] font-black uppercase tracking-widest ${present ? 'text-green-500' : 'text-red-500'}`}>
                   {present ? 'Marked' : 'Absent'}
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </main>
  )
}

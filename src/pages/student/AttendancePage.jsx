import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, QrCode, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import BottomTabBar from '../../components/BottomTabBar'
import toast from 'react-hot-toast'

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
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: '80px' }}>
      <header className="app-header">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <span className="font-bold text-white">🎓 Attendance</span>
        <div />
      </header>

      {/* QR SCAN BUTTON */}
      <div className="px-4 pt-4 mb-4">
        <button
          onClick={simulateScan}
          className="w-full py-5 rounded-2xl flex flex-col items-center gap-2 transition-all"
          style={{
            background: scanSuccess ? '#f0fdf4' : 'linear-gradient(135deg, #166534, #16a34a)',
            border: scanSuccess ? '2px solid #16a34a' : 'none',
          }}
          disabled={scanning}
        >
          {scanSuccess ? (
            <>
              <CheckCircle size={40} className="text-green-600" />
              <span className="font-bold text-green-700">✅ Attendance Marked! +5 eco-points</span>
            </>
          ) : scanning ? (
            <>
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <span className="font-bold text-white">Scanning QR Code...</span>
            </>
          ) : (
            <>
              <QrCode size={40} color="white" />
              <span className="font-bold text-white text-lg">Scan QR Code</span>
              <span className="text-xs text-green-200">Tap to open camera and mark attendance</span>
            </>
          )}
        </button>
      </div>

      {/* ECO BANNER */}
      <div className="px-4 mb-4">
        <div className="card p-3" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
          <p className="text-xs text-green-700 font-medium">🌿 Paperless attendance saves paper and earns eco-points! Each scan = +5 pts</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 px-4 mb-4">
        <button onClick={() => setTab('subjects')}
          className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: tab === 'subjects' ? '#16a34a' : 'white', color: tab === 'subjects' ? 'white' : '#64748b', border: '1.5px solid #e2e8f0' }}>
          Subject-wise
        </button>
        <button onClick={() => setTab('history')}
          className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: tab === 'history' ? '#16a34a' : 'white', color: tab === 'history' ? 'white' : '#64748b', border: '1.5px solid #e2e8f0' }}>
          History
        </button>
      </div>

      <div className="page-container">
        {tab === 'subjects' && (
          <div>
            {DEMO_SUBJECTS.map((sub, i) => {
              const pct = Math.round((sub.present / sub.total) * 100)
              return (
                <div key={sub.name} className="card p-4 mb-3 flex items-center gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.07}s`, borderLeft: pct < 75 ? '4px solid #ef4444' : '4px solid transparent' }}>
                  <AttendanceRing percentage={pct} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-900">{sub.name}</h3>
                    <p className="text-xs text-gray-400">{sub.present}/{sub.total} classes attended</p>
                    {pct < 75 && (
                      <p className="text-xs text-red-600 font-medium mt-0.5">⚠️ Below 75% — attend more classes!</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'history' && (
          <div>
            {[...Array(8)].map((_, i) => {
              const present = Math.random() > 0.2
              const subjects = DEMO_SUBJECTS[i % DEMO_SUBJECTS.length]
              const date = new Date()
              date.setDate(date.getDate() - i)
              return (
                <div key={i} className="card p-3 mb-2 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${present ? 'text-green-700' : 'text-red-500'}`}
                    style={{ background: present ? '#dcfce7' : '#fee2e2' }}>
                    {present ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{subjects.name}</p>
                    <p className="text-xs text-gray-400">{date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className={`status-badge text-xs ${present ? 'status-ready' : 'status-stopped'}`}>
                    {present ? 'Present' : 'Absent'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  )
}

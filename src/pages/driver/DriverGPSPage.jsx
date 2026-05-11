import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, MapPin, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import toast from 'react-hot-toast'

const DEMO_BUSES = [
  { id: '1', bus_number: 'Bus 1', route_name: 'City Center Route' },
  { id: '2', bus_number: 'Bus 2', route_name: 'North Campus Route' },
  { id: '3', bus_number: 'Bus 3', route_name: 'South Gate Route' },
]

export default function DriverGPSPage() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuthStore()
  const [buses, setBuses] = useState(DEMO_BUSES)
  const [selectedBus, setSelectedBus] = useState('')
  const [sharing, setSharing] = useState(false)
  const [location, setLocation] = useState(null)
  const [status, setStatus] = useState('on_route')
  const [lastSent, setLastSent] = useState(null)
  const intervalRef = useRef(null)
  const wakeLockRef = useRef(null)

  useEffect(() => {
    supabase.from('buses').select('id, bus_number, route_name')
      .then(({ data }) => { if (data?.length) setBuses(data) })
    return () => stopSharing()
  }, [])

  async function startSharing() {
    if (!selectedBus) { toast.error('Please select a bus first'); return }
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }

    setSharing(true)
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch (e) {}

    shareLocation()
    intervalRef.current = setInterval(shareLocation, 5000)
    toast.success('🟢 Location sharing started!')
  }

  function stopSharing() {
    setSharing(false)
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null }
  }

  function shareLocation() {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        setLocation({ lat: latitude.toFixed(5), lng: longitude.toFixed(5), accuracy: accuracy.toFixed(0) })
        setLastSent(new Date())

        await supabase.from('bus_locations').upsert({
          bus_id: selectedBus,
          latitude, longitude, accuracy_m: accuracy,
          updated_at: new Date().toISOString()
        }, { onConflict: 'bus_id' })

        await supabase.from('buses').update({ status }).eq('id', selectedBus)
      },
      (err) => { toast.error('GPS error: ' + err.message) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function handleLogout() {
    stopSharing()
    await signOut()
    navigate('/login')
  }

  async function sendEmergencyAlert() {
    if (!window.confirm('Send emergency alert to admin?')) return
    await supabase.from('notifications').insert({
      user_id: null, // admin
      title: '🚨 Driver Emergency Alert',
      message: `Bus ${buses.find(b => b.id === selectedBus)?.bus_number || 'Unknown'} requires immediate assistance!`,
      type: 'bus',
    })
    toast.error('🚨 Emergency alert sent to admin!')
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100dvh', color: 'white', padding: '0 16px 32px' }}>
      {/* HEADER */}
      <div className="flex items-center justify-between py-4 mb-2">
        <div>
          <p className="text-sm text-gray-400">Driver Panel</p>
          <p className="font-bold text-white">{profile?.full_name}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* BUS SELECTOR */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-400 mb-1">Select Your Bus</label>
        <select value={selectedBus} onChange={e => setSelectedBus(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: '#1e293b', color: 'white', border: '1.5px solid #334155', outline: 'none' }}
          disabled={sharing}>
          <option value="">-- Select Bus --</option>
          {buses.map(b => <option key={b.id} value={b.id}>{b.bus_number} — {b.route_name}</option>)}
        </select>
      </div>

      {/* SHARE TOGGLE */}
      <button
        onClick={sharing ? stopSharing : startSharing}
        className="w-full py-4 rounded-2xl text-base font-bold mb-4 transition-all flex items-center justify-center gap-2"
        style={{
          background: sharing ? '#166534' : '#1e293b',
          border: `2px solid ${sharing ? '#22c55e' : '#334155'}`,
        }}>
        <div className={`w-3 h-3 rounded-full ${sharing ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
        {sharing ? '🟢 Sharing Location — Tap to Stop' : '📍 Start Sharing Location'}
      </button>

      {/* LOCATION CARD */}
      {location && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: '#1e293b' }}>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-green-400" />
            <span className="text-sm font-semibold text-green-400">Live Position</span>
            {lastSent && <span className="text-xs text-gray-400 ml-auto">Sent {new Date().toLocaleTimeString()}</span>}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-xs text-gray-400">Latitude</p><p className="font-mono text-sm text-white">{location.lat}</p></div>
            <div><p className="text-xs text-gray-400">Longitude</p><p className="font-mono text-sm text-white">{location.lng}</p></div>
            <div><p className="text-xs text-gray-400">Accuracy</p><p className="font-mono text-sm text-white">{location.accuracy}m</p></div>
          </div>
          {parseFloat(location.accuracy) > 50 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
              <AlertCircle size={12} />
              Low GPS accuracy. Move to open area.
            </div>
          )}
        </div>
      )}

      {/* STATUS PILLS */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-2">Bus Status</p>
        <div className="flex gap-2">
          {[
            { key: 'on_route', label: 'On Route', color: '#22c55e' },
            { key: 'delayed', label: 'Delayed', color: '#f59e0b' },
            { key: 'stopped', label: 'Stopped', color: '#ef4444' },
          ].map(s => (
            <button key={s.key} onClick={() => setStatus(s.key)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: status === s.key ? s.color + '25' : '#1e293b', color: status === s.key ? s.color : '#64748b', border: `1.5px solid ${status === s.key ? s.color : '#334155'}` }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* EMERGENCY */}
      <button onClick={sendEmergencyAlert}
        className="w-full py-4 rounded-2xl text-base font-bold"
        style={{ background: '#7f1d1d', border: '2px solid #ef4444', color: '#fca5a5' }}>
        🚨 Send Emergency Alert
      </button>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, MapPin, AlertCircle, Compass, ShieldCheck, Clock, Zap, Activity } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

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
    toast.success('🟢 Link Established!')
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
    <div className="min-h-[100dvh] bg-slate-950 text-white pb-12 relative overflow-x-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-green-500/10 blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 px-6 py-4 backdrop-blur-xl bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo_no_bg.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase">Console</h1>
            <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${sharing ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]' : 'bg-gray-600'}`} /> 
              {sharing ? 'Link Active' : 'Standby'}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      <main className="px-6 pt-8 relative z-10 max-w-lg mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Driver Command</h2>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Unit Identity: {profile?.full_name}</p>
        </div>

        {/* BUS SELECTOR */}
        <div className="mb-8">
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Asset Selection</label>
          <div className="relative group">
            <select 
              value={selectedBus} 
              onChange={e => setSelectedBus(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[28px] px-6 py-5 text-sm font-black text-white outline-none focus:border-green-500/50 appearance-none transition-all cursor-pointer"
              disabled={sharing}
            >
              <option value="" className="bg-slate-900">-- SELECT ASSET --</option>
              {buses.map(b => (
                <option key={b.id} value={b.id} className="bg-slate-900">
                  {b.bus_number} — {b.route_name}
                </option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-focus-within:text-green-500 transition-colors">
              <Compass size={20} />
            </div>
          </div>
        </div>

        {/* SHARE TOGGLE */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={sharing ? stopSharing : startSharing}
          className={`w-full py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.3em] mb-8 transition-all flex items-center justify-center gap-4 shadow-2xl ${
            sharing 
              ? 'bg-green-600 border-green-500 text-white shadow-green-600/30' 
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/[0.08]'
          }`}
          style={{ border: '2px solid transparent' }}
        >
          <Activity size={20} className={sharing ? 'animate-pulse' : ''} />
          {sharing ? 'Terminate Link' : 'Broadcast Location'}
        </motion.button>

        {/* LIVE TELEMETRY */}
        <AnimatePresence>
          {location && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-white/10 rounded-[40px] p-8 mb-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-green-500/10 blur-[40px]" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                      <MapPin size={20} className="text-green-500" />
                   </div>
                   <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live Coordinates</span>
                </div>
                {lastSent && (
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> Sync: {lastSent.toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Latitude</p>
                  <p className="text-sm font-black text-white tracking-tight">{location.lat}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Longitude</p>
                  <p className="text-sm font-black text-white tracking-tight">{location.lng}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Drift</p>
                  <p className="text-sm font-black text-green-500">{location.accuracy}m</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATUS MODE */}
        <div className="mb-10">
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Mission Status</label>
          <div className="flex gap-3">
            {[
              { key: 'on_route', label: 'Active', color: 'green', icon: Zap },
              { key: 'delayed', label: 'Delayed', color: 'orange', icon: Clock },
              { key: 'stopped', label: 'Static', color: 'red', icon: AlertCircle },
            ].map(s => {
              const Icon = s.icon
              const isActive = status === s.key
              return (
                <button 
                  key={s.key} 
                  onClick={() => setStatus(s.key)}
                  className={`flex-1 py-4 rounded-[24px] border transition-all flex flex-col items-center gap-2 ${
                    isActive 
                      ? `bg-${s.color}-600/10 border-${s.color}-500/50 text-${s.color}-500` 
                      : 'bg-white/5 border-white/5 text-gray-500'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* EMERGENCY */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={sendEmergencyAlert}
          className="w-full py-5 rounded-[32px] bg-red-950/30 border border-red-500/30 text-red-500 font-black text-sm uppercase tracking-[0.3em] shadow-xl shadow-red-900/10 transition-all flex items-center justify-center gap-3"
        >
          <AlertCircle size={20} />
          Distress Signal
        </motion.button>

        <p className="text-center text-[10px] font-black text-gray-700 uppercase tracking-[0.5em] mt-12 opacity-40">
           Project InstitutePulse • Driver OS
        </p>
      </main>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Navigation, AlertCircle, Compass, ChevronRight, Sparkles, Clock, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import BottomTabBar from '../../components/BottomTabBar'
import { motion, AnimatePresence } from 'framer-motion'

const DEMO_BUSES = [
  { id: '1', bus_number: 'Bus 1', route_name: 'City Center Route', status: 'on_route', driver_name: 'Ravi Kumar', lat: 12.9716, lng: 77.5946 },
  { id: '2', bus_number: 'Bus 2', route_name: 'North Campus Route', status: 'delayed', driver_name: 'Suresh Babu', lat: 12.9820, lng: 77.6090 },
  { id: '3', bus_number: 'Bus 3', route_name: 'South Gate Route', status: 'on_route', driver_name: 'Mohan Lal', lat: 12.9600, lng: 77.5800 },
  { id: '4', bus_number: 'Bus 4', route_name: 'Tech Park Route', status: 'stopped', driver_name: 'Prakash', lat: 12.9750, lng: 77.6100 },
]

const STATUS_CONFIG = {
  on_route: { label: 'Active', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  delayed: { label: 'Delayed', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  stopped: { label: 'Static', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
}

export default function BusTrackingPage() {
  const navigate = useNavigate()
  const [buses, setBuses] = useState(DEMO_BUSES)
  const [selectedBus, setSelectedBus] = useState(null)
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    supabase.from('buses').select('*').then(({ data }) => { if (data?.length) setBuses(data) })

    const sub = supabase.channel('bus_locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bus_locations' }, payload => {
        console.log('Bus location update:', payload)
      })
      .subscribe()

    return () => sub.unsubscribe()
  }, [])

  const filteredBuses = activeTab === 'All' ? buses : buses.filter(b => b.bus_number === activeTab)
  const busNumbers = ['All', ...buses.map(b => b.bus_number)]

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-green-500/5 blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 px-6 py-4 backdrop-blur-xl bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </motion.button>
          <div className="flex items-center gap-3">
             <img src="/logo_no_bg.png" alt="Logo" className="w-8 h-8 object-contain" />
             <div>
               <h1 className="text-xl font-black text-white tracking-tight leading-none">Telemetry</h1>
               <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1">Live Tracking</p>
             </div>
          </div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        </div>
      </header>

      {/* BUS TABS */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-6 py-4 relative z-10">
        {busNumbers.map(b => (
          <button 
            key={b} 
            onClick={() => setActiveTab(b)}
            className={`flex-shrink-0 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              activeTab === b 
                ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20' 
                : 'bg-white/5 border-white/10 text-gray-500'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      <main className="px-6 pt-2 relative z-10 max-w-lg mx-auto">
        {/* MAP CONTAINER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative h-60 rounded-[40px] bg-slate-900 border border-white/5 overflow-hidden mb-8 shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
              <Compass size={32} className="text-green-500 animate-spin-slow" />
            </div>
            <p className="text-sm font-black text-white uppercase tracking-widest mb-1">Grid Mapping active</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Satellite Connection: Stable</p>
          </div>
          
          {/* Mock Markers */}
          {filteredBuses.slice(0, 3).map((bus, i) => (
            <motion.div
              key={bus.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.2 }}
              className="absolute w-6 h-6 rounded-full bg-green-500 border-4 border-slate-950 shadow-[0_0_15px_rgba(34,197,94,0.5)] z-20"
              style={{
                left: `${30 + i * 20}%`,
                top: `${40 + (i % 2) * 20}%`,
              }}
            />
          ))}
        </motion.div>

        {/* ALERTS */}
        <AnimatePresence>
          {buses.some(b => b.status === 'delayed') && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-5 rounded-[32px] mb-8 bg-orange-500/10 border border-orange-500/20 flex items-start gap-4"
            >
              <AlertCircle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Temporal Delay</p>
                <p className="text-xs text-orange-200/80 leading-relaxed font-medium">
                  {buses.filter(b => b.status === 'delayed').map(b => b.bus_number).join(', ')} reported 15m delay due to traffic flux.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BUS CARDS */}
        <div className="space-y-4">
          {filteredBuses.map((bus, i) => {
            const status = STATUS_CONFIG[bus.status] || STATUS_CONFIG.on_route
            const eta = Math.floor(Math.random() * 20) + 5

            return (
              <motion.div
                key={bus.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.08] transition-all cursor-pointer group"
                onClick={() => setSelectedBus(bus)}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl">
                      🚌
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white leading-none mb-1">{bus.bus_number}</h3>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{bus.route_name}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${status.color} ${status.bg} ${status.border}`}>
                    {status.label}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Clock size={10} /> Next Stop
                    </p>
                    <p className="text-xl font-black text-white">{eta}m</p>
                  </div>
                  <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <ShieldCheck size={10} /> Eco Saved
                    </p>
                    <p className="text-xl font-black text-green-500">0.36k</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-[10px] font-black text-white">
                      {bus.driver_name?.charAt(0)}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{bus.driver_name}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-green-500 transition-colors" />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* TIP CARD */}
        <div className="mt-10 p-6 rounded-[32px] bg-green-600/5 border border-green-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles size={40} className="text-green-500" />
          </div>
          <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <Leaf size={12} /> Planet Insight
          </p>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Each bus commute prevents approximately 0.36kg of CO2 emissions compared to private transit.
          </p>
        </div>
      </main>

      <BottomTabBar />
    </div>
  )
}


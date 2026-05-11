import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Navigation, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import BottomTabBar from '../../components/BottomTabBar'

const DEMO_BUSES = [
  { id: '1', bus_number: 'Bus 1', route_name: 'City Center Route', status: 'on_route', driver_name: 'Ravi Kumar', lat: 12.9716, lng: 77.5946 },
  { id: '2', bus_number: 'Bus 2', route_name: 'North Campus Route', status: 'delayed', driver_name: 'Suresh Babu', lat: 12.9820, lng: 77.6090 },
  { id: '3', bus_number: 'Bus 3', route_name: 'South Gate Route', status: 'on_route', driver_name: 'Mohan Lal', lat: 12.9600, lng: 77.5800 },
  { id: '4', bus_number: 'Bus 4', route_name: 'Tech Park Route', status: 'stopped', driver_name: 'Prakash', lat: 12.9750, lng: 77.6100 },
]

const STATUS_CONFIG = {
  on_route: { label: 'On Route', cssClass: 'status-on-route', emoji: '🟢' },
  delayed: { label: 'Delayed', cssClass: 'status-delayed', emoji: '🟡' },
  stopped: { label: 'Stopped', cssClass: 'status-stopped', emoji: '🔴' },
}

export default function BusTrackingPage() {
  const navigate = useNavigate()
  const [buses, setBuses] = useState(DEMO_BUSES)
  const [selectedBus, setSelectedBus] = useState(null)
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    supabase.from('buses').select('*').then(({ data }) => { if (data?.length) setBuses(data) })

    // Realtime subscription
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
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: '80px' }}>
      <header className="app-header">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">🚌 Bus Tracking</span>
          <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
          <span className="text-xs text-green-200">Live</span>
        </div>
        <div />
      </header>

      {/* BUS TABS */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3" style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        {busNumbers.map(b => (
          <button key={b} onClick={() => setActiveTab(b)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={{
              background: activeTab === b ? '#16a34a' : '#f0fdf4',
              color: activeTab === b ? 'white' : '#16a34a',
            }}>
            {b}
          </button>
        ))}
      </div>

      {/* MAP PLACEHOLDER */}
      <div className="px-4 pt-4">
        <div className="card overflow-hidden mb-4" style={{ height: '220px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', position: 'relative' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="text-5xl mb-2">🗺️</div>
            <p className="font-semibold text-green-800 text-sm">Live Bus Map</p>
            <p className="text-xs text-green-600 mt-1">OpenStreetMap + Leaflet integration</p>
            <p className="text-xs text-gray-400 mt-2">Install leaflet and configure your Supabase to see live bus positions</p>
          </div>
          {/* Bus markers */}
          {filteredBuses.slice(0, 3).map((bus, i) => (
            <div key={bus.id}
              className="absolute w-8 h-8 rounded-full flex items-center justify-center text-sm animate-pulse-green"
              style={{
                background: '#166534',
                left: `${20 + i * 25}%`,
                top: `${30 + (i % 2) * 30}%`,
                zIndex: 2
              }}>
              🚌
            </div>
          ))}
        </div>
      </div>

      {/* BUS STATUS CARDS */}
      <div className="page-container">
        {buses.filter(b => b.status === 'delayed').length > 0 && (
          <div className="p-3 rounded-xl mb-3 flex items-center gap-2"
            style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
            <AlertCircle size={16} className="text-yellow-700 flex-shrink-0" />
            <p className="text-sm text-yellow-800 font-medium">
              {buses.filter(b => b.status === 'delayed').map(b => b.bus_number).join(', ')} {buses.filter(b => b.status === 'delayed').length > 1 ? 'are' : 'is'} delayed approximately 15 minutes
            </p>
          </div>
        )}

        {filteredBuses.map((bus, i) => {
          const statusCfg = STATUS_CONFIG[bus.status] || STATUS_CONFIG.on_route
          const eta = Math.floor(Math.random() * 20) + 5

          return (
            <div key={bus.id}
              className="card p-4 mb-3 animate-fade-in-up cursor-pointer hover:scale-[1.01] transition-transform"
              style={{ animationDelay: `${i * 0.07}s`, borderLeft: bus.status === 'delayed' ? '4px solid #f59e0b' : '4px solid transparent' }}
              onClick={() => setSelectedBus(bus)}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{bus.bus_number}</span>
                    <span className={`status-badge ${statusCfg.cssClass}`}>
                      {statusCfg.emoji} {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{bus.route_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-700">{eta} min</p>
                  <p className="text-xs text-gray-400">to next stop</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>👤 {bus.driver_name || 'Driver assigned'}</span>
                <span>🌿 Taking this bus saves ~0.36 kg CO2</span>
              </div>
            </div>
          )
        })}

        <div className="card p-3 mt-2" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
          <p className="text-xs text-green-700 font-medium">🌿 Sustainability Tip: Taking the college bus instead of a motorbike for 5 km saves 0.36 kg CO2 per trip!</p>
        </div>
      </div>

      <BottomTabBar />
    </div>
  )
}

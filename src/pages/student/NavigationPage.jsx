import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Search } from 'lucide-react'
import BottomTabBar from '../../components/BottomTabBar'

const LOCATIONS = [
  { id: '1', name: 'Main Library', type: 'office', floor: 'G', building: 'Block A', description: 'Central library with study rooms' },
  { id: '2', name: 'CS Lab 1', type: 'lab', floor: '1', building: 'Block B', description: '60 computer workstations' },
  { id: '3', name: 'Main Canteen', type: 'canteen', floor: 'G', building: 'Block C', description: 'Open 8am-8pm, eco-friendly menu' },
  { id: '4', name: 'Physics Lab', type: 'lab', floor: '2', building: 'Block B', description: 'Optics & mechanics experiments' },
  { id: '5', name: 'Admin Office', type: 'office', floor: 'G', building: 'Block A', description: 'Principal, registrar, academic' },
  { id: '6', name: 'Seminar Hall', type: 'classroom', floor: '3', building: 'Block A', description: 'Capacity 200 students' },
  { id: '7', name: 'Sports Ground', type: 'sports', floor: 'G', building: 'Outdoor', description: 'Cricket, football, basketball' },
  { id: '8', name: 'Parking Area', type: 'parking', floor: 'G', building: 'North End', description: 'Two-wheeler & four-wheeler' },
]

const TYPE_FILTERS = ['All', 'classrooms', 'lab', 'office', 'canteen', 'sports', 'parking']
const TYPE_ICONS = { classroom: '🏫', lab: '🔬', office: '🏢', canteen: '🍽️', sports: '⚽', parking: '🅿️' }

export default function NavigationPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = LOCATIONS.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || l.type === filter.replace('s', '')
    return matchSearch && matchFilter
  })

  return (
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: '80px' }}>
      <header className="app-header">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <span className="font-bold text-white">📍 Campus Navigation</span>
        <div />
      </header>

      {/* SEARCH */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 text-sm" placeholder="Find a place on campus..." />
        </div>
      </div>

      {/* FILTER CHIPS */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
        {TYPE_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold capitalize transition-all"
            style={{ background: filter === f ? '#16a34a' : '#f0fdf4', color: filter === f ? 'white' : '#16a34a' }}>
            {f}
          </button>
        ))}
      </div>

      {/* MAP PLACEHOLDER */}
      <div className="px-4 mb-4">
        <div className="card overflow-hidden" style={{ height: '200px', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', position: 'relative' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl mb-2">🗺️</div>
            <p className="font-semibold text-green-800 text-sm">Campus Map</p>
            <p className="text-xs text-green-600 mt-1">Leaflet + OpenStreetMap integration</p>
          </div>
          {filtered.slice(0, 4).map((loc, i) => (
            <div key={loc.id} className="absolute w-7 h-7 rounded-full flex items-center justify-center text-sm bg-white shadow"
              style={{ left: `${15 + i * 22}%`, top: `${25 + (i % 2) * 35}%` }}>
              {TYPE_ICONS[loc.type] || '📍'}
            </div>
          ))}
        </div>
      </div>

      {/* LOCATION LIST */}
      <div className="page-container">
        <div className="card p-3 mb-3" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
          <p className="text-xs text-green-700">🌿 Walk to your destination and earn eco-points for zero-carbon travel! Walking = 0 kg CO2 🌱</p>
        </div>
        {filtered.map((loc, i) => (
          <div key={loc.id} className="card p-3 mb-2 flex items-center gap-3 animate-fade-in-up hover:scale-[1.01] transition-transform cursor-pointer"
            style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: '#f0fdf4' }}>
              {TYPE_ICONS[loc.type] || '📍'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{loc.name}</p>
              <p className="text-xs text-gray-400">{loc.building} · Floor {loc.floor}</p>
              <p className="text-xs text-gray-300 mt-0.5">{loc.description}</p>
            </div>
            <button className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              Navigate
            </button>
          </div>
        ))}
      </div>

      <BottomTabBar />
    </div>
  )
}

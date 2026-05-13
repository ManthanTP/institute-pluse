import { useState, useEffect } from 'react'
import { MapPin, Search, Navigation, Clock, Star, X, ChevronLeft, Map, Compass, Building2, Wind, Home, LayoutGrid, CalendarDays, Coffee, User, ChevronRight, AlignLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function NavigationPage() {
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  async function fetchLocations() {
    setLoading(true)
    const { data, error } = await supabase.from('campus_locations').select('*').order('building').order('name')
    if (data) setLocations(data)
    setLoading(false)
  }

  const filtered = locations.filter(l => 
    (filter === 'All' || l.type === filter) &&
    (l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.building.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-[100dvh] bg-[#0a0c10] text-white pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-green-900/5 blur-[120px]" />
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
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Campus Nav</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
             <Compass size={24} className="animate-pulse" />
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-10">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black/40">
            <Search size={20} />
          </div>
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Reference..."
            className="w-full bg-white rounded-3xl py-6 pl-16 pr-6 text-[13px] font-black text-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.1)] outline-none"
          />
        </div>

        {/* QUICK FILTERS */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-12 pb-2">
          {['All', 'Academic', 'Administrative', 'Laboratory', 'Cafeteria'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                filter === f 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                  : 'bg-white/5 border-white/10 text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* LOCATION CARDS */}
        <div className="space-y-6">
          {loading ? (
             <div className="py-20 text-center flex flex-col items-center">
                <Compass size={40} className="animate-spin text-blue-500 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Scanning Spatial Data...</p>
             </div>
          ) : filtered.length === 0 ? (
             <div className="py-20 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest bg-white/5 rounded-3xl p-6">
                No Results Found
             </div>
          ) : filtered.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#161b22]/80 border border-white/5 rounded-[40px] p-8 backdrop-blur-2xl relative overflow-hidden group active:scale-[0.98] transition-transform"
            >
              <div className="flex justify-between items-start mb-6 relative z-10">
                 <div className="space-y-1">
                    <span className="px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                       {loc.building}
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mt-2">{loc.name}</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{loc.type}</p>
                 </div>
              </div>

              <div className="space-y-4 relative z-10 pt-4 border-t border-white/5">
                 <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-gray-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Floor: <span className="text-white">{loc.floor}</span></span>
                 </div>
                 
                 {loc.description && (
                   <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl">
                      <AlignLeft size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-gray-300 leading-relaxed italic">{loc.description}</p>
                   </div>
                 )}
              </div>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
                 <MapPin size={100} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100] md:hidden">
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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, Navigation, Building2, Wind, Compass, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Jain College of Engineering, Hubli Locations
const JCE_LOCATIONS = [
  { id: '1', name: 'Main Academic Block', type: 'office', floor: 'G', building: 'Block A', description: 'Administrative office, Principal chamber, & Board room' },
  { id: '2', name: 'CS & IS Department', type: 'classroom', floor: '1', building: 'Block B', description: 'Computer Science and Information Science classrooms' },
  { id: '3', name: 'Mechanical Workshop', type: 'lab', floor: 'G', building: 'Block D', description: 'Advanced machining & foundry labs' },
  { id: '4', name: 'Civil Engineering Block', type: 'classroom', floor: '2', building: 'Block C', description: 'Surveying and environmental engineering labs' },
  { id: '5', name: 'Central Library', type: 'office', floor: '1', building: 'Block A', description: 'Digital library and quiet study zone' },
  { id: '6', name: 'Auditorium', type: 'office', floor: 'G', building: 'Main Campus', description: 'Large events and guest lectures' },
  { id: '7', name: 'Cafeteria & Mess', type: 'canteen', floor: 'G', building: 'Annex', description: 'Eco-friendly dining and refreshments' },
  { id: '8', name: 'Basketball Court', type: 'sports', floor: 'G', building: 'Sports Complex', description: 'Outdoor sports area' },
  { id: '9', name: 'Server Room', type: 'lab', floor: '1', building: 'Block B', description: 'Campus network operations' },
  { id: '10', name: 'Physics & Chemistry Labs', type: 'lab', floor: 'G', building: 'Block C', description: 'Basic science departments' },
]

const FILTERS = [
  { label: 'All', id: 'All' },
  { label: 'Classrooms', id: 'classroom' },
  { label: 'Labs', id: 'lab' },
  { label: 'Offices', id: 'office' },
  { label: 'Dining', id: 'canteen' },
  { label: 'Sports', id: 'sports' }
]

const TYPE_ICONS = { 
  classroom: <Building2 size={18} />, 
  lab: <Wind size={18} />, 
  office: <Compass size={18} />, 
  canteen: <Sparkles size={18} />, 
  sports: <MapPin size={18} /> 
}

export default function NavigationPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = JCE_LOCATIONS.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'All' || l.type === activeFilter
    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-green-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* HEADER AREA */}
        <div className="px-6 pt-6 mb-8">
          <div className="flex flex-col mb-6">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">JCE Hubli</span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2">Campus Map</h1>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-1.5">
               <Navigation size={10} /> Smart Wayfinding Active
            </p>
          </div>

          {/* SEARCH BOX */}
          <div className="relative group">
             <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
             <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-4 backdrop-blur-xl">
               <Search size={18} className="text-gray-500" />
               <input 
                 value={search} 
                 onChange={e => setSearch(e.target.value)}
                 placeholder="Search building, lab, or office..." 
                 className="flex-1 bg-transparent border-none outline-none text-white text-[11px] font-black uppercase tracking-widest ml-4 placeholder:text-gray-600"
               />
             </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-6 mb-8">
          {FILTERS.map(f => (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(f.id)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                activeFilter === f.id 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                  : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'
              }`}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* CAMPUS MAP PREVIEW (Glassmorphic) */}
        <div className="px-6 mb-8">
           <div className="relative h-48 bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-green-500/10" />
             
             {/* Abstract Map Dots */}
             <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="relative w-full h-full">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-1 h-1 bg-white/40 rounded-full"
                      style={{ 
                        left: `${Math.random() * 80 + 10}%`, 
                        top: `${Math.random() * 80 + 10}%` 
                      }}
                    />
                  ))}
                </div>
             </div>

             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-[24px] bg-blue-600/20 flex items-center justify-center text-blue-500 mb-3 shadow-2xl">
                   <Navigation size={24} className="animate-pulse" />
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Interactive Map</p>
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1 italic">Click on list item to navigate</p>
             </div>
           </div>
        </div>

        {/* LOCATION LIST */}
        <div className="px-6 space-y-4">
          <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 mb-6">
             <p className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2 leading-relaxed">
               <Wind size={12} /> Walk to your destination and earn eco-points for zero-carbon travel!
             </p>
          </div>

          <AnimatePresence mode="popLayout">
            {filtered.map((loc, i) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-[28px] p-5 backdrop-blur-xl flex items-center gap-5 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                  {TYPE_ICONS[loc.type] || <MapPin size={18} />}
                </div>
                
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{loc.building}</span>
                      <div className="w-0.5 h-0.5 rounded-full bg-white/20" />
                      <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Floor {loc.floor}</span>
                   </div>
                   <h3 className="text-sm font-black text-white uppercase tracking-tight truncate mb-1">{loc.name}</h3>
                   <p className="text-[9px] font-medium text-gray-500 line-clamp-1">{loc.description}</p>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                >
                  <Navigation size={16} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl">
               <div className="text-4xl mb-4">🔍</div>
               <p className="text-xs font-black text-white uppercase tracking-widest leading-none mb-2">Location Not Found</p>
               <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Try a different building or block</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

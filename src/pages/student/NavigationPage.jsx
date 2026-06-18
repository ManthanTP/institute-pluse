import { useState, useEffect, useMemo } from 'react'
import { MapPin, Search, X, ChevronLeft, Compass, Building2, AlignLeft, Beaker, BookOpen, ShieldCheck, Utensils, Wrench, Layers, Navigation2, ArrowRight, Sparkles, LayoutGrid, Map } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// Type-based color schemes
const TYPE_COLORS = {
  Laboratory:     { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    fill: '#3b82f6', glow: 'shadow-blue-500/20',    dot: 'bg-blue-500',    gradient: 'from-blue-600/20 to-blue-900/5' },
  Academic:       { bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20',  text: 'text-emerald-400',  fill: '#10b981', glow: 'shadow-emerald-500/20',  dot: 'bg-emerald-500',  gradient: 'from-emerald-600/20 to-emerald-900/5' },
  Administrative: { bg: 'bg-amber-500/10',    border: 'border-amber-500/20',    text: 'text-amber-400',    fill: '#f59e0b', glow: 'shadow-amber-500/20',    dot: 'bg-amber-500',    gradient: 'from-amber-600/20 to-amber-900/5' },
  Cafeteria:      { bg: 'bg-orange-500/10',   border: 'border-orange-500/20',   text: 'text-orange-400',   fill: '#f97316', glow: 'shadow-orange-500/20',   dot: 'bg-orange-500',   gradient: 'from-orange-600/20 to-orange-900/5' },
  Utility:        { bg: 'bg-slate-500/10',    border: 'border-slate-400/20',    text: 'text-slate-400',    fill: '#94a3b8', glow: 'shadow-slate-500/20',    dot: 'bg-slate-400',    gradient: 'from-slate-600/20 to-slate-800/5' },
}

const TYPE_ICONS = {
  Laboratory: Beaker,
  Academic: BookOpen,
  Administrative: ShieldCheck,
  Cafeteria: Utensils,
  Utility: Wrench,
}

// Schematic floor plan data — approximate grid positions for rooms
const BLOCK_A_LAYOUT = {
  north: [
    { name: 'Girls Common Room', w: 1 },
    { name: 'Public Chamber', w: 0.8 },
    { name: 'Ladies Washroom', w: 0.6 },
    { name: 'Dry Lab', w: 0.8 },
    { name: 'Dance / Cultural Hall', w: 1.4 },
    { name: 'Parallela Lab', w: 0.8 },
    { name: 'Drawing Hall', w: 1.2 },
    { name: 'Main Office', w: 1 },
    { name: 'Boys Common Room', w: 1 },
  ],
  center: [
    { name: 'Quadrangle', w: 8.6, label: 'Quadrangle (Open Courtyard)' },
  ],
  south: [
    { name: 'Library', w: 1.4 },
    { name: 'Drawing Room', w: 1.2 },
    { name: 'Canteen', w: 1.4 },
    { name: 'Incubation Room', w: 1.2 },
    { name: 'Workshop', w: 1.2 },
    { name: 'Store Room (Block-A)', w: 1 },
  ],
}

const BLOCK_B_LAYOUT = {
  west: [
    { name: 'Sports Room', w: 1 },
    { name: 'Civil Staff Room', w: 1 },
    { name: 'Communication Lab', w: 1 },
  ],
  centerLeft: [
    { name: 'Security Store Room', w: 1 },
    { name: 'Green Garden', w: 0.6 },
    { name: 'Xerox & Stationery Shop', w: 1 },
    { name: 'Fluid Mechanics Lab', w: 1 },
    { name: 'BMT Lab', w: 1.5 },
  ],
  centerRight: [
    { name: 'Store Room (Block-B)', w: 0.8 },
    { name: 'Design Lab', w: 1 },
    { name: 'CHM Lab', w: 1 },
    { name: 'Geotechnical Engg Lab', w: 1 },
  ],
  east: [
    { name: 'Geology Lab', w: 1 },
    { name: 'Energy Lab', w: 1 },
    { name: 'Heat Transfer Lab', w: 1 },
    { name: 'Food Technology Lab', w: 1 },
  ],
}

export default function NavigationPage() {
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [activeBuilding, setActiveBuilding] = useState('Block-A')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [viewMode, setViewMode] = useState('map') // 'map' or 'list'

  useEffect(() => {
    fetchLocations()
  }, [])

  async function fetchLocations() {
    setLoading(true)
    const { data } = await supabase.from('campus_locations').select('*').order('building').order('name')
    if (data) setLocations(data)
    setLoading(false)
  }

  const filtered = useMemo(() => locations.filter(l =>
    (filter === 'All' || l.type === filter) &&
    (activeBuilding === 'All' || l.building === activeBuilding) &&
    (l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.building.toLowerCase().includes(searchQuery.toLowerCase()) || l.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [locations, filter, activeBuilding, searchQuery])

  const stats = useMemo(() => {
    const buildingLocs = locations.filter(l => activeBuilding === 'All' || l.building === activeBuilding)
    return {
      total: buildingLocs.length,
      labs: buildingLocs.filter(l => l.type === 'Laboratory').length,
      academic: buildingLocs.filter(l => l.type === 'Academic').length,
      admin: buildingLocs.filter(l => l.type === 'Administrative').length,
    }
  }, [locations, activeBuilding])

  const getTypeColor = (type) => TYPE_COLORS[type] || TYPE_COLORS.Utility
  const getTypeIcon = (type) => TYPE_ICONS[type] || Wrench

  const isHighlighted = (name) => {
    if (!searchQuery) return true
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  }

  const handleRoomClick = (name) => {
    const room = locations.find(l => l.name === name)
    if (room) setSelectedRoom(room)
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-blue-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Mapping Campus Grid...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white pb-32 relative overflow-x-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-blue-900/5 blur-[120px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 px-5 pt-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="hidden lg:flex w-12 h-12 rounded-2xl bg-white/5 border border-white/10 items-center justify-center backdrop-blur-xl"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter italic">Campus <span className="text-cyan-400">Nav</span></h1>
              <p className="text-[9px] font-black text-cyan-500/60 uppercase tracking-[0.3em] mt-0.5">Ground Floor • Block A & B</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('map')} className={`p-2.5 transition-all ${viewMode === 'map' ? 'bg-cyan-600 text-white' : 'text-gray-500'}`}>
                <Map size={16} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 transition-all ${viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-gray-500'}`}>
                <LayoutGrid size={16} />
              </button>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
              <Compass size={22} className="animate-[spin_8s_linear_infinite]" />
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Labs', value: stats.labs, color: 'text-blue-400' },
            { label: 'Academic', value: stats.academic, color: 'text-emerald-400' },
            { label: 'Admin', value: stats.admin, color: 'text-amber-400' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.03] border border-white/5 rounded-2xl py-3 px-3 text-center"
            >
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* BUILDING TOGGLE */}
        <div className="flex gap-2 mb-5">
          {['Block-A', 'Block-B'].map(b => (
            <motion.button
              key={b}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveBuilding(b); setSelectedRoom(null) }}
              className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${
                activeBuilding === b
                  ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                  : 'bg-white/[0.03] border-white/10 text-gray-500 hover:text-white'
              }`}
            >
              <Building2 size={14} className="inline mr-2 -mt-0.5" />{b}
            </motion.button>
          ))}
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-5">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <Search size={16} />
          </div>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search rooms, labs, offices..."
            className="w-full bg-white/[0.04] rounded-2xl py-3.5 pl-11 pr-10 text-xs font-bold text-white placeholder-gray-600 border border-white/5 outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* TYPE LEGEND */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', 'Laboratory', 'Academic', 'Administrative', 'Cafeteria', 'Utility'].map(f => {
            const c = f === 'All' ? null : getTypeColor(f)
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border ${
                  filter === f
                    ? (c ? `${c.bg} ${c.border} ${c.text}` : 'bg-white/10 border-white/20 text-white')
                    : 'bg-transparent border-white/5 text-gray-600 hover:text-gray-400'
                }`}
              >
                {c && <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
                {f === 'All' ? '⊕ All' : f}
              </button>
            )
          })}
        </div>

        {/* CONTENT VIEW */}
        <AnimatePresence mode="wait">
          {viewMode === 'map' ? (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* SCHEMATIC FLOOR PLAN */}
              <div className="bg-[#0a0e17] border border-white/5 rounded-[28px] p-4 md:p-6 mb-6 overflow-x-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Navigation2 size={12} className="text-cyan-500" />
                  <span className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em]">{activeBuilding} — Schematic Layout</span>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[8px] font-bold text-gray-600 italic">Ground Floor</span>
                </div>

                {activeBuilding === 'Block-A' ? (
                  <div className="min-w-[600px] space-y-1">
                    {/* North Corridor */}
                    <div className="flex gap-1">
                      {BLOCK_A_LAYOUT.north.map((room, i) => (
                        <SchematicRoom
                          key={room.name}
                          room={room}
                          location={locations.find(l => l.name === room.name)}
                          isHighlighted={isHighlighted(room.name) && (filter === 'All' || locations.find(l => l.name === room.name)?.type === filter)}
                          onClick={() => handleRoomClick(room.name)}
                          selected={selectedRoom?.name === room.name}
                          delay={i * 0.03}
                          height="h-16"
                        />
                      ))}
                    </div>
                    {/* Quadrangle */}
                    <div className="flex gap-1">
                      {BLOCK_A_LAYOUT.center.map((room, i) => (
                        <SchematicRoom
                          key={room.name}
                          room={room}
                          location={locations.find(l => l.name === room.name)}
                          isHighlighted={isHighlighted(room.name) && (filter === 'All' || locations.find(l => l.name === room.name)?.type === filter)}
                          onClick={() => handleRoomClick(room.name)}
                          selected={selectedRoom?.name === room.name}
                          delay={0.3}
                          height="h-24"
                          isCenter
                        />
                      ))}
                    </div>
                    {/* South Corridor */}
                    <div className="flex gap-1">
                      {BLOCK_A_LAYOUT.south.map((room, i) => (
                        <SchematicRoom
                          key={room.name}
                          room={room}
                          location={locations.find(l => l.name === room.name)}
                          isHighlighted={isHighlighted(room.name) && (filter === 'All' || locations.find(l => l.name === room.name)?.type === filter)}
                          onClick={() => handleRoomClick(room.name)}
                          selected={selectedRoom?.name === room.name}
                          delay={0.4 + i * 0.03}
                          height="h-16"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="min-w-[500px] flex gap-1">
                    {/* West Column */}
                    <div className="flex flex-col gap-1" style={{ flex: 1 }}>
                      {BLOCK_B_LAYOUT.west.map((room, i) => (
                        <SchematicRoom
                          key={room.name}
                          room={room}
                          location={locations.find(l => l.name === room.name)}
                          isHighlighted={isHighlighted(room.name) && (filter === 'All' || locations.find(l => l.name === room.name)?.type === filter)}
                          onClick={() => handleRoomClick(room.name)}
                          selected={selectedRoom?.name === room.name}
                          delay={i * 0.03}
                          height="h-16"
                        />
                      ))}
                    </div>
                    {/* Center-Left Column */}
                    <div className="flex flex-col gap-1" style={{ flex: 1.2 }}>
                      {BLOCK_B_LAYOUT.centerLeft.map((room, i) => (
                        <SchematicRoom
                          key={room.name}
                          room={room}
                          location={locations.find(l => l.name === room.name)}
                          isHighlighted={isHighlighted(room.name) && (filter === 'All' || locations.find(l => l.name === room.name)?.type === filter)}
                          onClick={() => handleRoomClick(room.name)}
                          selected={selectedRoom?.name === room.name}
                          delay={0.1 + i * 0.03}
                          height="h-14"
                        />
                      ))}
                    </div>
                    {/* Center-Right Column */}
                    <div className="flex flex-col gap-1" style={{ flex: 1 }}>
                      {BLOCK_B_LAYOUT.centerRight.map((room, i) => (
                        <SchematicRoom
                          key={room.name}
                          room={room}
                          location={locations.find(l => l.name === room.name)}
                          isHighlighted={isHighlighted(room.name) && (filter === 'All' || locations.find(l => l.name === room.name)?.type === filter)}
                          onClick={() => handleRoomClick(room.name)}
                          selected={selectedRoom?.name === room.name}
                          delay={0.2 + i * 0.03}
                          height="h-16"
                        />
                      ))}
                    </div>
                    {/* East Column */}
                    <div className="flex flex-col gap-1" style={{ flex: 1 }}>
                      {BLOCK_B_LAYOUT.east.map((room, i) => (
                        <SchematicRoom
                          key={room.name}
                          room={room}
                          location={locations.find(l => l.name === room.name)}
                          isHighlighted={isHighlighted(room.name) && (filter === 'All' || locations.find(l => l.name === room.name)?.type === filter)}
                          onClick={() => handleRoomClick(room.name)}
                          selected={selectedRoom?.name === room.name}
                          delay={0.3 + i * 0.03}
                          height="h-16"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Compass Rose */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[8px] font-black text-gray-600 uppercase tracking-widest">
                    <Compass size={12} className="text-cyan-500/50" />
                    <span>N ↑ • Scale 1:200</span>
                  </div>
                  <span className="text-[8px] font-bold text-gray-700 italic">Tap a room for details</span>
                </div>
              </div>

              {/* SELECTED ROOM DETAIL PANEL */}
              <AnimatePresence>
                {selectedRoom && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.97 }}
                    className={`bg-gradient-to-br ${getTypeColor(selectedRoom.type).gradient} border ${getTypeColor(selectedRoom.type).border} rounded-[28px] p-6 mb-6 relative overflow-hidden`}
                  >
                    <button onClick={() => setSelectedRoom(null)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white">
                      <X size={14} />
                    </button>
                    <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none">
                      <MapPin size={120} />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-2xl ${getTypeColor(selectedRoom.type).bg} ${getTypeColor(selectedRoom.type).border} border flex items-center justify-center ${getTypeColor(selectedRoom.type).text}`}>
                          {(() => { const Icon = getTypeIcon(selectedRoom.type); return <Icon size={18} /> })()}
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full ${getTypeColor(selectedRoom.type).bg} ${getTypeColor(selectedRoom.type).border} border text-[8px] font-black ${getTypeColor(selectedRoom.type).text} uppercase tracking-widest`}>
                            {selectedRoom.type}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{selectedRoom.name}</h3>

                      <div className="flex flex-wrap items-center gap-4 mt-3 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="text-gray-500" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedRoom.building}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers size={12} className="text-gray-500" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedRoom.floor} Floor</span>
                        </div>
                      </div>

                      {selectedRoom.description && (
                        <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                          <AlignLeft size={14} className={`${getTypeColor(selectedRoom.type).text} shrink-0 mt-0.5`} />
                          <p className="text-[11px] font-medium text-gray-300 leading-relaxed">{selectedRoom.description}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* LIST VIEW */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filtered.length === 0 ? (
                <div className="py-20 text-center bg-white/[0.02] border border-white/5 rounded-[28px]">
                  <MapPin size={40} className="mx-auto text-gray-700 mb-4" />
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No Matching Locations</p>
                </div>
              ) : filtered.map((loc, i) => {
                const c = getTypeColor(loc.type)
                const Icon = getTypeIcon(loc.type)
                return (
                  <motion.div
                    key={loc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedRoom(loc)}
                    className={`bg-[#0c1017]/80 border border-white/5 rounded-2xl p-4 backdrop-blur-xl relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer hover:border-cyan-500/20`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl ${c.bg} ${c.border} border flex items-center justify-center ${c.text} shrink-0`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">{loc.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[8px] font-black ${c.text} uppercase tracking-widest`}>{loc.type}</span>
                          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{loc.building}</span>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-gray-700 group-hover:text-cyan-500 transition-colors shrink-0" />
                    </div>

                    {loc.description && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-[10px] font-medium text-gray-500 leading-relaxed line-clamp-2">{loc.description}</p>
                      </div>
                    )}

                    {/* Hover glow */}
                    <div className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-r ${c.gradient} blur-sm`} />
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Schematic room block component for the floor plan view
function SchematicRoom({ room, location, isHighlighted, onClick, selected, delay = 0, height = 'h-16', isCenter = false }) {
  const type = location?.type || 'Utility'
  const c = TYPE_COLORS[type] || TYPE_COLORS.Utility
  const dimmed = !isHighlighted

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      style={{ flex: room.w }}
      className={`${height} rounded-xl border transition-all duration-300 relative overflow-hidden group flex items-center justify-center p-1 ${
        selected
          ? `${c.bg} border-2 ${c.border} shadow-lg ${c.glow}`
          : dimmed
            ? 'bg-white/[0.01] border-white/[0.03] opacity-30'
            : `bg-white/[0.02] border-white/[0.06] hover:${c.bg} hover:${c.border}`
      }`}
    >
      {/* Room label */}
      <span className={`text-[7px] font-black uppercase tracking-wider text-center leading-tight ${
        selected ? c.text : dimmed ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-300'
      }`}>
        {room.label || room.name}
      </span>

      {/* Type indicator dot */}
      {!dimmed && (
        <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${c.dot} ${selected ? 'animate-pulse' : 'opacity-50'}`} />
      )}

      {/* Selected glow */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-40`}
        />
      )}
    </motion.button>
  )
}

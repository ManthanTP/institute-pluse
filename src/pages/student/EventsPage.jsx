import { useState, useEffect } from 'react'
import { CalendarDays, MapPin, Star, ChevronLeft, Sparkles, QrCode, X, Filter, Clock, Users, Search, Home, LayoutGrid, Coffee, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const EVENT_CATEGORIES = ['All', 'History', 'Sustainability', 'Technical', 'Workshop', 'Seminar']

export default function EventsPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
    if (profile?.id) {
      fetchRegistrations()
    }
  }, [profile?.id])

  async function fetchEvents() {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
    
    if (!error && data && data.length > 0) {
      setEvents(data)
    } else {
      setEvents(SAMPLE_EVENTS)
    }
    setLoading(false)
  }

  async function fetchRegistrations() {
    const { data, error } = await supabase
      .from('event_participants')
      .select('event_id')
      .eq('student_id', profile.id)
    
    if (!error && data) {
      setRegisteredEvents(data.map(r => r.event_id))
    }
  }

  const filtered = activeCategory === 'All' ? events 
    : activeCategory === 'History' ? events.filter(e => registeredEvents.includes(e.id))
    : events.filter(e => e.category === activeCategory)

  async function handleRegister(event) {
    if (registeredEvents.includes(event.id)) return
    
    const { error } = await supabase
      .from('event_participants')
      .insert({ event_id: event.id, student_id: profile.id })

    if (error) {
      toast.error('Sync Failed')
      return
    }

    await supabase.rpc('increment_event_participants', { event_id: event.id })
    setRegisteredEvents(prev => [...prev, event.id])
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, current_participants: (e.current_participants || 0) + 1 } : e))
    toast.success('Identity Linked')
    setSelectedEvent(null)
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Event Nodes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0c10] text-white pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-blue-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-4 md:px-6 pt-6 md:pt-8">
        {/* TOP BAR */}
        <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-12">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="hidden lg:flex w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl"
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </motion.button>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Events</h1>
        </div>

        {/* BROWSE BUTTON */}
        <motion.button 
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white rounded-2xl md:rounded-3xl py-4 md:py-6 flex items-center justify-center gap-2 md:gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6 md:mb-10"
        >
          <span className="text-base md:text-lg">🗺️</span>
          <span className="text-xs md:text-[13px] font-black text-black uppercase tracking-[0.2em]">Browse</span>
        </motion.button>

        {/* CATEGORY TABS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 md:mb-10 pb-2">
          {EVENT_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeCategory === cat 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                  : 'bg-white/5 border-white/10 text-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* EVENT LIST */}
        <div className="space-y-4 md:space-y-6">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Synchronizing Core...</p>
             </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center bg-white/5 border border-white/10 rounded-2xl md:rounded-[40px] backdrop-blur-xl">
               <div className="text-4xl mb-4 opacity-40">📅</div>
               <p className="text-xs font-black text-white uppercase tracking-widest italic">No Nodes Found</p>
            </div>
          ) : filtered.map((event, i) => {
            const isRegistered = registeredEvents.includes(event.id)
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedEvent(event)}
                className="bg-[#161b22]/80 border border-white/5 rounded-2xl md:rounded-[40px] p-5 md:p-8 backdrop-blur-2xl relative overflow-hidden group active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                    {event.category}
                  </span>
                  {isRegistered && (
                    <span className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-500 uppercase tracking-widest">
                      Registered ✓
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 leading-none">{event.title}</h3>
                <p className="text-xs font-medium text-gray-500 leading-relaxed line-clamp-2 mb-8">{event.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Schedule</p>
                    <p className="text-[13px] font-black text-white uppercase">{event.event_date}</p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Temporal Node</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Location</p>
                    <p className="text-[13px] font-black text-white uppercase truncate">{event.venue}</p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Event Hub</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-black uppercase tracking-widest">+{event.eco_points} Eco Pts</span>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                   <CalendarDays size={80} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>



      {/* DETAIL MODAL (Portal) */}
      {createPortal(
        <AnimatePresence>
          {selectedEvent && (
            <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl pointer-events-auto" 
                onClick={() => setSelectedEvent(null)} 
              />
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-[#0a0c10] border-t border-white/10 rounded-t-3xl md:rounded-t-[50px] p-5 md:p-10 shadow-2xl pointer-events-auto flex flex-col"
                style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                         <CalendarDays size={24} className="md:w-8 md:h-8" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Event Protocol</p>
                         <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight leading-tight">{selectedEvent.title}</h2>
                      </div>
                   </div>
                   <button onClick={() => setSelectedEvent(null)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400"><X size={20} /></button>
                </div>

                <div className="space-y-6 overflow-y-auto no-scrollbar max-h-[60vh] pr-2 pb-10">
                   <p className="text-gray-400 text-[13px] leading-relaxed font-medium">
                      {selectedEvent.description}
                   </p>
                   
                   <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <StatNode label="Temporal" value={selectedEvent.event_date} icon={Clock} />
                      <StatNode label="Hub" value={selectedEvent.venue} icon={MapPin} />
                      <StatNode label="Identity" value={`${selectedEvent.current_participants}/${selectedEvent.max_participants}`} icon={Users} />
                      <StatNode label="Yield" value={`+${selectedEvent.eco_points} XP`} icon={Star} />
                   </div>

                   <motion.button
                     whileTap={{ scale: 0.98 }}
                     onClick={() => handleRegister(selectedEvent)}
                     disabled={registeredEvents.includes(selectedEvent.id)}
                     className={`w-full py-5 md:py-7 rounded-2xl md:rounded-[32px] font-black text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all flex items-center justify-center gap-3 ${
                       registeredEvents.includes(selectedEvent.id)
                         ? 'bg-white/5 text-gray-500 border border-white/5'
                         : 'bg-blue-600 text-white shadow-[0_15px_40px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-95'
                     }`}
                   >
                     {registeredEvents.includes(selectedEvent.id) ? 'Uplink Synchronized ✓' : 'Initiate Linking'}
                   </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

function StatNode({ label, value, icon: Icon }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-2 opacity-50">
        <Icon size={12} />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="text-xs font-black text-white uppercase tracking-wide truncate">{value}</p>
    </div>
  )
}

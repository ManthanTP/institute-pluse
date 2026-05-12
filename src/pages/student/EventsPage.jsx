import { useState, useEffect } from 'react'
import { CalendarDays, MapPin, Star, ChevronRight, Sparkles, QrCode, X, Filter, Clock, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const EVENT_CATEGORIES = ['All', 'Sustainability', 'Technical', 'Workshop', 'Seminar', 'Competition', 'Volunteering']

export default function EventsPage() {
  const { profile } = useAuthStore()
  const [events, setEvents] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [viewMode, setViewMode] = useState('browse') // 'browse' | 'registered'
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
    
    if (!error && data) {
      setEvents(data)
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

  const filtered = activeCategory === 'All' ? events : events.filter(e => e.category === activeCategory)

  async function handleRegister(event) {
    if (registeredEvents.includes(event.id)) {
      toast.error('Already registered!')
      return
    }

    const { error } = await supabase
      .from('event_participants')
      .insert({ event_id: event.id, student_id: profile.id })

    if (error) {
      toast.error('Failed to register. Please try again.')
      return
    }

    // Increment current_participants
    await supabase.rpc('increment_event_participants', { event_id: event.id })

    setRegisteredEvents(prev => [...prev, event.id])
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, current_participants: (e.current_participants || 0) + 1 } : e))
    toast.success(`Registered for ${event.title}! 🎉`)
    setSelectedEvent(null)
  }

  async function handleCancel(eventId) {
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('student_id', profile.id)

    if (error) {
      toast.error('Failed to cancel registration.')
      return
    }

    // Decrement current_participants
    await supabase.rpc('decrement_event_participants', { event_id: eventId })

    setRegisteredEvents(prev => prev.filter(id => id !== eventId))
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, current_participants: Math.max(0, (e.current_participants || 1) - 1) } : e))
    toast.success('Registration cancelled.')
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-6">
        {/* VIEW SELECTOR */}
        <div className="flex gap-4 mb-8">
          {['browse', 'registered'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${
                viewMode === mode
                  ? 'bg-white text-slate-950 border-white shadow-xl shadow-white/10'
                  : 'bg-white/5 border border-white/10 text-gray-500 hover:text-white'
              }`}
            >
              {mode === 'browse' ? '📅 Browse' : `🎫 Registered (${registeredEvents.length})`}
            </button>
          ))}
        </div>

        {viewMode === 'browse' ? (
          <>
            {/* CATEGORY FILTERS */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar mb-8">
              {EVENT_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 border ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                      : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* EVENT CARDS */}
            <div className="space-y-6">
              {loading ? (
                 <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Fetching Events...</p>
                 </div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl">
                   <div className="text-4xl mb-4 opacity-40">📅</div>
                   <p className="text-xs font-black text-white uppercase tracking-widest">No Events Found</p>
                </div>
              ) : filtered.map((event, i) => {
                const isRegistered = registeredEvents.includes(event.id)
                const fillPercent = Math.round(((event.current_participants || 0) / (event.max_participants || 100)) * 100)
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl relative overflow-hidden group hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                       <CalendarDays size={24} className="text-blue-500" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-500 uppercase tracking-widest">
                        {event.category}
                      </span>
                      {isRegistered && (
                        <span className="px-3 py-1 rounded-xl bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest">
                          Registered ✓
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 leading-none">{event.title}</h3>
                    <p className="text-[10px] font-medium text-gray-500 leading-relaxed line-clamp-2 mb-6">{event.description}</p>
                    
                    <div className="flex items-center gap-6 mb-6">
                       <div>
                          <p className="text-xs font-black text-white leading-none mb-1">{event.date}</p>
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Schedule</p>
                       </div>
                       <div>
                          <p className="text-xs font-black text-white leading-none mb-1">{event.venue}</p>
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Node Location</p>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                          <Star size={12} /> +{event.eco_points} Eco Pts
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{fillPercent}% Capacity</span>
                          <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 rounded-full" style={{ width: `${fillPercent}%` }} />
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </>
        ) : (
          /* REGISTERED EVENTS */
          <div className="space-y-4">
            {registeredEvents.length === 0 ? (
              <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl">
                <CalendarDays size={48} className="mx-auto text-gray-700 mb-6" />
                <p className="text-xs font-black text-white uppercase tracking-widest">No Manifestations Registered</p>
                <p className="text-[10px] font-medium text-gray-500 mt-2 italic">Join an event to start your eco-journey.</p>
              </div>
            ) : (
              events.filter(e => registeredEvents.includes(e.id)).map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl flex items-center gap-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
                    <QrCode size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">{event.title}</h3>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">{event.date} • {event.venue}</p>
                  </div>
                  <button 
                    onClick={() => handleCancel(event.id)}
                    className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* EVENT DETAIL MODAL */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md" 
              onClick={() => setSelectedEvent(null)} 
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 lg:left-72 z-[101] bg-slate-900 border-t border-white/10 rounded-t-[48px] p-10 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
            >
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <CalendarDays size={28} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Event Manifest</p>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">{selectedEvent.title}</h2>
                     </div>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500"><X size={20} /></button>
               </div>

               <div className="space-y-8">
                  <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                     <p className="text-white/80 text-[13px] leading-relaxed font-medium mb-10">
                        {selectedEvent.description}
                     </p>
                     
                     <div className="grid grid-cols-2 gap-4 mb-10">
                        {[
                          { label: 'Temporal Node', value: `${selectedEvent.date} • ${selectedEvent.event_time || '09:00 AM'}`, icon: Clock },
                          { label: 'Location Node', value: selectedEvent.venue, icon: MapPin },
                          { label: 'Occupancy', value: `${selectedEvent.current_participants}/${selectedEvent.max_participants}`, icon: Users },
                          { label: 'Eco Yield', value: `+${selectedEvent.eco_points} Pts`, icon: Star },
                        ].map(s => (
                          <div key={s.label} className="bg-white/5 border border-white/5 rounded-2xl p-5">
                             <div className="flex items-center gap-2 mb-2">
                                <s.icon size={12} className="text-gray-500" />
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{s.label}</span>
                             </div>
                             <p className="text-[10px] font-black text-white uppercase tracking-tight">{s.value}</p>
                          </div>
                        ))}
                     </div>

                     <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRegister(selectedEvent)}
                        disabled={registeredEvents.includes(selectedEvent.id)}
                        className={`w-full py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                          registeredEvents.includes(selectedEvent.id)
                            ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                            : 'bg-green-600 text-white shadow-xl shadow-green-600/20 hover:bg-green-500'
                        }`}
                     >
                        {registeredEvents.includes(selectedEvent.id) ? 'Identity Manifest Synchronized' : 'Initialize Registration'}
                     </motion.button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

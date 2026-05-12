import { useState, useEffect } from 'react'
import { CalendarDays, Plus, Search, Edit3, Trash2, Users, MapPin, Clock, Star, X, CheckCircle2, LayoutGrid, Calendar, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/index'

const CATEGORIES = ['Workshop', 'Seminar', 'Sustainability', 'Cultural', 'Sports', 'Other']

export default function FacultyEventsPage() {
  const { profile } = useAuthStore()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false)
  const [participants, setParticipants] = useState([])

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)
    // Faculty sees all events but can only edit their own (enforced by UI, and should be by RLS)
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles(full_name)')
      .order('event_date', { ascending: true })
    
    if (data) setEvents(data)
    setLoading(false)
  }

  async function fetchParticipants(eventId) {
    const { data } = await supabase
      .from('event_participants')
      .select('*, profiles(full_name, email, department)')
      .eq('event_id', eventId)
    
    if (data) setParticipants(data)
  }

  async function handleSaveEvent(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const eventData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      venue: formData.get('venue'),
      event_date: formData.get('event_date'),
      event_time: formData.get('event_time'),
      max_participants: parseInt(formData.get('max_participants')),
      eco_points: parseInt(formData.get('eco_points')),
      status: 'upcoming',
      banner_color: formData.get('banner_color') || '#3b82f6',
      created_by: profile.id
    }

    let error
    if (selectedEvent?.id) {
      const res = await supabase.from('events').update(eventData).eq('id', selectedEvent.id)
      error = res.error
    } else {
      const res = await supabase.from('events').insert(eventData)
      error = res.error
    }

    if (error) {
      toast.error('Failed to synchronize event protocol')
    } else {
      toast.success('Event registry updated successfully')
      setIsModalOpen(false)
      fetchEvents()
    }
  }

  const filtered = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <FacultyLayout>
      <div className="space-y-10">
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Faculty Event Registry</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Manage Events</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
              Synchronizing campus-wide campaigns
            </p>
          </div>
          <button 
            onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
            className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3"
          >
             <Plus size={16} /> Create Campaign
          </button>
        </div>

        {/* SEARCH NODES */}
        <div className="relative group max-w-2xl">
           <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
           <input 
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Search campaigns..."
             className="w-full bg-white/5 border border-white/10 rounded-[32px] py-5 pl-16 pr-6 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-blue-500/50 transition-all"
           />
        </div>

        {/* EVENTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
           <AnimatePresence mode="popLayout">
             {loading ? (
                <div className="col-span-full py-20 text-center"><div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" /></div>
             ) : filtered.length === 0 ? (
                <div className="col-span-full py-20 text-center glass-card"><p className="text-xs font-black text-gray-600 uppercase tracking-widest">No Active Campaigns</p></div>
             ) : filtered.map((event, i) => (
               <motion.div
                 key={event.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.05 }}
                 className="glass-card p-8 relative overflow-hidden group"
               >
                 <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                       <div 
                         className="w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:rotate-12"
                         style={{ backgroundColor: event.banner_color }}
                       >
                          <CalendarDays size={28} />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">{event.category}</p>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">{event.title}</h3>
                       </div>
                    </div>
                    {event.created_by === profile.id && (
                       <button 
                         onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                         className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
                       >
                          <Edit3 size={18} />
                       </button>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-gray-500">
                          <Calendar size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{new Date(event.event_date).toLocaleDateString()}</span>
                       </div>
                       <div className="flex items-center gap-3 text-gray-500">
                          <MapPin size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest truncate">{event.venue}</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-gray-500">
                          <Clock size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{event.event_time}</span>
                       </div>
                       <div className="flex items-center gap-3 text-gray-500">
                          <Star size={14} className="text-yellow-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{event.eco_points} XP</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex-1">
                       <div className="flex items-center justify-between mb-2">
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Registration Quota</p>
                          <span className="text-[10px] font-black text-white">{event.current_participants}/{event.max_participants}</span>
                       </div>
                       <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-1000"
                            style={{ width: `${(event.current_participants / event.max_participants) * 100}%` }}
                          />
                       </div>
                    </div>
                    <button 
                      onClick={() => { setSelectedEvent(event); fetchParticipants(event.id); setIsParticipantsModalOpen(true); }}
                      className="ml-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 group"
                    >
                       <Users size={18} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Manifest</span>
                    </button>
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </div>

      {/* MODAL FOR ADD/EDIT */}
      <AnimatePresence>
         {isModalOpen && (
           <>
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md"
               onClick={() => setIsModalOpen(false)}
             />
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="fixed inset-x-6 top-[5%] bottom-[5%] max-w-2xl mx-auto bg-slate-900 border border-white/10 rounded-[48px] z-[101] p-12 overflow-y-auto no-scrollbar shadow-2xl"
             >
                <div className="flex items-center justify-between mb-10">
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedEvent ? 'Modify Campaign' : 'Initialize Campaign'}</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500"><X size={20} /></button>
                </div>

                <form onSubmit={handleSaveEvent} className="space-y-8">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2 col-span-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Campaign Title</label>
                         <input name="title" defaultValue={selectedEvent?.title} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-blue-500/30" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
                         <select name="category" defaultValue={selectedEvent?.category || 'Workshop'} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none">
                            {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Accent Theme</label>
                         <input name="banner_color" type="color" defaultValue={selectedEvent?.banner_color || '#3b82f6'} className="w-full h-[58px] bg-white/5 border border-white/10 rounded-2xl p-2 cursor-pointer" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Deployment Date</label>
                         <input name="event_date" type="date" defaultValue={selectedEvent?.event_date} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Temporal Node (Time)</label>
                         <input name="event_time" type="time" defaultValue={selectedEvent?.event_time} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none" required />
                      </div>
                      <div className="space-y-2 col-span-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Venue Nexus</label>
                         <input name="venue" defaultValue={selectedEvent?.venue} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Max Capacity</label>
                         <input name="max_participants" type="number" defaultValue={selectedEvent?.max_participants || 100} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Eco-Yield (XP)</label>
                         <input name="eco_points" type="number" defaultValue={selectedEvent?.eco_points || 50} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none" required />
                      </div>
                      <div className="space-y-2 col-span-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Campaign Narrative</label>
                         <textarea name="description" defaultValue={selectedEvent?.description} className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-white outline-none min-h-[120px]" />
                      </div>
                   </div>

                   <button type="submit" className="w-full py-6 rounded-[28px] bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all">
                      Synchronize Campaign
                   </button>
                </form>
             </motion.div>
           </>
         )}
      </AnimatePresence>

      {/* MODAL FOR PARTICIPANTS */}
      <AnimatePresence>
         {isParticipantsModalOpen && (
           <>
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md"
               onClick={() => setIsParticipantsModalOpen(false)}
             />
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="fixed inset-x-6 top-[10%] bottom-[10%] max-w-2xl mx-auto bg-slate-900 border border-white/10 rounded-[48px] z-[101] p-12 overflow-hidden shadow-2xl flex flex-col"
             >
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Identity Manifest</h2>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{selectedEvent?.title}</p>
                   </div>
                   <button onClick={() => setIsParticipantsModalOpen(false)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
                   {participants.length === 0 ? (
                      <div className="py-20 text-center"><p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Zero Identities Registered</p></div>
                   ) : participants.map((p, i) => (
                      <div key={p.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center justify-between hover:bg-white/[0.08] transition-all group">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-[11px] font-black text-blue-500 uppercase group-hover:scale-110 transition-transform">
                               {p.profiles?.full_name?.[0]}
                            </div>
                            <div>
                               <p className="text-[11px] font-black text-white uppercase tracking-tight">{p.profiles?.full_name}</p>
                               <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{p.profiles?.department || 'Student'}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[9px] font-black text-white uppercase tracking-widest">{new Date(p.registered_at).toLocaleDateString()}</p>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">Uplinked</p>
                         </div>
                      </div>
                   ))}
                </div>
             </motion.div>
           </>
         )}
      </AnimatePresence>
    </FacultyLayout>
  )
}

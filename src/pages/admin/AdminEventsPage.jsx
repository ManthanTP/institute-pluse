import { useState, useEffect } from 'react'
import { CalendarDays, Plus, Search, Edit3, Trash2, Users, MapPin, Clock, Star, X, CheckCircle2, AlertCircle, Filter, MoreHorizontal, LayoutGrid, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const CATEGORIES = ['Workshop', 'Seminar', 'Sustainability', 'Cultural', 'Sports', 'Other']

export default function AdminEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('upcoming') // upcoming, completed, cancelled
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false)
  const [participants, setParticipants] = useState([])

  useEffect(() => {
    fetchEvents()
  }, [filter])

  async function fetchEvents() {
    setLoading(true)
    let query = supabase.from('events').select('*, profiles(full_name)')
    
    if (filter === 'upcoming') {
      query = query.in('status', ['upcoming', 'ongoing'])
    } else {
      query = query.eq('status', filter)
    }

    const { data, error } = await query.order('event_date', { ascending: true })
    if (data) setEvents(data)
    setLoading(false)
  }

  async function fetchParticipants(eventId) {
    const { data, error } = await supabase
      .from('event_participants')
      .select('*, profiles(full_name, email, department)')
      .eq('event_id', eventId)
    
    if (data) setParticipants(data)
  }

  async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event? This will also remove all registrations.')) return
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (!error) {
      setEvents(prev => prev.filter(e => e.id !== id))
      toast.success('Event purged from registry')
    }
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
      status: formData.get('status'),
      banner_color: formData.get('banner_color') || '#16a34a'
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
      toast.error('Failed to save event protocol')
    } else {
      toast.success('Event registry synchronized')
      setIsModalOpen(false)
      fetchEvents()
    }
  }

  const filtered = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Master Event Registry</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Campaign Control</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
              {events.length} Active Protocol Nodes
            </p>
          </div>
          <div className="flex gap-4">
             <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl">
               {['upcoming', 'completed', 'cancelled'].map(f => (
                 <button 
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-slate-950 shadow-xl' : 'text-gray-500 hover:text-white'}`}
                 >
                   {f}
                 </button>
               ))}
             </div>
             <button 
               onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
               className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3"
             >
                <Plus size={16} /> New Campaign
             </button>
          </div>
        </div>

        {/* SEARCH & STATS */}
        <div className="flex flex-col md:flex-row gap-6">
           <div className="flex-1 relative group">
              <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search event registry..."
                className="w-full bg-white/5 border border-white/10 rounded-[32px] py-5 pl-16 pr-6 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-blue-500/50 transition-all"
              />
           </div>
        </div>

        {/* EVENTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
           <AnimatePresence mode="popLayout">
             {loading ? (
               <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                 <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Accessing Event Core...</p>
               </div>
             ) : filtered.length === 0 ? (
               <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl">
                  <p className="text-xs font-black text-gray-600 uppercase tracking-widest">No Campaigns Found</p>
               </div>
             ) : filtered.map((event, i) => (
               <motion.div
                 key={event.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.05 }}
                 className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl relative overflow-hidden group"
               >
                 <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                       <div 
                         className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6"
                         style={{ backgroundColor: event.banner_color }}
                       >
                          <CalendarDays size={24} />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{event.category}</p>
                          <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none">{event.title}</h3>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => { setSelectedEvent(event); fetchParticipants(event.id); setIsParticipantsModalOpen(true); }}
                         className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                       >
                          <Users size={16} />
                       </button>
                       <button 
                         onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                         className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                       >
                          <Edit3 size={16} />
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-gray-400">
                          <Calendar size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{new Date(event.event_date).toLocaleDateString()}</span>
                       </div>
                       <div className="flex items-center gap-3 text-gray-400">
                          <MapPin size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">{event.venue}</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-gray-400">
                          <Clock size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{event.event_time}</span>
                       </div>
                       <div className="flex items-center gap-3 text-gray-400">
                          <Star size={14} className="text-yellow-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{event.eco_points} XP Reward</span>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div>
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Capactiy Status</p>
                       <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                             <div 
                               className="h-full bg-blue-500 transition-all duration-1000"
                               style={{ width: `${Math.min(100, (event.current_participants / event.max_participants) * 100)}%` }}
                             />
                          </div>
                          <span className="text-[10px] font-black text-white">{event.current_participants}/{event.max_participants}</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => deleteEvent(event.id)}
                      className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors"
                    >
                       Purge Campaign
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
               className="fixed inset-x-6 top-[5%] bottom-[5%] max-w-2xl mx-auto bg-slate-900 border border-white/10 rounded-[48px] z-[101] p-10 overflow-y-auto no-scrollbar shadow-2xl"
             >
                <div className="flex items-center justify-between mb-10">
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedEvent ? 'Modify Campaign' : 'New Campaign Protocol'}</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500"><X size={20} /></button>
                </div>

                <form onSubmit={handleSaveEvent} className="space-y-6">
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
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Banner Color</label>
                         <input name="banner_color" type="color" defaultValue={selectedEvent?.banner_color || '#16a34a'} className="w-full h-[58px] bg-white/5 border border-white/10 rounded-2xl p-2 cursor-pointer" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Launch Date</label>
                         <input name="event_date" type="date" defaultValue={selectedEvent?.event_date} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Launch Time</label>
                         <input name="event_time" type="time" defaultValue={selectedEvent?.event_time} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none" required />
                      </div>
                      <div className="space-y-2 col-span-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Venue Node</label>
                         <input name="venue" defaultValue={selectedEvent?.venue} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Max Payload (Participants)</label>
                         <input name="max_participants" type="number" defaultValue={selectedEvent?.max_participants || 100} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Eco-Bonus (XP)</label>
                         <input name="eco_points" type="number" defaultValue={selectedEvent?.eco_points || 50} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none" required />
                      </div>
                      <div className="space-y-2 col-span-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Operational Status</label>
                         <select name="status" defaultValue={selectedEvent?.status || 'upcoming'} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none">
                            <option value="upcoming" className="bg-slate-900">Upcoming</option>
                            <option value="ongoing" className="bg-slate-900">Ongoing</option>
                            <option value="completed" className="bg-slate-900">Completed</option>
                            <option value="cancelled" className="bg-slate-900">Cancelled</option>
                         </select>
                      </div>
                      <div className="space-y-2 col-span-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description Brief</label>
                         <textarea name="description" defaultValue={selectedEvent?.description} className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-white outline-none min-h-[120px]" />
                      </div>
                   </div>

                   <button type="submit" className="w-full py-6 rounded-[28px] bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all">
                      Synchronize Campaign Registry
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
               className="fixed inset-x-6 top-[10%] bottom-[10%] max-w-3xl mx-auto bg-slate-900 border border-white/10 rounded-[48px] z-[101] p-12 overflow-hidden shadow-2xl flex flex-col"
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
                      <div key={p.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center justify-between hover:bg-white/[0.08] transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-[11px] font-black text-blue-500 uppercase">
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
    </AdminLayout>
  )
}

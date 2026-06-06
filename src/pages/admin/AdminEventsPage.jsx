import { useState, useEffect, useRef } from 'react'
import { CalendarDays, Plus, Search, Edit3, Trash2, Users, MapPin, Clock, Star, X, CheckCircle2, AlertCircle, Filter, MoreHorizontal, LayoutGrid, Calendar, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { exportTablePDF } from '../../lib/pdfExport'
import { useAuthStore } from '../../store/index'

const CATEGORIES = ['Workshop', 'Seminar', 'Sustainability', 'Cultural', 'Sports', 'Other']

export default function AdminEventsPage() {
  const { profile } = useAuthStore()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('upcoming') // upcoming, completed, cancelled
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false)
  const [participants, setParticipants] = useState([])

  // Event Room Chat States
  const [activeModalTab, setActiveModalTab] = useState('roster') // 'roster', 'chat'
  const [roomMessages, setRoomMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [roomMessages])

  useEffect(() => {
    if (!selectedEvent || activeModalTab !== 'chat') return

    fetchRoomMessages(selectedEvent.id)

    const channel = supabase
      .channel(`event_room_admin_${selectedEvent.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_messages',
          filter: `event_id=eq.${selectedEvent.id}`
        },
        async (payload) => {
          const { data: pData } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.sender_id)
            .single()

          const messageWithProfile = {
            ...payload.new,
            profiles: pData || { full_name: 'Unknown User', role: 'student' }
          }

          setRoomMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, messageWithProfile]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedEvent, activeModalTab])

  async function fetchRoomMessages(eventId) {
    try {
      const { data, error } = await supabase
        .from('event_messages')
        .select('*, profiles(full_name, role)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })

      if (!error && data) {
         setRoomMessages(data)
      }
    } catch (err) {
      console.error('Error fetching room messages:', err)
    }
  }

  async function handleSendRoomMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedEvent || !profile?.id) return

    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      const { error } = await supabase
        .from('event_messages')
        .insert({
          event_id: selectedEvent.id,
          sender_id: profile.id,
          message: messageText
        })

      if (error) throw error
    } catch (err) {
      console.error('Send message error:', err)
      toast.error('Failed to send message')
    }
  }

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
      banner_color: formData.get('banner_color') || '#dc2626',
      enable_chat: formData.get('enable_chat') === 'on'
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

  function handleDownloadCSV() {
    if (!participants || participants.length === 0) {
      toast.error('No participants to download');
      return;
    }

    const headers = ['Name', 'Email', 'Department', 'Registered At'];
    const rows = participants.map(p => [
      p.profiles?.full_name || '',
      p.profiles?.email || '',
      p.profiles?.department || '',
      new Date(p.registered_at).toLocaleString()
    ]);

    exportTablePDF({
      title: `Event Participant Manifest`,
      subtitle: selectedEvent?.title || 'Event',
      headers,
      rows,
      filename: `${selectedEvent?.title?.replace(/\s+/g, '_') || 'event'}_manifest`,
      summaryCards: [
        { label: 'Total Participants', value: participants.length },
        { label: 'Event Date', value: selectedEvent?.event_date ? new Date(selectedEvent.event_date).toLocaleDateString() : 'N/A' },
        { label: 'Eco Points', value: `${selectedEvent?.eco_points || 0} XP` }
      ]
    });
    toast.success('Manifest Exported as PDF');
  }

  const filtered = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <AdminLayout>
      <div className="space-y-8 lg:space-y-10 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 lg:mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <span className="text-[8px] lg:text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Master Event Registry</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-none italic">Campaign <span className="text-red-500">Control</span></h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
              {events.length} Active Protocol Nodes
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl lg:rounded-2xl backdrop-blur-xl overflow-x-auto no-scrollbar">
                {['upcoming', 'completed', 'cancelled'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 md:flex-none px-4 lg:px-6 py-2.5 rounded-lg lg:rounded-xl text-[7px] lg:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-[#dc2626] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
                  >
                    {f}
                  </button>
                ))}
             </div>
             <button 
               onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
               className="w-full md:w-auto px-6 lg:px-8 py-4 rounded-xl lg:rounded-2xl bg-red-600 text-white text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-3"
             >
                <Plus size={16} /> New Protocol
             </button>
          </div>
        </div>

        {/* SEARCH & STATS */}
        <div className="flex flex-col md:flex-row gap-6">
           <div className="flex-1 relative group">
              <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="SEARCH CAMPAIGN REGISTRY..."
                className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-[32px] py-4 lg:py-5 pl-14 lg:pl-16 pr-6 text-[9px] lg:text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-red-500/50 transition-all"
              />
           </div>
        </div>

        {/* EVENTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 pb-20">
           <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                  <p className="text-[9px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest">Accessing Event Core...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="col-span-full py-16 lg:py-20 text-center bg-white/5 border border-white/10 rounded-3xl lg:rounded-[40px] backdrop-blur-xl">
                   <p className="text-[10px] lg:text-xs font-black text-gray-600 uppercase tracking-widest italic">No Campaigns Found in Registry</p>
                </div>
              ) : filtered.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-3xl lg:rounded-[40px] p-6 lg:p-8 backdrop-blur-xl relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between mb-6 lg:mb-8">
                     <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6"
                          style={{ backgroundColor: event.banner_color || '#dc2626' }}
                        >
                           <CalendarDays size={20} lg:size={24} />
                        </div>
                        <div>
                           <p className="text-[7px] lg:text-[9px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">{event.category}</p>
                           <h3 className="text-[11px] lg:text-lg font-black text-white uppercase tracking-tight leading-none line-clamp-1">{event.title}</h3>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => { setSelectedEvent(event); fetchParticipants(event.id); setIsParticipantsModalOpen(true); }}
                          className="p-2.5 lg:p-3 rounded-lg lg:rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-red-500/30 transition-colors"
                        >
                           <Users size={14} lg:size={16} />
                        </button>
                        <button 
                          onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                          className="p-2.5 lg:p-3 rounded-lg lg:rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-red-500/30 transition-colors"
                        >
                           <Edit3 size={14} lg:size={16} />
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
                     <div className="space-y-3 lg:space-y-4">
                        <div className="flex items-center gap-2 lg:gap-3 text-gray-400">
                           <Calendar size={12} lg:size={14} className="text-red-500" />
                           <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">{new Date(event.event_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-3 text-gray-400">
                           <MapPin size={12} lg:size={14} className="text-red-500" />
                           <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest truncate max-w-[80px] lg:max-w-[120px]">{event.venue}</span>
                        </div>
                     </div>
                     <div className="space-y-3 lg:space-y-4">
                        <div className="flex items-center gap-2 lg:gap-3 text-gray-400">
                           <Clock size={12} lg:size={14} className="text-red-500" />
                           <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">{event.event_time}</span>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-3 text-gray-400">
                           <Star size={12} lg:size={14} className="text-yellow-500" />
                           <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">{event.eco_points} XP Reward</span>
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                     <div className="flex-1">
                        <p className="text-[7px] lg:text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Capacity Status</p>
                        <div className="flex items-center gap-2">
                           <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                              <div 
                                className="h-full bg-red-600 transition-all duration-1000 shadow-[0_0_8px_rgba(220,38,38,0.4)]"
                                style={{ width: `${Math.min(100, (event.current_participants / event.max_participants) * 100)}%` }}
                              />
                           </div>
                           <span className="text-[9px] lg:text-[10px] font-black text-white">{event.current_participants}/{event.max_participants}</span>
                        </div>
                     </div>
                     <button 
                       onClick={() => deleteEvent(event.id)}
                       className="text-[8px] lg:text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors animate-pulse"
                     >
                        Purge Registry
                     </button>
                  </div>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>
      </div>

      {/* MODAL FOR ADD/EDIT (Portal) */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 lg:p-6 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md pointer-events-auto"
                onClick={() => setIsModalOpen(false)}
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl lg:rounded-[48px] p-6 lg:p-10 shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
                style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
              >
                <div className="flex items-center justify-between mb-6 lg:mb-8 flex-shrink-0">
                  <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter italic">{selectedEvent ? 'Modify Protocol' : 'New Protocol Launch'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSaveEvent} className="space-y-4 lg:space-y-6 overflow-y-auto no-scrollbar pr-1 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Campaign Title</label>
                      <input name="title" placeholder="ENTER PROTOCOL NAME..." defaultValue={selectedEvent?.title} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-xs lg:text-sm text-white outline-none focus:border-red-500/30 shadow-inner" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
                      <select name="category" defaultValue={selectedEvent?.category || 'Workshop'} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-xs lg:text-sm text-white outline-none appearance-none cursor-pointer">
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Identity Color</label>
                      <input name="banner_color" type="color" defaultValue={selectedEvent?.banner_color || '#dc2626'} className="w-full h-[52px] lg:h-[58px] bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-2 cursor-pointer shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Launch Date</label>
                      <input name="event_date" type="date" defaultValue={selectedEvent?.event_date} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-xs lg:text-sm text-white outline-none shadow-inner" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Launch Time</label>
                      <input name="event_time" type="time" defaultValue={selectedEvent?.event_time} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-xs lg:text-sm text-white outline-none shadow-inner" required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Venue Node</label>
                      <input name="venue" defaultValue={selectedEvent?.venue} placeholder="SPECIFY LOCATION..." className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-xs lg:text-sm text-white outline-none shadow-inner" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Max Payload</label>
                      <input name="max_participants" type="number" defaultValue={selectedEvent?.max_participants || 100} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-xs lg:text-sm text-white outline-none shadow-inner" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Eco-Bonus (XP)</label>
                      <input name="eco_points" type="number" defaultValue={selectedEvent?.eco_points || 50} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-xs lg:text-sm text-white outline-none shadow-inner" required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Operational Status</label>
                      <select name="status" defaultValue={selectedEvent?.status || 'upcoming'} className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-xs lg:text-sm text-white outline-none appearance-none cursor-pointer">
                        <option value="upcoming" className="bg-slate-900">Upcoming</option>
                        <option value="ongoing" className="bg-slate-900">Ongoing</option>
                        <option value="completed" className="bg-slate-900">Completed</option>
                        <option value="cancelled" className="bg-slate-900">Cancelled</option>
                      </select>
                    </div>
                    <div className="space-y-2 sm:col-span-2 flex items-center gap-3 pt-2">
                       <input 
                         type="checkbox" 
                         id="enableChatToggleAdmin"
                         name="enable_chat"
                         defaultChecked={selectedEvent ? selectedEvent.enable_chat : true} 
                         className="w-4 h-4 rounded border-white/10 bg-[#0f172a] text-red-600 focus:ring-0 outline-none cursor-pointer"
                       />
                       <label htmlFor="enableChatToggleAdmin" className="text-[10px] lg:text-xs font-black text-white uppercase tracking-widest cursor-pointer select-none">
                         Enable Live Discussion Chat Room for this Campaign
                       </label>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Protocol Brief</label>
                      <textarea name="description" defaultValue={selectedEvent?.description} placeholder="DESCRIBE CAMPAIGN OBJECTIVES..." className="w-full bg-white/5 border border-white/10 rounded-2xl lg:rounded-3xl p-5 lg:p-6 text-xs lg:text-sm text-white outline-none min-h-[100px] lg:min-h-[120px] shadow-inner" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-5 lg:py-6 rounded-[24px] lg:rounded-[32px] bg-red-600 text-white font-black text-[9px] lg:text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-red-600/30 hover:bg-red-500 active:scale-95 transition-all">
                    Synchronize Campaign Registry
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* MODAL FOR PARTICIPANTS & DISCUSSION (Portal) */}
      {createPortal(
        <AnimatePresence>
          {isParticipantsModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 lg:p-6 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md pointer-events-auto"
                onClick={() => { setIsParticipantsModalOpen(false); setActiveModalTab('roster'); }}
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl lg:rounded-[48px] p-8 lg:p-12 shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[85vh]"
                style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
              >
                <div className="flex items-center justify-between mb-8 lg:mb-10 flex-shrink-0">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter italic">Campaign Hub</h2>
                    <p className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 line-clamp-1">{selectedEvent?.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {activeModalTab === 'roster' && (
                      <button 
                        onClick={handleDownloadCSV}
                        className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2"
                      >
                        <Download size={14} /> Export PDF
                      </button>
                    )}
                    <button onClick={() => { setIsParticipantsModalOpen(false); setActiveModalTab('roster'); }} className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-[#161b22] border border-white/10 rounded-2xl p-1 mb-8 flex-shrink-0">
                  <button 
                    onClick={() => setActiveModalTab('roster')} 
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeModalTab === 'roster' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                  >
                    Student Info
                  </button>
                  <button 
                    onClick={() => setActiveModalTab('chat')} 
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeModalTab === 'chat' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                  >
                    Live Discussion
                  </button>
                </div>

                {activeModalTab === 'roster' ? (
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 lg:space-y-4 pr-1 pb-4">
                    {participants.length === 0 ? (
                      <div className="py-20 text-center"><p className="text-[9px] lg:text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Zero Identities Registered</p></div>
                    ) : participants.map((p, i) => (
                      <div key={p.id} className="bg-white/5 border border-white/5 rounded-2xl lg:rounded-3xl p-5 lg:p-6 flex items-center justify-between hover:bg-white/[0.08] transition-all">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-red-500/10 flex items-center justify-center text-[10px] lg:text-[11px] font-black text-red-500 uppercase border border-red-500/10">
                            {p.profiles?.full_name?.[0]}
                          </div>
                          <div>
                            <p className="text-[10px] lg:text-[11px] font-black text-white uppercase tracking-tight">{p.profiles?.full_name}</p>
                            <p className="text-[7px] lg:text-[8px] font-black text-gray-500 uppercase tracking-widest">{p.profiles?.department || 'Student'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] lg:text-[9px] font-black text-white uppercase tracking-widest">{new Date(p.registered_at).toLocaleDateString()}</p>
                          <p className="text-[7px] lg:text-[8px] font-gray-500 uppercase tracking-widest mt-1">Uplinked</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  selectedEvent?.enable_chat ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-y-auto no-scrollbar bg-black/20 rounded-2xl p-4 border border-white/5 flex flex-col gap-3 mb-4">
                        {roomMessages.length === 0 ? (
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center my-auto">No messages in this event room yet. Be the first to start the discussion!</p>
                        ) : (
                          roomMessages.map((m) => {
                            const isSelf = m.sender_id === profile?.id
                            const isFacultyOrAdmin = m.profiles?.role === 'faculty' || m.profiles?.role === 'admin'
                            return (
                              <div key={m.id} className={`flex flex-col max-w-[85%] ${isSelf ? 'self-end items-end' : 'self-start items-start'}`}>
                                {!isSelf && (
                                  <div className="flex items-center gap-1.5 mb-1 ml-1">
                                    <span className="text-[8px] font-black text-gray-500 uppercase">{m.profiles?.full_name || 'Anonymous'}</span>
                                    {isFacultyOrAdmin && (
                                      <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[6px] font-black uppercase">{m.profiles?.role}</span>
                                    )}
                                  </div>
                                )}
                                <div className={`px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                                  isSelf 
                                    ? 'bg-red-600 text-white rounded-tr-none' 
                                    : 'bg-white/5 border border-white/5 text-gray-300 rounded-tl-none'
                                }`}>
                                  {m.message}
                                </div>
                              </div>
                            )
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      <form onSubmit={handleSendRoomMessage} className="flex gap-2 flex-shrink-0">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message to event members..."
                          className="flex-1 bg-[#161b22] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-red-500/50 transition-colors"
                        />
                        <button
                          type="submit"
                          className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest py-10">Event Discussion Room is disabled by host</p>
                    </div>
                  )
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </AdminLayout>
  )
}

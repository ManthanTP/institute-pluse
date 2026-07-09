import { useState, useEffect, useRef } from 'react'
import { CalendarDays, Plus, Search, Edit3, Trash2, Users, MapPin, Clock, Star, X, CheckCircle2, AlertCircle, Filter, MoreHorizontal, LayoutGrid, Calendar, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { exportTablePDF } from '../../lib/pdfExport'
import { useAuthStore } from '../../store/index'
import * as XLSX from 'xlsx'

const CATEGORIES = ['Workshop', 'Seminar', 'Sustainability', 'Cultural', 'Sports', 'Hackathon', 'Gaming', 'Other']

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
  const [teamsData, setTeamsData] = useState([])
  const [formTeamType, setFormTeamType] = useState('solo')
  const [formMaxTeamSize, setFormMaxTeamSize] = useState(1)

  // XP Distribution States
  const [xpModalTarget, setXpModalTarget] = useState(null)
  const [xpAmount, setXpAmount] = useState(50)
  const [splitEqually, setSplitEqually] = useState(false)
  const [isDistributingXp, setIsDistributingXp] = useState(false)

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

  const handleAwardXP = (members, name) => {
    setXpModalTarget({ members, name })
    setXpAmount(selectedEvent?.eco_points || 50)
    setSplitEqually(false)
  }

  async function submitXpDistribution() {
    if (!xpModalTarget || isDistributingXp) return
    setIsDistributingXp(true)
    try {
      const { members, name } = xpModalTarget
      const acceptedMembers = members.filter(m => m.status === 'accepted' || !m.status);
      const targetList = acceptedMembers.length > 0 ? acceptedMembers : members;
      
      const awardAmount = splitEqually ? Math.round(xpAmount / targetList.length) : xpAmount
      
      for (const member of targetList) {
        const actualStudentId = member.student_id ? member.student_id : member.id;
        if (!actualStudentId) continue;

        const { data: prof, error: getErr } = await supabase
          .from('profiles')
          .select('eco_points')
          .eq('id', actualStudentId)
          .single()
          
        if (prof) {
          const { error: updErr } = await supabase
            .from('profiles')
            .update({ eco_points: prof.eco_points + awardAmount })
            .eq('id', actualStudentId);
            
          if (!updErr) {
            await supabase
              .from('student_notifications')
              .insert({
                student_id: actualStudentId,
                title: `Event Reward: +${awardAmount} XP!`,
                message: `You earned ${awardAmount} XP for participating in "${selectedEvent.title}"!`,
                type: 'badge',
                is_read: false,
                sender_id: profile?.id
              });
          }
        }
      }
      toast.success(`Successfully distributed XP to ${name}!`)
      setXpModalTarget(null)
    } catch (err) {
      console.error('XP distribution error:', err)
      toast.error('Failed to distribute XP')
    } finally {
      setIsDistributingXp(false)
    }
  }

  async function fetchEvents() {
    setLoading(true)
    let query = supabase.from('events').select('*, profiles(full_name)')
    
    if (filter === 'upcoming') {
      query = query.in('status', ['upcoming', 'ongoing', 'postponed'])
    } else {
      query = query.eq('status', filter)
    }

    const { data, error } = await query.order('event_date', { ascending: true })
    if (data) setEvents(data)
    setLoading(false)
  }

  async function fetchParticipants(eventId) {
    const { data: pData } = await supabase
      .from('event_participants')
      .select('*, profiles(id, full_name, email, department)')
      .eq('event_id', eventId)
    
    if (pData) setParticipants(pData)

    // Load team data
    const { data: teams } = await supabase
      .from('event_teams')
      .select('*, profiles(full_name)')
      .eq('event_id', eventId)

    if (teams && teams.length > 0) {
      const { data: members } = await supabase
        .from('event_team_members')
        .select('*, profiles(id, full_name, email, department)')
        .in('team_id', teams.map(t => t.id))

      const teamsWithMembers = teams.map(team => ({
        ...team,
        members: members ? members.filter(m => m.team_id === team.id) : []
      }))
      setTeamsData(teamsWithMembers)
    } else {
      setTeamsData([])
    }
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
    const teamType = formData.get('team_type') || 'solo'
    const eventData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      venue: formData.get('venue'),
      event_date: formData.get('event_date'),
      event_time: formData.get('event_time'),
      max_participants: parseInt(formData.get('max_participants')),
      eco_points: parseInt(formData.get('eco_points')),
      status: selectedEvent ? (formData.get('status') || selectedEvent.status) : 'upcoming',
      banner_color: formData.get('banner_color') || '#dc2626',
      enable_chat: formData.get('enable_chat') === 'on',
      team_type: teamType,
      max_team_size: teamType === 'solo' ? 1 : parseInt(formData.get('max_team_size') || '2')
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

  async function quickUpdateStatus(eventId, newStatus) {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId)
        
      if (error) throw error
      toast.success(`Campaign successfully updated to ${newStatus}`)
      fetchEvents()
    } catch (err) {
      console.error('Error updating status:', err)
      toast.error('Failed to update campaign status')
    }
  }

  function handleDownloadCSV() {
    const isTeamEvent = selectedEvent?.team_type && selectedEvent?.team_type !== 'solo'
    
    if (isTeamEvent) {
      if (!teamsData || teamsData.length === 0) {
        toast.error('No team data to download');
        return;
      }
      const headers = ['Team Name', 'Role', 'Name', 'Email', 'Department', 'Status'];
      const rows = [];
      teamsData.forEach(team => {
        team.members.forEach(m => {
          rows.push([
            team.team_name,
            m.student_id === team.leader_id ? 'Leader' : 'Member',
            m.profiles?.full_name || '',
            m.profiles?.email || '',
            m.profiles?.department || '',
            m.status || 'pending'
          ]);
        });
      });

      exportTablePDF({
        title: `Event Team Manifest`,
        subtitle: selectedEvent?.title || 'Event',
        headers,
        rows,
        filename: `${selectedEvent?.title?.replace(/\s+/g, '_') || 'event'}_team_manifest`,
        summaryCards: [
          { label: 'Total Teams', value: teamsData.length },
          { label: 'Event Format', value: selectedEvent?.team_type?.toUpperCase() || 'TEAM' },
          { label: 'Eco Points', value: `${selectedEvent?.eco_points || 0} XP` }
        ]
      });
    } else {
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
    }
    toast.success('Manifest Exported as PDF');
  }

  function handleDownloadXLSX() {
    const isTeamEvent = selectedEvent?.team_type && selectedEvent?.team_type !== 'solo'
    let excelData = []

    if (isTeamEvent) {
      if (!teamsData || teamsData.length === 0) {
        toast.error('No team data to download');
        return;
      }
      teamsData.forEach(team => {
        team.members.forEach(member => {
          excelData.push({
            'Event Title': selectedEvent.title,
            'Team Name': team.team_name,
            'Role': member.student_id === team.leader_id ? 'Leader' : 'Member',
            'Full Name': member.profiles?.full_name || 'N/A',
            'Email': member.profiles?.email || 'N/A',
            'Department': member.profiles?.department || 'N/A',
            'Invitation Status': member.status || 'pending',
            'Invitation Date': member.invited_at ? new Date(member.invited_at).toLocaleDateString() : 'N/A'
          })
        })
      })
    } else {
      if (!participants || participants.length === 0) {
        toast.error('No participants to download');
        return;
      }
      excelData = participants.map(p => ({
        'Event Title': selectedEvent.title,
        'Full Name': p.profiles?.full_name || 'N/A',
        'Email': p.profiles?.email || 'N/A',
        'Department': p.profiles?.department || 'N/A',
        'Registration Date': new Date(p.registered_at).toLocaleDateString()
      }))
    }

    try {
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Roster')
      
      const fileName = `${selectedEvent?.title?.replace(/\s+/g, '_') || 'event'}_roster.xlsx`
      XLSX.writeFile(wb, fileName)
      toast.success('Roster Exported as Excel')
    } catch (err) {
      console.error('XLSX export failed:', err)
      toast.error('Excel Export Failed: ' + err.message)
    }
  }

  const filtered = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))

  const getEventPriority = (e) => {
    if (e.status === 'cancelled') return 5;
    if (e.status === 'postponed') return 4;
    
    const now = new Date();
    
    // Parse time
    let hours = 0;
    let minutes = 0;
    if (e.event_time) {
      const timeMatch = e.event_time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3];
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
      }
    }
    const eventDateTime = new Date(`${e.event_date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
    
    if (e.status === 'completed' || (!isNaN(eventDateTime.getTime()) && eventDateTime < now)) {
      return 3;
    }
    
    // Check if starts in < 24h
    if (!isNaN(eventDateTime.getTime())) {
      const diffMs = eventDateTime.getTime() - now.getTime();
      if (diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000) {
        return 1; // Soon starting
      }
    }
    
    // Check if active today
    const todayStr = now.toISOString().split('T')[0];
    if (e.event_date === todayStr) {
      return 1; // Live today
    }
    
    return 2; // Upcoming
  };

  const sortedFiltered = [...filtered].sort((a, b) => {
    const pA = getEventPriority(a);
    const pB = getEventPriority(b);
    if (pA !== pB) return pA - pB;
    
    const timeA = new Date(a.event_date).getTime();
    const timeB = new Date(b.event_date).getTime();
    if (pA === 1 || pA === 2) {
      return timeA - timeB; // Closest first
    } else {
      return timeB - timeA; // Latest completed first
    }
  });

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
               onClick={() => { setSelectedEvent(null); setFormTeamType('solo'); setFormMaxTeamSize(1); setIsModalOpen(true); }}
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
              ) : sortedFiltered.length === 0 ? (
                <div className="col-span-full py-16 lg:py-20 text-center bg-white/5 border border-white/10 rounded-3xl lg:rounded-[40px] backdrop-blur-xl">
                   <p className="text-[10px] lg:text-xs font-black text-gray-600 uppercase tracking-widest italic">No Campaigns Found in Registry</p>
                </div>
              ) : sortedFiltered.map((event, i) => (
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
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="text-[7px] lg:text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">{event.category}</p>
                              {event.status === 'cancelled' ? (
                                <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[7px] font-black uppercase tracking-wider">Cancelled</span>
                              ) : event.status === 'postponed' ? (
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[7px] font-black uppercase tracking-wider">Postponed</span>
                              ) : event.status === 'completed' ? (
                                <span className="px-2 py-0.5 rounded bg-gray-500/10 border border-gray-500/20 text-gray-400 text-[7px] font-black uppercase tracking-wider">Completed</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-[7px] font-black uppercase tracking-wider animate-pulse">Active</span>
                              )}
                            </div>
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
                           <span className="text-[8px] lg:text-[10px] font-black text-white">{event.current_participants}/{event.max_participants}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 ml-4 flex-wrap justify-end">
                       {event.status === 'upcoming' && (
                         <>
                           <button 
                             onClick={() => quickUpdateStatus(event.id, 'postponed')}
                             className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                             title="Postpone Campaign"
                           >
                             Postpone
                           </button>
                           <button 
                             onClick={() => quickUpdateStatus(event.id, 'cancelled')}
                             className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                             title="Cancel Campaign"
                           >
                             Cancel
                           </button>
                         </>
                       )}
                     </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/5 text-right">
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
                        <option value="postponed" className="bg-slate-900">Postponed</option>
                        <option value="completed" className="bg-slate-900">Completed</option>
                        <option value="cancelled" className="bg-slate-900">Cancelled</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Game / Team Format</label>
                      <select 
                        name="team_type" 
                        value={formTeamType} 
                        onChange={e => {
                          const val = e.target.value;
                          setFormTeamType(val);
                          if (val === 'solo') setFormMaxTeamSize(1);
                          else if (val === 'duo') setFormMaxTeamSize(2);
                          else if (val === 'trio') setFormMaxTeamSize(3);
                          else if (val === 'squad') setFormMaxTeamSize(4);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-xs lg:text-sm text-white outline-none appearance-none cursor-pointer"
                      >
                        <option value="solo" className="bg-slate-900">Solo (1 Player)</option>
                        <option value="duo" className="bg-slate-900">Duo (2 Players)</option>
                        <option value="trio" className="bg-slate-900">Trio (3 Players)</option>
                        <option value="squad" className="bg-slate-900">Squad (4 Players)</option>
                        <option value="custom" className="bg-slate-900">Custom Size</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Max Team Size</label>
                      <input 
                        name="max_team_size" 
                        type="number"
                        min="1"
                        value={formMaxTeamSize}
                        onChange={e => setFormMaxTeamSize(parseInt(e.target.value) || 1)}
                        disabled={formTeamType !== 'custom'}
                        className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-5 text-xs lg:text-sm text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                        required 
                      />
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
                className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl lg:rounded-[48px] p-6 lg:p-12 shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[92vh] md:max-h-[90vh]"
                style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
              >
                <div className="flex items-center justify-between mb-8 lg:mb-10 flex-shrink-0">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter italic">Campaign Hub</h2>
                    <p className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 line-clamp-1">{selectedEvent?.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {activeModalTab === 'roster' && (
                      <>
                        <button 
                          onClick={handleDownloadCSV}
                          className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2"
                        >
                          <Download size={14} /> PDF
                        </button>
                        <button 
                          onClick={handleDownloadXLSX}
                          className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all flex items-center gap-2"
                        >
                          <Download size={14} /> Excel
                        </button>
                      </>
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
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-1 pb-4">
                    {selectedEvent?.team_type && selectedEvent?.team_type !== 'solo' ? (
                      /* Team Event Roster Grouping */
                      teamsData.length === 0 ? (
                        <div className="py-20 text-center"><p className="text-[9px] lg:text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Zero Teams Registered</p></div>
                      ) : (
                        teamsData.map((team, tIdx) => (
                          <div key={team.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                              <div>
                                <h3 className="text-sm font-black text-red-500 uppercase tracking-wider">Team: {team.team_name}</h3>
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1 block">Leader: {team.profiles?.full_name}</span>
                              </div>
                              <button
                                onClick={() => handleAwardXP(team.members, team.team_name)}
                                className="px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/30 text-yellow-500 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                              >
                                Distribute XP
                              </button>
                            </div>
                            <div className="space-y-3">
                              {team.members.map(member => (
                                <div key={member.id} className="flex justify-between items-center bg-black/20 rounded-2xl p-4 hover:bg-black/35 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-[10px] font-black text-red-500 uppercase">
                                      {member.profiles?.full_name?.[0]}
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black text-white uppercase tracking-tight">{member.profiles?.full_name}</p>
                                      <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">{member.profiles?.department || 'Student'}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                                      member.status === 'accepted' 
                                        ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                        : member.status === 'declined'
                                          ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                          : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                    }`}>
                                      {member.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      /* Solo Event Flat Roster */
                      participants.length === 0 ? (
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
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[8px] lg:text-[9px] font-black text-white uppercase tracking-widest">{new Date(p.registered_at).toLocaleDateString()}</p>
                              <p className="text-[7px] lg:text-[8px] font-gray-500 uppercase tracking-widest mt-1">Uplinked</p>
                            </div>
                            <button
                              onClick={() => handleAwardXP([{ ...p.profiles, id: p.student_id }], p.profiles?.full_name)}
                              className="px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/30 text-yellow-500 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                            >
                              Award XP
                            </button>
                          </div>
                        </div>
                      ))
                    )}
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

      {createPortal(
        <AnimatePresence>
          {xpModalTarget && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm pointer-events-auto"
                onClick={() => setXpModalTarget(null)}
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col gap-4 text-white pointer-events-auto"
              >
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-red-500">Distribute Event XP</h3>
                  <p className="text-xs text-gray-400 mt-1">Awarding XP to: <span className="text-white font-bold">{xpModalTarget.name}</span></p>
                </div>
                
                <div className="space-y-4 my-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">XP Amount to Award</label>
                    <input 
                      type="number"
                      value={xpAmount}
                      onChange={e => setXpAmount(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-yellow-500/50"
                      min="1"
                    />
                  </div>
                  
                  {xpModalTarget.members && xpModalTarget.members.length > 1 && (
                    <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-4 cursor-pointer" onClick={() => setSplitEqually(!splitEqually)}>
                      <input 
                        type="checkbox"
                        checked={splitEqually}
                        onChange={() => {}}
                        className="rounded bg-black/40 border-white/10 text-yellow-500 outline-none cursor-pointer"
                      />
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-tight">Split Points Equally</p>
                        <p className="text-[9px] text-gray-500 mt-0.5">If checked, splits {xpAmount} XP among the {xpModalTarget.members.filter(m => m.status === 'accepted' || !m.status).length} members (~{Math.round(xpAmount / Math.max(1, xpModalTarget.members.filter(m => m.status === 'accepted' || !m.status).length))} XP each).</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={() => setXpModalTarget(null)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitXpDistribution}
                    disabled={isDistributingXp}
                    className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    {isDistributingXp ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Award XP'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </AdminLayout>
  )
}

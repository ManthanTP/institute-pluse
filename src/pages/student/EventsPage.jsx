import { useState, useEffect, useRef } from 'react'
import { CalendarDays, MapPin, Star, ChevronLeft, Sparkles, QrCode, X, Filter, Clock, Users, Search, Home, LayoutGrid, Coffee, User, Check, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const EVENT_CATEGORIES = ['All', 'History', 'Sustainability', 'Technical', 'Workshop', 'Seminar', 'Cultural', 'Sports', 'Hackathon', 'Gaming', 'Other']

const getCountdownText = (dateStr, timeStr) => {
  try {
    if (!dateStr) return null;
    let hours = 0;
    let minutes = 0;
    if (timeStr) {
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
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
    
    const eventDateTime = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
    if (isNaN(eventDateTime.getTime())) {
      return null;
    }
    
    const now = new Date();
    const diffMs = eventDateTime.getTime() - now.getTime();
    
    if (diffMs > 0) {
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      if (diffDays > 0) {
        return `Starts in: ${diffDays}d ${diffHrs}h ${diffMins}m`;
      } else if (diffHrs > 0) {
        return `Starts in: ${diffHrs}h ${diffMins}m`;
      } else {
        return `Starts in: ${diffMins}m ${diffSecs}s`;
      }
    } else {
      const todayStr = now.toISOString().split('T')[0];
      if (dateStr === todayStr) {
        return "Started (Active)";
      }
      return "Completed";
    }
  } catch (e) {
    return null;
  }
};

export default function EventsPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Team states
  const [teamInvites, setTeamInvites] = useState([])
  const [userTeam, setUserTeam] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedTeammates, setSelectedTeammates] = useState([])
  const [teamName, setTeamName] = useState('')
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)

  const [roomMessages, setRoomMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const checkAndCreateEventReminders = async (registeredEventsList, eventsList, userId) => {
    try {
      if (!userId || !registeredEventsList || registeredEventsList.length === 0) return;
      
      const { data: existingNotifs, error } = await supabase
        .from('notifications')
        .select('message')
        .eq('user_id', userId)
        .eq('type', 'event_reminder');
        
      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }
      
      const existingMessages = existingNotifs ? existingNotifs.map(n => n.message) : [];
      const now = new Date();
      
      for (const eventId of registeredEventsList) {
        const event = eventsList.find(e => e.id === eventId);
        if (!event) continue;
        
        let hours = 0;
        let minutes = 0;
        if (event.event_time) {
          const timeMatch = event.event_time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
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
        
        const eventDateTime = new Date(`${event.event_date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
        if (isNaN(eventDateTime.getTime())) continue;
        
        const diffMs = eventDateTime.getTime() - now.getTime();
        
        // If event starts in less than 24 hours and is in the future
        if (diffMs > 0 && diffMs <= 86400000) {
          const reminderMsg = `Friendly reminder: The event "${event.title}" is starting in less than 24 hours at ${event.venue}!`;
          
          if (!existingMessages.some(m => m === reminderMsg)) {
            await supabase
              .from('notifications')
              .insert({
                user_id: userId,
                title: `Upcoming Event: ${event.title}`,
                message: reminderMsg,
                type: 'event_reminder',
                is_read: false
              });
          }
        }
      }
    } catch (err) {
      console.error('Error in checkAndCreateEventReminders:', err);
    }
  };

  useEffect(() => {
    if (profile?.id && registeredEvents.length > 0 && events.length > 0) {
      checkAndCreateEventReminders(registeredEvents, events, profile.id)
    }
  }, [registeredEvents, events, profile?.id])

  // Scroll chat room to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [roomMessages])

  // Real-time Event Room messaging subscription
  useEffect(() => {
    if (!selectedEvent || !registeredEvents.includes(selectedEvent.id)) return

    fetchRoomMessages(selectedEvent.id)

    const channel = supabase
      .channel(`event_room_student_${selectedEvent.id}`)
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
  }, [selectedEvent, registeredEvents])

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

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedEvent || !profile?.id) return

    const isTeamEvent = selectedEvent?.team_type && selectedEvent?.team_type !== 'solo'
    const isLeader = userTeam && userTeam.leader_id === profile?.id
    if (isTeamEvent && !isLeader) {
      toast.error('Only the team leader can send messages')
      return
    }

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
    if (profile?.id) {
      fetchRegistrations()
      fetchTeamInvites()
    }
  }, [profile?.id])

  useEffect(() => {
    if (selectedEvent) {
      fetchUserTeam(selectedEvent.id)
      // Reset team creation states
      setTeamName('')
      setSelectedTeammates([])
      setSearchQuery('')
      setSearchResults([])
      setIsCreatingTeam(false)
    } else {
      setUserTeam(null)
    }
  }, [selectedEvent, profile?.id])

  async function fetchEvents() {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
    
    if (!error && data && data.length > 0) {
      setEvents(data)
    } else {
      setEvents([])
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

  async function fetchTeamInvites() {
    if (!profile?.id) return
    try {
      const { data, error } = await supabase
        .from('event_team_members')
        .select(`
          id,
          team_id,
          student_id,
          status,
          event_teams (
            id,
            team_name,
            leader_id,
            events (
              id,
              title,
              category
            ),
            profiles:leader_id (
              full_name
            )
          )
        `)
        .eq('student_id', profile.id)
        .eq('status', 'pending')

      if (!error && data) {
        setTeamInvites(data)
      }
    } catch (err) {
      console.error('Error fetching team invites:', err)
    }
  }

  async function fetchUserTeam(eventId) {
    if (!profile?.id) return
    try {
      const { data: memberOf, error: memberError } = await supabase
        .from('event_team_members')
        .select('team_id')
        .eq('student_id', profile.id)

      if (memberOf && memberOf.length > 0) {
        const teamIds = memberOf.map(m => m.team_id)
        const { data: team, error: teamError } = await supabase
          .from('event_teams')
          .select('*, profiles:leader_id(full_name)')
          .eq('event_id', eventId)
          .in('id', teamIds)
          .maybeSingle()

        if (team) {
          const { data: members, error: memsError } = await supabase
            .from('event_team_members')
            .select('*, profiles:student_id(full_name, email, department)')
            .eq('team_id', team.id)

          setUserTeam({
            ...team,
            members: members || []
          })
          return
        }
      }
      setUserTeam(null)
    } catch (err) {
      console.error('Error fetching user team:', err)
      setUserTeam(null)
    }
  }

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const delayDebounce = setTimeout(() => {
        searchClassmates(searchQuery)
      }, 300)
      return () => clearTimeout(delayDebounce)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  async function searchClassmates(query) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, department')
      .eq('role', 'student')
      .neq('id', profile.id)
      .ilike('full_name', `%${query}%`)
      .limit(10)

    if (!error && data) {
      setSearchResults(data)
    }
  }

  async function handleAcceptInvite(invite) {
    try {
      // Check if already registered
      if (registeredEvents.includes(invite.event_teams.events.id)) {
        toast.error('You are already registered for this event')
        return
      }

      // 1. Update member status to accepted
      const { error: updateError } = await supabase
        .from('event_team_members')
        .update({ status: 'accepted' })
        .eq('id', invite.id)

      if (updateError) throw updateError

      // 2. Add to event_participants
      const { error: partError } = await supabase
        .from('event_participants')
        .insert({
          event_id: invite.event_teams.events.id,
          student_id: profile.id
        })

      if (partError) throw partError

      // 3. Increment current participants count
      await supabase.rpc('increment_event_participants', { event_id: invite.event_teams.events.id })

      toast.success('Invitation Accepted! Registered for event.')
      
      fetchRegistrations()
      fetchTeamInvites()
      fetchEvents()
      
      if (selectedEvent?.id === invite.event_teams.events.id) {
        fetchUserTeam(selectedEvent.id)
      }
    } catch (err) {
      console.error('Error accepting invite:', err)
      toast.error('Failed to accept invitation')
    }
  }

  async function handleDeclineInvite(invite) {
    try {
      const { error: updateError } = await supabase
        .from('event_team_members')
        .update({ status: 'declined' })
        .eq('id', invite.id)

      if (updateError) throw updateError

      toast.success('Invitation Declined')
      fetchTeamInvites()
    } catch (err) {
      console.error('Error declining invite:', err)
      toast.error('Failed to decline invitation')
    }
  }

  async function handleCreateTeam(e) {
    e.preventDefault()
    if (!teamName.trim() || !selectedEvent || !profile?.id) return

    try {
      // 1. Create team in event_teams
      const { data: team, error: teamError } = await supabase
        .from('event_teams')
        .insert({
          event_id: selectedEvent.id,
          team_name: teamName.trim(),
          leader_id: profile.id
        })
        .select()
        .single()

      if (teamError) {
        if (teamError.code === '23505') {
          toast.error('A team with this name already exists for this event')
        } else {
          toast.error('Failed to create team')
        }
        return
      }

      // 2. Insert members into event_team_members (leader accepted, teammates pending)
      const membersToInsert = [
        { team_id: team.id, student_id: profile.id, status: 'accepted' },
        ...selectedTeammates.map(student => ({
          team_id: team.id,
          student_id: student.id,
          status: 'pending'
        }))
      ]

      const { error: membersError } = await supabase
        .from('event_team_members')
        .insert(membersToInsert)

      if (membersError) throw membersError

      // 3. Add leader to event_participants
      const { error: partError } = await supabase
        .from('event_participants')
        .insert({
          event_id: selectedEvent.id,
          student_id: profile.id
        })

      if (partError) throw partError

      // 4. Increment participant count
      await supabase.rpc('increment_event_participants', { event_id: selectedEvent.id })

      toast.success(`Team "${teamName}" launched successfully!`)
      
      fetchRegistrations()
      fetchEvents()
      fetchUserTeam(selectedEvent.id)
      setIsCreatingTeam(false)
    } catch (err) {
      console.error('Launch team error:', err)
      toast.error('Failed to launch team')
    }
  }

  async function handleInviteMore(classmate) {
    if (!userTeam || !selectedEvent) return
    
    // Check if team already reached max capacity
    const totalMembersCount = userTeam.members.length
    if (totalMembersCount >= selectedEvent.max_team_size) {
      toast.error(`Team is already full (Max size: ${selectedEvent.max_team_size})`)
      return
    }

    try {
      const { error } = await supabase
        .from('event_team_members')
        .insert({
          team_id: userTeam.id,
          student_id: classmate.id,
          status: 'pending'
        })

      if (error) {
        if (error.code === '23505') {
          toast.error(`${classmate.full_name} is already invited or in the team`)
        } else {
          toast.error('Failed to invite classmate')
        }
        return
      }

      toast.success(`Invitation sent to ${classmate.full_name}`)
      fetchUserTeam(selectedEvent.id)
    } catch (err) {
      console.error('Invite classmate error:', err)
      toast.error('Failed to invite classmate')
    }
  }

  const filtered = activeCategory === 'All' ? events 
    : activeCategory === 'History' ? events.filter(e => registeredEvents.includes(e.id))
    : events.filter(e => e.category === activeCategory)

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
          onClick={() => navigate('/navigation')}
          className="w-full bg-white rounded-2xl md:rounded-3xl py-4 md:py-6 flex items-center justify-center gap-2 md:gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6 md:mb-10"
        >
          <span className="text-base md:text-lg">🗺️</span>
          <span className="text-xs md:text-[13px] font-black text-black uppercase tracking-[0.2em]">Campus Map & Navigation</span>
        </motion.button>

        {/* TEAM INVITES SECTION */}
        {teamInvites && teamInvites.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Pending Campaign Invitations ({teamInvites.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamInvites.map(invite => (
                <div key={invite.id} className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 text-[8px] font-black uppercase tracking-widest">
                      {invite.event_teams?.events?.category}
                    </span>
                    <h3 className="text-sm font-black text-white uppercase mt-2">{invite.event_teams?.events?.title}</h3>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">
                      Team: <span className="text-white">{invite.event_teams?.team_name}</span> (Invited by {invite.event_teams?.profiles?.full_name})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAcceptInvite(invite)}
                      className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider rounded-xl transition-all"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleDeclineInvite(invite)}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
          ) : sortedFiltered.length === 0 ? (
            <div className="py-20 text-center bg-white/5 border border-white/10 rounded-2xl md:rounded-[40px] backdrop-blur-xl">
               <div className="text-4xl mb-4 opacity-40">📅</div>
               <p className="text-xs font-black text-white uppercase tracking-widest italic">No Nodes Found</p>
            </div>
          ) : sortedFiltered.map((event, i) => {
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
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <span className="px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                    {event.category}
                  </span>
                  {isRegistered && (
                    <span className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-500 uppercase tracking-widest">
                      Registered ✓
                    </span>
                  )}
                  {event.status === 'cancelled' ? (
                    <span className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-500 uppercase tracking-widest">
                      Cancelled ✕
                    </span>
                  ) : event.status === 'postponed' ? (
                    <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                      Postponed ⏳
                    </span>
                  ) : getCountdownText(event.event_date, event.event_time) && (
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      getCountdownText(event.event_date, event.event_time).startsWith('Starts in')
                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                        : getCountdownText(event.event_date, event.event_time) === 'Completed'
                          ? 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                          : 'bg-green-500/10 border-green-500/20 text-green-500 animate-pulse'
                    }`}>
                      {getCountdownText(event.event_date, event.event_time)}
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
                className="relative w-full max-w-2xl bg-[#0a0c10] border-t border-white/10 rounded-t-3xl md:rounded-t-[50px] p-5 md:p-10 shadow-2xl pointer-events-auto flex flex-col max-h-[92vh] md:max-h-[90vh]"
                style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 flex-shrink-0" />
                
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

                <div className="space-y-6 overflow-y-auto no-scrollbar max-h-[75vh] md:max-h-[75vh] pr-2 pb-10 flex-1">
                    {getCountdownText(selectedEvent.event_date, selectedEvent.event_time) && (
                      <div className={`p-4 rounded-2xl border text-center ${
                        getCountdownText(selectedEvent.event_date, selectedEvent.event_time).startsWith('Starts in')
                          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                          : getCountdownText(selectedEvent.event_date, selectedEvent.event_time) === 'Completed'
                            ? 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                            : 'bg-green-500/10 border-green-500/20 text-green-500 animate-pulse'
                      }`}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Status Check</p>
                        <p className="text-sm font-black uppercase tracking-wider">{getCountdownText(selectedEvent.event_date, selectedEvent.event_time)}</p>
                      </div>
                    )}
                    <p className="text-gray-400 text-[13px] leading-relaxed font-medium">
                       {selectedEvent.description}
                    </p>
                   
                   <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <StatNode label="Temporal" value={selectedEvent.event_date} icon={Clock} />
                      <StatNode label="Hub" value={selectedEvent.venue} icon={MapPin} />
                      <StatNode label="Identity" value={`${selectedEvent.current_participants}/${selectedEvent.max_participants}`} icon={Users} />
                      <StatNode label="Yield" value={`+${selectedEvent.eco_points} XP`} icon={Star} />
                   </div>
                   {/* Team Registration / Status / Invite Interface */}
                   {selectedEvent.team_type && selectedEvent.team_type !== 'solo' ? (
                       <div className="space-y-6 mt-6 pt-6 border-t border-white/5">
                          {registeredEvents.includes(selectedEvent.id) ? (
                             // Registered (User has a team)
                             userTeam ? (
                                <div className="space-y-4">
                                   <div className="p-5 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                         <div>
                                            <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest">Team: {userTeam.team_name}</h4>
                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">Leader: {userTeam.profiles?.full_name}</p>
                                         </div>
                                         <span className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[8px] font-black uppercase">
                                            Registered
                                         </span>
                                      </div>
                                      <div className="space-y-2">
                                         <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Roster</p>
                                         {userTeam.members.map(member => (
                                            <div key={member.id} className="flex justify-between items-center bg-black/30 rounded-2xl p-3">
                                               <div className="flex items-center gap-2.5">
                                                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-[10px] font-black text-blue-500 uppercase">
                                                     {member.profiles?.full_name?.[0]}
                                                  </div>
                                                  <div>
                                                     <p className="text-[10px] font-black text-white uppercase tracking-tight">{member.profiles?.full_name}</p>
                                                     <p className="text-[7px] font-black text-gray-500 uppercase">{member.profiles?.department || 'Student'}</p>
                                                  </div>
                                               </div>
                                               <div className="flex items-center gap-2">
                                                  {member.student_id === userTeam.leader_id && (
                                                     <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[6px] font-black uppercase">
                                                        Leader
                                                     </span>
                                                  )}
                                                  <span className={`px-2 py-0.5 rounded text-[6px] font-black uppercase border ${
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

                                      {/* Leader actions: Invite more members */}
                                      {profile.id === userTeam.leader_id && userTeam.members.length < selectedEvent.max_team_size && (
                                         <div className="border-t border-white/5 pt-4 space-y-3">
                                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Invite Teammates ({userTeam.members.length}/{selectedEvent.max_team_size} members)</label>
                                            <div className="relative">
                                               <input 
                                                  type="text" 
                                                  value={searchQuery}
                                                  onChange={e => setSearchQuery(e.target.value)}
                                                  placeholder="Search student by name..."
                                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                                               />
                                               <Search size={14} className="absolute right-3 top-3.5 text-gray-500" />
                                            </div>
                                            {searchResults.length > 0 && (
                                               <div className="bg-black/50 border border-white/10 rounded-xl p-2 max-h-48 md:max-h-64 overflow-y-auto no-scrollbar space-y-1">
                                                  {searchResults
                                                     .filter(res => !userTeam.members.some(m => m.student_id === res.id))
                                                     .map(res => (
                                                        <div key={res.id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-lg">
                                                           <div>
                                                              <p className="text-[10px] font-black text-white uppercase">{res.full_name}</p>
                                                              <p className="text-[7px] font-black text-gray-500 uppercase">{res.department || 'Student'}</p>
                                                           </div>
                                                           <button 
                                                              onClick={() => handleInviteMore(res)}
                                                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[8px] font-black uppercase tracking-wider"
                                                           >
                                                              Invite
                                                           </button>
                                                        </div>
                                                  ))}
                                               </div>
                                            )}
                                         </div>
                                      )}
                                   </div>

                                   {/* Discussion Room */}
                                   {selectedEvent.enable_chat ? (
                                      <div className="space-y-4 mt-6 pt-6 border-t border-white/5">
                                         <div className="flex items-center gap-2 mb-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-green-500">Event Discussion Room</h4>
                                         </div>
                                         <div className="h-72 md:h-96 overflow-y-auto no-scrollbar bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
                                            {roomMessages.length === 0 ? (
                                               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center my-auto">No messages yet. Only the leader can send messages.</p>
                                            ) : (
                                               roomMessages.map((m) => {
                                                  const isSelf = m.sender_id === profile?.id
                                                  const isFaculty = m.profiles?.role === 'faculty' || m.profiles?.role === 'admin'
                                                  return (
                                                     <div key={m.id} className={`flex flex-col max-w-[85%] ${isSelf ? 'self-end items-end' : 'self-start items-start'}`}>
                                                        {!isSelf && (
                                                           <div className="flex items-center gap-1.5 mb-1 ml-1">
                                                              <span className="text-[8px] font-black text-gray-500 uppercase">{m.profiles?.full_name || 'Anonymous'}</span>
                                                              {isFaculty && (
                                                                 <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[6px] font-black uppercase">Faculty</span>
                                                              )}
                                                           </div>
                                                        )}
                                                        <div className={`px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                                                           isSelf 
                                                              ? 'bg-blue-600 text-white rounded-tr-none' 
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

                                         {profile.id === userTeam.leader_id ? (
                                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                               <input
                                                  type="text"
                                                  value={newMessage}
                                                  onChange={(e) => setNewMessage(e.target.value)}
                                                  placeholder="Type a message as Team Leader..."
                                                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500/50 transition-colors"
                                               />
                                               <button
                                                  type="submit"
                                                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                               >
                                                  Send
                                               </button>
                                            </form>
                                         ) : (
                                            <div className="py-3 px-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                  🔒 Only team leaders can chat in event discussion room
                                               </p>
                                            </div>
                                         )}
                                      </div>
                                   ) : (
                                      <div className="space-y-4 mt-6 pt-6 border-t border-white/5 text-center">
                                         <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest py-6">Event Discussion Room is disabled by host</p>
                                      </div>
                                   )}
                                </div>
                             ) : (
                                <div className="py-10 text-center">
                                   <p className="text-xs font-black text-gray-500 uppercase tracking-wider animate-pulse">Establishing Team Uplink...</p>
                                </div>
                             )
                          ) : (
                             // Not Registered
                             (() => {
                                const pendingInvite = teamInvites.find(inv => inv.event_teams?.events?.id === selectedEvent.id);
                                if (pendingInvite) {
                                   return (
                                      <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl space-y-4">
                                         <div>
                                            <h4 className="text-xs font-black text-yellow-500 uppercase tracking-widest">Pending Invitation Found</h4>
                                            <p className="text-[10px] font-black text-white uppercase mt-1">
                                               You have been invited to join Team <span className="text-yellow-400 font-bold">{pendingInvite.event_teams?.team_name}</span> by {pendingInvite.event_teams?.profiles?.full_name}.
                                            </p>
                                         </div>
                                         <div className="flex gap-2">
                                            <button 
                                               onClick={() => handleAcceptInvite(pendingInvite)}
                                               className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                                            >
                                               Accept Invite
                                            </button>
                                            <button 
                                               onClick={() => handleDeclineInvite(pendingInvite)}
                                               className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                                            >
                                               Decline
                                            </button>
                                         </div>
                                      </div>
                                   );
                                } else {
                                   return (
                                      <div className="space-y-4">
                                         {!isCreatingTeam ? (
                                            <motion.button
                                               whileTap={{ scale: 0.98 }}
                                               onClick={() => setIsCreatingTeam(true)}
                                               className="w-full py-5 md:py-7 rounded-2xl md:rounded-[32px] font-black text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all flex items-center justify-center gap-3 bg-blue-600 text-white shadow-[0_15px_40px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-95"
                                            >
                                               Register Team
                                            </motion.button>
                                         ) : (
                                            <form onSubmit={handleCreateTeam} className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                                               <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Create Event Team</h4>
                                                  <button type="button" onClick={() => setIsCreatingTeam(false)} className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest">Cancel</button>
                                               </div>
                                               
                                               <div className="space-y-2">
                                                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Team Name</label>
                                                  <input 
                                                     type="text"
                                                     required
                                                     value={teamName}
                                                     onChange={e => setTeamName(e.target.value)}
                                                     placeholder="ENTER A DISTINCT TEAM NAME..."
                                                     className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-blue-500/30"
                                                  />
                                               </div>

                                               <div className="space-y-2">
                                                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Invite Classmates (Invite up to {selectedEvent.max_team_size - 1} members)</label>
                                                  <div className="relative">
                                                     <input 
                                                        type="text" 
                                                        value={searchQuery}
                                                        onChange={e => setSearchQuery(e.target.value)}
                                                        placeholder="Search classmates by name..."
                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none"
                                                     />
                                                     <Search size={14} className="absolute right-4 top-3.5 text-gray-500" />
                                                  </div>
                                                  
                                                  {/* Selected teammates list */}
                                                  {selectedTeammates.length > 0 && (
                                                     <div className="space-y-2 pt-2">
                                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Invited List</p>
                                                        <div className="flex flex-wrap gap-2">
                                                           {selectedTeammates.map(student => (
                                                              <span key={student.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase">
                                                                 {student.full_name}
                                                                 <button 
                                                                    type="button" 
                                                                    onClick={() => setSelectedTeammates(prev => prev.filter(s => s.id !== student.id))}
                                                                    className="text-red-500 hover:text-red-400 font-bold ml-1"
                                                                 >
                                                                    ×
                                                                 </button>
                                                              </span>
                                                           ))}
                                                        </div>
                                                     </div>
                                                  )}

                                                  {/* Search results */}
                                                  {searchResults.length > 0 && (
                                                     <div className="bg-black/50 border border-white/10 rounded-2xl p-3 max-h-40 overflow-y-auto no-scrollbar space-y-2">
                                                        {searchResults
                                                           .filter(res => !selectedTeammates.some(s => s.id === res.id))
                                                           .map(res => (
                                                              <div key={res.id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-xl">
                                                                 <div>
                                                                    <p className="text-[10px] font-black text-white uppercase">{res.full_name}</p>
                                                                    <p className="text-[7px] font-black text-gray-500 uppercase">{res.department || 'Student'}</p>
                                                                 </div>
                                                                 <button 
                                                                    type="button"
                                                                    onClick={() => {
                                                                       if (selectedTeammates.length >= selectedEvent.max_team_size - 1) {
                                                                          toast.error(`You can only invite up to ${selectedEvent.max_team_size - 1} classmates for this format`);
                                                                          return;
                                                                       }
                                                                       setSelectedTeammates(prev => [...prev, res]);
                                                                       setSearchQuery('');
                                                                       setSearchResults([]);
                                                                    }}
                                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[8px] font-black uppercase tracking-wider"
                                                                 >
                                                                    Add
                                                                 </button>
                                                              </div>
                                                        ))}
                                                     </div>
                                                  )}
                                               </div>

                                               <button
                                                  type="submit"
                                                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] uppercase tracking-[0.2em] shadow-lg transition-all"
                                               >
                                                  Launch Team
                                               </button>
                                            </form>
                                         )}
                                      </div>
                                   );
                                }
                             })()
                          )}
                       </div>
                    ) : (
                       // Solo Event Format
                       registeredEvents.includes(selectedEvent.id) ? (
                          selectedEvent.enable_chat ? (
                             <div className="space-y-4 mt-6 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                   <h4 className="text-[10px] font-black uppercase tracking-widest text-green-500">Event Discussion Room</h4>
                                </div>
                                
                                <div className="h-48 overflow-y-auto no-scrollbar bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
                                   {roomMessages.length === 0 ? (
                                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center my-auto">No messages in this event room yet. Be the first to start the discussion!</p>
                                   ) : (
                                      roomMessages.map((m) => {
                                         const isSelf = m.sender_id === profile?.id
                                         const isFaculty = m.profiles?.role === 'faculty' || m.profiles?.role === 'admin'
                                         return (
                                            <div key={m.id} className={`flex flex-col max-w-[85%] ${isSelf ? 'self-end items-end' : 'self-start items-start'}`}>
                                               {!isSelf && (
                                                  <div className="flex items-center gap-1.5 mb-1 ml-1">
                                                     <span className="text-[8px] font-black text-gray-500 uppercase">{m.profiles?.full_name || 'Anonymous'}</span>
                                                     {isFaculty && (
                                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[6px] font-black uppercase">Faculty</span>
                                                     )}
                                                  </div>
                                               )}
                                               <div className={`px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                                                  isSelf 
                                                     ? 'bg-blue-600 text-white rounded-tr-none' 
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

                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                   <input
                                      type="text"
                                      value={newMessage}
                                      onChange={(e) => setNewMessage(e.target.value)}
                                      placeholder="Type a message to event members..."
                                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500/50 transition-colors"
                                   />
                                   <button
                                      type="submit"
                                      className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                   >
                                      Send
                                   </button>
                                </form>
                             </div>
                          ) : (
                             <div className="space-y-4 mt-6 pt-6 border-t border-white/5 text-center">
                                <div className="flex items-center gap-2 mb-2 justify-center">
                                   <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                   <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Event Discussion Room</h4>
                                </div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest py-6">Event Discussion Room is disabled by host</p>
                             </div>
                          )
                       ) : (
                          <motion.button
                             whileTap={{ scale: 0.98 }}
                             onClick={() => handleRegister(selectedEvent)}
                             className="w-full py-5 md:py-7 rounded-2xl md:rounded-[32px] font-black text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all flex items-center justify-center gap-3 bg-blue-600 text-white shadow-[0_15px_40px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-95"
                          >
                             Initiate Linking
                          </motion.button>
                       )
                    )}
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

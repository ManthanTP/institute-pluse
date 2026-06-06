import { useState, useEffect, useRef } from 'react'
import { Users, Search, Mail, Phone, GraduationCap, ShieldCheck, MessageSquare, History, X, Send, Award, Trash2, Plus, Lock, Building, User, Megaphone, Calendar, MapPin, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/index'

export default function FacultyParticipantsPage() {
  const { profile } = useAuthStore()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [semesters, setSemesters] = useState([])

  // Modal states
  const [activeStudent, setActiveStudent] = useState(null)
  const [messageStudent, setMessageStudent] = useState(null)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [allDivisions, setAllDivisions] = useState([])

  // Message form states
  const [messageTitle, setMessageTitle] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [sending, setSending] = useState(false)

  // Add student form state
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    usn: '',
    department: 'CSE',
    semester_id: '',
    division_id: '',
    password: 'ChangeMe123!'
  })

  // Event Rooms State
  const [events, setEvents] = useState([])
  const [activeEventRoom, setActiveEventRoom] = useState(null)
  const [roomMessages, setRoomMessages] = useState([])
  const [roomParticipants, setRoomParticipants] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingRoom, setLoadingRoom] = useState(false)
  const [isBroadcast, setIsBroadcast] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-scroll messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [roomMessages])

  // Real-time Event Room messaging subscription
  useEffect(() => {
    if (!activeEventRoom) return

    fetchRoomData(activeEventRoom.id)

    const channel = supabase
      .channel(`event_room_${activeEventRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_messages',
          filter: `event_id=eq.${activeEventRoom.id}`
        },
        async (payload) => {
          // Fetch sender's profile for details
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
  }, [activeEventRoom])

  async function fetchFacultyEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, profiles(full_name), event_participants(id)')
        .order('event_date', { ascending: true })
      
      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Error fetching faculty events:', err)
    }
  }

  async function fetchRoomData(eventId) {
    try {
      setLoadingRoom(true)
      const { data: parts, error: partsErr } = await supabase
        .from('event_participants')
        .select('*, profiles(full_name, email, department, role)')
        .eq('event_id', eventId)

      if (partsErr) throw partsErr
      setRoomParticipants(parts || [])

      const { data: msgs, error: msgsErr } = await supabase
        .from('event_messages')
        .select('*, profiles(full_name, role)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })

      if (msgsErr) throw msgsErr
      setRoomMessages(msgs || [])
    } catch (err) {
      console.error('Error fetching room data:', err)
      toast.error('Failed to load message log')
    } finally {
      setLoadingRoom(false)
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !activeEventRoom || !profile?.id) return

    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      const { error } = await supabase
        .from('event_messages')
        .insert({
          event_id: activeEventRoom.id,
          sender_id: profile.id,
          message: messageText
        })

      if (error) throw error

      if (isBroadcast && roomParticipants.length > 0) {
        const notifications = roomParticipants.map(p => ({
          student_id: p.student_id,
          sender_id: profile.id,
          title: `Broadcast: ${activeEventRoom.title}`,
          message: messageText,
          type: 'general',
          is_read: false
        }))
        
        const { error: notifyErr } = await supabase
          .from('student_notifications')
          .insert(notifications)

        if (notifyErr) {
          console.error('Broadcast failure:', notifyErr)
          toast.error('Message posted, but announcement broadcast failed')
        } else {
          toast.success('Announcement broadcasted successfully!')
        }
      }
    } catch (err) {
      console.error('Send message error:', err)
      toast.error('Failed to send message: ' + err.message)
    }
  }

  async function fetchData() {
    try {
      setLoading(true)
      // 1. Fetch Students (Profiles with role 'student')
      const { data: stu, error } = await supabase
        .from('profiles')
        .select(`
          *,
          academic_divisions(name),
          academic_semesters(name)
        `)
        .eq('role', 'student')
        .order('full_name')
      
      if (error) throw error
      setStudents(stu || [])

      // 2. Fetch Semesters for Filter
      const { data: sems } = await supabase
        .from('academic_semesters')
        .select('*')
        .order('name')
      
      if (sems) setSemesters(sems)

      // 3. Fetch Divisions
      const { data: divs } = await supabase
        .from('academic_divisions')
        .select('*')
        .order('name')
      
      if (divs) setAllDivisions(divs)

      // 4. Fetch Events for Rooms
      await fetchFacultyEvents()

    } catch (err) {
      console.error('Data Fetch Error:', err)
      toast.error('Failed to load student registry')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSem = selectedSemester === 'all' || s.semester_id === selectedSemester
    return matchesSearch && matchesSem
  })

  const filteredFormDivisions = allDivisions.filter(d => 
    d.department === addForm.department && 
    d.semester_id === addForm.semester_id
  )

  // Send single notification
  async function handleSendDirectMessage(e) {
    e.preventDefault()
    if (!messageTitle.trim() || !messageBody.trim()) {
      toast.error('Title and message body are required')
      return
    }

    try {
      setSending(true)
      const { error } = await supabase
        .from('student_notifications')
        .insert({
          student_id: messageStudent.id,
          sender_id: profile.id,
          title: messageTitle.trim(),
          message: messageBody.trim(),
          type: 'general',
          is_read: false
        })

      if (error) throw error

      toast.success(`Notification sent to ${messageStudent.full_name}`)
      setMessageStudent(null)
      setMessageTitle('')
      setMessageBody('')
    } catch (err) {
      toast.error('Failed to send notification: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  // Add a new student via the security definer function
  async function handleAddStudent(e) {
    e.preventDefault()
    if (!addForm.full_name.trim() || !addForm.email.trim() || !addForm.usn.trim() || !addForm.password) {
      toast.error('All fields marked with * are required')
      return
    }

    try {
      setSending(true)
      const { data, error } = await supabase.rpc('create_student_by_faculty', {
        p_email: addForm.email.trim(),
        p_password: addForm.password,
        p_full_name: addForm.full_name.trim(),
        p_phone: addForm.phone.trim() || null,
        p_department: addForm.department,
        p_usn: addForm.usn.trim(),
        p_semester_id: addForm.semester_id || null,
        p_division_id: addForm.division_id || null
      })

      if (error) throw error

      toast.success(`Student ${addForm.full_name} registered successfully!`)
      setShowAddStudentModal(false)
      setAddForm({
        full_name: '',
        email: '',
        phone: '',
        usn: '',
        department: 'CSE',
        semester_id: '',
        division_id: '',
        password: 'ChangeMe123!'
      })
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to add student')
    } finally {
      setSending(false)
    }
  }

  return (
    <FacultyLayout>
      <div className="space-y-8 lg:space-y-12 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2 lg:mb-3">
              <Users size={12} className="text-blue-500" />
              <span className="text-[8px] lg:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Faculty Management Hub</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">
              Student <span className="text-blue-500">Registry</span>
            </h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
              Synchronizing {students.length} student profiles
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowAddStudentModal(true)} 
               className="px-6 lg:px-8 py-3.5 lg:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
             >
                <Plus size={12} /> Add Student
             </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center">
            <div className="relative w-full lg:flex-1 group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
               <input 
                 type="text" 
                 placeholder="SEARCH NAME OR EMAIL..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-[#161b22] border border-white/10 rounded-xl lg:rounded-2xl py-4 lg:py-5 pl-14 lg:pl-16 pr-6 text-[9px] lg:text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
               />
            </div>
            <div className="w-full lg:w-auto flex gap-1 p-1.5 bg-[#161b22] border border-white/10 rounded-xl lg:rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
               <button
                 onClick={() => setSelectedSemester('all')}
                 className={`px-5 lg:px-8 py-3 rounded-xl text-[7px] lg:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedSemester === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}
               >
                 All Semesters
               </button>
               {semesters.map((sem) => (
                 <button
                   key={sem.id}
                   onClick={() => setSelectedSemester(sem.id)}
                   className={`px-5 lg:px-8 py-3 rounded-xl text-[7px] lg:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedSemester === sem.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}
                 >
                   {sem.name}
                 </button>
               ))}
            </div>
        </div>

        {/* STUDENT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
           <AnimatePresence mode="popLayout">
              {filteredStudents.map((student, idx) => (
                 <motion.div 
                   key={student.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="bg-[#161b22]/80 border border-white/5 rounded-3xl lg:rounded-[40px] p-6 lg:p-8 backdrop-blur-3xl relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-2xl flex flex-col justify-between"
                 >
                    <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <GraduationCap size={80} />
                    </div>
                    
                    <div className="relative z-10 flex-1 flex flex-col justify-between">
                       <div>
                         <div className="flex items-start justify-between mb-6 lg:mb-8">
                            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl lg:text-2xl shadow-xl group-hover:scale-110 transition-transform border border-white/10">
                               {student.full_name ? student.full_name[0] : 'S'}
                            </div>
                         </div>

                         <div className="mb-6 lg:mb-8">
                            <h4 className="text-base lg:text-lg font-black text-white uppercase tracking-tight mb-1 truncate">{student.full_name}</h4>
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                               <span className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                 {student.academic_semesters?.name || 'Unassigned Sem'} • DIV {student.academic_divisions?.name || 'N/A'}
                               </span>
                            </div>
                         </div>
                       </div>

                       <div className="space-y-3 pt-6 border-t border-white/5">
                          <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-300 transition-colors">
                             <Mail size={12} lg:size={14} />
                             <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-wider truncate">{student.email || 'NO EMAIL SYNC'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-300 transition-colors">
                             <Phone size={12} lg:size={14} />
                             <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-wider">
                               {student.phone || 'NO PHONE REGISTERED'}
                             </span>
                          </div>
                       </div>

                       <div className="mt-6 lg:mt-8 flex gap-3">
                          <button 
                            onClick={() => setMessageStudent(student)}
                            className="flex-1 py-3.5 lg:py-4 bg-white/5 border border-white/5 rounded-xl lg:rounded-2xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-500/50 transition-all flex items-center justify-center gap-2 shadow-inner"
                          >
                             <MessageSquare size={12} /> Message
                          </button>
                          <button 
                            onClick={() => setActiveStudent(student)}
                            className="flex-1 py-3.5 lg:py-4 bg-white/5 border border-white/5 rounded-xl lg:rounded-2xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 shadow-inner"
                          >
                             <History size={12} /> Profile
                          </button>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* EMPTY STATE */}
        {filteredStudents.length === 0 && !loading && (
           <div className="py-32 lg:py-40 flex flex-col items-center gap-6 text-gray-700">
              <Users size={48} lg:size={60} className="opacity-10" />
              <p className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.4em] italic text-center px-6">
                No student profiles found for this selection
              </p>
           </div>
        )}

        {/* EVENT ROOMS SECTION */}
        <div className="border-t border-white/5 pt-12 mt-12 space-y-8 lg:space-y-12">
          <div>
            <div className="flex items-center gap-2 mb-2 lg:mb-3">
              <MessageSquare size={12} className="text-blue-500" />
              <span className="text-[8px] lg:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Interactive Channels</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">
              Event <span className="text-blue-500">Rooms</span>
            </h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
              Collaborate and message participants of your active campaigns
            </p>
          </div>

          {events.length === 0 ? (
            <div className="py-16 text-center bg-[#161b22]/50 border border-white/5 rounded-3xl p-8">
              <Megaphone size={40} className="text-gray-600 mx-auto mb-4 opacity-20" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic text-center">
                No campaigns registered yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {events.map((event, idx) => {
                const isCreator = event.created_by === profile?.id;
                const participantCount = event.event_participants?.length || 0;
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`bg-[#161b22]/80 border ${
                      isCreator ? 'border-blue-500/20' : 'border-white/5'
                    } rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/40 transition-all shadow-2xl flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-500 uppercase tracking-widest">
                          {event.category}
                        </span>
                        {isCreator && (
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[7px] font-black text-indigo-400 uppercase tracking-widest">
                            Creator
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-base font-black text-white uppercase tracking-tight mb-2 truncate">
                        {event.title}
                      </h3>
                      
                      <p className="text-xs font-medium text-gray-500 line-clamp-2 mb-6">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Users size={12} />
                          {participantCount} Registered
                        </span>
                        <span className="text-blue-500 flex items-center gap-1">
                          <Award size={12} />
                          {event.eco_points} XP
                        </span>
                      </div>

                      <button
                        onClick={() => setActiveEventRoom(event)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/10 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={12} /> Enter Chat Room
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* STUDENT DETAILED PROFILE MODAL */}
      <AnimatePresence>
        {activeStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0c1225] border border-white/10 rounded-3xl p-6 lg:p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setActiveStudent(null)} 
                className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                  {activeStudent.full_name ? activeStudent.full_name[0] : 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">{activeStudent.full_name}</h3>
                  <p className="text-xs text-blue-500 font-black tracking-widest uppercase mt-0.5">
                    {activeStudent.academic_semesters?.name || 'Unassigned Sem'} • DIV {activeStudent.academic_divisions?.name || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/[0.03]">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">USN</p>
                    <p className="text-xs font-black text-white uppercase tracking-tight">{activeStudent.usn || 'N/A'}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/[0.03]">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Department</p>
                    <p className="text-xs font-black text-white uppercase tracking-tight">{activeStudent.department || 'N/A'}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/[0.03] col-span-2">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-xs font-black text-white tracking-tight">{activeStudent.email || 'N/A'}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/[0.03] col-span-2">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-xs font-black text-white tracking-tight">{activeStudent.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-1">Eco Points</p>
                      <p className="text-xl font-black text-white">{activeStudent.eco_points || 0}</p>
                    </div>
                    <Award size={24} className="text-green-500" />
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                    <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-1">CO2 Footprint</p>
                    <p className="text-xl font-black text-white">{Number(activeStudent.total_co2_kg || 0).toFixed(1)} kg</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIRECT MESSAGE MODAL */}
      <AnimatePresence>
        {messageStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0c1225] border border-white/10 rounded-3xl p-6 relative"
            >
              <button 
                onClick={() => setMessageStudent(null)} 
                className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
              
              <h3 className="text-md font-black text-white uppercase tracking-tight mb-2">Message Student</h3>
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-6">
                Target: {messageStudent.full_name}
              </p>

              <form onSubmit={handleSendDirectMessage} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Notification Title *</label>
                  <input
                    type="text"
                    required
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                    placeholder="e.g. Attendance Warning / Project Submission"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-xs font-black uppercase text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Message Details *</label>
                  <textarea
                    required
                    rows={4}
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Type details of your notification here..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {sending ? 'Sending...' : 'Send Notification'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD STUDENT MODAL */}
      <AnimatePresence>
        {showAddStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0c1225] border border-white/10 rounded-3xl p-6 lg:p-8 relative overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              <button 
                onClick={() => setShowAddStudentModal(false)} 
                className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
              
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Register Student Profile</h3>
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-6">
                Create new authenticated identity
              </p>

              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Full Name *</label>
                    <div className="relative group">
                      <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text" required
                        value={addForm.full_name}
                        onChange={(e) => setAddForm({...addForm, full_name: e.target.value})}
                        placeholder="Alex Johnson"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">USN *</label>
                    <div className="relative group">
                      <ShieldCheck size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text" required
                        value={addForm.usn}
                        onChange={(e) => setAddForm({...addForm, usn: e.target.value})}
                        placeholder="1MS22CS001"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Email Address *</label>
                    <div className="relative group">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="email" required
                        value={addForm.email}
                        onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                        placeholder="alex@uni.edu"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Phone Number</label>
                    <div className="relative group">
                      <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="tel"
                        value={addForm.phone}
                        onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Department *</label>
                    <div className="relative group">
                      <Building size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <select
                        value={addForm.department}
                        onChange={(e) => setAddForm({...addForm, department: e.target.value, semester_id: '', division_id: ''})}
                        className="w-full bg-[#161b22] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                      >
                        {['CSE', 'ECE', 'ME', 'Civil', 'MBA', 'Other'].map(d => (
                          <option key={d} value={d} className="bg-slate-900">{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Semester *</label>
                    <select
                      required
                      value={addForm.semester_id}
                      onChange={(e) => setAddForm({...addForm, semester_id: e.target.value, division_id: ''})}
                      className="w-full bg-[#161b22] border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900">Select Sem</option>
                      {semesters.map(s => (
                        <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Division *</label>
                    <select
                      required
                      value={addForm.division_id}
                      onChange={(e) => setAddForm({...addForm, division_id: e.target.value})}
                      className="w-full bg-[#161b22] border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900">Select Div</option>
                      {filteredFormDivisions.map(d => (
                        <option key={d.id} value={d.id} className="bg-slate-900">Division {d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Temporary Password *</label>
                    <div className="relative group">
                      <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text" required
                        value={addForm.password}
                        onChange={(e) => setAddForm({...addForm, password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {sending ? 'Saving...' : 'Add Student'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EVENT CHAT ROOM MODAL */}
      <AnimatePresence>
        {activeEventRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-5xl h-[85vh] bg-[#0c1225] border border-white/10 rounded-[40px] relative overflow-hidden flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              {/* CLOSE BUTTON */}
              <button 
                onClick={() => setActiveEventRoom(null)} 
                className="absolute top-6 right-6 z-30 p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-inner"
              >
                <X size={18} />
              </button>

              {/* LEFT SIDEBAR: PARTICIPANTS */}
              <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-black/20 shrink-0 h-2/5 md:h-full">
                <div className="p-6 border-b border-white/10 bg-[#161b22]/40">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={14} className="text-blue-500" />
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Enrolled Roster</span>
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    Participants ({roomParticipants.length})
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                  {roomParticipants.length === 0 ? (
                    <div className="py-8 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest italic opacity-40">
                      Roster Empty
                    </div>
                  ) : (
                    roomParticipants.map((part) => (
                      <div 
                        key={part.id} 
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/[0.02] hover:bg-white/10 transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-500 text-xs font-black flex items-center justify-center uppercase">
                          {part.profiles?.full_name ? part.profiles.full_name[0] : 'S'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">
                            {part.profiles?.full_name || 'SYNCED STUDENT'}
                          </p>
                          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest truncate">
                            {part.profiles?.department || 'CSE'} • {part.profiles?.role || 'student'}
                          </p>
                        </div>
                        {part.attended && (
                          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" title="Attended" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT MAIN PANEL: MESSAGE STREAM */}
              <div className="flex-1 flex flex-col h-3/5 md:h-full relative bg-slate-950/20">
                {/* ROOM HEADER */}
                <div className="p-6 border-b border-white/10 bg-[#161b22]/20 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[7px] font-black text-blue-400 uppercase tracking-widest">
                      {activeEventRoom.category}
                    </span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> {new Date(activeEventRoom.event_date).toLocaleDateString()}
                    </span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={10} /> {activeEventRoom.venue}
                    </span>
                  </div>
                  
                  <h2 className="text-lg font-black text-white uppercase tracking-tight truncate pr-12">
                    {activeEventRoom.title}
                  </h2>
                </div>

                {/* MESSAGES VIEWPORT */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  {loadingRoom ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Decrypting Feed...</p>
                    </div>
                  ) : roomMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600">
                      <MessageSquare size={36} className="opacity-10 mb-2" />
                      <p className="text-[9px] font-black uppercase tracking-widest italic text-center px-6">
                        Secure link established. Send a message/rules to start.
                      </p>
                    </div>
                  ) : (
                    roomMessages.map((msg) => {
                      const isMe = msg.sender_id === profile?.id;
                      const senderRole = msg.profiles?.role || 'student';
                      const isSenderFaculty = senderRole === 'faculty' || senderRole === 'admin' || senderRole === 'owner';
                      
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col max-w-[80%] ${
                            isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[8px] font-black uppercase tracking-widest ${
                              isMe ? 'text-blue-400' : isSenderFaculty ? 'text-purple-400' : 'text-gray-500'
                            }`}>
                              {msg.profiles?.full_name || 'Anonymous'} 
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[6px] font-black text-gray-500 uppercase tracking-widest">
                              {senderRole}
                            </span>
                            <span className="text-[7px] text-gray-600 font-bold uppercase">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className={`p-4 rounded-3xl text-xs font-medium leading-relaxed border ${
                            isMe 
                              ? 'bg-blue-600/10 border-blue-500/20 text-white rounded-tr-none' 
                              : isSenderFaculty
                                ? 'bg-purple-600/10 border-purple-500/20 text-white rounded-tl-none'
                                : 'bg-[#161b22] border-white/5 text-gray-300 rounded-tl-none'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* BOTTOM COMPOSER */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#161b22]/10 space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isBroadcast}
                        onChange={(e) => setIsBroadcast(e.target.checked)}
                        className="rounded border-white/10 bg-white/5 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                      />
                      <span className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-colors">
                        <Megaphone size={12} className={isBroadcast ? 'text-blue-500' : 'text-gray-500'} />
                        Broadcast as Announcement Notice to Participants
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-3 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="TRANSMIT MESSAGE / RULES TO ROOM..."
                      className="w-full bg-[#161b22] border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-xs font-black uppercase text-white outline-none focus:border-blue-500 transition-colors shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-20 transition-all shadow-lg shadow-blue-600/25"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FacultyLayout>
  )
}

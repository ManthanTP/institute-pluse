import { useState, useEffect, useRef } from 'react'
import { CalendarDays, Plus, Clock, BookOpen, Target, ChevronRight, CheckCircle2, Circle, GraduationCap, Flame, Sparkles, ChevronLeft, Home, LayoutGrid, Coffee, User, X, Trash2, Play, Pause, RotateCcw, Bell, BellOff, AlarmClock, Tag, Filter, Calendar, Edit2, Check } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SUBJECTS = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'CS', 'Economics', 'Revision', 'Project', 'Other']
const SUBJECT_COLORS = {
  Math: '#6366f1', Physics: '#3b82f6', Chemistry: '#22c55e', Biology: '#10b981',
  English: '#f59e0b', History: '#f97316', CS: '#8b5cf6', Economics: '#ec4899',
  Revision: '#14b8a6', Project: '#ef4444', Other: '#64748b'
}
const FILTER_TABS = ['All', 'Today', 'Upcoming', 'Completed']

function getTodayShort() {
  const d = new Date()
  return DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]
}

export default function StudyPlannerPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  
  // New Task Form State
  const [newTask, setNewTask] = useState({
    title: '', duration: '30', priority: 'medium',
    subject: 'Other', schedule_type: 'daily', schedule_days: [], alarm_time: ''
  })
  
  const [isAdding, setIsAdding] = useState(false)
  const [activeFocus, setActiveFocus] = useState(null)
  const [filterTab, setFilterTab] = useState('All')
  const alarmTimersRef = useRef({})

  // Exam Countdown states
  const [examName, setExamName] = useState(() => localStorage.getItem('pulse_exam_name') || 'Final Semester Exams')
  const [examDate, setExamDate] = useState(() => localStorage.getItem('pulse_exam_date') || new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString().slice(0, 16))
  const [isEditingExam, setIsEditingExam] = useState(false)
  const [timeLeftStr, setTimeLeftStr] = useState({ days: 0, hours: 0, mins: 0 })

  // Pomodoro Timer Card State (Integrated into Bento & localStorage)
  const [pomoDuration, setPomoDuration] = useState(() => {
    return parseInt(localStorage.getItem('pulse_pomo_duration')) || 25
  })
  
  const [pomoAlwaysOn, setPomoAlwaysOn] = useState(() => {
    return localStorage.getItem('pulse_pomo_always_on') === 'true'
  })

  const [pomoActive, setPomoActive] = useState(() => {
    return localStorage.getItem('pulse_pomo_active') === 'true'
  })

  const [pomoTimeLeft, setPomoTimeLeft] = useState(() => {
    const active = localStorage.getItem('pulse_pomo_active') === 'true'
    const duration = parseInt(localStorage.getItem('pulse_pomo_duration')) || 25
    if (active) {
      const endTime = parseInt(localStorage.getItem('pulse_pomo_end_time')) || 0
      const diff = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
      return diff
    } else {
      const pausedTime = localStorage.getItem('pulse_pomo_time_left')
      return pausedTime !== null ? parseInt(pausedTime) : duration * 60
    }
  })
  
  const pomoIntervalRef = useRef(null)

  useEffect(() => {
    fetchTasks()
  }, [profile?.id])

  // Check alarms on tasks change
  useEffect(() => {
    tasks.forEach(task => {
      if (task.alarm_time && task.status !== 'completed' && !alarmTimersRef.current[task.id]) {
        scheduleAlarm(task)
      } else if (task.status === 'completed' && alarmTimersRef.current[task.id]) {
        clearTimeout(alarmTimersRef.current[task.id])
        delete alarmTimersRef.current[task.id]
      }
    })
  }, [tasks])

  // Exam Countdown calculator
  useEffect(() => {
    function updateCountdown() {
      const difference = +new Date(examDate) - +new Date()
      if (difference <= 0) {
        setTimeLeftStr({ days: 0, hours: 0, mins: 0 })
        return
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const mins = Math.floor((difference / 1000 / 60) % 60)
      setTimeLeftStr({ days, hours, mins })
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
  }, [examDate])

  // Pomodoro Timer hook
  useEffect(() => {
    if (pomoActive) {
      const endTime = parseInt(localStorage.getItem('pulse_pomo_end_time')) || 0
      
      const updateTimer = () => {
        const diff = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
        setPomoTimeLeft(diff)
        
        if (diff === 0) {
          clearInterval(pomoIntervalRef.current)
          setPomoActive(false)
          localStorage.setItem('pulse_pomo_active', 'false')
          toast.success('🎉 Pomodoro Session Completed! Take a break.', { duration: 6000 })
          try {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🍅 Pomodoro Complete!', { body: 'Time to rest!' })
            }
          } catch (e) {}
        }
      }
      
      updateTimer()
      pomoIntervalRef.current = setInterval(updateTimer, 1000)
    } else {
      clearInterval(pomoIntervalRef.current)
    }

    return () => clearInterval(pomoIntervalRef.current)
  }, [pomoActive])

  // Screen Wake Lock API reference
  const pomoWakeLockRef = useRef(null)

  useEffect(() => {
    async function requestWakeLock() {
      if ('wakeLock' in navigator && pomoAlwaysOn && pomoActive) {
        try {
          pomoWakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch (err) {
          console.error('Wake Lock request failed:', err)
        }
      }
    }

    async function releaseWakeLock() {
      if (pomoWakeLockRef.current) {
        try {
          await pomoWakeLockRef.current.release()
          pomoWakeLockRef.current = null
        } catch (err) {
          console.error('Wake Lock release failed:', err)
        }
      }
    }

    if (pomoActive && pomoAlwaysOn) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    return () => {
      releaseWakeLock()
    }
  }, [pomoActive, pomoAlwaysOn])

  const handleToggleTimer = () => {
    const newActive = !pomoActive
    setPomoActive(newActive)
    localStorage.setItem('pulse_pomo_active', String(newActive))
    
    if (newActive) {
      const endTime = Date.now() + pomoTimeLeft * 1000
      localStorage.setItem('pulse_pomo_end_time', String(endTime))
      requestNotificationPermission()
    } else {
      localStorage.setItem('pulse_pomo_time_left', String(pomoTimeLeft))
    }
  }

  function handlePomoPreset(mins) {
    setPomoDuration(mins)
    setPomoTimeLeft(mins * 60)
    setPomoActive(false)
    localStorage.setItem('pulse_pomo_duration', String(mins))
    localStorage.setItem('pulse_pomo_time_left', String(mins * 60))
    localStorage.setItem('pulse_pomo_active', 'false')
  }

  const handleResetTimer = () => {
    setPomoTimeLeft(pomoDuration * 60)
    setPomoActive(false)
    localStorage.setItem('pulse_pomo_time_left', String(pomoDuration * 60))
    localStorage.setItem('pulse_pomo_active', 'false')
  }

  const handleToggleAlwaysOn = (val) => {
    setPomoAlwaysOn(val)
    localStorage.setItem('pulse_pomo_always_on', String(val))
    if (val) {
      requestNotificationPermission()
    }
  }

  function handleSaveExam() {
    localStorage.setItem('pulse_exam_name', examName)
    localStorage.setItem('pulse_exam_date', examDate)
    setIsEditingExam(false)
    toast.success('Exam schedule locked')
  }

  function scheduleAlarm(task) {
    if (!task.alarm_time) return
    const now = new Date()
    const [h, m] = task.alarm_time.split(':').map(Number)
    let alarmDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0)
    let diff = alarmDate - now
    
    if (diff < 0 && diff > -60000) {
      diff = 500
    } else if (diff < 0) {
      alarmDate.setDate(alarmDate.getDate() + 1)
      diff = alarmDate - now
    }
    
    if (diff > 0 && diff < 86400000 * 2) {
      const timer = setTimeout(() => {
        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`⏰ Study Reminder: ${task.title}`, {
              body: `Time to study! Duration: ${task.duration_mins} min`,
              icon: '/favicon.ico'
            })
          } else {
            toast.success(`⏰ Alarm: ${task.title}`, { duration: 8000 })
          }
        } catch(e) {
          toast.success(`⏰ Alarm: ${task.title}`, { duration: 8000 })
        }
        delete alarmTimersRef.current[task.id]
      }, diff)
      alarmTimersRef.current[task.id] = timer
    }
  }

  async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      try {
        await Notification.requestPermission()
      } catch(e) {}
    }
  }

  async function fetchTasks() {
    if (!profile?.id) return
    setLoading(true)
    const { data } = await supabase
      .from('study_tasks')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
    if (data && data.length > 0) {
      const parsedTasks = data.map(t => {
        try {
          const p = JSON.parse(t.title)
          if (p && typeof p === 'object' && p.text) {
            return { ...t, title: p.text, subject: p.subject, schedule_type: p.schedule_type, schedule_days: p.schedule_days, alarm_time: p.alarm_time }
          }
        } catch(e) {}
        return t
      })
      setTasks(parsedTasks)
    } else {
      setTasks([])
    }
    setLoading(false)
  }

  async function addTask() {
    if (!newTask.title || !profile?.id) return
    
    const packedTitle = JSON.stringify({
      text: newTask.title,
      subject: newTask.subject,
      schedule_type: newTask.schedule_type,
      schedule_days: newTask.schedule_type === 'specific' ? newTask.schedule_days : [],
      alarm_time: newTask.alarm_time || null,
    })

    const taskPayload = {
      student_id: profile.id,
      title: packedTitle,
      duration_mins: parseInt(newTask.duration),
      priority: newTask.priority,
      status: 'pending'
    }
    
    const { data, error } = await supabase.from('study_tasks').insert(taskPayload).select().single()
    
    if (error) {
      toast.error('Sync Error')
    } else {
      finishAdd({
        ...data,
        title: newTask.title,
        subject: newTask.subject,
        schedule_type: newTask.schedule_type,
        schedule_days: newTask.schedule_type === 'specific' ? newTask.schedule_days : [],
        alarm_time: newTask.alarm_time || null
      })
    }
    if (newTask.alarm_time) requestNotificationPermission()
  }

  function finishAdd(task) {
    setTasks([task, ...tasks])
    setNewTask({ title: '', duration: '30', priority: 'medium', subject: 'Other', schedule_type: 'daily', schedule_days: [], alarm_time: '' })
    setIsAdding(false)
    toast.success('Objective Synced')
  }

  async function toggleTask(task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const { error } = await supabase.from('study_tasks').update({ status: newStatus }).eq('id', task.id)
    if (!error) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
      if (newStatus === 'completed') toast.success('🎉 Objective Completed!')
    }
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('study_tasks').delete().eq('id', id)
    if (!error) {
      setTasks(tasks.filter(t => t.id !== id))
      toast.success('Objective Removed')
    }
  }

  // Filter logic
  const today = getTodayShort()
  const filteredTasks = tasks.filter(task => {
    if (filterTab === 'All') return true
    if (filterTab === 'Completed') return task.status === 'completed'
    if (filterTab === 'Today') {
      if (task.status === 'completed') return false
      if (task.schedule_type === 'daily') return true
      if (task.schedule_type === 'specific') return (task.schedule_days || []).includes(today)
      return true
    }
    if (filterTab === 'Upcoming') {
      if (task.status === 'completed') return false
      if (task.schedule_type === 'daily') return true
      if (task.schedule_type === 'specific') {
        if (!task.schedule_days || task.schedule_days.length === 0) return false
        return !task.schedule_days.includes(today)
      }
      return false
    }
    return true
  })

  // Subject Stats Calculation
  const subjectStats = SUBJECTS.map(subj => {
    const subjTasks = tasks.filter(t => t.subject === subj)
    if (subjTasks.length === 0) return null
    const done = subjTasks.filter(t => t.status === 'completed').length
    const pct = Math.round((done / subjTasks.length) * 100)
    return { name: subj, total: subjTasks.length, completed: done, pct }
  }).filter(Boolean)

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Planner Core...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white pb-32 relative overflow-x-hidden">
      {/* Aurora Radial Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-indigo-600/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-purple-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-8 max-w-5xl mx-auto">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="hidden lg:flex w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shrink-0"
            >
              <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </motion.button>
            <div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-0.5">Academic Hub</p>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Study Planner</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
              <Target size={20} />
            </div>
          </div>
        </div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* POMODORO TIMER CARD (2x1 Column Span on Medium/Large Screens) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col justify-between relative overflow-hidden group shadow-lg min-h-[300px]"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Clock size={120} />
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-0.5">Study Timer</span>
                <h3 className="text-lg font-black uppercase tracking-tight italic">SESSION TIMER</h3>
              </div>
              <div className="flex gap-1">
                {[15, 25, 50].map(m => (
                  <button
                    key={m}
                    onClick={() => handlePomoPreset(m)}
                    className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                      pomoDuration === m ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
              {/* Circular Conic Progress */}
              <div className="relative w-40 h-40 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" className="stroke-white/5 fill-none" strokeWidth="6" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="fill-none stroke-indigo-500 transition-all duration-1000"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 70}
                    strokeDashoffset={2 * Math.PI * 70 * (1 - pomoTimeLeft / (pomoDuration * 60))}
                    style={{ strokeLinecap: 'round' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <h2 className="text-3xl font-black tracking-tighter italic">
                    {Math.floor(pomoTimeLeft / 60)}:{(pomoTimeLeft % 60) < 10 ? `0${pomoTimeLeft % 60}` : pomoTimeLeft % 60}
                  </h2>
                  <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest mt-1">
                    {pomoActive ? 'Focus active' : 'Paused'}
                  </span>
                </div>
              </div>

              {/* Controls & Motivation */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                  "Deep work is the superpower of the 21st century. Lock in your session."
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleTimer}
                    className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${
                      pomoActive ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    }`}
                  >
                    {pomoActive ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                    {pomoActive ? 'Pause Timer' : 'Start Timer'}
                  </motion.button>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleResetTimer}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <RotateCcw size={14} />
                  </motion.button>

                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                    <input
                      type="checkbox"
                      id="pomoAlwaysOn"
                      checked={pomoAlwaysOn}
                      onChange={(e) => handleToggleAlwaysOn(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-white/10"
                    />
                    <label htmlFor="pomoAlwaysOn" className="text-[8px] font-black uppercase tracking-widest text-gray-400 cursor-pointer select-none">
                      Always On
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* EXAM COUNTDOWN CARD (1x1 Column Span) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group min-h-[300px]"
          >
            <div className="absolute -right-6 -bottom-6 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <Calendar size={120} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-0.5 animate-pulse">System Deadline</span>
                <h3 className="text-md font-black uppercase tracking-tight italic truncate max-w-[150px]">
                  {examName}
                </h3>
              </div>
              <button
                onClick={() => setIsEditingExam(!isEditingExam)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              >
                {isEditingExam ? <X size={14} /> : <Edit2 size={14} />}
              </button>
            </div>

            {isEditingExam ? (
              <div className="my-auto space-y-3 relative z-10">
                <input
                  type="text"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  placeholder="Exam Name"
                  className="w-full bg-[#161b22] border border-white/10 rounded-xl px-3 py-2 text-[10px] uppercase font-black tracking-widest text-white outline-none"
                />
                <input
                  type="datetime-local"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="w-full bg-[#161b22] border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-white outline-none"
                  style={{ colorScheme: 'dark' }}
                />
                <button
                  onClick={handleSaveExam}
                  className="w-full py-2 bg-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1"
                >
                  <Check size={12} /> Sync Lock
                </button>
              </div>
            ) : (
              <div className="my-auto text-center">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-2.5">
                    <span className="text-2xl font-black italic tracking-tighter text-rose-500 block">
                      {String(timeLeftStr.days).padStart(2, '0')}
                    </span>
                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Days</span>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-2.5">
                    <span className="text-2xl font-black italic tracking-tighter text-rose-500 block">
                      {String(timeLeftStr.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Hours</span>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-2.5">
                    <span className="text-2xl font-black italic tracking-tighter text-rose-500 block">
                      {String(timeLeftStr.mins).padStart(2, '0')}
                    </span>
                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Mins</span>
                  </div>
                </div>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-2">
                  TARGET DATELINE METRIC SYSTEM
                </p>
              </div>
            )}

            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse" style={{ width: '100%' }} />
            </div>
          </motion.div>

          {/* DAILY GOALS (1x2 Column Span - Stretches down) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:row-span-2 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col justify-between shadow-lg relative min-h-[400px]"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">Objective Flow</span>
                 <h3 className="text-lg font-black uppercase tracking-tight italic">DAILY OBJECTIVES</h3>
              </div>
              <button
                onClick={() => setIsAdding(true)}
                className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Micro Quick Checklist for Today */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 my-2 pr-1 max-h-[350px]">
              {tasks.filter(t => t.schedule_type === 'daily' || (t.schedule_days || []).includes(today)).length === 0 ? (
                <div className="py-12 text-center opacity-40">
                  <span className="text-2xl block mb-2">⚡</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Clear Dateline</span>
                </div>
              ) : (
                tasks
                  .filter(t => t.schedule_type === 'daily' || (t.schedule_days || []).includes(today))
                  .map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl transition-all ${
                        task.status === 'completed' ? 'opacity-40' : ''
                      }`}
                    >
                      <button
                        onClick={() => toggleTask(task)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          task.status === 'completed' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-white/20 text-transparent'
                        }`}
                      >
                        <Check size={12} strokeWidth={4} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-black uppercase tracking-tight truncate ${
                          task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'
                        }`}>
                          {task.title}
                        </p>
                        <span className="text-[7px] text-gray-500 uppercase tracking-widest font-bold block mt-0.5">
                          {task.subject} · {task.duration_mins}m
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">
                <span>Synchronized Completion</span>
                <span className="text-indigo-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </motion.div>

          {/* SUBJECT TRACKING (2x1 Column Span) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col justify-between shadow-lg relative min-h-[220px]"
          >
            <div>
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block mb-0.5">Focus Balance</span>
              <h3 className="text-lg font-black uppercase tracking-tight italic mb-4">SUBJECT SEGMENTATION</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 md:max-h-[140px] md:overflow-y-auto md:no-scrollbar pr-1">
              {subjectStats.length === 0 ? (
                <div className="col-span-full py-8 text-center opacity-40">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">No subject progress tracked</span>
                </div>
              ) : (
                subjectStats.map(stat => (
                  <div key={stat.name} className="space-y-1.5 p-3 bg-white/[0.01] border border-white/5 rounded-2xl">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[stat.name] }} />
                        {stat.name}
                      </span>
                      <span className="text-gray-400">({stat.completed}/{stat.total}) {stat.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${stat.pct}%`, backgroundColor: SUBJECT_COLORS[stat.name] }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

        </div>

        {/* COMPREHENSIVE OBJECTIVES SECTION */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                  filterTab === tab
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                ALL OBJECTIVES
              </h3>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} · {filterTab}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAdding(true)}
              className="w-14 h-14 rounded-[22px] bg-indigo-600 text-white shadow-[0_15px_30px_rgba(79,70,229,0.3)] flex items-center justify-center transition-all hover:bg-indigo-500"
            >
              <Plus size={24} strokeWidth={3} />
            </motion.button>
          </div>

          {/* OBJECTIVE LIST */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic text-center">Synchronizing Matrix...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-20 text-center bg-slate-900/40 border border-white/10 rounded-[40px] backdrop-blur-xl">
                <div className="text-4xl mb-4 opacity-40">📚</div>
                <p className="text-xs font-black text-white uppercase tracking-widest italic">No {filterTab} Tasks</p>
                <p className="text-[9px] font-medium text-gray-500 mt-2 normal-case">Tap + to add an objective</p>
              </div>
            ) : filteredTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-slate-900/40 border border-white/5 rounded-[32px] p-5 backdrop-blur-2xl flex items-center gap-4 group transition-all ${
                  task.status === 'completed' ? 'opacity-40 grayscale-[0.5]' : ''
                }`}
              >
                <button
                  onClick={() => toggleTask(task)}
                  className={`w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all border ${
                    task.status === 'completed'
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white/5 border-white/10 text-gray-700 hover:text-white'
                  }`}
                >
                  {task.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>

                <button
                  onClick={() => task.status !== 'completed' && setActiveFocus({ duration: task.duration_mins, title: task.title, taskId: task.id })}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {task.subject && (
                      <span
                        className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest"
                        style={{ backgroundColor: `${SUBJECT_COLORS[task.subject] || '#64748b'}20`, color: SUBJECT_COLORS[task.subject] || '#94a3b8' }}
                      >
                        {task.subject}
                      </span>
                    )}
                    <span className={`text-[8px] font-black uppercase tracking-widest ${
                      task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-indigo-400' : 'text-gray-600'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={8} /> {task.duration_mins}m
                    </span>
                    {task.alarm_time && (
                      <span className="text-[8px] font-black text-amber-500 flex items-center gap-0.5">
                        <AlarmClock size={8} /> {task.alarm_time}
                      </span>
                    )}
                  </div>
                  <h4 className={`text-sm font-black uppercase tracking-tight truncate ${task.status === 'completed' ? 'line-through text-gray-600' : 'text-white'}`}>
                    {task.title}
                  </h4>
                  {task.schedule_type === 'specific' && task.schedule_days?.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {DAYS.map(d => (
                        <span
                          key={d}
                          className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            (task.schedule_days || []).includes(d) ? 'bg-indigo-600/20 text-indigo-400' : 'bg-white/5 text-gray-700'
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                  {task.schedule_type === 'daily' && (
                    <span className="text-[7px] font-black text-emerald-500/70 uppercase tracking-widest mt-1 flex items-center gap-1">
                      <Calendar size={7} /> Daily
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  {task.status !== 'completed' && (
                    <button
                      onClick={e => { e.stopPropagation(); setActiveFocus({ duration: task.duration_mins, title: task.title, taskId: task.id }) }}
                      className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <Play size={14} fill="currentColor" />
                    </button>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); deleteTask(task.id) }}
                    className="p-2.5 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {createPortal(
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-2xl pointer-events-auto"
                onClick={() => setIsAdding(false)}
              />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-[#0a0c10] border-t border-white/10 rounded-t-[50px] p-6 md:p-10 shadow-2xl pointer-events-auto flex flex-col"
                style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight mb-0.5">New Objective</h3>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Academic Matrix Sync</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400"><X size={20} /></button>
                </div>

                <div className="space-y-5 overflow-y-auto no-scrollbar max-h-[70vh] pr-1 pb-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Task Title</label>
                    <input
                      value={newTask.title}
                      onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter objective title..."
                      className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Tag size={10} /> Subject
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map(s => (
                        <button
                          key={s}
                          onClick={() => setNewTask({ ...newTask, subject: s })}
                          className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                            newTask.subject === s
                              ? 'text-white border-transparent shadow-lg'
                              : 'bg-white/5 border-white/5 text-gray-500'
                          }`}
                          style={newTask.subject === s ? { backgroundColor: SUBJECT_COLORS[s], boxShadow: `0 4px 15px ${SUBJECT_COLORS[s]}40` } : {}}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Duration</label>
                      <select
                        value={newTask.duration}
                        onChange={e => setNewTask({ ...newTask, duration: e.target.value })}
                        className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                      >
                        <option value="15" className="bg-slate-900">15 Mins</option>
                        <option value="25" className="bg-slate-900">25 Mins</option>
                        <option value="30" className="bg-slate-900">30 Mins</option>
                        <option value="45" className="bg-slate-900">45 Mins</option>
                        <option value="60" className="bg-slate-900">1 Hour</option>
                        <option value="90" className="bg-slate-900">1.5 Hours</option>
                        <option value="120" className="bg-slate-900">2 Hours</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                        className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                      >
                        <option value="low" className="bg-slate-900">Routine</option>
                        <option value="medium" className="bg-slate-900">Important</option>
                        <option value="high" className="bg-slate-900">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Calendar size={10} /> Schedule
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['daily', 'specific'].map(type => (
                        <button
                          key={type}
                          onClick={() => setNewTask({ ...newTask, schedule_type: type })}
                          className={`py-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                            newTask.schedule_type === type
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                              : 'bg-white/5 border-white/5 text-gray-500'
                          }`}
                        >
                          {type === 'daily' ? '🔁 Every Day' : '📅 Specific Days'}
                        </button>
                      ))}
                    </div>
                    <AnimatePresence>
                      {newTask.schedule_type === 'specific' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-2 pt-2">
                            {DAYS.map(d => (
                              <button
                                key={d}
                                onClick={() => {
                                  const days = newTask.schedule_days.includes(d)
                                    ? newTask.schedule_days.filter(x => x !== d)
                                    : [...newTask.schedule_days, d]
                                  setNewTask({ ...newTask, schedule_days: days })
                                }}
                                className={`flex-1 py-2.5 rounded-xl border text-[8px] font-black uppercase transition-all ${
                                  newTask.schedule_days.includes(d)
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-white/5 border-white/5 text-gray-500'
                                }`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <AlarmClock size={10} /> Alarm Time (optional)
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="time"
                        value={newTask.alarm_time}
                        onChange={e => setNewTask({ ...newTask, alarm_time: e.target.value })}
                        className="flex-1 bg-[#161b22] border border-white/5 rounded-3xl p-4 text-white text-[11px] font-black outline-none"
                        style={{ colorScheme: 'dark' }}
                      />
                      {newTask.alarm_time && (
                        <button
                          onClick={() => setNewTask({ ...newTask, alarm_time: '' })}
                          className="p-3 rounded-2xl bg-red-500/10 text-red-400"
                        >
                          <BellOff size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={addTask}
                    className="w-full py-6 rounded-[28px] bg-indigo-600 text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-[0_15px_40px_rgba(79,70,229,0.4)] transition-all active:scale-95"
                  >
                    Sync Objective to Matrix
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* FOCUS TIMER MODAL */}
      {createPortal(
        <AnimatePresence>
          {activeFocus && (
            <FocusTimer
              initialMins={activeFocus.duration}
              title={activeFocus.title}
              taskId={activeFocus.taskId}
              onClose={() => setActiveFocus(null)}
              onComplete={taskId => {
                if (taskId) {
                  setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t))
                  supabase.from('study_tasks').update({ status: 'completed' }).eq('id', taskId).then(() => {})
                }
                setActiveFocus(null)
              }}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

function FocusTimer({ initialMins, title, taskId, onClose, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(initialMins * 60)
  const [isActive, setIsActive] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [alwaysOn, setAlwaysOn] = useState(false)
  const wakeLockRef = useRef(null)

  useEffect(() => {
    async function requestWakeLock() {
      if ('wakeLock' in navigator && alwaysOn && isActive) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch (err) {
          console.error(err)
        }
      }
    }

    async function releaseWakeLock() {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release()
          wakeLockRef.current = null
        } catch (err) {
          console.error(err)
        }
      }
    }

    if (isActive && alwaysOn) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    return () => {
      releaseWakeLock()
    }
  }, [isActive, alwaysOn])

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval)
      setIsActive(false)
      setIsFinished(true)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const progress = ((initialMins * 60 - timeLeft) / (initialMins * 60)) * 100

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-[#020617] flex flex-col items-center justify-center p-8"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[70%] bg-green-600/10 blur-[120px] rounded-full" />
        </div>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative z-10 text-center w-full max-w-sm"
        >
          <div className="relative w-48 h-48 mx-auto mb-8">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-green-500/30"
            />
            <div className="w-full h-full rounded-full bg-green-600/20 border-2 border-green-500/40 flex items-center justify-center shadow-2xl shadow-green-500/20">
              <CheckCircle2 size={64} className="text-green-400" />
            </div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-3">Session Complete!</p>
            <h2 className="text-4xl font-black text-white tracking-tighter italic mb-2 uppercase">Well Done!</h2>
            <p className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2">{title}</p>
            <p className="text-[10px] font-bold text-gray-600 mb-8">{initialMins} min session finished</p>

            <div className="space-y-3">
              {taskId && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onComplete(taskId)}
                  className="w-full py-5 bg-green-600 text-white rounded-[28px] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-green-600/20 flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={16} /> Mark Task Completed
                </motion.button>
              )}
              <button
                onClick={() => onComplete(null)}
                className="w-full py-4 text-gray-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors"
              >
                Close Session
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-[#020617] flex flex-col items-center justify-center p-8"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <button onClick={onClose} className="absolute top-8 left-8 p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400">
        <X size={24} />
      </button>

      <div className="relative w-72 h-72 mb-12">
        <svg className="w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="48%" className="stroke-white/5 fill-none" strokeWidth="4" />
          <motion.circle
            cx="50%" cy="50%" r="48%"
            className={`fill-none ${isActive ? 'stroke-indigo-500' : 'stroke-indigo-800'}`}
            strokeWidth="4"
            strokeDasharray="100 100"
            animate={{ strokeDashoffset: 100 - progress }}
            transition={{ duration: 1 }}
            style={{ strokeLinecap: 'round' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-2">
            {isActive ? 'Timer Active' : 'Ready'}
          </p>
          <h2 className="text-6xl font-black text-white tracking-tighter italic">
            {mins}:{secs < 10 ? `0${secs}` : secs}
          </h2>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2">
            {initialMins} min session
          </p>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic">{title}</h3>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed max-w-[240px] mx-auto">
          Minimize all external neural inputs. Synchronize with your study objectives.
        </p>
      </div>

      {/* Always On Display toggle option */}
      <div className="mb-10 flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
        <input
          type="checkbox"
          id="alwaysOnDisplay"
          checked={alwaysOn}
          onChange={(e) => setAlwaysOn(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-white/10"
        />
        <label htmlFor="alwaysOnDisplay" className="text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer select-none">
          Always on Display
        </label>
      </div>

      <div className="flex items-center gap-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsActive(!isActive)}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isActive ? 'bg-white text-slate-950' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
          }`}
        >
          {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setTimeLeft(initialMins * 60); setIsActive(false) }}
          className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center"
        >
          <RotateCcw size={20} />
        </motion.button>
      </div>
    </motion.div>
  )
}

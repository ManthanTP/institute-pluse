import { useState, useEffect } from 'react'
import { CalendarDays, Plus, Clock, BookOpen, Target, ChevronRight, CheckCircle2, Circle, GraduationCap, Flame, Sparkles, ChevronLeft, Home, LayoutGrid, Coffee, User, X } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

export default function StudyPlannerPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState({ title: '', duration: '30', priority: 'medium' })
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [profile?.id])

  async function fetchTasks() {
    if (!profile?.id) return
    setLoading(true)
    const { data } = await supabase.from('study_tasks').select('*').eq('student_id', profile.id).order('created_at', { ascending: false })
    if (data) setTasks(data)
    setLoading(false)
  }

  async function addTask() {
    if (!newTask.title || !profile?.id) return
    const { data, error } = await supabase.from('study_tasks').insert({
      student_id: profile.id,
      title: newTask.title,
      duration_mins: parseInt(newTask.duration),
      priority: newTask.priority,
      status: 'pending'
    }).select().single()

    if (error) {
      toast.error('Sync Error')
    } else {
      setTasks([data, ...tasks])
      setNewTask({ title: '', duration: '30', priority: 'medium' })
      setIsAdding(false)
      toast.success('Objective Synced')
    }
  }

  async function toggleTask(task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const { error } = await supabase.from('study_tasks').update({ status: newStatus }).eq('id', task.id)
    if (!error) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
      if (newStatus === 'completed') toast.success('Objective Completed')
    }
  }

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-indigo-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-purple-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Study Planner</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
             <Target size={24} className="animate-pulse" />
          </div>
        </div>

        {/* PROGRESS CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#161b22]/80 border border-white/5 rounded-[40px] p-8 mb-12 backdrop-blur-2xl relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
              <Sparkles size={100} />
           </div>
           
           <div className="flex items-end justify-between mb-6">
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Ecosystem Efficiency</p>
                 <h2 className="text-4xl font-black text-white tracking-tighter italic">{Math.round(progress)}%</h2>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Completed</p>
                 <p className="text-lg font-black text-indigo-500 tracking-tight">{completedCount} / {tasks.length}</p>
              </div>
           </div>

           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
              />
           </div>
        </motion.div>

        {/* LIST HEADER */}
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                 Objectives
              </h3>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Nexus Academic Telemetry</p>
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
           ) : tasks.length === 0 ? (
              <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl">
                 <div className="text-4xl mb-4 opacity-40">📚</div>
                 <p className="text-xs font-black text-white uppercase tracking-widest italic">Protocol Idle</p>
              </div>
           ) : tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-[#161b22]/80 border border-white/5 rounded-[32px] p-6 backdrop-blur-2xl flex items-center gap-6 group transition-all ${task.status === 'completed' ? 'opacity-40 grayscale-[0.5]' : ''}`}
            >
              <button 
                onClick={() => toggleTask(task)}
                className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all border ${
                  task.status === 'completed' 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'bg-white/5 border-white/10 text-gray-700 hover:text-white'
                }`}
              >
                {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>

              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${
                      task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-indigo-400' : 'text-gray-600'
                    }`}>
                       {task.priority} Priority
                    </span>
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-1">
                       <Clock size={8} /> {task.duration_mins}m
                    </span>
                 </div>
                 <h4 className={`text-sm font-black uppercase tracking-tight truncate ${task.status === 'completed' ? 'line-through text-gray-600' : 'text-white'}`}>
                    {task.title}
                 </h4>
              </div>
              
              <ChevronRight size={18} className="text-gray-800" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100]">
        <div className="bg-[#161b22]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <NavIcon icon={Home} label="Home" onClick={() => navigate('/dashboard')} />
          <NavIcon icon={LayoutGrid} label="Log" onClick={() => navigate('/carbon-log')} />
          <NavIcon icon={CalendarDays} label="Events" onClick={() => navigate('/events')} />
          <NavIcon icon={Coffee} label="Cafe" onClick={() => navigate('/cafeteria')} />
          <NavIcon icon={User} label="Me" onClick={() => navigate('/profile')} />
        </div>
      </div>

      {/* ADD MODAL */}
      {createPortal(
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl pointer-events-auto" 
                onClick={() => setIsAdding(false)} 
              />
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-[#0a0c10] border-t border-white/10 rounded-t-[50px] p-6 md:p-10 shadow-2xl pointer-events-auto flex flex-col"
                style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-0.5">Initialize Goal</h3>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Academic Matrix Sync</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400"><X size={20} /></button>
                </div>

                <div className="space-y-6 overflow-y-auto no-scrollbar max-h-[60vh] pr-2 pb-10">
                  <div className="space-y-4">
                    <InputField label="Mission Parameters" placeholder="Enter objective title..." value={newTask.title} onChange={v => setNewTask({ ...newTask, title: v })} />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Temporal Node</label>
                        <select 
                          value={newTask.duration}
                          onChange={e => setNewTask({ ...newTask, duration: e.target.value })}
                          className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                        >
                          <option value="15" className="bg-slate-900">15 Mins</option>
                          <option value="30" className="bg-slate-900">30 Mins</option>
                          <option value="60" className="bg-slate-900">1 Hour</option>
                          <option value="120" className="bg-slate-900">2 Hours</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Priority Level</label>
                        <select 
                          value={newTask.priority}
                          onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                          className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                        >
                          <option value="low" className="bg-slate-900 text-green-500">Routine</option>
                          <option value="medium" className="bg-slate-900 text-indigo-500">Important</option>
                          <option value="high" className="bg-slate-900 text-red-500">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={addTask}
                    className="w-full py-6 md:py-7 rounded-[28px] md:rounded-[32px] bg-indigo-600 text-white font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-[11px] shadow-[0_15px_40px_rgba(79,70,229,0.4)] transition-all active:scale-95"
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
    </div>
  )
}

function NavIcon({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}`}>
        <Icon size={20} strokeWidth={active ? 3 : 2} />
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
    </button>
  )
}

function InputField({ label, placeholder, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">{label}</label>
      <input 
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none shadow-inner"
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { CalendarDays, Plus, Clock, BookOpen, Target, ChevronRight, CheckCircle2, Circle, GraduationCap, Flame, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function StudyPlannerPage() {
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
      toast.error('Failed to sync task')
    } else {
      setTasks([data, ...tasks])
      setNewTask({ title: '', duration: '30', priority: 'medium' })
      setIsAdding(false)
      toast.success('Nexus Task Synced')
    }
  }

  async function toggleTask(task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const { error } = await supabase.from('study_tasks').update({ status: newStatus }).eq('id', task.id)
    if (!error) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
      if (newStatus === 'completed') toast.success('Objective Completed! 🎯')
    }
  }

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-6">
        {/* HEADER AREA */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Academic Nexus</span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Study Planner</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-500">
             <BookOpen size={22} />
          </div>
        </div>

        {/* PROGRESS OVERVIEW */}
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl mb-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4">
              <Flame size={24} className="text-orange-500 opacity-20 group-hover:opacity-100 transition-opacity duration-700" />
           </div>
           
           <div className="flex items-end justify-between mb-4">
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Daily Progress</p>
                 <h2 className="text-3xl font-black text-white tracking-tighter">{Math.round(progress)}%</h2>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Focus Points</p>
                 <p className="text-sm font-black text-indigo-500 tracking-tight">{completedCount * 10} / {tasks.length * 10}</p>
              </div>
           </div>

           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" 
              />
           </div>
        </div>

        {/* TASK SECTION HEADER */}
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Target size={14} className="text-indigo-500" /> Objectives
           </h3>
           <motion.button
             whileTap={{ scale: 0.9 }}
             onClick={() => setIsAdding(true)}
             className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20"
           >
             <Plus size={14} className="inline mr-1" /> New Goal
           </motion.button>
        </div>

        {/* ADD TASK MODAL (Glass) */}
        <AnimatePresence>
          {isAdding && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60]"
                onClick={() => setIsAdding(false)}
              />
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="fixed inset-x-6 top-1/4 z-[70] bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl"
              >
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Create Objective</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Title</label>
                    <input 
                      value={newTask.title}
                      onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="E.g. Engineering Mathematics Revision"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-[11px] font-black uppercase tracking-widest placeholder:text-gray-700 outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Duration (Min)</label>
                        <select 
                          value={newTask.duration}
                          onChange={e => setNewTask({ ...newTask, duration: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-[11px] font-black uppercase tracking-widest outline-none appearance-none"
                        >
                           <option value="15">15 Mins</option>
                           <option value="30">30 Mins</option>
                           <option value="60">1 Hour</option>
                           <option value="120">2 Hours</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Priority</label>
                        <select 
                          value={newTask.priority}
                          onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-[11px] font-black uppercase tracking-widest outline-none appearance-none"
                        >
                           <option value="low">Routine</option>
                           <option value="medium">Important</option>
                           <option value="high">Critical</option>
                        </select>
                     </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsAdding(false)} className="flex-1 py-4 rounded-2xl bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">Cancel</button>
                    <button onClick={addTask} className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20">Sync Goal</button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* TASK LIST */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Accessing Planner...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-12 text-center bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl">
                 <div className="text-4xl mb-4">📚</div>
                 <p className="text-xs font-black text-white uppercase tracking-widest">Schedule Clear</p>
                 <p className="text-[10px] font-medium text-gray-500 mt-2">Add your first academic objective!</p>
              </div>
            ) : tasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className={`group flex items-center gap-5 p-5 rounded-[28px] border transition-all duration-300 ${
                  task.status === 'completed' 
                    ? 'bg-indigo-600/10 border-indigo-600/20 opacity-60' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 shadow-lg shadow-black/20'
                }`}
              >
                <button 
                  onClick={() => toggleTask(task)}
                  className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all ${
                    task.status === 'completed' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white/5 border border-white/10 text-gray-600 group-hover:text-white'
                  }`}
                >
                  {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-black uppercase tracking-widest ${
                        task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-indigo-400' : 'text-gray-500'
                      }`}>
                         {task.priority} Priority
                      </span>
                      <div className="w-0.5 h-0.5 rounded-full bg-white/20" />
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                         <Clock size={8} /> {task.duration_mins}m
                      </span>
                   </div>
                   <h4 className={`text-sm font-black uppercase tracking-tight truncate ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                      {task.title}
                   </h4>
                </div>
                
                <ChevronRight size={18} className={`transition-opacity ${task.status === 'completed' ? 'opacity-0' : 'text-gray-700'}`} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

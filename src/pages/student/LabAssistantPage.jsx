import { useState, useEffect } from 'react'
import { Beaker, FlaskConical, Search, BookOpen, Clock, AlertCircle, Sparkles, Wand2, Terminal, Shield, ChevronLeft, Home, LayoutGrid, CalendarDays, Coffee, User, X, Plus, Notebook, Edit2, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'
import { useAuthStore } from '../../store/index'
import { supabase } from '../../lib/supabase'

export default function LabAssistantPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [search, setSearch] = useState('')
  const [experiments, setExperiments] = useState([])
  const [selectedExp, setSelectedExp] = useState(null)
  const [journal, setJournal] = useState([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', dept: '', duration: '', difficulty: 'Intermediate', risk: 'Low', instructions: '' })

  const isAdmin = ['admin', 'faculty', 'owner'].includes(profile?.role)

  useEffect(() => {
    fetchExperiments()
  }, [])

  async function fetchExperiments() {
    setLoading(true)
    const { data, error } = await supabase.from('lab_experiments').select('*').order('created_at', { ascending: false })
    if (data) setExperiments(data)
    setLoading(false)
  }

  async function saveExperiment() {
    if (!editForm.name || !editForm.dept) return
    const { error } = editForm.id 
      ? await supabase.from('lab_experiments').update(editForm).eq('id', editForm.id)
      : await supabase.from('lab_experiments').insert(editForm)
    
    if (!error) {
      toast.success(editForm.id ? 'Experiment Updated' : 'Experiment Added')
      setIsEditing(false)
      setEditForm({ name: '', dept: '', duration: '', difficulty: 'Intermediate', risk: 'Low', instructions: '' })
      fetchExperiments()
    }
  }

  async function deleteExperiment(id, e) {
    e.stopPropagation()
    const { error } = await supabase.from('lab_experiments').delete().eq('id', id)
    if (!error) {
      toast.success('Experiment Removed')
      fetchExperiments()
    }
  }

  const filtered = experiments.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.dept.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-emerald-900/5 blur-[120px]" />
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
          <div className="flex items-center gap-3">
            {isAdmin && (
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => { setEditForm({ name: '', dept: '', duration: '', difficulty: 'Intermediate', risk: 'Low', instructions: '' }); setIsEditing(true); }}
                className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500"
              >
                 <Plus size={24} />
              </motion.button>
            )}
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
               <FlaskConical size={24} />
            </div>
          </div>
        </div>

        {/* SEARCH BOX */}
        <div className="relative group mb-12">
           <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
           <div className="relative flex items-center bg-[#161b22] border border-white/5 rounded-[32px] px-8 py-6 backdrop-blur-2xl">
             <Search size={20} className="text-gray-600" />
             <input 
               value={search} 
               onChange={e => setSearch(e.target.value)}
               placeholder="Identify Experiment Pattern..." 
               className="flex-1 bg-transparent border-none outline-none text-white text-[11px] font-black uppercase tracking-[0.2em] ml-6 placeholder:text-gray-800"
             />
           </div>
        </div>

        {/* EXPERIMENT LIST */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
               <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic text-center">Identifying Protocols...</p>
            </div>
          ) : filtered.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedExp(exp)}
              className="group bg-[#161b22]/80 border border-white/5 rounded-[40px] p-8 backdrop-blur-2xl cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                 <Terminal size={80} />
              </div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                 <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-black text-cyan-500 uppercase tracking-widest">
                      {exp.dept}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      exp.risk === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
                    }`}>
                      Risk: {exp.risk}
                    </span>
                 </div>
                 {isAdmin && (
                    <div className="flex items-center gap-3">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setEditForm(exp); setIsEditing(true); }}
                         className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                       >
                          <Edit2 size={14} />
                       </button>
                       <button 
                         onClick={(e) => deleteExperiment(exp.id, e)}
                         className="p-2 rounded-lg bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                       >
                          <Trash2 size={14} />
                       </button>
                    </div>
                 )}
              </div>

              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 leading-tight">{exp.name}</h3>
              
              <div className="flex items-center gap-6 relative z-10 border-t border-white/5 pt-6">
                 <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-gray-600" />
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{exp.difficulty}</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-600 uppercase tracking-widest ml-auto">
                    <Clock size={12} /> {exp.duration}
                 </div>
                 <div className="flex items-center gap-2 text-cyan-500">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Access Manual</span>
                 </div>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl">
               <div className="text-4xl mb-4 opacity-40">🔬</div>
               <p className="text-xs font-black text-white uppercase tracking-widest italic">Manual Not Found</p>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM NAV BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100] md:hidden">
        <div className="bg-[#161b22]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <NavIcon icon={Home} label="Home" onClick={() => navigate('/dashboard')} />
          <NavIcon icon={LayoutGrid} label="Log" onClick={() => navigate('/carbon-log')} />
          <NavIcon icon={CalendarDays} label="Events" onClick={() => navigate('/events')} />
          <NavIcon icon={Coffee} label="Cafe" onClick={() => navigate('/cafeteria')} />
          <NavIcon icon={User} label="Me" onClick={() => navigate('/profile')} />
        </div>
      </div>

      {/* MANUAL OVERLAY (Portal) */}
      {createPortal(
        <AnimatePresence>
          {selectedExp && (
            <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl pointer-events-auto" 
                onClick={() => setSelectedExp(null)} 
              />
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-[#0a0c10] border-t border-white/10 rounded-t-[50px] p-6 md:p-10 shadow-2xl pointer-events-auto flex flex-col"
                style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
                       <BookOpen size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-tight">Research Protocol</h3>
                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Standard Operating Procedure</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedExp(null)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400"><X size={20} /></button>
                </div>

                <div className="space-y-6 overflow-y-auto no-scrollbar max-h-[60vh] pr-2 pb-10">
                  <div className="bg-[#161b22] border border-white/5 rounded-[32px] p-8">
                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 leading-none">
                       <AlertCircle size={14} /> Critical Instructions
                    </h4>
                    <p className="text-gray-400 text-[13px] leading-relaxed font-medium italic">
                       "{selectedExp.instructions}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#161b22] border border-white/5 rounded-[32px] p-6">
                       <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Duration</p>
                       <p className="text-xl font-black text-white tracking-tighter italic">{selectedExp.duration}</p>
                    </div>
                    <div className={`bg-[#161b22] border rounded-[32px] p-6 ${selectedExp.risk === 'High' ? 'border-red-500/20' : 'border-white/5'}`}>
                       <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Safety Rating</p>
                       <p className={`text-xl font-black tracking-tighter italic ${selectedExp.risk === 'High' ? 'text-red-500' : 'text-green-500'}`}>
                          {selectedExp.risk} RISK
                       </p>
                    </div>
                  </div>
                  
                  <div className="bg-[#161b22] border border-white/5 rounded-[32px] p-8">
                     <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                           <BookOpen size={14} /> Lab Journal
                        </h4>
                        <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">{journal.length} Entries</span>
                     </div>
                     
                     <div className="space-y-4 mb-6 max-h-40 overflow-y-auto no-scrollbar">
                        {journal.map((note, i) => (
                           <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                              <p className="text-[11px] text-gray-300 leading-relaxed font-medium">{note.text}</p>
                              <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest mt-2">{note.time}</p>
                           </div>
                        ))}
                        {journal.length === 0 && <p className="text-center text-[9px] text-gray-700 font-black uppercase tracking-widest py-4">No observations recorded</p>}
                     </div>

                     <div className="flex gap-3">
                        <input 
                           value={newNote}
                           onChange={e => setNewNote(e.target.value)}
                           placeholder="Record observation..."
                           className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[11px] text-white outline-none focus:border-emerald-500/50 transition-all"
                        />
                        <button 
                           onClick={() => {
                              if (!newNote.trim()) return
                              setJournal([...journal, { text: newNote, time: new Date().toLocaleTimeString() }])
                              setNewNote('')
                              toast.success('Observation Recorded')
                           }}
                           className="p-3 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                        >
                           <Plus size={20} />
                        </button>
                     </div>
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      toast.success('Lab Sequence Initializing...')
                      setSelectedExp(null)
                      navigate('/chatbot', {
                        state: {
                          initialMessage: `I want to start the lab experiment: ${selectedExp.name} (${selectedExp.dept}). The instructions say: "${selectedExp.instructions}". Please guide me step by step.`
                        }
                      })
                    }}
                    className="w-full py-6 md:py-7 rounded-[28px] md:rounded-[32px] bg-cyan-600 text-white font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-[11px] shadow-[0_15px_40px_rgba(8,145,178,0.4)] transition-all active:scale-95"
                  >
                    Initialize Lab Sequence
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ADMIN EDIT MODAL */}
      {createPortal(
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl pointer-events-auto" 
                onClick={() => setIsEditing(false)} 
              />
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-[#0a0c10] border-t border-white/10 rounded-t-[50px] p-6 md:p-10 shadow-2xl pointer-events-auto flex flex-col"
                style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">{editForm.id ? 'Modify Protocol' : 'Initialize Protocol'}</h3>
                  <button onClick={() => setIsEditing(false)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400"><X size={20} /></button>
                </div>

                <div className="space-y-6 overflow-y-auto no-scrollbar max-h-[60vh] pb-10">
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Protocol Name</label>
                         <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Department</label>
                            <input value={editForm.dept} onChange={e => setEditForm({...editForm, dept: e.target.value})} className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Duration</label>
                            <input value={editForm.duration} onChange={e => setEditForm({...editForm, duration: e.target.value})} className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none" />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Difficulty</label>
                            <select value={editForm.difficulty} onChange={e => setEditForm({...editForm, difficulty: e.target.value})} className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none appearance-none">
                               <option>Easy</option><option>Intermediate</option><option>Advanced</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Safety Risk</label>
                            <select value={editForm.risk} onChange={e => setEditForm({...editForm, risk: e.target.value})} className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none appearance-none">
                               <option>None</option><option>Low</option><option>Medium</option><option>High</option>
                            </select>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Critical Instructions</label>
                         <textarea value={editForm.instructions} onChange={e => setEditForm({...editForm, instructions: e.target.value})} rows={4} className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none resize-none" />
                      </div>
                   </div>

                   <button 
                     onClick={saveExperiment}
                     className="w-full py-6 rounded-[32px] bg-cyan-600 text-white font-black uppercase tracking-[0.4em] text-[11px] shadow-[0_15px_40px_rgba(8,145,178,0.4)]"
                   >
                     {editForm.id ? 'Commit Changes' : 'Initialize Sequence'}
                   </button>
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

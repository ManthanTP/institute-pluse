import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp, Info, GripVertical, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminHelpPage() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  async function fetchContent() {
    setLoading(true)
    const { data } = await supabase
      .from('help_content')
      .select('*')
      .order('role', { ascending: false })
      .order('order_index', { ascending: true })
    if (data) setContent(data)
    setLoading(false)
  }

  async function handleSave() {
    if (!editForm.title) return toast.error('Title required')
    
    const { error } = await supabase
      .from('help_content')
      .upsert(editForm)
    
    if (error) toast.error('Save failed')
    else {
      toast.success('Help content synced')
      setEditingId(null)
      setIsAdding(false)
      fetchContent()
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure? This node will be purged from the knowledge base.')) return
    const { error } = await supabase.from('help_content').delete().eq('id', id)
    if (error) toast.error('Purge failed')
    else {
      toast.success('Node purged')
      fetchContent()
    }
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditForm({ ...item })
    setIsAdding(false)
  }

  function startAdd(role) {
    setIsAdding(true)
    setEditingId('new')
    setEditForm({
      role,
      title: '',
      icon: 'Info',
      description: '',
      instructions: [''],
      order_index: content.filter(c => c.role === role).length + 1
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Knowledge Management Protocol</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">Help <span className="text-red-500">Editor</span></h2>
          </div>
          <div className="flex gap-4">
             <button onClick={() => startAdd('student')} className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-3">
                <Plus size={16} /> New Student Node
             </button>
             <button onClick={() => startAdd('faculty')} className="px-6 py-4 rounded-2xl bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-500 shadow-xl shadow-red-600/20 transition-all flex items-center gap-3">
                <Plus size={16} /> New Faculty Node
             </button>
          </div>
        </header>

        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Decrypting Knowledge Base...</p>
           </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-10">
            {['student', 'faculty'].map(role => (
              <div key={role} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] italic">{role} Terminal</h3>
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{content.filter(c => c.role === role).length} Nodes Active</span>
                </div>

                <div className="space-y-4">
                  {content.filter(c => c.role === role).map((item, idx) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 border border-white/10 rounded-[32px] p-6 hover:bg-white/[0.08] transition-all group"
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-red-400 transition-colors">
                             <HelpCircle size={18} />
                          </div>
                          <div>
                             <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{item.title}</h4>
                             <p className="text-[9px] font-medium text-gray-500 uppercase tracking-widest mt-0.5">{item.icon} Icon</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={() => startEdit(item)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-red-600 transition-all">
                              <Edit2 size={14} />
                           </button>
                           <button onClick={() => handleDelete(item.id)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-red-600 transition-all">
                              <Trash2 size={14} />
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT/ADD MODAL */}
      <AnimatePresence>
        {editingId && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl pointer-events-auto"
              onClick={() => setEditingId(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0c10] border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{isAdding ? 'Initialize' : 'Modify'} Node</h3>
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{editForm.role} Context</p>
                </div>
                <button onClick={() => setEditingId(null)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white">
                   <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Node Title</label>
                       <input 
                         type="text" 
                         value={editForm.title}
                         onChange={e => setEditForm({...editForm, title: e.target.value})}
                         className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-sm text-white font-medium outline-none focus:border-red-500/50 transition-all shadow-inner"
                         placeholder="e.g. Attendance Terminal"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Icon Reference (Lucide)</label>
                       <input 
                         type="text" 
                         value={editForm.icon}
                         onChange={e => setEditForm({...editForm, icon: e.target.value})}
                         className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-sm text-white font-medium outline-none focus:border-red-500/50 transition-all shadow-inner"
                         placeholder="e.g. Leaf, Zap, Award"
                       />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Brief Description</label>
                    <textarea 
                      value={editForm.description}
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-sm text-white font-medium outline-none focus:border-red-500/50 transition-all shadow-inner resize-none"
                      rows={2}
                      placeholder="Operational summary..."
                    />
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between ml-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Instructions</label>
                       <button 
                         onClick={() => setEditForm({...editForm, instructions: [...editForm.instructions, '']})}
                         className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2 hover:text-red-400"
                       >
                          <Plus size={12} /> Add Step
                       </button>
                    </div>
                    <div className="space-y-3">
                       {editForm.instructions.map((step, idx) => (
                         <div key={idx} className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500 border border-white/5 flex-shrink-0">
                               {idx + 1}
                            </div>
                            <input 
                              type="text"
                              value={step}
                              onChange={e => {
                                const newSteps = [...editForm.instructions]
                                newSteps[idx] = e.target.value
                                setEditForm({...editForm, instructions: newSteps})
                              }}
                              className="flex-1 bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white outline-none"
                            />
                            <button 
                              onClick={() => {
                                const newSteps = editForm.instructions.filter((_, i) => i !== idx)
                                setEditForm({...editForm, instructions: newSteps})
                              }}
                              className="p-3 text-red-500/40 hover:text-red-500 transition-colors"
                            >
                               <X size={14} />
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>

                 <button 
                   onClick={handleSave}
                   className="w-full py-6 rounded-[24px] bg-red-600 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-red-600/30 hover:bg-red-500 transition-all"
                 >
                    Confirm Synchronization
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

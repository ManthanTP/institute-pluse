import { useState, useEffect } from 'react'
import { Megaphone, Send, Clock, Trash2, Globe, Users, ShieldCheck, Plus, MessageSquare, AlertTriangle, Zap, ShieldAlert, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('all')
  const [severity, setSeverity] = useState('info')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchBroadcasts()
  }, [])

  async function fetchBroadcasts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('announcements')
        .select('*, author:created_by(full_name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setBroadcasts(data)
    } catch (err) {
      console.error('Broadcast fetch error:', err)
      toast.error('Failed to load broadcasts')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeploy() {
    if (!message.trim()) {
      toast.error('Message is required')
      return
    }

    try {
      setSubmitting(true)
      const user = (await supabase.auth.getUser()).data.user

      const { error } = await supabase
        .from('announcements')
        .insert({
          title: title.trim() || 'Admin Broadcast',
          content: message.trim(),
          audience_type: target === 'all' ? 'global' : 'department',
          target_id: target === 'all' ? null : target,
          priority: severity,
          created_by: user?.id
        })

      if (error) throw error

      toast.success('Broadcast Deployed ✓')
      setTitle('')
      setMessage('')
      setSeverity('info')
      fetchBroadcasts()
    } catch (err) {
      console.error('Deploy error:', err)
      toast.error('Failed: ' + (err.message || 'Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteBroadcast(id) {
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (!error) {
      toast.success('Broadcast removed')
      setBroadcasts(prev => prev.filter(b => b.id !== id))
    } else {
      toast.error('Delete failed')
    }
  }

  function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <AdminLayout>
      <div className="space-y-6 lg:space-y-8 pb-20">
        {/* HEADER */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Megaphone size={14} className="text-orange-500" />
            <span className="text-[8px] lg:text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Communication Hub</span>
          </div>
          <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-none">Broadcast <span className="text-orange-500">Center</span></h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
           {/* DEPLOYMENT TERMINAL */}
           <div className="lg:col-span-1 space-y-5">
              <div className="bg-[#161b22] border border-white/10 rounded-2xl lg:rounded-3xl p-5 lg:p-7 space-y-5">
                 <h4 className="text-[9px] font-black text-white uppercase tracking-[0.3em]">New Broadcast</h4>
                 
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Title</label>
                       <input
                         value={title}
                         onChange={e => setTitle(e.target.value)}
                         placeholder="Broadcast title..."
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-orange-500/50 transition-all"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Sector</label>
                       <div className="relative">
                         <select 
                           value={target}
                           onChange={(e) => setTarget(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer"
                           style={{ colorScheme: 'dark' }}
                         >
                            <option value="all" style={{ background: '#161b22' }}>Full Campus</option>
                            <option value="students" style={{ background: '#161b22' }}>Students Only</option>
                            <option value="faculty" style={{ background: '#161b22' }}>Faculty Only</option>
                            <option value="staff" style={{ background: '#161b22' }}>Staff Only</option>
                         </select>
                         <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Severity</label>
                       <div className="grid grid-cols-3 gap-2">
                          {[
                            { val: 'info', label: 'Info', color: 'bg-blue-600 border-blue-600' },
                            { val: 'warning', label: 'Warning', color: 'bg-yellow-500 border-yellow-500 text-slate-950' },
                            { val: 'urgent', label: 'Urgent', color: 'bg-red-600 border-red-600' }
                          ].map(s => (
                             <button
                               key={s.val}
                               onClick={() => setSeverity(s.val)}
                               className={`py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${severity === s.val ? `${s.color} text-white` : 'bg-white/5 text-gray-500 border-white/10'}`}
                             >
                                {s.label}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Message</label>
                       <textarea 
                         placeholder="Write broadcast message..."
                         value={message}
                         onChange={(e) => setMessage(e.target.value)}
                         rows={5}
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-all resize-none"
                       />
                    </div>

                    <button 
                      onClick={handleDeploy}
                      disabled={submitting || !message.trim()}
                      className="w-full py-4 bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                       {submitting ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Deploying...</> : <><Zap size={14} /> Deploy Broadcast</>}
                    </button>
                 </div>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                 <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
                 <p className="text-[8px] font-black text-red-500 uppercase tracking-widest leading-relaxed">Urgent broadcasts display instantly on all terminals.</p>
              </div>
           </div>

           {/* RECENT FEED */}
           <div className="lg:col-span-2 space-y-4">
              <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] px-1">History ({broadcasts.length})</h4>
              
              {loading ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Loading...</p>
                </div>
              ) : broadcasts.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center gap-3">
                  <Megaphone size={32} className="text-gray-800 opacity-20" />
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">No broadcasts yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                     {broadcasts.map((ann) => (
                        <motion.div 
                          key={ann.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#161b22]/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group relative"
                        >
                           <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                 <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                                   ann.priority === 'urgent' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                   ann.priority === 'warning' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                   'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                 }`}>
                                    {ann.priority === 'urgent' ? <AlertTriangle size={16} /> : <Megaphone size={16} />}
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{ann.title}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                       <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">
                                         {ann.audience_type === 'global' ? 'Full Campus' : ann.target_id || 'Targeted'}
                                       </span>
                                       <span className="w-1 h-1 rounded-full bg-gray-700" />
                                       <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">{getTimeAgo(ann.created_at)}</span>
                                       {ann.author?.full_name && (
                                         <>
                                           <span className="w-1 h-1 rounded-full bg-gray-700" />
                                           <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">By {ann.author.full_name}</span>
                                         </>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <button 
                                onClick={() => deleteBroadcast(ann.id)}
                                className="p-2 bg-white/5 rounded-lg text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 border border-white/5"
                              >
                                <Trash2 size={14} />
                              </button>
                           </div>
                           <p className="text-xs text-gray-400 font-medium leading-relaxed pl-12">{ann.content}</p>
                        </motion.div>
                     ))}
                  </AnimatePresence>
                </div>
              )}
           </div>
        </div>
      </div>
    </AdminLayout>
  )
}

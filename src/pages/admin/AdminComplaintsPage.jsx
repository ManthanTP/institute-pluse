import { useState, useEffect } from 'react'
import { MessageSquare, ShieldAlert, CheckCircle2, Clock, Filter, Search, MoreHorizontal, User, MapPin, ExternalLink, Trash2, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchComplaints()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('complaints_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setComplaints(prev => [payload.new, ...prev])
          toast('New distress signal received 📡', { icon: '🔔' })
        } else if (payload.eventType === 'UPDATE') {
          setComplaints(prev => prev.map(c => c.id === payload.new.id ? payload.new : c))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchComplaints() {
    setLoading(true)
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false })
    if (data) setComplaints(data)
    setLoading(false)
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('complaints').update({ status }).eq('id', id)
    if (!error) {
      toast.success(`Resolution Status: ${status.toUpperCase()}`)
      if (selected?.id === id) setSelected({ ...selected, status })
    }
  }

  const filtered = filter === 'All' ? complaints : complaints.filter(c => c.status === filter.toLowerCase())

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Distress Resolution Protocol</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Complaint Console</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
              {filtered.length} Active Distress Signals Detected
            </p>
          </div>
          <div className="flex gap-3">
             <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl">
               {['All', 'Open', 'In-Progress', 'Resolved'].map(f => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                     filter === f ? 'bg-white text-slate-950 shadow-lg' : 'text-gray-500 hover:text-white'
                   }`}
                 >
                   {f}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* COMPLAINTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scanning Frequencies...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl">
                 <div className="text-4xl mb-4 opacity-40">📡</div>
                 <p className="text-xs font-black text-white uppercase tracking-widest">Zero Distress Signals</p>
                 <p className="text-[10px] font-medium text-gray-500 mt-2">Campus environment is currently stable.</p>
              </div>
            ) : filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(c)}
                className="group bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 relative overflow-hidden cursor-pointer"
              >
                 <div className="absolute top-0 right-0 p-6">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      c.status === 'resolved' ? 'bg-green-500' : 
                      c.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                 </div>
                 
                 <div className="flex items-center gap-2 mb-6">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-gray-500 uppercase tracking-widest">
                       {c.category}
                    </span>
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                       ID: {c.id.split('-')[0]}
                    </span>
                 </div>

                 <h3 className="text-sm font-black text-white uppercase tracking-tight mb-3 line-clamp-1">{c.title}</h3>
                 <p className="text-[10px] font-medium text-gray-500 leading-relaxed mb-8 line-clamp-2">{c.description}</p>
                 
                 <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                          <User size={14} />
                       </div>
                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Logged: {new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <button className="text-red-500 group-hover:translate-x-1 transition-transform">
                       <ExternalLink size={16} />
                    </button>
                 </div>
              </motion.div>
            ))}
           </AnimatePresence>
        </div>
      </div>

      {/* RESOLUTION MODAL */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60]"
              onClick={() => setSelected(null)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 lg:left-72 bg-slate-900 border-t border-white/10 rounded-t-[48px] z-[70] p-10 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
            >
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 rounded-[24px] bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                        <ShieldAlert size={28} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Signal Manifest</p>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">{selected.title}</h2>
                     </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500"><X size={20} /></button>
               </div>

               <div className="space-y-8">
                  <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <MapPin size={14} className="text-red-500" />
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">{selected.location || 'Unknown Node'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <Clock size={14} className="text-gray-500" />
                           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{new Date(selected.created_at).toLocaleString()}</span>
                        </div>
                     </div>
                     <p className="text-white/80 text-[13px] leading-relaxed font-medium mb-10">
                        {selected.description}
                     </p>
                     
                     <div className="flex flex-wrap gap-4">
                        <button 
                          onClick={() => updateStatus(selected.id, 'open')}
                          className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                            selected.status === 'open' ? 'bg-red-600 text-white border-red-600' : 'bg-white/5 text-gray-500 border-white/10'
                          }`}
                        >
                           Reopen Signal
                        </button>
                        <button 
                          onClick={() => updateStatus(selected.id, 'in-progress')}
                          className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                            selected.status === 'in-progress' ? 'bg-yellow-500 text-slate-950 border-yellow-500' : 'bg-white/5 text-gray-500 border-white/10'
                          }`}
                        >
                           Initialize Resolve
                        </button>
                        <button 
                          onClick={() => updateStatus(selected.id, 'resolved')}
                          className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                            selected.status === 'resolved' ? 'bg-green-600 text-white border-green-600' : 'bg-white/5 text-gray-500 border-white/10'
                          }`}
                        >
                           Clear Signal
                        </button>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <button className="flex-1 py-5 rounded-[28px] bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em]">
                        Contact Node
                     </button>
                     <button className="flex-1 py-5 rounded-[28px] bg-red-600/10 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-[0.2em]">
                        Emergency Escalation
                     </button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

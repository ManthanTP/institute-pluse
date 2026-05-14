import { useState, useEffect } from 'react'
import { MessageSquare, AlertCircle, CheckCircle2, Clock, Trash2, ChevronRight, Search, Filter, ShieldAlert, MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function FacultyComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchComplaints()

    // Real-time updates
    const channel = supabase
      .channel('faculty_complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
        fetchComplaints()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchComplaints() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('complaints')
        .select('*, student:profiles!student_id(full_name, email)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setComplaints(data)
    } catch (err) {
      console.error('Complaints Error:', err)
      toast.error('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  async function resolveComplaint(id) {
    const { error } = await supabase
      .from('complaints')
      .update({ status: 'resolved' })
      .eq('id', id)

    if (!error) {
      toast.success('Complaint Resolved ✓')
      fetchComplaints()
    } else {
      toast.error('Failed to resolve complaint')
    }
  }

  const filteredComplaints = filter === 'all' ? complaints : complaints.filter(c => c.status === filter)

  const PRIORITY_STYLE = {
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    urgent: 'bg-red-500/10 text-red-500 border-red-500/20'
  }

  return (
    <FacultyLayout>
      <div className="space-y-6 lg:space-y-8 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 lg:gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <ShieldAlert size={12} className="text-red-500" />
              <span className="text-[8px] lg:text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Resolution Terminal</span>
            </div>
            <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-none">Complaint <span className="text-red-500">Registry</span></h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              {complaints.length} complaints • {complaints.filter(c => c.status === 'open').length} open
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-3">
             <div className="flex gap-1 p-1 bg-[#161b22] border border-white/10 rounded-xl">
                {['all', 'open', 'in-progress', 'resolved'].map((type) => (
                   <button
                     key={type}
                     onClick={() => setFilter(type)}
                     className={`px-4 lg:px-6 py-2.5 rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === type ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'}`}
                   >
                     {type === 'in-progress' ? 'Active' : type}
                   </button>
                ))}
             </div>
          </div>
        </div>

        {/* COMPLAINTS LIST */}
        <div className="space-y-4">
           <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="py-16 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Loading...</p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center gap-4">
                   <MessageCircle size={40} className="text-gray-800 opacity-20" />
                   <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">No complaints in this category</p>
                </div>
              ) : filteredComplaints.map((c, idx) => (
                 <motion.div 
                   key={c.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="bg-[#161b22] border border-white/5 rounded-2xl lg:rounded-3xl p-5 lg:p-7 group hover:border-red-500/20 transition-all relative overflow-hidden"
                 >
                    <div className="flex flex-col md:flex-row gap-4 lg:gap-6 items-start">
                       {/* Student Avatar */}
                       <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 font-black text-lg border border-red-500/20 shrink-0">
                          {c.student?.full_name?.[0] || '?'}
                       </div>
                       
                       <div className="flex-1 space-y-3 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                             <div>
                                <h4 className="text-base lg:text-lg font-black text-white uppercase tracking-tight">{c.title}</h4>
                                <p className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">
                                  By {c.student?.full_name || 'Unknown'} • {new Date(c.created_at).toLocaleDateString()}
                                </p>
                             </div>
                             <div className="flex items-center gap-2">
                               <span className={`px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border ${PRIORITY_STYLE[c.priority] || PRIORITY_STYLE.medium}`}>
                                  {c.priority || 'medium'}
                               </span>
                               <span className={`px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border ${
                                 c.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                 c.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                 'bg-red-500/10 text-red-500 border-red-500/20'
                               }`}>
                                  {c.status}
                               </span>
                             </div>
                          </div>
                          
                          <p className="text-xs text-gray-400 font-medium leading-relaxed">{c.description}</p>

                          {c.admin_response && (
                            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                              <p className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-1">Admin Response:</p>
                              <p className="text-[10px] text-gray-400 leading-relaxed">{c.admin_response}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                             {c.status !== 'resolved' && (
                                <button onClick={() => resolveComplaint(c.id)} className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all">Mark Resolved</button>
                             )}
                             {c.status === 'resolved' && (
                                <div className="flex items-center gap-2 text-green-500 text-[9px] font-black uppercase tracking-widest">
                                   <CheckCircle2 size={14} /> Resolved
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>
      </div>

    </FacultyLayout>
  )
}

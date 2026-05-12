import { useState, useEffect } from 'react'
import { MessageSquare, AlertCircle, CheckCircle2, Clock, Trash2, ChevronRight, Search, Filter, ShieldAlert, MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function FacultyComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetchComplaints()
  }, [])

  async function fetchComplaints() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('complaints')
        .select('*, profiles:student_id(full_name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      if (data) {
        setComplaints(data.map(c => ({
          id: c.id,
          student: c.profiles?.full_name || 'ANONYMOUS_STUDENT',
          subject: c.subject,
          description: c.description,
          status: c.status,
          date: new Date(c.created_at).toLocaleDateString(),
          priority: c.priority || 'medium'
        })))
      }
    } catch (err) {
      console.error('Complaints Error:', err)
      toast.error('Grievance Registry Sync Failed')
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
      toast.success('Grievance Marked as Resolved')
      fetchComplaints()
    } else {
      toast.error('Failed to resolve complaint')
    }
  }

  return (
    <FacultyLayout>
      <div className="space-y-8 lg:space-y-12 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 lg:mb-3">
              <ShieldAlert size={12} className="text-red-500" />
              <span className="text-[8px] lg:text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Conflict Resolution Terminal</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Complaint <span className="text-red-500">Registry</span></h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
              Processing active institutional distress signals
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4">
             <div className="w-full sm:w-auto flex gap-1 p-1.5 bg-[#161b22] border border-white/10 rounded-xl lg:rounded-2xl shadow-inner">
                {['pending', 'resolved'].map((type) => (
                   <button
                     key={type}
                     onClick={() => setFilter(type)}
                     className={`flex-1 sm:flex-none px-6 lg:px-10 py-3 rounded-lg lg:rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all ${filter === type ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'}`}
                   >
                     {type}
                   </button>
                ))}
             </div>
          </div>
        </div>

        {/* COMPLAINTS LIST */}
        <div className="space-y-4 lg:space-y-6">
           <AnimatePresence mode="popLayout">
              {complaints.filter(c => c.status === filter).map((complaint, idx) => (
                 <motion.div 
                   key={complaint.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-[#161b22] border border-white/5 rounded-3xl lg:rounded-[40px] p-6 lg:p-10 group hover:border-red-500/30 transition-all relative overflow-hidden shadow-2xl"
                 >
                    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
                       <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-[24px] bg-red-500/10 flex items-center justify-center text-red-500 font-black text-lg lg:text-xl border border-red-500/20 shadow-inner">
                          {complaint.student[0]}
                       </div>
                       
                       <div className="flex-1 space-y-4 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                             <div>
                                <h4 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight truncate">{complaint.subject}</h4>
                                <p className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Submitted by {complaint.student} • {complaint.date}</p>
                             </div>
                             <div className={`self-start sm:self-center px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-[7px] lg:text-[8px] font-black uppercase tracking-widest ${complaint.priority === 'high' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-orange-500/20 text-orange-500 border border-orange-500/20'}`}>
                                {complaint.priority} Priority
                             </div>
                          </div>
                          
                          <p className="text-xs lg:text-sm text-gray-400 font-medium leading-relaxed max-w-3xl italic">"{complaint.description}"</p>

                          <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-4 pt-6 border-t border-white/5 mt-8">
                             {complaint.status === 'pending' ? (
                                <button onClick={() => resolveComplaint(complaint.id)} className="w-full sm:w-auto px-8 lg:px-10 py-3.5 lg:py-4 bg-red-600 text-white rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:scale-105 active:scale-95 transition-all">Mark as Resolved</button>
                             ) : (
                                <div className="flex items-center gap-2 text-green-500 text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
                                   <CheckCircle2 size={16} /> Resolution Synchronized
                                </div>
                             )}
                             <button className="w-full sm:w-auto px-8 lg:px-10 py-3.5 lg:py-4 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all shadow-inner">Contact Student</button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </AnimatePresence>

           {complaints.filter(c => c.status === filter).length === 0 && (
              <div className="py-32 lg:py-40 text-center flex flex-col items-center gap-6">
                 <MessageCircle size={48} lg:size={60} className="text-gray-800 opacity-20" />
                 <p className="text-[9px] lg:text-[11px] font-black text-gray-700 uppercase tracking-[0.4em] italic px-6 leading-relaxed">Grievance registry is currently clear for this institutional sector</p>
              </div>
           )}
        </div>
      </div>

    </FacultyLayout>
  )
}

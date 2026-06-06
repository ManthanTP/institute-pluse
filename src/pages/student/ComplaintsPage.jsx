import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, ShieldAlert, ChevronLeft, Calendar, Info, Home, LayoutGrid, CalendarDays, Coffee, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const CATEGORIES = ['academic', 'infrastructure', 'transport', 'sustainability', 'food', 'other']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const PRIORITY_COLORS = { low: '#64748b', medium: '#f59e0b', high: '#ef4444', urgent: '#7f1d1d' }

export default function ComplaintsPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [complaints, setComplaints] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category: 'infrastructure', title: '', description: '', priority: 'medium' })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) fetchComplaints()
  }, [profile?.id])

  async function fetchComplaints() {
    setLoading(true)
    const { data } = await supabase.from('complaints').select('*').eq('student_id', profile.id).order('created_at', { ascending: false })
    if (data && data.length > 0) setComplaints(data)
    else setComplaints([])
    setLoading(false)
  }

  async function submitComplaint() {
    if (!form.title || !form.description || form.description.length < 20) {
      toast.error('Brief Telemetry Required')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.from('complaints').insert({
      student_id: profile.id, ...form, status: 'open'
    })
    if (error) toast.error('Transmission Failed')
    else { 
      toast.success('Sequence Uploaded')
      setShowForm(false)
      setForm({ category: 'infrastructure', title: '', description: '', priority: 'medium' })
      fetchComplaints() 
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-red-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Support Console...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0c10] text-white pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-red-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-blue-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4 lg:gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="hidden lg:flex w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl"
            >
              <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </motion.button>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Resolutions</h1>
          </div>
          <div className="flex-1 flex justify-end lg:flex-none">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowForm(true)}
              className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
               <Plus size={24} />
            </motion.button>
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="space-y-6">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Syncing Reports...</p>
             </div>
          ) : complaints.length === 0 ? (
            <div className="py-20 text-center bg-white/5 border border-white/10 rounded-2xl md:rounded-[40px] backdrop-blur-xl">
               <div className="text-4xl mb-4 opacity-40">📬</div>
               <p className="text-xs font-black text-white uppercase tracking-widest italic">Matrix Clean</p>
            </div>
          ) : complaints.map((c, i) => (
            <motion.div 
              key={c.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#161b22]/80 border border-white/5 rounded-2xl md:rounded-[40px] p-5 md:p-8 backdrop-blur-2xl relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-gray-500 uppercase tracking-widest">{c.category}</span>
                  <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest" style={{ background: PRIORITY_COLORS[c.priority] + '20', color: PRIORITY_COLORS[c.priority] }}>{c.priority}</span>
                </div>
                <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${c.status === 'resolved' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                   {c.status?.replace('_', ' ')}
                </div>
              </div>

              <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-4 leading-none">{c.title}</h4>
              <p className="text-xs font-medium text-gray-500 leading-relaxed mb-6 line-clamp-2">{c.description}</p>

              {c.admin_response && (
                <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-green-500/5 border border-green-500/10 mb-6 relative">
                  <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Info size={12} /> Resolution Node:
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{c.admin_response}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-white/5 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(c.created_at).toLocaleDateString()}</span>
                <span>Ref: #{c.id.slice(0, 8)}</span>
              </div>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
                 <ShieldAlert size={80} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FORM MODAL (Portal) */}
      {createPortal(
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl pointer-events-auto" 
                onClick={() => setShowForm(false)} 
              />
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-[#0a0c10] border-t border-white/10 rounded-t-3xl md:rounded-t-[50px] p-5 md:p-10 shadow-2xl pointer-events-auto flex flex-col"
                style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-0.5">Initialize Report</h3>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">System Diagnostics Protocol</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400"><X size={20} /></button>
                </div>

                <div className="space-y-6 overflow-y-auto no-scrollbar max-h-[60vh] pr-2 pb-10">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Classification</label>
                      <select 
                        value={form.category} 
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))} 
                        className="w-full bg-[#161b22] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                      </select>
                    </div>

                    <InputField label="Subject Header" placeholder="Brief objective..." value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Telemetry Data (Min 20 Chars)</label>
                      <textarea 
                        value={form.description} 
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Detailed situational report..."
                        className="w-full bg-[#161b22] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none resize-none shadow-inner"
                        rows={4} 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Priority Protocol</label>
                      <div className="flex gap-2">
                        {PRIORITIES.map(p => (
                          <button 
                            key={p} 
                            onClick={() => setForm(f => ({ ...f, priority: p }))}
                            className={`flex-1 py-3 md:py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                              form.priority === p ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-gray-500 border-white/5'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={submitComplaint} 
                    disabled={submitting} 
                    className="w-full py-5 md:py-7 rounded-2xl md:rounded-[32px] bg-red-600 text-white font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-[11px] shadow-[0_15px_40px_rgba(239,68,68,0.4)] disabled:opacity-50"
                  >
                    {submitting ? 'Transmitting...' : 'Confirm Upload to Core Matrix'}
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

function InputField({ label, placeholder, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">{label}</label>
      <input 
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#161b22] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none shadow-inner"
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = ['academic', 'infrastructure', 'transport', 'sustainability', 'food', 'other']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const PRIORITY_COLORS = { low: '#64748b', medium: '#f59e0b', high: '#ef4444', urgent: '#7f1d1d' }
const STATUS_MAP = { open: 'status-open', in_progress: 'status-in-progress', resolved: 'status-ready', closed: 'status-closed' }

export default function ComplaintsPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [complaints, setComplaints] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category: 'infrastructure', title: '', description: '', priority: 'medium' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (profile?.id) fetchComplaints()
  }, [profile?.id])

  async function fetchComplaints() {
    const { data } = await supabase.from('complaints').select('*').eq('student_id', profile.id).order('created_at', { ascending: false })
    setComplaints(data || [])
  }

  async function submitComplaint() {
    if (!form.title || !form.description || form.description.length < 20) {
      toast.error('Please fill all fields (description min 20 chars)')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.from('complaints').insert({
      student_id: profile.id, ...form, status: 'open'
    })
    if (error) toast.error('Failed to submit')
    else { toast.success('Complaint submitted! 🌿'); setShowForm(false); setForm({ category: 'infrastructure', title: '', description: '', priority: 'medium' }); fetchComplaints() }
    setSubmitting(false)
  }

  return (
    <main className="max-w-4xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Resolution Hub</h2>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Active Report Matrix</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-600/20 hover:scale-105 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="nexus-grid">
        {complaints.length === 0 ? (
          <div className="lg:col-span-3 glass-card p-12 text-center">
            <p className="text-5xl mb-6 grayscale">📭</p>
            <h3 className="text-xl font-black text-white mb-2">Matrix Empty</h3>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-8">No reports found in current quadrant</p>
            <button onClick={() => setShowForm(true)} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
              Initialize New Report
            </button>
          </div>
        ) : (
          complaints.map((c, i) => (
            <motion.div 
              key={c.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 group relative"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${STATUS_MAP[c.status] === 'status-ready' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                   {c.status?.replace('_', ' ')}
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-gray-400 uppercase tracking-widest">{c.category}</span>
                <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest" style={{ background: PRIORITY_COLORS[c.priority] + '20', color: PRIORITY_COLORS[c.priority] }}>{c.priority}</span>
              </div>

              <h4 className="text-lg font-black text-white mb-2 group-hover:text-green-500 transition-colors">{c.title}</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6 line-clamp-3">{c.description}</p>

              {c.admin_response && (
                <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10 mb-6">
                  <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-2">Resolution Note:</p>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{c.admin_response}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                <span>{new Date(c.created_at).toLocaleDateString()}</span>
                <span className="text-gray-700">Ref: #{c.id.slice(0, 8)}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100]" 
              onClick={() => setShowForm(false)} 
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[101] bg-slate-900 border-t border-white/10 rounded-t-[40px] p-8 max-w-2xl mx-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Initialize Report</h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Fill all mandatory telemetry</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Classification</label>
                  <select 
                    value={form.category} 
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-green-500/50 transition-all"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Subject Header</label>
                  <input 
                    value={form.title} 
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-green-500/50 transition-all" 
                    placeholder="Brief objective" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Telemetry Data (Min 20 Chars)</label>
                  <textarea 
                    value={form.description} 
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-green-500/50 transition-all" 
                    rows={4} 
                    placeholder="Detailed situational report..." 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Priority Protocol</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map(p => (
                      <button 
                        key={p} 
                        onClick={() => setForm(f => ({ ...f, priority: p }))}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          form.priority === p ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/5 text-gray-500'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={submitComplaint} 
                  disabled={submitting} 
                  className="w-full py-5 rounded-[28px] bg-green-600 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-green-500 transition-all shadow-xl shadow-green-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Transmitting...' : 'Upload to Core Matrix'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}

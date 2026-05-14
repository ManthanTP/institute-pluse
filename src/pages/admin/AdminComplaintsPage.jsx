import { useState, useEffect } from 'react'
import { MessageSquare, ShieldAlert, CheckCircle2, Clock, Filter, Search, MoreHorizontal, User, MapPin, ExternalLink, Trash2, X, Send, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [responding, setResponding] = useState(false)

  useEffect(() => {
    fetchComplaints()

    const channel = supabase
      .channel('complaints_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          fetchComplaints()
          toast('New complaint received 📡', { icon: '🔔' })
        } else if (payload.eventType === 'UPDATE') {
          fetchComplaints()
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchComplaints() {
    setLoading(true)
    const { data, error } = await supabase
      .from('complaints')
      .select('*, student:profiles!student_id(full_name, email, department)')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load complaints')
    }
    if (data) setComplaints(data)
    setLoading(false)
  }

  async function updateStatus(id, status) {
    setResponding(true)
    const updateData = { status }
    if (responseText.trim()) {
      updateData.admin_response = responseText.trim()
      updateData.responded_by = (await supabase.auth.getUser()).data.user?.id
    }
    
    const { error } = await supabase.from('complaints').update(updateData).eq('id', id)
    if (!error) {
      toast.success(`Status: ${status.toUpperCase()}`)
      if (selected?.id === id) {
        setSelected({ ...selected, ...updateData })
      }
      setResponseText('')
      fetchComplaints()
    } else {
      toast.error('Update failed: ' + error.message)
    }
    setResponding(false)
  }

  async function deleteComplaint(id) {
    if (!confirm('Delete this complaint permanently?')) return
    const { error } = await supabase.from('complaints').delete().eq('id', id)
    if (!error) {
      toast.success('Complaint removed')
      setSelected(null)
      fetchComplaints()
    }
  }

  const PRIORITY_COLORS = {
    low: { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400' },
    medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-500' },
    high: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500' },
    urgent: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-500' }
  }

  const STATUS_COLORS = {
    open: { dot: 'bg-red-500', shadow: 'shadow-red-500/50' },
    'in-progress': { dot: 'bg-yellow-500', shadow: 'shadow-yellow-500/50' },
    resolved: { dot: 'bg-green-500', shadow: 'shadow-green-500/50' }
  }

  const filtered = filter === 'All' ? complaints : complaints.filter(c => c.status === filter.toLowerCase())

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }

  return (
    <AdminLayout>
      <div className="space-y-6 lg:space-y-8 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <span className="text-[8px] lg:text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Complaint Resolution Hub</span>
            </div>
            <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-none">Complaint <span className="text-red-500">Console</span></h2>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-white', bg: 'bg-white/5' },
            { label: 'Open', value: stats.open, color: 'text-red-500', bg: 'bg-red-500/5' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-500', bg: 'bg-yellow-500/5' },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-500', bg: 'bg-green-500/5' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border border-white/5 rounded-2xl p-4 text-center`}>
              <p className={`text-2xl lg:text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* FILTER TABS */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {['All', 'Open', 'In-Progress', 'Resolved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-white text-slate-950 shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* COMPLAINTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Loading...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                <div className="text-3xl mb-3 opacity-40">📡</div>
                <p className="text-xs font-black text-white uppercase tracking-widest">No Complaints Found</p>
                <p className="text-[9px] text-gray-500 mt-2">Campus environment is stable</p>
              </div>
            ) : filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { setSelected(c); setResponseText(c.admin_response || ''); }}
                className="group bg-white/5 border border-white/10 rounded-2xl lg:rounded-3xl p-5 lg:p-6 backdrop-blur-xl hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Status Dot */}
                <div className="absolute top-4 right-4">
                  <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)] ${STATUS_COLORS[c.status]?.dot || 'bg-gray-500'} ${STATUS_COLORS[c.status]?.shadow || ''}`} />
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[7px] font-black text-gray-500 uppercase tracking-widest">{c.category}</span>
                  {c.priority && (
                    <span className={`px-2.5 py-1 rounded-lg border text-[7px] font-black uppercase tracking-widest ${PRIORITY_COLORS[c.priority]?.bg} ${PRIORITY_COLORS[c.priority]?.border} ${PRIORITY_COLORS[c.priority]?.text}`}>
                      {c.priority}
                    </span>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2 line-clamp-1">{c.title}</h3>
                <p className="text-[10px] font-medium text-gray-500 leading-relaxed mb-4 line-clamp-2">{c.description}</p>

                {/* Informer Info */}
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 border border-white/5 text-[10px] font-black">
                      {c.student?.full_name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-white uppercase tracking-wider truncate">{c.student?.full_name || 'Unknown'}</p>
                      <p className="text-[8px] text-gray-600 truncate">{c.student?.email || ''}</p>
                    </div>
                    <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
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
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60]"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 lg:left-72 bg-[#0d1117] border-t border-white/10 rounded-t-[32px] z-[70] p-5 lg:p-8 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-5" />
              
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Complaint Detail</p>
                    <h2 className="text-base lg:text-lg font-black text-white uppercase tracking-tight line-clamp-1">{selected.title}</h2>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500"><X size={18} /></button>
              </div>

              {/* Informer Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-3">Filed By</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-sm">
                    {selected.student?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">{selected.student?.full_name || 'Unknown Student'}</p>
                    <p className="text-[9px] text-gray-500">{selected.student?.email || 'No email'} • {selected.student?.department || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${PRIORITY_COLORS[selected.priority]?.bg} ${PRIORITY_COLORS[selected.priority]?.border} ${PRIORITY_COLORS[selected.priority]?.text}`}>
                      {selected.priority} priority
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black text-gray-500 uppercase tracking-widest">{selected.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">{new Date(selected.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-white/80 text-xs leading-relaxed">{selected.description}</p>
              </div>

              {/* Admin Response */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-3">Admin Response</p>
                <textarea
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="Write your response to the student..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 outline-none resize-none focus:border-blue-500/50 transition-all"
                />
              </div>

              {/* Status Actions */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => updateStatus(selected.id, 'open')}
                  disabled={responding}
                  className={`py-3.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all disabled:opacity-50 ${selected.status === 'open' ? 'bg-red-600 text-white border-red-600' : 'bg-white/5 text-gray-500 border-white/10 hover:border-red-500/30'}`}
                >
                  Open
                </button>
                <button
                  onClick={() => updateStatus(selected.id, 'in-progress')}
                  disabled={responding}
                  className={`py-3.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all disabled:opacity-50 ${selected.status === 'in-progress' ? 'bg-yellow-500 text-slate-950 border-yellow-500' : 'bg-white/5 text-gray-500 border-white/10 hover:border-yellow-500/30'}`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => updateStatus(selected.id, 'resolved')}
                  disabled={responding}
                  className={`py-3.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all disabled:opacity-50 ${selected.status === 'resolved' ? 'bg-green-600 text-white border-green-600' : 'bg-white/5 text-gray-500 border-white/10 hover:border-green-500/30'}`}
                >
                  Resolved
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteComplaint(selected.id)}
                className="w-full py-3 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Delete Complaint
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

import { useState, useEffect } from 'react'
import { MessageSquare, CheckCheck, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import toast from 'react-hot-toast'

const PRIORITY_COLORS = { low: '#64748b', medium: '#f59e0b', high: '#ef4444', urgent: '#7f1d1d' }
const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [filter, setFilter] = useState('open')
  const [selected, setSelected] = useState(null)
  const [response, setResponse] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => { fetchComplaints() }, [filter])

  async function fetchComplaints() {
    const query = filter === 'all'
      ? supabase.from('complaints').select('*, profiles(full_name, department)').order('created_at', { ascending: false })
      : supabase.from('complaints').select('*, profiles(full_name, department)').eq('status', filter).order('created_at', { ascending: false })

    const { data } = await query
    setComplaints(data || [])
  }

  async function updateComplaint(id, updates) {
    setUpdating(true)
    const { error } = await supabase.from('complaints').update(updates).eq('id', id)
    if (!error) { toast.success('Complaint updated!'); fetchComplaints(); setSelected(null) }
    else toast.error('Update failed')
    setUpdating(false)
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-black text-gray-900 mb-4">🧾 Complaint Management</h2>

        {/* STATUS FILTER */}
        <div className="flex gap-2 mb-4">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={{ background: filter === s ? '#16a34a' : '#f8fafc', color: filter === s ? 'white' : '#64748b', border: '1px solid #e2e8f0' }}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* COMPLAINTS LIST */}
        {complaints.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <CheckCheck size={40} className="mx-auto mb-3 text-green-400" />
            <p className="font-semibold">All {filter} complaints resolved! 🌿</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {complaints.map((c, i) => (
              <div key={c.id} className="card p-4 animate-fade-in-up cursor-pointer hover:scale-[1.005] transition-transform"
                style={{ animationDelay: `${i * 0.05}s`, borderLeft: `4px solid ${PRIORITY_COLORS[c.priority] || '#94a3b8'}` }}
                onClick={() => { setSelected(c); setResponse(c.admin_response || '') }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-1 flex-wrap">
                      <span className="badge-chip text-xs">{c.category}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: PRIORITY_COLORS[c.priority] + '20', color: PRIORITY_COLORS[c.priority] }}>
                        {c.priority}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900">{c.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">by {c.profiles?.full_name || 'Unknown'} · {c.profiles?.department}</p>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{c.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`status-badge ${c.status === 'open' ? 'status-open' : c.status === 'in_progress' ? 'status-in-progress' : c.status === 'resolved' ? 'status-ready' : 'status-closed'}`}>
                      {c.status?.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLAINT DETAIL MODAL */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelected(null)} />
          <div className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white rounded-t-3xl md:rounded-2xl md:max-w-lg w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{selected.title}</h3>
              <button onClick={() => setSelected(null)}><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="badge-chip">{selected.category}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: PRIORITY_COLORS[selected.priority] + '20', color: PRIORITY_COLORS[selected.priority] }}>
                {selected.priority}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{selected.description}</p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Update Status</label>
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => updateComplaint(selected.id, { status: s })}
                    className="text-xs px-3 py-1.5 rounded-lg capitalize font-semibold transition-all"
                    style={{ background: selected.status === s ? '#16a34a' : '#f8fafc', color: selected.status === s ? 'white' : '#64748b', border: '1px solid #e2e8f0' }}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Admin Response</label>
              <textarea value={response} onChange={e => setResponse(e.target.value)}
                className="input-field text-sm" rows={3} placeholder="Type your response..." />
            </div>

            <button onClick={() => updateComplaint(selected.id, { admin_response: response, status: 'in_progress' })}
              disabled={updating} className="btn-primary w-full text-sm">
              {updating ? <span className="spinner" /> : '💬 Send Response'}
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  )
}

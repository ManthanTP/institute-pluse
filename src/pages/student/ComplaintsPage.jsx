import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import BottomTabBar from '../../components/BottomTabBar'
import toast from 'react-hot-toast'

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
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: '80px' }}>
      <header className="app-header">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <span className="font-bold text-white">🧾 My Complaints</span>
        <button onClick={() => setShowForm(true)} className="text-white p-1"><Plus size={22} /></button>
      </header>

      <div className="page-container pt-4">
        {complaints.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold text-gray-600">No complaints yet</p>
            <p className="text-sm mt-1">Tap + to submit a new complaint</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">Submit Complaint</button>
          </div>
        ) : (
          complaints.map((c, i) => (
            <div key={c.id} className="card p-4 mb-3 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.07}s`, borderLeft: `4px solid ${PRIORITY_COLORS[c.priority] || '#94a3b8'}` }}>
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex gap-2 mb-1">
                    <span className="badge-chip text-xs">{c.category}</span>
                    <span className="status-badge text-xs" style={{ background: PRIORITY_COLORS[c.priority] + '20', color: PRIORITY_COLORS[c.priority] }}>{c.priority}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900">{c.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>
                </div>
                <span className={`status-badge flex-shrink-0 ${STATUS_MAP[c.status] || 'status-open'}`}>{c.status?.replace('_', ' ')}</span>
              </div>
              {c.admin_response && (
                <div className="mt-2 p-2 rounded-lg text-xs" style={{ background: '#f0fdf4' }}>
                  <p className="font-semibold text-green-700">Admin Response:</p>
                  <p className="text-gray-700 mt-0.5">{c.admin_response}</p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">{new Date(c.created_at).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowForm(false)} />
          <div className="bottom-sheet" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">New Complaint</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c === 'sustainability' ? '🌱 Sustainability' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field text-sm" placeholder="Brief title" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description (min 20 chars)</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input-field text-sm" rows={4} placeholder="Describe the issue in detail..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
                      style={{ background: form.priority === p ? PRIORITY_COLORS[p] : '#f8fafc', color: form.priority === p ? 'white' : '#64748b', border: '1px solid #e2e8f0' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={submitComplaint} disabled={submitting} className="btn-primary w-full mt-2">
                {submitting ? <span className="spinner" /> : '📤 Submit Complaint'}
              </button>
            </div>
          </div>
        </>
      )}

      <BottomTabBar />
    </div>
  )
}

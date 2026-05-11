import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, X, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import BottomTabBar from '../../components/BottomTabBar'
import toast from 'react-hot-toast'

const DEMO_ITEMS = [
  { id: '1', type: 'lost', item_name: 'Blue Water Bottle', description: 'Nalgene bottle with stickers', location_found: 'Library', status: 'open', created_at: new Date().toISOString(), verified: true },
  { id: '2', type: 'found', item_name: 'Black Wallet', description: 'Found near canteen, has student ID inside', location_found: 'Canteen', status: 'open', created_at: new Date().toISOString(), verified: true },
  { id: '3', type: 'lost', item_name: 'Earphones', description: 'JBL earphones, white, left in lab', location_found: 'CS Lab 3', status: 'claimed', created_at: new Date().toISOString(), verified: false },
]

const FILTER_TABS = ['All', 'Lost', 'Found', 'Resolved']

export default function LostFoundPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [items, setItems] = useState(DEMO_ITEMS)
  const [filterTab, setFilterTab] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState('lost')
  const [form, setForm] = useState({ type: 'lost', item_name: '', description: '', location_found: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('lost_found_items').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data?.length) setItems(data) })
  }, [])

  const filtered = filterTab === 'All' ? items : items.filter(i => i.type === filterTab.toLowerCase() || i.status === filterTab.toLowerCase())

  async function submitItem() {
    if (!form.item_name || !form.description) { toast.error('Fill all fields'); return }
    setSubmitting(true)
    const { error } = await supabase.from('lost_found_items').insert({
      reported_by: profile.id, ...form, status: 'open', verified: false
    })
    if (error) toast.error('Failed to submit')
    else {
      toast.success(`${form.type === 'lost' ? 'Lost item reported' : 'Found item reported!'} +8 eco-points 🌿`)
      setShowForm(false)
      supabase.from('lost_found_items').select('*').order('created_at', { ascending: false })
        .then(({ data }) => { if (data?.length) setItems(data) })
    }
    setSubmitting(false)
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: '80px' }}>
      <header className="app-header">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <span className="font-bold text-white">🔍 Lost & Found</span>
        <button onClick={() => setShowForm(true)} className="text-white p-1"><Plus size={22} /></button>
      </header>

      <div className="px-4 pt-4 pb-2 flex gap-2">
        <button onClick={() => { setFormType('lost'); setForm(f => ({ ...f, type: 'lost' })); setShowForm(true) }}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: '#fee2e2', color: '#991b1b' }}>
          📢 Report Lost
        </button>
        <button onClick={() => { setFormType('found'); setForm(f => ({ ...f, type: 'found' })); setShowForm(true) }}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: '#dcfce7', color: '#166534' }}>
          🙌 Report Found
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
        {FILTER_TABS.map(t => (
          <button key={t} onClick={() => setFilterTab(t)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={{ background: filterTab === t ? '#16a34a' : '#f0fdf4', color: filterTab === t ? 'white' : '#16a34a' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="page-container">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item, i) => (
            <div key={item.id} className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="h-24 flex items-center justify-center text-4xl"
                style={{ background: item.type === 'lost' ? '#fef2f2' : '#f0fdf4' }}>
                {item.type === 'lost' ? '😢' : '🙌'}
              </div>
              <div className="p-3">
                <div className="flex gap-1 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: item.type === 'lost' ? '#fee2e2' : '#dcfce7', color: item.type === 'lost' ? '#991b1b' : '#166534' }}>
                    {item.type}
                  </span>
                  {item.verified && <span className="badge-chip text-xs py-0 px-1.5" style={{ fontSize: '9px' }}>✓ Verified</span>}
                </div>
                <p className="font-semibold text-xs text-gray-900">{item.item_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.location_found}</p>
                <p className="text-xs text-gray-300 mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-3 mt-4" style={{ background: '#f0fdf4' }}>
          <p className="text-xs text-green-700">♻️ Returning found items reduces waste and promotes campus sustainability. +8 eco-points for reporting! 🌿</p>
        </div>
      </div>

      {showForm && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowForm(false)} />
          <div className="bottom-sheet" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{form.type === 'lost' ? '📢 Report Lost Item' : '🙌 Report Found Item'}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="flex gap-2 mb-4">
              {['lost', 'found'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                  style={{ background: form.type === t ? (t === 'lost' ? '#fee2e2' : '#dcfce7') : '#f8fafc', color: form.type === t ? (t === 'lost' ? '#991b1b' : '#166534') : '#94a3b8', border: '1px solid #e2e8f0' }}>
                  {t === 'lost' ? '😢 Lost' : '🙌 Found'}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <input value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} className="input-field text-sm" placeholder="Item name *" />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field text-sm" rows={3} placeholder="Description *" />
              <input value={form.location_found} onChange={e => setForm(f => ({ ...f, location_found: e.target.value }))} className="input-field text-sm" placeholder="Location found/lost" />
              <button onClick={submitItem} disabled={submitting} className="btn-primary w-full">
                {submitting ? <span className="spinner" /> : '📤 Submit Report'}
              </button>
            </div>
          </div>
        </>
      )}

      <BottomTabBar />
    </div>
  )
}

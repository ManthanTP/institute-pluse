import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'Civil', 'MBA']
const PIE_COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#0e7490', '#92400e']

const MOCK_DEPT_DATA = DEPARTMENTS.map((dept, i) => ({
  dept,
  avg_co2: (2.5 + i * 0.3).toFixed(2),
  avg_score: 85 - i * 4,
  students: 200 + i * 50,
}))

const MOCK_TRANSPORT = [
  { name: 'College Bus', value: 42, color: '#16a34a' },
  { name: 'Motorbike', value: 28, color: '#f59e0b' },
  { name: 'Walking/Cycle', value: 18, color: '#22c55e' },
  { name: 'Car (Solo)', value: 8, color: '#ef4444' },
  { name: 'Other', value: 4, color: '#94a3b8' },
]

const MOCK_WEEKLY = [
  { day: 'Mon', co2: 3.2 }, { day: 'Tue', co2: 2.9 }, { day: 'Wed', co2: 3.4 },
  { day: 'Thu', co2: 2.8 }, { day: 'Fri', co2: 3.1 }, { day: 'Sat', co2: 2.5 }, { day: 'Sun', co2: 2.2 },
]

export default function AdminSustainabilityPage() {
  const [period, setPeriod] = useState('week')
  const [totalKgSaved, setTotalKgSaved] = useState(2847)
  const [challenges, setChallenges] = useState([])
  const [showAddChallenge, setShowAddChallenge] = useState(false)
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', category: 'transport', points_reward: 50, duration_days: 7 })

  useEffect(() => {
    supabase.from('green_challenges').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setChallenges(data || []))
  }, [])

  async function createChallenge() {
    const { error } = await supabase.from('green_challenges').insert({
      ...newChallenge,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + newChallenge.duration_days * 86400000).toISOString().split('T')[0],
      status: 'active',
    })
    if (!error) {
      supabase.from('green_challenges').select('*').then(({ data }) => setChallenges(data || []))
      setShowAddChallenge(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">Sustainability Analytics 🌿</h2>
            <p className="text-gray-500 text-sm">Campus carbon footprint overview</p>
          </div>
          <div className="flex gap-2">
            {['week', 'month', '3m'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: period === p ? '#16a34a' : '#f8fafc', color: period === p ? 'white' : '#64748b', border: '1px solid #e2e8f0' }}>
                {p === 'week' ? '7D' : p === 'month' ? '30D' : '90D'}
              </button>
            ))}
          </div>
        </div>

        {/* CAMPUS TOTAL SAVED */}
        <div className="card p-5 mb-4 gradient-eco text-white text-center">
          <p className="text-sm font-medium text-green-100 mb-1">Campus Total CO2 Tracked This Semester</p>
          <p className="text-5xl font-black mb-1">{(totalKgSaved / 1000).toFixed(2)} tonnes</p>
          <p className="text-sm text-green-200">Avg {(totalKgSaved / 1240 / 120).toFixed(2)} kg CO2/day per student → Target: 5 kg/day</p>
        </div>

        {/* DEPT COMPARISON */}
        <div className="card p-4 mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">🏫 Department Avg CO2 (kg/day)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_DEPT_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [`${v} kg`, 'Avg CO2']} />
              <Bar dataKey="avg_co2" fill="#16a34a" radius={[4, 4, 0, 0]}>
                {MOCK_DEPT_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TRANSPORT MODE PIE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">🚗 Transport Mode Distribution</h3>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width="50%" height={150}>
                <PieChart>
                  <Pie data={MOCK_TRANSPORT} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value">
                    {MOCK_TRANSPORT.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={v => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1">
                {MOCK_TRANSPORT.map(t => (
                  <div key={t.name} className="flex items-center gap-2 mb-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                    <span className="text-xs text-gray-600 flex-1">{t.name}</span>
                    <span className="text-xs font-bold">{t.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">📈 Campus CO2 Trend</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={MOCK_WEEKLY}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[2, 4]} />
                <Tooltip formatter={v => [`${v} kg`, 'Avg CO2']} />
                <Line type="monotone" dataKey="co2" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GREEN CHALLENGES */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">🎯 Green Challenges</h3>
            <button onClick={() => setShowAddChallenge(!showAddChallenge)} className="btn-primary py-1.5 px-3 text-xs">
              + New Challenge
            </button>
          </div>

          {showAddChallenge && (
            <div className="p-4 rounded-xl mb-4" style={{ background: '#f0fdf4', border: '1.5px solid #86efac' }}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input value={newChallenge.title} onChange={e => setNewChallenge(c => ({ ...c, title: e.target.value }))}
                  className="input-field text-sm col-span-2" placeholder="Challenge title" />
                <textarea value={newChallenge.description} onChange={e => setNewChallenge(c => ({ ...c, description: e.target.value }))}
                  className="input-field text-sm col-span-2" rows={2} placeholder="Description" />
                <select value={newChallenge.category} onChange={e => setNewChallenge(c => ({ ...c, category: e.target.value }))}
                  className="input-field text-sm">
                  {['transport', 'food', 'electricity', 'water', 'waste'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input type="number" value={newChallenge.points_reward} onChange={e => setNewChallenge(c => ({ ...c, points_reward: parseInt(e.target.value) }))}
                  className="input-field text-sm" placeholder="Points reward" />
              </div>
              <button onClick={createChallenge} className="btn-primary w-full text-sm">Create Challenge</button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {challenges.length === 0 ? (
              <p className="text-xs text-gray-400">No challenges yet. Create your first green challenge!</p>
            ) : challenges.map(ch => (
              <div key={ch.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{ch.title}</p>
                  <p className="text-xs text-gray-400">{ch.category} · +{ch.points_reward} pts · {ch.duration_days} days</p>
                </div>
                <span className="status-badge status-on-route text-xs">{ch.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

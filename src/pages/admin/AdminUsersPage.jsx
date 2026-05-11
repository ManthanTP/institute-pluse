import { useState, useEffect } from 'react'
import { Search, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { format } from 'date-fns'

const DEMO_USERS = [
  { id: '1', full_name: 'Arjun Sharma', department: 'CSE', eco_points: 1240, logging_streak: 15, total_co2_kg: 45.2, role: 'student', created_at: new Date().toISOString() },
  { id: '2', full_name: 'Priya Patel', department: 'ECE', eco_points: 980, logging_streak: 8, total_co2_kg: 38.7, role: 'student', created_at: new Date().toISOString() },
  { id: '3', full_name: 'Rahul Kumar', department: 'ME', eco_points: 1580, logging_streak: 22, total_co2_kg: 52.1, role: 'student', created_at: new Date().toISOString() },
  { id: '4', full_name: 'Sneha Joshi', department: 'MBA', eco_points: 720, logging_streak: 5, total_co2_kg: 28.4, role: 'student', created_at: new Date().toISOString() },
]

const DEPT_FILTER = ['All', 'CSE', 'ECE', 'ME', 'Civil', 'MBA', 'Other']
const ROLE_FILTER = ['All', 'student', 'driver', 'admin']

export default function AdminUsersPage() {
  const [users, setUsers] = useState(DEMO_USERS)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [role, setRole] = useState('All')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setLoading(true)
    supabase.from('profiles').select('*').order('eco_points', { ascending: false })
      .then(({ data }) => { if (data?.length) setUsers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchDept = dept === 'All' || u.department === dept
    const matchRole = role === 'All' || u.role === role
    return matchSearch && matchDept && matchRole
  })

  async function changeRole(userId, newRole) {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">User Management 👥</h2>
            <p className="text-gray-500 text-sm">{filtered.length} users</p>
          </div>
          <button className="btn-ghost text-sm py-2 px-4 flex items-center gap-2">
            <Download size={15} /> Export
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 text-sm py-2" placeholder="Search users..." />
          </div>
          <select value={dept} onChange={e => setDept(e.target.value)} className="input-field text-sm py-2 w-auto">
            {DEPT_FILTER.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={role} onChange={e => setRole(e.target.value)} className="input-field text-sm py-2 w-auto">
            {ROLE_FILTER.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* TABLE */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  {['Name', 'Dept', 'Role', 'Eco Points', 'Streak', 'Total CO2', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-8 text-center text-gray-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-8 text-center text-gray-400">No users found</td></tr>
                ) : filtered.map((user, i) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full gradient-eco flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {user.full_name?.[0] || '?'}
                        </div>
                        <span className="font-medium text-gray-900">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.department}</td>
                    <td className="px-4 py-3">
                      <select value={user.role} onChange={e => changeRole(user.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg border"
                        style={{ borderColor: '#e2e8f0', outline: 'none', background: 'white' }}>
                        <option value="student">Student</option>
                        <option value="driver">Driver</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-bold text-green-700">{(user.eco_points || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-orange-500">🔥 {user.logging_streak || 0}d</td>
                    <td className="px-4 py-3 text-gray-600">{(user.total_co2_kg || 0).toFixed(1)} kg</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{user.created_at ? format(new Date(user.created_at), 'MMM d, yy') : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(user)} className="text-xs font-semibold px-2 py-1 rounded" style={{ color: '#16a34a', background: '#f0fdf4' }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* USER DETAIL DRAWER */}
        {selected && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelected(null)} />
            <div className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 p-6 shadow-2xl overflow-y-auto" style={{ animation: 'slideInRight 0.3s ease' }}>
              <button onClick={() => setSelected(null)} className="text-gray-400 mb-4">✕ Close</button>
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full gradient-eco flex items-center justify-center text-2xl font-black text-white mx-auto mb-2">
                  {selected.full_name?.[0] || '?'}
                </div>
                <h3 className="font-bold text-gray-900">{selected.full_name}</h3>
                <p className="text-sm text-gray-500">{selected.role} · {selected.department}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Eco Points', value: selected.eco_points || 0 },
                  { label: 'Streak', value: `🔥 ${selected.logging_streak || 0}d` },
                  { label: 'Total CO2', value: `${(selected.total_co2_kg || 0).toFixed(1)} kg` },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: '#f8fafc' }}>
                    <p className="text-lg font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

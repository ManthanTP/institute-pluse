import { useState, useEffect } from 'react'
import { Users, Leaf, Bus, TrendingDown, Award, ShoppingCart, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'

const MOCK_STATS = {
  totalStudents: 1240,
  todayLogs: 847,
  avgEcoScore: 73,
  campusAvgCo2: 3.1,
  activeChallengers: 320,
  pendingOrders: 12,
  openComplaints: 8,
  busesOnRoute: 3,
}

const MOCK_TREND = [
  { day: 'Mon', co2: 3.2, score: 71, logs: 820 },
  { day: 'Tue', co2: 2.9, score: 75, logs: 850 },
  { day: 'Wed', co2: 3.4, score: 68, logs: 780 },
  { day: 'Thu', co2: 2.8, score: 78, logs: 900 },
  { day: 'Fri', co2: 3.1, score: 73, logs: 847 },
  { day: 'Sat', co2: 2.5, score: 82, logs: 620 },
  { day: 'Sun', co2: 2.2, score: 86, logs: 540 },
]

function StatCard({ icon: Icon, label, value, sub, color = '#16a34a' }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + '15' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-xl font-black text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(MOCK_STATS)
  const [todayLogs, setTodayLogs] = useState([])
  const [recentComplaints, setRecentComplaints] = useState([])

  useEffect(() => {
    async function fetchData() {
      const today = new Date().toISOString().split('T')[0]

      const [logsRes, complaintsRes] = await Promise.all([
        supabase.from('carbon_logs').select('id, total_kg, eco_score, log_date').eq('log_date', today).order('created_at', { ascending: false }).limit(5),
        supabase.from('complaints').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(5),
      ])

      if (logsRes.data?.length) setTodayLogs(logsRes.data)
      if (complaintsRes.data?.length) setRecentComplaints(complaintsRes.data)
    }
    fetchData()
  }, [])

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* GREETING */}
        <div className="mb-6">
          <h2 className="text-xl font-black text-gray-900">Campus Overview 🌿</h2>
          <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* STAT GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Users} label="Total Students" value={stats.totalStudents.toLocaleString()} color="#16a34a" />
          <StatCard icon={Leaf} label="Today's Logs" value={stats.todayLogs} sub={`Avg score: ${stats.avgEcoScore}/100`} color="#22c55e" />
          <StatCard icon={TrendingDown} label="Campus Avg CO2" value={`${stats.campusAvgCo2} kg`} sub="daily per student" color="#0ea5e9" />
          <StatCard icon={Bus} label="Buses On Route" value={`${stats.busesOnRoute}/4`} color="#f59e0b" />
          <StatCard icon={Award} label="Active Challengers" value={stats.activeChallengers} color="#a855f7" />
          <StatCard icon={ShoppingCart} label="Pending Orders" value={stats.pendingOrders} color="#f97316" />
          <StatCard icon={AlertCircle} label="Open Complaints" value={stats.openComplaints} color="#ef4444" />
          <StatCard icon={Leaf} label="Target Budget" value="5 kg/day" sub="per student" color="#166534" />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">📊 Avg CO2 — 7 Days</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={MOCK_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[2, 4]} />
                <Tooltip formatter={v => [`${v} kg`, 'Avg CO2']} />
                <Line type="monotone" dataKey="co2" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">📈 Daily Logs Count</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={MOCK_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => [v, 'Logs']} />
                <Bar dataKey="logs" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT COMPLAINTS */}
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">🧾 Open Complaints</h3>
            <a href="/admin/complaints" className="text-xs font-semibold" style={{ color: '#16a34a' }}>View all →</a>
          </div>
          {recentComplaints.length === 0 ? (
            <p className="text-xs text-gray-400">No open complaints. Great campus management! 🌿</p>
          ) : (
            recentComplaints.map(c => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-2 h-2 rounded-full" style={{ background: c.priority === 'urgent' ? '#ef4444' : c.priority === 'high' ? '#f59e0b' : '#22c55e' }} />
                <p className="text-sm text-gray-700 flex-1 truncate">{c.title}</p>
                <span className="text-xs text-gray-400">{c.category}</span>
              </div>
            ))
          )}
        </div>

        {/* TODAY'S TOP LOGS */}
        <div className="card p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">🌱 Today's Carbon Logs (Preview)</h3>
          {todayLogs.length === 0 ? (
            <p className="text-xs text-gray-400">No logs yet today. Encourage students to log! 🌿</p>
          ) : (
            todayLogs.map(log => (
              <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: log.eco_score >= 80 ? '#16a34a' : log.eco_score >= 60 ? '#f59e0b' : '#ef4444' }}>
                  {log.eco_score}
                </div>
                <p className="text-sm text-gray-700">{log.total_kg?.toFixed(2)} kg CO2</p>
                <span className="text-xs text-gray-400 ml-auto">{log.log_date}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

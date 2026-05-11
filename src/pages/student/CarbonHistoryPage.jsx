import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ReferenceLine, Legend } from 'recharts'
import { format, subDays } from 'date-fns'
import { useAuthStore, useCarbonStore } from '../../store/index'
import { getScoreGrade } from '../../lib/carbonCalc'
import EcoScoreRing from '../../components/EcoScoreRing'
import BottomTabBar from '../../components/BottomTabBar'

const PERIODS = ['Week', 'Month', '3 Months']
const PIE_COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#0e7490', '#92400e']
const CATEGORIES = ['transport_kg', 'electricity_kg', 'food_kg', 'water_kg', 'waste_kg']
const CAT_LABELS = ['Transport', 'Electricity', 'Food', 'Water', 'Waste']
const CAT_EMOJIS = ['🚗', '⚡', '🍽️', '💧', '🗑️']

export default function CarbonHistoryPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { history, fetchHistory, loading } = useCarbonStore()
  const [period, setPeriod] = useState(0)
  const [campusAvg] = useState(3.1)

  useEffect(() => {
    if (profile?.id) {
      const days = [7, 30, 90][period]
      fetchHistory(profile.id, days)
    }
  }, [profile?.id, period])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
        <div className="spinner spinner-green" />
      </div>
    )
  }

  const sorted = [...history].sort((a, b) => new Date(a.log_date) - new Date(b.log_date))

  const trendData = sorted.map(d => ({
    date: format(new Date(d.log_date), 'MMM d'),
    yours: parseFloat(d.total_kg?.toFixed(2) || 0),
    campus: campusAvg,
  }))

  const scoreData = sorted.map(d => ({
    date: format(new Date(d.log_date), 'MMM d'),
    score: d.eco_score || 0,
    fill: getScoreGrade(d.eco_score || 0).color,
  }))

  const totalKg = history.reduce((t, d) => t + (d.total_kg || 0), 0)
  const avgDaily = history.length ? totalKg / history.length : 0
  const bestScore = history.length ? Math.max(...history.map(d => d.eco_score || 0)) : 0
  const totalPoints = history.reduce((t, d) => t + (d.eco_points_earned || 0), 0)

  const pieData = CATEGORIES.map((cat, i) => ({
    name: CAT_LABELS[i],
    value: parseFloat(history.reduce((t, d) => t + (d[cat] || 0), 0).toFixed(2)),
    emoji: CAT_EMOJIS[i],
  })).filter(d => d.value > 0)

  const vsAvg = avgDaily - campusAvg

  return (
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: '80px' }}>
      <header className="app-header">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <span className="font-bold text-white">📊 Carbon Analytics</span>
        <div />
      </header>

      <div className="page-container pt-4">
        {/* PERIOD TABS */}
        <div className="flex gap-2 mb-4">
          {PERIODS.map((p, i) => (
            <button key={p} onClick={() => setPeriod(i)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: period === i ? '#16a34a' : 'white',
                color: period === i ? 'white' : '#64748b',
                border: `1.5px solid ${period === i ? '#16a34a' : '#e2e8f0'}`,
              }}>
              {p}
            </button>
          ))}
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Total CO2', value: `${totalKg.toFixed(1)} kg`, emoji: '🌍' },
            { label: 'Avg Daily', value: `${avgDaily.toFixed(2)} kg`, emoji: '📉' },
            { label: 'Best Score', value: `${bestScore}/100`, emoji: '🏆' },
            { label: 'Points Earned', value: `${totalPoints} pts`, emoji: '⭐' },
          ].map((s, i) => (
            <div key={s.label} className="card p-3 animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-center gap-2 mb-1">
                <span>{s.emoji}</span>
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* LINE CHART */}
        {trendData.length > 0 && (
          <div className="card p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">📈 CO2 Trend</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(v, n) => [`${v} kg`, n === 'yours' ? 'Your CO2' : 'Campus Avg']}
                />
                <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '5kg target', fontSize: 10, fill: '#f59e0b' }} />
                <Line type="monotone" dataKey="yours" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', r: 3 }} name="yours" />
                <Line type="monotone" dataKey="campus" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="campus" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* PIE CHART */}
        {pieData.length > 0 && (
          <div className="card p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">🥧 Category Breakdown</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} kg`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 mb-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-gray-600">{d.emoji} {d.name}</span>
                    <span className="text-xs font-bold text-gray-800 ml-auto">{d.value}kg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* COMPARISON */}
        <div className="card p-4 mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">📊 You vs Campus Average</h3>
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>You: {avgDaily.toFixed(2)} kg/day</span>
                <span>Campus: {campusAvg} kg/day</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16">You</span>
                  <div className="flex-1 progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(100, (avgDaily / 6) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-green-700 w-14">{avgDaily.toFixed(2)} kg</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16">Campus</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: '#e2e8f0' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (campusAvg / 6) * 100)}%`, background: '#94a3b8' }} />
                  </div>
                  <span className="text-xs font-bold text-gray-500 w-14">{campusAvg} kg</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: vsAvg < 0 ? '#f0fdf4' : '#fef2f2' }}>
              {vsAvg < 0 ? <TrendingDown size={16} className="text-green-600" /> : <TrendingUp size={16} className="text-red-500" />}
              <p className="text-xs font-medium" style={{ color: vsAvg < 0 ? '#166534' : '#991b1b' }}>
                {vsAvg < 0
                  ? `You emit ${Math.abs(vsAvg).toFixed(2)} kg/day less than campus average. Great work! 🌿`
                  : `You emit ${vsAvg.toFixed(2)} kg/day more than campus average. Try reducing transport & food CO2.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* ECO SCORE BAR CHART */}
        {scoreData.length > 0 && (
          <div className="card p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">🏅 Eco Score History</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={scoreData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip formatter={(v) => [`${v}/100`, 'Score']} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {scoreData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* DAILY LOG ACCORDION */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">📅 Daily Logs</h3>
          {history.length === 0 ? (
            <div className="card p-6 text-center text-gray-400">
              <p className="text-3xl mb-2">🌱</p>
              <p className="text-sm">No logs yet. Start tracking your carbon today!</p>
            </div>
          ) : (
            history.map(log => {
              const { grade, color } = getScoreGrade(log.eco_score || 0)
              return (
                <div key={log.id} className="card p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{format(new Date(log.log_date), 'MMMM d, yyyy')}</p>
                      <p className="text-xs text-gray-500">{log.total_kg?.toFixed(2)} kg CO2 · +{log.eco_points_earned} pts</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black" style={{ color }}>{log.eco_score}</div>
                      <div className="text-xs" style={{ color }}>{grade}</div>
                    </div>
                  </div>
                  {log.ai_tips && log.ai_tips.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">AI Tip: {log.ai_tips[0]}</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      <BottomTabBar />
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { ShoppingBag, Utensils, TrendingUp, Clock, Scan, BarChart2, Users, CreditCard, Star, ArrowUpRight, Package, DollarSign, RefreshCw, CalendarDays } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import OwnerLayout from './OwnerLayout'
import OrderScannerModal from '../../components/OrderScannerModal'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

// ─── Sample fallback data ─────────────────────────────────────────────────────


const PERIOD_TABS = [
  { id: 'weekly',  label: '7 Days' },
  { id: 'monthly', label: 'Month'  },
  { id: 'yearly',  label: 'Year'   },
]

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a2030] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl min-w-[110px]">
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-black text-orange-400">₹{payload[0]?.value?.toLocaleString()}</p>
        {payload[1] && <p className="text-[10px] font-black text-blue-400">{payload[1].value} orders</p>}
      </div>
    )
  }
  return null
}

// ─── Period selector pill ─────────────────────────────────────────────────────
function PeriodSelector({ value, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl">
      {PERIOD_TABS.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
            value === t.id
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
              : 'text-gray-500 hover:text-white'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Helper: group real orders into weekly / monthly / yearly buckets ─────────
function groupOrders(allOrders, period) {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  if (period === 'weekly') {
    const map = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const lbl = DAY_LABELS[d.getDay()]
      map[lbl] = { label: lbl, revenue: 0, orders: 0 }
    }
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 6)
    allOrders.filter(o => new Date(o.created_at) >= cutoff).forEach(o => {
      const lbl = DAY_LABELS[new Date(o.created_at).getDay()]
      if (map[lbl]) { map[lbl].revenue += (o.total_price || 0); map[lbl].orders += 1 }
    })
    return Object.values(map)
  }

  if (period === 'monthly') {
    // Group last 28 days into 4 weeks
    const weeks = [
      { label: 'Wk 1', revenue: 0, orders: 0 },
      { label: 'Wk 2', revenue: 0, orders: 0 },
      { label: 'Wk 3', revenue: 0, orders: 0 },
      { label: 'Wk 4', revenue: 0, orders: 0 },
    ]
    const now = Date.now()
    allOrders.forEach(o => {
      const diff = Math.floor((now - new Date(o.created_at)) / (1000 * 60 * 60 * 24))
      const wk = Math.min(3, Math.floor(diff / 7))
      const idx = 3 - wk  // most recent = Wk 4
      if (idx >= 0) { weeks[idx].revenue += (o.total_price || 0); weeks[idx].orders += 1 }
    })
    return weeks
  }

  if (period === 'yearly') {
    const map = {}
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      const lbl = MONTH_LABELS[d.getMonth()]
      map[lbl] = { label: lbl, revenue: 0, orders: 0 }
    }
    const cutoff = new Date(); cutoff.setFullYear(cutoff.getFullYear() - 1)
    allOrders.filter(o => new Date(o.created_at) >= cutoff).forEach(o => {
      const lbl = MONTH_LABELS[new Date(o.created_at).getMonth()]
      if (map[lbl]) { map[lbl].revenue += (o.total_price || 0); map[lbl].orders += 1 }
    })
    return Object.values(map)
  }

  return []
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const [activeTab, setActiveTab]       = useState('today')
  const [trendPeriod, setTrendPeriod]   = useState('weekly')
  const [todayStats, setTodayStats]     = useState(null)
  const [overallStats, setOverallStats] = useState(null)
  const [allOrders, setAllOrders]       = useState([])
  const [topItems, setTopItems]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [usingSample, setUsingSample]   = useState(false)

  useEffect(() => { fetchAllStats() }, [])

  // Recompute chart data whenever allOrders or trendPeriod changes
  const trendData = useMemo(() => {
    if (allOrders.length === 0) return []
    return groupOrders(allOrders, trendPeriod)
  }, [allOrders, trendPeriod, usingSample])

  async function fetchAllStats() {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data: todayOrders } = await supabase.from('orders').select('*').gte('created_at', today)
      const { data: orders }      = await supabase.from('orders').select('*')

      const hasReal = orders && orders.length > 0

      if (hasReal) {
        setUsingSample(false)
        setAllOrders(orders)

        // Today
        const todaySales = (todayOrders || []).reduce((s, o) => s + (o.total_price || 0), 0)
        const pending    = (todayOrders || []).filter(o => o.status === 'pending' || o.status === 'preparing').length
        
        const todayItemMap = {}
        ;(todayOrders || []).forEach(o => (o.items || []).forEach(item => {
          if (!todayItemMap[item.name]) todayItemMap[item.name] = { count: 0 }
          todayItemMap[item.name].count += (item.quantity || 1)
        }))
        const todaySorted = Object.entries(todayItemMap).sort((a, b) => b[1].count - a[1].count)
        const todayTopItem = todaySorted.length > 0 ? todaySorted[0][0] : '—'

        setTodayStats({ totalOrders: (todayOrders || []).length, pendingOrders: pending, totalSales: todaySales.toFixed(2), popularItem: todayTopItem })

        // Overall
        const totalRev      = orders.reduce((s, o) => s + (o.total_price || 0), 0)
        const uniqueStudents = new Set(orders.map(o => o.student_id)).size
        const avgVal        = orders.length > 0 ? totalRev / orders.length : 0
        const studentDays   = {}
        orders.forEach(o => {
          if (!studentDays[o.student_id]) studentDays[o.student_id] = new Set()
          studentDays[o.student_id].add(new Date(o.created_at).toDateString())
        })
        const returnCust = Object.values(studentDays).filter(s => s.size > 1).length
        
        // Top items
        const itemMap = {}
        orders.forEach(o => (o.items || []).forEach(item => {
          if (!itemMap[item.name]) itemMap[item.name] = { count: 0, revenue: 0 }
          itemMap[item.name].count   += (item.quantity || 1)
          itemMap[item.name].revenue += (item.price || 0) * (item.quantity || 1)
        }))
        const sorted = Object.entries(itemMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count).slice(0, 5)
        const overallTopItem = sorted.length > 0 ? sorted[0].name : '—'

        setOverallStats({ totalRevenue: totalRev.toFixed(2), totalOrders: orders.length, avgOrderValue: avgVal.toFixed(2), topItem: overallTopItem, returnCustomers: returnCust, totalCustomers: uniqueStudents })

        setTopItems(sorted)

      } else {
        setUsingSample(true)
        setAllOrders([])
        setTodayStats({ totalOrders: 0, pendingOrders: 0, totalSales: 0, popularItem: "--" })
        setOverallStats({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, topItem: "--", returnCustomers: 0, totalCustomers: 0 })
        setTopItems([])
      }
    } catch (err) {
      console.error(err)
      setUsingSample(true)
      setAllOrders([])
      setTodayStats({ totalOrders: 0, pendingOrders: 0, totalSales: 0, popularItem: "--" })
      setOverallStats({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, topItem: "--", returnCustomers: 0, totalCustomers: 0 })
      setTopItems([])
    }
    setLoading(false)
  }

  // Friendly title per period
  const periodTitle = { weekly: 'Last 7 Days', monthly: 'Last 4 Weeks', yearly: 'Last 12 Months' }

  return (
    <OwnerLayout>
      <div className="space-y-8">

        {/* ── HEADER ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Owner Operations Node</span>
              {usingSample && (
                <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest border border-yellow-500/20">
                  Sample Data
                </span>
              )}
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Dining Telemetry</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAllStats} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all hover:bg-white/10">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setIsScannerOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:scale-105 transition-all">
              <Scan size={18} /> Quick Scan Order
            </button>
          </div>
        </div>

        {/* ── TAB SWITCHER ──────────────────────────────── */}
        <div className="flex gap-3">
          {[['today', '📅 Today'], ['overall', '📊 Overall']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeTab === id
                  ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20'
                  : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ══════════════ TODAY TAB ══════════════ */}
          {activeTab === 'today' ? (
            <motion.div key="today" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

              {/* Stat cards */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[32px] h-24 animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={ShoppingBag} label="Orders Today"    value={todayStats?.totalOrders ?? 0}                                 sub="Total orders placed"   color="#f97316" delay={0}    />
                  <StatCard icon={Clock}        label="Pending Prep"    value={todayStats?.pendingOrders ?? 0}                               sub="Awaiting preparation"  color="#3b82f6" delay={0.05} />
                  <StatCard icon={TrendingUp}   label="Today's Revenue" value={`₹${Number(todayStats?.totalSales || 0).toLocaleString()}`}   sub="Net sales today"       color="#22c55e" delay={0.1}  />
                  <StatCard icon={Star}         label="Hero Item"       value={todayStats?.popularItem || '—'}                               sub="Most ordered today"    color="#a855f7" delay={0.15} />
                </div>
              )}

              {/* Revenue Trend chart */}
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Revenue Trend</p>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{periodTitle[trendPeriod]}</h3>
                  </div>
                  <PeriodSelector value={trendPeriod} onChange={setTrendPeriod} />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={trendPeriod} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <ResponsiveContainer width="100%" height={210}>
                      <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revGradToday" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#f97316" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}    />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="label" tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#4b5563', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#revGradToday)" dot={{ fill: '#f97316', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>
                </AnimatePresence>

                {/* Summary row */}
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-6">
                  <SummaryPill label="Total Revenue" value={`₹${trendData.reduce((s, d) => s + d.revenue, 0).toLocaleString()}`} color="text-orange-400" />
                  <SummaryPill label="Total Orders"  value={trendData.reduce((s, d) => s + d.orders,  0).toLocaleString()} color="text-blue-400"   />
                  <SummaryPill label="Peak Day"      value={trendData.reduce((a, d) => d.revenue > a.revenue ? d : a, trendData[0] || {})?.label || '—'} color="text-green-400" />
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
                  <Utensils size={120} />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => window.location.href = '/owner/cafeteria'} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                      Enter Cafeteria Hub <TrendingUp size={16} />
                    </button>
                    <button onClick={() => setIsScannerOpen(true)} className="px-8 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:scale-105 transition-all flex items-center gap-3">
                      Scan Order QR <Scan size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

          ) : (
          /* ══════════════ OVERALL TAB ══════════════ */
            <motion.div key="overall" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

              {/* Stat cards */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[32px] h-24 animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard icon={DollarSign}   label="Total Revenue"     value={`₹${Number(overallStats?.totalRevenue || 0).toLocaleString()}`}  sub="All-time net revenue"       color="#22c55e" delay={0}    large />
                  <StatCard icon={ShoppingBag}  label="Total Orders"      value={Number(overallStats?.totalOrders || 0).toLocaleString()}          sub="All-time orders placed"     color="#f97316" delay={0.05} large />
                  <StatCard icon={CreditCard}   label="Avg Order Value"   value={`₹${Number(overallStats?.avgOrderValue || 0).toFixed(0)}`}        sub="Per transaction"            color="#3b82f6" delay={0.1}  large />
                  <StatCard icon={Star}         label="Top Selling Item"  value={overallStats?.topItem || '—'}                                     sub="By volume"                  color="#a855f7" delay={0.15} large />
                  <StatCard icon={Users}        label="Unique Customers"  value={overallStats?.totalCustomers ?? 0}                                sub="Students served"            color="#14b8a6" delay={0.2}  large />
                  <StatCard icon={ArrowUpRight} label="Return Rate"       value={`${overallStats?.totalCustomers > 0 ? Math.round((overallStats.returnCustomers / overallStats.totalCustomers) * 100) : 68}%`} sub="Students ordering again" color="#f59e0b" delay={0.25} large />
                </div>
              )}

              {/* Revenue Analytics chart */}
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Revenue Analytics</p>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{periodTitle[trendPeriod]}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <PeriodSelector value={trendPeriod} onChange={setTrendPeriod} />
                    <BarChart2 size={20} className="text-green-500 flex-shrink-0" />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={trendPeriod + '_overall'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="label" tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#4b5563', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill="#22c55e" radius={[8, 8, 0, 0]} maxBarSize={48} />
                        <Bar dataKey="orders"  fill="#3b82f6" radius={[8, 8, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </AnimatePresence>

                {/* Legend + summary */}
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-500" /><span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Revenue</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-500"  /><span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Orders</span></div>
                  </div>
                  <div className="flex gap-6">
                    <SummaryPill label="Period Revenue" value={`₹${trendData.reduce((s, d) => s + d.revenue, 0).toLocaleString()}`} color="text-green-400" />
                    <SummaryPill label="Period Orders"  value={trendData.reduce((s, d) => s + d.orders, 0).toLocaleString()}        color="text-blue-400"  />
                  </div>
                </div>
              </div>

              {/* Top items leaderboard */}
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Item Analytics</p>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Top Selling Items</h3>
                  </div>
                  <Package size={20} className="text-purple-500" />
                </div>
                <div className="space-y-3">
                  {topItems.map((item, i) => {
                    const maxCount = topItems[0]?.count || 1
                    const pct = (item.count / maxCount) * 100
                    return (
                      <div key={item.name} className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-gray-600 w-5 text-center">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-black text-white uppercase tracking-tight truncate">{item.name}</span>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                              <span className="text-[9px] font-black text-gray-500">{item.count} sold</span>
                              <span className="text-[9px] font-black text-green-400">₹{item.revenue?.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="h-full rounded-full"
                              style={{ background: `hsl(${i * 40 + 20}, 80%, 55%)` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <OrderScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onOrderProcessed={fetchAllStats} />
    </OwnerLayout>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, delay = 0, large = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex items-start gap-5 group hover:bg-white/10 transition-all relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={40} style={{ color }} />
      </div>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 flex-shrink-0" style={{ boxShadow: `0 0 20px ${color}20` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-0.5">{label}</p>
        <p className={`font-black text-white tracking-tighter truncate ${large ? 'text-2xl' : 'text-xl'}`}>{value}</p>
        {sub && <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
}

// ─── SummaryPill ──────────────────────────────────────────────────────────────
function SummaryPill({ label, value, color }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-black ${color}`}>{value}</span>
    </div>
  )
}

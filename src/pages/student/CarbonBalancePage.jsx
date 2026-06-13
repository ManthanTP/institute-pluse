import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TreePine, Wind, Scale, TreeDeciduous, Leaf, TrendingUp, TrendingDown, Share2, MessageSquare, Info, ChevronDown, ChevronUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, ReferenceLine
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CO2_ABSORPTION_FACTORS,
  GREEN_COVER_LABELS,
  GREEN_COVER_COLORS,
  GREEN_COVER_EMOJIS,
  calculateTotalAbsorption,
  calculateNetCarbon,
  getNetCarbonStatus,
  getGreenCoverSummary,
  buildPieData,
} from '../../lib/greenCover'
import toast from 'react-hot-toast'

const PIE_COLORS = ['#14532d', '#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac']

const TOOLTIP_STYLE = {
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize: '10px',
  color: '#fff',
}

function CustomTooltipBalance({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const absorbed = payload.find(p => p.dataKey === 'absorbed')?.value ?? 0
  const generated = payload.find(p => p.dataKey === 'generated')?.value ?? 0
  const net = parseFloat((generated - absorbed).toFixed(2))
  return (
    <div style={TOOLTIP_STYLE} className="p-3 space-y-1.5">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-[10px] font-black text-green-400">🌳 Absorbed: {absorbed.toFixed(2)} kg</p>
      <p className="text-[10px] font-black text-red-400">👤 Generated: {generated.toFixed(2)} kg</p>
      <p className={`text-[10px] font-black ${net <= 0 ? 'text-green-400' : 'text-amber-400'}`}>
        ⚖️ Net: {net >= 0 ? '+' : ''}{net} kg
      </p>
    </div>
  )
}

export default function CarbonBalancePage() {
  const navigate = useNavigate()
  const [greenItems, setGreenItems] = useState([])
  const [summary, setSummary] = useState(null)
  const [balance, setBalance] = useState(null)
  const [status, setStatus] = useState(null)
  const [chartData, setChartData] = useState([])
  const [pieData, setPieData] = useState([])
  const [loading, setLoading] = useState(true)
  const [todayStudentCO2, setTodayStudentCO2] = useState(0)
  const [dataNote, setDataNote] = useState('')
  const [showPieDetail, setShowPieDetail] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      // 1. Fetch green cover items
      const { data: items } = await supabase
        .from('campus_green_cover')
        .select('*')
        .order('zone')

      const safeItems = items || []
      setGreenItems(safeItems)

      const summ = getGreenCoverSummary(safeItems)
      setSummary(summ)
      const pie = buildPieData(safeItems)
      setPieData(pie)

      // 2. Fetch today's student CO2 total
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      const { data: todayLogs } = await supabase
        .from('carbon_logs')
        .select('total_kg')
        .eq('log_date', today)

      let studentCO2 = 0
      let note = ''
      if (todayLogs && todayLogs.length > 0) {
        studentCO2 = todayLogs.reduce((a, l) => a + Number(l.total_kg || 0), 0)
        note = `Based on ${todayLogs.length} student log(s) submitted today.`
      } else {
        // Fallback to yesterday
        const { data: yestLogs } = await supabase
          .from('carbon_logs')
          .select('total_kg')
          .eq('log_date', yesterday)
        studentCO2 = (yestLogs || []).reduce((a, l) => a + Number(l.total_kg || 0), 0)
        note = 'No logs today yet — showing yesterday\'s data.'
      }
      setTodayStudentCO2(studentCO2)
      setDataNote(note)

      const totalAbsorbed = calculateTotalAbsorption(safeItems)
      const bal = calculateNetCarbon(studentCO2, totalAbsorbed)
      setBalance(bal)
      setStatus(getNetCarbonStatus(bal.net))

      // 3. Build 7-day chart data from snapshots (or generate from current data)
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      const { data: snapshots } = await supabase
        .from('green_cover_snapshots')
        .select('*')
        .gte('snapshot_date', sevenDaysAgo)
        .order('snapshot_date')

      let chart = []
      if (snapshots && snapshots.length > 0) {
        chart = snapshots.map(s => ({
          date: new Date(s.snapshot_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          absorbed: parseFloat(s.total_co2_absorbed_kg.toFixed(2)),
          generated: parseFloat(s.total_student_co2_kg.toFixed(2)),
        }))
      } else {
        // Generate mock 7-day data based on current absorption (trees are constant) + vary student CO2
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(Date.now() - (6 - i) * 86400000)
          const variance = (Math.random() - 0.5) * 0.4
          const studentVariance = studentCO2 > 0 ? studentCO2 * (1 + variance) : totalAbsorbed * 1.5 * (1 + variance)
          return {
            date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            absorbed: parseFloat(totalAbsorbed.toFixed(2)),
            generated: parseFloat(Math.max(0, studentVariance).toFixed(2)),
          }
        })
        // Last point = today's real data
        if (days.length > 0) {
          days[days.length - 1] = {
            date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            absorbed: parseFloat(totalAbsorbed.toFixed(2)),
            generated: parseFloat(studentCO2.toFixed(2)),
          }
        }
        chart = days
      }
      setChartData(chart)
    } catch (err) {
      console.error('Green cover fetch error:', err)
      toast.error('Failed to load green cover data')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const text = balance?.isNeutral
      ? `🌍 Our campus is Carbon Neutral today! Trees absorbed ${balance.absorbed} kg CO2. Join InstitutePulse!`
      : `🌱 Campus needs ${balance?.treesNeededToNeutralize} more trees to be carbon neutral. Track your footprint on InstitutePulse!`
    try {
      await navigator.share({ title: 'Campus Carbon Balance', text, url: window.location.href })
    } catch {
      navigator.clipboard.writeText(text)
      toast.success('Stats copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-green-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Loading Green Data...</p>
        </div>
      </div>
    )
  }

  const netLabel = balance?.net >= 0 ? `+${balance?.net?.toFixed(2)}` : balance?.net?.toFixed(2)

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[55%] h-[40%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[45%] h-[35%] rounded-full bg-emerald-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-5 pt-6 max-w-2xl mx-auto">

        {/* ── TOP BAR ── */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="hidden lg:flex w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-0.5">Campus Sustainability</p>
              <h1 className="text-xl font-black text-white uppercase tracking-tight leading-none">Carbon Balance</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Share2 size={16} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <TreePine size={18} />
            </div>
          </div>
        </header>

        {/* ── CARBON NEUTRAL STATUS BANNER ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[28px] p-5 mb-6 border ${
            balance?.isNeutral
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{status?.icon}</span>
            <div>
              <p className={`text-[11px] font-black uppercase tracking-widest ${balance?.isNeutral ? 'text-green-400' : 'text-amber-400'}`}>
                {balance?.isNeutral
                  ? '🌍 Our campus is Carbon Neutral today!'
                  : `⚠️ Campus needs ${balance?.treesNeededToNeutralize} more trees to be carbon neutral`}
              </p>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                {balance?.isNeutral
                  ? 'The campus trees absorbed more CO2 than all students generated.'
                  : `Plant ${balance?.treesNeededToNeutralize} medium trees to offset the difference.`}
              </p>
            </div>
          </div>
          {dataNote && (
            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-3 ml-10">{dataNote}</p>
          )}
        </motion.div>

        {/* ── NET BALANCE HERO CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-[40px] p-6 mb-6 relative overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 p-6 opacity-[0.04] pointer-events-none">
            <Scale size={120} />
          </div>
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-5">Today's Carbon Balance</p>
          <div className="grid grid-cols-3 gap-3">
            {/* Absorbed */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 mx-auto mb-3">
                <TreeDeciduous size={18} />
              </div>
              <p className="text-xl font-black text-green-400 leading-none mb-1">
                {balance?.absorbed?.toFixed(1) ?? '0.0'}
              </p>
              <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">kg Absorbed</p>
              <p className="text-[7px] font-bold text-gray-600 mt-0.5">by campus trees</p>
            </div>

            {/* Net */}
            <div className="text-center border-x border-white/5">
              <div className={`w-10 h-10 rounded-2xl ${status?.bgClass} border ${status?.borderClass} flex items-center justify-center mx-auto mb-3`}>
                <Scale size={18} className={status?.textClass} />
              </div>
              <p className={`text-xl font-black leading-none mb-1 ${status?.textClass}`}>{netLabel ?? '0.0'}</p>
              <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">kg Net</p>
              <p className={`text-[7px] font-black mt-0.5 ${status?.textClass}`}>{status?.shortLabel}</p>
            </div>

            {/* Generated */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-3">
                <Wind size={18} />
              </div>
              <p className="text-xl font-black text-red-400 leading-none mb-1">
                {balance?.generated?.toFixed(1) ?? '0.0'}
              </p>
              <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">kg Generated</p>
              <p className="text-[7px] font-bold text-gray-600 mt-0.5">by students today</p>
            </div>
          </div>

          {/* Offset progress bar */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Offset Progress</span>
              <span className={`text-[9px] font-black ${status?.textClass}`}>{balance?.percentageOffset ?? 0}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, balance?.percentageOffset ?? 0)}%` }}
                transition={{ duration: 1, ease: 'circOut' }}
                className="h-full rounded-full bg-gradient-to-r from-green-600 to-emerald-400"
              />
            </div>
            <p className="text-[8px] text-gray-600 font-bold mt-1">
              Green cover offsets {balance?.percentageOffset ?? 0}% of student emissions
            </p>
          </div>
        </motion.div>

        {/* ── GREEN COVER SUMMARY ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-[40px] p-6 mb-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Campus Green Cover</h3>
            <Leaf size={16} className="text-green-500" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { emoji: '🌳', label: 'Large Trees', val: summary?.largeTrees ?? 0 },
              { emoji: '🌲', label: 'Medium Trees', val: summary?.mediumTrees ?? 0 },
              { emoji: '🌴', label: 'Small Trees', val: summary?.smallTrees ?? 0 },
              { emoji: '🌿', label: 'Shrubs', val: summary?.shrubs ?? 0 },
              { emoji: '🪴', label: 'Plants', val: summary?.smallPlants ?? 0 },
              { emoji: '🪴', label: 'Indoor', val: summary?.indoorPlants ?? 0 },
            ].map(item => (
              <div key={item.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 text-center">
                <span className="text-xl block mb-1">{item.emoji}</span>
                <p className="text-sm font-black text-white">{item.val.toLocaleString()}</p>
                <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>
          {summary?.totalLawnSqm > 0 && (
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 mb-4 flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">🌱 Lawn Area</span>
              <span className="text-[10px] font-black text-white">{summary.totalLawnSqm.toLocaleString()} sqm</span>
            </div>
          )}
          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total</p>
              <p className="text-sm font-black text-white">{summary?.totalTrees?.toLocaleString()} trees + {summary?.totalPlants?.toLocaleString()} plants</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Daily Absorption</p>
              <p className="text-sm font-black text-green-400">{summary?.totalCO2Absorbed?.toFixed(2)} kg CO2/day</p>
            </div>
          </div>
        </motion.div>

        {/* ── 7-DAY COMPARISON BAR CHART ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/5 border border-white/10 rounded-[40px] p-6 mb-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">7-Day CO2 Comparison</h3>
              <p className="text-[8px] text-gray-600 mt-0.5">Green = absorbed | Red = generated</p>
            </div>
            <BarChart className="text-green-500 w-4 h-4" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} unit=" kg" />
              <Tooltip content={<CustomTooltipBalance />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <Bar dataKey="absorbed" name="Absorbed" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="generated" name="Generated" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-600" />
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Trees Absorbed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Students Generated</span>
            </div>
          </div>
        </motion.div>

        {/* ── MONTHLY TREND LINE CHART ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-[40px] p-6 mb-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Emission Trend</h3>
              <p className="text-[8px] text-gray-600 mt-0.5">Green line should fall below absorbed line = neutral</p>
            </div>
            <TrendingDown size={16} className="text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="absorbedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="generatedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} unit=" kg" />
              <Tooltip content={<CustomTooltipBalance />} />
              <Line type="monotone" dataKey="absorbed" stroke="#16a34a" strokeWidth={2.5} dot={false} name="Absorbed" />
              <Line type="monotone" dataKey="generated" stroke="#f97316" strokeWidth={2.5} dot={false} name="Generated" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── TREES NEEDED CALCULATOR ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`rounded-[40px] p-6 mb-6 border ${
            balance?.isNeutral
              ? 'bg-green-500/5 border-green-500/20'
              : 'bg-amber-500/5 border-amber-500/20'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Trees Needed Calculator</h3>
            <TreePine size={16} className={balance?.isNeutral ? 'text-green-500' : 'text-amber-400'} />
          </div>
          {balance?.isNeutral ? (
            <div className="text-center py-4">
              <p className="text-4xl font-black text-green-400 mb-2">0</p>
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">More trees needed</p>
              <p className="text-[9px] text-gray-500 mt-2">Campus is carbon negative today! 🌿</p>
              <p className="text-[8px] text-gray-600 mt-1">Trees absorb {Math.abs(balance.net).toFixed(2)} kg more than students generate.</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className={`text-5xl font-black mb-2 ${status?.textClass}`}>{balance?.treesNeededToNeutralize}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">More medium trees needed</p>
              <p className="text-[9px] text-gray-500 mt-2">
                To neutralize today's {balance?.generated?.toFixed(2)} kg student emissions
              </p>
              <p className="text-[8px] text-gray-600 mt-1 italic">Each medium tree absorbs {CO2_ABSORPTION_FACTORS.medium_tree} kg CO2/day</p>
            </div>
          )}
        </motion.div>

        {/* ── PIE CHART ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-[40px] p-6 mb-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Green Cover Breakdown</h3>
            <button
              onClick={() => setShowPieDetail(p => !p)}
              className="flex items-center gap-1 text-[8px] font-black text-gray-500 uppercase tracking-widest"
            >
              Details {showPieDetail ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val) => [`${val.toFixed(3)} kg CO2/day`, 'Absorption']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <AnimatePresence>
                {showPieDetail && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-2"
                  >
                    {pieData.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{entry.name}</span>
                        </div>
                        <span className="text-[9px] font-black text-white">{entry.value.toFixed(3)} kg/day</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="py-10 text-center text-gray-600 text-[9px] font-black uppercase tracking-widest">
              No green cover data registered yet
            </div>
          )}
        </motion.div>

        {/* ── ECO MOTIVATION CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`rounded-[40px] p-6 mb-6 border ${
            balance?.isNeutral
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-3 ${balance?.isNeutral ? 'text-green-500' : 'text-gray-500'}`}>
            {balance?.isNeutral ? 'Campus Achievement' : 'Make a Difference'}
          </p>
          <p className={`text-[11px] font-bold leading-relaxed mb-4 ${balance?.isNeutral ? 'text-green-100' : 'text-gray-300'}`}>
            {balance?.isNeutral
              ? `🌍 Amazing! InstitutePulse campus absorbed ${Math.abs(balance.net).toFixed(2)} kg more CO2 than students generated today. Every tree counts!`
              : `🌱 Every tree planted helps. The campus needs ${balance?.treesNeededToNeutralize} more trees. Raise a green suggestion in support!`}
          </p>
          <div className="flex gap-3">
            {balance?.isNeutral ? (
              <button
                onClick={handleShare}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={12} /> Share This Win
              </button>
            ) : (
              <button
                onClick={() => navigate('/complaints')}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={12} /> Raise Green Suggestion
              </button>
            )}
            <button
              onClick={() => navigate('/navigation')}
              className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
            >
              View Map
            </button>
          </div>
        </motion.div>

        <p className="text-center text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-4">
          InstitutePulse • Campus Green Cover Module
        </p>
      </div>
    </div>
  )
}

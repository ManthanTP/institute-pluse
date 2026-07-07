import { useState, useEffect } from 'react'
import { TrendingDown, TrendingUp, Calendar, Leaf, Wind, Droplets, Zap, ChevronRight, Share2, Download, Info, Bus, UtensilsCrossed, ArrowLeft, AlertTriangle, ShieldOff } from 'lucide-react'
import { exportTablePDF } from '../../lib/pdfExport'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import PDFExportModal from '../../components/PDFExportModal'

const TIME_FRAMES = ['Week', 'Month', 'Year']

export default function CarbonHistoryPage() {
  const { profile } = useAuthStore()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFrame, setTimeFrame] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedType, setSelectedType] = useState(null) // 'log' | 'order'
  const [isExporting, setIsExporting] = useState(false)

  // Download range picker states
  const [showRangePicker, setShowRangePicker] = useState(false)
  const [rangeType, setRangeType] = useState('Week') // 'Week' | 'Month' | 'Year'
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedMonthYear, setSelectedMonthYear] = useState(new Date().getFullYear())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [exportData, setExportData] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [profile?.id, timeFrame, refreshKey])

  async function fetchHistory() {
    if (!profile?.id) return
    setLoading(true)

    let logQuery = supabase
      .from('carbon_logs')
      .select('*')
      .eq('student_id', profile.id)
      .order('log_date', { ascending: false })

    let orderQuery = supabase
      .from('orders')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })

    if (timeFrame === 0) { // Week
      const date = new Date()
      date.setDate(date.getDate() - 7)
      logQuery = logQuery.gte('log_date', date.toISOString().split('T')[0])
      orderQuery = orderQuery.gte('created_at', date.toISOString())
    } else if (timeFrame === 1) { // Month
      const date = new Date()
      date.setMonth(date.getMonth() - 1)
      logQuery = logQuery.gte('log_date', date.toISOString().split('T')[0])
      orderQuery = orderQuery.gte('created_at', date.toISOString())
    } else if (timeFrame === 2) { // Year
      const date = new Date()
      date.setFullYear(date.getFullYear() - 1)
      logQuery = logQuery.gte('log_date', date.toISOString().split('T')[0])
      orderQuery = orderQuery.gte('created_at', date.toISOString())
    }

    try {
      const [logsRes, ordersRes] = await Promise.all([logQuery, orderQuery])

      if (logsRes.error) console.error('Carbon logs fetch error:', logsRes.error.message, logsRes.error)
      if (ordersRes.error) console.error('Orders fetch error:', ordersRes.error.message, ordersRes.error)

      // Normalize and merge
      const logs = (logsRes.data || []).map(l => ({ ...l, _type: 'log', _date: new Date(l.log_date + 'T00:00:00') }))
      const orders = (ordersRes.data || []).map(o => ({ ...o, _type: 'order', _date: new Date(o.created_at) }))

      const merged = [...logs, ...orders].sort((a, b) => b._date - a._date)
      setHistory(merged)
    } catch (err) {
      console.error('History fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }
  const totalSaved = history.reduce((acc, curr) => {
    if (curr._type === 'log') return acc + (curr.total_kg * 0.15 || 0)
    return acc // Orders don't "save" carbon, they are footprints
  }, 0)

  const averageImpact = history.length > 0 ? history.reduce((acc, curr) => {
    return acc + (Number(curr.total_kg || curr.total_carbon_kg || 0))
  }, 0) / history.length : 0

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'My Carbon Footprint',
        text: `I've saved ${totalSaved.toFixed(1)}kg of CO2 on InstitutePulse! Join the mission.`,
        url: window.location.href
      })
    } catch (err) {
      navigator.clipboard.writeText(`I've saved ${totalSaved.toFixed(1)}kg of CO2 on InstitutePulse!`)
      alert('Stats copied to clipboard!')
    }
  }

  const triggerPDFDownload = () => {
    if (!exportData) return
    exportTablePDF({
      title: `${exportData.periodLabel} Carbon Manifest`,
      subtitle: `OPERATOR: ${profile?.full_name || 'ANONYMOUS'} • RANGE: ${exportData.periodLabel}`,
      headers: ['Date', 'Protocol Source', 'CO2 Impact'],
      rows: exportData.history.map(item => [
        item._date.toLocaleDateString().toUpperCase(),
        item._type === 'order' ? 'CAFETERIA NODE' : 'DAILY MANIFEST',
        `${(item.total_kg || item.total_carbon_kg || 0).toFixed(2)} KG`
      ]),
      filename: exportData.filename,
      summaryCards: [
        { label: 'Total Saved', value: `${exportData.totalSaved.toFixed(2)} KG` },
        { label: 'Avg Impact', value: `${exportData.averageImpact.toFixed(2)} KG` }
      ],
      studentName: profile?.full_name
    })
  }

  const handleDownload = () => {
    setShowRangePicker(true)
  }

  const handleGenerateRangeReport = async () => {
    if (!profile?.id) return
    setLoading(true)
    setShowRangePicker(false)

    let start, end, rangeLabel
    if (rangeType === 'Week') {
      start = new Date(selectedWeekStart)
      start.setHours(0, 0, 0, 0)
      end = new Date(start)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      
      const options = { day: 'numeric', month: 'short' }
      rangeLabel = `WEEK OF ${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
    } else if (rangeType === 'Month') {
      start = new Date(selectedMonthYear, selectedMonth, 1)
      start.setHours(0, 0, 0, 0)
      end = new Date(selectedMonthYear, Number(selectedMonth) + 1, 0, 23, 59, 59, 999)
      
      rangeLabel = `${start.toLocaleString('en-US', { month: 'long' }).toUpperCase()} ${selectedMonthYear}`
    } else {
      start = new Date(selectedYear, 0, 1)
      start.setHours(0, 0, 0, 0)
      end = new Date(selectedYear, 11, 31, 23, 59, 59, 999)
      
      rangeLabel = `YEAR ${selectedYear}`
    }

    try {
      const logRes = await supabase
        .from('carbon_logs')
        .select('*')
        .eq('student_id', profile.id)
        .gte('log_date', start.toISOString().split('T')[0])
        .lte('log_date', end.toISOString().split('T')[0])
        .order('log_date', { ascending: false })

      const orderRes = await supabase
        .from('orders')
        .select('*')
        .eq('student_id', profile.id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false })

      if (logRes.error) throw logRes.error
      if (orderRes.error) throw orderRes.error

      const logs = (logRes.data || []).map(l => ({ ...l, _type: 'log', _date: new Date(l.log_date + 'T00:00:00') }))
      const orders = (orderRes.data || []).map(o => ({ ...o, _type: 'order', _date: new Date(o.created_at) }))
      const merged = [...logs, ...orders].sort((a, b) => b._date - a._date)

      const tSaved = merged.reduce((acc, curr) => {
        if (curr._type === 'log') return acc + (curr.total_kg * 0.15 || 0)
        return acc
      }, 0)

      const avgImpact = merged.length > 0 ? merged.reduce((acc, curr) => {
        return acc + (Number(curr.total_kg || curr.total_carbon_kg || 0))
      }, 0) / merged.length : 0

      setExportData({
        history: merged,
        totalSaved: tSaved,
        averageImpact: avgImpact,
        periodLabel: rangeLabel,
        filename: `carbon_manifest_${rangeType.toLowerCase()}_${profile?.id?.slice(0, 8)}`
      })
      
      setIsExporting(true)
    } catch (err) {
      console.error('Failed to fetch export range data:', err)
      toast.error('Failed to compile range metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-green-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Impact Core...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-green-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-6">
        {/* HEADER AREA */}
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="hidden lg:flex w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Impact Analytics</span>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">Carbon History</h1>
              <p className="text-[9px] font-black text-green-500 uppercase tracking-[0.3em] flex items-center gap-1.5">
                 <TrendingDown size={10} /> Emissions Reduction Active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-40"
              title="Refresh"
            >
              <TrendingDown size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={handleShare}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* OVERVIEW CARDS */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                 <Leaf size={24} className="text-green-500" />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Saved</p>
              <h2 className="text-2xl font-black text-white tracking-tighter">{totalSaved.toFixed(1)} kg</h2>
              <div className="mt-4 flex items-center gap-1 text-[8px] font-black text-green-500 uppercase tracking-widest">
                 <TrendingDown size={10} /> 12% vs last week
              </div>
           </div>
           <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                 <Wind size={24} className="text-blue-500" />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Avg Impact</p>
              <h2 className="text-2xl font-black text-white tracking-tighter">{averageImpact.toFixed(1)} kg</h2>
              <div className="mt-4 flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase tracking-widest">
                 <TrendingUp size={10} /> 3.2% vs baseline
              </div>
           </div>
        </div>

        {/* TIME RANGE SELECTOR */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar mb-8">
          {TIME_FRAMES.map((t, i) => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeFrame(i)}
              className={`flex-shrink-0 px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                timeFrame === i 
                  ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20' 
                  : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>

        {/* LOG LIST */}
        <div className="space-y-4">
           <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Activity Stream</h3>
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-lg"
              >
                <Download size={12} />
                <span>Download Report</span>
              </motion.button>
           </div>

           <AnimatePresence mode="popLayout">
            {loading ? (
               <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Syncing Archives...</p>
               </div>
            ) : history.length === 0 ? (
               <div className="py-12 text-center bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl">
                  <div className="text-4xl mb-4 opacity-40">📜</div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">No Log History</p>
                  <p className="text-[10px] font-medium text-gray-500 mt-2">Carbon logs appear here after you submit them from the Daily Pulse page.</p>
                  <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    className="mt-4 px-6 py-2 rounded-2xl bg-green-600/20 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-widest hover:bg-green-600/30 transition-all"
                  >
                    Refresh
                  </button>
               </div>
            ) : history.map((item, i) => {
              // Compute relative date label
              const today = new Date()
              today.setHours(0,0,0,0)
              const itemDay = new Date(item._date)
              itemDay.setHours(0,0,0,0)
              const diffDays = Math.round((today - itemDay) / 86400000)
              const dateLabel = diffDays === 0 ? 'Today'
                : diffDays === 1 ? 'Yesterday'
                : item._date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()
              return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { setSelectedItem(item); setSelectedType(item._type); }}
                className={`rounded-[28px] p-6 backdrop-blur-xl flex items-center justify-between group hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                  item.status === 'rejected'
                    ? 'bg-red-500/5 border border-red-500/15'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center gap-5">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                     item.status === 'rejected'
                       ? 'bg-red-500/10 border-red-500/10 text-red-400'
                       : item._type === 'order' 
                       ? 'bg-orange-500/10 border-orange-500/10 text-orange-500' 
                       : 'bg-green-500/20 border-green-500/10 text-green-500'
                   }`}>
                      {item._type === 'order' ? <UtensilsCrossed size={20} /> : <Calendar size={20} />}
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                          {dateLabel}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${
                          item._type === 'order' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {item._type === 'order' ? 'Cafeteria Node' : 'Daily Manifest'}
                        </span>
                        {item.log_status === 'quarantined' && item.status !== 'rejected' && (
                          <span className="px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-400 flex items-center gap-1">
                            <AlertTriangle size={8} /> Under Review
                          </span>
                        )}
                        {item.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 flex items-center gap-1">
                            <ShieldOff size={8} /> Rejected
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Zap size={10} className={item._type === 'order' ? 'text-orange-500' : 'text-yellow-500'} />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                              {(item.total_kg || item.total_carbon_kg || 0).toFixed(1)} kg CO2
                            </span>
                          </div>
                          {item._type === 'log' && item.eco_score !== undefined && (
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-black text-green-500">⚡ {item.eco_score}%</span>
                            </div>
                          )}
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  {item._type === 'log' && (
                    item.status === 'rejected' ? (
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">0 XP</span>
                    ) : (
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">+{item.eco_points_earned || 0} XP</span>
                    )
                  )}
                  <ChevronRight size={18} className="text-gray-700 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            )})}
           </AnimatePresence>
        </div>

        {/* DETAIL MODAL */}
        {createPortal(
          <AnimatePresence>
            {selectedItem && (
              <div className="fixed inset-0 z-[9999] flex items-end justify-center">
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                  onClick={() => setSelectedItem(null)}
                />
                <motion.div 
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  className="relative w-full max-w-2xl bg-slate-900 border-t border-white/10 rounded-t-[48px] p-10 shadow-2xl overflow-hidden"
                  style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}
                >
                  <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-10" />
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
                    {selectedType === 'order' ? 'Nutrition Manifest' : 'Log Manifest'}
                  </h2>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                    ID: {selectedItem.id.slice(0, 12).toUpperCase()} • {selectedItem._date.toLocaleString()}
                  </p>

                  {/* Audit Status Banner */}
                  {selectedItem.status === 'rejected' && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <ShieldOff size={18} className="text-red-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Log Rejected</p>
                        <p className="text-[10px] text-red-300/70 leading-relaxed">This entry was flagged and rejected during audit. No XP was credited. If you believe this was an error, contact faculty.</p>
                      </div>
                    </div>
                  )}
                  {selectedItem.log_status === 'quarantined' && selectedItem.status !== 'rejected' && (
                    <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={18} className="text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-1">Under Review</p>
                        <p className="text-[10px] text-yellow-300/70 leading-relaxed">This entry is pending faculty verification. XP will be credited once approved.</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedType === 'order' ? (
                    <div className="space-y-4 mb-10">
                       <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-4">Payload Breakdown</p>
                          <div className="space-y-3">
                             {selectedItem.items?.map((it, idx) => (
                               <div key={idx} className="flex justify-between items-center text-[11px] font-black uppercase">
                                  <span className="text-white">{it.quantity}x {it.name}</span>
                                  <span className="text-orange-500">{(it.carbon_kg * it.quantity || 0).toFixed(2)} kg</span>
                               </div>
                             ))}
                          </div>
                          <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-[12px] font-black uppercase">
                             <span className="text-gray-500 tracking-widest">Total Footprint</span>
                             <span className="text-white">{(selectedItem.total_carbon_kg || 0).toFixed(2)} kg CO2</span>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-5 flex flex-col items-center">
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">Eco Score</p>
                          <p className="text-xl font-black text-green-500">{selectedItem.eco_score}%</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-5 flex flex-col items-center">
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">XP Points Earned</p>
                          <p className="text-xl font-black text-yellow-500">
                            {selectedItem.status === 'rejected' ? '0 XP' : `+${selectedItem.eco_points_earned || 0} XP`}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-10">
                          {[
                            { icon: Bus, label: 'Transport', val: selectedItem.transport_kg, color: 'text-blue-500' },
                            { icon: Wind, label: 'Electricity', val: selectedItem.electricity_kg, color: 'text-yellow-500' },
                            { icon: Droplets, label: 'Water', val: selectedItem.water_kg, color: 'text-cyan-500' },
                            { icon: Leaf, label: 'Food', val: selectedItem.food_kg, color: 'text-green-500' },
                          ].map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-5 flex items-center gap-4">
                              <div className={`p-2 rounded-xl bg-white/5 ${item.color}`}><item.icon size={16} /></div>
                              <div>
                                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                                  <p className="text-sm font-black text-white">{Number(item.val || 0).toFixed(2)} kg</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="w-full py-6 rounded-[28px] bg-white text-slate-950 font-black text-[10px] uppercase tracking-[0.3em]"
                  >
                      Terminate View
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* TIPS SECTION */}
        <div className="mt-10 bg-blue-600/10 border border-blue-500/20 rounded-[32px] p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4">
              <Info size={24} className="text-blue-500 opacity-20" />
           </div>
           <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">InstitutePulseAI Insight</h4>
           <p className="text-[12px] font-medium text-white/80 leading-relaxed max-w-[80%]">
             Reducing your meal's carbon footprint by switching to vegetarian options can save up to 1.2 kg of CO2 per meal!
           </p>
        </div>
      </div>

      {/* RANGE PICKER MODAL */}
      <AnimatePresence>
        {showRangePicker && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setShowRangePicker(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[36px] p-8 shadow-2xl overflow-hidden text-white"
            >
              <h2 className="text-xl font-black uppercase tracking-tighter mb-2">Compile Manifest</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Select report time-window to extract</p>

              {/* Range Type Selection */}
              <div className="flex gap-2 mb-6 bg-slate-950/50 p-1 border border-white/5 rounded-2xl">
                {['Week', 'Month', 'Year'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => setRangeType(t)}
                    className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all ${
                      rangeType === t ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {t}ly
                  </button>
                ))}
              </div>

              {/* Conditional Inputs */}
              <div className="space-y-4 mb-8">
                {rangeType === 'Week' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Week Commencing (Start Date)</label>
                    <input 
                      type="date" value={selectedWeekStart} onChange={e => setSelectedWeekStart(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white outline-none focus:border-green-500/50 transition-all cursor-pointer bg-slate-950"
                    />
                  </div>
                )}

                {rangeType === 'Month' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Month</label>
                      <select 
                        value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white outline-none focus:border-green-500/50 appearance-none cursor-pointer bg-slate-950"
                      >
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                          <option key={idx} value={idx}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Year</label>
                      <select 
                        value={selectedMonthYear} onChange={e => setSelectedMonthYear(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white outline-none focus:border-green-500/50 appearance-none cursor-pointer bg-slate-950"
                      >
                        {[2024, 2025, 2026].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {rangeType === 'Year' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Year</label>
                    <select 
                      value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white outline-none focus:border-green-500/50 appearance-none cursor-pointer bg-slate-950"
                    >
                      {[2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowRangePicker(false)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 hover:border-red-500/20 text-gray-400 hover:text-red-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateRangeReport}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-green-600/10 transition-all"
                >
                  Generate PDF
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>

      <PDFExportModal 
        isOpen={isExporting} 
        onClose={() => setIsExporting(false)} 
        onTriggerDownload={triggerPDFDownload} 
      />
    </div>
  )
}

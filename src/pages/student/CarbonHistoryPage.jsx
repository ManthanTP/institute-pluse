import { useState, useEffect } from 'react'
import { TrendingDown, TrendingUp, Calendar, Leaf, Wind, Droplets, Zap, ChevronRight, Share2, Download, Info, Bus, UtensilsCrossed, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const TIME_FRAMES = ['Week', 'Month', 'Year']

export default function CarbonHistoryPage() {
  const { profile } = useAuthStore()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFrame, setTimeFrame] = useState(0)

  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedType, setSelectedType] = useState(null) // 'log' | 'order'

  useEffect(() => {
    fetchHistory()
  }, [profile?.id, timeFrame])

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
    }

    const [logsRes, ordersRes] = await Promise.all([logQuery, orderQuery])
    
    // Normalize and merge
    const logs = (logsRes.data || []).map(l => ({ ...l, _type: 'log', _date: new Date(l.log_date) }))
    const orders = (ordersRes.data || []).map(o => ({ ...o, _type: 'order', _date: new Date(o.created_at) }))
    
    const merged = [...logs, ...orders].sort((a, b) => b._date - a._date)
    
    setHistory(merged)
    setLoading(false)
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

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "carbon_history.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Impact Analytics</span>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">Carbon History</h1>
              <p className="text-[9px] font-black text-green-500 uppercase tracking-[0.3em] flex items-center gap-1.5">
                 <TrendingDown size={10} /> Emissions Reduction Active
              </p>
            </div>
          </div>
          <button 
            onClick={handleShare}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
          >
            <Share2 size={18} />
          </button>
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
              <button onClick={handleDownload}>
                <Download size={14} className="text-gray-700 hover:text-white transition-colors" />
              </button>
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
                  <p className="text-[10px] font-medium text-gray-500 mt-2">Start your sustainability journey today!</p>
               </div>
            ) : history.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { setSelectedItem(item); setSelectedType(item._type); }}
                className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl flex items-center justify-between group hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-5">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                     item._type === 'order' 
                      ? 'bg-orange-500/10 border-orange-500/10 text-orange-500' 
                      : 'bg-green-500/20 border-green-500/10 text-green-500'
                   }`}>
                      {item._type === 'order' ? <UtensilsCrossed size={20} /> : <Calendar size={20} />}
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                          {item._date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${
                          item._type === 'order' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {item._type === 'order' ? 'Cafeteria Node' : 'Daily Manifest'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Zap size={10} className={item._type === 'order' ? 'text-orange-500' : 'text-yellow-500'} />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                              {(item.total_kg || item.total_carbon_kg || 0).toFixed(1)} kg CO2
                            </span>
                          </div>
                      </div>
                   </div>
                </div>
                <ChevronRight size={18} className="text-gray-700 group-hover:text-white transition-colors" />
              </motion.div>
            ))}
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
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-10">
                    ID: {selectedItem.id.slice(0, 12).toUpperCase()} • {selectedItem._date.toLocaleString()}
                  </p>
                  
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
    </div>
  )
}

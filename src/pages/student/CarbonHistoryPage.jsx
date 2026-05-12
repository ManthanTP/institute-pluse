import { useState, useEffect } from 'react'
import { TrendingDown, TrendingUp, Calendar, Leaf, Wind, Droplets, Zap, ChevronRight, Share2, Download, Info } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'

const TIME_FRAMES = ['Week', 'Month', 'Year']

export default function CarbonHistoryPage() {
  const { profile } = useAuthStore()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFrame, setTimeFrame] = useState(0)

  useEffect(() => {
    async function fetchHistory() {
      if (!profile?.id) return
      setLoading(true)
      const { data } = await supabase
        .from('carbon_logs')
        .select('*')
        .eq('student_id', profile.id)
        .order('log_date', { ascending: false })
      
      if (data) setHistory(data)
      setLoading(false)
    }
    fetchHistory()
  }, [profile?.id])

  // Simple aggregations for demo
  const totalSaved = history.reduce((acc, curr) => acc + (curr.co2_saved_kg || 0), 0)
  const averageImpact = history.length > 0 ? history.reduce((acc, curr) => acc + (curr.total_co2_kg || 0), 0) / history.length : 0

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
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Impact Analytics</span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2">Carbon History</h1>
            <p className="text-[9px] font-black text-green-500 uppercase tracking-[0.3em] flex items-center gap-1.5">
               <TrendingDown size={10} /> Emissions Reduction Active
            </p>
          </div>
          <div className="flex gap-2">
             <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
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
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Recent Logs</h3>
              <Download size={14} className="text-gray-700 cursor-pointer hover:text-white" />
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
                  <p className="text-[10px] font-medium text-gray-500 mt-2">Submit your first log to start tracking!</p>
               </div>
            ) : history.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl flex items-center justify-between group hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/10 flex items-center justify-center text-green-500">
                      <Calendar size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">
                        {new Date(log.log_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()}
                      </h4>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1">
                            <Zap size={10} className="text-yellow-500" />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{log.total_co2_kg.toFixed(1)} kg</span>
                         </div>
                         <div className="w-0.5 h-0.5 rounded-full bg-white/20" />
                         <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                            Saved {log.co2_saved_kg.toFixed(1)} kg
                         </span>
                      </div>
                   </div>
                </div>
                <ChevronRight size={18} className="text-gray-700 group-hover:text-white transition-colors" />
              </motion.div>
            ))}
           </AnimatePresence>
        </div>

        {/* TIPS SECTION */}
        <div className="mt-10 bg-blue-600/10 border border-blue-500/20 rounded-[32px] p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4">
              <Info size={24} className="text-blue-500 opacity-20" />
           </div>
           <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">Nexus Insight</h4>
           <p className="text-[12px] font-medium text-white/80 leading-relaxed max-w-[80%]">
             Reducing your meal's carbon footprint by switching to vegetarian options can save up to 1.2 kg of CO2 per meal!
           </p>
        </div>
      </div>
    </div>
  )
}

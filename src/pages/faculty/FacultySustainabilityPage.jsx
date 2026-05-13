import { useState, useEffect } from 'react'
import { Leaf, Wind, Droplets, Zap, ShieldCheck, TrendingUp, History, Download, Award, Globe, TreePine, Info } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function FacultySustainabilityPage() {
  const [impact, setImpact] = useState({ paperSaved: 0, co2Reduced: 0, treesEquivalent: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function calculateImpact() {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Fetch total sessions by this faculty
        const { count: sessionCount } = await supabase
          .from('attendance_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', user.id)

        // 2. Fetch total verified attendance records across all sessions
        const { count: totalVerified } = await supabase
          .from('attendance_records')
          .select('*, attendance_sessions!inner(teacher_id)', { count: 'exact', head: true })
          .eq('attendance_sessions.teacher_id', user.id)
          .eq('verification_status', 'verified')

        // Calculation Logic:
        // Each digital attendance record saves ~1 sheet of paper
        // 1 sheet = 5g CO2
        // 1 Tree = 20kg CO2 per year offset
        const sheets = totalVerified || 0
        const co2 = (sheets * 5) / 1000 // Convert to Kg
        const trees = co2 / 20

        setImpact({
           paperSaved: sheets,
           co2Reduced: co2.toFixed(2),
           treesEquivalent: trees.toFixed(2)
        })
      } catch (err) {
        console.error('Impact Calculation Error:', err)
      } finally {
        setLoading(false)
      }
    }

    calculateImpact()
  }, [])

  return (
    <FacultyLayout>
      <div className="space-y-8 lg:space-y-12 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 lg:mb-3">
              <Leaf size={12} className="text-emerald-500" />
              <span className="text-[8px] lg:text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Environmental Impact Protocol</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic flex items-center justify-center md:justify-start gap-4">
               Campus <span className="text-emerald-500">Greenhouse</span>
               <div className="group relative">
                  <Info size={16} className="text-gray-600 hover:text-white cursor-help transition-colors" />
                  <div className="absolute left-0 top-full mt-4 w-64 p-4 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                     <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Protocol Brief</p>
                     <p className="text-[11px] font-medium text-gray-400 leading-relaxed normal-case">
                        The Greenhouse monitors the digital-first ecological impact of your academic activities. Automated attendance and paperless workflows are converted into real-time carbon offset metrics.
                     </p>
                  </div>
               </div>
            </h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
              Monitoring ecological footprints in real-time
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4">
             <div className="flex-1 md:flex-none px-6 py-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl lg:rounded-2xl flex items-center justify-center gap-3 shadow-xl">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[8px] lg:text-[10px] font-black text-emerald-500 uppercase tracking-widest">ECO-ID: F-293</span>
             </div>
          </div>
        </div>

        {/* ECO METRICS HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
           <div className="bg-[#161b22] border border-white/5 rounded-3xl lg:rounded-[48px] p-8 lg:p-12 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500"><Wind size={80} lg:size={100} /></div>
              <p className="text-[9px] lg:text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Paper Saved</p>
              <h3 className="text-4xl lg:text-6xl font-black text-white tracking-tighter italic">{impact.paperSaved} <span className="text-sm lg:text-lg font-bold text-gray-600 not-italic uppercase tracking-widest">Sheets</span></h3>
              <p className="text-[8px] lg:text-[10px] text-gray-500 font-bold uppercase mt-6">Digital session contribution</p>
           </div>
           <div className="bg-[#161b22] border border-white/5 rounded-3xl lg:rounded-[48px] p-8 lg:p-12 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500"><Globe size={80} lg:size={100} /></div>
              <p className="text-[9px] lg:text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Carbon Offset</p>
              <h3 className="text-4xl lg:text-6xl font-black text-white tracking-tighter italic">{impact.co2Reduced} <span className="text-sm lg:text-lg font-bold text-gray-600 not-italic uppercase tracking-widest">Kg CO₂</span></h3>
              <p className="text-[8px] lg:text-[10px] text-gray-500 font-bold uppercase mt-6">Atmospheric impact reduction</p>
           </div>
           <div className="bg-[#161b22] border border-white/5 rounded-3xl lg:rounded-[48px] p-8 lg:p-12 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-5 group-hover:opacity-10 transition-opacity text-orange-500"><TreePine size={80} lg:size={100} /></div>
              <p className="text-[9px] lg:text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Tree Equivalent</p>
              <h3 className="text-4xl lg:text-6xl font-black text-white tracking-tighter italic">{impact.treesEquivalent} <span className="text-sm lg:text-lg font-bold text-gray-600 not-italic uppercase tracking-widest">Trees</span></h3>
              <p className="text-[8px] lg:text-[10px] text-gray-500 font-bold uppercase mt-6">Net ecological growth proxy</p>
           </div>
        </div>

        {/* ECO TASKS / GOALS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
           <div className="bg-[#161b22]/80 border border-white/5 rounded-3xl lg:rounded-[48px] p-8 lg:p-12 backdrop-blur-3xl shadow-2xl">
              <h4 className="text-[9px] lg:text-[11px] font-black text-white uppercase tracking-[0.4em] mb-8 lg:mb-12">Sustainability Milestones</h4>
              <div className="space-y-6 lg:space-y-8">
                 {[
                   { label: 'Paperless Semester', progress: 85, icon: Award, color: 'text-emerald-500' },
                   { label: 'Energy Efficient Labs', progress: 42, icon: Zap, color: 'text-orange-500' },
                   { label: 'Zero Waste Events', progress: 68, icon: Droplets, color: 'text-blue-500' },
                 ].map((goal, idx) => (
                    <div key={idx} className="space-y-3 lg:space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <goal.icon size={14} className={goal.color} />
                             <span className="text-[8px] lg:text-[10px] font-black text-gray-300 uppercase tracking-widest">{goal.label}</span>
                          </div>
                          <span className="text-[8px] lg:text-[10px] font-black text-white uppercase tracking-widest">{goal.progress}%</span>
                       </div>
                       <div className="h-1.5 lg:h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className={`h-full bg-gradient-to-r from-emerald-600 to-teal-400`}
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-[#161b22]/80 border border-white/5 rounded-3xl lg:rounded-[48px] p-8 lg:p-12 backdrop-blur-3xl flex flex-col justify-between shadow-2xl">
              <div>
                 <h4 className="text-[9px] lg:text-[11px] font-black text-white uppercase tracking-[0.4em] mb-6 lg:mb-8 text-center lg:text-left">Ecological Rank</h4>
                 <div className="flex flex-col lg:flex-row lg:items-baseline items-center gap-2 lg:gap-4 mb-6">
                    <span className="text-6xl lg:text-8xl font-black text-white tracking-tighter italic">#04</span>
                    <span className="text-[10px] lg:text-sm font-black text-emerald-500 uppercase tracking-widest">In Department</span>
                 </div>
                 <p className="text-xs lg:text-sm text-gray-500 font-medium leading-relaxed text-center lg:text-left italic">Your digital-first approach in the Computer Science department has saved more paper than 85% of other faculty terminals this month.</p>
              </div>
              <button className="w-full py-4 lg:py-6 bg-white/5 border border-white/10 rounded-xl lg:rounded-3xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all mt-8 lg:mt-12 shadow-inner">Download Eco-Audit</button>
           </div>
        </div>
      </div>

    </FacultyLayout>
  )
}

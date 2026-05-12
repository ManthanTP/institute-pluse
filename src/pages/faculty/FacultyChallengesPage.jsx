import { useState, useEffect } from 'react'
import { Target, Zap, Plus, Trophy, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Search, Users, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function FacultyChallengesPage() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchChallenges()
  }, [])

  async function fetchChallenges() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('green_challenges')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      if (data) {
        const enhancedChallenges = await Promise.all(data.map(async (c) => {
          const { count } = await supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', c.id)
          
          return {
            id: c.id,
            title: c.title,
            category: c.category || 'Sustainability',
            points: c.points_reward,
            participants: count || 0,
            status: c.status,
            deadline: new Date(c.end_date).toLocaleDateString()
          }
        }))
        setChallenges(enhancedChallenges)
      }
    } catch (err) {
      console.error('Challenges Error:', err)
      toast.error('Challenge Nexus Sync Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FacultyLayout>
      <div className="space-y-8 lg:space-y-12 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 lg:mb-3">
              <Target size={12} className="text-orange-500" />
              <span className="text-[8px] lg:text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Gamification Protocol</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Active <span className="text-orange-500">Challenges</span></h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
              Synchronizing {challenges.length} active incentive campaigns
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4">
             <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none px-8 lg:px-10 py-3.5 lg:py-5 bg-orange-500 text-white rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-105 transition-all">Launch Challenge</button>
          </div>
        </div>

        {/* CHALLENGE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
           <AnimatePresence mode="popLayout">
              {challenges.map((challenge, idx) => (
                 <motion.div 
                   key={challenge.id}
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-[#161b22] border border-white/5 rounded-3xl lg:rounded-[48px] p-8 lg:p-10 relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-2xl"
                 >
                    <div className="absolute top-0 right-0 p-8 lg:p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Trophy size={80} lg:size={120} /></div>
                    
                    <div className="relative z-10">
                       <div className="flex items-center justify-between mb-6 lg:mb-8">
                          <div className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-[7px] lg:text-[8px] font-black uppercase tracking-widest ${challenge.status === 'active' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                             {challenge.status === 'active' ? 'Operational' : 'Archived'}
                          </div>
                          <span className="text-[8px] lg:text-[10px] font-black text-gray-600 uppercase tracking-widest">{challenge.category}</span>
                       </div>

                       <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter italic mb-4 lg:mb-6 leading-tight">{challenge.title}</h3>
                       
                       <div className="grid grid-cols-3 gap-4 py-6 lg:py-8 border-y border-white/5 my-6 lg:my-8">
                          <div className="text-center lg:text-left">
                             <p className="text-[8px] lg:text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Impact</p>
                             <p className="text-lg lg:text-xl font-black text-white italic">+{challenge.points} XP</p>
                          </div>
                          <div className="text-center lg:text-left border-x border-white/5">
                             <p className="text-[8px] lg:text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Syncs</p>
                             <p className="text-lg lg:text-xl font-black text-white italic">{challenge.participants}</p>
                          </div>
                          <div className="text-center lg:text-left">
                             <p className="text-[8px] lg:text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Time Left</p>
                             <p className="text-lg lg:text-xl font-black text-orange-500 italic">4D : 12H</p>
                          </div>
                       </div>

                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex -space-x-2 lg:-space-x-3 justify-center sm:justify-start">
                             {[1,2,3,4].map(i => (
                                <div key={i} className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/5 border-2 border-[#161b22] flex items-center justify-center text-[8px] lg:text-[10px] font-black text-gray-400">P{i}</div>
                             ))}
                             <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-orange-500/10 border-2 border-[#161b22] flex items-center justify-center text-[8px] lg:text-[10px] font-black text-orange-500">+{challenge.participants - 4}</div>
                          </div>
                          <div className="flex gap-3">
                             <button className="flex-1 sm:flex-none p-3 lg:p-4 bg-white/5 border border-white/5 rounded-xl lg:rounded-2xl text-gray-500 hover:text-white transition-all shadow-inner"><Users size={18} /></button>
                             <button className="flex-[2] sm:flex-none px-6 lg:px-8 py-3.5 lg:py-4 bg-white/5 border border-white/5 rounded-xl lg:rounded-2xl text-[8px] lg:text-[10px] font-black text-white uppercase tracking-widest hover:bg-orange-500 transition-all shadow-inner">Audit Entries</button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* SYSTEM STATUS */}
        <div className="bg-[#161b22]/50 border border-dashed border-white/10 rounded-3xl lg:rounded-[48px] p-8 lg:p-16 text-center shadow-2xl">
           <Zap size={32} lg:size={40} className="text-gray-700 mx-auto mb-6" />
           <p className="text-[9px] lg:text-[11px] font-black text-gray-600 uppercase tracking-[0.4em] italic mb-8 max-w-lg mx-auto leading-relaxed">Deploy automated challenges to incentivize student performance and sustainability habits across the campus network.</p>
           <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-5 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl">Open Creator Terminal</button>
        </div>
      </div>

    </FacultyLayout>
  )
}

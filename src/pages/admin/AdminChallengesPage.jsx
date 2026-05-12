import { useState, useEffect } from 'react'
import { Target, Trophy, Plus, Search, Trash2, Edit3, Users, Zap, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChallenges()
  }, [])

  async function fetchChallenges() {
    try {
      setLoading(true)
      // Mock Data
      setChallenges([
        { id: 1, title: 'Zero Waste Campus', category: 'Sustainability', points: 1000, participants: 450, status: 'active', creator: 'Dr. Smith' },
        { id: 2, title: 'Code for Climate', category: 'Academic', points: 2500, participants: 120, status: 'active', creator: 'Prof. Miller' },
        { id: 3, title: 'Library Clean-up', category: 'Social', points: 500, participants: 85, status: 'completed', creator: 'Admin Team' },
      ])
    } catch (err) {
      toast.error('Challenge Nexus Synchronization Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target size={14} className="text-green-500" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em]">Global Gamification Protocol</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Global <span className="text-green-500">Challenges</span></h2>
          </div>

          <button className="px-10 py-5 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-600/20 hover:scale-105 transition-all">Create New Directive</button>
        </div>

        {/* CHALLENGE REGISTRY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <AnimatePresence mode="popLayout">
              {challenges.map((challenge, idx) => (
                 <motion.div 
                   key={challenge.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-[#0f172a]/40 border border-white/5 rounded-[48px] p-12 group hover:border-green-500/30 transition-all relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity"><Trophy size={140} /></div>
                    
                    <div className="relative z-10">
                       <div className="flex items-center justify-between mb-10">
                          <div className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${challenge.status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20 animate-pulse' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                             {challenge.status}
                          </div>
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Creator: {challenge.creator}</span>
                       </div>

                       <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-6 leading-none">{challenge.title}</h3>
                       
                       <div className="grid grid-cols-3 gap-6 py-10 border-y border-white/5 my-10">
                          <div>
                             <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Total Reward</p>
                             <p className="text-3xl font-black text-white italic">+{challenge.points} XP</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Active Syncs</p>
                             <p className="text-3xl font-black text-white italic">{challenge.participants}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Complexity</p>
                             <p className="text-3xl font-black text-green-500 italic">Tier 3</p>
                          </div>
                       </div>

                       <div className="flex items-center justify-between">
                          <div className="flex -space-x-4">
                             {[1,2,3,4,5].map(i => (
                                <div key={i} className="w-12 h-12 rounded-2xl bg-white/5 border-4 border-[#0f172a] flex items-center justify-center text-[10px] font-black text-gray-500">U{i}</div>
                             ))}
                             <div className="w-12 h-12 rounded-2xl bg-green-500/10 border-4 border-[#0f172a] flex items-center justify-center text-[10px] font-black text-green-500">+{challenge.participants - 5}</div>
                          </div>
                          <div className="flex gap-4">
                             <button className="p-5 bg-white/5 border border-white/5 rounded-[24px] text-gray-500 hover:text-white transition-all"><Edit3 size={20} /></button>
                             <button className="p-5 bg-white/5 border border-white/5 rounded-[24px] text-gray-500 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                             <button className="px-10 py-5 bg-white text-slate-900 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Audit Entries</button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* SYSTEM STATS */}
        <div className="bg-[#0f172a]/20 border border-dashed border-white/10 rounded-[60px] p-20 text-center">
           <Zap size={60} className="text-gray-700 mx-auto mb-10" />
           <p className="text-lg font-black text-gray-600 uppercase tracking-[0.5em] italic mb-12">Monitor institutional gamification metrics and incentive distribution across the entire campus network.</p>
           <button className="px-12 py-6 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">Open Global Leaderboard Terminal</button>
        </div>
      </div>
    </AdminLayout>
  )
}

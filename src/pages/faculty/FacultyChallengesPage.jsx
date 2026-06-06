import { useState, useEffect } from 'react'
import { Target, Zap, Plus, Trophy, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Search, Users, Trash2, X, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function FacultyChallengesPage() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ category: 'Sustainability' })

  useEffect(() => {
    fetchChallenges()
    
    const channel = supabase
      .channel('challenges_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'green_challenges' }, () => fetchChallenges())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_participants' }, () => fetchChallenges())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
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
            description: c.description,
            instructions: c.instructions,
            category: c.category || 'Sustainability',
            points: c.points_reward,
            participants: count || 0,
            status: c.status,
            deadline: new Date(c.end_date).toLocaleDateString()
          }
        }))
        setChallenges(enhancedChallenges)
      } else { setChallenges([]) }
    } catch (err) {
      console.error('Challenges Error:', err)
      toast.error('Challenge Pulse Sync Failed')
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
                    <div className="absolute top-0 right-0 p-8 lg:p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Trophy size={80} /></div>
                    
                    <div className="relative z-10">
                       <div className="flex items-center justify-between mb-6 lg:mb-8">
                          <div className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-[7px] lg:text-[8px] font-black uppercase tracking-widest ${challenge.status === 'active' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                             {challenge.status === 'active' ? 'Operational' : 'Archived'}
                          </div>
                          <span className="text-[8px] lg:text-[10px] font-black text-gray-600 uppercase tracking-widest">{challenge.category}</span>
                       </div>

                        <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter italic mb-2 leading-tight">{challenge.title}</h3>
                        <p className="text-xs text-gray-400 font-medium mb-4">{challenge.description}</p>
                        
                        {challenge.instructions && (
                          <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">Student Instructions</p>
                            <ul className="list-decimal list-inside space-y-1 text-[11px] text-gray-300 font-medium">
                              {challenge.instructions.split('\n').filter(Boolean).map((step, idx) => (
                                <li key={idx} className="leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                       
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
                             <p className="text-[8px] lg:text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Status</p>
                             <p className="text-lg lg:text-xl font-black text-orange-500 italic">Live</p>
                          </div>
                       </div>

                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex -space-x-2 lg:-space-x-3 justify-center sm:justify-start">
                             {[1,2,3,4].map(i => (
                                <div key={i} className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/5 border-2 border-[#161b22] flex items-center justify-center text-[8px] lg:text-[10px] font-black text-gray-400">P{i}</div>
                             ))}
                             <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-orange-500/10 border-2 border-[#161b22] flex items-center justify-center text-[8px] lg:text-[10px] font-black text-orange-500">+{Math.max(0, challenge.participants - 4)}</div>
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
           <Zap size={32} className="text-gray-700 mx-auto mb-6" />
           <p className="text-[9px] lg:text-[11px] font-black text-gray-600 uppercase tracking-[0.4em] italic mb-8 max-w-lg mx-auto leading-relaxed">Deploy automated challenges to incentivize student performance and sustainability habits across the campus network.</p>
           <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-5 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl">Open Creator Terminal</button>
        </div>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-[#0f172a] border border-white/10 rounded-[32px] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
             >
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight italic">New Directive</h3>
                   <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const formDataInput = new FormData(e.target)
                   const payload = {
                    title: formDataInput.get('title'),
                    description: formDataInput.get('description'),
                    instructions: formDataInput.get('instructions'),
                    category: formData.category,
                    points_reward: Number(formDataInput.get('points')),
                    end_date: new Date(Date.now() + Number(formDataInput.get('duration')) * 86400000).toISOString(),
                    status: 'active',
                    created_by: (await supabase.auth.getUser()).data.user?.id
                  }
                  
                  const { error } = await supabase.from('green_challenges').insert(payload)
                  if (!error) {
                    toast.success('Directive Published')
                    setIsModalOpen(false)
                    fetchChallenges()
                  } else {
                    toast.error('Deployment Failed')
                  }
                }} className="space-y-4">
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Title</label>
                      <input name="title" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-black text-xs uppercase tracking-widest outline-none focus:border-orange-500/50" />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Description</label>
                      <textarea name="description" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-medium text-sm outline-none focus:border-orange-500/50" rows="2" />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Student Instructions (Step-by-step)</label>
                      <textarea name="instructions" required placeholder="e.g.&#10;1. Log your vegetarian lunch&#10;2. Offset at least 1.5kg CO2&#10;3. Earn 100 Eco XP" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-medium text-sm outline-none focus:border-orange-500/50" rows="3" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Category</label>
                          <div className="relative group/sel">
                             <div className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white flex justify-between items-center cursor-pointer group-hover/sel:border-green-500/50 transition-all">
                                <span className="text-[10px] font-black uppercase tracking-widest">{formData.category}</span>
                                <ChevronDown size={14} className="text-gray-500" />
                             </div>
                             <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover/sel:opacity-100 group-hover/sel:visible transition-all z-50 shadow-xl">
                                {['Sustainability', 'Academic', 'Social'].map(cat => (
                                   <div key={cat} onClick={() => setFormData({...formData, category: cat})} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors text-white">{cat}</div>
                                ))}
                             </div>
                          </div>
                       </div>
                     <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Reward (XP)</label>
                        <input name="points" type="number" required defaultValue="100" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-black text-xs outline-none focus:border-orange-500/50" />
                     </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Duration (Days)</label>
                      <input name="duration" type="number" required defaultValue="7" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-black text-xs outline-none focus:border-orange-500/50" />
                   </div>
                   
                   <button type="submit" className="w-full py-5 mt-4 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-105 transition-all">Publish Directive</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FacultyLayout>
  )
}

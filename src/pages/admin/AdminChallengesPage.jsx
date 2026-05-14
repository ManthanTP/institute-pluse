import { useState, useEffect } from 'react'
import { Target, Trophy, Plus, Search, Trash2, Edit3, Users, Zap, Clock, ShieldCheck, ArrowUpRight, X, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/index'

export default function AdminChallengesPage() {
  const { profile } = useAuthStore()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Sustainability',
    points_reward: 100,
    duration_days: 7
  })

  useEffect(() => {
    fetchChallenges()

    const channel = supabase
      .channel('admin_challenges_sync')
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
        .select(`
          *,
          creator:profiles!created_by(full_name),
          participants:challenge_participants(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChallenges(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Challenge Pulse Synchronization Failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      toast.error('Title and description required')
      return
    }

    try {
      setSubmitting(true)
      
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + Number(formData.duration_days))

      const { error } = await supabase
        .from('green_challenges')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          points_reward: Number(formData.points_reward),
          duration_days: Number(formData.duration_days),
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
          created_by: profile.id
        })

      if (error) throw error
      
      toast.success('Directive Published')
      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        category: 'Sustainability',
        points_reward: 100,
        duration_days: 7
      })
      fetchChallenges()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create directive')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this challenge permanently?')) return
    try {
      const { error } = await supabase.from('green_challenges').delete().eq('id', id)
      if (error) throw error
      toast.success('Deleted')
      setChallenges(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      toast.error('Failed to delete')
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

          <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-600/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
             <Plus size={16} /> Create New Directive
          </button>
        </div>

        {/* CREATE MODAL */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-[#0f172a] border border-white/10 rounded-[32px] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
               >
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-black text-white uppercase tracking-tight">New Directive</h3>
                     <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                  </div>

                  <form onSubmit={handleCreate} className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Title</label>
                        <input 
                          value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" 
                          required 
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Description</label>
                        <textarea 
                          value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" 
                          rows="3" required 
                        />
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
                          <input 
                            type="number" min="0" step="10"
                            value={formData.points_reward} onChange={e => setFormData({...formData, points_reward: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" 
                            required 
                          />
                       </div>
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Duration (Days)</label>
                        <input 
                          type="number" min="1" max="365"
                          value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" 
                          required 
                        />
                     </div>
                     
                     <button 
                       type="submit" disabled={submitting}
                       className="w-full py-4 mt-4 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                     >
                       {submitting ? 'Initializing...' : 'Publish Directive'}
                     </button>
                  </form>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CHALLENGE REGISTRY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {loading ? (
             <div className="lg:col-span-2 py-20 text-center text-gray-500 font-black uppercase tracking-widest">Loading...</div>
           ) : challenges.length === 0 ? (
             <div className="lg:col-span-2 py-20 text-center text-gray-600 font-black uppercase tracking-[0.3em]">No Active Directives</div>
           ) : (
             <AnimatePresence mode="popLayout">
                {challenges.map((challenge, idx) => {
                  const participantsCount = challenge.participants?.[0]?.count || 0

                  return (
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
                              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest truncate max-w-[150px]">
                                Creator: {challenge.creator?.full_name || 'Admin'}
                              </span>
                          </div>

                          <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-3 leading-none truncate">{challenge.title}</h3>
                          <p className="text-sm text-gray-400 mb-6 line-clamp-2">{challenge.description}</p>
                          
                          <div className="grid grid-cols-3 gap-6 py-10 border-y border-white/5 my-10">
                              <div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Total Reward</p>
                                <p className="text-3xl font-black text-white italic">+{challenge.points_reward} XP</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Active Syncs</p>
                                <p className="text-3xl font-black text-white italic">{participantsCount}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Complexity</p>
                                <p className="text-3xl font-black text-green-500 italic">Tier 3</p>
                              </div>
                          </div>

                          <div className="flex items-center justify-between">
                              <div className="flex -space-x-4">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-2xl bg-white/5 border-4 border-[#0f172a] flex items-center justify-center text-[10px] font-black text-gray-500">U{i}</div>
                                ))}
                                {participantsCount > 3 && (
                                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 border-4 border-[#0f172a] flex items-center justify-center text-[10px] font-black text-green-500">+{participantsCount - 3}</div>
                                )}
                              </div>
                              <div className="flex gap-4">
                                <button onClick={() => handleDelete(challenge.id)} className="p-5 bg-white/5 border border-white/5 rounded-[24px] text-gray-500 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                                <button className="px-10 py-5 bg-white text-slate-900 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Audit Entries</button>
                              </div>
                          </div>
                        </div>
                    </motion.div>
                  )
                })}
             </AnimatePresence>
           )}
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

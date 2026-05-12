import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Star, TrendingUp, Medal, Award, Users, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { label: 'Campus', icon: Trophy, id: 'campus' },
  { label: 'Department', icon: Users, id: 'dept' },
  { label: 'Challenges', icon: Star, id: 'challenges' },
  { label: 'Badges', icon: Award, id: 'badges' }
]

const PERIODS = ['Weekly', 'Monthly', 'All Time']

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [activeTab, setActiveTab] = useState('campus')
  const [period, setPeriod] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [challenges, setChallenges] = useState([])
  const [myBadges, setMyBadges] = useState([])
  const [loading, setLoading] = useState(false)
  const [joinedChallenges, setJoinedChallenges] = useState([])

  useEffect(() => {
    if (activeTab === 'campus' || activeTab === 'dept') fetchLeaderboard()
    if (activeTab === 'challenges') fetchChallenges()
    if (activeTab === 'badges') fetchBadges()
  }, [activeTab, period, profile?.department])

  async function fetchLeaderboard() {
    setLoading(true)
    let query = supabase.from('profiles')
      .select('id, full_name, department, eco_points, total_co2_kg, logging_streak')
      .order('eco_points', { ascending: false })
      .limit(50)

    if (activeTab === 'dept' && profile?.department) {
      query = query.eq('department', profile.department)
    }

    const { data } = await query
    setLeaderboard(data || [])
    setLoading(false)
  }

  async function fetchChallenges() {
    const { data } = await supabase.from('green_challenges').select('*').order('created_at', { ascending: false })
    setChallenges(data || [])

    if (profile?.id) {
      const { data: joined } = await supabase.from('challenge_participants')
        .select('challenge_id').eq('student_id', profile.id)
      setJoinedChallenges((joined || []).map(j => j.challenge_id))
    }
  }

  async function fetchBadges() {
    if (!profile?.id) return
    const { data } = await supabase.from('eco_badges').select('*').eq('student_id', profile.id)
    setMyBadges((data || []).map(b => b.badge_key))
  }

  async function joinChallenge(challengeId) {
    if (!profile?.id) return
    await supabase.from('challenge_participants').insert({
      challenge_id: challengeId, student_id: profile.id, joined_at: new Date().toISOString()
    })
    setJoinedChallenges(prev => [...prev, challengeId])
  }

  const myRank = leaderboard.findIndex(u => u.id === profile?.id) + 1

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-yellow-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-green-500/5 blur-[120px]" />
      </div>

      <div className="px-6 pt-6 space-y-8 relative z-10">
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Eco Points', value: (profile?.eco_points || 0).toLocaleString(), icon: Star, color: 'text-yellow-500' },
            { label: 'Global Rank', value: myRank ? `#${myRank}` : '—', icon: Trophy, color: 'text-green-500' },
            { label: 'Streak', value: `${profile?.logging_streak || 0}d`, icon: TrendingUp, color: 'text-blue-500' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col items-center justify-center text-center backdrop-blur-xl">
              <s.icon size={16} className={`${s.color} mb-2`} />
              <p className="text-sm font-black text-white tracking-tight leading-none mb-1">{s.value}</p>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none">{s.label}</p>
            </div>
          ))}
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
          {TABS.map(t => {
            const Icon = t.icon
            const isActive = activeTab === t.id
            return (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(t.id)}
                className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                  isActive 
                    ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20' 
                    : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{t.label}</span>
              </motion.button>
            )
          })}
        </div>

        {/* CONTENT AREA */}
        <div className="space-y-4">
          {/* PERIOD SELECTOR FOR LEADERBOARD */}
          {(activeTab === 'campus' || activeTab === 'dept') && (
            <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit">
              {PERIODS.map((p, i) => (
                <button
                  key={p}
                  onClick={() => setPeriod(i)}
                  className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    period === i ? 'bg-white text-slate-950' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-10 h-10 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ranking Warriors...</p>
              </motion.div>
            ) : activeTab === 'campus' || activeTab === 'dept' ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {leaderboard.length === 0 ? (
                  <div className="py-12 text-center bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl px-8">
                     <div className="text-4xl mb-4 opacity-50">🍃</div>
                     <p className="text-xs font-black text-white uppercase tracking-widest">No Data Found</p>
                     <p className="text-[10px] font-medium text-gray-500 mt-2">Start your sustainability journey today!</p>
                  </div>
                ) : leaderboard.map((user, i) => {
                  const isMe = user.id === profile?.id
                  const isTop3 = i < 3
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`group relative flex items-center gap-4 p-4 rounded-[28px] border transition-all duration-300 ${
                        isMe 
                          ? 'bg-green-600 text-white border-green-600 shadow-xl shadow-green-600/20' 
                          : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {/* RANK */}
                      <div className={`flex-shrink-0 w-8 text-center text-xs font-black uppercase tracking-tighter ${
                        isTop3 && !isMe ? 'text-yellow-500' : isMe ? 'text-white' : 'text-gray-500'
                      }`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </div>

                      {/* AVATAR */}
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-white uppercase overflow-hidden shadow-inner">
                        {user.full_name?.[0]}
                      </div>

                      {/* INFO */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-black uppercase tracking-tight truncate ${isMe ? 'text-white' : 'text-white'}`}>
                          {user.full_name} {isMe && '✨'}
                        </p>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${isMe ? 'text-white/60' : 'text-gray-500'}`}>
                          {user.department || 'General'}
                        </p>
                      </div>

                      {/* SCORE */}
                      <div className="text-right">
                        <p className={`text-xs font-black tracking-tighter leading-none mb-1 ${isMe ? 'text-white' : 'text-green-500'}`}>
                          {(user.eco_points || 0).toLocaleString()}
                        </p>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${isMe ? 'text-white/60' : 'text-gray-500'}`}>
                          Points
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : activeTab === 'challenges' ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {challenges.length === 0 ? (
                  <div className="py-12 text-center bg-white/5 border border-white/10 rounded-[32px]">
                     <div className="text-4xl mb-4">🎯</div>
                     <p className="text-xs font-black text-white uppercase tracking-widest">Awaiting Challenges</p>
                  </div>
                ) : challenges.map((ch, i) => {
                  const joined = joinedChallenges.includes(ch.id)
                  return (
                    <motion.div
                      key={ch.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-2xl rounded-full -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors" />
                      
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest">
                          {ch.category}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                          <TrendingUp size={10} /> {ch.duration_days} Days
                        </div>
                      </div>

                      <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2 relative z-10">{ch.title}</h3>
                      <p className="text-[10px] font-medium text-gray-500 leading-relaxed mb-6 line-clamp-2 relative z-10">{ch.description}</p>

                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-1.5">
                          <Star size={14} className="text-yellow-500" />
                          <span className="text-xs font-black text-white">+{ch.points_reward}</span>
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Eco Pts</span>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => !joined && joinChallenge(ch.id)}
                          disabled={joined}
                          className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            joined 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                              : 'bg-white text-slate-950 shadow-lg shadow-white/10'
                          }`}
                        >
                          {joined ? '✓ Active' : 'Join Challenge'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-2 gap-4"
              >
                {/* MY BADGES WILL BE INTEGRATED LATER WITH THE FULL CALCULATOR */}
                <div className="col-span-2 py-12 text-center bg-white/5 border border-white/10 rounded-[32px]">
                   <div className="text-4xl mb-4">🏅</div>
                   <p className="text-xs font-black text-white uppercase tracking-widest">Badges Coming Soon</p>
                   <p className="text-[10px] font-medium text-gray-500 mt-2">Earned from zero-carbon logs!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

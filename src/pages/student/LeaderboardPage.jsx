import { useState, useEffect } from 'react'
import { Trophy, Medal, Star, Search, ChevronLeft, Home, LayoutGrid, CalendarDays, Coffee, User, TrendingUp, Award, Flame, Users, Target } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const TABS = [
  { id: 'Global', icon: Globe, label: 'Campus' },
  { id: 'Department', icon: Users, label: 'Dept' },
  { id: 'Monthly', icon: CalendarDays, label: 'Monthly' }
]

function Globe(props) {
  return <TrendingUp {...props} /> // Fallback for Globe if not imported
}

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Global')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchLeaders()
  }, [activeTab])

  async function fetchLeaders() {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('full_name, eco_points, department, avatar_url, id')
      .order('eco_points', { ascending: false })
      .limit(50)
    
    if (activeTab === 'Department' && profile?.department) {
      query = query.eq('department', profile.department)
    }

    const { data } = await query
    if (data) setLeaders(data)
    setLoading(false)
  }

  const userRank = leaders.findIndex(l => l.id === profile?.id) + 1
  const filteredLeaders = leaders.filter(l => 
    l.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-yellow-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-blue-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Ranking</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-yellow-600/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
             <Trophy size={24} className="animate-pulse" />
          </div>
        </div>

        {/* MY STATUS CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-600 to-orange-700 rounded-[40px] p-8 mb-10 shadow-[0_20px_40px_rgba(202,138,4,0.2)] relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <Award size={120} />
           </div>
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Your Nexus Standpoint</p>
              <div className="flex items-baseline gap-3 mb-6">
                 <h2 className="text-5xl font-black tracking-tighter italic">#{userRank || '--'}</h2>
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Global Position</span>
              </div>
              <div className="flex items-center gap-6 pt-6 border-t border-white/10">
                 <div>
                    <p className="text-lg font-black tracking-tighter">{profile?.eco_points || 0}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Eco Points</p>
                 </div>
                 <div className="w-[1px] h-6 bg-white/10" />
                 <div>
                    <p className="text-lg font-black tracking-tighter">{(leaders.length > 0) ? 'Active' : 'Offline'}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Status</p>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* TABS */}
        <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-[32px] mb-10">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 rounded-[24px] flex items-center justify-center gap-2 transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-black shadow-xl font-black' 
                  : 'text-gray-500 font-bold hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              <span className="text-[9px] uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* LIST SECTION */}
        <div className="space-y-3">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Calculating Hierarchy...</p>
             </div>
          ) : filteredLeaders.map((leader, i) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-[#161b22]/80 border border-white/5 rounded-[28px] p-5 backdrop-blur-2xl flex items-center gap-5 group transition-all ${leader.id === profile?.id ? 'ring-2 ring-yellow-500/50 bg-yellow-500/10' : ''}`}
            >
              <div className="w-8 flex justify-center">
                 {i < 3 ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                       i === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                       i === 1 ? 'bg-gray-400/20 text-gray-400' : 
                       'bg-orange-500/20 text-orange-500'
                    }`}>
                       <Medal size={16} />
                    </div>
                 ) : (
                    <span className="text-[11px] font-black text-gray-600 group-hover:text-white transition-colors">{i + 1}</span>
                 )}
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-sm font-black text-white border border-white/10 uppercase shadow-inner">
                 {leader.full_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="text-[13px] font-black text-white uppercase tracking-tight truncate">{leader.full_name}</h4>
                 <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-0.5">{leader.department || 'Nexus User'}</p>
              </div>
              <div className="text-right">
                 <div className="flex items-center gap-1 justify-end">
                    <Star size={10} className="text-yellow-500" fill="currentColor" />
                    <p className="text-sm font-black text-white tracking-tighter leading-none">{leader.eco_points}</p>
                 </div>
                 <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest mt-1 italic leading-none">XP Power</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100]">
        <div className="bg-[#161b22]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <NavIcon icon={Home} label="Home" onClick={() => navigate('/dashboard')} />
          <NavIcon icon={LayoutGrid} label="Log" onClick={() => navigate('/carbon-log')} />
          <NavIcon icon={CalendarDays} label="Events" onClick={() => navigate('/events')} />
          <NavIcon icon={Coffee} label="Cafe" onClick={() => navigate('/cafeteria')} />
          <NavIcon icon={User} label="Me" onClick={() => navigate('/profile')} />
        </div>
      </div>
    </div>
  )
}

function NavIcon({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}`}>
        <Icon size={20} strokeWidth={active ? 3 : 2} />
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
    </button>
  )
}

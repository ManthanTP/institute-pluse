import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Megaphone, AlertTriangle, Clock, ChevronLeft, Bell, BellOff, Info, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import BottomTabBar from '../../components/BottomTabBar'

const PRIORITY_CONFIG = {
  urgent: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle },
  warning: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Info },
  info: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Megaphone }
}

export default function AnnouncementsPage() {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()

    const channel = supabase
      .channel('public_announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        fetchAnnouncements()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchAnnouncements() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('announcements')
        .select('*, author:profiles!created_by(full_name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      const filtered = (data || []).filter(a => a.audience_type === 'global' || a.audience_type === 'students')
      if (filtered.length > 0) setAnnouncements(filtered)
      else setAnnouncements([])
    } catch (err) {
      console.error('Announcement fetch error:', err)
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }

  function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-24 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[60%] h-[40%] rounded-full bg-orange-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-6 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Campus News</span>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Public Broadcasts</h2>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
           <Megaphone size={18} />
        </div>
      </div>

      <main className="px-6 relative z-10 max-w-lg mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
             <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Scanning Frequencies...</p>
          </div>
        ) : announcements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center mb-8 border border-white/5">
              <BellOff size={40} className="text-gray-600" />
            </div>
            <p className="font-black text-white text-xl tracking-tight">Broadcast Silence ✨</p>
            <p className="text-sm text-gray-500 mt-2 max-w-[220px] font-medium leading-relaxed tracking-tight">
              No public announcements are currently active in the sector.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {announcements.map((ann, idx) => {
                const config = PRIORITY_CONFIG[ann.priority] || PRIORITY_CONFIG.info
                const Icon = config.icon
                return (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/[0.03] border border-white/5 rounded-[32px] p-6 backdrop-blur-3xl group hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.bg} ${config.color} ${config.border} border shadow-lg`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-tight">{ann.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{getTimeAgo(ann.created_at)}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700" />
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Global Protocol</span>
                          </div>
                        </div>
                      </div>
                      {ann.priority === 'urgent' && (
                        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                           <span className="text-[8px] font-black text-red-500 uppercase tracking-widest animate-pulse">Urgent</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[13px] text-gray-400 font-medium leading-relaxed pl-1 whitespace-pre-wrap">{ann.content}</p>
                    
                    <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                       <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Relayed By</span>
                       <span className="text-[9px] font-black text-white uppercase tracking-widest">{ann.author?.full_name || 'System Admin'}</span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      <BottomTabBar />
    </div>
  )
}

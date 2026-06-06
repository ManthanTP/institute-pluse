import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, BellOff, Filter, CheckCircle2, Info, ShoppingBag, GraduationCap, AlertCircle, Trophy, Leaf, Clock } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useNotifStore, useAuthStore } from '../../store/index'
import BottomTabBar from '../../components/BottomTabBar'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_CONFIG = {
  eco: { icon: Leaf, color: 'text-green-500', bg: 'bg-green-500/10' },
  badge: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  order: { icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  attendance: { icon: GraduationCap, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  class_update: { icon: Clock, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  complaint: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  challenge: { icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  announcement: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  general: { icon: Info, color: 'text-gray-400', bg: 'bg-white/5' }
}

const FILTER_TABS = [
  { label: 'All', type: null },
  { label: 'Eco', type: 'eco' },
  { label: 'Badges', type: 'badge' },
  { label: 'Food', type: 'order' },
  { label: 'Attend', type: 'attendance' },
  { label: 'Issues', type: 'complaint' },
]

// Strip session codes from notification messages (students should not see them)
function sanitizeMessage(msg) {
  if (!msg) return msg
  return msg.replace(/\s*Use Code:\s*\S+/gi, '').trim()
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, markAllRead, markRead } = useNotifStore()
  const [filterTab, setFilterTab] = useState(0)
  const [displayNotifs, setDisplayNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      setLoading(true)
      fetchNotifications(profile.id).finally(() => setLoading(false))
      const sub = useNotifStore.getState().subscribeToNotifications(profile.id)
      return () => { supabase.removeChannel(sub) }
    }
  }, [profile?.id])

  useEffect(() => {
    if (notifications.length > 0) setDisplayNotifs(notifications)
    else setDisplayNotifs([])
  }, [notifications])

  const filtered = filterTab === 0
    ? displayNotifs
    : displayNotifs.filter(n => {
        const targetType = FILTER_TABS[filterTab].type
        const t = n.type?.toLowerCase()
        if (targetType === 'attendance') {
          return t === 'attendance' || t === 'class_update' || t === 'attend'
        }
        if (targetType === 'complaint') {
          return t === 'complaint' || t === 'issue' || t === 'issues'
        }
        if (targetType === 'order') {
          return t === 'order' || t === 'food' || t === 'cafeteria'
        }
        if (targetType === 'badge') {
          return t === 'badge' || t === 'badges' || t === 'eco_badge'
        }
        if (targetType === 'eco') {
          return t === 'eco' || t === 'challenge' || t === 'sustainability'
        }
        return t === targetType
      })

  const unreadNotifs = filtered.filter(n => !n.is_read)
  const readNotifs = filtered.filter(n => n.is_read)

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Feed Core...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-24 relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[60%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[40%] rounded-full bg-green-500/5 blur-[100px]" />
      </div>

      {/* TOP ROW WITH TITLE & ACTIONS */}
      <div className="flex items-center justify-between px-6 py-6 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="hidden lg:flex w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Activity Stream</span>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Recent Alerts</h2>
          </div>
        </div>
        {unreadCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => profile?.id && markAllRead(profile.id)}
            className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/5"
          >
            Mark All Read
          </motion.button>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-6 py-5 relative z-10">
        {FILTER_TABS.map((t, i) => (
          <motion.button
            key={t.label}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterTab(i)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${
              filterTab === i 
                ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20' 
                : 'bg-white/5 text-gray-500 border-white/5'
            }`}
          >
            {t.label}
          </motion.button>
        ))}
      </div>

      <main className="px-4 md:px-6 relative z-10 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-24 h-24 rounded-2xl md:rounded-[32px] bg-white/5 flex items-center justify-center mb-8 border border-white/5">
                <BellOff size={40} className="text-gray-600" />
              </div>
              <p className="font-black text-white text-xl tracking-tight">System Silent ✨</p>
              <p className="text-sm text-gray-500 mt-2 max-w-[220px] font-medium leading-relaxed tracking-tight">
                You're completely up to date with the campus ecosystem.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="notifications-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {unreadNotifs.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 ml-1">New Alerts</h3>
                  <div className="flex flex-col gap-4">
                    {unreadNotifs.map((n, idx) => {
                       const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general
                       const Icon = cfg.icon
                       return (
                         <motion.button
                           key={n.id}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: idx * 0.05 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => markRead(n.id)}
                           className="w-full text-left rounded-2xl md:rounded-[32px] p-4 md:p-5 flex items-start gap-4 md:gap-5 transition-all border relative overflow-hidden group bg-white/[0.05] border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/50"
                         >
                           <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                           <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${cfg.bg} ${cfg.color} shadow-lg shadow-black/20`}>
                             <Icon size={20} className="md:w-6 md:h-6" />
                           </div>
                           <div className="flex-1 min-w-0 py-1">
                             <div className="flex justify-between items-start mb-1.5">
                               <h3 className="text-sm font-black tracking-tight text-white">
                                 {n.title}
                               </h3>
                               <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2 whitespace-nowrap">
                                 {format(new Date(n.created_at), 'h:mm a')}
                               </span>
                             </div>
                             <p className="text-xs leading-relaxed font-medium text-gray-300">
                               {sanitizeMessage(n.message)}
                             </p>
                             {n.sender && (
                               <div className="mt-2 text-[8px] font-black text-blue-400 uppercase tracking-widest">
                                 From: {n.sender.full_name} ({n.sender.role})
                               </div>
                             )}
                           </div>
                         </motion.button>
                       )
                    })}
                  </div>
                </div>
              )}

              {readNotifs.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 ml-1">Earlier</h3>
                  <div className="flex flex-col gap-4">
                    {readNotifs.map((n, idx) => {
                       const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general
                       const Icon = cfg.icon
                       return (
                         <div
                           key={n.id}
                           className="w-full text-left rounded-2xl md:rounded-[32px] p-4 md:p-5 flex items-start gap-4 md:gap-5 transition-all border relative overflow-hidden group bg-white/[0.02] border-white/5 opacity-60"
                         >
                           <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all bg-white/5 text-gray-600">
                             <Icon size={20} className="md:w-6 md:h-6" />
                           </div>
                           <div className="flex-1 min-w-0 py-1">
                             <div className="flex justify-between items-start mb-1.5">
                               <h3 className="text-sm font-black tracking-tight text-gray-400">
                                 {n.title}
                               </h3>
                               <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2 whitespace-nowrap">
                                 {format(new Date(n.created_at), 'MM/dd h:mm a')}
                               </span>
                             </div>
                             <p className="text-xs leading-relaxed font-medium text-gray-500">
                               {sanitizeMessage(n.message)}
                             </p>
                             {n.sender && (
                               <div className="mt-2 text-[8px] font-black text-gray-500 uppercase tracking-widest">
                                 From: {n.sender.full_name} ({n.sender.role})
                               </div>
                             )}
                           </div>
                         </div>
                       )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomTabBar />
    </div>
  )
}



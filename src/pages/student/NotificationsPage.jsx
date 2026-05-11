import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, BellOff, Filter, CheckCircle2, Info, Bus, ShoppingBag, GraduationCap, AlertCircle, Trophy, Leaf } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { useNotifStore, useAuthStore } from '../../store/index'
import BottomTabBar from '../../components/BottomTabBar'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_CONFIG = {
  eco: { icon: Leaf, color: 'text-green-500', bg: 'bg-green-500/10' },
  badge: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  bus: { icon: Bus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  order: { icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  attendance: { icon: GraduationCap, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  complaint: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  challenge: { icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  general: { icon: Info, color: 'text-gray-400', bg: 'bg-white/5' }
}

const FILTER_TABS = [
  { label: 'All', type: null },
  { label: 'Eco', type: 'eco' },
  { label: 'Bus', type: 'bus' },
  { label: 'Food', type: 'order' },
  { label: 'Attend', type: 'attendance' },
  { label: 'Issues', type: 'complaint' },
]

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, markAllRead, markRead } = useNotifStore()
  const [filterTab, setFilterTab] = useState(0)

  useEffect(() => {
    if (profile?.id) fetchNotifications(profile.id)
  }, [profile?.id])

  const filtered = filterTab === 0
    ? notifications
    : notifications.filter(n => n.type === FILTER_TABS[filterTab].type)

  function groupByDate(notifs) {
    const groups = {}
    notifs.forEach(n => {
      const d = new Date(n.created_at)
      const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d')
      if (!groups[label]) groups[label] = []
      groups[label].push(n)
    })
    return groups
  }

  const grouped = groupByDate(filtered)

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-24 relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[60%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[40%] rounded-full bg-green-500/5 blur-[100px]" />
      </div>

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 px-6 py-4 backdrop-blur-xl bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </motion.button>
          <h1 className="text-xl font-black text-white tracking-tight">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => profile?.id && markAllRead(profile.id)}
            className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl hover:bg-green-500/10 transition-all"
          >
            Clear All
          </motion.button>
        )}
      </header>

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

      <main className="px-6 relative z-10 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center mb-8 border border-white/5">
                <BellOff size={40} className="text-gray-600" />
              </div>
              <p className="font-black text-white text-xl tracking-tight">System Silent ✨</p>
              <p className="text-sm text-gray-500 mt-2 max-w-[220px] font-medium leading-relaxed tracking-tight">
                You're completely up to date with the campus ecosystem.
              </p>
            </motion.div>
          ) : (
            Object.entries(grouped).map(([label, notifs]) => (
              <div key={label} className="mb-10">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-5 ml-1">{label}</p>
                <div className="flex flex-col gap-4">
                  {notifs.map((n, idx) => {
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
                        className={`w-full text-left rounded-[32px] p-5 flex items-start gap-5 transition-all border relative overflow-hidden group ${
                          n.is_read 
                            ? 'bg-white/[0.02] border-white/5 opacity-60' 
                            : 'bg-white/[0.05] border-white/10 shadow-2xl'
                        }`}
                      >
                        {!n.is_read && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                        )}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                          n.is_read ? 'bg-white/5 text-gray-600' : `${cfg.bg} ${cfg.color} shadow-lg shadow-black/20`
                        }`}>
                          <Icon size={24} />
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <div className="flex justify-between items-start mb-1.5">
                            <h3 className={`text-sm font-black tracking-tight ${n.is_read ? 'text-gray-400' : 'text-white'}`}>
                              {n.title}
                            </h3>
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2 whitespace-nowrap">
                              {format(new Date(n.created_at), 'h:mm a')}
                            </span>
                          </div>
                          <p className={`text-xs leading-relaxed font-medium ${n.is_read ? 'text-gray-500' : 'text-gray-400'}`}>
                            {n.message}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </AnimatePresence>
      </main>

      <BottomTabBar />
    </div>
  )
}



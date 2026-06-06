import { useState, useEffect } from 'react'
import { Bell, BellOff, ShieldCheck, AlertCircle, MessageSquare, Trash2, CheckCircle2, Users, Calendar, Megaphone, Leaf, Trophy, ShoppingBag, GraduationCap, Clock, Info } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { format, isToday, isYesterday } from 'date-fns'

const TYPE_CONFIG = {
  eco: { icon: Leaf, color: 'text-green-500', bg: 'bg-green-500/10' },
  badge: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  order: { icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  attendance: { icon: GraduationCap, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  class_update: { icon: Clock, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  complaint: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  challenge: { icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  announcement: { icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  event: { icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  system: { icon: ShieldCheck, color: 'text-gray-400', bg: 'bg-white/5' },
  general: { icon: Info, color: 'text-gray-400', bg: 'bg-white/5' }
}

const FILTER_TABS = [
  { label: 'All', type: null },
  { label: 'Attend', type: 'attendance' },
  { label: 'Issues', type: 'complaint' },
  { label: 'Events', type: 'event' },
  { label: 'System', type: 'system' },
]

export default function FacultyNotificationsPage() {
  const { profile } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState(0)

  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('faculty_notifs_live')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${profile?.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        toast('New notification 🔔', { icon: '📡' })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile?.id])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error('Notifications error:', err)
      toast.error('Failed to sync alerts')
    } finally {
      setLoading(false)
    }
  }

  async function markAllRead() {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile?.id)
        .eq('is_read', false)
      if (error) throw error
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('All marked as read')
    } catch (err) {
      toast.error('Failed to mark read')
    }
  }

  async function markRead(id) {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  async function clearAll() {
    if (!confirm('Clear all notifications?')) return
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', profile?.id)
      if (error) throw error
      setNotifications([])
      toast.success('Notifications cleared')
    } catch (err) {
      toast.error('Failed to clear')
    }
  }

  const filtered = filterTab === 0
    ? notifications
    : notifications.filter(n => {
        const targetType = FILTER_TABS[filterTab].type
        const t = n.type?.toLowerCase()
        if (targetType === 'attendance') {
          return t === 'attendance' || t === 'class_update' || t === 'attend'
        }
        if (targetType === 'complaint') {
          return t === 'complaint' || t === 'issue' || t === 'issues'
        }
        if (targetType === 'event') {
          return t === 'event' || t === 'events' || t === 'challenge'
        }
        if (targetType === 'system') {
          return t === 'system' || t === 'security' || t === 'alert'
        }
        return t === targetType
      })

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
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <FacultyLayout>
      <div className="space-y-6 lg:space-y-8 pb-20 max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bell size={12} className="text-blue-500" />
              <span className="text-[8px] lg:text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Activity Stream</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[8px] font-black">{unreadCount}</span>
              )}
            </div>
            <h2 className="text-xl lg:text-3xl font-black text-white tracking-tighter uppercase leading-none">Recent <span className="text-blue-500">Alerts</span></h2>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[8px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                Mark All Read
              </button>
            )}
            <button onClick={clearAll} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-red-400 transition-all">
              Clear All
            </button>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {FILTER_TABS.map((t, i) => (
            <motion.button
              key={t.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterTab(i)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${
                filterTab === i 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                  : 'bg-white/5 text-gray-500 border-white/5 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {t.label}
            </motion.button>
          ))}
        </div>

        {/* NOTIFICATIONS LIST */}
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Syncing Alerts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5">
              <BellOff size={32} className="text-gray-600" />
            </div>
            <p className="font-black text-white text-lg tracking-tight uppercase">System Silent ✨</p>
            <p className="text-sm text-gray-500 mt-2 max-w-[260px] font-medium leading-relaxed">
              {filterTab === 0 ? 'No notifications yet. Activity alerts will appear here.' : 'No notifications in this category.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([label, notifs]) => (
              <div key={label}>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 ml-1">{label}</p>
                <div className="flex flex-col gap-3">
                  {notifs.map((n, idx) => {
                    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general
                    const Icon = cfg.icon
                    return (
                      <motion.button
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => markRead(n.id)}
                        className={`w-full text-left rounded-2xl p-4 lg:p-5 flex items-start gap-4 transition-all border relative overflow-hidden group ${
                          n.is_read 
                            ? 'bg-[#161b22]/40 border-white/5 opacity-60' 
                            : 'bg-[#161b22] border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]'
                        }`}
                      >
                        {!n.is_read && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        )}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                          n.is_read ? 'bg-white/5 text-gray-600' : `${cfg.bg} ${cfg.color} shadow-lg shadow-black/20`
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <div className="flex justify-between items-start mb-1.5">
                            <h3 className={`text-sm font-black tracking-tight ${n.is_read ? 'text-gray-400' : 'text-white'}`}>
                              {n.title}
                            </h3>
                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-2 whitespace-nowrap">
                              {format(new Date(n.created_at), 'h:mm a')}
                            </span>
                          </div>
                          <p className={`text-xs leading-relaxed font-medium line-clamp-2 ${n.is_read ? 'text-gray-500' : 'text-gray-400'}`}>
                            {n.message}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FacultyLayout>
  )
}

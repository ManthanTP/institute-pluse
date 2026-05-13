import { useState, useEffect } from 'react'
import { Bell, Zap, Clock, ShieldCheck, AlertCircle, MessageSquare, Trash2, CheckCircle2, Users, Calendar, Megaphone } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function FacultyNotificationsPage() {
  const { profile } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()

    // Subscribe to real-time events
    const channels = []
    
    const complaintsChannel = supabase
      .channel('notif_complaints')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'complaints' }, (payload) => {
        addNotification({
          type: 'complaint',
          title: 'New Complaint Filed',
          content: `"${payload.new.title}" - ${payload.new.category} (${payload.new.priority} priority)`,
          time: new Date(payload.new.created_at)
        })
      })
      .subscribe()
    channels.push(complaintsChannel)

    const announcementsChannel = supabase
      .channel('notif_announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
        addNotification({
          type: 'announcement',
          title: 'New Announcement',
          content: payload.new.content?.substring(0, 100),
          time: new Date(payload.new.created_at)
        })
      })
      .subscribe()
    channels.push(announcementsChannel)

    return () => { channels.forEach(c => supabase.removeChannel(c)) }
  }, [])

  function addNotification(notif) {
    setNotifications(prev => [{
      id: Date.now(),
      ...notif,
      read: false,
      time: notif.time || new Date()
    }, ...prev])
    toast('New notification 🔔', { icon: '📡' })
  }

  async function fetchNotifications() {
    setLoading(true)
    try {
      // Fetch recent complaints and events as notifications
      const [complaintsRes, announcementsRes, eventsRes] = await Promise.all([
        supabase.from('complaints').select('id, title, category, priority, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('announcements').select('id, title, content, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('events').select('id, title, created_at').order('created_at', { ascending: false }).limit(5)
      ])

      const allNotifs = []

      if (complaintsRes.data) {
        complaintsRes.data.forEach(c => {
          allNotifs.push({
            id: `complaint_${c.id}`,
            type: 'complaint',
            title: 'Student Complaint',
            content: `"${c.title}" - ${c.category} priority: ${c.priority}`,
            time: new Date(c.created_at),
            read: true
          })
        })
      }

      if (announcementsRes.data) {
        announcementsRes.data.forEach(a => {
          allNotifs.push({
            id: `ann_${a.id}`,
            type: 'announcement',
            title: a.title || 'Announcement',
            content: a.content?.substring(0, 120),
            time: new Date(a.created_at),
            read: true
          })
        })
      }

      if (eventsRes.data) {
        eventsRes.data.forEach(e => {
          allNotifs.push({
            id: `event_${e.id}`,
            type: 'event',
            title: 'New Event Created',
            content: e.title,
            time: new Date(e.created_at),
            read: true
          })
        })
      }

      // Sort by time
      allNotifs.sort((a, b) => b.time - a.time)
      setNotifications(allNotifs)
    } catch (err) {
      console.error('Notifications error:', err)
    } finally {
      setLoading(false)
    }
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All marked as read')
  }

  function clearAll() {
    setNotifications([])
    toast.success('Notifications cleared')
  }

  function getTimeAgo(date) {
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const ICON_MAP = {
    complaint: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    announcement: { icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    attendance: { icon: Zap, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    event: { icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    system: { icon: ShieldCheck, color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10' }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <FacultyLayout>
      <div className="space-y-6 lg:space-y-8 pb-20 max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Bell size={12} className="text-blue-500" />
              <span className="text-[8px] lg:text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Alert Center</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[8px] font-black">{unreadCount}</span>
              )}
            </div>
            <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-none">Active <span className="text-blue-500">Alerts</span></h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              {notifications.length} total notifications
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-3">
             <button onClick={markAllRead} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">Mark All Read</button>
             <button onClick={clearAll} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-red-400 transition-all">Clear All</button>
          </div>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="space-y-3">
           {loading ? (
             <div className="py-16 flex flex-col items-center gap-4">
               <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
               <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Loading...</p>
             </div>
           ) : notifications.length === 0 ? (
             <div className="py-16 text-center flex flex-col items-center gap-4">
               <Bell size={40} className="text-gray-800 opacity-20" />
               <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">No notifications yet</p>
             </div>
           ) : (
             <AnimatePresence mode="popLayout">
                {notifications.map((notif, idx) => {
                  const style = ICON_MAP[notif.type] || ICON_MAP.system
                  const Icon = style.icon

                  return (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`p-4 lg:p-5 rounded-2xl border transition-all flex items-start gap-3 lg:gap-4 relative ${
                        notif.read 
                          ? 'bg-[#161b22]/40 border-white/5' 
                          : 'bg-[#161b22] border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]'
                      }`}
                    >
                       {!notif.read && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl" />}
                       
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${style.bg} ${style.border} ${style.color}`}>
                          <Icon size={18} />
                       </div>

                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                             <h4 className={`text-sm font-black uppercase tracking-tight truncate ${notif.read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h4>
                             <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest whitespace-nowrap">{getTimeAgo(notif.time)}</span>
                          </div>
                          <p className={`text-[11px] font-medium leading-relaxed mt-1 line-clamp-2 ${notif.read ? 'text-gray-600' : 'text-gray-400'}`}>{notif.content}</p>
                       </div>
                    </motion.div>
                  )
                })}
             </AnimatePresence>
           )}
        </div>
      </div>
    </FacultyLayout>
  )
}

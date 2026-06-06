import { useState, useEffect } from 'react'
import { Bell, BellOff, ShieldAlert, Activity, Trash2, CheckCircle2, ShieldCheck, Zap, Megaphone, Send, Info, MessageSquare, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'All', label: 'All Alerts', icon: Bell, color: '#ef4444' },
  { id: 'system', label: 'System', icon: Zap, color: '#f59e0b' },
  { id: 'security', label: 'Security', icon: ShieldAlert, color: '#ef4444' },
  { id: 'complaint', label: 'Complaints', icon: MessageSquare, color: '#ec4899' },
  { id: 'event', label: 'Events', icon: Calendar, color: '#06b6d4' },
 ]

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  // Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastContent, setBroadcastContent] = useState('')
  const [broadcastPriority, setBroadcastPriority] = useState('info')
  const [broadcasting, setBroadcasting] = useState(false)

  useEffect(() => {
    fetchNotifications()

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('admin_notifications_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => {
            if (prev.some(n => n.id === payload.new.id)) return prev
            return [payload.new, ...prev]
          })
          toast('New system alert 🔔', { icon: '📡' })
        } else {
          fetchNotifications(true)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchNotifications(quiet = false) {
    try {
      if (!quiet) setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to sync system alerts')
    } finally {
      if (!quiet) setLoading(false)
    }
  }

  async function handleSendAnnouncement(e) {
    e.preventDefault()
    if (!broadcastTitle.trim() || !broadcastContent.trim()) {
      toast.error('Title and content are required')
      return
    }

    try {
      setBroadcasting(true)
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: broadcastTitle.trim(),
          content: broadcastContent.trim(),
          priority: broadcastPriority,
          audience_type: 'global'
        })

      if (error) throw error

      toast.success('Global Announcement Broadcasted ✓')
      setBroadcastTitle('')
      setBroadcastContent('')
    } catch (err) {
      toast.error('Failed to deploy broadcast: ' + err.message)
    } finally {
      setBroadcasting(false)
    }
  }

  async function handleMarkRead(id) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      if (error) throw error
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function handleMarkAllRead() {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)

      if (error) throw error
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('All Alerts Marked as Read')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'All') return true
    return n.type === activeCategory
  })

  const unreadNotifs = filteredNotifications.filter(n => !n.is_read)
  const readNotifs = filteredNotifications.filter(n => n.is_read)

  const getNotifIcon = (type) => {
    switch (type) {
      case 'security': return <ShieldAlert size={18} className="text-red-500" />
      case 'system': return <Zap size={18} className="text-amber-500" />
      case 'complaint': return <MessageSquare size={18} className="text-pink-500" />
      case 'event': return <Calendar size={18} className="text-cyan-500" />
      default: return <Bell size={18} className="text-red-500" />
    }
  }

  const getNotifStyles = (notif) => {
    if (notif.is_read) return 'bg-[#161b22]/40 border-white/[0.04]'
    switch (notif.type) {
      case 'security': return 'bg-red-500/5 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.02)]'
      case 'system': return 'bg-amber-500/5 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.02)]'
      case 'complaint': return 'bg-pink-500/5 border-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.02)]'
      case 'event': return 'bg-cyan-500/5 border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.02)]'
      default: return 'bg-red-500/5 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.02)]'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8 lg:space-y-10 pb-20 max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">System Intelligence Logs</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-none italic">
              System <span className="text-red-500">Alerts</span>
            </h2>
          </div>

          <button 
            onClick={handleMarkAllRead} 
            className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all hover:bg-white/10 self-start sm:self-auto"
          >
            Mark All Read
          </button>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-white/[0.04]">
          {CATEGORIES.map(cat => {
            const CatIcon = cat.icon
            const isSelected = activeCategory === cat.id
            const count = cat.id === 'All' 
              ? notifications.length 
              : notifications.filter(n => n.type === cat.id).length

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                  isSelected 
                    ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                    : 'bg-[#161b22] border-white/[0.06] text-gray-400 hover:text-white'
                }`}
              >
                <CatIcon size={12} />
                <span>{cat.label}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded text-[8px] ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="space-y-8">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic animate-pulse">Syncing Telemetry...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.01] border border-white/[0.05] rounded-[32px]">
              <BellOff size={32} className="text-gray-600 mb-3" />
              <h4 className="text-sm font-black text-white uppercase tracking-tight">No Alerts Present</h4>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Operational status normal</p>
            </div>
          ) : (
            <>
              {unreadNotifs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] ml-1">New Alerts</h3>
                  <AnimatePresence mode="popLayout">
                    {unreadNotifs.map((notif, idx) => (
                      <motion.div 
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                        className={`p-6 lg:p-8 rounded-[24px] border transition-all flex items-start gap-5 relative group overflow-hidden border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:border-red-500/50 ${getNotifStyles(notif)}`}
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
                        
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-white/5 border-white/10">
                          {getNotifIcon(notif.type)}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                           <div className="flex items-start justify-between gap-4">
                              <h4 className="text-sm lg:text-base font-black uppercase tracking-tight truncate text-white">
                                {notif.title}
                              </h4>
                              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap mt-1">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </span>
                           </div>
                           <p className="text-xs font-medium leading-relaxed text-gray-300">
                             {notif.message}
                           </p>
                        </div>

                        <div className="flex gap-2 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => handleMarkRead(notif.id)}
                             className="p-2.5 bg-white/5 hover:bg-emerald-600/10 hover:text-emerald-500 rounded-lg text-gray-500 transition-all border border-white/5"
                             title="Mark as Read"
                           >
                             <CheckCircle2 size={14} />
                           </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {readNotifs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-1">Earlier</h3>
                  <div className="space-y-4">
                    {readNotifs.map((notif, idx) => (
                      <div 
                        key={notif.id}
                        className={`p-6 lg:p-8 rounded-[24px] border transition-all flex items-start gap-5 relative group overflow-hidden ${getNotifStyles(notif)}`}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-white/5 border-white/10 text-gray-600">
                          {getNotifIcon(notif.type)}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                           <div className="flex items-start justify-between gap-4">
                              <h4 className="text-sm lg:text-base font-black uppercase tracking-tight truncate text-gray-500">
                                {notif.title}
                              </h4>
                              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap mt-1">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </span>
                           </div>
                           <p className="text-xs font-medium leading-relaxed text-gray-650">
                             {notif.message}
                           </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* BROADCAST CONTROL */}
        <div className="pt-8 border-t border-white/[0.04]">
           <div className="bg-[#161b22] border border-white/[0.06] rounded-[32px] p-6 lg:p-8 shadow-xl">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                 <div className="space-y-3 max-w-sm">
                    <div className="flex items-center gap-2 text-red-500">
                      <Megaphone size={16} />
                      <h4 className="text-base font-black text-white uppercase tracking-tight">Broadcast Control</h4>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-wider">
                      Deploy global notices across the campus network. This protocol updates all student dashboards instantly.
                    </p>
                 </div>
                 
                 <form onSubmit={handleSendAnnouncement} className="flex-1 w-full space-y-4">
                    <input 
                      name="title" 
                      required 
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="ANNOUNCEMENT TITLE..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-red-500/50 transition-colors" 
                    />
                    <textarea 
                      name="content" 
                      required 
                      value={broadcastContent}
                      onChange={(e) => setBroadcastContent(e.target.value)}
                      placeholder="MESSAGE CONTENT..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-red-500/50 min-h-[80px] transition-colors" 
                    />
                    <div className="flex gap-4">
                       <select 
                         value={broadcastPriority}
                         onChange={(e) => setBroadcastPriority(e.target.value)}
                         className="flex-1 bg-[#161b22] border border-white/10 rounded-xl p-4 text-white font-black text-[9px] uppercase tracking-widest outline-none appearance-none cursor-pointer"
                       >
                          <option value="info" className="bg-slate-900">Info Priority</option>
                          <option value="urgent" className="bg-slate-900">Urgent Priority</option>
                          <option value="warning" className="bg-slate-900">Warning Priority</option>
                       </select>
                       <button 
                         type="submit" 
                         disabled={broadcasting}
                         className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
                       >
                          {broadcasting ? 'Deploying...' : <><Send size={12} /> Deploy Broadcast</>}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  )
}

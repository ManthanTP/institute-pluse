import { useState, useEffect } from 'react'
import { Bell, Zap, Clock, ShieldCheck, AlertCircle, MessageSquare, Trash2, CheckCircle2, MoreHorizontal, ShieldAlert, Activity } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    setLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (data) setNotifications(data)
    setLoading(false)
  }

  async function sendAnnouncement(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const payload = {
      title: formData.get('title'),
      content: formData.get('content'),
      priority: formData.get('priority') || 'info',
      audience_type: 'global'
    }

    const { error } = await supabase.from('announcements').insert(payload)
    if (error) {
      toast.error('Broadcast Transmission Failed')
    } else {
      toast.success('Global Announcement Deployed')
      e.target.reset()
    }
  }

  async function markAllRead() {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('System Alerts Synchronized')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20 max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell size={14} className="text-blue-500" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Global Alert Pulse</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">System <span className="text-blue-500">Alerts</span></h2>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={markAllRead} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">Synchronize All</button>
          </div>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="space-y-4">
           <AnimatePresence mode="popLayout">
              {notifications.map((notif, idx) => (
                 <motion.div 
                   key={notif.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className={`p-10 rounded-[40px] border transition-all flex items-start gap-8 relative group overflow-hidden ${notif.read ? 'bg-[#0f172a]/20 border-white/5' : 'bg-[#0f172a]/60 border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.05)]'}`}
                 >
                    {!notif.read && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />}
                    
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 border ${notif.read ? 'bg-white/5 border-white/10 text-gray-600' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                       {notif.type === 'security' ? <ShieldAlert size={26} /> : notif.type === 'resource' ? <Activity size={26} /> : <Zap size={26} />}
                    </div>

                    <div className="flex-1 space-y-3">
                       <div className="flex items-center justify-between">
                          <h4 className={`text-xl font-black uppercase tracking-tight ${notif.read ? 'text-gray-500' : 'text-white'}`}>{notif.title}</h4>
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{notif.time}</span>
                       </div>
                       <p className={`text-sm font-medium leading-relaxed max-w-3xl ${notif.read ? 'text-gray-600' : 'text-gray-400'}`}>{notif.content}</p>
                    </div>

                    <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-4 bg-white/5 rounded-2xl text-gray-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                       <button className="p-4 bg-white/5 rounded-2xl text-gray-600 hover:text-white transition-all"><MoreHorizontal size={18} /></button>
                    </div>
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* FEED SETTINGS */}
        <div className="pt-12 border-t border-white/5">
           <div className="bg-[#0f172a]/40 border border-white/10 rounded-[60px] p-12 lg:p-16">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
                 <div className="space-y-4 max-w-md">
                    <h4 className="text-3xl font-black text-white uppercase tracking-tight italic">Broadcast <span className="text-blue-500">Node</span></h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-wide">Deploy global announcements across the campus network. This protocol updates all student dashboards instantly.</p>
                 </div>
                 
                 <form onSubmit={sendAnnouncement} className="flex-1 w-full space-y-4">
                    <input name="title" required placeholder="ANNOUNCEMENT TITLE..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black text-xs uppercase tracking-widest outline-none focus:border-blue-500/50" />
                    <textarea name="content" required placeholder="MESSAGE CONTENT..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-medium text-sm outline-none focus:border-blue-500/50 min-h-[100px]" />
                    <div className="flex gap-4">
                       <select name="priority" className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black text-[10px] uppercase tracking-widest outline-none appearance-none cursor-pointer">
                          <option value="info" className="bg-slate-950">Info Priority</option>
                          <option value="urgent" className="bg-slate-950">Urgent Priority</option>
                          <option value="warning" className="bg-slate-950">Warning Priority</option>
                       </select>
                       <button type="submit" className="px-12 py-5 bg-blue-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-all">Deploy Broadcast</button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  )
}

import { useState, useEffect } from 'react'
import { Bell, Zap, Clock, ShieldCheck, AlertCircle, MessageSquare, Trash2, CheckCircle2, MoreHorizontal } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function FacultyNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock Data
    setNotifications([
      { id: 1, type: 'attendance', title: 'Session Threshold Reached', content: 'Computer Graphics session (DIV A) has reached 90% attendance.', time: '12 mins ago', read: false },
      { id: 2, type: 'complaint', title: 'New Grievance Submitted', content: 'A student from DIV B has reported a hardware issue in Lab 1.', time: '1 hour ago', read: false },
      { id: 3, type: 'system', title: 'Protocol Backup Complete', content: 'Weekly attendance registry has been successfully backed up to cloud nexus.', time: '5 hours ago', read: true },
    ])
    setLoading(false)
  }, [])

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All Notifications Synchronized')
  }

  return (
    <FacultyLayout>
      <div className="space-y-8 lg:space-y-12 pb-20 max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 lg:mb-3">
              <Bell size={12} className="text-blue-500" />
              <span className="text-[8px] lg:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">System Alert Nexus</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Active <span className="text-blue-500">Alerts</span></h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
              Synchronizing institutional event streams
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4">
             <button onClick={markAllRead} className="flex-1 md:flex-none px-6 lg:px-8 py-3 lg:py-4 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all shadow-xl">Mark All as Read</button>
          </div>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="space-y-3 lg:space-y-4">
           <AnimatePresence mode="popLayout">
              {notifications.map((notif, idx) => (
                 <motion.div 
                   key={notif.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className={`p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border transition-all flex items-start gap-4 lg:gap-6 relative group overflow-hidden shadow-2xl ${notif.read ? 'bg-[#161b22]/40 border-white/5' : 'bg-[#161b22] border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)]'}`}
                 >
                    {!notif.read && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />}
                    
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${notif.read ? 'bg-white/5 border-white/10 text-gray-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                       {notif.type === 'attendance' ? <Zap size={20} lg:size={22} /> : notif.type === 'complaint' ? <AlertCircle size={20} lg:size={22} /> : <ShieldCheck size={20} lg:size={22} />}
                    </div>

                    <div className="flex-1 space-y-1 lg:space-y-2 min-w-0">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                          <h4 className={`text-base lg:text-lg font-black uppercase tracking-tight truncate ${notif.read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h4>
                          <span className="text-[8px] lg:text-[9px] font-black text-gray-600 uppercase tracking-widest italic">{notif.time}</span>
                       </div>
                       <p className={`text-xs lg:text-sm font-medium leading-relaxed italic ${notif.read ? 'text-gray-600' : 'text-gray-400'}`}>{notif.content}</p>
                    </div>

                    <div className="flex flex-col gap-2 opacity-0 lg:group-hover:opacity-100 group-hover:opacity-100 transition-opacity shrink-0">
                       <button className="p-2.5 lg:p-3 bg-white/5 rounded-lg lg:rounded-xl text-gray-500 hover:text-white transition-all border border-white/5 shadow-inner"><Trash2 size={16} /></button>
                       <button className="p-2.5 lg:p-3 bg-white/5 rounded-lg lg:rounded-xl text-gray-500 hover:text-white transition-all border border-white/5 shadow-inner"><MoreHorizontal size={16} /></button>
                    </div>
                 </motion.div>
              ))}
           </AnimatePresence>

           {notifications.length === 0 && (
              <div className="py-32 lg:py-40 text-center flex flex-col items-center gap-6">
                 <Bell size={48} lg:size={60} className="text-gray-800 opacity-20" />
                 <p className="text-[9px] lg:text-[11px] font-black text-gray-700 uppercase tracking-[0.4em] italic px-6">System alert nexus is currently silent</p>
              </div>
           )}
        </div>

        {/* FEED SETTINGS */}
        <div className="pt-8 lg:pt-12 border-t border-white/5">
           <div className="bg-[#161b22]/50 border border-white/5 rounded-3xl lg:rounded-[48px] p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 shadow-2xl">
              <div className="text-center lg:text-left">
                 <h4 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight mb-2">Notification Configuration</h4>
                 <p className="text-xs lg:text-sm text-gray-500 font-medium leading-relaxed max-w-md italic">Customize how you receive critical system alerts, attendance thresholds, and student grievances.</p>
              </div>
              <div className="flex items-center gap-4 w-full lg:w-auto">
                 <button className="w-full lg:w-auto px-10 py-4 lg:py-5 bg-white text-blue-600 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Configure Relay</button>
              </div>
           </div>
        </div>
      </div>

    </FacultyLayout>
  )
}

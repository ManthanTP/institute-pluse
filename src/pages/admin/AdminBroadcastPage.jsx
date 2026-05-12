import { useState, useEffect } from 'react'
import { Megaphone, Send, Clock, Trash2, Globe, Users, ShieldCheck, Plus, MessageSquare, AlertTriangle, Zap, ShieldAlert } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('all')
  const [severity, setSeverity] = useState('info')

  useEffect(() => {
    fetchBroadcasts()
  }, [])

  async function fetchBroadcasts() {
    try {
      setLoading(true)
      // Mock Data
      setBroadcasts([
        { id: 1, title: 'Campus Maintenance', content: 'Central WiFi will be down for maintenance from 10 PM to 2 AM.', date: '2026-05-12', target: 'Global', type: 'info' },
        { id: 2, title: 'URGENT: Heavy Rain Alert', content: 'Classes after 4 PM are cancelled due to weather warnings. Stay safe.', date: '2026-05-11', target: 'Students & Faculty', type: 'emergency' },
      ])
    } catch (err) {
      toast.error('Broadcast Node Synchronization Failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeploy() {
    if (!message) return
    toast.success('Global Broadcast Protocol Initiated')
    setMessage('')
  }

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Megaphone size={14} className="text-orange-500" />
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Global Communication Nexus</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Broadcast <span className="text-orange-500">Center</span></h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* DEPLOYMENT TERMINAL */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#0f172a]/60 border border-white/10 rounded-[48px] p-10 space-y-8">
                 <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Deployment Terminal</h4>
                 
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Sector</label>
                       <select 
                         value={target}
                         onChange={(e) => setTarget(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-orange-500 transition-all appearance-none"
                       >
                          <option value="all">Full Campus Network</option>
                          <option value="students">Student Terminals Only</option>
                          <option value="faculty">Faculty Hubs Only</option>
                          <option value="staff">Administrative Staff</option>
                       </select>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Alert Severity</label>
                       <div className="flex gap-2">
                          {['info', 'warning', 'emergency'].map(s => (
                             <button
                               key={s}
                               onClick={() => setSeverity(s)}
                               className={`flex-1 py-4 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${severity === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-gray-500 border-white/10'}`}
                             >
                                {s}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Message Payload</label>
                       <textarea 
                         placeholder="ENTER BROADCAST CONTENT..."
                         value={message}
                         onChange={(e) => setMessage(e.target.value)}
                         rows={6}
                         className="w-full bg-white/5 border border-white/10 rounded-[32px] py-6 px-6 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-orange-500 transition-all resize-none"
                       />
                    </div>

                    <button 
                      onClick={handleDeploy}
                      className="w-full py-6 bg-orange-600 text-white rounded-[32px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
                    >
                       <Zap size={16} /> Deploy Protocol
                    </button>
                 </div>
              </div>

              <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[32px] flex items-start gap-4">
                 <ShieldAlert size={20} className="text-red-500 shrink-0 mt-1" />
                 <p className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-relaxed">Emergency broadcasts override user notification settings and display instantly on all active campus terminals.</p>
              </div>
           </div>

           {/* RECENT FEED */}
           <div className="lg:col-span-2 space-y-8">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] px-4">Broadcast Archives</h4>
              
              <div className="space-y-6">
                 <AnimatePresence mode="popLayout">
                    {broadcasts.map((ann, idx) => (
                       <motion.div 
                         key={ann.id}
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         className="bg-[#0f172a]/40 border border-white/5 rounded-[40px] p-10 hover:border-white/10 transition-all group"
                       >
                          <div className="flex items-start justify-between mb-8">
                             <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-black text-lg ${ann.type === 'emergency' ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                                   {ann.type === 'emergency' ? <AlertTriangle size={24} /> : <Megaphone size={24} />}
                                </div>
                                <div>
                                   <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">{ann.title}</h4>
                                   <div className="flex items-center gap-3 mt-1">
                                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sector: {ann.target}</span>
                                      <span className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{ann.date}</span>
                                   </div>
                                </div>
                             </div>
                             <button className="p-4 bg-white/5 rounded-2xl text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                          </div>
                          <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-2xl">"{ann.content}"</p>
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  )
}

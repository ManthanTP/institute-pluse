import { useState, useEffect } from 'react'
import { Megaphone, Send, Clock, Trash2, Globe, Users, ShieldCheck, Plus, MessageSquare, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function FacultyAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState('all')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      if (data) {
        setAnnouncements(data.map(a => ({
          id: a.id,
          title: a.title,
          content: a.content,
          date: new Date(a.created_at).toLocaleDateString(),
          audience: a.audience_type === 'division' ? `Div ${a.target_id}` : 'Global',
          type: a.priority || 'info'
        })))
      }
    } catch (err) {
      console.error('Announcements Error:', err)
      toast.error('Announcement Node Synchronization Failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleBroadcast() {
    if (!message) return
    
    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: 'Faculty Update',
          content: message,
          audience_type: audience === 'all' ? 'global' : 'division',
          target_id: audience === 'all' ? null : audience,
          created_by: (await supabase.auth.getUser()).data.user.id
        })
      
      if (error) throw error

      toast.success('Broadcast Sequence Initiated')
      setMessage('')
      fetchAnnouncements()
    } catch (err) {
      console.error('Broadcast Error:', err)
      toast.error('Failed to deploy broadcast')
    }
  }

  return (
    <FacultyLayout>
      <div className="space-y-8 lg:space-y-12 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 lg:mb-3">
              <Megaphone size={12} className="text-blue-500" />
              <span className="text-[8px] lg:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Campus Broadcast Protocol</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Public <span className="text-blue-500">Announcements</span></h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
              Deploying institutional directives via the Nexus
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
           {/* BROADCAST TERMINAL */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#161b22] border border-white/10 rounded-3xl lg:rounded-[48px] p-6 lg:p-10 space-y-8 shadow-2xl">
                 <h4 className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-[0.4em] text-center lg:text-left">Broadcast Terminal</h4>
                 
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Target Audience</label>
                       <select 
                         value={audience}
                         onChange={(e) => setAudience(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl py-4 lg:py-5 px-5 lg:px-6 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500 transition-all appearance-none shadow-inner"
                       >
                          <option value="all">Global Broadcast</option>
                          {['A', 'B', 'C', 'D', 'E', 'F'].map(div => (
                            <option key={div} value={`div_${div.toLowerCase()}`}>Division {div}</option>
                          ))}
                       </select>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Message Payload</label>
                       <textarea 
                         placeholder="ENTER ANNOUNCEMENT CONTENT..."
                         value={message}
                         onChange={(e) => setMessage(e.target.value)}
                         rows={5}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl lg:rounded-[32px] py-5 lg:py-6 px-5 lg:px-6 text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500 transition-all resize-none shadow-inner"
                       />
                    </div>

                    <button 
                      onClick={handleBroadcast}
                      className="w-full py-4 lg:py-6 bg-blue-600 text-white rounded-xl lg:rounded-[32px] text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                       <Send size={16} /> Deploy Broadcast
                    </button>
                 </div>
              </div>

              <div className="p-6 lg:p-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl lg:rounded-[32px] flex items-center gap-4 shadow-xl">
                 <ShieldCheck size={20} className="text-blue-500 shrink-0" />
                 <p className="text-[8px] lg:text-[9px] font-black text-blue-500 uppercase tracking-widest leading-relaxed">Broadcasts are sent via Push Notification and In-App Feed to all synchronized terminals.</p>
              </div>
           </div>

           {/* RECENT FEED */}
           <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              <h4 className="text-[9px] lg:text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] px-4 text-center lg:text-left italic">Broadcast History Log</h4>
              
              <div className="space-y-4 lg:space-y-6">
                 <AnimatePresence mode="popLayout">
                    {announcements.map((ann, idx) => (
                       <motion.div 
                         key={ann.id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="bg-[#161b22]/50 border border-white/5 rounded-3xl lg:rounded-[40px] p-6 lg:p-10 hover:border-white/10 transition-all group shadow-2xl relative overflow-hidden"
                       >
                          <div className="flex items-start justify-between mb-4 lg:mb-6">
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-lg ${ann.type === 'urgent' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                   {ann.type === 'urgent' ? <AlertCircle size={18} lg:size={20} /> : <MessageSquare size={18} lg:size={20} />}
                                </div>
                                <div>
                                   <h4 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight truncate max-w-[200px] sm:max-w-none">{ann.title}</h4>
                                   <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest">To {ann.audience}</span>
                                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                                      <span className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest italic">{ann.date}</span>
                                   </div>
                                </div>
                             </div>
                             <button className="p-2.5 lg:p-3 bg-white/5 rounded-lg lg:rounded-xl text-gray-600 hover:text-red-500 transition-all opacity-0 lg:group-hover:opacity-100 group-hover:opacity-100 border border-white/5 shadow-inner"><Trash2 size={16} /></button>
                          </div>
                          <p className="text-xs lg:text-sm text-gray-400 font-medium leading-relaxed italic">"{ann.content}"</p>
                       </motion.div>
                    ))}
                 </AnimatePresence>

                 {announcements.length === 0 && (
                   <div className="py-20 text-center flex flex-col items-center gap-4">
                     <Megaphone size={40} className="text-gray-800 opacity-20" />
                     <p className="text-[9px] lg:text-[11px] font-black text-gray-700 uppercase tracking-[0.4em] italic px-6">No previous broadcast protocols found in history</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>

    </FacultyLayout>
  )
}

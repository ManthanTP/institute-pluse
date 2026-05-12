import { useState, useEffect } from 'react'
import { FileText, Search, Filter, Clock, User, Shield, Terminal, Download, Trash2, ArrowUpRight, Activity, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      setLoading(true)
      // Mock Data
      setLogs([
        { id: 1, action: 'User Update', user: 'Admin 01', target: 'Student Profile (ID: 293)', time: '2 mins ago', severity: 'low' },
        { id: 2, action: 'Security Override', user: 'System Root', target: 'Attendance Registry (DIV A)', time: '15 mins ago', severity: 'high' },
        { id: 3, action: 'Export Initiated', user: 'Prof. Miller', target: 'Sustainability Report (Q2)', time: '1 hour ago', severity: 'medium' },
        { id: 4, action: 'Broadcast Deployed', user: 'Admin 02', target: 'Emergency Channel', time: '3 hours ago', severity: 'medium' },
      ])
    } catch (err) {
      toast.error('Audit Stream Synchronization Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Terminal size={14} className="text-blue-500" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Historical Integrity Stream</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Audit <span className="text-blue-500">Logs</span></h2>
          </div>

          <div className="flex items-center gap-4">
             <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all flex items-center gap-3">
                <Download size={16} /> Export Audit Stream
             </button>
          </div>
        </div>

        {/* LOG TERMINAL */}
        <div className="bg-[#0f172a]/60 border border-white/10 rounded-[48px] overflow-hidden">
           <div className="p-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="relative flex-1 group w-full">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                 <input 
                   type="text" 
                   placeholder="SEARCH LOGS BY USER, ACTION OR TARGET..."
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-8 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500/50 transition-all"
                 />
              </div>
              <div className="flex gap-4">
                 <button className="p-4 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white transition-all"><Filter size={18} /></button>
                 <button className="p-4 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white transition-all"><Activity size={18} /></button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                 <thead>
                    <tr className="border-b border-white/5 bg-white/2">
                       <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Action</th>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Authorized Identity</th>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Sector</th>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Temporal Log</th>
                       <th className="px-8 py-6 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {logs.map((log) => (
                       <tr key={log.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-8 py-8">
                             <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${log.severity === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : log.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                <span className="text-sm font-black text-white uppercase tracking-tight italic">{log.action}</span>
                             </div>
                          </td>
                          <td className="px-8 py-8">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-400">{log.user[0]}</div>
                                <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">{log.user}</span>
                             </div>
                          </td>
                          <td className="px-8 py-8">
                             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{log.target}</span>
                          </td>
                          <td className="px-8 py-8">
                             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{log.time}</span>
                          </td>
                          <td className="px-8 py-8 text-right">
                             <button className="p-3 bg-white/5 rounded-xl text-gray-700 group-hover:text-white transition-all"><ChevronRight size={16} /></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* INTEGRITY STATUS */}
        <div className="p-8 bg-blue-500/10 border border-blue-500/20 rounded-[40px] flex items-center justify-between">
           <div className="flex items-center gap-6">
              <Shield size={30} className="text-blue-500" />
              <div>
                 <p className="text-[11px] font-black text-white uppercase tracking-widest">Immutable Log Integrity Active</p>
                 <p className="text-[9px] text-blue-500/70 font-bold uppercase tracking-widest mt-1">All actions are cryptographically signed and archived in the secure core.</p>
              </div>
           </div>
           <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">Verify All Signatures</button>
        </div>
      </div>
    </AdminLayout>
  )
}

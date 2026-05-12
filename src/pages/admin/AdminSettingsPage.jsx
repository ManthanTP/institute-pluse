import { useState } from 'react'
import { Settings, Shield, Key, Globe, Database, Cpu, Lock, Bell, RefreshCw, Zap, ShieldCheck, ChevronRight } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)

  function handleSave() {
    toast.success('System Parameters Synchronized')
  }

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings size={14} className="text-gray-500" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Core Parameter Control</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">System <span className="text-gray-500">Settings</span></h2>
          </div>

          <button onClick={handleSave} className="px-10 py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Save Core Sync</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* GLOBAL ACCESS */}
           <div className="bg-[#0f172a]/40 border border-white/10 rounded-[48px] p-12 space-y-10">
              <div className="flex items-center gap-4">
                 <Shield size={24} className="text-blue-500" />
                 <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Global Access Protocol</h4>
              </div>

              <div className="space-y-8">
                 {[
                   { label: 'Public Student Registration', desc: 'Allow new student accounts via public terminal.', active: true },
                   { label: 'Faculty Manual Override', desc: 'Grant teachers ability to bypass attendance verification.', active: true },
                   { label: 'External API Access', desc: 'Allow third-party campus tools to query core nodes.', active: false },
                 ].map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                       <div className="space-y-1">
                          <p className="text-[11px] font-black text-white uppercase tracking-widest">{s.label}</p>
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">{s.desc}</p>
                       </div>
                       <div className={`w-14 h-7 rounded-full relative cursor-pointer transition-all ${s.active ? 'bg-blue-600' : 'bg-white/5'}`}>
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${s.active ? 'right-1 shadow-lg' : 'left-1'}`} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* INFRASTRUCTURE CONFIG */}
           <div className="bg-[#0f172a]/40 border border-white/10 rounded-[48px] p-12 space-y-10">
              <div className="flex items-center gap-4">
                 <Database size={24} className="text-orange-500" />
                 <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Infrastructure Config</h4>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 text-orange-500">Master DB Endpoint</label>
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-between">
                       <span>https://api-core-nexus.supabase.co</span>
                       <Lock size={14} className="text-gray-700" />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 text-orange-500">Notification Relay (SMTP)</label>
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                       relay.institutepulse.edu
                    </div>
                 </div>
              </div>
           </div>

           {/* SECURITY & MAINTENANCE */}
           <div className="lg:col-span-2 bg-[#0f172a]/40 border border-white/10 rounded-[48px] p-12 space-y-10">
              <div className="flex items-center gap-4">
                 <Cpu size={24} className="text-purple-500" />
                 <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Maintenance Nexus</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <button className="p-10 rounded-[32px] bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all text-left space-y-4 group">
                    <RefreshCw size={24} className="text-blue-500 group-hover:rotate-180 transition-transform duration-700" />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Flush Cache Nodes</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase">Clear global memory buffers</p>
                 </button>
                 <button className="p-10 rounded-[32px] bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all text-left space-y-4 group">
                    <ShieldCheck size={24} className="text-orange-500" />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Global Audit Scan</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase">Run integrity check on DB</p>
                 </button>
                 <button className="p-10 rounded-[32px] bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all text-left space-y-4 group">
                    <Zap size={24} className="text-red-500 group-hover:text-white" />
                    <p className="text-[10px] font-black uppercase tracking-widest">System Lockdown</p>
                    <p className="text-[8px] opacity-60 font-bold uppercase">Immediate sector isolation</p>
                 </button>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  )
}

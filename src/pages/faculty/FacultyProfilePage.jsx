import { useState, useEffect } from 'react'
import { User, Shield, Key, Bell, Globe, Camera, Edit3, CheckCircle2, AlertCircle, LogOut, ShieldCheck, Mail, MapPin, Building, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/index'
import toast from 'react-hot-toast'

export default function FacultyProfilePage() {
  const { profile, signOut } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    department: 'Computer Science', // Mock
    designation: 'Senior Professor' // Mock
  })

  async function handleUpdate() {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: formData.full_name })
        .eq('id', profile.id)
      
      if (error) throw error
      toast.success('Identity Protocol Updated')
    } catch (err) {
      toast.error('Identity Update Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FacultyLayout>
      <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      <div className="space-y-8 lg:space-y-12 pb-20 max-w-6xl mx-auto">
        {/* PROFILE HEADER */}
        <div className="relative">
           <div className="h-48 lg:h-64 w-full bg-gradient-to-br from-blue-600 to-indigo-900 rounded-3xl lg:rounded-[60px] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
           </div>
           
           <div className="absolute -bottom-16 lg:-bottom-16 left-1/2 lg:left-12 -translate-x-1/2 lg:translate-x-0 flex flex-col lg:flex-row items-center lg:items-end gap-4 lg:gap-8 w-full px-6 lg:px-0">
              <div className="relative group">
                 <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-3xl lg:rounded-[48px] bg-[#161b22] border-[6px] lg:border-[8px] border-[#0d1117] flex items-center justify-center text-white font-black text-4xl lg:text-5xl shadow-2xl overflow-hidden shadow-blue-500/10">
                    {profile?.full_name?.[0] || '?'}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                       <Camera size={24} lg:size={30} />
                    </div>
                 </div>
                 <div className="absolute -right-1 -bottom-1 lg:-right-2 lg:-bottom-2 w-8 h-8 lg:w-10 lg:h-10 bg-green-500 rounded-xl lg:rounded-2xl border-4 border-[#0d1117] flex items-center justify-center shadow-lg">
                    <ShieldCheck size={14} lg:size={18} className="text-white" />
                 </div>
              </div>
              
              <div className="pb-0 lg:pb-4 text-center lg:text-left">
                 <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tighter uppercase italic leading-none truncate max-w-[280px] lg:max-w-none">{profile?.full_name}</h2>
                 <p className="text-[8px] lg:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mt-2 lg:mt-3 bg-blue-500/10 py-1 px-3 rounded-full border border-blue-500/20 inline-block">Authorized Faculty • ID: F-2938</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-20 lg:mt-24">
           {/* IDENTITY FORM */}
           <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              <div className="bg-[#161b22] border border-white/10 rounded-3xl lg:rounded-[48px] p-8 lg:p-12 space-y-8 lg:space-y-10 shadow-2xl">
                 <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <User size={18} lg:size={20} className="text-blue-500" />
                    <h4 className="text-[9px] lg:text-[11px] font-black text-white uppercase tracking-[0.4em]">Identity Profile</h4>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-3">
                       <label className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Full Legal Name</label>
                       <input 
                         type="text" 
                         value={formData.full_name}
                         onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                         className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl py-4 lg:py-5 px-5 lg:px-6 text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-3 opacity-60">
                       <label className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Academic Email</label>
                       <input 
                         type="email" 
                         value={formData.email}
                         disabled
                         className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl py-4 lg:py-5 px-5 lg:px-6 text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-white cursor-not-allowed shadow-inner"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Department</label>
                       <div className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl py-4 lg:py-5 px-5 lg:px-6 text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-3 shadow-inner">
                          <Building size={14} className="text-gray-600" /> {formData.department}
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Access Level</label>
                       <div className="w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl py-4 lg:py-5 px-5 lg:px-6 text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-3 shadow-inner">
                          <Shield size={14} /> Global Academic Write
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={handleUpdate}
                   disabled={loading}
                   className="w-full lg:w-auto px-10 py-4 lg:py-5 bg-blue-600 text-white rounded-xl lg:rounded-[24px] text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                 >
                    {loading ? 'Synchronizing...' : 'Update Identity Protocol'}
                 </button>
              </div>

              {/* SECURITY SETTINGS */}
              <div className="bg-[#161b22] border border-white/10 rounded-3xl lg:rounded-[48px] p-8 lg:p-12 space-y-8 lg:space-y-10 shadow-2xl">
                 <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <Key size={18} lg:size={20} className="text-orange-500" />
                    <h4 className="text-[9px] lg:text-[11px] font-black text-white uppercase tracking-[0.4em]">Security Nexus</h4>
                 </div>

                 <div className="space-y-4 lg:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 lg:p-6 bg-white/2 border border-white/5 rounded-2xl lg:rounded-3xl group hover:border-orange-500/30 transition-all gap-4 lg:gap-0 shadow-inner">
                       <div className="flex items-center gap-4 lg:gap-6">
                          <Shield size={20} lg:size={24} className="text-orange-500 shrink-0" />
                          <div>
                             <span className="block text-[10px] lg:text-[11px] font-black text-white uppercase tracking-widest">Multi-Factor Auth</span>
                             <span className="block text-[8px] lg:text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-1 italic">Status: Deactivated</span>
                          </div>
                       </div>
                       <button className="w-full sm:w-auto px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[8px] lg:text-[9px] font-black text-gray-400 uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-inner">Activate</button>
                    </div>

                    <div className="flex items-center justify-between p-5 lg:p-6 bg-white/2 border border-white/5 rounded-2xl lg:rounded-3xl group hover:border-orange-500/30 transition-all shadow-inner">
                       <div className="flex items-center gap-4 lg:gap-6">
                          <MapPin size={20} lg:size={24} className="text-gray-500 shrink-0" />
                          <div>
                             <span className="block text-[10px] lg:text-[11px] font-black text-white uppercase tracking-widest">Session Terminal Logs</span>
                             <span className="block text-[8px] lg:text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-1 italic">Last Sync: 4 mins ago (Mumbai, IN)</span>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-gray-700" />
                    </div>
                 </div>
              </div>
           </div>

           {/* SIDEBAR / LOGOUT */}
           <div className="space-y-6 lg:space-y-8">
              <div className="bg-gradient-to-br from-red-600 to-orange-700 rounded-3xl lg:rounded-[48px] p-8 lg:p-10 text-white relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform pointer-events-none"><LogOut size={60} lg:size={80} /></div>
                 <div className="relative z-10">
                    <h4 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter mb-4 leading-tight">De-authorize Terminal</h4>
                    <p className="text-red-100 text-xs lg:text-sm font-medium leading-relaxed mb-8 lg:mb-10 italic">This will terminate your current authentication token and clear local session cache.</p>
                    <button 
                      onClick={signOut}
                      className="w-full py-4 lg:py-6 bg-white text-red-600 rounded-xl lg:rounded-3xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-gray-100 active:scale-95 transition-all"
                    >
                       Safe De-authorization
                    </button>
                 </div>
              </div>

              <div className="bg-[#161b22] border border-white/10 rounded-3xl lg:rounded-[48px] p-8 lg:p-10 space-y-6 lg:space-y-8 shadow-2xl">
                 <h4 className="text-[9px] lg:text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] text-center lg:text-left italic">Faculty Preferences</h4>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Dark Mode Protocol</span>
                       <div className="w-10 h-5 lg:w-12 lg:h-6 bg-blue-600 rounded-full relative shadow-inner"><div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-lg" /></div>
                    </div>
                    <div className="flex items-center justify-between opacity-40 cursor-not-allowed">
                       <span className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Biometric Signature</span>
                       <div className="w-10 h-5 lg:w-12 lg:h-6 bg-white/10 rounded-full relative shadow-inner"><div className="absolute left-0.5 top-0.5 w-4 h-4 bg-gray-500 rounded-full" /></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      </div>
    </FacultyLayout>
  )
}

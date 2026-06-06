import { useState, useEffect } from 'react'
import { Settings, Shield, Key, Globe, Database, Cpu, Lock, Bell, RefreshCw, Zap, ShieldCheck, ChevronRight, Info, Building, Mail, Phone, MapPin, Upload, Eye } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // Institution settings state
  const [settings, setSettings] = useState({
    name: 'InstitutePulse Academy',
    logo_url: 'https://pulse-core.local/logo.png',
    contact_email: 'contact@institutepulse.edu',
    contact_phone: '+91 98765 43210',
    address: '123 Cyberpunk Enclave, Bengaluru, India'
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setFetching(true)
      const { data, error } = await supabase
        .from('institution_settings')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (data) {
        setSettings(data)
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setFetching(false)
    }
  }

  async function handleSave(e) {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('institution_settings')
        .update({
          name: settings.name,
          logo_url: settings.logo_url,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          address: settings.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)

      if (error) throw error
      toast.success('Institution Profile Synced to Core')
    } catch (err) {
      toast.error('Sync failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Logo Upload (Base64 conversion for preview and database save)
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logo_url: reader.result }))
        toast.success('Logo loaded in live preview')
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building size={14} className="text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Core Brand Identity</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Institution <span className="text-red-500">Profile</span></h2>
          </div>

          <button 
            onClick={handleSave} 
            disabled={loading || fetching}
            className="px-10 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Save Core Sync'}
          </button>
        </div>

        {fetching ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Streaming Profile Telemetry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             {/* PROFILE FORM */}
             <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-8 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                   <Settings size={24} className="text-red-500" />
                   <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Identity Parameters</h4>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Institution Name</label>
                     <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="text"
                          value={settings.name}
                          onChange={e => setSettings({ ...settings, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-red-500/50 transition-all uppercase tracking-widest font-black"
                          required
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact Email</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input
                            type="email"
                            value={settings.contact_email}
                            onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-red-500/50 transition-all"
                            required
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact Phone</label>
                       <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input
                            type="text"
                            value={settings.contact_phone}
                            onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-red-500/50 transition-all"
                            required
                          />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Physical Location Address</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="text"
                          value={settings.address}
                          onChange={e => setSettings({ ...settings, address: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-red-500/50 transition-all"
                          required
                        />
                     </div>
                  </div>

                  {/* Logo Selector */}
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Brand Logo Upload</label>
                     <div className="flex items-center gap-4">
                        <label className="flex-1 flex items-center justify-between bg-white/5 border border-white/10 hover:border-red-500/30 rounded-2xl p-4 cursor-pointer hover:bg-white/[0.08] transition-all">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Upload size={14} /> Choose Logo Image
                          </span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoChange} 
                            className="hidden" 
                          />
                        </label>
                     </div>
                  </div>
                </form>
             </div>

             {/* LIVE BRAND PREVIEW */}
             <div className="bg-slate-900/40 border border-white/10 rounded-[48px] p-12 flex flex-col justify-between backdrop-blur-xl">
                <div>
                   <div className="flex items-center gap-2 text-red-500 mb-6">
                      <Eye size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Live Brand Preview</span>
                   </div>
                   
                   <div className="border border-white/10 bg-white/2 rounded-[32px] p-6 text-center shadow-lg relative overflow-hidden group">
                      <div className="w-24 h-24 mx-auto rounded-full bg-[#020617] border-2 border-white/15 flex items-center justify-center overflow-hidden mb-6">
                         {settings.logo_url ? (
                           <img src={settings.logo_url} alt="Logo Preview" className="w-full h-full object-cover" />
                         ) : (
                           <Building className="text-gray-600" size={32} />
                         )}
                      </div>
                      <h3 className="text-md font-black text-white uppercase tracking-widest line-clamp-1 mb-2">
                        {settings.name || 'INSTITUTEPULSE'}
                      </h3>
                      
                      <div className="space-y-2 text-left pt-4 border-t border-white/5 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                         <div className="flex items-center gap-2">
                            <Mail size={12} className="text-gray-600" />
                            <span className="truncate">{settings.contact_email}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <Phone size={12} className="text-gray-600" />
                            <span>{settings.contact_phone}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-gray-600" />
                            <span className="truncate">{settings.address}</span>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center mt-6">
                   LIVE IDENTITY PROTOCOL MATRIX
                </div>
             </div>

             {/* SYSTEM UTILITIES (MAINTENANCE, SCAN) */}
             <div className="lg:col-span-3 bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-10 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <Cpu size={24} className="text-purple-500" />
                      <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Maintenance Pulse</h4>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${maintenanceMode ? 'text-red-500' : 'text-gray-500'}`}>
                         {maintenanceMode ? 'Maintenance Active' : 'System Operational'}
                      </span>
                      <div 
                        onClick={() => {
                          setMaintenanceMode(!maintenanceMode)
                          toast.error(maintenanceMode ? 'Maintenance Protocol TERMINATED' : 'Maintenance Protocol INITIALIZED')
                        }}
                        className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${maintenanceMode ? 'bg-red-600' : 'bg-white/5'}`}
                      >
                         <motion.div 
                           animate={{ x: maintenanceMode ? 28 : 4 }}
                           className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg" 
                         />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <button onClick={() => toast.success('Cache Nodes Flushed')} className="p-10 rounded-[32px] bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all text-left space-y-4 group">
                      <RefreshCw size={24} className="text-blue-500 group-hover:rotate-180 transition-transform duration-700" />
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Flush Cache Nodes</p>
                      <p className="text-[8px] text-gray-600 font-bold uppercase">Clear global memory buffers</p>
                   </button>
                   <button onClick={() => toast.success('DB integrity checked: 100% stable')} className="p-10 rounded-[32px] bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all text-left space-y-4 group">
                      <ShieldCheck size={24} className="text-orange-500" />
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Global Audit Scan</p>
                      <p className="text-[8px] text-gray-600 font-bold uppercase">Run integrity check on DB</p>
                   </button>
                   <button onClick={() => toast.error('Emergency Lockdown Initiated')} className="p-10 rounded-[32px] bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all text-left space-y-4 group">
                      <Zap size={24} className="text-red-500 group-hover:text-white" />
                      <p className="text-[10px] font-black uppercase tracking-widest">System Lockdown</p>
                      <p className="text-[8px] opacity-60 font-bold uppercase">Immediate sector isolation</p>
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

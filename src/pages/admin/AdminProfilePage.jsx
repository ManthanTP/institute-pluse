import { useState, useEffect } from 'react'
import { User, Shield, Key, Bell, Globe, Camera, Edit3, CheckCircle2, AlertCircle, LogOut, ShieldCheck, Mail, MapPin, Building, Lock, Zap, Upload, Eye, Phone } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/index'
import toast from 'react-hot-toast'

export default function AdminProfilePage() {
  const { profile, signOut } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    sector: 'Global Operations',
    clearance: 'Level 09'
  })

  // Institution settings state
  const [instSettings, setInstSettings] = useState({
    name: 'InstitutePulse Academy',
    logo_url: 'https://pulse-core.local/logo.png',
    contact_email: 'contact@institutepulse.edu',
    contact_phone: '+91 98765 43210',
    address: '123 Cyberpunk Enclave, Bengaluru, India',
    carbon_config: null
  })
  const [logoError, setLogoError] = useState(false)
  const [instLoading, setInstLoading] = useState(false)

  useEffect(() => {
    fetchInstSettings()
  }, [])

  async function fetchInstSettings() {
    try {
      const { data, error } = await supabase
        .from('institution_settings')
        .select('*')
        .eq('id', 1)
        .single()
      if (data) {
        setInstSettings(data)
      }
    } catch (err) {
      console.error('Error fetching institution settings:', err)
    }
  }

  async function handleSaveInstitution(e) {
    if (e) e.preventDefault()
    setInstLoading(true)
    try {
      const { error } = await supabase
        .from('institution_settings')
        .update({
          name: instSettings.name,
          logo_url: instSettings.logo_url,
          contact_email: instSettings.contact_email,
          contact_phone: instSettings.contact_phone,
          address: instSettings.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)

      if (error) throw error
      toast.success('Institution settings synced successfully!')
    } catch (err) {
      toast.error('Sync failed: ' + err.message)
    } finally {
      setInstLoading(false)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setInstSettings(prev => ({ ...prev, logo_url: reader.result }))
        setLogoError(false)
        toast.success('Logo loaded in live preview')
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleResetPassword() {
    if (!profile?.email) return
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      toast.success('Password reset link sent to your email!')
    } catch (err) {
      toast.error(err.message || 'Reset request failed')
    }
  }

  async function handleUpdate() {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: formData.full_name })
        .eq('id', profile.id)
      
      if (error) throw error
      toast.success('Admin Identity Synchronized')
    } catch (err) {
      toast.error('Identity Update Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20 max-w-6xl mx-auto">
        {/* PROFILE HEADER */}
        <div className="relative">
           <div className="h-64 w-full bg-gradient-to-br from-red-600 to-red-950 rounded-[60px] overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
           </div>
           
           <div className="absolute -bottom-16 left-12 flex items-end gap-8">
              <div className="relative group">
                 <div className="w-44 h-44 rounded-[48px] bg-[#0f172a] border-[8px] border-[#020617] flex items-center justify-center text-white font-black text-5xl shadow-2xl overflow-hidden">
                    {profile?.full_name[0]}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                       <Camera size={30} />
                    </div>
                 </div>
                 <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-red-500 rounded-2xl border-4 border-[#020617] flex items-center justify-center">
                    <ShieldCheck size={18} className="text-white" />
                 </div>
              </div>
              
              <div className="pb-4">
                 <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">{profile?.full_name}</h2>
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mt-3">Verified Root Admin • Sector: Global</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-24">
           {/* IDENTITY FORM */}
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#0f172a]/40 border border-white/10 rounded-[48px] p-12 space-y-10">
                 <div className="flex items-center gap-4">
                    <User size={20} className="text-red-500" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Identity Profile</h4>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Identity Name</label>
                       <input 
                         type="text" 
                         value={formData.full_name}
                         onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-red-500 transition-all"
                       />
                    </div>
                    <div className="space-y-3 opacity-50">
                       <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Secure Email Relay</label>
                       <input 
                         type="email" 
                         value={formData.email}
                         disabled
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white cursor-not-allowed"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-gray-550 uppercase tracking-widest ml-1">Operation Sector</label>
                       <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-3">
                          <Building size={14} className="text-gray-700" /> {formData.sector}
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-gray-550 uppercase tracking-widest ml-1">Clearance Protocol</label>
                       <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[11px] font-black uppercase tracking-widest text-red-500 flex items-center gap-3">
                          <Shield size={14} /> {formData.clearance}
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={handleUpdate}
                   disabled={loading}
                   className="px-10 py-5 bg-red-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:scale-105 transition-all disabled:opacity-50"
                 >
                    {loading ? 'Synchronizing...' : 'Update Identity Protocol'}
                 </button>
              </div>

              {/* INSTITUTION SETTINGS FORM */}
              <div className="bg-[#0f172a]/40 border border-white/10 rounded-[48px] p-12 space-y-10">
                 <div className="flex items-center gap-4">
                    <Building size={20} className="text-red-500" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Institution Parameters</h4>
                 </div>

                 <form onSubmit={handleSaveInstitution} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Institution Name</label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="text"
                          value={instSettings.name}
                          onChange={e => setInstSettings({ ...instSettings, name: e.target.value })}
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
                            value={instSettings.contact_email}
                            onChange={e => setInstSettings({ ...instSettings, contact_email: e.target.value })}
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
                            value={instSettings.contact_phone}
                            onChange={e => setInstSettings({ ...instSettings, contact_phone: e.target.value })}
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
                          value={instSettings.address}
                          onChange={e => setInstSettings({ ...instSettings, address: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-red-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>

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

                    <button 
                      onClick={handleSaveInstitution}
                      disabled={instLoading}
                      className="px-10 py-5 bg-red-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {instLoading ? 'Synchronizing...' : 'Save Institution Sync'}
                    </button>
                 </form>
              </div>

              {/* SECURITY TERMINAL */}
              <div className="bg-[#0f172a]/40 border border-white/10 rounded-[48px] p-12 space-y-10">
                 <div className="flex items-center gap-4">
                    <Lock size={20} className="text-orange-500" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Security Terminal</h4>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-white/2 border border-white/5 rounded-3xl group hover:border-orange-500/30 transition-all">
                       <div className="flex items-center gap-6">
                          <Key size={24} className="text-red-500" />
                          <div>
                             <span className="block text-[11px] font-black text-white uppercase tracking-widest">Administrative Credentials</span>
                             <span className="block text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-1">Request a secure password reset link</span>
                          </div>
                       </div>
                       <button 
                         onClick={handleResetPassword}
                         type="button"
                         className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                       >
                         Reset Password
                       </button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white/2 border border-white/5 rounded-3xl group hover:border-orange-500/30 transition-all">
                       <div className="flex items-center gap-6">
                          <Zap size={24} className="text-orange-500" />
                          <div>
                             <span className="block text-[11px] font-black text-white uppercase tracking-widest">Master Key Rotation</span>
                             <span className="block text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-1">Next Rotation in 12 Days</span>
                          </div>
                       </div>
                       <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">Rotate Now</button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white/2 border border-white/5 rounded-3xl group hover:border-orange-500/30 transition-all">
                       <div className="flex items-center gap-6">
                          <MapPin size={24} className="text-gray-500" />
                          <div>
                             <span className="block text-[11px] font-black text-white uppercase tracking-widest">Active Terminal Sessions</span>
                             <span className="block text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-1">3 Authorized Terminals Synchronized</span>
                          </div>
                       </div>
                       <ShieldCheck size={16} className="text-green-500" />
                    </div>
                 </div>
              </div>
           </div>

           {/* SIDEBAR / LOGOUT */}
           <div className="space-y-8">
              <div className="bg-gradient-to-br from-red-600 to-red-900 rounded-[48px] p-10 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><LogOut size={80} /></div>
                 <div className="relative z-10">
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-4 leading-none">Terminate Root Session</h4>
                    <p className="text-red-100 text-sm font-medium leading-relaxed mb-10">Immediate de-authorization of administrative tokens across all active nodes.</p>
                    <button 
                      onClick={signOut}
                      className="w-full py-6 bg-white text-red-600 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-gray-100 transition-all"
                    >
                       Safe De-authorization
                    </button>
                 </div>
              </div>

              <div className="bg-[#0f172a]/60 border border-white/10 rounded-[48px] p-10 space-y-8">
                 <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Administrative HUD</h4>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Extended Debug Info</span>
                       <div className="w-12 h-6 bg-red-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" /></div>
                    </div>
                    <div className={`flex items-center justify-between`}>
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Telemetry</span>
                       <div className="w-12 h-6 bg-white/10 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full" /></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  )
}

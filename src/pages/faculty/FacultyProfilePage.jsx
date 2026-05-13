import { useState, useEffect } from 'react'
import { User, Shield, Key, Bell, Globe, Camera, Edit3, CheckCircle2, AlertCircle, LogOut, ShieldCheck, Mail, MapPin, Building, ChevronRight, Save, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/index'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function FacultyProfilePage() {
  const { profile, signOut, fetchProfile } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      })
    }
  }, [profile])

  async function handleUpdate() {
    if (!formData.full_name.trim()) {
      toast.error('Name is required')
      return
    }
    try {
      setLoading(true)
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null
        })
        .eq('id', profile.id)
      
      if (error) throw error
      toast.success('Profile Updated ✓')
      if (fetchProfile) fetchProfile(profile.id)
    } catch (err) {
      toast.error('Update failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordChange() {
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setChangingPw(true)
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })
      if (error) throw error
      toast.success('Password Changed Successfully ✓')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setChangingPw(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      toast.error('Logout failed')
    }
  }

  return (
    <FacultyLayout>
      <div className="space-y-6 lg:space-y-8 pb-20 max-w-6xl mx-auto">
        {/* PROFILE HEADER */}
        <div className="relative">
           <div className="h-36 lg:h-48 w-full bg-gradient-to-br from-blue-600 to-indigo-900 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
           </div>
           
           <div className="absolute -bottom-12 left-1/2 lg:left-8 -translate-x-1/2 lg:translate-x-0 flex items-end gap-5">
              <div className="relative">
                 <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-[#161b22] border-4 border-[#0d1117] flex items-center justify-center text-white font-black text-3xl shadow-2xl">
                    {profile?.full_name?.[0] || '?'}
                 </div>
                 <div className="absolute -right-1 -bottom-1 w-7 h-7 bg-green-500 rounded-lg border-3 border-[#0d1117] flex items-center justify-center shadow-lg">
                    <ShieldCheck size={14} className="text-white" />
                 </div>
              </div>
              <div className="pb-1 hidden lg:block">
                 <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">{profile?.full_name}</h2>
                 <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mt-1">{profile?.email}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8 mt-16 lg:mt-20">
           {/* IDENTITY FORM */}
           <div className="lg:col-span-2 space-y-5">
              <div className="bg-[#161b22] border border-white/10 rounded-2xl lg:rounded-3xl p-5 lg:p-8 space-y-6">
                 <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <User size={16} className="text-blue-500" />
                    <h4 className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-[0.3em]">Profile Information</h4>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                       <input 
                         type="text" 
                         value={formData.full_name}
                         onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                       />
                    </div>
                    <div className="space-y-2 opacity-60">
                       <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Email (Read Only)</label>
                       <input 
                         type="email" 
                         value={profile?.email || ''}
                         disabled
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white cursor-not-allowed"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Phone</label>
                       <input 
                         type="tel" 
                         value={formData.phone}
                         onChange={(e) => setFormData({...formData, phone: e.target.value})}
                         placeholder="Enter phone number"
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
                       />
                    </div>
                    <div className="space-y-2 opacity-60">
                       <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Role</label>
                       <div className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-blue-500 flex items-center gap-2 capitalize">
                          <Shield size={14} /> {profile?.role || 'Faculty'}
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={handleUpdate}
                   disabled={loading}
                   className="w-full lg:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                    {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save size={14} /> Update Profile</>}
                 </button>
              </div>

              {/* PASSWORD CHANGE */}
              <div className="bg-[#161b22] border border-white/10 rounded-2xl lg:rounded-3xl p-5 lg:p-8 space-y-6">
                 <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Lock size={16} className="text-orange-500" />
                    <h4 className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-[0.3em]">Change Password</h4>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                       <input 
                         type="password" 
                         value={passwordForm.newPassword}
                         onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                         placeholder="Min 6 characters"
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-orange-500 transition-all placeholder:text-gray-600"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Confirm Password</label>
                       <input 
                         type="password" 
                         value={passwordForm.confirmPassword}
                         onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                         placeholder="Repeat password"
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-orange-500 transition-all placeholder:text-gray-600"
                       />
                    </div>
                 </div>

                 <button 
                   onClick={handlePasswordChange}
                   disabled={changingPw || !passwordForm.newPassword}
                   className="w-full lg:w-auto px-8 py-3.5 bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                 >
                    {changingPw ? 'Changing...' : 'Change Password'}
                 </button>
              </div>
           </div>

           {/* SIDEBAR */}
           <div className="space-y-5">
              {/* LOGOUT */}
              <div className="bg-gradient-to-br from-red-600 to-orange-700 rounded-2xl lg:rounded-3xl p-6 text-white relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform pointer-events-none"><LogOut size={60} /></div>
                 <div className="relative z-10">
                    <h4 className="text-lg font-black uppercase tracking-tighter mb-3 leading-tight">Sign Out</h4>
                    <p className="text-red-100 text-xs font-medium leading-relaxed mb-6">End your current session and clear authentication.</p>
                    <button 
                      onClick={handleSignOut}
                      className="w-full py-3.5 bg-white text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-gray-100 active:scale-95 transition-all"
                    >
                       Sign Out
                    </button>
                 </div>
              </div>

              {/* ACCOUNT INFO */}
              <div className="bg-[#161b22] border border-white/10 rounded-2xl lg:rounded-3xl p-5 space-y-4">
                 <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Account Details</h4>
                 <div className="space-y-3 text-[10px]">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                       <span className="text-gray-500 font-bold">Department</span>
                       <span className="text-white font-black uppercase">{profile?.department || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                       <span className="text-gray-500 font-bold">Access Level</span>
                       <span className="text-blue-500 font-black uppercase">{profile?.role || 'Faculty'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                       <span className="text-gray-500 font-bold">Member Since</span>
                       <span className="text-white font-black">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </FacultyLayout>
  )
}

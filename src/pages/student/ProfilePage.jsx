import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Edit2, Save, Shield, Building, Phone, Mail, Sparkles, Trophy, UserCheck, ShieldCheck, X, BadgeCheck } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import { BADGE_DEFINITIONS } from '../../lib/carbonCalc'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'Civil', 'MBA', 'Other']

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile, user, updateProfile, signOut } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', department: 'CSE' })
  const [badges, setBadges] = useState([])
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({ 
        full_name: profile.full_name || '', 
        phone: profile.phone || '', 
        department: profile.department || 'CSE' 
      })
    }
    if (profile?.id) {
      supabase.from('eco_badges').select('badge_key').eq('student_id', profile.id)
        .then(({ data }) => setBadges((data || []).map(b => b.badge_key)))
    }
  }, [profile])

  async function handleSave() {
    const { error } = await updateProfile(form)
    if (error) {
      toast.error('Failed to sync manifest')
    } else { 
      toast.success('Identity Synchronized! 🌿')
      setEditing(false) 
    }
  }

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const ecoGrade = profile?.eco_points >= 5000 ? 'Planet Guardian'
    : profile?.eco_points >= 1000 ? 'Tree Planter'
    : profile?.eco_points >= 500 ? 'Eco Champion'
    : 'Eco Starter'

  const isEmailVerified = user?.email_confirmed_at != null

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-6 max-w-lg mx-auto space-y-8">
        {/* HEADER AREA */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-green-500 to-emerald-700 p-1 shadow-2xl shadow-green-500/20"
            >
              <div className="w-full h-full rounded-[36px] bg-slate-900 flex items-center justify-center text-5xl font-black text-white shadow-inner">
                {profile?.full_name?.[0]}
              </div>
            </motion.div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-green-600 border-4 border-slate-950 flex items-center justify-center text-white shadow-lg">
              <Sparkles size={16} />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">{profile?.full_name}</h2>
          <div className="flex flex-wrap justify-center gap-2">
             <span className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">{profile?.department || 'General'}</span>
             <span className="px-4 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-[10px] font-black text-green-500 uppercase tracking-widest">{ecoGrade}</span>
          </div>
        </div>

        {/* CORE STATS */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 text-center backdrop-blur-xl">
              <p className="text-2xl font-black text-white tracking-tighter mb-1">{(profile?.eco_points || 0).toLocaleString()}</p>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Global Points</p>
           </div>
           <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 text-center backdrop-blur-xl">
              <p className="text-2xl font-black text-white tracking-tighter mb-1">{profile?.logging_streak || 0}d</p>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Active Streak</p>
           </div>
        </div>

        {/* IDENTITY DETAILS */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Identity Manifest</h3>
              <button 
                onClick={() => editing ? handleSave() : setEditing(true)}
                className="text-[9px] font-black text-green-500 uppercase tracking-widest hover:text-green-400 transition-colors flex items-center gap-1.5"
              >
                {editing ? <><Save size={12}/> Sync</> : <><Edit2 size={12}/> Update</>}
              </button>
           </div>

           <div className="bg-white/5 border border-white/10 rounded-[40px] p-2 space-y-1 backdrop-blur-xl">
              {/* FULL NAME */}
              <div className="p-5 flex items-center justify-between border-b border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                       <UserCheck size={18} />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-tight">Full Identity</span>
                 </div>
                 {editing ? (
                   <input 
                     value={form.full_name}
                     onChange={e => setForm({ ...form, full_name: e.target.value })}
                     className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-[11px] font-black text-white uppercase outline-none focus:border-green-500 transition-all w-40 text-right"
                   />
                 ) : (
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{profile?.full_name}</span>
                 )}
              </div>

              {/* ROLE & SECURITY */}
              <div className="p-5 flex items-center justify-between border-b border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                       <ShieldCheck size={18} />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-tight">Access Level</span>
                 </div>
                 <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-500 uppercase tracking-widest">{profile?.role || 'Student'}</span>
              </div>

              {/* DEPARTMENT */}
              <div className="p-5 flex items-center justify-between border-b border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                       <Building size={18} />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-tight">Registry Node</span>
                 </div>
                 {editing ? (
                   <select 
                     value={form.department} 
                     onChange={e => setForm({ ...form, department: e.target.value })}
                     className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-black text-white uppercase outline-none appearance-none"
                   >
                     {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
                 ) : (
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{profile?.department || 'CSE'}</span>
                 )}
              </div>

              {/* CONTACT */}
              <div className="p-5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                       <Phone size={18} />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-tight">Contact Node</span>
                 </div>
                 {editing ? (
                   <input 
                     value={form.phone} 
                     onChange={e => setForm({ ...form, phone: e.target.value })}
                     placeholder="Phone Number"
                     className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-[11px] font-black text-white uppercase outline-none focus:border-green-500 transition-all w-40 text-right"
                   />
                 ) : (
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{profile?.phone || 'Not Logged'}</span>
                 )}
              </div>
           </div>
        </section>

        {/* SECURITY & AUTH */}
        <section className="space-y-4">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">Security Protocol</h3>
           <div className="bg-white/5 border border-white/10 rounded-[40px] p-6 space-y-6 backdrop-blur-xl">
              <div>
                 <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Primary E-Mail</label>
                 <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-white uppercase tracking-tight">{user?.email}</p>
                    {isEmailVerified ? (
                      <div className="flex items-center gap-1.5 text-green-500">
                         <BadgeCheck size={14} />
                         <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-500">
                         <Shield size={14} />
                         <span className="text-[9px] font-black uppercase tracking-widest">Unverified</span>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </section>

        {/* ACTIONS */}
        <div className="space-y-4 pt-4">
           <button 
             onClick={() => setShowLogout(true)}
             className="w-full py-6 rounded-[32px] bg-red-600/5 border border-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-600/5"
           >
              Terminate Session
           </button>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      <AnimatePresence>
        {showLogout && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => setShowLogout(false)} 
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 left-6 right-6 lg:left-72 z-[101] bg-slate-900 border border-white/10 rounded-[40px] p-10 shadow-2xl max-w-lg mx-auto"
            >
              <div className="w-20 h-20 rounded-[28px] bg-red-600/10 flex items-center justify-center mb-8 mx-auto">
                <LogOut size={32} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-white text-center mb-2 tracking-tight uppercase">Disconnect?</h3>
              <p className="text-sm text-gray-500 text-center mb-10 font-medium leading-relaxed">
                Identity manifest will be cleared from this node. You must re-authenticate to access the Nexus.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowLogout(false)} 
                  className="flex-1 py-5 rounded-2xl bg-white/5 text-gray-500 font-black text-[10px] uppercase tracking-widest"
                >
                  Return
                </button>
                <button 
                  onClick={handleLogout} 
                  className="flex-1 py-5 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-600/20"
                >
                  Terminate
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, Edit2, Save, Bell, Shield, MapPin, Building, Phone, Mail, ChevronRight, Sparkles, Trophy } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import { BADGE_DEFINITIONS } from '../../lib/carbonCalc'
import { supabase } from '../../lib/supabase'
import BottomTabBar from '../../components/BottomTabBar'
import EcoScoreRing from '../../components/EcoScoreRing'
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
      setForm({ full_name: profile.full_name || '', phone: profile.phone || '', department: profile.department || 'CSE' })
    }
    if (profile?.id) {
      supabase.from('eco_badges').select('badge_key').eq('student_id', profile.id)
        .then(({ data }) => setBadges((data || []).map(b => b.badge_key)))
    }
  }, [profile])

  async function handleSave() {
    const { error } = await updateProfile(form)
    if (error) toast.error('Failed to save changes')
    else { toast.success('Profile updated! 🌿'); setEditing(false) }
  }

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const ecoGrade = profile?.eco_points >= 5000 ? 'Planet Guardian'
    : profile?.eco_points >= 1000 ? 'Tree Planter'
    : profile?.eco_points >= 500 ? 'Eco Champion'
    : 'Eco Starter'

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-green-500/5 blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 px-6 py-4 backdrop-blur-xl bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </motion.button>
          <h1 className="text-xl font-black text-white tracking-tight">Identity</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setEditing(!editing)}
          className={`p-2.5 rounded-2xl border transition-all ${
            editing ? 'bg-green-600 border-green-600 text-white' : 'bg-white/5 border-white/10 text-gray-400'
          }`}
        >
          {editing ? <Save size={18} /> : <Edit2 size={18} />}
        </motion.button>
      </header>

      <main className="px-6 pt-8 relative z-10 max-w-lg mx-auto">
        {/* PROFILE HERO */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="w-28 h-28 rounded-[40px] bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-green-500/20 relative z-10">
              {profile?.full_name?.[0] || '?'}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-white/10 p-2 rounded-2xl shadow-xl z-20">
               <Shield size={16} className="text-green-500" />
            </div>
            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-110 opacity-30" />
          </div>
          
          <h2 className="text-2xl font-black text-white tracking-tight mb-1">{profile?.full_name}</h2>
          <p className="text-sm text-gray-500 font-medium mb-4">{user?.email}</p>
          
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-4 py-1.5 rounded-xl bg-green-600/10 border border-green-500/20 text-[10px] font-black text-green-500 uppercase tracking-widest shadow-sm">
              {ecoGrade}
            </span>
            <span className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {profile?.department} · {profile?.role}
            </span>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Eco XP', value: (profile?.eco_points || 0).toLocaleString(), icon: Sparkles, color: 'text-green-500' },
            { label: 'Streak', value: profile?.logging_streak || 0, icon: Trophy, color: 'text-orange-500' },
            { label: 'Badges', value: badges.length, icon: Shield, color: 'text-blue-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/5 rounded-[32px] p-4 text-center"
            >
              <stat.icon size={16} className={`${stat.color} mx-auto mb-2 opacity-80`} />
              <p className="text-lg font-black text-white leading-none mb-1">{stat.value}</p>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* INFO SECTION */}
        <div className="space-y-4 mb-10">
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2 mb-4">Registry Information</h3>
          
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 text-gray-500 mb-1">
                <Building size={14} />
                <label className="text-[10px] font-black uppercase tracking-widest">Departmental Node</label>
              </div>
              {editing ? (
                <select 
                  value={form.department} 
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-green-500 transition-all"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <p className="text-sm font-black text-white ml-8">{profile?.department}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3 text-gray-500 mb-1">
                <Phone size={14} />
                <label className="text-[10px] font-black uppercase tracking-widest">Contact Signal</label>
              </div>
              {editing ? (
                <input 
                  value={form.phone} 
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-green-500 transition-all placeholder:text-gray-700"
                />
              ) : (
                <p className="text-sm font-black text-white ml-8">{profile?.phone || 'Signal Not Configured'}</p>
              )}
            </div>
          </div>
        </div>

        {/* BADGES SECTION */}
        {badges.length > 0 && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-5 px-2">
              <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Merit Badges</h3>
              <button onClick={() => navigate('/leaderboard')} className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                Manifest All
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {BADGE_DEFINITIONS.filter(b => badges.includes(b.key)).map(b => (
                <div key={b.key} className="flex-shrink-0 bg-white/5 border border-white/5 rounded-2xl px-5 py-3 flex items-center gap-3">
                  <span className="text-lg">{b.emoji}</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATION PREFERENCES */}
        <div className="space-y-4 mb-10">
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2 mb-4">Neural Preferences</h3>
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-4">
            {[
              { label: 'Eco Insights', icon: Sparkles },
              { label: 'Bus Telemetry', icon: MapPin },
              { label: 'Cafeteria Logs', icon: Building },
              { label: 'Attendance Sync', icon: Shield },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 last:border-0 border-b border-white/5 last:pb-0">
                <div className="flex items-center gap-3 text-gray-400">
                  <item.icon size={16} />
                  <span className="text-xs font-bold tracking-tight text-gray-300">{item.label}</span>
                </div>
                <div className="w-10 h-5 rounded-full bg-green-600 p-1 cursor-pointer relative">
                  <div className="w-3 h-3 rounded-full bg-white ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LOGOUT */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogout(true)}
          className="w-full py-5 rounded-[32px] border border-red-500/20 bg-red-500/5 text-red-500 font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-red-500/10 transition-all shadow-lg shadow-red-500/5"
        >
          Sign Out <LogOut size={16} />
        </motion.button>

        <p className="text-center text-[10px] font-black text-gray-700 uppercase tracking-[0.5em] mt-12 mb-8 opacity-40">
           Project InstitutePulse • Nexus OS
        </p>
      </main>

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
              className="fixed bottom-6 left-6 right-6 z-[101] bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6 mx-auto">
                <LogOut size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white text-center mb-2 tracking-tight">Disconnect Session?</h3>
              <p className="text-sm text-gray-500 text-center mb-8 font-medium leading-relaxed">
                You'll need to re-authenticate to access your InstitutePulse dashboard and eco-sync data.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowLogout(false)} 
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-gray-400 font-black text-[10px] uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout} 
                  className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-600/20"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomTabBar />
    </div>
  )
}


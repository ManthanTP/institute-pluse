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
    <main className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 lg:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-green-500 to-emerald-700 p-1 shadow-2xl shadow-green-500/20">
              <div className="w-full h-full rounded-[36px] bg-slate-900 flex items-center justify-center text-4xl font-black text-white">
                {profile?.full_name?.[0]}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-green-600 border-4 border-slate-950 flex items-center justify-center text-white shadow-lg">
              <Sparkles size={16} />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{profile?.full_name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
               <span className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">{profile?.department}</span>
               <span className="px-4 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-[10px] font-black text-green-500 uppercase tracking-widest">{ecoGrade}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center px-6 border-r border-white/5">
              <p className="text-2xl font-black text-white leading-none mb-1">{(profile?.eco_points || 0).toLocaleString()}</p>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Points</p>
            </div>
            <div className="text-center px-6">
              <p className="text-2xl font-black text-white leading-none mb-1">{profile?.logging_streak || 0}</p>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Streak</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Security / Account Info */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 px-2">
            <Shield size={18} className="text-green-500" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Security Protocol</h3>
          </div>
          
          <div className="glass-card p-8 space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Email Address</label>
              <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-gray-300">
                {user?.email}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Access Password</label>
              <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-gray-300 flex justify-between items-center">
                <span>••••••••••••</span>
                <button className="text-green-500 text-[10px] font-black uppercase tracking-widest hover:text-green-400">Rotate</button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Registry Settings */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 px-2">
            <Building size={18} className="text-blue-500" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Nexus Registry</h3>
          </div>
          
          <div className="glass-card p-2">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                    <Building size={18} />
                  </div>
                  <span className="text-sm font-bold text-white">Department</span>
                </div>
                {editing ? (
                  <select 
                    value={form.department} 
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-bold outline-none focus:border-green-500 transition-all"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{profile?.department}</span>
                )}
              </div>
            </div>

            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                    <Phone size={18} />
                  </div>
                  <span className="text-sm font-bold text-white">Contact</span>
                </div>
                {editing ? (
                  <input 
                    value={form.phone} 
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-bold outline-none focus:border-green-500 transition-all w-32 text-right"
                  />
                ) : (
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{profile?.phone || 'Not Set'}</span>
                )}
              </div>
            </div>

            <div className="p-6">
              <button 
                onClick={() => editing ? handleSave() : setEditing(true)}
                className="w-full flex items-center justify-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-400"
              >
                {editing ? <Save size={14} /> : <Edit2 size={14} />}
                {editing ? 'Synchronize' : 'Edit Registry'}
              </button>
            </div>
          </div>
        </motion.section>
      </div>

      {/* BADGES SECTION */}
      {badges.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 px-2">
            <Award size={18} className="text-yellow-500" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Merit Badges</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {BADGE_DEFINITIONS.filter(b => badges.includes(b.key)).map(b => (
              <div key={b.key} className="flex-shrink-0 glass-card px-6 py-4 flex items-center gap-4">
                <span className="text-2xl">{b.emoji}</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">{b.name}</span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      <button 
        onClick={() => setShowLogout(true)}
        className="w-full py-6 rounded-[32px] bg-red-500/5 border border-red-500/10 text-red-500 font-black uppercase tracking-[0.3em] text-xs hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/5"
      >
        Terminate Session
      </button>

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
              className="fixed bottom-6 left-6 right-6 z-[101] bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl max-w-lg mx-auto"
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
    </main>
  )
}


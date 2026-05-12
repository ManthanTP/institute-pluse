import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, Building, Hash, GraduationCap, Users, Camera, Save, ArrowLeft, ShieldCheck, Sparkles, Zap, Award } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/index'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useAuthStore()
  const [semesters, setSemesters] = useState([])
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    department: '',
    usn: '',
    semester_id: '',
    division_id: ''
  })

  useEffect(() => {
    async function loadData() {
      const { data: sems } = await supabase.from('academic_semesters').select('*').order('name')
      const { data: divs } = await supabase.from('academic_divisions').select('*').order('name')
      if (sems) setSemesters(sems)
      if (divs) setDivisions(divs)
      
      if (profile) {
        setForm({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          department: profile.department || '',
          usn: profile.usn || '',
          semester_id: profile.semester_id || '',
          division_id: profile.division_id || ''
        })
      }
    }
    loadData()
  }, [profile])

  const filteredDivisions = divisions.filter(d => 
    d.department === form.department && 
    d.semester_id === form.semester_id
  )

  // Only clear if the user is actively changing values (not on initial load)
  const [isReady, setIsReady] = useState(false)
  useEffect(() => {
    if (isReady) {
      setForm(f => ({ ...f, division_id: '' }))
    } else if (form.semester_id) {
      setIsReady(true)
    }
  }, [form.department, form.semester_id])

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await updateProfile(form)
      if (error) throw error
      toast.success('Neural Identity Synchronized!')
    } catch (err) {
      toast.error(err.message || 'Sync failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40%] h-[30%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[30%] rounded-full bg-green-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 px-6 pt-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
           <button onClick={() => navigate(-1)} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
           </button>
           <h1 className="text-sm font-black text-white uppercase tracking-[0.4em]">Nexus Profile</h1>
           <div className="w-11" /> {/* Spacer */}
        </div>

        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center mb-10">
           <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-blue-500 to-green-500 p-[1px] shadow-2xl shadow-blue-500/20">
                 <div className="w-full h-full rounded-[39px] bg-slate-950 flex items-center justify-center overflow-hidden relative">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-gray-700" />
                    )}
                 </div>
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/40 border-4 border-slate-950 hover:scale-110 transition-transform">
                 <Camera size={16} />
              </button>
           </div>
           <div className="text-center mt-6">
              <h2 className="text-2xl font-black text-white tracking-tighter">{profile?.full_name}</h2>
              <div className="flex items-center gap-2 justify-center mt-2">
                 <ShieldCheck size={14} className="text-blue-500" />
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Authorized {profile?.role}</span>
              </div>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-10">
           {[
             { label: 'ECO XP', val: profile?.eco_points || 0, icon: Sparkles, color: 'text-yellow-500' },
             { label: 'CO2 SAVED', val: `${profile?.total_co2_kg?.toFixed(1)}kg`, icon: Zap, color: 'text-green-500' },
             { label: 'BADGES', val: '12', icon: Award, color: 'text-blue-500' },
           ].map(stat => (
             <div key={stat.label} className="bg-white/5 border border-white/5 rounded-3xl p-4 text-center">
                <stat.icon size={16} className={`${stat.color} mx-auto mb-2`} />
                <p className="text-lg font-black text-white leading-none mb-1">{stat.val}</p>
                <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
             </div>
           ))}
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
           <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Personal Telemetry</h3>
                 <div className="flex-1 h-[1px] bg-white/5" />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Manifest Email</label>
                 <div className="relative opacity-50">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input type="text" value={profile?.email} disabled className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-500 outline-none" />
                 </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Legal Name</label>
                 <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      value={form.full_name} 
                      onChange={e => setForm({...form, full_name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 transition-all" 
                    />
                 </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Communication Link</label>
                 <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="tel" 
                      value={form.phone} 
                      onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 transition-all" 
                    />
                 </div>
              </div>

              <div className="flex items-center gap-3 pt-4 mb-2">
                 <h3 className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em]">Academic Registry</h3>
                 <div className="flex-1 h-[1px] bg-white/5" />
              </div>

              {/* USN */}
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">University Serial Number (USN)</label>
                 <div className="relative">
                    <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      value={form.usn} 
                      onChange={e => setForm({...form, usn: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 transition-all uppercase" 
                      placeholder="e.g. 1MS22CS001"
                    />
                 </div>
              </div>

              {/* Department */}
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Academic Department</label>
                 <div className="relative">
                    <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <select 
                      value={form.department} 
                      onChange={e => setForm({...form, department: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                    >
                       {['CSE', 'ECE', 'ME', 'Civil', 'MBA', 'Other'].map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                    </select>
                 </div>
              </div>

              {/* Sem & Div */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Semester</label>
                    <select 
                      value={form.semester_id} 
                      onChange={e => setForm({...form, semester_id: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                    >
                       <option value="" className="bg-slate-900">Select Sem</option>
                       {semesters.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Division</label>
                    <select 
                      value={form.division_id} 
                      onChange={e => setForm({...form, division_id: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                    >
                       <option value="" className="bg-slate-900">Select Div</option>
                       {filteredDivisions.map(d => <option key={d.id} value={d.id} className="bg-slate-900">Division {d.name}</option>)}
                    </select>
                 </div>
              </div>
           </div>

           <motion.button
             whileTap={{ scale: 0.95 }}
             disabled={loading}
             className="w-full py-5 bg-blue-600 text-white rounded-[28px] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
           >
              {loading ? 'Synchronizing...' : 'Update Protocol'} <Save size={18} />
           </motion.button>
        </form>

        {/* Security Footer */}
        <div className="mt-12 text-center opacity-30">
           <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.5em]">Identity Secured by InstitutePulse Nexus</p>
        </div>
      </div>
    </div>
  )
}

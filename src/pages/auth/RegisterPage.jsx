import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'Civil', 'MBA', 'Other']

function PasswordStrength({ password }) {
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 8 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500']

  return password ? (
    <div className="mt-2 px-1">
      <div className="flex gap-1.5 mb-1.5">
        {[1, 2, 3, 4].map(i => (
          <motion.div 
            key={i} 
            initial={false}
            animate={{ background: i <= strength ? '' : 'rgba(255,255,255,0.1)' }}
            className={`h-1 flex-1 rounded-full ${i <= strength ? colors[strength] : ''}`} 
          />
        ))}
      </div>
      <p className={`text-[10px] font-black uppercase tracking-widest ${strength >= 3 ? 'text-green-500' : 'text-gray-400'}`}>
        Security: {labels[strength]}
      </p>
    </div>
  ) : null
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', department: 'CSE',
    role: 'student', password: '', confirm_password: ''
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password too short.')
    if (!agreed) return setError('Please agree to terms.')

    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name } }
      })
      if (authError) throw authError
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: form.full_name,
          role: form.role,
          phone: form.phone || null,
          department: form.department,
          eco_points: 50, // Higher bonus for premium launch
          logging_streak: 0,
          total_co2_kg: 0,
        })
      }
      toast.success('Welcome to the Ecosystem! 🌿')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[60%] h-[40%] rounded-full bg-green-500/10 blur-[120px] z-0" />
      <div className="absolute bottom-0 left-0 w-[60%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] z-0" />

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md"
          >
            <div className="relative w-20 h-20">
               <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
               <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-6 text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse">Initializing Profile</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <img src="/logo_no_bg.png" alt="Logo" className="w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
          <h1 className="text-3xl font-black text-white tracking-tighter">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium tracking-tight">Join the smart campus revolution today.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl shadow-black/40 relative"
        >
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-8 left-8 p-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-colors lg:-left-20 lg:top-0"
          >
            <ArrowRight size={20} className="rotate-180" />
          </button>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-5">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                    <input 
                      type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
                      placeholder="Alex Johnson" required
                    />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">College Email</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                    <input 
                      type="email" value={form.email} onChange={e => update('email', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
                      placeholder="alex@uni.edu" required
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Phone</label>
                     <div className="relative group">
                       <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                       <input 
                         type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
                         placeholder="+91 00000 00000"
                       />
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Department</label>
                     <div className="relative group">
                       <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                       <select 
                         value={form.department} onChange={e => update('department', e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-green-500/50 appearance-none transition-all cursor-pointer"
                       >
                         {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                       </select>
                     </div>
                  </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                 <div className="relative group">
                   <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                   <input 
                     type={showPw ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
                     placeholder="Enter Password" required
                   />
                   <button 
                     type="button" onClick={() => setShowPw(!showPw)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                   >
                     {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                 </div>
                 <PasswordStrength password={form.password} />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Verify Password</label>
                  <div className="relative group">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                    <input 
                      type="password" value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
                      placeholder="Confirm Password" required
                    />
                  </div>
               </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group py-2">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-2 border-white/10 rounded-lg bg-white/5 checked:bg-green-600 checked:border-green-600 transition-all cursor-pointer"
                />
                <CheckCircle2 size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">
                I commit to fostering a sustainable campus and agree to the <span className="text-green-500 font-bold">Privacy Policy</span>.
              </span>
            </label>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-3"
            >
              Sign Up <ArrowRight size={18} />
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 font-medium">
              Already a member?{' '}
              <Link to="/login" className="text-green-500 font-black hover:text-green-400 transition-colors">Login Here</Link>
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-6 text-gray-600"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-green-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">AI Ready</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

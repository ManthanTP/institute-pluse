import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../assets/logo.png'

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
        options: {
          data: {
            full_name: form.full_name,
            role: form.role,
            department: form.department
          }
        }
      })
      if (authError) throw authError

      if (data.user) {
        // Ensure profile is fully populated
        const { error: profileError } = await supabase.from('profiles')
          .update({
            full_name: form.full_name,
            role: form.role,
            phone: form.phone || null,
            department: form.department,
            eco_points: 100, // Premium launch bonus
            logging_streak: 0,
            total_co2_kg: 0,
          })
          .eq('id', data.user.id)

        if (profileError) console.error('Profile init error:', profileError)
      }

      toast.success('Nexus Identity Initialized! 🌿')

      // Redirect based on selected role
      if (form.role === 'faculty') navigate('/faculty/dashboard')
      else if (form.role === 'admin') navigate('/12345678/admin/dashboard')
      else navigate('/dashboard')

    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col lg:flex-row overflow-hidden relative">
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

      {/* LEFT PANEL - PROMO (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12 bg-gradient-to-br from-green-900/40 to-slate-950 border-r border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-16 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo_no_bg.png" alt="Logo" className="w-10 h-10 object-contain shadow-lg shadow-green-500/20" />
            <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              INSTITUTE<span className="text-green-500">PULSE</span>
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Sparkles size={14} className="text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">Join 12,000+ Students</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
              The Smart Campus<br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Operating System.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md font-medium leading-relaxed">
              Track your carbon footprint, explore events, and manage your academic life in one powerful ecosystem.
            </p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
              <ShieldCheck size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Bank-Grade Security</p>
              <p className="text-xs text-gray-500 font-medium">Your data is encrypted and protected.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <CheckCircle2 size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Instant Eco-Points</p>
              <p className="text-xs text-gray-500 font-medium">Get 50 XP instantly upon registration.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT PANEL - REGISTRATION FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Header (Only visible on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <img src={logo} alt="Logo" className="w-16 h-16 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]" />
            <h1 className="text-3xl font-black text-white tracking-tighter">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium tracking-tight">Join the smart campus revolution today.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 lg:p-10 shadow-2xl shadow-black/40">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-5">
                {/* Full Name */}
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

                {/* Email & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                      <input
                        type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
                        placeholder="+91 98765 43210" required
                      />
                    </div>
                  </div>
                </div>

                {/* Role & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Account Role</label>
                    <div className="flex gap-2">
                      {['student', 'faculty'].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm({ ...form, role: r })}
                          className={`flex-1 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${form.role === r
                            ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20'
                            : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                            }`}
                        >
                          {r}
                        </button>
                      ))}
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

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                      <input
                        type={showPw ? "text" : "password"} value={form.password} onChange={e => update('password', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
                        placeholder="••••••••" required
                      />
                      <button
                        type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Confirm Identity</label>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                      <input
                        type={showPw ? "text" : "password"} value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
                        placeholder="Confirm" required
                      />
                    </div>
                  </div>
                </div>
                <PasswordStrength password={form.password} />
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 mt-6 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                    className="appearance-none w-5 h-5 border-2 border-gray-600 rounded-lg checked:border-green-500 checked:bg-green-500 transition-all peer"
                  />
                  <CheckCircle2 size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs text-gray-400 leading-relaxed font-medium">
                  I agree to the <a href="#" className="text-white font-bold hover:text-green-500 transition-colors">Terms of Service</a> and <a href="#" className="text-white font-bold hover:text-green-500 transition-colors">Privacy Policy</a>.
                </span>
              </label>

              <button
                type="submit" disabled={loading}
                className="w-full mt-6 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-green-500 transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <p className="text-xs text-gray-500 font-medium">
                Already part of the ecosystem?{' '}
                <Link to="/login" className="text-green-500 font-bold hover:text-green-400 transition-colors">Sign in here</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, ChevronLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useLandingContent } from '../../hooks/useLandingContent'
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
  const [semesters, setSemesters] = useState([])
  const [divisions, setDivisions] = useState([])
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', department: 'CSE',
    role: 'student', password: '', confirm_password: '',
    usn: '', semester_id: '', division_id: ''
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  // Pull Terms & Privacy content from the same CMS the landing page and admin editor use
  const { content: cms } = useLandingContent()
  const termsContent = cms?.terms || {}
  const privacyContent = cms?.privacy || {}

  useEffect(() => {
    async function loadAcademicData() {
      const { data: sems } = await supabase.from('academic_semesters').select('*').order('name')
      const { data: divs } = await supabase.from('academic_divisions').select('*').order('name')
      if (sems) setSemesters(sems)
      if (divs) setDivisions(divs)
    }
    loadAcademicData()
  }, [])

  const filteredDivisions = divisions.filter(d => 
    d.department === form.department && 
    d.semester_id === form.semester_id
  )

  useEffect(() => {
    setAdminKey('')
    setForm(f => ({ ...f, division_id: '' }))
  }, [form.role, form.department, form.semester_id])

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password too short.')
    if (form.role === 'student') {
      if (!form.usn) return setError('USN is required for students.')
      const cleanUsn = form.usn.trim().toUpperCase()
      if (cleanUsn.length !== 10) return setError('USN must be exactly 10 characters (e.g. 2JH25CS061).')
    }
    
    // Key validation
    const FACULTY_KEY = import.meta.env.VITE_FACULTY_SECRET_KEY || 'PULSE_FACULTY_2026'
    const ADMIN_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY || 'PULSE_ADMIN_2026'

    if (form.role === 'faculty' && adminKey !== FACULTY_KEY) {
      return setError('Invalid Faculty Registration Key.')
    }
    if (form.role === 'admin' && adminKey !== ADMIN_KEY) {
      return setError('Invalid Administrative Access Key.')
    }

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
            phone: form.phone || '',
            department: form.department,
            usn: form.role === 'student' ? form.usn.trim().toUpperCase() : '',
            semester_id: form.role === 'student' ? (form.semester_id || '') : '',
            division_id: form.role === 'student' ? (form.division_id || '') : ''
          }
        }
      })
      if (authError) throw authError

      // The handle_new_user trigger auto-creates the profile with all fields
      // User needs to confirm email before they can login
      if (data.user && !data.session) {
        // Email confirmation required
        toast.success('Check your email to confirm your account! 📧')
        navigate('/login')
      } else if (data.session) {
        // Auto-confirmed (e.g. email confirmation disabled)
        toast.success('Pulse Identity Initialized! 🌿')
        if (form.role === 'faculty') navigate('/faculty/dashboard')
        else if (form.role === 'admin') navigate('/12345678/admin/dashboard')
        else navigate('/dashboard')
      }

    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col lg:flex-row overflow-hidden relative">
      {/* Back Button */}
      <Link 
        to="/login" 
        className="absolute top-6 left-6 z-20 flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
        title="Go back to Login"
      >
        <ChevronLeft size={20} />
      </Link>

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
                  <div className="space-y-1.5 sm:col-span-2">
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
                  <div className="space-y-1.5 sm:col-span-2">
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

                {/* Academic Data (Only for Students) */}
                <AnimatePresence>
                  {form.role === 'student' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-5 overflow-hidden"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">USN (University Serial Number)</label>
                        <div className="relative group">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                          <input
                            type="text" value={form.usn} onChange={e => update('usn', e.target.value.toUpperCase().slice(0, 10))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all uppercase font-mono"
                            placeholder="e.g. 2JH25CS061" required={form.role === 'student'}
                            maxLength={10}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Semester</label>
                          <select
                            value={form.semester_id} onChange={e => update('semester_id', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white outline-none focus:border-green-500/50 appearance-none transition-all cursor-pointer"
                            required={form.role === 'student'}
                          >
                            <option value="" className="bg-slate-900">Select Sem</option>
                            {semesters.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Division</label>
                          <select
                            value={form.division_id} onChange={e => update('division_id', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white outline-none focus:border-green-500/50 appearance-none transition-all cursor-pointer"
                            required={form.role === 'student'}
                          >
                            <option value="" className="bg-slate-900">Select Div</option>
                            {filteredDivisions.map(d => <option key={d.id} value={d.id} className="bg-slate-900">Division {d.name}</option>)}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Secure Key (Faculty or Admin) */}
                <AnimatePresence>
                  {(form.role === 'faculty' || form.role === 'admin') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        {form.role === 'admin' ? 'Administrative Access Key' : 'Faculty Registration Key'}
                      </label>
                      <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                        <input
                          type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
                          placeholder={form.role === 'admin' ? "Protocol key for admin access" : "Required for faculty accounts"} 
                          required
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                  I agree to the <button type="button" onClick={(e) => { e.preventDefault(); setTermsOpen(true); }} className="text-white font-bold hover:text-green-500 transition-colors">Terms of Service</button> and <button type="button" onClick={(e) => { e.preventDefault(); setPrivacyOpen(true); }} className="text-white font-bold hover:text-green-500 transition-colors">Privacy Policy</button>.
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

      {/* ─── TERMS OF SERVICE MODAL ─── */}
      <AnimatePresence>
        {termsOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setTermsOpen(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-slate-900/95 border border-white/[0.08] rounded-3xl p-6 md:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[40px] rounded-full pointer-events-none" />
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-5">
                <span className="text-xs font-black uppercase tracking-widest text-green-400">{termsContent.sectionTitle || 'Terms of Service'}</span>
                <button onClick={() => setTermsOpen(false)} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-sm">✕</button>
              </div>
              <div className="text-xs text-gray-400 space-y-5 leading-relaxed font-medium">
                {(termsContent.items || [
                  { title: '1. Usage License', content: 'Students and faculty members are granted permission to access InstitutePulse for academic, sustainability tracking, and coordination activities.' },
                  { title: '2. Accurate Reporting', content: 'Users agree to log genuine, authentic commute methods and attendance sessions. Fraudulent logging may result in account suspension.' },
                  { title: '3. Service Access', content: 'While we target 99.9% operational uptime, access to dashboard features may occasionally be paused for system enhancements.' }
                ]).map((item, idx) => (
                  <div key={idx}>
                    <p className="text-white font-bold uppercase tracking-wider mb-1.5 text-[10px]">{item.title}</p>
                    <p>{item.content}</p>
                  </div>
                ))}
                <div className="pt-4 border-t border-white/[0.05]">
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Effective: June 1, 2026 • Version 1.0</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PRIVACY POLICY MODAL ─── */}
      <AnimatePresence>
        {privacyOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPrivacyOpen(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-slate-900/95 border border-white/[0.08] rounded-3xl p-6 md:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full pointer-events-none" />
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-5">
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">{privacyContent.sectionTitle || 'Privacy Policy'}</span>
                <button onClick={() => setPrivacyOpen(false)} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-sm">✕</button>
              </div>
              <div className="text-xs text-gray-400 space-y-5 leading-relaxed font-medium">
                {(privacyContent.items || [
                  { title: '1. Data Collection', content: 'InstitutePulse securely logs carbon saving records and class QR code check-ins.' },
                  { title: '2. Secure Encryption', content: 'All data is transmitted via SSL and stored securely, protected by row-level security (RLS).' },
                  { title: '3. Data Ownership', content: 'We do not share your campus logs with third-party service providers.' }
                ]).map((item, idx) => (
                  <div key={idx}>
                    <p className="text-white font-bold uppercase tracking-wider mb-1.5 text-[10px]">{item.title}</p>
                    <p>{item.content}</p>
                  </div>
                ))}
                <div className="pt-4 border-t border-white/[0.05]">
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Effective: June 1, 2026 • Version 1.0</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

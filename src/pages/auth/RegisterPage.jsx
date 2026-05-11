import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, Building } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'Civil', 'MBA', 'Other']

function PasswordStrength({ password }) {
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 8 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#ef4444', '#f59e0b', '#22c55e', '#16a34a']

  return password ? (
    <div className="mt-1">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= strength ? colors[strength] : '#e2e8f0' }} />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color: colors[strength] }}>{labels[strength]}</p>
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

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!agreed) {
      setError('Please agree to the terms.')
      return
    }

    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.full_name }
        }
      })

      if (authError) throw authError

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: form.full_name,
          role: form.role,
          phone: form.phone || null,
          department: form.department,
          eco_points: 20, // profile setup bonus
          logging_streak: 0,
          total_co2_kg: 0,
        })

        if (profileError) console.error('Profile creation error:', profileError)
      }

      toast.success('Account created! Welcome to InstitutePulse 🌿')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 relative overflow-hidden bg-slate-900">
      {/* Background decoration */}
      <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[100px]" style={{ background: '#16a34a' }} />
      <div className="absolute bottom-[-5%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[100px]" style={{ background: '#0ea5e9' }} />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="spinner spinner-large spinner-green mb-4" />
          <p className="text-green-400 font-bold tracking-wide">Creating Account...</p>
        </div>
      )}

      <div className="w-full max-w-sm mx-auto animate-fade-in-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-6 flex flex-col items-center">
          <img src="/logo.png" alt="InstitutePulse Logo" className="brand-logo-large mb-2" style={{ height: '80px' }} />
          <h1 className="text-2xl font-bold text-white tracking-tight">Join InstitutePulse</h1>
          <p className="text-slate-400 text-sm mt-1">Join the Green Campus Movement</p>
        </div>

        <div className="card glass-card p-6 !border-slate-700/50 !bg-slate-800/60">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium border border-red-500/20 bg-red-500/10 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)}
                  className="input-field pl-11 !bg-slate-900/50 !border-slate-700 !text-white focus:!border-green-500 focus:!ring-1 focus:!ring-green-500 placeholder:text-slate-500 transition-all" 
                  placeholder="Your Full Name" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">College Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  className="input-field pl-11 !bg-slate-900/50 !border-slate-700 !text-white focus:!border-green-500 focus:!ring-1 focus:!ring-green-500 placeholder:text-slate-500 transition-all" 
                  placeholder="student@college.edu" required />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  className="input-field pl-11 !bg-slate-900/50 !border-slate-700 !text-white focus:!border-green-500 focus:!ring-1 focus:!ring-green-500 placeholder:text-slate-500 transition-all" 
                  placeholder="+91 9999999999" />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Department</label>
              <div className="relative">
                <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={form.department} onChange={e => update('department', e.target.value)}
                  className="input-field pl-11 appearance-none !bg-slate-900/50 !border-slate-700 !text-white focus:!border-green-500 focus:!ring-1 focus:!ring-green-500 transition-all">
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-slate-800">{d}</option>)}
                </select>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'student', label: 'Student', emoji: '👨‍🎓', desc: 'Track carbon & earn points' },
                  { key: 'driver', label: 'Driver', emoji: '🚌', desc: 'Share live bus GPS' },
                ].map(r => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => update('role', r.key)}
                    className="p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: form.role === r.key ? '#16a34a' : 'transparent',
                      background: form.role === r.key ? 'rgba(22, 163, 74, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                    }}
                  >
                    <div className="text-2xl mb-1">{r.emoji}</div>
                    <div className="font-semibold text-sm text-white">{r.label}</div>
                    <div className="text-xs text-slate-400">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => update('password', e.target.value)}
                  className="input-field pl-11 pr-11 !bg-slate-900/50 !border-slate-700 !text-white focus:!border-green-500 focus:!ring-1 focus:!ring-green-500 placeholder:text-slate-500 transition-all" 
                  placeholder="Min 6 characters" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <input type="password" value={form.confirm_password}
                onChange={e => update('confirm_password', e.target.value)}
                className="input-field !bg-slate-900/50 !border-slate-700 !text-white focus:!border-green-500 focus:!ring-1 focus:!ring-green-500 placeholder:text-slate-500 transition-all" 
                placeholder="Repeat password" required />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer mt-2">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-1 accent-green-500 w-4 h-4 rounded border-slate-700 bg-slate-900/50" />
              <span className="text-xs text-slate-400 leading-relaxed">
                I agree to use this app for a greener campus and accept the privacy policy.
              </span>
            </label>

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-green-400 hover:text-green-300 transition-colors">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

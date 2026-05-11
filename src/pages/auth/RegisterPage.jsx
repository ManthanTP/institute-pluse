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
    <div className="min-h-screen px-4 py-10" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
      <div className="w-full max-w-sm mx-auto animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-2xl font-bold text-gray-900">Join InstitutePulse</h1>
          <p className="text-gray-500 text-sm mt-1">Join the Green Campus Movement</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium" style={{ background: '#fee2e2', color: '#991b1b' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)}
                  className="input-field pl-10" placeholder="Your Full Name" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">College Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  className="input-field pl-10" placeholder="student@college.edu" required />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  className="input-field pl-10" placeholder="+91 9999999999" />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
              <div className="relative">
                <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select value={form.department} onChange={e => update('department', e.target.value)}
                  className="input-field pl-10 appearance-none">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
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
                      borderColor: form.role === r.key ? '#16a34a' : '#e2e8f0',
                      background: form.role === r.key ? '#f0fdf4' : 'white',
                    }}
                  >
                    <div className="text-2xl mb-1">{r.emoji}</div>
                    <div className="font-semibold text-sm text-gray-900">{r.label}</div>
                    <div className="text-xs text-gray-500">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => update('password', e.target.value)}
                  className="input-field pl-10 pr-10" placeholder="Min 6 characters" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input type="password" value={form.confirm_password}
                onChange={e => update('confirm_password', e.target.value)}
                className="input-field" placeholder="Repeat password" required />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 accent-green-600" />
              <span className="text-xs text-gray-500">
                I agree to use this app for a greener campus and accept the privacy policy.
              </span>
            </label>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account 🌿'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Already registered?{' '}
              <Link to="/login" className="font-semibold" style={{ color: '#16a34a' }}>Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { fetchProfile } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError

      const profile = await fetchProfile(data.user.id)
      useAuthStore.setState({ user: data.user })

      toast.success('Welcome back! 🌿')

      if (profile?.role === 'admin') navigate('/admin/dashboard')
      else if (profile?.role === 'driver') navigate('/driver/gps')
      else navigate('/dashboard')

    } catch (err) {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-slate-900">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[100px]" style={{ background: '#16a34a' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[100px]" style={{ background: '#0ea5e9' }} />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="spinner spinner-large spinner-green mb-4" />
          <p className="text-green-400 font-bold tracking-wide">Authenticating...</p>
        </div>
      )}

      <div className="w-full max-w-sm animate-fade-in-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="InstitutePulse Logo" className="brand-logo-large mb-2" />
          <h1 className="text-2xl font-bold text-white tracking-tight">InstitutePulse</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back, eco-warrior</p>
        </div>

        {/* Card */}
        <div className="card glass-card p-6 !border-slate-700/50 !bg-slate-800/60">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium border border-red-500/20 bg-red-500/10 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-11 !bg-slate-900/50 !border-slate-700 !text-white focus:!border-green-500 focus:!ring-1 focus:!ring-green-500 transition-all placeholder:text-slate-500"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-green-400 hover:text-green-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-11 pr-11 !bg-slate-900/50 !border-slate-700 !text-white focus:!border-green-500 focus:!ring-1 focus:!ring-green-500 transition-all placeholder:text-slate-500"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label="Toggle password"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              New here?{' '}
              <Link to="/register" className="font-semibold text-green-400 hover:text-green-300 transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-8 opacity-60">
          "Every Action. Every Point. Greener Campus."
        </p>
      </div>
    </div>
  )
}

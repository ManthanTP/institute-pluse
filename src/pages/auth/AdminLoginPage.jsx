import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Key, Mail, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'

const ADMIN_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY || 'admin-secret-2026'
const MAX_ATTEMPTS = 3
const LOCKOUT_SECONDS = 60

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { fetchProfile } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockout, setLockout] = useState(0)

  useEffect(() => {
    let timer
    if (lockout > 0) {
      timer = setInterval(() => {
        setLockout(prev => {
          if (prev <= 1) { clearInterval(timer); setAttempts(0); return 0 }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [lockout])

  async function handleLogin(e) {
    e.preventDefault()
    if (lockout > 0) return
    setError('')

    if (adminKey !== ADMIN_KEY) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= MAX_ATTEMPTS) setLockout(LOCKOUT_SECONDS)
      setError('Authentication failed.')
      return
    }

    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError

      const profile = await fetchProfile(data.user.id)
      if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Access denied.')
      }

      useAuthStore.setState({ user: data.user })
      navigate('/admin/dashboard')
    } catch (err) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= MAX_ATTEMPTS) setLockout(LOCKOUT_SECONDS)
      setError('Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-950">
      {/* Background decoration */}
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[100px]" style={{ background: '#3b82f6' }} />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-10 blur-[100px]" style={{ background: '#8b5cf6' }} />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="spinner spinner-large border-slate-500 border-top-slate-300 mb-4" />
          <p className="text-slate-300 font-bold tracking-wide">Authenticating Admin...</p>
        </div>
      )}

      <div className="w-full max-w-xs animate-fade-in-up relative z-10">
        <div className="text-center mb-6 flex flex-col items-center">
          <img src="/logo.png" alt="InstitutePulse Logo" className="brand-logo mb-2 opacity-80" />
        </div>

        <div className="card glass-card !bg-slate-900/80 !border-slate-800 p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-white mb-1">System Access</h1>
          <p className="text-sm text-slate-400 mb-6">Authorized personnel only</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm border border-red-500/20 bg-red-500/10 text-red-400">
              {error}
              {lockout > 0 && <div className="mt-1 text-xs opacity-80">Try again in {lockout}s</div>}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field pl-9 text-sm !bg-slate-950/50 !border-slate-800 !text-white focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 placeholder:text-slate-600 transition-all" 
                  placeholder="admin@example.com" required
                  disabled={lockout > 0} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-9 pr-9 text-sm !bg-slate-950/50 !border-slate-800 !text-white focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 placeholder:text-slate-600 transition-all" 
                  placeholder="••••••••" required
                  disabled={lockout > 0} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Access Key</label>
              <div className="relative">
                <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showKey ? 'text' : 'password'} value={adminKey}
                  onChange={e => setAdminKey(e.target.value)}
                  className="input-field pl-9 pr-9 text-sm !bg-slate-950/50 !border-slate-800 !text-white focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-500 placeholder:text-slate-600 transition-all" 
                  placeholder="••••••••••••" required
                  disabled={lockout > 0} />
                <button type="button" onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || lockout > 0}
              className="w-full mt-2 py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all hover:bg-slate-700"
              style={{ background: lockout > 0 ? '#334155' : '#1e293b', cursor: lockout > 0 ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Verifying...' : lockout > 0 ? `Locked (${lockout}s)` : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

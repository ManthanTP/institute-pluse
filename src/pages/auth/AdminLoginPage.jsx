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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0f172a' }}>
      <div className="w-full max-w-xs animate-fade-in-up">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-gray-900 mb-1">System Access</h1>
          <p className="text-sm text-gray-400 mb-6">Authorized personnel only</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#991b1b' }}>
              {error}
              {lockout > 0 && <div className="mt-1 text-xs">Try again in {lockout}s</div>}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field pl-9 text-sm" placeholder="admin@example.com" required
                  disabled={lockout > 0} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-9 pr-9 text-sm" placeholder="••••••••" required
                  disabled={lockout > 0} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Access Key</label>
              <div className="relative">
                <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showKey ? 'text' : 'password'} value={adminKey}
                  onChange={e => setAdminKey(e.target.value)}
                  className="input-field pl-9 pr-9 text-sm" placeholder="••••••••••••" required
                  disabled={lockout > 0} />
                <button type="button" onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || lockout > 0}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: lockout > 0 ? '#94a3b8' : '#1e293b', cursor: lockout > 0 ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Verifying...' : lockout > 0 ? `Locked (${lockout}s)` : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

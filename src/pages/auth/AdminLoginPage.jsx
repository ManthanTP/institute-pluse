import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Key, Mail, Lock, ShieldAlert, ArrowRight, Zap, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.png'

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
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockout(LOCKOUT_SECONDS)
        toast.error('System lockout active.')
      }
      setError('Unauthorized access key detected.')
      return
    }

    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError

      const profile = await fetchProfile(data.user.id)
      
      if (!profile || (profile.role !== 'admin' && profile.role !== 'owner')) {
        await supabase.auth.signOut()
        throw new Error('Access denied. Privileged access required.')
      }

      useAuthStore.setState({ user: data.user })
      
      if (profile.role === 'owner') {
        toast.success('Owner Portal Synchronized 🍱')
        navigate('/owner/dashboard')
      } else {
        toast.success('Admin Core Synchronized 🛡️')
        navigate('/12345678/admin/dashboard')
      }
    } catch (err) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= MAX_ATTEMPTS) setLockout(LOCKOUT_SECONDS)
      setError(err.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-red-500/5 blur-[120px] z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] z-0" />

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="relative w-24 h-24">
               <div className="absolute inset-0 border-4 border-red-500/20 rounded-full" />
               <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <ShieldAlert size={32} className="text-red-500 animate-pulse" />
               </div>
            </div>
            <p className="mt-8 text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Scanning Nexus Root</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-sm relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="relative inline-block">
            <img src={logo} alt="Logo" className="w-24 h-24 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)] grayscale opacity-80" />
            <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Nexus Root</h1>
          <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Admin Core Entry • v2.0</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 lg:p-10 shadow-2xl shadow-black/60 relative overflow-hidden"
        >
          {/* Subtle Scanning Line Effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-scan pointer-events-none" />

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black text-center uppercase tracking-widest leading-relaxed"
            >
              <ShieldAlert size={16} className="mx-auto mb-2" />
              {error}
              {lockout > 0 && <div className="mt-2 text-white">System Lockout: {lockout}s</div>}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Secure Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-[22px] py-4.5 pl-14 pr-5 text-sm text-white placeholder:text-gray-700 outline-none focus:border-red-500/30 focus:bg-slate-950/80 transition-all"
                  placeholder="root@pulse.nexus" required
                  disabled={lockout > 0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Registry Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-[22px] py-4.5 pl-14 pr-14 text-sm text-white placeholder:text-gray-700 outline-none focus:border-red-500/30 focus:bg-slate-950/80 transition-all"
                  placeholder="••••••••" required
                  disabled={lockout > 0}
                />
                <button 
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Access Key (2FA)</label>
              <div className="relative group">
                <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type={showKey ? 'text' : 'password'} value={adminKey} onChange={e => setAdminKey(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-[22px] py-4.5 pl-14 pr-14 text-sm text-white placeholder:text-gray-700 outline-none focus:border-red-500/30 focus:bg-slate-950/80 transition-all font-mono tracking-widest"
                  placeholder="KEY-XXXX-XXXX" required
                  disabled={lockout > 0}
                />
                <button 
                  type="button" onClick={() => setShowKey(!showKey)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading || lockout > 0}
              className={`w-full py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-4 ${
                lockout > 0 
                  ? 'bg-slate-900 text-gray-600 cursor-not-allowed border border-white/5' 
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/10'
              }`}
            >
              {lockout > 0 ? `Locked (${lockout}s)` : (
                <>
                  Authenticate <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex items-center justify-center gap-10 text-gray-700"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-red-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Root Guard</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Direct Uplink</span>
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}} />
    </div>
  )
}

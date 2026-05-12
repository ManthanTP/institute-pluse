import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../assets/logo.png'

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

      if (profile?.role === 'admin') navigate('/12345678/admin/dashboard')
      else if (profile?.role === 'faculty') navigate('/faculty/dashboard')
      else navigate('/dashboard')

    } catch (err) {
      if (err.message?.toLowerCase().includes('email not confirmed') || err.message?.toLowerCase().includes('email not verified')) {
        setError('Email not verified. Please check your inbox for the confirmation link.')
      } else {
        setError('Invalid credentials. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-green-500/10 blur-[120px] z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] z-0" />

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
            <p className="mt-6 text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse">Verifying Identity</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-sm relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <img src={logo} alt="Logo" className="w-20 h-20 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]" />
          <h1 className="text-4xl font-black text-white tracking-tighter">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium tracking-tight">Access your eco-dashboard.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl shadow-black/40"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                <input 
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
                  placeholder="name@university.edu" required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Password</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-green-500 uppercase tracking-widest hover:text-green-400 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                <input 
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-12 pr-12 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
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

            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-3"
            >
              Sign In <ArrowRight size={18} />
            </motion.button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 font-medium">
              New to the ecosystem?{' '}
              <Link to="/register" className="text-green-500 font-black hover:text-green-400 transition-colors">Apply Now</Link>
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex items-center justify-center gap-8 text-gray-600"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Secure Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-yellow-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Instant Sync</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

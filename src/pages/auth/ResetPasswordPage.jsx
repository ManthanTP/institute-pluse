import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../assets/logo.png'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Recovery session not detected. Request a new link.')
        navigate('/login')
      } else {
        setSessionChecked(true)
      }
    }
    checkSession()
  }, [navigate])

  async function handleReset(e) {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      
      toast.success('Password updated successfully! Log in now.')
      // Sign out to clean up session
      await supabase.auth.signOut()
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Decrypting Session</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-green-500/10 blur-[120px] z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] z-0" />

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md"
          >
            <div className="relative w-20 h-20">
               <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
               <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-6 text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse">Encrypting Credentials</p>
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
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">New Password</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium tracking-tight">Decrypt and replace your access keys.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl shadow-black/40"
        >
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">New Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                <input 
                  type={showPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-12 pr-12 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
                  placeholder="••••••••" required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                <input 
                  type={showPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
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
              Reset Password <ArrowRight size={18} />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

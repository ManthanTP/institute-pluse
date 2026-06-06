import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, ChevronLeft, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../assets/logo.png'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      setSubmitted(true)
      toast.success('Password reset link sent! Check your inbox.')
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      {/* Back Button */}
      <Link 
        to="/login" 
        className="absolute top-6 left-6 z-20 flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
      >
        <ChevronLeft size={20} />
      </Link>

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
            <p className="mt-6 text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse">Requesting Uplink</p>
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
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Reset Link</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium tracking-tight">Recover access to your credentials.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl shadow-black/40"
        >
          {submitted ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-green-500 mx-auto">
                <Send size={24} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest text-white">Transmission Sent</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                We have transmitted a recovery code link to <span className="text-green-500 font-bold">{email}</span>. Click the link inside the email to finalize password decryption.
              </p>
              <Link
                to="/login"
                className="block w-full py-4.5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-center transition-all active:scale-95 hover:bg-gray-100"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Account Email</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                  <input 
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all"
                    placeholder="name@university.edu" required
                  />
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-3"
              >
                Send Link <ArrowRight size={18} />
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}

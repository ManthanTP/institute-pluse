import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Wifi, WifiOff, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/index'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const goHome = () => {
    if (user) navigate('/dashboard')
    else navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden flex items-center justify-center">
      {/* Aurora mesh background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-red-500/[0.07] blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/[0.06] blur-[120px]" />
        <div className="absolute top-[50%] left-[50%] w-[30%] h-[30%] rounded-full bg-purple-500/[0.05] blur-[100px]" />
      </div>

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />

      {/* Grid pattern */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content */}
      <div className="relative z-20 text-center px-6 max-w-lg mx-auto">
        {/* HUD top corner brackets */}
        <div className="absolute -top-16 -left-8 w-8 h-8 border-l-2 border-t-2 border-red-500/40" />
        <div className="absolute -top-16 -right-8 w-8 h-8 border-r-2 border-t-2 border-red-500/40" />
        
        {/* Glitch 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="relative inline-block mb-8">
            <h1 
              className="text-[120px] sm:text-[160px] font-black tracking-tighter leading-none select-none"
              style={{
                color: 'transparent',
                WebkitTextStroke: '2px rgba(239,68,68,0.4)',
                textShadow: '0 0 40px rgba(239,68,68,0.2)',
                animation: 'glitch404 3s infinite',
              }}
            >
              404
            </h1>
            {/* Glitch layers */}
            <h1 
              className="absolute inset-0 text-[120px] sm:text-[160px] font-black tracking-tighter leading-none select-none pointer-events-none"
              style={{
                color: 'transparent',
                WebkitTextStroke: '1px rgba(0,245,255,0.2)',
                animation: 'glitch404-blue 3s infinite',
              }}
            >
              404
            </h1>
          </div>
        </motion.div>

        {/* Signal status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <WifiOff size={16} className="text-red-500 animate-pulse" />
          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Signal Not Found</span>
          <WifiOff size={16} className="text-red-500 animate-pulse" />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4 italic">
            Lost in the <span className="text-red-500">Ecosystem</span>
          </h2>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed max-w-sm mx-auto mb-10">
            The page you're looking for doesn't exist or has been moved to another sector of the pulse network.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={goHome}
            className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-white/10 hover:scale-105 hover:shadow-2xl transition-all duration-300"
          >
            <Home size={16} />
            Return to Base
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:border-white/20 transition-all duration-300"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </motion.div>

        {/* System info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex items-center justify-center gap-4"
        >
          <Shield size={12} className="text-gray-700" />
          <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em]">
            InstitutePulse Core • Error Protocol Active
          </span>
        </motion.div>

        {/* Bottom HUD corners */}
        <div className="absolute -bottom-16 -left-8 w-8 h-8 border-l-2 border-b-2 border-red-500/40" />
        <div className="absolute -bottom-16 -right-8 w-8 h-8 border-r-2 border-b-2 border-red-500/40" />
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes glitch404 {
          0%, 90%, 100% { transform: translate(0); }
          92% { transform: translate(3px, -2px) skewX(1deg); }
          94% { transform: translate(-3px, 2px) skewX(-1deg); }
          96% { transform: translate(2px, 1px); }
          98% { transform: translate(-2px, -1px) skewX(0.5deg); }
        }
        @keyframes glitch404-blue {
          0%, 88%, 100% { transform: translate(0); }
          90% { transform: translate(-4px, 2px); }
          93% { transform: translate(4px, -2px); }
          96% { transform: translate(-2px, 1px); }
        }
      `}</style>
    </div>
  )
}

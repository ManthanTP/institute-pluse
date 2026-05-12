import { useNavigate } from 'react-router-dom'
import { ArrowRight, Leaf, Shield, Zap, Compass, Sparkles, Globe, Target, Layers, Cpu, Database, Network } from 'lucide-react'
import { motion } from 'framer-motion'
import logo from '../assets/logo.png'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative selection:bg-green-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-green-600/10 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-purple-600/5 blur-[120px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 z-[1] opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* HEADER / NAV */}
      <header className="relative z-50 px-6 py-8 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="InstitutePulse Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
          <span className="text-xl font-black tracking-tighter uppercase">
            Institute<span className="text-green-500">Pulse</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10">
           {['Ecosystem', 'Nexus AI', 'Command', 'Directory'].map(l => (
             <button key={l} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors">{l}</button>
           ))}
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all duration-500"
        >
          Access Portal
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-8"
        >
           <Sparkles size={14} className="text-green-500" />
           <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em]">Next-Gen Campus OS</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-[ -0.04em] leading-[0.9] mb-8"
        >
          THE SMART<br/>
          <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent">ECOSYSTEM.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium leading-relaxed mb-12"
        >
          A unified, high-performance platform designed for the modern campus. 
          Manage resources, track ecological impact, and synchronize your academic life.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
           <button 
             onClick={() => navigate('/register')}
             className="px-12 py-6 rounded-3xl bg-green-600 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-green-500 shadow-2xl shadow-green-600/30 transition-all flex items-center justify-center gap-4 group"
           >
              Initialize Profile <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </button>
           <button className="px-12 py-6 rounded-3xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
              Explore Nexus
           </button>
        </motion.div>

        {/* Floating Stats */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl border-t border-white/5 pt-16">
           {[
             { label: 'Active Nodes', val: '12k+' },
             { label: 'Carbon Offset', val: '450 Tons' },
             { label: 'Response Time', val: '12ms' },
             { label: 'Ecosystem XP', val: '2.4M+' },
           ].map((s, i) => (
             <motion.div 
               key={s.label}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.4 + (i * 0.1) }}
               className="flex flex-col items-center"
             >
                <span className="text-3xl font-black text-white mb-2">{s.val}</span>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">{s.label}</span>
             </motion.div>
           ))}
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Nexus Analytics', desc: 'Real-time telemetry tracking for your ecological footprint.', icon: Cpu, color: 'text-blue-500' },
              { title: 'Smart Directory', desc: 'Centralized identity management and role-based access.', icon: Database, color: 'text-green-500' },
              { title: 'Neural Support', desc: 'AI-driven assistance for academics and campus navigation.', icon: Network, color: 'text-purple-500' },
            ].map((f, i) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-xl group hover:bg-white/10 transition-all duration-500">
                 <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${f.color} mb-8 shadow-inner group-hover:scale-110 transition-transform`}>
                    <f.icon size={24} />
                 </div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4">{f.title}</h3>
                 <p className="text-gray-500 text-sm font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-20 px-6 border-t border-white/5 bg-slate-900/20 backdrop-blur-3xl">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col items-center md:items-start">
               <div className="flex items-center gap-3 mb-4">
                 <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
                 <span className="text-sm font-black tracking-tighter uppercase">InstitutePulse</span>
               </div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">© 2026 Nexus Core. All Rights Reserved.</p>
            </div>
            <div className="flex gap-8">
               {['Documentation', 'Security', 'Privacy', 'Compliance'].map(l => (
                 <button key={l} className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-colors">{l}</button>
               ))}
            </div>
         </div>
      </footer>
    </div>
  )
}

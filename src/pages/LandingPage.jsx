import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Leaf, Shield, Zap, Compass, Sparkles, Globe, Target, Layers, Cpu, Database, Network, ChevronRight, BarChart3, Fingerprint, Activity, Terminal } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import logo from '../assets/logo.png'
import heroImage from '../assets/hero.png'

import { useAuthStore } from '../store/index'

const FEATURE_NODES = [
  { 
    title: 'Nexus Analytics', 
    desc: 'Proprietary telemetry tracking for campus-wide carbon flux and energy efficiency.',
    icon: Activity,
    color: '#22c55e',
    tag: 'Operational'
  },
  { 
    title: 'Smart Identity', 
    desc: 'Biometric-grade security protocols for student and faculty node synchronization.',
    icon: Fingerprint,
    color: '#3b82f6',
    tag: 'Encrypted'
  },
  { 
    title: 'Neural Assistant', 
    desc: 'LLM-powered academic co-pilot integrated directly into your study workflow.',
    icon: Terminal,
    color: '#a855f7',
    tag: 'AI-Core'
  }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  const ecosystemRef = useRef(null)
  const telemetryRef = useRef(null)
  const footerRef = useRef(null)

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getDashboardPath = () => {
    if (profile?.role === 'admin') return '/12345678/admin/dashboard'
    if (profile?.role === 'faculty') return '/faculty/dashboard'
    return '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-green-500/30 font-sans">
      {/* ─── DYNAMIC BACKGROUND ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[70%] h-[70%] rounded-full bg-green-500/10 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[120px]" />
      </div>

      {/* Grid Overlay */}
      <div className="fixed inset-0 z-[1] opacity-30 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 inset-x-0 z-[100] px-6 py-6 transition-all duration-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] px-8 py-4 shadow-2xl">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
              <img src={logo} alt="Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
            </motion.div>
            <span className="text-lg font-black tracking-tighter uppercase hidden sm:block">
              Institute<span className="text-green-500">Pulse</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-12">
            <button onClick={() => scrollTo(ecosystemRef)} className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors">Ecosystem</button>
            <button onClick={() => scrollTo(telemetryRef)} className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors">Telemetry</button>
            <button onClick={() => scrollTo(ecosystemRef)} className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors">Campus AI</button>
            <button onClick={() => scrollTo(footerRef)} className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors">Compliance</button>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => navigate(getDashboardPath())}
                className="px-8 py-3 rounded-2xl bg-green-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-green-500 transition-all duration-500 shadow-xl shadow-green-600/20 flex items-center gap-2"
              >
                Dashboard <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-white px-4"
                >
                  Log In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 rounded-2xl bg-white text-slate-950 text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all duration-500 shadow-xl shadow-white/5"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative z-10 pt-44 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em]">Campus OS v2.4 Active</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-[-0.06em] leading-[0.85] mb-10"
            >
              UNIFY YOUR<br/>
              <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">REALITY.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-gray-400 text-lg md:text-xl max-w-xl font-medium leading-relaxed mb-12 italic"
            >
              The most advanced campus ecosystem ever built. Synchronize your ecological footprint, academic telemetry, and social pulse in one seamless nexus.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <button 
                onClick={() => navigate(user ? getDashboardPath() : '/register')}
                className="group px-12 py-7 rounded-[32px] bg-green-600 text-white font-black text-[11px] uppercase tracking-[0.4em] hover:bg-green-500 shadow-2xl shadow-green-600/30 transition-all flex items-center justify-center gap-4"
              >
                {user ? 'Enter Command Center' : 'Launch Console'} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
              <button 
                onClick={() => scrollTo(ecosystemRef)}
                className="px-12 py-7 rounded-[32px] bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all backdrop-blur-xl"
              >
                Documentation
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-20 flex items-center gap-10 border-t border-white/5 pt-12"
            >
               <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Network Nodes</p>
                  <p className="text-2xl font-black text-white">12,842</p>
               </div>
               <div className="w-[1px] h-10 bg-white/5" />
               <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">CO2 Remediated</p>
                  <p className="text-2xl font-black text-green-500">420.5T</p>
               </div>
               <div className="w-[1px] h-10 bg-white/5" />
               <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">System Uptime</p>
                  <p className="text-2xl font-black text-blue-500">99.9%</p>
               </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 1.2 }}
            className="relative hidden lg:block"
          >
            <div className="absolute -inset-10 bg-green-500/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative rounded-[60px] overflow-hidden border border-white/10 shadow-2xl">
               <img src={heroImage} alt="Cyber Campus" className="w-full h-auto object-cover scale-105 hover:scale-100 transition-transform duration-[3000ms]" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
               
               {/* Overlay HUD Elements */}
               <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                  <div className="glass-card p-4 rounded-2xl border-white/10 backdrop-blur-3xl bg-black/40">
                     <div className="flex items-center gap-3 mb-2">
                        <Activity size={14} className="text-green-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Real-time Flux</span>
                     </div>
                     <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black">1.24</span>
                        <span className="text-[9px] text-gray-500 uppercase">kg/s CO2</span>
                     </div>
                  </div>
                  <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section ref={ecosystemRef} className="relative z-10 py-44 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-24">
            <h2 className="text-[10px] font-black text-green-500 uppercase tracking-[0.5em] mb-6">Core Protocols</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase max-w-2xl leading-none">The pillars of a smarter future.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURE_NODES.map((node, i) => (
              <motion.div 
                key={node.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white/5 border border-white/10 rounded-[48px] p-12 backdrop-blur-xl hover:bg-white/[0.08] transition-all duration-700"
              >
                <div className="absolute top-10 right-10 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white group-hover:border-white/20 transition-all">
                  {node.tag}
                </div>
                
                <div 
                  className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform duration-500"
                  style={{ color: node.color }}
                >
                   <node.icon size={32} />
                </div>
                
                <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{node.title}</h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">{node.desc}</p>
                
                <button 
                  onClick={() => navigate(user ? (node.title.includes('Analytics') ? '/carbon/history' : node.title.includes('Smart') ? '/profile' : '/chatbot') : '/register')}
                  className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3 hover:gap-5 transition-all opacity-0 group-hover:opacity-100"
                >
                  Explore Protocol <ChevronRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ECOSYSTEM PULSE SECTION ─── */}
      <section ref={telemetryRef} className="relative z-10 py-44 px-6 bg-green-600/5 backdrop-blur-sm">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative order-2 lg:order-1">
               <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 className="space-y-8"
               >
                  <div className="glass-card p-10 rounded-[40px] border-white/10 bg-white/5 flex flex-col gap-8 shadow-2xl">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <BarChart3 size={24} className="text-green-500" />
                           <span className="text-[12px] font-black uppercase tracking-widest">Sustainability Matrix</span>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-green-500/10 border border-green-500/20" />
                     </div>
                     
                     <div className="space-y-6">
                        {[
                           { label: 'Campus Reforestation', val: 78, color: '#22c55e' },
                           { label: 'Energy Optimization', val: 92, color: '#3b82f6' },
                           { label: 'Waste Management', val: 64, color: '#a855f7' },
                        ].map(m => (
                           <div key={m.label} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                 <span>{m.label}</span>
                                 <span>{m.val}%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   whileInView={{ width: `${m.val}%` }}
                                   transition={{ duration: 1.5, delay: 0.5 }}
                                   className="h-full rounded-full" 
                                   style={{ backgroundColor: m.color }}
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </motion.div>
            </div>

            <div className="order-1 lg:order-2">
               <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-6">The Living Campus</h2>
               <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] mb-10">Every action has an impact.</h3>
               <p className="text-gray-400 text-lg font-medium leading-relaxed mb-10">
                  Our neural network tracks every transaction, meal, and commute to calculate the collective pulse of our community. Earn Eco-Points for sustainable choices and climb the leaderboard of the future.
               </p>
               <button 
                 onClick={() => navigate('/register')}
                 className="flex items-center gap-4 text-xs font-black text-green-500 uppercase tracking-[0.4em] hover:gap-6 transition-all"
               >
                  Join the Mission <ArrowRight size={16} />
               </button>
            </div>
         </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer ref={footerRef} className="relative z-10 pt-44 pb-20 px-6 border-t border-white/5 bg-[#020617]">
         <div className="max-w-7xl mx-auto flex flex-col gap-24">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
               <div className="col-span-2">
                  <div className="flex items-center gap-4 mb-8">
                     <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
                     <span className="text-2xl font-black tracking-tighter uppercase">InstitutePulse</span>
                  </div>
                  <p className="text-gray-500 text-sm max-w-sm font-medium leading-relaxed">
                     The definitive ecosystem for the modern academic journey. Secure, sustainable, and powered by neural-grade AI.
                  </p>
               </div>
               
               <div className="space-y-6">
                  <p className="text-[11px] font-black text-white uppercase tracking-widest">Nexus Core</p>
                  <ul className="space-y-4 text-sm font-medium text-gray-500">
                     <li><button onClick={() => scrollTo(telemetryRef)} className="hover:text-white transition-colors">Operational Status</button></li>
                     <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Developer Uplink</button></li>
                     <li><button onClick={() => scrollTo(ecosystemRef)} className="hover:text-white transition-colors">Ecosystem Map</button></li>
                  </ul>
               </div>

               <div className="space-y-6">
                  <p className="text-[11px] font-black text-white uppercase tracking-widest">Protocol</p>
                  <ul className="space-y-4 text-sm font-medium text-gray-500">
                     <li><button className="hover:text-white transition-colors">Privacy Shield</button></li>
                     <li><button className="hover:text-white transition-colors">Security Audit</button></li>
                     <li><button className="hover:text-white transition-colors">Compliance</button></li>
                  </ul>
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-10 border-t border-white/5 pt-12">
               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                  © 2026 InstitutePulse Technologies. Powered by Nexus AI.
               </p>
               <div className="flex gap-8">
                  {['X', 'LinkedIn', 'Github', 'Uplink'].map(l => (
                     <button key={l} className="text-[10px] font-black text-gray-600 hover:text-white transition-colors tracking-widest uppercase">{l}</button>
                  ))}
               </div>
            </div>
         </div>
      </footer>
    </div>
  )
}

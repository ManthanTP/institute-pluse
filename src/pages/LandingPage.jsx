import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Leaf, Shield, Zap, Compass, Sparkles, Globe, Target, Layers, Cpu, ChevronRight, BarChart3, Fingerprint, Activity, Terminal, Users, BookOpen, TreePine, Award, QrCode, Bot, MapPin, Menu, X } from 'lucide-react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import logo from '../assets/logo.png'
import heroImage from '../assets/hero.png'
import { useAuthStore } from '../store/index'

const FEATURES = [
  { 
    title: 'Smart Attendance', 
    desc: 'QR-based attendance tracking system with real-time sync. No paper, no hassle.',
    icon: QrCode,
    color: '#22c55e',
    gradient: 'from-green-500/20 to-emerald-500/10'
  },
  { 
    title: 'AI Campus Assistant', 
    desc: 'Powered by Gemini AI — get instant answers about campus, studies, and sustainability.',
    icon: Bot,
    color: '#3b82f6',
    gradient: 'from-blue-500/20 to-cyan-500/10'
  },
  { 
    title: 'Eco Points System', 
    desc: 'Track your carbon footprint, earn points for green choices, climb the leaderboard.',
    icon: TreePine,
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-violet-500/10'
  },
  {
    title: 'Study Planner',
    desc: 'AI-powered study schedules tailored to your subjects and available hours.',
    icon: BookOpen,
    color: '#f59e0b',
    gradient: 'from-yellow-500/20 to-amber-500/10'
  },
  {
    title: 'Campus Navigation',
    desc: 'Find any room, lab, or office instantly with floor-wise building guides.',
    icon: MapPin,
    color: '#ef4444',
    gradient: 'from-red-500/20 to-rose-500/10'
  },
  {
    title: 'Events & Challenges',
    desc: 'Discover campus events, join green challenges, and earn recognition badges.',
    icon: Award,
    color: '#06b6d4',
    gradient: 'from-cyan-500/20 to-teal-500/10'
  },
]

const STATS = [
  { label: 'Active Users', value: '2,400+', icon: Users },
  { label: 'CO₂ Tracked', value: '420 T', icon: TreePine },
  { label: 'Events Hosted', value: '150+', icon: Award },
  { label: 'Uptime', value: '99.9%', icon: Activity },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const [mobileMenu, setMobileMenu] = useState(false)

  const featuresRef = useRef(null)
  const statsRef = useRef(null)
  const footerRef = useRef(null)

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenu(false)
  }

  const getDashboardPath = () => {
    if (profile?.role === 'admin') return '/12345678/admin/dashboard'
    if (profile?.role === 'faculty') return '/faculty/dashboard'
    if (profile?.role === 'owner') return '/owner/dashboard'
    return '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-green-500/30 font-sans overflow-x-hidden">
      {/* ─── DYNAMIC BACKGROUND ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-green-500/8 blur-[180px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-blue-600/8 blur-[180px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[150px]" />
      </div>

      {/* Grid Overlay */}
      <div className="fixed inset-0 z-[1] opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 inset-x-0 z-[100] px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[28px] px-4 md:px-6 py-3 shadow-2xl">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
              <img src={logo} alt="Logo" className="w-7 h-7 md:w-8 md:h-8 object-contain drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]" />
            </motion.div>
            <span className="text-base md:text-lg font-black tracking-tighter uppercase">
              Institute<span className="text-green-500">Pulse</span>
            </span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <button onClick={() => scrollTo(featuresRef)} className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollTo(statsRef)} className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 hover:text-white transition-colors">Impact</button>
            <button onClick={() => scrollTo(footerRef)} className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 hover:text-white transition-colors">About</button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button 
                onClick={() => navigate(getDashboardPath())}
                className="px-5 md:px-7 py-2.5 rounded-xl md:rounded-2xl bg-green-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg shadow-green-600/20 flex items-center gap-2"
              >
                Dashboard <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="hidden sm:block text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-white px-3"
                >
                  Log In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-5 md:px-7 py-2.5 rounded-xl md:rounded-2xl bg-white text-slate-950 text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-lg"
                >
                  Sign Up
                </button>
              </>
            )}
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenu(!mobileMenu)} 
              className="lg:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"
            >
              {mobileMenu ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mt-2 bg-[#0d1117]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-1"
            >
              <button onClick={() => scrollTo(featuresRef)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all">Features</button>
              <button onClick={() => scrollTo(statsRef)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all">Impact</button>
              <button onClick={() => scrollTo(footerRef)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all">About</button>
              {!user && (
                <button onClick={() => { navigate('/login'); setMobileMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all sm:hidden">Log In</button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative z-10 pt-28 md:pt-36 lg:pt-44 pb-16 md:pb-24 px-5 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-6 md:mb-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              <span className="text-[9px] font-black text-green-500 uppercase tracking-[0.3em]">Live • v2.4</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="text-[42px] md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-[-0.04em] leading-[0.9] mb-6 md:mb-8"
            >
              YOUR CAMPUS.<br/>
              <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">SMARTER.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-gray-400 text-base md:text-lg max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed mb-8 md:mb-10"
            >
              The all-in-one campus platform. Track your carbon footprint, manage attendance via QR, get AI-powered study help, and make your college life sustainable.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button 
                onClick={() => navigate(user ? getDashboardPath() : '/register')}
                className="group px-8 md:px-10 py-5 rounded-2xl bg-green-600 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-green-500 shadow-2xl shadow-green-600/25 transition-all flex items-center justify-center gap-3"
              >
                {user ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => scrollTo(featuresRef)}
                className="px-8 md:px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all backdrop-blur-xl"
              >
                Explore Features
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="relative hidden lg:block"
          >
            <div className="absolute -inset-10 bg-green-500/15 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
               <img src={heroImage} alt="InstitutePulse Platform" className="w-full h-auto object-cover scale-105 hover:scale-100 transition-transform duration-[2000ms]" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
               
               {/* Floating Cards */}
               <motion.div 
                 animate={{ y: [0, -8, 0] }}
                 transition={{ duration: 3, repeat: Infinity }}
                 className="absolute bottom-8 left-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
               >
                  <div className="flex items-center gap-2.5 mb-1.5">
                     <Activity size={12} className="text-green-500" />
                     <span className="text-[8px] font-black uppercase tracking-widest">Live Eco Score</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                     <span className="text-xl font-black text-green-500">87</span>
                     <span className="text-[8px] text-gray-500 uppercase">/100</span>
                  </div>
               </motion.div>

               <motion.div 
                 animate={{ y: [0, 8, 0] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="absolute top-8 right-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
               >
                  <div className="flex items-center gap-2.5 mb-1.5">
                     <Users size={12} className="text-blue-500" />
                     <span className="text-[8px] font-black uppercase tracking-widest">Online Now</span>
                  </div>
                  <span className="text-lg font-black text-blue-500">142</span>
               </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:hidden mt-10 relative"
        >
          <div className="absolute -inset-6 bg-green-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img src={heroImage} alt="InstitutePulse" className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="relative z-10 py-8 md:py-12 px-5 md:px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center py-4"
            >
              <stat.icon size={20} className="text-green-500 mx-auto mb-2 opacity-60" />
              <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section ref={featuresRef} className="relative z-10 py-16 md:py-24 px-5 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-[9px] font-black text-green-500 uppercase tracking-[0.4em] mb-4">Everything You Need</h2>
            <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase max-w-2xl mx-auto leading-[0.95]">One platform for your entire campus life.</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div 
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl md:rounded-3xl p-6 md:p-8 backdrop-blur-xl hover:bg-white/[0.06] transition-all duration-500"
              >
                <div 
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 border border-white/5`}
                  style={{ color: feat.color }}
                >
                   <feat.icon size={24} />
                </div>
                
                <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">{feat.title}</h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SUSTAINABILITY PULSE ─── */}
      <section ref={statsRef} className="relative z-10 py-16 md:py-24 px-5 md:px-6 bg-green-600/[0.03]">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="bg-white/[0.03] border border-white/[0.06] rounded-2xl md:rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6"
               >
                  <div className="flex items-center gap-3">
                     <BarChart3 size={20} className="text-green-500" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sustainability Dashboard</span>
                  </div>
                  
                  {[
                     { label: 'Transport Optimization', val: 78, color: '#22c55e' },
                     { label: 'Energy Efficiency', val: 92, color: '#3b82f6' },
                     { label: 'Waste Reduction', val: 64, color: '#a855f7' },
                     { label: 'Green Participation', val: 85, color: '#f59e0b' },
                  ].map(m => (
                     <div key={m.label} className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
                           <span>{m.label}</span>
                           <span>{m.val}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             whileInView={{ width: `${m.val}%` }}
                             viewport={{ once: true }}
                             transition={{ duration: 1.2, delay: 0.3 }}
                             className="h-full rounded-full" 
                             style={{ backgroundColor: m.color }}
                           />
                        </div>
                     </div>
                  ))}
               </motion.div>
            </div>

            <div className="order-1 lg:order-2 text-center lg:text-left">
               <h2 className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Make An Impact</h2>
               <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-[0.95] mb-6">Every action counts.</h3>
               <p className="text-gray-400 text-base font-medium leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                  Log your daily commute, meals, and energy usage. Watch your eco-score grow. Compete with peers on the leaderboard. Together, we build a greener campus.
               </p>
               <button 
                 onClick={() => navigate('/register')}
                 className="inline-flex items-center gap-3 text-sm font-black text-green-500 uppercase tracking-[0.3em] hover:gap-5 transition-all"
               >
                  Start Your Journey <ArrowRight size={16} />
               </button>
            </div>
         </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="relative z-10 py-16 md:py-24 px-5 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-green-600/10 to-blue-600/10 border border-white/10 rounded-3xl p-8 md:p-14 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />
            <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase mb-4 relative z-10">Ready to go green?</h3>
            <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-8 relative z-10">Join thousands of students and faculty making their campus sustainable, one action at a time.</p>
            <button 
              onClick={() => navigate(user ? getDashboardPath() : '/register')}
              className="px-10 py-5 rounded-2xl bg-green-600 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-green-500 shadow-2xl shadow-green-600/25 transition-all relative z-10"
            >
              {user ? 'Open Dashboard' : 'Create Free Account'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer ref={footerRef} className="relative z-10 pt-12 md:pt-16 pb-8 px-5 md:px-6 border-t border-white/5">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
               <div className="col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                     <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                     <span className="text-lg font-black tracking-tighter uppercase">InstitutePulse</span>
                  </div>
                  <p className="text-gray-500 text-sm max-w-sm font-medium leading-relaxed">
                     The complete campus ecosystem for modern education. Sustainable, intelligent, and built for everyone.
                  </p>
               </div>
               
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Platform</p>
                  <ul className="space-y-3 text-sm font-medium text-gray-500">
                     <li><button onClick={() => scrollTo(featuresRef)} className="hover:text-white transition-colors">Features</button></li>
                     <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Get Started</button></li>
                     <li><button onClick={() => scrollTo(statsRef)} className="hover:text-white transition-colors">Sustainability</button></li>
                  </ul>
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Support</p>
                  <ul className="space-y-3 text-sm font-medium text-gray-500">
                     <li><button className="hover:text-white transition-colors">Privacy</button></li>
                     <li><button className="hover:text-white transition-colors">Terms</button></li>
                     <li><button className="hover:text-white transition-colors">Contact</button></li>
                  </ul>
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6">
               <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                  © 2026 InstitutePulse. Built for Jain College of Engineering.
               </p>
               <div className="flex gap-6">
                  {['GitHub', 'LinkedIn'].map(l => (
                     <button key={l} className="text-[9px] font-black text-gray-600 hover:text-white transition-colors tracking-widest uppercase">{l}</button>
                  ))}
               </div>
            </div>
         </div>
      </footer>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Bus, UtensilsCrossed, GraduationCap, Map, Search, Bot, BookOpen, Award, TrendingUp, Zap, Shield } from 'lucide-react'

const FEATURES = [
  { icon: '🌱', title: 'Carbon Tracker', desc: 'Track daily CO2 across 5 categories', color: '#f0fdf4', iconBg: '#16a34a' },
  { icon: '🚌', title: 'Bus Tracking', desc: 'Live GPS tracking of campus buses', color: '#eff6ff', iconBg: '#0ea5e9' },
  { icon: '🍽️', title: 'Cafeteria', desc: 'Order food with eco-impact shown', color: '#fef3c7', iconBg: '#f59e0b' },
  { icon: '🎓', title: 'Attendance', desc: 'QR-based paperless attendance', color: '#fdf4ff', iconBg: '#a855f7' },
  { icon: '📅', title: 'Study Planner', desc: 'AI-powered study schedules', color: '#f0fdfa', iconBg: '#14b8a6' },
  { icon: '📍', title: 'Navigation', desc: 'Smart campus wayfinding', color: '#fff7ed', iconBg: '#f97316' },
  { icon: '🔍', title: 'Lost & Found', desc: 'Community item recovery system', color: '#f8fafc', iconBg: '#64748b' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Gemini-powered campus chatbot', color: '#fef2f2', iconBg: '#ef4444' },
]

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0
          const step = target / (duration / 16)
          const timer = setInterval(() => {
            start += step
            if (start >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
          observer.disconnect()
          return () => clearInterval(timer)
        }
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

function EcoRingDemo() {
  const [score, setScore] = useState(0)
  const target = 87
  const size = 160
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    let current = 0
    const timer = setInterval(() => {
      current += 1
      setScore(current)
      if (current >= target) clearInterval(timer)
    }, 25)
    return () => clearInterval(timer)
  }, [])

  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="hero-ring-wrapper">
      <div className="ring-pulse" />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} />
        <circle
          className="eco-ring"
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="white" strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
        <text x={size/2} y={size/2 - 6} textAnchor="middle" dominantBaseline="middle" fontSize="36" fontWeight="800" fill="white" fontFamily="Inter">
          {score}
        </text>
        <text x={size/2} y={size/2 + 16} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="600" fill="rgba(255,255,255,0.7)" fontFamily="Inter">
          Eco Score
        </text>
      </svg>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc', overflowX: 'hidden' }}>
      {/* NAVBAR */}
      <nav style={{ background: '#0f172a', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="InstitutePulse Logo" className="brand-logo" />
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">How It Works</a>
            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="btn-primary py-2 px-4 text-sm">
              Get Started
            </button>
          </div>
          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className="flex flex-col gap-1.5">
              <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-3 animate-fade-in" style={{ background: '#0f172a' }}>
            <a href="#features" className="text-gray-300 text-sm py-2" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-gray-300 text-sm py-2" onClick={() => setMenuOpen(false)}>How It Works</a>
            <button onClick={() => navigate('/login')} className="btn-ghost py-3 w-full">Login</button>
            <button onClick={() => navigate('/register')} className="btn-primary py-3 w-full">Get Started</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="gradient-eco relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)'
        }} />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left animate-fade-in-up">
            <div className="badge-chip mb-4 inline-flex" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              🏆 Smart Campus Platform
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
              Every Campus Action<br />
              <span style={{ color: '#bbf7d0' }}>Has a Carbon Footprint.</span>
            </h1>
            <p className="text-lg text-green-100 mb-8 max-w-lg">
              Track it. Reduce it. Earn rewards. All from one app. Join thousands of students building a greener campus.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button onClick={() => navigate('/register')} className="btn-primary text-base py-4 px-8 w-full sm:w-auto" style={{ background: 'white', color: '#166534' }}>
                Start Tracking 🌿
              </button>
              <button onClick={() => { document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' }) }} className="btn-ghost py-4 px-8 w-full sm:w-auto" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
                See How It Works
              </button>
            </div>
          </div>
          <div className="animate-fade-in-up stagger-2">
            <EcoRingDemo />
          </div>
        </div>
      </section>

      {/* LIVE STATS TICKER */}
      <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-green-800 font-medium">
            <span>🌍 Today: <strong><AnimatedCounter target={847} />+ kg CO2 logged</strong></span>
            <span>🏆 Top Score: <strong>96/100</strong></span>
            <span>🚌 <strong><AnimatedCounter target={42} /> bus rides</strong> taken today</span>
            <span>🌱 <strong><AnimatedCounter target={1240} />+ eco-points</strong> earned</span>
          </div>
        </div>
      </div>

      {/* FEATURES GRID */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Everything Your Campus Needs</h2>
          <p className="text-gray-500 max-w-xl mx-auto">One platform connecting sustainability, campus services, and academic tools.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="card p-4 cursor-pointer animate-fade-in-up hover:scale-105 transition-transform"
              style={{ animationDelay: `${i * 0.07}s`, background: f.color }}
              onClick={() => navigate('/register')}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: f.iconBg }}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16" style={{ background: 'white' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500">Get started in minutes and start your sustainability journey</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            {[
              { num: '1', title: 'Register', desc: 'Sign up with your college email in under 2 minutes', icon: '📝' },
              { num: '2', title: 'Log Daily', desc: 'Track your transport, food, energy, water & waste activities', icon: '🌱' },
              { num: '3', title: 'Earn & Compete', desc: 'Get eco-points, earn badges, climb the leaderboard', icon: '🏆' },
            ].map((step, i) => (
              <div key={step.num} className="flex-1 text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="w-16 h-16 rounded-full gradient-eco flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 text-3xl">
                  {step.icon}
                </div>
                <div className="badge-chip mx-auto mb-2">Step {step.num}</div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARBON IMPACT COUNTER */}
      <section className="gradient-eco py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-white">
            <p className="text-lg font-medium mb-2 text-green-100">Our campus has collectively saved</p>
            <div className="text-5xl md:text-7xl font-black mb-2">
              <AnimatedCounter target={2847} duration={3000} /> kg
            </div>
            <p className="text-xl font-semibold text-green-100 mb-8">CO2 this semester 🌍</p>
            <button onClick={() => navigate('/register')} className="btn-primary text-lg py-4 px-10" style={{ background: 'white', color: '#166534' }}>
              Join 1,200+ Students — It's Free 🌿
            </button>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: <Shield size={24} />, title: '100% Secure', desc: 'RLS-protected data' },
              { icon: <Zap size={24} />, title: 'Real-time', desc: 'Live bus & order tracking' },
              { icon: <Award size={24} />, title: 'Gamified', desc: '16 unique eco-badges' },
              { icon: <TrendingUp size={24} />, title: 'Analytics', desc: 'AI-powered insights' },
            ].map((item, i) => (
              <div key={item.title} className="card p-4">
                <div className="text-green-600 mx-auto mb-2 flex justify-center">{item.icon}</div>
                <div className="font-semibold text-sm text-gray-900">{item.title}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', color: '#94a3b8' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 opacity-80">
              <img src="/logo.png" alt="InstitutePulse Logo" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-sm text-center">"Every Action. Every Point. Greener Campus." — Built for a greener tomorrow.</p>
            <p className="text-sm">© 2026 InstitutePulse</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

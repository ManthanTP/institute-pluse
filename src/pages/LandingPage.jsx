import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Leaf, Shield, Zap, Compass, Sparkles, Globe, Target, Layers, Cpu, ChevronRight, BarChart3, Fingerprint, Activity, Terminal, Users, BookOpen, TreePine, Award, QrCode, Bot, MapPin, Menu, X, Trophy, CheckCircle, ArrowUpRight, Lock, Play, Pause, RotateCcw, Utensils, MessageSquare, Bell, UserPlus, TrendingUp, Medal, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/logo.png'
import heroImage from '../assets/hero-campus.png'
import { useAuthStore } from '../store/index'
import AboutCreator from '../components/landing/AboutCreator'
import { supabase } from '../lib/supabase'
import { useLandingContent } from '../hooks/useLandingContent'

// Feature detail data for modal popups
const FEATURE_DETAILS = [
  { title: 'Smart Attendance', icon: QrCode, color: '#22c55e', gradient: 'from-green-500/20 to-emerald-500/5', bullets: ['Time-restricted QR codes for fraud prevention', 'Auto-syncs with your class timetable', 'Real-time attendance analytics for faculty', 'Location verification for campus validation'] },
  { title: 'Green Campus', icon: Target, color: '#8b5cf6', gradient: 'from-purple-500/20 to-violet-500/5', bullets: ['Log daily transport, meals & energy usage', 'Campus Green Score & Green Status levels', 'Earn leaderboard points for green choices', 'Fitted non-scrollable mobile locked overlays'] },
  { title: 'Study Planner', icon: BookOpen, color: '#f59e0b', gradient: 'from-yellow-500/20 to-amber-500/5', bullets: ['Study timer with subject tracking', 'Custom study alarms & scheduling', 'Subject-wise revision partitioning', 'Peer coordination and group study logs'] },
  { title: 'Floor Maps', icon: MapPin, color: '#ef4444', gradient: 'from-red-500/20 to-rose-500/5', bullets: ['Interactive multi-floor building navigation', 'Filter by labs, classrooms, and offices', 'Real-time room availability status', 'Fastest route pathfinding between blocks'] },
  { title: 'Events', icon: Award, color: '#06b6d4', gradient: 'from-cyan-500/20 to-sky-500/5', bullets: ['Join campus-wide eco campaigns', 'Earn achievement badges and certificates', 'One-Click Faculty Awarding & confirmation', 'Individual & Team participation support'] },
  { title: 'Smart Cafeteria', icon: Utensils, color: '#f97316', gradient: 'from-orange-500/20 to-amber-500/5', bullets: ['Browse full digital menu with prices', 'Pre-order meals to skip the queue', 'Nutritional info & calorie tracking', 'Real-time item availability updates'] },
  { title: 'Green Analytics', icon: BarChart3, color: '#22c55e', gradient: 'from-green-500/20 to-teal-500/5', bullets: ['Interactive Campus Green Score progression charts', 'Custom week, month, and year filter selectors', 'Export branded PDF dossiers matching your filter window', 'Real-time campus sustainability statistics'] },
  { title: 'Leaderboards', icon: Trophy, color: '#f59e0b', gradient: 'from-yellow-500/20 to-orange-500/5', bullets: ['Real-time XP-based ranking system', 'Weekly and all-time leaderboard views', 'Department and class-level competitions', 'Green badge tier system with rewards'] },
  { title: 'Grievance Hub', icon: MessageSquare, color: '#ef4444', gradient: 'from-red-500/20 to-pink-500/5', bullets: ['Submit complaints with category tagging', 'Track resolution status in real-time', 'Priority escalation for urgent issues', 'Admin response notifications'] },
  { title: 'Lost & Found', icon: Compass, color: '#06b6d4', gradient: 'from-cyan-500/20 to-teal-500/5', bullets: ['Report lost items with descriptions', 'Browse found items catalog with photos', 'Automated matching notifications', 'Claim verification system'] },
  { title: 'Announcements', icon: Bell, color: '#8b5cf6', gradient: 'from-purple-500/20 to-indigo-500/5', bullets: ['Instant admin broadcast notifications', 'Timetable change alerts', 'Category-filtered notice board', 'Push notifications for critical updates'] },
]

// Custom animated counter component
function Counter({ value, duration = 1200 }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const stringVal = String(value)
    const numPart = parseInt(stringVal.replace(/[^0-9.]/g, ''), 10)
    if (isNaN(numPart)) {
      setCount(value)
      return
    }
    
    let start = 0
    const end = numPart
    const range = end - start
    const startTime = performance.now()
    let frameId
    
    const update = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = progress * (2 - progress) // Ease out quad
      const current = stringVal.includes('.') 
        ? (start + range * eased).toFixed(1)
        : Math.floor(start + range * eased)
      
      setCount(current)
      
      if (progress < 1) {
        frameId = requestAnimationFrame(update)
      } else {
        setCount(numPart)
      }
    }
    
    frameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameId)
  }, [value, duration])

  const formatValue = (num) => {
    if (typeof num === 'string') return num
    const stringVal = String(value)
    if (stringVal.includes(',')) {
      return num.toLocaleString() + (stringVal.includes('+') ? '+' : '')
    }
    return num + (
      stringVal.includes('%') ? '%' : 
      stringVal.includes('T') ? ' T' : 
      stringVal.includes('kg') ? ' kg' : 
      stringVal.includes('XP') ? ' XP' :
      stringVal.includes('+') ? '+' : ''
    )
  }

  return <span>{formatValue(count)}</span>
}

function StatItem({ label, value, icon: Icon, color, index }) {
  const [startCount, setStartCount] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onViewportEnter={() => setStartCount(true)}
      whileHover={{ y: -5 }}
      className="group relative py-6 px-4 text-center rounded-2xl bg-white/[0.01] border border-white/[0.04] backdrop-blur-xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300"
    >
      <div 
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${color}30, transparent)` }}
      />
      <Icon 
        size={22} 
        className="mx-auto mb-2.5 opacity-55 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300" 
        style={{ color: color }}
      />
      <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
        {startCount ? <Counter value={value} /> : '0'}
      </p>
      <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1 group-hover:text-gray-400 transition-colors">
        {label}
      </p>
    </motion.div>
  )
}


export default function LandingPage() {
  const navigate = useNavigate()
  const { user, profile, loading, initialized } = useAuthStore()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState('CAMPUS')
  const [featureModal, setFeatureModal] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-redirect logged-in users to their dashboard (fixes APK session persistence)
  useEffect(() => {
    if (initialized && !loading && user && profile) {
      if (profile.role === 'admin') navigate('/12345678/admin/dashboard', { replace: true })
      else if (profile.role === 'faculty') navigate('/faculty/dashboard', { replace: true })
      else if (profile.role === 'owner') navigate('/owner/dashboard', { replace: true })
      else navigate('/dashboard', { replace: true })
    }
  }, [initialized, loading, user, profile, navigate])

  // Dynamic landing page content from Supabase
  const { content: cms } = useLandingContent()
  const hero = cms?.hero || {}
  const rawFeaturesContent = cms?.features || {}
  const featuresContent = {
    ...rawFeaturesContent,
    cards: rawFeaturesContent.cards?.map((card, idx) => {
      if (idx === 1 && (card.title === 'Eco Track' || card.title === 'Eco Tracker')) {
        return {
          ...card,
          title: 'Green Campus',
          description: 'Log daily choices, track Campus Green Score levels, and earn leaderboard points to climb the campus sustainability scoreboards.',
          bullets: ['Log daily transport, meals & energy usage', 'Campus Green Score & Green Status levels', 'Earn leaderboard points for green choices', 'Track weekly/monthly sustainability trends']
        }
      }
      if (idx === 6 && (card.title === 'Carbon Analytics' || card.title === 'Carbon Footprint')) {
        return {
          ...card,
          title: 'Green Analytics',
          description: 'Visualize dynamic Campus Green Score progression charts and sustainability trends by transport, food, energy, and waste categories.',
          bullets: ['Interactive Campus Green Score progression charts', 'Active transit, vegan meals & energy efficiency logs', 'Monthly department-level green comparison reports', 'Real-time campus sustainability statistics']
        }
      }
      return card
    })
  }
  const impactContent = cms?.impact || {}
  const techContent = cms?.tech_stack || {}
  const milestonesContent = cms?.milestones || {}
  const rawFaqContent = cms?.faq || {}
  const faqContent = {
    ...rawFaqContent,
    items: rawFaqContent.items?.map(item => {
      const isPointsQuestion = item.question === 'What are Eco Points and how are they calculated?' || item.q === 'What are Eco Points and how are they calculated?'
      if (isPointsQuestion) {
        return {
          ...item,
          question: 'What are Eco Points and how are they calculated?',
          q: 'What are Eco Points and how are they calculated?',
          answer: 'Eco Points are rewarded for sustainable campus actions. Points include: Base Logging (+10 XP), Eco Score tier bonuses (+20/40/60 XP), Active Transit (+15 XP walking/cycling, +12 XP college bus), Canteen vegetarian/vegan selections (+10/15 XP), consistent logging streaks (+30 XP for 3 days, +75 XP for 7 days, +200 XP for 30 days), and a first log bonus (+50 XP).',
          a: 'Eco Points are rewarded for sustainable campus actions. Points include: Base Logging (+10 XP), Eco Score tier bonuses (+20/40/60 XP), Active Transit (+15 XP walking/cycling, +12 XP college bus), Canteen vegetarian/vegan selections (+10/15 XP), consistent logging streaks (+30 XP for 3 days, +75 XP for 7 days, +200 XP for 30 days), and a first log bonus (+50 XP).'
        }
      }
      return item
    })
  }
  const ctaContent = cms?.cta || {}
  const footerContent = cms?.footer || {}
  const creatorContent = cms?.creator || {}
  
  // Client-side mapping to guarantee the new credentials show up even if the database has old rows
  if (creatorContent.stats && (creatorContent.stats.some(s => s.label === 'React & Next.js' || s.label === 'Supabase Cloud' || s.label === 'Full Stack' || s.label === 'Backend / RLS' || s.label === 'Agentic AI' || s.label === 'AI Architectures' || s.label === 'Eco-Software' || s.label === 'Powered Systems' || s.label === 'Campus Solutions') || creatorContent.stats.length < 4)) {
    creatorContent.stats = [
      { value: "20+", label: "Projects", icon: "Code2", color: "#00f5ff", link: "https://manthantp-portfolio.vercel.app/#projects" },
      { value: "15+", label: "Skills", icon: "Cpu", color: "#8b5cf6", link: "https://manthantp-portfolio.vercel.app/" },
      { value: "10+", label: "Blogs", icon: "BookOpen", color: "#00f5ff", link: "https://manthantp-portfolio.vercel.app/" },
      { value: "12+", label: "Achievement Unlocks", icon: "Trophy", color: "#8b5cf6", link: "https://manthantp-portfolio.vercel.app/" }
    ]
  }
  const privacyContent = cms?.privacy || {}
  const termsContent = cms?.terms || {}

  // Live Database Stats State
  const [liveStats, setLiveStats] = useState({
    activeUsers: '0',
    co2Tracked: '0 kg',
    eventsHosted: '0',
    ecoPoints: '0 XP'
  })
  const [leaderboard, setLeaderboard] = useState([])
  const [userImpact, setUserImpact] = useState(null)
  const [campusAverages, setCampusAverages] = useState({
    transport: 74,
    energy: 82,
    waste: 68,
    green: 85
  })

  // Interactive Hero Dashboard Mockup States
  const [mockupTab, setMockupTab] = useState('overview')
  const [mockupSeconds, setMockupSeconds] = useState(1500)
  const [mockupTimerActive, setMockupTimerActive] = useState(false)
  const [mockupSubject, setMockupSubject] = useState('Software Eng')
  const [mockupLeaderboardBonus, setMockupLeaderboardBonus] = useState(0)
  const [mockupEcoSuccess, setMockupEcoSuccess] = useState(false)
  const [mockupSecurityScanning, setMockupSecurityScanning] = useState(false)
  const [mockupSecurityAuth, setMockupSecurityAuth] = useState(false)

  // Support Footer Modal States
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  // Timer countdown hook for focus session mockup
  useEffect(() => {
    let interval
    if (mockupTimerActive && mockupSeconds > 0) {
      interval = setInterval(() => {
        setMockupSeconds(prev => prev - 1)
      }, 1000)
    } else if (mockupSeconds === 0) {
      setMockupTimerActive(false)
    }
    return () => clearInterval(interval)
  }, [mockupTimerActive, mockupSeconds])

  const formatMockupTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const featuresRef = useRef(null)
  const statsRef = useRef(null)
  const techRef = useRef(null)
  const milestonesRef = useRef(null)
  const faqRef = useRef(null)
  const footerRef = useRef(null)
  const creatorRef = useRef(null)

  // Scroll listener for navbar frosted glass morphs
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch Live Database Stats
  useEffect(() => {
    async function fetchLiveStats() {
      try {
        // 1. Get real active users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })

        // 2. Query profiles for total CO2 and total Eco Points
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('total_co2_kg, eco_points')

        const totalCo2 = profilesData?.reduce((sum, p) => sum + (Number(p.total_co2_kg) || 0), 0) || 0
        const totalPoints = profilesData?.reduce((sum, p) => sum + (Number(p.eco_points) || 0), 0) || 0
        
        const co2String = totalCo2 >= 1000 
          ? `${(totalCo2 / 1000).toFixed(1)} T` 
          : `${Math.round(totalCo2)} kg`

        // 3. Get real active events count
        const { count: eventsCount } = await supabase
          .from('events')
          .select('id', { count: 'exact', head: true })

        // 4. Count commutes (transport logs)
        const { count: commutesCount } = await supabase
          .from('carbon_logs')
          .select('id', { count: 'exact', head: true })

        // 5. Count available menu items
        const { count: menuCount } = await supabase
          .from('menu_items')
          .select('id', { count: 'exact', head: true })
          .eq('available', true)

        setLiveStats({
          activeUsers: String(usersCount || 0),
          co2Tracked: co2String,
          eventsHosted: String(eventsCount || 0),
          ecoPoints: `${totalPoints} XP`
        })



        // 6. Fetch Campus Averages from carbon_logs
        const { data: logs } = await supabase
          .from('carbon_logs')
          .select('transport_kg, electricity_kg, waste_kg, eco_score')
        
        if (logs && logs.length > 0) {
          const count = logs.length
          const totalTransport = logs.reduce((sum, l) => sum + (Number(l.transport_kg) || 0), 0)
          const totalElectricity = logs.reduce((sum, l) => sum + (Number(l.electricity_kg) || 0), 0)
          const totalWaste = logs.reduce((sum, l) => sum + (Number(l.waste_kg) || 0), 0)
          const totalEco = logs.reduce((sum, l) => sum + (Number(l.eco_score) || 0), 0)

          setCampusAverages({
            transport: Math.min(Math.round((totalTransport / count) * 20), 100) || 65,
            energy: Math.min(Math.round((totalElectricity / count) * 25), 100) || 75,
            waste: Math.min(Math.round((totalWaste / count) * 30), 100) || 60,
            green: Math.round(totalEco / count) || 70
          })
        }
      } catch (err) {
        console.error('Error fetching live stats:', err)
      }
    }

    async function fetchLeaderboard() {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, department, eco_points, role, sustainability_restricted')
          .eq('role', 'student')
          .or('sustainability_restricted.is.null,sustainability_restricted.eq.false')
          .order('eco_points', { ascending: false })
          .limit(3)

        if (data) {
          setLeaderboard(data)
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
      }
    }

    fetchLiveStats()
    fetchLeaderboard()
  }, [])

  // Fetch Logged-in User's Impact
  useEffect(() => {
    if (!profile?.id) {
      setUserImpact(null)
      return
    }

    async function fetchUserImpact() {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('eco_points, total_co2_kg')
          .eq('id', profile.id)
          .single()

        const { data: logs } = await supabase
          .from('carbon_logs')
          .select('transport_kg, food_kg, electricity_kg, waste_kg')
          .eq('student_id', profile.id)
          .order('log_date', { ascending: false })
          .limit(1)

        if (prof) {
          setUserImpact({
            ecoPoints: prof.eco_points || 0,
            totalCo2: prof.total_co2_kg || 0,
            lastLog: logs?.[0] || null
          })
        }
      } catch (err) {
        console.error('Error fetching user impact:', err)
      }
    }

    fetchUserImpact()
  }, [profile?.id])

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

  const handleFeatureClick = (index) => {
    if (profile?.role === 'student') {
      const paths = {
        0: '/attendance',
        1: '/carbon/log',
        2: '/study-planner',
        3: '/navigation',
        4: '/events',
        5: '/cafeteria',
        6: '/carbon/history',
        7: '/leaderboard',
        8: '/complaints',
        9: '/lost-found',
        10: '/announcements'
      }
      const path = paths[index]
      if (path) {
        navigate(path)
        return
      }
    }
    setFeatureModal(index)
  }

  // Redesigned stats bar configurations
  const STATS_ITEMS = [
    { label: 'Active Users', value: liveStats.activeUsers, icon: Users, color: '#22c55e' },
    { label: 'CO₂ Saved', value: liveStats.co2Tracked, icon: Leaf, color: '#00f5ff' },
    { label: 'Active Events', value: liveStats.eventsHosted, icon: Award, color: '#8b5cf6' },
    { label: 'Eco Points Earned', value: liveStats.ecoPoints, icon: Trophy, color: '#f59e0b' },
  ]

  // How It Works steps
  const howItWorksSteps = milestonesContent.steps || [
    { number: '01', title: 'Create Your Account', description: 'Sign up with your college email. Your eco-profile, timetable, and campus map sync automatically.' },
    { number: '02', title: 'Track Your Impact', description: 'Log daily commutes, meals, and energy usage. Watch your carbon score drop and eco-points rise.' },
    { number: '03', title: 'Earn & Compete', description: 'Climb the leaderboard, unlock green badges, and participate in campus-wide eco campaigns.' },
  ]
  const stepIcons = [UserPlus, TrendingUp, Medal]

  if (isMobile) {
    const totalSlides = 1 + FEATURE_DETAILS.length + 2;
    const nextSlide = () => {
      if (currentSlide < totalSlides - 1) setCurrentSlide(prev => prev + 1);
    };
    const prevSlide = () => {
      if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
    };

    // Touch Swipe Logic
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    const handleTouchStart = (e) => {
      touchStartX = e.targetTouches[0].clientX;
    };
    const handleTouchMove = (e) => {
      touchEndX = e.targetTouches[0].clientX;
    };
    const handleTouchEnd = () => {
      if (!touchStartX || !touchEndX) return;
      const distance = touchStartX - touchEndX;
      if (distance > minSwipeDistance) nextSlide();
      else if (distance < -minSwipeDistance) prevSlide();
    };

    const icons = [QrCode, Target, BookOpen, MapPin, Award, Utensils, BarChart3, Trophy, MessageSquare, Compass, Bell];
    const colors = ['#22c55e', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

    return (
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="h-[100dvh] w-full overflow-hidden bg-[#020617] text-white selection:bg-green-500/30 font-sans relative flex flex-col justify-between"
      >
        {/* ─── DYNAMIC BACKGROUND WITH BLURRED HERO IMAGE ─── */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <img 
            src={heroImage} 
            alt="Campus Background" 
            className="w-full h-full object-cover opacity-30 scale-105 blur-[8px]"
          />
          <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-[3px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-transparent to-[#020617]/90" />
          <div 
            className="absolute top-[-25%] right-[-15%] w-[80vw] h-[80vw] rounded-full bg-green-500/[0.03] blur-[160px] pointer-events-none" 
            style={{ animation: 'floatBg 12s ease-in-out infinite', willChange: 'transform' }} 
          />
          <div 
            className="absolute bottom-[-25%] left-[-15%] w-[80vw] h-[80vw] rounded-full bg-blue-600/[0.03] blur-[160px] pointer-events-none" 
            style={{ animation: 'floatBg 15s ease-in-out infinite 2.5s', willChange: 'transform' }} 
          />
        </div>

        {/* Mobile Nav Header */}
        <nav className="relative z-50 p-4">
          <div className="flex items-center justify-between rounded-2xl bg-[#020617]/80 backdrop-blur-2xl border border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="w-9 h-9 object-contain" />
              <span className="text-xs font-black uppercase tracking-wider">
                Institute<span className="text-green-500">PLUSE</span>
              </span>
            </div>
            <div>
              <button 
                onClick={() => navigate(user ? getDashboardPath() : '/login')}
                className="px-4 py-2 rounded-xl bg-green-600 text-white text-[8px] font-black uppercase tracking-widest"
              >
                {user ? 'Dashboard' : 'Sign In'}
              </button>
            </div>
          </div>
        </nav>

        {/* Slide Content Area */}
        <div className="flex-1 flex items-center justify-center px-6 relative z-10 overflow-hidden">
          <AnimatePresence mode="wait">
            {currentSlide === 0 && (
              <motion.div
                key="hero-slide"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center max-w-sm"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                  <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">{hero.badge || 'Live • The Smart Campus OS'}</span>
                </div>

                <h1 className="text-4xl font-black tracking-tight leading-none mb-4 uppercase">
                  {hero.heading || 'YOUR CAMPUS.'}<br/>
                  <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">{hero.headingAccent || 'SUSTAINABLE. INTELLIGENT.'}</span>
                </h1>

                <p className="text-gray-400 text-xs max-w-xs font-medium leading-relaxed mb-8">
                  {hero.description || 'Next-Gen Campus Intelligence. Decarbonizing Education and Automating Canteen, Attendance, Maps, and more.'}
                </p>

                <button 
                  onClick={() => setCurrentSlide(1)}
                  className="px-8 py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg active:scale-95 animate-bounce"
                >
                  Explore Features <ArrowRight size={12} />
                </button>

                <div className="flex flex-col gap-2 mt-4 w-full">
                  <div className="flex items-center gap-3 justify-center w-full">
                    <button 
                      onClick={() => setCurrentSlide(FEATURE_DETAILS.length + 1)}
                      className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[8px] uppercase tracking-widest transition-all active:scale-95"
                    >
                      About Creator
                    </button>
                    <button 
                      onClick={() => setCurrentSlide(FEATURE_DETAILS.length + 2)}
                      className="flex-1 py-3 rounded-xl bg-white/5 border border-cyan-500/20 text-cyan-400 font-black text-[8px] uppercase tracking-widest transition-all active:scale-95"
                    >
                      Get Started
                    </button>
                  </div>
                  <a 
                    href="/InstitutePLUSE.apk"
                    download="InstitutePLUSE.apk"
                    className="w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black text-[8px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Download size={10} /> Download Android App (APK)
                  </a>
                </div>
                
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.25em] mt-6 animate-pulse">
                  Swipe Left to Explore
                </span>
              </motion.div>
            )}

            {currentSlide >= 1 && currentSlide <= FEATURE_DETAILS.length && (() => {
              const i = currentSlide - 1;
              const f = FEATURE_DETAILS[i];
              const FeatureIcon = icons[i] || QrCode;
              const color = colors[i] || '#22c55e';
              const cardDesc = featuresContent.cards?.[i]?.description || '';
              return (
                <motion.div
                  key={`feature-slide-${i}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-sm bg-[#0c1225]/50 border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between shadow-2xl relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-green-500/10 to-transparent blur-[50px] rounded-full pointer-events-none opacity-60`} />
                  
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}>
                        <FeatureIcon size={20} style={{ color }} />
                      </div>
                      <div>
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-500">Feature {i + 1} of {FEATURE_DETAILS.length}</span>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">{f.title}</h3>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium mb-4">
                      {cardDesc || f.bullets.join(' ')}
                    </p>

                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
                      {f.bullets.map((bullet, bi) => (
                        <div key={bi} className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                          <CheckCircle size={10} className="mt-0.5 flex-shrink-0" style={{ color }} />
                          <span className="text-[10px] text-gray-300 font-medium">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={prevSlide}
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-[8px] font-black uppercase tracking-widest"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextSlide}
                      className="flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest text-white transition-all shadow-lg flex items-center justify-center gap-2"
                      style={{ backgroundColor: color }}
                    >
                      {i === FEATURE_DETAILS.length - 1 ? 'Finish Exploration' : 'Next Feature'} <ArrowRight size={10} />
                    </button>
                  </div>
                </motion.div>
              )
            })()}

            {currentSlide === FEATURE_DETAILS.length + 1 && (
              <motion.div
                key="creator-slide"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center w-full max-w-sm gap-6"
              >
                <div className="bg-[#0c1225]/50 border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl w-full text-center shadow-2xl relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
                  
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">The Creator</span>
                  </div>

                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white text-lg font-black shadow-lg">
                      M
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-black text-white uppercase tracking-tight">Manthan Patel</h3>
                      <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Full Stack Developer</p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-[9px] mb-6 leading-relaxed">
                    Passionate developer focused on AI-powered systems, futuristic UI/UX, and smart campus innovation platforms.
                  </p>

                  <div className="flex flex-col gap-2 mb-6">
                    <a
                      href="https://manthantp-portfolio.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-650 text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      View Portfolio <ArrowUpRight size={10} />
                    </a>
                    <a
                      href="https://github.com/ManthanTP"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      GitHub Profile
                    </a>
                  </div>

                  <button
                    onClick={() => setCurrentSlide(FEATURE_DETAILS.length + 2)}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                  >
                    Get Started <ArrowRight size={10} />
                  </button>
                </div>
              </motion.div>
            )}

            {currentSlide === FEATURE_DETAILS.length + 2 && (
              <motion.div
                key="getstarted-slide"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center w-full max-w-sm gap-6"
              >
                <div className="bg-[#0c1225]/50 border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl w-full text-center shadow-2xl relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[80px] rounded-full pointer-events-none" />
                  
                  <h3 className="text-lg font-black uppercase mb-2">{ctaContent.heading || 'Ready to go green?'}</h3>
                  <p className="text-gray-400 text-[10px] mb-6 max-w-xs mx-auto leading-relaxed">
                    {ctaContent.description || 'Join thousands of students and faculty making their campus sustainable, one action at a time.'}
                  </p>
                  
                  <button 
                    onClick={() => navigate(user ? getDashboardPath() : '/register')}
                    className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-[9px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
                  >
                    {user ? (ctaContent.buttonTextLoggedIn || 'Open Dashboard') : (ctaContent.buttonText || 'Create Free Account')}
                  </button>
                </div>

                <div className="flex flex-col items-center text-center gap-3 w-full">
                  <div className="flex items-center gap-1.5">
                    <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
                    <span className="text-[10px] font-black tracking-tighter uppercase">InstitutePLUSE</span>
                  </div>
                  
                  <p className="text-gray-500 text-[8px] max-w-xs leading-relaxed font-medium">
                    {footerContent.tagline || 'The complete campus ecosystem for modern education.'}
                  </p>

                  <div className="flex justify-center gap-3">
                    {privacyContent._visible !== false && (
                      <button onClick={() => setPrivacyOpen(true)} className="text-[8px] font-black uppercase text-gray-400 hover:text-white transition-colors">Privacy</button>
                    )}
                    {termsContent._visible !== false && (
                      <button onClick={() => setTermsOpen(true)} className="text-[8px] font-black uppercase text-gray-400 hover:text-white transition-colors">Terms</button>
                    )}
                    <button onClick={() => setContactOpen(true)} className="text-[8px] font-black uppercase text-gray-400 hover:text-white transition-colors">Contact</button>
                  </div>

                  <div className="w-full border-t border-white/[0.04] pt-2">
                    <p className="text-[6px] font-black text-gray-600 uppercase tracking-widest">
                      {footerContent.copyright || '© 2026 InstitutePLUSE.'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setCurrentSlide(0)}
                    className="text-[8px] font-black text-green-500 uppercase tracking-widest mt-2 hover:underline"
                  >
                    Back to Start
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Progress Tracker */}
        <div className="relative z-20 px-6 pb-6 pt-2">
          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mb-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-5 bg-green-500' : 'w-1.5 bg-white/20'}`}
              />
            ))}
          </div>
          <div className="text-center">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.25em]">
              Slide {currentSlide + 1} of {totalSlides}
            </span>
          </div>
        </div>

        {/* Privacy, Terms, Contact modals from original */}
        <AnimatePresence>
          {privacyOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPrivacyOpen(false)}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[#0c1225]/95 border border-white/[0.08] rounded-3xl p-6 max-h-[75vh] overflow-y-auto no-scrollbar shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-green-400">{privacyContent.sectionTitle || 'Privacy Policy'}</span>
                  <button onClick={() => setPrivacyOpen(false)} className="text-gray-400 hover:text-white transition-colors text-sm">✕</button>
                </div>
                <div className="text-[10px] text-gray-400 space-y-3 leading-relaxed font-medium">
                  {(privacyContent.items || []).map((item, idx) => (
                    <div key={idx}>
                      <p className="text-white font-bold uppercase tracking-wider mb-0.5 text-[8px]">{item.title}</p>
                      <p>{item.content}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {termsOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setTermsOpen(false)}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[#0c1225]/95 border border-white/[0.08] rounded-3xl p-6 max-h-[75vh] overflow-y-auto no-scrollbar shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-cyan-400">{termsContent.sectionTitle || 'Terms of Service'}</span>
                  <button onClick={() => setTermsOpen(false)} className="text-gray-400 hover:text-white transition-colors text-sm">✕</button>
                </div>
                <div className="text-[10px] text-gray-400 space-y-3 leading-relaxed font-medium">
                  {(termsContent.items || []).map((item, idx) => (
                    <div key={idx}>
                      <p className="text-white font-bold uppercase tracking-wider mb-0.5 text-[8px]">{item.title}</p>
                      <p>{item.content}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {contactOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setContactOpen(false)}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[#0c1225]/95 border border-white/[0.08] rounded-3xl p-6 shadow-2xl relative text-center"
              >
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-purple-400">Contact Us</span>
                  <button onClick={() => setContactOpen(false)} className="text-gray-400 hover:text-white transition-colors text-sm">✕</button>
                </div>
                <div className="text-[10px] text-gray-400 space-y-3 leading-relaxed font-medium">
                  <p className="text-white font-black uppercase tracking-wider">{footerContent.collegeName || 'Jain College of Engineering'}</p>
                  <p>For administrative inquiries contact developer directly:</p>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                     <p className="text-purple-400 font-mono font-black text-xs">{footerContent.contactEmail || 'manthantp.work@gmail.com'}</p>
                  </div>
                  <a 
                    href={`mailto:${footerContent.contactEmail || 'manthantp.work@gmail.com'}`}
                    className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-purple-600 text-white font-black text-[8px] uppercase tracking-widest"
                  >
                    Send Email
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-green-500/30 font-sans overflow-x-hidden">
      
      {/* ─── DYNAMIC BACKGROUND (GPU ACCELERATED CSS) ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated glowing mesh gradients using hardware-accelerated float animations */}
        <div 
          className="absolute top-[-25%] right-[-15%] w-[80vw] h-[80vw] rounded-full bg-green-500/[0.04] blur-[160px] pointer-events-none" 
          style={{ animation: 'floatBg 12s ease-in-out infinite', willChange: 'transform' }} 
        />
        <div 
          className="absolute bottom-[-25%] left-[-15%] w-[80vw] h-[80vw] rounded-full bg-blue-600/[0.04] blur-[160px] pointer-events-none" 
          style={{ animation: 'floatBg 15s ease-in-out infinite 2.5s', willChange: 'transform' }} 
        />
        <div className="absolute top-[40%] left-[25%] w-[45vw] h-[45vw] rounded-full bg-purple-600/[0.03] blur-[120px] pointer-events-none" />
      </div>

      {/* Dynamic scrolling grid lines */}
      <div 
        className="fixed inset-0 z-[1] opacity-[0.09] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', 
          backgroundSize: '60px 60px',
          animation: 'gridMove 25s linear infinite',
          willChange: 'transform'
        }} 
      />

      {/* ─── NAVIGATION ─── */}
      <nav className={`fixed top-0 inset-x-0 z-[100] px-4 md:px-6 py-4 transition-all duration-300 ${scrolled ? 'py-2.5' : 'py-4'}`}>
        <div className={`max-w-7xl mx-auto flex items-center justify-between rounded-2xl md:rounded-[24px] px-4 md:px-6 py-3 transition-all duration-300 border ${
          scrolled 
            ? 'bg-[#020617]/75 backdrop-blur-2xl border-white/[0.06] shadow-2xl shadow-green-500/[0.02]' 
            : 'bg-white/5 backdrop-blur-md border-white/10'
        }`}>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
              <img src={logo} alt="Logo" className="w-10 h-10 md:w-11 md:h-11 object-contain drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]" />
            </motion.div>
            <span className="text-base md:text-lg font-black tracking-tighter uppercase">
              Institute<span className="text-green-500">PLUSE</span>
            </span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {featuresContent._visible !== false && (
              <button onClick={() => scrollTo(featuresRef)} className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors relative group py-1">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-green-500 group-hover:w-full transition-all duration-300" />
              </button>
            )}
            {impactContent._visible !== false && (
              <button onClick={() => scrollTo(statsRef)} className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors relative group py-1">
                Impact
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-green-500 group-hover:w-full transition-all duration-300" />
              </button>
            )}
            {techContent._visible !== false && (
              <button onClick={() => scrollTo(techRef)} className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors relative group py-1">
                Tech Stack
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-green-500 group-hover:w-full transition-all duration-300" />
              </button>
            )}
            {milestonesContent._visible !== false && (
              <button onClick={() => scrollTo(milestonesRef)} className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors relative group py-1">
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-green-500 group-hover:w-full transition-all duration-300" />
              </button>
            )}
            {faqContent._visible !== false && (
              <button onClick={() => scrollTo(faqRef)} className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors relative group py-1">
                FAQ
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-green-500 group-hover:w-full transition-all duration-300" />
              </button>
            )}
            <button onClick={() => scrollTo(creatorRef)} className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors relative group py-1">
              About
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-green-500 group-hover:w-full transition-all duration-300" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button 
                onClick={() => navigate(getDashboardPath())}
                className="group px-5 md:px-7 py-2.5 rounded-xl bg-green-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-green-600/15 flex items-center gap-2"
              >
                Dashboard <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="hidden sm:block text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-white px-3 hover:scale-105 transition-transform"
                >
                  Log In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-5 md:px-7 py-2.5 rounded-xl bg-white text-slate-950 text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                >
                  Sign Up
                </button>
              </>
            )}
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenu(!mobileMenu)} 
              className="lg:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenu ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="lg:hidden mt-2 bg-[#020617]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-1 shadow-2xl"
            >
              {featuresContent._visible !== false && <button onClick={() => { scrollTo(featuresRef); setMobileMenu(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all">Features</button>}
              {impactContent._visible !== false && <button onClick={() => { scrollTo(statsRef); setMobileMenu(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all">Impact</button>}
              {techContent._visible !== false && <button onClick={() => { scrollTo(techRef); setMobileMenu(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all">Tech Stack</button>}
              {milestonesContent._visible !== false && <button onClick={() => { scrollTo(milestonesRef); setMobileMenu(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all">Milestones</button>}
              {faqContent._visible !== false && <button onClick={() => { scrollTo(faqRef); setMobileMenu(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all">FAQ</button>}
              <button onClick={() => { scrollTo(creatorRef); setMobileMenu(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all">About</button>
              {!user && (
                <button onClick={() => { navigate('/login'); setMobileMenu(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all sm:hidden">Log In</button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO SECTION (SIDE-BY-SIDE INTEGRATION) ─── */}
      {hero._visible !== false && (
        <section className="relative z-10 pt-32 md:pt-40 lg:pt-48 pb-20 px-5 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Typography & Actions */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-6 md:mb-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              <span className="text-[9px] font-black text-green-500 uppercase tracking-[0.3em]">{hero.badge || 'Live • The Smart Campus OS'}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-[40px] md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.9] mb-6 md:mb-8"
            >
              {hero.heading || 'YOUR CAMPUS.'}<br/>
              <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,197,94,0.1)]">{hero.headingAccent || 'SUSTAINABLE. INTELLIGENT. UNIFIED.'}</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5 }}
              className="text-gray-400 text-base md:text-lg max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed mb-8 md:mb-10"
            >
              {hero.description || 'Next-Gen Campus Intelligence. Decarbonizing Education, Automating Timetables, and Rewarding Sustainable Actions.'}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button 
                onClick={() => navigate(user ? getDashboardPath() : '/register')}
                className="group relative px-9 py-4.5 rounded-2xl bg-green-600 text-white font-black text-[10px] uppercase tracking-[0.25em] hover:bg-green-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-600/15 transition-all flex items-center justify-center gap-2.5 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                {user ? (hero.ctaPrimaryLoggedIn || 'Go to Dashboard') : (hero.ctaPrimary || 'Get Started Free')} <ArrowRight size={15} />
              </button>
              <button 
                onClick={() => scrollTo(featuresRef)}
                className="px-9 py-4.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.25em] hover:bg-white/10 transition-all backdrop-blur-xl hover:scale-[1.02]"
              >
                {hero.ctaSecondary || 'Explore Features'}
              </button>
              <a 
                href="/InstitutePLUSE.apk"
                download="InstitutePLUSE.apk"
                className="px-9 py-4.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/35 hover:bg-cyan-500/20 text-cyan-400 font-black text-[10px] uppercase tracking-[0.25em] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download APK
              </a>
            </motion.div>
          </div>

          {/* Right Column: Premium Floating Glass Showcase */}
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl mx-auto"
          >
            {/* Ambient glow behind the card */}
            <div className="absolute -inset-6 bg-gradient-to-br from-green-500/10 via-cyan-500/5 to-purple-500/10 rounded-[40px] blur-3xl opacity-60 pointer-events-none" />
            
            {/* Main glass card */}
            <div className="relative rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">

              {/* Image container — natural aspect ratio */}
              <div className="relative group">
                <img 
                  src={heroImage} 
                  alt="Jain Institute of Technology Hubli — Smart Sustainable Campus" 
                  className="w-full h-auto object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]" 
                />
                {/* Soft bottom fade for seamless blend into dark background */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 pointer-events-none" />
                
                {/* Floating caption badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/[0.08]">
                    <Leaf size={12} className="text-green-400" />
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">JGI Hubli Campus</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-green-500/15 backdrop-blur-xl border border-green-500/20">
                    <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Eco Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative floating dots */}
            <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-green-500/20 blur-sm pointer-events-none" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-cyan-500/20 blur-sm pointer-events-none" />
          </motion.div>
         
        </div>
      </section>
      )}



      {/* ─── FEATURES BENTO GRID SECTION ─── */}
      {featuresContent._visible !== false && (
        <section ref={featuresRef} className="relative z-10 py-24 px-5 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-[9px] font-black text-green-500 uppercase tracking-[0.4em] mb-4">{featuresContent.sectionLabel || 'Features Bento'}</h2>
            <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase max-w-2xl mx-auto leading-[0.95]">
              {featuresContent.sectionTitle || 'Designed for smart campus ecosystems.'}
            </h3>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Block 1: Smart Attendance (Spans 2 columns) */}
            <div onClick={() => handleFeatureClick(0)} className="group relative md:col-span-2 rounded-[24px] bg-[#0c1225]/35 border border-white/[0.04] p-5 backdrop-blur-xl hover:border-green-500/20 hover:bg-[#0c1225]/45 transition-all duration-500 flex flex-row items-center gap-5 overflow-hidden min-h-[110px] cursor-pointer">
              <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_50%_120%,rgba(34,197,94,0.03),transparent_50%)] pointer-events-none" />
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                <QrCode size={20} />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{featuresContent.cards?.[0]?.title || 'Smart Attendance'}</h4>
                <p className="text-gray-500 text-[11px] font-medium leading-relaxed line-clamp-2">
                  {featuresContent.cards?.[0]?.description || 'Fast QR check-ins synced to your class timetable. Log present states instantly and view automated attendance statistics without paper.'}
                </p>
              </div>
            </div>

            {/* Bento Block 2: Green Campus (Spans 1 column) */}
            <div onClick={() => handleFeatureClick(1)} className="group relative rounded-[24px] bg-[#0c1225]/35 border border-white/[0.04] p-5 backdrop-blur-xl hover:border-purple-500/20 hover:bg-[#0c1225]/45 transition-all duration-500 flex flex-col justify-between overflow-hidden min-h-[110px] cursor-pointer">
              <div className="absolute inset-0 bg-[radial-gradient(200px_circle_at_50%_120%,rgba(139,92,246,0.03),transparent_50%)] pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Target size={16} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight">{featuresContent.cards?.[1]?.title || 'Green Campus'}</h4>
              </div>
              <p className="text-gray-500 text-[10px] font-medium leading-relaxed mt-2 line-clamp-2">
                {featuresContent.cards?.[1]?.description || 'Log daily choices, track Campus Green Score levels, and earn leaderboard points to climb the campus sustainability scoreboards.'}
              </p>
            </div>

            {/* Bento Block 3: Study Planner (Spans 1 column) */}
            <div onClick={() => handleFeatureClick(2)} className="group relative rounded-[24px] bg-[#0c1225]/35 border border-white/[0.04] p-5 backdrop-blur-xl hover:border-yellow-500/20 hover:bg-[#0c1225]/45 transition-all duration-500 flex flex-col justify-between overflow-hidden min-h-[110px] cursor-pointer">
              <div className="absolute inset-0 bg-[radial-gradient(200px_circle_at_50%_120%,rgba(245,158,11,0.03),transparent_50%)] pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                  <BookOpen size={16} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight">{featuresContent.cards?.[2]?.title || 'Study Planner'}</h4>
              </div>
              <p className="text-gray-500 text-[10px] font-medium leading-relaxed mt-2 line-clamp-2">
                {featuresContent.cards?.[2]?.description || 'Organize focus sessions, set customized alarms, partition revision by subject codes, and coordinate with peer logs.'}
              </p>
            </div>

            {/* Bento Block 4: Campus Navigation (Spans 1 column) */}
            <div onClick={() => handleFeatureClick(3)} className="group relative rounded-[24px] bg-[#0c1225]/35 border border-white/[0.04] p-5 backdrop-blur-xl hover:border-red-500/20 hover:bg-[#0c1225]/45 transition-all duration-500 flex flex-col justify-between overflow-hidden min-h-[110px] cursor-pointer">
              <div className="absolute inset-0 bg-[radial-gradient(200px_circle_at_50%_120%,rgba(239,68,68,0.03),transparent_50%)] pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight">{featuresContent.cards?.[3]?.title || 'Floor Maps'}</h4>
              </div>
              <p className="text-gray-500 text-[10px] font-medium leading-relaxed mt-2 line-clamp-2">
                {featuresContent.cards?.[3]?.description || 'Navigate buildings room by room. Filter floor maps instantly to locate faculty offices, lecture rooms, and labs.'}
              </p>
            </div>

            {/* Bento Block 5: Events & Challenges (Spans 1 column) */}
            <div onClick={() => handleFeatureClick(4)} className="group relative rounded-[24px] bg-[#0c1225]/35 border border-white/[0.04] p-5 backdrop-blur-xl hover:border-cyan-500/20 hover:bg-[#0c1225]/45 transition-all duration-500 flex flex-col justify-between overflow-hidden min-h-[110px] cursor-pointer">
              <div className="absolute inset-0 bg-[radial-gradient(200px_circle_at_50%_120%,rgba(6,182,212,0.03),transparent_50%)] pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Award size={16} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight">{featuresContent.cards?.[4]?.title || 'Events'}</h4>
              </div>
              <p className="text-gray-500 text-[10px] font-medium leading-relaxed mt-2 line-clamp-2">
                {featuresContent.cards?.[4]?.description || 'Join organized campaigns, support ecological challenges, earn badges, and build credentials.'}
              </p>
            </div>

            {/* Bento Block 6: Smart Cafeteria (Spans 2 columns) */}
            <div onClick={() => handleFeatureClick(5)} className="group relative md:col-span-2 rounded-[24px] bg-[#0c1225]/35 border border-white/[0.04] p-5 backdrop-blur-xl hover:border-orange-500/20 hover:bg-[#0c1225]/45 transition-all duration-500 flex flex-row items-center gap-5 overflow-hidden min-h-[110px] cursor-pointer">
              <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_50%_120%,rgba(249,115,22,0.03),transparent_50%)] pointer-events-none" />
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <Utensils size={20} />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{featuresContent.cards?.[5]?.title || 'Smart Cafeteria'}</h4>
                <p className="text-gray-500 text-[11px] font-medium leading-relaxed line-clamp-2">
                  {featuresContent.cards?.[5]?.description || 'Browse the digital campus menu, pre-order meals, track nutritional info, and view real-time item availability — all from your phone.'}
                </p>
              </div>
            </div>

            {/* Bento Block 8: Live Leaderboard (Spans 1 column) */}
            <div onClick={() => handleFeatureClick(7)} className="group relative rounded-[24px] bg-[#0c1225]/35 border border-white/[0.04] p-5 backdrop-blur-xl hover:border-yellow-500/20 hover:bg-[#0c1225]/45 transition-all duration-500 flex flex-col justify-between overflow-hidden min-h-[110px] cursor-pointer">
              <div className="absolute inset-0 bg-[radial-gradient(200px_circle_at_50%_120%,rgba(245,158,11,0.03),transparent_50%)] pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                  <Trophy size={16} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight">{featuresContent.cards?.[7]?.title || 'Leaderboards'}</h4>
              </div>
              <p className="text-gray-500 text-[10px] font-medium leading-relaxed mt-2 line-clamp-2">
                {featuresContent.cards?.[7]?.description || 'Check real-time standings, compare weekly XP totals, and compete for top green badges across departments.'}
              </p>
            </div>

            {/* Bento Block 7: Green Analytics (Spans 2 columns) */}
            <div onClick={() => handleFeatureClick(6)} className="group relative md:col-span-2 rounded-[24px] bg-[#0c1225]/35 border border-white/[0.04] p-5 backdrop-blur-xl hover:border-green-500/20 hover:bg-[#0c1225]/45 transition-all duration-500 flex flex-row items-center gap-5 overflow-hidden min-h-[110px] cursor-pointer">
              <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_50%_120%,rgba(34,197,94,0.03),transparent_50%)] pointer-events-none" />
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                <BarChart3 size={20} />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{featuresContent.cards?.[6]?.title || 'Green Analytics'}</h4>
                <p className="text-gray-500 text-[11px] font-medium leading-relaxed line-clamp-2">
                  {featuresContent.cards?.[6]?.description || 'Visualize dynamic Campus Green Score progression charts and sustainability trends by transport, food, energy, and waste categories.'}
                </p>
              </div>
            </div>

            {/* Bento Block 9: Grievance Hub (Spans 1 column) */}
            <div onClick={() => handleFeatureClick(8)} className="group relative rounded-[24px] bg-[#0c1225]/35 border border-white/[0.04] p-5 backdrop-blur-xl hover:border-red-500/20 hover:bg-[#0c1225]/45 transition-all duration-500 flex flex-col justify-between overflow-hidden min-h-[110px] cursor-pointer">
              <div className="absolute inset-0 bg-[radial-gradient(200px_circle_at_50%_120%,rgba(239,68,68,0.03),transparent_50%)] pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <MessageSquare size={16} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight">{featuresContent.cards?.[8]?.title || 'Grievance Hub'}</h4>
              </div>
              <p className="text-gray-500 text-[10px] font-medium leading-relaxed mt-2 line-clamp-2">
                {featuresContent.cards?.[8]?.description || 'File complaints, request maintenance, and track resolution statuses with real-time ticketing.'}
              </p>
            </div>

            {/* Bento Block 10: Lost & Found (Spans 1 column) */}
            <div onClick={() => handleFeatureClick(9)} className="group relative rounded-[24px] bg-[#0c1225]/35 border border-white/[0.04] p-5 backdrop-blur-xl hover:border-cyan-500/20 hover:bg-[#0c1225]/45 transition-all duration-500 flex flex-col justify-between overflow-hidden min-h-[110px] cursor-pointer">
              <div className="absolute inset-0 bg-[radial-gradient(200px_circle_at_50%_120%,rgba(6,182,212,0.03),transparent_50%)] pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Compass size={16} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight">{featuresContent.cards?.[9]?.title || 'Lost & Found'}</h4>
              </div>
              <p className="text-gray-500 text-[10px] font-medium leading-relaxed mt-2 line-clamp-2">
                {featuresContent.cards?.[9]?.description || 'Report lost campus belongings or claim found valuables directly through the automated catalog feed.'}
              </p>
            </div>

            {/* Bento Block 11: Announcements (Spans 2 columns) */}
            <div onClick={() => handleFeatureClick(10)} className="group relative md:col-span-2 rounded-[24px] bg-[#0c1225]/35 border border-white/[0.04] p-5 backdrop-blur-xl hover:border-purple-500/20 hover:bg-[#0c1225]/45 transition-all duration-500 flex flex-row items-center gap-5 overflow-hidden min-h-[110px] cursor-pointer">
              <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_50%_120%,rgba(139,92,246,0.03),transparent_50%)] pointer-events-none" />
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Bell size={20} />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{featuresContent.cards?.[10]?.title || 'Announcements'}</h4>
                <p className="text-gray-500 text-[11px] font-medium leading-relaxed line-clamp-2">
                  {featuresContent.cards?.[10]?.description || 'Receive instant notifications, timetable modifications, and sustainable guidelines from administrators.'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
      )}

      {/* ─── INTERACTIVE SUSTAINABILITY METRICS WIDGET ─── */}
      {impactContent._visible !== false && (
        <section ref={statsRef} className="relative z-10 py-24 px-5 md:px-6 bg-gradient-to-b from-green-600/[0.01] to-transparent border-t border-white/[0.04]">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Tabbed Dashboard widget */}
            <div className="order-2 lg:order-1">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true, margin: '-50px' }}
                 className="bg-black/60 border border-white/[0.08] rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
               >
                  <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-green-500/10 blur-[40px] rounded-full pointer-events-none" />
                  
                  {/* Tabs top selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/[0.06] pb-4">
                     <div className="flex items-center gap-3">
                        <BarChart3 size={18} className="text-green-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-200">Campus Carbon Offset Index</span>
                     </div>
                     <div className="flex p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl self-start sm:self-auto">
                        {['CAMPUS', 'MY_IMPACT', 'LEADERS'].map((tab) => (
                           <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`px-3 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase transition-all duration-200 ${
                                 activeTab === tab 
                                    ? 'bg-green-600 text-white shadow-md' 
                                    : 'text-gray-500 hover:text-gray-300'
                              }`}
                           >
                              {tab.replace('_', ' ')}
                           </button>
                        ))}
                     </div>
                  </div>
                  
                  {/* Tab Contents */}
                  <div>
                     {activeTab === 'CAMPUS' && (
                        <div className="grid grid-cols-2 gap-4">
                           {[
                              { label: 'Active Users', value: liveStats.activeUsers, icon: <Users size={16} />, accent: 'from-green-500/20 to-green-500/5', iconBg: 'bg-green-500/10 border-green-500/20', iconColor: 'text-green-400', valueColor: 'text-green-400' },
                              { label: 'CO₂ Saved', value: liveStats.co2Tracked, icon: <Leaf size={16} />, accent: 'from-cyan-500/20 to-cyan-500/5', iconBg: 'bg-cyan-500/10 border-cyan-500/20', iconColor: 'text-cyan-400', valueColor: 'text-cyan-400' },
                              { label: 'Active Events', value: liveStats.eventsHosted, icon: <Trophy size={16} />, accent: 'from-purple-500/20 to-purple-500/5', iconBg: 'bg-purple-500/10 border-purple-500/20', iconColor: 'text-purple-400', valueColor: 'text-purple-400' },
                              { label: 'Eco Points Earned', value: liveStats.ecoPoints, icon: <Award size={16} />, accent: 'from-yellow-500/20 to-yellow-500/5', iconBg: 'bg-yellow-500/10 border-yellow-500/20', iconColor: 'text-yellow-400', valueColor: 'text-yellow-400' },
                           ].map(card => (
                              <div key={card.label} className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 flex flex-col gap-3 overflow-hidden group hover:border-white/[0.1] transition-all duration-300">
                                 <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                                 <div className="relative z-10 flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-xl ${card.iconBg} border flex items-center justify-center ${card.iconColor}`}>
                                       {card.icon}
                                    </div>
                                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.2em]">{card.label}</span>
                                 </div>
                                 <p className={`relative z-10 text-2xl font-black ${card.valueColor} tracking-tight`}>{card.value}</p>
                              </div>
                           ))}
                        </div>
                     )}

                     {activeTab === 'MY_IMPACT' && (
                        <div>
                           {userImpact ? (
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-white/[0.015] border border-white/[0.04] p-4 rounded-2xl flex flex-col justify-between">
                                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">CO₂ COMMUTE REDUCTION</span>
                                    <p className="text-xl font-black text-green-400 mt-1">
                                       {userImpact.lastLog?.transport_kg ? `${Number(userImpact.lastLog.transport_kg).toFixed(1)} kg` : '0 kg'}
                                    </p>
                                    <span className="text-[8px] text-gray-500 mt-2">Latest transportation log</span>
                                 </div>
                                 <div className="bg-white/[0.015] border border-white/[0.04] p-4 rounded-2xl flex flex-col justify-between">
                                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">TOTAL SAVED CO₂</span>
                                    <p className="text-xl font-black text-purple-400 mt-1">
                                       {Number(userImpact.totalCo2).toFixed(1)} kg
                                    </p>
                                    <span className="text-[8px] text-gray-500 mt-2">Cumulative carbon reductions</span>
                                 </div>
                                 <div className="bg-white/[0.015] border border-white/[0.04] p-4 rounded-2xl flex flex-col justify-between">
                                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">ECO POINTS BALANCE</span>
                                    <p className="text-xl font-black text-cyan-400 mt-1">
                                       {userImpact.ecoPoints} XP
                                    </p>
                                    <span className="text-[8px] text-gray-500 mt-2">Redeemable points ledger</span>
                                 </div>
                                 <div className="bg-white/[0.015] border border-white/[0.04] p-4 rounded-2xl flex flex-col justify-between">
                                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">LATEST MEAL IMPACT</span>
                                    <p className="text-xl font-black text-yellow-400 mt-1">
                                       {userImpact.lastLog?.food_kg ? `${Number(userImpact.lastLog.food_kg).toFixed(1)} kg` : '0.0 kg'}
                                    </p>
                                    <span className="text-[8px] text-gray-500 mt-2">Cafeteria order carbon load</span>
                                 </div>
                              </div>
                           ) : (
                              <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
                                 <Lock size={20} className="text-gray-600" />
                                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Authentication Required</p>
                                 <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-xl bg-green-600 text-white text-[8px] font-black uppercase tracking-widest">Log In to View Impact</button>
                              </div>
                           )}
                        </div>
                     )}

                     {activeTab === 'LEADERS' && (
                        <div className="space-y-3">
                           {leaderboard.length > 0 ? (
                              leaderboard.map((lead, i) => (
                                 <div key={lead.full_name + i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.015] border border-white/[0.04]">
                                    <div className="flex items-center gap-3">
                                       <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-300">
                                          {i + 1}
                                       </div>
                                       <div>
                                          <p className="text-xs font-black text-white">{lead.full_name}</p>
                                          <span className="text-[8px] text-gray-500 uppercase tracking-wider">{lead.department || lead.role}</span>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <span className="text-[10px] font-black text-green-400">{lead.eco_points} XP</span>
                                    </div>
                                 </div>
                              ))
                           ) : (
                              <div className="py-8 text-center">
                                 <span className="text-2xl">🏆</span>
                                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-2">Leaderboard Empty</p>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               </motion.div>
            </div>

            {/* Right: Text Description */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
               <h2 className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-4">{impactContent.sectionLabel || 'Make An Impact'}</h2>
               <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-[0.95] mb-6">{impactContent.sectionTitle || 'Every action counts.'}</h3>
               <p className="text-gray-400 text-base font-medium leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                  {impactContent.description || 'Log your daily commute, meals, and energy usage. Watch your eco-score grow. Compete with peers on the leaderboard. Together, we build a greener campus.'}
               </p>
               <button 
                 onClick={() => navigate('/register')}
                 className="group inline-flex items-center gap-3 text-sm font-black text-green-500 uppercase tracking-[0.3em] hover:text-green-400 transition-colors"
               >
                  {impactContent.ctaText || 'Start Your Journey'} <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
               </button>
            </div>
         </div>
      </section>
      )}

      {/* ─── NEW SECTION 1: PLATFORM TECH & STACK SHOWCASE ─── */}
      {techContent._visible !== false && (
        <section ref={techRef} className="relative z-10 py-24 px-5 md:px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-[9px] font-black text-green-500 uppercase tracking-[0.4em] mb-4">{techContent.sectionLabel || 'Architecture'}</h2>
            <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase max-w-2xl mx-auto leading-[0.95]">
              {techContent.sectionTitle || 'Built for speed, security, and scalability.'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative rounded-3xl bg-white/[0.005] border border-white/[0.04] p-8 hover:bg-white/[0.02] hover:border-green-500/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mb-6">
                <Cpu size={18} />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-tight mb-3">{techContent.cards?.[0]?.title || 'Core Frontend Stack'}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {techContent.cards?.[0]?.description || 'Powered by React and Vite to ensure instant page render speeds, lightweight asset bundles, and fully hardware-accelerated interface transition layers.'}
              </p>
            </div>

            <div className="group relative rounded-3xl bg-white/[0.005] border border-white/[0.04] p-8 hover:bg-white/[0.02] hover:border-cyan-500/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                <Shield size={18} />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-tight mb-3">{techContent.cards?.[1]?.title || 'Secure Identity Linking'}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {techContent.cards?.[1]?.description || 'Utilizes AES verification and time-based expiration values inside QR payloads, effectively blocking roll-call fraud and sync tampering.'}
              </p>
            </div>

            <div className="group relative rounded-3xl bg-white/[0.005] border border-white/[0.04] p-8 hover:bg-white/[0.02] hover:border-purple-500/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                <Layers size={18} />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-tight mb-3">{techContent.cards?.[2]?.title || 'Real-time Data Sync'}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {techContent.cards?.[2]?.description || 'Direct Supabase backend connection facilitating instantaneous eco-points logging, realtime leaderboard refreshes, and instant food canteen alerts.'}
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ─── HOW IT WORKS ─── */}
      {milestonesContent._visible !== false && (
        <section id="milestones-section" ref={milestonesRef} className="relative z-10 py-24 px-5 md:px-6 border-t border-white/[0.04] bg-white/[0.005]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-[9px] font-black text-green-500 uppercase tracking-[0.4em] mb-4">{milestonesContent.sectionLabel || 'How It Works'}</h2>
            <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase max-w-2xl mx-auto leading-[0.95]">
              {milestonesContent.sectionTitle || 'Get started in 3 easy steps.'}
            </h3>
          </div>

          {/* Steps Grid */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-[72px] left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-green-500/40 via-cyan-500/40 to-purple-500/40" />

            {howItWorksSteps.map((step, i) => {
              const StepIcon = stepIcons[i] || stepIcons[0]
              const colors = [
                { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', glow: 'bg-green-500/5', num: 'text-green-500' },
                { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'bg-cyan-500/5', num: 'text-cyan-500' },
                { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'bg-purple-500/5', num: 'text-purple-500' },
              ][i] || { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', glow: 'bg-green-500/5', num: 'text-green-500' }

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative text-center flex flex-col items-center"
                >
                  {/* Step Number Circle */}
                  <div className={`relative z-10 w-[88px] h-[88px] rounded-full bg-slate-950 border-2 ${colors.border} flex items-center justify-center mb-6 shadow-xl`}>
                    <div className={`absolute inset-0 rounded-full ${colors.bg} pointer-events-none`} />
                    <div className={`absolute inset-0 rounded-full ${colors.glow} blur-xl pointer-events-none`} />
                    <StepIcon size={32} className={`${colors.text} relative z-10`} />
                  </div>

                  {/* Step Number Badge */}
                  <span className={`text-[40px] font-black ${colors.num} opacity-10 absolute top-0 right-4 md:right-2 select-none pointer-events-none`}>{step.number}</span>

                  <h4 className="text-lg font-black text-white uppercase tracking-tight mb-3">{step.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-[260px] font-medium">{step.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
      )}

      {/* ─── NEW SECTION 3: INTERACTIVE FAQ ACCORDION ─── */}
      {faqContent._visible !== false && (
        <section ref={faqRef} className="relative z-10 py-24 px-5 md:px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-[9px] font-black text-green-500 uppercase tracking-[0.4em] mb-4">{faqContent.sectionLabel || 'FAQ'}</h2>
            <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase max-w-2xl mx-auto leading-[0.95]">
              {faqContent.sectionTitle || 'Frequently Asked Questions'}
            </h3>
          </div>

          <div className="space-y-4">
            {(faqContent.items || [
              { question: 'How does QR Smart Attendance work?', answer: 'Instructors generate a time-restricted check-in QR code on the lecture hall screen. Students scan the QR code via their Attendance page. The system checks location validity and student identity to log the attendance record instantly.' },
              { question: 'What are Eco Points and how are they calculated?', answer: 'Eco Points are rewarded for green actions like ridesharing, selecting vegetarian canteen meals, and recycling items. Point values are defined in the sustainability guidelines (e.g. +20 pts for canteen veg selection).' },
              { question: 'Is my personal study and logging data secure?', answer: 'Yes. All authentication and data transfers are protected under Supabase security protocols, and student records are kept private and accessible only to authorized administrators and the student themselves.' },
              { question: 'Can other colleges adopt the Institute Pulse platform?', answer: 'Yes, the core system is modularized and can be configured with semester tables, location maps, bus routes, and cafeteria items for any educational institute.' },
            ]).map((faq, idx) => (
              <FaqItem key={faq.question || faq.q} question={faq.question || faq.q} answer={faq.answer || faq.a} />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ─── CTA SECTION ─── */}
      {ctaContent._visible !== false && (
        <section className="relative z-10 py-24 px-5 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-green-950/10 via-blue-950/10 to-purple-950/10 border border-white/[0.08] rounded-[36px] p-8 md:p-16 backdrop-blur-xl relative overflow-hidden"
          >
            {/* Glowing halos */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
            
            <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase mb-4 relative z-10">{ctaContent.heading || 'Ready to go green?'}</h3>
            <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-8 relative z-10">
              {ctaContent.description || 'Join thousands of students and faculty making their campus sustainable, one action at a time.'}
            </p>
            
            <button 
              onClick={() => navigate(user ? getDashboardPath() : '/register')}
              className="group relative px-10 py-5 rounded-2xl bg-green-600 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-green-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-green-600/20 relative z-10 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              {user ? (ctaContent.buttonTextLoggedIn || 'Open Dashboard') : (ctaContent.buttonText || 'Create Free Account')}
            </button>
          </motion.div>
        </div>
      </section>
      )}

      {/* ─── ABOUT CREATOR ─── */}
      <div ref={creatorRef}>
        {creatorContent._visible !== false && <AboutCreator content={creatorContent} />}
      </div>

      {/* ─── FOOTER ─── */}
      <footer ref={footerRef} className="relative z-10 pt-16 md:pt-24 pb-8 px-5 md:px-6 border-t border-white/[0.04] bg-black/[0.02]">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14">
               <div className="col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                     <img src={logo} alt="Logo" className="w-11 h-11 object-contain" />
                     <span className="text-lg font-black tracking-tighter uppercase">InstitutePLUSE</span>
                  </div>
                  <p className="text-gray-500 text-sm max-w-sm font-medium leading-relaxed">
                     {footerContent.tagline || 'The complete campus ecosystem for modern education. Sustainable, intelligent, and built for everyone.'}
                  </p>
               </div>
               
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Platform</p>
                  <ul className="space-y-2 text-[11px] font-bold text-gray-500">
                     {featuresContent._visible !== false && <li><button onClick={() => scrollTo(featuresRef)} className="hover:text-white transition-colors">Features Grid</button></li>}
                     {impactContent._visible !== false && <li><button onClick={() => scrollTo(statsRef)} className="hover:text-white transition-colors">Campus Carbon Offset Index</button></li>}
                     {milestonesContent._visible !== false && <li><button onClick={() => {
                        const milestonesSec = document.getElementById('milestones-section')
                        milestonesSec?.scrollIntoView({ behavior: 'smooth' })
                     }} className="hover:text-white transition-colors">How It Works</button></li>}
                     {creatorContent._visible !== false && <li><button onClick={() => {
                        const creatorSec = document.getElementById('about-creator')
                        creatorSec?.scrollIntoView({ behavior: 'smooth' })
                     }} className="hover:text-white transition-colors">About Developer</button></li>}
                     <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Student Log In</button></li>
                     <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Sign Up Free</button></li>
                  </ul>
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Support</p>
                  <ul className="space-y-3 text-sm font-medium text-gray-500">
                     {privacyContent._visible !== false && <li><button onClick={() => setPrivacyOpen(true)} className="hover:text-white transition-colors">Privacy</button></li>}
                     {termsContent._visible !== false && <li><button onClick={() => setTermsOpen(true)} className="hover:text-white transition-colors">Terms</button></li>}
                     <li><button onClick={() => setContactOpen(true)} className="hover:text-white transition-colors">Contact</button></li>
                  </ul>
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/[0.04] pt-8">
               <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                  {footerContent.copyright || '© 2026 InstitutePLUSE. Built for Jain College of Engineering.'}
               </p>
               <div className="flex gap-6">
                   <a 
                      href={footerContent.github || 'https://github.com/manthantp'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[9px] font-black text-gray-600 hover:text-white transition-colors tracking-widest uppercase"
                   >
                      GitHub
                   </a>
                   <a 
                      href={footerContent.linkedin || 'https://linkedin.com/in/manthantp'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[9px] font-black text-gray-600 hover:text-white transition-colors tracking-widest uppercase"
                   >
                      LinkedIn
                   </a>
               </div>
            </div>
         </div>
      </footer>

      {/* ─── FEATURE DETAIL MODAL ─── */}
      <AnimatePresence>
        {featureModal !== null && FEATURE_DETAILS[featureModal] && (() => {
          const f = FEATURE_DETAILS[featureModal]
          const FeatureIcon = f.icon
          const cardDesc = featuresContent.cards?.[featureModal]?.description || ''
          const bullets = (featuresContent.cards?.[featureModal]?.bullets || f.bullets || []).map(b => b.trim()).filter(Boolean)
          return (
            <motion.div
              key="feature-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFeatureModal(null)}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[#0a0f1e]/95 border border-white/[0.1] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
              >
                {/* Gradient glow */}
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${f.gradient} blur-[60px] rounded-full pointer-events-none opacity-60`} />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/[0.01] blur-[40px] rounded-full pointer-events-none" />

                {/* Close button */}
                <button
                  onClick={() => setFeatureModal(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all z-20"
                >
                  <X size={14} />
                </button>

                {/* Icon + Title */}
                <div className="relative z-10 flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: `${f.color}15`, borderColor: `${f.color}30` }}>
                    <FeatureIcon size={28} style={{ color: f.color }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{featuresContent.cards?.[featureModal]?.title || f.title}</h3>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-500">Feature Details</span>
                  </div>
                </div>

                {/* Description */}
                <p className="relative z-10 text-sm text-gray-400 leading-relaxed font-medium mb-6">
                  {cardDesc || 'Explore this powerful feature designed to make your campus experience smarter and more sustainable.'}
                </p>

                {/* Capability bullets */}
                <div className="relative z-10 space-y-3 mb-8">
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Key Capabilities</span>
                  {bullets.map((bullet, bi) => (
                    <motion.div
                      key={bi}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: bi * 0.08 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all"
                    >
                      <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: f.color }} />
                      <span className="text-xs text-gray-300 font-medium">{bullet}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => { setFeatureModal(null); navigate(user ? getDashboardPath() : '/register') }}
                  className="relative z-10 w-full py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  style={{ backgroundColor: f.color, boxShadow: `0 8px 24px ${f.color}30` }}
                >
                  {user ? 'Open Dashboard' : 'Get Started Free'}
                </button>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* ─── PRIVACY MODAL ─── */}
      <AnimatePresence>
        {privacyOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPrivacyOpen(false)}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0c1225]/95 border border-white/[0.08] rounded-3xl p-6 md:p-8 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[40px] rounded-full pointer-events-none" />
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-5">
                <span className="text-xs font-black uppercase tracking-widest text-green-400">
                  {privacyContent.sectionTitle || 'Privacy Policy'}
                </span>
                <button onClick={() => setPrivacyOpen(false)} className="text-gray-400 hover:text-white transition-colors text-sm">✕</button>
              </div>
              <div className="text-xs text-gray-400 space-y-4 leading-relaxed font-medium">
                {(privacyContent.items || [
                  { title: "1. Data Collection", content: "InstitutePLUSE securely logs carbon saving records (commute distances, vehicle modes, energy logs, and canteen meal choices) as well as class QR code check-ins." },
                  { title: "2. Secure Encryption", content: "All student and administrative data is transmitted via Secure Sockets Layer (SSL) and stored securely in our cloud database system, protected by row-level security (RLS)." },
                  { title: "3. Data Ownership", content: "We do not share your campus logs with third-party service providers. All logged records remain property of Jain College of Engineering." }
                ]).map((item, idx) => (
                  <div key={idx}>
                    <p className="text-white font-bold uppercase tracking-wider mb-1 text-[10px]">{item.title}</p>
                    <p>{item.content}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TERMS MODAL ─── */}
      <AnimatePresence>
        {termsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTermsOpen(false)}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0c1225]/95 border border-white/[0.08] rounded-3xl p-6 md:p-8 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[40px] rounded-full pointer-events-none" />
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-5">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  {termsContent.sectionTitle || 'Terms of Service'}
                </span>
                <button onClick={() => setTermsOpen(false)} className="text-gray-400 hover:text-white transition-colors text-sm">✕</button>
              </div>
              <div className="text-xs text-gray-400 space-y-4 leading-relaxed font-medium">
                {(termsContent.items || [
                  { title: "1. Usage License", content: "Students and faculty members of Jain College of Engineering are granted permission to access InstitutePLUSE for academic, sustainability tracking, and coordination activities." },
                  { title: "2. Accurate Reporting", content: "Users agree to log genuine, authentic commute methods and attendance sessions. Fraudulent logging of carbon logs or check-in credentials may result in account suspension." },
                  { title: "3. Service Access", content: "While we target 99.9% operational uptime, access to dashboard features may occasionally be paused for system enhancements and database maintenance." }
                ]).map((item, idx) => (
                  <div key={idx}>
                    <p className="text-white font-bold uppercase tracking-wider mb-1 text-[10px]">{item.title}</p>
                    <p>{item.content}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CONTACT MODAL ─── */}
      <AnimatePresence>
        {contactOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setContactOpen(false)}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#0c1225]/95 border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl relative text-center"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[40px] rounded-full pointer-events-none" />
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-5">
                <span className="text-xs font-black uppercase tracking-widest text-purple-400">Contact Us</span>
                <button onClick={() => setContactOpen(false)} className="text-gray-400 hover:text-white transition-colors text-sm">✕</button>
              </div>
              <div className="text-xs text-gray-400 space-y-4 leading-relaxed font-medium py-3">
                <p className="text-white text-sm font-black uppercase tracking-wider">{footerContent.collegeName || 'Jain College of Engineering'}</p>
                <p>For administrative deployment inquiries, feature requests, or technical support, contact the platform developer directly:</p>
                
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] inline-block w-full">
                  <p className="text-purple-400 font-mono font-black text-sm tracking-wide">{footerContent.contactEmail || 'manthantp.work@gmail.com'}</p>
                </div>
                
                <a 
                  href={`mailto:${footerContent.contactEmail || 'manthantp.work@gmail.com'}`}
                  className="inline-block mt-3 px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-purple-600/10"
                >
                  Send Direct Email
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── GPU-ACCELERATED CSS KEYFRAMES ─── */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
        @keyframes floatBg {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-25px) scale(1.04); }
        }
        @keyframes laserScan {
          0%, 100% { top: 0%; opacity: 0.7; }
          50% { top: 100%; opacity: 1; }
        }
        @keyframes scanSuccess {
          0%, 100% { opacity: 0; transform: translateY(6px) scale(0.95); }
          12%, 88% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

// Sub-component for individual FAQ Accordion items (pure react states, lag-free)
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/[0.04] bg-white/[0.005] rounded-2xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left text-sm font-black uppercase text-white hover:bg-white/[0.015] transition-colors"
      >
        <span>{question}</span>
        <ChevronRight size={16} className={`text-gray-400 transition-transform duration-300 ${open ? 'rotate-90 text-green-500' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-[13px] text-gray-400 leading-relaxed font-medium">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileFeatureCarousel({ cards, setFeatureModal }) {
  const [activeCard, setActiveCard] = useState(0)
  const containerRef = useRef(null)

  const handleScroll = () => {
    if (!containerRef.current) return
    const scrollLeft = containerRef.current.scrollLeft
    const width = containerRef.current.offsetWidth
    const index = Math.round(scrollLeft / (width || 1))
    setActiveCard(index)
  }

  const icons = [QrCode, Target, BookOpen, MapPin, Award, Utensils, BarChart3, Trophy, MessageSquare, Compass, Bell]
  const colors = ['#22c55e', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6']

  return (
    <div className="flex flex-col gap-4">
      {/* Horizontal Snap Scroll Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cards.map((card, i) => {
          const Icon = icons[i] || QrCode
          const color = colors[i] || '#22c55e'
          return (
            <div 
              key={i}
              onClick={() => setFeatureModal(i)}
              className="w-[82vw] shrink-0 snap-center rounded-3xl bg-[#0c1225]/40 border border-white/[0.06] p-6 backdrop-blur-xl flex flex-col justify-between min-h-[260px] active:scale-[0.98] transition-transform relative"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border" style={{ backgroundColor: `${color}15`, borderColor: `${color}25` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <h4 className="text-base font-black text-white uppercase tracking-tight mb-2">{card.title}</h4>
                <p className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-4">
                  {card.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">Tap to see details</span>
                <span className="text-[7px] font-black uppercase tracking-widest" style={{ color }}>{i + 1} / {cards.length}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-1.5 mt-2">
        {cards.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-300 ${activeCard === i ? 'w-4 bg-green-500' : 'w-1 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  )
}

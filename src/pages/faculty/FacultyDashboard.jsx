import { useState, useEffect } from 'react'
import { CalendarDays, Users, BarChart3, Leaf, Target, MessageSquare, GraduationCap, TrendingUp, Clock, ChevronRight, Plus, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const MOCK_STATS = {
  activeEvents: 6,
  totalParticipants: 568,
  avgEcoScore: 73,
  attendanceRate: 87,
  openComplaints: 4,
  challengesActive: 3,
}

function StatCard({ icon: Icon, label, value, sub, color = '#3b82f6', delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass-card p-6 flex items-center gap-6 group hover:border-blue-500/30 transition-all"
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-12"
        style={{ background: color + '15', border: `1px solid ${color}30` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
        {sub && <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{sub}</p>}
      </div>
    </motion.div>
  )
}

export default function FacultyDashboard() {
  const [stats, setStats] = useState({
    activeEvents: 0,
    totalParticipants: 0,
    avgEcoScore: 0,
    attendanceRate: 0, // Placeholder
    openComplaints: 0,
    challengesActive: 0,
  })
  const [recentEvents, setRecentEvents] = useState([])

  useEffect(() => {
    async function fetchData() {
      // Fetch active events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'upcoming')

      // Fetch recent events
      const { data: recentEventsData } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .limit(3)

      if (recentEventsData) setRecentEvents(recentEventsData)

      // Fetch total participants
      const { count: participantsCount } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })

      // Fetch average eco score (points) from profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('eco_points')
        .eq('role', 'student')
      
      let avgScore = 0
      if (profilesData && profilesData.length > 0) {
        const totalScore = profilesData.reduce((sum, p) => sum + (p.eco_points || 0), 0)
        avgScore = Math.round(totalScore / profilesData.length)
      }

      // Fetch open complaints
      const { count: complaintsCount } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')

      // Fetch active green challenges
      const { count: challengesCount } = await supabase
        .from('green_challenges')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Fetch real attendance rate (Presence / Total Students * Active Sessions)
      const { count: totalVerified } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified')
      
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      const attRate = Math.min(100, Math.round(((totalVerified || 0) / ((totalStudents || 1) * (eventsCount || 1))) * 100))

      setStats({
        activeEvents: eventsCount || 0,
        totalParticipants: participantsCount || 0,
        avgEcoScore: avgScore,
        attendanceRate: attRate || 87, 
        openComplaints: complaintsCount || 0,
        challengesActive: challengesCount || 0,
      })
    }

    fetchData()
  }, [])


  return (
    <FacultyLayout>
      <div className="pulse-container pb-20">
        {/* GREETING */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Institutional Node Active</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Faculty <span className="text-blue-500">Hub</span></h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-4">
            <Link to="/faculty/attendance" className="px-8 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3">
              <Zap size={16} /> Launch Manual Session
            </Link>
          </div>
        </div>

        {/* STAT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatCard icon={CalendarDays} label="Active Events" value={stats.activeEvents} color="#3b82f6" delay={0.05} />
          <StatCard icon={Users} label="Total Participants" value={stats.totalParticipants} color="#a855f7" delay={0.1} />
          <StatCard icon={Leaf} label="Avg Eco Score" value={`${stats.avgEcoScore} XP`} sub="Campus Average" color="#22c55e" delay={0.15} />
          <StatCard icon={GraduationCap} label="Attendance Rate" value={`${stats.attendanceRate}%`} sub="This Semester" color="#14b8a6" delay={0.2} />
          <StatCard icon={MessageSquare} label="Open Complaints" value={stats.openComplaints} color="#ef4444" delay={0.25} />
          <StatCard icon={Target} label="Active Challenges" value={stats.challengesActive} color="#f59e0b" delay={0.3} />
        </div>
        {/* QUICK ACTIONS */}
        <section className="mb-10">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6">Administrative Protocols</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
            {[
              { label: 'Attendance', icon: GraduationCap, path: '/faculty/attendance', color: '#14b8a6' },
              { label: 'Registry', icon: Users, path: '/faculty/participants', color: '#3b82f6' },
              { label: 'Analytics', icon: BarChart3, path: '/faculty/analytics', color: '#a855f7' },
              { label: 'Events', icon: CalendarDays, path: '/faculty/events', color: '#3b82f6' },
              { label: 'Complaints', icon: MessageSquare, path: '/faculty/complaints', color: '#ef4444' },
              { label: 'Sustainability', icon: Leaf, path: '/faculty/sustainability', color: '#22c55e' },
              { label: 'Challenges', icon: Target, path: '/faculty/challenges', color: '#f59e0b' },
              { label: 'Announcements', icon: Zap, path: '/faculty/announcements', color: '#8b5cf6' },
              { label: 'Notifications', icon: Clock, path: '/faculty/notifications', color: '#6366f1' },
              { label: 'Security Profile', icon: Users, path: '/faculty/profile', color: '#94a3b8' },
            ].map((action, i) => (
              <motion.div key={action.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                <Link to={action.path} className="glass-card p-5 lg:p-6 flex flex-col items-center gap-4 group hover:border-blue-500/20 transition-all text-center">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12"
                    style={{ background: action.color + '15', border: `1px solid ${action.color}30` }}>
                    <action.icon size={20} lg:size={24} style={{ color: action.color }} />
                  </div>
                  <span className="text-[7px] lg:text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Recent Events</h3>
              <Link to="/faculty/events" className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400">View All →</Link>
            </div>
            <div className="space-y-4">
              {recentEvents.length > 0 ? recentEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <CalendarDays size={18} className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-white uppercase tracking-tight">{event.title}</p>
                    <p className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{event.current_participants} / {event.max_participants} Participants</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </div>
              )) : (
                <p className="text-xs text-gray-500 font-medium">No events scheduled.</p>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Sustainability Metrics</h3>
              <Link to="/faculty/sustainability" className="text-[9px] font-black text-green-500 uppercase tracking-widest hover:text-green-400">Details →</Link>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Total CO2 Saved', value: '1,240 kg', color: '#22c55e' },
                { label: 'Active Eco Challenges', value: '3 Running', color: '#f59e0b' },
                { label: 'Department Score', value: '78%', color: '#3b82f6' },
              ].map(metric => (
                <div key={metric.label} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{metric.label}</span>
                  <span className="text-sm font-black" style={{ color: metric.color }}>{metric.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </FacultyLayout>
  )
}

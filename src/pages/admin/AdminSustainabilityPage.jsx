import { useState, useEffect } from 'react'
import { Leaf, TrendingDown, TrendingUp, Zap, Wind, Droplets, Target, ShieldCheck, Download, Calendar, Filter, BarChart3, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { exportReportPDF, exportTablePDF } from '../../lib/pdfExport'
import { getCarbonConfig } from '../../lib/carbonCalc'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7']

export default function AdminSustainabilityPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalCo2: 0, totalSaved: 0, activeUsers: 0, avgEfficiency: 0 })
  const [deptData, setDeptData] = useState([])
  const [selectedLog, setSelectedLog] = useState(null)
  const [carbonConfig, setCarbonConfig] = useState(null)

  const getPointsBreakdown = (log) => {
    if (!log) return []
    const cfg = carbonConfig || {
      base_points: 10,
      score_100_bonus: 60,
      score_90_bonus: 40,
      score_70_bonus: 20,
      eco_transport_bonus: 15,
      bus_bonus: 12,
      vegan_bonus: 15,
      vegetarian_bonus: 10,
      streak_30_bonus: 200,
      streak_7_bonus: 75,
      streak_3_bonus: 30,
      first_log_bonus: 50
    }

    const breakdown = []
    
    // 1. Base Logging
    const basePoints = cfg.base_points ?? 10
    if (basePoints > 0) {
      breakdown.push({ name: 'Base Logging Reward', points: basePoints })
    }

    // 2. Eco Score Bonus
    let scoreBonus = 0
    let scoreName = ''
    if (log.eco_score >= 100) {
      scoreBonus = cfg.score_100_bonus ?? 60
      scoreName = 'Perfect Eco Score (100) Bonus'
    } else if (log.eco_score >= 90) {
      scoreBonus = cfg.score_90_bonus ?? 40
      scoreName = 'Excellent Eco Score (90+) Bonus'
    } else if (log.eco_score >= 70) {
      scoreBonus = cfg.score_70_bonus ?? 20
      scoreName = 'Good Eco Score (70+) Bonus'
    }
    if (scoreBonus > 0) {
      breakdown.push({ name: scoreName, points: scoreBonus })
    }

    // 3. Transport Bonus
    const hasEcoTransport = log.transport_detail?.some(e =>
      ['bicycle', 'walking'].includes(e.mode)
    )
    const hasBus = log.transport_detail?.some(e =>
      ['college_bus'].includes(e.mode)
    )
    if (hasEcoTransport) {
      breakdown.push({ name: 'Active Transit (Bicycle/Walking) Bonus', points: cfg.eco_transport_bonus ?? 15 })
    }
    if (hasBus) {
      breakdown.push({ name: 'Public Transit (College Bus) Bonus', points: cfg.bus_bonus ?? 12 })
    }

    // 4. Food Bonus
    if (log.meals_detail && log.meals_detail.length > 0) {
      const meals = {}
      log.meals_detail.forEach(m => {
        meals[m.slot] = m.type
      })
      const values = Object.values(meals)
      if (values.length > 0) {
        const allVegetarian = values.every(m => m === 'vegan' || m === 'vegetarian' || m === 'skipped')
        const allVegan = values.every(m => m === 'vegan' || m === 'skipped')
        if (allVegan) {
          breakdown.push({ name: 'All Vegan Meals Bonus', points: cfg.vegan_bonus ?? 15 })
        } else if (allVegetarian) {
          breakdown.push({ name: 'All Vegetarian Meals Bonus', points: cfg.vegetarian_bonus ?? 10 })
        }
      }
    }

    // Calculate difference to identify streaks/first log
    const calculatedSum = breakdown.reduce((sum, item) => sum + item.points, 0)
    const diff = (log.eco_points_earned || 0) - calculatedSum

    if (diff > 0) {
      if (diff === (cfg.first_log_bonus ?? 50)) {
        breakdown.push({ name: 'First Ever Log Bonus', points: diff })
      } else if (diff === (cfg.streak_3_bonus ?? 30)) {
        breakdown.push({ name: '3-Day Streak Bonus', points: diff })
      } else if (diff === (cfg.streak_7_bonus ?? 75)) {
        breakdown.push({ name: '7-Day Streak Bonus', points: diff })
      } else if (diff === (cfg.streak_30_bonus ?? 200)) {
        breakdown.push({ name: '30-Day Streak Bonus', points: diff })
      } else if (diff === ((cfg.first_log_bonus ?? 50) + (cfg.streak_3_bonus ?? 30))) {
        breakdown.push({ name: 'First Log Bonus', points: cfg.first_log_bonus ?? 50 })
        breakdown.push({ name: '3-Day Streak Bonus', points: cfg.streak_3_bonus ?? 30 })
      } else if (diff === ((cfg.first_log_bonus ?? 50) + (cfg.streak_7_bonus ?? 75))) {
        breakdown.push({ name: 'First Log Bonus', points: cfg.first_log_bonus ?? 50 })
        breakdown.push({ name: '7-Day Streak Bonus', points: cfg.streak_7_bonus ?? 75 })
      } else if (diff === ((cfg.first_log_bonus ?? 50) + (cfg.streak_30_bonus ?? 200))) {
        breakdown.push({ name: 'First Log Bonus', points: cfg.first_log_bonus ?? 50 })
        breakdown.push({ name: '30-Day Streak Bonus', points: cfg.streak_30_bonus ?? 200 })
      } else {
        breakdown.push({ name: 'Streak / Special Eco Bonus', points: diff })
      }
    }

    return breakdown
  }

  const handleApproveLog = async (log) => {
    try {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('eco_points, total_co2_kg')
        .eq('id', log.student_id)
        .single()
      
      if (profErr) throw profErr;

      const { error: updErr } = await supabase
        .from('profiles')
        .update({
          eco_points: (prof.eco_points || 0) + (log.eco_points_earned || 0),
          total_co2_kg: (prof.total_co2_kg || 0) + Number(log.total_kg || 0)
        })
        .eq('id', log.student_id)

      if (updErr) throw updErr;

      const { error: logErr } = await supabase
        .from('carbon_logs')
        .update({ status: 'approved', log_status: 'approved', flagged: false })
        .eq('id', log.id)

      if (logErr) throw logErr;

      await supabase.from('student_notifications').insert({
        student_id: log.student_id,
        title: 'Carbon Log Approved',
        message: `Your carbon log for ${new Date(log.log_date).toLocaleDateString()} has been verified. +${log.eco_points_earned} XP added!`,
        type: 'success',
        is_read: false
      });

      toast.success('Log entry approved and student points credited!');
      setLogs(prev => prev.map(l => l.id === log.id ? { ...l, status: 'approved', log_status: 'approved' } : l));
      setSelectedLog(null);
    } catch (err) {
      console.error('Approve error:', err);
      toast.error('Failed to approve log: ' + err.message);
    }
  }

  const handleRejectLog = async (log) => {
    if (!window.confirm("Are you sure you want to reject this log entry? The student's streak will reset to 0, and they will receive a warning.")) return;
    try {
      const { error: logErr } = await supabase
        .from('carbon_logs')
        .update({ status: 'rejected', log_status: 'rejected' })
        .eq('id', log.id)

      if (logErr) throw logErr;

      const { error: streakErr } = await supabase
        .from('profiles')
        .update({ logging_streak: 0 })
        .eq('id', log.student_id)

      if (streakErr) throw streakErr;

      const { count: rejectedCount } = await supabase
        .from('carbon_logs')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', log.student_id)
        .eq('status', 'rejected')

      const { data: instData } = await supabase
        .from('institution_settings')
        .select('carbon_config')
        .eq('id', 1)
        .single();
      const config = getCarbonConfig(instData?.carbon_config);
      const maxBans = config.validation_limits.max_rejections_before_ban ?? 2;

      let banAlert = '';
      if ((rejectedCount || 0) >= maxBans) {
        await supabase
          .from('profiles')
          .update({ 
            sustainability_restricted: true,
            restriction_reason: 'Exceeded maximum allowable carbon log rejections.',
            restricted_at: new Date().toISOString()
          })
          .eq('id', log.student_id);
        banAlert = ' Student has been suspended from leaderboards.';
      }

      await supabase.from('student_notifications').insert({
        student_id: log.student_id,
        title: 'Carbon Log Rejected',
        message: `Your carbon log for ${new Date(log.log_date).toLocaleDateString()} was audited and rejected due to false entries. Your logging streak has been reset to 0.`,
        type: 'warning',
        is_read: false
      });

      toast.success(`Log entry rejected. Streak penalized.${banAlert}`);
      setLogs(prev => prev.map(l => l.id === log.id ? { ...l, status: 'rejected', log_status: 'rejected' } : l));
      setSelectedLog(null);
    } catch (err) {
      console.error('Reject error:', err);
      toast.error('Failed to reject log: ' + err.message);
    }
  }

  const handleInvalidateLog = async (log) => {
    if (!window.confirm("Are you sure you want to retroactively invalidate this approved entry? This will revert the student's points and total offset calculations, and reset their streak.")) return;
    try {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('eco_points, total_co2_kg')
        .eq('id', log.student_id)
        .single()
      
      if (profErr) throw profErr;

      const pointsToDeduct = log.eco_points_earned || 0;
      const co2ToDeduct = Number(log.total_kg || 0);

      const { error: updErr } = await supabase
        .from('profiles')
        .update({
          eco_points: Math.max(0, (prof.eco_points || 0) - pointsToDeduct),
          total_co2_kg: Math.max(0, (prof.total_co2_kg || 0) - co2ToDeduct),
          logging_streak: 0
        })
        .eq('id', log.student_id)

      if (updErr) throw updErr;

      const { error: logErr } = await supabase
        .from('carbon_logs')
        .update({ status: 'rejected', log_status: 'rejected' })
        .eq('id', log.id)

      if (logErr) throw logErr;

      const { count: rejectedCount } = await supabase
        .from('carbon_logs')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', log.student_id)
        .eq('status', 'rejected')

      const { data: instData } = await supabase
        .from('institution_settings')
        .select('carbon_config')
        .eq('id', 1)
        .single();
      const config = getCarbonConfig(instData?.carbon_config);
      const maxBans = config.validation_limits.max_rejections_before_ban ?? 2;

      let banAlert = '';
      if ((rejectedCount || 0) >= maxBans) {
        await supabase
          .from('profiles')
          .update({ 
            sustainability_restricted: true,
            restriction_reason: 'Exceeded maximum allowable carbon log rejections.',
            restricted_at: new Date().toISOString()
          })
          .eq('id', log.student_id);
        banAlert = ' Student has been suspended from leaderboards.';
      }

      await supabase.from('student_notifications').insert({
        student_id: log.student_id,
        title: 'Carbon Log Invalidated',
        message: `Your approved carbon log for ${new Date(log.log_date).toLocaleDateString()} was audited and invalidated. Points reverted, and streak reset to 0.`,
        type: 'warning',
        is_read: false
      });

      toast.success(`Log entry invalidated. Points reverted and streak penalized.${banAlert}`);
      setLogs(prev => prev.map(l => l.id === log.id ? { ...l, status: 'rejected', log_status: 'rejected' } : l));
      setSelectedLog(null);
    } catch (err) {
      console.error('Invalidate error:', err);
      toast.error('Failed to invalidate log: ' + err.message);
    }
  }

  const handleUnrejectLog = async (log) => {
    if (!window.confirm("Do you want to unreject and approve this entry? This will restore the student's points and total offset calculations.")) return;
    try {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('eco_points, total_co2_kg')
        .eq('id', log.student_id)
        .single()
      
      if (profErr) throw profErr;

      const { error: updErr } = await supabase
        .from('profiles')
        .update({
          eco_points: (prof.eco_points || 0) + (log.eco_points_earned || 0),
          total_co2_kg: (prof.total_co2_kg || 0) + Number(log.total_kg || 0)
        })
        .eq('id', log.student_id)

      if (updErr) throw updErr;

      const { error: logErr } = await supabase
        .from('carbon_logs')
        .update({ status: 'approved', log_status: 'approved', flagged: false })
        .eq('id', log.id)

      if (logErr) throw logErr;

      const { count: rejectedCount } = await supabase
        .from('carbon_logs')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', log.student_id)
        .eq('status', 'rejected')

      const { data: instData } = await supabase
        .from('institution_settings')
        .select('carbon_config')
        .eq('id', 1)
        .single();
      const config = getCarbonConfig(instData?.carbon_config);
      const maxBans = config.validation_limits.max_rejections_before_ban ?? 2;

      let unbanAlert = '';
      if ((rejectedCount || 0) < maxBans) {
        await supabase
          .from('profiles')
          .update({ 
            sustainability_restricted: false,
            restriction_reason: null,
            restricted_at: null
          })
          .eq('id', log.student_id);
        unbanAlert = ' Student has been reinstated on leaderboards.';
      }

      await supabase.from('student_notifications').insert({
        student_id: log.student_id,
        title: 'Carbon Log Approved (Audit Restored)',
        message: `Your carbon log for ${new Date(log.log_date).toLocaleDateString()} was reconsidered and approved. Points restored!`,
        type: 'success',
        is_read: false
      });

      toast.success(`Log entry approved. Student points credited successfully.${unbanAlert}`);
      setLogs(prev => prev.map(l => l.id === log.id ? { ...l, status: 'approved', log_status: 'approved' } : l));
      setSelectedLog(null);
    } catch (err) {
      console.error('Unreject error:', err);
      toast.error('Failed to unreject log: ' + err.message);
    }
  }

  const handleResetToPendingLog = async (log) => {
    if (!window.confirm("Move this entry back to Pending Review? This will remove its rejected state but will not credit points yet.")) return;
    try {
      const { error: logErr } = await supabase
        .from('carbon_logs')
        .update({ status: 'pending', log_status: 'quarantined', flagged: true })
        .eq('id', log.id)

      if (logErr) throw logErr;

      const { count: rejectedCount } = await supabase
        .from('carbon_logs')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', log.student_id)
        .eq('status', 'rejected')

      const { data: instData } = await supabase
        .from('institution_settings')
        .select('carbon_config')
        .eq('id', 1)
        .single();
      const config = getCarbonConfig(instData?.carbon_config);
      const maxBans = config.validation_limits.max_rejections_before_ban ?? 2;

      let unbanAlert = '';
      if ((rejectedCount || 0) < maxBans) {
        await supabase
          .from('profiles')
          .update({ 
            sustainability_restricted: false,
            restriction_reason: null,
            restricted_at: null
          })
          .eq('id', log.student_id);
        unbanAlert = ' Student has been reinstated on leaderboards.';
      }

      await supabase.from('student_notifications').insert({
        student_id: log.student_id,
        title: 'Carbon Log Reconsidered',
        message: `Your carbon log for ${new Date(log.log_date).toLocaleDateString()} was moved back to pending verification.`,
        type: 'info',
        is_read: false
      });

      toast.success(`Log entry set back to pending review.${unbanAlert}`);
      setLogs(prev => prev.map(l => l.id === log.id ? { ...l, status: 'pending', log_status: 'quarantined' } : l));
      setSelectedLog(null);
    } catch (err) {
      console.error('Reset to pending error:', err);
      toast.error('Failed to reset log: ' + err.message);
    }
  }


  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      const { data: logsData } = await supabase
        .from('carbon_logs')
        .select('*, profiles(full_name, usn, department)')
        .order('log_date', { ascending: false })

      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

      try {
        const { data: instData } = await supabase
          .from('institution_settings')
          .select('carbon_config')
          .eq('id', 1)
          .single()
        if (instData) {
          setCarbonConfig(getCarbonConfig(instData.carbon_config))
        }
      } catch (e) {
        console.error('Failed to load carbon config:', e)
      }
      
      if (logsData && logsData.length > 0) {
        setLogs(logsData)
        const totalCo2 = logsData.reduce((acc, curr) => acc + Number(curr.total_kg || 0), 0)
        const totalSaved = (totalCo2 * 0.15) 
        
        setStats({
          totalCo2: totalCo2.toFixed(1),
          totalSaved: totalSaved.toFixed(1),
          activeUsers: usersCount || 0,
          avgEfficiency: ((totalSaved / (totalSaved + totalCo2)) * 100 || 0).toFixed(1)
        })

        // Process Department Data
        const deptMap = {}
        logsData.forEach(log => {
          const dept = log.profiles?.department || 'General'
          if (!deptMap[dept]) deptMap[dept] = { name: dept, value: 0 }
          deptMap[dept].value += 1
        })
        setDeptData(Object.values(deptMap))
      } else {
        setLogs([])
        setStats({ totalCo2: 0, totalSaved: 0, activeUsers: 0, avgEfficiency: 0 })
        setDeptData([])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Realtime sync: auto-refresh when carbon_logs change
  useEffect(() => {
    const channel = supabase
      .channel('admin_sustainability_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'carbon_logs' }, () => {
        // Re-fetch all data when any carbon log changes
        async function refetch() {
          const { data: logsData } = await supabase
            .from('carbon_logs')
            .select('*, profiles(full_name, usn, department)')
            .order('log_date', { ascending: false })

          const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

          if (logsData && logsData.length > 0) {
            setLogs(logsData)
            const totalCo2 = logsData.reduce((acc, curr) => acc + Number(curr.total_kg || 0), 0)
            const totalSaved = (totalCo2 * 0.15)
            setStats({
              totalCo2: totalCo2.toFixed(1),
              totalSaved: totalSaved.toFixed(1),
              activeUsers: usersCount || 0,
              avgEfficiency: ((totalSaved / (totalSaved + totalCo2)) * 100 || 0).toFixed(1)
            })
            const deptMap = {}
            logsData.forEach(log => {
              const dept = log.profiles?.department || 'General'
              if (!deptMap[dept]) deptMap[dept] = { name: dept, value: 0 }
              deptMap[dept].value += 1
            })
            setDeptData(Object.values(deptMap))
          }
        }
        refetch()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleGenerateReport = () => {
    exportReportPDF({
      title: 'Sustainability Impact Report',
      subtitle: `Campus-wide Environmental Analysis • ${new Date().toLocaleDateString()}`,
      data: {
        cumulative_co2_flux: `${stats.totalCo2} kg`,
        offset_protocol: `${stats.totalSaved} kg`,
        ecosystem_nodes: stats.activeUsers,
        efficiency_index: `${stats.avgEfficiency}%`,
        department_breakdown: deptData,
        recent_logs: logs.slice(0, 30).map(l => ({
          date: l.log_date,
          student: l.profiles?.full_name || 'N/A',
          co2_kg: Number(l.total_kg || 0).toFixed(2),
          eco_points: l.eco_points_earned || 0
        }))
      },
      filename: `sustainability-report-${new Date().getTime()}`
    })
    toast.success('Sustainability Report Generated as PDF')
  }

  const handleDownloadTablePDF = () => {
    if (!logs || logs.length === 0) {
      toast.error('No logs available for export')
      return
    }

    const headers = ['Time Node', 'Student', 'USN', 'Carbon Flux', 'Eco-Bonus', 'Category']
    const rows = logs.map(log => [
      new Date(log.log_date).toLocaleDateString(),
      log.profiles?.full_name || 'N/A',
      log.profiles?.usn || 'N/A',
      `${Number(log.total_kg || 0).toFixed(2)} kg`,
      `+${log.eco_points_earned || 0} Pts`,
      'Pulse Log'
    ])

    exportTablePDF({
      title: 'Temporal Log Stream Manifest',
      subtitle: 'Campus-wide Carbon Entry Telemetry',
      headers,
      rows,
      filename: `temporal_log_stream_${new Date().getTime()}`,
      summaryCards: [
        { label: 'Total Logs', value: logs.length },
        { label: 'Cumulative CO2', value: `${stats.totalCo2} kg` },
        { label: 'Total Saved', value: `${stats.totalSaved} kg` }
      ],
      studentName: 'System Sustainability Auditor',
      theme: 'cyber'
    })
    toast.success('Temporal Log Manifest exported as PDF ✓')
  }

  const formatName = (key) => {
    if (!key) return ''
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Campus Carbon Offset Index</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Sustainability Hub</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
              Campus-wide Environmental Flux Analysis
            </p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={handleGenerateReport}
               className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
             >
                Generate Report
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: 'Cumulative CO2 Flux', value: `${stats.totalCo2} kg`, icon: Wind, color: 'text-red-500', bg: 'bg-red-500/10' },
             { label: 'Offset Protocol', value: `${stats.totalSaved} kg`, icon: Leaf, color: 'text-rose-500', bg: 'bg-rose-500/10' },
             { label: 'Ecosystem Nodes', value: stats.activeUsers, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
             { label: 'Efficiency Index', value: `${stats.avgEfficiency}%`, icon: Target, color: 'text-red-600', bg: 'bg-red-600/10' },
           ].map((s, i) => (
             <motion.div 
               key={s.label}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl relative overflow-hidden group"
             >
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} mb-4 transition-transform group-hover:rotate-12`}>
                   <s.icon size={22} />
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-2xl font-black text-white tracking-tighter">{s.value}</p>
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl"
           >
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Node Distribution (By Dept)</h3>
                 <BarChart3 size={18} className="text-red-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                    />
                    <Bar dataKey="value" fill="#dc2626" radius={[6, 6, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl"
           >
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Ecosystem Health Index</h3>
                 <ShieldCheck size={18} className="text-red-500" />
              </div>
              <div className="flex items-center justify-center">
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                       <Pie
                          data={[
                             { name: 'Offset', value: parseFloat(stats.totalSaved) },
                             { name: 'Residual', value: parseFloat(stats.totalCo2) }
                          ]}
                          cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value"
                       >
                          <Cell fill="#dc2626" />
                          <Cell fill="#334155" />
                       </Pie>
                       <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute flex flex-col items-center justify-center">
                    <p className="text-3xl font-black text-white tracking-tighter">{stats.avgEfficiency}%</p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Efficient</p>
                 </div>
              </div>
           </motion.div>
        </div>

        <div className="space-y-4">
           <div className="grid grid-cols-1 gap-4 lg:hidden">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                   <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[32px]">
                   <p className="text-xs font-black text-gray-600 uppercase tracking-widest">No Logs</p>
                </div>
              ) : logs.slice(0, 10).map((log, i) => (
                <div 
                  key={log.id} 
                  onClick={() => setSelectedLog(log)}
                  className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-xl cursor-pointer hover:border-red-500/30 transition-all"
                >
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">{new Date(log.log_date).toLocaleDateString()}</span>
                      {log.status === 'pending' ? (
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-widest animate-pulse">⚠️ Suspicious</span>
                      ) : log.status === 'rejected' ? (
                        <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[8px] font-black text-red-500 uppercase tracking-widest">❌ Rejected</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest">+{log.eco_points_earned} Pts</span>
                      )}
                   </div>
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Student</p>
                         <p className="text-xs font-black text-white truncate max-w-[120px]">{log.profiles?.full_name || 'N/A'}</p>
                         <p className="text-[8px] font-black text-gray-500 mt-1">{log.profiles?.usn || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Carbon Flux</p>
                         <p className="text-xs font-black text-white">{(log.total_kg || 0).toFixed(2)} kg</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           <div className="hidden lg:block bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl">
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Temporal Log Stream</h3>
                 <div className="flex items-center gap-4">
                    <Download 
                      size={14} 
                      onClick={handleDownloadTablePDF}
                      className="text-gray-500 hover:text-white cursor-pointer transition-colors" 
                    />
                 </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5">
                      {['Time Node', 'Student', 'USN', 'Carbon Flux', 'Eco-Bonus', 'Category'].map(h => (
                        <th key={h} className="px-8 py-5 text-[9px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                       <tr><td colSpan={6} className="py-20 text-center"><div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto" /></td></tr>
                     ) : logs.length === 0 ? (
                       <tr><td colSpan={6} className="py-20 text-center text-xs font-black text-gray-600 uppercase tracking-widest">No Log Data Recorded</td></tr>
                     ) : logs.slice(0, 10).map((log, i) => (
                       <tr 
                         key={log.id} 
                         onClick={() => setSelectedLog(log)}
                         className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                       >
                         <td className="px-8 py-5">
                            <span className="text-[10px] font-black text-white uppercase tracking-tight">{new Date(log.log_date).toLocaleDateString()}</span>
                         </td>
                         <td className="px-8 py-5">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{log.profiles?.full_name || 'N/A'}</span>
                         </td>
                         <td className="px-8 py-5">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">{log.profiles?.usn || 'N/A'}</span>
                         </td>
                         <td className="px-8 py-5 font-black text-white text-xs">{(log.total_kg || 0).toFixed(2)} kg</td>
                         <td className="px-8 py-5 font-black text-green-500 text-xs">+{(log.eco_points_earned || 0)} Pts</td>
                         <td className="px-8 py-5">
                            {log.status === 'pending' ? (
                              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-widest animate-pulse">⚠️ Suspicious</span>
                            ) : log.status === 'rejected' ? (
                              <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[8px] font-black text-red-500 uppercase tracking-widest">❌ Rejected</span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest">✓ Verified</span>
                            )}
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 lg:p-6 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md pointer-events-auto"
              onClick={() => setSelectedLog(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl lg:rounded-[48px] p-6 lg:p-10 shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
              style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
            >
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                  <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter italic">Log Telemetry Detail</h2>
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1">
                    {selectedLog.profiles?.full_name} ({selectedLog.profiles?.usn || 'No USN'})
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)} 
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-1 pb-4">
                <div className="grid grid-cols-3 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-center">
                    <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest">Total CO2</span>
                    <span className="text-sm lg:text-base font-black text-white">{Number(selectedLog.total_kg || 0).toFixed(2)} kg</span>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest">Eco Score</span>
                    <span className="text-sm lg:text-base font-black text-green-500">{selectedLog.eco_score || 0}/100</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest">Points</span>
                    <span className="text-sm lg:text-base font-black text-yellow-500">+{selectedLog.eco_points_earned || 0} XP</span>
                  </div>
                </div>

                {/* Points Breakdown Panel */}
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
                  <span className="block text-[8px] font-black text-amber-500 uppercase tracking-widest mb-3">Eco-Points Allocation Breakdown</span>
                  <div className="space-y-2">
                    {getPointsBreakdown(selectedLog).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] uppercase tracking-wider">
                        <span className="text-gray-400 font-bold">{item.name}</span>
                        <span className="text-green-400 font-black">+{item.points} XP</span>
                      </div>
                    ))}
                    {getPointsBreakdown(selectedLog).length === 0 && (
                      <div className="text-[10px] text-gray-500 italic uppercase tracking-widest text-center py-1">No points allocated</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Transport: {formatName(selectedLog.transport_mode || 'None')}
                      </span>
                      <span className="text-xs font-black text-gray-400">{(selectedLog.transport_kg || 0)} kg</span>
                    </div>
                    {selectedLog.transport_detail && selectedLog.transport_detail.length > 0 ? (
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider space-y-1 pl-3.5">
                        {selectedLog.transport_detail.map((t, idx) => (
                          <div key={idx}>• {t.km} km via {formatName(t.mode)}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9px] text-gray-600 uppercase tracking-widest pl-3.5 italic">No details logged</span>
                    )}
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        Electricity (Devices)
                      </span>
                      <span className="text-xs font-black text-gray-400">{(selectedLog.electricity_kg || 0)} kg</span>
                    </div>
                    {selectedLog.devices_detail && selectedLog.devices_detail.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 pl-3.5 text-[10px] text-gray-500 uppercase tracking-wider">
                        {selectedLog.devices_detail.map((d, idx) => (
                          <div key={idx}>• {formatName(d.device_key)}: {d.hours} hrs</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9px] text-gray-600 uppercase tracking-widest pl-3.5 italic">No devices logged</span>
                    )}
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        Nutrition & Meals
                      </span>
                      <span className="text-xs font-black text-gray-400">{(selectedLog.food_kg || 0)} kg</span>
                    </div>
                    {selectedLog.meals_detail && selectedLog.meals_detail.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 pl-3.5 text-[10px] text-gray-500 uppercase tracking-wider">
                        {selectedLog.meals_detail.map((m, idx) => (
                          <div key={idx}>
                            <span className="text-gray-400 font-bold">{formatName(m.slot)}</span>: {formatName(m.type)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9px] text-gray-600 uppercase tracking-widest pl-3.5 italic">No meals logged</span>
                    )}
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        Water Usage
                      </span>
                      <span className="text-xs font-black text-gray-400">{(selectedLog.water_kg || 0)} kg</span>
                    </div>
                    {selectedLog.water_detail ? (
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider pl-3.5 space-y-1">
                        <div>• Shower Type: {formatName(selectedLog.water_detail.shower_type || 'None')}</div>
                        <div>• Usage Intensity: {formatName(selectedLog.water_detail.general_level || 'Medium')}</div>
                      </div>
                    ) : (
                      <span className="text-[9px] text-gray-600 uppercase tracking-widest pl-3.5 italic">No details logged</span>
                    )}
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        Waste Audit
                      </span>
                      <span className="text-xs font-black text-gray-400">{(selectedLog.waste_kg || 0)} kg</span>
                    </div>
                    {selectedLog.waste_detail && selectedLog.waste_detail.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 pl-3.5 text-[10px] text-gray-500 uppercase tracking-wider">
                        {selectedLog.waste_detail.map((w, idx) => (
                          <div key={idx}>• {formatName(w.type)}: {w.kg} kg</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9px] text-gray-600 uppercase tracking-widest pl-3.5 italic">No waste logged</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Moderation Controls */}
              {selectedLog.status === 'pending' && (
                <div className="flex gap-4 pt-4 border-t border-white/5 flex-shrink-0 relative z-[99999] pointer-events-auto">
                  <button
                    onClick={() => handleApproveLog(selectedLog)}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all cursor-pointer"
                  >
                    Approve Entry & Credit XP
                  </button>
                  <button
                    onClick={() => handleRejectLog(selectedLog)}
                    className="flex-1 py-3 bg-red-600/20 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Reject & Flag Abuse
                  </button>
                </div>
              )}
              {selectedLog.status === 'approved' && (
                <div className="pt-4 border-t border-white/5 flex-shrink-0 flex justify-end relative z-[99999] pointer-events-auto">
                  <button
                    onClick={() => handleInvalidateLog(selectedLog)}
                    className="px-6 py-2.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500 hover:text-white text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Retroactively Invalidate Log
                  </button>
                </div>
              )}
              {selectedLog.status === 'rejected' && (
                <div className="pt-4 border-t border-white/5 flex-shrink-0 flex gap-4 relative z-[99999] pointer-events-auto">
                  <button
                    onClick={() => handleUnrejectLog(selectedLog)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all cursor-pointer"
                  >
                    Unreject & Approve Log
                  </button>
                  <button
                    onClick={() => handleResetToPendingLog(selectedLog)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Reset to Pending Review
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </AdminLayout>
  )
}

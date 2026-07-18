import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TreePine, Leaf, Share2, MessageSquare, Award } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion } from 'framer-motion'
import {
  calculateTotalAbsorption,
  getGreenCoverSummary,
  calculateCampusGreenScore,
  getGreenScoreTier,
  GREEN_SCORE_TIERS,
} from '../../lib/greenCover'
import toast from 'react-hot-toast'

export default function CarbonBalancePage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [greenScore, setGreenScore] = useState(null)
  const [greenTier, setGreenTier] = useState(null)
  const [totalAbsorbed, setTotalAbsorbed] = useState(0)
  const [totalStudentCO2, setTotalStudentCO2] = useState(0)
  const [isGreen, setIsGreen] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      // 1. Fetch green cover items
      const { data: items } = await supabase
        .from('campus_green_cover')
        .select('*')
        .order('zone')

      const safeItems = items || []
      const summ = getGreenCoverSummary(safeItems)
      setSummary(summ)

      const absorbed = calculateTotalAbsorption(safeItems)
      setTotalAbsorbed(absorbed)

      // 2. Fetch today's ALL students CO2 for green status check
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      const { data: todayLogs } = await supabase
        .from('carbon_logs')
        .select('total_kg')
        .eq('log_date', today)

      let studentCO2 = (todayLogs || []).reduce((a, l) => a + Number(l.total_kg || 0), 0)

      if (studentCO2 === 0) {
        const { data: yestLogs } = await supabase
          .from('carbon_logs')
          .select('total_kg')
          .eq('log_date', yesterday)
        studentCO2 = (yestLogs || []).reduce((a, l) => a + Number(l.total_kg || 0), 0)
      }
      setTotalStudentCO2(studentCO2)
      setIsGreen(absorbed >= studentCO2 || studentCO2 === 0)

      // 3. Campus Green Score
      const scoreResult = calculateCampusGreenScore(safeItems, studentCO2)
      setGreenScore(scoreResult)
      setGreenTier(getGreenScoreTier(scoreResult.score))
    } catch (err) {
      console.error('Green cover fetch error:', err)
      toast.error('Failed to load green cover data')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const text = greenTier
      ? `🌍 Our campus has a Green Score of ${greenScore?.score}/100 — ${greenTier.label}! Track sustainability on InstitutePLUSE!`
      : '🌱 Track campus sustainability on InstitutePLUSE!'
    try {
      await navigator.share({ title: 'Campus Green Score', text, url: window.location.href })
    } catch {
      navigator.clipboard.writeText(text)
      toast.success('Stats copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-green-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Loading Green Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[55%] h-[40%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[45%] h-[35%] rounded-full bg-emerald-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-5 pt-6 max-w-2xl mx-auto">

        {/* ── TOP BAR ── */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="hidden lg:flex w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-0.5">Campus Sustainability</p>
              <h1 className="text-xl font-black text-white uppercase tracking-tight leading-none">Green Campus</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Share2 size={16} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <TreePine size={18} />
            </div>
          </div>
        </header>

        {/* ── CAMPUS GREEN STATUS BANNER ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[28px] p-5 mb-6 border ${
            isGreen
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isGreen ? '🌍' : '⚠️'}</span>
            <div>
              <p className={`text-[12px] font-black uppercase tracking-widest ${isGreen ? 'text-green-400' : 'text-amber-400'}`}>
                {isGreen
                  ? 'Our Campus is Green! 🌿'
                  : 'Campus Needs More Green Cover'}
              </p>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                {isGreen
                  ? 'The campus greenery is keeping our environment healthy and sustainable.'
                  : 'We need to plant more trees and add green cover to improve campus sustainability.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── CAMPUS GREEN SCORE ── */}
        {greenScore && greenTier && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[40px] p-6 mb-6 border ${greenTier.bgClass} ${greenTier.borderClass} relative overflow-hidden backdrop-blur-xl`}
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.04] pointer-events-none">
              <Award size={140} />
            </div>

            <div className="flex items-center gap-2 mb-5">
              <Award size={16} className={greenTier.textClass} />
              <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Campus Green Score</h3>
            </div>

            <div className="flex flex-col items-center gap-5">
              {/* Large Ring Gauge */}
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <motion.circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke={greenTier.color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(greenScore.score / 100) * 314.16} 314.16`}
                    initial={{ strokeDasharray: '0 314.16' }}
                    animate={{ strokeDasharray: `${(greenScore.score / 100) * 314.16} 314.16` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">{greenScore.score}</span>
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">/100</span>
                </div>
              </div>

              {/* Tier Label */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{greenTier.emoji}</span>
                <p className={`text-base font-black ${greenTier.textClass}`}>{greenTier.label}</p>
              </div>

              {/* Pillar Breakdown */}
              <div className="w-full space-y-3">
                {Object.values(greenScore.pillars).map(p => (
                  <div key={p.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{p.label}</span>
                      <span className="text-[8px] font-black text-white">{p.score}/{p.max}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.score / p.max) * 100}%` }}
                        transition={{ duration: 1, ease: 'circOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: greenTier.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier Scale */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-3 text-center">Score Tiers</p>
              <div className="flex justify-between gap-1">
                {GREEN_SCORE_TIERS.slice().reverse().map(t => (
                  <div
                    key={t.label}
                    className={`flex-1 text-center py-2 rounded-xl border transition-all ${
                      greenTier.label === t.label
                        ? `${t.bgClass} ${t.borderClass} scale-105`
                        : 'bg-white/[0.02] border-white/5 opacity-50'
                    }`}
                  >
                    <span className="text-sm block">{t.emoji}</span>
                    <p className={`text-[6px] font-black uppercase tracking-wider mt-0.5 ${greenTier.label === t.label ? t.textClass : 'text-gray-600'}`}>
                      {t.label.replace(' Campus', '')}
                    </p>
                    <p className="text-[6px] text-gray-600">{t.min}+</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── GREEN COVER SUMMARY ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-[40px] p-6 mb-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Campus Green Cover</h3>
            <Leaf size={16} className="text-green-500" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { emoji: '🌳', label: 'Large Trees', val: summary?.largeTrees ?? 0 },
              { emoji: '🌲', label: 'Medium Trees', val: summary?.mediumTrees ?? 0 },
              { emoji: '🌴', label: 'Small Trees', val: summary?.smallTrees ?? 0 },
              { emoji: '🌿', label: 'Shrubs', val: summary?.shrubs ?? 0 },
              { emoji: '🪴', label: 'Plants', val: summary?.smallPlants ?? 0 },
              { emoji: '🪴', label: 'Indoor', val: summary?.indoorPlants ?? 0 },
            ].map(item => (
              <div key={item.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 text-center">
                <span className="text-xl block mb-1">{item.emoji}</span>
                <p className="text-sm font-black text-white">{item.val.toLocaleString()}</p>
                <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>
          {summary?.totalLawnSqm > 0 && (
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 mb-4 flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">🌱 Lawn Area</span>
              <span className="text-[10px] font-black text-white">{summary.totalLawnSqm.toLocaleString()} sqm</span>
            </div>
          )}
          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total</p>
              <p className="text-sm font-black text-white">{summary?.totalTrees?.toLocaleString()} trees + {summary?.totalPlants?.toLocaleString()} plants</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Daily Absorption</p>
              <p className="text-sm font-black text-green-400">{totalAbsorbed.toFixed(2)} kg CO2/day</p>
            </div>
          </div>
        </motion.div>

        {/* ── MOTIVATION CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-[40px] p-6 mb-6 border ${
            isGreen
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-3 ${isGreen ? 'text-green-500' : 'text-gray-500'}`}>
            {isGreen ? 'Campus Achievement' : 'Make a Difference'}
          </p>
          <p className={`text-[11px] font-bold leading-relaxed mb-4 ${isGreen ? 'text-green-100' : 'text-gray-300'}`}>
            {isGreen
              ? `🌍 Amazing! Our campus greenery is thriving with ${summary?.totalTrees ?? 0} trees and ${summary?.totalPlants ?? 0} plants absorbing ${totalAbsorbed.toFixed(2)} kg CO2 every day!`
              : `🌱 Every tree planted helps. Support campus sustainability by raising a green suggestion for more trees and plants!`}
          </p>
          <div className="flex gap-3">
            {isGreen ? (
              <button
                onClick={handleShare}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={12} /> Share This Win
              </button>
            ) : (
              <button
                onClick={() => navigate('/complaints')}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={12} /> Raise Green Suggestion
              </button>
            )}
            <button
              onClick={() => navigate('/navigation')}
              className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
            >
              View Map
            </button>
          </div>
        </motion.div>

        <p className="text-center text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-4">
          InstitutePLUSE • Campus Green Cover Module
        </p>
      </div>
    </div>
  )
}

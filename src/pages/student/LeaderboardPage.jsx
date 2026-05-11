import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { BADGE_DEFINITIONS } from '../../lib/carbonCalc'
import BottomTabBar from '../../components/BottomTabBar'
import EcoScoreRing from '../../components/EcoScoreRing'

const TABS = ['🏆 Campus', '🏫 Department', '🎯 Challenges', '🏅 My Badges']
const PERIODS = ['This Week', 'This Month', 'All Time']

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [tab, setTab] = useState(0)
  const [period, setPeriod] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [challenges, setChallenges] = useState([])
  const [myBadges, setMyBadges] = useState([])
  const [loading, setLoading] = useState(false)
  const [joinedChallenges, setJoinedChallenges] = useState([])

  useEffect(() => {
    if (tab === 0 || tab === 1) fetchLeaderboard()
    if (tab === 2) fetchChallenges()
    if (tab === 3) fetchBadges()
  }, [tab, period, profile?.department])

  async function fetchLeaderboard() {
    setLoading(true)
    let query = supabase.from('profiles')
      .select('id, full_name, department, eco_points, total_co2_kg, logging_streak')
      .order('eco_points', { ascending: false })
      .limit(20)

    if (tab === 1 && profile?.department) {
      query = query.eq('department', profile.department)
    }

    const { data } = await query
    setLeaderboard(data || [])
    setLoading(false)
  }

  async function fetchChallenges() {
    const { data } = await supabase.from('green_challenges').select('*').order('created_at', { ascending: false })
    setChallenges(data || [])

    if (profile?.id) {
      const { data: joined } = await supabase.from('challenge_participants')
        .select('challenge_id').eq('student_id', profile.id)
      setJoinedChallenges((joined || []).map(j => j.challenge_id))
    }
  }

  async function fetchBadges() {
    if (!profile?.id) return
    const { data } = await supabase.from('eco_badges').select('*').eq('student_id', profile.id)
    setMyBadges((data || []).map(b => b.badge_key))
  }

  async function joinChallenge(challengeId) {
    if (!profile?.id) return
    await supabase.from('challenge_participants').insert({
      challenge_id: challengeId, student_id: profile.id, joined_at: new Date().toISOString()
    })
    setJoinedChallenges(prev => [...prev, challengeId])
  }

  const myRank = leaderboard.findIndex(u => u.id === profile?.id) + 1
  const myEntry = leaderboard.find(u => u.id === profile?.id)

  return (
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: '80px' }}>
      <header className="app-header">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <span className="font-bold text-white">🏆 Leaderboard</span>
        <div />
      </header>

      <div className="page-container pt-4">
        {/* MY STATS BAR */}
        <div className="card p-3 mb-4 flex items-center justify-around">
          {[
            { label: 'Eco Points', value: (profile?.eco_points || 0).toLocaleString(), emoji: '⭐' },
            { label: 'Rank', value: myRank ? `#${myRank}` : '—', emoji: '🏆' },
            { label: 'Streak', value: `🔥${profile?.logging_streak || 0}d`, emoji: '' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-black text-gray-900">{s.emoji} {s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-4">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: tab === i ? '#16a34a' : 'white',
                color: tab === i ? 'white' : '#64748b',
                border: `1.5px solid ${tab === i ? '#16a34a' : '#e2e8f0'}`,
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* CAMPUS / DEPT LEADERBOARD */}
        {(tab === 0 || tab === 1) && (
          <>
            <div className="flex gap-2 mb-3">
              {PERIODS.map((p, i) => (
                <button key={p} onClick={() => setPeriod(i)}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
                  style={{ background: period === i ? '#f0fdf4' : 'transparent', color: period === i ? '#16a34a' : '#94a3b8' }}>
                  {p}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="flex justify-center py-10"><div className="spinner spinner-green" /></div>
            ) : leaderboard.length === 0 ? (
              <div className="card p-6 text-center text-gray-400">
                <p className="text-3xl mb-2">🌱</p>
                <p className="text-sm">No data yet. Start logging to appear here!</p>
              </div>
            ) : (
              <div>
                {leaderboard.map((user, i) => {
                  const isMe = user.id === profile?.id
                  const rankColors = ['#f59e0b', '#94a3b8', '#92400e']
                  const rankEmoji = i < 3 ? ['🥇', '🥈', '🥉'][i] : null

                  return (
                    <div key={user.id} className={`leaderboard-row animate-fade-in-up ${isMe ? 'my-row' : ''}`}
                      style={{ animationDelay: `${i * 0.04}s` }}>
                      <div className="rank-badge" style={{ background: i < 3 ? rankColors[i] + '20' : '#f8fafc', color: i < 3 ? rankColors[i] : '#64748b' }}>
                        {rankEmoji || `#${i + 1}`}
                      </div>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: '#16a34a' }}>
                        {user.full_name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name} {isMe && '(You)'}</p>
                        <p className="text-xs text-gray-400">{user.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-green-700">{(user.eco_points || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">pts</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* CHALLENGES */}
        {tab === 2 && (
          <div>
            {challenges.length === 0 ? (
              <div className="card p-6 text-center text-gray-400">
                <p className="text-3xl mb-2">🎯</p>
                <p className="text-sm">No active challenges. Check back soon!</p>
              </div>
            ) : challenges.map(ch => {
              const joined = joinedChallenges.includes(ch.id)
              const endDate = new Date(ch.end_date)
              const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))

              return (
                <div key={ch.id} className="card p-4 mb-3 animate-fade-in-up">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-chip text-xs">{ch.category}</span>
                        {daysLeft > 0 && <span className="text-xs text-orange-600 font-medium">⏰ {daysLeft}d left</span>}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">{ch.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{ch.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>🎁 +{ch.points_reward} pts</span>
                      <span>📅 {ch.duration_days} days</span>
                    </div>
                    <button
                      onClick={() => !joined && joinChallenge(ch.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${joined ? 'cursor-default' : 'cursor-pointer'}`}
                      style={{
                        background: joined ? '#f0fdf4' : '#16a34a',
                        color: joined ? '#16a34a' : 'white',
                        border: joined ? '1px solid #86efac' : 'none',
                      }}>
                      {joined ? '✓ Joined' : 'Join Challenge'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* MY BADGES */}
        {tab === 3 && (
          <div>
            <div className="grid grid-cols-3 gap-3">
              {BADGE_DEFINITIONS.map((badge, i) => {
                const earned = myBadges.includes(badge.key)
                return (
                  <div key={badge.key}
                    className="card p-3 text-center animate-fade-in-up"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      opacity: earned ? 1 : 0.4,
                      filter: earned ? 'none' : 'grayscale(1)',
                    }}>
                    <div className="text-3xl mb-1">{badge.emoji}</div>
                    <p className="text-xs font-semibold text-gray-900">{badge.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{badge.desc}</p>
                    {earned && <div className="badge-chip mx-auto mt-1 text-xs py-0.5">Earned ✓</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  )
}

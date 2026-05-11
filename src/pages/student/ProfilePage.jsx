import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, Edit2, Save, Bell } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import { BADGE_DEFINITIONS } from '../../lib/carbonCalc'
import { supabase } from '../../lib/supabase'
import BottomTabBar from '../../components/BottomTabBar'
import EcoScoreRing from '../../components/EcoScoreRing'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'Civil', 'MBA', 'Other']

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile, user, updateProfile, signOut } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', department: 'CSE' })
  const [badges, setBadges] = useState([])
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name || '', phone: profile.phone || '', department: profile.department || 'CSE' })
    }
    if (profile?.id) {
      supabase.from('eco_badges').select('badge_key').eq('student_id', profile.id)
        .then(({ data }) => setBadges((data || []).map(b => b.badge_key)))
    }
  }, [profile])

  async function handleSave() {
    const { error } = await updateProfile(form)
    if (error) toast.error('Failed to save changes')
    else { toast.success('Profile updated! 🌿'); setEditing(false) }
  }

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const ecoGrade = profile?.eco_points >= 5000 ? 'Planet Guardian 🌏'
    : profile?.eco_points >= 1000 ? 'Tree Planter 🌲'
    : profile?.eco_points >= 500 ? 'Eco Champion 🏆'
    : 'Eco Starter 🌱'

  return (
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: '80px' }}>
      <header className="app-header">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <span className="font-bold text-white">👤 Profile</span>
        <button onClick={() => setEditing(!editing)} className="text-green-200">
          <Edit2 size={18} />
        </button>
      </header>

      <div className="page-container pt-4">
        {/* PROFILE HEADER */}
        <div className="card p-6 mb-4 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full gradient-eco flex items-center justify-center text-3xl font-black text-white mx-auto mb-3">
            {profile?.full_name?.[0] || '?'}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{profile?.full_name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="badge-chip mx-auto mt-2">{ecoGrade}</div>
          <div className="badge-chip mx-auto mt-1" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fbbf24' }}>
            {profile?.department} · {profile?.role}
          </div>
        </div>

        {/* ECO IDENTITY CARD */}
        <div className="card p-4 mb-4 animate-fade-in-up stagger-1">
          <h3 className="text-sm font-bold text-gray-800 mb-3">🌿 Eco Identity</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-black text-green-700">{(profile?.eco_points || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-400">⭐ Eco Points</p>
            </div>
            <div>
              <p className="text-xl font-black text-orange-500">🔥 {profile?.logging_streak || 0}</p>
              <p className="text-xs text-gray-400">Day Streak</p>
            </div>
            <div>
              <p className="text-xl font-black text-gray-700">{badges.length}</p>
              <p className="text-xs text-gray-400">🏅 Badges</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
            <span>Total CO2 tracked: <strong>{(profile?.total_co2_kg || 0).toFixed(1)} kg</strong></span>
            <button onClick={() => navigate('/carbon/history')} className="font-semibold" style={{ color: '#16a34a' }}>View history →</button>
          </div>
        </div>

        {/* BADGES */}
        {badges.length > 0 && (
          <div className="card p-4 mb-4 animate-fade-in-up stagger-2">
            <h3 className="text-sm font-bold text-gray-800 mb-3">🏅 Earned Badges</h3>
            <div className="flex gap-2 flex-wrap">
              {BADGE_DEFINITIONS.filter(b => badges.includes(b.key)).map(b => (
                <div key={b.key} className="badge-chip">
                  {b.emoji} {b.name}
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/leaderboard')} className="text-xs font-semibold mt-2 block" style={{ color: '#16a34a' }}>
              View all badges →
            </button>
          </div>
        )}

        {/* EDITABLE INFO */}
        <div className="card p-4 mb-4 animate-fade-in-up stagger-3">
          <h3 className="text-sm font-bold text-gray-800 mb-3">✏️ Personal Info</h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
              <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="input-field text-sm" disabled={!editing} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="input-field text-sm" disabled={!editing} placeholder="Not set" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
              <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="input-field text-sm" disabled={!editing}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {editing && (
              <button onClick={handleSave} className="btn-primary w-full">
                <Save size={16} /> Save Changes
              </button>
            )}
          </div>
        </div>

        {/* NOTIFICATION PREFERENCES */}
        <div className="card p-4 mb-4 animate-fade-in-up stagger-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">🔔 Notification Preferences</h3>
          {[
            { label: '🌱 Eco Reminders', key: 'eco' },
            { label: '🚌 Bus Delays', key: 'bus' },
            { label: '🍽️ Order Updates', key: 'order' },
            { label: '🎓 Attendance Alerts', key: 'attendance' },
            { label: '🏆 Challenge Updates', key: 'challenge' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-700">{item.label}</span>
              <div className="w-10 h-5.5 rounded-full cursor-pointer relative" style={{ background: '#16a34a', padding: '2px' }}>
                <div className="w-4 h-4 rounded-full bg-white transition-all ml-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* APP INFO */}
        <div className="card p-4 mb-4">
          <div className="flex flex-col gap-2 text-sm text-gray-500">
            <div className="flex justify-between"><span>Version</span><span>1.0.0</span></div>
            <div className="flex justify-between"><span>Platform</span><span>InstitutePulse SCSAS</span></div>
            <div className="flex justify-between"><span>Tagline</span><span className="text-green-600">Every Action. Every Point.</span></div>
          </div>
        </div>

        {/* LOGOUT */}
        <button onClick={() => setShowLogout(true)} className="btn-ghost w-full mb-4" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowLogout(false)} />
          <div className="bottom-sheet">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Out?</h3>
            <p className="text-sm text-gray-500 mb-4">You'll need to sign in again to access your eco data.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleLogout} className="btn-danger flex-1">Sign Out</button>
            </div>
          </div>
        </>
      )}

      <BottomTabBar />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, BellOff, Filter } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { useNotifStore, useAuthStore } from '../../store/index'
import BottomTabBar from '../../components/BottomTabBar'

const TYPE_ICONS = {
  eco: '🌱', badge: '🏆', bus: '🚌', order: '🍽️',
  attendance: '🎓', complaint: '🧾', challenge: '🎯', general: '📢'
}

const FILTER_TABS = ['All', '🌱 Eco', '🚌 Bus', '🍽️ Orders', '🎓 Attend', '🧾 Complaints']
const FILTER_TYPES = [null, 'eco', 'bus', 'order', 'attendance', 'complaint']

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, markAllRead, markRead } = useNotifStore()
  const [filterTab, setFilterTab] = useState(0)

  useEffect(() => {
    if (profile?.id) fetchNotifications(profile.id)
  }, [profile?.id])

  const filtered = filterTab === 0
    ? notifications
    : notifications.filter(n => n.type === FILTER_TYPES[filterTab])

  function groupByDate(notifs) {
    const groups = {}
    notifs.forEach(n => {
      const d = new Date(n.created_at)
      const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d')
      if (!groups[label]) groups[label] = []
      groups[label].push(n)
    })
    return groups
  }

  const grouped = groupByDate(filtered)

  return (
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: '80px' }}>
      <header className="app-header">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <span className="font-bold text-white">🔔 Notifications</span>
        {unreadCount > 0 && (
          <button onClick={() => profile?.id && markAllRead(profile.id)}
            className="text-xs text-green-200 font-medium">
            Mark all read
          </button>
        )}
      </header>

      {/* FILTER TABS */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3"
        style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        {FILTER_TABS.map((t, i) => (
          <button key={t} onClick={() => setFilterTab(i)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: filterTab === i ? '#16a34a' : '#f0fdf4',
              color: filterTab === i ? 'white' : '#16a34a',
            }}>
            {t}
          </button>
        ))}
      </div>

      <div className="page-container pt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🌿</div>
            <p className="font-semibold text-gray-700">You're all caught up!</p>
            <p className="text-sm text-gray-400 mt-1">Great eco-warrior. No new notifications.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([label, notifs]) => (
            <div key={label} className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
              {notifs.map(n => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="w-full text-left card p-3 mb-2 flex items-start gap-3 transition-all hover:scale-[1.01]"
                  style={{ background: n.is_read ? 'white' : '#f0fdf4', borderColor: n.is_read ? '#e2e8f0' : '#86efac' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: n.is_read ? '#f8fafc' : '#dcfce7' }}>
                    {TYPE_ICONS[n.type] || '📢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight mb-0.5 ${n.is_read ? 'text-gray-700 font-medium' : 'text-gray-900 font-bold'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{format(new Date(n.created_at), 'h:mm a')}</p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ background: '#16a34a' }} />
                  )}
                </button>
              ))}
            </div>
          ))
        )}
      </div>

      <BottomTabBar />
    </div>
  )
}

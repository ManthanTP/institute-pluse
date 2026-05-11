import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Plus, CheckCircle2, Circle } from 'lucide-react'
import { generateStudyPlan } from '../../lib/gemini'
import { useAuthStore } from '../../store/index'
import BottomTabBar from '../../components/BottomTabBar'
import toast from 'react-hot-toast'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function StudyPlannerPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [step, setStep] = useState('setup') // setup | plan
  const [subjects, setSubjects] = useState(['Mathematics', 'Physics', 'Chemistry'])
  const [dailyHours, setDailyHours] = useState(3)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [completedTasks, setCompletedTasks] = useState({})
  const [selectedDay, setSelectedDay] = useState(0)

  async function generatePlan() {
    setLoading(true)
    try {
      const result = await generateStudyPlan({ subjects, daily_hours: dailyHours })
      setPlan(result)
      setStep('plan')
    } catch (err) {
      toast.error('Failed to generate plan')
    }
    setLoading(false)
  }

  function toggleTask(dayIdx, taskIdx) {
    const key = `${dayIdx}-${taskIdx}`
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: '80px' }}>
      <header className="app-header">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <span className="font-bold text-white">📅 Study Planner</span>
        {step === 'plan' && (
          <button onClick={() => { setPlan(null); setStep('setup') }} className="text-green-200">
            <RefreshCw size={18} />
          </button>
        )}
      </header>

      <div className="page-container pt-4">
        {/* ECO BANNER */}
        <div className="card p-3 mb-4" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
          <p className="text-xs text-green-700">📱 Digital study planning = zero paper used. +5 eco-points for going paperless! 🌿</p>
        </div>

        {step === 'setup' ? (
          <div className="card p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Set Up Your Study Plan</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
              {subjects.map((s, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={s} onChange={e => setSubjects(prev => prev.map((x, idx) => idx === i ? e.target.value : x))}
                    className="input-field flex-1 text-sm" placeholder={`Subject ${i + 1}`} />
                  {subjects.length > 1 && (
                    <button onClick={() => setSubjects(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-red-400 px-2">✕</button>
                  )}
                </div>
              ))}
              <button onClick={() => setSubjects(prev => [...prev, ''])} className="btn-ghost w-full py-2 text-sm">
                <Plus size={16} /> Add Subject
              </button>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Study Hours: {dailyHours}h</label>
              <input type="range" min="1" max="10" step="0.5" value={dailyHours}
                onChange={e => setDailyHours(parseFloat(e.target.value))}
                className="w-full h-10 accent-green-600" />
            </div>
            <button onClick={generatePlan} disabled={loading || subjects.filter(Boolean).length === 0} className="btn-primary w-full">
              {loading ? <><span className="spinner mr-2" /> Generating AI Plan...</> : '🤖 Generate AI Study Plan'}
            </button>
          </div>
        ) : (
          <>
            {/* WEEK CALENDAR */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
              {(plan?.week || []).map((day, i) => (
                <button key={i} onClick={() => setSelectedDay(i)}
                  className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
                  style={{ background: selectedDay === i ? '#16a34a' : 'white', color: selectedDay === i ? 'white' : '#64748b', border: '1.5px solid #e2e8f0' }}>
                  <span className="text-xs font-semibold">{DAYS[i] || `Day ${i+1}`}</span>
                  <span className="text-xs">{day.tasks?.length || 0}t</span>
                </button>
              ))}
            </div>

            {/* TODAY'S TASKS */}
            {plan?.week?.[selectedDay] && (
              <div className="card p-4 mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  📚 {plan.week[selectedDay].day} — {plan.week[selectedDay].tasks?.length} tasks
                </h3>
                {plan.week[selectedDay].tasks?.map((task, j) => {
                  const key = `${selectedDay}-${j}`
                  const done = completedTasks[key]
                  return (
                    <button key={j} onClick={() => toggleTask(selectedDay, j)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl mb-2 text-left transition-all"
                      style={{ background: done ? '#f0fdf4' : '#fafafa', border: '1px solid #e2e8f0' }}>
                      {done ? <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" /> : <Circle size={20} className="text-gray-300 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.subject}</p>
                        <p className="text-xs text-gray-400">{task.topic} · {task.hours}h</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <BottomTabBar />
    </div>
  )
}

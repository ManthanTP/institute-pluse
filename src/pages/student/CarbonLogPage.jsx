import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, CheckCircle2, ArrowLeft } from 'lucide-react'
import {
  TRANSPORT_MODES, TRANSPORT_FACTORS, FOOD_TYPES, MEAL_SLOTS,
  DEVICE_FACTORS, WASTE_TYPES,
  calcTransportKg, calcFoodKg, calcElectricityKg, calcWaterKg, calcWasteKg,
  calcTotalKg, calcEcoScore, calcEcoPoints, getScoreGrade
} from '../../lib/carbonCalc'
import { getEcoRecommendations } from '../../lib/gemini'
import { supabase } from '../../lib/supabase'
import { useAuthStore, useCarbonStore } from '../../store/index'
import EcoScoreRing from '../../components/EcoScoreRing'
import BottomTabBar from '../../components/BottomTabBar'
import toast from 'react-hot-toast'

const INITIAL_STATE = {
  transport: [{ mode: 'motorbike', km: 5 }],
  meals: { breakfast: 'vegetarian', lunch: 'vegetarian', dinner: 'vegetarian' },
  devices: [],
  shower_type: 'short_shower',
  general_water: 'medium',
  waste: [],
}

function AccordionSection({ title, emoji, isOpen, onToggle, children, isComplete }) {
  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      <button className="accordion-header" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{emoji}</span>
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          {isComplete && <span className="text-green-500"><CheckCircle2 size={16} /></span>}
        </div>
        {isOpen ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  )
}

export default function CarbonLogPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { setTodayLog } = useCarbonStore()
  const [openSection, setOpenSection] = useState('transport')
  const [form, setForm] = useState(INITIAL_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  const transportKg = calcTransportKg(form.transport)
  const foodKg = calcFoodKg(form.meals)
  const electricityKg = calcElectricityKg(form.devices)
  const waterKg = calcWaterKg(form.shower_type, form.general_water)
  const wasteKg = calcWasteKg(form.waste)
  const totalKg = calcTotalKg({ transport_kg: transportKg, food_kg: foodKg, electricity_kg: electricityKg, water_kg: waterKg, waste_kg: wasteKg })
  const ecoScore = calcEcoScore(totalKg)
  const { grade, color } = getScoreGrade(ecoScore)

  function toggleSection(key) {
    setOpenSection(prev => prev === key ? null : key)
  }

  function setTransportMode(mode) {
    setForm(f => ({ ...f, transport: [{ ...f.transport[0], mode }] }))
  }

  function setTransportKm(km) {
    setForm(f => ({ ...f, transport: [{ ...f.transport[0], km: parseFloat(km) || 0 }] }))
  }

  function setMeal(slot, type) {
    setForm(f => ({ ...f, meals: { ...f.meals, [slot]: type } }))
  }

  function toggleDevice(key) {
    setForm(f => {
      const exists = f.devices.find(d => d.device_key === key)
      if (exists) return { ...f, devices: f.devices.filter(d => d.device_key !== key) }
      return { ...f, devices: [...f.devices, { device_key: key, hours: 2 }] }
    })
  }

  function setDeviceHours(key, hours) {
    setForm(f => ({
      ...f,
      devices: f.devices.map(d => d.device_key === key ? { ...d, hours: parseFloat(hours) } : d)
    }))
  }

  function toggleWaste(type) {
    setForm(f => {
      const exists = f.waste.find(w => w.type === type)
      if (exists) return { ...f, waste: f.waste.filter(w => w.type !== type) }
      return { ...f, waste: [...f.waste, { type, kg: 0.5 }] }
    })
  }

  function setWasteKgVal(type, kg) {
    setForm(f => ({
      ...f,
      waste: f.waste.map(w => w.type === type ? { ...w, kg: parseFloat(kg) } : w)
    }))
  }

  async function handleSubmit() {
    if (!profile) return
    setSubmitting(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      const ecoPoints = calcEcoPoints({
        eco_score: ecoScore,
        transport_entries: form.transport,
        meals: form.meals,
        is_first_log: !profile.total_co2_kg,
        streak: profile.logging_streak,
      })

      const logData = {
        student_id: profile.id,
        log_date: today,
        transport_kg: transportKg,
        electricity_kg: electricityKg,
        food_kg: foodKg,
        water_kg: waterKg,
        waste_kg: wasteKg,
        total_kg: totalKg,
        eco_score: ecoScore,
        eco_points_earned: ecoPoints,
        transport_mode: form.transport[0]?.mode,
        transport_km: form.transport[0]?.km,
        transport_detail: form.transport,
        meals_detail: Object.entries(form.meals).map(([slot, type]) => ({
          slot, type, co2: 0
        })),
        devices_detail: form.devices,
        water_detail: { shower_type: form.shower_type, general_level: form.general_water },
        waste_detail: form.waste,
      }

      const { data, error } = await supabase.from('carbon_logs').upsert(logData, {
        onConflict: 'student_id,log_date'
      }).select().single()

      if (error) throw error

      // Update profile eco_points and total_co2
      await supabase.from('profiles').update({
        eco_points: (profile.eco_points || 0) + ecoPoints,
        total_co2_kg: (profile.total_co2_kg || 0) + totalKg,
        last_log_date: today,
        logging_streak: (profile.logging_streak || 0) + 1,
      }).eq('id', profile.id)

      // Get AI tips
      const aiTips = await getEcoRecommendations({
        transport_kg: transportKg, electricity_kg: electricityKg,
        food_kg: foodKg, water_kg: waterKg, waste_kg: wasteKg,
        total_kg: totalKg, eco_score: ecoScore
      })

      setTodayLog(data)
      setSuccess({ ecoScore, ecoPoints, aiTips })

    } catch (err) {
      console.error('Submit error:', err)
      toast.error(err.message || 'Failed to save log. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return <SuccessOverlay {...success} onDone={() => navigate('/dashboard')} onHistory={() => navigate('/carbon/history')} />
  }

  const barData = [
    { label: '🚗 Transport', kg: transportKg, max: 2 },
    { label: '⚡ Electricity', kg: electricityKg, max: 3 },
    { label: '🍽️ Food', kg: foodKg, max: 5 },
    { label: '💧 Water', kg: waterKg, max: 0.5 },
    { label: '🗑️ Waste', kg: wasteKg, max: 1 },
  ]

  return (
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: '100px' }}>
      {/* HEADER */}
      <header className="app-header">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} color="white" />
        </button>
        <span className="font-bold text-white">🌱 Carbon Log</span>
        <span className="text-xs text-green-200">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
      </header>

      {/* LIVE SUMMARY CARD */}
      <div className="sticky top-14 z-30 px-4 py-3" style={{ background: '#f8fafc' }}>
        <div className="card p-3" style={{ borderColor: color + '40', borderWidth: 2 }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-lg font-black" style={{ color }}>{totalKg.toFixed(2)} kg CO2</span>
              <span className="text-xs text-gray-400 ml-2">Total today</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold" style={{ color }}>Score: {ecoScore}</div>
              <div className="text-xs text-gray-400">{grade}</div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {barData.map(b => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-28 flex-shrink-0">{b.label}</span>
                <div className="progress-bar flex-1">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (b.kg / b.max) * 100)}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-600 w-12 text-right">{b.kg.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* TRANSPORT */}
        <AccordionSection title="Transportation" emoji="🚗" isOpen={openSection === 'transport'} onToggle={() => toggleSection('transport')} isComplete={transportKg >= 0}>
          <p className="text-xs text-gray-500 mb-3">How did you commute today?</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {TRANSPORT_MODES.map(m => (
              <button key={m.key} onClick={() => setTransportMode(m.key)}
                className={`mode-tile ${form.transport[0]?.mode === m.key ? 'selected' : ''}`}>
                <span className="text-xl">{m.emoji}</span>
                <span className="text-xs">{m.label}</span>
                {m.eco && <span className="text-green-500" style={{ fontSize: '9px' }}>ECO ✓</span>}
              </button>
            ))}
          </div>
          {!['bicycle', 'walking'].includes(form.transport[0]?.mode) && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Distance (km)</label>
              <input type="number" min="0" max="100" step="0.5"
                value={form.transport[0]?.km || 0}
                onChange={e => setTransportKm(e.target.value)}
                className="input-field" />
              <p className="text-xs text-green-600 mt-1 font-medium">
                = {transportKg.toFixed(3)} kg CO2 (calc: {form.transport[0]?.km} km × {TRANSPORT_FACTORS[form.transport[0]?.mode]})
              </p>
            </div>
          )}
          {form.transport[0]?.mode === 'college_bus' && (
            <div className="mt-2 p-2 rounded-lg text-xs font-medium" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              🎉 +12 eco-points for taking the college bus!
            </div>
          )}
        </AccordionSection>

        {/* FOOD */}
        <AccordionSection title="Food Consumption" emoji="🍽️" isOpen={openSection === 'food'} onToggle={() => toggleSection('food')} isComplete={true}>
          {MEAL_SLOTS.map(slot => (
            <div key={slot} className="mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-2 capitalize">{slot}</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {FOOD_TYPES.map(f => (
                  <button key={f.key}
                    onClick={() => setMeal(slot, f.key)}
                    className="flex-shrink-0 px-3 py-2 rounded-xl border-2 text-xs font-medium flex flex-col items-center gap-1 min-w-[60px] transition-all"
                    style={{
                      borderColor: form.meals[slot] === f.key ? '#16a34a' : '#e2e8f0',
                      background: form.meals[slot] === f.key ? '#f0fdf4' : 'white',
                      color: form.meals[slot] === f.key ? '#16a34a' : '#64748b',
                    }}>
                    <span className="text-lg">{f.emoji}</span>
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-500 mt-1">Food CO2: <strong>{foodKg.toFixed(2)} kg</strong></p>
        </AccordionSection>

        {/* ELECTRICITY */}
        <AccordionSection title="Electricity Usage" emoji="⚡" isOpen={openSection === 'electricity'} onToggle={() => toggleSection('electricity')} isComplete={form.devices.length > 0}>
          <p className="text-xs text-gray-500 mb-3">Select devices used today and set hours</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(DEVICE_FACTORS).map(([key, d]) => {
              const selected = form.devices.find(x => x.device_key === key)
              return (
                <button key={key} onClick={() => toggleDevice(key)}
                  className="flex items-center gap-2 p-2 rounded-xl border-2 text-xs text-left transition-all"
                  style={{
                    borderColor: selected ? '#16a34a' : '#e2e8f0',
                    background: selected ? '#f0fdf4' : 'white',
                  }}>
                  <span>{d.emoji}</span>
                  <span className="font-medium text-gray-800">{d.label}</span>
                </button>
              )
            })}
          </div>
          {form.devices.map(dev => {
            const d = DEVICE_FACTORS[dev.device_key]
            return (
              <div key={dev.device_key} className="mb-2">
                <label className="text-xs text-gray-600 mb-1 block">{d?.emoji} {d?.label} — {dev.hours}h = {(d?.co2_per_hour * dev.hours).toFixed(3)} kg CO2</label>
                <input type="range" min="0" max="12" step="0.5" value={dev.hours}
                  onChange={e => setDeviceHours(dev.device_key, e.target.value)}
                  className="w-full h-11 accent-green-600" />
              </div>
            )
          })}
          <p className="text-xs text-gray-500">Electricity CO2: <strong>{electricityKg.toFixed(3)} kg</strong></p>
        </AccordionSection>

        {/* WATER */}
        <AccordionSection title="Water Usage" emoji="💧" isOpen={openSection === 'water'} onToggle={() => toggleSection('water')} isComplete={true}>
          <p className="text-xs font-medium text-gray-700 mb-2">Shower type</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { key: 'short_shower', label: 'Short Shower (5 min)', emoji: '🚿' },
              { key: 'medium_shower', label: 'Medium (10 min)', emoji: '🚿' },
              { key: 'long_shower', label: 'Long (15+ min)', emoji: '🚿' },
              { key: 'bucket_bath', label: 'Bucket Bath', emoji: '🪣' },
            ].map(s => (
              <button key={s.key}
                onClick={() => setForm(f => ({ ...f, shower_type: s.key }))}
                className="p-2 rounded-xl border-2 text-xs font-medium transition-all text-center"
                style={{
                  borderColor: form.shower_type === s.key ? '#0ea5e9' : '#e2e8f0',
                  background: form.shower_type === s.key ? '#eff6ff' : 'white',
                  color: form.shower_type === s.key ? '#0ea5e9' : '#64748b',
                }}>
                <span>{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>
          <p className="text-xs font-medium text-gray-700 mb-2">General daily usage</p>
          <div className="flex gap-2">
            {['low', 'medium', 'high'].map(l => (
              <button key={l}
                onClick={() => setForm(f => ({ ...f, general_water: l }))}
                className="flex-1 py-2 rounded-xl border-2 text-xs font-semibold capitalize transition-all"
                style={{
                  borderColor: form.general_water === l ? '#0ea5e9' : '#e2e8f0',
                  background: form.general_water === l ? '#eff6ff' : 'white',
                  color: form.general_water === l ? '#0ea5e9' : '#64748b',
                }}>
                {l}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Water CO2: <strong>{waterKg.toFixed(3)} kg</strong></p>
        </AccordionSection>

        {/* WASTE */}
        <AccordionSection title="Waste Generation" emoji="🗑️" isOpen={openSection === 'waste'} onToggle={() => toggleSection('waste')} isComplete={form.waste.length > 0}>
          <p className="text-xs text-gray-500 mb-3">What types of waste did you generate today?</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {WASTE_TYPES.map(w => {
              const selected = form.waste.find(x => x.type === w.key)
              return (
                <button key={w.key} onClick={() => toggleWaste(w.key)}
                  className="flex items-center gap-2 p-2 rounded-xl border-2 text-xs text-left transition-all"
                  style={{
                    borderColor: selected ? '#16a34a' : '#e2e8f0',
                    background: selected ? '#f0fdf4' : 'white',
                  }}>
                  <span>{w.emoji}</span>
                  <div>
                    <p className="font-medium">{w.label}</p>
                    {w.eco && <p style={{ color: '#16a34a' }}>ECO ✓</p>}
                  </div>
                </button>
              )
            })}
          </div>
          {form.waste.map(w => {
            const wt = WASTE_TYPES.find(x => x.key === w.type)
            return (
              <div key={w.type} className="mb-2">
                <label className="text-xs text-gray-600 mb-1 block">{wt?.emoji} {wt?.label} — {w.kg}kg</label>
                <input type="range" min="0.1" max="3" step="0.1" value={w.kg}
                  onChange={e => setWasteKgVal(w.type, e.target.value)}
                  className="w-full h-11 accent-green-600" />
              </div>
            )
          })}
          <p className="text-xs text-gray-500">Waste CO2: <strong>{wasteKg.toFixed(3)} kg</strong></p>
        </AccordionSection>
      </div>

      {/* STICKY SUBMIT */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3" style={{ background: 'rgba(248,250,252,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid #e2e8f0' }}>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full text-base py-4">
          {submitting ? <><span className="spinner mr-2" /> Saving...</> : '💾 Save Today\'s Carbon Log'}
        </button>
      </div>

      <BottomTabBar />
    </div>
  )
}

function SuccessOverlay({ ecoScore, ecoPoints, aiTips, onDone, onHistory }) {
  const { grade, color, label } = getScoreGrade(ecoScore)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 animate-fade-in"
      style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
      <div className="w-full max-w-sm text-center">
        <div className="text-6xl mb-4 animate-count-up">✅</div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">Today's Log Saved!</h2>
        <p className="text-green-600 font-medium mb-6">🌿 Great job tracking your carbon footprint!</p>

        <div className="card p-6 mb-4">
          <div className="flex justify-center mb-3">
            <EcoScoreRing score={ecoScore} size={140} strokeWidth={10} />
          </div>
          <div className="badge-chip mx-auto text-sm py-2 px-4">+{ecoPoints} eco-points earned! 🎉</div>
        </div>

        {aiTips && aiTips.length > 0 && (
          <div className="card p-4 mb-4 text-left">
            <p className="text-xs font-bold text-green-700 mb-3">🤖 AI Eco Tips for Tomorrow</p>
            {aiTips.map((tip, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <span className="text-green-500 flex-shrink-0">✦</span>
                <p className="text-xs text-gray-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button onClick={onHistory} className="btn-ghost w-full">📊 View My History</button>
          <button onClick={onDone} className="btn-primary w-full">🏠 Back to Dashboard</button>
        </div>
      </div>
    </div>
  )
}

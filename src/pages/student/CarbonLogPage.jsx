import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowLeft, Bus, Utensils, Zap, Droplets, Trash2, Sparkles, Send, ArrowRight, Lightbulb, BarChart2 } from 'lucide-react'
import {
  TRANSPORT_FACTORS, FOOD_TYPES, MEAL_SLOTS,
  DEVICE_FACTORS, WASTE_TYPES,
  calcTransportKg, calcFoodKg, calcElectricityKg, calcWaterKg, calcWasteKg,
  calcTotalKg, calcEcoScore, calcEcoPoints, getScoreGrade
} from '../../lib/carbonCalc'
import { supabase } from '../../lib/supabase'
import { useAuthStore, useCarbonStore } from '../../store/index'
import EcoScoreRing from '../../components/EcoScoreRing'
import BottomTabBar from '../../components/BottomTabBar'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const INITIAL_STATE = {
  transport: [{ mode: 'motorbike', km: 8 }],
  meals: { breakfast: 'vegetarian', lunch: 'chicken', dinner: 'vegetarian' },
  devices: [{ device_key: 'laptop', hours: 3 }],
  shower_type: 'short_shower',
  general_water: 'medium',
  waste: [{ type: 'plastic', kg: 0.5 }],
}

const AI_TIPS = {
  transport: [
    "🚌 Switching to public transport just 2 days/week cuts your transit CO2 by ~40%.",
    "🚲 A 5km bike ride saves ~1.2kg CO2 vs motorbike — and boosts your Eco Score!",
    "🤝 Carpooling with 2 others reduces your per-person footprint by 66%.",
  ],
  food: [
    "🥦 A fully vegetarian day saves up to 2.5kg CO2 vs a meat-heavy diet.",
    "🌱 Replacing one beef meal with chicken cuts food emissions by nearly 50%.",
    "🍱 Home-cooked meals emit 3× less CO2 than restaurant or fast food.",
  ],
  electricity: [
    "💡 Unplugging devices on standby can save 10% of your electricity footprint.",
    "🌙 Charging devices at night during off-peak hours reduces grid strain.",
    "☀️ Using natural light instead of artificial saves ~0.3kg CO2 per day.",
  ],
  water: [
    "🚿 Cutting shower time by 2 minutes saves ~15L of water daily.",
    "🪣 Bucket baths use 60% less water than a standard shower.",
    "🧴 Turning off the tap while brushing saves ~6L per session.",
  ],
  waste: [
    "♻️ Segregating waste at source increases recycling efficiency by 80%.",
    "🌿 Composting food scraps eliminates ~0.4kg CO2/day from landfill methane.",
    "🛍️ Carrying a reusable bag prevents ~5g CO2 per plastic bag avoided.",
  ],
}

const STEP_DATA = [
  { key: 'transport', title: 'Transport Node', icon: Bus },
  { key: 'meals', title: 'Nutrition Intake', icon: Utensils },
  { key: 'devices', title: 'Energy Consumption', icon: Zap },
  { key: 'water', title: 'Hydration & Flow', icon: Droplets },
  { key: 'waste', title: 'Material Lifecycle', icon: Trash2 },
  { key: 'review', title: 'Impact Review', icon: BarChart2 },
]

function getTopCategory(transport, food, electricity, water, waste) {
  const cats = [
    { key: 'transport', val: transport },
    { key: 'food', val: food },
    { key: 'electricity', val: electricity },
    { key: 'water', val: water },
    { key: 'waste', val: waste },
  ]
  return cats.sort((a, b) => b.val - a.val)[0].key
}

function CategoryBar({ label, value, maxVal, color, icon: Icon }) {
  const pct = maxVal > 0 ? Math.min((value / maxVal) * 100, 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${color.bg}`}>
        <Icon size={13} className={color.text} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
          <span className="text-[9px] font-black text-white">{value.toFixed(2)} kg</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'circOut' }}
            className={`h-full rounded-full ${color.bar}`}
          />
        </div>
      </div>
    </div>
  )
}

export default function CarbonLogPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { setTodayLog } = useCarbonStore()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState(INITIAL_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [showChart, setShowChart] = useState(false) // hidden by default to save space in wizard

  const transportKg = calcTransportKg(form.transport)
  const foodKg = calcFoodKg(form.meals)
  const electricityKg = calcElectricityKg(form.devices)
  const waterKg = calcWaterKg(form.shower_type, form.general_water)
  const wasteKg = calcWasteKg(form.waste)
  const totalKg = calcTotalKg({ transport_kg: transportKg, food_kg: foodKg, electricity_kg: electricityKg, water_kg: waterKg, waste_kg: wasteKg })
  const ecoScore = calcEcoScore(totalKg)

  const maxCat = Math.max(transportKg, foodKg, electricityKg, waterKg, wasteKg, 0.01)
  const topCategory = getTopCategory(transportKg, foodKg, electricityKg, waterKg, wasteKg)

  // Pick a random tip for the top category
  const tipList = AI_TIPS[topCategory] || AI_TIPS.transport
  const aiTip = tipList[Math.floor((ecoScore * tipList.length) / 101) % tipList.length]

  const goNext = () => setCurrentStep(p => Math.min(p + 1, 5))
  const goBack = () => setCurrentStep(p => Math.max(p - 1, 0))

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
      devices: f.devices.map(d => d.device_key === key ? { ...d, hours: parseFloat(hours) || 0 } : d)
    }))
  }
  function toggleWaste(type) {
    setForm(f => {
      const exists = f.waste.find(w => w.type === type)
      if (exists) return { ...f, waste: f.waste.filter(w => w.type !== type) }
      return { ...f, waste: [...f.waste, { type, kg: 0.5 }] }
    })
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
        meals_detail: Object.entries(form.meals).map(([slot, type]) => ({ slot, type, co2: 0 })),
        devices_detail: form.devices,
        water_detail: { shower_type: form.shower_type, general_level: form.general_water },
        waste_detail: form.waste,
      }
      const { data, error } = await supabase.from('carbon_logs').upsert(logData, { onConflict: 'student_id,log_date' }).select().single()
      if (error) throw error
      await supabase.from('profiles').update({
        eco_points: (profile.eco_points || 0) + ecoPoints,
        total_co2_kg: (profile.total_co2_kg || 0) + totalKg,
        last_log_date: today,
        logging_streak: (profile.logging_streak || 0) + 1,
      }).eq('id', profile.id)
      setTodayLog(data)
      setSuccess({ ecoScore, ecoPoints, topCategory, aiTip })
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

  const StepIcon = STEP_DATA[currentStep].icon

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="px-6 py-6 border-b border-white/5 relative z-10 backdrop-blur-xl bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => currentStep > 0 ? goBack() : navigate('/dashboard')}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Sustainability Log</span>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Daily Pulse</h2>
          </div>
        </div>
        {/* Progress Steps */}
        <div className="flex items-center gap-1.5">
          {STEP_DATA.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= currentStep ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-white/10'}`}
            />
          ))}
        </div>
      </header>

      <main className="px-6 pt-6 relative z-10 max-w-lg mx-auto">
        {/* WIZARD FORM */}
        <section className="bg-white/5 border border-white/10 rounded-[40px] p-6 mb-8 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-green-600/20 text-green-500 flex items-center justify-center">
              <StepIcon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Step {currentStep + 1} of {STEP_DATA.length}</p>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">{STEP_DATA[currentStep].title}</h3>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 0: TRANSPORT */}
              {currentStep === 0 && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {Object.keys(TRANSPORT_FACTORS).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setTransportMode(mode)}
                        className={`p-4 rounded-3xl border transition-all text-center group ${
                          form.transport[0]?.mode === mode
                            ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20'
                            : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                        }`}
                      >
                        <span className="block text-xs font-black uppercase tracking-widest mb-1 group-hover:scale-110 transition-transform">
                          {mode.replace('_', ' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Distance Log (KM)</label>
                      <span className="text-sm font-black text-white">{form.transport[0]?.km} km</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1"
                      value={form.transport[0]?.km}
                      onChange={e => setTransportKm(e.target.value)}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <div className="flex justify-between text-[8px] font-black text-gray-700 uppercase tracking-widest mt-2">
                      <span>0 km</span><span>50 km</span><span>100 km</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: MEALS */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {MEAL_SLOTS.map(slot => (
                    <div key={slot} className="space-y-3">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">{slot}</p>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                        {FOOD_TYPES.map(type => (
                          <button
                            key={type.key}
                            onClick={() => setMeal(slot, type.key)}
                            className={`flex-shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                              form.meals[slot] === type.key
                                ? 'bg-green-600 border-green-600 text-white shadow-lg'
                                : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                            }`}
                          >
                            {type.emoji} {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 2: DEVICES */}
              {currentStep === 2 && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {Object.keys(DEVICE_FACTORS).map(key => {
                      const selected = form.devices.find(d => d.device_key === key)
                      return (
                        <button
                          key={key}
                          onClick={() => toggleDevice(key)}
                          className={`p-5 rounded-[32px] border transition-all text-left flex flex-col gap-3 group ${
                            selected
                              ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20'
                              : 'bg-white/5 border-white/5 text-gray-500'
                          }`}
                        >
                          <Zap size={18} className={selected ? 'text-white' : 'text-gray-600'} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {key.replace('_', ' ')}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {form.devices.length > 0 && (
                    <div className="space-y-4 mt-4">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Usage Hours</p>
                      {form.devices.map(d => (
                        <div key={d.device_key} className="bg-white/5 rounded-3xl p-4 border border-white/5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{d.device_key.replace('_', ' ')}</span>
                            <span className="text-sm font-black text-white">{d.hours}h</span>
                          </div>
                          <input
                            type="range" min="0" max="12" step="0.5"
                            value={d.hours}
                            onChange={e => setDeviceHours(d.device_key, e.target.value)}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                          />
                          <div className="flex justify-between text-[8px] font-black text-gray-700 uppercase tracking-widest mt-1">
                            <span>0h</span><span>6h</span><span>12h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: WATER */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Shower Duration</p>
                    <div className="grid grid-cols-2 gap-4">
                      {['short_shower', 'bucket_bath'].map(type => (
                        <button
                          key={type}
                          onClick={() => setForm(f => ({ ...f, shower_type: type }))}
                          className={`p-4 rounded-3xl border transition-all text-center text-[10px] font-black uppercase tracking-widest ${
                            form.shower_type === type
                              ? 'bg-green-600 border-green-600 text-white shadow-lg'
                              : 'bg-white/5 border-white/5 text-gray-500'
                          }`}
                        >
                          {type === 'short_shower' ? '🚿 Short Shower' : '🪣 Bucket Bath'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">General Usage</p>
                    <div className="flex gap-3">
                      {['low', 'medium', 'high'].map(level => (
                        <button
                          key={level}
                          onClick={() => setForm(f => ({ ...f, general_water: level }))}
                          className={`flex-1 py-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                            form.general_water === level
                              ? 'bg-green-600 border-green-600 text-white shadow-lg'
                              : 'bg-white/5 border-white/5 text-gray-500'
                          }`}
                        >
                          {level === 'low' ? '💧' : level === 'medium' ? '💧💧' : '💧💧💧'} {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: WASTE */}
              {currentStep === 4 && (
                <div className="grid grid-cols-2 gap-4">
                  {WASTE_TYPES.map(type => {
                    const isSelected = form.waste.find(w => w.type === type.key)
                    return (
                      <button
                        key={type.key}
                        onClick={() => toggleWaste(type.key)}
                        className={`p-5 rounded-[32px] border transition-all text-left flex flex-col gap-3 ${
                          isSelected
                            ? 'bg-green-600 border-green-600 text-white shadow-lg'
                            : 'bg-white/5 border-white/5 text-gray-500'
                        }`}
                      >
                        <span className={isSelected ? 'text-white text-xl' : 'text-gray-600 text-xl'}>{type.emoji}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
              {/* STEP 5: REVIEW */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  {/* LIVE SCORE CARD */}
                  <div className="bg-slate-900 rounded-[32px] p-6 border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full bg-green-500/10 blur-[60px]" />
                    <div className="flex items-center justify-between gap-6 relative z-10 mb-6">
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em] mb-3">Impact Matrix</p>
                        <h2 className="text-4xl font-black text-white mb-1 leading-none tracking-tighter">{ecoScore}%</h2>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Efficiency Quotient</p>
                        <div className="space-y-3">
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${ecoScore}%` }}
                              transition={{ duration: 1, ease: 'circOut' }}
                              className="h-full bg-gradient-to-r from-green-600 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <span>Carbon Load</span>
                            <span className="text-white">{totalKg.toFixed(2)} KG CO2</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 relative">
                        <EcoScoreRing score={ecoScore} size={100} strokeWidth={10} showLabel={false} animated={true} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles size={24} className="text-green-500/40" />
                        </div>
                      </div>
                    </div>

                    {/* CATEGORY BREAKDOWN CHART */}
                    <div className="border-t border-white/5 pt-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.25em] flex items-center gap-2">
                          <BarChart2 size={12} className="text-green-500" /> Emission Breakdown
                        </span>
                      </div>
                      <div className="space-y-3">
                        <CategoryBar label="Transport" value={transportKg} maxVal={maxCat} icon={Bus} color={{ bg: 'bg-blue-500/10', text: 'text-blue-400', bar: 'bg-blue-500' }} />
                        <CategoryBar label="Food" value={foodKg} maxVal={maxCat} icon={Utensils} color={{ bg: 'bg-orange-500/10', text: 'text-orange-400', bar: 'bg-orange-500' }} />
                        <CategoryBar label="Energy" value={electricityKg} maxVal={maxCat} icon={Zap} color={{ bg: 'bg-yellow-500/10', text: 'text-yellow-400', bar: 'bg-yellow-500' }} />
                        <CategoryBar label="Water" value={waterKg} maxVal={maxCat} icon={Droplets} color={{ bg: 'bg-cyan-500/10', text: 'text-cyan-400', bar: 'bg-cyan-500' }} />
                        <CategoryBar label="Waste" value={wasteKg} maxVal={maxCat} icon={Trash2} color={{ bg: 'bg-red-500/10', text: 'text-red-400', bar: 'bg-red-500' }} />
                      </div>
                    </div>
                  </div>

                  {/* AI TIP CARD */}
                  <motion.div
                    key={topCategory}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-600/10 border border-green-500/20 rounded-[24px] p-5 flex items-start gap-4"
                  >
                    <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-green-500 uppercase tracking-[0.25em] mb-1.5">AI Eco Tip</p>
                      <p className="text-[11px] font-medium text-white/80 leading-relaxed">{aiTip}</p>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* WIZARD ACTIONS */}
          <div className="mt-8 flex gap-4 pt-6 border-t border-white/5">
            {currentStep > 0 && (
              <button
                onClick={goBack}
                className="px-6 py-4 rounded-[24px] bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
              >
                Back
              </button>
            )}
            {currentStep < 5 ? (
              <button
                onClick={goNext}
                className="flex-1 py-4 bg-white/10 hover:bg-white/15 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2"
              >
                Next Step <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-green-600/30 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sync Log <Send size={14} /></>
                )}
              </button>
            )}
          </div>
        </section>

        <p className="text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-10 opacity-50">
          Project InstitutePulse • Pulse Node
        </p>
      </main>

      <BottomTabBar />
    </div>
  )
}

function SuccessOverlay({ ecoScore, ecoPoints, topCategory, aiTip, onDone, onHistory }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-green-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-24 h-24 rounded-[40px] bg-green-600/20 border border-green-500/30 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/10"
        >
          <CheckCircle2 size={48} className="text-green-500" />
        </motion.div>

        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Log Synced</h1>
        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] mb-8 text-xs">Ecosystem Data Processed</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Eco Score</p>
            <p className="text-3xl font-black text-white">{ecoScore}%</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">XP Gained</p>
            <p className="text-3xl font-black text-green-500">+{ecoPoints}</p>
          </div>
        </div>

        {/* AI Tip on success screen */}
        <div className="bg-green-600/10 border border-green-500/20 rounded-[24px] p-5 mb-8 text-left">
          <p className="text-[9px] font-black text-green-500 uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
            <Lightbulb size={10} /> AI Recommendation
          </p>
          <p className="text-[11px] font-medium text-white/80 leading-relaxed">{aiTip || "Keep logging daily to grow your Eco Score!"}</p>
        </div>

        <div className="space-y-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onDone}
            className="w-full py-5 bg-green-600 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.3em] shadow-xl shadow-green-600/20 flex items-center justify-center gap-3"
          >
            Return to Home <ArrowRight size={18} />
          </motion.button>
          <button
            onClick={onHistory}
            className="w-full py-4 text-gray-500 font-black text-[10px] uppercase tracking-[0.4em] hover:text-white transition-colors"
          >
            View Historical Data
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

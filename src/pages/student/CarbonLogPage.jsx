import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, CheckCircle2, ArrowLeft, Bus, Utensils, Zap, Droplets, Trash2, Sparkles, Send, Info, ArrowRight, X, Trophy } from 'lucide-react'
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
import { motion, AnimatePresence } from 'framer-motion'

const INITIAL_STATE = {
  transport: [{ mode: 'motorbike', km: 5 }],
  meals: { breakfast: 'vegetarian', lunch: 'vegetarian', dinner: 'vegetarian' },
  devices: [],
  shower_type: 'short_shower',
  general_water: 'medium',
  waste: [],
}

function AccordionSection({ title, icon: Icon, isOpen, onToggle, children, isComplete, colorClass }) {
  return (
    <motion.div 
      layout
      className={`mb-4 overflow-hidden rounded-[32px] border transition-all duration-500 ${
        isOpen 
          ? 'bg-white/5 border-white/10 shadow-2xl shadow-black/40' 
          : 'bg-white/[0.02] border-white/5'
      }`}
    >
      <button 
        className="w-full px-6 py-5 flex items-center justify-between gap-4"
        onClick={onToggle}
      >
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            isComplete ? 'bg-green-600/20 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-white/5 text-gray-500'
          }`}>
            <Icon size={22} />
          </div>
          <div className="text-left">
            <span className={`block text-sm font-black tracking-tight ${isOpen ? 'text-white' : 'text-gray-400'}`}>
              {title}
            </span>
            {isComplete && !isOpen && (
              <span className="text-[9px] font-black text-green-500 uppercase tracking-[0.2em] flex items-center gap-1.5 mt-1">
                <CheckCircle2 size={10} /> Verified
              </span>
            )}
          </div>
        </div>
        <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} className="text-gray-600" />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6 overflow-hidden"
          >
            <div className="h-[1px] bg-white/5 w-full mb-6" />
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Sustainability Log</span>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Daily Pulse</h2>
          </div>
        </div>
      </header>

      <main className="px-6 pt-6 relative z-10 max-w-lg mx-auto">
        {/* LIVE SCORE CARD */}
        <motion.div 
          layout
          className="bg-slate-900 rounded-[40px] p-8 mb-10 border border-white/10 shadow-2xl shadow-black/50 relative overflow-hidden"
        >
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full bg-green-500/10 blur-[60px]" />
          
          <div className="flex items-center justify-between gap-8 relative z-10">
            <div className="flex-1">
              <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em] mb-3">Impact Matrix</p>
              <h2 className="text-4xl font-black text-white mb-2 leading-none tracking-tighter">{ecoScore}%</h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Efficiency Quotient</p>
              
              <div className="space-y-4">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${ecoScore}%` }}
                    transition={{ duration: 1, ease: 'circOut' }}
                    className="h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
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
        </motion.div>

        {/* LOGGING SECTIONS */}
        <section className="space-y-2">
          <AccordionSection 
            title="Transport Node" 
            icon={Bus} 
            isOpen={openSection === 'transport'}
            onToggle={() => toggleSection('transport')}
            isComplete={form.transport[0]?.km > 0}
          >
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
            </div>
          </AccordionSection>

          <AccordionSection 
            title="Nutrition Intake" 
            icon={Utensils} 
            isOpen={openSection === 'meals'}
            onToggle={() => toggleSection('meals')}
            isComplete={true}
          >
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
          </AccordionSection>

          <AccordionSection 
            title="Energy Consumption" 
            icon={Zap} 
            isOpen={openSection === 'devices'}
            onToggle={() => toggleSection('devices')}
            isComplete={form.devices.length > 0}
          >
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(DEVICE_FACTORS).map(key => {
                const isSelected = form.devices.find(d => d.device_key === key)
                return (
                  <button
                    key={key}
                    onClick={() => toggleDevice(key)}
                    className={`p-5 rounded-[32px] border transition-all text-left flex flex-col gap-3 group ${
                      isSelected 
                        ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20' 
                        : 'bg-white/5 border-white/5 text-gray-500'
                    }`}
                  >
                    <Zap size={18} className={isSelected ? 'text-white' : 'text-gray-600'} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {key.replace('_', ' ')}
                    </span>
                  </button>
                )
              })}
            </div>
          </AccordionSection>

          <AccordionSection 
            title="Hydration & Flow" 
            icon={Droplets} 
            isOpen={openSection === 'water'}
            onToggle={() => toggleSection('water')}
            isComplete={true}
          >
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
                        {type.replace('_', ' ')}
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
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
             </div>
          </AccordionSection>

          <AccordionSection 
            title="Material Lifecycle" 
            icon={Trash2} 
            isOpen={openSection === 'waste'}
            onToggle={() => toggleSection('waste')}
            isComplete={form.waste.length > 0}
          >
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
          </AccordionSection>
        </section>

        {/* SUBMIT BUTTON */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-12 py-5 bg-green-600 hover:bg-green-500 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-green-600/30 transition-all flex items-center justify-center gap-4 relative overflow-hidden"
        >
          {submitting ? (
             <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
             </div>
          ) : (
            <>
              Sync Data <Send size={18} />
            </>
          )}
        </motion.button>

        <p className="text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-10 opacity-50">
           Project InstitutePulse • Pulse Node
        </p>
      </main>

      <BottomTabBar />
    </div>
  )
}

function SuccessOverlay({ ecoScore, ecoPoints, aiTips, onDone, onHistory }) {
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
        <div className="w-24 h-24 rounded-[40px] bg-green-600/20 border border-green-500/30 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/10">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>

        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Log Synced</h1>
        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] mb-12 text-xs">Ecosystem Data Processed</p>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Eco Score</p>
            <p className="text-3xl font-black text-white">{ecoScore}%</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">XP Gained</p>
            <p className="text-3xl font-black text-green-500">+{ecoPoints}</p>
          </div>
        </div>

        {aiTips && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900 border border-white/5 rounded-[40px] p-8 text-left mb-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sparkles size={60} className="text-green-500" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <Sparkles size={20} className="text-green-400" />
              </div>
              <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em]">Neural Recommendation</p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              {aiTips}
            </p>
          </motion.div>
        )}

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

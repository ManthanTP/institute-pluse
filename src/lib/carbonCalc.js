/**
 * Carbon Calculation Engine
 * Based on IPCC standard emission factors
 * Campus daily carbon budget per student: 5.0 kg CO2
 */

// ── TRANSPORT FACTORS (kg CO2/km) ──
export const TRANSPORT_FACTORS = {
  motorbike: 0.120,
  car_solo: 0.210,
  car_shared: 0.053,
  college_bus: 0.048,
  city_bus: 0.089,
  auto_rickshaw: 0.076,
  electric_scooter: 0.025,
  bicycle: 0.000,
  walking: 0.000,
}

export const TRANSPORT_MODES = [
  { key: 'motorbike', label: 'Motorbike', emoji: '🏍️', eco: false },
  { key: 'car_solo', label: 'Car (Solo)', emoji: '🚗', eco: false },
  { key: 'car_shared', label: 'Car (Shared)', emoji: '🚗', eco: true },
  { key: 'college_bus', label: 'College Bus', emoji: '🚌', eco: true, bonus: 12 },
  { key: 'city_bus', label: 'City Bus', emoji: '🚌', eco: true },
  { key: 'auto_rickshaw', label: 'Auto (CNG)', emoji: '🛺', eco: false },
  { key: 'electric_scooter', label: 'E-Scooter', emoji: '⚡', eco: true },
  { key: 'bicycle', label: 'Bicycle', emoji: '🚲', eco: true, bonus: 15 },
  { key: 'walking', label: 'Walking', emoji: '🚶', eco: true, bonus: 15 },
]

// ── FOOD FACTORS (kg CO2/meal) ──
export const FOOD_FACTORS = {
  vegan: 0.30,
  vegetarian: 0.50,
  egg: 0.80,
  non_veg_chicken: 1.50,
  non_veg_beef: 3.50,
  skipped: 0.00,
}

export const FOOD_TYPES = [
  { key: 'vegan', label: 'Vegan', emoji: '🌱', eco: true },
  { key: 'vegetarian', label: 'Vegetarian', emoji: '🥗', eco: true },
  { key: 'egg', label: 'Egg-based', emoji: '🥚', eco: false },
  { key: 'non_veg_chicken', label: 'Non-veg', emoji: '🍗', eco: false },
  { key: 'non_veg_beef', label: 'Red Meat', emoji: '🥩', eco: false },
  { key: 'skipped', label: 'Skipped', emoji: '⏭️', eco: false },
]

export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner']

// ── ELECTRICITY DEVICES ──
const INDIA_GRID_FACTOR = 0.82 // kg CO2/kWh

export const DEVICE_FACTORS = {
  ac_1ton: { power: 1.50, label: 'AC (1 Ton)', emoji: '❄️', co2_per_hour: 1.230 },
  ac_1_5ton: { power: 1.80, label: 'AC (1.5 Ton)', emoji: '❄️', co2_per_hour: 1.476 },
  desktop_pc: { power: 0.20, label: 'Desktop PC', emoji: '🖥️', co2_per_hour: 0.164 },
  laptop: { power: 0.05, label: 'Laptop', emoji: '💻', co2_per_hour: 0.041 },
  mobile_charging: { power: 0.01, label: 'Mobile Charging', emoji: '📱', co2_per_hour: 0.008 },
  ceiling_fan: { power: 0.07, label: 'Ceiling Fan', emoji: '🌀', co2_per_hour: 0.057 },
  led_bulb: { power: 0.009, label: 'LED Bulb', emoji: '💡', co2_per_hour: 0.007 },
  washing_machine: { power: 0.50, label: 'Washing Machine', emoji: '🧺', co2_per_hour: 0.410 },
}

// ── WATER FACTORS ──
const WATER_CO2_PER_LITRE = 0.003

export const SHOWER_TYPES = {
  short_shower: { litres: 50, label: 'Short (5 min)', emoji: '🚿' },
  medium_shower: { litres: 100, label: 'Medium (10 min)', emoji: '🚿' },
  long_shower: { litres: 150, label: 'Long (15+ min)', emoji: '🚿' },
  bucket_bath: { litres: 15, label: 'Bucket Bath', emoji: '🪣' },
}

export const WATER_GENERAL_USAGE = {
  low: 50,
  medium: 100,
  high: 150,
}

// ── WASTE FACTORS ──
export const WASTE_FACTORS = {
  general: 0.50,
  plastic: 0.60,
  paper: 0.20,
  organic: 0.05,
  recycled: 0.10,
}

export const WASTE_TYPES = [
  { key: 'general', label: 'General', emoji: '🗑️', eco: false },
  { key: 'plastic', label: 'Plastic', emoji: '🧴', eco: false },
  { key: 'paper', label: 'Paper', emoji: '📄', eco: false },
  { key: 'organic', label: 'Organic/Compost', emoji: '🌿', eco: true },
  { key: 'recycled', label: 'Recycled', emoji: '♻️', eco: true },
]

// ── CALCULATION FUNCTIONS ──

export function calcTransportKg(entries) {
  // entries: [{mode, km}]
  return entries.reduce((total, e) => {
    const factor = TRANSPORT_FACTORS[e.mode] || 0
    return total + (factor * (e.km || 0))
  }, 0)
}

export function calcFoodKg(meals) {
  // meals: {breakfast, lunch, dinner} each with food type key
  return Object.values(meals).reduce((total, type) => {
    return total + (FOOD_FACTORS[type] || 0)
  }, 0)
}

export function calcElectricityKg(devices) {
  // devices: [{device_key, hours}]
  return devices.reduce((total, d) => {
    const device = DEVICE_FACTORS[d.device_key]
    if (!device) return total
    return total + (device.co2_per_hour * (d.hours || 0))
  }, 0)
}

export function calcWaterKg(shower_type, general_usage_level) {
  const shower_litres = SHOWER_TYPES[shower_type]?.litres || 0
  const general_litres = WATER_GENERAL_USAGE[general_usage_level] || 0
  return (shower_litres + general_litres) * WATER_CO2_PER_LITRE
}

export function calcWasteKg(waste_entries) {
  // waste_entries: [{type, kg}]
  return waste_entries.reduce((total, e) => {
    const factor = WASTE_FACTORS[e.type] || 0
    return total + (factor * (e.kg || 0))
  }, 0)
}

export function calcTotalKg({ transport_kg, electricity_kg, food_kg, water_kg, waste_kg }) {
  return (transport_kg || 0) + (electricity_kg || 0) + (food_kg || 0) + (water_kg || 0) + (waste_kg || 0)
}

export const CAMPUS_BUDGET_KG = 5.0

export function calcEcoScore(total_kg) {
  const raw = Math.max(0, 100 - ((total_kg / CAMPUS_BUDGET_KG) * 100))
  return Math.round(raw)
}

export function getScoreGrade(score) {
  if (score >= 90) return { grade: 'Excellent', label: 'Eco Champion', color: '#166534', cssClass: 'score-excellent' }
  if (score >= 70) return { grade: 'Good', label: 'Eco Friendly', color: '#16a34a', cssClass: 'score-good' }
  if (score >= 50) return { grade: 'Average', label: 'Room to Improve', color: '#f59e0b', cssClass: 'score-average' }
  if (score >= 25) return { grade: 'Poor', label: 'Needs Attention', color: '#ef4444', cssClass: 'score-poor' }
  return { grade: 'Critical', label: 'High Impact Day', color: '#7f1d1d', cssClass: 'score-critical' }
}

export function calcEcoPoints({ eco_score, transport_entries, meals, is_first_log, streak }) {
  let points = 10 // base for logging

  if (eco_score >= 100) points += 60
  else if (eco_score >= 90) points += 40
  else if (eco_score >= 70) points += 20

  // Transport bonus
  const hasEcoTransport = transport_entries?.some(e =>
    ['bicycle', 'walking'].includes(e.mode)
  )
  const hasBus = transport_entries?.some(e =>
    ['college_bus'].includes(e.mode)
  )
  if (hasEcoTransport) points += 15
  if (hasBus) points += 12

  // Food bonus
  const allVegetarian = meals && Object.values(meals).every(m => m === 'vegan' || m === 'vegetarian' || m === 'skipped')
  const allVegan = meals && Object.values(meals).every(m => m === 'vegan' || m === 'skipped')
  if (allVegan) points += 15
  else if (allVegetarian) points += 10

  // Streak bonus
  if (streak === 30) points += 200
  else if (streak === 7) points += 75
  else if (streak === 3) points += 30

  // First log bonus
  if (is_first_log) points += 50

  return points
}

// ── BADGE DEFINITIONS ──
export const BADGE_DEFINITIONS = [
  { key: 'first_step', name: 'First Step', emoji: '🌱', desc: 'Submitted first carbon log' },
  { key: 'pedal_power', name: 'Pedal Power', emoji: '🚴', desc: 'Used bicycle or walking 5 days' },
  { key: 'green_streak', name: 'Green Streak', emoji: '🌿', desc: '7 consecutive days logged' },
  { key: 'eco_champion', name: 'Eco Champion', emoji: '🏆', desc: 'Eco score above 90 for 5 days' },
  { key: 'veggie_week', name: 'Veggie Week', emoji: '🥗', desc: 'All vegetarian meals for 7 days' },
  { key: 'vegan_day', name: 'Vegan Day', emoji: '🌱', desc: 'All vegan meals on one day' },
  { key: 'bus_buddy', name: 'Bus Buddy', emoji: '🚌', desc: 'Used college bus 10 times' },
  { key: 'energy_saver', name: 'Energy Saver', emoji: '⚡', desc: 'Electricity CO2 under 0.2 kg for 5 days' },
  { key: 'zero_waste_hero', name: 'Zero Waste Hero', emoji: '🗑️', desc: 'Only organic/recycled waste for 7 days' },
  { key: 'thirty_day_streak', name: '30-Day Streak', emoji: '🔥', desc: 'Logged every day for 30 days' },
  { key: 'campus_hero', name: 'Campus Hero', emoji: '🌍', desc: 'Ranked #1 on leaderboard any week' },
  { key: 'challenge_winner', name: 'Challenge Winner', emoji: '🏅', desc: 'Completed any green challenge' },
  { key: 'water_wise', name: 'Water Wise', emoji: '💧', desc: 'Short shower for 10 days' },
  { key: 'perfect_day', name: 'Perfect Day', emoji: '🌟', desc: 'Eco score of 100 on any day' },
  { key: 'tree_planter', name: 'Tree Planter', emoji: '🌲', desc: '1000 eco-points milestone' },
  { key: 'planet_guardian', name: 'Planet Guardian', emoji: '🌏', desc: '5000 eco-points milestone' },
]

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

export const DEFAULT_CARBON_CONFIG = {
  campus_budget_kg: 5.0,
  transport_factors: TRANSPORT_FACTORS,
  food_factors: FOOD_FACTORS,
  device_factors: Object.fromEntries(Object.entries(DEVICE_FACTORS).map(([k, v]) => [k, v.co2_per_hour])),
  water_co2_per_litre: WATER_CO2_PER_LITRE,
  shower_litres: Object.fromEntries(Object.entries(SHOWER_TYPES).map(([k, v]) => [k, v.litres])),
  water_general_usage: WATER_GENERAL_USAGE,
  waste_factors: WASTE_FACTORS,
  points_config: {
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
  },
  score_grades: {
    excellent: 90,
    good: 70,
    average: 50,
    poor: 25
  },
  validation_limits: {
    max_transport_km: 150.0,
    max_walking_km: 30.0,
    max_device_hours: 16.0,
    max_waste_kg: 10.0,
    max_water_litres: 300,
    suspicious_transport_km: 60.0,
    suspicious_walking_km: 15.0,
    suspicious_device_hours: 10.0,
    suspicious_waste_kg: 4.0,
    min_logical_footprint_kg: 0.3,
    max_daily_xp_cap: 80,
    max_consecutive_perfect_days: 3,
    max_rejections_before_ban: 2
  }
}

export function getCarbonConfig(dbConfig) {
  if (!dbConfig) return DEFAULT_CARBON_CONFIG;
  return {
    campus_budget_kg: Number(dbConfig.campus_budget_kg ?? DEFAULT_CARBON_CONFIG.campus_budget_kg),
    transport_factors: { ...DEFAULT_CARBON_CONFIG.transport_factors, ...dbConfig.transport_factors },
    food_factors: { ...DEFAULT_CARBON_CONFIG.food_factors, ...dbConfig.food_factors },
    device_factors: { ...DEFAULT_CARBON_CONFIG.device_factors, ...dbConfig.device_factors },
    water_co2_per_litre: Number(dbConfig.water_co2_per_litre ?? DEFAULT_CARBON_CONFIG.water_co2_per_litre),
    shower_litres: { ...DEFAULT_CARBON_CONFIG.shower_litres, ...dbConfig.shower_litres },
    water_general_usage: { ...DEFAULT_CARBON_CONFIG.water_general_usage, ...dbConfig.water_general_usage },
    waste_factors: { ...DEFAULT_CARBON_CONFIG.waste_factors, ...dbConfig.waste_factors },
    points_config: { ...DEFAULT_CARBON_CONFIG.points_config, ...dbConfig.points_config },
    score_grades: { ...DEFAULT_CARBON_CONFIG.score_grades, ...dbConfig.score_grades },
    validation_limits: { ...DEFAULT_CARBON_CONFIG.validation_limits, ...dbConfig.validation_limits }
  };
}

export function calcTransportKg(entries, factors = TRANSPORT_FACTORS) {
  // entries: [{mode, km}]
  const f = factors || TRANSPORT_FACTORS;
  return entries.reduce((total, e) => {
    const factor = f[e.mode] ?? TRANSPORT_FACTORS[e.mode] ?? 0
    return total + (factor * (e.km || 0))
  }, 0)
}

export function calcFoodKg(meals, factors = FOOD_FACTORS) {
  // meals: {breakfast, lunch, dinner} each with food type key
  const f = factors || FOOD_FACTORS;
  return Object.values(meals).reduce((total, type) => {
    return total + (f[type] ?? FOOD_FACTORS[type] ?? 0)
  }, 0)
}

export function calcElectricityKg(devices, factors = DEVICE_FACTORS) {
  // devices: [{device_key, hours}]
  const f = factors || DEVICE_FACTORS;
  return devices.reduce((total, d) => {
    const device = f[d.device_key] ?? DEVICE_FACTORS[d.device_key]
    if (!device) return total
    const co2_per_hour = typeof device === 'object' ? device.co2_per_hour : Number(device)
    return total + (co2_per_hour * (d.hours || 0))
  }, 0)
}

export function calcWaterKg(shower_type, general_usage_level, config = {}) {
  const shower_litres = config.shower_litres?.[shower_type] ?? SHOWER_TYPES[shower_type]?.litres ?? 0
  const general_litres = config.water_general_usage?.[general_usage_level] ?? WATER_GENERAL_USAGE[general_usage_level] ?? 0
  const co2_per_litre = config.water_co2_per_litre ?? WATER_CO2_PER_LITRE
  return (shower_litres + general_litres) * co2_per_litre
}

export function calcWasteKg(waste_entries, factors = WASTE_FACTORS) {
  // waste_entries: [{type, kg}]
  const f = factors || WASTE_FACTORS;
  return waste_entries.reduce((total, e) => {
    const factor = f[e.type] ?? WASTE_FACTORS[e.type] ?? 0
    return total + (factor * (e.kg || 0))
  }, 0)
}

export function calcTotalKg({ transport_kg, electricity_kg, food_kg, water_kg, waste_kg }) {
  return (transport_kg || 0) + (electricity_kg || 0) + (food_kg || 0) + (water_kg || 0) + (waste_kg || 0)
}

export const CAMPUS_BUDGET_KG = 5.0

export function calcEcoScore(total_kg, budget = CAMPUS_BUDGET_KG) {
  const activeBudget = Number(budget ?? CAMPUS_BUDGET_KG)
  const raw = Math.max(0, 100 - ((total_kg / activeBudget) * 100))
  return Math.round(raw)
}

export function getScoreGrade(score, scoreGrades = DEFAULT_CARBON_CONFIG.score_grades) {
  const g = scoreGrades || DEFAULT_CARBON_CONFIG.score_grades
  if (score >= (g.excellent ?? 90)) return { grade: 'Excellent', label: 'Eco Champion', color: '#166534', cssClass: 'score-excellent' }
  if (score >= (g.good ?? 70)) return { grade: 'Good', label: 'Eco Friendly', color: '#16a34a', cssClass: 'score-good' }
  if (score >= (g.average ?? 50)) return { grade: 'Average', label: 'Room to Improve', color: '#f59e0b', cssClass: 'score-average' }
  if (score >= (g.poor ?? 25)) return { grade: 'Poor', label: 'Needs Attention', color: '#ef4444', cssClass: 'score-poor' }
  return { grade: 'Critical', label: 'High Impact Day', color: '#7f1d1d', cssClass: 'score-critical' }
}

export function calcEcoPoints({ eco_score, transport_entries, meals, is_first_log, streak }, pointsConfig, xpCap) {
  const cfg = pointsConfig || DEFAULT_CARBON_CONFIG.points_config
  let points = cfg.base_points ?? 10 // base for logging

  if (eco_score >= 100) points += (cfg.score_100_bonus ?? 60)
  else if (eco_score >= 90) points += (cfg.score_90_bonus ?? 40)
  else if (eco_score >= 70) points += (cfg.score_70_bonus ?? 20)

  // Transport bonus
  const hasEcoTransport = transport_entries?.some(e =>
    ['bicycle', 'walking'].includes(e.mode)
  )
  const hasBus = transport_entries?.some(e =>
    ['college_bus'].includes(e.mode)
  )
  if (hasEcoTransport) points += (cfg.eco_transport_bonus ?? 15)
  if (hasBus) points += (cfg.bus_bonus ?? 12)

  // Food bonus
  const allVegetarian = meals && Object.values(meals).every(m => m === 'vegan' || m === 'vegetarian' || m === 'skipped')
  const allVegan = meals && Object.values(meals).every(m => m === 'vegan' || m === 'skipped')
  if (allVegan) points += (cfg.vegan_bonus ?? 15)
  else if (allVegetarian) points += (cfg.vegetarian_bonus ?? 10)

  // Streak bonus
  if (streak === 30) points += (cfg.streak_30_bonus ?? 200)
  else if (streak === 7) points += (cfg.streak_7_bonus ?? 75)
  else if (streak === 3) points += (cfg.streak_3_bonus ?? 30)

  // First log bonus
  if (is_first_log) points += (cfg.first_log_bonus ?? 50)

  if (xpCap !== undefined && xpCap !== null) {
    points = Math.min(points, xpCap)
  }

  return points
}

export function checkCarbonLogValidation(form, config, lastLogs = []) {
  const limits = config?.validation_limits || DEFAULT_CARBON_CONFIG.validation_limits;
  const errors = [];
  
  const totalKm = form.transport?.reduce((acc, curr) => acc + (curr.km || 0), 0) || 0;
  const walkKm = form.transport?.filter(t => ['bicycle', 'walking'].includes(t.mode)).reduce((acc, curr) => acc + (curr.km || 0), 0) || 0;
  const maxDeviceHours = form.devices?.reduce((acc, curr) => Math.max(acc, (curr.hours || 0)), 0) || 0;
  const totalWasteKg = form.waste?.reduce((acc, curr) => acc + (curr.kg || 0), 0) || 0;

  // 1. Hard Limits Validation
  if (totalKm > limits.max_transport_km) {
    errors.push(`Transport distance cannot exceed ${limits.max_transport_km} km`);
  }
  if (walkKm > limits.max_walking_km) {
    errors.push(`Walking/Bicycle distance cannot exceed ${limits.max_walking_km} km`);
  }
  if (maxDeviceHours > limits.max_device_hours) {
    errors.push(`Single device usage time cannot exceed ${limits.max_device_hours} hours`);
  }
  if (totalWasteKg > limits.max_waste_kg) {
    errors.push(`Total logged waste cannot exceed ${limits.max_waste_kg} kg`);
  }

  // Calculate total CO2 and Eco Score for footprint verification
  const factors = config?.transport_factors || TRANSPORT_FACTORS;
  const foodFactors = config?.food_factors || FOOD_FACTORS;
  const deviceFactors = config?.device_factors || Object.fromEntries(Object.entries(DEVICE_FACTORS).map(([k, v]) => [k, v.co2_per_hour]));
  const wasteFactors = config?.waste_factors || WASTE_FACTORS;

  const tKg = calcTransportKg(form.transport || [], factors);
  const fKg = calcFoodKg(form.meals || {}, foodFactors);
  const eKg = calcElectricityKg(form.devices || [], deviceFactors);
  const wKg = calcWaterKg(form.shower_type, form.general_water, config);
  const waKg = calcWasteKg(form.waste || [], wasteFactors);
  const totalKg = calcTotalKg({ transport_kg: tKg, electricity_kg: eKg, food_kg: fKg, water_kg: wKg, waste_kg: waKg });
  const score = calcEcoScore(totalKg, config?.campus_budget_kg);

  // 2. Suspicious Anomalies Validation
  const isSuspiciousFootprint = totalKg < (limits.min_logical_footprint_kg ?? 0.3);
  const isSuspiciousQuantities = 
    totalKm > limits.suspicious_transport_km ||
    walkKm > limits.suspicious_walking_km ||
    maxDeviceHours > limits.suspicious_device_hours ||
    totalWasteKg > limits.suspicious_waste_kg;

  // 3. Consecutive Perfect Score Lock
  let isPerfectScoreStreak = false;
  const perfectDaysLimit = limits.max_consecutive_perfect_days ?? 3;
  if (score === 100 && lastLogs && lastLogs.length >= perfectDaysLimit) {
    const perfectStreak = lastLogs.slice(0, perfectDaysLimit).every(log => log.eco_score === 100);
    if (perfectStreak) {
      isPerfectScoreStreak = true;
    }
  }

  const isSuspicious = isSuspiciousFootprint || isSuspiciousQuantities || isPerfectScoreStreak;

  return { errors, isSuspicious };
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

// ══════════════════════════════════════════════════════════════
// GREEN COVER UTILITY LIBRARY — InstitutePulse
// Campus CO2 Absorption Calculations
// ══════════════════════════════════════════════════════════════

export const CO2_ABSORPTION_FACTORS = {
  large_tree:   0.060,  // kg CO2/day per tree (mango, neem, banyan)
  medium_tree:  0.040,  // kg CO2/day per tree (gulmohar, ashoka)
  small_tree:   0.025,  // kg CO2/day per tree (coconut, drumstick)
  large_shrub:  0.010,  // kg CO2/day per plant
  small_plant:  0.003,  // kg CO2/day per plant (sapling)
  indoor_plant: 0.001,  // kg CO2/day per plant (potted)
  lawn:         0.002,  // kg CO2/day per square metre of lawn
}

export const GREEN_COVER_LABELS = {
  large_tree:   'Large Tree (mango, neem, banyan)',
  medium_tree:  'Medium Tree (gulmohar, ashoka)',
  small_tree:   'Small Tree (coconut, drumstick)',
  large_shrub:  'Large Shrub / Bush',
  small_plant:  'Small Plant / Sapling',
  indoor_plant: 'Indoor / Potted Plant',
  lawn:         'Lawn Grass',
}

export const GREEN_COVER_EMOJIS = {
  large_tree:   '🌳',
  medium_tree:  '🌲',
  small_tree:   '🌴',
  large_shrub:  '🌿',
  small_plant:  '🪴',
  indoor_plant: '🪴',
  lawn:         '🌱',
}

export const GREEN_COVER_COLORS = {
  large_tree:   '#14532d',
  medium_tree:  '#166534',
  small_tree:   '#15803d',
  large_shrub:  '#16a34a',
  small_plant:  '#22c55e',
  indoor_plant: '#4ade80',
  lawn:         '#86efac',
}

export const GREEN_COVER_TYPES = Object.keys(CO2_ABSORPTION_FACTORS)

/**
 * Calculate CO2 absorption for a single item per day (kg)
 */
export function calculateItemAbsorption(item) {
  const factor = CO2_ABSORPTION_FACTORS[item.type] ?? 0
  if (item.type === 'lawn') return (item.area_sqm ?? 0) * factor
  return (item.count ?? 0) * factor
}

/**
 * Calculate total CO2 absorption across all green cover items
 */
export function calculateTotalAbsorption(items) {
  return items.reduce((sum, item) => sum + calculateItemAbsorption(item), 0)
}

/**
 * Calculate net carbon balance and derived metrics
 */
export function calculateNetCarbon(studentCO2, greenAbsorption) {
  const net = studentCO2 - greenAbsorption
  const safeStudent = Math.max(0, studentCO2)
  return {
    net: parseFloat(net.toFixed(3)),
    absorbed: parseFloat(greenAbsorption.toFixed(3)),
    generated: parseFloat(studentCO2.toFixed(3)),
    isNeutral: net <= 0,
    isCarbonNegative: net < 0,
    treesNeededToNeutralize: net <= 0
      ? 0
      : Math.ceil(net / CO2_ABSORPTION_FACTORS.medium_tree),
    percentageOffset: safeStudent > 0
      ? Math.min(100, parseFloat(((greenAbsorption / safeStudent) * 100).toFixed(1)))
      : 100,
  }
}

/**
 * Get status color / label for net carbon value
 */
export function getNetCarbonStatus(net) {
  if (net <= 0) return {
    label: 'Carbon Neutral 🌿',
    shortLabel: 'Neutral',
    color: '#16a34a',
    textClass: 'text-green-400',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/20',
    icon: '🌍',
  }
  if (net <= 20) return {
    label: 'Almost Neutral ⚠️',
    shortLabel: 'Close',
    color: '#f59e0b',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/20',
    icon: '⚠️',
  }
  return {
    label: 'Needs Improvement',
    shortLabel: 'High',
    color: '#ef4444',
    textClass: 'text-red-400',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/20',
    icon: '❌',
  }
}

/**
 * Aggregate green cover items into a summary object
 */
export function getGreenCoverSummary(items) {
  return items.reduce((acc, item) => {
    if (['large_tree', 'medium_tree', 'small_tree'].includes(item.type)) {
      acc.totalTrees += item.count ?? 0
      if (item.type === 'large_tree')  acc.largeTrees  += item.count ?? 0
      if (item.type === 'medium_tree') acc.mediumTrees += item.count ?? 0
      if (item.type === 'small_tree')  acc.smallTrees  += item.count ?? 0
    } else if (item.type === 'lawn') {
      acc.totalLawnSqm += item.area_sqm ?? 0
    } else {
      acc.totalPlants += item.count ?? 0
      if (item.type === 'large_shrub')  acc.shrubs       += item.count ?? 0
      if (item.type === 'small_plant')  acc.smallPlants  += item.count ?? 0
      if (item.type === 'indoor_plant') acc.indoorPlants += item.count ?? 0
    }
    acc.totalCO2Absorbed += calculateItemAbsorption(item)
    return acc
  }, {
    totalTrees: 0,
    largeTrees: 0,
    mediumTrees: 0,
    smallTrees: 0,
    totalPlants: 0,
    shrubs: 0,
    smallPlants: 0,
    indoorPlants: 0,
    totalLawnSqm: 0,
    totalCO2Absorbed: 0,
  })
}

/**
 * Group green cover items by zone
 */
export function groupByZone(items) {
  const zones = {}
  items.forEach(item => {
    const z = item.zone || 'Unknown'
    if (!zones[z]) zones[z] = { zone: z, items: [], totalCO2: 0, treeCount: 0, plantCount: 0 }
    zones[z].items.push(item)
    zones[z].totalCO2 += calculateItemAbsorption(item)
    if (['large_tree', 'medium_tree', 'small_tree'].includes(item.type)) {
      zones[z].treeCount += item.count ?? 0
    } else {
      zones[z].plantCount += item.count ?? 0
    }
  })
  return Object.values(zones).sort((a, b) => b.totalCO2 - a.totalCO2)
}

/**
 * Build pie chart data from green cover items grouped by type
 */
export function buildPieData(items) {
  const typeMap = {}
  items.forEach(item => {
    const t = item.type
    if (!typeMap[t]) typeMap[t] = { name: GREEN_COVER_LABELS[t], type: t, value: 0 }
    typeMap[t].value += calculateItemAbsorption(item)
  })
  return Object.values(typeMap).filter(d => d.value > 0).map(d => ({
    ...d,
    value: parseFloat(d.value.toFixed(3)),
  }))
}

// ══════════════════════════════════════════════════════════════
// CAMPUS GREEN SCORE — Composite 0-100 scoring system
// Uses logarithmic scaling so even modest green cover earns
// a meaningful score without requiring impossible absorption.
// ══════════════════════════════════════════════════════════════

export const GREEN_SCORE_TIERS = [
  { min: 85, label: 'Platinum Campus', emoji: '💎', color: '#a78bfa', textClass: 'text-violet-400', bgClass: 'bg-violet-500/10', borderClass: 'border-violet-500/20' },
  { min: 70, label: 'Gold Campus', emoji: '🥇', color: '#f59e0b', textClass: 'text-amber-400', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/20' },
  { min: 50, label: 'Silver Campus', emoji: '🥈', color: '#94a3b8', textClass: 'text-slate-400', bgClass: 'bg-slate-500/10', borderClass: 'border-slate-500/20' },
  { min: 30, label: 'Bronze Campus', emoji: '🥉', color: '#d97706', textClass: 'text-yellow-600', bgClass: 'bg-yellow-600/10', borderClass: 'border-yellow-600/20' },
  { min: 0,  label: 'Seedling Campus', emoji: '🌱', color: '#22c55e', textClass: 'text-green-400', bgClass: 'bg-green-500/10', borderClass: 'border-green-500/20' },
]

/**
 * Calculate Campus Green Score (0-100)
 *
 * Pillars (weighted):
 *   1. Carbon Offset Ratio  (40%) — log-scaled absorption-to-emission ratio
 *   2. Biodiversity          (20%) — variety of green cover types registered
 *   3. Coverage Density      (20%) — total green items relative to benchmark
 *   4. Zone Coverage         (20%) — geographical spread of green cover
 *
 * The logarithmic offset ratio means even 1% real offset earns ~30/40 points,
 * and reaching 10% earns ~36/40. This keeps the campus "green" in score
 * even though raw kg absorption is tiny compared to student emissions.
 */
export function calculateCampusGreenScore(items, studentCO2 = 0) {
  if (!items || items.length === 0) return { score: 0, pillars: {} }

  const totalAbsorption = calculateTotalAbsorption(items)

  // ── Pillar 1: Carbon Offset Ratio (40 pts) ──
  // Uses log1p scaling: even small ratios earn meaningful points
  let offsetScore = 0
  if (studentCO2 > 0 && totalAbsorption > 0) {
    const ratio = totalAbsorption / studentCO2 // e.g. 0.01 = 1%
    // log1p(ratio * 100) maps: 1% → ~4.6, 10% → ~6.2, 100% → ~6.9
    // Normalize to 0-40 range with a cap
    offsetScore = Math.min(40, (Math.log1p(ratio * 100) / Math.log1p(100)) * 40)
  } else if (totalAbsorption > 0 && studentCO2 === 0) {
    offsetScore = 40 // No emissions = full marks
  }

  // ── Pillar 2: Biodiversity (20 pts) ──
  // Score based on how many unique types are represented
  const uniqueTypes = new Set(items.map(i => i.type))
  const maxTypes = Object.keys(CO2_ABSORPTION_FACTORS).length // 7
  const bioScore = Math.min(20, (uniqueTypes.size / maxTypes) * 20)

  // ── Pillar 3: Coverage Density (20 pts) ──
  // Total items relative to a benchmark of 200 total items/plants/trees
  const BENCHMARK_ITEMS = 200
  const summary = getGreenCoverSummary(items)
  const totalCount = summary.totalTrees + summary.totalPlants + Math.floor(summary.totalLawnSqm / 50)
  const densityScore = Math.min(20, (totalCount / BENCHMARK_ITEMS) * 20)

  // ── Pillar 4: Zone Coverage (20 pts) ──
  // More zones = better geographical spread
  const zones = groupByZone(items)
  const BENCHMARK_ZONES = 6
  const zoneScore = Math.min(20, (zones.length / BENCHMARK_ZONES) * 20)

  const totalScore = Math.round(offsetScore + bioScore + densityScore + zoneScore)
  const score = Math.min(100, Math.max(0, totalScore))

  return {
    score,
    pillars: {
      offset:      { score: Math.round(offsetScore),  max: 40, label: 'Carbon Offset' },
      biodiversity:{ score: Math.round(bioScore),      max: 20, label: 'Biodiversity' },
      density:     { score: Math.round(densityScore),  max: 20, label: 'Coverage Density' },
      zones:       { score: Math.round(zoneScore),     max: 20, label: 'Zone Coverage' },
    },
  }
}

/**
 * Get the tier for a given Campus Green Score
 */
export function getGreenScoreTier(score) {
  return GREEN_SCORE_TIERS.find(t => score >= t.min) || GREEN_SCORE_TIERS[GREEN_SCORE_TIERS.length - 1]
}

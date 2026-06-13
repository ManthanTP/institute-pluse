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

import { useState, useEffect } from 'react'
import { TreePine, Plus, Pencil, Trash2, Save, X, Download, MapPin, RefreshCw, Leaf } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { exportTablePDF } from '../../lib/pdfExport'
import AdminLayout from './AdminLayout'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import {
  CO2_ABSORPTION_FACTORS,
  GREEN_COVER_LABELS,
  GREEN_COVER_EMOJIS,
  calculateItemAbsorption,
  calculateTotalAbsorption,
  calculateNetCarbon,
  getNetCarbonStatus,
  getGreenCoverSummary,
  groupByZone,
} from '../../lib/greenCover'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '',
  type: 'medium_tree',
  count: 1,
  area_sqm: '',
  zone: '',
  latitude: '',
  longitude: '',
  date_planted: '',
  notes: '',
}

function getTypeOptions() {
  return Object.entries(GREEN_COVER_LABELS).map(([key, label]) => ({
    value: key,
    label,
    emoji: GREEN_COVER_EMOJIS[key],
    factor: CO2_ABSORPTION_FACTORS[key],
  }))
}

function EntryModal({ entry, onClose, onSave }) {
  const [form, setForm] = useState(entry
    ? {
        name: entry.name || '',
        type: entry.type || 'medium_tree',
        count: entry.count || 1,
        area_sqm: entry.area_sqm || '',
        zone: entry.zone || '',
        latitude: entry.latitude || '',
        longitude: entry.longitude || '',
        date_planted: entry.date_planted || '',
        notes: entry.notes || '',
      }
    : { ...EMPTY_FORM }
  )
  const [saving, setSaving] = useState(false)

  const isLawn = form.type === 'lawn'
  const previewCO2 = isLawn
    ? (parseFloat(form.area_sqm) || 0) * CO2_ABSORPTION_FACTORS.lawn
    : (parseInt(form.count) || 0) * (CO2_ABSORPTION_FACTORS[form.type] || 0)

  const typeOpts = getTypeOptions()

  async function handleSave() {
    if (!form.name.trim() || !form.zone.trim()) {
      toast.error('Name and Zone are required')
      return
    }
    if (isLawn && !form.area_sqm) {
      toast.error('Area (sqm) is required for lawn type')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        count: isLawn ? null : parseInt(form.count) || 1,
        area_sqm: isLawn ? parseFloat(form.area_sqm) || null : null,
        zone: form.zone.trim(),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        date_planted: form.date_planted || null,
        notes: form.notes.trim() || null,
        co2_factor_kg_day: CO2_ABSORPTION_FACTORS[form.type] || 0.040,
      }
      await onSave(entry?.id, payload)
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                {entry ? 'Edit Entry' : 'Add Green Cover'}
              </h2>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">
                Campus green cover registration
              </p>
            </div>
            <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder='e.g. Mango Trees — Library Garden'
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white outline-none focus:border-green-500/50 transition-all placeholder-gray-700"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">Type *</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white outline-none focus:border-green-500/50 appearance-none cursor-pointer"
              >
                {typeOpts.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900">
                    {opt.emoji} {opt.label} — {opt.factor} kg/day
                  </option>
                ))}
              </select>
            </div>

            {/* Count or Area */}
            {isLawn ? (
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">Lawn Area (sqm) *</label>
                <input
                  type="number"
                  min="1"
                  value={form.area_sqm}
                  onChange={e => setForm(f => ({ ...f, area_sqm: e.target.value }))}
                  placeholder="e.g. 800"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white outline-none focus:border-green-500/50 transition-all placeholder-gray-700"
                />
              </div>
            ) : (
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">Count *</label>
                <input
                  type="number"
                  min="1"
                  value={form.count}
                  onChange={e => setForm(f => ({ ...f, count: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white outline-none focus:border-green-500/50 transition-all"
                />
              </div>
            )}

            {/* Zone */}
            <div>
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">Zone / Location *</label>
              <input
                type="text"
                value={form.zone}
                onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
                placeholder="e.g. Block A Garden"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white outline-none focus:border-green-500/50 transition-all placeholder-gray-700"
              />
            </div>

            {/* Lat / Lng */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                  placeholder="15.3647"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white outline-none focus:border-green-500/50 transition-all placeholder-gray-700"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                  placeholder="75.1240"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white outline-none focus:border-green-500/50 transition-all placeholder-gray-700"
                />
              </div>
            </div>

            {/* Date Planted */}
            <div>
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">Date Planted</label>
              <input
                type="date"
                value={form.date_planted}
                onChange={e => setForm(f => ({ ...f, date_planted: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white outline-none focus:border-green-500/50 transition-all"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Additional notes..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white outline-none focus:border-green-500/50 transition-all resize-none placeholder-gray-700"
              />
            </div>

            {/* CO2 Preview */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
              <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1">CO2 Absorption Preview</p>
              <p className="text-sm font-black text-white">
                This entry will absorb{' '}
                <span className="text-green-400">{previewCO2.toFixed(3)} kg CO2/day</span>
              </p>
              <p className="text-[8px] text-gray-500 mt-1">
                Factor: {CO2_ABSORPTION_FACTORS[form.type]} kg/day × {isLawn ? `${form.area_sqm || 0} sqm` : `${form.count || 0} ${form.type.replace('_', ' ')}s`}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={14} /> Save Entry</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}

export default function AdminGreenCoverPage() {
  const { profile } = useAuthStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [balance, setBalance] = useState(null)
  const [status, setStatus] = useState(null)
  const [zones, setZones] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [sortBy, setSortBy] = useState('zone')
  const [todayStudentCO2, setTodayStudentCO2] = useState(0)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const { data: greenData } = await supabase
        .from('campus_green_cover')
        .select('*')
        .order('zone')

      const safeItems = greenData || []
      setItems(safeItems)

      const summ = getGreenCoverSummary(safeItems)
      setSummary(summ)
      const zoneGroups = groupByZone(safeItems)
      setZones(zoneGroups)

      // Get today's student CO2
      const today = new Date().toISOString().split('T')[0]
      const { data: todayLogs } = await supabase
        .from('carbon_logs')
        .select('total_kg')
        .eq('log_date', today)
      const studentCO2 = (todayLogs || []).reduce((a, l) => a + Number(l.total_kg || 0), 0)
      setTodayStudentCO2(studentCO2)

      const totalAbsorbed = calculateTotalAbsorption(safeItems)
      const bal = calculateNetCarbon(studentCO2, totalAbsorbed)
      setBalance(bal)
      setStatus(getNetCarbonStatus(bal.net))
    } catch (err) {
      toast.error('Failed to load green cover data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(id, payload) {
    try {
      if (id) {
        const { error } = await supabase.from('campus_green_cover').update(payload).eq('id', id)
        if (error) throw error
        toast.success('Entry updated!')
      } else {
        const { error } = await supabase.from('campus_green_cover').insert({ ...payload, added_by: profile?.id })
        if (error) throw error
        toast.success('Entry added!')
      }
      setShowModal(false)
      setEditingEntry(null)
      await fetchAll()
    } catch (err) {
      toast.error(err.message || 'Failed to save entry')
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.name}"? This action cannot be undone.`)) return
    const { error } = await supabase.from('campus_green_cover').delete().eq('id', item.id)
    if (error) {
      toast.error('Failed to delete entry')
      return
    }
    toast.success('Entry deleted')
    await fetchAll()
  }

  function handleExportPDF() {
    if (items.length === 0) {
      toast.error('No registry items to download')
      return
    }

    const headers = ['Name', 'Type', 'Count/Area', 'Zone', 'CO2/day (kg)', 'Date Planted', 'Notes']
    const rows = items.map(item => [
      item.name,
      GREEN_COVER_LABELS[item.type] || item.type,
      item.type === 'lawn' ? `${item.area_sqm} sqm` : (item.count || 0).toString(),
      item.zone,
      `${calculateItemAbsorption(item).toFixed(3)} kg`,
      item.date_planted || 'N/A',
      item.notes || 'N/A',
    ])

    exportTablePDF({
      title: "Campus Green Cover Report",
      subtitle: `CAMPUS ENVIRONMENTAL REGISTRY • ${items.length} ACTIVE REGISTERED ENTRIES`,
      headers,
      rows,
      filename: `green_cover_${new Date().getTime()}`,
      summaryCards: [
        { label: "TOTAL TREES", value: (summary?.totalTrees ?? 0).toString() },
        { label: "TOTAL PLANTS", value: (summary?.totalPlants ?? 0).toString() },
        { label: "DAILY ABSORPTION", value: `${totalAbsorbed.toFixed(2)} kg` },
        { label: "NET BALANCE", value: `${balance?.net >= 0 ? '+' : ''}${balance?.net?.toFixed(2)} kg` }
      ]
    })
    toast.success('Green Cover PDF report generated ✓')
  }

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'zone') return a.zone.localeCompare(b.zone)
    if (sortBy === 'type') return a.type.localeCompare(b.type)
    if (sortBy === 'co2') return calculateItemAbsorption(b) - calculateItemAbsorption(a)
    return 0
  })

  const totalAbsorbed = summary?.totalCO2Absorbed ?? 0

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em]">Campus Sustainability</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Green Cover</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              {summary ? `${summary.totalTrees} trees | ${summary.totalPlants} plants | ${totalAbsorbed.toFixed(2)} kg CO2 absorbed/day` : 'Loading...'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleExportPDF}
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
            >
              <Download size={14} /> Export PDF
            </button>
            <button
              onClick={fetchAll}
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={() => { setEditingEntry(null); setShowModal(true) }}
              className="px-5 py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-600/20 flex items-center gap-2"
            >
              <Plus size={14} /> Add Entry
            </button>
          </div>
        </div>

        {/* ── CARBON BALANCE SUMMARY BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[32px] p-6 border ${
            balance?.isNeutral
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Today's Absorption</p>
              <p className="text-xl font-black text-green-400">{totalAbsorbed.toFixed(2)} kg</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Student CO2 Today</p>
              <p className="text-xl font-black text-red-400">{todayStudentCO2.toFixed(2)} kg</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Net Balance</p>
              <p className={`text-xl font-black ${status?.textClass}`}>
                {balance?.net >= 0 ? '+' : ''}{balance?.net?.toFixed(2)} kg
                {balance?.isNeutral ? ' 🌿' : ' ⚠️'}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Trees Needed</p>
              <p className={`text-xl font-black ${balance?.isNeutral ? 'text-green-400' : 'text-amber-400'}`}>
                {balance?.treesNeededToNeutralize ?? 0}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Trees', val: (summary?.totalTrees ?? 0).toLocaleString(), icon: '🌳', color: 'text-green-400' },
            { label: 'Total Plants', val: (summary?.totalPlants ?? 0).toLocaleString(), icon: '🌿', color: 'text-emerald-400' },
            { label: 'Lawn Area', val: `${(summary?.totalLawnSqm ?? 0).toLocaleString()} sqm`, icon: '🌱', color: 'text-lime-400' },
            { label: 'CO2 Absorbed/day', val: `${totalAbsorbed.toFixed(2)} kg`, icon: '♻️', color: 'text-teal-400' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-[28px] p-5 backdrop-blur-xl"
            >
              <span className="text-2xl block mb-2">{s.icon}</span>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
            </motion.div>
          ))}
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl">
          <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Green Cover Registry</h3>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Sort:</span>
              {['zone', 'type', 'co2'].map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                    sortBy === s ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  {s === 'co2' ? 'CO2' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.03]">
                  {['Name', 'Type', 'Count / Area', 'Zone', 'CO2/day', 'Date Planted', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-16 text-center">
                    <div className="w-8 h-8 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin mx-auto" />
                  </td></tr>
                ) : sortedItems.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    No entries yet. Click "Add Entry" to begin.
                  </td></tr>
                ) : (
                  sortedItems.map(item => (
                    <tr key={item.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-white">{item.name}</span>
                        {item.notes && <p className="text-[8px] text-gray-600 mt-0.5 truncate max-w-[150px]">{item.notes}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-gray-400">
                          {GREEN_COVER_EMOJIS[item.type]} {item.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-black text-white">
                        {item.type === 'lawn' ? `${item.area_sqm} sqm` : item.count}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-[8px] font-black text-green-400 border border-green-500/20">
                          {item.zone}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-black text-green-400">
                        {calculateItemAbsorption(item).toFixed(3)} kg
                      </td>
                      <td className="px-6 py-4 text-[9px] font-black text-gray-500">
                        {item.date_planted || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditingEntry(item); setShowModal(true) }}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {/* Footer totals */}
                {sortedItems.length > 0 && (
                  <tr className="border-t-2 border-white/10 bg-white/[0.03]">
                    <td className="px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest" colSpan={4}>TOTAL</td>
                    <td className="px-6 py-4 text-[10px] font-black text-green-400">
                      {totalAbsorbed.toFixed(3)} kg/day
                    </td>
                    <td colSpan={2} className="px-6 py-4 text-[9px] font-black text-gray-600">
                      {items.length} entries
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-white/5">
            {loading ? (
              <div className="py-16 flex justify-center">
                <div className="w-8 h-8 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
              </div>
            ) : sortedItems.length === 0 ? (
              <div className="py-12 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest">
                No entries yet
              </div>
            ) : (
              sortedItems.map(item => (
                <div key={item.id} className="p-5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white truncate">{item.name}</p>
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">
                      {GREEN_COVER_EMOJIS[item.type]} {item.type.replace('_', ' ')} • {item.zone}
                    </p>
                    <p className="text-[8px] font-black text-green-400 mt-0.5">{calculateItemAbsorption(item).toFixed(3)} kg CO2/day</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingEntry(item); setShowModal(true) }}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── ZONE SUMMARY ── */}
        {zones.length > 0 && (
          <div>
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Zone Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((z, i) => (
                <motion.div
                  key={z.zone}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-[28px] p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                        <MapPin size={14} className="text-green-500" />
                      </div>
                      <p className="text-[10px] font-black text-white uppercase tracking-tight">{z.zone}</p>
                    </div>
                    <span className="text-[8px] font-black text-gray-500 uppercase">{z.items.length} entries</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-black">
                    <span className="text-gray-500">🌳 {z.treeCount} trees</span>
                    <span className="text-gray-500">🌿 {z.plantCount} plants</span>
                    <span className="text-green-400">{z.totalCO2.toFixed(3)} kg/day</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <EntryModal
          entry={editingEntry}
          onClose={() => { setShowModal(false); setEditingEntry(null) }}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  )
}

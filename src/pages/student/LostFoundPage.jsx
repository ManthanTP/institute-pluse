import { useState, useEffect } from 'react'
import { Search, Plus, MapPin, Calendar, Clock, Camera, CheckCircle2, ShieldAlert, Sparkles, Filter, X, ChevronLeft, Home, LayoutGrid, CalendarDays, Coffee, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import BottomTabBar from '../../components/BottomTabBar'

export default function LostFoundPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [newItem, setNewItem] = useState({ item_name: '', description: '', location: '', type: 'lost' })

  const [locations, setLocations] = useState([])

  useEffect(() => {
    fetchItems()
    fetchLocations()
  }, [])

  async function fetchLocations() {
    const { data } = await supabase.from('campus_locations').select('*').order('building').order('name')
    if (data) setLocations(data)
  }

  async function fetchItems() {
    setLoading(true)
    const { data, error } = await supabase
      .from('lost_found_items')
      .select('*, reporter:reported_by(full_name)')
      .order('created_at', { ascending: false })
    if (error) console.error('Fetch error:', error)
    if (data) setItems(data)
    setLoading(false)
  }

  async function reportItem() {
    if (!newItem.item_name.trim()) {
      toast.error('Item name is required')
      return
    }
    if (!newItem.description.trim()) {
      toast.error('Description is required')
      return
    }
    if (!profile?.id) {
      toast.error('Please login first')
      return
    }

    setSubmitting(true)
    const { data, error } = await supabase.from('lost_found_items').insert({
      reported_by: profile.id,
      item_name: newItem.item_name.trim(),
      description: newItem.description.trim(),
      location_found: newItem.location.trim() || null,
      type: newItem.type,
      status: 'open'
    }).select('*, reporter:reported_by(full_name)').single()

    if (error) {
      console.error('Report error:', error)
      toast.error('Failed to submit report: ' + (error.message || 'Unknown error'))
    } else {
      setItems([data, ...items])
      setIsAdding(false)
      setNewItem({ item_name: '', description: '', location: '', type: 'lost' })
      toast.success('Report Published Successfully! 📡')
    }
    setSubmitting(false)
  }

  const filtered = items.filter(i => {
    const matchesFilter = filter === 'All' || 
      (filter === 'Lost' && i.type === 'lost') ||
      (filter === 'Found' && i.type === 'found') ||
      (filter === 'Claimed' && i.status === 'claimed')
    const matchesSearch = (i.item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (i.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-[100dvh] bg-[#0a0c10] text-white pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-orange-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-blue-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-5 pt-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/dashboard')}
              className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl"
            >
              <ChevronLeft size={22} />
            </motion.button>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter">Lost & Found</h1>
              <p className="text-[8px] font-black text-orange-500 uppercase tracking-[0.3em]">Asset Recovery Hub</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAdding(true)}
            className="h-11 px-5 rounded-2xl bg-orange-600 text-white flex items-center gap-2 shadow-[0_0_20px_rgba(234,88,12,0.3)] text-[9px] font-black uppercase tracking-widest"
          >
             <Plus size={16} /> Report
          </motion.button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
            <Search size={18} />
          </div>
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-orange-500/50 transition-all"
          />
        </div>

        {/* CATEGORY TABS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1">
          {['All', 'Lost', 'Found', 'Claimed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                filter === f 
                  ? 'bg-orange-600 border-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]' 
                  : 'bg-white/5 border-white/10 text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ITEMS LIST */}
        <div className="space-y-4">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scanning Database...</p>
             </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
               <div className="text-4xl mb-3 opacity-40">🔍</div>
               <p className="text-xs font-black text-white uppercase tracking-widest">No Items Found</p>
               <p className="text-[10px] text-gray-500 mt-2">Be the first to report a lost or found item</p>
            </div>
          ) : filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#161b22]/80 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                    item.type === 'found' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 
                    'bg-orange-500/10 border-orange-500/20 text-orange-500'
                  }`}>
                    {item.type}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                    item.status === 'claimed' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                    'bg-white/5 border-white/10 text-gray-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">
                   <Calendar size={10} /> {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 leading-tight">{item.item_name}</h3>
              <p className="text-[11px] font-medium text-gray-500 leading-relaxed line-clamp-2 mb-5">{item.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                 <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                       <MapPin size={14} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[140px]">{item.location_found || 'Not specified'}</span>
                 </div>
                 <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                   By {item.reporter?.full_name || 'Anonymous'}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomTabBar />

      {/* REPORT MODAL (Portal) */}
      {createPortal(
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl pointer-events-auto"
                onClick={() => setIsAdding(false)}
              />
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-[#0a0c10] border-t border-white/10 rounded-t-[40px] p-6 shadow-2xl pointer-events-auto flex flex-col"
                style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
                
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-tight mb-0.5">Report Item</h2>
                    <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Asset Recovery Protocol</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400"><X size={18} /></button>
                </div>

                <div className="space-y-5 overflow-y-auto no-scrollbar max-h-[60vh] pr-1 pb-4">
                  {/* Type Selector */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Report Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['lost', 'found'].map(t => (
                        <button
                          key={t}
                          onClick={() => setNewItem({ ...newItem, type: t })}
                          className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            newItem.type === t 
                              ? t === 'lost' 
                                ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20' 
                                : 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                              : 'bg-white/5 border-white/10 text-gray-500'
                          }`}
                        >
                          {t === 'lost' ? '🔴 I Lost Something' : '🟢 I Found Something'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Item Name *</label>
                    <input 
                      value={newItem.item_name}
                      onChange={e => setNewItem({ ...newItem, item_name: e.target.value })}
                      placeholder="E.g. Blue Nike Backpack"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-orange-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Location Node</label>
                    <select
                      value={newItem.location}
                      onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                      className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-orange-500/50 transition-all appearance-none"
                    >
                      <option value="" className="bg-slate-900">Select a Location Node...</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={`${loc.building} - ${loc.name}`} className="bg-slate-900">
                          {loc.building} - {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Description *</label>
                    <textarea 
                      value={newItem.description}
                      onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                      rows={3}
                      placeholder="Provide identifying details..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-gray-600 outline-none resize-none focus:border-orange-500/50 transition-all"
                    />
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={reportItem}
                    disabled={submitting}
                    className="w-full py-5 rounded-2xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(234,88,12,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Submitting...</>
                    ) : (
                      'Publish Report'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

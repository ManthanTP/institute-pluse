import { useState, useEffect } from 'react'
import { Search, Plus, MapPin, Calendar, Clock, Camera, CheckCircle2, ShieldAlert, Sparkles, Filter, X, ChevronLeft, Home, LayoutGrid, CalendarDays, Coffee, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = ['Electronics', 'Personal', 'Books', 'Others']

export default function LostFoundPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [newItem, setNewItem] = useState({ title: '', description: '', location: '', category: 'Electronics' })

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    const { data } = await supabase.from('lost_found_items').select('*').order('created_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }

  async function reportItem() {
    if (!newItem.title || !profile?.id) return
    const { data, error } = await supabase.from('lost_found_items').insert({
      reported_by: profile.id,
      title: newItem.title,
      description: newItem.description,
      location_found: newItem.location,
      status: 'lost',
      category: newItem.category
    }).select().single()

    if (!error) {
      setItems([data, ...items])
      setIsAdding(false)
      setNewItem({ title: '', description: '', location: '', category: 'Electronics' })
      toast.success('Report Synchronized')
    }
  }

  const filtered = items.filter(i => {
    const matchesFilter = filter === 'All' || i.status === filter.toLowerCase()
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         i.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-[100dvh] bg-[#0a0c10] text-white pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-orange-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-blue-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Lost & Found</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAdding(true)}
            className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.3)]"
          >
             <Plus size={24} />
          </motion.button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-10">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black/40">
            <Search size={20} />
          </div>
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Protocol..."
            className="w-full bg-white rounded-3xl py-6 pl-16 pr-6 text-[13px] font-black text-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.1)] outline-none"
          />
        </div>

        {/* CATEGORY TABS */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-10 pb-2">
          {['All', 'Lost', 'Found', 'Returned'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                filter === f 
                  ? 'bg-orange-600 border-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)]' 
                  : 'bg-white/5 border-white/10 text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ITEMS LIST */}
        <div className="space-y-6">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Scanning Database...</p>
             </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl">
               <div className="text-4xl mb-4 opacity-40">🔍</div>
               <p className="text-xs font-black text-white uppercase tracking-widest italic">No Data Nodes Found</p>
            </div>
          ) : filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#161b22]/80 border border-white/5 rounded-[40px] p-8 backdrop-blur-2xl relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  item.status === 'returned' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                  item.status === 'found' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 
                  'bg-orange-500/10 border-orange-500/20 text-orange-500'
                }`}>
                  {item.status}
                </span>
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
                   <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 leading-none">{item.title}</h3>
              <p className="text-xs font-medium text-gray-500 leading-relaxed line-clamp-2 mb-8">{item.description}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                       <MapPin size={16} />
                    </div>
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[150px]">{item.location_found}</span>
                 </div>
                 <button className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] hover:text-white transition-colors">
                    Claim Hub
                 </button>
              </div>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                 <ShieldAlert size={80} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100]">
        <div className="bg-[#161b22]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <NavIcon icon={Home} label="Home" onClick={() => navigate('/dashboard')} />
          <NavIcon icon={LayoutGrid} label="Log" onClick={() => navigate('/carbon-log')} />
          <NavIcon icon={CalendarDays} label="Events" onClick={() => navigate('/events')} />
          <NavIcon icon={Coffee} label="Cafe" onClick={() => navigate('/cafeteria')} />
          <NavIcon icon={User} label="Me" onClick={() => navigate('/profile')} />
        </div>
      </div>

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
                className="relative w-full max-w-2xl bg-[#0a0c10] border-t border-white/10 rounded-t-[50px] p-6 md:p-10 shadow-2xl pointer-events-auto flex flex-col"
                style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-0.5">Report Node</h2>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Nexus Asset Recovery</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400"><X size={20} /></button>
                </div>

                <div className="space-y-6 overflow-y-auto no-scrollbar max-h-[60vh] pr-2 pb-10">
                  <div className="space-y-4">
                    <InputField label="Asset Title" placeholder="E.g. Blue Nike Backpack" value={newItem.title} onChange={v => setNewItem({ ...newItem, title: v })} />
                    <InputField label="Hub Location" placeholder="E.g. Block B, 2nd Floor" value={newItem.location} onChange={v => setNewItem({ ...newItem, location: v })} />
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Classification</label>
                      <select 
                        value={newItem.category}
                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                        className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Telemetry Brief</label>
                      <textarea 
                        value={newItem.description}
                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                        rows={3}
                        placeholder="Provide identifying characteristics..."
                        className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-5 text-white text-[11px] font-black uppercase tracking-widest outline-none resize-none shadow-inner"
                      />
                    </div>
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={reportItem}
                    className="w-full py-6 md:py-7 rounded-[28px] md:rounded-[32px] bg-orange-600 text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-[0_15px_40px_rgba(234,88,12,0.4)]"
                  >
                    Confirm & Publish Node
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

function NavIcon({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}`}>
        <Icon size={20} strokeWidth={active ? 3 : 2} />
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
    </button>
  )
}

function InputField({ label, placeholder, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">{label}</label>
      <input 
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#161b22] border border-white/5 rounded-3xl p-6 text-white text-[13px] font-black uppercase tracking-widest outline-none shadow-inner"
      />
    </div>
  )
}

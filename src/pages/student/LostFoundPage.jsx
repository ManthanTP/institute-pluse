import { useState, useEffect } from 'react'
import { Search, Plus, MapPin, Calendar, Clock, Camera, CheckCircle2, ShieldAlert, Sparkles, Filter, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function LostFoundPage() {
  const { profile } = useAuthStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [filter, setFilter] = useState('All')
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
      status: 'lost', // Defaulting to 'lost' reported by user
      category: newItem.category
    }).select().single()

    if (!error) {
      setItems([data, ...items])
      setIsAdding(false)
      setNewItem({ title: '', description: '', location: '', category: 'Electronics' })
      toast.success('Report Logged Successfully')
    }
  }

  const filtered = filter === 'All' ? items : items.filter(i => i.status === filter.toLowerCase())

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-orange-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-6">
        {/* HEADER AREA */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Campus Safety</span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2">Lost & Found</h1>
            <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] flex items-center gap-1.5">
               <ShieldAlert size={10} /> Recovery Protocol Active
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAdding(true)}
            className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/20"
          >
             <Plus size={22} />
          </motion.button>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar mb-8">
          {['All', 'Lost', 'Found', 'Returned'].map(f => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                filter === f 
                  ? 'bg-white text-slate-950 border-white' 
                  : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'
              }`}
            >
              {f}
            </motion.button>
          ))}
        </div>

        {/* ITEMS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <AnimatePresence mode="popLayout">
            {loading ? (
               <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scanning Database...</p>
               </div>
            ) : filtered.length === 0 ? (
               <div className="col-span-full py-12 text-center bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl">
                  <div className="text-4xl mb-4 opacity-40">🔍</div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">No Items Tracked</p>
                  <p className="text-[10px] font-medium text-gray-500 mt-2">All assets are currently accounted for.</p>
               </div>
            ) : filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4 relative z-10">
                   <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                     item.status === 'returned' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                     item.status === 'found' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 
                     'bg-orange-500/10 border-orange-500/20 text-orange-500'
                   }`}>
                     {item.status}
                   </div>
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                      <Calendar size={10} /> {new Date(item.created_at).toLocaleDateString()}
                   </div>
                </div>

                <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2 relative z-10">{item.title}</h3>
                <p className="text-[10px] font-medium text-gray-500 line-clamp-2 mb-6 relative z-10">{item.description}</p>
                
                <div className="flex items-center justify-between relative z-10 pt-4 border-t border-white/5">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                         <MapPin size={14} />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[120px]">{item.location_found}</span>
                   </div>
                   <button className="text-[9px] font-black text-orange-500 uppercase tracking-widest hover:text-white transition-colors">
                      Claim Identity
                   </button>
                </div>
              </motion.div>
            ))}
           </AnimatePresence>
        </div>
      </div>

      {/* REPORT MODAL */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60]"
              onClick={() => setIsAdding(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 lg:left-72 bg-slate-900 border-t border-white/10 rounded-t-[48px] z-[70] p-10 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Report Item</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Nexus Asset Recovery</p>
                 </div>
                 <button onClick={() => setIsAdding(false)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Title</label>
                    <input 
                      value={newItem.title}
                      onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder="E.g. Blue Nike Backpack"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-[11px] font-black uppercase tracking-widest outline-none focus:border-orange-500/50"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Location</label>
                    <input 
                      value={newItem.location}
                      onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                      placeholder="E.g. Block B, 2nd Floor"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-[11px] font-black uppercase tracking-widest outline-none focus:border-orange-500/50"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newItem.category}
                      onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-[11px] font-black uppercase tracking-widest outline-none appearance-none"
                    >
                       <option value="Electronics">Electronics</option>
                       <option value="Personal">Personal Items</option>
                       <option value="Books">Books & Stationary</option>
                       <option value="Others">Others</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      value={newItem.description}
                      onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                      rows={3}
                      placeholder="Provide specific details to help identify..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-[11px] font-black uppercase tracking-widest outline-none focus:border-orange-500/50 resize-none"
                    />
                 </div>

                 <button 
                  onClick={reportItem}
                  className="w-full py-5 rounded-[28px] bg-orange-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20"
                 >
                    Publish Report
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

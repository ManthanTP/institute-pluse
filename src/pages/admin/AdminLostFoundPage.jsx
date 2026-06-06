import { useState, useEffect } from 'react'
import { Search, MapPin, Package, Clock, CheckCircle2, XCircle, Trash2, ShieldAlert, Filter, Camera, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminLostFoundPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetchItems()

    const channel = supabase
      .channel('admin_lost_found')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lost_found_items' }, () => fetchItems())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchItems() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('lost_found_items')
        .select('*, reporter:profiles!reported_by(full_name, email)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setItems(data)
    } catch (err) {
      toast.error('Inventory Sync Failed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('lost_found_items').update({ status }).eq('id', id)
    if (!error) {
      toast.success(`Protocol Updated: ${status.toUpperCase()}`)
      fetchItems()
    } else {
      toast.error('Failed to update status')
    }
  }

  async function deleteItem(id) {
    if (!confirm('Permanently remove this record?')) return
    const { error } = await supabase.from('lost_found_items').delete().eq('id', id)
    if (!error) {
      toast.success('Record Erased')
      fetchItems()
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Asset Recovery Protocol</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Lost & <span className="text-red-500">Found</span></h2>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex gap-2 p-2 bg-[#0f172a]/60 border border-white/10 rounded-2xl">
                {['open', 'claimed', 'archived'].map((type) => (
                   <button
                     key={type}
                     onClick={() => setFilter(type)}
                     className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === type ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                   >
                     {type}
                   </button>
                ))}
             </div>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="relative group">
           <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={20} />
           <input 
             type="text" 
             placeholder="SCAN INVENTORY BY NAME OR LOCATION..."
             className="w-full bg-[#0f172a]/60 border border-white/10 rounded-[32px] py-8 pl-20 pr-10 text-[12px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-red-500/50 transition-all"
           />
        </div>

        {/* ITEMS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <AnimatePresence mode="popLayout">
              {items.filter(i => i.status === filter).map((item, idx) => (
                 <motion.div 
                   key={item.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-[#0f172a]/40 border border-white/5 rounded-[48px] p-10 group hover:border-red-500/30 transition-all relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldAlert size={80} /></div>
                    
                    <div className="w-full aspect-video bg-white/5 rounded-[32px] mb-8 flex items-center justify-center text-gray-700 border border-white/5 group-hover:border-red-500/20 transition-all overflow-hidden relative">
                       <Camera size={40} className="group-hover:scale-110 transition-transform" />
                       <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[8px] font-black text-red-500 uppercase tracking-widest border border-white/10">ID: {item.id.slice(0, 8)}</div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${item.type === 'found' ? 'text-green-500' : 'text-orange-500'}`}>{item.type}</span>
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                       </div>
                       <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic line-clamp-1">{item.item_name}</h4>
                       <p className="text-[10px] text-gray-500 font-medium leading-relaxed line-clamp-2">{item.description}</p>
                       
                       <div className="flex items-center gap-2 text-gray-500 pt-2">
                          <MapPin size={14} className="text-red-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest truncate">{item.location_found || 'General Campus'}</span>
                       </div>

                       <div className="pt-6 border-t border-white/5 mt-6 flex flex-col gap-3">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Reporter</span>
                             <span className="text-[10px] font-black text-white uppercase tracking-widest truncate">{item.reporter?.full_name || 'Unknown'}</span>
                          </div>
                          <div className="flex gap-2">
                             {item.status === 'open' && (
                                <button onClick={() => updateStatus(item.id, 'claimed')} className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:scale-105 transition-all">Mark Claimed</button>
                             )}
                             {item.status === 'claimed' && (
                                <button onClick={() => updateStatus(item.id, 'archived')} className="flex-1 py-4 bg-white/5 border border-white/10 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">Archive</button>
                             )}
                             <button onClick={() => deleteItem(item.id)} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  )
}

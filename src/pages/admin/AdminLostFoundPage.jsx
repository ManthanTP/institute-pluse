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
  }, [])

  async function fetchItems() {
    try {
      setLoading(true)
      // Mock Data
      setItems([
        { id: 1, name: 'iPhone 13 Pro', category: 'Electronics', location: 'Cafeteria Area', date: '2026-05-12', status: 'pending', finder: 'Siddharth R.' },
        { id: 2, name: 'Leather Wallet (Brown)', category: 'Personal', location: 'Library Floor 2', date: '2026-05-11', status: 'verified', finder: 'Anjali V.' },
        { id: 3, name: 'Scientific Calculator', category: 'Academic', location: 'Lab 402', date: '2026-05-10', status: 'pending', finder: 'Prof. Gupta' },
      ])
    } catch (err) {
      toast.error('Inventory Sync Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-blue-500" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Asset Recovery Protocol</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Lost & <span className="text-blue-500">Found</span></h2>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex gap-2 p-2 bg-[#0f172a]/60 border border-white/10 rounded-2xl">
                {['pending', 'verified', 'archived'].map((type) => (
                   <button
                     key={type}
                     onClick={() => setFilter(type)}
                     className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === type ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                   >
                     {type}
                   </button>
                ))}
             </div>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="relative group">
           <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
           <input 
             type="text" 
             placeholder="SCAN INVENTORY BY NAME OR LOCATION..."
             className="w-full bg-[#0f172a]/60 border border-white/10 rounded-[32px] py-8 pl-20 pr-10 text-[12px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-blue-500/50 transition-all"
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
                   className="bg-[#0f172a]/40 border border-white/5 rounded-[48px] p-10 group hover:border-blue-500/30 transition-all relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldAlert size={80} /></div>
                    
                    <div className="w-full aspect-square bg-white/5 rounded-[32px] mb-8 flex items-center justify-center text-gray-700 border border-white/5 group-hover:border-blue-500/20 transition-all overflow-hidden relative">
                       <Camera size={40} className="group-hover:scale-110 transition-transform" />
                       <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[8px] font-black text-blue-500 uppercase tracking-widest border border-white/10">ID: RECOVER-00{item.id}</div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{item.category}</span>
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{item.date}</span>
                       </div>
                       <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">{item.name}</h4>
                       
                       <div className="flex items-center gap-2 text-gray-500">
                          <MapPin size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{item.location}</span>
                       </div>

                       <div className="pt-6 border-t border-white/5 mt-6 flex gap-3">
                          <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">Verify Claim</button>
                          <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white transition-all"><ArrowRight size={18} /></button>
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

import { useState, useEffect } from 'react'
import { Map, MapPin, Search, Plus, Trash2, Edit3, Navigation, Layers, Compass, Globe, Zap, ArrowUpRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminNavigationPage() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  async function fetchLocations() {
    try {
      setLoading(true)
      // Mock Data
      setLocations([
        { id: 1, name: 'Main Admin Block', type: 'Administrative', coordinates: '15.3647, 75.1245', status: 'active' },
        { id: 2, name: 'Library Central', type: 'Academic', coordinates: '15.3650, 75.1248', status: 'active' },
        { id: 3, name: 'Green Cafe', type: 'Cafeteria', coordinates: '15.3642, 75.1240', status: 'maintenance' },
      ])
    } catch (err) {
      toast.error('Spatial Data Synchronization Failed')
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
              <Compass size={14} className="text-blue-500" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Campus Topology Nexus</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Spatial <span className="text-blue-500">Inventory</span></h2>
          </div>

          <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">Add Navigation Node</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* MAP PREVIEW */}
           <div className="lg:col-span-2">
              <div className="bg-[#0f172a]/60 border border-white/10 rounded-[60px] p-10 h-[600px] relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Globe size={120} className="text-blue-500/10 group-hover:scale-110 transition-transform duration-[2000ms]" />
                 </div>
                 
                 {/* MOCK MAP MARKERS */}
                 <div className="absolute top-1/4 left-1/3 p-4 bg-blue-600 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-bounce">
                    <MapPin size={24} className="text-white" />
                 </div>
                 <div className="absolute bottom-1/3 right-1/4 p-4 bg-green-500 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                    <MapPin size={24} className="text-white" />
                 </div>

                 <div className="absolute bottom-10 left-10 p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-[32px] space-y-4">
                    <div className="flex items-center gap-3">
                       <Zap size={16} className="text-blue-500" />
                       <span className="text-[11px] font-black text-white uppercase tracking-widest">Realtime Position Sync</span>
                    </div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">System is currently tracking 1,240 active campus terminals within the spatial grid.</p>
                 </div>
              </div>
           </div>

           {/* NODE LIST */}
           <div className="space-y-6">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] px-4">Navigation Registry</h4>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
                 <AnimatePresence mode="popLayout">
                    {locations.map((loc, idx) => (
                       <motion.div 
                         key={loc.id}
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         className="bg-[#0f172a]/40 border border-white/5 rounded-[40px] p-8 hover:border-blue-500/30 transition-all group"
                       >
                          <div className="flex items-start justify-between mb-6">
                             <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${loc.status === 'maintenance' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                   <MapPin size={20} />
                                </div>
                                <div>
                                   <h4 className="text-lg font-black text-white uppercase tracking-tight">{loc.name}</h4>
                                   <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{loc.type}</span>
                                </div>
                             </div>
                             <button className="p-3 bg-white/5 rounded-xl text-gray-700 hover:text-white transition-all"><ArrowUpRight size={16} /></button>
                          </div>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-white/5">
                             <div className="flex items-center gap-2 text-gray-600">
                                <Navigation size={12} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">{loc.coordinates}</span>
                             </div>
                             <div className="flex gap-2">
                                <button className="p-2 text-gray-700 hover:text-blue-500 transition-all"><Edit3 size={14} /></button>
                                <button className="p-2 text-gray-700 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                             </div>
                          </div>
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  )
}

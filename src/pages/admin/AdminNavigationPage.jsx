import { useState, useEffect } from 'react'
import { MapPin, Search, Plus, Trash2, Edit3, Navigation, Layers, Compass, Building2, AlignLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminNavigationPage() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Academic',
    building: '',
    floor: '',
    description: ''
  })

  useEffect(() => {
    fetchLocations()
  }, [])

  async function fetchLocations() {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('campus_locations').select('*').order('building').order('name')
      if (error) throw error
      setLocations(data || [])
    } catch (err) {
      toast.error('Failed to fetch spatial data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const { error } = await supabase.from('campus_locations').insert([formData])
      if (error) throw error
      
      toast.success('Location added to directory')
      setIsAdding(false)
      setFormData({ name: '', type: 'Academic', building: '', floor: '', description: '' })
      fetchLocations()
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this location?')) return
    const { error } = await supabase.from('campus_locations').delete().eq('id', id)
    if (!error) {
      toast.success('Location deleted')
      fetchLocations()
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Compass size={14} className="text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Campus Topology</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Spatial <span className="text-red-500">Directory</span></h2>
          </div>

          {!isAdding && (
            <button onClick={() => setIsAdding(true)} className="px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:scale-105 transition-all flex items-center gap-2">
              <Plus size={16} /> Add Location
            </button>
          )}
        </div>

        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#161b22] border border-white/10 rounded-[32px] p-8">
            <h3 className="text-xl font-black text-white uppercase italic mb-6">New Location Protocol</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Room Name / Number</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-sm text-white outline-none focus:border-red-500/50" placeholder="e.g. Room 304, Main Library" />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Block / Building</label>
                <input required value={formData.building} onChange={e => setFormData({...formData, building: e.target.value})} className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-sm text-white outline-none focus:border-red-500/50" placeholder="e.g. Block Z, Admin Block" />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Floor</label>
                <input required value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-sm text-white outline-none focus:border-red-500/50" placeholder="e.g. Ground Floor, 3rd Floor" />
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-sm text-white outline-none focus:border-red-500/50 appearance-none">
                  {['Academic', 'Administrative', 'Cafeteria', 'Laboratory', 'Utility', 'Other'].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Direction Reference (Guide)</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-sm text-white outline-none focus:border-red-500/50 min-h-[100px]" placeholder="e.g. Take the left stairs from the main entrance, 2nd door on the right." />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-4 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10">Cancel</button>
                <button type="submit" className="px-8 py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500">Save Location</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full py-20 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">Loading Spatial Grid...</div>
          ) : locations.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-[#161b22] border border-white/10 rounded-[32px]">
               <MapPin size={40} className="mx-auto text-gray-600 mb-4 opacity-50" />
               <p className="text-xs font-black text-gray-500 uppercase tracking-widest">No Locations Found in Directory</p>
             </div>
          ) : locations.map((loc) => (
             <div key={loc.id} className="bg-[#161b22] border border-white/5 rounded-[32px] p-6 hover:border-red-500/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                   <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">{loc.name}</h4>
                      <span className="inline-block px-2 py-1 mt-2 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-red-500/20">{loc.type}</span>
                   </div>
                   <button onClick={() => handleDelete(loc.id)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 size={14}/></button>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-white/5">
                   <div className="flex items-center gap-3">
                      <Building2 size={14} className="text-gray-500" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Block: <span className="text-white">{loc.building}</span></span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Layers size={14} className="text-gray-500" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Floor: <span className="text-white">{loc.floor}</span></span>
                   </div>
                   <div className="flex items-start gap-3 mt-4 pt-4 border-t border-white/5">
                      <AlignLeft size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-gray-500 leading-relaxed">{loc.description}</p>
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

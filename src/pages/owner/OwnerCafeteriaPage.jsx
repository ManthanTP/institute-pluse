import { useState, useEffect, useRef } from 'react'
import { UtensilsCrossed, Plus, Search, Edit3, Trash2, CheckCircle2, Clock, Leaf, Info, Filter, MoreHorizontal, ShoppingBag, X, QrCode, Scan } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import OwnerLayout from './OwnerLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import OrderScannerModal from '../../components/OrderScannerModal'

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Dinner']

export default function OwnerCafeteriaPage() {
  const [activeTab, setActiveTab] = useState('orders') 
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('owner_cafeteria_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev])
          toast('New order received!', { icon: '🍱' })
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchData() {
    setLoading(true)
    const [ordersRes, menuRes] = await Promise.all([
      supabase.from('orders').select('*, profiles(full_name, role)').order('created_at', { ascending: false }),
      supabase.from('menu_items').select('*').order('name', { ascending: true })
    ])

    if (ordersRes.data) setOrders(ordersRes.data)
    if (menuRes.data) setMenuItems(menuRes.data)
    setLoading(false)
  }

  async function updateOrderStatus(id, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (!error) toast.success(`Order marked as ${status}`)
  }

  async function toggleAvailability(id, current) {
    const { error } = await supabase.from('menu_items').update({ available: !current }).eq('id', id)
    if (!error) {
      setMenuItems(prev => prev.map(item => item.id === id ? { ...item, available: !current } : item))
      toast.success('Availability updated')
    }
  }

  async function deleteMenuItem(id) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (!error) {
      setMenuItems(prev => prev.filter(item => item.id !== id))
      toast.success('Item removed')
    }
  }

  async function handleSaveItem(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const itemData = {
      name: formData.get('name'),
      category: formData.get('category').toLowerCase(),
      price: parseFloat(formData.get('price')),
      carbon_kg: parseFloat(formData.get('carbon_kg')),
      description: formData.get('description'),
      is_vegetarian: formData.get('is_vegetarian') === 'on',
      available: true
    }

    const { error } = selectedItem?.id 
      ? await supabase.from('menu_items').update(itemData).eq('id', selectedItem.id)
      : await supabase.from('menu_items').insert(itemData)

    if (!error) {
      toast.success('Registry updated')
      setIsModalOpen(false)
      fetchData()
    }
  }

  const filteredMenu = menuItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || item.category === activeCategory.toLowerCase()
    return matchSearch && matchCat
  })

  return (
    <OwnerLayout>
      <div className="space-y-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Cafeteria Hub</h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Active Order Telemetry & Registry</p>
            </div>
            <button 
              onClick={() => setIsScannerOpen(true)} 
              className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 hover:scale-105 transition-all"
            >
              <Scan size={14} /> Scan Order
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
             <div className="flex-1 flex p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                <button 
                  onClick={() => setActiveTab('orders')} 
                  className={`flex-1 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-gray-500 hover:text-white'}`}
                >
                  Orders
                </button>
                <button 
                  onClick={() => setActiveTab('menu')} 
                  className={`flex-1 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'menu' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-gray-500 hover:text-white'}`}
                >
                  Menu Hub
                </button>
             </div>
             <button 
               onClick={() => setIsScannerOpen(true)} 
               className="md:hidden flex items-center justify-center gap-3 py-4 rounded-2xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
             >
                <Scan size={16} /> Quick Scan Order
             </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1 bg-white/5 border-b border-l border-white/10 rounded-bl-xl text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  Queue #{orders.length - i}
                </div>
                
                <div className="flex justify-between items-start mb-6 pt-2">
                  <div>
                    <span className="text-xl font-black text-white block">#{order.token_number || order.id.slice(0,4).toUpperCase()}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${order.profiles?.role === 'faculty' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                        {order.profiles?.role || 'Guest'}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 uppercase truncate max-w-[120px]">
                        {order.profiles?.full_name}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-orange-500/10 text-orange-500 border border-orange-500/20">{order.status}</span>
                </div>
                <div className="space-y-2 mb-8">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] font-black uppercase text-gray-400">
                      <span>{it.quantity}x {it.name}</span>
                      <span>₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-white/5 flex gap-2">
                   {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="flex-1 py-3 rounded-xl bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest">Prepare</button>}
                   {order.status === 'preparing' && <button onClick={() => updateOrderStatus(order.id, 'ready')} className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest">Ready</button>}
                   {order.status === 'ready' && <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="flex-1 py-3 rounded-xl bg-green-600 text-white text-[9px] font-black uppercase tracking-widest">Done</button>}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            <div className="flex flex-col sm:flex-row gap-4">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search registry..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[11px] font-black text-white uppercase outline-none focus:border-orange-500" />
              <button onClick={() => { setSelectedItem(null); setIsModalOpen(true); }} className="w-full sm:w-auto px-8 py-4 sm:py-0 rounded-2xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20">Add Item</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredMenu.map(item => (
                  <motion.div key={item.id} layout className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl group hover:bg-white/[0.08] transition-all">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <h4 className="text-sm font-black text-white uppercase tracking-tight">{item.name}</h4>
                           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{item.category}</p>
                        </div>
                        <span className="text-sm font-black text-orange-500">₹{item.price}</span>
                     </div>
                     
                     <div className="flex items-center gap-2 mb-6">
                        <button 
                          onClick={() => toggleAvailability(item.id, item.available)}
                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${
                            item.available 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}
                        >
                           {item.available ? 'In Stock' : 'Sold Out'}
                        </button>
                        <div className="flex items-center gap-1 text-[8px] font-black text-gray-500 uppercase">
                           <Leaf size={10} className="text-green-500" />
                           {item.carbon_kg}kg CO2
                        </div>
                     </div>

                     <div className="flex gap-2 pt-4 border-t border-white/5">
                        <button 
                          onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-[9px] font-black uppercase tracking-widest"
                        >
                           <Edit3 size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => deleteMenuItem(item.id)}
                          className="px-4 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                           <Trash2 size={14} />
                        </button>
                     </div>
                  </motion.div>
               ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[48px] p-12 shadow-2xl">
               <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10">{selectedItem ? 'Edit Item' : 'New Item'}</h2>
               <form onSubmit={handleSaveItem} className="space-y-6">
                  <input name="name" defaultValue={selectedItem?.name} placeholder="Item Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white" required />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="price" type="number" step="0.01" defaultValue={selectedItem?.price} placeholder="Price" className="bg-white/5 border border-white/10 rounded-2xl p-5 text-white" required />
                    <input name="carbon_kg" type="number" step="0.01" defaultValue={selectedItem?.carbon_kg} placeholder="Carbon kg" className="bg-white/5 border border-white/10 rounded-2xl p-5 text-white" required />
                  </div>
                  <select name="category" defaultValue={selectedItem?.category} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white uppercase">
                     {CATEGORIES.slice(1).map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                  <button type="submit" className="w-full py-6 rounded-3xl bg-orange-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20">Save Registry Entry</button>
               </form>
            </motion.div>
          </div>
        )}

        <OrderScannerModal 
          isOpen={isScannerOpen} 
          onClose={() => setIsScannerOpen(false)}
          onOrderProcessed={() => fetchData()}
        />
      </AnimatePresence>
    </OwnerLayout>
  )
}

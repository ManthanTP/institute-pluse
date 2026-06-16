import { useState, useEffect } from 'react'
import { UtensilsCrossed, Plus, Search, Edit3, Trash2, CheckCircle2, Clock, Leaf, Info, Filter, MoreHorizontal, ShoppingBag, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

import { useAuthStore } from '../../store/index'
import { exportTablePDF } from '../../lib/pdfExport'

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Dinner']

export default function AdminCafeteriaPage() {
  const { profile } = useAuthStore()
  const [activeTab, setActiveTab] = useState('orders') // 'orders' | 'menu'
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchData()

    // Real-time orders
    const channel = supabase
      .channel('admin_cafeteria_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev])
          toast('New order received! 🍱', { icon: '🔔' })
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
    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(`Order marked as ${status}`)
    }
  }

  async function toggleAvailability(id, current) {
    const { error } = await supabase.from('menu_items').update({ available: !current }).eq('id', id)
    if (!error) {
      setMenuItems(prev => prev.map(item => item.id === id ? { ...item, available: !current } : item))
      toast.success('Availability updated')
    }
  }

  async function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (!error) {
      setMenuItems(prev => prev.filter(item => item.id !== id))
      toast.success('Item deleted')
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
      is_vegan: formData.get('is_vegan') === 'on',
      available: true
    }

    let error
    if (selectedItem?.id) {
      const res = await supabase.from('menu_items').update(itemData).eq('id', selectedItem.id)
      error = res.error
    } else {
      const res = await supabase.from('menu_items').insert(itemData)
      error = res.error
    }

    if (error) {
      toast.error('Failed to save item')
    } else {
      toast.success('Item saved successfully')
      setIsModalOpen(false)
      fetchData()
    }
  }

  const filteredMenu = menuItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || item.category === activeCategory.toLowerCase()
    return matchSearch && matchCat
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending' || o.status === 'preparing').length,
    revenue: orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)
  }

  async function downloadOrdersPDF() {
    toast.loading('Fetching latest orders...', { id: 'pdf-fetch' })
    const { data: latestOrders, error } = await supabase
      .from('orders')
      .select('*, profiles(full_name, role)')
      .order('created_at', { ascending: false })

    if (error || !latestOrders) {
      toast.error('Failed to fetch latest orders', { id: 'pdf-fetch' })
      return
    }
    toast.dismiss('pdf-fetch')

    if (latestOrders.length === 0) {
      toast.error('No orders to download')
      return
    }

    const headers = ['Token', 'Customer', 'Role', 'Items', 'Total Price', 'Carbon Impact', 'Status', 'Payment', 'Date']
    const rows = latestOrders.map(order => {
      const customer = order.profiles?.full_name || 'Guest'
      const role = order.profiles?.role || 'Guest'
      const itemsStr = order.items?.map(it => `${it.quantity}x ${it.name}`).join(', ')
      const date = new Date(order.created_at).toLocaleDateString()
      
      return [
        order.token_number || order.id.slice(0, 4).toUpperCase(),
        customer,
        role,
        itemsStr || 'N/A',
        `$${order.total_price}`,
        `${order.total_carbon_kg || 0} kg CO2`,
        order.status,
        `${order.payment_status} (${order.payment_method || 'N/A'})`,
        date
      ]
    })

    const totalRevenue = latestOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)

    exportTablePDF({
      title: "Cafeteria Operations Report",
      subtitle: `CAMPUS OPERATIONAL OVERVIEW • ${latestOrders.length} LOGGED ORDERS`,
      headers,
      rows,
      filename: `admin_cafeteria_orders_${new Date().getTime()}`,
      summaryCards: [
        { label: "TOTAL ORDERS", value: latestOrders.length.toString() },
        { label: "TOTAL REVENUE", value: `$${totalRevenue}` }
      ]
    })
    toast.success('Dining Operations PDF generated ✓')
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* TELEMETRY BAR (Owner Dashboard Integration) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Today's Traffic</p>
              <div className="flex items-end gap-2">
                 <span className="text-2xl font-black text-white">{stats.total}</span>
                 <span className="text-[10px] font-bold text-green-500 mb-1 uppercase">Orders</span>
              </div>
           </div>
           <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Active Prep</p>
              <div className="flex items-end gap-2">
                 <span className="text-2xl font-black text-orange-500">{stats.pending}</span>
                 <span className="text-[10px] font-bold text-orange-500/50 mb-1 uppercase">In Kitchen</span>
              </div>
           </div>
           <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Total Revenue</p>
              <div className="flex items-end gap-2">
                 <span className="text-2xl font-black text-white">₹{stats.revenue.toLocaleString()}</span>
                 <span className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Credits</span>
              </div>
           </div>
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Cafeteria Operations Node</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Dining Control</h2>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={downloadOrdersPDF}
               className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-emerald-600/10"
             >
                Download PDF
             </button>
             <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-slate-950 shadow-xl' : 'text-gray-500 hover:text-white'}`}
                >
                   Order Stream
                </button>
                <button 
                  onClick={() => setActiveTab('menu')}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'menu' ? 'bg-white text-slate-950 shadow-xl' : 'text-gray-500 hover:text-white'}`}
                >
                   Menu Registry
                </button>
             </div>
          </div>
        </div>

        {activeTab === 'orders' ? (
          /* ORDERS SECTION */
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <AnimatePresence mode="popLayout">
                 {loading ? (
                    <div className="col-span-full py-20 text-center"><div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto" /></div>
                 ) : orders.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-[40px]"><p className="text-xs font-black text-gray-600 uppercase tracking-widest">No Active Orders</p></div>
                 ) : orders.map((order, i) => (
                   <motion.div
                     key={order.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl relative overflow-hidden group"
                   >
                     {/* QUEUE RANK */}
                     <div className="absolute top-0 right-0 px-4 py-1 bg-white/5 border-b border-l border-white/10 rounded-bl-xl text-[9px] font-black text-gray-500 uppercase tracking-widest">
                        Queue #{orders.length - i}
                     </div>

                     <div className={`absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-20 transition-opacity ${
                       order.status === 'pending' ? 'text-red-500' : 
                       order.status === 'preparing' ? 'text-yellow-500' : 
                       order.status === 'ready' ? 'text-blue-500' : 'text-green-500'
                     }`}>
                        <ShoppingBag size={24} />
                     </div>
                     
                     <div className="flex items-center justify-between mb-6 pt-2">
                        <div>
                          <span className="text-[20px] font-black text-white tracking-tighter block">#{order.token_number || order.id.slice(0,4).toUpperCase()}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${order.profiles?.role === 'faculty' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                              {order.profiles?.role || 'Guest'}
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          order.status === 'pending' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                          order.status === 'preparing' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                          order.status === 'ready' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                          'bg-green-500/10 text-green-500 border border-green-500/20'
                        }`}>
                          {order.status}
                        </span>
                     </div>

                     <div className="space-y-3 mb-8">
                        {order.items?.map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight">
                              <span className="text-gray-400">{item.quantity}x <span className="text-white">{item.name}</span></span>
                              <span className="text-gray-500">₹{item.price * item.quantity}</span>
                           </div>
                        ))}
                     </div>

                     <div className="pt-6 border-t border-white/5 flex items-center justify-between mb-8">
                        <div>
                           <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Identity</p>
                           <p className="text-[10px] font-black text-white uppercase truncate max-w-[120px]">{order.profiles?.full_name || 'Student'}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Payload</p>
                           <p className="text-[10px] font-black text-orange-500 uppercase">₹{order.total_price}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        {order.status === 'pending' && (
                           <button 
                             onClick={() => updateOrderStatus(order.id, 'preparing')}
                             className="col-span-2 py-3 rounded-2xl bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all"
                           >
                             Initialize Preparation
                           </button>
                        )}
                        {order.status === 'preparing' && (
                           <button 
                             onClick={() => updateOrderStatus(order.id, 'ready')}
                             className="col-span-2 py-3 rounded-2xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all"
                           >
                             Mark as Ready
                           </button>
                        )}
                        {order.status === 'ready' && (
                           <button 
                             onClick={() => updateOrderStatus(order.id, 'delivered')}
                             className="col-span-2 py-3 rounded-2xl bg-green-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-green-500 transition-all"
                           >
                             Complete Handover
                           </button>
                        )}
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
          </div>
        ) : (
          /* MENU SECTION */
          <div className="space-y-10">
            {/* SEARCH & ADD */}
            <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative group">
                  <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search menu registry..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-orange-500/50 transition-all"
                  />
               </div>
               <div className="flex gap-4">
                  <select 
                    value={activeCategory}
                    onChange={e => setActiveCategory(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 text-[10px] font-black text-white uppercase tracking-widest outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all"
                  >
                     {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c} Node</option>)}
                  </select>
                  <button 
                    onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
                    className="px-8 py-4 rounded-2xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 shadow-xl shadow-orange-600/20 transition-all flex items-center gap-3"
                  >
                     <Plus size={16} /> New Item
                  </button>
               </div>
            </div>

            {/* MENU TABLE / LIST */}
            <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-white/5 border-b border-white/5">
                           {['Item Manifest', 'Category', 'Price', 'Impact', 'Availability', ''].map(h => (
                             <th key={h} className="px-8 py-6 text-[9px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                           ))}
                        </tr>
                     </thead>
                     <tbody>
                        {filteredMenu.map((item, i) => (
                          <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                                      {item.is_vegan ? '🌱' : item.is_vegetarian ? '🥗' : '🍗'}
                                   </div>
                                   <div>
                                      <p className="text-[11px] font-black text-white uppercase tracking-tight mb-0.5">{item.name}</p>
                                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[200px]">{item.description}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.category}</span>
                             </td>
                             <td className="px-8 py-6 font-black text-white text-xs">₹{item.price}</td>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-green-500 uppercase tracking-widest">
                                   <Leaf size={12} /> {item.carbon_kg}kg
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <button 
                                  onClick={() => toggleAvailability(item.id, item.available)}
                                  className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                    item.available ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                  }`}
                                >
                                   {item.available ? 'Available' : 'Sold Out'}
                                </button>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}
                                     className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                                   >
                                      <Edit3 size={14} />
                                   </button>
                                   <button 
                                     onClick={() => deleteMenuItem(item.id)}
                                     className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                                   >
                                      <Trash2 size={14} />
                                   </button>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FOR ADD/EDIT */}
      <AnimatePresence>
         {isModalOpen && (
           <>
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md"
               onClick={() => setIsModalOpen(false)}
             />
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="fixed inset-x-6 top-[10%] bottom-[10%] max-w-2xl mx-auto bg-slate-900 border border-white/10 rounded-[48px] z-[101] p-12 overflow-y-auto no-scrollbar shadow-2xl"
             >
                <div className="flex items-center justify-between mb-10">
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedItem ? 'Edit Manifest' : 'New Registry Item'}</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500"><X size={20} /></button>
                </div>

                <form onSubmit={handleSaveItem} className="space-y-8">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2 col-span-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Item Name</label>
                         <input name="name" defaultValue={selectedItem?.name} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-orange-500/30" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
                         <select name="category" defaultValue={selectedItem?.category || 'Lunch'} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none">
                            {CATEGORIES.slice(1).map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Price (₹)</label>
                         <input name="price" type="number" step="0.01" defaultValue={selectedItem?.price} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Carbon Impact (kg CO2)</label>
                         <input name="carbon_kg" type="number" step="0.01" defaultValue={selectedItem?.carbon_kg} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none" required />
                      </div>
                      <div className="flex gap-6 items-center pt-8">
                         <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" name="is_vegetarian" defaultChecked={selectedItem?.is_vegetarian} className="hidden peer" />
                            <div className="w-6 h-6 rounded-lg border border-white/10 peer-checked:bg-green-600 flex items-center justify-center transition-all">
                               <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white">Veg</span>
                         </label>
                         <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" name="is_vegan" defaultChecked={selectedItem?.is_vegan} className="hidden peer" />
                            <div className="w-6 h-6 rounded-lg border border-white/10 peer-checked:bg-green-600 flex items-center justify-center transition-all">
                               <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white">Vegan</span>
                         </label>
                      </div>
                      <div className="space-y-2 col-span-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                         <textarea name="description" defaultValue={selectedItem?.description} className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-white outline-none min-h-[120px]" />
                      </div>
                   </div>

                   <button type="submit" className="w-full py-6 rounded-[28px] bg-orange-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-orange-600/20 hover:bg-orange-500 transition-all">
                      Synchronize Registry Item
                   </button>
                </form>
             </motion.div>
           </>
         )}
      </AnimatePresence>
    </AdminLayout>
  )
}

import { useState, useEffect } from 'react'
import { UtensilsCrossed, Plus, Search, Edit3, Trash2, CheckCircle2, Clock, Leaf, Info, Filter, MoreHorizontal, ShoppingBag, X, QrCode, Scan, CreditCard, DollarSign, Layout, List } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import OwnerLayout from './OwnerLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import OrderScannerModal from '../../components/OrderScannerModal'
import { exportTablePDF } from '../../lib/pdfExport'

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Dinner']

export default function OwnerCafeteriaPage() {
  const [activeTab, setActiveTab] = useState('orders') 
  const [ordersViewMode, setOrdersViewMode] = useState('cards') // 'cards' or 'table'
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  // Payment popup state for a specific order
  const [paymentActionOrderId, setPaymentActionOrderId] = useState(null)

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('owner_cafeteria_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          // Re-fetch to get profile details joined
          fetchData()
          toast('New order received!', { icon: '🍱' })
        } else if (payload.eventType === 'UPDATE') {
          fetchData()
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
    if (!error) {
      toast.success(`Order marked as ${status}`)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    }
  }

  async function markOrderPaid(id, method) {
    const { error } = await supabase.from('orders').update({ 
      payment_status: 'Paid',
      payment_method: method
    }).eq('id', id)

    if (!error) {
      toast.success(`Order marked as Paid via ${method}`)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: 'Paid', payment_method: method } : o))
      setPaymentActionOrderId(null)
    } else {
      toast.error('Failed to update payment status')
    }
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
        `₹${order.total_price}`,
        `${order.total_carbon_kg || 0} kg CO2`,
        order.status,
        `${order.payment_status} (${order.payment_method || 'N/A'})`,
        date
      ]
    })

    exportTablePDF({
      title: "Cafeteria Orders Report",
      subtitle: `CAMPUS DINING OVERVIEW • ${latestOrders.length} ACTIVE ORDERS`,
      headers,
      rows,
      filename: `cafeteria_orders_${new Date().getTime()}`,
      summaryCards: [
        { label: "TOTAL ORDERS", value: latestOrders.length.toString() },
        { label: "TOTAL REVENUE", value: `₹${latestOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)}` }
      ]
    })
    toast.success('Orders PDF report generated ✓')
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
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">Cafeteria Hub</h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Active Order Telemetry & Registry</p>
            </div>
            <button 
              onClick={() => setIsScannerOpen(true)} 
              className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 hover:scale-105 transition-all"
            >
              <Scan size={14} /> Scan Order
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
             <div className="flex-1 flex max-w-md p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
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

             {activeTab === 'orders' && (
               <div className="flex items-center gap-3">
                 <button 
                   onClick={downloadOrdersPDF}
                   className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-emerald-600/10"
                   title="Export Orders PDF"
                 >
                   Download Orders
                 </button>
                 <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                   <button 
                     onClick={() => setOrdersViewMode('cards')} 
                     className={`p-2 rounded-lg ${ordersViewMode === 'cards' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                     title="Card Grid"
                   >
                     <Layout size={16} />
                   </button>
                   <button 
                     onClick={() => setOrdersViewMode('table')} 
                     className={`p-2 rounded-lg ${ordersViewMode === 'table' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                     title="Responsive Table"
                   >
                     <List size={16} />
                   </button>
                 </div>
               </div>
             )}

             <button 
               onClick={() => setIsScannerOpen(true)} 
               className="md:hidden flex items-center justify-center gap-3 py-4 rounded-2xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
             >
                <Scan size={16} /> Quick Scan Order
             </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          ordersViewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order, i) => (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between min-h-[360px]">
                  <div className="absolute top-0 right-0 px-4 py-1 bg-white/5 border-b border-l border-white/10 rounded-bl-xl text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    Queue #{orders.length - i}
                  </div>
                  
                  <div>
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
                      
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-orange-500/10 text-orange-500 border border-orange-500/20">
                          {order.status}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase ${
                          order.payment_status === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse'
                        }`}>
                          {order.payment_status === 'Paid' ? `Paid (${order.payment_method})` : 'Waiting Payment'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {order.items?.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] font-black uppercase text-gray-400">
                          <span>{it.quantity}x {it.name}</span>
                          <span>₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {/* Total Amount row with neon green accent border */}
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/30 rounded-2xl flex justify-between items-center text-[11px] font-black uppercase text-emerald-400 mb-6">
                      <span>Total Payload</span>
                      <span>₹{order.total_price}</span>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                      {/* Order status controls */}
                      <div className="flex gap-2">
                        {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest transition-colors">Prepare</button>}
                        {order.status === 'preparing' && <button onClick={() => updateOrderStatus(order.id, 'ready')} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest transition-colors">Ready</button>}
                        {order.status === 'ready' && <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-[9px] font-black uppercase tracking-widest transition-colors">Deliver</button>}
                        {order.status === 'delivered' && (
                          <div className="w-full text-center py-2.5 text-[8px] font-black text-gray-500 uppercase tracking-widest border border-dashed border-white/10 rounded-xl">
                            Archived Order
                          </div>
                        )}
                      </div>

                      {/* Payment trigger controls */}
                      {order.payment_status !== 'Paid' && (
                        <div className="relative">
                          <button 
                            onClick={() => setPaymentActionOrderId(paymentActionOrderId === order.id ? null : order.id)}
                            className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                          >
                            <CreditCard size={12} /> Mark as Paid
                          </button>
                          
                          <AnimatePresence>
                            {paymentActionOrderId === order.id && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute bottom-12 left-0 right-0 bg-[#0a0c10] border border-white/10 rounded-2xl p-2.5 z-20 flex gap-1.5 shadow-xl"
                              >
                                {['Cash', 'UPI'].map(method => (
                                  <button
                                    key={method}
                                    onClick={() => markOrderPaid(order.id, method)}
                                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest transition-colors"
                                  >
                                    {method}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Responsive table with overflow-x-auto, proper mobile wrapping */
            <div className="bg-slate-900/40 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-500">Token/Queue</th>
                      <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-500">Customer</th>
                      <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-500">Nutrients</th>
                      <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-500">Total Price</th>
                      <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-500">Order Status</th>
                      <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-500">Payment Status</th>
                      <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, i) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all">
                        <td className="p-6 whitespace-nowrap">
                          <span className="text-sm font-black text-white block">#{order.token_number || order.id.slice(0,4).toUpperCase()}</span>
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Queue #{orders.length - i}</span>
                        </td>
                        <td className="p-6 whitespace-nowrap">
                          <span className="text-sm font-black text-gray-300 block">{order.profiles?.full_name || 'Guest'}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase inline-block mt-1 ${order.profiles?.role === 'faculty' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                            {order.profiles?.role || 'Guest'}
                          </span>
                        </td>
                        <td className="p-6 max-w-xs">
                          <div className="space-y-1">
                            {order.items?.map((it, idx) => (
                              <div key={idx} className="text-[10px] font-black uppercase text-gray-400 truncate">
                                {it.quantity}x {it.name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-6 whitespace-nowrap">
                          <span className="text-sm font-black text-emerald-400 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            ₹{order.total_price}
                          </span>
                        </td>
                        <td className="p-6 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-orange-500/10 text-orange-500 border border-orange-500/20">
                            {order.status}
                          </span>
                        </td>
                        <td className="p-6 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase ${
                            order.payment_status === 'Paid' 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse'
                          }`}>
                            {order.payment_status === 'Paid' ? `Paid (${order.payment_method})` : 'Waiting Payment'}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col sm:flex-row gap-2">
                            {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest transition-colors">Prepare</button>}
                            {order.status === 'preparing' && <button onClick={() => updateOrderStatus(order.id, 'ready')} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest transition-colors">Ready</button>}
                            {order.status === 'ready' && <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-[8px] font-black uppercase tracking-widest transition-colors">Deliver</button>}
                            
                            {order.payment_status !== 'Paid' && (
                              <div className="relative">
                                <button 
                                  onClick={() => setPaymentActionOrderId(paymentActionOrderId === order.id ? null : order.id)}
                                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                                >
                                  <CreditCard size={10} /> Paid
                                </button>
                                {paymentActionOrderId === order.id && (
                                  <div className="absolute right-0 bottom-10 bg-[#0a0c10] border border-white/10 rounded-2xl p-2 z-20 flex gap-1 shadow-xl">
                                    {['Cash', 'UPI'].map(method => (
                                      <button
                                        key={method}
                                        onClick={() => markOrderPaid(order.id, method)}
                                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest"
                                      >
                                        {method}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
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

import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, X, Leaf, Info, Search, UtensilsCrossed, ChevronLeft, Clock, CheckCircle2, Timer } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore, useCartStore } from '../../store/index'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import FacultyLayout from './FacultyLayout'

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages']

export default function FacultyCafeteriaPage() {
  const { profile } = useAuthStore()
  const { items: cart, addItem, removeItem, clearCart, total } = useCartStore()
  
  const [view, setView] = useState('menu')
  const [activeCategory, setActiveCategory] = useState('All')
  const [menu, setMenu] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCart, setShowCart] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchMenu()
    if (profile?.id) fetchOrders()
  }, [profile?.id])

  async function fetchMenu() {
    setLoading(true)
    const { data } = await supabase.from('menu_items').select('*').eq('available', true)
    if (data) setMenu(data)
    setLoading(false)
  }

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('student_id', profile.id) // Reusing column for simplicity
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  const filteredMenu = menu.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleOrder = async () => {
    if (!profile) return
    const orderData = {
      student_id: profile.id,
      items: cart,
      total_price: total,
      status: 'pending'
    }

    const { data, error } = await supabase.from('orders').insert(orderData).select().single()

    if (!error) {
      setOrderSuccess(data)
      setOrders([data, ...orders])
      setShowCart(false)
      clearCart()
      toast.success('Order Placed Successfully')
    }
  }

  return (
    <FacultyLayout>
      <div className="space-y-8 pb-20">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Cafeteria Hub</h2>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Nutrition Node Status: Online</p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
          >
             <ShoppingCart size={24} />
             {cart.length > 0 && (
               <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white text-black text-[11px] font-black flex items-center justify-center border-2 border-slate-900">
                 {cart.length}
               </span>
             )}
          </button>
        </div>

        {/* VIEW TOGGLE */}
        <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-[28px] max-w-md">
          <button
            onClick={() => setView('menu')}
            className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'menu' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setView('orders')}
            className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'orders' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'
            }`}
          >
            Order Log
          </button>
        </div>

        {view === 'menu' ? (
          <>
            {/* SEARCH & FILTERS */}
            <div className="grid lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 relative">
                 <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                 <input 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Identify Nutrition Pattern..."
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all"
                 />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                 {CATEGORIES.map(cat => (
                   <button
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                       activeCategory === cat ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-gray-500'
                     }`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
            </div>

            {/* MENU GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                 <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Syncing Menu Matrix...</p>
                 </div>
              ) : filteredMenu.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-[40px]">
                   <p className="text-xs font-black text-white uppercase tracking-widest italic">No Items Found</p>
                </div>
              ) : filteredMenu.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-[32px] p-6 hover:bg-white/[0.08] transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2">
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-500 uppercase tracking-widest self-start">{item.category}</span>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">{item.name}</h3>
                    </div>
                    <p className="text-2xl font-black text-white tracking-tighter">₹{item.price}</p>
                  </div>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed mb-8 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-green-500">
                      <Leaf size={14} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.carbon_kg}kg Carbon</span>
                    </div>
                    <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
                       <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center text-gray-500"><Minus size={16} /></button>
                       <span className="w-8 text-center text-xs font-black text-white">{cart.find(i => i.id === item.id)?.quantity || 0}</span>
                       <button onClick={() => addItem(item)} className="w-8 h-8 flex items-center justify-center text-blue-500"><Plus size={16} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          /* ORDERS LOG */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.length === 0 ? (
               <div className="col-span-full py-32 text-center bg-white/5 border border-white/10 rounded-[48px]">
                  <p className="text-xs font-black text-white uppercase tracking-widest italic">No orders found</p>
               </div>
            ) : orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedOrder(order)}
                className="bg-white/5 border border-white/10 rounded-[32px] p-8 hover:bg-white/10 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      order.status === 'delivered' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                   }`}>
                      {order.status === 'delivered' ? <CheckCircle2 size={24} /> : <Timer size={24} className="animate-pulse" />}
                   </div>
                   <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      order.status === 'delivered' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                   }`}>
                      {order.status}
                   </span>
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Order #{order.id.slice(0, 8)}</h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 italic">
                   {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{order.items.length} Items</p>
                   <p className="text-xl font-black text-white tracking-tighter">₹{order.total_price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CART OVERLAY */}
      {createPortal(
        <AnimatePresence>
          {showCart && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-end p-6 pointer-events-none">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto" onClick={() => setShowCart(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-md h-full bg-slate-900 border-l border-white/10 p-10 pointer-events-auto flex flex-col">
                 <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Your Tray</h3>
                    <button onClick={() => setShowCart(false)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400"><X size={20} /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-8">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div>
                          <h4 className="text-sm font-black text-white uppercase">{item.name}</h4>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">₹{item.price} × {item.quantity}</p>
                        </div>
                        <p className="text-lg font-black text-white tracking-tighter">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                 </div>
                 <div className="pt-10 border-t border-white/10 space-y-6">
                    <div className="flex justify-between items-center">
                       <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Amount</p>
                       <p className="text-3xl font-black text-white tracking-tighter">₹{total}</p>
                    </div>
                    <button onClick={handleOrder} disabled={cart.length === 0} className="w-full py-6 rounded-3xl bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/20 disabled:opacity-50">Confirm Order</button>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* SUCCESS / DETAILS OVERLAY */}
      {createPortal(
        <AnimatePresence>
          {(orderSuccess || selectedOrder) && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => { setOrderSuccess(null); setSelectedOrder(null); }} />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[48px] p-10 text-center shadow-2xl pointer-events-auto">
                 <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-[28px] flex items-center justify-center text-blue-500 mx-auto mb-8">
                    <UtensilsCrossed size={32} />
                 </div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
                    {orderSuccess ? 'Order Protocol' : 'Transaction Log'}
                 </h3>
                 <div className="bg-white rounded-[32px] p-8 mb-8 flex justify-center">
                    <QRCodeSVG value={(orderSuccess || selectedOrder).id} size={180} level="H" />
                 </div>
                 
                 <div className="mb-8 text-left space-y-2">
                    {(orderSuccess || selectedOrder).items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
                        <span>{it.name} x{it.quantity}</span>
                        <span>₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-white/5 flex justify-between text-[11px] font-black text-white uppercase tracking-widest">
                       <span>Total</span>
                       <span>₹{(orderSuccess || selectedOrder).total_price}</span>
                    </div>
                 </div>

                 <button onClick={() => { setOrderSuccess(null); setSelectedOrder(null); }} className="w-full py-6 rounded-3xl bg-white text-black font-black uppercase tracking-widest text-[11px]">Terminate View</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </FacultyLayout>
  )
}

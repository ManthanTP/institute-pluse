import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, X, Leaf, Info, Search, UtensilsCrossed, ChevronLeft, Home, LayoutGrid, CalendarDays, Coffee, User, Clock, CheckCircle2, Timer, CreditCard } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore, useCartStore } from '../../store/index'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages']

export default function CafeteriaPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { items: cart, addItem, removeItem, clearCart, total } = useCartStore()
  
  const [view, setView] = useState('menu') // 'menu' or 'orders'
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
    if (profile?.id) {
      fetchOrders()

      // Realtime subscription for the student's orders
      const channel = supabase
        .channel('student_orders_changes')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders', 
          filter: `student_id=eq.${profile.id}` 
        }, (payload) => {
          setOrders(curr => curr.map(o => o.id === payload.new.id ? payload.new : o))
          setSelectedOrder(curr => curr?.id === payload.new.id ? payload.new : curr)
          toast(`Order status updated to ${payload.new.status}!`, { icon: '🍱' })
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [profile?.id])

  async function fetchMenu() {
    setLoading(true)
    const { data } = await supabase.from('menu_items').select('*').eq('available', true)
    if (data && data.length > 0) setMenu(data)
    else setMenu([])
    setLoading(false)
  }

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  const filteredMenu = menu.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category?.toLowerCase() === activeCategory.toLowerCase()
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleOrder = async () => {
    if (!profile) return
    const { totalCarbon } = useCartStore.getState()
    
    const orderData = {
      student_id: profile.id,
      items: cart,
      total_price: total,
      total_carbon_kg: totalCarbon,
      status: 'pending',
      payment_status: 'Waiting Payment'
    }

    const { data, error } = await supabase.from('orders').insert(orderData).select().single()

    if (!error) {
      setOrderSuccess(data)
      setOrders(prev => [data, ...prev])
      setShowCart(false)
      clearCart()
      toast.success('Fuel Sequence Initiated')
    } else {
      toast.error('Transaction Failed')
    }
  }

  // Helper to get status progress percentage
  const getStatusProgress = (status) => {
    switch (status) {
      case 'pending': return 25
      case 'preparing': return 50
      case 'ready': return 75
      case 'delivered': return 100
      default: return 0
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-green-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Cafeteria Hub...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-green-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-blue-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4 lg:gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="hidden lg:flex w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl"
            >
              <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </motion.button>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Cafeteria</h1>
          </div>
          <div className="flex-1 flex justify-end lg:flex-none">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowCart(true)}
              className="relative w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
               <ShoppingCart size={22} />
               {cart.length > 0 && (
                 <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-black text-[10px] font-black flex items-center justify-center border-2 border-[#0a0c10]">
                   {cart.length}
                 </span>
               )}
            </motion.button>
          </div>
        </div>

        {/* VIEW TOGGLE */}
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl md:rounded-[32px] mb-6 md:mb-10">
          <button
            onClick={() => setView('menu')}
            className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-[24px] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'menu' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'
            }`}
          >
            Menu Grid
          </button>
          <button
            onClick={() => setView('orders')}
            className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-[24px] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'orders' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'
            }`}
          >
            Order Log
          </button>
        </div>

        {view === 'menu' ? (
          <>
            {/* SEARCH BAR */}
            <div className="relative mb-6 md:mb-10">
              <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-600">
                <Search size={18} />
              </div>
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Nutrition Nodes..."
                className="w-full bg-[#161b22] border border-white/5 rounded-2xl md:rounded-3xl py-4 md:py-6 pl-12 md:pl-16 pr-4 md:pr-6 text-xs md:text-[11px] font-black text-white uppercase tracking-[0.2em] outline-none shadow-inner"
              />
            </div>

            {/* CATEGORY TABS */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 md:mb-10 pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                    activeCategory === cat 
                      ? 'bg-green-600 border-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                      : 'bg-white/5 border-white/10 text-gray-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* MENU LIST */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Syncing Nutrient Core...</p>
                </div>
              ) : filteredMenu.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                  <div className="text-4xl mb-4 opacity-40">🍽️</div>
                  <p className="text-xs font-black text-white uppercase tracking-widest italic">No Nutrient Hubs Found</p>
                </div>
              ) : filteredMenu.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#161b22]/80 border border-white/5 rounded-2xl p-5 backdrop-blur-2xl relative overflow-hidden group flex flex-col justify-between min-h-[220px]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest">
                            {item.category}
                          </span>
                          {item.is_vegetarian && (
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" title="Vegetarian" />
                          )}
                        </div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight leading-snug mt-1">{item.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-white tracking-tighter leading-none">₹{item.price}</p>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-gray-500 leading-relaxed line-clamp-2 mb-4">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-green-500">
                      <Leaf size={14} fill="currentColor" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{item.carbon_kg}kg CO₂</span>
                    </div>
                    
                    <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                      >
                        <Minus size={14} />
                      </motion.button>
                      <span className="w-8 text-center text-xs font-black text-white">{cart.find(i => i.id === item.id)?.quantity || 0}</span>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addItem(item)}
                        className="w-8 h-8 flex items-center justify-center text-green-500 hover:text-green-400 transition-colors"
                      >
                        <Plus size={14} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    <UtensilsCrossed size={80} />
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          /* ORDERS LOG VIEW */
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="py-20 text-center bg-white/5 border border-white/10 rounded-2xl md:rounded-[48px] backdrop-blur-xl">
                 <div className="text-5xl mb-6 opacity-20">📜</div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Registry Empty</h3>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">No transaction telemetry found</p>
              </div>
            ) : orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedOrder(order)}
                className="bg-[#161b22]/80 border border-white/5 rounded-2xl md:rounded-[40px] p-4 md:p-8 backdrop-blur-2xl flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-4 md:gap-8">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center border shrink-0 ${
                    order.status === 'delivered' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                  }`}>
                    {order.status === 'delivered' ? <CheckCircle2 size={22} className="md:w-7 md:h-7" /> : <Timer size={22} className="animate-pulse md:w-7 md:h-7" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-md text-[7px] font-black uppercase tracking-widest font-mono">
                        #{order.token_number || order.id.slice(0, 4).toUpperCase()}
                      </span>
                      <span className="text-[8px] md:text-[9px] font-black text-gray-600 uppercase tracking-widest italic">
                        {new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${
                        order.status === 'delivered' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                      }`}>
                        {order.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${
                        order.payment_status === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                      }`}>
                        {order.payment_status === 'Paid' ? `Paid (${order.payment_method})` : 'Waiting Payment'}
                      </span>
                    </div>
                    <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-tight">
                      {order.items.length} Nutrient Nodes • ₹{order.total_price}
                    </h3>
                  </div>
                </div>
                <Clock size={18} className="text-gray-800 group-hover:text-white transition-colors" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CART PORTAL */}
      {createPortal(
        <AnimatePresence>
          {showCart && (
            <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl pointer-events-auto"
                onClick={() => setShowCart(false)}
              />
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-[#0a0c10] border-t border-white/10 rounded-t-[50px] p-6 md:p-10 shadow-2xl pointer-events-auto flex flex-col"
                style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] bg-green-600/10 border border-green-500/20 flex items-center justify-center text-green-500">
                         <ShoppingCart size={24} className="md:w-8 md:h-8" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Payload Summary</p>
                         <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight leading-tight">Nutrition Cart</h2>
                      </div>
                   </div>
                   <button onClick={() => setShowCart(false)} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar max-h-[40vh] space-y-3 md:space-y-4 mb-8">
                   {cart.length === 0 ? (
                      <div className="py-12 text-center opacity-40 italic text-xs font-black uppercase tracking-widest">Cart is empty</div>
                   ) : cart.map(item => (
                       <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-[28px] p-5 border border-white/5">
                         <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] font-black text-white uppercase tracking-tight truncate">{item.name}</h4>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">₹{item.price} × {item.quantity}</p>
                         </div>
                         <div className="flex items-center gap-4">
                            <p className="text-sm font-black text-white tracking-tighter">₹{item.price * item.quantity}</p>
                            <button onClick={() => removeItem(item.id)} className="p-2 text-red-500"><Minus size={16} /></button>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="space-y-6 pt-6 border-t border-white/10">
                   <div className="flex items-center justify-between px-2">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Total Transaction</p>
                      <p className="text-2xl md:text-3xl font-black text-white tracking-tighter">₹{total}</p>
                   </div>
                   <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOrder}
                    disabled={cart.length === 0}
                    className="w-full py-6 md:py-7 rounded-[28px] md:rounded-[32px] bg-green-600 text-white font-black text-[10px] md:text-xs uppercase tracking-[0.4em] shadow-[0_15px_40px_rgba(34,197,94,0.4)] disabled:opacity-20"
                   >
                     Initiate Fuel Sequence
                   </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* SUCCESS / DETAILS PORTAL WITH TIMELINE PROGRESS */}
      {createPortal(
        <AnimatePresence>
          {(orderSuccess || selectedOrder) && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/95 backdrop-blur-3xl pointer-events-auto"
                 onClick={() => { setOrderSuccess(null); setSelectedOrder(null); }}
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                 className="relative w-full max-w-sm bg-[#161b22] border border-white/10 rounded-[48px] p-10 text-center shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar pointer-events-auto"
               >
                  <div className="w-20 h-20 bg-green-600/10 border border-green-500/20 rounded-[28px] flex items-center justify-center text-green-500 mx-auto mb-6">
                     <UtensilsCrossed size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 leading-none">
                    {orderSuccess ? 'Uplink Confirmed' : 'Order Protocol'}
                  </h3>
                  <div className="mb-4">
                    <span className="text-sm font-black text-orange-400 font-mono">
                      Token: #{(orderSuccess || selectedOrder).token_number || (orderSuccess || selectedOrder).id?.slice(-4).toUpperCase()}
                    </span>
                  </div>

                  {/* Payment Status Banner */}
                  <div className="mb-6">
                    <span className={`px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-1.5 ${
                      (orderSuccess || selectedOrder).payment_status === 'Paid'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
                    }`}>
                      <CreditCard size={10} />
                      {(orderSuccess || selectedOrder).payment_status === 'Paid'
                        ? `Paid via ${(orderSuccess || selectedOrder).payment_method}`
                        : 'Waiting for Payment'}
                    </span>
                  </div>

                  {/* Status Progress Stepper */}
                  <div className="mb-8 px-2">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500 mb-3">
                      <span>Telemetry Progression</span>
                      <span className="text-green-500">{(orderSuccess || selectedOrder).status.toUpperCase()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4 relative">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 rounded-full transition-all duration-500" 
                        style={{ width: `${getStatusProgress((orderSuccess || selectedOrder).status)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[7px] font-bold text-gray-600 uppercase">
                      <span className={(orderSuccess || selectedOrder).status === 'pending' ? 'text-orange-500 font-black' : ''}>Pending</span>
                      <span className={(orderSuccess || selectedOrder).status === 'preparing' ? 'text-orange-500 font-black' : ''}>Preparing</span>
                      <span className={(orderSuccess || selectedOrder).status === 'ready' ? 'text-blue-400 font-black animate-pulse' : ''}>Ready</span>
                      <span className={(orderSuccess || selectedOrder).status === 'delivered' ? 'text-green-400 font-black' : ''}>Delivered</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-[40px] p-8 mb-6 flex justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)]">
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
                        <span>Total Payload</span>
                        <span>₹{(orderSuccess || selectedOrder).total_price}</span>
                     </div>
                     <div className="pt-2 flex justify-between text-[10px] font-black text-green-500 uppercase tracking-widest italic">
                        <div className="flex items-center gap-2">
                           <Leaf size={12} fill="currentColor" />
                           <span>Eco Impact</span>
                        </div>
                        <span>{(orderSuccess || selectedOrder).total_carbon_kg || 0}kg CO2</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => { setOrderSuccess(null); setSelectedOrder(null); }}
                    className="w-full py-6 rounded-[28px] bg-white text-black font-black text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all"
                  >
                    Terminate View
                  </button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}



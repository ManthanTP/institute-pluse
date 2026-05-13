import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, X, Leaf, Info, Search, UtensilsCrossed, ChevronLeft, Home, LayoutGrid, CalendarDays, Coffee, User, Clock, CheckCircle2, Timer } from 'lucide-react'
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
      .eq('student_id', profile.id)
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
    const { totalCarbon } = useCartStore.getState()
    
    const orderData = {
      student_id: profile.id,
      items: cart,
      total_price: total,
      total_carbon_kg: totalCarbon,
      status: 'pending'
    }

    const { data, error } = await supabase.from('orders').insert(orderData).select().single()

    if (!error) {
      setOrderSuccess(data)
      setOrders([data, ...orders])
      setShowCart(false)
      clearCart()
      toast.success('Fuel Sequence Initiated')
    }
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
          <div className="flex items-center gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Cafeteria</h1>
          </div>
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

        {/* VIEW TOGGLE */}
        <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-[32px] mb-10">
          <button
            onClick={() => setView('menu')}
            className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'menu' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'
            }`}
          >
            Menu Grid
          </button>
          <button
            onClick={() => setView('orders')}
            className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'orders' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'
            }`}
          >
            Order Log
          </button>
        </div>

        {view === 'menu' ? (
          <>
            {/* SEARCH BAR */}
            <div className="relative mb-10">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600">
                <Search size={20} />
              </div>
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Nutrition Nodes..."
                className="w-full bg-[#161b22] border border-white/5 rounded-3xl py-6 pl-16 pr-6 text-[11px] font-black text-white uppercase tracking-[0.2em] outline-none shadow-inner"
              />
            </div>

            {/* CATEGORY TABS */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar mb-10 pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
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
            <div className="space-y-6">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Syncing Nutrient Core...</p>
                </div>
              ) : filteredMenu.length === 0 ? (
                <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl">
                  <div className="text-4xl mb-4 opacity-40">🍽️</div>
                  <p className="text-xs font-black text-white uppercase tracking-widest italic">No Nutrient Hubs Found</p>
                </div>
              ) : filteredMenu.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#161b22]/80 border border-white/5 rounded-[40px] p-8 backdrop-blur-2xl relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest">
                          {item.category}
                        </span>
                        {item.is_vegetarian && (
                          <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        )}
                      </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">{item.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white tracking-tighter leading-none">₹{item.price}</p>
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">Currency Nodes</p>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-gray-500 leading-relaxed mb-8">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-500">
                      <Leaf size={14} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.carbon_kg}kg Carbon</span>
                    </div>
                    
                    <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/10">
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(item.id)}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                      >
                        <Minus size={18} />
                      </motion.button>
                      <span className="w-10 text-center text-sm font-black text-white">{cart.find(i => i.id === item.id)?.quantity || 0}</span>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addItem(item)}
                        className="w-10 h-10 flex items-center justify-center text-green-500 hover:text-green-400 transition-colors"
                      >
                        <Plus size={18} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Decorative Element */}
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
              <div className="py-32 text-center bg-white/5 border border-white/10 rounded-[48px] backdrop-blur-xl">
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
                className="bg-[#161b22]/80 border border-white/5 rounded-[40px] p-8 backdrop-blur-2xl flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                    order.status === 'delivered' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                  }`}>
                    {order.status === 'delivered' ? <CheckCircle2 size={28} /> : <Timer size={28} className="animate-pulse" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">
                        {new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                        order.status === 'delivered' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                      {order.items.length} Nutrient Nodes • ₹{order.total_price}
                    </h3>
                  </div>
                </div>
                <Clock size={20} className="text-gray-800 group-hover:text-white transition-colors" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM NAV BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100] md:hidden">
        <div className="bg-[#161b22]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <NavIcon icon={Home} label="Home" onClick={() => navigate('/dashboard')} />
          <NavIcon icon={LayoutGrid} label="Log" onClick={() => navigate('/carbon-log')} />
          <NavIcon icon={CalendarDays} label="Events" onClick={() => navigate('/events')} />
          <NavIcon icon={Coffee} label="Cafe" active onClick={() => {}} />
          <NavIcon icon={User} label="Me" onClick={() => navigate('/profile')} />
        </div>
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

      {/* SUCCESS / DETAILS PORTAL */}
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
                 className="relative w-full max-w-sm bg-[#161b22] border border-white/10 rounded-[48px] p-10 text-center shadow-2xl overflow-hidden pointer-events-auto"
               >
                  <div className="w-20 h-20 bg-green-600/10 border border-green-500/20 rounded-[28px] flex items-center justify-center text-green-500 mx-auto mb-8">
                     <UtensilsCrossed size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 leading-none">
                    {orderSuccess ? 'Uplink Confirmed' : 'Order Protocol'}
                  </h3>
                  <p className="text-[11px] font-medium text-gray-500 mb-8 italic">
                    {orderSuccess ? 'Show this code at the nutrition node.' : `Status: ${selectedOrder.status.toUpperCase()}`}
                  </p>
                  
                  <div className="bg-white rounded-[40px] p-8 mb-8 flex justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                    <QRCodeSVG value={(orderSuccess || selectedOrder).id} size={180} level="H" />
                  </div>

                  <div className="mb-10 text-left space-y-2">
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

function NavIcon({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}`}>
        <Icon size={20} strokeWidth={active ? 3 : 2} />
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
    </button>
  )
}

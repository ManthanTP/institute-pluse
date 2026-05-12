import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, X, Leaf, Info, Search, UtensilsCrossed, ChevronLeft, Home, LayoutGrid, CalendarDays, Coffee, User } from 'lucide-react'
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
  const [activeCategory, setActiveCategory] = useState('All')
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCart, setShowCart] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchMenu()
  }, [])

  async function fetchMenu() {
    setLoading(true)
    const { data } = await supabase.from('cafeteria_items').select('*').eq('is_available', true)
    if (data) setMenu(data)
    setLoading(false)
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
      total_amount: total,
      status: 'pending',
      order_date: new Date().toISOString()
    }

    const { data, error } = await supabase.from('orders').insert(orderData).select().single()

    if (!error) {
      setOrderSuccess(data)
      setShowCart(false)
      clearCart()
      toast.success('Fuel Sequence Initiated')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0c10] text-white pb-32 relative overflow-x-hidden">
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

        {/* SEARCH BAR */}
        <div className="relative mb-10">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black/40">
            <Search size={20} />
          </div>
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Nutrition Nodes..."
            className="w-full bg-white rounded-3xl py-6 pl-16 pr-6 text-[13px] font-black text-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.1)] outline-none"
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
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Loading Nutrition Core...</p>
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
                    {item.is_veg && (
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
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.eco_points} Eco Points Yield</span>
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
      </div>

      {/* BOTTOM NAV BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100]">
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

      {/* SUCCESS PORTAL */}
      {createPortal(
        <AnimatePresence>
          {orderSuccess && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                 className="relative w-full max-w-sm bg-[#161b22] border border-white/10 rounded-[40px] md:rounded-[48px] p-8 md:p-10 text-center shadow-2xl overflow-hidden"
               >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-green-600/10 border border-green-500/20 rounded-[24px] md:rounded-[28px] flex items-center justify-center text-green-500 mx-auto mb-6 md:mb-8">
                     <UtensilsCrossed size={28} className="md:w-9 md:h-9" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-3 md:mb-4 leading-none">Uplink Confirmed</h3>
                  <p className="text-[10px] md:text-xs font-medium text-gray-500 mb-6 md:mb-8 italic">Show this code at the nutrition node.</p>
                  
                  <div className="bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8 mb-6 md:mb-8 flex justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                    <QRCodeSVG value={orderSuccess.id} size={140} className="md:w-[180px] md:h-[180px]" level="H" />
                  </div>

                  <p className="text-[9px] md:text-[10px] font-black text-gray-600 uppercase tracking-widest mb-8 md:mb-10">Sequence ID: {orderSuccess.id.slice(0, 8)}</p>

                  <button 
                    onClick={() => setOrderSuccess(null)}
                    className="w-full py-5 md:py-6 rounded-[24px] md:rounded-[28px] bg-white text-black font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all"
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

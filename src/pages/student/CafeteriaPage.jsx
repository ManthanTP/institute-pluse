import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, X, Leaf, Info, Search, UtensilsCrossed } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore, useCartStore } from '../../store/index'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages']

export default function CafeteriaPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { items: cartItems, addItem, removeItem, totalPrice, totalCarbon, clearCart } = useCartStore()
  const [menuItems, setMenuItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [showCart, setShowCart] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [placing, setPlacing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true)
      const { data } = await supabase.from('menu_items').select('*').eq('available', true)
      if (data) setMenuItems(data)
      setLoading(false)
    }
    fetchMenu()
  }, [])

  const filtered = activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory.toLowerCase())
  const cartCount = cartItems.reduce((t, i) => t + i.qty, 0)

  async function placeOrder() {
    if (!profile?.id || cartItems.length === 0) return
    setPlacing(true)
    try {
      const tokenNumber = Math.floor(Math.random() * 90) + 10
      const qrCode = crypto.randomUUID()

      const { data, error } = await supabase.from('orders').insert({
        student_id: profile.id,
        items: cartItems.map(i => ({ item_id: i.id, name: i.name, qty: i.qty, price: i.price, carbon_kg: i.carbon_kg })),
        total_price: totalPrice,
        total_carbon_kg: totalCarbon,
        status: 'pending',
        token_number: tokenNumber,
        qr_code: qrCode,
      }).select().single()

      if (error) throw error
      clearCart()
      setShowCart(false)
      setOrderSuccess({ token: tokenNumber, qrCode, totalCarbon })
      toast.success('Bon Appétit! 🌿')
    } catch (err) {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-96 bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center relative z-10"
        >
          <div className="w-24 h-24 rounded-[32px] bg-green-500/10 border border-green-500/20 flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl shadow-green-500/10">
            🍱
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Order Confirmed</h2>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Green Dining Protocol Active</p>
          
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
               <span className="text-4xl font-black text-white/5 group-hover:text-white/10 transition-colors tracking-tighter">#{orderSuccess.token}</span>
            </div>
            <div className="bg-white p-6 rounded-[32px] shadow-2xl mb-4">
               <QRCodeSVG value={orderSuccess.qrCode} size={180} className="mx-auto" level="M" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
              Show this token at the counter<br/>to collect your eco-meal
            </p>
          </div>

          <div className="bg-green-500/5 border border-green-500/10 rounded-3xl p-4 mb-10">
             <p className="text-[11px] font-black text-green-500 uppercase tracking-widest flex items-center justify-center gap-2">
               <Leaf size={14} /> Total Impact: {orderSuccess.totalCarbon.toFixed(2)} kg CO2
             </p>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => navigate('/cafeteria/orders')} 
              className="w-full py-5 rounded-[28px] bg-green-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-600/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Track Orders
            </button>
            <button 
              onClick={() => setOrderSuccess(null)} 
              className="w-full py-4 rounded-2xl bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
            >
              Back to Menu
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[60%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[40%] rounded-full bg-green-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* HEADER AREA */}
        <div className="px-6 pt-6 flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Campus Dining</span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Eco Menu</h1>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCart(true)} 
            className="relative p-4 rounded-2xl bg-white/5 border border-white/10 text-white shadow-xl shadow-black/50"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-green-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black shadow-lg shadow-green-600/20">
                {cartCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-6 mb-8">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                activeCategory === cat 
                  ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20' 
                  : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* MENU LIST */}
        <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Preparing Menu...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl">
                 <div className="text-4xl mb-4">🍽️</div>
                 <p className="text-xs font-black text-white uppercase tracking-widest">Out of Stock</p>
                 <p className="text-[10px] font-medium text-gray-500 mt-2">Check back during next meal session!</p>
              </div>
            ) : filtered.map((item, i) => {
              const inCart = cartItems.find(c => c.id === item.id)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white/5 border border-white/10 rounded-[32px] p-5 backdrop-blur-xl flex gap-4 hover:bg-white/10 transition-all duration-500"
                >
                  <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform duration-500">
                    {item.is_vegan ? '🌱' : item.is_vegetarian ? '🥗' : '🍗'}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[8px] font-black text-green-500 uppercase tracking-[0.2em]">{item.category}</span>
                       <div className="w-1 h-1 rounded-full bg-white/20" />
                       <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">🍃 {item.carbon_kg}kg</span>
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight truncate mb-1">{item.name}</h3>
                    <p className="text-[9px] font-medium text-gray-500 line-clamp-1 mb-3">{item.description}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <p className="text-sm font-black text-white tracking-tighter">₹{item.price}</p>
                      
                      {!inCart ? (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => addItem(item)}
                          className="px-4 py-1.5 rounded-xl bg-green-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-green-600/10"
                        >
                          Add
                        </motion.button>
                      ) : (
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-2 py-1">
                          <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-white"><Minus size={14} /></button>
                          <span className="text-xs font-black text-white w-4 text-center">{inCart.qty}</span>
                          <button onClick={() => addItem(item)} className="text-green-500 hover:text-green-400"><Plus size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* QUICK CART BAR */}
      {cartCount > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-12 left-0 right-0 px-6 py-4 z-40 lg:left-72"
        >
          <button 
            onClick={() => setShowCart(true)}
            className="w-full bg-green-600 text-white rounded-[28px] p-5 flex items-center justify-between shadow-2xl shadow-green-600/40 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="flex items-center gap-4 relative z-10">
               <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingCart size={18} />
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 leading-none mb-1">Basket Total</p>
                  <p className="text-sm font-black tracking-tighter leading-none">₹{totalPrice} · {cartCount} Items</p>
               </div>
            </div>
            <div className="text-right relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 leading-none mb-1">Total Impact</p>
               <p className="text-sm font-black tracking-tighter leading-none">🍃 {totalCarbon.toFixed(2)} kg</p>
            </div>
          </button>
        </motion.div>
      )}

      {/* CART OVERLAY */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60]" 
              onClick={() => setShowCart(false)} 
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 lg:left-72 bg-slate-900 border-t border-white/10 rounded-t-[40px] z-[70] p-8 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl shadow-black"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Review Basket</h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Nexus Quick-Pay Active</p>
                </div>
                <button onClick={() => setShowCart(false)} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400"><X size={20} /></button>
              </div>

              <div className="space-y-4 mb-10">
                {cartItems.map(item => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl">
                       {item.is_vegan ? '🌱' : item.is_vegetarian ? '🥗' : '🍗'}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">{item.name}</p>
                      <p className="text-[9px] font-black text-green-500 uppercase tracking-widest">🍃 {(item.carbon_kg * item.qty).toFixed(2)} kg</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl px-2 py-1">
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-white"><Minus size={14} /></button>
                      <span className="text-xs font-black text-white w-4 text-center">{item.qty}</span>
                      <button onClick={() => addItem(item)} className="text-green-500 hover:text-green-400"><Plus size={14} /></button>
                    </div>
                    <div className="w-16 text-right text-xs font-black text-white">₹{item.price * item.qty}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-10">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Basket Subtotal</span>
                  <span className="text-sm font-black text-white">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none">Eco-Contribution Bonus</span>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none">-{totalCarbon.toFixed(1)} Pts</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-center px-2">
                  <span className="text-sm font-black text-white uppercase tracking-widest">Final Total</span>
                  <span className="text-xl font-black text-green-500 tracking-tighter leading-none">₹{totalPrice}</span>
                </div>
              </div>

              <button 
                onClick={placeOrder} 
                disabled={placing} 
                className="w-full py-5 rounded-[28px] bg-green-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-600/20 disabled:opacity-50 transition-all"
              >
                {placing ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" /> : 'Confirm & Pay'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

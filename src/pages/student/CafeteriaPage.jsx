import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Plus, Minus, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore, useCartStore } from '../../store/index'
import BottomTabBar from '../../components/BottomTabBar'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages']

// Demo menu items when DB is empty
const DEMO_ITEMS = [
  { id: '1', name: 'Masala Dosa', category: 'breakfast', price: 40, carbon_kg: 0.5, is_vegetarian: true, is_vegan: false, available: true, description: 'Crispy dosa with spicy potato filling' },
  { id: '2', name: 'Idli Sambar', category: 'breakfast', price: 30, carbon_kg: 0.3, is_vegetarian: true, is_vegan: true, available: true, description: 'Soft idlis with fresh sambar' },
  { id: '3', name: 'Veg Fried Rice', category: 'lunch', price: 60, carbon_kg: 0.6, is_vegetarian: true, is_vegan: true, available: true, description: 'Stir-fried rice with vegetables' },
  { id: '4', name: 'Chicken Biryani', category: 'lunch', price: 90, carbon_kg: 1.5, is_vegetarian: false, is_vegan: false, available: true, description: 'Aromatic basmati with chicken' },
  { id: '5', name: 'Fruit Salad', category: 'snacks', price: 35, carbon_kg: 0.1, is_vegetarian: true, is_vegan: true, available: true, description: 'Fresh seasonal fruits' },
  { id: '6', name: 'Samosa (2 pcs)', category: 'snacks', price: 20, carbon_kg: 0.3, is_vegetarian: true, is_vegan: false, available: true, description: 'Crispy fried pastry' },
  { id: '7', name: 'Masala Chai', category: 'beverages', price: 15, carbon_kg: 0.1, is_vegetarian: true, is_vegan: false, available: true, description: 'Spiced Indian tea' },
  { id: '8', name: 'Nimbu Pani', category: 'beverages', price: 20, carbon_kg: 0.05, is_vegetarian: true, is_vegan: true, available: true, description: 'Fresh lime water' },
]

export default function CafeteriaPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { items: cartItems, addItem, removeItem, totalPrice, totalCarbon, clearCart } = useCartStore()
  const [menuItems, setMenuItems] = useState(DEMO_ITEMS)
  const [category, setCategory] = useState('All')
  const [showCart, setShowCart] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    supabase.from('menu_items').select('*').eq('available', true)
      .then(({ data }) => { if (data?.length) setMenuItems(data) })
  }, [])

  const filtered = category === 'All' ? menuItems : menuItems.filter(i => i.category === category.toLowerCase())
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
    } catch (err) {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 animate-fade-in"
        style={{ background: '#f0fdf4' }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Order Placed!</h2>
          <div className="badge-chip mx-auto mb-4 text-lg py-2 px-4">Token #{orderSuccess.token} 🌿</div>
          <div className="card p-4 mb-4">
            <QRCodeSVG value={orderSuccess.qrCode} size={200} className="mx-auto" level="M" />
            <p className="text-xs text-gray-400 mt-2">Show this QR to cafeteria staff</p>
          </div>
          <div className="card p-3 mb-4" style={{ background: '#fef3c7', borderColor: '#fbbf24' }}>
            <p className="text-sm text-yellow-800">🍃 This order: <strong>{orderSuccess.totalCarbon.toFixed(2)} kg CO2</strong></p>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/cafeteria/orders')} className="btn-primary w-full">📦 Track Order</button>
            <button onClick={() => setOrderSuccess(null)} className="btn-ghost w-full">Back to Menu</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100dvh', paddingBottom: cartCount > 0 ? '140px' : '80px' }}>
      <header className="app-header">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <span className="font-bold text-white">🍽️ Cafeteria</span>
        <button onClick={() => setShowCart(true)} className="relative p-1">
          <ShoppingCart size={22} color="white" />
          {cartCount > 0 && <span className="notif-badge" style={{ background: '#f59e0b' }}>{cartCount}</span>}
        </button>
      </header>

      {/* CATEGORY TABS */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3" style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={{
              background: category === cat ? '#16a34a' : '#f0fdf4',
              color: category === cat ? 'white' : '#16a34a',
            }}>
            {cat}
          </button>
        ))}
      </div>

      <div className="page-container pt-4">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item, i) => {
            const inCart = cartItems.find(c => c.id === item.id)
            return (
              <div key={item.id} className="menu-card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="h-28 flex items-center justify-center text-4xl"
                  style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
                  {item.is_vegan ? '🌱' : item.is_vegetarian ? '🥗' : '🍗'}
                </div>
                <div className="p-3">
                  <div className="flex gap-1 mb-1">
                    {item.is_vegan && <span className="badge-chip text-xs py-0 px-1.5" style={{ fontSize: '10px' }}>Vegan</span>}
                    {!item.is_vegan && item.is_vegetarian && <span className="badge-chip text-xs py-0 px-1.5" style={{ fontSize: '10px' }}>Veg</span>}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 leading-tight">{item.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="font-bold text-gray-900">₹{item.price}</p>
                      <p className="text-xs text-green-600">🍃 {item.carbon_kg} kg CO2</p>
                    </div>
                    {!inCart ? (
                      <button onClick={() => addItem(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                        style={{ background: '#16a34a' }}>
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeItem(item.id)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold text-gray-900">{inCart.qty}</span>
                        <button onClick={() => addItem(item)} className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ background: '#16a34a' }}>
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CART SUMMARY BAR */}
      {cartCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 px-4 py-3" style={{ background: 'white', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={() => setShowCart(true)} className="btn-primary w-full">
            <ShoppingCart size={18} />
            {cartCount} items · ₹{totalPrice} · 🍃 {totalCarbon.toFixed(2)} kg CO2
          </button>
        </div>
      )}

      {/* CART BOTTOM SHEET */}
      {showCart && (
        <>
          <div className="bottom-sheet-overlay" onClick={() => setShowCart(false)} />
          <div className="bottom-sheet" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Your Order</h3>
              <button onClick={() => setShowCart(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">🍃 {(item.carbon_kg * item.qty).toFixed(2)} kg CO2</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                  <button onClick={() => addItem(item)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#16a34a' }}>
                    <Plus size={12} color="white" />
                  </button>
                </div>
                <span className="text-sm font-bold text-gray-900 w-14 text-right">₹{item.price * item.qty}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold text-gray-900 mb-1">
              <span>Total</span><span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-xs text-green-600 mb-4">
              <span>Carbon footprint</span><span>🍃 {totalCarbon.toFixed(2)} kg CO2</span>
            </div>
            <button onClick={placeOrder} disabled={placing} className="btn-primary w-full">
              {placing ? <span className="spinner" /> : '🌿 Place Order'}
            </button>
          </div>
        </>
      )}

      <BottomTabBar />
    </div>
  )
}

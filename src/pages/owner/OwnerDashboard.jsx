import { useState, useEffect } from 'react'
import { ShoppingBag, Utensils, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import OwnerLayout from './OwnerLayout'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function OwnerDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSales: 0,
    popularItem: '...'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOwnerStats() {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today)

      if (orders) {
        const totalSales = orders.reduce((sum, o) => sum + (o.total_price || 0), 0)
        const pending = orders.filter(o => o.status === 'pending').length
        
        setStats({
          totalOrders: orders.length,
          pendingOrders: pending,
          totalSales: totalSales.toFixed(2),
          popularItem: 'Eco-Bowl v1'
        })
      }
      setLoading(false)
    }

    fetchOwnerStats()
  }, [])

  return (
    <OwnerLayout>
      <div className="space-y-10">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Owner Operations Node</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Dining Telemetry</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShoppingBag} label="Orders Today" value={stats.totalOrders} color="#f97316" />
          <StatCard icon={Clock} label="Pending Prep" value={stats.pendingOrders} color="#3b82f6" />
          <StatCard icon={TrendingUp} label="Revenue Nodes" value={`₹${stats.totalSales}`} color="#22c55e" />
          <StatCard icon={Utensils} label="Hero Item" value={stats.popularItem} color="#a855f7" />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8">System Greeting</h3>
           <div className="max-w-2xl">
              <p className="text-xl font-black text-white uppercase tracking-tight leading-relaxed">
                Welcome back, Director. Your cafeteria nodes are fully operational. Access the <span className="text-orange-500">Cafeteria Hub</span> to manage active fuel sequences and the nutrient registry.
              </p>
           </div>
        </div>
      </div>
    </OwnerLayout>
  )
}

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex items-center gap-6 group hover:bg-white/10 transition-all"
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-inner">
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
      </div>
    </motion.div>
  )
}

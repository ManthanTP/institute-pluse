import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, HelpCircle, ChevronDown, ChevronUp, Leaf, GraduationCap, LayoutGrid, MapPin, UtensilsCrossed, ShieldAlert, Zap, CalendarDays, BarChart3, Info, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'

const ICON_MAP = {
  Leaf, GraduationCap, LayoutGrid, MapPin, UtensilsCrossed, ShieldAlert, Zap, CalendarDays, BarChart3, Award
}

export default function HelpPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [helpData, setHelpData] = useState([])
  const [loading, setLoading] = useState(true)
  const isFaculty = profile?.role === 'faculty'
  const [openIndex, setOpenIndex] = useState(0)

  useEffect(() => {
    fetchHelp()
  }, [profile?.role])

  async function fetchHelp() {
    setLoading(true)
    const role = isFaculty ? 'faculty' : 'student'
    const { data } = await supabase
      .from('help_content')
      .select('*')
      .eq('role', role)
      .order('order_index', { ascending: true })
    
    if (data) setHelpData(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Support Database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white pb-20 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-green-500/5 blur-[120px]" />
      </div>

      <header className="px-6 py-8 border-b border-white/5 relative z-10 backdrop-blur-xl bg-slate-950/40 flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 ${profile?.role === 'student' ? 'hidden lg:flex' : 'flex'}`}
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-1">Knowledge Base</p>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Help & <span className="text-blue-500">Support</span></h1>
        </div>
      </header>

      <main className="px-6 pt-10 relative z-10 max-w-2xl mx-auto">
        {false ? (
          <div />
        ) : (
          <>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Protocol Instructions</span>
              </div>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                Welcome to the InstitutePLUSE manual. Here you can find detailed operating procedures for each node in the ecosystem.
              </p>
            </div>

            <div className="space-y-4">
              {helpData.map((item, idx) => {
            const Icon = ICON_MAP[item.icon] || Info
            const isOpen = openIndex === idx

            return (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-[32px] border transition-all duration-500 overflow-hidden ${
                  isOpen ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <button 
                  className="w-full px-6 py-6 flex items-center justify-between gap-4"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isOpen ? 'bg-blue-600/20 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-gray-500'
                    }`}>
                      <Icon size={22} />
                    </div>
                    <div className="text-left">
                      <h3 className={`text-sm font-black tracking-tight uppercase ${isOpen ? 'text-white' : 'text-gray-400'}`}>
                        {item.title}
                      </h3>
                      <p className="text-[10px] font-medium text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                  <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-600'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-8 overflow-hidden"
                    >
                      <div className="h-[1px] bg-white/5 w-full mb-6" />
                      <div className="space-y-4">
                        {item.instructions.map((step, sIdx) => (
                          <div key={sIdx} className="flex gap-4">
                            <div className="w-5 h-5 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-blue-500 border border-blue-500/20 mt-0.5">
                              {sIdx + 1}
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
            </div>
          </>
        )}

        <div className="mt-16 p-8 rounded-[40px] bg-blue-600/5 border border-blue-500/10 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <HelpCircle size={80} className="text-blue-500" />
          </div>
          <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-2">Still Need Assistance?</h4>
          <p className="text-[10px] font-medium text-gray-500 leading-relaxed max-w-[240px] mx-auto mb-6">
            If you encounter any anomalies or technical faults, please submit a report through the Resolutions portal.
          </p>
          <button 
            onClick={() => navigate(isFaculty ? '/faculty/complaints' : '/complaints')}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all"
          >
            Open Support Console
          </button>
        </div>
      </main>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Command, ShieldAlert, Leaf, Wind } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import { motion, AnimatePresence } from 'framer-motion'

const SUGGESTIONS = [
  "How many eco-points do I have?",
  "What is my carbon footprint today?",
  "Tell me about the green challenges.",
  "How can I reduce my waste?",
  "What's for lunch in the cafeteria?"
]

export default function ChatbotPage() {
  const { profile } = useAuthStore()
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      content: `Hello ${profile?.full_name?.split(' ')[0] || 'Warrior'}! I am Nexus AI, your smart campus sustainability assistant. How can I help you today?`,
      time: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return
    
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg, time: new Date() }])
    setLoading(true)

    // Simulate AI Response (In production, connect to Gemini/OpenAI)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I am currently analyzing your request through the campus neural network. As an AI assistant, I can help you track your carbon emissions, manage your eco-points, and navigate Jain College of Engineering sustainability initiatives.",
        time: new Date()
      }])
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-green-500/10 blur-[120px]" />
      </div>

      {/* HEADER */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5 relative z-10 backdrop-blur-xl bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-green-600 p-[1px]">
               <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-inner">
                  <Bot size={24} className="text-blue-500" />
               </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Nexus AI</h1>
              <p className="text-[9px] font-black text-green-500 uppercase tracking-[0.3em] flex items-center gap-1.5">
                 <Sparkles size={10} className="animate-pulse" /> Neural Network Online
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
             <Command size={18} />
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 relative z-10 pb-40">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black shadow-lg ${
                m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-green-500 border border-white/10'
              }`}>
                {m.role === 'user' ? 'U' : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-[24px] backdrop-blur-xl border ${
                m.role === 'user' 
                  ? 'bg-blue-600/20 border-blue-500/20 text-white rounded-tr-none' 
                  : 'bg-white/5 border-white/10 text-white/90 rounded-tl-none'
              }`}>
                <p className="text-[12px] leading-relaxed font-medium">{m.content}</p>
                <p className={`text-[8px] font-black uppercase tracking-widest mt-2 opacity-40 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-72 p-6 z-20">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* SUGGESTIONS */}
          {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {SUGGESTIONS.map(s => (
                <button 
                  key={s} 
                  onClick={() => setInput(s)}
                  className="flex-shrink-0 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex items-center shadow-2xl">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask Nexus AI anything..."
                className="flex-1 bg-transparent border-none outline-none text-white text-[11px] font-black uppercase tracking-widest px-6 placeholder:text-gray-600"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:grayscale transition-all"
              >
                <Send size={18} />
              </motion.button>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 py-2 opacity-30">
             <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white" />
             <p className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Campus Intelligence</p>
             <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Command, ArrowLeft, Trash2 } from 'lucide-react'
import { useAuthStore } from '../../store/index'
import { chatWithAssistant } from '../../lib/gemini'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const SUGGESTIONS = [
  "How can I reduce my carbon footprint?",
  "Tell me about eco-points and badges",
  "What are green challenges?",
  "Tips for sustainable campus life",
  "Help me plan my study schedule"
]

export default function ChatbotPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      content: `Hello ${profile?.full_name?.split(' ')[0] || 'there'}! 👋 I'm InstitutePulseAI, your intelligent campus assistant. I can help with sustainability tips, eco-points, campus navigation, study planning, and more. What would you like to know?`,
      time: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (location.state?.initialMessage) {
      toast.success('Initializing AI Context...')
      handleDirectSend(location.state.initialMessage)
      // clear state to prevent re-sending on reload
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state])

  async function handleDirectSend(userMsg) {
    if (!userMsg.trim() || loading) return
    
    const newUserMessage = { role: 'user', content: userMsg, time: new Date() }
    setMessages(prev => [...prev, newUserMessage])
    setLoading(true)

    try {
      const response = await chatWithAssistant([{ role: 'user', content: userMsg }])
      setMessages(prev => [...prev, { role: 'bot', content: response, time: new Date() }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "I'm having trouble connecting right now.", time: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return
    
    const userMsg = input.trim()
    setInput('')
    const newUserMessage = { role: 'user', content: userMsg, time: new Date() }
    setMessages(prev => [...prev, newUserMessage])
    setLoading(true)

    try {
      // Build message history for Gemini
      const allMessages = [...messages, newUserMessage].map(m => ({
        role: m.role === 'bot' ? 'model' : 'user',
        content: m.content
      }))

      const response = await chatWithAssistant(allMessages)
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: response,
        time: new Date()
      }])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, {
        role: 'bot',
        content: "I'm having trouble connecting right now. Please try again in a moment. 🌿",
        time: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([{
      role: 'bot',
      content: `Chat cleared! How can I help you, ${profile?.full_name?.split(' ')[0] || 'there'}? 🌿`,
      time: new Date()
    }])
    toast.success('Chat history cleared')
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-green-500/10 blur-[120px]" />
      </div>

      {/* HEADER */}
      <div className="px-5 pt-5 pb-3 border-b border-white/5 relative z-10 backdrop-blur-xl bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-600 p-[1px]">
               <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-inner">
                 <Bot size={20} className="text-blue-500" />
               </div>
            </div>
            <div>
              <h1 className="text-base font-black text-white uppercase tracking-tight leading-none mb-0.5">InstitutePulseAI</h1>
              <p className="text-[8px] font-black text-green-500 uppercase tracking-[0.2em] flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
              </p>
            </div>
          </div>
          <button 
            onClick={clearChat}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
          >
             <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4 relative z-10 pb-44">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] flex items-end gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black shadow-lg ${
                m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-green-500 border border-white/10'
              }`}>
                {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`px-4 py-3 rounded-2xl backdrop-blur-xl border ${
                m.role === 'user' 
                  ? 'bg-blue-600/20 border-blue-500/20 text-white rounded-br-md' 
                  : 'bg-white/5 border-white/10 text-white/90 rounded-bl-md'
              }`}>
                <p className="text-[12px] leading-relaxed font-medium whitespace-pre-wrap">{m.content}</p>
                <p className={`text-[7px] font-black uppercase tracking-widest mt-1.5 opacity-30 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" />
              </div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-8">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* SUGGESTIONS */}
          {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {SUGGESTIONS.map(s => (
                <button 
                  key={s} 
                  onClick={() => { setInput(s); }}
                  className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 flex items-center shadow-2xl">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm px-4 placeholder:text-gray-600"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 disabled:opacity-40 transition-all"
              >
                <Send size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

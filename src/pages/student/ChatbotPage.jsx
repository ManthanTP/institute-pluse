import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { chatWithAssistant } from '../../lib/gemini'
import BottomTabBar from '../../components/BottomTabBar'

const QUICK_CHIPS = [
  'How do I reduce my carbon today?',
  'What are eco-points?',
  'Best low-carbon lunch options?',
  'How to earn badges faster?',
  'What is the campus CO2 budget?',
  'Tips to increase my eco score?',
]

const INITIAL_MSG = {
  role: 'assistant',
  content: "Hi! 🌿 I'm InstitutePulse AI Assistant. I can help you with carbon footprint tracking, eco-points, bus info, cafeteria choices, and campus sustainability.\n\nAsk me anything!"
}

export default function ChatbotPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([INITIAL_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const userMsg = text || input.trim()
    if (!userMsg || loading) return
    setInput('')

    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const reply = await chatWithAssistant(newMessages)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again. 🌿' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header className="app-header flex-shrink-0">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <div className="flex items-center gap-2">
          <span className="text-lg">🌿</span>
          <span className="font-bold text-white text-sm">SCSAS Assistant</span>
          <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
        </div>
        <button onClick={() => setMessages([INITIAL_MSG])} className="text-xs text-green-200 font-medium">
          Clear
        </button>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36">
        {/* QUICK CHIPS (only on first load) */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2 text-center">Quick questions:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_CHIPS.map(chip => (
                <button key={chip} onClick={() => send(chip)}
                  className="px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
                  style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full gradient-eco flex items-center justify-center text-sm flex-shrink-0">
                  🌿
                </div>
              )}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full gradient-eco flex items-center justify-center text-sm flex-shrink-0">🌿</div>
              <div className="chat-bubble-ai">
                <div className="flex gap-1 items-center h-5">
                  <div className="w-2 h-2 rounded-full bg-gray-400" style={{ animation: 'pulse 1s ease infinite 0s' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400" style={{ animation: 'pulse 1s ease infinite 0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400" style={{ animation: 'pulse 1s ease infinite 0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={endRef} />
      </div>

      {/* INPUT BAR */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 flex gap-2"
        style={{ background: 'rgba(248,250,252,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #e2e8f0' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          className="input-field flex-1 text-sm py-3"
          placeholder="Ask me anything eco-related..."
        />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="btn-primary px-4 py-3 rounded-xl"
          style={{ background: input.trim() ? '#16a34a' : '#e2e8f0', color: input.trim() ? 'white' : '#94a3b8' }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

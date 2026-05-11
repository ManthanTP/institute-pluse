import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { askLabAssistant } from '../../lib/gemini'
import BottomTabBar from '../../components/BottomTabBar'

const SUBJECTS = [
  { key: 'physics', label: 'Physics', emoji: '⚛️' },
  { key: 'chemistry', label: 'Chemistry', emoji: '🧪' },
  { key: 'computer_science', label: 'CS', emoji: '💻' },
  { key: 'electronics', label: 'Electronics', emoji: '🔌' },
  { key: 'biology', label: 'Biology', emoji: '🧬' },
]

const QUICK_ACTIONS = ['Explain Experiment', 'Generate Viva Qs', 'Step-by-Step Procedure', 'Safety Precautions']

export default function LabAssistantPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `Hello! 🔬 I'm your ${subject.label} Lab Assistant. I can help you understand experiments, generate viva questions, and explain lab procedures step-by-step.\n\n🌿 Using digital lab assistance saves paper and earns eco-points!`
    }])
  }, [subject.key])

  async function send(text) {
    const query = text || input.trim()
    if (!query || loading) return
    setInput('')
    const newMsgs = [...messages, { role: 'user', content: query }]
    setMessages(newMsgs)
    setLoading(true)
    const reply = await askLabAssistant(subject.label, query)
    setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    setLoading(false)
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header className="app-header">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} color="white" /></button>
        <span className="font-bold text-white">🤖 Lab Assistant</span>
        <button onClick={() => setMessages([messages[0]])} className="text-xs text-green-200">Clear</button>
      </header>

      {/* SUBJECT SELECTOR */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3" style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        {SUBJECTS.map(s => (
          <button key={s.key} onClick={() => setSubject(s)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1"
            style={{ background: subject.key === s.key ? '#16a34a' : '#f0fdf4', color: subject.key === s.key ? 'white' : '#16a34a' }}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      {messages.length <= 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2" style={{ background: '#fafafa' }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a} onClick={() => send(a)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium"
              style={{ borderColor: '#e2e8f0', color: '#64748b', background: 'white' }}>
              {a}
            </button>
          ))}
        </div>
      )}

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-2 mb-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full gradient-eco flex items-center justify-center text-sm flex-shrink-0">🔬</div>
            )}
            <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full gradient-eco flex items-center justify-center text-sm">🔬</div>
            <div className="chat-bubble-ai">
              <div className="flex gap-1 h-4 items-center">
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} className="w-2 h-2 bg-gray-400 rounded-full" style={{ animation: `pulse 1s ease-in-out ${d}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 flex gap-2"
        style={{ background: 'rgba(248,250,252,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #e2e8f0' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="input-field flex-1 text-sm py-3"
          placeholder={`Ask about ${subject.label} experiments...`} />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="btn-primary px-4 py-3 rounded-xl"
          style={{ background: input.trim() ? '#16a34a' : '#e2e8f0', color: input.trim() ? 'white' : '#94a3b8' }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

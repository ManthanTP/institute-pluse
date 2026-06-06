import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Cpu, Terminal, X, Check } from 'lucide-react'

const STEPS = [
  { text: 'Initializing Pulse Core...', pct: 15 },
  { text: 'Aggregating Matrix Logs...', pct: 35 },
  { text: 'Formulating Data Structs...', pct: 55 },
  { text: 'Optimizing Visual Grids...', pct: 75 },
  { text: 'Cryptographically Signing Dossier...', pct: 90 },
  { text: 'Transmission Complete!', pct: 100 }
]

export default function PDFExportModal({ isOpen, onClose, onTriggerDownload }) {
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setProgress(0)
      setCurrentStepIndex(0)
      return
    }

    // Progress counter animation from 0 to 100
    const duration = 2400 // total animation time in ms
    const intervalTime = 30
    const step = 100 / (duration / intervalTime)

    const timer = setInterval(() => {
      setProgress(curr => {
        const next = curr + step
        if (next >= 100) {
          clearInterval(timer)
          
          // Triggers the download after a small completion delay
          setTimeout(() => {
            onTriggerDownload()
            onClose()
          }, 400)
          
          return 100
        }
        return next
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [isOpen])

  // Sync step indicators with progress percentages
  useEffect(() => {
    const stepIndex = STEPS.findIndex(s => progress <= s.pct)
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex)
    } else {
      setCurrentStepIndex(STEPS.length - 1)
    }
  }, [progress])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6">
      {/* Background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Cyberpunk HUD Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-sm bg-slate-900 border border-cyan-500/20 rounded-[40px] p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
      >
        {/* HUD Corner Decorators */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-500/40" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-500/40" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-500/40" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-500/40" />

        {/* Circular Conic Progress */}
        <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="42%" className="stroke-white/5 fill-none" strokeWidth="4" />
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              className="fill-none stroke-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - progress / 100)}
              style={{ strokeLinecap: 'round' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white italic tracking-tighter">
              {Math.round(progress)}%
            </span>
            <span className="text-[6px] font-black text-cyan-400 uppercase tracking-[0.3em] mt-1 animate-pulse">
              EXTRACTING
            </span>
          </div>
        </div>

        {/* Extraction Stages Log */}
        <div className="mb-8 space-y-2 text-left bg-slate-950/60 border border-white/5 rounded-2xl p-4 min-h-[140px] flex flex-col justify-center">
          <div className="flex items-center gap-2 text-cyan-400 mb-3 pb-2 border-b border-white/5">
            <Terminal size={12} />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Transmission Protocol</span>
          </div>
          
          {STEPS.map((step, idx) => {
            const isCompleted = progress > step.pct || (idx < currentStepIndex)
            const isActive = idx === currentStepIndex
            
            return (
              <div 
                key={idx} 
                className={`flex items-center justify-between text-[8px] font-black uppercase tracking-wider transition-colors duration-300 ${
                  isCompleted ? 'text-cyan-400' : isActive ? 'text-white' : 'text-gray-600'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-cyan-500' : isActive ? 'bg-white animate-ping' : 'bg-gray-700'}`} />
                  {step.text}
                </span>
                {isCompleted && <Check size={8} strokeWidth={4} className="text-cyan-400" />}
              </div>
            )
          })}
        </div>

        {/* Action button */}
        <button 
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/20 text-gray-400 hover:text-red-400 text-[9px] font-black uppercase tracking-[0.3em] transition-all"
        >
          Abort Extraction
        </button>
      </motion.div>
    </div>
  )
}

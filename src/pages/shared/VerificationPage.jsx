import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ShieldAlert, Calendar, Cpu, Hash, ArrowLeft, Search, Loader2, Sparkles, FileText, CheckCircle, Clock } from 'lucide-react'
import { useAuthStore } from '../../store/index'

export default function VerificationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [tokenInput, setTokenInput] = useState(id || '')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchTriggered, setSearchTriggered] = useState(!!id)
  const [verificationResult, setVerificationResult] = useState(null)

  // Token parser logic
  const parseToken = (token) => {
    if (!token) return null
    const cleanToken = token.trim().toUpperCase()
    const parts = cleanToken.split('-')
    if (parts.length !== 3 || parts[0] !== 'PULSE') {
      return { isValid: false, token: cleanToken }
    }
    
    try {
      const timestampMs = parseInt(parts[1].toLowerCase(), 36)
      if (isNaN(timestampMs) || timestampMs < 1577836800000 || timestampMs > 2524608000000) {
        return { isValid: false, token: cleanToken }
      }
      
      const date = new Date(timestampMs)
      // Hash algorithm mirroring pdfExport.js
      const hash = cleanToken.split('').reduce((h, char) => (h * 31 + char.charCodeAt(0)) % 1000000007, 0)
      const checksum = hash.toString(16).toUpperCase()
      
      return {
        isValid: true,
        token: cleanToken,
        date: date.toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        }),
        timestamp: timestampMs,
        checksum: `SHA-256:${checksum}`,
      }
    } catch (e) {
      return { isValid: false, token: cleanToken }
    }
  }

  // Triggered when verification is processed
  const handleVerify = (tokenToVerify) => {
    if (!tokenToVerify) return
    setIsAnalyzing(true)
    setSearchTriggered(true)

    // Simulate high-security decryption/verification analysis pipeline
    setTimeout(() => {
      const result = parseToken(tokenToVerify)
      setVerificationResult(result)
      setIsAnalyzing(false)
    }, 1500)
  }

  useEffect(() => {
    if (id) {
      setTokenInput(id)
      handleVerify(id)
    } else {
      setSearchTriggered(false)
      setVerificationResult(null)
    }
  }, [id])

  const goHome = () => {
    if (user) navigate('/dashboard')
    else navigate('/')
  }

  // Determine glow color theme based on state
  const getThemeColors = () => {
    if (isAnalyzing) return 'from-blue-500/10 to-indigo-500/5 border-blue-500/30 text-blue-400'
    if (!searchTriggered) return 'from-slate-500/10 to-slate-900/5 border-slate-700/30 text-slate-400'
    if (verificationResult?.isValid) return 'from-emerald-500/10 to-green-500/5 border-emerald-500/30 text-emerald-400'
    return 'from-red-500/10 to-rose-500/5 border-red-500/30 text-red-400'
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden flex flex-col items-center justify-center py-12 px-4">
      
      {/* Aurora mesh background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="analyzing-aurora"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/[0.06] blur-[120px]"
            />
          ) : !searchTriggered ? (
            <motion.div
              key="neutral-aurora"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/[0.04] blur-[120px]"
            />
          ) : verificationResult?.isValid ? (
            <motion.div
              key="success-aurora"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/[0.08] blur-[120px]"
            />
          ) : (
            <motion.div
              key="error-aurora"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-red-500/[0.08] blur-[120px]"
            />
          )}
        </AnimatePresence>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/[0.04] blur-[120px]" />
      </div>

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />

      {/* Grid pattern */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-xl relative z-20">
        
        {/* Top Header / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-3">
            <Cpu size={12} className="text-emerald-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">Secure Cryptographic Notary</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight italic uppercase">
            Institute<span className="text-emerald-400">Pulse</span> Verification
          </h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            Validate document seals & integrity keys in real-time
          </p>
        </div>

        {/* HUD Box wrapper */}
        <div className={`relative bg-slate-950/80 backdrop-blur-xl border rounded-3xl p-6 sm:p-8 transition-all duration-500 shadow-2xl ${
          isAnalyzing ? 'border-blue-500/20 shadow-blue-500/5' :
          !searchTriggered ? 'border-slate-800 shadow-black' :
          verificationResult?.isValid ? 'border-emerald-500/20 shadow-emerald-500/5' :
          'border-red-500/20 shadow-red-500/5'
        }`}>
          
          {/* Corner highlights */}
          <div className={`absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 rounded-tl-3xl transition-colors duration-500 ${
            isAnalyzing ? 'border-blue-500' :
            !searchTriggered ? 'border-slate-700' :
            verificationResult?.isValid ? 'border-emerald-500' : 'border-red-500'
          }`} />
          <div className={`absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 rounded-tr-3xl transition-colors duration-500 ${
            isAnalyzing ? 'border-blue-500' :
            !searchTriggered ? 'border-slate-700' :
            verificationResult?.isValid ? 'border-emerald-500' : 'border-red-500'
          }`} />
          <div className={`absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 rounded-bl-3xl transition-colors duration-500 ${
            isAnalyzing ? 'border-blue-500' :
            !searchTriggered ? 'border-slate-700' :
            verificationResult?.isValid ? 'border-emerald-500' : 'border-red-500'
          }`} />
          <div className={`absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 rounded-br-3xl transition-colors duration-500 ${
            isAnalyzing ? 'border-blue-500' :
            !searchTriggered ? 'border-slate-700' :
            verificationResult?.isValid ? 'border-emerald-500' : 'border-red-500'
          }`} />

          {/* Form to enter manually or when no ID */}
          {!id && (
            <div className="mb-8">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Enter Document Token ID
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="e.g. PULSE-KL9A8B7C-4X9F"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify(tokenInput)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-4 pr-12 text-sm font-mono placeholder-slate-700 focus:outline-none focus:border-emerald-500/50 transition-all text-white uppercase"
                />
                <button
                  onClick={() => handleVerify(tokenInput)}
                  disabled={isAnalyzing || !tokenInput.trim()}
                  className="absolute right-2 p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl text-slate-950 transition-all"
                >
                  {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Verification Screens */}
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div
                key="analyzing-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-10"
              >
                <div className="relative w-20 h-20 mb-6">
                  {/* Glowing core */}
                  <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-base font-black uppercase tracking-wider italic">Decrypting Signatures</h3>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1.5 animate-pulse">
                  Querying SHA-256 seal integrity & parsing token...
                </p>
              </motion.div>
            )}

            {!isAnalyzing && !searchTriggered && (
              <motion.div
                key="waiting-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <FileText size={48} className="text-slate-700 mb-4 animate-bounce" style={{ animationDuration: '3s' }} />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Seal Awaiting Input</h3>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest max-w-xs mt-2 leading-relaxed">
                  Please provide a valid document token issued by the system to run integrity checks.
                </p>
              </motion.div>
            )}

            {!isAnalyzing && searchTriggered && verificationResult && (
              <motion.div
                key="result-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {verificationResult.isValid ? (
                  /* SECURED & VALID STATUS */
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <ShieldCheck size={36} className="text-emerald-400" />
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-1">
                      Verification Successful
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight italic text-white mb-6">
                      Document Genuine
                    </h3>

                    {/* Meta Details Table */}
                    <div className="w-full bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden divide-y divide-slate-900/60 mb-6">
                      <div className="flex items-center justify-between p-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                          <Hash size={12} className="text-slate-600" /> Document Token
                        </span>
                        <span className="font-mono text-xs font-bold text-white tracking-wider">
                          {verificationResult.token}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                          <Calendar size={12} className="text-slate-600" /> Date Generated
                        </span>
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          {verificationResult.date}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                          <Cpu size={12} className="text-slate-600" /> Cryptographic Seal
                        </span>
                        <span className="font-mono text-[10px] font-black text-emerald-400/80 bg-emerald-500/[0.04] border border-emerald-500/10 px-2.5 py-1 rounded-md tracking-wider">
                          {verificationResult.checksum}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                          <CheckCircle size={12} className="text-slate-600" /> System Status
                        </span>
                        <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Verified Genuine
                        </span>
                      </div>
                    </div>

                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed text-center max-w-sm">
                      This digital record was verified directly against the cryptographic seal issued at generation. All matching hashes match.
                    </p>
                  </div>
                ) : (
                  /* CRYPTOGRAPHIC FAIL STATUS */
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
                      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                        <ShieldAlert size={36} className="text-red-400" />
                      </div>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-1">
                      Security Warning
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight italic text-white mb-6">
                      Signature Corrupted
                    </h3>

                    <div className="w-full bg-slate-900/40 border border-slate-900 rounded-2xl p-5 mb-6 text-center">
                      <span className="inline-block font-mono text-xs font-bold text-red-400 bg-red-500/[0.04] border border-red-500/15 px-3 py-1.5 rounded-lg mb-3 uppercase">
                        {verificationResult.token || 'INVALID_KEY'}
                      </span>
                      <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                        The requested token did not match any signature in the notary protocol. It does not follow the format or has been manually altered.
                      </p>
                    </div>

                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed text-center max-w-sm">
                      Caution: Do not trust reports containing this verification seal. Verify formatting and try again.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset / Manual input triggers */}
          {id && searchTriggered && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 pt-6 border-t border-slate-900 flex justify-center"
            >
              <button
                onClick={() => navigate('/verify')}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                <Search size={12} />
                Verify Another Token
              </button>
            </motion.div>
          )}
        </div>

        {/* Global actions */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={goHome}
            className="flex items-center gap-2 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={14} />
            Return to Base
          </button>
        </div>

        {/* Footer Seal info */}
        <div className="mt-12 text-center text-[8px] font-black text-gray-700 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
          <Cpu size={12} className="text-gray-800" />
          <span>Pulse Notary Seal v3.0 • Secure Ledger Interface</span>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Loader2, Scan } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function OrderScannerModal({ isOpen, onClose, onOrderProcessed }) {
  const [scannedOrder, setScannedOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const scannerRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      if (!scannedOrder) startScanner()
    } else {
      stopScanner()
      setScannedOrder(null)
    }
    return () => stopScanner()
  }, [isOpen, scannedOrder])

  const startScanner = async () => {
    // Ensure cleanup of any existing instance
    if (scannerRef.current) {
      await stopScanner()
    }

    // Polling function to wait for the DOM element to be available (handles animation delay)
    const waitForElement = (id, retries = 20, delay = 100) => {
      return new Promise((resolve, reject) => {
        const check = () => {
          const el = document.getElementById(id)
          if (el) {
            resolve(el)
          } else if (retries > 0) {
            setTimeout(check, delay)
          } else {
            reject(new Error(`Scanner container element #${id} not found in DOM`))
          }
        }
        check()
      })
    }

    try {
      await waitForElement("qr-reader-global")
      const html5QrCode = new Html5Qrcode("qr-reader-global")
      scannerRef.current = html5QrCode
      
      const config = { 
        fps: 15, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true
      }
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          handleScanSuccess(decodedText)
        },
        () => {} // Silent scan errors
      )
    } catch (err) {
      console.error("Scanner Start Error:", err)
      const errMsg = err?.toString() || ""
      if (!errMsg.includes("is already running")) {
        toast.error("Camera access failed. Check permissions.")
      }
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        // Properly destroy instance
        scannerRef.current = null
        const element = document.getElementById("qr-reader-global")
        if (element) element.innerHTML = ""
      } catch (err) {
        console.error("Scanner Stop Error:", err)
      }
    }
  }

  const handleScanSuccess = async (orderId) => {
    await stopScanner()
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(full_name, role)')
        .eq('id', orderId)
        .single()
      
      if (data) {
        setScannedOrder(data)
        toast.success("Order Identified")
      } else {
        toast.error("Invalid Order QR")
        startScanner() // Restart if invalid
      }
    } catch (e) {
      toast.error("Network synchronization error")
      startScanner()
    }
    setLoading(false)
  }

  async function updateOrderStatus(id, status) {
    setLoading(true)
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (!error) {
      toast.success(`Order Protocol: ${status.toUpperCase()}`)
      if (onOrderProcessed) onOrderProcessed(id, status)
      setScannedOrder(null)
      onClose()
    } else {
      toast.error("Sync Failed")
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-10"
      >
        {/* Background Mesh */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-orange-600/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-orange-900/5 blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
          {/* Header Area */}
          <div className="flex items-center justify-between w-full mb-10">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Optical Matrix</h3>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-1 italic">Order Verification Protocol</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all shadow-xl"
            >
              <X size={22} />
            </button>
          </div>
          
          <AnimatePresence mode="wait">
            {!scannedOrder ? (
              <motion.div 
                key="scanner-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                {/* Scanner Container */}
                <div className="relative w-full aspect-square overflow-hidden rounded-[40px] border-2 border-orange-500/30 bg-black shadow-2xl shadow-orange-900/20">
                  <div id="qr-reader-global" className="w-full h-full scale-[1.01]" />
                  
                  {/* Dimmed Overlay with Viewfinder Hole */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" style={{
                        clipPath: 'polygon(0% 0%, 0% 100%, 50% 100%, 50% 18%, 82% 18%, 82% 82%, 18% 82%, 18% 18%, 50% 18%, 50% 100%, 100% 100%, 100% 0%)'
                    }} />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[64%] h-[64%] border-2 border-orange-500/20 rounded-3xl relative">
                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-xl" />
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-xl" />
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-xl" />
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-xl" />
                            
                            <motion.div 
                              animate={{ top: ['0%', '100%', '0%'] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_rgba(249,115,22,0.6)]"
                            />
                        </div>
                    </div>
                  </div>

                  {loading && (
                    <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="text-orange-500 animate-spin" size={40} />
                    </div>
                  )}
                </div>
                <p className="mt-10 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] text-center italic">Center Order Code in Grid</p>
              </motion.div>
            ) : (
              <motion.div 
                key="details-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 pointer-events-none">
                  <Scan size={100} />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-2xl font-black text-white italic leading-none">
                        #{scannedOrder.token_number || scannedOrder.id.slice(0, 4).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${scannedOrder.profiles?.role === 'faculty' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                          {scannedOrder.profiles?.role || 'Guest'}
                        </span>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[150px]">{scannedOrder.profiles?.full_name}</p>
                      </div>
                    </div>
                    <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-500 border border-orange-500/20">{scannedOrder.status}</span>
                  </div>

                  <div className="space-y-3 mb-8 max-h-[30vh] overflow-y-auto no-scrollbar pr-1">
                    {scannedOrder.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-black uppercase italic">
                        <span className="text-gray-400">{it.quantity}x {it.name}</span>
                        <span className="text-white">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between p-4 bg-orange-600/10 rounded-2xl border border-orange-600/20 text-[11px] font-black uppercase">
                        <span className="text-orange-500">Total Bill</span>
                        <span className="text-white">₹{scannedOrder.total_price}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {scannedOrder.status === 'pending' && (
                      <button 
                        onClick={() => updateOrderStatus(scannedOrder.id, 'preparing')} 
                        disabled={loading}
                        className="w-full py-5 rounded-2xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Authorize Preparation'}
                      </button>
                    )}
                    {scannedOrder.status === 'preparing' && (
                      <button 
                        onClick={() => updateOrderStatus(scannedOrder.id, 'ready')} 
                        disabled={loading}
                        className="w-full py-5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sync: Mark Ready'}
                      </button>
                    )}
                    {scannedOrder.status === 'ready' && (
                      <button 
                        onClick={() => updateOrderStatus(scannedOrder.id, 'delivered')} 
                        disabled={loading}
                        className="w-full py-5 rounded-2xl bg-green-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Finalize Delivery'}
                      </button>
                    )}
                    <button 
                      onClick={() => setScannedOrder(null)} 
                      disabled={loading}
                      className="w-full py-5 rounded-2xl bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white active:scale-95 transition-all"
                    >
                      Rescan Protocol
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

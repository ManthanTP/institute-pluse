import { useState } from 'react'
import { Beaker, FlaskConical, Search, BookOpen, Clock, AlertCircle, Sparkles, Wand2, Terminal, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const EXPERIMENTS = [
  { id: '1', name: 'Newton\'s Ring Experiment', dept: 'Physics', duration: '3 Hours', difficulty: 'Intermediate', risk: 'Low', instructions: 'Measure the diameter of Newton\'s rings to find wavelength.' },
  { id: '2', name: 'Young\'s Modulus', dept: 'Mechanical', duration: '2 Hours', difficulty: 'Advanced', risk: 'Medium', instructions: 'Determine the elastic property of material.' },
  { id: '3', name: 'Spectrometer Calibration', dept: 'Physics', duration: '4 Hours', difficulty: 'Intermediate', risk: 'Low', instructions: 'Calibrate using mercury lamp lines.' },
  { id: '4', name: 'Digital Logic Design', dept: 'CS/IS', duration: '3 Hours', difficulty: 'Easy', risk: 'None', instructions: 'Design a 4-bit adder using logic gates.' },
  { id: '5', name: 'Chemical Titration', dept: 'Chemistry', duration: '2 Hours', difficulty: 'Intermediate', risk: 'High', instructions: 'Acid-base titration for concentration analysis.' },
]

export default function LabAssistantPage() {
  const [search, setSearch] = useState('')
  const [selectedExp, setSelectedExp] = useState(null)

  const filtered = EXPERIMENTS.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.dept.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-[100dvh] bg-slate-950 pb-28 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-6">
        {/* HEADER AREA */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Nexus Research</span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2">Lab Assistant</h1>
            <p className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-1.5">
               <Shield size={10} /> Safety Protocol Active
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-500">
             <FlaskConical size={22} />
          </div>
        </div>

        {/* SEARCH BOX */}
        <div className="relative group mb-10">
           <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
           <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-4 backdrop-blur-xl">
             <Search size={18} className="text-gray-500" />
             <input 
               value={search} 
               onChange={e => setSearch(e.target.value)}
               placeholder="Find experiment or department..." 
               className="flex-1 bg-transparent border-none outline-none text-white text-[11px] font-black uppercase tracking-widest ml-4 placeholder:text-gray-700"
             />
           </div>
        </div>

        {/* EXPERIMENT LIST */}
        <div className="space-y-4">
           <AnimatePresence mode="popLayout">
            {filtered.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedExp(exp)}
                className="group bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl cursor-pointer hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-2xl rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                   <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-black text-cyan-500 uppercase tracking-widest">
                        {exp.dept}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        exp.risk === 'High' ? 'bg-red-500/10 border border-red-500/20 text-red-500' : 'bg-green-500/10 border border-green-500/20 text-green-500'
                      }`}>
                        Risk: {exp.risk}
                      </span>
                   </div>
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                      <Clock size={10} /> {exp.duration}
                   </div>
                </div>

                <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2 relative z-10">{exp.name}</h3>
                
                <div className="flex items-center gap-4 relative z-10">
                   <div className="flex items-center gap-1.5">
                      <Terminal size={12} className="text-gray-500" />
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{exp.difficulty}</span>
                   </div>
                   <div className="w-0.5 h-0.5 rounded-full bg-white/20" />
                   <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={10} /> View Manual
                   </p>
                </div>
              </motion.div>
            ))}
           </AnimatePresence>

           {filtered.length === 0 && (
             <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl">
                <div className="text-4xl mb-4 opacity-40">🔬</div>
                <p className="text-xs font-black text-white uppercase tracking-widest">No Manual Found</p>
                <p className="text-[10px] font-medium text-gray-500 mt-2">Try searching by department name</p>
             </div>
           )}
        </div>
      </div>

      {/* MANUAL OVERLAY */}
      <AnimatePresence>
        {selectedExp && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60]"
              onClick={() => setSelectedExp(null)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 lg:left-72 bg-slate-900 border-t border-white/10 rounded-t-[48px] z-[70] p-10 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 flex items-center justify-center text-cyan-500">
                       <BookOpen size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Standard Operating Procedure</p>
                       <h2 className="text-lg font-black text-white uppercase tracking-tight">{selectedExp.name}</h2>
                    </div>
                 </div>
                 <button onClick={() => setSelectedExp(null)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500"><X size={20} /></button>
              </div>

              <div className="space-y-10">
                 <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                       <AlertCircle size={14} /> Critical Instructions
                    </h4>
                    <p className="text-white/80 text-[13px] leading-relaxed font-medium">
                       {selectedExp.instructions}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Estimated Time</p>
                       <p className="text-lg font-black text-white tracking-tighter">{selectedExp.duration}</p>
                    </div>
                    <div className={`bg-white/5 border rounded-3xl p-6 ${selectedExp.risk === 'High' ? 'border-red-500/20' : 'border-white/10'}`}>
                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Safety Level</p>
                       <p className={`text-lg font-black tracking-tighter ${selectedExp.risk === 'High' ? 'text-red-500' : 'text-green-500'}`}>
                          {selectedExp.risk} Risk
                       </p>
                    </div>
                 </div>

                 <button 
                  onClick={() => {
                    toast.success('Lab Session Initialized')
                    setSelectedExp(null)
                  }}
                  className="w-full py-5 rounded-[28px] bg-cyan-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-600/20 transition-all hover:scale-[1.02] active:scale-95"
                 >
                    Initialize Lab Session
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function X({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

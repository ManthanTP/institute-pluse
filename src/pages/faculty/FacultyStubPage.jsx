import FacultyLayout from './FacultyLayout'
import { motion } from 'framer-motion'

export default function FacultyStubPage({ title, icon: Icon }) {
  return (
    <FacultyLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-lg mx-auto"
        >
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-xl font-black text-white mb-3 tracking-tight">{title}</h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            This faculty module is ready for integration. Connect your Supabase backend and the data will populate here automatically.
          </p>
          <div className="mt-8 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Module Standby</span>
          </div>
        </motion.div>
      </div>
    </FacultyLayout>
  )
}

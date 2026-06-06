import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import profile1 from '../../assets/profile-1.png'
import profile2 from '../../assets/profile-2.png'

export default function PortfolioPreview() {
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev === 0 ? 1 : 0))
    }, 4000) // Slide automatically every 4 seconds
    return () => clearInterval(timer)
  }, [])

  return (
    <a
      href="https://manthantp-portfolio.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block cursor-pointer"
    >
      {/* Ambient glow behind card */}
      <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-cyan-500/2 blur-[50px] opacity-40 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none" />

      {/* Animated gradient border */}
      <div
        className="absolute -inset-[1px] rounded-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, #00f5ff, #8b5cf6, #00f5ff, #8b5cf6)',
          backgroundSize: '300% 300%',
          animation: 'borderGlow 4s ease infinite',
        }}
      />

      {/* Main card */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0c1225]/35 border border-white/[0.04] transition-all duration-500 group-hover:bg-[#0c1225]/45">
        {/* Browser chrome bar */}
        <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.02] border-b border-white/[0.05]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 mx-4">
            <div className="max-w-[280px] mx-auto bg-white/[0.03] rounded-lg px-3 py-1 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500/40 flex-shrink-0" />
              <span className="text-[9px] font-mono text-gray-500 truncate">manthantp-portfolio.vercel.app</span>
            </div>
          </div>
          <ExternalLink size={12} className="text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
        </div>

        {/* Screenshot area with fixed height to prevent shifts */}
        <div className="relative overflow-hidden h-[180px] sm:h-[220px] md:h-[250px] bg-black">
          <img
            src={profile1}
            alt="Manthan Patel Portfolio Slide 1"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out group-hover:scale-[1.025] ${
              activeImage === 0 ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />
          <img
            src={profile2}
            alt="Manthan Patel Portfolio Slide 2"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out group-hover:scale-[1.025] ${
              activeImage === 1 ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/30 to-transparent opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/20 to-transparent" />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors duration-500" />

          {/* "Visit" prompt on hover */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <div className="px-6 py-3 rounded-2xl bg-black/70 backdrop-blur-xl border border-cyan-500/20 flex items-center gap-2.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <ExternalLink size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">View Live Portfolio</span>
            </div>
          </div>
        </div>

        {/* Bottom info strip */}
        <div className="px-5 py-4 bg-white/[0.01] border-t border-white/[0.05] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-wider">Manthan Patel</p>
            <p className="text-[9px] text-gray-500 mt-0.5">Full Stack Developer & AI Builder</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>

      {/* CSS animation for the gradient border */}
      <style>{`
        @keyframes borderGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </a>
  )
}

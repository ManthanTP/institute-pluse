import { useRef } from 'react'
import { ExternalLink, Github, ArrowUpRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import SkillBadge from './SkillBadge'
import PortfolioPreview from './PortfolioPreview'

const defaultContent = {
  sectionLabel: 'The Creator',
  sectionTitle: 'About The Creator',
  name: 'Manthan Patel',
  description: 'Passionate Full Stack Developer focused on AI-powered systems, futuristic UI/UX, and smart campus innovation platforms.',
  portfolioUrl: 'https://manthantp-portfolio.vercel.app/',
  githubUrl: 'https://github.com/ManthanTP',
  connectUrl: 'https://manthantp-portfolio.vercel.app/#contact',
  skills: ['React', 'Next.js', 'Supabase', 'Tailwind CSS', 'TypeScript', 'AI Systems', 'UI/UX', 'Vite'],
  stats: [
    { value: "20+", label: "Projects", icon: "Code2", color: "#00f5ff", link: "https://manthantp-portfolio.vercel.app/#projects" },
    { value: "15+", label: "Skills", icon: "Cpu", color: "#8b5cf6", link: "https://manthantp-portfolio.vercel.app/" },
    { value: "10+", label: "Blogs", icon: "BookOpen", color: "#00f5ff", link: "https://manthantp-portfolio.vercel.app/" },
    { value: "12+", label: "Achievement Unlocks", icon: "Trophy", color: "#8b5cf6", link: "https://manthantp-portfolio.vercel.app/" }
  ]
}

export default function AboutCreator({ content }) {
  const sectionRef = useRef(null)

  const merged = {
    ...defaultContent,
    ...content,
    skills: content?.skills || defaultContent.skills,
    stats: content?.stats || defaultContent.stats,
  }

  // Split title to apply gradient to the last word dynamically
  const words = (merged.sectionTitle || 'About The Creator').split(' ')
  const lastWord = words.pop()
  const firstPart = words.join(' ')

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-20 md:py-28 px-5 md:px-6 overflow-hidden border-t border-white/[0.04]"
      id="about-creator"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Label */}
        <div className="text-center mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em]">{merged.sectionLabel}</span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-[-0.04em] uppercase leading-[0.95] text-white">
            {firstPart}{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent" style={{ backgroundSize: '200% 200%', animation: 'creatorGradient 5s ease infinite' }}>
              {lastWord}
            </span>
          </h2>
        </div>

        {/* Main Grid: Preview + Content */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Portfolio Preview */}
          <div className="order-2 lg:order-1">
            <PortfolioPreview />
          </div>

          {/* Right — Text Content */}
          <div className="order-1 lg:order-2 flex flex-col gap-8">
            {/* Name & Title */}
            <div>
              <h3 className="text-2xl md:text-4xl font-black tracking-tight uppercase leading-tight mb-4 text-white">
                Built by{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  {merged.name}
                </span>
              </h3>
              <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed max-w-lg">
                {merged.description}
              </p>
            </div>

            {/* Tech Stack */}
            <div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Tech Stack</p>
              <div className="flex flex-wrap gap-2.5">
                {merged.skills.map((skill, i) => (
                  <SkillBadge key={skill} name={skill} index={i} />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {/* View Portfolio */}
              {merged.portfolioUrl && (
                <a
                  href={merged.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl"
                >
                  {/* Animated gradient bg */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 opacity-95 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />
                  <span className="relative px-7 py-4 text-[10px] font-black text-white uppercase tracking-[0.25em] flex items-center gap-2.5">
                    View Portfolio <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </a>
              )}

              {/* GitHub */}
              {merged.githubUrl && (
                <a
                  href={merged.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-7 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-[10px] font-black text-gray-300 uppercase tracking-[0.25em] hover:bg-white/[0.06] hover:border-cyan-500/20 hover:text-white transition-all duration-300 flex items-center gap-2.5 backdrop-blur-xl"
                >
                  <Github size={14} className="group-hover:text-cyan-400 transition-colors" /> GitHub
                </a>
              )}

              {/* Connect */}
              {merged.connectUrl && (
                <a
                  href={merged.connectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-7 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-[10px] font-black text-gray-300 uppercase tracking-[0.25em] hover:bg-white/[0.06] hover:border-purple-500/20 hover:text-white transition-all duration-300 flex items-center gap-2.5 backdrop-blur-xl"
                >
                  Connect <ArrowUpRight size={14} className="group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 md:mt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {merged.stats.map((stat, idx) => {
              const IconComponent = Icons[stat.icon] || Icons.Code2
              return (
                <div
                  key={stat.label || idx}
                  className="group relative"
                >
                  {/* Glow */}
                  <div
                    className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-sm pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${stat.color}30, transparent)` }}
                  />

                  <div className="relative bg-[#0c1225]/35 border border-white/[0.04] rounded-2xl p-6 text-center backdrop-blur-xl group-hover:bg-[#0c1225]/45 group-hover:border-white/[0.08] transition-all duration-300">
                    {/* Link Box button inside card */}
                    {stat.link && (
                      <a
                        href={stat.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-3.5 right-3.5 w-6.5 h-6.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-cyan-500/30 flex items-center justify-center text-gray-500 hover:text-cyan-400 hover:scale-105 transition-all duration-300 z-20 cursor-pointer"
                        title={`Open ${stat.label} Link`}
                      >
                        <ArrowUpRight size={12} />
                      </a>
                    )}

                    <IconComponent
                      size={22}
                      className="mx-auto mb-3 opacity-55 group-hover:opacity-90 transition-opacity duration-300"
                      style={{ color: stat.color }}
                    />
                    <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{stat.value}</p>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1.5 group-hover:text-gray-400 transition-colors">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Keyframe for heading gradient */}
      <style>{`
        @keyframes creatorGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  )
}

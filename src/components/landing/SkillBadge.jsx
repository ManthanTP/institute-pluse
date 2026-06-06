const SKILL_ICONS = {
  'React': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="12" cy="12" r="2.5" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </svg>
  ),
  'Next.js': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 14.5V7.5l8 9h-2.5l-5.5-6.2v6.2h-2z" fillRule="evenodd" />
    </svg>
  ),
  'Supabase': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M13.7 21.8c-.4.5-1.3.2-1.3-.5V14h8.3c.7 0 1.1.8.6 1.4l-7.6 6.4zM10.3 2.2c.4-.5 1.3-.2 1.3.5V10H3.3c-.7 0-1.1-.8-.6-1.4l7.6-6.4z" />
    </svg>
  ),
  'Tailwind CSS': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 6C9.33 6 7.67 7.33 7 10c1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35C13.33 10.79 14.44 12 17 12c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C15.67 7.21 14.56 6 12 6zM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35.93.94 2.04 2.15 4.6 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C10.67 13.21 9.56 12 7 12z" />
    </svg>
  ),
  'TypeScript': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M3 3h18v18H3V3zm9.7 13.7V19h-1.6v-2.3H8.8V15h2.3v-4.2h-3V9.2h7.8v1.6h-3V15h2.3v1.7h-2.5z" />
    </svg>
  ),
  'AI Systems': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1.27c.34-.6.99-1 1.73-1a2 2 0 110 4c-.74 0-1.39-.4-1.73-1H20a7 7 0 01-7 7v1.27c.6.34 1 .99 1 1.73a2 2 0 11-4 0c0-.74.4-1.39 1-1.73V18a7 7 0 01-7-7H2.73c-.34.6-.99 1-1.73 1a2 2 0 110-4c.74 0 1.39.4 1.73 1H4a7 7 0 017-7V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="14" r="3" />
    </svg>
  ),
  'UI/UX': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="3.5" />
    </svg>
  ),
  'Vite': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M21.9 4.1L12.6 21.5c-.2.3-.6.3-.8 0L2.1 4.1c-.2-.4.1-.8.5-.7l9.3 2.1c.1 0 .1 0 .2 0l9.3-2.1c.4-.1.7.3.5.7zM15.7 2l-3.3 6.3c0 .1-.2.2-.3.1L5.6 6.9c-.2 0-.3.2-.2.3l6.3 12.6c.1.2.4.2.4 0L19 2.4c.1-.2-.1-.4-.3-.4h-2.7c-.1 0-.2.1-.3.1z" />
    </svg>
  ),
}

export default function SkillBadge({ name }) {
  const icon = SKILL_ICONS[name]

  return (
    <div className="group relative">
      {/* Glow ring on hover */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-cyan-500/30 group-hover:via-purple-500/30 group-hover:to-cyan-500/30 transition-all duration-500 blur-sm pointer-events-none" />

      <div className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#0c1225]/35 border border-white/[0.04] backdrop-blur-xl group-hover:bg-[#0c1225]/50 group-hover:border-cyan-500/30 transition-all duration-300 cursor-default">
        {/* Icon */}
        <span className="text-cyan-400/70 group-hover:text-cyan-300 transition-colors duration-300">
          {icon}
        </span>

        {/* Name */}
        <span className="text-[11px] font-bold text-gray-300 group-hover:text-white tracking-wide uppercase transition-colors duration-300 whitespace-nowrap">
          {name}
        </span>
      </div>
    </div>
  )
}

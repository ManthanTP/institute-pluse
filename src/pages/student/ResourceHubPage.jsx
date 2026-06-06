import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Search, FileText, Video, Link2, ExternalLink, Clock, User, FolderOpen, ChevronLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'All', label: 'All', icon: FolderOpen, color: '#10b981' },
  { id: 'PDF', label: 'PDFs', icon: FileText, color: '#ef4444' },
  { id: 'Document', label: 'Documents', icon: BookOpen, color: '#3b82f6' },
  { id: 'Video', label: 'Videos', icon: Video, color: '#ec4899' },
  { id: 'Link', label: 'Links', icon: Link2, color: '#06b6d4' },
]

export default function ResourceHubPage() {
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    fetchResources()
  }, [])

  async function fetchResources() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('digital_resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching resources:', error.message)
        toast.error('Failed to load resources')
        setResources([])
      } else {
        setResources(data || [])
      }
    } catch (err) {
      console.error(err)
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = resources.filter(r => {
    const matchCategory = activeCategory === 'All' || r.file_type === activeCategory
    const matchSearch = !search || 
      r.title?.toLowerCase().includes(search.toLowerCase()) || 
      r.subject_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  const getCategoryColor = (type) => CATEGORIES.find(c => c.id === type)?.color || '#10b981'
  const getCategoryIcon = (type) => CATEGORIES.find(c => c.id === type)?.icon || FileText

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white pb-32 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-emerald-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[60%] rounded-full bg-blue-900/5 blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 pt-8 max-w-7xl mx-auto space-y-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 lg:gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="hidden lg:flex w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl"
            >
              <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </motion.button>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Resource Hub</h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Study materials shared by faculty</p>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources by title, subject..."
              className="w-full bg-[#161b22] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-gray-600 shadow-inner"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => {
              const CatIcon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CatIcon size={12} /> {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* RESOURCES GRID */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Syncing Resource Manifest...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#161b22]/40 border border-white/5 rounded-3xl p-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2">No Materials Found</h3>
            <p className="text-gray-500 text-xs font-medium max-w-sm">
              {search ? 'No study materials match your search criteria.' : 'Check back later for study notes, links, and video resources.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((resource, i) => {
              const CatIcon = getCategoryIcon(resource.file_type)
              const color = getCategoryColor(resource.file_type)
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-[#161b22]/90 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] pointer-events-none opacity-20" style={{ backgroundColor: color }} />
                  
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-white/5 text-gray-400 text-[8px] font-black uppercase tracking-widest">
                        {resource.subject_name}
                      </span>
                      <div className="flex items-center gap-1">
                        <CatIcon size={14} style={{ color }} />
                        <span className="text-[8px] font-black text-gray-400 uppercase">{resource.file_type}</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1.5 line-clamp-2">{resource.title}</h4>
                    {resource.description && (
                      <p className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-2 mb-4">{resource.description}</p>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between text-[8px] font-bold text-gray-600">
                      <div className="flex items-center gap-1.5 uppercase tracking-wider">
                        <User size={10} /> Faculty Node
                      </div>
                      <div className="flex items-center gap-1.5 uppercase tracking-wider">
                        <Clock size={10} /> {resource.created_at ? new Date(resource.created_at).toLocaleDateString() : ''}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {resource.file_url && (
                        <a 
                          href={resource.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink size={12} /> Access Resource
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

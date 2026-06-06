import { useState, useEffect, useRef } from 'react'
import { BookOpen, Upload, Search, FileText, Video, Link2, Trash2, Plus, X, ExternalLink, Clock, User, FolderOpen, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/index'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'All', label: 'All', icon: FolderOpen, color: '#8b5cf6' },
  { id: 'PDF', label: 'PDFs', icon: FileText, color: '#ef4444' },
  { id: 'Document', label: 'Documents', icon: BookOpen, color: '#3b82f6' },
  { id: 'Video', label: 'Videos', icon: Video, color: '#ec4899' },
  { id: 'Link', label: 'Links', icon: Link2, color: '#06b6d4' },
]

export default function FacultyResourceHubPage() {
  const { profile } = useAuthStore()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file_type: 'PDF',
    file_url: '',
    subject_name: '',
  })
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)

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

  async function handleUpload() {
    if (!uploadForm.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!uploadForm.subject_name.trim()) {
      toast.error('Subject is required')
      return
    }
    if (!selectedFile && !uploadForm.file_url.trim()) {
      toast.error('Please upload a file or provide a resource URL')
      return
    }

    try {
      setUploading(true)
      let finalUrl = uploadForm.file_url.trim()

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const filePath = `resources/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('digital-resources')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          toast.error('File upload failed: ' + uploadError.message)
          return
        }

        const { data: urlData } = supabase.storage
          .from('digital-resources')
          .getPublicUrl(filePath)
        finalUrl = urlData.publicUrl
      }

      const { data, error } = await supabase
        .from('digital_resources')
        .insert({
          title: uploadForm.title.trim(),
          description: uploadForm.description.trim(),
          file_type: uploadForm.file_type,
          file_url: finalUrl,
          subject_name: uploadForm.subject_name.trim(),
          teacher_id: profile?.id
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Resource uploaded successfully!')
      setShowUpload(false)
      setUploadForm({ title: '', description: '', file_type: 'PDF', file_url: '', subject_name: '' })
      setSelectedFile(null)
      setResources(prev => [data, ...prev])
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this resource?')) return
    try {
      const { error } = await supabase.from('digital_resources').delete().eq('id', id)
      if (error) throw error
      toast.success('Deleted')
      setResources(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      toast.error(err.message)
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

  const getCategoryColor = (type) => CATEGORIES.find(c => c.id === type)?.color || '#8b5cf6'
  const getCategoryIcon = (type) => CATEGORIES.find(c => c.id === type)?.icon || FileText

  return (
    <FacultyLayout>
      <div className="space-y-6 lg:space-y-8 pb-20 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter">Digital Resource Hub</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Share study materials with students</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="px-6 py-3.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Upload Resource
          </button>
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
              className="w-full bg-[#161b22] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => {
              const CatIcon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-[#161b22] border border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
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
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Loading Resources...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2">No Resources Found</h3>
            <p className="text-gray-500 text-sm font-medium max-w-sm">
              {search ? 'No resources match your search criteria.' : 'Start sharing notes, files, links, or videos with students.'}
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
                  className="group bg-[#161b22] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px]"
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
                      <div className="flex items-center gap-1.5">
                        <User size={10} /> Faculty
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={10} /> {resource.created_at ? new Date(resource.created_at).toLocaleDateString() : ''}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {resource.file_url && (
                        <a 
                          href={resource.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-center text-white hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink size={12} /> Access Link
                        </a>
                      )}
                      {resource.teacher_id === profile?.id && (
                        <button 
                          onClick={() => handleDelete(resource.id)} 
                          className="p-2.5 bg-red-500/5 border border-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUpload(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0c1225]/95 border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Upload size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Upload Resource</h3>
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Share with students</p>
                  </div>
                </div>
                <button onClick={() => setShowUpload(false)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Title *</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    placeholder="e.g. Chapter 5 Notes - Data Structures"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                    <select
                      value={uploadForm.file_type}
                      onChange={(e) => setUploadForm({...uploadForm, file_type: e.target.value})}
                      className="w-full bg-[#161b22] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="PDF" className="bg-slate-900">PDFs</option>
                      <option value="Document" className="bg-slate-900">Documents</option>
                      <option value="Video" className="bg-slate-900">Videos</option>
                      <option value="Link" className="bg-slate-900">Links</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Subject *</label>
                    <input
                      type="text"
                      value={uploadForm.subject_name}
                      onChange={(e) => setUploadForm({...uploadForm, subject_name: e.target.value})}
                      placeholder="e.g. Data Structures"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    placeholder="Brief description of this resource..."
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Resource URL / Link</label>
                  <input
                    type="url"
                    value={uploadForm.file_url}
                    onChange={(e) => setUploadForm({...uploadForm, file_url: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
                    disabled={!!selectedFile}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Or Upload File</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-6 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center gap-2 cursor-pointer hover:border-blue-500/30 hover:bg-blue-500/5 transition-all ${
                      selectedFile ? 'border-blue-500 bg-blue-500/5' : ''
                    }`}
                  >
                    <Upload size={20} className={selectedFile ? 'text-blue-500' : 'text-gray-500'} />
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                      {selectedFile ? selectedFile.name : 'Click to select file'}
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0]
                        setSelectedFile(file)
                        // Auto-fill title from filename
                        if (!uploadForm.title) {
                          setUploadForm(prev => ({
                            ...prev,
                            title: file.name.substring(0, file.name.lastIndexOf('.'))
                          }))
                        }
                      }
                    }}
                  />
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 text-[10px]">
                    <span className="text-gray-400 uppercase font-black truncate">{selectedFile.name}</span>
                    <button 
                      onClick={() => setSelectedFile(null)} 
                      className="text-red-500 font-black hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload size={14} /> Share Resource</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </FacultyLayout>
  )
}

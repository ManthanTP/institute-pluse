import { useState, useEffect } from 'react'
import { Users, Search, Filter, Mail, Phone, GraduationCap, ChevronRight, MoreHorizontal, ShieldCheck, Download, Trash2, Edit3, MessageSquare, History } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FacultyLayout from './FacultyLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { exportTablePDF } from '../../lib/pdfExport'

export default function FacultyParticipantsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDivision, setSelectedDivision] = useState('all')
  const [divisions, setDivisions] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      // 1. Fetch Students (Profiles with role 'student')
      const { data: stu, error } = await supabase
        .from('profiles')
        .select(`
          *,
          academic_divisions(name)
        `)
        .eq('role', 'student')
        .order('full_name')
      
      if (error) throw error
      setStudents(stu)

      // 2. Fetch Divisions for Filter
      const { data: divs } = await supabase.from('academic_divisions').select('*').order('name')
      if (divs) setDivisions(divs)

    } catch (err) {
      console.error('Data Fetch Error:', err)
      toast.error('Failed to load student registry')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDiv = selectedDivision === 'all' || s.division_id === selectedDivision
    return matchesSearch && matchesDiv
  })

  function handleDownload() {
    const headers = ["NAME", "EMAIL", "DIVISION", "DEPARTMENT", "JOINED"]
    const rows = filteredStudents.map(s => [
      s.full_name,
      s.email || 'N/A',
      s.academic_divisions?.name || 'N/A',
      s.department || 'N/A',
      new Date(s.created_at).toLocaleDateString()
    ])

    exportTablePDF(
      headers,
      rows,
      `student_registry_${new Date().toISOString().split('T')[0]}`,
      {
        title: "STUDENT REGISTRY REPORT",
        subtitle: `SYNCHRONIZED DATA • ${filteredStudents.length} PROFILES`,
        stats: [
          { label: "TOTAL SYNCED", value: filteredStudents.length.toString() },
          { label: "ACTIVE HUB", value: "FACULTY" }
        ]
      }
    )
  }

  return (
    <FacultyLayout>
      <div className="space-y-8 lg:space-y-12 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 lg:mb-3">
              <Users size={12} className="text-blue-500" />
              <span className="text-[8px] lg:text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Faculty Management Hub</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Student <span className="text-blue-500">Registry</span></h2>
            <p className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">
              Synchronizing {students.length} student profiles
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-3 lg:gap-4">
             <button onClick={handleDownload} className="p-3 lg:p-4 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl text-gray-500 hover:text-white transition-all shadow-xl">
                <Download size={18} />
             </button>
             <button className="flex-1 md:flex-none px-6 lg:px-8 py-3.5 lg:py-4 bg-blue-600 text-white rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">Add Student</button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center">
            <div className="relative w-full lg:flex-1 group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
               <input 
                 type="text" 
                 placeholder="SEARCH NAME OR EMAIL..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-[#161b22] border border-white/10 rounded-xl lg:rounded-2xl py-4 lg:py-5 pl-14 lg:pl-16 pr-6 text-[9px] lg:text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
               />
            </div>
            <div className="w-full lg:w-auto flex gap-1 p-1.5 bg-[#161b22] border border-white/10 rounded-xl lg:rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
               <button
                 onClick={() => setSelectedDivision('all')}
                 className={`px-5 lg:px-8 py-3 rounded-xl text-[7px] lg:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedDivision === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}
               >
                 All Divisions
               </button>
               {divisions.map((div) => (
                 <button
                   key={div.id}
                   onClick={() => setSelectedDivision(div.id)}
                   className={`px-5 lg:px-8 py-3 rounded-xl text-[7px] lg:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedDivision === div.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}
                 >
                   Div {div.name}
                 </button>
               ))}
            </div>
        </div>

        {/* STUDENT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
           <AnimatePresence mode="popLayout">
              {filteredStudents.map((student, idx) => (
                 <motion.div 
                   key={student.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="bg-[#161b22]/80 border border-white/5 rounded-3xl lg:rounded-[40px] p-6 lg:p-8 backdrop-blur-3xl relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-2xl"
                 >
                    <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-5 group-hover:opacity-10 transition-opacity"><GraduationCap size={60} lg:size={80} /></div>
                    
                    <div className="relative z-10">
                       <div className="flex items-start justify-between mb-6 lg:mb-8">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl lg:text-2xl shadow-xl group-hover:scale-110 transition-transform border border-white/10">
                             {student.full_name[0]}
                          </div>
                          <div className="flex gap-2">
                             <button className="p-2.5 lg:p-3 bg-white/5 rounded-lg lg:rounded-xl text-gray-500 hover:text-blue-500 transition-all hover:bg-white/10 border border-white/5"><Edit3 size={14} /></button>
                             <button className="p-2.5 lg:p-3 bg-white/5 rounded-lg lg:rounded-xl text-gray-500 hover:text-red-500 transition-all hover:bg-white/10 border border-white/5"><Trash2 size={14} /></button>
                          </div>
                       </div>

                       <div className="mb-6 lg:mb-8">
                          <h4 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight mb-1 truncate">{student.full_name}</h4>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                             <span className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest">DIV {student.academic_divisions?.name || 'N/A'}</span>
                          </div>
                       </div>

                       <div className="space-y-3 pt-6 border-t border-white/5">
                          <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-300 transition-colors">
                             <Mail size={12} lg:size={14} />
                             <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-wider truncate">{student.email || 'NO EMAIL SYNC'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-300 transition-colors">
                             <Phone size={12} lg:size={14} />
                             <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-wider">SECURE LINK ENCRYPTED</span>
                          </div>
                       </div>

                       <div className="mt-6 lg:mt-8 flex gap-3">
                          <button className="flex-1 py-3.5 lg:py-4 bg-white/5 border border-white/5 rounded-xl lg:rounded-2xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-500/50 transition-all flex items-center justify-center gap-2 shadow-inner">
                             <MessageSquare size={12} /> Message
                          </button>
                          <button className="flex-1 py-3.5 lg:py-4 bg-white/5 border border-white/5 rounded-xl lg:rounded-2xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 shadow-inner">
                             <History size={12} /> Profile
                          </button>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* EMPTY STATE */}
        {filteredStudents.length === 0 && !loading && (
           <div className="py-32 lg:py-40 flex flex-col items-center gap-6 text-gray-700">
              <Users size={48} lg:size={60} className="opacity-10" />
              <p className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.4em] italic text-center px-6">No student profiles synchronized with this division filter</p>
           </div>
        )}
      </div>

    </FacultyLayout>
  )
}

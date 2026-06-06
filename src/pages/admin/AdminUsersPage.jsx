import { useState, useEffect } from 'react'
import { Search, Download, UserCheck, Shield, Mail, Phone, Calendar, MoreHorizontal, Filter, GraduationCap, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { exportTablePDF } from '../../lib/pdfExport'
import { useAuthStore } from '../../store/index'

const DEPT_FILTER = ['All', 'CSE', 'ECE', 'ME', 'Civil', 'MBA', 'Other']
const ROLE_FILTER = ['All', 'student', 'faculty', 'admin']

export default function AdminUsersPage() {
  const { profile } = useAuthStore()
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('all') // 'all', 'students'
  const [search, setSearch] = useState('')
  const [activeDept, setActiveDept] = useState('All')
  const [activeRole, setActiveRole] = useState('All')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)

  // Direct Messaging States
  const [messageTitle, setMessageTitle] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showMessageBox, setShowMessageBox] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*, academic_semesters(name), academic_divisions(name)').order('created_at', { ascending: false })
    if (data) setUsers(data)
    setLoading(false)
  }

  async function updateRole(userId, newRole) {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      toast.success('Security Clearance Updated')
    }
  }

  const handleExportRegistry = () => {
    const headers = ['Full Name', 'Email', 'Role', 'Department', 'Eco Points', 'Joined Date']
    const rows = filtered.map(u => [
      u.full_name,
      u.email,
      u.role,
      u.department || 'General',
      u.eco_points || 0,
      new Date(u.created_at).toLocaleDateString()
    ])

    exportTablePDF({
      title: 'Pulse Identity Registry',
      subtitle: `System Directory Manifest • ${new Date().toLocaleDateString()}`,
      headers,
      rows,
      filename: `pulse-registry-${new Date().getTime()}`,
      summaryCards: [
        { label: 'Total Identities', value: filtered.length },
        { label: 'Department Filter', value: activeDept },
        { label: 'Clearance Level', value: activeRole }
      ]
    })

    toast.success('Registry Exported Successfully as PDF')
  }

  async function updatePoints(userId, newPoints) {
    try {
      const { error } = await supabase.from('profiles').update({ eco_points: parseInt(newPoints) }).eq('id', userId)
      if (error) throw error
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, eco_points: parseInt(newPoints) } : u))
      setSelectedUser(prev => ({ ...prev, eco_points: parseInt(newPoints) }))
      toast.success('Ecosystem Credits Recalibrated')
    } catch (err) {
      console.error('Points calibration failed:', err)
      toast.error('Failed to calibrate points: ' + err.message)
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!messageTitle.trim() || !messageBody.trim()) {
      toast.error('Title and message are required')
      return
    }

    try {
      setSendingMessage(true)
      let error = null
      if (selectedUser.role === 'student') {
        const { error: err } = await supabase
          .from('student_notifications')
          .insert({
            student_id: selectedUser.id,
            sender_id: profile.id,
            title: messageTitle.trim(),
            message: messageBody.trim(),
            type: 'general',
            is_read: false
          })
        error = err
      } else {
        const { error: err } = await supabase
          .from('notifications')
          .insert({
            user_id: selectedUser.id,
            title: messageTitle.trim(),
            message: messageBody.trim(),
            type: 'general',
            is_read: false
          })
        error = err
      }

      if (error) throw error

      toast.success(`Message sent to ${selectedUser.full_name}`)
      setShowMessageBox(false)
      setMessageTitle('')
      setMessageBody('')
    } catch (err) {
      toast.error('Failed to send message: ' + err.message)
    } finally {
      setSendingMessage(false)
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchDept = activeDept === 'All' || u.department === activeDept
    const matchRole = activeRole === 'All' || u.role === activeRole
    return matchSearch && matchDept && matchRole
  })

  const groupedStudents = users
    .filter(u => u.role === 'student' && u.academic_semesters && u.academic_divisions)
    .reduce((acc, student) => {
      const semName = student.academic_semesters.name;
      const divName = student.academic_divisions.name;
      if (!acc[semName]) acc[semName] = {};
      if (!acc[semName][divName]) acc[semName][divName] = [];
      acc[semName][divName].push(student);
      return acc;
    }, {});

  function handleOpenUserDetail(u) {
    setSelectedUser(u)
    setShowMessageBox(false)
    setMessageTitle('')
    setMessageBody('')
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Directory Management Module</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Pulse Registry</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
              {filtered.length} Active Identity Nodes Tracked
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-[#161b22] border border-white/10 rounded-2xl p-1 mr-4">
               <button onClick={() => setActiveTab('all')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>All Users</button>
               <button onClick={() => setActiveTab('students')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'students' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>Student Registry</button>
            </div>
            <button 
              onClick={handleExportRegistry}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
            >
              Export Registry
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative group md:col-span-1">
            <div className="absolute inset-0 bg-red-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-4 backdrop-blur-xl">
              <Search size={18} className="text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="flex-1 bg-transparent border-none outline-none text-white text-[11px] font-black uppercase tracking-widest ml-4 placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={activeDept}
              onChange={e => setActiveDept(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 text-[10px] font-black text-gray-300 uppercase tracking-widest outline-none focus:border-red-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
            >
              {DEPT_FILTER.map(d => <option key={d} value={d} className="bg-slate-900 text-white">{d} Dept</option>)}
            </select>
            <select
              value={activeRole}
              onChange={e => setActiveRole(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 text-[10px] font-black text-gray-300 uppercase tracking-widest outline-none focus:border-red-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
            >
              {ROLE_FILTER.map(r => <option key={r} value={r} className="bg-slate-900 text-white">{r} Role</option>)}
            </select>
          </div>
        </div>

        {/* USERS LIST / TABLE */}
        {activeTab === 'all' ? (
        <div className="space-y-4">
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Accessing Registry...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl">
                <p className="text-xs font-black text-gray-600 uppercase tracking-widest">No Node Match</p>
              </div>
            ) : filtered.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleOpenUserDetail(u)}
                className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl animate-fade-in cursor-pointer hover:border-red-500/30 transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-transparent border border-white/10 flex items-center justify-center text-sm font-black text-white">
                    {u.full_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white uppercase tracking-tight truncate">{u.full_name}</p>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest truncate">{u.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-white/5">
                  <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Security</p>
                    <span className="text-[10px] font-black text-red-500 uppercase">{u.role}</span>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Ecosystem XP</p>
                    <span className="text-[10px] font-black text-white uppercase">{(u.eco_points || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{u.department || 'General'}</span>
                   <button className="text-[9px] font-black text-red-500 uppercase tracking-widest">View Manifest →</button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    {['Node Identity', 'Department', 'Security Clearance', 'Activity Metrics', 'Joined', ''].map(h => (
                       <th key={h} className="px-8 py-5 text-[9px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="py-20 text-center"><div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto" /></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-20 text-center text-xs font-black text-gray-600 uppercase tracking-widest">No Identities Match Filter</td></tr>
                  ) : filtered.map((u, i) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500/20 to-transparent border border-white/10 flex items-center justify-center text-xs font-black text-white shadow-inner group-hover:scale-110 transition-transform">
                            {u.full_name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-white uppercase tracking-tight mb-1">{u.full_name}</p>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest truncate max-w-[150px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{u.department || 'General'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <select
                          value={u.role}
                          onChange={e => updateRole(u.id, e.target.value)}
                          className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-[9px] font-black text-red-500 uppercase tracking-widest outline-none focus:border-red-500 transition-all cursor-pointer"
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-xs font-black text-white leading-none mb-1">{(u.eco_points || 0).toLocaleString()}</p>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Pts</p>
                          </div>
                          <div>
                            <p className="text-xs font-black text-orange-500 leading-none mb-1">🔥 {u.logging_streak || 0}d</p>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Streak</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => handleOpenUserDetail(u)}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedStudents).length === 0 ? (
               <div className="py-20 text-center bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl">
                 <p className="text-xs font-black text-gray-600 uppercase tracking-widest">No Student Registry Data Found</p>
               </div>
            ) : Object.keys(groupedStudents).sort().map(semName => (
               <div key={semName} className="space-y-4">
                 <h3 className="text-xl font-black text-white uppercase italic border-b border-white/10 pb-4">Semester {semName}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.keys(groupedStudents[semName]).sort().map(divName => (
                       <div key={divName} className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl">
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                             <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center font-black text-xs">{divName}</span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Division {divName}</span>
                             </div>
                             <div className="text-[10px] font-black text-white bg-white/10 px-3 py-1 rounded-lg">
                                {groupedStudents[semName][divName].length} Nodes
                             </div>
                          </div>
                          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                             {groupedStudents[semName][divName].map(student => (
                               <div key={student.id} onClick={() => handleOpenUserDetail(student)} className="flex items-center gap-3 p-3 bg-black/20 rounded-2xl hover:bg-black/40 transition-colors cursor-pointer group">
                                 <div className="w-8 h-8 rounded-xl bg-red-500/20 text-white font-black text-xs flex items-center justify-center group-hover:scale-110 transition-transform">{student.full_name?.[0] || 'S'}</div>
                                 <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">{student.full_name}</p>
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{student.usn || student.email}</p>
                                 </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    ))}
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>

      {/* USER DETAIL MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60]"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-x-6 top-[10%] bottom-[10%] max-w-2xl mx-auto bg-slate-900 border border-white/10 rounded-[48px] z-[70] p-12 overflow-y-auto no-scrollbar shadow-2xl"
            >
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-24 h-24 rounded-[40px] bg-gradient-to-br from-red-500 to-red-700 p-1 mb-6">
                  <div className="w-full h-full rounded-[38px] bg-slate-900 flex items-center justify-center text-4xl font-black text-white">
                    {selectedUser.full_name?.[0] || 'U'}
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{selectedUser.full_name}</h3>
                <div className="flex gap-3">
                  <span className="px-4 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-500 uppercase tracking-widest">{selectedUser.role}</span>
                  <span className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedUser.department}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {[
                  { label: 'E-Mail Identity', value: selectedUser.email, icon: Mail },
                  { label: 'Contact Node', value: selectedUser.phone || 'N/A', icon: Phone },
                  { label: 'Enrollment Date', value: new Date(selectedUser.created_at).toLocaleDateString(), icon: Calendar },
                  { label: 'Status', value: 'Active Node', icon: UserCheck },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-start gap-4">
                    <s.icon size={18} className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-sm font-black text-white truncate max-w-[150px]">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 mb-10">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4">Point Calibration Node</p>
                <div className="flex items-center gap-4">
                  <input 
                    type="number"
                    defaultValue={selectedUser.eco_points || 0}
                    onBlur={(e) => updatePoints(selectedUser.id, e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-2xl p-4 text-white font-black text-xl outline-none focus:border-red-500/50"
                  />
                  <div className="px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest">
                    Eco Points
                  </div>
                </div>
              </div>

              {showMessageBox ? (
                <form onSubmit={handleSendMessage} className="bg-white/5 border border-white/10 rounded-[32px] p-8 mb-10 space-y-4">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-2">Send Direct Message</p>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Subject / Title</label>
                    <input 
                      type="text"
                      required
                      value={messageTitle}
                      onChange={e => setMessageTitle(e.target.value)}
                      placeholder="Enter message subject..."
                      className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-red-500/50 uppercase font-black"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Message Body</label>
                    <textarea 
                      required
                      rows={3}
                      value={messageBody}
                      onChange={e => setMessageBody(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-red-500/50 resize-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowMessageBox(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-[9px] font-black uppercase tracking-widest">Cancel</button>
                    <button type="submit" disabled={sendingMessage} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">{sendingMessage ? 'Sending...' : 'Send Message'}</button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => setShowMessageBox(true)} 
                  className="w-full py-5 rounded-[28px] bg-red-600 hover:bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 mb-10"
                >
                  Send Direct Message
                </button>
              )}

              <div className="space-y-4">
                <button className="w-full py-5 rounded-[28px] bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-600/20">
                  Audit Identity Logs
                </button>
                <button onClick={() => setSelectedUser(null)} className="w-full py-4 rounded-2xl bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                  Close Manifest
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

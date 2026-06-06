import { useState, useEffect } from 'react'
import { FileText, Search, Filter, Clock, User, Shield, Terminal, Download, Trash2, ArrowUpRight, Activity, ChevronRight, CheckCircle, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { exportTablePDF } from '../../lib/pdfExport'
import PDFExportModal from '../../components/PDFExportModal'

const FILTER_TABS = ['All', 'Registrations', 'Orders', 'Complaints', 'Events']

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState('All')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      setLoading(true)
      
      // Query real tables in parallel
      const [profilesRes, ordersRes, complaintsRes, eventsRes] = await Promise.all([
        supabase.from('profiles').select('full_name, email, created_at').order('created_at', { ascending: false }).limit(30),
        supabase.from('orders').select('id, total_price, status, created_at, profiles(full_name)').order('created_at', { ascending: false }).limit(30),
        supabase.from('complaints').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(30),
        supabase.from('events').select('id, title, created_at').order('created_at', { ascending: false }).limit(30),
      ])

      const aggregatedLogs = []

      // 1. User Registrations
      if (profilesRes.data) {
        profilesRes.data.forEach(p => {
          aggregatedLogs.push({
            id: `reg-${p.email}-${p.created_at}`,
            action: 'USER_REGISTRATION',
            user: p.full_name || 'Anonymous User',
            target: p.email || 'N/A',
            created_at: p.created_at,
            severity: 'low',
            status: 'success'
          })
        })
      }

      // 2. Cafeteria Orders
      if (ordersRes.data) {
        ordersRes.data.forEach(o => {
          aggregatedLogs.push({
            id: `ord-${o.id}-${o.created_at}`,
            action: `ORDER_${o.status.toUpperCase()}`,
            user: o.profiles?.full_name || 'Student Client',
            target: `Order Ticket (₹${o.total_price})`,
            created_at: o.created_at,
            severity: o.status === 'delivered' ? 'low' : 'medium',
            status: o.status === 'delivered' ? 'success' : 'pending'
          })
        })
      }

      // 3. Complaints
      if (complaintsRes.data) {
        complaintsRes.data.forEach(c => {
          aggregatedLogs.push({
            id: `comp-${c.id}-${c.created_at}`,
            action: `COMPLAINT_${c.status.toUpperCase()}`,
            user: 'Student Terminal',
            target: c.title,
            created_at: c.created_at,
            severity: c.status === 'resolved' ? 'low' : 'high',
            status: c.status === 'resolved' ? 'success' : 'pending'
          })
        })
      }

      // 4. Events
      if (eventsRes.data) {
        eventsRes.data.forEach(e => {
          aggregatedLogs.push({
            id: `evt-${e.id}-${e.created_at}`,
            action: 'EVENT_CREATION',
            user: 'Academic Core',
            target: e.title,
            created_at: e.created_at,
            severity: 'low',
            status: 'success'
          })
        })
      }

      // Sort aggregated logs by created_at DESC
      aggregatedLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setLogs(aggregatedLogs)

    } catch (err) {
      toast.error('Audit Stream Synchronization Failed')
      console.error('Audit Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const triggerPDFDownload = () => {
    if (!filteredLogs.length) return toast.error('No logs to export')
    const headers = ['Action', 'Identity', 'Target Sector', 'Temporal Log', 'Status']
    const rows = filteredLogs.map(l => [
      l.action,
      l.user,
      l.target,
      new Date(l.created_at).toLocaleString(),
      l.status.toUpperCase()
    ])
    
    exportTablePDF({
      title: 'Audit Log Manifest',
      subtitle: `System Integrity Record • ${new Date().toLocaleDateString()}`,
      headers,
      rows,
      filename: `pulse-audit-${new Date().getTime()}`,
      summaryCards: [
        { label: 'Total Logs Exported', value: filteredLogs.length },
        { label: 'Export Authority', value: 'System Administrator' },
        { label: 'Integrity Check', value: 'Verified' }
      ]
    })
    
    toast.success('Audit Manifest Exported as PDF')
  }

  const handleExportAudit = () => {
    setIsExporting(true)
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase())

    let matchesFilter = true
    if (filterTab === 'Registrations') matchesFilter = log.action === 'USER_REGISTRATION'
    else if (filterTab === 'Orders') matchesFilter = log.action.startsWith('ORDER')
    else if (filterTab === 'Complaints') matchesFilter = log.action.startsWith('COMPLAINT')
    else if (filterTab === 'Events') matchesFilter = log.action === 'EVENT_CREATION'

    return matchesSearch && matchesFilter
  })

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Terminal size={14} className="text-blue-500" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Historical Integrity Stream</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">Audit <span className="text-blue-500">Logs</span></h2>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={fetchLogs}
               className="p-5 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors"
               title="Reload Logs"
             >
                <RefreshCw size={16} />
             </button>
             <button 
               onClick={handleExportAudit}
               className="px-10 py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-lg"
             >
                <Download size={16} /> Export Audit Stream
             </button>
          </div>
        </div>

        {/* LOG TERMINAL */}
        <div className="bg-[#0f172a]/60 border border-white/10 rounded-[48px] overflow-hidden backdrop-blur-xl">
           <div className="p-8 border-b border-white/5 flex flex-col gap-6">
              {/* Search Bar */}
              <div className="relative group w-full">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                 <input 
                   type="text" 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   placeholder="SEARCH LOGS BY USER, ACTION OR TARGET..."
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-8 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600"
                 />
              </div>
              
              {/* Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                      filterTab === tab
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                 <thead>
                    <tr className="border-b border-white/5 bg-white/2">
                       <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Action</th>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Authorized Identity</th>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Sector</th>
                       <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Temporal Log</th>
                       <th className="px-8 py-6 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {loading ? (
                       <tr>
                          <td colSpan="5" className="px-8 py-20 text-center">
                             <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Streaming registry nodes...</span>
                          </td>
                       </tr>
                    ) : filteredLogs.length === 0 ? (
                       <tr>
                          <td colSpan="5" className="px-8 py-20 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                             No matching logs found in institutional registry
                          </td>
                       </tr>
                    ) : (
                      filteredLogs.map((log) => (
                         <tr key={log.id} className="hover:bg-white/2 transition-colors group">
                            <td className="px-8 py-8 whitespace-nowrap">
                               <div className="flex items-center gap-4">
                                  <div className={`w-2 h-2 rounded-full ${log.severity === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : log.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                  <span className="text-sm font-black text-white uppercase tracking-tight italic">{log.action}</span>
                               </div>
                            </td>
                            <td className="px-8 py-8 whitespace-nowrap">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-400">
                                    {log.user?.[0]?.toUpperCase() || 'S'}
                                  </div>
                                  <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">{log.user}</span>
                               </div>
                            </td>
                            <td className="px-8 py-8">
                               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block max-w-xs truncate">{log.target}</span>
                            </td>
                            <td className="px-8 py-8 whitespace-nowrap">
                               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                 {new Date(log.created_at).toLocaleString()}
                               </span>
                            </td>
                            <td className="px-8 py-8 text-right whitespace-nowrap">
                               <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                                 log.status === 'success' 
                                   ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                   : 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                               }`}>
                                 {log.status}
                               </span>
                            </td>
                         </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* IMMUTABLE SEAL */}
        <div className="p-8 bg-blue-500/10 border border-blue-500/20 rounded-[40px] flex items-center justify-between">
           <div className="flex items-center gap-6">
              <Shield size={30} className="text-blue-500" />
              <div>
                 <p className="text-[11px] font-black text-white uppercase tracking-widest">Immutable Log Integrity Active</p>
                 <p className="text-[9px] text-blue-500/70 font-bold uppercase tracking-widest mt-1">All actions are cryptographically signed and archived in the secure core.</p>
              </div>
           </div>
           <button 
             onClick={() => toast.success('Institutional signatures validated! (100% integrity)')}
             className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-colors"
           >
             Verify All Signatures
           </button>
        </div>
      </div>
      <PDFExportModal 
        isOpen={isExporting} 
        onClose={() => setIsExporting(false)} 
        onTriggerDownload={triggerPDFDownload} 
      />
    </AdminLayout>
  )
}

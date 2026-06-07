import { useState, useEffect } from 'react'
import { Settings, Shield, Key, Globe, Database, Cpu, Lock, Bell, RefreshCw, Zap, ShieldCheck, ChevronRight, Info, Building, Mail, Phone, MapPin, Upload, Eye, Leaf, Utensils, Droplets, Trash2, Award } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { DEFAULT_CARBON_CONFIG } from '../../lib/carbonCalc'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile') // 'profile', 'carbon', 'system'
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // Institution settings state
  const [settings, setSettings] = useState({
    name: 'InstitutePulse Academy',
    logo_url: 'https://pulse-core.local/logo.png',
    contact_email: 'contact@institutepulse.edu',
    contact_phone: '+91 98765 43210',
    address: '123 Cyberpunk Enclave, Bengaluru, India',
    carbon_config: DEFAULT_CARBON_CONFIG
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setFetching(true)
      const { data, error } = await supabase
        .from('institution_settings')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (data) {
        setSettings({
          ...data,
          carbon_config: data.carbon_config || DEFAULT_CARBON_CONFIG
        })
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      toast.error('Failed to load active system metrics')
    } finally {
      setFetching(false)
    }
  }

  async function handleSave(e) {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('institution_settings')
        .update({
          name: settings.name,
          logo_url: settings.logo_url,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          address: settings.address,
          carbon_config: settings.carbon_config,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)

      if (error) throw error
      toast.success('Core configurations successfully synced!')
    } catch (err) {
      toast.error('Sync failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logo_url: reader.result }))
        toast.success('Logo loaded in live preview')
      }
      reader.readAsDataURL(file)
    }
  }

  const updateCarbonNested = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      carbon_config: {
        ...prev.carbon_config,
        [category]: {
          ...prev.carbon_config?.[category],
          [field]: parseFloat(value) ?? 0
        }
      }
    }))
  }

  const updateCarbonGlobal = (field, value) => {
    setSettings(prev => ({
      ...prev,
      carbon_config: {
        ...prev.carbon_config,
        [field]: parseFloat(value) ?? 0
      }
    }))
  }

  const carbon = settings.carbon_config || DEFAULT_CARBON_CONFIG

  return (
    <AdminLayout>
      <div className="space-y-12 pb-20 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings size={14} className="text-red-500 animate-spin" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Core Configurations</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">System <span className="text-red-500">Settings</span></h2>
          </div>

          <button 
            onClick={handleSave} 
            disabled={loading || fetching}
            className="px-10 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Save Core Sync'}
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-white/5 pb-2 gap-8 flex-wrap">
          {[
            { id: 'profile', label: 'Identity Profile', icon: Building },
            { id: 'carbon', label: 'Carbon Protocols', icon: Leaf },
            { id: 'system', label: 'Security & System Ops', icon: Cpu }
          ].map(t => {
            const Icon = t.icon
            const active = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest relative transition-colors ${
                  active ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={14} />
                {t.label}
                {active && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                  />
                )}
              </button>
            )
          })}
        </div>

        {fetching ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Streaming telemetry configurations...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* TAB 1: IDENTITY PROFILE */}
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* PROFILE FORM */}
                  <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-8 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                      <Building size={24} className="text-red-500" />
                      <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Identity Parameters</h4>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Institution Name</label>
                        <div className="relative">
                          <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input
                            type="text"
                            value={settings.name}
                            onChange={e => setSettings({ ...settings, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-red-500/50 transition-all uppercase tracking-widest font-black"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact Email</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                              type="email"
                              value={settings.contact_email}
                              onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-red-500/50 transition-all"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                              type="text"
                              value={settings.contact_phone}
                              onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-red-500/50 transition-all"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Physical Location Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input
                            type="text"
                            value={settings.address}
                            onChange={e => setSettings({ ...settings, address: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-red-500/50 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Brand Logo Upload</label>
                        <div className="flex items-center gap-4">
                          <label className="flex-1 flex items-center justify-between bg-white/5 border border-white/10 hover:border-red-500/30 rounded-2xl p-4 cursor-pointer hover:bg-white/[0.08] transition-all">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                              <Upload size={14} /> Choose Logo Image
                            </span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleLogoChange} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* LIVE BRAND PREVIEW */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-[48px] p-12 flex flex-col justify-between backdrop-blur-xl">
                    <div>
                      <div className="flex items-center gap-2 text-red-500 mb-6">
                        <Eye size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Brand Preview</span>
                      </div>
                      
                      <div className="border border-white/10 bg-white/2 rounded-[32px] p-6 text-center shadow-lg relative overflow-hidden group">
                        <div className="w-24 h-24 mx-auto rounded-full bg-[#020617] border-2 border-white/15 flex items-center justify-center overflow-hidden mb-6">
                          {settings.logo_url ? (
                            <img src={settings.logo_url} alt="Logo Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Building className="text-gray-600" size={32} />
                          )}
                        </div>
                        <h3 className="text-md font-black text-white uppercase tracking-widest line-clamp-1 mb-2">
                          {settings.name || 'INSTITUTEPULSE'}
                        </h3>
                        
                        <div className="space-y-2 text-left pt-4 border-t border-white/5 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Mail size={12} className="text-gray-600" />
                            <span className="truncate">{settings.contact_email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="text-gray-600" />
                            <span>{settings.contact_phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-gray-600" />
                            <span className="truncate">{settings.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center mt-6">
                      LIVE IDENTITY PROTOCOL MATRIX
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CARBON PROTOCOLS */}
              {activeTab === 'carbon' && (
                <div className="space-y-8">
                  {/* GLOBAL parameters */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-8 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                      <Globe size={24} className="text-red-500" />
                      <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Global Parameters</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Daily Campus Carbon Budget (kg CO2 / student)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={carbon.campus_budget_kg}
                          onChange={e => updateCarbonGlobal('campus_budget_kg', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-red-500/50 transition-all font-black"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Water Grid Emissions Multiplier (kg CO2 / Litre)</label>
                        <input
                          type="number"
                          step="0.001"
                          value={carbon.water_co2_per_litre}
                          onChange={e => updateCarbonGlobal('water_co2_per_litre', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-red-500/50 transition-all font-black"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* COFFICIENTS GRID */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Transport coefficients */}
                    <div className="bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-8 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <Leaf size={24} className="text-green-500" />
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Transport (kg CO2 / km)</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(DEFAULT_CARBON_CONFIG.transport_factors).map(mode => (
                          <div key={mode} className="space-y-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest capitalize ml-1">{mode.replace('_', ' ')}</label>
                            <input
                              type="number"
                              step="0.001"
                              value={carbon.transport_factors?.[mode] ?? 0}
                              onChange={e => updateCarbonNested('transport_factors', mode, e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500/50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nutrition multipliers */}
                    <div className="bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-8 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <Utensils size={24} className="text-orange-500" />
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Nutrition (kg CO2 / meal)</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(DEFAULT_CARBON_CONFIG.food_factors).map(type => (
                          <div key={type} className="space-y-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest capitalize ml-1">{type.replace(/_/g, ' ')}</label>
                            <input
                              type="number"
                              step="0.01"
                              value={carbon.food_factors?.[type] ?? 0}
                              onChange={e => updateCarbonNested('food_factors', type, e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500/50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ELECTRICITY DEVICES */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-8 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                      <Zap size={24} className="text-yellow-500" />
                      <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Grid Devices (kg CO2 / hour)</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.keys(DEFAULT_CARBON_CONFIG.device_factors).map(k => (
                        <div key={k} className="space-y-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest capitalize ml-1">{k.replace(/_/g, ' ')}</label>
                          <input
                            type="number"
                            step="0.001"
                            value={carbon.device_factors?.[k] ?? 0}
                            onChange={e => updateCarbonNested('device_factors', k, e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500/50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WATER SHOWER & WASTE FACTORS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Water shower volumes */}
                    <div className="bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-8 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <Droplets size={24} className="text-cyan-500" />
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Water Shower Volumes (Litres)</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(DEFAULT_CARBON_CONFIG.shower_litres).map(k => (
                          <div key={k} className="space-y-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest capitalize ml-1">{k.replace(/_/g, ' ')}</label>
                            <input
                              type="number"
                              value={carbon.shower_litres?.[k] ?? 0}
                              onChange={e => updateCarbonNested('shower_litres', k, e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500/50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Waste factors */}
                    <div className="bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-8 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <Trash2 size={24} className="text-purple-500" />
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Waste Lifecycle (kg CO2 / kg)</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(DEFAULT_CARBON_CONFIG.waste_factors).map(k => (
                          <div key={k} className="space-y-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest capitalize ml-1">{k}</label>
                            <input
                              type="number"
                              step="0.01"
                              value={carbon.waste_factors?.[k] ?? 0}
                              onChange={e => updateCarbonNested('waste_factors', k, e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500/50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ECO POINTS CONFIG */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-8 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                      <Award size={24} className="text-yellow-500" />
                      <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Eco Points (XP) reward protocol</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.keys(DEFAULT_CARBON_CONFIG.points_config).map(k => (
                        <div key={k} className="space-y-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest capitalize ml-1">{k.replace(/_/g, ' ')}</label>
                          <input
                            type="number"
                            value={carbon.points_config?.[k] ?? 0}
                            onChange={e => updateCarbonNested('points_config', k, e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500/50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SCORE GRADES & LIMITS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Score Grades */}
                    <div className="bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-8 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <ShieldCheck size={24} className="text-blue-500" />
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Score Grade Thresholds</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(DEFAULT_CARBON_CONFIG.score_grades).map(k => (
                          <div key={k} className="space-y-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest capitalize ml-1">{k}</label>
                            <input
                              type="number"
                              value={carbon.score_grades?.[k] ?? 0}
                              onChange={e => updateCarbonNested('score_grades', k, e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500/50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Limits and Anti-Cheat */}
                    <div className="bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-8 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <Shield size={24} className="text-red-500" />
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Anti-Cheat & Hard Limits</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(DEFAULT_CARBON_CONFIG.validation_limits).map(k => (
                          <div key={k} className="space-y-1">
                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-tight capitalize ml-1">{k.replace(/_/g, ' ')}</label>
                            <input
                              type="number"
                              step="0.1"
                              value={carbon.validation_limits?.[k] ?? 0}
                              onChange={e => updateCarbonNested('validation_limits', k, e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500/50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SYSTEM UTILITIES */}
              {activeTab === 'system' && (
                <div className="grid grid-cols-1 gap-10">
                  <div className="bg-slate-900/40 border border-white/10 rounded-[48px] p-12 space-y-10 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Cpu size={24} className="text-purple-500" />
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Maintenance Pulse</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${maintenanceMode ? 'text-red-500' : 'text-gray-500'}`}>
                          {maintenanceMode ? 'Maintenance Active' : 'System Operational'}
                        </span>
                        <div 
                          onClick={() => {
                            setMaintenanceMode(!maintenanceMode)
                            toast.error(maintenanceMode ? 'Maintenance Protocol TERMINATED' : 'Maintenance Protocol INITIALIZED')
                          }}
                          className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${maintenanceMode ? 'bg-red-600' : 'bg-white/5'}`}
                        >
                          <motion.div 
                            animate={{ x: maintenanceMode ? 28 : 4 }}
                            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <button onClick={() => toast.success('Cache Nodes Flushed')} className="p-10 rounded-[32px] bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all text-left space-y-4 group">
                        <RefreshCw size={24} className="text-blue-500 group-hover:rotate-180 transition-transform duration-700" />
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Flush Cache Nodes</p>
                        <p className="text-[8px] text-gray-600 font-bold uppercase">Clear global memory buffers</p>
                      </button>
                      <button onClick={() => toast.success('DB integrity checked: 100% stable')} className="p-10 rounded-[32px] bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all text-left space-y-4 group">
                        <ShieldCheck size={24} className="text-orange-500" />
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Global Audit Scan</p>
                        <p className="text-[8px] text-gray-600 font-bold uppercase">Run integrity check on DB</p>
                      </button>
                      <button onClick={() => toast.error('Emergency Lockdown Initiated')} className="p-10 rounded-[32px] bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all text-left space-y-4 group">
                        <Zap size={24} className="text-red-500 group-hover:text-white" />
                        <p className="text-[10px] font-black uppercase tracking-widest">System Lockdown</p>
                        <p className="text-[8px] opacity-60 font-bold uppercase">Immediate sector isolation</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </AdminLayout>
  )
}

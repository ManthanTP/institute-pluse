import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { invalidateLandingCache } from '../../hooks/useLandingContent'
import { useAuthStore } from '../../store/index'
import { Save, Eye, EyeOff, Plus, Trash2, ChevronDown, ChevronUp, ExternalLink, RefreshCw, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from './AdminLayout'

const SECTION_LABELS = {
  hero: 'Hero Section',
  features: 'Features Bento Grid',
  impact: 'Impact Section',
  tech_stack: 'Tech Stack & Architecture',
  milestones: 'How It Works',
  faq: 'FAQ Accordion',
  cta: 'Call-to-Action Banner',
  footer: 'Footer & Socials',
  creator: 'Creator Section',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
}

function getDefaultContentForSection(key) {
  const defaults = {
    hero: {
      badge: "Live • The Smart Campus OS",
      heading: "YOUR CAMPUS.",
      headingAccent: "SUSTAINABLE. INTELLIGENT. UNIFIED.",
      description: "Next-Gen Campus Intelligence. Decarbonizing Education, Automating Timetables, and Rewarding Sustainable Actions.",
      ctaPrimary: "Get Started Free",
      ctaSecondary: "Explore Features",
      ctaPrimaryLoggedIn: "Go to Dashboard"
    },
    features: {
      sectionLabel: "Features Bento",
      sectionTitle: "Designed for smart campus ecosystems.",
      cards: [
        { 
          title: "Smart Attendance", 
          description: "Fast QR check-ins synced to your class timetable. Log present states instantly and view automated attendance statistics without paper.",
          bullets: ["Time-restricted QR codes for fraud prevention", "Auto-syncs with your class timetable", "Real-time attendance analytics for faculty", "Location verification for campus validation"]
        },
        { 
          title: "Eco Track", 
          description: "Log daily choices, track saved carbon margins, and earn leaderboard points to climb the campus sustainability scoreboards.",
          bullets: ["Log daily transport, meals & energy usage", "Personal CO₂ footprint dashboard", "Earn leaderboard points for green choices", "Track weekly/monthly sustainability trends"]
        },
        { 
          title: "Study Planner", 
          description: "Organize focus sessions, set customized alarms, partition revision by subject codes, and coordinate with peer logs.",
          bullets: ["Study timer with subject tracking", "Custom study alarms & scheduling", "Subject-wise revision partitioning", "Peer coordination and group study logs"]
        },
        { 
          title: "Floor Maps", 
          description: "Navigate buildings room by room. Filter floor maps instantly to locate faculty offices, lecture rooms, and labs.",
          bullets: ["Interactive multi-floor building navigation", "Filter by labs, classrooms, and offices", "Real-time room availability status", "Fastest route pathfinding between blocks"]
        },
        { 
          title: "Events", 
          description: "Join organized campaigns, participate in campus-wide eco events, earn badges, and build credentials.",
          bullets: ["Join campus-wide eco campaigns", "Earn achievement badges and certificates", "Track campaign progress in real-time", "Department vs department competitions"]
        },
        { 
          title: "Smart Cafeteria", 
          description: "Browse the digital campus menu, pre-order meals, track nutritional info, and view real-time item availability — all from your phone.",
          bullets: ["Browse full digital menu with prices", "Pre-order meals to skip the queue", "Nutritional info & calorie tracking", "Real-time item availability updates"]
        },
        { 
          title: "Carbon Analytics", 
          description: "Visualize dynamic emission charts and reductions by transport, food, energy, and waste categories.",
          bullets: ["Interactive emission breakdown charts", "Transport, food, energy & waste categories", "Monthly trend reports with comparisons", "Campus-wide vs individual analytics"]
        },
        { 
          title: "Leaderboards", 
          description: "Check real-time standings, compare weekly XP totals, and compete for top green badges across departments.",
          bullets: ["Real-time XP-based ranking system", "Weekly and all-time leaderboard views", "Department and class-level competitions", "Green badge tier system with rewards"]
        },
        { 
          title: "Grievance Hub", 
          description: "File complaints, request maintenance, and track resolution statuses with real-time ticketing.",
          bullets: ["Submit complaints with category tagging", "Track resolution status in real-time", "Priority escalation for urgent issues", "Admin response notifications"]
        },
        { 
          title: "Lost & Found", 
          description: "Report lost campus belongings or claim found valuables directly through the automated catalog feed.",
          bullets: ["Report lost items with descriptions", "Browse found items catalog with photos", "Automated matching notifications", "Claim verification system"]
        },
        { 
          title: "Announcements", 
          description: "Receive instant notifications, timetable modifications, and sustainable guidelines from administrators.",
          bullets: ["Instant admin broadcast notifications", "Timetable change alerts", "Category-filtered notice board", "Push notifications for critical updates"]
        }
      ]
    },
    impact: {
      sectionLabel: "Make An Impact",
      sectionTitle: "Every action counts.",
      description: "Log your daily commute, meals, and energy usage. Watch your eco-score grow. Compete with peers on the leaderboard. Together, we build a greener campus.",
      ctaText: "Start Your Journey"
    },
    tech_stack: {
      sectionLabel: "Architecture",
      sectionTitle: "Built for speed, security, and scalability.",
      cards: [
        { title: "Core Frontend Stack", description: "Powered by React and Vite to ensure instant page render speeds, lightweight asset bundles, and fully hardware-accelerated interface transition layers." },
        { title: "Secure Identity Linking", description: "Utilizes AES verification and time-based expiration values inside QR payloads, effectively blocking roll-call fraud and sync tampering." },
        { title: "Real-time Data Sync", description: "Direct Supabase backend connection facilitating instantaneous eco-points logging, realtime leaderboard refreshes, and instant food canteen alerts." }
      ]
    },
    milestones: {
      sectionLabel: "How It Works",
      sectionTitle: "Get started in 3 easy steps.",
      steps: [
        { number: "01", title: "Create Your Account", description: "Sign up with your college email. Your eco-profile, timetable, and campus map sync automatically." },
        { number: "02", title: "Track Your Impact", description: "Log daily commutes, meals, and energy usage. Watch your carbon score drop and eco-points rise." },
        { number: "03", title: "Earn & Compete", description: "Climb the leaderboard, unlock green badges, and participate in campus-wide eco campaigns." }
      ]
    },
    faq: {
      sectionLabel: "FAQ",
      sectionTitle: "Frequently Asked Questions",
      items: [
        { question: "How does QR Smart Attendance work?", answer: "Instructors generate a time-restricted check-in QR code on the lecture hall screen. Students scan the QR code via their Attendance page. The system checks location validity and student identity to log the attendance record instantly." },
        { question: "What are Eco Points and how are they calculated?", answer: "Eco Points are rewarded for green actions like ridesharing, selecting vegetarian canteen meals, and recycling items. Point values are defined in the sustainability guidelines (e.g. +20 pts for canteen veg selection)." },
        { question: "Is my personal study and logging data secure?", answer: "Yes. All authentication and data transfers are protected under Supabase security protocols, and student records are kept private and accessible only to authorized administrators and the student themselves." },
        { question: "Can other colleges adopt the Institute Pulse platform?", answer: "Yes, the core system is modularized and can be configured with semester tables, location maps, bus routes, and cafeteria items for any educational institute." }
      ]
    },
    cta: {
      heading: "Ready to go green?",
      description: "Join thousands of students and faculty making their campus sustainable, one action at a time.",
      buttonText: "Create Free Account",
      buttonTextLoggedIn: "Open Dashboard"
    },
    footer: {
      tagline: "The complete campus ecosystem for modern education. Sustainable, intelligent, and built for everyone.",
      copyright: "© 2026 InstitutePulse. Built for Jain College of Engineering.",
      github: "https://github.com/manthantp",
      linkedin: "https://linkedin.com/in/manthantp",
      contactEmail: "manthantp.work@gmail.com",
      collegeName: "Jain College of Engineering"
    },
    creator: {
      sectionLabel: "The Creator",
      sectionTitle: "About The Creator",
      name: "Manthan Patel",
      description: "Passionate Full Stack Developer focused on AI-powered systems, futuristic UI/UX, and smart campus innovation platforms.",
      portfolioUrl: "https://manthantp-portfolio.vercel.app/",
      githubUrl: "https://github.com/ManthanTP",
      connectUrl: "https://manthantp-portfolio.vercel.app/#contact",
      skills: ["React", "Next.js", "Supabase", "Tailwind CSS", "TypeScript", "AI Systems", "UI/UX", "Vite"],
      stats: [
        { value: "20+", label: "Projects", icon: "Code2", color: "#00f5ff", link: "https://manthantp-portfolio.vercel.app/#projects" },
        { value: "15+", label: "Skills", icon: "Cpu", color: "#8b5cf6", link: "https://manthantp-portfolio.vercel.app/" },
        { value: "10+", label: "Blogs", icon: "BookOpen", color: "#00f5ff", link: "https://manthantp-portfolio.vercel.app/" },
        { value: "12+", label: "Achievement Unlocks", icon: "Trophy", color: "#8b5cf6", link: "https://manthantp-portfolio.vercel.app/" }
      ]
    },
    privacy: {
      sectionTitle: "Privacy Policy",
      items: [
        { title: "1. Data Collection", content: "InstitutePulse securely logs carbon saving records (commute distances, vehicle modes, energy logs, and canteen meal choices) as well as class QR code check-ins." },
        { title: "2. Secure Encryption", content: "All student and administrative data is transmitted via Secure Sockets Layer (SSL) and stored securely in our cloud database system, protected by row-level security (RLS)." },
        { title: "3. Data Ownership", content: "We do not share your campus logs with third-party service providers. All logged records remain property of Jain College of Engineering." }
      ]
    },
    terms: {
      sectionTitle: "Terms of Service",
      items: [
        { title: "1. Usage License", content: "Students and faculty members of Jain College of Engineering are granted permission to access InstitutePulse for academic, sustainability tracking, and coordination activities." },
        { title: "2. Accurate Reporting", content: "Users agree to log genuine, authentic commute methods and attendance sessions. Fraudulent logging of carbon logs or check-in credentials may result in account suspension." },
        { title: "3. Service Access", content: "While we target 99.9% operational uptime, access to dashboard features may occasionally be paused for system enhancements and database maintenance." }
      ]
    }
  }
  return defaults[key] || {}
}

export default function AdminLandingPage() {
  const { profile } = useAuthStore()
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    fetchSections()
  }, [])

  async function fetchSections() {
    setLoading(true)
    const { data, error } = await supabase
      .from('landing_sections')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      toast.error('Failed to load sections')
      console.error(error)
    } else {
      const fetched = data || []
      const updatedSections = []
      
      Object.keys(SECTION_LABELS).forEach((key, index) => {
        const existing = fetched.find(s => s.section_key === key)
        const defaults = getDefaultContentForSection(key)
        
        if (!existing) {
          updatedSections.push({
            section_key: key,
            content: defaults,
            is_visible: true,
            sort_order: index,
          })
        } else {
          // Merge defaults to ensure new fields are present
          const mergedContent = { ...defaults, ...existing.content }
          
          // Specially handle features cards length expansion and bullets mapping
          if (key === 'features' && Array.isArray(mergedContent.cards) && Array.isArray(defaults.cards)) {
            if (mergedContent.cards.length < defaults.cards.length) {
              const cardsCopy = [...mergedContent.cards]
              for (let i = cardsCopy.length; i < defaults.cards.length; i++) {
                cardsCopy.push(defaults.cards[i])
              }
              mergedContent.cards = cardsCopy
            }
            // Populate default bullets if not present in the saved card
            mergedContent.cards = mergedContent.cards.map((card, idx) => ({
              ...defaults.cards[idx],
              ...card,
              bullets: card.bullets || defaults.cards[idx]?.bullets || []
            }))
          }

          // Specially handle hero slogan updates
          if (key === 'hero') {
            const isOldSlogan = mergedContent.headingAccent === 'SMARTER.' || mergedContent.description?.includes('The unified digital platform')
            if (isOldSlogan) {
              mergedContent.headingAccent = defaults.headingAccent
              mergedContent.description = defaults.description
              mergedContent.badge = defaults.badge
            }
          }

          // Specially handle creator stats updates
          if (key === 'creator' && Array.isArray(mergedContent.stats) && Array.isArray(defaults.stats)) {
            // Check if it has old stat labels and replace if matching
            const hasOldStats = mergedContent.stats.some(s => s.label === 'React & Next.js' || s.label === 'Supabase Cloud' || s.label === 'Full Stack' || s.label === 'Backend / RLS' || s.label === 'Agentic AI' || s.label === 'AI Architectures' || s.label === 'Eco-Software' || s.label === 'Powered Systems' || s.label === 'Campus Solutions')
            if (hasOldStats || mergedContent.stats.length < defaults.stats.length) {
              mergedContent.stats = defaults.stats
            }
          }

          updatedSections.push({
            ...existing,
            content: mergedContent,
            sort_order: index
          })
        }
      })

      updatedSections.sort((a, b) => a.sort_order - b.sort_order)
      setSections(updatedSections)
    }
    setLoading(false)
  }

  function getSectionData(key) {
    return sections.find(s => s.section_key === key)
  }

  function updateSectionContent(key, updater) {
    setSections(prev =>
      prev.map(s =>
        s.section_key === key
          ? { ...s, content: typeof updater === 'function' ? updater(s.content) : { ...s.content, ...updater } }
          : s
      )
    )
  }

  function toggleVisibility(key) {
    setSections(prev =>
      prev.map(s =>
        s.section_key === key ? { ...s, is_visible: !s.is_visible } : s
      )
    )
  }

  async function saveSingleSection(section) {
    const payload = {
      section_key: section.section_key,
      content: section.content,
      is_visible: section.is_visible,
      sort_order: section.sort_order,
      updated_at: new Date().toISOString(),
    }

    let result
    if (section.id) {
      // Existing row — UPDATE by id
      result = await supabase
        .from('landing_sections')
        .update(payload)
        .eq('id', section.id)
        .select()
    } else {
      // New row — INSERT
      result = await supabase
        .from('landing_sections')
        .insert(payload)
        .select()
    }

    if (result.error) {
      return { error: result.error }
    }

    if (!result.data || result.data.length === 0) {
      return { error: { message: "Database update rejected. This usually indicates insufficient row-level security (RLS) privileges. Verify your user role is 'admin' inside public.profiles." } }
    }

    // After a successful INSERT, store the returned id so future saves use UPDATE
    if (!section.id && result.data && result.data[0]) {
      setSections(prev =>
        prev.map(s =>
          s.section_key === section.section_key
            ? { ...s, id: result.data[0].id }
            : s
        )
      )
    }
    return { error: null }
  }

  async function saveSection(key) {
    const section = getSectionData(key)
    if (!section) return

    setSaving(key)
    const { error } = await saveSingleSection(section)

    if (error) {
      toast.error(`Save failed: ${error.message || error.code || 'Unknown error'}`)
      console.error('Save error:', error)
    } else {
      invalidateLandingCache()
      toast.success(`${SECTION_LABELS[key]} saved!`)
    }
    setSaving(null)
  }

  async function saveAll() {
    setSaving('all')
    for (const section of sections) {
      const { error } = await saveSingleSection(section)
      if (error) {
        toast.error(`Save failed for ${SECTION_LABELS[section.section_key]}: ${error.message || error.code}`)
        console.error('Save error:', error)
        setSaving(null)
        return
      }
    }
    invalidateLandingCache()
    toast.success('All sections saved successfully!')
    setSaving(null)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-32">
          <RefreshCw size={24} className="animate-spin text-red-500" />
        </div>
      </AdminLayout>
    )
  }

  const current = getSectionData(activeSection)

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Landing Page Editor</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-500 text-xs font-medium">Edit all landing page content from here. Changes appear instantly on the homepage.</p>
              {profile && (
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${profile.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                  Role: {profile.role}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <ExternalLink size={12} /> Preview Live
            </a>
            <button
              onClick={saveAll}
              disabled={saving === 'all'}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-all disabled:opacity-50"
            >
              {saving === 'all' ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
              Save All
            </button>
          </div>
        </div>

        {profile && profile.role !== 'admin' && (
          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center space-y-2">
            <p>⚠️ WARNING: Your database profile role is currently "{profile.role}". Under Row Level Security (RLS) policies, only "admin" accounts can save landing page contents.</p>
            <p>To resolve this, open the SQL Editor in your Supabase Dashboard and run the following query:</p>
            <code className="block p-3 bg-black/50 border border-white/5 rounded-xl font-mono text-[10px] text-white select-all">
              UPDATE public.profiles SET role = 'admin' WHERE id = '{profile.id}';
            </code>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2">
          {sections.map(s => (
            <button
              key={s.section_key}
              onClick={() => setActiveSection(s.section_key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                activeSection === s.section_key
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {!s.is_visible && <EyeOff size={10} className="opacity-50" />}
              {SECTION_LABELS[s.section_key] || s.section_key}
            </button>
          ))}
        </div>

        {/* Editor Panel */}
        {current && (
          <div className="bg-black/40 border border-white/[0.08] rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[40px] rounded-full pointer-events-none" />

            {/* Section Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/[0.06] pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                {SECTION_LABELS[activeSection]}
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={async () => {
                    const nextVal = !current.is_visible;
                    toggleVisibility(activeSection);
                    const updatedSec = { ...current, is_visible: nextVal };
                    const { error } = await saveSingleSection(updatedSec);
                    if (error) {
                      toast.error(`Visibility save failed: ${error.message || 'Unknown error'}`);
                    } else {
                      invalidateLandingCache();
                      toast.success(`${SECTION_LABELS[activeSection]} is now ${nextVal ? 'Visible' : 'Hidden'}!`);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                    current.is_visible
                      ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                      : 'bg-white/5 border border-white/10 text-gray-400'
                  }`}
                >
                  {current.is_visible ? <Eye size={10} /> : <EyeOff size={10} />}
                  {current.is_visible ? 'Visible' : 'Hidden'}
                </button>
                <button
                  onClick={() => saveSection(activeSection)}
                  disabled={saving === activeSection}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-all disabled:opacity-50"
                >
                  {saving === activeSection ? <RefreshCw size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                  Save Section
                </button>
              </div>
            </div>

            {/* Dynamic Editor Fields */}
            <div className="space-y-6 relative z-10">
              {activeSection === 'hero' && <HeroEditor content={current.content} onChange={(c) => updateSectionContent('hero', c)} />}
              {activeSection === 'features' && <FeaturesEditor content={current.content} onChange={(c) => updateSectionContent('features', c)} />}
              {activeSection === 'impact' && <SimpleFieldsEditor content={current.content} onChange={(c) => updateSectionContent('impact', c)} fields={['sectionLabel', 'sectionTitle', 'description', 'ctaText']} />}
              {activeSection === 'tech_stack' && <TechStackEditor content={current.content} onChange={(c) => updateSectionContent('tech_stack', c)} />}
              {activeSection === 'milestones' && <HowItWorksEditor content={current.content} onChange={(updater) => updateSectionContent('milestones', updater)} />}
              {activeSection === 'faq' && <FaqEditor content={current.content} onChange={(updater) => updateSectionContent('faq', updater)} />}
              {activeSection === 'cta' && <SimpleFieldsEditor content={current.content} onChange={(c) => updateSectionContent('cta', c)} fields={['heading', 'description', 'buttonText', 'buttonTextLoggedIn']} />}
              {activeSection === 'footer' && <SimpleFieldsEditor content={current.content} onChange={(c) => updateSectionContent('footer', c)} fields={['tagline', 'copyright', 'github', 'linkedin', 'contactEmail', 'collegeName']} />}
              {activeSection === 'creator' && <CreatorEditor content={current.content} onChange={(c) => updateSectionContent('creator', c)} />}
              {activeSection === 'privacy' && <PolicyEditor content={current.content} onChange={(c) => updateSectionContent('privacy', c)} label="Privacy Policy" />}
              {activeSection === 'terms' && <PolicyEditor content={current.content} onChange={(c) => updateSectionContent('terms', c)} label="Terms of Service" />}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

// ─── SUB-EDITORS ───────────────────────────────────────────────

function FieldInput({ label, value, onChange, multiline = false }) {
  const id = `field-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div>
      <label htmlFor={id} className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</label>
      {multiline ? (
        <textarea
          id={id}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/40 transition-colors resize-none"
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/40 transition-colors"
        />
      )}
    </div>
  )
}

function SimpleFieldsEditor({ content, onChange, fields }) {
  const FIELD_LABELS = {
    sectionLabel: 'Section Label',
    sectionTitle: 'Section Title',
    description: 'Description',
    ctaText: 'Button Text',
    heading: 'Heading',
    buttonText: 'Button Text',
    buttonTextLoggedIn: 'Button Text (Logged In)',
    tagline: 'Tagline',
    copyright: 'Copyright Text',
    github: 'GitHub URL',
    linkedin: 'LinkedIn URL',
    contactEmail: 'Contact Email',
    collegeName: 'College Name',
  }

  const multilineFields = ['description', 'tagline']

  return (
    <div className="space-y-5">
      {fields.map(field => (
        <FieldInput
          key={field}
          label={FIELD_LABELS[field] || field}
          value={content[field]}
          onChange={val => onChange({ [field]: val })}
          multiline={multilineFields.includes(field)}
        />
      ))}
    </div>
  )
}

function HeroEditor({ content, onChange }) {
  return (
    <div className="space-y-5">
      <FieldInput label="Badge Text" value={content.badge} onChange={val => onChange({ badge: val })} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldInput label="Heading Line 1" value={content.heading} onChange={val => onChange({ heading: val })} />
        <FieldInput label="Heading Accent (Gradient)" value={content.headingAccent} onChange={val => onChange({ headingAccent: val })} />
      </div>
      <FieldInput label="Description" value={content.description} onChange={val => onChange({ description: val })} multiline />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FieldInput label="Primary CTA" value={content.ctaPrimary} onChange={val => onChange({ ctaPrimary: val })} />
        <FieldInput label="Secondary CTA" value={content.ctaSecondary} onChange={val => onChange({ ctaSecondary: val })} />
        <FieldInput label="CTA (Logged In)" value={content.ctaPrimaryLoggedIn} onChange={val => onChange({ ctaPrimaryLoggedIn: val })} />
      </div>
    </div>
  )
}

function FeaturesEditor({ content, onChange }) {
  const cards = content.cards || []

  function updateCard(idx, field, val) {
    const updated = [...cards]
    updated[idx] = { ...updated[idx], [field]: val }
    onChange({ cards: updated })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldInput label="Section Label" value={content.sectionLabel} onChange={val => onChange({ sectionLabel: val })} />
        <FieldInput label="Section Title" value={content.sectionTitle} onChange={val => onChange({ sectionTitle: val })} />
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Feature Cards</p>
        <div className="space-y-4">
          {cards.map((card, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Card {i + 1}</span>
              </div>
              <FieldInput label="Title" value={card.title} onChange={val => updateCard(i, 'title', val)} />
              <FieldInput label="Description" value={card.description} onChange={val => updateCard(i, 'description', val)} multiline />
              <FieldInput 
                label="On-Tap Capabilities / Detail Bullets (One per line)" 
                value={Array.isArray(card.bullets) ? card.bullets.join('\n') : ''} 
                onChange={val => updateCard(i, 'bullets', val.split('\n'))} 
                multiline 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TechStackEditor({ content, onChange }) {
  const cards = content.cards || []

  function updateCard(idx, field, val) {
    const updated = [...cards]
    updated[idx] = { ...updated[idx], [field]: val }
    onChange({ cards: updated })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldInput label="Section Label" value={content.sectionLabel} onChange={val => onChange({ sectionLabel: val })} />
        <FieldInput label="Section Title" value={content.sectionTitle} onChange={val => onChange({ sectionTitle: val })} />
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Tech Cards</p>
        <div className="space-y-4">
          {cards.map((card, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Card {i + 1}</span>
              <FieldInput label="Title" value={card.title} onChange={val => updateCard(i, 'title', val)} />
              <FieldInput label="Description" value={card.description} onChange={val => updateCard(i, 'description', val)} multiline />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FaqEditor({ content, onChange }) {
  const items = content.items || []

  function updateItem(idx, field, val) {
    onChange(prev => {
      const updated = [...(prev.items || [])]
      updated[idx] = { ...updated[idx], [field]: val }
      return { ...prev, items: updated }
    })
  }

  function addItem() {
    onChange(prev => ({
      ...prev,
      items: [...(prev.items || []), { question: '', answer: '' }],
    }))
  }

  function removeItem(idx) {
    onChange(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== idx),
    }))
  }

  function moveItem(idx, dir) {
    onChange(prev => {
      const arr = [...(prev.items || [])]
      const target = idx + dir
      if (target < 0 || target >= arr.length) return prev
      ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
      return { ...prev, items: arr }
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldInput label="Section Label" value={content.sectionLabel} onChange={val => onChange(prev => ({ ...prev, sectionLabel: val }))} />
        <FieldInput label="Section Title" value={content.sectionTitle} onChange={val => onChange(prev => ({ ...prev, sectionTitle: val }))} />
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">FAQ Items ({items.length})</p>
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-[8px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500/25 transition-all"
          >
            <Plus size={10} /> Add FAQ
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Q{i + 1}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="p-1 rounded bg-white/5 text-gray-400 hover:text-white disabled:opacity-20 transition-all"><ChevronUp size={12} /></button>
                  <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="p-1 rounded bg-white/5 text-gray-400 hover:text-white disabled:opacity-20 transition-all"><ChevronDown size={12} /></button>
                  <button onClick={() => removeItem(i)} className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 size={12} /></button>
                </div>
              </div>
              <FieldInput label="Question" value={item.question} onChange={val => updateItem(i, 'question', val)} />
              <FieldInput label="Answer" value={item.answer} onChange={val => updateItem(i, 'answer', val)} multiline />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CreatorEditor({ content, onChange }) {
  const skills = content.skills || []
  const stats = content.stats || []

  function updateField(field, val) {
    onChange({ [field]: val })
  }

  function handleSkillChange(idx, val) {
    const updated = [...skills]
    updated[idx] = val
    updateField('skills', updated)
  }

  function addSkill() {
    updateField('skills', [...skills, 'New Skill'])
  }

  function removeSkill(idx) {
    updateField('skills', skills.filter((_, i) => i !== idx))
  }

  function updateStat(idx, field, val) {
    const updated = [...stats]
    updated[idx] = { ...updated[idx], [field]: val }
    updateField('stats', updated)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldInput label="Section Label" value={content.sectionLabel} onChange={val => updateField('sectionLabel', val)} />
        <FieldInput label="Section Title" value={content.sectionTitle} onChange={val => updateField('sectionTitle', val)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldInput label="Creator Name" value={content.name} onChange={val => updateField('name', val)} />
        <FieldInput label="Portfolio URL" value={content.portfolioUrl} onChange={val => updateField('portfolioUrl', val)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldInput label="GitHub URL" value={content.githubUrl} onChange={val => updateField('githubUrl', val)} />
        <FieldInput label="Connect URL" value={content.connectUrl} onChange={val => updateField('connectUrl', val)} />
      </div>

      <FieldInput label="Description" value={content.description} onChange={val => updateField('description', val)} multiline />

      {/* Skills Editor */}
      <div className="border-t border-white/[0.06] pt-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Skills / Tech Badge Stack ({skills.length})</p>
          <button
            type="button"
            onClick={addSkill}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-[8px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500/25 transition-all"
          >
            <Plus size={10} /> Add Skill
          </button>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {skills.map((skill, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all">
              <input
                type="text"
                value={skill}
                onChange={e => handleSkillChange(i, e.target.value)}
                className="bg-transparent border-none p-0 text-xs text-white focus:outline-none w-20 font-medium"
              />
              <button
                type="button"
                onClick={() => removeSkill(i)}
                className="text-gray-500 hover:text-red-400 transition-colors text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards Editor */}
      <div className="border-t border-white/[0.06] pt-5">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Stats Cards (4 items recommended)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Stat Card {i + 1}</span>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput label="Value" value={stat.value} onChange={val => updateStat(i, 'value', val)} />
                <FieldInput label="Label" value={stat.label} onChange={val => updateStat(i, 'label', val)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FieldInput label="Icon (Lucide name)" value={stat.icon} onChange={val => updateStat(i, 'icon', val)} />
                <FieldInput label="Color (Hex)" value={stat.color} onChange={val => updateStat(i, 'color', val)} />
                <FieldInput label="Link" value={stat.link} onChange={val => updateStat(i, 'link', val)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HowItWorksEditor({ content, onChange }) {
  const steps = content.steps || []

  function updateStep(idx, field, val) {
    onChange(prev => {
      const updated = [...(prev.steps || [])]
      updated[idx] = { ...updated[idx], [field]: val }
      return { ...prev, steps: updated }
    })
  }

  function addStep() {
    onChange(prev => ({
      ...prev,
      steps: [...(prev.steps || []), { number: String((prev.steps?.length || 0) + 1).padStart(2, '0'), title: '', description: '' }],
    }))
  }

  function removeStep(idx) {
    onChange(prev => ({
      ...prev,
      steps: (prev.steps || []).filter((_, i) => i !== idx),
    }))
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldInput label="Section Label" value={content.sectionLabel} onChange={val => onChange(prev => ({ ...prev, sectionLabel: val }))} />
        <FieldInput label="Section Title" value={content.sectionTitle} onChange={val => onChange(prev => ({ ...prev, sectionTitle: val }))} />
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Steps ({steps.length})</p>
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-[8px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500/25 transition-all"
          >
            <Plus size={10} /> Add Step
          </button>
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Step {i + 1}</span>
                <button type="button" onClick={() => removeStep(i)} className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 size={12} /></button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <FieldInput label="Number" value={step.number} onChange={val => updateStep(i, 'number', val)} />
                <div className="col-span-3">
                  <FieldInput label="Title" value={step.title} onChange={val => updateStep(i, 'title', val)} />
                </div>
              </div>
              <FieldInput label="Description" value={step.description} onChange={val => updateStep(i, 'description', val)} multiline />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PolicyEditor({ content, onChange, label }) {
  const items = content.items || []

  function updateItem(idx, field, val) {
    onChange(prev => {
      const updated = [...(prev.items || [])]
      updated[idx] = { ...updated[idx], [field]: val }
      return { ...prev, items: updated }
    })
  }

  function addItem() {
    onChange(prev => ({
      ...prev,
      items: [...(prev.items || []), { title: '', content: '' }],
    }))
  }

  function removeItem(idx) {
    onChange(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== idx),
    }))
  }

  function moveItem(idx, dir) {
    onChange(prev => {
      const arr = [...(prev.items || [])]
      const target = idx + dir
      if (target < 0 || target >= arr.length) return prev
      ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
      return { ...prev, items: arr }
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5">
        <FieldInput label="Section Title" value={content.sectionTitle} onChange={val => onChange(prev => ({ ...prev, sectionTitle: val }))} />
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label} Clauses ({items.length})</p>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-[8px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500/25 transition-all"
          >
            <Plus size={10} /> Add Clause
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Clause {i + 1}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0} className="p-1 rounded bg-white/5 text-gray-400 hover:text-white disabled:opacity-20 transition-all"><ChevronUp size={12} /></button>
                  <button type="button" onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="p-1 rounded bg-white/5 text-gray-400 hover:text-white disabled:opacity-20 transition-all"><ChevronDown size={12} /></button>
                  <button type="button" onClick={() => removeItem(i)} className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 size={12} /></button>
                </div>
              </div>
              <FieldInput label="Clause Header / Title" value={item.title} onChange={val => updateItem(i, 'title', val)} />
              <FieldInput label="Clause Details" value={item.content} onChange={val => updateItem(i, 'content', val)} multiline />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

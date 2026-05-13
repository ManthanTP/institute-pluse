import { useAuthStore } from '../../store/index'
import OwnerLayout from './OwnerLayout'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

export default function OwnerProfilePage() {
  const { profile } = useAuthStore()

  return (
    <OwnerLayout>
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="text-center">
           <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-orange-500 to-red-600 p-1 mx-auto mb-6">
              <div className="w-full h-full rounded-[38px] bg-slate-900 flex items-center justify-center text-4xl font-black text-white">
                 {profile?.full_name?.[0] || 'O'}
              </div>
           </div>
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{profile?.full_name}</h2>
           <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Certified System Owner</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
           <ProfileField icon={Mail} label="Registry Email" value={profile?.email} />
           <ProfileField icon={Shield} label="Access Tier" value="Master Hub Controller" />
           <ProfileField icon={Calendar} label="Nodes Active Since" value={new Date(profile?.created_at).toLocaleDateString()} />
        </div>

        <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl">
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 text-center italic">Security Protocol</p>
           <p className="text-[11px] font-medium text-gray-400 text-center leading-relaxed">
             This account has privileged access to the cafeteria registry and telemetry. Ensure all operational changes are verified through the Pulse Core protocols.
           </p>
        </div>
      </div>
    </OwnerLayout>
  )
}

function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-6">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500">
         <Icon size={20} />
      </div>
      <div>
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-black text-white uppercase tracking-tight">{value}</p>
      </div>
    </div>
  )
}

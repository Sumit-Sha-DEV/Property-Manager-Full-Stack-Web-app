import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, IndianRupee, Phone, User, ArrowLeft, Target, Wallet, FileText, Bed, Maximize } from 'lucide-react'
import { ClientActions } from './ClientActions'

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  // Fetch Client
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !client) {
    return notFound()
  }

  return (
    <div className="pb-24 max-w-2xl mx-auto min-h-screen bg-gray-50/50">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white/90 backdrop-blur-3xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 flex flex-col items-center text-center w-full relative">
          {/* Action Button moved here for cleaner header */}
          <div className="absolute top-6 right-6">
            <ClientActions client={client} />
          </div>

          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 mb-4 shadow-inner">
            <User size={40} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{client.name}</h1>
            <div className={`mt-2 inline-flex px-4 py-1.5 rounded-full text-xs font-bold border tracking-wider ${
              client.requirement === 'Buy' 
                ? 'bg-blue-50 text-blue-700 border-blue-200/50' 
                : 'bg-purple-50 text-purple-700 border-purple-200/50'
            }`}>
              TO {client.requirement.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <a href={`tel:${client.phone}`} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center active:scale-95 transition-transform hover:shadow-md">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
              <Phone size={18} />
            </div>
            <span className="text-xs text-gray-500 font-medium mb-0.5">Call Client</span>
            <span className="font-semibold text-gray-900">{client.phone}</span>
          </a>
          
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
              <Wallet size={18} />
            </div>
            <span className="text-xs text-gray-500 font-medium mb-0.5">Max Budget</span>
            <span className="font-bold text-gray-900 flex items-center justify-center">
              <IndianRupee size={14} className="mr-0.5"/>
              {client.budget.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Requirement Summary */}
        <div className="bg-white/90 backdrop-blur-3xl p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/50">
              <Target size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Requirement Summary</h3>
              <p className="text-sm font-bold text-slate-700">Detailed Preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
              <div className="text-indigo-500 mb-1.5 opacity-60">
                <Target size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property Type</span>
              <span className="font-black text-slate-800 text-sm">{client.configuration?.category || 'Any Category'}</span>
            </div>
            
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
              <div className="text-purple-500 mb-1.5 opacity-60">
                <Maximize size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Area</span>
              <span className="font-black text-slate-800 text-sm">
                {client.configuration?.required_area ? `${client.configuration.required_area} ft²` : '—'}
              </span>
            </div>
          </div>

          {client.configuration?.bhk?.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/30">
                <Bed size={18} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-1">Room Preferences</h4>
                <p className="font-black text-blue-900 text-xs">
                  {client.configuration.bhk.join(', ')} BHK
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 flex items-center justify-between">
            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Looking For:</span>
            <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-black text-indigo-700 border border-indigo-200">
              {client.configuration?.property_type || 'General'} Listing
            </span>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4 pt-2">
          <h3 className="font-semibold text-gray-900 ml-1">Location Preferences</h3>
          <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
            {client.preferred_locations && client.preferred_locations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {client.preferred_locations.map((loc: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-gray-50 text-gray-700 font-medium text-sm rounded-xl border border-gray-100 flex items-center">
                    <MapPin size={14} className="mr-1.5 text-gray-400" />
                    {loc}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400 font-medium italic text-center py-2">No location preferences set</div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4 pt-2">
          <h3 className="font-semibold text-gray-900 ml-1">Private Notes</h3>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <FileText size={100} />
            </div>
            {client.notes ? (
              <p className="text-gray-600 text-[15px] leading-relaxed relative z-10 whitespace-pre-wrap">
                {client.notes}
              </p>
            ) : (
              <div className="text-sm text-gray-400 font-medium italic text-center py-2 relative z-10">No notes available</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

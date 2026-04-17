import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, IndianRupee, Phone, User, ArrowLeft, Target, Wallet, FileText } from 'lucide-react'
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
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-3xl border-b border-gray-100 px-4 h-14 flex items-center justify-between shadow-sm">
        <Link href="/clients" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-semibold text-gray-900 text-sm">Client Details</span>
        <ClientActions client={client} />
      </header>

      <div className="p-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white/90 backdrop-blur-3xl p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
              <User size={32} className="text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{client.name}</h1>
              <div className={`mt-1 inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                client.requirement === 'Buy' 
                  ? 'bg-blue-50/80 text-blue-700 border-blue-200/50' 
                  : 'bg-purple-50/80 text-purple-700 border-purple-200/50'
              }`}>
                TO {client.requirement.toUpperCase()}
              </div>
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

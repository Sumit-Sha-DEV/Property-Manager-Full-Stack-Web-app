import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, IndianRupee, Bed, Maximize, Layers, Phone, User, ExternalLink } from 'lucide-react'
import { PropertyActions } from './PropertyActions'
import { PropertyImageGallery } from './PropertyImageGallery'
import { ClientBackButton } from '@/components/ClientBackButton'
import { PrimaryShareButton } from './PrimaryShareButton'

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  // Fetch Property
  const { data: property, error } = await supabase
    .from('properties')
    .select('*, property_images(image_url)')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !property) {
    return notFound()
  }

  const images = property.property_images?.map((img: any) => img.image_url) || []
  const config = property.configuration || {}
  
  // Stats helpers
  const floorValue = config.total_floors ? `${config.current_floor || 0}/${config.total_floors}` : (config.floor || '—')
  const bhkValue = config.bhk ? `${config.bhk} BHK` : '—'
  const sizeValue = config.super_built_up ? `${config.super_built_up} ft²` : (config.size || '—')

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#111220]" style={{ height: '100dvh' }}>
      {/* Background Gradient Layer */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(165deg, #111220 0%, #0c0d1b 40%, #110d1e 100%)' }} />

      {/* ─── Header (Glassmorphic) ─── */}
      <header 
        className="relative z-10 flex items-center justify-between px-5 shrink-0"
        style={{ 
          height: '60px',
          background: 'rgba(30, 30, 45, 0.4)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderBottom: '1px solid rgba(187, 195, 255, 0.08)'
        }}
      >
        <ClientBackButton 
          className="flex items-center justify-center rounded-full transition-all active:scale-90"
          style={{ 
            width: '40px', height: '40px',
            background: 'rgba(187, 195, 255, 0.12)',
            color: '#bbc3ff',
            border: '1px solid rgba(187, 195, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        />
        <div className="flex flex-col items-center">
          <span className="font-black tracking-[0.2em] uppercase text-[0.65rem] text-indigo-100/90">
            {config.property_type || 'Property'}
          </span>
          <span className="text-[10px] font-bold text-indigo-400">{config.category || 'Listing'}</span>
        </div>
        <PropertyActions property={property} />
      </header>

      {/* ─── Main Integrated Content ─── */}
      <main className="relative z-10 flex-1 flex flex-col px-4 pt-3 pb-4 overflow-hidden">
        
        {/* 1. Dynamic Image Gallery (35% fixed) */}
        <div className="h-[32vh] min-h-[220px] shrink-0 mb-4">
          <PropertyImageGallery images={images} propertyType={property.type} />
        </div>

        {/* 2. Primary Pricing & Address */}
        <div className="shrink-0 mb-4 px-1">
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-baseline gap-1" style={{ color: '#e2e0f5' }}>
                <IndianRupee size={26} className="text-indigo-400" />
                <span className="font-black text-3xl sm:text-4xl tracking-tighter">
                  {property.price.toLocaleString('en-IN')}
                </span>
                {config.price_per_sqft && (
                  <span className="ml-2 text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    ₹{config.price_per_sqft}/ft²
                  </span>
                )}
              </div>
              <div className="flex items-start mt-2 text-[#908f9d]">
                <MapPin size={16} className="mr-2 mt-0.5 shrink-0 text-indigo-500/60" />
                <span className="text-sm leading-tight font-medium line-clamp-1">{property.address}</span>
              </div>
            </div>
            
            <div 
              className="px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase"
              style={{
                background: property.type === 'Sale' 
                  ? 'linear-gradient(135deg, rgba(0,38,184,0.6), rgba(59,90,254,0.3))'
                  : 'linear-gradient(135deg, rgba(114,17,153,0.6), rgba(235,178,255,0.3))',
                color: property.type === 'Sale' ? '#d9e0ff' : '#f5e1ff',
                border: `1px solid ${property.type === 'Sale' ? 'rgba(187,195,255,0.2)' : 'rgba(235,178,255,0.2)'}`,
              }}
            >
              {property.type}
            </div>
          </div>
        </div>

        {/* 3. Stats Grid (Compact & Bold) */}
        <div className="shrink-0 grid grid-cols-4 gap-2 mb-3">
          {[
            { icon: <Bed size={22} strokeWidth={2.5} />, label: 'BHK', value: bhkValue, accent: '#bbc3ff' },
            { icon: <Maximize size={22} strokeWidth={2.5} />, label: 'Area', value: sizeValue, accent: '#ebb2ff' },
            { icon: <Layers size={22} strokeWidth={2.5} />, label: 'Floor', value: floorValue, accent: '#c0c5e4' },
            { icon: <ExternalLink size={22} strokeWidth={2.5} />, label: 'Facing', value: config.facing || '—', accent: '#a5b4fc' },
          ].map((stat) => (
            <div 
              key={stat.label}
              className="flex flex-col items-center justify-center py-3 rounded-2xl"
              style={{ 
                background: 'rgba(50, 52, 75, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(187, 195, 255, 0.08)',
              }}
            >
              <div style={{ color: stat.accent }}>{stat.icon}</div>
              <span className="text-[9px] font-bold mt-1.5 uppercase tracking-wider opacity-60">{stat.label}</span>
              <span className="font-black text-xs mt-0.5" style={{ color: '#e2e0f5' }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* 4. Primary Share Action (New Body Position) */}
        <div className="shrink-0 mb-4">
          <PrimaryShareButton property={property} />
        </div>

        {/* 5. Description Area (The Filler) */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80 mb-2 pl-1">Description</h3>
          <div 
            className="flex-1 overflow-y-auto rounded-2xl p-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-indigo-500/10 [&::-webkit-scrollbar-thumb]:rounded-full"
            style={{ 
              background: 'rgba(40, 41, 56, 0.35)',
              border: '1px solid rgba(187, 195, 255, 0.05)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <p className="text-sm leading-relaxed text-[#c7c5d4] font-medium">
              {property.description}
            </p>
          </div>
        </div>
      </main>

      {/* ─── Footer Action Bar (Fixed Elite Dock) ─── */}
      <footer className="relative z-10 grid grid-cols-2 gap-3 px-5 py-5 shrink-0 bg-[#0c0d1b]/80 backdrop-blur-3xl border-t border-white/5">
        <a 
          href={property.google_map_link || '#'}
          target="_blank"
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.03)', color: '#bbc3ff' }}
        >
          <MapPin size={16} />
          Location
        </a>
        
        <a 
          href={`tel:${property.owner_phone}`}
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-indigo-600/30"
          style={{
            background: 'linear-gradient(135deg, #0026b8 0%, #3D5AFE 100%)',
            color: '#ffffff',
          }}
        >
          <Phone size={16} />
          Call Owner
        </a>
      </footer>
    </div>
  )
}

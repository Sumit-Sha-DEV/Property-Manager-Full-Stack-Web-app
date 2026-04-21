'use client'

import Image from 'next/image'
import { MapPin, IndianRupee, Trash2, Edit2, Bed, Maximize } from 'lucide-react'
import { deleteProperty } from '@/actions/property.actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const EditPropertyModal = dynamic(() => import('@/app/(dashboard)/properties/EditPropertyModal').then(mod => mod.EditPropertyModal), {
  ssr: false
})

export function PropertyCard({ property, priority = false }: { property: any, priority?: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const router = useRouter()
  
  const imageUrl = property.property_images?.[0]?.image_url || '/placeholder.png'
  const [isHidden, setIsHidden] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this property?')) {
      setIsHidden(true) // Optimistically hide
      try {
        await deleteProperty(property.id)
      } catch (err) {
        alert('Failed to delete property')
        setIsHidden(false) // Restore if failed
      }
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditOpen(true)
  }

  const handleCardClick = () => {
    router.push(`/properties/${property.id}`)
  }

  const handleMouseEnter = () => {
    router.prefetch(`/properties/${property.id}`)
  }

  if (isHidden) return null;

  return (
    <>
      <div 
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        className="bg-white/90 backdrop-blur-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-indigo-50/50 overflow-hidden relative touch-manipulation p-1.5 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 active:scale-[0.98] cursor-pointer w-full rounded-[2rem] animate-in fade-out duration-300"
        role="button"
        tabIndex={0}
      >
        <div className="relative h-44 w-full bg-slate-50 overflow-hidden">
          {imageUrl.startsWith('http') ? (
            <Image 
              src={imageUrl} 
              alt={property.address}
              fill
              priority={priority}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4="
              className="object-cover hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 font-medium text-sm">No Image</div>
          )}
          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xl px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide text-indigo-900 shadow-sm border border-white/50">
            {property.type === 'Sale' ? 'FOR SALE' : 'FOR RENT'}
          </div>
        </div>

        <div className="p-4 flex justify-between items-start gap-3">
          <div className="space-y-2 flex-1 pr-1">
            <div className="flex items-center text-slate-800 font-black text-xl tracking-tight">
              <IndianRupee size={20} className="mr-1 text-indigo-600" strokeWidth={3} />
              {property.price.toLocaleString('en-IN')}
            </div>
            
            <div className="flex items-start text-slate-500 text-xs font-semibold">
              <MapPin size={16} className="mr-1.5 mt-0.5 shrink-0 text-slate-400" />
              <span className="line-clamp-1 leading-tight">{property.address}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {property.configuration?.bhk && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/80 text-indigo-700 rounded-xl border border-indigo-100 shadow-sm text-[11px] font-black uppercase tracking-tight">
                  <Bed size={14} fill="currentColor" opacity={0.4} />
                  {property.configuration.bhk} BHK
                </div>
              )}
              {(property.configuration?.super_built_up || property.configuration?.size) ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50/80 text-purple-700 rounded-xl border border-purple-100 shadow-sm text-[11px] font-black uppercase tracking-tight">
                  <Maximize size={14} fill="currentColor" opacity={0.4} />
                  {property.configuration.super_built_up || property.configuration.size} ft²
                </div>
              ) : null}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 shrink-0 mt-1">
            <button 
              onClick={handleEditClick}
              className="p-2.5 bg-indigo-50 rounded-full text-indigo-600 shadow-md border border-indigo-100/50 hover:bg-white active:scale-90 transition-all"
              title="Edit Property"
            >
              <Edit2 size={15} />
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2.5 bg-rose-50 rounded-full text-rose-500 shadow-md border border-rose-100/50 hover:bg-white active:scale-90 disabled:opacity-50 transition-all"
              title="Delete Property"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {isEditOpen && (
        <EditPropertyModal 
          property={property} 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
        />
      )}
    </>
  )
}

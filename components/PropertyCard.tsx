'use client'

import Image from 'next/image'
import { MapPin, IndianRupee, Trash2, Edit2 } from 'lucide-react'
import { deleteProperty } from '@/actions/property.actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditPropertyModal } from '@/app/(dashboard)/properties/EditPropertyModal'

export function PropertyCard({ property }: { property: any }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const router = useRouter()
  
  const imageUrl = property.property_images?.[0]?.image_url || '/placeholder.png'

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this property?')) {
      setIsDeleting(true)
      try {
        await deleteProperty(property.id)
      } catch (err) {
        alert('Failed to delete property')
        setIsDeleting(false)
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

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white/90 backdrop-blur-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-indigo-50/50 overflow-hidden relative touch-manipulation p-1.5 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer"
        role="button"
        tabIndex={0}
      >
        <div className="relative h-44 w-full bg-slate-50 overflow-hidden">
          {imageUrl.startsWith('http') ? (
            <Image 
              src={imageUrl} 
              alt={property.address}
              fill
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

        <div className="p-3 flex justify-between items-start gap-2">
          <div className="space-y-1.5 flex-1 pr-1">
            <div className="flex items-center text-slate-800 font-extrabold text-lg tracking-tight">
              <IndianRupee size={16} className="mr-0.5 text-indigo-600" />
              {property.price.toLocaleString('en-IN')}
            </div>
            
            <div className="flex items-start text-slate-500 text-xs font-medium">
              <MapPin size={14} className="mr-1 mt-0.5 shrink-0 text-slate-400" />
              <span className="line-clamp-1 leading-tight">{property.address}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5 text-[11px] text-slate-600 font-bold tracking-tight">
              {property.configuration?.bhk && (
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100/50">{property.configuration.bhk}</span>
              )}
              {property.configuration?.size && (
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-100/50">{property.configuration.size}</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 shrink-0 mt-0.5">
            <button 
              onClick={handleEditClick}
              className="p-1.5 bg-indigo-50 rounded-full text-indigo-600 shadow-sm border border-indigo-100 hover:bg-white transition-colors"
              title="Edit Property"
            >
              <Edit2 size={13} />
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 bg-rose-50 rounded-full text-rose-500 shadow-sm border border-rose-100 hover:bg-white disabled:opacity-50 transition-colors"
              title="Delete Property"
            >
              <Trash2 size={13} />
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

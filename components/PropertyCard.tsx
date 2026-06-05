'use client'

import Image from 'next/image'
import { MapPin, IndianRupee, Trash2, Edit2, Bed, Maximize } from 'lucide-react'
import { deleteProperty } from '@/actions/property.actions'
import { useState, memo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { getCardImageUrl, generateImageSrcSet } from '@/lib/cloudinary-optimizer'

const EditPropertyModal = dynamic(() => import('@/app/(dashboard)/properties/EditPropertyModal').then(mod => mod.EditPropertyModal), {
  ssr: false
})

function PropertyCardComponent({ property, priority = false }: { property: any, priority?: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHidden, setIsHidden] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const videos = property.property_videos?.map((vid: any) => ({ url: vid.video_url, type: 'video' })) || []
  const images = property.property_images?.map((img: any) => ({ url: img.image_url, type: 'image' })) || []
  const media = [...videos, ...images]
  const hasMedia = media.length > 0

  // Optimize image slider scroll detection
  const handleScroll = useCallback(() => {
    if (!sliderRef.current) return
    const scrollLeft = sliderRef.current.scrollLeft
    const width = sliderRef.current.offsetWidth
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width)
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex)
      }
    }
  }, [activeIndex])

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteModalOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleting(true)
    setIsHidden(true)
    try {
      await deleteProperty(property.id)
      setIsDeleteModalOpen(false)
    } catch (err) {
      console.error('Failed to delete property:', err)
      setIsHidden(false)
      setIsDeleting(false)
    }
  }, [property.id])

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditOpen(true)
  }, [])

  const handleCardClick = useCallback(() => {
    router.push(`/properties/${property.id}`)
  }, [router, property.id])

  const handleMouseEnter = useCallback(() => {
    router.prefetch(`/properties/${property.id}`)
  }, [router, property.id])

  if (isHidden) return null;

  return (
    <>
      <div 
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        className="bg-white/90 backdrop-blur-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-indigo-50/50 overflow-hidden relative touch-manipulation p-1.5 transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 active:scale-[0.99] cursor-pointer w-full rounded-[2.5rem] animate-in fade-out duration-300"
        role="button"
        tabIndex={0}
      >
        {/* ─── Swipeable Image/Video Carousel ─── */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden rounded-[2.2rem] shadow-inner group">
          {hasMedia ? (
            <div
              ref={sliderRef}
              onScroll={handleScroll}
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {media.map((item: any, idx: number) => {
                if (item.type === 'video') {
                  return (
                    <div key={idx} className="w-full h-full shrink-0 snap-center relative bg-black flex items-center justify-center">
                      <video 
                        src={item.url} 
                        muted 
                        playsInline 
                        loop 
                        autoPlay
                        className="object-cover w-full h-full select-none pointer-events-none"
                      />
                    </div>
                  )
                } else {
                  const optimizedImageUrl = getCardImageUrl(item.url)
                  const imageSrcSet = generateImageSrcSet(item.url, 600)
                  return (
                    <div key={idx} className="w-full h-full shrink-0 snap-center relative">
                      <img 
                        src={optimizedImageUrl}
                        alt={`${property.address} - View ${idx + 1}`}
                        className="object-cover w-full h-full select-none pointer-events-none"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        srcSet={imageSrcSet}
                        loading={priority && idx === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  )
                }
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 font-medium text-sm">No Media Available</div>
          )}

          {/* Type Badge (Sale / Rent) */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xl px-3 py-1 rounded-full text-[9px] font-black tracking-widest text-indigo-900 shadow-sm border border-white/50 select-none z-10">
            {property.type === 'Sale' ? 'FOR SALE' : 'FOR RENT'}
          </div>

          {/* Photo Count Indicator */}
          {media.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/45 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest text-white border border-white/10 select-none z-10">
              {activeIndex + 1} / {media.length}
            </div>
          )}

          {/* Pagination Indicators (Dots) */}
          {media.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
              {media.map((_: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: idx === activeIndex ? '14px' : '5px',
                    height: '5px',
                    background: idx === activeIndex
                      ? 'linear-gradient(90deg, #bbc3ff, #ebb2ff)'
                      : 'rgba(255, 255, 255, 0.45)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ─── Details Section ─── */}
        <div className="p-4 flex justify-between items-start gap-3">
          <div className="space-y-2.5 flex-1 pr-1">
            <div className="flex items-center text-slate-800 font-black text-xl tracking-tight">
              <IndianRupee size={19} className="mr-0.5 text-indigo-600" strokeWidth={3} />
              {property.price.toLocaleString('en-IN')}
            </div>
            
            <div className="flex items-start text-slate-500 text-xs font-semibold">
              <MapPin size={15} className="mr-1.5 mt-0.5 shrink-0 text-slate-400" />
              <span className="line-clamp-1 leading-tight">{property.address}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {property.configuration?.bhk && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/80 text-indigo-700 rounded-xl border border-indigo-100/60 shadow-sm text-[10px] font-black uppercase tracking-tight">
                  <Bed size={13} fill="currentColor" className="opacity-40" />
                  {property.configuration.bhk} BHK
                </div>
              )}
              {(property.configuration?.super_built_up || property.configuration?.size) ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50/80 text-purple-700 rounded-xl border border-purple-100/60 shadow-sm text-[10px] font-black uppercase tracking-tight">
                  <Maximize size={13} fill="currentColor" className="opacity-40" />
                  {property.configuration.super_built_up || property.configuration.size} ft²
                </div>
              ) : null}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 shrink-0 mt-0.5">
            <button 
              onClick={handleEditClick}
              className="p-2.5 bg-indigo-50 rounded-full text-indigo-600 shadow-md border border-indigo-100/40 hover:bg-white active:scale-90 transition-all cursor-pointer"
              title="Edit Property"
            >
              <Edit2 size={14} />
            </button>
            <button 
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-2.5 bg-rose-50 rounded-full text-rose-500 shadow-md border border-rose-100/40 hover:bg-white active:scale-90 disabled:opacity-50 transition-all cursor-pointer"
              title="Delete Property"
            >
              <Trash2 size={14} />
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

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Property"
        description={`Are you sure you want to delete this property at ${property.address}? This property will be permanently removed from your listings.`}
      />
    </>
  )
}

// Memoize to prevent unnecessary re-renders
export const PropertyCard = memo(PropertyCardComponent, (prevProps, nextProps) => {
  if (prevProps.priority !== nextProps.priority) return false

  const prev = prevProps.property
  const next = nextProps.property

  return prev.id === next.id &&
         prev.price === next.price &&
         prev.address === next.address &&
         prev.owner_name === next.owner_name &&
         prev.owner_phone === next.owner_phone &&
         prev.type === next.type &&
         prev.description === next.description &&
         JSON.stringify(prev.configuration) === JSON.stringify(next.configuration) &&
         JSON.stringify(prev.property_images) === JSON.stringify(next.property_images) &&
         JSON.stringify(prev.property_videos) === JSON.stringify(next.property_videos)
})

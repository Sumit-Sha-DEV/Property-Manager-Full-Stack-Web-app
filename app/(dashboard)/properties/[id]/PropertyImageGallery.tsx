'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

export function PropertyImageGallery({ images, propertyType }: { images: string[], propertyType: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!sliderRef.current) return
    const scrollPosition = sliderRef.current.scrollLeft
    const width = sliderRef.current.offsetWidth
    const newIndex = Math.round(scrollPosition / width)
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex)
    }
  }

  const handleThumbnailClick = (index: number) => {
    if (!sliderRef.current) return
    const width = sliderRef.current.offsetWidth
    sliderRef.current.scrollTo({ left: width * index, behavior: 'smooth' })
    setActiveIndex(index)
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-72 sm:h-96 relative bg-slate-100 flex items-center justify-center">
         <span className="text-slate-400 font-medium">No Images</span>
         <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xl px-4 py-1.5 rounded-none text-xs font-bold text-indigo-900 shadow-sm border border-white/50">
          {propertyType === 'Sale' ? 'FOR SALE' : 'FOR RENT'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="w-full h-72 sm:h-96 relative bg-slate-100">
        <div 
          ref={sliderRef}
          onScroll={handleScroll}
          className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar relative"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="w-full h-full shrink-0 snap-center relative">
              <Image 
                src={img} 
                alt={`Property image ${idx + 1}`}
                fill
                className="object-cover rounded-none"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>
        
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xl px-4 py-1.5 text-xs font-bold text-indigo-900 shadow-sm border border-white/50 rounded-none z-10">
          {propertyType === 'Sale' ? 'FOR SALE' : 'FOR RENT'}
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeIndex ? 'w-4 bg-indigo-600' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto p-4 -mt-2 relative z-10 hide-scrollbar bg-slate-50/50">
          {images.map((img, idx) => (
            <button 
              key={idx} 
              onClick={() => handleThumbnailClick(idx)}
              className={`w-20 h-20 shrink-0 relative overflow-hidden border-2 shadow-sm transition-all rounded-none ${
                idx === activeIndex ? 'border-indigo-600 opacity-100' : 'border-white opacity-60 hover:opacity-100'
              } bg-slate-200`}
            >
              <Image src={img} alt="thumb" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

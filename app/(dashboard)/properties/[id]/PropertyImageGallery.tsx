'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Images, Maximize2 } from 'lucide-react'
import { PropertyFullscreenGallery } from './PropertyFullscreenGallery'

export function PropertyImageGallery({ images, propertyType }: { images: string[], propertyType: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!sliderRef.current) return
    const scrollPosition = sliderRef.current.scrollLeft
    const width = sliderRef.current.offsetWidth
    const newIndex = Math.round(scrollPosition / width)
    if (newIndex !== activeIndex) setActiveIndex(newIndex)
  }

  const handleThumbnailClick = (index: number) => {
    if (!sliderRef.current) return
    const width = sliderRef.current.offsetWidth
    sliderRef.current.scrollTo({ left: width * index, behavior: 'smooth' })
    setActiveIndex(index)
  }

  if (!images || images.length === 0) {
    return (
      <div 
        className="w-full flex items-center justify-center rounded-[24px] relative"
        style={{ 
          height: '196px',
          background: 'rgba(30, 30, 45, 0.6)',
          border: '1px solid rgba(70, 70, 82, 0.2)',
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <Images size={28} style={{ color: '#464652' }} />
          <span className="text-xs font-semibold" style={{ color: '#464652' }}>No Images</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative rounded-[24px] overflow-hidden group" style={{ height: '196px' }}>
        {/* ─── Swipeable Image Strip ─── */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="w-full h-full flex overflow-x-auto snap-x snap-mandatory cursor-pointer"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onClick={() => setIsFullscreen(true)}
        >
          {images.map((img, idx) => (
            <div key={idx} className="w-full h-full shrink-0 snap-center relative">
              <Image
                src={img}
                alt={`Property image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={idx === 0}
              />
              {/* Dark gradient vignette for text contrast */}
              <div 
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(17,18,32,0.1) 0%, transparent 40%, rgba(17,18,32,0.55) 100%)' }}
              />
            </div>
          ))}
        </div>

        {/* ─── Fullscreen Toggle Indicator (Bottom Right) ─── */}
        <div className="absolute bottom-3 right-3 p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100 hidden sm:block"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', color: '#fff' }}
        >
          <Maximize2 size={16} />
        </div>

        {/* ─── Property Type Badge (top-left) ─── */}
        <div 
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black tracking-[0.15em] uppercase z-10 pointer-events-none"
          style={{
            background: propertyType === 'Sale'
              ? 'linear-gradient(135deg, rgba(0,38,184,0.7), rgba(61,90,254,0.5))'
              : 'linear-gradient(135deg, rgba(114,17,153,0.7), rgba(235,178,255,0.3))',
            color: propertyType === 'Sale' ? '#dee0ff' : '#f8d8ff',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${propertyType === 'Sale' ? 'rgba(187,195,255,0.18)' : 'rgba(235,178,255,0.18)'}`,
          }}
        >
          {propertyType === 'Sale' ? '★ FOR SALE' : '★ FOR RENT'}
        </div>

        {/* ─── Image Counter (top-right) ─── */}
        {images.length > 1 && (
          <div 
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold z-10 pointer-events-none"
            style={{
              background: 'rgba(17, 18, 32, 0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: '#c7c5d4',
              border: '1px solid rgba(70,70,82,0.2)',
            }}
          >
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* ─── Dot Indicators (bottom) ─── */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  handleThumbnailClick(idx)
                }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: idx === activeIndex ? '20px' : '6px',
                  height: '6px',
                  background: idx === activeIndex
                    ? 'linear-gradient(90deg, #bbc3ff, #ebb2ff)'
                    : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Fullscreen Modal ─── */}
      {isFullscreen && (
        <PropertyFullscreenGallery 
          images={images} 
          initialIndex={activeIndex} 
          onClose={() => setIsFullscreen(false)} 
        />
      )}
    </>
  )
}

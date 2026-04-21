'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface PropertyFullscreenGalleryProps {
  images: string[]
  initialIndex: number
  onClose: () => void
}

export function PropertyFullscreenGallery({ images, initialIndex, onClose }: PropertyFullscreenGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Scroll to initial index on mount
  useEffect(() => {
    if (sliderRef.current) {
      const width = sliderRef.current.offsetWidth
      sliderRef.current.scrollTo({ left: width * initialIndex })
    }
  }, [initialIndex])

  // Prevent background scrolling when open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleScroll = () => {
    if (!sliderRef.current) return
    const scrollPosition = sliderRef.current.scrollLeft
    const width = sliderRef.current.offsetWidth
    const newIndex = Math.round(scrollPosition / width)
    if (newIndex !== activeIndex) setActiveIndex(newIndex)
  }

  const scrollToIndex = (index: number) => {
    if (!sliderRef.current) return
    const width = sliderRef.current.offsetWidth
    sliderRef.current.scrollTo({ left: width * index, behavior: 'smooth' })
    setActiveIndex(index)
  }

  return (
    <div 
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#090910]"
      style={{ 
        background: 'radial-gradient(circle at center, #111220 0%, #090910 100%)',
      }}
    >
      {/* ─── Top Bar ─── */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-[210]">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b6a7a]">Full View</span>
          <span className="text-sm font-bold text-[#e2e0f5]">
            {activeIndex + 1} / {images.length}
          </span>
        </div>
        
        <button 
          onClick={onClose}
          className="p-3 rounded-full transition-all active:scale-95"
          style={{ 
            background: 'rgba(30, 30, 45, 0.4)',
            backdropFilter: 'blur(20px)',
            color: '#bbc3ff',
            border: '1px solid rgba(187, 195, 255, 0.15)'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* ─── Main Slider ─── */}
      <div
        ref={sliderRef}
        onScroll={handleScroll}
        className="w-full grow flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full shrink-0 snap-center flex items-center justify-center p-4">
            <div className="relative w-full h-[70vh] sm:h-[80vh]">
              <Image
                src={img}
                alt={`Property image ${idx + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Navigation Arrows (Hidden on mobile touch) ─── */}
      <div className="hidden sm:block">
        {activeIndex > 0 && (
          <button 
            onClick={() => scrollToIndex(activeIndex - 1)}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full text-[#bbc3ff] bg-black/20 hover:bg-black/40 transition-colors"
          >
            <ChevronLeft size={32} />
          </button>
        )}
        {activeIndex < images.length - 1 && (
          <button 
            onClick={() => scrollToIndex(activeIndex + 1)}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full text-[#bbc3ff] bg-black/20 hover:bg-black/40 transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* ─── Dot Indicators ─── */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-[210]">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            className="transition-all duration-300"
            style={{
              width: idx === activeIndex ? '24px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: idx === activeIndex 
                ? 'linear-gradient(90deg, #bbc3ff, #ebb2ff)' 
                : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

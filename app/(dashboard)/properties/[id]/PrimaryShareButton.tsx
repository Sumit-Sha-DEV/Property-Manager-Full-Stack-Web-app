'use client'

import { useState } from 'react'
import { Share2, Loader2 } from 'lucide-react'
import { sharePropertyDetails } from '@/lib/utils/share.utils'

export function PrimaryShareButton({ property }: { property: any }) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const result = await sharePropertyDetails(property)
      if (result.success && result.copied) {
        alert('Sharing not supported on this browser. Property details copied to clipboard!')
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
      style={{ 
        background: 'linear-gradient(135deg, #e2e0f5 0%, #bbc3ff 100%)', 
        color: '#0c0d1b',
        boxShadow: '0 4px 15px rgba(187, 195, 255, 0.3)'
      }}
    >
      {isSharing ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Wait...</span>
        </>
      ) : (
        <>
           <Share2 size={16} fill="currentColor" />
           <span>Share</span>
        </>
      )}
    </button>
  )
}

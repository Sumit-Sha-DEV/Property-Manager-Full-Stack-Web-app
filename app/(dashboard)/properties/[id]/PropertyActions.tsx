'use client'

import { useState } from 'react'
import { Edit2, Share2, Loader2 } from 'lucide-react'
import { EditPropertyModal } from '../EditPropertyModal'
import { sharePropertyDetails } from '@/lib/utils/share.utils'

export function PropertyActions({ property }: { property: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false)
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
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIsEditOpen(true)}
        className="flex items-center justify-center rounded-full transition-all active:scale-95"
        style={{
          width: '40px',
          height: '40px',
          background: 'rgba(70, 70, 82, 0.35)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(187, 195, 255, 0.08)',
          color: '#bbc3ff',
        }}
        title="Edit Property"
      >
        <Edit2 size={18} />
      </button>

      {isEditOpen && (
        <EditPropertyModal
          property={property}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </div>
  )
}

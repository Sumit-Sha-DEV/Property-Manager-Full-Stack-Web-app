'use client'

import { useState } from 'react'
import { Edit2, MoreVertical } from 'lucide-react'
import { EditPropertyModal } from '../EditPropertyModal'

export function PropertyActions({ property }: { property: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsEditOpen(true)}
        className="p-2 -mr-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center"
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
    </>
  )
}

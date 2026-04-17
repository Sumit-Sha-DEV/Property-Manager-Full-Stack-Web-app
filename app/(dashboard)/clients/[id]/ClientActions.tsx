'use client'

import { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { EditClientModal } from '../EditClientModal'

export function ClientActions({ client }: { client: any }) {
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
        <EditClientModal 
          client={client} 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
        />
      )}
    </>
  )
}

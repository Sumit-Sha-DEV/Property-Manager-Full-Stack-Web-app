'use client'

import { User, Phone, MapPin, IndianRupee, Trash2, Edit2 } from 'lucide-react'
import { deleteClient } from '@/actions/client.actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditClientModal } from '@/app/(dashboard)/clients/EditClientModal'

export function ClientCard({ client }: { client: any }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this client?')) {
      setIsDeleting(true)
      try {
        await deleteClient(client.id)
      } catch (err) {
        alert('Failed to delete client')
        setIsDeleting(false)
      }
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditOpen(true)
  }

  const handleCardClick = () => {
    router.push(`/clients/${client.id}`)
  }

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-indigo-50/50 p-4 relative touch-manipulation transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer"
        role="button"
        tabIndex={0}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-2">
            <h3 className="font-extrabold text-slate-800 text-lg tracking-tight flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 rounded-full border border-indigo-100/50">
                <User size={16} className="text-indigo-500" />
              </div>
              <span className="line-clamp-1">{client.name}</span>
            </h3>
            <div className="text-slate-500 font-medium text-xs flex items-center gap-1.5 mt-1.5 ml-1">
              <Phone size={12} className="text-slate-400" />
              {client.phone}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-0.5 bg-slate-50/50 rounded-full p-0.5 border border-slate-100/50">
              <button 
                onClick={handleEditClick}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-white shadow-sm transition-colors"
                title="Edit Client"
              >
                <Edit2 size={13} />
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-full hover:bg-white shadow-sm transition-colors disabled:opacity-50"
                title="Delete Client"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide border ${
              client.requirement === 'Buy' 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200/50' 
                : 'bg-purple-50 text-purple-700 border-purple-200/50'
            }`}>
              TO {client.requirement.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-4 pt-4 border-t border-slate-100/80">
          <div className="flex items-center text-slate-800 text-sm font-bold">
            <IndianRupee size={14} className="mr-1.5 text-indigo-400" />
            Budget: <span className="ml-1 tracking-tight text-indigo-700">{client.budget.toLocaleString('en-IN')}</span>
          </div>
          
          {client.preferred_locations?.length > 0 && (
            <div className="flex items-start text-slate-500 text-xs font-semibold">
              <MapPin size={14} className="mr-1.5 mt-0.5 shrink-0 text-slate-400" />
              <span className="line-clamp-1 leading-tight">
                {client.preferred_locations.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

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

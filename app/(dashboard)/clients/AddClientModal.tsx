'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { createClientRecord } from '@/actions/client.actions'

export function AddClientModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await createClientRecord(formData)
      setIsOpen(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      alert(err.message || 'Failed to add client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 z-40 touch-manipulation"
      >
        <Plus size={24} />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Client">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input name="name" required className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input name="phone" type="tel" required className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirement</label>
              <select name="requirement" className="w-full px-3 py-2 border rounded-lg bg-white">
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <input name="budget" type="number" required placeholder="e.g. 5000000" className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Locations</label>
            <input 
              name="preferred_locations" 
              placeholder="e.g. Downtown, Westside, North End (comma separated)" 
              className="w-full px-3 py-2 border rounded-lg" 
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple locations with commas.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea name="notes" rows={3} className="w-full px-3 py-2 border rounded-lg"></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 mt-4"
          >
            {loading ? 'Saving Client...' : 'Save Client'}
          </button>
        </form>
      </Modal>
    </>
  )
}

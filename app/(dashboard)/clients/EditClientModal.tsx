'use client'

import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { updateClientRecord } from '@/actions/client.actions'

export function EditClientModal({ client, isOpen, onClose }: { client: any, isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await updateClientRecord(client.id, formData)
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to update client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Client Details">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input name="name" defaultValue={client?.name} required className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input name="phone" defaultValue={client?.phone} type="tel" required className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirement</label>
            <select name="requirement" defaultValue={client?.requirement} className="w-full px-3 py-2 border rounded-lg bg-white">
              <option value="Buy">Buy</option>
              <option value="Rent">Rent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
            <input name="budget" defaultValue={client?.budget} type="number" required placeholder="e.g. 5000000" className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Locations</label>
          <input 
            name="preferred_locations" 
            defaultValue={client?.preferred_locations?.join(', ')}
            placeholder="e.g. Downtown, Westside, North End (comma separated)" 
            className="w-full px-3 py-2 border rounded-lg" 
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple locations with commas.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea name="notes" defaultValue={client?.notes} rows={3} className="w-full px-3 py-2 border rounded-lg"></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 mt-4 transition-all"
        >
          {loading ? 'Saving Changes...' : 'Save Updates'}
        </button>
      </form>
    </Modal>
  )
}

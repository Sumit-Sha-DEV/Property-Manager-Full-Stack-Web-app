'use client'

import { useState, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { updateProperty } from '@/actions/property.actions'

export function EditPropertyModal({ property, isOpen, onClose }: { property: any, isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const totalAllowed = 15 // Current new images allowed
      
      if (images.length + newFiles.length > totalAllowed) {
        alert(`You can only add up to ${totalAllowed} new images at a time.`)
        const remainingSlots = totalAllowed - images.length
        setImages(prev => [...prev, ...newFiles.slice(0, remainingSlots)])
      } else {
        setImages(prev => [...prev, ...newFiles])
      }
      
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      formData.delete('images')
      images.forEach(img => formData.append('images', img))
      
      await updateProperty(property.id, formData)
      setImages([])
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to update property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Property">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Owner Name</label>
            <input name="owner_name" defaultValue={property?.owner_name} required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Mobile Number</label>
            <input name="owner_phone" defaultValue={property?.owner_phone} type="tel" required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Type</label>
            <select name="type" defaultValue={property?.type} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50">
              <option value="Sale">Sale</option>
              <option value="Rent">Rent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Price</label>
            <input name="price" defaultValue={property?.price} type="number" required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Address</label>
          <textarea name="address" defaultValue={property?.address} required rows={2} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50 resize-none"></textarea>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">BHK / Type</label>
            <input name="bhk" defaultValue={property?.configuration?.bhk} placeholder="e.g. 2 BHK" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Area</label>
            <input name="size" defaultValue={property?.configuration?.size} placeholder="1200 sqft" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Floor</label>
            <input name="floor" defaultValue={property?.configuration?.floor} placeholder="4th" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Google Maps Link (Optional)</label>
          <input name="google_map_link" defaultValue={property?.google_map_link} type="url" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Description</label>
          <textarea name="description" defaultValue={property?.description} rows={3} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50 resize-none"></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Add New Images</label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-3">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square overflow-hidden shadow-sm group border border-slate-200 bg-slate-50">
                <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-white/80 backdrop-blur-md p-1 text-rose-500 hover:text-rose-600 hover:bg-white shadow-sm transition-all scale-90 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {images.length < 15 && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-400 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-400 group"
              >
                <Plus size={20} className="group-hover:text-indigo-600 mb-1" />
                <span className="text-[10px] font-medium group-hover:text-gray-600">Add</span>
              </div>
            )}
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleImageChange}
            className="hidden" 
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-4 bg-gray-900 text-white rounded-xl font-semibold shadow-lg hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 focus:ring-4 focus:ring-gray-200 focus:outline-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg transition-all active:scale-95"
        >
          {loading ? 'Saving Changes...' : 'Save Updates'}
        </button>
      </form>
    </Modal>
  )
}

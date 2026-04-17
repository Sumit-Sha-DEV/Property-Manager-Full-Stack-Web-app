'use client'

import { useState, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { createProperty } from '@/actions/property.actions'

export function AddPropertyModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const totalAllowed = 15
      
      if (images.length + newFiles.length > totalAllowed) {
        alert(`You can only upload up to ${totalAllowed} images.`)
        const remainingSlots = totalAllowed - images.length
        setImages(prev => [...prev, ...newFiles.slice(0, remainingSlots)])
      } else {
        setImages(prev => [...prev, ...newFiles])
      }
      
      // Reset input so identical files can be selected again if needed
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
      formData.delete('images') // Remove any default file stream
      images.forEach(img => formData.append('images', img)) // Manually append controlled files
      
      await createProperty(formData)
      setIsOpen(false)
      setImages([])
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      alert(err.message || 'Failed to add property')
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Property">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Owner Name</label>
              <input name="owner_name" required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Mobile Number</label>
              <input name="owner_phone" type="tel" required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Type</label>
              <select name="type" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50">
                <option value="Sale">Sale</option>
                <option value="Rent">Rent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Price</label>
              <input name="price" type="number" required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Address</label>
            <textarea name="address" required rows={2} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50 resize-none"></textarea>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">BHK / Type</label>
              <input name="bhk" placeholder="e.g. 2 BHK" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Area</label>
              <input name="size" placeholder="1200 sqft" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Floor</label>
              <input name="floor" placeholder="4th" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Google Maps Link (Optional)</label>
            <input name="google_map_link" type="url" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Description</label>
            <textarea name="description" rows={3} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-shadow bg-gray-50/50 resize-none"></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Images (Max 15)</label>
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
                  <span className="text-[10px] font-medium group-hover:text-gray-600">Add Image</span>
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
            <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
              <span>{images.length}/15 selected</span>
              {images.length > 0 && <span className="text-gray-400">Click × to remove</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || images.length === 0}
            className="w-full mt-4 py-4 bg-gray-900 text-white rounded-xl font-semibold shadow-lg hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 focus:ring-4 focus:ring-gray-200 focus:outline-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg transition-all active:scale-95"
          >
            {loading ? 'Uploading & Saving...' : 'Save Property'}
          </button>
        </form>
      </Modal>
    </>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, Trash2, Calculator, IndianRupee, MapPin, Bed, Maximize, Film, Video } from 'lucide-react'
import Image from 'next/image'
import { Modal } from '@/components/Modal'
import { updateProperty } from '@/actions/property.actions'
import { numberToWords } from '@/lib/utils/formatters'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const PROPERTY_TYPES = ['Residential', 'Commercial', 'Land/Plot'] as const;

const CATEGORIES = {
  Residential: ['Flat', 'Apartment', 'House', 'Bunglow', 'Penthouse', 'Villa'],
  Commercial: ['Shop', 'Showroom', 'Office Space', 'Warehouse', 'Godown', 'Store'],
  'Land/Plot': ['Residential Plot', 'Commercial Plot', 'Agricultural Land', 'Industrial Land']
};

const FACINGS = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];

export function EditPropertyModal({ property, isOpen, onClose }: { property: any, isOpen: boolean, onClose: () => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Media States
  const [newImages, setNewImages] = useState<File[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [newVideos, setNewVideos] = useState<File[]>([])
  const [videosToDelete, setVideosToDelete] = useState<string[]>([])
  
  // Basic Info States
  const config = property?.configuration || {};
  const [type, setType] = useState<'Sale' | 'Rent'>(property?.type || 'Sale')
  const [propertyType, setPropertyType] = useState<typeof PROPERTY_TYPES[number]>(config.property_type || 'Residential')
  const [category, setCategory] = useState<string>(config.category || CATEGORIES.Residential[0])
  const [price, setPrice] = useState<string>(property?.price?.toString() || '')

  // Area States
  const [superBuiltUp, setSuperBuiltUp] = useState<string>(config.super_built_up || '')
  const [builtUp, setBuiltUp] = useState<string>(config.built_up || '')
  const [carpet, setCarpet] = useState<string>(config.carpet_area || '')
  
  // Real-time Calculators
  const [pricePerSqft, setPricePerSqft] = useState<string>(config.price_per_sqft || '0')
  const [kattha, setKattha] = useState<string>(config.kattha || '0')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  
  const existingImages: { image_url: string }[] = property?.property_images ?? []
  const existingVideos: { video_url: string }[] = property?.property_videos ?? []

  // Auto-calculators logic
  useEffect(() => {
    const p = parseFloat(price)
    const s = parseFloat(superBuiltUp)
    if (p > 0 && s > 0) setPricePerSqft((p / s).toFixed(2))
    else setPricePerSqft('0')
  }, [price, superBuiltUp])

  useEffect(() => {
    const s = parseFloat(superBuiltUp) || parseFloat(builtUp) || parseFloat(carpet) || 0
    if (s > 0) setKattha((s / 720).toFixed(2))
    else setKattha('0')
  }, [superBuiltUp, builtUp, carpet])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const picked = Array.from(e.target.files)
      setNewImages(prev => [...prev, ...picked].slice(0, 15))
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const picked = Array.from(e.target.files)
      setNewVideos(prev => [...prev, ...picked].slice(0, 5))
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewVideo = (index: number) => {
    setNewVideos(prev => prev.filter((_, i) => i !== index))
  }

  const toggleDeleteExistingImage = (url: string) => {
    setImagesToDelete(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    )
  }

  const toggleDeleteExistingVideo = (url: string) => {
    setVideosToDelete(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    // Validate: Need at least 1 image or video remaining/uploaded
    const totalRemainingImages = existingImages.length - imagesToDelete.length + newImages.length
    const totalRemainingVideos = existingVideos.length - videosToDelete.length + newVideos.length
    if (totalRemainingImages === 0 && totalRemainingVideos === 0) {
      toast.error('Please preserve or upload at least one image or video', { id: 'edit-validation' })
      return
    }

    const toastId = toast.loading('Saving property updates...')
    setLoading(true)
    
    try {
      const formElement = e.currentTarget
      const formData = new FormData(formElement)
      
      const newConfig: any = {
        property_type: propertyType,
        category: category,
        super_built_up: superBuiltUp,
        built_up: builtUp,
        carpet_area: carpet,
        price_per_sqft: pricePerSqft
      }

      if (propertyType === 'Residential') {
        newConfig.bhk = formData.get('bhk')
        newConfig.bathrooms = formData.get('bathrooms')
        newConfig.balcony = formData.get('balcony')
        newConfig.facing = formData.get('facing')
        newConfig.total_floors = formData.get('total_floors')
        newConfig.current_floor = formData.get('current_floor')
        if (category === 'House' || category === 'Bunglow') {
          newConfig.used_area = formData.get('used_area')
          newConfig.vacant_land = formData.get('vacant_land')
        }
      } else if (propertyType === 'Commercial') {
        newConfig.bathrooms = formData.get('bathrooms')
        newConfig.bathroom_type = formData.get('bathroom_type')
      } else if (propertyType === 'Land/Plot') {
        newConfig.kattha = kattha
      }

      formData.set('config', JSON.stringify(newConfig))
      
      // Append Images
      formData.delete('images')
      newImages.forEach(img => formData.append('images', img))
      formData.set('imagesToDelete', JSON.stringify(imagesToDelete))

      // Append Videos
      formData.delete('videos')
      newVideos.forEach(vid => formData.append('videos', vid))
      formData.set('videosToDelete', JSON.stringify(videosToDelete))

      await updateProperty(property.id, formData)
      
      toast.success('Property details updated successfully! 🎉', { id: toastId })
      router.refresh()
      
      setNewImages([])
      setImagesToDelete([])
      setNewVideos([])
      setVideosToDelete([])
      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to update property', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Property Listing">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[85vh] overflow-y-auto px-1 pb-4">
        
        {/* Owner Details */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Owner Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Owner Name</label>
              <input name="owner_name" defaultValue={property?.owner_name} required className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number</label>
              <input name="owner_phone" defaultValue={property?.owner_phone} type="tel" required className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm" />
            </div>
          </div>
        </div>

        {/* Listing & Property Types */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Listing Type</label>
            <select name="type" value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm font-medium">
              <option value="Sale">For Sale</option>
              <option value="Rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Property Type</label>
            <select value={propertyType} onChange={(e) => {
              const val = e.target.value as any;
              setPropertyType(val);
              setCategory(CATEGORIES[val as keyof typeof CATEGORIES][0]);
            }} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm font-medium">
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm font-medium">
              {CATEGORIES[propertyType as keyof typeof CATEGORIES].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Facing</label>
            <select name="facing" defaultValue={config.facing} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm font-medium">
              {FACINGS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {/* Areas & Value Calculations */}
        <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50">
          <h3 className="text-[10px] font-bold uppercase text-indigo-400 mb-3 flex items-center gap-2">Area & Values (SQFT)</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-[10px] uppercase text-slate-500 mb-1">Super Built Up</label>
              <input type="number" value={superBuiltUp} onChange={(e) => setSuperBuiltUp(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-sm font-bold text-indigo-700" />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-slate-500 mb-1">Built Up</label>
              <input type="number" value={builtUp} onChange={(e) => setBuiltUp(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-sm" />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-slate-500 mb-1">Carpet Area</label>
              <input type="number" value={carpet} onChange={(e) => setCarpet(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Price</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input name="price" type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full pl-8 pr-4 py-2 border rounded-xl bg-white text-sm font-bold" />
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <div className="bg-white border border-indigo-100 rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Rate/sqft</span>
                <span className="text-sm font-black text-indigo-600">₹{pricePerSqft}</span>
              </div>
            </div>
          </div>
          {price && (
            <p className="text-[9px] text-indigo-500 font-bold mt-2 ml-1 italic">
              {numberToWords(price)} Rupees Only
            </p>
          )}
          {propertyType === 'Land/Plot' && (
            <div className="mt-3 p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between text-[11px] font-bold text-emerald-700">
               <span>Area in Kattha</span>
               <span className="text-sm font-black">{kattha} Kattha</span>
            </div>
          )}
        </div>

        {/* Dynamic Parameter Settings */}
        {propertyType === 'Residential' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">BHK</label>
                <input name="bhk" type="number" defaultValue={config.bhk} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bath</label>
                <input name="bathrooms" type="number" defaultValue={config.bathrooms} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Balcony</label>
                <input name="balcony" type="number" defaultValue={config.balcony} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Floors</label>
                <input name="total_floors" type="number" defaultValue={config.total_floors} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Floor No</label>
                <input name="current_floor" type="number" defaultValue={config.current_floor} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" />
              </div>
            </div>
          </div>
        )}

        {propertyType === 'Commercial' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Bathroom Type</label>
              <select name="bathroom_type" defaultValue={config.bathroom_type} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                <option value="Personal">Personal</option>
                <option value="Shared">Shared</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">No of Baths</label>
              <input name="bathrooms" type="number" defaultValue={config.bathrooms} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" />
            </div>
          </div>
        )}

        {/* Address */}
        <div>
           <label className="block text-[11px] font-bold text-slate-700 mb-1">Exact Address</label>
           <textarea name="address" defaultValue={property?.address} required rows={2} className="w-full px-3 py-2 border rounded-xl text-sm resize-none bg-white"></textarea>
        </div>

        <div className="grid grid-cols-2 gap-3 items-end">
          <div className="col-span-1">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Google Maps Link</label>
            <input name="google_map_link" defaultValue={property?.google_map_link} type="url" placeholder="Paste link here" className="w-full px-3 py-2 border rounded-xl bg-white text-sm" />
          </div>
          <div className="col-span-1">
             <label className="block text-[11px] font-bold text-slate-700 mb-1">Short Description</label>
             <input name="description" defaultValue={property?.description} className="w-full px-3 py-2 border rounded-xl bg-white text-sm" />
          </div>
        </div>

        {/* ─── PHOTOS MANAGEMENT ─── */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-100/50 space-y-4">
          <label className="block text-[10px] md:text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-widest flex items-center gap-2">
            <Film size={14} className="text-indigo-600" />
            Saved Photos
          </label>
          
          {/* Existing Images Delete View */}
          {existingImages.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {existingImages.map((img, idx) => {
                const isDeleted = imagesToDelete.includes(img.image_url);
                return (
                  <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border bg-white ${isDeleted ? 'opacity-30 border-rose-500' : 'border-slate-200'}`}>
                    <Image src={img.image_url} alt="existing property image" fill className="object-cover" />
                    <button 
                      type="button" 
                      onClick={() => toggleDeleteExistingImage(img.image_url)} 
                      className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity ${isDeleted ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                      title={isDeleted ? "Undo Delete" : "Remove Photo"}
                    >
                       <Trash2 size={16} className={isDeleted ? "text-rose-400" : "text-white"} />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 italic">No photos saved yet.</p>
          )}

          {/* New Photo Upload Section */}
          <div className="space-y-2 pt-2 border-t border-blue-100/50">
            <span className="block text-[10px] font-extrabold uppercase text-slate-400">Add New Photos</span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {newImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <img src={URL.createObjectURL(img)} alt="preview photo" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 text-rose-500 shadow-sm active:scale-90 transition-all"><X size={12} /></button>
                </div>
              ))}
              {existingImages.length - imagesToDelete.length + newImages.length < 15 && (
                <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-indigo-300 rounded-xl flex items-center justify-center text-indigo-400 cursor-pointer hover:bg-white active:scale-95 transition-all"><Plus size={20} /></div>
              )}
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
        </div>

        {/* ─── VIDEOS MANAGEMENT ─── */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 p-4 rounded-2xl border border-purple-100/50 space-y-4">
          <label className="block text-[10px] md:text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-widest flex items-center gap-2">
            <Video size={14} className="text-purple-600" />
            Saved Videos
          </label>

          {/* Existing Videos Delete View */}
          {existingVideos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {existingVideos.map((vid, idx) => {
                const isDeleted = videosToDelete.includes(vid.video_url);
                return (
                  <div key={idx} className={`relative aspect-video rounded-xl overflow-hidden border bg-black flex items-center justify-center ${isDeleted ? 'opacity-30 border-rose-500' : 'border-slate-200'}`}>
                    <video src={vid.video_url} className="w-full h-full object-cover" muted playsInline />
                    <button 
                      type="button" 
                      onClick={() => toggleDeleteExistingVideo(vid.video_url)} 
                      className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity ${isDeleted ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                      title={isDeleted ? "Undo Delete" : "Remove Video"}
                    >
                       <Trash2 size={18} className={isDeleted ? "text-rose-400" : "text-white"} />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 italic">No videos saved yet.</p>
          )}

          {/* New Video Upload Section */}
          <div className="space-y-2 pt-2 border-t border-purple-100/50">
            <span className="block text-[10px] font-extrabold uppercase text-slate-400">Add New Videos</span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {newVideos.map((vid, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                  <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                    <Video size={18} className="text-purple-600" />
                  </div>
                  <button type="button" onClick={() => removeNewVideo(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 text-rose-500 shadow-sm active:scale-90 transition-all"><X size={12} /></button>
                </div>
              ))}
              {existingVideos.length - videosToDelete.length + newVideos.length < 5 && (
                <div onClick={() => videoInputRef.current?.click()} className="aspect-square border-2 border-dashed border-purple-300 rounded-xl flex items-center justify-center text-purple-400 cursor-pointer hover:bg-white active:scale-95 transition-all"><Plus size={20} /></div>
              )}
            </div>
            <input ref={videoInputRef} type="file" multiple accept="video/*" className="hidden" onChange={handleVideoChange} />
          </div>
        </div>

        {/* Submit */}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm shadow-xl hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
        >
          {loading ? 'Saving Changes...' : 'Confirm Updates'}
        </button>
      </form>
    </Modal>
  )
}

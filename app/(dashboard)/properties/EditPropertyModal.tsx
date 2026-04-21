'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, Trash2, Calculator, IndianRupee, MapPin, Bed, Bath } from 'lucide-react'
import Image from 'next/image'
import { Modal } from '@/components/Modal'
import { updateProperty } from '@/actions/property.actions'
import { numberToWords } from '@/lib/utils/formatters'

const PROPERTY_TYPES = ['Residential', 'Commercial', 'Land/Plot'] as const;

const CATEGORIES = {
  Residential: ['Flat', 'Apartment', 'House', 'Bunglow', 'Penthouse', 'Villa'],
  Commercial: ['Shop', 'Showroom', 'Office Space', 'Warehouse', 'Godown', 'Store'],
  'Land/Plot': ['Residential Plot', 'Commercial Plot', 'Agricultural Land', 'Industrial Land']
};

const FACINGS = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];

export function EditPropertyModal({ property, isOpen, onClose }: { property: any, isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [newImages, setNewImages] = useState<File[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  
  // Dynamic Structure States initialized from property.configuration
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
  const existingImages: { image_url: string }[] = property?.property_images ?? []

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

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const toggleDeleteExisting = (url: string) => {
    setImagesToDelete(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
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
      formData.delete('images')
      newImages.forEach(img => formData.append('images', img))
      formData.set('imagesToDelete', JSON.stringify(imagesToDelete))

      await updateProperty(property.id, formData)
      setNewImages([])
      setImagesToDelete([])
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to update property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Property Listing">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1 pb-4">
        
        {/* Basic Info */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-4">
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

        {/* Areas & Pricing */}
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
          {propertyType === 'Land/Plot' && (
            <div className="mt-3 p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between text-[11px] font-bold text-emerald-700">
               <span>Area in Kattha</span>
               <span className="text-sm font-black">{kattha} Kattha</span>
            </div>
          )}
        </div>

        {/* Dynamic Details */}
        {propertyType === 'Residential' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold">BHK</label>
                <input name="bhk" type="number" defaultValue={config.bhk} className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-[11px] font-bold">Bath</label>
                <input name="bathrooms" type="number" defaultValue={config.bathrooms} className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-[11px] font-bold">Balcony</label>
                <input name="balcony" type="number" defaultValue={config.balcony} className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold">Total Floors</label>
                <input name="total_floors" type="number" defaultValue={config.total_floors} className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-[11px] font-bold">Floor No</label>
                <input name="current_floor" type="number" defaultValue={config.current_floor} className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
            </div>
          </div>
        )}

        {propertyType === 'Commercial' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold">Bathroom Type</label>
              <select name="bathroom_type" defaultValue={config.bathroom_type} className="w-full px-3 py-2 border rounded-xl text-sm">
                <option value="Personal">Personal</option>
                <option value="Shared">Shared</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold">No of Baths</label>
              <input name="bathrooms" type="number" defaultValue={config.bathrooms} className="w-full px-3 py-2 border rounded-xl text-sm" />
            </div>
          </div>
        )}

        {/* Locations */}
        <div>
           <label className="block text-[11px] font-bold mb-1">Address</label>
           <textarea name="address" defaultValue={property?.address} required rows={2} className="w-full px-3 py-2 border rounded-xl text-sm resize-none"></textarea>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-2 tracking-widest">Saved Photos</label>
            <div className="grid grid-cols-5 gap-2">
              {existingImages.map((img, idx) => {
                const isDeleted = imagesToDelete.includes(img.image_url);
                return (
                  <div key={idx} className={`relative aspect-square rounded-lg overflow-hidden border ${isDeleted ? 'opacity-30 border-rose-500' : 'border-slate-200'}`}>
                    <Image src={img.image_url} alt="env" fill className="object-cover" />
                    <button type="button" onClick={() => toggleDeleteExisting(img.image_url)} className={`absolute inset-0 flex items-center justify-center bg-black/20 text-white ${isDeleted ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                       <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* New Images */}
        <div>
          <label className="block text-[11px] font-bold mb-2 uppercase">Add New Photos</label>
          <div className="grid grid-cols-5 gap-2">
            {newImages.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                <img src={URL.createObjectURL(img)} alt="pre" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 text-rose-500"><X size={12} /></button>
              </div>
            ))}
            {newImages.length < 15 && (
              <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-slate-300 cursor-pointer hover:bg-slate-50"><Plus size={20} /></div>
            )}
          </div>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleImageChange} />
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all">
          {loading ? 'Saving Changes...' : 'Confirm Updates'}
        </button>
      </form>
    </Modal>
  )
}

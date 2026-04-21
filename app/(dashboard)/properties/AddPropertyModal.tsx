'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, Calculator, IndianRupee, MapPin, Bed, Bath, Layers } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { createProperty } from '@/actions/property.actions'
import { numberToWords } from '@/lib/utils/formatters'
import { toast } from 'sonner'

const PROPERTY_TYPES = ['Residential', 'Commercial', 'Land/Plot'] as const;

const CATEGORIES = {
  Residential: ['Flat', 'Apartment', 'House', 'Bunglow', 'Penthouse', 'Villa'],
  Commercial: ['Shop', 'Showroom', 'Office Space', 'Warehouse', 'Godown', 'Store'],
  'Land/Plot': ['Residential Plot', 'Commercial Plot', 'Agricultural Land', 'Industrial Land']
};

const FACINGS = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];

export function AddPropertyModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [price, setPrice] = useState<string>('')
  
  // Dynamic Structure States
  const [type, setType] = useState<'Sale' | 'Rent'>('Sale')
  const [propertyType, setPropertyType] = useState<typeof PROPERTY_TYPES[number]>('Residential')
  const [category, setCategory] = useState<string>(CATEGORIES.Residential[0])
  
  // Area States for calculation
  const [superBuiltUp, setSuperBuiltUp] = useState<string>('')
  const [builtUp, setBuiltUp] = useState<string>('')
  const [carpet, setCarpet] = useState<string>('')
  
  // Real-time Calculators
  const [pricePerSqft, setPricePerSqft] = useState<string>('0')
  const [kattha, setKattha] = useState<string>('0')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate Price Per Sqft
  useEffect(() => {
    const p = parseFloat(price)
    const s = parseFloat(superBuiltUp)
    if (p > 0 && s > 0) {
      setPricePerSqft((p / s).toFixed(2))
    } else {
      setPricePerSqft('0')
    }
  }, [price, superBuiltUp])

  // Calculate Kattha (for Land)
  useEffect(() => {
    const s = parseFloat(superBuiltUp) || parseFloat(builtUp) || parseFloat(carpet) || 0
    if (s > 0) {
      setKattha((s / 720).toFixed(2))
    } else {
      setKattha('0')
    }
  }, [superBuiltUp, builtUp, carpet])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages(prev => [...prev, ...newFiles].slice(0, 15))
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formElement = e.currentTarget
    const formData = new FormData(formElement)
    
    // Optimistic UI: Close and Toast instantly
    setIsOpen(false)
    const toastId = toast.loading('Publishing elite property listing...')
    
    try {
      const config: any = {
        property_type: propertyType,
        category: category,
        super_built_up: superBuiltUp,
        built_up: builtUp,
        carpet_area: carpet,
        price_per_sqft: pricePerSqft
      }

      // Collect type-specific fields
      if (propertyType === 'Residential') {
        config.bhk = formData.get('bhk')
        config.bathrooms = formData.get('bathrooms')
        config.balcony = formData.get('balcony')
        config.facing = formData.get('facing')
        config.total_floors = formData.get('total_floors')
        config.current_floor = formData.get('current_floor')
        if (category === 'House' || category === 'Bunglow') {
          config.used_area = formData.get('used_area')
          config.vacant_land = formData.get('vacant_land')
        }
      } else if (propertyType === 'Commercial') {
        config.bathrooms = formData.get('bathrooms')
        config.bathroom_type = formData.get('bathroom_type')
      } else if (propertyType === 'Land/Plot') {
        config.kattha = kattha
      }

      formData.set('config', JSON.stringify(config))
      formData.delete('images')
      images.forEach(img => formData.append('images', img))
      
      await createProperty(formData)
      toast.success('Property listing is live!', { id: toastId })
      setImages([])
      formElement.reset()
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish property', { id: toastId })
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 z-40"
      >
        <Plus size={24} />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Property Listing">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1 pb-4">
          
          {/* Owner Details Section */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Owner Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Owner Name</label>
                <input name="owner_name" required className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Mobile Number</label>
                <input name="owner_phone" type="tel" required className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm" />
              </div>
            </div>
          </div>

          {/* Property Classification */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Listing Type</label>
              <select 
                name="type" 
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm font-medium"
              >
                <option value="Sale">For Sale</option>
                <option value="Rent">For Rent</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Property Type</label>
              <select 
                value={propertyType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setPropertyType(val);
                  setCategory(CATEGORIES[val as keyof typeof CATEGORIES][0]);
                }}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm font-medium"
              >
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm font-medium"
              >
                {CATEGORIES[propertyType as keyof typeof CATEGORIES].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Facing</label>
              <select name="facing" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm font-medium">
                {FACINGS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Area Section */}
          <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2">
              <Calculator size={12} />
              Area & Pricing (SQFT)
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-tight">Super Built Up</label>
                <input 
                  type="number" 
                  value={superBuiltUp}
                  onChange={(e) => setSuperBuiltUp(e.target.value)}
                  placeholder="Sqft" 
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none bg-white text-sm font-bold text-indigo-700 placeholder:font-normal placeholder:text-slate-300" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-tight">Built Up</label>
                <input 
                  type="number" 
                  value={builtUp}
                  onChange={(e) => setBuiltUp(e.target.value)}
                  placeholder="Sqft" 
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-tight">Carpet Area</label>
                <input 
                  type="number" 
                  value={carpet}
                  onChange={(e) => setCarpet(e.target.value)}
                  placeholder="Sqft" 
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Total Listing Price</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input 
                    name="price" 
                    type="number" 
                    required 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm font-bold" 
                  />
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <div className="bg-white/60 border border-indigo-100 rounded-xl px-3 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Rate/Sqft</span>
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
              <div className="mt-3 p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Total Area in Kattha (Approx)</span>
                <span className="text-sm font-black text-emerald-700">{kattha} Kattha</span>
              </div>
            )}
          </div>

          {/* Conditional Sections based on Property Type */}
          
          {propertyType === 'Residential' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Bedrooms</label>
                  <input name="bhk" type="number" placeholder="BHK" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Bathrooms</label>
                  <input name="bathrooms" type="number" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Balcony</label>
                  <input name="balcony" type="number" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Building Floors</label>
                  <input name="total_floors" type="number" placeholder="e.g. 4" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Property Floor</label>
                  <input name="current_floor" type="number" placeholder="0 = Ground" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm" />
                </div>
              </div>

              {(category === 'House' || category === 'Bunglow') && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Used Area</label>
                    <input name="used_area" type="number" placeholder="Sqft" className="w-full px-3 py-2 border rounded-lg bg-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Vacant Land</label>
                    <input name="vacant_land" type="number" placeholder="Sqft" className="w-full px-3 py-2 border rounded-lg bg-white text-sm" />
                  </div>
                </div>
              )}
            </div>
          )}

          {propertyType === 'Commercial' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bathroom Type</label>
                <select name="bathroom_type" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm">
                  <option value="Personal">Personal</option>
                  <option value="Shared">Shared</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">No of Bathrooms</label>
                <input name="bathrooms" type="number" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:outline-none bg-white text-sm" />
              </div>
            </div>
          )}

          {/* Location & Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Exact Address</label>
            <textarea name="address" required rows={2} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm resize-none"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="col-span-1">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Google Maps Link</label>
              <input name="google_map_link" type="url" placeholder="Paste link here" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm" />
            </div>
            <div className="col-span-1">
               <label className="block text-[11px] font-bold text-slate-700 mb-1">Short Description</label>
               <input name="description" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm" />
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-widest">Property Photos (Max 15)</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-200">
                  <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-rose-500 shadow-sm"><X size={12} /></button>
                </div>
              ))}
              {images.length < 15 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <Plus size={20} />
                  <span className="text-[10px] mt-1">Add</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          <button
            type="submit"
            disabled={loading || images.length === 0}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? 'Processing Property...' : 'List Property Now'}
          </button>
        </form>
      </Modal>
    </>
  )
}

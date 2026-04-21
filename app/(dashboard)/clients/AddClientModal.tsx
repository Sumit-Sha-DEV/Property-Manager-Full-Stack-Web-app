'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { createClientRecord } from '@/actions/client.actions'
import { numberToWords } from '@/lib/utils/formatters'
import { toast } from 'sonner'

const PROPERTY_TYPES = ['Residential', 'Commercial', 'Land/Plot'] as const;

const CATEGORIES = {
  Residential: ['Flat', 'Individual House', 'Bunglow', 'Villa', 'Penthouse'],
  Commercial: ['Store', 'Vacant Space', 'Showroom Space', 'Office Space', 'Warehouse'],
  'Land/Plot': ['Residential Plot', 'Commercial Plot', 'Industrial Land', 'Mixed Use (Comm & Res)']
};

const BHK_OPTIONS = ['1', '2', '3', '4', '5+'];

export function AddClientModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [budget, setBudget] = useState<string>('')
  
  // Requirement Classification States
  const [propertyType, setPropertyType] = useState<typeof PROPERTY_TYPES[number]>('Residential')
  const [category, setCategory] = useState<string>(CATEGORIES.Residential[0])
  const [requiredArea, setRequiredArea] = useState<string>('')
  const [selectedBHK, setSelectedBHK] = useState<string[]>([])

  const toggleBHK = (val: string) => {
    setSelectedBHK(prev => 
      prev.includes(val) ? prev.filter(b => b !== val) : [...prev, val]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formElement = e.currentTarget
    const formData = new FormData(formElement)
    
    // Optimistic UI: Close and Toast instantly
    setIsOpen(false)
    const toastId = toast.loading('Creating elite client profile...')
    
    try {
      const config = {
        property_type: propertyType,
        category: category,
        required_area: requiredArea,
        bhk: selectedBHK
      }
      
      formData.set('config', JSON.stringify(config))
      
      await createClientRecord(formData)
      toast.success('Client profile created successfully', { id: toastId })
      setBudget('')
      setRequiredArea('')
      setSelectedBHK([])
      formElement.reset()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create client', { id: toastId })
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
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[80vh] overflow-y-auto px-1 pb-4">
          
          {/* Section 1: Identity */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-4">
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Basic Information</h3>
             <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Client Name</label>
                <input name="name" required className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Mobile Number</label>
                <input name="phone" type="tel" required className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm" />
              </div>
            </div>
          </div>

          {/* Section 2: Requirement Details */}
          <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50 space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Requirement Classification</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Looking to</label>
                <select name="requirement" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm font-medium">
                  <option value="Buy">Buy Property</option>
                  <option value="Rent">Rent Property</option>
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
                    setSelectedBHK([]); // Clear BHK if changing type
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Required Area (Sqft)</label>
                <input 
                  type="number"
                  value={requiredArea}
                  onChange={(e) => setRequiredArea(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm font-bold text-indigo-700" 
                />
              </div>
            </div>

            {/* Conditional BHK Multi-Select */}
            {propertyType === 'Residential' && (
              <div className="space-y-2 pt-1 border-t border-indigo-100/50 mt-1">
                <label className="block text-[11px] font-bold text-slate-700 tracking-wide">Preferred BHK (Select multiple)</label>
                <div className="flex flex-wrap gap-2">
                  {BHK_OPTIONS.map(bhk => {
                    const active = selectedBHK.includes(bhk);
                    return (
                      <button
                        key={bhk}
                        type="button"
                        onClick={() => toggleBHK(bhk)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                          active 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {bhk} BHK
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Financials & Location */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Max Budget (₹)</label>
              <input 
                name="budget" 
                type="number" 
                required 
                placeholder="e.g. 5000000" 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:outline-none bg-white text-sm font-black text-indigo-600" 
              />
              {budget && (
                <p className="text-[10px] text-indigo-600 font-bold mt-2 ml-1 italic tracking-wide uppercase bg-indigo-50/50 py-1 px-2 rounded-lg inline-block border border-indigo-100/50">
                  {numberToWords(budget)} Rupees Only
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Preferred Locations</label>
              <input 
                name="preferred_locations" 
                placeholder="e.g. Downtown, Westside, North End" 
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm" 
              />
              <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Separate multiple locations with commas.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 tracking-wide">Additional Notes</label>
              <textarea name="notes" rows={3} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-sm"></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 disabled:opacity-50 mt-4 transition-all active:scale-[0.98]"
          >
            {loading ? 'Creating Client Profile...' : 'Create Client Profile'}
          </button>
        </form>
      </Modal>
    </>
  )
}

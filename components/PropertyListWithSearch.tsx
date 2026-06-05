'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Search, SlidersHorizontal, RefreshCw, ArrowUpDown } from 'lucide-react'
import { PropertyCard } from './PropertyCard'

interface PropertyListItem {
  id: string
  owner_name: string
  type: 'Rent' | 'Sale'
  price: number
  address: string
  configuration: Record<string, any>
  property_images: Array<{ image_url: string }>
  created_at: string
}

export function PropertyListWithSearch({ properties }: { properties: PropertyListItem[] }) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'All' | 'Sale' | 'Rent'>('All')
  const [bhkFilter, setBhkFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Debounce search input to avoid filtering and re-rendering on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput)
    }, 200)

    return () => {
      clearTimeout(handler)
    }
  }, [searchInput])

  // Reset all filters
  const handleReset = useCallback(() => {
    setSearchInput('')
    setSearch('')
    setTypeFilter('All')
    setBhkFilter('All')
    setSortBy('newest')
  }, [])

  // Process filters and sorting
  const filteredAndSorted = useMemo(() => {
    let result = [...properties]

    // 1. Search text filter
    if (search.trim() !== '') {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.address.toLowerCase().includes(q) ||
          p.owner_name.toLowerCase().includes(q) ||
          (p.configuration?.category && p.configuration.category.toLowerCase().includes(q)) ||
          (p.configuration?.property_type && p.configuration.property_type.toLowerCase().includes(q))
      )
    }

    // 2. Listing Type filter
    if (typeFilter !== 'All') {
      result = result.filter((p) => p.type === typeFilter)
    }

    // 3. BHK filter
    if (bhkFilter !== 'All') {
      result = result.filter((p) => {
        const bhk = p.configuration?.bhk
        if (!bhk) return false
        if (bhkFilter === '4+') {
          return parseInt(bhk) >= 4
        }
        return String(bhk) === bhkFilter
      })
    }

    // 4. Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }, [properties, search, typeFilter, bhkFilter, sortBy])

  return (
    <div className="space-y-6">
      {/* ─── Search Bar ─── */}
      <div className="bg-white/80 backdrop-blur-2xl p-3.5 rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-indigo-50/50 flex flex-col gap-3">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-4 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by address, owner, category..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-12 py-3 bg-slate-50/60 hover:bg-slate-50 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-100 transition-all text-sm font-semibold"
          />
          {(searchInput || typeFilter !== 'All' || bhkFilter !== 'All' || sortBy !== 'newest') && (
            <button
              onClick={handleReset}
              className="absolute right-4 text-indigo-500 hover:text-indigo-700 active:scale-90 transition-all"
              title="Reset Filters"
            >
              <RefreshCw size={16} className="animate-spin-once" />
            </button>
          )}
        </div>

        {/* ─── Quick Filter Tabs & Toggle ─── */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-50">
          <div className="flex bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/30">
            {(['All', 'Sale', 'Rent'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTypeFilter(tab)}
                className={`px-4 py-1.5 rounded-[10px] text-xs font-black uppercase tracking-wider transition-all ${
                  typeFilter === tab
                    ? 'bg-white text-indigo-600 shadow-[0_2px_8px_rgba(79,70,229,0.1)]'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'All' ? 'All' : tab === 'Sale' ? 'Buy' : 'Rent'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              showAdvanced || bhkFilter !== 'All' || sortBy !== 'newest'
                ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
        </div>

        {/* ─── Advanced Filters Section (BHK & Sorting) ─── */}
        {(showAdvanced || bhkFilter !== 'All' || sortBy !== 'newest') && (
          <div className="space-y-4 pt-3 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* BHK Selection */}
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Room Preference</span>
              <div className="flex flex-wrap gap-1.5">
                {['All', '1', '2', '3', '4+'].map((chip) => {
                  const label = chip === 'All' ? 'All BHK' : chip === '4+' ? '4+ BHK' : `${chip} BHK`
                  const val = chip === '4+' ? '4+' : chip
                  const isSelected = bhkFilter === val
                  return (
                    <button
                      key={chip}
                      onClick={() => setBhkFilter(val)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-slate-50/50 border-slate-100 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sorting Selection */}
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Sort By</span>
              <div className="flex gap-2">
                {[
                  { id: 'newest', label: 'Newest First' },
                  { id: 'price-asc', label: 'Price: Low to High' },
                  { id: 'price-desc', label: 'Price: High to Low' },
                ].map((sortOption) => {
                  const isSelected = sortBy === sortOption.id
                  return (
                    <button
                      key={sortOption.id}
                      onClick={() => setSortBy(sortOption.id as any)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-[10px] font-black uppercase tracking-tight text-center transition-all ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-100 text-indigo-600 font-extrabold'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {sortOption.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Properties Grid Listing ─── */}
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredAndSorted.map((prop, index) => (
            <PropertyCard key={prop.id} property={prop} priority={index < 4} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <p className="text-slate-500 font-semibold">No matching properties found.</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 active:scale-95 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

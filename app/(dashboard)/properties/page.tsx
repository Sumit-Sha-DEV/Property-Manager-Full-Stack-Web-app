import { createClient } from '@/lib/supabase/server'
import { PropertyCard } from '@/components/PropertyCard'
import { AddPropertyModal } from './AddPropertyModal'
import { Suspense } from 'react'
import { PropertyListSkeleton } from '@/components/skeletons/PropertyListSkeleton'

async function PropertyList() {
  const supabase = await createClient()
  
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      *,
      property_images ( image_url )
    `)
    .order('created_at', { ascending: false })

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-gray-500 font-medium">No properties yet.</p>
        <p className="text-sm text-gray-400 mt-1">Click the + button below to add one.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {properties.map((prop, index) => (
        <PropertyCard key={prop.id} property={prop} priority={index < 4} />
      ))}
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <div className="pb-8 relative">
      <div className="mb-6 text-center">
        <p className="text-slate-500 text-sm font-medium italic tracking-wide">Manage your internal property listings</p>
      </div>

      <Suspense fallback={<PropertyListSkeleton />}>
        <PropertyList />
      </Suspense>

      <AddPropertyModal />
    </div>
  )
}

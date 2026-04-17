import { createClient } from '@/lib/supabase/server'
import { PropertyCard } from '@/components/PropertyCard'
import { AddPropertyModal } from './AddPropertyModal'

export default async function PropertiesPage() {
  const supabase = await createClient()
  
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      *,
      property_images ( image_url )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="pb-8 relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Properties</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your internal property listings</p>
      </div>

      {properties?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-medium">No properties yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click the + button below to add one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {properties?.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}

      <AddPropertyModal />
    </div>
  )
}

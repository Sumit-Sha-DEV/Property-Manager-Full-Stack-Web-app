import { PropertyListWithSearch } from '@/components/PropertyListWithSearch'
import { Suspense } from 'react'
import { PropertyListSkeleton } from '@/components/skeletons/PropertyListSkeleton'
import { getPropertiesList } from '@/actions/optimized-queries'
import dynamic from 'next/dynamic'

const AddPropertyModal = dynamic(() => import('./AddPropertyModal').then(mod => mod.AddPropertyModal))

// ISR: Revalidate every 30 seconds for fresh data
export const revalidate = 30

async function PropertyList() {
  // Use optimized query with pagination
  const { data: properties, error } = await getPropertiesList(50, 0)

  if (error || !properties || properties.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-gray-500 font-medium">No properties yet.</p>
        <p className="text-sm text-gray-400 mt-1">Click the + button below to add one.</p>
      </div>
    )
  }

  return <PropertyListWithSearch properties={properties} />
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

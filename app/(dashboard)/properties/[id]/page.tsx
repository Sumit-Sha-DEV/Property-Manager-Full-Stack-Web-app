import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, IndianRupee, Bed, Maximize, Layers, Phone, User, ArrowLeft, ExternalLink } from 'lucide-react'
import { PropertyActions } from './PropertyActions'
import { PropertyImageGallery } from './PropertyImageGallery'

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  // Fetch Property
  const { data: property, error } = await supabase
    .from('properties')
    .select('*, property_images(image_url)')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !property) {
    return notFound()
  }

  const images = property.property_images?.map((img: any) => img.image_url) || []
  const mainImage = images[0] || '/placeholder.png'

  return (
    <div className="pb-24 max-w-2xl mx-auto min-h-screen bg-gray-50/50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-3xl border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <Link href="/properties" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <span className="font-semibold text-gray-900 text-sm">Property Details</span>
        <PropertyActions property={property} />
      </header>

      <PropertyImageGallery images={images} propertyType={property.type} />

      <div className="p-5 space-y-6">
        <div>
          <div className="flex items-center text-gray-900 font-bold text-2xl tracking-tight mb-2">
            <IndianRupee size={24} className="mr-0.5" />
            {property.price.toLocaleString('en-IN')}
          </div>
          <div className="flex items-start text-gray-500 text-base font-medium">
            <MapPin size={18} className="mr-2 mt-0.5 shrink-0 text-gray-400" />
            <span className="leading-relaxed">{property.address}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Bed size={20} className="mb-2 text-blue-500" />
            <span className="text-xs text-gray-500 font-medium mb-0.5">BHK</span>
            <span className="font-semibold text-gray-900">{property.configuration?.bhk || '-'}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Maximize size={20} className="mb-2 text-green-500" />
            <span className="text-xs text-gray-500 font-medium mb-0.5">Area</span>
            <span className="font-semibold text-gray-900">{property.configuration?.size || '-'}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Layers size={20} className="mb-2 text-purple-500" />
            <span className="text-xs text-gray-500 font-medium mb-0.5">Floor</span>
            <span className="font-semibold text-gray-900">{property.configuration?.floor || '-'}</span>
          </div>
        </div>

        {property.description && (
          <div className="space-y-2 pt-2">
            <h3 className="font-semibold text-gray-900">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              {property.description}
            </p>
          </div>
        )}

        <div className="pt-2">
          <h3 className="font-semibold text-gray-900 mb-3">Owner Details</h3>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                <User size={18} className="text-gray-500" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Name</div>
                <div className="font-semibold text-gray-900">{property.owner_name}</div>
              </div>
            </div>
            
            <a href={`tel:${property.owner_phone}`} className="flex items-center gap-3 active:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100 text-green-600">
                <Phone size={18} />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Mobile (Call)</div>
                <div className="font-semibold text-gray-900">{property.owner_phone}</div>
              </div>
            </a>
          </div>
        </div>

        {property.google_map_link && (
          <a
            href={property.google_map_link} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-2xl font-semibold hover:bg-blue-100 transition-colors"
          >
            <span className="flex items-center gap-2"><MapPin size={18} /> Open in Google Maps</span>
            <ExternalLink size={18} />
          </a>
        )}
      </div>
    </div>
  )
}

import { IndianRupee, MapPin } from 'lucide-react'

export function PropertyListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="bg-white/90 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-indigo-50/50 overflow-hidden relative p-1.5 animate-pulse rounded-xl"
        >
          {/* Image Skeleton */}
          <div className="relative h-44 w-full bg-slate-200 rounded-lg"></div>

          {/* Content Skeleton */}
          <div className="p-3 flex justify-between items-start gap-2">
            <div className="space-y-3 flex-1 pr-1">
              {/* Price */}
              <div className="h-6 w-32 bg-slate-200 rounded-md"></div>
              
              {/* Address */}
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-200 shrink-0" />
                <div className="h-4 w-48 bg-slate-200 rounded-md"></div>
              </div>

              {/* Badges */}
              <div className="flex gap-1.5 pt-1">
                <div className="h-6 w-16 bg-slate-200 rounded-md"></div>
                <div className="h-6 w-16 bg-slate-200 rounded-md"></div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-1.5 shrink-0 mt-0.5">
              <div className="h-7 w-7 bg-slate-200 rounded-full"></div>
              <div className="h-7 w-7 bg-slate-200 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

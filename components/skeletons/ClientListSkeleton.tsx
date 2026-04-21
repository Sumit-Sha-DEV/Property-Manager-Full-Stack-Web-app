import { IndianRupee, MapPin, Phone, User } from 'lucide-react'

export function ClientListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="bg-white/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-indigo-50/50 p-4 relative animate-pulse"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 pr-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-slate-200 rounded-full shrink-0"></div>
                <div className="h-6 w-32 bg-slate-200 rounded-md"></div>
              </div>
              <div className="flex items-center gap-1.5 ml-1">
                <Phone size={12} className="text-slate-200" />
                <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className="flex gap-1 bg-slate-50/50 rounded-full border border-slate-100/50">
                <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
                <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
              </div>
              <div className="h-4 w-16 bg-slate-200 rounded-full"></div>
            </div>
          </div>

          <div className="space-y-3 mt-4 pt-4 border-t border-slate-100/80">
            <div className="flex items-center">
              <IndianRupee size={14} className="mr-1.5 text-slate-200" />
              <div className="h-5 w-28 bg-slate-200 rounded-md"></div>
            </div>
            
            <div className="flex items-start">
              <MapPin size={14} className="mr-1.5 mt-0.5 shrink-0 text-slate-200" />
              <div className="h-4 w-40 bg-slate-200 rounded-md"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

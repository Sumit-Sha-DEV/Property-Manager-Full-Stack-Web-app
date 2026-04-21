'use client'

import { MapPin, Phone, MessageSquare, Share2 } from 'lucide-react'

export function PropertyDetailSkeleton() {
  return (
    <div className="h-[100dvh] flex flex-col bg-white overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div className="h-6 w-32 bg-slate-100 rounded-lg"></div>
        <div className="h-4 w-12 bg-slate-100 rounded-full"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Gallery Placeholder */}
        <div className="aspect-square w-full bg-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/0 to-slate-100/50"></div>
        </div>

        {/* Info Area */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-slate-100 rounded-xl"></div>
            <div className="h-5 w-1/2 bg-slate-50 rounded-lg"></div>
            
            {/* Chips Placeholder */}
            <div className="flex gap-2 pt-2">
              <div className="h-8 w-20 bg-slate-50 rounded-xl"></div>
              <div className="h-8 w-24 bg-slate-50 rounded-xl"></div>
              <div className="h-8 w-16 bg-slate-50 rounded-xl"></div>
            </div>

            {/* Description Placeholder */}
            <div className="space-y-2 pt-6">
              <div className="h-4 w-full bg-slate-50 rounded"></div>
              <div className="h-4 w-5/6 bg-slate-50 rounded"></div>
              <div className="h-4 w-4/6 bg-slate-50 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar Skeleton */}
      <div className="p-4 pt-2 bg-white/95 backdrop-blur-xl border-t border-slate-100 shrink-0">
        <div className="grid grid-cols-3 gap-3">
          <div className="h-12 bg-slate-100 rounded-2xl"></div>
          <div className="h-12 bg-slate-100 rounded-2xl"></div>
          <div className="h-12 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
}

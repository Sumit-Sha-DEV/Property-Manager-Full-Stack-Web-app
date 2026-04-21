'use client'

import { useEffect } from 'react'
import { RefreshCw, AlertCircle, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to an observability service if available
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-6 border border-rose-100 shadow-sm animate-pulse">
        <AlertCircle size={40} className="text-rose-500" />
      </div>
      
      <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Something went wrong</h2>
      <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8 font-medium italic">
        We encountered an error while loading this page. This might be due to a connectivity issue.
      </p>

      <div className="flex flex-col w-full gap-3 max-w-xs">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all"
        >
          <RefreshCw size={16} />
          Retry Connection
        </button>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 active:scale-[0.98] transition-all"
        >
          <Home size={16} />
          Return Dashboard
        </Link>
      </div>
      
      <p className="mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        Error ID: {error.digest || 'UNKNOWN_FAILURE'}
      </p>
    </div>
  )
}

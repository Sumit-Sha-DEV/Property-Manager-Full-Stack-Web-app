import Link from 'next/link'
import { Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gray-50/50">
      <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-200 rotate-12 hover:rotate-0 transition-transform duration-500">
        <Search size={48} className="text-white" />
      </div>
      
      <h1 className="text-6xl font-black text-slate-800 tracking-tighter mb-4">404</h1>
      <h2 className="text-xl font-bold text-slate-700 mb-4 tracking-tight">Property Not Found</h2>
      <p className="text-slate-500 text-sm max-w-xs mx-auto mb-10 font-medium italic">
        The page you are looking for might have been moved, deleted, or never existed in our listings.
      </p>

      <Link
        href="/"
        className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-[0.95] transition-all"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
      
      <div className="mt-12 opacity-30">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">SS Property Consultancy</p>
      </div>
    </div>
  )
}

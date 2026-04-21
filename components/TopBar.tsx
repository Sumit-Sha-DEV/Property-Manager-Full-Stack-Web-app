'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export function TopBar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignOut = async () => {
    toast.info('Goodbye! Logging you out securely...', { duration: 2500 })
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  // Determine dynamic title
  const getTitle = () => {
    if (pathname.includes('/clients')) return pathname.endsWith('/clients') ? 'Clients' : 'Client Profile';
    if (pathname.includes('/properties')) return pathname.endsWith('/properties') ? 'Properties' : 'Property Details';
    return 'SS Properties'; // Default fallback
  }

  // Determine if we should show the back button
  // Show it if we are deeper than one level (e.g., /properties/[id] or /clients/[id])
  const showBack = pathname !== '/properties' && pathname !== '/clients' && pathname !== '/'

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-50/50 flex items-center justify-between px-4 sm:px-6 h-16 shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
      <div className="flex items-center gap-4">
        {showBack && (
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center rounded-full transition-all active:scale-90 touch-manipulation"
            style={{ 
              width: '38px', height: '38px',
              background: 'rgba(79, 70, 229, 0.08)',
              color: '#4f46e5',
              border: '1px solid rgba(79, 70, 229, 0.15)',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.05)'
            }}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="font-extrabold text-xl tracking-tight text-slate-800 drop-shadow-sm flex items-center gap-2">
          {!showBack && <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm shrink-0"></span>}
          <span className="truncate">{getTitle()}</span>
        </div>
      </div>
      <button 
        onClick={handleSignOut}
        className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all rounded-full hover:bg-slate-100/80 active:scale-95 touch-manipulation"
      >
        <LogOut size={20} />
      </button>
    </header>
  )
}

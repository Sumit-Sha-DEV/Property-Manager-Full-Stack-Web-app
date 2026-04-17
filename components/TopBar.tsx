'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function TopBar() {
  const router = useRouter()
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

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-50/50 flex items-center justify-between px-6 h-16 shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
      <div className="font-extrabold text-xl tracking-tight text-slate-800 drop-shadow-sm flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm shrink-0"></span>
        <span className="truncate">SS Property Consultancy</span>
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

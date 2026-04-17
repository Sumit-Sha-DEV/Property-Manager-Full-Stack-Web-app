'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Settings } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: '/properties', label: 'Properties', icon: Home },
    { href: '/clients', label: 'Clients', icon: Users },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-3xl border-t border-indigo-50/50 pb-[env(safe-area-inset-bottom)] sm:hidden z-50 shadow-[0_-10px_40px_rgb(0,0,0,0.06)]">
      <div className="flex justify-around items-center h-16 pt-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-all touch-manipulation active:scale-[0.92] ${
                isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-400'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 rounded-b-full shadow-[0_2px_8px_rgba(79,70,229,0.4)]"></div>
              )}
              <Icon size={24} className={isActive ? 'stroke-[2.5px] mb-0.5' : 'stroke-[1.5px] mb-0.5'} />
              <span className={`text-[10px] ${isActive ? 'font-extrabold' : 'font-medium'}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

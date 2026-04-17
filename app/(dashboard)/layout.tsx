import { BottomNav } from '@/components/BottomNav'
import { TopBar } from '@/components/TopBar'

import { WelcomeToast } from './WelcomeToast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 pb-[env(safe-area-inset-bottom)] sm:pb-0 relative">
      <TopBar />
      <WelcomeToast />
      <main className="max-w-2xl mx-auto p-4 pb-28">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

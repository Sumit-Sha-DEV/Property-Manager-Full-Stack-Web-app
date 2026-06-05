import { ClientCard } from '@/components/ClientCard'
import { Suspense } from 'react'
import { ClientListSkeleton } from '@/components/skeletons/ClientListSkeleton'
import { getClientsList } from '@/actions/optimized-queries'
import dynamic from 'next/dynamic'

const AddClientModal = dynamic(() => import('./AddClientModal').then(mod => mod.AddClientModal))

// ISR: Revalidate every 30 seconds for fresh data
export const revalidate = 30

async function ClientList() {
  // Use optimized query with pagination
  const { data: clients, error } = await getClientsList(50, 0)

  if (error || !clients || clients.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-gray-500 font-medium">No clients yet.</p>
        <p className="text-sm text-gray-400 mt-1">Click the + button below to add one.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  )
}

export default function ClientsPage() {
  return (
    <div className="pb-8 relative">
      <div className="mb-6 text-center">
        <p className="text-slate-500 text-sm font-medium italic tracking-wide">Manage client requirements and budgets</p>
      </div>

      <Suspense fallback={<ClientListSkeleton />}>
        <ClientList />
      </Suspense>

      <AddClientModal />
    </div>
  )
}

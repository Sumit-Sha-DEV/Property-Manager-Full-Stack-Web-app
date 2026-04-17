import { createClient } from '@/lib/supabase/server'
import { ClientCard } from '@/components/ClientCard'
import { AddClientModal } from './AddClientModal'

export default async function ClientsPage() {
  const supabase = await createClient()
  
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="pb-8 relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clients</h1>
        <p className="text-gray-500 text-sm mt-1">Manage client requirements and budgets</p>
      </div>

      {clients?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-medium">No clients yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click the + button below to add one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {clients?.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      <AddClientModal />
    </div>
  )
}

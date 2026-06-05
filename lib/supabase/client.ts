import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Performance optimizations
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      // Global fetch options for better connection handling
      global: {
        fetch: (...args) => fetch(...args),
        headers: {
          'Connection': 'keep-alive',
        },
      },
    }
  )
}

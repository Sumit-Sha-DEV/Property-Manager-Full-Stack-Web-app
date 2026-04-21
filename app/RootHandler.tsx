'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Handles Supabase auth redirects that land on the root page.
 * Supabase sends recovery/confirmation tokens to the Site URL (http://localhost:3000)
 * in two formats:
 *   PKCE flow:     /?code=xxxx  (query parameter, handled server-side)
 *   Implicit flow: /#access_token=xxxx&type=recovery  (hash fragment, handled here client-side)
 */
export function RootHandler() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash

    if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
      // Implicit flow: forward the entire hash to the confirm page
      router.replace('/auth/confirm' + hash)
    } else {
      // No special token — normal redirect to the app
      router.replace('/properties')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </div>
  )
}

import { redirect } from 'next/navigation'
import { RootHandler } from './RootHandler'

/**
 * Root page smart handler:
 *
 * Supabase redirects recovery/confirmation tokens to this app's Site URL,
 * which is configured in the Supabase dashboard (default: http://localhost:3000).
 * Two formats can arrive here:
 *
 *   1. PKCE flow   → /?code=xxxx            (detected server-side via searchParams)
 *   2. Implicit    → /#access_token=xxxx    (detected client-side via RootHandler)
 *
 * We forward them both to /auth/confirm which handles the actual token exchange.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const code = params.code

  // PKCE recovery: forward code to confirm page immediately (server-side redirect)
  if (code) {
    redirect(`/auth/confirm?code=${encodeURIComponent(code)}`)
  }

  // For hash fragment tokens (implicit flow), we need client-side detection via RootHandler.
  // RootHandler will either forward to /auth/confirm or redirect to /properties.
  return <RootHandler />
}

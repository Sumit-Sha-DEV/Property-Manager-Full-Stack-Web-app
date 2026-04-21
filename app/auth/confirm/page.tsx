'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react'

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // --- Strategy 1: PKCE flow (?code=xxxx in URL query params) ---
    // This works when the email link is opened in the SAME browser that requested the reset,
    // because the PKCE code_verifier is stored in that browser's localStorage.
    const code = searchParams.get('code')

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchError }) => {
        if (exchError) {
          // --- Strategy 2: Fallback - try hash fragment tokens ---
          // This handles cases where the email link is opened in a different browser,
          // or when Supabase uses the implicit (non-PKCE) flow.
          tryHashStrategy(supabase)
        } else {
          setSessionReady(true)
        }
      })
      return
    }

    // --- Strategy 2: Implicit flow (#access_token=xxx in URL hash) ---
    // Supabase sometimes sends tokens as URL hash fragments instead of query params.
    tryHashStrategy(supabase)
  }, [searchParams])

  function tryHashStrategy(supabase: ReturnType<typeof createBrowserClient>) {
    if (typeof window === 'undefined') return

    const hash = window.location.hash
    if (!hash) {
      setError('Invalid or expired reset link. Please go back and request a new one.')
      return
    }

    // Parse the hash: #access_token=xxx&refresh_token=xxx&type=recovery
    const hashParams = new URLSearchParams(hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token') ?? ''
    const type = hashParams.get('type')

    if (accessToken && type === 'recovery') {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error: sessError }: { error: { message: string } | null }) => {
        if (sessError) {
          setError('This reset link has expired. Please request a new one — links are only valid for 1 hour.')
        } else {
          setSessionReady(true)
        }
      })
    } else {
      setError('Invalid or expired reset link. Please go back and request a new one.')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError(null)

    // Update password directly via browser client (session is already set)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      // Sign out first to force a clean login after reset
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  if (error && !sessionReady) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h2 className="font-semibold text-gray-900">Link Expired</h2>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => router.push('/login')}
          className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Back to Login
        </button>
      </div>
    )
  }

  if (!sessionReady) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-gray-500">Verifying reset link...</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck size={24} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Set New Password</h1>
        <p className="text-sm text-gray-500 mt-1">Choose a strong new password for your account.</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="new-password">
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 bg-white"
              placeholder="Min. 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm-password">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              name="confirm"
              type={showConfirm ? 'text' : 'password'}
              required
              minLength={6}
              className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 bg-white"
              placeholder="Re-enter password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}

export default function AuthConfirmPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <Suspense fallback={
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          </div>
        }>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}

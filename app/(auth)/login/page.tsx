'use client'

import { useState } from 'react'
import { login, signup, updatePassword } from './actions'
import { Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

type Mode = 'login' | 'signup' | 'forgot'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function reset() {
    setError(null)
    setMessage(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    reset()

    const formData = new FormData(e.currentTarget)

    if (mode === 'login') {
      const result = await login(formData)
      if (result?.error) setError(result.error)
    } else if (mode === 'signup') {
      const result = await signup(formData)
      if (result?.error) setError(result.error)
      else if (result?.success) {
        setMessage(result.message || 'Registration successful')
        setMode('login')
      }
    } else if (mode === 'forgot') {
      // CRITICAL: Must call from browser client so PKCE code_verifier is stored in localStorage
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const email = formData.get('email') as string
      const origin = window.location.origin
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/confirm`,
      })
      if (resetError) {
        setError(resetError.message)
      } else {
        setMessage('If this email is registered, you will receive a reset link shortly. Check your inbox (and spam folder).')
      }
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-sm border border-gray-100">

        {/* Header */}
        <div className="mb-6">
          {mode !== 'login' && (
            <button
              type="button"
              onClick={() => { setMode('login'); reset() }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 -ml-1"
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          )}
          <h1 className="text-2xl font-semibold text-center text-gray-900">
            {mode === 'login' && 'Agent Login'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h1>
          {mode === 'forgot' && (
            <p className="text-center text-sm text-gray-500 mt-1">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          )}
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg flex items-start gap-2">
            <Mail size={16} className="mt-0.5 shrink-0" />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 bg-white"
              placeholder="agent@example.com"
            />
          </div>

          {/* Password — hidden on forgot mode */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); reset() }}
                    className="text-xs text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-gray-900 bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
          >
            {loading
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In'
              : mode === 'signup'
              ? 'Create Account'
              : 'Send Reset Link'}
          </button>
        </form>

        {/* Bottom toggle (only on login/signup) */}
        {mode !== 'forgot' && (
          <div className="mt-6 text-center text-sm text-gray-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); reset() }}
              className="text-gray-900 font-bold hover:underline focus:outline-none p-2 -m-2"
            >
              {mode === 'login' ? 'Register' : 'Log In'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

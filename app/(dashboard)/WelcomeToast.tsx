'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function WelcomeToast() {
  useEffect(() => {
    const hasWelcomed = sessionStorage.getItem('welcomed')
    if (!hasWelcomed) {
      toast.success('Welcome back to SS Property Consultancy! ✨', {
        description: 'Have a productive day ahead.',
        duration: 4000
      })
      sessionStorage.setItem('welcomed', 'true')
    }
  }, [])
  return null
}

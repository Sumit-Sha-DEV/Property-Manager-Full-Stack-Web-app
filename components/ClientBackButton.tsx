'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ReactNode } from 'react'

interface ClientBackButtonProps {
  className?: string
  style?: React.CSSProperties
  iconSize?: number
  children?: ReactNode
}

export function ClientBackButton({ className, style, iconSize = 20, children }: ClientBackButtonProps) {
  const router = useRouter()
  
  return (
    <button 
      onClick={() => router.back()}
      className={className}
      style={style}
    >
      <ArrowLeft size={iconSize} />
      {children}
    </button>
  )
}

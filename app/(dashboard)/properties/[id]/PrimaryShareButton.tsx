'use client'

import { useState } from 'react'
import { Share2, MessageCircle, Loader2, Copy, Check } from 'lucide-react'
import { sharePropertyDetails, shareToWhatsApp, shareMediaToWhatsApp, copyPropertyShareLink } from '@/lib/utils/share.utils'

export function PrimaryShareButton({ property }: { property: any }) {
  const [isSharing, setIsSharing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleNativeShare = async () => {
    setIsSharing(true)
    try {
      const result = await sharePropertyDetails(property)
      if (result.success && result.copied) {
        alert('Sharing not supported on this browser. Property details copied to clipboard!')
      }
    } finally {
      setIsSharing(false)
    }
  }

  const handleWhatsAppShare = () => {
    setIsSharing(true)
    try {
      shareToWhatsApp(property)
    } finally {
      setIsSharing(false)
      setShowMenu(false)
    }
  }

  const handleMediaShare = () => {
    setIsSharing(true)
    try {
      shareMediaToWhatsApp(property)
    } finally {
      setIsSharing(false)
      setShowMenu(false)
    }
  }

  const handleCopyToClipboard = () => {
    const result = copyPropertyShareLink(property)
    if (result.success) {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const hasMedia = (property.property_images?.length || 0) + (property.property_videos?.length || 0) > 0

  return (
    <div className="relative">
      {showMenu && (
        <button 
          onClick={() => setShowMenu(false)} 
          className="fixed inset-0 z-40" 
        />
      )}
      
      <div className="flex gap-2 flex-col sm:flex-row">
        {/* Primary Share Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isSharing}
          className="flex items-center justify-center gap-2 py-2 px-4 sm:px-5 sm:py-3.5 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 z-50 relative"
          style={{ 
            background: 'linear-gradient(135deg, #e2e0f5 0%, #bbc3ff 100%)', 
            color: '#0c0d1b',
            boxShadow: '0 4px 15px rgba(187, 195, 255, 0.3)'
          }}
        >
          {isSharing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Wait...</span>
            </>
          ) : (
            <>
              <Share2 size={14} fill="currentColor" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* Share Menu Dropdown */}
      {showMenu && (
        <div 
          className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 min-w-max"
          style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
        >
          {/* Native Share */}
          <button
            onClick={handleNativeShare}
            disabled={isSharing}
            className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 transition-colors disabled:opacity-50"
          >
            <Share2 size={16} className="text-indigo-600" />
            Native Share
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            disabled={isSharing}
            className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-green-50 border-b border-gray-100 flex items-center gap-3 transition-colors disabled:opacity-50"
          >
            <MessageCircle size={16} className="text-green-600" fill="currentColor" />
            WhatsApp Message
          </button>

          {/* WhatsApp Media Share */}
          {hasMedia && (
            <button
              onClick={handleMediaShare}
              disabled={isSharing}
              className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-green-50 border-b border-gray-100 flex items-center gap-3 transition-colors disabled:opacity-50"
            >
              <MessageCircle size={16} className="text-green-600" fill="currentColor" />
              WhatsApp w/ Photos & Videos
            </button>
          )}

          {/* Copy Link */}
          <button
            onClick={handleCopyToClipboard}
            className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
          >
            {isCopied ? (
              <>
                <Check size={16} className="text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} className="text-blue-600" />
                Copy to Clipboard
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

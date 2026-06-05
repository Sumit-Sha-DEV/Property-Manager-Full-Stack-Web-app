'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'

export function PropertyVideoGallery({ videos }: { videos: Array<{ video_url: string; duration_seconds?: number | null }> }) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  if (!videos || videos.length === 0) {
    return null
  }

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Videos Section */}
      <div className="mt-4 shrink-0">
        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-indigo-300/80 mb-3 px-1">
          📹 Property Videos ({videos.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-1">
          {videos.map((video, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedVideo(video.video_url)}
              className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-md hover:shadow-lg transition-shadow border border-indigo-500/30 group"
            >
              {/* Video Thumbnail Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                <Play size={32} className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all" fill="currentColor" />
              </div>

              {/* Duration Badge */}
              {video.duration_seconds && (
                <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-[8px] font-bold text-white">
                  {formatDuration(video.duration_seconds)}
                </div>
              )}

              {/* Index Badge */}
              <div className="absolute top-1.5 left-1.5 bg-indigo-600/80 backdrop-blur px-1.5 py-0.5 rounded text-[8px] font-bold text-white">
                {idx + 1}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-0">
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X size={24} className="text-white" />
          </button>

          <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl">
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full h-full bg-black"
            />
          </div>
        </div>
      )}
    </>
  )
}

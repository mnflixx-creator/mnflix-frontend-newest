/**
 * HLS Player using HLS.js
 */

import Hls from 'hls.js'
import { useEffect, useRef, useState } from 'react'
import { Subtitle } from '../../../types/player'

interface HLSPlayerProps {
  src: string
  subtitles?: Subtitle[]
  currentSubtitle?: Subtitle | null
  onReady?: (video: HTMLVideoElement) => void
  onError?: (error: string) => void
  className?: string
}

export function HLSPlayer({ 
  src, 
  subtitles = [],
  currentSubtitle,
  onReady, 
  onError, 
  className 
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isHlsSupported, setIsHlsSupported] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      })

      hlsRef.current = hls

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        onReady?.(video)
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('HLS network error, trying to recover...')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('HLS media error, trying to recover...')
              hls.recoverMediaError()
              break
            default:
              console.error('HLS fatal error:', data)
              onError?.('Failed to load video stream')
              hls.destroy()
              break
          }
        }
      })

      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src
      setIsHlsSupported(true)
      onReady?.(video)
    } else {
      setIsHlsSupported(false)
      onError?.('HLS is not supported in your browser')
    }
  }, [src, onReady, onError])

  if (!isHlsSupported) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-white text-lg mb-2">HLS not supported</p>
          <p className="text-gray-400">Please use a modern browser</p>
        </div>
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      className={className}
      playsInline
      preload="metadata"
    >
      {subtitles.map((subtitle, index) => (
        <track
          key={index}
          kind={subtitle.kind}
          src={subtitle.url}
          srcLang={subtitle.language}
          label={subtitle.label}
          default={currentSubtitle?.url === subtitle.url}
        />
      ))}
    </video>
  )
}

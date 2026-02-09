/**
 * Native Video Player for MP4 and other native formats
 */

import { useEffect, useRef } from 'react'

interface VideoPlayerProps {
  src: string
  onReady?: (video: HTMLVideoElement) => void
  onError?: (error: string) => void
  className?: string
}

export function VideoPlayer({ src, onReady, onError, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      onReady?.(video)
    }

    const handleError = () => {
      onError?.('Failed to load video')
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
    }
  }, [onReady, onError])

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      playsInline
      preload="metadata"
    />
  )
}

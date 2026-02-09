/**
 * Native Video Player for MP4 and other native formats
 */

import { useEffect, useRef } from 'react'
import { Subtitle } from '../../../types/player'

interface VideoPlayerProps {
  src: string
  subtitles?: Subtitle[]
  currentSubtitle?: Subtitle | null
  onReady?: (video: HTMLVideoElement) => void
  onError?: (error: string) => void
  className?: string
}

export function VideoPlayer({ 
  src, 
  subtitles = [],
  currentSubtitle,
  onReady, 
  onError, 
  className 
}: VideoPlayerProps) {
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

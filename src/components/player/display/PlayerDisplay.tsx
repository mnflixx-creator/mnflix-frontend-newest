/**
 * Player display factory - selects appropriate player based on source type
 */

import { HLSPlayer } from './HLSPlayer'
import { VideoPlayer } from './VideoPlayer'
import { Subtitle } from '../../../types/player'

interface PlayerDisplayProps {
  src: string
  type?: string
  subtitles?: Subtitle[]
  currentSubtitle?: Subtitle | null
  onReady?: (video: HTMLVideoElement) => void
  onError?: (error: string) => void
  className?: string
}

export function PlayerDisplay({ 
  src, 
  type, 
  subtitles,
  currentSubtitle,
  onReady, 
  onError, 
  className 
}: PlayerDisplayProps) {
  // Determine player type based on URL or explicit type
  const isHLS = type === 'hls' || 
                src.includes('.m3u8') || 
                src.includes('/hls/') ||
                src.includes('application/vnd.apple.mpegurl')

  if (isHLS) {
    return (
      <HLSPlayer
        src={src}
        subtitles={subtitles}
        currentSubtitle={currentSubtitle}
        onReady={onReady}
        onError={onError}
        className={className}
      />
    )
  }

  return (
    <VideoPlayer
      src={src}
      subtitles={subtitles}
      currentSubtitle={currentSubtitle}
      onReady={onReady}
      onError={onError}
      className={className}
    />
  )
}

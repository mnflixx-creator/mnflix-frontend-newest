export interface StreamSource {
  id: number
  name: string
  url: string
  provider: string
  quality: string
}

export interface Subtitle {
  url: string
  label: string
  language: string
  kind: 'subtitles' | 'captions'
}

export interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isFullscreen: boolean
  buffering: boolean
  playbackSpeed: number
  currentQuality: string
  currentSubtitle: Subtitle | null
}

export interface PlayerControls {
  play: () => void
  pause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleFullscreen: () => void
  setPlaybackSpeed: (speed: number) => void
  setQuality: (quality: string) => void
  setSubtitle: (subtitle: Subtitle | null) => void
}

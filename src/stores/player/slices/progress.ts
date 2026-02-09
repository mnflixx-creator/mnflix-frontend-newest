/**
 * Progress slice - Playback state and time tracking
 */

export interface ProgressSlice {
  // Playback state
  isPlaying: boolean
  isPaused: boolean
  isBuffering: boolean
  isSeeking: boolean
  
  // Time tracking
  currentTime: number
  duration: number
  bufferedTime: number
  
  // Playback controls
  volume: number
  isMuted: boolean
  playbackSpeed: number
  
  // Actions
  play: () => void
  pause: () => void
  togglePlay: () => void
  setPlaying: (playing: boolean) => void
  setBuffering: (buffering: boolean) => void
  setSeeking: (seeking: boolean) => void
  
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setBufferedTime: (time: number) => void
  seek: (time: number) => void
  
  setVolume: (volume: number) => void
  toggleMute: () => void
  setMuted: (muted: boolean) => void
  setPlaybackSpeed: (speed: number) => void
  
  // Helper methods
  getProgress: () => number
  getBufferedProgress: () => number
}

export const createProgressSlice = (set: any, get: any): ProgressSlice => ({
  isPlaying: false,
  isPaused: true,
  isBuffering: false,
  isSeeking: false,
  
  currentTime: 0,
  duration: 0,
  bufferedTime: 0,
  
  volume: 1,
  isMuted: false,
  playbackSpeed: 1,
  
  play: () => set({ isPlaying: true, isPaused: false }),
  pause: () => set({ isPlaying: false, isPaused: true }),
  togglePlay: () => set((state: ProgressSlice) => ({ 
    isPlaying: !state.isPlaying,
    isPaused: state.isPlaying 
  })),
  setPlaying: (playing: boolean) => set({ 
    isPlaying: playing, 
    isPaused: !playing 
  }),
  setBuffering: (buffering: boolean) => set({ isBuffering: buffering }),
  setSeeking: (seeking: boolean) => set({ isSeeking: seeking }),
  
  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration }),
  setBufferedTime: (time: number) => set({ bufferedTime: time }),
  seek: (time: number) => set({ currentTime: time, isSeeking: true }),
  
  setVolume: (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    set({ volume: clampedVolume, isMuted: clampedVolume === 0 })
  },
  toggleMute: () => set((state: ProgressSlice) => ({ 
    isMuted: !state.isMuted 
  })),
  setMuted: (muted: boolean) => set({ isMuted: muted }),
  setPlaybackSpeed: (speed: number) => set({ playbackSpeed: speed }),
  
  getProgress: () => {
    const state = get() as ProgressSlice
    return state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0
  },
  
  getBufferedProgress: () => {
    const state = get() as ProgressSlice
    return state.duration > 0 ? (state.bufferedTime / state.duration) * 100 : 0
  },
})

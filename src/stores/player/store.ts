/**
 * Main player store combining all slices
 */

import { create } from 'zustand'
import { createInterfaceSlice, InterfaceSlice } from './slices/interface'
import { createSourceSlice, SourceSlice } from './slices/source'
import { createProgressSlice, ProgressSlice } from './slices/progress'
import { createCaptionSlice, CaptionSlice } from './slices/caption'

export type PlayerStore = InterfaceSlice & SourceSlice & ProgressSlice & CaptionSlice

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...createInterfaceSlice(set),
  ...createSourceSlice(set, get),
  ...createProgressSlice(set, get),
  ...createCaptionSlice(set),
}))

// Export individual hooks for convenience
export const usePlayerInterface = () => usePlayerStore((state) => ({
  controlsVisible: state.controlsVisible,
  showControls: state.showControls,
  hideControls: state.hideControls,
  isFullscreen: state.isFullscreen,
  isTheaterMode: state.isTheaterMode,
  toggleFullscreen: state.toggleFullscreen,
  toggleTheaterMode: state.toggleTheaterMode,
  setFullscreen: state.setFullscreen,
  isLoading: state.isLoading,
  error: state.error,
  setLoading: state.setLoading,
  setError: state.setError,
  showSettings: state.showSettings,
  toggleSettings: state.toggleSettings,
}))

export const usePlayerSource = () => usePlayerStore((state) => ({
  mediaId: state.mediaId,
  mediaTitle: state.mediaTitle,
  mediaType: state.mediaType,
  sources: state.sources,
  currentSource: state.currentSource,
  availableQualities: state.availableQualities,
  currentQuality: state.currentQuality,
  subtitles: state.subtitles,
  currentSubtitle: state.currentSubtitle,
  setMediaInfo: state.setMediaInfo,
  setSources: state.setSources,
  setCurrentSource: state.setCurrentSource,
  setQuality: state.setQuality,
  setSubtitles: state.setSubtitles,
  setCurrentSubtitle: state.setCurrentSubtitle,
  getSourceByQuality: state.getSourceByQuality,
}))

export const usePlayerProgress = () => usePlayerStore((state) => ({
  isPlaying: state.isPlaying,
  isPaused: state.isPaused,
  isBuffering: state.isBuffering,
  isSeeking: state.isSeeking,
  currentTime: state.currentTime,
  duration: state.duration,
  bufferedTime: state.bufferedTime,
  volume: state.volume,
  isMuted: state.isMuted,
  playbackSpeed: state.playbackSpeed,
  play: state.play,
  pause: state.pause,
  togglePlay: state.togglePlay,
  setPlaying: state.setPlaying,
  setBuffering: state.setBuffering,
  setSeeking: state.setSeeking,
  setCurrentTime: state.setCurrentTime,
  setDuration: state.setDuration,
  setBufferedTime: state.setBufferedTime,
  seek: state.seek,
  setVolume: state.setVolume,
  toggleMute: state.toggleMute,
  setMuted: state.setMuted,
  setPlaybackSpeed: state.setPlaybackSpeed,
  getProgress: state.getProgress,
  getBufferedProgress: state.getBufferedProgress,
}))

export const usePlayerCaption = () => usePlayerStore((state) => ({
  captionsEnabled: state.captionsEnabled,
  availableCaptions: state.availableCaptions,
  selectedCaption: state.selectedCaption,
  fontSize: state.fontSize,
  fontColor: state.fontColor,
  backgroundColor: state.backgroundColor,
  enableCaptions: state.enableCaptions,
  disableCaptions: state.disableCaptions,
  toggleCaptions: state.toggleCaptions,
  setAvailableCaptions: state.setAvailableCaptions,
  selectCaption: state.selectCaption,
  setFontSize: state.setFontSize,
  setFontColor: state.setFontColor,
  setBackgroundColor: state.setBackgroundColor,
}))

/**
 * Video events hook - handles all video element events
 */

import { useEffect } from 'react'
import { usePlayerStore } from '../../../stores/player/store'

export function useVideoEvents(videoRef: React.RefObject<HTMLVideoElement>) {
  const {
    setPlaying,
    setCurrentTime,
    setDuration,
    setBufferedTime,
    setBuffering,
    setSeeking,
    setVolume,
    setMuted,
    setError,
  } = usePlayerStore()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setPlaying(true)
    const handlePause = () => setPlaying(false)
    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleDurationChange = () => setDuration(video.duration)
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setMuted(video.muted)
    }
    const handleWaiting = () => setBuffering(true)
    const handleCanPlay = () => setBuffering(false)
    const handleSeeking = () => setSeeking(true)
    const handleSeeked = () => setSeeking(false)
    const handleError = () => {
      setError('Failed to play video. Please try another source.')
    }
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const buffered = video.buffered.end(video.buffered.length - 1)
        setBufferedTime(buffered)
      }
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('volumechange', handleVolumeChange)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('seeking', handleSeeking)
    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('error', handleError)
    video.addEventListener('progress', handleProgress)

    // Initialize volume
    video.volume = 1
    video.muted = false

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('volumechange', handleVolumeChange)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('seeking', handleSeeking)
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('error', handleError)
      video.removeEventListener('progress', handleProgress)
    }
  }, [
    videoRef,
    setPlaying,
    setCurrentTime,
    setDuration,
    setBufferedTime,
    setBuffering,
    setSeeking,
    setVolume,
    setMuted,
    setError,
  ])
}

/**
 * Player Component - Main video player component
 */

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerDisplay } from './display'
import { PlayButton } from './atoms/PlayButton'
import { ProgressBar } from './atoms/ProgressBar'
import { VolumeControl } from './atoms/VolumeControl'
import { QualitySelector } from './atoms/QualitySelector'
import { SubtitleSelector } from './atoms/SubtitleSelector'
import { FullscreenButton } from './atoms/FullscreenButton'
import { SettingsMenu } from './atoms/SettingsMenu'
import { LoadingSpinner } from './atoms/LoadingSpinner'
import { ErrorDisplay } from './atoms/ErrorDisplay'
import { usePlayerStore } from '../../stores/player/store'
import { useVideoEvents } from './hooks/useVideoEvents'
import { useKeyboard } from './hooks/useKeyboard'
import { useFullscreen } from './hooks/useFullscreen'
import { getZenflifyMovieStreams } from '../../services/zenflify'
import type { StreamSource } from '../../types/player'

interface PlayerComponentProps {
  movieId: string
  title: string
  poster?: string
  onBack?: () => void
}

export function PlayerComponent({
  movieId,
  title,
  onBack,
}: PlayerComponentProps) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  
  const [videoReady, setVideoReady] = useState(false)

  const {
    // Interface
    controlsVisible,
    showControls,
    hideControls,
    isFullscreen,
    isLoading,
    error,
    setLoading,
    setError,
    showSettings,
    toggleSettings,
    
    // Source
    currentSource,
    availableQualities,
    currentQuality,
    subtitles,
    currentSubtitle,
    setMediaInfo,
    setSources,
    setQuality,
    setCurrentSubtitle,
    setSubtitles,
    
    // Progress
    isPlaying,
    currentTime,
    duration,
    bufferedTime,
    volume,
    isMuted,
    playbackSpeed,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackSpeed,
  } = usePlayerStore()

  // Hooks
  useVideoEvents(videoRef)
  useKeyboard()
  const { toggleFullscreen: handleFullscreenToggle } = useFullscreen(containerRef)

  // Load streaming sources
  useEffect(() => {
    async function loadStreams() {
      try {
        setLoading(true)
        setError(null)
        setMediaInfo(movieId, title, 'movie')

        const data = await getZenflifyMovieStreams(parseInt(movieId), title)
        
        if (!data.streams && !data.sources) {
          throw new Error('No streams available for this content')
        }

        const streams = (data.streams || data.sources || []) as StreamSource[]
        
        if (streams.length === 0) {
          throw new Error('No streams available')
        }

        setSources(streams)
        
        // Set subtitles if available
        if (data.subtitles && data.subtitles.length > 0) {
          setSubtitles(data.subtitles)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Failed to load streams:', err)
        setError(err instanceof Error ? err.message : 'Failed to load video')
        setLoading(false)
      }
    }

    loadStreams()
  }, [movieId, title, setLoading, setError, setMediaInfo, setSources, setSubtitles])

  // Control video playback from store
  useEffect(() => {
    if (!videoRef.current || !videoReady) return

    if (isPlaying) {
      videoRef.current.play().catch((err) => {
        console.error('Play failed:', err)
      })
    } else {
      videoRef.current.pause()
    }
  }, [isPlaying, videoReady])

  // Control volume from store
  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.volume = volume
    videoRef.current.muted = isMuted
  }, [volume, isMuted])

  // Control playback speed from store
  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = playbackSpeed
  }, [playbackSpeed])

  // Control seeking from store
  useEffect(() => {
    if (!videoRef.current || !videoReady) return
    if (Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime
    }
  }, [currentTime, videoReady])

  // Auto-hide controls
  useEffect(() => {
    if (controlsVisible && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        hideControls()
      }, 3000)
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [controlsVisible, isPlaying, hideControls])

  const handleMouseMove = () => {
    showControls()
  }

  const handleVideoClick = () => {
    togglePlay()
  }

  const handleVideoReady = (video: HTMLVideoElement) => {
    if (videoRef.current !== video) {
      // Update the ref indirectly
      Object.defineProperty(videoRef, 'current', {
        value: video,
        writable: true,
        configurable: true
      })
    }
    setVideoReady(true)
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  const handleRetry = () => {
    window.location.reload()
  }

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        onRetry={handleRetry}
        onBack={handleBack}
      />
    )
  }

  if (isLoading || !currentSource) {
    return <LoadingSpinner />
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Video Player */}
      <div className="absolute inset-0" onClick={handleVideoClick}>
        <PlayerDisplay
          src={currentSource.url}
          onReady={handleVideoReady}
          onError={(err) => setError(err)}
          className="w-full h-full object-contain"
        />
        
        {/* Subtitle track */}
        {currentSubtitle && videoRef.current && (
          <track
            kind="subtitles"
            src={currentSubtitle.url}
            srcLang={currentSubtitle.language}
            label={currentSubtitle.label}
            default
          />
        )}
      </div>

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-white/10 rounded-full transition"
            aria-label="Go back"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          
          <div className="flex-1 px-4">
            <h1 className="text-white text-xl font-bold truncate">{title}</h1>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            buffered={bufferedTime}
            onSeek={seek}
            className="mb-4"
          />

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlayButton isPlaying={isPlaying} onClick={togglePlay} />
              <VolumeControl
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={setVolume}
                onToggleMute={toggleMute}
              />
            </div>

            <div className="flex items-center gap-2">
              <SubtitleSelector
                subtitles={subtitles}
                currentSubtitle={currentSubtitle}
                onSubtitleChange={setCurrentSubtitle}
              />
              
              <QualitySelector
                qualities={availableQualities}
                currentQuality={currentQuality}
                onQualityChange={setQuality}
              />
              
              <button
                onClick={toggleSettings}
                className="p-2 hover:bg-white/10 rounded-full transition"
                aria-label="Settings"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                </svg>
              </button>
              
              <FullscreenButton
                isFullscreen={isFullscreen}
                onClick={handleFullscreenToggle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <SettingsMenu
        isOpen={showSettings}
        playbackSpeed={playbackSpeed}
        onPlaybackSpeedChange={setPlaybackSpeed}
        onClose={toggleSettings}
      />
    </div>
  )
}

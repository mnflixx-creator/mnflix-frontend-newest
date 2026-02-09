/**
 * Fullscreen hook - handles fullscreen API with fscreen
 */

import { useEffect } from 'react'
import fscreen from 'fscreen'
import { usePlayerStore } from '../../../stores/player/store'

export function useFullscreen(containerRef: React.RefObject<HTMLDivElement>) {
  const { setFullscreen } = usePlayerStore()

  useEffect(() => {
    if (!fscreen.fullscreenEnabled) return

    const handleFullscreenChange = () => {
      setFullscreen(fscreen.fullscreenElement !== null)
    }

    fscreen.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      fscreen.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [setFullscreen])

  const enterFullscreen = () => {
    if (containerRef.current && fscreen.fullscreenEnabled) {
      fscreen.requestFullscreen(containerRef.current)
    }
  }

  const exitFullscreen = () => {
    if (fscreen.fullscreenElement) {
      fscreen.exitFullscreen()
    }
  }

  const toggleFullscreen = () => {
    if (fscreen.fullscreenElement) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  return {
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    isFullscreenEnabled: fscreen.fullscreenEnabled,
  }
}

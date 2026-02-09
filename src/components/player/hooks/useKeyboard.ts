/**
 * Keyboard shortcuts hook
 */

import { useEffect } from 'react'
import { usePlayerStore } from '../../../stores/player/store'
import { createKeyboardHandler } from '../utils/keyboard'

export function useKeyboard() {
  const {
    togglePlay,
    toggleFullscreen,
    toggleMute,
    setVolume,
    volume,
    seek,
    currentTime,
    duration,
  } = usePlayerStore()

  useEffect(() => {
    const handleKeyboard = createKeyboardHandler({
      Space: () => togglePlay(),
      KeyK: () => togglePlay(),
      KeyF: () => toggleFullscreen(),
      KeyM: () => toggleMute(),
      ArrowLeft: () => seek(Math.max(0, currentTime - 5)),
      ArrowRight: () => seek(Math.min(duration, currentTime + 5)),
      ArrowUp: () => setVolume(Math.min(1, volume + 0.1)),
      ArrowDown: () => setVolume(Math.max(0, volume - 0.1)),
      Digit0: () => seek(0),
      Digit1: () => seek(duration * 0.1),
      Digit2: () => seek(duration * 0.2),
      Digit3: () => seek(duration * 0.3),
      Digit4: () => seek(duration * 0.4),
      Digit5: () => seek(duration * 0.5),
      Digit6: () => seek(duration * 0.6),
      Digit7: () => seek(duration * 0.7),
      Digit8: () => seek(duration * 0.8),
      Digit9: () => seek(duration * 0.9),
    })

    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [
    togglePlay,
    toggleFullscreen,
    toggleMute,
    setVolume,
    volume,
    seek,
    currentTime,
    duration,
  ])
}

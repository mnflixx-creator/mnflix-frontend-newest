/**
 * Progress tracking hook - saves watch progress periodically
 */

import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../../../stores/player/store'
import { saveWatchProgress } from '../../../services/zenflify'

export function useProgressTracking(movieId: string) {
  const { currentTime, duration } = usePlayerStore()
  const lastSavedTime = useRef(0)
  const saveIntervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    // Save progress every 10 seconds
    saveIntervalRef.current = setInterval(() => {
      if (duration > 0 && currentTime > 0) {
        // Only save if time has changed significantly (more than 5 seconds)
        if (Math.abs(currentTime - lastSavedTime.current) > 5) {
          saveWatchProgress(movieId, currentTime, duration)
          lastSavedTime.current = currentTime
        }
      }
    }, 10000) // 10 seconds

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current)
      }
      // Save one final time on unmount
      if (duration > 0 && currentTime > 0) {
        saveWatchProgress(movieId, currentTime, duration)
      }
    }
  }, [movieId, currentTime, duration])

  // Save when page is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (duration > 0 && currentTime > 0) {
        saveWatchProgress(movieId, currentTime, duration)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [movieId, currentTime, duration])
}

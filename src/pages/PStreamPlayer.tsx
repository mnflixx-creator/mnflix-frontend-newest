/**
 * P-Stream Player Integration for MNFLIX
 * 
 * This component integrates the P-Stream player UI with Zenflify backend.
 * Uses P-Stream's Container and control components with MNFLIX's streaming service.
 */

import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Container } from '@/components/player-pstream/base/Container'
import { VideoContainer } from '@/components/player-pstream/internals/VideoContainer'
import { TopControls } from '@/components/player-pstream/base/TopControls'
import { BottomControls } from '@/components/player-pstream/base/BottomControls'
import { usePlayerStore } from '@/stores/player-pstream/store'
import { getZenflifyMovieStreams } from '@/services/zenflify'

export default function PStreamPlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showingControls, setShowingControls] = useState(true)
  
  const setSources = usePlayerStore((s) => s.setSources)
  const setMeta = usePlayerStore((s) => s.setMeta)

  // Load video sources from Zenflify API
  useEffect(() => {
    async function loadVideo() {
      if (!id) return

      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch streams from Zenflify backend
        const data = await getZenflifyMovieStreams(parseInt(id), 'Video')
        
        if (!data.streams && !data.sources) {
          throw new Error('No streams available')
        }

        const streams = (data.streams || data.sources || [])
        
        // Set player metadata
        setMeta({
          id,
          type: 'movie',
          title: 'Video',
          releaseYear: 2024,
        })
        
        // Set video sources
        setSources(streams)
        
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load video:', err)
        setError(err instanceof Error ? err.message : 'Failed to load video')
        setIsLoading(false)
      }
    }

    loadVideo()
  }, [id, setMeta, setSources])

  if (!id) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Invalid content ID</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mr-4"
          >
            Retry
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Container showingControls={showingControls}>
      <VideoContainer />
      <TopControls show={showingControls} />
      <BottomControls show={showingControls} />
    </Container>
  )
}

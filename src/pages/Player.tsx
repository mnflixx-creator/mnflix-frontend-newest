import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Placeholder for the actual P-Stream player component
// This will be replaced with the full P-Stream player integration
export default function Player() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading player...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Placeholder for P-Stream Player */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">P-Stream Player</h1>
          <p className="text-gray-400 mb-8">
            Playing content ID: {id}
          </p>
          <p className="text-gray-500 mb-8 max-w-md">
            This is a placeholder for the P-Stream player component.
            The full player integration will be copied from P-Stream
            with all components, stores, and utilities.
          </p>
          <button
            onClick={handleBack}
            className="px-8 py-3 bg-mnflix_light_blue text-white rounded-md hover:bg-opacity-90 transition font-semibold"
          >
            Back to Content
          </button>
        </div>
      </div>
    </div>
  )
}

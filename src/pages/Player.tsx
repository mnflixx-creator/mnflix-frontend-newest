import { useParams, useNavigate } from 'react-router-dom'
import { PlayerComponent } from '../components/player/Player'

export default function Player() {
  const { id } = useParams()
  const navigate = useNavigate()

  if (!id) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Invalid content ID</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-mnflix_light_blue text-white rounded-md hover:bg-opacity-90 transition font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <PlayerComponent
      movieId={id}
      title="Video Player"
      onBack={() => navigate(-1)}
    />
  )
}

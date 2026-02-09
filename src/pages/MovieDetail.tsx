import { useParams, useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconPlayerPlay } from '@tabler/icons-react'

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const handlePlay = () => {
    navigate(`/play/${id}`)
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-24 left-6 z-50 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition"
      >
        <IconArrowLeft className="w-6 h-6" />
      </button>

      {/* Hero Section */}
      <section className="relative h-[80vh]">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
        <div className="absolute inset-0 bg-gray-900" />
        
        <div className="absolute bottom-0 left-0 z-20 p-12 max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">Movie Title</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-300 mb-6">
            <span>2024</span>
            <span>•</span>
            <span>2h 30m</span>
            <span>•</span>
            <span className="px-2 py-1 border border-gray-500 rounded">HD</span>
          </div>
          <p className="text-lg text-gray-300 mb-8">
            This is a sample movie description. In a real implementation, this would be populated
            from the backend API with actual movie data from TMDB or your database.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={handlePlay}
              className="flex items-center space-x-2 px-8 py-3 bg-mnflix_light_blue text-white rounded-md hover:bg-opacity-90 transition font-semibold"
            >
              <IconPlayerPlay className="w-5 h-5" />
              <span>Play</span>
            </button>
            <button className="px-8 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition font-semibold">
              Add to List
            </button>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-400 mb-8">
              Detailed information about the movie would appear here, including cast, crew,
              and additional metadata.
            </p>

            <h3 className="text-xl font-bold mb-4">Cast</h3>
            <div className="flex flex-wrap gap-4">
              {['Actor 1', 'Actor 2', 'Actor 3', 'Actor 4'].map((actor) => (
                <div key={actor} className="text-gray-400">
                  {actor}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Details</h3>
            <div className="space-y-3 text-gray-400">
              <div>
                <span className="font-semibold text-white">Genres:</span> Action, Thriller
              </div>
              <div>
                <span className="font-semibold text-white">Director:</span> Director Name
              </div>
              <div>
                <span className="font-semibold text-white">Rating:</span> 8.5/10
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Content */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">More Like This</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-gray-800 rounded-lg hover:scale-105 transition cursor-pointer"
            >
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Similar {i}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

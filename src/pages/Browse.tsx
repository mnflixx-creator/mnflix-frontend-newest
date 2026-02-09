import { useSearchParams } from 'react-router-dom'

export default function Browse() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <div className="pt-20 px-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {query ? `Search Results for "${query}"` : 'Browse Content'}
        </h1>

        {/* Filter Section */}
        <div className="flex space-x-4 mb-8">
          <button className="px-6 py-2 bg-mnflix_light_blue text-white rounded-md">
            All
          </button>
          <button className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">
            Movies
          </button>
          <button className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">
            Series
          </button>
          <button className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">
            Anime
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-gray-800 rounded-lg hover:scale-105 transition cursor-pointer"
            >
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Content {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

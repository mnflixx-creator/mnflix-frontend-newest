import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="pt-20 px-6">
      <div className="container mx-auto">
        {/* Hero Section */}
        <section className="relative h-[70vh] rounded-lg overflow-hidden mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
          <div className="absolute inset-0 z-0 bg-gray-900" />
          <div className="absolute bottom-0 left-0 z-20 p-12 max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">Welcome to MNFLIX</h1>
            <p className="text-xl text-gray-300 mb-6">
              Stream unlimited movies and TV series with high-quality playback
            </p>
            <div className="flex space-x-4">
              <Link
                to="/browse"
                className="px-8 py-3 bg-mnflix_light_blue text-white rounded-md hover:bg-opacity-90 transition font-semibold"
              >
                Browse Content
              </Link>
              <Link
                to="/movies"
                className="px-8 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition font-semibold"
              >
                Movies
              </Link>
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[2/3] bg-gray-800 rounded-lg hover:scale-105 transition cursor-pointer"
              >
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Movie {i}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular on MNFLIX</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[7, 8, 9, 10, 11, 12].map((i) => (
              <div
                key={i}
                className="aspect-[2/3] bg-gray-800 rounded-lg hover:scale-105 transition cursor-pointer"
              >
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Movie {i}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

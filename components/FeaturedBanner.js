"use client";

import { useRouter } from "next/navigation";

export default function FeaturedBanner({ movie }) {
  const router = useRouter();
  if (!movie) return null;

  return (
    <div
      className="relative h-[80vh] w-full bg-cover bg-center flex items-end"
      style={{ backgroundImage: `url(${movie.thumbnail})` }}
    >
      {/* Dark gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

      <div className="relative z-10 p-16 max-w-2xl">
        <h1 className="text-6xl font-extrabold mb-6 drop-shadow-lg">
          {movie.title}
        </h1>

        <p className="text-lg text-gray-200 mb-8 line-clamp-3">
          {movie.description}
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/watch/${movie._id}`)}
            className="px-8 py-3 bg-white text-black font-semibold rounded-md text-lg flex items-center gap-2"
          >
            ▶ Play
          </button>

          <button
            className="px-8 py-3 bg-gray-600/70 text-white rounded-md text-lg flex items-center gap-2"
            onClick={() => router.push(`/movie/${movie._id}`)}
          >
            ℹ More Info
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";

export default function AdultPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const API = process.env.NEXT_PUBLIC_API_URL;

  const [movies, setMovies] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const imgURL = (path) =>
    path?.startsWith("http") ? path : `${API}${path}`;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/movies/adult?limit=120`);
        const data = await res.json();
        setMovies(Array.isArray(data) ? data : []);
      } catch {
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [API]);

  // ✅ slider auto switch
  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % movies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [movies]);

  const current = movies[sliderIndex];

  return (
    <div className="bg-black min-h-screen text-white">
      {/* HERO */}
      {current && (
        <div
          key={current._id}
          className="
            relative bg-cover bg-center flex items-end cursor-pointer
            h-[45vh] sm:h-[55vh] lg:h-[65vh]
            transition-opacity duration-700
          "
          style={{
            backgroundImage: `url(${
              current.banner
                ? imgURL(current.banner)
                : current.thumbnail
                ? imgURL(current.thumbnail)
                : ""
            })`,
          }}
          onClick={() => router.push(`/movie/${current._id}`)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div className="relative z-10 p-4 sm:p-10 max-w-full sm:max-w-2xl">
            <div className="bg-black/35 backdrop-blur-sm rounded-xl p-4 sm:bg-transparent sm:backdrop-blur-0 sm:rounded-none sm:p-0">
              <h1 className="text-2xl sm:text-5xl font-bold leading-tight">
                {current.title}
              </h1>
              <p className="mt-2 sm:mt-3 opacity-90 text-sm sm:text-base line-clamp-2 sm:line-clamp-none">
                {current.description || ""}
              </p>

              <div className="mt-3 text-xs text-white/70">
                🔞 {lang === "mn" ? "Зөвхөн 18+ үзэгчид" : "Adults only (18+)"}
                {typeof current.popularity === "number" && (
                  <span className="ml-3">
                    pop: {Number(current.popularity || 0).toFixed(0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TITLE */}
      <h1 className="text-2xl sm:text-3xl font-bold px-4 sm:px-8 mt-8 sm:mt-10">
        {lang === "mn" ? "Насанд хүрэгчид (18+)" : "Adults (18+)"}
      </h1>

      {loading && (
        <div className="text-center text-gray-400 py-6">Loading...</div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-2 gap-4 px-4 mt-6 sm:mt-8 sm:flex sm:gap-6 sm:flex-wrap sm:px-8">
        {movies.map((m) => (
          <div
            key={m._id}
            className="w-full sm:w-[180px] cursor-pointer relative group"
            onClick={() => router.push(`/movie/${m._id}`)}
          >
            <div className="absolute top-2 left-2 z-20 bg-red-500/80 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full backdrop-blur-md font-semibold">
              18+
            </div>

            {m.thumbnail && (
              <img
                src={imgURL(m.thumbnail)}
                className="
                  w-full object-cover rounded-md shadow-lg
                  h-[220px] sm:h-[260px]
                  group-hover:scale-105 transition duration-300
                "
                alt={m.title}
              />
            )}

            <p className="mt-2 text-xs sm:text-sm text-gray-300 text-center line-clamp-1">
              {m.title}
            </p>
          </div>
        ))}
      </div>

      <div className="h-10 sm:h-0" />
    </div>
  );
}

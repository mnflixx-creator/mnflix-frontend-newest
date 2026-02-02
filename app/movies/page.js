"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MoviesPage() {
  const router = useRouter();
  const openTmdbSeries = async (tmdbId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tmdb/import-tv/${tmdbId}`,
        { method: "POST" }
      );
      const data = await res.json();

      const mongoId = data?.series?._id || data?.movie?._id; // your backend returns "series"
      if (!mongoId) {
        alert("Import failed");
        return;
      }

      router.push(`/movie/${mongoId}`); // ✅ open in your existing player page
    } catch {
      alert("Import failed");
    }
  };
  const openTmdbMovie = async (tmdbId) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tmdb/import/${tmdbId}`,
      { method: "POST" }
    );
    const data = await res.json();

    const mongoId = data?.movie?._id;
    if (!mongoId) {
      alert("Import failed");
      return;
    }

    router.push(`/movie/${mongoId}`);
  } catch {
    alert("Import failed");
  }
};
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [openGenres, setOpenGenres] = useState(false);
  const [mongoOverride, setMongoOverride] = useState(null);
  
  const imgURL = (path) =>
    path?.startsWith("http") ? path : `${process.env.NEXT_PUBLIC_API_URL}${path}`;

  // ✅ LOAD MOVIES (INFINITE SCROLL – like FMovies)
  useEffect(() => {
    async function load() {
      if (loadingMore || !hasMore) return;

      setLoadingMore(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tmdb/discover/popular?page=${page}`
        );
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];

        // FILTER OUT LOW QUALITY MOVIES
        const cleaned = arr.filter((m) => {
          const rating = Number(m.vote_average || 0);
          const year = m.release_date ? Number(m.release_date.slice(0, 4)) : 0;

          // adjust thresholds if needed
          const goodRating = rating >= 6.0;  // only 6.0+ rating
          const notTooOld = year >= 2000;    // only movies from year 2000+

          return goodRating && notTooOld;
        });

        if (cleaned.length === 0) {
          setHasMore(false);
          return;
        }

        // add + remove duplicates
        setMovies((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          cleaned.forEach((m) => map.set(m.id, m));
          return Array.from(map.values());
        });
      } catch {
        setHasMore(false);
      } finally {
        setLoadingMore(false);
      }
    }

    load();
  }, [page]);

  // ✅ Load next page when scrolling down
  useEffect(() => {
    function onScroll() {
      if (loadingMore || !hasMore) return;

      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 800
      ) {
        setPage((p) => p + 1);
      }
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadingMore, hasMore]);

  // ✅ LOAD GENRES
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tmdb/genres`)
      .then((res) => res.json())
      .then((data) => setGenres(Array.isArray(data) ? data : []));
  }, []);

  // ✅ SLIDER AUTO SWITCH
  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % movies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [movies]);

  // ✅ FILTER MOVIES
  const filtered =
  selectedGenre === "all"
    ? movies
    : movies.filter((m) => Array.isArray(m.genre_ids) && m.genre_ids.includes(Number(selectedGenre)));

  const currentSlide = movies[sliderIndex];

  useEffect(() => {
    if (!currentSlide?.id) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/by-tmdb/${currentSlide.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((doc) => setMongoOverride(doc && doc._id ? doc : null))
      .catch(() => setMongoOverride(null));
  }, [currentSlide?.id]);

  return (
    <div className="bg-black min-h-screen text-white">
      {/* ✅ HERO SLIDER — MOBILE IMPROVED (DESKTOP SAME) */}
      {currentSlide && (
        <div
          key={currentSlide.id}
          className="
            relative bg-cover bg-center flex items-end cursor-pointer
            h-[45vh] sm:h-[55vh] lg:h-[65vh]
            transition-opacity duration-700
          "
          style={{
            backgroundImage: `url(${
              currentSlide.backdrop_path
                ? `https://image.tmdb.org/t/p/original${currentSlide.backdrop_path}`
                : currentSlide.poster_path
                ? `https://image.tmdb.org/t/p/original${currentSlide.poster_path}`
                : ""
            })`,
          }}
          onClick={() => openTmdbMovie(currentSlide.id)}
        >
          {/* ✅ DARK OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* ✅ GENRE DROPDOWN (MOBILE FRIENDLY) */}
          <div
            className="absolute top-4 left-4 sm:top-6 sm:left-8 z-40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenGenres((prev) => !prev)}
              className="
                bg-black/70 text-white px-4 sm:px-5 py-2.5 rounded-md text-sm font-medium
                border border-white/20 backdrop-blur-md
                hover:bg-black/90 hover:border-white/40
                transition flex items-center gap-2
              "
            >
              Төрөл
              <span className={`transition ${openGenres ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {openGenres && (
              <div
                className="
                  absolute mt-3
                  w-[92vw] max-w-[520px]
                  bg-black/95 border border-white/20
                  rounded-lg shadow-xl p-4
                  grid grid-cols-2 sm:grid-cols-3
                  gap-x-6 sm:gap-x-8 gap-y-2
                  max-h-[60vh] overflow-y-auto
                "
              >
                <button
                  onClick={() => {
                    setSelectedGenre("all");
                    setOpenGenres(false);
                  }}
                  className={`text-left text-sm px-2 py-1 rounded hover:bg-white/10 transition
                    ${selectedGenre === "all" ? "text-blue-400" : "text-white"}`}
                >
                  All
                </button>

                {genres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGenre(String(g.id));
                      setOpenGenres(false);
                    }}
                    className={`text-left text-sm px-2 py-1 rounded hover:bg-white/10 transition
                      ${String(selectedGenre) === String(g.id) ? "text-blue-400" : "text-white"}`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ✅ BANNER TEXT (MOBILE CLEANER) */}
          <div
            className="
              relative z-10
              p-4 sm:p-10
              max-w-full sm:max-w-2xl
            "
          >
            {/* small blur card only on mobile to read better */}
            <div className="bg-black/35 backdrop-blur-sm rounded-xl p-4 sm:bg-transparent sm:backdrop-blur-0 sm:rounded-none sm:p-0">
              <h1 className="text-2xl sm:text-5xl font-bold leading-tight">
                {mongoOverride?.title || currentSlide.title}
              </h1>
              <p className="mt-2 sm:mt-3 opacity-90 text-sm sm:text-base line-clamp-2 sm:line-clamp-none">            
                {mongoOverride?.description || currentSlide.overview}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ PAGE TITLE (MOBILE PADDING) */}
      <h1 className="text-2xl sm:text-3xl font-bold px-4 sm:px-8 mt-8 sm:mt-10">
        Кино
      </h1>

      {/* ✅ MOVIES LIST (MOBILE = GRID, DESKTOP = SAME FLEX WRAP) */}
      <div className="grid grid-cols-2 gap-4 px-4 mt-6 sm:mt-8 sm:flex sm:gap-6 sm:flex-wrap sm:px-8">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="w-full sm:w-[180px] cursor-pointer relative group"
            onClick={() => openTmdbMovie(m.id)}
          >
            {/* ✅ RATING BADGE */}
            {m.vote_average > 0 && (
              <div
                className="absolute top-2 left-2 z-20 bg-black/70 text-yellow-400
                text-[10px] sm:text-xs px-2 py-0.5 rounded-full backdrop-blur-md font-semibold"
              >
                ⭐ {Number(m.vote_average).toFixed(1)}
              </div>
            )}

            {/* ✅ GENRE BADGE */}
            {/* ❌ remove genre badge for now */}
            {m.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
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

      {loadingMore && (
        <div className="text-center text-gray-400 py-6">
          Loading more movies...
        </div>
      )}

      {/* little bottom spacing on mobile */}
      <div className="h-10 sm:h-0" />
    </div>
  );
}

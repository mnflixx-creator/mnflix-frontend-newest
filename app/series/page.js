"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SeriesPage() {
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL; // ✅ Railway/Render base from env

  const [series, setSeries] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [sliderIndex, setSliderIndex] = useState(0);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [openGenres, setOpenGenres] = useState(false); // ✅ REQUIRED

  const imgURL = (path) => (path?.startsWith("http") ? path : `${API_BASE}${path}`);

  // ✅ LOAD TV SHOWS (INFINITE SCROLL) — TMDB popular TV
  useEffect(() => {
    async function load() {
      if (!API_BASE) return;
      if (loadingMore || !hasMore) return;

      setLoadingMore(true);
      try {
        const res = await fetch(`${API_BASE}/api/tmdb/tv/popular?page=${page}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];

        if (arr.length === 0) {
          setHasMore(false);
          return;
        }

        // append + remove duplicates
        setSeries((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          arr.forEach((m) => map.set(m.id, m));
          return Array.from(map.values());
        });
      } catch {
        setHasMore(false);
      } finally {
        setLoadingMore(false);
      }
    }

    load();
  }, [API_BASE, page, loadingMore, hasMore]);

  // ✅ Load next page when scrolling down
  useEffect(() => {
    function onScroll() {
      if (loadingMore || !hasMore) return;

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
        setPage((p) => p + 1);
      }
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadingMore, hasMore]);

  // ✅ LOAD TMDB TV GENRES
  useEffect(() => {
    if (!API_BASE) return;

    fetch(`${API_BASE}/api/tmdb/tv/genres`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setGenres(Array.isArray(data) ? data : []))
      .catch(() => setGenres([]));
  }, [API_BASE]);

  // ✅ SLIDER AUTO SWITCH
  useEffect(() => {
    if (series.length === 0) return;
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % series.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [series]);

  // ✅ FILTER TV SHOWS
  const filtered =
    selectedGenre === "all"
      ? series
      : series.filter(
          (m) => Array.isArray(m.genre_ids) && m.genre_ids.includes(Number(selectedGenre))
        );

  const currentSlide = series[sliderIndex];

  return (
    <div className="bg-black min-h-screen text-white">
      {currentSlide && (
        <div
          className="
            relative bg-cover bg-center flex items-end cursor-pointer transition-opacity duration-700
            h-[45vh] sm:h-[55vh] lg:h-[65vh]
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
          onClick={async () => {
            try {
              const r = await fetch(
                `${API_BASE}/api/movies/by-tmdb/${currentSlide.id}?type=series`,
                { method: "GET" }
              );

              const data = await r.json().catch(() => ({}));
              const mongoId = data?._id;

              if (!mongoId) return alert(data?.message || "Import failed");

              router.push(`/movie/${mongoId}`);
            } catch {
              alert("Import failed");
            }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* ✅ GENRE DROPDOWN (RESPONSIVE) */}
          <div
            className="absolute top-4 left-4 sm:top-6 sm:left-8 z-40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenGenres((prev) => !prev)}
              className="
                bg-black/70 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-md text-sm font-medium
                border border-white/20 backdrop-blur-md
                hover:bg-black/90 hover:border-white/40
                transition flex items-center gap-2
              "
            >
              Төрөл
              <span className={`transition ${openGenres ? "rotate-180" : ""}`}>▼</span>
            </button>

            {openGenres && (
              <div
                className="
                  absolute mt-3
                  w-[92vw] max-w-[520px]
                  bg-black/95 border border-white/20 rounded-lg shadow-xl
                  p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-2
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
                  Бүгд
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

          {/* ✅ BANNER TEXT (RESPONSIVE) */}
          <div className="relative z-10 p-4 sm:p-10 max-w-2xl">
            <h1 className="text-3xl sm:text-5xl font-bold">
              {currentSlide.name || currentSlide.title}
            </h1>
            <p className="mt-2 sm:mt-3 opacity-90 text-sm sm:text-base line-clamp-3">
              {currentSlide.overview}
            </p>
          </div>
        </div>
      )}

      {/* ✅ PAGE TITLE (RESPONSIVE PADDING) */}
      <h1 className="text-2xl sm:text-3xl font-bold px-4 sm:px-8 mt-8 sm:mt-10">
        Цуврал
      </h1>

      {/* ✅ MOBILE: 2-COLUMN GRID / DESKTOP: SAME LOOK */}
      <div className="px-4 sm:px-8 mt-6 sm:mt-8">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-6">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="cursor-pointer relative group w-full sm:w-[180px]"
              onClick={async () => {
                try {
                  const r = await fetch(
                    `${API_BASE}/api/movies/by-tmdb/${m.id}?type=series`,
                    { method: "GET" }
                  );

                  const data = await r.json().catch(() => ({}));
                  const mongoId = data?._id;

                  if (!mongoId) return alert(data?.message || "Import failed");

                  router.push(`/movie/${mongoId}`);
                } catch {
                  alert("Import failed");
                }
              }}
            >
              {/* ✅ FIX: do NOT render img if no poster_path (prevents src="") */}
              {m.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                  className="
                    w-full object-cover rounded-md shadow-lg 
                    h-[230px] sm:h-[260px]
                    group-hover:scale-105 transition duration-300
                  "
                  alt={m.name || m.title || ""}
                />
              )}

              <p className="mt-2 text-xs sm:text-sm text-gray-300 text-center line-clamp-1">
                {m.name || m.title}
              </p>
            </div>
          ))}
        </div>

        {/* ✅ loading text */}
        {loadingMore && (
          <div className="text-center text-gray-400 py-6">Loading more series...</div>
        )}

        {!hasMore && (
          <div className="text-center text-gray-500 py-6">No more series</div>
        )}
      </div>
    </div>
  );
}

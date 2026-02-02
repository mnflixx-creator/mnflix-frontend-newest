"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function KDramaPage() {
  const router = useRouter();

  const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

  const [dramas, setDramas] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [openGenres, setOpenGenres] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const imgURL = (path) =>
    path && path.startsWith("http") ? path : `${API_BASE}${path || ""}`;

  // ✅ LOAD K-DRAMA DIRECTLY FROM TMDB (only Korean TV series)
  // backend route must be: GET /api/movies/tmdb/kdrama?page=&lang=
  useEffect(() => {
    if (!API_BASE) return;

    setLoading(true);

    fetch(`${API_BASE}/api/movies/tmdb/kdrama?page=${page}&lang=mn`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data.results) ? data.results : [];

        // 🔹 append pages & avoid duplicates by tmdbId
        setDramas((prev) => {
          if (page === 1) return list;
          const existingIds = new Set(prev.map((m) => m.tmdbId));
          const merged = [
            ...prev,
            ...list.filter((m) => !existingIds.has(m.tmdbId)),
          ];
          return merged;
        });

        // 🔹 update genres list
        const gSet = new Set();
        list.forEach((m) => {
          if (Array.isArray(m.genres)) {
            m.genres.forEach((g) => gSet.add(g));
          }
        });

        setGenres((prev) => {
          const base = new Set(prev.length ? prev : ["K-Drama"]);
          gSet.forEach((g) => base.add(g));
          return Array.from(base);
        });
      })
      .catch((err) => {
        console.error("TMDB kdrama fetch error:", err);
        setDramas([]);
      })
      .finally(() => setLoading(false));
  }, [API_BASE, page]);

  // ✅ SLIDER AUTO SWITCH
  useEffect(() => {
    if (dramas.length === 0) return;

    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % dramas.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [dramas]);

  // ✅ FILTER BY GENRE
  const filtered =
    selectedGenre === "all"
      ? dramas
      : dramas.filter(
          (m) => Array.isArray(m.genres) && m.genres.includes(selectedGenre)
        );

  const currentSlide = dramas[sliderIndex];

  // ✅ When click K-drama → ensure Mongo doc & open /movie/[id]
  const handleOpenDrama = async (tmdbId) => {
    if (!API_BASE || !tmdbId) return;

    try {
        const res = await fetch(
            `${API_BASE}/api/movies/by-tmdb/${tmdbId}?type=kdrama`
        );

        if (!res.ok) {
            console.error("Failed to fetch by-tmdb", await res.text());
            alert("Үзэхэд алдаа гарлаа.");
            return;
        }

        const data = await res.json();
        if (data && data._id) {
            router.push(`/movie/${data._id}`);
        } else {
            alert("Movie ID not found");
        }
    } catch (err) {
        console.error("open kdrama error", err);
        alert("Сүлжээний алдаа.");
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      {/* ✅ HERO SLIDER */}
      {currentSlide && (
        <div
          key={currentSlide.tmdbId}
          className="
            relative bg-cover bg-center flex items-end cursor-pointer
            transition-opacity duration-700
            h-[45vh] sm:h-[55vh] lg:h-[65vh]
          "
          style={{
            backgroundImage: `url(${imgURL(
              currentSlide.banner || currentSlide.thumbnail
            )})`,
          }}
          onClick={() => handleOpenDrama(currentSlide.tmdbId)}
        >
          {/* dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* ✅ GENRE MENU (like anime page) */}
          <div
            className="absolute top-4 left-4 sm:top-6 sm:left-8 z-40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenGenres((prev) => !prev)}
              className="
                bg-black/70 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-md text-sm font-medium
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
                  bg-black/95 border border-white/20 rounded-lg shadow-xl
                  p-3 sm:p-4
                  grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-2
                  max-h-[55vh] overflow-y-auto
                "
              >
                <button
                  onClick={() => {
                    setSelectedGenre("all");
                    setOpenGenres(false);
                  }}
                  className={`text-left text-sm px-2 py-1 rounded hover:bg-white/10 transition
                    ${
                      selectedGenre === "all"
                        ? "text-blue-400"
                        : "text-white"
                    }`}
                >
                  Бүгд
                </button>

                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setSelectedGenre(g);
                      setOpenGenres(false);
                    }}
                    className={`text-left text-sm px-2 py-1 rounded hover:bg-white/10 transition
                      ${
                        selectedGenre === g ? "text-blue-400" : "text-white"
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ✅ BANNER TEXT */}
          <div className="relative z-10 p-5 sm:p-10 max-w-2xl">
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
              {currentSlide.title}
            </h1>
            <p className="mt-2 sm:mt-3 opacity-90 text-sm sm:text-base line-clamp-2 sm:line-clamp-none">
              {currentSlide.description}
            </p>
          </div>
        </div>
      )}

      {/* title */}
      <h1 className="text-2xl sm:text-3xl font-bold px-4 sm:px-8 mt-6 sm:mt-10">
        K-Drama
      </h1>

      {/* loading / empty states */}
      <div className="px-4 sm:px-8 mt-3 text-sm text-gray-400">
        {loading && <p>Ачаалж байна…</p>}
        {!loading && filtered.length === 0 && (
          <p>K-Drama олдсонгүй.</p>
        )}
      </div>

      {/* grid */}
      <div className="mt-4 sm:mt-6 px-4 sm:px-8 pb-8">
        <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-6">
          {filtered.map((m) => (
            <div
              key={m.tmdbId}
              className="cursor-pointer relative group w-full sm:w-[180px]"
              onClick={() => handleOpenDrama(m.tmdbId)}
            >
              {/* rating badge */}
              {m.rating > 0 && (
                <div
                  className="
                    absolute top-2 left-2 z-20 bg-black/70 text-yellow-400
                    text-[10px] sm:text-xs px-2 py-0.5 rounded-full
                    backdrop-blur-md font-semibold
                  "
                >
                  ⭐ {Number(m.rating).toFixed(1)}
                </div>
              )}

              {/* first genre badge */}
              {m.genres && m.genres[0] && (
                <div
                  className="
                    absolute top-2 right-2 z-10 bg-black/70 text:white
                    text-[9px] sm:text-[10px]
                    px-2 py-0.5 rounded-full border border-white/20
                    backdrop-blur-md
                  "
                >
                  {m.genres[0]}
                </div>
              )}

              <img
                src={imgURL(m.thumbnail)}
                className="
                  w-full object-cover rounded-md shadow-lg
                  h-[220px] sm:h-[260px]
                  group-hover:scale-105 transition duration-300
                "
                alt={m.title}
              />

              <p className="mt-2 text-xs sm:text-sm text-gray-300 text-center line-clamp-1">
                {m.title}
              </p>
            </div>
          ))}
        </div>

        {/* 🔽 LOAD MORE BUTTON (same as anime page) */}
        {!loading && dramas.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-sm sm:text-base font-semibold"
            >
              Дахин ачааллах (Load more)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

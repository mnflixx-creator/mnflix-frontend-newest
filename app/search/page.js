"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

/* ✅ REQUIRED wrapper for Vercel build */
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="px-6 mt-24 text-white">Loading…</div>}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { lang } = useLanguage(); // "mn" or "en"

  const q = params.get("q") || "";
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [recentSearches, setRecentSearches] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState(q.trim());

  const RECENT_KEY = "mnflix_recent_searches";

  /* ----------------------------------------
     🧠 Load recent searches from localStorage
  -----------------------------------------*/
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setRecentSearches(parsed);
    } catch {}
  }, []);

  /* ----------------------------------------
     ⏱ Debounce URL query → debouncedQuery
     + save to "recent searches"
  -----------------------------------------*/
  useEffect(() => {
    const raw = q.trim();
    if (!raw) {
      setDebouncedQuery("");
      setResults([]);
      setError("");
      return;
    }

    setError("");

    const timer = setTimeout(() => {
      setDebouncedQuery(raw);

      // update recent searches (max 8, latest first)
      if (typeof window !== "undefined") {
        setRecentSearches((prev) => {
          const without = prev.filter(
            (item) => item.toLowerCase() !== raw.toLowerCase()
          );
          const next = [raw, ...without].slice(0, 8);
          window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
          return next;
        });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [q]);

  /* ----------------------------------------
     🔍 Load TMDB search results (from backend)
  -----------------------------------------*/
  useEffect(() => {
    const query = debouncedQuery;
    if (!query) return;
    if (!API_URL) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");
      setResults([]);

      try {
        const uiLang = lang === "mn" ? "mn" : "en";

        const res = await fetch(
          `${API_URL}/api/movies/search/${encodeURIComponent(query)}?lang=${uiLang}`
        );

        if (!res.ok) throw new Error("Search failed: " + res.status);

        const data = await res.json();
        const tmdbRaw = Array.isArray(data.tmdb) ? data.tmdb : [];

        const tmdbSorted = [...tmdbRaw].sort((a, b) => {
          const pA = a.popularity || 0;
          const pB = b.popularity || 0;
          if (pB !== pA) return pB - pA;
          const vA = a.vote_average || 0;
          const vB = b.vote_average || 0;
          return vB - vA;
        });

        if (!cancelled) setResults(tmdbSorted);
      } catch (err) {
        console.error("Search error:", err);
        if (!cancelled) {
          setError(
            lang === "mn"
              ? "Хайлт хийхэд алдаа гарлаа. Дахин оролдоно уу."
              : "Search failed, please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, API_URL, lang]);

  /* ----------------------------------------
     🎬 Clicking a TMDB card → open /movie/...
  -----------------------------------------*/
  const handleTmdbClick = async (item) => {
    if (!API_URL) return;

    const tmdbId = item.id;
    const mediaType = item.media_type; // "movie" or "tv"

    try {
      if (mediaType === "movie") {
        const res = await fetch(`${API_URL}/api/tmdb/import/${tmdbId}`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("Import failed: " + res.status);

        const data = await res.json();
        const doc = data.movie || data.series || data.doc;
        const mongoId = doc?._id || data.movieId;
        if (!mongoId) throw new Error("No Mongo ID returned from import");

        router.push(`/movie/${mongoId}`);
        return;
      }

      const res = await fetch(`${API_URL}/api/movies/by-tmdb/${tmdbId}?type=series`);
      if (res.ok) {
        const movie = await res.json();
        router.push(`/movie/${movie._id}`);
        return;
      }

      const syncRes = await fetch(`${API_URL}/api/movies/admin/tmdb-tv-sync/${tmdbId}`);
      if (syncRes.ok) {
        const data = await syncRes.json();
        if (data.movieId) {
          router.push(`/movie/${data.movieId}`);
          return;
        }
      }

      alert(
        lang === "mn"
          ? "Энэ контент одоогоор MNFLIX дээр бэлэн биш байна. Дараа дахин шалгана уу."
          : "This title isn’t available on MNFLIX yet."
      );
    } catch (err) {
      console.error("TMDB click error:", err);
      alert(lang === "mn" ? "Алдаа гарлаа. Дахин оролдоно уу." : "Something went wrong.");
    }
  };

  const hasResults = results.length > 0;
  const titleText = lang === "mn" ? "Хайлтын үр дүн:" : "Search results for:";
  const noResultsText = lang === "mn" ? "Кино олдсонгүй." : "No titles found.";
  const recentTitle = lang === "mn" ? "Сүүлийн хайлтууд" : "Recent searches";

  const SkeletonGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white/5 rounded-xl overflow-hidden border border-white/10"
        >
          <div className="aspect-[2/3] bg-white/10" />
          <div className="px-2 py-2 space-y-2">
            <div className="h-3 bg-white/10 rounded" />
            <div className="flex items-center justify-between">
              <div className="h-3 w-10 bg-white/10 rounded" />
              <div className="h-3 w-14 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="px-6 mt-24 text-white">
      {/* Page title */}
      <h1 className="text-2xl font-bold mb-2">
        {titleText} <span className="text-blue-400">{q}</span>
      </h1>

      {/* Recent searches */}
      {!q.trim() && recentSearches.length > 0 && (
        <div className="mb-4 text-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="text-gray-300 font-semibold">{recentTitle}</div>
            <button
              type="button"
              onClick={() => {
                setRecentSearches([]);
                window.localStorage.removeItem(RECENT_KEY);
              }}
              className="text-xs text-white/50 hover:text-white"
            >
              {lang === "mn" ? "Цэвэрлэх" : "Clear"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-gray-100"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {/* Loading skeleton */}
      {loading && <SkeletonGrid />}

      {/* No results */}
      {!loading && !hasResults && !error && debouncedQuery && (
        <p className="text-gray-400 mt-4">{noResultsText}</p>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
          {results.map((item) => {
            const isMovie = item.media_type === "movie";
            const posterPath = item.poster_path || item.backdrop_path || "";
            const imgSrc = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;

            const title = item.forcedTitle || item.title || item.name || "";
            const year =
              item.forcedYear ||
              (item.release_date || item.first_air_date || "").slice(0, 4);

            const badgeLabel = isMovie
              ? lang === "mn"
                ? "Кино"
                : "Movie"
              : lang === "mn"
              ? "Цуврал"
              : "Series";

            const noImageText = lang === "mn" ? "Зураг байхгүй" : "No image";

            return (
              <button
                key={`${item.media_type}-${item.id}`}
                type="button"
                onClick={() => handleTmdbClick(item)}
                className="group block w-full text-left bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-blue-400/80 transition"
              >
                <div className="aspect-[2/3] bg-black/50">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      {noImageText}
                    </div>
                  )}
                </div>

                <div className="px-2 py-2">
                  <div className="text-xs text-gray-300 mb-1 line-clamp-2">{title}</div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>{year}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/40 text-[10px] uppercase tracking-wide">
                      {badgeLabel}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

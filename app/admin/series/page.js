"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSeriesPage() {
  const router = useRouter();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  // TMDB
  const [tmdbShows, setTmdbShows] = useState([]);
  const [tmdbMode, setTmdbMode] = useState("discover_popular_tv");
  const [tmdbPage, setTmdbPage] = useState(1);
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbView, setTmdbView] = useState(() => {
    if (typeof window === "undefined") return "list";
    return localStorage.getItem("tmdbSeriesView") || "list";
  });

  // SORT + FILTER
  const [genreFilter, setGenreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [genres, setGenres] = useState(["all"]);

  const getImgSrc = (path) => {
    if (!path) return null;
    return path.startsWith("http")
      ? path
      : `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  };

  // ✅ Fetch DB series (Mongo) only
  const loadSeries = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/type/series`)
      .then((res) => res.json())
      .then((data) => setSeries(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSeries();
  }, []);

  // ✅ Fetch DB genres list (your existing genres endpoint)
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/genres/all`)
      .then((res) => res.json())
      .then((data) => setGenres(["all", ...(Array.isArray(data) ? data : [])]));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("tmdbSeriesView", tmdbView);
  }, [tmdbView]);

  // ✅ TMDB TV picker list/search (TV endpoints — we’ll add backend routes next)
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    const q = tmdbQuery.trim();

    const url = q
        ? /^\d+$/.test(q)
            ? `${base}/api/tmdb/tv/${q}`
            : `${base}/api/tmdb/tv/search?q=${encodeURIComponent(q)}&page=${tmdbPage}`
        : tmdbMode === "discover_newest_tv"
        ? `${base}/api/tmdb/tv/popular?page=${tmdbPage}` // fallback (no newest endpoint yet)
        : tmdbMode === "discover_popular_tv"
        ? `${base}/api/tmdb/tv/popular?page=${tmdbPage}`
        : tmdbMode === "tv_popular"
        ? `${base}/api/tmdb/tv/popular?page=${tmdbPage}`
        : tmdbMode === "trending_tv"
        ? `${base}/api/tmdb/tv/popular?page=${tmdbPage}` // fallback
        : tmdbMode === "tv_top"
        ? `${base}/api/tmdb/tv/popular?page=${tmdbPage}` // fallback
        : `${base}/api/tmdb/tv/popular?page=${tmdbPage}`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        const list =
          Array.isArray(d) ? d :
          Array.isArray(d?.results) ? d.results :
          d?.id ? [d] : [];
        setTmdbShows(list);
      })
      .catch(() => setTmdbShows([]));
  }, [tmdbMode, tmdbPage, tmdbQuery]);

  if (loading) return <p className="text-gray-300">Loading series…</p>;

  // ✅ Filter + sort DB series table
  let filtered = series;
  if (genreFilter !== "all") {
    filtered = filtered.filter(
      (m) => Array.isArray(m.genres) && m.genres.includes(genreFilter)
    );
  }

  filtered = [...filtered].sort((a, b) => {
    const A = a.isTrending ? 1 : 0;
    const B = b.isTrending ? 1 : 0;
    if (B !== A) return B - A;

    if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "views_desc") return (b.views || 0) - (a.views || 0);
    if (sortBy === "views_asc") return (a.views || 0) - (b.views || 0);
    if (sortBy === "year_newest") return Number(b.year) - Number(a.year);
    if (sortBy === "year_oldest") return Number(a.year) - Number(b.year);
    return 0;
  });

  // ✅ toggle slider for DB series (same endpoint you already use)
  const toggleTrending = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/trending/${id}`, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("adminToken"),
      },
    });
    loadSeries();
  };

  // ⚠️ Import TMDB TV will work AFTER we add backend tv import route
  const importTvToDB = async (tmdbId) => {
    const base = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${base}/api/tmdb/import-tv/${tmdbId}`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("adminToken"),
      },
    });

    const data = await res.json();
    if (!res.ok) return alert(data?.message || "Import failed");

    loadSeries();
    alert("Imported ✅");
  };

  return (
    <div>
      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Series (TV Shows)</h1>
        <button
          onClick={() => router.push("/admin/series/add")}
          className="px-4 py-2 bg-[#2EA8FF] rounded text-sm font-semibold hover:bg-[#4FB5FF]"
        >
          + Add Series
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-4 mb-5">
        <select
          className="bg-black/40 border border-white/10 p-2 rounded text-sm"
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          {genres.map((g) => (
            <option key={g + "_key"} value={g}>
              {g === "all" ? "All Genres" : g}
            </option>
          ))}
        </select>

        <select
          className="bg-black/40 border border-white/10 p-2 rounded text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Upload Date (Newest)</option>
          <option value="oldest">Upload Date (Oldest)</option>
          <option value="views_desc">Most Watched</option>
          <option value="views_asc">Least Watched</option>
          <option value="year_newest">Year (Newest)</option>
          <option value="year_oldest">Year (Oldest)</option>
        </select>
      </div>

      {/* ✅ TMDB TV PICKER */}
      <div className="mb-6 bg-black/40 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold">TMDB TV Shows</h2>

          <div className="flex items-center gap-2">
            <input
              value={tmdbQuery}
              onChange={(e) => {
                setTmdbQuery(e.target.value);
                setTmdbPage(1);
              }}
              placeholder="Search TMDB TV..."
              className="bg-black/40 border border-white/10 p-2 rounded text-sm w-56"
            />

            <button
              onClick={() => {
                setTmdbQuery("");
                setTmdbPage(1);
              }}
              className="px-3 py-2 text-xs bg-white/10 rounded hover:bg-white/20"
            >
              Clear
            </button>

            <select
              className="bg-black/40 border border-white/10 p-2 rounded text-sm"
              value={tmdbMode}
              onChange={(e) => {
                setTmdbMode(e.target.value);
                setTmdbPage(1);
              }}
            >
              <option value="discover_popular_tv">Popular (Discover)</option>
              <option value="discover_newest_tv">Newest (Discover)</option>
              <option value="trending_tv">Trending</option>
              <option value="tv_popular">Popular</option>
              <option value="tv_top">Top Rated</option>
            </select>

            <select
              className="bg-black/40 border border-white/10 p-2 rounded text-sm"
              value={tmdbView}
              onChange={(e) => setTmdbView(e.target.value)}
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 text-xs bg-white/10 rounded hover:bg-white/20"
                onClick={() => setTmdbPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <span className="text-xs opacity-80">Page {tmdbPage}</span>
              <button
                className="px-3 py-2 text-xs bg-white/10 rounded hover:bg-white/20"
                onClick={() => setTmdbPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {tmdbView === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {tmdbShows.map((m) => (
              <div key={m.id} className="bg-white/5 rounded-lg overflow-hidden">
                {m.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                    className="w-full h-44 object-cover"
                    alt={m.name || ""}
                  />
                ) : (
                  <div className="w-full h-44 bg-white/10" />
                )}

                <div className="p-2">
                  <p className="text-xs font-semibold line-clamp-2">
                    {m.name || m.original_name || "Untitled"}
                  </p>

                  <button
                    onClick={() => importTvToDB(m.id)}
                    className="mt-2 w-full px-2 py-1 text-xs rounded bg-green-600 hover:bg-green-700"
                  >
                    Import (TV)
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto bg-black/30 border border-white/10 rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-3 py-2 text-left">Poster</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">First Air</th>
                  <th className="px-3 py-2 text-left">Popularity</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {tmdbShows.map((m) => (
                  <tr key={m.id} className="border-t border-white/5">
                    <td className="px-3 py-2">
                      {m.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                          className="w-10 h-14 object-cover rounded"
                          alt={m.name || ""}
                        />
                      ) : (
                        <div className="w-10 h-14 bg-white/10 rounded" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-semibold">{m.name || m.original_name}</div>
                      <div className="text-xs opacity-70 line-clamp-1">{m.overview}</div>
                    </td>
                    <td className="px-3 py-2">{(m.first_air_date || "").slice(0, 4) || "-"}</td>
                    <td className="px-3 py-2">{typeof m.popularity === "number" ? m.popularity.toFixed(1) : "-"}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => importTvToDB(m.id)}
                        className="px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700"
                      >
                        Import (TV)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DB SERIES TABLE */}
      <div className="overflow-x-auto bg-black/40 border border-white/10 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">Series</th>
              <th className="px-3 py-2 text-left">Genres</th>
              <th className="px-3 py-2 text-left">Year</th>
              <th className="px-3 py-2 text-left">Views</th>
              <th className="px-3 py-2 text-left">Slider</th>
              <th className="px-3 py-2 text-left">Kids</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((m) => (
              <tr key={m._id} className="border-t border-white/5">
                <td className="px-3 py-2 flex items-center gap-2">
                  <img
                    src={getImgSrc(m.thumbnail) || undefined}
                    className="w-10 h-14 object-cover rounded"
                    alt={m.title || ""}
                  />
                  <span>{m.title}</span>
                </td>

                <td className="px-3 py-2">
                  {Array.isArray(m.genres) ? m.genres.join(", ") : "-"}
                </td>
                <td className="px-3 py-2">{m.year}</td>
                <td className="px-3 py-2">{m.views || 0}</td>

                <td className="px-3 py-2">
                  {m.isTrending ? (
                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                      Selected
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-300">
                      Not Selected
                    </span>
                  )}

                  <button
                    onClick={() => toggleTrending(m._id)}
                    className={`ml-3 px-2 py-1 text-xs rounded ${
                      m.isTrending ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {m.isTrending ? "Slider ✓" : "Slider +"}
                  </button>
                </td>

                <td className="px-3 py-2">{m.kidsOnly ? "Kids" : "-"}</td>

                <td className="px-3 py-2">
                  <button
                    onClick={() => router.push(`/admin/series/${m._id}/edit`)}
                    className="px-3 py-1 text-xs bg-[#2EA8FF] rounded hover:bg-[#4FB5FF]"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

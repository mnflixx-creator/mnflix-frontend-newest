"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminMoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tmdbMovies, setTmdbMovies] = useState([]);
  const [tmdbMode, setTmdbMode] = useState("discover_popular");
  const [tmdbPage, setTmdbPage] = useState(1);
  const [tmdbQuery, setTmdbQuery] = useState("");

  const [tmdbKind, setTmdbKind] = useState("movie");
  
  const [tmdbView, setTmdbView] = useState(() => {
    if (typeof window === "undefined") return "list";
    return localStorage.getItem("tmdbView") || "list";
  });

  // SORT + FILTER
  const [genreFilter, setGenreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [genres, setGenres] = useState(["all"]);

  // Search & pagination for your own movies
  const [movieSearch, setMovieSearch] = useState("");
  const [moviePage, setMoviePage] = useState(1);
  const MOVIES_PER_PAGE = 25;

  const getImgSrc = (path) => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  };

  // Fetch movies
  const loadMovies = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`)
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMovies();
  }, []);

  // Fetch dynamic genres
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/genres/all`)
      .then((res) => res.json())
      .then((data) => setGenres(["all", ...data]));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("tmdbView", tmdbView);
  }, [tmdbView]);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;

    const q = tmdbQuery.trim();

    const url = q
      ? // 🔢 user typed numeric TMDB id
        /^\d+$/.test(q)
          ? tmdbKind === "movie"
            ? `${base}/api/tmdb/movie/${q}`
            : `${base}/api/tmdb/tv/${q}`           // <-- TV detail route
          : // 🔤 normal text search
            tmdbKind === "movie"
            ? `${base}/api/tmdb/search?q=${encodeURIComponent(q)}&page=${tmdbPage}`
            : `${base}/api/tmdb/search-tv?q=${encodeURIComponent(q)}&page=${tmdbPage}` // <-- TV search route
      : // no search text → keep your movie discover lists
        tmdbMode === "discover_newest"
        ? `${base}/api/tmdb/discover/newest?page=${tmdbPage}`
        : tmdbMode === "discover_popular"
        ? `${base}/api/tmdb/discover/popular?page=${tmdbPage}`
        : `${base}/api/tmdb/${tmdbMode}`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        const list =
          Array.isArray(d) ? d :
          Array.isArray(d?.results) ? d.results :
          d?.id ? [d] : [];

        setTmdbMovies(list);
      })
      .catch(() => setTmdbMovies([]));
  }, [tmdbMode, tmdbPage, tmdbQuery, tmdbKind]);

  useEffect(() => {
    setMoviePage(1);
  }, [genreFilter, sortBy, movieSearch]);

  if (loading) return <p className="text-gray-300">Loading movies…</p>;

  // FILTER
  let filtered = movies;

  // by genre
  if (genreFilter !== "all") {
    filtered = filtered.filter(
      (m) => Array.isArray(m.genres) && m.genres.includes(genreFilter)
    );
  }

  // by text search (title / year / genres)
  if (movieSearch.trim()) {
    const q = movieSearch.trim().toLowerCase();
    filtered = filtered.filter((m) => {
      const title = (m.title || "").toLowerCase();
      const year = (m.year || "").toString();
      const genresText = Array.isArray(m.genres)
        ? m.genres.join(" ").toLowerCase()
        : "";
      return (
        title.includes(q) ||
        year.includes(q) ||
        genresText.includes(q)
      );
    });
  }

  // SORT (always slider first, then chosen sort)
  filtered = [...filtered].sort((a, b) => {
    const A = a.isTrending ? 1 : 0;
    const B = b.isTrending ? 1 : 0;

    // 1) slider first always
    if (B !== A) return B - A;

    // 2) then apply your selected sort
    if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "views_desc") return (b.views || 0) - (a.views || 0);
    if (sortBy === "views_asc") return (a.views || 0) - (b.views || 0);
    if (sortBy === "year_newest") return Number(b.year) - Number(a.year);
    if (sortBy === "year_oldest") return Number(a.year) - Number(b.year);

    return 0;
  });

  // PAGINATION (client-side)
  const totalMoviePages = Math.max(
    1,
    Math.ceil(filtered.length / MOVIES_PER_PAGE)
  );
  const currentMoviePage = Math.min(moviePage, totalMoviePages);
  const startIndex = (currentMoviePage - 1) * MOVIES_PER_PAGE;
  const paginatedMovies = filtered.slice(
    startIndex,
    startIndex + MOVIES_PER_PAGE
  );

    // ⭐ Toggle Trending (Slider) for your own movies list
  const toggleTrending = async (id) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/movies/trending/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("adminToken"),
        },
      }
    );

    // refresh movies after toggle
    loadMovies();
  };

  const importToSlider = async (tmdbId) => {
    const base = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${base}/api/tmdb/import/${tmdbId}`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("adminToken"),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.message || "Import failed");
      return;
    }

    // movie/series created in your Movie collection
    const mongoId = data?.movie?._id || data?.series?._id;

    if (!mongoId) {
      alert("Imported but no movie id returned");
    } else {
      // mark this movie as trending (for landing slider)
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/movies/trending/${mongoId}`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("adminToken"),
          },
        }
      );
    }

    // refresh table so you see it with 'Selected'
    loadMovies();
    alert("Imported ✅ and added to Landing Slider");
  };

  return (
    <div>
      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Movies</h1>
        <button
          onClick={() => router.push("/admin/movies/add")}
          className="px-4 py-2 bg-[#2EA8FF] rounded text-sm font-semibold hover:bg-[#4FB5FF]"
        >
          + Add Movie
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-4 mb-5">
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
          <option value="year_newest">Movie Year (Newest)</option>
          <option value="year_oldest">Movie Year (Oldest)</option>
        </select>

        {/* 🔍 Search inside your own movies */}
        <input
          type="text"
          value={movieSearch}
          onChange={(e) => setMovieSearch(e.target.value)}
          placeholder="Search movies (title / year)…"
          className="bg-black/40 border border-white/10 p-2 rounded text-sm w-56"
        />
      </div>

      {/* MOVIES TABLE */}
      {/* ✅ TMDB PICKER (import to slider) */}
      <div className="mb-6 bg-black/40 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold">TMDB Movies (Import to Slider)</h2>

          <div className="flex items-center gap-2">
            <input
              value={tmdbQuery}
              onChange={(e) => {
                setTmdbQuery(e.target.value);
                setTmdbPage(1);
              }}
              placeholder="Search TMDB..."
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
              <option value="discover_popular">Popular (Discover)</option>
              <option value="discover_newest">Newest (Discover)</option>
              <option value="trending">Trending</option>
              <option value="new">Now Playing</option>
              <option value="popular">Popular</option>
              <option value="top">Top Rated</option>
            </select>

            <select
              className="bg-black/40 border border-white/10 p-2 rounded text-sm"
              value={tmdbKind}
              onChange={(e) => {
                setTmdbKind(e.target.value);
                setTmdbPage(1);
              }}
            >
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
            </select>

            <select
              className="bg-black/40 border border-white/10 p-2 rounded text-sm"
              value={tmdbView}
              onChange={(e) => setTmdbView(e.target.value)}
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>

            {(tmdbMode === "discover_newest" || tmdbMode === "discover_popular" || tmdbQuery.trim()) && (
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
            )}
          </div>
        </div>

        {tmdbView === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {tmdbMovies.map((m) => (
              <div key={m.id} className="bg-white/5 rounded-lg overflow-hidden">
                {m.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                    className="w-full h-44 object-cover"
                    alt={m.title || m.name || ""}
                  />
                )}
                <div className="p-2">
                  <p className="text-xs font-semibold line-clamp-2">
                    {m.title || m.name}
                  </p>

                  <button
                    onClick={() => importToSlider(m.id)}
                    className="mt-2 w-full px-2 py-1 text-xs rounded bg-green-600 hover:bg-green-700"
                  >
                    Import + Slider
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
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Year</th>
                  <th className="px-3 py-2 text-left">Popularity</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {tmdbMovies.map((m) => (
                  <tr key={m.id} className="border-t border-white/5">
                    <td className="px-3 py-2">
                      {m.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                          className="w-10 h-14 object-cover rounded"
                          alt={m.title || m.name || ""}
                        />
                      ) : (
                        <div className="w-10 h-14 bg-white/10 rounded" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-semibold">{m.title || m.name}</div>
                      <div className="text-xs opacity-70 line-clamp-1">{m.overview}</div>
                    </td>
                    <td className="px-3 py-2">{(m.release_date || "").slice(0, 4) || "-"}</td>
                    <td className="px-3 py-2">{typeof m.popularity === "number" ? m.popularity.toFixed(1) : "-"}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => importToSlider(m.id)}
                        className="px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700"
                      >
                        Import + Slider
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="overflow-x-auto bg-black/40 border border-white/10 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">Movie</th>
              <th className="px-3 py-2 text-left">Genres</th>
              <th className="px-3 py-2 text-left">Year</th>
              <th className="px-3 py-2 text-left">Views</th>
              <th className="px-3 py-2 text-left">Slider</th>
              <th className="px-3 py-2 text-left">Kids</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedMovies.map((m) => (
              <tr key={m._id} className="border-t border-white/5">
                <td className="px-3 py-2 flex items-center gap-2">
                  <img
                    src={getImgSrc(m.thumbnail)}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <span>{m.title}</span>
                </td>

                <td className="px-3 py-2">
                  {Array.isArray(m.genres) ? m.genres.join(", ") : "-"}
                </td>
                <td className="px-3 py-2">{m.year}</td>
                <td className="px-3 py-2">{m.views || 0}</td>

                {/* Trending Tag */}
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

                  {/* ⭐ BUTTON TO TOGGLE */}
                  <button
                    onClick={() => toggleTrending(m._id)}
                    className={`ml-3 px-2 py-1 text-xs rounded ${
                      m.isTrending ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {m.isTrending ? "Slider ✓" : "Slider +"}
                  </button>
                </td>

                {/* Kids */}
                <td className="px-3 py-2">{m.kidsOnly ? "Kids" : "-"}</td>

                {/* Edit Button */}
                <td className="px-3 py-2">
                  <button
                    onClick={() => router.push(`/admin/movies/${m._id}/edit`)}
                    className="px-3 py-1 text-xs bg-[#2EA8FF] rounded hover:bg-[#4FB5FF]"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
                <div className="flex items-center justify-between px-4 py-3 text-xs text-white/80">
          <span>
            Showing{" "}
            {filtered.length === 0
              ? 0
              : startIndex + 1}{" "}
            –{" "}
            {Math.min(startIndex + MOVIES_PER_PAGE, filtered.length)} of{" "}
            {filtered.length} movies
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentMoviePage === 1}
              onClick={() => setMoviePage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded bg-white/10 disabled:opacity-40 hover:bg-white/20 text-xs"
            >
              Prev
            </button>
            <span>
              Page {currentMoviePage} / {totalMoviePages}
            </span>
            <button
              disabled={currentMoviePage === totalMoviePages}
              onClick={() =>
                setMoviePage((p) => Math.min(totalMoviePages, p + 1))
              }
              className="px-3 py-1 rounded bg-white/10 disabled:opacity-40 hover:bg-white/20 text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

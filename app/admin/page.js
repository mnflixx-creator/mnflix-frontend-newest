"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminMoviesPage() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;  // ✅ use same backend URL

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // SORT + FILTER
  const [genreFilter, setGenreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [genres, setGenres] = useState(["all"]);

  // Fetch movies (safe, works in production too)
  useEffect(() => {
    if (!API_BASE) return;

    let cancelled = false;

    async function loadMovies() {
      try {
        const res = await fetch(`${API_BASE}/api/movies`);

        if (!res.ok) {
          // ❗ if 429 or 500, DO NOT call res.json()
          console.error("Movies fetch failed:", res.status);
          return;
        }

        const data = await res.json().catch(() => []);
        if (!cancelled) setMovies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Movies fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMovies();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  // Fetch dynamic genres
  useEffect(() => {
    if (!API_BASE) return;

    let cancelled = false;

    async function loadGenres() {
      try {
        const res = await fetch(`${API_BASE}/api/movies/genres/all`);

        if (!res.ok) {
          console.error("Genres fetch failed:", res.status);
          return;
        }

        const data = await res.json().catch(() => []);
        if (!cancelled) setGenres(["all", ...(Array.isArray(data) ? data : [])]);
      } catch (err) {
        console.error("Genres fetch error:", err);
      }
    }

    loadGenres();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  if (loading) return <p className="text-gray-300">Loading movies…</p>;

  // FILTER
  let filtered = movies;
  if (genreFilter !== "all") {
    filtered = filtered.filter((m) => m.genres?.includes(genreFilter)); // ✅ FIXED
  }

  // SORT
  if (sortBy === "newest") {
    filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  if (sortBy === "oldest") {
    filtered = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
  if (sortBy === "views_desc") {
    filtered = filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  }
  if (sortBy === "views_asc") {
    filtered = filtered.sort((a, b) => (a.views || 0) - (b.views || 0));
  }
  if (sortBy === "year_newest") {
    filtered = filtered.sort((a, b) => Number(b.year) - Number(a.year));
  }
  if (sortBy === "year_oldest") {
    filtered = filtered.sort((a, b) => Number(a.year) - Number(b.year));
  }

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
      <div className="flex items-center gap-4 mb-5">
        
        {/* GENRE FILTER */}
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

        {/* SORT OPTIONS */}
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
      </div>

      {/* MOVIES TABLE */}
      <div className="overflow-x-auto bg-black/40 border border-white/10 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">Movie</th>
              <th className="px-3 py-2 text-left">Genres</th> {/* ✅ FIXED */}
              <th className="px-3 py-2 text-left">Year</th>
              <th className="px-3 py-2 text-left">Views</th>
              <th className="px-3 py-2 text-left">Trending</th>
              <th className="px-3 py-2 text-left">Kids</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((m) => (
              <tr key={m._id} className="border-t border-white/5">
                
                <td className="px-3 py-2 flex items-center gap-2">
                  <img
                    src={`${API_BASE}${m.thumbnail}`}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <span>{m.title}</span>
                </td>

                <td className="px-3 py-2">{m.genres?.join(", ")}</td> {/* ✅ FIXED */}

                <td className="px-3 py-2">{m.year}</td>
                <td className="px-3 py-2">{m.views || 0}</td>

                <td className="px-3 py-2">
                  {m.isTrending ? (
                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">Yes</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-300">No</span>
                  )}
                </td>

                <td className="px-3 py-2">{m.kidsOnly ? "Kids" : "-"}</td>

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
      </div>
    </div>
  );
}

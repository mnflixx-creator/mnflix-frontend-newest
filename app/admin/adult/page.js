"use client";

import { useEffect, useState } from "react";

export default function AdminAdultPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [q, setQ] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState([]);

  const [adultLoading, setAdultLoading] = useState(false);
  const [adultList, setAdultList] = useState([]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  async function loadAdultList() {
    setAdultLoading(true);
    try {
      const res = await fetch(`${API}/api/movies/adult?limit=60`);
      const data = await res.json();
      setAdultList(Array.isArray(data) ? data : []);
    } catch {
      setAdultList([]);
    } finally {
      setAdultLoading(false);
    }
  }

  useEffect(() => {
    loadAdultList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔍 search (debounced)
  useEffect(() => {
    const t = setTimeout(async () => {
      const text = q.trim();
      if (!text) {
        setResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const res = await fetch(
          `${API}/api/movies/admin/search-local?q=${encodeURIComponent(text)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [q, API, token]);

  async function toggleAdult(movie) {
    if (!token) return alert("No admin token");

    const next = !movie.isAdult;

    try {
      const res = await fetch(`${API}/api/movies/admin/adult/${movie._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isAdult: next,
          // popularity: movie.popularity, // optional (you can add UI later)
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Failed");
        return;
      }

      // update search results list instantly
      setResults((prev) =>
        prev.map((m) => (m._id === movie._id ? { ...m, isAdult: next } : m))
      );

      // refresh adult list
      loadAdultList();
    } catch {
      alert("Failed");
    }
  }

  const imgURL = (path) =>
    path?.startsWith("http") ? path : `${API}${path}`;

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold">Adult (18+) Picker</h1>
      <p className="text-sm text-gray-400 mt-1">
        Search your Mongo movies, then mark ON/OFF to show on Adult page.
      </p>

      {/* Search box */}
      <div className="mt-6 flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type movie title..."
          className="w-full max-w-xl px-4 py-2 rounded bg-black/40 border border-white/10 outline-none"
        />
        <button
          onClick={() => {
            setQ("");
            setResults([]);
          }}
          className="px-4 py-2 rounded bg-white/10 hover:bg-white/15 border border-white/10"
        >
          Clear
        </button>
      </div>

      {/* Search results */}
      <div className="mt-4">
        {searchLoading && (
          <div className="text-sm text-gray-400">Searching...</div>
        )}

        {!searchLoading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((m) => (
              <div
                key={m._id}
                className="flex gap-3 p-3 rounded-lg bg-black/40 border border-white/10"
              >
                <img
                  src={imgURL(m.thumbnail)}
                  alt={m.title}
                  className="w-16 h-24 object-cover rounded"
                />

                <div className="flex-1">
                  <div className="font-semibold line-clamp-1">{m.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {m.year || "—"} • {m.type} • ⭐{" "}
                    {Number(m.rating || 0).toFixed(1)} • popularity:{" "}
                    {Number(m.popularity || 0).toFixed(0)}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        m.isAdult ? "bg-red-500/80" : "bg-white/10"
                      }`}
                    >
                      {m.isAdult ? "18+ ON" : "18+ OFF"}
                    </span>

                    <button
                      onClick={() => toggleAdult(m)}
                      className={`text-sm px-3 py-1.5 rounded font-semibold ${
                        m.isAdult
                          ? "bg-white/10 hover:bg-white/15 border border-white/10"
                          : "bg-red-500/80 hover:bg-red-500"
                      }`}
                    >
                      {m.isAdult ? "Remove" : "Mark Adult"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!searchLoading && q.trim() && results.length === 0 && (
          <div className="text-sm text-gray-400 mt-2">
            No results (only searches your Mongo movies).
          </div>
        )}
      </div>

      {/* Current Adult list */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Currently on Adult page</h2>
          <button
            onClick={loadAdultList}
            className="px-3 py-2 rounded bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
          >
            Refresh
          </button>
        </div>

        {adultLoading && (
          <div className="text-sm text-gray-400 mt-3">Loading...</div>
        )}

        {!adultLoading && adultList.length === 0 && (
          <div className="text-sm text-gray-400 mt-3">
            No adult movies yet.
          </div>
        )}

        {!adultLoading && adultList.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
            {adultList.map((m) => (
              <div
                key={m._id}
                className="cursor-pointer bg-black/30 border border-white/10 rounded-lg p-2"
                title={m.title}
              >
                <img
                  src={imgURL(m.thumbnail)}
                  alt={m.title}
                  className="w-full h-48 object-cover rounded"
                />
                <div className="text-xs text-gray-300 mt-2 line-clamp-1">
                  {m.title}
                </div>
                <div className="text-[11px] text-gray-500">
                  pop: {Number(m.popularity || 0).toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

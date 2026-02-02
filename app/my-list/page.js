"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyListPage() {
  const router = useRouter();
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // ✅ LOAD MY LIST
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    fetch(`${API_BASE}/api/movies/favorite/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setMyList(data || []))
      .finally(() => setLoading(false));
  }, [router]);

  // ✅ REMOVE FROM MY LIST
  const removeFromList = async (movieId) => {
    const token = localStorage.getItem("token");

    await fetch(`${API_BASE}/api/movies/favorite/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ movieId }),
    });

    // ✅ REMOVE FROM UI INSTANTLY
    setMyList((prev) => prev.filter((m) => m._id !== movieId));
  };

  const imgURL = (path) => (path?.startsWith("http") ? path : `${API_BASE}${path}`);

  if (loading) {
    return <div className="text-white p-10 text-xl">Түр хүлээнэ үү...</div>;
  }

  return (
    <div className="bg-black min-h-screen text-white px-4 pt-0 pb-10 md:px-8 md:pt-10 md:pb-10">
      <div className="flex items-end justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">✅ Миний жагсаалт</h1>
          <p className="text-gray-400 text-sm mt-1">
            {myList.length} {myList.length === 1 ? "контент" : "контент"}
          </p>
        </div>
      </div>

      {myList.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-gray-300 text-lg font-semibold">
            Таны жагсаалт хоосон байна.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Та кино дээрээс “Миний жагсаалт” дарж нэмээрэй.
          </p>
          <button
            onClick={() => router.push("/home")}
            className="mt-5 px-5 py-2.5 rounded bg-white/10 hover:bg-white/15 border border-white/10 text-white transition"
          >
            Нүүр хуудас руу
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:flex md:gap-6 md:flex-wrap">
          {myList.map((movie) => (
            <div key={movie._id} className="w-full md:w-[180px]">
              {/* POSTER CARD */}
              <div
                onClick={() => router.push(`/movie/${movie._id}`)}
                className="relative cursor-pointer rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-lg group"
              >
                <img
                  src={imgURL(movie.thumbnail)}
                  className="w-full h-[220px] sm:h-[240px] md:h-[260px] object-cover
                  group-hover:scale-110 transition duration-300"
                  alt={movie.title}
                />

                {/* Gradient for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* ✅ ADDED BADGE */}
                <div className="absolute top-2 left-2 bg-green-600/90 text-[11px] px-2 py-1 rounded-full backdrop-blur-md border border-white/10">
                  ✔ Added
                </div>

                {/* Title overlay (mobile nicer) */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm line-clamp-1">
                    {movie.title}
                  </p>
                </div>
              </div>

              {/* ✅ REMOVE BUTTON */}
              <button
                onClick={() => removeFromList(movie._id)}
                className="mt-2 w-full bg-red-600/90 hover:bg-red-600 text-white text-xs py-2.5 rounded-lg transition border border-white/10"
              >
                🗑 Устгах
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

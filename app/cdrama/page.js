"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CDramaPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!API) return;
    fetch(`${API}/api/movies/type/cdrama`)
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [API]);

  const imgURL = (path) =>
    path?.startsWith("http") ? path : `${API}${path || ""}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading C-Dramas...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-24 pb-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">C-Dramas</h1>

        {items.length === 0 ? (
          <p className="text-gray-400">No C-Drama added yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((m) => (
              <div
                key={m._id}
                className="cursor-pointer group"
                onClick={() => router.push(`/movie/${m._id}`)}
              >
                <div className="relative rounded-lg overflow-hidden bg-white/5">
                  <img
                    src={imgURL(m.thumbnail)}
                    alt={m.title}
                    className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <p className="mt-2 text-sm font-semibold line-clamp-1">
                  {m.title}
                </p>
                {m.year && (
                  <p className="text-xs text-gray-400">{m.year}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

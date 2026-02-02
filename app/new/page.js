"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPage() {
  const router = useRouter();
  const [all, setAll] = useState([]);

  const imgURL = (path) =>
    path?.startsWith("http")
      ? path
      : `${process.env.NEXT_PUBLIC_API_URL}${path}`;

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`)
      .then((res) => res.json())
      .then((data) => setAll(data || []));
  }, []);

  if (all.length === 0) {
    return <div className="text-white p-10 text-xl">Түр хүлээнэ үү...</div>;
  }

  return (
    <div className="bg-black min-h-screen text-white">
      {/* ✅ PAGE TITLE (better on mobile, same on desktop) */}
      <div className="pt-0 md:pt-10 px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Шинээр нэмэгдсэн</h1>
        <p className="mt-1 text-sm text-gray-400">
          {all.length} контент
        </p>
      </div>

      {/* ✅ GRID (mobile looks cleaner, desktop unchanged) */}
      <div className="px-4 sm:px-6 md:px-8 mt-6 pb-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4">
          {all.map((m) => (
            <div
              key={m._id}
              onClick={() => router.push(`/movie/${m._id}`)}
              className="cursor-pointer relative group rounded-xl"
            >
              {/* ✅ RATING BADGE */}
              {m.rating > 0 && (
                <div
                  className="absolute top-2 left-2 z-30 pointer-events-none
                  bg-black/80 text-yellow-400 text-[11px] sm:text-xs px-2 py-0.5
                  rounded-full backdrop-blur-md font-semibold"
                >
                  ⭐ {Number(m.rating).toFixed(1)}
                </div>
              )}

              {/* ✅ POSTER */}
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img
                  src={imgURL(m.thumbnail)}
                  alt={m.title}
                  className="
                    w-full aspect-[2/3] object-cover
                    transition duration-300
                    md:group-hover:scale-110
                    active:scale-[0.98]
                  "
                />

                {/* ✅ subtle bottom fade for title readability (mobile) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" />
              </div>

              {/* ✅ TEXT (clean + clamp) */}
              <p className="mt-2 font-medium text-sm sm:text-[15px] line-clamp-1">
                {m.title}
              </p>

              <span className="text-xs text-gray-400">
                {m.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

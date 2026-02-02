"use client";

import { useEffect, useState } from "react";

export default function HomeHeroSlider({ items = [] }) {
  const [index, setIndex] = useState(0);

  // ✅ 1) PRELOAD all banner images once
  useEffect(() => {
    if (typeof window === "undefined") return;
    items.forEach((it) => {
      if (!it?.banner) return;
      const img = new Image();
      img.src = it.banner;
    });
  }, [items]);

  // ✅ 2) AUTOPLAY – change slide every 7s
  useEffect(() => {
    if (!items.length) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 7000);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  const current = items[index];

  const handlePrev = () => {
    setIndex((i) => (i - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setIndex((i) => (i + 1) % items.length);
  };

  return (
    <div className="relative w-full aspect-[16/9] max-h-[480px] rounded-2xl overflow-hidden bg-black">
      {/* 🔥 SLIDES – all rendered, only active one visible with fade */}
      {items.map((item, i) => (
        <div
          key={item._id || item.tmdbId || i}
          className={`
            absolute inset-0
            transition-opacity duration-700 ease-out
            ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}
          `}
        >
          {/* background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: item.banner ? `url(${item.banner})` : "none",
            }}
          />
          {/* dark gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* text content */}
          <div className="relative z-20 h-full flex flex-col justify-end px-4 sm:px-8 pb-6 sm:pb-10">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 drop-shadow-lg">
              {item.title}
            </h2>
            {item.description && (
              <p className="max-w-xl text-sm sm:text-base text-white/80 line-clamp-3 mb-4">
                {item.description}
              </p>
            )}
            {/* you can keep your “Үзэх” button here if you want */}
          </div>
        </div>
      ))}

      {/* arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2
                   w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70
                   text-white flex items-center justify-center text-lg"
      >
        ‹
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2
                   w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70
                   text-white flex items-center justify-center text-lg"
      >
        ›
      </button>

      {/* dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-4 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

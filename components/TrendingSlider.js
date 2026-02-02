"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function TrendingSlider({ movies }) {
  const [selected, setSelected] = useState(null);

  const scroll = (direction) => {
    const container = document.getElementById("trend-scroll");
    const amount = container.clientWidth * 0.8;

    container.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* TITLE & ARROWS */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-2xl font-extrabold">Trending Now</h2>

        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="px-3 py-1 text-xl bg-black/40 rounded hover:bg-black/60"
          >
            ‹
          </button>
          <button
            onClick={() => scroll("right")}
            className="px-3 py-1 text-xl bg-black/40 rounded hover:bg-black/60"
          >
            ›
          </button>
        </div>
      </div>

      {/* SLIDER */}
      <div
        id="trend-scroll"
        className="flex gap-4 overflow-x-auto no-scrollbar px-2"
      >
        {movies.map((movie, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.12 }}
            className="relative min-w-[220px] h-[330px] cursor-pointer rounded-lg overflow-hidden shadow-lg"
            onClick={() => setSelected(movie)}
          >
            <img
              src={movie.img}
              className="w-full h-full object-cover"
            />

            {/* NUMBER */}
            <div className="absolute bottom-2 left-2 text-6xl font-black text-white drop-shadow-[0_0_10px_black]">
              {index + 1}
            </div>
          </motion.div>
        ))}
      </div>

      {/* POPUP */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-[#0a0a0a] max-w-3xl w-full rounded-xl overflow-hidden shadow-2xl"
            >
              {/* IMAGE */}
              <img src={selected.img} className="w-full h-72 object-cover" />

              {/* CONTENT */}
              <div className="p-6">
                <h2 className="text-3xl font-extrabold mb-3">{selected.title}</h2>

                <div className="flex gap-3 mb-4">
                  <span className="px-2 py-1 bg-white/10 rounded text-sm">
                    {selected.year}
                  </span>
                  <span className="px-2 py-1 bg-white/10 rounded text-sm">
                    {selected.age}
                  </span>
                  <span className="px-2 py-1 bg-white/10 rounded text-sm">
                    {selected.genre}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-6">{selected.desc}</p>

                <button className="px-6 py-3 bg-[#2EA8FF] hover:bg-[#4FB5FF] rounded font-semibold">
                  Watch Now
                </button>
              </div>

              {/* CLOSE BUTTON */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 text-3xl text-white"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

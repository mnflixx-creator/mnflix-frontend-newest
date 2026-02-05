"use client";

export default function Row({ title, movies }) {
  return (
    <div className="text-white mb-8 px-6">
      <h2 className="text-xl font-bold mb-3">{title}</h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {movies.map((movie, index) => (
          <div
            key={index}
            className="min-w-[250px] max-w-[250px] cursor-pointer hover:scale-105 transition"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.currentTarget.click();
              }
            }}
          >
            <img
              src={movie.thumbnail}
              className="rounded-lg w-full h-40 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

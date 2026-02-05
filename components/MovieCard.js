"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MovieCard({ movie, progress }) {
  const router = useRouter();
  const [hover, setHover] = useState(false);

  const subscribed =
    typeof window !== "undefined" &&
    localStorage.getItem("subscriptionActive") === "true";

  const goToMovie = () => {
    if (!subscribed) router.push("/subscribe");
    else router.push(`/movie/${movie._id}`);
  };

  return (
    <div
      onClick={goToMovie}
      className="relative min-w-[160px] mr-4 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToMovie();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Preview or Thumbnail */}
      <div className="relative w-[160px] h-[240px] rounded-lg overflow-hidden">
        {!hover ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}${movie.thumbnail}`}
            className="w-[160px] h-[240px] object-cover rounded-lg"
            alt={movie.title}
          />
        ) : (
          <video
            src={movie.player1}
            autoPlay
            muted
            loop
            className="w-[160px] h-[240px] object-cover"
          />
        )}
      </div>

      {/* LOCK OVERLAY */}
      {!subscribed && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 12V8a4 4 0 00-8 0v4m-2 0h12v8H6v-8z"
            />
          </svg>
        </div>
      )}

      {/* Progress bar */}
      {progress > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
          <div
            className="h-full bg-mnflix_light_blue"
            style={{
              width: `${
                progress.duration > 0
                  ? (progress.progress / progress.duration) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      )}

      <p className="text-white text-sm mt-2">{movie.title}</p>
    </div>
  );
}

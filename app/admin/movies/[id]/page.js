"use client";

import { useEffect, useState } from "react";

export default function AdminMovieDetail({ params }) {
  const { id } = params;
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then((data) => setMovie(data));
  }, [id]);

  if (!movie) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{movie.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {movie.banner && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${movie.banner}`}
              className="w-full rounded mb-4"
            />
          )}
          {movie.thumbnail && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${movie.thumbnail}`}
              className="w-40 rounded"
            />
          )}
        </div>

        <div className="space-y-2">
          <p><strong>Year:</strong> {movie.year}</p>
          <p><strong>Genre:</strong> {movie.genre}</p>
          <p><strong>Kids only:</strong> {movie.kidsOnly ? "Yes" : "No"}</p>
          <p><strong>Description:</strong></p>
          <p className="text-sm text-gray-300">{movie.description}</p>
          <div className="mt-3 text-sm">
            <p><strong>Player 1:</strong> {movie.player1}</p>
            <p><strong>Player 2:</strong> {movie.player2}</p>
            <p><strong>Player 3:</strong> {movie.player3}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

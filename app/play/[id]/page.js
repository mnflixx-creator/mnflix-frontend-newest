"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PStreamPlayer from "@/components/PStreamPlayer";

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState(0);

  // Check authentication and load movie data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!id) {
      setError("No movie ID provided");
      setLoading(false);
      return;
    }

    // Fetch movie data
    fetch(`${API}/api/movies/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load movie: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setMovie(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading movie:", err);
        setError(err.message || "Failed to load movie");
        setLoading(false);
      });
  }, [id, API, router]);

  // Check if this is a series
  const isSeries = movie && ["series", "tv", "anime", "kdrama", "cdrama"].includes(movie.type);

  // Handle progress save
  const handleProgressSave = (currentTime, duration) => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;

    const seasonNumber = isSeries ? selectedSeason + 1 : null;
    const episodeNumber = isSeries ? selectedEpisode + 1 : null;

    fetch(`${API}/api/progress/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        movieId: id,
        season: seasonNumber,
        episode: episodeNumber,
        currentTime: Math.floor(currentTime),
        duration: Math.floor(duration),
        completed: currentTime / duration >= 0.93,
      }),
    }).catch((err) => {
      console.error("Failed to save progress:", err);
    });
  };

  // Handle back navigation
  const handleBack = () => {
    router.push(`/movie/${id}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !movie) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center px-6">
          <p className="text-red-500 text-xl mb-4">⚠️ {error || "Movie not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Determine season/episode for display
  const resolvedSeasonNumber = isSeries ? selectedSeason + 1 : 1;
  const resolvedEpisodeNumber = isSeries ? selectedEpisode + 1 : 1;

  // Build title for player
  const title = isSeries
    ? `${movie.title} - S${resolvedSeasonNumber}:E${resolvedEpisodeNumber}`
    : movie.title;

  return (
    <PStreamPlayer
      movieId={movie._id || id}
      tmdbId={movie.tmdbId ? String(movie.tmdbId) : ""}
      type={isSeries ? "series" : "movie"}
      movieType={movie.type || "movie"}
      season={resolvedSeasonNumber}
      episode={resolvedEpisodeNumber}
      title={title}
      onBack={handleBack}
      onProgressSave={handleProgressSave}
      seasons={isSeries ? movie.seasons : null}
      selectedSeason={selectedSeason}
      selectedEpisode={selectedEpisode}
      onSeasonChange={setSelectedSeason}
      onEpisodeChange={setSelectedEpisode}
    />
  );
}

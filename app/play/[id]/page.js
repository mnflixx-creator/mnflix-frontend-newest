"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PStreamPlayer from "@/components/PStreamPlayer";

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState(0);

  // Check if user has subscription
  const [hasSubscription, setHasSubscription] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Fetch movie data
  useEffect(() => {
    if (!id || !API_BASE) return;

    const fetchMovie = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/api/movies/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch movie");
        }

        const data = await res.json();
        setMovie(data);
      } catch (err) {
        setError(err.message || "Failed to load movie");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, API_BASE]);

  // Check subscription status
  useEffect(() => {
    if (!API_BASE) return;

    const checkSubscription = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/check-subscription`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setHasSubscription(data.hasActiveSubscription === true);
        }
      } catch (err) {
        console.error("Subscription check failed:", err);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkSubscription();
  }, [API_BASE]);

  // Restore saved episode position for series
  useEffect(() => {
    if (!movie || !movie._id) return;

    const isSeries = ["series", "tv", "anime", "kdrama", "cdrama"].includes(movie.type);
    if (!isSeries) return;

    try {
      const saved = localStorage.getItem(`lastEpisode_${movie._id}`);
      if (saved) {
        const { season, episode } = JSON.parse(saved);
        if (
          typeof season === "number" &&
          typeof episode === "number" &&
          movie.seasons?.[season]?.episodes?.[episode]
        ) {
          setSelectedSeason(season);
          setSelectedEpisode(episode);
        }
      }
    } catch (err) {
      console.error("Failed to restore episode position:", err);
    }
  }, [movie]);

  // Save episode position for series
  useEffect(() => {
    if (!movie || !movie._id) return;

    const isSeries = ["series", "tv", "anime", "kdrama", "cdrama"].includes(movie.type);
    if (!isSeries) return;

    try {
      localStorage.setItem(
        `lastEpisode_${movie._id}`,
        JSON.stringify({ season: selectedSeason, episode: selectedEpisode })
      );
    } catch (err) {
      console.error("Failed to save episode position:", err);
    }
  }, [movie, selectedSeason, selectedEpisode]);

  const handleBack = () => {
    router.push(`/movie/${id}`);
  };

  const handleProgressSave = async (position, duration) => {
    if (!movie || !API_BASE) return;

    try {
      const isSeries = ["series", "tv", "anime", "kdrama", "cdrama"].includes(movie.type);
      const progressData = {
        movieId: movie._id,
        position,
        duration,
        ...(isSeries && {
          season: resolveSeasonNumber(),
          episode: resolveEpisodeNumber(),
        }),
      };

      await fetch(`${API_BASE}/api/progress/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(progressData),
      });
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  const resolveSeasonNumber = () => {
    const isSeries = ["series", "tv", "anime", "kdrama", "cdrama"].includes(movie?.type);
    if (!isSeries) return 0;
    const s = movie?.seasons?.[selectedSeason];
    const n = s?.seasonNumber;
    return Number.isFinite(n) && n >= 1 ? n : selectedSeason + 1;
  };

  const resolveEpisodeNumber = () => {
    const isSeries = ["series", "tv", "anime", "kdrama", "cdrama"].includes(movie?.type);
    if (!isSeries) return 0;
    const s = movie?.seasons?.[selectedSeason];
    const ep = s?.episodes?.[selectedEpisode];
    const n = ep?.episodeNumber;
    return Number.isFinite(n) && n >= 1 ? n : selectedEpisode + 1;
  };

  // Loading state
  if (loading || checkingAccess) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
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
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-red-500 text-xl mb-4">⚠️ {error || "Movie not found"}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Subscription check
  if (!hasSubscription && movie.requiresSubscription !== false) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-white text-xl mb-4">🔒 Subscription Required</p>
          <p className="text-gray-400 mb-6">Please subscribe to watch this content.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/subscribe")}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Subscribe
            </button>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSeries = ["series", "tv", "anime", "kdrama", "cdrama"].includes(movie.type);
  const isZentlifyTitle = movie?.tmdbId && movie?.source !== "manual";

  // Get title for player
  let playerTitle = movie.title;
  if (isSeries && movie.seasons?.[selectedSeason]?.episodes?.[selectedEpisode]) {
    const ep = movie.seasons[selectedSeason].episodes[selectedEpisode];
    playerTitle = `${movie.title} - S${resolveSeasonNumber()}:E${resolveEpisodeNumber()} ${ep.title || ""}`;
  }

  return (
    <PStreamPlayer
      movieId={movie._id}
      tmdbId={isZentlifyTitle ? movie.tmdbId : null}
      type={isSeries ? "series" : "movie"}
      movieType={movie.type}
      season={resolveSeasonNumber()}
      episode={resolveEpisodeNumber()}
      title={playerTitle}
      onBack={handleBack}
      onProgressSave={handleProgressSave}
    />
  );
}

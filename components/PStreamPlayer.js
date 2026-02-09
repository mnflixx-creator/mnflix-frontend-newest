"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import shaka from "shaka-player";
import {
  getStoredProgress,
  saveStoredProgress,
  isCompletedPosition,
} from "@/lib/progressUtils";

// Provider configuration
const PROVIDER_PRIORITY = ["lush", "flow", "sonata", "zen", "breeze", "nova"];

/**
 * PStreamPlayer - A P-Stream styled video player component
 * Integrates with Zenflify provider for streaming
 */
export default function PStreamPlayer({
  movieId,
  tmdbId,
  type = "movie",
  movieType,
  season = 1,
  episode = 1,
  title = "",
  onBack,
  onProgressSave,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const shakaPlayerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

  // State
  const [servers, setServers] = useState([]);
  const [activeServer, setActiveServer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showCenterPlay, setShowCenterPlay] = useState(true);
  const [buffering, setBuffering] = useState(false);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Auto-hide controls after 3 seconds of inactivity
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Load streaming sources from Zenflify
  useEffect(() => {
    let cancelled = false;

    const loadSources = async () => {
      setLoading(true);
      setError("");
      setServers([]);
      setActiveServer(0);

      if (!tmdbId) {
        setLoading(false);
        setError("No stream source.");
        return;
      }

      try {
        const s = season || 1;
        const e = episode || 1;
        const encodedTitle = encodeURIComponent(title || "");

        // Determine endpoint based on type
        const isAnime = movieType === "anime";
        const isTvLike = ["series", "kdrama", "cdrama"].includes(movieType);
        const shouldUseSeriesEndpoint = isTvLike && type !== "movie";

        const endpoints = [];
        if (isAnime) {
          endpoints.push(
            `/api/zentlify/anime/${tmdbId}?season=${s}&episode=${e}&title=${encodedTitle}`,
            `/api/zentlify/series/${tmdbId}?season=${s}&episode=${e}&title=${encodedTitle}`
          );
        } else if (shouldUseSeriesEndpoint) {
          endpoints.push(
            `/api/zentlify/series/${tmdbId}?season=${s}&episode=${e}&title=${encodedTitle}`
          );
        } else {
          endpoints.push(`/api/zentlify/movie/${tmdbId}?title=${encodedTitle}`);
        }

        let data = {};
        for (const endpoint of endpoints) {
          const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) continue;
          data = await res.json().catch(() => ({}));
          if (data && (data.streams || data.sources || data.result)) break;
        }

        if (cancelled) return;

        if (!data || (!data.streams && !data.sources && !data.result)) {
          throw new Error("Failed to load streaming sources");
        }

        const rawStreams =
          data.streams ||
          data.sources ||
          data.result?.streams ||
          data.result?.sources ||
          [];

        // Normalize streams
        const normalizedStreams = (Array.isArray(rawStreams) ? rawStreams : [])
          .map((st, i) => {
            const rawProvider = (st.provider || "").toLowerCase();
            const rawName = (st.name || st.title || "").toLowerCase();

            let providerKey = "";
            if (rawProvider.includes("lush") || rawName.includes("lush") ||
                rawProvider.includes("atlas") || rawName.includes("atlas")) {
              providerKey = "lush";
            } else if (rawProvider.includes("flow") || rawName.includes("flow")) {
              providerKey = "flow";
            } else if (rawProvider.includes("sonata") || rawName.includes("sonata")) {
              providerKey = "sonata";
            } else if (rawProvider.includes("breeze") || rawName.includes("breeze")) {
              providerKey = "breeze";
            } else if (rawProvider.includes("nova") || rawName.includes("nova")) {
              providerKey = "nova";
            } else if (rawProvider.includes("zen") || rawName.includes("zen")) {
              providerKey = "zen";
            } else if (rawProvider.includes("neko") || rawName.includes("neko")) {
              providerKey = "neko";
            } else {
              providerKey = "unknown";
            }

            return {
              id: i + 1,
              name: st.name || st.title || `Server ${i + 1}`,
              url: st.url || st.file || st.src || "",
              provider: providerKey,
              quality: st.quality || "auto",
            };
          })
          .filter((s) => s.url);

        // Sort by provider priority
        normalizedStreams.sort((a, b) => {
          const aIdx = PROVIDER_PRIORITY.indexOf(a.provider);
          const bIdx = PROVIDER_PRIORITY.indexOf(b.provider);
          const aPrio = aIdx === -1 ? 999 : aIdx;
          const bPrio = bIdx === -1 ? 999 : bIdx;
          return aPrio - bPrio;
        });

        if (normalizedStreams.length === 0) {
          throw new Error("No valid streaming sources found");
        }

        setServers(normalizedStreams);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load stream");
          setLoading(false);
        }
      }
    };

    loadSources();
    return () => {
      cancelled = true;
    };
  }, [API_BASE, tmdbId, type, movieType, season, episode, title]);

  // Initialize Shaka Player
  useEffect(() => {
    if (!videoRef.current || !servers[activeServer]) return;

    const video = videoRef.current;
    const streamUrl = servers[activeServer].url;

    if (!streamUrl) return;

    let player = null;

    const initPlayer = async () => {
      try {
        setBuffering(true);

        // Install polyfills
        shaka.polyfill.installAll();

        if (!shaka.Player.isBrowserSupported()) {
          setError("Browser not supported for streaming");
          setBuffering(false);
          return;
        }

        player = new shaka.Player(video);
        shakaPlayerRef.current = player;

        // Configure player
        player.configure({
          streaming: {
            bufferingGoal: 30,
            rebufferingGoal: 5,
            bufferBehind: 30,
          },
        });

        // Event listeners
        player.addEventListener("error", (event) => {
          console.error("Shaka error:", event.detail);
          setError("Playback error occurred");
        });

        // Load the stream
        await player.load(streamUrl);

        // Restore progress
        const progressKey = movieId ? `progress_${movieId}` : null;
        if (progressKey) {
          const stored = getStoredProgress(progressKey);
          if (stored && stored.position > 0 && !isCompletedPosition(stored.position, video.duration)) {
            video.currentTime = stored.position;
          }
        }

        setBuffering(false);
      } catch (err) {
        console.error("Player init error:", err);
        setError("Failed to initialize player");
        setBuffering(false);
      }
    };

    initPlayer();

    return () => {
      if (player) {
        player.destroy().catch(() => {});
      }
      shakaPlayerRef.current = null;
    };
  }, [servers, activeServer, movieId]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleWaiting = () => setBuffering(true);
    const handleCanPlay = () => setBuffering(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Save progress periodically
  useEffect(() => {
    if (!movieId || !videoRef.current) return;

    const progressKey = `progress_${movieId}`;

    const saveProgress = () => {
      const video = videoRef.current;
      if (!video || !isFinite(video.currentTime) || !isFinite(video.duration)) return;
      
      if (video.currentTime > 5) {
        saveStoredProgress(progressKey, {
          position: video.currentTime,
          duration: video.duration,
          timestamp: Date.now(),
        });
        onProgressSave?.(video.currentTime, video.duration);
      }
    };

    progressIntervalRef.current = setInterval(saveProgress, 5000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        saveProgress(); // Final save
      }
    };
  }, [movieId, onProgressSave]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(10);
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Player controls
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setShowCenterPlay(false);
    } else {
      video.pause();
    }
  };

  const seek = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    video.muted = newVolume === 0;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const switchServer = () => {
    const nextIndex = (activeServer + 1) % servers.length;
    setActiveServer(nextIndex);
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading player...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center px-6">
          <p className="text-red-500 text-xl mb-4">⚠️ {error}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50"
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
      onClick={() => {
        if (showCenterPlay) {
          togglePlay();
        } else {
          resetControlsTimeout();
        }
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
      />

      {/* Center play button (before playing) */}
      {showCenterPlay && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition pointer-events-auto"
          >
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}

      {/* Loading spinner */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Top control bar */}
      <div
        className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-white hover:text-gray-300 transition"
            title="Back"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white text-lg font-medium truncate flex-1">{title}</h1>
        </div>
      </div>

      {/* Bottom control bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-4 hover:h-2 transition-all"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-red-600 rounded-full relative"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full"></div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="text-white hover:text-gray-300 transition"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Time display */}
          <span className="text-white text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1"></div>

          {/* Server switch (if multiple) */}
          {servers.length > 1 && (
            <button
              onClick={switchServer}
              className="text-white text-sm hover:text-gray-300 transition px-3 py-1 bg-white/10 rounded"
              title="Switch server"
            >
              Server {activeServer + 1}/{servers.length}
            </button>
          )}

          {/* Volume control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-white hover:text-gray-300 transition"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, white ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%)`,
              }}
            />
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-gray-300 transition"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

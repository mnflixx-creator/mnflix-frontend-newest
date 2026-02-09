"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import shaka from "shaka-player";
import {
  getStoredProgress,
  saveStoredProgress,
  isCompletedPosition,
} from "@/lib/progressUtils";
import TopBar from "@/components/player/TopBar";
import PlayerControls from "@/components/player/PlayerControls";
import QualitySelector from "@/components/player/QualitySelector";
import SpeedSelector from "@/components/player/SpeedSelector";
import SettingsMenu from "@/components/player/SettingsMenu";
import EpisodeSelector from "@/components/player/EpisodeSelector";

// Provider configuration
const PROVIDER_PRIORITY = ["lush", "flow", "sonata", "zen", "breeze", "nova"];

// Helper to detect provider from stream data
const detectProvider = (st) => {
  const rawProvider = (st.provider || "").toLowerCase();
  const rawName = (st.name || st.title || "").toLowerCase();

  const providers = [
    { key: "lush", matches: ["lush", "atlas"] },
    { key: "flow", matches: ["flow"] },
    { key: "sonata", matches: ["sonata"] },
    { key: "breeze", matches: ["breeze"] },
    { key: "nova", matches: ["nova"] },
    { key: "zen", matches: ["zen"] },
    { key: "neko", matches: ["neko"] },
  ];

  for (const provider of providers) {
    if (provider.matches.some(m => rawProvider.includes(m) || rawName.includes(m))) {
      return provider.key;
    }
  }

  return "unknown";
};

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
  seasons = null, // Add seasons prop for episode navigation
  selectedSeason = 0,
  selectedEpisode = 0,
  onSeasonChange = null,
  onEpisodeChange = null,
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
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState("auto");
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState(null);

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
          .map((st, i) => ({
            id: i + 1,
            name: st.name || st.title || `Server ${i + 1}`,
            url: st.url || st.file || st.src || "",
            provider: detectProvider(st),
            quality: st.quality || "auto",
          }))
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
          if (stored && stored.position > 0 && 
              isFinite(video.duration) && 
              !isCompletedPosition(stored.position, video.duration)) {
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
        case "c":
        case "C":
          e.preventDefault();
          toggleSubtitles();
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

  // New control functions
  const handleSpeedChange = (speed) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const handleQualityChange = (quality) => {
    setCurrentQuality(quality);
    // Quality change would require re-loading the stream with the appropriate quality
    // For now, we just update the state
  };

  const handleSubtitleChange = (subtitle) => {
    setCurrentSubtitle(subtitle);
    const video = videoRef.current;
    if (!video) return;

    // Disable all text tracks
    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode = "hidden";
    }

    // Enable selected subtitle if any
    if (subtitle) {
      for (let i = 0; i < video.textTracks.length; i++) {
        if (video.textTracks[i].language === subtitle.language || 
            video.textTracks[i].label === subtitle.label) {
          video.textTracks[i].mode = "showing";
          break;
        }
      }
    }
  };

  const toggleSubtitles = () => {
    if (currentSubtitle === null && subtitles.length > 0) {
      handleSubtitleChange(subtitles[0]);
    } else {
      handleSubtitleChange(null);
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);
    }
  };

  const handleNextEpisode = () => {
    if (!seasons || !onEpisodeChange || !onSeasonChange) return;

    const currentSeasonEpisodes = seasons[selectedSeason]?.episodes || [];
    
    if (selectedEpisode < currentSeasonEpisodes.length - 1) {
      // Move to next episode in same season
      onEpisodeChange(selectedEpisode + 1);
    } else if (selectedSeason < seasons.length - 1) {
      // Move to first episode of next season
      onSeasonChange(selectedSeason + 1);
      onEpisodeChange(0);
    }
  };

  const handlePreviousEpisode = () => {
    if (!seasons || !onEpisodeChange || !onSeasonChange) return;

    if (selectedEpisode > 0) {
      // Move to previous episode in same season
      onEpisodeChange(selectedEpisode - 1);
    } else if (selectedSeason > 0) {
      // Move to last episode of previous season
      const prevSeasonEpisodes = seasons[selectedSeason - 1]?.episodes || [];
      onSeasonChange(selectedSeason - 1);
      onEpisodeChange(Math.max(0, prevSeasonEpisodes.length - 1));
    }
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
      <TopBar
        title={title}
        onBack={onBack}
        showControls={showControls}
        onInfo={null} // Can be implemented later
        onBookmark={null} // Can be implemented later
      />

      {/* Bottom control bar */}
      <PlayerControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        showControls={showControls}
        onPlayPause={togglePlay}
        onProgressClick={handleProgressClick}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
        onToggleFullscreen={toggleFullscreen}
        onTogglePictureInPicture={togglePictureInPicture}
        formatTime={formatTime}
      >
        {/* Additional controls */}
        {servers.length > 1 && (
          <button
            onClick={switchServer}
            className="text-white text-sm hover:text-gray-300 transition-colors duration-200 px-3 py-1.5 bg-white/10 rounded"
            title="Switch server"
          >
            Server {activeServer + 1}/{servers.length}
          </button>
        )}

        {/* Episode selector for series */}
        {seasons && seasons.length > 0 && (
          <EpisodeSelector
            seasons={seasons}
            selectedSeason={selectedSeason}
            selectedEpisode={selectedEpisode}
            onSeasonChange={onSeasonChange}
            onEpisodeChange={onEpisodeChange}
            onNext={handleNextEpisode}
            onPrevious={handlePreviousEpisode}
            showControls={showControls}
          />
        )}

        <SpeedSelector
          currentSpeed={playbackSpeed}
          onSpeedChange={handleSpeedChange}
          showControls={showControls}
        />

        {qualities.length > 0 && (
          <QualitySelector
            qualities={qualities}
            currentQuality={currentQuality}
            onQualityChange={handleQualityChange}
            showControls={showControls}
          />
        )}

        <SettingsMenu
          subtitles={subtitles}
          currentSubtitle={currentSubtitle}
          onSubtitleChange={handleSubtitleChange}
          showControls={showControls}
        />
      </PlayerControls>
    </div>
  );
}

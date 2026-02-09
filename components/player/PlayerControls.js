"use client";

/**
 * PlayerControls - Bottom control bar for P-Stream player
 * Includes play/pause, progress bar, volume, time display, and additional controls
 */
export default function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  showControls,
  onPlayPause,
  onProgressClick,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onTogglePictureInPicture,
  formatTime,
  children, // For additional controls like quality, speed, etc.
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm p-4 transition-opacity duration-300 z-10 ${
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Progress bar */}
      <div
        className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-4 hover:h-2 transition-all duration-150 group relative"
        onClick={onProgressClick}
      >
        <div
          className="h-full bg-red-600 rounded-full relative transition-all duration-150"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <button
          onClick={onPlayPause}
          className="text-white hover:text-gray-300 transition-colors duration-200 flex-shrink-0"
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
        <span className="text-white text-sm font-medium select-none flex-shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex-1"></div>

        {/* Additional controls (quality, speed, episode selector, etc.) */}
        {children}

        {/* Volume control */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onToggleMute}
            className="text-white hover:text-gray-300 transition-colors duration-200"
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
            onChange={onVolumeChange}
            className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, white ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%)`,
            }}
          />
        </div>

        {/* Picture-in-Picture */}
        {onTogglePictureInPicture && (
          <button
            onClick={onTogglePictureInPicture}
            className="text-white hover:text-gray-300 transition-colors duration-200 flex-shrink-0"
            title="Picture in Picture"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4v16h10V4H7zm4 12H9v-3h2v3zm4 0h-2v-3h2v3z"
              />
              <rect x="14" y="14" width="6" height="4" strokeWidth={2} />
            </svg>
          </button>
        )}

        {/* Fullscreen button */}
        <button
          onClick={onToggleFullscreen}
          className="text-white hover:text-gray-300 transition-colors duration-200 flex-shrink-0"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

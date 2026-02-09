"use client";

/**
 * TopBar - Top control bar for P-Stream player
 * Displays back button, title, episode info, info button, bookmark button
 */
export default function TopBar({
  title,
  onBack,
  showControls,
  onInfo,
  onBookmark,
}) {
  return (
    <div
      className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-sm p-4 transition-opacity duration-300 z-10 ${
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="text-white hover:text-gray-300 transition-colors duration-200 flex-shrink-0"
          title="Back"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Title */}
        <h1 className="text-white text-lg font-medium truncate flex-1 select-none">
          {title}
        </h1>

        {/* Info button */}
        {onInfo && (
          <button
            onClick={onInfo}
            className="text-white hover:text-gray-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10 flex-shrink-0"
            title="Info"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        )}

        {/* Bookmark button */}
        {onBookmark && (
          <button
            onClick={onBookmark}
            className="text-white hover:text-gray-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10 flex-shrink-0"
            title="Bookmark"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

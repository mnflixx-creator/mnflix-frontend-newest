"use client";

import styles from "./styles/player.module.css";

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
      className={`${styles.topBar} ${!showControls ? styles.hidden : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className={styles.backButton}
        title="Back"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Title */}
      <h1 className={styles.title}>
        {title}
      </h1>

      {/* Info button */}
      {onInfo && (
        <button
          onClick={onInfo}
          className={styles.iconButton}
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
          className={styles.iconButton}
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
  );
}

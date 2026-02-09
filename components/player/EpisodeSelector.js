"use client";

import { useState } from "react";
import styles from "./styles/player.module.css";

/**
 * EpisodeSelector - Episode navigation for series
 * Displays season and episode dropdowns, next/prev buttons
 */
export default function EpisodeSelector({
  seasons,
  selectedSeason,
  selectedEpisode,
  onSeasonChange,
  onEpisodeChange,
  onNext,
  onPrevious,
}) {
  const [showSeasonMenu, setShowSeasonMenu] = useState(false);
  const [showEpisodeMenu, setShowEpisodeMenu] = useState(false);

  if (!seasons || seasons.length === 0) return null;

  const currentSeason = seasons[selectedSeason];
  const episodes = currentSeason?.episodes || [];
  const hasNextEpisode = selectedEpisode < episodes.length - 1 || selectedSeason < seasons.length - 1;
  const hasPreviousEpisode = selectedEpisode > 0 || selectedSeason > 0;

  return (
    <div className={styles.controlsRowCompact}>
      {/* Previous episode button */}
      {hasPreviousEpisode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious?.();
          }}
          className={styles.button}
          title="Previous episode"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>
      )}

      {/* Season selector */}
      <div className={styles.dropdownContainer}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSeasonMenu(!showSeasonMenu);
            setShowEpisodeMenu(false);
          }}
          className={styles.dropdownButton}
        >
          S{currentSeason?.seasonNumber || selectedSeason + 1}
        </button>

        {showSeasonMenu && (
          <div
            className={styles.dropdownMenu}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.dropdownHeader}>
              Season
            </div>
            {seasons.map((season, index) => (
              <button
                key={index}
                onClick={() => {
                  onSeasonChange(index);
                  setShowSeasonMenu(false);
                }}
                className={`${styles.dropdownItem} ${index === selectedSeason ? styles.active : ""}`}
              >
                Season {season.seasonNumber || index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Episode selector */}
      <div className={styles.dropdownContainer}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowEpisodeMenu(!showEpisodeMenu);
            setShowSeasonMenu(false);
          }}
          className={styles.dropdownButton}
        >
          E{episodes[selectedEpisode]?.episodeNumber || selectedEpisode + 1}
        </button>

        {showEpisodeMenu && (
          <div
            className={styles.dropdownMenu}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.dropdownHeader}>
              Episodes
            </div>
            {episodes.map((episode, index) => (
              <button
                key={index}
                onClick={() => {
                  onEpisodeChange(index);
                  setShowEpisodeMenu(false);
                }}
                className={`${styles.dropdownItem} ${index === selectedEpisode ? styles.active : ""}`}
              >
                <div className={styles.episodeItem}>
                  <div className={styles.episodeTitle}>
                    Episode {episode.episodeNumber || index + 1}
                  </div>
                  {episode.title && (
                    <div className={styles.episodeSubtitle}>{episode.title}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Next episode button */}
      {hasNextEpisode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          className={styles.button}
          title="Next episode"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      )}
    </div>
  );
}

"use client";

import { useState, useRef } from "react";

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
  showControls,
}) {
  const [showSeasonMenu, setShowSeasonMenu] = useState(false);
  const [showEpisodeMenu, setShowEpisodeMenu] = useState(false);

  if (!seasons || seasons.length === 0) return null;

  const currentSeason = seasons[selectedSeason];
  const episodes = currentSeason?.episodes || [];
  const hasNextEpisode = selectedEpisode < episodes.length - 1 || selectedSeason < seasons.length - 1;
  const hasPreviousEpisode = selectedEpisode > 0 || selectedSeason > 0;

  return (
    <div className="flex items-center gap-2">
      {/* Previous episode button */}
      {hasPreviousEpisode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious?.();
          }}
          className="text-white hover:text-gray-300 transition-colors duration-200 p-2 rounded hover:bg-white/10"
          title="Previous episode"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>
      )}

      {/* Season selector */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSeasonMenu(!showSeasonMenu);
            setShowEpisodeMenu(false);
          }}
          className="text-white hover:text-gray-300 transition-colors duration-200 px-3 py-1.5 rounded hover:bg-white/10 text-sm font-medium"
        >
          S{currentSeason?.seasonNumber || selectedSeason + 1}
        </button>

        {showSeasonMenu && (
          <div
            className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg shadow-xl py-2 min-w-[140px] max-h-[300px] overflow-y-auto border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1 text-gray-400 text-xs font-semibold uppercase">
              Season
            </div>
            {seasons.map((season, index) => (
              <button
                key={index}
                onClick={() => {
                  onSeasonChange(index);
                  setShowSeasonMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                  index === selectedSeason
                    ? "text-white bg-white/20 font-medium"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                Season {season.seasonNumber || index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Episode selector */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowEpisodeMenu(!showEpisodeMenu);
            setShowSeasonMenu(false);
          }}
          className="text-white hover:text-gray-300 transition-colors duration-200 px-3 py-1.5 rounded hover:bg-white/10 text-sm font-medium"
        >
          E{episodes[selectedEpisode]?.episodeNumber || selectedEpisode + 1}
        </button>

        {showEpisodeMenu && (
          <div
            className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg shadow-xl py-2 min-w-[200px] max-h-[400px] overflow-y-auto border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1 text-gray-400 text-xs font-semibold uppercase">
              Episodes
            </div>
            {episodes.map((episode, index) => (
              <button
                key={index}
                onClick={() => {
                  onEpisodeChange(index);
                  setShowEpisodeMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                  index === selectedEpisode
                    ? "text-white bg-white/20 font-medium"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="font-medium">
                  Episode {episode.episodeNumber || index + 1}
                </div>
                {episode.title && (
                  <div className="text-xs text-gray-400 truncate">{episode.title}</div>
                )}
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
          className="text-white hover:text-gray-300 transition-colors duration-200 p-2 rounded hover:bg-white/10"
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

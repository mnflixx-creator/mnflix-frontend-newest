"use client";

import { useState } from "react";
import styles from "./styles/player.module.css";

/**
 * SettingsMenu - Settings menu for captions/subtitles
 */
export default function SettingsMenu({
  subtitles,
  currentSubtitle,
  onSubtitleChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubtitleClick = (subtitle) => {
    onSubtitleChange(subtitle);
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownContainer}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={styles.button}
        title="Captions"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={styles.dropdownMenu}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.dropdownHeader}>
            Subtitles
          </div>
          
          {/* Off option */}
          <button
            onClick={() => handleSubtitleClick(null)}
            className={`${styles.dropdownItem} ${currentSubtitle === null ? styles.active : ""}`}
          >
            Off
          </button>

          {/* Subtitle tracks */}
          {subtitles && subtitles.length > 0 && subtitles.map((subtitle, index) => (
            <button
              key={index}
              onClick={() => handleSubtitleClick(subtitle)}
              className={`${styles.dropdownItem} ${currentSubtitle?.url === subtitle.url ? styles.active : ""}`}
            >
              {subtitle.label || subtitle.language || `Track ${index + 1}`}
            </button>
          ))}

          {(!subtitles || subtitles.length === 0) && (
            <div className={styles.dropdownItem} style={{ cursor: 'default', color: 'var(--player-disabled)' }}>
              No subtitles available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

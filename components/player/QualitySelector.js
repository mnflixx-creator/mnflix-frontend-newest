"use client";

import { useState } from "react";
import styles from "./styles/player.module.css";

/**
 * QualitySelector - Quality selection dropdown for video playback
 */
export default function QualitySelector({ qualities, currentQuality, onQualityChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleQualityClick = (quality) => {
    onQualityChange(quality);
    setIsOpen(false);
  };

  if (!qualities || qualities.length === 0) return null;

  return (
    <div className={styles.dropdownContainer}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={styles.dropdownButton}
        title="Quality"
      >
        {currentQuality || "Auto"}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={styles.dropdownMenu}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.dropdownHeader}>
            Quality
          </div>
          {qualities.map((quality, index) => (
            <button
              key={index}
              onClick={() => handleQualityClick(quality)}
              className={`${styles.dropdownItem} ${quality === currentQuality ? styles.active : ""}`}
            >
              {quality}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

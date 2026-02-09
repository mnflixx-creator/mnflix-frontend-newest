"use client";

import { useState } from "react";
import styles from "./styles/player.module.css";

/**
 * SpeedSelector - Playback speed selector for video playback
 * Supports 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x speeds
 */
export default function SpeedSelector({ currentSpeed, onSpeedChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleSpeedClick = (speed) => {
    onSpeedChange(speed);
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownContainer}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={styles.dropdownButton}
        title="Playback speed"
      >
        {currentSpeed}x
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={styles.dropdownMenu}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.dropdownHeader}>
            Speed
          </div>
          {speeds.map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedClick(speed)}
              className={`${styles.dropdownItem} ${speed === currentSpeed ? styles.active : ""}`}
            >
              {speed === 1 ? "Normal" : `${speed}x`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

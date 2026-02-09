"use client";

import { useState, useRef } from "react";
import styles from "./styles/player.module.css";

/**
 * ProgressBar - Enhanced progress bar with exact P-Stream styling
 * Features: Click to seek, hover tooltip, buffered progress, smooth scrubbing
 */
export default function ProgressBar({
  currentTime,
  duration,
  bufferedTime = 0,
  onSeek,
  formatTime,
}) {
  const [hovering, setHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);
  const progressBarRef = useRef(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const buffered = duration > 0 ? (bufferedTime / duration) * 100 : 0;

  const handleMouseMove = (e) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * duration;

    setHoverPosition(percent * 100);
    setHoverTime(time);
  };

  const handleClick = (e) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * duration;

    onSeek(time);
  };

  return (
    <div
      ref={progressBarRef}
      className={styles.progressBarContainer}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Buffered progress */}
      <div
        className={styles.progressBuffered}
        style={{ width: `${buffered}%` }}
      />

      {/* Current progress */}
      <div className={styles.progressFill} style={{ width: `${progress}%` }}>
        {/* Handle */}
        <div className={styles.progressHandle} />
      </div>

      {/* Hover tooltip */}
      {hovering && (
        <div
          className={styles.progressTooltip}
          style={{ left: `${hoverPosition}%` }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
}

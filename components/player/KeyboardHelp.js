"use client";

import styles from "./styles/player.module.css";

/**
 * KeyboardHelp - Keyboard shortcuts overlay
 * Shows keyboard shortcuts when user presses '?' key
 */
export default function KeyboardHelp({ isVisible, onClose }) {
  if (!isVisible) return null;

  const shortcuts = [
    { key: "SPACE", description: "Play / Pause" },
    { key: "F", description: "Fullscreen" },
    { key: "M", description: "Toggle Mute" },
    { key: "C", description: "Toggle Captions" },
    { key: "→", description: "Seek +10s" },
    { key: "←", description: "Seek -10s" },
    { key: "↑", description: "Volume +10%" },
    { key: "↓", description: "Volume -10%" },
    { key: "?", description: "Show this help" },
  ];

  return (
    <div
      className={`${styles.keyboardOverlay} ${isVisible ? styles.visible : ""}`}
      onClick={onClose}
    >
      <div
        className={styles.keyboardContent}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.keyboardTitle}>Keyboard Shortcuts</h2>
        <div className={styles.keyboardList}>
          {shortcuts.map(({ key, description }) => (
            <div key={key} className={styles.keyboardItem}>
              <div className={styles.keyboardKey}>{key}</div>
              <div className={styles.keyboardDesc}>{description}</div>
            </div>
          ))}
        </div>
        <button className={styles.keyboardClose} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

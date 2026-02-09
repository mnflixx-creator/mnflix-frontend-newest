"use client";

import { useState, useRef } from "react";

/**
 * SpeedSelector - Playback speed selector for video playback
 * Supports 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x speeds
 */
export default function SpeedSelector({ currentSpeed, onSpeedChange, showControls }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleSpeedClick = (speed) => {
    onSpeedChange(speed);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-white hover:text-gray-300 transition-colors duration-200 px-3 py-1.5 rounded hover:bg-white/10 text-sm font-medium"
        title="Playback speed"
      >
        {currentSpeed}x
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg shadow-xl py-2 min-w-[120px] border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-gray-400 text-xs font-semibold uppercase">
            Speed
          </div>
          {speeds.map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedClick(speed)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                speed === currentSpeed
                  ? "text-white bg-white/20 font-medium"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {speed === 1 ? "Normal" : `${speed}x`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

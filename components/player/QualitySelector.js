"use client";

import { useState, useRef } from "react";

/**
 * QualitySelector - Quality selection dropdown for video playback
 */
export default function QualitySelector({ qualities, currentQuality, onQualityChange, showControls }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleQualityClick = (quality) => {
    onQualityChange(quality);
    setIsOpen(false);
  };

  if (!qualities || qualities.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-white hover:text-gray-300 transition-colors duration-200 px-3 py-1.5 rounded hover:bg-white/10 text-sm font-medium"
        title="Quality"
      >
        {currentQuality || "Auto"}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg shadow-xl py-2 min-w-[120px] border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-gray-400 text-xs font-semibold uppercase">
            Quality
          </div>
          {qualities.map((quality, index) => (
            <button
              key={index}
              onClick={() => handleQualityClick(quality)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                quality === currentQuality
                  ? "text-white bg-white/20 font-medium"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {quality}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

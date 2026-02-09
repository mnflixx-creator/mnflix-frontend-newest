"use client";

import { useState, useRef } from "react";

/**
 * SettingsMenu - Settings menu for captions/subtitles
 */
export default function SettingsMenu({
  subtitles,
  currentSubtitle,
  onSubtitleChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleSubtitleClick = (subtitle) => {
    onSubtitleChange(subtitle);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-white hover:text-gray-300 transition-colors duration-200 p-2 rounded hover:bg-white/10"
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
          className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg shadow-xl py-2 min-w-[180px] max-h-[300px] overflow-y-auto border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-gray-400 text-xs font-semibold uppercase">
            Subtitles
          </div>
          
          {/* Off option */}
          <button
            onClick={() => handleSubtitleClick(null)}
            className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
              currentSubtitle === null
                ? "text-white bg-white/20 font-medium"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            Off
          </button>

          {/* Subtitle tracks */}
          {subtitles && subtitles.length > 0 && subtitles.map((subtitle, index) => (
            <button
              key={index}
              onClick={() => handleSubtitleClick(subtitle)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                currentSubtitle?.url === subtitle.url
                  ? "text-white bg-white/20 font-medium"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {subtitle.label || subtitle.language || `Track ${index + 1}`}
            </button>
          ))}

          {(!subtitles || subtitles.length === 0) && (
            <div className="px-4 py-2 text-sm text-gray-500">
              No subtitles available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

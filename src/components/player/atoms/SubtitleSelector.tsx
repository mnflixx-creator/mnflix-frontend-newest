/**
 * Subtitle Selector Component
 */

import { Subtitle } from '../../../types/player'

interface SubtitleSelectorProps {
  subtitles: Subtitle[]
  currentSubtitle: Subtitle | null
  onSubtitleChange: (subtitle: Subtitle | null) => void
  className?: string
}

export function SubtitleSelector({
  subtitles,
  currentSubtitle,
  onSubtitleChange,
  className = '',
}: SubtitleSelectorProps) {
  if (subtitles.length === 0) {
    return null
  }

  return (
    <div className={`relative group ${className}`}>
      <button
        className="p-2 hover:bg-white/10 rounded-full transition"
        aria-label="Subtitles"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z" />
        </svg>
      </button>
      
      <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[150px] max-h-[300px] overflow-y-auto">
        <button
          onClick={() => onSubtitleChange(null)}
          className={`w-full px-4 py-2 text-left hover:bg-white/10 transition first:rounded-t-lg ${
            !currentSubtitle ? 'bg-mnflix_light_blue text-white' : ''
          }`}
        >
          Off
        </button>
        
        {subtitles.map((subtitle, index) => (
          <button
            key={index}
            onClick={() => onSubtitleChange(subtitle)}
            className={`w-full px-4 py-2 text-left hover:bg-white/10 transition last:rounded-b-lg ${
              currentSubtitle?.url === subtitle.url ? 'bg-mnflix_light_blue text-white' : ''
            }`}
          >
            {subtitle.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Quality Selector Component
 */

interface QualitySelectorProps {
  qualities: string[]
  currentQuality: string
  onQualityChange: (quality: string) => void
  className?: string
}

export function QualitySelector({
  qualities,
  currentQuality,
  onQualityChange,
  className = '',
}: QualitySelectorProps) {
  return (
    <div className={`relative group ${className}`}>
      <button
        className="p-2 hover:bg-white/10 rounded-full transition flex items-center gap-1"
        aria-label="Quality settings"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
        </svg>
        <span className="text-sm font-medium">{currentQuality === 'auto' ? 'Auto' : currentQuality}</span>
      </button>
      
      <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[120px]">
        {qualities.map((quality) => (
          <button
            key={quality}
            onClick={() => onQualityChange(quality)}
            className={`w-full px-4 py-2 text-left hover:bg-white/10 transition first:rounded-t-lg last:rounded-b-lg ${
              quality === currentQuality ? 'bg-mnflix_light_blue text-white' : ''
            }`}
          >
            {quality === 'auto' ? 'Auto' : quality}
          </button>
        ))}
      </div>
    </div>
  )
}

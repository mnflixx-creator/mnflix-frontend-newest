/**
 * Play/Pause Button Component
 */

interface PlayButtonProps {
  isPlaying: boolean
  onClick: () => void
  className?: string
}

export function PlayButton({ isPlaying, onClick, className = '' }: PlayButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 hover:bg-white/10 rounded-full transition ${className}`}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      ) : (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  )
}

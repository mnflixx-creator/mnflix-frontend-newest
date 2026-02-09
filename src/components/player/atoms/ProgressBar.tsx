/**
 * Progress Bar Component
 */

import { formatTime } from '../utils/formatTime'

interface ProgressBarProps {
  currentTime: number
  duration: number
  buffered: number
  onSeek: (time: number) => void
  className?: string
}

export function ProgressBar({
  currentTime,
  duration,
  buffered,
  onSeek,
  className = '',
}: ProgressBarProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    onSeek(newTime)
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm font-medium min-w-[45px]">
        {formatTime(currentTime)}
      </span>
      
      <div
        className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer group relative"
        onClick={handleClick}
      >
        {/* Buffered progress */}
        <div
          className="absolute h-full bg-gray-500 rounded-full transition-all"
          style={{ width: `${bufferedProgress}%` }}
        />
        
        {/* Current progress */}
        <div
          className="absolute h-full bg-mnflix_light_blue rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
        
        {/* Hover effect */}
        <div className="absolute inset-0 h-full bg-white/0 group-hover:h-2 group-hover:-translate-y-[2px] transition-all rounded-full" />
        
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      
      <span className="text-sm font-medium min-w-[45px]">
        {formatTime(duration)}
      </span>
    </div>
  )
}

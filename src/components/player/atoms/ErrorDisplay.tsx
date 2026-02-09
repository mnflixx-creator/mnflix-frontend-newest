/**
 * Error Display Component
 */

interface ErrorDisplayProps {
  message: string
  onRetry?: () => void
  onBack?: () => void
  className?: string
}

export function ErrorDisplay({
  message,
  onRetry,
  onBack,
  className = '',
}: ErrorDisplayProps) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-black ${className}`}>
      <div className="text-center max-w-md px-4">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-red-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        
        <h2 className="text-white text-2xl font-bold mb-2">Error</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-mnflix_light_blue text-white rounded hover:bg-opacity-90 transition"
            >
              Try Again
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

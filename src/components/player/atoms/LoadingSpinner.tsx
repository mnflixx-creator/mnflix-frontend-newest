/**
 * Loading Spinner Component
 */

export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-black/50 ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  )
}

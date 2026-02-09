/**
 * Settings Menu Component
 */

interface SettingsMenuProps {
  isOpen: boolean
  playbackSpeed: number
  onPlaybackSpeedChange: (speed: number) => void
  onClose: () => void
  className?: string
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function SettingsMenu({
  isOpen,
  playbackSpeed,
  onPlaybackSpeedChange,
  onClose,
  className = '',
}: SettingsMenuProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className={`absolute bottom-20 right-4 bg-gray-900 rounded-lg shadow-xl z-50 min-w-[250px] ${className}`}>
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">Settings</h3>
        </div>
        
        <div className="p-4">
          <h4 className="text-gray-400 text-sm mb-2">Playback Speed</h4>
          <div className="space-y-1">
            {PLAYBACK_SPEEDS.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  onPlaybackSpeedChange(speed)
                  onClose()
                }}
                className={`w-full px-3 py-2 text-left rounded hover:bg-white/10 transition ${
                  speed === playbackSpeed ? 'bg-mnflix_light_blue text-white' : 'text-gray-300'
                }`}
              >
                {speed === 1 ? 'Normal' : `${speed}x`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

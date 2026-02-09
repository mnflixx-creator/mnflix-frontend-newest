# P-Stream Player Component

Complete video player implementation for the MNFLIX frontend with HLS streaming, quality selection, subtitles, and progress tracking.

## Features

### Core Playback
- ✅ HLS.js streaming support with automatic fallback
- ✅ Native video player for MP4 and other formats
- ✅ Auto-detection of stream type (HLS vs MP4)
- ✅ Error recovery and retry logic
- ✅ Adaptive bitrate streaming

### Player Controls
- ✅ Play/Pause toggle
- ✅ Seek bar with buffering indicator
- ✅ Volume control with mute toggle
- ✅ Quality selection (auto, 1080p, 720p, 480p, 360p)
- ✅ Playback speed (0.25x to 2x)
- ✅ Fullscreen mode
- ✅ Settings menu

### Subtitles & Captions
- ✅ VTT subtitle format support
- ✅ Multiple language support
- ✅ Subtitle selector dropdown
- ✅ Proper rendering inside video element

### Advanced Features
- ✅ Watch progress tracking (saves every 10 seconds)
- ✅ Resume from last watched position
- ✅ Keyboard shortcuts
- ✅ Auto-hide controls after 3 seconds
- ✅ Buffering indicator
- ✅ Responsive design

### State Management
- ✅ Zustand store with slices:
  - Interface (UI state, fullscreen, controls visibility)
  - Source (media info, streams, quality, subtitles)
  - Progress (playback state, time, volume, speed)
  - Caption (subtitle state and styling)

## Usage

```tsx
import { PlayerComponent } from '@/components/player'

function VideoPage() {
  return (
    <PlayerComponent
      movieId="12345"
      title="Movie Title"
      onBack={() => navigate(-1)}
    />
  )
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` or `K` | Play/Pause |
| `F` | Toggle fullscreen |
| `M` | Toggle mute |
| `←` | Seek backward 5s |
| `→` | Seek forward 5s |
| `↑` | Volume up |
| `↓` | Volume down |
| `0-9` | Seek to 0%-90% |

## Architecture

```
src/components/player/
├── Player.tsx                 # Main player component
├── index.ts                   # Exports
├── atoms/                     # UI components
│   ├── PlayButton.tsx
│   ├── ProgressBar.tsx
│   ├── VolumeControl.tsx
│   ├── QualitySelector.tsx
│   ├── SubtitleSelector.tsx
│   ├── FullscreenButton.tsx
│   ├── SettingsMenu.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorDisplay.tsx
├── display/                   # Video player implementations
│   ├── HLSPlayer.tsx         # HLS.js integration
│   ├── VideoPlayer.tsx       # Native HTML5 player
│   ├── PlayerDisplay.tsx     # Player factory
│   └── index.ts
├── hooks/                     # Custom React hooks
│   ├── useKeyboard.ts
│   ├── useVideoEvents.ts
│   ├── useFullscreen.ts
│   └── useProgressTracking.ts
└── utils/                     # Utility functions
    ├── formatTime.ts
    └── keyboard.ts

src/stores/player/
├── store.ts                   # Main Zustand store
├── slices/                    # State slices
│   ├── interface.ts
│   ├── source.ts
│   ├── progress.ts
│   └── caption.ts
```

## API Integration

The player integrates with the Zenflify backend:

### Get Streaming Sources
```typescript
// Movie streams
const data = await getZenflifyMovieStreams(tmdbId, title)

// Series streams
const data = await getZenflifySeriesStreams(tmdbId, season, episode, title)

// Anime streams
const data = await getZenflifyAnimeStreams(tmdbId, season, episode, title)
```

### Progress Tracking
```typescript
// Save progress
await saveWatchProgress(movieId, currentTime, duration)

// Get progress
const progress = await getWatchProgress(movieId)
```

### Subtitles
```typescript
// Get subtitles
const subtitles = await getSubtitles(movieId)
```

## Store Usage

```typescript
import { usePlayerStore } from '@/stores/player/store'

function MyComponent() {
  const {
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    setVolume
  } = usePlayerStore()
  
  // Use the player state and actions
}
```

## Styling

The player uses Tailwind CSS for styling and follows the MNFLIX design language:
- Dark theme (black background)
- Light blue accent color (`mnflix_light_blue`)
- Smooth animations and transitions
- Responsive layout
- Controls appear on hover/tap

## Environment Configuration

Required environment variables (in `.env`):

```env
VITE_API_URL=http://localhost:4000
VITE_OMDB_API_KEY=your_api_key
VITE_PROVIDER_URL=http://localhost:3001
```

## Browser Support

- Modern browsers with ES6+ support
- HLS.js works in all browsers except Safari (which has native HLS support)
- Fullscreen API support required for fullscreen mode
- WebVTT subtitle support

## Future Enhancements

Potential improvements for future development:
- Picture-in-picture mode
- Chromecast support
- Download for offline viewing
- Playlist support
- Episode navigation for series
- Thumbnail previews on seek bar
- Skip intro/outro buttons
- Multiple audio tracks
- Advanced statistics display

## Testing

To test the player:
1. Build the project: `npm run build`
2. Run dev server: `npm run dev`
3. Navigate to `/play/:id` route
4. Test with various video sources (HLS, MP4)
5. Test keyboard shortcuts
6. Test responsive design on different screen sizes
7. Test subtitle display
8. Test quality switching
9. Verify progress tracking works

## Troubleshooting

### Video won't play
- Check that streaming URL is accessible
- Verify HLS.js is loaded correctly
- Check browser console for errors
- Try a different quality/source

### Subtitles not showing
- Verify subtitle URL is accessible
- Check that subtitle format is VTT
- Ensure subtitle is selected in the dropdown
- Check browser console for CORS errors

### Progress not saving
- Check API endpoint is accessible
- Verify authentication token is valid
- Check network tab for API errors
- Progress saving failures won't break playback

## License

Part of the MNFLIX frontend project.
